// Blog scripts, shared by every page (build_site.py copies this to site/site.js).

// Top menu: highlight the current page, and the "Menu" button on phones.
(function () {
    const links = [...document.querySelectorAll('.site-nav a:not(.nav-external)')];
    const here = location.href.split('#')[0];
    const best = links.filter(a => here.startsWith(a.href)).sort((a, b) => b.href.length - a.href.length)[0];
    if (best) best.setAttribute('aria-current', 'page');

    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('site-nav');
    menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', open);
    });
})();

// Display options: text size, colours, easy-read font, spacing and link underlines.
// Each choice is saved on this device; "Match my device" follows the phone/computer setting.
(function () {
    const root = document.documentElement;
    const panel = document.getElementById('display-panel');
    const btn = document.getElementById('display-btn');
    const save = (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch (e) {} };

    function setOpen(open) {
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', open);
        if (open) document.getElementById('display-close').focus(); else btn.focus();
    }
    btn.addEventListener('click', () => setOpen(panel.hidden));
    document.getElementById('display-close').addEventListener('click', () => setOpen(false));
    document.getElementById('display-done').addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

    function refresh() {
        panel.querySelectorAll('[data-setting]').forEach(row => {
            const value = root.dataset[row.dataset.attr] || '';
            row.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', o.dataset.value === value));
        });
        panel.querySelectorAll('[data-toggle]').forEach(o => {
            o.setAttribute('aria-checked', root.dataset[o.dataset.toggle] === o.dataset.on);
        });
    }

    panel.querySelectorAll('[data-setting] button').forEach(o => o.addEventListener('click', () => {
        const row = o.closest('[data-setting]');
        if (o.dataset.value) root.dataset[row.dataset.attr] = o.dataset.value;
        else delete root.dataset[row.dataset.attr];
        save(row.dataset.setting, o.dataset.value);
        refresh();
    }));

    panel.querySelectorAll('[data-toggle]').forEach(o => o.addEventListener('click', () => {
        const key = o.dataset.toggle;
        const on = root.dataset[key] !== o.dataset.on;
        if (on) root.dataset[key] = o.dataset.on; else delete root.dataset[key];
        if (on && key === 'font') window.loadEasyFont();
        save(key, on ? o.dataset.on : '');
        refresh();
    }));

    document.getElementById('display-reset').addEventListener('click', () => {
        ['text', 'theme', 'font', 'spacing', 'links'].forEach(k => delete root.dataset[k]);
        ['textSize', 'theme', 'font', 'spacing', 'links'].forEach(k => save(k, ''));
        refresh();
    });

    refresh();
})();

// Home page: tip search and topic filter.
// Search and topic filter. Without JavaScript every tip is still listed.
(function () {
    const cards = [...document.querySelectorAll('.post-card')];
    const input = document.getElementById('tip-search');
    if (!input) return;
    const buttons = [...document.querySelectorAll('.topic')];
    const results = document.getElementById('results');
    let topic = '';

    function apply() {
        const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
        let shown = 0;
        cards.forEach(card => {
            const match = (!topic || card.dataset.topic === topic) &&
                words.every(w => card.dataset.search.includes(w));
            card.hidden = !match;
            shown += match;
        });
        results.textContent = (words.length || topic)
            ? (shown ? `${shown} tip${shown === 1 ? '' : 's'} found` : 'No tips match, try another word.')
            : '';
    }

    input.addEventListener('input', apply);
    buttons.forEach(b => b.addEventListener('click', () => {
        topic = b.dataset.topic;
        buttons.forEach(x => x.classList.toggle('active', x === b));
        apply();
    }));
})();

// Tech words page: word search.
(function () {
    const input = document.getElementById('word-search');
    if (!input) return;
    const words = [...document.querySelectorAll('.word')];
    const groups = [...document.querySelectorAll('.letter-group')];
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        words.forEach(w => { w.hidden = q && !w.dataset.search.includes(q); shown += !w.hidden; });
        groups.forEach(g => { g.hidden = ![...g.querySelectorAll('.word')].some(w => !w.hidden); });
        document.getElementById('no-words').hidden = shown > 0;
    });
})();

// "Listen to this tip": reads the title, the "In short" list and the post aloud using the
// browser's built-in voice (no account or app needed). Hidden if the browser can't speak.
(function () {
    const btn = document.getElementById('listen-btn');
    if (!btn || !('speechSynthesis' in window)) return;
    btn.hidden = false;
    const label = btn.querySelector('span');
    const article = document.querySelector('article');

    function textToRead() {
        const parts = [article.querySelector('h1').textContent];
        article.querySelectorAll('.in-short li, article > p').forEach(el => parts.push(el.textContent));
        return parts.map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    }

    function stop() {
        speechSynthesis.cancel();
        btn.setAttribute('aria-pressed', 'false');
        label.textContent = 'Listen to this tip';
    }

    btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') { stop(); return; }
        speechSynthesis.cancel();
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
        const chunks = textToRead();
        chunks.forEach((text, i) => {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-GB';
            u.rate = 0.95;
            if (voice) u.voice = voice;
            if (i === chunks.length - 1) u.onend = stop;
            speechSynthesis.speak(u);
        });
        btn.setAttribute('aria-pressed', 'true');
        label.textContent = 'Stop listening';
    });

    window.addEventListener('pagehide', () => speechSynthesis.cancel());
})();

// Tip pages: "Found this useful? Share it" buttons.
(function () {
    if (!document.querySelector('.pass-it-on')) return;
    document.querySelectorAll('.pass-link[data-open]').forEach(b => b.addEventListener('click', () => {
        window.open(b.dataset.open, '_blank', 'noopener');
    }));
    document.querySelectorAll('.pass-link[data-mail]').forEach(b => b.addEventListener('click', () => {
        window.location.href = b.dataset.mail;
    }));
    const copy = document.querySelector('.pass-link[data-copy]');
    copy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copy.dataset.copy);
            copy.textContent = 'Link copied!';
        } catch (err) {
            window.prompt('Copy this link:', copy.dataset.copy);
        }
        setTimeout(() => { copy.textContent = 'Copy link'; }, 2000);
    });
    // The phone's own menu (Messages, Messenger and so on) where the browser supports it.
    const more = document.querySelector('.pass-link[data-native]');
    if (navigator.share) {
        more.hidden = false;
        more.addEventListener('click', () => {
            navigator.share({title: more.dataset.title, url: more.dataset.native}).catch(() => {});
        });
    }
})();

// "Get in touch" page: sends the message in the background and shows the result here.
// (Without JavaScript the form still posts normally and lands on the thank-you page.)
(function () {
    const form = document.getElementById('message-form');
    if (!form) return;
    const status = document.getElementById('mf-status');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.subject = 'Blog message: ' + data.topic;
        delete data.redirect;
        button.disabled = true;
        status.className = 'mf-status';
        status.textContent = 'Sending...';
        try {
            const r = await fetch(form.action, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                body: JSON.stringify(data),
            });
            const result = await r.json();
            if (!result.success) throw new Error(result.message);
            form.reset();
            status.classList.add('mf-ok');
            status.textContent = "Thanks, your message is on its way. I'll reply by email, usually within a few days.";
        } catch (err) {
            status.classList.add('mf-error');
            status.textContent = "Sorry, your message didn't send. Please try again in a minute.";
        } finally {
            button.disabled = false;
        }
    });
})();
