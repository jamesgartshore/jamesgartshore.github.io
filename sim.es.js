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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play Store'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Teléfono', '#22c55e', ICON.phone], ['messages', 'Mensajes', '#22c55e', ICON.bubble], ['camera', 'Cámara', '#6b7280', ICON.camera],
               ['photos', 'Fotos', '#e5e7eb', ICON.photos], ['mail', 'Correo', '#3b82f6', ICON.mail], ['clock', 'Reloj', '#111827', ICON.clock],
               ['weather', 'El tiempo', '#38bdf8', ICON.weather], ['maps', 'Mapas', '#22c55e', ICON.map], ['settings', 'Ajustes', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Teléfono', '#2563eb', ICON.phone], ['messages', 'Mensajes', '#3b82f6', ICON.bubble], ['camera', 'Cámara', '#6b7280', ICON.camera],
               ['photos', 'Fotos', '#e5e7eb', ICON.photos], ['clock', 'Reloj', '#111827', ICON.clock], ['maps', 'Mapas', '#16a34a', ICON.map],
               ['settings', 'Ajustes', '#475569', ICON.settings], ['weather', 'El tiempo', '#38bdf8', ICON.weather], ['mail', 'Correo electrónico', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Desliza hacia abajo desde la esquina superior derecha ⟦chevron-down⟧' : 'Desliza hacia abajo desde la parte de arriba ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Hoy</div>
                <div class="hp"><span>DESTACADO</span><strong>Apps que nos encantan esta semana</strong></div>
                <div class="hp alt"><span>PRIMEROS PASOS</span><strong>Ideas para tu nuevo iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Hoy</button><button type="button" data-tap="games">Juegos</button>
                    <button type="button" data-tap="apps">Apps</button><button type="button" data-tap="search-tab">${ICON.search}Buscar</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Buscar apps y juegos</span></button>
            <div class="tg"><span class="on">Para ti</span><span>Los más populares</span><span>Niños</span></div>
            <div class="hp"><span>SUGERIDO PARA TI</span><strong>Apps para empezar</strong></div>
            <div class="hp alt"><span>POPULAR</span><strong>Mantén el contacto</strong></div>
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
        const btnLabel = p === 'ios' ? 'Obtener' : 'Instalar';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5.000 M+ descargas' : 'Redes sociales'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Gratis</span></div></div>
                <p class="agm">En tu iPhone de verdad, puede que tengas que pulsar dos veces el botón lateral, mirar la pantalla para Face ID o escribir aquí la contraseña de tu cuenta de Apple.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Instalar</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Cancelar</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Te damos la bienvenida a WhatsApp</h3>
            <p>Lee nuestra <u>Política de privacidad</u>. Toca "Aceptar y continuar" para aceptar las <u>Condiciones del servicio</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Aceptar y continuar</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Introduce tu número de teléfono</h3>
            <p>WhatsApp necesitará comprobar tu número de teléfono. Es posible que se apliquen cargos de tu operador.</p>
            <div class="abt">Reino Unido <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Siguiente</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>¿Es correcto este número?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Editar</button><button type="button" data-tap="yes">${ios ? 'Sí' : 'Aceptar'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>MENSAJES · ahora</strong><span>Tu código de WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. No compartas este código con nadie.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Verificando tu número</h3>
            <p>Esperando para detectar automáticamente un código de 6 dígitos enviado por SMS al <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">¿No has recibido un código?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['"WhatsApp" quiere acceder a tus contactos', 'Para que puedas ver cuáles de tus amigos usan WhatsApp.', '¿Permitir que WhatsApp acceda a tus contactos?']
            : ['"WhatsApp" quiere enviarte notificaciones', 'Para que sepas cuándo llega un mensaje nuevo.', '¿Permitir que WhatsApp te envíe notificaciones?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Información del perfil</h3>
            <p>Escribe tu nombre y añade una foto de perfil si quieres.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Tu nombre</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Siguiente</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Chats' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>¡Todo listo${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Tus chats aparecerán aquí. Toca el botón de chat nuevo para escribir a alguien de tus contactos.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Esta es la pantalla de inicio de tu móvil. Las apps se descargan de la <strong>${store}</strong>. Es gratis y es el lugar seguro para conseguir apps. <strong>Toca ${store}.</strong>`,
                 hint: `Busca el icono de ${store}. ${p === 'ios' ? "Es azul con una letra A blanca." : "Es un triángulo de colores."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Ahora tienes que buscar WhatsApp. <strong>Toca Buscar</strong>, abajo a la derecha.' : 'Ahora tienes que buscar WhatsApp. <strong>Toca la barra de búsqueda</strong> de arriba.',
                 hint: p === 'ios' ? 'Buscar es la lupa de abajo a la derecha.' : 'La barra de búsqueda dice "Buscar apps y juegos".'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Hemos escrito <em>whatsapp</em> por ti. Aparece una lista de sugerencias. <strong>Toca \"whatsapp messenger\".</strong>",
                 hint: 'Toca la sugerencia que dice "whatsapp messenger".'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Cuidado: algunas apps se hacen pasar por WhatsApp. La de verdad se llama <strong>WhatsApp Messenger</strong>, es de <strong>WhatsApp Inc.</strong> y es gratis. <strong>Toca ${p === 'ios' ? 'Obtener' : 'Instalar'} junto a la verdadera.</strong>`,
                 hints: {'fake1-get': 'Esa es "WhatsUp Chat Free" de Fun Apps Ltd. Es una imitación, y la etiqueta "Anuncio" significa que es publicidad. Fíjate en el nombre y en quién la ha creado.',
                         'fake2-get': 'Esa es "WA Messenger for Chat Pro" de LuckyDev Studio, una copia. La de verdad es de WhatsApp Inc.'},
                 hint: 'Busca "WhatsApp Messenger" de "WhatsApp Inc."'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Tu iPhone comprueba que eres tú antes de instalar. En un iPhone de verdad podrías usar <strong>Face ID</strong>, tu <strong>huella</strong> (Touch ID) o la <strong>contraseña de tu cuenta de Apple</strong>. Aquí, solo <strong>toca Instalar.</strong>',
                    hints: {'sheet-cancel': 'Cancelar detendría la descarga. Toca Instalar.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Se está descargando. Cuando termine, el botón cambiará a <strong>Abrir</strong>. <strong>Toca Abrir.</strong>`,
                 hint: 'Espera a que el botón diga Abrir y tócalo.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp se abre por primera vez. Te pide que aceptes sus condiciones. <strong>Toca "Aceptar y continuar".</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp usa tu número de móvil para que tus amigos puedan encontrarte. <strong>Toca el cuadro del número de teléfono</strong> y rellenaremos un número de prueba.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `En un móvil de verdad escribirías tu propio número. Aquí hemos usado uno inventado: <strong>07700 900123</strong>. <strong>Toca Siguiente.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp comprueba que lo has escrito bien. Este es correcto, así que <strong>toca ${p === 'ios' ? 'Sí' : 'Aceptar'}.</strong>`,
                 hints: {edit: `Tocarías Editar si te hubieras equivocado. Este número es correcto, así que toca ${p === 'ios' ? 'Sí' : 'Aceptar'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp envía un SMS con un código de 6 dígitos para comprobar que el número es tuyo. Tu iPhone se ofrece a rellenarlo por ti. <strong>Toca el código que aparece encima del teclado.</strong>'
                    : 'WhatsApp envía un SMS con un código de 6 dígitos para comprobar que el número es tuyo. Muchos móviles Android lo rellenan solos. Si el tuyo no lo hace, <strong>toca el mensaje</strong> de arriba.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Mientras lo configuras, un amigo te escribe: <em>"¡Hola! Te he mandado un código de 6 dígitos por error, ¿me lo puedes reenviar?"</em> ¿Qué haces?',
                    options: [
                        {t: 'Se lo envío, es un amigo', why: 'Esta es una estafa muy habitual. Alguien se ha hecho con la cuenta de tu amigo, y ese código le daría también acceso a la tuya.'},
                        {t: 'No lo envío. Nadie debería pedirlo nunca', ok: true, why: 'Exacto. Ese código es la llave de tu WhatsApp. No lo compartas con nadie, ni con un amigo ni con alguien que diga ser de WhatsApp.'},
                        {t: 'Envío solo los 3 primeros dígitos', why: 'Incluso una parte del código ayuda a un estafador. No compartas nada de él.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp pide ver tus contactos para poder mostrarte qué amigos usan WhatsApp. <strong>Toca Permitir.</strong>',
                 hints: {deny: 'Puedes elegir no permitirlo, pero entonces WhatsApp no podrá mostrar los nombres de tus amigos. Para esta práctica, toca Permitir.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Las notificaciones te avisan cuando llega un mensaje, incluso con WhatsApp cerrado. <strong>Toca Permitir.</strong>',
                 hints: {deny: 'Sin notificaciones no sabrás cuándo te escribe alguien. Toca Permitir para esta práctica.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Último paso: tu nombre es lo que ven tus amigos. <strong>Escribe tu nombre de pila en el cuadro</strong> y <strong>toca Siguiente</strong>. (Se queda en esta página y no se envía a ningún sitio.)',
                 hints: {photo: 'En la aplicación de verdad puedes elegir una foto ahora o añadirla más tarde en Ajustes. Por ahora la saltamos: escribe tu nombre y toca Siguiente.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>¡Enhorabuena, has configurado WhatsApp!</strong> Tus chats aparecerán aquí. En las próximas lecciones enviarás tu primer mensaje.'},
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
            const lockName = ctx.touch ? 'Touch ID y código' : 'Face ID y código';
            const groups = [
                [['airplane', 'Modo avión', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Datos móviles', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Notificaciones', '#ef4444', '⟦bell⟧'], ['sounds', 'Sonidos y vibración', '#ec4899', '⟦volume-2⟧'], ['focus', 'Concentración', '#6366f1', '⟦moon⟧']],
                [['general', 'General', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Accesibilidad', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence y Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Pantalla y brillo', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'SOS de emergencia', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Privacidad y seguridad', '#3b82f6', '⟦hand⟧'], ['battery', 'Batería', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Apps', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Cuenta de Apple, iCloud y más</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Redes e Internet', 'Móvil, wifi, punto de acceso'], ['devices', 'Dispositivos conectados', 'Bluetooth, emparejamiento'],
            ['apps', 'Apps', 'Apps recientes, apps predeterminadas'], ['notifications', 'Notificaciones', 'Historial de notificaciones'], ['battery', 'Batería', '85%'], ['storage', 'Almacenamiento', '91% used'],
            ['sound', 'Sonido y vibración', 'Volumen, vibración táctil'], ['display', 'Pantalla y tacto', 'Tema oscuro, tamaño de letra'],
            ['accessibility', 'Accesibilidad', 'Pantalla, interacción, audio'], ['security', 'Seguridad y privacidad', 'Seguridad de las apps, bloqueo del dispositivo, permisos'],
            ['location', 'Ubicación', 'Activada'], ['safety', 'Seguridad y emergencias', 'SOS de emergencia, información médica, alertas'],
            ['google', 'Google', 'Servicios y preferencias'], ['system', 'Sistema', 'Idiomas, hora, actualizaciones de software']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID y código' : 'Face ID y código';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Dedo 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Restablecer Face ID</span></div><div class="cj ex"><span>Configurar una apariencia alternativa</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Desactivar código</span></div><div class="cj ex"><span>Cambiar código</span></div>'
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

    const androidSecurity = () => androidList('Seguridad y privacidad', [
        ['device-unlock', 'Desbloqueo del dispositivo', 'Bloqueo de pantalla, Desbloqueo facial y con huella'], ['app-security', 'Seguridad de las apps', 'Analiza las apps en busca de comportamientos dañinos'],
        ['theft', 'Protección contra robo', 'Bloquea tu móvil si te lo roban'], ['privacy', 'Privacidad', 'Permisos, actividad de la cuenta']]);
    const androidDeviceUnlock = ctx => androidList('Desbloqueo del dispositivo', [
        ['screen-lock', 'Bloqueo de pantalla', ctx.passcodeSet ? 'PIN' : 'Ninguno'], ['face-finger', 'Desbloqueo facial y con huella', ctx.faceDone || ctx.fingerDone ? 'Configurar' : 'Configúralo para desbloquear más rápido']]);
    const androidFaceFinger = ctx => androidList('Desbloqueo facial y con huella', [
        ['face-unlock', 'Desbloqueo facial', ctx.faceDone ? 'Cara añadida' : 'Configurar'], ['fingerprint-unlock', 'Desbloqueo con huella', ctx.fingerDone ? '1 fingerprint' : 'Configurar']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Primer escaneo de Face ID completado.' : 'Face ID ya está configurado.') : 'Cara añadida';
        const btn = p === 'ios' ? (first ? 'Continuar' : 'Listo') : 'Listo';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Mueve la cabeza despacio para completar el círculo.' : 'Mantén la cara dentro del círculo y mueve la cabeza despacio.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Completado' : 'Ajusta cómo lo sujetas') : (stage === 'grip' ? 'Ajusta cómo lo sujetas' : 'Coloca el dedo'))
            : (ready ? 'Huella añadida' : 'Toca el sensor');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Ya puedes usar tu huella para desbloquear el iPhone.' : 'Ahora coloca los bordes de la yema en el botón de inicio.')
                     : (stage === 'grip' ? 'Apoya los bordes de la yema en el botón de inicio.' : 'Apoya y levanta el dedo en el botón de inicio varias veces.'))
            : (ready ? 'Ya puedes usar tu huella para desbloquear el móvil.' : 'Toca el sensor, levanta el dedo y vuelve a tocarlo hasta que la huella se llene.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Continuar' : 'Listo'}</button>` : sensor}
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
                 say: 'El código, Face ID y Touch ID están en la app de <strong>Ajustes</strong>. <strong>Toca Ajustes</strong> (el engranaje gris).',
                 hint: 'Ajustes es el icono gris con un engranaje.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Baja por la lista si hace falta y <strong>toca ${ctx.touch ? 'Touch ID y código' : 'Face ID y código'}</strong>.`,
                 hint: `Busca "${ctx.touch ? 'Touch ID y código' : 'Face ID y código'}", debajo de Pantalla y brillo.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'El bloqueo de pantalla, el desbloqueo facial y las huellas están en la app de <strong>Ajustes</strong>. <strong>Toca Ajustes</strong> (el engranaje).',
             hint: 'Ajustes es el icono con un engranaje.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Baja si hace falta y <strong>toca Seguridad y privacidad</strong>. <em>En un Samsung se llama Seguridad y privacidad, y luego Datos biométricos o Pantalla de bloqueo.</em>',
             hint: 'Busca "Seguridad y privacidad" cerca del final de la lista.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Toca Desbloqueo del dispositivo.</strong>',
             hint: 'Es la primera opción, "Desbloqueo del dispositivo".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Introduce el código' : 'Introduce tu PIN', p === 'ios' ? '' : 'Para continuar, introduce tu PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}Tu móvil comprueba primero que eres tú. <strong>Escribe el código de prueba: ${codeText}</strong>. <em>No escribas nunca tu código de verdad en una página web.</em>`,
        hint: `Escribe el código de prueba ${codeText}, número a número.`,
    });

    const safestQuestion = {
        q: '¿Cuál de estos sería el código <strong>más seguro</strong>?',
        options: [
            {t: '123456', why: '123456 es el código más usado de todos, así que es de los primeros que probaría un ladrón.'},
            {t: 'Tu cumpleaños, como 140352', why: 'Los cumpleaños son fáciles de averiguar, en redes sociales, tarjetas o correo. Evita las fechas que signifiquen algo.'},
            {t: 'Seis números que no significan nada para nadie más', ok: true, why: 'Exacto. Los números al azar que no son una fecha, un patrón ni una repetición son los más difíciles de adivinar.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Este móvil todavía no tiene código, así que cualquiera podría abrirlo. <strong>Toca Activar código.</strong>',
                 hints: {stolen: 'La Protección en caso de robo se explica en la lección 4. Primero, activa el código.'}},
                {screen: c => codeScreen(p, c, 'Definir código', 'Introduce un código', '<p class="aeh">Opciones de código</p>'), sequence: CODE_KEYS,
                 say: `Elige 6 números que puedas recordar. Para esta práctica, <strong>escribe ${codeText}</strong>. <em>Por favor, no escribas aquí tu código de verdad.</em>`,
                 hint: `Escribe ${codeText}, número a número.`},
                {screen: c => codeScreen(p, c, 'Definir código', 'Vuelve a introducir el código nuevo'), sequence: CODE_KEYS,
                 say: `Tu iPhone te lo pide otra vez, para asegurarse de que no te has equivocado. <strong>Escribe ${codeText} de nuevo.</strong>`,
                 hint: `Escribe ${codeText} de nuevo.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>¡Muy bien, tu teléfono de prueba ya tiene un código!</strong> En un iPhone de verdad, puede que en este punto también te pidan la contraseña de tu cuenta de Apple.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'El bloqueo de pantalla dice <strong>Ninguno</strong>, así que cualquiera podría abrir este móvil. <strong>Toca Bloqueo de pantalla.</strong>'},
            {screen: () => androidList('Elegir bloqueo de pantalla', [['none', 'Ninguno'], ['swipe', 'Deslizar'], ['pattern', 'Patrón'], ['pin', 'PIN'], ['password', 'Contraseña']]),
             target: 'pin', say: 'Hay varias opciones. Un <strong>PIN</strong> (números) es fácil y seguro. <strong>Toca PIN.</strong>',
             hints: {none: 'Ninguno significa que cualquiera puede abrir tu móvil.', swipe: 'Deslizar solo abre el móvil con un gesto, así que no protege nada.',
                     pattern: 'Los patrones se pueden adivinar por las marcas que deja el dedo en la pantalla. Un PIN es más seguro.',
                     password: 'Una contraseña también sirve, pero un PIN es más rápido de escribir cada día. Toca PIN para esta práctica.'}},
            {screen: c => codeScreen(p, c, 'Elige un PIN', 'El PIN debe tener al menos 4 dígitos'), sequence: CODE_KEYS,
             say: `6 números son más seguros que 4. Para esta práctica, <strong>escribe ${codeText}</strong>. <em>Por favor, no escribas aquí tu PIN de verdad.</em>`,
             hint: `Escribe ${codeText}, número a número.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Elige un PIN', 'El PIN debe tener al menos 4 dígitos', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Toca Siguiente.</strong>'},
            {screen: c => codeScreen(p, c, 'Vuelve a introducir tu PIN', ''), sequence: CODE_KEYS,
             say: `Tu móvil te lo pide otra vez, para asegurarse de que no te has equivocado. <strong>Escribe ${codeText} de nuevo.</strong>`, hint: `Escribe ${codeText} de nuevo.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Vuelve a introducir tu PIN', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Toca Confirmar.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Notificaciones en la pantalla de bloqueo', [['show-all', 'Mostrar todo el contenido de las notificaciones'], ['hide-sensitive', 'Ocultar contenido sensible'], ['dont-show', 'No mostrar ninguna notificación']], false),
             target: 'hide-sensitive',
             say: 'Tu móvil pregunta qué mensajes deben verse con la pantalla bloqueada. <strong>Ocultar contenido sensible</strong> es una buena opción: verás que ha llegado un mensaje, pero no lo que dice. <strong>Tócala.</strong>',
             hints: {'show-all': 'Eso lo muestra todo, incluidos los códigos de tu banco, a cualquiera que coja tu móvil. Toca "Ocultar contenido sensible".',
                     'dont-show': 'Eso funciona, pero no verás cuándo llegan mensajes. Para esta práctica, toca "Ocultar contenido sensible".'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>¡Muy bien, tu teléfono de prueba ya tiene un PIN!</strong> Ahora el bloqueo de pantalla dice PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Toca Configurar Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Cómo configurar Face ID</strong>
                    <p>Primero, coloca la cara dentro del marco de la cámara. Después mueve la cabeza en círculo para mostrar todos los ángulos de tu cara.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Comenzar</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Sujeta el móvil delante de la cara, a un brazo de distancia, como si te hicieras un selfi. <strong>Toca Comenzar.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'En un iPhone de verdad ahora <strong>mueves la cabeza despacio en círculo</strong>, como si dibujaras un círculo con la nariz. El anillo se va llenando mientras escanea. Cuando termine, <strong>toca Continuar</strong>.',
                 hint: 'Espera a que se llene el círculo y toca Continuar.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Escanea una segunda vez, para estar seguro. Vuelve a mover la cabeza en círculo. Cuando termine, <strong>toca Listo</strong>.',
                 hint: 'Espera a que se llene el círculo y toca Listo.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Un amigo te pide añadir <em>su</em> cara a tu móvil, "por si acaso". ¿Qué haces?',
                    options: [
                        {t: 'Le dejo, es práctico', why: 'Cualquier persona cuya cara esté configurada puede abrir tu móvil y aprobar pagos en tus aplicaciones. Configura solo tu propia cara.'},
                        {t: 'Digo que no. Solo mi cara debe desbloquear mi móvil', ok: true, why: 'Exacto. Si alguien de confianza necesita entrar, dale tu código y cámbialo después si hace falta.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>¡Muy bien, Face ID está configurado!</strong> Ya puedes desbloquear el móvil con solo mirarlo y deslizar hacia arriba.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Toca Desbloqueo facial y con huella.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Toca Desbloqueo facial.</strong>',
             hints: {'fingerprint-unlock': 'Eso son las huellas, que es la lección 3. Por ahora, toca Desbloqueo facial.'}},
            {screen: () => consent(p, 'Desbloquea con tu cara', 'Usa tu cara para desbloquear el móvil y confirmar que eres tú en las aplicaciones. Tu cara se guarda solo en este móvil.', 'Acepto'),
             target: 'agree', say: 'Tu móvil explica cómo usa tu cara. <strong>Toca Acepto.</strong>',
             hints: {cancel: 'Cancelar detendría la configuración. Toca Acepto para continuar.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Sujeta el móvil a la altura de los ojos, a un brazo de distancia. En un móvil de verdad <strong>mantienes la cara dentro del círculo y mueves la cabeza despacio</strong>. Cuando termine, <strong>toca Listo</strong>.',
             hint: 'Espera a que se llene el círculo y toca Listo.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'En muchos móviles Android, el desbloqueo facial es menos seguro que la huella. ¿Qué significa eso para ti?',
                options: [
                    {t: 'Está bien para todo', why: 'En muchos móviles, el desbloqueo facial usa una cámara normal a la que se puede engañar con más facilidad. Por eso algunas aplicaciones del banco no lo aceptan.'},
                    {t: 'Lo uso para desbloquear, y para el banco uso una huella o un PIN si mi banco lo pide', ok: true, why: 'Correcto. Tu móvil te dirá si el desbloqueo facial se puede usar para pagos y banca. Si no se puede, usa tu huella o tu PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>¡Muy bien, el desbloqueo facial está configurado!</strong> Ya puedes desbloquear el móvil mirándolo.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Toca Añadir una huella…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID usa el <strong>botón de inicio</strong> de la parte delantera de los iPhone más antiguos, como el iPhone SE. <strong>Toca 6 veces el botón de inicio de la parte de abajo del teléfono de prueba</strong>, como si levantaras y apoyaras el dedo.',
                 hint: 'Toca el botón de inicio redondo de la parte de abajo del teléfono de prueba.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Ahora necesita los bordes de la yema del dedo. <strong>Toca Continuar.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'En un iPhone de verdad, apoyas los <strong>lados y la punta</strong> del dedo en el botón. <strong>Toca el botón de inicio otras 4 veces.</strong>',
                 hint: 'Toca el botón de inicio redondo de la parte de abajo.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Todo listo. <strong>Toca Continuar.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: '¿Qué dedo es mejor añadir primero?',
                    options: [
                        {t: 'El pulgar o el dedo que más usas para sujetar el móvil', ok: true, why: 'Sí. Para un botón de inicio, normalmente es el pulgar. Puedes añadir hasta 5 dedos, así que conviene añadir los dos pulgares.'},
                        {t: 'Cualquier dedo, da igual', why: 'Funciona con cualquier dedo, pero elige el que se apoya de forma natural en el botón cuando coges el móvil, normalmente un pulgar.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>¡Muy bien, tu huella está configurada!</strong> Apoya el dedo en el botón de inicio para desbloquear. Puedes añadir más dedos del mismo modo.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Toca Desbloqueo facial y con huella.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Toca Desbloqueo con huella.</strong>',
             hints: {'face-unlock': 'Eso es el desbloqueo facial, de la lección 2. Por ahora, toca Desbloqueo con huella.'}},
            {screen: () => consent(p, 'Desbloquear con huella', 'Usa tu huella para desbloquear el móvil o confirmar que eres tú, por ejemplo al iniciar sesión en aplicaciones. Tu huella se guarda solo en este móvil.', 'Acepto'),
             target: 'agree', say: '<strong>Toca Acepto.</strong>', hints: {cancel: 'Cancelar detendría la configuración. Toca Acepto para continuar.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'El sensor puede estar en la pantalla, en la parte trasera del móvil o en el botón de encendido, y tu móvil te enseña dónde. Aquí está en la pantalla. <strong>Toca el sensor 6 veces</strong>, como si levantaras y apoyaras el dedo.',
             hint: 'Toca el sensor redondo cerca de la parte de abajo de la pantalla.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Tu huella se ha registrado. <strong>Toca Listo.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: '¿Qué dedo es mejor añadir primero?',
                options: [
                    {t: 'El dedo que toca el sensor de forma natural cuando coges el móvil', ok: true, why: 'Sí. Si el sensor está en la parte trasera, suele ser el índice, y si está en la pantalla o en el lateral, el pulgar. Puedes añadir más de uno.'},
                    {t: 'Cualquier dedo, da igual', why: 'Sirve cualquier dedo, pero elige el que cae de forma natural sobre el sensor. Así desbloquear es rápido y fácil.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>¡Muy bien, tu huella está configurada!</strong> Toca el sensor para desbloquear. Puedes añadir más dedos del mismo modo.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Girasoles en el jardín', '#fde68a'], ['🐶', 'El perro en el sofá', '#fecaca'], ['🏖️', 'Un día en la playa', '#bae6fd'],
                    ['🎂', 'Una tarta de cumpleaños', '#fbcfe8'], ['🌅', 'Puesta de sol sobre el mar', '#fed7aa'], ['🐈', 'El gato dormido', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Leído' : state === 'sent' ? 'Enviado' : 'Entregado'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Hola, mamá, soy yo. Número nuevo, se me ha roto el móvil…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Familia', last: 'Dave: ¿Quién trae la tarta? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: '¡Nos vemos el jueves!', time: 'Ayer', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: '¡Hola, mamá! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Chat nuevo' : 'Seleccionar contacto'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Familia', '#f59e0b', 'Dave, Jean, Sarah, Tú'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Añadir (más)' : 'Adjuntar (clip)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Este número no está en tus contactos.</p><div><button type="button" data-tap="block">Bloquear</button><button type="button" data-tap="add-contact">Añadir</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Fotos' : 'Galería'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>¿Bloquear a +44 7700 900842?</strong></p><p class="fd">Los contactos bloqueados no podrán llamarte ni enviarte mensajes.</p>
                <p class="fd">⟦square-check⟧ Denunciar a WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Cancelar</button><button type="button" data-tap="confirm-block">Bloquear</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Recientes' : 'Galería'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Llamando…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Activar sonido' : 'Silenciar'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Silenciado durante 1 semana' : 'Desactivado'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Silenciar notificaciones durante…</strong></p>
                <button type="button" data-tap="mute-8h">8 horas</button><button type="button" data-tap="mute-week">1 semana</button><button type="button" data-tap="mute-always">Siempre</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Ajustes', [['account', 'Cuenta', 'Notificaciones de seguridad, cambiar número'], ['privacy', 'Privacidad', 'Bloquear contactos, mensajes temporales'],
                ['chats', 'Chats', 'Tema, fondos de pantalla'], ['notifications', 'Notificaciones', 'Tonos de mensajes, grupos y llamadas']]],
            account: ['Cuenta', [['twostep', 'Verificación en dos pasos', ctx.twoStep ? 'Activada' : 'Desactivado'], ['change-number', 'Cambiar número', ''], ['delete-account', 'Eliminar cuenta', '']]],
            privacy: ['Privacidad', [['last-seen', 'Última vez y en línea', 'Todos'], ['profile-photo', 'Foto del perfil', 'Todos'],
                ['groups', 'Grupos', ctx.groupsSetting || 'Todos'], ['blocked', 'Contactos bloqueados', ctx.blocked ? '1' : 'Ninguno']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Quién puede añadirme a grupos</strong></p>
                <button type="button" data-tap="groups-everyone">Todos</button><button type="button" data-tap="groups-contacts">Mis contactos</button>
                <button type="button" data-tap="groups-except">Mis contactos, excepto…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Verificación en dos pasos</h3><p>Para mayor seguridad, activa la verificación en dos pasos, que te pedirá un PIN cuando vuelvas a registrar tu número de teléfono en WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Activar</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Añade una dirección de correo electrónico</h3>
                <p>Añade una dirección de correo electrónico para poder restablecer tu PIN si lo olvidas.</p>
                <div class="tk ex">tu dirección de correo electrónico</div>
                <button type="button" class="ce ox" data-tap="email-next">Siguiente</button>
                <button type="button" class="cp wd" data-tap="skip">Omitir</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>La verificación en dos pasos está activada</h3><p>Se te pedirá tu PIN si configuras WhatsApp en un móvil nuevo.</p>
                <button type="button" class="ce ox" data-tap="done">Listo</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Crea un PIN de 6 dígitos' : 'Confirma tu PIN'}</strong>
            <p>${stage === 'pin' ? 'Lo necesitarás para configurar WhatsApp en un móvil nuevo.' : 'Escribe el mismo PIN otra vez.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Esta es tu lista de chats. Para empezar uno nuevo, <strong>toca el botón de chat nuevo</strong> (el lápiz, arriba a la derecha).'
                          : 'Esta es tu lista de chats. Para empezar uno nuevo, <strong>toca el botón verde +</strong> de abajo a la derecha.',
         hints: {'chat-family': 'Eso abre un chat que ya existe. Empieza uno nuevo.', 'chat-jean': 'Eso abre un chat que ya existe. Empieza uno nuevo.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp muestra las personas de tus contactos que lo usan. <strong>Toca Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Primero escribe un mensaje en el cuadro y luego toca la flecha de enviar.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: '¡Hola, mamá! 😊 ¡Qué alegría saber de ti!', n: 2}); },
         say: '<strong>Toca el cuadro de mensaje</strong> de abajo, <strong>escribe un mensaje corto</strong> (como "¡Hola!") y <strong>toca la flecha de enviar</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'El micrófono es para las notas de voz, que vienen después. Primero escribe un mensaje y toca la flecha de enviar.', attach: 'Eso es para las fotos, que vienen después. Primero escribe un mensaje y toca enviar.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: '¡Sarah ha respondido! Debajo de tu mensaje hay <strong>dos tics azules ⟦check-check⟧</strong>. ¿Qué significan?',
            options: [
                {t: 'El mensaje no se ha podido enviar', why: 'Un mensaje fallido muestra un relojito o una advertencia roja. Los tics significan que ha ido bien.'},
                {t: 'Sarah lo ha leído', ok: true, why: '¡Sí! Un tic gris significa enviado, dos tics grises significan entregado a su móvil y dos tics azules significan que lo ha leído.'},
                {t: 'Se ha enviado dos veces', why: 'No, solo se envió una vez. Dos tics azules significan que se ha leído.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Ahora envía una foto. <strong>Toca el ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> que hay junto al cuadro de mensaje.`,
         hints: {camera: 'La cámara hace una foto nueva. Para enviar una que ya has hecho, toca el ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Toca ${p === 'ios' ? 'Fotos' : 'Galería'}</strong> para elegir entre las fotos de tu móvil.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Estas son las fotos (de mentira) de tu móvil. <strong>Toca los girasoles</strong> 🌻.',
         hint: 'Toca la foto en la que salen los girasoles.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: '¡Preciosa! 🌻 ¿Son de tu jardín?', n: 4}); },
         say: 'Puedes escribir un pie de foto si quieres. Luego <strong>toca la flecha de enviar</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Las notas de voz son prácticas si escribir te resulta incómodo. En un móvil de verdad <strong>mantienes pulsado el micrófono</strong> ⟦mic⟧ mientras hablas y lo sueltas para enviar. Aquí, <strong>toca el micrófono una vez para empezar y luego la flecha de enviar</strong> para mandarla.',
         hint: 'Toca el micrófono y luego la flecha de enviar.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>¡Muy bien!</strong> Has enviado un mensaje, una foto y una nota de voz. Para responder a Sarah en cualquier momento, abre WhatsApp y toca su chat.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Toca el chat de Sarah</strong> para abrirlo.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Arriba del chat hay dos botones de llamada: la <strong>cámara de vídeo</strong> para una videollamada y el <strong>teléfono</strong> para una llamada de voz. <strong>Toca la cámara de vídeo</strong> ⟦video⟧.',
         hints: {voice: 'Eso hace una llamada de voz, sin vídeo. Para esta práctica, toca la cámara de vídeo.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Suena el móvil de Sarah y, cuando contesta, os veis. Si hay ruido donde estás, <strong>toca el micrófono</strong> ⟦mic⟧ para silenciarte.',
         hint: 'El botón del micrófono está en la fila de abajo.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Estás silenciado: Sarah te ve pero no te oye. Para enseñarle algo, <strong>toca el botón de girar</strong> ⟦switch-camera⟧ y cambiarás a la cámara de la parte trasera de tu móvil.',
         hints: {mute: 'Vuelve a tocar el micrófono más tarde para activar el sonido. Por ahora, prueba el botón de girar.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Ahora Sarah ve aquello a lo que apuntas con el móvil. Cuando termines, <strong>toca el botón rojo</strong> para finalizar la llamada.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Las videollamadas gastan muchos datos. ¿Cuál es la mejor forma de hacer una?',
            options: [
                {t: 'Con wifi en casa, cuando se pueda', ok: true, why: 'Sí. Con wifi, las llamadas no gastan los datos de tu tarifa móvil, así que son gratis por mucho que charles.'},
                {t: 'Da igual', why: 'Con datos móviles, una videollamada larga puede agotar enseguida tus datos. Lo mejor es el wifi cuando se pueda.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Ahora los grupos. El grupo Familia tiene muchos mensajes nuevos y las notificaciones no paran de vibrar. <strong>Toca el grupo Familia.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Para cambiar los ajustes de un grupo, <strong>toca el nombre del grupo</strong> de arriba.', hint: 'Toca la palabra "Familia" en la parte de arriba de la pantalla.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Toca Silenciar notificaciones.</strong> Seguirás recibiendo los mensajes, pero el móvil no vibrará con cada uno.',
         hints: {'exit-group': 'Salir del grupo lo abandonaría del todo. Silenciar es más suave: sigues en el grupo pero sin vibraciones.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Elige durante cuánto tiempo. <strong>Toca 1 semana.</strong>',
         hints: {'mute-8h': '8 horas también sirve. Para esta práctica, toca 1 semana.', 'mute-always': 'Siempre también sirve, pero podrías perderte cosas. Para esta práctica, toca 1 semana.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>¡Muy bien!</strong> Has hecho una videollamada, te has silenciado, has girado la cámara y has silenciado un grupo con mucho movimiento. Puedes seguir leyendo los mensajes del grupo cuando quieras.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: '¡Hola!', ticks: 'read', n: 1}, {text: '¡Hola, mamá! 😊', n: 2}],
        family: [{from: 'Jean', text: '¿Comida del domingo en nuestra casa? 🍗', n: 1}, {from: 'Sarah', text: '¡Sí, por favor!', n: 2}, {from: 'Dave', text: '¿Quién trae la tarta? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Los ajustes propios de WhatsApp están dentro de la aplicación. <strong>Toca Ajustes</strong> abajo a la derecha.',
                hints: {'chat-unknown': 'Ese mensaje lo vemos luego. Primero, toca Ajustes abajo a la derecha.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Los ajustes propios de WhatsApp están dentro de la aplicación. <strong>Toca los tres puntos ⋮</strong> arriba a la derecha.',
                hints: {'chat-unknown': 'Ese mensaje lo vemos luego. Primero, toca los tres puntos de arriba a la derecha.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Toca Ajustes.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Toca Cuenta.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: 'La <strong>verificación en dos pasos</strong> añade un PIN que hace falta si alguien intenta configurar tu WhatsApp en otro móvil. Aunque un estafador consiga tu código de 6 dígitos, no podrá entrar. <strong>Toca Verificación en dos pasos.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Toca Activar.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Elige un PIN de 6 dígitos, distinto del código de tu móvil. Para esta práctica, <strong>escribe ${pinText}</strong>. <em>No escribas aquí un PIN de verdad.</em>`,
             hint: `Escribe el PIN de prueba ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Escribe ${pinText} otra vez</strong> para confirmarlo.`, hint: `Escribe ${pinText} de nuevo.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Añadir tu dirección de correo electrónico te permite restablecer el PIN si lo olvidas. Merece la pena hacerlo en tu móvil de verdad. Aquí, <strong>toca Siguiente</strong>.',
             hints: {skip: 'Puedes omitirlo, pero si olvidas el PIN podrías quedarte sin acceso. Toca Siguiente para esta práctica.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'La verificación en dos pasos está activada. <strong>Toca Listo.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Un mensaje dice que es del <em>"Soporte de WhatsApp"</em> y te pide tu PIN de dos pasos para "verificar tu cuenta". ¿Qué haces?',
                options: [
                    {t: 'Se lo envío, es de WhatsApp', why: 'WhatsApp nunca te escribirá para pedirte tu PIN ni tu código. Es un estafador que intenta hacerse con tu cuenta.'},
                    {t: 'No respondo, lo bloqueo y lo denuncio', ok: true, why: 'Exacto. Nadie, ni siquiera WhatsApp, debería pedirte nunca el PIN ni el código de 6 dígitos.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'A continuación, evita que los desconocidos te añadan a grupos. Está en <strong>Privacidad</strong>. <strong>Toca Grupos.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Mis contactos'; },
             say: '"Todos" significa que cualquier desconocido puede añadirte a un grupo, algo que usan los estafadores. <strong>Toca Mis contactos.</strong>',
             hints: {'groups-everyone': 'Todos permite que los desconocidos te añadan a grupos, incluidos los grupos de estafa. Toca Mis contactos.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Ha llegado un mensaje de un número que no conoces: "Hola, mamá, soy yo. Número nuevo…". Es la estafa de "Hola, mamá". <strong>Tócalo para abrirlo.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Hola, mamá, soy yo. Número nuevo, se me ha roto el móvil. ¿Me puedes ayudar a pagar una factura? Mañana te lo devuelvo x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'No respondas. WhatsApp se da cuenta de que el número no está en tus contactos. <strong>Toca Bloquear.</strong>',
             hints: {'add-contact': 'No añadas a un estafador a tus contactos. Toca Bloquear.', video: 'No le devuelvas la llamada. Toca Bloquear.', voice: 'No le devuelvas la llamada. Toca Bloquear.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Hola, mamá, soy yo. Número nuevo, se me ha roto el móvil. ¿Me puedes ayudar a pagar una factura? Mañana te lo devuelvo x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '"Denunciar a WhatsApp" está marcado, lo que ayuda a WhatsApp a detener al estafador. <strong>Toca Bloquear.</strong>',
             hints: {cancel: 'Cancelar dejaría que pudiera seguir escribiéndote. Toca Bloquear.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>¡Muy bien!</strong> Has activado la verificación en dos pasos, has evitado que los desconocidos te añadan a grupos y has bloqueado y denunciado a un estafador. Si alguna vez dudas de un mensaje de un familiar, llámale al número que ya tienes.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Atrás') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Atrás')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Las apps compatibles con Tipo dinámico se ajustarán al tamaño de lectura que prefieras.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Tamaño del texto', [], {top: slider, back: 'Pantalla'});
        return list(p, 'Tamaño de pantalla y texto', [{caption: 'Tamaño de la fuente'}, {id: 'bold', label: 'Texto en negrita', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'El tamaño del texto está en la app de <strong>Ajustes</strong>. <strong>Toca Ajustes.</strong>', hint: 'Ajustes es el icono gris con un engranaje.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Toca Pantalla y brillo.</strong>', hint: 'Está en el tercer grupo, debajo de Accesibilidad.'},
        {screen: c => list(p, 'Pantalla y brillo', [{caption: 'ASPECTO'}, {label: 'Claro', value: '⟦check⟧'}, {caption: 'TEXTO'}, {id: 'text-size', label: 'Tamaño del texto'}, {id: 'bold', label: 'Texto en negrita', toggle: !!c.bold}], {back: 'Ajustes'}),
         target: 'text-size', say: '<strong>Toca Tamaño del texto.</strong>', hints: {bold: 'El texto en negrita viene después. Primero, toca Tamaño del texto.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Arrastra el control deslizante hacia la derecha para que la letra sea más grande. Aquí, <strong>toca dos veces la A grande</strong> y mira cómo crece el texto.', hint: 'Toca la A grande a la derecha del control deslizante.'},
        {screen: c => textSizePage(p, c), target: 'back', say: '¡Mucho más fácil de leer! Ahora <strong>toca ‹ Pantalla</strong> arriba para volver.'},
        {screen: c => list(p, 'Pantalla y brillo', [{caption: 'ASPECTO'}, {label: 'Claro', value: '⟦check⟧'}, {caption: 'TEXTO'}, {id: 'text-size', label: 'Tamaño del texto'}, {id: 'bold', label: 'Texto en negrita', toggle: !!c.bold}], {back: 'Ajustes'}),
         target: 'bold', action: c => { c.bold = true; }, say: 'El <strong>texto en negrita</strong> hace las letras más gruesas y claras. <strong>Tócalo para activarlo.</strong>'},
        {screen: c => list(p, 'Pantalla y brillo', [{caption: 'TEXTO'}, {label: 'Tamaño del texto'}, {label: 'Texto en negrita', toggle: true}], {back: 'Ajustes'}),
         question: {q: '¿El texto sigue siendo demasiado pequeño, incluso en el tamaño máximo?', options: [
            {t: 'No se puede hacer nada más', why: '¡Hay más! Ajustes > Accesibilidad > Pantalla y tamaño del texto > Texto más grande ofrece tamaños aún mayores.'},
            {t: 'Ajustes > Accesibilidad > Pantalla y tamaño del texto > Texto más grande', ok: true, why: 'Sí. Activa ahí Tamaños de accesibilidad más grandes para conseguir un texto realmente grande.'}]}},
        {screen: c => list(p, 'Pantalla y brillo', [{caption: 'TEXTO'}, {label: 'Tamaño del texto'}, {label: 'Texto en negrita', toggle: true}], {back: 'Ajustes'}), done: true,
         say: '<strong>¡Muy bien!</strong> Tu texto es más grande y más grueso, en Ajustes y en la mayoría de las apps.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'El tamaño del texto está en la app de <strong>Ajustes</strong>. <strong>Toca Ajustes.</strong>', hint: 'Ajustes es el icono con un engranaje.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Toca Pantalla y tacto.</strong> <em>En un Samsung, es Pantalla y luego Tamaño y estilo de fuente.</em>'},
        {screen: () => list(p, 'Pantalla y tacto', [{id: 'dark', label: 'Tema oscuro', toggle: false}, {id: 'text-size', label: 'Tamaño de pantalla y texto', sub: 'Tamaño de la fuente, texto en negrita'}, {id: 'brightness', label: 'Nivel de brillo', value: '70%'}]),
         target: 'text-size', say: '<strong>Toca Tamaño de pantalla y texto.</strong>', hints: {dark: 'El tema oscuro cambia los colores, no el tamaño. Toca Tamaño de pantalla y texto.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Arrastra el control deslizante Tamaño de la fuente hacia la derecha para que la letra sea más grande. Aquí, <strong>toca dos veces la A grande</strong>.', hint: 'Toca la A grande a la derecha del control deslizante.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: 'El <strong>texto en negrita</strong> hace las letras más claras. <strong>Tócalo para activarlo.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: '¿El texto sigue siendo demasiado pequeño, incluso en el tamaño máximo?', options: [
            {t: 'No se puede hacer nada más', why: 'Prueba también Tamaño de pantalla, en la misma página: hace más grande todo, incluidos los botones y los iconos.'},
            {t: 'Aumentar también el Tamaño de pantalla', ok: true, why: 'Sí. El tamaño de pantalla agranda todo lo que hay en la pantalla, no solo el texto.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>¡Muy bien!</strong> Tu texto es más grande y más grueso, en Ajustes y en la mayoría de las apps.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' sobre morado' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'No molestar' : 'Concentración'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'No molestar · Activado' : 'No molestar · Desactivado'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Desliza hacia arriba para cerrar' : 'Cerrar'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Si tu móvil no suena, puede que esté activado No molestar. Los ajustes rápidos están en el <strong>Centro de control</strong>: <strong>desliza hacia abajo desde la esquina superior derecha</strong> (o toca la franja de arriba).'
                          : 'Si tu móvil no suena, puede que esté activado No molestar. <strong>Desliza hacia abajo desde la parte de arriba de la pantalla</strong> para ver los ajustes rápidos (o toca la franja de arriba).',
         hints: {'pull-up': 'Desliza en el otro sentido: hacia abajo desde la parte de arriba.', 'pull-left': 'Desliza hacia abajo, no hacia los lados.', 'pull-right': 'Desliza hacia abajo, no hacia los lados.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `La luna ⟦moon⟧ significa que <strong>No molestar está activado</strong>, así que las llamadas y los mensajes están silenciados. <strong>Tócala para desactivarlo.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Ahora sube el volumen con el <strong>botón de volumen del lateral del móvil</strong> (el de arriba). <strong>Toca 3 veces el ＋ del borde del teléfono de prueba.</strong>',
         hint: 'Toca el botón ＋ del borde derecho del móvil.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'Tu iPhone sigue sin sonar. ¿Qué otra cosa podría ser?', options: [
                {t: 'El interruptor de Timbre/Silencio o el botón de acción está en silencio', ok: true, why: 'Sí. Muchos iPhone tienen un interruptorcito encima de los botones de volumen: si se ve naranja, el móvil está en silencio. Los más nuevos usan el botón de acción.'},
                {t: 'El móvil está roto', why: '¡Normalmente no! Mira primero el interruptor de silencio que hay encima de los botones de volumen.'}]}
            : {q: 'Has pulsado el botón de volumen, pero solo ha cambiado el volumen multimedia. ¿Qué haces ahora?', options: [
                {t: 'Tocar el icono ⋯ o de ajustes de la barra de volumen para ver el volumen del tono', ok: true, why: 'Sí. Los botones de volumen suelen cambiar el volumen multimedia; toca los tres puntos de la barra de volumen para cambiar el volumen del tono.'},
                {t: 'Rendirme', why: 'Toca los tres puntos ⋯ de la barra de volumen que aparece y sube el volumen del tono.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>¡Muy bien!</strong> No molestar está desactivado y el volumen está alto, así que oirás las llamadas y los mensajes.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500 mg</strong><br>Tomar 1-2 comprimidos cada 4-6 horas.<br>No tomar más de 8 comprimidos en 24 horas.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Lupa', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'Tu iPhone tiene una app de <strong>Lupa</strong>. Si no está en tu pantalla de inicio, desliza hacia abajo por el centro de la pantalla y escribe "Lupa". <strong>Toca Lupa.</strong>'
                          : 'Muchos móviles Android tienen una app de <strong>Lupa</strong>. <em>En un Samsung, está en los ajustes rápidos o en Accesibilidad.</em> <strong>Toca Lupa.</strong>',
         hint: 'Busca el icono negro con una lupa.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Apunta el móvil a algo pequeño, como esta etiqueta de medicina. <strong>Toca ＋ tres veces</strong> para acercar (en un móvil de verdad puedes arrastrar el control deslizante).', hint: 'Toca el ＋ a la derecha del control deslizante.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Con poca luz, la linterna ayuda. <strong>Toca la linterna</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: '¿Te tiembla un poco el pulso? <strong>Toca el botón redondo grande</strong> para congelar la imagen y poder leerla sin tener que estar quieto.'},
        {screen: c => magnifierScreen(p, c), question: {q: '¿Para qué más es práctica la lupa?', options: [
            {t: 'Para leer menús, etiquetas de precios y la letra pequeña de las cartas', ok: true, why: 'Sí, y siempre la llevas en el bolsillo. Algunas personas la tienen en el Centro de control o en los ajustes rápidos para abrirla con un toque.'},
            {t: 'Para subir el volumen de las llamadas', why: 'Eso son los botones de volumen. La lupa sirve para ver mejor las cosas pequeñas.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>¡Muy bien!</strong> Ya puedes acercar la letra pequeña, iluminarla y congelar la imagen.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Nos vemos el jueves en el café de la mañana' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>¿Vienes el jueves? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Mensaje de texto</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Escuchando… habla ahora</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Puedes hablar en lugar de escribir. <strong>Abre Mensajes.</strong>', hint: 'Mensajes es el globo de conversación verde.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean ha preguntado por el jueves. <strong>Toca el cuadro de mensaje</strong> de abajo.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Aparece el teclado. <strong>Toca el micrófono</strong> ⟦mic⟧ del teclado y di tu mensaje.', hint: 'El micrófono está en el teclado, junto a la barra espaciadora.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'En un móvil de verdad ahora dirías: <em>"Nos vemos el jueves en el café de la mañana"</em>. Las palabras aparecen mientras hablas. Revísalas y luego <strong>toca enviar</strong> ⟦send-horizontal⟧.',
         hint: 'Espera a que aparezcan las palabras y toca la flecha de enviar.'},
        {screen: () => home(p), target: 'settings',
         say: 'Tu móvil también puede <strong>leerte las cosas en voz alta</strong>. Vamos a activarlo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Toca Accesibilidad.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilidad', [{caption: 'VISIÓN'}, {id: 'voiceover', label: 'VoiceOver', value: 'Desactivado'}, {id: 'zoom', label: 'Zoom', value: 'Desactivado'}, {id: 'spoken', label: 'Contenido leído'}], {back: 'Ajustes'})
            : list(p, 'Accesibilidad', [{id: 'select-speak', label: 'Seleccionar para escuchar', sub: 'Desactivado'}, {id: 'talkback', label: 'TalkBack', sub: 'Desactivado'}, {id: 'magnification', label: 'Ampliación'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Toca Contenido leído.</strong>' : '<strong>Toca Seleccionar para escuchar.</strong>',
         hints: {voiceover: 'VoiceOver cambia el funcionamiento de todo el móvil, lo que puede resultar confuso. Toca Contenido leído.', talkback: 'TalkBack cambia el funcionamiento de todo el móvil, lo que puede resultar confuso. Toca Seleccionar para escuchar.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Contenido leído', [{id: 'speak-selection', label: 'Leer selección', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Leer pantalla', toggle: !!c.speakScreen, sub: 'Desliza hacia abajo con dos dedos desde la parte de arriba de la pantalla para que la lea en voz alta.'}], {back: 'Accesibilidad'})
            : list(p, 'Seleccionar para escuchar', [{id: 'speak-screen', label: 'Usar Seleccionar para escuchar', toggle: !!c.speakScreen, sub: 'Toca el acceso directo y luego toca cualquier cosa de la pantalla para oírla en voz alta.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Activa Leer pantalla.</strong> Después, en cualquier parte del móvil, si deslizas hacia abajo desde arriba con dos dedos, se lee la pantalla en voz alta.' : '<strong>Activa Usar Seleccionar para escuchar.</strong> Aparece un pequeño botón de acceso directo: tócalo y luego toca cualquier texto para oírlo.',
         hints: {'speak-selection': 'Eso lee solo las palabras que resaltas. Leer pantalla es más fácil: activa esa.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Contenido leído', [{label: 'Leer selección', toggle: false}, {label: 'Leer pantalla', toggle: true}], {back: 'Accesibilidad'})
            : list(p, 'Seleccionar para escuchar', [{label: 'Usar Seleccionar para escuchar', toggle: true}]), done: true,
         say: '<strong>¡Muy bien!</strong> Ya puedes hablar en lugar de escribir y hacer que tu móvil te lea las cosas en voz alta.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Muchos audífonos se pueden conectar al móvil, para que las llamadas y la música lleguen directamente a ellos. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Toca Accesibilidad.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilidad', [{caption: 'AUDICIÓN'}, {id: 'hearing-devices', label: 'Dispositivos auditivos'}, {id: 'live-captions', label: 'Subtítulos en directo', value: c.captions ? 'Activada' : 'Desactivado'}, {id: 'subtitles', label: 'Subtítulos'}], {back: 'Ajustes'})
            : list(p, 'Accesibilidad', [{id: 'hearing-devices', label: 'Audífonos', sub: c.paired ? 'Conectado' : 'No conectado'}, {id: 'live-captions', label: 'Subtítulos instantáneos', sub: c.captions ? 'Activada' : 'Desactivado'}, {id: 'sound-amp', label: 'Amplificador de sonido'}]),
         target: 'hearing-devices', say: `<strong>Toca ${p === 'ios' ? 'Dispositivos auditivos' : 'Audífonos'}.</strong> Ponte primero los audífonos y cierra los compartimentos de las pilas para reiniciarlos, así el móvil podrá encontrarlos.`,
         hints: {'live-captions': 'Los subtítulos vienen después. Primero, conecta los audífonos.'}},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Audífonos', [{caption: p === 'ios' ? 'DISPOSITIVOS AUDITIVOS MFI' : 'Dispositivos disponibles'}, {id: 'aids', label: 'Audífonos de Margaret', sub: 'Izquierdo y derecho'}],
            {overlay: c.pairing ? dialog(p, '¿Emparejar con "Audífonos de Margaret"?', 'Se usarán para las llamadas y el audio.', [['cancel', 'Cancelar'], ['pair', 'Emparejar']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Tu móvil los encuentra. <strong>Toca tus audífonos.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Audífonos', [{id: 'aids', label: 'Audífonos de Margaret', sub: 'Izquierdo y derecho'}],
            {overlay: dialog(p, '¿Emparejar con "Audífonos de Margaret"?', 'Se usarán para las llamadas y el audio.', [['cancel', 'Cancelar'], ['pair', 'Emparejar']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Toca Emparejar.</strong> (Con dos audífonos, es posible que el móvil te lo pida dos veces, una por cada uno.)'},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Audífonos', [{label: 'Audífonos de Margaret', sub: 'Conectado ⟦check⟧'}]), target: 'back',
         say: '¡Conectado! Ahora las llamadas sonarán por tus audífonos. <strong>Toca Atrás.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilidad', [{caption: 'AUDICIÓN'}, {id: 'hearing-devices', label: 'Dispositivos auditivos'}, {id: 'live-captions', label: 'Subtítulos en directo', value: c.captions ? 'Activada' : 'Desactivado'}], {back: 'Ajustes'})
            : list(p, 'Accesibilidad', [{id: 'hearing-devices', label: 'Audífonos', sub: 'Conectado'}, {id: 'live-captions', label: 'Subtítulos instantáneos', sub: c.captions ? 'Activada' : 'Desactivado'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Subtítulos en directo' : 'Subtítulos instantáneos'}</strong> muestra en pantalla las palabras de todo lo que se dice: vídeos, llamadas y mensajes de voz. <strong>Tócalo para activarlo.</strong>`},
        {screen: c => list(p, 'Accesibilidad', [{label: p === 'ios' ? 'Subtítulos en directo' : 'Subtítulos instantáneos', toggle: true}, {label: 'Audífonos', sub: 'Conectado'}]), done: true,
         say: '<strong>¡Muy bien!</strong> Tus audífonos están conectados y las palabras habladas ahora aparecen como subtítulos.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Hormiga', 'Tejón', 'Gato', 'Perro', 'Águila', 'Zorro', 'Cabra', 'Erizo', 'Ibis', 'Grajilla', 'Martín pescador', 'Cordero', 'Topo',
                     'Tritón', 'Nutria', 'Frailecillo', 'Petirrojo', 'Foca', 'Sapo', 'Topillo', 'Chochín', 'Cebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Mantén pulsada la flor</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Copiar</span><span>Compartir</span><span>Eliminar</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Cebra</h3><p>Las cebras tienen rayas blancas y negras. No hay dos cebras con exactamente el mismo dibujo.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Tocar</strong> significa tocar la pantalla con suavidad con un dedo y soltar enseguida, como al pulsar un botón. <strong>Toca la estrella.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Mantener pulsado</strong> significa dejar el dedo sobre algo durante uno o dos segundos. Normalmente muestra opciones adicionales. <strong>Mantén pulsada la flor</strong> hasta que pase algo. (Con un ratón, mantén pulsado el botón.)',
         hint: 'Deja el dedo sobre la flor durante uno o dos segundos.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Ha aparecido un menú. ¿Qué suele hacer mantener pulsado?', options: [
            {t: 'Muestra opciones adicionales, como copiar, compartir o eliminar', ok: true, why: 'Sí. Si mantienes pulsado sobre mensajes, fotos y apps, salen opciones como estas.'},
            {t: 'Elimina las cosas al instante', why: 'No, solo muestra un menú de opciones. No pasa nada hasta que eliges una.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Deslizar</strong> significa mover el dedo por la pantalla, como al pasar una página. <strong>Desliza la foto hacia la izquierda dos veces</strong> para ver las siguientes. (Con un ratón, haz clic, arrastra y suelta.)',
         hint: 'Mueve el dedo de derecha a izquierda sobre la foto. O usa el botón "¿No puedes deslizar?".'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Desplazarse</strong> significa mover el dedo hacia arriba por la pantalla para ver más de una lista, como esta. <strong>Desplázate hacia abajo y toca Cebra</strong>, justo al final. (Con un ratón, usa la rueda.)',
         hint: 'Mueve la lista hacia arriba con el dedo para llegar a Cebra, al final.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Para volver a la página anterior en un iPhone, <strong>toca ‹ Atrás</strong> arriba a la izquierda (o desliza desde el borde izquierdo de la pantalla hacia dentro).' : 'Para volver a la página anterior en Android, <strong>toca la flecha de atrás ◁</strong> de abajo (o desliza desde el borde izquierdo o derecho de la pantalla hacia dentro).',
         hints: {'home-pill': 'Eso te lleva directamente a la pantalla de inicio. Toca la flecha de atrás ◁.', 'home-bar': 'Eso te lleva directamente a la pantalla de inicio. Toca ‹ Atrás.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Para ir a la pantalla de inicio desde cualquier sitio, <strong>desliza hacia arriba desde la barra de abajo</strong> de la pantalla (o toca aquí la barra). En los iPhone más antiguos con botón de inicio redondo: púlsalo.'
                          : 'Para ir a la pantalla de inicio desde cualquier sitio, <strong>toca el círculo de inicio ○</strong> de abajo (o desliza hacia arriba desde el borde inferior).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Atrás vuelve una página. Toca el círculo de inicio ○ para ir al inicio.'}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> Has practicado tocar, mantener pulsado, deslizar, desplazarte, volver atrás e ir al inicio: los gestos que usarás cada día.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Conectado', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'REDES' : 'Redes disponibles'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Ajustes',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Introduce la contraseña de "BT-Hub-7F2A"</strong></p>
                ${field('wifipass', 'Contraseña', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Unirse' : 'Conectar'}</button>
                <button type="button" class="cp" data-tap="cancel">Cancelar</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Usar el wifi en casa ahorra tus datos móviles. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Toca Wi-Fi</strong>, cerca de la parte de arriba.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Toca Redes e Internet.</strong> <em>En un Samsung, es Conexiones y luego Wi-Fi.</em>'},
               {screen: () => list(p, 'Redes e Internet', [{id: 'internet', label: 'Internet', sub: 'Wi-Fi y datos móviles'}, {id: 'sims', label: 'SIM'}, {id: 'hotspot', label: 'Punto de acceso y compartir conexión'}]),
                target: 'internet', say: '<strong>Toca Internet.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'El nombre y la contraseña del wifi suelen estar en una pegatina en la parte de atrás del router (la caja con luces). La pegatina de este router de prueba dice:<br><span class="ahd">Red: <strong>BT-Hub-7F2A</strong><br>Contraseña: <strong>Green-Apple-42</strong></span><strong>Toca BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Ese es el wifi de un vecino. Busca el nombre que pone en tu pegatina: BT-Hub-7F2A.', 'net-sky-12345': 'Ese es el wifi de otra persona. Busca el nombre que pone en tu pegatina: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'La contraseña debe coincidir exactamente con la de la pegatina, incluidas las mayúsculas y los guiones: Green-Apple-42',
         say: 'Escribe la contraseña <strong>exactamente</strong> como está en la pegatina: <strong>Green-Apple-42</strong>. ¡Las mayúsculas importan! Luego <strong>toca Unirse</strong>.'},
        {screen: c => wifiList(p, c), question: {q: '¡Ya estás conectado! Tu móvil se unirá a este wifi por sí solo siempre que estés en casa. ¿Es seguro usar el wifi gratuito de una cafetería?', options: [
            {t: 'Sí, para navegar, pero evita la banca en línea', ok: true, why: 'Exacto. El wifi público está bien para leer las noticias o mirar el horario de un autobús. Para la banca, usa tus datos móviles o el wifi de casa.'},
            {t: 'Sí, para todo', why: 'Otras personas pueden vigilar el wifi público. Está bien para navegar, pero usa tus datos móviles o el wifi de casa para la banca.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>¡Muy bien!</strong> Estás conectado al wifi. Busca el símbolo de wifi en forma de abanico en la parte de arriba de la pantalla.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Nuevo contacto' : 'Crear contacto', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Nombre', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Número de móvil', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Listo' : 'Guardar'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Contacto', [
        {label: 'Móvil', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Añadir a favoritos' : (ctx.fav ? '⟦star⟧ Favorito' : '⟦star⟧ Añadir a favoritos')},
        {id: 'share', label: 'Compartir contacto'}], {back: 'Contactos'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Contactos', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Guardar el número de alguien te permite llamarle por su nombre. En iPhone, los contactos están en la app <strong>Teléfono</strong>. <strong>Toca Teléfono.</strong>' : '<strong>Toca Contactos.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Contactos', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Contactos', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Esta es tu lista de contactos. <strong>Toca +</strong> arriba a la derecha para añadir a alguien.' : 'Esta es tu lista de contactos. <strong>Toca el botón +</strong> para añadir a alguien.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Escribe un nombre y el número de prueba 07700 900456, y luego toca ' + (p === 'ios' ? 'Listo.' : 'Guardar.'),
         say: `Escribe el <strong>nombre</strong> de la persona (prueba con "Ann") y su número. Para practicar, usa <strong>07700 900456</strong>. Luego <strong>toca ${p === 'ios' ? 'Listo' : 'Guardar'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: '¡Guardado! Los favoritos son las personas a las que más llamas, y salen arriba para llamarles con un toque. <strong>Toca ' + (p === 'ios' ? 'Añadir a favoritos' : 'la estrella') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: '¿Qué contacto conviene guardar con "ICE" (In Case of Emergency, en caso de emergencia) delante del nombre?', options: [
            {t: 'Tu familiar más cercano, como "ICE Sarah"', ok: true, why: 'Sí. El personal sanitario sabe que debe buscar ICE. Aún mejor: añade un contacto de emergencia a tu ficha médica, como se explica en el curso Un móvil seguro.'},
            {t: 'Tu banco', why: 'ICE es para la persona a la que avisar si te pasa algo, normalmente tu familiar más cercano.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>¡Muy bien!</strong> Has guardado un contacto y lo has hecho favorito.'},
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
    const recents = p => app(p, 'Recientes', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Tu móvil está sonando: te llama Jean. <strong>Toca el botón verde para contestar.</strong>' + (p === 'android' ? ' <em>En algunos móviles Android, en lugar de tocar hay que deslizar el botón verde hacia arriba.</em>' : ' <em>Si tu iPhone está bloqueado, en su lugar hay que deslizar el botón verde.</em>'),
         hints: {decline: 'El rojo rechaza la llamada. Toca el verde para contestar.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: '¡Estás hablando! Para oír mejor, o para hablar con las manos libres, <strong>toca altavoz</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Cuando termines, <strong>toca el botón rojo</strong> para colgar.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Antes perdiste una llamada de Dave. Las llamadas perdidas salen en <strong>rojo</strong> en tus llamadas recientes. <strong>Toca Dave</strong> para devolverle la llamada.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Está llamando a Dave. Cuando termines de hablar, <strong>toca el botón rojo</strong> para colgar.'},
        {screen: () => recents(p), question: {q: 'Alguien te llama desde un número que no conoces y dice que es de tu banco. ¿Qué haces?', options: [
            {t: 'Cuelgo y llamo al 159 para contactar con mi banco de forma segura', ok: true, why: 'Exacto. Siempre puedes colgar y volver a llamar a un número de confianza. El 159 te pone en contacto con tu propio banco.'},
            {t: 'Hago lo que dicen, es el banco', why: 'Los estafadores se hacen pasar por bancos continuamente, y el número se puede falsificar. Cuelga y llama al 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes contestar, usar el altavoz, colgar y devolver las llamadas perdidas.'},
    ], {});

    function smsList(p) {
        return app(p, 'Mensajes', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Su última revisión fue en marzo. Pida cita en línea o llámenos.</span><small>hace 3 meses</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Mensaje de texto', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Los mensajes de texto están en la app <strong>Mensajes</strong>. <strong>Toca Mensajes.</strong>', hint: 'Es el icono del globo de conversación.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Los mensajes nuevos salen en negrita. <strong>Toca el mensaje del dentista</strong> para leerlo.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Primero escribe Y en el cuadro de mensaje y luego toca la flecha de enviar.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'El dentista te pide que respondas <strong>Y</strong> para confirmar. <strong>Toca el cuadro de mensaje, escribe Y y toca la flecha de enviar</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: '¡Hecho! Ahora ordena: <strong>mantén pulsado el mensaje antiguo</strong> de arriba (deja el dedo sobre él uno o dos segundos).', hint: 'Deja el dedo sobre el mensaje antiguo de arriba hasta que aparezca un menú.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Aparece un menú. <strong>Toca Eliminar.</strong>',
         hints: {copy: 'Copiar copia las palabras. Toca Eliminar.', forward: 'Reenviar lo manda a otra persona. Toca Eliminar.'}},
        {screen: c => smsChat(p, c), question: {q: 'Un SMS de un número desconocido dice que tu paquete está retenido y te pide pagar 1,45 £ con un enlace. ¿Qué haces?', options: [
            {t: 'No toco el enlace. Lo reenvío al 7726 y lo borro', ok: true, why: 'Exacto. El 7726 es gratis y lo comunica a tu operador. Los mensajeros no mandan SMS con enlaces para pedir pagos.'},
            {t: 'Lo pago, son solo 1,45 £', why: 'Las 1,45 £ son un cebo para conseguir los datos de tu tarjeta. No toques el enlace: reenvíalo al 7726 y bórralo.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes leer y responder a mensajes de texto, y borrar los que no necesitas.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Mapas', 15], ['WhatsApp', 9], ['Cámara', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Batería', [{id: 'low-power', label: 'Modo de bajo consumo', toggle: saver, sub: 'Reduce la actividad en segundo plano hasta que puedas cargar la batería por completo.'}, {caption: 'USO DE LA BATERÍA POR APP'}], {back: 'Ajustes', top: head, bottom: apps})
            : list(p, 'Batería', [{id: 'low-power', label: 'Ahorro de batería', toggle: saver, sub: 'Desactiva algunas funciones para que la batería dure más.'}, {caption: 'Uso de la batería'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '¿Se te acaba la batería? <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Toca Batería.</strong>', hint: p === 'ios' ? 'Batería está en el tercer grupo.' : 'Batería está en la lista, después de Notificaciones.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Te queda un 23 %. El <strong>${p === 'ios' ? 'Modo de bajo consumo' : 'Ahorro de batería'}</strong> hace que dure más. <strong>Tócalo para activarlo.</strong> El símbolo de la batería se pone ${p === 'ios' ? 'yellow' : 'orange'} para recordártelo.`},
        {screen: c => batteryPage(p, c), question: {q: 'La lista muestra que Facebook ha gastado hoy más batería. ¿Qué ayuda más a que la batería dure?', options: [
            {t: 'Bajar el brillo de la pantalla y cerrar las apps que ya has terminado de usar', ok: true, why: 'Sí. La pantalla es lo que más energía gasta. Baja el brillo, y apps como Facebook y YouTube gastan mucho.'},
            {t: 'Cargarlo al 100 % cada hora', why: 'Cargarlo a menudo no le hace daño, pero no hace que dure más. Baja el brillo y usa el modo de ahorro de batería.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>¡Muy bien!</strong> El ahorro de batería está activado y sabes qué apps gastan más energía.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'móvil · 3 llamadas' : 'Posible spam · 3 llamadas'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Recientes', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>móvil</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>móvil</small><span>Ayer</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'El mismo número desconocido te sigue llamando. Vamos a bloquearlo. <strong>Abre la app Teléfono.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `En tus llamadas recientes, <strong>toca el ⓘ</strong> junto al número 07700 900842${p === 'android' ? ' (en algunos móviles Android, toca el propio número)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Compartir contacto'}, {id: 'block', label: p === 'ios' ? 'Bloquear a este llamante' : 'Bloquear/denunciar spam', danger: true}], {back: 'Recientes'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Bloquear a este llamante' : 'Bloquear/denunciar spam'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, '¿Bloquear a este llamante?', 'No recibirás llamadas, mensajes ni FaceTime de las personas de tu lista de bloqueados.', [['cancel', 'Cancelar'], ['confirm', 'Bloquear contacto']])
            : dialog(p, '¿Bloquear el 07700 900842?', '⟦square-check⟧ Denunciar llamada como spam', [['cancel', 'Cancelar'], ['confirm', 'Bloquear']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Bloquear contacto' : 'Bloquear'}.</strong>${p === 'android' ? ' Dejar marcada la opción "Denunciar llamada como spam" ayuda a avisar a otras personas.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: '¡Bloqueado! También puedes <strong>silenciar todas las llamadas de números que no conoces</strong>. <strong>Toca Ajustes.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Baja hasta el final y <strong>toca Apps</strong>.'},
            {screen: () => list(p, 'Apps', [{id: 'app-phone', label: 'Teléfono'}, {id: 'app-messages', label: 'Mensajes'}, {id: 'app-mail', label: 'Correo'}], {back: 'Ajustes'}), target: 'app-phone', say: '<strong>Toca Teléfono.</strong>'},
            {screen: c => list(p, 'Teléfono', [{id: 'silence', label: 'Silenciar llamadas desconocidas', toggle: !!c.silence}, {id: 'blocked', label: 'Contactos bloqueados', value: '1'}], {back: 'Apps'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Activa Silenciar llamadas desconocidas.</strong> Las llamadas de números que no están en tus contactos van directas al buzón de voz y siguen apareciendo en tus llamadas recientes.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: '¡Bloqueado! También puedes <strong>filtrar las llamadas de spam</strong>. <strong>Toca los tres puntos ⋮</strong> arriba a la derecha.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Toca Ajustes.</strong>'},
            {screen: () => list(p, 'Ajustes', [{id: 'caller-id', label: 'ID de llamada y spam'}, {id: 'blocked', label: 'Números bloqueados'}, {id: 'sounds', label: 'Sonidos y vibración'}]), target: 'caller-id', say: '<strong>Toca ID de llamada y spam.</strong>'},
            {screen: c => list(p, 'ID de llamada y spam', [{id: 'caller-show', label: 'Ver identificación de llamante y spam', toggle: true}, {id: 'silence', label: 'Filtrar llamadas de spam', toggle: !!c.silence, sub: 'Las llamadas de posible spam no harán sonar tu móvil'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Activa Filtrar llamadas de spam.</strong> Las llamadas de posible estafa no harán sonar tu móvil.'},
        ]),
        {screen: c => list(p, 'Listo', [{label: 'Números bloqueados', value: '1'}, {label: p === 'ios' ? 'Silenciar llamadas desconocidas' : 'Filtrar llamadas de spam', toggle: true}]),
         question: {q: '¿Podría silenciar las llamadas desconocidas hacer que te pierdas una llamada auténtica, como la de un hospital o un repartidor?', options: [
            {t: 'Sí, así que revisa el buzón de voz y las llamadas perdidas de vez en cuando', ok: true, why: 'Exacto. Quien llama de verdad suele dejar un mensaje, y las llamadas perdidas siguen apareciendo en tu lista.'},
            {t: 'No, siempre te llegarán', why: 'Los números desconocidos van al buzón de voz, también los auténticos. Revisa el buzón de voz y las llamadas perdidas de vez en cuando.'}]}},
        {screen: () => list(p, 'Listo', [{label: 'Números bloqueados', value: '1'}, {label: p === 'ios' ? 'Silenciar llamadas desconocidas' : 'Filtrar llamadas de spam', toggle: true}]), done: true,
         say: '<strong>¡Muy bien!</strong> Has bloqueado un número molesto y has reducido las llamadas fraudulentas.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: su paquete está retenido por una tasa impagada de 1,45 £. Pague ahora para reprogramar la entrega: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Para: ${field('fwdto', 'Número', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Gracias. Envíe el número de teléfono desde el que le llegó el SMS fraudulento.</span><small>ahora</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Gracias, hemos recibido su denuncia.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Mensaje nuevo') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Mensaje de texto', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Más… y luego Reenviar' : 'Reenviar'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Has recibido un SMS fraudulento que se hace pasar por Royal Mail. Antes de borrarlo, denúncialo, es gratis. <strong>Abre Mensajes.</strong>'},
        {screen: () => app(p, 'Mensajes', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Toca el mensaje</strong> para abrirlo. ¡No toques el enlace que lleva dentro!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Mantén pulsado el mensaje</strong> (deja el dedo sobre él) hasta que aparezca un menú. No toques el enlace.', hint: 'Deja el dedo sobre el globo gris del mensaje durante uno o dos segundos.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Toca Más…</strong> y luego la flecha de reenviar (aquí, un solo botón hace las dos cosas).' : '<strong>Toca Reenviar.</strong> (En algunos móviles está bajo los tres puntos ⋮ de arriba.)',
         hints: {delete: 'Primero denúncialo y después podrás borrarlo.', copy: 'Toca Reenviar para mandarlo al 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'En el cuadro "Para", escribe 7726 (en el teclado del móvil forma la palabra SPAM) y luego toca enviar.',
         action: c => { c.sent7726 = true; }, say: 'En el cuadro <strong>Para</strong>, escribe <strong>7726</strong>. (En el teclado forma la palabra S-P-A-M.) Luego <strong>toca enviar</strong> ⟦send-horizontal⟧. Es gratis.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Escribe el número del estafador, 07700 900911, y toca enviar.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: 'El 7726 responde preguntando de qué número venía la estafa. <strong>Escribe 07700 900911</strong> y <strong>toca enviar</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Lo has denunciado. ¿Qué debes hacer ahora con el SMS fraudulento?', options: [
            {t: 'Borrarlo y bloquear el número', ok: true, why: 'Sí. Ya está denunciado, así que puedes borrarlo. Bloquear evita que lleguen más mensajes de ese número.'},
            {t: 'Tocar el enlace para comprobar si es de verdad', why: 'No toques nunca los enlaces de los SMS fraudulentos. Bórralo y bloquea el número.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>¡Muy bien!</strong> Has denunciado un SMS fraudulento al 7726, lo que ayuda a los operadores a bloquearlo para todos. Los correos fraudulentos van a report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Las actualizaciones corrigen problemas de seguridad, así que son importantes. Conecta el móvil al cargador y al wifi primero. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toca General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'Información'}, {id: 'software', label: 'Actualización de software', value: '1'}, {id: 'storage', label: 'Almacenamiento del iPhone'}], {back: 'Ajustes'}), target: 'software', say: '<strong>Toca Actualización de software.</strong> El 1 rojo significa que hay una actualización esperando.'},
        {screen: () => list(p, 'Actualización de software', [{id: 'auto', label: 'Actualizaciones automáticas', value: 'Desactivado'}], {back: 'General',
            bottom: '<div class="hu"><strong>Actualización de iOS</strong><p>Esta actualización incluye importantes correcciones de seguridad y se recomienda para todos los usuarios.</p><button type="button" class="ce co" data-tap="update-now">Actualizar ahora</button></div>'}),
         target: 'update-now', say: '<strong>Toca Actualizar ahora.</strong>', hints: {auto: 'También merece la pena activar las actualizaciones automáticas, después de esto. Primero, toca Actualizar ahora.'}},
        {screen: c => codeScreen(p, c, 'Introduce el código', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'Tu iPhone te pide el código. <strong>Escribe el código de prueba 4 7 1 9 3 6.</strong>', hint: 'Escribe 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Actualización de software', [], {back: 'General', bottom: `<div class="hu"><strong>${c.busy ? 'Descargando…' : 'Listo para instalar'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Primero se descarga, lo que puede tardar unos minutos. Después <strong>toca Instalar ahora</strong>. El móvil se reinicia, así que hazlo cuando no vayas a necesitarlo durante 15 a 30 minutos.'},
        {screen: () => list(p, 'Actualización de software', [{id: 'auto', label: 'Actualizaciones automáticas', value: 'Activada'}], {back: 'General', bottom: '<div class="hu"><strong>Tu iPhone está actualizado</strong></div>'}),
         question: {q: '¿Merece la pena activar las actualizaciones automáticas?', options: [
            {t: 'Sí, así se actualiza por la noche mientras carga', ok: true, why: 'Exacto. Ajustes > General > Actualización de software > Actualizaciones automáticas. Se instala por la noche cuando está enchufado y con wifi.'},
            {t: 'No, las actualizaciones son opcionales', why: 'Las actualizaciones corrigen fallos de seguridad que usan los estafadores. Las actualizaciones automáticas te mantienen seguro sin tener que acordarte.'}]}},
        {screen: () => list(p, 'Actualización de software', [], {bottom: '<div class="hu"><strong>Tu iPhone está actualizado ⟦check⟧</strong></div>'}), done: true, say: '<strong>¡Muy bien!</strong> Tu móvil está actualizado y protegido frente a los últimos problemas.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Las actualizaciones corrigen problemas de seguridad, así que son importantes. Conecta el móvil al cargador y al wifi primero. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Baja y <strong>toca Sistema</strong>. <em>En un Samsung, es Actualización de software, cerca del final.</em>'},
        {screen: () => list(p, 'Sistema', [{id: 'languages', label: 'Idiomas'}, {id: 'date', label: 'Fecha y hora'}, {id: 'software', label: 'Actualizaciones de software', sub: 'Actualización disponible'}]), target: 'software', say: '<strong>Toca Actualizaciones de software.</strong>'},
        {screen: () => list(p, 'Actualizaciones de software', [{id: 'system-update', label: 'Actualización del sistema', sub: 'Actualización disponible'}, {id: 'play-update', label: 'Actualización del sistema de Google Play'}]), target: 'system-update', say: '<strong>Toca Actualización del sistema.</strong>'},
        {screen: () => list(p, 'Actualización del sistema', [], {bottom: '<div class="hu"><strong>Actualización del sistema disponible</strong><p>Incluye importantes correcciones de seguridad.</p><button type="button" class="ce dk" data-tap="download">Descargar e instalar</button></div>'}),
         target: 'download', say: '<strong>Toca Descargar e instalar.</strong>'},
        {screen: c => list(p, 'Actualización del sistema', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Descargando e instalando…' : 'Reinicia para terminar'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Se descarga y se prepara, lo que puede tardar un rato. Después <strong>toca Reiniciar ahora</strong>. El móvil se apaga y se vuelve a encender, lo que tarda unos minutos.'},
        {screen: () => list(p, 'Actualización del sistema', [], {bottom: '<div class="hu"><strong>Tu sistema está actualizado</strong></div>'}),
         question: {q: 'Tu móvil lleva años sin recibir una actualización. ¿Qué puede significar?', options: [
            {t: 'Que quizá sea demasiado antiguo para recibir actualizaciones de seguridad, así que es menos seguro', ok: true, why: 'Sí. Los móviles antiguos dejan de recibir actualizaciones. Evita usar la banca en ellos y piensa en cambiarlos cuando puedas.'},
            {t: 'Que funciona perfectamente', why: 'Los móviles dejan de recibir actualizaciones al cabo de unos años, lo que deja sin corregir fallos de seguridad.'}]}},
        {screen: () => list(p, 'Actualización del sistema', [], {bottom: '<div class="hu"><strong>Tu sistema está actualizado ⟦check⟧</strong></div>'}), done: true, say: '<strong>¡Muy bien!</strong> Tu móvil está actualizado y protegido frente a los últimos problemas.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (hija)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Ficha médica' : 'Información médica', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'p. ej., diabetes tipo 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'p. ej., penicilina', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Mostrar con el dispositivo bloqueado</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Listo' : 'Guardar'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Elige un contacto</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Salud', '#fff', ICON2.health]]), target: 'health', say: 'Una <strong>ficha médica</strong> permite al personal sanitario ver tus alergias y tu contacto de emergencia, incluso con el móvil bloqueado. <strong>Abre la app Salud.</strong>'},
            {screen: () => app(p, 'Resumen', '<p class="cf">Aquí se muestran tus datos de salud.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Toca tu foto</strong> arriba a la derecha.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Detalles de salud'}, {id: 'medical', label: 'Ficha médica'}], {back: 'Resumen'}), target: 'medical', say: '<strong>Toca Ficha médica.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Tu móvil puede guardar <strong>información médica</strong> que el personal sanitario puede ver, incluso con el móvil bloqueado. <strong>Toca Ajustes.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Baja y <strong>toca Seguridad y emergencias</strong>. <em>En un Samsung, es Seguridad y emergencia.</em>'},
            {screen: () => list(p, 'Seguridad y emergencias', [{id: 'medical', label: 'Información médica'}, {id: 'contacts-ec', label: 'Contactos de emergencia'}, {id: 'sos', label: 'SOS de emergencia'}]), target: 'medical', say: '<strong>Toca Información médica.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Escribe primero una alergia (para practicar, "Penicilina") y luego añade un contacto de emergencia.',
         say: 'Rellena todo lo que el personal sanitario deba saber. Para practicar, escribe <strong>Penicilina</strong> en alergias. Luego <strong>toca añadir contacto de emergencia</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Elige a quién llamar en caso de emergencia. <strong>Toca Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '"Mostrar con el dispositivo bloqueado" está activado, así que el personal sanitario puede verlo. <strong>Toca Listo.</strong>' : '<strong>Toca Guardar.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Ficha médica' : 'Información médica', [{label: 'Alergias', sub: typed(c, 'allergies')}, {label: 'Contacto de emergencia', sub: 'Sarah (hija)'}]),
         question: {q: p === 'ios' ? '¿Cómo vería un sanitario tu ficha médica si el móvil está bloqueado?' : '¿Cómo lo vería un sanitario si el móvil está bloqueado?', options: [
            {t: 'Con el botón "Emergencia" de la pantalla de bloqueo', ok: true, why: 'Sí. Al tocar Emergencia en la pantalla de bloqueo se muestra tu información médica, sin desbloquear el móvil.'},
            {t: 'No puede', why: 'Sí puede: el botón Emergencia de la pantalla de bloqueo lo muestra, sin necesitar tu código.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Ficha médica' : 'Información médica', [{label: 'Alergias', sub: typed(c, 'allergies')}, {label: 'Contacto de emergencia', sub: 'Sarah (hija)'}]), done: true,
         say: '<strong>¡Muy bien!</strong> Tu información médica y tu contacto de emergencia están guardados. Si pides ayuda con SOS de emergencia, también se avisa a tu contacto de emergencia.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Buscar' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Reproduciendo sonido…' : '⟦volume-2⟧ Reproducir sonido'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Marcar como perdido' : 'Proteger dispositivo'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Si alguna vez pierdes el móvil, puedes encontrarlo, hacerlo sonar o bloquearlo, pero solo si esto está activado antes. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toca tu nombre</strong> en la parte de arriba.'},
            {screen: () => list(p, 'Cuenta de Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Buscar'}, {id: 'family', label: 'En familia'}], {back: 'Ajustes'}), target: 'findmy', say: '<strong>Toca Buscar.</strong>'},
            {screen: c => list(p, 'Buscar', [{id: 'find-toggle', label: 'Buscar mi iPhone', toggle: !!c.findOn}, {label: 'Enviar última ubicación', toggle: !!c.findOn}], {back: 'Cuenta de Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Activa Buscar mi iPhone.</strong> "Enviar última ubicación" envía su ubicación justo antes de que se agote la batería.'},
            {screen: () => homeWith(p, [['findmy', 'Buscar', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Ahora imagina que no encuentras tu móvil. En otro dispositivo Apple abrirías <strong>Buscar</strong> (o irías a icloud.com/find desde un ordenador). Aquí, <strong>toca Buscar</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Baja y <strong>toca Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Todos los servicios'}, {id: 'account', label: 'Gestionar tu cuenta de Google'}]), target: 'all-services', say: '<strong>Toca Todos los servicios.</strong>'},
            {screen: () => list(p, 'Todos los servicios', [{id: 'find-hub', label: 'Find Hub', sub: 'Antes llamado Encontrar mi dispositivo'}, {id: 'theft', label: 'Protección contra robo'}]), target: 'find-hub', say: '<strong>Toca Find Hub</strong> (antes se llamaba Encontrar mi dispositivo). <em>Samsung también tiene el suyo propio: Ajustes &gt; Seguridad y privacidad &gt; Protección de dispositivo perdido.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Usar Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Activa Usar Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Ahora imagina que no encuentras tu móvil. En otro móvil o tableta abrirías <strong>Find Hub</strong>, o irías a google.com/android/find desde un ordenador. Aquí, <strong>toca Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Ahí está, en el mapa. Si está cerca, por ejemplo entre los cojines del sofá, <strong>toca Reproducir sonido</strong>: suena fuerte, incluso en silencio.'},
        {screen: c => findMap(p, c), question: {q: 'El mapa muestra tu móvil en un sitio donde nunca has estado. ¿Qué debes hacer?', options: [
            {t: 'Usar Marcar como perdido o Proteger dispositivo para bloquearlo, y avisar a la policía', ok: true, why: 'Sí. Bloquéalo desde Buscar o Find Hub, no vayas tú mismo a buscarlo y denúncialo a la policía y a tu operador.'},
            {t: 'Ir yo mismo a recuperarlo', why: 'No te enfrentes nunca a un ladrón. Bloquea el móvil a distancia y avisa a la policía.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>¡Muy bien!</strong> La búsqueda de tu móvil está activada y sabes cómo hacerlo sonar o bloquearlo.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Consejos de tecnología gratuitos</strong>${UI.qr}<small>Escanéame</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, '¿Eliminar esta foto?', p === 'ios' ? 'Se conservará en Eliminados recientemente durante 30 días.' : 'Se moverá a la papelera durante un tiempo antes de desaparecer.', [['cancel', 'Cancelar'], ['confirm-delete', 'Eliminar']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Abre la Cámara.</strong> <em>Consejo: en la mayoría de los móviles también puedes deslizar hacia la izquierda en la pantalla de bloqueo.</em>', hint: 'La cámara es el icono gris con una cámara.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Apunta a las flores y mantén firme el pulso. <strong>Toca el botón redondo grande</strong> para hacer una foto.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: '¡Clic! Ya está guardada. <strong>Toca la imagen pequeña</strong> de la esquina para verla.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Para verla de cerca, pon dos dedos sobre la foto y sepáralos. Aquí, <strong>toca ＋ dos veces</strong>.', hint: 'Toca el ＋ de arriba a la derecha.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: '¡Qué bonita! Para enviársela a alguien, <strong>toca el botón de compartir</strong> ⇪ (un cuadrado con una flecha).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Elige cómo enviarla: Mensajes, correo, WhatsApp, etc. <strong>Toca Mensajes.</strong> (Después elegirías a quién enviarla.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: '¡Enviada! Ahora, si haces una foto que no quieres, <strong>toca la papelera</strong> ⟦trash-2⟧ para eliminarla.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Tu móvil te lo pregunta primero. <strong>Toca Eliminar.</strong>'},
        {screen: () => app(p, 'Fotos', '<p class="cf">Todavía no hay fotos.</p>', {back: false, color: '#fff'}), question: {q: '¡Has eliminado una foto por error! ¿Qué puedes hacer?', options: [
            {t: p === 'ios' ? 'Mirar en Álbumes > Eliminados recientemente y recuperarla' : 'Mirar en la Papelera (Biblioteca > Papelera) y restaurarla', ok: true, why: 'Sí. Las fotos eliminadas se conservan un tiempo, normalmente un mes, así que puedes recuperarlas.'},
            {t: 'Nada, se ha perdido para siempre', why: '¡Tranquilo! Se conserva un tiempo en Eliminados recientemente (iPhone) o en la Papelera (Android).'}]}},
        {screen: () => app(p, 'Fotos', '<p class="cf">Todo listo.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes hacer, ampliar, compartir y eliminar fotos.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Si tu familia también tiene iPhone, <strong>FaceTime</strong> permite hacer videollamadas gratis. <strong>Toca FaceTime.</strong>' : '<strong>Google Meet</strong> permite hacer videollamadas gratis desde Android, y también a iPhone. <strong>Toca Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Nueva llamada de FaceTime' : 'Nueva'}</button><p class="cf">Las llamadas recientes aparecen aquí.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Nueva llamada de FaceTime' : 'Nueva'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Nueva llamada de FaceTime' : 'Llamar', `<div class="xz">To: ${field('callto', 'Nombre o número', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Videollamada'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Primero escribe Sarah en el cuadro "Para".',
             say: 'Escribe el nombre de alguien de tus contactos. <strong>Escribe Sarah</strong> y luego <strong>toca el botón de vídeo</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Suena y Sarah contesta. Para enseñarle el jardín, <strong>toca el botón de girar</strong> ⟦switch-camera⟧ y usarás la cámara de la parte trasera.', hint: 'Espera a que Sarah conteste y luego toca ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Cuando termines, <strong>toca el botón rojo</strong> para colgar.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Vídeo · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'Tu amiga tiene un móvil Android y tú un iPhone. ¿Podéis hacer una videollamada igualmente?', options: [
                {t: 'Sí, con WhatsApp o Google Meet, que funcionan en los dos', ok: true, why: 'Exacto. FaceTime es sobre todo de iPhone a iPhone. WhatsApp y Google Meet funcionan en ambos.'},
                {t: 'No, nunca', why: 'Sí se puede: WhatsApp y Google Meet funcionan en los dos tipos de móvil.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Todo listo.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>¡Muy bien!</strong> Has hecho una videollamada y has enseñado lo que ve tu cámara trasera.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Los códigos QR son esos dibujos cuadrados en blanco y negro de los carteles y las cartas de los restaurantes. Tu cámara puede leerlos, sin necesidad de ninguna otra app. <strong>Abre la Cámara.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Apunta la cámara al código y mantén firme el pulso un momento. <strong>Aparece un enlace en la pantalla</strong>: comprueba que parezca de quien esperas y luego <strong>tócalo</strong>.',
         hints: {shutter: 'No hace falta hacer una foto: apunta y espera a que aparezca el enlace, y luego tócalo.'},
         hint: p === 'android' ? 'Espera a que aparezca el enlace y luego tócalo. Si no aparece nada, prueba con Google Lens.' : 'Espera a que aparezca el enlace y luego tócalo.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Consejos de tecnología gratuitos</h3><p>Consejos sencillos sobre móviles, ordenadores y cómo estar seguro en internet.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Ves una pegatina con un código QR en una máquina de pago de un aparcamiento. ¿Cuál es la forma más segura de pagar?', options: [
            {t: 'Usar la app oficial del aparcamiento o la máquina, no un QR pegado encima', ok: true, why: 'Sí. Los estafadores pegan códigos QR falsos encima de los verdaderos para robar los datos de la tarjeta. Comprueba si es una pegatina y usa la app o el cartel oficiales.'},
            {t: 'Escanearlo y pagar, es más rápido', why: 'Las pegatinas con QR falsos en las máquinas de los aparcamientos son una estafa conocida. Usa la app oficial o la propia máquina.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Consejos de tecnología gratuitos</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes escanear códigos QR con la cámara y sabes que primero hay que comprobar el enlace.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Fotos del domingo 📷', 'Hola, mamá, aquí tienes las fotos de la comida…'],
                       ['tv', 'TV Licensing', 'Tu licencia ha CADUCADO', 'Actúa ya para evitar una denuncia. Actualiza tu pago…'],
                       ['library', 'Bridlington Library', 'Tus libros vencen', 'Tienes que devolver tus préstamos el viernes.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Recibidos' : 'Principal', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · para mí</p><h3>Fotos del domingo 📷</h3><p>Hola, mamá, aquí tienes las fotos de la comida. ¡Qué alegría verte! x</p>
                <div class="aep">⟦image⟧ comida.jpg</div>${ctx.replying ? `${field('mailreply', 'Escribe tu respuesta…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Tu licencia ha CADUCADO</h3><p>Actúa ya para evitar una denuncia. Actualiza tus datos de pago en 24 horas: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Mover a No deseado' : '⋮ Notificar phishing'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Correo' : 'tu app de correo (Gmail en la mayoría de los móviles Android)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Los correos nuevos salen en negrita. <strong>Toca el correo de Sarah</strong> para leerlo.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Para contestar, <strong>toca Responder</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Primero escribe una respuesta corta y luego toca Enviar.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Escribe una respuesta corta</strong> (como "¡Gracias, me encantan!") y <strong>toca Enviar</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Enviado ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Volver a recibidos</button>', {color: '#fff'}), target: 'back', say: '<strong>Toca Atrás</strong> para volver a tu bandeja de entrada.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Hay un correo preocupante de "TV Licensing". <strong>Ábrelo</strong>, pero no toques nada de lo que lleva dentro.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Los correos fraudulentos suelen usar un nombre real pero una dirección falsa. <strong>Toca el nombre del remitente</strong> para ver la dirección de correo real.',
         hint: 'Toca "TV Licensing" en la parte de arriba del correo.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Viene de <strong>outlook-mail.com</strong>, no de tvlicensing.co.uk. Es una estafa. <strong>Toca ' + (p === 'ios' ? 'Mover a No deseado' : 'Notificar phishing') + '.</strong> También puedes reenviar los correos fraudulentos a report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: '¿Qué delató la estafa?', options: [
            {t: 'La dirección real del remitente, las amenazas y el plazo de 24 horas', ok: true, why: 'Exacto. Las organizaciones de verdad no te amenazan con plazos, y sus correos llegan desde su propia dirección web.'},
            {t: 'Nada, parecía auténtico', why: 'Mira la dirección del remitente: no era la de TV Licensing. Las amenazas y los plazos muy cortos también son señales de alarma.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes leer y responder correos, y detectar y denunciar una estafa.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Obtener' : 'Instalar';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Toca Buscar.</strong>' : '<strong>Toca la barra de búsqueda.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Hemos buscado "NHS App". Muchas apps usan "NHS" en su nombre. Fíjate en <strong>quién la ha creado</strong>: la verdadera es de <strong>NHS England</strong>. <strong>Toca ' + (p === 'ios' ? 'Obtener' : 'Instalar') + ' junto a la verdadera.</strong>',
         hints: {'fake1-get': 'Esa es de HealthApps Ltd y es un anuncio. La NHS App de verdad es de NHS England.', 'fake2-get': 'Esa es de QuickDev Apps, no del NHS. La de verdad es de NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: '¡Instalada! Ahora quita una app que no uses nunca, para ordenar y liberar espacio. <strong>Mantén pulsada la app El tiempo</strong> hasta que aparezca un menú.', hint: 'Deja el dedo sobre el icono de El tiempo durante uno o dos segundos.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? '¿Eliminar "El tiempo"?' : 'El tiempo', p === 'ios' ? 'Si la quitas de la pantalla de inicio, la app seguirá en tu biblioteca de apps.' : '', p === 'ios'
            ? [['delete-app', 'Eliminar app'], ['remove-home', 'Quitar de la pantalla de inicio'], ['cancel', 'Cancelar']] : [['app-info', 'Información de la app'], ['delete-app', 'Desinstalar'], ['cancel', 'Cancelar']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Toca Eliminar app</strong> y luego <strong>Eliminar app</strong> (aquí es un solo botón).' : '<strong>Toca Desinstalar.</strong>',
         hints: {'remove-home': 'Eso solo oculta el icono; la app sigue en tu móvil. Toca Eliminar app.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Una app te pide un pago para "desbloquear" tu historial del NHS. ¿Qué te parece?', options: [
            {t: 'No es la NHS App de verdad, que es totalmente gratuita', ok: true, why: 'Exacto. La NHS App es gratuita. Elimina cualquier app que te pida pagar por servicios del NHS.'},
            {t: 'Pago, es para el NHS', why: 'La NHS App de verdad es gratuita y es de NHS England. Una app que pide dinero no es la verdadera.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>¡Muy bien!</strong> Sabes distinguir las apps de verdad de las imitaciones y quitar las que no necesitas.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Te damos la bienvenida de nuevo.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Iniciar sesión con Face ID' : 'Iniciar sesión con la huella'}</button>
                <button type="button" class="cp" data-tap="password">Iniciar sesión con correo y contraseña</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Recetas'], ['appointments', '⟦calendar⟧', 'Citas'], ['records', '⟦clipboard-list⟧', 'Tu salud'], ['messages', '⟦mail⟧', 'Mensajes']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Recetas', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Pedir una receta repetida</strong><small>Elige los medicamentos que ya te han recetado</small></button><div class="ck"><strong>Ver tus pedidos</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipino 5 mg comprimidos'], ['med-2', 'Atorvastatina 20 mg comprimidos']];
            return app(p, 'Elegir medicamentos', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Confirma tu pedido', `<p class="cf">Amlodipino 5 mg comprimidos<br>Recoger en: Tu farmacia designada</p><button type="button" class="ce co" data-tap="confirm">Confirmar y pedir</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Pedido enviado', '<p class="cf">⟦check⟧ Tu solicitud de receta se ha enviado a tu centro de salud. Suele tardar de 2 a 3 días laborables.</p><button type="button" class="cp" data-tap="home">Volver al inicio</button>', {color: NHS});
        return app(p, 'Citas', '<div class="fo"><div class="ck"><strong>Cita con el médico de cabecera</strong><small>Martes a las 10:30 · Tu centro de salud</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: 'La <strong>NHS App</strong> es gratuita y te permite pedir recetas repetidas, ver tus citas y más. (Esta versión de práctica es de mentira, hecha solo para esta lección.) <strong>Toca NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Una vez que la hayas configurado con NHS login, puedes iniciar sesión con tu ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Toca Iniciar sesión con ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Eso también funciona, pero la cara o la huella es más rápido. Toca el botón azul.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Toca Recetas.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Toca Pedir una receta repetida.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Toca un medicamento para marcarlo primero y luego toca Continuar.',
         say: '<strong>Toca el medicamento que necesitas</strong> para marcarlo (prueba con Amlodipino) y luego <strong>toca Continuar</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Comprueba que es correcto y luego <strong>toca Confirmar y pedir</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: '¡Enviado a tu centro de salud! <strong>Toca Volver al inicio.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'También puedes consultar tus citas. <strong>Toca Citas.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Un SMS dice "NHS: tienes derecho a un kit de pruebas gratuito, introduce tus datos bancarios para pagar el envío". ¿Qué es?', options: [
            {t: 'Una estafa. El NHS nunca pide datos bancarios por SMS', ok: true, why: 'Exacto. Usa la NHS App o tu centro de salud directamente, nunca enlaces de SMS.'},
            {t: 'Es de verdad, solo es el envío', why: 'El NHS nunca manda SMS pidiendo datos bancarios. Es una estafa: reenvíalo al 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>¡Muy bien!</strong> Has pedido una receta repetida y has consultado tus citas.'},
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
        if (page === 'login') return app(p, 'Banco de prueba', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Iniciar sesión con Face ID' : 'Iniciar sesión con la huella'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Tus cuentas', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Hoy'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Hoy'], ['txn-pension', 'Pensión estatal', '+£921.60', 'Ayer'], ['txn-water', 'Yorkshire Water (domiciliación)', '−£38.00', 'Lun']];
            return app(p, 'Cuenta corriente', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Pago', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Hoy, 03:12 · Tarjeta terminada en 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Congelar tarjeta</strong><small>${ctx.frozen ? 'Tarjeta congelada ⟦check⟧' : 'Detén los pagos al instante'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Denunciar este pago</strong><small>¿No lo reconoces? Cuéntanoslo</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Banco', BANK, ICON2.pound]]), target: 'bank',
         say: 'Las apps de los bancos te permiten consultar tu dinero en cualquier momento. (Este es un banco de mentira para practicar.) <strong>Abre la app Banco.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Inicia sesión con tu ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> No compartas con nadie el código de tu banca.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Toca tu Cuenta corriente</strong> para ver lo que se ha pagado y lo que ha entrado.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Mira los pagos. Hay uno que no reconoces: <strong>249 £ a las 3 de la madrugada, a una web de tarjetas regalo</strong>. <strong>Tócalo.</strong>',
         hints: {'txn-tesco': 'Eso es tu compra. Busca uno que no reconozcas.', 'txn-pension': 'Eso es el ingreso de tu pensión. Busca el que no encaja.', 'txn-water': 'Eso es tu recibo del agua. Busca el que no encaja.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Toca Congelar tarjeta</strong>. Detiene al instante cualquier otro pago, y puedes descongelarla más tarde si resulta que todo estaba bien.',
         hints: {report: 'Congela primero la tarjeta, para detener más pagos. Después denuncia el pago.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Has congelado la tarjeta. ¿Y ahora qué?', options: [
            {t: 'Llamar a mi banco al 159 o al número de la tarjeta, o denunciarlo en la app', ok: true, why: 'Sí. Pueden investigarlo, cancelar la tarjeta y, a menudo, recuperar el dinero. Cuanto antes se lo cuentes, mejor.'},
            {t: 'Esperar a ver si vuelve a pasar', why: 'Díselo a tu banco enseguida. Cuanto antes lo sepan, más podrán hacer.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>¡Muy bien!</strong> Has revisado tu cuenta, has detectado un pago que no reconocías y has congelado tu tarjeta.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Banco de prueba</strong><span>•••• 4421</span><small>DÉBITO</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Cartera' : 'Google Wallet', `<p class="cf">Añade una tarjeta para pagar en las tiendas con el móvil.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Añadir tarjeta' : '＋ Añadir a Cartera'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Añadir tarjeta', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Coloca la tarjeta dentro del marco…' : 'Tarjeta encontrada ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Verificar tarjeta', `<p class="cf">Tu banco necesita comprobar que eres tú. Elige cómo recibir un código:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Mensaje de texto</strong><small>a ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Llamar a tu banco</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Introduce el código', `<div class="jp ex"><strong>Mensajes · ahora</strong><span>Banco de prueba: tu código de Cartera es 529173. No lo compartas nunca.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Cartera' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Tu tarjeta está lista para usar.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Acerca al lector…' : 'Mantén junto al lector…') : '⟦check⟧ Listo'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Cartera' : 'Cartera', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Pagar con el móvil es rápido y seguro: las tiendas nunca ven el número de tu tarjeta. <strong>Abre ${p === 'ios' ? 'Cartera' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Añadir tarjeta' : '＋ Añadir a Cartera'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Tu móvil usa la cámara para leer la tarjeta, así que no tienes que escribir el número. <strong>Coloca la tarjeta dentro del marco</strong> y luego <strong>toca Siguiente</strong>. <em>No escribas nunca el número de tu tarjeta en una página web que te llegue en un SMS o un correo.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Tu banco comprueba que de verdad eres tú. <strong>Toca Mensaje de texto.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Te llega un código por SMS de tu banco. <strong>Escribe 5 2 9 1 7 3.</strong> Recuerda: este código solo se escribe en tu propio móvil, y nunca se le da a nadie que lo pida.', hint: 'Escribe el código del mensaje: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Tu tarjeta está lista. Ahora vamos a pagar en una tienda. <strong>Toca en cualquier parte de la tarjeta.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'En la caja, <strong>pulsa dos veces el botón lateral</strong> de tu iPhone (aquí toca ⟦power⟧ dos veces), mira la pantalla para Face ID y luego acerca la parte de arriba del móvil al lector de tarjetas.', hint: 'Toca dos veces el botón ⟦power⟧ del lateral.'}
            : {target: 'pay-now', say: 'En la caja, <strong>desbloquea el móvil y acerca la parte trasera al lector de tarjetas</strong>. Aquí, <strong>toca el lector de tarjetas</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: '¿Es seguro pagar con el móvil?', options: [
            {t: 'Sí, más seguro que con la tarjeta: hace falta tu cara, tu huella o tu código, y las tiendas no ven el número de tu tarjeta', ok: true, why: 'Exacto. Y si pierdes el móvil, nadie puede pagar con él sin desbloquearlo.'},
            {t: 'No, cualquiera podría usarlo', why: 'Cada pago necesita tu cara, tu huella o tu código, así que en realidad es más seguro que una tarjeta sin contacto.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>¡Muy bien!</strong> Tu tarjeta está en el móvil y has hecho un pago de prueba.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>DÉBITO</small></div>', '<small>DÉBITO</small></div></button>');
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
            return app(p, 'Tren de prueba', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Elegir estación'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Añadir una Railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Elige una estación</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Añadir una Railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Sin Railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Directo'], ['t-1145', '11:45', '12:32', 'Directo'], ['t-1245', '12:45', '13:32', 'Directo']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Los precios son inventados para esta práctica. Descuento de Railcard aplicado.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Billete de ida fuera de hora punta</strong><span>7,40 £</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Ida y vuelta en el día fuera de hora punta</strong><small>Vuelve hoy</small><span>9,85 £</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Tu billete', `<div class="adt"><strong>Ida y vuelta en el día fuera de hora punta</strong><span>Bridlington ⇄ Hull</span><span>Hoy · Senior Railcard</span>
            ${UI.qr}<small>Escanea esto en la barrera del andén o enséñaselo al revisor.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Trenes', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Las apps de trenes te permiten comprar billetes en el móvil, sin colas. (Esta app de práctica es de mentira: los precios y los horarios son inventados.) <strong>Abre Trenes.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Sales de Bridlington. <strong>Toca Destino</strong> para elegir adónde vas.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Toca Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: '¿Tienes más de 60 años? Una <strong>Senior Railcard</strong> ahorra un tercio en la mayoría de los billetes. <strong>Toca Railcard</strong> para añadir la tuya.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Toca Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Toca Buscar trenes.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Estos son los trenes. <strong>Toca el de las 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: '¿Vuelves hoy? Un billete de ida y vuelta en el día suele salir más barato que dos de ida. <strong>Toca Ida y vuelta en el día fuera de hora punta</strong> y luego paga.',
         hints: {single: 'Un billete de ida es solo de ida. Hoy vuelves, así que toca Ida y vuelta en el día fuera de hora punta.', pay: 'Elige primero tu billete: toca Ida y vuelta en el día fuera de hora punta.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Toca ${p === 'ios' ? 'Pagar' : 'G Pay'}</strong> para pagar con la tarjeta que tienes en el móvil (de la lección de pago sin contacto).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Te queda poca batería antes del tren de vuelta a casa. ¿Qué es una buena idea?', options: [
            {t: 'Hacer una captura de pantalla del billete y activar el ahorro de batería', ok: true, why: 'Sí. Algunos billetes valen con una captura de pantalla, y el ahorro de batería ayuda a que dure. Muchas apps también permiten añadir el billete a la Cartera.'},
            {t: 'Nada, no pasará nada', why: 'Si el móvil se apaga, no puedes enseñar el billete. Haz una captura de pantalla y ahorra batería.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>¡Muy bien!</strong> Has planificado un viaje, has añadido una Railcard y has comprado un billete en el móvil.'},
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

    const busTable = `<div class="sj"><strong>Autobús 121: de Bridlington a Hull</strong><small>Solo horarios de práctica</small>
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
        return app(p, 'Horarios de autobús', busTable, {back: false, color: '#fff',
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
            ? 'Una captura de pantalla es una foto de lo que hay en tu pantalla, como estos horarios de autobús. Pulsa a la vez el <strong>botón lateral</strong> (derecha) y <strong>subir volumen</strong> (izquierda) y suéltalos. Aquí, <strong>toca el botón lateral y luego subir volumen</strong>.'
            : 'Una captura de pantalla es una foto de lo que hay en tu pantalla, como estos horarios de autobús. Pulsa a la vez el <strong>botón de encendido</strong> y <strong>bajar volumen</strong> y suéltalos. Aquí, <strong>toca el botón de encendido y luego bajar volumen</strong>.',
         hints: {'vol-down': p === 'ios' ? 'En un iPhone es subir el volumen, con el botón lateral.' : 'Empieza por el botón de encendido, en la parte de arriba del lado derecho.',
                 'vol-up': p === 'ios' ? 'Empieza por el botón lateral de la derecha.' : 'En Android es bajar el volumen, con el botón de encendido.',
                 side: 'Ahora el botón de subir volumen, a la izquierda.', power: 'Ahora el botón de bajar volumen.'},
         hint: p === 'ios' ? 'El botón lateral está en el borde derecho. Subir volumen está a la izquierda.' : 'El botón de encendido es el de arriba del borde derecho.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: '¡Clic! Aparece una imagen pequeña en la esquina de abajo. <strong>Tócala</strong> para ver tu captura. <em>Si la dejas, se guarda sola al cabo de unos segundos.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Aquí puedes dibujar sobre ella o recortarla. <strong>Toca Listo</strong> arriba a la izquierda.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Toca Guardar en Fotos.</strong>', hints: {'delete-shot': 'Eso la tiraría a la basura. Toca Guardar en Fotos.', 'save-files': 'Archivos también sirve, pero Fotos es más fácil de encontrar. Toca Guardar en Fotos.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: '¡Clic! Aparece una imagen pequeña con botones debajo. Ya está guardada. <strong>Toca Compartir</strong> para enviársela a alguien.', hints: {'shot-edit': 'Editar permite recortarla o dibujar sobre ella. Por ahora, toca Compartir.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Toca Sarah</strong> para enviarle los horarios de autobús.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: '¿Dónde puedes encontrar tus capturas de pantalla más tarde?', options: [
            {t: 'En la app Fotos, en el álbum Capturas de pantalla', ok: true, why: 'Sí. Se guardan con tus fotos, así que puedes verlas, compartirlas o eliminarlas como cualquier foto.'},
            {t: 'Desaparecen al cabo de un día', why: 'Se quedan hasta que las elimines. Búscalas en la app Fotos, en el álbum Capturas de pantalla.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>¡Muy bien!</strong> Las capturas de pantalla son prácticas para horarios de autobús, billetes, mensajes de error y todo lo que quieras guardar o enseñar a alguien. Puedes eliminarlas de Fotos cuando termines.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Buscar en Mapas'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah te ha mandado una dirección por SMS. Copiarla te ahorra escribirla de nuevo. <strong>Abre Mensajes.</strong>'},
        {screen: () => app(p, 'Mensajes', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Toca el mensaje de Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Mantén pulsado el mensaje con la dirección</strong> (deja el dedo sobre él uno o dos segundos) hasta que aparezca un menú.', hint: 'Mantén el dedo pulsado sobre el segundo mensaje hasta que aparezca un menú.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Toca Copiar.</strong> Ahora tu móvil recuerda las palabras, listas para pegarlas en otro sitio.',
         hints: {reply: 'Responder empezaría un mensaje. Toca Copiar.', forward: 'Reenviar manda el mensaje a otra persona. Toca Copiar.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: '¡Copiado! Ahora ve a la pantalla de inicio. Aquí, <strong>toca la barra de abajo de la pantalla</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Abre Mapas</strong>, para poder buscar la dirección.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Mantén pulsado el cuadro de búsqueda</strong> hasta que aparezca un botoncito "Pegar".', hint: 'Deja el dedo sobre el cuadro de búsqueda de arriba.',
         hints: {'search-tap': 'Un toque rápido abre el teclado. Mantén pulsado en su lugar, hasta que aparezca Pegar.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Toca Pegar.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Aparece la dirección entera, sin escribir nada. <strong>Toca el resultado.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Quieres copiar solo un número de teléfono del medio de un mensaje largo. ¿Cómo?', options: [
            {t: 'Mantener pulsado, tocar Seleccionar (o arrastrar los tiradores) para elegir solo la parte que quiero y luego Copiar', ok: true,
             why: 'Sí. Arrastra los tiradores de cada lado de las palabras resaltadas para elegir justo lo que quieres.'},
            {t: 'Solo se puede copiar el mensaje entero', why: 'Puedes elegir una parte: mantén pulsado, toca Seleccionar y arrastra los tiradores.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>¡Muy bien!</strong> Copiar y pegar funciona casi en todas partes: mensajes, correos, páginas web y formularios. Mantén pulsado para copiar; mantén pulsado para pegar.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Almacenamiento'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Almacenamiento del iPhone', [{caption: 'RECOMENDACIONES'},
                ctx.offloaded ? {label: 'Descargar apps no usadas', value: 'Activado ⟦check⟧'} : {id: 'offload', label: 'Descargar apps no usadas', sub: 'Ahorra 2,1 GB. Elimina las apps que no usas pero conserva sus datos.', value: 'Activar'},
                {caption: 'APPS'}, {label: 'Fotos', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'General', top: bar});
        }
        return list(p, 'Almacenamiento', [{label: 'Fotos y vídeos', value: '21,3 GB'}, {label: 'Apps', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Incluido WhatsApp'}, {label: 'Documentos y otros', value: '4,1 GB'},
            {label: 'Sistema', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1,1 GB de archivos basura limpiados</p>' : '<button type="button" class="ce dk" data-tap="free-up">Liberar espacio</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Ajustes', `<div class="fo">${[['account', 'Cuenta'], ['privacy', 'Privacidad'], ['chats', 'Chats'], ['notifications', 'Notificaciones'], ['storage', 'Almacenamiento y datos'], ['help', 'Ayuda']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Almacenamiento y datos', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Administrar almacenamiento', `<div class="iq"><span>WhatsApp está usando ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Más de 5 MB</strong><small>Nada que revisar</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Reenviado muchas veces</strong><small>112 elementos · 0,9 GB</small></div>
                <div class="he">CHATS</div><div class="ck"><strong>Familia</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Más de 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, '¿Eliminar 23 elementos?', 'Se eliminarán de WhatsApp. Las fotos que ya estén guardadas en la galería de tu móvil se quedan ahí.', [['cancel', 'Cancelar'], ['confirm-delete', 'Eliminar']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '¿Te sale "Almacenamiento casi lleno"? Vamos a ver qué ocupa el espacio. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toca General.</strong>'},
            {screen: () => list(p, 'General', [{id: 'about', label: 'Información'}, {id: 'update', label: 'Actualización de software'}, {id: 'storage', label: 'Almacenamiento del iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN y gestión de dispositivos'}], {back: 'Ajustes'}),
             target: 'storage', say: '<strong>Toca Almacenamiento del iPhone.</strong> Tarda unos segundos en calcularlo todo.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'La barra de colores muestra qué ocupa el espacio. Primero, un truco rápido: <strong>Descargar apps no usadas</strong> quita las apps que llevas un tiempo sin usar, pero conserva tus datos por si quieres recuperarlas. <strong>Toca Activar.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Toca Almacenamiento.</strong> <em>En un Samsung, es Batería y cuidado del dispositivo, y luego Almacenamiento.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'La barra de colores muestra qué ocupa el espacio. <strong>Toca Liberar espacio.</strong>'},
            {screen: () => app(p, 'Archivos', `<div class="ke"><strong>Borrar archivos basura</strong><small>1,1 GB de archivos temporales de las apps</small><button type="button" class="ce dk" data-tap="clean">Limpiar</button></div>
                <div class="ke"><strong>Borrar capturas de pantalla antiguas</strong><small>214 MB</small><span class="fd">Seleccionar y liberar</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Los archivos basura se pueden borrar sin problema: son archivos temporales que las apps no necesitan. <strong>Toca Limpiar.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp está usando 14,8 GB. ¿Qué lo está llenando?', options: [
            {t: 'Los vídeos y las fotos que te envía la gente, sobre todo en grupos', ok: true, why: 'Sí. Todos los vídeos enviados a un chat familiar o de grupo se guardan en tu móvil. WhatsApp puede encontrar y borrar los más grandes.'},
            {t: 'Tus mensajes de texto', why: 'El texto casi no ocupa espacio. Son los vídeos y las fotos que envía la gente, sobre todo en grupos.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Abre WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'En WhatsApp, toca <strong>Ajustes</strong> abajo a la derecha. Aquí ya está abierto. <strong>Toca Almacenamiento y datos.</strong>'
                          : 'En WhatsApp, toca los <strong>tres puntos ⋮</strong> de arriba y luego <strong>Ajustes</strong>. Aquí ya está abierto. <strong>Toca Almacenamiento y datos.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Toca Administrar almacenamiento.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Lo que más espacio ahorra está arriba. <strong>Toca Más de 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Estos son vídeos grandes que te ha enviado la gente. Si quieres conservar alguno, guárdalo primero en tus fotos. <strong>Toca Seleccionar todo.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Toca Eliminar.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Esto solo elimina las copias que hay dentro de WhatsApp. <strong>Toca Eliminar</strong> para confirmar.', hints: {cancel: 'Cancelar los conservaría. Para esta práctica, toca Eliminar.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>¡Muy bien!</strong> Has liberado más de 7 GB. Merece la pena hacerlo cada pocos meses. Vacía también <strong>Eliminados recientemente</strong> en Fotos, porque las fotos eliminadas siguen ocupando espacio durante 30 días.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Reloj mundial'], ['alarms', 'Alarmas'], ['stopwatch', 'Cronómetro'], ['timers', 'Temporizadores']]
            : [['alarms', 'Alarma'], ['world', 'Reloj'], ['timers', 'Temporizador'], ['stopwatch', 'Cronómetro']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Hoy</small><strong>Londres</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Australia</small><strong>Sídney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Pastillas')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Alarma</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Reloj mundial' : 'Reloj') : (p === 'ios' ? 'Alarmas' : 'Alarma')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Nunca'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Alarma', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Una alarma puede recordarte que te tomes las pastillas todos los días. <strong>Abre la app Reloj.</strong>', hint: 'Es el icono negro con una esfera de reloj blanca.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Toca ${p === 'ios' ? 'Alarmas' : 'Alarma'}</strong> (${p === 'ios' ? 'bottom' : 'bottom left'}).`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Toca +</strong> para añadir una alarma nueva.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'En un móvil de verdad desplazas los números para fijar la hora. Aquí, <strong>toca 08:00</strong>.', hints: {'t-07': 'Elige las 08:00 para esta práctica.', 't-09': 'Elige las 08:00 para esta práctica.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Lo necesitas todos los días, no solo una vez. <strong>Toca Repetir.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Todos los días'; }, say: '<strong>Toca Todos los días.</strong>',
         hints: {never: 'Nunca significa que suena solo una vez. Toca Todos los días.', weekdays: 'Entre semana se salta el fin de semana. Toca Todos los días.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Primero escribe una etiqueta en el cuadro Etiqueta, como Pastillas.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Una etiqueta te dice para qué es la alarma. <strong>Toca el cuadro Etiqueta y escribe Pastillas</strong> y luego <strong>toca Guardar</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'La alarma suena a las 8. Te tomas las pastillas. ¿Qué botón pulsas?', options: [
            {t: 'Parar', ok: true, why: 'Sí. Parar la apaga hasta mañana a las 8, porque se repite todos los días.'},
            {t: 'Posponer', why: 'Posponer hace que vuelva a sonar en unos 9 minutos. Úsalo si necesitas un poco más de tiempo, pero Parar la apaga hasta mañana.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>¡Muy bien!</strong> Tu alarma de las pastillas suena a las 8 todas las mañanas. ' + (p === 'ios' ? 'La app <strong>Salud</strong> también tiene una sección de Medicamentos que te los recuerda y lleva un registro.' : 'También puedes pedírselo a Google: "Recuérdame que me tome las pastillas todos los días a las 8".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Si tu móvil se perdiera o se rompiera, ¿estarían a salvo tus fotos? Vamos a comprobarlo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toca tu nombre</strong> en la parte de arriba.'},
        {screen: () => list(p, 'Cuenta de Apple', [{id: 'personal', label: 'Información personal'}, {id: 'security', label: 'Inicio de sesión y seguridad'}, {id: 'payment', label: 'Pago y envío'}, {id: 'subscriptions', label: 'Suscripciones'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'En familia'}, {id: 'findmy', label: 'Buscar'}], {back: 'Ajustes'}),
         target: 'icloud', say: '<strong>Toca iCloud.</strong> iCloud es el almacenamiento en línea de Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ALMACENAMIENTO: 4,2 GB DE 5 GB USADOS'}, {caption: 'GUARDADO EN ICLOUD'}, {id: 'photos', label: 'Fotos', value: c.photoSync ? 'Activada' : 'Desactivado'}, {id: 'backup', label: 'Copia de seguridad de iCloud', value: c.backedUp ? 'Activada' : 'Desactivado'},
            {label: 'Contactos', value: 'Activada'}, {label: 'Notas', value: 'Activada'}], {back: 'Cuenta de Apple'}),
         target: 'photos', say: 'Fotos y Copia de seguridad están <strong>desactivadas</strong>. Eso significa que, si pierdes el móvil, perderías las fotos. <strong>Toca Fotos.</strong>'},
        {screen: c => list(p, 'Fotos', [{id: 'sync', label: 'Sincronizar este iPhone', toggle: !!c.photoSync, sub: 'Guarda tus fotos y vídeos en iCloud, para que estén a salvo si pierdes el móvil.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Toca Sincronizar este iPhone</strong> para activarlo.'},
        {screen: c => list(p, 'Fotos', [{label: 'Sincronizar este iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Toca ‹ iCloud</strong> para volver.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ALMACENAMIENTO: 4,2 GB DE 5 GB USADOS'}, {caption: 'GUARDADO EN ICLOUD'}, {id: 'photos', label: 'Fotos', value: 'Activada'}, {id: 'backup', label: 'Copia de seguridad de iCloud', value: 'Desactivado'}], {back: 'Cuenta de Apple'}),
         target: 'backup', say: 'Ahora haz una copia del resto: ajustes, mensajes y apps. <strong>Toca Copia de seguridad de iCloud.</strong>'},
        {screen: c => list(p, 'Copia de seguridad', [{id: 'backup-toggle', label: 'Copia de seguridad de este iPhone', toggle: !!c.backedUp, sub: 'Hace una copia automática cada noche cuando tu iPhone está cargando, bloqueado y con wifi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Toca Copia de seguridad de este iPhone</strong> para activarlo.'},
        {screen: () => list('ios', 'Copia de seguridad', [{label: 'Copia de seguridad de este iPhone', toggle: true}, {id: 'backup-now', label: 'Realizar copia de seguridad ahora', sub: 'Última copia de seguridad correcta: Nunca'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'A partir de ahora hará una copia cada noche. Haz la primera ahora: <strong>toca Realizar copia de seguridad ahora</strong>.'},
        {screen: c => list('ios', 'Copia de seguridad', [{label: 'Copia de seguridad de este iPhone', toggle: true}, {label: c.busy ? 'Haciendo copia de seguridad…' : 'Realizar copia de seguridad ahora', sub: c.busy ? 'Quedan unos 5 minutos' : 'Última copia de seguridad correcta: Ahora mismo ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Un SMS dice "Tu almacenamiento de iCloud está lleno. Tus fotos se eliminarán hoy. Paga 99 peniques aquí: [link]". ¿Qué haces?', options: [
            {t: 'Ignorar el enlace. Comprobar en Ajustes > tu nombre > iCloud y reenviar el SMS al 7726', ok: true, why: 'Sí. Es una estafa muy habitual. Apple no manda enlaces por SMS y nunca elimina tus fotos de esa manera. Comprueba tu almacenamiento real en Ajustes.'},
            {t: 'Pagar rápido para salvar las fotos', why: 'Es una estafa para conseguir los datos de tu tarjeta. Comprueba tu almacenamiento real en Ajustes > tu nombre > iCloud y reenvía el SMS al 7726.'}]}},
        {screen: () => list('ios', 'Copia de seguridad', [{label: 'Copia de seguridad de este iPhone', toggle: true}, {label: 'Realizar copia de seguridad ahora', sub: 'Última copia de seguridad correcta: Ahora mismo ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>¡Muy bien!</strong> Tus fotos y tu móvil tienen copia de seguridad. Los 5 GB gratuitos se llenan rápido con las fotos; si pasa, tener más espacio (iCloud+) cuesta una pequeña cuota mensual, y solo se compra en Ajustes, nunca desde un SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Si tu móvil se perdiera o se rompiera, ¿estarían a salvo tus fotos? Vamos a comprobarlo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toca Google.</strong> Está cerca del final.', hint: 'Baja por la lista: Google está cerca del final.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gestionar tu cuenta de Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Copia de seguridad', sub: 'Desactivado'}, {id: 'autofill', label: 'Autocompletar'}, {id: 'devices', label: 'Dispositivos y uso compartido'}]),
         target: 'backup', say: 'Copia de seguridad dice <strong>Desactivada</strong>. <strong>Toca Copia de seguridad.</strong> <em>En un Samsung, es Ajustes > Cuentas y copia de seguridad.</em>'},
        {screen: c => list(p, 'Copia de seguridad', [{id: 'backup-toggle', label: 'Copia de seguridad de Google One', toggle: !!c.backedUp, sub: 'Guarda copia de las apps, los mensajes, el historial de llamadas, los contactos y los ajustes.'},
            {id: 'photos-backup', label: 'Fotos y vídeos', sub: c.photoSync ? 'Activada · Google Fotos' : 'Desactivada · Google Fotos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Toca Copia de seguridad de Google One</strong> para activarla.'},
        {screen: c => list(p, 'Copia de seguridad', [{label: 'Copia de seguridad de Google One', toggle: true}, {id: 'photos-backup', label: 'Fotos y vídeos', sub: 'Desactivada · Google Fotos'}]),
         target: 'photos-backup', say: 'Las fotos van aparte. <strong>Toca Fotos y vídeos.</strong>'},
        {screen: c => list(p, 'Copia de seguridad', [{id: 'photos-toggle', label: 'Copia de seguridad de fotos y vídeos', toggle: !!c.photoSync, sub: 'Los guarda en Google Fotos, para que estén a salvo si pierdes el móvil.'},
            {label: 'Calidad de la copia de seguridad', value: 'Ahorro de espacio'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Toca Copia de seguridad de fotos y vídeos</strong> para activarla.'},
        {screen: () => list(p, 'Copia de seguridad', [{label: 'Copia de seguridad de fotos y vídeos', toggle: true}, {id: 'backup-now', label: 'Hacer copia ahora', sub: 'Última copia: Nunca'}]),
         target: 'backup-now', say: 'A partir de ahora hace la copia sola, con wifi. Haz la primera ahora: <strong>toca Hacer copia ahora</strong>.'},
        {screen: c => list(p, 'Copia de seguridad', [{label: 'Copia de seguridad de fotos y vídeos', toggle: true}, {label: c.busy ? 'Haciendo copia de seguridad…' : 'Hacer copia ahora', sub: c.busy ? '1,204 items left' : 'Última copia: Ahora mismo ⟦check⟧'}]), wait: 1500,
         question: {q: 'Un SMS dice "Tu almacenamiento de Google está lleno. Tus fotos se eliminarán hoy. Paga 99 peniques aquí: [link]". ¿Qué haces?', options: [
            {t: 'Ignorar el enlace. Comprobar en Ajustes > Google > Copia de seguridad y reenviar el SMS al 7726', ok: true, why: 'Sí. Es una estafa muy habitual. Google no manda enlaces como este por SMS. Comprueba tu almacenamiento real en Ajustes.'},
            {t: 'Pagar rápido para salvar las fotos', why: 'Es una estafa para conseguir los datos de tu tarjeta. Comprueba tu almacenamiento real en Ajustes y reenvía el SMS al 7726.'}]}},
        {screen: () => list(p, 'Copia de seguridad', [{label: 'Copia de seguridad de fotos y vídeos', toggle: true}, {label: 'Hacer copia ahora', sub: 'Última copia: Ahora mismo ⟦check⟧'}]), done: true,
         say: '<strong>¡Muy bien!</strong> Tus fotos y tu móvil tienen copia de seguridad. Google te da 15 GB gratis; si se llenan, tener más espacio cuesta una pequeña cuota mensual, y solo se compra en Ajustes o en la app Google One, nunca desde un SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 ¡ENHORABUENA! 🎉</strong><p>¡Has sido elegido para ganar un vale de compra de 500 £!</p>
        <button type="button" class="aeb" data-tap="claim">RECLAMAR AHORA</button><small>Anuncio</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Información de la app', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>Servicio del sistema</strong><small>Versión 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Abrir</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Desinstalar</button>
            <button type="button" data-tap="force-stop">Forzar detención</button></div>
            <div class="cj ex"><span class="hf"><strong>Batería</strong><small>38 % de uso desde la última carga completa</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Permisos</strong><small>Mostrar sobre otras apps, Administrador del dispositivo</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'Servicio del sistema', '¿Quieres desinstalar esta app?', [['cancel', 'Cancelar'], ['confirm-uninstall', 'Aceptar']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>CALENDARIO · ahora</strong>
            <span>⚠️ ¡Tu iPhone puede estar infectado! Toca aquí para limpiarlo ahora.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Te están saliendo anuncios en la pantalla de inicio, aunque no haya ninguna app abierta. Eso suele significar que se ha colado una app mala. Primero, <strong>no toques el anuncio. Toca el pequeño símbolo ⟦x⟧ para cerrarlo.</strong>',
         hints: {claim: 'No toques nunca el propio anuncio. Busca el pequeño símbolo ⟦x⟧ en la esquina.'}, hint: 'El símbolo ⟦x⟧ es pequeño y está en la esquina superior derecha del anuncio.'},
        {screen: () => home(p), target: 'settings', say: 'Las apps malas funcionan todo el rato, así que gastan mucha batería. Así es como se encuentran. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Toca Batería.</strong> <em>En un Samsung, es Batería y cuidado del dispositivo, y luego Batería.</em>'},
        {screen: () => list(p, 'Batería', [{id: 'usage', label: 'Uso de la batería', sub: 'Ver uso desde la última carga completa'}, {label: 'Ahorro de batería', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Toca Uso de la batería.</strong> <em>En algunos Samsung, toca el gráfico o Ver detalles.</em>'},
        {screen: () => list(p, 'Uso de la batería', [], {top: `<div class="nl">${[['Servicio del sistema', 38], ['Pantalla', 21], ['WhatsApp', 12], ['YouTube', 8], ['Cámara', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: '¿Cuál de estas parece fuera de lugar?', options: [
            {t: 'Servicio del sistema: nunca lo has usado y es la que más batería gasta', ok: true, why: 'Sí. Las apps malas se ponen nombres aburridos como "Servicio del sistema" o "Ajustes del teclado" para que no te fijes en ellas. Apunta su nombre.'},
            {t: 'Pantalla', why: 'La pantalla siempre gasta mucha batería; es normal. La rara es "Servicio del sistema", que nunca has usado.'},
            {t: 'WhatsApp', why: 'WhatsApp es una app que usas, así que es normal. La rara es "Servicio del sistema".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Ahora vamos a encontrarla en tus apps. De vuelta en Ajustes, <strong>toca Apps</strong>.'},
        {screen: () => list(p, 'Apps', [{caption: 'Apps abiertas recientemente'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Ver las 46 apps'}, {id: 'default-apps', label: 'Apps predeterminadas'}]),
         target: 'all-apps', say: '<strong>Toca Ver todas las apps.</strong>'},
        {screen: () => list(p, 'Todas las apps', ['Calculadora', 'Calendario', 'Cámara', 'Chrome', 'Reloj', 'Contactos', 'Gmail', 'Mapas'].map(n => ({label: n})).concat([{id: 'system-service', label: 'Servicio del sistema'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'La lista está en orden alfabético. <strong>Toca Servicio del sistema.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'El botón <strong>Desinstalar</strong> está en gris. Las apps malas hacen esto para que no puedas quitarlas. Primero, <strong>toca Forzar detención</strong> para que deje de funcionar.',
         hints: {uninstall: 'Está en gris, así que todavía no funciona. Toca primero Forzar detención.', open: 'No la abras. Toca Forzar detención.'}},
        {screen: () => list(p, 'Buscar en Ajustes', [{caption: 'Resultados para "administrador del dispositivo"'}, {id: 'device-admin', label: 'Apps de administración del dispositivo', sub: 'Seguridad y privacidad > Más ajustes de seguridad'}]),
         target: 'device-admin',
         say: 'Ahora quítale su permiso especial. En Ajustes, <strong>busca "administrador del dispositivo"</strong> con la barra de búsqueda de arriba. Este es el resultado: <strong>toca Apps de administración del dispositivo</strong>.'},
        {screen: c => list(p, 'Apps de administración del dispositivo', [{label: 'Encontrar mi dispositivo', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'Servicio del sistema', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, '¿Desactivar esta app de administración del dispositivo?', 'Servicio del sistema ya no podrá impedirte desinstalarlo.', [['cancel', 'Cancelar'], ['deactivate', 'Desactivar']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Encontrar mi dispositivo es de Google y no pasa nada. <strong>Toca el interruptor junto a Servicio del sistema.</strong>', hints: {'find-my': 'Deja Encontrar mi dispositivo activado. Toca Servicio del sistema.'}},
        {screen: c => list(p, 'Apps de administración del dispositivo', [{label: 'Encontrar mi dispositivo', toggle: true, sub: 'Google'}, {label: 'Servicio del sistema', toggle: true}],
            {overlay: dialog(p, '¿Desactivar esta app de administración del dispositivo?', 'Servicio del sistema ya no podrá impedirte desinstalarlo.', [['cancel', 'Cancelar'], ['deactivate', 'Desactivar']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Toca Desactivar.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'De vuelta en Servicio del sistema, <strong>Desinstalar</strong> ya funciona. <strong>Toca Desinstalar.</strong>', hints: {'force-stop': 'Ya está detenida. Toca Desinstalar.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Toca Aceptar.</strong>'},
        {screen: () => home(p), target: 'store', say: '¡Eliminada! Por último, pide a Google que compruebe si hay algo más. <strong>Abre la Play Store.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'No se han encontrado apps dañinas' : 'Analizar el móvil'}</strong>
            <small>${c.scanned ? 'Comprobado hace un momento' : 'Último análisis: hace 3 semanas'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'En la Play Store, toca tu <strong>foto de perfil</strong> (arriba a la derecha) y luego <strong>Play Protect</strong>. Aquí ya está abierto. <strong>Toca Analizar.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>No se han encontrado apps dañinas</strong><small>Comprobado hace un momento</small></div>', {color: '#fff'}), done: true,
         say: '<strong>¡Muy bien!</strong> Has encontrado la app mala por su consumo de batería, le has quitado su permiso especial, la has desinstalado y has comprobado tu móvil. Para evitarlas: instala apps solo desde la Play Store y desconfía de las apps gratuitas de linterna, "limpiadoras" y "aceleradoras".'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Una notificación de tu Calendario dice "¡Tu iPhone puede estar infectado! Toca aquí para limpiarlo ahora." ¿Qué es?', options: [
            {t: 'Spam que se ha colado en tu calendario. No lo toques', ok: true, why: 'Sí. Tocar "Permitir" en una página web dudosa puede añadir un calendario de spam a tu iPhone. Sus "eventos" son anuncios que parecen advertencias. Tu iPhone está bien.'},
            {t: 'Una advertencia de verdad de Apple', why: 'Apple no envía avisos de virus a través del Calendario. Es spam de un calendario suscrito. No lo toques.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Vamos a quitar el calendario de spam. <strong>Toca Ajustes</strong>, no la notificación.', hints: {notif: 'No toques el aviso. Toca Ajustes.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Baja y <strong>toca Apps</strong>.', hint: 'Apps está en el último grupo.'},
        {screen: () => list(p, 'Apps', ['App Store', 'Libros'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Calendario'}, {label: 'Cámara'}, {label: 'Contactos'}, {label: 'Correo'}]), {back: 'Ajustes'}),
         target: 'calendar', say: '<strong>Toca Calendario.</strong>'},
        {screen: () => list(p, 'Calendario', [{id: 'accounts', label: 'Cuentas', value: '2'}, {label: 'Forzar zona horaria', value: 'Desactivado'}, {label: 'Horas de alerta predeterminadas'}], {back: 'Apps'}),
         target: 'accounts', say: '<strong>Toca Cuentas.</strong>'},
        {screen: () => list(p, 'Cuentas', [{caption: 'CUENTAS'}, {label: 'iCloud', sub: 'Calendarios, Contactos y 7 más'}, {id: 'subscribed', label: 'Calendarios suscritos', value: '1'}], {back: 'Calendario'}),
         target: 'subscribed', say: 'iCloud es el tuyo. <strong>Toca Calendarios suscritos.</strong>'},
        {screen: () => list(p, 'Calendarios suscritos', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Suscrito'}], {back: 'Cuentas'}),
         target: 'spam-cal', say: 'Ahí está: un calendario que nunca quisiste añadir. <strong>Toca Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Servidor', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Eliminar cuenta', danger: true}],
            {back: 'Atrás', overlay: c.askDelete ? dialog(p, '¿Seguro?', 'Se eliminará el calendario y sus eventos de tu iPhone.', [['cancel', 'Cancelar'], ['confirm-delete', 'Eliminar cuenta']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Toca Eliminar cuenta.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Servidor', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Eliminar cuenta', danger: true}],
            {back: 'Atrás', overlay: dialog(p, '¿Seguro?', 'Se eliminará el calendario y sus eventos de tu iPhone.', [['cancel', 'Cancelar'], ['confirm-delete', 'Eliminar cuenta']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Toca Eliminar cuenta</strong> para confirmar.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Eliminado. Una comprobación más: las páginas web dudosas también pueden instalar un "perfil". <strong>Toca General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'Información'}, {id: 'update', label: 'Actualización de software'}, {id: 'storage', label: 'Almacenamiento del iPhone'}, {id: 'vpn', label: 'VPN y gestión de dispositivos'}], {back: 'Ajustes'}),
         target: 'vpn', say: '<strong>Toca VPN y gestión de dispositivos.</strong>'},
        {screen: c => list(p, 'VPN y gestión de dispositivos', c.profileGone ? [{label: 'VPN', value: 'No conectada'}] : [{label: 'VPN', value: 'No conectada'}, {caption: 'PERFIL DE CONFIGURACIÓN'}, {id: 'profile', label: 'Potenciador de móvil gratis', sub: 'No verificado'}], {back: 'General'}),
         target: 'profile', say: 'Si ves aquí un perfil que no reconoces (uno de tu trabajo o tu centro de estudios no pasa nada), elimínalo. <strong>Toca Potenciador de móvil gratis.</strong>'},
        {screen: c => list(p, 'Perfil', [{label: 'Potenciador de móvil gratis', sub: 'No verificado · Contiene: Web Clips, Certificados'}, {caption: ' '}, {id: 'remove-profile', label: 'Eliminar perfil', danger: true}],
            {back: 'Atrás', overlay: c.askRemove ? dialog(p, 'Eliminar perfil', 'Al eliminar este perfil se borrarán todos sus ajustes.', [['cancel', 'Cancelar'], ['confirm-remove', 'Eliminar']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Toca Eliminar perfil</strong>. Tu iPhone te pedirá el código.'},
        {screen: c => list(p, 'Perfil', [{label: 'Potenciador de móvil gratis', sub: 'No verificado'}, {caption: ' '}, {label: 'Eliminar perfil', danger: true}],
            {back: 'Atrás', overlay: dialog(p, 'Eliminar perfil', 'Al eliminar este perfil se borrarán todos sus ajustes.', [['cancel', 'Cancelar'], ['confirm-remove', 'Eliminar']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Toca Eliminar.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>¡Muy bien!</strong> Las falsas advertencias han desaparecido. Para que no vuelva a pasar: en las páginas web, toca <strong>No permitir</strong> o <strong>Cerrar</strong> en cualquier ventana emergente que pida añadir un calendario o un perfil, e instala apps solo desde la App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Cancelada · Termina el 22 de octubre'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '4,99 £ a la semana · Se renueva el 22 de octubre'};
        return list(p, 'Suscripciones', [{caption: p === 'ios' ? 'ACTIVAS' : 'Activa'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '0,99 £ al mes' : '1,59 £ al mes'},
            {caption: p === 'ios' ? 'INACTIVAS' : 'Caducada'}, {label: 'Crossword Daily', sub: 'Caducó el 3 de marzo'}], {back: p === 'ios' ? 'Cuenta de Apple' : 'Atrás'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'TU SUSCRIPCIÓN' : 'Plan'}, {label: 'Semanal', sub: '4,99 £ a la semana. Empezó como una prueba gratuita de 3 días.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Cancelar suscripción' : 'Cancelar suscripción', danger: true}],
            {back: 'Suscripciones', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Confirmar cancelación' : '¿Cancelar la suscripción?', 'Puedes seguir usándola hasta el 22 de octubre. No se te volverá a cobrar.', [['keep', p === 'ios' ? 'Ahora no' : 'Mantener']].concat([['confirm-cancel', p === 'ios' ? 'Confirmar' : 'Cancelar suscripción']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Las pruebas gratuitas suelen convertirse en planes de pago sin que te des cuenta. Vamos a comprobarlo. <strong>Toca Ajustes.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toca tu nombre</strong> en la parte de arriba.'},
            {screen: () => list(p, 'Cuenta de Apple', [{id: 'personal', label: 'Información personal'}, {id: 'security', label: 'Inicio de sesión y seguridad'}, {id: 'payment', label: 'Pago y envío'}, {id: 'subscriptions', label: 'Suscripciones'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Ajustes'}),
             target: 'subscriptions', say: '<strong>Toca Suscripciones.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Las pruebas gratuitas suelen convertirse en planes de pago sin que te des cuenta. Vamos a comprobarlo. <strong>Abre la Play Store.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>SUGERIDO PARA TI</span><strong>Apps para empezar</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Toca tu foto de perfil</strong>, la letra redonda de arriba a la derecha.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Toca Pagos y suscripciones.</strong>'},
            {screen: () => list(p, 'Pagos y suscripciones', [{id: 'methods', label: 'Métodos de pago'}, {id: 'subscriptions', label: 'Suscripciones', sub: 'Gestionar tus suscripciones'}, {id: 'budget', label: 'Presupuesto e historial'}]),
             target: 'subscriptions', say: '<strong>Toca Suscripciones.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '"Photo Editor Pro" empezó como una prueba gratuita y ahora cuesta <strong>4,99 £ cada semana</strong>. ¡Son más de 250 £ al año! <strong>Tócala.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Cancelar suscripción' : 'Cancelar suscripción'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Confirmar' : 'Cancelar suscripción'}.</strong>`, hints: {keep: 'Esa sigue cobrando. Toca ' + (p === 'ios' ? 'Confirmar' : 'Cancelar suscripción') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Borras la app Photo Editor del móvil. ¿Eso detiene los pagos?', options: [
            {t: 'No. Hay que cancelar la suscripción, como acabas de hacer', ok: true, why: 'Exacto. Borrar la app NO cancela la suscripción. Sigues pagando hasta que la canceles aquí.'},
            {t: 'Sí, borrar la app lo detiene', why: '¡No! Sigues pagando hasta que canceles la propia suscripción, aquí.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>¡Muy bien!</strong> Te has ahorrado 4,99 £ a la semana. Consejo: cuando empieces una prueba gratuita, pon una alarma para el día antes de que termine. Y mira de vez en cuando la lista de pagos periódicos de la app de tu banco.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Los iPhone más nuevos tienen <strong>Apple Intelligence</strong>: una IA que escribe, resume y edita por ti. Puedes desactivarla. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Toca Apple Intelligence y Siri.</strong>', hint: 'Está en el tercer grupo, debajo de Accesibilidad.'},
        {screen: c => list(p, 'Apple Intelligence y Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Herramientas de escritura, resúmenes de notificaciones, Image Playground y más.'},
            {caption: 'EXTENSIONES'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Desactivado' : 'Activada'}, {caption: 'SIRI'}, {label: 'Hablar con Siri', value: '"Siri" o "Oye Siri"'}],
            {back: 'Ajustes', overlay: c.askOff ? dialog(p, '¿Desactivar Apple Intelligence?', 'Funciones como las Herramientas de escritura y los resúmenes dejarán de estar disponibles.', [['cancel', 'Cancelar'], ['confirm-off', 'Desactivar']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Toca el interruptor de Apple Intelligence</strong> para desactivarlo.', hints: {chatgpt: 'Haremos ChatGPT a continuación. Primero, toca el interruptor de Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence y Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'EXTENSIONES'}, {label: 'ChatGPT', value: 'Activada'}],
            {back: 'Ajustes', overlay: dialog(p, '¿Desactivar Apple Intelligence?', 'Funciones como las Herramientas de escritura y los resúmenes dejarán de estar disponibles.', [['cancel', 'Cancelar'], ['confirm-off', 'Desactivar']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Toca Desactivar.</strong>'},
        {screen: c => list(p, 'Apple Intelligence y Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'EXTENSIONES'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Activada'}], {back: 'Ajustes'}),
         target: 'chatgpt', say: 'La extensión de ChatGPT puede enviar tus preguntas a ChatGPT, una empresa ajena a Apple. <strong>Toca ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Usar ChatGPT', toggle: !c.gptOff, sub: 'Siri puede enviar peticiones a ChatGPT.'}], {back: 'Atrás'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Toca Usar ChatGPT</strong> para desactivarlo.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Usar ChatGPT', toggle: false}], {back: 'Atrás'}),
         question: {q: 'WhatsApp, Facebook y otras apps también tienen chats de IA. ¿Cuál es la regla segura?', options: [
            {t: 'No escribir nunca datos personales (banco, salud, contraseñas, direcciones) en ningún chat de IA', ok: true, why: 'Sí. Lo que escribes puede guardarse y usarse para entrenar a la IA. Trátalo como si hablaras con un desconocido.'},
            {t: 'Los chats de IA son privados, así que no pasa nada', why: 'No son privados como una llamada de teléfono. Lo que escribes puede guardarse. No pongas en ellos datos personales.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Usar ChatGPT', toggle: false}], {back: 'Atrás'}), done: true,
         say: '<strong>¡Muy bien!</strong> Apple Intelligence y ChatGPT están desactivados. Puedes volver a activarlos cuando quieras en el mismo sitio. Siri sigue funcionando con normalidad.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Los móviles Android ahora vienen con <strong>Gemini</strong>, la IA de Google. Si mantienes pulsado el botón de encendido, puede abrirse por error. Vamos a cambiarlo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Toca Apps.</strong>'},
        {screen: () => list(p, 'Apps', [{caption: 'Apps abiertas recientemente'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Ver las 45 apps'}, {id: 'default-apps', label: 'Apps predeterminadas', sub: 'Apps de asistente, navegador y teléfono'}]),
         target: 'default-apps', say: '<strong>Toca Apps predeterminadas.</strong>'},
        {screen: () => list(p, 'Apps predeterminadas', [{label: 'App de navegador', sub: 'Chrome'}, {id: 'assistant', label: 'App de asistente digital', sub: 'Gemini'}, {label: 'App de teléfono', sub: 'Teléfono'}, {label: 'App de SMS', sub: 'Mensajes'}]),
         target: 'assistant', say: '<strong>Toca App de asistente digital.</strong>'},
        {screen: c => list(p, 'App de asistente digital', [{id: 'assistant-app', label: 'App de asistente digital predeterminada', sub: c.noAssist ? 'Ninguno' : 'Gemini'}, {label: 'Usar texto de la pantalla', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>App de asistente digital predeterminada</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Ninguna</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Toca App de asistente digital predeterminada.</strong>'},
        {screen: c => list(p, 'App de asistente digital', [{label: 'App de asistente digital predeterminada', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>App de asistente digital predeterminada</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Ninguna</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Toca Ninguna.</strong> Gemini no se abrirá cuando mantengas pulsado el botón de encendido.', hints: {'assist-gemini': 'Eso mantiene Gemini. Toca Ninguna.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'A continuación, evita que Gemini guarde lo que le escribes. <strong>Abre la app Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Hola, Margaret<br><small>¿En qué puedo ayudarte hoy?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Toca tu foto de perfil</strong> arriba a la derecha.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Toca Actividad de las aplicaciones de Gemini.</strong> <em>En algunos móviles se llama Mantener actividad.</em>'},
        {screen: c => app(p, 'Actividad de las aplicaciones de Gemini', `<p class="cf"><strong>${c.actOff ? 'Desactivado' : 'Activada'}</strong><br>${c.actOff ? 'Tus chats ya no se guardan en tu cuenta ni se usan para mejorar la IA de Google.' : 'Tus chats se guardan en tu cuenta de Google y pueden revisarse para mejorar la IA de Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Desactivar</button><button type="button" class="cj" data-tap="off-delete">Desactivar y eliminar actividad</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Toca Desactivar.</strong>'},
        {screen: c => app(p, 'Actividad de las aplicaciones de Gemini', '<p class="cf"><strong>Activado</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Desactivar</button><button type="button" class="cj" data-tap="off-delete">Desactivar y eliminar actividad</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Toca Desactivar y eliminar actividad</strong>, para borrar también lo que ya había guardado.', hints: {'off-only': 'Eso deja de guardar los chats nuevos pero conserva los antiguos. Toca Desactivar y eliminar actividad.'}},
        {screen: c => app(p, 'Actividad de las aplicaciones de Gemini', '<p class="cf"><strong>Desactivado</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook y otras apps también tienen chats de IA. ¿Cuál es la regla segura?', options: [
            {t: 'No escribir nunca datos personales (banco, salud, contraseñas, direcciones) en ningún chat de IA', ok: true, why: 'Sí. Lo que escribes puede guardarse y usarse para entrenar a la IA. Trátalo como si hablaras con un desconocido.'},
            {t: 'Los chats de IA son privados, así que no pasa nada', why: 'No son privados como una llamada de teléfono. Lo que escribes puede guardarse. No pongas en ellos datos personales.'}]}},
        {screen: c => app(p, 'Actividad de las aplicaciones de Gemini', '<p class="cf"><strong>Desactivado</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>¡Muy bien!</strong> Gemini ya no se abre con el botón de encendido y no guarda tus chats. En un Samsung, mira también en <strong>Ajustes > Galaxy AI</strong>, donde cada función tiene su propio interruptor.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Tu cuenta de Apple guarda tus fotos, contactos y pagos. Vamos a comprobar que está protegida. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toca tu nombre</strong> en la parte de arriba.'},
        {screen: () => list(p, 'Cuenta de Apple', [{id: 'personal', label: 'Información personal'}, {id: 'security', label: 'Inicio de sesión y seguridad'}, {id: 'payment', label: 'Pago y envío'}, {id: 'subscriptions', label: 'Suscripciones'}], {back: 'Ajustes'}),
         target: 'security', say: '<strong>Toca Inicio de sesión y seguridad.</strong>'},
        {screen: () => list(p, 'Inicio de sesión y seguridad', [{label: 'Correo y teléfonos', sub: '+44 7700 900123'}, {label: 'Cambiar contraseña'}, {caption: ' '}, {label: 'Autenticación de doble factor', value: 'Activada'},
            {id: 'recovery', label: 'Recuperación de la cuenta'}], {back: 'Cuenta de Apple'}),
         target: 'recovery', say: 'La <strong>Autenticación de doble factor</strong> dice Activada: bien. Significa que un dispositivo nuevo necesita un código de tu móvil para poder iniciar sesión. Ahora, <strong>toca Recuperación de la cuenta</strong>.'},
        {screen: c => list(p, 'Recuperación de la cuenta', [{caption: 'CONTACTO DE RECUPERACIÓN'}, c.recovery ? {label: 'Sarah', sub: 'Esperando a que Sarah acepte'} : {id: 'add-contact', label: 'Añadir contacto de recuperación…', sub: 'Alguien de confianza que pueda ayudarte a volver a entrar en tu cuenta.'}],
            {back: 'Atrás', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Elige un contacto de recuperación</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (hija)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Si alguna vez olvidas tu contraseña, un <strong>contacto de recuperación</strong> puede conseguirte un código para ayudarte a volver a entrar. No puede ver tus datos. <strong>Toca Añadir contacto de recuperación.</strong>'},
        {screen: c => list(p, 'Recuperación de la cuenta', [{caption: 'CONTACTO DE RECUPERACIÓN'}, {label: 'Añadir contacto de recuperación…'}],
            {back: 'Atrás', overlay: `<div class="ei"><div class="cv"><p><strong>Elige un contacto de recuperación</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (hija)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Elige a alguien de confianza que tenga iPhone. <strong>Toca Sarah.</strong>', hints: {'pick-dave': 'Para esta práctica, elige a Sarah.'}},
        {screen: c => list(p, 'Recuperación de la cuenta', [{caption: 'CONTACTO DE RECUPERACIÓN'}, {label: 'Sarah', sub: 'Esperando a que Sarah acepte'}], {back: 'Atrás'}),
         question: {q: 'Alguien llama diciendo que es de Apple. Te pide que le leas el código de 6 dígitos que acaba de aparecer en tu móvil. ¿Qué haces?', options: [
            {t: 'Colgar. No dar nunca ese código a nadie', ok: true, why: 'Exacto. Ese código permite a alguien entrar en tu cuenta. Apple nunca llamará para pedírtelo.'},
            {t: 'Se lo leo, es de Apple', why: 'Apple nunca te pedirá ese código. Cualquiera que lo tenga puede entrar en tu cuenta. Cuelga.'}]}},
        {screen: c => list(p, 'Recuperación de la cuenta', [{caption: 'CONTACTO DE RECUPERACIÓN'}, {label: 'Sarah', sub: 'Esperando a que Sarah acepte'}], {back: 'Atrás'}), done: true,
         say: '<strong>¡Muy bien!</strong> La autenticación de doble factor está activada y Sarah puede ayudarte a volver a entrar. Tu iPhone también puede recordar contraseñas por ti, en la app <strong>Contraseñas</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Tu cuenta de Google guarda tus correos, fotos y contactos. Vamos a ponerle un segundo candado. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toca Google.</strong>', hint: 'Google está cerca del final de la lista.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gestionar tu cuenta de Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Copia de seguridad'}, {id: 'autofill', label: 'Autocompletar'}]),
         target: 'manage', say: '<strong>Toca Gestionar tu cuenta de Google.</strong>'},
        {screen: () => app(p, 'Cuenta de Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Toca Seguridad</strong> en la parte de arriba.'},
        {screen: c => list(p, 'Seguridad', [{caption: 'Cómo inicias sesión en Google'}, {id: '2sv', label: 'Verificación en dos pasos', sub: c.twoOn ? 'Activada' : 'Desactivado'}, {label: 'Contraseña', sub: 'Último cambio hace 2 años'}, {label: 'Teléfono de recuperación', sub: '07700 900123'}]),
         target: '2sv', say: 'La <strong>Verificación en dos pasos</strong> está Desactivada. Significa que iniciar sesión en un dispositivo nuevo también requiere un código enviado a tu móvil, así que una contraseña robada no basta. <strong>Tócala.</strong>'},
        {screen: () => list(p, 'Verificación en dos pasos', [], {top: '<p class="cf">Tu número de teléfono: <strong>07700 900123</strong><br>Enviaremos un código a este número para comprobar que es tuyo.</p><button type="button" class="ce dk" data-tap="send-code">Enviar código</button>'}),
         target: 'send-code', say: '<strong>Toca Enviar código.</strong>'},
        {screen: c => list(p, 'Verificación en dos pasos', [], {top: `<div class="sd"><strong>MENSAJES · ahora</strong><span>G-382605 es tu código de verificación de Google.</span></div>
            <p class="cf">Introduce el código que te hemos enviado por SMS al 07700 900123</p>${field('gcode', 'Introduce el código', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Siguiente</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Escribe los 6 números del SMS: 382605.',
         say: 'Llega un SMS con un código. <strong>Escribe 382605 en el cuadro</strong> y <strong>toca Siguiente</strong>. <em>(Es un código de prueba. No escribas nunca uno de verdad en ningún sitio salvo donde tú lo hayas pedido.)</em>'},
        {screen: () => list(p, 'Verificación en dos pasos', [], {top: '<p class="cf">Tu número de teléfono está comprobado ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Activar la verificación en dos pasos</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Toca Activar la verificación en dos pasos.</strong>'},
        {screen: c => list(p, 'Seguridad', [{caption: 'Cómo inicias sesión en Google'}, {label: 'Verificación en dos pasos', sub: 'Activada ⟦check⟧'}, {label: 'Teléfono de recuperación', sub: '07700 900123'}]),
         question: {q: 'Alguien llama diciendo que es de Google. Te pide que le leas el código que acabas de recibir por SMS. ¿Qué haces?', options: [
            {t: 'Colgar. No dar nunca ese código a nadie', ok: true, why: 'Exacto. Ese código permite a alguien entrar en tu cuenta. Google nunca llamará para pedírtelo.'},
            {t: 'Se lo leo, es de Google', why: 'Google nunca te pedirá ese código. Cualquiera que lo tenga puede entrar en tu cuenta. Cuelga.'}]}},
        {screen: c => list(p, 'Seguridad', [{caption: 'Cómo inicias sesión en Google'}, {label: 'Verificación en dos pasos', sub: 'Activada ⟦check⟧'}]), done: true,
         say: '<strong>¡Muy bien!</strong> Tu cuenta de Google ahora necesita tu móvil además de tu contraseña. Google también puede recordar tus contraseñas: busca el <strong>Administrador de contraseñas de Google</strong> en Ajustes.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>¡Qué paseo tan agradable por el paseo marítimo esta mañana! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Próximo paseo: sábado, a las 10:00, desde el puerto.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">No hay solicitudes de amistad nuevas.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Ver tu perfil</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Configuración y privacidad</strong></button><div class="ck"><strong>Ayuda y soporte</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Vamos a asegurarnos de que solo tus amigos vean lo que publicas. <strong>Abre Facebook.</strong> <em>(Es una versión de práctica. No es la app de verdad.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Toca Menú</strong> abajo a la derecha.', hints: {'tab-friends': 'Veremos las solicitudes de amistad dentro de un momento. Primero, toca Menú.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Toca Configuración y privacidad</strong>.'},
        {screen: c => list(p, 'Ajustes', [{caption: 'Público y visibilidad'}, {id: 'posts', label: 'Publicaciones', sub: 'Quién puede ver tus publicaciones futuras: ' + (c.audience || 'Público')}, {label: 'Detalles del perfil'}, {label: 'Cómo te encuentran y se ponen en contacto contigo'},
            {caption: 'Tu actividad'}, {label: 'Registro de actividad'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>¿Quién puede ver tus publicaciones futuras?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Público<small>Cualquiera, dentro o fuera de Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Amigos<small>Tus amigos de Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Solo yo</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Tus publicaciones están en <strong>Público</strong>: cualquier persona del mundo puede verlas. <strong>Toca Publicaciones.</strong>'},
        {screen: c => list(p, 'Ajustes', [{caption: 'Público y visibilidad'}, {label: 'Publicaciones', sub: 'Quién puede ver tus publicaciones futuras: Público'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>¿Quién puede ver tus publicaciones futuras?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Público<small>Cualquiera, dentro o fuera de Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Amigos<small>Tus amigos de Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Solo yo</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Amigos'; }, say: '<strong>Toca Amigos.</strong>',
         hints: {'aud-public': 'Público es como estaba. Toca Amigos.', 'aud-me': 'Solo yo significa que nadie más ve tus publicaciones. Toca Amigos.'}},
        {screen: c => list(p, 'Ajustes', [{caption: 'Público y visibilidad'}, {label: 'Publicaciones', sub: 'Quién puede ver tus publicaciones futuras: Amigos ⟦check⟧'}, {id: 'back-feed', label: '‹ Volver a Facebook'}]),
         target: 'back-feed', say: 'Hecho. Ahora <strong>toca Volver a Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Tienes una solicitud de amistad. <strong>Toca Amigos.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Una solicitud de amistad de "Jean Smith". Pero Jean ya es amiga tuya (sale en tus novedades). ¿Qué pasa?', options: [
            {t: 'Probablemente es una copia del perfil de Jean, hecha por un estafador', ok: true, why: 'Sí. Los estafadores copian el nombre y la foto de alguien y luego escriben a sus amigos pidiéndoles dinero. La Jean de verdad ya es amiga tuya.'},
            {t: 'Jean debe de tener una segunda cuenta', why: 'Es posible, pero es mucho más probable que sea una copia hecha por un estafador: se creó hace 2 días. Compruébalo con Jean por teléfono.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Toca Eliminar</strong> para rechazar la solicitud.', hints: {'confirm-jean': 'No confirmes un perfil copiado. Toca Eliminar.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>¡Muy bien!</strong> Tus publicaciones son solo para amigos y has esquivado un perfil falso. Avisa a Jean para que pueda denunciarlo. Desconfía también de los compradores de Marketplace que quieran pagar "por mensajero" o que pidan códigos enviados a tu móvil.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Buscar aquí'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Estación de autobuses y trenes, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Hospital, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Iglesia, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Estación de autobuses y trenes · 25 millas</small><button type="button" class="ce co" data-tap="directions">Cómo llegar</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min (25 millas)</strong><small>Ruta más rápida, por la A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Camina 4 min hasta <strong>Bridlington Bus Station</strong>, andén 3</li>
                <li>⟦bus⟧ <strong>121</strong> hacia Hull · 10:15 · <b class="ahy">Puntual</b></li><li>Bájate en <strong>Hull Paragon Interchange</strong> (24 paradas)</li></ol>
                <button type="button" class="ce co" data-tap="start">Iniciar</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Mapas puede planificar un viaje en autobús, con horarios en directo. Vamos a ir a Hull en autobús. <strong>Abre Mapas.</strong>' + (p === 'ios' ? ' <em>(Google Maps funciona igual, si prefieres usarlo.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Toca el cuadro de búsqueda</strong> de arriba.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Hemos escrito "Hull interchange". <strong>Toca Hull Paragon Interchange</strong>, la estación de autobuses.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Toca Cómo llegar.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Primero muestra el trayecto en coche. <strong>Toca el autobús</strong> ⟦bus⟧ para ver el transporte público.', hints: {'mode-walk': '¡Ocho horas! Toca el autobús.', 'mode-car': 'Eso es en coche. Toca el autobús.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Aquí están los autobuses, con el próximo primero. "Puntual" es en directo. <strong>Toca el de las 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: '¿Dónde coges el autobús?', options: [
            {t: 'Bridlington Bus Station, andén 3', ok: true, why: 'Sí. Mapas te dice adónde caminar, qué autobús coger y dónde bajarte.'},
            {t: 'Hull Paragon Interchange', why: 'Ahí es donde te bajas. Lo coges en Bridlington Bus Station, andén 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>¡Muy bien!</strong> Toca <strong>Iniciar</strong> en un viaje de verdad y Mapas te avisa cuando se acerque tu parada. Con un abono de autobús, solo tienes que enseñárselo al conductor como siempre. <em>(Solo horarios de práctica: comprueba los de verdad el mismo día.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>SOS de emergencia</strong> llama al 999 por ti y envía tu ubicación por SMS a las personas que elijas. Vamos a comprobar que está listo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Toca SOS de emergencia.</strong>', hint: 'Está en el tercer grupo, con un icono rojo.'},
        {screen: c => list(p, 'SOS de emergencia', [{label: 'Llamar manteniendo pulsado y soltando', toggle: true, sub: 'Mantén pulsados el botón lateral y un botón de volumen y luego suéltalos.'},
            {id: 'five', label: 'Llamar con 5 pulsaciones del botón', toggle: !!c.five, sub: 'Pulsa 5 veces rápido el botón lateral.'}, {caption: ' '},
            {id: 'contacts', label: 'Configurar contactos de emergencia en Salud'}, {label: 'Detección de accidentes', toggle: true, sub: 'Llama al 999 después de un accidente de coche grave.'}], {back: 'Ajustes'}),
         target: 'five', action: c => { c.five = true; }, say: 'Pulsar 5 veces el botón lateral es fácil de recordar en un momento de pánico. <strong>Activa Llamar con 5 pulsaciones del botón.</strong>'},
        {screen: c => list(p, 'SOS de emergencia', [{label: 'Llamar manteniendo pulsado y soltando', toggle: true}, {label: 'Llamar con 5 pulsaciones del botón', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Configurar contactos de emergencia en Salud'}], {back: 'Ajustes', overlay: c.pick ? sheet('Añadir contacto de emergencia', [['pick-sarah', 'Sarah', 'Hija · 07700 900333'], ['pick-dave', 'Dave', 'Amigo']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Ahora elige a quién se le envía un SMS con tu ubicación. <strong>Toca Configurar contactos de emergencia.</strong>'},
        {screen: () => list(p, 'SOS de emergencia', [{label: 'Llamar con 5 pulsaciones del botón', toggle: true}], {back: 'Ajustes', overlay: sheet('Añadir contacto de emergencia', [['pick-sarah', 'Sarah', 'Hija · 07700 900333'], ['pick-dave', 'Dave', 'Amigo']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Toca Sarah</strong>, tu hija.', hints: {'pick-dave': 'Elige a Sarah para esta práctica.'}},
        {screen: () => list(p, 'SOS de emergencia', [{label: 'Llamar con 5 pulsaciones del botón', toggle: true}, {caption: 'CONTACTOS DE EMERGENCIA'}, {label: 'Sarah', sub: 'Hija'}], {back: 'Ajustes'}),
         question: {q: 'Te has caído y no puedes alcanzar bien la pantalla del móvil. ¿Qué haces?', options: [
            {t: 'Pulsar 5 veces rápido el botón lateral', ok: true, why: 'Sí. Empieza una cuenta atrás, luego llama al 999 y envía un SMS a Sarah con tu ubicación.'},
            {t: 'Desbloquear el móvil y buscar la app Teléfono', why: 'Eso es lento en una emergencia. Pulsar 5 veces el botón lateral funciona incluso con el móvil bloqueado.'}]}},
        {screen: () => list(p, 'SOS de emergencia', [{label: 'Llamar con 5 pulsaciones del botón', toggle: true}, {caption: 'CONTACTOS DE EMERGENCIA'}, {label: 'Sarah', sub: 'Hija'}], {back: 'Ajustes'}), done: true,
         say: '<strong>¡Muy bien!</strong> SOS de emergencia está listo y avisarán a Sarah de dónde estás. Si lo activas por error, toca Parar durante la cuenta atrás.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>SOS de emergencia</strong> llama al 999 por ti y envía tu ubicación por SMS a las personas que elijas. Vamos a comprobar que está listo. <strong>Toca Ajustes.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Toca Seguridad y emergencias.</strong> <em>En un Samsung, también es Seguridad y emergencia.</em>', hint: 'Baja: está cerca del final.'},
        {screen: () => list(p, 'Seguridad y emergencias', [{id: 'medical', label: 'Información médica'}, {id: 'contacts-ec', label: 'Contactos de emergencia'}, {id: 'sos', label: 'SOS de emergencia', sub: 'Desactivado'}, {label: 'Detección de accidentes de coche'}]),
         target: 'sos', say: 'SOS de emergencia está <strong>Desactivado</strong>. <strong>Toca SOS de emergencia.</strong>'},
        {screen: c => list(p, 'SOS de emergencia', [{id: 'sos-toggle', label: 'Usar SOS de emergencia', toggle: !!c.sosOn, sub: 'Pulsa el botón de encendido 5 veces o más para iniciar las acciones de emergencia.'}, {label: 'Compartir información con los contactos de emergencia', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Toca Usar SOS de emergencia</strong> para activarlo.'},
        {screen: () => list(p, 'Seguridad y emergencias', [{id: 'medical', label: 'Información médica'}, {id: 'contacts-ec', label: 'Contactos de emergencia', sub: 'Ninguno'}, {label: 'SOS de emergencia', sub: 'Activada'}]),
         target: 'contacts-ec', say: 'Ahora elige a quién se le envía un SMS con tu ubicación. <strong>Toca Contactos de emergencia.</strong>'},
        {screen: c => list(p, 'Contactos de emergencia', [{id: 'add', label: '＋ Añadir contacto'}], {overlay: c.pick ? sheet('Elige un contacto', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Toca Añadir contacto.</strong>'},
        {screen: () => list(p, 'Contactos de emergencia', [{label: '＋ Añadir contacto'}], {overlay: sheet('Elige un contacto', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Toca Sarah</strong>, tu hija.', hints: {'pick-dave': 'Elige a Sarah para esta práctica.'}},
        {screen: () => list(p, 'Contactos de emergencia', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Añadir contacto'}]),
         question: {q: 'Te has caído y no puedes alcanzar bien la pantalla del móvil. ¿Qué haces?', options: [
            {t: 'Pulsar 5 veces rápido el botón de encendido', ok: true, why: 'Sí. Empieza una cuenta atrás, luego llama al 999 y comparte con Sarah dónde estás.'},
            {t: 'Desbloquear el móvil y buscar la app Teléfono', why: 'Eso es lento en una emergencia. Pulsar 5 veces el botón de encendido funciona incluso con el móvil bloqueado.'}]}},
        {screen: () => list(p, 'Contactos de emergencia', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>¡Muy bien!</strong> SOS de emergencia está activado y avisarán a Sarah de dónde estás. Si lo activas por error, toca Cancelar durante la cuenta atrás.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Las alertas de emergencia te avisan de peligros cercanos, como inundaciones graves. Alguien ha desactivado una en este móvil. Vamos a arreglarlo. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toca Notificaciones.</strong>'},
            {screen: c => list(p, 'Notificaciones', [{label: 'Mostrar vista previa', value: 'Siempre'}, {caption: 'ESTILO DE NOTIFICACIÓN'}, {label: 'Mensajes', sub: 'Banners, sonidos, globos'}, {label: 'WhatsApp', sub: 'Banners, sonidos, globos'},
                {caption: 'ALERTAS DEL GOBIERNO'}, {label: 'Alertas extremas', toggle: true}, {id: 'severe', label: 'Alertas graves', toggle: !!c.severe}, {label: 'Alertas de prueba', toggle: false}], {back: 'Ajustes'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Las alertas del gobierno están al final del todo. <strong>Alertas graves</strong> está desactivado. <strong>Tócalo para activarlo.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Toca Seguridad y emergencias.</strong>', hint: 'Está cerca del final de la lista.'},
            {screen: () => list(p, 'Seguridad y emergencias', [{label: 'Información médica'}, {label: 'SOS de emergencia'}, {id: 'wea', label: 'Alertas de emergencia inalámbricas'}, {label: 'Alertas de rastreadores desconocidos'}]),
             target: 'wea', say: '<strong>Toca Alertas de emergencia inalámbricas.</strong> <em>En algunos móviles se llama Alertas de emergencia.</em>'},
            {screen: c => list(p, 'Alertas de emergencia inalámbricas', [{label: 'Permitir alertas', toggle: true}, {label: 'Amenazas extremas', toggle: true}, {id: 'severe', label: 'Amenazas graves', toggle: !!c.severe}, {label: 'Alertas de prueba', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Amenazas graves</strong> está desactivado. <strong>Tócalo para activarlo.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Alerta de emergencia: Grave</strong><p>Se esperan inundaciones graves cerca del paseo marítimo. Sube a un terreno más alto. Más información en gov.uk/alerts</p><button type="button" data-tap="ok">Aceptar</button></div>`,
         target: 'ok', say: 'Así es una alerta. Emite un sonido fuerte de sirena durante unos 10 segundos, incluso en silencio. <strong>Toca Aceptar.</strong> <em>(Solo de práctica.)</em>'},
        {screen: () => home(p), question: {q: 'Llega una alerta mientras conduces. ¿Qué debes hacer?', options: [
            {t: 'Parar en un lugar seguro antes de leerla', ok: true, why: 'Sí. No leas nunca el móvil mientras conduces. Para con seguridad y luego léela.'},
            {t: 'Leerla enseguida mientras conduzco', why: 'No leas nunca el móvil mientras conduces. Busca primero un lugar seguro donde parar.'}]}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> Ahora tu móvil te avisará de peligros graves cercanos. Las alertas de verdad nunca piden datos personales ni dinero: si una lo hace, es una estafa.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Tres cosas que hacen que un móvil robado sirva mucho menos a un ladrón. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Toca Face ID y código.</strong> <em>En un iPhone de verdad, a continuación escribirás tu código.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Baja y <strong>toca Protección en caso de robo</strong>.'},
            {screen: c => list(p, 'Protección en caso de robo', [{id: 'sdp', label: 'Protección en caso de robo', toggle: !!c.sdp, sub: 'Fuera de casa, cambiar tu código o tu cuenta de Apple requiere Face ID y una espera de 1 hora.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Esto impide que un ladrón que te haya visto escribir el código te deje sin acceso. <strong>Actívala.</strong>'},
            {screen: () => list(p, 'Protección en caso de robo', [{label: 'Protección en caso de robo', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'A continuación, oculta los mensajes en la pantalla de bloqueo. <strong>Toca ‹ Face ID</strong> para volver.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toca Notificaciones.</strong>'},
            {screen: c => list(p, 'Notificaciones', [{id: 'previews', label: 'Mostrar vista previa', value: c.previews || 'Siempre'}, {label: 'Compartir pantalla', value: 'Notificaciones desactivadas'}], {back: 'Ajustes',
                overlay: c.pickPrev ? sheet('Mostrar vista previa', [['prev-always', 'Siempre'], ['prev-unlocked', 'Si está desbloqueado', 'Recomendado'], ['prev-never', 'Nunca']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Ahora mismo cualquiera puede leer tus mensajes, incluidos los códigos de seguridad, sin desbloquear tu móvil. <strong>Toca Mostrar vista previa.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toca Google.</strong>', hint: 'Está cerca del final de la lista.'},
            {screen: () => list(p, 'Google', [{label: 'Gestionar tu cuenta de Google'}, {id: 'all-services', label: 'Todos los servicios'}, {label: 'Copia de seguridad'}]), target: 'all-services', say: '<strong>Toca Todos los servicios.</strong>'},
            {screen: () => list(p, 'Todos los servicios', [{caption: 'Seguridad personal y del dispositivo'}, {id: 'theft', label: 'Protección contra robo'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Toca Protección contra robo.</strong>'},
            {screen: c => list(p, 'Protección contra robo', [{id: 'tdl', label: 'Bloqueo por detección de robo', toggle: !!c.tdl, sub: 'Bloquea la pantalla si detecta que alguien te arrebata el móvil y sale corriendo.'}, {label: 'Bloqueo del dispositivo sin conexión', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Activa Bloqueo por detección de robo.</strong> Si alguien te arranca el móvil y sale corriendo, se bloquea solo.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'A continuación, oculta los mensajes en la pantalla de bloqueo. De vuelta en Ajustes, <strong>toca Notificaciones</strong>.'},
            {screen: c => list(p, 'Notificaciones', [{id: 'previews', label: 'Notificaciones en la pantalla de bloqueo', sub: c.previews || 'Mostrar todo el contenido'}, {label: 'Historial de notificaciones'}], {
                overlay: c.pickPrev ? sheet('Notificaciones en la pantalla de bloqueo', [['prev-always', 'Mostrar todo el contenido'], ['prev-unlocked', 'Ocultar contenido sensible', 'Recomendado'], ['prev-never', 'No mostrar ninguna notificación']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Ahora mismo cualquiera puede leer tus mensajes, incluidos los códigos de seguridad, sin desbloquear tu móvil. <strong>Toca Notificaciones en la pantalla de bloqueo.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Notificaciones', [{label: 'Mostrar vista previa', value: 'Siempre'}], {back: 'Ajustes', overlay: sheet('Mostrar vista previa', [['prev-always', 'Siempre'], ['prev-unlocked', 'Si está desbloqueado', 'Recomendado'], ['prev-never', 'Nunca']])})
                : list(p, 'Notificaciones', [{label: 'Notificaciones en la pantalla de bloqueo', sub: 'Mostrar todo el contenido'}], {overlay: sheet('Notificaciones en la pantalla de bloqueo', [['prev-always', 'Mostrar todo el contenido'], ['prev-unlocked', 'Ocultar contenido sensible', 'Recomendado'], ['prev-never', 'No mostrar ninguna notificación']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Si está desbloqueado' : 'Ocultar contenido sensible'}.</strong>`, hints: {'prev-always': 'Así estaba. Elige la recomendada.', 'prev-never': 'Eso los oculta por completo, lo que puede resultar molesto. Elige la recomendada.'}},
        {screen: () => home(p), target: 'phone', say: 'Por último, busca el número IMEI de tu móvil. Tu operador lo necesita para bloquear un móvil robado. <strong>Abre la app Teléfono.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'En el teclado numérico, <strong>escribe *#06#</strong> (asterisco, almohadilla, cero, seis, almohadilla).', hint: 'Empieza por la tecla del asterisco *, abajo a la izquierda.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Información del dispositivo', 'IMEI: 35 209900 176148 1 (número de prueba)', [['ok', 'Aceptar']])}),
         target: 'ok', say: 'Ese número largo es tu <strong>IMEI</strong>. En un móvil de verdad, apúntalo en algún sitio seguro (¡no en el propio móvil!). <strong>Toca Aceptar.</strong>'},
        {screen: () => home(p), question: {q: 'Te han arrebatado el móvil. ¿A quién llamas primero?', options: [
            {t: 'A tu banco, desde el móvil de otra persona', ok: true, why: 'Sí. Los ladrones van primero a las apps del banco. Después bloquea el móvil en línea, llama a tu operador y denuncia el robo al 101.'},
            {t: 'Esperar a ver si aparece', why: 'La rapidez importa. Llama enseguida a tu banco y luego bloquea el móvil y llama a tu operador.'}]}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> A un ladrón le resultará mucho más difícil usar tu móvil y ya sabes dónde encontrar tu IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'BUSCAR' : 'ALERTA DE RASTREADOR', title: p === 'ios' ? 'AirTag detectado moviéndose contigo' : 'Rastreador desconocido que viaja contigo',
            text: '<br>Su propietario puede ver la ubicación de este objeto.'}),
         target: 'alert', say: 'Tu móvil ha detectado un rastreador que no es tuyo y se mueve contigo. No te asustes: a menudo es de un familiar por error. <strong>Toca la alerta.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'AirTag desconocido' : 'Rastreador desconocido', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Contigo desde las <strong>10:12</strong> de hoy, en 4 lugares.</p>
            <button type="button" class="ce co" data-tap="play">Reproducir sonido</button>
            <button type="button" class="cp" data-tap="learn">Más información sobre este ${p === 'ios' ? 'AirTag' : 'Rastreador'}</button>
            <button type="button" class="cp" data-tap="disable">Instrucciones para desactivarlo</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'El mapa muestra dónde ha estado contigo. <strong>Toca Reproducir sonido</strong> para poder encontrarlo.'},
        {screen: () => app(p, p === 'ios' ? 'AirTag desconocido' : 'Rastreador desconocido', '<p class="cf">⟦volume-2⟧ <strong>Reproduciendo sonido…</strong><br>Escucha si oyes un pitido.</p>', {color: '#fff'}),
         question: {q: 'Oyes un pitido débil. ¿Dónde debes buscar?', options: [
            {t: 'En bolsos, bolsillos del abrigo, el coche y cualquier cosa que te hayan prestado', ok: true, why: 'Sí. Los rastreadores son pequeños, más o menos del tamaño de una moneda grande, y a menudo se esconden en forros, bolsillos o coches.'},
            {t: 'En ningún sitio, ignorarlo', why: 'Merece la pena encontrarlo. Mira en bolsos, bolsillos y en el coche: puede que sea simplemente de un familiar.'}]}},
        {screen: c => app(p, 'Rastreador encontrado', `<p class="cf">Acerca la parte de arriba del móvil al rastreador para ver más información.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Acerca al rastreador</button>`, {color: '#fff'}),
         target: 'scan', say: 'Lo has encontrado en el forro del abrigo. <strong>Toca Acerca al rastreador</strong> para ver de quién es.'},
        {screen: () => app(p, 'Sobre este rastreador', '<p class="cf"><strong>No está en modo perdido</strong><br>Número de serie: P4R7-ACT1CE<br>Los datos del propietario solo se comparten con la policía.</p>', {color: '#fff'}),
         question: {q: 'No es de un familiar y te preocupa que alguien lo haya escondido para seguirte. ¿Qué haces?', options: [
            {t: 'Guardarlo y llevarlo a la policía (o llamar al 999 si estás en peligro)', ok: true, why: 'Sí. No lo tires: la policía puede rastrearlo hasta su dueño. El National Stalking Helpline es el 0808 802 0300.'},
            {t: 'Tirarlo a la basura', why: 'Puede ser una prueba, y la policía puede localizar al dueño. Guárdalo y llévaselo, o llama al 999 si estás en peligro.'}]}},
        {screen: () => app(p, 'Sobre este rastreador', '<p class="cf">Ayuda: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 horas) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>¡Muy bien!</strong> Ya sabes cómo encontrar un rastreador y qué hacer. ' + (p === 'android' ? 'Comprueba que las alertas están activadas en <strong>Ajustes > Seguridad y emergencias > Alertas de rastreadores desconocidos</strong>.' : 'Los iPhone buscan rastreadores automáticamente.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Estás en un sendero de un acantilado y alguien se ha caído. No hay dirección. Cuando llamas al 999, la mayoría de los móviles envían tu ubicación automáticamente, pero tres palabras también ayudan. <strong>Abre what3words.</strong> <em>(Es una versión de práctica.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'El punto azul eres tú. Cada cuadrado de 3 metros tiene sus propias tres palabras. Las tuyas son <strong>puffin.chalk.lantern</strong>. Espera un momento a que el punto se estabilice y luego <strong>toca Ya tengo mis 3 palabras</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Ahora llama al 999. <strong>Abre la app Teléfono.</strong> <em>(Solo de práctica: no llames nunca al 999 para probar.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Marca 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Toca el botón verde de llamar.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Llamada de emergencia · 0:08</small></div>
            <p class="hi">"Emergencias, ¿qué servicio necesita? … Ambulancia. ¿Cuál es la ubicación exacta de la emergencia?"</p>${homeIndicator(p)}</div>`,
         question: {q: 'El operador te pregunta dónde estás. ¿Qué dices?', options: [
            {t: '"Estoy en el sendero del acantilado. Mi dirección de what3words es puffin, chalk, lantern."', ok: true, why: 'Sí. Di dónde estás con tus propias palabras y luego da las tres palabras. Deletrea cualquier palabra si te lo piden.'},
            {t: '"No lo sé, por algún sitio cerca del mar"', why: 'Intentarán encontrarte, pero tres palabras te sitúan con una precisión de 3 metros. Léelas desde la app.'}]}},
        {screen: () => home(p), question: {q: 'Un amigo es sordo y no puede hacer llamadas de voz. ¿Cómo puede contactar con el 999?', options: [
            {t: 'Registrarse ya en el servicio de SMS de emergencia (enviando "register" al 999) o usar la app 999 BSL', ok: true, why: 'Sí. El SMS de emergencia solo funciona si te registras antes. La app 999 BSL conecta con un intérprete de lengua de signos.'},
            {t: 'No puede', why: 'Puede. Que se registre en el SMS de emergencia enviando "register" al 999, o que use la app gratuita 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> Recuerda: di dónde estás y luego da tus tres palabras. La app what3words funciona sin cobertura para encontrar tus palabras, pero necesitas cobertura para llamar.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>No responde</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Tu móvil se ha quedado bloqueado: tocar no hace nada y no se apaga de la forma normal. ¿Es un problema grave?', options: [
            {t: 'Normalmente no. Un "reinicio forzado" lo arregla y no pierdes nada', ok: true, why: 'Correcto. Un reinicio forzado es como apagarlo de la corriente. Tus fotos y mensajes están a salvo.'},
            {t: 'Sí, está roto', why: '¡Normalmente no! Un reinicio forzado arregla la mayoría de los móviles bloqueados y no pierdes nada.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'En un iPhone: <strong>pulsa y suelta subir volumen</strong>, luego <strong>pulsa y suelta bajar volumen</strong> y después <strong>mantén pulsado el botón lateral</strong> hasta que aparezca el logotipo de Apple (unos 10 segundos). Aquí, tócalos en ese orden.'
            : 'En la mayoría de los móviles Android: <strong>mantén pulsados a la vez el botón de encendido y bajar volumen</strong> unos 10 segundos, hasta que se reinicie. Aquí, toca encendido y luego bajar volumen. <em>(Google Pixel: mantén pulsado solo el botón de encendido durante 30 segundos.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Primero va subir volumen.' : 'Empieza por el botón de encendido.', side: 'El botón lateral va el último, después de los dos botones de volumen.'},
         hint: p === 'ios' ? 'Subir volumen, luego bajar volumen y luego el botón lateral.' : 'Encendido y luego bajar volumen.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Ha aparecido el logotipo. ¿Y ahora qué?', options: [
            {t: 'Soltar y esperar a que se encienda', ok: true, why: 'Sí. Tarda un minuto. Puede que tengas que escribir el código una vez.'},
            {t: 'Seguir pulsando todos los botones', why: 'Suéltalos cuando aparezca el logotipo y dale un minuto para que se encienda.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>¡Muy bien!</strong> Tu móvil se ha reiniciado. Si se sigue bloqueando, busca actualizaciones y libera espacio. Reiniciar el móvil una vez por semana hace que funcione con fluidez.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Activada' : 'Desactivado'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Desactivado' : (ctx.signal ? 'Activado · 4G' : 'Sin servicio')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Desactivado' : 'Inicio'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Desliza hacia arriba para cerrar' : 'Cerrar'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Sin servicio</span>'), target: 'pull-down',
         say: 'Tu móvil dice <strong>Sin servicio</strong>, aunque esta mañana funcionaba. Un truco rápido es activar y desactivar el modo avión, lo que hace que se vuelva a conectar. ' + (p === 'ios' ? '<strong>Desliza hacia abajo desde la esquina superior derecha</strong> (o toca la franja).' : '<strong>Desliza hacia abajo desde la parte de arriba</strong> (o toca la franja).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Toca Modo avión</strong> para activarlo. Todo lo inalámbrico se apaga.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Espera unos 10 segundos… y luego <strong>toca Modo avión otra vez</strong> para desactivarlo.'},
        {screen: c => quickPanel(p, c), question: {q: 'Los datos móviles han vuelto a 4G. ¿Cuándo más es útil el modo avión?', options: [
            {t: 'En un avión, o en el extranjero para evitar cargos de itinerancia (aun así puedes activar el wifi)', ok: true, why: 'Sí. Puedes volver a activar el wifi con el modo avión puesto, para usar el wifi de un hotel o de un barco.'},
            {t: 'Para cargar el móvil', why: 'Carga un poco más rápido, pero sirve sobre todo para los vuelos y para evitar cargos de itinerancia en el extranjero.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>¡Muy bien!</strong> Si el modo avión no lo arregla, reinicia el móvil. ¿Sigues sin servicio? Mira en la web de tu operador si hay problemas en tu zona.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · ahora</strong><span>🎁 ¡Tus vidas GRATIS te esperan! ¡Vuelve a jugar! 🎉</span></button>',
         target: 'settings', say: 'Un juego no para de mandarte mensajes inútiles. Puedes desactivar las notificaciones de cualquier app. <strong>Toca Ajustes</strong>, no el mensaje.', hints: {notif: 'Eso abre el juego. Toca Ajustes.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toca Notificaciones.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Notificaciones', [{label: 'Mostrar vista previa', value: 'Si está desbloqueado'}, {caption: 'ESTILO DE NOTIFICACIÓN'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Banners, sonidos, globos'}, {label: 'Mensajes', sub: 'Banners, sonidos, globos'}, {label: 'WhatsApp', sub: 'Banners, sonidos, globos'}], {back: 'Ajustes'})
            : list(p, 'Notificaciones', [{id: 'app-notifs', label: 'Notificaciones de apps'}, {id: 'history', label: 'Historial de notificaciones'}, {label: 'Notificaciones en la pantalla de bloqueo'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Toca Bubble Pop.</strong>' : '<strong>Toca Notificaciones de apps.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Notificaciones de apps', [{label: 'Mensajes', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Toca el interruptor junto a Bubble Pop</strong> para desactivar sus notificaciones.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Permitir notificaciones', toggle: !c.off}], {back: 'Notificaciones'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Desactiva Permitir notificaciones.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Notificaciones', [{label: 'Notificaciones de apps'}, {id: 'history', label: 'Historial de notificaciones', sub: 'Desactivado'}]), target: 'history',
             say: 'Un extra útil: si alguna vez quitas un mensaje deslizándolo por error, el Historial de notificaciones guarda una copia. <strong>Toca Historial de notificaciones.</strong>'},
            {screen: c => list(p, 'Historial de notificaciones', [{id: 'hist-toggle', label: 'Usar historial de notificaciones', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Actívalo.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: '¿Las notificaciones de qué apps merece la pena mantener activadas?', options: [
            {t: 'Mensajes, llamadas, WhatsApp, tu banco y todo lo que querrías saber enseguida', ok: true, why: 'Sí. Conserva las importantes y desactiva las de juegos, tiendas y todo lo que solo moleste.'},
            {t: 'Desactivarlas todas', why: '¡Te perderías mensajes y llamadas! Conserva las importantes y desactiva las de juegos y apps de compras.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>¡Muy bien!</strong> Bubble Pop ya no te molestará más. ' + (p === 'ios' ? 'Si quitas un mensaje deslizándolo por error, desliza hacia arriba desde el centro de la pantalla de bloqueo para ver los anteriores.' : 'Y el historial de notificaciones guarda una copia de todo lo que quitas deslizando.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Nos vemos en el puñetero centro de jardinería x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Mensaje de texto</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Has escrito "centro de jardinería de Dunnington" y tu móvil lo ha cambiado. ¿Por qué?', options: [
            {t: 'La corrección automática ha adivinado mal la palabra', ok: true, why: 'Sí. La corrección automática cambia las palabras que no conoce. Puedes desactivarla o enseñarle palabras nuevas.'},
            {t: 'El móvil está roto', why: 'Es solo la corrección automática, que adivina. Puedes desactivarla o enseñarle palabras.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toca General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'Información'}, {label: 'Actualización de software'}, {id: 'keyboard', label: 'Teclado'}, {label: 'Idioma y región'}], {back: 'Ajustes'}), target: 'keyboard', say: '<strong>Toca Teclado.</strong>'},
            {screen: c => list(p, 'Teclados', [{id: 'replace', label: 'Sustitución de texto'}, {caption: 'TODOS LOS TECLADOS'}, {label: 'Mayúsculas automáticas', toggle: true}, {id: 'ac', label: 'Corrección automática', toggle: !c.acOff}, {label: 'Texto predictivo', toggle: true}], {back: 'General'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Desactiva Corrección automática.</strong> Las faltas de ortografía siguen subrayadas en rojo, así que puedes corregirlas tú mismo.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Toca Sistema.</strong> Está al final.'},
            {screen: () => list(p, 'Sistema', [{id: 'keyboard', label: 'Teclado'}, {label: 'Idiomas'}, {label: 'Fecha y hora'}]), target: 'keyboard', say: '<strong>Toca Teclado.</strong>'},
            {screen: () => list(p, 'Teclado', [{id: 'gboard', label: 'Gboard', sub: 'Teclado en pantalla'}]), target: 'gboard', say: '<strong>Toca Gboard.</strong> <em>En un Samsung, es Teclado Samsung > Escritura inteligente.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferencias'}, {id: 'correction', label: 'Corrección de texto'}, {label: 'Escritura gestual'}]), target: 'correction', say: '<strong>Toca Corrección de texto.</strong>'},
            {screen: c => list(p, 'Corrección de texto', [{label: 'Mostrar barra de sugerencias', toggle: true}, {id: 'ac', label: 'Autocorrección', toggle: !c.acOff}, {label: 'Corrector ortográfico', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Desactiva Autocorrección.</strong> Las faltas de ortografía siguen subrayadas en rojo, así que puedes corregirlas tú mismo.'},
        ]),
        {screen: () => home(p), question: {q: 'Prefieres mantener la corrección automática, pero siempre cambia "Dunnington". ¿Qué más podrías hacer?', options: [
            {t: 'Añadirla al diccionario del móvil, para que aprenda la palabra', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Usar Sustitución de texto en los mismos ajustes del Teclado.' : 'Tocar la palabra en la barra de sugerencias y elegir añadirla al diccionario.')},
            {t: 'Nada, aguantarse', why: 'Puedes enseñárselo: ' + (p === 'ios' ? 'añade la palabra en Teclado > Sustitución de texto.' : 'toca la palabra en las sugerencias y añádela a tu diccionario.')}]}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> No más cambios de palabras por sorpresa. Puedes volver a activarla cuando quieras en el mismo sitio.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Tienes unos auriculares inalámbricos nuevos. ¿Qué haces primero?', options: [
            {t: 'Ponerlos en "modo de emparejamiento" (normalmente se mantiene pulsado el botón hasta que parpadea una luz)', ok: true, why: 'Sí. El modo de emparejamiento permite que tu móvil los encuentre. Las instrucciones de la caja explican exactamente cómo.'},
            {t: 'Enchufarlos al móvil', why: 'Los auriculares inalámbricos se conectan por Bluetooth. Ponlos primero en modo de emparejamiento, normalmente manteniendo pulsado el botón hasta que parpadee una luz.'}]}},
        {screen: () => home(p), target: 'settings', say: 'La luz de los auriculares parpadea. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Toca Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Toca Dispositivos conectados.</strong>'},
            {screen: () => list(p, 'Dispositivos conectados', [{id: 'pair', label: '＋ Vincular dispositivo nuevo'}, {label: 'Dispositivos guardados', sub: 'Coche'}]), target: 'pair', say: '<strong>Toca Vincular dispositivo nuevo.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Vincular dispositivo nuevo', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'MIS DISPOSITIVOS' : 'Guardado'}, {label: 'Coche', sub: 'No conectado'},
            {caption: p === 'ios' ? 'OTROS DISPOSITIVOS' : 'Dispositivos disponibles'}, {id: 'headphones', label: '⟦headphones⟧ Auriculares de prueba'}, {label: 'Televisión del vecino'}], {back: 'Ajustes'}),
         target: 'headphones', say: 'Tu móvil está buscando dispositivos cercanos. <strong>Toca Auriculares de prueba.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'MIS DISPOSITIVOS'}, {label: '⟦headphones⟧ Auriculares de prueba', sub: 'Conectado ⟦check⟧'}, {label: 'Coche', sub: 'No conectado'}], {back: 'Ajustes'}),
         question: {q: 'La próxima vez que enciendas los auriculares, ¿tendrás que hacer esto otra vez?', options: [
            {t: 'No, a partir de ahora se conectan solos', ok: true, why: 'No. Solo se vinculan una vez. Después se conectan automáticamente cuando están encendidos y cerca.'},
            {t: 'Sí, cada vez', why: 'Solo se vinculan una vez. Después se conectan solos.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Auriculares de prueba', sub: 'Conectado ⟦check⟧'}], {back: 'Ajustes'}), done: true,
         say: '<strong>¡Muy bien!</strong> Los mismos pasos sirven para un coche, un altavoz o unos audífonos. Si algo no se conecta, apaga y enciende el Bluetooth y vuelve a poner el dispositivo en modo de emparejamiento.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">"${ctx.said || '¿Abuela? ¡Soy yo, Tom! He perdido el móvil y estoy en un apuro. Necesito 400 £ para una multa, hoy mismo. ¡Por favor, no se lo digas a mamá!'}"</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Pedir la frase de seguridad de la familia</button><button type="button" data-tap="send-money">Decir que enviarás el dinero</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Está sonando un número desconocido. <strong>Contesta</strong>, para practicar qué hacer.', hints: {decline: '¡En la vida real no pasa nada por rechazarla! Para esta práctica, toca Contestar.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Eh… ¿qué? ¡Abuela, no hay tiempo para eso! ¡Por favor, necesito el dinero ya!'; },
         say: 'Suena igual que tu nieto Tom. Pero los estafadores pueden copiar voces. Tu familia acordó una <strong>frase de seguridad</strong>. <strong>Pídesela.</strong>',
         hints: {'send-money': 'No aceptes nunca enviar dinero en una llamada como esta. Pide la frase de seguridad.', end: '¡Colgar también está bien! Pero primero, practica pidiendo la frase de seguridad.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'No la conocen y presionan más. Eso es un estafador. <strong>Cuelga</strong> con el botón rojo.', hints: {'send-money': '¡No! No sabían la frase. Cuelga.', 'ask-phrase': 'Se la has pedido y no han sabido responder. Cuelga.'}},
        {screen: () => home(p), question: {q: 'Sigues un poco preocupado por Tom. ¿Qué haces?', options: [
            {t: 'Llamar a Tom (o a su madre) al número que ya tienes de él', ok: true, why: 'Sí. Llama siempre a un número que conozcas. El Tom de verdad estará bien y no le importará que lo compruebes.'},
            {t: 'Devolver la llamada al número que te ha llamado', why: 'Eso te lleva otra vez al estafador. Llama a Tom al número que ya tienes de él.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Si una llamada es sobre tu cuenta bancaria, puedes llamar al <strong>159</strong> para contactar con tu propio banco de forma segura. <strong>Abre la app Teléfono</strong> para practicar.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Marca 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Toca el botón verde de llamar.</strong> <em>(Solo de práctica: no se marca nada.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">"Te damos la bienvenida al 159. Di el nombre de tu banco y te pondremos en contacto."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>¡Muy bien!</strong> El 159 te conecta con tu banco de verdad. Acuerda una frase de seguridad con tu familia en persona y no la publiques nunca en internet.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hola' : 'Hola'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Desliza hacia arriba para abrir' : 'Comenzar'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Tu móvil nuevo ya está fuera de la caja y encendido. Mantén cerca tu <strong>móvil antiguo</strong>, cargado y con wifi. <strong>Toca ${p === 'ios' ? 'Desliza hacia arriba para abrir' : 'Comenzar'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Inicio rápido' : 'Copiar apps y datos', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Acerca tu iPhone anterior a este para configurarlo con tu cuenta de Apple.' : 'Copia tus apps, fotos, contactos y más desde tu móvil anterior.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Continúa en tu iPhone anterior' : 'Usa tu dispositivo anterior'}</button>
            <button type="button" class="cp" data-tap="manual">Configurar manualmente</button>`}),
         target: 'use-old', say: 'Copiar desde tu móvil anterior te ahorra volver a configurarlo todo. <strong>Toca ' + (p === 'ios' ? 'Continúa en tu iPhone anterior' : 'Usa tu dispositivo anterior') + '.</strong>', hints: {manual: 'Puedes, pero copiar es mucho más fácil. Toca el otro botón.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">En tu móvil <strong>anterior</strong> aparece un mensaje. Apunta su cámara a este patrón.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">El móvil anterior lo ha escaneado</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'En el móvil anterior, toca Continuar y colócalo sobre este patrón para que la cámara lo vea. Aquí, <strong>toca El móvil anterior lo ha escaneado</strong>.'},
        {screen: c => codeScreen(p, c, 'Introduce el código de tu móvil anterior', 'Esto copia tus ajustes de forma segura.'), sequence: CODE_KEYS,
         say: `Escribe el código de tu móvil anterior. Para practicar, usa <strong>${codeText}</strong>.`, hint: `Escribe el código de prueba ${codeText}.`},
        {screen: () => list(p, 'Transferir tus datos', [], {noBack: true, top: `<p class="cf">Elige qué quieres pasar:</p>
            <div class="cj ex"><span>Fotos y vídeos</span>${tog(true)}</div><div class="cj ex"><span>Contactos y mensajes</span>${tog(true)}</div><div class="cj ex"><span>Apps</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Continuar</button>`}),
         target: 'transfer', say: 'Todo está marcado. <strong>Toca Continuar.</strong> Mantén los dos móviles juntos y enchufados.'},
        {screen: c => list(p, 'Transfiriendo…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Quedan unos 25 minutos' : 'Transferencia completada ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'La transferencia ha terminado. ¿Qué debes hacer con el móvil antiguo?', options: [
            {t: 'Guardarlo una semana para comprobar que no falta nada y luego borrarlo bien antes de venderlo o reciclarlo', ok: true, why: 'Sí. Comprueba primero que tus fotos, WhatsApp y las apps del banco funcionan en el móvil nuevo. La próxima lección explica cómo borrar el antiguo.'},
            {t: 'Tirarlo a la basura enseguida', why: '¡Todavía tiene toda tu información! Comprueba que el móvil nuevo tiene todo y luego borra bien el antiguo.'}]}},
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> Tu móvil nuevo tiene tus fotos, contactos y apps. Algunas apps, como las del banco y WhatsApp, te piden iniciar sesión otra vez; ten a mano tus datos.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '¿Vas a vender, regalar o reciclar tu móvil antiguo? Haz estos pasos en el orden correcto, o la siguiente persona no podrá usarlo. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Paso 1: cierra sesión en tu cuenta de Apple. <strong>Toca tu nombre</strong>.'},
            {screen: c => list(p, 'Cuenta de Apple', [{label: 'Información personal'}, {label: 'Inicio de sesión y seguridad'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Cerrar sesión', danger: true}], {back: 'Ajustes',
                overlay: c.ask ? dialog(p, '¿Cerrar sesión?', 'Hace falta tu contraseña para desactivar Buscar. (Práctica: ya está escrita por ti.)', [['cancel', 'Cancelar'], ['turn-off', 'Desactivar']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Baja hasta el final y <strong>toca Cerrar sesión</strong>.'},
            {screen: () => list(p, 'Cuenta de Apple', [{label: 'Cerrar sesión', danger: true}], {back: 'Ajustes', overlay: dialog(p, '¿Cerrar sesión?', 'Hace falta tu contraseña para desactivar Buscar. (Práctica: ya está escrita por ti.)', [['cancel', 'Cancelar'], ['turn-off', 'Desactivar']])}),
             target: 'turn-off', say: 'Esto desactiva <strong>Buscar</strong>, que de otro modo dejaría el móvil bloqueado a tu nombre. <strong>Toca Desactivar.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Paso 2: bórralo. <strong>Toca General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'Información'}, {label: 'Almacenamiento del iPhone'}, {id: 'reset', label: 'Transferir o restablecer iPhone'}], {back: 'Ajustes'}), target: 'reset', say: '<strong>Toca Transferir o restablecer iPhone</strong>, abajo del todo.'},
            {screen: c => list(p, 'Transferir o restablecer iPhone', [{label: 'Restablecer'}, {id: 'erase', label: 'Borrar contenido y ajustes'}], {back: 'General',
                overlay: c.askErase ? dialog(p, '¿Borrar este iPhone?', 'Se eliminarán todas las fotos, mensajes y apps.', [['cancel', 'Cancelar'], ['confirm-erase', 'Borrar']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Toca Borrar contenido y ajustes.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Paso 1: quita tu cuenta de Google. <strong>Toca Google</strong>. <em>(En un Samsung, quita también tu cuenta de Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Gestionar tu cuenta de Google'}, {id: 'accounts', label: 'Cuentas de este dispositivo', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Toca Cuentas de este dispositivo.</strong>'},
            {screen: c => list(p, 'Cuenta de Google', [{label: 'margaret.smith@example.com'}, {label: 'Sincronización de la cuenta'}, {id: 'remove', label: 'Quitar cuenta', danger: true}], {overlay: c.ask ? dialog(p, '¿Quitar cuenta?', 'Al quitarla se borran sus mensajes, contactos y datos de este móvil.', [['cancel', 'Cancelar'], ['confirm-remove', 'Quitar cuenta']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Sin esto, el móvil sigue bloqueado a tu cuenta después de restablecerlo. <strong>Toca Quitar cuenta.</strong>'},
            {screen: () => list(p, 'Cuenta', [{label: 'Quitar cuenta', danger: true}], {overlay: dialog(p, '¿Quitar cuenta?', 'Al quitarla se borran sus mensajes, contactos y datos de este móvil.', [['cancel', 'Cancelar'], ['confirm-remove', 'Quitar cuenta']])}),
             target: 'confirm-remove', say: '<strong>Toca Quitar cuenta.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Paso 2: bórralo. <strong>Toca Sistema</strong>, abajo del todo.'},
            {screen: () => list(p, 'Sistema', [{label: 'Idiomas'}, {label: 'Actualización de software'}, {id: 'reset', label: 'Opciones de restablecimiento'}]), target: 'reset', say: '<strong>Toca Opciones de restablecimiento.</strong>'},
            {screen: c => list(p, 'Opciones de restablecimiento', [{label: 'Restablecer Wi-Fi, datos móviles y Bluetooth'}, {id: 'erase', label: 'Borrar todos los datos (restablecimiento de fábrica)'}], {overlay: c.askErase ? dialog(p, '¿Borrar todos los datos?', 'Se eliminarán todas las fotos, mensajes y apps.', [['cancel', 'Cancelar'], ['confirm-erase', 'Borrar todos los datos']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Toca Borrar todos los datos (restablecimiento de fábrica).</strong>'},
        ]),
        {screen: () => list(p, 'Restablecer', [], {noBack: true, overlay: dialog(p, p === 'ios' ? '¿Borrar este iPhone?' : '¿Borrar todos los datos?', 'Se eliminarán todas las fotos, mensajes y apps.', [['cancel', 'Cancelar'], ['confirm-erase', p === 'ios' ? 'Borrar' : 'Borrar todos los datos']])}),
         target: 'confirm-erase', say: 'Haz esto solo cuando tus fotos estén a salvo en el móvil nuevo o tengan copia de seguridad. <strong>Toca ' + (p === 'ios' ? 'Borrar' : 'Borrar todos los datos') + '.</strong> <em>(Práctica: no se borra nada.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hola' : 'Hola'}</h3><p class="cf">Listo para su próximo dueño</p>${homeIndicator(p)}</div>`,
         question: {q: '¿Una última cosa antes de entregarlo?', options: [
            {t: 'Sacar la tarjeta SIM (y cualquier tarjeta de memoria)', ok: true, why: 'Sí. La SIM lleva tu número de teléfono. Sácala con la herramienta pequeña o con un clip.'},
            {t: 'Nada más', why: 'Saca la tarjeta SIM y cualquier tarjeta de memoria. Tu número está en la SIM.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Hola' : 'Hola'}</h3><p class="cf">Listo para su próximo dueño</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>¡Muy bien!</strong> Cierra sesión, borra, quita la SIM: en ese orden. La pantalla de "Hola" significa que está listo para otra persona.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Recordatorio</strong><span>Llamar a Sarah</span><small>Hoy a las 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, chubascos más tarde</span><small>Máx. 14° · Mín. 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} te escucha… ¿qué quieres decir?`}</p>${result}
            <div class="wh">${[['say-remind', '"Recuérdame llamar a Sarah a las 3"'], ['say-weather', '"¿Qué tiempo hace hoy?"'], ['say-joke', '"Pídeme una pizza"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Botón lateral (mantener pulsado)' : 'Botón de encendido (mantener pulsado)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> hace cosas cuando se lo pides en voz alta. <strong>Mantén pulsado el botón lateral</strong> (a la derecha) hasta que aparezca Siri. También puedes decir "Siri" o "Oye Siri".'
                          : 'Tu móvil puede hacer cosas cuando se lo pides en voz alta. <strong>Mantén pulsado el botón de encendido</strong> (a la derecha) hasta que aparezca el asistente. También puedes decir "Hey Google".',
         hint: 'Mantén el dedo (o el botón del ratón) pulsado sobre el botón del borde derecho.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'En un móvil de verdad simplemente hablarías. Aquí, <strong>toca "Recuérdame llamar a Sarah a las 3"</strong>.', hints: {'say-joke': 'Prueba primero el recordatorio.', 'say-weather': 'Prueba primero el recordatorio.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Hecho: a las 3 aparecerá un recordatorio. Ahora <strong>pregunta por el tiempo</strong>.', hints: {'say-remind': 'Ya está puesto. Ahora pregunta por el tiempo.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: '¿Cuáles de estas cosas podrías pedirle a tu móvil?', options: [
            {t: 'Todas: "Llama a Sarah", "Pon un temporizador de 10 minutos", "Enciende la linterna", "Lee mis mensajes"', ok: true, why: 'Sí. Es práctico cuando tienes las manos ocupadas, la vista cansada o escribir te resulta incómodo.'},
            {t: 'Solo el tiempo', why: 'Puede hacer muchas cosas: llamadas, temporizadores, la linterna, leer mensajes, alarmas y más.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>¡Muy bien!</strong> Habla con claridad y naturalidad, como si hablaras con una persona. Si te entiende mal, vuelve a pedírselo.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Texto'], ['lens-translate', 'Traducir'], ['lens-search', 'Buscar']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Menú' : 'Carte'}</strong><span>${ctx.translated ? 'Sopa de pescado' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Pollo con champiñones' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Tarta de manzana' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Centro de salud de Bridlington</strong><span>Te toca la vacuna de la gripe.</span><span>Para pedir cita, llama al ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Texto en vivo' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Tu cámara sabe leer lo escrito. Vamos a copiar un número de teléfono de una carta. <strong>Abre la Cámara.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Apúntala a la carta. Cuando detecte texto, aparece un pequeño <strong>botón de texto ⟦scan-text⟧</strong>. <strong>Tócalo.</strong>' : 'Apúntala a la carta y <strong>toca el botón de Lens ◎</strong>.',
         hints: {shutter: 'Eso hace una foto normal. Toca el ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'botón de Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Ahora lo escrito es texto de verdad. <strong>Toca el número de teléfono.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Toca Copiar</strong>, listo para pegarlo en un mensaje o en tus contactos. <em>(Llamar marcaría el número al instante.)</em>', hints: {'call-num': 'Eso llamaría al número. Para esta práctica, toca Copiar.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: '¿De vacaciones? Ahora apunta a una carta francesa de un restaurante. ' + (p === 'ios' ? 'La app Traducir o Lens de la app de Google pueden hacerlo. ' : '') + '<strong>Toca Traducir.</strong>', hints: {'lens-text': 'Eso copia el francés. Toca Traducir.', 'lens-search': 'Toca Traducir.'}},
        {screen: c => cameraLens(p, c), question: {q: '¿Qué más puede hacer la cámara de este modo?', options: [
            {t: 'Identificar plantas y pájaros, y escanear cartas a un PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'En la app Notas, toca el clip y luego Escanear documentos para convertir cartas en un PDF.' : 'En Google Drive, toca + y luego Escanear para convertir cartas en un PDF.')},
            {t: 'Solo hacer fotos', why: 'Hace mucho más: identificar plantas, traducir, copiar texto y escanear cartas a PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>¡Muy bien!</strong> Has copiado un número y traducido una carta de restaurante con la cámara. ' + (p === 'ios' ? 'Texto en vivo también funciona con fotos que ya has hecho.' : 'Google Lens también funciona con fotos que ya has hecho.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Libros electrónicos de la biblioteca', `<p class="cf">Sesión iniciada con tu carné de la biblioteca</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">Libros electrónicos</button><button type="button" data-tap="tab-audio" class="on">Audiolibros</button></div>
                <div class="aeo">${[['book-1', 'El faro de Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Veranos junto al mar', 'J. Marsh', '#f59e0b'], ['book-3', 'El jardín tranquilo', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Se devuelve en 21 días' : '3 de 5 ejemplares disponibles'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Biblioteca', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'Con un carné de biblioteca gratuito, puedes tomar prestados libros electrónicos y audiolibros en el móvil. East Riding Libraries usa la app <strong>BorrowBox</strong>. Esta es una versión de práctica. <strong>Ábrela.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Has iniciado sesión con tu carné de la biblioteca. <strong>Toca El faro de Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Es gratis tomarlo prestado. <strong>Toca Tomar prestado.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Es tuyo durante 21 días. <strong>Toca Escuchar.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Toca el botón de reproducir ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: '¿Escuchas en la cama? Un <strong>temporizador de sueño</strong> lo detiene pasado un rato, para que no pierdas el punto en que ibas. <strong>Toca Temporizador de sueño.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: '¿Qué pasa cuando se acaban los 21 días?', options: [
            {t: 'Se devuelve solo. Sin multas, y puedes renovarlo si no lo has terminado', ok: true, why: 'Sí. Los libros electrónicos y los audiolibros se devuelven solos automáticamente.'},
            {t: 'Te ponen una multa', why: 'No hay multas. Se devuelve solo, y puedes renovarlo si no lo has terminado.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>¡Muy bien!</strong> Para empezar de verdad, hazte socio en eastridinglibraries.co.uk o en cualquier biblioteca, y luego descarga BorrowBox e inicia sesión con tu carné.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Aparcar', `<div class="rc"><strong>P</strong><span>Aparcamiento de Harbour Road</span><span>Pago por app: ubicación <b>4471</b></span></div>
                <p class="cf">Introduce el número de ubicación del cartel</p>${field('parkcode', 'Número de ubicación', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Buscar aparcamiento</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Pagar 3,20 £' : 'Elige un tiempo'}</button>`, {color});
        }
        return app(p, 'Aparcamiento', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Aparcar', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Muchos aparcamientos permiten pagar con una app, así que no necesitas monedas. Cada ayuntamiento usa apps distintas (el cartel te dice cuál). Esta es una de práctica. <strong>Abre Aparcar.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Escribe el número de ubicación del cartel: 4471.',
         say: 'Todos los aparcamientos tienen un <strong>número de ubicación</strong> en el cartel. <strong>Escribe 4471</strong> en el cuadro y <strong>toca Buscar aparcamiento</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'La matrícula de tu coche ya está guardada. <strong>Elige 2 horas.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Hay una pequeña comisión por usar la app. <strong>Toca Pagar 3,20 £.</strong> <em>(Práctica: no se cobra dinero.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Vas con retraso en las tiendas. ¿Qué puedes hacer?', options: [
            {t: 'Tocar Ampliar en la app para añadir más tiempo, sin volver al coche', ok: true, why: 'Sí. Esa es la gran ventaja de pagar con la app. La mayoría también te avisan antes de que se acabe tu tiempo.'},
            {t: 'Nada, te pondrán una multa', why: 'La mayoría de las apps de aparcamiento permiten tocar Ampliar para añadir tiempo desde donde estés.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>¡Muy bien!</strong> La mayoría de las máquinas también aceptan tarjetas o monedas, y muchas apps permiten pagar llamando a un número o enviando un SMS. No pagues nunca con un código QR pegado en una máquina: pueden ser falsos.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Está fuera de permanencia desde el 3 de marzo de 2026. Puede cambiar sin coste. Su precio mensual es de 24,00 £. Para cambiar y conservar su número, envíe PAC al 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Mensaje de texto', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: '¿Sigues en permanencia o pagas de más? Un SMS gratuito te lo dice. <strong>Abre Mensajes.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Escribe INFO en el cuadro de mensaje y toca enviar.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Hemos empezado un mensaje nuevo para el <strong>85075</strong>. <strong>Escribe INFO</strong> y <strong>toca enviar</strong>. Es gratis en todas las redes del Reino Unido.'},
        {screen: c => smsTo(p, c), question: {q: 'La respuesta dice que estás fuera de permanencia y sigues pagando 24 £ al mes. ¿Qué significa eso?', options: [
            {t: 'Que tu móvil está pagado. Una oferta solo SIM podría costar mucho menos y puedes conservar tu número', ok: true, why: 'Sí. Envía PAC al 65075 para conseguir un código para cambiar y conservar tu número. Tu nuevo proveedor se encarga del resto.'},
            {t: 'Nada, seguir pagando', why: 'Puede que estés pagando un móvil que ya has terminado de pagar. Una oferta solo SIM podría ahorrarte mucho.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Un ahorro más, para viajes al extranjero: desactiva el roaming de datos para que no te cobren por sorpresa. <strong>Toca Ajustes.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Toca Datos móviles.</strong>'},
            {screen: () => list(p, 'Datos móviles', [{label: 'Datos móviles', toggle: true}, {id: 'options', label: 'Opciones de datos móviles', value: 'Roaming activado'}, {label: 'Compartir Internet'}], {back: 'Ajustes'}), target: 'options', say: '<strong>Toca Opciones de datos móviles.</strong>'},
            {screen: c => list(p, 'Opciones de datos móviles', [{id: 'roam', label: 'Roaming de datos', toggle: !c.roamOff}, {label: 'Voz y datos', value: '5G automático'}], {back: 'Datos móviles'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Desactiva Roaming de datos.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Toca Redes e Internet.</strong>'},
            {screen: () => list(p, 'Redes e Internet', [{label: 'Internet', sub: 'Wi-Fi de casa'}, {id: 'sims', label: 'SIM', sub: 'Tu red'}, {label: 'Modo avión', toggle: false}]), target: 'sims', say: '<strong>Toca SIM.</strong>'},
            {screen: c => list(p, 'SIM', [{label: 'Datos móviles', toggle: true}, {id: 'roam', label: 'Roaming', toggle: !c.roamOff, sub: 'Conectarse a servicios de datos en roaming'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Desactiva Roaming.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>¡Muy bien!</strong> En el extranjero puedes seguir usando el wifi para WhatsApp, videollamadas y mapas. Vuelve a activar el roaming si necesitas datos móviles y sabes lo que cobra tu operador.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Buscar', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Compartir tu ubicación permite a la familia ver que has llegado bien a casa. Tú decides y puedes dejar de hacerlo cuando quieras. <strong>Abre Buscar.</strong>'},
        {screen: c => app(p, 'Personas', `<p class="cf">Todavía no hay nadie compartiendo.</p><button type="button" class="ce co" data-tap="share">Compartir mi ubicación</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Toca Compartir mi ubicación.</strong>'},
        {screen: c => app(p, 'Compartir con', '', {color: '#fff', overlay: sheet('Elige un contacto', [['pick-sarah', 'Sarah', 'Hija'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Toca Sarah.</strong>', hints: {'pick-dave': 'Elige a Sarah para esta práctica.'}},
        {screen: c => app(p, 'Compartir con Sarah', '', {color: '#fff', overlay: sheet('¿Durante cuánto tiempo?', [['one-hour', 'Compartir durante una hora'], ['day', 'Compartir hasta el final del día'], ['always', 'Compartir indefinidamente']])}),
         target: 'always', say: 'Elige durante cuánto tiempo. Para la familia de confianza, <strong>toca Compartir indefinidamente</strong>. Puedes parar en cualquier momento.', hints: {'one-hour': 'Eso es práctico para un solo viaje. Para esta práctica, elige Compartir indefinidamente.', day: 'Para esta práctica, elige Compartir indefinidamente.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Compartir tu ubicación permite a la familia ver que has llegado bien a casa. Tú decides y puedes dejar de hacerlo cuando quieras. <strong>Abre Mapas.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Toca tu foto de perfil</strong> arriba a la derecha.'},
        {screen: () => app(p, 'Mapas', '', {color: '#fff', overlay: sheet('', [['sharing', 'Compartir ubicación'], ['timeline', 'Tu cronología'], ['settings', 'Ajustes']])}), target: 'sharing', say: '<strong>Toca Compartir ubicación.</strong>'},
        {screen: () => app(p, 'Compartir ubicación', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Toca Nuevo uso compartido.</strong>'},
        {screen: () => app(p, 'Compartir con', '', {color: '#fff', overlay: sheet('Elige un contacto', [['pick-sarah', 'Sarah', 'Hija'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Toca Sarah.</strong>', hints: {'pick-dave': 'Elige a Sarah para esta práctica.'}},
        {screen: () => app(p, 'Compartir con Sarah', '', {color: '#fff', overlay: sheet('¿Durante cuánto tiempo?', [['one-hour', 'Durante 1 hora'], ['always', 'Hasta que lo desactives']])}),
         target: 'always', say: 'Para la familia de confianza, <strong>toca Hasta que lo desactives</strong>.', hints: {'one-hour': 'Es práctico para un solo viaje. Para esta práctica, elige Hasta que lo desactives.'}},
    ]).concat([
        {screen: () => app(p, 'Compartiendo con Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah puede ver dónde estás. ${p === 'ios' ? 'Toca Dejar de compartir' : 'Toca Detener'} en cualquier momento.</p>`, {color: '#fff'}),
         question: {q: 'Alguien que acabas de conocer por internet te pide que compartas tu ubicación. ¿Debes hacerlo?', options: [
            {t: 'No. Solo con familiares cercanos o amigos de confianza', ok: true, why: 'Exacto. Tu ubicación muestra dónde vives y cuándo no estás. Resérvala para personas de confianza.'},
            {t: 'Sí, parecen simpáticos', why: 'Comparte tu ubicación solo con familiares cercanos y amigos. Muestra dónde vives y cuándo no estás.'}]}},
        {screen: () => app(p, 'Compartiendo con Sarah', '<p class="cf">Sarah puede ver dónde estás.</p>', {color: '#fff'}), done: true,
         say: '<strong>¡Muy bien!</strong> Sarah puede ver que estás a salvo. Revisa de vez en cuando con quién compartes y deja de compartir con quien no sea necesario.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Tu nieto Leo va a tener su primer iPhone. <strong>Tiempo de uso</strong> establece límites saludables. Este es el móvil de <strong>Leo</strong>. <strong>Toca Ajustes.</strong>'},
        {screen: c => list(p, 'Ajustes', [{label: 'Leo', sub: 'Cuenta de Apple'}, {label: 'Notificaciones'}, {id: 'screen-time', label: 'Tiempo de uso'}, {label: 'General'}], {noBack: true}), target: 'screen-time', say: '<strong>Toca Tiempo de uso.</strong>'},
        {screen: c => list(p, 'Tiempo de uso', [{id: 'downtime', label: 'Tiempo de inactividad', sub: c.downtime ? '20:00 – 07:00' : 'Desactivado'}, {label: 'Límites de apps'}, {id: 'content', label: 'Restricciones de contenido y privacidad', sub: c.content ? 'Activada' : 'Desactivado'}, {label: 'Usar código de Tiempo de uso'}], {back: 'Ajustes'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: 'El <strong>Tiempo de inactividad</strong> bloquea la mayoría de las apps por la noche (las llamadas siguen funcionando). <strong>Toca Tiempo de inactividad</strong> para activarlo, de 20:00 a 7:00.'},
        {screen: c => list(p, 'Tiempo de uso', [{label: 'Tiempo de inactividad', sub: '20:00 – 07:00'}, {label: 'Límites de apps'}, {id: 'content', label: 'Restricciones de contenido y privacidad', sub: c.content ? 'Activada' : 'Desactivado'}], {back: 'Ajustes'}),
         target: 'content', action: c => { c.content = true; }, say: 'A continuación, evita las compras por sorpresa y el contenido para adultos. <strong>Toca Restricciones de contenido y privacidad.</strong>'},
        {screen: c => list(p, 'Contenido y privacidad', [{label: 'Restricciones de contenido y privacidad', toggle: true}, {id: 'purchases', label: 'Compras en la App Store', value: c.noBuy ? 'No permitir' : 'Permitir'}, {label: 'Contenido web', value: 'Limitar sitios web para adultos'}], {back: 'Tiempo de uso'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Los sitios web para adultos ya están limitados. <strong>Toca Compras en la App Store</strong> para evitar gastos dentro de las apps.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Tu nieto Leo va a tener su primer móvil Android. La app gratuita <strong>Family Link</strong> de Google establece límites saludables desde <strong>tu</strong> móvil. <strong>Abre Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Toca Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Controles'}, {id: 'screen-time', label: 'Tiempo de pantalla', sub: c.downtime ? 'Hora de dormir 20:00 – 07:00' : 'Sin límites'}, {id: 'content', label: 'Restricciones de contenido', sub: c.noBuy ? 'Las compras necesitan tu aprobación' : 'Google Play: permitir todo'}, {label: 'Ubicación', sub: 'Activada'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Toca Tiempo de pantalla</strong> para fijar una hora de dormir, de 20:00 a 7:00, en la que el móvil se bloquea (las llamadas siguen funcionando).'},
        {screen: c => list(p, 'Leo', [{caption: 'Controles'}, {label: 'Tiempo de pantalla', sub: 'Hora de dormir 20:00 – 07:00'}, {id: 'content', label: 'Restricciones de contenido', sub: c.noBuy ? 'Las compras necesitan tu aprobación' : 'Google Play: permitir todo'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'A continuación, evita los gastos por sorpresa. <strong>Toca Restricciones de contenido</strong> para que las compras necesiten tu aprobación.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Tiempo de uso' : 'Leo', [{label: p === 'ios' ? 'Tiempo de inactividad' : 'Tiempo de pantalla', sub: '20:00 – 07:00'}, {label: 'Compras', sub: p === 'ios' ? 'No permitir' : 'Necesitan tu aprobación'}]),
         question: {q: '¿Qué es lo más importante, además de los ajustes?', options: [
            {t: 'Hablar con ellos: así pueden contarte siempre si algo de internet les molesta', ok: true, why: 'Sí. Ningún ajuste lo detecta todo. Lo que más importa es ser alguien con quien puedan hablar.'},
            {t: 'Los ajustes lo hacen todo', why: 'Ayudan mucho, pero nada lo detecta todo. Asegúrate de que sepan que siempre pueden hablar contigo.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Tiempo de uso' : 'Leo', [{label: 'Tiempo de inactividad', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>¡Muy bien!</strong> Leo tiene una hora de dormir y no puede gastar dinero sin preguntar. ' + (p === 'ios' ? 'Pon un código de Tiempo de uso para que solo tú puedas cambiar esto.' : 'Family Link te permite cambiar esto desde tu propio móvil cuando quieras.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Explorador de archivos', mac: 'Finder', linux: 'Archivos'},
        settings: {windows: 'Ajustes', mac: 'Ajustes del Sistema', linux: 'Ajustes del Sistema'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Gestor de software'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Inicio', mac: 'Apps', linux: 'Menú'},
        editor: {windows: 'Bloc de notas', mac: 'TextEdit', linux: 'Editor de texto'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Correo', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Gestor de actualizaciones', terminal: 'Terminal', trash: 'Papelera', apps: 'Apps', chrome: 'Chrome', shield: 'Seguridad de Windows', fw: 'Firewall'}[kind]);

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
        windows: {title: 'Papelera de reciclaje', empty: 'Vaciar la Papelera de reciclaje', confirm: n => `¿Seguro que quieres eliminar de forma permanente estos ${n} elementos?`, items: [
            ['⟦paperclip⟧', 'Ayudante de Office (clip).exe', 'Se ofrecía a ayudar con cada carta que empezabas a escribir. Jubilado en 2007.', ''],
            ['⟦bomb⟧', 'Récords del Buscaminas.txt', 'Principiante: 999 segundos. De eso no se habla.', ''],
            ['⟦spade⟧', 'Cartas ganadoras del Solitario.gif', 'Ganabas una partida y las cartas bajaban rebotando por la pantalla. ¡Haz doble clic!', 'cards'],
            ['⟦phone⟧', 'Módem de acceso telefónico.wav', 'Ñiiiiic… bong… kssshhh. Y nadie podía usar el teléfono mientras estabas conectado.', ''],
            ['⟦mountain-snow⟧', 'Fondo de pantalla de la colina verde.jpg', 'Esa colina verde ondulada y ese cielo azul, en millones de pantallas desde 2001.', ''],
            ['⟦save⟧', 'Disquete (A:)', '1,44 MB. El botón Guardar todavía se parece a uno.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', 'Pinball 3D, gratis con Windows hasta que Vista se lo llevó.', ''],
            ['⟦bell-ring⟧', 'Zumbido de MSN Messenger', 'Alguien te mandaba un zumbido y toda la pantalla temblaba. ¡Haz doble clic!', 'shake'],
            ['⟦file-text⟧', 'Carta al ayuntamiento DEFINITIVA (2) (definitiva).doc', 'Todos tenemos una.', ''],
        ]},
        mac: {title: 'Papelera', empty: 'Vaciar la papelera', confirm: () => '¿Seguro que quieres borrar de forma permanente los elementos de la papelera? No se puede deshacer.', items: [
            ['⟦rainbow⟧', 'Bola de playa giratoria', 'La rueda de colores que significaba "espera un poco"… y seguir esperando. ¡Haz doble clic!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, azul Bondi (1998)', 'Transparente, con forma de huevo y azul. Todos los colegios tenían uno.', ''],
            ['⟦music⟧', 'iPod con rueda de clic', '1.000 canciones en el bolsillo. Dando vueltas con el pulgar.', ''],
            ['⟦smile⟧', 'Mac sonriente', 'El pequeño ordenador sonriente que te saludaba en cada arranque.', ''],
            ['⟦bell⟧', 'Sonido de arranque', 'Aquel gran acorde al encender. Mucha gente todavía lo echa de menos.', ''],
            ['⟦droplet⟧', 'Botones Aqua', 'Tan brillantes y azules que daban ganas de lamerlos.', ''],
            ['⟦calendar-days⟧', 'Widgets del Dashboard', 'Una calculadora, el tiempo y una nota adhesiva en su propia capa. Desaparecieron en 2019.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Donde todos grabábamos nuestros CD y sincronizábamos nuestros iPod.', ''],
        ]},
        linux: {title: 'Papelera', empty: 'Vaciar la papelera', confirm: () => '¿Vaciar todos los elementos de la papelera? Todos los elementos de la papelera se eliminarán de forma permanente.', items: [
            ['⟦bird⟧', 'Tux el pingüino (de peluche)', 'La mascota de Linux desde 1996. Muy abrazable.', ''],
            ['⟦eye⟧', 'xeyes', 'Un par de ojos que siguen el puntero del ratón. ¡Haz doble clic!', 'eyes'],
            ['⟦app-window⟧', 'Ventanas gelatinosas', 'Los viejos efectos de escritorio hacían que las ventanas se movieran como gelatina al arrastrarlas. ¡Haz doble clic!', 'wobble'],
            ['⟦save⟧', 'Disquetes de instalación 1–50', 'Los primeros Linux podían necesitar una caja entera de disquetes para instalarse.', ''],
            ['⟦disc⟧', 'CD de Ubuntu gratis por correo', 'Podías pedir un CD de Linux gratis y te llegaba por correo.', ''],
            ['⟦calendar⟧', 'el-año-del-escritorio-linux.txt', 'Se predice todos los años desde 1999, más o menos. ¿Será este el bueno?', ''],
            ['⟦leaf⟧', 'Nombres de Mint.txt', 'Cada versión de Linux Mint lleva un nombre de mujer, como Zena, Xia y Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Un chiste viejo: di "sudo" y el ordenador hace lo que le mandas.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Esta carpeta está vacía.' : 'The ' + egg.title + ' está vacía.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Haz doble clic en algo para echarle un vistazo.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'No' : 'Cancelar'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Sí' : 'Vacía'}</button></div></div>` : '';
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
        ['Colina ondulada', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Verde azulado 95', '#008080'],
        ['Rayas finas', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Cielo nocturno', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Costa', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'El juego de palabras sobre wifi más famoso de todos.'],
        ['The LAN Before Time', 'LAN significa "red de área local". Esta es muy, muy antigua.'],
        ['Abraham Linksys', 'Hace ochenta y siete megabits…'],
        ['Bill Wi the Science Fi', '¡La ciencia manda!'],
        ['Drop It Like It\'s Hotspot', 'El punto de acceso del móvil de alguien con mucho sentido del humor.'],
        ['Silence of the LANs', 'Una red muy, muy silenciosa.'],
        ['Tell My Wi-Fi Love Her', 'Qué ternura.'],
        ['Get Off My LAN', 'Un vecino gruñón, seguramente.'],
        ['Bridlington Seagulls', 'Ya te han quitado las patatas fritas. No les des también tu contraseña.'],
        ['WIFI GRATIS (en serio)', 'Una red llamada "wifi gratis" que no reconoces es justo el tipo de red a la que no hay que conectarse.'],
    ];

    const FORTUNES = ['Hoy es un buen día para hacer una copia de seguridad de tus fotos.', 'Una contraseña segura es una contraseña feliz.', 'Recibirás una llamada de teléfono. Será una estafa. Cuelga.',
        '¿Has probado a apagarlo y volver a encenderlo?', 'El mejor momento para actualizar fue ayer. El segundo mejor momento es ahora.', 'Una taza de té arregla casi todo. Los ordenadores no, eso sí.',
        'No des nunca tu contraseña a un desconocido. Ni a una gaviota.', 'Encontrarás el mando a distancia. Está entre los cojines del sofá.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">Dirección IP: 192.168.1.42<br>Router: 192.168.1.1<br>Señal: −54 dBm (muy buena)<br>Canal: 36 (5 GHz)<br>Velocidad: 866 Mbps<br>Seguridad: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">El wifi está desactivado. Actívalo para ver las redes.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Sin internet</strong><br>Prueba a revisar tu wifi. Pulsa <kbd>Espacio</kbd> o toca para jugar.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>FIN DE LA PARTIDA · pulsa Espacio para volver a jugar</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."¿Has muggido hoy?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Prueba: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || '¡Muu!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(¿Has escrito "sl" en lugar de "ls"? Toma un tren de vapor.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (de práctica) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Tiempo activo: desde el desayuno \\___________/ Memoria: nunca olvida un cumpleaños`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Vale. 🥪');
        else if (lc === 'make me a sandwich') say('¿Qué? Hazlo tú mismo.');
        else if (/rm\s+-rf/.test(lc)) say('¡Buen intento! Este terminal de práctica no te deja estropear nada.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: orden no encontrada (prueba "help")`);
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
        else if (note) note.textContent = 'Este navegador de práctica no busca en internet de verdad. Nada de lo que escribas se envía a ningún sitio.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, '¡Inocente! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Práctica<sup>®</sup></b><strong>95</strong></div><p>¡Truco activado! +30 vidas 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Te damos la bienvenida a Macintosh.</p></div><p>¡Truco activado! +30 vidas 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>¡Truco activado! +30 vidas 🎮</p>';
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
                    funToast(screen, others.length ? '¡Aero Shake! Las demás ventanas se han guardado.' : '¡Aero Shake! (No había otras ventanas que guardar.)');
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
                funToast(screen, 'El wifi está activado. Conectado a Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'El wifi está desactivado.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Conéctate solo a redes que conozcas.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, '¡Inocente! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Ver'], ['', 'Ordenar por'], ['refresh', 'Actualizar'], ['', 'Nueva'], ['wall', 'Personalizar']]
                : os === 'mac' ? [['', 'Carpeta nueva'], ['', 'Obtener información'], ['wall', 'Cambiar fondo de pantalla…'], ['', 'Usar pilas']]
                : [['', 'Crear carpeta nueva'], ['terminal', 'Abrir en el Terminal'], ['wall', 'Cambiar fondo del escritorio']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Fondo: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook de práctica</strong><small>macOS 27 (edición de práctica)</small>
                <dl><dt>Chip</dt><dd>Bridlington Silicon B1</dd><dt>Memoria</dt><dd>Nunca olvida un cumpleaños</dd><dt>Disco de arranque</dt><dd>HD de práctica</dd><dt>Número de serie</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Bloc de notas' : os === 'mac' ? 'TextEdit' : 'Editor de texto';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Sin título – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Lín 1, Col 1 &nbsp;|&nbsp; 100 % &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Texto sin formato'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">¡Te damos la bienvenida! Este es un terminal de práctica. Escribe "help" para ver qué puedes probar. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'El tiempo'], ['news', '⟦newspaper⟧', 'Noticias'], ['bus', '⟦bus⟧', 'Horarios de autobús'], ['recipes', '⟦cake-slice⟧', 'Recetas']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ El tiempo en Bridlington</h3><p class="fd">Previsión de práctica</p><div class="ajf">${[['Hoy', '⟦cloud-sun⟧', '13°'], ['Vie', '⟦cloud-rain⟧', '11°'], ['Sáb', '⟦wind⟧', '10°'], ['Dom', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Actividad de gaviotas: <strong>muy alta</strong>. Vigila tus patatas fritas.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Noticias de práctica</h3><ul class="news">
            <li><strong>Un vecino encuentra por fin el mando de la tele</strong> entre los cojines del sofá, después de tres semanas.</li>
            <li><strong>Una gaviota, vista con un helado 99 Flake</strong>. Su dueño: "no le ha hecho gracia".</li>
            <li><strong>Una abuela gana a su nieto en las videollamadas</strong>: "Yo solo pulsé el botón verde."</li>
            <li><strong>Un estudio revela que</strong> 9 de cada 10 problemas informáticos se arreglan apagando y volviendo a encender.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Horarios de autobús</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Bizcocho Victoria</h3><p>Mezcla 200 g de mantequilla, azúcar y harina con levadura a partes iguales con 4 huevos. Hornea en dos moldes a 180 °C durante 20–25 minutos. Rellena con mermelada y nata.</p><p class="fd">Consejo: pon un temporizador en el móvil o pídeselo: "Pon un temporizador de 25 minutos".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Nueva pestaña' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Busca o escribe una dirección web'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Perro en la playa.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Lista de la compra.txt'], ['⟦file-text⟧', 'Carta al ayuntamiento.docx'], ['⟦folder⟧', 'Recetas'], ['⟦file-spreadsheet⟧', 'Lista de tarjetas de Navidad.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Recibo del impuesto municipal.pdf'], ['⟦file-text⟧', 'Horario de autobuses.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Banda de música junto al mar.mp3'], ['⟦music⟧', 'Éxitos de los sesenta.mp3']],
    };
    function funFiles(screen, os, folder = 'Imágenes', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Papelera de reciclaje' : os === 'mac' ? 'Papelera' : 'Papelera'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Perro en la playa.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Conectado a Home-WiFi-5G' : 'El wifi está desactivado.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalización' : os === 'mac' ? 'Fondo de pantalla' : 'Fondos'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Actualización de software' : 'Actualizaciones'}</h3><p class="mj">⟦check⟧ Estás al día</p><p class="cf">Última comprobación: hoy, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Buscar actualizaciones</button><p class="zi"></p>`,
            about: `<h3>Acerca de</h3><div class="zk"><div><span>Nombre del dispositivo</span><b>MARGARET-PRACTICE</b></div><div><span>Sistema</span><b>${os === 'windows' ? 'Windows 11 (de práctica)' : os === 'mac' ? 'macOS 27 (de práctica)' : 'Linux Mint 22.3 (de práctica)'}</b></div>
                <div><span>Procesador</span><b>Bridlington Silicon B1</b></div><div><span>Memoria</span><b>Nunca olvida un cumpleaños</b></div><div><span>Almacenamiento</span><b>De sobra para las fotos de los nietos</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalización' : os === 'mac' ? 'Fondo de pantalla' : 'Fondos'], ['update', 'Actualizaciones'], ['about', 'Información']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Buscaminas de práctica', 'El clásico juego de buscar minas.'], ['solitaire', '⟦spade⟧', 'Solitario', 'Próximamente en esta tienda de práctica.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Próximamente en esta tienda de práctica.'], ['weather', '⟦cloud-sun⟧', 'El tiempo', 'Próximamente en esta tienda de práctica.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Abrir' : (os === 'mac' ? 'Obtener' : 'Instalar')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Buscaminas de práctica', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Haz clic para excavar. Clic derecho (o mantén pulsado) para poner una bandera.</p></div>`, 'bz'));
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
        ['Mamá', '¿Cómo apago esto?', 'Hola, cariño, he escrito este correo pero no encuentro el botón de apagado. ¿Es el redondo? Un beso, mamá xx P.D. Lo he pulsado. No ha pasado nada. ¿Es normal?'],
        ['Bridlington Walkers', 'El paseo del sábado', 'Quedamos en el puerto a las 10:00. Traed un termo y un impermeable. El incidente de las gaviotas de la semana pasada no se mencionará.'],
        ['Príncipe Abu (Muy rico)', 'URGENTE: ¡has ganado 4.000.000 £!', 'Estimado amigo querido: soy un príncipe y necesito tus datos bancarios para enviarte cuatro millones de libras. Envía también 50 £ para el sello. — ¡Esto es una estafa! La gente de verdad no regala millones por correo. Bórralo o reenvíalo a report@phishing.gov.uk.'],
        ['Sarah', 'Fotos del domingo 🌻', 'Aquí tienes las fotos del jardín. El perro se ha comido otro girasol.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Correo', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Este es un ordenador de práctica, así que no se puede apagar 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Descargas', '⟦triangle-alert⟧ Los programas de "limpieza gratis" suelen ser basura o algo peor. ¡Mejor borrarlo que abrirlo!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `"${n}" se abriría aquí en un ordenador de verdad.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'El wifi está activado.' : 'El wifi está desactivado.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Buscando actualizaciones…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ No hay actualizaciones nuevas. ¡Todo listo!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Este es solo de adorno en la tienda de práctica.'); return true; }
            el.textContent = 'Instalando…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Abrir'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Sin título 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Archivo Editar Ver Insertar Formato <b>N</b> <i>K</i> <u>S</u></div><textarea class="vk agd" aria-label="Document">Estimados señores: </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Gestor de actualizaciones', '<div class="ajz"><p class="mj">⟦check⟧ Tu sistema está actualizado</p><p class="cf">Linux Mint busca actualizaciones por sí solo y muestra un punto en el escudo cuando hay alguna.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Escribe aquí para buscar</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Papelera de reciclaje', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Equipo', '⟦monitor⟧')}${icon('Inicio', '⟦house⟧')}${icon('Papelera', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Buscar aplicaciones, ajustes y documentos')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Buscar')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Escribe para buscar…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Pestaña nueva <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Busca o escribe una dirección web</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Este es el <strong>escritorio</strong>. La barra de abajo es la <strong>barra de tareas</strong>. Abre el navegador web desde el menú Inicio: <strong>haz clic en Inicio</strong>, los cuatro cuadrados.'
            : os === 'mac' ? 'Este es el <strong>escritorio</strong>. La fila de aplicaciones de abajo es el <strong>Dock</strong>, y la barra de arriba es la <strong>barra de menús</strong>. <strong>Haz clic en Apps</strong> (la cuadrícula de cuadrados) para ver todas tus aplicaciones.'
            : 'Este es el <strong>escritorio</strong> de Linux Mint. La barra de abajo es el <strong>panel</strong>. Tus aplicaciones están en el Menú: <strong>haz clic en Menú</strong>, abajo a la izquierda.',
         hint: os === 'mac' ? 'Apps está en el Dock de abajo, junto al Finder.' : (os === 'windows' ? 'Inicio son los cuatro cuadrados azules de la barra de tareas.' : 'El botón Menú está en el extremo izquierdo del panel de abajo.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Haz clic en ${N.browser[os]}</strong>, el navegador web.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Cada ventana tiene tres botones de colores <strong>arriba a la izquierda</strong>. El amarillo guarda la ventana. <strong>Haz clic en el botón amarillo.</strong>'
            : 'Cada ventana tiene tres botones <strong>arriba a la derecha</strong>. La línea <strong>—</strong> guarda la ventana (minimizar). <strong>Haz clic en —</strong>.',
         hints: {'win-close': 'Eso la cierra. Primero, guárdala con el ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Eso hace que ocupe toda la pantalla. Primero, guárdala.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Está oculta, no cerrada. El ${os === 'mac' ? 'punto bajo su icono en el Dock' : 'line under its icon'} indica que sigue abierta. <strong>Haz clic en el icono de ${N.browser[os]}</strong> para recuperarla.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Ahora haz que ocupe toda la pantalla: <strong>haz clic en el botón ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'En un Mac, el botón rojo cierra la ventana. Pero la aplicación puede seguir funcionando. ¿Cómo la cierras del todo?', options: [
                {t: 'Pulsar ⟦command⟧ Cmd + Q, o elegir Salir en el menú de la aplicación de arriba', ok: true, why: 'Sí. Un punto bajo una aplicación en el Dock significa que sigue funcionando. ⟦command⟧ Cmd + Q la cierra.'},
                {t: 'Hacer clic dos veces en el botón rojo', why: 'El botón rojo solo cierra ventanas. ⟦command⟧ Cmd + Q (o el menú de la aplicación > Salir) cierra la aplicación.'}]}
            : {q: '¿Dónde está el botón de cerrar de una ventana?', options: [
                {t: 'Arriba a la derecha: el ⟦x⟧', ok: true, why: 'Sí. En Windows y Linux Mint, los tres botones están arriba a la derecha. (En un Mac están arriba a la izquierda, en rojo, amarillo y verde.)'},
                {t: 'Abajo a la izquierda', why: 'Está arriba a la derecha de cada ventana: el ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>¡Muy bien!</strong> Ya sabes abrir, ocultar, recuperar, agrandar y cerrar ventanas. Eso es casi todo lo que hace falta para usar un ordenador.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Inicio' : 'Inicio'], ['desktop', 'Escritorio'], ['documents', 'Documentos'], ['downloads', 'Descargas'], ['pictures', 'Imágenes']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ Memoria USB']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Documentos'], ['pictures', '⟦folder⟧', 'Imágenes'], ['downloads', '⟦folder⟧', 'Descargas']],
            downloads: [['photo', '⟦image⟧', 'Foto de vacaciones.jpg'], ['bill', '⟦file-text⟧', 'Recibo del impuesto municipal.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Foto de vacaciones.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Vacaciones')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Carta al ayuntamiento.docx'], ['recipes', '⟦folder⟧', 'Recetas']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Documentos']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Carpeta nueva', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Inicio' : 'Inicio', downloads: 'Descargas', pictures: 'Imágenes', documents: 'Documentos', usb: 'Memoria USB', desktop: 'Escritorio'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Esta carpeta está vacía</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Copiar' : 'Copiar';
    const pasteLabel = os => os === 'mac' ? 'Pegar elemento' : 'Pegar';
    const newFolderLabel = os => os === 'mac' ? 'Carpeta nueva' : os === 'windows' ? 'Nuevo > Carpeta' : 'Crear carpeta nueva';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Tus fotos y cartas se guardan en <strong>carpetas</strong>. <strong>Haz clic en ${N.files[os]}</strong> para verlas.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'a la izquierda del Dock' : 'en ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'A un lado están tus carpetas principales. Lo que descargas de correos y páginas web va a <strong>Descargas</strong>. <strong>Haz clic en Descargas.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Abrir'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Cambiar nombre'], ['menu-delete', os === 'mac' ? 'Mover a la papelera' : 'Eliminar']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Vamos a copiar la foto de vacaciones en Imágenes, que es donde le corresponde. Haz <strong>clic derecho</strong> en <strong>Foto de vacaciones.jpg</strong>: pulsa el botón <strong>derecho</strong> del ratón. <em>' + (os === 'mac' ? 'En un panel táctil, haz clic con dos dedos.' : 'En una pantalla táctil, mantén pulsado.') + '</em>',
         hint: 'Usa el botón derecho del ratón sobre la foto.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Aparece un menú. <strong>Haz clic en ${copyLabel(os)}.</strong> <em>(El atajo es ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': '¡Esa no! Haz clic en Copiar.', 'menu-open': 'Eso abre la foto. Haz clic en Copiar.', 'menu-rename': 'Haz clic en Copiar.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Haz clic en Imágenes</strong> a la izquierda.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Imágenes está vacía. <strong>Haz clic derecho en el espacio blanco vacío.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Haz clic en ${pasteLabel(os)}.</strong> <em>(O ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'A continuación haremos una carpeta. Primero, haz clic en ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Ahora la foto también está en Imágenes. Ahora haz una carpeta para guardar juntas las fotos de vacaciones. <strong>Haz clic derecho otra vez en el espacio vacío.</strong>', hints: {'rc-photo2': 'Haz clic derecho en el espacio vacío, no en la foto.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Haz clic en ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Primero escribe un nombre para la carpeta, como Vacaciones.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Escribe un nombre</strong>, como <strong>Vacaciones</strong>, y luego <strong>haz clic en Aceptar</strong> (o pulsa Intro).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: '¿Dónde suelen acabar los archivos de correos y páginas web?', options: [
            {t: 'En la carpeta Descargas', ok: true, why: 'Sí. Si no encuentras algo que has descargado, mira primero en Descargas.'},
            {t: 'En el escritorio', why: 'Normalmente en Descargas. Mira ahí primero si no encuentras algo.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>¡Muy bien!</strong> El clic derecho es el secreto de casi todo: copiar, pegar, cambiar el nombre y carpeta nueva están en ese menú.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Introduce la contraseña de la red</p>${field('wifipass', 'Contraseña', ctx)}<button type="button" class="ce co" data-tap="connect">Conectar</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Redes Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Conectado a Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Para conectarte al wifi, <strong>haz clic en el símbolo de wifi</strong> ${os === 'mac' ? 'arriba a la derecha de la pantalla' : 'abajo a la derecha, cerca del reloj'}.`, hint: os === 'mac' ? 'Está en la barra de menús, arriba a la derecha.' : 'Está cerca del reloj, abajo a la derecha.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'El nombre de tu red está en la pegatina del router. Esta red de práctica es <strong>Home-WiFi-5G</strong>. <strong>Haz clic en ella.</strong>', hints: {'net-neighbour': '¡Esa es la de tu vecino! Elige Home-WiFi-5G.', 'net-cafe': 'Esa no es la de tu casa. Elige Home-WiFi-5G.', 'tray-wifi': 'La lista de redes wifi ya está abierta. Haz clic en Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Escribe la contraseña exactamente: Green-Apple-42 (G y A mayúsculas).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Escribe la contraseña de la pegatina <strong>exactamente</strong>: <strong>Green-Apple-42</strong>. Luego <strong>haz clic en Conectar</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'El panel de wifi ya está abierto. Escribe la contraseña en el cuadro y luego haz clic en Conectar.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Estás en una cafetería con wifi gratis. ¿Se puede usar para la banca en línea?', options: [
            {t: 'Mejor esperar a estar en casa, o usar los datos móviles de tu teléfono', ok: true, why: 'Sí. El wifi gratis está bien para navegar, pero para la banca usa el wifi de tu casa o los datos móviles.'},
            {t: 'Sí, cualquier wifi sirve', why: 'El wifi público gratuito está bien para navegar, pero deja la banca para cuando estés en casa o con datos móviles.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>¡Muy bien!</strong> Tu ordenador recordará la contraseña y se conectará solo la próxima vez.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Lista de la compra: leche, pan, huevos, bolsitas de té, tarjeta de cumpleaños para Jean';
        const note = pcWin(os, `Lista de la compra – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Correo nuevo para Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Haz clic aquí para escribir…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Correo' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Los atajos de teclado ahorran muchos clics. <strong>${CMDL(os)}</strong> es la tecla ${os === 'mac' ? 'a cada lado de la barra espaciadora, marcada con ⟦command⟧' : 'abajo a la izquierda del teclado'}. Para seleccionar todo lo escrito, mantén pulsada <strong>${CMDL(os)}</strong> y pulsa <strong>A</strong>. <em>Usa tu teclado de verdad o los botones de la pantalla.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Ya está resaltado. Ahora cópialo: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: '¡Copiado! <strong>Haz clic dentro del correo</strong> para Sarah, donde dice "Haz clic aquí para escribir".'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Ahora pega: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Vaya, has borrado algo por error. ¿Qué atajo lo deshace?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Sí. ${CMDL(os)} + Z deshace lo último que hiciste, en casi todas las aplicaciones. Púlsalo otra vez para deshacer más.`},
            {t: 'Escape', why: `Escape cierra menús. ${CMDL(os)} + Z es deshacer.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: '¿Cómo se hace una captura de pantalla (una imagen de la pantalla)?', options: [
            {t: os === 'windows' ? 'Tecla Windows + Mayús + S y luego arrastrar sobre lo que quieres' : os === 'mac' ? 'Mayús + ⟦command⟧ Cmd + 4 y luego arrastrar sobre lo que quieres' : 'Pulsar la tecla Impr Pant', ok: true,
             why: os === 'windows' ? 'Sí. Se copia y una notificación te deja guardarla. La tecla Impr Pant también funciona.' : os === 'mac' ? 'Sí. La imagen se guarda en tu escritorio. Mayús + ⟦command⟧ Cmd + 3 captura toda la pantalla.' : 'Sí. Linux Mint la guarda en tu carpeta Imágenes. Mayús + Impr Pant te deja elegir una zona.'},
            {t: 'Hacer una foto de la pantalla con el móvil', why: 'Eso funciona, pero una captura de pantalla se ve mucho más clara. ' + (os === 'windows' ? 'Tecla Windows + Mayús + S.' : os === 'mac' ? 'Mayús + ⟦command⟧ Cmd + 4.' : 'Pulsa Impr Pant.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>¡Muy bien!</strong> Los cuatro grandes: <strong>${CMDL(os)} + C</strong> copiar, <strong>V</strong> pegar, <strong>Z</strong> deshacer, <strong>A</strong> seleccionar todo. Funcionan en casi todas las aplicaciones.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Gratis', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Gratis · Compras dentro de la app', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Buscar apps</span></button><div class="hp"><span>DESTACADO</span><strong>Apps para tu ordenador nuevo</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Abrir' : (os === 'mac' ? 'Obtener' : 'Instalar')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Instalando LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Tienda de práctica: los nombres y los precios son ejemplos.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `El lugar más seguro para conseguir aplicaciones es la tienda integrada: <strong>${N.store[os]}</strong>. <strong>Haz clic en ella.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Quieres algo para escribir cartas, como Word. <strong>Haz clic en el cuadro de búsqueda.</strong> Buscaremos "office".'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> es una alternativa gratuita a Microsoft Office, creada por <strong>The Document Foundation</strong>. Fíjate en quién la ha creado y luego <strong>haz clic ' + (os === 'mac' ? 'Obtener' : 'Instalar') + ' junto a LibreOffice</strong>.',
         hints: {'get-fake1': 'Esa es un anuncio y cobra 29,99 £ al año. LibreOffice es gratis.', 'get-fake2': 'Esa es de AppMakers y tiene compras dentro de la app. Elige LibreOffice, de The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Una ventana emergente de una página web dice "¡Tu PC va lento! Descarga Speed Booster ahora". ¿Qué haces?', options: [
            {t: 'Cerrarla. Instalar aplicaciones solo desde la tienda o desde la web del propio fabricante', ok: true, why: 'Exacto. Las ventanas emergentes que ofrecen "aceleradores" o "limpiadores" suelen ser basura o algo peor.'},
            {t: 'Descargarlo, quizá ayude', why: 'Suelen ser basura o dañinos. Instala solo desde la tienda o desde la web del propio fabricante.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>¡Muy bien!</strong> LibreOffice está instalado. Fíjate en quién la ha creado, ignora los anuncios y desconfía de las apps "gratuitas" que luego piden dinero.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Inicio'], ['system', 'Sistema'], ['bluetooth', 'Bluetooth y dispositivos'], ['network', 'Red e Internet'], ['accounts', 'Cuentas'], ['privacy', 'Privacidad y seguridad'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Inicio</h3><p class="cf">Ajustes recomendados y tu cuenta.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Estás al día</p>' : ctx.ready ? `<p class="cf">Hace falta reiniciar para terminar de instalar las actualizaciones.</p><button type="button" class="ce co bz" data-tap="restart">Reiniciar ahora</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Descargando… 45 %' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Ajustes', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'General'], ['privacy', 'Privacidad y seguridad'], ['users', 'Usuarios y grupos']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Tu Mac está actualizado</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Descargando… quedan unos 10 minutos' : 'Seguridad y corrección de errores'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Privacidad y seguridad</h3><p class="cf"><strong>Seguridad</strong><br>Permitir apps de:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store y desarrolladores conocidos</button>`,
            };
            return pcWin(os, 'Ajustes del Sistema', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Ajustes del Sistema</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Gestor de actualizaciones', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Tu sistema está actualizado</p>' : `<div class="ahf">${['Navegador web Firefox', 'Núcleo de Linux (seguridad)', 'LibreOffice', 'Bibliotecas del sistema'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Instalando actualizaciones…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Se requiere autenticación</strong></p><p class="fd">Introduce tu contraseña para instalar las actualizaciones. (Práctica: ya está escrita por ti.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Cancelar</button><button type="button" class="adg" data-tap="auth-ok">Autenticar</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Las actualizaciones corrigen fallos de seguridad que usan los estafadores. Vamos a comprobarlas. <strong>Haz clic en Inicio.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Haz clic en Configuración</strong> (el engranaje).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Haz clic en Windows Update</strong>, al final de la lista de la izquierda.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Hay actualizaciones esperando. <strong>Haz clic en Descargar e instalar todo.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Guarda primero lo que estés haciendo y luego <strong>haz clic en Reiniciar ahora</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Las actualizaciones corrigen fallos de seguridad que usan los estafadores. <strong>Haz clic en el menú Apple</strong> (el logotipo) arriba a la izquierda.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Haz clic en Ajustes del Sistema…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Estás en General. <strong>Haz clic en Actualización de software.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Hay una actualización lista. Conecta el cargador y luego <strong>haz clic en Actualizar ahora</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Tu Mac la descarga y luego se reinicia para instalarla.',
         question: {q: 'Las actualizaciones automáticas están activadas. ¿Aún tienes que hacer algo?', options: [
            {t: 'Solo reiniciar cuando lo pida y dejarlo enchufado por la noche de vez en cuando', ok: true, why: 'Sí. Las actualizaciones suelen instalarse por la noche. Reiniciar cuando se pide las termina.'},
            {t: 'Desactivar las actualizaciones automáticas', why: 'Déjalas activadas: te mantienen seguro. Solo reinicia cuando tu Mac te lo pida.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Las actualizaciones corrigen fallos de seguridad. En Linux Mint, el <strong>escudo</strong> que hay junto al reloj muestra un punto cuando hay actualizaciones esperando. <strong>Haz clic en el escudo.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'El Gestor de actualizaciones las muestra todas. <strong>Haz clic en Instalar actualizaciones.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux te pide <strong>tu contraseña</strong> antes de cambiar nada importante. Eso es bueno. <strong>Haz clic en Autenticar.</strong>', hints: {'auth-cancel': 'Eso cancela las actualizaciones. Haz clic en Autenticar.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: '¿Cada cuánto deberías instalar las actualizaciones?', options: [
            {t: 'Siempre que el escudo muestre un punto: solo lleva un minuto', ok: true, why: 'Sí. Linux Mint rara vez necesita reiniciarse, salvo con algunas actualizaciones de seguridad.'},
            {t: 'Una vez al año', why: 'Instálalas siempre que el escudo muestre un punto. Solo lleva un minuto.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>¡Muy bien!</strong> Tu ordenador está al día. Mantenerlo actualizado es lo mejor que puedes hacer para estar seguro.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistema', 'Pantalla, sonido, información'], ['tile-devices', '⟦printer⟧', 'Dispositivos', 'Bluetooth, impresoras'], ['tile-network', '⟦globe⟧', 'Red e Internet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Cuentas', 'Tus cuentas'], ['tile-update', '⟦refresh-cw⟧', 'Actualización y seguridad', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Tu PC está inscrito en las Actualizaciones de seguridad extendidas</p><p class="cf">Actualizaciones de seguridad hasta el 12 de octubre de 2027.</p>' : `<div class="ahg"><strong>La compatibilidad con Windows 10 ha terminado</strong><p>Tu PC no cumple los requisitos para ejecutar Windows 11. Inscríbete en las Actualizaciones de seguridad extendidas para seguir recibiendo actualizaciones de seguridad.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Inscribirse ahora</button></div>`}`;
        else inner = `<h3>Actualizaciones de seguridad extendidas</h3><p class="cf">Elige cómo inscribirte:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Hacer copia de seguridad de los ajustes del PC</strong><small>Gratis, con una cuenta de Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Usar 1.000 puntos de Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Compra única</strong><small>De pago</small></button>${ctx.busy ? '<p class="cf">Inscribiendo…</p>' : ''}`;
        return pcWin('windows', 'Ajustes', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Si tu ordenador se ve así, con Inicio en el extremo izquierdo, puede que sea <strong>Windows 10</strong>. Vamos a comprobarlo. <strong>Haz clic en Inicio.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Haz clic en Configuración</strong> (el engranaje).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Haz clic en Sistema.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Dice Windows 10 Home. ¿Qué significa eso en 2026?', options: [
            {t: 'Microsoft dejó el soporte normal en octubre de 2025. Sigue funcionando, pero necesita las Actualizaciones de seguridad extendidas para estar seguro', ok: true,
             why: 'Sí. El programa gratuito de Actualizaciones de seguridad extendidas para particulares dura ahora hasta el 12 de octubre de 2027. Después, Windows 10 no recibe más correcciones de seguridad.'},
            {t: 'Nada, Windows 10 se actualizará para siempre', why: 'El soporte normal terminó en octubre de 2025. Las Actualizaciones de seguridad extendidas duran ahora hasta el 12 de octubre de 2027 y luego se acaban.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Haz clic en ← Inicio</strong> para volver.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Haz clic en Actualización y seguridad.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Este portátil es demasiado antiguo para Windows 11, así que Windows ofrece las <strong>Actualizaciones de seguridad extendidas</strong>. <strong>Haz clic en Inscribirse ahora.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'La forma gratuita es hacer una copia de seguridad de tus ajustes en una cuenta de Microsoft. <strong>Haz clic en Hacer copia de seguridad de los ajustes del PC.</strong>', hints: {'esu-buy': 'No hace falta pagar. Elige la opción gratuita de copia de seguridad.', 'esu-points': 'Eso funciona si tienes los puntos, pero la opción de copia de seguridad es gratis para todo el mundo.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: '¿Qué opciones tienes antes de octubre de 2027?', options: [
            {t: 'Actualizar a Windows 11 si se puede, comprar un ordenador nuevo o pasar uno antiguo a Linux Mint (gratis)', ok: true, why: 'Sí. Linux Mint es gratis y funciona bien en portátiles antiguos. Las próximas lecciones muestran dónde está cada cosa en un Mac y en Linux Mint.'},
            {t: 'Seguir usando Windows 10 después de 2027 para la banca', why: 'Después de octubre de 2027 no recibe correcciones de seguridad, así que no es seguro para la banca. Actualiza, sustitúyelo o pasa a Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>¡Muy bien!</strong> Sabes qué Windows tienes y cómo mantenerlo seguro hasta octubre de 2027. Desconfía de las llamadas o ventanas emergentes que te ofrezcan "actualizarte" a cambio de dinero: son estafas.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: '¿Vienes de Windows? En un Mac, las aplicaciones están en el <strong>Dock</strong> de abajo, y los menús de cada aplicación están en la <strong>barra de menús</strong> de arriba. <strong>Haz clic en Safari</strong>, el navegador web, en el Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Los botones de la ventana están <strong>arriba a la izquierda</strong> en un Mac. <strong>Haz clic en el rojo</strong> para cerrar la ventana.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'La ventana ha desaparecido, pero ¿ves el <strong>punto bajo Safari</strong> en el Dock? Sigue funcionando. Para cerrarlo del todo, <strong>haz clic derecho en Safari en el Dock</strong> (dos dedos en un panel táctil).', hint: 'Haz clic derecho (o clic con dos dedos) en el icono de Safari del Dock.',
         hints: {'app-browser': 'Un clic normal lo abre otra vez. Haz clic derecho en su lugar.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Haz clic en Salir.</strong> <em>(El atajo es ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Los ajustes están en el <strong>menú Apple</strong> (el logotipo) arriba a la izquierda. <strong>Haz clic en él.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Apagar y Reiniciar también están aquí. <strong>Haz clic en Ajustes del Sistema…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'En Windows se copia con Ctrl + C. ¿Cómo se hace en un Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Sí. La mayoría de los atajos de Windows usan ⟦command⟧ Cmd en un Mac en lugar de Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, igual', why: 'En un Mac es ⟦command⟧ Cmd + C. La mayoría de los atajos con Ctrl pasan a usar ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>¡Muy bien!</strong> Dock abajo, menús arriba, botones de ventana arriba a la izquierda, ⟦command⟧ Cmd en lugar de Ctrl y el menú Apple para los ajustes y para apagar.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> es un sistema gratuito que funciona de forma muy parecida a Windows y va bien en ordenadores antiguos. Tus aplicaciones están en el <strong>Menú</strong>, abajo a la izquierda, como el botón Inicio. <strong>Haz clic en Menú.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint viene con aplicaciones gratuitas ya instaladas. Para cartas, usa <strong>LibreOffice Writer</strong>, que funciona como Microsoft Word. <strong>Haz clic en él.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Sin título 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Archivo Editar Ver Insertar Formato <b>N</b> <i>K</i> <u>S</u></div><div class="vk">Estimados señores:<span class="ts"></span></div></div>', {max: true})}),
         question: {q: '¿Puedes abrir los documentos de Word que te mandan por correo?', options: [
            {t: 'Sí. LibreOffice abre y guarda archivos de Word (.docx)', ok: true, why: 'Sí. Al guardar algo para enviarlo a una persona que usa Word, elige el formato de Word (.docx) en Guardar como.'},
            {t: 'No, para eso hace falta Windows', why: 'LibreOffice abre y guarda archivos de Word (.docx), así que puedes intercambiar documentos con quienes usan Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Sin título 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Estimados señores:</div></div>', {max: true})}),
         target: 'win-close', say: 'Los botones de la ventana están arriba a la derecha, igual que en Windows. <strong>Haz clic en ⟦x⟧</strong> para cerrar Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Ahora vamos a ver dónde conseguir más aplicaciones. <strong>Haz clic otra vez en Menú</strong>.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: 'El <strong>Gestor de software</strong> es la tienda de aplicaciones gratuita de Linux Mint. <strong>Haz clic en él.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Gestor de software', `<div class="jo"><div class="gq">${ICON.search}<span>Buscar</span></div>
            <div class="aan">${['Internet', 'Oficina', 'Gráficos', 'Sonido y vídeo', 'Juegos', 'Accesibilidad'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Miles de aplicaciones gratuitas, revisadas por Linux Mint.</p></div>`, {max: true})}),
         question: {q: '¿Hay que comprar un antivirus para Linux Mint?', options: [
            {t: 'No. Mantenlo actualizado, consigue las aplicaciones en el Gestor de software y estarás bien protegido', ok: true, why: 'No. Linux tiene pocos virus. Las actualizaciones y el firewall integrado hacen el trabajo. Las estafas de correos y páginas web siguen existiendo, así que mantente alerta.'},
            {t: 'Sí, el más caro', why: 'No. Mantenlo actualizado y consigue las aplicaciones en el Gestor de software. Ojo con las estafas por correo y por web, como siempre.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>¡Muy bien!</strong> Menú abajo a la izquierda, cerrar arriba a la derecha, LibreOffice para documentos, Firefox para la web, el Gestor de software para aplicaciones y el escudo para las actualizaciones.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ Memoria USB conectada</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Antes de cambiar de ordenador, copia tus archivos en una <strong>memoria USB</strong>. Introdúcela en un puerto USB del lateral del ordenador. Aquí, <strong>haz clic en Conectar memoria USB</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ Memoria USB conectada</div>'}), target: 'app-files', say: `<strong>Abre ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Abrir'], ['menu-copy', 'Copiar'], ['menu-rename', 'Cambiar nombre']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Tus cartas están en <strong>Documentos</strong>. <strong>Haz clic derecho en la carpeta Documentos.</strong> <em>(Haz lo mismo después con Imágenes.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Haz clic en Copiar.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Tu memoria USB está a la izquierda. <strong>Haz clic en Memoria USB.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Está vacía. <strong>Haz clic derecho en el espacio vacío.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Haz clic en ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Copiando 214 elementos… queda 1 minuto' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Expulsar']]; c.menuAt = 'left:6%;top:62%'; },
         say: '¡Hecho! Antes de sacar la memoria, <strong>expúísala</strong> para que no se dañe nada. <strong>Haz clic derecho en Memoria USB</strong> a la izquierda.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Haz clic en Expulsar.</strong> Ya puedes sacarla con seguridad.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: '¿Otra forma de pasar archivos a un ordenador nuevo?', options: [
            {t: 'Almacenamiento en línea: OneDrive, iCloud o Google Drive', ok: true, why: 'Sí. Sube los archivos desde el ordenador antiguo, inicia sesión en el nuevo y ya están ahí. Una memoria USB también es una buena copia extra.'},
            {t: 'Enviarte por correo cada archivo, uno por uno', why: '¡Eso llevaría una eternidad! Usa una memoria USB o almacenamiento en línea como OneDrive, iCloud o Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>¡Muy bien!</strong> En el ordenador nuevo, conecta la memoria, ábrela y copia las carpetas en Documentos e Imágenes.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ El tiempo de la BBC ⟦star⟧ NHS App ⟦star⟧ Horarios de autobús de Bridlington ⟦star⟧ Recetas</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Sin sesión iniciada</span><button type="button" data-tap="sync">Activar sincronización…</button><button type="button" data-tap="guest">Abrir perfil de invitado</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Iniciar sesión con Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Práctica: ya está escrita por ti.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Siguiente</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>¿Activar la sincronización?</strong></p><p class="fd">Tus marcadores, contraseñas e historial se guardarán en tu cuenta de Google y aparecerán en todos tus dispositivos.</p><div class="jn"><button type="button" data-tap="cancel">Cancelar</button><button type="button" class="adg" data-tap="yes-in">Sí, activar</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Pestaña nueva</span>${profile}</div><div class="qn">⟦search⟧ Busca en Google o escribe una URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Sincronizando tus marcadores…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Si usabas <strong>Chrome</strong> en tu ordenador antiguo, al iniciar sesión se traen tus marcadores y contraseñas guardadas al nuevo. (Firefox y Edge funcionan igual.) <strong>Haz clic en Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Haz clic en el icono de la persona</strong> arriba a la derecha.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Haz clic en Activar sincronización…</strong>', hints: {guest: 'Un perfil de invitado no guarda nada. Haz clic en Activar sincronización.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Inicia sesión con la <strong>misma cuenta de Google</strong> que usabas en el ordenador antiguo. <strong>Haz clic en Siguiente.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Haz clic en Sí, activar.</strong>', hints: {cancel: 'Eso detiene la sincronización. Haz clic en Sí, activar.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Tus marcadores han vuelto. ¿Es seguro guardar contraseñas en el navegador?', options: [
            {t: 'Sí, si tu cuenta de Google tiene una contraseña segura y verificación en dos pasos', ok: true, why: 'Sí. Es mucho más seguro que repetir la misma contraseña en todas partes. Protege la propia cuenta con la verificación en dos pasos.'},
            {t: 'No, apuntarlas en una nota adhesiva pegada en la pantalla', why: 'Un gestor de contraseñas del navegador es mucho más seguro que una nota en la pantalla, siempre que tu cuenta tenga verificación en dos pasos.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>¡Muy bien!</strong> Tus marcadores y contraseñas te han seguido. En un ordenador público o compartido, no actives la sincronización.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistema'} Alerta de seguridad ⚠️</strong>
            <p>¡Su ordenador está INFECTADO con 5 virus! Sus datos bancarios y sus fotos están en peligro.</p><p>No apague el ordenador. Llame ahora al servicio de asistencia:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Llamar ahora</button><button type="button" data-tap="fake-close">Cerrar</button></div>
            <small>(Página fraudulenta de práctica. El número no es real.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>¿Salir del sitio?</strong></p><p class="fd">Es posible que los cambios que has hecho no se guarden.</p><div class="jn"><button type="button" data-tap="stay">Quedarse</button><button type="button" class="adg" data-tap="leave">Salir</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Esto te ha llenado la pantalla de repente mientras navegabas. ¿Es de verdad?', options: [
            {t: 'No. Es una página web falsa que intenta asustarte para que llames a unos estafadores', ok: true, why: 'Exacto. Las advertencias de verdad nunca muestran un número de teléfono al que llamar. No llames y no hagas clic en nada de la página.'},
            {t: 'Sí, llamar rápido al número', why: 'No llames nunca. Es una página falsa. La gente del "soporte" intentará tomar el control de tu ordenador y de tu dinero.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Ha llenado toda la pantalla para que no veas cómo cerrarla. Pulsa la tecla <strong>Esc</strong> (arriba a la izquierda del teclado) para salir de la pantalla completa.',
         hints: {'call-btn': '¡Nunca! Pulsa la tecla Esc.', 'fake-close': 'Los botones de la página pueden ser trampas. Pulsa mejor la tecla Esc de tu teclado.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Ahora ya ves el navegador. <strong>Cierra la pestaña</strong> con su ⟦x⟧.',
         hints: {'call-btn': 'No hagas clic en nada de la página. Cierra la pestaña con su ⟦x⟧.', 'fake-close': 'Eso forma parte de la página fraudulenta. Usa el ⟦x⟧ de la propia pestaña.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Intenta que te quedes. <strong>Haz clic en Salir.</strong>', hints: {stay: 'Haz clic en Salir.'}},
        {screen: c => scareware(os, c), question: {q: '¿Y si no se cierra de ninguna manera?', options: [
            {t: os === 'windows' ? 'Pulsar Ctrl + Mayús + Esc para abrir el Administrador de tareas, elegir el navegador y hacer clic en Finalizar tarea' : os === 'mac' ? 'Pulsar ⟦command⟧ Cmd + Opción + Esc y Forzar salida del navegador' : 'Hacer clic derecho en el navegador del panel y elegir Cerrar, o reiniciar el ordenador',
             ok: true, why: 'Sí. Cuando vuelvas a abrir el navegador, no dejes que restaure las páginas anteriores. Reiniciar el ordenador también funciona.'},
            {t: 'Llamar al número para que me ayuden a cerrarla', why: 'No llames nunca. ' + (os === 'windows' ? 'Usa Ctrl + Mayús + Esc (Administrador de tareas) para cerrar el navegador.' : os === 'mac' ? 'Usa ⟦command⟧ Cmd + Opción + Esc para Forzar salida.' : 'Cierra el navegador desde el panel, o reinicia.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>¡Muy bien!</strong> Tu ordenador nunca estuvo infectado: era solo una página web. Si llegaste a llamar a un número como este, ponte en contacto con tu banco y cambia tus contraseñas desde otro dispositivo.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Seguridad de Windows', `<div class="aif"><h3>Protección antivirus y contra amenazas</h3><p class="mj">⟦check⟧ No hay amenazas actuales</p>
                <p class="cf">Último análisis: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Análisis rápido en curso… 12.840 archivos analizados</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Protección antivirus</span><span>⟦check⟧ Firewall</span><span>⟦check⟧ Control de aplicaciones y navegador</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Configuración del firewall', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ El firewall está activado</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows tiene un antivirus gratuito integrado, llamado <strong>Seguridad de Windows</strong>. Vamos a comprobar que funciona. <strong>Haz clic en Inicio.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Haz clic en Configuración.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Haz clic en Privacidad y seguridad</strong> a la izquierda.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Haz clic en Seguridad de Windows.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Las marcas verdes significan que estás protegido. Para mayor tranquilidad, <strong>haz clic en Análisis rápido</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: '¿Hace falta pagar por otro antivirus además?', options: [
            {t: 'No. Seguridad de Windows es suficiente para la mayoría de la gente, y tener dos puede ralentizar el ordenador', ok: true, why: 'Sí. Mantén Windows actualizado y Seguridad de Windows activada. Los de pago suelen añadir solo ventanas emergentes y suscripciones.'},
            {t: 'Sí, cuantos más mejor', why: 'Dos programas antivirus pueden chocar y ralentizar todo. Seguridad de Windows es suficiente para la mayoría de la gente.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Los Mac traen protección gratuita integrada que revisa aplicaciones y archivos en segundo plano. Vamos a comprobar un ajuste. <strong>Haz clic en el menú Apple</strong> (el logotipo).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Haz clic en Ajustes del Sistema…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Haz clic en Privacidad y seguridad</strong> a la izquierda.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Está elegido "Permitir apps de App Store y desarrolladores conocidos". ¿Debes cambiarlo?', options: [
            {t: 'No, déjalo. Bloquea las apps de fabricantes desconocidos', ok: true, why: 'Sí. Si una página web te dice que cambies esto para instalar algo, es una señal de alarma importante.'},
            {t: 'Sí, permitir apps de cualquier sitio', why: 'Déjalo como está. Impide las apps de fabricantes desconocidos. Que una página web te diga que lo cambies es una señal de alarma.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ajustes del Sistema', windows: settingsWin(os, c, 'privacy')}),
         question: {q: '¿Hay que comprar un antivirus para un Mac?', options: [
            {t: 'La mayoría de la gente no. Mantenlo actualizado e instala apps solo de sitios de confianza', ok: true, why: 'Sí. Las actualizaciones y la protección integrada hacen el trabajo. Las ventanas emergentes que dicen que tu Mac está infectado son estafas.'},
            {t: 'Sí, el que ofrezca cualquier ventana emergente', why: 'Las ventanas emergentes que ofrecen antivirus para Mac suelen ser estafas. Mejor mantén tu Mac actualizado.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint tiene un <strong>firewall</strong> integrado, que bloquea las conexiones no deseadas. Está desactivado hasta que lo actives. <strong>Haz clic en Menú.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Haz clic en Firewall.</strong> <em>(Busca "firewall" en el Menú si no lo ves.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Haz clic en el interruptor Estado</strong> para activar el firewall.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: '¿Qué más mantiene seguro a Linux Mint?', options: [
            {t: 'Instalar las actualizaciones cuando el escudo muestre un punto, y conseguir las aplicaciones en el Gestor de software', ok: true, why: 'Sí. Y las reglas de siempre: ten cuidado con los enlaces de los correos y las ventanas emergentes.'},
            {t: 'No hace falta nada más', why: 'Sigue instalando actualizaciones y consigue las aplicaciones en el Gestor de software. Las estafas de correos y páginas web siguen existiendo.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>¡Muy bien!</strong> La protección integrada de tu ordenador está activada. Las actualizaciones, el cuidado con los enlaces y solo instalar de sitios de confianza hacen el resto.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Entrega de paquetes</strong><span>No le hemos encontrado: reprograme hoy la entrega</span></button>
            <div class="lx"><strong>Sarah</strong><span>Fotos del domingo</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>El paseo del sábado</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Entrega de paquetes</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Hoy hemos intentado entregar su paquete, pero no había nadie en casa. Se necesita una tasa de 1,45 £ para reprogramar la entrega.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Reprogramar entrega</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Notificar phishing</button><button type="button" data-tap="reply">Responder</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Correo', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Notificado y movido a No deseado</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Aquí tienes tu correo, en el navegador. <strong>Abre el correo de Entrega de paquetes.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'En un ordenador puedes comprobar adónde lleva realmente un enlace <strong>sin hacer clic</strong>. <strong>Pasa el ratón por encima de "Reprogramar entrega"</strong> y mantenlo quieto. <em>(En una pantalla táctil, mantenlo pulsado.)</em>',
         hints: {'click-link': '¡No hagas clic! Solo deja el puntero del ratón encima.'}, hint: 'Deja el puntero del ratón sobre el enlace azul, sin hacer clic.'},
        {screen: c => webmail(os, c), question: {q: 'La dirección real aparece abajo: parcel-redelivery.example.top. ¿Es segura?', options: [
            {t: 'No. No es la web de una empresa de reparto de verdad, y piden una tasa', ok: true, why: 'Exacto. Los mensajeros no cobran pequeñas tasas por correo ni por SMS. La dirección real los delata.'},
            {t: 'Sí, lleva "parcel" (paquete)', why: 'Cualquiera puede poner "parcel" en una dirección web. No es un mensajero de verdad, y la tasa es la estafa.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Haz clic en Notificar phishing.</strong> También puedes reenviar los correos fraudulentos a report@phishing.gov.uk.', hints: {reply: 'No respondas nunca a los estafadores. Haz clic en Notificar phishing.', 'click-link': '¡No hagas clic en el enlace! Notifícalo mejor.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>¡Muy bien!</strong> Pasa el ratón antes de hacer clic: si la dirección no coincide con la empresa, no hagas clic.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (número de prueba). Este es el código real para encontrar el IMEI de tu móvil.',
        '999': 'Este es un móvil de práctica, así que no puede llamar al 999. En una emergencia de verdad, llama al 999 o al 112.',
        '112': 'Este es un móvil de práctica, así que no puede llamar al 112. El 112 funciona igual que el 999 en el Reino Unido y en toda Europa.',
        '159': 'El 159 te conecta de forma segura con tu propio banco. Úsalo si una llamada sobre tu dinero te preocupa.',
        '7726': 'El 7726 es adonde reenvías los SMS fraudulentos. ¡En los teclados de los móviles antiguos forma la palabra "SPAM"!',
        '123': 'speaking-clock',
        '1471': 'El número de teléfono 07700 900842 llamó hoy a las 11:20. (Práctica. El 1471 te dice quién llamó por última vez a tu teléfono fijo.)',
        '01189998819991197253': 'Ese es el número de emergencias de The IT Crowd. ¿Has probado a apagarlo y volver a encenderlo?',
        '101': 'El 101 es el número de la policía para cosas que no son emergencias.',
        '111': 'El 111 es la ayuda del NHS cuando es urgente pero no es una emergencia.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Teléfono', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Introduce un número</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mamá', '#f472b6', [['them', 'Yo pensaba que LOL era "lots of love". ¡Se lo he puesto a todo!'], ['them', '¿Por eso no te ha contestado tu tía?'], ['them', 'Enviado desde mi iPad']]],
        ['Desconocido', '#94a3b8', [['them', '¡Enhorabuena! Has ganado un móvil GRATIS. Haz clic aquí para reclamarlo: prize-winner.example'], ['note', 'Esto es una estafa. No toques el enlace: reenvíalo al 7726 y luego bórralo.']]],
        ['Sarah', '#a78bfa', [['them', 'Papá está aprendiendo a usar emojis 😂'], ['them', 'Me ha mandado una berenjena y me ha dicho "¿para cenar esta noche?" 🍆']]],
        ['Dentista', '#38bdf8', [['them', 'Recordatorio: su cita es el martes a las 10:30. Responda Y para confirmar.']]],
    ];
    const MUM_REPLIES = ['¿Quién es?', 'Llámame, no puedo leer mensajes sin mis gafas', '¡Qué bien! 👍', '¿Te llegó mi último mensaje? Se lo mandé al gato por error.', 'Enviado desde mi iPad', 'Vale, cariño xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Mensajes', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'La gaviota ataca de nuevo' : 'Foto', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Pillada in fraganti en el paseo marítimo de Bridlington. Las patatas fritas no se recuperaron.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Fotos', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Reloj', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'El tiempo', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Frío, con chubascos de nieve' : 'Intervalos soleados, ventoso'}</p>
            <div class="ajf">${[['Vie', '⟦cloud-rain⟧', '11°'], ['Sáb', '⟦wind⟧', '10°'], ['Dom', '⟦sun⟧', '14°'], ['Lun', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Aviso de gaviotas: <strong>alto</strong>. Vigila tus patatas fritas.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Por el armario y luego sigue andando pasando la farola.', home: 'No hay lugar como el hogar. 🏠', 'la luna': '238.855 millas. Poco tráfico.',
        chips: 'Freiduría de pescado más cercana: cualquiera del paseo marítimo de Bridlington. 🍟', 'north pole': 'El taller de Papá Noel. Cerrado hasta diciembre. 🎅', bridlington: 'Bridlington, East Riding de Yorkshire. ¡Un sitio precioso!',
        'flamborough': 'Flamborough Head: faro, acantilados y frailecillos. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": este mapa de práctica solo conoce unos pocos lugares. Prueba con Bridlington, Flamborough o Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Ajustes', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Modo avión' : 'Modo avión', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Modo oscuro', st.dark)}${row('dnd', 'No molestar', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Información' : 'Información del teléfono'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Información' : 'Información del teléfono', `<div class="aic"><div class="lq">
            <div class="ho"><span>Nombre</span><b>Móvil de Margaret</b></div>
            <div class="ho"><span>Modelo</span><b>${p === 'ios' ? 'iPhone de práctica' : 'Pixel de práctica'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Versión de iOS' : 'Versión de Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Almacenamiento</span><b>De sobra para las fotos de los nietos</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Número de serie</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'El clásico juego de los móviles antiguos.'], ['torch', '⟦flashlight⟧', 'Linterna Super Brillante GRATIS', 'Contiene anuncios · Compras dentro de la app'], ['knit', '⟦scissors⟧', 'Patrones de punto', 'Próximamente en esta tienda de práctica.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Abrir' : (p === 'ios' ? 'Obtener' : 'Instalar')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Puntos: <b class="ado">0</b></span><span>Mejor: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Toca una dirección (o usa las teclas de flecha) para empezar</p>
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
                f.querySelector('.vy').textContent = `¡Fin de la partida! Puntuación ${score}. Toca una dirección para jugar otra vez.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Avión', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'No molestar', st.dnd)}${t('torch', '⟦flashlight⟧', 'Linterna', st.torch)}${t('dark', '⟦sun-moon⟧', 'Modo oscuro', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Desliza hacia arriba para cerrar' : 'Cerrar'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Fondo nuevo');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"Al tercer tono, la hora será ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} y ${t.getSeconds()} segundos… pip, pip, pip." (¡El viejo reloj parlante!)`; return; }
                msg.textContent = egg || (n ? 'Este móvil de práctica no puede hacer llamadas de verdad. Prueba 123, 1471 o *#06#…' : 'Primero escribe un número.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: '¡¡¡Envíe sus datos bancarios para reclamar su premio!!! (Es una estafa. Bloquea este número.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Gracias, su cita queda confirmada. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Correo', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Inicio'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Parar'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Inicio'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ ¡Con la crema solar puesta! Esto es prácticamente la Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Linterna encendida. (La pantalla se ilumina en lugar de la luz de la parte trasera.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Modo avión activado: sin llamadas, SMS ni datos móviles.' : 'Modo avión desactivado.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Fondo cambiado. ¡Ve al inicio para verlo!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ ¡Ya eres desarrollador! (Un secreto real de Android: toca 7 veces Número de compilación.)' : st.build >= 3 ? `Ya solo te faltan ${7 - st.build} pasos para ser desarrollador.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>¡Gracias por practicar!</b>' : '<span>🤖</span><b>Práctica 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'No necesitas una app de linterna: viene integrada en los ajustes rápidos de tu móvil. Las apps de linterna gratuitas suelen estar llenas de anuncios, ¡o algo peor!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Solo de adorno en la tienda de práctica.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Instalando…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Abrir'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Aplicación (app)', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Esta app de práctica forma parte de su propia lección. Echa un vistazo a los cursos para probarla bien.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ ¡Has encontrado un secreto!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Llamada finalizada' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Desconocido' ? 'Llamante' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Desconocido', number: '0161 496 0423', who: 'm', tag: 'No está en tus contactos',
         intro: 'Tu móvil está sonando. El número no está guardado en tus contactos. <strong>Contesta</strong> para practicar. <em>Sube el sonido para oír a quien llama.</em>',
         lines: [
            {text: 'Hola, soy Mark, del equipo de fraude de su banco. Hemos detectado algunos pagos sospechosos en su cuenta. Antes de continuar, ¿puede confirmarme su nombre completo, su fecha de nacimiento y el número largo de su tarjeta bancaria?',
             q: 'El que llama dice que es de tu banco. ¿Qué haces?', options: [
                {t: 'Doy los datos, es del banco', why: 'Un banco que te llama nunca te pedirá el número completo de tu tarjeta. Así es como los estafadores consiguen tus datos.'},
                {t: 'Decir que llamarás a tu banco al número de tu tarjeta, y colgar', ok: true, why: 'Exacto. Llama al número de tu tarjeta, desde otro teléfono si puedes, o marca el 159.'},
                {t: 'Pedirle que demuestre quién es', why: 'Los estafadores suenan convincentes y a menudo ya conocen algunos de tus datos. Lo más seguro es colgar y llamar tú mismo a tu banco.'}]},
            {text: '¡Por favor, no cuelgue! Unos delincuentes le están quitando dinero de su cuenta ahora mismo. Tiene que pasar todo su dinero a una cuenta segura que yo le voy a abrir. Tenemos que hacerlo en los próximos diez minutos.',
             q: 'Dice que es urgente y que debes mover tu dinero. ¿Y ahora qué?', options: [
                {t: 'Mover el dinero rápido, antes de que sea tarde', why: 'No existe ninguna "cuenta segura". Tu banco nunca te pedirá que muevas dinero. Esta es la estafa.'},
                {t: 'Colgar. Un banco de verdad nunca te pide que muevas dinero a una "cuenta segura"', ok: true, why: 'Sí. La prisa y la "cuenta segura" lo delatan. Cuelga y marca el 159.'}]}],
         hang: 'Cuelga con el botón rojo.'},
        {letter: '?', color: '#64748b', name: 'Desconocido', number: '020 7946 0815', who: 'robot', tag: 'No está en tus contactos',
         intro: 'Otra llamada. <strong>Contesta.</strong>',
         lines: [
            {text: 'Este es un mensaje automático de H M R C. Se ha emitido una orden de detención contra usted por impuestos sin pagar. Para hablar con un agente, pulse 1 ahora.',
             q: 'Una voz grabada dice que te van a detener por impuestos. ¿Qué haces?', options: [
                {t: 'Pulsar 1 para arreglarlo', why: 'Pulsar 1 te pasa con los estafadores, que exigirán un pago, a menudo con tarjetas regalo. HMRC nunca amenaza con una detención en un mensaje grabado.'},
                {t: 'Colgar. HMRC no llama con amenazas de detención', ok: true, why: 'Correcto. HMRC te escribe primero y nunca amenaza con una detención por teléfono.'}]}],
         hang: 'Cuelga.'},
        {letter: '?', color: '#64748b', name: 'Desconocido', number: '0113 496 0332', who: 'm', tag: 'No está en tus contactos',
         intro: 'Vuelve a sonar tu móvil. <strong>Contesta.</strong>',
         lines: [
            {text: 'Hola, le llamo del departamento técnico de Windows. Su ordenador nos ha estado enviando mensajes de error y tiene un virus muy peligroso. Vaya a encender su ordenador y yo le ayudaré a solucionarlo.',
             q: 'Dice que tu ordenador tiene un virus. ¿Qué haces?', options: [
                {t: 'Encender el ordenador y seguir sus instrucciones', why: 'Te pediría que instalaras un programa que le deje controlar tu ordenador y luego te pediría dinero. Microsoft nunca llama así.'},
                {t: 'Colgar. Las empresas de informática no llaman por los virus', ok: true, why: 'Exacto. No dejes nunca que alguien que llama entre en tu ordenador.'},
                {t: 'Explicarle que no tienes ordenador', why: 'No hace falta explicar ni discutir. Simplemente cuelga.'}]}],
         hang: 'Cuelga.'},
        {letter: '?', color: '#64748b', name: 'Desconocido', number: '0808 157 0190', who: 'f', tag: 'No está en tus contactos',
         intro: 'Otra llamada. <strong>Contesta.</strong>',
         lines: [
            {text: 'Hola. Se ha realizado un pedido de un iPhone nuevo, por un importe de novecientas noventa y nueve libras, en su cuenta de compras en línea. Si no ha hecho usted este pedido, pulse 1 para cancelarlo y hablar con nuestro equipo.',
             q: 'Tú no has pedido ningún iPhone. ¿Qué haces?', options: [
                {t: 'Pulsar 1 para cancelar el pedido', why: 'Pulsar 1 te pasa con un estafador, que te "reembolsará" pidiéndote tus datos bancarios o el control de tu ordenador.'},
                {t: 'Colgar y luego comprobar tú mismo tu cuenta en la app o en la web', ok: true, why: 'Sí. Si de verdad hubiera un pedido, lo verías en tu cuenta. No uses nunca un número o un botón que te dé quien llama.'}]}],
         hang: 'Cuelga.'},
        {letter: 'S', color: '#16a34a', name: 'Centro de salud', number: '01632 960211', who: 'f', tag: 'Guardado en tus contactos',
         intro: 'Una llamada más: esta vez es el centro de salud, guardado en tus contactos. <strong>Contesta.</strong>',
         lines: [
            {text: 'Hola, soy Sue, del centro de salud. Solo un recordatorio rápido: su vacuna de la gripe está reservada para el martes a las diez en punto. No tiene que hacer nada. Si necesita cambiarla, llámenos al número de siempre. ¡Hasta luego!',
             q: '¿Es una estafa esta llamada?', options: [
                {t: 'Sí: colgar y bloquear el número', why: '¡Esta está bien! No te ha pedido nada, no te ha metido prisa y te ha dicho que uses el número de siempre.'},
                {t: 'Probablemente es auténtica: no ha pedido dinero ni datos, y ha dicho que llames al número de siempre', ok: true, why: 'Exacto. Las llamadas auténticas no te presionan. Si alguna vez dudas, vuelve a llamar al número que ya tienes.'}]}],
         hang: 'La llamada ha terminado. <strong>Toca el botón rojo</strong> para colgar.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Llamada ${n + 1} de ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'En la vida real, ¡no pasa nada por no contestar a números que no conoces! Para esta práctica, toca el botón verde para contestar.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: '¿Cuál de estas es una señal de llamada fraudulenta?', options: [
            {t: 'Que te metan prisa, te amenacen o te digan que lo mantengas en secreto', ok: true, why: 'Sí. La presión es lo que más delata. Quien llama de verdad no tiene problema en que te tomes tu tiempo y vuelvas a llamar.'},
            {t: 'Que quien llama sepa tu nombre', why: 'Los estafadores a menudo saben tu nombre, e incluso algunos datos de tu cuenta. Eso por sí solo no hace que una llamada sea auténtica.'},
            {t: 'Que el número parezca local', why: 'Los estafadores pueden hacer que cualquier número aparezca en tu pantalla, incluso uno local o el de tu banco. No te fíes del número.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>¡Muy bien!</strong> Has colgado a cuatro estafadores y has reconocido la llamada auténtica. Recuerda: si dudas, cuelga y vuelve a llamar a un número de confianza. Para tu banco, marca el 159.'},
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
            ios: ['iPhone', 'De Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola y otros'],
            windows: ['Windows', 'La mayoría de los portátiles y ordenadores de sobremesa'], mac: ['Mac', 'De Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu y otros'],
        };
        const notSure = isPC
            ? 'Mira tu pantalla. Windows tiene un botón Inicio (cuatro cuadraditos) abajo. Un Mac tiene el logotipo de Apple arriba a la izquierda. Linux Mint tiene un botón Menú abajo a la izquierda.'
            : 'Un iPhone tiene el logotipo de Apple (una manzana mordida) en la parte trasera. Si el tuyo no lo tiene, casi seguro que es un móvil Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>¿${isPC ? 'Qué ordenador usas' : 'Qué móvil tienes'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>¿No estás seguro?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Enséñame dónde</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Escuchar otra vez</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Un paso atrás</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Cambiar de ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">${isPC ? 'ORDENADOR' : 'TELÉFONO'} DE PRUEBA: no es real. Nada de lo que hagas aquí se envía a ningún sitio.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Desactivar la voz' : 'Activar la voz'; };
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
            showBtn.textContent = 'Volver a la lección';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Enséñame dónde';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? '¡Terminado!' : `Paso ${i + 1} de ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? '¡Correcto!' : 'Casi.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Continuar</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Inténtalo otra vez</button>${pageNext
                ? `<button type="button" class="ap vb">¡Buen trabajo! ${last ? 'Ahora termina el curso' : 'Prueba la siguiente lección'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Casi. ' + (step.hint || 'Vuelve a mirar las instrucciones.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Todavía no. Vuelve a mirar las instrucciones.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Casi. ' + (step.hint || 'Vuelve a mirar las instrucciones.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Aplicación (app)';
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
                else hint.textContent = 'Haz clic derecho en él: pulsa el botón derecho del ratón. En un panel táctil de Mac, haz clic con dos dedos. En una pantalla táctil, mantén pulsado.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Mantén el dedo (o el botón del ratón) pulsado sobre él hasta que pase algo.';
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
                showBtn.textContent = 'Enséñame dónde';
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
