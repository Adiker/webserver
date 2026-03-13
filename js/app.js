const THEME_KEY = 'adiker.theme';
const LANG_KEY = 'adiker.lang';
const THEME_ORDER = ['dark', 'light', 'oled'];

let __animTheme = false;
let lastCheckAt = null;

const SERVICE_STATE = {
    jf: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [] },
    fb: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [] },
    ab: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [] }
};

const SERVICES = [
    { key: 'jf', url: 'https://jellyfin.adiker.eu/health' },
    { key: 'fb', url: 'https://files.adiker.eu/health' },
    { key: 'ab', url: 'https://autobrr.adiker.eu/api/healthz/liveness' }
];

const STR = {
    en: {
        nav: {
            jellyfin: 'Jellyfin',
            filebrowser: 'Filebrowser',
            autobrr: 'Autobrr',
            more: 'More services (soon)'
        },
        subtitle: 'My Playground',
        availability: 'Usually available: 9:00 AM – 1:00 AM CEST',
        ui: {
            theme: 'Theme',
            themeTitle: 'Toggle theme',
            language: 'Language',
            sections: 'Sections',
            dark: 'Dark',
            light: 'Light',
            oled: 'OLED'
        },
        dashboard: {
            title: '📊 Service dashboard',
            sub: 'Live status overview',
            overall: 'online',
            lastCheck: 'Last check',
            notYet: '--'
        },
        jf: { title: 'Jellyfin', sub: 'Your media server', open: 'Open Jellyfin', short: 'Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Your file manager', open: 'Open FileBrowser Quantum', short: 'FileBrowser' },
        ab: { title: 'autobrr', sub: 'Automated torrent management', open: 'Open autobrr', short: 'autobrr' },
        status: { online: 'Online', offline: 'Offline' },
        pc: { on: 'My PC is on :)', off: 'My PC is off :(' },
        footer: { served: 'Served by GitHub/Caddy' },
        toastMore: 'Coming soon 🙂'
    },
    pl: {
        nav: {
            jellyfin: 'Jellyfin',
            filebrowser: 'Filebrowser',
            autobrr: 'Autobrr',
            more: 'Więcej usług (wkrótce)'
        },
        subtitle: 'Mój plac zabaw',
        availability: 'Zwykle dostępny: 09:00 – 01:00 CEST',
        ui: {
            theme: 'Motyw',
            themeTitle: 'Przełącz motyw',
            language: 'Język',
            sections: 'Sekcje',
            dark: 'Ciemny',
            light: 'Jasny',
            oled: 'OLED'
        },
        dashboard: {
            title: '📊 Panel usług',
            sub: 'Podgląd statusu na żywo',
            overall: 'online',
            lastCheck: 'Ostatnie sprawdzenie',
            notYet: '--'
        },
        jf: { title: 'Jellyfin', sub: 'Twój serwer multimediów', open: 'Otwórz Jellyfin', short: 'Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Twój menedżer plików', open: 'Otwórz FileBrowsera Quantum', short: 'FileBrowser' },
        ab: { title: 'autobrr', sub: 'Automatyzacja torrentów', open: 'Otwórz autobrr', short: 'autobrr' },
        status: { online: 'Online', offline: 'Offline' },
        pc: { on: 'Mój PC jest włączony :)', off: 'Mój PC jest wyłączony :(' },
        footer: { served: 'Hostowane przez GitHub/Caddy' },
        toastMore: 'Wkrótce 🙂'
    }
};

function getLang() {
    return localStorage.getItem(LANG_KEY) || 'en';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1600);
}

function renderPcStatus(lang = getLang()) {
    const L = STR[lang] || STR.en;
    const anyOnline = Object.values(SERVICE_STATE).some((s) => s.online);
    const pcStatus = document.getElementById('pc-status');
    if (!pcStatus) return;
    pcStatus.textContent = anyOnline ? L.pc.on : L.pc.off;
    pcStatus.classList.toggle('is-on', anyOnline);
    pcStatus.classList.toggle('is-off', !anyOnline);
}

function renderDashboard(lang = getLang()) {
    const L = STR[lang] || STR.en;
    const total = SERVICES.length;
    const onlineCount = Object.values(SERVICE_STATE).filter((s) => s.online).length;

    setText('dash-overall', `${onlineCount}/${total} ${L.dashboard.overall}`);
    setText('dash-title', L.dashboard.title);
    setText('dash-sub', L.dashboard.sub);

    const lastText = lastCheckAt
        ? new Date(lastCheckAt).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-GB')
        : L.dashboard.notYet;
    setText('dash-lastcheck', `${L.dashboard.lastCheck}: ${lastText}`);

    setText('dash-jf-latency', `${L.jf.short}: ${SERVICE_STATE.jf.latency ?? '--'} ms`);
    setText('dash-fb-latency', `${L.fb.short}: ${SERVICE_STATE.fb.latency ?? '--'} ms`);
    setText('dash-ab-latency', `${L.ab.short}: ${SERVICE_STATE.ab.latency ?? '--'} ms`);
}

function applyLang(lang) {
    const L = STR[lang] || STR.en;

    document.documentElement.lang = lang;
    setText('jf-title', '🎬 ' + L.jf.title);
    setText('jf-sub', L.jf.sub);
    setText('jf-btn-text', L.jf.open);
    setText('fb-title', '📁 ' + L.fb.title);
    setText('fb-sub', L.fb.sub);
    setText('fb-btn-text', L.fb.open);
    setText('ab-title', '⚡ ' + L.ab.title);
    setText('ab-sub', L.ab.sub);
    setText('ab-btn-text', L.ab.open);

    setText('subtitle', L.subtitle);
    setText('availability', L.availability);
    setText('served', L.footer.served);

    const jfBtn = document.getElementById('jf-btn');
    const fbBtn = document.getElementById('fb-btn');
    const abBtn = document.getElementById('ab-btn');
    if (jfBtn) jfBtn.setAttribute('aria-label', L.jf.open);
    if (fbBtn) fbBtn.setAttribute('aria-label', L.fb.open);
    if (abBtn) abBtn.setAttribute('aria-label', L.ab.open);

    setText('tab-jellyfin', L.nav.jellyfin);
    setText('tab-filebrowser', L.nav.filebrowser);
    setText('tab-autobrr', L.nav.autobrr);
    setText('tab-more', L.nav.more);

    const tabsNav = document.querySelector('nav.tabs');
    if (tabsNav) tabsNav.setAttribute('aria-label', L.ui.sections);

    const langGroup = document.querySelector('[role="group"]');
    if (langGroup) langGroup.setAttribute('aria-label', L.ui.language);

    const enBtn = document.getElementById('lang-en');
    const plBtn = document.getElementById('lang-pl');
    if (enBtn) enBtn.setAttribute('aria-pressed', String(lang === 'en'));
    if (plBtn) plBtn.setAttribute('aria-pressed', String(lang === 'pl'));

    updateThemeUI(lang);
    renderPcStatus(lang);
    renderDashboard(lang);
    localStorage.setItem(LANG_KEY, lang);
}

function setTheme(mode) {
    const normalizedMode = THEME_ORDER.includes(mode) ? mode : 'dark';
    document.documentElement.classList.toggle('theme-light', normalizedMode === 'light');
    document.documentElement.classList.toggle('theme-oled', normalizedMode === 'oled');

    const themeColor = normalizedMode === 'light'
        ? '#f7f9fc'
        : (normalizedMode === 'oled' ? '#000000' : '#0b0f14');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', themeColor);

    localStorage.setItem(THEME_KEY, normalizedMode);
}

const themeBtn = document.getElementById('theme-toggle');
function updateThemeUI(lang) {
    if (!themeBtn) return;
    const L = STR[lang] || STR.en;
    const mode = localStorage.getItem(THEME_KEY) || 'dark';
    const icon = mode === 'light' ? '☀️' : (mode === 'oled' ? '🖤' : '🌙');
    const modeLabel = mode === 'light' ? L.ui.light : (mode === 'oled' ? L.ui.oled : L.ui.dark);
    themeBtn.setAttribute('aria-pressed', String(mode !== 'dark'));
    themeBtn.innerHTML = `<span class="emoji">${icon}</span> ${L.ui.theme}: ${modeLabel}`;
    themeBtn.title = L.ui.themeTitle;

    if (__animTheme) {
        const e = themeBtn.querySelector('.emoji');
        if (e) {
            e.classList.add('flip');
            setTimeout(() => e.classList.remove('flip'), 320);
        }
        __animTheme = false;
    }
}

function setServiceStatus(prefix, ok, latency) {
    const L = STR[getLang()] || STR.en;
    const dot = document.getElementById(prefix + '-dot');
    const txt = document.getElementById(prefix + '-text');
    const pill = document.getElementById(prefix + '-pill');

    if (dot) dot.style.background = ok ? 'var(--good)' : 'var(--bad)';
    if (txt) txt.textContent = ok ? L.status.online : L.status.offline;
    if (pill) pill.setAttribute('aria-label', ok ? L.status.online : L.status.offline);

    SERVICE_STATE[prefix].online = !!ok;
    SERVICE_STATE[prefix].latency = Number.isFinite(latency) ? latency : null;
    lastCheckAt = Date.now();

    renderPcStatus();
    renderDashboard();
}

function getSmoothedLatency(state, latency) {
    state.latencySamples.push(latency);
    if (state.latencySamples.length > 3) state.latencySamples.shift();
    const avg = state.latencySamples.reduce((sum, v) => sum + v, 0) / state.latencySamples.length;
    return Math.round(avg);
}

async function refreshService(service) {
    const state = SERVICE_STATE[service.key];
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 2500);
    const started = performance.now();

    try {
        const res = await fetch(service.url, {
            signal: ctrl.signal,
            credentials: 'omit',
            cache: 'no-store'
        });
        clearTimeout(timeout);

        const latency = Math.round(performance.now() - started);
        const ok = !!(res && res.ok);

        if (ok && !state.warmedUp) {
            // Pierwszy pomiar zwykle zawiera koszt DNS/TLS i potrafi być zawyżony.
            // Traktujemy go jako warm-up i pokazujemy stabilniejszy wynik z kolejnego sprawdzenia.
            state.warmedUp = true;
            setServiceStatus(service.key, true, null);
            state.failCount = 0;
            state.nextDelay = 800;
        } else if (ok) {
            const smoothedLatency = getSmoothedLatency(state, latency);
            setServiceStatus(service.key, true, smoothedLatency);
            state.failCount = 0;
            state.nextDelay = 15000;
        } else {
            setServiceStatus(service.key, false, null);
            state.failCount += 1;
            state.nextDelay = Math.min(60000, 5000 * (2 ** state.failCount));
        }
    } catch (_e) {
        clearTimeout(timeout);
        setServiceStatus(service.key, false, null);
        state.latencySamples = [];
        state.failCount += 1;
        state.nextDelay = Math.min(60000, 5000 * (2 ** state.failCount));
    }

    setTimeout(() => refreshService(service), state.nextDelay);
}

function initTabs() {
    const tabIds = ['tab-jellyfin', 'tab-filebrowser', 'tab-autobrr'];
    const map = {
        'tab-jellyfin': 'section-jf',
        'tab-filebrowser': 'section-fb',
        'tab-autobrr': 'section-ab'
    };

    const tabs = tabIds.map((id) => document.getElementById(id)).filter(Boolean);
    const moreBtn = document.getElementById('tab-more');

    function activate(tabId) {
        tabs.forEach((tab) => {
            const active = tab.id === tabId;
            tab.setAttribute('aria-selected', String(active));
            tab.setAttribute('tabindex', active ? '0' : '-1');

            const panel = document.getElementById(map[tab.id]);
            if (panel) {
                panel.hidden = !active;
                panel.classList.toggle('active-card', active);
            }
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activate(tab.id));
        tab.addEventListener('keydown', (e) => {
            const index = tabs.indexOf(tab);
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const delta = e.key === 'ArrowRight' ? 1 : -1;
                const next = (index + delta + tabs.length) % tabs.length;
                tabs[next].focus();
                activate(tabs[next].id);
            }
        });
    });

    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            const L = STR[getLang()] || STR.en;
            showToast(L.toastMore);
        });
    }

    activate('tab-jellyfin');
}

function init() {
    setText('year', new Date().getFullYear());

    const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    setTheme(currentTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            __animTheme = true;
            const currentMode = localStorage.getItem(THEME_KEY) || 'dark';
            const currentIndex = THEME_ORDER.indexOf(currentMode);
            const newMode = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
            setTheme(newMode);
            updateThemeUI(getLang());
        });
    }

    const savedLang = getLang();
    applyLang(savedLang);

    const enBtn = document.getElementById('lang-en');
    const plBtn = document.getElementById('lang-pl');
    if (enBtn) enBtn.addEventListener('click', () => applyLang('en'));
    if (plBtn) plBtn.addEventListener('click', () => applyLang('pl'));

    initTabs();
    SERVICES.forEach((service) => refreshService(service));
}

init();
