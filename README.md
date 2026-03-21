# adiker.eu — Personal Service Hub

> 🇵🇱 Polska wersja README znajduje się poniżej: [Przejdź do sekcji PL](#-adikereu--osobisty-hub-usług)

A lightweight, fast, and mobile-friendly homepage for **[adiker.eu](https://adiker.eu)**.
It gives quick access to self-hosted services, live status checks, language and theme controls, and an accessible interface.

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

The page is intentionally framework-free (plain HTML/CSS/JS), which keeps it fast, portable, and easy to host.

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

Lekka, szybka i przyjazna mobilnie strona startowa dla **[adiker.eu](https://adiker.eu)**.
Zapewnia szybki dostęp do usług self-hosted, sprawdzanie ich statusu na żywo oraz wygodny, dostępny interfejs.

### Przegląd

To repozytorium zawiera statyczną aplikację jednostronicową, używaną jako strona główna dla:

- **Jellyfin**
- **FileBrowser Quantum**
- **autobrr**

Strona celowo nie używa frameworków (czyste HTML/CSS/JS), dzięki czemu pozostaje szybka, przenośna i łatwa w hostowaniu.

### Funkcje

- ✅ Zakładki usług z czytelnym układem kart
- ✅ Sprawdzanie statusu usług na żywo + pomiar opóźnień
- ✅ Odpytywanie z pomiarem rozgrzewkowym i backoffem przy błędach
- ✅ Przełącznik języka EN/PL
- ✅ Motywy: Dark / Light / OLED
- ✅ Etykieta z wykrytym OS, przeglądarką i typem urządzenia
- ✅ Zakładki dostępne z klawiatury i czytelne stany focus

### Struktura projektu

```text
.
├── index.html          # Główny markup strony
├── css/
│   └── styles.css      # Style, motywy, reguły responsywne
├── js/
│   └── app.js          # Logika UI, i18n, odpytywanie statusów
├── img/                # Lokalne zasoby/ikony
├── CNAME               # Własna domena dla GitHub Pages (adiker.eu)
└── index_old.html      # Kopia starszej wersji strony
```

### Uruchom lokalnie

Nie wymaga builda.

```bash
python3 -m http.server 8080
```

Następnie otwórz: `http://localhost:8080`

### Konfiguracja

Endpointy usług są zdefiniowane w `js/app.js`:

- `https://jellyfin.adiker.eu/health`
- `https://files.adiker.eu/health`
- `https://autobrr.adiker.eu/api/healthz/liveness`

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

Projekt jest przygotowany pod hosting statyczny (np. GitHub Pages).

Typowy proces wdrożenia:

1. Wypchnij zmiany na główną gałąź
2. Włącz GitHub Pages w ustawieniach repozytorium
3. Zostaw plik `CNAME` w katalogu głównym dla mapowania własnej domeny

### Współtworzenie

Wkład jest mile widziany.

1. Zrób fork projektu
2. Utwórz gałąź z funkcją/poprawką
3. Zacommituj zmiany
4. Otwórz Pull Request

---

## License

MIT
