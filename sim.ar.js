/* Built copy, replaced on every build: edit templates/_site/sim.js instead. */
// Practice phone for Learn lessons: a pretend iPhone or Android screen that people tap through, step by
// step. Nothing is real: no app is installed, nothing is sent anywhere, and the phone number is a made-up
// one from the range set aside for TV and films. Icons are Lucide's plain icons, never the real logos.
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

    // ---------- Icons: Lucide (https://lucide.dev, ISC licence), the same set as the rest of the site ----------
    // LU(name, cls) gives an icon. In text, an icon's name in ⟦ ⟧ brackets becomes that icon when the screen is drawn.
    // build_site.py fills in LUCIDE with just the icons this file uses (see icons.py).
    const LUCIDE = {"antenna":"<path d=\"M2 12 7 2\" /><path d=\"m7 12 5-10\" /><path d=\"m12 12 5-10\" /><path d=\"m17 12 5-10\" /><path d=\"M4.5 7h15\" /><path d=\"M12 16v6\" />","app-window":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" /><path d=\"M10 4v4\" /><path d=\"M2 8h20\" /><path d=\"M6 4v4\" />","battery-full":"<path d=\"M10 10v4\" /><path d=\"M14 10v4\" /><path d=\"M22 14v-4\" /><path d=\"M6 10v4\" /><rect x=\"2\" y=\"6\" width=\"16\" height=\"12\" rx=\"2\" />","bell":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />","bell-off":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742\" /><path d=\"m2 2 20 20\" /><path d=\"M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05\" />","bell-ring":"<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M22 8c0-2.3-.8-4.3-2-6\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" /><path d=\"M4 2C2.8 3.7 2 5.7 2 8\" />","bird":"<path d=\"M16 7h.01\" /><path d=\"M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20\" /><path d=\"m20 7 2 .5-2 .5\" /><path d=\"M10 18v3\" /><path d=\"M14 17.75V21\" /><path d=\"M7 18a6 6 0 0 0 3.84-10.61\" />","bluetooth":"<path d=\"m7 7 10 10-5 5V2l5 5L7 17\" />","bomb":"<circle cx=\"11\" cy=\"13\" r=\"9\" /><path d=\"M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95\" /><path d=\"m22 2-1.5 1.5\" />","brick-wall":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M12 9v6\" /><path d=\"M16 15v6\" /><path d=\"M16 3v6\" /><path d=\"M3 15h18\" /><path d=\"M3 9h18\" /><path d=\"M8 15v6\" /><path d=\"M8 3v6\" />","bus":"<path d=\"M8 6v6\" /><path d=\"M15 6v6\" /><path d=\"M2 12h19.6\" /><path d=\"M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3\" /><circle cx=\"7\" cy=\"18\" r=\"2\" /><path d=\"M9 18h5\" /><circle cx=\"16\" cy=\"18\" r=\"2\" />","cake-slice":"<path d=\"M16 13H3\" /><path d=\"M16 17H3\" /><path d=\"m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6\" /><circle cx=\"9\" cy=\"7\" r=\"2\" />","calendar":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" />","calendar-days":"<path d=\"M8 2v3\" /><path d=\"M16 2v3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M8 13h.01\" /><path d=\"M12 13h.01\" /><path d=\"M16 13h.01\" /><path d=\"M8 17h.01\" /><path d=\"M12 17h.01\" /><path d=\"M16 17h.01\" />","camera":"<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\" /><circle cx=\"12\" cy=\"13\" r=\"3\" />","car":"<path d=\"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2\" /><circle cx=\"7\" cy=\"17\" r=\"2\" /><path d=\"M9 17h6\" /><circle cx=\"17\" cy=\"17\" r=\"2\" />","check":"<path d=\"M20 6 9 17l-5-5\" />","check-check":"<path d=\"M18 6 7 17l-5-5\" /><path d=\"m22 10-7.5 7.5L13 16\" />","chevron-down":"<path d=\"m6 9 6 6 6-6\" />","circle-dashed":"<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\" />","clipboard-list":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"M12 11h4\" /><path d=\"M12 16h4\" /><path d=\"M8 11h.01\" /><path d=\"M8 16h.01\" />","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 6v6l4 2\" />","cloud-rain":"<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /><path d=\"M16 14v6\" /><path d=\"M8 14v6\" /><path d=\"M12 16v6\" />","cloud-sun":"<path d=\"M12 2v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"M20 12h2\" /><path d=\"m19.07 4.93-1.41 1.41\" /><path d=\"M15.947 12.65a4 4 0 0 0-5.925-4.128\" /><path d=\"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z\" />","command":"<path d=\"M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3\" />","compass":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\" />","contact":"<path d=\"M16 2v2\" /><path d=\"M7 21v-2a2 2 0 012-2h6a2 2 0 012 2v2\" /><path d=\"M8 2v2\" /><circle cx=\"12\" cy=\"10\" r=\"3\" /><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />","credit-card":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\" /><path d=\"M6 14h2\" />","delete":"<path d=\"M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z\" /><path d=\"m12 9 6 6\" /><path d=\"m18 9-6 6\" />","disc":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><circle cx=\"12\" cy=\"12\" r=\"2\" />","disc-3":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M6 12c0-1.7.7-3.2 1.8-4.2\" /><circle cx=\"12\" cy=\"12\" r=\"2\" /><path d=\"M18 12c0 1.7-.7 3.2-1.8 4.2\" />","droplet":"<path d=\"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z\" />","ellipsis-vertical":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"5\" r=\"1\" /><circle cx=\"12\" cy=\"19\" r=\"1\" />","eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","file-pen-line":"<path d=\"M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z\" /><path d=\"M14.487 7.858A1 1 0 0 1 14 7V2\" /><path d=\"M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516\" /><path d=\"M8 18h1\" />","file-spreadsheet":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M8 13h2\" /><path d=\"M14 13h2\" /><path d=\"M8 17h2\" /><path d=\"M14 17h2\" />","file-text":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\" /><path d=\"M14 2v5a1 1 0 0 0 1 1h5\" /><path d=\"M10 9H8\" /><path d=\"M16 13H8\" /><path d=\"M16 17H8\" />","fingerprint":"<path d=\"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4\" /><path d=\"M14 13.12c0 2.38 0 6.38-1 8.88\" /><path d=\"M17.29 21.02c.12-.6.43-2.3.5-3.02\" /><path d=\"M2 12a10 10 0 0 1 18-6\" /><path d=\"M2 16h.01\" /><path d=\"M21.8 16c.2-2 .131-5.354 0-6\" /><path d=\"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2\" /><path d=\"M8.65 22c.21-.66.45-1.32.57-2\" /><path d=\"M9 6.8a6 6 0 0 1 9 5.2v2\" />","flag":"<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\" />","flame":"<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" />","flashlight":"<path d=\"M12 13v1\" /><path d=\"M17 2a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8A4 4 0 0 0 16 12v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V3a1 1 0 0 1 1-1z\" /><path d=\"M6 6h12\" />","folder":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" />","footprints":"<path d=\"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z\" /><path d=\"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z\" /><path d=\"M16 17h4\" /><path d=\"M4 13h4\" />","frown":"<path d=\"M15 10V9\" /><path d=\"M9 10V9\" /><path d=\"M9 16a5 5 0 016 0\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","gamepad-2":"<line x1=\"6\" x2=\"10\" y1=\"11\" y2=\"11\" /><line x1=\"8\" x2=\"8\" y1=\"9\" y2=\"13\" /><line x1=\"15\" x2=\"15.01\" y1=\"12\" y2=\"12\" /><line x1=\"18\" x2=\"18.01\" y1=\"10\" y2=\"10\" /><path d=\"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\" />","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\" /><path d=\"M2 12h20\" />","grid-3x3":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M3 9h18\" /><path d=\"M3 15h18\" /><path d=\"M9 3v18\" /><path d=\"M15 3v18\" />","hand":"<path d=\"M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2\" /><path d=\"M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2\" /><path d=\"M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8\" /><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\" />","headphones":"<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\" />","heart":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />","heart-pulse":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" /><path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\" />","hourglass":"<path d=\"M5 22h14\" /><path d=\"M5 2h14\" /><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\" /><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\" />","house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","image":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /><circle cx=\"9\" cy=\"9\" r=\"2\" /><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />","images":"<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\" /><path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\" /><circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\" /><rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\" />","info":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 16v-4\" /><path d=\"M12 8h.01\" />","laptop":"<path d=\"M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z\" /><path d=\"M20.054 15.987H3.946\" />","laugh":"<path d=\"M15 10V9\" /><path d=\"M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","layout-grid":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />","leaf":"<path d=\"M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20\" /><path d=\"M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13\" />","library":"<path d=\"m16 6 4 14\" /><path d=\"M12 6v14\" /><path d=\"M8 8v12\" /><path d=\"M4 4v16\" />","locate-fixed":"<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\" /><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\" /><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\" /><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\" /><circle cx=\"12\" cy=\"12\" r=\"7\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />","mail":"<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />","map-pin":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /><circle cx=\"12\" cy=\"10\" r=\"3\" />","message-circle":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />","message-circle-more":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" /><path d=\"M8 12h.01\" /><path d=\"M12 12h.01\" /><path d=\"M16 12h.01\" />","mic":"<path d=\"M12 19v3\" /><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\" /><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\" />","mic-off":"<path d=\"M12 19v3\" /><path d=\"M15 9.34V5a3 3 0 0 0-5.68-1.33\" /><path d=\"M16.95 16.95A7 7 0 0 1 5 12v-2\" /><path d=\"M18.89 13.23A7 7 0 0 0 19 12v-2\" /><path d=\"m2 2 20 20\" /><path d=\"M9 9v3a3 3 0 0 0 5.12 2.12\" />","monitor":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />","moon":"<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\" />","mountain-snow":"<path d=\"m8 3 4 8 5-5 5 15H2L8 3z\" /><path d=\"M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19\" />","mouse-pointer-2":"<path d=\"M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z\" />","music":"<path d=\"M9 18V5l12-2v13\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />","newspaper":"<path d=\"M15 18h-5\" /><path d=\"M18 14h-8\" /><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\" /><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\" />","paintbrush":"<path d=\"m14.622 17.897-10.68-2.913\" /><path d=\"M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z\" /><path d=\"M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15\" />","paperclip":"<path d=\"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551\" />","party-popper":"<path d=\"M5.8 11.3 2 22l10.7-3.79\" /><path d=\"M4 3h.01\" /><path d=\"M22 8h.01\" /><path d=\"M15 2h.01\" /><path d=\"M22 20h.01\" /><path d=\"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10\" /><path d=\"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17\" /><path d=\"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7\" /><path d=\"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z\" />","pause":"<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" /><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" />","pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"m15 5 4 4\" />","person-standing":"<circle cx=\"12\" cy=\"5\" r=\"1\" /><path d=\"m9 20 3-6 3 6\" /><path d=\"m6 8 6 2 6-2\" /><path d=\"M12 10v4\" />","phone":"<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />","phone-off":"<path d=\"M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272\" /><path d=\"M22 2 2 22\" /><path d=\"M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473\" />","pill":"<path d=\"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z\" /><path d=\"m8.5 8.5 7 7\" />","plane":"<path d=\"M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\" />","play":"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" />","plus":"<path d=\"M5 12h14\" /><path d=\"M12 5v14\" />","pound-sterling":"<path d=\"M18 7c0-5.333-8-5.333-8 0\" /><path d=\"M10 7v14\" /><path d=\"M6 21h12\" /><path d=\"M6 13h10\" />","power":"<path d=\"M12 2v10\" /><path d=\"M18.4 6.6a9 9 0 1 1-12.77.04\" />","printer":"<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" /><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />","puzzle":"<path d=\"M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z\" />","rainbow":"<path d=\"M22 17a10 10 0 0 0-20 0\" /><path d=\"M6 17a6 6 0 0 1 12 0\" /><path d=\"M10 17a2 2 0 0 1 4 0\" />","refresh-cw":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /><path d=\"M21 3v5h-5\" /><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /><path d=\"M8 16H3v5\" />","sandwich":"<path d=\"m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777\" /><path d=\"M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25\" /><path d=\"M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9\" /><path d=\"m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2\" /><rect width=\"20\" height=\"4\" x=\"2\" y=\"11\" rx=\"1\" />","save":"<path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\" /><path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\" /><path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />","scan-face":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M8 14s1.5 2 4 2 4-2 4-2\" /><path d=\"M9 9h.01\" /><path d=\"M15 9h.01\" />","scan-search":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"m16 16-1.9-1.9\" />","scan-text":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /><path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /><path d=\"M7 8h8\" /><path d=\"M7 12h10\" /><path d=\"M7 16h6\" />","scissors":"<circle cx=\"6\" cy=\"6\" r=\"3\" /><path d=\"M8.12 8.12 12 12\" /><path d=\"M20 4 8.12 15.88\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><path d=\"M14.8 14.8 20 20\" />","search":"<path d=\"m21 21-4.34-4.34\" /><circle cx=\"11\" cy=\"11\" r=\"8\" />","send-horizontal":"<path d=\"M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z\" /><path d=\"M6 12h16\" />","settings":"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","share":"<path d=\"M12 2v13\" /><path d=\"m16 6-4-4-4 4\" /><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\" />","shield-check":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /><path d=\"m9 12 2 2 4-4\" />","shopping-bag":"<path d=\"M16 10a4 4 0 0 1-8 0\" /><path d=\"M3.103 6.034h17.794\" /><path d=\"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z\" />","signal":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" /><path d=\"M12 20v-8\" /><path d=\"M17 20V8\" /><path d=\"M22 4v16\" />","signal-high":"<path d=\"M2 20h.01\" /><path d=\"M7 20v-4\" /><path d=\"M12 20v-8\" /><path d=\"M17 20V8\" />","siren":"<path d=\"M7 18v-6a5 5 0 1 1 10 0v6\" /><path d=\"M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z\" /><path d=\"M21 12h1\" /><path d=\"M18.5 4.5 18 5\" /><path d=\"M2 12h1\" /><path d=\"M12 2v1\" /><path d=\"m4.929 4.929.707.707\" /><path d=\"M12 12v6\" />","smartphone":"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /><path d=\"M12 18h.01\" />","smile":"<path d=\"M15 10V9\" /><path d=\"M16.472 15a6 6 0 01-8.943 0\" /><path d=\"M9 10V9\" /><circle cx=\"12\" cy=\"12\" r=\"10\" />","snowflake":"<path d=\"m10 20-1.25-2.5L6 18\" /><path d=\"M10 4 8.75 6.5 6 6\" /><path d=\"m14 20 1.25-2.5L18 18\" /><path d=\"m14 4 1.25 2.5L18 6\" /><path d=\"m17 21-3-6h-4\" /><path d=\"m17 3-3 6 1.5 3\" /><path d=\"M2 12h6.5L10 9\" /><path d=\"m20 10-1.5 2 1.5 2\" /><path d=\"M22 12h-6.5L14 15\" /><path d=\"m4 10 1.5 2L4 14\" /><path d=\"m7 21 3-6-1.5-3\" /><path d=\"m7 3 3 6h4\" />","spade":"<path d=\"M12 18v4\" /><path d=\"M2 14.499a5.5 5.5 0 0 0 9.591 3.675.6.6 0 0 1 .818.001A5.5 5.5 0 0 0 22 14.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2 2 0 0 0-3-.02L5 8.999c-1.5 1.5-3 3.2-3 5.5\" />","sparkles":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" /><path d=\"M20 2v4\" /><path d=\"M22 4h-4\" /><circle cx=\"4\" cy=\"20\" r=\"2\" />","square-check":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"m16 9-5.5 5.5L8 12\" />","star":"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />","store":"<path d=\"M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5\" /><path d=\"M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244\" /><path d=\"M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05\" />","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 2v2\" /><path d=\"M12 20v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m17.66 17.66 1.41 1.41\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"m6.34 17.66-1.41 1.41\" /><path d=\"m19.07 4.93-1.41 1.41\" />","sun-moon":"<path d=\"M12 2v2\" /><path d=\"M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715\" /><path d=\"M16 12a4 4 0 0 0-4-4\" /><path d=\"m19 5-1.256 1.256\" /><path d=\"M20 12h2\" />","switch-camera":"<path d=\"M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5\" /><path d=\"M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"m18 22-3-3 3-3\" /><path d=\"m6 2 3 3-3 3\" />","terminal":"<path d=\"M12 19h8\" /><path d=\"m4 17 6-6-6-6\" />","timer":"<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\" /><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\" /><circle cx=\"12\" cy=\"14\" r=\"8\" />","train-front":"<path d=\"M8 3.1V7a4 4 0 0 0 8 0V3.1\" /><path d=\"m9 15-1-1\" /><path d=\"m15 15 1-1\" /><path d=\"M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z\" /><path d=\"m8 19-2 3\" /><path d=\"m16 19 2 3\" />","trash-2":"<path d=\"M10 11v6\" /><path d=\"M14 11v6\" /><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /><path d=\"M3 6h18\" /><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />","triangle-alert":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","usb":"<circle cx=\"10\" cy=\"7\" r=\"1\" /><circle cx=\"4\" cy=\"20\" r=\"1\" /><path d=\"M4.7 19.3 19 5\" /><path d=\"m21 3-3 1 2 2Z\" /><path d=\"M9.26 7.68 5 12l2 5\" /><path d=\"m10 14 5 2 3.5-3.5\" /><path d=\"m18 12 1-1 1 1-1 1Z\" />","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"4\" />","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><path d=\"M16 3.128a4 4 0 0 1 0 7.744\" /><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /><circle cx=\"9\" cy=\"7\" r=\"4\" />","video":"<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" /><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" />","volume-2":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" /><path d=\"M16 9a5 5 0 0 1 0 6\" /><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\" />","wallet":"<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\" /><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\" />","wifi":"<path d=\"M12 20h.01\" /><path d=\"M2 8.82a15 15 0 0 1 20 0\" /><path d=\"M5 12.859a10 10 0 0 1 14 0\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" />","wifi-off":"<path d=\"M12 20h.01\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" /><path d=\"M5 12.859a10 10 0 0 1 5.17-2.69\" /><path d=\"M19 12.859a10 10 0 0 0-2.007-1.523\" /><path d=\"M2 8.82a15 15 0 0 1 4.177-2.643\" /><path d=\"M22 8.82a15 15 0 0 0-11.288-3.764\" /><path d=\"m2 2 20 20\" />","wind":"<path d=\"M12.8 19.6A2 2 0 1 0 14 16H2\" /><path d=\"M17.5 8a2.5 2.5 0 1 1 2 4H2\" /><path d=\"M9.8 4.4A2 2 0 1 1 11 8H2\" />","x":"<path d=\"M18 6 6 18\" /><path d=\"m6 6 12 12\" />","zoom-in":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" x2=\"16.65\" y1=\"21\" y2=\"16.65\" /><line x1=\"11\" x2=\"11\" y1=\"8\" y2=\"14\" /><line x1=\"8\" x2=\"14\" y1=\"11\" y2=\"11\" />"};
    const LU = (name, cls = '') => LUCIDE[name] ? `<svg class="l${cls ? ' ' + cls : ''}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LUCIDE[name]}</svg>` : '';
    const MARK = /⟦([a-z0-9-]+)⟧/g;
    function swapMarks(node) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {acceptNode: t => t.data.includes('⟦') ? 1 : 3});
        const found = [];
        for (let t = walker.nextNode(); t; t = walker.nextNode()) found.push(t);
        if (node.nodeType === 3 && node.data.includes('⟦')) found.push(node);
        found.forEach(t => {
            if (!t.parentNode) return;
            const tpl = document.createElement('template');
            tpl.innerHTML = esc(t.data).replace(MARK, (_, n) => LU(n));
            t.replaceWith(tpl.content);
        });
    }
    // Watches a practice device, so every screen, toast and window gets its icons straight away (before it's shown).
    function watchIcons(root) {
        swapMarks(root);
        new MutationObserver(list => list.forEach(m => {
            if (m.type === 'characterData') swapMarks(m.target);
            else m.addedNodes.forEach(swapMarks);
        })).observe(root, {childList: true, subtree: true, characterData: true});
    }

    // ---------- App and button icons (Lucide, not the companies' logos) ----------
    const ICON = {
        phone: LU('phone'),
        bubble: LU('message-circle'),
        chat: LU('message-circle-more'),
        camera: LU('camera'),
        photos: LU('images', 'adu'),
        settings: LU('settings'),
        clock: LU('clock'),
        mail: LU('mail'),
        weather: LU('cloud-sun'),
        map: LU('map-pin'),
        storeIos: LU('store'),
        storeAndroid: LU('play'),
        search: LU('search'),
        person: LU('user'),
        star: LU('star', 'acc'),
    };
    // Small line icons for buttons (they take the button's text colour).
    const UI = {
        phone: LU('phone', 'gu'),
        hangup: LU('phone-off', 'gu'),
        mic: LU('mic', 'gu'),
        micOff: LU('mic-off', 'gu'),
        flip: LU('switch-camera', 'gu'),
        video: LU('video', 'gu'),
        speaker: LU('volume-2', 'gu'),
        keypad: LU('grid-3x3', 'gu'),
        torch: LU('flashlight', 'gu'),
        camera: LU('camera', 'gu'),
        clip: LU('paperclip', 'gu'),
        plus: LU('plus', 'gu'),
        send: LU('send-horizontal', 'gu'),
        share: LU('share', 'gu'),
        heart: LU('heart', 'gu'),
        bin: LU('trash-2', 'gu'),
        pen: LU('pencil', 'gu'),
        dots: LU('ellipsis-vertical', 'gu'),
        info: LU('info', 'gu'),
        updates: LU('circle-dashed', 'gu'),
        people: LU('users', 'gu'),
        chat: LU('message-circle', 'gu'),
        power: LU('power', 'gu'),
        gear: LU('settings', 'gu'),
        face: LU('scan-face', 'gu'),
        finger: LU('fingerprint', 'gu'),
        qr: '<svg viewBox="0 0 29 29" class="aie" shape-rendering="crispEdges" aria-hidden="true"><rect width="29" height="29" fill="#fff"/>' +
            [[0, 0], [22, 0], [0, 22]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#111"/>`).join('') +
            [[9, 1], [11, 2], [13, 0], [15, 3], [9, 5], [12, 6], [16, 7], [18, 9], [9, 9], [1, 9], [3, 11], [5, 13], [10, 12], [12, 14], [14, 11], [17, 13], [20, 10], [23, 9], [25, 12], [27, 10], [22, 14], [24, 16], [26, 18], [9, 17], [11, 19], [13, 21], [15, 18], [17, 20], [19, 23], [21, 25], [23, 21], [25, 23], [27, 26], [10, 24], [12, 26], [14, 27], [16, 25], [1, 16], [3, 18], [5, 16], [7, 14], [19, 16], [21, 18], [26, 21], [13, 16], [18, 26], [24, 27], [6, 10], [2, 14]]
                .map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="#111"/>`).join('') + '</svg>',
    };
    const appIcon = (bg, svg) => `<span class="ha" style="background:${bg}">${svg}</span>`;
    const WA_GREEN = '#1fa855';

    // ---------- Phone frame bits ----------
    const statusIcons = LU('signal-high', 'adp') +
        LU('wifi', 'mr') +
        '<span class="vq" aria-hidden="true"></span>';
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
    const statusBar = p => `<div class="fl ph-${p}"><span class="akd">${NOW.time()}</span><span class="${p === 'ios' ? 'acy' : 'aew'}" aria-hidden="true"></span><span class="jh">${statusIcons}</span></div>`;
    const keyboard = () => `<div class="mo" aria-hidden="true">${['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(r =>
        `<div>${[...r].map(k => `<span>${k}</span>`).join('')}</div>`).join('')}<div><span class="ca">space</span></div></div>`;

    // ---------- WhatsApp setup ----------
    const NUMBER = '7700 900123';  // fictional (Ofcom drama range)
    const CODE = '482913';

    function storeName(p) { return p === 'ios' ? 'App Store' : 'متجر Play'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'الهاتف', '#22c55e', ICON.phone], ['messages', 'الرسائل', '#22c55e', ICON.bubble], ['camera', 'الكاميرا', '#6b7280', ICON.camera],
               ['photos', 'الصور', '#e5e7eb', ICON.photos], ['mail', 'البريد', '#3b82f6', ICON.mail], ['clock', 'الساعة', '#111827', ICON.clock],
               ['weather', 'الطقس', '#38bdf8', ICON.weather], ['maps', 'الخرائط', '#22c55e', ICON.map], ['settings', 'الإعدادات', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'الهاتف', '#2563eb', ICON.phone], ['messages', 'الرسائل', '#3b82f6', ICON.bubble], ['camera', 'الكاميرا', '#6b7280', ICON.camera],
               ['photos', 'الصور', '#e5e7eb', ICON.photos], ['clock', 'الساعة', '#111827', ICON.clock], ['maps', 'الخرائط', '#16a34a', ICON.map],
               ['settings', 'الإعدادات', '#475569', ICON.settings], ['weather', 'الطقس', '#38bdf8', ICON.weather], ['mail', 'البريد الإلكتروني', '#ef4444', ICON.mail],
               ['store', 'متجر Play', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'اسحب لأسفل من الزاوية العلوية اليمنى ⟦chevron-down⟧' : 'اسحب لأسفل من الأعلى ⟦chevron-down⟧'}</button>` : '';
        // The first four apps sit in the dock at the bottom, like a real home screen.
        const dockIds = ['phone', 'messages', 'camera', 'photos'];
        const appBtn = ([id, label, bg, svg], inDock) =>
            `<button type="button" class="jg" ${hold.includes(id) ? 'data-hold' : 'data-tap'}="${id}">${appIcon(bg, svg)}${inDock && p === 'ios' ? `<span class="f">${label}</span>` : `<span>${label}</span>`}</button>`;
        return `<div class="gr ph-${p}">${statusBar(p)}${pull}
            <div class="rw">${apps.filter(a => !dockIds.includes(a[0])).map(a => appBtn(a, false)).join('')}</div>
            <div class="rv">${apps.filter(a => dockIds.includes(a[0])).map(a => appBtn(a, true)).join('')}</div>
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function storeHome(p) {
        if (p === 'ios') {
            return `<div class="cg ph-ios">${statusBar(p)}
                <div class="afi">اليوم</div>
                <div class="hp"><span>مميّز</span><strong>تطبيقات نحبها هذا الأسبوع</strong></div>
                <div class="hp alt"><span>ابدأ</span><strong>أفكار لـ iPhone الجديد</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">اليوم</button><button type="button" data-tap="games">الألعاب</button>
                    <button type="button" data-tap="apps">التطبيقات</button><button type="button" data-tap="search-tab">${ICON.search}بحث</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>ابحث عن التطبيقات والألعاب</span></button>
            <div class="tg"><span class="on">لك</span><span>الأعلى تصنيفًا</span><span>الأطفال</span></div>
            <div class="hp"><span>مقترح لك</span><strong>تطبيقات لتبدأ بها</strong></div>
            <div class="hp alt"><span>الأكثر شيوعًا</span><strong>ابقَ على تواصل</strong></div>
            <div class="ki"></div></div>`;
    }

    function storeSearch(p) {
        const sugg = ['whatsapp', 'whatsapp messenger', 'whatsapp business'];
        return `<div class="cg ph-${p}">${statusBar(p)}
            <div class="hq">${ICON.search}<span>whatsapp<span class="ts"></span></span></div>
            <div class="aaq">${sugg.map(s => `<button type="button" data-tap="sugg-${s.replace(/ /g, '-')}">${ICON.search}<span>${s}</span></button>`).join('')}</div>
            ${keyboard()}</div>`;
    }

    function results(p, ctx) {
        const btnLabel = p === 'ios' ? 'الحصول' : 'تثبيت';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? 'أكثر من 5 مليار تنزيل' : 'التواصل الاجتماعي'},
            {id: 'fake2', name: 'WA Messenger for Chat Pro', dev: 'LuckyDev Studio', rating: '3.4', bg: '#22c55e'},
        ];
        const button = r => {
            if (r.id === 'real' && ctx.busy) return '<span class="km ajq" aria-label="Downloading"><span class="ajv"></span></span>';
            if (r.id === 'real' && ctx.installed) return `<button type="button" class="km" data-tap="open">Open</button>`;
            return `<button type="button" class="km" data-tap="${r.id}-get">${btnLabel}</button>`;
        };
        return `<div class="cg ph-${p}">${statusBar(p)}
            <div class="hq bz">${ICON.search}<span>whatsapp messenger</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">
                ${appIcon(r.bg, ICON.chat)}
                <div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span>
                <span class="vz">${r.rating} ${ICON.star}${r.note ? ' · ' + r.note : ''}</span></div>
                ${button(r)}</div>`).join('')}</div>
            ${ctx.sheet ? `<div class="ei"><div class="cv">
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · مجاني</span></div></div>
                <p class="agm">على iPhone الحقيقي، قد تحتاج إلى الضغط مرتين على الزر الجانبي، أو النظر إلى الشاشة لـ Face ID، أو كتابة كلمة مرور حساب Apple هنا.</p>
                <button type="button" class="ce co" data-tap="sheet-install">تثبيت</button>
                <button type="button" class="cp" data-tap="sheet-cancel">إلغاء</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>مرحبًا بك في WhatsApp</h3>
            <p>اقرأ <u>سياسة الخصوصية</u> لدينا. اضغط "موافقة ومتابعة" لقبول <u>شروط الخدمة</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">موافقة ومتابعة</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>أدخل رقم هاتفك</h3>
            <p>سيحتاج WhatsApp إلى التحقق من رقم هاتفك. قد تُطبَّق رسوم من مشغّل الشبكة.</p>
            <div class="abt">المملكة المتحدة <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">التالي</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>هل هذا هو الرقم الصحيح؟</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">تعديل</button><button type="button" data-tap="yes">${ios ? 'نعم' : 'حسنًا'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>الرسائل · الآن</strong><span>رمز WhatsApp الخاص بك: ${CODE.slice(0, 3)}-${CODE.slice(3)}. لا تشارك هذا الرمز مع الآخرين.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>جارٍ التحقق من رقمك</h3>
            <p>في انتظار الكشف تلقائيًا عن رمز من 6 أرقام أُرسل برسالة نصية إلى <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">لم يصلك الرمز؟</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['يرغب "WhatsApp" في الوصول إلى جهات اتصالك', 'حتى ترى أي أصدقائك يستخدمون WhatsApp.', 'هل تسمح لـ WhatsApp بالوصول إلى جهات اتصالك؟']
            : ['يرغب "WhatsApp" في إرسال إشعارات إليك', 'حتى تعرف عند وصول رسالة جديدة.', 'هل تسمح لـ WhatsApp بإرسال إشعارات إليك؟'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>معلومات الملف الشخصي</h3>
            <p>يرجى كتابة اسمك وإضافة صورة للملف الشخصي إن شئت.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">اسمك</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">التالي</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'المحادثات' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>كل شيء جاهز${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>ستظهر محادثاتك هنا. اضغط على زر المحادثة الجديدة لمراسلة أحد من جهات اتصالك.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `هذه هي الشاشة الرئيسية لهاتفك. تُنزَّل التطبيقات من <strong>${store}</strong>. وهو مجاني، وهو المكان الآمن للحصول على التطبيقات. <strong>اضغط على ${store}.</strong>`,
                 hint: `ابحث عن أيقونة ${store}. ${p === 'ios' ? "لونها أزرق وعليها حرف A أبيض." : "هي مثلث ملوّن."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'الآن عليك البحث عن WhatsApp. <strong>اضغط على بحث</strong>، في أسفل اليمين.' : 'الآن عليك البحث عن WhatsApp. <strong>اضغط على شريط البحث</strong> في الأعلى.',
                 hint: p === 'ios' ? 'البحث هو العدسة المكبّرة في أسفل اليمين.' : 'يظهر في شريط البحث "ابحث عن التطبيقات والألعاب".'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "كتبنا لك <em>whatsapp</em>. تظهر قائمة اقتراحات. <strong>اضغط على \"whatsapp messenger\".</strong>",
                 hint: 'اضغط على الاقتراح الذي يقول "whatsapp messenger".'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `انتبه: بعض التطبيقات تنتحل صفة WhatsApp. اسم التطبيق الحقيقي <strong>WhatsApp Messenger</strong>، من إنتاج <strong>WhatsApp Inc.</strong>، وهو مجاني. <strong>اضغط على ${p === 'ios' ? 'الحصول' : 'تثبيت'} بجانب التطبيق الحقيقي.</strong>`,
                 hints: {'fake1-get': 'هذا "WhatsUp Chat Free" من Fun Apps Ltd. إنه تطبيق مقلِّد، وكلمة "إعلان" تعني أنه إعلان. تحقق من الاسم ومن الجهة المنتجة.',
                         'fake2-get': 'هذا "WA Messenger for Chat Pro" من LuckyDev Studio، تطبيق منسوخ. التطبيق الحقيقي من إنتاج WhatsApp Inc.'},
                 hint: 'ابحث عن "WhatsApp Messenger" من إنتاج "WhatsApp Inc."'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'يتحقق iPhone من أنك أنت قبل التثبيت. في iPhone الحقيقي قد تستخدم <strong>Face ID</strong> أو <strong>بصمتك</strong> (Touch ID) أو <strong>كلمة مرور حساب Apple</strong>. هنا، فقط <strong>اضغط على تثبيت.</strong>',
                    hints: {'sheet-cancel': 'الإلغاء سيوقف التنزيل. اضغط على تثبيت بدلًا منه.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `جارٍ التنزيل. عندما ينتهي، يتغير الزر إلى <strong>فتح</strong>. <strong>اضغط على فتح.</strong>`,
                 hint: 'انتظر حتى يظهر على الزر فتح، ثم اضغط عليه.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'يُفتح WhatsApp لأول مرة. يطلب منك الموافقة على شروطه. <strong>اضغط على "موافقة ومتابعة".</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'يستخدم WhatsApp رقم هاتفك المحمول ليتمكن أصدقاؤك من العثور عليك. <strong>اضغط على مربع رقم الهاتف</strong> وسنملأ لك رقمًا تجريبيًا.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `على هاتف حقيقي ستكتب رقم هاتفك المحمول أنت. هنا استخدمنا رقمًا وهميًا: <strong>07700 900123</strong>. <strong>اضغط على التالي.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `يتأكد WhatsApp من أنك كتبته بشكل صحيح. هذا الرقم صحيح، لذا <strong>اضغط على ${p === 'ios' ? 'نعم' : 'حسنًا'}.</strong>`,
                 hints: {edit: `ستضغط على تعديل لو أخطأت. هذا الرقم صحيح، فاضغط على ${p === 'ios' ? 'نعم' : 'حسنًا'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'يرسل WhatsApp رسالة نصية فيها رمز من 6 أرقام، للتأكد من أن الرقم رقمك. يعرض عليك iPhone أن يكتبه عنك. <strong>اضغط على الرمز الظاهر فوق لوحة المفاتيح.</strong>'
                    : 'يرسل WhatsApp رسالة نصية فيها رمز من 6 أرقام، للتأكد من أن الرقم رقمك. كثير من هواتف Android تكتبه بنفسها. وإن لم يفعل هاتفك، <strong>اضغط على الرسالة</strong> في الأعلى.'},
                {screen: c => waCode(p, c),
                 question: {q: 'أثناء الإعداد، يراسلك صديق: <em>"مرحبًا! أرسلتُ لك رمزًا من 6 أرقام بالخطأ، هل يمكنك إرساله لي؟"</em> ماذا تفعل؟',
                    options: [
                        {t: 'أرسله، فهو صديق', why: 'هذا احتيال شائع. استولى شخص ما على حساب صديقك، وهذا الرمز سيعطيه حسابك أيضًا.'},
                        {t: 'لا ترسله. لا ينبغي لأحد أن يطلبه أبدًا', ok: true, why: 'تمامًا. هذا الرمز هو مفتاح WhatsApp الخاص بك. لا تشاركه مع أحد أبدًا، حتى لو كان صديقًا أو شخصًا يقول إنه من WhatsApp.'},
                        {t: 'أرسل أول 3 أرقام فقط', why: 'حتى جزء من الرمز يساعد المحتال. لا تشارك أي جزء منه أبدًا.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'يطلب WhatsApp الاطلاع على جهات اتصالك ليريك أي أصدقائك يستخدمون WhatsApp. <strong>اضغط على السماح.</strong>',
                 hints: {deny: 'يمكنك اختيار عدم السماح، لكن عندها لن يتمكن WhatsApp من عرض أسماء أصدقائك. في هذا التدريب، اضغط على السماح.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'تخبرك الإشعارات عند وصول رسالة، حتى عندما يكون WhatsApp مغلقًا. <strong>اضغط على السماح.</strong>',
                 hints: {deny: 'بدون الإشعارات لن تعرف متى يراسلك أحد. اضغط على السماح في هذا التدريب.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'الخطوة الأخيرة: اسمك هو ما يراه أصدقاؤك. <strong>اكتب اسمك الأول في المربع</strong>، ثم <strong>اضغط على التالي</strong>. (يبقى في هذه الصفحة ولا يُرسل إلى أي مكان.)',
                 hints: {photo: 'في التطبيق الحقيقي يمكنك اختيار صورة الآن، أو إضافتها لاحقًا من الإعدادات. دعنا نتخطاها الآن: اكتب اسمك واضغط على التالي.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>أحسنت، لقد أعددت WhatsApp!</strong> ستظهر محادثاتك هنا. في الدروس القادمة سترسل أول رسالة لك.'},
            ];
        },
    };

    // ---------- Unlocking your phone: passcode, face and fingerprint ----------
    // Android follows Google Pixel's menus; the lesson text says where Samsung keeps the same settings.
    const PRACTICE_CODE = ['4', '7', '1', '9', '3', '6'];  // shown on screen, never the reader's real code
    const CODE_KEYS = PRACTICE_CODE.map(d => 'k' + d);
    const codeText = PRACTICE_CODE.join(' ');

    const homeIndicator = p => p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>';
    const setIcon = (bg, letter) => `<span class="re" style="background:${bg}">${letter}</span>`;

    function settingsList(p, ctx) {
        if (p === 'ios') {
            const lockName = ctx.touch ? 'Touch ID ورمز الدخول' : 'Face ID ورمز الدخول';
            const groups = [
                [['airplane', 'وضع الطيران', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'بلوتوث', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'الخدمة الخلوية', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'الإشعارات', '#ef4444', '⟦bell⟧'], ['sounds', 'الأصوات واللمس', '#ec4899', '⟦volume-2⟧'], ['focus', 'التركيز', '#6366f1', '⟦moon⟧']],
                [['general', 'عام', '#8e8e93', '⟦settings⟧'], ['accessibility', 'إمكانية الوصول', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence وSiri', '#a855f7', '⟦sparkles⟧'], ['display', 'شاشة العرض والإضاءة', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'الطوارئ SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'الخصوصية والأمان', '#3b82f6', '⟦hand⟧'], ['battery', 'البطارية', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'التطبيقات', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>حساب Apple وiCloud والمزيد</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'الشبكة والإنترنت', 'الجوّال وWi-Fi ونقطة الاتصال'], ['devices', 'الأجهزة المتصلة', 'Bluetooth والإقران'],
            ['apps', 'التطبيقات', 'التطبيقات الأخيرة والتطبيقات الافتراضية'], ['notifications', 'الإشعارات', 'سجل الإشعارات'], ['battery', 'البطارية', '85%'], ['storage', 'مساحة التخزين', '91% used'],
            ['sound', 'الصوت والاهتزاز', 'مستوى الصوت واللمس'], ['display', 'الشاشة واللمس', 'السمة الداكنة وحجم الخط'],
            ['accessibility', 'إمكانية الوصول', 'الشاشة والتفاعل والصوت'], ['security', 'الأمان والخصوصية', 'أمان التطبيقات وقفل الجهاز والأذونات'],
            ['location', 'الموقع', 'مفعّل'], ['safety', 'السلامة والطوارئ', 'الطوارئ SOS والمعلومات الطبية والتنبيهات'],
            ['google', 'Google', 'الخدمات والتفضيلات'], ['system', 'النظام', 'اللغات والوقت وتحديثات البرامج']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID ورمز الدخول' : 'Face ID ورمز الدخول';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>الإصبع 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>إعادة ضبط Face ID</span></div><div class="cj ex"><span>إعداد مظهر بديل</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>إيقاف رمز الدخول</span></div><div class="cj ex"><span>تغيير رمز الدخول</span></div>'
                : '<button type="button" class="cj link" data-tap="passcode-on">Turn Passcode On</button>'}</div>
            <div class="ge"><button type="button" class="cj" data-tap="stolen"><span>Stolen Device Protection</span><span class="kz">Off ›</span></button></div>
            </div>${homeIndicator('ios')}</div>`;
    }

    function keypad(p) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
        return `<div class="aak ${p}">${keys.map(k => k
            ? `<button type="button" class="ry" data-tap="k${k}" aria-label="${k}">${k}</button>`
            : '<span></span>').join('')}</div>`;
    }

    function codeScreen(p, ctx, title, sub, extra = '') {
        const filled = ctx.full ? 6 : (ctx.pos || 0);
        const dots = [0, 1, 2, 3, 4, 5].map(n => `<span class="${n < filled ? 'on' : ''}"></span>`).join('');
        return `<div class="hw ${p}">${statusBar(p)}
            <div class="ig"><strong>${title}</strong><p>${sub}</p></div>
            <div class="qu" aria-label="${filled} of 6 digits entered">${dots}</div>
            ${extra}${keypad(p)}${homeIndicator(p)}</div>`;
    }

    function androidList(title, rows, back = true) {
        return `<div class="iw android">${statusBar('android')}<div class="fr">
            <div class="gw android">${back ? '<span class="pw">←</span>' : ''}<strong>${title}</strong></div>
            ${rows.map(([id, label, sub]) => id
                ? `<button type="button" class="cj" data-tap="${id}"><span class="hf"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`
                : `<div class="cj ex"><span class="hf"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></div>`).join('')}
            </div>${homeIndicator('android')}</div>`;
    }

    const androidSecurity = () => androidList('الأمان والخصوصية', [
        ['device-unlock', 'فتح قفل الجهاز', 'قفل الشاشة وفتح القفل بالوجه وبصمة الإصبع'], ['app-security', 'أمان التطبيقات', 'فحص التطبيقات بحثًا عن سلوك ضار'],
        ['theft', 'الحماية من السرقة', 'قفل هاتفك إذا سُرق'], ['privacy', 'الخصوصية', 'الأذونات ونشاط الحساب']]);
    const androidDeviceUnlock = ctx => androidList('فتح قفل الجهاز', [
        ['screen-lock', 'قفل الشاشة', ctx.passcodeSet ? 'رمز PIN' : 'بلا'], ['face-finger', 'فتح القفل بالوجه وبصمة الإصبع', ctx.faceDone || ctx.fingerDone ? 'إعداد' : 'أعدّه لفتح القفل بشكل أسرع']]);
    const androidFaceFinger = ctx => androidList('فتح القفل بالوجه وبصمة الإصبع', [
        ['face-unlock', 'Face Unlock', ctx.faceDone ? 'تمت إضافة الوجه' : 'إعداد'], ['fingerprint-unlock', 'فتح القفل ببصمة الإصبع', ctx.fingerDone ? '1 fingerprint' : 'إعداد']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'اكتمل أول مسح لـ Face ID.' : 'تم إعداد Face ID الآن.') : 'تمت إضافة الوجه';
        const btn = p === 'ios' ? (first ? 'متابعة' : 'تم') : 'تم';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'حرّك رأسك ببطء لإكمال الدائرة.' : 'أبقِ وجهك داخل الدائرة وحرّك رأسك ببطء.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'اكتمل' : 'اضبط طريقة إمساكك') : (stage === 'grip' ? 'اضبط طريقة إمساكك' : 'ضع إصبعك'))
            : (ready ? 'تمت إضافة البصمة' : 'المس المستشعر');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'يمكن الآن استخدام بصمتك لفتح قفل iPhone.' : 'الآن ضع حواف طرف إصبعك على زر الصفحة الرئيسية.')
                     : (stage === 'grip' ? 'أسند حواف طرف إصبعك على زر الصفحة الرئيسية.' : 'ارفع إصبعك وضعه على زر الصفحة الرئيسية مرارًا.'))
            : (ready ? 'يمكنك الآن استخدام بصمتك لفتح قفل هاتفك.' : 'المس المستشعر، ثم ارفع إصبعك، وأعد لمسه حتى تمتلئ البصمة.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'متابعة' : 'تم'}</button>` : sensor}
            ${p === 'ios' ? '' : homeIndicator(p)}</div>`;
    }

    function consent(p, title, text, agree) {
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="ig"><strong>${title}</strong><p>${text}</p></div>
            <div class="nz">${UI.face}</div>
            <button type="button" class="ce dk" data-tap="agree">${agree}</button>
            <button type="button" class="cp and" data-tap="cancel">Cancel</button>
            ${homeIndicator(p)}</div>`;
    }

    // Steps used by all three: from the home screen into the right settings page.
    function openLockSettings(p, ctx) {
        if (p === 'ios') {
            return [
                {screen: () => home(p), target: 'settings',
                 say: 'رمز الدخول وFace ID وTouch ID كلها في تطبيق <strong>الإعدادات</strong>. <strong>اضغط على الإعدادات</strong> (الترس الرمادي).',
                 hint: 'الإعدادات هي الأيقونة الرمادية التي عليها ترس.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `مرّر القائمة للأسفل إن لزم، ثم <strong>اضغط على ${ctx.touch ? 'Touch ID ورمز الدخول' : 'Face ID ورمز الدخول'}</strong>.`,
                 hint: `ابحث عن "${ctx.touch ? 'Touch ID ورمز الدخول' : 'Face ID ورمز الدخول'}"، تحت شاشة العرض والإضاءة.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'قفل الشاشة وFace Unlock وبصمات الأصابع كلها في تطبيق <strong>الإعدادات</strong>. <strong>اضغط على الإعدادات</strong> (الترس).',
             hint: 'الإعدادات هي الأيقونة التي عليها ترس.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'مرّر للأسفل إن لزم، ثم <strong>اضغط على الأمان والخصوصية</strong>. <em>في Samsung تُسمّى الأمان والخصوصية، ثم القياسات الحيوية أو شاشة القفل.</em>',
             hint: 'ابحث عن "الأمان والخصوصية" قرب أسفل القائمة.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>اضغط على فتح قفل الجهاز.</strong>',
             hint: 'إنه الخيار الأول، "فتح قفل الجهاز".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'أدخل رمز الدخول' : 'أدخل رقم PIN', p === 'ios' ? '' : 'للمتابعة، أدخل رقم PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}يتأكد هاتفك أولًا أنك أنت. <strong>اكتب الرمز التجريبي: ${codeText}</strong>. <em>لا تكتب رمز دخولك الحقيقي في أي موقع إلكتروني أبدًا.</em>`,
        hint: `اكتب الرمز التجريبي ${codeText}، رقمًا رقمًا.`,
    });

    const safestQuestion = {
        q: 'أي من هذه سيكون رمز الدخول <strong>الأكثر أمانًا</strong>؟',
        options: [
            {t: '123456', why: '123456 هو رمز الدخول الأكثر استخدامًا على الإطلاق، لذا فهو من أول ما يجربه اللص.'},
            {t: 'عيد ميلادك، مثل 140352', why: 'من السهل معرفة أعياد الميلاد، من وسائل التواصل الاجتماعي أو البطاقات أو البريد. تجنّب التواريخ التي لها معنى.'},
            {t: 'ستة أرقام لا تعني شيئًا لأي شخص آخر', ok: true, why: 'تمامًا. الأرقام العشوائية التي ليست تاريخًا ولا نمطًا ولا تكرارًا هي الأصعب تخمينًا.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'ليس لهذا الهاتف رمز دخول بعد، لذا يستطيع أي شخص فتحه. <strong>اضغط على تشغيل رمز الدخول.</strong>',
                 hints: {stolen: 'حماية الجهاز المسروق موضحة في الدرس 4. أولًا، شغّل رمز الدخول.'}},
                {screen: c => codeScreen(p, c, 'تعيين رمز الدخول', 'أدخل رمز دخول', '<p class="aeh">خيارات رمز الدخول</p>'), sequence: CODE_KEYS,
                 say: `اختر 6 أرقام ستتذكرها. في هذا التدريب، <strong>اكتب ${codeText}</strong>. <em>من فضلك لا تكتب رمز دخولك الحقيقي هنا.</em>`,
                 hint: `اكتب ${codeText}، رقمًا رقمًا.`},
                {screen: c => codeScreen(p, c, 'تعيين رمز الدخول', 'أعد إدخال رمز الدخول الجديد'), sequence: CODE_KEYS,
                 say: `يسألك iPhone مرة أخرى للتأكد من أنك لم تخطئ. <strong>اكتب ${codeText} مرة أخرى.</strong>`,
                 hint: `اكتب ${codeText} مرة أخرى.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>أحسنت، أصبح لهاتفك التجريبي رمز دخول الآن!</strong> في iPhone الحقيقي، قد يُطلب منك أيضًا كلمة مرور حساب Apple في هذه المرحلة.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'قفل الشاشة يقول <strong>بلا</strong>، لذا يستطيع أي شخص فتح هذا الهاتف. <strong>اضغط على قفل الشاشة.</strong>'},
            {screen: () => androidList('اختر قفل الشاشة', [['none', 'بلا'], ['swipe', 'تمرير'], ['pattern', 'نمط'], ['pin', 'رمز PIN'], ['password', 'كلمة مرور']]),
             target: 'pin', say: 'هناك عدة خيارات. <strong>رقم PIN</strong> (أرقام) سهل وآمن. <strong>اضغط على PIN.</strong>',
             hints: {none: '"بلا" تعني أن أي شخص يستطيع فتح هاتفك.', swipe: '"التمرير" يفتح الهاتف بسحبة فقط، فلا يحمي شيئًا.',
                     pattern: 'يمكن تخمين النمط من آثار إصبعك على الشاشة. رقم PIN أكثر أمانًا.',
                     password: 'كلمة المرور تصلح أيضًا، لكن رقم PIN أسرع في الكتابة كل يوم. اضغط على PIN في هذا التدريب.'}},
            {screen: c => codeScreen(p, c, 'اختر رقم PIN', 'يجب أن يتكون رقم PIN من 4 أرقام على الأقل'), sequence: CODE_KEYS,
             say: `6 أرقام أكثر أمانًا من 4. في هذا التدريب، <strong>اكتب ${codeText}</strong>. <em>من فضلك لا تكتب رقم PIN الحقيقي هنا.</em>`,
             hint: `اكتب ${codeText}، رقمًا رقمًا.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'اختر رقم PIN', 'يجب أن يتكون رقم PIN من 4 أرقام على الأقل', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>اضغط على التالي.</strong>'},
            {screen: c => codeScreen(p, c, 'أعد إدخال رقم PIN', ''), sequence: CODE_KEYS,
             say: `يسألك هاتفك مرة أخرى للتأكد من أنك لم تخطئ. <strong>اكتب ${codeText} مرة أخرى.</strong>`, hint: `اكتب ${codeText} مرة أخرى.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'أعد إدخال رقم PIN', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>اضغط على تأكيد.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('الإشعارات على شاشة القفل', [['show-all', 'عرض كل محتوى الإشعارات'], ['hide-sensitive', 'إخفاء المحتوى الحساس'], ['dont-show', 'عدم عرض الإشعارات إطلاقًا']], false),
             target: 'hide-sensitive',
             say: 'يسألك هاتفك عمّا يجب أن يظهر من الرسائل على الشاشة المقفلة. <strong>إخفاء المحتوى الحساس</strong> خيار جيد: سترى أن رسالة وصلت، لكن دون أن ترى ما فيها. <strong>اضغط عليه.</strong>',
             hints: {'show-all': 'هذا يعرض كل شيء، بما في ذلك الرموز القادمة من مصرفك، لأي شخص يلتقط هاتفك. اضغط على "إخفاء المحتوى الحساس".',
                     'dont-show': 'هذا يصلح، لكنك لن ترى متى تصل الرسائل. في هذا التدريب، اضغط على "إخفاء المحتوى الحساس".'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>أحسنت، أصبح لهاتفك التجريبي رقم PIN الآن!</strong> صار قفل الشاشة يقول PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>اضغط على إعداد Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>كيفية إعداد Face ID</strong>
                    <p>أولًا، ضع وجهك داخل إطار الكاميرا. ثم حرّك رأسك في دائرة لإظهار كل زوايا وجهك.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">البدء</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'أمسك هاتفك أمام وجهك، على بعد ذراع تقريبًا، كأنك تلتقط صورة ذاتية. <strong>اضغط على البدء.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'في iPhone الحقيقي ستقوم الآن <strong>بتحريك رأسك ببطء في دائرة</strong>، كأنك ترسم دائرة بأنفك. تمتلئ الحلقة أثناء المسح. وعندما ينتهي، <strong>اضغط على متابعة</strong>.',
                 hint: 'انتظر حتى تمتلئ الدائرة، ثم اضغط على متابعة.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'يمسح مرة ثانية للتأكد. حرّك رأسك في دائرة مرة أخرى. عندما ينتهي، <strong>اضغط على تم</strong>.',
                 hint: 'انتظر حتى تمتلئ الدائرة، ثم اضغط على تم.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'يطلب منك صديق أن تضيف <em>وجهه</em> إلى هاتفك، "تحسبًا لأي طارئ". ماذا تفعل؟',
                    options: [
                        {t: 'أدعه يفعل، فهذا مفيد', why: 'أي شخص أُعدّ وجهه يستطيع فتح هاتفك والموافقة على المدفوعات في تطبيقاتك. أضف وجهك أنت فقط.'},
                        {t: 'أرفض. وجهي وحده هو ما يجب أن يفتح هاتفي', ok: true, why: 'تمامًا. إذا احتاج شخص تثق به إلى الدخول، فشاركه رمز دخولك بدلًا من ذلك، وغيّره بعدها إن لزم.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>أحسنت، تم إعداد Face ID!</strong> الآن يمكنك فتح قفل هاتفك بمجرد النظر إليه، ثم السحب للأعلى.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>اضغط على فتح القفل بالوجه وبصمة الإصبع.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>اضغط على Face Unlock.</strong>',
             hints: {'fingerprint-unlock': 'هذه هي البصمات، وهي الدرس 3. الآن، اضغط على Face Unlock.'}},
            {screen: () => consent(p, 'افتح القفل بوجهك', 'استخدم وجهك لفتح قفل هاتفك وتأكيد أنك أنت في التطبيقات. وجهك محفوظ على هذا الهاتف فقط.', 'أوافق'),
             target: 'agree', say: 'يشرح هاتفك كيف يستخدم وجهك. <strong>اضغط على أوافق.</strong>',
             hints: {cancel: 'الإلغاء سيوقف الإعداد. اضغط على أوافق للمتابعة.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'أمسك هاتفك على مستوى العينين، على بعد ذراع تقريبًا. في الهاتف الحقيقي <strong>تُبقي وجهك داخل الدائرة وتحرّك رأسك ببطء</strong>. وعندما ينتهي، <strong>اضغط على تم</strong>.',
             hint: 'انتظر حتى تمتلئ الدائرة، ثم اضغط على تم.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'في كثير من هواتف Android يكون Face Unlock أقل أمانًا من بصمة الإصبع. ماذا يعني ذلك بالنسبة لك؟',
                options: [
                    {t: 'لا مشكلة في أي شيء', why: 'في كثير من الهواتف يستخدم فتح القفل بالوجه كاميرا عادية يمكن خداعها بسهولة أكبر. وبعض تطبيقات البنوك لا تقبله لهذا السبب.'},
                    {t: 'استخدمه لفتح القفل، واستخدم بصمة الإصبع أو PIN للتطبيقات المصرفية إذا طلب مصرفك ذلك', ok: true, why: 'صحيح. سيخبرك هاتفك إن كان يمكن استخدام Face Unlock في المدفوعات والتطبيقات المصرفية. وإن لم يكن ممكنًا، فاستخدم بصمتك أو رقم PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>أحسنت، تم إعداد Face Unlock!</strong> الآن يمكنك فتح قفل هاتفك بالنظر إليه.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>اضغط على إضافة بصمة…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'يستخدم Touch ID <strong>زر الصفحة الرئيسية</strong> في مقدمة أجهزة iPhone الأقدم، مثل iPhone SE. <strong>اضغط على زر الصفحة الرئيسية في أسفل الهاتف التجريبي 6 مرات</strong>، كأنك ترفع إصبعك وتضعه.',
                 hint: 'اضغط على زر الصفحة الرئيسية المستدير في أسفل الهاتف التجريبي.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'الآن يحتاج إلى حواف طرف إصبعك. <strong>اضغط على متابعة.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'في iPhone الحقيقي تضع <strong>جانبي إصبعك وطرفه</strong> على الزر. <strong>اضغط على زر الصفحة الرئيسية 4 مرات أخرى.</strong>',
                 hint: 'اضغط على زر الصفحة الرئيسية المستدير في الأسفل.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'تم كل شيء. <strong>اضغط على متابعة.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'أي إصبع الأفضل لإضافته أولًا؟',
                    options: [
                        {t: 'الإبهام أو الإصبع الذي تستخدمه أكثر لإمساك هاتفك', ok: true, why: 'نعم. مع زر الصفحة الرئيسية يكون ذلك عادةً إبهامك. يمكنك إضافة ما يصل إلى 5 أصابع، فمن الجيد إضافة الإبهامين.'},
                        {t: 'أي إصبع، لا فرق', why: 'يعمل مع أي إصبع، لكن اختر الإصبع الذي يستقر طبيعيًا على الزر عندما تمسك هاتفك، وهو عادةً الإبهام.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>أحسنت، تم إعداد بصمتك!</strong> ضع إصبعك على زر الصفحة الرئيسية لفتح القفل. يمكنك إضافة أصابع أخرى بالطريقة نفسها.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>اضغط على فتح القفل بالوجه وبصمة الإصبع.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>اضغط على فتح القفل ببصمة الإصبع.</strong>',
             hints: {'face-unlock': 'هذا فتح القفل بالوجه، من الدرس 2. الآن، اضغط على فتح القفل ببصمة الإصبع.'}},
            {screen: () => consent(p, 'افتح القفل ببصمة الإصبع', 'استخدم بصمتك لفتح قفل هاتفك أو تأكيد أنك أنت، مثل عند تسجيل الدخول إلى التطبيقات. بصمتك محفوظة على هذا الهاتف فقط.', 'أوافق'),
             target: 'agree', say: '<strong>اضغط على أوافق.</strong>', hints: {cancel: 'الإلغاء سيوقف الإعداد. اضغط على أوافق للمتابعة.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'قد يكون المستشعر على الشاشة أو في ظهر الهاتف أو في زر التشغيل، وسيريك هاتفك مكانه. هنا هو على الشاشة. <strong>اضغط على المستشعر 6 مرات</strong>، كأنك ترفع إصبعك وتضعه.',
             hint: 'اضغط على المستشعر المستدير قرب أسفل الشاشة.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'تم تسجيل بصمتك. <strong>اضغط على تم.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'أي إصبع الأفضل لإضافته أولًا؟',
                options: [
                    {t: 'الإصبع الذي يلمس المستشعر طبيعيًا عندما تمسك هاتفك', ok: true, why: 'نعم. مع مستشعر في الخلف يكون ذلك عادةً السبابة، ومع مستشعر على الشاشة أو الجانب يكون الإبهام. يمكنك إضافة أكثر من إصبع.'},
                    {t: 'أي إصبع، لا فرق', why: 'أي إصبع يصلح، لكن اختر الإصبع الذي يقع طبيعيًا على المستشعر. فهذا يجعل فتح القفل سريعًا وسهلًا.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>أحسنت، تم إعداد بصمتك!</strong> المس المستشعر لفتح القفل. يمكنك إضافة أصابع أخرى بالطريقة نفسها.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'عباد الشمس في الحديقة', '#fde68a'], ['🐶', 'الكلب على الأريكة', '#fecaca'], ['🏖️', 'يوم على الشاطئ', '#bae6fd'],
                    ['🎂', 'كعكة عيد ميلاد', '#fbcfe8'], ['🌅', 'غروب الشمس فوق البحر', '#fed7aa'], ['🐈', 'القطة نائمة', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'قُرئت' : state === 'sent' ? 'أُرسلت' : 'وصلت'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

    function bubble(m) {
        const body = m.photo !== undefined
            ? `<span class="zo" style="background:${PHOTOS[m.photo][2]}" role="img" aria-label="${PHOTOS[m.photo][1]}">${PHOTOS[m.photo][0]}</span>${m.text ? `<span>${esc(m.text)}</span>` : ''}`
            : m.voice ? '<span class="zp">▶ <span class="aka"></span> 0:04</span>'
            : `<span>${esc(m.text)}</span>`;
        const who = m.from ? `<strong class="ahk">${m.from}</strong>` : '';
        return `<div class="dm ${m.me ? 'me' : 'them'}">${who}${body}<small>${m.time || '10:2' + (m.n || 1)}${m.me ? ' ' + ticks(m.ticks) : ''}</small></div>`;
    }

    function waChatList(p, ctx) {
        const chats = [
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'مرحبًا ماما، أنا! رقمي جديد، وهاتفي القديم تعطل…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'العائلة', last: 'Dave: من سيحضر الكعكة؟ 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'أراك يوم الخميس!', time: 'أمس', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'مرحبًا ماما! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
        ];
        const ios = p === 'ios';
        const top = ios
            ? `<div class="hv ios"><span class="abu"><span></span><button type="button" class="fy" data-tap="new-chat" aria-label="New chat">${UI.pen}</button></span><strong>Chats</strong></div>`
            : `<div class="hv android"><strong>WhatsApp</strong><span class="rj"><span class="fy" aria-hidden="true">${UI.camera}</span>
                <button type="button" class="fy" data-tap="menu" aria-label="More options">${UI.dots}</button></span></div>`;
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}${top}
            <div class="mu">${chats.map(c => `<button type="button" class="lv" data-tap="chat-${c.id}">${avatar(c.letter, c.bg)}
                <span class="gn"><strong>${c.name}</strong><small>${esc(c.last)}</small></span>
                <span class="oh"><small>${c.time}</small>${c.unread ? `<span class="xj">${c.unread}</span>` : ''}${c.muted ? '<span class="zm" aria-label="Muted">⟦bell-off⟧</span>' : ''}</span></button>`).join('')}</div>
            ${ios ? `<div class="lc"><span>${UI.updates}Updates</span><span>${UI.phone}Calls</span><span>${UI.people}Communities</span><span class="on">${UI.chat}Chats</span><button type="button" data-tap="tab-settings">${UI.gear}Settings</button></div>`
                  : '<button type="button" class="qd" data-tap="new-chat" aria-label="New chat">+</button>'}
            ${ctx.menuOpen ? `<div class="jb"><span>New group</span><span>Linked devices</span><span>Starred</span><button type="button" data-tap="menu-settings">Settings</button></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waContacts(p) {
        const contacts = [['dave', 'Dave', '#38bdf8'], ['jean', 'Jean', '#a78bfa'], ['sarah', 'Sarah', '#f472b6'], ['tom', 'Tom', '#34d399']];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${p === 'ios' ? 'محادثة جديدة' : 'اختر جهة اتصال'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['العائلة', '#f59e0b', 'Dave وJean وSarah وأنت'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'إضافة (علامة الجمع)' : 'إرفاق (مشبك الورق)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>هذا الرقم ليس في جهات اتصالك.</p><div><button type="button" data-tap="block">حظر</button><button type="button" data-tap="add-contact">إضافة</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'الصور' : 'المعرض'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>هل تريد حظر +44 7700 900842؟</strong></p><p class="fd">جهات الاتصال المحظورة لا تستطيع الاتصال بك ولا مراسلتك.</p>
                <p class="fd">⟦square-check⟧ الإبلاغ إلى WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">إلغاء</button><button type="button" data-tap="confirm-block">حظر</button></div></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waGallery(p, ctx) {
        if (ctx.picked !== undefined) {
            const ph = PHOTOS[ctx.picked];
            return `<div class="cg wd ph-${p} vf">${statusBar(p)}
                <div class="wg" style="background:${ph[2]}" role="img" aria-label="${ph[1]}">${ph[0]}</div>
                <div class="rh"><label class="qe"><span class="f">Caption</span><input type="text" data-input="caption" placeholder="Add a caption…" autocomplete="off"></label>
                <button type="button" class="ic" data-tap="send-photo" aria-label="Send photo">${UI.send}</button></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg wd ph-${p}">${statusBar(p)}
            <div class="hv ${p}"><strong>${p === 'ios' ? 'الأخيرة' : 'المعرض'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>جارٍ الرنين…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'إلغاء الكتم' : 'كتم'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'مكتومة لمدة أسبوع' : 'إيقاف'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>كتم الإشعارات لمدة…</strong></p>
                <button type="button" data-tap="mute-8h">8 ساعات</button><button type="button" data-tap="mute-week">أسبوع</button><button type="button" data-tap="mute-always">دائمًا</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['الإعدادات', [['account', 'الحساب', 'إشعارات الأمان، تغيير الرقم'], ['privacy', 'الخصوصية', 'حظر جهات الاتصال، الرسائل المؤقتة'],
                ['chats', 'المحادثات', 'السمة، الخلفيات'], ['notifications', 'الإشعارات', 'نغمات الرسائل والمجموعات والمكالمات']]],
            account: ['الحساب', [['twostep', 'التحقق بخطوتين', ctx.twoStep ? 'مفعّل' : 'إيقاف'], ['change-number', 'تغيير الرقم', ''], ['delete-account', 'حذف الحساب', '']]],
            privacy: ['الخصوصية', [['last-seen', 'آخر ظهور ومتصل', 'الجميع'], ['profile-photo', 'صورة الملف الشخصي', 'الجميع'],
                ['groups', 'المجموعات', ctx.groupsSetting || 'الجميع'], ['blocked', 'جهات الاتصال المحظورة', ctx.blocked ? '1' : 'بلا']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>من يمكنه إضافتي إلى المجموعات</strong></p>
                <button type="button" data-tap="groups-everyone">الجميع</button><button type="button" data-tap="groups-contacts">جهات اتصالي</button>
                <button type="button" data-tap="groups-except">جهات اتصالي باستثناء…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>التحقق بخطوتين</h3><p>لمزيد من الأمان، فعّل التحقق بخطوتين، الذي سيتطلب رقم PIN عند تسجيل رقم هاتفك في WhatsApp مرة أخرى.</p>
                <button type="button" class="ce ox" data-tap="turn-on">تفعيل</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>إضافة عنوان بريد إلكتروني</h3>
                <p>أضف عنوان بريد إلكتروني لتتمكن من إعادة تعيين رقم PIN إذا نسيته.</p>
                <div class="tk ex">عنوان بريدك الإلكتروني</div>
                <button type="button" class="ce ox" data-tap="email-next">التالي</button>
                <button type="button" class="cp wd" data-tap="skip">تخطي</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>التحقق بخطوتين مفعّل</h3><p>سيُطلب منك رقم PIN إذا أعددت WhatsApp على هاتف جديد.</p>
                <button type="button" class="ce ox" data-tap="done">تم</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'أنشئ رقم PIN من 6 أرقام' : 'أكّد رقم PIN'}</strong>
            <p>${stage === 'pin' ? 'ستحتاج إليه لإعداد WhatsApp على هاتف جديد.' : 'اكتب رقم PIN نفسه مرة أخرى.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'هذه قائمة محادثاتك. لبدء محادثة جديدة، <strong>اضغط على زر المحادثة الجديدة</strong> (القلم، في أعلى اليمين).'
                          : 'هذه قائمة محادثاتك. لبدء محادثة جديدة، <strong>اضغط على الزر الأخضر +</strong> في أسفل اليمين.',
         hints: {'chat-family': 'هذا يفتح محادثة موجودة. ابدأ محادثة جديدة بدلًا من ذلك.', 'chat-jean': 'هذا يفتح محادثة موجودة. ابدأ محادثة جديدة بدلًا من ذلك.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'يعرض WhatsApp الأشخاص في جهات اتصالك الذين يستخدمونه. <strong>اضغط على Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'اكتب رسالة في المربع أولًا، ثم اضغط على سهم الإرسال.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'مرحبًا ماما! 😊 يسعدني أن أسمع منك!', n: 2}); },
         say: '<strong>اضغط على مربع الرسالة</strong> في الأسفل، <strong>واكتب رسالة قصيرة</strong> (مثل "مرحبًا!")، ثم <strong>اضغط على سهم الإرسال</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'الميكروفون للرسائل الصوتية، وهي التالية. اكتب رسالة أولًا ثم اضغط على سهم الإرسال.', attach: 'هذا للصور، وهي التالية. اكتب رسالة أولًا ثم اضغط على إرسال.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'ردّت Sarah! تحت رسالتك <strong>علامتان زرقاوان ⟦check-check⟧</strong>. ماذا تعنيان؟',
            options: [
                {t: 'فشل إرسال الرسالة', why: 'الرسالة الفاشلة تظهر معها ساعة صغيرة أو تحذير أحمر. العلامات تعني أنها نجحت.'},
                {t: 'قرأتها Sarah', ok: true, why: 'نعم! علامة رمادية واحدة تعني أنها أُرسلت، وعلامتان رماديتان تعنيان أنها وصلت إلى هاتفها، وعلامتان زرقاوان تعنيان أنها قرأتها.'},
                {t: 'أُرسلت مرتين', why: 'لا، أُرسلت مرة واحدة فقط. العلامتان الزرقاوان تعنيان أنها قُرئت.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `الآن أرسل صورة. <strong>اضغط على ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> بجانب مربع الرسالة.`,
         hints: {camera: 'الكاميرا تلتقط صورة جديدة. لإرسال صورة التقطتها سابقًا، اضغط على ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>اضغط على ${p === 'ios' ? 'الصور' : 'المعرض'}</strong> للاختيار من الصور الموجودة على هاتفك.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'هذه هي الصور (الوهمية) الموجودة على هاتفك. <strong>اضغط على عباد الشمس</strong> 🌻.',
         hint: 'اضغط على الصورة التي فيها عباد الشمس.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'رائعة! 🌻 هل هذه من حديقتك؟', n: 4}); },
         say: 'يمكنك كتابة تعليق إن شئت. ثم <strong>اضغط على سهم الإرسال</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'الرسائل الصوتية مفيدة إذا كانت الكتابة مرهقة. في الهاتف الحقيقي <strong>تضغط مطولًا على الميكروفون</strong> ⟦mic⟧ وأنت تتحدث، ثم ترفع إصبعك للإرسال. هنا، <strong>اضغط على الميكروفون مرة واحدة للبدء، ثم اضغط على سهم الإرسال</strong> لإرسالها.',
         hint: 'اضغط على الميكروفون، ثم على سهم الإرسال.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>أحسنت!</strong> لقد أرسلت رسالة وصورة ورسالة صوتية. للرد على Sarah في أي وقت، افتح WhatsApp واضغط على محادثتها.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>اضغط على محادثة Sarah</strong> لفتحها.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'في أعلى المحادثة زرّا مكالمة: <strong>كاميرا الفيديو</strong> لمكالمة فيديو و<strong>الهاتف</strong> لمكالمة صوتية. <strong>اضغط على كاميرا الفيديو</strong> ⟦video⟧.',
         hints: {voice: 'هذه مكالمة صوتية، بلا فيديو. في هذا التدريب، اضغط على كاميرا الفيديو.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'يرنّ هاتف Sarah، وعندما تردّ يرى كل منكما الآخر. إذا كان المكان صاخبًا حولك، <strong>اضغط على الميكروفون</strong> ⟦mic⟧ لكتم صوتك.',
         hint: 'زر الميكروفون في الصف الذي في الأسفل.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'صوتك مكتوم: Sarah تراك لكنها لا تسمعك. لتُريها شيئًا، <strong>اضغط على زر القلب</strong> ⟦switch-camera⟧ للتبديل إلى الكاميرا الموجودة في ظهر هاتفك.',
         hints: {mute: 'اضغط على الميكروفون مرة أخرى لاحقًا لإلغاء الكتم. الآن، جرّب زر القلب.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'الآن تستطيع Sarah أن ترى ما توجّه إليه هاتفك. عندما تنتهي، <strong>اضغط على الزر الأحمر</strong> لإنهاء المكالمة.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'مكالمات الفيديو تستهلك بيانات كثيرة. ما أفضل طريقة لإجراء واحدة؟',
            options: [
                {t: 'على Wi-Fi في المنزل، متى استطعت', ok: true, why: 'نعم. على Wi-Fi لا تستهلك المكالمات من رصيد بيانات هاتفك، فهي مجانية مهما طالت المحادثة.'},
                {t: 'لا فرق', why: 'على بيانات الهاتف، قد تستهلك مكالمة فيديو طويلة رصيدك بسرعة. Wi-Fi هو الأفضل متى استطعت.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'الآن إلى المجموعات. مجموعة العائلة فيها رسائل جديدة كثيرة، والإشعارات لا تتوقف عن الاهتزاز. <strong>اضغط على مجموعة العائلة.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'لتغيير إعدادات المجموعة، <strong>اضغط على اسمها</strong> في الأعلى.', hint: 'اضغط على كلمة "العائلة" في أعلى الشاشة.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>اضغط على كتم الإشعارات.</strong> ستظل الرسائل تصلك، لكن هاتفك لن يهتز مع كل واحدة.',
         hints: {'exit-group': '"الخروج من المجموعة" يعني مغادرتها تمامًا. الكتم ألطف: تبقى في المجموعة لكن دون اهتزاز.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'اختر المدة. <strong>اضغط على أسبوع.</strong>',
         hints: {'mute-8h': '8 ساعات تصلح أيضًا. في هذا التدريب، اضغط على أسبوع.', 'mute-always': '"دائمًا" يصلح أيضًا، لكن قد يفوتك شيء. في هذا التدريب، اضغط على أسبوع.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>أحسنت!</strong> لقد أجريت مكالمة فيديو، وكتمت صوتك، وقلبت الكاميرا، وكتمت مجموعة مزدحمة. يمكنك مع ذلك قراءة رسائل المجموعة متى شئت.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'مرحبًا!', ticks: 'read', n: 1}, {text: 'مرحبًا ماما! 😊', n: 2}],
        family: [{from: 'Jean', text: 'غداء الأحد عندنا؟ 🍗', n: 1}, {from: 'Sarah', text: 'نعم من فضلك!', n: 2}, {from: 'Dave', text: 'من سيحضر الكعكة؟ 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'إعدادات WhatsApp نفسه داخل التطبيق. <strong>اضغط على الإعدادات</strong> في أسفل اليمين.',
                hints: {'chat-unknown': 'سنتعامل مع تلك الرسالة لاحقًا. أولًا، اضغط على الإعدادات في أسفل اليمين.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'إعدادات WhatsApp نفسه داخل التطبيق. <strong>اضغط على النقاط الثلاث ⋮</strong> في أعلى اليمين.',
                hints: {'chat-unknown': 'سنتعامل مع تلك الرسالة لاحقًا. أولًا، اضغط على النقاط الثلاث في أعلى اليمين.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>اضغط على الإعدادات.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>اضغط على الحساب.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: 'يضيف <strong>التحقق بخطوتين</strong> رقم PIN يُطلب إذا حاول أي شخص إعداد WhatsApp الخاص بك على هاتف آخر. وحتى لو حصل محتال على رمزك المكوّن من 6 أرقام، فلن يستطيع الدخول. <strong>اضغط على التحقق بخطوتين.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>اضغط على تفعيل.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `اختر رقم PIN من 6 أرقام، مختلفًا عن رمز دخول هاتفك. في هذا التدريب، <strong>اكتب ${pinText}</strong>. <em>لا تكتب رقم PIN حقيقيًا هنا.</em>`,
             hint: `اكتب رقم PIN التجريبي ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>اكتب ${pinText} مرة أخرى</strong> لتأكيده.`, hint: `اكتب ${pinText} مرة أخرى.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'إضافة بريدك الإلكتروني تتيح لك إعادة تعيين رقم PIN إذا نسيته. من الجيد فعل ذلك على هاتفك الحقيقي. هنا، <strong>اضغط على التالي</strong>.',
             hints: {skip: 'يمكنك تخطيه، لكن نسيان رقم PIN قد يحرمك من الدخول. اضغط على التالي في هذا التدريب.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'التحقق بخطوتين مفعّل. <strong>اضغط على تم.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'تصلك رسالة تقول إنها من <em>"دعم WhatsApp"</em> وتطلب رقم PIN الخاص بالتحقق بخطوتين "للتحقق من حسابك". ماذا تفعل؟',
                options: [
                    {t: 'أرسله، فهو من WhatsApp', why: 'لن يراسلك WhatsApp أبدًا ليطلب رقم PIN أو رمزك. هذا محتال يحاول الاستيلاء على حسابك.'},
                    {t: 'لا ترد، واحظرهم وبلّغ عنهم', ok: true, why: 'تمامًا. لا ينبغي لأي أحد، بمن فيهم WhatsApp، أن يطلب رقم PIN أو الرمز المكوّن من 6 أرقام.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'بعد ذلك، امنع الغرباء من إضافتك إلى المجموعات. هذا في <strong>الخصوصية</strong>. <strong>اضغط على المجموعات.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'جهات اتصالي'; },
             say: '"الجميع" تعني أن أي غريب يستطيع إضافتك إلى مجموعة، وهذا ما يستغله المحتالون. <strong>اضغط على جهات اتصالي.</strong>',
             hints: {'groups-everyone': 'خيار الجميع يتيح للغرباء إضافتك إلى المجموعات، ومنها مجموعات الاحتيال. اضغط على جهات اتصالي.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'وصلتك رسالة من رقم لا تعرفه: "مرحبًا ماما، أنا! رقمي جديد…". هذا هو احتيال "مرحبًا ماما". <strong>اضغط عليها لفتحها.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'مرحبًا ماما، أنا! رقمي جديد، وهاتفي القديم تعطل. هل تستطيعين مساعدتي في دفع فاتورة؟ سأعيد لك المبلغ غدًا x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'لا ترد. يلاحظ WhatsApp أن الرقم ليس في جهات اتصالك. <strong>اضغط على حظر.</strong>',
             hints: {'add-contact': 'لا تضف محتالًا إلى جهات اتصالك. اضغط على حظر.', video: 'لا تتصل بهم. اضغط على حظر.', voice: 'لا تتصل بهم. اضغط على حظر.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'مرحبًا ماما، أنا! رقمي جديد، وهاتفي القديم تعطل. هل تستطيعين مساعدتي في دفع فاتورة؟ سأعيد لك المبلغ غدًا x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'خيار "الإبلاغ إلى WhatsApp" محدد، وهذا يساعد WhatsApp على إيقاف المحتال. <strong>اضغط على حظر.</strong>',
             hints: {cancel: 'الإلغاء سيترك لهم القدرة على مراسلتك. اضغط على حظر.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>أحسنت!</strong> لقد فعّلت التحقق بخطوتين، ومنعت الغرباء من إضافتك إلى المجموعات، وحظرت محتالًا وبلّغت عنه. وإذا ساورك شك في رسالة من أحد أفراد العائلة، فاتصل به على الرقم الذي لديك أصلًا.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'رجوع') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

    // A settings-style list page. rows: {id, label, sub, value, toggle (true/false), danger, caption}
    function list(p, title, rows, opts = {}) {
        const row = r => {
            if (r.caption) return `<div class="he">${r.caption}</div>`;
            const right = r.toggle !== undefined ? tog(r.toggle) : (r.value !== undefined ? `<span class="kz">${r.value}</span>` : (r.id && p === 'ios' ? '<span class="ne">›</span>' : ''));
            const text = `<span class="hf"><strong${r.danger ? ' class="lk"' : ''}>${r.label}</strong>${r.sub ? `<small>${r.sub}</small>` : ''}</span>`;
            return r.id ? `<button type="button" class="cj" data-tap="${r.id}">${text}${right}</button>` : `<div class="cj ex">${text}${right}</div>`;
        };
        const body = p === 'ios'
            ? (() => {  // group rows between captions
                const out = []; let group = [];
                const flush = () => { if (group.length) out.push(`<div class="ge">${group.join('')}</div>`); group = []; };
                rows.forEach(r => { if (r.caption) { flush(); out.push(row(r)); } else group.push(row(r)); });
                flush();
                return out.join('');
            })()
            : rows.map(row).join('');
        return `<div class="iw ${p}">${statusBar(p)}<div class="fr">
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'رجوع')}<strong>${title}</strong></div>
            ${opts.top || ''}${body}${opts.bottom || ''}</div>
            ${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }

    // A full-screen app page with a coloured header bar.
    function app(p, title, inner, opts = {}) {
        const light = ['#fff', '#f2f2f7', '#f8fafc'].includes(opts.color);
        return `<div class="cg gg ph-${p}${light ? ' aiv' : ' pg'}" style="--app:${opts.color || '#0a6cf2'}">${statusBar(p)}
            <div class="ie">${opts.back === false ? '' : '<button type="button" class="aec" data-tap="back" aria-label="Back">‹</button>'}<strong>${title}</strong>${opts.right || ''}</div>
            <div class="ko">${inner}</div>${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }

    const dialog = (p, title, text, buttons) => `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
        <p><strong>${title}</strong></p>${text ? `<p class="fd">${text}</p>` : ''}
        <div class="et${buttons.length > 2 ? ' ahq' : ''}">${buttons.map(([id, label]) => `<button type="button" data-tap="${id}">${label}</button>`).join('')}</div></div></div>`;

    const field = (name, placeholder, ctx, type = 'text') => `<label class="eq"><span class="f">${placeholder}</span>
        <input type="${type}" data-input="${name}" placeholder="${placeholder}" value="${esc((ctx.input && ctx.input[name]) || '')}" autocomplete="off"></label>`;
    const typed = (c, name) => ((c.input && c.input[name]) || '').trim();
    const ICON2 = {
        magnifier: LU('zoom-in'),
        heart: LU('heart'),
        pound: LU('pound-sterling'),
        train: LU('train-front'),
        wallet: LU('wallet'),
        find: LU('locate-fixed'),
        contacts: LU('contact'),
        video: LU('video'),
        health: LU('heart-pulse', 'afl'),
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">التطبيقات التي تدعم Dynamic Type ستضبط نفسها على حجم القراءة الذي تفضله.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'حجم النص', [], {top: slider, back: 'الشاشة'});
        return list(p, 'حجم الشاشة والنص', [{caption: 'حجم الخط'}, {id: 'bold', label: 'نص غامق', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'حجم النص موجود في تطبيق <strong>الإعدادات</strong>. <strong>اضغط على الإعدادات.</strong>', hint: 'الإعدادات هي الأيقونة الرمادية التي عليها ترس.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>اضغط على شاشة العرض والإضاءة.</strong>', hint: 'إنه في المجموعة الثالثة، تحت تسهيلات الاستخدام.'},
        {screen: c => list(p, 'شاشة العرض والإضاءة', [{caption: 'المظهر'}, {label: 'فاتح', value: '⟦check⟧'}, {caption: 'النص'}, {id: 'text-size', label: 'حجم النص'}, {id: 'bold', label: 'النص العريض', toggle: !!c.bold}], {back: 'الإعدادات'}),
         target: 'text-size', say: '<strong>اضغط على حجم النص.</strong>', hints: {bold: 'النص العريض يأتي بعد ذلك. أولًا، اضغط على حجم النص.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'اسحب شريط التمرير إلى اليمين لتكبير الكتابة. هنا، <strong>اضغط على حرف A الكبير مرتين</strong> وشاهد النص يكبر.', hint: 'اضغط على حرف A الكبير على يمين شريط التمرير.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'أسهل بكثير في القراءة! الآن <strong>اضغط على ‹ الشاشة</strong> في الأعلى للرجوع.'},
        {screen: c => list(p, 'شاشة العرض والإضاءة', [{caption: 'المظهر'}, {label: 'فاتح', value: '⟦check⟧'}, {caption: 'النص'}, {id: 'text-size', label: 'حجم النص'}, {id: 'bold', label: 'النص العريض', toggle: !!c.bold}], {back: 'الإعدادات'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>النص العريض</strong> يجعل الحروف أسمك وأوضح. <strong>اضغط عليه لتفعيله.</strong>'},
        {screen: c => list(p, 'شاشة العرض والإضاءة', [{caption: 'النص'}, {label: 'حجم النص'}, {label: 'النص العريض', toggle: true}], {back: 'الإعدادات'}),
         question: {q: 'هل لا يزال النص صغيرًا حتى مع أكبر حجم؟', options: [
            {t: 'لا يمكن فعل شيء آخر', why: 'هناك المزيد! الإعدادات > تسهيلات الاستخدام > شاشة العرض وحجم النص > نص أكبر تعطي أحجامًا أكبر بعد.'},
            {t: 'الإعدادات > تسهيلات الاستخدام > شاشة العرض وحجم النص > نص أكبر', ok: true, why: 'نعم. فعّل أحجام تسهيلات الاستخدام الأكبر هناك للحصول على نص كبير جدًا.'}]}},
        {screen: c => list(p, 'شاشة العرض والإضاءة', [{caption: 'النص'}, {label: 'حجم النص'}, {label: 'النص العريض', toggle: true}], {back: 'الإعدادات'}), done: true,
         say: '<strong>أحسنت!</strong> أصبح نصك أكبر وأغمق، في الإعدادات وفي معظم التطبيقات.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'حجم النص موجود في تطبيق <strong>الإعدادات</strong>. <strong>اضغط على الإعدادات.</strong>', hint: 'الإعدادات هي الأيقونة التي عليها ترس.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>اضغط على الشاشة واللمس.</strong> <em>في Samsung تسمى الشاشة، ثم حجم الخط ونمطه.</em>'},
        {screen: () => list(p, 'الشاشة واللمس', [{id: 'dark', label: 'السمة الداكنة', toggle: false}, {id: 'text-size', label: 'حجم الشاشة والنص', sub: 'حجم الخط، النص الغامق'}, {id: 'brightness', label: 'مستوى السطوع', value: '70%'}]),
         target: 'text-size', say: '<strong>اضغط على حجم الشاشة والنص.</strong>', hints: {dark: 'السمة الداكنة تغيّر الألوان لا الحجم. اضغط على حجم الشاشة والنص.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'اسحب شريط حجم الخط إلى اليمين لتكبير الكتابة. هنا، <strong>اضغط على حرف A الكبير مرتين</strong>.', hint: 'اضغط على حرف A الكبير على يمين شريط التمرير.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>النص الغامق</strong> يجعل الحروف أوضح. <strong>اضغط عليه لتفعيله.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'هل لا يزال النص صغيرًا حتى مع أكبر حجم؟', options: [
            {t: 'لا يمكن فعل شيء آخر', why: 'جرّب حجم الشاشة أيضًا، في الصفحة نفسها: فهو يكبّر كل شيء، بما في ذلك الأزرار والأيقونات.'},
            {t: 'كبّر حجم الشاشة أيضًا', ok: true, why: 'نعم. حجم الشاشة يكبّر كل ما على الشاشة، لا النص فقط.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>أحسنت!</strong> أصبح نصك أكبر وأغمق، في الإعدادات وفي معظم التطبيقات.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' على خلفية بنفسجية' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'عدم الإزعاج' : 'التركيز'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'عدم الإزعاج · مفعّل' : 'عدم الإزعاج · متوقف'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'اسحب للأعلى للإغلاق' : 'إغلاق'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'إذا لم يرنّ هاتفك، فقد يكون وضع عدم الإزعاج مفعّلًا. الإعدادات السريعة في <strong>مركز التحكم</strong>: <strong>اسحب لأسفل من الزاوية العلوية اليمنى</strong> (أو اضغط على الشريط في الأعلى).'
                          : 'إذا لم يرنّ هاتفك، فقد يكون وضع عدم الإزعاج مفعّلًا. <strong>اسحب لأسفل من أعلى الشاشة</strong> لترى الإعدادات السريعة (أو اضغط على الشريط في الأعلى).',
         hints: {'pull-up': 'اسحب في الاتجاه الآخر: لأسفل من الأعلى.', 'pull-left': 'اسحب لأسفل، لا إلى الجانب.', 'pull-right': 'اسحب لأسفل، لا إلى الجانب.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `القمر ⟦moon⟧ يعني أن <strong>عدم الإزعاج مفعّل</strong>، فتُكتم المكالمات والرسائل. <strong>اضغط عليه لإيقافه.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'الآن ارفع مستوى الصوت بـ<strong>زر الصوت على جانب هاتفك</strong> (الزر العلوي). <strong>اضغط على ＋ على حافة الهاتف التجريبي 3 مرات.</strong>',
         hint: 'اضغط على الزر ＋ على الحافة اليمنى للهاتف.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'ما زال iPhone لا يرنّ. ما الذي قد يكون السبب أيضًا؟', options: [
                {t: 'مفتاح الرنين/الصامت أو زر الإجراء مضبوط على الصامت', ok: true, why: 'نعم. في كثير من أجهزة iPhone مفتاح صغير فوق أزرار الصوت: إذا ظهر لونه برتقاليًا فالهاتف على الصامت. وفي الأحدث يُستخدم زر الإجراء بدلًا منه.'},
                {t: 'الهاتف معطّل', why: 'عادةً لا! تحقق أولًا من مفتاح الصامت فوق أزرار الصوت.'}]}
            : {q: 'ضغطت على زر الصوت لكنه غيّر مستوى صوت الوسائط فقط. ماذا الآن؟', options: [
                {t: 'اضغط على ⋯ أو أيقونة الإعدادات في شريط الصوت لترى مستوى صوت الرنين', ok: true, why: 'نعم. أزرار الصوت تغيّر غالبًا مستوى صوت الوسائط؛ اضغط على النقاط الثلاث في شريط الصوت لتغيير مستوى صوت الرنين.'},
                {t: 'أستسلم', why: 'اضغط على النقاط الثلاث ⋯ في شريط الصوت الذي يظهر، وارفع مستوى صوت الرنين.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>أحسنت!</strong> وضع عدم الإزعاج متوقف ومستوى الصوت مرتفع، فستسمع المكالمات والرسائل.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>باراسيتامول 500 ملغ</strong><br>تناول قرصًا أو قرصين كل 4 إلى 6 ساعات.<br>لا تتناول أكثر من 8 أقراص في 24 ساعة.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'المكبّر', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'في iPhone تطبيق <strong>المكبّر</strong>. إذا لم يكن على شاشتك الرئيسية، فاسحب لأسفل في وسط الشاشة واكتب "المكبّر". <strong>اضغط على المكبّر.</strong>'
                          : 'في كثير من هواتف Android تطبيق <strong>المكبّر</strong>. <em>في Samsung يوجد في الإعدادات السريعة أو في تسهيلات الاستخدام.</em> <strong>اضغط على المكبّر.</strong>',
         hint: 'ابحث عن الأيقونة السوداء التي عليها عدسة مكبّرة.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'وجّه هاتفك نحو شيء صغير، مثل ملصق هذا الدواء. <strong>اضغط على ＋ ثلاث مرات</strong> للتكبير (في الهاتف الحقيقي يمكنك سحب شريط التمرير).', hint: 'اضغط على ＋ على يمين شريط التمرير.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'في الإضاءة الخافتة، يفيدك المصباح. <strong>اضغط على المصباح</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'هل يدك ترتجف قليلًا؟ <strong>اضغط على الزر المستدير الكبير</strong> لتثبيت الصورة، فتقرأها دون أن تضطر إلى تثبيت يدك.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'فيمَ يفيد المكبّر أيضًا؟', options: [
            {t: 'قراءة قوائم الطعام وملصقات الأسعار والحروف الصغيرة في الرسائل', ok: true, why: 'نعم، وهو دائمًا في جيبك. يضعه بعض الناس في مركز التحكم أو الإعدادات السريعة للوصول إليه بضغطة واحدة.'},
            {t: 'رفع صوت المكالمات', why: 'هذه وظيفة أزرار الصوت. المكبّر مخصص لرؤية الأشياء الصغيرة بوضوح أكبر.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>أحسنت!</strong> أصبح بإمكانك الآن تكبير الحروف الصغيرة، وإضاءتها، وتثبيت الصورة.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'أراك في صباح القهوة يوم الخميس' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>هل ستأتين يوم الخميس؟ ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">رسالة نصية</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ جارٍ الاستماع… تحدّث الآن</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'يمكنك التحدث بدلًا من الكتابة. <strong>افتح الرسائل.</strong>', hint: 'الرسائل هي فقاعة الكلام الخضراء.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'سألت Jean عن يوم الخميس. <strong>اضغط على مربع الرسالة</strong> في الأسفل.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'تظهر لوحة المفاتيح. <strong>اضغط على الميكروفون</strong> ⟦mic⟧ على لوحة المفاتيح، ثم قل رسالتك.', hint: 'الميكروفون على لوحة المفاتيح، بجانب مفتاح المسافة.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'في الهاتف الحقيقي ستقول الآن: <em>"أراك في صباح القهوة يوم الخميس"</em>. تظهر الكلمات وأنت تتحدث. راجعها، ثم <strong>اضغط على إرسال</strong> ⟦send-horizontal⟧.',
         hint: 'انتظر حتى تظهر الكلمات، ثم اضغط على سهم الإرسال.'},
        {screen: () => home(p), target: 'settings',
         say: 'يستطيع هاتفك أيضًا <strong>قراءة الأشياء لك بصوت عالٍ</strong>. لنفعّل ذلك. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>اضغط على تسهيلات الاستخدام.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'إمكانية الوصول', [{caption: 'الرؤية'}, {id: 'voiceover', label: 'VoiceOver', value: 'إيقاف'}, {id: 'zoom', label: 'التكبير', value: 'إيقاف'}, {id: 'spoken', label: 'المحتوى المنطوق'}], {back: 'الإعدادات'})
            : list(p, 'إمكانية الوصول', [{id: 'select-speak', label: 'Select to Speak', sub: 'إيقاف'}, {id: 'talkback', label: 'TalkBack', sub: 'إيقاف'}, {id: 'magnification', label: 'التكبير'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>اضغط على المحتوى المنطوق.</strong>' : '<strong>اضغط على Select to Speak.</strong>',
         hints: {voiceover: 'VoiceOver يغيّر طريقة عمل الهاتف كله، وقد يكون ذلك مربكًا. اضغط على المحتوى المنطوق.', talkback: 'TalkBack يغيّر طريقة عمل الهاتف كله، وقد يكون ذلك مربكًا. اضغط على Select to Speak.'}},
        {screen: c => p === 'ios'
            ? list(p, 'المحتوى المنطوق', [{id: 'speak-selection', label: 'نطق التحديد', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'نطق الشاشة', toggle: !!c.speakScreen, sub: 'اسحب لأسفل بإصبعين من أعلى الشاشة لتسمعها تُقرأ بصوت عالٍ.'}], {back: 'إمكانية الوصول'})
            : list(p, 'Select to Speak', [{id: 'speak-screen', label: 'استخدم Select to Speak', toggle: !!c.speakScreen, sub: 'اضغط على الاختصار، ثم اضغط على أي شيء على الشاشة لتسمعه يُقرأ بصوت عالٍ.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>فعّل نطق الشاشة.</strong> بعدها، في أي مكان على هاتفك، السحب لأسفل من الأعلى بإصبعين يقرأ الشاشة بصوت عالٍ.' : '<strong>فعّل استخدام Select to Speak.</strong> يظهر زر اختصار صغير: اضغط عليه، ثم اضغط على أي نص لتسمعه.',
         hints: {'speak-selection': 'هذا يقرأ الكلمات التي تحددها فقط. نطق الشاشة أسهل: فعّله.'}},
        {screen: c => p === 'ios'
            ? list(p, 'المحتوى المنطوق', [{label: 'نطق التحديد', toggle: false}, {label: 'نطق الشاشة', toggle: true}], {back: 'إمكانية الوصول'})
            : list(p, 'Select to Speak', [{label: 'استخدم Select to Speak', toggle: true}]), done: true,
         say: '<strong>أحسنت!</strong> أصبح بإمكانك الآن التحدث بدلًا من الكتابة، وجعل هاتفك يقرأ لك الأشياء بصوت عالٍ.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'يمكن لكثير من السماعات الطبية الاتصال بهاتفك، فتذهب المكالمات والموسيقى مباشرة إليها. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>اضغط على تسهيلات الاستخدام.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'إمكانية الوصول', [{caption: 'السمع'}, {id: 'hearing-devices', label: 'الأجهزة السمعية'}, {id: 'live-captions', label: 'التعليقات المباشرة', value: c.captions ? 'مفعّل' : 'إيقاف'}, {id: 'subtitles', label: 'الترجمة والتعليقات'}], {back: 'الإعدادات'})
            : list(p, 'إمكانية الوصول', [{id: 'hearing-devices', label: 'السماعات الطبية', sub: c.paired ? 'متصل' : 'غير متصل'}, {id: 'live-captions', label: 'التعليقات المباشرة', sub: c.captions ? 'مفعّل' : 'إيقاف'}, {id: 'sound-amp', label: 'مضخّم الصوت'}]),
         target: 'hearing-devices', say: `<strong>اضغط على ${p === 'ios' ? 'الأجهزة السمعية' : 'السماعات الطبية'}.</strong> ضع سماعاتك الطبية أولًا، وأغلق أبواب بطارياتها لإعادة تشغيلها، ليتمكن الهاتف من العثور عليها.`,
         hints: {'live-captions': 'التعليقات تأتي بعد ذلك. أولًا، صِل السماعات الطبية.'}},
        {screen: c => list(p, p === 'ios' ? 'الأجهزة السمعية' : 'السماعات الطبية', [{caption: p === 'ios' ? 'أجهزة سمعية MFI' : 'الأجهزة المتاحة'}, {id: 'aids', label: 'السماعات الطبية الخاصة بـ Margaret', sub: 'اليسرى واليمنى'}],
            {overlay: c.pairing ? dialog(p, 'هل تريد الاقتران بـ "السماعات الطبية الخاصة بـ Margaret"؟', 'ستُستخدم للمكالمات والصوت.', [['cancel', 'إلغاء'], ['pair', 'اقتران']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'يعثر هاتفك عليها. <strong>اضغط على سماعاتك الطبية.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'الأجهزة السمعية' : 'السماعات الطبية', [{id: 'aids', label: 'السماعات الطبية الخاصة بـ Margaret', sub: 'اليسرى واليمنى'}],
            {overlay: dialog(p, 'هل تريد الاقتران بـ "السماعات الطبية الخاصة بـ Margaret"؟', 'ستُستخدم للمكالمات والصوت.', [['cancel', 'إلغاء'], ['pair', 'اقتران']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>اضغط على اقتران.</strong> (مع سماعتين طبيتين، قد يسألك هاتفك مرتين، مرة لكل واحدة.)'},
        {screen: c => list(p, p === 'ios' ? 'الأجهزة السمعية' : 'السماعات الطبية', [{label: 'السماعات الطبية الخاصة بـ Margaret', sub: 'متصل ⟦check⟧'}]), target: 'back',
         say: 'تم الاتصال! ستُسمع المكالمات الآن عبر سماعاتك الطبية. <strong>اضغط على رجوع.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'إمكانية الوصول', [{caption: 'السمع'}, {id: 'hearing-devices', label: 'الأجهزة السمعية'}, {id: 'live-captions', label: 'التعليقات المباشرة', value: c.captions ? 'مفعّل' : 'إيقاف'}], {back: 'الإعدادات'})
            : list(p, 'إمكانية الوصول', [{id: 'hearing-devices', label: 'السماعات الطبية', sub: 'متصل'}, {id: 'live-captions', label: 'التعليقات المباشرة', sub: c.captions ? 'مفعّل' : 'إيقاف'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'التعليقات المباشرة' : 'التعليقات المباشرة'}</strong> يعرض الكلمات على الشاشة لأي شيء يُقال: الفيديوهات والمكالمات والرسائل الصوتية. <strong>اضغط عليه لتفعيله.</strong>`},
        {screen: c => list(p, 'إمكانية الوصول', [{label: p === 'ios' ? 'التعليقات المباشرة' : 'التعليقات المباشرة', toggle: true}, {label: 'السماعات الطبية', sub: 'متصل'}]), done: true,
         say: '<strong>أحسنت!</strong> سماعاتك الطبية متصلة، وتظهر الكلمات المنطوقة الآن كتعليقات مكتوبة.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['نملة', 'غرير', 'قطة', 'كلب', 'نسر', 'ثعلب', 'ماعز', 'قنفذ', 'أبو منجل', 'غراب الدعد', 'رفراف', 'حمل', 'خلد',
                     'سمندل مائي', 'قضاعة', 'ببغاء البحر', 'أبو الحناء', 'فقمة', 'ضفدع', 'فأر الحقل', 'سنقر', 'حمار وحشي'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>اضغط مطولًا على الزهرة</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>نسخ</span><span>مشاركة</span><span>حذف</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>حمار وحشي</h3><p>للحمار الوحشي خطوط سوداء وبيضاء. ولا يوجد حماران وحشيان لهما النمط نفسه تمامًا.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>الضغط</strong> يعني لمس الشاشة بخفة بإصبع واحد ثم رفعه فورًا، كأنك تضغط على زر. <strong>اضغط على النجمة.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>الضغط المطوّل</strong> يعني إبقاء إصبعك على شيء ما لثانية أو ثانيتين. وهو يُظهر عادةً خيارات إضافية. <strong>اضغط مطولًا على الزهرة</strong> حتى يحدث شيء. (مع الفأرة، أبقِ الزر مضغوطًا.)',
         hint: 'أبقِ إصبعك على الزهرة لثانية أو ثانيتين.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'ظهرت قائمة. ماذا يفعل الضغط المطوّل عادةً؟', options: [
            {t: 'يُظهر خيارات إضافية، مثل النسخ أو المشاركة أو الحذف', ok: true, why: 'نعم. الضغط المطوّل على الرسائل والصور والتطبيقات يُظهر خيارات مثل هذه.'},
            {t: 'يحذف الأشياء فورًا', why: 'لا، هو يُظهر قائمة خيارات فقط. ولا يحدث شيء حتى تختار أحدها.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>السحب الجانبي</strong> يعني تحريك إصبعك عبر الشاشة، كأنك تقلّب صفحة. <strong>اسحب إلى اليسار على الصورة مرتين</strong> لترى التالية. (مع الفأرة، انقر واسحب ثم اترك.)',
         hint: 'حرّك إصبعك من اليمين إلى اليسار عبر الصورة. أو استخدم زر "لا تستطيع السحب؟".'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>التمرير</strong> يعني تحريك إصبعك لأعلى الشاشة لرؤية المزيد من قائمة، مثل هذه. <strong>مرّر للأسفل واضغط على حمار وحشي</strong>، في أسفل القائمة تمامًا. (مع الفأرة، استخدم عجلة التمرير.)',
         hint: 'حرّك القائمة للأعلى بإصبعك لتصل إلى حمار وحشي في الأسفل.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'للرجوع صفحة في iPhone، <strong>اضغط على ‹ رجوع</strong> في أعلى اليسار (أو اسحب من حافة الشاشة اليسرى إلى الداخل).' : 'للرجوع صفحة في Android، <strong>اضغط على سهم الرجوع ◁</strong> في الأسفل (أو اسحب من حافة الشاشة اليسرى أو اليمنى إلى الداخل).',
         hints: {'home-pill': 'هذا يعود بك إلى الشاشة الرئيسية مباشرة. اضغط على سهم الرجوع ◁ بدلًا منه.', 'home-bar': 'هذا يعود بك إلى الشاشة الرئيسية مباشرة. اضغط على ‹ رجوع بدلًا منه.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'للانتقال إلى شاشتك الرئيسية من أي مكان، <strong>اسحب للأعلى من الشريط</strong> في أسفل الشاشة (أو اضغط على الشريط هنا). في أجهزة iPhone الأقدم التي فيها زر الصفحة الرئيسية المستدير: اضغط عليه.'
                          : 'للانتقال إلى شاشتك الرئيسية من أي مكان، <strong>اضغط على دائرة الصفحة الرئيسية ○</strong> في الأسفل (أو اسحب للأعلى من الحافة السفلية).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': '"رجوع" يعود صفحة واحدة. اضغط على دائرة الصفحة الرئيسية ○ للعودة إلى الشاشة الرئيسية.'}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> لقد تدرّبت على الضغط والضغط المطوّل والسحب الجانبي والتمرير والرجوع والعودة إلى الشاشة الرئيسية: حركات ستستخدمها كل يوم.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'متصل', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'الإنترنت', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'الشبكات' : 'الشبكات المتاحة'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'الإعدادات',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>أدخل كلمة المرور لـ "BT-Hub-7F2A"</strong></p>
                ${field('wifipass', 'كلمة مرور', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'انضمام' : 'اتصال'}</button>
                <button type="button" class="cp" data-tap="cancel">إلغاء</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'استخدام Wi-Fi في المنزل يوفّر بيانات هاتفك. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>اضغط على Wi-Fi</strong>، قرب الأعلى.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>اضغط على الشبكة والإنترنت.</strong> <em>في Samsung تسمى الاتصالات، ثم Wi-Fi.</em>'},
               {screen: () => list(p, 'الشبكة والإنترنت', [{id: 'internet', label: 'الإنترنت', sub: 'Wi-Fi وبيانات الهاتف'}, {id: 'sims', label: 'شرائح SIM'}, {id: 'hotspot', label: 'نقطة الاتصال والربط'}]),
                target: 'internet', say: '<strong>اضغط على الإنترنت.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'اسم شبكة Wi-Fi وكلمة مرورها يكونان عادةً على ملصق خلف الراوتر (الصندوق ذي الأضواء). ملصق هذا الراوتر التجريبي يقول:<br><span class="ahd">الشبكة: <strong>BT-Hub-7F2A</strong><br>كلمة المرور: <strong>Green-Apple-42</strong></span><strong>اضغط على BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'هذه شبكة Wi-Fi لأحد الجيران. ابحث عن الاسم الموجود على ملصقك: BT-Hub-7F2A.', 'net-sky-12345': 'هذه شبكة Wi-Fi لشخص آخر. ابحث عن الاسم الموجود على ملصقك: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'يجب أن تطابق كلمة المرور الملصق تمامًا، بما في ذلك الأحرف الكبيرة والشرطات: Green-Apple-42',
         say: 'اكتب كلمة المرور <strong>تمامًا</strong> كما هي على الملصق: <strong>Green-Apple-42</strong>. الأحرف الكبيرة مهمة! ثم <strong>اضغط على انضمام</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'تم الاتصال! سينضم هاتفك إلى شبكة Wi-Fi هذه من تلقاء نفسه كلما كنت في المنزل. هل من الآمن استخدام Wi-Fi مجاني في مقهى؟', options: [
            {t: 'نعم، للتصفح، لكن تجنّب الخدمات المصرفية عبر الإنترنت عليه', ok: true, why: 'تمامًا. شبكة Wi-Fi العامة مناسبة لقراءة الأخبار أو معرفة موعد الحافلة. أما للبنك، فاستخدم بيانات هاتفك أو Wi-Fi المنزل.'},
            {t: 'نعم، لكل شيء', why: 'قد يراقب آخرون شبكة Wi-Fi العامة. لا بأس بها للتصفح، لكن استخدم بيانات هاتفك أو Wi-Fi المنزل للبنك.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>أحسنت!</strong> أنت متصل بـ Wi-Fi. ابحث عن رمز Wi-Fi المروحي الشكل في أعلى شاشتك.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'جهة اتصال جديدة' : 'إنشاء جهة اتصال', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'الاسم الأول', ctx)}<span class="se">Mobile number</span>${field('cnum', 'رقم الهاتف المحمول', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'تم' : 'حفظ'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'جهة الاتصال', [
        {label: 'محمول', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'إضافة إلى المفضلة' : (ctx.fav ? '⟦star⟧ مفضلة' : '⟦star⟧ إضافة إلى المفضلة')},
        {id: 'share', label: 'مشاركة جهة الاتصال'}], {back: 'جهات الاتصال'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'جهات الاتصال', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'حفظ رقم شخص ما يتيح لك الاتصال به بالاسم. في iPhone توجد جهات الاتصال في تطبيق <strong>الهاتف</strong>. <strong>اضغط على الهاتف.</strong>' : '<strong>اضغط على جهات الاتصال.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'جهات الاتصال', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'جهات الاتصال', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'هذه قائمة جهات اتصالك. <strong>اضغط على +</strong> في أعلى اليمين لإضافة شخص.' : 'هذه قائمة جهات اتصالك. <strong>اضغط على الزر +</strong> لإضافة شخص.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'اكتب اسمًا أول، ورقم التدريب 07700 900456، ثم اضغط ' + (p === 'ios' ? 'تم.' : 'حفظ.'),
         say: `اكتب <strong>الاسم الأول</strong> للشخص (جرّب "Ann")، ورقمه. للتدريب، استخدم <strong>07700 900456</strong>. ثم <strong>اضغط على ${p === 'ios' ? 'تم' : 'حفظ'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'تم الحفظ! المفضلة هم الأشخاص الذين تتصل بهم أكثر، ويظهرون في الأعلى للاتصال بضغطة واحدة. <strong>اضغط على ' + (p === 'ios' ? 'إضافة إلى المفضلة' : 'النجمة') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'أي جهة اتصال يستحق حفظها مع "ICE" (في حالة الطوارئ) أمام اسمها؟', options: [
            {t: 'أقرب أقربائك، مثل "ICE Sarah"', ok: true, why: 'نعم. يعرف المسعفون أن يبحثوا عن ICE. والأفضل أيضًا أن تضيف جهة اتصال للطوارئ إلى هويتك الطبية، كما في دورة حماية هاتفك.'},
            {t: 'مصرفك', why: 'ICE للشخص الذي يُتصل به إذا حدث لك شيء، وعادةً يكون أقرب أقربائك.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>أحسنت!</strong> لقد حفظت جهة اتصال وجعلتها من المفضلة.'},
    ], {input: {}});

    function incoming(p) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('J', '#a78bfa')}<strong>Jean</strong><small>mobile</small></div>
            <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
    }
    function inCall(p, ctx, who = 'Jean') {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar(who[0], '#a78bfa')}<strong>${who}</strong><small>${ctx.busy ? 'calling…' : '0:42'}</small></div>
            <div class="if"><button type="button" data-tap="mute">${UI.mic}<span>mute</span></button><button type="button" data-tap="keypad">${UI.keypad}<span>keypad</span></button>
                <button type="button" data-tap="speaker" class="${ctx.speaker ? 'on' : ''}">${UI.speaker}<span>speaker</span></button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }
    const recents = p => app(p, 'الأخيرة', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'هاتفك يرنّ: Jean تتصل. <strong>اضغط على الزر الأخضر للرد.</strong>' + (p === 'android' ? ' <em>في بعض هواتف Android تسحب الزر الأخضر للأعلى بدلًا من ذلك.</em>' : ' <em>إذا كان iPhone مقفلًا، فإنك تسحب الزر الأخضر عبر الشاشة بدلًا من ذلك.</em>'),
         hints: {decline: 'الأحمر يرفض المكالمة. اضغط على الأخضر للرد.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'أنت تتحدث! لتسمع بشكل أفضل، أو لتتحدث دون استخدام اليدين، <strong>اضغط على مكبّر الصوت</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'عندما تنتهي، <strong>اضغط على الزر الأحمر</strong> لإنهاء المكالمة.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'فاتتك مكالمة من Dave قبل قليل. تظهر المكالمات الفائتة باللون <strong>الأحمر</strong> في مكالماتك الأخيرة. <strong>اضغط على Dave</strong> للاتصال به.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'جارٍ الاتصال بـ Dave. عندما تنتهي من الحديث، <strong>اضغط على الزر الأحمر</strong> لإنهاء المكالمة.'},
        {screen: () => recents(p), question: {q: 'يتصل بك شخص من رقم لا تعرفه، ويقول إنه من مصرفك. ماذا تفعل؟', options: [
            {t: 'أنهِ المكالمة واتصل بالرقم 159 للوصول إلى مصرفك بأمان', ok: true, why: 'تمامًا. يمكنك دائمًا إنهاء المكالمة والاتصال برقم تثق به. الرقم 159 يوصلك بمصرفك أنت.'},
            {t: 'افعل ما يقولون، فهو المصرف', why: 'ينتحل المحتالون صفة المصارف طوال الوقت، ويمكن تزوير الرقم. أنهِ المكالمة واتصل بالرقم 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع الرد، واستخدام مكبّر الصوت، وإنهاء المكالمة، ومعاودة الاتصال بالمكالمات الفائتة.'},
    ], {});

    function smsList(p) {
        return app(p, 'الرسائل', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>كان آخر فحص لك في مارس. احجز عبر الإنترنت أو اتصل بنا.</span><small>قبل 3 أشهر</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'رسالة نصية', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'الرسائل النصية في تطبيق <strong>الرسائل</strong>. <strong>اضغط على الرسائل.</strong>', hint: 'إنها أيقونة فقاعة الكلام.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'تظهر الرسائل الجديدة بخط غامق. <strong>اضغط على الرسالة من طبيب الأسنان</strong> لقراءتها.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'اكتب Y في مربع الرسالة أولًا، ثم اضغط على سهم الإرسال.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'يطلب منك طبيب الأسنان الرد بالحرف <strong>Y</strong> للتأكيد. <strong>اضغط على مربع الرسالة، واكتب Y، ثم اضغط على سهم الإرسال</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'تم! الآن رتّب: <strong>اضغط مطولًا على الرسالة القديمة</strong> في الأعلى (أبقِ إصبعك عليها لثانية أو ثانيتين).', hint: 'أبقِ إصبعك على الرسالة القديمة في الأعلى حتى تظهر قائمة.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'تظهر قائمة. <strong>اضغط على حذف.</strong>',
         hints: {copy: '"نسخ" ينسخ الكلمات. اضغط على حذف.', forward: '"إعادة توجيه" ترسلها إلى شخص آخر. اضغط على حذف.'}},
        {screen: c => smsChat(p, c), question: {q: 'رسالة نصية من رقم مجهول تقول إن طردك محتجز وتطلب منك دفع 1.45 جنيه إسترليني عبر رابط. ماذا تفعل؟', options: [
            {t: 'لا تضغط على الرابط. أعد توجيهها إلى 7726، ثم احذفها', ok: true, why: 'تمامًا. الرقم 7726 مجاني ويبلّغ شبكتك بها. شركات التوصيل لا ترسل روابط نصية تطلب رسومًا.'},
            {t: 'ادفعها، فهي 1.45 جنيه فقط', why: 'مبلغ 1.45 جنيه طُعم للحصول على بيانات بطاقتك. لا تضغط على الرابط: أعد توجيهها إلى 7726 واحذفها.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع قراءة الرسائل النصية والرد عليها، وحذف ما لا تحتاج إليه.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['الخرائط', 15], ['WhatsApp', 9], ['الكاميرا', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'البطارية', [{id: 'low-power', label: 'وضع توفير الطاقة', toggle: saver, sub: 'يقلل النشاط في الخلفية إلى أن تتمكن من الشحن الكامل.'}, {caption: 'استخدام البطارية حسب التطبيق'}], {back: 'الإعدادات', top: head, bottom: apps})
            : list(p, 'البطارية', [{id: 'low-power', label: 'موفّر البطارية', toggle: saver, sub: 'يوقف بعض الميزات لتدوم البطارية أطول.'}, {caption: 'استخدام البطارية'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'البطارية توشك أن تنفد؟ <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>اضغط على البطارية.</strong>', hint: p === 'ios' ? 'البطارية في المجموعة الثالثة.' : 'البطارية في القائمة، بعد الإشعارات.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `بطاريتك على 23%. <strong>${p === 'ios' ? 'وضع توفير الطاقة' : 'موفّر البطارية'}</strong> يجعلها تدوم أطول. <strong>اضغط عليه لتفعيله.</strong> يتحول رمز البطارية إلى ${p === 'ios' ? 'yellow' : 'orange'} لتذكيرك.`},
        {screen: c => batteryPage(p, c), question: {q: 'تُظهر القائمة أن Facebook استخدم أكبر قدر من البطارية اليوم. ما الذي يساعد البطارية على الدوام أطول؟', options: [
            {t: 'خفض سطوع الشاشة، وإغلاق التطبيقات التي انتهيت منها', ok: true, why: 'نعم. الشاشة تستهلك أكبر قدر من الطاقة. اخفض السطوع، فتطبيقات مثل Facebook وYouTube تستهلك الكثير.'},
            {t: 'اشحنه إلى 100% كل ساعة', why: 'الشحن المتكرر لا يضر، لكنه لا يجعلها تدوم أطول. اخفض السطوع واستخدم وضع توفير البطارية.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>أحسنت!</strong> توفير البطارية مفعّل، وأنت تعرف التطبيقات الأكثر استهلاكًا للطاقة.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'محمول · 3 مكالمات' : 'يُشتبه بأنه مزعج · 3 مكالمات'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'الأخيرة', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>محمول</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>محمول</small><span>أمس</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'الرقم المجهول نفسه يتصل بك باستمرار. لنحظره. <strong>افتح تطبيق الهاتف.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `في مكالماتك الأخيرة، <strong>اضغط على ⓘ</strong> بجانب الرقم 07700 900842${p === 'android' ? ' (في بعض هواتف Android، اضغط على الرقم نفسه)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'مشاركة جهة الاتصال'}, {id: 'block', label: p === 'ios' ? 'حظر هذا المتصل' : 'حظر/الإبلاغ عن الرسائل المزعجة', danger: true}], {back: 'الأخيرة'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'حظر هذا المتصل' : 'حظر/الإبلاغ عن الرسائل المزعجة'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'هل تريد حظر هذا المتصل؟', 'لن تتلقى مكالمات هاتفية أو رسائل أو FaceTime من الأشخاص في قائمة الحظر.', [['cancel', 'إلغاء'], ['confirm', 'حظر جهة الاتصال']])
            : dialog(p, 'هل تريد حظر 07700 900842؟', '⟦square-check⟧ الإبلاغ عن المكالمة كمزعجة', [['cancel', 'إلغاء'], ['confirm', 'حظر']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'حظر جهة الاتصال' : 'حظر'}.</strong>${p === 'android' ? ' إبقاء خيار "الإبلاغ عن المكالمة كمزعجة" محددًا يساعد في تحذير الآخرين.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'تم الحظر! يمكنك أيضًا <strong>كتم كل المكالمات من الأرقام التي لا تعرفها</strong>. <strong>اضغط على الإعدادات.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'مرّر إلى الأسفل و<strong>اضغط على التطبيقات</strong>.'},
            {screen: () => list(p, 'التطبيقات', [{id: 'app-phone', label: 'الهاتف'}, {id: 'app-messages', label: 'الرسائل'}, {id: 'app-mail', label: 'البريد'}], {back: 'الإعدادات'}), target: 'app-phone', say: '<strong>اضغط على الهاتف.</strong>'},
            {screen: c => list(p, 'الهاتف', [{id: 'silence', label: 'كتم المتصلين المجهولين', toggle: !!c.silence}, {id: 'blocked', label: 'جهات الاتصال المحظورة', value: '1'}], {back: 'التطبيقات'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>فعّل كتم المتصلين المجهولين.</strong> المكالمات من أرقام ليست في جهات اتصالك تذهب مباشرة إلى البريد الصوتي، ولا تزال تظهر في مكالماتك الأخيرة.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'تم الحظر! يمكنك أيضًا <strong>تصفية المكالمات المزعجة</strong>. <strong>اضغط على النقاط الثلاث ⋮</strong> في أعلى اليمين.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>اضغط على الإعدادات.</strong>'},
            {screen: () => list(p, 'الإعدادات', [{id: 'caller-id', label: 'هوية المتصل والمكالمات المزعجة'}, {id: 'blocked', label: 'الأرقام المحظورة'}, {id: 'sounds', label: 'الأصوات والاهتزاز'}]), target: 'caller-id', say: '<strong>اضغط على هوية المتصل والمكالمات المزعجة.</strong>'},
            {screen: c => list(p, 'هوية المتصل والمكالمات المزعجة', [{id: 'caller-show', label: 'عرض هوية المتصل والمكالمات المزعجة', toggle: true}, {id: 'silence', label: 'تصفية المكالمات المزعجة', toggle: !!c.silence, sub: 'المكالمات المشتبه بأنها مزعجة لن ترنّ هاتفك'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>فعّل تصفية المكالمات المزعجة.</strong> المكالمات المشتبه بأنها احتيال لن ترنّ هاتفك.'},
        ]),
        {screen: c => list(p, 'تم', [{label: 'الأرقام المحظورة', value: '1'}, {label: p === 'ios' ? 'كتم المتصلين المجهولين' : 'تصفية المكالمات المزعجة', toggle: true}]),
         question: {q: 'هل قد يعني كتم المتصلين المجهولين أن تفوتك مكالمة حقيقية، مثل مكالمة من مستشفى أو سائق توصيل؟', options: [
            {t: 'نعم، لذا تحقق من بريدك الصوتي ومكالماتك الفائتة بين الحين والآخر', ok: true, why: 'تمامًا. المتصلون الحقيقيون يتركون عادةً رسالة، والمكالمات الفائتة تظهر في قائمتك.'},
            {t: 'لا، ستصل دائمًا', why: 'الأرقام المجهولة تذهب إلى البريد الصوتي، بما فيها الحقيقية. تحقق من بريدك الصوتي ومكالماتك الفائتة من وقت لآخر.'}]}},
        {screen: () => list(p, 'تم', [{label: 'الأرقام المحظورة', value: '1'}, {label: p === 'ios' ? 'كتم المتصلين المجهولين' : 'تصفية المكالمات المزعجة', toggle: true}]), done: true,
         say: '<strong>أحسنت!</strong> لقد حظرت رقمًا مزعجًا وقلّلت مكالمات الاحتيال.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: طردك محتجز بسبب رسوم غير مدفوعة قدرها 1.45 جنيه إسترليني. ادفع الآن لإعادة الحجز: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">إلى: ${field('fwdto', 'الرقم', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>شكرًا لك. يرجى إرسال رقم الهاتف الذي جاءت منه رسالة الاحتيال.</span><small>الآن</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>شكرًا لك، تم استلام بلاغك.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'رسالة جديدة') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'رسالة نصية', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'المزيد… ثم إعادة توجيه' : 'إعادة توجيه'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'وصلتك رسالة احتيال تنتحل صفة Royal Mail. قبل حذفها، أبلغ عنها، مجانًا. <strong>افتح الرسائل.</strong>'},
        {screen: () => app(p, 'الرسائل', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>اضغط على الرسالة</strong> لفتحها. لا تضغط على الرابط داخلها!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>اضغط مطولًا على الرسالة</strong> (أبقِ إصبعك عليها) حتى تظهر قائمة. لا تضغط على الرابط.', hint: 'أبقِ إصبعك على فقاعة الرسالة الرمادية لثانية أو ثانيتين.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>اضغط على المزيد…</strong>، ثم سهم إعادة التوجيه (هنا زر واحد يفعل الأمرين).' : '<strong>اضغط على إعادة توجيه.</strong> (في بعض الهواتف توجد تحت النقاط الثلاث ⋮ في الأعلى.)',
         hints: {delete: 'أبلغ عنها أولًا، ثم يمكنك حذفها.', copy: 'اضغط على إعادة توجيه لإرسالها إلى 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'في مربع "إلى"، اكتب 7726 (وهو يهجّئ SPAM على لوحة أرقام الهاتف)، ثم اضغط على إرسال.',
         action: c => { c.sent7726 = true; }, say: 'في مربع <strong>إلى</strong>، اكتب <strong>7726</strong>. (على لوحة الأرقام يهجّئ S-P-A-M.) ثم <strong>اضغط على إرسال</strong> ⟦send-horizontal⟧. إنه مجاني.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'اكتب رقم المحتال، 07700 900911، ثم اضغط على إرسال.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: 'يردّ 7726 ويسأل عن الرقم الذي جاءت منه رسالة الاحتيال. <strong>اكتب 07700 900911</strong> و<strong>اضغط على إرسال</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'لقد أبلغت عنها. ماذا ينبغي أن تفعل الآن برسالة الاحتيال؟', options: [
            {t: 'احذفها، واحظر الرقم', ok: true, why: 'نعم. تم الإبلاغ عنها، فيمكنك حذفها. وحظر الرقم يمنع وصول رسائل أخرى منه.'},
            {t: 'اضغط على الرابط للتحقق إن كان حقيقيًا', why: 'لا تضغط أبدًا على الروابط في رسائل الاحتيال. احذفها واحظر الرقم.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>أحسنت!</strong> لقد أبلغت عن رسالة احتيال إلى 7726، وهذا يساعد الشبكات على حظرها للجميع. أما رسائل البريد الإلكتروني الاحتيالية فتُرسل إلى report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'التحديثات تصلح مشكلات الأمان، لذا فهي مهمة. صِل هاتفك بالشاحن واتصل بـ Wi-Fi أولًا. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>اضغط على عام.</strong>'},
        {screen: () => list(p, 'عام', [{id: 'about', label: 'حول'}, {id: 'software', label: 'تحديث البرنامج', value: '1'}, {id: 'storage', label: 'مساحة تخزين الـ iPhone'}], {back: 'الإعدادات'}), target: 'software', say: '<strong>اضغط على تحديث البرنامج.</strong> الرقم 1 الأحمر يعني أن هناك تحديثًا بانتظارك.'},
        {screen: () => list(p, 'تحديث البرنامج', [{id: 'auto', label: 'التحديثات التلقائية', value: 'إيقاف'}], {back: 'عام',
            bottom: '<div class="hu"><strong>تحديث iOS</strong><p>يتضمن هذا التحديث إصلاحات أمان مهمة ويُوصى به لجميع المستخدمين.</p><button type="button" class="ce co" data-tap="update-now">التحديث الآن</button></div>'}),
         target: 'update-now', say: '<strong>اضغط على التحديث الآن.</strong>', hints: {auto: 'من الجيد تفعيل التحديثات التلقائية أيضًا، بعد هذا. أولًا، اضغط على التحديث الآن.'}},
        {screen: c => codeScreen(p, c, 'أدخل رمز الدخول', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'يطلب iPhone رمز دخولك. <strong>اكتب رمز التدريب 4 7 1 9 3 6.</strong>', hint: 'اكتب 4 7 1 9 3 6.'},
        {screen: c => list(p, 'تحديث البرنامج', [], {back: 'عام', bottom: `<div class="hu"><strong>${c.busy ? 'جارٍ التنزيل…' : 'جاهز للتثبيت'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'يُنزَّل أولًا، وقد يستغرق ذلك بضع دقائق. ثم <strong>اضغط على التثبيت الآن</strong>. يُعاد تشغيل هاتفك، لذا افعل ذلك عندما لا تحتاج إليه لمدة 15 إلى 30 دقيقة.'},
        {screen: () => list(p, 'تحديث البرنامج', [{id: 'auto', label: 'التحديثات التلقائية', value: 'مفعّل'}], {back: 'عام', bottom: '<div class="hu"><strong>iPhone محدَّث</strong></div>'}),
         question: {q: 'هل يستحق تفعيل التحديثات التلقائية؟', options: [
            {t: 'نعم، فيتحدث خلال الليل أثناء الشحن', ok: true, why: 'تمامًا. الإعدادات > عام > تحديث البرنامج > التحديثات التلقائية. يُثبَّت خلال الليل عندما يكون موصولًا بالشاحن وبشبكة Wi-Fi.'},
            {t: 'لا، التحديثات اختيارية', why: 'التحديثات تصلح الثغرات الأمنية التي يستغلها المحتالون. التحديثات التلقائية تحميك دون أن تضطر إلى التذكّر.'}]}},
        {screen: () => list(p, 'تحديث البرنامج', [], {bottom: '<div class="hu"><strong>iPhone محدَّث ⟦check⟧</strong></div>'}), done: true, say: '<strong>أحسنت!</strong> هاتفك محدَّث ومحمي من أحدث المشكلات.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'التحديثات تصلح مشكلات الأمان، لذا فهي مهمة. صِل هاتفك بالشاحن واتصل بـ Wi-Fi أولًا. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'مرّر إلى الأسفل و<strong>اضغط على النظام</strong>. <em>في Samsung تسمى تحديث البرنامج، قرب الأسفل.</em>'},
        {screen: () => list(p, 'النظام', [{id: 'languages', label: 'اللغات'}, {id: 'date', label: 'التاريخ والوقت'}, {id: 'software', label: 'تحديثات البرامج', sub: 'يتوفر تحديث'}]), target: 'software', say: '<strong>اضغط على تحديثات البرنامج.</strong>'},
        {screen: () => list(p, 'تحديثات البرامج', [{id: 'system-update', label: 'تحديث النظام', sub: 'يتوفر تحديث'}, {id: 'play-update', label: 'تحديث نظام Google Play'}]), target: 'system-update', say: '<strong>اضغط على تحديث النظام.</strong>'},
        {screen: () => list(p, 'تحديث النظام', [], {bottom: '<div class="hu"><strong>يتوفر تحديث للنظام</strong><p>يتضمن إصلاحات أمان مهمة.</p><button type="button" class="ce dk" data-tap="download">تنزيل وتثبيت</button></div>'}),
         target: 'download', say: '<strong>اضغط على تنزيل وتثبيت.</strong>'},
        {screen: c => list(p, 'تحديث النظام', [], {bottom: `<div class="hu"><strong>${c.busy ? 'جارٍ التنزيل والتثبيت…' : 'أعد التشغيل للإنهاء'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'يُنزَّل ويُجهَّز، وقد يستغرق ذلك وقتًا. ثم <strong>اضغط على إعادة التشغيل الآن</strong>. يُطفأ هاتفك ويُشغَّل من جديد، وهذا يستغرق بضع دقائق.'},
        {screen: () => list(p, 'تحديث النظام', [], {bottom: '<div class="hu"><strong>نظامك محدَّث</strong></div>'}),
         question: {q: 'لم يتلقَّ هاتفك تحديثًا منذ سنوات. ماذا قد يعني ذلك؟', options: [
            {t: 'قد يكون أقدم من أن يتلقى تحديثات الأمان، فيكون أقل أمانًا', ok: true, why: 'نعم. الهواتف الأقدم تتوقف عن تلقي التحديثات. تجنّب استخدام الخدمات المصرفية عليها، وفكّر في استبدالها عندما تستطيع.'},
            {t: 'إنه يعمل بشكل ممتاز', why: 'الهواتف تتوقف عن تلقي التحديثات بعد بضع سنوات، مما يترك ثغرات أمنية دون إصلاح.'}]}},
        {screen: () => list(p, 'تحديث النظام', [], {bottom: '<div class="hu"><strong>نظامك محدَّث ⟦check⟧</strong></div>'}), done: true, say: '<strong>أحسنت!</strong> هاتفك محدَّث ومحمي من أحدث المشكلات.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (الابنة)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'الهوية الطبية' : 'المعلومات الطبية', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'مثال: السكري من النوع 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'مثال: البنسلين', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>عرض عند القفل</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'تم' : 'حفظ'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>اختر جهة اتصال</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'الصحة', '#fff', ICON2.health]]), target: 'health', say: '<strong>الهوية الطبية</strong> تتيح للمسعفين رؤية حساسياتك وجهة اتصال الطوارئ، حتى عندما يكون هاتفك مقفلًا. <strong>افتح تطبيق الصحة.</strong>'},
            {screen: () => app(p, 'الملخص', '<p class="cf">تظهر بياناتك الصحية هنا.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>اضغط على صورتك</strong> في أعلى اليمين.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'التفاصيل الصحية'}, {id: 'medical', label: 'الهوية الطبية'}], {back: 'الملخص'}), target: 'medical', say: '<strong>اضغط على الهوية الطبية.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'يستطيع هاتفك تخزين <strong>معلومات طبية</strong> يراها المسعفون حتى عندما يكون مقفلًا. <strong>اضغط على الإعدادات.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'مرّر إلى الأسفل و<strong>اضغط على السلامة والطوارئ</strong>. <em>في Samsung تسمى السلامة والطوارئ.</em>'},
            {screen: () => list(p, 'السلامة والطوارئ', [{id: 'medical', label: 'المعلومات الطبية'}, {id: 'contacts-ec', label: 'جهات اتصال الطوارئ'}, {id: 'sos', label: 'الطوارئ SOS'}]), target: 'medical', say: '<strong>اضغط على المعلومات الطبية.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'اكتب حساسية أولًا (للتدريب، "Penicillin")، ثم أضف جهة اتصال للطوارئ.',
         say: 'املأ أي شيء ينبغي للمسعفين معرفته. للتدريب، اكتب <strong>Penicillin</strong> تحت الحساسيات. ثم <strong>اضغط على إضافة جهة اتصال للطوارئ</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'اختر من يُتصل به في حالة الطوارئ. <strong>اضغط على Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? 'خيار "عرض عند القفل" مفعّل، فيستطيع المسعفون رؤيتها. <strong>اضغط على تم.</strong>' : '<strong>اضغط على حفظ.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'الهوية الطبية' : 'المعلومات الطبية', [{label: 'الحساسيات', sub: typed(c, 'allergies')}, {label: 'جهة اتصال الطوارئ', sub: 'Sarah (الابنة)'}]),
         question: {q: p === 'ios' ? 'كيف يرى المسعف هويتك الطبية إذا كان هاتفك مقفلًا؟' : 'كيف يرى المسعف هذا إذا كان هاتفك مقفلًا؟', options: [
            {t: 'عبر زر "الطوارئ" على شاشة القفل', ok: true, why: 'نعم. الضغط على الطوارئ في شاشة القفل يُظهر معلوماتك الطبية دون فتح قفل هاتفك.'},
            {t: 'لا يستطيعون', why: 'يستطيعون: زر الطوارئ على شاشة القفل يعرضها دون الحاجة إلى رمز دخولك.'}]}},
        {screen: c => list(p, p === 'ios' ? 'الهوية الطبية' : 'المعلومات الطبية', [{label: 'الحساسيات', sub: typed(c, 'allergies')}, {label: 'جهة اتصال الطوارئ', sub: 'Sarah (الابنة)'}]), done: true,
         say: '<strong>أحسنت!</strong> حُفظت معلوماتك الطبية وجهة اتصال الطوارئ. إذا طلبت المساعدة عبر الطوارئ SOS، فسيُبلَّغ شخص الطوارئ الذي اخترته أيضًا.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'تحديد الموقع' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ جارٍ تشغيل الصوت…' : '⟦volume-2⟧ تشغيل الصوت'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'وضع علامة "مفقود"' : 'تأمين الجهاز'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'إذا فُقد هاتفك يومًا، يمكنك العثور عليه أو جعله يرنّ أو قفله، لكن بشرط تفعيل هذا أولًا. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>اضغط على اسمك</strong> في الأعلى.'},
            {screen: () => list(p, 'حساب Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'تحديد الموقع'}, {id: 'family', label: 'المشاركة العائلية'}], {back: 'الإعدادات'}), target: 'findmy', say: '<strong>اضغط على تحديد الموقع.</strong>'},
            {screen: c => list(p, 'تحديد الموقع', [{id: 'find-toggle', label: 'تحديد موقع iPhone', toggle: !!c.findOn}, {label: 'إرسال آخر موقع', toggle: !!c.findOn}], {back: 'حساب Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>فعّل تحديد موقع iPhone.</strong> خيار "إرسال آخر موقع" يرسل موقع هاتفك قبل نفاد البطارية مباشرة.'},
            {screen: () => homeWith(p, [['findmy', 'تحديد الموقع', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'تخيّل الآن أنك لا تجد هاتفك. على جهاز Apple آخر ستفتح <strong>تحديد الموقع</strong> (أو تدخل إلى icloud.com/find على حاسوب). هنا، <strong>اضغط على تحديد الموقع</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'مرّر إلى الأسفل و<strong>اضغط على Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'جميع الخدمات'}, {id: 'account', label: 'إدارة حسابك على Google'}]), target: 'all-services', say: '<strong>اضغط على جميع الخدمات.</strong>'},
            {screen: () => list(p, 'جميع الخدمات', [{id: 'find-hub', label: 'Find Hub', sub: 'كان يُسمّى سابقًا Find My Device'}, {id: 'theft', label: 'الحماية من السرقة'}]), target: 'find-hub', say: '<strong>اضغط على Find Hub</strong> (كان يُسمّى Find My Device). <em>لدى Samsung خيار خاص به أيضًا: الإعدادات &gt; الأمان والخصوصية &gt; الحماية من فقدان الجهاز.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'استخدام Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>فعّل استخدام Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'تخيّل الآن أنك لا تجد هاتفك. على هاتف أو جهاز لوحي آخر ستفتح <strong>Find Hub</strong>، أو تدخل إلى google.com/android/find على حاسوب. هنا، <strong>اضغط على Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'ها هو على الخريطة. إذا كان في مكان قريب، مثل بين مساند الأريكة، <strong>اضغط على تشغيل الصوت</strong>: يرنّ بصوت عالٍ حتى لو كان على الصامت.'},
        {screen: c => findMap(p, c), question: {q: 'تُظهر الخريطة هاتفك في مكان لم تذهب إليه من قبل. ماذا ينبغي أن تفعل؟', options: [
            {t: 'استخدم وضع علامة "مفقود" أو تأمين الجهاز لقفله، واتصل بالشرطة', ok: true, why: 'نعم. اقفله من تحديد الموقع أو Find Hub، ولا تذهب إلى هناك بنفسك، وبلّغ الشرطة وشبكة الاتصالات.'},
            {t: 'اذهب واستعده بنفسك', why: 'لا تواجه لصًا أبدًا. اقفل الهاتف عن بُعد واتصل بالشرطة.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>أحسنت!</strong> تحديد موقع هاتفك مفعّل، وأنت تعرف كيف تجعله يرنّ أو تقفله.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>نصائح تقنية مجانية</strong>${UI.qr}<small>امسحني ضوئيًا</small></div>
                ${ctx.busy ? '' : `<button type="button" class="agy" data-tap="qr-link">⟦globe⟧ jamesgartshore.co.uk</button>`}</div>`
            : `<div class="qq"><span class="afx">☀️</span><span class="aaz">🌻🌷🌻</span></div>`;
        return `<div class="abb">${statusBar(p)}${view}
            <div class="ro"><button type="button" class="abz" data-tap="thumb" aria-label="Last photo">${ctx.taken ? '🌻' : ''}</button>
            <button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button><span class="sk">${UI.flip}</span></div>${homeIndicator(p)}</div>`;
    }
    function photoView(p, ctx) {
        const zoom = 1 + 0.5 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="abi">${statusBar(p)}<div class="adh"><span style="transform:scale(${zoom})">🌻🌷🌻</span></div>
            <div class="vw"><button type="button" data-tap="zoom-in" aria-label="Zoom in">${UI.plus}</button></div>
            <div class="uu"><button type="button" data-tap="share" aria-label="Share">${UI.share}</button><button type="button" data-tap="favourite" aria-label="Favourite">${UI.heart}</button><button type="button" data-tap="delete" aria-label="Delete">${UI.bin}</button></div>
            ${ctx.sheet === 'share' ? `<div class="ei"><div class="cv"><p><strong>Share with</strong></p><div class="hs">
                <button type="button" data-tap="share-messages"><span style="background:#22c55e">⟦message-circle⟧</span>Messages</button><button type="button" data-tap="share-mail"><span style="background:#3b82f6">⟦mail⟧</span>Mail</button>
                <button type="button" data-tap="share-other"><span style="background:#94a3b8">⋯</span>More</button></div></div></div>` : ''}
            ${ctx.sheet === 'delete' ? dialog(p, 'هل تريد حذف هذه الصورة؟', p === 'ios' ? 'ستبقى في "المحذوفة مؤخرًا" لمدة 30 يومًا.' : 'ستُنقل إلى سلة المهملات لفترة قبل أن تختفي.', [['cancel', 'إلغاء'], ['confirm-delete', 'حذف']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>افتح الكاميرا.</strong> <em>نصيحة: في معظم الهواتف يمكنك أيضًا السحب لليسار على شاشة القفل.</em>', hint: 'الكاميرا هي الأيقونة الرمادية التي عليها كاميرا.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'وجّهها نحو الزهور وثبّتها. <strong>اضغط على الزر المستدير الكبير</strong> لالتقاط صورة.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'تم الالتقاط! حُفظت الصورة. <strong>اضغط على الصورة الصغيرة</strong> في الزاوية لرؤيتها.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'للنظر عن قرب، ضع إصبعين على الصورة وباعد بينهما. هنا، <strong>اضغط على ＋ مرتين</strong>.', hint: 'اضغط على ＋ في أعلى اليمين.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'جميل! لإرسالها إلى شخص ما، <strong>اضغط على زر المشاركة</strong> ⇪ (صندوق عليه سهم).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'اختر طريقة الإرسال: الرسائل أو البريد الإلكتروني أو WhatsApp وغيرها. <strong>اضغط على الرسائل.</strong> (ثم تختار لمن ترسلها.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'تم الإرسال! الآن، إذا التقطت صورة لا تريدها، <strong>اضغط على سلة المهملات</strong> ⟦trash-2⟧ لحذفها.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'يتحقق هاتفك أولًا. <strong>اضغط على حذف.</strong>'},
        {screen: () => app(p, 'الصور', '<p class="cf">لا توجد صور بعد.</p>', {back: false, color: '#fff'}), question: {q: 'حذفت صورة بالخطأ! ماذا يمكنك أن تفعل؟', options: [
            {t: p === 'ios' ? 'ابحث في الألبومات > المحذوفة مؤخرًا واستعدها' : 'ابحث في سلة المهملات (المكتبة > سلة المهملات) واستعدها', ok: true, why: 'نعم. تُحفظ الصور المحذوفة لفترة، عادةً نحو شهر، فيمكنك استعادتها.'},
            {t: 'لا شيء، ضاعت إلى الأبد', why: 'لا تقلق! تُحفظ في "المحذوفة مؤخرًا" (iPhone) أو سلة المهملات (Android) لفترة.'}]}},
        {screen: () => app(p, 'الصور', '<p class="cf">تم كل شيء.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع التقاط الصور وتكبيرها ومشاركتها وحذفها.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'إذا كان لدى أسرتك أجهزة iPhone أيضًا، فإن <strong>FaceTime</strong> يتيح مكالمات فيديو مجانية. <strong>اضغط على FaceTime.</strong>' : '<strong>Google Meet</strong> يتيح مكالمات فيديو مجانية من Android، ومع أجهزة iPhone أيضًا. <strong>اضغط على Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'FaceTime جديد' : 'جديد'}</button><p class="cf">تظهر المكالمات الأخيرة هنا.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'FaceTime جديد' : 'جديد'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'FaceTime جديد' : 'اتصال', `<div class="xz">To: ${field('callto', 'الاسم أو الرقم', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'مكالمة الفيديو'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'اكتب Sarah في مربع "إلى" أولًا.',
             say: 'اكتب اسم شخص من جهات اتصالك. <strong>اكتب Sarah</strong>، ثم <strong>اضغط على زر الفيديو</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'يرنّ، ثم تردّ Sarah. لتُريها الحديقة، <strong>اضغط على زر القلب</strong> ⟦switch-camera⟧ لاستخدام الكاميرا الخلفية.', hint: 'انتظر حتى تردّ Sarah، ثم اضغط على ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'عندما تنتهي، <strong>اضغط على الزر الأحمر</strong> لإنهاء المكالمة.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · فيديو · 3 دقائق</p>', {back: false, color: '#fff'}), question: {q: 'صديقك لديه هاتف Android ولديك أنت iPhone. هل يمكنكما إجراء مكالمة فيديو مع ذلك؟', options: [
                {t: 'نعم، باستخدام WhatsApp أو Google Meet، فكلاهما يعمل على النوعين', ok: true, why: 'تمامًا. FaceTime مخصص أساسًا من iPhone إلى iPhone. أما WhatsApp وGoogle Meet فيعملان على النوعين معًا.'},
                {t: 'لا، أبدًا', why: 'يمكنكما: WhatsApp وGoogle Meet يعملان على النوعين من الهواتف.'}]}},
            {screen: () => app(p, appName, '<p class="cf">تم كل شيء.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>أحسنت!</strong> لقد أجريت مكالمة فيديو وأريت المشهد من الكاميرا الخلفية.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'رموز QR هي تلك الأنماط المربعة بالأبيض والأسود على الملصقات وقوائم الطعام. تستطيع كاميرتك قراءتها، دون حاجة إلى تطبيق إضافي. <strong>افتح الكاميرا.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'وجّه الكاميرا نحو الرمز وثبّتها لحظة. <strong>يظهر رابط على الشاشة</strong>: تأكد من أنه يبدو كما تتوقع من صاحبه، ثم <strong>اضغط عليه</strong>.',
         hints: {shutter: 'لا حاجة إلى التقاط صورة: وجّه الكاميرا فقط وانتظر ظهور الرابط، ثم اضغط عليه.'},
         hint: p === 'android' ? 'انتظر ظهور الرابط، ثم اضغط عليه. وإن لم يظهر شيء، فجرّب Google Lens.' : 'انتظر ظهور الرابط، ثم اضغط عليه.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>نصائح تقنية مجانية</h3><p>نصائح بلغة بسيطة عن الهواتف وأجهزة الكمبيوتر والأمان على الإنترنت.</p></div>', {color: '#f8fafc'}),
         question: {q: 'ترى ملصق رمز QR على جهاز الدفع في موقف السيارات. ما أكثر طريقة آمنة للدفع؟', options: [
            {t: 'استخدم تطبيق الموقف الرسمي أو الجهاز نفسه، لا رمز QR ملصقًا عليه', ok: true, why: 'نعم. يلصق المحتالون رموز QR مزيفة فوق الحقيقية لسرقة بيانات البطاقات. تحقق هل هو ملصق، واستخدم التطبيق الرسمي أو اللافتة الرسمية.'},
            {t: 'امسحه وادفع، فهو أسرع', why: 'ملصقات QR المزيفة على أجهزة مواقف السيارات احتيال معروف. استخدم التطبيق الرسمي أو الجهاز نفسه.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>نصائح تقنية مجانية</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع مسح رموز QR بكاميرتك، وتعرف أن عليك التحقق من الرابط أولًا.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'صور من يوم الأحد 📷', 'مرحبًا ماما، هذه صور الغداء…'],
                       ['tv', 'TV Licensing', 'انتهت صلاحية رخصتك', 'تصرّف الآن لتجنب الملاحقة القضائية. حدّث بيانات الدفع…'],
                       ['library', 'Bridlington Library', 'كتبك مستحقة الإعادة', 'موعد إعادة موادك يوم الجمعة.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'البريد الوارد' : 'الأساسي', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · إليّ</p><h3>صور من يوم الأحد 📷</h3><p>مرحبًا ماما، هذه صور الغداء. كان من الجميل رؤيتك! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'اكتب ردّك…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>انتهت صلاحية رخصتك</h3><p>تصرّف الآن لتجنب الملاحقة القضائية. حدّث بيانات الدفع خلال 24 ساعة: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'نقل إلى الرسائل المزعجة' : '⋮ الإبلاغ عن تصيّد'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'البريد' : 'تطبيق بريدك الإلكتروني (Gmail في معظم هواتف Android)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'الرسائل الجديدة بخط غامق. <strong>اضغط على رسالة Sarah</strong> لقراءتها.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'للرد، <strong>اضغط على رد</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'اكتب ردًا قصيرًا أولًا، ثم اضغط على إرسال.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>اكتب ردًا قصيرًا</strong> (مثل "شكرًا لك، أحبها!") و<strong>اضغط على إرسال</strong>.'},
        {screen: () => app(p, '', '<p class="cf">أُرسلت ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ العودة إلى البريد الوارد</button>', {color: '#fff'}), target: 'back', say: '<strong>اضغط على رجوع</strong> للعودة إلى بريدك الوارد.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'هناك رسالة مقلقة من "TV Licensing". <strong>افتحها</strong>، لكن لا تضغط على أي شيء داخلها.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'رسائل الاحتيال كثيرًا ما تستخدم اسمًا حقيقيًا مع عنوان مزيف. <strong>اضغط على اسم المرسل</strong> لترى عنوان البريد الإلكتروني الحقيقي.',
         hint: 'اضغط على "TV Licensing" في أعلى الرسالة.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'هي من <strong>outlook-mail.com</strong>، لا من tvlicensing.co.uk. إنها احتيال. <strong>اضغط على ' + (p === 'ios' ? 'نقل إلى الرسائل المزعجة' : 'الإبلاغ عن تصيّد') + '.</strong> يمكنك أيضًا إعادة توجيه رسائل الاحتيال إلى report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'ما الذي كشف الاحتيال؟', options: [
            {t: 'عنوان المرسل الحقيقي والتهديدات والمهلة المحددة بـ 24 ساعة', ok: true, why: 'تمامًا. الجهات الحقيقية لا تهددك بمهل زمنية، ورسائلها تأتي من عنوان موقعها الإلكتروني الخاص.'},
            {t: 'لا شيء، بدت حقيقية', why: 'تحقق من عنوان المرسل: لم يكن عنوان TV Licensing. والتهديدات والمهل الضيقة من علامات التحذير الكبيرة أيضًا.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع قراءة رسائل البريد الإلكتروني والرد عليها، وكشف الاحتيال والإبلاغ عنه.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'الحصول' : 'تثبيت';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'متجر Play'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>اضغط على بحث.</strong>' : '<strong>اضغط على شريط البحث.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'بحثنا عن "NHS App". كثير من التطبيقات تستخدم "NHS" في اسمها. تحقق من <strong>الجهة المنتجة</strong>: التطبيق الحقيقي من <strong>NHS England</strong>. <strong>اضغط على ' + (p === 'ios' ? 'الحصول' : 'تثبيت') + ' بجانب التطبيق الحقيقي.</strong>',
         hints: {'fake1-get': 'هذا من HealthApps Ltd، وهو إعلان. تطبيق NHS App الحقيقي من إنتاج NHS England.', 'fake2-get': 'هذا من QuickDev Apps، لا من NHS. التطبيق الحقيقي من إنتاج NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'تم التثبيت! الآن أزل تطبيقًا لا تستخدمه أبدًا، لترتّب هاتفك وتوفّر مساحة. <strong>اضغط مطولًا على تطبيق الطقس</strong> حتى تظهر قائمة.', hint: 'أبقِ إصبعك على أيقونة الطقس لثانية أو ثانيتين.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'هل تريد إزالة "الطقس"؟' : 'الطقس', p === 'ios' ? 'الإزالة من الشاشة الرئيسية ستُبقي التطبيق في مكتبة التطبيقات.' : '', p === 'ios'
            ? [['delete-app', 'حذف التطبيق'], ['remove-home', 'إزالة من الشاشة الرئيسية'], ['cancel', 'إلغاء']] : [['app-info', 'معلومات التطبيق'], ['delete-app', 'إلغاء التثبيت'], ['cancel', 'إلغاء']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>اضغط على إزالة التطبيق</strong>، ثم <strong>حذف التطبيق</strong> (هنا هو زر واحد).' : '<strong>اضغط على إلغاء التثبيت.</strong>',
         hints: {'remove-home': 'هذا يخفي الأيقونة فقط؛ ويبقى التطبيق على هاتفك. اضغط على حذف التطبيق.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'يطلب تطبيق دفعة مالية "لفتح" سجلاتك في NHS. ما رأيك؟', options: [
            {t: 'ليس تطبيق NHS App الحقيقي، فهو مجاني تمامًا', ok: true, why: 'تمامًا. تطبيق NHS App مجاني. احذف أي شيء يطلب منك الدفع مقابل خدمات NHS.'},
            {t: 'ادفع، فهو لصالح NHS', why: 'تطبيق NHS App الحقيقي مجاني ومن إنتاج NHS England. التطبيق الذي يطلب مالًا ليس الحقيقي.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>أحسنت!</strong> أصبحت تميّز التطبيقات الحقيقية من المقلِّدة، وتزيل التطبيقات التي لا تحتاج إليها.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>أهلًا بعودتك.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'تسجيل الدخول بـ Face ID' : 'تسجيل الدخول ببصمة الإصبع'}</button>
                <button type="button" class="cp" data-tap="password">تسجيل الدخول بالبريد الإلكتروني وكلمة المرور</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'الوصفات الطبية'], ['appointments', '⟦calendar⟧', 'المواعيد'], ['records', '⟦clipboard-list⟧', 'صحتك'], ['messages', '⟦mail⟧', 'الرسائل']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'الوصفات الطبية', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>اطلب وصفة طبية متكررة</strong><small>اختر الأدوية التي توصف لك أصلًا</small></button><div class="ck"><strong>عرض طلباتك</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'أقراص Amlodipine 5 ملغ'], ['med-2', 'أقراص Atorvastatin 20 ملغ']];
            return app(p, 'اختر الأدوية', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'أكّد طلبك', `<p class="cf">أقراص Amlodipine 5 ملغ<br>الاستلام من: صيدليتك المحددة</p><button type="button" class="ce co" data-tap="confirm">التأكيد والطلب</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'تم إرسال الطلب', '<p class="cf">⟦check⟧ أُرسل طلب وصفتك الطبية إلى عيادة طبيبك العام. يستغرق عادةً من يومين إلى 3 أيام عمل.</p><button type="button" class="cp" data-tap="home">العودة إلى الرئيسية</button>', {color: NHS});
        return app(p, 'المواعيد', '<div class="fo"><div class="ck"><strong>موعد الطبيب العام</strong><small>الثلاثاء الساعة 10:30 · عيادة طبيبك العام</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: 'تطبيق <strong>NHS App</strong> مجاني ويتيح لك طلب وصفات طبية متكررة ومعرفة المواعيد وغير ذلك. (هذه النسخة التدريبية وهمية، صُنعت لهذا الدرس فقط.) <strong>اضغط على NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `بعد أن تعدّه باستخدام NHS login، يمكنك تسجيل الدخول بـ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>اضغط على تسجيل الدخول بـ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'هذا يصلح أيضًا، لكن وجهك أو بصمتك أسرع. اضغط على الزر الأزرق.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>اضغط على الوصفات الطبية.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>اضغط على اطلب وصفة طبية متكررة.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'اضغط على دواء لتحديده أولًا، ثم اضغط على متابعة.',
         say: '<strong>اضغط على الدواء الذي تحتاج إليه</strong> لتحديده (جرّب Amlodipine)، ثم <strong>اضغط على متابعة</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'تأكد من صحته، ثم <strong>اضغط على التأكيد والطلب</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'أُرسل إلى عيادتك! <strong>اضغط على العودة إلى الرئيسية.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'يمكنك أيضًا معرفة مواعيدك. <strong>اضغط على المواعيد.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'رسالة نصية تقول "NHS: أنت مؤهل لحزمة فحص مجانية، أدخل بياناتك المصرفية لدفع رسوم البريد". ما هذه؟', options: [
            {t: 'احتيال. لا تطلب NHS بياناتك المصرفية عبر الرسائل النصية أبدًا', ok: true, why: 'تمامًا. استخدم NHS App أو عيادة طبيبك العام مباشرة، ولا تستخدم الروابط في الرسائل النصية أبدًا.'},
            {t: 'حقيقية، فهي رسوم بريد فقط', why: 'لا ترسل NHS رسائل نصية تطلب بيانات مصرفية أبدًا. هذا احتيال: أعد توجيهها إلى 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>أحسنت!</strong> لقد طلبت وصفة طبية متكررة وتحققت من مواعيدك.'},
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
        if (page === 'login') return app(p, 'Practice Bank', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'تسجيل الدخول بـ Face ID' : 'تسجيل الدخول ببصمة الإصبع'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'حساباتك', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'اليوم'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'اليوم'], ['txn-pension', 'State Pension', '+£921.60', 'أمس'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'الاثنين']];
            return app(p, 'الحساب الجاري', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'دفعة', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>اليوم، 03:12 · بطاقة تنتهي بـ 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ تجميد البطاقة</strong><small>${ctx.frozen ? 'تم تجميد البطاقة ⟦check⟧' : 'أوقف المدفوعات فورًا'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>الإبلاغ عن هذه الدفعة</strong><small>لا تعرفها؟ أخبرنا</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'المصرف', BANK, ICON2.pound]]), target: 'bank',
         say: 'تطبيقات المصارف تتيح لك الاطلاع على أموالك في أي وقت. (هذا مصرف وهمي للتدريب.) <strong>افتح تطبيق المصرف.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>سجّل الدخول بـ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> لا تشارك رمز دخولك المصرفي مع أحد أبدًا.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>اضغط على حسابك الجاري</strong> لترى ما دُفع وما قُبض.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'تصفّح المدفوعات. هناك دفعة واحدة لا تعرفها: <strong>249 جنيهًا في الساعة 3 صباحًا، لموقع بطاقات هدايا</strong>. <strong>اضغط عليها.</strong>',
         hints: {'txn-tesco': 'هذا تسوّقك. ابحث عن دفعة لا تعرفها.', 'txn-pension': 'هذا معاشك التقاعدي يُودَع. ابحث عن الدفعة الغريبة.', 'txn-water': 'هذه فاتورة المياه. ابحث عن الدفعة الغريبة.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>اضغط على تجميد البطاقة</strong>. يوقف المدفوعات الأخرى فورًا، ويمكنك إلغاء التجميد لاحقًا إذا تبيّن أن كل شيء سليم.',
         hints: {report: 'جمّد البطاقة أولًا لإيقاف المدفوعات الأخرى. ثم بلّغ عنها.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'لقد جمّدت البطاقة. ما الخطوة التالية؟', options: [
            {t: 'اتصل بمصرفك على الرقم 159 أو الرقم المطبوع على البطاقة، أو بلّغ عنها في التطبيق', ok: true, why: 'نعم. يستطيعون التحقيق وإلغاء البطاقة، وغالبًا استرداد المال. كلما أخبرتهم أسرع كان أفضل.'},
            {t: 'انتظر لترى هل يتكرر الأمر', why: 'أخبر مصرفك فورًا. كلما عرفوا أسرع، زاد ما يمكنهم فعله.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>أحسنت!</strong> لقد تحققت من حسابك، ولاحظت دفعة لا تعرفها، وجمّدت بطاقتك.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Practice Bank</strong><span>•••• 4421</span><small>خصم مباشر</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'المحفظة' : 'Google Wallet', `<p class="cf">أضف بطاقة للدفع في المتاجر بهاتفك.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ إضافة بطاقة' : '＋ إضافة إلى المحفظة'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'إضافة بطاقة', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'ضع بطاقتك داخل الإطار…' : 'تم العثور على البطاقة ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'التحقق من البطاقة', `<p class="cf">يحتاج مصرفك إلى التأكد من أنك أنت. اختر كيف تحصل على الرمز:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>رسالة نصية</strong><small>إلى ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>الاتصال بمصرفك</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'أدخل الرمز', `<div class="jp ex"><strong>الرسائل · الآن</strong><span>Practice Bank: رمز محفظتك 529173. لا تشاركه أبدًا.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'المحفظة' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ بطاقتك جاهزة للاستخدام.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'قرّب من القارئ…' : 'قرّب من القارئ…') : '⟦check⟧ تم'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'المحفظة' : 'المحفظة', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `الدفع بهاتفك سريع وآمن: المتاجر لا ترى رقم بطاقتك أبدًا. <strong>افتح ${p === 'ios' ? 'المحفظة' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ إضافة بطاقة' : '＋ إضافة إلى المحفظة'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'يستخدم هاتفك الكاميرا لقراءة بطاقتك، فلا تضطر إلى كتابة الرقم. <strong>ضع بطاقتك داخل الإطار</strong>، ثم <strong>اضغط على التالي</strong>. <em>لا تكتب رقم بطاقتك أبدًا في موقع إلكتروني جاءك من رسالة نصية أو بريد إلكتروني.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'يتأكد مصرفك من أنك أنت. <strong>اضغط على رسالة نصية.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'يصلك رمز برسالة نصية من مصرفك. <strong>اكتب 5 2 9 1 7 3.</strong> تذكّر: هذا الرمز يُكتب فقط في هاتفك أنت، ولا يُعطى لأي شخص يطلبه.', hint: 'اكتب الرمز الذي في الرسالة: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'بطاقتك جاهزة. لندفع الآن في متجر. <strong>اضغط في أي مكان على البطاقة.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'عند الصندوق، <strong>اضغط مرتين على الزر الجانبي</strong> في iPhone (اضغط على ⟦power⟧ مرتين هنا)، وانظر إلى الشاشة لـ Face ID، ثم قرّب أعلى هاتفك من قارئ البطاقات.', hint: 'اضغط على الزر ⟦power⟧ الجانبي مرتين.'}
            : {target: 'pay-now', say: 'عند الصندوق، فقط <strong>افتح قفل هاتفك وقرّب ظهره من قارئ البطاقات</strong>. هنا، <strong>اضغط على قارئ البطاقات</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'هل الدفع بالهاتف آمن؟', options: [
            {t: 'نعم، أكثر أمانًا من بطاقتك: يحتاج إلى وجهك أو بصمتك أو رمز دخولك، والمتاجر لا ترى رقم بطاقتك', ok: true, why: 'تمامًا. وإذا فقدت هاتفك، فلا يستطيع أحد الدفع به دون فتح قفله.'},
            {t: 'لا، يستطيع أي شخص استخدامه', why: 'كل عملية دفع تحتاج إلى وجهك أو بصمتك أو رمز دخولك، لذا فهو أكثر أمانًا في الواقع من بطاقة الدفع بدون تلامس.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>أحسنت!</strong> بطاقتك الآن في هاتفك وقد أجريت دفعة تجريبية.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>خصم مباشر</small></div>', '<small>خصم مباشر</small></div></button>');
        const pay = steps.find(s => s.target === 'pay-now');
        if (pay) {
            const payScreen = pay.screen;
            pay.screen = c => payScreen({...c, busy: true}).replace('<div class="yu">', '<button type="button" class="yu" data-tap="pay-now">').replace('£4.20</div>', '£4.20</button>');
        }
        const iosPay = steps.find(s => s.sequence && s.sequence[0] === 'side');
        if (iosPay) { const sc = iosPay.screen; iosPay.screen = c => sc({...c, busy: true}); }
        return steps;
    };

    function trainScreen(p, ctx, page) {
        const color = '#7c2d12';
        if (page === 'plan') {
            return app(p, 'Practice Rail', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'اختر المحطة'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'إضافة بطاقة قطار'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>اختر محطة</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>إضافة بطاقة قطار</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'بلا بطاقة قطار']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'مباشر'], ['t-1145', '11:45', '12:32', 'مباشر'], ['t-1245', '12:45', '13:32', 'مباشر']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">الأسعار مختلقة لهذا التدريب. تم تطبيق خصم بطاقة القطار.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>ذهاب فقط (غير الذروة)</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>ذهاب وعودة في اليوم (غير الذروة)</strong><small>عُد اليوم</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'تذكرتك', `<div class="adt"><strong>ذهاب وعودة في اليوم (غير الذروة)</strong><span>Bridlington ⇄ Hull</span><span>اليوم · Senior Railcard</span>
            ${UI.qr}<small>امسح هذا عند بوابة التذاكر، أو أره لمراقب القطار.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'القطارات', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'تطبيقات القطارات تتيح لك شراء التذاكر على هاتفك دون طابور. (هذا التطبيق التدريبي وهمي: الأسعار والأوقات مختلقة.) <strong>افتح القطارات.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'أنت مسافر من Bridlington. <strong>اضغط على إلى</strong> لتختار وجهتك.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>اضغط على Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'فوق الستين؟ بطاقة <strong>Senior Railcard</strong> توفّر ثلث سعر معظم التذاكر. <strong>اضغط على بطاقة القطار</strong> لإضافة بطاقتك.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>اضغط على Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>اضغط على البحث عن قطارات.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'هذه هي القطارات. <strong>اضغط على رحلة 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'هل ستعود اليوم؟ تذكرة الذهاب والعودة في اليوم أرخص عادةً من تذكرتي ذهاب. <strong>اضغط على ذهاب وعودة في اليوم (غير الذروة)</strong>، ثم ادفع.',
         hints: {single: 'تذكرة الذهاب فقط لاتجاه واحد. أنت عائد اليوم، لذا اضغط على ذهاب وعودة في اليوم (غير الذروة).', pay: 'اختر تذكرتك أولًا: اضغط على ذهاب وعودة في اليوم (غير الذروة).'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>اضغط على ${p === 'ios' ? 'دفع' : 'G Pay'}</strong> للدفع بالبطاقة الموجودة في هاتفك (من درس الدفع بدون تلامس).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'بطارية هاتفك منخفضة قبل قطار عودتك إلى المنزل. ما الفكرة الجيدة؟', options: [
            {t: 'التقط صورة شاشة للتذكرة، وفعّل توفير البطارية', ok: true, why: 'نعم. بعض التذاكر تعمل من صورة الشاشة، وتوفير البطارية يساعد على إبقاء الهاتف يعمل. كما تتيح تطبيقات كثيرة إضافة التذكرة إلى المحفظة.'},
            {t: 'لا شيء، سيكون كل شيء على ما يرام', why: 'إذا نفدت بطارية هاتفك، فلن تستطيع إظهار تذكرتك. التقط صورة شاشة ووفّر البطارية.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>أحسنت!</strong> لقد خططت لرحلة، وأضفت بطاقة قطار، واشتريت تذكرة على هاتفك.'},
    ], {});

    // ---------- Engine ----------
    // The iPhone home bar / Android home button, as something you can tap (or swipe up on the iPhone).
    const navHome = p => p === 'ios'
        ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
        : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';

    // ======================================================================================
    // Course: Everyday phone skills
    // ======================================================================================

    // Buttons on the edges of the phone. iPhone: volume on the left, side button on the right.
    // Android: power, then volume up and down, all on the right.
    function edgeButtons(p) {
        return p === 'ios'
            ? `<button type="button" class="fk left abx" data-tap="vol-up" aria-label="Volume up button">+</button>
               <button type="button" class="fk left ahp" data-tap="vol-down" aria-label="Volume down button">−</button>
               <button type="button" class="fk right abx" data-tap="side" aria-label="Side button">${UI.power}</button>`
            : `<button type="button" class="fk right ajg" data-tap="power" aria-label="Power button">${UI.power}</button>
               <button type="button" class="fk right abx" data-tap="vol-up" aria-label="Volume up button">+</button>
               <button type="button" class="fk right ahp" data-tap="vol-down" aria-label="Volume down button">−</button>`;
    }

    const busTable = `<div class="sj"><strong>الحافلة 121: من Bridlington إلى Hull</strong><small>أوقات تدريبية فقط</small>
        <table class="qo"><tr><th>Bridlington</th><th>Driffield</th><th>Hull</th></tr>
        <tr><td>09:15</td><td>09:45</td><td>10:40</td></tr><tr><td>10:15</td><td>10:45</td><td>11:40</td></tr>
        <tr><td>11:15</td><td>11:45</td><td>12:40</td></tr><tr><td>12:15</td><td>12:45</td><td>13:40</td></tr></table></div>`;

    function shotScreen(p, ctx) {
        const thumb = ctx.shot && !ctx.saved
            ? `<button type="button" class="alp" data-tap="thumb" aria-label="Screenshot preview"><span class="adk"></span></button>
               ${p === 'android' ? '<div class="rf"><button type="button" data-tap="shot-share">Share</button><button type="button" data-tap="shot-edit">Edit</button></div>' : ''}` : '';
        const sheet = ctx.shareSheet ? `<div class="ei"><div class="cv"><p><strong>Share screenshot</strong></p>
            <div class="xe"><button type="button" data-tap="share-sarah">${avatar('S', '#f472b6')}<span>Sarah</span></button>
            <button type="button" data-tap="share-jean">${avatar('J', '#a78bfa')}<span>Jean</span></button>
            <button type="button" data-tap="share-email">${avatar('@', '#3b82f6')}<span>Email</span></button></div></div></div>` : '';
        return app(p, 'أوقات الحافلات', busTable, {back: false, color: '#fff',
            overlay: (ctx.shot ? '' : edgeButtons(p)) + thumb + sheet});
    }

    function shotEditor(p, ctx) {
        const sheet = ctx.doneSheet ? `<div class="ei"><div class="cv">
            <button type="button" class="cp" data-tap="save-photos">Save to Photos</button>
            <button type="button" class="cp" data-tap="save-files">Save to Files</button>
            <button type="button" class="cp lk" data-tap="delete-shot">Delete Screenshot</button></div></div>` : '';
        return `<div class="cg shot-edit ph-${p}">${statusBar(p)}
            <div class="tf"><button type="button" data-tap="done">Done</button><span>Screenshot</span><button type="button" data-tap="share" aria-label="Share">${UI.share}</button></div>
            <div class="yx">${busTable}</div>
            <div class="va" aria-hidden="true"><span></span><span></span><span></span><span></span></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['screenshot'] = (p) => withCtx([
        {screen: c => shotScreen(p, c), sequence: p === 'ios' ? ['side', 'vol-up'] : ['power', 'vol-down'], action: c => { c.shot = true; },
         say: p === 'ios'
            ? 'لقطة الشاشة صورة لكل ما على شاشتك، مثل أوقات الحافلات هذه. اضغط على <strong>الزر الجانبي</strong> (على اليمين) و<strong>رفع الصوت</strong> (على اليسار) معًا، ثم ارفع إصبعيك. هنا، <strong>اضغط على الزر الجانبي، ثم رفع الصوت</strong>.'
            : 'لقطة الشاشة صورة لكل ما على شاشتك، مثل أوقات الحافلات هذه. اضغط على <strong>زر التشغيل</strong> و<strong>خفض الصوت</strong> معًا، ثم ارفع إصبعيك. هنا، <strong>اضغط على زر التشغيل، ثم خفض الصوت</strong>.',
         hints: {'vol-down': p === 'ios' ? 'في iPhone هو رفع الصوت، مع الزر الجانبي.' : 'ابدأ بزر التشغيل، في أعلى الجانب الأيمن.',
                 'vol-up': p === 'ios' ? 'ابدأ بالزر الجانبي على اليمين.' : 'في Android هو خفض الصوت، مع زر التشغيل.',
                 side: 'الآن زر رفع الصوت، على اليسار.', power: 'الآن زر خفض الصوت.'},
         hint: p === 'ios' ? 'الزر الجانبي على الحافة اليمنى. ورفع الصوت على اليسار.' : 'زر التشغيل هو الزر العلوي على الحافة اليمنى.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'نقرة! تظهر صورة صغيرة في الزاوية السفلية. <strong>اضغط عليها</strong> لترى لقطة الشاشة. <em>وإن تركتها، تُحفظ من تلقاء نفسها بعد بضع ثوانٍ.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'يمكنك الرسم عليها أو قصّها هنا. <strong>اضغط على تم</strong> في أعلى اليسار.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>اضغط على حفظ في الصور.</strong>', hints: {'delete-shot': 'هذا سيرميها. اضغط على حفظ في الصور.', 'save-files': 'الملفات تصلح أيضًا، لكن الصور أسهل في العثور عليها. اضغط على حفظ في الصور.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'نقرة! تظهر صورة صغيرة وتحتها أزرار. وهي محفوظة أصلًا. <strong>اضغط على مشاركة</strong> لإرسالها إلى شخص ما.', hints: {'shot-edit': '"تعديل" يتيح لك القص أو الرسم عليها. الآن، اضغط على مشاركة.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>اضغط على Sarah</strong> لإرسال أوقات الحافلات إليها.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'أين تجد لقطات الشاشة لاحقًا؟', options: [
            {t: 'في تطبيق الصور، ضمن ألبوم لقطات الشاشة', ok: true, why: 'نعم. تُحفظ مع صورك، فيمكنك مشاهدتها ومشاركتها وحذفها كأي صورة.'},
            {t: 'تختفي بعد يوم', why: 'تبقى إلى أن تحذفها. ابحث في تطبيق الصور، ضمن ألبوم لقطات الشاشة.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>أحسنت!</strong> لقطات الشاشة مفيدة لأوقات الحافلات والتذاكر ورسائل الخطأ وأي شيء تريد الاحتفاظ به أو إظهاره لشخص ما. يمكنك حذفها من الصور عندما تنتهي.'},
    ], {});

    // ---------- Copy and paste ----------
    const ADDRESS = '8 Harbour View, Bridlington';
    function copyChat(p, ctx) {
        const menu = ctx.copyMenu ? `<div class="ei"><div class="cv">
            <button type="button" class="cp" data-tap="reply">Reply</button>
            <button type="button" class="cp" data-tap="copy">Copy</button>
            <button type="button" class="cp" data-tap="forward">Forward</button></div></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>Sarah</strong></div>
            <div class="gf"><div class="dm them"><span>Lunch on Sunday at Jean's new flat 😊</span><small>10:02</small></div>
                <button type="button" class="dm them${ctx.copied ? ' ahs' : ''}" data-hold="address"><span>Here's her address: ${ADDRESS}</span><small>10:03</small></button></div>
            <div class="hn"><span class="rt">Text message</span></div>${menu}${navHome(p)}</div>`;
    }

    function mapsScreen(p, ctx) {
        const searchText = ctx.pasted ? ADDRESS : (ctx.place || '');
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'البحث في الخرائط'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'أرسلت إليك Sarah عنوانًا برسالة نصية. نسخه يوفر عليك كتابته من جديد. <strong>افتح الرسائل.</strong>'},
        {screen: () => app(p, 'الرسائل', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>اضغط على رسالة Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>اضغط مطولًا على الرسالة التي فيها العنوان</strong> (أبقِ إصبعك عليها لثانية أو ثانيتين) حتى تظهر قائمة.', hint: 'أبقِ إصبعك مضغوطًا على الرسالة الثانية حتى تظهر قائمة.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>اضغط على نسخ.</strong> يتذكر هاتفك الكلمات الآن، جاهزة للصقها في مكان آخر.',
         hints: {reply: '"رد" سيبدأ رسالة. اضغط على نسخ.', forward: '"إعادة توجيه" ترسل الرسالة إلى شخص ما. اضغط على نسخ.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'تم النسخ! اذهب الآن إلى الشاشة الرئيسية. هنا، <strong>اضغط على الشريط في أسفل الشاشة</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>افتح الخرائط</strong>، لتتمكن من العثور على العنوان.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>اضغط مطولًا على مربع البحث</strong> حتى يظهر زر "لصق" صغير.', hint: 'أبقِ إصبعك على مربع البحث في الأعلى.',
         hints: {'search-tap': 'الضغطة السريعة تفتح لوحة المفاتيح. اضغط مطولًا بدلًا من ذلك، حتى يظهر لصق.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>اضغط على لصق.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'يظهر العنوان كاملًا دون كتابة. <strong>اضغط على النتيجة.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'تريد نسخ رقم هاتف فقط من وسط رسالة طويلة. كيف؟', options: [
            {t: 'اضغط مطولًا، ثم اضغط على تحديد (أو اسحب المقبضين الصغيرين) لاختيار الجزء الذي تريده فقط، ثم نسخ', ok: true,
             why: 'نعم. اسحب المقبضين على جانبي الكلمات المظلّلة لاختيار ما تريده بالضبط.'},
            {t: 'لا يمكنك نسخ سوى الرسالة كلها', why: 'يمكنك اختيار جزء منها: اضغط مطولًا، ثم اضغط على تحديد، واسحب المقبضين الصغيرين.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>أحسنت!</strong> النسخ واللصق يعملان تقريبًا في كل مكان: الرسائل والبريد الإلكتروني وصفحات الويب والاستمارات. اضغط مطولًا للنسخ؛ واضغط مطولًا للصق.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'مساحة التخزين'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'مساحة تخزين الـ iPhone', [{caption: 'توصيات'},
                ctx.offloaded ? {label: 'إلغاء تحميل التطبيقات غير المستخدمة', value: 'مفعّل ⟦check⟧'} : {id: 'offload', label: 'إلغاء تحميل التطبيقات غير المستخدمة', sub: 'وفّر 2.1 جيجابايت. يزيل التطبيقات التي لا تستخدمها لكنه يحتفظ ببياناتها.', value: 'تفعيل'},
                {caption: 'التطبيقات'}, {label: 'الصور', value: '21.3 جيجابايت'}, {label: 'WhatsApp', value: ctx.cleaned ? '7.6 جيجابايت' : '14.8 جيجابايت'}, {label: 'Facebook', value: '2.4 جيجابايت'}, {label: 'BBC iPlayer', value: '1.9 جيجابايت'}],
            {back: 'عام', top: bar});
        }
        return list(p, 'مساحة التخزين', [{label: 'الصور والفيديوهات', value: '21.3 جيجابايت'}, {label: 'التطبيقات', value: ctx.cleaned ? '18.4 جيجابايت' : '25.2 جيجابايت', sub: 'بما في ذلك WhatsApp'}, {label: 'المستندات وغيرها', value: '4.1 جيجابايت'},
            {label: 'النظام', value: '7.6 جيجابايت'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ تم تنظيف 1.1 جيجابايت من الملفات غير المفيدة</p>' : '<button type="button" class="ce dk" data-tap="free-up">إخلاء مساحة</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'الإعدادات', `<div class="fo">${[['account', 'الحساب'], ['privacy', 'الخصوصية'], ['chats', 'المحادثات'], ['notifications', 'الإشعارات'], ['storage', 'التخزين والبيانات'], ['help', 'المساعدة']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'التخزين والبيانات', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7.6 جيجابايت' : '14.8 جيجابايت'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'إدارة مساحة التخزين', `<div class="iq"><span>يستخدم WhatsApp ${ctx.cleaned ? '7.6' : '14.8'} جيجابايت</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>أكبر من 5 ميغابايت</strong><small>لا شيء للمراجعة</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>أُعيد توجيهها مرات كثيرة</strong><small>112 عنصرًا · 0.9 جيجابايت</small></div>
                <div class="he">المحادثات</div><div class="ck"><strong>Family</strong><small>3.1 جيجابايت</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1.8 جيجابايت</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} ميغابايت</small></span>`).join('');
        return app(p, 'أكبر من 5 ميغابايت', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'هل تريد حذف 23 عنصرًا؟', 'ستُحذف من WhatsApp. أما الصور المحفوظة أصلًا في معرض هاتفك فتبقى هناك.', [['cancel', 'إلغاء'], ['confirm-delete', 'حذف']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'تظهر لك رسالة "مساحة التخزين ممتلئة تقريبًا"؟ لنعرف ما الذي يستهلك المساحة. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>اضغط على عام.</strong>'},
            {screen: () => list(p, 'عام', [{id: 'about', label: 'حول'}, {id: 'update', label: 'تحديث البرنامج'}, {id: 'storage', label: 'مساحة تخزين الـ iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN وإدارة الجهاز'}], {back: 'الإعدادات'}),
             target: 'storage', say: '<strong>اضغط على مساحة تخزين الـ iPhone.</strong> يستغرق الأمر بضع ثوانٍ لحساب كل شيء.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'يُظهر الشريط الملوّن ما يستهلك المساحة. أولًا، مكسب سريع: <strong>إلغاء تحميل التطبيقات غير المستخدمة</strong> يزيل التطبيقات التي لم تستخدمها منذ فترة، لكنه يحتفظ ببياناتك في حال أردت استعادتها. <strong>اضغط على تفعيل.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>اضغط على مساحة التخزين.</strong> <em>في Samsung تسمى العناية بالبطارية والجهاز، ثم مساحة التخزين.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'يُظهر الشريط الملوّن ما يستهلك المساحة. <strong>اضغط على إخلاء مساحة.</strong>'},
            {screen: () => app(p, 'الملفات', `<div class="ke"><strong>حذف الملفات غير المفيدة</strong><small>1.1 جيجابايت من الملفات المؤقتة الخاصة بالتطبيقات</small><button type="button" class="ce dk" data-tap="clean">تنظيف</button></div>
                <div class="ke"><strong>حذف لقطات الشاشة القديمة</strong><small>214 ميغابايت</small><span class="fd">حدّد وأخلِ المساحة</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'الملفات غير المفيدة يمكن حذفها بأمان: هي ملفات مؤقتة لا تحتاج إليها التطبيقات. <strong>اضغط على تنظيف.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'يستخدم WhatsApp مساحة 14.8 جيجابايت. ما الذي يملؤها؟', options: [
            {t: 'الفيديوهات والصور التي أرسلها لك الناس، خصوصًا في المجموعات', ok: true, why: 'نعم. كل فيديو يُرسل في محادثة عائلية أو جماعية يُحفظ على هاتفك. ويستطيع WhatsApp العثور على الكبيرة منها وحذفها.'},
            {t: 'رسائلك النصية', why: 'النص لا يشغل مساحة تُذكر. إنها الفيديوهات والصور التي يرسلها الناس، خصوصًا في المجموعات.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>افتح WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'في WhatsApp، اضغط على <strong>الإعدادات</strong> في أسفل اليمين. هنا هو مفتوح. <strong>اضغط على التخزين والبيانات.</strong>'
                          : 'في WhatsApp، اضغط على <strong>النقاط الثلاث ⋮</strong> في الأعلى، ثم <strong>الإعدادات</strong>. هنا هو مفتوح. <strong>اضغط على التخزين والبيانات.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>اضغط على إدارة مساحة التخزين.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'أكثر ما يوفّر المساحة في الأعلى. <strong>اضغط على أكبر من 5 ميغابايت.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'هذه فيديوهات كبيرة أرسلها لك الناس. إذا أردت الاحتفاظ بأحدها، فاحفظه في صورك أولًا. <strong>اضغط على تحديد الكل.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>اضغط على حذف.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'هذا يحذف النسخ الموجودة داخل WhatsApp فقط. <strong>اضغط على حذف</strong> للتأكيد.', hints: {cancel: 'الإلغاء يُبقيها. في هذا التدريب، اضغط على حذف.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>أحسنت!</strong> لقد أخليت أكثر من 7 جيجابايت. يستحق ذلك أن تفعله كل بضعة أشهر. أفرغ أيضًا <strong>المحذوفة مؤخرًا</strong> في الصور، فالصور المحذوفة تشغل مساحة لمدة 30 يومًا.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'الساعة العالمية'], ['alarms', 'المنبهات'], ['stopwatch', 'ساعة الإيقاف'], ['timers', 'المؤقتات']]
            : [['alarms', 'المنبه'], ['world', 'الساعة'], ['timers', 'المؤقت'], ['stopwatch', 'ساعة الإيقاف']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>اليوم</small><strong>لندن</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>أستراليا</small><strong>سيدني</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'الأقراص')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>منبه</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'الساعة العالمية' : 'الساعة') : (p === 'ios' ? 'المنبهات' : 'المنبه')}</strong>${add}</div>
            <div class="aeg">${inner}</div><div class="alq">${tabs}</div>${homeIndicator(p)}</div>`;
    }

    function alarmEdit(p, ctx) {
        const times = ['07:00', '08:00', '09:00'].map(t => `<button type="button" data-tap="t-${t.slice(0, 2)}" class="${ctx.alarmTime === t ? 'on' : ''}">${t}</button>`).join('');
        const sheet = ctx.repeatPick ? `<div class="ei"><div class="cv"><p><strong>Repeat</strong></p>
            <button type="button" class="cj" data-tap="never">Never</button><button type="button" class="cj" data-tap="weekdays">Weekdays</button>
            <button type="button" class="cj" data-tap="every-day">Every day</button></div></div>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}
            <div class="jj"><button type="button" data-tap="cancel">Cancel</button><strong>Add Alarm</strong><button type="button" data-tap="save" class="save">Save</button></div>
            <div class="ls">${times}</div>
            <div class="mw">
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'أبدًا'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'المنبه', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'يمكن للمنبه أن يذكّرك بتناول أقراصك كل يوم. <strong>افتح تطبيق الساعة.</strong>', hint: 'إنها الأيقونة السوداء التي عليها وجه ساعة أبيض.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>اضغط على ${p === 'ios' ? 'المنبهات' : 'المنبه'}</strong> في ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>اضغط على +</strong> لإضافة منبه جديد.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'في الهاتف الحقيقي تمرّر الأرقام لضبط الوقت. هنا، <strong>اضغط على 08:00</strong>.', hints: {'t-07': 'اختر 08:00 لهذا التدريب.', 't-09': 'اختر 08:00 لهذا التدريب.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'تحتاج إلى هذا كل يوم، لا مرة واحدة فقط. <strong>اضغط على التكرار.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'كل يوم'; }, say: '<strong>اضغط على كل يوم.</strong>',
         hints: {never: '"أبدًا" تعني أنه يرنّ مرة واحدة فقط. اضغط على كل يوم.', weekdays: '"أيام الأسبوع" تتخطى عطلة نهاية الأسبوع. اضغط على كل يوم.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'اكتب تسمية في مربع التسمية أولًا، مثل أقراص.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'التسمية تخبرك لماذا هذا المنبه. <strong>اضغط على مربع التسمية واكتب أقراص</strong>، ثم <strong>اضغط على حفظ</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'يرنّ المنبه الساعة 8. تتناول أقراصك. أي زر تضغط؟', options: [
            {t: 'إيقاف', ok: true, why: 'نعم. "إيقاف" يوقفه حتى الغد الساعة 8، لأنه يتكرر كل يوم.'},
            {t: 'غفوة', why: '"غفوة" تجعله يرنّ مرة أخرى بعد نحو 9 دقائق. استخدمها إذا احتجت إلى وقت أطول قليلًا، لكن "إيقاف" يوقفه حتى الغد.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>أحسنت!</strong> ينبهك منبه أقراصك الساعة 8 كل صباح. ' + (p === 'ios' ? 'في تطبيق <strong>الصحة</strong> أيضًا قسم للأدوية يذكّرك ويحتفظ بسجل.' : 'يمكنك أيضًا أن تسأل Google: "ذكّرني بتناول أقراصي كل يوم الساعة 8".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'لو ضاع هاتفك أو تعطل، هل ستكون صورك بأمان؟ لنتحقق. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>اضغط على اسمك</strong> في الأعلى.'},
        {screen: () => list(p, 'حساب Apple', [{id: 'personal', label: 'المعلومات الشخصية'}, {id: 'security', label: 'تسجيل الدخول والأمان'}, {id: 'payment', label: 'الدفع والتسليم'}, {id: 'subscriptions', label: 'الاشتراكات'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4.2 جيجابايت'}, {id: 'family', label: 'المشاركة العائلية'}, {id: 'findmy', label: 'تحديد الموقع'}], {back: 'الإعدادات'}),
         target: 'icloud', say: '<strong>اضغط على iCloud.</strong> iCloud هو التخزين عبر الإنترنت من Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'التخزين: مستخدم 4.2 جيجابايت من 5 جيجابايت'}, {caption: 'المحفوظ في iCloud'}, {id: 'photos', label: 'الصور', value: c.photoSync ? 'مفعّل' : 'إيقاف'}, {id: 'backup', label: 'النسخ الاحتياطي في iCloud', value: c.backedUp ? 'مفعّل' : 'إيقاف'},
            {label: 'جهات الاتصال', value: 'مفعّل'}, {label: 'الملاحظات', value: 'مفعّل'}], {back: 'حساب Apple'}),
         target: 'photos', say: 'الصور والنسخ الاحتياطي كلاهما <strong>متوقف</strong>. وهذا يعني أن ضياع الهاتف سيعني ضياع الصور. <strong>اضغط على الصور.</strong>'},
        {screen: c => list(p, 'الصور', [{id: 'sync', label: 'مزامنة هذا الـ iPhone', toggle: !!c.photoSync, sub: 'يحفظ صورك وفيديوهاتك في iCloud، فتكون بأمان إذا فقدت هاتفك.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>اضغط على مزامنة هذا الـ iPhone</strong> لتفعيلها.'},
        {screen: c => list(p, 'الصور', [{label: 'مزامنة هذا الـ iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>اضغط على ‹ iCloud</strong> للرجوع.'},
        {screen: c => list(p, 'iCloud', [{caption: 'التخزين: مستخدم 4.2 جيجابايت من 5 جيجابايت'}, {caption: 'المحفوظ في iCloud'}, {id: 'photos', label: 'الصور', value: 'مفعّل'}, {id: 'backup', label: 'النسخ الاحتياطي في iCloud', value: 'إيقاف'}], {back: 'حساب Apple'}),
         target: 'backup', say: 'الآن انسخ احتياطيًا كل شيء آخر: الإعدادات والرسائل والتطبيقات. <strong>اضغط على النسخ الاحتياطي في iCloud.</strong>'},
        {screen: c => list(p, 'نسخة احتياطية', [{id: 'backup-toggle', label: 'نسخ احتياطي لهذا الـ iPhone', toggle: !!c.backedUp, sub: 'ينسخ احتياطيًا تلقائيًا كل ليلة عندما يكون iPhone موصولًا بالشاحن ومقفلًا وعلى Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>اضغط على نسخ احتياطي لهذا الـ iPhone</strong> لتفعيله.'},
        {screen: () => list('ios', 'نسخة احتياطية', [{label: 'نسخ احتياطي لهذا الـ iPhone', toggle: true}, {id: 'backup-now', label: 'نسخ احتياطي الآن', sub: 'آخر نسخ احتياطي ناجح: أبدًا'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'سينسخ احتياطيًا كل ليلة من الآن فصاعدًا. قم بأول نسخة الآن: <strong>اضغط على نسخ احتياطي الآن</strong>.'},
        {screen: c => list('ios', 'نسخة احتياطية', [{label: 'نسخ احتياطي لهذا الـ iPhone', toggle: true}, {label: c.busy ? 'جارٍ النسخ الاحتياطي…' : 'نسخ احتياطي الآن', sub: c.busy ? 'متبقٍ نحو 5 دقائق' : 'آخر نسخ احتياطي ناجح: الآن ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'رسالة نصية تقول "مساحة iCloud ممتلئة. ستُحذف صورك اليوم. ادفع 99 بنسًا هنا: [link]". ماذا تفعل؟', options: [
            {t: 'تجاهل الرابط. تحقق في الإعدادات > اسمك > iCloud، ثم أعد توجيه الرسالة إلى 7726', ok: true, why: 'نعم. هذا احتيال شائع. Apple لا ترسل روابط نصية، ولا تحذف صورك بهذه الطريقة أبدًا. تحقق من مساحتك الحقيقية في الإعدادات.'},
            {t: 'ادفع بسرعة لإنقاذ الصور', why: 'هذا احتيال للحصول على بيانات بطاقتك. تحقق من مساحتك الحقيقية في الإعدادات > اسمك > iCloud، وأعد توجيه الرسالة إلى 7726.'}]}},
        {screen: () => list('ios', 'نسخة احتياطية', [{label: 'نسخ احتياطي لهذا الـ iPhone', toggle: true}, {label: 'نسخ احتياطي الآن', sub: 'آخر نسخ احتياطي ناجح: الآن ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>أحسنت!</strong> صورك وهاتفك محفوظة احتياطيًا. المساحة المجانية البالغة 5 جيجابايت تمتلئ بسرعة بالصور؛ وإذا امتلأت، فالمساحة الإضافية (iCloud+) تكلّف رسومًا شهرية صغيرة، ولا تشتريها إلا من الإعدادات، وليس من رسالة نصية أبدًا.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'لو ضاع هاتفك أو تعطل، هل ستكون صورك بأمان؟ لنتحقق. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>اضغط على Google.</strong> إنه قرب الأسفل.', hint: 'مرّر القائمة للأسفل: Google قرب الأسفل.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'إدارة حسابك على Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'نسخة احتياطية', sub: 'إيقاف'}, {id: 'autofill', label: 'الملء التلقائي'}, {id: 'devices', label: 'الأجهزة والمشاركة'}]),
         target: 'backup', say: 'النسخ الاحتياطي يقول <strong>متوقف</strong>. <strong>اضغط على النسخ الاحتياطي.</strong> <em>في Samsung: الإعدادات > الحسابات والنسخ الاحتياطي.</em>'},
        {screen: c => list(p, 'نسخة احتياطية', [{id: 'backup-toggle', label: 'النسخ الاحتياطي من Google One', toggle: !!c.backedUp, sub: 'ينسخ احتياطيًا التطبيقات والرسائل وسجل المكالمات وجهات الاتصال والإعدادات.'},
            {id: 'photos-backup', label: 'الصور والفيديوهات', sub: c.photoSync ? 'مفعّل · صور Google' : 'متوقف · صور Google'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>اضغط على النسخ الاحتياطي من Google One</strong> لتفعيله.'},
        {screen: c => list(p, 'نسخة احتياطية', [{label: 'النسخ الاحتياطي من Google One', toggle: true}, {id: 'photos-backup', label: 'الصور والفيديوهات', sub: 'متوقف · صور Google'}]),
         target: 'photos-backup', say: 'الصور منفصلة. <strong>اضغط على الصور والفيديوهات.</strong>'},
        {screen: c => list(p, 'نسخة احتياطية', [{id: 'photos-toggle', label: 'نسخ الصور والفيديوهات احتياطيًا', toggle: !!c.photoSync, sub: 'يحفظها في صور Google، فتكون بأمان إذا فقدت هاتفك.'},
            {label: 'جودة النسخ الاحتياطي', value: 'موفّر المساحة'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>اضغط على نسخ الصور والفيديوهات احتياطيًا</strong> لتفعيله.'},
        {screen: () => list(p, 'نسخة احتياطية', [{label: 'نسخ الصور والفيديوهات احتياطيًا', toggle: true}, {id: 'backup-now', label: 'النسخ الاحتياطي الآن', sub: 'آخر نسخ احتياطي: أبدًا'}]),
         target: 'backup-now', say: 'من الآن فصاعدًا ينسخ احتياطيًا من تلقاء نفسه، على Wi-Fi. قم بأول نسخة الآن: <strong>اضغط على النسخ الاحتياطي الآن</strong>.'},
        {screen: c => list(p, 'نسخة احتياطية', [{label: 'نسخ الصور والفيديوهات احتياطيًا', toggle: true}, {label: c.busy ? 'جارٍ النسخ الاحتياطي…' : 'النسخ الاحتياطي الآن', sub: c.busy ? '1,204 items left' : 'آخر نسخ احتياطي: الآن ⟦check⟧'}]), wait: 1500,
         question: {q: 'رسالة نصية تقول "مساحة Google ممتلئة. ستُحذف صورك اليوم. ادفع 99 بنسًا هنا: [link]". ماذا تفعل؟', options: [
            {t: 'تجاهل الرابط. تحقق في الإعدادات > Google > النسخ الاحتياطي، ثم أعد توجيه الرسالة إلى 7726', ok: true, why: 'نعم. هذا احتيال شائع. Google لا ترسل روابط نصية كهذه. تحقق من مساحتك الحقيقية في الإعدادات.'},
            {t: 'ادفع بسرعة لإنقاذ الصور', why: 'هذا احتيال للحصول على بيانات بطاقتك. تحقق من مساحتك الحقيقية في الإعدادات، وأعد توجيه الرسالة إلى 7726.'}]}},
        {screen: () => list(p, 'نسخة احتياطية', [{label: 'نسخ الصور والفيديوهات احتياطيًا', toggle: true}, {label: 'النسخ الاحتياطي الآن', sub: 'آخر نسخ احتياطي: الآن ⟦check⟧'}]), done: true,
         say: '<strong>أحسنت!</strong> صورك وهاتفك محفوظة احتياطيًا. تمنحك Google مساحة 15 جيجابايت مجانًا؛ وإذا امتلأت، فالمساحة الإضافية تكلّف رسومًا شهرية صغيرة، ولا تشتريها إلا من الإعدادات أو من تطبيق Google One، وليس من رسالة نصية أبدًا.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 تهانينا! 🎉</strong><p>لقد اختِرت للفوز بقسيمة تسوق بقيمة 500 جنيه إسترليني!</p>
        <button type="button" class="aeb" data-tap="claim">اطلبها الآن</button><small>إعلان</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'معلومات التطبيق', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>الإصدار 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">فتح</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">إلغاء التثبيت</button>
            <button type="button" data-tap="force-stop">إيقاف إجباري</button></div>
            <div class="cj ex"><span class="hf"><strong>البطارية</strong><small>استخدام 38% منذ آخر شحن كامل</small></span></div>
            <div class="cj ex"><span class="hf"><strong>الأذونات</strong><small>العرض فوق التطبيقات الأخرى، مشرف الجهاز</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'هل تريد إلغاء تثبيت هذا التطبيق؟', [['cancel', 'إلغاء'], ['confirm-uninstall', 'حسنًا']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>التقويم · الآن</strong>
            <span>⚠️ قد يكون iPhone مصابًا! اضغط هنا لتنظيفه الآن.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'تظهر إعلانات على شاشتك الرئيسية، مع أنه لا يوجد تطبيق مفتوح. هذا يعني عادةً أن تطبيقًا سيئًا تسلّل إلى هاتفك. أولًا، <strong>لا تضغط على الإعلان. اضغط على ⟦x⟧ الصغيرة لإغلاقه.</strong>',
         hints: {claim: 'لا تضغط على الإعلان نفسه أبدًا. ابحث عن ⟦x⟧ الصغيرة في الزاوية.'}, hint: '⟦x⟧ صغيرة، في الزاوية العلوية اليمنى من الإعلان.'},
        {screen: () => home(p), target: 'settings', say: 'التطبيقات السيئة تعمل طوال الوقت، لذا تستهلك الكثير من البطارية. بهذه الطريقة نجدها. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>اضغط على البطارية.</strong> <em>في Samsung تسمى العناية بالبطارية والجهاز، ثم البطارية.</em>'},
        {screen: () => list(p, 'البطارية', [{id: 'usage', label: 'استخدام البطارية', sub: 'عرض الاستخدام منذ آخر شحن كامل'}, {label: 'موفّر البطارية', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>اضغط على استخدام البطارية.</strong> <em>في بعض أجهزة Samsung، اضغط على الرسم البياني أو عرض التفاصيل.</em>'},
        {screen: () => list(p, 'استخدام البطارية', [], {top: `<div class="nl">${[['System Service', 38], ['الشاشة', 21], ['WhatsApp', 12], ['YouTube', 8], ['الكاميرا', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'أي من هذه يبدو غريبًا؟', options: [
            {t: 'System Service: لم تستخدمه قط، وهو يستهلك أكبر قدر من البطارية', ok: true, why: 'نعم. التطبيقات السيئة تمنح نفسها أسماء مملة مثل "System Service" أو "Keyboard Settings" حتى لا تنتبه إليها. دوّن اسمه.'},
            {t: 'الشاشة', why: 'الشاشة تستهلك دائمًا الكثير من البطارية؛ وهذا طبيعي. الغريب هو "System Service" الذي لم تستخدمه قط.'},
            {t: 'WhatsApp', why: 'WhatsApp تطبيق تستخدمه، فهذا طبيعي. الغريب هو "System Service".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'لنجده الآن بين تطبيقاتك. عد إلى الإعدادات، و<strong>اضغط على التطبيقات</strong>.'},
        {screen: () => list(p, 'التطبيقات', [{caption: 'التطبيقات المفتوحة مؤخرًا'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'عرض كل التطبيقات الـ 46'}, {id: 'default-apps', label: 'التطبيقات الافتراضية'}]),
         target: 'all-apps', say: '<strong>اضغط على عرض كل التطبيقات.</strong>'},
        {screen: () => list(p, 'كل التطبيقات', ['الآلة الحاسبة', 'التقويم', 'الكاميرا', 'Chrome', 'الساعة', 'جهات الاتصال', 'Gmail', 'الخرائط'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'القائمة مرتبة أبجديًا. <strong>اضغط على System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'زر <strong>إلغاء التثبيت</strong> رمادي ومعطّل. التطبيقات السيئة تفعل ذلك لتمنعك من إزالتها. أولًا، <strong>اضغط على إيقاف إجباري</strong> لتوقيف تشغيله.',
         hints: {uninstall: 'إنه رمادي، لذا لن يعمل بعد. اضغط على إيقاف إجباري أولًا.', open: 'لا تفتحه. اضغط على إيقاف إجباري.'}},
        {screen: () => list(p, 'البحث في الإعدادات', [{caption: 'نتائج "مشرف الجهاز"'}, {id: 'device-admin', label: 'تطبيقات مشرف الجهاز', sub: 'الأمان والخصوصية > المزيد من إعدادات الأمان'}]),
         target: 'device-admin',
         say: 'الآن اسحب منه إذنه الخاص. في الإعدادات، <strong>ابحث عن "مشرف الجهاز"</strong> باستخدام شريط البحث في الأعلى. هذه هي النتيجة: <strong>اضغط على تطبيقات مشرف الجهاز</strong>.'},
        {screen: c => list(p, 'تطبيقات مشرف الجهاز', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'هل تريد إلغاء تفعيل تطبيق مشرف الجهاز هذا؟', 'لن يستطيع System Service بعد الآن منعك من إلغاء تثبيته.', [['cancel', 'إلغاء'], ['deactivate', 'إلغاء التفعيل']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device من Google ولا بأس به. <strong>اضغط على المفتاح بجانب System Service.</strong>', hints: {'find-my': 'اترك Find My Device مفعّلًا. اضغط على System Service.'}},
        {screen: c => list(p, 'تطبيقات مشرف الجهاز', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'هل تريد إلغاء تفعيل تطبيق مشرف الجهاز هذا؟', 'لن يستطيع System Service بعد الآن منعك من إلغاء تثبيته.', [['cancel', 'إلغاء'], ['deactivate', 'إلغاء التفعيل']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>اضغط على إلغاء التفعيل.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'عدنا إلى System Service، وزر <strong>إلغاء التثبيت</strong> يعمل الآن. <strong>اضغط على إلغاء التثبيت.</strong>', hints: {'force-stop': 'إنه متوقف أصلًا. اضغط على إلغاء التثبيت.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>اضغط على حسنًا.</strong>'},
        {screen: () => home(p), target: 'store', say: 'اختفى! أخيرًا، اطلب من Google فحص أي شيء آخر. <strong>افتح متجر Play.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'لم يُعثر على تطبيقات ضارة' : 'افحص هاتفك'}</strong>
            <small>${c.scanned ? 'تم الفحص الآن' : 'آخر فحص: قبل 3 أسابيع'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'في متجر Play، اضغط على <strong>صورة ملفك الشخصي</strong> (في أعلى اليمين)، ثم <strong>Play Protect</strong>. هنا هو مفتوح. <strong>اضغط على فحص.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>لم يُعثر على تطبيقات ضارة</strong><small>تم الفحص الآن</small></div>', {color: '#fff'}), done: true,
         say: '<strong>أحسنت!</strong> وجدت التطبيق السيئ من استهلاكه للبطارية، وسحبت منه إذنه الخاص، وألغيت تثبيته وفحصت هاتفك. ولتتجنب أمثاله: ثبّت التطبيقات من متجر Play فقط، واحذر من تطبيقات المصابيح المجانية و"التنظيف" و"التسريع".'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'إشعار من التقويم يقول "قد يكون iPhone مصابًا! اضغط هنا لتنظيفه الآن." ما هذا؟', options: [
            {t: 'رسائل مزعجة تسلّلت إلى تقويمك. لا تضغط عليها', ok: true, why: 'نعم. الضغط على "سماح" في موقع مشبوه قد يضيف تقويمًا مزعجًا إلى iPhone. و"أحداثه" إعلانات تشبه التحذيرات. iPhone سليم.'},
            {t: 'تحذير حقيقي من Apple', why: 'Apple لا ترسل تحذيرات الفيروسات عبر التقويم. هذه رسائل مزعجة من تقويم مشترَك فيه. لا تضغط عليها.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'لنزيل التقويم المزعج. <strong>اضغط على الإعدادات</strong>، لا على الإشعار.', hints: {notif: 'لا تضغط على التحذير. اضغط على الإعدادات.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'مرّر للأسفل و<strong>اضغط على التطبيقات</strong>.', hint: 'التطبيقات في المجموعة الأخيرة.'},
        {screen: () => list(p, 'التطبيقات', ['App Store', 'الكتب'].map(n => ({label: n})).concat([{id: 'calendar', label: 'التقويم'}, {label: 'الكاميرا'}, {label: 'جهات الاتصال'}, {label: 'البريد'}]), {back: 'الإعدادات'}),
         target: 'calendar', say: '<strong>اضغط على التقويم.</strong>'},
        {screen: () => list(p, 'التقويم', [{id: 'accounts', label: 'حسابات التقويم', value: '2'}, {label: 'تجاوز المنطقة الزمنية', value: 'إيقاف'}, {label: 'أوقات التنبيه الافتراضية'}], {back: 'التطبيقات'}),
         target: 'accounts', say: '<strong>اضغط على حسابات التقويم.</strong>'},
        {screen: () => list(p, 'حسابات التقويم', [{caption: 'الحسابات'}, {label: 'iCloud', sub: 'التقويمات وجهات الاتصال و7 أخرى'}, {id: 'subscribed', label: 'التقويمات المشترَك فيها', value: '1'}], {back: 'التقويم'}),
         target: 'subscribed', say: 'iCloud هو حسابك الخاص. <strong>اضغط على التقويمات المشترَك فيها.</strong>'},
        {screen: () => list(p, 'التقويمات المشترَك فيها', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'مشترَك فيه'}], {back: 'حسابات التقويم'}),
         target: 'spam-cal', say: 'ها هو: تقويم لم تقصد إضافته. <strong>اضغط على Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'الخادم', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'حذف الحساب', danger: true}],
            {back: 'رجوع', overlay: c.askDelete ? dialog(p, 'هل أنت متأكد؟', 'سيؤدي هذا إلى حذف التقويم وأحداثه من iPhone.', [['cancel', 'إلغاء'], ['confirm-delete', 'حذف الحساب']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>اضغط على حذف الحساب.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'الخادم', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'حذف الحساب', danger: true}],
            {back: 'رجوع', overlay: dialog(p, 'هل أنت متأكد؟', 'سيؤدي هذا إلى حذف التقويم وأحداثه من iPhone.', [['cancel', 'إلغاء'], ['confirm-delete', 'حذف الحساب']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>اضغط على حذف الحساب</strong> للتأكيد.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'اختفى. تحقق أخير: المواقع المشبوهة قد تثبّت أيضًا "ملف تعريف". <strong>اضغط على عام.</strong>'},
        {screen: () => list(p, 'عام', [{id: 'about', label: 'حول'}, {id: 'update', label: 'تحديث البرنامج'}, {id: 'storage', label: 'مساحة تخزين الـ iPhone'}, {id: 'vpn', label: 'VPN وإدارة الجهاز'}], {back: 'الإعدادات'}),
         target: 'vpn', say: '<strong>اضغط على VPN وإدارة الجهاز.</strong>'},
        {screen: c => list(p, 'VPN وإدارة الجهاز', c.profileGone ? [{label: 'VPN', value: 'غير متصل'}] : [{label: 'VPN', value: 'غير متصل'}, {caption: 'ملف تعريف التكوين'}, {id: 'profile', label: 'Free Phone Booster', sub: 'غير موثّق'}], {back: 'عام'}),
         target: 'profile', say: 'إذا رأيت هنا ملف تعريف لا تعرفه (وملف من عملك أو مدرستك لا بأس به)، فأزله. <strong>اضغط على Free Phone Booster.</strong>'},
        {screen: c => list(p, 'ملف التعريف', [{label: 'Free Phone Booster', sub: 'غير موثّق · يحتوي على: مقاطع الويب، الشهادات'}, {caption: ' '}, {id: 'remove-profile', label: 'إزالة ملف التعريف', danger: true}],
            {back: 'رجوع', overlay: c.askRemove ? dialog(p, 'إزالة ملف التعريف', 'إزالة ملف التعريف هذا ستحذف كل إعداداته.', [['cancel', 'إلغاء'], ['confirm-remove', 'إزالة']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>اضغط على إزالة ملف التعريف</strong>. سيطلب iPhone رمز دخولك.'},
        {screen: c => list(p, 'ملف التعريف', [{label: 'Free Phone Booster', sub: 'غير موثّق'}, {caption: ' '}, {label: 'إزالة ملف التعريف', danger: true}],
            {back: 'رجوع', overlay: dialog(p, 'إزالة ملف التعريف', 'إزالة ملف التعريف هذا ستحذف كل إعداداته.', [['cancel', 'إلغاء'], ['confirm-remove', 'إزالة']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>اضغط على إزالة.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>أحسنت!</strong> اختفت التحذيرات المزيفة. ولتمنع تكرار ذلك: على المواقع، اضغط على <strong>عدم السماح</strong> أو <strong>إغلاق</strong> في أي نافذة منبثقة تطلب إضافة تقويم أو ملف تعريف، وثبّت التطبيقات من App Store فقط.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'أُلغي · ينتهي في 22 أكتوبر'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 أسبوعيًا · يتجدد في 22 أكتوبر'};
        return list(p, 'الاشتراكات', [{caption: p === 'ios' ? 'نشط' : 'نشط'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 شهريًا' : '£1.59 شهريًا'},
            {caption: p === 'ios' ? 'غير نشط' : 'منتهٍ'}, {label: 'Crossword Daily', sub: 'انتهى في 3 مارس'}], {back: p === 'ios' ? 'حساب Apple' : 'رجوع'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'اشتراكك' : 'الخطة'}, {label: 'أسبوعية', sub: '£4.99 أسبوعيًا. بدأ كتجربة مجانية لمدة 3 أيام.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'إلغاء الاشتراك' : 'إلغاء الاشتراك', danger: true}],
            {back: 'الاشتراكات', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'تأكيد الإلغاء' : 'هل تريد إلغاء الاشتراك؟', 'يمكنك مواصلة استخدامه حتى 22 أكتوبر. ولن يُخصم منك مبلغ مرة أخرى.', [['keep', p === 'ios' ? 'ليس الآن' : 'إبقاء']].concat([['confirm-cancel', p === 'ios' ? 'تأكيد' : 'إلغاء الاشتراك']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'كثيرًا ما تتحول التجارب المجانية إلى خطط مدفوعة دون أن تلاحظ. لنتحقق. <strong>اضغط على الإعدادات.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>اضغط على اسمك</strong> في الأعلى.'},
            {screen: () => list(p, 'حساب Apple', [{id: 'personal', label: 'المعلومات الشخصية'}, {id: 'security', label: 'تسجيل الدخول والأمان'}, {id: 'payment', label: 'الدفع والتسليم'}, {id: 'subscriptions', label: 'الاشتراكات'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'الإعدادات'}),
             target: 'subscriptions', say: '<strong>اضغط على الاشتراكات.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'كثيرًا ما تتحول التجارب المجانية إلى خطط مدفوعة دون أن تلاحظ. لنتحقق. <strong>افتح متجر Play.</strong>'},
            {screen: c => app(p, 'متجر Play', `<div class="hp"><span>مقترح لك</span><strong>تطبيقات لتبدأ بها</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>اضغط على صورة ملفك الشخصي</strong>، الحرف الدائري في أعلى اليمين.'},
            {screen: c => app(p, 'متجر Play', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>اضغط على المدفوعات والاشتراكات.</strong>'},
            {screen: () => list(p, 'المدفوعات والاشتراكات', [{id: 'methods', label: 'طرق الدفع'}, {id: 'subscriptions', label: 'الاشتراكات', sub: 'إدارة اشتراكاتك'}, {id: 'budget', label: 'الميزانية والسجل'}]),
             target: 'subscriptions', say: '<strong>اضغط على الاشتراكات.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: 'بدأ "Photo Editor Pro" كتجربة مجانية وهو الآن <strong>£4.99 كل أسبوع</strong>. هذا أكثر من £250 في السنة! <strong>اضغط عليه.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'إلغاء الاشتراك' : 'إلغاء الاشتراك'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'تأكيد' : 'إلغاء الاشتراك'}.</strong>`, hints: {keep: 'هذا يواصل الدفع. اضغط على ' + (p === 'ios' ? 'تأكيد' : 'إلغاء الاشتراك') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'حذف تطبيق Photo Editor من هاتفك. هل يوقف ذلك المدفوعات؟', options: [
            {t: 'لا. عليك إلغاء الاشتراك، كما فعلت للتو', ok: true, why: 'تمامًا. حذف التطبيق لا يلغي الاشتراك. تستمر في الدفع إلى أن تلغيه هنا.'},
            {t: 'نعم، حذف التطبيق يوقفه', why: 'لا يوقفه! تستمر في الدفع إلى أن تلغي الاشتراك نفسه، هنا.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>أحسنت!</strong> لقد وفّرت £4.99 في الأسبوع. نصيحة: عندما تبدأ تجربة مجانية، اضبط منبهًا قبل يوم من انتهائها. وتفقّد أيضًا قائمة المدفوعات المنتظمة في تطبيق مصرفك بين الحين والآخر.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'في أجهزة iPhone الأحدث <strong>Apple Intelligence</strong>: ذكاء اصطناعي يكتب ويلخّص ويحرّر لك. يمكنك إيقافه. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>اضغط على Apple Intelligence وSiri.</strong>', hint: 'إنه في المجموعة الثالثة، تحت تسهيلات الاستخدام.'},
        {screen: c => list(p, 'Apple Intelligence وSiri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'أدوات الكتابة وملخصات الإشعارات وImage Playground وغيرها.'},
            {caption: 'الإضافات'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'إيقاف' : 'مفعّل'}, {caption: 'SIRI'}, {label: 'التحدث إلى Siri', value: '"Siri" أو "Hey Siri"'}],
            {back: 'الإعدادات', overlay: c.askOff ? dialog(p, 'هل تريد إيقاف Apple Intelligence؟', 'لن تتوفر ميزات مثل أدوات الكتابة والملخصات بعد ذلك.', [['cancel', 'إلغاء'], ['confirm-off', 'إيقاف']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>اضغط على مفتاح Apple Intelligence</strong> لإيقافه.', hints: {chatgpt: 'سنتناول ChatGPT بعد ذلك. أولًا، اضغط على مفتاح Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence وSiri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'الإضافات'}, {label: 'ChatGPT', value: 'مفعّل'}],
            {back: 'الإعدادات', overlay: dialog(p, 'هل تريد إيقاف Apple Intelligence؟', 'لن تتوفر ميزات مثل أدوات الكتابة والملخصات بعد ذلك.', [['cancel', 'إلغاء'], ['confirm-off', 'إيقاف']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>اضغط على إيقاف.</strong>'},
        {screen: c => list(p, 'Apple Intelligence وSiri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'الإضافات'}, {id: 'chatgpt', label: 'ChatGPT', value: 'مفعّل'}], {back: 'الإعدادات'}),
         target: 'chatgpt', say: 'يمكن لإضافة ChatGPT إرسال أسئلتك إلى ChatGPT، وهي شركة خارج Apple. <strong>اضغط على ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'استخدام ChatGPT', toggle: !c.gptOff, sub: 'يمكن لـ Siri إرسال الطلبات إلى ChatGPT.'}], {back: 'رجوع'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>اضغط على استخدام ChatGPT</strong> لإيقافه.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'استخدام ChatGPT', toggle: false}], {back: 'رجوع'}),
         question: {q: 'في WhatsApp وFacebook وتطبيقات أخرى محادثات ذكاء اصطناعي أيضًا. ما القاعدة الآمنة؟', options: [
            {t: 'لا تكتب تفاصيل شخصية (مصرف، صحة، كلمات مرور، عناوين) في أي محادثة ذكاء اصطناعي أبدًا', ok: true, why: 'نعم. ما تكتبه قد يُخزَّن ويُستخدم لتدريب الذكاء الاصطناعي. تعامل معه كأنك تتحدث إلى غريب.'},
            {t: 'محادثات الذكاء الاصطناعي خاصة، فلا بأس بأي شيء', why: 'ليست خاصة كالمكالمة الهاتفية. ما تكتبه قد يُخزَّن. أبقِ التفاصيل الشخصية خارجها.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'استخدام ChatGPT', toggle: false}], {back: 'رجوع'}), done: true,
         say: '<strong>أحسنت!</strong> Apple Intelligence وChatGPT متوقفان. يمكنك إعادة تفعيلهما في أي وقت من المكان نفسه. ويبقى Siri يعمل كالمعتاد.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'تأتي هواتف Android الآن مع <strong>Gemini</strong>، الذكاء الاصطناعي من Google. الضغط مطولًا على زر التشغيل قد يفتحه بالخطأ. لنغيّر ذلك. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>اضغط على التطبيقات.</strong>'},
        {screen: () => list(p, 'التطبيقات', [{caption: 'التطبيقات المفتوحة مؤخرًا'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'عرض كل التطبيقات الـ 45'}, {id: 'default-apps', label: 'التطبيقات الافتراضية', sub: 'تطبيقات المساعد والمتصفح والهاتف'}]),
         target: 'default-apps', say: '<strong>اضغط على التطبيقات الافتراضية.</strong>'},
        {screen: () => list(p, 'التطبيقات الافتراضية', [{label: 'تطبيق المتصفح', sub: 'Chrome'}, {id: 'assistant', label: 'تطبيق المساعد الرقمي', sub: 'Gemini'}, {label: 'تطبيق الهاتف', sub: 'الهاتف'}, {label: 'تطبيق الرسائل النصية', sub: 'الرسائل'}]),
         target: 'assistant', say: '<strong>اضغط على تطبيق المساعد الرقمي.</strong>'},
        {screen: c => list(p, 'تطبيق المساعد الرقمي', [{id: 'assistant-app', label: 'تطبيق المساعد الرقمي الافتراضي', sub: c.noAssist ? 'بلا' : 'Gemini'}, {label: 'استخدام النص من الشاشة', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>تطبيق المساعد الرقمي الافتراضي</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">بلا</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>اضغط على تطبيق المساعد الرقمي الافتراضي.</strong>'},
        {screen: c => list(p, 'تطبيق المساعد الرقمي', [{label: 'تطبيق المساعد الرقمي الافتراضي', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>تطبيق المساعد الرقمي الافتراضي</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">بلا</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>اضغط على بلا.</strong> لن يظهر Gemini عند الضغط مطولًا على زر التشغيل.', hints: {'assist-gemini': 'هذا يُبقي Gemini. اضغط على بلا.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'بعد ذلك، امنع Gemini من الاحتفاظ بما تكتبه له. <strong>افتح تطبيق Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">مرحبًا Margaret<br><small>كيف يمكنني مساعدتك اليوم؟</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>اضغط على صورة ملفك الشخصي</strong> في أعلى اليمين.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>اضغط على نشاط تطبيقات Gemini.</strong> <em>في بعض الهواتف تسمى Keep Activity.</em>'},
        {screen: c => app(p, 'نشاط تطبيقات Gemini', `<p class="cf"><strong>${c.actOff ? 'إيقاف' : 'مفعّل'}</strong><br>${c.actOff ? 'لم تعد محادثاتك تُحفظ في حسابك أو تُستخدم لتحسين الذكاء الاصطناعي من Google.' : 'تُحفظ محادثاتك في حساب Google الخاص بك وقد تُراجَع لتحسين الذكاء الاصطناعي من Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">إيقاف</button><button type="button" class="cj" data-tap="off-delete">إيقاف وحذف النشاط</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>اضغط على إيقاف.</strong>'},
        {screen: c => app(p, 'نشاط تطبيقات Gemini', '<p class="cf"><strong>مفعّل</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">إيقاف</button><button type="button" class="cj" data-tap="off-delete">إيقاف وحذف النشاط</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>اضغط على إيقاف وحذف النشاط</strong>، لمسح ما حفظه سابقًا أيضًا.', hints: {'off-only': 'هذا يوقف حفظ المحادثات الجديدة لكنه يُبقي القديمة. اضغط على إيقاف وحذف النشاط.'}},
        {screen: c => app(p, 'نشاط تطبيقات Gemini', '<p class="cf"><strong>متوقف</strong></p>', {color: '#fff'}),
         question: {q: 'في WhatsApp وFacebook وتطبيقات أخرى محادثات ذكاء اصطناعي أيضًا. ما القاعدة الآمنة؟', options: [
            {t: 'لا تكتب تفاصيل شخصية (مصرف، صحة، كلمات مرور، عناوين) في أي محادثة ذكاء اصطناعي أبدًا', ok: true, why: 'نعم. ما تكتبه قد يُخزَّن ويُستخدم لتدريب الذكاء الاصطناعي. تعامل معه كأنك تتحدث إلى غريب.'},
            {t: 'محادثات الذكاء الاصطناعي خاصة، فلا بأس بأي شيء', why: 'ليست خاصة كالمكالمة الهاتفية. ما تكتبه قد يُخزَّن. أبقِ التفاصيل الشخصية خارجها.'}]}},
        {screen: c => app(p, 'نشاط تطبيقات Gemini', '<p class="cf"><strong>متوقف</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>أحسنت!</strong> لم يعد Gemini يظهر من زر التشغيل، ولا يحتفظ بمحادثاتك. وفي Samsung، ابحث أيضًا في <strong>الإعدادات > Galaxy AI</strong>، حيث لكل ميزة مفتاحها الخاص.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'يحتفظ حساب Apple بصورك وجهات اتصالك ومدفوعاتك. لنتحقق من أنه محمي. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>اضغط على اسمك</strong> في الأعلى.'},
        {screen: () => list(p, 'حساب Apple', [{id: 'personal', label: 'المعلومات الشخصية'}, {id: 'security', label: 'تسجيل الدخول والأمان'}, {id: 'payment', label: 'الدفع والتسليم'}, {id: 'subscriptions', label: 'الاشتراكات'}], {back: 'الإعدادات'}),
         target: 'security', say: '<strong>اضغط على تسجيل الدخول والأمان.</strong>'},
        {screen: () => list(p, 'تسجيل الدخول والأمان', [{label: 'البريد الإلكتروني وأرقام الهاتف', sub: '+44 7700 900123'}, {label: 'تغيير كلمة المرور'}, {caption: ' '}, {label: 'المصادقة الثنائية', value: 'مفعّل'},
            {id: 'recovery', label: 'استرداد الحساب'}], {back: 'حساب Apple'}),
         target: 'recovery', say: '<strong>المصادقة الثنائية</strong> تقول مفعّلة: جيد. هذا يعني أن الجهاز الجديد يحتاج إلى رمز من هاتفك قبل أن يسجّل الدخول. الآن، <strong>اضغط على استرداد الحساب</strong>.'},
        {screen: c => list(p, 'استرداد الحساب', [{caption: 'جهة اتصال الاسترداد'}, c.recovery ? {label: 'Sarah', sub: 'في انتظار قبول Sarah'} : {id: 'add-contact', label: 'إضافة جهة اتصال للاسترداد…', sub: 'شخص تثق به يستطيع مساعدتك في استعادة الدخول إلى حسابك.'}],
            {back: 'رجوع', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>اختر جهة اتصال للاسترداد</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (الابنة)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'إذا نسيت كلمة مرورك يومًا، يمكن لـ<strong>جهة اتصال الاسترداد</strong> أن تحصل لك على رمز يساعدك على العودة. ولا تستطيع رؤية بياناتك. <strong>اضغط على إضافة جهة اتصال للاسترداد.</strong>'},
        {screen: c => list(p, 'استرداد الحساب', [{caption: 'جهة اتصال الاسترداد'}, {label: 'إضافة جهة اتصال للاسترداد…'}],
            {back: 'رجوع', overlay: `<div class="ei"><div class="cv"><p><strong>اختر جهة اتصال للاسترداد</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (الابنة)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'اختر شخصًا تثق به لديه iPhone. <strong>اضغط على Sarah.</strong>', hints: {'pick-dave': 'في هذا التدريب، اختر Sarah.'}},
        {screen: c => list(p, 'استرداد الحساب', [{caption: 'جهة اتصال الاسترداد'}, {label: 'Sarah', sub: 'في انتظار قبول Sarah'}], {back: 'رجوع'}),
         question: {q: 'يتصل بك شخص ويقول إنه من Apple. يطلب منك أن تقرأ له الرمز المكوّن من 6 أرقام الذي ظهر للتو على هاتفك. ماذا تفعل؟', options: [
            {t: 'أنهِ المكالمة. لا تعطِ هذا الرمز لأحد أبدًا', ok: true, why: 'تمامًا. هذا الرمز يُدخل شخصًا إلى حسابك. لن تتصل بك Apple أبدًا لتطلبه.'},
            {t: 'اقرأه له، فهو من Apple', why: 'لن تطلب منك Apple هذا الرمز أبدًا. أي شخص يحصل عليه يستطيع دخول حسابك. أنهِ المكالمة.'}]}},
        {screen: c => list(p, 'استرداد الحساب', [{caption: 'جهة اتصال الاسترداد'}, {label: 'Sarah', sub: 'في انتظار قبول Sarah'}], {back: 'رجوع'}), done: true,
         say: '<strong>أحسنت!</strong> المصادقة الثنائية مفعّلة وتستطيع Sarah مساعدتك في العودة. ويستطيع iPhone أيضًا تذكّر كلمات المرور عنك، في تطبيق <strong>كلمات السر</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'يحتفظ حساب Google ببريدك الإلكتروني وصورك وجهات اتصالك. لنضف إليه قفلًا ثانيًا. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>اضغط على Google.</strong>', hint: 'Google قرب أسفل القائمة.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'إدارة حسابك على Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'نسخة احتياطية'}, {id: 'autofill', label: 'الملء التلقائي'}]),
         target: 'manage', say: '<strong>اضغط على إدارة حسابك على Google.</strong>'},
        {screen: () => app(p, 'حساب Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>اضغط على الأمان</strong> في الشريط العلوي.'},
        {screen: c => list(p, 'الأمان', [{caption: 'كيف تسجّل الدخول إلى Google'}, {id: '2sv', label: 'التحقق بخطوتين', sub: c.twoOn ? 'مفعّل' : 'إيقاف'}, {label: 'كلمة مرور', sub: 'آخر تغيير قبل سنتين'}, {label: 'هاتف الاسترداد', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>التحقق بخطوتين</strong> متوقف. وهذا يعني أن تسجيل الدخول على جهاز جديد يحتاج أيضًا إلى رمز يُرسل إلى هاتفك، فلا تكفي كلمة مرور مسروقة. <strong>اضغط عليه.</strong>'},
        {screen: () => list(p, 'التحقق بخطوتين', [], {top: '<p class="cf">رقم هاتفك: <strong>07700 900123</strong><br>سنرسل رمزًا نصيًا إلى هذا الرقم للتأكد من أنه رقمك.</p><button type="button" class="ce dk" data-tap="send-code">إرسال الرمز</button>'}),
         target: 'send-code', say: '<strong>اضغط على إرسال الرمز.</strong>'},
        {screen: c => list(p, 'التحقق بخطوتين', [], {top: `<div class="sd"><strong>الرسائل · الآن</strong><span>G-382605 هو رمز التحقق الخاص بك من Google.</span></div>
            <p class="cf">أدخل الرمز الذي أرسلناه برسالة نصية إلى 07700 900123</p>${field('gcode', 'أدخل الرمز', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">التالي</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'اكتب الأرقام الستة من الرسالة النصية: 382605.',
         say: 'تصلك رسالة نصية فيها رمز. <strong>اكتب 382605 في المربع</strong> و<strong>اضغط على التالي</strong>. <em>(رمز تدريبي. لا تكتب رمزًا حقيقيًا في أي مكان إلا حيث طُلب منك.)</em>'},
        {screen: () => list(p, 'التحقق بخطوتين', [], {top: '<p class="cf">تم التحقق من رقم هاتفك ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">تفعيل التحقق بخطوتين</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>اضغط على تفعيل التحقق بخطوتين.</strong>'},
        {screen: c => list(p, 'الأمان', [{caption: 'كيف تسجّل الدخول إلى Google'}, {label: 'التحقق بخطوتين', sub: 'مفعّل ⟦check⟧'}, {label: 'هاتف الاسترداد', sub: '07700 900123'}]),
         question: {q: 'يتصل بك شخص ويقول إنه من Google. يطلب منك أن تقرأ له الرمز الذي أُرسل إليك للتو برسالة نصية. ماذا تفعل؟', options: [
            {t: 'أنهِ المكالمة. لا تعطِ هذا الرمز لأحد أبدًا', ok: true, why: 'تمامًا. هذا الرمز يُدخل شخصًا إلى حسابك. لن تتصل بك Google أبدًا لتطلبه.'},
            {t: 'اقرأه له، فهو من Google', why: 'لن تطلب منك Google هذا الرمز أبدًا. أي شخص يحصل عليه يستطيع دخول حسابك. أنهِ المكالمة.'}]}},
        {screen: c => list(p, 'الأمان', [{caption: 'كيف تسجّل الدخول إلى Google'}, {label: 'التحقق بخطوتين', sub: 'مفعّل ⟦check⟧'}]), done: true,
         say: '<strong>أحسنت!</strong> أصبح حساب Google يحتاج إلى هاتفك إضافة إلى كلمة مرورك. ويمكن لـ Google أيضًا تذكّر كلمات مرورك: ابحث عن <strong>مدير كلمات المرور في Google</strong> في الإعدادات.'},
    ], {input: {}});

    // ---------- Facebook privacy and fake friend requests ----------
    const FB = '#1877f2';
    const fbApp = ['facebook', 'Facebook', FB, ICON.person];
    function fbScreen(p, ctx, page) {
        const tabs = `<div class="ml"><button type="button" data-tap="tab-home" class="${page === 'feed' ? 'on' : ''}">Home</button>
            <button type="button" data-tap="tab-friends" class="${page === 'friends' ? 'on' : ''}">Friends${ctx.requestGone ? '' : ' <em>1</em>'}</button>
            <button type="button" data-tap="tab-menu" class="${page === 'menu' ? 'on' : ''}">Menu</button></div>`;
        let inner;
        if (page === 'feed') {
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>نزهة جميلة على الواجهة البحرية هذا الصباح! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>النزهة القادمة: السبت، الساعة 10 صباحًا، من الميناء.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">لا توجد طلبات صداقة جديدة.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>اعرض ملفك الشخصي</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>الإعدادات والخصوصية</strong></button><div class="ck"><strong>المساعدة والدعم</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'لنتأكد من أن أصدقاءك فقط يرون ما تنشره. <strong>افتح Facebook.</strong> <em>(نسخة تدريبية. وليس التطبيق الحقيقي.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>اضغط على القائمة</strong> في أسفل اليمين.', hints: {'tab-friends': 'سننظر في طلبات الصداقة بعد قليل. أولًا، اضغط على القائمة.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>اضغط على الإعدادات والخصوصية</strong>.'},
        {screen: c => list(p, 'الإعدادات', [{caption: 'الجمهور والظهور'}, {id: 'posts', label: 'المنشورات', sub: 'من يمكنه رؤية منشوراتك المستقبلية: ' + (c.audience || 'عام')}, {label: 'تفاصيل الملف الشخصي'}, {label: 'كيف يجدك الناس ويتواصلون معك'},
            {caption: 'نشاطك'}, {label: 'سجل النشاط'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>من يمكنه رؤية منشوراتك المستقبلية؟</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ عام<small>أي شخص على Facebook أو خارجه</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ الأصدقاء<small>أصدقاؤك على Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ أنا فقط</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'منشوراتك مضبوطة على <strong>عام</strong>: يستطيع أي شخص في العالم رؤيتها. <strong>اضغط على المنشورات.</strong>'},
        {screen: c => list(p, 'الإعدادات', [{caption: 'الجمهور والظهور'}, {label: 'المنشورات', sub: 'من يمكنه رؤية منشوراتك المستقبلية: عام'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>من يمكنه رؤية منشوراتك المستقبلية؟</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ عام<small>أي شخص على Facebook أو خارجه</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ الأصدقاء<small>أصدقاؤك على Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ أنا فقط</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'الأصدقاء'; }, say: '<strong>اضغط على الأصدقاء.</strong>',
         hints: {'aud-public': '"عام" هو ما كان عليه. اضغط على الأصدقاء.', 'aud-me': '"أنا فقط" تعني أن لا أحد غيرك يرى منشوراتك. اضغط على الأصدقاء.'}},
        {screen: c => list(p, 'الإعدادات', [{caption: 'الجمهور والظهور'}, {label: 'المنشورات', sub: 'من يمكنه رؤية منشوراتك المستقبلية: الأصدقاء ⟦check⟧'}, {id: 'back-feed', label: '‹ العودة إلى Facebook'}]),
         target: 'back-feed', say: 'تم. الآن <strong>اضغط على العودة إلى Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'لديك طلب صداقة. <strong>اضغط على الأصدقاء.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'طلب صداقة من "Jean Smith". لكنك صديقة Jean أصلًا (تظهر في خلاصتك). ما الذي يحدث؟', options: [
            {t: 'على الأرجح هو نسخة من ملف Jean الشخصي أنشأها محتال', ok: true, why: 'نعم. ينسخ المحتالون اسم شخص وصورته، ثم يراسلون أصدقاءه طالبين مالًا. Jean الحقيقية صديقتك أصلًا.'},
            {t: 'لا بد أن لدى Jean حسابًا ثانيًا', why: 'ممكن، لكن الأرجح كثيرًا أنه نسخة أنشأها محتال: فقد انضم قبل يومين. تأكد من Jean بالاتصال بها.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>اضغط على حذف</strong> لرفض الطلب.', hints: {'confirm-jean': 'لا تقبل ملفًا شخصيًا منسوخًا. اضغط على حذف.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>أحسنت!</strong> منشوراتك للأصدقاء فقط وقد تجنبت ملفًا مزيفًا. أخبر Jean حتى تبلّغ عنه. وكن حذرًا أيضًا من مشترين في Marketplace يريدون الدفع "عبر مندوب توصيل" أو يطلبون رموزًا أُرسلت إلى هاتفك.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'ابحث هنا'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>محطة حافلات وقطارات، Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>مستشفى، Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>كنيسة، Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>محطة حافلات وقطارات · 25 ميلًا</small><button type="button" class="ce co" data-tap="directions">الاتجاهات</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 دقيقة (25 ميلًا)</strong><small>أسرع طريق، عبر A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 ← 11:40</strong><ol class="aik"><li>⟦footprints⟧ امشِ 4 دقائق إلى <strong>Bridlington Bus Station</strong>، الرصيف 3</li>
                <li>⟦bus⟧ <strong>121</strong> باتجاه Hull · 10:15 · <b class="ahy">في الموعد</b></li><li>انزل عند <strong>Hull Paragon Interchange</strong> (24 محطة)</li></ol>
                <button type="button" class="ce co" data-tap="start">ابدأ</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'تستطيع الخرائط تخطيط رحلة بالحافلة، مع أوقات مباشرة. لنذهب إلى Hull بالحافلة. <strong>افتح الخرائط.</strong>' + (p === 'ios' ? ' <em>(Google Maps يعمل بالطريقة نفسها، إن فضّلته.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>اضغط على مربع البحث</strong> في الأعلى.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'كتبنا "Hull interchange". <strong>اضغط على Hull Paragon Interchange</strong>، محطة الحافلات.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>اضغط على الاتجاهات.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'يعرض القيادة أولًا. <strong>اضغط على الحافلة</strong> ⟦bus⟧ لترى النقل العام.', hints: {'mode-walk': 'ثماني ساعات! اضغط على الحافلة بدلًا من ذلك.', 'mode-car': 'هذه القيادة. اضغط على الحافلة.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'هذه هي الحافلات، والتالية أولًا. "في الموعد" مباشر. <strong>اضغط على رحلة 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'من أين تركب الحافلة؟', options: [
            {t: 'Bridlington Bus Station، الرصيف 3', ok: true, why: 'نعم. تخبرك الخرائط إلى أين تمشي، وأي حافلة، وأين تنزل.'},
            {t: 'Hull Paragon Interchange', why: 'هذا هو المكان الذي تنزل فيه. تركبها من Bridlington Bus Station، الرصيف 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>أحسنت!</strong> اضغط على <strong>ابدأ</strong> في رحلة حقيقية فتخبرك الخرائط عندما تقترب محطتك. ومع بطاقة الحافلات، تُريها للسائق كالمعتاد. <em>(أوقات تدريبية فقط: تحقق من الأوقات الحقيقية في يوم الرحلة.)</em>'},
    ], {});

    // The extra lessons (emergency, problems, and additions to other courses).
    // ======================================================================================
    // Shared bits for the emergency, problems and extra lessons
    // ======================================================================================
    // A phone keypad with * and #. shown: what's been typed so far.
    function dialer(p, shown, opts = {}) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const id = k => 'k' + (k === '*' ? 'star' : k === '#' ? 'hash' : k);
        return `<div class="cg xr ph-${p}">${statusBar(p)}
            <div class="xs">${esc(shown || '')}<span class="tx"></span></div>
            <div class="so">${keys.map(k => `<button type="button" data-tap="${id(k)}">${k}</button>`).join('')}</div>
            <div class="qv"><button type="button" class="tn" data-tap="call" aria-label="Call">${UI.phone}</button></div>
            ${opts.overlay || ''}${homeIndicator(p)}</div>`;
    }
    const dialKeys = s => [...s].map(k => 'k' + (k === '*' ? 'star' : k === '#' ? 'hash' : k));

    function lockScreen(p, notif, opts = {}) {
        return `<div class="agl ph-${p}">${statusBar(p)}<div class="wr"><small>${NOW.long()}</small>${NOW.time()}</div>
            ${notif ? `<button type="button" class="po" data-tap="${notif.id}"><strong>${notif.app} · now</strong><span><b>${notif.title}</b>${notif.text}</span></button>` : ''}
            ${opts.extra || ''}${homeIndicator(p)}</div>`;
    }

    const sheet = (title, rows) => `<div class="ei"><div class="cv">${title ? `<p><strong>${title}</strong></p>` : ''}${rows.map(([id, label, sub]) =>
        `<button type="button" class="cj" data-tap="${id}">${label}${sub ? `<small>${sub}</small>` : ''}</button>`).join('')}</div></div>`;

    // ======================================================================================
    // Course: In an emergency
    // ======================================================================================
    SCENARIOS['emergency-sos'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '<strong>الطوارئ SOS</strong> تتصل بالرقم 999 عنك وترسل موقعك برسالة نصية إلى الأشخاص الذين تختارهم. لنتحقق من أنها جاهزة. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>اضغط على الطوارئ SOS.</strong>', hint: 'إنها في المجموعة الثالثة، بأيقونة حمراء.'},
        {screen: c => list(p, 'الطوارئ SOS', [{label: 'الاتصال بالضغط المطوّل ثم الإفلات', toggle: true, sub: 'اضغط مطولًا على الزر الجانبي وأحد زرّي الصوت، ثم أفلتهما.'},
            {id: 'five', label: 'الاتصال بـ 5 ضغطات على الزر', toggle: !!c.five, sub: 'اضغط على الزر الجانبي 5 مرات بسرعة.'}, {caption: ' '},
            {id: 'contacts', label: 'إعداد جهات اتصال الطوارئ في الصحة'}, {label: 'اكتشاف الاصطدام', toggle: true, sub: 'يتصل بالرقم 999 بعد حادث سيارة شديد.'}], {back: 'الإعدادات'}),
         target: 'five', action: c => { c.five = true; }, say: 'الضغط على الزر الجانبي 5 مرات سهل التذكّر في لحظة الذعر. <strong>فعّل الاتصال بـ 5 ضغطات على الزر.</strong>'},
        {screen: c => list(p, 'الطوارئ SOS', [{label: 'الاتصال بالضغط المطوّل ثم الإفلات', toggle: true}, {label: 'الاتصال بـ 5 ضغطات على الزر', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'إعداد جهات اتصال الطوارئ في الصحة'}], {back: 'الإعدادات', overlay: c.pick ? sheet('إضافة جهة اتصال للطوارئ', [['pick-sarah', 'Sarah', 'الابنة · 07700 900333'], ['pick-dave', 'Dave', 'صديق']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'الآن اختر من يتلقى رسالة نصية بموقعك. <strong>اضغط على إعداد جهات اتصال الطوارئ.</strong>'},
        {screen: () => list(p, 'الطوارئ SOS', [{label: 'الاتصال بـ 5 ضغطات على الزر', toggle: true}], {back: 'الإعدادات', overlay: sheet('إضافة جهة اتصال للطوارئ', [['pick-sarah', 'Sarah', 'الابنة · 07700 900333'], ['pick-dave', 'Dave', 'صديق']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>اضغط على Sarah</strong>، ابنتك.', hints: {'pick-dave': 'اختر Sarah لهذا التدريب.'}},
        {screen: () => list(p, 'الطوارئ SOS', [{label: 'الاتصال بـ 5 ضغطات على الزر', toggle: true}, {caption: 'جهات اتصال الطوارئ'}, {label: 'Sarah', sub: 'الابنة'}], {back: 'الإعدادات'}),
         question: {q: 'سقطت ولا تستطيع الوصول إلى شاشة الهاتف جيدًا. ماذا تفعل؟', options: [
            {t: 'اضغط على الزر الجانبي 5 مرات بسرعة', ok: true, why: 'نعم. يبدأ عدّ تنازلي، ثم يتصل بالرقم 999 ويرسل إلى Sarah رسالة نصية بمكانك.'},
            {t: 'افتح قفل الهاتف وابحث عن تطبيق الهاتف', why: 'هذا بطيء في حالة الطوارئ. الضغط على الزر الجانبي 5 مرات يعمل حتى وهو مقفل.'}]}},
        {screen: () => list(p, 'الطوارئ SOS', [{label: 'الاتصال بـ 5 ضغطات على الزر', toggle: true}, {caption: 'جهات اتصال الطوارئ'}, {label: 'Sarah', sub: 'الابنة'}], {back: 'الإعدادات'}), done: true,
         say: '<strong>أحسنت!</strong> الطوارئ SOS جاهزة وسيُبلَّغ Sarah بمكانك. وإذا ضغطت عليها بالخطأ، فاضغط على إيقاف أثناء العدّ التنازلي.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>الطوارئ SOS</strong> تتصل بالرقم 999 عنك وترسل موقعك برسالة نصية إلى الأشخاص الذين تختارهم. لنتحقق من أنها جاهزة. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>اضغط على السلامة والطوارئ.</strong> <em>في Samsung تسمى السلامة والطوارئ أيضًا.</em>', hint: 'مرّر للأسفل: إنه قرب الأسفل.'},
        {screen: () => list(p, 'السلامة والطوارئ', [{id: 'medical', label: 'المعلومات الطبية'}, {id: 'contacts-ec', label: 'جهات اتصال الطوارئ'}, {id: 'sos', label: 'الطوارئ SOS', sub: 'إيقاف'}, {label: 'اكتشاف حوادث السيارات'}]),
         target: 'sos', say: 'الطوارئ SOS <strong>متوقفة</strong>. <strong>اضغط على الطوارئ SOS.</strong>'},
        {screen: c => list(p, 'الطوارئ SOS', [{id: 'sos-toggle', label: 'استخدام الطوارئ SOS', toggle: !!c.sosOn, sub: 'اضغط على زر التشغيل 5 مرات أو أكثر لبدء إجراءات الطوارئ.'}, {label: 'مشاركة المعلومات مع جهات اتصال الطوارئ', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>اضغط على استخدام الطوارئ SOS</strong> لتفعيلها.'},
        {screen: () => list(p, 'السلامة والطوارئ', [{id: 'medical', label: 'المعلومات الطبية'}, {id: 'contacts-ec', label: 'جهات اتصال الطوارئ', sub: 'بلا'}, {label: 'الطوارئ SOS', sub: 'مفعّل'}]),
         target: 'contacts-ec', say: 'الآن اختر من يتلقى رسالة نصية بموقعك. <strong>اضغط على جهات اتصال الطوارئ.</strong>'},
        {screen: c => list(p, 'جهات اتصال الطوارئ', [{id: 'add', label: '＋ إضافة جهة اتصال'}], {overlay: c.pick ? sheet('اختر جهة اتصال', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>اضغط على إضافة جهة اتصال.</strong>'},
        {screen: () => list(p, 'جهات اتصال الطوارئ', [{label: '＋ إضافة جهة اتصال'}], {overlay: sheet('اختر جهة اتصال', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>اضغط على Sarah</strong>، ابنتك.', hints: {'pick-dave': 'اختر Sarah لهذا التدريب.'}},
        {screen: () => list(p, 'جهات اتصال الطوارئ', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ إضافة جهة اتصال'}]),
         question: {q: 'سقطت ولا تستطيع الوصول إلى شاشة الهاتف جيدًا. ماذا تفعل؟', options: [
            {t: 'اضغط على زر التشغيل 5 مرات بسرعة', ok: true, why: 'نعم. يبدأ عدّ تنازلي، ثم يتصل بالرقم 999 ويشارك مكانك مع Sarah.'},
            {t: 'افتح قفل الهاتف وابحث عن تطبيق الهاتف', why: 'هذا بطيء في حالة الطوارئ. الضغط على زر التشغيل 5 مرات يعمل حتى وهو مقفل.'}]}},
        {screen: () => list(p, 'جهات اتصال الطوارئ', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>أحسنت!</strong> الطوارئ SOS مفعّلة وسيُبلَّغ Sarah بمكانك. وإذا ضغطت عليها بالخطأ، فاضغط على إلغاء أثناء العدّ التنازلي.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'تنبّهك تنبيهات الطوارئ إلى الخطر القريب، مثل الفيضانات الشديدة. شخص ما أوقف أحدها في هذا الهاتف. لنصلح ذلك. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>اضغط على الإشعارات.</strong>'},
            {screen: c => list(p, 'الإشعارات', [{label: 'عرض المعاينات', value: 'دائمًا'}, {caption: 'نمط الإشعارات'}, {label: 'الرسائل', sub: 'اللافتات والأصوات والشارات'}, {label: 'WhatsApp', sub: 'اللافتات والأصوات والشارات'},
                {caption: 'التنبيهات الحكومية'}, {label: 'التنبيهات القصوى', toggle: true}, {id: 'severe', label: 'التنبيهات الشديدة', toggle: !!c.severe}, {label: 'تنبيهات الاختبار', toggle: false}], {back: 'الإعدادات'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'التنبيهات الحكومية في أسفل القائمة تمامًا. <strong>التنبيهات الشديدة</strong> متوقفة. <strong>اضغط عليها لتفعيلها.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>اضغط على السلامة والطوارئ.</strong>', hint: 'إنها قرب أسفل القائمة.'},
            {screen: () => list(p, 'السلامة والطوارئ', [{label: 'المعلومات الطبية'}, {label: 'الطوارئ SOS'}, {id: 'wea', label: 'تنبيهات الطوارئ اللاسلكية'}, {label: 'تنبيهات المتتبّع المجهول'}]),
             target: 'wea', say: '<strong>اضغط على تنبيهات الطوارئ اللاسلكية.</strong> <em>في بعض الهواتف تسمى تنبيهات الطوارئ.</em>'},
            {screen: c => list(p, 'تنبيهات الطوارئ اللاسلكية', [{label: 'السماح بالتنبيهات', toggle: true}, {label: 'التهديدات القصوى', toggle: true}, {id: 'severe', label: 'التهديدات الشديدة', toggle: !!c.severe}, {label: 'تنبيهات الاختبار', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>التهديدات الشديدة</strong> متوقفة. <strong>اضغط عليها لتفعيلها.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ تنبيه طوارئ: شديد</strong><p>يُتوقع فيضان شديد قرب الواجهة البحرية. انتقل إلى مكان أعلى. المزيد على gov.uk/alerts</p><button type="button" data-tap="ok">حسنًا</button></div>`,
         target: 'ok', say: 'هكذا يبدو التنبيه. يصدر صوت صفارة عاليًا لنحو 10 ثوانٍ، حتى على الصامت. <strong>اضغط على حسنًا.</strong> <em>(للتدريب فقط.)</em>'},
        {screen: () => home(p), question: {q: 'وصلك تنبيه وأنت تقود. ماذا ينبغي أن تفعل؟', options: [
            {t: 'توقف في مكان آمن قبل قراءته', ok: true, why: 'نعم. لا تقرأ هاتفك أثناء القيادة أبدًا. توقف بأمان، ثم اقرأه.'},
            {t: 'اقرأه فورًا أثناء القيادة', why: 'لا تقرأ هاتفك أثناء القيادة أبدًا. ابحث أولًا عن مكان آمن للتوقف.'}]}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> سينبهك هاتفك الآن إلى الخطر الجسيم القريب. التنبيهات الحقيقية لا تطلب أبدًا بيانات شخصية أو مالًا: وإن فعلت، فهي احتيال.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'ثلاثة أشياء تجعل الهاتف المسروق أقل فائدة بكثير للص. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>اضغط على Face ID ورمز الدخول.</strong> <em>في iPhone الحقيقي ستدخل رمز دخولك بعد ذلك.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'مرّر للأسفل و<strong>اضغط على حماية الجهاز المسروق</strong>.'},
            {screen: c => list(p, 'حماية الجهاز المسروق', [{id: 'sdp', label: 'حماية الجهاز المسروق', toggle: !!c.sdp, sub: 'بعيدًا عن المنزل، يحتاج تغيير رمز دخولك أو حساب Apple إلى Face ID، وانتظار ساعة واحدة.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'هذا يمنع لصًا رآك تكتب رمز دخولك من حبسك خارج هاتفك. <strong>فعّلها.</strong>'},
            {screen: () => list(p, 'حماية الجهاز المسروق', [{label: 'حماية الجهاز المسروق', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'بعد ذلك، أخفِ الرسائل على شاشة القفل. <strong>اضغط على ‹ Face ID</strong> للرجوع.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>اضغط على الإشعارات.</strong>'},
            {screen: c => list(p, 'الإشعارات', [{id: 'previews', label: 'عرض المعاينات', value: c.previews || 'دائمًا'}, {label: 'مشاركة الشاشة', value: 'الإشعارات متوقفة'}], {back: 'الإعدادات',
                overlay: c.pickPrev ? sheet('عرض المعاينات', [['prev-always', 'دائمًا'], ['prev-unlocked', 'عند إلغاء القفل', 'موصى به'], ['prev-never', 'أبدًا']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'الآن يستطيع أي شخص قراءة رسائلك، بما فيها رموز الأمان، دون فتح قفل هاتفك. <strong>اضغط على عرض المعاينات.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>اضغط على Google.</strong>', hint: 'إنها قرب أسفل القائمة.'},
            {screen: () => list(p, 'Google', [{label: 'إدارة حسابك على Google'}, {id: 'all-services', label: 'جميع الخدمات'}, {label: 'نسخة احتياطية'}]), target: 'all-services', say: '<strong>اضغط على جميع الخدمات.</strong>'},
            {screen: () => list(p, 'جميع الخدمات', [{caption: 'السلامة الشخصية وسلامة الجهاز'}, {id: 'theft', label: 'الحماية من السرقة'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>اضغط على الحماية من السرقة.</strong>'},
            {screen: c => list(p, 'الحماية من السرقة', [{id: 'tdl', label: 'قفل رصد السرقة', toggle: !!c.tdl, sub: 'يقفل شاشتك إذا أحس بأن أحدًا خطف هاتفك وهرب.'}, {label: 'قفل الجهاز دون اتصال', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>فعّل قفل رصد السرقة.</strong> إذا خطف أحد هاتفك وهرب، يقفل نفسه.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'بعد ذلك، أخفِ الرسائل على شاشة القفل. عد إلى الإعدادات، و<strong>اضغط على الإشعارات</strong>.'},
            {screen: c => list(p, 'الإشعارات', [{id: 'previews', label: 'الإشعارات على شاشة القفل', sub: c.previews || 'عرض كل المحتوى'}, {label: 'سجل الإشعارات'}], {
                overlay: c.pickPrev ? sheet('الإشعارات على شاشة القفل', [['prev-always', 'عرض كل المحتوى'], ['prev-unlocked', 'إخفاء المحتوى الحساس', 'موصى به'], ['prev-never', 'عدم عرض أي إشعارات']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'الآن يستطيع أي شخص قراءة رسائلك، بما فيها رموز الأمان، دون فتح قفل هاتفك. <strong>اضغط على الإشعارات على شاشة القفل.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'الإشعارات', [{label: 'عرض المعاينات', value: 'دائمًا'}], {back: 'الإعدادات', overlay: sheet('عرض المعاينات', [['prev-always', 'دائمًا'], ['prev-unlocked', 'عند إلغاء القفل', 'موصى به'], ['prev-never', 'أبدًا']])})
                : list(p, 'الإشعارات', [{label: 'الإشعارات على شاشة القفل', sub: 'عرض كل المحتوى'}], {overlay: sheet('الإشعارات على شاشة القفل', [['prev-always', 'عرض كل المحتوى'], ['prev-unlocked', 'إخفاء المحتوى الحساس', 'موصى به'], ['prev-never', 'عدم عرض أي إشعارات']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'عند إلغاء القفل' : 'إخفاء المحتوى الحساس'}.</strong>`, hints: {'prev-always': 'هكذا كان. اختر الخيار الموصى به.', 'prev-never': 'هذا يخفيها تمامًا، وقد يكون مزعجًا. اختر الخيار الموصى به.'}},
        {screen: () => home(p), target: 'phone', say: 'أخيرًا، اعثر على رقم IMEI لهاتفك. تحتاج إليه شبكتك لحظر هاتف مسروق. <strong>افتح تطبيق الهاتف.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'على لوحة الأرقام، <strong>اكتب *#06#</strong> (نجمة، ثم مربع، ثم صفر، ثم ستة، ثم مربع).', hint: 'ابدأ بمفتاح النجمة *، في أسفل اليسار.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'معلومات الجهاز', 'IMEI: 35 209900 176148 1 (رقم تدريبي)', [['ok', 'حسنًا']])}),
         target: 'ok', say: 'هذا الرقم الطويل هو <strong>IMEI</strong> الخاص بك. في الهاتف الحقيقي، دوّنه في مكان آمن (وليس على الهاتف!). <strong>اضغط على حسنًا.</strong>'},
        {screen: () => home(p), question: {q: 'خُطف هاتفك. بمن تتصل أولًا؟', options: [
            {t: 'بمصرفك، من هاتف شخص آخر', ok: true, why: 'نعم. يتجه اللصوص إلى تطبيقات المصارف أولًا. ثم اقفل الهاتف عبر الإنترنت، واتصل بشبكتك، وبلّغ عنه على الرقم 101.'},
            {t: 'انتظر لترى هل سيظهر', why: 'السرعة مهمة. اتصل بمصرفك فورًا، ثم اقفل الهاتف واتصل بشبكتك.'}]}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> أصبح استخدام هاتفك أصعب كثيرًا على اللص، وأنت تعرف أين تجد رقم IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'تحديد الموقع' : 'تنبيه متتبّع', title: p === 'ios' ? 'عُثر على AirTag يتحرك معك' : 'متتبّع مجهول يسافر معك',
            text: '<br>يمكن لمالك هذا الشيء رؤية موقعه.'}),
         target: 'alert', say: 'لاحظ هاتفك وجود متتبّع ليس لك يتحرك معك. لا تذعر: كثيرًا ما يكون لأحد أفراد العائلة بالخطأ. <strong>اضغط على التنبيه.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'AirTag مجهول' : 'متتبّع مجهول', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">شوهد معك منذ <strong>10:12</strong> اليوم، في 4 أماكن.</p>
            <button type="button" class="ce co" data-tap="play">تشغيل الصوت</button>
            <button type="button" class="cp" data-tap="learn">تعرّف على هذا ${p === 'ios' ? 'AirTag' : 'المتتبّع'}</button>
            <button type="button" class="cp" data-tap="disable">تعليمات التعطيل</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'تُظهر الخريطة أين كان معك. <strong>اضغط على تشغيل الصوت</strong> لتجده.'},
        {screen: () => app(p, p === 'ios' ? 'AirTag مجهول' : 'متتبّع مجهول', '<p class="cf">⟦volume-2⟧ <strong>جارٍ تشغيل الصوت…</strong><br>أصغِ إلى صوت زقزقة.</p>', {color: '#fff'}),
         question: {q: 'تسمع زقزقة خافتة. أين ينبغي أن تبحث؟', options: [
            {t: 'في الحقائب وجيوب المعاطف والسيارة وأي شيء استعرته', ok: true, why: 'نعم. المتتبّعات صغيرة، بحجم عملة كبيرة تقريبًا، وكثيرًا ما تُخبّأ في البطانات أو الجيوب أو السيارات.'},
            {t: 'في أي مكان، تجاهله فقط', why: 'يستحق الأمر العثور عليه. تفقّد الحقائب والجيوب وسيارتك: قد يكون لأحد أفراد العائلة.'}]}},
        {screen: c => app(p, 'عُثر على المتتبّع', `<p class="cf">قرّب أعلى هاتفك من المتتبّع لتعرف المزيد عنه.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">قرّب من المتتبّع</button>`, {color: '#fff'}),
         target: 'scan', say: 'وجدته في بطانة معطفك. <strong>اضغط على قرّب من المتتبّع</strong> لترى لمن يعود.'},
        {screen: () => app(p, 'حول هذا المتتبّع', '<p class="cf"><strong>ليس في وضع الفقدان</strong><br>الرقم التسلسلي: P4R7-ACT1CE<br>تفاصيل المالك لا تُشارك إلا مع الشرطة.</p>', {color: '#fff'}),
         question: {q: 'ليس لأحد أفراد العائلة، وأنت قلق من أن أحدًا أخفاه لتتبّعك. ماذا تفعل؟', options: [
            {t: 'احتفظ به في مكان آمن وسلّمه للشرطة (أو اتصل بالرقم 999 إذا كنت في خطر)', ok: true, why: 'نعم. لا ترمه: تستطيع الشرطة تتبّعه إلى مالكه. الخط الوطني للمساعدة في حالات الملاحقة (National Stalking Helpline) على الرقم 0808 802 0300.'},
            {t: 'ارمه في سلة المهملات', why: 'قد يكون دليلًا، وتستطيع الشرطة تتبّع المالك. احتفظ به وسلّمه لهم، أو اتصل بالرقم 999 إذا كنت في خطر.'}]}},
        {screen: () => app(p, 'حول هذا المتتبّع', '<p class="cf">المساعدة: الخط الوطني للمساعدة في حالات الملاحقة 0808 802 0300<br>خط المساعدة في حالات العنف الأسري (على مدار 24 ساعة) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>أحسنت!</strong> أنت تعرف كيف تجد متتبّعًا وماذا تفعل. ' + (p === 'android' ? 'تأكد من تفعيل التنبيهات في <strong>الإعدادات > السلامة والطوارئ > تنبيهات المتتبّع المجهول</strong>.' : 'تفحص أجهزة iPhone المتتبّعات تلقائيًا.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'أنت على ممر فوق جرف وسقط شخص. لا يوجد عنوان. عندما تتصل بالرقم 999، ترسل معظم الهواتف موقعك تلقائيًا، لكن الكلمات الثلاث تساعد أيضًا. <strong>افتح what3words.</strong> <em>(نسخة تدريبية.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'النقطة الزرقاء هي أنت. لكل مربع بطول 3 أمتار كلماته الثلاث الخاصة. كلماتك هي <strong>puffin.chalk.lantern</strong>. انتظر لحظة حتى تستقر النقطة، ثم <strong>اضغط على لقد حصلت على كلماتي الثلاث</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'الآن اتصل بالرقم 999. <strong>افتح تطبيق الهاتف.</strong> <em>(للتدريب فقط: لا تتصل بالرقم 999 للتجربة أبدًا.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>اكتب 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>اضغط على زر الاتصال الأخضر.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>مكالمة طوارئ · 0:08</small></div>
            <p class="hi">"الطوارئ، أي خدمة؟ … الإسعاف. ما الموقع الدقيق للحالة الطارئة؟"</p>${homeIndicator(p)}</div>`,
         question: {q: 'يسألك موظف الاستجابة أين أنت. ماذا تقول؟', options: [
            {t: '"أنا على ممر الجرف. عنوان what3words الخاص بي هو puffin وchalk وlantern."', ok: true, why: 'نعم. قل أين أنت بكلماتك الخاصة، ثم اذكر الكلمات الثلاث. وتهجَّ أي كلمة إذا طلبوا ذلك.'},
            {t: '"لا أعرف، في مكان ما قرب البحر"', why: 'سيحاولون العثور عليك، لكن الكلمات الثلاث تحدد موقعك بدقة 3 أمتار. اقرأها بصوت عالٍ من التطبيق.'}]}},
        {screen: () => home(p), question: {q: 'صديق أصمّ ولا يستطيع إجراء مكالمات صوتية. كيف يصل إلى الرقم 999؟', options: [
            {t: 'يسجّل الآن في خدمة الرسائل النصية للطوارئ (يرسل كلمة "register" إلى 999)، أو يستخدم تطبيق 999 BSL', ok: true, why: 'نعم. الرسائل النصية للطوارئ لا تعمل إلا إذا سجّلت أولًا. وتطبيق 999 BSL يصلك بمترجم للغة الإشارة.'},
            {t: 'لا يستطيعون', why: 'يستطيع. يسجّل في الرسائل النصية للطوارئ بإرسال كلمة "register" إلى 999، أو يستخدم تطبيق 999 BSL المجاني.'}]}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> تذكّر: قل أين أنت، ثم اذكر كلماتك الثلاث. يعمل تطبيق what3words دون إشارة للعثور على كلماتك، لكنك تحتاج إلى إشارة للاتصال.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>لا يستجيب</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'هاتفك عالق: الضغط عليه لا يفعل شيئًا ولا يُطفأ بالطريقة المعتادة. هل هذه مشكلة كبيرة؟', options: [
            {t: 'عادةً لا. "إعادة التشغيل القسرية" تصلحه، ولا تفقد شيئًا', ok: true, why: 'صحيح. إعادة التشغيل القسرية كفصل الجهاز عن مقبس الكهرباء. صورك ورسائلك بأمان.'},
            {t: 'نعم، إنه معطّل', why: 'عادةً لا! إعادة التشغيل القسرية تصلح معظم الهواتف المتجمدة، ولا تفقد شيئًا.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'في iPhone: <strong>اضغط على رفع الصوت ثم أفلته</strong>، ثم <strong>اضغط على خفض الصوت ثم أفلته</strong>، ثم <strong>اضغط مطولًا على الزر الجانبي</strong> حتى يظهر شعار Apple (نحو 10 ثوانٍ). هنا، اضغط عليها بهذا الترتيب.'
            : 'في معظم هواتف Android: <strong>اضغط مطولًا على زر التشغيل وخفض الصوت معًا</strong> نحو 10 ثوانٍ، حتى يُعاد التشغيل. هنا، اضغط على التشغيل ثم خفض الصوت. <em>(Google Pixel: اضغط مطولًا على زر التشغيل وحده 30 ثانية.)</em>',
         hints: {'vol-down': p === 'ios' ? 'رفع الصوت يأتي أولًا.' : 'ابدأ بزر التشغيل.', side: 'الزر الجانبي أخيرًا، بعد زرّي الصوت.'},
         hint: p === 'ios' ? 'رفع الصوت، ثم خفض الصوت، ثم الزر الجانبي.' : 'التشغيل، ثم خفض الصوت.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'ظهر الشعار. ماذا الآن؟', options: [
            {t: 'أفلت الأزرار وانتظر حتى يبدأ التشغيل', ok: true, why: 'نعم. يستغرق دقيقة. قد تحتاج إلى كتابة رمز دخولك مرة واحدة.'},
            {t: 'واصل الضغط على كل الأزرار', why: 'أفلت الأزرار عندما يظهر الشعار، وامنحه دقيقة ليبدأ التشغيل.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>أحسنت!</strong> أُعيد تشغيل هاتفك. إذا استمر في التجمد، فتحقق من التحديثات وأخلِ بعض المساحة. إعادة تشغيل هاتفك مرة في الأسبوع تُبقيه يعمل بسلاسة.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'مفعّل' : 'إيقاف'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'إيقاف' : (ctx.signal ? 'مفعّل · 4G' : 'لا توجد خدمة')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'إيقاف' : 'الرئيسية'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'اسحب للأعلى للإغلاق' : 'إغلاق'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">لا توجد خدمة</span>'), target: 'pull-down',
         say: 'يقول هاتفك <strong>لا توجد خدمة</strong>، مع أنه كان يعمل هذا الصباح. حل سريع هو تشغيل وضع الطيران ثم إيقافه، فيعيد الاتصال. ' + (p === 'ios' ? '<strong>اسحب لأسفل من الزاوية العلوية اليمنى</strong> (أو اضغط على الشريط).' : '<strong>اسحب لأسفل من الأعلى</strong> (أو اضغط على الشريط).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>اضغط على وضع الطيران</strong> لتشغيله. يتوقف كل ما هو لاسلكي.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'انتظر نحو 10 ثوانٍ… ثم <strong>اضغط على وضع الطيران مرة أخرى</strong> لإيقافه.'},
        {screen: c => quickPanel(p, c), question: {q: 'عادت بيانات الهاتف إلى 4G. متى يفيد وضع الطيران أيضًا؟', options: [
            {t: 'على متن طائرة، أو في الخارج لتجنب رسوم التجوال (ويمكنك مع ذلك تشغيل Wi-Fi)', ok: true, why: 'نعم. يمكنك إعادة تشغيل Wi-Fi أثناء وضع الطيران، لاستخدام Wi-Fi الفندق أو السفينة.'},
            {t: 'لشحن الهاتف', why: 'يشحن أسرع قليلًا، لكنه مخصص أساسًا للرحلات الجوية وتجنب رسوم التجوال في الخارج.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>أحسنت!</strong> إذا لم يصلح وضع الطيران المشكلة، فأعد تشغيل هاتفك. ما زالت لا توجد خدمة؟ تحقق من موقع شبكتك الإلكتروني بحثًا عن مشكلات في منطقتك.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · الآن</strong><span>🎁 محاولاتك المجانية بانتظارك! عد والعب! 🎉</span></button>',
         target: 'settings', say: 'لعبة لا تتوقف عن إرسال رسائل لا فائدة منها. يمكنك إيقاف الإشعارات لأي تطبيق. <strong>اضغط على الإعدادات</strong>، لا على الرسالة.', hints: {notif: 'هذا يفتح اللعبة. اضغط على الإعدادات بدلًا من ذلك.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>اضغط على الإشعارات.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'الإشعارات', [{label: 'عرض المعاينات', value: 'عند إلغاء القفل'}, {caption: 'نمط الإشعارات'}, {id: 'bubble', label: 'Bubble Pop', sub: 'اللافتات والأصوات والشارات'}, {label: 'الرسائل', sub: 'اللافتات والأصوات والشارات'}, {label: 'WhatsApp', sub: 'اللافتات والأصوات والشارات'}], {back: 'الإعدادات'})
            : list(p, 'الإشعارات', [{id: 'app-notifs', label: 'إشعارات التطبيقات'}, {id: 'history', label: 'سجل الإشعارات'}, {label: 'الإشعارات على شاشة القفل'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>اضغط على Bubble Pop.</strong>' : '<strong>اضغط على إشعارات التطبيقات.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'إشعارات التطبيقات', [{label: 'الرسائل', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>اضغط على المفتاح بجانب Bubble Pop</strong> لإيقاف إشعاراتها.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'السماح بالإشعارات', toggle: !c.off}], {back: 'الإشعارات'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>أوقف السماح بالإشعارات.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'الإشعارات', [{label: 'إشعارات التطبيقات'}, {id: 'history', label: 'سجل الإشعارات', sub: 'إيقاف'}]), target: 'history',
             say: 'ميزة إضافية مفيدة: إذا أزحت رسالة بالخطأ، فإن سجل الإشعارات يحتفظ بنسخة. <strong>اضغط على سجل الإشعارات.</strong>'},
            {screen: c => list(p, 'سجل الإشعارات', [{id: 'hist-toggle', label: 'استخدام سجل الإشعارات', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>فعّله.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'إشعارات أي التطبيقات يستحق إبقاؤها مفعّلة؟', options: [
            {t: 'الرسائل والمكالمات وWhatsApp ومصرفك وكل ما تريد معرفته فورًا', ok: true, why: 'نعم. أبقِ المهمة منها، وأوقف الألعاب والمتاجر وكل ما يزعجك فقط.'},
            {t: 'أوقفها كلها', why: 'ستفوتك رسائل ومكالمات! أبقِ المهمة منها، وأوقف الألعاب وتطبيقات التسوق.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>أحسنت!</strong> لن تزعجك Bubble Pop بعد الآن. ' + (p === 'ios' ? 'إذا أزحت رسالة بالخطأ، فاسحب للأعلى من وسط شاشة القفل لترى الرسائل السابقة.' : 'وسجل الإشعارات يحتفظ بنسخة من أي شيء تزيحه.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>أراك في ducking garden centre x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">رسالة نصية</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'كتبت "Dunnington garden centre" فغيّرها هاتفك. لماذا؟', options: [
            {t: 'التصحيح التلقائي خمّن الكلمة الخطأ', ok: true, why: 'نعم. يستبدل التصحيح التلقائي الكلمات التي لا يعرفها. يمكنك إيقافه، أو تعليمه كلمات جديدة.'},
            {t: 'الهاتف معطّل', why: 'إنه مجرد تخمين من التصحيح التلقائي. يمكنك إيقافه أو تعليمه الكلمات.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>اضغط على عام.</strong>'},
            {screen: () => list(p, 'عام', [{label: 'حول'}, {label: 'تحديث البرنامج'}, {id: 'keyboard', label: 'لوحة المفاتيح'}, {label: 'اللغة والمنطقة'}], {back: 'الإعدادات'}), target: 'keyboard', say: '<strong>اضغط على لوحة المفاتيح.</strong>'},
            {screen: c => list(p, 'لوحات المفاتيح', [{id: 'replace', label: 'استبدال النص'}, {caption: 'كل لوحات المفاتيح'}, {label: 'الأحرف الكبيرة التلقائية', toggle: true}, {id: 'ac', label: 'التصحيح التلقائي', toggle: !c.acOff}, {label: 'النص التنبؤي', toggle: true}], {back: 'عام'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>أوقف التصحيح التلقائي.</strong> تبقى الأخطاء الإملائية مسطّرة بالأحمر، فتستطيع تصحيحها بنفسك.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>اضغط على النظام.</strong> إنه في الأسفل.'},
            {screen: () => list(p, 'النظام', [{id: 'keyboard', label: 'لوحة المفاتيح'}, {label: 'اللغات'}, {label: 'التاريخ والوقت'}]), target: 'keyboard', say: '<strong>اضغط على لوحة المفاتيح.</strong>'},
            {screen: () => list(p, 'لوحة المفاتيح', [{id: 'gboard', label: 'Gboard', sub: 'لوحة المفاتيح على الشاشة'}]), target: 'gboard', say: '<strong>اضغط على Gboard.</strong> <em>في Samsung: لوحة مفاتيح Samsung > الكتابة الذكية.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'التفضيلات'}, {id: 'correction', label: 'تصحيح النص'}, {label: 'الكتابة بالسحب'}]), target: 'correction', say: '<strong>اضغط على تصحيح النص.</strong>'},
            {screen: c => list(p, 'تصحيح النص', [{label: 'إظهار شريط الاقتراحات', toggle: true}, {id: 'ac', label: 'التصحيح التلقائي', toggle: !c.acOff}, {label: 'التدقيق الإملائي', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>أوقف التصحيح التلقائي.</strong> تبقى الأخطاء الإملائية مسطّرة بالأحمر، فتستطيع تصحيحها بنفسك.'},
        ]),
        {screen: () => home(p), question: {q: 'تفضّل إبقاء التصحيح التلقائي، لكنه يغيّر "Dunnington" دائمًا. ماذا يمكنك أن تفعل أيضًا؟', options: [
            {t: 'أضفها إلى قاموس الهاتف، ليتعلم الكلمة', ok: true, why: 'Yes. ' + (p === 'ios' ? 'استخدم استبدال النص في إعدادات لوحة المفاتيح نفسها.' : 'اضغط على الكلمة في شريط الاقتراحات واختر إضافتها إلى قاموسك.')},
            {t: 'لا شيء، تحمّل الأمر فقط', why: 'يمكنك تعليمه: ' + (p === 'ios' ? 'أضف الكلمة في لوحة المفاتيح > استبدال النص.' : 'اضغط على الكلمة في الاقتراحات وأضفها إلى قاموسك.')}]}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> لا مزيد من استبدال الكلمات المفاجئ. يمكنك إعادة تفعيله في أي وقت من المكان نفسه.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'اشتريت سماعات رأس لاسلكية جديدة. ماذا تفعل أولًا؟', options: [
            {t: 'ضعها في "وضع الاقتران" (عادةً بالضغط مطولًا على الزر حتى يومض ضوء)', ok: true, why: 'نعم. وضع الاقتران يتيح لهاتفك العثور عليها. التعليمات الموجودة في العلبة توضح ذلك بالضبط.'},
            {t: 'صِلها بالهاتف بسلك', why: 'سماعات الرأس اللاسلكية تتصل عبر Bluetooth. ضعها في وضع الاقتران أولًا، عادةً بالضغط مطولًا على الزر حتى يومض ضوء.'}]}},
        {screen: () => home(p), target: 'settings', say: 'ضوء سماعات الرأس يومض. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>اضغط على Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>اضغط على الأجهزة المتصلة.</strong>'},
            {screen: () => list(p, 'الأجهزة المتصلة', [{id: 'pair', label: '＋ اقتران جهاز جديد'}, {label: 'الأجهزة المحفوظة', sub: 'السيارة'}]), target: 'pair', say: '<strong>اضغط على اقتران جهاز جديد.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'بلوتوث' : 'اقتران جهاز جديد', [{label: 'بلوتوث', toggle: true}, {caption: p === 'ios' ? 'أجهزتي' : 'محفوظ'}, {label: 'السيارة', sub: 'غير متصل'},
            {caption: p === 'ios' ? 'أجهزة أخرى' : 'الأجهزة المتاحة'}, {id: 'headphones', label: '⟦headphones⟧ Practice Headphones'}, {label: 'تلفاز الجار'}], {back: 'الإعدادات'}),
         target: 'headphones', say: 'يبحث هاتفك عن الأجهزة القريبة. <strong>اضغط على Practice Headphones.</strong>', hints: {}},
        {screen: () => list(p, 'بلوتوث', [{label: 'بلوتوث', toggle: true}, {caption: 'أجهزتي'}, {label: '⟦headphones⟧ Practice Headphones', sub: 'متصل ⟦check⟧'}, {label: 'السيارة', sub: 'غير متصل'}], {back: 'الإعدادات'}),
         question: {q: 'في المرة القادمة التي تشغّل فيها سماعات الرأس، هل عليك فعل هذا مجددًا؟', options: [
            {t: 'لا، تتصل من تلقاء نفسها من الآن فصاعدًا', ok: true, why: 'نعم. تقترن مرة واحدة فقط. بعد ذلك تتصل تلقائيًا عندما تكون مشغّلة وقريبة.'},
            {t: 'نعم، في كل مرة', why: 'تقترن مرة واحدة فقط. بعد ذلك تتصل من تلقاء نفسها.'}]}},
        {screen: () => list(p, 'بلوتوث', [{label: '⟦headphones⟧ Practice Headphones', sub: 'متصل ⟦check⟧'}], {back: 'الإعدادات'}), done: true,
         say: '<strong>أحسنت!</strong> الخطوات نفسها تنفع مع السيارة أو مكبّر الصوت أو السماعات الطبية. وإذا لم يتصل شيء، فأوقف Bluetooth ثم شغّله، وأعد الجهاز إلى وضع الاقتران.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">"${ctx.said || 'جدتي؟ أنا Tom! أضعت هاتفي وأنا في ورطة. أحتاج إلى 400 جنيه لغرامة، اليوم. أرجوك لا تخبري أمي!'}"</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">اطلب عبارة العائلة السرية</button><button type="button" data-tap="send-money">قل إنك سترسل المال</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'رقم مجهول يتصل. <strong>ردّ عليه</strong>، لتتدرب على ما يجب فعله.', hints: {decline: 'رفض المكالمة أمر جيد في الواقع! في هذا التدريب، اضغط على رد.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'أمم… ماذا؟ جدتي، لا وقت لهذا! أرجوك، أحتاج إلى المال الآن!'; },
         say: 'يبدو تمامًا مثل حفيدك Tom. لكن المحتالين يستطيعون تقليد الأصوات. اتفقت عائلتك على <strong>عبارة سرية</strong>. <strong>اطلبها.</strong>',
         hints: {'send-money': 'لا توافق أبدًا على إرسال مال في مكالمة كهذه. اطلب العبارة السرية.', end: 'إنهاء المكالمة جيد أيضًا! لكن أولًا، تدرّب على طلب العبارة السرية.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'لا يعرفونها، ويزدادون إلحاحًا. هذا محتال. <strong>أنهِ المكالمة</strong> بالزر الأحمر.', hints: {'send-money': 'لا! لم يعرفوا العبارة. أنهِ المكالمة.', 'ask-phrase': 'لقد سألت، ولم يستطيعوا الإجابة. أنهِ المكالمة.'}},
        {screen: () => home(p), question: {q: 'ما زلت قلقًا قليلًا على Tom. ماذا تفعل؟', options: [
            {t: 'اتصل بـ Tom (أو بأمه) على الرقم الذي لديك له أصلًا', ok: true, why: 'نعم. اتصل دائمًا برقم تعرفه. Tom الحقيقي سيكون بخير، ولن يمانع تحققك.'},
            {t: 'اتصل بالرقم الذي اتصل بك', why: 'هذا يوصلك بالمحتال مرة أخرى. اتصل بـ Tom على الرقم الذي لديك له أصلًا.'}]}},
        {screen: () => home(p), target: 'phone', say: 'إذا كانت المكالمة عن حسابك المصرفي، يمكنك الاتصال بالرقم <strong>159</strong> للوصول إلى مصرفك أنت بأمان. <strong>افتح تطبيق الهاتف</strong> للتدرب.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>اكتب 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>اضغط على زر الاتصال الأخضر.</strong> <em>(للتدريب فقط: لن يُطلب أي رقم.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">"مرحبًا بك في 159. يرجى ذكر اسم مصرفك، وسنصلك به."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>أحسنت!</strong> الرقم 159 يوصلك بمصرفك الحقيقي. اتفق على عبارة سرية مع عائلتك وجهًا لوجه، ولا تنشرها على الإنترنت أبدًا.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'مرحبًا' : 'أهلًا بك'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'اسحب للأعلى للفتح' : 'ابدأ'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `هاتفك الجديد خرج من علبته وشُغّل. أبقِ <strong>هاتفك القديم</strong> قريبًا، مشحونًا ومتصلًا بـ Wi-Fi. <strong>اضغط على ${p === 'ios' ? 'اسحب للأعلى للفتح' : 'ابدأ'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'البدء السريع' : 'نسخ التطبيقات والبيانات', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'قرّب iPhone القديم من هذا الجهاز لإعداده بحساب Apple.' : 'انسخ تطبيقاتك وصورك وجهات اتصالك وغيرها من هاتفك القديم.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'تابع على iPhone القديم' : 'استخدم جهازك القديم'}</button>
            <button type="button" class="cp" data-tap="manual">الإعداد يدويًا بدلًا من ذلك</button>`}),
         target: 'use-old', say: 'النسخ من هاتفك القديم يوفر عليك إعداد كل شيء من جديد. <strong>اضغط على ' + (p === 'ios' ? 'تابع على iPhone القديم' : 'استخدم جهازك القديم') + '.</strong>', hints: {manual: 'يمكنك ذلك، لكن النسخ أسهل بكثير. اضغط على الزر الآخر.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">على هاتفك <strong>القديم</strong> تظهر رسالة. وجّه كاميرته نحو هذا النمط.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">مسح الهاتف القديم النمط</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'على الهاتف القديم، اضغط على متابعة، ثم امسكه فوق هذا النمط لتراه الكاميرا. هنا، <strong>اضغط على مسح الهاتف القديم النمط</strong>.'},
        {screen: c => codeScreen(p, c, 'أدخل رمز دخول هاتفك القديم', 'هذا ينسخ إعداداتك بأمان.'), sequence: CODE_KEYS,
         say: `اكتب رمز دخول هاتفك القديم. للتدريب، استخدم <strong>${codeText}</strong>.`, hint: `اكتب الرمز التجريبي ${codeText}.`},
        {screen: () => list(p, 'نقل بياناتك', [], {noBack: true, top: `<p class="cf">اختر ما تريد نقله:</p>
            <div class="cj ex"><span>الصور والفيديوهات</span>${tog(true)}</div><div class="cj ex"><span>جهات الاتصال والرسائل</span>${tog(true)}</div><div class="cj ex"><span>التطبيقات</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">متابعة</button>`}),
         target: 'transfer', say: 'كل شيء محدد. <strong>اضغط على متابعة.</strong> أبقِ الهاتفين قريبين من بعضهما وموصولين بالشاحن.'},
        {screen: c => list(p, 'جارٍ النقل…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'متبقٍ نحو 25 دقيقة' : 'اكتمل النقل ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'انتهى النقل. ماذا ينبغي أن تفعل بالهاتف القديم؟', options: [
            {t: 'احتفظ به أسبوعًا للتأكد من أن لا شيء ناقص، ثم امسحه جيدًا قبل بيعه أو إعادة تدويره', ok: true, why: 'نعم. تأكد أولًا من أن صورك وWhatsApp وتطبيقات المصرف تعمل على الهاتف الجديد. الدرس التالي يوضح كيف تمسح الهاتف القديم.'},
            {t: 'ارمه في سلة المهملات فورًا', why: 'ما زالت عليه كل معلوماتك! تأكد من أن الهاتف الجديد فيه كل شيء، ثم امسح القديم جيدًا.'}]}},
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> في هاتفك الجديد صورك وجهات اتصالك وتطبيقاتك. بعض التطبيقات، مثل تطبيقات المصارف وWhatsApp، تطلب منك تسجيل الدخول من جديد؛ فجهّز بياناتك.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'هل ستبيع هاتفك القديم أو تهديه أو تعيد تدويره؟ افعل هذه الخطوات بالترتيب الصحيح، وإلا فلن يستطيع المالك التالي استخدامه. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'الخطوة 1: سجّل الخروج من حساب Apple. <strong>اضغط على اسمك</strong>.'},
            {screen: c => list(p, 'حساب Apple', [{label: 'المعلومات الشخصية'}, {label: 'تسجيل الدخول والأمان'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'تسجيل الخروج', danger: true}], {back: 'الإعدادات',
                overlay: c.ask ? dialog(p, 'هل تريد تسجيل الخروج؟', 'كلمة مرورك مطلوبة لإيقاف تحديد الموقع. (للتدريب: أُدخلت لك.)', [['cancel', 'إلغاء'], ['turn-off', 'إيقاف']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'مرّر إلى الأسفل و<strong>اضغط على تسجيل الخروج</strong>.'},
            {screen: () => list(p, 'حساب Apple', [{label: 'تسجيل الخروج', danger: true}], {back: 'الإعدادات', overlay: dialog(p, 'هل تريد تسجيل الخروج؟', 'كلمة مرورك مطلوبة لإيقاف تحديد الموقع. (للتدريب: أُدخلت لك.)', [['cancel', 'إلغاء'], ['turn-off', 'إيقاف']])}),
             target: 'turn-off', say: 'هذا يوقف <strong>تحديد الموقع</strong>، الذي كان سيربط الهاتف بك. <strong>اضغط على إيقاف.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'الخطوة 2: امسحه. <strong>اضغط على عام.</strong>'},
            {screen: () => list(p, 'عام', [{label: 'حول'}, {label: 'مساحة تخزين الـ iPhone'}, {id: 'reset', label: 'نقل أو إعادة ضبط iPhone'}], {back: 'الإعدادات'}), target: 'reset', say: '<strong>اضغط على نقل أو إعادة ضبط iPhone</strong>، في الأسفل.'},
            {screen: c => list(p, 'نقل أو إعادة ضبط iPhone', [{label: 'إعادة الضبط'}, {id: 'erase', label: 'مسح كل المحتوى والإعدادات'}], {back: 'عام',
                overlay: c.askErase ? dialog(p, 'هل تريد مسح هذا الـ iPhone؟', 'ستُحذف كل الصور والرسائل والتطبيقات.', [['cancel', 'إلغاء'], ['confirm-erase', 'مسح']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>اضغط على مسح كل المحتوى والإعدادات.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'الخطوة 1: أزل حساب Google. <strong>اضغط على Google</strong>. <em>(في Samsung، أزل حساب Samsung أيضًا.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'إدارة حسابك على Google'}, {id: 'accounts', label: 'الحسابات على هذا الجهاز', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>اضغط على الحسابات على هذا الجهاز.</strong>'},
            {screen: c => list(p, 'حساب Google', [{label: 'margaret.smith@example.com'}, {label: 'مزامنة الحساب'}, {id: 'remove', label: 'إزالة الحساب', danger: true}], {overlay: c.ask ? dialog(p, 'هل تريد إزالة الحساب؟', 'إزالته تحذف رسائله وجهات اتصاله وبياناته من هذا الهاتف.', [['cancel', 'إلغاء'], ['confirm-remove', 'إزالة الحساب']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'بدون هذا، يبقى الهاتف مقفلًا على حسابك بعد إعادة الضبط. <strong>اضغط على إزالة الحساب.</strong>'},
            {screen: () => list(p, 'الحساب', [{label: 'إزالة الحساب', danger: true}], {overlay: dialog(p, 'هل تريد إزالة الحساب؟', 'إزالته تحذف رسائله وجهات اتصاله وبياناته من هذا الهاتف.', [['cancel', 'إلغاء'], ['confirm-remove', 'إزالة الحساب']])}),
             target: 'confirm-remove', say: '<strong>اضغط على إزالة الحساب.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'الخطوة 2: امسحه. <strong>اضغط على النظام</strong>، في الأسفل.'},
            {screen: () => list(p, 'النظام', [{label: 'اللغات'}, {label: 'تحديث البرنامج'}, {id: 'reset', label: 'خيارات إعادة الضبط'}]), target: 'reset', say: '<strong>اضغط على خيارات إعادة الضبط.</strong>'},
            {screen: c => list(p, 'خيارات إعادة الضبط', [{label: 'إعادة ضبط Wi-Fi والهاتف وBluetooth'}, {id: 'erase', label: 'مسح كل البيانات (إعادة ضبط المصنع)'}], {overlay: c.askErase ? dialog(p, 'هل تريد مسح كل البيانات؟', 'ستُحذف كل الصور والرسائل والتطبيقات.', [['cancel', 'إلغاء'], ['confirm-erase', 'مسح كل البيانات']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>اضغط على مسح كل البيانات (إعادة ضبط المصنع).</strong>'},
        ]),
        {screen: () => list(p, 'إعادة الضبط', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'هل تريد مسح هذا الـ iPhone؟' : 'هل تريد مسح كل البيانات؟', 'ستُحذف كل الصور والرسائل والتطبيقات.', [['cancel', 'إلغاء'], ['confirm-erase', p === 'ios' ? 'مسح' : 'مسح كل البيانات']])}),
         target: 'confirm-erase', say: 'افعل هذا فقط عندما تكون صورك محفوظة بأمان على هاتفك الجديد أو منسوخة احتياطيًا. <strong>اضغط على ' + (p === 'ios' ? 'مسح' : 'مسح كل البيانات') + '.</strong> <em>(للتدريب: لا يُحذف شيء.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'مرحبًا' : 'أهلًا بك'}</h3><p class="cf">جاهز لمالكه التالي</p>${homeIndicator(p)}</div>`,
         question: {q: 'شيء أخير قبل أن تسلّمه؟', options: [
            {t: 'أخرج شريحة SIM (وأي بطاقة ذاكرة)', ok: true, why: 'نعم. رقم هاتفك موجود على الشريحة. أخرجها بالأداة الصغيرة أو بمشبك ورق.'},
            {t: 'لا شيء آخر', why: 'أخرج شريحة SIM وأي بطاقة ذاكرة. رقمك موجود على الشريحة.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'مرحبًا' : 'أهلًا بك'}</h3><p class="cf">جاهز لمالكه التالي</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>أحسنت!</strong> سجّل الخروج، امسح، أخرج الشريحة: بهذا الترتيب. شاشة "مرحبًا" تعني أنه جاهز لشخص آخر.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>تذكير</strong><span>اتصل بـ Sarah</span><small>اليوم الساعة 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°، أمطار لاحقًا</span><small>العظمى 14° · الصغرى 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} تستمع… ماذا تريد أن تقول؟`}</p>${result}
            <div class="wh">${[['say-remind', '"ذكّرني بالاتصال بـ Sarah الساعة 3"'], ['say-weather', '"كيف الطقس اليوم؟"'], ['say-joke', '"اطلب لي بيتزا"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'الزر الجانبي (اضغط مطولًا)' : 'زر التشغيل (اضغط مطولًا)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> ينفّذ ما تطلبه بصوتك. <strong>اضغط مطولًا على الزر الجانبي</strong> (على اليمين) حتى يظهر Siri. ويمكنك أيضًا أن تقول "Siri" أو "Hey Siri".'
                          : 'يستطيع هاتفك تنفيذ ما تطلبه بصوتك. <strong>اضغط مطولًا على زر التشغيل</strong> (على اليمين) حتى يظهر المساعد. ويمكنك أيضًا أن تقول "Hey Google".',
         hint: 'أبقِ إصبعك (أو زر الفأرة) مضغوطًا على الزر الموجود على الحافة اليمنى.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'في الهاتف الحقيقي ستتكلم فقط. هنا، <strong>اضغط على "ذكّرني بالاتصال بـ Sarah الساعة 3"</strong>.', hints: {'say-joke': 'جرّب التذكير أولًا.', 'say-weather': 'جرّب التذكير أولًا.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'تم: يظهر تذكير عند الساعة 3. الآن <strong>اسأل عن الطقس</strong>.', hints: {'say-remind': 'تم ضبطه. الآن اسأل عن الطقس.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'أي من هذه يمكنك أن تطلبها من هاتفك؟', options: [
            {t: 'كلها: "اتصل بـ Sarah"، "اضبط مؤقتًا على 10 دقائق"، "شغّل المصباح"، "اقرأ رسائلي"', ok: true, why: 'نعم. هذا مفيد عندما تكون يداك مشغولتين أو عيناك متعبتين أو الكتابة مرهقة.'},
            {t: 'الطقس فقط', why: 'يفعل الكثير: المكالمات والمؤقتات والمصباح وقراءة الرسائل والمنبهات وغيرها.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>أحسنت!</strong> تكلّم بوضوح وبشكل طبيعي، كأنك تخاطب شخصًا. وإذا أساء السمع، فاطلب مرة أخرى.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'النص'], ['lens-translate', 'ترجمة'], ['lens-search', 'بحث']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'القائمة' : 'Carte'}</strong><span>${ctx.translated ? 'شوربة السمك' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'دجاج بالفطر' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'فطيرة التفاح' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>حان موعد لقاح الإنفلونزا.</span><span>للحجز، اتصل بالرقم ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'النص المباشر' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'تستطيع كاميرتك قراءة الكتابة. لننسخ رقم هاتف من رسالة ورقية. <strong>افتح الكاميرا.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'وجّهها نحو الرسالة. عندما ترصد كتابة، يظهر <strong>زر نص صغير ⟦scan-text⟧</strong>. <strong>اضغط عليه.</strong>' : 'وجّهها نحو الرسالة و<strong>اضغط على زر Lens ◎</strong>.',
         hints: {shutter: 'هذا يلتقط صورة عادية. اضغط على ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'زر Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'الكتابة الآن نص حقيقي. <strong>اضغط على رقم الهاتف.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>اضغط على نسخ</strong>، ليكون جاهزًا للصقه في رسالة أو في جهات اتصالك. <em>(أما "اتصال" فيطلب الرقم فورًا.)</em>', hints: {'call-num': 'هذا سيتصل بالرقم. في هذا التدريب، اضغط على نسخ.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'في عطلة؟ الآن تُوجَّه نحو قائمة طعام فرنسية. ' + (p === 'ios' ? 'يستطيع تطبيق الترجمة أو Lens في تطبيق Google فعل ذلك. ' : '') + '<strong>اضغط على ترجمة.</strong>', hints: {'lens-text': 'هذا ينسخ الفرنسية. اضغط على ترجمة.', 'lens-search': 'اضغط على ترجمة.'}},
        {screen: c => cameraLens(p, c), question: {q: 'ماذا تفعل الكاميرا أيضًا بهذه الطريقة؟', options: [
            {t: 'تتعرف على النباتات والطيور، وتمسح الرسائل الورقية ضوئيًا إلى PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'في تطبيق الملاحظات، اضغط على مشبك الورق، ثم مسح المستندات ضوئيًا، لتحويل الرسائل الورقية إلى PDF.' : 'في Google Drive، اضغط على + ثم مسح ضوئي لتحويل الرسائل الورقية إلى PDF.')},
            {t: 'تلتقط الصور فقط', why: 'تفعل أكثر من ذلك بكثير: تتعرف على النباتات، وتترجم، وتنسخ النصوص، وتمسح الرسائل الورقية ضوئيًا إلى ملفات PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>أحسنت!</strong> نسخت رقمًا وترجمت قائمة طعام بكاميرتك. ' + (p === 'ios' ? 'النص المباشر يعمل أيضًا على الصور التي التقطتها سابقًا.' : 'Google Lens يعمل أيضًا على الصور التي التقطتها سابقًا.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'الكتب الإلكترونية من المكتبة', `<p class="cf">تم تسجيل الدخول ببطاقة مكتبتك</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">الكتب الإلكترونية</button><button type="button" data-tap="tab-audio" class="on">الكتب الصوتية</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'موعد الإعادة بعد 21 يومًا' : '3 من 5 نسخ متاحة'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'المكتبة', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'ببطاقة مكتبة مجانية، يمكنك استعارة الكتب الإلكترونية والصوتية على هاتفك. تستخدم مكتبات East Riding تطبيق <strong>BorrowBox</strong>. هذه نسخة تدريبية. <strong>افتحه.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'لقد سجّلت الدخول ببطاقة مكتبتك. <strong>اضغط على The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'الاستعارة مجانية. <strong>اضغط على استعارة.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'إنه لك لمدة 21 يومًا. <strong>اضغط على استماع.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>اضغط على زر التشغيل ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'تستمع في السرير؟ <strong>مؤقت النوم</strong> يوقفه بعد فترة، فلا تضيع منك النقطة التي وصلت إليها. <strong>اضغط على مؤقت النوم.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'ماذا يحدث عندما تنتهي الأيام الـ 21؟', options: [
            {t: 'يعود من تلقاء نفسه. دون غرامات، ويمكنك التجديد إن لم تنهِه', ok: true, why: 'نعم. الكتب الإلكترونية والصوتية تعود تلقائيًا.'},
            {t: 'تُفرض عليك غرامة', why: 'لا توجد غرامات. يعود من تلقاء نفسه، ويمكنك تجديده إن لم تنهِه.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>أحسنت!</strong> للبدء فعليًا، انضم عبر eastridinglibraries.co.uk أو في أي مكتبة، ثم نزّل BorrowBox وسجّل الدخول ببطاقتك.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>الدفع عبر التطبيق: رقم الموقع <b>4471</b></span></div>
                <p class="cf">أدخل رقم الموقع من اللافتة</p>${field('parkcode', 'رقم الموقع', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">ابحث عن موقف السيارات</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'ادفع £3.20' : 'اختر مدة'}</button>`, {color});
        }
        return app(p, 'مواقف السيارات', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'كثير من مواقف السيارات تتيح الدفع عبر تطبيق، فلا تحتاج إلى عملات معدنية. كل مجلس بلدي يستخدم تطبيقات مختلفة (تخبرك اللافتة أيها). هذا تطبيق تدريبي. <strong>افتح Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'اكتب رقم الموقع من اللافتة: 4471.',
         say: 'لكل موقف سيارات <strong>رقم موقع</strong> على اللافتة. <strong>اكتب 4471</strong> في المربع و<strong>اضغط على ابحث عن موقف السيارات</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'لوحة سيارتك محفوظة أصلًا. <strong>اختر ساعتين.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'هناك رسوم خدمة صغيرة لاستخدام التطبيق. <strong>اضغط على ادفع £3.20.</strong> <em>(للتدريب: لا يُخصم أي مال.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'أنت متأخر في المتاجر. ماذا يمكنك أن تفعل؟', options: [
            {t: 'اضغط على تمديد في التطبيق لإضافة وقت، دون العودة إلى السيارة', ok: true, why: 'نعم. هذه ميزة الدفع عبر التطبيق الكبيرة. ومعظمها يذكّرك أيضًا قبل انتهاء وقتك.'},
            {t: 'لا شيء، ستحصل على مخالفة', why: 'معظم تطبيقات المواقف تتيح لك الضغط على تمديد لإضافة وقت من أي مكان تكون فيه.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>أحسنت!</strong> ما زالت معظم الأجهزة تقبل البطاقات أو العملات أيضًا، وكثير من التطبيقات تتيح الدفع بالاتصال برقم أو بإرسال رسالة نصية. لا تدفع أبدًا عبر ملصق رمز QR على جهاز: قد يكون مزيفًا.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>انتهى عقدك منذ 3 مارس 2026. يمكنك التبديل دون تكلفة. سعرك الشهري £24.00. للتبديل مع الاحتفاظ برقمك، أرسل PAC إلى 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'رسالة نصية', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'هل ما زلت في عقد، أم تدفع أكثر من اللازم؟ رسالة نصية مجانية واحدة تخبرك. <strong>افتح الرسائل.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'اكتب INFO في مربع الرسالة، ثم اضغط على إرسال.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'بدأنا رسالة جديدة إلى <strong>85075</strong>. <strong>اكتب INFO</strong> و<strong>اضغط على إرسال</strong>. إنها مجانية على كل شبكات المملكة المتحدة.'},
        {screen: c => smsTo(p, c), question: {q: 'يقول الرد إن عقدك انتهى وما زلت تدفع £24 شهريًا. ماذا يعني ذلك؟', options: [
            {t: 'هاتفك مسدّد ثمنه. عرض SIM فقط قد يكلّف أقل بكثير، ويمكنك الاحتفاظ برقمك', ok: true, why: 'نعم. أرسل PAC إلى 65075 لتحصل على رمز يتيح لك التبديل مع الاحتفاظ برقمك. ويتولى مزوّدك الجديد الباقي.'},
            {t: 'لا شيء، واصل الدفع', why: 'قد تدفع ثمن هاتف سددت ثمنه أصلًا. عرض SIM فقط قد يوفّر عليك الكثير.'}]}},
        {screen: () => home(p), target: 'settings', say: 'توفير آخر، للرحلات إلى الخارج: أوقف تجوال البيانات حتى لا تُحاسَب بمفاجأة. <strong>اضغط على الإعدادات.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>اضغط على الخدمة الخلوية.</strong>'},
            {screen: () => list(p, 'الخدمة الخلوية', [{label: 'بيانات الجوّال', toggle: true}, {id: 'options', label: 'خيارات بيانات الجوّال', value: 'التجوال مفعّل'}, {label: 'نقطة الاتصال الشخصية'}], {back: 'الإعدادات'}), target: 'options', say: '<strong>اضغط على خيارات بيانات الجوّال.</strong>'},
            {screen: c => list(p, 'خيارات بيانات الجوّال', [{id: 'roam', label: 'تجوال البيانات', toggle: !c.roamOff}, {label: 'الصوت والبيانات', value: '5G تلقائي'}], {back: 'الخدمة الخلوية'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>أوقف تجوال البيانات.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>اضغط على الشبكة والإنترنت.</strong>'},
            {screen: () => list(p, 'الشبكة والإنترنت', [{label: 'الإنترنت', sub: 'Wi-Fi المنزل'}, {id: 'sims', label: 'شرائح SIM', sub: 'شبكتك'}, {label: 'وضع الطيران', toggle: false}]), target: 'sims', say: '<strong>اضغط على شرائح SIM.</strong>'},
            {screen: c => list(p, 'شرائح SIM', [{label: 'بيانات الجوّال', toggle: true}, {id: 'roam', label: 'التجوال', toggle: !c.roamOff, sub: 'الاتصال بخدمات البيانات أثناء التجوال'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>أوقف التجوال.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>أحسنت!</strong> ما زال بإمكانك استخدام Wi-Fi في الخارج لـ WhatsApp ومكالمات الفيديو والخرائط. أعد تشغيل التجوال إذا احتجت إلى بيانات الهاتف وكنت تعرف ما تتقاضاه شبكتك.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'تحديد الموقع', '#22c55e', ICON2.find]]), target: 'findmy', say: 'مشاركة موقعك تتيح لعائلتك رؤية أنك وصلت إلى المنزل بسلام. القرار لك، ويمكنك التوقف في أي وقت. <strong>افتح تحديد الموقع.</strong>'},
        {screen: c => app(p, 'الأشخاص', `<p class="cf">لا أحد يشارك بعد.</p><button type="button" class="ce co" data-tap="share">مشاركة موقعي</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>اضغط على مشاركة موقعي.</strong>'},
        {screen: c => app(p, 'المشاركة مع', '', {color: '#fff', overlay: sheet('اختر جهة اتصال', [['pick-sarah', 'Sarah', 'الابنة'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>اضغط على Sarah.</strong>', hints: {'pick-dave': 'اختر Sarah لهذا التدريب.'}},
        {screen: c => app(p, 'المشاركة مع Sarah', '', {color: '#fff', overlay: sheet('لكم من الوقت؟', [['one-hour', 'المشاركة لمدة ساعة'], ['day', 'المشاركة حتى نهاية اليوم'], ['always', 'المشاركة إلى أجل غير مسمى']])}),
         target: 'always', say: 'اختر المدة. مع عائلة تثق بها، <strong>اضغط على المشاركة إلى أجل غير مسمى</strong>. يمكنك التوقف في أي وقت.', hints: {'one-hour': 'هذا مفيد لرحلة واحدة. في هذا التدريب، اختر المشاركة إلى أجل غير مسمى.', day: 'في هذا التدريب، اختر المشاركة إلى أجل غير مسمى.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'مشاركة موقعك تتيح لعائلتك رؤية أنك وصلت إلى المنزل بسلام. القرار لك، ويمكنك التوقف في أي وقت. <strong>افتح الخرائط.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>اضغط على صورة ملفك الشخصي</strong> في أعلى اليمين.'},
        {screen: () => app(p, 'الخرائط', '', {color: '#fff', overlay: sheet('', [['sharing', 'مشاركة الموقع'], ['timeline', 'خطك الزمني'], ['settings', 'الإعدادات']])}), target: 'sharing', say: '<strong>اضغط على مشاركة الموقع.</strong>'},
        {screen: () => app(p, 'مشاركة الموقع', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>اضغط على مشاركة جديدة.</strong>'},
        {screen: () => app(p, 'المشاركة مع', '', {color: '#fff', overlay: sheet('اختر جهة اتصال', [['pick-sarah', 'Sarah', 'الابنة'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>اضغط على Sarah.</strong>', hints: {'pick-dave': 'اختر Sarah لهذا التدريب.'}},
        {screen: () => app(p, 'المشاركة مع Sarah', '', {color: '#fff', overlay: sheet('لكم من الوقت؟', [['one-hour', 'لمدة ساعة'], ['always', 'حتى توقف هذا']])}),
         target: 'always', say: 'مع عائلة تثق بها، <strong>اضغط على حتى توقف هذا</strong>.', hints: {'one-hour': 'مفيد لرحلة واحدة. في هذا التدريب، اختر حتى توقف هذا.'}},
    ]).concat([
        {screen: () => app(p, 'المشاركة مع Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">تستطيع Sarah رؤية مكانك. ${p === 'ios' ? 'اضغط على إيقاف المشاركة' : 'اضغط على إيقاف'} في أي وقت.</p>`, {color: '#fff'}),
         question: {q: 'شخص تعرفت عليه للتو عبر الإنترنت يطلب منك مشاركة موقعك. هل تفعل؟', options: [
            {t: 'لا. شارك فقط مع العائلة المقربة أو أصدقاء تثق بهم', ok: true, why: 'تمامًا. موقعك يُظهر أين تسكن ومتى تكون خارج المنزل. اقصره على من تثق بهم.'},
            {t: 'نعم، يبدون لطفاء', why: 'شارك موقعك فقط مع العائلة المقربة والأصدقاء. فهو يُظهر أين تسكن ومتى تكون خارج المنزل.'}]}},
        {screen: () => app(p, 'المشاركة مع Sarah', '<p class="cf">تستطيع Sarah رؤية مكانك.</p>', {color: '#fff'}), done: true,
         say: '<strong>أحسنت!</strong> تستطيع Sarah أن ترى أنك بأمان. تحقق بين الحين والآخر ممن تشاركهم، وأوقف المشاركة مع أي شخص لا تحتاج إلى المشاركة معه.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'حفيدك Leo سيحصل على أول iPhone له. <strong>مدة استخدام الجهاز</strong> تضع حدودًا صحية. هذا هاتف <strong>Leo</strong>. <strong>اضغط على الإعدادات.</strong>'},
        {screen: c => list(p, 'الإعدادات', [{label: 'Leo', sub: 'حساب Apple'}, {label: 'الإشعارات'}, {id: 'screen-time', label: 'مدة استخدام الجهاز'}, {label: 'عام'}], {noBack: true}), target: 'screen-time', say: '<strong>اضغط على مدة استخدام الجهاز.</strong>'},
        {screen: c => list(p, 'مدة استخدام الجهاز', [{id: 'downtime', label: 'وقت التوقف', sub: c.downtime ? '20:00 – 07:00' : 'إيقاف'}, {label: 'حدود التطبيقات'}, {id: 'content', label: 'قيود المحتوى والخصوصية', sub: c.content ? 'مفعّل' : 'إيقاف'}, {label: 'استخدام رمز دخول مدة استخدام الجهاز'}], {back: 'الإعدادات'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>وقت التوقف</strong> يقفل معظم التطبيقات ليلًا (وتبقى المكالمات تعمل). <strong>اضغط على وقت التوقف</strong> لتفعيله، من 8 مساءً إلى 7 صباحًا.'},
        {screen: c => list(p, 'مدة استخدام الجهاز', [{label: 'وقت التوقف', sub: '20:00 – 07:00'}, {label: 'حدود التطبيقات'}, {id: 'content', label: 'قيود المحتوى والخصوصية', sub: c.content ? 'مفعّل' : 'إيقاف'}], {back: 'الإعدادات'}),
         target: 'content', action: c => { c.content = true; }, say: 'بعد ذلك، امنع المشتريات المفاجئة والمحتوى المخصص للبالغين. <strong>اضغط على قيود المحتوى والخصوصية.</strong>'},
        {screen: c => list(p, 'المحتوى والخصوصية', [{label: 'قيود المحتوى والخصوصية', toggle: true}, {id: 'purchases', label: 'مشتريات App Store', value: c.noBuy ? 'عدم السماح' : 'سماح'}, {label: 'محتوى الويب', value: 'تقييد مواقع البالغين'}], {back: 'مدة استخدام الجهاز'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'قُيّدت مواقع البالغين الآن. <strong>اضغط على مشتريات App Store</strong> لمنع الإنفاق داخل التطبيقات.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'حفيدك Leo سيحصل على أول هاتف Android له. تطبيق <strong>Family Link</strong> المجاني من Google يضع حدودًا صحية من <strong>هاتفك أنت</strong>. <strong>افتح Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>اضغط على Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'عناصر التحكم'}, {id: 'screen-time', label: 'وقت الشاشة', sub: c.downtime ? 'وقت النوم 20:00 – 07:00' : 'بلا حدود'}, {id: 'content', label: 'قيود المحتوى', sub: c.noBuy ? 'المشتريات تحتاج إلى موافقتك' : 'Google Play: السماح بالكل'}, {label: 'الموقع', sub: 'مفعّل'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>اضغط على وقت الشاشة</strong> لضبط وقت نوم، من 8 مساءً إلى 7 صباحًا، يُقفل فيه الهاتف (وتبقى المكالمات تعمل).'},
        {screen: c => list(p, 'Leo', [{caption: 'عناصر التحكم'}, {label: 'وقت الشاشة', sub: 'وقت النوم 20:00 – 07:00'}, {id: 'content', label: 'قيود المحتوى', sub: c.noBuy ? 'المشتريات تحتاج إلى موافقتك' : 'Google Play: السماح بالكل'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'بعد ذلك، امنع الإنفاق المفاجئ. <strong>اضغط على قيود المحتوى</strong> لتحتاج المشتريات إلى موافقتك.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'مدة استخدام الجهاز' : 'Leo', [{label: p === 'ios' ? 'وقت التوقف' : 'وقت الشاشة', sub: '20:00 – 07:00'}, {label: 'المشتريات', sub: p === 'ios' ? 'عدم السماح' : 'تحتاج إلى موافقتك'}]),
         question: {q: 'ما الأهم، إلى جانب الإعدادات؟', options: [
            {t: 'التحدث معهم: يمكنهم دائمًا إخبارك إذا أزعجهم شيء على الإنترنت', ok: true, why: 'نعم. لا إعداد يلتقط كل شيء. أن تكون شخصًا يستطيعون التحدث إليه هو الأهم.'},
            {t: 'الإعدادات تفعل كل شيء', why: 'هي تساعد كثيرًا، لكن لا شيء يلتقط كل شيء. تأكد من أنهم يعرفون أنهم يستطيعون دائمًا التحدث إليك.'}]}},
        {screen: () => list(p, p === 'ios' ? 'مدة استخدام الجهاز' : 'Leo', [{label: 'وقت التوقف', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>أحسنت!</strong> لدى Leo وقت نوم، ولا يستطيع إنفاق المال دون أن يسأل. ' + (p === 'ios' ? 'اضبط رمز دخول مدة استخدام الجهاز حتى تكون وحدك من يغيّر هذه الإعدادات.' : 'يتيح لك Family Link تغيير هذه الإعدادات من هاتفك أنت في أي وقت.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'مستكشف الملفات', mac: 'Finder', linux: 'الملفات'},
        settings: {windows: 'الإعدادات', mac: 'إعدادات النظام', linux: 'إعدادات النظام'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'مدير البرامج'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'ابدأ', mac: 'التطبيقات', linux: 'القائمة'},
        editor: {windows: 'المفكرة', mac: 'TextEdit', linux: 'محرر النصوص'},
    };
    const CMD = os => os === 'mac' ? 'cmd' : 'ctrl';
    const CMDL = os => os === 'mac' ? '⟦command⟧ Cmd' : 'Ctrl';
    const keyBtn = (id, label) => `<button type="button" class="agb" data-tap="${id}">${label.split(' + ').map(k => `<kbd>${k}</kbd>`).join(' + ')}</button>`;

    const PCI = {
        files: LU('folder'),
        browser: LU('globe'),
        store: LU('shopping-bag'),
        settings: ICON.settings,
        mail: ICON.mail,
        text: LU('file-text'),
        writer: LU('file-pen-line'),
        update: LU('refresh-cw'),
        trash: LU('trash-2'),
        apps: LU('layout-grid'),
        chrome: LU('compass'),
        shield: LU('shield-check'),
        terminal: LU('terminal'),
        fw: LU('brick-wall'),
    };
    const PCCOL = {
        files: {windows: '#f59e0b', mac: '#3b82f6', linux: '#16a34a'}, browser: {windows: '#0e7490', mac: '#2563eb', linux: '#ea580c'},
        store: {windows: '#2563eb', mac: '#0ea5e9', linux: '#16a34a'}, settings: {windows: '#475569', mac: '#6b7280', linux: '#475569'},
        mail: {windows: '#2563eb', mac: '#3b82f6', linux: '#2563eb'}, text: {windows: '#64748b', mac: '#64748b', linux: '#64748b'},
        writer: {windows: '#2563eb', mac: '#2563eb', linux: '#2563eb'}, update: {windows: '#16a34a', mac: '#16a34a', linux: '#d97706'},
        trash: {mac: '#9ca3af'}, apps: {mac: '#6366f1'}, chrome: {windows: '#16a34a', mac: '#16a34a', linux: '#16a34a'}, shield: {windows: '#2563eb', mac: '#2563eb', linux: '#2563eb'},
        fw: {linux: '#475569', windows: '#475569', mac: '#475569'}, terminal: {linux: '#111827', windows: '#111827', mac: '#111827'},
    };
    const pcIcon = (os, kind) => `<span class="pu" style="background:${(PCCOL[kind] || {})[os] || '#64748b'}">${PCI[kind]}</span>`;
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'البريد', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'مدير التحديثات', terminal: 'الطرفية', trash: 'سلة المهملات', apps: 'التطبيقات', chrome: 'Chrome', shield: 'أمن Windows', fw: 'جدار الحماية'}[kind]);

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
        return (kind && screen.querySelector(`[data-tap="app-${kind}"]`)) || screen.querySelector('.fa.afs') || screen.querySelector('.aaa, .ly, .aiw');
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
        const win = btn && btn.closest('.ev');
        if (!win) return 0;
        win.classList.remove('kq', 'ach', 'ud', 'ue');
        if (id === 'win-close') { win.classList.add('sq'); return 160; }
        pcAim(screen, win);
        const ms = os === 'mac' ? (slow ? 4000 : 520) : 260;
        win.style.setProperty('--ms', ms + 'ms');
        win.classList.add(os === 'mac' ? 'aem' : 'aci');
        return ms;
    }

    // After the new screen is drawn: animate a window in (opened, restored from the taskbar, or maximised).
    function pcAnimIn(screen, os, lastId, prevTitle, wasMinimised) {
        if (calm()) return;
        const win = screen.querySelector('.ev:not(.qf)');
        if (!win) return;
        const title = (win.querySelector('.ka') || {}).textContent;
        if (lastId === 'win-max') { win.classList.add('ach'); return; }
        if (title === prevTitle) return;
        if (wasMinimised && lastId && lastId.startsWith('app-')) {
            pcAim(screen, win);
            win.classList.add(os === 'mac' ? 'ue' : 'ud');
        } else {
            win.classList.add('kq');
        }
        // The Mac Dock bounces an app's icon when it opens.
        if (os === 'mac' && lastId && lastId.startsWith('app-') && !wasMinimised) {
            const icon = screen.querySelector(`.ly [data-tap="${lastId}"]`);
            if (icon) icon.classList.add('acg');
        }
    }

    // ======================================================================================
    // Easter egg: the Recycle Bin (Windows), Bin (Mac) or Trash (Linux Mint) opens, and it's full of
    // things people will remember. Not part of any lesson: it never counts as a wrong tap.
    // ======================================================================================
    const EGG = {
        windows: {title: 'سلة المحذوفات', empty: 'إفراغ سلة المحذوفات', confirm: n => `هل تريد حقًا حذف هذه العناصر الـ ${n} نهائيًا؟`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'كان يعرض مساعدتك في كل رسالة بدأت كتابتها. تقاعد عام 2007.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'مبتدئ: 999 ثانية. لا نتحدث عن ذلك.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'عندما تفوز بلعبة، كانت الأوراق تتقافز على الشاشة. انقر عليّ مرتين!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'صررر… بونغ… كششش. ولم يكن أحد يستطيع استخدام الهاتف أثناء اتصالك بالإنترنت.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'ذلك التل الأخضر المتموج والسماء الزرقاء، على ملايين الشاشات منذ 2001.', ''],
            ['⟦save⟧', 'Floppy disk (A:)', '1.44 ميغابايت. وزر الحفظ ما زال يشبهه.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', 'لعبة بينبول ثلاثية الأبعاد، مجانية مع Windows إلى أن أزالتها Vista.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'أرسل لك أحدهم وكزة فاهتزت الشاشة كلها. انقر عليّ مرتين!', 'shake'],
            ['⟦file-text⟧', 'Letter to council FINAL (2) (final).doc', 'لدينا جميعًا واحدة مثلها.', ''],
        ]},
        mac: {title: 'سلة المهملات', empty: 'إفراغ سلة المهملات', confirm: () => 'هل تريد حقًا مسح العناصر الموجودة في سلة المهملات نهائيًا؟ لا يمكنك التراجع عن هذا الإجراء.', items: [
            ['⟦rainbow⟧', 'Spinning beach ball', 'العجلة الملوّنة التي كانت تعني "من فضلك انتظر"… وانتظر. انقر عليّ مرتين!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'شفاف وبيضاوي الشكل وأزرق. كان في كل مدرسة واحد منه.', ''],
            ['⟦music⟧', 'iPod بعجلة نقر', 'ألف أغنية في جيبك. تدوّر بإبهامك دورة بعد دورة.', ''],
            ['⟦smile⟧', 'Happy Mac', 'الحاسوب الصغير المبتسم الذي كان يستقبلك عند كل تشغيل.', ''],
            ['⟦bell⟧', 'نغمة بدء التشغيل', 'ذلك الوتر الكبير عند التشغيل. كثيرون ما زالوا يفتقدونه.', ''],
            ['⟦droplet⟧', 'أزرار Aqua', 'لامعة وزرقاء حتى بدت شهية.', ''],
            ['⟦calendar-days⟧', 'أدوات Dashboard', 'آلة حاسبة وطقس وورقة ملاحظات على طبقة خاصة بها. اختفت منذ 2019.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'حيث كنا جميعًا ننسخ أقراصنا المدمجة ونزامن أجهزة iPod.', ''],
        ]},
        linux: {title: 'سلة المحذوفات', empty: 'إفراغ سلة المحذوفات', confirm: () => 'هل تريد إفراغ كل العناصر من سلة المحذوفات؟ ستُحذف كل العناصر في السلة نهائيًا.', items: [
            ['⟦bird⟧', 'البطريق Tux (دمية)', 'تميمة Linux منذ 1996. محبّبة للعناق جدًا.', ''],
            ['⟦eye⟧', 'xeyes', 'زوج من العيون يتبع مؤشر الفأرة. انقر عليّ مرتين!', 'eyes'],
            ['⟦app-window⟧', 'النوافذ المتمايلة', 'كانت تأثيرات سطح المكتب القديمة تجعل النوافذ تتمايل كالجيلي عند سحبها. انقر عليّ مرتين!', 'wobble'],
            ['⟦save⟧', 'أقراص تثبيت مرنة 1–50', 'كان تثبيت Linux في بداياته قد يحتاج إلى علبة كاملة من الأقراص المرنة.', ''],
            ['⟦disc⟧', 'قرص Ubuntu مجاني بالبريد', 'كان يمكنك طلب قرص Linux مجانًا فيصلك بالبريد.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'يُتوقع حدوثه كل عام منذ نحو 1999. ربما يكون هذا هو العام؟', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'كل إصدار من Linux Mint يحمل اسم امرأة، مثل Zena وXia وVanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'نكتة قديمة: قل "sudo" فينفّذ الحاسوب ما يُطلب منه.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'هذا المجلد فارغ.' : 'The ' + egg.title + ' فارغ.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'انقر مرتين على شيء ما لتلقي نظرة.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'لا' : 'إلغاء'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'نعم' : 'فارغ'}</button></div></div>` : '';
        const ctrls = os === 'mac'
            ? '<span class="afm"><button type="button" class="ze" data-egg-act="close" aria-label="Close window"></button><button type="button" class="abq" data-egg-act="close" aria-label="Minimise"></button><button type="button" class="abp" data-egg-act="max" aria-label="Full screen"></button></span>'
            : '<span class="ahm"><button type="button" data-egg-act="close" aria-label="Minimise">—</button><button type="button" data-egg-act="max" aria-label="Maximise">▢</button><button type="button" class="afp" data-egg-act="close" aria-label="Close">⟦x⟧</button></span>';
        return `<div class="iu">${os === 'mac' ? ctrls : ''}<span class="ka">${egg.title}</span>${os === 'mac' ? '' : ctrls}</div>
            <div class="ht"><div class="alo"><button type="button" data-egg-act="empty" ${left.length ? '' : 'disabled'}>⟦trash-2⟧ ${egg.empty}</button></div>${list}${info}${state.fx || ''}</div>${dlg}`;
    }

    // Clicks on the bin icon and inside the bin window. kind: 'open', 'select', or an action from data-egg-act.
    function pcEgg(screen, os, el, how) {
        const area = screen.querySelector('.kw');
        if (!area) return;
        let win = area.querySelector('.ev.bin-win');
        const state = (win && win._egg) || {items: EGG[os].items, gone: [], sel: null, ask: false, fx: ''};
        const draw = () => { win.innerHTML = pcEggWin(os, state); win._egg = state; };
        if (el.dataset.egg) {
            if (how === 'select') { screen.querySelectorAll('.kx.qg').forEach(d => d.classList.remove('qg')); el.classList.add('qg'); return; }
            if (win) return;
            win = document.createElement('div');
            win.className = `ev ${os} qf bin-win` + (calm() ? '' : ' kq');
            area.appendChild(win);
            draw();
            return;
        }
        const act = el.dataset.eggAct;
        if (act === 'close') {
            if (calm()) { win.remove(); return; }
            win.classList.remove('kq'); win.classList.add('sq');
            setTimeout(() => win.remove(), 160);
            return;
        }
        if (act === 'max') { win.classList.toggle('max'); return; }
        if (act === 'empty') { state.ask = true; draw(); return; }
        if (act === 'no') { state.ask = false; draw(); return; }
        if (act === 'yes') {
            state.ask = false; draw();
            const items = [...win.querySelectorAll('.ih')];
            items.forEach((b, n) => { b.style.animationDelay = (n * 60) + 'ms'; b.classList.add('aad'); });
            setTimeout(() => { state.gone = state.items.map(it => it[1]); state.sel = null; draw(); }, calm() ? 0 : 300 + items.length * 60);
            return;
        }
        if (act === 'item') {
            const it = state.items[+el.dataset.n];
            state.sel = it[1];
            if (how === 'select') {
                win.querySelectorAll('.ih.qg').forEach(b => b.classList.remove('qg'));
                el.classList.add('qg');
                win.querySelector('.ph').innerHTML = `<strong>${esc(it[1])}</strong><br>${esc(it[2])}`;
                return;
            }
            state.fx = '';
            if (how === 'open' && it[3]) {
                const fx = it[3];
                if (fx === 'shake') { const desk = screen.querySelector('.ft'); desk.classList.remove('sr'); void desk.offsetWidth; desk.classList.add('sr'); }
                if (fx === 'wobble') { win.classList.remove('qw'); void win.offsetWidth; win.classList.add('qw'); }
                if (fx === 'cards') state.fx = `<div class="nn" aria-hidden="true">${['A♠', 'K♥', 'Q♣', 'J♦', 'A♥', 'K♠', 'Q♦', 'J♣'].map((c, n) => `<span class="${/[♥♦]/.test(c) ? 'red' : ''}" style="--n:${n}">${c}</span>`).join('')}</div>`;
                if (fx === 'ball') state.fx = '<div class="xu" aria-hidden="true"></div>';
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
        ['تل متموج', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Pinstripes', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['سماء الليل', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['شاطئ البحر', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'أشهر نكتة عن Wi-Fi على الإطلاق.'],
        ['The LAN Before Time', 'LAN تعني "شبكة محلية". وهذه قديمة جدًا جدًا.'],
        ['Abraham Linksys', 'قبل سبع وثمانين ميغابت…'],
        ['Bill Wi the Science Fi', 'العلم يحكم!'],
        ['Drop It Like It\'s Hotspot', 'نقطة اتصال هاتف أحدهم، وصاحبها خفيف الظل.'],
        ['Silence of the LANs', 'شبكة هادئة جدًا جدًا.'],
        ['Tell My Wi-Fi Love Her', 'آآه.'],
        ['Get Off My LAN', 'جار متذمر، على الأرجح.'],
        ['Bridlington Seagulls', 'لقد أخذوا رقائق البطاطس منك أصلًا. لا تعطهم كلمة مرورك أيضًا.'],
        ['FREE WIFI (honest)', 'شبكة اسمها "Wi-Fi مجاني" لا تعرفها هي بالضبط النوع الذي لا ينبغي أن تنضم إليه!'],
    ];

    const FORTUNES = ['اليوم يوم جيد لنسخ صورك احتياطيًا.', 'كلمة المرور القوية كلمة مرور سعيدة.', 'ستتلقى مكالمة هاتفية. ستكون احتيالًا. أنهِ المكالمة.',
        'هل جرّبت إيقاف تشغيله ثم تشغيله من جديد؟', 'أفضل وقت للتحديث كان أمس. وثاني أفضل وقت هو الآن.', 'كوب شاي يصلح معظم الأشياء. ليس أجهزة الكمبيوتر، مع ذلك.',
        'لا تعطِ كلمة مرورك لغريب أبدًا. ولا لنورس.', 'ستجد جهاز التحكم عن بُعد. إنه بين مساند الأريكة.'];

    const funWin = (os, kind, title, inner, cls = '') => {
        const ctrls = os === 'mac'
            ? '<span class="afm"><button type="button" class="ze" data-fun="close" aria-label="Close window"></button><button type="button" class="abq" data-fun="close" aria-label="Minimise"></button><button type="button" class="abp" data-fun="max" aria-label="Full screen"></button></span>'
            : '<span class="ahm"><button type="button" data-fun="close" aria-label="Minimise">—</button><button type="button" data-fun="max" aria-label="Maximise">▢</button><button type="button" class="afp" data-fun="close" aria-label="Close">⟦x⟧</button></span>';
        const w = document.createElement('div');
        w.className = `ev ${os} qf fun-${kind} ${cls}` + (calm() ? '' : ' kq');
        w.innerHTML = `<div class="iu">${os === 'mac' ? ctrls : ''}<span class="ka">${title}</span>${os === 'mac' ? '' : ctrls}</div><div class="ht">${inner}</div>`;
        return w;
    };
    const funToast = (screen, text, ms = 2600) => {
        const desk = screen.querySelector('.ft');
        if (!desk) return;
        const t = document.createElement('div');
        t.className = 'ik fun-toast';
        t.textContent = text;
        desk.appendChild(t);
        setTimeout(() => t.remove(), ms);
    };
    const openFunWin = (screen, w) => {
        const area = screen.querySelector('.kw');
        const old = area.querySelector('.' + [...w.classList].find(c => c.startsWith('fun-')));
        if (old) old.remove();
        area.appendChild(w);
        return w;
    };

    function wifiFunPanel(os, st, details) {
        const icon = st.wifiOn ? '⟦wifi⟧' : '⟦wifi-off⟧';
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">عنوان IP: 192.168.1.42<br>الراوتر: 192.168.1.1<br>الإشارة: −54 dBm (جيدة جدًا)<br>القناة: 36 (5 GHz)<br>السرعة: 866 Mbps<br>الأمان: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi متوقف. شغّله لترى الشبكات.</p>';
        return `<div class="adz ${os} fun-wifi"><div class="aio"><strong>${icon} Wi-Fi</strong><button type="button" class="nw" data-fun="wifi-toggle" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div>${nets}</div>`;
    }

    function calendarPopup(os) {
        const d = today(), y = d.getFullYear(), m = d.getMonth();
        const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
        const cells = Array.from({length: first}, () => '<span></span>').concat(Array.from({length: days}, (_, k) => `<span class="${k + 1 === d.getDate() ? 'ajb' : ''}">${k + 1}</span>`));
        return `<div class="mk ${os}"><strong>${d.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</strong>
            <div class="pb">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<b>${x}</b>`).join('')}${cells.join('')}</div></div>`;
    }

    // ---------- The dinosaur game (Chrome shows it when you're offline). Space, ↑ or a tap to jump. ----------
    function dinoGame(page) {
        page.innerHTML = `<div class="wl"><p class="aei"><strong>لا يوجد إنترنت</strong><br>جرّب فحص Wi-Fi. اضغط <kbd>Space</kbd> أو المس الشاشة للعب.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>انتهت اللعبة · اضغط Space للعب مرة أخرى</span></div></div>`;
        const box = page.querySelector('.dino'), rex = box.querySelector('.xt'), scoreEl = box.querySelector('.ty'), over = box.querySelector('.wk');
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
                const el = document.createElement('span'); el.className = 'zu'; el.textContent = '🌵'; box.appendChild(el);
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Have you mooed today?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('جرّب: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Moo!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(كتبت "sl" بدل "ls"؟ إليك قطار بخاري.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (practice) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: since breakfast \\___________/ Memory: never forgets a birthday`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('حسنًا. 🥪');
        else if (lc === 'make me a sandwich') say('ماذا؟ اصنعها بنفسك.');
        else if (/rm\s+-rf/.test(lc)) say('محاولة جيدة! هذه الطرفية التدريبية لن تدعك تفسد أي شيء.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: command not found (try "help")`);
        out.scrollTop = out.scrollHeight;
    }
    function funTux(screen) {
        const desk = screen.querySelector('.ft');
        if (!desk || desk.querySelector('.ti')) return;
        const t = document.createElement('span'); t.className = 'ti'; t.textContent = '🐧';
        desk.appendChild(t); setTimeout(() => t.remove(), calm() ? 1500 : 7000);
    }

    // ---------- Search boxes: Start/Apps/Menu filter, and the browser ----------
    function funSearch(screen, os, input) {
        const q = input.value.trim().toLowerCase();
        if (input.dataset.funInput === 'menu') {
            const menu = input.closest('.mh');
            menu.querySelectorAll('.os').forEach(b => { b.hidden = q && !b.textContent.toLowerCase().includes(q); });
            if (/^(penguin|tux)$/.test(q)) funTux(screen);
            return;
        }
        // browser: only on Enter
        const br = input.closest('.aaw') || input.closest('.ev');
        const note = br.querySelector('.oi');
        br.classList.remove('ya');
        if (q === 'do a barrel roll' || q === 'z or r twice') { br.classList.remove('rp'); void br.offsetWidth; br.classList.add('rp'); }
        else if (q === 'askew' || q === 'tilt') br.classList.add('ya');
        else if (/^(dino|dinosaur|t-rex|trex)$/.test(q)) dinoGame(input.closest('.ju'));
        else if (note) note.textContent = 'هذا المتصفح التدريبي لا يبحث في الإنترنت الحقيقي. لا يُرسل أي شيء تكتبه إلى أي مكان.';
    }

    // ---------- After every redraw: Wi-Fi state, the dinosaur, wallpaper, the season, inputs ----------
    function pcDecorate(screen, os) {
        const st = funState(screen);
        const desk = screen.querySelector('.ft');
        if (!desk) return;
        if (st.wall >= 0) desk.style.background = WALLS[st.wall][1];
        if (!st.wifiOn) {
            screen.querySelectorAll('[data-tap="tray-wifi"]').forEach(b => { b.classList.add('off'); b.innerHTML = LU('wifi-off', 'mr'); });
            screen.querySelectorAll('.ju').forEach(p => { if (!p.querySelector('.dino')) dinoGame(p); });
        }
        // The season, from the person's own date.
        const d = today(), mo = d.getMonth() + 1, day = d.getDate();
        const area = screen.querySelector('.kw');
        if (area && !calm() && !area.querySelector('.gy')) {
            let season = '';
            if (mo === 12 || (mo === 1 && day <= 6)) season = `<div class="gy aih" aria-hidden="true">${Array.from({length: 26}, (_, k) => `<i style="left:${(k * 37) % 100}%;animation-duration:${6 + (k % 5)}s;animation-delay:-${(k * 1.3) % 7}s;font-size:${8 + (k % 4) * 3}px">❄</i>`).join('')}</div>`;
            if ((mo === 12 && day === 31) || (mo === 1 && day === 1) || (mo === 11 && day === 5)) season += '<div class="gy acd" aria-hidden="true"><i style="left:20%;top:25%"></i><i style="left:62%;top:15%;animation-delay:.7s"></i><i style="left:80%;top:40%;animation-delay:1.4s"></i></div>';
            if (mo === 10 && day >= 24) season = '<div class="gy qx" aria-hidden="true"><span class="aal">🎃</span><span class="aji">🦇</span></div>';
            if (mo === 2 && day === 14) season = `<div class="gy ack" aria-hidden="true">${Array.from({length: 10}, (_, k) => `<i style="left:${k * 10 + 3}%;animation-delay:-${k * 0.9}s">💕</i>`).join('')}</div>`;
            if (season) area.insertAdjacentHTML('afterbegin', season);
        }
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'كذبة أبريل! 🙃'); }
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
        const desk = screen.querySelector('.ft');
        if (!desk) return;
        const splash = document.createElement('div');
        splash.className = `kr ${os}`;
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>تم تفعيل رمز الغش! +30 حياة 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Welcome to Macintosh.</p></div><p>تم تفعيل رمز الغش! +30 حياة 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>تم تفعيل رمز الغش! +30 حياة 🎮</p>';
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
                    const others = [...screen.querySelectorAll('.ev')].filter(w => w !== drag.win);
                    others.forEach(w => { pcAim(screen, w); w.style.setProperty('--ms', '260ms'); w.classList.add('aci'); });
                    funToast(screen, others.length ? 'Aero Shake! تم إخفاء النوافذ الأخرى.' : 'Aero Shake! (لم تكن هناك نوافذ أخرى لإخفائها.)');
                }
                return;
            }
            if (flips.length >= 6 && getOs() === 'mac' && !screen.querySelector('.jc')) {
                flips = [];
                const r = screen.getBoundingClientRect();
                const p = document.createElement('div'); p.className = 'jc';
                p.style.left = (e.clientX - r.left) + 'px'; p.style.top = (e.clientY - r.top) + 'px';
                p.innerHTML = LU('mouse-pointer-2', 'jc');
                screen.appendChild(p); setTimeout(() => p.remove(), 1400);
            }
        });
        screen.addEventListener('pointerdown', e => {
            const bar = e.target.closest('.iu');
            if (!bar || e.target.closest('button') || e.pointerType !== 'mouse') return;
            const win = bar.closest('.ev');
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
        const desk = screen.querySelector('.ft');
        const area = screen.querySelector('.kw');
        if (what === 'close') {
            // Closing Notepad, Terminal or About redraws the lesson screen, so a menu they came from is back.
            const w = el.closest('.ev');
            const back = /fun-(notepad|terminal|about)/.test(w.className);
            const done = () => { w.remove(); if (back && screen._redraw) screen._redraw(); };
            if (calm()) done(); else { w.classList.add('sq'); setTimeout(done, 160); }
            return;
        }
        if (what === 'max') { el.closest('.ev').classList.toggle('max'); return; }
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
                screen.querySelectorAll('[data-tap="tray-wifi"].off').forEach(b => { b.classList.remove('off'); b.innerHTML = LU('wifi', 'mr'); });
                screen.querySelectorAll('.wl').forEach(d => { d.closest('.ju').innerHTML = `<div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p>`; });
                pcDecorate(screen, os);
                funToast(screen, 'Wi-Fi مفعّل. متصل بـ Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi متوقف.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(انضم فقط إلى الشبكات التي تعرفها.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'كذبة أبريل! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'عرض'], ['', 'ترتيب حسب'], ['refresh', 'تحديث'], ['', 'جديد'], ['wall', 'تخصيص']]
                : os === 'mac' ? [['', 'مجلد جديد'], ['', 'الحصول على معلومات'], ['wall', 'تغيير خلفية الشاشة…'], ['', 'استخدام التكديس']]
                : [['', 'إنشاء مجلد جديد'], ['terminal', 'فتح في الطرفية'], ['wall', 'تغيير خلفية سطح المكتب']];
            const m = document.createElement('div');
            m.className = 'hc ll';
            m.style.left = Math.min(e.clientX - r.left, r.width - 180) + 'px';
            m.style.top = Math.min(e.clientY - r.top, r.height - 160) + 'px';
            m.innerHTML = items.map(([id, t]) => `<button type="button" data-fun="desk-${id || 'none'}">${t}</button>`).join('');
            area.appendChild(m);
            return;
        }
        if (what.startsWith('desk-')) {
            const m = area.querySelector('.ll'); if (m) m.remove();
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `الخلفية: ${WALLS[st.wall][0]}`); }
            if (what === 'desk-refresh') { area.classList.remove('uc'); void area.offsetWidth; area.classList.add('uc'); }
            if (what === 'desk-terminal') pcFun(screen, os, {dataset: {fun: 'terminal'}}, e);
            return;
        }
        if (what === 'apple-menu') {
            const old = desk.querySelector('.gv');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', '<div class="gv"><button type="button" data-fun="about">About This Mac</button><button type="button" data-fun="menu-close">System Settings…</button><button type="button" data-fun="menu-close">Sleep</button><button type="button" data-fun="menu-close">Restart…</button><button type="button" data-fun="menu-close">Shut Down…</button></div>');
            return;
        }
        if (what === 'menu-close') { const m = desk.querySelector('.gv'); if (m) m.remove(); return; }
        if (what === 'about') {
            const m = desk.querySelector('.gv'); if (m) m.remove();
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (نسخة تدريبية)</small>
                <dl><dt>الشريحة</dt><dd>Bridlington Silicon B1</dd><dt>الذاكرة</dt><dd>لا تنسى عيد ميلاد أبدًا</dd><dt>قرص بدء التشغيل</dt><dd>Practice HD</dd><dt>الرقم التسلسلي</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'المفكرة' : os === 'mac' ? 'TextEdit' : 'محرر النصوص';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `بلا عنوان – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Ln 1, Col 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'نص عادي'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">أهلًا بك! هذه طرفية تدريبية. اكتب "help" لترى ما يمكنك تجربته. </pre>
                <label class="ads"><span>margaret@mint:~$</span><input class="wb" autocomplete="off" spellcheck="false" aria-label="Terminal command"></label>`, 'ajy'));
            const inp = w.querySelector('.wb');
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
        home: os => `<div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p>
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'الطقس'], ['news', '⟦newspaper⟧', 'الأخبار'], ['bus', '⟦bus⟧', 'أوقات الحافلات'], ['recipes', '⟦cake-slice⟧', 'الوصفات']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ طقس Bridlington</h3><p class="fd">توقعات تدريبية</p><div class="ajf">${[['اليوم', '⟦cloud-sun⟧', '13°'], ['الجمعة', '⟦cloud-rain⟧', '11°'], ['السبت', '⟦wind⟧', '10°'], ['الأحد', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>نشاط النوارس: <strong>مرتفع جدًا</strong>. احرس رقائق البطاطس.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ أخبار تدريبية</h3><ul class="news">
            <li><strong>رجل من المنطقة يعثر أخيرًا على جهاز التحكم</strong> بين مساند الأريكة، بعد ثلاثة أسابيع.</li>
            <li><strong>نورس يُشاهد وهو يحمل آيس كريم 99 Flake</strong>. وصاحب الآيس كريم "غير مسرور".</li>
            <li><strong>جدّة تتفوق على حفيدها في مكالمات الفيديو</strong>: "ضغطت على الزر الأخضر فقط."</li>
            <li><strong>دراسة تجد</strong> أن 9 من كل 10 مشكلات حاسوبية تُحل بإيقاف الجهاز ثم تشغيله من جديد.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ أوقات الحافلات</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ كعكة فيكتوريا الإسفنجية</h3><p>اخلط 200 غرام من كل من الزبدة والسكر والدقيق ذاتي التخمر مع 4 بيضات. اخبزها في قالبين على 180 درجة مئوية لمدة 20 إلى 25 دقيقة. احشها بالمربى والكريمة.</p><p class="fd">نصيحة: اضبط مؤقتًا على هاتفك، أو اطلب منه: "اضبط مؤقتًا على 25 دقيقة".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'علامة تبويب جديدة' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'ابحث أو اكتب عنوان موقع'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
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
        Documents: [['⟦file-text⟧', 'Shopping list.txt'], ['⟦file-text⟧', 'Letter to council.docx'], ['⟦folder⟧', 'الوصفات'], ['⟦file-spreadsheet⟧', 'Christmas card list.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Council tax bill.pdf'], ['⟦file-text⟧', 'Bus timetable.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Seaside brass band.mp3'], ['⟦music⟧', 'Sixties hits.mp3']],
    };
    function funFiles(screen, os, folder = 'الصور', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'سلة المحذوفات' : os === 'mac' ? 'سلة المهملات' : 'سلة المحذوفات'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Dog on the beach.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ متصل بـ Home-WiFi-5G' : 'Wi-Fi متوقف.'}</p>`,
            look: `<h3>${os === 'windows' ? 'التخصيص' : os === 'mac' ? 'الخلفية' : 'الخلفيات'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'تحديث البرنامج' : 'التحديثات'}</h3><p class="mj">⟦check⟧ أنت محدَّث</p><p class="cf">آخر فحص: اليوم، ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">التحقق من وجود تحديثات</button><p class="zi"></p>`,
            about: `<h3>حول</h3><div class="zk"><div><span>اسم الجهاز</span><b>MARGARET-PRACTICE</b></div><div><span>النظام</span><b>${os === 'windows' ? 'Windows 11 (نسخة تدريبية)' : os === 'mac' ? 'macOS 27 (نسخة تدريبية)' : 'Linux Mint 22.3 (نسخة تدريبية)'}</b></div>
                <div><span>المعالج</span><b>Bridlington Silicon B1</b></div><div><span>الذاكرة</span><b>لا تنسى عيد ميلاد أبدًا</b></div><div><span>التخزين</span><b>مساحة وفيرة لصور الأحفاد</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'التخصيص' : os === 'mac' ? 'الخلفية' : 'الخلفيات'], ['update', 'التحديثات'], ['about', 'حول']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Practice Mines', 'لعبة البحث عن الألغام الكلاسيكية.'], ['solitaire', '⟦spade⟧', 'Patience', 'قريبًا في هذا المتجر التدريبي.'], ['paint', '⟦paintbrush⟧', 'Paint', 'قريبًا في هذا المتجر التدريبي.'], ['weather', '⟦cloud-sun⟧', 'الطقس', 'قريبًا في هذا المتجر التدريبي.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'فتح' : (os === 'mac' ? 'الحصول' : 'تثبيت')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Practice Mines', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">انقر للحفر. انقر بالزر الأيمن (أو اضغط مطولًا) لزرع علم.</p></div>`, 'bz'));
        let mines = null, open = 0, over = false, flags = 0, t0 = 0, timer = 0;
        const cells = [...w.querySelectorAll('.zx')], face = w.querySelector('.uh');
        const around = k => { const x = k % W, y = Math.floor(k / W), out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx); } return out; };
        const reset = () => { mines = null; open = 0; over = false; flags = 0; clearInterval(timer); w.querySelector('.ul').textContent = '0'; w.querySelector('.uk').textContent = '⟦bomb⟧ ' + M; face.textContent = '⟦smile⟧'; cells.forEach(c => { c.className = 'zx'; c.textContent = ''; }); };
        const reveal = k => {
            const c = cells[k];
            if (c.classList.contains('open') || c.classList.contains('flag')) return;
            c.classList.add('open'); open++;
            if (mines.has(k)) { c.textContent = '⟦flame⟧'; over = true; face.textContent = '⟦frown⟧'; clearInterval(timer); mines.forEach(m => { if (m !== k) cells[m].textContent = '⟦bomb⟧'; }); return; }
            const n = around(k).filter(a => mines.has(a)).length;
            if (n) { c.textContent = n; c.dataset.n = n; } else around(k).forEach(reveal);
            if (!over && open === W * H - M) { over = true; face.textContent = '⟦laugh⟧'; clearInterval(timer); }
        };
        cells.forEach((c, k) => {
            c.addEventListener('click', () => {
                if (over) return;
                if (!mines) {
                    const safe = new Set([k, ...around(k)]); mines = new Set();
                    while (mines.size < M) { const r = Math.floor(Math.random() * W * H); if (!safe.has(r)) mines.add(r); }
                    t0 = Date.now(); timer = setInterval(() => { if (!w.isConnected) return clearInterval(timer); w.querySelector('.ul').textContent = Math.floor((Date.now() - t0) / 1000); }, 1000);
                }
                reveal(k);
            });
            c.addEventListener('contextmenu', e => {
                e.preventDefault(); e.stopPropagation();
                if (over || c.classList.contains('open')) return;
                c.classList.toggle('flag'); c.textContent = c.classList.contains('flag') ? '⟦flag⟧' : '';
                flags += c.classList.contains('flag') ? 1 : -1; w.querySelector('.uk').textContent = '⟦bomb⟧ ' + (M - flags);
            });
        });
        face.addEventListener('click', reset);
    }

    // ---------- Mail ----------
    const MAILS = [
        ['ماما', 'كيف أطفئ هذا الشيء؟', 'مرحبًا حبيبي، كتبت هذه الرسالة الإلكترونية لكنني لا أجد زر الإطفاء. هل هو المستدير؟ مع حبي، ماما xx ملاحظة: ضغطت عليه. لم يحدث شيء. هل هذا صحيح؟'],
        ['Bridlington Walkers', 'نزهة السبت', 'نلتقي عند الميناء الساعة 10 صباحًا. أحضروا ترمسًا ومعطفًا مقاومًا للماء. لن نتحدث عن حادثة النورس الأسبوع الماضي.'],
        ['Prince Abu (Very Rich)', 'عاجل: لقد ربحت £4,000,000!!!', 'عزيزي الصديق الحبيب، أنا أمير وأحتاج إلى بياناتك المصرفية لأرسل إليك أربعة ملايين جنيه. أرسل أيضًا £50 ثمن الطابع. — هذا احتيال! الناس الحقيقيون لا يوزعون الملايين بالبريد الإلكتروني. احذفه، أو أعد توجيهه إلى report@phishing.gov.uk.'],
        ['Sarah', 'صور من يوم الأحد 🌻', 'هذه صور الحديقة. أكل الكلب زهرة عباد شمس أخرى.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'البريد', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'هذا حاسوب تدريبي، لذا لا يمكن إطفاؤه 😉'); return true; }
        const drop = desk.querySelector('.mh, .gv'); if (drop && what !== 'start-menu') drop.remove();
        if (what === 'start-menu') {
            const old = desk.querySelector('.mh');
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'التنزيلات', '⟦triangle-alert⟧ برامج "التنظيف المجانية" كثيرًا ما تكون مزعجة أو أسوأ. الأفضل حذفها لا فتحها!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `"${n}" سيُفتح هنا على حاسوب حقيقي.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi مفعّل.' : 'Wi-Fi متوقف.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'جارٍ التحقق من وجود تحديثات…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ لا توجد تحديثات جديدة. كل شيء جاهز!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'هذا للعرض فقط في المتجر التدريبي.'); return true; }
            el.textContent = 'جارٍ التثبيت…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'فتح'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">File Edit View Insert Format <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Dear Sir or Madam, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'مدير التحديثات', '<div class="ajz"><p class="mj">⟦check⟧ نظامك محدَّث</p><p class="cf">يتحقق Linux Mint من التحديثات بنفسه ويُظهر نقطة على الدرع عندما تتوفر تحديثات.</p></div>', 'bz'));
            return true;
        }
        return false;
    }

    // The desktop. opts: pinned (kinds), running (kinds), windows (html), overlay (html), appName (Mac menu bar), win10, badge (Linux updates)
    function desk(os, opts = {}) {
        const pinned = opts.pinned || ['files', 'browser', 'store', 'settings'];
        const run = opts.running || [];
        const pin = kind => `<button type="button" class="fa${run.includes(kind) ? ' afs' : ''}" data-tap="app-${kind}" ${kind === 'browser' && os === 'mac' ? 'data-rclick="rc-dock-browser"' : ''} aria-label="${appLabel(os, kind)}">${pcIcon(os, kind)}<span class="yl">${appLabel(os, kind)}</span></button>`;
        const clock = os === 'mac' ? NOW.mac() : `${NOW.time()}<span class="ahe"><br>${NOW.date()}</span>`;
        const wifi = `<button type="button" class="mm" data-tap="tray-wifi" data-fun="wifi" aria-label="Wi-Fi">${opts.noWifi ? LU('globe') : LU('wifi', 'mr')}</button>`;
        let bars;
        if (os === 'mac') {
            bars = `<div class="akj"><button type="button" class="aeq" data-tap="apple-menu" data-fun="apple-menu" aria-label="Apple menu"></button><strong>${opts.appName || 'Finder'}</strong>
                <span class="ye">File Edit View Window Help</span><span class="yf">${wifi}<button type="button" class="sz" data-fun="clock">${clock}</button></span></div>`
                + `<div class="ly">${['files', 'apps', ...pinned.filter(k => k !== 'files')].map(k => k === 'apps' ? `<button type="button" class="fa" data-tap="start" aria-label="Apps">${pcIcon(os, 'apps')}<span class="yl">Apps</span></button>` : pin(k)).join('')}<span class="aej"></span><button type="button" class="fa" data-egg="bin" aria-label="Bin">${pcIcon(os, 'trash')}<span class="yl">Bin</span></button></div>`;
        } else if (os === 'windows') {
            const startIcon = LU('layout-grid', 'zb');
            bars = `<div class="aaa${opts.win10 ? ' w10' : ''}"><div class="adr"><button type="button" class="fa start" data-tap="start" aria-label="Start">${startIcon}</button>
                ${opts.win10 ? '<span class="xi">⟦search⟧ اكتب هنا للبحث</span>' : ''}${pinned.map(pin).join('')}</div>
                <div class="qc">${wifi}<span>⟦volume-2⟧</span><button type="button" class="qb" data-fun="clock">${clock}</button></div></div>`;
        } else {
            bars = `<div class="aiw"><button type="button" class="agc" data-tap="start" aria-label="Menu"><span class="acr">m</span></button>${pinned.map(pin).join('')}
                <span class="yc"><button type="button" class="mm" data-tap="tray-update" aria-label="Update Manager">${PCI.shield}${opts.badge ? '<em></em>' : ''}</button>${wifi}<button type="button" class="qb" data-fun="clock">${clock}</button></span></div>`;
        }
        return `<div class="ft ${os}" style="background:${opts.win10 ? WALL.win10 : WALL[os]}">${os === 'mac' ? bars : ''}
            <div class="kw">${desktopIcons(os)}${opts.windows || ''}</div>${os === 'mac' ? '' : bars}${opts.overlay || ''}</div>`;
    }

    // Icons on the desktop itself. Only the bin does anything (it's an easter egg); the rest are there to look right.
    function desktopIcons(os) {
        const icon = (label, glyph, egg) => `<button type="button" class="kx"${egg ? ' data-egg="bin"' : ' tabindex="-1"'}><span>${glyph}</span>${label}</button>`;
        if (os === 'windows') return `<div class="rd">${icon('سلة المحذوفات', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('الكمبيوتر', '⟦monitor⟧')}${icon('الرئيسية', '⟦house⟧')}${icon('سلة المحذوفات', '⟦trash-2⟧', true)}</div>`;
        return '';
    }

    // A window. opts: max, wide, style
    function pcWin(os, title, inner, opts = {}) {
        const ctrls = os === 'mac'
            ? '<span class="afm"><button type="button" class="ze" data-tap="win-close" aria-label="Close window"></button><button type="button" class="abq" data-tap="win-min" aria-label="Minimise window"></button><button type="button" class="abp" data-tap="win-max" aria-label="Full screen"></button></span>'
            : '<span class="ahm"><button type="button" data-tap="win-min" aria-label="Minimise">—</button><button type="button" data-tap="win-max" aria-label="Maximise">▢</button><button type="button" class="afp" data-tap="win-close" aria-label="Close">⟦x⟧</button></span>';
        return `<div class="ev ${os}${opts.max ? ' max' : ''}${opts.cls ? ' ' + opts.cls : ''}" style="${opts.style || ''}">
            <div class="iu">${os === 'mac' ? ctrls : ''}<span class="ka">${title}</span>${os === 'mac' ? '' : ctrls}</div>
            <div class="ht">${inner}</div></div>`;
    }

    function startMenu(os, extra = []) {
        const items = [['browser', 'open-browser'], ['files', 'open-files'], ['settings', 'open-settings'], ['store', 'open-store'], ['text', 'open-text'], ...extra, ...(os === 'linux' ? [['terminal', 'open-terminal']] : [])];
        const funOf = {'open-text': 'notepad', 'open-terminal': 'terminal'};
        const btn = ([kind, id]) => `<button type="button" class="os" data-tap="${id}"${funOf[id] ? ` data-fun="${funOf[id]}"` : ''}>${pcIcon(os, kind)}<span>${appLabel(os, kind)}</span></button>`;
        const search = ph => `<label class="iz">${LU('search')}<input class="ip" data-fun-input="menu" placeholder="${ph}" aria-label="Search"></label>`;
        if (os === 'windows') {
            return `<div class="mh aip">${search('ابحث عن التطبيقات والإعدادات والمستندات')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('بحث')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('اكتب للبحث…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">علامة تبويب جديدة <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ ابحث أو اكتب عنوان موقع</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'هذا هو <strong>سطح المكتب</strong>. الشريط الممتد في الأسفل هو <strong>شريط المهام</strong>. افتح متصفح الويب من قائمة ابدأ: <strong>انقر على ابدأ</strong>، المربعات الأربعة.'
            : os === 'mac' ? 'هذا هو <strong>سطح المكتب</strong>. صف التطبيقات في الأسفل هو <strong>Dock</strong>، والشريط في الأعلى هو <strong>شريط القوائم</strong>. <strong>انقر على التطبيقات</strong> (شبكة المربعات) لترى كل تطبيقاتك.'
            : 'هذا هو <strong>سطح المكتب</strong> في Linux Mint. الشريط الممتد في الأسفل هو <strong>اللوحة</strong>. تطبيقاتك في القائمة: <strong>انقر على القائمة</strong>، في أسفل اليسار.',
         hint: os === 'mac' ? 'التطبيقات في Dock في الأسفل، بجانب Finder.' : (os === 'windows' ? 'ابدأ هو المربعات الزرقاء الأربعة على شريط المهام.' : 'زر القائمة في أقصى يسار اللوحة السفلية.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>انقر على ${N.browser[os]}</strong>، متصفح الويب.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'لكل نافذة ثلاثة أزرار ملوّنة في <strong>أعلى اليسار</strong>. الأصفر يُخفي النافذة. <strong>انقر على الزر الأصفر.</strong>'
            : 'لكل نافذة ثلاثة أزرار في <strong>أعلى اليمين</strong>. الخط <strong>—</strong> يُخفي النافذة (تصغير). <strong>انقر على —</strong>.',
         hints: {'win-close': 'هذا يغلقها. أولًا، أخفِها بـ ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'هذا يجعلها تملأ الشاشة. أولًا، أخفِها.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `إنها مخفية، لا مغلقة. ${os === 'mac' ? 'النقطة تحت أيقونتها في Dock' : 'line under its icon'} يبيّن أنها ما زالت مفتوحة. <strong>انقر على أيقونة ${N.browser[os]}</strong> لإعادتها.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `الآن اجعلها تملأ الشاشة: <strong>انقر على الزر ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'في Mac، الزر الأحمر يغلق النافذة. لكن التطبيق قد يبقى يعمل. كيف تغلقه تمامًا؟', options: [
                {t: 'اضغط ⟦command⟧ Cmd + Q، أو اختر Quit من قائمة التطبيق في الأعلى', ok: true, why: 'نعم. النقطة تحت التطبيق في Dock تعني أنه ما زال يعمل. و⟦command⟧ Cmd + Q يغلقه.'},
                {t: 'انقر على الزر الأحمر مرتين', why: 'الزر الأحمر يغلق النوافذ فقط. و⟦command⟧ Cmd + Q (أو قائمة التطبيق > Quit) يغلق التطبيق.'}]}
            : {q: 'أين زر الإغلاق في النافذة؟', options: [
                {t: 'أعلى اليمين: ⟦x⟧', ok: true, why: 'نعم. في Windows وLinux Mint تكون الأزرار الثلاثة في أعلى اليمين. (وفي Mac تكون في أعلى اليسار، بالأحمر والأصفر والأخضر.)'},
                {t: 'أسفل اليسار', why: 'إنه في أعلى يمين كل نافذة: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>أحسنت!</strong> أصبحت تستطيع فتح النوافذ وإخفاءها وإعادتها وتكبيرها وإغلاقها. وهذا معظم استخدام الحاسوب.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'الرئيسية' : 'الرئيسية'], ['desktop', 'سطح المكتب'], ['documents', 'المستندات'], ['downloads', 'التنزيلات'], ['pictures', 'الصور']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ فلاش USB']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'المستندات'], ['pictures', '⟦folder⟧', 'الصور'], ['downloads', '⟦folder⟧', 'التنزيلات']],
            downloads: [['photo', '⟦image⟧', 'Holiday photo.jpg'], ['bill', '⟦file-text⟧', 'Council tax bill.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Holiday photo.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'العطلات')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Letter to council.docx'], ['recipes', '⟦folder⟧', 'الوصفات']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'المستندات']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'مجلد جديد', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'الرئيسية' : 'الرئيسية', downloads: 'التنزيلات', pictures: 'الصور', documents: 'المستندات', usb: 'فلاش USB', desktop: 'سطح المكتب'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">هذا المجلد فارغ</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'نسخ' : 'نسخ';
    const pasteLabel = os => os === 'mac' ? 'لصق العنصر' : 'لصق';
    const newFolderLabel = os => os === 'mac' ? 'مجلد جديد' : os === 'windows' ? 'جديد > مجلد' : 'إنشاء مجلد جديد';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `صورك ورسائلك محفوظة في <strong>مجلدات</strong>. <strong>انقر على ${N.files[os]}</strong> لتتفقدها.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'في يسار Dock' : 'في ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'في الجانب توجد مجلداتك الرئيسية. ما تنزّله من رسائل البريد الإلكتروني والمواقع يذهب إلى <strong>التنزيلات</strong>. <strong>انقر على التنزيلات.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'فتح'], ['menu-copy', copyLabel(os)], ['menu-rename', 'إعادة التسمية'], ['menu-delete', os === 'mac' ? 'نقل إلى سلة المهملات' : 'حذف']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'لننسخ صورة العطلة إلى الصور، حيث مكانها. <strong>انقر بالزر الأيمن</strong> على <strong>Holiday photo.jpg</strong>: اضغط زر الفأرة <strong>الأيمن</strong>. <em>' + (os === 'mac' ? 'على لوحة اللمس، انقر بإصبعين.' : 'على شاشة اللمس، اضغط مطولًا.') + '</em>',
         hint: 'استخدم زر الفأرة الأيمن على الصورة.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `تظهر قائمة. <strong>انقر على ${copyLabel(os)}.</strong> <em>(الاختصار هو ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'ليس هذا! انقر على نسخ.', 'menu-open': 'هذا يفتح الصورة. انقر على نسخ.', 'menu-rename': 'انقر على نسخ.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>انقر على الصور</strong> على اليسار.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'مجلد الصور فارغ. <strong>انقر بالزر الأيمن على المساحة البيضاء الفارغة.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>انقر على ${pasteLabel(os)}.</strong> <em>(أو ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'سننشئ مجلدًا بعد ذلك. أولًا، انقر على ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'أصبحت الصورة الآن في الصور أيضًا. الآن أنشئ مجلدًا لتحتفظ بصور العطلات معًا. <strong>انقر بالزر الأيمن على المساحة الفارغة مرة أخرى.</strong>', hints: {'rc-photo2': 'انقر بالزر الأيمن على المساحة الفارغة، لا على الصورة.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>انقر على ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'اكتب اسمًا للمجلد أولًا، مثل Holidays.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>اكتب اسمًا</strong>، مثل <strong>Holidays</strong>، ثم <strong>انقر على OK</strong> (أو اضغط Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'أين تنتهي عادةً الملفات القادمة من البريد الإلكتروني والمواقع؟', options: [
            {t: 'في مجلد التنزيلات', ok: true, why: 'نعم. إذا لم تجد شيئًا نزّلته، فابحث في التنزيلات أولًا.'},
            {t: 'على سطح المكتب', why: 'عادةً في التنزيلات. ابحث هناك أولًا إذا لم تجد شيئًا.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>أحسنت!</strong> النقر بالزر الأيمن هو سر معظم الأشياء: النسخ واللصق وإعادة التسمية والمجلد الجديد كلها في تلك القائمة.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>أدخل كلمة مرور الشبكة</p>${field('wifipass', 'كلمة مرور', ctx)}<button type="button" class="ce co" data-tap="connect">اتصال</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'شبكات Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ متصل بـ Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `للاتصال بـ Wi-Fi، <strong>انقر على رمز Wi-Fi</strong> ${os === 'mac' ? 'في أعلى يمين الشاشة' : 'في أسفل اليمين، قرب الساعة'}.`, hint: os === 'mac' ? 'إنه في شريط القوائم في أعلى اليمين.' : 'إنه قرب الساعة في أسفل اليمين.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'اسم شبكتك على الملصق الموجود على الراوتر. هذه الشبكة التدريبية هي <strong>Home-WiFi-5G</strong>. <strong>انقر عليها.</strong>', hints: {'net-neighbour': 'هذه شبكة جارك! اختر Home-WiFi-5G.', 'net-cafe': 'هذه ليست شبكة منزلك. اختر Home-WiFi-5G.', 'tray-wifi': 'قائمة شبكات Wi-Fi مفتوحة أصلًا. انقر على Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'اكتب كلمة المرور تمامًا: Green-Apple-42 (حرف G وحرف A كبيران).',
         action: c => { c.connected = true; c.picked = false; }, say: 'اكتب كلمة المرور من الملصق <strong>تمامًا</strong>: <strong>Green-Apple-42</strong>. ثم <strong>انقر على اتصال</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'لوحة Wi-Fi مفتوحة أصلًا. اكتب كلمة المرور في المربع، ثم انقر على اتصال.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'أنت في مقهى فيه Wi-Fi مجاني. هل يصلح للخدمات المصرفية عبر الإنترنت؟', options: [
            {t: 'الأفضل الانتظار حتى تصل إلى المنزل، أو استخدام بيانات هاتفك', ok: true, why: 'نعم. Wi-Fi المجاني مناسب للتصفح، أما للبنك فاستخدم Wi-Fi المنزل أو بيانات هاتفك.'},
            {t: 'نعم، أي Wi-Fi مناسب', why: 'Wi-Fi العام المجاني مناسب للتصفح، لكن اترك الخدمات المصرفية للمنزل أو لبيانات الهاتف.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>أحسنت!</strong> سيتذكر حاسوبك كلمة المرور ويتصل من تلقاء نفسه في المرة القادمة.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'قائمة التسوق: حليب، خبز، بيض، أكياس شاي، بطاقة عيد ميلاد لـ Jean';
        const note = pcWin(os, `قائمة التسوق – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'بريد إلكتروني جديد إلى Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'انقر هنا للكتابة…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'البريد' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `اختصارات لوحة المفاتيح توفر الكثير من النقر. <strong>${CMDL(os)}</strong> هو المفتاح ${os === 'mac' ? 'على جانبي مفتاح المسافة، ومكتوب عليه ⟦command⟧' : 'في أسفل يسار لوحة المفاتيح'}. لتحديد كل الكتابة، اضغط مطولًا على <strong>${CMDL(os)}</strong> واضغط على <strong>A</strong>. <em>استخدم لوحة مفاتيحك الحقيقية، أو الأزرار على الشاشة.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `تم تحديده. الآن انسخه: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'تم النسخ! <strong>انقر داخل البريد الإلكتروني</strong> إلى Sarah، حيث مكتوب "انقر هنا للكتابة".'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `الآن الصق: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `عفوًا، حذفت شيئًا بالخطأ. أي اختصار يتراجع عنه؟`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `نعم. ${CMDL(os)} + Z يتراجع عن آخر ما فعلته، في كل التطبيقات تقريبًا. اضغط عليه مرة أخرى للتراجع أكثر.`},
            {t: 'Escape', why: `Escape يغلق القوائم. و${CMDL(os)} + Z هو التراجع.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'كيف تلتقط لقطة شاشة (صورة للشاشة)؟', options: [
            {t: os === 'windows' ? 'مفتاح Windows + Shift + S، ثم اسحب فوق ما تريد' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4، ثم اسحب فوق ما تريد' : 'اضغط مفتاح Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'نعم. تُنسخ الصورة، ويتيح لك إشعار حفظها. ومفتاح Print Screen يعمل أيضًا.' : os === 'mac' ? 'نعم. تُحفظ الصورة على سطح مكتبك. وShift + ⟦command⟧ Cmd + 3 يلتقط الشاشة كلها.' : 'نعم. يحفظها Linux Mint في مجلد الصور. وShift + Print Screen يتيح لك اختيار منطقة.'},
            {t: 'التقط صورة للشاشة بهاتفك', why: 'هذا يصلح، لكن لقطة الشاشة أوضح بكثير. ' + (os === 'windows' ? 'مفتاح Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'اضغط Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>أحسنت!</strong> الأربعة الكبار: <strong>${CMDL(os)} + C</strong> نسخ، <strong>V</strong> لصق، <strong>Z</strong> تراجع، <strong>A</strong> تحديد الكل. تعمل في كل التطبيقات تقريبًا.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'مجانية', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'مجاني · مشتريات داخل التطبيق', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>ابحث عن تطبيقات</span></button><div class="hp"><span>مميّز</span><strong>تطبيقات لحاسوبك الجديد</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'فتح' : (os === 'mac' ? 'الحصول' : 'تثبيت')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">جارٍ تثبيت LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">متجر تدريبي: الأسماء والأسعار أمثلة.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `أأمن مكان للحصول على التطبيقات هو المتجر المدمج: <strong>${N.store[os]}</strong>. <strong>انقر عليه.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'تريد شيئًا تكتب به الرسائل، مثل Word. <strong>انقر على مربع البحث.</strong> سنبحث عن "office".'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> بديل مجاني لـ Microsoft Office، من إنتاج <strong>The Document Foundation</strong>. تحقق من الجهة المنتجة، ثم <strong>انقر على ' + (os === 'mac' ? 'الحصول' : 'تثبيت') + ' بجانب LibreOffice</strong>.',
         hints: {'get-fake1': 'هذا إعلان، ويكلّف £29.99 في السنة. LibreOffice مجاني.', 'get-fake2': 'هذا من AppMakers وفيه مشتريات داخل التطبيق. اختر LibreOffice، من The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'نافذة منبثقة في موقع تقول "حاسوبك بطيء! نزّل Speed Booster الآن". ماذا تفعل؟', options: [
            {t: 'أغلقها. ثبّت التطبيقات من المتجر أو من موقع الجهة المنتجة نفسها فقط', ok: true, why: 'تمامًا. النوافذ المنبثقة التي تعرض "مسرّعات" أو "منظّفات" كثيرًا ما تكون مزعجة أو أسوأ.'},
            {t: 'نزّله، فقد يساعد', why: 'هذه كثيرًا ما تكون مزعجة أو ضارة. ثبّت فقط من المتجر أو من موقع الجهة المنتجة نفسها.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>أحسنت!</strong> تم تثبيت LibreOffice. تحقق من الجهة المنتجة، وتجاهل الإعلانات، واحذر من التطبيقات "المجانية" التي تطلب مالًا لاحقًا.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'الرئيسية'], ['system', 'النظام'], ['bluetooth', 'Bluetooth والأجهزة'], ['network', 'الشبكة والإنترنت'], ['accounts', 'الحسابات'], ['privacy', 'الخصوصية والأمان'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>الرئيسية</h3><p class="cf">الإعدادات الموصى بها وحسابك.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ أنت محدَّث</p>' : ctx.ready ? `<p class="cf">يلزم إعادة التشغيل لإنهاء تثبيت التحديثات.</p><button type="button" class="ce co bz" data-tap="restart">إعادة التشغيل الآن</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'جارٍ التنزيل… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'الإعدادات', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'بلوتوث'], ['general', 'عام'], ['privacy', 'الخصوصية والأمان'], ['users', 'المستخدمون والمجموعات']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ جهاز Mac محدَّث</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'جارٍ التنزيل… متبقٍ نحو 10 دقائق' : 'إصلاحات الأمان والأخطاء'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>الخصوصية والأمان</h3><p class="cf"><strong>الأمان</strong><br>السماح بالتطبيقات من:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store والمطورين المعروفين</button>`,
            };
            return pcWin(os, 'إعدادات النظام', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>إعدادات النظام</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'مدير التحديثات', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ نظامك محدَّث</p>' : `<div class="ahf">${['متصفح الويب Firefox', 'نواة Linux (أمان)', 'LibreOffice', 'مكتبات النظام'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">جارٍ تثبيت التحديثات…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>التوثيق مطلوب</strong></p><p class="fd">أدخل كلمة مرورك لتثبيت التحديثات. (للتدريب: أُدخلت لك.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">إلغاء</button><button type="button" class="adg" data-tap="auth-ok">توثيق</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'التحديثات تصلح الثغرات الأمنية التي يستغلها المحتالون. لنتحقق من وجودها. <strong>انقر على ابدأ.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>انقر على الإعدادات</strong> (الترس).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>انقر على Windows Update</strong>، في أسفل القائمة على اليسار.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'هناك تحديثات بانتظارك. <strong>انقر على تنزيل وتثبيت الكل.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'احفظ أولًا أي عمل تقوم به، ثم <strong>انقر على إعادة التشغيل الآن</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'التحديثات تصلح الثغرات الأمنية التي يستغلها المحتالون. <strong>انقر على قائمة Apple</strong> (الشعار) في أعلى اليسار.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>انقر على إعدادات النظام…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'أنت في عام. <strong>انقر على تحديث البرنامج.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'التحديث جاهز. صِل الشاحن، ثم <strong>انقر على التحديث الآن</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'يُنزّله Mac، ثم يعيد التشغيل لتثبيته.',
         question: {q: 'التحديثات التلقائية مفعّلة. هل ما زال عليك أن تفعل شيئًا؟', options: [
            {t: 'فقط أعد التشغيل عندما يطلب، واتركه موصولًا بالشاحن طوال الليل بين الحين والآخر', ok: true, why: 'نعم. تُثبَّت التحديثات غالبًا خلال الليل. وإعادة التشغيل عند الطلب تُكملها.'},
            {t: 'أوقف التحديثات التلقائية', why: 'أبقِها مفعّلة: فهي تحميك. فقط أعد التشغيل عندما يطلب Mac ذلك.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'التحديثات تصلح الثغرات الأمنية. في Linux Mint، يُظهر <strong>الدرع</strong> قرب الساعة نقطة عندما تكون هناك تحديثات بانتظارك. <strong>انقر على الدرع.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'يسردها مدير التحديثات كلها. <strong>انقر على تثبيت التحديثات.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'يطلب Linux <strong>كلمة مرورك</strong> قبل تغيير أي شيء مهم. وهذا أمر جيد. <strong>انقر على توثيق.</strong>', hints: {'auth-cancel': 'هذا يلغي التحديثات. انقر على توثيق.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'كم مرة ينبغي أن تثبّت التحديثات؟', options: [
            {t: 'كلما أظهر الدرع نقطة: لا يستغرق الأمر سوى دقيقة', ok: true, why: 'نعم. نادرًا ما يحتاج Linux Mint إلى إعادة تشغيل، إلا في بعض تحديثات الأمان.'},
            {t: 'مرة في السنة', why: 'ثبّتها كلما أظهر الدرع نقطة. لا يستغرق الأمر سوى دقيقة.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>أحسنت!</strong> حاسوبك محدَّث. إبقاؤه محدَّثًا هو أفضل شيء تفعله لتبقى بأمان.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'النظام', 'الشاشة والصوت وحول'], ['tile-devices', '⟦printer⟧', 'الأجهزة', 'Bluetooth والطابعات'], ['tile-network', '⟦globe⟧', 'الشبكة والإنترنت', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'الحسابات', 'حساباتك'], ['tile-update', '⟦refresh-cw⟧', 'التحديث والأمان', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ حاسوبك مسجّل في التحديثات الأمنية الموسّعة</p><p class="cf">تحديثات أمان حتى 12 أكتوبر 2027.</p>' : `<div class="ahg"><strong>انتهى دعم Windows 10</strong><p>حاسوبك لا يستوفي متطلبات تشغيل Windows 11. سجّل في التحديثات الأمنية الموسّعة لتواصل تلقي تحديثات الأمان.</p>
            <button type="button" class="ce co bz" data-tap="enroll">سجّل الآن</button></div>`}`;
        else inner = `<h3>التحديثات الأمنية الموسّعة</h3><p class="cf">اختر كيف تسجّل:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>انسخ إعدادات حاسوبك احتياطيًا</strong><small>مجانًا، بحساب Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>استخدم 1,000 نقطة من Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>شراء لمرة واحدة</strong><small>مدفوع</small></button>${ctx.busy ? '<p class="cf">جارٍ التسجيل…</p>' : ''}`;
        return pcWin('windows', 'الإعدادات', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'إذا بدا حاسوبك هكذا، مع ابدأ في أقصى اليسار، فقد يكون <strong>Windows 10</strong>. لنتحقق. <strong>انقر على ابدأ.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>انقر على الإعدادات</strong> (الترس).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>انقر على النظام.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'يقول Windows 10 Home. ماذا يعني ذلك في 2026؟', options: [
            {t: 'أوقفت Microsoft الدعم العادي في أكتوبر 2025. ما زال يعمل، لكنه يحتاج إلى التحديثات الأمنية الموسّعة ليبقى آمنًا', ok: true,
             why: 'نعم. برنامج التحديثات الأمنية الموسّعة المجاني للمستخدمين المنزليين يستمر الآن حتى 12 أكتوبر 2027. وبعد ذلك لا يتلقى Windows 10 أي إصلاحات أمنية.'},
            {t: 'لا شيء، سيُحدَّث Windows 10 إلى الأبد', why: 'انتهى الدعم العادي في أكتوبر 2025. والتحديثات الأمنية الموسّعة تستمر الآن حتى 12 أكتوبر 2027، ثم تتوقف.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>انقر على ← الرئيسية</strong> للرجوع.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>انقر على التحديث والأمان.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'هذا الحاسوب المحمول أقدم من أن يشغّل Windows 11، لذا يعرض Windows <strong>التحديثات الأمنية الموسّعة</strong>. <strong>انقر على سجّل الآن.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'الطريقة المجانية هي نسخ إعداداتك احتياطيًا إلى حساب Microsoft. <strong>انقر على انسخ إعدادات حاسوبك احتياطيًا.</strong>', hints: {'esu-buy': 'لا تحتاج إلى الدفع. اختر خيار النسخ الاحتياطي المجاني.', 'esu-points': 'هذا يصلح إن كانت لديك النقاط، لكن خيار النسخ الاحتياطي مجاني للجميع.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'ما خياراتك قبل أكتوبر 2027؟', options: [
            {t: 'الترقية إلى Windows 11 إن أمكن، أو شراء حاسوب جديد، أو تحويل حاسوب أقدم إلى Linux Mint (مجاني)', ok: true, why: 'نعم. Linux Mint مجاني ويعمل جيدًا على الحواسيب المحمولة الأقدم. الدروس التالية توضح مكان الأشياء في Mac وفي Linux Mint.'},
            {t: 'مواصلة استخدام Windows 10 بعد 2027 للخدمات المصرفية', why: 'بعد أكتوبر 2027 لا يتلقى أي إصلاحات أمنية، فلا يكون آمنًا للخدمات المصرفية. رقِّ، أو استبدل، أو انتقل إلى Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>أحسنت!</strong> أنت تعرف أي Windows لديك وكيف تبقيه آمنًا حتى أكتوبر 2027. احذر من المكالمات أو النوافذ المنبثقة التي تعرض "ترقيتك" مقابل رسوم: هذه احتيال.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'تنتقل من Windows؟ في Mac تعيش التطبيقات في <strong>Dock</strong> في الأسفل، وقوائم كل تطبيق في <strong>شريط القوائم</strong> في الأعلى. <strong>انقر على Safari</strong>، متصفح الويب، في Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'أزرار النافذة في <strong>أعلى اليسار</strong> في Mac. <strong>انقر على الزر الأحمر</strong> لإغلاق النافذة.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'اختفت النافذة، لكن هل ترى <strong>النقطة تحت Safari</strong> في Dock؟ إنه ما زال يعمل. لإغلاقه، <strong>انقر بالزر الأيمن على Safari في Dock</strong> (بإصبعين على لوحة اللمس).', hint: 'انقر بالزر الأيمن (أو انقر بإصبعين) على أيقونة Safari في Dock.',
         hints: {'app-browser': 'النقرة العادية تفتحه مرة أخرى. انقر بالزر الأيمن بدلًا من ذلك.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>انقر على Quit.</strong> <em>(الاختصار هو ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'الإعدادات تحت <strong>قائمة Apple</strong> (الشعار) في أعلى اليسار. <strong>انقر عليها.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'إيقاف التشغيل وإعادة التشغيل هنا أيضًا. <strong>انقر على إعدادات النظام…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'في Windows تنسخ بـ Ctrl + C. فما الاختصار في Mac؟', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'نعم. معظم اختصارات Windows تستخدم ⟦command⟧ Cmd في Mac بدلًا من Ctrl: ⟦command⟧ C و⟦command⟧ V و⟦command⟧ Z و⟦command⟧ A.'},
            {t: 'Ctrl + C، نفسه', why: 'في Mac هو ⟦command⟧ Cmd + C. معظم اختصارات Ctrl تصبح ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>أحسنت!</strong> Dock في الأسفل، والقوائم في الأعلى، وأزرار النافذة في أعلى اليسار، و⟦command⟧ Cmd بدلًا من Ctrl، وقائمة Apple للإعدادات وإيقاف التشغيل.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> نظام مجاني يعمل بشكل يشبه Windows كثيرًا، ويعمل جيدًا على الحواسيب الأقدم. تطبيقاتك في <strong>القائمة</strong>، أسفل اليسار، مثل زر ابدأ. <strong>انقر على القائمة.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'يأتي Linux Mint مع تطبيقات مجانية مثبّتة أصلًا. للرسائل، استخدم <strong>LibreOffice Writer</strong> الذي يعمل مثل Microsoft Word. <strong>انقر عليه.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">File Edit View Insert Format <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Dear Sir or Madam,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'هل تستطيع فتح مستندات Word التي يرسلها الناس إليك بالبريد؟', options: [
            {t: 'نعم. يفتح LibreOffice ملفات Word (.docx) ويحفظها', ok: true, why: 'نعم. عند حفظ شيء لترسله إلى مستخدم Word، اختر صيغة Word (.docx) في حفظ باسم.'},
            {t: 'لا، تحتاج إلى Windows لذلك', why: 'يفتح LibreOffice ملفات Word (.docx) ويحفظها، فتستطيع تبادل المستندات مع مستخدمي Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Dear Sir or Madam,</div></div>', {max: true})}),
         target: 'win-close', say: 'أزرار النافذة في أعلى اليمين، تمامًا مثل Windows. <strong>انقر على ⟦x⟧</strong> لإغلاق Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'لنجد الآن أين نحصل على المزيد من التطبيقات. <strong>انقر على القائمة</strong> مرة أخرى.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>مدير البرامج</strong> هو متجر التطبيقات المجاني في Linux Mint. <strong>انقر عليه.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'مدير البرامج', `<div class="jo"><div class="gq">${ICON.search}<span>بحث</span></div>
            <div class="aan">${['الإنترنت', 'المكتب', 'الرسوميات', 'الصوت والفيديو', 'الألعاب', 'إمكانية الوصول'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">آلاف التطبيقات المجانية، يفحصها Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'هل تحتاج إلى شراء برنامج مضاد فيروسات لـ Linux Mint؟', options: [
            {t: 'لا. أبقِه محدَّثًا، واحصل على التطبيقات من مدير البرامج، وستكون محميًا جيدًا', ok: true, why: 'نعم. فيروسات Linux قليلة. التحديثات وجدار الحماية المدمج يؤديان المهمة. وتبقى عمليات الاحتيال في البريد والمواقع قائمة، فابقَ منتبهًا.'},
            {t: 'نعم، الأغلى', why: 'لا. أبقِه محدَّثًا واحصل على التطبيقات من مدير البرامج. واحذر من عمليات الاحتيال في البريد والمواقع كالمعتاد.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>أحسنت!</strong> القائمة أسفل اليسار، والإغلاق أعلى اليمين، وLibreOffice للمستندات، وFirefox للويب، ومدير البرامج للتطبيقات، والدرع للتحديثات.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ تم توصيل فلاش USB</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'قبل أن تبدّل حاسوبك، انسخ ملفاتك إلى <strong>فلاش USB</strong>. أدخله في منفذ USB على جانب الحاسوب. هنا، <strong>انقر على وصّل فلاش USB</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ تم توصيل فلاش USB</div>'}), target: 'app-files', say: `<strong>افتح ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'فتح'], ['menu-copy', 'نسخ'], ['menu-rename', 'إعادة التسمية']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'رسائلك في <strong>المستندات</strong>. <strong>انقر بالزر الأيمن على مجلد المستندات.</strong> <em>(افعل الشيء نفسه مع الصور بعد ذلك.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>انقر على نسخ.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'فلاش USB على اليسار. <strong>انقر على فلاش USB.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'إنه فارغ. <strong>انقر بالزر الأيمن على المساحة الفارغة.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>انقر على ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'جارٍ نسخ 214 عنصرًا… متبقية دقيقة' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'إخراج']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'تم! قبل أن تسحب الفلاش، <strong>أخرجه</strong> حتى لا يتضرر شيء. <strong>انقر بالزر الأيمن على فلاش USB</strong> على اليسار.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>انقر على إخراج.</strong> بعدها يمكنك سحبه بأمان.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'طريقة أخرى لنقل الملفات إلى حاسوب جديد؟', options: [
            {t: 'التخزين عبر الإنترنت: OneDrive أو iCloud أو Google Drive', ok: true, why: 'نعم. ارفع من الحاسوب القديم، وسجّل الدخول على الجديد، فتجدها هناك. وفلاش USB نسخة إضافية جيدة أيضًا.'},
            {t: 'أرسل كل ملف إلى نفسك بالبريد واحدًا واحدًا', why: 'سيستغرق ذلك وقتًا طويلًا! استخدم فلاش USB أو التخزين عبر الإنترنت مثل OneDrive أو iCloud أو Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>أحسنت!</strong> على الحاسوب الجديد، أدخل الفلاش، وافتحه، وانسخ المجلدات إلى المستندات والصور.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ أوقات حافلات Bridlington ⟦star⟧ الوصفات</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">لم يتم تسجيل الدخول</span><button type="button" data-tap="sync">تفعيل المزامنة…</button><button type="button" data-tap="guest">فتح ملف ضيف</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>تسجيل الدخول بحساب Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(للتدريب: أُدخلت لك.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">التالي</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>هل تريد تفعيل المزامنة؟</strong></p><p class="fd">ستُحفظ إشاراتك المرجعية وكلمات مرورك وسجلك في حساب Google وتظهر على كل أجهزتك.</p><div class="jn"><button type="button" data-tap="cancel">إلغاء</button><button type="button" class="adg" data-tap="yes-in">نعم، أوافق</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">علامة تبويب جديدة</span>${profile}</div><div class="qn">⟦search⟧ ابحث في Google أو اكتب عنوان URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">جارٍ مزامنة إشاراتك المرجعية…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'إذا كنت تستخدم <strong>Chrome</strong> على حاسوبك القديم، فإن تسجيل الدخول يجلب إشاراتك المرجعية وكلمات مرورك المحفوظة إلى الجديد. (Firefox وEdge يعملان بالطريقة نفسها.) <strong>انقر على Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>انقر على أيقونة الشخص</strong> في أعلى اليمين.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>انقر على تفعيل المزامنة…</strong>', hints: {guest: 'ملف الضيف لا يحفظ شيئًا. انقر على تفعيل المزامنة.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'سجّل الدخول بـ<strong>حساب Google نفسه</strong> الذي استخدمته على الحاسوب القديم. <strong>انقر على التالي.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>انقر على نعم، أوافق.</strong>', hints: {cancel: 'هذا يوقف المزامنة. انقر على نعم، أوافق.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'عادت إشاراتك المرجعية. هل حفظ كلمات المرور في متصفحك آمن؟', options: [
            {t: 'نعم، إذا كان لحساب Google كلمة مرور قوية وتحقق بخطوتين', ok: true, why: 'نعم. إنه أكثر أمانًا بكثير من إعادة استخدام كلمة مرور واحدة في كل مكان. احمِ الحساب نفسه بالتحقق بخطوتين.'},
            {t: 'لا، اكتبها على ورقة لاصقة على الشاشة بدلًا من ذلك', why: 'مدير كلمات المرور في المتصفح أكثر أمانًا بكثير من ورقة على الشاشة، ما دام حسابك فيه تحقق بخطوتين.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>أحسنت!</strong> إشاراتك المرجعية وكلمات مرورك تبعتك. على حاسوب عام أو مشترك، لا تفعّل المزامنة.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'النظام'} تنبيه أمني ⚠️</strong>
            <p>حاسوبك مصاب بـ 5 فيروسات! بياناتك المصرفية وصورك في خطر.</p><p>لا تطفئ حاسوبك. اتصل بالدعم الآن:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">اتصل الآن</button><button type="button" data-tap="fake-close">إغلاق</button></div>
            <small>(صفحة احتيال تدريبية. الرقم غير حقيقي.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>هل تريد مغادرة الموقع؟</strong></p><p class="fd">قد لا تُحفظ التغييرات التي أجريتها.</p><div class="jn"><button type="button" data-tap="stay">البقاء</button><button type="button" class="adg" data-tap="leave">المغادرة</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'ملأت هذه الصفحة شاشتك فجأة أثناء التصفح. هل هي حقيقية؟', options: [
            {t: 'لا. إنه موقع مزيف يحاول إخافتك لتتصل بمحتالين', ok: true, why: 'تمامًا. التحذيرات الحقيقية لا تعرض رقم هاتف للاتصال به أبدًا. لا تتصل به، ولا تنقر على أي شيء في الصفحة.'},
            {t: 'نعم، اتصل بالرقم بسرعة', why: 'لا تتصل أبدًا. إنها صفحة مزيفة. وأشخاص "الدعم" سيحاولون السيطرة على حاسوبك وأموالك.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'ملأت الشاشة كلها فلا تستطيع رؤية كيف تغلقها. اضغط مفتاح <strong>Esc</strong> (أعلى يسار لوحة المفاتيح) للخروج من ملء الشاشة.',
         hints: {'call-btn': 'أبدًا! اضغط مفتاح Esc.', 'fake-close': 'أزرار الصفحة قد تكون فخاخًا. اضغط مفتاح Esc على لوحة المفاتيح بدلًا من ذلك.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'الآن تستطيع رؤية المتصفح. <strong>أغلق علامة التبويب</strong> بالزر ⟦x⟧.',
         hints: {'call-btn': 'لا تنقر على أي شيء في الصفحة. أغلق علامة التبويب بالزر ⟦x⟧.', 'fake-close': 'هذا جزء من صفحة الاحتيال. استخدم الزر ⟦x⟧ على علامة التبويب نفسها.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'تحاول إبقاءك هناك. <strong>انقر على المغادرة.</strong>', hints: {stay: 'انقر على المغادرة.'}},
        {screen: c => scareware(os, c), question: {q: 'ماذا لو لم تُغلق إطلاقًا؟', options: [
            {t: os === 'windows' ? 'اضغط Ctrl + Shift + Esc لفتح إدارة المهام، واختر المتصفح وانقر على إنهاء المهمة' : os === 'mac' ? 'اضغط ⟦command⟧ Cmd + Option + Esc وافرض إنهاء المتصفح' : 'انقر بالزر الأيمن على المتصفح في اللوحة واختر إغلاق، أو أعد تشغيل الحاسوب',
             ok: true, why: 'نعم. عندما تفتح المتصفح مرة أخرى، لا تدعه يستعيد الصفحات القديمة. كما أن إعادة تشغيل الحاسوب تنفع.'},
            {t: 'اتصل بالرقم للحصول على مساعدة في إغلاقها', why: 'لا تتصل به أبدًا. ' + (os === 'windows' ? 'استخدم Ctrl + Shift + Esc (إدارة المهام) لإغلاق المتصفح.' : os === 'mac' ? 'استخدم ⟦command⟧ Cmd + Option + Esc لفرض الإنهاء.' : 'أغلق المتصفح من اللوحة، أو أعد التشغيل.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>أحسنت!</strong> لم يكن حاسوبك مصابًا قط: كانت مجرد صفحة ويب. وإذا اتصلت برقم كهذا، فتواصل مع مصرفك وغيّر كلمات مرورك من جهاز آخر.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'أمن Windows', `<div class="aif"><h3>الحماية من الفيروسات والتهديدات</h3><p class="mj">⟦check⟧ لا توجد تهديدات حالية</p>
                <p class="cf">آخر فحص: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">جارٍ الفحص السريع… تم فحص 12,840 ملفًا</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ الحماية من الفيروسات</span><span>⟦check⟧ جدار الحماية</span><span>⟦check⟧ التحكم في التطبيقات والمتصفح</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'إعدادات جدار الحماية', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ جدار الحماية مفعّل</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'في Windows برنامج مجاني مضاد للفيروسات مدمج، اسمه <strong>أمن Windows</strong>. لنتحقق من أنه يعمل. <strong>انقر على ابدأ.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>انقر على الإعدادات.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>انقر على الخصوصية والأمان</strong> على اليسار.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>انقر على أمن Windows.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'العلامات الخضراء تعني أنك محمي. ولراحة بالك، <strong>انقر على فحص سريع</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'هل تحتاج إلى الدفع مقابل برنامج آخر مضاد للفيروسات أيضًا؟', options: [
            {t: 'لا. أمن Windows يكفي معظم الناس، ووجود برنامجين قد يبطّئ الحاسوب', ok: true, why: 'نعم. أبقِ Windows محدَّثًا وأمن Windows مفعّلًا. البرامج المدفوعة غالبًا لا تضيف سوى نوافذ منبثقة واشتراكات.'},
            {t: 'نعم، كلما زادت كان أفضل', why: 'برنامجان مضادان للفيروسات قد يتعارضان ويبطّئان الجهاز. أمن Windows يكفي معظم الناس.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'في أجهزة Mac حماية مجانية مدمجة تفحص التطبيقات والملفات في الخلفية. لنتحقق من إعداد واحد. <strong>انقر على قائمة Apple</strong> (الشعار).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>انقر على إعدادات النظام…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>انقر على الخصوصية والأمان</strong> على اليسار.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'الخيار المحدد هو "السماح بالتطبيقات من App Store والمطورين المعروفين". هل ينبغي أن تغيّره؟', options: [
            {t: 'لا، اتركه. فهو يحجب التطبيقات من جهات مجهولة', ok: true, why: 'نعم. إذا طلب منك موقع تغيير هذا لتثبيت شيء، فهذه علامة تحذير كبيرة.'},
            {t: 'نعم، اسمح بالتطبيقات من أي مكان', why: 'اتركه كما هو. فهو يمنع التطبيقات من جهات مجهولة. وأي موقع يطلب منك تغييره علامة تحذير.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'إعدادات النظام', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'هل تحتاج إلى شراء برنامج مضاد للفيروسات لجهاز Mac؟', options: [
            {t: 'معظم الناس لا يحتاجون. أبقِه محدَّثًا وثبّت التطبيقات من أماكن موثوقة فقط', ok: true, why: 'نعم. التحديثات والحماية المدمجة تؤديان المهمة. والنوافذ المنبثقة التي تقول إن Mac مصاب هي احتيال.'},
            {t: 'نعم، أي نافذة منبثقة تعرضه', why: 'النوافذ المنبثقة التي تعرض برامج مضادة للفيروسات لـ Mac غالبًا ما تكون احتيالًا. أبقِ Mac محدَّثًا بدلًا من ذلك.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'في Linux Mint <strong>جدار حماية</strong> مدمج، يحجب الاتصالات غير المرغوبة. وهو متوقف إلى أن تشغّله. <strong>انقر على القائمة.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>انقر على جدار الحماية.</strong> <em>(ابحث في القائمة عن "firewall" إن لم تجده.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>انقر على مفتاح الحالة</strong> لتشغيل جدار الحماية.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'ما الذي يحمي Linux Mint أيضًا؟', options: [
            {t: 'تثبيت التحديثات عندما يُظهر الدرع نقطة، والحصول على التطبيقات من مدير البرامج', ok: true, why: 'نعم. ومع القواعد المعتادة: كن حذرًا مع روابط البريد الإلكتروني والنوافذ المنبثقة.'},
            {t: 'لا حاجة إلى شيء آخر', why: 'واصل تثبيت التحديثات واحصل على التطبيقات من مدير البرامج. وعمليات الاحتيال في البريد والمواقع تبقى قائمة.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>أحسنت!</strong> الحماية المدمجة في حاسوبك مفعّلة. والتحديثات، والحذر من الروابط، وتثبيت التطبيقات من أماكن موثوقة فقط تتولى الباقي.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>توصيل الطرود</strong><span>فاتنا لقاؤك: أعد ترتيب التوصيل اليوم</span></button>
            <div class="lx"><strong>Sarah</strong><span>صور من يوم الأحد</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>نزهة السبت</span></div></div>`;
        const mail = `<div class="aau"><p><strong>توصيل الطرود</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>حاولنا توصيل طردك اليوم لكن لم يكن أحد في المنزل. يلزم دفع رسوم £1.45 لإعادة ترتيب التوصيل.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">إعادة ترتيب التوصيل</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ الإبلاغ عن تصيّد</button><button type="button" data-tap="reply">رد</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'البريد', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ تم الإبلاغ ونقله إلى الرسائل المزعجة</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'هذه رسالتك الإلكترونية، في المتصفح. <strong>افتح رسالة توصيل الطرود.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'على الحاسوب تستطيع معرفة أين يقود الرابط فعلًا <strong>دون النقر عليه</strong>. <strong>حرّك الفأرة فوق "إعادة ترتيب التوصيل"</strong> وأبقِها ثابتة. <em>(على شاشة اللمس، اضغط عليه مطولًا.)</em>',
         hints: {'click-link': 'لا تنقر عليه! فقط أبقِ مؤشر الفأرة فوقه.'}, hint: 'أبقِ مؤشر الفأرة فوق الرابط الأزرق، دون النقر.'},
        {screen: c => webmail(os, c), question: {q: 'يظهر العنوان الحقيقي في الأسفل: parcel-redelivery.example.top. هل هو آمن؟', options: [
            {t: 'لا. ليس موقع شركة توصيل حقيقية، وهم يريدون رسومًا', ok: true, why: 'نعم. شركات التوصيل لا تفرض رسومًا صغيرة بالبريد الإلكتروني أو الرسائل النصية. والعنوان الحقيقي يكشف الاحتيال.'},
            {t: 'نعم، فيه كلمة "parcel"', why: 'يستطيع أي أحد وضع كلمة "parcel" في عنوان موقع. ليست شركة توصيل حقيقية، والرسوم هي الاحتيال.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>انقر على الإبلاغ عن تصيّد.</strong> يمكنك أيضًا إعادة توجيه رسائل الاحتيال إلى report@phishing.gov.uk.', hints: {reply: 'لا ترد على المحتالين أبدًا. انقر على الإبلاغ عن تصيّد.', 'click-link': 'لا تنقر على الرابط! بلّغ عنه بدلًا من ذلك.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>أحسنت!</strong> مرّر المؤشر قبل أن تنقر: إذا لم يطابق العنوان الشركة، فلا تنقر.'},
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
        t.className = 'aex'; t.textContent = text;
        screen.appendChild(t); setTimeout(() => t.remove(), ms);
    };

    // A full-screen practice app on top of whatever the lesson is showing.
    function phOpen(screen, p, title, inner, opts = {}) {
        const st = phState(screen);
        screen.querySelectorAll('.lo').forEach(x => x.remove());
        const f = document.createElement('div');
        f.className = `lo ph-${p}${st.dark ? ' pg' : ''}${opts.cls ? ' ' + opts.cls : ''}` + (calm() ? '' : ' acj');
        f.style.setProperty('--ts', 1 + st.text * 0.12);
        f.innerHTML = `${statusBar(p)}${title !== null ? `<div class="tc"><button type="button" data-fun="ph-close" aria-label="Back">${p === 'ios' ? '‹' : '←'}</button><strong>${title}</strong>${opts.right || ''}</div>` : ''}
            <div class="yq">${inner}</div><button type="button" class="iv afb" data-fun="ph-close" aria-label="Home"></button>`;
        screen.appendChild(f);
        phDecorate(screen, p);
        return f;
    }

    // ---------- Phone (dialer) with secret codes ----------
    const DIAL_EGGS = {
        '*#06#': 'IMEI: 35 209900 176148 1 (رقم تدريبي). هذا هو الرمز الحقيقي لمعرفة رقم IMEI لهاتفك.',
        '999': 'هذا هاتف تدريبي، لذا لا يستطيع الاتصال بالرقم 999. في حالة طوارئ حقيقية، اتصل بالرقم 999 أو 112.',
        '112': 'هذا هاتف تدريبي، لذا لا يستطيع الاتصال بالرقم 112. الرقم 112 يعمل كالرقم 999 في المملكة المتحدة وعبر أوروبا.',
        '159': 'الرقم 159 يوصلك بأمان بمصرفك أنت. استخدمه إذا أقلقتك مكالمة عن أموالك.',
        '7726': 'الرقم 7726 هو الذي تعيد إليه توجيه الرسائل النصية الاحتيالية. وهو يهجّئ "SPAM" على لوحات أرقام الهواتف القديمة!',
        '123': 'speaking-clock',
        '1471': 'اتصل رقم الهاتف 07700 900842 اليوم الساعة 11:20. (تدريب. الرقم 1471 يخبرك من اتصل آخر مرة بهاتفك الأرضي.)',
        '01189998819991197253': 'هذا رقم الطوارئ من مسلسل The IT Crowd. هل جرّبت إيقاف تشغيله ثم تشغيله من جديد؟',
        '101': 'الرقم 101 هو رقم الشرطة للأمور التي ليست طارئة.',
        '111': 'الرقم 111 هو مساعدة NHS عندما يكون الأمر عاجلًا لكنه ليس طارئًا.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'الهاتف', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">أدخل رقمًا</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['ماما', '#f472b6', [['them', 'ظننت أن LOL تعني "الكثير من الحب". كنت أضعها على كل شيء!'], ['them', 'هل لهذا السبب لم تردّ عمتك؟'], ['them', 'أُرسل من iPad الخاص بي']]],
        ['مجهول', '#94a3b8', [['them', 'تهانينا! لقد ربحت هاتفًا مجانيًا. انقر هنا للمطالبة به: prize-winner.example'], ['note', 'هذا احتيال. لا تضغط على الرابط: أعد توجيهه إلى 7726، ثم احذفه.']]],
        ['Sarah', '#a78bfa', [['them', 'أبي يتعلم استخدام الرموز التعبيرية 😂'], ['them', 'أرسل لي باذنجانة وقال "للعشاء الليلة؟" 🍆']]],
        ['طبيب الأسنان', '#38bdf8', [['them', 'تذكير: موعدك يوم الثلاثاء الساعة 10:30. ردّ بـ Y للتأكيد.']]],
    ];
    const MUM_REPLIES = ['من هذا؟', 'اتصل بي، لا أستطيع قراءة الرسائل النصية بدون نظارتي', 'جميل! 👍', 'هل وصلتك رسالتي الأخيرة؟ أرسلتها إلى القطة بالخطأ.', 'أُرسل من iPad الخاص بي', 'حسنًا يا حبيبي xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'الرسائل', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
            return;
        }
        const [name, , msgs] = SMS_THREADS[open];
        const mine = st.sms.filter(m => m.t === open);
        const bubbles = msgs.map(([who, t]) => who === 'note' ? `<p class="nc">${esc(t)}</p>` : `<div class="dm ${who === 'me' ? 'me xh' : 'them'}"><span>${esc(t)}</span></div>`).join('')
            + mine.map(m => `<div class="dm ${m.me ? 'me xh' : 'them'}"><span>${esc(m.text)}</span></div>`).join('');
        const f = phOpen(screen, p, name, `<div class="aib"><div class="gf">${bubbles}</div>
            <div class="hn"><label class="eq"><input class="adb" placeholder="Text message" aria-label="Text message"></label><button type="button" class="ic" data-fun="ph-send" data-n="${open}" aria-label="Send">${UI.send}</button></div></div>`);
        const th = f.querySelector('.gf'); th.scrollTop = th.scrollHeight;
        f.querySelector('.adb').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); f.querySelector('[data-fun="ph-send"]').click(); } });
    }

    // ---------- Camera and Photos ----------
    const PH_PICS = [['🌅', 'linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)'], ['🐶', 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)'], ['🌻', 'linear-gradient(#bae6fd 0 45%, #4ade80 45%)'],
        ['🎂', 'linear-gradient(#fce7f3, #fbcfe8)'], ['🏰', 'linear-gradient(#93c5fd 0 60%, #a3a3a3 60%)'], ['🐦🍟', 'linear-gradient(#7dd3fc 0 55%, #fde68a 55%)']];
    function phCamera(screen, p) {
        const st = phState(screen);
        phOpen(screen, p, null, `<div class="ajl${st.selfie ? ' aig' : ''}"><div class="yn">${st.selfie ? '<span class="aez">🙂</span>' : '<span class="agp">☀️</span><span class="akc"></span>'}<span class="afa"></span></div>
            <div class="wy"><span>VIDEO</span><b>PHOTO</b><span>PORTRAIT</span></div>
            <div class="agn"><button type="button" class="wz" data-fun="ph-photos-open" aria-label="Photos">${st.photos.length ? (st.photos[st.photos.length - 1] ? '🙂' : '🌅') : ''}</button>
            <button type="button" class="nx" data-fun="ph-shutter" aria-label="Take photo"></button><button type="button" class="ym" data-fun="ph-flip" aria-label="Flip camera">${UI.flip}</button></div></div>`, {cls: 'cam'});
    }
    function phPhotos(screen, p, view = -1) {
        const st = phState(screen);
        const all = PH_PICS.concat(st.photos.map(s => [s ? '🙂' : '🌅', s ? 'linear-gradient(#fde68a, #fca5a5)' : 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)']));
        if (view >= 0) {
            const [ic, bg] = all[view];
            phOpen(screen, p, view === 5 ? 'النورس يضرب من جديد' : 'صورة', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">ضُبط متلبسًا على الواجهة البحرية في Bridlington. لم تُستعد رقائق البطاطس.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'الصور', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'الساعة', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
            <div class="ys"><span class="td">00:00.0</span><button type="button" data-fun="ph-sw">Start</button><button type="button" data-fun="ph-sw-reset">Reset</button></div>
            <div class="xa"><div><span>London</span><b data-tz="Europe/London"></b></div><div><span>New York</span><b data-tz="America/New_York"></b></div><div><span>Sydney</span><b data-tz="Australia/Sydney"></b></div><div><span>Narnia</span><b>Always winter</b></div></div></div>`);
        const tick = () => {
            if (!f.isConnected) return;
            const d = today();
            f.querySelector('.aaj').textContent = d.toLocaleTimeString('en-GB');
            f.querySelector('.yr').textContent = d.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'});
            f.querySelectorAll('[data-tz]').forEach(b => { b.textContent = d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: b.dataset.tz}); });
            if (f._sw && f._sw.run) { const ms = Date.now() - f._sw.t0 + f._sw.acc; f.querySelector('.td').textContent = `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${Math.floor(ms / 100) % 10}`; }
            requestAnimationFrame(tick);
        };
        f._sw = {run: false, t0: 0, acc: 0};
        tick();
    }
    function phWeather(screen, p) {
        const d = today(), winter = d.getMonth() === 11 || d.getMonth() < 2;
        phOpen(screen, p, 'الطقس', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'بارد، مع زخات ثلج خفيفة' : 'فترات مشمسة، ورياح خفيفة'}</p>
            <div class="ajf">${[['الجمعة', '⟦cloud-rain⟧', '11°'], ['السبت', '⟦wind⟧', '10°'], ['الأحد', '⟦sun⟧', '14°'], ['الاثنين', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">تحذير من النوارس: <strong>مرتفع</strong>. احرس رقائق البطاطس.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'من خلال الخزانة، ثم واصل المشي بعد عمود الإنارة.', home: 'لا مكان كالبيت. 🏠', 'القمر': '238,855 ميلًا. حركة المرور خفيفة.',
        chips: 'أقرب محل رقائق السمك والبطاطس: في أي مكان على الواجهة البحرية في Bridlington. 🍟', 'north pole': 'ورشة سانتا. مغلقة حتى ديسمبر. 🎅', bridlington: 'Bridlington، East Riding of Yorkshire. مكان جميل!',
        'flamborough': 'Flamborough Head: منارة وجروف وطيور البفن. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": هذه الخريطة التدريبية لا تعرف سوى بضعة أماكن. جرّب Bridlington أو Flamborough أو Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'الإعدادات', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'وضع الطيران' : 'وضع الطيران', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'بلوتوث', st.bt)}</div>
            <div class="lq">${row('dark', 'الوضع الداكن', st.dark)}${row('dnd', 'عدم الإزعاج', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'حول' : 'حول الهاتف'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'حول' : 'حول الهاتف', `<div class="aic"><div class="lq">
            <div class="ho"><span>الاسم</span><b>هاتف Margaret</b></div>
            <div class="ho"><span>الطراز</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'إصدار iOS' : 'إصدار Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>التخزين</span><b>مساحة وفيرة لصور الأحفاد</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>الرقم التسلسلي</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'اللعبة الكلاسيكية من الهواتف المحمولة القديمة.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'يحتوي على إعلانات · مشتريات داخل التطبيق'], ['knit', '⟦scissors⟧', 'Knitting Patterns', 'قريبًا في هذا المتجر التدريبي.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'متجر Play', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'فتح' : (p === 'ios' ? 'الحصول' : 'تثبيت')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>النتيجة: <b class="ado">0</b></span><span>الأفضل: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">اضغط على اتجاه (أو استخدم مفاتيح الأسهم) للبدء</p>
            <div class="aln"><button type="button" data-dir="0,-1" aria-label="Up">▲</button><button type="button" data-dir="-1,0" aria-label="Left">◀</button><button type="button" data-dir="1,0" aria-label="Right">▶</button><button type="button" data-dir="0,1" aria-label="Down">▼</button></div></div>`, {cls: 'snakef'});
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
                f.querySelector('.vy').textContent = `انتهت اللعبة! النتيجة ${score}. اضغط على اتجاه للعب مرة أخرى.`; return;
            }
            snake.unshift(h);
            if (h[0] === food[0] && h[1] === food[1]) { score++; f.querySelector('.ado').textContent = score; place(); } else snake.pop();
            draw();
        };
        const turn = d => {
            if (!alive) { reset(); alive = true; f.querySelector('.vy').textContent = ''; clearInterval(timer); timer = setInterval(step, 170); }
            if (d[0] !== -dir[0] || d[1] !== -dir[1]) dir = d;
        };
        f.querySelectorAll('.aln button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); turn(b.dataset.dir.split(',').map(Number)); }));
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
        const old = screen.querySelector('.vs');
        if (old) { old.remove(); return; }
        const t = (k, ic, label, on) => `<button type="button" class="yo${on ? ' on' : ''}" data-fun="ph-cc" data-k="${k}"><span>${ic}</span>${label}</button>`;
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'الطيران', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'بلوتوث', st.bt)}${t('dnd', '⟦moon⟧', 'عدم الإزعاج', st.dnd)}${t('torch', '⟦flashlight⟧', 'المصباح', st.torch)}${t('dark', '⟦sun-moon⟧', 'الوضع الداكن', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'اسحب للأعلى للإغلاق' : 'إغلاق'}</button></div>`);
        screen.querySelector('[data-fun-range="bright"]').addEventListener('input', e => { st.bright = +e.target.value; phDecorate(screen, p); });
        phDecorate(screen, p);
    }

    // After every redraw: wallpaper, dimming, torch, airplane, seasons.
    function phDecorate(screen, p) {
        const st = phState(screen);
        screen.querySelectorAll('.gr').forEach(h => { if (st.wall >= 0) h.style.background = PH_WALLS[st.wall]; });
        screen.style.setProperty('--dim', String((100 - st.bright) / 100 * 0.7));
        screen.classList.toggle('acx', st.bright < 100);
        screen.classList.toggle('aey', !!st.torch);
        screen.querySelectorAll('.jh').forEach(r => { if (st.airplane && !r.querySelector('.th')) r.insertAdjacentHTML('afterbegin', '<span class="th">⟦plane⟧</span>'); if (!st.airplane) r.querySelectorAll('.th').forEach(x => x.remove()); });
        const home = screen.querySelector('.gr');
        const d = today(), mo = d.getMonth() + 1, day = d.getDate();
        if (home && !calm() && !home.querySelector('.gy')) {
            let season = '';
            if (mo === 12 || (mo === 1 && day <= 6)) season = `<div class="gy aih" aria-hidden="true">${Array.from({length: 14}, (_, k) => `<i style="left:${(k * 37) % 100}%;animation-duration:${6 + (k % 5)}s;animation-delay:-${(k * 1.3) % 7}s;font-size:${8 + (k % 4) * 3}px">❄</i>`).join('')}</div>`;
            if (mo === 10 && day >= 24) season = '<div class="gy qx" aria-hidden="true"><span class="aal">🎃</span><span class="aji">🦇</span></div>';
            if (mo === 2 && day === 14) season = `<div class="gy ack" aria-hidden="true">${Array.from({length: 8}, (_, k) => `<i style="left:${k * 12 + 3}%;animation-delay:-${k * 0.9}s">💕</i>`).join('')}</div>`;
            if (season) home.insertAdjacentHTML('afterbegin', season);
        }
    }

    // Long-press: on an app makes the icons wiggle (like a real home screen); on the wallpaper changes it.
    function phAttach(screen, getP) {
        let timer = 0;
        screen.addEventListener('pointerdown', e => {
            const home = e.target.closest('.gr');
            if (!home || e.target.closest('[data-hold], .lo, .vs, .vr')) return;
            const onApp = e.target.closest('.jg');
            timer = setTimeout(() => {
                screen._swallow = true;
                if (onApp) {
                    home.classList.add('ug');
                    if (!home.querySelector('.sg')) home.insertAdjacentHTML('beforeend', '<button type="button" class="sg" data-fun="ph-jiggle-done">Done</button>');
                } else {
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'خلفية جديدة');
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
        const f = el.closest && el.closest('.lo');
        switch (what) {
            case 'ph-close': { const x = screen.querySelector('.lo'); if (!x) return; if (calm()) x.remove(); else { x.classList.add('abc'); setTimeout(() => x.remove(), 200); } return; }
            case 'ph-phone': return phDialer(screen, p);
            case 'ph-key': return phDialer(screen, p, (f.dataset.typed + el.dataset.k).slice(0, 20));
            case 'ph-del': return phDialer(screen, p, f.dataset.typed.slice(0, -1));
            case 'ph-call': {
                const n = f.dataset.typed, egg = DIAL_EGGS[n.replace(/\s/g, '')];
                const msg = f.querySelector('.vt');
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"عند الإشارة الثالثة، سيكون الوقت ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} و${t.getSeconds()} ثانية… بيب، بيب، بيب." (الساعة الناطقة القديمة!)`; return; }
                msg.textContent = egg || (n ? 'هذا الهاتف التدريبي لا يستطيع إجراء مكالمات حقيقية. جرّب 123 أو 1471 أو *#06#…' : 'اكتب رقمًا أولًا.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'يرجى إرسال بياناتك المصرفية للمطالبة بجائزتك!!! (إنه احتيال. احظر هذا الرقم.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'شكرًا لك، تم تأكيد موعدك. 🦷'});
                return phMessages(screen, p, t);
            }
            case 'ph-camera': return phCamera(screen, p);
            case 'ph-shutter': {
                st.photos.push(!!st.selfie);
                const fl = document.createElement('div'); fl.className = 'acz'; f.appendChild(fl); setTimeout(() => fl.remove(), 300);
                const th = f.querySelector('.wz'); th.textContent = st.selfie ? '🙂' : '🌅';
                return;
            }
            case 'ph-flip': st.selfie = !st.selfie; return phCamera(screen, p);
            case 'ph-photos': case 'ph-photos-open': return phPhotos(screen, p);
            case 'ph-photo': return phPhotos(screen, p, +el.dataset.n);
            case 'ph-mail': return phOpen(screen, p, 'البريد', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'ابدأ'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'إيقاف'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'ابدأ'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ ضع واقي الشمس! إنها عمليًا Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ المصباح يعمل. (تتوهج الشاشة بدلًا من الضوء في الخلف.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ وضع الطيران مفعّل: لا مكالمات ولا رسائل نصية ولا بيانات هاتف.' : 'وضع الطيران متوقف.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'تغيرت الخلفية. اذهب إلى الشاشة الرئيسية لتراها!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ أصبحت الآن مطوّرًا! (سر حقيقي في Android: اضغط على رقم الإصدار 7 مرات.)' : st.build >= 3 ? `أنت الآن على بعد ${7 - st.build} خطوات من أن تصبح مطوّرًا.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>شكرًا لك على التدرب!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'لا تحتاج إلى تطبيق مصباح: فهو مدمج في الإعدادات السريعة لهاتفك. تطبيقات المصابيح المجانية كثيرًا ما تكون مليئة بالإعلانات، أو أسوأ!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'للعرض فقط في المتجر التدريبي.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'جارٍ التثبيت…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'فتح'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'تطبيق', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>هذا التطبيق التدريبي جزء من درس خاص به. تصفّح الدورات التعليمية لتجربته بشكل صحيح.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ وجدت سرًا!');
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
        const pageLang = (document.documentElement.lang || 'en').toLowerCase(), short = pageLang.split('-')[0];
        const all = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(short));
        const gb = all.filter(v => short === 'en' ? v.lang === 'en-GB' : true);
        const pool = gb.length ? gb : all;
        const female = /female|hazel|susan|libby|sonia|maisie|kate|serena|zira|jenny|aria|martha|emma|amy/i;
        const male = /\bmale\b|george|ryan|daniel|thomas|oliver|arthur|guy|david|mark|james|brian/i;
        const v = sp.who === 'f' ? pool.find(x => female.test(x.name)) : pool.find(x => male.test(x.name) && !female.test(x.name));
        const u = new SpeechSynthesisUtterance(sp.text);
        u.lang = short === 'en' ? 'en-GB' : pageLang;
        if (v || pool[0]) u.voice = v || pool[0];
        u.rate = sp.who === 'robot' ? 1.02 : 0.97;
        u.pitch = sp.who === 'robot' ? 0.35 : !v && sp.who === 'f' ? 1.25 : !v && sp.who === 'm' ? 0.8 : 1;
        speechSynthesis.speak(u);
    }
    window.addEventListener('pagehide', simHush);

    function trainerCall(p, call, phase, line) {
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'انتهت المكالمة' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'مجهول' ? 'المتصل' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'مجهول', number: '0161 496 0423', who: 'm', tag: 'ليس في جهات اتصالك',
         intro: 'هاتفك يرنّ. الرقم غير محفوظ في جهات اتصالك. <strong>ردّ عليه</strong> للتدرب. <em>ارفع الصوت لتسمع المتصل.</em>',
         lines: [
            {text: 'مرحبًا، أنا Mark من فريق الاحتيال في مصرفك. لاحظنا بعض المدفوعات المشبوهة في حسابك. قبل أن أتابع، هل يمكنك تأكيد اسمك الكامل وتاريخ ميلادك والرقم الطويل على بطاقتك المصرفية؟',
             q: 'يقول المتصل إنه من مصرفك. ماذا تفعل؟', options: [
                {t: 'أعطه البيانات، فهو من المصرف', why: 'المصرف الذي يتصل بك لن يطلب منك رقم بطاقتك الكامل أبدًا. هكذا يحصل المحتالون على بياناتك.'},
                {t: 'قل إنك ستعاود الاتصال بمصرفك على الرقم الموجود على بطاقتك، وأنهِ المكالمة', ok: true, why: 'تمامًا. اتصل بالرقم الموجود على بطاقتك، من هاتف مختلف إن استطعت، أو اتصل بالرقم 159.'},
                {t: 'اطلب منه أن يثبت من هو', why: 'المحتالون يبدون مقنعين وكثيرًا ما يعرفون بعض بياناتك أصلًا. أأمن شيء أن تنهي المكالمة وتتصل بمصرفك بنفسك.'}]},
            {text: 'من فضلك لا تنهِ المكالمة! مجرمون يسحبون المال من حسابك الآن. عليك نقل كل شيء إلى حساب آمن سأنشئه لك. علينا أن نفعل ذلك خلال عشر دقائق.',
             q: 'يقول إن الأمر عاجل وإن عليك نقل أموالك. ماذا الآن؟', options: [
                {t: 'انقل المال بسرعة، قبل فوات الأوان', why: 'لا يوجد شيء اسمه "حساب آمن". مصرفك لن يطلب منك نقل المال أبدًا. هذا هو الاحتيال.'},
                {t: 'أنهِ المكالمة. المصرف الحقيقي لا يطلب منك أبدًا نقل المال إلى "حساب آمن"', ok: true, why: 'نعم. الاستعجال و"الحساب الآمن" هما ما يكشفان الاحتيال. أنهِ المكالمة واتصل بالرقم 159.'}]}],
         hang: 'أنهِ المكالمة بالزر الأحمر.'},
        {letter: '?', color: '#64748b', name: 'مجهول', number: '020 7946 0815', who: 'robot', tag: 'ليس في جهات اتصالك',
         intro: 'مكالمة أخرى. <strong>ردّ عليها.</strong>',
         lines: [
            {text: 'هذه رسالة آلية من H M R C. صدرت مذكرة اعتقال بحقك بسبب ضريبة غير مدفوعة. للتحدث إلى موظف، اضغط 1 الآن.',
             q: 'صوت مسجّل يقول إنك ستُعتقل بسبب الضرائب. ماذا تفعل؟', options: [
                {t: 'اضغط 1 لتسوية الأمر', why: 'الضغط على 1 يوصلك بالمحتالين، الذين سيطالبون بالدفع، غالبًا ببطاقات هدايا. HMRC لا تهدد بالاعتقال برسالة مسجّلة أبدًا.'},
                {t: 'أنهِ المكالمة. HMRC لا تتصل بتهديدات اعتقال', ok: true, why: 'صحيح. HMRC تراسلك كتابةً أولًا، ولا تهدد بالاعتقال هاتفيًا أبدًا.'}]}],
         hang: 'أنهِ المكالمة.'},
        {letter: '?', color: '#64748b', name: 'مجهول', number: '0113 496 0332', who: 'm', tag: 'ليس في جهات اتصالك',
         intro: 'هاتفك مرة أخرى. <strong>ردّ عليه.</strong>',
         lines: [
            {text: 'مرحبًا، أتصل من قسم Windows التقني. حاسوبك يرسل إلينا رسائل خطأ، وفيه فيروس خطير جدًا. من فضلك اذهب وشغّل حاسوبك، وسأساعدك في إصلاحه.',
             q: 'يقول إن حاسوبك فيه فيروس. ماذا تفعل؟', options: [
                {t: 'شغّل الحاسوب واتبع تعليماته', why: 'سيطلب منك تثبيت برنامج يتيح له التحكم في حاسوبك، ثم يطلب مالًا. Microsoft لا تتصل هكذا أبدًا.'},
                {t: 'أنهِ المكالمة. شركات الحواسيب لا تتصل بخصوص الفيروسات', ok: true, why: 'تمامًا. لا تدع متصلًا يدخل إلى حاسوبك أبدًا.'},
                {t: 'اشرح له أنه ليس لديك حاسوب', why: 'لا حاجة إلى الشرح أو الجدال. فقط أنهِ المكالمة.'}]}],
         hang: 'أنهِ المكالمة.'},
        {letter: '?', color: '#64748b', name: 'مجهول', number: '0808 157 0190', who: 'f', tag: 'ليس في جهات اتصالك',
         intro: 'مكالمة أخرى. <strong>ردّ عليها.</strong>',
         lines: [
            {text: 'مرحبًا. تم تقديم طلب لشراء iPhone جديد، بتسعمئة وتسعة وتسعين جنيهًا، على حساب التسوق الخاص بك عبر الإنترنت. إذا لم تقدم هذا الطلب، فاضغط 1 لإلغائه والتحدث إلى فريقنا.',
             q: 'لم تطلب iPhone. ماذا تفعل؟', options: [
                {t: 'اضغط 1 لإلغاء الطلب', why: 'الضغط على 1 يوصلك بمحتال، سيعرض أن "يعيد لك المال" بطلب بياناتك المصرفية أو التحكم في حاسوبك.'},
                {t: 'أنهِ المكالمة، ثم تحقق من حسابك بنفسك في التطبيق أو على الموقع', ok: true, why: 'نعم. لو كان هناك طلب فعلًا، لرأيته في حسابك. لا تستخدم أبدًا رقمًا أو زرًا يعطيك إياه متصل.'}]}],
         hang: 'أنهِ المكالمة.'},
        {letter: 'S', color: '#16a34a', name: 'عيادة الطبيب', number: '01632 960211', who: 'f', tag: 'محفوظ في جهات اتصالك',
         intro: 'مكالمة أخيرة: هذه المرة من عيادة الطبيب، المحفوظة في جهات اتصالك. <strong>ردّ عليها.</strong>',
         lines: [
            {text: 'مرحبًا، أنا Sue من العيادة. مجرد تذكير سريع بأن لقاح الإنفلونزا محجوز لك يوم الثلاثاء الساعة العاشرة. لا يلزمك فعل أي شيء. وإذا أردت تغييره، فاتصل بنا على الرقم المعتاد. إلى اللقاء!',
             q: 'هل هذه المكالمة احتيال؟', options: [
                {t: 'نعم: أنهِ المكالمة واحظر الرقم', why: 'هذه سليمة! لم تطلب شيئًا، ولم تستعجلك، وطلبت منك استخدام الرقم المعتاد.'},
                {t: 'على الأرجح حقيقية: لم تطلب مالًا أو بيانات، وقالت أن تتصل بالرقم المعتاد', ok: true, why: 'تمامًا. المكالمات الحقيقية لا تضغط عليك. وإذا شككت يومًا، فاتصل بالرقم الذي لديك أصلًا.'}]}],
         hang: 'انتهت المكالمة. <strong>اضغط على الزر الأحمر</strong> لإنهائها.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>المكالمة ${n + 1} من ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'في الواقع، لا بأس ألّا تردّ على أرقام لا تعرفها! في هذا التدريب، اضغط على الزر الأخضر للرد.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'أي من هذه علامة على مكالمة احتيال؟', options: [
            {t: 'أن تُستعجَل أو تُهدَّد أو يُطلب منك إبقاء الأمر سرًا', ok: true, why: 'نعم. الضغط هو أكبر ما يكشف الاحتيال. المتصل الحقيقي لا يمانع أن تأخذ وقتك وتعاود الاتصال.'},
            {t: 'أن يعرف المتصل اسمك', why: 'المحتالون كثيرًا ما يعرفون اسمك، وحتى بعض بيانات حسابك. وهذا وحده لا يجعل المكالمة حقيقية.'},
            {t: 'أن يبدو الرقم محليًا', why: 'يستطيع المحتالون إظهار أي رقم على شاشتك، حتى رقمًا محليًا أو رقم مصرفك. لا تثق بالرقم.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>أحسنت!</strong> أنهيت المكالمة مع أربعة محتالين وتعرفت على المكالمة الحقيقية. تذكّر: إذا شككت، فأنهِ المكالمة، واتصل بالرقم الذي تثق به. ولمصرفك، اتصل بالرقم 159.'},
    ], {});
    SCENARIOS['scam-calls'].voice = true;

    function start(root) {
        const name = root.dataset.sim;
        const build = SCENARIOS[name];
        if (!build) return;
        watchIcons(root);
        const doneKey = 'sim-done:' + name;
        // Practice computers (Windows, Mac, Linux) use the same engine as the practice phone.
        const isPC = !!build.device;
        const OSES = build.oses || (isPC ? ['windows', 'mac', 'linux'] : ['ios', 'android']);
        const storeKey = isPC ? 'sim-os' : 'sim-platform';
        if (isPC) root.classList.add('agi');
        let platform = null, steps = [], i = 0, misses = 0, ctx = {};
        try { platform = localStorage.getItem(storeKey); } catch (e) {}
        const CHOICES = {
            ios: ['iPhone', 'من إنتاج Apple'], android: ['أندرويد (Android)', 'Samsung وGoogle Pixel وMotorola وغيرها'],
            windows: ['Windows', 'معظم الحواسيب المحمولة والمكتبية'], mac: ['Mac', 'من إنتاج Apple: MacBook وiMac'], linux: ['Linux', 'Linux Mint وUbuntu وغيرها'],
        };
        const notSure = isPC
            ? 'انظر إلى شاشتك. في Windows زر ابدأ (أربعة مربعات صغيرة) في الأسفل. وفي Mac شعار Apple في أعلى اليسار. وفي Linux Mint زر القائمة في أسفل اليسار.'
            : 'في iPhone شعار Apple (تفاحة مقضومة) على الظهر. وإن لم يكن على هاتفك، فهو بالتأكيد هاتف Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>أي ${isPC ? 'كمبيوتر تستخدمه' : 'هاتف لديك'}؟</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>لست متأكدًا؟</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>أرني أين</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ استمع مرة أخرى</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">خطوة للخلف</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>بدّل ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">${isPC ? 'كمبيوتر' : 'هاتف'} تجريبي: غير حقيقي. لا يُرسل أي شيء تفعله هنا إلى أي مكان.</p>
                    <div class="dr"><div class="dd"></div></div>
                </div>
            </div>`;
        const choose = root.querySelector('.ix');
        const stage = root.querySelector('.lr');
        const phone = root.querySelector('.dr');
        const screen = root.querySelector('.dd');
        const count = root.querySelector('.xg');
        const say = root.querySelector('.vx');
        const question = root.querySelector('.kl');
        const hint = root.querySelector('.nf');
        const showBtn = root.querySelector('.afg');
        // Talking practices (the scam call trainer): "Hear it again" and a voice on/off switch.
        const hearBtn = root.querySelector('.yz'), voiceBtn = root.querySelector('.sim-voice');
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'أوقف الصوت' : 'شغّل الصوت'; };
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
            phone.className = 'dr ' + (isPC ? 'ng ' : '') + p;
            render(false);
        }

        // When someone wanders off into the practice apps, "Show me where" becomes "Back to the lesson".
        let wandering = false;
        function wander(el) {
            if (el && /^(close|menu-close|max|ph-close|ph-cc-close|ph-jiggle-done)$/.test(el.dataset.fun || '')) return;
            wandering = true;
            showBtn.hidden = false;
            showBtn.textContent = 'العودة إلى الدرس';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'أرني أين';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'انتهيت!' : `الخطوة ${i + 1} من ${steps.length - 1}`;
            say.innerHTML = step.say || (step.question ? '' : '');
            question.innerHTML = '';
            root.querySelector('.yy').hidden = i === 0;
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
                    const wrapEl = root.querySelector('.iy');
                    const top = wrapEl.getBoundingClientRect().top + window.scrollY - root.querySelector('.io').offsetHeight - 8;
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
            question.innerHTML = `<div class="db jm">${qs.options.map((o, n) =>
                `<button type="button" data-n="${n}">${o.t}</button>`).join('')}</div><div class="ed" hidden></div>`;
            const buttons = [...question.querySelectorAll('button')];
            buttons.forEach(b => b.addEventListener('click', () => {
                const o = qs.options[b.dataset.n];
                const explain = question.querySelector('.ed');
                explain.hidden = false;
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'صحيح!' : 'ليس تمامًا.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">تابع</button>');
                    explain.querySelector('.aff').addEventListener('click', () => { i += 1; render(); });
                } else {
                    b.classList.add('st');
                    b.disabled = true;
                }
            }));
        }

        function finish() {
            try { localStorage.setItem(doneKey, '1'); } catch (e) {}
            // Next to "Try it again", a way on to the next lesson. It uses the page's own "Done, next lesson"
            // button, so the lesson is still ticked off in their progress.
            const pageNext = document.querySelector('article.lesson .bl');
            const last = pageNext && pageNext.getAttribute('href').includes('#course-done');
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">جرّب مرة أخرى</button>${pageNext
                ? `<button type="button" class="ap vb">عمل جيد! ${last ? 'الآن أنهِ الدورة' : 'لمَ لا تجرب الدرس التالي'} &rarr;</button>` : ''}</div>`;
            question.querySelector('.adl').addEventListener('click', () => begin(platform));
            if (pageNext) question.querySelector('.vb').addEventListener('click', () => pageNext.click());
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
                hint.textContent = (step.hints && step.hints[id]) || ('ليس تمامًا. ' + (step.hint || 'ألقِ نظرة أخرى على التعليمات.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'ليس بعد. ألقِ نظرة أخرى على التعليمات.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('ليس تمامًا. ' + (step.hint || 'ألقِ نظرة أخرى على التعليمات.'));
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
                hold.classList.add('rq');
                holdTimer = setTimeout(() => { held = true; hold.classList.remove('rq'); handleTap(holdId, false); }, 700);
            }
            swipeArea = e.target.closest('[data-swipe]');
            startX = e.clientX;
            startY = e.clientY;
        });
        const cancelHold = () => {
            clearTimeout(holdTimer);
            screen.querySelectorAll('.rq').forEach(b => b.classList.remove('rq'));
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
            if (!rc && isPC && e.target.closest('.kw') && !e.target.closest('.ev, .hc')) {
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
                const appEl = e.target.closest('.jg[data-tap]');
                if (appEl && !isStep(appEl) && !(step && step.hints && step.hints[appEl.dataset.tap])) {
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'تطبيق';
                    phFun(screen, platform, {dataset: {fun: PH_FROM_TAP[appEl.dataset.tap] || 'ph-generic', label}, querySelector: q => appEl.querySelector(q), closest: () => null});
                    wander(appEl);
                    return;
                }
                // The status bar opens quick settings (tap the clock 5 times for a surprise).
                if (e.target.closest('.fl') && !e.target.closest('.vs')) {
                    phFun(screen, platform, {dataset: {fun: 'ph-status'}, closest: () => null});
                    wander(null);
                    return;
                }
            }
            const eggEl = isPC && e.target.closest('[data-egg], [data-egg-act]');
            if (eggEl) {
                if (eggEl.disabled) return;
                const quick = lastPointer !== 'mouse' || e.detail === 0;
                const dock = eggEl.dataset.egg && eggEl.classList.contains('fa');
                const how = (eggEl.dataset.egg || eggEl.dataset.eggAct === 'item') ? (quick || dock ? 'open' : 'select') : 'act';
                pcEgg(screen, platform, eggEl, how);
                return;
            }
            if (isPC) {
                // Close the desktop menu or calendar when clicking anywhere else.
                if (!e.target.closest('.ll')) screen.querySelectorAll('.ll').forEach(m => m.remove());
                if (!e.target.closest('.mk, [data-fun="clock"]')) screen.querySelectorAll('.mk').forEach(m => m.remove());
                const step = steps[i];
                const isStep = el => el && el.dataset.tap && step && !step.question && !step.done
                    && (step.target === el.dataset.tap || (step.sequence || []).includes(el.dataset.tap) || !!(step.alias && step.alias[el.dataset.tap]));
                let funEl = e.target.closest('[data-fun]');
                // The "Connecting to Wi-Fi" lesson has its own Wi-Fi panel: while it's open, the Wi-Fi symbol stays part of the lesson.
                if (funEl && funEl.dataset.fun === 'wifi' && screen.querySelector('.adz:not(.fun-wifi)')) funEl = null;
                if (funEl && !isStep(funEl)) { pcFun(screen, platform, funEl, e); wander(funEl); return; }
                // Taskbar, Dock, Start menu and other app buttons: open the practice app, unless the lesson has a tip for that click.
                const tapEl = e.target.closest('[data-tap]');
                if (tapEl && !funEl && FUN_FROM_TAP[tapEl.dataset.tap] && !isStep(tapEl) && !(tapEl.dataset.tap === 'tray-wifi' && screen.querySelector('.adz:not(.fun-wifi)')) && !(step && step.hints && step.hints[tapEl.dataset.tap])) {
                    if (pcApp(screen, platform, FUN_FROM_TAP[tapEl.dataset.tap], tapEl)) { wander(tapEl); return; }
                }
            }
            const rc = e.target.closest('[data-rclick]');
            if (rc && !e.target.closest('[data-tap]')) {
                if (held) { held = false; return; }
                if (e.detail === 0) handleTap(rc.dataset.rclick, true);
                else hint.textContent = 'انقر بالزر الأيمن عليه: اضغط زر الفأرة الأيمن. على لوحة لمس Mac، انقر بإصبعين. على شاشة اللمس، اضغط مطولًا.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'أبقِ إصبعك (أو زر الفأرة) مضغوطًا عليه حتى يحدث شيء.';
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
                showBtn.textContent = 'أرني أين';
                if (screen._redraw) screen._redraw();
            }
            const step = steps[i];
            const want = step.sequence ? step.sequence[ctx.pos] : step.target;
            const target = screen.querySelector(`[data-tap="${want}"], [data-hold="${want}"], [data-rclick="${want}"], [data-hover="${want}"]`);
            if (!target) return;
            target.classList.add('afe');
            target.focus();
        });
        root.querySelector('.yy').addEventListener('click', () => {
            if (i === 0) return;
            i -= 1;
            while (i > 0 && (steps[i].wait)) i -= 1;  // don't land on a "waiting" screen
            render();
        });
        root.querySelector('.abm').addEventListener('click', () => {
            stage.hidden = true;
            choose.hidden = false;
        });
        choose.querySelectorAll('[data-platform]').forEach(b => b.addEventListener('click', () => begin(b.dataset.platform)));

        // Narrow screens: the instructions are pinned above the phone, so shrink the phone a little (never
        // below 80%, to keep it readable) so more of it fits underneath them.
        const wrap = root.querySelector('.iy');
        const panel = root.querySelector('.io');
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

    document.querySelectorAll('.dc[data-sim]').forEach(start);
    // For the poster app's local review page (/sim-review), which shows every screen side by side.
    window.PracticePhone = {scenarios: SCENARIOS, start, watchIcons};
})();
