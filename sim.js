// Practice phone for Learn lessons: a pretend iPhone or Android screen that people tap through, step by
// step. Nothing is real: no app is installed, nothing is sent anywhere, and the phone number is a made-up
// one from the range set aside for TV and films. Icons are simple drawings, not the real logos.
//
// A lesson adds <div class="sim" data-sim="NAME" data-required></div>. Each scenario below is a function
// (platform, ctx) => list of steps. A step has:
//   screen: ctx => HTML for the phone. Tappable things are <button data-tap="ID">.
//   say:    the instruction (HTML).
//   target: the ID to tap to move on. Taps on other buttons count as misses (hints[ID] explains them).
//   free:   IDs that only show their hint, without counting as a miss.
//   action: ctx => run when the target is tapped (e.g. fill in a field).
//   wait:   ms to show screen({...ctx, busy: true}) before the real screen (downloads, sending).
//   question: {q, options: [{t, ok, why}]} asked in the instructions panel instead of a tap.
//   done:   true on the last step.
(function () {
    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

    // ---------- Simple icons (my own drawings, not the companies' logos) ----------
    const ICON = {
        phone: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
        bubble: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1L4 21l4.1-1.8c1.2.4 2.5.6 3.9.6 5.5 0 10-3.8 10-8.4S17.5 3 12 3z"/></svg>',
        chat: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5z"/><circle cx="8" cy="12" r="1.4" fill="#1fa855"/><circle cx="12" cy="12" r="1.4" fill="#1fa855"/><circle cx="16" cy="12" r="1.4" fill="#1fa855"/></svg>',
        camera: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/></svg>',
        photos: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#fff"/><path d="m5 18 4.5-6 3.5 4.5 2.5-3L19 18z" fill="#3b82f6"/><circle cx="16" cy="8.5" r="1.8" fill="#f59e0b"/></svg>',
        settings: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>',
        clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff"/><path d="M12 7v5l3.5 2" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><path d="m4 7 8 6 8-6" stroke="#2563eb" stroke-width="2" fill="none"/></svg>',
        weather: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="4" fill="#fde047"/><path d="M8 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.5 1.5A3 3 0 0 0 8 19z" fill="#fff"/></svg>',
        map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.6" fill="#16a34a"/></svg>',
        storeIos: '<svg viewBox="0 0 24 24"><path d="M12 4.5 6 17M12 4.5 18 17M4.5 13.5h15" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
        storeAndroid: '<svg viewBox="0 0 24 24"><path d="M6 3.5v17l14-8.5z" fill="#fff"/><path d="M6 3.5v17l7-8.5z" fill="#c7f9e0"/></svg>',
        search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4" fill="#fff"/><path d="M4 20c1-4 4.5-6 8-6s7 2 8 6z" fill="#fff"/></svg>',
        star: '★',
    };
    // Small line icons for buttons (they take the button's text colour).
    const UI = {
        phone: '<svg viewBox="0 0 24 24" class="ui"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
        hangup: '<svg viewBox="0 0 24 24" class="ui"><path fill="currentColor" d="M12 9c-2.6 0-5 .5-7.3 1.4-.7.3-1.2 1-1.2 1.8v2.3c0 .8.7 1.4 1.5 1.3l3-.4c.7-.1 1.2-.7 1.2-1.4v-1.6c1.8-.5 3.8-.5 5.6 0V14c0 .7.5 1.3 1.2 1.4l3 .4c.8.1 1.5-.5 1.5-1.3v-2.3c0-.8-.5-1.5-1.2-1.8C17 9.5 14.6 9 12 9z"/></svg>',
        mic: '<svg viewBox="0 0 24 24" class="ui"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        micOff: '<svg viewBox="0 0 24 24" class="ui"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M4 4l16 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        flip: '<svg viewBox="0 0 24 24" class="ui"><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        video: '<svg viewBox="0 0 24 24" class="ui"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5" fill="currentColor"/><path d="m15.5 11 6-3.5v9l-6-3.5z" fill="currentColor"/></svg>',
        speaker: '<svg viewBox="0 0 24 24" class="ui"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        keypad: '<svg viewBox="0 0 24 24" class="ui">' + [5, 12, 19].map(y => [5, 12, 19].map(x => `<circle cx="${x}" cy="${y}" r="2" fill="currentColor"/>`).join('')).join('') + '</svg>',
        torch: '<svg viewBox="0 0 24 24" class="ui"><path d="M7 2h10v5l-3 4v11h-4V11L7 7z" fill="currentColor"/><path d="M11 13h2" stroke="#111" stroke-width="2"/></svg>',
        camera: '<svg viewBox="0 0 24 24" class="ui"><path fill="currentColor" d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/></svg>',
        clip: '<svg viewBox="0 0 24 24" class="ui"><path d="M8 12.5 14.5 6a3 3 0 0 1 4.2 4.2l-8 8a5 5 0 0 1-7-7L11 3.8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        plus: '<svg viewBox="0 0 24 24" class="ui"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
        send: '<svg viewBox="0 0 24 24" class="ui"><path d="M3 20.5 21 12 3 3.5l.1 6.6L15 12 3.1 13.9z" fill="currentColor"/></svg>',
        share: '<svg viewBox="0 0 24 24" class="ui"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11H5v10h14V11h-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
        heart: '<svg viewBox="0 0 24 24" class="ui"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
        bin: '<svg viewBox="0 0 24 24" class="ui"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
        pen: '<svg viewBox="0 0 24 24" class="ui"><path d="M4 20h4L19 9l-4-4L4 16z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
        dots: '<svg viewBox="0 0 24 24" class="ui"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
        info: '<svg viewBox="0 0 24 24" class="ui"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
        updates: '<svg viewBox="0 0 24 24" class="ui"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 2.5"/></svg>',
        people: '<svg viewBox="0 0 24 24" class="ui"><circle cx="9" cy="9" r="3.2" fill="currentColor"/><circle cx="16.5" cy="10" r="2.6" fill="currentColor"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5zM15 19c.3-2 1.2-3.5 1.8-4 2 0 3.8 1.3 4.2 4z" fill="currentColor"/></svg>',
        chat: '<svg viewBox="0 0 24 24" class="ui"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="currentColor"/></svg>',
        power: '<svg viewBox="0 0 24 24" class="ui"><path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
        gear: '<svg viewBox="0 0 24 24" class="ui"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        face: '<svg viewBox="0 0 64 64" class="ui"><path d="M14 22v-6a4 4 0 0 1 4-4h6M40 12h6a4 4 0 0 1 4 4v6M50 42v6a4 4 0 0 1-4 4h-6M24 52h-6a4 4 0 0 1-4-4v-6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M25 26v3M39 26v3M32 27v8h-3M25 42c4 3 10 3 14 0" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        finger: '<svg viewBox="0 0 64 64" class="ui"><g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"><path d="M18 46c-3-5-4-10-4-15a18 18 0 0 1 32-11"/><path d="M50 26c1 3 1 6 1 9"/><path d="M24 50c-2-5-4-11-4-17a12 12 0 0 1 24 0c0 4 0 8-1 11"/><path d="M31 54c-3-7-5-14-5-21a6 6 0 0 1 12 0c0 5-1 10-3 15"/><path d="M32 33c0 7 2 14 5 20"/></g></svg>',
        qr: '<svg viewBox="0 0 29 29" class="qr-svg" shape-rendering="crispEdges" aria-hidden="true"><rect width="29" height="29" fill="#fff"/>' +
            [[0, 0], [22, 0], [0, 22]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#111"/>`).join('') +
            [[9, 1], [11, 2], [13, 0], [15, 3], [9, 5], [12, 6], [16, 7], [18, 9], [9, 9], [1, 9], [3, 11], [5, 13], [10, 12], [12, 14], [14, 11], [17, 13], [20, 10], [23, 9], [25, 12], [27, 10], [22, 14], [24, 16], [26, 18], [9, 17], [11, 19], [13, 21], [15, 18], [17, 20], [19, 23], [21, 25], [23, 21], [25, 23], [27, 26], [10, 24], [12, 26], [14, 27], [16, 25], [1, 16], [3, 18], [5, 16], [7, 14], [19, 16], [21, 18], [26, 21], [13, 16], [18, 26], [24, 27], [6, 10], [2, 14]]
                .map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="#111"/>`).join('') + '</svg>',
    };
    const appIcon = (bg, svg) => `<span class="ph-icon" style="background:${bg}">${svg}</span>`;
    const WA_GREEN = '#1fa855';

    // ---------- Phone frame bits ----------
    const statusIcons = '<svg viewBox="0 0 18 12" class="st-sig" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>' +
        '<svg viewBox="0 0 16 12" class="st-wifi" aria-hidden="true"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.2 6.6a6.8 6.8 0 0 1 9.6 0l-1.4 1.5a4.8 4.8 0 0 0-6.8 0zM.8 4.2a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0z" fill="currentColor"/></svg>' +
        '<span class="ph-batt" aria-hidden="true"></span>';
    // The time, a camera cut-out (iPhone "Dynamic Island" or Android punch-hole) and signal, Wi-Fi and battery.
    // The person's own time and date (from their device), so the practice screens feel like their own.
    const fmt = (opts) => new Date().toLocaleString('en-GB', opts);
    const NOW = {
        time: () => fmt({hour: '2-digit', minute: '2-digit'}),                                   // 14:05
        date: () => fmt({day: '2-digit', month: '2-digit', year: 'numeric'}),                      // 16/10/2026
        long: () => fmt({weekday: 'long', day: 'numeric', month: 'long'}),                         // Thursday 16 October
        mac: () => fmt({weekday: 'short', day: 'numeric', month: 'short'}).replace(',', '') + ' ' + NOW.time(),  // Thu 16 Oct 14:05
        zone: tz => new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: tz}),
    };
    const statusBar = p => `<div class="ph-status ph-${p}"><span class="st-time">${NOW.time()}</span><span class="${p === 'ios' ? 'ph-island' : 'ph-punch'}" aria-hidden="true"></span><span class="ph-status-r">${statusIcons}</span></div>`;
    const keyboard = () => `<div class="ph-keys" aria-hidden="true">${['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(r =>
        `<div>${[...r].map(k => `<span>${k}</span>`).join('')}</div>`).join('')}<div><span class="wide">space</span></div></div>`;

    // ---------- WhatsApp setup ----------
    const NUMBER = '7700 900123';  // fictional (Ofcom drama range)
    const CODE = '482913';

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play Store'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Phone', '#22c55e', ICON.phone], ['messages', 'Messages', '#22c55e', ICON.bubble], ['camera', 'Camera', '#6b7280', ICON.camera],
               ['photos', 'Photos', '#e5e7eb', ICON.photos], ['mail', 'Mail', '#3b82f6', ICON.mail], ['clock', 'Clock', '#111827', ICON.clock],
               ['weather', 'Weather', '#38bdf8', ICON.weather], ['maps', 'Maps', '#22c55e', ICON.map], ['settings', 'Settings', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Phone', '#2563eb', ICON.phone], ['messages', 'Messages', '#3b82f6', ICON.bubble], ['camera', 'Camera', '#6b7280', ICON.camera],
               ['photos', 'Photos', '#e5e7eb', ICON.photos], ['clock', 'Clock', '#111827', ICON.clock], ['maps', 'Maps', '#16a34a', ICON.map],
               ['settings', 'Settings', '#475569', ICON.settings], ['weather', 'Weather', '#38bdf8', ICON.weather], ['mail', 'Email', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="ph-pull" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Swipe down from the top-right corner ⌄' : 'Swipe down from the top ⌄'}</button>` : '';
        // The first four apps sit in the dock at the bottom, like a real home screen.
        const dockIds = ['phone', 'messages', 'camera', 'photos'];
        const appBtn = ([id, label, bg, svg], inDock) =>
            `<button type="button" class="ph-app" ${hold.includes(id) ? 'data-hold' : 'data-tap'}="${id}">${appIcon(bg, svg)}${inDock && p === 'ios' ? `<span class="visually-hidden">${label}</span>` : `<span>${label}</span>`}</button>`;
        return `<div class="ph-home ph-${p}">${statusBar(p)}${pull}
            <div class="ph-grid">${apps.filter(a => !dockIds.includes(a[0])).map(a => appBtn(a, false)).join('')}</div>
            <div class="ph-dock">${apps.filter(a => dockIds.includes(a[0])).map(a => appBtn(a, true)).join('')}</div>
            ${p === 'android' ? '<div class="ph-navpill"></div>' : '<div class="ph-homebar"></div>'}</div>`;
    }

    function storeHome(p) {
        if (p === 'ios') {
            return `<div class="ph-app-screen ph-ios">${statusBar(p)}
                <div class="st-title">Today</div>
                <div class="st-card"><span>FEATURED</span><strong>Apps we love this week</strong></div>
                <div class="st-card alt"><span>GET STARTED</span><strong>Ideas for your new iPhone</strong></div>
                <div class="st-tabs">
                    <button type="button" data-tap="today" class="on">Today</button><button type="button" data-tap="games">Games</button>
                    <button type="button" data-tap="apps">Apps</button><button type="button" data-tap="search-tab">${ICON.search}Search</button>
                </div><div class="ph-homebar"></div></div>`;
        }
        return `<div class="ph-app-screen ph-android">${statusBar(p)}
            <button type="button" class="st-searchbar" data-tap="search-bar">${ICON.search}<span>Search apps &amp; games</span></button>
            <div class="st-chips"><span class="on">For you</span><span>Top charts</span><span>Kids</span></div>
            <div class="st-card"><span>SUGGESTED FOR YOU</span><strong>Apps to get you started</strong></div>
            <div class="st-card alt"><span>POPULAR</span><strong>Stay in touch</strong></div>
            <div class="ph-navpill"></div></div>`;
    }

    function storeSearch(p) {
        const sugg = ['whatsapp', 'whatsapp messenger', 'whatsapp business'];
        return `<div class="ph-app-screen ph-${p}">${statusBar(p)}
            <div class="st-searchfield">${ICON.search}<span>whatsapp<span class="caret"></span></span></div>
            <div class="st-sugg">${sugg.map(s => `<button type="button" data-tap="sugg-${s.replace(/ /g, '-')}">${ICON.search}<span>${s}</span></button>`).join('')}</div>
            ${keyboard()}</div>`;
    }

    function results(p, ctx) {
        const btnLabel = p === 'ios' ? 'Get' : 'Install';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5B+ downloads' : 'Social Networking'},
            {id: 'fake2', name: 'WA Messenger for Chat Pro', dev: 'LuckyDev Studio', rating: '3.4', bg: '#22c55e'},
        ];
        const button = r => {
            if (r.id === 'real' && ctx.busy) return '<span class="st-get busy" aria-label="Downloading"><span class="ring"></span></span>';
            if (r.id === 'real' && ctx.installed) return `<button type="button" class="st-get" data-tap="open">Open</button>`;
            return `<button type="button" class="st-get" data-tap="${r.id}-get">${btnLabel}</button>`;
        };
        return `<div class="ph-app-screen ph-${p}">${statusBar(p)}
            <div class="st-searchfield small">${ICON.search}<span>whatsapp messenger</span></div>
            <div class="st-results">${rows.map(r => `<div class="st-row">
                ${appIcon(r.bg, ICON.chat)}
                <div class="st-info"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="st-ad">Ad</em>' : ''}</span>
                <span class="st-meta">${r.rating} ${ICON.star}${r.note ? ' · ' + r.note : ''}</span></div>
                ${button(r)}</div>`).join('')}</div>
            ${ctx.sheet ? `<div class="ph-sheet"><div class="ph-sheet-box">
                <div class="st-row">${appIcon(WA_GREEN, ICON.chat)}<div class="st-info"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Free</span></div></div>
                <p class="ph-note">On your real iPhone, you may need to double-click the side button, look at the screen for Face ID, or type your Apple Account password here.</p>
                <button type="button" class="ph-btn ios-blue" data-tap="sheet-install">Install</button>
                <button type="button" class="ph-btn-text" data-tap="sheet-cancel">Cancel</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="ph-app-screen wa ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ph-navpill"></div>' : '<div class="ph-homebar"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="wa-welcome">
            <div class="wa-hero">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Welcome to WhatsApp</h3>
            <p>Read our <u>Privacy Policy</u>. Tap "Agree and continue" to accept the <u>Terms of Service</u>.</p>
            <button type="button" class="ph-btn wa-btn" data-tap="agree">Agree and continue</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="wa-form">
            <h3>Enter your phone number</h3>
            <p>WhatsApp will need to check your phone number. Carrier charges may apply.</p>
            <div class="wa-country">United Kingdom <span>▾</span></div>
            <div class="wa-numrow"><span class="wa-cc">+44</span>
                <button type="button" class="wa-field${ctx.number ? ' filled' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="ph-placeholder">phone number</span>'}</button></div>
            <button type="button" class="ph-btn wa-btn" data-tap="next">Next</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="ph-dialog-wrap"><div class="ph-dialog ${ios ? 'ios' : 'android'}">
                <p>Is this the correct number?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="ph-dialog-btns"><button type="button" data-tap="edit">Edit</button><button type="button" data-tap="yes">${ios ? 'Yes' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="ph-notif" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="ph-notif static"><strong>MESSAGES · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="ph-autofill"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="wa-form${notice ? ' under-banner' : ''}">
            <h3>Verifying your number</h3>
            <p>Waiting to automatically detect a 6-digit code sent by SMS to <strong>+44 ${NUMBER}</strong>.</p>
            <div class="wa-code">${boxes}</div>
            <p class="ph-small">Didn't receive a code?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['"WhatsApp" Would Like to Access Your Contacts', 'So you can see which of your friends use WhatsApp.', 'Allow WhatsApp to access your contacts?']
            : ['"WhatsApp" Would Like to Send You Notifications', 'So you know when a new message arrives.', 'Allow WhatsApp to send you notifications?'];
        const dialog = p === 'ios'
            ? `<div class="ph-dialog ios"><p><strong>${text[0]}</strong></p><p class="ph-small">${text[1]}</p>
                <div class="ph-dialog-btns"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="ph-dialog android"><p><strong>${text[2]}</strong></p>
                <div class="ph-dialog-btns col"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="ph-dialog-wrap">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="wa-form">
            <h3>Profile info</h3>
            <p>Please type your name and add a profile photo if you'd like.</p>
            <button type="button" class="wa-photo" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="wa-name"><span class="visually-hidden">Your name</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ph-btn wa-btn" data-tap="next">Next</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Chats' : 'WhatsApp';
        return waScreen(p, `<div class="wa-top ${p}"><strong>${title}</strong></div>
            <div class="wa-empty">${appIcon(WA_GREEN, ICON.chat)}
            <h3>You're all set${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Your chats will appear here. Tap the new chat button to message someone in your contacts.</p></div>
            <span class="wa-fab" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `This is your phone's home screen. Apps are downloaded from the <strong>${store}</strong>. It's free, and it's the safe place to get apps. <strong>Tap ${store}.</strong>`,
                 hint: `Look for the ${store} icon. ${p === 'ios' ? "It's blue with a white letter A." : "It's a coloured triangle."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Now you need to search for WhatsApp. <strong>Tap Search</strong>, at the bottom right.' : 'Now you need to search for WhatsApp. <strong>Tap the search bar</strong> at the top.',
                 hint: p === 'ios' ? 'Search is the magnifying glass at the bottom right.' : 'The search bar says "Search apps & games".'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "We've typed <em>whatsapp</em> for you. A list of suggestions appears. <strong>Tap \"whatsapp messenger\".</strong>",
                 hint: 'Tap the suggestion that says "whatsapp messenger".'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Careful: some apps pretend to be WhatsApp. The real one is called <strong>WhatsApp Messenger</strong>, made by <strong>WhatsApp Inc.</strong>, and it's free. <strong>Tap ${p === 'ios' ? 'Get' : 'Install'} next to the real one.</strong>`,
                 hints: {'fake1-get': 'That\'s "WhatsUp Chat Free" by Fun Apps Ltd. It\'s a lookalike, and the "Ad" label means it\'s an advert. Check the name and who made it.',
                         'fake2-get': 'That\'s "WA Messenger for Chat Pro" by LuckyDev Studio, a copycat. The real one is made by WhatsApp Inc.'},
                 hint: 'Find "WhatsApp Messenger" made by "WhatsApp Inc."'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Your iPhone checks it\'s really you before installing. On a real iPhone you might use <strong>Face ID</strong>, your <strong>fingerprint</strong> (Touch ID), or your <strong>Apple Account password</strong>. Here, just <strong>tap Install.</strong>',
                    hints: {'sheet-cancel': 'Cancel would stop the download. Tap Install instead.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `It's downloading. When it's finished, the button changes to <strong>Open</strong>. <strong>Tap Open.</strong>`,
                 hint: 'Wait for the button to say Open, then tap it.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp opens for the first time. It asks you to agree to its terms. <strong>Tap "Agree and continue".</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp uses your mobile number, so your friends can find you. <strong>Tap the phone number box</strong> and we\'ll fill in a practice number.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `On a real phone you'd type your own mobile number. Here we've used a made-up one: <strong>07700 900123</strong>. <strong>Tap Next.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp checks you typed it correctly. This one's right, so <strong>tap ${p === 'ios' ? 'Yes' : 'OK'}.</strong>`,
                 hints: {edit: `You'd tap Edit if you'd made a mistake. This number's right, so tap ${p === 'ios' ? 'Yes' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp sends a text with a 6-digit code, to check the number is yours. Your iPhone offers to fill it in for you. <strong>Tap the code above the keyboard.</strong>'
                    : 'WhatsApp sends a text with a 6-digit code, to check the number is yours. Many Android phones fill it in by themselves. If yours doesn\'t, <strong>tap the message</strong> at the top.'},
                {screen: c => waCode(p, c),
                 question: {q: 'While you\'re setting up, a friend messages you: <em>"Hi! I sent you a 6-digit code by mistake, can you send it back to me?"</em> What do you do?',
                    options: [
                        {t: 'Send it, they\'re a friend', why: 'This is a common scam. Someone has taken over your friend\'s account, and that code would hand them yours too.'},
                        {t: 'Don\'t send it. Nobody should ever ask for it', ok: true, why: 'Exactly. That code is the key to your WhatsApp. Never share it with anyone, even a friend or someone saying they\'re from WhatsApp.'},
                        {t: 'Send just the first 3 digits', why: 'Even part of the code helps a scammer. Never share any of it.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp asks to see your contacts, so it can show you which friends use WhatsApp. <strong>Tap Allow.</strong>',
                 hints: {deny: 'You can choose not to allow it, but then WhatsApp can\'t show your friends\' names. For this practice, tap Allow.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Notifications tell you when a message arrives, even when WhatsApp is closed. <strong>Tap Allow.</strong>',
                 hints: {deny: 'Without notifications you won\'t know when someone messages you. Tap Allow for this practice.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Last step: your name is what your friends see. <strong>Type your first name in the box</strong>, then <strong>tap Next</strong>. (It stays on this page and isn\'t sent anywhere.)',
                 hints: {photo: 'In the real app you can choose a photo now, or add one later in Settings. Let\'s skip it for now: type your name and tap Next.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Well done, you\'ve set up WhatsApp!</strong> Your chats will appear here. In the next lessons you\'ll send your first message.'},
            ];
        },
    };

    // ---------- Unlocking your phone: passcode, face and fingerprint ----------
    // Android follows Google Pixel's menus; the lesson text says where Samsung keeps the same settings.
    const PRACTICE_CODE = ['4', '7', '1', '9', '3', '6'];  // shown on screen, never the reader's real code
    const CODE_KEYS = PRACTICE_CODE.map(d => 'k' + d);
    const codeText = PRACTICE_CODE.join(' ');

    const homeIndicator = p => p === 'android' ? '<div class="ph-navpill"></div>' : '<div class="ph-homebar"></div>';
    const setIcon = (bg, letter) => `<span class="set-ic" style="background:${bg}">${letter}</span>`;

    function settingsList(p, ctx) {
        if (p === 'ios') {
            const lockName = ctx.touch ? 'Touch ID &amp; Passcode' : 'Face ID &amp; Passcode';
            const groups = [
                [['airplane', 'Airplane Mode', '#f59e0b', '✈'], ['wifi', 'Wi-Fi', '#3b82f6', 'W'], ['bluetooth', 'Bluetooth', '#3b82f6', 'B'], ['mobile', 'Mobile Service', '#22c55e', 'M']],
                [['notifications', 'Notifications', '#ef4444', 'N'], ['sounds', 'Sounds &amp; Haptics', '#ec4899', 'S'], ['focus', 'Focus', '#6366f1', 'F']],
                [['general', 'General', '#8e8e93', 'G'], ['accessibility', 'Accessibility', '#3b82f6', 'A'], ['ai', 'Apple Intelligence &amp; Siri', '#a855f7', '✦'], ['display', 'Display &amp; Brightness', '#3b82f6', 'D'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '◎' : '☺'], ['sos', 'Emergency SOS', '#ef4444', 'S'],
                 ['privacy', 'Privacy &amp; Security', '#3b82f6', 'P'], ['battery', 'Battery', '#22c55e', 'B']],
                [['apps', 'Apps', '#6366f1', '▦']],
            ];
            const account = `<div class="set-group"><button type="button" class="set-row account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="set-text"><strong>Margaret Smith</strong><small>Apple Account, iCloud and more</small></span><span class="set-chev">›</span></button></div>`;
            return `<div class="set-screen ios">${statusBar(p)}<div class="set-scroll">
                <div class="set-big">Settings</div>${account}
                ${groups.map(g => `<div class="set-group">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="set-row" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="set-chev">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Network &amp; internet', 'Mobile, Wi-Fi, hotspot'], ['devices', 'Connected devices', 'Bluetooth, pairing'],
            ['apps', 'Apps', 'Recent apps, default apps'], ['notifications', 'Notifications', 'Notification history'], ['battery', 'Battery', '85%'], ['storage', 'Storage', '91% used'],
            ['sound', 'Sound &amp; vibration', 'Volume, haptics'], ['display', 'Display &amp; touch', 'Dark theme, font size'],
            ['accessibility', 'Accessibility', 'Display, interaction, audio'], ['security', 'Security &amp; privacy', 'App security, device lock, permissions'],
            ['location', 'Location', 'On'], ['safety', 'Safety &amp; emergency', 'Emergency SOS, medical info, alerts'],
            ['google', 'Google', 'Services &amp; preferences'], ['system', 'System', 'Languages, time, software updates']];
        return `<div class="set-screen android">${statusBar(p)}<div class="set-scroll">
            <div class="set-big">Settings</div>
            <div class="set-search">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="set-row" data-tap="${id}">${setIcon('#e0e7ff', '<span class="dot"></span>')}
                <span class="set-text"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID &amp; Passcode' : 'Face ID &amp; Passcode';
        const bio = ctx.touch
            ? `<div class="set-caption">FINGERPRINTS</div><div class="set-group">
                ${ctx.fingerDone ? '<div class="set-row static"><span>Finger 1</span></div>' : ''}
                <button type="button" class="set-row link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="set-group">${ctx.faceDone
                ? '<div class="set-row static"><span>Reset Face ID</span></div><div class="set-row static"><span>Set Up an Alternative Appearance</span></div>'
                : '<button type="button" class="set-row link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="set-screen ios">${statusBar('ios')}<div class="set-scroll">
            <div class="set-nav ios"><span class="set-back">‹ Settings</span><strong>${title}</strong></div>
            <div class="set-caption">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="set-group"><div class="set-row static"><span>iPhone Unlock</span><span class="toggle${unlockOn ? ' on' : ''}"></span></div>
                <div class="set-row static"><span>iTunes &amp; App Store</span><span class="toggle${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="set-group">${ctx.passcodeSet
                ? '<div class="set-row static"><span>Turn Passcode Off</span></div><div class="set-row static"><span>Change Passcode</span></div>'
                : '<button type="button" class="set-row link" data-tap="passcode-on">Turn Passcode On</button>'}</div>
            <div class="set-group"><button type="button" class="set-row" data-tap="stolen"><span>Stolen Device Protection</span><span class="set-val">Off ›</span></button></div>
            </div>${homeIndicator('ios')}</div>`;
    }

    function keypad(p) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
        return `<div class="pin-pad ${p}">${keys.map(k => k
            ? `<button type="button" class="pin-key" data-tap="k${k}" aria-label="${k}">${k}</button>`
            : '<span></span>').join('')}</div>`;
    }

    function codeScreen(p, ctx, title, sub, extra = '') {
        const filled = ctx.full ? 6 : (ctx.pos || 0);
        const dots = [0, 1, 2, 3, 4, 5].map(n => `<span class="${n < filled ? 'on' : ''}"></span>`).join('');
        return `<div class="code-screen ${p}">${statusBar(p)}
            <div class="code-head"><strong>${title}</strong><p>${sub}</p></div>
            <div class="code-dots" aria-label="${filled} of 6 digits entered">${dots}</div>
            ${extra}${keypad(p)}${homeIndicator(p)}</div>`;
    }

    function androidList(title, rows, back = true) {
        return `<div class="set-screen android">${statusBar('android')}<div class="set-scroll">
            <div class="set-nav android">${back ? '<span class="set-back">←</span>' : ''}<strong>${title}</strong></div>
            ${rows.map(([id, label, sub]) => id
                ? `<button type="button" class="set-row" data-tap="${id}"><span class="set-text"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`
                : `<div class="set-row static"><span class="set-text"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></div>`).join('')}
            </div>${homeIndicator('android')}</div>`;
    }

    const androidSecurity = () => androidList('Security &amp; privacy', [
        ['device-unlock', 'Device unlock', 'Screen lock, Face &amp; Fingerprint Unlock'], ['app-security', 'App security', 'Scan apps for harmful behaviour'],
        ['theft', 'Theft protection', 'Lock your phone if it\'s stolen'], ['privacy', 'Privacy', 'Permissions, account activity']]);
    const androidDeviceUnlock = ctx => androidList('Device unlock', [
        ['screen-lock', 'Screen lock', ctx.passcodeSet ? 'PIN' : 'None'], ['face-finger', 'Face &amp; Fingerprint Unlock', ctx.faceDone || ctx.fingerDone ? 'Set up' : 'Set up to unlock faster']]);
    const androidFaceFinger = ctx => androidList('Face &amp; Fingerprint Unlock', [
        ['face-unlock', 'Face Unlock', ctx.faceDone ? 'Face added' : 'Set up'], ['fingerprint-unlock', 'Fingerprint Unlock', ctx.fingerDone ? '1 fingerprint' : 'Set up']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'First Face ID scan complete.' : 'Face ID is now set up.') : 'Face added';
        const btn = p === 'ios' ? (first ? 'Continue' : 'Done') : 'Done';
        return `<div class="scan-screen ${p}">${statusBar(p)}
            <div class="scan-ring${ctx.busy ? ' going' : ' complete'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Move your head slowly to complete the circle.' : 'Keep your face in the circle and move your head slowly.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Complete' : 'Adjust Your Grip') : (stage === 'grip' ? 'Adjust Your Grip' : 'Place Your Finger'))
            : (ready ? 'Fingerprint added' : 'Touch the sensor');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Your fingerprint can now be used to unlock your iPhone.' : 'Now place the edges of your fingertip on the Home button.')
                     : (stage === 'grip' ? 'Rest the edges of your fingertip on the Home button.' : 'Lift and rest your finger on the Home button repeatedly.'))
            : (ready ? 'You can now use your fingerprint to unlock your phone.' : 'Touch the sensor, lift, and touch it again until the fingerprint is full.');
        const sensor = p === 'ios'
            ? '<button type="button" class="home-sensor" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="screen-sensor" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="finger-screen ${p}">${statusBar(p)}
            <div class="code-head"><strong>${head}</strong><p>${sub}</p></div>
            <div class="finger-print" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="continue">${p === 'ios' ? 'Continue' : 'Done'}</button>` : sensor}
            ${p === 'ios' ? '' : homeIndicator(p)}</div>`;
    }

    function consent(p, title, text, agree) {
        return `<div class="scan-screen ${p}">${statusBar(p)}
            <div class="code-head"><strong>${title}</strong><p>${text}</p></div>
            <div class="consent-art">${UI.face}</div>
            <button type="button" class="ph-btn and-green" data-tap="agree">${agree}</button>
            <button type="button" class="ph-btn-text and" data-tap="cancel">Cancel</button>
            ${homeIndicator(p)}</div>`;
    }

    // Steps used by all three: from the home screen into the right settings page.
    function openLockSettings(p, ctx) {
        if (p === 'ios') {
            return [
                {screen: () => home(p), target: 'settings',
                 say: 'Passcode, Face ID and Touch ID are all in the <strong>Settings</strong> app. <strong>Tap Settings</strong> (the grey cog).',
                 hint: 'Settings is the grey icon with a cog.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Scroll down the list if you need to, and <strong>tap ${ctx.touch ? 'Touch ID &amp; Passcode' : 'Face ID &amp; Passcode'}</strong>.`,
                 hint: `Look for "${ctx.touch ? 'Touch ID & Passcode' : 'Face ID & Passcode'}", below Display & Brightness.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Screen lock, Face Unlock and fingerprints are all in the <strong>Settings</strong> app. <strong>Tap Settings</strong> (the cog).',
             hint: 'Settings is the icon with a cog.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Scroll down if you need to, and <strong>tap Security &amp; privacy</strong>. <em>On a Samsung, it\'s called Security and privacy, then Biometrics or Lock screen.</em>',
             hint: 'Look for "Security & privacy" near the bottom of the list.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Tap Device unlock.</strong>',
             hint: 'It\'s the first option, "Device unlock".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Enter Passcode' : 'Enter your PIN', p === 'ios' ? '' : 'To continue, enter your PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}Your phone checks it's you first. <strong>Type the practice code: ${codeText}</strong>. <em>Never type your real passcode on a website.</em>`,
        hint: `Type the practice code ${codeText}, one number at a time.`,
    });

    const safestQuestion = {
        q: 'Which of these would make the <strong>safest</strong> passcode?',
        options: [
            {t: '123456', why: '123456 is the most commonly used passcode of all, so it\'s one of the first a thief would try.'},
            {t: 'Your birthday, like 140352', why: 'Birthdays are easy to find out, from social media, cards or post. Avoid dates that mean something.'},
            {t: 'Six numbers that mean nothing to anyone else', ok: true, why: 'Exactly. Random numbers that aren\'t a date, a pattern or a repeat are the hardest to guess.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'This phone has no passcode yet, so anyone could open it. <strong>Tap Turn Passcode On.</strong>',
                 hints: {stolen: 'Stolen Device Protection is covered in lesson 4. First, turn the passcode on.'}},
                {screen: c => codeScreen(p, c, 'Set Passcode', 'Enter a passcode', '<p class="code-opt">Passcode Options</p>'), sequence: CODE_KEYS,
                 say: `Choose 6 numbers you'll remember. For this practice, <strong>type ${codeText}</strong>. <em>Please don't type your real passcode here.</em>`,
                 hint: `Type ${codeText}, one number at a time.`},
                {screen: c => codeScreen(p, c, 'Set Passcode', 'Re-enter your new passcode'), sequence: CODE_KEYS,
                 say: `Your iPhone asks again, to make sure you didn't make a mistake. <strong>Type ${codeText} again.</strong>`,
                 hint: `Type ${codeText} again.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Well done, your practice phone now has a passcode!</strong> On a real iPhone, you may also be asked for your Apple Account password at this point.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Screen lock says <strong>None</strong>, so anyone could open this phone. <strong>Tap Screen lock.</strong>'},
            {screen: () => androidList('Choose screen lock', [['none', 'None'], ['swipe', 'Swipe'], ['pattern', 'Pattern'], ['pin', 'PIN'], ['password', 'Password']]),
             target: 'pin', say: 'There are a few choices. A <strong>PIN</strong> (numbers) is easy and secure. <strong>Tap PIN.</strong>',
             hints: {none: 'None means anyone can open your phone.', swipe: 'Swipe just opens the phone with a swipe, so it doesn\'t protect anything.',
                     pattern: 'Patterns can be guessed from the smudges your finger leaves on the screen. A PIN is safer.',
                     password: 'A password works too, but a PIN is quicker to type every day. Tap PIN for this practice.'}},
            {screen: c => codeScreen(p, c, 'Choose a PIN', 'PIN must be at least 4 digits'), sequence: CODE_KEYS,
             say: `6 numbers are safer than 4. For this practice, <strong>type ${codeText}</strong>. <em>Please don't type your real PIN here.</em>`,
             hint: `Type ${codeText}, one number at a time.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Choose a PIN', 'PIN must be at least 4 digits', '<button type="button" class="ph-btn and-green small" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Tap Next.</strong>'},
            {screen: c => codeScreen(p, c, 'Re-enter your PIN', ''), sequence: CODE_KEYS,
             say: `Your phone asks again, to make sure you didn't make a mistake. <strong>Type ${codeText} again.</strong>`, hint: `Type ${codeText} again.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Re-enter your PIN', '', '<button type="button" class="ph-btn and-green small" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Tap Confirm.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Notifications on lock screen', [['show-all', 'Show all notification content'], ['hide-sensitive', 'Hide sensitive content'], ['dont-show', 'Don\'t show notifications at all']], false),
             target: 'hide-sensitive',
             say: 'Your phone asks what messages should show on the locked screen. <strong>Hide sensitive content</strong> is a good choice: you\'ll see that a message arrived, but not what it says. <strong>Tap it.</strong>',
             hints: {'show-all': 'That shows everything, including codes from your bank, to anyone who picks up your phone. Tap "Hide sensitive content".',
                     'dont-show': 'That works, but you won\'t see when messages arrive. For this practice, tap "Hide sensitive content".'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Well done, your practice phone now has a PIN!</strong> Screen lock now says PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Tap Set Up Face ID.</strong>'},
                {screen: () => `<div class="scan-screen ios">${statusBar('ios')}<div class="code-head"><strong>How to Set Up Face ID</strong>
                    <p>First, position your face in the camera frame. Then move your head in a circle to show all the angles of your face.</p></div>
                    <div class="consent-art">${UI.face}</div><button type="button" class="ph-btn ios-blue" data-tap="get-started">Get Started</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Hold your phone in front of your face, about an arm\'s length away, like you\'re taking a selfie. <strong>Tap Get Started.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'On a real iPhone you now <strong>move your head slowly in a circle</strong>, as if drawing a circle with your nose. The ring fills as it scans. When it\'s done, <strong>tap Continue</strong>.',
                 hint: 'Wait for the circle to fill, then tap Continue.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'It scans a second time, to be sure. Move your head in a circle again. When it\'s finished, <strong>tap Done</strong>.',
                 hint: 'Wait for the circle to fill, then tap Done.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'A friend asks to add <em>their</em> face to your phone, "just in case". What do you do?',
                    options: [
                        {t: 'Let them, it\'s handy', why: 'Anyone whose face is set up can open your phone and approve payments in your apps. Only set up your own face.'},
                        {t: 'Say no. Only my face should unlock my phone', ok: true, why: 'Exactly. If someone you trust needs to get in, share your passcode with them instead, and change it afterwards if you need to.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Well done, Face ID is set up!</strong> Now you can unlock your phone just by looking at it, then swiping up.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Tap Face &amp; Fingerprint Unlock.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Tap Face Unlock.</strong>',
             hints: {'fingerprint-unlock': 'That\'s fingerprints, which is lesson 3. For now, tap Face Unlock.'}},
            {screen: () => consent(p, 'Unlock with your face', 'Use your face to unlock your phone and confirm it\'s you in apps. Your face is stored only on this phone.', 'I agree'),
             target: 'agree', say: 'Your phone explains how it uses your face. <strong>Tap I agree.</strong>',
             hints: {cancel: 'Cancel would stop the setup. Tap I agree to carry on.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Hold your phone at eye level, about an arm\'s length away. On a real phone you <strong>keep your face in the circle and move your head slowly</strong>. When it\'s finished, <strong>tap Done</strong>.',
             hint: 'Wait for the circle to fill, then tap Done.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'On many Android phones, Face Unlock is less secure than a fingerprint. What does that mean for you?',
                options: [
                    {t: 'It\'s fine for everything', why: 'On many phones, face unlock uses an ordinary camera that can be fooled more easily. Some banking apps won\'t accept it for that reason.'},
                    {t: 'Use it for unlocking, and use a fingerprint or PIN for banking if your bank asks', ok: true, why: 'That\'s right. Your phone will tell you if Face Unlock can be used for payments and banking. If it can\'t, use your fingerprint or PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Well done, Face Unlock is set up!</strong> Now you can unlock your phone by looking at it.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Tap Add a Fingerprint…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID uses the <strong>Home button</strong> on the front of older iPhones, like the iPhone SE. <strong>Tap the Home button at the bottom of the practice phone, 6 times</strong>, as if lifting and resting your finger.',
                 hint: 'Tap the round Home button at the bottom of the practice phone.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Now it needs the edges of your fingertip. <strong>Tap Continue.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'On a real iPhone, you rest the <strong>sides and tip</strong> of your finger on the button. <strong>Tap the Home button 4 more times.</strong>',
                 hint: 'Tap the round Home button at the bottom.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'All done. <strong>Tap Continue.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Which finger is best to add first?',
                    options: [
                        {t: 'The thumb or finger you use most to hold your phone', ok: true, why: 'Yes. For a Home button, that\'s usually your thumb. You can add up to 5 fingers, so it\'s worth adding both thumbs.'},
                        {t: 'Any finger, it doesn\'t matter', why: 'It works with any finger, but choose the one that naturally rests on the button when you pick up your phone, usually a thumb.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Well done, your fingerprint is set up!</strong> Rest your finger on the Home button to unlock. You can add more fingers the same way.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Tap Face &amp; Fingerprint Unlock.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Tap Fingerprint Unlock.</strong>',
             hints: {'face-unlock': 'That\'s face unlocking, from lesson 2. For now, tap Fingerprint Unlock.'}},
            {screen: () => consent(p, 'Unlock with fingerprint', 'Use your fingerprint to unlock your phone or confirm it\'s you, like when you sign in to apps. Your fingerprint is stored only on this phone.', 'I agree'),
             target: 'agree', say: '<strong>Tap I agree.</strong>', hints: {cancel: 'Cancel would stop the setup. Tap I agree to carry on.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'The sensor might be on the screen, the back of the phone or the power button, and your phone shows you where. Here it\'s on the screen. <strong>Tap the sensor 6 times</strong>, as if lifting and resting your finger.',
             hint: 'Tap the round sensor near the bottom of the screen.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Your fingerprint is recorded. <strong>Tap Done.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Which finger is best to add first?',
                options: [
                    {t: 'The finger that naturally touches the sensor when you pick up your phone', ok: true, why: 'Yes. For a sensor on the back that\'s usually a forefinger, and for one on the screen or side, a thumb. You can add more than one.'},
                    {t: 'Any finger, it doesn\'t matter', why: 'Any finger works, but choose the one that naturally lands on the sensor. It makes unlocking quick and easy.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Well done, your fingerprint is set up!</strong> Touch the sensor to unlock. You can add more fingers the same way.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Sunflowers in the garden', '#fde68a'], ['🐶', 'The dog on the sofa', '#fecaca'], ['🏖️', 'A day at the beach', '#bae6fd'],
                    ['🎂', 'A birthday cake', '#fbcfe8'], ['🌅', 'Sunset over the sea', '#fed7aa'], ['🐈', 'The cat asleep', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="wa-av" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="wa-ticks ${state || ''}" aria-label="${state === 'read' ? 'Read' : state === 'sent' ? 'Sent' : 'Delivered'}">${state === 'sent' ? '✓' : '✓✓'}</span>`;

    function bubble(m) {
        const body = m.photo !== undefined
            ? `<span class="wa-photo-msg" style="background:${PHOTOS[m.photo][2]}" role="img" aria-label="${PHOTOS[m.photo][1]}">${PHOTOS[m.photo][0]}</span>${m.text ? `<span>${esc(m.text)}</span>` : ''}`
            : m.voice ? '<span class="wa-voice">▶ <span class="wave"></span> 0:04</span>'
            : `<span>${esc(m.text)}</span>`;
        const who = m.from ? `<strong class="wa-from">${m.from}</strong>` : '';
        return `<div class="wa-bubble ${m.me ? 'me' : 'them'}">${who}${body}<small>${m.time || '10:2' + (m.n || 1)}${m.me ? ' ' + ticks(m.ticks) : ''}</small></div>`;
    }

    function waChatList(p, ctx) {
        const chats = [
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Hi Mum, it\'s me! New number, old phone broke…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Family', last: 'Dave: Who\'s bringing the cake? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'See you on Thursday!', time: 'Yesterday', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Hi Mum! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
        ];
        const ios = p === 'ios';
        const top = ios
            ? `<div class="wa-top ios"><span class="wa-top-row"><span></span><button type="button" class="wa-icon-btn" data-tap="new-chat" aria-label="New chat">${UI.pen}</button></span><strong>Chats</strong></div>`
            : `<div class="wa-top android"><strong>WhatsApp</strong><span class="wa-top-icons"><span class="wa-icon-btn" aria-hidden="true">${UI.camera}</span>
                <button type="button" class="wa-icon-btn" data-tap="menu" aria-label="More options">${UI.dots}</button></span></div>`;
        return `<div class="ph-app-screen wa ph-${p} wa-list">${statusBar(p)}${top}
            <div class="wa-rows">${chats.map(c => `<button type="button" class="wa-row" data-tap="chat-${c.id}">${avatar(c.letter, c.bg)}
                <span class="wa-row-text"><strong>${c.name}</strong><small>${esc(c.last)}</small></span>
                <span class="wa-row-meta"><small>${c.time}</small>${c.unread ? `<span class="wa-unread">${c.unread}</span>` : ''}${c.muted ? '<span class="wa-muted" aria-label="Muted">🔕</span>' : ''}</span></button>`).join('')}</div>
            ${ios ? `<div class="wa-tabs"><span>${UI.updates}Updates</span><span>${UI.phone}Calls</span><span>${UI.people}Communities</span><span class="on">${UI.chat}Chats</span><button type="button" data-tap="tab-settings">${UI.gear}Settings</button></div>`
                  : '<button type="button" class="wa-fab-btn" data-tap="new-chat" aria-label="New chat">+</button>'}
            ${ctx.menuOpen ? `<div class="wa-menu"><span>New group</span><span>Linked devices</span><span>Starred</span><button type="button" data-tap="menu-settings">Settings</button></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waContacts(p) {
        const contacts = [['dave', 'Dave', '#38bdf8'], ['jean', 'Jean', '#a78bfa'], ['sarah', 'Sarah', '#f472b6'], ['tom', 'Tom', '#34d399']];
        return `<div class="ph-app-screen wa ph-${p} wa-list">${statusBar(p)}
            <div class="wa-top ${p}"><strong>${p === 'ios' ? 'New Chat' : 'Select contact'}</strong></div>
            <div class="wa-rows">${contacts.map(([id, name, bg]) => `<button type="button" class="wa-row" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="wa-row-text"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Family', '#f59e0b', 'Dave, Jean, Sarah, You'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="wa-bar recording"><span class="rec-dot"></span><span>0:04 Recording…</span><button type="button" class="wa-send" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="wa-bar"><button type="button" class="wa-icon-btn" data-tap="attach" aria-label="${p === 'ios' ? 'Add (plus)' : 'Attach (paperclip)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="wa-input"><span class="visually-hidden">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="wa-icon-btn" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="wa-send" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="wa-mic" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="ph-app-screen wa ph-${p} wa-chat">${statusBar(p)}
            <div class="wa-chat-head"><span class="wa-back">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="wa-head-name" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="wa-icon-btn" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="wa-icon-btn" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="wa-banner"><p>This number isn't in your contacts.</p><div><button type="button" data-tap="block">Block</button><button type="button" data-tap="add-contact">Add</button></div></div>` : ''}
            <div class="wa-thread">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ph-sheet"><div class="ph-sheet-box wa-attach">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">🖼️</span>${p === 'ios' ? 'Photos' : 'Gallery'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">📷</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">📄</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">📍</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="ph-dialog-wrap"><div class="ph-dialog ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Block +44 7700 900842?</strong></p><p class="ph-small">Blocked contacts can't call you or send you messages.</p>
                <p class="ph-small">☑ Report to WhatsApp</p>
                <div class="ph-dialog-btns"><button type="button" data-tap="cancel">Cancel</button><button type="button" data-tap="confirm-block">Block</button></div></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waGallery(p, ctx) {
        if (ctx.picked !== undefined) {
            const ph = PHOTOS[ctx.picked];
            return `<div class="ph-app-screen wa ph-${p} wa-preview">${statusBar(p)}
                <div class="wa-preview-img" style="background:${ph[2]}" role="img" aria-label="${ph[1]}">${ph[0]}</div>
                <div class="wa-bar"><label class="wa-input"><span class="visually-hidden">Caption</span><input type="text" data-input="caption" placeholder="Add a caption…" autocomplete="off"></label>
                <button type="button" class="wa-send" data-tap="send-photo" aria-label="Send photo">${UI.send}</button></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="ph-app-screen wa ph-${p}">${statusBar(p)}
            <div class="wa-top ${p}"><strong>${p === 'ios' ? 'Recents' : 'Gallery'}</strong></div>
            <div class="wa-gallery">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="ph-app-screen wa-call ph-${p}">${statusBar(p)}<div class="call-ring">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Ringing…</small></div>
                <div class="call-controls"><span class="end" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="ph-app-screen wa-call ph-${p}">${statusBar(p)}
            <div class="call-video" role="img" aria-label="Sarah on video">👩</div>
            <div class="call-self${ctx.flipped ? ' flipped' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="call-name"><strong>Sarah</strong><small>0:12</small></div>
            <div class="call-controls">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Unmute' : 'Mute'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="end" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="ph-app-screen wa ph-${p} wa-list">${statusBar(p)}
            <div class="wa-info-head">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="wa-rows">
                <button type="button" class="wa-row" data-tap="mute-group"><span class="wa-row-text"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Muted for 1 week' : 'Off'}</small></span></button>
                <button type="button" class="wa-row" data-tap="media"><span class="wa-row-text"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="wa-row danger" data-tap="exit-group"><span class="wa-row-text"><strong>Exit group</strong></span></button>
                <button type="button" class="wa-row danger" data-tap="report-group"><span class="wa-row-text"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="ph-dialog-wrap"><div class="ph-dialog android wa-mute"><p><strong>Mute notifications for…</strong></p>
                <button type="button" data-tap="mute-8h">8 hours</button><button type="button" data-tap="mute-week">1 week</button><button type="button" data-tap="mute-always">Always</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Settings', [['account', 'Account', 'Security notifications, change number'], ['privacy', 'Privacy', 'Block contacts, disappearing messages'],
                ['chats', 'Chats', 'Theme, wallpapers'], ['notifications', 'Notifications', 'Message, group and call tones']]],
            account: ['Account', [['twostep', 'Two-step verification', ctx.twoStep ? 'On' : 'Off'], ['change-number', 'Change number', ''], ['delete-account', 'Delete account', '']]],
            privacy: ['Privacy', [['last-seen', 'Last seen and online', 'Everyone'], ['profile-photo', 'Profile photo', 'Everyone'],
                ['groups', 'Groups', ctx.groupsSetting || 'Everyone'], ['blocked', 'Blocked contacts', ctx.blocked ? '1' : 'None']]],
        };
        const [title, rows] = pages[page];
        return `<div class="ph-app-screen wa ph-${p} wa-list">${statusBar(p)}
            <div class="wa-top ${p}"><strong>${title}</strong></div>
            <div class="wa-rows">${rows.map(([id, label, sub]) => `<button type="button" class="wa-row" data-tap="${id}"><span class="wa-row-text"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="ph-dialog-wrap"><div class="ph-dialog android wa-mute"><p><strong>Who can add me to groups</strong></p>
                <button type="button" data-tap="groups-everyone">Everyone</button><button type="button" data-tap="groups-contacts">My contacts</button>
                <button type="button" data-tap="groups-except">My contacts except…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="ph-app-screen wa ph-${p}">${statusBar(p)}<div class="wa-form"><div class="wa-hero">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Two-step verification</h3><p>For extra security, turn on two-step verification, which will require a PIN when registering your phone number with WhatsApp again.</p>
                <button type="button" class="ph-btn wa-btn" data-tap="turn-on">Turn on</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="ph-app-screen wa ph-${p}">${statusBar(p)}<div class="wa-form"><h3>Add an email address</h3>
                <p>Add an email address so you can reset your PIN if you forget it.</p>
                <div class="wa-field static">your email address</div>
                <button type="button" class="ph-btn wa-btn" data-tap="email-next">Next</button>
                <button type="button" class="ph-btn-text wa" data-tap="skip">Skip</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="ph-app-screen wa ph-${p}">${statusBar(p)}<div class="wa-form"><div class="wa-hero">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Two-step verification is on</h3><p>You'll be asked for your PIN if you set up WhatsApp on a new phone.</p>
                <button type="button" class="ph-btn wa-btn" data-tap="done">Done</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="ph-app-screen wa ph-${p} code-screen">${statusBar(p)}
            <div class="code-head"><strong>${stage === 'pin' ? 'Create a 6-digit PIN' : 'Confirm your PIN'}</strong>
            <p>${stage === 'pin' ? 'You\'ll need it to set up WhatsApp on a new phone.' : 'Type the same PIN again.'}</p></div>
            <div class="wa-code">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'This is your list of chats. To start a new one, <strong>tap the new chat button</strong> (the pencil, top right).'
                          : 'This is your list of chats. To start a new one, <strong>tap the green + button</strong> at the bottom right.',
         hints: {'chat-family': 'That opens an existing chat. Start a new one instead.', 'chat-jean': 'That opens an existing chat. Start a new one instead.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp shows the people in your contacts who use it. <strong>Tap Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Type a message in the box first, then tap the send arrow.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Hi Mum! 😊 Lovely to hear from you!', n: 2}); },
         say: '<strong>Tap the message box</strong> at the bottom, <strong>type a short message</strong> (like "Hello!"), then <strong>tap the send arrow</strong> ➤.',
         hints: {mic: 'The microphone is for voice notes, which come next. First type a message and tap the send arrow.', attach: 'That\'s for photos, which come next. First type a message and tap send.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah has replied! Under your message there are <strong>two blue ticks ✓✓</strong>. What do they mean?',
            options: [
                {t: 'The message failed to send', why: 'A failed message shows a little clock or a red warning. Ticks mean it worked.'},
                {t: 'Sarah has read it', ok: true, why: 'Yes! One grey tick means sent, two grey ticks mean delivered to her phone, and two blue ticks mean she\'s read it.'},
                {t: 'It was sent twice', why: 'No, it was only sent once. Two blue ticks mean it\'s been read.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Now send a photo. <strong>Tap the ${p === 'ios' ? '+' : 'paperclip 📎'}</strong> next to the message box.`,
         hints: {camera: 'The camera takes a new photo. To send one you\'ve already taken, tap the ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Tap ${p === 'ios' ? 'Photos' : 'Gallery'}</strong> to choose from the photos on your phone.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'These are the (pretend) photos on your phone. <strong>Tap the sunflowers</strong> 🌻.',
         hint: 'Tap the photo with the sunflowers in it.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Gorgeous! 🌻 Are those from your garden?', n: 4}); },
         say: 'You can type a caption if you like. Then <strong>tap the send arrow</strong> ➤.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Voice notes are handy if typing is fiddly. On a real phone you <strong>press and hold the microphone</strong> 🎤 while you talk, then let go to send. Here, <strong>tap the microphone once to start, then tap the send arrow</strong> to send it.',
         hint: 'Tap the microphone, then the send arrow.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Well done!</strong> You\'ve sent a message, a photo and a voice note. To reply to Sarah any time, open WhatsApp and tap her chat.'},
    ], {input: {}});

    // the recording state shows between the two microphone taps
    const _oldMessages = SCENARIOS['whatsapp-messages'];
    SCENARIOS['whatsapp-messages'] = p => {
        const steps = _oldMessages(p);
        const voice = steps.find(s => s.sequence);
        const draw = voice.screen;
        voice.screen = c => draw({...c, recording: c.pos === 1});
        return steps;
    };

    SCENARIOS['whatsapp-calls'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Tap Sarah\'s chat</strong> to open it.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'At the top of the chat are two call buttons: the <strong>video camera</strong> for a video call and the <strong>phone</strong> for a voice call. <strong>Tap the video camera</strong> 🎥.',
         hints: {voice: 'That makes a voice call, without video. For this practice, tap the video camera.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'It rings Sarah\'s phone, and when she answers you can see each other. If it\'s noisy where you are, <strong>tap the microphone</strong> 🎙️ to mute yourself.',
         hint: 'The microphone button is in the row at the bottom.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'You\'re muted: Sarah can see you but not hear you. To show her something, <strong>tap the flip button</strong> 🔄 to switch to the camera on the back of your phone.',
         hints: {mute: 'Tap the microphone again later to unmute. For now, try the flip button.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Now Sarah can see what you\'re pointing your phone at. When you\'ve finished, <strong>tap the red button</strong> to end the call.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Video calls use a lot of data. What\'s the best way to make one?',
            options: [
                {t: 'On Wi-Fi at home, when you can', ok: true, why: 'Yes. On Wi-Fi, calls don\'t use your mobile data allowance, so they\'re free however long you chat.'},
                {t: 'It doesn\'t matter', why: 'On mobile data, a long video call can use up your allowance quickly. Wi-Fi is best when you can.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Now for groups. The Family group has lots of new messages, and the notifications keep buzzing. <strong>Tap the Family group.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'To change a group\'s settings, <strong>tap the group\'s name</strong> at the top.', hint: 'Tap the word "Family" at the top of the screen.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Tap Mute notifications.</strong> You\'ll still get the messages, but your phone won\'t buzz for each one.',
         hints: {'exit-group': 'Exit group would leave it completely. Muting is gentler: you stay in the group but without the buzzing.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Choose how long for. <strong>Tap 1 week.</strong>',
         hints: {'mute-8h': '8 hours works too. For this practice, tap 1 week.', 'mute-always': 'Always works too, but you might miss things. For this practice, tap 1 week.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Well done!</strong> You\'ve made a video call, muted yourself, flipped the camera, and muted a busy group. You can still read the group\'s messages whenever you like.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Hello!', ticks: 'read', n: 1}, {text: 'Hi Mum! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Sunday lunch at ours? 🍗', n: 1}, {from: 'Sarah', text: 'Yes please!', n: 2}, {from: 'Dave', text: 'Who\'s bringing the cake? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'WhatsApp\'s own settings are inside the app. <strong>Tap Settings</strong> at the bottom right.',
                hints: {'chat-unknown': 'We\'ll deal with that message later. First, tap Settings at the bottom right.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'WhatsApp\'s own settings are inside the app. <strong>Tap the three dots ⋮</strong> at the top right.',
                hints: {'chat-unknown': 'We\'ll deal with that message later. First, tap the three dots at the top right.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Tap Settings.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Tap Account.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Two-step verification</strong> adds a PIN that\'s needed if anyone tries to set up your WhatsApp on another phone. Even if a scammer gets your 6-digit code, they can\'t get in. <strong>Tap Two-step verification.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Tap Turn on.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Choose a 6-digit PIN, different from your phone's passcode. For this practice, <strong>type ${pinText}</strong>. <em>Don't type a real PIN here.</em>`,
             hint: `Type the practice PIN ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Type ${pinText} again</strong> to confirm it.`, hint: `Type ${pinText} again.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Adding your email address means you can reset the PIN if you forget it. It\'s worth doing on your real phone. Here, <strong>tap Next</strong>.',
             hints: {skip: 'You can skip it, but then forgetting your PIN could lock you out. Tap Next for this practice.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Two-step verification is on. <strong>Tap Done.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'A message says it\'s from <em>"WhatsApp Support"</em> and asks for your two-step PIN to "verify your account". What do you do?',
                options: [
                    {t: 'Send it, it\'s from WhatsApp', why: 'WhatsApp will never message you asking for your PIN or code. This is a scammer trying to take over your account.'},
                    {t: 'Don\'t reply, and block and report them', ok: true, why: 'Exactly. Nobody, including WhatsApp, should ever ask for your PIN or the 6-digit code.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Next, stop strangers adding you to groups. This is in <strong>Privacy</strong>. <strong>Tap Groups.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'My contacts'; },
             say: '"Everyone" means any stranger can add you to a group, which scammers use. <strong>Tap My contacts.</strong>',
             hints: {'groups-everyone': 'Everyone lets strangers add you to groups, including scam groups. Tap My contacts.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'A message has arrived from a number you don\'t know: "Hi Mum, it\'s me! New number…". It\'s the "Hi Mum" scam. <strong>Tap it to open it.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Hi Mum, it\'s me! New number, old phone broke. Can you help me pay a bill? I\'ll pay you back tomorrow x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Don\'t reply. WhatsApp notices the number isn\'t in your contacts. <strong>Tap Block.</strong>',
             hints: {'add-contact': 'Don\'t add a scammer to your contacts. Tap Block.', video: 'Don\'t call them back. Tap Block.', voice: 'Don\'t call them back. Tap Block.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Hi Mum, it\'s me! New number, old phone broke. Can you help me pay a bill? I\'ll pay you back tomorrow x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '"Report to WhatsApp" is ticked, which helps WhatsApp stop the scammer. <strong>Tap Block.</strong>',
             hints: {cancel: 'Cancel would leave them able to message you. Tap Block.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Well done!</strong> You\'ve turned on two-step verification, stopped strangers adding you to groups, and blocked and reported a scammer. If you\'re ever unsure about a message from family, call them on the number you already have.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="toggle${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Back') => `<button type="button" class="set-back-btn ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

    // A settings-style list page. rows: {id, label, sub, value, toggle (true/false), danger, caption}
    function list(p, title, rows, opts = {}) {
        const row = r => {
            if (r.caption) return `<div class="set-caption">${r.caption}</div>`;
            const right = r.toggle !== undefined ? tog(r.toggle) : (r.value !== undefined ? `<span class="set-val">${r.value}</span>` : (r.id && p === 'ios' ? '<span class="set-chev">›</span>' : ''));
            const text = `<span class="set-text"><strong${r.danger ? ' class="danger"' : ''}>${r.label}</strong>${r.sub ? `<small>${r.sub}</small>` : ''}</span>`;
            return r.id ? `<button type="button" class="set-row" data-tap="${r.id}">${text}${right}</button>` : `<div class="set-row static">${text}${right}</div>`;
        };
        const body = p === 'ios'
            ? (() => {  // group rows between captions
                const out = []; let group = [];
                const flush = () => { if (group.length) out.push(`<div class="set-group">${group.join('')}</div>`); group = []; };
                rows.forEach(r => { if (r.caption) { flush(); out.push(row(r)); } else group.push(row(r)); });
                flush();
                return out.join('');
            })()
            : rows.map(row).join('');
        return `<div class="set-screen ${p}">${statusBar(p)}<div class="set-scroll">
            <div class="set-nav ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Back')}<strong>${title}</strong></div>
            ${opts.top || ''}${body}${opts.bottom || ''}</div>
            ${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }

    // A full-screen app page with a coloured header bar.
    function app(p, title, inner, opts = {}) {
        const light = ['#fff', '#f2f2f7', '#f8fafc'].includes(opts.color);
        return `<div class="ph-app-screen app-page ph-${p}${light ? ' light' : ' dark'}" style="--app:${opts.color || '#0a6cf2'}">${statusBar(p)}
            <div class="app-head">${opts.back === false ? '' : '<button type="button" class="app-back" data-tap="back" aria-label="Back">‹</button>'}<strong>${title}</strong>${opts.right || ''}</div>
            <div class="app-body">${inner}</div>${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }

    const dialog = (p, title, text, buttons) => `<div class="ph-dialog-wrap"><div class="ph-dialog ${p === 'ios' ? 'ios' : 'android'}">
        <p><strong>${title}</strong></p>${text ? `<p class="ph-small">${text}</p>` : ''}
        <div class="ph-dialog-btns${buttons.length > 2 ? ' col' : ''}">${buttons.map(([id, label]) => `<button type="button" data-tap="${id}">${label}</button>`).join('')}</div></div></div>`;

    const field = (name, placeholder, ctx, type = 'text') => `<label class="app-field"><span class="visually-hidden">${placeholder}</span>
        <input type="${type}" data-input="${name}" placeholder="${placeholder}" value="${esc((ctx.input && ctx.input[name]) || '')}" autocomplete="off"></label>`;
    const typed = (c, name) => ((c.input && c.input[name]) || '').trim();
    const ICON2 = {
        magnifier: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" stroke="#fff" stroke-width="2.4" fill="none"/><path d="m14.5 14.5 5 5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M10 7v6M7 10h6" stroke="#fff" stroke-width="2"/></svg>',
        heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#fff"/></svg>',
        pound: '<span class="ic-text">£</span>',
        train: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="14" rx="3" fill="#fff"/><rect x="7" y="6" width="10" height="5" rx="1" fill="#0f766e"/><path d="m7 21 2-4M17 21l-2-4" stroke="#fff" stroke-width="2"/></svg>',
        wallet: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2" fill="#fff"/><rect x="3" y="4" width="15" height="4" rx="1" fill="#fde68a"/><circle cx="17" cy="13" r="1.6" fill="#111"/></svg>',
        find: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="#fff" stroke-width="2.4" fill="none"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>',
        contacts: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3" fill="#fff"/><circle cx="12" cy="10" r="3" fill="#64748b"/><path d="M7 18c1-3 3-4 5-4s4 1 5 4z" fill="#64748b"/></svg>',
        video: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="12" height="10" rx="2" fill="#fff"/><path d="m15 11 6-4v10l-6-4z" fill="#fff"/></svg>',
        health: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#ef4444"/></svg>',
    };
    const pill = ICON2;  // alias for readability below

    // Home-screen helper: the normal home screen plus extra apps.
    const homeWith = (p, extra, opts = {}) => home(p, {...opts, extra});
    const goHome = (p) => ({id: p === 'ios' ? 'home-bar' : 'home-pill'});

    // ======================================================================================
    // Course: Making your phone easier to use
    // ======================================================================================
    function textSizePage(p, ctx) {
        const size = 15 + 3 * ((ctx.size || 0) + (ctx.pos || 0));
        const slider = `<div class="ts-box"><p class="ts-sample" style="font-size:${size}px">Apps that support Dynamic Type will adjust to your preferred reading size.</p>
            <div class="ts-slider"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="ts-track"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="big" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Text Size', [], {top: slider, back: 'Display'});
        return list(p, 'Display size and text', [{caption: 'Font size'}, {id: 'bold', label: 'Bold text', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Text size is in the <strong>Settings</strong> app. <strong>Tap Settings.</strong>', hint: 'Settings is the grey icon with a cog.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Tap Display &amp; Brightness.</strong>', hint: 'It\'s in the third group, below Accessibility.'},
        {screen: c => list(p, 'Display &amp; Brightness', [{caption: 'APPEARANCE'}, {label: 'Light', value: '✓'}, {caption: 'TEXT'}, {id: 'text-size', label: 'Text Size'}, {id: 'bold', label: 'Bold Text', toggle: !!c.bold}], {back: 'Settings'}),
         target: 'text-size', say: '<strong>Tap Text Size.</strong>', hints: {bold: 'Bold Text comes next. First, tap Text Size.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Drag the slider to the right to make the writing bigger. Here, <strong>tap the big A twice</strong> and watch the text grow.', hint: 'Tap the big A on the right of the slider.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Much easier to read! Now <strong>tap ‹ Display</strong> at the top to go back.'},
        {screen: c => list(p, 'Display &amp; Brightness', [{caption: 'APPEARANCE'}, {label: 'Light', value: '✓'}, {caption: 'TEXT'}, {id: 'text-size', label: 'Text Size'}, {id: 'bold', label: 'Bold Text', toggle: !!c.bold}], {back: 'Settings'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Bold Text</strong> makes letters thicker and clearer. <strong>Tap it to turn it on.</strong>'},
        {screen: c => list(p, 'Display &amp; Brightness', [{caption: 'TEXT'}, {label: 'Text Size'}, {label: 'Bold Text', toggle: true}], {back: 'Settings'}),
         question: {q: 'Text still too small, even at the biggest setting?', options: [
            {t: 'Nothing more can be done', why: 'There\'s more! Settings > Accessibility > Display &amp; Text Size > Larger Text gives even bigger sizes.'},
            {t: 'Settings > Accessibility > Display &amp; Text Size > Larger Text', ok: true, why: 'Yes. Turn on Larger Accessibility Sizes there for really big text.'}]}},
        {screen: c => list(p, 'Display &amp; Brightness', [{caption: 'TEXT'}, {label: 'Text Size'}, {label: 'Bold Text', toggle: true}], {back: 'Settings'}), done: true,
         say: '<strong>Well done!</strong> Your text is bigger and bolder, in Settings and in most apps.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Text size is in the <strong>Settings</strong> app. <strong>Tap Settings.</strong>', hint: 'Settings is the icon with a cog.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Tap Display &amp; touch.</strong> <em>On a Samsung, it\'s Display, then Font size and style.</em>'},
        {screen: () => list(p, 'Display &amp; touch', [{id: 'dark', label: 'Dark theme', toggle: false}, {id: 'text-size', label: 'Display size and text', sub: 'Font size, bold text'}, {id: 'brightness', label: 'Brightness level', value: '70%'}]),
         target: 'text-size', say: '<strong>Tap Display size and text.</strong>', hints: {dark: 'Dark theme changes the colours, not the size. Tap Display size and text.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Drag the Font size slider to the right to make the writing bigger. Here, <strong>tap the big A twice</strong>.', hint: 'Tap the big A on the right of the slider.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Bold text</strong> makes letters clearer. <strong>Tap it to turn it on.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Text still too small, even at the biggest setting?', options: [
            {t: 'Nothing more can be done', why: 'Try Display size too, on the same page: it makes everything bigger, including buttons and icons.'},
            {t: 'Make the Display size bigger too', ok: true, why: 'Yes. Display size enlarges everything on screen, not just text.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Well done!</strong> Your text is bigger and bolder, in Settings and in most apps.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="cc-grid"><span class="cc-tile on">✈︎</span><span class="cc-tile on blue">Wi-Fi</span><span class="cc-tile on blue">Bluetooth</span>
                <button type="button" class="cc-tile wide${dnd ? ' on purple' : ''}" data-tap="dnd">🌙 ${dnd ? 'Do Not Disturb' : 'Focus'}</button>
                <div class="cc-slider" aria-label="Volume"><span style="height:${vol}%"></span><em>🔊</em></div>
                <span class="cc-tile" aria-label="Torch">${UI.torch}</span><span class="cc-tile">⏱</span></div>`
            : `<div class="qs-grid"><span class="qs-tile on">Internet</span><span class="qs-tile on">Bluetooth</span>
                <button type="button" class="qs-tile${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Do Not Disturb · On' : 'Do Not Disturb · Off'}</button>
                <span class="qs-tile">Torch</span></div>
                <div class="qs-vol" aria-label="Volume"><em>🔔</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="cc-screen ${p}">${statusBar(p)}${tiles}
            <button type="button" class="side-btn" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="cc-close" data-tap="close">${p === 'ios' ? 'Swipe up to close' : 'Close'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'If your phone doesn\'t ring, Do Not Disturb may be on. Quick settings are in <strong>Control Centre</strong>: <strong>swipe down from the top-right corner</strong> (or tap the strip at the top).'
                          : 'If your phone doesn\'t ring, Do Not Disturb may be on. <strong>Swipe down from the top of the screen</strong> to see quick settings (or tap the strip at the top).',
         hints: {'pull-up': 'Swipe the other way: down from the top.', 'pull-left': 'Swipe down, not sideways.', 'pull-right': 'Swipe down, not sideways.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `The moon 🌙 means <strong>Do Not Disturb is on</strong>, so calls and messages are silenced. <strong>Tap it to turn it off.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Now turn the volume up with the <strong>volume button on the side of your phone</strong> (the upper one). <strong>Tap the ＋ on the edge of the practice phone 3 times.</strong>',
         hint: 'Tap the ＋ button on the right-hand edge of the phone.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'Your iPhone still won\'t ring. What else could it be?', options: [
                {t: 'The Ring/Silent switch or Action button is set to silent', ok: true, why: 'Yes. Many iPhones have a little switch above the volume buttons: if it shows orange, the phone is on silent. Newer ones use the Action button instead.'},
                {t: 'The phone is broken', why: 'Usually not! Check the silent switch above the volume buttons first.'}]}
            : {q: 'You pressed the volume button but it only changed the media volume. What now?', options: [
                {t: 'Tap the ⋯ or settings icon on the volume bar to see the ring volume', ok: true, why: 'Yes. The volume buttons often change media volume; tap the three dots on the volume bar to change the ring volume.'},
                {t: 'Give up', why: 'Tap the three dots ⋯ on the volume bar that appears, and turn up the ring volume.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Well done!</strong> Do Not Disturb is off and the volume is up, so you\'ll hear calls and messages.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="mag-screen ${ctx.torch ? 'lit' : ''}${ctx.frozen ? ' frozen' : ''}">${statusBar(p)}
            <div class="mag-view"><div class="mag-label" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500mg</strong><br>Take 1-2 tablets every 4-6 hours.<br>Do not take more than 8 tablets in 24 hours.</div></div>
            <div class="mag-controls"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="mag-track"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="mag-buttons"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="mag-shutter" data-tap="freeze" aria-label="Freeze the picture"></button><span class="mag-blank"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Magnifier', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'Your iPhone has a <strong>Magnifier</strong> app. If it\'s not on your home screen, swipe down in the middle of the screen and type "Magnifier". <strong>Tap Magnifier.</strong>'
                          : 'Many Android phones have a <strong>Magnifier</strong> app. <em>On a Samsung, it\'s in the quick settings or in Accessibility.</em> <strong>Tap Magnifier.</strong>',
         hint: 'Look for the black icon with a magnifying glass.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Point your phone at something small, like this medicine label. <strong>Tap ＋ three times</strong> to zoom in (on a real phone you can drag the slider).', hint: 'Tap the ＋ on the right of the slider.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'In dim light, the torch helps. <strong>Tap the torch</strong> 🔦.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Hands a bit shaky? <strong>Tap the big round button</strong> to freeze the picture, so you can read it without holding still.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'What else is the magnifier handy for?', options: [
            {t: 'Reading menus, price labels and small print on letters', ok: true, why: 'Yes, and it\'s always in your pocket. Some people keep it in Control Centre or quick settings for one-tap access.'},
            {t: 'Making phone calls louder', why: 'That\'s the volume buttons. The magnifier is for seeing small things more clearly.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Well done!</strong> You can now zoom in on small print, light it up, and freeze the picture.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'See you at the coffee morning on Thursday' : '';
        return `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}
            <div class="msg-head">${p === 'ios' ? '<span class="msg-back">‹</span>' : '<span class="msg-back">←</span>'}<strong>Jean</strong></div>
            <div class="wa-thread"><div class="wa-bubble them"><span>Are you coming on Thursday? ☕</span><small>09:41</small></div></div>
            <div class="msg-bar"><button type="button" class="msg-box" data-tap="box">${text ? esc(text) : '<span class="ph-placeholder">Text message</span>'}</button>
                <button type="button" class="wa-send" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="ph-keys mic-keys">${listening ? '<p class="listening">🎤 Listening… speak now</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="wide">space</span><button type="button" class="kb-mic" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'You can talk instead of typing. <strong>Open Messages.</strong>', hint: 'Messages is the green speech bubble.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean has asked about Thursday. <strong>Tap the message box</strong> at the bottom.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'The keyboard appears. <strong>Tap the microphone</strong> 🎤 on the keyboard, then speak your message.', hint: 'The microphone is on the keyboard, next to the space bar.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'On a real phone you\'d now say: <em>"See you at the coffee morning on Thursday"</em>. The words appear as you speak. Check them, then <strong>tap send</strong> ➤.',
         hint: 'Wait for the words to appear, then tap the send arrow.'},
        {screen: () => home(p), target: 'settings',
         say: 'Your phone can also <strong>read things out loud</strong> to you. Let\'s switch that on. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Tap Accessibility.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accessibility', [{caption: 'VISION'}, {id: 'voiceover', label: 'VoiceOver', value: 'Off'}, {id: 'zoom', label: 'Zoom', value: 'Off'}, {id: 'spoken', label: 'Spoken Content'}], {back: 'Settings'})
            : list(p, 'Accessibility', [{id: 'select-speak', label: 'Select to Speak', sub: 'Off'}, {id: 'talkback', label: 'TalkBack', sub: 'Off'}, {id: 'magnification', label: 'Magnification'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Tap Spoken Content.</strong>' : '<strong>Tap Select to Speak.</strong>',
         hints: {voiceover: 'VoiceOver changes how the whole phone works, which can be confusing. Tap Spoken Content.', talkback: 'TalkBack changes how the whole phone works, which can be confusing. Tap Select to Speak.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Spoken Content', [{id: 'speak-selection', label: 'Speak Selection', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Speak Screen', toggle: !!c.speakScreen, sub: 'Swipe down with two fingers from the top of the screen to hear it read out.'}], {back: 'Accessibility'})
            : list(p, 'Select to Speak', [{id: 'speak-screen', label: 'Use Select to Speak', toggle: !!c.speakScreen, sub: 'Tap the shortcut, then tap anything on screen to hear it read out.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Turn on Speak Screen.</strong> Then, anywhere on your phone, swiping down from the top with two fingers reads the screen out.' : '<strong>Turn on Use Select to Speak.</strong> A little shortcut button appears: tap it, then tap any text to hear it.',
         hints: {'speak-selection': 'That reads only words you highlight. Speak Screen is easier: turn that on.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Spoken Content', [{label: 'Speak Selection', toggle: false}, {label: 'Speak Screen', toggle: true}], {back: 'Accessibility'})
            : list(p, 'Select to Speak', [{label: 'Use Select to Speak', toggle: true}]), done: true,
         say: '<strong>Well done!</strong> You can now talk instead of typing, and have your phone read things out to you.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Many hearing aids can connect to your phone, so calls and music go straight into them. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Tap Accessibility.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accessibility', [{caption: 'HEARING'}, {id: 'hearing-devices', label: 'Hearing Devices'}, {id: 'live-captions', label: 'Live Captions', value: c.captions ? 'On' : 'Off'}, {id: 'subtitles', label: 'Subtitles &amp; Captioning'}], {back: 'Settings'})
            : list(p, 'Accessibility', [{id: 'hearing-devices', label: 'Hearing aids', sub: c.paired ? 'Connected' : 'Not connected'}, {id: 'live-captions', label: 'Live Caption', sub: c.captions ? 'On' : 'Off'}, {id: 'sound-amp', label: 'Sound Amplifier'}]),
         target: 'hearing-devices', say: `<strong>Tap ${p === 'ios' ? 'Hearing Devices' : 'Hearing aids'}.</strong> Put your hearing aids in first, and close their battery doors to restart them, so the phone can find them.`,
         hints: {'live-captions': 'Captions come next. First, connect the hearing aids.'}},
        {screen: c => list(p, p === 'ios' ? 'Hearing Devices' : 'Hearing aids', [{caption: p === 'ios' ? 'MFI HEARING DEVICES' : 'Available devices'}, {id: 'aids', label: 'Margaret\'s hearing aids', sub: 'Left and right'}],
            {overlay: c.pairing ? dialog(p, 'Pair with "Margaret\'s hearing aids"?', 'They\'ll be used for calls and audio.', [['cancel', 'Cancel'], ['pair', 'Pair']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Your phone finds them. <strong>Tap your hearing aids.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Hearing Devices' : 'Hearing aids', [{id: 'aids', label: 'Margaret\'s hearing aids', sub: 'Left and right'}],
            {overlay: dialog(p, 'Pair with "Margaret\'s hearing aids"?', 'They\'ll be used for calls and audio.', [['cancel', 'Cancel'], ['pair', 'Pair']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Tap Pair.</strong> (With two hearing aids, your phone may ask twice, once for each.)'},
        {screen: c => list(p, p === 'ios' ? 'Hearing Devices' : 'Hearing aids', [{label: 'Margaret\'s hearing aids', sub: 'Connected ✓'}]), target: 'back',
         say: 'Connected! Calls will now play through your hearing aids. <strong>Tap Back.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accessibility', [{caption: 'HEARING'}, {id: 'hearing-devices', label: 'Hearing Devices'}, {id: 'live-captions', label: 'Live Captions', value: c.captions ? 'On' : 'Off'}], {back: 'Settings'})
            : list(p, 'Accessibility', [{id: 'hearing-devices', label: 'Hearing aids', sub: 'Connected'}, {id: 'live-captions', label: 'Live Caption', sub: c.captions ? 'On' : 'Off'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Live Captions' : 'Live Caption'}</strong> shows words on screen for anything spoken: videos, calls and voice messages. <strong>Tap it to turn it on.</strong>`},
        {screen: c => list(p, 'Accessibility', [{label: p === 'ios' ? 'Live Captions' : 'Live Caption', toggle: true}, {label: 'Hearing aids', sub: 'Connected'}]), done: true,
         say: '<strong>Well done!</strong> Your hearing aids are connected, and spoken words now appear as captions.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Ant', 'Badger', 'Cat', 'Dog', 'Eagle', 'Fox', 'Goat', 'Hedgehog', 'Ibis', 'Jackdaw', 'Kingfisher', 'Lamb', 'Mole',
                     'Newt', 'Otter', 'Puffin', 'Robin', 'Seal', 'Toad', 'Vole', 'Wren', 'Zebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="ph-homebar-btn" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="ph-androidnav"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="pb-star" data-tap="star">★<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="pb-hold"><button type="button" class="pb-flower" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Press and hold the flower</p></div>`;
        if (task === 'menu') inner = '<div class="pb-hold"><span class="pb-flower">🌷</span><div class="pb-menu"><span>Copy</span><span>Share</span><span>Delete</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="pb-swipe" data-swipe="photo"><div class="pb-slide" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="pb-dots">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="swipe-alt" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="pb-list">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="pb-page">${p === 'ios' ? '<button type="button" class="set-back-btn ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebra</h3><p>Zebras have black and white stripes. No two zebras have exactly the same pattern.</p></div>`;
        return `<div class="pb-screen ${p}">${statusBar(p)}<div class="pb-body">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Tap</strong> means touching the screen lightly with one finger and letting go straight away, like pressing a button. <strong>Tap the star.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Press and hold</strong> means keeping your finger on something for a second or two. It usually brings up extra options. <strong>Press and hold the flower</strong> until something happens. (With a mouse, hold the button down.)',
         hint: 'Keep your finger on the flower for a second or two.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'A menu appeared. What does pressing and holding usually do?', options: [
            {t: 'Shows extra options, like copy, share or delete', ok: true, why: 'Yes. Pressing and holding on messages, photos and apps brings up options like these.'},
            {t: 'Deletes things straight away', why: 'No, it just shows a menu of options. Nothing happens until you choose one.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Swipe</strong> means sliding your finger across the screen, like turning a page. <strong>Swipe left on the photo twice</strong> to see the next ones. (With a mouse, click, drag and let go.)',
         hint: 'Slide your finger from right to left across the photo. Or use the "Can\'t swipe?" button.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Scroll</strong> means sliding your finger up the screen to see more of a list, like this one. <strong>Scroll down and tap Zebra</strong>, at the very bottom. (With a mouse, use the scroll wheel.)',
         hint: 'Slide the list upwards with your finger to get to Zebra at the bottom.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'To go back a page on an iPhone, <strong>tap ‹ Back</strong> at the top left (or swipe in from the left edge of the screen).' : 'To go back a page on Android, <strong>tap the back arrow ◁</strong> at the bottom (or swipe in from the left or right edge of the screen).',
         hints: {'home-pill': 'That goes all the way home. Tap the back arrow ◁ instead.', 'home-bar': 'That goes all the way home. Tap ‹ Back instead.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'To go to your home screen from anywhere, <strong>swipe up from the bar at the bottom</strong> of the screen (or tap the bar here). Older iPhones with a round Home button: press it.'
                          : 'To go to your home screen from anywhere, <strong>tap the home circle ○</strong> at the bottom (or swipe up from the bottom edge).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Back goes one page back. Tap the home circle ○ to go home.'}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> You\'ve practised tapping, pressing and holding, swiping, scrolling, going back and going home: the moves you\'ll use every day.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Connected', value: '✓'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'NETWORKS' : 'Available networks'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '🔒'})),
        ], {back: 'Settings',
            overlay: ctx.joining ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Enter the password for "BT-Hub-7F2A"</strong></p>
                ${field('wifipass', 'Password', ctx)}<button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="join">${p === 'ios' ? 'Join' : 'Connect'}</button>
                <button type="button" class="ph-btn-text" data-tap="cancel">Cancel</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Using Wi-Fi at home saves your mobile data. <strong>Tap Settings.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Tap Wi-Fi</strong>, near the top.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Tap Network &amp; internet.</strong> <em>On a Samsung, it\'s Connections, then Wi-Fi.</em>'},
               {screen: () => list(p, 'Network &amp; internet', [{id: 'internet', label: 'Internet', sub: 'Wi-Fi and mobile data'}, {id: 'sims', label: 'SIMs'}, {id: 'hotspot', label: 'Hotspot &amp; tethering'}]),
                target: 'internet', say: '<strong>Tap Internet.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Your Wi-Fi name and password are usually on a sticker on the back of your router (the box with the lights). This practice router\'s sticker says:<br><span class="sticker">Network: <strong>BT-Hub-7F2A</strong><br>Password: <strong>Green-Apple-42</strong></span><strong>Tap BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'That\'s a neighbour\'s Wi-Fi. Find the name on your sticker: BT-Hub-7F2A.', 'net-sky-12345': 'That\'s someone else\'s Wi-Fi. Find the name on your sticker: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'The password must match the sticker exactly, including capital letters and dashes: Green-Apple-42',
         say: 'Type the password <strong>exactly</strong> as it is on the sticker: <strong>Green-Apple-42</strong>. Capital letters matter! Then <strong>tap Join</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'You\'re connected! Your phone will now join this Wi-Fi by itself whenever you\'re home. Is it safe to use free Wi-Fi in a café?', options: [
            {t: 'Yes, for browsing, but avoid online banking on it', ok: true, why: 'Exactly. Public Wi-Fi is fine for reading the news or checking a bus time. For banking, use your mobile data or home Wi-Fi.'},
            {t: 'Yes, for everything', why: 'Public Wi-Fi can be watched by others. It\'s fine for browsing, but use your mobile data or home Wi-Fi for banking.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Well done!</strong> You\'re connected to Wi-Fi. Look for the fan-shaped Wi-Fi symbol at the top of your screen.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'New Contact' : 'Create contact', [], {noBack: true,
            top: `<div class="contact-form"><span class="wa-av big" style="background:#cbd5e1">👤</span>
                <span class="field-label">First name</span>${field('fname', 'First name', ctx)}<span class="field-label">Mobile number</span>${field('cnum', 'Mobile number', ctx, 'tel')}
                <button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="save">${p === 'ios' ? 'Done' : 'Save'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Contact', [
        {label: 'Mobile', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Add to Favourites' : (ctx.fav ? '★ Favourite' : '☆ Add to favourites')},
        {id: 'share', label: 'Share Contact'}], {back: 'Contacts'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Contacts', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Saving someone\'s number means you can call them by name. On iPhone, contacts are in the <strong>Phone</strong> app. <strong>Tap Phone.</strong>' : '<strong>Tap Contacts.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Contacts', '<div class="contact-list"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="app-plus" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Contacts', '<div class="contact-list"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="wa-fab-btn blue" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'This is your contacts list. <strong>Tap +</strong> at the top right to add someone.' : 'This is your contacts list. <strong>Tap the + button</strong> to add someone.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Type a first name, and the practice number 07700 900456, then tap ' + (p === 'ios' ? 'Done.' : 'Save.'),
         say: `Type the person\'s <strong>first name</strong> (try "Ann"), and their number. For practice, use <strong>07700 900456</strong>. Then <strong>tap ${p === 'ios' ? 'Done' : 'Save'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Saved! Favourites are the people you call most, shown at the top for one-tap calling. <strong>Tap ' + (p === 'ios' ? 'Add to Favourites' : 'the star') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Which contact is worth saving with "ICE" (In Case of Emergency) in front of their name?', options: [
            {t: 'Your next of kin, like "ICE Sarah"', ok: true, why: 'Yes. Paramedics know to look for ICE. Even better, add an emergency contact to your Medical ID, covered in the Keeping your phone safe course.'},
            {t: 'Your bank', why: 'ICE is for the person to contact if something happens to you, usually your next of kin.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Well done!</strong> You\'ve saved a contact and made them a favourite.'},
    ], {input: {}});

    function incoming(p) {
        return `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${avatar('J', '#a78bfa')}<strong>Jean</strong><small>mobile</small></div>
            <div class="call-answer"><button type="button" class="decline" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="accept" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="call-labels"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
    }
    function inCall(p, ctx, who = 'Jean') {
        return `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${avatar(who[0], '#a78bfa')}<strong>${who}</strong><small>${ctx.busy ? 'calling…' : '0:42'}</small></div>
            <div class="call-grid"><button type="button" data-tap="mute">${UI.mic}<span>mute</span></button><button type="button" data-tap="keypad">${UI.keypad}<span>keypad</span></button>
                <button type="button" data-tap="speaker" class="${ctx.speaker ? 'on' : ''}">${UI.speaker}<span>speaker</span></button></div>
            <div class="call-answer single"><button type="button" class="decline" data-tap="end" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }
    const recents = p => app(p, 'Recents', `<div class="recents">
        <button type="button" class="recent missed" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="recent"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="recent"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Your phone is ringing: Jean is calling. <strong>Tap the green button to answer.</strong>' + (p === 'android' ? ' <em>On some Android phones you swipe the green button up instead.</em>' : ' <em>If your iPhone is locked, you slide the green button across instead.</em>'),
         hints: {decline: 'Red declines the call. Tap green to answer.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'You\'re talking! To hear better, or to talk hands-free, <strong>tap speaker</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'When you\'ve finished, <strong>tap the red button</strong> to hang up.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'You missed a call from Dave earlier. Missed calls show in <strong>red</strong> in your recent calls. <strong>Tap Dave</strong> to call him back.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'It\'s ringing Dave. When you\'ve finished talking, <strong>tap the red button</strong> to hang up.'},
        {screen: () => recents(p), question: {q: 'Someone calls from a number you don\'t know, saying they\'re from your bank. What do you do?', options: [
            {t: 'Hang up and call 159 to reach your bank safely', ok: true, why: 'Exactly. You can always hang up and call back on a number you trust. 159 connects you to your own bank.'},
            {t: 'Do what they say, it\'s the bank', why: 'Scammers pretend to be banks all the time, and the number can be faked. Hang up and call 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Well done!</strong> You can answer, use the speaker, hang up, and call back missed calls.'},
    ], {});

    function smsList(p) {
        return app(p, 'Messages', `<div class="recents">
            <button type="button" class="recent unread" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="recent"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="wa-bubble me sms"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="wa-bubble them old" data-hold="old-msg"><span>Your last check-up was in March. Book online or call us.</span><small>3 months ago</small></button>`;
        return `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}
            <div class="msg-head">${p === 'ios' ? '<span class="msg-back">‹</span>' : '<span class="msg-back">←</span>'}<strong>Dentist</strong></div>
            <div class="wa-thread">${old}<div class="wa-bubble them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="msg-bar">${field('reply', 'Text message', ctx)}<button type="button" class="wa-send" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ph-sheet"><div class="ph-sheet-box"><button type="button" class="ph-btn-text" data-tap="copy">Copy</button><button type="button" class="ph-btn-text" data-tap="forward">Forward</button>
                <button type="button" class="ph-btn-text danger" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Text messages are in the <strong>Messages</strong> app. <strong>Tap Messages.</strong>', hint: 'It\'s the speech bubble icon.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'New messages show in bold. <strong>Tap the message from the Dentist</strong> to read it.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Type Y in the message box first, then tap the send arrow.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'The dentist asks you to reply <strong>Y</strong> to confirm. <strong>Tap the message box, type Y, then tap the send arrow</strong> ➤.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Done! Now tidy up: <strong>press and hold the old message</strong> at the top (keep your finger on it for a second or two).', hint: 'Keep your finger on the old message at the top until a menu appears.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'A menu appears. <strong>Tap Delete.</strong>',
         hints: {copy: 'Copy copies the words. Tap Delete.', forward: 'Forward sends it to someone else. Tap Delete.'}},
        {screen: c => smsChat(p, c), question: {q: 'A text from an unknown number says your parcel is held and asks you to pay £1.45 using a link. What do you do?', options: [
            {t: 'Don\'t tap the link. Forward it to 7726, then delete it', ok: true, why: 'Exactly. 7726 is free and reports it to your network. Couriers don\'t text links asking for fees.'},
            {t: 'Pay it, it\'s only £1.45', why: 'The £1.45 is bait to get your card details. Don\'t tap the link: forward it to 7726 and delete it.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Well done!</strong> You can read and reply to texts, and delete the ones you don\'t need.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="batt-apps">${[['Facebook', 31], ['YouTube', 22], ['Maps', 15], ['WhatsApp', 9], ['Camera', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="batt-bar"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="batt-head"><span class="batt-big${saver ? ' saver' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Battery', [{id: 'low-power', label: 'Low Power Mode', toggle: saver, sub: 'Reduces background activity until you can fully charge.'}, {caption: 'BATTERY USAGE BY APP'}], {back: 'Settings', top: head, bottom: apps})
            : list(p, 'Battery', [{id: 'low-power', label: 'Battery Saver', toggle: saver, sub: 'Turns off some features to make the battery last longer.'}, {caption: 'Battery usage'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Battery running low? <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Tap Battery.</strong>', hint: p === 'ios' ? 'Battery is in the third group.' : 'Battery is in the list, after Notifications.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `You\'re on 23%. <strong>${p === 'ios' ? 'Low Power Mode' : 'Battery Saver'}</strong> makes it last longer. <strong>Tap it to turn it on.</strong> The battery symbol turns ${p === 'ios' ? 'yellow' : 'orange'} to remind you.`},
        {screen: c => batteryPage(p, c), question: {q: 'The list shows Facebook used the most battery today. What helps the battery last longest?', options: [
            {t: 'Turn the screen brightness down, and close apps you\'ve finished with', ok: true, why: 'Yes. The screen uses the most power. Lower brightness, and apps like Facebook and YouTube use a lot.'},
            {t: 'Charge it to 100% every hour', why: 'Charging often doesn\'t hurt, but it doesn\'t make it last longer. Lower the brightness and use battery saving mode.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Well done!</strong> Battery saving is on, and you know which apps use the most power.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="recent missed"><strong>07700 900842</strong><small>${p === 'ios' ? 'mobile · 3 calls' : 'Suspected spam · 3 calls'}</small>
            <span>11:20</span><button type="button" class="recent-info" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Recents', `<div class="recents">${rows}<div class="recent"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
            <div class="recent"><strong>Dave</strong><small>mobile</small><span>Yesterday</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="app-plus" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="wa-menu"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'The same unknown number keeps calling you. Let\'s block it. <strong>Open the Phone app.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `In your recent calls, <strong>tap the ⓘ</strong> next to the number 07700 900842${p === 'android' ? ' (on some Android phones, tap the number itself)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Share Contact'}, {id: 'block', label: p === 'ios' ? 'Block this Caller' : 'Block/report spam', danger: true}], {back: 'Recents'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Block this Caller' : 'Block/report spam'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Block this caller?', 'You will not receive phone calls, messages or FaceTime from people on your block list.', [['cancel', 'Cancel'], ['confirm', 'Block Contact']])
            : dialog(p, 'Block 07700 900842?', '☑ Report call as spam', [['cancel', 'Cancel'], ['confirm', 'Block']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Block Contact' : 'Block'}.</strong>${p === 'android' ? ' Leaving "Report call as spam" ticked helps warn other people.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Blocked! You can also <strong>silence all calls from numbers you don\'t know</strong>. <strong>Tap Settings.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Scroll to the bottom and <strong>tap Apps</strong>.'},
            {screen: () => list(p, 'Apps', [{id: 'app-phone', label: 'Phone'}, {id: 'app-messages', label: 'Messages'}, {id: 'app-mail', label: 'Mail'}], {back: 'Settings'}), target: 'app-phone', say: '<strong>Tap Phone.</strong>'},
            {screen: c => list(p, 'Phone', [{id: 'silence', label: 'Silence Unknown Callers', toggle: !!c.silence}, {id: 'blocked', label: 'Blocked Contacts', value: '1'}], {back: 'Apps'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Turn on Silence Unknown Callers.</strong> Calls from numbers not in your contacts go straight to voicemail, and still show in your recent calls.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Blocked! You can also <strong>filter spam calls</strong>. <strong>Tap the three dots ⋮</strong> at the top right.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Tap Settings.</strong>'},
            {screen: () => list(p, 'Settings', [{id: 'caller-id', label: 'Caller ID &amp; spam'}, {id: 'blocked', label: 'Blocked numbers'}, {id: 'sounds', label: 'Sounds and vibration'}]), target: 'caller-id', say: '<strong>Tap Caller ID &amp; spam.</strong>'},
            {screen: c => list(p, 'Caller ID &amp; spam', [{id: 'caller-show', label: 'See caller and spam ID', toggle: true}, {id: 'silence', label: 'Filter spam calls', toggle: !!c.silence, sub: 'Suspected spam calls won\'t ring your phone'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Turn on Filter spam calls.</strong> Suspected scam calls won\'t ring your phone.'},
        ]),
        {screen: c => list(p, 'Done', [{label: 'Blocked numbers', value: '1'}, {label: p === 'ios' ? 'Silence Unknown Callers' : 'Filter spam calls', toggle: true}]),
         question: {q: 'Could silencing unknown callers mean you miss a genuine call, like a hospital or delivery driver?', options: [
            {t: 'Yes, so check your voicemail and missed calls now and then', ok: true, why: 'Exactly. Genuine callers usually leave a message, and missed calls still show in your list.'},
            {t: 'No, they\'ll always get through', why: 'Unknown numbers go to voicemail, including genuine ones. Check your voicemail and missed calls from time to time.'}]}},
        {screen: () => list(p, 'Done', [{label: 'Blocked numbers', value: '1'}, {label: p === 'ios' ? 'Silence Unknown Callers' : 'Filter spam calls', toggle: true}]), done: true,
         say: '<strong>Well done!</strong> You\'ve blocked a nuisance number and cut down scam calls.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: your parcel is on hold due to an unpaid £1.45 fee. Pay now to rebook: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="fwd-to">To: ${field('fwdto', 'Number', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="wa-bubble me sms fwd"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="wa-bubble them"><span>Thank you. Please send the phone number the scam text came from.</span><small>now</small></div>' : ''}${ctx.sentNumber ? `<div class="wa-bubble me sms"><span>${esc(ctx.sentNumber)}</span></div><div class="wa-bubble them"><span>Thank you, your report has been received.</span></div>` : ''}`
            : `<button type="button" class="wa-bubble them old" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}
            <div class="msg-head">${p === 'ios' ? '<span class="msg-back">‹</span>' : '<span class="msg-back">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'New message') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="wa-thread">${thread}</div>
            ${ctx.sent7726 ? `<div class="msg-bar">${field('reportnum', 'Text message', ctx, 'tel')}<button type="button" class="wa-send" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="msg-bar"><span class="msg-box"></span><button type="button" class="wa-send" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ph-sheet"><div class="ph-sheet-box"><button type="button" class="ph-btn-text" data-tap="copy">Copy</button>
                <button type="button" class="ph-btn-text" data-tap="forward">${p === 'ios' ? 'More… then Forward' : 'Forward'}</button><button type="button" class="ph-btn-text danger" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'You\'ve had a scam text pretending to be Royal Mail. Before deleting it, report it, for free. <strong>Open Messages.</strong>'},
        {screen: () => app(p, 'Messages', '<div class="recents"><button type="button" class="recent unread" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Tap the message</strong> to open it. Don\'t tap the link inside it!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Press and hold the message</strong> (keep your finger on it) until a menu appears. Don\'t tap the link.', hint: 'Keep your finger on the grey message bubble for a second or two.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Tap More…</strong>, then the forward arrow (here, one button does both).' : '<strong>Tap Forward.</strong> (On some phones, it\'s under the three dots ⋮ at the top.)',
         hints: {delete: 'Report it first, then you can delete it.', copy: 'Tap Forward to send it on to 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'In the "To" box, type 7726 (it spells SPAM on a phone keypad), then tap send.',
         action: c => { c.sent7726 = true; }, say: 'In the <strong>To</strong> box, type <strong>7726</strong>. (On the keypad it spells S-P-A-M.) Then <strong>tap send</strong> ➤. It\'s free.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Type the scammer\'s number, 07700 900911, then tap send.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 replies, asking which number the scam came from. <strong>Type 07700 900911</strong> and <strong>tap send</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'You\'ve reported it. What should you do with the scam text now?', options: [
            {t: 'Delete it, and block the number', ok: true, why: 'Yes. It\'s reported, so you can delete it. Blocking stops more texts from that number.'},
            {t: 'Tap the link to check if it\'s real', why: 'Never tap links in scam texts. Delete it and block the number.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Well done!</strong> You\'ve reported a scam text to 7726, which helps networks block it for everyone. Scam emails go to report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Updates fix security problems, so they\'re important. Plug your phone in and connect to Wi-Fi first. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Tap General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'About'}, {id: 'software', label: 'Software Update', value: '1'}, {id: 'storage', label: 'iPhone Storage'}], {back: 'Settings'}), target: 'software', say: '<strong>Tap Software Update.</strong> The red 1 means an update is waiting.'},
        {screen: () => list(p, 'Software Update', [{id: 'auto', label: 'Automatic Updates', value: 'Off'}], {back: 'General',
            bottom: '<div class="upd-card"><strong>iOS update</strong><p>This update includes important security fixes and is recommended for all users.</p><button type="button" class="ph-btn ios-blue" data-tap="update-now">Update Now</button></div>'}),
         target: 'update-now', say: '<strong>Tap Update Now.</strong>', hints: {auto: 'Automatic updates are worth turning on too, after this. First, tap Update Now.'}},
        {screen: c => codeScreen(p, c, 'Enter Passcode', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'Your iPhone asks for your passcode. <strong>Type the practice code 4 7 1 9 3 6.</strong>', hint: 'Type 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Software Update', [], {back: 'General', bottom: `<div class="upd-card"><strong>${c.busy ? 'Downloading…' : 'Ready to install'}</strong><div class="upd-bar"><span class="${c.busy ? 'go' : 'full'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ph-btn ios-blue" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'It downloads first, which can take a few minutes. Then <strong>tap Install Now</strong>. Your phone restarts, so do it when you won\'t need it for 15 to 30 minutes.'},
        {screen: () => list(p, 'Software Update', [{id: 'auto', label: 'Automatic Updates', value: 'On'}], {back: 'General', bottom: '<div class="upd-card"><strong>Your iPhone is up to date</strong></div>'}),
         question: {q: 'Is it worth turning on Automatic Updates?', options: [
            {t: 'Yes, then it updates overnight while charging', ok: true, why: 'Exactly. Settings > General > Software Update > Automatic Updates. It installs overnight when plugged in and on Wi-Fi.'},
            {t: 'No, updates are optional', why: 'Updates fix security holes that scammers use. Automatic updates keep you safe without remembering.'}]}},
        {screen: () => list(p, 'Software Update', [], {bottom: '<div class="upd-card"><strong>Your iPhone is up to date ✓</strong></div>'}), done: true, say: '<strong>Well done!</strong> Your phone is updated and protected against the latest problems.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Updates fix security problems, so they\'re important. Plug your phone in and connect to Wi-Fi first. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Scroll down and <strong>tap System</strong>. <em>On a Samsung, it\'s Software update, near the bottom.</em>'},
        {screen: () => list(p, 'System', [{id: 'languages', label: 'Languages'}, {id: 'date', label: 'Date &amp; time'}, {id: 'software', label: 'Software updates', sub: 'Update available'}]), target: 'software', say: '<strong>Tap Software updates.</strong>'},
        {screen: () => list(p, 'Software updates', [{id: 'system-update', label: 'System update', sub: 'Update available'}, {id: 'play-update', label: 'Google Play system update'}]), target: 'system-update', say: '<strong>Tap System update.</strong>'},
        {screen: () => list(p, 'System update', [], {bottom: '<div class="upd-card"><strong>System update available</strong><p>Includes important security fixes.</p><button type="button" class="ph-btn and-green" data-tap="download">Download &amp; install</button></div>'}),
         target: 'download', say: '<strong>Tap Download &amp; install.</strong>'},
        {screen: c => list(p, 'System update', [], {bottom: `<div class="upd-card"><strong>${c.busy ? 'Downloading and installing…' : 'Restart to finish'}</strong><div class="upd-bar"><span class="${c.busy ? 'go' : 'full'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ph-btn and-green" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'It downloads and gets ready, which can take a while. Then <strong>tap Restart now</strong>. Your phone switches off and on again, which takes a few minutes.'},
        {screen: () => list(p, 'System update', [], {bottom: '<div class="upd-card"><strong>Your system is up to date</strong></div>'}),
         question: {q: 'Your phone hasn\'t had an update for years. What might that mean?', options: [
            {t: 'It may be too old to get security updates, so it\'s less safe', ok: true, why: 'Yes. Older phones stop getting updates. Avoid banking on them, and consider replacing them when you can.'},
            {t: 'It\'s working perfectly', why: 'Phones stop getting updates after a few years, which leaves security holes unfixed.'}]}},
        {screen: () => list(p, 'System update', [], {bottom: '<div class="upd-card"><strong>Your system is up to date ✓</strong></div>'}), done: true, say: '<strong>Well done!</strong> Your phone is updated and protected against the latest problems.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="set-row static"><span>Sarah (Daughter)</span><span class="set-val">07700 900333</span></div>' : '<button type="button" class="set-row link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Medical ID' : 'Medical information', [], {noBack: true, top: `<div class="med-form">
            <label class="med-label">Medical conditions</label>${field('conditions', 'e.g. Type 2 diabetes', ctx)}
            <label class="med-label">Allergies &amp; reactions</label>${field('allergies', 'e.g. Penicillin', ctx)}
            <div class="set-caption">EMERGENCY CONTACTS</div><div class="set-group">${ec}</div>
            ${p === 'ios' ? `<div class="set-group"><div class="set-row static"><span>Show When Locked</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="save">${p === 'ios' ? 'Done' : 'Save'}</button></div>`,
            overlay: ctx.picking ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Choose a contact</strong></p>
                <button type="button" class="set-row" data-tap="ec-sarah">Sarah</button><button type="button" class="set-row" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Health', '#fff', ICON2.health]]), target: 'health', say: 'A <strong>Medical ID</strong> lets paramedics see your allergies and emergency contact, even when your phone is locked. <strong>Open the Health app.</strong>'},
            {screen: () => app(p, 'Summary', '<p class="app-note">Your health data is shown here.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="app-plus" data-tap="profile" aria-label="Your profile">👤</button>'}),
             target: 'profile', say: '<strong>Tap your picture</strong> at the top right.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Health Details'}, {id: 'medical', label: 'Medical ID'}], {back: 'Summary'}), target: 'medical', say: '<strong>Tap Medical ID.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Your phone can store <strong>medical information</strong> that paramedics can see, even when it\'s locked. <strong>Tap Settings.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Scroll down and <strong>tap Safety &amp; emergency</strong>. <em>On a Samsung, it\'s Safety and emergency.</em>'},
            {screen: () => list(p, 'Safety &amp; emergency', [{id: 'medical', label: 'Medical information'}, {id: 'contacts-ec', label: 'Emergency contacts'}, {id: 'sos', label: 'Emergency SOS'}]), target: 'medical', say: '<strong>Tap Medical information.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Type an allergy first (for practice, "Penicillin"), then add an emergency contact.',
         say: 'Fill in anything paramedics should know. For practice, type <strong>Penicillin</strong> under allergies. Then <strong>tap add emergency contact</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Choose who to call in an emergency. <strong>Tap Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '"Show When Locked" is on, so paramedics can see it. <strong>Tap Done.</strong>' : '<strong>Tap Save.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Medical ID' : 'Medical information', [{label: 'Allergies', sub: typed(c, 'allergies')}, {label: 'Emergency contact', sub: 'Sarah (Daughter)'}]),
         question: {q: p === 'ios' ? 'How would a paramedic see your Medical ID if your phone is locked?' : 'How would a paramedic see this if your phone is locked?', options: [
            {t: 'Through the "Emergency" button on the lock screen', ok: true, why: 'Yes. Tapping Emergency on the lock screen shows your medical information, without unlocking your phone.'},
            {t: 'They can\'t', why: 'They can: the Emergency button on the lock screen shows it, without needing your passcode.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Medical ID' : 'Medical information', [{label: 'Allergies', sub: typed(c, 'allergies')}, {label: 'Emergency contact', sub: 'Sarah (Daughter)'}]), done: true,
         say: '<strong>Well done!</strong> Your medical information and emergency contact are saved. If you call for help with Emergency SOS, your emergency contact is told too.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Find My' : 'Find Hub', `<div class="map"><span class="map-road a"></span><span class="map-road b"></span><span class="map-pin">📱</span><span class="map-label">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="find-card"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="find-btns"><button type="button" data-tap="play-sound">${ctx.ringing ? '🔔 Playing sound…' : '🔊 Play Sound'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Mark As Lost' : 'Secure device'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'If your phone is ever lost, you can find it, make it ring or lock it, but only if this is switched on first. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Tap your name</strong> at the top.'},
            {screen: () => list(p, 'Apple Account', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Find My'}, {id: 'family', label: 'Family Sharing'}], {back: 'Settings'}), target: 'findmy', say: '<strong>Tap Find My.</strong>'},
            {screen: c => list(p, 'Find My', [{id: 'find-toggle', label: 'Find My iPhone', toggle: !!c.findOn}, {label: 'Send Last Location', toggle: !!c.findOn}], {back: 'Apple Account'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Turn on Find My iPhone.</strong> "Send Last Location" sends its location just before the battery dies.'},
            {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Now imagine you can\'t find your phone. On another Apple device you\'d open <strong>Find My</strong> (or go to icloud.com/find on a computer). Here, <strong>tap Find My</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Scroll down and <strong>tap Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'All services'}, {id: 'account', label: 'Manage your Google Account'}]), target: 'all-services', say: '<strong>Tap All services.</strong>'},
            {screen: () => list(p, 'All services', [{id: 'find-hub', label: 'Find Hub', sub: 'Previously called Find My Device'}, {id: 'theft', label: 'Theft protection'}]), target: 'find-hub', say: '<strong>Tap Find Hub</strong> (it used to be called Find My Device). <em>Samsung also has its own: Settings &gt; Security and privacy &gt; Lost device protection.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Use Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Turn on Use Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Now imagine you can\'t find your phone. On another phone or tablet you\'d open <strong>Find Hub</strong>, or go to google.com/android/find on a computer. Here, <strong>tap Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'There it is, on the map. If it\'s somewhere nearby, like down the side of the sofa, <strong>tap Play Sound</strong>: it rings loudly, even on silent.'},
        {screen: c => findMap(p, c), question: {q: 'The map shows your phone somewhere you\'ve never been. What should you do?', options: [
            {t: 'Use Mark As Lost or Secure device to lock it, and contact the police', ok: true, why: 'Yes. Lock it from Find My or Find Hub, don\'t go there yourself, and report it to the police and your network.'},
            {t: 'Go and get it back yourself', why: 'Never confront a thief. Lock the phone remotely and contact the police.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Well done!</strong> Finding your phone is switched on, and you know how to make it ring or lock it.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="cam-scene qr"><div class="cam-poster"><strong>Free tech tips</strong>${UI.qr}<small>Scan me</small></div>
                ${ctx.busy ? '' : `<button type="button" class="qr-chip" data-tap="qr-link">🌐 jamesgartshore.co.uk</button>`}</div>`
            : `<div class="cam-scene"><span class="cam-sun">☀️</span><span class="cam-flower">🌻🌷🌻</span></div>`;
        return `<div class="cam-screen">${statusBar(p)}${view}
            <div class="cam-bar"><button type="button" class="cam-thumb" data-tap="thumb" aria-label="Last photo">${ctx.taken ? '🌻' : ''}</button>
            <button type="button" class="cam-shutter" data-tap="shutter" aria-label="Take photo"></button><span class="cam-flip">${UI.flip}</span></div>${homeIndicator(p)}</div>`;
    }
    function photoView(p, ctx) {
        const zoom = 1 + 0.5 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="photo-view">${statusBar(p)}<div class="pv-img"><span style="transform:scale(${zoom})">🌻🌷🌻</span></div>
            <div class="pv-zoom"><button type="button" data-tap="zoom-in" aria-label="Zoom in">${UI.plus}</button></div>
            <div class="pv-bar"><button type="button" data-tap="share" aria-label="Share">${UI.share}</button><button type="button" data-tap="favourite" aria-label="Favourite">${UI.heart}</button><button type="button" data-tap="delete" aria-label="Delete">${UI.bin}</button></div>
            ${ctx.sheet === 'share' ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Share with</strong></p><div class="wa-attach">
                <button type="button" data-tap="share-messages"><span style="background:#22c55e">💬</span>Messages</button><button type="button" data-tap="share-mail"><span style="background:#3b82f6">✉️</span>Mail</button>
                <button type="button" data-tap="share-other"><span style="background:#94a3b8">⋯</span>More</button></div></div></div>` : ''}
            ${ctx.sheet === 'delete' ? dialog(p, 'Delete this photo?', p === 'ios' ? 'It will be kept in Recently Deleted for 30 days.' : 'It will be moved to the bin for a while before it\'s gone.', [['cancel', 'Cancel'], ['confirm-delete', 'Delete']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Open the Camera.</strong> <em>Tip: on most phones you can also swipe left on the lock screen.</em>', hint: 'The camera is the grey icon with a camera on it.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Point it at the flowers and hold steady. <strong>Tap the big round button</strong> to take a photo.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Snap! It\'s saved. <strong>Tap the little picture</strong> in the corner to see it.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'To look closer, put two fingers on the photo and spread them apart. Here, <strong>tap ＋ twice</strong>.', hint: 'Tap the ＋ at the top right.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Lovely! To send it to someone, <strong>tap the share button</strong> ⇪ (a box with an arrow).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Choose how to send it: Messages, email, WhatsApp and so on. <strong>Tap Messages.</strong> (You\'d then pick who to send it to.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Sent! Now, if you take a photo you don\'t want, <strong>tap the bin</strong> 🗑 to delete it.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Your phone checks first. <strong>Tap Delete.</strong>'},
        {screen: () => app(p, 'Photos', '<p class="app-note">No photos yet.</p>', {back: false, color: '#fff'}), question: {q: 'You deleted a photo by mistake! What can you do?', options: [
            {t: p === 'ios' ? 'Look in Albums > Recently Deleted and recover it' : 'Look in the Bin (Library > Bin) and restore it', ok: true, why: 'Yes. Deleted photos are kept for a while, usually about a month, so you can get them back.'},
            {t: 'Nothing, it\'s gone forever', why: 'Don\'t worry! It\'s kept in Recently Deleted (iPhone) or the Bin (Android) for a while.'}]}},
        {screen: () => app(p, 'Photos', '<p class="app-note">All done.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Well done!</strong> You can take, zoom into, share and delete photos.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'If your family have iPhones too, <strong>FaceTime</strong> makes free video calls. <strong>Tap FaceTime.</strong>' : '<strong>Google Meet</strong> makes free video calls from Android, and to iPhones too. <strong>Tap Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ph-btn ${p === 'ios' ? 'and-green' : 'ios-blue'}" data-tap="new-call">${p === 'ios' ? 'New FaceTime' : 'New'}</button><p class="app-note">Recent calls appear here.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'New FaceTime' : 'New'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'New FaceTime' : 'Call', `<div class="fwd-to">To: ${field('callto', 'Name or number', c)}</div>
                <button type="button" class="ph-btn ${p === 'ios' ? 'and-green' : 'ios-blue'}" data-tap="video-start">🎥 ${p === 'ios' ? 'FaceTime' : 'Video call'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Type Sarah in the "To" box first.',
             say: 'Type the name of someone in your contacts. <strong>Type Sarah</strong>, then <strong>tap the video button</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'It rings, then Sarah answers. To show her the garden, <strong>tap the flip button</strong> 🔄 to use the camera on the back.', hint: 'Wait for Sarah to answer, then tap 🔄.'},
            {screen: c => waCall(p, c), target: 'end', say: 'When you\'ve finished, <strong>tap the red button</strong> to hang up.'},
            {screen: () => app(p, appName, '<p class="app-note">Sarah · Video · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'Your friend has an Android phone and you have an iPhone. Can you still video call?', options: [
                {t: 'Yes, using WhatsApp or Google Meet, which work on both', ok: true, why: 'Exactly. FaceTime is mainly iPhone to iPhone. WhatsApp and Google Meet work across both.'},
                {t: 'No, never', why: 'You can: WhatsApp and Google Meet work on both kinds of phone.'}]}},
            {screen: () => app(p, appName, '<p class="app-note">All done.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Well done!</strong> You\'ve made a video call and shown the view from your back camera.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR codes are those square black-and-white patterns on posters and menus. Your camera can read them, no extra app needed. <strong>Open the Camera.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Point the camera at the code and hold still for a moment. A <strong>link appears on the screen</strong>: check it looks like who you\'d expect, then <strong>tap it</strong>.',
         hints: {shutter: 'No need to take a photo: just point and wait for the link to appear, then tap the link.'},
         hint: p === 'android' ? 'Wait for the link to appear, then tap it. If nothing appears, try Google Lens.' : 'Wait for the link to appear, then tap it.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="web-page"><h3>Free tech tips</h3><p>Plain-English tips on phones, computers and staying safe online.</p></div>', {color: '#f8fafc'}),
         question: {q: 'You see a QR code sticker on a car park payment machine. What\'s the safest way to pay?', options: [
            {t: 'Use the car park\'s official app or the machine, not a stuck-on QR code', ok: true, why: 'Yes. Scammers stick fake QR codes over real ones to steal card details. Check whether it\'s a sticker, and use the official app or sign.'},
            {t: 'Scan it and pay, it\'s quicker', why: 'Fake QR stickers on car park machines are a known scam. Use the official app or the machine itself.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="web-page"><h3>Free tech tips</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Well done!</strong> You can scan QR codes with your camera, and you know to check the link first.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Photos from Sunday 📷', 'Hi Mum, here are the photos from lunch…'],
                       ['tv', 'TV Licensing', 'Your licence has EXPIRED', 'Act now to avoid prosecution. Update your payment…'],
                       ['library', 'Bridlington Library', 'Your books are due', 'Your items are due back on Friday.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Inbox' : 'Primary', `<div class="recents">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="recent${ctx.read && ctx.read.includes(id) ? '' : ' unread'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · to me</p><h3>Photos from Sunday 📷</h3><p>Hi Mum, here are the photos from lunch. Lovely to see you! x</p>
                <div class="mail-att">🖼️ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Write your reply…', ctx)}<button type="button" class="ph-btn ios-blue" data-tap="send">Send</button>`
                : '<button type="button" class="ph-btn-text" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="mail-from" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Your licence has EXPIRED</h3><p>Act now to avoid prosecution. Update your payment details within 24 hours: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ph-btn danger-btn" data-tap="junk">${p === 'ios' ? 'Move to Junk' : '⋮ Report phishing'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Mail' : 'your email app (Gmail on most Android phones)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'New emails are in bold. <strong>Tap Sarah\'s email</strong> to read it.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'To answer, <strong>tap Reply</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Type a short reply first, then tap Send.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Type a short reply</strong> (like "Thank you, love them!") and <strong>tap Send</strong>.'},
        {screen: () => app(p, '', '<p class="app-note">Sent ✓</p><button type="button" class="ph-btn-text" data-tap="back">‹ Back to inbox</button>', {color: '#fff'}), target: 'back', say: '<strong>Tap Back</strong> to go back to your inbox.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'There\'s a worrying email from "TV Licensing". <strong>Open it</strong>, but don\'t tap anything inside.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Scam emails often use a real name but a fake address. <strong>Tap the sender\'s name</strong> to see the real email address.',
         hint: 'Tap "TV Licensing" at the top of the email.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'It\'s from <strong>outlook-mail.com</strong>, not tvlicensing.co.uk. It\'s a scam. <strong>Tap ' + (p === 'ios' ? 'Move to Junk' : 'Report phishing') + '.</strong> You can also forward scam emails to report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'What gave the scam away?', options: [
            {t: 'The sender\'s real address, the threats and the 24-hour deadline', ok: true, why: 'Exactly. Real organisations don\'t threaten you with deadlines, and their emails come from their own web address.'},
            {t: 'Nothing, it looked real', why: 'Check the sender\'s address: it wasn\'t TV Licensing\'s. Threats and tight deadlines are big warning signs too.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Well done!</strong> You can read and reply to emails, and spot and report a scam.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Get' : 'Install';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="ph-app-screen ph-${p}">${statusBar(p)}<div class="st-searchfield small">${ICON.search}<span>nhs app</span></div>
            <div class="st-results">${rows.map(r => `<div class="st-row">${appIcon(r.bg, ICON2.heart)}<div class="st-info"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="st-ad">Ad</em>' : ''}</span><span class="st-meta">${r.rating} ★</span></div>
            <button type="button" class="st-get" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Tap Search.</strong>' : '<strong>Tap the search bar.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'We searched for "NHS App". Lots of apps use "NHS" in their name. Check <strong>who made it</strong>: the real one is by <strong>NHS England</strong>. <strong>Tap ' + (p === 'ios' ? 'Get' : 'Install') + ' next to the real one.</strong>',
         hints: {'fake1-get': 'That\'s by HealthApps Ltd, and it\'s an advert. The real NHS App is made by NHS England.', 'fake2-get': 'That\'s by QuickDev Apps, not the NHS. The real one is made by NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Installed! Now remove an app you never use, to tidy up and free up space. <strong>Press and hold the Weather app</strong> until a menu appears.', hint: 'Keep your finger on the Weather icon for a second or two.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Remove "Weather"?' : 'Weather', p === 'ios' ? 'Removing from Home Screen will keep the app in your App Library.' : '', p === 'ios'
            ? [['delete-app', 'Delete App'], ['remove-home', 'Remove from Home Screen'], ['cancel', 'Cancel']] : [['app-info', 'App info'], ['delete-app', 'Uninstall'], ['cancel', 'Cancel']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Tap Remove App</strong>, then <strong>Delete App</strong> (here it\'s one button).' : '<strong>Tap Uninstall.</strong>',
         hints: {'remove-home': 'That only hides the icon; the app stays on your phone. Tap Delete App.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'An app asks for a payment to "unlock" your NHS records. What do you think?', options: [
            {t: 'It\'s not the real NHS App, which is completely free', ok: true, why: 'Exactly. The NHS App is free. Delete anything that asks you to pay for NHS services.'},
            {t: 'Pay, it\'s for the NHS', why: 'The real NHS App is free and made by NHS England. An app asking for money is not the real one.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Well done!</strong> You can tell real apps from lookalikes, and remove apps you don\'t need.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="nhs-login"><p>Welcome back.</p>
                <button type="button" class="ph-btn ios-blue" data-tap="faceid">${p === 'ios' ? 'Log in with Face ID' : 'Log in with fingerprint'}</button>
                <button type="button" class="ph-btn-text" data-tap="password">Log in with email and password</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '💊', 'Prescriptions'], ['appointments', '📅', 'Appointments'], ['records', '📋', 'Your health'], ['messages', '✉️', 'Messages']];
            return app(p, 'NHS App', `<p class="app-note">Good morning, Margaret</p><div class="tiles">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Prescriptions', '<div class="recents"><button type="button" class="recent" data-tap="order"><strong>Order a repeat prescription</strong><small>Choose medicines you\'re already prescribed</small></button><div class="recent"><strong>View your orders</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipine 5mg tablets'], ['med-2', 'Atorvastatin 20mg tablets']];
            return app(p, 'Choose medicines', `<div class="recents">${meds.map(([id, name]) => `<button type="button" class="recent check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="box">${(ctx.meds || []).includes(id) ? '✓' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ph-btn ios-blue" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Confirm your order', `<p class="app-note">Amlodipine 5mg tablets<br>Collect from: Your nominated pharmacy</p><button type="button" class="ph-btn ios-blue" data-tap="confirm">Confirm and order</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Order sent', '<p class="app-note">✓ Your prescription request has been sent to your GP surgery. It usually takes 2 to 3 working days.</p><button type="button" class="ph-btn-text" data-tap="home">Back to home</button>', {color: NHS});
        return app(p, 'Appointments', '<div class="recents"><div class="recent"><strong>GP appointment</strong><small>Tuesday at 10:30 · Your GP surgery</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: 'The <strong>NHS App</strong> is free and lets you order repeat prescriptions, see appointments and more. (This practice version is pretend, made just for this lesson.) <strong>Tap NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Once you\'ve set it up with NHS login, you can log in with your ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Tap Log in with ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'That works too, but your face or fingerprint is quicker. Tap the blue button.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Tap Prescriptions.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Tap Order a repeat prescription.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Tap a medicine to tick it first, then tap Continue.',
         say: '<strong>Tap the medicine you need</strong> to tick it (try Amlodipine), then <strong>tap Continue</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Check it\'s right, then <strong>tap Confirm and order</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Sent to your surgery! <strong>Tap Back to home.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'You can also check your appointments. <strong>Tap Appointments.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'A text says "NHS: you\'re eligible for a free test kit, enter your bank details to pay postage". What is it?', options: [
            {t: 'A scam. The NHS never asks for bank details by text', ok: true, why: 'Exactly. Use the NHS App or your GP surgery directly, never links in texts.'},
            {t: 'Real, it\'s only postage', why: 'The NHS never texts asking for bank details. It\'s a scam: forward it to 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Well done!</strong> You\'ve ordered a repeat prescription and checked your appointments.'},
    ], {meds: []});

    // ticking medicines happens on the "choose" step (free taps), so handle it here
    const _nhs = SCENARIOS['nhs-app'];
    SCENARIOS['nhs-app'] = p => {
        const steps = _nhs(p);
        const choose = steps.find(s => s.require);
        const baseScreen = choose.screen;
        choose.hints = {};
        choose.onFree = (c, id) => { c.meds = (c.meds || []).includes(id) ? c.meds.filter(m => m !== id) : [...(c.meds || []), id]; };
        choose.screen = baseScreen;
        return steps;
    };

    const BANK = '#0f766e';
    function bankScreen(p, ctx, page) {
        if (page === 'login') return app(p, 'Practice Bank', `<div class="nhs-login"><p>Log in</p><button type="button" class="ph-btn and-green" data-tap="faceid">${p === 'ios' ? 'Log in with Face ID' : 'Log in with fingerprint'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Your accounts', '<button type="button" class="bank-acc" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="bank-acc"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Today'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Today'], ['txn-pension', 'State Pension', '+£921.60', 'Yesterday'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Mon']];
            return app(p, 'Current account', `<p class="app-note">Balance <strong>£1,284.50</strong></p><div class="recents">${t.map(([id, n, a, d]) => `<button type="button" class="recent" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'in' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Payment', `<div class="pay-detail"><span class="pay-amount">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Today, 03:12 · Card ending 4421</small></div>
            <div class="recents"><button type="button" class="recent" data-tap="freeze"><strong>❄️ Freeze card</strong><small>${ctx.frozen ? 'Card frozen ✓' : 'Stop payments straight away'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="recent" data-tap="report"><strong>Report this payment</strong><small>Don\'t recognise it? Tell us</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Bank', BANK, ICON2.pound]]), target: 'bank',
         say: 'Banking apps let you check your money any time. (This is a pretend bank for practice.) <strong>Open the Bank app.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Log in with your ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Never share your banking passcode with anyone.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Tap your Current account</strong> to see what\'s been paid in and out.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Look through the payments. One of them you don\'t recognise: <strong>£249 at 3am, to a gift card website</strong>. <strong>Tap it.</strong>',
         hints: {'txn-tesco': 'That\'s your shopping. Look for one you don\'t recognise.', 'txn-pension': 'That\'s your pension being paid in. Look for the odd one out.', 'txn-water': 'That\'s your water bill. Look for the odd one out.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Tap Freeze card</strong>. It stops any more payments straight away, and you can unfreeze it later if it turns out to be fine.',
         hints: {report: 'Freeze the card first, to stop more payments. Then report it.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'You\'ve frozen the card. What next?', options: [
            {t: 'Call your bank on 159 or the number on the card, or report it in the app', ok: true, why: 'Yes. They can investigate, cancel the card and often get the money back. The sooner you tell them, the better.'},
            {t: 'Wait and see if it happens again', why: 'Tell your bank straight away. The sooner they know, the more they can do.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Well done!</strong> You checked your account, spotted a payment you didn\'t recognise, and froze your card.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="pay-card${ctx.added ? '' : ' faded'}"><strong>Practice Bank</strong><span>•••• 4421</span><small>DEBIT</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `<p class="app-note">Add a card to pay in shops with your phone.</p><button type="button" class="ph-btn ios-blue" data-tap="add">${p === 'ios' ? '＋ Add card' : '＋ Add to Wallet'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Add card', `<div class="scan-card-frame">${ctx.busy ? '<span class="scan-line"></span>' : ''}${card}</div>
            <p class="app-note">${ctx.busy ? 'Hold your card in the frame…' : 'Card found ✓'}</p>${ctx.busy ? '' : '<button type="button" class="ph-btn ios-blue" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Verify card', `<p class="app-note">Your bank needs to check it\'s you. Choose how to get a code:</p><div class="recents">
            <button type="button" class="recent" data-tap="verify-text"><strong>Text message</strong><small>to ••••• •••123</small></button><button type="button" class="recent" data-tap="verify-call"><strong>Call your bank</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Enter code', `<div class="ph-notif static"><strong>Messages · now</strong><span>Practice Bank: your Wallet code is 529173. Never share it.</span></div>
            <div class="wa-code">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `${card}<p class="app-note">✓ Your card is ready to use.</p>`, {back: false, color});
        return `<div class="pay-screen">${statusBar(p)}${card}<p class="pay-text">${ctx.busy ? (p === 'ios' ? 'Hold near reader…' : 'Hold to reader…') : '✓ Done'}</p>
            <div class="reader">💳 £4.20</div>${p === 'ios' ? `<button type="button" class="side-btn tall" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Wallet' : 'Wallet', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Paying with your phone is quick and safe: shops never see your card number. <strong>Open ${p === 'ios' ? 'Wallet' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Add card' : '＋ Add to Wallet'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Your phone uses the camera to read your card, so you don\'t have to type the number. <strong>Hold your card in the frame</strong>, then <strong>tap Next</strong>. <em>Never type your card number into a website from a text or email.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Your bank checks it\'s really you. <strong>Tap Text message.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'A code arrives by text from your bank. <strong>Type 5 2 9 1 7 3.</strong> Remember: this code is only ever typed into your own phone, never given to anyone who asks for it.', hint: 'Type the code from the message: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Your card is ready. Now let\'s pay in a shop. <strong>Tap anywhere on the card.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'At the till, <strong>double-click the side button</strong> on your iPhone (tap ⏻ twice here), look at the screen for Face ID, then hold the top of your phone near the card reader.', hint: 'Tap the ⏻ button on the side twice.'}
            : {target: 'pay-now', say: 'At the till, just <strong>unlock your phone and hold the back of it near the card reader</strong>. Here, <strong>tap the card reader</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Is paying with your phone safe?', options: [
            {t: 'Yes, safer than your card: it needs your face, fingerprint or passcode, and shops don\'t see your card number', ok: true, why: 'Exactly. And if you lose your phone, nobody can pay with it without unlocking it.'},
            {t: 'No, anyone could use it', why: 'Each payment needs your face, fingerprint or passcode, so it\'s actually safer than a contactless card.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Well done!</strong> Your card is in your phone and you\'ve made a practice payment.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="pay-card', '<button type="button" data-tap="home-go" class="pay-card-btn"><div class="pay-card').replace('<small>DEBIT</small></div>', '<small>DEBIT</small></div></button>');
        const pay = steps.find(s => s.target === 'pay-now');
        if (pay) {
            const payScreen = pay.screen;
            pay.screen = c => payScreen({...c, busy: true}).replace('<div class="reader">', '<button type="button" class="reader" data-tap="pay-now">').replace('£4.20</div>', '£4.20</button>');
        }
        const iosPay = steps.find(s => s.sequence && s.sequence[0] === 'side');
        if (iosPay) { const sc = iosPay.screen; iosPay.screen = c => sc({...c, busy: true}); }
        return steps;
    };

    function trainScreen(p, ctx, page) {
        const color = '#7c2d12';
        if (page === 'plan') {
            return app(p, 'Practice Rail', `<div class="journey"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Choose station'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ✓' : 'Add a railcard'}</strong></button></div>
                <button type="button" class="ph-btn and-green" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Choose a station</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="set-row" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Add a railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'No railcard']].map(([id, t]) => `<button type="button" class="set-row" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Direct'], ['t-1145', '11:45', '12:32', 'Direct'], ['t-1245', '12:45', '13:32', 'Direct']];
            return app(p, 'Bridlington → Hull', `<div class="recents">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="recent" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="app-note small-note">Prices are made up for this practice. Railcard discount applied.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="recents"><button type="button" class="recent" data-tap="single"><strong>Off-Peak Single</strong><span>£7.40</span></button>
                <button type="button" class="recent" data-tap="return"><strong>Off-Peak Day Return</strong><small>Come back today</small><span>£9.85</span></button></div>
                <button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Your ticket', `<div class="ticket"><strong>Off-Peak Day Return</strong><span>Bridlington ⇄ Hull</span><span>Today · Senior Railcard</span>
            ${UI.qr}<small>Scan this at the ticket gate, or show it to the guard.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Trains', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Train apps let you buy tickets on your phone, with no queue. (This practice app is pretend: prices and times are made up.) <strong>Open Trains.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'You\'re going from Bridlington. <strong>Tap To</strong> to choose where you\'re going.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Tap Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Over 60? A <strong>Senior Railcard</strong> saves a third on most tickets. <strong>Tap Railcard</strong> to add yours.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Tap Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Tap Find trains.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Here are the trains. <strong>Tap the 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Coming back today? A day return is usually cheaper than two singles. <strong>Tap Off-Peak Day Return</strong>, then pay.',
         hints: {single: 'A single is one way only. You\'re coming back today, so tap Off-Peak Day Return.', pay: 'Choose your ticket first: tap Off-Peak Day Return.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Tap ${p === 'ios' ? 'Pay' : 'G Pay'}</strong> to pay with the card in your phone (from the contactless lesson).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Your phone battery is low before your train home. What\'s a good idea?', options: [
            {t: 'Take a screenshot of the ticket, and turn on battery saving', ok: true, why: 'Yes. Some tickets work from a screenshot, and battery saving helps it last. Many apps also let you add the ticket to Wallet.'},
            {t: 'Nothing, it\'ll be fine', why: 'If your phone dies, you can\'t show your ticket. Take a screenshot and save battery.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Well done!</strong> You\'ve planned a journey, added a railcard and bought a ticket on your phone.'},
    ], {});

    // ---------- Engine ----------
    // The iPhone home bar / Android home button, as something you can tap (or swipe up on the iPhone).
    const navHome = p => p === 'ios'
        ? '<button type="button" class="ph-homebar-btn" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
        : '<div class="ph-androidnav"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';

    // ======================================================================================
    // Course: Everyday phone skills
    // ======================================================================================

    // Buttons on the edges of the phone. iPhone: volume on the left, side button on the right.
    // Android: power, then volume up and down, all on the right.
    function edgeButtons(p) {
        return p === 'ios'
            ? `<button type="button" class="edge-btn left at1" data-tap="vol-up" aria-label="Volume up button">+</button>
               <button type="button" class="edge-btn left at2" data-tap="vol-down" aria-label="Volume down button">−</button>
               <button type="button" class="edge-btn right at1" data-tap="side" aria-label="Side button">${UI.power}</button>`
            : `<button type="button" class="edge-btn right at0" data-tap="power" aria-label="Power button">${UI.power}</button>
               <button type="button" class="edge-btn right at1" data-tap="vol-up" aria-label="Volume up button">+</button>
               <button type="button" class="edge-btn right at2" data-tap="vol-down" aria-label="Volume down button">−</button>`;
    }

    const busTable = `<div class="bus-card"><strong>Bus 121: Bridlington to Hull</strong><small>Practice times only</small>
        <table class="bus-table"><tr><th>Bridlington</th><th>Driffield</th><th>Hull</th></tr>
        <tr><td>09:15</td><td>09:45</td><td>10:40</td></tr><tr><td>10:15</td><td>10:45</td><td>11:40</td></tr>
        <tr><td>11:15</td><td>11:45</td><td>12:40</td></tr><tr><td>12:15</td><td>12:45</td><td>13:40</td></tr></table></div>`;

    function shotScreen(p, ctx) {
        const thumb = ctx.shot && !ctx.saved
            ? `<button type="button" class="shot-thumb" data-tap="thumb" aria-label="Screenshot preview"><span class="shot-mini"></span></button>
               ${p === 'android' ? '<div class="shot-actions"><button type="button" data-tap="shot-share">Share</button><button type="button" data-tap="shot-edit">Edit</button></div>' : ''}` : '';
        const sheet = ctx.shareSheet ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Share screenshot</strong></p>
            <div class="share-row"><button type="button" data-tap="share-sarah">${avatar('S', '#f472b6')}<span>Sarah</span></button>
            <button type="button" data-tap="share-jean">${avatar('J', '#a78bfa')}<span>Jean</span></button>
            <button type="button" data-tap="share-email">${avatar('@', '#3b82f6')}<span>Email</span></button></div></div></div>` : '';
        return app(p, 'Bus times', busTable, {back: false, color: '#fff',
            overlay: (ctx.shot ? '' : edgeButtons(p)) + thumb + sheet});
    }

    function shotEditor(p, ctx) {
        const sheet = ctx.doneSheet ? `<div class="ph-sheet"><div class="ph-sheet-box">
            <button type="button" class="ph-btn-text" data-tap="save-photos">Save to Photos</button>
            <button type="button" class="ph-btn-text" data-tap="save-files">Save to Files</button>
            <button type="button" class="ph-btn-text danger" data-tap="delete-shot">Delete Screenshot</button></div></div>` : '';
        return `<div class="ph-app-screen shot-edit ph-${p}">${statusBar(p)}
            <div class="shot-top"><button type="button" data-tap="done">Done</button><span>Screenshot</span><button type="button" data-tap="share" aria-label="Share">${UI.share}</button></div>
            <div class="shot-preview">${busTable}</div>
            <div class="shot-tools" aria-hidden="true"><span></span><span></span><span></span><span></span></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['screenshot'] = (p) => withCtx([
        {screen: c => shotScreen(p, c), sequence: p === 'ios' ? ['side', 'vol-up'] : ['power', 'vol-down'], action: c => { c.shot = true; },
         say: p === 'ios'
            ? 'A screenshot is a photo of whatever is on your screen, like these bus times. Press the <strong>side button</strong> (right) and <strong>volume up</strong> (left) at the same time, then let go. Here, <strong>tap the side button, then volume up</strong>.'
            : 'A screenshot is a photo of whatever is on your screen, like these bus times. Press the <strong>power button</strong> and <strong>volume down</strong> at the same time, then let go. Here, <strong>tap the power button, then volume down</strong>.',
         hints: {'vol-down': p === 'ios' ? 'On an iPhone it\'s volume UP, with the side button.' : 'Start with the power button, at the top of the right-hand side.',
                 'vol-up': p === 'ios' ? 'Start with the side button on the right.' : 'On Android it\'s volume DOWN, with the power button.',
                 side: 'Now the volume up button, on the left.', power: 'Now the volume down button.'},
         hint: p === 'ios' ? 'The side button is on the right edge. Volume up is on the left.' : 'The power button is the top button on the right edge.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Click! A small picture appears in the bottom corner. <strong>Tap it</strong> to see your screenshot. <em>If you leave it, it saves itself after a few seconds.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'You can draw on it or crop it here. <strong>Tap Done</strong> at the top left.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Tap Save to Photos.</strong>', hints: {'delete-shot': 'That would throw it away. Tap Save to Photos.', 'save-files': 'Files works too, but Photos is easier to find. Tap Save to Photos.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Click! A small picture appears with buttons underneath. It\'s already saved. <strong>Tap Share</strong> to send it to someone.', hints: {'shot-edit': 'Edit lets you crop or draw on it. For now, tap Share.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Tap Sarah</strong> to send her the bus times.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Where can you find your screenshots later?', options: [
            {t: 'In the Photos app, in the Screenshots album', ok: true, why: 'Yes. They\'re saved with your photos, so you can look at them, share them or delete them like any photo.'},
            {t: 'They disappear after a day', why: 'They stay until you delete them. Look in the Photos app, in the Screenshots album.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Well done!</strong> Screenshots are handy for bus times, tickets, error messages and anything you want to keep or show someone. You can delete them from Photos when you\'re done.'},
    ], {});

    // ---------- Copy and paste ----------
    const ADDRESS = '8 Harbour View, Bridlington';
    function copyChat(p, ctx) {
        const menu = ctx.copyMenu ? `<div class="ph-sheet"><div class="ph-sheet-box">
            <button type="button" class="ph-btn-text" data-tap="reply">Reply</button>
            <button type="button" class="ph-btn-text" data-tap="copy">Copy</button>
            <button type="button" class="ph-btn-text" data-tap="forward">Forward</button></div></div>` : '';
        return `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}
            <div class="msg-head"><span class="msg-back">${p === 'ios' ? '‹' : '←'}</span><strong>Sarah</strong></div>
            <div class="wa-thread"><div class="wa-bubble them"><span>Lunch on Sunday at Jean's new flat 😊</span><small>10:02</small></div>
                <button type="button" class="wa-bubble them${ctx.copied ? ' copied' : ''}" data-hold="address"><span>Here's her address: ${ADDRESS}</span><small>10:03</small></button></div>
            <div class="msg-bar"><span class="msg-box">Text message</span></div>${menu}${navHome(p)}</div>`;
    }

    function mapsScreen(p, ctx) {
        const searchText = ctx.pasted ? ADDRESS : (ctx.place || '');
        const box = `<button type="button" class="mp-search" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Search Maps'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="paste-bubble" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="mp-results"><button type="button" class="recent" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="mp-card"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ph-btn ios-blue" data-tap="directions">Directions</button></div>` : '';
        return `<div class="ph-app-screen maps-app ph-${p}">${statusBar(p)}
            <div class="mp-map">${ctx.pinned ? '<span class="mp-pin" aria-hidden="true"></span>' : ''}<span class="mp-me" aria-hidden="true"></span></div>
            <div class="mp-top">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah has texted you an address. Copying it saves typing it out again. <strong>Open Messages.</strong>'},
        {screen: () => app(p, 'Messages', `<div class="recents"><button type="button" class="recent unread" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="recent"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Tap Sarah\'s message.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Press and hold the message with the address</strong> (keep your finger on it for a second or two) until a menu appears.', hint: 'Keep your finger pressed on the second message until a menu appears.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Tap Copy.</strong> Your phone now remembers the words, ready to paste somewhere else.',
         hints: {reply: 'Reply would start a message. Tap Copy.', forward: 'Forward sends the message to someone. Tap Copy.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Copied! Now go to the home screen. Here, <strong>tap the bar at the bottom of the screen</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Open Maps</strong>, so you can find the address.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Press and hold the search box</strong> until a little "Paste" button appears.', hint: 'Keep your finger on the search box at the top.',
         hints: {'search-tap': 'A quick tap opens the keyboard. Press and hold instead, until Paste appears.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Tap Paste.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'The whole address appears, with no typing. <strong>Tap the result.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'You want to copy just a phone number from the middle of a long message. How?', options: [
            {t: 'Press and hold, then tap Select (or drag the little handles) to choose just the bit you want, then Copy', ok: true,
             why: 'Yes. Drag the handles on either side of the highlighted words to choose exactly what you want.'},
            {t: 'You can only copy the whole message', why: 'You can choose part of it: press and hold, tap Select, and drag the little handles.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Well done!</strong> Copy and paste works almost everywhere: messages, emails, web pages and forms. Press and hold to copy; press and hold to paste.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="stor-head"><strong>${p === 'ios' ? 'iPhone' : 'Storage'}</strong><span>${used} GB of 64 GB used</span>
            <div class="stor-bar"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'iPhone Storage', [{caption: 'RECOMMENDATIONS'},
                ctx.offloaded ? {label: 'Offload Unused Apps', value: 'Enabled ✓'} : {id: 'offload', label: 'Offload Unused Apps', sub: 'Save 2.1 GB. Removes apps you don\'t use but keeps their data.', value: 'Enable'},
                {caption: 'APPS'}, {label: 'Photos', value: '21.3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7.6 GB' : '14.8 GB'}, {label: 'Facebook', value: '2.4 GB'}, {label: 'BBC iPlayer', value: '1.9 GB'}],
            {back: 'General', top: bar});
        }
        return list(p, 'Storage', [{label: 'Photos &amp; videos', value: '21.3 GB'}, {label: 'Apps', value: ctx.cleaned ? '18.4 GB' : '25.2 GB', sub: 'Including WhatsApp'}, {label: 'Documents &amp; other', value: '4.1 GB'},
            {label: 'System', value: '7.6 GB'}], {top: bar + (ctx.junked ? '<p class="app-note">✓ 1.1 GB of junk files cleaned</p>' : '<button type="button" class="ph-btn and-green" data-tap="free-up">Free up space</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Settings', `<div class="recents">${[['account', 'Account'], ['privacy', 'Privacy'], ['chats', 'Chats'], ['notifications', 'Notifications'], ['storage', 'Storage and data'], ['help', 'Help']]
                .map(([id, t]) => `<button type="button" class="recent" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Storage and data', `<div class="recents"><button type="button" class="recent" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7.6 GB' : '14.8 GB'}</small></button>
                <div class="recent"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="recent"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Manage storage', `<div class="stor-head"><span>WhatsApp is using ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="stor-bar"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="recents">${ctx.cleaned ? '<div class="recent"><strong>Larger than 5 MB</strong><small>Nothing to review</small></div>'
                    : '<button type="button" class="recent" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="recent"><strong>Forwarded many times</strong><small>112 items · 0.9 GB</small></div>
                <div class="set-caption">CHATS</div><div class="recent"><strong>Family</strong><small>3.1 GB</small></div><div class="recent"><strong>Bridlington Walkers</strong><small>1.8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="file-tile${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Larger than 5 MB', `<div class="file-grid">${tiles}</div>
            <div class="file-bar">${ctx.selected ? '<span>23 selected</span><button type="button" class="ph-btn danger-btn" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="ph-btn-text" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Delete 23 items?', 'They\'ll be deleted from WhatsApp. Photos already saved to your phone\'s gallery stay there.', [['cancel', 'Cancel'], ['confirm-delete', 'Delete']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Getting "Storage almost full"? Let\'s find out what\'s using the space. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Tap General.</strong>'},
            {screen: () => list(p, 'General', [{id: 'about', label: 'About'}, {id: 'update', label: 'Software Update'}, {id: 'storage', label: 'iPhone Storage'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN &amp; Device Management'}], {back: 'Settings'}),
             target: 'storage', say: '<strong>Tap iPhone Storage.</strong> It takes a few seconds to work everything out.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'The coloured bar shows what\'s using the space. First, a quick win: <strong>Offload Unused Apps</strong> removes apps you haven\'t used for a while, but keeps your data in case you want them back. <strong>Tap Enable.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Tap Storage.</strong> <em>On a Samsung, it\'s Battery and device care, then Storage.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'The coloured bar shows what\'s using the space. <strong>Tap Free up space.</strong>'},
            {screen: () => app(p, 'Files', `<div class="clean-card"><strong>Delete junk files</strong><small>1.1 GB of temporary files from apps</small><button type="button" class="ph-btn and-green" data-tap="clean">Clean</button></div>
                <div class="clean-card"><strong>Delete old screenshots</strong><small>214 MB</small><span class="ph-small">Select and free up</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Junk files are safe to delete: they\'re temporary files apps don\'t need. <strong>Tap Clean.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp is using 14.8 GB. What\'s filling it up?', options: [
            {t: 'Videos and photos people have sent you, especially in groups', ok: true, why: 'Yes. Every video sent in a family or group chat is saved on your phone. WhatsApp can find and delete the big ones.'},
            {t: 'Your text messages', why: 'Text barely takes any space. It\'s the videos and photos people send, especially in groups.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Open WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'In WhatsApp, tap <strong>Settings</strong> at the bottom right. Here it\'s open. <strong>Tap Storage and data.</strong>'
                          : 'In WhatsApp, tap the <strong>three dots ⋮</strong> at the top, then <strong>Settings</strong>. Here it\'s open. <strong>Tap Storage and data.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Tap Manage storage.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'The biggest space-savers are at the top. <strong>Tap Larger than 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'These are big videos people have sent you. If you want to keep one, save it to your photos first. <strong>Tap Select all.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Tap Delete.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'This only deletes the copies inside WhatsApp. <strong>Tap Delete</strong> to confirm.', hints: {cancel: 'Cancel keeps them. For this practice, tap Delete.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Well done!</strong> You\'ve freed up over 7 GB. It\'s worth doing every few months. Also empty <strong>Recently Deleted</strong> in Photos, as deleted photos still take up space for 30 days.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'World Clock'], ['alarms', 'Alarms'], ['stopwatch', 'Stopwatch'], ['timers', 'Timers']]
            : [['alarms', 'Alarm'], ['world', 'Clock'], ['timers', 'Timer'], ['stopwatch', 'Stopwatch']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="clk-row"><span><small>Today</small><strong>London</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="clk-row"><span><small>Australia</small><strong>Sydney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="clk-row"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Tablets')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="clk-row off"><span><em>07:00</em><small>Alarm</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="app-plus" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="ph-app-screen clock-app ph-${p}">${statusBar(p)}<div class="clk-head"><strong>${page === 'world' ? (p === 'ios' ? 'World Clock' : 'Clock') : (p === 'ios' ? 'Alarms' : 'Alarm')}</strong>${add}</div>
            <div class="clk-list">${inner}</div><div class="clk-tabs">${tabs}</div>${homeIndicator(p)}</div>`;
    }

    function alarmEdit(p, ctx) {
        const times = ['07:00', '08:00', '09:00'].map(t => `<button type="button" data-tap="t-${t.slice(0, 2)}" class="${ctx.alarmTime === t ? 'on' : ''}">${t}</button>`).join('');
        const sheet = ctx.repeatPick ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Repeat</strong></p>
            <button type="button" class="set-row" data-tap="never">Never</button><button type="button" class="set-row" data-tap="weekdays">Weekdays</button>
            <button type="button" class="set-row" data-tap="every-day">Every day</button></div></div>` : '';
        return `<div class="ph-app-screen clock-app ph-${p}">${statusBar(p)}
            <div class="clk-edit-head"><button type="button" data-tap="cancel">Cancel</button><strong>Add Alarm</strong><button type="button" data-tap="save" class="save">Save</button></div>
            <div class="time-pick">${times}</div>
            <div class="clk-form">
                <button type="button" class="set-row" data-tap="repeat"><span>Repeat</span><span class="set-val">${ctx.repeat || 'Never'} ›</span></button>
                <div class="set-row static"><span>Label</span>${field('alarmlabel', 'Alarm', ctx)}</div>
                <div class="set-row static"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'An alarm can remind you to take your tablets every day. <strong>Open the Clock app.</strong>', hint: 'It\'s the black icon with a white clock face.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Tap ${p === 'ios' ? 'Alarms' : 'Alarm'}</strong> at the ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Tap +</strong> to add a new alarm.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'On a real phone you scroll the numbers to set the time. Here, <strong>tap 08:00</strong>.', hints: {'t-07': 'Choose 08:00 for this practice.', 't-09': 'Choose 08:00 for this practice.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'You need this every day, not just once. <strong>Tap Repeat.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Every day'; }, say: '<strong>Tap Every day.</strong>',
         hints: {never: 'Never means it goes off just once. Tap Every day.', weekdays: 'Weekdays skips the weekend. Tap Every day.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Type a label in the Label box first, like Tablets.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'A label tells you what the alarm is for. <strong>Tap the Label box and type Tablets</strong>, then <strong>tap Save</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'The alarm goes off at 8. You take your tablets. Which button do you press?', options: [
            {t: 'Stop', ok: true, why: 'Yes. Stop turns it off until tomorrow at 8, because it repeats every day.'},
            {t: 'Snooze', why: 'Snooze makes it ring again in about 9 minutes. Use it if you need a little longer, but Stop turns it off until tomorrow.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Well done!</strong> Your tablets alarm goes off at 8 every morning. ' + (p === 'ios' ? 'The <strong>Health</strong> app also has a Medications section that reminds you and keeps a log.' : 'You can also ask Google: "Remind me to take my tablets every day at 8".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'If your phone was lost or broken, would your photos be safe? Let\'s check. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Tap your name</strong> at the top.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personal Information'}, {id: 'security', label: 'Sign-In &amp; Security'}, {id: 'payment', label: 'Payment &amp; Delivery'}, {id: 'subscriptions', label: 'Subscriptions'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4.2 GB'}, {id: 'family', label: 'Family Sharing'}, {id: 'findmy', label: 'Find My'}], {back: 'Settings'}),
         target: 'icloud', say: '<strong>Tap iCloud.</strong> iCloud is Apple\'s online storage.'},
        {screen: c => list(p, 'iCloud', [{caption: 'STORAGE: 4.2 GB OF 5 GB USED'}, {caption: 'SAVED TO ICLOUD'}, {id: 'photos', label: 'Photos', value: c.photoSync ? 'On' : 'Off'}, {id: 'backup', label: 'iCloud Backup', value: c.backedUp ? 'On' : 'Off'},
            {label: 'Contacts', value: 'On'}, {label: 'Notes', value: 'On'}], {back: 'Apple Account'}),
         target: 'photos', say: 'Photos and Backup are both <strong>Off</strong>. That means a lost phone would mean lost photos. <strong>Tap Photos.</strong>'},
        {screen: c => list(p, 'Photos', [{id: 'sync', label: 'Sync this iPhone', toggle: !!c.photoSync, sub: 'Keeps your photos and videos in iCloud, so they\'re safe if you lose your phone.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Tap Sync this iPhone</strong> to turn it on.'},
        {screen: c => list(p, 'Photos', [{label: 'Sync this iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Tap ‹ iCloud</strong> to go back.'},
        {screen: c => list(p, 'iCloud', [{caption: 'STORAGE: 4.2 GB OF 5 GB USED'}, {caption: 'SAVED TO ICLOUD'}, {id: 'photos', label: 'Photos', value: 'On'}, {id: 'backup', label: 'iCloud Backup', value: 'Off'}], {back: 'Apple Account'}),
         target: 'backup', say: 'Now back up everything else: settings, messages and apps. <strong>Tap iCloud Backup.</strong>'},
        {screen: c => list(p, 'Backup', [{id: 'backup-toggle', label: 'Back Up This iPhone', toggle: !!c.backedUp, sub: 'Backs up automatically each night when your iPhone is charging, locked and on Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Tap Back Up This iPhone</strong> to turn it on.'},
        {screen: () => list('ios', 'Backup', [{label: 'Back Up This iPhone', toggle: true}, {id: 'backup-now', label: 'Back Up Now', sub: 'Last successful backup: Never'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'It\'ll back up every night from now on. Do the first one now: <strong>tap Back Up Now</strong>.'},
        {screen: c => list('ios', 'Backup', [{label: 'Back Up This iPhone', toggle: true}, {label: c.busy ? 'Backing up…' : 'Back Up Now', sub: c.busy ? 'About 5 minutes remaining' : 'Last successful backup: Just now ✓'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'A text says "Your iCloud storage is full. Your photos will be deleted today. Pay 99p here: [link]". What do you do?', options: [
            {t: 'Ignore the link. Check in Settings > your name > iCloud, then forward the text to 7726', ok: true, why: 'Yes. This is a common scam. Apple doesn\'t text links, and never deletes your photos like that. Check your real storage in Settings.'},
            {t: 'Pay quickly to save the photos', why: 'It\'s a scam to get your card details. Check your real storage in Settings > your name > iCloud, and forward the text to 7726.'}]}},
        {screen: () => list('ios', 'Backup', [{label: 'Back Up This iPhone', toggle: true}, {label: 'Back Up Now', sub: 'Last successful backup: Just now ✓'}], {back: 'iCloud'}), done: true,
         say: '<strong>Well done!</strong> Your photos and phone are backed up. The free 5 GB fills up fast with photos; if it does, more space (iCloud+) costs a small monthly fee, and you only buy it in Settings, never from a text.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'If your phone was lost or broken, would your photos be safe? Let\'s check. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Tap Google.</strong> It\'s near the bottom.', hint: 'Scroll down the list: Google is near the bottom.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Manage your Google Account', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Backup', sub: 'Off'}, {id: 'autofill', label: 'Autofill'}, {id: 'devices', label: 'Devices &amp; sharing'}]),
         target: 'backup', say: 'Backup says <strong>Off</strong>. <strong>Tap Backup.</strong> <em>On a Samsung, it\'s Settings > Accounts and backup.</em>'},
        {screen: c => list(p, 'Backup', [{id: 'backup-toggle', label: 'Backup by Google One', toggle: !!c.backedUp, sub: 'Backs up apps, messages, call history, contacts and settings.'},
            {id: 'photos-backup', label: 'Photos &amp; videos', sub: c.photoSync ? 'On · Google Photos' : 'Off · Google Photos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Tap Backup by Google One</strong> to turn it on.'},
        {screen: c => list(p, 'Backup', [{label: 'Backup by Google One', toggle: true}, {id: 'photos-backup', label: 'Photos &amp; videos', sub: 'Off · Google Photos'}]),
         target: 'photos-backup', say: 'Photos are separate. <strong>Tap Photos &amp; videos.</strong>'},
        {screen: c => list(p, 'Backup', [{id: 'photos-toggle', label: 'Back up photos and videos', toggle: !!c.photoSync, sub: 'Saves them in Google Photos, so they\'re safe if you lose your phone.'},
            {label: 'Backup quality', value: 'Storage saver'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Tap Back up photos and videos</strong> to turn it on.'},
        {screen: () => list(p, 'Backup', [{label: 'Back up photos and videos', toggle: true}, {id: 'backup-now', label: 'Back up now', sub: 'Last backup: Never'}]),
         target: 'backup-now', say: 'From now on it backs up by itself, on Wi-Fi. Do the first one now: <strong>tap Back up now</strong>.'},
        {screen: c => list(p, 'Backup', [{label: 'Back up photos and videos', toggle: true}, {label: c.busy ? 'Backing up…' : 'Back up now', sub: c.busy ? '1,204 items left' : 'Last backup: Just now ✓'}]), wait: 1500,
         question: {q: 'A text says "Your Google storage is full. Your photos will be deleted today. Pay 99p here: [link]". What do you do?', options: [
            {t: 'Ignore the link. Check in Settings > Google > Backup, then forward the text to 7726', ok: true, why: 'Yes. This is a common scam. Google doesn\'t text links like this. Check your real storage in Settings.'},
            {t: 'Pay quickly to save the photos', why: 'It\'s a scam to get your card details. Check your real storage in Settings, and forward the text to 7726.'}]}},
        {screen: () => list(p, 'Backup', [{label: 'Back up photos and videos', toggle: true}, {label: 'Back up now', sub: 'Last backup: Just now ✓'}]), done: true,
         say: '<strong>Well done!</strong> Your photos and phone are backed up. Google gives you 15 GB free; if it fills up, more space costs a small monthly fee, and you only buy it in Settings or the Google One app, never from a text.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="ad-pop"><button type="button" class="ad-x" data-tap="ad-close" aria-label="Close advert">✕</button>
        <strong>🎉 CONGRATULATIONS! 🎉</strong><p>You have been selected to win a £500 shopping voucher!</p>
        <button type="button" class="ad-claim" data-tap="claim">CLAIM NOW</button><small>Ad</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'App info', [], {top: `<div class="appinfo-head">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Version 1.0.3</small></div>
            <div class="appinfo-btns"><button type="button" data-tap="open">Open</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'grey' : ''}">Uninstall</button>
            <button type="button" data-tap="force-stop">Force stop</button></div>
            <div class="set-row static"><span class="set-text"><strong>Battery</strong><small>38% use since last full charge</small></span></div>
            <div class="set-row static"><span class="set-text"><strong>Permissions</strong><small>Display over other apps, Device admin</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Do you want to uninstall this app?', [['cancel', 'Cancel'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="ph-notif" data-tap="notif"><strong>CALENDAR · now</strong>
            <span>⚠️ Your iPhone may be infected! Tap here to clean it now.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Adverts are popping up on your home screen, even though no app is open. That usually means a bad app has sneaked on. First, <strong>don\'t tap the advert. Tap the small ✕ to close it.</strong>',
         hints: {claim: 'Never tap the advert itself. Look for the small ✕ in the corner.'}, hint: 'The ✕ is small, in the top right corner of the advert.'},
        {screen: () => home(p), target: 'settings', say: 'Bad apps run all the time, so they use a lot of battery. That\'s how to find them. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Tap Battery.</strong> <em>On a Samsung, it\'s Battery and device care, then Battery.</em>'},
        {screen: () => list(p, 'Battery', [{id: 'usage', label: 'Battery usage', sub: 'View usage since last full charge'}, {label: 'Battery Saver', toggle: false}], {top: '<div class="batt-head"><span class="batt-big"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Tap Battery usage.</strong> <em>On some Samsungs, tap the graph or View details.</em>'},
        {screen: () => list(p, 'Battery usage', [], {top: `<div class="batt-apps">${[['System Service', 38], ['Screen', 21], ['WhatsApp', 12], ['YouTube', 8], ['Camera', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="batt-bar"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Which of these looks out of place?', options: [
            {t: 'System Service: you\'ve never used it, and it\'s using the most battery', ok: true, why: 'Yes. Bad apps give themselves dull names like "System Service" or "Keyboard Settings" so you don\'t notice them. Make a note of its name.'},
            {t: 'Screen', why: 'The screen always uses a lot of battery; that\'s normal. The odd one is "System Service", which you\'ve never used.'},
            {t: 'WhatsApp', why: 'WhatsApp is an app you use, so that\'s normal. The odd one is "System Service".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Now let\'s find it in your apps. Back in Settings, <strong>tap Apps</strong>.'},
        {screen: () => list(p, 'Apps', [{caption: 'Recently opened apps'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'See all 46 apps'}, {id: 'default-apps', label: 'Default apps'}]),
         target: 'all-apps', say: '<strong>Tap See all apps.</strong>'},
        {screen: () => list(p, 'All apps', ['Calculator', 'Calendar', 'Camera', 'Chrome', 'Clock', 'Contacts', 'Gmail', 'Maps'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'The list is in A to Z order. <strong>Tap System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'The <strong>Uninstall</strong> button is greyed out. Bad apps do this to stop you removing them. First, <strong>tap Force stop</strong> to stop it running.',
         hints: {uninstall: 'It\'s greyed out, so it won\'t work yet. Tap Force stop first.', open: 'Don\'t open it. Tap Force stop.'}},
        {screen: () => list(p, 'Search settings', [{caption: 'Results for "device admin"'}, {id: 'device-admin', label: 'Device admin apps', sub: 'Security &amp; privacy > More security settings'}]),
         target: 'device-admin',
         say: 'Now take away its special permission. In Settings, <strong>search for "device admin"</strong> using the search bar at the top. Here\'s the result: <strong>tap Device admin apps</strong>.'},
        {screen: c => list(p, 'Device admin apps', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Deactivate this device admin app?', 'System Service will no longer be able to stop you uninstalling it.', [['cancel', 'Cancel'], ['deactivate', 'Deactivate']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device is Google\'s and is fine. <strong>Tap the switch next to System Service.</strong>', hints: {'find-my': 'Leave Find My Device on. Tap System Service.'}},
        {screen: c => list(p, 'Device admin apps', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Deactivate this device admin app?', 'System Service will no longer be able to stop you uninstalling it.', [['cancel', 'Cancel'], ['deactivate', 'Deactivate']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Tap Deactivate.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Back on System Service, <strong>Uninstall</strong> works now. <strong>Tap Uninstall.</strong>', hints: {'force-stop': 'It\'s already stopped. Tap Uninstall.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Tap OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Gone! Finally, get Google to check for anything else. <strong>Open the Play Store.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="protect"><span class="protect-shield" aria-hidden="true">✓</span><strong>${c.scanned ? 'No harmful apps found' : 'Scan your phone'}</strong>
            <small>${c.scanned ? 'Checked just now' : 'Last scanned: 3 weeks ago'}</small>${c.scanned ? '' : '<button type="button" class="ph-btn and-green" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'In the Play Store, tap your <strong>profile picture</strong> (top right), then <strong>Play Protect</strong>. Here it\'s open. <strong>Tap Scan.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="protect"><span class="protect-shield" aria-hidden="true">✓</span><strong>No harmful apps found</strong><small>Checked just now</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Well done!</strong> You found the bad app by its battery use, took away its special permission, uninstalled it and checked your phone. To avoid them: only install apps from the Play Store, and be wary of free torch, "cleaner" and "booster" apps.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'A notification from your Calendar says "Your iPhone may be infected! Tap here to clean it now." What is it?', options: [
            {t: 'Spam that\'s sneaked into your calendar. Don\'t tap it', ok: true, why: 'Yes. Tapping "Allow" on a dodgy website can add a spam calendar to your iPhone. Its "events" are adverts that look like warnings. Your iPhone is fine.'},
            {t: 'A real warning from Apple', why: 'Apple doesn\'t send virus warnings through your Calendar. It\'s spam from a subscribed calendar. Don\'t tap it.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Let\'s remove the spam calendar. <strong>Tap Settings</strong>, not the notification.', hints: {notif: 'Don\'t tap the warning. Tap Settings.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Scroll down and <strong>tap Apps</strong>.', hint: 'Apps is in the last group.'},
        {screen: () => list(p, 'Apps', ['App Store', 'Books'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Calendar'}, {label: 'Camera'}, {label: 'Contacts'}, {label: 'Mail'}]), {back: 'Settings'}),
         target: 'calendar', say: '<strong>Tap Calendar.</strong>'},
        {screen: () => list(p, 'Calendar', [{id: 'accounts', label: 'Calendar Accounts', value: '2'}, {label: 'Time Zone Override', value: 'Off'}, {label: 'Default Alert Times'}], {back: 'Apps'}),
         target: 'accounts', say: '<strong>Tap Calendar Accounts.</strong>'},
        {screen: () => list(p, 'Calendar Accounts', [{caption: 'ACCOUNTS'}, {label: 'iCloud', sub: 'Calendars, Contacts and 7 more'}, {id: 'subscribed', label: 'Subscribed Calendars', value: '1'}], {back: 'Calendar'}),
         target: 'subscribed', say: 'iCloud is your own. <strong>Tap Subscribed Calendars.</strong>'},
        {screen: () => list(p, 'Subscribed Calendars', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Subscribed'}], {back: 'Calendar Accounts'}),
         target: 'spam-cal', say: 'There it is: a calendar you never meant to add. <strong>Tap Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Server', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Delete Account', danger: true}],
            {back: 'Back', overlay: c.askDelete ? dialog(p, 'Are you sure?', 'This will delete the calendar and its events from your iPhone.', [['cancel', 'Cancel'], ['confirm-delete', 'Delete Account']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Tap Delete Account.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Server', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Delete Account', danger: true}],
            {back: 'Back', overlay: dialog(p, 'Are you sure?', 'This will delete the calendar and its events from your iPhone.', [['cancel', 'Cancel'], ['confirm-delete', 'Delete Account']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Tap Delete Account</strong> to confirm.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Gone. One more check: dodgy websites can also install a "profile". <strong>Tap General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'About'}, {id: 'update', label: 'Software Update'}, {id: 'storage', label: 'iPhone Storage'}, {id: 'vpn', label: 'VPN &amp; Device Management'}], {back: 'Settings'}),
         target: 'vpn', say: '<strong>Tap VPN &amp; Device Management.</strong>'},
        {screen: c => list(p, 'VPN &amp; Device Management', c.profileGone ? [{label: 'VPN', value: 'Not Connected'}] : [{label: 'VPN', value: 'Not Connected'}, {caption: 'CONFIGURATION PROFILE'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Unverified'}], {back: 'General'}),
         target: 'profile', say: 'If you see a profile here you don\'t recognise (one from your work or school is fine), remove it. <strong>Tap Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Profile', [{label: 'Free Phone Booster', sub: 'Unverified · Contains: Web Clips, Certificates'}, {caption: ' '}, {id: 'remove-profile', label: 'Remove Profile', danger: true}],
            {back: 'Back', overlay: c.askRemove ? dialog(p, 'Remove Profile', 'Removing this profile will delete all its settings.', [['cancel', 'Cancel'], ['confirm-remove', 'Remove']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Tap Remove Profile</strong>. Your iPhone will ask for your passcode.'},
        {screen: c => list(p, 'Profile', [{label: 'Free Phone Booster', sub: 'Unverified'}, {caption: ' '}, {label: 'Remove Profile', danger: true}],
            {back: 'Back', overlay: dialog(p, 'Remove Profile', 'Removing this profile will delete all its settings.', [['cancel', 'Cancel'], ['confirm-remove', 'Remove']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Tap Remove.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Well done!</strong> The fake warnings are gone. To stop it happening again: on websites, tap <strong>Don\'t Allow</strong> or <strong>Close</strong> on any pop-up asking to add a calendar or profile, and only install apps from the App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Cancelled · Ends 22 October'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 per week · Renews 22 October'};
        return list(p, 'Subscriptions', [{caption: p === 'ios' ? 'ACTIVE' : 'Active'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 per month' : '£1.59 per month'},
            {caption: p === 'ios' ? 'INACTIVE' : 'Expired'}, {label: 'Crossword Daily', sub: 'Expired 3 March'}], {back: p === 'ios' ? 'Apple Account' : 'Back'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'YOUR SUBSCRIPTION' : 'Plan'}, {label: 'Weekly', sub: '£4.99 per week. Started as a 3-day free trial.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Cancel Subscription' : 'Cancel subscription', danger: true}],
            {back: 'Subscriptions', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Confirm Cancellation' : 'Cancel subscription?', 'You can keep using it until 22 October. You won\'t be charged again.', [['keep', p === 'ios' ? 'Not Now' : 'Keep']].concat([['confirm-cancel', p === 'ios' ? 'Confirm' : 'Cancel subscription']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Free trials often turn into paid plans without you noticing. Let\'s check. <strong>Tap Settings.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Tap your name</strong> at the top.'},
            {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personal Information'}, {id: 'security', label: 'Sign-In &amp; Security'}, {id: 'payment', label: 'Payment &amp; Delivery'}, {id: 'subscriptions', label: 'Subscriptions'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Settings'}),
             target: 'subscriptions', say: '<strong>Tap Subscriptions.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Free trials often turn into paid plans without you noticing. Let\'s check. <strong>Open the Play Store.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="st-card"><span>SUGGESTED FOR YOU</span><strong>Apps to get you started</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="app-plus round" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="wa-menu"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Tap your profile picture</strong>, the round letter at the top right.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="wa-menu"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Tap Payments &amp; subscriptions.</strong>'},
            {screen: () => list(p, 'Payments &amp; subscriptions', [{id: 'methods', label: 'Payment methods'}, {id: 'subscriptions', label: 'Subscriptions', sub: 'Manage your subscriptions'}, {id: 'budget', label: 'Budget &amp; history'}]),
             target: 'subscriptions', say: '<strong>Tap Subscriptions.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '"Photo Editor Pro" started as a free trial and is now <strong>£4.99 every week</strong>. That\'s over £250 a year! <strong>Tap it.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Cancel Subscription' : 'Cancel subscription'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Confirm' : 'Cancel subscription'}.</strong>`, hints: {keep: 'That keeps paying. Tap ' + (p === 'ios' ? 'Confirm' : 'Cancel subscription') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Deleting the Photo Editor app from your phone. Does that stop the payments?', options: [
            {t: 'No. You have to cancel the subscription, like you just did', ok: true, why: 'Exactly. Deleting the app does NOT cancel the subscription. You keep paying until you cancel it here.'},
            {t: 'Yes, deleting the app stops it', why: 'It doesn\'t! You keep paying until you cancel the subscription itself, here.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Well done!</strong> You\'ve saved £4.99 a week. Tip: when you start a free trial, set an alarm for the day before it ends. Also check your bank app\'s list of regular payments now and then.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ic-text">✦</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Newer iPhones have <strong>Apple Intelligence</strong>: AI that writes, summarises and edits for you. You can turn it off. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Tap Apple Intelligence &amp; Siri.</strong>', hint: 'It\'s in the third group, below Accessibility.'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Writing Tools, notification summaries, Image Playground and more.'},
            {caption: 'EXTENSIONS'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Off' : 'On'}, {caption: 'SIRI'}, {label: 'Talk to Siri', value: '"Siri" or "Hey Siri"'}],
            {back: 'Settings', overlay: c.askOff ? dialog(p, 'Turn Off Apple Intelligence?', 'Features like Writing Tools and summaries will no longer be available.', [['cancel', 'Cancel'], ['confirm-off', 'Turn Off']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Tap the Apple Intelligence switch</strong> to turn it off.', hints: {chatgpt: 'We\'ll do ChatGPT next. First, tap the Apple Intelligence switch.'}},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'EXTENSIONS'}, {label: 'ChatGPT', value: 'On'}],
            {back: 'Settings', overlay: dialog(p, 'Turn Off Apple Intelligence?', 'Features like Writing Tools and summaries will no longer be available.', [['cancel', 'Cancel'], ['confirm-off', 'Turn Off']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Tap Turn Off.</strong>'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'EXTENSIONS'}, {id: 'chatgpt', label: 'ChatGPT', value: 'On'}], {back: 'Settings'}),
         target: 'chatgpt', say: 'The ChatGPT extension can send your questions to ChatGPT, a company outside Apple. <strong>Tap ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Use ChatGPT', toggle: !c.gptOff, sub: 'Siri can send requests to ChatGPT.'}], {back: 'Back'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Tap Use ChatGPT</strong> to turn it off.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Use ChatGPT', toggle: false}], {back: 'Back'}),
         question: {q: 'WhatsApp, Facebook and other apps have AI chats too. What\'s the safe rule?', options: [
            {t: 'Never type personal details (bank, health, passwords, addresses) into any AI chat', ok: true, why: 'Yes. What you type may be stored and used to train the AI. Treat it like talking to a stranger.'},
            {t: 'AI chats are private, so anything is fine', why: 'They aren\'t private like a phone call. What you type may be stored. Keep personal details out of them.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Use ChatGPT', toggle: false}], {back: 'Back'}), done: true,
         say: '<strong>Well done!</strong> Apple Intelligence and ChatGPT are off. You can turn them back on any time in the same place. Siri still works as normal.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Android phones now come with <strong>Gemini</strong>, Google\'s AI. Holding the power button may open it by mistake. Let\'s change that. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Tap Apps.</strong>'},
        {screen: () => list(p, 'Apps', [{caption: 'Recently opened apps'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'See all 45 apps'}, {id: 'default-apps', label: 'Default apps', sub: 'Assistant, browser and phone apps'}]),
         target: 'default-apps', say: '<strong>Tap Default apps.</strong>'},
        {screen: () => list(p, 'Default apps', [{label: 'Browser app', sub: 'Chrome'}, {id: 'assistant', label: 'Digital assistant app', sub: 'Gemini'}, {label: 'Phone app', sub: 'Phone'}, {label: 'SMS app', sub: 'Messages'}]),
         target: 'assistant', say: '<strong>Tap Digital assistant app.</strong>'},
        {screen: c => list(p, 'Digital assistant app', [{id: 'assistant-app', label: 'Default digital assistant app', sub: c.noAssist ? 'None' : 'Gemini'}, {label: 'Use text from screen', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Default digital assistant app</strong></p><button type="button" class="set-row" data-tap="assist-gemini">Gemini</button><button type="button" class="set-row" data-tap="assist-none">None</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Tap Default digital assistant app.</strong>'},
        {screen: c => list(p, 'Digital assistant app', [{label: 'Default digital assistant app', sub: 'Gemini'}],
            {overlay: `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Default digital assistant app</strong></p><button type="button" class="set-row" data-tap="assist-gemini">Gemini</button><button type="button" class="set-row" data-tap="assist-none">None</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Tap None.</strong> Gemini won\'t pop up when you hold the power button.', hints: {'assist-gemini': 'That keeps Gemini. Tap None.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Next, stop Gemini keeping what you type to it. <strong>Open the Gemini app.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="app-note gem-hello">Hello, Margaret<br><small>How can I help you today?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="app-plus round" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="wa-menu"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Tap your profile picture</strong> at the top right.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="wa-menu"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Tap Gemini Apps Activity.</strong> <em>On some phones it\'s called Keep Activity.</em>'},
        {screen: c => app(p, 'Gemini Apps Activity', `<p class="app-note"><strong>${c.actOff ? 'Off' : 'On'}</strong><br>${c.actOff ? 'Your chats are no longer saved to your account or used to improve Google\'s AI.' : 'Your chats are saved to your Google Account and may be reviewed to improve Google\'s AI.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ph-btn and-green" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ph-sheet"><div class="ph-sheet-box"><button type="button" class="set-row" data-tap="off-only">Turn off</button><button type="button" class="set-row" data-tap="off-delete">Turn off and delete activity</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Tap Turn off.</strong>'},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="app-note"><strong>On</strong></p>', {color: '#fff', overlay: '<div class="ph-sheet"><div class="ph-sheet-box"><button type="button" class="set-row" data-tap="off-only">Turn off</button><button type="button" class="set-row" data-tap="off-delete">Turn off and delete activity</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Tap Turn off and delete activity</strong>, to clear what it already saved too.', hints: {'off-only': 'That stops saving new chats but keeps the old ones. Tap Turn off and delete activity.'}},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="app-note"><strong>Off</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook and other apps have AI chats too. What\'s the safe rule?', options: [
            {t: 'Never type personal details (bank, health, passwords, addresses) into any AI chat', ok: true, why: 'Yes. What you type may be stored and used to train the AI. Treat it like talking to a stranger.'},
            {t: 'AI chats are private, so anything is fine', why: 'They aren\'t private like a phone call. What you type may be stored. Keep personal details out of them.'}]}},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="app-note"><strong>Off</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Well done!</strong> Gemini no longer pops up from the power button, and doesn\'t keep your chats. On a Samsung, also look in <strong>Settings > Galaxy AI</strong>, where each feature has its own switch.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Your Apple Account holds your photos, contacts and payments. Let\'s check it\'s protected. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Tap your name</strong> at the top.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personal Information'}, {id: 'security', label: 'Sign-In &amp; Security'}, {id: 'payment', label: 'Payment &amp; Delivery'}, {id: 'subscriptions', label: 'Subscriptions'}], {back: 'Settings'}),
         target: 'security', say: '<strong>Tap Sign-In &amp; Security.</strong>'},
        {screen: () => list(p, 'Sign-In &amp; Security', [{label: 'Email &amp; Phone Numbers', sub: '+44 7700 900123'}, {label: 'Change Password'}, {caption: ' '}, {label: 'Two-Factor Authentication', value: 'On'},
            {id: 'recovery', label: 'Account Recovery'}], {back: 'Apple Account'}),
         target: 'recovery', say: '<strong>Two-Factor Authentication</strong> says On: good. It means a new device needs a code from your phone before it can sign in. Now, <strong>tap Account Recovery</strong>.'},
        {screen: c => list(p, 'Account Recovery', [{caption: 'RECOVERY CONTACT'}, c.recovery ? {label: 'Sarah', sub: 'Waiting for Sarah to accept'} : {id: 'add-contact', label: 'Add Recovery Contact…', sub: 'Someone you trust who can help you get back into your account.'}],
            {back: 'Back', overlay: c.pickContact ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Choose a recovery contact</strong></p><button type="button" class="set-row" data-tap="pick-sarah">Sarah (Daughter)</button><button type="button" class="set-row" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'If you ever forget your password, a <strong>recovery contact</strong> can get you a code to help you back in. They can\'t see your data. <strong>Tap Add Recovery Contact.</strong>'},
        {screen: c => list(p, 'Account Recovery', [{caption: 'RECOVERY CONTACT'}, {label: 'Add Recovery Contact…'}],
            {back: 'Back', overlay: `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Choose a recovery contact</strong></p><button type="button" class="set-row" data-tap="pick-sarah">Sarah (Daughter)</button><button type="button" class="set-row" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Pick someone you trust who has an iPhone. <strong>Tap Sarah.</strong>', hints: {'pick-dave': 'For this practice, choose Sarah.'}},
        {screen: c => list(p, 'Account Recovery', [{caption: 'RECOVERY CONTACT'}, {label: 'Sarah', sub: 'Waiting for Sarah to accept'}], {back: 'Back'}),
         question: {q: 'Someone rings saying they\'re from Apple. They ask you to read out the 6-digit code that\'s just appeared on your phone. What do you do?', options: [
            {t: 'Hang up. Never give that code to anyone', ok: true, why: 'Exactly. That code lets someone into your account. Apple will never ring and ask for it.'},
            {t: 'Read it out, they\'re from Apple', why: 'Apple will never ask for that code. Anyone who has it can get into your account. Hang up.'}]}},
        {screen: c => list(p, 'Account Recovery', [{caption: 'RECOVERY CONTACT'}, {label: 'Sarah', sub: 'Waiting for Sarah to accept'}], {back: 'Back'}), done: true,
         say: '<strong>Well done!</strong> Two-factor authentication is on and Sarah can help you get back in. Your iPhone can also remember passwords for you, in the <strong>Passwords</strong> app.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Your Google Account holds your emails, photos and contacts. Let\'s add a second lock to it. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Tap Google.</strong>', hint: 'Google is near the bottom of the list.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Manage your Google Account', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Backup'}, {id: 'autofill', label: 'Autofill'}]),
         target: 'manage', say: '<strong>Tap Manage your Google Account.</strong>'},
        {screen: () => app(p, 'Google Account', `<div class="g-tabs"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="app-note">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Tap Security</strong> along the top.'},
        {screen: c => list(p, 'Security', [{caption: 'How you sign in to Google'}, {id: '2sv', label: '2-Step Verification', sub: c.twoOn ? 'On' : 'Off'}, {label: 'Password', sub: 'Last changed 2 years ago'}, {label: 'Recovery phone', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>2-Step Verification</strong> is Off. It means signing in on a new device also needs a code sent to your phone, so a stolen password isn\'t enough. <strong>Tap it.</strong>'},
        {screen: () => list(p, '2-Step Verification', [], {top: '<p class="app-note">Your phone number: <strong>07700 900123</strong><br>We\'ll text a code to this number to check it\'s yours.</p><button type="button" class="ph-btn and-green" data-tap="send-code">Send code</button>'}),
         target: 'send-code', say: '<strong>Tap Send code.</strong>'},
        {screen: c => list(p, '2-Step Verification', [], {top: `<div class="code-notice"><strong>MESSAGES · now</strong><span>G-382605 is your Google verification code.</span></div>
            <p class="app-note">Enter the code we texted to 07700 900123</p>${field('gcode', 'Enter code', c, 'tel')}<button type="button" class="ph-btn and-green" data-tap="verify">Next</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Type the 6 numbers from the text: 382605.',
         say: 'A text arrives with a code. <strong>Type 382605 in the box</strong> and <strong>tap Next</strong>. <em>(A practice code. Never type a real one anywhere except where you asked for it.)</em>'},
        {screen: () => list(p, '2-Step Verification', [], {top: '<p class="app-note">Your phone number is checked ✓</p><button type="button" class="ph-btn and-green" data-tap="turn-on">Turn on 2-Step Verification</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Tap Turn on 2-Step Verification.</strong>'},
        {screen: c => list(p, 'Security', [{caption: 'How you sign in to Google'}, {label: '2-Step Verification', sub: 'On ✓'}, {label: 'Recovery phone', sub: '07700 900123'}]),
         question: {q: 'Someone rings saying they\'re from Google. They ask you to read out the code that\'s just been texted to you. What do you do?', options: [
            {t: 'Hang up. Never give that code to anyone', ok: true, why: 'Exactly. That code lets someone into your account. Google will never ring and ask for it.'},
            {t: 'Read it out, they\'re from Google', why: 'Google will never ask for that code. Anyone who has it can get into your account. Hang up.'}]}},
        {screen: c => list(p, 'Security', [{caption: 'How you sign in to Google'}, {label: '2-Step Verification', sub: 'On ✓'}]), done: true,
         say: '<strong>Well done!</strong> Your Google Account now needs your phone as well as your password. Google can also remember your passwords: look for <strong>Google Password Manager</strong> in Settings.'},
    ], {input: {}});

    // ---------- Facebook privacy and fake friend requests ----------
    const FB = '#1877f2';
    const fbApp = ['facebook', 'Facebook', FB, ICON.person];
    function fbScreen(p, ctx, page) {
        const tabs = `<div class="fb-tabs"><button type="button" data-tap="tab-home" class="${page === 'feed' ? 'on' : ''}">Home</button>
            <button type="button" data-tap="tab-friends" class="${page === 'friends' ? 'on' : ''}">Friends${ctx.requestGone ? '' : ' <em>1</em>'}</button>
            <button type="button" data-tap="tab-menu" class="${page === 'menu' ? 'on' : ''}">Menu</button></div>`;
        let inner;
        if (page === 'feed') {
            inner = `<div class="fb-post"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Lovely walk along the seafront this morning! 🌊</p><div class="fb-img">🌅</div></div>
                <div class="fb-post"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Next walk: Saturday, 10am, from the harbour.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="app-note">No new friend requests.</p>'
                : `<p class="app-note"><strong>Friend requests</strong></p><div class="fb-req">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="fb-req-btns"><button type="button" class="ph-btn ios-blue" data-tap="confirm-jean">Confirm</button><button type="button" class="ph-btn" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="recents"><div class="recent"><strong>Margaret Smith</strong><small>See your profile</small></div>
                <button type="button" class="recent" data-tap="settings"><strong>Settings &amp; privacy</strong></button><div class="recent"><strong>Help &amp; support</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Let\'s make sure only your friends see what you post. <strong>Open Facebook.</strong> <em>(A practice version. Not the real app.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Tap Menu</strong> at the bottom right.', hints: {'tab-friends': 'We\'ll look at friend requests in a moment. First, tap Menu.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Tap Settings &amp; privacy</strong>.'},
        {screen: c => list(p, 'Settings', [{caption: 'Audience and visibility'}, {id: 'posts', label: 'Posts', sub: 'Who can see your future posts: ' + (c.audience || 'Public')}, {label: 'Profile details'}, {label: 'How people find and contact you'},
            {caption: 'Your activity'}, {label: 'Activity log'}],
            {overlay: c.audPick ? `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Who can see your future posts?</strong></p>
                <button type="button" class="set-row" data-tap="aud-public">🌐 Public<small>Anyone on or off Facebook</small></button>
                <button type="button" class="set-row" data-tap="aud-friends">👥 Friends<small>Your friends on Facebook</small></button>
                <button type="button" class="set-row" data-tap="aud-me">🔒 Only me</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Your posts are set to <strong>Public</strong>: anyone in the world can see them. <strong>Tap Posts.</strong>'},
        {screen: c => list(p, 'Settings', [{caption: 'Audience and visibility'}, {label: 'Posts', sub: 'Who can see your future posts: Public'}],
            {overlay: `<div class="ph-sheet"><div class="ph-sheet-box"><p><strong>Who can see your future posts?</strong></p>
                <button type="button" class="set-row" data-tap="aud-public">🌐 Public<small>Anyone on or off Facebook</small></button>
                <button type="button" class="set-row" data-tap="aud-friends">👥 Friends<small>Your friends on Facebook</small></button>
                <button type="button" class="set-row" data-tap="aud-me">🔒 Only me</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Friends'; }, say: '<strong>Tap Friends.</strong>',
         hints: {'aud-public': 'Public is what it was. Tap Friends.', 'aud-me': 'Only me means nobody else sees your posts. Tap Friends.'}},
        {screen: c => list(p, 'Settings', [{caption: 'Audience and visibility'}, {label: 'Posts', sub: 'Who can see your future posts: Friends ✓'}, {id: 'back-feed', label: '‹ Back to Facebook'}]),
         target: 'back-feed', say: 'Done. Now <strong>tap Back to Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'You have a friend request. <strong>Tap Friends.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'A friend request from "Jean Smith". But you\'re already friends with Jean (she\'s in your feed). What\'s going on?', options: [
            {t: 'It\'s probably a copy of Jean\'s profile, made by a scammer', ok: true, why: 'Yes. Scammers copy someone\'s name and photo, then message their friends asking for money. Real Jean is already your friend.'},
            {t: 'Jean must have a second account', why: 'Possible, but it\'s much more likely a copy made by a scammer: it joined 2 days ago. Check with Jean by phone.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Tap Delete</strong> to turn down the request.', hints: {'confirm-jean': 'Don\'t confirm a copied profile. Tap Delete.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Well done!</strong> Your posts are friends-only and you\'ve dodged a fake profile. Let Jean know, so she can report it. Also be wary of Marketplace buyers who want to pay "by courier" or ask for codes sent to your phone.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="mp-top"><button type="button" class="mp-search" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Search here'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="mp-results"><button type="button" class="recent" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Bus and train station, Hull</small></button>
                <div class="recent"><strong>Hull Royal Infirmary</strong><small>Hospital, Hull</small></div><div class="recent"><strong>Hull Minster</strong><small>Church, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="mp-card"><strong>Hull Paragon Interchange</strong><small>Bus and train station · 25 miles</small><button type="button" class="ph-btn ios-blue" data-tap="directions">Directions</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '🚗 40 min'], ['bus', '🚌 1 hr 25'], ['walk', '🚶 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="recent" data-tap="route-1"><strong>10:15 → 11:40</strong><small>🚌 121 · Leaves Bridlington Bus Station · <b class="live">On time</b></small></button>
                <div class="recent"><strong>11:15 → 12:40</strong><small>🚌 121 · Every hour</small></div>` : '<div class="recent"><strong>40 min (25 miles)</strong><small>Fastest route, via A614</small></div>';
            card = `<div class="mp-card wide"><div class="mode-chips">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="mp-card wide"><strong>10:15 → 11:40</strong><ol class="trip"><li>🚶 Walk 4 min to <strong>Bridlington Bus Station</strong>, stand 3</li>
                <li>🚌 <strong>121</strong> towards Hull · 10:15 · <b class="live">On time</b></li><li>Get off at <strong>Hull Paragon Interchange</strong> (24 stops)</li></ol>
                <button type="button" class="ph-btn ios-blue" data-tap="start">Start</button></div>`;
        }
        return `<div class="ph-app-screen maps-app ph-${p}">${statusBar(p)}<div class="mp-map">${page === 'place' || page === 'trip' ? '<span class="mp-pin" aria-hidden="true"></span>' : ''}<span class="mp-me" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="mp-route" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Maps can plan a bus journey, with live times. Let\'s go to Hull by bus. <strong>Open Maps.</strong>' + (p === 'ios' ? ' <em>(Google Maps works the same way, if you prefer it.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Tap the search box</strong> at the top.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'We typed "Hull interchange". <strong>Tap Hull Paragon Interchange</strong>, the bus station.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Tap Directions.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'It shows driving first. <strong>Tap the bus</strong> 🚌 to see public transport.', hints: {'mode-walk': 'Eight hours! Tap the bus instead.', 'mode-car': 'That\'s driving. Tap the bus.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Here are the buses, with the next one first. "On time" is live. <strong>Tap the 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Where do you catch the bus?', options: [
            {t: 'Bridlington Bus Station, stand 3', ok: true, why: 'Yes. Maps tells you where to walk to, which bus, and where to get off.'},
            {t: 'Hull Paragon Interchange', why: 'That\'s where you get off. You catch it at Bridlington Bus Station, stand 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Well done!</strong> Tap <strong>Start</strong> on a real journey and Maps tells you when your stop is coming up. With a bus pass, you just show it to the driver as usual. <em>(Practice times only: check the real ones on the day.)</em>'},
    ], {});

    // The extra lessons (emergency, problems, and additions to other courses).
    // ======================================================================================
    // Shared bits for the emergency, problems and extra lessons
    // ======================================================================================
    // A phone keypad with * and #. shown: what's been typed so far.
    function dialer(p, shown, opts = {}) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const id = k => 'k' + (k === '*' ? 'star' : k === '#' ? 'hash' : k);
        return `<div class="ph-app-screen dial-app ph-${p}">${statusBar(p)}
            <div class="dial-display">${esc(shown || '')}<span class="dial-caret"></span></div>
            <div class="dial-pad">${keys.map(k => `<button type="button" data-tap="${id(k)}">${k}</button>`).join('')}</div>
            <div class="dial-call"><button type="button" class="accept" data-tap="call" aria-label="Call">${UI.phone}</button></div>
            ${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }
    const dialKeys = s => [...s].map(k => 'k' + (k === '*' ? 'star' : k === '#' ? 'hash' : k));

    function lockScreen(p, notif, opts = {}) {
        return `<div class="ph-lock ph-${p}">${statusBar(p)}<div class="lock-time"><small>${NOW.long()}</small>${NOW.time()}</div>
            ${notif ? `<button type="button" class="lock-notif" data-tap="${notif.id}"><strong>${notif.app} · now</strong><span><b>${notif.title}</b>${notif.text}</span></button>` : ''}
            ${opts.extra || ''}${homeIndicator(p)}</div>`;
    }

    const sheet = (title, rows) => `<div class="ph-sheet"><div class="ph-sheet-box">${title ? `<p><strong>${title}</strong></p>` : ''}${rows.map(([id, label, sub]) =>
        `<button type="button" class="set-row" data-tap="${id}">${label}${sub ? `<small>${sub}</small>` : ''}</button>`).join('')}</div></div>`;

    // ======================================================================================
    // Course: In an emergency
    // ======================================================================================
    SCENARIOS['emergency-sos'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '<strong>Emergency SOS</strong> calls 999 for you and texts your location to the people you choose. Let\'s check it\'s ready. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Tap Emergency SOS.</strong>', hint: 'It\'s in the third group, with a red icon.'},
        {screen: c => list(p, 'Emergency SOS', [{label: 'Call with Hold and Release', toggle: true, sub: 'Hold the side and a volume button, then let go.'},
            {id: 'five', label: 'Call with 5 Button Presses', toggle: !!c.five, sub: 'Press the side button 5 times quickly.'}, {caption: ' '},
            {id: 'contacts', label: 'Set up Emergency Contacts in Health'}, {label: 'Crash Detection', toggle: true, sub: 'Calls 999 after a severe car crash.'}], {back: 'Settings'}),
         target: 'five', action: c => { c.five = true; }, say: 'Pressing the side button 5 times is easy to remember in a panic. <strong>Turn on Call with 5 Button Presses.</strong>'},
        {screen: c => list(p, 'Emergency SOS', [{label: 'Call with Hold and Release', toggle: true}, {label: 'Call with 5 Button Presses', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Set up Emergency Contacts in Health'}], {back: 'Settings', overlay: c.pick ? sheet('Add emergency contact', [['pick-sarah', 'Sarah', 'Daughter · 07700 900333'], ['pick-dave', 'Dave', 'Friend']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Now choose who gets a text with your location. <strong>Tap Set up Emergency Contacts.</strong>'},
        {screen: () => list(p, 'Emergency SOS', [{label: 'Call with 5 Button Presses', toggle: true}], {back: 'Settings', overlay: sheet('Add emergency contact', [['pick-sarah', 'Sarah', 'Daughter · 07700 900333'], ['pick-dave', 'Dave', 'Friend']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Tap Sarah</strong>, your daughter.', hints: {'pick-dave': 'Choose Sarah for this practice.'}},
        {screen: () => list(p, 'Emergency SOS', [{label: 'Call with 5 Button Presses', toggle: true}, {caption: 'EMERGENCY CONTACTS'}, {label: 'Sarah', sub: 'Daughter'}], {back: 'Settings'}),
         question: {q: 'You\'ve fallen and can\'t reach the phone screen properly. What do you do?', options: [
            {t: 'Press the side button 5 times quickly', ok: true, why: 'Yes. A countdown starts, then it rings 999 and texts Sarah where you are.'},
            {t: 'Unlock the phone and find the Phone app', why: 'That\'s slow in an emergency. Pressing the side button 5 times works even when it\'s locked.'}]}},
        {screen: () => list(p, 'Emergency SOS', [{label: 'Call with 5 Button Presses', toggle: true}, {caption: 'EMERGENCY CONTACTS'}, {label: 'Sarah', sub: 'Daughter'}], {back: 'Settings'}), done: true,
         say: '<strong>Well done!</strong> Emergency SOS is ready and Sarah will be told where you are. If you press it by mistake, just tap Stop during the countdown.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Emergency SOS</strong> calls 999 for you and texts your location to the people you choose. Let\'s check it\'s ready. <strong>Tap Settings.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Tap Safety &amp; emergency.</strong> <em>On a Samsung, it\'s Safety and emergency too.</em>', hint: 'Scroll down: it\'s near the bottom.'},
        {screen: () => list(p, 'Safety &amp; emergency', [{id: 'medical', label: 'Medical information'}, {id: 'contacts-ec', label: 'Emergency contacts'}, {id: 'sos', label: 'Emergency SOS', sub: 'Off'}, {label: 'Car crash detection'}]),
         target: 'sos', say: 'Emergency SOS is <strong>Off</strong>. <strong>Tap Emergency SOS.</strong>'},
        {screen: c => list(p, 'Emergency SOS', [{id: 'sos-toggle', label: 'Use Emergency SOS', toggle: !!c.sosOn, sub: 'Press the power button 5 times or more to start emergency actions.'}, {label: 'Share info with emergency contacts', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Tap Use Emergency SOS</strong> to turn it on.'},
        {screen: () => list(p, 'Safety &amp; emergency', [{id: 'medical', label: 'Medical information'}, {id: 'contacts-ec', label: 'Emergency contacts', sub: 'None'}, {label: 'Emergency SOS', sub: 'On'}]),
         target: 'contacts-ec', say: 'Now choose who gets a text with your location. <strong>Tap Emergency contacts.</strong>'},
        {screen: c => list(p, 'Emergency contacts', [{id: 'add', label: '＋ Add contact'}], {overlay: c.pick ? sheet('Choose a contact', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Tap Add contact.</strong>'},
        {screen: () => list(p, 'Emergency contacts', [{label: '＋ Add contact'}], {overlay: sheet('Choose a contact', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Tap Sarah</strong>, your daughter.', hints: {'pick-dave': 'Choose Sarah for this practice.'}},
        {screen: () => list(p, 'Emergency contacts', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Add contact'}]),
         question: {q: 'You\'ve fallen and can\'t reach the phone screen properly. What do you do?', options: [
            {t: 'Press the power button 5 times quickly', ok: true, why: 'Yes. A countdown starts, then it rings 999 and shares where you are with Sarah.'},
            {t: 'Unlock the phone and find the Phone app', why: 'That\'s slow in an emergency. Pressing the power button 5 times works even when it\'s locked.'}]}},
        {screen: () => list(p, 'Emergency contacts', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Well done!</strong> Emergency SOS is on and Sarah will be told where you are. If you press it by mistake, tap Cancel during the countdown.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Emergency Alerts warn you about danger nearby, like severe flooding. Someone has switched one off on this phone. Let\'s fix it. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Tap Notifications.</strong>'},
            {screen: c => list(p, 'Notifications', [{label: 'Show Previews', value: 'Always'}, {caption: 'NOTIFICATION STYLE'}, {label: 'Messages', sub: 'Banners, Sounds, Badges'}, {label: 'WhatsApp', sub: 'Banners, Sounds, Badges'},
                {caption: 'GOVERNMENT ALERTS'}, {label: 'Extreme Alerts', toggle: true}, {id: 'severe', label: 'Severe Alerts', toggle: !!c.severe}, {label: 'Test Alerts', toggle: false}], {back: 'Settings'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Government Alerts are right at the bottom. <strong>Severe Alerts</strong> is off. <strong>Tap it to turn it on.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Tap Safety &amp; emergency.</strong>', hint: 'It\'s near the bottom of the list.'},
            {screen: () => list(p, 'Safety &amp; emergency', [{label: 'Medical information'}, {label: 'Emergency SOS'}, {id: 'wea', label: 'Wireless emergency alerts'}, {label: 'Unknown tracker alerts'}]),
             target: 'wea', say: '<strong>Tap Wireless emergency alerts.</strong> <em>On some phones it\'s called Emergency alerts.</em>'},
            {screen: c => list(p, 'Wireless emergency alerts', [{label: 'Allow alerts', toggle: true}, {label: 'Extreme threats', toggle: true}, {id: 'severe', label: 'Severe threats', toggle: !!c.severe}, {label: 'Test alerts', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Severe threats</strong> is off. <strong>Tap it to turn it on.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="alert-pop"><strong>⚠️ Emergency alert: Severe</strong><p>Severe flooding is expected near the seafront. Move to higher ground. More at gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'This is what an alert looks like. It makes a loud siren sound for about 10 seconds, even on silent. <strong>Tap OK.</strong> <em>(Practice only.)</em>'},
        {screen: () => home(p), question: {q: 'An alert arrives while you\'re driving. What should you do?', options: [
            {t: 'Pull over somewhere safe before reading it', ok: true, why: 'Yes. Never read your phone while driving. Stop safely, then read it.'},
            {t: 'Read it straight away while driving', why: 'Never read your phone while driving. Find somewhere safe to stop first.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> Your phone will now warn you about serious danger nearby. Real alerts never ask for personal details or money: if one does, it\'s a scam.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Three things that make a stolen phone much less use to a thief. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Tap Face ID &amp; Passcode.</strong> <em>On a real iPhone you\'ll enter your passcode next.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Scroll down and <strong>tap Stolen Device Protection</strong>.'},
            {screen: c => list(p, 'Stolen Device Protection', [{id: 'sdp', label: 'Stolen Device Protection', toggle: !!c.sdp, sub: 'Away from home, changing your passcode or Apple Account needs Face ID, and a 1-hour wait.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'This stops a thief who\'s watched you type your passcode from locking you out. <strong>Turn it on.</strong>'},
            {screen: () => list(p, 'Stolen Device Protection', [{label: 'Stolen Device Protection', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Next, hide messages on the lock screen. <strong>Tap ‹ Face ID</strong> to go back.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Tap Notifications.</strong>'},
            {screen: c => list(p, 'Notifications', [{id: 'previews', label: 'Show Previews', value: c.previews || 'Always'}, {label: 'Screen Sharing', value: 'Notifications Off'}], {back: 'Settings',
                overlay: c.pickPrev ? sheet('Show Previews', [['prev-always', 'Always'], ['prev-unlocked', 'When Unlocked', 'Recommended'], ['prev-never', 'Never']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Right now anyone can read your messages, including security codes, without unlocking your phone. <strong>Tap Show Previews.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Tap Google.</strong>', hint: 'It\'s near the bottom of the list.'},
            {screen: () => list(p, 'Google', [{label: 'Manage your Google Account'}, {id: 'all-services', label: 'All services'}, {label: 'Backup'}]), target: 'all-services', say: '<strong>Tap All services.</strong>'},
            {screen: () => list(p, 'All services', [{caption: 'Personal &amp; device safety'}, {id: 'theft', label: 'Theft protection'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Tap Theft protection.</strong>'},
            {screen: c => list(p, 'Theft protection', [{id: 'tdl', label: 'Theft Detection Lock', toggle: !!c.tdl, sub: 'Locks your screen if it senses someone snatching your phone and running off.'}, {label: 'Offline Device Lock', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Turn on Theft Detection Lock.</strong> If someone grabs your phone and runs, it locks itself.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Next, hide messages on the lock screen. Back in Settings, <strong>tap Notifications</strong>.'},
            {screen: c => list(p, 'Notifications', [{id: 'previews', label: 'Notifications on lock screen', sub: c.previews || 'Show all content'}, {label: 'Notification history'}], {
                overlay: c.pickPrev ? sheet('Notifications on lock screen', [['prev-always', 'Show all content'], ['prev-unlocked', 'Hide sensitive content', 'Recommended'], ['prev-never', 'Don\'t show any notifications']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Right now anyone can read your messages, including security codes, without unlocking your phone. <strong>Tap Notifications on lock screen.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Notifications', [{label: 'Show Previews', value: 'Always'}], {back: 'Settings', overlay: sheet('Show Previews', [['prev-always', 'Always'], ['prev-unlocked', 'When Unlocked', 'Recommended'], ['prev-never', 'Never']])})
                : list(p, 'Notifications', [{label: 'Notifications on lock screen', sub: 'Show all content'}], {overlay: sheet('Notifications on lock screen', [['prev-always', 'Show all content'], ['prev-unlocked', 'Hide sensitive content', 'Recommended'], ['prev-never', 'Don\'t show any notifications']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'When Unlocked' : 'Hide sensitive content'}.</strong>`, hints: {'prev-always': 'That\'s how it was. Choose the recommended one.', 'prev-never': 'That hides them completely, which can be annoying. Choose the recommended one.'}},
        {screen: () => home(p), target: 'phone', say: 'Last, find your phone\'s IMEI number. Your network needs it to block a stolen phone. <strong>Open the Phone app.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'On the keypad, <strong>type *#06#</strong> (star, hash, zero, six, hash).', hint: 'Start with the star key *, bottom left.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Device info', 'IMEI: 35 209900 176148 1 (practice number)', [['ok', 'OK']])}),
         target: 'ok', say: 'That long number is your <strong>IMEI</strong>. On a real phone, write it down somewhere safe (not on the phone!). <strong>Tap OK.</strong>'},
        {screen: () => home(p), question: {q: 'Your phone has been snatched. Who do you ring first?', options: [
            {t: 'Your bank, from someone else\'s phone', ok: true, why: 'Yes. Thieves go for banking apps first. Then lock the phone online, ring your network, and report it on 101.'},
            {t: 'Wait and see if it turns up', why: 'Speed matters. Ring your bank straight away, then lock the phone and ring your network.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> Your phone is much harder for a thief to use, and you know where to find your IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'FIND MY' : 'TRACKER ALERT', title: p === 'ios' ? 'AirTag Found Moving With You' : 'Unknown tracker travelling with you',
            text: '<br>The location of this item can be seen by its owner.'}),
         target: 'alert', say: 'Your phone has noticed a tracker that isn\'t yours moving around with you. Don\'t panic: it\'s often a family member\'s by mistake. <strong>Tap the alert.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Unknown AirTag' : 'Unknown tracker', `<div class="mp-mini"><span class="mp-me"></span><span class="trail"></span></div>
            <p class="app-note">Seen with you since <strong>10:12</strong> today, at 4 places.</p>
            <button type="button" class="ph-btn ios-blue" data-tap="play">Play Sound</button>
            <button type="button" class="ph-btn-text" data-tap="learn">Learn About This ${p === 'ios' ? 'AirTag' : 'Tracker'}</button>
            <button type="button" class="ph-btn-text" data-tap="disable">Instructions to Disable</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'The map shows where it\'s been with you. <strong>Tap Play Sound</strong> so you can find it.'},
        {screen: () => app(p, p === 'ios' ? 'Unknown AirTag' : 'Unknown tracker', '<p class="app-note">🔊 <strong>Playing sound…</strong><br>Listen for a chirping sound.</p>', {color: '#fff'}),
         question: {q: 'You hear a faint chirp. Where should you look?', options: [
            {t: 'In bags, coat pockets, the car and anything you\'ve borrowed', ok: true, why: 'Yes. Trackers are small, about the size of a large coin, and are often tucked into linings, pockets or cars.'},
            {t: 'Nowhere, just ignore it', why: 'It\'s worth finding. Check bags, pockets and your car: it may just be a family member\'s.'}]}},
        {screen: c => app(p, 'Tracker found', `<p class="app-note">Hold the top of your phone near the tracker to see more about it.</p>
            <div class="tracker-coin" aria-hidden="true"></div><button type="button" class="ph-btn ios-blue" data-tap="scan">Hold near tracker</button>`, {color: '#fff'}),
         target: 'scan', say: 'You found it in your coat lining. <strong>Tap Hold near tracker</strong> to see who it belongs to.'},
        {screen: () => app(p, 'About this tracker', '<p class="app-note"><strong>Not in Lost Mode</strong><br>Serial number: P4R7-ACT1CE<br>Owner details are only shared with the police.</p>', {color: '#fff'}),
         question: {q: 'It\'s not a family member\'s, and you\'re worried someone hid it to follow you. What do you do?', options: [
            {t: 'Keep it safe and take it to the police (or ring 999 if you\'re in danger)', ok: true, why: 'Yes. Don\'t throw it away: the police can trace it to its owner. The National Stalking Helpline is on 0808 802 0300.'},
            {t: 'Throw it in the bin', why: 'It may be evidence, and the police can trace the owner. Keep it and take it to them, or ring 999 if you\'re in danger.'}]}},
        {screen: () => app(p, 'About this tracker', '<p class="app-note">Help: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 hours) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Well done!</strong> You know how to find a tracker and what to do. ' + (p === 'android' ? 'Check alerts are on in <strong>Settings > Safety &amp; emergency > Unknown tracker alerts</strong>.' : 'iPhones check for trackers automatically.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ic-text">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'You\'re on a cliff path and someone has fallen. There\'s no address. When you ring 999, most phones send your location automatically, but three words help too. <strong>Open what3words.</strong> <em>(A practice version.)</em>'},
        {screen: c => `<div class="ph-app-screen maps-app ph-${p}">${statusBar(p)}<div class="mp-map cliff"><span class="mp-me"></span><span class="w3w-square"></span></div>
            <div class="mp-card"><strong class="w3w-words">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ph-btn ios-blue" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'The blue dot is you. Every 3-metre square has its own three words. Yours are <strong>puffin.chalk.lantern</strong>. Wait a moment for the dot to settle, then <strong>tap I\'ve got my 3 words</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Now ring 999. <strong>Open the Phone app.</strong> <em>(Practice only: never ring 999 to test.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Type 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Tap the green call button.</strong>'},
        {screen: () => `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${avatar('9', '#dc2626')}<strong>999</strong><small>Emergency call · 0:08</small></div>
            <p class="call-handler">"Emergency, which service? … Ambulance. What\'s the exact location of the emergency?"</p>${homeIndicator(p)}</div>`,
         question: {q: 'The call handler asks where you are. What do you say?', options: [
            {t: '"I\'m on the cliff path. My what3words address is puffin, chalk, lantern."', ok: true, why: 'Yes. Say where you are in your own words, then give the three words. Spell any word if they ask.'},
            {t: '"I don\'t know, somewhere near the sea"', why: 'They\'ll try to find you, but three words pinpoint you to 3 metres. Read them out from the app.'}]}},
        {screen: () => home(p), question: {q: 'A friend is deaf and can\'t make voice calls. How can they reach 999?', options: [
            {t: 'Register for emergency text (text "register" to 999) now, or use the 999 BSL app', ok: true, why: 'Yes. Emergency text only works if you register first. The 999 BSL app connects to a sign-language interpreter.'},
            {t: 'They can\'t', why: 'They can. Register for emergency text by texting "register" to 999, or use the free 999 BSL app.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> Remember: say where you are, then give your three words. The what3words app works without signal for finding your words, but you need signal to ring.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="ph-boot">${ctx.busy ? `<span class="boot-logo">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="ph-app-screen frozen ph-${p}">${statusBar(p)}<div class="frozen-app"><p>⏳</p><p>Not responding</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Your phone is stuck: tapping does nothing and it won\'t turn off the normal way. Is this a big problem?', options: [
            {t: 'Usually not. A "forced restart" fixes it, and you don\'t lose anything', ok: true, why: 'Right. A forced restart is like switching it off at the wall. Your photos and messages are safe.'},
            {t: 'Yes, it\'s broken', why: 'Usually not! A forced restart fixes most frozen phones, and you don\'t lose anything.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'On an iPhone: <strong>press and let go of volume up</strong>, then <strong>press and let go of volume down</strong>, then <strong>press and hold the side button</strong> until the Apple logo appears (about 10 seconds). Here, tap them in that order.'
            : 'On most Android phones: <strong>press and hold the power button and volume down together</strong> for about 10 seconds, until it restarts. Here, tap power, then volume down. <em>(Google Pixel: hold just the power button for 30 seconds.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Volume up comes first.' : 'Start with the power button.', side: 'The side button is last, after both volume buttons.'},
         hint: p === 'ios' ? 'Volume up, then volume down, then the side button.' : 'Power, then volume down.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'The logo has appeared. What now?', options: [
            {t: 'Let go and wait for it to start up', ok: true, why: 'Yes. It takes a minute. You may need to type your passcode once.'},
            {t: 'Keep pressing all the buttons', why: 'Let go once the logo appears, and give it a minute to start up.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Well done!</strong> Your phone has restarted. If it keeps freezing, check for updates and free up storage. Restarting your phone once a week keeps it running smoothly.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="cc-screen ${p}">${statusBar(p)}<div class="qp-grid">
            <button type="button" class="qp-tile${plane ? ' on' : ''}" data-tap="airplane">✈︎ Airplane mode<small>${plane ? 'On' : 'Off'}</small></button>
            <span class="qp-tile${plane ? '' : ' on'}">📶 Mobile data<small>${plane ? 'Off' : (ctx.signal ? 'On · 4G' : 'No service')}</small></span>
            <span class="qp-tile on">Wi-Fi<small>${plane ? 'Off' : 'Home'}</small></span><span class="qp-tile">🔦 Torch<small>Off</small></span></div>
            <button type="button" class="cc-close" data-tap="close">${p === 'ios' ? 'Swipe up to close' : 'Close'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="ph-status-r">', '<span class="ph-status-r"><span class="no-svc">No service</span>'), target: 'pull-down',
         say: 'Your phone says <strong>No service</strong>, though it worked this morning. A quick fix is to turn Airplane mode on and off, which makes it reconnect. ' + (p === 'ios' ? '<strong>Swipe down from the top-right corner</strong> (or tap the strip).' : '<strong>Swipe down from the top</strong> (or tap the strip).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Tap Airplane mode</strong> to turn it on. Everything wireless switches off.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Wait about 10 seconds… then <strong>tap Airplane mode again</strong> to turn it off.'},
        {screen: c => quickPanel(p, c), question: {q: 'Mobile data is back on 4G. When else is Airplane mode handy?', options: [
            {t: 'On a plane, or abroad to avoid roaming charges (you can still turn Wi-Fi on)', ok: true, why: 'Yes. You can turn Wi-Fi back on while Airplane mode is on, to use hotel or ship Wi-Fi.'},
            {t: 'To charge the phone', why: 'It charges a little faster, but it\'s mainly for flights and avoiding roaming charges abroad.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Well done!</strong> If Airplane mode doesn\'t fix it, restart your phone. Still no service? Check your network\'s website for problems in your area.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ic-text">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="ph-notif" data-tap="notif"><strong>BUBBLE POP · now</strong><span>🎁 Your FREE lives are waiting! Come back and play! 🎉</span></button>',
         target: 'settings', say: 'A game keeps buzzing with pointless messages. You can turn off notifications for any app. <strong>Tap Settings</strong>, not the message.', hints: {notif: 'That opens the game. Tap Settings instead.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Tap Notifications.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Notifications', [{label: 'Show Previews', value: 'When Unlocked'}, {caption: 'NOTIFICATION STYLE'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Banners, Sounds, Badges'}, {label: 'Messages', sub: 'Banners, Sounds, Badges'}, {label: 'WhatsApp', sub: 'Banners, Sounds, Badges'}], {back: 'Settings'})
            : list(p, 'Notifications', [{id: 'app-notifs', label: 'App notifications'}, {id: 'history', label: 'Notification history'}, {label: 'Notifications on lock screen'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Tap Bubble Pop.</strong>' : '<strong>Tap App notifications.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'App notifications', [{label: 'Messages', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Tap the switch next to Bubble Pop</strong> to turn its notifications off.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Allow Notifications', toggle: !c.off}], {back: 'Notifications'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Turn off Allow Notifications.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Notifications', [{label: 'App notifications'}, {id: 'history', label: 'Notification history', sub: 'Off'}]), target: 'history',
             say: 'Handy extra: if you ever swipe a message away by mistake, Notification history keeps a copy. <strong>Tap Notification history.</strong>'},
            {screen: c => list(p, 'Notification history', [{id: 'hist-toggle', label: 'Use notification history', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Turn it on.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Which apps\' notifications are worth keeping on?', options: [
            {t: 'Messages, calls, WhatsApp, your bank and anything you\'d want to know about straight away', ok: true, why: 'Yes. Keep the important ones, and turn off games, shops and anything that just nags.'},
            {t: 'Turn them all off', why: 'You\'d miss messages and calls! Keep the important ones, and turn off games and shopping apps.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Well done!</strong> Bubble Pop won\'t bother you any more. ' + (p === 'ios' ? 'If you swipe a message away by mistake, swipe up from the middle of the lock screen to see earlier ones.' : 'And notification history keeps a copy of anything you swipe away.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}<div class="msg-head"><strong>Sarah</strong></div>
            <div class="wa-thread"><div class="wa-bubble me sms"><span>See you at the ducking garden centre x</span><small>10:20</small></div></div>
            <div class="msg-bar"><span class="msg-box">Text message</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'You typed "Dunnington garden centre" and your phone changed it. Why?', options: [
            {t: 'Autocorrect guessed the wrong word', ok: true, why: 'Yes. Autocorrect swaps words it doesn\'t know. You can turn it off, or teach it new words.'},
            {t: 'The phone is broken', why: 'It\'s just autocorrect guessing. You can turn it off or teach it words.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Tap General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'About'}, {label: 'Software Update'}, {id: 'keyboard', label: 'Keyboard'}, {label: 'Language &amp; Region'}], {back: 'Settings'}), target: 'keyboard', say: '<strong>Tap Keyboard.</strong>'},
            {screen: c => list(p, 'Keyboards', [{id: 'replace', label: 'Text Replacement'}, {caption: 'ALL KEYBOARDS'}, {label: 'Auto-Capitalisation', toggle: true}, {id: 'ac', label: 'Auto-Correction', toggle: !c.acOff}, {label: 'Predictive Text', toggle: true}], {back: 'General'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Turn off Auto-Correction.</strong> Spelling mistakes still get a red underline, so you can fix them yourself.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Tap System.</strong> It\'s at the bottom.'},
            {screen: () => list(p, 'System', [{id: 'keyboard', label: 'Keyboard'}, {label: 'Languages'}, {label: 'Date &amp; time'}]), target: 'keyboard', say: '<strong>Tap Keyboard.</strong>'},
            {screen: () => list(p, 'Keyboard', [{id: 'gboard', label: 'Gboard', sub: 'On-screen keyboard'}]), target: 'gboard', say: '<strong>Tap Gboard.</strong> <em>On a Samsung, it\'s Samsung Keyboard > Smart typing.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferences'}, {id: 'correction', label: 'Text correction'}, {label: 'Glide typing'}]), target: 'correction', say: '<strong>Tap Text correction.</strong>'},
            {screen: c => list(p, 'Text correction', [{label: 'Show suggestion strip', toggle: true}, {id: 'ac', label: 'Auto-correction', toggle: !c.acOff}, {label: 'Spell check', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Turn off Auto-correction.</strong> Spelling mistakes still get a red underline, so you can fix them yourself.'},
        ]),
        {screen: () => home(p), question: {q: 'You\'d rather keep autocorrect, but it always changes "Dunnington". What else could you do?', options: [
            {t: 'Add it to the phone\'s dictionary, so it learns the word', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Use Text Replacement in the same Keyboard settings.' : 'Tap the word in the suggestion strip and choose to add it to your dictionary.')},
            {t: 'Nothing, just put up with it', why: 'You can teach it: ' + (p === 'ios' ? 'add the word in Keyboard > Text Replacement.' : 'tap the word in the suggestions and add it to your dictionary.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> No more surprise word swaps. You can turn it back on any time in the same place.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'You\'ve got new wireless headphones. What do you do first?', options: [
            {t: 'Put them in "pairing mode" (usually hold the button until a light flashes)', ok: true, why: 'Yes. Pairing mode lets your phone find them. The instructions in the box say exactly how.'},
            {t: 'Plug them into the phone', why: 'Wireless headphones connect by Bluetooth. Put them in pairing mode first, usually by holding the button until a light flashes.'}]}},
        {screen: () => home(p), target: 'settings', say: 'The headphones\' light is flashing. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Tap Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Tap Connected devices.</strong>'},
            {screen: () => list(p, 'Connected devices', [{id: 'pair', label: '＋ Pair new device'}, {label: 'Saved devices', sub: 'Car'}]), target: 'pair', say: '<strong>Tap Pair new device.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Pair new device', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'MY DEVICES' : 'Saved'}, {label: 'Car', sub: 'Not connected'},
            {caption: p === 'ios' ? 'OTHER DEVICES' : 'Available devices'}, {id: 'headphones', label: '🎧 Practice Headphones'}, {label: 'Neighbour\'s TV'}], {back: 'Settings'}),
         target: 'headphones', say: 'Your phone is looking for nearby devices. <strong>Tap Practice Headphones.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'MY DEVICES'}, {label: '🎧 Practice Headphones', sub: 'Connected ✓'}, {label: 'Car', sub: 'Not connected'}], {back: 'Settings'}),
         question: {q: 'Next time you turn the headphones on, do you have to do this again?', options: [
            {t: 'No, they connect by themselves from now on', ok: true, why: 'Yes. You only pair once. After that they connect automatically when they\'re on and nearby.'},
            {t: 'Yes, every time', why: 'You only pair once. After that they connect by themselves.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '🎧 Practice Headphones', sub: 'Connected ✓'}], {back: 'Settings'}), done: true,
         say: '<strong>Well done!</strong> The same steps work for a car, speaker or hearing aids. If something won\'t connect, turn Bluetooth off and on, and put the device back in pairing mode.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="call-handler">"${ctx.said || 'Gran? It\'s me, Tom! I\'ve lost my phone and I\'m in trouble. I need £400 for a fine, today. Please don\'t tell Mum!'}"</p>
            <div class="call-choices"><button type="button" data-tap="ask-phrase">Ask for the family safe phrase</button><button type="button" data-tap="send-money">Say you\'ll send the money</button></div>
            <div class="call-answer single"><button type="button" class="decline" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="call-answer"><button type="button" class="decline" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="accept" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="call-labels"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'An unknown number is ringing. <strong>Answer it</strong>, to practise what to do.', hints: {decline: 'Declining is fine in real life! For this practice, tap Answer.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Er… what? Gran, there\'s no time for that! Please, I need the money now!'; },
         say: 'It sounds just like your grandson Tom. But scammers can copy voices. Your family agreed a <strong>safe phrase</strong>. <strong>Ask for it.</strong>',
         hints: {'send-money': 'Never agree to send money on a call like this. Ask for the safe phrase.', end: 'Hanging up is fine too! But first, practise asking for the safe phrase.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'They don\'t know it, and they\'re pushing harder. That\'s a scammer. <strong>Hang up</strong> with the red button.', hints: {'send-money': 'Don\'t! They didn\'t know the phrase. Hang up.', 'ask-phrase': 'You\'ve asked, and they couldn\'t answer. Hang up.'}},
        {screen: () => home(p), question: {q: 'You\'re still a bit worried about Tom. What do you do?', options: [
            {t: 'Ring Tom (or his mum) on the number you already have for him', ok: true, why: 'Yes. Always ring back on a number you know. The real Tom will be fine, and won\'t mind you checking.'},
            {t: 'Ring back the number that called you', why: 'That reaches the scammer again. Ring Tom on the number you already have for him.'}]}},
        {screen: () => home(p), target: 'phone', say: 'If a call is about your bank account, you can ring <strong>159</strong> to reach your own bank safely. <strong>Open the Phone app</strong> to practise.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Type 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Tap the green call button.</strong> <em>(Practice only: nothing is dialled.)</em>'},
        {screen: () => `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="call-handler">"Welcome to 159. Please say the name of your bank, and we'll connect you."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Well done!</strong> 159 connects you to your real bank. Agree a safe phrase with your family face to face, and never post it online.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="ph-hello ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hello' : 'Hi there'}</h3><button type="button" class="ph-btn ios-blue" data-tap="start">${p === 'ios' ? 'Swipe up to open' : 'Get started'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Your new phone is out of the box and switched on. Keep your <strong>old phone</strong> nearby, charged and on Wi-Fi. <strong>Tap ${p === 'ios' ? 'Swipe up to open' : 'Get started'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Quick Start' : 'Copy apps &amp; data', [], {noBack: true, top: `<p class="app-note">${p === 'ios' ? 'Bring your old iPhone near this one to set it up with your Apple Account.' : 'Copy your apps, photos, contacts and more from your old phone.'}</p>
            <button type="button" class="ph-btn ${p === 'ios' ? 'ios-blue' : 'and-green'}" data-tap="use-old">${p === 'ios' ? 'Continue on your old iPhone' : 'Use your old device'}</button>
            <button type="button" class="ph-btn-text" data-tap="manual">Set up manually instead</button>`}),
         target: 'use-old', say: 'Copying from your old phone saves setting everything up again. <strong>Tap ' + (p === 'ios' ? 'Continue on your old iPhone' : 'Use your old device') + '.</strong>', hints: {manual: 'You can, but copying is much easier. Tap the other button.'}},
        {screen: () => `<div class="ph-app-screen ph-${p} transfer-scan">${statusBar(p)}<p class="app-note">On your <strong>old</strong> phone, a message appears. Point its camera at this pattern.</p>
            <div class="swirl" aria-hidden="true"></div><button type="button" class="ph-btn ios-blue" data-tap="scanned">Old phone has scanned it</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'On the old phone, tap Continue, then hold it over this pattern so the camera can see it. Here, <strong>tap Old phone has scanned it</strong>.'},
        {screen: c => codeScreen(p, c, 'Enter your old phone\'s passcode', 'This copies your settings safely.'), sequence: CODE_KEYS,
         say: `Type your old phone's passcode. For practice, use <strong>${codeText}</strong>.`, hint: `Type the practice code ${codeText}.`},
        {screen: () => list(p, 'Transfer your data', [], {noBack: true, top: `<p class="app-note">Choose what to bring across:</p>
            <div class="set-row static"><span>Photos and videos</span>${tog(true)}</div><div class="set-row static"><span>Contacts and messages</span>${tog(true)}</div><div class="set-row static"><span>Apps</span>${tog(true)}</div>
            <button type="button" class="ph-btn ios-blue" data-tap="transfer">Continue</button>`}),
         target: 'transfer', say: 'Everything is ticked. <strong>Tap Continue.</strong> Keep both phones close together and plugged in.'},
        {screen: c => list(p, 'Transferring…', [], {noBack: true, top: `<div class="stor-head"><span>${c.busy ? 'About 25 minutes remaining' : 'Transfer complete ✓'}</span><div class="stor-bar"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'The transfer has finished. What should you do with the old phone?', options: [
            {t: 'Keep it for a week to check nothing\'s missing, then wipe it properly before selling or recycling', ok: true, why: 'Yes. Check your photos, WhatsApp and banking apps work on the new phone first. The next lesson shows how to wipe the old one.'},
            {t: 'Throw it in the bin straight away', why: 'It still has all your information on it! Check the new phone has everything, then wipe the old one properly.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> Your new phone has your photos, contacts and apps. Some apps, like banking and WhatsApp, ask you to sign in again; have your details ready.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Selling, giving away or recycling your old phone? Do these in the right order, or the next owner can\'t use it. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Step 1: sign out of your Apple Account. <strong>Tap your name</strong>.'},
            {screen: c => list(p, 'Apple Account', [{label: 'Personal Information'}, {label: 'Sign-In &amp; Security'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Sign Out', danger: true}], {back: 'Settings',
                overlay: c.ask ? dialog(p, 'Sign out?', 'Your password is needed to turn off Find My. (Practice: entered for you.)', [['cancel', 'Cancel'], ['turn-off', 'Turn Off']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Scroll to the bottom and <strong>tap Sign Out</strong>.'},
            {screen: () => list(p, 'Apple Account', [{label: 'Sign Out', danger: true}], {back: 'Settings', overlay: dialog(p, 'Sign out?', 'Your password is needed to turn off Find My. (Practice: entered for you.)', [['cancel', 'Cancel'], ['turn-off', 'Turn Off']])}),
             target: 'turn-off', say: 'This turns off <strong>Find My</strong>, which would otherwise lock the phone to you. <strong>Tap Turn Off.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Step 2: wipe it. <strong>Tap General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'About'}, {label: 'iPhone Storage'}, {id: 'reset', label: 'Transfer or Reset iPhone'}], {back: 'Settings'}), target: 'reset', say: '<strong>Tap Transfer or Reset iPhone</strong>, at the bottom.'},
            {screen: c => list(p, 'Transfer or Reset iPhone', [{label: 'Reset'}, {id: 'erase', label: 'Erase All Content and Settings'}], {back: 'General',
                overlay: c.askErase ? dialog(p, 'Erase This iPhone?', 'All photos, messages and apps will be deleted.', [['cancel', 'Cancel'], ['confirm-erase', 'Erase']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Tap Erase All Content and Settings.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Step 1: remove your Google Account. <strong>Tap Google</strong>. <em>(On a Samsung, also remove your Samsung account.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Manage your Google Account'}, {id: 'accounts', label: 'Accounts on this device', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Tap Accounts on this device.</strong>'},
            {screen: c => list(p, 'Google account', [{label: 'margaret.smith@example.com'}, {label: 'Account sync'}, {id: 'remove', label: 'Remove account', danger: true}], {overlay: c.ask ? dialog(p, 'Remove account?', 'Removing it deletes its messages, contacts and data from this phone.', [['cancel', 'Cancel'], ['confirm-remove', 'Remove account']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Without this, the phone stays locked to your account after a reset. <strong>Tap Remove account.</strong>'},
            {screen: () => list(p, 'Account', [{label: 'Remove account', danger: true}], {overlay: dialog(p, 'Remove account?', 'Removing it deletes its messages, contacts and data from this phone.', [['cancel', 'Cancel'], ['confirm-remove', 'Remove account']])}),
             target: 'confirm-remove', say: '<strong>Tap Remove account.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Step 2: wipe it. <strong>Tap System</strong>, at the bottom.'},
            {screen: () => list(p, 'System', [{label: 'Languages'}, {label: 'Software update'}, {id: 'reset', label: 'Reset options'}]), target: 'reset', say: '<strong>Tap Reset options.</strong>'},
            {screen: c => list(p, 'Reset options', [{label: 'Reset Wi-Fi, mobile &amp; Bluetooth'}, {id: 'erase', label: 'Erase all data (factory reset)'}], {overlay: c.askErase ? dialog(p, 'Erase all data?', 'All photos, messages and apps will be deleted.', [['cancel', 'Cancel'], ['confirm-erase', 'Erase all data']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Tap Erase all data (factory reset).</strong>'},
        ]),
        {screen: () => list(p, 'Reset', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Erase This iPhone?' : 'Erase all data?', 'All photos, messages and apps will be deleted.', [['cancel', 'Cancel'], ['confirm-erase', p === 'ios' ? 'Erase' : 'Erase all data']])}),
         target: 'confirm-erase', say: 'Only do this once your photos are safely on your new phone or backed up. <strong>Tap ' + (p === 'ios' ? 'Erase' : 'Erase all data') + '.</strong> <em>(Practice: nothing is deleted.)</em>'},
        {screen: () => `<div class="ph-hello ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hello' : 'Hi there'}</h3><p class="app-note">Ready for its next owner</p>${homeIndicator(p)}</div>`,
         question: {q: 'One last thing before you hand it over?', options: [
            {t: 'Take out the SIM card (and any memory card)', ok: true, why: 'Yes. The SIM has your phone number on it. Pop it out with the little tool or a paper clip.'},
            {t: 'Nothing else', why: 'Take out your SIM card, and any memory card. Your number is on the SIM.'}]}},
        {screen: () => `<div class="ph-hello ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hello' : 'Hi there'}</h3><p class="app-note">Ready for its next owner</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Well done!</strong> Sign out, wipe, remove the SIM: in that order. The "Hello" screen means it\'s ready for someone else.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="asst-card"><strong>Reminder</strong><span>Ring Sarah</span><small>Today at 15:00</small></div>`
            : ctx.weather ? '<div class="asst-card"><strong>Bridlington</strong><span>⛅ 12°, showers later</span><small>High 14° · Low 8°</small></div>' : '';
        return `<div class="asst ${p}"><p class="asst-hint">${result ? '' : `${name} is listening… what would you like to say?`}</p>${result}
            <div class="asst-says">${[['say-remind', '"Remind me to ring Sarah at 3"'], ['say-weather', '"What\'s the weather today?"'], ['say-joke', '"Order me a pizza"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="asst-orb" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="edge-btn right at1" data-hold="side" aria-label="${p === 'ios' ? 'Side button (press and hold)' : 'Power button (press and hold)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> does things when you ask out loud. <strong>Press and hold the side button</strong> (on the right) until Siri appears. You can also just say "Siri" or "Hey Siri".'
                          : 'Your phone can do things when you ask out loud. <strong>Press and hold the power button</strong> (on the right) until the assistant appears. You can also say "Hey Google".',
         hint: 'Keep your finger (or mouse button) pressed on the button on the right edge.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'On a real phone you\'d just speak. Here, <strong>tap "Remind me to ring Sarah at 3"</strong>.', hints: {'say-joke': 'Try the reminder first.', 'say-weather': 'Try the reminder first.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Done: a reminder pops up at 3 o\'clock. Now <strong>ask about the weather</strong>.', hints: {'say-remind': 'That\'s set. Now ask about the weather.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Which of these could you ask your phone?', options: [
            {t: 'All of them: "Call Sarah", "Set a timer for 10 minutes", "Turn on the torch", "Read my messages"', ok: true, why: 'Yes. It\'s handy when your hands are full, your eyes are tired or typing is fiddly.'},
            {t: 'Only the weather', why: 'It can do lots: calls, timers, the torch, reading messages, alarms and more.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Well done!</strong> Speak clearly and naturally, as if to a person. If it mishears, just ask again.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="lens-modes">${[['lens-text', 'Text'], ['lens-translate', 'Translate'], ['lens-search', 'Search']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="cam-paper menu"><strong>${ctx.translated ? 'Menu' : 'Carte'}</strong><span>${ctx.translated ? 'Fish soup' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Chicken with mushrooms' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Apple tart' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="cam-paper${ctx.textOn ? ' textmode' : ''}"><strong>Bridlington Surgery</strong><span>Your flu jab is due.</span><span>To book, ring ${ctx.textOn ? '<button type="button" class="hl" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="copy-pop"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="ph-app-screen cam-app ph-${p}">${statusBar(p)}<div class="cam-view">${subject}${copy}</div>${menu}
            <div class="cam-bar"><span></span><button type="button" class="cam-shutter" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="lens-btn" data-tap="lens" aria-label="${p === 'ios' ? 'Live Text' : 'Google Lens'}">${p === 'ios' ? '⌗' : '◎'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Your camera can read writing. Let\'s copy a phone number from a letter. <strong>Open the Camera.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Point it at the letter. When it spots writing, a small <strong>text button ⌗</strong> appears. <strong>Tap it.</strong>' : 'Point it at the letter and <strong>tap the Lens button ◎</strong>.',
         hints: {shutter: 'That takes a normal photo. Tap the ' + (p === 'ios' ? 'text button ⌗' : 'Lens button ◎') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'The writing is now real text. <strong>Tap the phone number.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Tap Copy</strong>, ready to paste into a message or your contacts. <em>(Call would ring it straight away.)</em>', hints: {'call-num': 'That would ring the number. For this practice, tap Copy.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'On holiday? Now it\'s pointing at a French menu. ' + (p === 'ios' ? 'The Translate app or the Google app\'s Lens can do this. ' : '') + '<strong>Tap Translate.</strong>', hints: {'lens-text': 'That copies the French. Tap Translate.', 'lens-search': 'Tap Translate.'}},
        {screen: c => cameraLens(p, c), question: {q: 'What else can the camera do this way?', options: [
            {t: 'Identify plants and birds, and scan letters into a PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'In the Notes app, tap the paperclip, then Scan Documents, to turn letters into a PDF.' : 'In Google Drive, tap + then Scan to turn letters into a PDF.')},
            {t: 'Only take photos', why: 'It does much more: identify plants, translate, copy text and scan letters into PDFs.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Well done!</strong> You copied a number and translated a menu with your camera. ' + (p === 'ios' ? 'Live Text also works on photos you\'ve already taken.' : 'Google Lens also works on photos you\'ve already taken.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Library eBooks', `<p class="app-note">Signed in with your library card</p>
                <div class="lib-tabs"><button type="button" data-tap="tab-ebooks">eBooks</button><button type="button" data-tap="tab-audio" class="on">eAudiobooks</button></div>
                <div class="lib-grid">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="lib-book" data-tap="${id}"><span class="lib-cover" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="lib-detail"><span class="lib-cover big" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Due back in 21 days' : '3 of 5 copies available'}</small>
                ${ctx.borrowed ? '<button type="button" class="ph-btn ios-blue" data-tap="listen">Listen</button>' : '<button type="button" class="ph-btn ios-blue" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="ph-app-screen player ph-${p}">${statusBar(p)}<span class="lib-cover big" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="pl-bar"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="pl-controls"><button type="button" data-tap="back30">↺30</button><button type="button" class="pl-play" data-tap="play">${ctx.playing ? '❚❚' : '▶'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="pl-extras"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">☾ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Library', '#7c3aed', '<span class="ic-text">📚</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'With a free library card, you can borrow eBooks and audiobooks on your phone. East Riding Libraries use the <strong>BorrowBox</strong> app. This is a practice version. <strong>Open it.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'You\'re signed in with your library card. <strong>Tap The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'It\'s free to borrow. <strong>Tap Borrow.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'It\'s yours for 21 days. <strong>Tap Listen.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Tap the play button ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Listening in bed? A <strong>sleep timer</strong> stops it after a while, so you don\'t lose your place. <strong>Tap Sleep timer.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'What happens when the 21 days are up?', options: [
            {t: 'It goes back by itself. No fines, and you can renew if you haven\'t finished', ok: true, why: 'Yes. eBooks and audiobooks return themselves automatically.'},
            {t: 'You get a fine', why: 'There are no fines. It returns itself, and you can renew it if you haven\'t finished.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Well done!</strong> To get started for real, join at eastridinglibraries.co.uk or any library, then download BorrowBox and sign in with your card.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="park-sign"><strong>P</strong><span>Harbour Road Car Park</span><span>Pay by app: location <b>4471</b></span></div>
                <p class="app-note">Enter the location number from the sign</p>${field('parkcode', 'Location number', ctx, 'tel')}<button type="button" class="ph-btn ios-blue" data-tap="find">Find car park</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="app-note"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="set-row static"><span>Vehicle</span><span class="set-val">AB12 CDE</span></div>
                <div class="park-times">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="ph-small">Service charge: 20p</p><button type="button" class="ph-btn ios-blue" data-tap="pay">${ctx.time ? 'Pay £3.20' : 'Choose a time'}</button>`, {color});
        }
        return app(p, 'Parking', `<div class="park-live"><strong>You're parked ✓</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ph-btn" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ic-text">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Many car parks let you pay by app, so you don\'t need coins. Each council uses different apps (the sign tells you which). This is a practice one. <strong>Open Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Type the location number from the sign: 4471.',
         say: 'Every car park has a <strong>location number</strong> on the sign. <strong>Type 4471</strong> in the box and <strong>tap Find car park</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Your car\'s number plate is already saved. <strong>Choose 2 hours.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'There\'s a small service charge for using the app. <strong>Tap Pay £3.20.</strong> <em>(Practice: no money is taken.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'You\'re running late at the shops. What can you do?', options: [
            {t: 'Tap Extend in the app to add more time, without going back to the car', ok: true, why: 'Yes. That\'s the big plus of paying by app. Most also remind you before your time runs out.'},
            {t: 'Nothing, you\'ll get a ticket', why: 'Most parking apps let you tap Extend to add time from wherever you are.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Well done!</strong> Most machines still take cards or coins too, and many apps also let you pay by ringing a number or sending a text. Never pay through a QR code sticker on a machine: they can be fake.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="wa-bubble me sms"><span>INFO</span><small>10:02</small></div>
            <div class="wa-bubble them"><span>You are out of contract since 3 March 2026. You can switch at no cost. Your monthly price is £24.00. To switch and keep your number, text PAC to 65075.</span><small>10:02</small></div>` : '';
        return `<div class="ph-app-screen msg-app ph-${p}">${statusBar(p)}<div class="msg-head"><span class="msg-back">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="wa-thread">${reply}</div>
            <div class="msg-bar">${field('smsbody', 'Text message', ctx)}<button type="button" class="wa-send" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Are you still in contract, or paying too much? One free text tells you. <strong>Open Messages.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Type INFO in the message box, then tap send.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'We\'ve started a new message to <strong>85075</strong>. <strong>Type INFO</strong> and <strong>tap send</strong>. It\'s free on every UK network.'},
        {screen: c => smsTo(p, c), question: {q: 'The reply says you\'re out of contract and still paying £24 a month. What does that mean?', options: [
            {t: 'Your phone is paid off. A SIM-only deal could cost much less, and you can keep your number', ok: true, why: 'Yes. Text PAC to 65075 for a code to switch and keep your number. Your new provider does the rest.'},
            {t: 'Nothing, keep paying', why: 'You may be paying for a phone you\'ve already paid off. A SIM-only deal could save you a lot.'}]}},
        {screen: () => home(p), target: 'settings', say: 'One more saver, for trips abroad: turn off data roaming so you don\'t get charged by surprise. <strong>Tap Settings.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Tap Mobile Service.</strong>'},
            {screen: () => list(p, 'Mobile Service', [{label: 'Mobile Data', toggle: true}, {id: 'options', label: 'Mobile Data Options', value: 'Roaming On'}, {label: 'Personal Hotspot'}], {back: 'Settings'}), target: 'options', say: '<strong>Tap Mobile Data Options.</strong>'},
            {screen: c => list(p, 'Mobile Data Options', [{id: 'roam', label: 'Data Roaming', toggle: !c.roamOff}, {label: 'Voice &amp; Data', value: '5G Auto'}], {back: 'Mobile Service'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Turn off Data Roaming.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Tap Network &amp; internet.</strong>'},
            {screen: () => list(p, 'Network &amp; internet', [{label: 'Internet', sub: 'Home Wi-Fi'}, {id: 'sims', label: 'SIMs', sub: 'Your network'}, {label: 'Airplane mode', toggle: false}]), target: 'sims', say: '<strong>Tap SIMs.</strong>'},
            {screen: c => list(p, 'SIMs', [{label: 'Mobile data', toggle: true}, {id: 'roam', label: 'Roaming', toggle: !c.roamOff, sub: 'Connect to data services when roaming'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Turn off Roaming.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Well done!</strong> You can still use Wi-Fi abroad for WhatsApp, video calls and maps. Turn roaming back on if you need mobile data and know what your network charges.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Sharing your location lets family see you got home safely. It\'s your choice, and you can stop any time. <strong>Open Find My.</strong>'},
        {screen: c => app(p, 'People', `<p class="app-note">No one is sharing yet.</p><button type="button" class="ph-btn ios-blue" data-tap="share">Share My Location</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Tap Share My Location.</strong>'},
        {screen: c => app(p, 'Share with', '', {color: '#fff', overlay: sheet('Choose a contact', [['pick-sarah', 'Sarah', 'Daughter'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Tap Sarah.</strong>', hints: {'pick-dave': 'Choose Sarah for this practice.'}},
        {screen: c => app(p, 'Share with Sarah', '', {color: '#fff', overlay: sheet('How long?', [['one-hour', 'Share for One Hour'], ['day', 'Share Until End of Day'], ['always', 'Share Indefinitely']])}),
         target: 'always', say: 'Choose how long. For family you trust, <strong>tap Share Indefinitely</strong>. You can stop at any time.', hints: {'one-hour': 'That\'s handy for one trip. For this practice, choose Share Indefinitely.', day: 'For this practice, choose Share Indefinitely.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Sharing your location lets family see you got home safely. It\'s your choice, and you can stop any time. <strong>Open Maps.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="mp-top">', '<div class="mp-top"><button type="button" class="app-plus round" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Tap your profile picture</strong> at the top right.'},
        {screen: () => app(p, 'Maps', '', {color: '#fff', overlay: sheet('', [['sharing', 'Location sharing'], ['timeline', 'Your Timeline'], ['settings', 'Settings']])}), target: 'sharing', say: '<strong>Tap Location sharing.</strong>'},
        {screen: () => app(p, 'Location sharing', '<button type="button" class="ph-btn and-green" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Tap New share.</strong>'},
        {screen: () => app(p, 'Share with', '', {color: '#fff', overlay: sheet('Choose a contact', [['pick-sarah', 'Sarah', 'Daughter'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Tap Sarah.</strong>', hints: {'pick-dave': 'Choose Sarah for this practice.'}},
        {screen: () => app(p, 'Share with Sarah', '', {color: '#fff', overlay: sheet('How long?', [['one-hour', 'For 1 hour'], ['always', 'Until you turn this off']])}),
         target: 'always', say: 'For family you trust, <strong>tap Until you turn this off</strong>.', hints: {'one-hour': 'Handy for one trip. For this practice, choose Until you turn this off.'}},
    ]).concat([
        {screen: () => app(p, 'Sharing with Sarah', `<div class="mp-mini"><span class="mp-me"></span></div><p class="app-note">Sarah can see where you are. ${p === 'ios' ? 'Tap Stop Sharing' : 'Tap Stop'} at any time.</p>`, {color: '#fff'}),
         question: {q: 'Someone you\'ve just met online asks you to share your location. Should you?', options: [
            {t: 'No. Only share with close family or friends you trust', ok: true, why: 'Exactly. Your location shows where you live and when you\'re out. Keep it to people you trust.'},
            {t: 'Yes, they seem nice', why: 'Only share your location with close family and friends. It shows where you live and when you\'re out.'}]}},
        {screen: () => app(p, 'Sharing with Sarah', '<p class="app-note">Sarah can see where you are.</p>', {color: '#fff'}), done: true,
         say: '<strong>Well done!</strong> Sarah can see you\'re safe. Check now and then who you\'re sharing with, and stop sharing with anyone you don\'t need to.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Your grandson Leo is getting his first iPhone. <strong>Screen Time</strong> sets healthy limits. This is <strong>Leo\'s</strong> phone. <strong>Tap Settings.</strong>'},
        {screen: c => list(p, 'Settings', [{label: 'Leo', sub: 'Apple Account'}, {label: 'Notifications'}, {id: 'screen-time', label: 'Screen Time'}, {label: 'General'}], {noBack: true}), target: 'screen-time', say: '<strong>Tap Screen Time.</strong>'},
        {screen: c => list(p, 'Screen Time', [{id: 'downtime', label: 'Downtime', sub: c.downtime ? '20:00 – 07:00' : 'Off'}, {label: 'App Limits'}, {id: 'content', label: 'Content &amp; Privacy Restrictions', sub: c.content ? 'On' : 'Off'}, {label: 'Use Screen Time Passcode'}], {back: 'Settings'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Downtime</strong> locks most apps at night (calls still work). <strong>Tap Downtime</strong> to turn it on, 8pm to 7am.'},
        {screen: c => list(p, 'Screen Time', [{label: 'Downtime', sub: '20:00 – 07:00'}, {label: 'App Limits'}, {id: 'content', label: 'Content &amp; Privacy Restrictions', sub: c.content ? 'On' : 'Off'}], {back: 'Settings'}),
         target: 'content', action: c => { c.content = true; }, say: 'Next, stop surprise purchases and adult content. <strong>Tap Content &amp; Privacy Restrictions.</strong>'},
        {screen: c => list(p, 'Content &amp; Privacy', [{label: 'Content &amp; Privacy Restrictions', toggle: true}, {id: 'purchases', label: 'App Store Purchases', value: c.noBuy ? 'Don\'t Allow' : 'Allow'}, {label: 'Web Content', value: 'Limit Adult Websites'}], {back: 'Screen Time'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Adult websites are now limited. <strong>Tap App Store Purchases</strong> to stop in-app spending.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Your grandson Leo is getting his first Android phone. Google\'s free <strong>Family Link</strong> app sets healthy limits from <strong>your</strong> phone. <strong>Open Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="recent" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Tap Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Controls'}, {id: 'screen-time', label: 'Screen time', sub: c.downtime ? 'Bedtime 20:00 – 07:00' : 'No limits'}, {id: 'content', label: 'Content restrictions', sub: c.noBuy ? 'Purchases need your approval' : 'Google Play: allow all'}, {label: 'Location', sub: 'On'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Tap Screen time</strong> to set a bedtime, 8pm to 7am, when the phone locks (calls still work).'},
        {screen: c => list(p, 'Leo', [{caption: 'Controls'}, {label: 'Screen time', sub: 'Bedtime 20:00 – 07:00'}, {id: 'content', label: 'Content restrictions', sub: c.noBuy ? 'Purchases need your approval' : 'Google Play: allow all'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Next, stop surprise spending. <strong>Tap Content restrictions</strong> so purchases need your approval.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Screen Time' : 'Leo', [{label: p === 'ios' ? 'Downtime' : 'Screen time', sub: '20:00 – 07:00'}, {label: 'Purchases', sub: p === 'ios' ? 'Don\'t Allow' : 'Need your approval'}]),
         question: {q: 'What matters most, alongside the settings?', options: [
            {t: 'Talking with them: they can always tell you if something online upsets them', ok: true, why: 'Yes. No setting catches everything. Being someone they can talk to matters most.'},
            {t: 'The settings do everything', why: 'They help a lot, but nothing catches everything. Make sure they know they can always talk to you.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Screen Time' : 'Leo', [{label: 'Downtime', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Well done!</strong> Leo has a bedtime and can\'t spend money without asking. ' + (p === 'ios' ? 'Set a Screen Time passcode so only you can change these.' : 'Family Link lets you change these from your own phone any time.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'File Explorer', mac: 'Finder', linux: 'Files'},
        settings: {windows: 'Settings', mac: 'System Settings', linux: 'System Settings'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Software Manager'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Start', mac: 'Apps', linux: 'Menu'},
        editor: {windows: 'Notepad', mac: 'TextEdit', linux: 'Text Editor'},
    };
    const CMD = os => os === 'mac' ? 'cmd' : 'ctrl';
    const CMDL = os => os === 'mac' ? '⌘ Cmd' : 'Ctrl';
    const keyBtn = (id, label) => `<button type="button" class="kbd-btn" data-tap="${id}">${label.split(' + ').map(k => `<kbd>${k}</kbd>`).join(' + ')}</button>`;

    const PCI = {
        files: '<svg viewBox="0 0 24 24"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#fff"/></svg>',
        browser: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2" fill="none"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" stroke="#fff" stroke-width="1.6" fill="none"/></svg>',
        store: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z" fill="#fff"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="#fff" stroke-width="2" fill="none"/></svg>',
        settings: ICON.settings,
        mail: ICON.mail,
        text: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#64748b" stroke-width="1.6"/></svg>',
        writer: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#2563eb" stroke-width="1.6"/></svg>',
        update: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" fill="#fff"/></svg>',
        trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14l-1.2 13H6.2zM9 4h6v3H9z" fill="#fff"/></svg>',
        apps: '<svg viewBox="0 0 24 24">' + [5, 12, 19].map(y => [5, 12, 19].map(x => `<rect x="${x - 2.5}" y="${y - 2.5}" width="5" height="5" rx="1.5" fill="#fff"/>`).join('')).join('') + '</svg>',
        chrome: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff"/><circle cx="12" cy="12" r="4" fill="#2563eb"/></svg>',
        shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" fill="#fff"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke="#16a34a" stroke-width="2" fill="none"/></svg>',
        terminal: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#fff"/><path d="m7 9 3 3-3 3M12 15h5" stroke="#111" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
        fw: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><path d="M3 10h18M3 15h18M9 5v5M15 10v5M9 15v4" stroke="#dc2626" stroke-width="1.5"/></svg>',
    };
    const PCCOL = {
        files: {windows: '#f59e0b', mac: '#3b82f6', linux: '#16a34a'}, browser: {windows: '#0e7490', mac: '#2563eb', linux: '#ea580c'},
        store: {windows: '#2563eb', mac: '#0ea5e9', linux: '#16a34a'}, settings: {windows: '#475569', mac: '#6b7280', linux: '#475569'},
        mail: {windows: '#2563eb', mac: '#3b82f6', linux: '#2563eb'}, text: {windows: '#64748b', mac: '#64748b', linux: '#64748b'},
        writer: {windows: '#2563eb', mac: '#2563eb', linux: '#2563eb'}, update: {windows: '#16a34a', mac: '#16a34a', linux: '#d97706'},
        trash: {mac: '#9ca3af'}, apps: {mac: '#6366f1'}, chrome: {windows: '#16a34a', mac: '#16a34a', linux: '#16a34a'}, shield: {windows: '#2563eb', mac: '#2563eb', linux: '#2563eb'},
        fw: {linux: '#475569', windows: '#475569', mac: '#475569'}, terminal: {linux: '#111827', windows: '#111827', mac: '#111827'},
    };
    const pcIcon = (os, kind) => `<span class="pc-ic" style="background:${(PCCOL[kind] || {})[os] || '#64748b'}">${PCI[kind]}</span>`;
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Mail', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Update Manager', terminal: 'Terminal', trash: 'Bin', apps: 'Apps', chrome: 'Chrome', shield: 'Windows Security', fw: 'Firewall'}[kind]);

    const WALL = {windows: 'linear-gradient(135deg,#1e3a8a,#3b82f6 60%,#93c5fd)', win10: 'linear-gradient(135deg,#0c4a6e,#0369a1)',
                  mac: 'linear-gradient(160deg,#7c3aed,#ec4899 55%,#f59e0b)', linux: 'linear-gradient(160deg,#14532d,#15803d 55%,#86efac)'};

    // ======================================================================================
    // Practice computer: window animations, like the real systems do them.
    //   Windows 11 and Linux Mint: the window shrinks into its taskbar/panel icon and fades.
    //   Mac: the "Genie" effect pours the window into the Dock (hold Shift for slow motion, like a real Mac).
    // ======================================================================================
    const calm = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Where a window should fly to: its app's icon on the taskbar, Dock or panel.
    function pcIconFor(screen, win) {
        const kind = win.dataset.app;
        return (kind && screen.querySelector(`[data-tap="app-${kind}"]`)) || screen.querySelector('.pc-pin.run') || screen.querySelector('.tb, .dock, .lp');
    }
    function pcAim(screen, win) {
        const icon = pcIconFor(screen, win);
        if (!icon) return;
        const w = win.getBoundingClientRect(), r = icon.getBoundingClientRect();
        win.style.setProperty('--dx', `${Math.round(r.left + r.width / 2 - (w.left + w.width / 2))}px`);
        win.style.setProperty('--dy', `${Math.round(r.top + r.height / 2 - (w.top + w.height / 2))}px`);
    }

    // Before the next screen: animate the window out. Returns how long to wait (ms).
    function pcAnimOut(screen, os, id, slow) {
        if (calm() || !['win-min', 'win-close'].includes(id)) return 0;
        const btn = screen.querySelector(`[data-tap="${id}"]`);
        const win = btn && btn.closest('.pcw');
        if (!win) return 0;
        win.classList.remove('fx-open', 'fx-max', 'fx-restore', 'fx-ungenie');
        if (id === 'win-close') { win.classList.add('fx-close'); return 160; }
        pcAim(screen, win);
        const ms = os === 'mac' ? (slow ? 4000 : 520) : 260;
        win.style.setProperty('--ms', ms + 'ms');
        win.classList.add(os === 'mac' ? 'fx-genie' : 'fx-min');
        return ms;
    }

    // After the new screen is drawn: animate a window in (opened, restored from the taskbar, or maximised).
    function pcAnimIn(screen, os, lastId, prevTitle, wasMinimised) {
        if (calm()) return;
        const win = screen.querySelector('.pcw:not(.egg)');
        if (!win) return;
        const title = (win.querySelector('.pcw-title') || {}).textContent;
        if (lastId === 'win-max') { win.classList.add('fx-max'); return; }
        if (title === prevTitle) return;
        if (wasMinimised && lastId && lastId.startsWith('app-')) {
            pcAim(screen, win);
            win.classList.add(os === 'mac' ? 'fx-ungenie' : 'fx-restore');
        } else {
            win.classList.add('fx-open');
        }
        // The Mac Dock bounces an app's icon when it opens.
        if (os === 'mac' && lastId && lastId.startsWith('app-') && !wasMinimised) {
            const icon = screen.querySelector(`.dock [data-tap="${lastId}"]`);
            if (icon) icon.classList.add('fx-bounce');
        }
    }

    // ======================================================================================
    // Easter egg: the Recycle Bin (Windows), Bin (Mac) or Trash (Linux Mint) opens, and it's full of
    // things people will remember. Not part of any lesson: it never counts as a wrong tap.
    // ======================================================================================
    const EGG = {
        windows: {title: 'Recycle Bin', empty: 'Empty Recycle Bin', confirm: n => `Are you sure you want to permanently delete these ${n} items?`, items: [
            ['📎', 'Office Assistant (paperclip).exe', 'Offered to help with every letter you ever started writing. Retired in 2007.', ''],
            ['💣', 'Minesweeper high scores.txt', 'Beginner: 999 seconds. We don\'t talk about it.', ''],
            ['🃏', 'Solitaire winning cards.gif', 'Win a game, and the cards came bouncing down the screen. Double-click me!', 'cards'],
            ['📞', 'Dial-up modem.wav', 'Screeech… bong… kssshhh. And nobody could use the phone while you were online.', ''],
            ['🏞️', 'Green hill wallpaper.jpg', 'That rolling green hill and blue sky, on millions of screens from 2001.', ''],
            ['💾', 'Floppy disk (A:)', '1.44 MB. The Save button still looks like one.', ''],
            ['🎱', 'Space Cadet Pinball.exe', '3D Pinball, free with Windows until Vista took it away.', ''],
            ['🔔', 'MSN Messenger nudge', 'Someone sent you a nudge and your whole screen shook. Double-click me!', 'shake'],
            ['📄', 'Letter to council FINAL (2) (final).doc', 'We\'ve all got one.', ''],
        ]},
        mac: {title: 'Bin', empty: 'Empty Bin', confirm: () => 'Are you sure you want to permanently erase the items in the Bin? You can\'t undo this action.', items: [
            ['🌈', 'Spinning beach ball', 'The rainbow wheel that meant "please wait"… and wait. Double-click me!', 'ball'],
            ['🖥️', 'iMac G3, Bondi Blue (1998)', 'See-through, egg-shaped and blue. Every school had one.', ''],
            ['🎵', 'iPod with click wheel', '1,000 songs in your pocket. Round and round with your thumb.', ''],
            ['🙂', 'Happy Mac', 'The little smiling computer that greeted you at every start-up.', ''],
            ['🔔', 'Start-up chime', 'That big chord when you switched on. Many still miss it.', ''],
            ['💧', 'Aqua buttons', 'So shiny and blue they looked good enough to lick.', ''],
            ['🗓️', 'Dashboard widgets', 'A calculator, the weather and a sticky note on their own layer. Gone since 2019.', ''],
            ['💿', 'iTunes (2001–2019)', 'Where we all burned our CDs and synced our iPods.', ''],
        ]},
        linux: {title: 'Trash', empty: 'Empty Trash', confirm: () => 'Empty all items from Trash? All items in the Trash will be permanently deleted.', items: [
            ['🐧', 'Tux the penguin (plush)', 'The Linux mascot since 1996. Very huggable.', ''],
            ['👀', 'xeyes', 'A pair of eyes that follow your mouse pointer. Double-click me!', 'eyes'],
            ['🍮', 'Wobbly windows', 'Old desktop effects made windows wobble like jelly when you dragged them. Double-click me!', 'wobble'],
            ['💾', 'Install floppies 1–50', 'Early Linux could take a whole box of floppy disks to install.', ''],
            ['📀', 'Free Ubuntu CD in the post', 'You could order a Linux CD for free and it came in the post.', ''],
            ['📅', 'year-of-the-linux-desktop.txt', 'Predicted every year since about 1999. Maybe this is the one?', ''],
            ['🌿', 'Mint names.txt', 'Every Linux Mint release has a woman\'s name, like Zena, Xia and Vanessa.', ''],
            ['🥪', 'sudo make me a sandwich', 'An old joke: say "sudo" and the computer does as it\'s told.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="egg-grid">${left.map(([ic, name], n) => `<button type="button" class="egg-item${state.sel === name ? ' sel' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="egg-empty">${os === 'windows' ? 'This folder is empty.' : 'The ' + egg.title + ' is empty.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="egg-info"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="egg-info">${left.length ? 'Double-click something to have a look.' : ''}</p>`;
        const dlg = state.ask ? `<div class="pc-dialog"><p><strong>${egg.empty}</strong></p><p class="ph-small">${egg.confirm(left.length)}</p>
            <div class="pc-dbtns"><button type="button" data-egg-act="no">${os === 'windows' ? 'No' : 'Cancel'}</button><button type="button" class="pri" data-egg-act="yes">${os === 'windows' ? 'Yes' : 'Empty'}</button></div></div>` : '';
        const ctrls = os === 'mac'
            ? '<span class="tl"><button type="button" class="tl-r" data-egg-act="close" aria-label="Close window"></button><button type="button" class="tl-y" data-egg-act="close" aria-label="Minimise"></button><button type="button" class="tl-g" data-egg-act="max" aria-label="Full screen"></button></span>'
            : '<span class="wc"><button type="button" data-egg-act="close" aria-label="Minimise">—</button><button type="button" data-egg-act="max" aria-label="Maximise">▢</button><button type="button" class="wc-x" data-egg-act="close" aria-label="Close">✕</button></span>';
        return `<div class="pcw-bar">${os === 'mac' ? ctrls : ''}<span class="pcw-title">${egg.title}</span>${os === 'mac' ? '' : ctrls}</div>
            <div class="pcw-body"><div class="egg-tools"><button type="button" data-egg-act="empty" ${left.length ? '' : 'disabled'}>🗑 ${egg.empty}</button></div>${list}${info}${state.fx || ''}</div>${dlg}`;
    }

    // Clicks on the bin icon and inside the bin window. kind: 'open', 'select', or an action from data-egg-act.
    function pcEgg(screen, os, el, how) {
        const area = screen.querySelector('.pc-area');
        if (!area) return;
        let win = area.querySelector('.pcw.bin-win');
        const state = (win && win._egg) || {items: EGG[os].items, gone: [], sel: null, ask: false, fx: ''};
        const draw = () => { win.innerHTML = pcEggWin(os, state); win._egg = state; };
        if (el.dataset.egg) {
            if (how === 'select') { screen.querySelectorAll('.pc-dicon.sel').forEach(d => d.classList.remove('sel')); el.classList.add('sel'); return; }
            if (win) return;
            win = document.createElement('div');
            win.className = `pcw ${os} egg bin-win` + (calm() ? '' : ' fx-open');
            area.appendChild(win);
            draw();
            return;
        }
        const act = el.dataset.eggAct;
        if (act === 'close') {
            if (calm()) { win.remove(); return; }
            win.classList.remove('fx-open'); win.classList.add('fx-close');
            setTimeout(() => win.remove(), 160);
            return;
        }
        if (act === 'max') { win.classList.toggle('max'); return; }
        if (act === 'empty') { state.ask = true; draw(); return; }
        if (act === 'no') { state.ask = false; draw(); return; }
        if (act === 'yes') {
            state.ask = false; draw();
            const items = [...win.querySelectorAll('.egg-item')];
            items.forEach((b, n) => { b.style.animationDelay = (n * 60) + 'ms'; b.classList.add('fx-gone'); });
            setTimeout(() => { state.gone = state.items.map(it => it[1]); state.sel = null; draw(); }, calm() ? 0 : 300 + items.length * 60);
            return;
        }
        if (act === 'item') {
            const it = state.items[+el.dataset.n];
            state.sel = it[1];
            if (how === 'select') {
                win.querySelectorAll('.egg-item.sel').forEach(b => b.classList.remove('sel'));
                el.classList.add('sel');
                win.querySelector('.egg-info').innerHTML = `<strong>${esc(it[1])}</strong><br>${esc(it[2])}`;
                return;
            }
            state.fx = '';
            if (how === 'open' && it[3]) {
                const fx = it[3];
                if (fx === 'shake') { const desk = screen.querySelector('.pc-desk'); desk.classList.remove('fx-shake'); void desk.offsetWidth; desk.classList.add('fx-shake'); }
                if (fx === 'wobble') { win.classList.remove('fx-wobble'); void win.offsetWidth; win.classList.add('fx-wobble'); }
                if (fx === 'cards') state.fx = `<div class="egg-cards" aria-hidden="true">${['A♠', 'K♥', 'Q♣', 'J♦', 'A♥', 'K♠', 'Q♦', 'J♣'].map((c, n) => `<span class="${/[♥♦]/.test(c) ? 'red' : ''}" style="--n:${n}">${c}</span>`).join('')}</div>`;
                if (fx === 'ball') state.fx = '<div class="egg-ball" aria-hidden="true"></div>';
                if (fx === 'eyes') state.fx = '<div class="egg-eyes" aria-hidden="true"><span><i></i></span><span><i></i></span></div>';
            }
            draw();
            if (state.fx.includes('egg-eyes')) {
                const eyes = win.querySelectorAll('.egg-eyes span');
                const look = e => eyes.forEach(eye => {
                    const r = eye.getBoundingClientRect();
                    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
                    eye.firstChild.style.transform = `translate(${Math.cos(a) * 9}px, ${Math.sin(a) * 9}px)`;
                });
                screen.addEventListener('pointermove', look);
            }
        }
    }

    // ======================================================================================
    // Practice computer: the "fun layer". Easter eggs that work on every lesson screen and never count as
    // a wrong click. State (Wi-Fi on/off, wallpaper, Notepad text) lives on the screen element, so it
    // survives each step being redrawn.
    // ======================================================================================
    const today = () => window.__practiceDate ? new Date(window.__practiceDate) : new Date();
    const funState = screen => screen._fun || (screen._fun = {wifiOn: true, wall: -1, notepad: '', konami: [], aprilDone: false});

    const WALLS = [
        ['Rolling hill', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Pinstripes', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Night sky', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Seaside', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'The most famous Wi-Fi pun of them all.'],
        ['The LAN Before Time', 'A LAN is a "local area network". This one is very, very old.'],
        ['Abraham Linksys', 'Four score and seven megabits ago…'],
        ['Bill Wi the Science Fi', 'Science rules!'],
        ['Drop It Like It\'s Hotspot', 'Someone\'s phone hotspot, with a sense of humour.'],
        ['Silence of the LANs', 'A very, very quiet network.'],
        ['Tell My Wi-Fi Love Her', 'Aww.'],
        ['Get Off My LAN', 'A grumpy neighbour, probably.'],
        ['Bridlington Seagulls', 'They\'ve already taken your chips. Don\'t give them your password too.'],
        ['FREE WIFI (honest)', 'A network called "free Wi-Fi" that you don\'t recognise is exactly the kind not to join!'],
    ];

    const FORTUNES = ['Today is a good day to back up your photos.', 'A strong password is a happy password.', 'You will receive a phone call. It will be a scam. Hang up.',
        'Have you tried turning it off and on again?', 'The best time to update was yesterday. The second best time is now.', 'A cup of tea fixes most things. Not computers, though.',
        'Never give your password to a stranger. Or a seagull.', 'You will find the remote. It is down the side of the sofa.'];

    const funWin = (os, kind, title, inner, cls = '') => {
        const ctrls = os === 'mac'
            ? '<span class="tl"><button type="button" class="tl-r" data-fun="close" aria-label="Close window"></button><button type="button" class="tl-y" data-fun="close" aria-label="Minimise"></button><button type="button" class="tl-g" data-fun="max" aria-label="Full screen"></button></span>'
            : '<span class="wc"><button type="button" data-fun="close" aria-label="Minimise">—</button><button type="button" data-fun="max" aria-label="Maximise">▢</button><button type="button" class="wc-x" data-fun="close" aria-label="Close">✕</button></span>';
        const w = document.createElement('div');
        w.className = `pcw ${os} egg fun-${kind} ${cls}` + (calm() ? '' : ' fx-open');
        w.innerHTML = `<div class="pcw-bar">${os === 'mac' ? ctrls : ''}<span class="pcw-title">${title}</span>${os === 'mac' ? '' : ctrls}</div><div class="pcw-body">${inner}</div>`;
        return w;
    };
    const funToast = (screen, text, ms = 2600) => {
        const desk = screen.querySelector('.pc-desk');
        if (!desk) return;
        const t = document.createElement('div');
        t.className = 'pc-toast fun-toast';
        t.textContent = text;
        desk.appendChild(t);
        setTimeout(() => t.remove(), ms);
    };
    const openFunWin = (screen, w) => {
        const area = screen.querySelector('.pc-area');
        const old = area.querySelector('.' + [...w.classList].find(c => c.startsWith('fun-')));
        if (old) old.remove();
        area.appendChild(w);
        return w;
    };

    function wifiFunPanel(os, st, details) {
        const icon = st.wifiOn ? '📶' : '🚫';
        const nets = st.wifiOn ? `<p class="wf-ok">✓ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="wf-tech">IP address: 192.168.1.42<br>Router: 192.168.1.1<br>Signal: −54 dBm (very good)<br>Channel: 36 (5 GHz)<br>Speed: 866 Mbps<br>Security: WPA3 Personal</div>` : ''}
            <p class="wf-h2">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="wf-net" data-fun="hotspot" data-n="${k}">📶 ${esc(n)} <small>${k % 3 ? '🔒' : ''}</small></button>`).join('')}<p class="wf-joke"></p>`
            : '<p class="wf-off">Wi-Fi is off. Turn it on to see networks.</p>';
        return `<div class="wf ${os} fun-wifi"><div class="wf-top"><strong>${icon} Wi-Fi</strong><button type="button" class="wf-switch" data-fun="wifi-toggle" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div>${nets}</div>`;
    }

    function calendarPopup(os) {
        const d = today(), y = d.getFullYear(), m = d.getMonth();
        const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
        const cells = Array.from({length: first}, () => '<span></span>').concat(Array.from({length: days}, (_, k) => `<span class="${k + 1 === d.getDate() ? 'today' : ''}">${k + 1}</span>`));
        return `<div class="cal-pop ${os}"><strong>${d.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</strong>
            <div class="cal-grid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<b>${x}</b>`).join('')}${cells.join('')}</div></div>`;
    }

    // ---------- The dinosaur game (Chrome shows it when you're offline). Space, ↑ or a tap to jump. ----------
    function dinoGame(page) {
        page.innerHTML = `<div class="dino-wrap"><p class="dino-msg"><strong>No internet</strong><br>Try checking your Wi-Fi. Press <kbd>Space</kbd> or tap to play.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="dino-rex">🦖</span><span class="dino-score">0</span><span class="dino-over" hidden>GAME OVER · press Space to play again</span></div></div>`;
        const box = page.querySelector('.dino'), rex = box.querySelector('.dino-rex'), scoreEl = box.querySelector('.dino-score'), over = box.querySelector('.dino-over');
        let y = 0, vy = 0, cacti = [], t = 0, score = 0, playing = false, dead = false, last = 0, gap = 0;
        const jump = () => {
            if (dead) { cacti.forEach(c => c.el.remove()); cacti = []; score = 0; dead = false; over.hidden = true; }
            if (!playing) { playing = true; last = performance.now(); requestAnimationFrame(loop); }
            if (y === 0) vy = 430;
        };
        const loop = now => {
            if (!box.isConnected) { document.removeEventListener('keydown', key); return; }
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
            if (dead) { playing = false; return; }
            vy -= 1300 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = Math.max(vy, 0);
            rex.style.transform = `translateY(${-y}px) scaleX(-1)`;
            const speed = 170 + score * 0.6;
            gap -= dt;
            if (gap <= 0) {
                const el = document.createElement('span'); el.className = 'dino-cactus'; el.textContent = '🌵'; box.appendChild(el);
                cacti.push({x: box.clientWidth, el}); gap = 0.9 + Math.random() * 1.1;
            }
            cacti.forEach(c => { c.x -= speed * dt; c.el.style.transform = `translateX(${c.x}px)`; });
            cacti = cacti.filter(c => { if (c.x < -30) { c.el.remove(); return false; } return true; });
            if (cacti.some(c => c.x < 52 && c.x > 14 && y < 26)) { dead = true; over.hidden = false; }
            score += dt * 10; scoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
            requestAnimationFrame(loop);
        };
        const key = e => { if (box.isConnected && (e.key === ' ' || e.key === 'ArrowUp') && document.activeElement && (document.activeElement === box || !/input|textarea/i.test(document.activeElement.tagName))) { e.preventDefault(); jump(); } };
        document.addEventListener('keydown', key);
        box.addEventListener('pointerdown', e => { e.preventDefault(); box.focus(); jump(); });
    }

    // ---------- Linux terminal ----------
    const COW = say => {
        const line = '_'.repeat(say.length + 2), dash = '-'.repeat(say.length + 2);
        return ` ${line}\n< ${say} >\n ${dash}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
    };
    const MOO = `                 (__)\n                 (oo)\n           /------\\/\n          / |    ||\n         *  /\\---/\\\n            ~~   ~~\n..."Have you mooed today?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.term-out');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Try: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Moo!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'term-train';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.pcw-body').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(You typed "sl" instead of "ls"? Have a steam train.)');
        } else if (lc === 'neofetch') say(`   _____________     margaret@mint\n  |_            \\    -------------\n    |  | _____  |    OS: Linux Mint 22.3 (practice)\n    |  | | | |  |    Desktop: Cinnamon\n    |  | | | |  |    Shell: bash\n    |  \\_____/  |    Uptime: since breakfast\n    \\___________/    Memory: never forgets a birthday`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop  Documents  Downloads  Music  Pictures  Videos');
        else if (lc === 'sudo make me a sandwich') say('Okay. 🥪');
        else if (lc === 'make me a sandwich') say('What? Make it yourself.');
        else if (/rm\s+-rf/.test(lc)) say('Nice try! This practice terminal won\'t let you break anything.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: command not found  (try "help")`);
        out.scrollTop = out.scrollHeight;
    }
    function funTux(screen) {
        const desk = screen.querySelector('.pc-desk');
        if (!desk || desk.querySelector('.tux-walk')) return;
        const t = document.createElement('span'); t.className = 'tux-walk'; t.textContent = '🐧';
        desk.appendChild(t); setTimeout(() => t.remove(), calm() ? 1500 : 7000);
    }

    // ---------- Search boxes: Start/Apps/Menu filter, and the browser ----------
    function funSearch(screen, os, input) {
        const q = input.value.trim().toLowerCase();
        if (input.dataset.funInput === 'menu') {
            const menu = input.closest('.sm');
            menu.querySelectorAll('.sm-app').forEach(b => { b.hidden = q && !b.textContent.toLowerCase().includes(q); });
            if (/^(penguin|tux)$/.test(q)) funTux(screen);
            return;
        }
        // browser: only on Enter
        const br = input.closest('.br') || input.closest('.pcw');
        const note = br.querySelector('.br-note');
        br.classList.remove('fx-askew');
        if (q === 'do a barrel roll' || q === 'z or r twice') { br.classList.remove('fx-roll'); void br.offsetWidth; br.classList.add('fx-roll'); }
        else if (q === 'askew' || q === 'tilt') br.classList.add('fx-askew');
        else if (/^(dino|dinosaur|t-rex|trex)$/.test(q)) dinoGame(input.closest('.br-page'));
        else if (note) note.textContent = 'This practice browser doesn\'t search the real internet. Nothing you type is sent anywhere.';
    }

    // ---------- After every redraw: Wi-Fi state, the dinosaur, wallpaper, the season, inputs ----------
    function pcDecorate(screen, os) {
        const st = funState(screen);
        const desk = screen.querySelector('.pc-desk');
        if (!desk) return;
        if (st.wall >= 0) desk.style.background = WALLS[st.wall][1];
        if (!st.wifiOn) {
            screen.querySelectorAll('[data-tap="tray-wifi"]').forEach(b => { b.classList.add('off'); b.innerHTML = '<svg viewBox="0 0 16 12" class="st-wifi"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.2 6.6a6.8 6.8 0 0 1 9.6 0l-1.4 1.5a4.8 4.8 0 0 0-6.8 0zM.8 4.2a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0z" fill="currentColor" opacity=".35"/><path d="M2 1l12 10" stroke="currentColor" stroke-width="1.6"/></svg>'; });
            screen.querySelectorAll('.br-page').forEach(p => { if (!p.querySelector('.dino')) dinoGame(p); });
        }
        // The season, from the person's own date.
        const d = today(), mo = d.getMonth() + 1, day = d.getDate();
        const area = screen.querySelector('.pc-area');
        if (area && !calm() && !area.querySelector('.season')) {
            let season = '';
            if (mo === 12 || (mo === 1 && day <= 6)) season = `<div class="season snow" aria-hidden="true">${Array.from({length: 26}, (_, k) => `<i style="left:${(k * 37) % 100}%;animation-duration:${6 + (k % 5)}s;animation-delay:-${(k * 1.3) % 7}s;font-size:${8 + (k % 4) * 3}px">❄</i>`).join('')}</div>`;
            if ((mo === 12 && day === 31) || (mo === 1 && day === 1) || (mo === 11 && day === 5)) season += '<div class="season fireworks" aria-hidden="true"><i style="left:20%;top:25%"></i><i style="left:62%;top:15%;animation-delay:.7s"></i><i style="left:80%;top:40%;animation-delay:1.4s"></i></div>';
            if (mo === 10 && day >= 24) season = '<div class="season halloween" aria-hidden="true"><span class="pumpkin">🎃</span><span class="bat">🦇</span></div>';
            if (mo === 2 && day === 14) season = `<div class="season hearts" aria-hidden="true">${Array.from({length: 10}, (_, k) => `<i style="left:${k * 10 + 3}%;animation-delay:-${k * 0.9}s">💕</i>`).join('')}</div>`;
            if (season) area.insertAdjacentHTML('afterbegin', season);
        }
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('fx-april'); funToast(screen, 'April Fool! 🙃'); }
        // Search boxes.
        screen.querySelectorAll('[data-fun-input]').forEach(inp => {
            if (inp._fun) return; inp._fun = true;
            if (inp.dataset.funInput === 'menu') inp.addEventListener('input', () => funSearch(screen, os, inp));
            else inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); funSearch(screen, os, inp); } });
        });
    }

    // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
    const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    function pcKonami(screen, os, key) {
        const st = funState(screen);
        st.konami = st.konami.concat(key.toLowerCase()).slice(-10);
        if (st.konami.join() !== KONAMI.join()) return;
        st.konami = [];
        const desk = screen.querySelector('.pc-desk');
        if (!desk) return;
        const splash = document.createElement('div');
        splash.className = `k-splash ${os}`;
        splash.innerHTML = os === 'windows' ? '<div class="k-win"><span class="k-flag"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Cheat code activated! +30 lives 🎮</p>'
            : os === 'mac' ? '<div class="k-mac"><span>🙂</span><p>Welcome to Macintosh.</p></div><p>Cheat code activated! +30 lives 🎮</p>'
            : '<pre class="k-boot">[  OK  ] Started Konami Code Service.\n[  OK  ] Reached target Extra Lives.\n[  OK  ] Mounted /home/margaret/30-lives.\n[  OK  ] Started Nostalgia Daemon.</pre><p>Cheat code activated! +30 lives 🎮</p>';
        desk.appendChild(splash);
        setTimeout(() => splash.remove(), 3800);
    }

    // Shake to find the pointer (Mac), and dragging windows by the title bar (with "Aero Shake" on Windows).
    function pcAttach(screen, getOs) {
        let lastX = 0, dir = 0, flips = [], drag = null;
        screen.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            const dx = e.clientX - lastX; lastX = e.clientX;
            if (Math.abs(dx) > 8) {
                const nd = Math.sign(dx);
                if (nd !== dir) { dir = nd; flips.push(performance.now()); flips = flips.filter(t => performance.now() - t < 700); }
            }
            if (drag) {
                const x = drag.ox + e.clientX - drag.sx, y = drag.oy + e.clientY - drag.sy;
                drag.win.style.translate = `${x}px ${y}px`;
                if (flips.length >= 6 && getOs() === 'windows' && !drag.shook) {
                    drag.shook = true;
                    const others = [...screen.querySelectorAll('.pcw')].filter(w => w !== drag.win);
                    others.forEach(w => { pcAim(screen, w); w.style.setProperty('--ms', '260ms'); w.classList.add('fx-min'); });
                    funToast(screen, others.length ? 'Aero Shake! The other windows have been tucked away.' : 'Aero Shake! (There were no other windows to tuck away.)');
                }
                return;
            }
            if (flips.length >= 6 && getOs() === 'mac' && !screen.querySelector('.big-pointer')) {
                flips = [];
                const r = screen.getBoundingClientRect();
                const p = document.createElement('div'); p.className = 'big-pointer';
                p.style.left = (e.clientX - r.left) + 'px'; p.style.top = (e.clientY - r.top) + 'px';
                p.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 2v19l5-5 3 7 3-1-3-7h7z" fill="#111" stroke="#fff" stroke-width="1.5"/></svg>';
                screen.appendChild(p); setTimeout(() => p.remove(), 1400);
            }
        });
        screen.addEventListener('pointerdown', e => {
            const bar = e.target.closest('.pcw-bar');
            if (!bar || e.target.closest('button') || e.pointerType !== 'mouse') return;
            const win = bar.closest('.pcw');
            if (win.classList.contains('max')) return;
            const [ox, oy] = (win.style.translate || '0px 0px').split(' ').map(v => parseFloat(v) || 0);
            drag = {win, sx: e.clientX, sy: e.clientY, ox, oy, shook: false};
            flips = [];
        });
        window.addEventListener('pointerup', () => { drag = null; });
    }

    // Clicks on anything with data-fun (and Wi-Fi / Notepad / About This Mac when they aren't the lesson's step).
    function pcFun(screen, os, el, e) {
        const st = funState(screen);
        const what = el.dataset.fun;
        if (pcApp(screen, os, what, el)) return;
        const desk = screen.querySelector('.pc-desk');
        const area = screen.querySelector('.pc-area');
        if (what === 'close') {
            // Closing Notepad, Terminal or About redraws the lesson screen, so a menu they came from is back.
            const w = el.closest('.pcw');
            const back = /fun-(notepad|terminal|about)/.test(w.className);
            const done = () => { w.remove(); if (back && screen._redraw) screen._redraw(); };
            if (calm()) done(); else { w.classList.add('fx-close'); setTimeout(done, 160); }
            return;
        }
        if (what === 'max') { el.closest('.pcw').classList.toggle('max'); return; }
        if (what === 'wifi') {
            const old = desk.querySelector('.fun-wifi');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', wifiFunPanel(os, st, os === 'mac' && e && e.altKey));
            return;
        }
        if (what === 'wifi-toggle') {
            st.wifiOn = !st.wifiOn;
            const panel = desk.querySelector('.fun-wifi');
            panel.outerHTML = wifiFunPanel(os, st, false);
            if (st.wifiOn) {
                screen.querySelectorAll('[data-tap="tray-wifi"].off').forEach(b => { b.classList.remove('off'); b.innerHTML = '<svg viewBox="0 0 16 12" class="st-wifi"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.2 6.6a6.8 6.8 0 0 1 9.6 0l-1.4 1.5a4.8 4.8 0 0 0-6.8 0zM.8 4.2a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0z" fill="currentColor"/></svg>'; });
                screen.querySelectorAll('.dino-wrap').forEach(d => { d.closest('.br-page').innerHTML = `<div class="br-logo">${N.browser[os]}</div><input class="br-search" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="br-note"></p>`; });
                pcDecorate(screen, os);
                funToast(screen, 'Wi-Fi is on. Connected to Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi is off.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.wf-joke').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Only join networks you know.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.cal-pop');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('fx-april'); void desk.offsetWidth; desk.classList.add('fx-april'); funToast(screen, 'April Fool! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.desk-menu');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'View'], ['', 'Sort by'], ['refresh', 'Refresh'], ['', 'New'], ['wall', 'Personalise']]
                : os === 'mac' ? [['', 'New Folder'], ['', 'Get Info'], ['wall', 'Change Wallpaper…'], ['', 'Use Stacks']]
                : [['', 'Create New Folder'], ['terminal', 'Open in Terminal'], ['wall', 'Change Desktop Background']];
            const m = document.createElement('div');
            m.className = 'ctx-menu desk-menu';
            m.style.left = Math.min(e.clientX - r.left, r.width - 180) + 'px';
            m.style.top = Math.min(e.clientY - r.top, r.height - 160) + 'px';
            m.innerHTML = items.map(([id, t]) => `<button type="button" data-fun="desk-${id || 'none'}">${t}</button>`).join('');
            area.appendChild(m);
            return;
        }
        if (what.startsWith('desk-')) {
            const m = area.querySelector('.desk-menu'); if (m) m.remove();
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Wallpaper: ${WALLS[st.wall][0]}`); }
            if (what === 'desk-refresh') { area.classList.remove('fx-refresh'); void area.offsetWidth; area.classList.add('fx-refresh'); }
            if (what === 'desk-terminal') pcFun(screen, os, {dataset: {fun: 'terminal'}}, e);
            return;
        }
        if (what === 'apple-menu') {
            const old = desk.querySelector('.mb-drop');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', '<div class="mb-drop"><button type="button" data-fun="about">About This Mac</button><button type="button" data-fun="menu-close">System Settings…</button><button type="button" data-fun="menu-close">Sleep</button><button type="button" data-fun="menu-close">Restart…</button><button type="button" data-fun="menu-close">Shut Down…</button></div>');
            return;
        }
        if (what === 'menu-close') { const m = desk.querySelector('.mb-drop'); if (m) m.remove(); return; }
        if (what === 'about') {
            const m = desk.querySelector('.mb-drop'); if (m) m.remove();
            openFunWin(screen, funWin(os, 'about', '', `<div class="about-mac"><span>💻</span><strong>MacBook Practice</strong><small>macOS 27 (practice edition)</small>
                <dl><dt>Chip</dt><dd>Bridlington Silicon B1</dd><dt>Memory</dt><dd>Never forgets a birthday</dd><dt>Startup disk</dt><dd>Practice HD</dd><dt>Serial number</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'small'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.sm'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notepad' : os === 'mac' ? 'TextEdit' : 'Text Editor';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Untitled – ${name}`, `<textarea class="np-text" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="np-status">${os === 'windows' ? 'Ln 1, Col 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Plain text'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.sm'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="term-out">Welcome! This is a practice terminal. Type "help" to see what you can try.\n</pre>
                <label class="term-line"><span>margaret@mint:~$</span><input class="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal command"></label>`, 'term'));
            const inp = w.querySelector('.term-in');
            inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); terminalRun(screen, w, inp.value); inp.value = ''; } });
            w.addEventListener('click', () => inp.focus());
            inp.focus();
        }
    }

    // ======================================================================================
    // Practice computer: every app works, all the time. When something isn't the lesson's current step,
    // it opens a working practice app instead of counting as a wrong click.
    // ======================================================================================
    const FUN_FROM_TAP = {
        'start': 'start-menu', 'apple-menu': 'apple-menu', 'tray-wifi': 'wifi', 'tray-update': 'app-update',
        'open-browser': 'app-browser', 'app-browser': 'app-browser', 'app-chrome': 'app-browser',
        'open-files': 'app-files', 'app-files': 'app-files', 'open-settings': 'app-settings', 'app-settings': 'app-settings', 'menu-settings': 'app-settings',
        'open-store': 'app-store', 'app-store': 'app-store', 'open-text': 'notepad', 'app-text': 'notepad', 'app-mail': 'app-mail',
        'open-terminal': 'terminal', 'open-writer': 'app-writer', 'app-writer': 'app-writer', 'open-update': 'app-update', 'app-update': 'app-update',
        'open-firewall': 'app-settings', 'app-fw': 'app-settings', 'app-shield': 'app-settings', 'power': 'power',
    };
    const APP_KEYS = ['start-menu', 'app-browser', 'site', 'app-files', 'folder', 'file', 'app-settings', 'set-page', 'wifi-toggle-set', 'wall', 'check-updates',
        'app-store', 'store-get', 'app-mail', 'mail-open', 'mail-back', 'app-writer', 'app-update', 'power'];

    // ---------- Browser ----------
    const SITES = {
        home: os => `<div class="br-logo">${N.browser[os]}</div><input class="br-search" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="br-note"></p>
            <div class="br-tiles">${[['weather', '⛅', 'Weather'], ['news', '📰', 'News'], ['bus', '🚌', 'Bus times'], ['recipes', '🍰', 'Recipes']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⛅ Bridlington weather</h3><p class="ph-small">Practice forecast</p><div class="wx">${[['Today', '⛅', '13°'], ['Fri', '🌧️', '11°'], ['Sat', '🌬️', '10°'], ['Sun', '☀️', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Seagull activity: <strong>very high</strong>. Guard your chips.</p></div>`,
        news: () => `<div class="site"><h3>📰 Practice News</h3><ul class="news">
            <li><strong>Local man finally finds TV remote</strong> down the side of the sofa, after three weeks.</li>
            <li><strong>Seagull spotted with a 99 Flake</strong>. Owner of the ice cream "not amused".</li>
            <li><strong>Grandmother beats grandson at video calling</strong>: "I just pressed the green button."</li>
            <li><strong>Study finds</strong> 9 out of 10 computer problems fixed by turning it off and on again.</li></ul></div>`,
        bus: () => `<div class="site"><h3>🚌 Bus times</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>🍰 Victoria sponge</h3><p>Mix 200g each of butter, sugar and self-raising flour with 4 eggs. Bake in two tins at 180°C for 20–25 minutes. Fill with jam and cream.</p><p class="ph-small">Tip: set a timer on your phone, or ask it: "Set a timer for 25 minutes".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="br"><div class="br-bar"><span class="br-tab">${site === 'home' ? 'New tab' : esc(url)} </span></div>
            <div class="br-url"><button type="button" data-fun="site" data-site="home" aria-label="Home">⌂</button> ${url ? '🔒 ' + url : 'Search or type a web address'}</div>
            <div class="br-page ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'wide'));
        if (!st.wifiOn) dinoGame(w.querySelector('.br-page'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Dog on the beach.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['📄', 'Shopping list.txt'], ['📄', 'Letter to council.docx'], ['📁', 'Recipes'], ['📊', 'Christmas card list.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['🖼️', n]),
        Downloads: [['📄', 'Council tax bill.pdf'], ['📄', 'Bus timetable.pdf'], ['🧩', 'setup_free_cleaner.exe']],
        Music: [['🎵', 'Seaside brass band.mp3'], ['🎵', 'Sixties hits.mp3']],
    };
    function funFiles(screen, os, folder = 'Pictures', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="pf-item" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="pf"><div class="pf-side">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Recycle Bin' : os === 'mac' ? 'Bin' : 'Trash'}</button></div>
            <div class="pf-main">${items}${note ? `<p class="pf-note">${note}</p>` : ''}</div></div>`, 'wide'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="viewer" style="background:${PICS[name]}">${name === 'Dog on the beach.jpg' ? '<span>🐕</span>' : ''}</div>`, 'wide'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="set-row static"><span>Wi-Fi</span><button type="button" class="wf-switch" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="app-note">${st.wifiOn ? '✓ Connected to Home-WiFi-5G' : 'Wi-Fi is off.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalisation' : os === 'mac' ? 'Wallpaper' : 'Backgrounds'}</h3><div class="wall-pick">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Software Update' : 'Updates'}</h3><p class="wu-ok">✓ You're up to date</p><p class="app-note">Last checked: today, ${NOW.time()}</p><button type="button" class="ph-btn ios-blue small" data-fun="check-updates">Check for updates</button><p class="upd-note"></p>`,
            about: `<h3>About</h3><div class="w10-spec"><div><span>Device name</span><b>MARGARET-PRACTICE</b></div><div><span>System</span><b>${os === 'windows' ? 'Windows 11 (practice)' : os === 'mac' ? 'macOS 27 (practice)' : 'Linux Mint 22.3 (practice)'}</b></div>
                <div><span>Processor</span><b>Bridlington Silicon B1</b></div><div><span>Memory</span><b>Never forgets a birthday</b></div><div><span>Storage</span><b>Plenty for photos of the grandchildren</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalisation' : os === 'mac' ? 'Wallpaper' : 'Backgrounds'], ['update', 'Updates'], ['about', 'About']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="sw"><div class="sw-side">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="sw-main">${pages[page]}</div></div>`, 'wide'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '💣', 'Practice Mines', 'The classic mine-hunting game.'], ['solitaire', '🃏', 'Patience', 'Coming soon to this practice store.'], ['paint', '🎨', 'Paint', 'Coming soon to this practice store.'], ['weather', '⛅', 'Weather', 'Coming soon to this practice store.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="pc-store"><div class="st-searchbar">${ICON.search}<span>Search apps</span></div><div class="st-results">${STORE_APPS.map(([id, ic, n, d]) => `<div class="st-row"><span class="fun-app-ic">${ic}</span>
            <div class="st-info"><strong>${n}</strong><span>${d}</span></div><button type="button" class="st-get" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Open' : (os === 'mac' ? 'Get' : 'Install')}</button></div>`).join('')}</div>
            <p class="ph-small">Practice store: nothing is really downloaded.</p></div>`, 'wide'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Practice Mines', `<div class="mines"><div class="mines-top"><span class="mines-left">💣 ${M}</span><button type="button" class="mines-face" aria-label="New game">🙂</button><span class="mines-time">0</span></div>
            <div class="mines-grid" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="mc" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="ph-small">Click to dig. Right-click (or press and hold) to plant a flag.</p></div>`, 'small'));
        let mines = null, open = 0, over = false, flags = 0, t0 = 0, timer = 0;
        const cells = [...w.querySelectorAll('.mc')], face = w.querySelector('.mines-face');
        const around = k => { const x = k % W, y = Math.floor(k / W), out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx); } return out; };
        const reset = () => { mines = null; open = 0; over = false; flags = 0; clearInterval(timer); w.querySelector('.mines-time').textContent = '0'; w.querySelector('.mines-left').textContent = '💣 ' + M; face.textContent = '🙂'; cells.forEach(c => { c.className = 'mc'; c.textContent = ''; }); };
        const reveal = k => {
            const c = cells[k];
            if (c.classList.contains('open') || c.classList.contains('flag')) return;
            c.classList.add('open'); open++;
            if (mines.has(k)) { c.textContent = '💥'; over = true; face.textContent = '😵'; clearInterval(timer); mines.forEach(m => { if (m !== k) cells[m].textContent = '💣'; }); return; }
            const n = around(k).filter(a => mines.has(a)).length;
            if (n) { c.textContent = n; c.dataset.n = n; } else around(k).forEach(reveal);
            if (!over && open === W * H - M) { over = true; face.textContent = '😎'; clearInterval(timer); }
        };
        cells.forEach((c, k) => {
            c.addEventListener('click', () => {
                if (over) return;
                if (!mines) {
                    const safe = new Set([k, ...around(k)]); mines = new Set();
                    while (mines.size < M) { const r = Math.floor(Math.random() * W * H); if (!safe.has(r)) mines.add(r); }
                    t0 = Date.now(); timer = setInterval(() => { if (!w.isConnected) return clearInterval(timer); w.querySelector('.mines-time').textContent = Math.floor((Date.now() - t0) / 1000); }, 1000);
                }
                reveal(k);
            });
            c.addEventListener('contextmenu', e => {
                e.preventDefault(); e.stopPropagation();
                if (over || c.classList.contains('open')) return;
                c.classList.toggle('flag'); c.textContent = c.classList.contains('flag') ? '🚩' : '';
                flags += c.classList.contains('flag') ? 1 : -1; w.querySelector('.mines-left').textContent = '💣 ' + (M - flags);
            });
        });
        face.addEventListener('click', reset);
    }

    // ---------- Mail ----------
    const MAILS = [
        ['Mum', 'How do I turn this thing off?', 'Hello love, I\'ve written this email but I can\'t find the off button. Is it the round one? Love Mum xx\n\nP.S. I\'ve pressed it. Nothing happened. Is that right?'],
        ['Bridlington Walkers', 'Saturday\'s walk', 'Meet at the harbour at 10am. Bring a flask and a waterproof. Last week\'s seagull incident will not be discussed.'],
        ['Prince Abu (Very Rich)', 'URGENT: you have won £4,000,000!!!', 'Dear Beloved Friend, I am a prince and I need your bank details to send you four million pounds. Please also send £50 for the stamp.\n\n— This is a scam! Real people don\'t give away millions by email. Delete it, or forward it to report@phishing.gov.uk.'],
        ['Sarah', 'Photos from Sunday 🌻', 'Here are the photos from the garden. The dog has eaten another sunflower.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="wm-list">${MAILS.map(([from, subj], k) => `<button type="button" class="wm-row${k === 2 ? ' unread' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="wm-mail"><button type="button" class="w10-back" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Mail', `<div class="wm">${inner}</div>`, 'wide'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.pc-desk');
        if (what === 'power') { funToast(screen, 'This is a practice computer, so it can\'t be switched off 😉'); return true; }
        const drop = desk.querySelector('.sm, .mb-drop'); if (drop && what !== 'start-menu') drop.remove();
        if (what === 'start-menu') {
            const old = desk.querySelector('.sm');
            if (old) { old.remove(); return true; }
            desk.insertAdjacentHTML('beforeend', startMenu(os, os === 'linux' ? [['writer', 'open-writer'], ['update', 'open-update']] : []));
            pcDecorate(screen, os);
            return true;
        }
        if (what === 'app-browser') { funBrowser(screen, os); return true; }
        if (what === 'site') { funBrowser(screen, os, el.dataset.site); return true; }
        if (what === 'app-files') { funFiles(screen, os); return true; }
        if (what === 'folder') { funFiles(screen, os, el.dataset.folder); return true; }
        if (what === 'file') {
            const n = el.dataset.name;
            if (PICS[n]) funViewer(screen, os, n);
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Downloads', '⚠️ "Free cleaner" programs are often junk or worse. Best to delete it, not open it!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `"${n}" would open here on a real computer.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi is on.' : 'Wi-Fi is off.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.sw-main').querySelector('.upd-note');
            note.textContent = 'Checking for updates…';
            setTimeout(() => { if (note.isConnected) note.textContent = '✓ No new updates. You\'re all set!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'This one is just for show in the practice store.'); return true; }
            el.textContent = 'Installing…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Open'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Untitled 1 – LibreOffice Writer', '<div class="lw"><div class="lw-tools">File  Edit  View  Insert  Format  <b>B</b> <i>I</i> <u>U</u></div><textarea class="lw-page lw-edit" aria-label="Document">Dear Sir or Madam,\n\n</textarea></div>', 'wide'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Update Manager', '<div class="um"><p class="wu-ok">✓ Your system is up to date</p><p class="app-note">Linux Mint checks for updates by itself and shows a dot on the shield when there are some.</p></div>', 'small'));
            return true;
        }
        return false;
    }

    // The desktop. opts: pinned (kinds), running (kinds), windows (html), overlay (html), appName (Mac menu bar), win10, badge (Linux updates)
    function desk(os, opts = {}) {
        const pinned = opts.pinned || ['files', 'browser', 'store', 'settings'];
        const run = opts.running || [];
        const pin = kind => `<button type="button" class="pc-pin${run.includes(kind) ? ' run' : ''}" data-tap="app-${kind}" ${kind === 'browser' && os === 'mac' ? 'data-rclick="rc-dock-browser"' : ''} aria-label="${appLabel(os, kind)}">${pcIcon(os, kind)}<span class="pc-tip">${appLabel(os, kind)}</span></button>`;
        const clock = os === 'mac' ? NOW.mac() : `${NOW.time()}<span class="tb-date"><br>${NOW.date()}</span>`;
        const wifi = `<button type="button" class="pc-tray" data-tap="tray-wifi" data-fun="wifi" aria-label="Wi-Fi">${opts.noWifi ? '🌐' : '<svg viewBox="0 0 16 12" class="st-wifi"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.2 6.6a6.8 6.8 0 0 1 9.6 0l-1.4 1.5a4.8 4.8 0 0 0-6.8 0zM.8 4.2a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0z" fill="currentColor"/></svg>'}</button>`;
        let bars;
        if (os === 'mac') {
            bars = `<div class="mb"><button type="button" class="mb-apple" data-tap="apple-menu" data-fun="apple-menu" aria-label="Apple menu"></button><strong>${opts.appName || 'Finder'}</strong>
                <span class="mb-menus">File Edit View Window Help</span><span class="mb-right">${wifi}<button type="button" class="mb-clock" data-fun="clock">${clock}</button></span></div>`
                + `<div class="dock">${['files', 'apps', ...pinned.filter(k => k !== 'files')].map(k => k === 'apps' ? `<button type="button" class="pc-pin" data-tap="start" aria-label="Apps">${pcIcon(os, 'apps')}<span class="pc-tip">Apps</span></button>` : pin(k)).join('')}<span class="dock-sep"></span><button type="button" class="pc-pin" data-egg="bin" aria-label="Bin">${pcIcon(os, 'trash')}<span class="pc-tip">Bin</span></button></div>`;
        } else if (os === 'windows') {
            const startIcon = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2" fill="#475569"/><rect x="13" y="4" width="7" height="7" rx="2" fill="#475569"/><rect x="4" y="13" width="7" height="7" rx="2" fill="#475569"/><rect x="13" y="13" width="7" height="7" rx="2" fill="#475569"/></svg>';
            bars = `<div class="tb${opts.win10 ? ' w10' : ''}"><div class="tb-mid"><button type="button" class="pc-pin start" data-tap="start" aria-label="Start">${startIcon}</button>
                ${opts.win10 ? '<span class="tb-search">🔍 Type here to search</span>' : ''}${pinned.map(pin).join('')}</div>
                <div class="tb-right">${wifi}<span>🔊</span><button type="button" class="tb-clock" data-fun="clock">${clock}</button></div></div>`;
        } else {
            bars = `<div class="lp"><button type="button" class="lp-menu" data-tap="start" aria-label="Menu"><span class="mint-logo">m</span></button>${pinned.map(pin).join('')}
                <span class="lp-right"><button type="button" class="pc-tray" data-tap="tray-update" aria-label="Update Manager">${PCI.shield}${opts.badge ? '<em></em>' : ''}</button>${wifi}<button type="button" class="tb-clock" data-fun="clock">${clock}</button></span></div>`;
        }
        return `<div class="pc-desk ${os}" style="background:${opts.win10 ? WALL.win10 : WALL[os]}">${os === 'mac' ? bars : ''}
            <div class="pc-area">${desktopIcons(os)}${opts.windows || ''}</div>${os === 'mac' ? '' : bars}${opts.overlay || ''}</div>`;
    }

    // Icons on the desktop itself. Only the bin does anything (it's an easter egg); the rest are there to look right.
    function desktopIcons(os) {
        const icon = (label, glyph, egg) => `<button type="button" class="pc-dicon"${egg ? ' data-egg="bin"' : ' tabindex="-1"'}><span>${glyph}</span>${label}</button>`;
        if (os === 'windows') return `<div class="pc-dicons">${icon('Recycle Bin', '🗑️', true)}</div>`;
        if (os === 'linux') return `<div class="pc-dicons">${icon('Computer', '🖥️')}${icon('Home', '🏠')}${icon('Trash', '🗑️', true)}</div>`;
        return '';
    }

    // A window. opts: max, wide, style
    function pcWin(os, title, inner, opts = {}) {
        const ctrls = os === 'mac'
            ? '<span class="tl"><button type="button" class="tl-r" data-tap="win-close" aria-label="Close window"></button><button type="button" class="tl-y" data-tap="win-min" aria-label="Minimise window"></button><button type="button" class="tl-g" data-tap="win-max" aria-label="Full screen"></button></span>'
            : '<span class="wc"><button type="button" data-tap="win-min" aria-label="Minimise">—</button><button type="button" data-tap="win-max" aria-label="Maximise">▢</button><button type="button" class="wc-x" data-tap="win-close" aria-label="Close">✕</button></span>';
        return `<div class="pcw ${os}${opts.max ? ' max' : ''}${opts.cls ? ' ' + opts.cls : ''}" style="${opts.style || ''}">
            <div class="pcw-bar">${os === 'mac' ? ctrls : ''}<span class="pcw-title">${title}</span>${os === 'mac' ? '' : ctrls}</div>
            <div class="pcw-body">${inner}</div></div>`;
    }

    function startMenu(os, extra = []) {
        const items = [['browser', 'open-browser'], ['files', 'open-files'], ['settings', 'open-settings'], ['store', 'open-store'], ['text', 'open-text'], ...extra, ...(os === 'linux' ? [['terminal', 'open-terminal']] : [])];
        const funOf = {'open-text': 'notepad', 'open-terminal': 'terminal'};
        const btn = ([kind, id]) => `<button type="button" class="sm-app" data-tap="${id}"${funOf[id] ? ` data-fun="${funOf[id]}"` : ''}>${pcIcon(os, kind)}<span>${appLabel(os, kind)}</span></button>`;
        const search = ph => `<input class="sm-search" data-fun-input="menu" placeholder="${ph}" aria-label="Search">`;
        if (os === 'windows') {
            return `<div class="sm win">${search('🔍 Search for apps, settings and documents')}<p class="sm-h">Pinned</p>
                <div class="sm-grid">${items.map(btn).join('')}</div><div class="sm-foot"><span>👤 Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="sm mac">${search('🔍 Search')}<div class="sm-grid">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="sm lin">${search('🔍 Type to search…')}<div class="sm-list">${items.map(btn).join('')}</div>
            <div class="sm-foot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="br"><div class="br-bar"><span class="br-tab">New tab <button type="button" data-tap="tab-close" aria-label="Close tab">✕</button></span></div>
        <div class="br-url">🔍 Search or type a web address</div><div class="br-page"><div class="br-logo">${N.browser[os]}</div><input class="br-search" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="br-note"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'This is the <strong>desktop</strong>. The bar along the bottom is the <strong>taskbar</strong>. Open the web browser from the Start menu: <strong>click Start</strong>, the four squares.'
            : os === 'mac' ? 'This is the <strong>desktop</strong>. The row of apps at the bottom is the <strong>Dock</strong>, and the bar along the top is the <strong>menu bar</strong>. <strong>Click Apps</strong> (the grid of squares) to see all your apps.'
            : 'This is the <strong>desktop</strong> in Linux Mint. The bar along the bottom is the <strong>panel</strong>. Your apps are in the Menu: <strong>click Menu</strong>, bottom left.',
         hint: os === 'mac' ? 'Apps is in the Dock at the bottom, next to the Finder.' : (os === 'windows' ? 'Start is the four blue squares on the taskbar.' : 'The Menu button is at the far left of the bottom panel.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Click ${N.browser[os]}</strong>, the web browser.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Every window has three coloured buttons at the <strong>top left</strong>. The yellow one tucks the window away. <strong>Click the yellow button.</strong>'
            : 'Every window has three buttons at the <strong>top right</strong>. The line <strong>—</strong> tucks the window away (minimise). <strong>Click —</strong>.',
         hints: {'win-close': 'That closes it. First, tuck it away with the ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'That makes it fill the screen. First, tuck it away.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `It's hidden, not closed. The ${os === 'mac' ? 'dot under its icon in the Dock' : 'line under its icon'} shows it's still open. <strong>Click the ${N.browser[os]} icon</strong> to bring it back.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Now make it fill the screen: <strong>click the ${os === 'mac' ? 'green' : '▢'} button</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '✕'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'On a Mac, the red button closes the window. But the app can keep running. How do you quit it completely?', options: [
                {t: 'Press ⌘ Cmd + Q, or choose Quit from the app\'s menu at the top', ok: true, why: 'Yes. A dot under an app in the Dock means it\'s still running. ⌘ Cmd + Q quits it.'},
                {t: 'Click the red button twice', why: 'The red button only closes windows. ⌘ Cmd + Q (or the app menu > Quit) quits the app.'}]}
            : {q: 'Where is the close button on a window?', options: [
                {t: 'Top right: the ✕', ok: true, why: 'Yes. On Windows and Linux Mint the three buttons are at the top right. (On a Mac they\'re top left, in red, yellow and green.)'},
                {t: 'Bottom left', why: 'It\'s at the top right of every window: the ✕.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Well done!</strong> You can open, hide, bring back, enlarge and close windows. That\'s most of using a computer.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Home' : 'Home'], ['desktop', 'Desktop'], ['documents', 'Documents'], ['downloads', 'Downloads'], ['pictures', 'Pictures']]
            .concat(ctx.usb ? [['usb', '💾 USB stick']] : []);
        const contents = {
            home: [['documents', '📁', 'Documents'], ['pictures', '📁', 'Pictures'], ['downloads', '📁', 'Downloads']],
            downloads: [['photo', '🖼️', 'Holiday photo.jpg'], ['bill', '📄', 'Council tax bill.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '🖼️', 'Holiday photo.jpg']] : []), ...(ctx.folderMade ? [['newf', '📁', esc(ctx.folderName || 'Holidays')]] : [])],
            documents: [['letter', '📄', 'Letter to council.docx'], ['recipes', '📁', 'Recipes']],
            usb: ctx.copied ? [['documents2', '📁', 'Documents']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="ctx-menu" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="pf-name">📁 ${field('foldername', 'New folder', ctx)}<button type="button" class="ph-btn ios-blue small" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Home' : 'Home', downloads: 'Downloads', pictures: 'Pictures', documents: 'Documents', usb: 'USB stick', desktop: 'Desktop'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="pf">
            <div class="pf-side">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="pf-main" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="pf-item${ctx.sel === id ? ' sel' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="pf-empty">This folder is empty</p>'}</div>${menu}</div>${ctx.progress ? `<div class="pf-progress">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Copy' : 'Copy';
    const pasteLabel = os => os === 'mac' ? 'Paste Item' : 'Paste';
    const newFolderLabel = os => os === 'mac' ? 'New Folder' : os === 'windows' ? 'New > Folder' : 'Create New Folder';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Your photos and letters are kept in <strong>folders</strong>. <strong>Click ${N.files[os]}</strong> to look at them.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'at the left of the Dock' : 'on the ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Down the side are your main folders. Things you download from emails and websites go in <strong>Downloads</strong>. <strong>Click Downloads.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Open'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Rename'], ['menu-delete', os === 'mac' ? 'Move to Bin' : 'Delete']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Let\'s copy the holiday photo into Pictures, where it belongs. <strong>Right-click</strong> on <strong>Holiday photo.jpg</strong>: press the <strong>right-hand</strong> mouse button. <em>' + (os === 'mac' ? 'On a trackpad, click with two fingers.' : 'On a touchscreen, press and hold.') + '</em>',
         hint: 'Use the right-hand mouse button on the photo.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `A menu appears. <strong>Click ${copyLabel(os)}.</strong> <em>(The shortcut is ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Not that one! Click Copy.', 'menu-open': 'That opens the photo. Click Copy.', 'menu-rename': 'Click Copy.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Click Pictures</strong> on the left.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Pictures is empty. <strong>Right-click on the empty white space.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Click ${pasteLabel(os)}.</strong> <em>(Or ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'We\'ll make a folder next. First, click ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'The photo is now in Pictures too. Now make a folder to keep holiday photos together. <strong>Right-click on the empty space again.</strong>', hints: {'rc-photo2': 'Right-click on the empty space, not the photo.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Click ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Type a name for the folder first, like Holidays.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Type a name</strong>, like <strong>Holidays</strong>, then <strong>click OK</strong> (or press Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Where do files from emails and websites usually end up?', options: [
            {t: 'In the Downloads folder', ok: true, why: 'Yes. If you can\'t find something you downloaded, look in Downloads first.'},
            {t: 'On the desktop', why: 'Usually in Downloads. Look there first if you can\'t find something.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Well done!</strong> Right-click is the secret to most things: copy, paste, rename and new folder are all in that menu.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '🔒'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '🔒']];
        const pass = ctx.picked ? `<div class="wf-pass"><p>Enter the network password</p>${field('wifipass', 'Password', ctx)}<button type="button" class="ph-btn ios-blue" data-tap="connect">Connect</button></div>` : '';
        return `<div class="wf ${os}"><p class="wf-h">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi networks'}</p>${ctx.connected ? '<p class="wf-ok">✓ Connected to Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="wf-net${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">📶 ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `To connect to Wi-Fi, <strong>click the Wi-Fi symbol</strong> ${os === 'mac' ? 'at the top right of the screen' : 'at the bottom right, near the clock'}.`, hint: os === 'mac' ? 'It\'s in the menu bar at the top right.' : 'It\'s near the clock at the bottom right.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Your network\'s name is on the sticker on your router. This practice one is <strong>Home-WiFi-5G</strong>. <strong>Click it.</strong>', hints: {'net-neighbour': 'That\'s your neighbour\'s! Choose Home-WiFi-5G.', 'net-cafe': 'That\'s not your home one. Choose Home-WiFi-5G.', 'tray-wifi': 'The list of Wi-Fi networks is already open. Click Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Type the password exactly: Green-Apple-42 (capital G and A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Type the password from the sticker <strong>exactly</strong>: <strong>Green-Apple-42</strong>. Then <strong>click Connect</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'The Wi-Fi panel is already open. Type the password in the box, then click Connect.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'You\'re in a café with free Wi-Fi. Is it OK for online banking?', options: [
            {t: 'Better to wait until home, or use your phone\'s mobile data', ok: true, why: 'Yes. Free Wi-Fi is fine for browsing, but for banking use your home Wi-Fi or mobile data.'},
            {t: 'Yes, any Wi-Fi is fine', why: 'Free public Wi-Fi is fine for browsing, but save banking for home or mobile data.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Well done!</strong> Your computer will remember the password and connect by itself next time.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="key-strip">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Shopping list: milk, bread, eggs, teabags, birthday card for Jean';
        const note = pcWin(os, `Shopping list – ${N.editor[os]}`, `<div class="ed-text${ctx.selected ? ' sel' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'New email to Sarah', `<div class="em-field">To: Sarah</div><button type="button" class="em-body${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="caret"></span>' : 'Click here to write…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Mail' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Keyboard shortcuts save lots of clicking. <strong>${CMDL(os)}</strong> is the key ${os === 'mac' ? 'either side of the space bar, marked ⌘' : 'at the bottom left of the keyboard'}. To select all the writing, hold <strong>${CMDL(os)}</strong> and press <strong>A</strong>. <em>Use your real keyboard, or the buttons on screen.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `It's highlighted. Now copy it: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Copied! <strong>Click inside the email</strong> to Sarah, where it says "Click here to write".'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Now paste: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Oops, you've deleted something by mistake. Which shortcut undoes it?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Yes. ${CMDL(os)} + Z undoes the last thing you did, in almost every app. Press it again to undo more.`},
            {t: 'Escape', why: `Escape closes menus. ${CMDL(os)} + Z is undo.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'How do you take a screenshot (a picture of the screen)?', options: [
            {t: os === 'windows' ? 'Windows key + Shift + S, then drag over what you want' : os === 'mac' ? 'Shift + ⌘ Cmd + 4, then drag over what you want' : 'Press the Print Screen key (PrtSc)', ok: true,
             why: os === 'windows' ? 'Yes. It\'s copied, and a notification lets you save it. The Print Screen key also works.' : os === 'mac' ? 'Yes. The picture is saved on your desktop. Shift + ⌘ Cmd + 3 takes the whole screen.' : 'Yes. Linux Mint saves it in your Pictures folder. Shift + Print Screen lets you choose an area.'},
            {t: 'Take a photo of the screen with your phone', why: 'That works, but a screenshot is much clearer. ' + (os === 'windows' ? 'Windows key + Shift + S.' : os === 'mac' ? 'Shift + ⌘ Cmd + 4.' : 'Press Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Well done!</strong> The big four: <strong>${CMDL(os)} + C</strong> copy, <strong>V</strong> paste, <strong>Z</strong> undo, <strong>A</strong> select all. They work in nearly every app.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Free', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Free · In-app purchases', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="st-searchbar" data-tap="search">${ICON.search}<span>Search apps</span></button><div class="st-card"><span>FEATURED</span><strong>Apps for your new computer</strong></div>`
            : `<div class="st-searchbar">${ICON.search}<span>office</span></div><div class="st-results">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="st-row">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="st-info"><strong>${n}</strong><span>${dev}${ad ? ' <em class="st-ad">Ad</em>' : ''}</span><span class="st-meta">${rate} ★ · ${price}</span></div>
                <button type="button" class="st-get" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Open' : (os === 'mac' ? 'Get' : 'Install')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="app-note">Installing LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="pc-store">${inner}<p class="ph-small">Practice store: names and prices are examples.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `The safest place to get apps is the built-in store: <strong>${N.store[os]}</strong>. <strong>Click it.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'You want something to write letters with, like Word. <strong>Click the search box.</strong> We\'ll search for "office".'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> is a free alternative to Microsoft Office, made by <strong>The Document Foundation</strong>. Check who made it, then <strong>click ' + (os === 'mac' ? 'Get' : 'Install') + ' next to LibreOffice</strong>.',
         hints: {'get-fake1': 'That one\'s an advert, and charges £29.99 a year. LibreOffice is free.', 'get-fake2': 'That\'s by AppMakers and has in-app purchases. Choose LibreOffice, by The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'A website pop-up says "Your PC is slow! Download Speed Booster now". What do you do?', options: [
            {t: 'Close it. Only install apps from the store or the maker\'s own website', ok: true, why: 'Exactly. Pop-ups offering "boosters" or "cleaners" are often junk or worse.'},
            {t: 'Download it, it might help', why: 'These are often junk or harmful. Only install from the store or the maker\'s own website.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Well done!</strong> LibreOffice is installed. Check the maker, ignore ads, and be wary of "free" apps that ask for money later.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Home'], ['system', 'System'], ['bluetooth', 'Bluetooth & devices'], ['network', 'Network & internet'], ['accounts', 'Accounts'], ['privacy', 'Privacy & security'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Home</h3><p class="app-note">Recommended settings and your account.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="wu-ok">✓ You\'re up to date</p>' : ctx.ready ? `<p class="app-note">Restart required to finish installing updates.</p><button type="button" class="ph-btn ios-blue small" data-tap="restart">Restart now</button>`
                    : `<p class="app-note"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Downloading… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ph-btn ios-blue small" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="recent" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Settings', `<div class="sw"><div class="sw-side">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="sw-main">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'General'], ['privacy', 'Privacy & Security'], ['users', 'Users & Groups']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="recent" data-tap="software-update"><strong>Software Update</strong></button><div class="recent"><strong>About</strong></div><div class="recent"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="wu-ok">✓ Your Mac is up to date</p>' : `<p class="app-note"><strong>macOS update available</strong><br>${ctx.busy ? 'Downloading… about 10 minutes remaining' : 'Security and bug fixes'}</p>${ctx.busy ? '' : '<button type="button" class="ph-btn ios-blue small" data-tap="update-now">Update Now</button>'}`}
                    <div class="set-row static"><span>Automatic updates</span><span class="set-val">On</span></div>`,
                privacy: `<h3>Privacy &amp; Security</h3><p class="app-note"><strong>Security</strong><br>Allow applications from:</p>
                    <button type="button" class="recent" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="recent" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store &amp; Known Developers</button>`,
            };
            return pcWin(os, 'System Settings', `<div class="sw"><div class="sw-side">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="sw-main">${pages[page] || '<h3>System Settings</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Update Manager', `<div class="um">${ctx.updated ? '<p class="wu-ok">✓ Your system is up to date</p>' : `<div class="um-list">${['Firefox web browser', 'Linux kernel (security)', 'LibreOffice', 'System libraries'].map(t => `<div>☑ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="app-note">Installing updates…</p>' : '<button type="button" class="ph-btn and-green small" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="pc-dialog"><p><strong>Authentication required</strong></p><p class="ph-small">Enter your password to install updates. (Practice: entered for you.)</p><div class="pc-pw">••••••••</div>
                <div class="pc-dbtns"><button type="button" data-tap="auth-cancel">Cancel</button><button type="button" class="pri" data-tap="auth-ok">Authenticate</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Updates fix security holes that scammers use. Let\'s check for them. <strong>Click Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Click Settings</strong> (the cog).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Click Windows Update</strong>, at the bottom of the list on the left.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Updates are waiting. <strong>Click Download &amp; install all.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Save anything you\'re working on first, then <strong>click Restart now</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Updates fix security holes that scammers use. <strong>Click the Apple menu</strong> (the logo) at the top left.'},
        {screen: () => desk(os, {overlay: '<div class="mb-drop"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Click System Settings…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'You\'re in General. <strong>Click Software Update.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'An update is ready. Plug in your charger, then <strong>click Update Now</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Your Mac downloads it, then restarts to install it.',
         question: {q: 'Automatic updates are on. Do you still need to do anything?', options: [
            {t: 'Just restart when it asks, and leave it plugged in overnight now and then', ok: true, why: 'Yes. Updates often install overnight. Restarting when asked finishes them.'},
            {t: 'Turn automatic updates off', why: 'Keep them on: they keep you safe. Just restart when your Mac asks.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Updates fix security holes. In Linux Mint, the <strong>shield</strong> near the clock shows a dot when updates are waiting. <strong>Click the shield.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Update Manager lists them all. <strong>Click Install Updates.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux asks for <strong>your password</strong> before changing anything important. That\'s a good thing. <strong>Click Authenticate.</strong>', hints: {'auth-cancel': 'That cancels the updates. Click Authenticate.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'How often should you install updates?', options: [
            {t: 'Whenever the shield shows a dot: it only takes a minute', ok: true, why: 'Yes. Linux Mint rarely needs a restart, except for some security updates.'},
            {t: 'Once a year', why: 'Install them whenever the shield shows a dot. It only takes a minute.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Well done!</strong> Your computer is up to date. Keeping it updated is the single best thing you can do to stay safe.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '💻', 'System', 'Display, sound, about'], ['tile-devices', '🖨️', 'Devices', 'Bluetooth, printers'], ['tile-network', '🌐', 'Network & Internet', 'Wi-Fi'],
                       ['tile-accounts', '👤', 'Accounts', 'Your accounts'], ['tile-update', '🔄', 'Update & Security', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="w10-tiles">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="w10-back" data-tap="back">← Home</button><h3>About</h3><div class="w10-spec"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="w10-back" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="wu-ok">✓ Your PC is enrolled in Extended Security Updates</p><p class="app-note">Security updates until 12 October 2027.</p>' : `<div class="w10-esu"><strong>Windows 10 support has ended</strong><p>Your PC doesn't meet the requirements to run Windows 11. Enroll in Extended Security Updates to keep getting security updates.</p>
            <button type="button" class="ph-btn ios-blue small" data-tap="enroll">Enroll now</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="app-note">Choose how to enroll:</p>
            <button type="button" class="recent" data-tap="esu-backup"><strong>Back up your PC settings</strong><small>Free, with a Microsoft account</small></button>
            <button type="button" class="recent" data-tap="esu-points"><strong>Use 1,000 Microsoft Rewards points</strong></button>
            <button type="button" class="recent" data-tap="esu-buy"><strong>One-time purchase</strong><small>Paid</small></button>${ctx.busy ? '<p class="app-note">Enrolling…</p>' : ''}`;
        return pcWin('windows', 'Settings', `<div class="w10-set">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'If your computer looks like this, with Start at the far left, it may be <strong>Windows 10</strong>. Let\'s check. <strong>Click Start.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Click Settings</strong> (the cog).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Click System.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'It says Windows 10 Home. What does that mean in 2026?', options: [
            {t: 'Microsoft stopped normal support in October 2025. It still works, but needs Extended Security Updates to stay safe', ok: true,
             why: 'Yes. The free Extended Security Updates programme for home users now runs until 12 October 2027. After that, Windows 10 gets no more security fixes.'},
            {t: 'Nothing, Windows 10 will be updated for ever', why: 'Normal support ended in October 2025. Extended Security Updates now run until 12 October 2027, then stop.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Click ← Home</strong> to go back.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Click Update &amp; Security.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'This laptop is too old for Windows 11, so Windows offers <strong>Extended Security Updates</strong>. <strong>Click Enroll now.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'The free way is to back up your settings to a Microsoft account. <strong>Click Back up your PC settings.</strong>', hints: {'esu-buy': 'You don\'t need to pay. Choose the free backup option.', 'esu-points': 'That works if you have the points, but the backup option is free for everyone.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'What are your options before October 2027?', options: [
            {t: 'Upgrade to Windows 11 if it can, buy a new computer, or switch an older one to Linux Mint (free)', ok: true, why: 'Yes. Linux Mint is free and runs well on older laptops. The next lessons show where things are on a Mac and in Linux Mint.'},
            {t: 'Keep using Windows 10 after 2027 for banking', why: 'After October 2027 it gets no security fixes, so it isn\'t safe for banking. Upgrade, replace or switch to Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Well done!</strong> You know which Windows you have and how to keep it safe until October 2027. Watch out for calls or pop-ups offering to "upgrade" you for a fee: they\'re scams.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Moving from Windows? On a Mac, apps live in the <strong>Dock</strong> at the bottom, and each app\'s menus are in the <strong>menu bar</strong> at the top. <strong>Click Safari</strong>, the web browser, in the Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'The window buttons are at the <strong>top left</strong> on a Mac. <strong>Click the red one</strong> to close the window.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'The window has gone, but see the <strong>dot under Safari</strong> in the Dock? It\'s still running. To quit it, <strong>right-click Safari in the Dock</strong> (two fingers on a trackpad).', hint: 'Right-click (or two-finger click) on the Safari icon in the Dock.',
         hints: {'app-browser': 'A normal click opens it again. Right-click it instead.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="ctx-menu dockmenu"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Click Quit.</strong> <em>(The shortcut is ⌘ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Settings live under the <strong>Apple menu</strong> (the logo) at the top left. <strong>Click it.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="mb-drop"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Shut Down and Restart are here too. <strong>Click System Settings…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'System Settings', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'On Windows you copy with Ctrl + C. What\'s it on a Mac?', options: [
            {t: '⌘ Cmd + C', ok: true, why: 'Yes. Most Windows shortcuts use ⌘ Cmd on a Mac instead of Ctrl: ⌘ C, ⌘ V, ⌘ Z, ⌘ A.'},
            {t: 'Ctrl + C, the same', why: 'On a Mac it\'s ⌘ Cmd + C. Most Ctrl shortcuts become ⌘ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'System Settings', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Well done!</strong> Dock at the bottom, menus at the top, window buttons top left, ⌘ Cmd instead of Ctrl, and the Apple menu for settings and shutting down.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> is a free system that works a lot like Windows, and runs well on older computers. Your apps are in the <strong>Menu</strong>, bottom left, like the Start button. <strong>Click Menu.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint comes with free apps already installed. For letters, use <strong>LibreOffice Writer</strong>, which works like Microsoft Word. <strong>Click it.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="lw"><div class="lw-tools">File  Edit  View  Insert  Format  <b>B</b> <i>I</i> <u>U</u></div><div class="lw-page">Dear Sir or Madam,<span class="caret"></span></div></div>', {max: true})}),
         question: {q: 'Can you open Word documents that people email you?', options: [
            {t: 'Yes. LibreOffice opens and saves Word (.docx) files', ok: true, why: 'Yes. When saving something to send to a Word user, choose the Word format (.docx) in Save As.'},
            {t: 'No, you need Windows for that', why: 'LibreOffice opens and saves Word (.docx) files, so you can swap documents with Word users.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="lw"><div class="lw-page">Dear Sir or Madam,</div></div>', {max: true})}),
         target: 'win-close', say: 'The window buttons are at the top right, just like Windows. <strong>Click ✕</strong> to close Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Now let\'s find where to get more apps. <strong>Click Menu</strong> again.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Software Manager</strong> is Linux Mint\'s free app store. <strong>Click it.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Software Manager', `<div class="pc-store"><div class="st-searchbar">${ICON.search}<span>Search</span></div>
            <div class="sm-cats">${['Internet', 'Office', 'Graphics', 'Sound & video', 'Games', 'Accessibility'].map(t => `<span>${t}</span>`).join('')}</div><p class="app-note">Thousands of free apps, checked by Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Do you need to buy antivirus for Linux Mint?', options: [
            {t: 'No. Keep it updated, get apps from Software Manager, and you\'re well protected', ok: true, why: 'Yes. Linux has few viruses. Updates and the built-in firewall do the job. Scams in emails and websites still apply, so stay alert.'},
            {t: 'Yes, the most expensive one', why: 'No. Keep it updated and get apps from Software Manager. Watch out for email and website scams as usual.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Well done!</strong> Menu bottom left, close top right, LibreOffice for documents, Firefox for the web, Software Manager for apps, and the shield for updates.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="pc-toast">💾 USB stick connected</div>` : '<button type="button" class="usb-plug" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Before you swap computers, copy your files to a <strong>USB stick</strong>. Push it into a USB slot on the side of the computer. Here, <strong>click Plug in USB stick</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="pc-toast">💾 USB stick connected</div>'}), target: 'app-files', say: `<strong>Open ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Open'], ['menu-copy', 'Copy'], ['menu-rename', 'Rename']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Your letters are in <strong>Documents</strong>. <strong>Right-click the Documents folder.</strong> <em>(Do the same for Pictures afterwards.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Click Copy.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Your USB stick is on the left. <strong>Click USB stick.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'It\'s empty. <strong>Right-click on the empty space.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Click ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Copying 214 items… 1 minute left' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Eject']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Done! Before you pull the stick out, <strong>eject</strong> it so nothing gets damaged. <strong>Right-click USB stick</strong> on the left.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Click Eject.</strong> Then it\'s safe to take it out.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Another way to move files to a new computer?', options: [
            {t: 'Online storage: OneDrive, iCloud or Google Drive', ok: true, why: 'Yes. Upload from the old computer, sign in on the new one, and they\'re there. A USB stick is a good extra copy too.'},
            {t: 'Email every file to yourself one by one', why: 'That would take ages! Use a USB stick or online storage like OneDrive, iCloud or Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Well done!</strong> On the new computer, plug the stick in, open it, and copy the folders into your Documents and Pictures.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="br-bookmarks">★ BBC Weather  ★ NHS App  ★ Bridlington bus times  ★ Recipes</div>' : '';
        const profile = `<button type="button" class="br-profile" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '👤'}</button>`;
        const menu = ctx.menu ? '<div class="ctx-menu" style="right:8px;top:62px"><span class="cm-h">Not signed in</span><button type="button" data-tap="sync">Turn on sync…</button><button type="button" data-tap="guest">Open guest profile</button></div>' : '';
        const signin = ctx.signin ? `<div class="pc-dialog wide"><p><strong>Sign in with Google</strong></p><p class="ph-small">margaret.smith@example.com</p><div class="pc-pw">••••••••</div><p class="ph-small">(Practice: entered for you.)</p>
            <div class="pc-dbtns"><button type="button" class="pri" data-tap="next">Next</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="pc-dialog wide"><p><strong>Turn on sync?</strong></p><p class="ph-small">Your bookmarks, passwords and history will be saved to your Google Account and appear on all your devices.</p><div class="pc-dbtns"><button type="button" data-tap="cancel">Cancel</button><button type="button" class="pri" data-tap="yes-in">Yes, I\'m in</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="br"><div class="br-bar"><span class="br-tab">New tab</span>${profile}</div><div class="br-url">🔍 Search Google or type a URL</div>${bar}
            <div class="br-page"><div class="br-logo">Chrome</div><input class="br-search" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="br-note"></p>${ctx.busy ? '<p class="app-note">Syncing your bookmarks…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'If you used <strong>Chrome</strong> on your old computer, signing in brings your bookmarks and saved passwords to the new one. (Firefox and Edge work the same way.) <strong>Click Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Click the person icon</strong> at the top right.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Click Turn on sync…</strong>', hints: {guest: 'A guest profile doesn\'t save anything. Click Turn on sync.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Sign in with the <strong>same Google account</strong> you used on the old computer. <strong>Click Next.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Click Yes, I\'m in.</strong>', hints: {cancel: 'That stops sync. Click Yes, I\'m in.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Your bookmarks are back. Is saving passwords in your browser safe?', options: [
            {t: 'Yes, if your Google account has a strong password and 2-step verification', ok: true, why: 'Yes. It\'s much safer than reusing one password everywhere. Protect the account itself with 2-step verification.'},
            {t: 'No, write them on a sticky note on the screen instead', why: 'A browser password manager is far safer than a note on the screen, as long as your account has 2-step verification.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Well done!</strong> Your bookmarks and passwords have followed you. On a public or shared computer, don\'t turn on sync.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="scare"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'System'} Security Alert ⚠️</strong>
            <p>Your computer is INFECTED with 5 viruses! Your bank details and photos are at risk.</p><p>Do not turn off your computer. Call support now:</p><b>0808 157 0123</b>
            <div class="scare-btns"><button type="button" data-tap="call-btn">Call now</button><button type="button" data-tap="fake-close">Close</button></div>
            <small>(Practice scam page. The number is not real.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="pc-dialog"><p><strong>Leave site?</strong></p><p class="ph-small">Changes you made may not be saved.</p><div class="pc-dbtns"><button type="button" data-tap="stay">Stay</button><button type="button" class="pri" data-tap="leave">Leave</button></div></div>' : '';
        if (!ctx.exited) return `<div class="pc-full">${page}<div class="key-strip">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="br"><div class="br-bar"><span class="br-tab">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">✕</button></span></div><div class="br-url">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'This has suddenly filled your screen while browsing. Is it real?', options: [
            {t: 'No. It\'s a fake website trying to scare you into calling scammers', ok: true, why: 'Exactly. Real warnings never show a phone number to ring. Don\'t call it and don\'t click anything on the page.'},
            {t: 'Yes, call the number quickly', why: 'Never call. It\'s a fake page. The "support" people will try to take control of your computer and your money.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'It\'s filled the whole screen so you can\'t see how to close it. Press the <strong>Esc</strong> key (top left of the keyboard) to leave full screen.',
         hints: {'call-btn': 'Never! Press the Esc key.', 'fake-close': 'Buttons on the page may be traps. Press the Esc key on your keyboard instead.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Now you can see the browser. <strong>Close the tab</strong> with its ✕.',
         hints: {'call-btn': 'Don\'t click anything on the page. Close the tab with its ✕.', 'fake-close': 'That\'s part of the scam page. Use the ✕ on the tab itself.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'It tries to keep you there. <strong>Click Leave.</strong>', hints: {stay: 'Click Leave.'}},
        {screen: c => scareware(os, c), question: {q: 'What if it won\'t close at all?', options: [
            {t: os === 'windows' ? 'Press Ctrl + Shift + Esc to open Task Manager, choose the browser and click End task' : os === 'mac' ? 'Press ⌘ Cmd + Option + Esc and Force Quit the browser' : 'Right-click the browser on the panel and choose Close, or restart the computer',
             ok: true, why: 'Yes. When you open the browser again, don\'t let it restore the old pages. Restarting the computer also works.'},
            {t: 'Ring the number to get help closing it', why: 'Never ring it. ' + (os === 'windows' ? 'Use Ctrl + Shift + Esc (Task Manager) to close the browser.' : os === 'mac' ? 'Use ⌘ Cmd + Option + Esc to Force Quit.' : 'Close the browser from the panel, or restart.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Well done!</strong> Your computer was never infected: it was just a web page. If you did ring a number like this, contact your bank and change your passwords from another device.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows Security', `<div class="sec"><h3>Virus &amp; threat protection</h3><p class="wu-ok">✓ No current threats</p>
                <p class="app-note">Last scan: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="app-note">Quick scan running… 12,840 files scanned</p>' : (ctx.scanned ? '' : '<button type="button" class="ph-btn ios-blue small" data-tap="quick-scan">Quick scan</button>')}
                <div class="sec-tiles"><span>✓ Virus protection</span><span>✓ Firewall</span><span>✓ App &amp; browser control</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Firewall Configuration', `<div class="sec"><div class="set-row static"><span>Status</span><button type="button" class="fw-toggle" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="app-note">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="wu-ok">✓ Firewall is on</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows has free antivirus built in, called <strong>Windows Security</strong>. Let\'s check it\'s working. <strong>Click Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Click Settings.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Click Privacy &amp; security</strong> on the left.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Click Windows Security.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Green ticks mean you\'re protected. For peace of mind, <strong>click Quick scan</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Do you need to pay for another antivirus as well?', options: [
            {t: 'No. Windows Security is enough for most people, and two can slow the computer down', ok: true, why: 'Yes. Keep Windows updated and Windows Security on. Paid ones often just add pop-ups and subscriptions.'},
            {t: 'Yes, the more the better', why: 'Two antivirus programs can clash and slow things down. Windows Security is enough for most people.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Macs have free protection built in that checks apps and files in the background. Let\'s check one setting. <strong>Click the Apple menu</strong> (the logo).'},
        {screen: () => desk(os, {overlay: '<div class="mb-drop"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Click System Settings…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Click Privacy &amp; Security</strong> on the left.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, c, 'privacy')}),
         question: {q: '"Allow applications from App Store & Known Developers" is chosen. Should you change it?', options: [
            {t: 'No, leave it. It blocks apps from unknown makers', ok: true, why: 'Yes. If a website tells you to change this to install something, that\'s a big warning sign.'},
            {t: 'Yes, allow apps from anywhere', why: 'Leave it as it is. It stops apps from unknown makers. A website telling you to change it is a warning sign.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'System Settings', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Do you need to buy antivirus for a Mac?', options: [
            {t: 'Most people don\'t. Keep it updated and only install apps from trusted places', ok: true, why: 'Yes. Updates and the built-in protection do the job. Pop-ups saying your Mac is infected are scams.'},
            {t: 'Yes, whichever pop-up offers it', why: 'Pop-ups offering Mac antivirus are usually scams. Keep your Mac updated instead.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint has a built-in <strong>firewall</strong>, which blocks unwanted connections. It\'s off until you turn it on. <strong>Click Menu.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Click Firewall.</strong> <em>(Search the Menu for "firewall" if you can\'t see it.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Click the Status switch</strong> to turn the firewall on.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'What else keeps Linux Mint safe?', options: [
            {t: 'Installing updates when the shield shows a dot, and getting apps from Software Manager', ok: true, why: 'Yes. And the usual rules: be careful with email links and pop-ups.'},
            {t: 'Nothing else is needed', why: 'Keep installing updates and get apps from Software Manager. Email and website scams still apply.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Well done!</strong> Your computer\'s built-in protection is on. Updates, care with links, and only installing from trusted places do the rest.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="wm-list"><button type="button" class="wm-row unread" data-tap="open-scam"><strong>Parcel Delivery</strong><span>We missed you: rearrange delivery today</span></button>
            <div class="wm-row"><strong>Sarah</strong><span>Photos from Sunday</span></div><div class="wm-row"><strong>Bridlington Walkers</strong><span>Saturday's walk</span></div></div>`;
        const mail = `<div class="wm-mail"><p><strong>Parcel Delivery</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>We tried to deliver your parcel today but nobody was home. A fee of £1.45 is needed to rearrange delivery.</p>
            <a class="wm-link" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Rearrange delivery</a>
            ${ctx.hovered ? '<p class="wm-status">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="wm-actions"><button type="button" data-tap="report">⚠️ Report phishing</button><button type="button" data-tap="reply">Reply</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Mail', `<div class="wm">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="wu-ok">✓ Reported and moved to Junk</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Here\'s your email, in the browser. <strong>Open the Parcel Delivery email.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'On a computer you can check where a link really goes <strong>without clicking it</strong>. <strong>Move the mouse over "Rearrange delivery"</strong> and keep it still. <em>(On a touchscreen, press and hold it.)</em>',
         hints: {'click-link': 'Don\'t click it! Just rest the mouse pointer over it.'}, hint: 'Rest the mouse pointer over the blue link, without clicking.'},
        {screen: c => webmail(os, c), question: {q: 'The real address appears at the bottom: parcel-redelivery.example.top. Is it safe?', options: [
            {t: 'No. It\'s not a real delivery company\'s website, and they want a fee', ok: true, why: 'Yes. Couriers don\'t charge small fees by email or text. The real address gives it away.'},
            {t: 'Yes, it says "parcel" in it', why: 'Anyone can put "parcel" in a web address. It isn\'t a real courier, and the fee is the scam.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Click Report phishing.</strong> You can also forward scam emails to report@phishing.gov.uk.', hints: {reply: 'Never reply to scammers. Click Report phishing.', 'click-link': 'Don\'t click the link! Report it instead.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Well done!</strong> Hover before you click: if the address doesn\'t match the company, don\'t click.'},
    ], {}));

    // ======================================================================================
    // Practice phone: every app works, all the time, with easter eggs. Anything that isn't the lesson's
    // current step opens a working practice app on top ("Back to the lesson" puts the step back).
    // ======================================================================================
    const PH_FROM_TAP = {phone: 'ph-phone', messages: 'ph-messages', camera: 'ph-camera', photos: 'ph-photos', mail: 'ph-mail', clock: 'ph-clock',
        weather: 'ph-weather', maps: 'ph-maps', settings: 'ph-settings', store: 'ph-store'};
    const phState = screen => screen._pfun || (screen._pfun = {wall: -1, airplane: false, wifi: true, bt: true, dark: false, torch: false, bright: 100,
        dnd: false, text: 0, build: 0, taps: [], photos: [], sms: [], snakeBest: 0, installed: []});
    const PH_WALLS = ['linear-gradient(160deg,#f97316,#db2777 55%,#7c3aed)', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'radial-gradient(1.5px 1.5px at 20% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 70% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 45% 15%, #fff 50%, transparent 51%), linear-gradient(#0b1026, #312e81)',
        'linear-gradient(160deg,#16a34a,#065f46)', '#111'];

    const phToast = (screen, text, ms = 2600) => {
        const t = document.createElement('div');
        t.className = 'ph-toast'; t.textContent = text;
        screen.appendChild(t); setTimeout(() => t.remove(), ms);
    };

    // A full-screen practice app on top of whatever the lesson is showing.
    function phOpen(screen, p, title, inner, opts = {}) {
        const st = phState(screen);
        screen.querySelectorAll('.phf').forEach(x => x.remove());
        const f = document.createElement('div');
        f.className = `phf ph-${p}${st.dark ? ' dark' : ''}${opts.cls ? ' ' + opts.cls : ''}` + (calm() ? '' : ' fx-phopen');
        f.style.setProperty('--ts', 1 + st.text * 0.12);
        f.innerHTML = `${statusBar(p)}${title !== null ? `<div class="phf-head"><button type="button" data-fun="ph-close" aria-label="Back">${p === 'ios' ? '‹' : '←'}</button><strong>${title}</strong>${opts.right || ''}</div>` : ''}
            <div class="phf-body">${inner}</div><button type="button" class="ph-homebar-btn phf-home" data-fun="ph-close" aria-label="Home"></button>`;
        screen.appendChild(f);
        phDecorate(screen, p);
        return f;
    }

    // ---------- Phone (dialer) with secret codes ----------
    const DIAL_EGGS = {
        '*#06#': 'IMEI: 35 209900 176148 1 (practice number). This is the real code to find your phone\'s IMEI.',
        '999': 'This is a practice phone, so it can\'t ring 999. In a real emergency, ring 999 or 112.',
        '112': 'This is a practice phone, so it can\'t ring 112. 112 works just like 999 in the UK and across Europe.',
        '159': '159 connects you safely to your own bank. Use it if a call about your money worries you.',
        '7726': '7726 is where you forward scam texts. It spells "SPAM" on old phone keypads!',
        '123': 'speaking-clock',
        '1471': 'Telephone number 07700 900842 called today at 11:20. (Practice. 1471 tells you who last rang your landline.)',
        '01189998819991197253': 'That\'s the emergency number from The IT Crowd. Have you tried turning it off and on again?',
        '101': '101 is the police number for things that aren\'t emergencies.',
        '111': '111 is NHS help when it\'s urgent but not an emergency.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Phone', `<div class="phd"><div class="phd-num">${esc(typed) || '<span class="phd-ph">Enter a number</span>'}</div>
            <div class="phd-pad">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="phd-row"><span></span><button type="button" class="phd-call" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="phd-del" data-fun="ph-del" aria-label="Delete">⌫</button></div>
            <p class="phd-msg"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.phd-msg').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mum', '#f472b6', [['them', 'I thought LOL meant "lots of love". I\'ve been putting it on everything!'], ['them', 'Is that why your auntie hasn\'t replied?'], ['them', 'Sent from my iPad']]],
        ['Unknown', '#94a3b8', [['them', 'Congratulations! You\'ve won a FREE phone. Click here to claim: prize-winner.example'], ['note', 'This is a scam. Don\'t tap the link: forward it to 7726, then delete it.']]],
        ['Sarah', '#a78bfa', [['them', 'Dad\'s learning to use emojis 😂'], ['them', 'He sent me an aubergine and said "for tea tonight?" 🍆']]],
        ['Dentist', '#38bdf8', [['them', 'Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.']]],
    ];
    const MUM_REPLIES = ['Who is this?', 'Ring me, I can\'t read texts without my glasses', 'Lovely! 👍', 'Did you get my last message? I sent it to the cat by mistake.', 'Sent from my iPad', 'OK love xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Messages', `<div class="phl">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="phl-row" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
            return;
        }
        const [name, , msgs] = SMS_THREADS[open];
        const mine = st.sms.filter(m => m.t === open);
        const bubbles = msgs.map(([who, t]) => who === 'note' ? `<p class="phm-note">${esc(t)}</p>` : `<div class="wa-bubble ${who === 'me' ? 'me sms' : 'them'}"><span>${esc(t)}</span></div>`).join('')
            + mine.map(m => `<div class="wa-bubble ${m.me ? 'me sms' : 'them'}"><span>${esc(m.text)}</span></div>`).join('');
        const f = phOpen(screen, p, name, `<div class="phm"><div class="wa-thread">${bubbles}</div>
            <div class="msg-bar"><label class="app-field"><input class="phm-in" placeholder="Text message" aria-label="Text message"></label><button type="button" class="wa-send" data-fun="ph-send" data-n="${open}" aria-label="Send">${UI.send}</button></div></div>`);
        const th = f.querySelector('.wa-thread'); th.scrollTop = th.scrollHeight;
        f.querySelector('.phm-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); f.querySelector('[data-fun="ph-send"]').click(); } });
    }

    // ---------- Camera and Photos ----------
    const PH_PICS = [['🌅', 'linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)'], ['🐶', 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)'], ['🌻', 'linear-gradient(#bae6fd 0 45%, #4ade80 45%)'],
        ['🎂', 'linear-gradient(#fce7f3, #fbcfe8)'], ['🏰', 'linear-gradient(#93c5fd 0 60%, #a3a3a3 60%)'], ['🐦🍟', 'linear-gradient(#7dd3fc 0 55%, #fde68a 55%)']];
    function phCamera(screen, p) {
        const st = phState(screen);
        phOpen(screen, p, null, `<div class="phc${st.selfie ? ' selfie' : ''}"><div class="phc-view">${st.selfie ? '<span class="phc-face">🙂</span>' : '<span class="phc-sun">☀️</span><span class="phc-sea"></span>'}<span class="phc-grid"></span></div>
            <div class="phc-modes"><span>VIDEO</span><b>PHOTO</b><span>PORTRAIT</span></div>
            <div class="phc-bar"><button type="button" class="phc-thumb" data-fun="ph-photos-open" aria-label="Photos">${st.photos.length ? (st.photos[st.photos.length - 1] ? '🙂' : '🌅') : ''}</button>
            <button type="button" class="cam-shutter" data-fun="ph-shutter" aria-label="Take photo"></button><button type="button" class="phc-flip" data-fun="ph-flip" aria-label="Flip camera">${UI.flip}</button></div></div>`, {cls: 'cam'});
    }
    function phPhotos(screen, p, view = -1) {
        const st = phState(screen);
        const all = PH_PICS.concat(st.photos.map(s => [s ? '🙂' : '🌅', s ? 'linear-gradient(#fde68a, #fca5a5)' : 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)']));
        if (view >= 0) {
            const [ic, bg] = all[view];
            phOpen(screen, p, view === 5 ? 'The seagull strikes again' : 'Photo', `<div class="php-big" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="phm-note">Caught in the act on Bridlington seafront. The chips were not recovered.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Photos', `<div class="php-grid">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Clock', `<div class="phk"><div class="phk-now"></div><div class="phk-date"></div>
            <div class="phk-sw"><span class="phk-sw-t">00:00.0</span><button type="button" data-fun="ph-sw">Start</button><button type="button" data-fun="ph-sw-reset">Reset</button></div>
            <div class="phk-zones"><div><span>London</span><b data-tz="Europe/London"></b></div><div><span>New York</span><b data-tz="America/New_York"></b></div><div><span>Sydney</span><b data-tz="Australia/Sydney"></b></div><div><span>Narnia</span><b>Always winter</b></div></div></div>`);
        const tick = () => {
            if (!f.isConnected) return;
            const d = today();
            f.querySelector('.phk-now').textContent = d.toLocaleTimeString('en-GB');
            f.querySelector('.phk-date').textContent = d.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'});
            f.querySelectorAll('[data-tz]').forEach(b => { b.textContent = d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: b.dataset.tz}); });
            if (f._sw && f._sw.run) { const ms = Date.now() - f._sw.t0 + f._sw.acc; f.querySelector('.phk-sw-t').textContent = `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${Math.floor(ms / 100) % 10}`; }
            requestAnimationFrame(tick);
        };
        f._sw = {run: false, t0: 0, acc: 0};
        tick();
    }
    function phWeather(screen, p) {
        const d = today(), winter = d.getMonth() === 11 || d.getMonth() < 2;
        phOpen(screen, p, 'Weather', `<div class="phw${winter ? ' winter' : ''}"><p class="phw-place">Bridlington</p><button type="button" class="phw-big" data-fun="ph-sun" aria-label="Today's weather">${winter ? '❄️' : '⛅'}</button>
            <p class="phw-temp">${winter ? '4°' : '13°'}</p><p>${winter ? 'Cold, with snow flurries' : 'Sunny spells, breezy'}</p>
            <div class="wx">${[['Fri', '🌧️', '11°'], ['Sat', '🌬️', '10°'], ['Sun', '☀️', '14°'], ['Mon', '⛅', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="phm-note">Seagull warning: <strong>high</strong>. Guard your chips.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Through the wardrobe, then keep walking past the lamp post.', home: 'There\'s no place like home. 🏠', 'the moon': '238,855 miles. Traffic is light.',
        chips: 'Nearest chippy: anywhere on Bridlington seafront. 🍟', 'north pole': 'Santa\'s workshop. Closed until December. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Lovely spot!',
        'flamborough': 'Flamborough Head: lighthouse, cliffs and puffins. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="maps-app phmap"><div class="mp-map"><span class="mp-me"></span>${note ? '<span class="mp-pin"></span>' : ''}</div>
            <div class="mp-top"><label class="mp-search">${ICON.search}<input class="phmap-in" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="mp-card"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.phmap-in');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": this practice map only knows a few places. Try Bridlington, Flamborough or Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="phs-row"><span>${label}</span><button type="button" class="wf-switch" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Settings', `<div class="phs">
            <div class="phs-group">${row('airplane', p === 'ios' ? 'Airplane Mode' : 'Airplane mode', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="phs-group">${row('dark', 'Dark mode', st.dark)}${row('dnd', 'Do Not Disturb', st.dnd)}
                <div class="phs-row"><span>Text size</span><span class="phs-size"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="big" aria-label="Bigger">A</button></span></div></div>
            <div class="phs-group"><button type="button" class="phs-row" data-fun="ph-wall"><span>Wallpaper</span><span class="set-chev">›</span></button>
                <button type="button" class="phs-row" data-fun="ph-about"><span>${p === 'ios' ? 'About' : 'About phone'}</span><span class="set-chev">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'About' : 'About phone', `<div class="phs"><div class="phs-group">
            <div class="phs-row"><span>Name</span><b>Margaret's phone</b></div>
            <div class="phs-row"><span>Model</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="phs-row" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS version' : 'Android version'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="phs-row"><span>Storage</span><b>Plenty for photos of the grandchildren</b></div>
            ${p === 'android' ? '<button type="button" class="phs-row" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="phs-row"><span>Serial number</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="phm-note phs-egg"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '🐍', 'Snake \'97', 'The classic game from old mobile phones.'], ['torch', '🔦', 'Super Bright Torch FREE', 'Contains ads · In-app purchases'], ['knit', '🧶', 'Knitting Patterns', 'Coming soon to this practice store.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="pc-store">${apps.map(([id, ic, n, d]) => `<div class="st-row"><span class="fun-app-ic">${ic}</span><div class="st-info"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="st-get" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Open' : (p === 'ios' ? 'Get' : 'Install')}</button></div>`).join('')}<p class="phm-note phst-note"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="snk"><div class="snk-top"><span>Score: <b class="snk-score">0</b></span><span>Best: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="snk-c" aria-label="Snake game"></canvas><p class="snk-msg">Tap a direction (or use the arrow keys) to start</p>
            <div class="snk-pad"><button type="button" data-dir="0,-1" aria-label="Up">▲</button><button type="button" data-dir="-1,0" aria-label="Left">◀</button><button type="button" data-dir="1,0" aria-label="Right">▶</button><button type="button" data-dir="0,1" aria-label="Down">▼</button></div></div>`, {cls: 'snakef'});
        const c = f.querySelector('canvas'), g = c.getContext('2d'), N = 12, S = 20;
        let snake, dir, food, timer = 0, score, alive = false;
        const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
        const draw = () => {
            g.fillStyle = '#9bbc0f'; g.fillRect(0, 0, 240, 240);
            g.fillStyle = '#306230'; snake.forEach(([x, y]) => g.fillRect(x * S + 1, y * S + 1, S - 2, S - 2));
            g.fillStyle = '#0f380f'; g.fillRect(food[0] * S + 5, food[1] * S + 5, S - 10, S - 10);
        };
        const reset = () => { snake = [[5, 6], [4, 6], [3, 6]]; dir = [1, 0]; score = 0; place(); draw(); };
        const step = () => {
            if (!f.isConnected) return clearInterval(timer);
            const h = [(snake[0][0] + dir[0] + N) % N, (snake[0][1] + dir[1] + N) % N];
            if (snake.some(s => s[0] === h[0] && s[1] === h[1])) {
                alive = false; clearInterval(timer); st.snakeBest = Math.max(st.snakeBest, score);
                f.querySelector('.snk-msg').textContent = `Game over! Score ${score}. Tap a direction to play again.`; return;
            }
            snake.unshift(h);
            if (h[0] === food[0] && h[1] === food[1]) { score++; f.querySelector('.snk-score').textContent = score; place(); } else snake.pop();
            draw();
        };
        const turn = d => {
            if (!alive) { reset(); alive = true; f.querySelector('.snk-msg').textContent = ''; clearInterval(timer); timer = setInterval(step, 170); }
            if (d[0] !== -dir[0] || d[1] !== -dir[1]) dir = d;
        };
        f.querySelectorAll('.snk-pad button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); turn(b.dataset.dir.split(',').map(Number)); }));
        const keys = {arrowup: [0, -1], arrowdown: [0, 1], arrowleft: [-1, 0], arrowright: [1, 0]};
        const key = e => { if (!f.isConnected) return document.removeEventListener('keydown', key); const d = keys[e.key.toLowerCase()]; if (d) { e.preventDefault(); turn(d); } };
        document.addEventListener('keydown', key);
        let sx = 0, sy = 0;
        c.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
        c.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]); });
        reset();
    }

    // ---------- Control centre / quick settings (tap the status bar) ----------
    function phControl(screen, p) {
        const st = phState(screen);
        const old = screen.querySelector('.phcc');
        if (old) { old.remove(); return; }
        const t = (k, ic, label, on) => `<button type="button" class="phcc-t${on ? ' on' : ''}" data-fun="ph-cc" data-k="${k}"><span>${ic}</span>${label}</button>`;
        screen.insertAdjacentHTML('beforeend', `<div class="phcc ph-${p}">${statusBar(p)}<div class="phcc-grid">${t('airplane', '✈️', 'Airplane', st.airplane)}${t('wifi', '📶', 'Wi-Fi', st.wifi)}${t('bt', '🔵', 'Bluetooth', st.bt)}${t('dnd', '🌙', 'Do Not Disturb', st.dnd)}${t('torch', '🔦', 'Torch', st.torch)}${t('dark', '🌓', 'Dark mode', st.dark)}</div>
            <label class="phcc-slide">☀️<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="cc-close" data-fun="ph-cc-close">${p === 'ios' ? 'Swipe up to close' : 'Close'}</button></div>`);
        screen.querySelector('[data-fun-range="bright"]').addEventListener('input', e => { st.bright = +e.target.value; phDecorate(screen, p); });
        phDecorate(screen, p);
    }

    // After every redraw: wallpaper, dimming, torch, airplane, seasons.
    function phDecorate(screen, p) {
        const st = phState(screen);
        screen.querySelectorAll('.ph-home').forEach(h => { if (st.wall >= 0) h.style.background = PH_WALLS[st.wall]; });
        screen.style.setProperty('--dim', String((100 - st.bright) / 100 * 0.7));
        screen.classList.toggle('ph-dimmed', st.bright < 100);
        screen.classList.toggle('ph-torch', !!st.torch);
        screen.querySelectorAll('.ph-status-r').forEach(r => { if (st.airplane && !r.querySelector('.st-plane')) r.insertAdjacentHTML('afterbegin', '<span class="st-plane">✈</span>'); if (!st.airplane) r.querySelectorAll('.st-plane').forEach(x => x.remove()); });
        const home = screen.querySelector('.ph-home');
        const d = today(), mo = d.getMonth() + 1, day = d.getDate();
        if (home && !calm() && !home.querySelector('.season')) {
            let season = '';
            if (mo === 12 || (mo === 1 && day <= 6)) season = `<div class="season snow" aria-hidden="true">${Array.from({length: 14}, (_, k) => `<i style="left:${(k * 37) % 100}%;animation-duration:${6 + (k % 5)}s;animation-delay:-${(k * 1.3) % 7}s;font-size:${8 + (k % 4) * 3}px">❄</i>`).join('')}</div>`;
            if (mo === 10 && day >= 24) season = '<div class="season halloween" aria-hidden="true"><span class="pumpkin">🎃</span><span class="bat">🦇</span></div>';
            if (mo === 2 && day === 14) season = `<div class="season hearts" aria-hidden="true">${Array.from({length: 8}, (_, k) => `<i style="left:${k * 12 + 3}%;animation-delay:-${k * 0.9}s">💕</i>`).join('')}</div>`;
            if (season) home.insertAdjacentHTML('afterbegin', season);
        }
    }

    // Long-press: on an app makes the icons wiggle (like a real home screen); on the wallpaper changes it.
    function phAttach(screen, getP) {
        let timer = 0;
        screen.addEventListener('pointerdown', e => {
            const home = e.target.closest('.ph-home');
            if (!home || e.target.closest('[data-hold], .phf, .phcc, .ph-pull')) return;
            const onApp = e.target.closest('.ph-app');
            timer = setTimeout(() => {
                screen._swallow = true;
                if (onApp) {
                    home.classList.add('jiggle');
                    if (!home.querySelector('.jiggle-done')) home.insertAdjacentHTML('beforeend', '<button type="button" class="jiggle-done" data-fun="ph-jiggle-done">Done</button>');
                } else {
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'New wallpaper');
                }
            }, 650);
        });
        const stop = () => clearTimeout(timer);
        screen.addEventListener('pointerup', stop);
        screen.addEventListener('pointerleave', stop);
        screen.addEventListener('pointermove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) stop(); });
    }

    // Everything the practice phone's apps do.
    function phFun(screen, p, el) {
        const st = phState(screen);
        const what = el.dataset.fun;
        const f = el.closest && el.closest('.phf');
        switch (what) {
            case 'ph-close': { const x = screen.querySelector('.phf'); if (!x) return; if (calm()) x.remove(); else { x.classList.add('fx-phclose'); setTimeout(() => x.remove(), 200); } return; }
            case 'ph-phone': return phDialer(screen, p);
            case 'ph-key': return phDialer(screen, p, (f.dataset.typed + el.dataset.k).slice(0, 20));
            case 'ph-del': return phDialer(screen, p, f.dataset.typed.slice(0, -1));
            case 'ph-call': {
                const n = f.dataset.typed, egg = DIAL_EGGS[n.replace(/\s/g, '')];
                const msg = f.querySelector('.phd-msg');
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"At the third stroke, the time will be ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} and ${t.getSeconds()} seconds… beep, beep, beep." (The old speaking clock!)`; return; }
                msg.textContent = egg || (n ? 'This practice phone can\'t make real calls. Try 123, 1471 or *#06#…' : 'Type a number first.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.phm-in'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Please send your bank details to claim your prize!!! (It\'s a scam. Block this number.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Thank you, your appointment is confirmed. 🦷'});
                return phMessages(screen, p, t);
            }
            case 'ph-camera': return phCamera(screen, p);
            case 'ph-shutter': {
                st.photos.push(!!st.selfie);
                const fl = document.createElement('div'); fl.className = 'phc-flash'; f.appendChild(fl); setTimeout(() => fl.remove(), 300);
                const th = f.querySelector('.phc-thumb'); th.textContent = st.selfie ? '🙂' : '🌅';
                return;
            }
            case 'ph-flip': st.selfie = !st.selfie; return phCamera(screen, p);
            case 'ph-photos': case 'ph-photos-open': return phPhotos(screen, p);
            case 'ph-photo': return phPhotos(screen, p, +el.dataset.n);
            case 'ph-mail': return phOpen(screen, p, 'Mail', `<div class="phl">${MAILS.map(([from, subj, body], k) => `<details class="phl-mail"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Start'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Stop'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.phk-sw-t').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Start'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '☀️ Sun cream on! It\'s practically the Costa del Bridlington.'); el.classList.remove('spin'); void el.offsetWidth; el.classList.add('spin'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '🔦 Torch on. (The screen glows instead of the light on the back.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '✈️ Airplane mode on: no calls, texts or mobile data.' : 'Airplane mode off.');
                if (what === 'ph-cc') { screen.querySelector('.phcc').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.phcc'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Wallpaper changed. Go home to see it!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.phs-egg');
                note.textContent = st.build >= 7 ? '🎉 You are now a developer! (A real Android secret: tap Build number 7 times.)' : st.build >= 3 ? `You are now ${7 - st.build} steps away from being a developer.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'ph-osegg'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Thank you for practising!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.phst-note').textContent = 'You don\'t need a torch app: it\'s built into your phone\'s quick settings. Free torch apps are often full of adverts, or worse!'; return; }
                if (id === 'knit') { f.querySelector('.phst-note').textContent = 'Just for show in the practice store.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Installing…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Open'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'App', `<div class="phg"><span>${el.querySelector ? (el.querySelector('.ph-icon') || {}).outerHTML || '' : ''}</span><p>This practice app is part of its own lesson. Have a look through the Learn courses to try it properly.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.ph-home'); if (h) { h.classList.remove('jiggle'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ph-confetti';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '🎉 You found a secret!');
                    return;
                }
                return phControl(screen, p);
            }
        }
    }

    // ======================================================================================
    // Scam call trainer: the caller really speaks (the device's own text-to-speech), with captions.
    // ======================================================================================
    function simVoiceOn() { try { return localStorage.getItem('sim-voice') !== 'off'; } catch (e) { return true; } }
    function simHush() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
    function simSpeak(sp) {
        if (!sp || !('speechSynthesis' in window) || !simVoiceOn()) return;
        speechSynthesis.cancel();
        const all = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
        const gb = all.filter(v => v.lang === 'en-GB');
        const pool = gb.length ? gb : all;
        const female = /female|hazel|susan|libby|sonia|maisie|kate|serena|zira|jenny|aria|martha|emma|amy/i;
        const male = /\bmale\b|george|ryan|daniel|thomas|oliver|arthur|guy|david|mark|james|brian/i;
        const v = sp.who === 'f' ? pool.find(x => female.test(x.name)) : pool.find(x => male.test(x.name) && !female.test(x.name));
        const u = new SpeechSynthesisUtterance(sp.text);
        u.lang = 'en-GB';
        if (v || pool[0]) u.voice = v || pool[0];
        u.rate = sp.who === 'robot' ? 1.02 : 0.97;
        u.pitch = sp.who === 'robot' ? 0.35 : !v && sp.who === 'f' ? 1.25 : !v && sp.who === 'm' ? 0.8 : 1;
        speechSynthesis.speak(u);
    }
    window.addEventListener('pagehide', simHush);

    function trainerCall(p, call, phase, line) {
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Call ended' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="call-tag">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring">${head}</div>
                <div class="call-answer"><button type="button" class="decline" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="accept" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="call-labels"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="call-screen ${p}">${statusBar(p)}<div class="call-ring small">${head}</div>
            ${line ? `<p class="call-handler"><b>${call.name === 'Unknown' ? 'Caller' : call.name}:</b> “${line}”</p>` : ''}
            <div class="call-answer single"><button type="button" class="decline" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Unknown', number: '0161 496 0423', who: 'm', tag: 'Not in your contacts',
         intro: 'Your phone is ringing. The number isn\'t saved in your contacts. <strong>Answer it</strong> to practise. <em>Turn your sound up to hear the caller.</em>',
         lines: [
            {text: 'Hello, this is Mark from the fraud team at your bank. We\'ve spotted some suspicious payments on your account. Before I go on, can you confirm your full name, your date of birth, and the long number on your bank card?',
             q: 'The caller says he\'s from your bank. What do you do?', options: [
                {t: 'Give the details, he\'s from the bank', why: 'A bank that rings you will never ask for your full card number. This is how scammers get your details.'},
                {t: 'Say you\'ll ring your bank back on the number on your card, and hang up', ok: true, why: 'Exactly. Ring the number on your card, from a different phone if you can, or dial 159.'},
                {t: 'Ask him to prove who he is', why: 'Scammers sound convincing and often know some of your details already. The safest thing is to hang up and ring your bank yourself.'}]},
            {text: 'Please don\'t hang up! Criminals are taking money from your account right now. You need to move everything into a safe account that I\'ll set up for you. We have to do it in the next ten minutes.',
             q: 'He says it\'s urgent and you must move your money. What now?', options: [
                {t: 'Move the money quickly, before it\'s too late', why: 'There\'s no such thing as a "safe account". Your bank will never ask you to move money. This is the scam.'},
                {t: 'Hang up. A real bank never asks you to move money to a "safe account"', ok: true, why: 'Yes. The rush and the "safe account" are the giveaways. Hang up and dial 159.'}]}],
         hang: 'Hang up with the red button.'},
        {letter: '?', color: '#64748b', name: 'Unknown', number: '020 7946 0815', who: 'robot', tag: 'Not in your contacts',
         intro: 'Another call. <strong>Answer it.</strong>',
         lines: [
            {text: 'This is an automated message from H M R C. A warrant has been issued for your arrest, for unpaid tax. To speak to an officer, press 1 now.',
             q: 'A recorded voice says you\'ll be arrested over tax. What do you do?', options: [
                {t: 'Press 1 to sort it out', why: 'Pressing 1 puts you through to scammers, who\'ll demand payment, often in gift cards. HMRC never threatens arrest on a recorded message.'},
                {t: 'Hang up. HMRC doesn\'t ring with arrest threats', ok: true, why: 'Right. HMRC writes to you first, and never threatens arrest on the phone.'}]}],
         hang: 'Hang up.'},
        {letter: '?', color: '#64748b', name: 'Unknown', number: '0113 496 0332', who: 'm', tag: 'Not in your contacts',
         intro: 'Your phone again. <strong>Answer it.</strong>',
         lines: [
            {text: 'Hello, I\'m calling from the Windows technical department. Your computer has been sending us error messages, and it has a very dangerous virus. Please go and switch on your computer, and I\'ll help you fix it.',
             q: 'He says your computer has a virus. What do you do?', options: [
                {t: 'Switch the computer on and follow his instructions', why: 'He\'d ask you to install a program that lets him control your computer, then ask for money. Microsoft never rings like this.'},
                {t: 'Hang up. Computer companies don\'t ring about viruses', ok: true, why: 'Exactly. Never let a caller onto your computer.'},
                {t: 'Explain that you don\'t have a computer', why: 'You don\'t need to explain or argue. Just hang up.'}]}],
         hang: 'Hang up.'},
        {letter: '?', color: '#64748b', name: 'Unknown', number: '0808 157 0190', who: 'f', tag: 'Not in your contacts',
         intro: 'Another call. <strong>Answer it.</strong>',
         lines: [
            {text: 'Hello. An order for a new iPhone, costing nine hundred and ninety nine pounds, has been placed on your online shopping account. If you did not make this order, press 1 to cancel it and speak to our team.',
             q: 'You didn\'t order an iPhone. What do you do?', options: [
                {t: 'Press 1 to cancel the order', why: 'Pressing 1 puts you through to a scammer, who\'ll "refund" you by asking for your bank details or control of your computer.'},
                {t: 'Hang up, then check your account yourself in the app or on the website', ok: true, why: 'Yes. If there really were an order, you\'d see it in your account. Never use a number or button a caller gives you.'}]}],
         hang: 'Hang up.'},
        {letter: 'S', color: '#16a34a', name: 'Surgery', number: '01632 960211', who: 'f', tag: 'Saved in your contacts',
         intro: 'One more call: this time it\'s the doctor\'s surgery, saved in your contacts. <strong>Answer it.</strong>',
         lines: [
            {text: 'Hello, it\'s Sue from the surgery. Just a quick reminder that your flu jab is booked for Tuesday at ten o\'clock. You don\'t need to do anything. If you need to change it, give us a ring on the usual number. Bye for now!',
             q: 'Is this call a scam?', options: [
                {t: 'Yes: hang up and block the number', why: 'This one\'s fine! She didn\'t ask for anything, didn\'t rush you, and told you to use the usual number.'},
                {t: 'Probably genuine: she didn\'t ask for money or details, and said to ring the usual number', ok: true, why: 'Exactly. Genuine calls don\'t pressure you. If you\'re ever unsure, ring back on the number you already have.'}]}],
         hang: 'The call has finished. <strong>Tap the red button</strong> to hang up.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Call ${n + 1} of ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'In real life, it\'s fine not to answer numbers you don\'t know! For this practice, tap the green button to answer.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Which of these is a sign of a scam call?', options: [
            {t: 'Being rushed, threatened, or told to keep it secret', ok: true, why: 'Yes. Pressure is the biggest giveaway. A genuine caller is happy for you to take your time and ring back.'},
            {t: 'The caller knows your name', why: 'Scammers often know your name, and even some account details. That alone doesn\'t make a call genuine.'},
            {t: 'The number looks local', why: 'Scammers can make any number appear on your screen, even a local one or your bank\'s. Don\'t trust the number.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Well done!</strong> You hung up on four scammers and spotted the genuine call. Remember: if in doubt, hang up, and ring back on a number you trust. For your bank, dial 159.'},
    ], {});
    SCENARIOS['scam-calls'].voice = true;

    function start(root) {
        const name = root.dataset.sim;
        const build = SCENARIOS[name];
        if (!build) return;
        const doneKey = 'sim-done:' + name;
        // Practice computers (Windows, Mac, Linux) use the same engine as the practice phone.
        const isPC = !!build.device;
        const OSES = build.oses || (isPC ? ['windows', 'mac', 'linux'] : ['ios', 'android']);
        const storeKey = isPC ? 'sim-os' : 'sim-platform';
        if (isPC) root.classList.add('pc');
        let platform = null, steps = [], i = 0, misses = 0, ctx = {};
        try { platform = localStorage.getItem(storeKey); } catch (e) {}
        const CHOICES = {
            ios: ['iPhone', 'Made by Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola and others'],
            windows: ['Windows', 'Most laptops and desktop PCs'], mac: ['Mac', 'Made by Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu and others'],
        };
        const notSure = isPC
            ? 'Look at your screen. Windows has a Start button (four little squares) at the bottom. A Mac has an Apple logo at the top left. Linux Mint has a Menu button at the bottom left.'
            : 'An iPhone has an Apple logo (an apple with a bite out of it) on the back. If yours doesn\'t, it\'s almost certainly an Android phone.';

        root.innerHTML = `
            <div class="sim-choose" hidden>
                <h3>Which ${isPC ? 'computer do you use' : 'phone do you have'}?</h3>
                <div class="sim-choose-btns${OSES.length > 2 ? ' three' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Not sure?</summary><p>${notSure}</p></details>
            </div>
            <div class="sim-stage" hidden>
                <div class="sim-panel">
                    <p class="sim-count"></p>
                    <div class="sim-say" tabindex="-1" aria-live="polite"></div>
                    <div class="sim-question"></div>
                    <p class="sim-hint" role="status"></p>
                    <div class="sim-tools">
                        <button type="button" class="btn-quiet sim-show" hidden>Show me where</button>
                        <button type="button" class="btn-quiet sim-hear" hidden>🔊 Hear it again</button>
                        <button type="button" class="btn-link sim-voice" hidden></button>
                        <button type="button" class="btn-link sim-back">Back a step</button>
                        <button type="button" class="btn-link sim-switch"${OSES.length < 2 ? ' hidden' : ''}>Switch ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="sim-phone-wrap">
                    <p class="sim-banner">PRACTICE ${isPC ? 'COMPUTER' : 'PHONE'}: not real. Nothing you do here is sent anywhere.</p>
                    <div class="sim-phone"><div class="sim-screen"></div></div>
                </div>
            </div>`;
        const choose = root.querySelector('.sim-choose');
        const stage = root.querySelector('.sim-stage');
        const phone = root.querySelector('.sim-phone');
        const screen = root.querySelector('.sim-screen');
        const count = root.querySelector('.sim-count');
        const say = root.querySelector('.sim-say');
        const question = root.querySelector('.sim-question');
        const hint = root.querySelector('.sim-hint');
        const showBtn = root.querySelector('.sim-show');
        // Talking practices (the scam call trainer): "Hear it again" and a voice on/off switch.
        const hearBtn = root.querySelector('.sim-hear'), voiceBtn = root.querySelector('.sim-voice');
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Turn the voice off' : 'Turn the voice on'; };
        if (build.voice && 'speechSynthesis' in window) { voiceBtn.hidden = false; voiceLabel(); }
        hearBtn.addEventListener('click', () => { const st = steps[i]; if (st && st.speak) { if (!simVoiceOn()) { try { localStorage.setItem('sim-voice', 'on'); } catch (e) {} voiceLabel(); } simSpeak(st.speak); } });
        voiceBtn.addEventListener('click', () => {
            try { localStorage.setItem('sim-voice', simVoiceOn() ? 'off' : 'on'); } catch (e) {}
            voiceLabel();
            if (simVoiceOn() && steps[i] && steps[i].speak) simSpeak(steps[i].speak); else simHush();
        });

        // Practice computer animations: a window animates out before the next step, and in after it.
        let animating = false, lastId = null, wasMin = false, restoring = false, shiftTap = false, lastPointer = 'mouse';
        function advance(id) {
            lastId = id;
            const ms = isPC ? pcAnimOut(screen, platform, id, shiftTap) : 0;
            const go = () => { animating = false; restoring = wasMin; wasMin = id === 'win-min'; i += 1; render(); };
            if (ms) { animating = true; setTimeout(go, ms); } else go();
        }

        function begin(p) {
            platform = p;
            if (OSES.length > 1) { try { localStorage.setItem(storeKey, p); } catch (e) {} }
            steps = build(p);
            i = 0;
            ctx = {input: {}, ...(steps.start || {})};
            choose.hidden = true;
            stage.hidden = false;
            phone.className = 'sim-phone ' + (isPC ? 'sim-pc ' : '') + p;
            render(false);
        }

        // When someone wanders off into the practice apps, "Show me where" becomes "Back to the lesson".
        let wandering = false;
        function wander(el) {
            if (el && /^(close|menu-close|max|ph-close|ph-cc-close|ph-jiggle-done)$/.test(el.dataset.fun || '')) return;
            wandering = true;
            showBtn.hidden = false;
            showBtn.textContent = 'Back to the lesson';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Show me where';
            const prevTitle = isPC ? (screen.querySelector('.pcw:not(.egg) .pcw-title') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Finished!' : `Step ${i + 1} of ${steps.length - 1}`;
            say.innerHTML = step.say || (step.question ? '' : '');
            question.innerHTML = '';
            root.querySelector('.sim-back').hidden = i === 0;
            ctx.pos = 0;  // how far through a sequence (passcode digits, fingerprint touches)
            const draw = c => { screen.innerHTML = step.screen(c); bindInputs(); if (isPC) pcDecorate(screen, platform); else phDecorate(screen, platform); };
            if (step.wait) {
                draw({...ctx, busy: true, installed: false});
                setTimeout(() => { if (steps[i] === step) draw(ctx); }, step.wait);
            } else {
                draw(ctx);
            }
            if (isPC) pcAnimIn(screen, platform, lastId, prevTitle, restoring);
            simHush();
            hearBtn.hidden = !(step.speak && 'speechSynthesis' in window);
            if (step.speak) simSpeak(step.speak);
            lastId = null;
            restoring = false;
            if (step.question) askQuestion(step.question);
            if (step.done) finish();
            if (focus) {
                say.focus({preventScroll: true});
                // Narrow screens: line the phone up just below the pinned instructions, so both are in view.
                if (window.innerWidth < 760) {
                    const wrapEl = root.querySelector('.sim-phone-wrap');
                    const top = wrapEl.getBoundingClientRect().top + window.scrollY - root.querySelector('.sim-panel').offsetHeight - 8;
                    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    window.scrollTo({top, behavior: calm ? 'auto' : 'smooth'});
                }
            }
        }

        function bindInputs() {
            screen.querySelectorAll('[data-input]').forEach(input => {
                input.addEventListener('input', () => { ctx.input[input.dataset.input] = input.value; });
            });
        }

        function askQuestion(qs) {
            say.innerHTML = qs.q;
            question.innerHTML = `<div class="q-options stack">${qs.options.map((o, n) =>
                `<button type="button" data-n="${n}">${o.t}</button>`).join('')}</div><div class="q-explain" hidden></div>`;
            const buttons = [...question.querySelectorAll('button')];
            buttons.forEach(b => b.addEventListener('click', () => {
                const o = qs.options[b.dataset.n];
                const explain = question.querySelector('.q-explain');
                explain.hidden = false;
                explain.innerHTML = `<p class="q-verdict ${o.ok ? 'right' : 'wrong'}">${o.ok ? 'Right!' : 'Not quite.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('is-right');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="btn-primary sim-next">Carry on</button>');
                    explain.querySelector('.sim-next').addEventListener('click', () => { i += 1; render(); });
                } else {
                    b.classList.add('is-wrong');
                    b.disabled = true;
                }
            }));
        }

        function finish() {
            try { localStorage.setItem(doneKey, '1'); } catch (e) {}
            // Next to "Try it again", a way on to the next lesson. It uses the page's own "Done, next lesson"
            // button, so the lesson is still ticked off in their progress.
            const pageNext = document.querySelector('article.lesson .lesson-done');
            const last = pageNext && pageNext.getAttribute('href').includes('#course-done');
            question.innerHTML = `<div class="sim-finish"><button type="button" class="btn-quiet sim-again">Try it again</button>${pageNext
                ? `<button type="button" class="btn-primary sim-next-lesson">Good work! ${last ? 'Now finish the course' : 'Why not try the next lesson'} &rarr;</button>` : ''}</div>`;
            question.querySelector('.sim-again').addEventListener('click', () => begin(platform));
            if (pageNext) question.querySelector('.sim-next-lesson').addEventListener('click', () => pageNext.click());
            root.dispatchEvent(new CustomEvent('sim:done', {bubbles: true}));
        }

        // A tap on the practice phone: id is the button's data-tap; keyboard is true for Enter/Space presses.
        function handleTap(id, keyboard) {
            const step = steps[i];
            if (!step || step.question || step.done || animating) return;
            if (step.alias && step.alias[id]) id = step.alias[id];  // e.g. swiping the home bar up = tapping it
            // Sequences: a passcode typed digit by digit, or a sensor touched several times.
            if (step.sequence) {
                if (id === step.sequence[ctx.pos]) {
                    ctx.pos += 1;
                    hint.textContent = '';
                    if (ctx.pos < step.sequence.length) {
                        screen.innerHTML = step.screen(ctx);
                        bindInputs();
                        if (isPC) pcDecorate(screen, platform); else phDecorate(screen, platform);
                        const again = screen.querySelector(`[data-tap="${id}"]`);
                        if (again && keyboard) again.focus();  // keep keyboard users on the keypad
                        return;
                    }
                    if (step.action) step.action(ctx);
                    i += 1;
                    render();
                    return;
                }
                hint.textContent = (step.hints && step.hints[id]) || ('Not quite. ' + (step.hint || 'Have another look at the instructions.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Not quite yet. Have another look at the instructions.';
                    return;
                }
                if (step.action) step.action(ctx);
                advance(id);
                return;
            }
            const free = (step.free || []).includes(id);
            // Free taps that change something on screen (e.g. ticking a medicine) without counting as a miss.
            if (free && step.onFree) {
                step.onFree(ctx, id);
                hint.textContent = '';
                screen.innerHTML = step.screen(ctx);
                bindInputs();
                if (isPC) pcDecorate(screen, platform); else phDecorate(screen, platform);
                return;
            }
            hint.textContent = (step.hints && step.hints[id]) || ('Not quite. ' + (step.hint || 'Have another look at the instructions.'));
            if (!free) {
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
            }
        }

        // Press and hold: buttons with data-hold="ID" count once the finger has stayed down for 0.7 seconds.
        // (Keyboard users press Enter instead.) Swipes: drag across an area with data-swipe="ID-PREFIX" and the
        // tap ID becomes e.g. "swipe-left"; each swipe area also has a small button to tap instead.
        let holdTimer = null, held = false, startX = 0, startY = 0, swipeArea = null;
        screen.addEventListener('pointerdown', e => {
            lastPointer = e.pointerType;
            // On a touchscreen, pressing and holding also stands in for right-clicking and for hovering the mouse.
            const touchy = e.pointerType !== 'mouse';
            const hold = e.target.closest(touchy ? '[data-hold], [data-rclick], [data-hover]' : '[data-hold]');
            held = false;
            if (hold) {
                const holdId = hold.dataset.hold || hold.dataset.rclick || hold.dataset.hover;
                hold.classList.add('holding');
                holdTimer = setTimeout(() => { held = true; hold.classList.remove('holding'); handleTap(holdId, false); }, 700);
            }
            swipeArea = e.target.closest('[data-swipe]');
            startX = e.clientX;
            startY = e.clientY;
        });
        const cancelHold = () => {
            clearTimeout(holdTimer);
            screen.querySelectorAll('.holding').forEach(b => b.classList.remove('holding'));
        };
        screen.addEventListener('pointerup', e => {
            cancelHold();
            if (!swipeArea) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
            const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
            handleTap(`${swipeArea.dataset.swipe}-${dir}`, false);
            swipeArea = null;
        });
        screen.addEventListener('pointerleave', cancelHold);
        screen.addEventListener('pointercancel', cancelHold);

        // Right-click (computer lessons). A plain left-click on a right-click target gets a gentle hint.
        screen.addEventListener('contextmenu', e => {
            const rc = e.target.closest('[data-rclick]');
            if (!rc && isPC && e.target.closest('.pc-area') && !e.target.closest('.pcw, .ctx-menu')) {
                e.preventDefault();
                pcFun(screen, platform, {dataset: {fun: 'desk-menu'}}, e);
                return;
            }
            if (!rc) return;
            e.preventDefault();
            handleTap(rc.dataset.rclick, false);
        });
        // Hovering the mouse over something, like a link, to see where it goes.
        screen.addEventListener('pointerover', e => {
            const h = e.target.closest('[data-hover]');
            if (!h || e.pointerType !== 'mouse') return;
            const step = steps[i];
            if (step && step.target === h.dataset.hover) handleTap(h.dataset.hover, false);
        });
        // The bin easter egg: double-click to open it (a single tap on a touchscreen, or a single click on a Mac Dock).
        screen.addEventListener('dblclick', e => {
            const el = isPC && e.target.closest('[data-egg], [data-egg-act="item"]');
            if (el) pcEgg(screen, platform, el, 'open');
        });
        screen.addEventListener('click', e => {
            if (screen._swallow) { screen._swallow = false; e.preventDefault(); return; }
            shiftTap = e.shiftKey;
            if (!isPC) {
                const step = steps[i];
                const isStep = el => el && el.dataset.tap && step && !step.question && !step.done
                    && (step.target === el.dataset.tap || (step.sequence || []).includes(el.dataset.tap) || !!(step.alias && step.alias[el.dataset.tap]));
                const funEl = e.target.closest('[data-fun]');
                if (funEl && !isStep(funEl)) { phFun(screen, platform, funEl); wander(funEl); return; }
                // Home screen apps that aren't the step open a working practice app.
                const appEl = e.target.closest('.ph-app[data-tap]');
                if (appEl && !isStep(appEl) && !(step && step.hints && step.hints[appEl.dataset.tap])) {
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'App';
                    phFun(screen, platform, {dataset: {fun: PH_FROM_TAP[appEl.dataset.tap] || 'ph-generic', label}, querySelector: q => appEl.querySelector(q), closest: () => null});
                    wander(appEl);
                    return;
                }
                // The status bar opens quick settings (tap the clock 5 times for a surprise).
                if (e.target.closest('.ph-status') && !e.target.closest('.phcc')) {
                    phFun(screen, platform, {dataset: {fun: 'ph-status'}, closest: () => null});
                    wander(null);
                    return;
                }
            }
            const eggEl = isPC && e.target.closest('[data-egg], [data-egg-act]');
            if (eggEl) {
                if (eggEl.disabled) return;
                const quick = lastPointer !== 'mouse' || e.detail === 0;
                const dock = eggEl.dataset.egg && eggEl.classList.contains('pc-pin');
                const how = (eggEl.dataset.egg || eggEl.dataset.eggAct === 'item') ? (quick || dock ? 'open' : 'select') : 'act';
                pcEgg(screen, platform, eggEl, how);
                return;
            }
            if (isPC) {
                // Close the desktop menu or calendar when clicking anywhere else.
                if (!e.target.closest('.desk-menu')) screen.querySelectorAll('.desk-menu').forEach(m => m.remove());
                if (!e.target.closest('.cal-pop, [data-fun="clock"]')) screen.querySelectorAll('.cal-pop').forEach(m => m.remove());
                const step = steps[i];
                const isStep = el => el && el.dataset.tap && step && !step.question && !step.done
                    && (step.target === el.dataset.tap || (step.sequence || []).includes(el.dataset.tap) || !!(step.alias && step.alias[el.dataset.tap]));
                let funEl = e.target.closest('[data-fun]');
                // The "Connecting to Wi-Fi" lesson has its own Wi-Fi panel: while it's open, the Wi-Fi symbol stays part of the lesson.
                if (funEl && funEl.dataset.fun === 'wifi' && screen.querySelector('.wf:not(.fun-wifi)')) funEl = null;
                if (funEl && !isStep(funEl)) { pcFun(screen, platform, funEl, e); wander(funEl); return; }
                // Taskbar, Dock, Start menu and other app buttons: open the practice app, unless the lesson has a tip for that click.
                const tapEl = e.target.closest('[data-tap]');
                if (tapEl && !funEl && FUN_FROM_TAP[tapEl.dataset.tap] && !isStep(tapEl) && !(tapEl.dataset.tap === 'tray-wifi' && screen.querySelector('.wf:not(.fun-wifi)')) && !(step && step.hints && step.hints[tapEl.dataset.tap])) {
                    if (pcApp(screen, platform, FUN_FROM_TAP[tapEl.dataset.tap], tapEl)) { wander(tapEl); return; }
                }
            }
            const rc = e.target.closest('[data-rclick]');
            if (rc && !e.target.closest('[data-tap]')) {
                if (held) { held = false; return; }
                if (e.detail === 0) handleTap(rc.dataset.rclick, true);
                else hint.textContent = 'Right-click it: press the right-hand mouse button. On a Mac trackpad, click with two fingers. On a touchscreen, press and hold.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Keep your finger (or mouse button) pressed down on it until something happens.';
                held = false;
                return;
            }
            const btn = e.target.closest('[data-tap]');
            if (btn) handleTap(btn.dataset.tap, e.detail === 0);
        });

        if (isPC) pcAttach(screen, () => platform);
        else phAttach(screen, () => platform);
        screen._redraw = () => { if (!steps[i]) return; screen.innerHTML = steps[i].screen(ctx); bindInputs(); if (isPC) pcDecorate(screen, platform); else phDecorate(screen, platform); };

        // Keyboard shortcuts on a real keyboard, e.g. Ctrl+C becomes "keys-ctrl+c" (Cmd is "cmd", Option is "alt").
        document.addEventListener('keydown', e => {
            if (!isPC || stage.hidden || !steps[i]) return;
            if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
            pcKonami(screen, platform, e.key);
            if (/input|textarea/i.test(document.activeElement.tagName) && !(steps[i].alias && steps[i].alias['keys-enter'] && e.key === 'Enter')) return;
            const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
            if (['control', 'meta', 'alt', 'shift'].includes(key)) return;
            const id = 'keys-' + [e.ctrlKey && 'ctrl', e.metaKey && 'cmd', e.altKey && 'alt', e.shiftKey && 'shift', key].filter(Boolean).join('+');
            const step = steps[i];
            const want = step.sequence ? step.sequence[ctx.pos] : step.target;
            if ((want && want.startsWith('keys-') && id === want) || (step.alias && step.alias[id])) {
                e.preventDefault();
                handleTap(id, true);
            }
        });

        showBtn.addEventListener('click', () => {
            if (wandering) {
                wandering = false;
                showBtn.textContent = 'Show me where';
                if (screen._redraw) screen._redraw();
            }
            const step = steps[i];
            const want = step.sequence ? step.sequence[ctx.pos] : step.target;
            const target = screen.querySelector(`[data-tap="${want}"], [data-hold="${want}"], [data-rclick="${want}"], [data-hover="${want}"]`);
            if (!target) return;
            target.classList.add('sim-glow');
            target.focus();
        });
        root.querySelector('.sim-back').addEventListener('click', () => {
            if (i === 0) return;
            i -= 1;
            while (i > 0 && (steps[i].wait)) i -= 1;  // don't land on a "waiting" screen
            render();
        });
        root.querySelector('.sim-switch').addEventListener('click', () => {
            stage.hidden = true;
            choose.hidden = false;
        });
        choose.querySelectorAll('[data-platform]').forEach(b => b.addEventListener('click', () => begin(b.dataset.platform)));

        // Narrow screens: the instructions are pinned above the phone, so shrink the phone a little (never
        // below 80%, to keep it readable) so more of it fits underneath them.
        const wrap = root.querySelector('.sim-phone-wrap');
        const panel = root.querySelector('.sim-panel');
        function fit() {
            if (isPC || window.innerWidth >= 760) {
                phone.style.transform = '';
                wrap.style.height = '';
                return;
            }
            const room = window.innerHeight - Math.min(panel.offsetHeight, window.innerHeight * 0.35) - 50;
            const scale = Math.max(0.8, Math.min(1, room / 610));
            phone.style.transform = `scale(${scale})`;
            phone.style.transformOrigin = 'top center';
            wrap.style.height = `${Math.round(610 * scale) + 50}px`;
        }
        window.addEventListener('resize', fit);
        new MutationObserver(fit).observe(stage, {attributes: true, attributeFilter: ['hidden']});

        if (OSES.includes(platform)) begin(platform);
        else if (OSES.length === 1) begin(OSES[0]);
        else choose.hidden = false;
        fit();
    }

    document.querySelectorAll('.sim[data-sim]').forEach(start);
    // For the poster app's local review page (/sim-review), which shows every screen side by side.
    window.PracticePhone = {scenarios: SCENARIOS, start};
})();
