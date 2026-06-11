# Claude Project Context - adiker.eu

`AGENTS.md` is canonical. If this file conflicts with `AGENTS.md`, follow
`AGENTS.md`.

## Quick Context / Szybki kontekst

`adiker.eu` is a static personal service hub hosted as plain files. It links to
Jellyfin, FileBrowser Quantum, autobrr, and OpenSpeedTest, and shows live status
polling with latency.

`adiker.eu` to statyczny osobisty hub usług hostowany jako zwykłe pliki. Linkuje
do Jellyfin, FileBrowser Quantum, autobrr i OpenSpeedTest oraz pokazuje statusy
na żywo z opóźnieniami.

## Stack

- HTML: `index.html`
- CSS: `css/styles.css`
- JavaScript: `js/app.js`
- Local assets: `img/`
- Custom domain: `CNAME`
- No framework, no bundler, no package manager, no build step

Run locally:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Claude Notes / Wskazówki dla Claude

- Keep changes small and static-site friendly.
- Do not add dependencies or generated files unless the user explicitly asks.
- When changing services, keep `SERVICES`, `SERVICE_STATE`, dashboard labels,
  service panels, tabs, ARIA labels, and both `STR.en` / `STR.pl` synchronized.
- Keep README in sync with user-visible behavior and service endpoints.
- `localStorage` keys are `adiker.theme` and `adiker.lang`; do not rename them
  without documenting a migration.
- Use `AGENTS.md` for Git workflow, branch naming, commit style, push rules, and
  verification expectations.

- Zmiany trzymaj małe i przyjazne dla statycznej strony.
- Nie dodawaj zależności ani plików generowanych, chyba że użytkownik wyraźnie
  o to poprosi.
- Przy zmianach usług synchronizuj `SERVICES`, `SERVICE_STATE`, etykiety
  dashboardu, panele usług, taby, etykiety ARIA oraz oba słowniki
  `STR.en` / `STR.pl`.
- README utrzymuj zgodnie z zachowaniem widocznym dla użytkownika i endpointami
  usług.
- Klucze `localStorage` to `adiker.theme` i `adiker.lang`; nie zmieniaj ich nazw
  bez opisanej migracji.
- Zasady Git, nazwy branchy, styl commitów, reguły pushowania i oczekiwana
  weryfikacja są opisane w `AGENTS.md`.
