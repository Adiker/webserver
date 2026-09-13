#!/usr/bin/env python3
"""Expose a small, read-only readiness check for the local Muse container."""

from __future__ import annotations

import http.server
import ipaddress
import json
import logging
import os
from pathlib import Path
import socket
import socketserver
import stat
import subprocess
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urlsplit


READY_MARKER = b"Ready!"
ESTABLISHED = "01"
GATEWAY_PORT = 443
DEFAULT_SOCKET = "/run/muse-status/status.sock"
DEFAULT_PROJECT = "docker-compose"
DEFAULT_SERVICE = "muse"
DEFAULT_GATEWAY = "gateway.discord.gg"
DEFAULT_INTERVAL = 5.0
DEFAULT_MAX_AGE = 15.0
COMMAND_TIMEOUT = 3.0


class ProbeError(RuntimeError):
    """A probe dependency could not be checked safely."""


def _as_bytes(value: bytes | str | None) -> bytes:
    if value is None:
        return b""
    return value if isinstance(value, bytes) else value.encode()


def _run_command(argv: list[str], timeout: float = COMMAND_TIMEOUT) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(argv, check=False, capture_output=True, timeout=timeout)


def _parse_started_at(value: str) -> float:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError as exc:
        raise ProbeError("invalid container start timestamp") from exc


class DockerClient:
    def __init__(self, runner=_run_command, timeout: float = COMMAND_TIMEOUT):
        self._runner = runner
        self._timeout = timeout

    def _call(self, *args: str) -> bytes:
        try:
            result = self._runner(["docker", *args], self._timeout)
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ProbeError("docker command failed") from exc

        if result.returncode != 0:
            raise ProbeError("docker command returned an error")
        return _as_bytes(result.stdout)

    def running_container(self, project: str, service: str) -> str:
        output = self._call(
            "ps",
            "--filter",
            f"label=com.docker.compose.project={project}",
            "--filter",
            f"label=com.docker.compose.service={service}",
            "--format",
            "{{.ID}}",
        )
        container_ids = [line.strip() for line in output.decode(errors="replace").splitlines() if line.strip()]
        if len(container_ids) != 1:
            raise ProbeError("expected exactly one running Muse container")
        return container_ids[0]

    def state(self, container_id: str) -> dict:
        output = self._call("inspect", "--format", "{{json .State}}", container_id)
        try:
            state = json.loads(output.decode())
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ProbeError("invalid Docker state") from exc
        if not isinstance(state, dict):
            raise ProbeError("invalid Docker state shape")
        return state

    def logs_since(self, container_id: str, started_at: str) -> bytes:
        try:
            result = self._runner(
                ["docker", "logs", "--since", started_at, "--tail", "500", container_id],
                self._timeout,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ProbeError("docker logs failed") from exc
        if result.returncode != 0:
            raise ProbeError("docker logs returned an error")
        return _as_bytes(result.stdout) + _as_bytes(result.stderr)


def resolve_gateway(hostname: str) -> set[str]:
    try:
        records = socket.getaddrinfo(hostname, GATEWAY_PORT, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise ProbeError("gateway DNS lookup failed") from exc

    addresses = {str(ipaddress.ip_address(record[4][0].split("%", 1)[0])) for record in records}
    if not addresses:
        raise ProbeError("gateway DNS lookup returned no addresses")
    return addresses


def _decode_proc_address(value: str, ipv6: bool) -> str:
    raw = bytes.fromhex(value)
    if ipv6:
        if len(raw) != 16:
            raise ValueError("invalid IPv6 address")
        raw = b"".join(raw[index:index + 4][::-1] for index in range(0, 16, 4))
        return str(ipaddress.IPv6Address(raw))
    if len(raw) != 4:
        raise ValueError("invalid IPv4 address")
    return str(ipaddress.IPv4Address(raw[::-1]))


def _has_gateway_socket(table: str, gateway_addresses: set[str], ipv6: bool) -> bool:
    for line in table.splitlines()[1:]:
        fields = line.split()
        if len(fields) < 4 or fields[3] != ESTABLISHED:
            continue
        try:
            remote_address, remote_port = fields[2].rsplit(":", 1)
            if int(remote_port, 16) != GATEWAY_PORT:
                continue
            address = _decode_proc_address(remote_address, ipv6)
        except (ValueError, IndexError):
            continue
        if address in gateway_addresses:
            return True
    return False


def has_gateway_connection(pid: int, gateway_addresses: set[str], reader=Path.read_text) -> bool:
    if pid <= 0:
        raise ProbeError("invalid Muse process id")

    tables = []
    for suffix in ("tcp", "tcp6"):
        path = Path(f"/proc/{pid}/net/{suffix}")
        try:
            tables.append((reader(path), suffix == "tcp6"))
        except OSError as exc:
            raise ProbeError("cannot read Muse network namespace") from exc

    return any(_has_gateway_socket(table, gateway_addresses, ipv6) for table, ipv6 in tables)


@dataclass(frozen=True)
class ProbeConfig:
    project: str = DEFAULT_PROJECT
    service: str = DEFAULT_SERVICE
    gateway: str = DEFAULT_GATEWAY


class MuseProbe:
    def __init__(self, docker: DockerClient, config: ProbeConfig, resolver=resolve_gateway):
        self._docker = docker
        self._config = config
        self._resolver = resolver
        self._ready_key: tuple[str, str] | None = None

    def _gateway_ips(self) -> set[str]:
        return set(self._resolver(self._config.gateway))

    def _is_ready(self, container_id: str, started_at: str) -> bool:
        key = (container_id, started_at)
        if self._ready_key == key:
            return True
        logs = self._docker.logs_since(container_id, started_at)
        if READY_MARKER not in logs:
            return False
        self._ready_key = key
        return True

    def check(self, now: float | None = None) -> bool:
        container_id = self._docker.running_container(self._config.project, self._config.service)
        state = self._docker.state(container_id)
        if not state.get("Running"):
            self._ready_key = None
            return False

        started_at = state.get("StartedAt")
        pid = state.get("Pid")
        if not isinstance(started_at, str) or not isinstance(pid, int):
            raise ProbeError("incomplete Docker state")
        _parse_started_at(started_at)

        if not self._is_ready(container_id, started_at):
            return False
        gateway_ips = self._gateway_ips()
        return has_gateway_connection(pid, gateway_ips)


class StatusStore:
    def __init__(self, max_age: float = DEFAULT_MAX_AGE):
        self._max_age = max_age
        self._online = False
        self._checked_at = 0.0
        self._lock = threading.Lock()

    def update(self, online: bool, now: float | None = None) -> None:
        with self._lock:
            self._online = bool(online)
            self._checked_at = time.monotonic() if now is None else now

    def online(self, now: float | None = None) -> bool:
        current = time.monotonic() if now is None else now
        with self._lock:
            return self._online and current - self._checked_at <= self._max_age


class StatusHandler(http.server.BaseHTTPRequestHandler):
    server_version = "muse-status"
    sys_version = ""

    def _respond(self, status: int, payload: bytes = b"", head: bool = False) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if not head and payload:
            self.wfile.write(payload)

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if urlsplit(self.path).path != "/health":
            self._respond(404, b'{"status":"not_found"}\n')
            return
        online = self.server.status_store.online()
        payload = (b'{"status":"online"}\n' if online else b'{"status":"offline"}\n')
        self._respond(200 if online else 503, payload)

    def do_HEAD(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if urlsplit(self.path).path != "/health":
            self._respond(404, b"", head=True)
            return
        self._respond(200 if self.server.status_store.online() else 503, b"", head=True)

    def do_OPTIONS(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if urlsplit(self.path).path == "/health":
            self._respond(204)
            return
        self._respond(404, b'{"status":"not_found"}\n')

    def log_message(self, _format: str, *_args) -> None:
        return


class UnixHTTPServer(socketserver.UnixStreamServer):
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, socket_path: str, status_store: StatusStore):
        self.status_store = status_store
        super().__init__(socket_path, StatusHandler)


def _prepare_socket(socket_path: str) -> None:
    path = Path(socket_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if not stat.S_ISSOCK(path.stat().st_mode):
            raise ProbeError("status socket path is not a socket")
        path.unlink()


def _env_float(name: str, default: float) -> float:
    try:
        value = float(os.environ.get(name, default))
    except ValueError:
        return default
    return value if value > 0 else default


def _run_probe_loop(probe: MuseProbe, store: StatusStore, interval: float, stop: threading.Event) -> None:
    while not stop.is_set():
        try:
            online = probe.check()
        except Exception as exc:  # fail closed; do not expose probe details publicly
            logging.warning("Muse probe unavailable: %s", type(exc).__name__)
            online = False
        store.update(online)
        stop.wait(interval)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    socket_path = os.environ.get("MUSE_STATUS_SOCKET", DEFAULT_SOCKET)
    config = ProbeConfig(
        project=os.environ.get("MUSE_COMPOSE_PROJECT", DEFAULT_PROJECT),
        service=os.environ.get("MUSE_COMPOSE_SERVICE", DEFAULT_SERVICE),
        gateway=os.environ.get("MUSE_GATEWAY_HOST", DEFAULT_GATEWAY),
    )
    interval = _env_float("MUSE_POLL_INTERVAL", DEFAULT_INTERVAL)
    max_age = _env_float("MUSE_STATUS_MAX_AGE", DEFAULT_MAX_AGE)
    store = StatusStore(max_age=max_age)
    probe = MuseProbe(DockerClient(), config)
    _prepare_socket(socket_path)

    try:
        try:
            store.update(probe.check())
        except Exception as exc:
            logging.warning("Muse probe unavailable: %s", type(exc).__name__)
            store.update(False)

        stop = threading.Event()
        thread = threading.Thread(
            target=_run_probe_loop,
            args=(probe, store, interval, stop),
            name="muse-probe",
            daemon=True,
        )
        thread.start()
        with UnixHTTPServer(socket_path, store) as server:
            server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        return
    finally:
        try:
            Path(socket_path).unlink(missing_ok=True)
        except OSError:
            pass


if __name__ == "__main__":
    main()
