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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play Магазин'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Телефон', '#22c55e', ICON.phone], ['messages', 'Съобщения', '#22c55e', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Снимки', '#e5e7eb', ICON.photos], ['mail', 'Поща', '#3b82f6', ICON.mail], ['clock', 'Часовник', '#111827', ICON.clock],
               ['weather', 'Времето', '#38bdf8', ICON.weather], ['maps', 'Карти', '#22c55e', ICON.map], ['settings', 'Настройки', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Телефон', '#2563eb', ICON.phone], ['messages', 'Съобщения', '#3b82f6', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Снимки', '#e5e7eb', ICON.photos], ['clock', 'Часовник', '#111827', ICON.clock], ['maps', 'Карти', '#16a34a', ICON.map],
               ['settings', 'Настройки', '#475569', ICON.settings], ['weather', 'Времето', '#38bdf8', ICON.weather], ['mail', 'Имейл', '#ef4444', ICON.mail],
               ['store', 'Play Магазин', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Плъзнете надолу от горния десен ъгъл ⟦chevron-down⟧' : 'Плъзнете надолу от горния край ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Днес</div>
                <div class="hp"><span>ПРЕПОРЪЧАНО</span><strong>Приложения, които харесваме тази седмица</strong></div>
                <div class="hp alt"><span>НАЧАЛО</span><strong>Идеи за новия ви iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Днес</button><button type="button" data-tap="games">Игри</button>
                    <button type="button" data-tap="apps">Приложения</button><button type="button" data-tap="search-tab">${ICON.search}Търсене</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Търсене на приложения &amp; игри</span></button>
            <div class="tg"><span class="on">За вас</span><span>Топ класации</span><span>Деца</span></div>
            <div class="hp"><span>ПРЕПОРЪЧАНО ЗА ВАС</span><strong>Приложения за начало</strong></div>
            <div class="hp alt"><span>ПОПУЛЯРНИ</span><strong>Поддържайте връзка</strong></div>
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
        const btnLabel = p === 'ios' ? 'Вземи' : 'Инсталирай';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 млрд.+ изтегляния' : 'Социални мрежи'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Безплатно</span></div></div>
                <p class="agm">На истинския ви iPhone може да се наложи да натиснете два пъти страничния бутон, да погледнете екрана за Face ID или да въведете паролата на профила си в Apple тук.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Инсталирай</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Отказ</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Добре дошли в WhatsApp</h3>
            <p>Прочетете нашата <u>Политика за поверителност</u>. Докоснете „Приемам и продължавам“, за да приемете <u>Условията за ползване</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Приемам и продължавам</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Въведете телефонния си номер</h3>
            <p>WhatsApp трябва да провери телефонния ви номер. Може да се начислят такси от оператора.</p>
            <div class="abt">Обединено кралство <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Напред</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Това верният номер ли е?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Редактиране</button><button type="button" data-tap="yes">${ios ? 'Да' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>СЪОБЩЕНИЯ · сега</strong><span>Вашият код за WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Не споделяйте този код с други.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Проверка на номера ви</h3>
            <p>Изчакване за автоматично откриване на 6-цифрен код, изпратен по SMS на <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Не получихте код?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['„WhatsApp“ иска достъп до контактите ви', 'За да виждате кои от приятелите ви ползват WhatsApp.', 'Разрешавате ли на WhatsApp достъп до контактите ви?']
            : ['„WhatsApp“ иска да ви изпраща известия', 'За да знаете кога пристига ново съобщение.', 'Разрешавате ли на WhatsApp да ви изпраща известия?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Информация за профила</h3>
            <p>Моля, въведете името си и добавете профилна снимка, ако искате.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Вашето име</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Напред</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Чатове' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Всичко е готово${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Чатовете ви ще се появят тук. Докоснете бутона за нов чат, за да пишете на някого от контактите си.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Това е началният екран на телефона ви. Приложенията се изтеглят от <strong>${store}</strong>. Безплатно е и е безопасното място за приложения. <strong>Докоснете ${store}.</strong>`,
                 hint: `Потърсете иконата на ${store}. ${p === 'ios' ? "Синя е с бяла буква A." : "Цветен триъгълник е."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Сега трябва да потърсите WhatsApp. <strong>Докоснете Търсене</strong> долу вдясно.' : 'Сега трябва да потърсите WhatsApp. <strong>Докоснете полето за търсене</strong> най-горе.',
                 hint: p === 'ios' ? 'Търсенето е лупата долу вдясно.' : 'В полето за търсене пише „Търсене на приложения и игри“.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Вече написахме <em>whatsapp</em> вместо вас. Появява се списък с предложения. <strong>Докоснете „whatsapp messenger“.</strong>",
                 hint: 'Докоснете предложението „whatsapp messenger“.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Внимавайте: някои приложения се представят за WhatsApp. Истинското се казва <strong>WhatsApp Messenger</strong>, от <strong>WhatsApp Inc.</strong>, и е безплатно. <strong>Докоснете ${p === 'ios' ? 'Вземи' : 'Инсталирай'} до истинското.</strong>`,
                 hints: {'fake1-get': 'Това е „WhatsUp Chat Free“ от Fun Apps Ltd. Фалшив двойник е, а етикетът „Реклама“ значи, че е реклама. Проверете името и кой го е направил.',
                         'fake2-get': 'Това е „WA Messenger for Chat Pro“ от LuckyDev Studio, имитация. Истинското е от WhatsApp Inc.'},
                 hint: 'Намерете „WhatsApp Messenger“ от „WhatsApp Inc.“'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'iPhone проверява дали наистина сте вие, преди да инсталира. На истински iPhone може да ползвате <strong>Face ID</strong>, <strong>пръстовия си отпечатък</strong> (Touch ID) или <strong>паролата на профила си в Apple</strong>. Тук просто <strong>докоснете Инсталирай.</strong>',
                    hints: {'sheet-cancel': 'Отказ би спрял изтеглянето. Докоснете Инсталирай.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Изтегля се. Когато приключи, бутонът се променя на <strong>Отвори</strong>. <strong>Докоснете Отвори.</strong>`,
                 hint: 'Изчакайте бутонът да покаже Отвори, после го докоснете.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp се отваря за първи път. Иска да се съгласите с условията му. <strong>Докоснете „Приемам и продължавам“.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp ползва мобилния ви номер, за да могат приятелите ви да ви намерят. <strong>Докоснете полето за телефонен номер</strong> и ние ще попълним примерен номер.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `На истински телефон бихте въвели собствения си мобилен номер. Тук ползвахме измислен: <strong>07700 900123</strong>. <strong>Докоснете Напред.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp проверява дали сте го въвели правилно. Този е верен, затова <strong>докоснете ${p === 'ios' ? 'Да' : 'OK'}.</strong>`,
                 hints: {edit: `Бихте докоснали Редактиране, ако сте сбъркали. Този номер е верен, затова докоснете ${p === 'ios' ? 'Да' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp изпраща SMS с 6-цифрен код, за да провери, че номерът е ваш. iPhone предлага да го попълни вместо вас. <strong>Докоснете кода над клавиатурата.</strong>'
                    : 'WhatsApp изпраща SMS с 6-цифрен код, за да провери, че номерът е ваш. Много Android телефони го попълват сами. Ако вашият не го прави, <strong>докоснете съобщението</strong> най-горе.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Докато настройвате, приятел ви пише: <em>„Здрасти! Изпратих ти по погрешка 6-цифрен код, можеш ли да ми го върнеш?“</em> Какво правите?',
                    options: [
                        {t: 'Изпращам го, той ми е приятел', why: 'Това е честа измама. Някой е превзел профила на приятеля ви и този код би му дал достъп и до вашия.'},
                        {t: 'Не го изпращам. Никой не бива да го иска', ok: true, why: 'Точно така. Този код е ключът към вашия WhatsApp. Никога не го споделяйте с никого, дори с приятел или с човек, който твърди, че е от WhatsApp.'},
                        {t: 'Изпращам само първите 3 цифри', why: 'Дори част от кода помага на измамника. Никога не споделяйте нищо от него.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp иска да вижда контактите ви, за да ви показва кои приятели ползват WhatsApp. <strong>Докоснете Разрешаване.</strong>',
                 hints: {deny: 'Можете да изберете да не разрешавате, но тогава WhatsApp не може да показва имената на приятелите ви. За това упражнение докоснете Разрешаване.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Известията ви казват кога пристига съобщение, дори когато WhatsApp е затворен. <strong>Докоснете Разрешаване.</strong>',
                 hints: {deny: 'Без известия няма да знаете кога някой ви пише. Докоснете Разрешаване за това упражнение.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Последна стъпка: името ви е това, което виждат приятелите ви. <strong>Въведете малкото си име в полето</strong>, после <strong>докоснете Напред</strong>. (Остава на тази страница и не се изпраща никъде.)',
                 hints: {photo: 'В истинското приложение можете да изберете снимка сега или да добавите по-късно в Настройки. Засега ще я пропуснем: въведете името си и докоснете Напред.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Браво, настроихте WhatsApp!</strong> Чатовете ви ще се появят тук. В следващите уроци ще изпратите първото си съобщение.'},
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
            const lockName = ctx.touch ? 'Touch ID и код' : 'Face ID и код';
            const groups = [
                [['airplane', 'Самолетен режим', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Мобилни данни', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Известия', '#ef4444', '⟦bell⟧'], ['sounds', 'Звуци и тактилни усещания', '#ec4899', '⟦volume-2⟧'], ['focus', 'Фокус', '#6366f1', '⟦moon⟧']],
                [['general', 'Общи', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Достъпност', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence и Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Екран и яркост', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'SOS при спешност', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Поверителност и сигурност', '#3b82f6', '⟦hand⟧'], ['battery', 'Батерия', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Приложения', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Профил в Apple, iCloud и други</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Мрежа и интернет', 'Мобилни данни, Wi-Fi, точка за достъп'], ['devices', 'Свързани устройства', 'Bluetooth, сдвояване'],
            ['apps', 'Приложения', 'Скорошни приложения, приложения по подразбиране'], ['notifications', 'Известия', 'История на известията'], ['battery', 'Батерия', '85%'], ['storage', 'Хранилище', '91% used'],
            ['sound', 'Звук и вибрация', 'Сила на звука, вибрации'], ['display', 'Екран и докосване', 'Тъмна тема, размер на шрифта'],
            ['accessibility', 'Достъпност', 'Екран, взаимодействие, звук'], ['security', 'Сигурност и поверителност', 'Сигурност на приложенията, заключване на устройството, разрешения'],
            ['location', 'Местоположение', 'Вкл.'], ['safety', 'Безопасност и спешни случаи', 'SOS при спешност, медицинска информация, сигнали'],
            ['google', 'Google', 'Услуги и предпочитания'], ['system', 'Система', 'Езици, час, обновления на софтуера']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID и код' : 'Face ID и код';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Пръст 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Нулиране на Face ID</span></div><div class="cj ex"><span>Настройване на алтернативен външен вид</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Изключване на кода</span></div><div class="cj ex"><span>Промяна на кода</span></div>'
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

    const androidSecurity = () => androidList('Сигурност и поверителност', [
        ['device-unlock', 'Отключване на устройството', 'Заключване на екрана, отключване с лице и отпечатък'], ['app-security', 'Сигурност на приложенията', 'Сканиране на приложения за вредно поведение'],
        ['theft', 'Защита от кражба', 'Заключете телефона си, ако бъде откраднат'], ['privacy', 'Поверителност', 'Разрешения, активност в профила']]);
    const androidDeviceUnlock = ctx => androidList('Отключване на устройството', [
        ['screen-lock', 'Заключване на екрана', ctx.passcodeSet ? 'ПИН' : 'Няма'], ['face-finger', 'Отключване с лице и отпечатък', ctx.faceDone || ctx.fingerDone ? 'Настройване' : 'Настройте за по-бързо отключване']]);
    const androidFaceFinger = ctx => androidList('Отключване с лице и отпечатък', [
        ['face-unlock', 'Отключване с лице', ctx.faceDone ? 'Лицето е добавено' : 'Настройване'], ['fingerprint-unlock', 'Отключване с отпечатък', ctx.fingerDone ? '1 fingerprint' : 'Настройване']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Първото сканиране на Face ID приключи.' : 'Face ID вече е настроен.') : 'Лицето е добавено';
        const btn = p === 'ios' ? (first ? 'Продължи' : 'Готово') : 'Готово';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Движете бавно главата си, за да завършите кръга.' : 'Дръжте лицето си в кръга и бавно движете главата си.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Завършено' : 'Променете хвата си') : (stage === 'grip' ? 'Променете хвата си' : 'Поставете пръста си'))
            : (ready ? 'Отпечатъкът е добавен' : 'Докоснете сензора');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Вече можете да ползвате отпечатъка си за отключване на iPhone.' : 'Сега поставете страните на върха на пръста си върху бутона Начало.')
                     : (stage === 'grip' ? 'Отпуснете страните на върха на пръста си върху бутона Начало.' : 'Многократно повдигайте и отпускайте пръста си върху бутона Начало.'))
            : (ready ? 'Вече можете да ползвате отпечатъка си за отключване на телефона.' : 'Докоснете сензора, вдигнете пръста и го докоснете отново, докато отпечатъкът се запълни.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Продължи' : 'Готово'}</button>` : sensor}
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
                 say: 'Кодът, Face ID и Touch ID са в приложението <strong>Настройки</strong>. <strong>Докоснете Настройки</strong> (сивото зъбно колело).',
                 hint: 'Настройки е сивата икона със зъбно колело.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Превъртете списъка надолу, ако е нужно, и <strong>докоснете ${ctx.touch ? 'Touch ID и код' : 'Face ID и код'}</strong>.`,
                 hint: `Потърсете „${ctx.touch ? 'Touch ID и код' : 'Face ID и код'}“ под Екран и яркост.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Заключването на екрана, отключването с лице и отпечатъците са в приложението <strong>Настройки</strong>. <strong>Докоснете Настройки</strong> (зъбното колело).',
             hint: 'Настройки е иконата със зъбно колело.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Превъртете надолу, ако е нужно, и <strong>докоснете Сигурност и поверителност</strong>. <em>При Samsung се казва Сигурност и поверителност, после Биометрични данни или Заключен екран.</em>',
             hint: 'Потърсете „Сигурност и поверителност“ близо до края на списъка.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Докоснете Отключване на устройството.</strong>',
             hint: 'Това е първата опция, „Отключване на устройството“.'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Въведете код' : 'Въведете ПИН кода си', p === 'ios' ? '' : 'За да продължите, въведете ПИН кода си'),
        sequence: CODE_KEYS,
        say: `${extraSay}Първо телефонът проверява дали сте вие. <strong>Въведете тренировъчния код: ${codeText}</strong>. <em>Никога не въвеждайте истинския си код в уебсайт.</em>`,
        hint: `Въведете тренировъчния код ${codeText}, цифра по цифра.`,
    });

    const safestQuestion = {
        q: 'Кой от тези би бил <strong>най-безопасният</strong> код?',
        options: [
            {t: '123456', why: '123456 е най-често ползваният код, затова е един от първите, които крадецът би опитал.'},
            {t: 'Рождената ви дата, например 140352', why: 'Рождените дати лесно се научават от социалните мрежи, картички или писма. Избягвайте дати, които означават нещо.'},
            {t: 'Шест цифри, които не говорят нищо на никой друг', ok: true, why: 'Точно така. Случайните цифри, които не са дата, подредба или повторение, са най-трудни за отгатване.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Този телефон още няма код, така че всеки може да го отвори. <strong>Докоснете Включване на кода.</strong>',
                 hints: {stolen: 'Защитата на откраднато устройство е в урок 4. Първо включете кода.'}},
                {screen: c => codeScreen(p, c, 'Задаване на код', 'Въведете код', '<p class="aeh">Опции за кода</p>'), sequence: CODE_KEYS,
                 say: `Изберете 6 цифри, които ще запомните. За това упражнение <strong>въведете ${codeText}</strong>. <em>Моля, не въвеждайте тук истинския си код.</em>`,
                 hint: `Въведете ${codeText}, цифра по цифра.`},
                {screen: c => codeScreen(p, c, 'Задаване на код', 'Въведете новия код отново'), sequence: CODE_KEYS,
                 say: `iPhone пита отново, за да се увери, че не сте сбъркали. <strong>Въведете ${codeText} отново.</strong>`,
                 hint: `Въведете ${codeText} отново.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Браво, тренировъчният ви телефон вече има код!</strong> На истински iPhone на този етап може да ви поискат и паролата на профила ви в Apple.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Заключване на екрана е <strong>Няма</strong>, така че всеки може да отвори този телефон. <strong>Докоснете Заключване на екрана.</strong>'},
            {screen: () => androidList('Изберете заключване на екрана', [['none', 'Няма'], ['swipe', 'Плъзгане'], ['pattern', 'Фигура'], ['pin', 'ПИН'], ['password', 'Парола']]),
             target: 'pin', say: 'Има няколко възможности. <strong>ПИН</strong> (цифри) е лесен и сигурен. <strong>Докоснете ПИН.</strong>',
             hints: {none: '„Няма“ значи, че всеки може да отвори телефона ви.', swipe: 'Плъзгането просто отваря телефона и не пази нищо.',
                     pattern: 'Фигурите могат да се отгатнат по следите, които пръстът оставя по екрана. ПИН е по-безопасен.',
                     password: 'Паролата също върши работа, но ПИН се въвежда по-бързо всеки ден. Докоснете ПИН за това упражнение.'}},
            {screen: c => codeScreen(p, c, 'Изберете ПИН', 'ПИН трябва да е поне 4 цифри'), sequence: CODE_KEYS,
             say: `6 цифри са по-безопасни от 4. За това упражнение <strong>въведете ${codeText}</strong>. <em>Моля, не въвеждайте тук истинския си ПИН.</em>`,
             hint: `Въведете ${codeText}, цифра по цифра.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Изберете ПИН', 'ПИН трябва да е поне 4 цифри', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Докоснете Напред.</strong>'},
            {screen: c => codeScreen(p, c, 'Въведете ПИН кода отново', ''), sequence: CODE_KEYS,
             say: `Телефонът пита отново, за да се увери, че не сте сбъркали. <strong>Въведете ${codeText} отново.</strong>`, hint: `Въведете ${codeText} отново.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Въведете ПИН кода отново', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Докоснете Потвърждаване.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Известия на заключения екран', [['show-all', 'Показване на цялото съдържание на известията'], ['hide-sensitive', 'Скриване на поверително съдържание'], ['dont-show', 'Без показване на известия']], false),
             target: 'hide-sensitive',
             say: 'Телефонът пита какво да се показва от съобщенията на заключения екран. <strong>Скриване на поверително съдържание</strong> е добър избор: ще виждате, че е дошло съобщение, но не и какво пише в него. <strong>Докоснете го.</strong>',
             hints: {'show-all': 'Това показва всичко, включително кодове от банката ви, на всеки, който вземе телефона ви. Докоснете „Скриване на поверително съдържание“.',
                     'dont-show': 'Така също става, но няма да виждате кога пристигат съобщения. За това упражнение докоснете „Скриване на поверително съдържание“.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Браво, тренировъчният ви телефон вече има ПИН код!</strong> Заключване на екрана вече е ПИН.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Докоснете Настройване на Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Как да настроите Face ID</strong>
                    <p>Първо поставете лицето си в рамката на камерата. После движете главата си в кръг, за да се видят всички страни на лицето ви.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Начало</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Дръжте телефона пред лицето си, на една ръка разстояние, като за селфи. <strong>Докоснете Начало.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'На истински iPhone сега <strong>бавно движите главата си в кръг</strong>, сякаш рисувате кръг с носа си. Пръстенът се запълва по време на сканирането. Когато приключи, <strong>докоснете Продължи</strong>.',
                 hint: 'Изчакайте кръгът да се запълни, после докоснете Продължи.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Сканира втори път, за да е сигурно. Движете главата си в кръг отново. Когато приключи, <strong>докоснете Готово</strong>.',
                 hint: 'Изчакайте кръгът да се запълни, после докоснете Готово.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Приятел ви моли да добавите <em>неговото</em> лице в телефона ви, „за всеки случай“. Какво правите?',
                    options: [
                        {t: 'Позволявам, удобно е', why: 'Всеки, чието лице е добавено, може да отваря телефона ви и да одобрява плащания в приложенията ви. Добавяйте само собственото си лице.'},
                        {t: 'Казвам не. Само моето лице трябва да отключва телефона ми', ok: true, why: 'Точно така. Ако човек, на когото вярвате, трябва да влезе, споделете кода си с него и после го сменете, ако е нужно.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Браво, Face ID е настроен!</strong> Вече можете да отключвате телефона само като го погледнете, после плъзнете нагоре.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Докоснете Отключване с лице и отпечатък.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Докоснете Отключване с лице.</strong>',
             hints: {'fingerprint-unlock': 'Това са пръстовите отпечатъци, те са в урок 3. Засега докоснете Отключване с лице.'}},
            {screen: () => consent(p, 'Отключване с лице', 'Ползвайте лицето си, за да отключвате телефона и да потвърждавате, че сте вие, в приложенията. Лицето ви се пази само в този телефон.', 'Съгласен съм'),
             target: 'agree', say: 'Телефонът обяснява как ползва лицето ви. <strong>Докоснете Съгласен съм.</strong>',
             hints: {cancel: 'Отказ би спрял настройването. Докоснете Съгласен съм, за да продължите.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Дръжте телефона на нивото на очите, на една ръка разстояние. На истински телефон <strong>държите лицето си в кръга и бавно движите главата си</strong>. Когато приключи, <strong>докоснете Готово</strong>.',
             hint: 'Изчакайте кръгът да се запълни, после докоснете Готово.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'При много Android телефони отключването с лице е по-слабо защитено от пръстовия отпечатък. Какво значи това за вас?',
                options: [
                    {t: 'Става за всичко', why: 'При много телефони отключването с лице ползва обикновена камера, която по-лесно може да бъде заблудена. Заради това някои банкови приложения не го приемат.'},
                    {t: 'Ползвам го за отключване, а за банкиране пръстов отпечатък или ПИН, ако банката поиска', ok: true, why: 'Правилно. Телефонът ще ви каже дали отключването с лице може да се ползва за плащания и банкиране. Ако не може, ползвайте пръстовия отпечатък или ПИН кода.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Браво, отключването с лице е настроено!</strong> Вече можете да отключвате телефона само като го погледнете.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Докоснете Добавяне на отпечатък…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID ползва <strong>бутона Начало</strong> отпред на по-старите iPhone, като iPhone SE. <strong>Докоснете бутона Начало най-долу на тренировъчния телефон 6 пъти</strong>, сякаш повдигате и отпускате пръста си.',
                 hint: 'Докоснете кръглия бутон Начало най-долу на тренировъчния телефон.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Сега са му нужни страните на върха на пръста ви. <strong>Докоснете Продължи.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'На истински iPhone отпускате <strong>страните и върха</strong> на пръста си върху бутона. <strong>Докоснете бутона Начало още 4 пъти.</strong>',
                 hint: 'Докоснете кръглия бутон Начало най-долу.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Готово. <strong>Докоснете Продължи.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Кой пръст е най-добре да добавите първи?',
                    options: [
                        {t: 'Палецът или пръстът, с който най-често държите телефона', ok: true, why: 'Да. За бутон Начало това обикновено е палецът. Можете да добавите до 5 пръста, така че си струва да добавите и двата палеца.'},
                        {t: 'Който и да е пръст, няма значение', why: 'Работи с всеки пръст, но изберете този, който естествено пада върху бутона, когато вземете телефона, обикновено палецът.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Браво, отпечатъкът ви е настроен!</strong> Поставете пръста си върху бутона Начало, за да отключите. Можете да добавите още пръсти по същия начин.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Докоснете Отключване с лице и отпечатък.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Докоснете Отключване с отпечатък.</strong>',
             hints: {'face-unlock': 'Това е отключването с лице от урок 2. Засега докоснете Отключване с отпечатък.'}},
            {screen: () => consent(p, 'Отключване с отпечатък', 'Ползвайте пръстовия си отпечатък, за да отключвате телефона или да потвърждавате, че сте вие, например при влизане в приложения. Отпечатъкът ви се пази само в този телефон.', 'Съгласен съм'),
             target: 'agree', say: '<strong>Докоснете Съгласен съм.</strong>', hints: {cancel: 'Отказ би спрял настройването. Докоснете Съгласен съм, за да продължите.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Сензорът може да е на екрана, на гърба на телефона или на бутона за захранване, а телефонът ви показва къде. Тук е на екрана. <strong>Докоснете сензора 6 пъти</strong>, сякаш повдигате и отпускате пръста си.',
             hint: 'Докоснете кръглия сензор близо до долния край на екрана.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Отпечатъкът ви е записан. <strong>Докоснете Готово.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Кой пръст е най-добре да добавите първи?',
                options: [
                    {t: 'Пръстът, който естествено докосва сензора, когато вземете телефона', ok: true, why: 'Да. При сензор на гърба това обикновено е показалецът, а при сензор на екрана или отстрани палецът. Можете да добавите повече от един.'},
                    {t: 'Който и да е пръст, няма значение', why: 'Работи всеки пръст, но изберете този, който естествено попада върху сензора. Така отключването е бързо и лесно.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Браво, отпечатъкът ви е настроен!</strong> Докоснете сензора, за да отключите. Можете да добавите още пръсти по същия начин.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Слънчогледи в градината', '#fde68a'], ['🐶', 'Кучето на дивана', '#fecaca'], ['🏖️', 'Ден на плажа', '#bae6fd'],
                    ['🎂', 'Рождена торта', '#fbcfe8'], ['🌅', 'Залез над морето', '#fed7aa'], ['🐈', 'Заспалата котка', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Прочетено' : state === 'sent' ? 'Изпратено' : 'Доставено'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Здравей, мамо, аз съм! Нов номер, старият телефон се счупи…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Семейство', last: 'Dave: Кой носи тортата? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Ще се видим в четвъртък!', time: 'Вчера', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Здравей, мамо! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Нов чат' : 'Избор на контакт'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Семейство', '#f59e0b', 'Dave, Jean, Sarah, Вие'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Добавяне (плюс)' : 'Прикачване (кламер)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Този номер не е в контактите ви.</p><div><button type="button" data-tap="block">Блокиране</button><button type="button" data-tap="add-contact">Добавяне</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Снимки' : 'Галерия'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Блокиране на +44 7700 900842?</strong></p><p class="fd">Блокираните контакти не могат да ви звънят или да ви пишат.</p>
                <p class="fd">⟦square-check⟧ Докладване на WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Отказ</button><button type="button" data-tap="confirm-block">Блокиране</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Скорошни' : 'Галерия'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Звъни се…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Включване на звука' : 'Заглушаване'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Заглушен за 1 седмица' : 'Изкл.'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Заглушаване на известията за…</strong></p>
                <button type="button" data-tap="mute-8h">8 часа</button><button type="button" data-tap="mute-week">1 седмица</button><button type="button" data-tap="mute-always">Винаги</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Настройки', [['account', 'Профил', 'Известия за сигурност, смяна на номера'], ['privacy', 'Поверителност', 'Блокиране на контакти, изчезващи съобщения'],
                ['chats', 'Чатове', 'Тема, тапети'], ['notifications', 'Известия', 'Мелодии за съобщения, групи и обаждания']]],
            account: ['Профил', [['twostep', 'Потвърждаване в две стъпки', ctx.twoStep ? 'Вкл.' : 'Изкл.'], ['change-number', 'Смяна на номера', ''], ['delete-account', 'Изтриване на профила', '']]],
            privacy: ['Поверителност', [['last-seen', 'Последно видян и онлайн', 'Всички'], ['profile-photo', 'Профилна снимка', 'Всички'],
                ['groups', 'Групи', ctx.groupsSetting || 'Всички'], ['blocked', 'Блокирани контакти', ctx.blocked ? '1' : 'Няма']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Кой може да ме добавя в групи</strong></p>
                <button type="button" data-tap="groups-everyone">Всички</button><button type="button" data-tap="groups-contacts">Моите контакти</button>
                <button type="button" data-tap="groups-except">Моите контакти освен…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Потвърждаване в две стъпки</h3><p>За допълнителна сигурност включете потвърждаването в две стъпки, което ще изисква ПИН код, когато отново регистрирате телефонния си номер в WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Включване</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Добавете имейл адрес</h3>
                <p>Добавете имейл адрес, за да можете да нулирате ПИН кода, ако го забравите.</p>
                <div class="tk ex">вашият имейл адрес</div>
                <button type="button" class="ce ox" data-tap="email-next">Напред</button>
                <button type="button" class="cp wd" data-tap="skip">Пропускане</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Потвърждаването в две стъпки е включено</h3><p>Ще ви поискат ПИН кода, ако настроите WhatsApp на нов телефон.</p>
                <button type="button" class="ce ox" data-tap="done">Готово</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Създайте 6-цифрен ПИН' : 'Потвърдете ПИН кода си'}</strong>
            <p>${stage === 'pin' ? 'Ще ви трябва, за да настроите WhatsApp на нов телефон.' : 'Въведете същия ПИН отново.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Това е списъкът ви с чатове. За да започнете нов, <strong>докоснете бутона за нов чат</strong> (молива горе вдясно).'
                          : 'Това е списъкът ви с чатове. За да започнете нов, <strong>докоснете зеления бутон +</strong> долу вдясно.',
         hints: {'chat-family': 'Това отваря съществуващ чат. Започнете нов.', 'chat-jean': 'Това отваря съществуващ чат. Започнете нов.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp показва хората от контактите ви, които го ползват. <strong>Докоснете Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Първо напишете съобщение в полето, после докоснете стрелката за изпращане.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Здравей, мамо! 😊 Радвам се да те чуя!', n: 2}); },
         say: '<strong>Докоснете полето за съобщение</strong> най-долу, <strong>напишете кратко съобщение</strong> (например „Здравей!“), после <strong>докоснете стрелката за изпращане</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Микрофонът е за гласови съобщения, които идват по-нататък. Първо напишете съобщение и докоснете стрелката за изпращане.', attach: 'Това е за снимки, които идват по-нататък. Първо напишете съобщение и докоснете изпращане.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah е отговорила! Под съобщението ви има <strong>две сини отметки ⟦check-check⟧</strong>. Какво значат?',
            options: [
                {t: 'Съобщението не е изпратено', why: 'Неизпратено съобщение показва малък часовник или червено предупреждение. Отметките значат, че е успяло.'},
                {t: 'Sarah го е прочела', ok: true, why: 'Да! Една сива отметка значи изпратено, две сиви значат доставено на телефона ѝ, а две сини значат, че го е прочела.'},
                {t: 'Изпратено е два пъти', why: 'Не, изпратено е само веднъж. Две сини отметки значат, че е прочетено.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Сега изпратете снимка. <strong>Докоснете ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> до полето за съобщение.`,
         hints: {camera: 'Камерата прави нова снимка. За да изпратите вече направена, докоснете ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Докоснете ${p === 'ios' ? 'Снимки' : 'Галерия'}</strong>, за да изберете от снимките в телефона си.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Това са (примерните) снимки в телефона ви. <strong>Докоснете слънчогледите</strong> 🌻.',
         hint: 'Докоснете снимката със слънчогледите.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Прекрасно! 🌻 От градината ти ли са?', n: 4}); },
         say: 'Можете да напишете надпис, ако искате. После <strong>докоснете стрелката за изпращане</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Гласовите съобщения са удобни, когато писането е трудно. На истински телефон <strong>натискате и държите микрофона</strong> ⟦mic⟧, докато говорите, после го пускате, за да изпратите. Тук <strong>докоснете микрофона веднъж, за да започнете, после докоснете стрелката за изпращане</strong>.',
         hint: 'Докоснете микрофона, после стрелката за изпращане.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Браво!</strong> Изпратихте съобщение, снимка и гласово съобщение. За да отговорите на Sarah по всяко време, отворете WhatsApp и докоснете нейния чат.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Докоснете чата със Sarah,</strong> за да го отворите.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Най-горе в чата има два бутона за обаждане: <strong>видеокамерата</strong> за видеообаждане и <strong>телефонът</strong> за гласово обаждане. <strong>Докоснете видеокамерата</strong> ⟦video⟧.',
         hints: {voice: 'Това прави гласово обаждане, без видео. За това упражнение докоснете видеокамерата.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Звъни на телефона на Sarah и когато тя вдигне, се виждате. Ако при вас е шумно, <strong>докоснете микрофона</strong> ⟦mic⟧, за да заглушите себе си.',
         hint: 'Бутонът на микрофона е в реда най-долу.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Заглушени сте: Sarah ви вижда, но не ви чува. За да ѝ покажете нещо, <strong>докоснете бутона за обръщане</strong> ⟦switch-camera⟧, за да превключите на камерата на гърба на телефона.',
         hints: {mute: 'По-късно докоснете микрофона отново, за да включите звука. Сега опитайте бутона за обръщане.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Сега Sarah вижда към какво насочвате телефона. Когато приключите, <strong>докоснете червения бутон</strong>, за да прекратите обаждането.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Видеообажданията ползват много данни. Кой е най-добрият начин да направите такова?',
            options: [
                {t: 'През Wi-Fi вкъщи, когато може', ok: true, why: 'Да. През Wi-Fi обажданията не харчат мобилния ви пакет, така че са безплатни, колкото и дълго да говорите.'},
                {t: 'Няма значение', why: 'При мобилни данни дълго видеообаждане може бързо да изразходва пакета ви. Wi-Fi е най-добре, когато може.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Сега за групите. Групата „Семейство“ има много нови съобщения и известията не спират да бръмчат. <strong>Докоснете групата „Семейство“.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'За да промените настройките на групата, <strong>докоснете името ѝ</strong> най-горе.', hint: 'Докоснете думата „Семейство“ най-горе на екрана.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Докоснете Заглушаване на известията.</strong> Пак ще получавате съобщенията, но телефонът няма да бръмчи за всяко.',
         hints: {'exit-group': '„Напускане на групата“ би я напуснало напълно. Заглушаването е по-меко: оставате в групата, но без бръмчене.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Изберете за колко време. <strong>Докоснете 1 седмица.</strong>',
         hints: {'mute-8h': '8 часа също става. За това упражнение докоснете 1 седмица.', 'mute-always': '„Винаги“ също става, но може да изпуснете неща. За това упражнение докоснете 1 седмица.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Браво!</strong> Направихте видеообаждане, заглушихте себе си, обърнахте камерата и заглушихте оживена група. Можете да четете съобщенията на групата, когато поискате.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Здравейте!', ticks: 'read', n: 1}, {text: 'Здравей, мамо! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Неделен обяд у нас? 🍗', n: 1}, {from: 'Sarah', text: 'Да, моля!', n: 2}, {from: 'Dave', text: 'Кой носи тортата? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Собствените настройки на WhatsApp са вътре в приложението. <strong>Докоснете Настройки</strong> долу вдясно.',
                hints: {'chat-unknown': 'Със съобщението ще се заемем по-късно. Първо докоснете Настройки долу вдясно.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Собствените настройки на WhatsApp са вътре в приложението. <strong>Докоснете трите точки ⋮</strong> горе вдясно.',
                hints: {'chat-unknown': 'Със съобщението ще се заемем по-късно. Първо докоснете трите точки горе вдясно.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Докоснете Настройки.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Докоснете Профил.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Потвърждаването в две стъпки</strong> добавя ПИН код, който е нужен, ако някой се опита да настрои вашия WhatsApp на друг телефон. Дори измамник да получи 6-цифрения ви код, няма да може да влезе. <strong>Докоснете Потвърждаване в две стъпки.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Докоснете Включване.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Изберете 6-цифрен ПИН, различен от кода на телефона ви. За това упражнение <strong>въведете ${pinText}</strong>. <em>Не въвеждайте тук истински ПИН.</em>`,
             hint: `Въведете тренировъчния ПИН ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Въведете ${pinText} отново</strong>, за да го потвърдите.`, hint: `Въведете ${pinText} отново.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Ако добавите имейл адреса си, можете да нулирате ПИН кода, ако го забравите. Струва си да го направите на истинския си телефон. Тук <strong>докоснете Напред</strong>.',
             hints: {skip: 'Можете да го пропуснете, но ако забравите ПИН кода, може да не можете да влезете. За това упражнение докоснете Напред.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Потвърждаването в две стъпки е включено. <strong>Докоснете Готово.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Съобщение твърди, че е от <em>„Поддръжка на WhatsApp“</em> и иска двустъпковия ви ПИН, за да „потвърди профила ви“. Какво правите?',
                options: [
                    {t: 'Изпращам го, от WhatsApp е', why: 'WhatsApp никога няма да ви пише с молба за ПИН или код. Това е измамник, който се опитва да превземе профила ви.'},
                    {t: 'Не отговарям, блокирам и докладвам', ok: true, why: 'Точно така. Никой, включително WhatsApp, не бива да иска ПИН или 6-цифрения код.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'След това не позволявайте на непознати да ви добавят в групи. Това е в <strong>Поверителност</strong>. <strong>Докоснете Групи.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Моите контакти'; },
             say: '„Всички“ значи, че всеки непознат може да ви добави в група, което измамниците ползват. <strong>Докоснете Моите контакти.</strong>',
             hints: {'groups-everyone': '„Всички“ позволява на непознати да ви добавят в групи, включително измамни. Докоснете Моите контакти.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Пристигнало е съобщение от непознат номер: „Здравей, мамо, аз съм! Нов номер…“. Това е измамата „Здравей, мамо“. <strong>Докоснете го, за да го отворите.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Здравей, мамо, аз съм! Нов номер, старият телефон се счупи. Можеш ли да ми помогнеш да платя една сметка? Утре ще ти върна парите x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Не отговаряйте. WhatsApp забелязва, че номерът не е в контактите ви. <strong>Докоснете Блокиране.</strong>',
             hints: {'add-contact': 'Не добавяйте измамник в контактите си. Докоснете Блокиране.', video: 'Не им звъняйте обратно. Докоснете Блокиране.', voice: 'Не им звъняйте обратно. Докоснете Блокиране.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Здравей, мамо, аз съм! Нов номер, старият телефон се счупи. Можеш ли да ми помогнеш да платя една сметка? Утре ще ти върна парите x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '„Докладване на WhatsApp“ е отметнато, което помага на WhatsApp да спре измамника. <strong>Докоснете Блокиране.</strong>',
             hints: {cancel: 'Отказ би им позволил да продължат да ви пишат. Докоснете Блокиране.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Браво!</strong> Включихте потвърждаването в две стъпки, не позволихте на непознати да ви добавят в групи и блокирахте и докладвахте измамник. Ако някога не сте сигурни за съобщение от близък, обадете му се на номера, който вече имате.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Назад') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Назад')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Приложенията, които поддържат Dynamic Type, ще се нагодят към предпочитания от вас размер за четене.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Размер на текста', [], {top: slider, back: 'Екран'});
        return list(p, 'Размер на екрана и текста', [{caption: 'Размер на шрифта'}, {id: 'bold', label: 'Удебелен текст', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Размерът на текста е в приложението <strong>Настройки</strong>. <strong>Докоснете Настройки.</strong>', hint: 'Настройки е сивата икона със зъбно колело.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Докоснете Екран и яркост.</strong>', hint: 'Намира се в третата група, под Достъпност.'},
        {screen: c => list(p, 'Екран и яркост', [{caption: 'ВЪНШЕН ВИД'}, {label: 'Светъл', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Размер на текста'}, {id: 'bold', label: 'Удебелен текст', toggle: !!c.bold}], {back: 'Настройки'}),
         target: 'text-size', say: '<strong>Докоснете Размер на текста.</strong>', hints: {bold: 'Удебеленият текст идва след това. Първо докоснете Размер на текста.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Плъзнете плъзгача надясно, за да направите буквите по-големи. Тук <strong>докоснете голямото A два пъти</strong> и гледайте как текстът расте.', hint: 'Докоснете голямото A вдясно от плъзгача.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Много по-лесно се чете! Сега <strong>докоснете ‹ Екран</strong> най-горе, за да се върнете.'},
        {screen: c => list(p, 'Екран и яркост', [{caption: 'ВЪНШЕН ВИД'}, {label: 'Светъл', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Размер на текста'}, {id: 'bold', label: 'Удебелен текст', toggle: !!c.bold}], {back: 'Настройки'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Удебеленият текст</strong> прави буквите по-дебели и по-ясни. <strong>Докоснете го, за да го включите.</strong>'},
        {screen: c => list(p, 'Екран и яркост', [{caption: 'ТЕКСТ'}, {label: 'Размер на текста'}, {label: 'Удебелен текст', toggle: true}], {back: 'Настройки'}),
         question: {q: 'Текстът още е твърде малък, дори при най-голямата настройка?', options: [
            {t: 'Нищо повече не може да се направи', why: 'Има още! Настройки > Достъпност > Екран и размер на текста > По-голям текст дава още по-големи размери.'},
            {t: 'Настройки > Достъпност > Екран и размер на текста > По-голям текст', ok: true, why: 'Да. Включете там „По-големи размери за достъпност“ за наистина голям текст.'}]}},
        {screen: c => list(p, 'Екран и яркост', [{caption: 'ТЕКСТ'}, {label: 'Размер на текста'}, {label: 'Удебелен текст', toggle: true}], {back: 'Настройки'}), done: true,
         say: '<strong>Браво!</strong> Текстът ви е по-голям и по-плътен, в Настройки и в повечето приложения.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Размерът на текста е в приложението <strong>Настройки</strong>. <strong>Докоснете Настройки.</strong>', hint: 'Настройки е иконата със зъбно колело.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Докоснете Екран и докосване.</strong> <em>При Samsung е Екран, после Размер и стил на шрифта.</em>'},
        {screen: () => list(p, 'Екран и докосване', [{id: 'dark', label: 'Тъмна тема', toggle: false}, {id: 'text-size', label: 'Размер на екрана и текста', sub: 'Размер на шрифта, удебелен текст'}, {id: 'brightness', label: 'Ниво на яркост', value: '70%'}]),
         target: 'text-size', say: '<strong>Докоснете Размер на екрана и текста.</strong>', hints: {dark: 'Тъмната тема променя цветовете, не размера. Докоснете Размер на екрана и текста.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Плъзнете плъзгача за размер на шрифта надясно, за да направите буквите по-големи. Тук <strong>докоснете голямото A два пъти</strong>.', hint: 'Докоснете голямото A вдясно от плъзгача.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Удебеленият текст</strong> прави буквите по-ясни. <strong>Докоснете го, за да го включите.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Текстът още е твърде малък, дори при най-голямата настройка?', options: [
            {t: 'Нищо повече не може да се направи', why: 'Опитайте и Размер на екрана на същата страница: той уголемява всичко, включително бутоните и иконите.'},
            {t: 'Направете и размера на екрана по-голям', ok: true, why: 'Да. Размерът на екрана уголемява всичко на екрана, не само текста.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Браво!</strong> Текстът ви е по-голям и по-плътен, в Настройки и в повечето приложения.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' на лилав фон' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Не безпокойте' : 'Фокус'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Не безпокойте · Вкл.' : 'Не безпокойте · Изкл.'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Плъзнете нагоре, за да затворите' : 'Затвори'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Ако телефонът ви не звъни, може да е включено „Не безпокойте“. Бързите настройки са в <strong>Контролния център</strong>: <strong>плъзнете надолу от горния десен ъгъл</strong> (или докоснете лентата най-горе).'
                          : 'Ако телефонът ви не звъни, може да е включено „Не безпокойте“. <strong>Плъзнете надолу от горния край на екрана</strong>, за да видите бързите настройки (или докоснете лентата най-горе).',
         hints: {'pull-up': 'Плъзнете в другата посока: надолу от горния край.', 'pull-left': 'Плъзнете надолу, не настрани.', 'pull-right': 'Плъзнете надолу, не настрани.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Луната ⟦moon⟧ означава, че <strong>„Не безпокойте“ е включено</strong>, така че обажданията и съобщенията са заглушени. <strong>Докоснете я, за да го изключите.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Сега усилете звука с <strong>бутона за звука отстрани на телефона</strong> (горния). <strong>Докоснете ＋ на ръба на тренировъчния телефон 3 пъти.</strong>',
         hint: 'Докоснете бутона ＋ на десния ръб на телефона.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'iPhone все още не звъни. Какво друго може да е?', options: [
                {t: 'Превключвателят Звънене/Тих режим или бутонът Действие е на тих режим', ok: true, why: 'Да. Много iPhone имат малко превключвателче над бутоните за звука: ако се вижда оранжево, телефонът е на тих режим. По-новите ползват бутона Действие.'},
                {t: 'Телефонът е развален', why: 'Обикновено не! Първо проверете превключвателя за тих режим над бутоните за звука.'}]}
            : {q: 'Натиснахте бутона за звука, но той промени само силата на звука на медията. Какво да направите?', options: [
                {t: 'Докосвам иконата ⋯ или настройки на лентата за звука, за да видя силата на звънене', ok: true, why: 'Да. Бутоните за звука често променят силата на медията; докоснете трите точки на лентата за звука, за да промените силата на звънене.'},
                {t: 'Отказвам се', why: 'Докоснете трите точки ⋯ на появилата се лента за звука и усилете звъненето.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Браво!</strong> „Не безпокойте“ е изключено и звукът е усилен, така че ще чувате обажданията и съобщенията.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>ПАРАЦЕТАМОЛ 500 mg</strong><br>Приемайте по 1-2 таблетки на всеки 4-6 часа.<br>Не приемайте повече от 8 таблетки за 24 часа.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Лупа', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'iPhone има приложение <strong>Лупа</strong>. Ако не е на началния екран, плъзнете надолу в средата на екрана и напишете „Лупа“. <strong>Докоснете Лупа.</strong>'
                          : 'Много Android телефони имат приложение <strong>Лупа</strong>. <em>При Samsung е в бързите настройки или в Достъпност.</em> <strong>Докоснете Лупа.</strong>',
         hint: 'Потърсете черната икона с лупа.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Насочете телефона към нещо малко, например този етикет на лекарство. <strong>Докоснете ＋ три пъти</strong>, за да увеличите (на истински телефон можете да плъзгате плъзгача).', hint: 'Докоснете ＋ вдясно от плъзгача.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'При слаба светлина помага фенерчето. <strong>Докоснете фенерчето</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Треперят ли ви ръцете? <strong>Докоснете големия кръгъл бутон</strong>, за да замразите картината и да четете, без да стоите неподвижно.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'За какво друго е удобна лупата?', options: [
            {t: 'За четене на менюта, ценови етикети и ситен шрифт в писма', ok: true, why: 'Да, и винаги е в джоба ви. Някои хора я държат в Контролния център или в бързите настройки за достъп с едно докосване.'},
            {t: 'За усилване на звука при разговори', why: 'Това са бутоните за звука. Лупата е за по-ясно виждане на дребни неща.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Браво!</strong> Вече можете да увеличавате ситния шрифт, да го осветявате и да замразявате картината.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Ще се видим на кафенцето в четвъртък' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Идваш ли в четвъртък? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Текстово съобщение</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Слушам… говорете</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Можете да говорите вместо да пишете. <strong>Отворете Съобщения.</strong>', hint: 'Съобщения е зеленото облаче за разговор.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean пита за четвъртък. <strong>Докоснете полето за съобщение</strong> най-долу.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Появява се клавиатурата. <strong>Докоснете микрофона</strong> ⟦mic⟧ на клавиатурата, после кажете съобщението си.', hint: 'Микрофонът е на клавиатурата, до интервала.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'На истински телефон сега бихте казали: <em>„Ще се видим на кафенцето в четвъртък“</em>. Думите се появяват, докато говорите. Проверете ги, после <strong>докоснете изпращане</strong> ⟦send-horizontal⟧.',
         hint: 'Изчакайте думите да се появят, после докоснете стрелката за изпращане.'},
        {screen: () => home(p), target: 'settings',
         say: 'Телефонът може и да <strong>чете на глас</strong> за вас. Нека го включим. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Докоснете Достъпност.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Достъпност', [{caption: 'ЗРЕНИЕ'}, {id: 'voiceover', label: 'VoiceOver', value: 'Изкл.'}, {id: 'zoom', label: 'Мащаб', value: 'Изкл.'}, {id: 'spoken', label: 'Изговаряно съдържание'}], {back: 'Настройки'})
            : list(p, 'Достъпност', [{id: 'select-speak', label: 'Избор за изговаряне', sub: 'Изкл.'}, {id: 'talkback', label: 'TalkBack', sub: 'Изкл.'}, {id: 'magnification', label: 'Увеличение'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Докоснете Изговаряно съдържание.</strong>' : '<strong>Докоснете Избор за изговаряне.</strong>',
         hints: {voiceover: 'VoiceOver променя начина, по който работи целият телефон, което може да обърка. Докоснете Изговаряно съдържание.', talkback: 'TalkBack променя начина, по който работи целият телефон, което може да обърка. Докоснете Избор за изговаряне.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Изговаряно съдържание', [{id: 'speak-selection', label: 'Изговаряне на избраното', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Изговаряне на екрана', toggle: !!c.speakScreen, sub: 'Плъзнете надолу с два пръста от горния край на екрана, за да го чуете прочетен на глас.'}], {back: 'Достъпност'})
            : list(p, 'Избор за изговаряне', [{id: 'speak-screen', label: 'Ползване на „Избор за изговаряне“', toggle: !!c.speakScreen, sub: 'Докоснете прекия път, после докоснете всичко на екрана, за да го чуете прочетено на глас.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Включете „Изговаряне на екрана“.</strong> После навсякъде в телефона плъзгането надолу от горния край с два пръста чете екрана на глас.' : '<strong>Включете „Ползване на Избор за изговаряне“.</strong> Появява се малък бутон за пряк път: докоснете го, после докоснете текст, за да го чуете.',
         hints: {'speak-selection': 'Това чете само думите, които маркирате. „Изговаряне на екрана“ е по-лесно: включете него.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Изговаряно съдържание', [{label: 'Изговаряне на избраното', toggle: false}, {label: 'Изговаряне на екрана', toggle: true}], {back: 'Достъпност'})
            : list(p, 'Избор за изговаряне', [{label: 'Ползване на „Избор за изговаряне“', toggle: true}]), done: true,
         say: '<strong>Браво!</strong> Вече можете да говорите вместо да пишете и телефонът да чете на глас вместо вас.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Много слухови апарати могат да се свържат с телефона ви, така че обажданията и музиката да идват направо в тях. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Докоснете Достъпност.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Достъпност', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слухови устройства'}, {id: 'live-captions', label: 'Субтитри на живо', value: c.captions ? 'Вкл.' : 'Изкл.'}, {id: 'subtitles', label: 'Субтитри'}], {back: 'Настройки'})
            : list(p, 'Достъпност', [{id: 'hearing-devices', label: 'Слухови апарати', sub: c.paired ? 'Свързани' : 'Няма връзка'}, {id: 'live-captions', label: 'Субтитри на живо', sub: c.captions ? 'Вкл.' : 'Изкл.'}, {id: 'sound-amp', label: 'Усилвател на звука'}]),
         target: 'hearing-devices', say: `<strong>Докоснете ${p === 'ios' ? 'Слухови устройства' : 'Слухови апарати'}.</strong> Първо сложете слуховите си апарати и затворете капачетата на батериите им, за да се рестартират, така че телефонът да ги намери.`,
         hints: {'live-captions': 'Субтитрите идват след това. Първо свържете слуховите апарати.'}},
        {screen: c => list(p, p === 'ios' ? 'Слухови устройства' : 'Слухови апарати', [{caption: p === 'ios' ? 'СЛУХОВИ УСТРОЙСТВА MFI' : 'Налични устройства'}, {id: 'aids', label: 'Слуховите апарати на Margaret', sub: 'Ляв и десен'}],
            {overlay: c.pairing ? dialog(p, 'Сдвояване със „Слуховите апарати на Margaret“?', 'Ще се ползват за обаждания и звук.', [['cancel', 'Отказ'], ['pair', 'Сдвояване']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Телефонът ги намира. <strong>Докоснете слуховите си апарати.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Слухови устройства' : 'Слухови апарати', [{id: 'aids', label: 'Слуховите апарати на Margaret', sub: 'Ляв и десен'}],
            {overlay: dialog(p, 'Сдвояване със „Слуховите апарати на Margaret“?', 'Ще се ползват за обаждания и звук.', [['cancel', 'Отказ'], ['pair', 'Сдвояване']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Докоснете Сдвояване.</strong> (При два слухови апарата телефонът може да попита два пъти, по веднъж за всеки.)'},
        {screen: c => list(p, p === 'ios' ? 'Слухови устройства' : 'Слухови апарати', [{label: 'Слуховите апарати на Margaret', sub: 'Свързано ⟦check⟧'}]), target: 'back',
         say: 'Свързано! Обажданията вече ще се чуват през слуховите ви апарати. <strong>Докоснете Назад.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Достъпност', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слухови устройства'}, {id: 'live-captions', label: 'Субтитри на живо', value: c.captions ? 'Вкл.' : 'Изкл.'}], {back: 'Настройки'})
            : list(p, 'Достъпност', [{id: 'hearing-devices', label: 'Слухови апарати', sub: 'Свързани'}, {id: 'live-captions', label: 'Субтитри на живо', sub: c.captions ? 'Вкл.' : 'Изкл.'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Субтитри на живо' : 'Субтитри на живо'}</strong> показва на екрана думите от всичко изговорено: видеоклипове, обаждания и гласови съобщения. <strong>Докоснете го, за да го включите.</strong>`},
        {screen: c => list(p, 'Достъпност', [{label: p === 'ios' ? 'Субтитри на живо' : 'Субтитри на живо', toggle: true}, {label: 'Слухови апарати', sub: 'Свързани'}]), done: true,
         say: '<strong>Браво!</strong> Слуховите ви апарати са свързани и изговорените думи вече се показват като субтитри.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Мравка', 'Язовец', 'Котка', 'Куче', 'Орел', 'Лисица', 'Коза', 'Таралеж', 'Ибис', 'Чавка', 'Земеродно рибарче', 'Агне', 'Къртица',
                     'Тритон', 'Видра', 'Тъпанар', 'Червеногушка', 'Тюлен', 'Жаба', 'Полевка', 'Орехче', 'Зебра'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Натиснете и задръжте цветето</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Копиране</span><span>Споделяне</span><span>Изтриване</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Зебра</h3><p>Зебрите имат черни и бели райета. Няма две зебри с еднакъв шарен модел.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Докосване</strong> значи леко да допирате екрана с един пръст и веднага да го отпускате, като при натискане на бутон. <strong>Докоснете звездата.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Натискане и задържане</strong> значи да държите пръста си върху нещо за секунда-две. Обикновено показва допълнителни възможности. <strong>Натиснете и задръжте цветето</strong>, докато нещо се случи. (С мишка задръжте бутона натиснат.)',
         hint: 'Дръжте пръста си върху цветето за секунда-две.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Появи се меню. Какво обикновено прави натискането и задържането?', options: [
            {t: 'Показва допълнителни възможности, като копиране, споделяне или изтриване', ok: true, why: 'Да. Натискането и задържането върху съобщения, снимки и приложения показва такива възможности.'},
            {t: 'Изтрива нещата веднага', why: 'Не, само показва меню с възможности. Нищо не се случва, докато не изберете някоя.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Плъзгане</strong> значи да прекарате пръста си по екрана, като при обръщане на страница. <strong>Плъзнете наляво по снимката два пъти</strong>, за да видите следващите. (С мишка щракнете, повлечете и пуснете.)',
         hint: 'Прекарайте пръста си отдясно наляво по снимката. Или ползвайте бутона „Не можете да плъзгате?“.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Превъртане</strong> значи да плъзгате пръста си нагоре по екрана, за да видите повече от списък, като този. <strong>Превъртете надолу и докоснете Зебра</strong>, най-долу. (С мишка ползвайте колелцето.)',
         hint: 'Плъзнете списъка нагоре с пръст, за да стигнете до Зебра най-долу.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'За да се върнете на предишната страница на iPhone, <strong>докоснете ‹ Назад</strong> горе вляво (или плъзнете навътре от левия край на екрана).' : 'За да се върнете на предишната страница на Android, <strong>докоснете стрелката назад ◁</strong> най-долу (или плъзнете навътре от левия или десния край на екрана).',
         hints: {'home-pill': 'Това ви връща чак на началния екран. Докоснете стрелката назад ◁.', 'home-bar': 'Това ви връща чак на началния екран. Докоснете ‹ Назад.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'За да отидете на началния екран от всяко място, <strong>плъзнете нагоре от лентата</strong> най-долу на екрана (или докоснете лентата тук). При по-стари iPhone с кръгъл бутон Начало: натиснете го.'
                          : 'За да отидете на началния екран от всяко място, <strong>докоснете кръга за начало ○</strong> най-долу (или плъзнете нагоре от долния край).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': '„Назад“ връща една страница. Докоснете кръга за начало ○, за да отидете на началния екран.'}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> Упражнихте докосване, натискане и задържане, плъзгане, превъртане, връщане назад и отиване на началния екран: движенията, които ще ползвате всеки ден.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Свързани', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Интернет', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'МРЕЖИ' : 'Налични мрежи'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Настройки',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Въведете паролата за „BT-Hub-7F2A“</strong></p>
                ${field('wifipass', 'Парола', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Присъединяване' : 'Свързване'}</button>
                <button type="button" class="cp" data-tap="cancel">Отказ</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wi-Fi вкъщи пести мобилните ви данни. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Докоснете Wi-Fi</strong>, близо до горния край.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Докоснете Мрежа и интернет.</strong> <em>При Samsung е Връзки, после Wi-Fi.</em>'},
               {screen: () => list(p, 'Мрежа и интернет', [{id: 'internet', label: 'Интернет', sub: 'Wi-Fi и мобилни данни'}, {id: 'sims', label: 'SIM карти'}, {id: 'hotspot', label: 'Точка за достъп и споделяне'}]),
                target: 'internet', say: '<strong>Докоснете Интернет.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Името и паролата на Wi-Fi обикновено са на стикер отзад на рутера ви (кутията със светлинките). Стикерът на този тренировъчен рутер гласи:<br><span class="ahd">Мрежа: <strong>BT-Hub-7F2A</strong><br>Парола: <strong>Green-Apple-42</strong></span><strong>Докоснете BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Това е Wi-Fi на съсед. Намерете името от стикера си: BT-Hub-7F2A.', 'net-sky-12345': 'Това е Wi-Fi на някой друг. Намерете името от стикера си: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Паролата трябва да съвпада със стикера точно, включително главните букви и тиретата: Green-Apple-42',
         say: 'Въведете паролата <strong>точно</strong> както е на стикера: <strong>Green-Apple-42</strong>. Главните букви са важни! После <strong>докоснете Присъединяване</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Свързахте се! Телефонът ви вече сам ще се присъединява към този Wi-Fi, когато сте вкъщи. Безопасно ли е да ползвате безплатен Wi-Fi в кафене?', options: [
            {t: 'Да, за разглеждане, но не банкирайте през него', ok: true, why: 'Точно така. Обществен Wi-Fi става за четене на новини или за проверка на автобус. За банкиране ползвайте мобилните си данни или Wi-Fi вкъщи.'},
            {t: 'Да, за всичко', why: 'Обществените Wi-Fi мрежи могат да се наблюдават от други. Става за разглеждане, но за банкиране ползвайте мобилните си данни или Wi-Fi вкъщи.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Браво!</strong> Свързани сте с Wi-Fi. Потърсете символа на Wi-Fi във вид на ветрило най-горе на екрана.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Нов контакт' : 'Създаване на контакт', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Малко име', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Мобилен номер', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Запазване'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Контакт', [
        {label: 'Мобилен', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Добавяне в любими' : (ctx.fav ? '⟦star⟧ Любим' : '⟦star⟧ Добавяне в любими')},
        {id: 'share', label: 'Споделяне на контакт'}], {back: 'Контакти'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Контакти', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Когато запазите нечий номер, можете да му звъните по име. На iPhone контактите са в приложението <strong>Телефон</strong>. <strong>Докоснете Телефон.</strong>' : '<strong>Докоснете Контакти.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Контакти', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Контакти', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Това е списъкът ви с контакти. <strong>Докоснете +</strong> горе вдясно, за да добавите някого.' : 'Това е списъкът ви с контакти. <strong>Докоснете бутона +</strong>, за да добавите някого.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Въведете малко име и тренировъчния номер 07700 900456, после докоснете ' + (p === 'ios' ? 'Готово.' : 'Запазване.'),
         say: `Въведете <strong>малкото име</strong> на човека (опитайте „Ann“) и номера му. За упражнението ползвайте <strong>07700 900456</strong>. После <strong>докоснете ${p === 'ios' ? 'Готово' : 'Запазване'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Запазено! Любимите са хората, на които звъните най-често, показани най-горе за звънене с едно докосване. <strong>Докоснете ' + (p === 'ios' ? 'Добавяне в любими' : 'звездата') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Кой контакт си струва да запазите с „ICE“ (При спешен случай) пред името?', options: [
            {t: 'Най-близкия ви роднина, например „ICE Sarah“', ok: true, why: 'Да. Лекарите от бърза помощ знаят да търсят ICE. Още по-добре е да добавите спешен контакт в Medical ID, което е в курса „Безопасен телефон“.'},
            {t: 'Банката ви', why: 'ICE е за човека, с когото да се свържат, ако нещо ви се случи, обикновено най-близкия ви роднина.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Браво!</strong> Запазихте контакт и го направихте любим.'},
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
    const recents = p => app(p, 'Скорошни', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Телефонът ви звъни: обажда се Jean. <strong>Докоснете зеления бутон, за да отговорите.</strong>' + (p === 'android' ? ' <em>При някои Android телефони вместо това плъзгате зеления бутон нагоре.</em>' : ' <em>Ако iPhone е заключен, вместо това плъзгате зеления бутон встрани.</em>'),
         hints: {decline: 'Червеният отхвърля обаждането. Докоснете зеления, за да отговорите.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Говорите! За да чувате по-добре или да говорите без ръце, <strong>докоснете високоговорителя</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Когато приключите, <strong>докоснете червения бутон</strong>, за да затворите.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'По-рано сте пропуснали обаждане от Dave. Пропуснатите обаждания се показват в <strong>червено</strong> в скорошните ви обаждания. <strong>Докоснете Dave</strong>, за да му звъннете обратно.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Звъни се на Dave. Когато приключите разговора, <strong>докоснете червения бутон</strong>, за да затворите.'},
        {screen: () => recents(p), question: {q: 'Някой ви се обажда от непознат номер и казва, че е от банката ви. Какво правите?', options: [
            {t: 'Затварям и звъня на 159, за да се свържа безопасно с банката си', ok: true, why: 'Точно така. Винаги можете да затворите и да позвъните на номер, на който вярвате. 159 ви свързва с вашата банка.'},
            {t: 'Правя каквото казват, от банката са', why: 'Измамниците непрекъснато се представят за банки и номерът може да е фалшифициран. Затворете и звъннете на 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Браво!</strong> Можете да отговаряте, да ползвате високоговорителя, да затваряте и да звъните обратно на пропуснати обаждания.'},
    ], {});

    function smsList(p) {
        return app(p, 'Съобщения', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Последният ви преглед беше през март. Запишете се онлайн или ни се обадете.</span><small>преди 3 месеца</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Текстово съобщение', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Текстовите съобщения са в приложението <strong>Съобщения</strong>. <strong>Докоснете Съобщения.</strong>', hint: 'Това е иконата с облачето за разговор.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Новите съобщения са с удебелен шрифт. <strong>Докоснете съобщението от зъболекаря</strong>, за да го прочетете.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Първо напишете Y в полето за съобщение, после докоснете стрелката за изпращане.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Зъболекарят ви моли да отговорите <strong>Y</strong> за потвърждение. <strong>Докоснете полето за съобщение, напишете Y, после докоснете стрелката за изпращане</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Готово! Сега разчистете: <strong>натиснете и задръжте старото съобщение</strong> най-горе (дръжте пръста си върху него секунда-две).', hint: 'Дръжте пръста си върху старото съобщение най-горе, докато се появи меню.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Появява се меню. <strong>Докоснете Изтриване.</strong>',
         hints: {copy: 'Копиране копира думите. Докоснете Изтриване.', forward: 'Препращане го изпраща на някой друг. Докоснете Изтриване.'}},
        {screen: c => smsChat(p, c), question: {q: 'Съобщение от непознат номер казва, че пратката ви е задържана, и ви моли да платите £1.45 чрез връзка. Какво правите?', options: [
            {t: 'Не докосвам връзката. Препращам го на 7726, после го изтривам', ok: true, why: 'Точно така. 7726 е безплатен и докладва на оператора ви. Куриерите не пращат връзки с искане за такси.'},
            {t: 'Плащам, това е само £1.45', why: '£1.45 е стръв, за да получат данните на картата ви. Не докосвайте връзката: препратете съобщението на 7726 и го изтрийте.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Браво!</strong> Можете да четете и да отговаряте на съобщения и да изтривате ненужните.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Карти', 15], ['WhatsApp', 9], ['Камера', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Батерия', [{id: 'low-power', label: 'Режим на ниска мощност', toggle: saver, sub: 'Намалява дейността във фонов режим, докато можете да заредите напълно.'}, {caption: 'ИЗПОЛЗВАНЕ НА БАТЕРИЯТА ПО ПРИЛОЖЕНИЯ'}], {back: 'Настройки', top: head, bottom: apps})
            : list(p, 'Батерия', [{id: 'low-power', label: 'Икономия на батерията', toggle: saver, sub: 'Изключва някои функции, за да издържи батерията по-дълго.'}, {caption: 'Използване на батерията'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Батерията е на привършване? <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Докоснете Батерия.</strong>', hint: p === 'ios' ? 'Батерия е в третата група.' : 'Батерия е в списъка, след Известия.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Батерията ви е на 23%. <strong>${p === 'ios' ? 'Режим на ниска мощност' : 'Икономия на батерията'}</strong> я кара да издържи по-дълго. <strong>Докоснете го, за да го включите.</strong> Символът на батерията става ${p === 'ios' ? 'yellow' : 'orange'} за напомняне.`},
        {screen: c => batteryPage(p, c), question: {q: 'Списъкът показва, че Facebook е изхарчил най-много батерия днес. Какво помага батерията да издържи най-дълго?', options: [
            {t: 'Намалявам яркостта на екрана и затварям приложенията, с които съм приключил', ok: true, why: 'Да. Екранът харчи най-много енергия. Намалете яркостта, а приложения като Facebook и YouTube харчат много.'},
            {t: 'Зареждам я до 100% всеки час', why: 'Честото зареждане не вреди, но не я кара да издържи по-дълго. Намалете яркостта и ползвайте режима за пестене на батерията.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Браво!</strong> Пестенето на батерията е включено и знаете кои приложения харчат най-много енергия.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'мобилен · 3 обаждания' : 'Подозиран спам · 3 обаждания'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Скорошни', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>мобилен</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>мобилен</small><span>Вчера</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Един и същ непознат номер продължава да ви звъни. Нека го блокираме. <strong>Отворете приложението Телефон.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `В скорошните си обаждания <strong>докоснете ⓘ</strong> до номера 07700 900842${p === 'android' ? ' (при някои Android телефони докоснете самия номер)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Споделяне на контакт'}, {id: 'block', label: p === 'ios' ? 'Блокиране на този обаждащ се' : 'Блокиране/докладване на спам', danger: true}], {back: 'Скорошни'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Блокиране на този обаждащ се' : 'Блокиране/докладване на спам'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Да блокирате ли този обаждащ се?', 'Няма да получавате обаждания, съобщения или FaceTime от хората в списъка ви с блокирани.', [['cancel', 'Отказ'], ['confirm', 'Блокиране на контакта']])
            : dialog(p, 'Да блокирате ли 07700 900842?', '⟦square-check⟧ Докладване на обаждането като спам', [['cancel', 'Отказ'], ['confirm', 'Блокиране']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Блокиране на контакта' : 'Блокиране'}.</strong>${p === 'android' ? ' Ако оставите „Докладване на обаждането като спам“ отметнато, помагате да се предупредят и други хора.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Блокирано! Можете също да <strong>заглушите всички обаждания от номера, които не познавате</strong>. <strong>Докоснете Настройки.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Превъртете до края и <strong>докоснете Приложения</strong>.'},
            {screen: () => list(p, 'Приложения', [{id: 'app-phone', label: 'Телефон'}, {id: 'app-messages', label: 'Съобщения'}, {id: 'app-mail', label: 'Поща'}], {back: 'Настройки'}), target: 'app-phone', say: '<strong>Докоснете Телефон.</strong>'},
            {screen: c => list(p, 'Телефон', [{id: 'silence', label: 'Заглушаване на непознати обаждащи се', toggle: !!c.silence}, {id: 'blocked', label: 'Блокирани контакти', value: '1'}], {back: 'Приложения'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Включете „Заглушаване на непознати обаждащи се“.</strong> Обажданията от номера, които не са в контактите ви, отиват направо в гласовата поща и пак се показват в скорошните ви обаждания.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Блокирано! Можете също да <strong>филтрирате спам обажданията</strong>. <strong>Докоснете трите точки ⋮</strong> горе вдясно.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Докоснете Настройки.</strong>'},
            {screen: () => list(p, 'Настройки', [{id: 'caller-id', label: 'Идентификация на обаждащия се и спам'}, {id: 'blocked', label: 'Блокирани номера'}, {id: 'sounds', label: 'Звуци и вибрация'}]), target: 'caller-id', say: '<strong>Докоснете Идентификация на обаждащия се и спам.</strong>'},
            {screen: c => list(p, 'Идентификация на обаждащия се и спам', [{id: 'caller-show', label: 'Показване на идентификация на обаждащия се и спам', toggle: true}, {id: 'silence', label: 'Филтриране на спам обаждания', toggle: !!c.silence, sub: 'Подозирани спам обаждания няма да звънят на телефона ви'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Включете „Филтриране на спам обаждания“.</strong> Подозирани измамни обаждания няма да звънят на телефона ви.'},
        ]),
        {screen: c => list(p, 'Готово', [{label: 'Блокирани номера', value: '1'}, {label: p === 'ios' ? 'Заглушаване на непознати обаждащи се' : 'Филтриране на спам обаждания', toggle: true}]),
         question: {q: 'Може ли заглушаването на непознати обаждащи се да доведе до изпускане на истинско обаждане, например от болница или от куриер?', options: [
            {t: 'Да, затова проверявайте от време на време гласовата поща и пропуснатите обаждания', ok: true, why: 'Точно така. Истинските обаждащи се обикновено оставят съобщение, а пропуснатите обаждания пак се показват в списъка ви.'},
            {t: 'Не, те винаги ще се свържат', why: 'Непознатите номера отиват в гласовата поща, включително истинските. Проверявайте гласовата поща и пропуснатите обаждания от време на време.'}]}},
        {screen: () => list(p, 'Готово', [{label: 'Блокирани номера', value: '1'}, {label: p === 'ios' ? 'Заглушаване на непознати обаждащи се' : 'Филтриране на спам обаждания', toggle: true}]), done: true,
         say: '<strong>Браво!</strong> Блокирахте досаден номер и намалихте измамните обаждания.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: пратката ви е задържана заради неплатена такса от £1.45. Платете сега, за да насрочите нова доставка: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">До: ${field('fwdto', 'Номер', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Благодарим ви. Моля, изпратете телефонния номер, от който е дошло измамното съобщение.</span><small>сега</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Благодарим ви, докладът ви е получен.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Ново съобщение') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Текстово съобщение', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Още… после Препращане' : 'Препращане'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Получихте измамно съобщение, което се представя за Royal Mail. Преди да го изтриете, докладвайте го, безплатно е. <strong>Отворете Съобщения.</strong>'},
        {screen: () => app(p, 'Съобщения', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Докоснете съобщението</strong>, за да го отворите. Не докосвайте връзката в него!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Натиснете и задръжте съобщението</strong> (дръжте пръста си върху него), докато се появи меню. Не докосвайте връзката.', hint: 'Дръжте пръста си върху сивото облаче на съобщението секунда-две.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Докоснете Още…</strong>, после стрелката за препращане (тук един бутон прави и двете).' : '<strong>Докоснете Препращане.</strong> (При някои телефони е под трите точки ⋮ най-горе.)',
         hints: {delete: 'Първо го докладвайте, после можете да го изтриете.', copy: 'Докоснете Препращане, за да го изпратите на 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'В полето „До“ въведете 7726 (на клавиатурата на телефона изписва SPAM), после докоснете изпращане.',
         action: c => { c.sent7726 = true; }, say: 'В полето <strong>До</strong> въведете <strong>7726</strong>. (На клавиатурата изписва S-P-A-M.) После <strong>докоснете изпращане</strong> ⟦send-horizontal⟧. Безплатно е.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Въведете номера на измамника, 07700 900911, после докоснете изпращане.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 отговаря и пита от кой номер е дошла измамата. <strong>Въведете 07700 900911</strong> и <strong>докоснете изпращане</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Докладвахте го. Какво да направите сега с измамното съобщение?', options: [
            {t: 'Изтривам го и блокирам номера', ok: true, why: 'Да. Докладвано е, така че можете да го изтриете. Блокирането спира още съобщения от този номер.'},
            {t: 'Докосвам връзката, за да проверя дали е истинска', why: 'Никога не докосвайте връзки в измамни съобщения. Изтрийте го и блокирайте номера.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Браво!</strong> Докладвахте измамно съобщение на 7726, което помага на операторите да го блокират за всички. Измамните имейли се изпращат на report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Обновленията поправят проблеми със сигурността, затова са важни. Първо включете телефона на зарядно и се свържете с Wi-Fi. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Докоснете Общи.</strong>'},
        {screen: () => list(p, 'Общи', [{id: 'about', label: 'Информация'}, {id: 'software', label: 'Обновяване на софтуера', value: '1'}, {id: 'storage', label: 'Хранилище на iPhone'}], {back: 'Настройки'}), target: 'software', say: '<strong>Докоснете Обновяване на софтуера.</strong> Червената 1 значи, че има чакащо обновление.'},
        {screen: () => list(p, 'Обновяване на софтуера', [{id: 'auto', label: 'Автоматични обновления', value: 'Изкл.'}], {back: 'Общи',
            bottom: '<div class="hu"><strong>Обновление на iOS</strong><p>Това обновление включва важни поправки за сигурността и се препоръчва за всички потребители.</p><button type="button" class="ce co" data-tap="update-now">Обнови сега</button></div>'}),
         target: 'update-now', say: '<strong>Докоснете Обнови сега.</strong>', hints: {auto: 'Струва си да включите и автоматичните обновления след това. Първо докоснете Обнови сега.'}},
        {screen: c => codeScreen(p, c, 'Въведете код', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone иска кода ви. <strong>Въведете тренировъчния код 4 7 1 9 3 6.</strong>', hint: 'Въведете 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Обновяване на софтуера', [], {back: 'Общи', bottom: `<div class="hu"><strong>${c.busy ? 'Изтегляне…' : 'Готово за инсталиране'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Първо се изтегля, което може да отнеме няколко минути. После <strong>докоснете Инсталирай сега</strong>. Телефонът се рестартира, затова го направете, когато няма да ви трябва за 15 до 30 минути.'},
        {screen: () => list(p, 'Обновяване на софтуера', [{id: 'auto', label: 'Автоматични обновления', value: 'Вкл.'}], {back: 'Общи', bottom: '<div class="hu"><strong>iPhone е обновен</strong></div>'}),
         question: {q: 'Струва ли си да включите автоматичните обновления?', options: [
            {t: 'Да, тогава се обновява през нощта, докато се зарежда', ok: true, why: 'Точно така. Настройки > Общи > Обновяване на софтуера > Автоматични обновления. Инсталира се през нощта, когато е на зарядно и на Wi-Fi.'},
            {t: 'Не, обновленията не са задължителни', why: 'Обновленията поправят пробойни в сигурността, които измамниците използват. Автоматичните обновления ви пазят, без да се налага да помните.'}]}},
        {screen: () => list(p, 'Обновяване на софтуера', [], {bottom: '<div class="hu"><strong>iPhone е обновен ⟦check⟧</strong></div>'}), done: true, say: '<strong>Браво!</strong> Телефонът ви е обновен и защитен срещу най-новите проблеми.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Обновленията поправят проблеми със сигурността, затова са важни. Първо включете телефона на зарядно и се свържете с Wi-Fi. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Превъртете надолу и <strong>докоснете Система</strong>. <em>При Samsung е Обновяване на софтуера, близо до края.</em>'},
        {screen: () => list(p, 'Система', [{id: 'languages', label: 'Езици'}, {id: 'date', label: 'Дата и час'}, {id: 'software', label: 'Софтуерни обновления', sub: 'Има налично обновление'}]), target: 'software', say: '<strong>Докоснете Обновления на софтуера.</strong>'},
        {screen: () => list(p, 'Софтуерни обновления', [{id: 'system-update', label: 'Системно обновление', sub: 'Има налично обновление'}, {id: 'play-update', label: 'Системно обновление на Google Play'}]), target: 'system-update', say: '<strong>Докоснете Системно обновление.</strong>'},
        {screen: () => list(p, 'Системно обновление', [], {bottom: '<div class="hu"><strong>Налично е системно обновление</strong><p>Включва важни поправки за сигурността.</p><button type="button" class="ce dk" data-tap="download">Изтегляне и инсталиране</button></div>'}),
         target: 'download', say: '<strong>Докоснете Изтегляне и инсталиране.</strong>'},
        {screen: c => list(p, 'Системно обновление', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Изтегляне и инсталиране…' : 'Рестартирайте, за да завършите'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Изтегля се и се подготвя, което може да отнеме време. После <strong>докоснете Рестартиране сега</strong>. Телефонът се изключва и включва отново, което отнема няколко минути.'},
        {screen: () => list(p, 'Системно обновление', [], {bottom: '<div class="hu"><strong>Системата ви е обновена</strong></div>'}),
         question: {q: 'Телефонът ви не е получавал обновление от години. Какво може да значи това?', options: [
            {t: 'Може да е твърде стар, за да получава обновления за сигурност, и да е по-малко безопасен', ok: true, why: 'Да. По-старите телефони спират да получават обновления. Избягвайте банкирането през тях и помислете за подмяна, когато можете.'},
            {t: 'Работи отлично', why: 'Телефоните спират да получават обновления след няколко години, което оставя пробойните в сигурността неотстранени.'}]}},
        {screen: () => list(p, 'Системно обновление', [], {bottom: '<div class="hu"><strong>Системата ви е обновена ⟦check⟧</strong></div>'}), done: true, say: '<strong>Браво!</strong> Телефонът ви е обновен и защитен срещу най-новите проблеми.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (дъщеря)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Medical ID' : 'Медицинска информация', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'напр. диабет тип 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'напр. пеницилин', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Показване при заключен екран</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Запазване'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Изберете контакт</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Здраве', '#fff', ICON2.health]]), target: 'health', say: '<strong>Medical ID</strong> позволява на лекарите от бърза помощ да видят алергиите и спешния ви контакт, дори телефонът да е заключен. <strong>Отворете приложението Здраве.</strong>'},
            {screen: () => app(p, 'Обобщение', '<p class="cf">Здравните ви данни се показват тук.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Докоснете снимката си</strong> горе вдясно.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Здравни данни'}, {id: 'medical', label: 'Medical ID'}], {back: 'Обобщение'}), target: 'medical', say: '<strong>Докоснете Medical ID.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Телефонът може да пази <strong>медицинска информация</strong>, която лекарите от бърза помощ могат да видят, дори когато е заключен. <strong>Докоснете Настройки.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Превъртете надолу и <strong>докоснете Безопасност и спешни случаи</strong>. <em>При Samsung е Безопасност и спешни случаи.</em>'},
            {screen: () => list(p, 'Безопасност и спешни случаи', [{id: 'medical', label: 'Медицинска информация'}, {id: 'contacts-ec', label: 'Спешни контакти'}, {id: 'sos', label: 'SOS при спешност'}]), target: 'medical', say: '<strong>Докоснете Медицинска информация.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Първо въведете алергия (за упражнение „Пеницилин“), после добавете спешен контакт.',
         say: 'Попълнете всичко, което лекарите от бърза помощ трябва да знаят. За упражнение въведете <strong>Пеницилин</strong> под алергии. После <strong>докоснете добавяне на спешен контакт</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Изберете на кого да се звъни при спешност. <strong>Докоснете Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '„Показване при заключен екран“ е включено, така че лекарите от бърза помощ могат да го видят. <strong>Докоснете Готово.</strong>' : '<strong>Докоснете Запазване.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Medical ID' : 'Медицинска информация', [{label: 'Алергии', sub: typed(c, 'allergies')}, {label: 'Спешен контакт', sub: 'Sarah (дъщеря)'}]),
         question: {q: p === 'ios' ? 'Как лекар от бърза помощ би видял вашето Medical ID, ако телефонът ви е заключен?' : 'Как лекар от бърза помощ би видял това, ако телефонът ви е заключен?', options: [
            {t: 'Чрез бутона „Спешно обаждане“ на заключения екран', ok: true, why: 'Да. Докосването на „Спешно обаждане“ на заключения екран показва медицинската ви информация, без да отключва телефона.'},
            {t: 'Не могат', why: 'Могат: бутонът „Спешно обаждане“ на заключения екран я показва, без да е нужен кодът ви.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Medical ID' : 'Медицинска информация', [{label: 'Алергии', sub: typed(c, 'allergies')}, {label: 'Спешен контакт', sub: 'Sarah (дъщеря)'}]), done: true,
         say: '<strong>Браво!</strong> Медицинската ви информация и спешният контакт са запазени. Ако се обадите за помощ със SOS при спешност, спешният ви контакт също се уведомява.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Find My' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Възпроизвеждане на звук…' : '⟦volume-2⟧ Пускане на звук'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Отбелязване като изгубен' : 'Защита на устройството'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Ако телефонът ви някога се изгуби, можете да го намерите, да го накарате да звъни или да го заключите, но само ако това е включено предварително. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Докоснете името си</strong> най-горе.'},
            {screen: () => list(p, 'Профил в Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Find My'}, {id: 'family', label: 'Семейно споделяне'}], {back: 'Настройки'}), target: 'findmy', say: '<strong>Докоснете Find My.</strong>'},
            {screen: c => list(p, 'Find My', [{id: 'find-toggle', label: 'Find My iPhone', toggle: !!c.findOn}, {label: 'Изпращане на последното местоположение', toggle: !!c.findOn}], {back: 'Профил в Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Включете Find My iPhone.</strong> „Изпращане на последното местоположение“ изпраща местоположението му малко преди батерията да се изтощи напълно.'},
            {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Сега си представете, че не можете да намерите телефона си. На друго устройство на Apple бихте отворили <strong>Find My</strong> (или бихте отишли на icloud.com/find на компютър). Тук <strong>докоснете Find My</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Превъртете надолу и <strong>докоснете Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Всички услуги'}, {id: 'account', label: 'Управление на профила ви в Google'}]), target: 'all-services', say: '<strong>Докоснете Всички услуги.</strong>'},
            {screen: () => list(p, 'Всички услуги', [{id: 'find-hub', label: 'Find Hub', sub: 'Преди се казваше Find My Device'}, {id: 'theft', label: 'Защита от кражба'}]), target: 'find-hub', say: '<strong>Докоснете Find Hub</strong> (преди се казваше Find My Device). <em>Samsung има и собствена: Настройки &gt; Сигурност и поверителност &gt; Защита на изгубено устройство.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Ползване на Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Включете „Ползване на Find Hub“.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Сега си представете, че не можете да намерите телефона си. На друг телефон или таблет бихте отворили <strong>Find Hub</strong> или бихте отишли на google.com/android/find на компютър. Тук <strong>докоснете Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Ето го на картата. Ако е някъде наблизо, например между възглавниците на дивана, <strong>докоснете Пускане на звук</strong>: звъни силно, дори на тих режим.'},
        {screen: c => findMap(p, c), question: {q: 'Картата показва телефона ви някъде, където никога не сте били. Какво да направите?', options: [
            {t: 'Ползвам „Отбелязване като изгубен“ или „Защита на устройството“, за да го заключа, и се свързвам с полицията', ok: true, why: 'Да. Заключете го от Find My или Find Hub, не ходете там сами и го докладвайте на полицията и на оператора си.'},
            {t: 'Отивам и си го връщам сам', why: 'Никога не се изправяйте срещу крадец. Заключете телефона от разстояние и се свържете с полицията.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Браво!</strong> Намирането на телефона е включено и знаете как да го накарате да звъни или да го заключите.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Безплатни съвети за техниката</strong>${UI.qr}<small>Сканирайте ме</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Да изтриете ли тази снимка?', p === 'ios' ? 'Ще се пази в „Наскоро изтрити“ 30 дни.' : 'Ще бъде преместена в кошчето за известно време, преди да изчезне.', [['cancel', 'Отказ'], ['confirm-delete', 'Изтриване']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Отворете Камера.</strong> <em>Съвет: при повечето телефони можете да плъзнете наляво и на заключения екран.</em>', hint: 'Камерата е сивата икона с фотоапарат.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Насочете я към цветята и стойте неподвижно. <strong>Докоснете големия кръгъл бутон</strong>, за да направите снимка.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Щрак! Запазена е. <strong>Докоснете малката картинка</strong> в ъгъла, за да я видите.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'За да погледнете отблизо, поставете два пръста върху снимката и ги раздалечете. Тук <strong>докоснете ＋ два пъти</strong>.', hint: 'Докоснете ＋ горе вдясно.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Прекрасно! За да я изпратите на някого, <strong>докоснете бутона за споделяне</strong> ⇪ (кутия със стрелка).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Изберете как да я изпратите: Съобщения, имейл, WhatsApp и т.н. <strong>Докоснете Съобщения.</strong> (После бихте избрали на кого да я изпратите.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Изпратена! Сега, ако направите снимка, която не искате, <strong>докоснете кошчето</strong> ⟦trash-2⟧, за да я изтриете.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Първо телефонът проверява. <strong>Докоснете Изтриване.</strong>'},
        {screen: () => app(p, 'Снимки', '<p class="cf">Още няма снимки.</p>', {back: false, color: '#fff'}), question: {q: 'Изтрили сте снимка по погрешка! Какво можете да направите?', options: [
            {t: p === 'ios' ? 'Поглеждам в Албуми > Наскоро изтрити и я възстановявам' : 'Поглеждам в Кошчето (Библиотека > Кошче) и я възстановявам', ok: true, why: 'Да. Изтритите снимки се пазят известно време, обикновено около месец, така че можете да ги върнете.'},
            {t: 'Нищо, изчезнала е завинаги', why: 'Не се безпокойте! Пази се в „Наскоро изтрити“ (iPhone) или в Кошчето (Android) за известно време.'}]}},
        {screen: () => app(p, 'Снимки', '<p class="cf">Всичко е готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Браво!</strong> Можете да правите снимки, да ги увеличавате, да ги споделяте и да ги изтривате.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Ако и близките ви имат iPhone, <strong>FaceTime</strong> прави безплатни видеообаждания. <strong>Докоснете FaceTime.</strong>' : '<strong>Google Meet</strong> прави безплатни видеообаждания от Android, а и към iPhone. <strong>Докоснете Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Нов FaceTime' : 'Ново'}</button><p class="cf">Скорошните обаждания се показват тук.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Нов FaceTime' : 'Ново'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Нов FaceTime' : 'Обаждане', `<div class="xz">To: ${field('callto', 'Име или номер', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Видеообаждане'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Първо напишете Sarah в полето „До“.',
             say: 'Въведете името на човек от контактите си. <strong>Напишете Sarah</strong>, после <strong>докоснете бутона за видео</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Звъни и Sarah вдига. За да ѝ покажете градината, <strong>докоснете бутона за обръщане</strong> ⟦switch-camera⟧, за да ползвате камерата отзад.', hint: 'Изчакайте Sarah да вдигне, после докоснете ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Когато приключите, <strong>докоснете червения бутон</strong>, за да затворите.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Видео · 3 мин</p>', {back: false, color: '#fff'}), question: {q: 'Приятелят ви има Android телефон, а вие iPhone. Можете ли пак да правите видеообаждане?', options: [
                {t: 'Да, с WhatsApp или Google Meet, които работят и на двата', ok: true, why: 'Точно така. FaceTime е главно от iPhone към iPhone. WhatsApp и Google Meet работят и на двата вида.'},
                {t: 'Не, никога', why: 'Можете: WhatsApp и Google Meet работят на двата вида телефони.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Всичко е готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Браво!</strong> Направихте видеообаждане и показахте гледката от задната камера.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR кодовете са онези квадратни черно-бели шарки по плакати и менюта. Камерата ви може да ги чете, без допълнително приложение. <strong>Отворете Камера.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Насочете камерата към кода и стойте неподвижно за момент. <strong>Връзка се появява на екрана</strong>: проверете дали изглежда като от кого очаквате, после <strong>докоснете я</strong>.',
         hints: {shutter: 'Не е нужно да правите снимка: просто насочете и изчакайте връзката да се появи, после докоснете връзката.'},
         hint: p === 'android' ? 'Изчакайте връзката да се появи, после я докоснете. Ако не се появи нищо, опитайте Google Lens.' : 'Изчакайте връзката да се появи, после я докоснете.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Безплатни съвети за техниката</h3><p>Съвети на разбираем език за телефони, компютри и безопасност в интернет.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Виждате стикер с QR код на машина за плащане на паркинг. Кой е най-безопасният начин да платите?', options: [
            {t: 'Ползвам официалното приложение на паркинга или самата машина, не залепен QR код', ok: true, why: 'Да. Измамниците лепят фалшиви QR кодове върху истинските, за да откраднат данни от карти. Проверете дали е стикер и ползвайте официалното приложение или табела.'},
            {t: 'Сканирам и плащам, по-бързо е', why: 'Фалшивите QR стикери по машините на паркингите са позната измама. Ползвайте официалното приложение или самата машина.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Безплатни съвети за техниката</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Браво!</strong> Можете да сканирате QR кодове с камерата си и знаете да проверявате първо връзката.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Снимки от неделя 📷', 'Здравей, мамо, ето снимките от обяда…'],
                       ['tv', 'TV Licensing', 'Лицензът ви е С ИЗТЕКЪЛ СРОК', 'Действайте сега, за да избегнете съдебно преследване. Обновете плащането си…'],
                       ['library', 'Bridlington Library', 'Книгите ви трябва да се върнат', 'Заглавията ви трябва да се върнат в петък.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Входящи' : 'Основни', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · до мен</p><h3>Снимки от неделя 📷</h3><p>Здравей, мамо, ето снимките от обяда. Прекрасно беше да се видим! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Напишете отговора си…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Лицензът ви е С ИЗТЕКЪЛ СРОК</h3><p>Действайте сега, за да избегнете съдебно преследване. Обновете данните за плащане в рамките на 24 часа: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Преместване в спам' : '⋮ Докладване на фишинг'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Поща' : 'приложението ви за имейл (Gmail при повечето Android телефони)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Новите имейли са с удебелен шрифт. <strong>Докоснете имейла на Sarah</strong>, за да го прочетете.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'За да отговорите, <strong>докоснете Отговор</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Първо напишете кратък отговор, после докоснете Изпрати.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Напишете кратък отговор</strong> (например „Благодаря, прекрасни са!“) и <strong>докоснете Изпрати</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Изпратено ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Назад към входящите</button>', {color: '#fff'}), target: 'back', say: '<strong>Докоснете Назад</strong>, за да се върнете във входящата си поща.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Има тревожен имейл от „TV Licensing“. <strong>Отворете го</strong>, но не докосвайте нищо в него.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Измамните имейли често ползват истинско име, но фалшив адрес. <strong>Докоснете името на подателя</strong>, за да видите истинския имейл адрес.',
         hint: 'Докоснете „TV Licensing“ най-горе в имейла.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Той е от <strong>outlook-mail.com</strong>, не от tvlicensing.co.uk. Това е измама. <strong>Докоснете ' + (p === 'ios' ? 'Преместване в спам' : 'Докладване на фишинг') + '.</strong> Можете да препращате измамни имейли и на report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Какво издаде измамата?', options: [
            {t: 'Истинският адрес на подателя, заплахите и срокът от 24 часа', ok: true, why: 'Точно така. Истинските организации не ви заплашват със срокове и имейлите им идват от собствения им уеб адрес.'},
            {t: 'Нищо, изглеждаше истински', why: 'Проверете адреса на подателя: не беше на TV Licensing. Заплахите и стегнатите срокове също са сериозен знак за опасност.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Браво!</strong> Можете да четете и да отговаряте на имейли и да разпознавате и докладвате измама.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Вземи' : 'Инсталирай';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Магазин'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Докоснете Търсене.</strong>' : '<strong>Докоснете полето за търсене.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Потърсихме „NHS App“. Много приложения ползват „NHS“ в името си. Проверете <strong>кой го е направил</strong>: истинското е от <strong>NHS England</strong>. <strong>Докоснете ' + (p === 'ios' ? 'Вземи' : 'Инсталирай') + ' до истинското.</strong>',
         hints: {'fake1-get': 'Това е от HealthApps Ltd и е реклама. Истинското NHS App е от NHS England.', 'fake2-get': 'Това е от QuickDev Apps, не от NHS. Истинското е от NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Инсталирано! Сега премахнете приложение, което никога не ползвате, за да разчистите и освободите място. <strong>Натиснете и задръжте приложението Времето</strong>, докато се появи меню.', hint: 'Дръжте пръста си върху иконата на Времето секунда-две.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Да се премахне ли „Времето“?' : 'Времето', p === 'ios' ? 'Премахването от началния екран ще остави приложението в Библиотеката с приложения.' : '', p === 'ios'
            ? [['delete-app', 'Изтриване на приложението'], ['remove-home', 'Премахване от началния екран'], ['cancel', 'Отказ']] : [['app-info', 'Информация за приложението'], ['delete-app', 'Деинсталиране'], ['cancel', 'Отказ']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Докоснете Премахване на приложението</strong>, после <strong>Изтриване на приложението</strong> (тук е един бутон).' : '<strong>Докоснете Деинсталиране.</strong>',
         hints: {'remove-home': 'Това само скрива иконата; приложението остава в телефона. Докоснете Изтриване на приложението.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Приложение иска плащане, за да „отключи“ NHS данните ви. Какво мислите?', options: [
            {t: 'Не е истинското NHS App, което е напълно безплатно', ok: true, why: 'Точно така. NHS App е безплатно. Изтрийте всичко, което иска да платите за услуги на NHS.'},
            {t: 'Плащам, това е за NHS', why: 'Истинското NHS App е безплатно и е от NHS England. Приложение, което иска пари, не е истинското.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Браво!</strong> Можете да различавате истинските приложения от фалшивите двойници и да премахвате ненужните.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Добре дошли отново.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Вход с Face ID' : 'Вход с пръстов отпечатък'}</button>
                <button type="button" class="cp" data-tap="password">Вход с имейл и парола</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Рецепти'], ['appointments', '⟦calendar⟧', 'Прегледи'], ['records', '⟦clipboard-list⟧', 'Вашето здраве'], ['messages', '⟦mail⟧', 'Съобщения']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Рецепти', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Поръчка на повторна рецепта</strong><small>Изберете лекарства, които вече са ви изписани</small></button><div class="ck"><strong>Вижте поръчките си</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Амлодипин таблетки 5 mg'], ['med-2', 'Аторвастатин таблетки 20 mg']];
            return app(p, 'Изберете лекарства', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Потвърдете поръчката си', `<p class="cf">Амлодипин таблетки 5 mg<br>Вземане от: Вашата определена аптека</p><button type="button" class="ce co" data-tap="confirm">Потвърждаване и поръчка</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Поръчката е изпратена', '<p class="cf">⟦check⟧ Заявката ви за рецепта е изпратена до личния ви лекар. Обикновено отнема 2 до 3 работни дни.</p><button type="button" class="cp" data-tap="home">Към началото</button>', {color: NHS});
        return app(p, 'Прегледи', '<div class="fo"><div class="ck"><strong>Преглед при личния лекар</strong><small>Във вторник в 10:30 · Кабинетът на личния ви лекар</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> е безплатно и позволява да поръчвате повторни рецепти, да виждате прегледите си и още. (Тази тренировъчна версия е измислена, направена само за този урок.) <strong>Докоснете NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `След като го настроите с NHS login, можете да влизате с ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Докоснете Вход с ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'И това става, но лицето или пръстовият отпечатък е по-бързо. Докоснете синия бутон.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Докоснете Рецепти.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Докоснете Поръчка на повторна рецепта.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Първо докоснете лекарство, за да го отметнете, после докоснете Продължи.',
         say: '<strong>Докоснете лекарството, което ви трябва,</strong> за да го отметнете (опитайте Амлодипин), после <strong>докоснете Продължи</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Проверете дали е вярно, после <strong>докоснете Потвърждаване и поръчка</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Изпратено до кабинета ви! <strong>Докоснете Към началото.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Можете да проверите и прегледите си. <strong>Докоснете Прегледи.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Съобщение гласи „NHS: имате право на безплатен тестов комплект, въведете банковите си данни, за да платите пощенските разходи“. Какво е това?', options: [
            {t: 'Измама. NHS никога не иска банкови данни по съобщение', ok: true, why: 'Точно така. Ползвайте NHS App или директно кабинета на личния си лекар, никога връзки от съобщения.'},
            {t: 'Истинско е, това са само пощенски разходи', why: 'NHS никога не пише с искане за банкови данни. Това е измама: препратете го на 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Браво!</strong> Поръчахте повторна рецепта и проверихте прегледите си.'},
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
        if (page === 'login') return app(p, 'Practice Bank', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Вход с Face ID' : 'Вход с пръстов отпечатък'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Вашите сметки', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Днес'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Днес'], ['txn-pension', 'State Pension', '+£921.60', 'Вчера'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Пон']];
            return app(p, 'Разплащателна сметка', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Плащане', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Днес, 03:12 · Карта с краища на 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Блокиране на картата</strong><small>${ctx.frozen ? 'Картата е блокирана ⟦check⟧' : 'Спрете плащанията веднага'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Докладване на това плащане</strong><small>Не го разпознавате? Кажете ни</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Банка', BANK, ICON2.pound]]), target: 'bank',
         say: 'Банковите приложения ви позволяват да проверявате парите си по всяко време. (Това е измислена банка за упражнение.) <strong>Отворете приложението на банката.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Влезте с ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Никога не споделяйте банковия си код с никого.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Докоснете разплащателната си сметка,</strong> за да видите какво е постъпило и платено.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Прегледайте плащанията. Едно от тях не разпознавате: <strong>£249 в 3 часа през нощта към сайт за карти за подаръци</strong>. <strong>Докоснете го.</strong>',
         hints: {'txn-tesco': 'Това са покупките ви. Потърсете такова, което не разпознавате.', 'txn-pension': 'Това е пенсията ви, която постъпва. Потърсете необичайното.', 'txn-water': 'Това е сметката ви за вода. Потърсете необичайното.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Докоснете Блокиране на картата</strong>. Спира всички нови плащания веднага и по-късно можете да я отблокирате, ако се окаже, че всичко е наред.',
         hints: {report: 'Първо блокирайте картата, за да спрете още плащания. После докладвайте.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Блокирахте картата. Какво следва?', options: [
            {t: 'Обаждам се на банката си на 159 или на номера на картата, или докладвам в приложението', ok: true, why: 'Да. Те могат да проучат случая, да анулират картата и често да върнат парите. Колкото по-рано им кажете, толкова по-добре.'},
            {t: 'Изчаквам да видя дали ще се повтори', why: 'Кажете на банката си веднага. Колкото по-рано разберат, толкова повече могат да направят.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Браво!</strong> Проверихте сметката си, забелязахте плащане, което не разпознавате, и блокирахте картата си.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Practice Bank</strong><span>•••• 4421</span><small>ДЕБИТНА</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Портфейл' : 'Google Wallet', `<p class="cf">Добавете карта, за да плащате в магазините с телефона си.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Добавяне на карта' : '＋ Добавяне в Портфейл'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Добавяне на карта', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Дръжте картата си в рамката…' : 'Картата е намерена ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Потвърждаване на картата', `<p class="cf">Банката ви трябва да провери, че сте вие. Изберете как да получите код:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Текстово съобщение</strong><small>на ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Обадете се на банката си</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Въведете код', `<div class="jp ex"><strong>Съобщения · сега</strong><span>Practice Bank: вашият код за Портфейл е 529173. Никога не го споделяйте.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Портфейл' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Картата ви е готова за ползване.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Доближете до четеца…' : 'Доближете до четеца…') : '⟦check⟧ Готово'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Портфейл' : 'Портфейл', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Плащането с телефон е бързо и безопасно: магазините никога не виждат номера на картата ви. <strong>Отворете ${p === 'ios' ? 'Портфейл' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Добавяне на карта' : '＋ Добавяне в Портфейл'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Телефонът ползва камерата, за да прочете картата ви, така че не се налага да въвеждате номера. <strong>Дръжте картата си в рамката</strong>, после <strong>докоснете Напред</strong>. <em>Никога не въвеждайте номера на картата си в уебсайт от съобщение или имейл.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Банката ви проверява дали наистина сте вие. <strong>Докоснете Текстово съобщение.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'От банката ви пристига код по съобщение. <strong>Въведете 5 2 9 1 7 3.</strong> Запомнете: този код се въвежда само в собствения ви телефон и никога не се дава на никого, който го поиска.', hint: 'Въведете кода от съобщението: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Картата ви е готова. Сега да платим в магазин. <strong>Докоснете където и да е по картата.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'На касата <strong>натиснете два пъти страничния бутон</strong> на iPhone (тук докоснете ⟦power⟧ два пъти), погледнете екрана за Face ID, после доближете горната част на телефона до четеца за карти.', hint: 'Докоснете бутона ⟦power⟧ отстрани два пъти.'}
            : {target: 'pay-now', say: 'На касата просто <strong>отключете телефона и доближете гърба му до четеца за карти</strong>. Тук <strong>докоснете четеца за карти</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Безопасно ли е плащането с телефон?', options: [
            {t: 'Да, по-безопасно е от картата: изисква лицето, пръстовия отпечатък или кода ви и магазините не виждат номера на картата', ok: true, why: 'Точно така. А ако изгубите телефона си, никой не може да плати с него, без да го отключи.'},
            {t: 'Не, всеки може да го ползва', why: 'Всяко плащане изисква лицето, пръстовия отпечатък или кода ви, така че всъщност е по-безопасно от безконтактна карта.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Браво!</strong> Картата ви е в телефона и направихте тренировъчно плащане.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>ДЕБИТНА</small></div>', '<small>ДЕБИТНА</small></div></button>');
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
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Изберете гара'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Добавяне на railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Изберете гара</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Добавяне на railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Без railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Директен'], ['t-1145', '11:45', '12:32', 'Директен'], ['t-1245', '12:45', '13:32', 'Директен']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Цените са измислени за това упражнение. Приложена е отстъпката за railcard.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Off-Peak билет в една посока</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Off-Peak билет отиване и връщане за деня</strong><small>Връщане днес</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Вашият билет', `<div class="adt"><strong>Off-Peak билет отиване и връщане за деня</strong><span>Bridlington ⇄ Hull</span><span>Днес · Senior Railcard</span>
            ${UI.qr}<small>Сканирайте това на бариерата или го покажете на кондуктора.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Влакове', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Приложенията за влакове ви позволяват да купувате билети на телефона си, без опашка. (Това тренировъчно приложение е измислено: цените и часовете са измислени.) <strong>Отворете Влакове.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Тръгвате от Bridlington. <strong>Докоснете До</strong>, за да изберете накъде пътувате.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Докоснете Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Над 60 години? <strong>Senior Railcard</strong> спестява една трета от повечето билети. <strong>Докоснете Railcard</strong>, за да добавите вашата.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Докоснете Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Докоснете Търсене на влакове.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Ето влаковете. <strong>Докоснете 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Връщате ли се днес? Билетът отиване и връщане за деня обикновено е по-евтин от два отделни. <strong>Докоснете Off-Peak билет отиване и връщане за деня</strong>, после платете.',
         hints: {single: 'Билетът в една посока е само за едната посока. Връщате се днес, затова докоснете Off-Peak билет отиване и връщане за деня.', pay: 'Първо изберете билета си: докоснете Off-Peak билет отиване и връщане за деня.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Докоснете ${p === 'ios' ? 'Плати' : 'G Pay'}</strong>, за да платите с картата в телефона си (от урока за безконтактно плащане).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Батерията на телефона ви е на привършване преди влака за връщане. Каква е добра идея?', options: [
            {t: 'Правя екранна снимка на билета и включвам пестенето на батерията', ok: true, why: 'Да. Някои билети работят от екранна снимка, а пестенето на батерията помага да издържи. Много приложения позволяват и добавяне на билета в Портфейл.'},
            {t: 'Нищо, ще е наред', why: 'Ако телефонът ви изгасне, не можете да покажете билета си. Направете екранна снимка и пестете батерията.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Браво!</strong> Планирахте пътуване, добавихте railcard и купихте билет на телефона си.'},
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

    const busTable = `<div class="sj"><strong>Автобус 121: Bridlington – Hull</strong><small>Само примерни часове</small>
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
        return app(p, 'Часове на автобусите', busTable, {back: false, color: '#fff',
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
            ? 'Екранната снимка е снимка на всичко, което е на екрана ви, например тези часове на автобусите. Натиснете едновременно <strong>страничния бутон</strong> (вдясно) и <strong>усилване на звука</strong> (вляво), после пуснете. Тук <strong>докоснете страничния бутон, после усилване на звука</strong>.'
            : 'Екранната снимка е снимка на всичко, което е на екрана ви, например тези часове на автобусите. Натиснете едновременно <strong>бутона за захранване</strong> и <strong>намаляване на звука</strong>, после пуснете. Тук <strong>докоснете бутона за захранване, после намаляване на звука</strong>.',
         hints: {'vol-down': p === 'ios' ? 'При iPhone е усилване на звука, заедно със страничния бутон.' : 'Започнете с бутона за захранване, най-горе на дясната страна.',
                 'vol-up': p === 'ios' ? 'Започнете със страничния бутон отдясно.' : 'При Android е намаляване на звука, заедно с бутона за захранване.',
                 side: 'Сега бутона за усилване на звука, отляво.', power: 'Сега бутона за намаляване на звука.'},
         hint: p === 'ios' ? 'Страничният бутон е на десния ръб. Усилването на звука е отляво.' : 'Бутонът за захранване е горният бутон на десния ръб.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Щрак! В долния ъгъл се появява малка картинка. <strong>Докоснете я</strong>, за да видите екранната си снимка. <em>Ако я оставите, запазва се сама след няколко секунди.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Тук можете да рисувате по нея или да я изрязвате. <strong>Докоснете Готово</strong> горе вляво.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Докоснете Запазване в Снимки.</strong>', hints: {'delete-shot': 'Това ще я изхвърли. Докоснете Запазване в Снимки.', 'save-files': 'Файлове също става, но в Снимки се намира по-лесно. Докоснете Запазване в Снимки.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Щрак! Появява се малка картинка с бутони отдолу. Вече е запазена. <strong>Докоснете Споделяне</strong>, за да я изпратите на някого.', hints: {'shot-edit': 'Редактиране позволява да я изрежете или да рисувате по нея. Засега докоснете Споделяне.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Докоснете Sarah,</strong> за да ѝ изпратите часовете на автобусите.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Къде можете да намерите екранните си снимки по-късно?', options: [
            {t: 'В приложението Снимки, в албума Екранни снимки', ok: true, why: 'Да. Запазват се заедно със снимките ви, така че можете да ги разглеждате, споделяте или изтривате като всяка снимка.'},
            {t: 'Изчезват след един ден', why: 'Остават, докато ги изтриете. Потърсете в приложението Снимки, в албума Екранни снимки.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Браво!</strong> Екранните снимки са удобни за часове на автобуси, билети, съобщения за грешки и всичко, което искате да запазите или да покажете на някого. Можете да ги изтриете от Снимки, когато приключите.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Търсене в Карти'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah ви е пратила адрес. Копирането му спестява въвеждането наново. <strong>Отворете Съобщения.</strong>'},
        {screen: () => app(p, 'Съобщения', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Докоснете съобщението на Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Натиснете и задръжте съобщението с адреса</strong> (дръжте пръста си върху него секунда-две), докато се появи меню.', hint: 'Дръжте пръста си върху второто съобщение, докато се появи меню.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Докоснете Копиране.</strong> Телефонът вече помни думите, готови за поставяне другаде.',
         hints: {reply: 'Отговор би започнал съобщение. Докоснете Копиране.', forward: 'Препращане изпраща съобщението на някого. Докоснете Копиране.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Копирано! Сега отидете на началния екран. Тук <strong>докоснете лентата най-долу на екрана</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Отворете Карти,</strong> за да намерите адреса.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Натиснете и задръжте полето за търсене,</strong> докато се появи малкото бутонче „Поставяне“.', hint: 'Дръжте пръста си върху полето за търсене най-горе.',
         hints: {'search-tap': 'Бързо докосване отваря клавиатурата. Вместо това натиснете и задръжте, докато се появи Поставяне.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Докоснете Поставяне.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Целият адрес се появява без писане. <strong>Докоснете резултата.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Искате да копирате само телефонен номер от средата на дълго съобщение. Как?', options: [
            {t: 'Натискам и задържам, после докосвам Избор (или влача малките дръжки), за да избера само нужната част, после Копиране', ok: true,
             why: 'Да. Влачете дръжките от двете страни на маркираните думи, за да изберете точно каквото искате.'},
            {t: 'Може да се копира само цялото съобщение', why: 'Можете да изберете част от него: натиснете и задръжте, докоснете Избор и влачете малките дръжки.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Браво!</strong> Копирането и поставянето работят почти навсякъде: съобщения, имейли, уеб страници и формуляри. Натиснете и задръжте, за да копирате; натиснете и задръжте, за да поставите.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Хранилище'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Хранилище на iPhone', [{caption: 'ПРЕПОРЪКИ'},
                ctx.offloaded ? {label: 'Разтоварване на неизползваните приложения', value: 'Включено ⟦check⟧'} : {id: 'offload', label: 'Разтоварване на неизползваните приложения', sub: 'Спестете 2,1 GB. Премахва приложенията, които не ползвате, но запазва данните им.', value: 'Включване'},
                {caption: 'ПРИЛОЖЕНИЯ'}, {label: 'Снимки', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'Общи', top: bar});
        }
        return list(p, 'Хранилище', [{label: 'Снимки и видеоклипове', value: '21,3 GB'}, {label: 'Приложения', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Включително WhatsApp'}, {label: 'Документи и други', value: '4,1 GB'},
            {label: 'Система', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ Изчистени са 1,1 GB ненужни файлове</p>' : '<button type="button" class="ce dk" data-tap="free-up">Освобождаване на място</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Настройки', `<div class="fo">${[['account', 'Профил'], ['privacy', 'Поверителност'], ['chats', 'Чатове'], ['notifications', 'Известия'], ['storage', 'Хранилище и данни'], ['help', 'Помощ']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Хранилище и данни', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Управление на хранилището', `<div class="iq"><span>WhatsApp ползва ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>По-големи от 5 MB</strong><small>Няма какво да се прегледа</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Препратени много пъти</strong><small>112 елемента · 0,9 GB</small></div>
                <div class="he">ЧАТОВЕ</div><div class="ck"><strong>Семейство</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'По-големи от 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Да изтриете ли 23 елемента?', 'Ще бъдат изтрити от WhatsApp. Снимките, вече запазени в галерията на телефона ви, остават там.', [['cancel', 'Отказ'], ['confirm-delete', 'Изтриване']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Получавате „Хранилището е почти пълно“? Нека разберем какво заема мястото. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Докоснете Общи.</strong>'},
            {screen: () => list(p, 'Общи', [{id: 'about', label: 'Информация'}, {id: 'update', label: 'Обновяване на софтуера'}, {id: 'storage', label: 'Хранилище на iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN и управление на устройството'}], {back: 'Настройки'}),
             target: 'storage', say: '<strong>Докоснете Хранилище на iPhone.</strong> Отнема няколко секунди да се изчисли всичко.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Цветната лента показва какво заема мястото. Първо бърза печалба: <strong>Разтоварване на неизползваните приложения</strong> премахва приложения, които не сте ползвали отдавна, но запазва данните ви, в случай че ги поискате обратно. <strong>Докоснете Включване.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Докоснете Хранилище.</strong> <em>При Samsung е Батерия и грижа за устройството, после Хранилище.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Цветната лента показва какво заема мястото. <strong>Докоснете Освобождаване на място.</strong>'},
            {screen: () => app(p, 'Файлове', `<div class="ke"><strong>Изтриване на ненужни файлове</strong><small>1,1 GB временни файлове от приложения</small><button type="button" class="ce dk" data-tap="clean">Изчистване</button></div>
                <div class="ke"><strong>Изтриване на стари екранни снимки</strong><small>214 MB</small><span class="fd">Изберете и освободете място</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Ненужните файлове са безопасни за изтриване: това са временни файлове, които приложенията не използват. <strong>Докоснете Изчистване.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp ползва 14,8 GB. Какво го пълни?', options: [
            {t: 'Видеоклипове и снимки, които хората са ви пращали, особено в групи', ok: true, why: 'Да. Всеки видеоклип, изпратен в семеен или групов чат, се запазва в телефона ви. WhatsApp може да намери и изтрие големите.'},
            {t: 'Текстовите ви съобщения', why: 'Текстът почти не заема място. Мястото заемат видеоклиповете и снимките, които хората пращат, особено в групи.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Отворете WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'В WhatsApp докоснете <strong>Настройки</strong> долу вдясно. Тук е отворено. <strong>Докоснете Хранилище и данни.</strong>'
                          : 'В WhatsApp докоснете <strong>трите точки ⋮</strong> най-горе, после <strong>Настройки</strong>. Тук е отворено. <strong>Докоснете Хранилище и данни.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Докоснете Управление на хранилището.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Най-големите спестители на място са най-горе. <strong>Докоснете По-големи от 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Това са големи видеоклипове, които хората са ви пращали. Ако искате да запазите някой, първо го запазете в снимките си. <strong>Докоснете Избор на всички.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Докоснете Изтриване.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Така се изтриват само копията във WhatsApp. <strong>Докоснете Изтриване</strong>, за да потвърдите.', hints: {cancel: 'Отказ ги запазва. За това упражнение докоснете Изтриване.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Браво!</strong> Освободихте над 7 GB. Струва си да го правите на няколко месеца. Изпразвайте и <strong>Наскоро изтрити</strong> в Снимки, защото изтритите снимки заемат място още 30 дни.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Световен часовник'], ['alarms', 'Будилници'], ['stopwatch', 'Хронометър'], ['timers', 'Таймери']]
            : [['alarms', 'Будилник'], ['world', 'Часовник'], ['timers', 'Таймер'], ['stopwatch', 'Хронометър']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Днес</small><strong>Лондон</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Австралия</small><strong>Сидни</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Хапчета')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Будилник</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Световен часовник' : 'Часовник') : (p === 'ios' ? 'Будилници' : 'Будилник')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Никога'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Будилник', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Будилникът може да ви напомня да взимате хапчетата си всеки ден. <strong>Отворете приложението Часовник.</strong>', hint: 'Това е черната икона с бял циферблат.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Докоснете ${p === 'ios' ? 'Будилници' : 'Будилник'}</strong> в ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Докоснете +</strong>, за да добавите нов будилник.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'На истински телефон превъртате цифрите, за да зададете часа. Тук <strong>докоснете 08:00</strong>.', hints: {'t-07': 'Изберете 08:00 за това упражнение.', 't-09': 'Изберете 08:00 за това упражнение.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Трябва ви всеки ден, не само веднъж. <strong>Докоснете Повтаряне.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Всеки ден'; }, say: '<strong>Докоснете Всеки ден.</strong>',
         hints: {never: '„Никога“ значи, че ще звънне само веднъж. Докоснете Всеки ден.', weekdays: '„В делнични дни“ пропуска почивните. Докоснете Всеки ден.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Първо напишете име в полето Етикет, например Хапчета.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Етикетът ви казва за какво е будилникът. <strong>Докоснете полето Етикет и напишете Хапчета,</strong> после <strong>докоснете Запазване</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Будилникът звъни в 8. Вземате хапчетата си. Кой бутон натискате?', options: [
            {t: 'Стоп', ok: true, why: 'Да. Стоп го изключва до утре в 8, защото се повтаря всеки ден.'},
            {t: 'Отлагане', why: 'Отлагане го кара да звънне пак след около 9 минути. Ползвайте го, ако ви трябва малко повече време, но Стоп го изключва до утре.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Браво!</strong> Будилникът за хапчетата ви звъни в 8 всяка сутрин. ' + (p === 'ios' ? 'Приложението <strong>Здраве</strong> също има раздел Лекарства, който ви напомня и води дневник.' : 'Можете и да попитате Google: „Напомни ми да взимам хапчетата си всеки ден в 8“.')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Ако телефонът ви се изгуби или счупи, снимките ви ще бъдат ли в безопасност? Нека проверим. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Докоснете името си</strong> най-горе.'},
        {screen: () => list(p, 'Профил в Apple', [{id: 'personal', label: 'Лична информация'}, {id: 'security', label: 'Вход и сигурност'}, {id: 'payment', label: 'Плащане и доставка'}, {id: 'subscriptions', label: 'Абонаменти'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Семейно споделяне'}, {id: 'findmy', label: 'Find My'}], {back: 'Настройки'}),
         target: 'icloud', say: '<strong>Докоснете iCloud.</strong> iCloud е онлайн хранилището на Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ХРАНИЛИЩЕ: ИЗПОЛЗВАНИ 4,2 GB ОТ 5 GB'}, {caption: 'ЗАПАЗЕНО В ICLOUD'}, {id: 'photos', label: 'Снимки', value: c.photoSync ? 'Вкл.' : 'Изкл.'}, {id: 'backup', label: 'Резервно копие в iCloud', value: c.backedUp ? 'Вкл.' : 'Изкл.'},
            {label: 'Контакти', value: 'Вкл.'}, {label: 'Бележки', value: 'Вкл.'}], {back: 'Профил в Apple'}),
         target: 'photos', say: 'Снимки и Резервно копие са <strong>изключени</strong>. Това значи, че изгубен телефон би означавал изгубени снимки. <strong>Докоснете Снимки.</strong>'},
        {screen: c => list(p, 'Снимки', [{id: 'sync', label: 'Синхронизиране на този iPhone', toggle: !!c.photoSync, sub: 'Пази снимките и видеоклиповете ви в iCloud, така че да са в безопасност, ако изгубите телефона си.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Докоснете Синхронизиране на този iPhone,</strong> за да го включите.'},
        {screen: c => list(p, 'Снимки', [{label: 'Синхронизиране на този iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Докоснете ‹ iCloud,</strong> за да се върнете.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ХРАНИЛИЩЕ: ИЗПОЛЗВАНИ 4,2 GB ОТ 5 GB'}, {caption: 'ЗАПАЗЕНО В ICLOUD'}, {id: 'photos', label: 'Снимки', value: 'Вкл.'}, {id: 'backup', label: 'Резервно копие в iCloud', value: 'Изкл.'}], {back: 'Профил в Apple'}),
         target: 'backup', say: 'Сега направете резервно копие на всичко останало: настройки, съобщения и приложения. <strong>Докоснете Резервно копие в iCloud.</strong>'},
        {screen: c => list(p, 'Резервно копие', [{id: 'backup-toggle', label: 'Резервно копие на този iPhone', toggle: !!c.backedUp, sub: 'Прави автоматично резервно копие всяка нощ, когато iPhone се зарежда, е заключен и е на Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Докоснете Резервно копие на този iPhone,</strong> за да го включите.'},
        {screen: () => list('ios', 'Резервно копие', [{label: 'Резервно копие на този iPhone', toggle: true}, {id: 'backup-now', label: 'Архивиране сега', sub: 'Последно успешно резервно копие: Никога'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Отсега нататък ще прави копие всяка нощ. Направете първото сега: <strong>докоснете Архивиране сега</strong>.'},
        {screen: c => list('ios', 'Резервно копие', [{label: 'Резервно копие на този iPhone', toggle: true}, {label: c.busy ? 'Архивиране…' : 'Архивиране сега', sub: c.busy ? 'Остават около 5 минути' : 'Последно успешно резервно копие: Току-що ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Съобщение гласи „Хранилището ви в iCloud е пълно. Снимките ви ще бъдат изтрити днес. Платете 99p тук: [link]“. Какво правите?', options: [
            {t: 'Игнорирам връзката. Проверявам в Настройки > името ми > iCloud, после препращам съобщението на 7726', ok: true, why: 'Да. Това е честа измама. Apple не изпраща връзки по съобщения и никога не изтрива снимките ви така. Проверете истинското си хранилище в Настройки.'},
            {t: 'Плащам бързо, за да запазя снимките', why: 'Това е измама, за да получат данните на картата ви. Проверете истинското си хранилище в Настройки > името ви > iCloud и препратете съобщението на 7726.'}]}},
        {screen: () => list('ios', 'Резервно копие', [{label: 'Резервно копие на този iPhone', toggle: true}, {label: 'Архивиране сега', sub: 'Последно успешно резервно копие: Току-що ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Браво!</strong> Снимките и телефонът ви имат резервно копие. Безплатните 5 GB се запълват бързо със снимки; ако се напълнят, повече място (iCloud+) струва малка месечна такса и го купувате само в Настройки, никога от съобщение.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Ако телефонът ви се изгуби или счупи, снимките ви ще бъдат ли в безопасност? Нека проверим. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Докоснете Google.</strong> Намира се близо до края.', hint: 'Превъртете списъка надолу: Google е близо до края.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Управление на профила ви в Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервно копие', sub: 'Изкл.'}, {id: 'autofill', label: 'Автоматично попълване'}, {id: 'devices', label: 'Устройства и споделяне'}]),
         target: 'backup', say: 'Резервното копие е <strong>изключено</strong>. <strong>Докоснете Резервно копие.</strong> <em>При Samsung е Настройки > Профили и архивиране.</em>'},
        {screen: c => list(p, 'Резервно копие', [{id: 'backup-toggle', label: 'Резервно копие от Google One', toggle: !!c.backedUp, sub: 'Копира приложения, съобщения, история на обажданията, контакти и настройки.'},
            {id: 'photos-backup', label: 'Снимки и видеоклипове', sub: c.photoSync ? 'Вкл. · Google Снимки' : 'Изкл. · Google Снимки'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Докоснете Резервно копие от Google One,</strong> за да го включите.'},
        {screen: c => list(p, 'Резервно копие', [{label: 'Резервно копие от Google One', toggle: true}, {id: 'photos-backup', label: 'Снимки и видеоклипове', sub: 'Изкл. · Google Снимки'}]),
         target: 'photos-backup', say: 'Снимките са отделно. <strong>Докоснете Снимки и видеоклипове.</strong>'},
        {screen: c => list(p, 'Резервно копие', [{id: 'photos-toggle', label: 'Резервно копие на снимки и видеоклипове', toggle: !!c.photoSync, sub: 'Запазва ги в Google Снимки, така че да са в безопасност, ако изгубите телефона си.'},
            {label: 'Качество на копието', value: 'Пестене на място'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Докоснете Резервно копие на снимки и видеоклипове,</strong> за да го включите.'},
        {screen: () => list(p, 'Резервно копие', [{label: 'Резервно копие на снимки и видеоклипове', toggle: true}, {id: 'backup-now', label: 'Резервно копие сега', sub: 'Последно копие: Никога'}]),
         target: 'backup-now', say: 'Отсега нататък прави копие сам, през Wi-Fi. Направете първото сега: <strong>докоснете Резервно копие сега</strong>.'},
        {screen: c => list(p, 'Резервно копие', [{label: 'Резервно копие на снимки и видеоклипове', toggle: true}, {label: c.busy ? 'Архивиране…' : 'Резервно копие сега', sub: c.busy ? '1,204 items left' : 'Последно копие: Току-що ⟦check⟧'}]), wait: 1500,
         question: {q: 'Съобщение гласи „Хранилището ви в Google е пълно. Снимките ви ще бъдат изтрити днес. Платете 99p тук: [link]“. Какво правите?', options: [
            {t: 'Игнорирам връзката. Проверявам в Настройки > Google > Резервно копие, после препращам съобщението на 7726', ok: true, why: 'Да. Това е честа измама. Google не изпраща такива връзки по съобщения. Проверете истинското си хранилище в Настройки.'},
            {t: 'Плащам бързо, за да запазя снимките', why: 'Това е измама, за да получат данните на картата ви. Проверете истинското си хранилище в Настройки и препратете съобщението на 7726.'}]}},
        {screen: () => list(p, 'Резервно копие', [{label: 'Резервно копие на снимки и видеоклипове', toggle: true}, {label: 'Резервно копие сега', sub: 'Последно копие: Току-що ⟦check⟧'}]), done: true,
         say: '<strong>Браво!</strong> Снимките и телефонът ви имат резервно копие. Google ви дава 15 GB безплатно; ако се напълнят, повече място струва малка месечна такса и го купувате само в Настройки или в приложението Google One, никога от съобщение.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 ПОЗДРАВЛЕНИЯ! 🎉</strong><p>Избрани сте да спечелите ваучер за пазаруване от £500!</p>
        <button type="button" class="aeb" data-tap="claim">ВЗЕМЕТЕ СЕГА</button><small>Реклама</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Информация за приложението', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Версия 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Отваряне</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Деинсталиране</button>
            <button type="button" data-tap="force-stop">Принудително спиране</button></div>
            <div class="cj ex"><span class="hf"><strong>Батерия</strong><small>38% използване от последното пълно зареждане</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Разрешения</strong><small>Показване върху други приложения, администратор на устройството</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Искате ли да деинсталирате това приложение?', [['cancel', 'Отказ'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>КАЛЕНДАР · сега</strong>
            <span>⚠️ iPhone може да е заразен! Докоснете тук, за да го почистите сега.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Реклами изскачат на началния ви екран, макар да не е отворено никакво приложение. Това обикновено значи, че се е промъкнало вредно приложение. Първо <strong>не докосвайте рекламата. Докоснете малкото ⟦x⟧, за да я затворите.</strong>',
         hints: {claim: 'Никога не докосвайте самата реклама. Потърсете малкото ⟦x⟧ в ъгъла.'}, hint: '⟦x⟧ е малко, в горния десен ъгъл на рекламата.'},
        {screen: () => home(p), target: 'settings', say: 'Вредните приложения работят постоянно, затова харчат много батерия. Така ги откривате. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Докоснете Батерия.</strong> <em>При Samsung е Батерия и грижа за устройството, после Батерия.</em>'},
        {screen: () => list(p, 'Батерия', [{id: 'usage', label: 'Използване на батерията', sub: 'Преглед на използването от последното пълно зареждане'}, {label: 'Икономия на батерията', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Докоснете Използване на батерията.</strong> <em>При някои Samsung докоснете графиката или Преглед на подробности.</em>'},
        {screen: () => list(p, 'Използване на батерията', [], {top: `<div class="nl">${[['System Service', 38], ['Екран', 21], ['WhatsApp', 12], ['YouTube', 8], ['Камера', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Кое от тези изглежда не на място?', options: [
            {t: 'System Service: никога не сте го ползвали, а харчи най-много батерия', ok: true, why: 'Да. Вредните приложения си дават скучни имена като „System Service“ или „Keyboard Settings“, за да не ги забележите. Запишете си името му.'},
            {t: 'Екран', why: 'Екранът винаги харчи много батерия; това е нормално. Странното е „System Service“, което никога не сте ползвали.'},
            {t: 'WhatsApp', why: 'WhatsApp е приложение, което ползвате, така че е нормално. Странното е „System Service“.'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Сега да го намерим в приложенията ви. Върнете се в Настройки и <strong>докоснете Приложения</strong>.'},
        {screen: () => list(p, 'Приложения', [{caption: 'Скоро отваряни приложения'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Всички 46 приложения'}, {id: 'default-apps', label: 'Приложения по подразбиране'}]),
         target: 'all-apps', say: '<strong>Докоснете Всички приложения.</strong>'},
        {screen: () => list(p, 'Всички приложения', ['Калкулатор', 'Календар', 'Камера', 'Chrome', 'Часовник', 'Контакти', 'Gmail', 'Карти'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Списъкът е подреден по азбучен ред. <strong>Докоснете System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Бутонът <strong>Деинсталиране</strong> е сив. Вредните приложения правят така, за да не ги премахнете. Първо <strong>докоснете Принудително спиране</strong>, за да спрете работата му.',
         hints: {uninstall: 'Сив е, така че още няма да сработи. Първо докоснете Принудително спиране.', open: 'Не го отваряйте. Докоснете Принудително спиране.'}},
        {screen: () => list(p, 'Търсене в настройките', [{caption: 'Резултати за „администратор на устройството“'}, {id: 'device-admin', label: 'Приложения за администриране на устройството', sub: 'Сигурност и поверителност > Още настройки за сигурност'}]),
         target: 'device-admin',
         say: 'Сега му отнемете специалното разрешение. В Настройки <strong>потърсете „администратор на устройството“</strong> чрез полето за търсене най-горе. Ето резултата: <strong>докоснете Приложения за администриране на устройството</strong>.'},
        {screen: c => list(p, 'Приложения за администриране на устройството', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Да се деактивира ли това приложение за администриране на устройството?', 'System Service вече няма да може да ви пречи да го деинсталирате.', [['cancel', 'Отказ'], ['deactivate', 'Деактивиране']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device е на Google и е наред. <strong>Докоснете превключвателя до System Service.</strong>', hints: {'find-my': 'Оставете Find My Device включено. Докоснете System Service.'}},
        {screen: c => list(p, 'Приложения за администриране на устройството', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Да се деактивира ли това приложение за администриране на устройството?', 'System Service вече няма да може да ви пречи да го деинсталирате.', [['cancel', 'Отказ'], ['deactivate', 'Деактивиране']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Докоснете Деактивиране.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Обратно в System Service, <strong>Деинсталиране</strong> вече работи. <strong>Докоснете Деинсталиране.</strong>', hints: {'force-stop': 'Вече е спряно. Докоснете Деинсталиране.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Докоснете OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Изчезна! Накрая накарайте Google да провери за нещо друго. <strong>Отворете Play Магазин.</strong>'},
        {screen: c => app(p, 'Play Защита', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Не са намерени вредни приложения' : 'Сканиране на телефона'}</strong>
            <small>${c.scanned ? 'Проверено току-що' : 'Последно сканиране: преди 3 седмици'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'В Play Магазин докоснете <strong>снимката на профила си</strong> (горе вдясно), после <strong>Play Защита</strong>. Тук е отворено. <strong>Докоснете Сканиране.</strong>'},
        {screen: () => app(p, 'Play Защита', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Не са намерени вредни приложения</strong><small>Проверено току-що</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Браво!</strong> Намерихте вредното приложение по използването на батерията, отнехте му специалното разрешение, деинсталирахте го и проверихте телефона си. За да ги избягвате: инсталирайте приложения само от Play Магазин и се пазете от безплатни приложения „фенерче“, „чистачи“ и „ускорители“.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Известие от Календара ви гласи „iPhone може да е заразен! Докоснете тук, за да го почистите сега.“ Какво е това?', options: [
            {t: 'Спам, промъкнал се във вашия календар. Не го докосвайте', ok: true, why: 'Да. Докосването на „Разреши“ в съмнителен уебсайт може да добави спам календар към iPhone. „Събитията“ му са реклами, които изглеждат като предупреждения. iPhone ви е наред.'},
            {t: 'Истинско предупреждение от Apple', why: 'Apple не изпраща предупреждения за вируси през Календара. Това е спам от абониран календар. Не го докосвайте.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Да премахнем спам календара. <strong>Докоснете Настройки,</strong> не известието.', hints: {notif: 'Не докосвайте предупреждението. Докоснете Настройки.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Превъртете надолу и <strong>докоснете Приложения</strong>.', hint: 'Приложения е в последната група.'},
        {screen: () => list(p, 'Приложения', ['App Store', 'Книги'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Календар'}, {label: 'Камера'}, {label: 'Контакти'}, {label: 'Поща'}]), {back: 'Настройки'}),
         target: 'calendar', say: '<strong>Докоснете Календар.</strong>'},
        {screen: () => list(p, 'Календар', [{id: 'accounts', label: 'Профили на календара', value: '2'}, {label: 'Заменяне на часовата зона', value: 'Изкл.'}, {label: 'Часове за известия по подразбиране'}], {back: 'Приложения'}),
         target: 'accounts', say: '<strong>Докоснете Профили на календара.</strong>'},
        {screen: () => list(p, 'Профили на календара', [{caption: 'ПРОФИЛИ'}, {label: 'iCloud', sub: 'Календари, Контакти и още 7'}, {id: 'subscribed', label: 'Абонирани календари', value: '1'}], {back: 'Календар'}),
         target: 'subscribed', say: 'iCloud е вашият собствен. <strong>Докоснете Абонирани календари.</strong>'},
        {screen: () => list(p, 'Абонирани календари', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Абониран'}], {back: 'Профили на календара'}),
         target: 'spam-cal', say: 'Ето го: календар, който никога не сте имали намерение да добавяте. <strong>Докоснете Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сървър', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Изтриване на профила', danger: true}],
            {back: 'Назад', overlay: c.askDelete ? dialog(p, 'Сигурни ли сте?', 'Това ще изтрие календара и събитията му от iPhone.', [['cancel', 'Отказ'], ['confirm-delete', 'Изтриване на профила']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Докоснете Изтриване на профила.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сървър', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Изтриване на профила', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Сигурни ли сте?', 'Това ще изтрие календара и събитията му от iPhone.', [['cancel', 'Отказ'], ['confirm-delete', 'Изтриване на профила']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Докоснете Изтриване на профила,</strong> за да потвърдите.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Изчезна. Още една проверка: съмнителни уебсайтове могат да инсталират и „профил“. <strong>Докоснете Общи.</strong>'},
        {screen: () => list(p, 'Общи', [{id: 'about', label: 'Информация'}, {id: 'update', label: 'Обновяване на софтуера'}, {id: 'storage', label: 'Хранилище на iPhone'}, {id: 'vpn', label: 'VPN и управление на устройството'}], {back: 'Настройки'}),
         target: 'vpn', say: '<strong>Докоснете VPN и управление на устройството.</strong>'},
        {screen: c => list(p, 'VPN и управление на устройството', c.profileGone ? [{label: 'VPN', value: 'Няма връзка'}] : [{label: 'VPN', value: 'Няма връзка'}, {caption: 'КОНФИГУРАЦИОНЕН ПРОФИЛ'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Непотвърден'}], {back: 'Общи'}),
         target: 'profile', say: 'Ако видите тук профил, който не разпознавате (от работата или училището е наред), премахнете го. <strong>Докоснете Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Профил', [{label: 'Free Phone Booster', sub: 'Непотвърден · Съдържа: Web Clips, Сертификати'}, {caption: ' '}, {id: 'remove-profile', label: 'Премахване на профила', danger: true}],
            {back: 'Назад', overlay: c.askRemove ? dialog(p, 'Премахване на профила', 'Премахването на този профил ще изтрие всичките му настройки.', [['cancel', 'Отказ'], ['confirm-remove', 'Премахване']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Докоснете Премахване на профила</strong>. iPhone ще поиска кода ви.'},
        {screen: c => list(p, 'Профил', [{label: 'Free Phone Booster', sub: 'Непотвърден'}, {caption: ' '}, {label: 'Премахване на профила', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Премахване на профила', 'Премахването на този профил ще изтрие всичките му настройки.', [['cancel', 'Отказ'], ['confirm-remove', 'Премахване']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Докоснете Премахване.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Браво!</strong> Фалшивите предупреждения изчезнаха. За да не се повтори: в уебсайтове докоснете <strong>Не разрешавай</strong> или <strong>Затвори</strong> при всеки изскачащ прозорец, който иска да добави календар или профил, и инсталирайте приложения само от App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Анулиран · Изтича на 22 октомври'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 на седмица · Подновява се на 22 октомври'};
        return list(p, 'Абонаменти', [{caption: p === 'ios' ? 'АКТИВНИ' : 'Активен'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 на месец' : '£1.59 на месец'},
            {caption: p === 'ios' ? 'НЕАКТИВНИ' : 'Изтекъл'}, {label: 'Crossword Daily', sub: 'Изтекъл на 3 март'}], {back: p === 'ios' ? 'Профил в Apple' : 'Назад'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'ВАШИЯТ АБОНАМЕНТ' : 'План'}, {label: 'Седмичен', sub: '£4.99 на седмица. Започна като 3-дневен безплатен пробен период.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Анулиране на абонамента' : 'Анулиране на абонамента', danger: true}],
            {back: 'Абонаменти', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Потвърждаване на анулирането' : 'Да анулирате ли абонамента?', 'Можете да го ползвате до 22 октомври. Повече няма да ви таксуват.', [['keep', p === 'ios' ? 'Не сега' : 'Запазване']].concat([['confirm-cancel', p === 'ios' ? 'Потвърждаване' : 'Анулиране на абонамента']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Безплатните пробни периоди често се превръщат в платени планове, без да забележите. Нека проверим. <strong>Докоснете Настройки.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Докоснете името си</strong> най-горе.'},
            {screen: () => list(p, 'Профил в Apple', [{id: 'personal', label: 'Лична информация'}, {id: 'security', label: 'Вход и сигурност'}, {id: 'payment', label: 'Плащане и доставка'}, {id: 'subscriptions', label: 'Абонаменти'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Настройки'}),
             target: 'subscriptions', say: '<strong>Докоснете Абонаменти.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Безплатните пробни периоди често се превръщат в платени планове, без да забележите. Нека проверим. <strong>Отворете Play Магазин.</strong>'},
            {screen: c => app(p, 'Play Магазин', `<div class="hp"><span>ПРЕПОРЪЧАНО ЗА ВАС</span><strong>Приложения за начало</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Докоснете снимката на профила си,</strong> кръглата буква горе вдясно.'},
            {screen: c => app(p, 'Play Магазин', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Докоснете Плащания и абонаменти.</strong>'},
            {screen: () => list(p, 'Плащания и абонаменти', [{id: 'methods', label: 'Методи на плащане'}, {id: 'subscriptions', label: 'Абонаменти', sub: 'Управление на абонаментите ви'}, {id: 'budget', label: 'Бюджет и история'}]),
             target: 'subscriptions', say: '<strong>Докоснете Абонаменти.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '„Photo Editor Pro“ започна като безплатен пробен период и сега е <strong>£4.99 всяка седмица</strong>. Това са над £250 на година! <strong>Докоснете го.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Анулиране на абонамента' : 'Анулиране на абонамента'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Потвърждаване' : 'Анулиране на абонамента'}.</strong>`, hints: {keep: 'Това продължава да взима пари. Докоснете ' + (p === 'ios' ? 'Потвърждаване' : 'Анулиране на абонамента') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Изтривате приложението Photo Editor от телефона си. Спира ли това плащанията?', options: [
            {t: 'Не. Трябва да анулирате абонамента, както току-що направихте', ok: true, why: 'Точно така. Изтриването на приложението НЕ анулира абонамента. Продължавате да плащате, докато не го анулирате тук.'},
            {t: 'Да, изтриването на приложението го спира', why: 'Не го спира! Продължавате да плащате, докато не анулирате самия абонамент, тук.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Браво!</strong> Спестихте £4.99 на седмица. Съвет: когато започнете безплатен пробен период, задайте будилник за деня преди да изтече. Проверявайте от време на време и списъка с редовни плащания в банковото си приложение.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'По-новите iPhone имат <strong>Apple Intelligence</strong>: ИИ, който пише, обобщава и редактира вместо вас. Можете да го изключите. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Докоснете Apple Intelligence и Siri.</strong>', hint: 'Намира се в третата група, под Достъпност.'},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Инструменти за писане, обобщения на известия, Image Playground и още.'},
            {caption: 'РАЗШИРЕНИЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Изкл.' : 'Вкл.'}, {caption: 'SIRI'}, {label: 'Говорене със Siri', value: '„Siri“ или „Hey Siri“'}],
            {back: 'Настройки', overlay: c.askOff ? dialog(p, 'Да изключите ли Apple Intelligence?', 'Функции като Инструменти за писане и обобщения вече няма да са налични.', [['cancel', 'Отказ'], ['confirm-off', 'Изключване']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Докоснете превключвателя на Apple Intelligence,</strong> за да го изключите.', hints: {chatgpt: 'С ChatGPT ще се заемем след това. Първо докоснете превключвателя на Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'РАЗШИРЕНИЯ'}, {label: 'ChatGPT', value: 'Вкл.'}],
            {back: 'Настройки', overlay: dialog(p, 'Да изключите ли Apple Intelligence?', 'Функции като Инструменти за писане и обобщения вече няма да са налични.', [['cancel', 'Отказ'], ['confirm-off', 'Изключване']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Докоснете Изключване.</strong>'},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'РАЗШИРЕНИЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Вкл.'}], {back: 'Настройки'}),
         target: 'chatgpt', say: 'Разширението ChatGPT може да изпраща въпросите ви на ChatGPT, компания извън Apple. <strong>Докоснете ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Ползване на ChatGPT', toggle: !c.gptOff, sub: 'Siri може да изпраща заявки до ChatGPT.'}], {back: 'Назад'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Докоснете Ползване на ChatGPT,</strong> за да го изключите.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Ползване на ChatGPT', toggle: false}], {back: 'Назад'}),
         question: {q: 'WhatsApp, Facebook и други приложения също имат чатове с ИИ. Кое е безопасното правило?', options: [
            {t: 'Никога не пиша лични данни (банка, здраве, пароли, адреси) в чат с ИИ', ok: true, why: 'Да. Написаното може да се съхранява и да се ползва за обучение на ИИ. Отнасяйте се като към разговор с непознат.'},
            {t: 'Чатовете с ИИ са лични, така че всичко е наред', why: 'Не са лични като телефонен разговор. Написаното може да се съхранява. Не пишете лични данни в тях.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Ползване на ChatGPT', toggle: false}], {back: 'Назад'}), done: true,
         say: '<strong>Браво!</strong> Apple Intelligence и ChatGPT са изключени. Можете да ги включите отново по всяко време на същото място. Siri работи както обикновено.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Android телефоните вече идват с <strong>Gemini</strong>, ИИ на Google. Задържането на бутона за захранване може да го отвори по погрешка. Да променим това. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Докоснете Приложения.</strong>'},
        {screen: () => list(p, 'Приложения', [{caption: 'Скоро отваряни приложения'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Всички 45 приложения'}, {id: 'default-apps', label: 'Приложения по подразбиране', sub: 'Асистент, браузър и приложения за телефон'}]),
         target: 'default-apps', say: '<strong>Докоснете Приложения по подразбиране.</strong>'},
        {screen: () => list(p, 'Приложения по подразбиране', [{label: 'Приложение за браузър', sub: 'Chrome'}, {id: 'assistant', label: 'Приложение за дигитален асистент', sub: 'Gemini'}, {label: 'Приложение за телефон', sub: 'Телефон'}, {label: 'Приложение за SMS', sub: 'Съобщения'}]),
         target: 'assistant', say: '<strong>Докоснете Приложение за дигитален асистент.</strong>'},
        {screen: c => list(p, 'Приложение за дигитален асистент', [{id: 'assistant-app', label: 'Приложение за дигитален асистент по подразбиране', sub: c.noAssist ? 'Няма' : 'Gemini'}, {label: 'Ползване на текст от екрана', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Приложение за дигитален асистент по подразбиране</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Няма</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Докоснете Приложение за дигитален асистент по подразбиране.</strong>'},
        {screen: c => list(p, 'Приложение за дигитален асистент', [{label: 'Приложение за дигитален асистент по подразбиране', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Приложение за дигитален асистент по подразбиране</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Няма</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Докоснете Няма.</strong> Gemini няма да изскача, когато задържите бутона за захранване.', hints: {'assist-gemini': 'Това запазва Gemini. Докоснете Няма.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'След това не позволявайте на Gemini да пази написаното от вас. <strong>Отворете приложението Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Здравейте, Margaret<br><small>С какво мога да ви помогна днес?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Докоснете снимката на профила си</strong> горе вдясно.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Докоснете Активност в приложенията с Gemini.</strong> <em>При някои телефони се казва Запазване на активността.</em>'},
        {screen: c => app(p, 'Активност в приложенията с Gemini', `<p class="cf"><strong>${c.actOff ? 'Изкл.' : 'Вкл.'}</strong><br>${c.actOff ? 'Чатовете ви вече не се запазват в профила ви и не се ползват за подобряване на ИИ на Google.' : 'Чатовете ви се запазват в профила ви в Google и може да бъдат преглеждани за подобряване на ИИ на Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Изключване</button><button type="button" class="cj" data-tap="off-delete">Изключване и изтриване на активността</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Докоснете Изключване.</strong>'},
        {screen: c => app(p, 'Активност в приложенията с Gemini', '<p class="cf"><strong>Вкл.</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Изключване</button><button type="button" class="cj" data-tap="off-delete">Изключване и изтриване на активността</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Докоснете Изключване и изтриване на активността,</strong> за да изчистите и вече запазеното.', hints: {'off-only': 'Това спира запазването на нови чатове, но оставя старите. Докоснете Изключване и изтриване на активността.'}},
        {screen: c => app(p, 'Активност в приложенията с Gemini', '<p class="cf"><strong>Изкл.</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook и други приложения също имат чатове с ИИ. Кое е безопасното правило?', options: [
            {t: 'Никога не пиша лични данни (банка, здраве, пароли, адреси) в чат с ИИ', ok: true, why: 'Да. Написаното може да се съхранява и да се ползва за обучение на ИИ. Отнасяйте се като към разговор с непознат.'},
            {t: 'Чатовете с ИИ са лични, така че всичко е наред', why: 'Не са лични като телефонен разговор. Написаното може да се съхранява. Не пишете лични данни в тях.'}]}},
        {screen: c => app(p, 'Активност в приложенията с Gemini', '<p class="cf"><strong>Изкл.</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Браво!</strong> Gemini вече не изскача от бутона за захранване и не пази чатовете ви. При Samsung погледнете и в <strong>Настройки > Galaxy AI</strong>, където всяка функция има собствен превключвател.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Профилът ви в Apple пази снимките, контактите и плащанията ви. Нека проверим дали е защитен. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Докоснете името си</strong> най-горе.'},
        {screen: () => list(p, 'Профил в Apple', [{id: 'personal', label: 'Лична информация'}, {id: 'security', label: 'Вход и сигурност'}, {id: 'payment', label: 'Плащане и доставка'}, {id: 'subscriptions', label: 'Абонаменти'}], {back: 'Настройки'}),
         target: 'security', say: '<strong>Докоснете Вход и сигурност.</strong>'},
        {screen: () => list(p, 'Вход и сигурност', [{label: 'Имейл и телефонни номера', sub: '+44 7700 900123'}, {label: 'Промяна на паролата'}, {caption: ' '}, {label: 'Двуфакторно удостоверяване', value: 'Вкл.'},
            {id: 'recovery', label: 'Възстановяване на профила'}], {back: 'Профил в Apple'}),
         target: 'recovery', say: '<strong>Двуфакторното удостоверяване</strong> е Включено: добре. Това значи, че ново устройство се нуждае от код от телефона ви, преди да влезе. Сега <strong>докоснете Възстановяване на профила</strong>.'},
        {screen: c => list(p, 'Възстановяване на профила', [{caption: 'КОНТАКТ ЗА ВЪЗСТАНОВЯВАНЕ'}, c.recovery ? {label: 'Sarah', sub: 'Изчакване Sarah да приеме'} : {id: 'add-contact', label: 'Добавяне на контакт за възстановяване…', sub: 'Човек, на когото вярвате и който може да ви помогне да влезете отново в профила си.'}],
            {back: 'Назад', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Изберете контакт за възстановяване</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (дъщеря)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Ако някога забравите паролата си, <strong>контактът за възстановяване</strong> може да ви получи код, който да ви помогне да влезете. Той не вижда данните ви. <strong>Докоснете Добавяне на контакт за възстановяване.</strong>'},
        {screen: c => list(p, 'Възстановяване на профила', [{caption: 'КОНТАКТ ЗА ВЪЗСТАНОВЯВАНЕ'}, {label: 'Добавяне на контакт за възстановяване…'}],
            {back: 'Назад', overlay: `<div class="ei"><div class="cv"><p><strong>Изберете контакт за възстановяване</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (дъщеря)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Изберете човек, на когото вярвате и който има iPhone. <strong>Докоснете Sarah.</strong>', hints: {'pick-dave': 'За това упражнение изберете Sarah.'}},
        {screen: c => list(p, 'Възстановяване на профила', [{caption: 'КОНТАКТ ЗА ВЪЗСТАНОВЯВАНЕ'}, {label: 'Sarah', sub: 'Изчакване Sarah да приеме'}], {back: 'Назад'}),
         question: {q: 'Някой се обажда и казва, че е от Apple. Моли ви да прочетете 6-цифрения код, който току-що се е появил на телефона ви. Какво правите?', options: [
            {t: 'Затварям. Никога не давам този код на никого', ok: true, why: 'Точно така. Този код пуска някого във вашия профил. Apple никога няма да се обади и да го поиска.'},
            {t: 'Прочитам го, от Apple са', why: 'Apple никога няма да поиска този код. Всеки, който го има, може да влезе в профила ви. Затворете.'}]}},
        {screen: c => list(p, 'Възстановяване на профила', [{caption: 'КОНТАКТ ЗА ВЪЗСТАНОВЯВАНЕ'}, {label: 'Sarah', sub: 'Изчакване Sarah да приеме'}], {back: 'Назад'}), done: true,
         say: '<strong>Браво!</strong> Двуфакторното удостоверяване е включено и Sarah може да ви помогне да влезете отново. iPhone може да запомня паролите вместо вас в приложението <strong>Пароли</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Профилът ви в Google пази имейлите, снимките и контактите ви. Нека му сложим втора ключалка. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Докоснете Google.</strong>', hint: 'Google е близо до края на списъка.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Управление на профила ви в Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервно копие'}, {id: 'autofill', label: 'Автоматично попълване'}]),
         target: 'manage', say: '<strong>Докоснете Управление на профила ви в Google.</strong>'},
        {screen: () => app(p, 'Профил в Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Докоснете Сигурност</strong> най-горе.'},
        {screen: c => list(p, 'Сигурност', [{caption: 'Как влизате в Google'}, {id: '2sv', label: 'Потвърждаване в две стъпки', sub: c.twoOn ? 'Вкл.' : 'Изкл.'}, {label: 'Парола', sub: 'Последно променено преди 2 години'}, {label: 'Телефон за възстановяване', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Потвърждаването в две стъпки</strong> е изключено. Това значи, че влизането от ново устройство изисква и код, изпратен на телефона ви, така че откраднатата парола не стига. <strong>Докоснете го.</strong>'},
        {screen: () => list(p, 'Потвърждаване в две стъпки', [], {top: '<p class="cf">Вашият телефонен номер: <strong>07700 900123</strong><br>Ще изпратим код по SMS на този номер, за да проверим, че е ваш.</p><button type="button" class="ce dk" data-tap="send-code">Изпращане на код</button>'}),
         target: 'send-code', say: '<strong>Докоснете Изпращане на код.</strong>'},
        {screen: c => list(p, 'Потвърждаване в две стъпки', [], {top: `<div class="sd"><strong>СЪОБЩЕНИЯ · сега</strong><span>G-382605 е вашият код за потвърждение от Google.</span></div>
            <p class="cf">Въведете кода, който изпратихме по SMS на 07700 900123</p>${field('gcode', 'Въведете код', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Напред</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Въведете 6-те цифри от съобщението: 382605.',
         say: 'Пристига съобщение с код. <strong>Въведете 382605 в полето</strong> и <strong>докоснете Напред</strong>. <em>(Това е тренировъчен код. Никога не въвеждайте истински код никъде другаде, освен там, където сами сте го поискали.)</em>'},
        {screen: () => list(p, 'Потвърждаване в две стъпки', [], {top: '<p class="cf">Телефонният ви номер е проверен ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Включване на потвърждаването в две стъпки</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Докоснете Включване на потвърждаването в две стъпки.</strong>'},
        {screen: c => list(p, 'Сигурност', [{caption: 'Как влизате в Google'}, {label: 'Потвърждаване в две стъпки', sub: 'Вкл. ⟦check⟧'}, {label: 'Телефон за възстановяване', sub: '07700 900123'}]),
         question: {q: 'Някой се обажда и казва, че е от Google. Моли ви да прочетете кода, който току-що е изпратен на телефона ви. Какво правите?', options: [
            {t: 'Затварям. Никога не давам този код на никого', ok: true, why: 'Точно така. Този код пуска някого във вашия профил. Google никога няма да се обади и да го поиска.'},
            {t: 'Прочитам го, от Google са', why: 'Google никога няма да поиска този код. Всеки, който го има, може да влезе в профила ви. Затворете.'}]}},
        {screen: c => list(p, 'Сигурност', [{caption: 'Как влизате в Google'}, {label: 'Потвърждаване в две стъпки', sub: 'Вкл. ⟦check⟧'}]), done: true,
         say: '<strong>Браво!</strong> Профилът ви в Google вече изисква и телефона ви, не само паролата. Google може да запомня и паролите ви: потърсете <strong>Мениджър на пароли на Google</strong> в Настройки.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Прекрасна разходка по крайбрежната улица тази сутрин! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Следваща разходка: събота, 10 ч., от пристанището.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Няма нови покани за приятелство.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Вижте профила си</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Настройки и поверителност</strong></button><div class="ck"><strong>Помощ и поддръжка</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Да се уверим, че само приятелите ви виждат какво публикувате. <strong>Отворете Facebook.</strong> <em>(Тренировъчна версия. Не е истинското приложение.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Докоснете Меню</strong> долу вдясно.', hints: {'tab-friends': 'След малко ще видим поканите за приятелство. Първо докоснете Меню.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Докоснете Настройки и поверителност</strong>.'},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимост'}, {id: 'posts', label: 'Публикации', sub: 'Кой може да вижда бъдещите ви публикации: ' + (c.audience || 'Публично')}, {label: 'Подробности за профила'}, {label: 'Как хората ви намират и се свързват с вас'},
            {caption: 'Вашата активност'}, {label: 'Дневник на активността'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Кой може да вижда бъдещите ви публикации?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Публично<small>Всеки във Facebook или извън него</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Приятели<small>Вашите приятели във Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Само аз</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Публикациите ви са <strong>Публични</strong>: всеки по света може да ги вижда. <strong>Докоснете Публикации.</strong>'},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимост'}, {label: 'Публикации', sub: 'Кой може да вижда бъдещите ви публикации: Публично'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Кой може да вижда бъдещите ви публикации?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Публично<small>Всеки във Facebook или извън него</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Приятели<small>Вашите приятели във Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Само аз</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Приятели'; }, say: '<strong>Докоснете Приятели.</strong>',
         hints: {'aud-public': 'Публично е това, което беше. Докоснете Приятели.', 'aud-me': '„Само аз“ значи, че никой друг не вижда публикациите ви. Докоснете Приятели.'}},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимост'}, {label: 'Публикации', sub: 'Кой може да вижда бъдещите ви публикации: Приятели ⟦check⟧'}, {id: 'back-feed', label: '‹ Обратно към Facebook'}]),
         target: 'back-feed', say: 'Готово. Сега <strong>докоснете Обратно към Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Имате покана за приятелство. <strong>Докоснете Приятели.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Покана за приятелство от „Jean Smith“. Но вече сте приятели с Jean (тя е във вашата лента). Какво става?', options: [
            {t: 'Вероятно е копие на профила на Jean, направено от измамник', ok: true, why: 'Да. Измамниците копират нечие име и снимка, после пишат на приятелите му с молба за пари. Истинската Jean вече ви е приятел.'},
            {t: 'Jean сигурно има втори профил', why: 'Възможно е, но е много по-вероятно да е копие от измамник: появил се е преди 2 дни. Проверете с Jean по телефона.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Докоснете Изтриване,</strong> за да отхвърлите поканата.', hints: {'confirm-jean': 'Не потвърждавайте копиран профил. Докоснете Изтриване.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Браво!</strong> Публикациите ви са само за приятели и избегнахте фалшив профил. Кажете на Jean, за да го докладва. Пазете се и от купувачи в Marketplace, които искат да платят „чрез куриер“ или искат кодове, изпратени на телефона ви.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Търсене тук'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Автобусна и жп гара, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Болница, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Църква, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Автобусна и жп гара · 25 мили</small><button type="button" class="ce co" data-tap="directions">Упътвания</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 мин (25 мили)</strong><small>Най-бърз маршрут, по A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Пеша 4 мин до <strong>Bridlington Bus Station</strong>, перон 3</li>
                <li>⟦bus⟧ <strong>121</strong> към Hull · 10:15 · <b class="ahy">На време</b></li><li>Слезте на <strong>Hull Paragon Interchange</strong> (24 спирки)</li></ol>
                <button type="button" class="ce co" data-tap="start">Старт</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Картите могат да планират пътуване с автобус с часове на живо. Да отидем до Hull с автобус. <strong>Отворете Карти.</strong>' + (p === 'ios' ? ' <em>(Google Maps работи по същия начин, ако предпочитате него.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Докоснете полето за търсене</strong> най-горе.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Написахме „Hull interchange“. <strong>Докоснете Hull Paragon Interchange</strong>, автогарата.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Докоснете Упътвания.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Първо показва шофиране. <strong>Докоснете автобуса</strong> ⟦bus⟧, за да видите градския транспорт.', hints: {'mode-walk': 'Осем часа! Докоснете автобуса.', 'mode-car': 'Това е шофиране. Докоснете автобуса.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Ето автобусите, като най-близкият е първи. „На време“ е на живо. <strong>Докоснете 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Откъде се качвате на автобуса?', options: [
            {t: 'Bridlington Bus Station, перон 3', ok: true, why: 'Да. Картите ви казват накъде да вървите, кой автобус и къде да слезете.'},
            {t: 'Hull Paragon Interchange', why: 'Там слизате. Качвате се на Bridlington Bus Station, перон 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Браво!</strong> Докоснете <strong>Старт</strong> при истинско пътуване и Картите ще ви кажат кога наближава спирката ви. С карта за автобус просто я показвате на шофьора както обикновено. <em>(Само примерни часове: проверете истинските в деня на пътуването.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>SOS при спешност</strong> звъни на 999 вместо вас и изпраща местоположението ви по съобщение на избраните от вас хора. Да проверим дали е готово. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Докоснете SOS при спешност.</strong>', hint: 'Намира се в третата група, с червена икона.'},
        {screen: c => list(p, 'SOS при спешност', [{label: 'Обаждане със задържане и пускане', toggle: true, sub: 'Задръжте страничния бутон и бутон за звука, после пуснете.'},
            {id: 'five', label: 'Обаждане с 5 натискания на бутон', toggle: !!c.five, sub: 'Натиснете бързо страничния бутон 5 пъти.'}, {caption: ' '},
            {id: 'contacts', label: 'Настройване на спешни контакти в Здраве'}, {label: 'Откриване на катастрофа', toggle: true, sub: 'Звъни на 999 след тежка автомобилна катастрофа.'}], {back: 'Настройки'}),
         target: 'five', action: c => { c.five = true; }, say: 'Натискането на страничния бутон 5 пъти е лесно за запомняне, когато сте в паника. <strong>Включете „Обаждане с 5 натискания на бутон“.</strong>'},
        {screen: c => list(p, 'SOS при спешност', [{label: 'Обаждане със задържане и пускане', toggle: true}, {label: 'Обаждане с 5 натискания на бутон', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Настройване на спешни контакти в Здраве'}], {back: 'Настройки', overlay: c.pick ? sheet('Добавяне на спешен контакт', [['pick-sarah', 'Sarah', 'Дъщеря · 07700 900333'], ['pick-dave', 'Dave', 'Приятел']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Сега изберете кой получава съобщение с местоположението ви. <strong>Докоснете Настройване на спешни контакти.</strong>'},
        {screen: () => list(p, 'SOS при спешност', [{label: 'Обаждане с 5 натискания на бутон', toggle: true}], {back: 'Настройки', overlay: sheet('Добавяне на спешен контакт', [['pick-sarah', 'Sarah', 'Дъщеря · 07700 900333'], ['pick-dave', 'Dave', 'Приятел']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Докоснете Sarah,</strong> дъщеря ви.', hints: {'pick-dave': 'За това упражнение изберете Sarah.'}},
        {screen: () => list(p, 'SOS при спешност', [{label: 'Обаждане с 5 натискания на бутон', toggle: true}, {caption: 'СПЕШНИ КОНТАКТИ'}, {label: 'Sarah', sub: 'Дъщеря'}], {back: 'Настройки'}),
         question: {q: 'Паднали сте и не можете да стигнете екрана на телефона. Какво правите?', options: [
            {t: 'Натискам бързо страничния бутон 5 пъти', ok: true, why: 'Да. Започва обратно броене, после звъни на 999 и изпраща на Sarah къде сте.'},
            {t: 'Отключвам телефона и намирам приложението Телефон', why: 'Това е бавно при спешен случай. Натискането на страничния бутон 5 пъти работи дори когато телефонът е заключен.'}]}},
        {screen: () => list(p, 'SOS при спешност', [{label: 'Обаждане с 5 натискания на бутон', toggle: true}, {caption: 'СПЕШНИ КОНТАКТИ'}, {label: 'Sarah', sub: 'Дъщеря'}], {back: 'Настройки'}), done: true,
         say: '<strong>Браво!</strong> SOS при спешност е готово и Sarah ще бъде уведомена къде сте. Ако го натиснете по погрешка, просто докоснете Стоп по време на обратното броене.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>SOS при спешност</strong> звъни на 999 вместо вас и изпраща местоположението ви по съобщение на избраните от вас хора. Да проверим дали е готово. <strong>Докоснете Настройки.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Докоснете Безопасност и спешни случаи.</strong> <em>При Samsung също е Безопасност и спешни случаи.</em>', hint: 'Превъртете надолу: близо до края е.'},
        {screen: () => list(p, 'Безопасност и спешни случаи', [{id: 'medical', label: 'Медицинска информация'}, {id: 'contacts-ec', label: 'Спешни контакти'}, {id: 'sos', label: 'SOS при спешност', sub: 'Изкл.'}, {label: 'Откриване на автомобилна катастрофа'}]),
         target: 'sos', say: 'SOS при спешност е <strong>изключено</strong>. <strong>Докоснете SOS при спешност.</strong>'},
        {screen: c => list(p, 'SOS при спешност', [{id: 'sos-toggle', label: 'Ползване на SOS при спешност', toggle: !!c.sosOn, sub: 'Натиснете бутона за захранване 5 или повече пъти, за да започнат спешните действия.'}, {label: 'Споделяне на информация със спешните контакти', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Докоснете Ползване на SOS при спешност,</strong> за да го включите.'},
        {screen: () => list(p, 'Безопасност и спешни случаи', [{id: 'medical', label: 'Медицинска информация'}, {id: 'contacts-ec', label: 'Спешни контакти', sub: 'Няма'}, {label: 'SOS при спешност', sub: 'Вкл.'}]),
         target: 'contacts-ec', say: 'Сега изберете кой получава съобщение с местоположението ви. <strong>Докоснете Спешни контакти.</strong>'},
        {screen: c => list(p, 'Спешни контакти', [{id: 'add', label: '＋ Добавяне на контакт'}], {overlay: c.pick ? sheet('Изберете контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Докоснете Добавяне на контакт.</strong>'},
        {screen: () => list(p, 'Спешни контакти', [{label: '＋ Добавяне на контакт'}], {overlay: sheet('Изберете контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Докоснете Sarah,</strong> дъщеря ви.', hints: {'pick-dave': 'За това упражнение изберете Sarah.'}},
        {screen: () => list(p, 'Спешни контакти', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Добавяне на контакт'}]),
         question: {q: 'Паднали сте и не можете да стигнете екрана на телефона. Какво правите?', options: [
            {t: 'Натискам бързо бутона за захранване 5 пъти', ok: true, why: 'Да. Започва обратно броене, после звъни на 999 и споделя къде сте със Sarah.'},
            {t: 'Отключвам телефона и намирам приложението Телефон', why: 'Това е бавно при спешен случай. Натискането на бутона за захранване 5 пъти работи дори когато телефонът е заключен.'}]}},
        {screen: () => list(p, 'Спешни контакти', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Браво!</strong> SOS при спешност е включено и Sarah ще бъде уведомена къде сте. Ако го натиснете по погрешка, докоснете Отказ по време на обратното броене.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Спешните известия ви предупреждават за опасност наблизо, например тежко наводнение. Някой е изключил такова на този телефон. Да го оправим. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Докоснете Известия.</strong>'},
            {screen: c => list(p, 'Известия', [{label: 'Показване на прегледи', value: 'Винаги'}, {caption: 'СТИЛ НА ИЗВЕСТИЯТА'}, {label: 'Съобщения', sub: 'Банери, звуци, значки'}, {label: 'WhatsApp', sub: 'Банери, звуци, значки'},
                {caption: 'ПРАВИТЕЛСТВЕНИ СИГНАЛИ'}, {label: 'Екстремни сигнали', toggle: true}, {id: 'severe', label: 'Сериозни сигнали', toggle: !!c.severe}, {label: 'Тестови сигнали', toggle: false}], {back: 'Настройки'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Правителствените сигнали са най-долу. <strong>Сериозните сигнали</strong> са изключени. <strong>Докоснете ги, за да ги включите.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Докоснете Безопасност и спешни случаи.</strong>', hint: 'Близо до края на списъка е.'},
            {screen: () => list(p, 'Безопасност и спешни случаи', [{label: 'Медицинска информация'}, {label: 'SOS при спешност'}, {id: 'wea', label: 'Безжични спешни сигнали'}, {label: 'Сигнали за непознати проследяващи устройства'}]),
             target: 'wea', say: '<strong>Докоснете Безжични спешни сигнали.</strong> <em>При някои телефони се казва Спешни сигнали.</em>'},
            {screen: c => list(p, 'Безжични спешни сигнали', [{label: 'Разрешаване на сигнали', toggle: true}, {label: 'Екстремни заплахи', toggle: true}, {id: 'severe', label: 'Сериозни заплахи', toggle: !!c.severe}, {label: 'Тестови сигнали', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Сериозните заплахи</strong> са изключени. <strong>Докоснете ги, за да ги включите.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Спешен сигнал: Сериозен</strong><p>Очаква се тежко наводнение близо до крайбрежната улица. Преместете се на по-високо място. Повече на gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'Така изглежда един сигнал. Издава силен звук на сирена около 10 секунди, дори на тих режим. <strong>Докоснете OK.</strong> <em>(Само за упражнение.)</em>'},
        {screen: () => home(p), question: {q: 'Пристига сигнал, докато шофирате. Какво трябва да направите?', options: [
            {t: 'Спирам на безопасно място, преди да го прочета', ok: true, why: 'Да. Никога не четете телефона си, докато шофирате. Спрете безопасно, после прочетете.'},
            {t: 'Чета го веднага, докато шофирам', why: 'Никога не четете телефона си, докато шофирате. Първо намерете безопасно място, където да спрете.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> Телефонът ви вече ще ви предупреждава за сериозна опасност наблизо. Истинските сигнали никога не искат лични данни или пари: ако някой поиска, това е измама.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Три неща, които правят откраднатия телефон много по-малко полезен за крадеца. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Докоснете Face ID и код.</strong> <em>На истински iPhone след това ще въведете кода си.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Превъртете надолу и <strong>докоснете Защита на откраднато устройство</strong>.'},
            {screen: c => list(p, 'Защита на откраднато устройство', [{id: 'sdp', label: 'Защита на откраднато устройство', toggle: !!c.sdp, sub: 'Извън дома смяната на кода или на профила ви в Apple изисква Face ID и изчакване от 1 час.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Това спира крадец, който е видял как въвеждате кода си, да ви заключи навън. <strong>Включете го.</strong>'},
            {screen: () => list(p, 'Защита на откраднато устройство', [{label: 'Защита на откраднато устройство', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'След това скрийте съобщенията на заключения екран. <strong>Докоснете ‹ Face ID,</strong> за да се върнете.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Докоснете Известия.</strong>'},
            {screen: c => list(p, 'Известия', [{id: 'previews', label: 'Показване на прегледи', value: c.previews || 'Винаги'}, {label: 'Споделяне на екрана', value: 'Известията са изключени'}], {back: 'Настройки',
                overlay: c.pickPrev ? sheet('Показване на прегледи', [['prev-always', 'Винаги'], ['prev-unlocked', 'При отключен телефон', 'Препоръчително'], ['prev-never', 'Никога']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Сега всеки може да чете съобщенията ви, включително кодове за сигурност, без да отключва телефона. <strong>Докоснете Показване на прегледи.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Докоснете Google.</strong>', hint: 'Близо до края на списъка е.'},
            {screen: () => list(p, 'Google', [{label: 'Управление на профила ви в Google'}, {id: 'all-services', label: 'Всички услуги'}, {label: 'Резервно копие'}]), target: 'all-services', say: '<strong>Докоснете Всички услуги.</strong>'},
            {screen: () => list(p, 'Всички услуги', [{caption: 'Лична безопасност и безопасност на устройството'}, {id: 'theft', label: 'Защита от кражба'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Докоснете Защита от кражба.</strong>'},
            {screen: c => list(p, 'Защита от кражба', [{id: 'tdl', label: 'Заключване при откриване на кражба', toggle: !!c.tdl, sub: 'Заключва екрана, ако усети, че някой грабва телефона ви и бяга.'}, {label: 'Заключване на устройството офлайн', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Включете „Заключване при откриване на кражба“.</strong> Ако някой грабне телефона ви и побегне, той се заключва сам.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'След това скрийте съобщенията на заключения екран. Обратно в Настройки <strong>докоснете Известия</strong>.'},
            {screen: c => list(p, 'Известия', [{id: 'previews', label: 'Известия на заключения екран', sub: c.previews || 'Показване на цялото съдържание'}, {label: 'История на известията'}], {
                overlay: c.pickPrev ? sheet('Известия на заключения екран', [['prev-always', 'Показване на цялото съдържание'], ['prev-unlocked', 'Скриване на поверително съдържание', 'Препоръчително'], ['prev-never', 'Без показване на известия']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Сега всеки може да чете съобщенията ви, включително кодове за сигурност, без да отключва телефона. <strong>Докоснете Известия на заключения екран.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Известия', [{label: 'Показване на прегледи', value: 'Винаги'}], {back: 'Настройки', overlay: sheet('Показване на прегледи', [['prev-always', 'Винаги'], ['prev-unlocked', 'При отключен телефон', 'Препоръчително'], ['prev-never', 'Никога']])})
                : list(p, 'Известия', [{label: 'Известия на заключения екран', sub: 'Показване на цялото съдържание'}], {overlay: sheet('Известия на заключения екран', [['prev-always', 'Показване на цялото съдържание'], ['prev-unlocked', 'Скриване на поверително съдържание', 'Препоръчително'], ['prev-never', 'Без показване на известия']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'При отключен телефон' : 'Скриване на поверително съдържание'}.</strong>`, hints: {'prev-always': 'Така беше. Изберете препоръчителното.', 'prev-never': 'Това ги скрива напълно, което може да е неудобно. Изберете препоръчителното.'}},
        {screen: () => home(p), target: 'phone', say: 'Накрая намерете IMEI номера на телефона си. Операторът ви има нужда от него, за да блокира откраднат телефон. <strong>Отворете приложението Телефон.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'На клавиатурата <strong>въведете *#06#</strong> (звезда, диез, нула, шест, диез).', hint: 'Започнете с клавиша със звезда *, долу вляво.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Информация за устройството', 'IMEI: 35 209900 176148 1 (примерен номер)', [['ok', 'OK']])}),
         target: 'ok', say: 'Този дълъг номер е вашият <strong>IMEI</strong>. На истински телефон го запишете на безопасно място (не в телефона!). <strong>Докоснете OK.</strong>'},
        {screen: () => home(p), question: {q: 'Телефонът ви е грабнат. На кого звъните първо?', options: [
            {t: 'На банката си, от телефона на някой друг', ok: true, why: 'Да. Крадците първо отиват към банковите приложения. После заключете телефона онлайн, обадете се на оператора си и докладвайте на 101.'},
            {t: 'Изчаквам да видя дали ще се появи', why: 'Бързината е важна. Обадете се на банката си веднага, после заключете телефона и се обадете на оператора си.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> На крадец е много по-трудно да ползва телефона ви и знаете къде да намерите IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'FIND MY' : 'СИГНАЛ ЗА ПРОСЛЕДЯВАНЕ', title: p === 'ios' ? 'AirTag, намерен да се движи с вас' : 'Непознато проследяващо устройство пътува с вас',
            text: '<br>Собственикът му може да вижда местоположението на този предмет.'}),
         target: 'alert', say: 'Телефонът ви е забелязал проследяващо устройство, което не е ваше и се движи с вас. Без паника: често е на член на семейството по погрешка. <strong>Докоснете сигнала.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Непознат AirTag' : 'Непознато проследяващо устройство', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Виждано с вас от <strong>10:12</strong> днес, на 4 места.</p>
            <button type="button" class="ce co" data-tap="play">Пускане на звук</button>
            <button type="button" class="cp" data-tap="learn">Научете повече за този ${p === 'ios' ? 'AirTag' : 'Проследяващо устройство'}</button>
            <button type="button" class="cp" data-tap="disable">Инструкции за изключване</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Картата показва къде е било с вас. <strong>Докоснете Пускане на звук,</strong> за да го намерите.'},
        {screen: () => app(p, p === 'ios' ? 'Непознат AirTag' : 'Непознато проследяващо устройство', '<p class="cf">⟦volume-2⟧ <strong>Възпроизвеждане на звук…</strong><br>Ослушайте се за цвърчащ звук.</p>', {color: '#fff'}),
         question: {q: 'Чувате слабо цвърчене. Къде трябва да потърсите?', options: [
            {t: 'В чанти, джобове на палто, в колата и в неща, които сте взели назаем', ok: true, why: 'Да. Проследяващите устройства са малки, колкото голяма монета, и често са пъхнати в хастар, джобове или коли.'},
            {t: 'Никъде, просто го игнорирам', why: 'Струва си да го намерите. Проверете чантите, джобовете и колата си: може да е просто на член на семейството.'}]}},
        {screen: c => app(p, 'Проследяващото устройство е намерено', `<p class="cf">Доближете горната част на телефона до проследяващото устройство, за да видите повече за него.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Доближете до устройството</button>`, {color: '#fff'}),
         target: 'scan', say: 'Намерихте го в хастара на палтото си. <strong>Докоснете Доближете до устройството,</strong> за да видите на кого принадлежи.'},
        {screen: () => app(p, 'За това проследяващо устройство', '<p class="cf"><strong>Не е в режим на изгубено</strong><br>Сериен номер: P4R7-ACT1CE<br>Данните за собственика се споделят само с полицията.</p>', {color: '#fff'}),
         question: {q: 'Не е на член на семейството и се притеснявате, че някой го е скрил, за да ви следи. Какво правите?', options: [
            {t: 'Пазя го и го занасям в полицията (или звъня на 999, ако съм в опасност)', ok: true, why: 'Да. Не го изхвърляйте: полицията може да открие собственика му. National Stalking Helpline е на 0808 802 0300.'},
            {t: 'Хвърлям го в боклука', why: 'Може да е доказателство и полицията може да открие собственика. Пазете го и го занесете на полицията или звъннете на 999, ако сте в опасност.'}]}},
        {screen: () => app(p, 'За това проследяващо устройство', '<p class="cf">Помощ: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 часа) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Браво!</strong> Знаете как да намерите проследяващо устройство и какво да направите. ' + (p === 'android' ? 'Проверете дали сигналите са включени в <strong>Настройки > Безопасност и спешни случаи > Сигнали за непознати проследяващи устройства</strong>.' : 'iPhone проверяват за проследяващи устройства автоматично.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Намирате се на пътека по скала и някой е паднал. Няма адрес. Когато звъните на 999, повечето телефони изпращат местоположението ви автоматично, но три думи също помагат. <strong>Отворете what3words.</strong> <em>(Тренировъчна версия.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Синята точка сте вие. Всеки квадрат от 3 метра има свои три думи. Вашите са <strong>puffin.chalk.lantern</strong>. Изчакайте за момент точката да се установи, после <strong>докоснете „Имам си 3-те думи“</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Сега звъннете на 999. <strong>Отворете приложението Телефон.</strong> <em>(Само за упражнение: никога не звъните на 999 за проба.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Въведете 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Докоснете зеления бутон за обаждане.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Спешно обаждане · 0:08</small></div>
            <p class="hi">„Спешна помощ, коя служба? … Линейка. Какво е точното местоположение на спешния случай?“</p>${homeIndicator(p)}</div>`,
         question: {q: 'Операторът пита къде сте. Какво казвате?', options: [
            {t: '„На пътеката по скалата съм. Адресът ми в what3words е puffin, chalk, lantern.“', ok: true, why: 'Да. Кажете къде сте със свои думи, после дайте трите думи. Преведете буква по буква всяка дума, ако поискат.'},
            {t: '„Не знам, някъде близо до морето“', why: 'Ще се опитат да ви намерят, но трите думи ви определят с точност до 3 метра. Прочетете ги от приложението.'}]}},
        {screen: () => home(p), question: {q: 'Приятел е глух и не може да прави гласови обаждания. Как може да се свърже с 999?', options: [
            {t: 'Да се регистрира за спешни текстови съобщения (да изпрати „register“ на 999) предварително или да ползва приложението 999 BSL', ok: true, why: 'Да. Спешните текстови съобщения работят само ако първо се регистрирате. Приложението 999 BSL свързва с преводач на жестомимичен език.'},
            {t: 'Не могат', why: 'Могат. Регистрирайте се за спешни текстови съобщения, като изпратите „register“ на 999, или ползвайте безплатното приложение 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> Запомнете: кажете къде сте, после дайте трите си думи. Приложението what3words намира думите ви и без сигнал, но за да звъните, ви трябва сигнал.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Не отговаря</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Телефонът ви е забил: докосването не прави нищо и не се изключва по обичайния начин. Голям проблем ли е това?', options: [
            {t: 'Обикновено не. „Принудително рестартиране“ го оправя и нищо не губите', ok: true, why: 'Правилно. Принудителното рестартиране е като да го изключите от контакта. Снимките и съобщенията ви са в безопасност.'},
            {t: 'Да, развален е', why: 'Обикновено не! Принудително рестартиране оправя повечето забили телефони и нищо не губите.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'При iPhone: <strong>натиснете и пуснете усилване на звука</strong>, после <strong>натиснете и пуснете намаляване на звука</strong>, после <strong>натиснете и задръжте страничния бутон</strong>, докато се появи логото на Apple (около 10 секунди). Тук ги докоснете в този ред.'
            : 'При повечето Android телефони: <strong>натиснете и задръжте бутона за захранване и намаляване на звука заедно</strong> около 10 секунди, докато се рестартира. Тук докоснете захранване, после намаляване на звука. <em>(Google Pixel: задръжте само бутона за захранване за 30 секунди.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Първо е усилване на звука.' : 'Започнете с бутона за захранване.', side: 'Страничният бутон е последен, след двата бутона за звука.'},
         hint: p === 'ios' ? 'Усилване на звука, после намаляване на звука, после страничният бутон.' : 'Захранване, после намаляване на звука.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Логото се появи. Какво сега?', options: [
            {t: 'Пускам и изчаквам да се включи', ok: true, why: 'Да. Отнема минута. Може да се наложи да въведете кода си веднъж.'},
            {t: 'Продължавам да натискам всички бутони', why: 'Пуснете, щом се появи логото, и му дайте минута да се включи.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Браво!</strong> Телефонът ви се рестартира. Ако продължава да забива, проверете за обновления и освободете място. Рестартирането на телефона веднъж седмично го държи да работи гладко.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Вкл.' : 'Изкл.'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Изкл.' : (ctx.signal ? 'Вкл. · 4G' : 'Няма покритие')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Изкл.' : 'Начало'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Плъзнете нагоре, за да затворите' : 'Затвори'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Няма покритие</span>'), target: 'pull-down',
         say: 'Телефонът ви показва <strong>Няма покритие</strong>, макар тази сутрин да работеше. Бързо решение е да включите и изключите самолетния режим, което го кара да се свърже отново. ' + (p === 'ios' ? '<strong>Плъзнете надолу от горния десен ъгъл</strong> (или докоснете лентата).' : '<strong>Плъзнете надолу от горния край</strong> (или докоснете лентата).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Докоснете Самолетен режим,</strong> за да го включите. Всичко безжично се изключва.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Изчакайте около 10 секунди… после <strong>докоснете Самолетен режим отново,</strong> за да го изключите.'},
        {screen: c => quickPanel(p, c), question: {q: 'Мобилните данни са пак на 4G. Кога още е удобен самолетният режим?', options: [
            {t: 'В самолет или в чужбина, за да избегнете роуминг такси (можете пак да включите Wi-Fi)', ok: true, why: 'Да. Можете да включите Wi-Fi отново при включен самолетен режим, за да ползвате Wi-Fi в хотел или на кораб.'},
            {t: 'За зареждане на телефона', why: 'Зарежда се малко по-бързо, но е главно за полети и за избягване на роуминг такси в чужбина.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Браво!</strong> Ако самолетният режим не помогне, рестартирайте телефона. Още няма покритие? Проверете уебсайта на оператора си за проблеми във вашия район.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · сега</strong><span>🎁 БЕЗПЛАТНИТЕ ви животи ви чакат! Върнете се и играйте! 🎉</span></button>',
         target: 'settings', say: 'Една игра непрекъснато бръмчи с безсмислени съобщения. Можете да изключите известията на всяко приложение. <strong>Докоснете Настройки,</strong> не съобщението.', hints: {notif: 'Това отваря играта. Докоснете Настройки.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Докоснете Известия.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Известия', [{label: 'Показване на прегледи', value: 'При отключен телефон'}, {caption: 'СТИЛ НА ИЗВЕСТИЯТА'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Банери, звуци, значки'}, {label: 'Съобщения', sub: 'Банери, звуци, значки'}, {label: 'WhatsApp', sub: 'Банери, звуци, значки'}], {back: 'Настройки'})
            : list(p, 'Известия', [{id: 'app-notifs', label: 'Известия на приложенията'}, {id: 'history', label: 'История на известията'}, {label: 'Известия на заключения екран'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Докоснете Bubble Pop.</strong>' : '<strong>Докоснете Известия на приложенията.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Известия на приложенията', [{label: 'Съобщения', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Докоснете превключвателя до Bubble Pop,</strong> за да изключите известията му.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Разрешаване на известия', toggle: !c.off}], {back: 'Известия'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Изключете „Разрешаване на известия“.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Известия', [{label: 'Известия на приложенията'}, {id: 'history', label: 'История на известията', sub: 'Изкл.'}]), target: 'history',
             say: 'Удобно допълнение: ако някога плъзнете съобщение настрани по погрешка, История на известията пази копие. <strong>Докоснете История на известията.</strong>'},
            {screen: c => list(p, 'История на известията', [{id: 'hist-toggle', label: 'Ползване на историята на известията', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Включете я.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Известията на кои приложения си струва да останат включени?', options: [
            {t: 'Съобщения, обаждания, WhatsApp, банката ви и всичко, за което искате да знаете веднага', ok: true, why: 'Да. Оставете важните, а изключете игрите, магазините и всичко, което само досажда.'},
            {t: 'Изключвам всички', why: 'Ще пропускате съобщения и обаждания! Оставете важните, а изключете игрите и приложенията за пазаруване.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Браво!</strong> Bubble Pop повече няма да ви безпокои. ' + (p === 'ios' ? 'Ако плъзнете съобщение настрани по погрешка, плъзнете нагоре от средата на заключения екран, за да видите по-старите.' : 'А историята на известията пази копие на всичко, което плъзнете настрани.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Ще се видим в патешкия градински център x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Текстово съобщение</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Написахте „Dunnington garden centre“ и телефонът го промени. Защо?', options: [
            {t: 'Автокорекцията е отгатнала грешна дума', ok: true, why: 'Да. Автокорекцията заменя думи, които не познава. Можете да я изключите или да я научите на нови думи.'},
            {t: 'Телефонът е развален', why: 'Това е просто автокорекция, която гадае. Можете да я изключите или да я научите на думи.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Докоснете Общи.</strong>'},
            {screen: () => list(p, 'Общи', [{label: 'Информация'}, {label: 'Обновяване на софтуера'}, {id: 'keyboard', label: 'Клавиатура'}, {label: 'Език и регион'}], {back: 'Настройки'}), target: 'keyboard', say: '<strong>Докоснете Клавиатура.</strong>'},
            {screen: c => list(p, 'Клавиатури', [{id: 'replace', label: 'Заместване на текст'}, {caption: 'ВСИЧКИ КЛАВИАТУРИ'}, {label: 'Автоматични главни букви', toggle: true}, {id: 'ac', label: 'Автокорекция', toggle: !c.acOff}, {label: 'Предсказване на текст', toggle: true}], {back: 'Общи'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Изключете „Автокорекция“.</strong> Правописните грешки пак се подчертават в червено, така че можете сами да ги поправите.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Докоснете Система.</strong> Намира се най-долу.'},
            {screen: () => list(p, 'Система', [{id: 'keyboard', label: 'Клавиатура'}, {label: 'Езици'}, {label: 'Дата и час'}]), target: 'keyboard', say: '<strong>Докоснете Клавиатура.</strong>'},
            {screen: () => list(p, 'Клавиатура', [{id: 'gboard', label: 'Gboard', sub: 'Екранна клавиатура'}]), target: 'gboard', say: '<strong>Докоснете Gboard.</strong> <em>При Samsung е Клавиатура Samsung > Интелигентно писане.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Предпочитания'}, {id: 'correction', label: 'Корекция на текста'}, {label: 'Писане с плъзгане'}]), target: 'correction', say: '<strong>Докоснете Корекция на текста.</strong>'},
            {screen: c => list(p, 'Корекция на текста', [{label: 'Показване на лентата с предложения', toggle: true}, {id: 'ac', label: 'Автокорекция', toggle: !c.acOff}, {label: 'Проверка на правописа', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Изключете „Автокорекция“.</strong> Правописните грешки пак се подчертават в червено, така че можете сами да ги поправите.'},
        ]),
        {screen: () => home(p), question: {q: 'Предпочитате да запазите автокорекцията, но тя винаги променя „Dunnington“. Какво друго можете да направите?', options: [
            {t: 'Да го добавя в речника на телефона, за да научи думата', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Ползвайте Заместване на текст в същите настройки на клавиатурата.' : 'Докоснете думата в лентата с предложения и изберете да я добавите в речника си.')},
            {t: 'Нищо, просто да търпя', why: 'Можете да го научите: ' + (p === 'ios' ? 'добавете думата в Клавиатура > Заместване на текст.' : 'докоснете думата в предложенията и я добавете в речника си.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> Край на изненадващите замени на думи. Можете да я включите отново по всяко време на същото място.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Имате нови безжични слушалки. Какво правите първо?', options: [
            {t: 'Слагам ги в „режим на сдвояване“ (обикновено държа бутона, докато светне мигаща светлина)', ok: true, why: 'Да. Режимът на сдвояване позволява на телефона да ги намери. Инструкциите в кутията казват точно как.'},
            {t: 'Включвам ги в телефона', why: 'Безжичните слушалки се свързват по Bluetooth. Първо ги сложете в режим на сдвояване, обикновено като задържите бутона, докато светне мигаща светлина.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Светлината на слушалките мига. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Докоснете Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Докоснете Свързани устройства.</strong>'},
            {screen: () => list(p, 'Свързани устройства', [{id: 'pair', label: '＋ Сдвояване на ново устройство'}, {label: 'Запазени устройства', sub: 'Кола'}]), target: 'pair', say: '<strong>Докоснете Сдвояване на ново устройство.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Сдвояване на ново устройство', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'МОИТЕ УСТРОЙСТВА' : 'Запазено'}, {label: 'Кола', sub: 'Няма връзка'},
            {caption: p === 'ios' ? 'ДРУГИ УСТРОЙСТВА' : 'Налични устройства'}, {id: 'headphones', label: '⟦headphones⟧ Practice Headphones'}, {label: 'Телевизорът на съседа'}], {back: 'Настройки'}),
         target: 'headphones', say: 'Телефонът ви търси устройства наблизо. <strong>Докоснете Practice Headphones.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'МОИТЕ УСТРОЙСТВА'}, {label: '⟦headphones⟧ Practice Headphones', sub: 'Свързано ⟦check⟧'}, {label: 'Кола', sub: 'Няма връзка'}], {back: 'Настройки'}),
         question: {q: 'Следващия път, когато включите слушалките, трябва ли пак да правите това?', options: [
            {t: 'Не, оттук нататък се свързват сами', ok: true, why: 'Да. Сдвоявате само веднъж. След това се свързват автоматично, когато са включени и наблизо.'},
            {t: 'Да, всеки път', why: 'Сдвоявате само веднъж. След това се свързват сами.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Practice Headphones', sub: 'Свързано ⟦check⟧'}], {back: 'Настройки'}), done: true,
         say: '<strong>Браво!</strong> Същите стъпки важат за кола, колонка или слухови апарати. Ако нещо не се свързва, изключете и включете Bluetooth и сложете устройството пак в режим на сдвояване.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">„${ctx.said || 'Бабо? Аз съм, Tom! Изгубих телефона си и съм в беда. Трябват ми £400 за глоба, днес. Моля те, не казвай на мама!'}“</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Поискайте семейната тайна фраза</button><button type="button" data-tap="send-money">Кажете, че ще изпратите парите</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Звъни непознат номер. <strong>Отговорете,</strong> за да упражните какво да правите.', hints: {decline: 'В истинския живот е нормално да отхвърлите! За това упражнение докоснете Отговор.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Ъъ… какво? Бабо, няма време за това! Моля те, трябват ми парите сега!'; },
         say: 'Звучи точно като внука ви Tom. Но измамниците могат да копират гласове. Семейството ви се е разбрало за <strong>тайна фраза</strong>. <strong>Поискайте я.</strong>',
         hints: {'send-money': 'Никога не се съгласявайте да изпратите пари при такова обаждане. Поискайте тайната фраза.', end: 'Да затворите също е добре! Но първо упражнете искането на тайната фраза.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Не я знаят и натискат още по-силно. Това е измамник. <strong>Затворете</strong> с червения бутон.', hints: {'send-money': 'Не! Не знаеха фразата. Затворете.', 'ask-phrase': 'Попитахте и не можаха да отговорят. Затворете.'}},
        {screen: () => home(p), question: {q: 'Все още сте малко притеснени за Tom. Какво правите?', options: [
            {t: 'Звъня на Tom (или на майка му) на номера, който вече имам за него', ok: true, why: 'Да. Винаги звъняйте на номер, който познавате. Истинският Tom ще е добре и няма да има нищо против, че проверявате.'},
            {t: 'Звъня обратно на номера, от който се обадиха', why: 'Така пак се свързвате с измамника. Звъннете на Tom на номера, който вече имате за него.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Ако обаждането е за банковата ви сметка, можете да звъннете на <strong>159</strong>, за да се свържете безопасно със своята банка. <strong>Отворете приложението Телефон</strong>, за да упражните.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Въведете 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Докоснете зеления бутон за обаждане.</strong> <em>(Само за упражнение: нищо не се набира.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">„Добре дошли в 159. Моля, кажете името на банката си и ще ви свържем.“</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Браво!</strong> 159 ви свързва с вашата истинска банка. Договорете тайна фраза със семейството си лично и никога не я публикувайте онлайн.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравейте' : 'Здравейте'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Плъзнете нагоре, за да отворите' : 'Начало'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Новият ви телефон е извън кутията и включен. Дръжте <strong>стария си телефон</strong> наблизо, зареден и на Wi-Fi. <strong>Докоснете ${p === 'ios' ? 'Плъзнете нагоре, за да отворите' : 'Начало'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Бърз старт' : 'Копиране на приложения и данни', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Доближете стария си iPhone до този, за да го настроите с профила си в Apple.' : 'Копирайте приложенията, снимките, контактите и други от стария си телефон.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Продължете на стария си iPhone' : 'Ползване на старото ви устройство'}</button>
            <button type="button" class="cp" data-tap="manual">Настройване ръчно вместо това</button>`}),
         target: 'use-old', say: 'Копирането от стария телефон спестява настройването на всичко наново. <strong>Докоснете ' + (p === 'ios' ? 'Продължете на стария си iPhone' : 'Ползване на старото ви устройство') + '.</strong>', hints: {manual: 'Можете, но копирането е много по-лесно. Докоснете другия бутон.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">На <strong>стария</strong> ви телефон се появява съобщение. Насочете камерата му към тази шарка.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Старият телефон я сканира</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'На стария телефон докоснете Продължи, после го дръжте над тази шарка, за да я види камерата. Тук <strong>докоснете „Старият телефон я сканира“</strong>.'},
        {screen: c => codeScreen(p, c, 'Въведете кода на стария си телефон', 'Така настройките се копират безопасно.'), sequence: CODE_KEYS,
         say: `Въведете кода на стария си телефон. За упражнение ползвайте <strong>${codeText}</strong>.`, hint: `Въведете тренировъчния код ${codeText}.`},
        {screen: () => list(p, 'Прехвърляне на данните ви', [], {noBack: true, top: `<p class="cf">Изберете какво да пренесете:</p>
            <div class="cj ex"><span>Снимки и видеоклипове</span>${tog(true)}</div><div class="cj ex"><span>Контакти и съобщения</span>${tog(true)}</div><div class="cj ex"><span>Приложения</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Продължи</button>`}),
         target: 'transfer', say: 'Всичко е отметнато. <strong>Докоснете Продължи.</strong> Дръжте двата телефона близо един до друг и на зарядно.'},
        {screen: c => list(p, 'Прехвърляне…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Остават около 25 минути' : 'Прехвърлянето приключи ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Прехвърлянето приключи. Какво да направите със стария телефон?', options: [
            {t: 'Пазя го една седмица, за да проверя дали нищо не липсва, после го изтривам както трябва, преди да го продам или рециклирам', ok: true, why: 'Да. Първо проверете дали снимките, WhatsApp и банковите ви приложения работят на новия телефон. Следващият урок показва как да изтриете стария.'},
            {t: 'Изхвърлям го веднага в боклука', why: 'Все още има цялата ви информация! Проверете дали новият телефон има всичко, после изтрийте стария както трябва.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> Новият ви телефон има снимките, контактите и приложенията ви. Някои приложения, като банковите и WhatsApp, искат да влезете отново; пригответе данните си.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Продавате, подарявате или рециклирате стария си телефон? Направете тези неща в правилния ред, иначе следващият собственик няма да може да го ползва. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Стъпка 1: излезте от профила си в Apple. <strong>Докоснете името си</strong>.'},
            {screen: c => list(p, 'Профил в Apple', [{label: 'Лична информация'}, {label: 'Вход и сигурност'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Изход', danger: true}], {back: 'Настройки',
                overlay: c.ask ? dialog(p, 'Да излезете ли?', 'Паролата ви е нужна, за да изключите Find My. (Упражнение: въведена е вместо вас.)', [['cancel', 'Отказ'], ['turn-off', 'Изключване']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Превъртете до края и <strong>докоснете Изход</strong>.'},
            {screen: () => list(p, 'Профил в Apple', [{label: 'Изход', danger: true}], {back: 'Настройки', overlay: dialog(p, 'Да излезете ли?', 'Паролата ви е нужна, за да изключите Find My. (Упражнение: въведена е вместо вас.)', [['cancel', 'Отказ'], ['turn-off', 'Изключване']])}),
             target: 'turn-off', say: 'Това изключва <strong>Find My</strong>, което иначе би заключило телефона към вас. <strong>Докоснете Изключване.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Стъпка 2: изтрийте го. <strong>Докоснете Общи.</strong>'},
            {screen: () => list(p, 'Общи', [{label: 'Информация'}, {label: 'Хранилище на iPhone'}, {id: 'reset', label: 'Прехвърляне или нулиране на iPhone'}], {back: 'Настройки'}), target: 'reset', say: '<strong>Докоснете Прехвърляне или нулиране на iPhone,</strong> най-долу.'},
            {screen: c => list(p, 'Прехвърляне или нулиране на iPhone', [{label: 'Нулиране'}, {id: 'erase', label: 'Изтриване на цялото съдържание и настройки'}], {back: 'Общи',
                overlay: c.askErase ? dialog(p, 'Да изтриете ли този iPhone?', 'Всички снимки, съобщения и приложения ще бъдат изтрити.', [['cancel', 'Отказ'], ['confirm-erase', 'Изтриване']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Докоснете Изтриване на цялото съдържание и настройки.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Стъпка 1: премахнете профила си в Google. <strong>Докоснете Google</strong>. <em>(При Samsung премахнете и профила си в Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Управление на профила ви в Google'}, {id: 'accounts', label: 'Профили на това устройство', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Докоснете Профили на това устройство.</strong>'},
            {screen: c => list(p, 'Профил в Google', [{label: 'margaret.smith@example.com'}, {label: 'Синхронизиране на профила'}, {id: 'remove', label: 'Премахване на профила', danger: true}], {overlay: c.ask ? dialog(p, 'Да премахнете ли профила?', 'Премахването му изтрива съобщенията, контактите и данните му от този телефон.', [['cancel', 'Отказ'], ['confirm-remove', 'Премахване на профила']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Без това телефонът остава заключен към профила ви след нулиране. <strong>Докоснете Премахване на профила.</strong>'},
            {screen: () => list(p, 'Профил', [{label: 'Премахване на профила', danger: true}], {overlay: dialog(p, 'Да премахнете ли профила?', 'Премахването му изтрива съобщенията, контактите и данните му от този телефон.', [['cancel', 'Отказ'], ['confirm-remove', 'Премахване на профила']])}),
             target: 'confirm-remove', say: '<strong>Докоснете Премахване на профила.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Стъпка 2: изтрийте го. <strong>Докоснете Система</strong>, най-долу.'},
            {screen: () => list(p, 'Система', [{label: 'Езици'}, {label: 'Обновяване на софтуера'}, {id: 'reset', label: 'Опции за нулиране'}]), target: 'reset', say: '<strong>Докоснете Опции за нулиране.</strong>'},
            {screen: c => list(p, 'Опции за нулиране', [{label: 'Нулиране на Wi-Fi, мобилни данни и Bluetooth'}, {id: 'erase', label: 'Изтриване на всички данни (фабрично нулиране)'}], {overlay: c.askErase ? dialog(p, 'Да изтриете ли всички данни?', 'Всички снимки, съобщения и приложения ще бъдат изтрити.', [['cancel', 'Отказ'], ['confirm-erase', 'Изтриване на всички данни']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Докоснете Изтриване на всички данни (фабрично нулиране).</strong>'},
        ]),
        {screen: () => list(p, 'Нулиране', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Да изтриете ли този iPhone?' : 'Да изтриете ли всички данни?', 'Всички снимки, съобщения и приложения ще бъдат изтрити.', [['cancel', 'Отказ'], ['confirm-erase', p === 'ios' ? 'Изтриване' : 'Изтриване на всички данни']])}),
         target: 'confirm-erase', say: 'Правете това само когато снимките ви са в безопасност на новия ви телефон или имат резервно копие. <strong>Докоснете ' + (p === 'ios' ? 'Изтриване' : 'Изтриване на всички данни') + '.</strong> <em>(Упражнение: нищо не се изтрива.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравейте' : 'Здравейте'}</h3><p class="cf">Готов за следващия си собственик</p>${homeIndicator(p)}</div>`,
         question: {q: 'Още едно нещо, преди да го предадете?', options: [
            {t: 'Извадете SIM картата (и картата с памет, ако има)', ok: true, why: 'Да. На SIM картата е телефонният ви номер. Извадете я с малкия инструмент или с кламер.'},
            {t: 'Нищо друго', why: 'Извадете SIM картата и картата с памет, ако има. Номерът ви е на SIM картата.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравейте' : 'Здравейте'}</h3><p class="cf">Готов за следващия си собственик</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Браво!</strong> Излезте от профила, изтрийте данните, извадете SIM картата: в този ред. Екранът „Здравейте“ значи, че е готов за някой друг.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Напомняне</strong><span>Обади се на Sarah</span><small>Днес в 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, по-късно превалявания</span><small>Макс. 14° · Мин. 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} слуша… какво искате да кажете?`}</p>${result}
            <div class="wh">${[['say-remind', '„Напомни ми да се обадя на Sarah в 3“'], ['say-weather', '„Какво е времето днес?“'], ['say-joke', '„Поръчай ми пица“']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Страничен бутон (натиснете и задръжте)' : 'Бутон за захранване (натиснете и задръжте)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> върши неща, когато поискате на глас. <strong>Натиснете и задръжте страничния бутон</strong> (отдясно), докато се появи Siri. Можете и просто да кажете „Siri“ или „Hey Siri“.'
                          : 'Телефонът ви може да върши неща, когато поискате на глас. <strong>Натиснете и задръжте бутона за захранване</strong> (отдясно), докато се появи асистентът. Можете и да кажете „Hey Google“.',
         hint: 'Дръжте пръста си (или бутона на мишката) натиснат върху бутона на десния ръб.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'На истински телефон просто бихте проговорили. Тук <strong>докоснете „Напомни ми да се обадя на Sarah в 3“</strong>.', hints: {'say-joke': 'Първо опитайте напомнянето.', 'say-weather': 'Първо опитайте напомнянето.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Готово: напомняне ще се появи в 3 часа. Сега <strong>попитайте за времето</strong>.', hints: {'say-remind': 'Това е зададено. Сега попитайте за времето.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Кое от тези можете да попитате телефона си?', options: [
            {t: 'Всичките: „Обади се на Sarah“, „Задай таймер за 10 минути“, „Включи фенерчето“, „Прочети съобщенията ми“', ok: true, why: 'Да. Удобно е, когато ръцете ви са заети, очите уморени или писането е трудно.'},
            {t: 'Само времето', why: 'Може много: обаждания, таймери, фенерче, четене на съобщения, будилници и още.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Браво!</strong> Говорете ясно и естествено, като на човек. Ако не ви разбере, просто попитайте пак.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Текст'], ['lens-translate', 'Превод'], ['lens-search', 'Търсене']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Меню' : 'Carte'}</strong><span>${ctx.translated ? 'Рибена супа' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Пиле с гъби' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Ябълков пай' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Предстои ви ваксина срещу грип.</span><span>За записване се обадете на ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Текст на живо' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Камерата ви може да чете текст. Да копираме телефонен номер от писмо. <strong>Отворете Камера.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Насочете я към писмото. Когато забележи текст, се появява малък <strong>бутон за текст ⟦scan-text⟧</strong>. <strong>Докоснете го.</strong>' : 'Насочете я към писмото и <strong>докоснете бутона Lens ◎</strong>.',
         hints: {shutter: 'Това прави обикновена снимка. Докоснете ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'бутона Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Текстът вече е истински текст. <strong>Докоснете телефонния номер.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Докоснете Копиране,</strong> готово за поставяне в съобщение или в контактите ви. <em>(Обаждане би го набрало веднага.)</em>', hints: {'call-num': 'Това би набрало номера. За това упражнение докоснете Копиране.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'В почивка ли сте? Сега е насочена към френско меню. ' + (p === 'ios' ? 'Приложението Translate или Lens в приложението Google могат да направят това. ' : '') + '<strong>Докоснете Превод.</strong>', hints: {'lens-text': 'Това копира френския текст. Докоснете Превод.', 'lens-search': 'Докоснете Превод.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Какво друго може да прави камерата по този начин?', options: [
            {t: 'Разпознава растения и птици и сканира писма в PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'В приложението Бележки докоснете кламера, после Сканиране на документи, за да превърнете писма в PDF.' : 'В Google Drive докоснете +, после Сканиране, за да превърнете писма в PDF.')},
            {t: 'Само прави снимки', why: 'Прави много повече: разпознава растения, превежда, копира текст и сканира писма в PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Браво!</strong> Копирахте номер и преведохте меню с камерата си. ' + (p === 'ios' ? 'Текстът на живо работи и със снимки, които вече сте направили.' : 'Google Lens работи и със снимки, които вече сте направили.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Електронни книги от библиотеката', `<p class="cf">Влезли сте с читателската си карта</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">Електронни книги</button><button type="button" data-tap="tab-audio" class="on">Аудиокниги</button></div>
                <div class="aeo">${[['book-1', 'Фарът във Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Морски лета', 'J. Marsh', '#f59e0b'], ['book-3', 'Тихата градина', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Връщане след 21 дни' : '3 от 5 екземпляра са налични'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Библиотека', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'С безплатна читателска карта можете да заемате електронни книги и аудиокниги на телефона си. East Riding Libraries ползват приложението <strong>BorrowBox</strong>. Това е тренировъчна версия. <strong>Отворете го.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Влезли сте с читателската си карта. <strong>Докоснете Фарът във Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Заемането е безплатно. <strong>Докоснете Заемане.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Ваша е за 21 дни. <strong>Докоснете Слушане.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Докоснете бутона за пускане ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Слушате в леглото? <strong>Таймерът за заспиване</strong> го спира след известно време, за да не изгубите мястото си. <strong>Докоснете Таймер за заспиване.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Какво става, когато изтекат 21-те дни?', options: [
            {t: 'Връща се само. Без глоби, а можете да подновите, ако не сте свършили', ok: true, why: 'Да. Електронните книги и аудиокнигите се връщат автоматично.'},
            {t: 'Получавате глоба', why: 'Няма глоби. Връща се само и можете да я подновите, ако не сте свършили.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Браво!</strong> За да започнете наистина, запишете се на eastridinglibraries.co.uk или във всяка библиотека, после изтеглете BorrowBox и влезте с картата си.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>Плащане през приложението: местоположение <b>4471</b></span></div>
                <p class="cf">Въведете номера на местоположението от табелата</p>${field('parkcode', 'Номер на местоположение', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Намиране на паркинг</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Плащане £3.20' : 'Изберете време'}</button>`, {color});
        }
        return app(p, 'Паркиране', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Много паркинги позволяват плащане през приложение, така че не ви трябват монети. Всяка община ползва различни приложения (табелата ви казва кое). Това е тренировъчно. <strong>Отворете Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Въведете номера на местоположението от табелата: 4471.',
         say: 'Всеки паркинг има <strong>номер на местоположение</strong> на табелата. <strong>Въведете 4471</strong> в полето и <strong>докоснете Намиране на паркинг</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Регистрационният номер на колата ви вече е запазен. <strong>Изберете 2 часа.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Има малка такса за услугата за ползване на приложението. <strong>Докоснете Плащане £3.20.</strong> <em>(Упражнение: не се взимат пари.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Закъснявате в магазините. Какво можете да направите?', options: [
            {t: 'Да докосна Удължаване в приложението, за да добавя време, без да се връщам при колата', ok: true, why: 'Да. Това е големият плюс на плащането през приложение. Повечето ви напомнят и преди времето да изтече.'},
            {t: 'Нищо, ще получа глоба', why: 'Повечето приложения за паркиране позволяват да докоснете Удължаване и да добавите време, където и да сте.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Браво!</strong> Повечето автомати още приемат карти или монети, а много приложения позволяват плащане и с обаждане на номер или изпращане на съобщение. Никога не плащайте чрез стикер с QR код на автомат: може да е фалшив.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Договорът ви е изтекъл на 3 март 2026 г. Можете да смените оператора безплатно. Месечната ви цена е £24.00. За да смените и да запазите номера си, изпратете PAC на 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Текстово съобщение', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Още ли сте обвързани с договор или плащате твърде много? Едно безплатно съобщение ви казва. <strong>Отворете Съобщения.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Напишете INFO в полето за съобщение, после докоснете изпращане.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Започнахме ново съобщение до <strong>85075</strong>. <strong>Напишете INFO</strong> и <strong>докоснете изпращане</strong>. Безплатно е във всяка британска мрежа.'},
        {screen: c => smsTo(p, c), question: {q: 'Отговорът казва, че договорът ви е изтекъл и още плащате £24 на месец. Какво значи това?', options: [
            {t: 'Телефонът ви е изплатен. Предложение само със SIM карта може да струва много по-малко и можете да запазите номера си', ok: true, why: 'Да. Изпратете PAC на 65075 за код, за да смените и да запазите номера си. Новият оператор прави останалото.'},
            {t: 'Нищо, продължавам да плащам', why: 'Може да плащате за телефон, който вече сте изплатили. Предложение само със SIM карта може да ви спести много.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Още един начин да спестите, за пътуване в чужбина: изключете роуминга на данни, за да не ви таксуват неочаквано. <strong>Докоснете Настройки.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Докоснете Мобилни данни.</strong>'},
            {screen: () => list(p, 'Мобилни данни', [{label: 'Мобилни данни', toggle: true}, {id: 'options', label: 'Опции за мобилни данни', value: 'Роумингът е включен'}, {label: 'Лична точка за достъп'}], {back: 'Настройки'}), target: 'options', say: '<strong>Докоснете Опции за мобилни данни.</strong>'},
            {screen: c => list(p, 'Опции за мобилни данни', [{id: 'roam', label: 'Роуминг на данни', toggle: !c.roamOff}, {label: 'Глас и данни', value: '5G автоматично'}], {back: 'Мобилни данни'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Изключете „Роуминг на данни“.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Докоснете Мрежа и интернет.</strong>'},
            {screen: () => list(p, 'Мрежа и интернет', [{label: 'Интернет', sub: 'Wi-Fi вкъщи'}, {id: 'sims', label: 'SIM карти', sub: 'Вашата мрежа'}, {label: 'Самолетен режим', toggle: false}]), target: 'sims', say: '<strong>Докоснете SIM карти.</strong>'},
            {screen: c => list(p, 'SIM карти', [{label: 'Мобилни данни', toggle: true}, {id: 'roam', label: 'Роуминг', toggle: !c.roamOff, sub: 'Свързване с услуги за данни при роуминг'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Изключете „Роуминг“.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Браво!</strong> В чужбина пак можете да ползвате Wi-Fi за WhatsApp, видеообаждания и карти. Включете роуминга отново, ако ви трябват мобилни данни и знаете какво таксува операторът ви.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Споделянето на местоположението ви позволява на близките да видят, че сте се прибрали благополучно. Изборът е ваш и можете да спрете по всяко време. <strong>Отворете Find My.</strong>'},
        {screen: c => app(p, 'Хора', `<p class="cf">Още никой не споделя.</p><button type="button" class="ce co" data-tap="share">Споделяне на моето местоположение</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Докоснете Споделяне на моето местоположение.</strong>'},
        {screen: c => app(p, 'Споделяне с', '', {color: '#fff', overlay: sheet('Изберете контакт', [['pick-sarah', 'Sarah', 'Дъщеря'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Докоснете Sarah.</strong>', hints: {'pick-dave': 'За това упражнение изберете Sarah.'}},
        {screen: c => app(p, 'Споделяне със Sarah', '', {color: '#fff', overlay: sheet('За колко време?', [['one-hour', 'Споделяне за един час'], ['day', 'Споделяне до края на деня'], ['always', 'Споделяне за неопределено време']])}),
         target: 'always', say: 'Изберете за колко време. За близки, на които вярвате, <strong>докоснете Споделяне за неопределено време</strong>. Можете да спрете по всяко време.', hints: {'one-hour': 'Това е удобно за едно пътуване. За това упражнение изберете Споделяне за неопределено време.', day: 'За това упражнение изберете Споделяне за неопределено време.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Споделянето на местоположението ви позволява на близките да видят, че сте се прибрали благополучно. Изборът е ваш и можете да спрете по всяко време. <strong>Отворете Карти.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Докоснете снимката на профила си</strong> горе вдясно.'},
        {screen: () => app(p, 'Карти', '', {color: '#fff', overlay: sheet('', [['sharing', 'Споделяне на местоположението'], ['timeline', 'Вашата хронология'], ['settings', 'Настройки']])}), target: 'sharing', say: '<strong>Докоснете Споделяне на местоположението.</strong>'},
        {screen: () => app(p, 'Споделяне на местоположението', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Докоснете Ново споделяне.</strong>'},
        {screen: () => app(p, 'Споделяне с', '', {color: '#fff', overlay: sheet('Изберете контакт', [['pick-sarah', 'Sarah', 'Дъщеря'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Докоснете Sarah.</strong>', hints: {'pick-dave': 'За това упражнение изберете Sarah.'}},
        {screen: () => app(p, 'Споделяне със Sarah', '', {color: '#fff', overlay: sheet('За колко време?', [['one-hour', 'За 1 час'], ['always', 'Докато не го изключите']])}),
         target: 'always', say: 'За близки, на които вярвате, <strong>докоснете Докато не го изключите</strong>.', hints: {'one-hour': 'Удобно за едно пътуване. За това упражнение изберете Докато не го изключите.'}},
    ]).concat([
        {screen: () => app(p, 'Споделяне със Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah може да вижда къде сте. ${p === 'ios' ? 'Докоснете Спиране на споделянето' : 'Докоснете Спиране'} по всяко време.</p>`, {color: '#fff'}),
         question: {q: 'Някой, когото току-що сте срещнали онлайн, ви моли да споделите местоположението си. Бива ли?', options: [
            {t: 'Не. Споделяйте само с близки или приятели, на които вярвате', ok: true, why: 'Точно така. Местоположението ви показва къде живеете и кога не сте си у дома. Споделяйте го само с хора, на които вярвате.'},
            {t: 'Да, изглеждат мили', why: 'Споделяйте местоположението си само с близки и приятели. Показва къде живеете и кога не сте си у дома.'}]}},
        {screen: () => app(p, 'Споделяне със Sarah', '<p class="cf">Sarah може да вижда къде сте.</p>', {color: '#fff'}), done: true,
         say: '<strong>Браво!</strong> Sarah вижда, че сте в безопасност. Проверявайте от време на време с кого споделяте и спрете споделянето с всеки, на когото не е нужно.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Внукът ви Leo получава първия си iPhone. <strong>Екранно време</strong> задава здравословни ограничения. Това е телефонът на <strong>Leo</strong>. <strong>Докоснете Настройки.</strong>'},
        {screen: c => list(p, 'Настройки', [{label: 'Leo', sub: 'Профил в Apple'}, {label: 'Известия'}, {id: 'screen-time', label: 'Екранно време'}, {label: 'Общи'}], {noBack: true}), target: 'screen-time', say: '<strong>Докоснете Екранно време.</strong>'},
        {screen: c => list(p, 'Екранно време', [{id: 'downtime', label: 'Време за почивка', sub: c.downtime ? '20:00 – 07:00' : 'Изкл.'}, {label: 'Ограничения за приложения'}, {id: 'content', label: 'Ограничения за съдържание и поверителност', sub: c.content ? 'Вкл.' : 'Изкл.'}, {label: 'Ползване на код за Екранно време'}], {back: 'Настройки'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Времето за почивка</strong> заключва повечето приложения през нощта (обажданията работят). <strong>Докоснете Време за почивка,</strong> за да го включите, от 20 до 7 ч.'},
        {screen: c => list(p, 'Екранно време', [{label: 'Време за почивка', sub: '20:00 – 07:00'}, {label: 'Ограничения за приложения'}, {id: 'content', label: 'Ограничения за съдържание и поверителност', sub: c.content ? 'Вкл.' : 'Изкл.'}], {back: 'Настройки'}),
         target: 'content', action: c => { c.content = true; }, say: 'След това спрете неочакваните покупки и съдържанието за възрастни. <strong>Докоснете Ограничения за съдържание и поверителност.</strong>'},
        {screen: c => list(p, 'Съдържание и поверителност', [{label: 'Ограничения за съдържание и поверителност', toggle: true}, {id: 'purchases', label: 'Покупки в App Store', value: c.noBuy ? 'Не разрешавай' : 'Разреши'}, {label: 'Уеб съдържание', value: 'Ограничаване на сайтове за възрастни'}], {back: 'Екранно време'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Сайтовете за възрастни вече са ограничени. <strong>Докоснете Покупки в App Store,</strong> за да спрете харченето в приложения.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Внукът ви Leo получава първия си Android телефон. Безплатното приложение на Google <strong>Family Link</strong> задава здравословни ограничения от <strong>вашия</strong> телефон. <strong>Отворете Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Докоснете Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Контроли'}, {id: 'screen-time', label: 'Екранно време', sub: c.downtime ? 'Лягане 20:00 – 07:00' : 'Без ограничения'}, {id: 'content', label: 'Ограничения за съдържание', sub: c.noBuy ? 'Покупките изискват вашето одобрение' : 'Google Play: разрешено всичко'}, {label: 'Местоположение', sub: 'Вкл.'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Докоснете Екранно време,</strong> за да зададете час за лягане, от 20 до 7 ч., когато телефонът се заключва (обажданията работят).'},
        {screen: c => list(p, 'Leo', [{caption: 'Контроли'}, {label: 'Екранно време', sub: 'Лягане 20:00 – 07:00'}, {id: 'content', label: 'Ограничения за съдържание', sub: c.noBuy ? 'Покупките изискват вашето одобрение' : 'Google Play: разрешено всичко'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'След това спрете неочакваното харчене. <strong>Докоснете Ограничения за съдържание,</strong> така че покупките да изискват вашето одобрение.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Екранно време' : 'Leo', [{label: p === 'ios' ? 'Време за почивка' : 'Екранно време', sub: '20:00 – 07:00'}, {label: 'Покупки', sub: p === 'ios' ? 'Не разрешавай' : 'Изискват вашето одобрение'}]),
         question: {q: 'Кое е най-важното, освен настройките?', options: [
            {t: 'Разговорът с тях: те винаги могат да ви кажат, ако нещо онлайн ги разстройва', ok: true, why: 'Да. Никоя настройка не хваща всичко. Най-важно е да сте човек, с когото могат да говорят.'},
            {t: 'Настройките правят всичко', why: 'Помагат много, но нищо не хваща всичко. Уверете се, че знаят, че винаги могат да говорят с вас.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Екранно време' : 'Leo', [{label: 'Време за почивка', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Браво!</strong> Leo има час за лягане и не може да харчи пари, без да попита. ' + (p === 'ios' ? 'Задайте код за Екранно време, за да можете само вие да променяте тези настройки.' : 'Family Link ви позволява да променяте това от собствения си телефон по всяко време.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Файлов мениджър', mac: 'Finder', linux: 'Файлове'},
        settings: {windows: 'Настройки', mac: 'Системни настройки', linux: 'Системни настройки'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Мениджър на софтуера'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Старт', mac: 'Приложения', linux: 'Меню'},
        editor: {windows: 'Notepad', mac: 'TextEdit', linux: 'Текстов редактор'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Поща', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Мениджър на обновленията', terminal: 'Терминал', trash: 'Кошче', apps: 'Приложения', chrome: 'Chrome', shield: 'Защита на Windows', fw: 'Защитна стена'}[kind]);

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
        windows: {title: 'Кошче', empty: 'Изпразване на кошчето', confirm: n => `Сигурни ли сте, че искате да изтриете окончателно тези ${n} елемента?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Предлагаше помощ за всяко писмо, което някога сте започвали да пишете. Пенсиониран през 2007 г.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Начинаещ: 999 секунди. За това не говорим.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Спечелите ли игра, картите скачаха по екрана. Щракнете двукратно върху мен!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Скрррр… бонг… кссшшш. И никой не можеше да ползва телефона, докато сте онлайн.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Онзи зелен хълм и синьо небе, на милиони екрани от 2001 г.', ''],
            ['⟦save⟧', 'Floppy disk (A:)', '1,44 MB. Бутонът „Запази“ още прилича на такава.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, безплатно с Windows, докато Vista не го отне.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'Някой ви прати „побутване“ и целият екран се разтресе. Щракнете двукратно върху мен!', 'shake'],
            ['⟦file-text⟧', 'Letter to council FINAL (2) (final).doc', 'Всички имаме такова.', ''],
        ]},
        mac: {title: 'Кошче', empty: 'Изпразване на кошчето', confirm: () => 'Сигурни ли сте, че искате да изтриете окончателно елементите в кошчето? Това действие не може да бъде отменено.', items: [
            ['⟦rainbow⟧', 'Въртящата се плажна топка', 'Цветното колело, което значеше „моля, изчакайте“… и чакайте. Щракнете двукратно върху мен!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Прозрачен, яйцевиден и син. Във всяко училище имаше такъв.', ''],
            ['⟦music⟧', 'iPod с колелце', '1000 песни в джоба ви. Въртите и въртите с палец.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Малкият усмихнат компютър, който ви поздравяваше при всяко стартиране.', ''],
            ['⟦bell⟧', 'Звукът при стартиране', 'Онзи голям акорд, когато го включвахте. Мнозина още го помнят с носталгия.', ''],
            ['⟦droplet⟧', 'Бутони Aqua', 'Толкова лъскави и сини, че ти иде да ги оближеш.', ''],
            ['⟦calendar-days⟧', 'Джаджи на Dashboard', 'Калкулатор, времето и лепяща бележка на собствен слой. Изчезнали от 2019 г.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Там, където всички записвахме CD-та и синхронизирахме iPod.', ''],
        ]},
        linux: {title: 'Кошче', empty: 'Изпразване на кошчето', confirm: () => 'Да изпразните ли всички елементи от кошчето? Всички елементи в кошчето ще бъдат изтрити окончателно.', items: [
            ['⟦bird⟧', 'Пингвинът Tux (плюшен)', 'Талисманът на Linux от 1996 г. Много приятен за прегръщане.', ''],
            ['⟦eye⟧', 'xeyes', 'Чифт очи, които следват показалеца на мишката ви. Щракнете двукратно върху мен!', 'eyes'],
            ['⟦app-window⟧', 'Треперещи прозорци', 'Старите ефекти на работния плот караха прозорците да се тресат като желе, когато ги влачите. Щракнете двукратно върху мен!', 'wobble'],
            ['⟦save⟧', 'Инсталационни дискети 1–50', 'Ранният Linux можеше да изисква цяла кутия дискети за инсталиране.', ''],
            ['⟦disc⟧', 'Безплатно CD с Ubuntu по пощата', 'Можеше да си поръчате CD с Linux безплатно и то идваше по пощата.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Предричана всяка година от около 1999 г. Може би тази е годината?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'Всяка версия на Linux Mint носи женско име, като Zena, Xia и Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Стара шега: кажете „sudo“ и компютърът прави каквото му кажат.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Тази папка е празна.' : 'The ' + egg.title + ' е празна.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Щракнете двукратно върху нещо, за да погледнете.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Не' : 'Отказ'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Да' : 'Празна'}</button></div></div>` : '';
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
        ['Хълм', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Райе', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Нощно небе', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Морски бряг', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Най-известната игра на думи с Wi-Fi.'],
        ['The LAN Before Time', 'LAN е „локална мрежа“. Тази е много, много стара.'],
        ['Abraham Linksys', 'Преди осемдесет и седем мегабита…'],
        ['Bill Wi the Science Fi', 'Науката е върхът!'],
        ['Drop It Like It\'s Hotspot', 'Точка за достъп от нечий телефон, с чувство за хумор.'],
        ['Silence of the LANs', 'Много, много тиха мрежа.'],
        ['Tell My Wi-Fi Love Her', 'Ах.'],
        ['Get Off My LAN', 'Вероятно навъсен съсед.'],
        ['Bridlington Seagulls', 'Те вече ви взеха чипса. Не им давайте и паролата.'],
        ['FREE WIFI (honest)', 'Мрежа на име „free Wi-Fi“, която не познавате, е точно от тези, към които не бива да се свързвате!'],
    ];

    const FORTUNES = ['Днес е добър ден да направите резервно копие на снимките си.', 'Силната парола е щастлива парола.', 'Ще получите телефонно обаждане. Ще бъде измама. Затворете.',
        'Пробвахте ли да го изключите и включите отново?', 'Най-доброто време за обновяване беше вчера. Второто най-добро е сега.', 'Чаша чай оправя повечето неща. Но не и компютрите.',
        'Никога не давайте паролата си на непознат. Или на чайка.', 'Ще намерите дистанционното. То е между възглавниците на дивана.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP адрес: 192.168.1.42<br>Рутер: 192.168.1.1<br>Сигнал: −54 dBm (много добър)<br>Канал: 36 (5 GHz)<br>Скорост: 866 Mbps<br>Сигурност: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi е изключен. Включете го, за да видите мрежите.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Няма интернет</strong><br>Опитайте да проверите Wi-Fi. Натиснете <kbd>интервал</kbd> или докоснете, за да играете.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>КРАЙ НА ИГРАТА · натиснете интервал, за да играете пак</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Мучахте ли днес?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Опитайте: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Муу!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Написахте „sl“ вместо „ls“? Ето ви парен влак.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (практика) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: от закуска \\___________/ Memory: не забравя нито един рожден ден`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Добре. 🥪');
        else if (lc === 'make me a sandwich') say('Какво? Направи си сам.');
        else if (/rm\s+-rf/.test(lc)) say('Хубав опит! В този тренировъчен терминал не можете да счупите нищо.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: командата не е намерена (опитайте „help“)`);
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
        else if (note) note.textContent = 'Този тренировъчен браузър не търси в истинския интернет. Нищо от написаното не се изпраща никъде.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Първи април! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Чийт кодът е активиран! +30 живота 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Добре дошли в Macintosh.</p></div><p>Чийт кодът е активиран! +30 живота 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Чийт кодът е активиран! +30 живота 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Другите прозорци са прибрани.' : 'Aero Shake! (Нямаше други прозорци за прибиране.)');
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
                funToast(screen, 'Wi-Fi е включен. Свързани сте с Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi е изключен.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Свързвайте се само с мрежи, които познавате.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Първи април! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Изглед'], ['', 'Подреждане по'], ['refresh', 'Обновяване'], ['', 'Ново'], ['wall', 'Персонализиране']]
                : os === 'mac' ? [['', 'Нова папка'], ['', 'Информация'], ['wall', 'Смяна на тапета…'], ['', 'Ползване на Stacks']]
                : [['', 'Създаване на нова папка'], ['terminal', 'Отваряне в терминал'], ['wall', 'Смяна на фона на работния плот']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Тапет: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (тренировъчно издание)</small>
                <dl><dt>Чип</dt><dd>Bridlington Silicon B1</dd><dt>Памет</dt><dd>Не забравя нито един рожден ден</dd><dt>Стартов диск</dt><dd>Practice HD</dd><dt>Сериен номер</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notepad' : os === 'mac' ? 'TextEdit' : 'Текстов редактор';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Без заглавие – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Ред 1, кол. 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Обикновен текст'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Добре дошли! Това е тренировъчен терминал. Напишете „help“, за да видите какво можете да опитате. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Времето'], ['news', '⟦newspaper⟧', 'Новини'], ['bus', '⟦bus⟧', 'Часове на автобусите'], ['recipes', '⟦cake-slice⟧', 'Рецепти']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Времето в Bridlington</h3><p class="fd">Примерна прогноза</p><div class="ajf">${[['Днес', '⟦cloud-sun⟧', '13°'], ['Пет', '⟦cloud-rain⟧', '11°'], ['Съб', '⟦wind⟧', '10°'], ['Нед', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Дейност на чайките: <strong>много висока</strong>. Пазете чипса си.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Practice News</h3><ul class="news">
            <li><strong>Местен мъж най-накрая намери дистанционното на телевизора</strong> между възглавниците на дивана, след три седмици.</li>
            <li><strong>Чайка е забелязана с 99 Flake</strong>. Собственикът на сладоледа „не е във възторг“.</li>
            <li><strong>Баба победи внука си във видеообаждане</strong>: „Просто натиснах зеления бутон.“</li>
            <li><strong>Проучване установи,</strong> че 9 от 10 компютърни проблема се решават с изключване и включване.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Часове на автобусите</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Кралски сладкиш Victoria</h3><p>Смесете по 200 g масло, захар и самоповдигащо се брашно с 4 яйца. Печете в две форми на 180°C за 20–25 минути. Напълнете с конфитюр и сметана.</p><p class="fd">Съвет: задайте таймер на телефона си или го попитайте: „Задай таймер за 25 минути“.</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Нов раздел' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Търсете или въведете уеб адрес'}</div>
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
        Documents: [['⟦file-text⟧', 'Shopping list.txt'], ['⟦file-text⟧', 'Letter to council.docx'], ['⟦folder⟧', 'Рецепти'], ['⟦file-spreadsheet⟧', 'Christmas card list.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Council tax bill.pdf'], ['⟦file-text⟧', 'Bus timetable.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Seaside brass band.mp3'], ['⟦music⟧', 'Sixties hits.mp3']],
    };
    function funFiles(screen, os, folder = 'Снимки', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Кошче' : os === 'mac' ? 'Кошче' : 'Кошче'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Dog on the beach.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Свързани с Home-WiFi-5G' : 'Wi-Fi е изключен.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Персонализиране' : os === 'mac' ? 'Тапет' : 'Фонове'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Обновяване на софтуера' : 'Обновления'}</h3><p class="mj">⟦check⟧ Всичко е обновено</p><p class="cf">Последна проверка: днес, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Проверка за обновления</button><p class="zi"></p>`,
            about: `<h3>Относно</h3><div class="zk"><div><span>Име на устройството</span><b>MARGARET-PRACTICE</b></div><div><span>Система</span><b>${os === 'windows' ? 'Windows 11 (практика)' : os === 'mac' ? 'macOS 27 (практика)' : 'Linux Mint 22.3 (практика)'}</b></div>
                <div><span>Процесор</span><b>Bridlington Silicon B1</b></div><div><span>Памет</span><b>Не забравя нито един рожден ден</b></div><div><span>Хранилище</span><b>Предостатъчно за снимки на внуците</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Персонализиране' : os === 'mac' ? 'Тапет' : 'Фонове'], ['update', 'Обновления'], ['about', 'Информация']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Practice Mines', 'Класическата игра за търсене на мини.'], ['solitaire', '⟦spade⟧', 'Пасианс', 'Очаквайте скоро в този тренировъчен магазин.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Очаквайте скоро в този тренировъчен магазин.'], ['weather', '⟦cloud-sun⟧', 'Времето', 'Очаквайте скоро в този тренировъчен магазин.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Отваряне' : (os === 'mac' ? 'Вземи' : 'Инсталирай')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Practice Mines', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Щракнете, за да копаете. Щракнете с десния бутон (или натиснете и задръжте), за да поставите флаг.</p></div>`, 'bz'));
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
        ['Мама', 'Как се изключва това нещо?', 'Здравей, миличък, написах този имейл, но не мога да намеря бутона за изключване. Кръглият ли е? Целувки, мама xx П.П. Натиснах го. Нищо не стана. Нормално ли е?'],
        ['Bridlington Walkers', 'Разходката в събота', 'Срещаме се на пристанището в 10 ч. Вземете термос и дъждобран. Инцидентът с чайката от миналата седмица няма да се обсъжда.'],
        ['Prince Abu (Very Rich)', 'СПЕШНО: спечелихте £4,000,000!!!', 'Скъпи любим приятелю, аз съм принц и ми трябват банковите ви данни, за да ви изпратя четири милиона паунда. Моля, изпратете и £50 за пощенската марка. — Това е измама! Истинските хора не раздават милиони по имейл. Изтрийте го или го препратете на report@phishing.gov.uk.'],
        ['Sarah', 'Снимки от неделя 🌻', 'Ето снимките от градината. Кучето е изяло още един слънчоглед.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Поща', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Това е тренировъчен компютър, затова не може да се изключи 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Изтегляния', '⟦triangle-alert⟧ Програмите „безплатен чистач“ често са боклук или по-лошо. Най-добре го изтрийте, не го отваряйте!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `„${n}“ би се отворил тук на истински компютър.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi е включен.' : 'Wi-Fi е изключен.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Проверка за обновления…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Няма нови обновления. Всичко е наред!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Това е само за показ в тренировъчния магазин.'); return true; }
            el.textContent = 'Инсталиране…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Отваряне'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">File Edit View Insert Format <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Уважаеми господине или госпожо, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Мениджър на обновленията', '<div class="ajz"><p class="mj">⟦check⟧ Системата ви е обновена</p><p class="cf">Linux Mint сам проверява за обновления и показва точка на щита, когато има такива.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Пишете тук, за да търсите</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Кошче', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Компютър', '⟦monitor⟧')}${icon('Начало', '⟦house⟧')}${icon('Кошче', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Търсене на приложения, настройки и документи')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Търсене')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Пишете, за да търсите…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Нов раздел <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Търсете или въведете уеб адрес</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Това е <strong>работният плот</strong>. Лентата най-долу е <strong>лентата на задачите</strong>. Отворете уеб браузъра от менюто Старт: <strong>щракнете Старт</strong>, четирите квадрата.'
            : os === 'mac' ? 'Това е <strong>работният плот</strong>. Редът с приложения най-долу е <strong>Dock</strong>, а лентата най-горе е <strong>лентата с менюта</strong>. <strong>Щракнете Приложения</strong> (мрежата от квадрати), за да видите всички приложения.'
            : 'Това е <strong>работният плот</strong> в Linux Mint. Лентата най-долу е <strong>панелът</strong>. Приложенията ви са в Менюто: <strong>щракнете Меню</strong>, долу вляво.',
         hint: os === 'mac' ? 'Приложения е в Dock най-долу, до Finder.' : (os === 'windows' ? 'Старт са четирите сини квадрата на лентата на задачите.' : 'Бутонът Меню е най-вляво на долния панел.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Щракнете ${N.browser[os]},</strong> уеб браузъра.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Всеки прозорец има три цветни бутона <strong>горе вляво</strong>. Жълтият прибира прозореца. <strong>Щракнете жълтия бутон.</strong>'
            : 'Всеки прозорец има три бутона <strong>горе вдясно</strong>. Чертата <strong>—</strong> прибира прозореца (минимизиране). <strong>Щракнете —</strong>.',
         hints: {'win-close': 'Това го затваря. Първо го приберете с ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Това го разгъща на цял екран. Първо го приберете.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Скрит е, не е затворен. ${os === 'mac' ? 'точката под иконата му в Dock' : 'line under its icon'} показва, че още е отворен. <strong>Щракнете иконата ${N.browser[os]}</strong>, за да го върнете.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Сега го разгънете на цял екран: <strong>щракнете бутона ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'На Mac червеният бутон затваря прозореца. Но приложението може да продължи да работи. Как да го спрете напълно?', options: [
                {t: 'Натискам ⟦command⟧ Cmd + Q или избирам Изход от менюто на приложението най-горе', ok: true, why: 'Да. Точка под приложение в Dock значи, че още работи. ⟦command⟧ Cmd + Q го спира.'},
                {t: 'Щраквам червения бутон два пъти', why: 'Червеният бутон само затваря прозорци. ⟦command⟧ Cmd + Q (или менюто на приложението > Изход) спира приложението.'}]}
            : {q: 'Къде е бутонът за затваряне на прозорец?', options: [
                {t: 'Горе вдясно: ⟦x⟧', ok: true, why: 'Да. При Windows и Linux Mint трите бутона са горе вдясно. (При Mac са горе вляво, в червено, жълто и зелено.)'},
                {t: 'Долу вляво', why: 'Горе вдясно е на всеки прозорец: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Браво!</strong> Можете да отваряте, скривате, връщате, уголемявате и затваряте прозорци. Това е по-голямата част от работата с компютър.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Начало' : 'Начало'], ['desktop', 'Работен плот'], ['documents', 'Документи'], ['downloads', 'Изтегляния'], ['pictures', 'Снимки']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB флашка']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Документи'], ['pictures', '⟦folder⟧', 'Снимки'], ['downloads', '⟦folder⟧', 'Изтегляния']],
            downloads: [['photo', '⟦image⟧', 'Holiday photo.jpg'], ['bill', '⟦file-text⟧', 'Council tax bill.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Holiday photo.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Holidays')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Letter to council.docx'], ['recipes', '⟦folder⟧', 'Рецепти']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Документи']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Нова папка', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Начало' : 'Начало', downloads: 'Изтегляния', pictures: 'Снимки', documents: 'Документи', usb: 'USB флашка', desktop: 'Работен плот'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Тази папка е празна</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Копиране' : 'Копиране';
    const pasteLabel = os => os === 'mac' ? 'Поставяне на елемента' : 'Поставяне';
    const newFolderLabel = os => os === 'mac' ? 'Нова папка' : os === 'windows' ? 'Ново > Папка' : 'Създаване на нова папка';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Снимките и писмата ви се пазят в <strong>папки</strong>. <strong>Щракнете ${N.files[os]}</strong>, за да ги разгледате.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'отляво в Dock' : 'на ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Отстрани са основните ви папки. Нещата, които изтегляте от имейли и уебсайтове, отиват в <strong>Изтегляния</strong>. <strong>Щракнете Изтегляния.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Отваряне'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Преименуване'], ['menu-delete', os === 'mac' ? 'Преместване в кошчето' : 'Изтриване']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Да копираме снимката от почивката в Снимки, където й е мястото. <strong>Щракнете с десния бутон</strong> върху <strong>Holiday photo.jpg</strong>: натиснете <strong>десния</strong> бутон на мишката. <em>' + (os === 'mac' ? 'На тъчпад щракнете с два пръста.' : 'На сензорен екран натиснете и задръжте.') + '</em>',
         hint: 'Ползвайте десния бутон на мишката върху снимката.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Появява се меню. <strong>Щракнете ${copyLabel(os)}.</strong> <em>(Клавишната комбинация е ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Не този! Щракнете Копиране.', 'menu-open': 'Това отваря снимката. Щракнете Копиране.', 'menu-rename': 'Щракнете Копиране.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Щракнете Снимки</strong> отляво.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Снимки е празна. <strong>Щракнете с десния бутон върху празното бяло място.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Щракнете ${pasteLabel(os)}.</strong> <em>(Или ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'След това ще направим папка. Първо щракнете ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Снимката вече е и в Снимки. Сега направете папка, за да държите снимките от почивка заедно. <strong>Щракнете с десния бутон върху празното място отново.</strong>', hints: {'rc-photo2': 'Щракнете с десния бутон върху празното място, не върху снимката.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Щракнете ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Първо въведете име на папката, например Holidays.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Въведете име,</strong> например <strong>Holidays</strong>, после <strong>щракнете OK</strong> (или натиснете Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Къде обикновено отиват файловете от имейли и уебсайтове?', options: [
            {t: 'В папката Изтегляния', ok: true, why: 'Да. Ако не можете да намерите нещо, което сте изтеглили, първо потърсете в Изтегляния.'},
            {t: 'На работния плот', why: 'Обикновено в Изтегляния. Потърсете първо там, ако не можете да намерите нещо.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Браво!</strong> Десният бутон е тайната на повечето неща: копиране, поставяне, преименуване и нова папка са в това меню.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Въведете паролата на мрежата</p>${field('wifipass', 'Парола', ctx)}<button type="button" class="ce co" data-tap="connect">Свързване</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi мрежи'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Свързани с Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `За да се свържете с Wi-Fi, <strong>щракнете символа на Wi-Fi</strong> ${os === 'mac' ? 'горе вдясно на екрана' : 'долу вдясно, близо до часовника'}.`, hint: os === 'mac' ? 'Намира се в лентата с менюта горе вдясно.' : 'Намира се близо до часовника долу вдясно.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Името на мрежата ви е на стикера на рутера. Тази тренировъчна е <strong>Home-WiFi-5G</strong>. <strong>Щракнете върху нея.</strong>', hints: {'net-neighbour': 'Това е на съседа! Изберете Home-WiFi-5G.', 'net-cafe': 'Това не е домашната ви мрежа. Изберете Home-WiFi-5G.', 'tray-wifi': 'Списъкът с Wi-Fi мрежи вече е отворен. Щракнете Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Въведете паролата точно: Green-Apple-42 (главни G и A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Въведете паролата от стикера <strong>точно</strong>: <strong>Green-Apple-42</strong>. После <strong>щракнете Свързване</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Панелът за Wi-Fi вече е отворен. Въведете паролата в полето, после щракнете Свързване.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'В кафене сте с безплатен Wi-Fi. Подходящ ли е за онлайн банкиране?', options: [
            {t: 'По-добре да изчакам до вкъщи или да ползвам мобилните данни на телефона си', ok: true, why: 'Да. Безплатният Wi-Fi е наред за разглеждане, но за банкиране ползвайте Wi-Fi вкъщи или мобилни данни.'},
            {t: 'Да, всеки Wi-Fi става', why: 'Безплатният обществен Wi-Fi е наред за разглеждане, но банкирането оставете за вкъщи или за мобилни данни.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Браво!</strong> Компютърът ви ще запомни паролата и следващия път ще се свърже сам.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Списък за пазаруване: мляко, хляб, яйца, чай, картичка за рождения ден на Jean';
        const note = pcWin(os, `Списък за пазаруване – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Нов имейл до Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Щракнете тук, за да пишете…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Поща' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Клавишните комбинации спестяват много щракане. <strong>${CMDL(os)}</strong> е клавишът ${os === 'mac' ? 'от двете страни на интервала, отбелязан с ⟦command⟧' : 'долу вляво на клавиатурата'}. За да изберете целия текст, задръжте <strong>${CMDL(os)}</strong> и натиснете <strong>A</strong>. <em>Ползвайте истинската си клавиатура или бутоните на екрана.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Избрано е. Сега го копирайте: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Копирано! <strong>Щракнете вътре в имейла</strong> до Sarah, където пише „Щракнете тук, за да пишете“.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Сега поставете: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Ами сега, изтрили сте нещо по погрешка. Коя комбинация го връща?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Да. ${CMDL(os)} + Z отменя последното, което сте направили, в почти всяко приложение. Натиснете я пак, за да отмените още.`},
            {t: 'Escape', why: `Escape затваря менюта. ${CMDL(os)} + Z е отмяна.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Как правите екранна снимка (снимка на екрана)?', options: [
            {t: os === 'windows' ? 'Клавиш Windows + Shift + S, после влачете върху желаното' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, после влачете върху желаното' : 'Натискам клавиша Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Да. Копира се и известие ви позволява да я запазите. Клавишът Print Screen също върши работа.' : os === 'mac' ? 'Да. Снимката се запазва на работния плот. Shift + ⟦command⟧ Cmd + 3 снима целия екран.' : 'Да. Linux Mint я запазва в папката Снимки. Shift + Print Screen ви позволява да изберете област.'},
            {t: 'Снимам екрана с телефона си', why: 'Става, но екранната снимка е много по-ясна. ' + (os === 'windows' ? 'Клавиш Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Натиснете Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Браво!</strong> Голямата четворка: <strong>${CMDL(os)} + C</strong> копиране, <strong>V</strong> поставяне, <strong>Z</strong> отмяна, <strong>A</strong> избиране на всичко. Работят в почти всяко приложение.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Безплатно', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Безплатно · Покупки в приложението', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Търсене на приложения</span></button><div class="hp"><span>ПРЕПОРЪЧАНО</span><strong>Приложения за новия ви компютър</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Отваряне' : (os === 'mac' ? 'Вземи' : 'Инсталирай')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Инсталиране на LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Тренировъчен магазин: имената и цените са примери.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Най-безопасното място за приложения е вграденият магазин: <strong>${N.store[os]}</strong>. <strong>Щракнете върху него.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Искате нещо, с което да пишете писма, като Word. <strong>Щракнете полето за търсене.</strong> Ще потърсим „office“.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> е безплатна алтернатива на Microsoft Office, направена от <strong>The Document Foundation</strong>. Проверете кой го е направил, после <strong>щракнете ' + (os === 'mac' ? 'Вземи' : 'Инсталирай') + ' до LibreOffice</strong>.',
         hints: {'get-fake1': 'Това е реклама и струва £29.99 на година. LibreOffice е безплатен.', 'get-fake2': 'Това е от AppMakers и има покупки в приложението. Изберете LibreOffice от The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Изскачащ прозорец на сайт казва „Компютърът ви е бавен! Изтеглете Speed Booster сега“. Какво правите?', options: [
            {t: 'Затварям го. Инсталирам приложения само от магазина или от сайта на производителя', ok: true, why: 'Точно така. Изскачащите прозорци, предлагащи „ускорители“ или „чистачи“, често са боклук или по-лошо.'},
            {t: 'Изтеглям го, може да помогне', why: 'Те често са боклук или вредни. Инсталирайте само от магазина или от сайта на производителя.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Браво!</strong> LibreOffice е инсталиран. Проверявайте производителя, игнорирайте реклами и се пазете от „безплатни“ приложения, които по-късно искат пари.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Начало'], ['system', 'Система'], ['bluetooth', 'Bluetooth и устройства'], ['network', 'Мрежа и интернет'], ['accounts', 'Профили'], ['privacy', 'Поверителност и сигурност'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Начало</h3><p class="cf">Препоръчани настройки и вашият профил.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Всичко е обновено</p>' : ctx.ready ? `<p class="cf">Нужно е рестартиране, за да завърши инсталирането на обновленията.</p><button type="button" class="ce co bz" data-tap="restart">Рестартиране сега</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Изтегляне… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Настройки', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Общи'], ['privacy', 'Поверителност и сигурност'], ['users', 'Потребители и групи']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Mac е обновен</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Изтегляне… остават около 10 минути' : 'Поправки за сигурността и грешки'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Поверителност и сигурност</h3><p class="cf"><strong>Сигурност</strong><br>Разрешаване на приложения от:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store и познати разработчици</button>`,
            };
            return pcWin(os, 'Системни настройки', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Системни настройки</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Мениджър на обновленията', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Системата ви е обновена</p>' : `<div class="ahf">${['Уеб браузър Firefox', 'Ядро на Linux (сигурност)', 'LibreOffice', 'Системни библиотеки'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Инсталиране на обновления…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Нужно е удостоверяване</strong></p><p class="fd">Въведете паролата си, за да инсталирате обновления. (Упражнение: въведена е вместо вас.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Отказ</button><button type="button" class="adg" data-tap="auth-ok">Удостоверяване</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Обновленията поправят пробойни в сигурността, които измамниците използват. Да проверим за такива. <strong>Щракнете Старт.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Щракнете Настройки</strong> (зъбното колело).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Щракнете Windows Update</strong>, най-долу в списъка отляво.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Има чакащи обновления. <strong>Щракнете Изтегляне и инсталиране на всички.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Първо запазете всичко, върху което работите, после <strong>щракнете Рестартиране сега</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Обновленията поправят пробойни в сигурността, които измамниците използват. <strong>Щракнете менюто на Apple</strong> (логото) горе вляво.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Щракнете Системни настройки…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Намирате се в Общи. <strong>Щракнете Обновяване на софтуера.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Обновление е готово. Включете зарядното, после <strong>щракнете Обнови сега</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac го изтегля, после се рестартира, за да го инсталира.',
         question: {q: 'Автоматичните обновления са включени. Трябва ли пак да правите нещо?', options: [
            {t: 'Само да рестартирам, когато поиска, и от време на време да го оставям на зарядно през нощта', ok: true, why: 'Да. Обновленията често се инсталират през нощта. Рестартирането, когато поиска, ги завършва.'},
            {t: 'Изключвам автоматичните обновления', why: 'Оставете ги включени: те ви пазят. Просто рестартирайте, когато Mac поиска.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Обновленията поправят пробойни в сигурността. В Linux Mint <strong>щитът</strong> до часовника показва точка, когато има чакащи обновления. <strong>Щракнете върху щита.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Мениджърът на обновленията ги изброява всичките. <strong>Щракнете Инсталиране на обновленията.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux иска <strong>вашата парола</strong>, преди да промени нещо важно. Това е добре. <strong>Щракнете Удостоверяване.</strong>', hints: {'auth-cancel': 'Това отказва обновленията. Щракнете Удостоверяване.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Колко често трябва да инсталирате обновления?', options: [
            {t: 'Всеки път, когато щитът показва точка: отнема само минута', ok: true, why: 'Да. Linux Mint рядко се нуждае от рестартиране, освен при някои обновления за сигурност.'},
            {t: 'Веднъж годишно', why: 'Инсталирайте ги, когато щитът показва точка. Отнема само минута.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Браво!</strong> Компютърът ви е обновен. Поддържането му обновен е най-доброто, което можете да направите, за да сте в безопасност.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Система', 'Екран, звук, информация'], ['tile-devices', '⟦printer⟧', 'Устройства', 'Bluetooth, принтери'], ['tile-network', '⟦globe⟧', 'Мрежа и интернет', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Профили', 'Вашите сметки'], ['tile-update', '⟦refresh-cw⟧', 'Обновяване и сигурност', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Компютърът ви е записан за разширени обновления за сигурност</p><p class="cf">Обновления за сигурност до 12 октомври 2027 г.</p>' : `<div class="ahg"><strong>Поддръжката на Windows 10 приключи</strong><p>Компютърът ви не отговаря на изискванията за Windows 11. Запишете се за разширени обновления за сигурност, за да продължите да получавате обновления за сигурност.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Запишете се сега</button></div>`}`;
        else inner = `<h3>Разширени обновления за сигурност</h3><p class="cf">Изберете как да се запишете:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Резервно копие на настройките на компютъра</strong><small>Безплатно, с акаунт в Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Използване на 1000 точки Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Еднократна покупка</strong><small>Платено</small></button>${ctx.busy ? '<p class="cf">Записване…</p>' : ''}`;
        return pcWin('windows', 'Настройки', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Ако компютърът ви изглежда така, със Старт най-вляво, може да е <strong>Windows 10</strong>. Да проверим. <strong>Щракнете Старт.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Щракнете Настройки</strong> (зъбното колело).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Щракнете Система.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Пише Windows 10 Home. Какво значи това през 2026 г.?', options: [
            {t: 'Microsoft спря обичайната поддръжка през октомври 2025 г. Още работи, но му трябват разширени обновления за сигурност, за да е безопасен', ok: true,
             why: 'Да. Безплатната програма за разширени обновления за сигурност за домашни потребители вече продължава до 12 октомври 2027 г. След това Windows 10 не получава повече поправки за сигурност.'},
            {t: 'Нищо, Windows 10 ще се обновява завинаги', why: 'Обичайната поддръжка приключи през октомври 2025 г. Разширените обновления за сигурност вече продължават до 12 октомври 2027 г., после спират.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Щракнете ← Начало,</strong> за да се върнете.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Щракнете Обновяване и сигурност.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Този лаптоп е твърде стар за Windows 11, затова Windows предлага <strong>разширени обновления за сигурност</strong>. <strong>Щракнете Запишете се сега.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Безплатният начин е да направите резервно копие на настройките си в акаунт в Microsoft. <strong>Щракнете Резервно копие на настройките на компютъра.</strong>', hints: {'esu-buy': 'Не е нужно да плащате. Изберете безплатния вариант с резервно копие.', 'esu-points': 'Това работи, ако имате точките, но вариантът с резервно копие е безплатен за всички.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Какви са възможностите ви преди октомври 2027 г.?', options: [
            {t: 'Да надстроя до Windows 11, ако може, да купя нов компютър или да сменя по-стар с Linux Mint (безплатен)', ok: true, why: 'Да. Linux Mint е безплатен и работи добре на по-стари лаптопи. Следващите уроци показват къде са нещата на Mac и в Linux Mint.'},
            {t: 'Да продължа да ползвам Windows 10 за банкиране след 2027 г.', why: 'След октомври 2027 г. не получава поправки за сигурност, така че не е безопасен за банкиране. Надстройте, сменете или преминете на Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Браво!</strong> Знаете кой Windows имате и как да го пазите безопасен до октомври 2027 г. Пазете се от обаждания или изскачащи прозорци, които предлагат да ви „надстроят“ срещу такса: това са измами.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Преминавате от Windows? На Mac приложенията са в <strong>Dock</strong> най-долу, а менютата на всяко приложение са в <strong>лентата с менюта</strong> най-горе. <strong>Щракнете Safari,</strong> уеб браузъра, в Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Бутоните на прозореца са <strong>горе вляво</strong> на Mac. <strong>Щракнете червения</strong>, за да затворите прозореца.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Прозорецът изчезна, но виждате ли <strong>точката под Safari</strong> в Dock? Още работи. За да го спрете, <strong>щракнете с десния бутон върху Safari в Dock</strong> (два пръста на тъчпада).', hint: 'Щракнете с десния бутон (или с два пръста) върху иконата на Safari в Dock.',
         hints: {'app-browser': 'Обикновеното щракване го отваря пак. Щракнете с десния бутон.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Щракнете Изход.</strong> <em>(Клавишната комбинация е ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Настройките са под <strong>менюто на Apple</strong> (логото) горе вляво. <strong>Щракнете върху него.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Изключване и Рестартиране също са тук. <strong>Щракнете Системни настройки…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системни настройки', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'В Windows копирате с Ctrl + C. Как е на Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Да. Повечето комбинации от Windows ползват ⟦command⟧ Cmd на Mac вместо Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, същото', why: 'На Mac е ⟦command⟧ Cmd + C. Повечето комбинации с Ctrl стават с ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системни настройки', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Браво!</strong> Dock най-долу, менюта най-горе, бутони на прозореца горе вляво, ⟦command⟧ Cmd вместо Ctrl и менюто на Apple за настройки и изключване.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> е безплатна система, която работи много като Windows и върви добре на по-стари компютри. Приложенията ви са в <strong>Менюто</strong>, долу вляво, като бутона Старт. <strong>Щракнете Меню.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint идва с безплатни приложения, вече инсталирани. За писма ползвайте <strong>LibreOffice Writer</strong>, който работи като Microsoft Word. <strong>Щракнете върху него.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">File Edit View Insert Format <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Уважаеми господине или госпожо,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Можете ли да отваряте Word документи, които хората ви пращат по имейл?', options: [
            {t: 'Да. LibreOffice отваря и запазва файлове на Word (.docx)', ok: true, why: 'Да. Когато запазвате нещо, което ще изпратите на потребител на Word, изберете формата на Word (.docx) в „Запиши като“.'},
            {t: 'Не, за това ви трябва Windows', why: 'LibreOffice отваря и запазва файлове на Word (.docx), така че можете да си разменяте документи с потребители на Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Уважаеми господине или госпожо,</div></div>', {max: true})}),
         target: 'win-close', say: 'Бутоните на прозореца са горе вдясно, точно като в Windows. <strong>Щракнете ⟦x⟧,</strong> за да затворите Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Сега да намерим откъде се вземат още приложения. <strong>Щракнете Меню</strong> отново.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Мениджърът на софтуера</strong> е безплатният магазин за приложения на Linux Mint. <strong>Щракнете върху него.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Мениджър на софтуера', `<div class="jo"><div class="gq">${ICON.search}<span>Търсене</span></div>
            <div class="aan">${['Интернет', 'Офис', 'Графика', 'Звук и видео', 'Игри', 'Достъпност'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Хиляди безплатни приложения, проверени от Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Трябва ли да купувате антивирусна програма за Linux Mint?', options: [
            {t: 'Не. Дръжте го обновен, вземайте приложения от Мениджъра на софтуера и сте добре защитени', ok: true, why: 'Не. Linux има малко вируси. Обновленията и вградената защитна стена вършат работа. Измамите по имейл и в сайтове важат и тук, затова бъдете бдителни.'},
            {t: 'Да, най-скъпата', why: 'Не. Дръжте го обновен и вземайте приложения от Мениджъра на софтуера. Пазете се от измами по имейл и в сайтове както обикновено.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Браво!</strong> Менюто долу вляво, затваряне горе вдясно, LibreOffice за документи, Firefox за интернет, Мениджър на софтуера за приложения и щитът за обновления.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB флашката е свързана</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Преди да смените компютъра, копирайте файловете си на <strong>USB флашка</strong>. Пъхнете я в USB порт отстрани на компютъра. Тук <strong>щракнете Включване на USB флашка</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB флашката е свързана</div>'}), target: 'app-files', say: `<strong>Отворете ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Отваряне'], ['menu-copy', 'Копиране'], ['menu-rename', 'Преименуване']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Писмата ви са в <strong>Документи</strong>. <strong>Щракнете с десния бутон върху папката Документи.</strong> <em>(После направете същото със Снимки.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Щракнете Копиране.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'USB флашката ви е отляво. <strong>Щракнете USB флашка.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Празна е. <strong>Щракнете с десния бутон върху празното място.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Щракнете ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Копиране на 214 елемента… остава 1 минута' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Изваждане']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Готово! Преди да извадите флашката, <strong>извадете я безопасно,</strong> за да не се повреди нищо. <strong>Щракнете с десния бутон върху USB флашка</strong> отляво.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Щракнете Изваждане.</strong> Тогава е безопасно да я извадите.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Друг начин да преместите файлове на нов компютър?', options: [
            {t: 'Онлайн хранилище: OneDrive, iCloud или Google Drive', ok: true, why: 'Да. Качете от стария компютър, влезте на новия и всичко е там. USB флашката също е добро допълнително копие.'},
            {t: 'Изпращам си всеки файл по имейл един по един', why: 'Това би отнело цяла вечност! Ползвайте USB флашка или онлайн хранилище като OneDrive, iCloud или Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Браво!</strong> На новия компютър включете флашката, отворете я и копирайте папките в Документи и Снимки.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Часове на автобусите в Bridlington ⟦star⟧ Рецепти</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Не сте влезли</span><button type="button" data-tap="sync">Включване на синхронизирането…</button><button type="button" data-tap="guest">Отваряне на гост профил</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Вход с Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Упражнение: въведено е вместо вас.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Напред</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Да включите ли синхронизирането?</strong></p><p class="fd">Отметките, паролите и историята ви ще се запазят във вашия профил в Google и ще се появят на всичките ви устройства.</p><div class="jn"><button type="button" data-tap="cancel">Отказ</button><button type="button" class="adg" data-tap="yes-in">Да, включвам</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Нов раздел</span>${profile}</div><div class="qn">⟦search⟧ Търсете в Google или въведете URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Синхронизиране на отметките ви…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Ако сте ползвали <strong>Chrome</strong> на стария си компютър, влизането пренася отметките и запазените ви пароли на новия. (Firefox и Edge работят по същия начин.) <strong>Щракнете Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Щракнете иконата на човек</strong> горе вдясно.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Щракнете Включване на синхронизирането…</strong>', hints: {guest: 'Гост профилът не запазва нищо. Щракнете Включване на синхронизирането.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Влезте с <strong>същия профил в Google,</strong> който ползвахте на стария компютър. <strong>Щракнете Напред.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Щракнете Да, включвам.</strong>', hints: {cancel: 'Това спира синхронизирането. Щракнете Да, включвам.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Отметките ви са обратно. Безопасно ли е да запазвате пароли в браузъра?', options: [
            {t: 'Да, ако профилът ви в Google има силна парола и потвърждаване в две стъпки', ok: true, why: 'Да. Много по-безопасно е от една и съща парола навсякъде. Защитете самия профил с потвърждаване в две стъпки.'},
            {t: 'Не, ще ги напиша на лепяща бележка на екрана', why: 'Мениджърът на пароли в браузъра е много по-безопасен от бележка на екрана, стига профилът ви да има потвърждаване в две стъпки.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Браво!</strong> Отметките и паролите ви ви последваха. На обществен или споделен компютър не включвайте синхронизирането.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Система'} Предупреждение за сигурността ⚠️</strong>
            <p>Компютърът ви е ЗАРАЗЕН с 5 вируса! Банковите ви данни и снимки са в опасност.</p><p>Не изключвайте компютъра. Обадете се на поддръжката сега:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Обади се сега</button><button type="button" data-tap="fake-close">Затвори</button></div>
            <small>(Тренировъчна измамна страница. Номерът не е истински.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Да напуснете ли сайта?</strong></p><p class="fd">Направените от вас промени може да не бъдат запазени.</p><div class="jn"><button type="button" data-tap="stay">Оставам</button><button type="button" class="adg" data-tap="leave">Напускам</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Това изведнъж е запълнило екрана ви, докато сте разглеждали. Истинско ли е?', options: [
            {t: 'Не. Фалшив сайт е, който се опитва да ви уплаши, за да се обадите на измамници', ok: true, why: 'Точно така. Истинските предупреждения никога не показват телефонен номер за обаждане. Не звънете и не щраквайте нищо по страницата.'},
            {t: 'Да, обаждам се бързо на номера', why: 'Никога не звънете. Това е фалшива страница. „Поддръжката“ ще се опита да поеме контрола над компютъра и парите ви.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Запълнило е целия екран, така че не виждате как да го затворите. Натиснете клавиша <strong>Esc</strong> (горе вляво на клавиатурата), за да излезете от цял екран.',
         hints: {'call-btn': 'Никога! Натиснете клавиша Esc.', 'fake-close': 'Бутоните на страницата може да са капани. Вместо това натиснете клавиша Esc на клавиатурата.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Сега виждате браузъра. <strong>Затворете раздела</strong> с ⟦x⟧.',
         hints: {'call-btn': 'Не щраквайте нищо по страницата. Затворете раздела с ⟦x⟧.', 'fake-close': 'Това е част от измамната страница. Ползвайте ⟦x⟧ на самия раздел.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Опитва се да ви задържи там. <strong>Щракнете Напускам.</strong>', hints: {stay: 'Щракнете Напускам.'}},
        {screen: c => scareware(os, c), question: {q: 'Ами ако изобщо не се затваря?', options: [
            {t: os === 'windows' ? 'Натискам Ctrl + Shift + Esc, за да отворя Диспечера на задачите, избирам браузъра и щраквам Прекратяване на задачата' : os === 'mac' ? 'Натискам ⟦command⟧ Cmd + Option + Esc и принудително затварям браузъра' : 'Щраквам с десния бутон върху браузъра в панела и избирам Затваряне, или рестартирам компютъра',
             ok: true, why: 'Да. Когато отворите браузъра отново, не му позволявайте да възстанови старите страници. Рестартирането на компютъра също върши работа.'},
            {t: 'Звъня на номера, за да ми помогнат да го затворя', why: 'Никога не звънете. ' + (os === 'windows' ? 'Ползвайте Ctrl + Shift + Esc (Диспечер на задачите), за да затворите браузъра.' : os === 'mac' ? 'Ползвайте ⟦command⟧ Cmd + Option + Esc за принудително затваряне.' : 'Затворете браузъра от панела или рестартирайте.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Браво!</strong> Компютърът ви никога не е бил заразен: това беше просто уеб страница. Ако сте звънели на такъв номер, свържете се с банката си и сменете паролите си от друго устройство.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Защита на Windows', `<div class="aif"><h3>Защита от вируси и заплахи</h3><p class="mj">⟦check⟧ Няма текущи заплахи</p>
                <p class="cf">Последно сканиране: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Изпълнява се бързо сканиране… сканирани са 12 840 файла</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Защита от вируси</span><span>⟦check⟧ Защитна стена</span><span>⟦check⟧ Контрол на приложения и браузър</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Конфигурация на защитната стена', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Защитната стена е включена</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows има вградена безплатна антивирусна защита, наречена <strong>Windows Security</strong>. Да проверим дали работи. <strong>Щракнете Старт.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Щракнете Настройки.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Щракнете Поверителност и сигурност</strong> отляво.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Щракнете Windows Security.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Зелените отметки значат, че сте защитени. За спокойствие <strong>щракнете Бързо сканиране</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Трябва ли да плащате и за друга антивирусна програма?', options: [
            {t: 'Не. Windows Security стига за повечето хора, а две могат да забавят компютъра', ok: true, why: 'Да. Дръжте Windows обновен и Windows Security включена. Платените често само добавят изскачащи прозорци и абонаменти.'},
            {t: 'Да, колкото повече, толкова по-добре', why: 'Две антивирусни програми могат да се сблъскат и да забавят системата. Windows Security стига за повечето хора.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac има вградена безплатна защита, която проверява приложенията и файловете във фонов режим. Да проверим една настройка. <strong>Щракнете менюто на Apple</strong> (логото).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Щракнете Системни настройки…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Щракнете Поверителност и сигурност</strong> отляво.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Избрано е „Разрешаване на приложения от App Store и познати разработчици“. Трябва ли да го промените?', options: [
            {t: 'Не, оставям го. Блокира приложения от непознати производители', ok: true, why: 'Да. Ако сайт ви каже да промените това, за да инсталирате нещо, това е сериозен знак за опасност.'},
            {t: 'Да, разрешавам приложения отвсякъде', why: 'Оставете го както е. Спира приложения от непознати производители. Сайт, който ви казва да го промените, е знак за опасност.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системни настройки', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Трябва ли да купувате антивирусна програма за Mac?', options: [
            {t: 'Повечето хора не. Дръжте го обновен и инсталирайте приложения само от доверени места', ok: true, why: 'Да. Обновленията и вградената защита вършат работа. Изскачащите прозорци, които казват, че Mac е заразен, са измами.'},
            {t: 'Да, от който изскачащ прозорец я предложи', why: 'Изскачащите прозорци, които предлагат антивирусна за Mac, обикновено са измами. Вместо това дръжте Mac обновен.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint има вградена <strong>защитна стена</strong>, която блокира нежелани връзки. Изключена е, докато не я включите. <strong>Щракнете Меню.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Щракнете Защитна стена.</strong> <em>(Потърсете „firewall“ в Менюто, ако не я виждате.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Щракнете превключвателя Състояние,</strong> за да включите защитната стена.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Какво друго пази Linux Mint?', options: [
            {t: 'Инсталиране на обновления, когато щитът показва точка, и вземане на приложения от Мениджъра на софтуера', ok: true, why: 'Да. И обичайните правила: бъдете внимателни с връзки в имейли и изскачащи прозорци.'},
            {t: 'Нищо друго не е нужно', why: 'Продължавайте да инсталирате обновления и вземайте приложения от Мениджъра на софтуера. Измамите по имейл и в сайтове още важат.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Браво!</strong> Вградената защита на компютъра ви е включена. Обновленията, вниманието към връзките и инсталирането само от доверени места правят останалото.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Parcel Delivery</strong><span>Пропуснахме ви: уговорете доставка наново днес</span></button>
            <div class="lx"><strong>Sarah</strong><span>Снимки от неделя</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Разходката в събота</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Parcel Delivery</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Опитахме се да доставим пратката ви днес, но нямаше никого вкъщи. Необходима е такса от £1.45, за да се уговори нова доставка.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Нова доставка</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Докладване на фишинг</button><button type="button" data-tap="reply">Отговор</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Поща', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Докладвано и преместено в Спам</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Ето имейла ви, в браузъра. <strong>Отворете имейла от Parcel Delivery.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'На компютър можете да проверите накъде наистина води една връзка, <strong>без да щраквате върху нея</strong>. <strong>Преместете мишката върху „Нова доставка“</strong> и я задръжте неподвижна. <em>(На сензорен екран натиснете и задръжте.)</em>',
         hints: {'click-link': 'Не щраквайте! Просто задръжте показалеца на мишката върху нея.'}, hint: 'Задръжте показалеца на мишката върху синята връзка, без да щраквате.'},
        {screen: c => webmail(os, c), question: {q: 'Истинският адрес се появява най-долу: parcel-redelivery.example.top. Безопасен ли е?', options: [
            {t: 'Не. Не е сайт на истинска куриерска фирма и искат такса', ok: true, why: 'Да. Куриерите не искат малки такси по имейл или съобщение. Истинският адрес издава измамата.'},
            {t: 'Да, в него пише „parcel“', why: 'Всеки може да сложи „parcel“ в уеб адрес. Не е истински куриер, а таксата е измамата.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Щракнете Докладване на фишинг.</strong> Можете да препращате измамни имейли и на report@phishing.gov.uk.', hints: {reply: 'Никога не отговаряйте на измамници. Щракнете Докладване на фишинг.', 'click-link': 'Не щраквайте връзката! Докладвайте го вместо това.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Браво!</strong> Спрете мишката върху връзката, преди да щракнете: ако адресът не съвпада с фирмата, не щраквайте.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (примерен номер). Това е истинският код за намиране на IMEI на телефона ви.',
        '999': 'Това е тренировъчен телефон, така че не може да звъни на 999. При истински спешен случай звъннете на 999 или 112.',
        '112': 'Това е тренировъчен телефон, така че не може да звъни на 112. 112 работи точно като 999 във Великобритания и в цяла Европа.',
        '159': '159 ви свързва безопасно с вашата банка. Ползвайте го, ако обаждане за парите ви ви тревожи.',
        '7726': 'На 7726 препращате измамни съобщения. На старите телефонни клавиатури изписва „SPAM“!',
        '123': 'speaking-clock',
        '1471': 'Телефонен номер 07700 900842 се обади днес в 11:20. (Упражнение. 1471 ви казва кой последно е звънил на стационарния ви телефон.)',
        '01189998819991197253': 'Това е спешният номер от The IT Crowd. Пробвахте ли да го изключите и включите отново?',
        '101': '101 е номерът на полицията за неща, които не са спешни.',
        '111': '111 е помощта на NHS, когато е спешно, но не е животозастрашаващо.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Телефон', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Въведете номер</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Мама', '#f472b6', [['them', 'Мислех, че LOL значи „lots of love“ (много любов). Пишех го навсякъде!'], ['them', 'Заради това ли леля ти не е отговорила?'], ['them', 'Изпратено от моя iPad']]],
        ['Непознат', '#94a3b8', [['them', 'Поздравления! Спечелихте БЕЗПЛАТЕН телефон. Щракнете тук, за да го вземете: prize-winner.example'], ['note', 'Това е измама. Не докосвайте връзката: препратете го на 7726, после го изтрийте.']]],
        ['Sarah', '#a78bfa', [['them', 'Татко се учи да ползва емотикони 😂'], ['them', 'Прати ми патладжан и каза „за вечеря довечера?“ 🍆']]],
        ['Зъболекар', '#38bdf8', [['them', 'Напомняне: прегледът ви е във вторник в 10:30. Отговорете Y за потвърждение.']]],
    ];
    const MUM_REPLIES = ['Кой е това?', 'Обади ми се, не мога да чета съобщения без очилата си', 'Чудесно! 👍', 'Получи ли последното ми съобщение? Пратих го на котката по погрешка.', 'Изпратено от моя iPad', 'Добре, мила xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Съобщения', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Чайката удря отново' : 'Снимка', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Заловена на местопрестъплението на крайбрежната улица в Bridlington. Чипсът не е възстановен.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Снимки', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Часовник', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Времето', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Студено, със снежен вятър' : 'Слънчеви интервали, ветровито'}</p>
            <div class="ajf">${[['Пет', '⟦cloud-rain⟧', '11°'], ['Съб', '⟦wind⟧', '10°'], ['Нед', '⟦sun⟧', '14°'], ['Пон', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Предупреждение за чайки: <strong>високо</strong>. Пазете чипса си.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'През гардероба, после продължете покрай уличната лампа.', home: 'Няма като у дома. 🏠', 'луната': '384 400 километра. Трафикът е слаб.',
        chips: 'Най-близката рибарница: навсякъде по крайбрежната улица на Bridlington. 🍟', 'north pole': 'Работилницата на Дядо Коледа. Затворена до декември. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Прекрасно място!',
        'flamborough': 'Flamborough Head: фар, скали и тъпанари. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `„${inp.value.trim()}“: тази тренировъчна карта познава само няколко места. Опитайте Bridlington, Flamborough или Нарния.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Настройки', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Самолетен режим' : 'Самолетен режим', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Тъмен режим', st.dark)}${row('dnd', 'Не безпокойте', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Информация' : 'Информация за телефона'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Информация' : 'Информация за телефона', `<div class="aic"><div class="lq">
            <div class="ho"><span>Име</span><b>Телефонът на Margaret</b></div>
            <div class="ho"><span>Модел</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Версия на iOS' : 'Версия на Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Хранилище</span><b>Предостатъчно за снимки на внуците</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Сериен номер</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Класическата игра от старите мобилни телефони.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Съдържа реклами · Покупки в приложението'], ['knit', '⟦scissors⟧', 'Knitting Patterns', 'Очаквайте скоро в този тренировъчен магазин.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Магазин', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Отваряне' : (p === 'ios' ? 'Вземи' : 'Инсталирай')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Резултат: <b class="ado">0</b></span><span>Рекорд: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Докоснете посока (или ползвайте стрелките), за да започнете</p>
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
                f.querySelector('.vy').textContent = `Край на играта! Резултат ${score}. Докоснете посока, за да играете пак.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Самолетен режим', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Не безпокойте', st.dnd)}${t('torch', '⟦flashlight⟧', 'Фенерче', st.torch)}${t('dark', '⟦sun-moon⟧', 'Тъмен режим', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Плъзнете нагоре, за да затворите' : 'Затвори'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Нов тапет');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `„При третия сигнал точното време ще бъде ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} и ${t.getSeconds()} секунди… бип, бип, бип.“ (Старият говорещ часовник!)`; return; }
                msg.textContent = egg || (n ? 'Този тренировъчен телефон не може да прави истински обаждания. Опитайте 123, 1471 или *#06#…' : 'Първо въведете номер.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Моля, изпратете банковите си данни, за да вземете наградата си!!! (Това е измама. Блокирайте този номер.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Благодарим ви, прегледът ви е потвърден. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Поща', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Старт'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Стоп'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Старт'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Намазан със слънцезащитен крем! Почти като Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Фенерчето е включено. (Екранът свети вместо светлината отзад.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Самолетният режим е включен: без обаждания, съобщения и мобилни данни.' : 'Самолетният режим е изключен.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Тапетът е сменен. Идете на началния екран, за да го видите!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Вече сте разработчик! (Истинска тайна на Android: докоснете Номер на компилацията 7 пъти.)' : st.build >= 3 ? `Остават ви още ${7 - st.build} стъпки, за да станете разработчик.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Благодарим, че упражнявахте!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Не ви трябва приложение за фенерче: вградено е в бързите настройки на телефона. Безплатните приложения за фенерче често са пълни с реклами или по-лошо!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Само за показ в тренировъчния магазин.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Инсталиране…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Отваряне'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Приложение', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Това тренировъчно приложение е част от собствен урок. Разгледайте курсовете в „Учете“, за да го опитате както трябва.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Открихте тайна!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Обаждането приключи' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Непознат' ? 'Обаждащ се' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Непознат', number: '0161 496 0423', who: 'm', tag: 'Не е в контактите ви',
         intro: 'Телефонът ви звъни. Номерът не е запазен в контактите ви. <strong>Отговорете,</strong> за да упражните. <em>Усилете звука, за да чуете обаждащия се.</em>',
         lines: [
            {text: 'Здравейте, обажда се Mark от отдела за измами на вашата банка. Забелязахме подозрителни плащания по сметката ви. Преди да продължа, можете ли да потвърдите пълното си име, рождената си дата и дългия номер на банковата си карта?',
             q: 'Обаждащият се казва, че е от банката ви. Какво правите?', options: [
                {t: 'Давам данните, от банката е', why: 'Банка, която ви се обажда, никога няма да поиска пълния номер на картата ви. Така измамниците получават данните ви.'},
                {t: 'Казвам, че ще се обадя на банката си на номера от картата ми, и затварям', ok: true, why: 'Точно така. Звъннете на номера от картата си, ако може от друг телефон, или набройте 159.'},
                {t: 'Моля го да докаже кой е', why: 'Измамниците звучат убедително и често вече знаят част от данните ви. Най-безопасно е да затворите и сами да позвъните на банката си.'}]},
            {text: 'Моля, не затваряйте! Престъпници взимат пари от сметката ви в този момент. Трябва да преместите всичко в безопасна сметка, която ще ви открия. Трябва да го направим в следващите десет минути.',
             q: 'Казва, че е спешно и трябва да преместите парите си. Какво сега?', options: [
                {t: 'Местя парите бързо, преди да е станало късно', why: 'Не съществува „безопасна сметка“. Банката ви никога няма да ви иска да местите пари. Това е измамата.'},
                {t: 'Затварям. Истинска банка никога не иска да местите пари в „безопасна сметка“', ok: true, why: 'Да. Бързането и „безопасната сметка“ издават измамата. Затворете и набройте 159.'}]}],
         hang: 'Затворете с червения бутон.'},
        {letter: '?', color: '#64748b', name: 'Непознат', number: '020 7946 0815', who: 'robot', tag: 'Не е в контактите ви',
         intro: 'Ново обаждане. <strong>Отговорете.</strong>',
         lines: [
            {text: 'Това е автоматично съобщение от HMRC. Издадена е заповед за арестуването ви заради неплатен данък. За да говорите със служител, натиснете 1 сега.',
             q: 'Записан глас казва, че ще бъдете арестувани заради данъци. Какво правите?', options: [
                {t: 'Натискам 1, за да се оправя', why: 'Натискането на 1 ви свързва с измамници, които ще поискат плащане, често с карти за подаръци. HMRC никога не заплашва с арест в записано съобщение.'},
                {t: 'Затварям. HMRC не звъни със заплахи за арест', ok: true, why: 'Правилно. HMRC първо ви пише и никога не заплашва с арест по телефона.'}]}],
         hang: 'Затворете.'},
        {letter: '?', color: '#64748b', name: 'Непознат', number: '0113 496 0332', who: 'm', tag: 'Не е в контактите ви',
         intro: 'Телефонът ви пак звъни. <strong>Отговорете.</strong>',
         lines: [
            {text: 'Здравейте, обаждам се от техническия отдел на Windows. Компютърът ви ни изпраща съобщения за грешки и има много опасен вирус. Моля, идете да включите компютъра и ще ви помогна да го оправите.',
             q: 'Казва, че компютърът ви има вирус. Какво правите?', options: [
                {t: 'Включвам компютъра и следвам указанията му', why: 'Би ви помолил да инсталирате програма, която му позволява да управлява компютъра ви, после да поиска пари. Microsoft никога не звъни така.'},
                {t: 'Затварям. Компютърните фирми не звънят за вируси', ok: true, why: 'Точно така. Никога не пускайте обаждащ се в компютъра си.'},
                {t: 'Обяснявам, че нямам компютър', why: 'Не е нужно да обяснявате или да спорите. Просто затворете.'}]}],
         hang: 'Затворете.'},
        {letter: '?', color: '#64748b', name: 'Непознат', number: '0808 157 0190', who: 'f', tag: 'Не е в контактите ви',
         intro: 'Ново обаждане. <strong>Отговорете.</strong>',
         lines: [
            {text: 'Здравейте. В онлайн акаунта ви за пазаруване е направена поръчка за нов iPhone на стойност деветстотин деветдесет и девет паунда. Ако не сте направили тази поръчка, натиснете 1, за да я анулирате и да говорите с екипа ни.',
             q: 'Не сте поръчвали iPhone. Какво правите?', options: [
                {t: 'Натискам 1, за да анулирам поръчката', why: 'Натискането на 1 ви свързва с измамник, който ще ви „възстанови“ парите, като поиска банковите ви данни или контрол над компютъра ви.'},
                {t: 'Затварям, после сам проверявам акаунта си в приложението или на сайта', ok: true, why: 'Да. Ако наистина имаше поръчка, щяхте да я видите в акаунта си. Никога не ползвайте номер или бутон, който ви даде обаждащ се.'}]}],
         hang: 'Затворете.'},
        {letter: 'S', color: '#16a34a', name: 'Кабинет', number: '01632 960211', who: 'f', tag: 'Запазен в контактите ви',
         intro: 'Още едно обаждане: този път е кабинетът на личния лекар, запазен в контактите ви. <strong>Отговорете.</strong>',
         lines: [
            {text: 'Здравейте, обажда се Sue от кабинета. Само бързо напомняне, че ваксината ви срещу грип е записана за вторник в десет часа. Не е нужно да правите нищо. Ако искате да я промените, позвънете ни на обичайния номер. Довиждане!',
             q: 'Това обаждане измама ли е?', options: [
                {t: 'Да: затварям и блокирам номера', why: 'Това е наред! Не поиска нищо, не ви притесни и ви каза да ползвате обичайния номер.'},
                {t: 'Вероятно е истинско: не поиска пари или данни и каза да звъните на обичайния номер', ok: true, why: 'Точно така. Истинските обаждания не ви притискат. Ако някога не сте сигурни, звъннете обратно на номера, който вече имате.'}]}],
         hang: 'Обаждането приключи. <strong>Докоснете червения бутон,</strong> за да затворите.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Обаждане ${n + 1} от ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'В истинския живот е нормално да не вдигате непознати номера! За това упражнение докоснете зеления бутон, за да отговорите.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Кое от тези е признак за измамно обаждане?', options: [
            {t: 'Бързат ви, заплашват ви или ви казват да го запазите в тайна', ok: true, why: 'Да. Натискът е най-голямата издайническа черта. Истинският обаждащ се няма нищо против да не бързате и да звъннете обратно.'},
            {t: 'Обаждащият се знае името ви', why: 'Измамниците често знаят името ви и дори част от данните на акаунта ви. Само това не прави обаждането истинско.'},
            {t: 'Номерът изглежда местен', why: 'Измамниците могат да накарат всеки номер да се покаже на екрана ви, дори местен или на банката ви. Не вярвайте на номера.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Браво!</strong> Затворихте на четирима измамници и разпознахте истинското обаждане. Запомнете: ако се съмнявате, затворете и звъннете обратно на номер, на който вярвате. За банката си набройте 159.'},
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
            ios: ['iPhone', 'От Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola и други'],
            windows: ['Windows', 'Повечето лаптопи и настолни компютри'], mac: ['Mac', 'От Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu и други'],
        };
        const notSure = isPC
            ? 'Погледнете екрана си. Windows има бутон Старт (четири малки квадрата) най-долу. Mac има лого на Apple горе вляво. Linux Mint има бутон Меню долу вляво.'
            : 'iPhone има лого на Apple (ябълка с отхапано парче) отзад. Ако вашият няма, почти със сигурност е Android телефон.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Кой ${isPC ? 'компютър ползвате' : 'телефон имате'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Не сте сигурни?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Покажи ми къде</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Чуй отново</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Стъпка назад</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Смени ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">УПРАЖНЕНИЕ ${isPC ? 'КОМПЮТЪР' : 'ТЕЛЕФОН'}: не е истински. Нищо, което правите тук, не се изпраща никъде.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Изключване на гласа' : 'Включване на гласа'; };
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
            showBtn.textContent = 'Обратно към урока';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Покажи ми къде';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Готово!' : `Стъпка ${i + 1} от ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Правилно!' : 'Не съвсем.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Продължи</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Опитай пак</button>${pageNext
                ? `<button type="button" class="ap vb">Добра работа! ${last ? 'Сега завършете курса' : 'Защо не опитате следващия урок'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Не съвсем. ' + (step.hint || 'Прочетете указанията още веднъж.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Още не е точно. Прочетете указанията още веднъж.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Не съвсем. ' + (step.hint || 'Прочетете указанията още веднъж.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Приложение';
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
                else hint.textContent = 'Щракнете с десния бутон: натиснете десния бутон на мишката. На тъчпад на Mac щракнете с два пръста. На сензорен екран натиснете и задръжте.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Дръжте пръста си (или бутона на мишката) натиснат върху него, докато нещо се случи.';
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
                showBtn.textContent = 'Покажи ми къде';
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
