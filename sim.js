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
    const statusBar = p => `<div class="ph-status ph-${p}"><span class="st-time">9:41</span><span class="${p === 'ios' ? 'ph-island' : 'ph-punch'}" aria-hidden="true"></span><span class="ph-status-r">${statusIcons}</span></div>`;
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
            inner = '<div class="clk-row"><span><small>Today, +0 hrs</small><strong>London</strong></span><em>09:41</em></div><div class="clk-row"><span><small>Today, +11 hrs</small><strong>Sydney</strong></span><em>20:41</em></div>';
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
        return `<div class="ph-lock ph-${p}">${statusBar(p)}<div class="lock-time"><small>Thursday 16 October</small>9:41</div>
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

    function start(root) {
        const name = root.dataset.sim;
        const build = SCENARIOS[name];
        if (!build) return;
        const doneKey = 'sim-done:' + name;
        let platform = null, steps = [], i = 0, misses = 0, ctx = {};
        try { platform = localStorage.getItem('sim-platform'); } catch (e) {}

        root.innerHTML = `
            <div class="sim-choose" hidden>
                <h3>Which phone do you have?</h3>
                <div class="sim-choose-btns">
                    <button type="button" data-platform="ios"><strong>iPhone</strong><span>Made by Apple</span></button>
                    <button type="button" data-platform="android"><strong>Android</strong><span>Samsung, Google Pixel, Motorola and others</span></button>
                </div>
                <details><summary>Not sure?</summary><p>An iPhone has an Apple logo (an apple with a bite out of it) on the back. If yours doesn't, it's almost certainly an Android phone.</p></details>
            </div>
            <div class="sim-stage" hidden>
                <div class="sim-panel">
                    <p class="sim-count"></p>
                    <div class="sim-say" tabindex="-1" aria-live="polite"></div>
                    <div class="sim-question"></div>
                    <p class="sim-hint" role="status"></p>
                    <div class="sim-tools">
                        <button type="button" class="btn-quiet sim-show" hidden>Show me where</button>
                        <button type="button" class="btn-link sim-back">Back a step</button>
                        <button type="button" class="btn-link sim-switch">Switch phone</button>
                    </div>
                </div>
                <div class="sim-phone-wrap">
                    <p class="sim-banner">PRACTICE PHONE: not real. Nothing you do here is sent anywhere.</p>
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

        function begin(p) {
            platform = p;
            try { localStorage.setItem('sim-platform', p); } catch (e) {}
            steps = build(p);
            i = 0;
            ctx = {input: {}, ...(steps.start || {})};
            choose.hidden = true;
            stage.hidden = false;
            phone.className = 'sim-phone ' + p;
            render(false);
        }

        function render(focus = true) {
            const step = steps[i];
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Finished!' : `Step ${i + 1} of ${steps.length - 1}`;
            say.innerHTML = step.say || (step.question ? '' : '');
            question.innerHTML = '';
            root.querySelector('.sim-back').hidden = i === 0;
            ctx.pos = 0;  // how far through a sequence (passcode digits, fingerprint touches)
            const draw = c => { screen.innerHTML = step.screen(c); bindInputs(); };
            if (step.wait) {
                draw({...ctx, busy: true, installed: false});
                setTimeout(() => { if (steps[i] === step) draw(ctx); }, step.wait);
            } else {
                draw(ctx);
            }
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
            question.innerHTML = '<button type="button" class="btn-quiet sim-again">Try it again</button>';
            question.querySelector('.sim-again').addEventListener('click', () => begin(platform));
            root.dispatchEvent(new CustomEvent('sim:done', {bubbles: true}));
        }

        // A tap on the practice phone: id is the button's data-tap; keyboard is true for Enter/Space presses.
        function handleTap(id, keyboard) {
            const step = steps[i];
            if (!step || step.question || step.done) return;
            if (step.alias && step.alias[id]) id = step.alias[id];  // e.g. swiping the home bar up = tapping it
            // Sequences: a passcode typed digit by digit, or a sensor touched several times.
            if (step.sequence) {
                if (id === step.sequence[ctx.pos]) {
                    ctx.pos += 1;
                    hint.textContent = '';
                    if (ctx.pos < step.sequence.length) {
                        screen.innerHTML = step.screen(ctx);
                        bindInputs();
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
                i += 1;
                render();
                return;
            }
            const free = (step.free || []).includes(id);
            // Free taps that change something on screen (e.g. ticking a medicine) without counting as a miss.
            if (free && step.onFree) {
                step.onFree(ctx, id);
                hint.textContent = '';
                screen.innerHTML = step.screen(ctx);
                bindInputs();
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
            const hold = e.target.closest('[data-hold]');
            held = false;
            if (hold) {
                hold.classList.add('holding');
                holdTimer = setTimeout(() => { held = true; hold.classList.remove('holding'); handleTap(hold.dataset.hold, false); }, 700);
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

        screen.addEventListener('click', e => {
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

        showBtn.addEventListener('click', () => {
            const step = steps[i];
            const want = step.sequence ? step.sequence[ctx.pos] : step.target;
            const target = screen.querySelector(`[data-tap="${want}"], [data-hold="${want}"]`);
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
            if (window.innerWidth >= 760) {
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

        if (platform === 'ios' || platform === 'android') begin(platform);
        else choose.hidden = false;
        fit();
    }

    document.querySelectorAll('.sim[data-sim]').forEach(start);
    // For the poster app's local review page (/sim-review), which shows every screen side by side.
    window.PracticePhone = {scenarios: SCENARIOS, start};
})();
