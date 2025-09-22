
const JF_URL = 'https://jellyfin.adiker.eu';
const THEME_KEY = 'adiker.theme'
let __animTheme = false;
const LANG_KEY = 'adiker.lang';

const STR = {
    en: {
        nav: { jellyfin: 'Jellyfin', more: 'More services (soon)' },
        subtitle: "My Playground",
        availability: "Usually available: 9:00 AM – 1:00 AM CEST",
        ui: { theme: 'Theme', themeTitle: 'Toggle theme', language: 'Language', sections: 'Sections (placeholder)' },
        jf: { title: 'Jellyfin', sub: 'Your media server', open: 'Open Jellyfin' },
        fb: { title: 'Filebrowser', sub: 'Your file manager', open: 'Open Filebrowser' },
        status: { online: 'Online', offline: 'Offline' },
        footer: { served: 'Served by GitHub/Caddy' }
    },
    pl: {
        nav: { jellyfin: 'Jellyfin', more: 'Więcej usług (wkrótce)' },
        subtitle: "Mój plac zabaw",
        availability: "Zwykle dostępny: 09:00 – 01:00 CEST",
        ui: { theme: 'Motyw', themeTitle: 'Przełącz motyw', language: 'Język', sections: 'Sekcje (wkrótce)' },
        jf: { title: 'Jellyfin', sub: 'Twój serwer multimediów', open: 'Otwórz Jellyfin' },
        fb: { title: 'Filebrowser', sub: 'Twój menedżer plików', open: 'Otwórz Filebrowsera' },
        status: { online: 'Online', offline: 'Offline' },
        footer: { served: 'Hostowane przez GitHub/Caddy' }
    }
};

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
    const langGroup = document.querySelector('[role="group"]');
    langGroup && langGroup.setAttribute('aria-label', L.ui.language);
    document.getElementById('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    document.getElementById('lang-pl').setAttribute('aria-pressed', String(lang === 'pl'));
    updateThemeUI(lang);
    localStorage.setItem(LANG_KEY, lang);
}

function setTheme(mode) {
    document.documentElement.classList.toggle('theme-light', mode === 'light');
    localStorage.setItem(THEME_KEY, mode);
}

const themeBtn = document.getElementById('theme-toggle');
function updateThemeUI(lang) {
    const L = STR[lang] || STR.en;
    const isLight = (localStorage.getItem(THEME_KEY) === 'light');
    themeBtn.setAttribute('aria-pressed', String(isLight));
    themeBtn.innerHTML = `<span class="emoji">${isLight ? '☀️' : '🌙'}</span> ${L.ui.theme}`;
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
    const newMode = (localStorage.getItem(THEME_KEY) === 'light') ? 'dark' : 'light';
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
    const tm = document.getElementById('tab-more');

    function setActive(tab) {
        [tj, tf, tm].forEach(b => b && b.setAttribute('aria-selected', String(b === tab)));
        document.querySelectorAll('section.card').forEach(s => s.classList.remove('active-card'));

        if (tab === tj) {
            const sec = document.getElementById('jf-title')?.closest('section.card');
            if (sec) sec.classList.add('active-card');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === tf) {
            const anchor = document.getElementById('fb-title');
            if (anchor) {
                const sec = anchor.closest('section.card');
                if (sec) sec.classList.add('active-card');
                anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (tab === tm) {
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
    tm && tm.addEventListener('click', () => setActive(tm));

    if (![tj, tf, tm].some(b => b && b.getAttribute('aria-selected') === 'true')) {
        tj && setActive(tj);
    }
})();

(function () {
    async function refreshService(prefix, url) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2000); // szybki timeout
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
        const L = STR[localStorage.getItem(LANG_KEY) || 'en'];
        const dot = document.getElementById(prefix + '-dot');
        const txt = document.getElementById(prefix + '-text');
        const pill = document.getElementById(prefix + '-pill');
        if (dot) dot.style.background = ok ? 'var(--good)' : 'var(--bad)';
        if (txt) txt.textContent = ok ? L.status.online : L.status.offline;
        if (pill) pill.setAttribute('aria-label', ok ? L.status.online : L.status.offline);
    }

    // Jellyfin
    refreshService('ping', 'https://jellyfin.adiker.eu/health');
    setInterval(() => refreshService('ping', 'https://jellyfin.adiker.eu/health'), 30000);

    // Filebrowser
    refreshService('fb', 'https://files.adiker.eu/health');
    setInterval(() => refreshService('fb', 'https://files.adiker.eu/health'), 30000);
})();
