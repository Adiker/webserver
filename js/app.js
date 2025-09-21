
        const JF_URL = 'https://jellyfin.adiker.eu';
        const THEME_KEY = 'adiker.theme';
        const LANG_KEY = 'adiker.lang';

        const STR = {
            en: {
                nav: { jellyfin: 'Jellyfin', more: 'More services (soon)' },
                ui: { theme: 'Theme', themeTitle: 'Toggle theme', language: 'Language', sections: 'Sections (placeholder)' },
                jf: { title: 'Jellyfin', sub: 'Your media server', open: 'Open Jellyfin' },
                status: { online: 'Online', offline: 'Offline' },
                footer: { served: 'Served by GitHub/Caddy' }
            },
            pl: {
                nav: { jellyfin: 'Jellyfin', more: 'Więcej usług (wkrótce)' },
                ui: { theme: 'Motyw', themeTitle: 'Przełącz motyw', language: 'Język', sections: 'Sekcje (wkrótce)' },
                jf: { title: 'Jellyfin', sub: 'Twój serwer multimediów', open: 'Otwórz Jellyfin' },
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
            themeBtn.textContent = (isLight ? '☀️ ' : '🌙 ') + L.ui.theme;
            themeBtn.title = L.ui.themeTitle;
        }

        const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
        setTheme(currentTheme);
        updateThemeUI(localStorage.getItem(LANG_KEY) || 'en');

        themeBtn.addEventListener('click', () => {
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

        async function refreshPing() {
            const ok = await headPing(JF_URL);
            const dot = document.getElementById('ping-dot');
            const txt = document.getElementById('ping-text');
            const L = STR[localStorage.getItem(LANG_KEY) || 'en'];
            if (ok) { dot.style.background = 'var(--good)'; txt.textContent = L.status.online; }
            else { dot.style.background = 'var(--bad)'; txt.textContent = L.status.offline; }
        }

        refreshPing();
        setInterval(refreshPing, 30000);
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
    