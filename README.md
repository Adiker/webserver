# adiker.eu — Personal Service Hub

> 🇵🇱 Polska wersja README znajduje się poniżej: [Przejdź do sekcji PL](#-adikereu--osobisty-hub-usług)

A lightweight, fast and mobile-friendly homepage for **adiker.eu**.
It provides quick access to self-hosted services, live availability checks, language/theme controls, and an accessible interface.

![Status](https://img.shields.io/badge/status-active-success)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-informational)
![Deployment](https://img.shields.io/badge/deployment-GitHub%20Pages-blueviolet)

---

## 📚 Table of Contents

- [English](#english)
  - [Overview](#overview)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Run Locally](#run-locally)
  - [Configuration](#configuration)
  - [Accessibility](#accessibility)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
- [Polski](#-adikereu--osobisty-hub-usług)

---

## English

### Overview

This repository contains a static single-page application used as a front page for:

- **Jellyfin**
- **FileBrowser Quantum**
- **autobrr**

The page is intentionally framework-free (plain HTML/CSS/JS) to keep it fast, portable, and easy to host.

### Features

- ✅ Service tabs with clean card-based layout
- ✅ Live health checks + latency display
- ✅ Polling with warm-up measurement and failure backoff
- ✅ EN/PL language switcher
- ✅ Dark / Light / OLED themes
- ✅ Client info badge (OS, browser, device detection)
- ✅ Keyboard-accessible tabs and focus states

### Project Structure

```text
.
├── index.html          # Main page markup
├── css/
│   └── styles.css      # Styling, themes, responsive rules
├── js/
│   └── app.js          # UI logic, i18n, status polling
├── img/                # Local assets/icons
├── CNAME               # Custom domain for GitHub Pages (adiker.eu)
└── index_old.html      # Legacy page backup
```

### Run Locally

No build step is required.

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### Configuration

Service endpoints are defined in `js/app.js`:

- `https://jellyfin.adiker.eu/health`
- `https://files.adiker.eu/health`
- `https://autobrr.adiker.eu/api/healthz/liveness`

User preferences are stored in `localStorage`:

- `adiker.theme`
- `adiker.lang`

### Accessibility

- skip link to main content
- semantic tablist + tabpanel roles
- keyboard navigation (left/right arrows in tabs)
- `:focus-visible` styles
- reduced-motion support via `prefers-reduced-motion`

### Deployment

The project is designed for static hosting (e.g. GitHub Pages).

Typical deployment flow:

1. Push to your main branch
2. Enable GitHub Pages in repository settings
3. Keep `CNAME` in repo root for custom domain mapping

### Contributing

Contributions are welcome.

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 🇵🇱 adiker.eu — Osobisty hub usług

Lekka, szybka i responsywna strona startowa dla **adiker.eu**.
Umożliwia szybki dostęp do usług self-hosted, pokazuje ich status na żywo i oferuje wygodny, czytelny interfejs.

### Opis

Projekt to statyczna strona (bez frameworków), będąca panelem dostępu do:

- **Jellyfin**
- **FileBrowser Quantum**
- **autobrr**

Podejście „vanilla” (HTML/CSS/JS) gwarantuje prostotę utrzymania i bardzo dobrą wydajność.

### Najważniejsze funkcje

- ✅ Zakładki usług z czytelnym układem kart
- ✅ Live-check statusu usług + pomiar opóźnień (latency)
- ✅ Inteligentne odpytywanie (warm-up + backoff przy błędach)
- ✅ Przełącznik języka EN/PL
- ✅ Motywy: Dark / Light / OLED
- ✅ Etykieta z wykrytym OS, przeglądarką i typem urządzenia
- ✅ Obsługa klawiatury i elementy a11y

### Uruchomienie lokalnie

Nie wymaga builda.

```bash
python3 -m http.server 8080
```

Następnie otwórz: `http://localhost:8080`

### Konfiguracja

Adresy endpointów health-check znajdują się w `js/app.js`.

Preferencje użytkownika zapisywane są w `localStorage`:

- `adiker.theme`
- `adiker.lang`

### Dostępność

- link „skip to content”
- poprawna semantyka ARIA dla tabów
- nawigacja klawiaturą
- czytelne focus states
- wsparcie dla `prefers-reduced-motion`

### Wdrożenie

Projekt jest gotowy pod statyczny hosting (np. GitHub Pages) + domenę z `CNAME`.

### Współtworzenie

Masz pomysł na usprawnienie? Super — otwórz issue albo PR ✨

---

## License

MIT
