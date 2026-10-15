// Blog scripts, shared by every page (build_site.py copies this to site/site.js).

// Top menu: highlight the current page, and the "Menu" button on phones.
// Lucide icons (https://lucide.dev): LU(name) gives one. build_site.py fills in the ones this file uses (see icons.py).
const LUCIDE = {"check":"<path d=\"M20 6 9 17l-5-5\" />","thumbs-up":"<path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\" /><path d=\"M7 10v12\" />"};
const LU = (name, cls = '') => LUCIDE[name] ? `<svg class="l${cls ? ' ' + cls : ''}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LUCIDE[name]}</svg>` : '';

(function () {
    const links = [...document.querySelectorAll('.au a:not(.yh)')];
    const here = location.href.split('#')[0];
    const best = links.filter(a => here.startsWith(a.href)).sort((a, b) => b.href.length - a.href.length)[0];
    if (best) best.setAttribute('aria-current', 'page');

    const menuBtn = document.getElementById('z');
    const nav = document.getElementById('n');
    menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', open);
    });
})();

// Display options: text size, colours, easy-read font, spacing and link underlines.
// Each choice is saved on this device; "Match my device" follows the phone/computer setting.
(function () {
    const root = document.documentElement;
    const panel = document.getElementById('f');
    const btn = document.getElementById('v');
    const save = (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch (e) {} };

    function setOpen(open) {
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', open);
        if (open) document.getElementById('r').focus(); else btn.focus();
    }
    btn.addEventListener('click', () => setOpen(panel.hidden));
    document.getElementById('r').addEventListener('click', () => setOpen(false));
    document.getElementById('u').addEventListener('click', () => setOpen(false));
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

    document.getElementById('t').addEventListener('click', () => {
        ['text', 'theme', 'font', 'spacing', 'links'].forEach(k => delete root.dataset[k]);
        ['textSize', 'theme', 'font', 'spacing', 'links'].forEach(k => save(k, ''));
        refresh();
    });

    refresh();
})();

// Home page: tip search and topic filter.
// Search and topic filter. Without JavaScript every tip is still listed.
(function () {
    const cards = [...document.querySelectorAll('.bd')];
    const input = document.getElementById('av');
    if (!input) return;
    const buttons = [...document.querySelectorAll('.nu')];
    const results = document.getElementById('bj');
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
        buttons.forEach(x => x.classList.toggle('abv', x === b));
        apply();
    }));
})();

// Tech words page: word search.
(function () {
    const input = document.getElementById('au');
    if (!input) return;
    const words = [...document.querySelectorAll('.eh')];
    const groups = [...document.querySelectorAll('.cy')];
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        words.forEach(w => { w.hidden = q && !w.dataset.search.includes(q); shown += !w.hidden; });
        groups.forEach(g => { g.hidden = ![...g.querySelectorAll('.eh')].some(w => !w.hidden); });
        document.getElementById('bf').hidden = shown > 0;
    });
})();

// "Listen to this tip / lesson / page": reads the page aloud using the browser's built-in voice (no account or
// app needed), highlighting each paragraph as it's read. Skips practice phones, forms, buttons and menus.
// Hidden if the browser can't speak.
(function () {
    const btn = document.getElementById('w');
    if (!btn || !('speechSynthesis' in window)) return;
    btn.hidden = false;
    const label = btn.querySelector('span');
    const article = btn.closest('article') || document.querySelector('main') || document.body;
    const SKIP = '.dc, nav, form, button, .no-listen, .aq, .bs, .be, .dj, .cx, .ey, .z, .feedback, [hidden], noscript, script, .dy, .eb';

    function blocks() {
        if (btn.dataset.listen === 'post') return [article.querySelector('h1'), ...article.querySelectorAll('.dz li, article > p')];
        return [...article.querySelectorAll('h1, h2, h3, p, li, dt, dd, blockquote, figcaption')]
            .filter(el => !el.closest(SKIP) && !(el.matches('li') && el.querySelector('p, li')) && el.offsetParent !== null);
    }

    function stop() {
        speechSynthesis.cancel();
        btn.setAttribute('aria-pressed', 'false');
        label.textContent = btn.dataset.label || 'Listen';
        document.querySelectorAll('.ir').forEach(el => el.classList.remove('ir'));
    }

    btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') { stop(); return; }
        speechSynthesis.cancel();
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
        const els = blocks().filter(el => el && el.textContent.trim());
        els.forEach((el, i) => {
            const u = new SpeechSynthesisUtterance(el.textContent.replace(/\s+/g, ' ').trim());
            u.lang = 'en-GB';
            u.rate = 0.95;
            if (voice) u.voice = voice;
            u.onstart = () => {
                document.querySelectorAll('.ir').forEach(x => x.classList.remove('ir'));
                el.classList.add('ir');
                const r = el.getBoundingClientRect();
                if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
            };
            if (i === els.length - 1) u.onend = stop;
            speechSynthesis.speak(u);
        });
        btn.setAttribute('aria-pressed', 'true');
        label.textContent = 'Stop listening';
    });

    window.addEventListener('pagehide', () => speechSynthesis.cancel());
})();

// Tip pages: "Found this useful? Share it" buttons.
(function () {
    if (!document.querySelector('.dj')) return;
    document.querySelectorAll('.bk[data-open]').forEach(b => b.addEventListener('click', () => {
        window.open(b.dataset.open, '_blank', 'noopener');
    }));
    document.querySelectorAll('.bk[data-mail]').forEach(b => b.addEventListener('click', () => {
        window.location.href = b.dataset.mail;
    }));
    const copy = document.querySelector('.bk[data-copy]');
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
    const more = document.querySelector('.bk[data-native]');
    if (navigator.share) {
        more.hidden = false;
        more.addEventListener('click', () => {
            navigator.share({title: more.dataset.title, url: more.dataset.native}).catch(() => {});
        });
    }
})();

// Contact form and comment forms (Web3Forms): send in the background and show the result in place.
// Without JavaScript they still post normally and come back to the site.
document.querySelectorAll('#ax, .eg').forEach(form => {
    const status = form.querySelector('.dp');
    const button = form.querySelector('button[type="submit"]');
    const okText = form.dataset.ok || "Thanks, your message is on its way. I'll reply by email, usually within a few days.";

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (data.topic) data.subject = 'Blog message: ' + data.topic;
        delete data.redirect;
        button.disabled = true;
        status.className = 'dp';
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
            status.classList.add('aix');
            status.textContent = okText;
        } catch (err) {
            status.classList.add('aer');
            status.textContent = "Sorry, that didn't send. Please try again in a minute.";
        } finally {
            button.disabled = false;
        }
    });
});

// Tip pages: "This helped me". Counted by my own Cloudflare Worker (on my own web address, so ad
// blockers leave it alone). Once per browser, remembered on this device; nothing about the visitor is sent.
(function () {
    const box = document.getElementById('ap');
    if (!box) return;
    const btn = box.querySelector('.da');
    const label = box.querySelector('.dh');
    const countEl = box.querySelector('.dg');
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
            list.querySelectorAll('.bd[data-tip]').forEach(card => {
                const n = (counts[card.dataset.tip] || 0) + (parseInt(card.dataset.nextdoor, 10) || 0);
                const meta = card.querySelector('.meta');
                if (!n || !meta) return;
                const badge = document.createElement('span');
                badge.className = 'ny';
                badge.innerHTML = LU('thumbs-up');
                badge.append(String(n));
                const sr = document.createElement('span');
                sr.className = 'f';
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

// Learn: course progress (saved on this device), practice exercises and printing handouts.
(function () {
    const read = course => { try { return JSON.parse(localStorage.getItem('learn:' + course) || '[]'); } catch (e) { return []; } };
    const save = (course, list) => { try { localStorage.setItem('learn:' + course, JSON.stringify(list)); } catch (e) {} };

    // Lesson page: mark the lesson done when they move on, and show progress dots.
    const lesson = document.querySelector('article.lesson');
    if (lesson) {
        const course = lesson.dataset.course, slug = lesson.dataset.lesson;
        try { localStorage.setItem('learn-last', course); } catch (e) {}
        const done = read(course);
        lesson.querySelectorAll('.ba span').forEach(s => s.classList.toggle('done', done.includes(s.dataset.lesson)));
        const doneBtn = lesson.querySelector('.bl');
        // Lessons with a required practice phone: finish it before moving on (that's the proof it's been done).
        const sim = lesson.querySelector('.dc[data-required]');
        const simDone = () => { try { return !sim || localStorage.getItem('sim-done:' + sim.dataset.sim) === '1'; } catch (e) { return true; } };
        doneBtn.addEventListener('click', e => {
            if (!simDone()) {
                e.preventDefault();
                const note = document.getElementById('aa');
                note.hidden = false;
                sim.scrollIntoView({behavior: 'smooth', block: 'start'});
                return;
            }
            const list = read(course);
            if (!list.includes(slug)) { list.push(slug); save(course, list); }
        });
        if (sim) sim.addEventListener('sim:done', () => { document.getElementById('aa').hidden = true; });
    }

    // Learn list and course page: progress, "Carry on", ticks and the certificate.
    document.querySelectorAll('[data-course][data-lessons]').forEach(el => {
        const course = el.dataset.course;
        const all = el.dataset.lessons.split(',');
        const done = read(course).filter(s => all.includes(s));
        const finished = done.length === all.length;
        const progress = el.querySelector('.ci');
        const coming = parseInt(el.dataset.coming, 10) || 0;  // lessons not written yet
        if (progress && done.length) {
            progress.innerHTML = !finished ? `${done.length} of ${all.length} lessons done`
                : coming ? `You've done ${all.length === 1 ? 'the first lesson' : 'all ' + all.length + ' lessons'} so far. More coming soon!`
                : 'Completed ' + LU('check');
        }
        const go = el.querySelector('.ew');
        if (go && done.length) go.textContent = finished ? 'Look through it again →' : 'Carry on →';
        // Progress bar (cards and the course page).
        const bar = el.querySelector('.dv') || document.getElementById('an');
        if (bar && done.length) { bar.hidden = false; bar.firstElementChild.style.width = Math.round(100 * done.length / all.length) + '%'; }
        if (finished) el.classList.add('vi');
        if (!el.matches('article.gt')) return;

        el.querySelectorAll('.ct li').forEach(li => {
            const ok = done.includes(li.dataset.lesson);
            li.classList.toggle('done', ok);
            if (ok) li.querySelector('.aj').innerHTML = 'Done ' + LU('check');
        });
        const next = all.find(s => !done.includes(s));
        const goBtn = document.getElementById('ao');
        if (finished) {
            goBtn.textContent = 'Go through it again';
            const doneBox = document.getElementById('course-done');  // absent while lessons are still to come
            if (doneBox) doneBox.hidden = false;
        } else if (done.length) {
            const nextLi = el.querySelector(`.ct li[data-lesson="${next}"]`);
            goBtn.textContent = `Carry on: ${nextLi ? nextLi.querySelector('.bj strong').firstChild.textContent.trim() : 'next lesson'} →`;
            goBtn.href = next + '/';
        }
        if (!finished) {
            const upNext = el.querySelector(`.ct li[data-lesson="${next}"] .cc`);
            if (upNext) { upNext.hidden = false; upNext.closest('li').classList.add('next'); }
        }
        const date = el.querySelector('.fi');
        if (date) date.textContent = new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
        const pick = el.querySelector('.ol');
        if (pick) {
            const names = {windows: 'Windows', mac: 'a Mac', linux: 'Linux'};
            let now = null;
            try { now = localStorage.getItem('sim-os'); } catch (e) {}
            if (names[now]) {
                pick.querySelector('.uq').hidden = false;
                pick.querySelector('.uq strong').textContent = names[now];
                const cur = pick.querySelector(`[data-os="${now}"]`);
                if (cur) cur.classList.add('cb');
            }
            pick.querySelectorAll('[data-os]').forEach(b => b.addEventListener('click', () => {
                if (done.length && !confirm(`Start this course again on ${names[b.dataset.os]}? Your ticks for this course will be cleared.`)) return;
                try {
                    localStorage.setItem('sim-os', b.dataset.os);
                    pick.dataset.sims.split(',').filter(Boolean).forEach(s => localStorage.removeItem('sim-done:' + s));
                } catch (e) {}
                save(course, []);
                location.href = pick.dataset.first;
            }));
        }
        document.getElementById('am').addEventListener('click', () => {
            if (confirm('Clear your progress for this course on this device?')) { save(course, []); location.reload(); }
        });
    });

    // Learn page: "Carry on where you left off", from the course they last opened a lesson in.
    const cont = document.getElementById('aw');
    if (cont) {
        let last = null;
        try { last = localStorage.getItem('learn-last'); } catch (e) {}
        const card = last && document.querySelector(`.cd[data-course="${last}"]`);
        if (card) {
            const all = card.dataset.lessons.split(','), titles = card.dataset.titles.split('|');
            const done = read(last).filter(s => all.includes(s));
            const n = all.findIndex(s => !done.includes(s));
            if (n >= 0) {
                cont.href = `${last}/${all[n]}/`;
                cont.querySelector('.vj').innerHTML = card.querySelector('.cu').innerHTML;  // the course's icon
                cont.querySelector('strong').textContent = card.dataset.title;
                cont.querySelector('.rs > span').textContent = `Lesson ${n + 1} of ${all.length}: ${titles[n]}`;
                cont.hidden = false;
                const start = document.getElementById('ay');
                if (start) start.hidden = true;
            }
        }
    }

    // Quizzes: pick an answer, see straight away whether it's right and why.
    document.querySelectorAll('.abj').forEach(quiz => {
        const items = [...quiz.querySelectorAll('.ej')];
        const score = quiz.querySelector('.kj');
        let answered = 0, right = 0;
        items.forEach(item => {
            const buttons = [...item.querySelectorAll('.db button')];
            buttons.forEach(b => b.addEventListener('click', () => {
                if (item.classList.contains('answered')) return;
                item.classList.add('answered');
                const ok = b.hasAttribute('data-correct');
                buttons.forEach(x => {
                    x.disabled = true;
                    if (x.hasAttribute('data-correct')) x.classList.add('ss');
                });
                if (!ok) b.classList.add('st');
                b.setAttribute('aria-pressed', 'true');
                const explain = item.querySelector('.ed');
                const verdict = document.createElement('p');
                verdict.className = 'ns ' + (ok ? 'right' : 'afw');
                verdict.textContent = ok ? 'Right!' : 'Not quite.';
                explain.prepend(verdict);
                explain.hidden = false;
                explain.tabIndex = -1;
                explain.focus({preventScroll: true});
                answered += 1;
                right += ok;
                if (answered === items.length) {
                    score.textContent = `You got ${right} out of ${items.length}.` +
                        (right === items.length ? ' Brilliant!' : ' Have a read of the explanations, and try again any time.');
                }
            }));
        });
    });

    // "Find the warning signs": tap the suspicious parts of a message.
    document.querySelectorAll('.ace').forEach(hunt => {
        const flags = [...hunt.querySelectorAll('.flag')];
        const notes = hunt.querySelector('.pi');
        const count = hunt.querySelector('.tz');
        const update = () => {
            const n = flags.filter(f => f.classList.contains('found')).length;
            count.textContent = n === flags.length ? `You found all ${n}. Well spotted!` : `Found ${n} of ${flags.length}`;
        };
        const find = f => {
            if (f.classList.contains('found')) return;
            f.classList.add('found');
            f.setAttribute('aria-pressed', 'true');
            const li = document.createElement('li');
            li.textContent = f.dataset.note;
            notes.append(li);
            update();
        };
        flags.forEach(f => {
            f.setAttribute('aria-pressed', 'false');
            f.addEventListener('click', () => find(f));
        });
        hunt.querySelector('.acf').addEventListener('click', () => flags.forEach(find));
    });

    // Fill-in cards (emergency card, certificate). Only the certificate name is remembered on this device.
    document.querySelectorAll('.ea input[data-target]').forEach(input => {
        const out = document.getElementById(input.dataset.target);
        const blank = out.textContent;
        const remember = input.id === 'cert-name';
        if (remember) { try { input.value = localStorage.getItem('learn:name') || ''; } catch (e) {} }
        const sync = () => {
            out.textContent = input.value.trim() || blank;
            if (remember) { try { localStorage.setItem('learn:name', input.value.trim()); } catch (e) {} }
        };
        input.addEventListener('input', sync);
        sync();
    });

    // Print buttons: the whole lesson as a handout, or just the card or certificate.
    document.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.print !== 'page') document.body.dataset.printOnly = b.dataset.print;
        window.print();
    }));
    window.addEventListener('afterprint', () => { delete document.body.dataset.printOnly; });
})();

// Contact page opened from "Help for local groups" (#group): pick the group topic.
(function () {
    const option = document.getElementById('az');
    if (option && location.hash === '#group') option.selected = true;
})();
