const THEME_KEY = 'adiker.theme';
const LANG_KEY = 'adiker.lang';
const STATUS_HISTORY_KEY = 'adiker.statusHistory.v1';
const THEME_ORDER = ['dark', 'light', 'oled'];
const HISTORY_LIMIT = 24;

let __animTheme = false;
let lastCheckAt = null;
let _saveTimer = null;

const DETECTED_OS = detectClientOS();
const DETECTED_BROWSER = detectClientBrowser();
const DETECTED_DEVICE = detectClientDevice();

const SERVICE_STATE = {
    jf: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [], history: [] },
    fb: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [], history: [] },
    ab: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [], history: [] },
    st: { online: false, latency: null, failCount: 0, nextDelay: 5000, warmedUp: false, latencySamples: [], history: [] }
};

const SERVICES = [
    { key: 'jf', url: 'https://jellyfin.adiker.eu/health' },
    { key: 'fb', url: 'https://files.adiker.eu/health' },
    { key: 'ab', url: 'https://autobrr.adiker.eu/api/healthz/liveness' },
    { key: 'st', url: 'https://speedtest.adiker.eu/health' }
];

const STR = {
    en: {
        nav: {
            jellyfin: 'Jellyfin',
            filebrowser: 'Filebrowser',
            autobrr: 'Autobrr',
            openspeedtest: 'OpenSpeedTest',
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
            notYet: '--',
            historyTitle: 'Recent checks',
            avgLatency: 'Avg',
            noData: 'No data yet',
            stable: 'Stable',
            recovering: 'Recovering',
            issues: 'Issues detected'
        },
        jf: { title: 'Jellyfin', sub: 'Your media server', open: 'Open Jellyfin', short: 'Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Your file manager', open: 'Open FileBrowser Quantum', short: 'FileBrowser' },
        ab: { title: 'autobrr', sub: 'Automated torrent management', open: 'Open autobrr', short: 'autobrr' },
        st: { title: 'OpenSpeedTest', sub: 'Network speed test', open: 'Open OpenSpeedTest', short: 'OpenSpeedTest' },
        status: { online: 'Online', offline: 'Offline' },
        pc: {
            on: 'My PC is on :)',
            off: 'My PC is off :(',
            osPrefix: 'Your OS',
            browserPrefix: 'Your browser',
            devicePrefix: 'Your device',
            os: {
                windows: 'Windows',
                android: 'Android',
                ios: 'iOS',
                macos: 'macOS',
                linux: 'Linux',
                other: 'Other'
            },
            browser: {
                chrome: 'Chrome',
                edge: 'Microsoft Edge',
                brave: 'Brave',
                vivaldi: 'Vivaldi',
                arc: 'Arc',
                firefox: 'Firefox',
                safari: 'Safari',
                opera: 'Opera',
                samsung: 'Samsung Internet',
                yandex: 'Yandex Browser',
                duckduckgo: 'DuckDuckGo Browser',
                ie: 'Internet Explorer',
                other: 'Other'
            },
            device: {
                phone: 'Phone',
                tablet: 'Tablet',
                desktop: 'Desktop',
                other: 'Other'
            }
        },
        footer: { served: 'Served by GitHub/Caddy' },
        toastMore: 'Coming soon 🙂'
    },
    pl: {
        nav: {
            jellyfin: 'Jellyfin',
            filebrowser: 'Filebrowser',
            autobrr: 'Autobrr',
            openspeedtest: 'OpenSpeedTest',
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
            notYet: '--',
            historyTitle: 'Ostatnie sprawdzenia',
            avgLatency: 'Śr.',
            noData: 'Brak danych',
            stable: 'Stabilnie',
            recovering: 'Wraca do normy',
            issues: 'Wykryto problemy'
        },
        jf: { title: 'Jellyfin', sub: 'Twój serwer multimediów', open: 'Otwórz Jellyfin', short: 'Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Twój menedżer plików', open: 'Otwórz FileBrowsera Quantum', short: 'FileBrowser' },
        ab: { title: 'autobrr', sub: 'Automatyzacja torrentów', open: 'Otwórz autobrr', short: 'autobrr' },
        st: { title: 'OpenSpeedTest', sub: 'Test prędkości sieci', open: 'Otwórz OpenSpeedTest', short: 'OpenSpeedTest' },
        status: { online: 'Online', offline: 'Offline' },
        pc: {
            on: 'Mój PC jest włączony :)',
            off: 'Mój PC jest wyłączony :(',
            osPrefix: 'Twój OS',
            browserPrefix: 'Twoja przeglądarka',
            devicePrefix: 'Twoje urządzenie',
            os: {
                windows: 'Windows',
                android: 'Android',
                ios: 'iOS',
                macos: 'macOS',
                linux: 'Linux',
                other: 'Inny'
            },
            browser: {
                chrome: 'Chrome',
                edge: 'Microsoft Edge',
                brave: 'Brave',
                vivaldi: 'Vivaldi',
                arc: 'Arc',
                firefox: 'Firefox',
                safari: 'Safari',
                opera: 'Opera',
                samsung: 'Samsung Internet',
                yandex: 'Yandex Browser',
                duckduckgo: 'DuckDuckGo Browser',
                ie: 'Internet Explorer',
                other: 'Inna'
            },
            device: {
                phone: 'Telefon',
                tablet: 'Tablet',
                desktop: 'Komputer',
                other: 'Inne'
            }
        },
        footer: { served: 'Hostowane przez GitHub/Caddy' },
        toastMore: 'Wkrótce 🙂'
    }
};

function detectClientOS() {
    const uaDataPlatform = navigator.userAgentData && typeof navigator.userAgentData.platform === 'string'
        ? navigator.userAgentData.platform
        : '';
    const platform = typeof navigator.platform === 'string' ? navigator.platform : '';
    const userAgent = typeof navigator.userAgent === 'string' ? navigator.userAgent : '';
    const source = `${uaDataPlatform} ${platform} ${userAgent}`.toLowerCase();

    if (source.includes('android')) return 'android';
    if (source.includes('iphone') || source.includes('ipad') || source.includes('ipod') || source.includes('ios')) return 'ios';
    if (source.includes('mac')) return 'macos';
    if (source.includes('win')) return 'windows';
    if (source.includes('linux') || source.includes('x11')) return 'linux';
    return 'other';
}

function detectClientBrowser() {
    const userAgent = typeof navigator.userAgent === 'string' ? navigator.userAgent.toLowerCase() : '';
    const brands = Array.isArray(navigator.userAgentData?.brands)
        ? navigator.userAgentData.brands.map((b) => String(b.brand || '').toLowerCase())
        : [];

    const hasBrand = (name) => brands.some((b) => b.includes(name));

    const BROWSER_RULES = [
        { key: 'edge', brand: ['microsoft edge'], ua: ['edg/'] },
        { key: 'opera', brand: ['opera'], ua: ['opr/', 'opera'] },
        { key: 'vivaldi', brand: ['vivaldi'], ua: ['vivaldi'] },
        { key: 'brave', brand: ['brave'], ua: ['brave'] },
        { key: 'arc', brand: ['arc'], ua: [' arc/'] },
        { key: 'duckduckgo', brand: ['duckduckgo'], ua: ['duckduckgo'] },
        { key: 'yandex', brand: ['yandex'], ua: ['yabrowser'] },
        { key: 'samsung', brand: ['samsung internet'], ua: ['samsungbrowser'] },
        { key: 'ie', brand: [], ua: ['trident/', 'msie'] },
        { key: 'firefox', brand: ['firefox'], ua: ['firefox/'] }
    ];

    const matchedRule = BROWSER_RULES.find((rule) => {
        const byBrand = rule.brand.some((name) => hasBrand(name));
        const byUA = rule.ua.some((token) => userAgent.includes(token));
        return byBrand || byUA;
    });

    if (matchedRule) return matchedRule.key;

    const isSafari = (hasBrand('safari') || userAgent.includes('safari/'))
        && !userAgent.includes('chrome/')
        && !userAgent.includes('chromium')
        && !userAgent.includes('crios/')
        && !userAgent.includes('edg/')
        && !userAgent.includes('opr/')
        && !userAgent.includes('vivaldi');

    if (isSafari) return 'safari';
    if (hasBrand('google chrome') || hasBrand('chromium') || userAgent.includes('chrome/') || userAgent.includes('crios/')) return 'chrome';

    return 'other';
}

function detectClientDevice() {
    const userAgent = typeof navigator.userAgent === 'string' ? navigator.userAgent.toLowerCase() : '';
    const uaMobile = typeof navigator.userAgentData?.mobile === 'boolean' ? navigator.userAgentData.mobile : null;

    if (uaMobile === true) return 'phone';

    if (userAgent.includes('ipad') || userAgent.includes('tablet') || userAgent.includes('sm-t') || userAgent.includes('tab')) {
        return 'tablet';
    }

    if (userAgent.includes('mobi') || userAgent.includes('iphone') || userAgent.includes('android')) {
        return 'phone';
    }

    if (uaMobile === false) return 'desktop';
    if (userAgent.includes('windows') || userAgent.includes('macintosh') || userAgent.includes('linux') || userAgent.includes('x11')) {
        return 'desktop';
    }

    return 'other';
}

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

function getServiceLabel(key, lang = getLang()) {
    const L = STR[lang] || STR.en;
    if (L[key] && L[key].short) return L[key].short;
    const service = SERVICES.find((s) => s.key === key);
    return service ? new URL(service.url).hostname : key;
}

function loadStatusHistory() {
    try {
        const raw = localStorage.getItem(STATUS_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : {};

        SERVICES.forEach((service) => {
            const entries = Array.isArray(parsed[service.key]) ? parsed[service.key] : [];
            const cutoff = Date.now() - 48 * 60 * 60 * 1000;
            SERVICE_STATE[service.key].history = entries
                .filter((entry) => entry && Number.isFinite(entry.at) && typeof entry.online === 'boolean' && entry.at >= cutoff)
                .map((entry) => ({
                    at: entry.at,
                    online: entry.online,
                    latency: Number.isFinite(entry.latency) ? entry.latency : null
                }))
                .slice(-HISTORY_LIMIT);
        });
    } catch (_e) {
        SERVICES.forEach((service) => {
            SERVICE_STATE[service.key].history = [];
        });
    }
}

function saveStatusHistory() {
    const history = {};
    SERVICES.forEach((service) => {
        history[service.key] = SERVICE_STATE[service.key].history.slice(-HISTORY_LIMIT);
    });

    try {
        localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
    } catch (_e) {
        // History is useful, but the dashboard should keep working without storage.
    }
}

function scheduleSaveHistory() {
    if (_saveTimer) return;
    _saveTimer = setTimeout(() => {
        _saveTimer = null;
        saveStatusHistory();
    }, 30000);
}

function flushSaveHistory() {
    if (_saveTimer) {
        clearTimeout(_saveTimer);
        _saveTimer = null;
    }
    saveStatusHistory();
}

function addStatusHistoryEntry(key, ok, latency) {
    const state = SERVICE_STATE[key];
    if (!state) return;

    state.history.push({
        at: Date.now(),
        online: !!ok,
        latency: Number.isFinite(latency) ? latency : null
    });

    if (state.history.length > HISTORY_LIMIT) {
        state.history = state.history.slice(-HISTORY_LIMIT);
    }

    scheduleSaveHistory();
}

function getAverageHistoryLatency(history) {
    const samples = history
        .filter((entry) => entry.online && Number.isFinite(entry.latency))
        .map((entry) => entry.latency);

    if (!samples.length) return null;
    const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    return Math.round(avg);
}

function getHistorySummaryType(history) {
    if (!history.length) return 'noData';

    const recent = history.slice(-6);
    const failures = recent.filter((entry) => !entry.online).length;
    const lastOnline = history[history.length - 1].online;

    if (failures >= 2) return 'issues';
    if (failures === 0) return 'stable';
    return lastOnline ? 'recovering' : 'issues';
}

function getHistorySummary(history, L) {
    return L.dashboard[getHistorySummaryType(history)];
}

function renderHistoryTimeline(key, lang, L) {
    const state = SERVICE_STATE[key];
    if (!state) return;

    const history = state.history;
    const label = getServiceLabel(key, lang);
    const summaryType = getHistorySummaryType(history);
    const summary = L.dashboard[summaryType];
    const avgLatency = getAverageHistoryLatency(history);
    const onlineCount = history.filter((entry) => entry.online).length;
    const offlineCount = history.length - onlineCount;

    setText(`history-${key}-name`, label);
    const summaryEl = document.getElementById(`history-${key}-summary`);
    if (summaryEl) {
        summaryEl.textContent = summary;
        summaryEl.classList.remove('is-stable', 'is-recovering', 'is-issues');
        if (summaryType !== 'noData') summaryEl.classList.add(`is-${summaryType}`);
    }
    setText(`history-${key}-avg`, `${L.dashboard.avgLatency}: ${avgLatency ?? '--'} ms`);

    const line = document.getElementById(`history-${key}-line`);
    if (!line) return;

    if (line.children.length !== HISTORY_LIMIT) {
        line.innerHTML = '';
        for (let i = 0; i < HISTORY_LIMIT; i += 1) {
            const segment = document.createElement('span');
            segment.className = 'history-segment';
            segment.setAttribute('aria-hidden', 'true');
            line.appendChild(segment);
        }
    }

    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    const locale = lang === 'pl' ? 'pl-PL' : 'en-GB';
    for (let i = 0; i < HISTORY_LIMIT; i += 1) {
        const segment = line.children[i];
        const entry = history[i];
        segment.classList.remove('is-online', 'is-offline', 'is-unknown');
        if (!entry) {
            segment.classList.add('is-unknown');
            segment.title = L.dashboard.noData;
        } else {
            segment.classList.add(entry.online ? 'is-online' : 'is-offline');
            const time = new Date(entry.at).toLocaleTimeString(locale, timeOpts);
            const status = entry.online ? L.status.online : L.status.offline;
            segment.title = entry.online && entry.latency != null
                ? `${status} — ${entry.latency} ms — ${time}`
                : `${status} — ${time}`;
        }
    }

    const ariaText = history.length
        ? `${label}: ${summary}. ${onlineCount} ${L.status.online}, ${offlineCount} ${L.status.offline}, ${L.dashboard.avgLatency}: ${avgLatency ?? L.dashboard.notYet} ms`
        : `${label}: ${L.dashboard.noData}`;
    line.setAttribute('aria-label', ariaText);
}

function renderPcStatus(lang = getLang()) {
    const L = STR[lang] || STR.en;
    const anyOnline = Object.values(SERVICE_STATE).some((s) => s.online);
    const pcStatus = document.getElementById('pc-status');
    if (!pcStatus) return;

    const osLabel = L.pc.os[DETECTED_OS] || L.pc.os.other;
    const browserLabel = L.pc.browser[DETECTED_BROWSER] || L.pc.browser.other;
    const deviceLabel = L.pc.device[DETECTED_DEVICE] || L.pc.device.other;
    const pcText = anyOnline ? L.pc.on : L.pc.off;
    pcStatus.innerHTML = `
        <span class="pc-main">${pcText}</span>
        <span class="pc-os" aria-label="${L.pc.osPrefix}: ${osLabel}">${L.pc.osPrefix}: ${osLabel}</span>
        <span class="pc-os" aria-label="${L.pc.browserPrefix}: ${browserLabel}">${L.pc.browserPrefix}: ${browserLabel}</span>
        <span class="pc-os" aria-label="${L.pc.devicePrefix}: ${deviceLabel}">${L.pc.devicePrefix}: ${deviceLabel}</span>
    `;

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
    setText('dash-st-latency', `${L.st.short}: ${SERVICE_STATE.st.latency ?? '--'} ms`);
    setText('history-title', L.dashboard.historyTitle);

    SERVICES.forEach((service) => renderHistoryTimeline(service.key, lang, L));
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
    setText('st-title', '🚀 ' + L.st.title);
    setText('st-sub', L.st.sub);
    setText('st-btn-text', L.st.open);

    setText('subtitle', L.subtitle);
    setText('availability', L.availability);
    setText('served', L.footer.served);

    const jfBtn = document.getElementById('jf-btn');
    const fbBtn = document.getElementById('fb-btn');
    const abBtn = document.getElementById('ab-btn');
    const stBtn = document.getElementById('st-btn');
    if (jfBtn) jfBtn.setAttribute('aria-label', L.jf.open);
    if (fbBtn) fbBtn.setAttribute('aria-label', L.fb.open);
    if (abBtn) abBtn.setAttribute('aria-label', L.ab.open);
    if (stBtn) stBtn.setAttribute('aria-label', L.st.open);

    setText('tab-jellyfin', L.nav.jellyfin);
    setText('tab-filebrowser', L.nav.filebrowser);
    setText('tab-autobrr', L.nav.autobrr);
    setText('tab-speedtest', L.nav.openspeedtest);
    setText('tab-more', L.nav.more);

    const tabsNav = document.querySelector('nav.tabs');
    if (tabsNav) tabsNav.setAttribute('aria-label', L.ui.sections);

    const langGroup = document.querySelector('[role="group"]');
    if (langGroup) langGroup.setAttribute('aria-label', L.ui.language);

    const enBtn = document.getElementById('lang-en');
    const plBtn = document.getElementById('lang-pl');
    const langSwitch = document.querySelector('.lang-switch');
    if (enBtn) enBtn.setAttribute('aria-pressed', String(lang === 'en'));
    if (plBtn) plBtn.setAttribute('aria-pressed', String(lang === 'pl'));
    if (langSwitch) {
        langSwitch.classList.toggle('is-en', lang === 'en');
        langSwitch.classList.toggle('is-pl', lang === 'pl');
    }

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
    addStatusHistoryEntry(prefix, ok, latency);

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
    const tabIds = ['tab-jellyfin', 'tab-filebrowser', 'tab-autobrr', 'tab-speedtest'];
    const map = {
        'tab-jellyfin': 'section-jf',
        'tab-filebrowser': 'section-fb',
        'tab-autobrr': 'section-ab',
        'tab-speedtest': 'section-st'
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
    loadStatusHistory();

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

    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushSaveHistory();
    });
    window.addEventListener('beforeunload', flushSaveHistory);

    initTabs();
    SERVICES.forEach((service) => refreshService(service));
}

init();
