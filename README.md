# adiker.eu - Personal Service Hub

> Polska wersja README znajduje się poniżej: [Przejdź do sekcji PL](#polski)

A lightweight, fast, and mobile-friendly homepage for **[adiker.eu](https://adiker.eu)**.
It gives quick access to self-hosted services, live status checks, latency display,
language and theme controls, and an accessible interface.

![Status](https://img.shields.io/badge/status-active-success)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-informational)
![Deployment](https://img.shields.io/badge/deployment-GitHub%20Pages-blueviolet)

---

## Table of Contents

- [English](#english)
  - [Overview](#overview)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Run Locally](#run-locally)
  - [Configuration](#configuration)
  - [Accessibility](#accessibility)
  - [AI Agent Notes](#ai-agent-notes)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
- [Polski](#polski)

---

## English

### Overview

This repository contains a static single-page application used as a front page for:

- **Jellyfin**
- **FileBrowser Quantum**
- **autobrr**
- **OpenSpeedTest**

The page is intentionally framework-free: plain HTML, CSS, and vanilla JavaScript.
That keeps it fast, portable, and easy to host on GitHub Pages or any static
server.

### Features

- Service tabs with a clean card-based layout
- Live service dashboard with online count, last check time, and latency labels
- Health checks for all configured services
- Polling with warm-up measurement and failure backoff
- EN/PL language switcher
- Dark / Light / OLED themes
- Client info badge with OS, browser, and device detection
- Keyboard-accessible tabs and visible focus states

### Project Structure

```text
.
├── AGENTS.md          # Canonical instructions for AI agents
├── CLAUDE.md          # Claude-specific quick context
├── CNAME              # Custom domain for GitHub Pages (adiker.eu)
├── README.md          # Project documentation
├── css/
│   └── styles.css     # Styling, themes, responsive rules
├── img/
│   └── 505675340-c40b22c9-33da-47b7-bc4c-ce69bb5cc174.png
│                     # Local FileBrowser Quantum logo asset
├── index.html         # Main page markup
├── index_old.html     # Legacy page backup
└── js/
    └── app.js         # UI logic, i18n, status polling
```

### Run Locally

No build step is required.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

### Configuration

Service endpoints are defined in `js/app.js`:

- `https://jellyfin.adiker.eu/health`
- `https://files.adiker.eu/health`
- `https://autobrr.adiker.eu/api/healthz/liveness`
- `https://speedtest.adiker.eu/health`

User preferences are stored in `localStorage`:

- `adiker.theme`
- `adiker.lang`

### Accessibility

- Skip link to main content
- Semantic `tablist` and `tabpanel` roles
- Keyboard navigation with left/right arrows in tabs
- `aria-live` updates for dashboard/status text
- `:focus-visible` styles
- Reduced-motion support via `prefers-reduced-motion`

### AI Agent Notes

AI agents should read [AGENTS.md](AGENTS.md) before making changes. It is the
canonical source for repository guardrails, Git workflow, branch naming, commit
style, and verification rules.

Claude-specific quick context is available in [CLAUDE.md](CLAUDE.md). If
`CLAUDE.md` conflicts with `AGENTS.md`, follow `AGENTS.md`.

### Deployment

The project is designed for static hosting, especially GitHub Pages. The
repository uses GitHub Actions to validate pull requests and publish the static
site from `main`.

Typical deployment flow:

1. Push changes to a branch.
2. Open a pull request to `main`.
3. Wait for the `Pages` workflow to pass.
4. Merge after review.
5. GitHub Actions publishes the runtime files to GitHub Pages.
6. Keep `CNAME` in the repository root for the custom domain mapping.

The workflow runs lightweight smoke checks: required file presence, `CNAME`
validation, JavaScript syntax validation, and a local static server check for
the HTML, CSS, JavaScript, and local image asset.

In repository settings, set GitHub Pages to use **GitHub Actions** as the build
and deployment source.

### Contributing

Contributions are welcome.

1. Fork the project.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

<a id="polski"></a>

## adiker.eu - Osobisty hub usług

Lekka, szybka i przyjazna mobilnie strona startowa dla **[adiker.eu](https://adiker.eu)**.
Zapewnia szybki dostęp do usług self-hosted, sprawdzanie ich statusu na żywo,
pomiar opóźnień oraz wygodny, dostępny interfejs.

### Przegląd

To repozytorium zawiera statyczną aplikację jednostronicową, używaną jako strona
główna dla:

- **Jellyfin**
- **FileBrowser Quantum**
- **autobrr**
- **OpenSpeedTest**

Strona celowo nie używa frameworków: to czysty HTML, CSS i vanilla JavaScript.
Dzięki temu pozostaje szybka, przenośna i łatwa w hostowaniu na GitHub Pages
albo dowolnym serwerze statycznym.

### Funkcje

- Zakładki usług z czytelnym układem kart
- Dashboard statusów z liczbą usług online, czasem ostatniego sprawdzenia i opóźnieniami
- Health checki dla wszystkich skonfigurowanych usług
- Odpytywanie z pomiarem rozgrzewkowym i backoffem przy błędach
- Przełącznik języka EN/PL
- Motywy Dark / Light / OLED
- Etykieta z wykrytym OS, przeglądarką i typem urządzenia
- Zakładki dostępne z klawiatury i czytelne stany focus

### Struktura projektu

```text
.
├── AGENTS.md          # Kanoniczne instrukcje dla agentów AI
├── CLAUDE.md          # Szybki kontekst specyficzny dla Claude
├── CNAME              # Własna domena dla GitHub Pages (adiker.eu)
├── README.md          # Dokumentacja projektu
├── css/
│   └── styles.css     # Style, motywy, reguły responsywne
├── img/
│   └── 505675340-c40b22c9-33da-47b7-bc4c-ce69bb5cc174.png
│                     # Lokalny zasób logo FileBrowser Quantum
├── index.html         # Główny markup strony
├── index_old.html     # Kopia starszej wersji strony
└── js/
    └── app.js         # Logika UI, i18n, odpytywanie statusów
```

### Uruchom lokalnie

Nie wymaga builda.

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080`.

### Konfiguracja

Endpointy usług są zdefiniowane w `js/app.js`:

- `https://jellyfin.adiker.eu/health`
- `https://files.adiker.eu/health`
- `https://autobrr.adiker.eu/api/healthz/liveness`
- `https://speedtest.adiker.eu/health`

Preferencje użytkownika zapisywane są w `localStorage`:

- `adiker.theme`
- `adiker.lang`

### Dostępność

- Link skip do głównej treści
- Semantyczne role `tablist` i `tabpanel`
- Nawigacja klawiaturą przy pomocy strzałek lewo/prawo w tabach
- Aktualizacje `aria-live` dla dashboardu i statusów
- Style `:focus-visible`
- Wsparcie dla `prefers-reduced-motion`

### Notatki dla agentów AI

Agenci AI powinni przeczytać [AGENTS.md](AGENTS.md) przed wprowadzaniem zmian.
To kanoniczne źródło zasad repozytorium, workflow Git, nazewnictwa branchy,
stylu commitów i oczekiwanej weryfikacji.

Szybki kontekst dla Claude znajduje się w [CLAUDE.md](CLAUDE.md). Jeżeli
`CLAUDE.md` jest sprzeczny z `AGENTS.md`, obowiązuje `AGENTS.md`.

### Wdrożenie

Projekt jest przygotowany pod hosting statyczny, szczególnie GitHub Pages.
Repozytorium używa GitHub Actions do walidowania pull requestów i publikowania
statycznej strony z `main`.

Typowy proces wdrożenia:

1. Wypchnij zmiany na branch.
2. Otwórz pull request do `main`.
3. Poczekaj, aż workflow `Pages` przejdzie poprawnie.
4. Zmerguj po review.
5. GitHub Actions opublikuje pliki runtime na GitHub Pages.
6. Zostaw plik `CNAME` w katalogu głównym dla mapowania własnej domeny.

Workflow wykonuje lekkie smoke checki: obecność wymaganych plików, walidację
`CNAME`, sprawdzenie składni JavaScript oraz lokalny test serwera statycznego
dla HTML, CSS, JavaScriptu i lokalnego obrazka.

W ustawieniach repozytorium ustaw GitHub Pages na źródło builda i wdrożenia
**GitHub Actions**.

### Współtworzenie

Wkład jest mile widziany.

1. Zrób fork projektu.
2. Utwórz branch z funkcją albo poprawką.
3. Zacommituj zmiany.
4. Otwórz pull request.

---

## License

MIT
