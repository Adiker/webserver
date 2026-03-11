
const JF_URL = 'https://jellyfin.adiker.eu';
const THEME_KEY = 'adiker.theme'
let __animTheme = false;
const LANG_KEY = 'adiker.lang';

const THEME_ORDER = ['dark', 'light', 'oled'];
const SERVICE_STATE = { jf: false, fb: false, ab: false };

const STR = {
    en: {
        nav: { jellyfin: 'Jellyfin', more: 'More services (soon)' },
        subtitle: "My Playground",
        availability: "Usually available: 9:00 AM – 1:00 AM CEST",
        ui: {
            theme: 'Theme',
            themeTitle: 'Toggle theme',
            language: 'Language',
            sections: 'Sections (placeholder)',
            dark: 'Dark',
            light: 'Light',
            oled: 'OLED'
        },
        jf: { title: 'Jellyfin', sub: 'Your media server', open: 'Open Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Your file manager', open: 'Open FileBrowser Quantum' },
        ab: { title: 'autobrr', sub: 'Automated torrent management', open: 'Open autobrr' },
        status: { online: 'Online', offline: 'Offline' },
        pc: { on: 'My PC is on :)', off: 'My PC is off :(' },
        footer: { served: 'Served by GitHub/Caddy' }
    },
    pl: {
        nav: { jellyfin: 'Jellyfin', more: 'Więcej usług (wkrótce)' },
        subtitle: "Mój plac zabaw",
        availability: "Zwykle dostępny: 09:00 – 01:00 CEST",
        ui: {
            theme: 'Motyw',
            themeTitle: 'Przełącz motyw',
            language: 'Język',
            sections: 'Sekcje (wkrótce)',
            dark: 'Ciemny',
            light: 'Jasny',
            oled: 'OLED'
        },
        jf: { title: 'Jellyfin', sub: 'Twój serwer multimediów', open: 'Otwórz Jellyfin' },
        fb: { title: 'FileBrowser Quantum', sub: 'Twój menedżer plików', open: 'Otwórz FileBrowsera Quantum' },
        ab: { title: 'autobrr', sub: 'Automatyzacja torrentów', open: 'Otwórz autobrr' },
        status: { online: 'Online', offline: 'Offline' },
        pc: { on: 'Mój PC jest włączony :)', off: 'Mój PC jest wyłączony :(' },
        footer: { served: 'Hostowane przez GitHub/Caddy' }
    }
};

function renderPcStatus(lang = (localStorage.getItem(LANG_KEY) || 'en')) {
    const L = STR[lang] || STR.en;
    const anyOnline = Object.values(SERVICE_STATE).some(Boolean);
    const pcStatus = document.getElementById('pc-status');
    if (!pcStatus) return;
    pcStatus.textContent = anyOnline ? L.pc.on : L.pc.off;
    pcStatus.classList.toggle('is-on', anyOnline);
    pcStatus.classList.toggle('is-off', !anyOnline);
}

function applyLang(lang) {
    const L = STR[lang] || STR.en;
    document.documentElement.lang = lang;
    document.getElementById('jf-title').textContent = '🎬 ' + L.jf.title;
    document.getElementById('jf-sub').textContent = L.jf.sub;
    document.getElementById('jf-btn-text').textContent = L.jf.open;
    document.getElementById('fb-title').textContent = '📁 ' + L.fb.title;
    document.getElementById('fb-sub').textContent = L.fb.sub;
    document.getElementById('fb-btn').setAttribute('aria-label', L.fb.open);
    document.getElementById('fb-btn-text').textContent = L.fb.open;
    document.getElementById('ab-title').textContent = L.ab.title;
    document.getElementById('ab-sub').textContent = L.ab.sub;
    document.getElementById('ab-btn').setAttribute('aria-label', L.ab.open);
    document.getElementById('ab-btn-text').textContent = L.ab.open;
    document.getElementById('subtitle').textContent = L.subtitle;
    document.getElementById("availability").textContent = L.availability;
    const jfBtn = document.getElementById('jf-btn');
    jfBtn && jfBtn.setAttribute('aria-label', L.jf.open);
    const tj = document.getElementById('tab-jellyfin');
    const tm = document.getElementById('tab-more');
    tj && (tj.textContent = L.nav.jellyfin);
    tm && (tm.textContent = L.nav.more);
    const tabsNav = document.querySelector('nav.tabs');
    tabsNav && tabsNav.setAttribute('aria-label', L.ui.sections);
    document.getElementById('served').textContent = L.footer.served;
    renderPcStatus(lang);
    const langGroup = document.querySelector('[role="group"]');
    langGroup && langGroup.setAttribute('aria-label', L.ui.language);
    document.getElementById('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    document.getElementById('lang-pl').setAttribute('aria-pressed', String(lang === 'pl'));
    updateThemeUI(lang);
    localStorage.setItem(LANG_KEY, lang);
}

function setTheme(mode) {
    const normalizedMode = THEME_ORDER.includes(mode) ? mode : 'dark';
    document.documentElement.classList.toggle('theme-light', normalizedMode === 'light');
    document.documentElement.classList.toggle('theme-oled', normalizedMode === 'oled');
    const themeColor = normalizedMode === 'light' ? '#f7f9fc' : (normalizedMode === 'oled' ? '#000000' : '#0b0f14');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', themeColor);
    localStorage.setItem(THEME_KEY, normalizedMode);
}

const themeBtn = document.getElementById('theme-toggle');
function updateThemeUI(lang) {
    const L = STR[lang] || STR.en;
    const mode = localStorage.getItem(THEME_KEY) || 'dark';
    const icon = mode === 'light' ? '☀️' : (mode === 'oled' ? '🖤' : '🌙');
    const modeLabel = mode === 'light' ? L.ui.light : (mode === 'oled' ? L.ui.oled : L.ui.dark);
    themeBtn.setAttribute('aria-pressed', String(mode !== 'dark'));
    themeBtn.innerHTML = `<span class="emoji">${icon}</span> ${L.ui.theme}: ${modeLabel}`;
    themeBtn.title = L.ui.themeTitle;
    if (__animTheme) {
        const e = themeBtn.querySelector('.emoji');
        if (e) { e.classList.add('flip'); setTimeout(() => e.classList.remove('flip'), 320); }
        __animTheme = false;
    }
}

const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
setTheme(currentTheme);
updateThemeUI(localStorage.getItem(LANG_KEY) || 'en');

themeBtn.addEventListener('click', () => {
    __animTheme = true;
    const currentMode = localStorage.getItem(THEME_KEY) || 'dark';
    const currentIndex = THEME_ORDER.indexOf(currentMode);
    const newMode = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    setTheme(newMode);
    updateThemeUI(localStorage.getItem(LANG_KEY) || 'en');
});

const savedLang = localStorage.getItem(LANG_KEY) || 'en';
applyLang(savedLang);
document.getElementById('lang-en').addEventListener('click', () => applyLang('en'));
document.getElementById('lang-pl').addEventListener('click', () => applyLang('pl'));

async function headPing(url, timeoutMs = 5000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: ctrl.signal });
        clearTimeout(t); return true;
    } catch (e) {
        clearTimeout(t); return false;
    }
}

document.getElementById('year').textContent = new Date().getFullYear();

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}
function actJellyfin() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function actMore() {
    const lang = localStorage.getItem(LANG_KEY) || 'en';
    showToast(lang === 'pl' ? 'Wkrótce 🙂' : 'Coming soon 🙂');
}
const tj = document.getElementById('tab-jellyfin');
const tm = document.getElementById('tab-more');
tj && tj.addEventListener('click', actJellyfin);
tm && tm.addEventListener('click', actMore);
[tj, tm].forEach(el => el && el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } }));


(function () {
    const tj = document.getElementById('tab-jellyfin');
    const tf = document.getElementById('tab-filebrowser');
    const ta = document.getElementById('tab-autobrr');
    const tm = document.getElementById('tab-more');

    function setActive(tab) {
        [tj, tf, ta, tm].forEach(b => b && b.setAttribute('aria-selected', String(b === tab)));
        document.querySelectorAll('section.card').forEach(s => s.classList.remove('active-card'));

        if (tab === tj) {
            const sec = document.getElementById('jf-title')?.closest('section.card');
            if (sec) sec.classList.add('active-card');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else if (tab === tf) {
            const anchor = document.getElementById('fb-title');
            if (anchor) {
                const sec = anchor.closest('section.card');
                if (sec) sec.classList.add('active-card');
                anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        else if (tab === ta) {
            const anchor = document.getElementById('ab-title');
            if (anchor) {
                const sec = anchor.closest('section.card');
                if (sec) sec.classList.add('active-card');
                anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        else if (tab === tm) {
            const lang = localStorage.getItem('adiker.lang') || 'en';
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = (lang === 'pl') ? 'Wkrótce 🙂' : 'Coming soon 🙂';
                toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1200);
            }
        }
    }

    tj && tj.addEventListener('click', () => setActive(tj));
    tf && tf.addEventListener('click', () => setActive(tf));
    ta && ta.addEventListener('click', () => setActive(ta));
    tm && tm.addEventListener('click', () => setActive(tm));

    if (![tj, tf, ta, tm].some(b => b && b.getAttribute('aria-selected') === 'true')) {
        tj && setActive(tj);
    }
})();

(function () {
    async function refreshService(prefix, url) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2000);
        try {
            const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit', cache: 'no-store' });
            clearTimeout(t);
            setStatus(prefix, res && res.ok);
        } catch (e) {
            clearTimeout(t);
            setStatus(prefix, false);
        }
    }

    function setStatus(prefix, ok) {
        const L = STR[localStorage.getItem(LANG_KEY) || 'en'] || STR.en;
        const dot = document.getElementById(prefix + '-dot');
        const txt = document.getElementById(prefix + '-text');
        const pill = document.getElementById(prefix + '-pill');
        if (dot) dot.style.background = ok ? 'var(--good)' : 'var(--bad)';
        if (txt) txt.textContent = ok ? L.status.online : L.status.offline;
        if (pill) pill.setAttribute('aria-label', ok ? L.status.online : L.status.offline);
        SERVICE_STATE[prefix] = !!ok;
        renderPcStatus();
    }

    // Jellyfin
    refreshService('jf', 'https://jellyfin.adiker.eu/health');
    setInterval(() => refreshService('jf', 'https://jellyfin.adiker.eu/health'), 5000);

    // Filebrowser
    refreshService('fb', 'https://files.adiker.eu/health');
    setInterval(() => refreshService('fb', 'https://files.adiker.eu/health'), 5000);

    // Autobrr
    refreshService('ab', 'https://autobrr.adiker.eu/api/healthz/liveness');
    setInterval(() => refreshService('ab', 'https://autobrr.adiker.eu/api/healthz/liveness'), 5000);
})();
