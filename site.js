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

// Contact form and comment forms (Web3Forms): send in the background and show the result in place.
// Without JavaScript they still post normally and come back to the site.
document.querySelectorAll('#message-form, .web3-form').forEach(form => {
    const status = form.querySelector('.mf-status');
    const button = form.querySelector('button[type="submit"]');
    const okText = form.dataset.ok || "Thanks, your message is on its way. I'll reply by email, usually within a few days.";

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (data.topic) data.subject = 'Blog message: ' + data.topic;
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
            status.textContent = okText;
        } catch (err) {
            status.classList.add('mf-error');
            status.textContent = "Sorry, that didn't send. Please try again in a minute.";
        } finally {
            button.disabled = false;
        }
    });
});

// Tip pages: "This helped me". Counted by my own Cloudflare Worker (on my own web address, so ad
// blockers leave it alone). Once per browser, remembered on this device; nothing about the visitor is sent.
(function () {
    const box = document.getElementById('helped');
    if (!box) return;
    const btn = box.querySelector('.helped-btn');
    const label = box.querySelector('.helped-label');
    const countEl = box.querySelector('.helped-count');
    const tip = box.dataset.tip;
    const key = 'helped:' + tip;
    const nextdoor = parseInt(box.dataset.nextdoor, 10) || 0;  // likes on Nextdoor, added when the blog is published
    let total = null;  // clicks on the blog, from the counter

    const remembered = () => { try { return localStorage.getItem(key) === '1'; } catch (e) { return false; } };
    function show() {
        const done = remembered();
        btn.setAttribute('aria-pressed', done);
        btn.disabled = done;
        label.textContent = done ? 'Thanks for letting me know!' : 'This helped me';
        const all = (total || 0) + nextdoor;
        if (all) {
            countEl.textContent = (all === 1 ? '1 person found this helpful' : all.toLocaleString('en-GB') + ' people found this helpful')
                + (!nextdoor ? '' : total ? ` (${nextdoor.toLocaleString('en-GB')} on Nextdoor)` : ' on Nextdoor');
        }
    }

    fetch(box.dataset.api + '/counts')
        .then(r => r.json())
        .then(counts => { total = counts[tip] || 0; show(); })
        .catch(() => {});  // offline: just don't show a total

    btn.addEventListener('click', () => {
        if (remembered()) return;
        try { localStorage.setItem(key, '1'); } catch (e) {}
        if (total !== null) total += 1;
        show();
        fetch(box.dataset.api + '/helpful/' + tip, {method: 'POST'})
            .then(r => r.json())
            .then(d => { if (d.count) { total = d.count; show(); } })
            .catch(() => {});
    });

    show();
})();

// Tips lists (home and topic pages): add a thumbs-up total to each card that has one.
(function () {
    const list = document.querySelector('[data-helpful-api]');
    if (!list) return;
    // Blog clicks come live from the counter; Nextdoor likes are in the page. If the counter can't be
    // reached, the Nextdoor likes still show.
    const addBadges = counts => {
            list.querySelectorAll('.post-card[data-tip]').forEach(card => {
                const n = (counts[card.dataset.tip] || 0) + (parseInt(card.dataset.nextdoor, 10) || 0);
                const meta = card.querySelector('.meta');
                if (!n || !meta) return;
                const badge = document.createElement('span');
                badge.className = 'card-helped';
                badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6V3a1.5 1.5 0 0 0-.4-1L13 1 7.6 6.4A2 2 0 0 0 7 7.8V19a2 2 0 0 0 2 2h9a2 2 0 0 0 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7v-2z"/></svg>';
                badge.append(String(n));
                const sr = document.createElement('span');
                sr.className = 'visually-hidden';
                sr.textContent = n === 1 ? ' person found this helpful' : ' people found this helpful';
                badge.append(sr);
                meta.append(badge);
            });
    };
    fetch(list.dataset.helpfulApi + '/counts')
        .then(r => r.json())
        .then(addBadges)
        .catch(() => addBadges({}));
})();
