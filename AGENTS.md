# AGENTS.md - adiker.eu

This file is the canonical guide for AI agents working in this repository.
In case of conflict with `CLAUDE.md`, README, or tool-specific memory,
follow `AGENTS.md` first.

## Project Goal / Cel projektu

`adiker.eu` is a static personal service hub for:

- Jellyfin
- FileBrowser Quantum
- autobrr
- OpenSpeedTest

The page provides service links, live status polling, latency display, language
switching, theme switching, and basic client environment detection. Keep it
small, fast, and easy to host as static files.

`adiker.eu` to statyczny osobisty hub usług dla:

- Jellyfin
- FileBrowser Quantum
- autobrr
- OpenSpeedTest

Strona udostępnia linki do usług, odpytywanie statusów na żywo, pomiar opóźnień,
przełącznik języka, przełącznik motywu oraz podstawowe wykrywanie środowiska
klienta. Zachowuj projekt jako mały, szybki i łatwy do hostowania zestaw plików
statycznych.

## Architecture / Architektura

- No framework, bundler, transpiler, Node dependency, or build step.
- `index.html` contains the page structure and service panels.
- `css/styles.css` contains layout, themes, responsive behavior, and focus states.
- `js/app.js` contains UI logic, i18n strings, theme/language persistence, tabs,
  dashboard rendering, client detection, and service polling.
- `img/` contains local image assets.
- `CNAME` is required for the GitHub Pages custom domain.
- `index_old.html` is a legacy backup; do not update it unless the user asks.

- Brak frameworka, bundlera, transpilera, zależności Node i build stepu.
- `index.html` zawiera strukturę strony i panele usług.
- `css/styles.css` zawiera layout, motywy, responsywność i stany focus.
- `js/app.js` zawiera logikę UI, teksty i18n, zapis motywu/języka, taby,
  dashboard, wykrywanie klienta i polling usług.
- `img/` zawiera lokalne zasoby graficzne.
- `CNAME` jest wymagany dla niestandardowej domeny GitHub Pages.
- `index_old.html` to kopia starszej wersji; nie aktualizuj jej bez prośby
  użytkownika.

## Editing Rules / Zasady edycji

- Prefer small, readable changes over broad rewrites.
- Do not add a framework, package manager, build step, or CI unless the user
  explicitly approves it.
- When adding, removing, or renaming a service, keep these in sync:
  `SERVICES`, `SERVICE_STATE`, `STR.en`, `STR.pl`, dashboard latency labels,
  tabs, panels, buttons, ARIA labels, and README.
- Keep EN and PL UI strings complete. Do not update only one language.
- Keep `localStorage` keys stable unless a migration is documented:
  `adiker.theme` and `adiker.lang`.
- Treat public service URLs as user-facing configuration. Do not change domains
  or health endpoints casually.
- Preserve accessibility behavior: skip link, tablist/tabpanel roles, keyboard
  navigation, `aria-live`, and `:focus-visible` styles.
- For user-visible or operational changes, update `README.md`.
- Update `CLAUDE.md` only for Claude-specific quick-start guidance.
- Update this file only for agent guardrails or mistakes future agents are
  likely to make.

- Preferuj małe, czytelne zmiany zamiast szerokich refaktorów.
- Nie dodawaj frameworka, managera pakietów, build stepu ani CI bez wyraźnej
  zgody użytkownika.
- Przy dodawaniu, usuwaniu albo zmianie nazwy usługi utrzymuj synchronizację:
  `SERVICES`, `SERVICE_STATE`, `STR.en`, `STR.pl`, etykiet opóźnień dashboardu,
  tabów, paneli, przycisków, etykiet ARIA i README.
- Teksty UI utrzymuj kompletne w EN i PL. Nie aktualizuj tylko jednego języka.
- Zachowuj stabilne klucze `localStorage`, chyba że dokumentujesz migrację:
  `adiker.theme` i `adiker.lang`.
- Publiczne URL-e usług traktuj jak konfigurację widoczną dla użytkownika. Nie
  zmieniaj domen ani endpointów health przypadkowo.
- Zachowuj dostępność: skip link, role tablist/tabpanel, nawigację klawiaturą,
  `aria-live` oraz style `:focus-visible`.
- Dla zmian widocznych dla użytkownika albo operacyjnych aktualizuj `README.md`.
- `CLAUDE.md` aktualizuj tylko jako szybkie wskazówki specyficzne dla Claude.
- Ten plik aktualizuj tylko dla zasad agentowych albo pułapek, które przyszli
  agenci mogliby łatwo przeoczyć.

## Git Workflow (mandatory)

- Never commit directly to `main` unless explicitly asked by the user.
- Always create a branch from the latest `origin/main` for feature, fix,
  refactor, or documentation work.
- Use branch prefixes: `feature/`, `fix/`, `refactor/`, `docs/`, or `chore/`.
- Push the branch and open a PR to `main`.
- Never force-push to `main`.
- Never delete branches without explicit consent.
- Never rewrite published history without explicit consent.
- Before opening a PR, run the relevant checks for the touched area.
- For risky changes, include a short risk/rollback note in the PR description.

## Branch and Commit Hygiene / Higiena branchy i commitów

- Do not push agent-generated branch names such as `claude/*` or temporary tool
  branches to origin. Rename to an approved prefix before opening a PR.
- Use Conventional Commits:
  `<type>(optional-scope): <short description>`.
- Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`,
  `ci`, `chore`, `revert`.
- Keep commit subjects concise, lowercase after the colon, and without a final
  period.
- Good examples:
  - `docs(agents): add AI agent instructions`
  - `docs(readme): document OpenSpeedTest status checks`
  - `fix(ui): keep dashboard labels in sync`
  - `chore(repo): update custom domain notes`

- Nie wypychaj na origin nazw branchy generowanych przez agentów, takich jak
  `claude/*`, ani tymczasowych branchy narzędzi. Przed PR zmień nazwę na
  zaakceptowany prefiks.
- Używaj Conventional Commits:
  `<typ>(opcjonalny-zakres): <krótki opis>`.
- Dozwolone typy: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`,
  `ci`, `chore`, `revert`.
- Tytuły commitów trzymaj krótkie, małą literą po dwukropku i bez kropki na
  końcu.

## Verification / Weryfikacja

Documentation-only changes:

- Review Markdown headings, links, command examples, and EN/PL consistency.
- Confirm code examples still match the repository structure.
- Runtime testing is not required when no application code changed.

UI or JavaScript changes:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` and check:

- desktop and mobile layout,
- EN/PL language switcher,
- Dark / Light / OLED themes,
- service tabs and keyboard arrow navigation,
- dashboard count, last-check time, and latency labels,
- service status pills for Jellyfin, FileBrowser Quantum, autobrr, and
  OpenSpeedTest,
- focus states and skip link.

Zmiany w samej dokumentacji:

- Sprawdź nagłówki Markdown, linki, przykłady komend i spójność EN/PL.
- Upewnij się, że przykłady nadal pasują do struktury repo.
- Test runtime nie jest wymagany, jeżeli kod aplikacji się nie zmienił.

Zmiany UI albo JavaScript:

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080` i sprawdź:

- layout desktopowy i mobilny,
- przełącznik języka EN/PL,
- motywy Dark / Light / OLED,
- taby usług i nawigację strzałkami,
- licznik dashboardu, czas ostatniego sprawdzenia i etykiety opóźnień,
- statusy Jellyfin, FileBrowser Quantum, autobrr i OpenSpeedTest,
- stany focus i skip link.
