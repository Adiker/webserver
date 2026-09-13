import ipaddress
import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch


sys.path.insert(0, str(Path(__file__).parent))
import muse_status


STARTED_AT = "2026-09-13T10:52:12.960900197Z"
GATEWAY_IP = "162.159.130.234"


def proc_ipv4(value: str) -> str:
    return bytes(reversed(ipaddress.IPv4Address(value).packed)).hex().upper()


def tcp_table(remote_ip: str = GATEWAY_IP, remote_port: int = 443, state: str = "01") -> str:
    remote = f"{proc_ipv4(remote_ip)}:{remote_port:04X}"
    return (
        "  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode\n"
        f"   0: 050013AC:B2BA {remote} {state} 00000000:00000000 00:00000000 00000000     0        0 29451 1\n"
    )


class FakeDocker:
    def __init__(self, running=True, ready=True):
        self.running = running
        self.ready = ready
        self.started_at = STARTED_AT
        self.log_calls = 0

    def running_container(self, _project, _service):
        if not self.running:
            raise muse_status.ProbeError("not running")
        return "container-id"

    def state(self, _container_id):
        return {"Running": self.running, "Pid": 123, "StartedAt": self.started_at}

    def logs_since(self, _container_id, _started_at):
        self.log_calls += 1
        return b"Ready!" if self.ready else b"connecting to Discord"


class MuseStatusTests(unittest.TestCase):
    def test_probe_reports_stopped_container_offline(self):
        docker = FakeDocker()
        probe = muse_status.MuseProbe(
            docker,
            muse_status.ProbeConfig(),
            resolver=lambda _host: {GATEWAY_IP},
        )
        with patch.object(docker, "state", return_value={"Running": False, "Pid": 0, "StartedAt": STARTED_AT}):
            self.assertFalse(probe.check(now=100))

    def test_gateway_socket_matching_discord_address(self):
        tables = {"tcp": tcp_table(), "tcp6": tcp_table(remote_ip="192.0.2.10")}
        result = muse_status.has_gateway_connection(
            123,
            {GATEWAY_IP},
            reader=lambda path: tables[path.name],
        )
        self.assertTrue(result)

    def test_gateway_socket_missing(self):
        tables = {"tcp": tcp_table(remote_ip="192.0.2.10"), "tcp6": tcp_table(remote_ip="192.0.2.11")}
        result = muse_status.has_gateway_connection(
            123,
            {GATEWAY_IP},
            reader=lambda path: tables[path.name],
        )
        self.assertFalse(result)

    def test_probe_requires_running_ready_container_and_gateway(self):
        docker = FakeDocker()
        probe = muse_status.MuseProbe(
            docker,
            muse_status.ProbeConfig(),
            resolver=lambda _host: {GATEWAY_IP},
        )
        with patch.object(muse_status, "has_gateway_connection", return_value=True):
            self.assertTrue(probe.check(now=100))
        self.assertEqual(docker.log_calls, 1)

        docker.ready = False
        probe = muse_status.MuseProbe(
            docker,
            muse_status.ProbeConfig(),
            resolver=lambda _host: {GATEWAY_IP},
        )
        with patch.object(muse_status, "has_gateway_connection", return_value=True):
            self.assertFalse(probe.check(now=100))

        docker.ready = True
        docker.started_at = "2026-09-13T11:00:00.000000000Z"
        with patch.object(muse_status, "has_gateway_connection", return_value=False):
            self.assertFalse(probe.check(now=101))
        self.assertEqual(docker.log_calls, 3)

    def test_probe_fails_closed_for_dns_and_docker_errors(self):
        probe = muse_status.MuseProbe(
            FakeDocker(),
            muse_status.ProbeConfig(),
            resolver=lambda _host: (_ for _ in ()).throw(muse_status.ProbeError("dns")),
        )
        with patch.object(muse_status, "has_gateway_connection", return_value=True):
            with self.assertRaises(muse_status.ProbeError):
                probe.check(now=100)

        def failed_runner(_argv, _timeout):
            return subprocess.CompletedProcess([], 1, b"", b"error")

        with self.assertRaises(muse_status.ProbeError):
            muse_status.DockerClient(runner=failed_runner).running_container("docker-compose", "muse")

    def test_docker_logs_include_stderr(self):
        def runner(_argv, _timeout):
            return subprocess.CompletedProcess([], 0, b"stdout", b" Ready!")

        logs = muse_status.DockerClient(runner=runner).logs_since("id", STARTED_AT)
        self.assertEqual(logs, b"stdout Ready!")

    def test_status_store_expires(self):
        store = muse_status.StatusStore(max_age=15)
        store.update(True, now=100)
        self.assertTrue(store.online(now=115))
        self.assertFalse(store.online(now=116))

    def test_http_contract(self):
        with tempfile.TemporaryDirectory() as directory:
            socket_path = str(Path(directory) / "status.sock")
            store = muse_status.StatusStore(max_age=15)
            store.update(True)
            server = muse_status.UnixHTTPServer(socket_path, store)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()

            try:
                status, headers, body = self.request(socket_path, b"GET /health?x=1 HTTP/1.1\r\nHost: local\r\n\r\n")
                self.assertEqual(status, 200)
                self.assertEqual(json.loads(body), {"status": "online"})
                self.assertEqual(headers[b"content-type"], b"application/json; charset=utf-8")

                store.update(False)
                status, _headers, body = self.request(socket_path, b"GET /health HTTP/1.1\r\nHost: local\r\n\r\n")
                self.assertEqual(status, 503)
                self.assertEqual(json.loads(body), {"status": "offline"})

                status, _headers, body = self.request(socket_path, b"HEAD /health HTTP/1.1\r\nHost: local\r\n\r\n")
                self.assertEqual(status, 503)
                self.assertEqual(body, b"")

                status, _headers, _body = self.request(socket_path, b"OPTIONS /health HTTP/1.1\r\nHost: local\r\n\r\n")
                self.assertEqual(status, 204)

                status, _headers, body = self.request(socket_path, b"GET / HTTP/1.1\r\nHost: local\r\n\r\n")
                self.assertEqual(status, 404)
                self.assertEqual(json.loads(body), {"status": "not_found"})
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=2)

    @staticmethod
    def request(socket_path: str, request: bytes):
        connection = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        connection.connect(socket_path)
        connection.sendall(request)
        chunks = []
        while True:
            chunk = connection.recv(4096)
            if not chunk:
                break
            chunks.append(chunk)
        connection.close()
        response = b"".join(chunks)
        head, body = response.split(b"\r\n\r\n", 1)
        lines = head.splitlines()
        status = int(lines[0].split()[1])
        headers = {line.split(b": ", 1)[0].lower(): line.split(b": ", 1)[1] for line in lines[1:]}
        return status, headers, body


if __name__ == "__main__":
    unittest.main()
