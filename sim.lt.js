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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play parduotuvė'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Telefonas', '#22c55e', ICON.phone], ['messages', 'Žinutės', '#22c55e', ICON.bubble], ['camera', 'Fotoaparatas', '#6b7280', ICON.camera],
               ['photos', 'Nuotraukos', '#e5e7eb', ICON.photos], ['mail', 'Paštas', '#3b82f6', ICON.mail], ['clock', 'Laikrodis', '#111827', ICON.clock],
               ['weather', 'Orai', '#38bdf8', ICON.weather], ['maps', 'Žemėlapiai', '#22c55e', ICON.map], ['settings', 'Nustatymai', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Telefonas', '#2563eb', ICON.phone], ['messages', 'Žinutės', '#3b82f6', ICON.bubble], ['camera', 'Fotoaparatas', '#6b7280', ICON.camera],
               ['photos', 'Nuotraukos', '#e5e7eb', ICON.photos], ['clock', 'Laikrodis', '#111827', ICON.clock], ['maps', 'Žemėlapiai', '#16a34a', ICON.map],
               ['settings', 'Nustatymai', '#475569', ICON.settings], ['weather', 'Orai', '#38bdf8', ICON.weather], ['mail', 'El. paštas', '#ef4444', ICON.mail],
               ['store', 'Play parduotuvė', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Braukite žemyn iš viršutinio dešiniojo kampo ⟦chevron-down⟧' : 'Braukite žemyn iš viršaus ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Šiandien</div>
                <div class="hp"><span>RODOMA</span><strong>Šios savaitės mėgstamiausios programos</strong></div>
                <div class="hp alt"><span>PRADĖKITE</span><strong>Idėjos jūsų naujam „iPhone“</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Šiandien</button><button type="button" data-tap="games">Žaidimai</button>
                    <button type="button" data-tap="apps">Programos</button><button type="button" data-tap="search-tab">${ICON.search}Paieška</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Ieškoti programų ir žaidimų</span></button>
            <div class="tg"><span class="on">Jums</span><span>Populiariausios</span><span>Vaikams</span></div>
            <div class="hp"><span>SIŪLOME JUMS</span><strong>Programos pradžiai</strong></div>
            <div class="hp alt"><span>POPULIARU</span><strong>Palaikykite ryšį</strong></div>
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
        const btnLabel = p === 'ios' ? 'Gauti' : 'Įdiegti';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 mlrd.+ atsisiuntimų' : 'Socialiniai tinklai'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Nemokama</span></div></div>
                <p class="agm">Tikrame „iPhone“ gali tekti du kartus paspausti šoninį mygtuką, pažiūrėti į ekraną dėl Face ID arba čia įvesti „Apple“ paskyros slaptažodį.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Įdiegti</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Atšaukti</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Sveiki atvykę į „WhatsApp“</h3>
            <p>Perskaitykite mūsų <u>Privatumo politiką</u>. Palieskite „Sutinku ir tęsti“, kad sutiktumėte su <u>Paslaugų teikimo sąlygomis</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Sutinku ir tęsti</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Įveskite savo telefono numerį</h3>
            <p>„WhatsApp“ reikės patikrinti jūsų telefono numerį. Gali būti taikomi operatoriaus mokesčiai.</p>
            <div class="abt">Jungtinė Karalystė <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Pirmyn</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Ar šis numeris teisingas?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Redaguoti</button><button type="button" data-tap="yes">${ios ? 'Taip' : 'Gerai'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>ŽINUTĖS · dabar</strong><span>Jūsų „WhatsApp“ kodas: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Niekam neduokite šio kodo.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Tikrinamas jūsų numeris</h3>
            <p>Laukiama, kol bus automatiškai aptiktas 6 skaitmenų kodas, išsiųstas SMS žinute numeriu <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Negavote kodo?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['„WhatsApp“ norėtų pasiekti jūsų kontaktus', 'Kad matytumėte, kurie jūsų draugai naudojasi „WhatsApp“.', 'Leisti „WhatsApp“ pasiekti jūsų kontaktus?']
            : ['„WhatsApp“ norėtų siųsti jums pranešimus', 'Kad žinotumėte, kai ateina nauja žinutė.', 'Leisti „WhatsApp“ siųsti jums pranešimus?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Profilio informacija</h3>
            <p>Įveskite savo vardą ir, jei norite, pridėkite profilio nuotrauką.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Jūsų vardas</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Pirmyn</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Pokalbiai' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Viskas paruošta${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Čia atsiras jūsų pokalbiai. Palieskite naujo pokalbio mygtuką, kad parašytumėte kam nors iš savo kontaktų.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Tai jūsų telefono pradžios ekranas. Programos atsisiunčiamos iš <strong>${store}</strong>. Tai nemokama ir saugi vieta programoms gauti. <strong>Palieskite ${store}.</strong>`,
                 hint: `Ieškokite ${store} piktogramos. ${p === 'ios' ? "Ji mėlyna su balta raide A." : "Tai spalvotas trikampis."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Dabar reikia surasti „WhatsApp“. <strong>Palieskite Paieška</strong> apačioje dešinėje.' : 'Dabar reikia surasti „WhatsApp“. <strong>Palieskite paieškos juostą</strong> viršuje.',
                 hint: p === 'ios' ? 'Paieška yra didinamasis stiklas apačioje dešinėje.' : 'Paieškos juostoje parašyta „Ieškoti programų ir žaidimų“.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Įvedėme jums <em>whatsapp</em>. Atsiranda pasiūlymų sąrašas. <strong>Palieskite „whatsapp messenger“.</strong>",
                 hint: 'Palieskite pasiūlymą „whatsapp messenger“.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Atsargiai: kai kurios programos apsimeta „WhatsApp“. Tikroji vadinasi <strong>WhatsApp Messenger</strong>, ją sukūrė <strong>WhatsApp Inc.</strong>, ir ji nemokama. <strong>Palieskite ${p === 'ios' ? 'Gauti' : 'Įdiegti'} prie tikrosios.</strong>`,
                 hints: {'fake1-get': 'Tai „WhatsUp Chat Free“ iš Fun Apps Ltd. Tai klastotė, o žyma „Reklama“ rodo, kad tai reklama. Patikrinkite pavadinimą ir kas ją sukūrė.',
                         'fake2-get': 'Tai „WA Messenger for Chat Pro“ iš LuckyDev Studio, nusikopijavimas. Tikrąją sukūrė WhatsApp Inc.'},
                 hint: 'Raskite „WhatsApp Messenger“, kurią sukūrė „WhatsApp Inc.“'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: '„iPhone“ prieš įdiegdamas patikrina, ar tikrai jūs. Tikrame „iPhone“ galite naudoti <strong>Face ID</strong>, <strong>piršto atspaudą</strong> (Touch ID) arba <strong>„Apple“ paskyros slaptažodį</strong>. Čia tiesiog <strong>palieskite Įdiegti.</strong>',
                    hints: {'sheet-cancel': 'Atšaukimas sustabdytų atsisiuntimą. Verčiau palieskite Įdiegti.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Atsisiunčiama. Kai baigsis, mygtukas pasikeis į <strong>Atidaryti</strong>. <strong>Palieskite Atidaryti.</strong>`,
                 hint: 'Palaukite, kol mygtukas parodys Atidaryti, tada jį palieskite.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: '„WhatsApp“ atsidaro pirmą kartą. Jis prašo sutikti su sąlygomis. <strong>Palieskite „Sutinku ir tęsti“.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: '„WhatsApp“ naudoja jūsų mobiliojo ryšio numerį, kad draugai galėtų jus rasti. <strong>Palieskite telefono numerio laukelį</strong> ir mes įrašysime mokomąjį numerį.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Tikrame telefone įvestumėte savo mobiliojo ryšio numerį. Čia naudojame išgalvotą: <strong>07700 900123</strong>. <strong>Palieskite Pirmyn.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `„WhatsApp“ patikrina, ar jį įvedėte teisingai. Šis teisingas, todėl <strong>palieskite ${p === 'ios' ? 'Taip' : 'Gerai'}.</strong>`,
                 hints: {edit: `Palieskite Redaguoti, jei suklystumėte. Šis numeris teisingas, todėl palieskite ${p === 'ios' ? 'Taip' : 'Gerai'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? '„WhatsApp“ atsiunčia SMS su 6 skaitmenų kodu, kad patikrintų, ar numeris jūsų. „iPhone“ pasiūlo jį įrašyti už jus. <strong>Palieskite kodą virš klaviatūros.</strong>'
                    : '„WhatsApp“ atsiunčia SMS su 6 skaitmenų kodu, kad patikrintų, ar numeris jūsų. Daugelis „Android“ telefonų jį įrašo patys. Jei jūsiškis neįrašo, <strong>palieskite žinutę</strong> viršuje.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Kol nustatinėjate, draugas parašo jums: <em>„Labas! Per klaidą atsiunčiau tau 6 skaitmenų kodą, gali jį man grąžinti?“</em> Ką darote?',
                    options: [
                        {t: 'Išsiunčiu, juk tai draugas', why: 'Tai dažnas sukčiavimas. Kažkas užvaldė jūsų draugo paskyrą, ir tas kodas atiduotų jiems ir jūsų paskyrą.'},
                        {t: 'Nesiunčiu. Niekas neturėtų jo prašyti', ok: true, why: 'Būtent. Tas kodas yra raktas nuo jūsų „WhatsApp“. Niekam jo neduokite, net draugui ar žmogui, sakančiam, kad yra iš „WhatsApp“.'},
                        {t: 'Išsiunčiu tik pirmus 3 skaitmenis', why: 'Net dalis kodo sukčiui padeda. Niekada neduokite nė dalies.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: '„WhatsApp“ prašo leidimo matyti jūsų kontaktus, kad galėtų parodyti, kurie draugai juo naudojasi. <strong>Palieskite Leisti.</strong>',
                 hints: {deny: 'Galite nuspręsti neleisti, bet tada „WhatsApp“ negalės parodyti draugų vardų. Šiai pratybai palieskite Leisti.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Pranešimai praneša, kai ateina žinutė, net kai „WhatsApp“ uždarytas. <strong>Palieskite Leisti.</strong>',
                 hints: {deny: 'Be pranešimų nesužinosite, kai kas nors jums parašys. Šiai pratybai palieskite Leisti.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Paskutinis žingsnis: jūsų vardą mato draugai. <strong>Įveskite savo vardą laukelyje</strong>, tada <strong>palieskite Pirmyn</strong>. (Jis lieka šiame puslapyje ir niekur nesiunčiamas.)',
                 hints: {photo: 'Tikroje programoje nuotrauką galite pasirinkti dabar arba pridėti vėliau Nustatymuose. Kol kas praleiskime: įveskite vardą ir palieskite Pirmyn.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Šaunu, „WhatsApp“ nustatytas!</strong> Čia atsiras jūsų pokalbiai. Per kitas pamokas išsiųsite savo pirmą žinutę.'},
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
            const lockName = ctx.touch ? 'Touch ID ir kodas' : 'Face ID ir kodas';
            const groups = [
                [['airplane', 'Lėktuvo režimas', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Mobilusis ryšys', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Pranešimai', '#ef4444', '⟦bell⟧'], ['sounds', 'Garsai ir haptika', '#ec4899', '⟦volume-2⟧'], ['focus', 'Fokusavimas', '#6366f1', '⟦moon⟧']],
                [['general', 'Bendra', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Prieinamumas', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence ir Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Ekranas ir ryškumas', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Pagalbos SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Privatumas ir sauga', '#3b82f6', '⟦hand⟧'], ['battery', 'Akumuliatorius', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Programos', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>„Apple“ paskyra, iCloud ir kt.</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Tinklas ir internetas', 'Mobilusis, Wi-Fi, viešosios prieigos taškas'], ['devices', 'Prijungti įrenginiai', 'Bluetooth, susiejimas'],
            ['apps', 'Programos', 'Naujausios programos, numatytosios programos'], ['notifications', 'Pranešimai', 'Pranešimų istorija'], ['battery', 'Akumuliatorius', '85%'], ['storage', 'Saugykla', '91% used'],
            ['sound', 'Garsas ir vibracija', 'Garsumas, haptika'], ['display', 'Ekranas ir lietimas', 'Tamsioji tema, šrifto dydis'],
            ['accessibility', 'Prieinamumas', 'Ekranas, sąveika, garsas'], ['security', 'Sauga ir privatumas', 'Programų sauga, įrenginio užraktas, leidimai'],
            ['location', 'Vieta', 'Įjungta'], ['safety', 'Sauga ir kritinė padėtis', 'Pagalbos SOS, medicininė informacija, įspėjimai'],
            ['google', 'Google', 'Paslaugos ir nuostatos'], ['system', 'Sistema', 'Kalbos, laikas, programinės įrangos naujiniai']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID ir kodas' : 'Face ID ir kodas';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>1 pirštas</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Atkurti Face ID</span></div><div class="cj ex"><span>Nustatyti alternatyvią išvaizdą</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Išjungti kodą</span></div><div class="cj ex"><span>Keisti kodą</span></div>'
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

    const androidSecurity = () => androidList('Sauga ir privatumas', [
        ['device-unlock', 'Įrenginio atrakinimas', 'Ekrano užraktas, atrakinimas veidu ir piršto atspaudu'], ['app-security', 'Programų sauga', 'Nuskaityti programas dėl žalingo elgesio'],
        ['theft', 'Apsauga nuo vagystės', 'Užrakinkite telefoną, jei jis pavogtas'], ['privacy', 'Privatumas', 'Leidimai, paskyros veikla']]);
    const androidDeviceUnlock = ctx => androidList('Įrenginio atrakinimas', [
        ['screen-lock', 'Ekrano užraktas', ctx.passcodeSet ? 'PIN kodas' : 'Nėra'], ['face-finger', 'Atrakinimas veidu ir piršto atspaudu', ctx.faceDone || ctx.fingerDone ? 'Nustatyti' : 'Nustatykite, kad atrakintumėte greičiau']]);
    const androidFaceFinger = ctx => androidList('Atrakinimas veidu ir piršto atspaudu', [
        ['face-unlock', 'Atrakinimas veidu', ctx.faceDone ? 'Veidas pridėtas' : 'Nustatyti'], ['fingerprint-unlock', 'Atrakinimas piršto atspaudu', ctx.fingerDone ? '1 fingerprint' : 'Nustatyti']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Pirmasis Face ID nuskaitymas baigtas.' : 'Face ID dabar nustatytas.') : 'Veidas pridėtas';
        const btn = p === 'ios' ? (first ? 'Tęsti' : 'Atlikta') : 'Atlikta';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Lėtai judinkite galvą, kad užbaigtumėte apskritimą.' : 'Laikykite veidą apskritime ir lėtai judinkite galvą.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Baigta' : 'Pakoreguokite laikymą') : (stage === 'grip' ? 'Pakoreguokite laikymą' : 'Padėkite pirštą'))
            : (ready ? 'Piršto atspaudas pridėtas' : 'Palieskite jutiklį');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Dabar savo „iPhone“ galite atrakinti piršto atspaudu.' : 'Dabar padėkite piršto galiuko kraštus ant pradžios mygtuko.')
                     : (stage === 'grip' ? 'Padėkite piršto galiuko kraštus ant pradžios mygtuko.' : 'Kelis kartus pakelkite ir vėl padėkite pirštą ant pradžios mygtuko.'))
            : (ready ? 'Dabar telefoną galite atrakinti piršto atspaudu.' : 'Palieskite jutiklį, pakelkite ir vėl palieskite, kol piršto atspaudas užsipildys.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Tęsti' : 'Atlikta'}</button>` : sensor}
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
                 say: 'Kodas, Face ID ir Touch ID yra programoje <strong>Nustatymai</strong>. <strong>Palieskite Nustatymai</strong> (pilkas krumpliaratis).',
                 hint: 'Nustatymai yra pilka piktograma su krumpliaračiu.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Jei reikia, slinkite sąrašu žemyn ir <strong>palieskite ${ctx.touch ? 'Touch ID ir kodas' : 'Face ID ir kodas'}</strong>.`,
                 hint: `Ieškokite „${ctx.touch ? 'Touch ID ir kodas' : 'Face ID ir kodas'}“ žemiau Ekranas ir ryškumas.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Ekrano užraktas, atrakinimas veidu ir piršto atspaudai yra programoje <strong>Nustatymai</strong>. <strong>Palieskite Nustatymai</strong> (krumpliaratis).',
             hint: 'Nustatymai yra piktograma su krumpliaračiu.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Jei reikia, slinkite žemyn ir <strong>palieskite Sauga ir privatumas</strong>. <em>„Samsung“ telefone tai vadinasi Sauga ir privatumas, tada Biometriniai duomenys arba Užrakinimo ekranas.</em>',
             hint: 'Ieškokite „Sauga ir privatumas“ netoli sąrašo apačios.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Palieskite Įrenginio atrakinimas.</strong>',
             hint: 'Tai pirmoji parinktis, „Įrenginio atrakinimas“.'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Įveskite kodą' : 'Įveskite savo PIN', p === 'ios' ? '' : 'Norėdami tęsti, įveskite savo PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}Telefonas pirmiausia patikrina, ar tai jūs. <strong>Įveskite mokomąjį kodą: ${codeText}</strong>. <em>Niekada neįveskite tikrojo kodo svetainėje.</em>`,
        hint: `Įveskite mokomąjį kodą ${codeText} po vieną skaitmenį.`,
    });

    const safestQuestion = {
        q: 'Kuris iš šių būtų <strong>saugiausias</strong> kodas?',
        options: [
            {t: '123456', why: '123456 yra dažniausiai naudojamas kodas, todėl tai vienas pirmųjų, kuriuos išbandytų vagis.'},
            {t: 'Jūsų gimtadienis, pvz., 140352', why: 'Gimtadienius lengva sužinoti iš socialinių tinklų, atvirukų ar pašto. Venkite datų, kurios kažką reiškia.'},
            {t: 'Šeši skaitmenys, kurie niekam kitam nieko nereiškia', ok: true, why: 'Būtent. Atsitiktinius skaičius, kurie nėra data, šablonas ar pasikartojimas, sunkiausia atspėti.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Šis telefonas dar neturi kodo, todėl bet kas galėtų jį atidaryti. <strong>Palieskite Įjungti kodą.</strong>',
                 hints: {stolen: 'Apsauga nuo pavogto įrenginio aprašyta 4 pamokoje. Pirmiausia įjunkite kodą.'}},
                {screen: c => codeScreen(p, c, 'Nustatyti kodą', 'Įveskite kodą', '<p class="aeh">Kodo parinktys</p>'), sequence: CODE_KEYS,
                 say: `Pasirinkite 6 skaitmenis, kuriuos prisiminsite. Šiai pratybai <strong>įveskite ${codeText}</strong>. <em>Prašome čia neįvesti tikrojo kodo.</em>`,
                 hint: `Įveskite ${codeText} po vieną skaitmenį.`},
                {screen: c => codeScreen(p, c, 'Nustatyti kodą', 'Dar kartą įveskite naująjį kodą'), sequence: CODE_KEYS,
                 say: `„iPhone“ paprašo dar kartą, kad įsitikintų, jog nesuklydote. <strong>Dar kartą įveskite ${codeText}.</strong>`,
                 hint: `Dar kartą įveskite ${codeText}.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Šaunu, jūsų mokomasis telefonas dabar turi kodą!</strong> Tikrame „iPhone“ šiuo metu taip pat gali tekti įvesti „Apple“ paskyros slaptažodį.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Ekrano užraktas rodo <strong>Nėra</strong>, todėl bet kas galėtų atidaryti šį telefoną. <strong>Palieskite Ekrano užraktas.</strong>'},
            {screen: () => androidList('Pasirinkite ekrano užraktą', [['none', 'Nėra'], ['swipe', 'Perbraukimas'], ['pattern', 'Raštas'], ['pin', 'PIN kodas'], ['password', 'Slaptažodis']]),
             target: 'pin', say: 'Yra keli pasirinkimai. <strong>PIN</strong> (skaitmenys) yra paprastas ir saugus. <strong>Palieskite PIN.</strong>',
             hints: {none: 'Nėra reiškia, kad bet kas gali atidaryti jūsų telefoną.', swipe: 'Perbraukimas telefoną tiesiog atidaro perbraukus, todėl nieko neapsaugo.',
                     pattern: 'Raštą galima atspėti iš pirštų paliktų dėmių ekrane. PIN saugesnis.',
                     password: 'Slaptažodis irgi tinka, bet PIN greičiau įvesti kasdien. Šiai pratybai palieskite PIN.'}},
            {screen: c => codeScreen(p, c, 'Pasirinkite PIN', 'PIN turi būti bent 4 skaitmenų'), sequence: CODE_KEYS,
             say: `6 skaitmenys saugesni nei 4. Šiai pratybai <strong>įveskite ${codeText}</strong>. <em>Prašome čia neįvesti tikrojo PIN.</em>`,
             hint: `Įveskite ${codeText} po vieną skaitmenį.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Pasirinkite PIN', 'PIN turi būti bent 4 skaitmenų', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Palieskite Pirmyn.</strong>'},
            {screen: c => codeScreen(p, c, 'Dar kartą įveskite PIN', ''), sequence: CODE_KEYS,
             say: `Telefonas paprašo dar kartą, kad įsitikintų, jog nesuklydote. <strong>Dar kartą įveskite ${codeText}.</strong>`, hint: `Dar kartą įveskite ${codeText}.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Dar kartą įveskite PIN', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Palieskite Patvirtinti.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Pranešimai užrakinimo ekrane', [['show-all', 'Rodyti visą pranešimų turinį'], ['hide-sensitive', 'Slėpti neskelbtiną turinį'], ['dont-show', 'Visai nerodyti pranešimų']], false),
             target: 'hide-sensitive',
             say: 'Telefonas klausia, ką rodyti užrakintame ekrane. <strong>Slėpti neskelbtiną turinį</strong> yra geras pasirinkimas: pamatysite, kad atėjo žinutė, bet ne tai, ką ji sako. <strong>Palieskite tai.</strong>',
             hints: {'show-all': 'Tai parodo viską, įskaitant banko kodus, bet kam, kas paimtų jūsų telefoną. Palieskite „Slėpti neskelbtiną turinį“.',
                     'dont-show': 'Tai tinka, bet nematysite, kada ateina žinutės. Šiai pratybai palieskite „Slėpti neskelbtiną turinį“.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Šaunu, jūsų mokomasis telefonas dabar turi PIN!</strong> Ekrano užrakte dabar rodoma PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Palieskite Nustatyti Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Kaip nustatyti Face ID</strong>
                    <p>Pirmiausia nustatykite veidą kameros kadre. Tada judinkite galvą ratu, kad būtų parodyti visi jūsų veido kampai.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Pradėti</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Laikykite telefoną prieš veidą, maždaug ištiestos rankos atstumu, tarsi darytumėte asmenukę. <strong>Palieskite Pradėti.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Tikrame „iPhone“ dabar <strong>lėtai judinate galvą ratu</strong>, tarsi nosimi piešdami apskritimą. Skenuojant žiedas pildosi. Kai baigsis, <strong>palieskite Tęsti</strong>.',
                 hint: 'Palaukite, kol apskritimas užsipildys, tada palieskite Tęsti.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Skenuojama antrą kartą, kad būtų tikrai tiksliai. Dar kartą judinkite galvą ratu. Kai baigsis, <strong>palieskite Atlikta</strong>.',
                 hint: 'Palaukite, kol apskritimas užsipildys, tada palieskite Atlikta.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Draugas prašo pridėti <em>savo</em> veidą į jūsų telefoną „tik tuo atveju“. Ką darote?',
                    options: [
                        {t: 'Leidžiu, tai patogu', why: 'Bet kas, kieno veidas nustatytas, gali atidaryti jūsų telefoną ir patvirtinti mokėjimus jūsų programose. Nustatykite tik savo veidą.'},
                        {t: 'Sakau ne. Telefoną turėtų atrakinti tik mano veidas', ok: true, why: 'Būtent. Jei kas nors, kuo pasitikite, turi patekti į telefoną, geriau pasidalykite su juo kodu ir prireikus vėliau jį pakeiskite.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Šaunu, Face ID nustatytas!</strong> Dabar telefoną galite atrakinti vos į jį pažiūrėję, tada perbraukę aukštyn.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Palieskite Atrakinimas veidu ir piršto atspaudu.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Palieskite Atrakinimas veidu.</strong>',
             hints: {'fingerprint-unlock': 'Tai piršto atspaudai, apie kuriuos 3 pamoka. Kol kas palieskite Atrakinimas veidu.'}},
            {screen: () => consent(p, 'Atrakinkite veidu', 'Naudokite veidą telefonui atrakinti ir programose patvirtinti, kad tai jūs. Jūsų veidas saugomas tik šiame telefone.', 'Sutinku'),
             target: 'agree', say: 'Telefonas paaiškina, kaip naudoja jūsų veidą. <strong>Palieskite Sutinku.</strong>',
             hints: {cancel: 'Atšaukimas sustabdytų nustatymą. Palieskite Sutinku, kad tęstumėte.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Laikykite telefoną akių lygyje, maždaug ištiestos rankos atstumu. Tikrame telefone <strong>laikote veidą apskritime ir lėtai judinate galvą</strong>. Kai baigsis, <strong>palieskite Atlikta</strong>.',
             hint: 'Palaukite, kol apskritimas užsipildys, tada palieskite Atlikta.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Daugelyje „Android“ telefonų atrakinimas veidu yra mažiau saugus nei piršto atspaudas. Ką tai reiškia jums?',
                options: [
                    {t: 'Tinka viskam', why: 'Daugelyje telefonų atrakinimas veidu naudoja paprastą kamerą, kurią lengviau apgauti. Dėl to kai kurios banko programos jo nepriima.'},
                    {t: 'Naudoju atrakinimui, o bankininkystei – piršto atspaudą ar PIN, jei to prašo bankas', ok: true, why: 'Teisingai. Telefonas pasakys, ar atrakinimą veidu galima naudoti mokėjimams ir bankininkystei. Jei ne, naudokite piršto atspaudą ar PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Šaunu, atrakinimas veidu nustatytas!</strong> Dabar telefoną galite atrakinti į jį pažiūrėję.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Palieskite Pridėti piršto atspaudą…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID naudoja <strong>pradžios mygtuką</strong> senesnių „iPhone“ priekyje, pvz., „iPhone SE“. <strong>Šešis kartus palieskite pradžios mygtuką mokomojo telefono apačioje</strong>, tarsi pakeltumėte ir vėl padėtumėte pirštą.',
                 hint: 'Palieskite apvalų pradžios mygtuką mokomojo telefono apačioje.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Dabar reikia piršto galiuko kraštų. <strong>Palieskite Tęsti.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Tikrame „iPhone“ ant mygtuko dedate piršto <strong>šonus ir galiuką</strong>. <strong>Dar 4 kartus palieskite pradžios mygtuką.</strong>',
                 hint: 'Palieskite apvalų pradžios mygtuką apačioje.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Viskas. <strong>Palieskite Tęsti.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Kurį pirštą geriausia pridėti pirmiausia?',
                    options: [
                        {t: 'Nykštį ar pirštą, kuriuo dažniausiai laikote telefoną', ok: true, why: 'Taip. Esant pradžios mygtukui, tai dažniausiai nykštys. Galite pridėti iki 5 pirštų, todėl verta pridėti abu nykščius.'},
                        {t: 'Bet kurį pirštą, nesvarbu', why: 'Veikia su bet kuriuo pirštu, bet pasirinkite tą, kuris natūraliai atsiduria ant mygtuko, kai paimate telefoną, dažniausiai nykštį.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Šaunu, jūsų piršto atspaudas nustatytas!</strong> Atrakinimui padėkite pirštą ant pradžios mygtuko. Panašiai galite pridėti ir daugiau pirštų.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Palieskite Atrakinimas veidu ir piršto atspaudu.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Palieskite Atrakinimas piršto atspaudu.</strong>',
             hints: {'face-unlock': 'Tai atrakinimas veidu, apie kurį 2 pamoka. Kol kas palieskite Atrakinimas piršto atspaudu.'}},
            {screen: () => consent(p, 'Atrakinkite piršto atspaudu', 'Naudokite piršto atspaudą telefonui atrakinti arba patvirtinti, kad tai jūs, pavyzdžiui, prisijungiant prie programų. Jūsų piršto atspaudas saugomas tik šiame telefone.', 'Sutinku'),
             target: 'agree', say: '<strong>Palieskite Sutinku.</strong>', hints: {cancel: 'Atšaukimas sustabdytų nustatymą. Palieskite Sutinku, kad tęstumėte.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Jutiklis gali būti ekrane, telefono nugarėlėje arba maitinimo mygtuke, o telefonas parodo, kur. Čia jis ekrane. <strong>Šešis kartus palieskite jutiklį</strong>, tarsi pakeltumėte ir vėl padėtumėte pirštą.',
             hint: 'Palieskite apvalų jutiklį netoli ekrano apačios.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Jūsų piršto atspaudas įrašytas. <strong>Palieskite Atlikta.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Kurį pirštą geriausia pridėti pirmiausia?',
                options: [
                    {t: 'Pirštą, kuris natūraliai paliečia jutiklį, kai paimate telefoną', ok: true, why: 'Taip. Jei jutiklis gale, tai dažniausiai smiliaus, o jei ekrane ar šone, tai nykštys. Galite pridėti ne vieną.'},
                    {t: 'Bet kurį pirštą, nesvarbu', why: 'Tinka bet kuris pirštas, bet pasirinkite tą, kuris natūraliai atsiduria ant jutiklio. Taip atrakinti greita ir lengva.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Šaunu, jūsų piršto atspaudas nustatytas!</strong> Atrakinimui palieskite jutiklį. Panašiai galite pridėti ir daugiau pirštų.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Saulėgrąžos sode', '#fde68a'], ['🐶', 'Šuo ant sofos', '#fecaca'], ['🏖️', 'Diena paplūdimyje', '#bae6fd'],
                    ['🎂', 'Gimtadienio tortas', '#fbcfe8'], ['🌅', 'Saulėlydis virš jūros', '#fed7aa'], ['🐈', 'Miegantis katinas', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Perskaityta' : state === 'sent' ? 'Išsiųsta' : 'Pristatyta'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Labas, mama, čia aš! Naujas numeris, senas telefonas sugedo…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Šeima', last: 'Dave: Kas atneš tortą? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Iki pasimatymo ketvirtadienį!', time: 'Vakar', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Labas, mama! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Naujas pokalbis' : 'Pasirinkite kontaktą'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Šeima', '#f59e0b', 'Dave, Jean, Sarah, Jūs'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Pridėti (pliusas)' : 'Pridėti priedą (sąvaržėlė)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Šio numerio nėra jūsų kontaktuose.</p><div><button type="button" data-tap="block">Blokuoti</button><button type="button" data-tap="add-contact">Pridėti</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Nuotraukos' : 'Galerija'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Užblokuoti +44 7700 900842?</strong></p><p class="fd">Užblokuoti kontaktai negali jums skambinti ar siųsti žinučių.</p>
                <p class="fd">⟦square-check⟧ Pranešti „WhatsApp“</p>
                <div class="et"><button type="button" data-tap="cancel">Atšaukti</button><button type="button" data-tap="confirm-block">Blokuoti</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Naujausi' : 'Galerija'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Skambinama…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Įjungti garsą' : 'Nutildyti'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Nutildyta 1 savaitei' : 'Išjungta'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Nutildyti pranešimus…</strong></p>
                <button type="button" data-tap="mute-8h">8 valandoms</button><button type="button" data-tap="mute-week">1 savaitei</button><button type="button" data-tap="mute-always">Visam laikui</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Nustatymai', [['account', 'Paskyra', 'Saugos pranešimai, numerio keitimas'], ['privacy', 'Privatumas', 'Kontaktų blokavimas, išnykstančios žinutės'],
                ['chats', 'Pokalbiai', 'Tema, ekrano fonai'], ['notifications', 'Pranešimai', 'Žinučių, grupių ir skambučių melodijos']]],
            account: ['Paskyra', [['twostep', 'Dviejų veiksmų patvirtinimas', ctx.twoStep ? 'Įjungta' : 'Išjungta'], ['change-number', 'Keisti numerį', ''], ['delete-account', 'Ištrinti paskyrą', '']]],
            privacy: ['Privatumas', [['last-seen', 'Paskutinį kartą prisijungta ir prisijungęs', 'Visi'], ['profile-photo', 'Profilio nuotrauka', 'Visi'],
                ['groups', 'Grupės', ctx.groupsSetting || 'Visi'], ['blocked', 'Užblokuoti kontaktai', ctx.blocked ? '1' : 'Nėra']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Kas gali mane pridėti į grupes</strong></p>
                <button type="button" data-tap="groups-everyone">Visi</button><button type="button" data-tap="groups-contacts">Mano kontaktai</button>
                <button type="button" data-tap="groups-except">Mano kontaktai, išskyrus…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Dviejų žingsnių patvirtinimas</h3><p>Dėl papildomo saugumo įjunkite dviejų žingsnių patvirtinimą, kuriam reikės PIN, kai vėl registruosite telefono numerį „WhatsApp“.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Įjungti</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Pridėkite el. pašto adresą</h3>
                <p>Pridėkite el. pašto adresą, kad galėtumėte atkurti PIN, jei jį pamirštumėte.</p>
                <div class="tk ex">jūsų el. pašto adresas</div>
                <button type="button" class="ce ox" data-tap="email-next">Pirmyn</button>
                <button type="button" class="cp wd" data-tap="skip">Praleisti</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Dviejų žingsnių patvirtinimas įjungtas</h3><p>Jūsų paprašys PIN, jei nustatysite „WhatsApp“ naujame telefone.</p>
                <button type="button" class="ce ox" data-tap="done">Atlikta</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Sukurkite 6 skaitmenų PIN' : 'Patvirtinkite PIN'}</strong>
            <p>${stage === 'pin' ? 'Jo reikės norint nustatyti „WhatsApp“ naujame telefone.' : 'Įveskite tą patį PIN dar kartą.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Tai jūsų pokalbių sąrašas. Norėdami pradėti naują, <strong>palieskite naujo pokalbio mygtuką</strong> (pieštukas viršuje dešinėje).'
                          : 'Tai jūsų pokalbių sąrašas. Norėdami pradėti naują, <strong>palieskite žalią + mygtuką</strong> apačioje dešinėje.',
         hints: {'chat-family': 'Tai atidaro esamą pokalbį. Verčiau pradėkite naują.', 'chat-jean': 'Tai atidaro esamą pokalbį. Verčiau pradėkite naują.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: '„WhatsApp“ parodo jūsų kontaktus, kurie juo naudojasi. <strong>Palieskite Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Pirmiausia laukelyje įrašykite žinutę, tada palieskite siuntimo rodyklę.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Labas, mama! 😊 Malonu girdėti!', n: 2}); },
         say: '<strong>Palieskite žinutės laukelį</strong> apačioje, <strong>įrašykite trumpą žinutę</strong> (pvz., „Labas!“), tada <strong>palieskite siuntimo rodyklę</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Mikrofonas skirtas balso žinutėms, apie kurias netrukus. Pirmiausia įrašykite žinutę ir palieskite siuntimo rodyklę.', attach: 'Tai skirta nuotraukoms, apie kurias netrukus. Pirmiausia įrašykite žinutę ir palieskite siųsti.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah atsakė! Po jūsų žinute yra <strong>dvi mėlynos varnelės ⟦check-check⟧</strong>. Ką jos reiškia?',
            options: [
                {t: 'Žinutės nepavyko išsiųsti', why: 'Neišsiųsta žinutė rodo mažą laikrodį ar raudoną įspėjimą. Varnelės reiškia, kad pavyko.'},
                {t: 'Sarah ją perskaitė', ok: true, why: 'Taip! Viena pilka varnelė reiškia išsiųsta, dvi pilkos – pristatyta į jos telefoną, o dvi mėlynos – ji perskaitė.'},
                {t: 'Ji išsiųsta du kartus', why: 'Ne, ji išsiųsta tik vieną kartą. Dvi mėlynos varnelės reiškia, kad ji perskaityta.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Dabar išsiųskite nuotrauką. <strong>Palieskite ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> šalia žinutės laukelio.`,
         hints: {camera: 'Fotoaparatas padaro naują nuotrauką. Norėdami išsiųsti jau padarytą, palieskite ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Palieskite ${p === 'ios' ? 'Nuotraukos' : 'Galerija'}</strong>, kad pasirinktumėte iš telefone esančių nuotraukų.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Tai (apsimestinės) nuotraukos jūsų telefone. <strong>Palieskite saulėgrąžas</strong> 🌻.',
         hint: 'Palieskite nuotrauką su saulėgrąžomis.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Nuostabu! 🌻 Ar tai iš jūsų sodo?', n: 4}); },
         say: 'Jei norite, galite įrašyti parašą. Tada <strong>palieskite siuntimo rodyklę</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Balso žinutės patogios, kai rašyti sunku. Tikrame telefone, kol kalbate, <strong>paspaudžiate ir laikote mikrofoną</strong> ⟦mic⟧, o norėdami išsiųsti, paleidžiate. Čia <strong>vieną kartą palieskite mikrofoną, kad pradėtumėte, tada palieskite siuntimo rodyklę</strong>, kad išsiųstumėte.',
         hint: 'Palieskite mikrofoną, tada siuntimo rodyklę.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Šaunu!</strong> Išsiuntėte žinutę, nuotrauką ir balso žinutę. Kad bet kada atsakytumėte Sarah, atidarykite „WhatsApp“ ir palieskite jos pokalbį.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Palieskite Sarah pokalbį</strong>, kad jį atidarytumėte.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Pokalbio viršuje yra du skambučių mygtukai: <strong>vaizdo kamera</strong> vaizdo skambučiui ir <strong>telefonas</strong> balso skambučiui. <strong>Palieskite vaizdo kamerą</strong> ⟦video⟧.',
         hints: {voice: 'Tai balso skambutis, be vaizdo. Šiai pratybai palieskite vaizdo kamerą.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Skamba Sarah telefonas, o kai ji atsilieps, matysite vienas kitą. Jei jūsų aplinkoje triukšminga, <strong>palieskite mikrofoną</strong> ⟦mic⟧, kad išjungtumėte savo garsą.',
         hint: 'Mikrofono mygtukas yra apatinėje eilutėje.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Jūsų mikrofonas išjungtas: Sarah mato jus, bet negirdi. Norėdami jai ką nors parodyti, <strong>palieskite apvertimo mygtuką</strong> ⟦switch-camera⟧, kad persijungtumėte į telefono galinę kamerą.',
         hints: {mute: 'Vėliau dar kartą palieskite mikrofoną, kad vėl įjungtumėte garsą. Kol kas išbandykite apvertimo mygtuką.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Dabar Sarah mato, į ką nukreipiate telefoną. Kai baigsite, <strong>palieskite raudoną mygtuką</strong>, kad užbaigtumėte skambutį.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Vaizdo skambučiai naudoja daug duomenų. Koks geriausias būdas jais skambinti?',
            options: [
                {t: 'Namuose per Wi-Fi, kai galima', ok: true, why: 'Taip. Per Wi-Fi skambučiai neišnaudoja jūsų mobiliųjų duomenų limito, todėl nemokami, kad ir kiek kalbėtumėte.'},
                {t: 'Nesvarbu', why: 'Per mobiliuosius duomenis ilgas vaizdo skambutis gali greitai išnaudoti jūsų limitą. Kai galima, geriausia naudoti Wi-Fi.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Dabar apie grupes. Grupėje Šeima yra daug naujų žinučių, o pranešimai vis žvanga. <strong>Palieskite grupę Šeima.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Norėdami pakeisti grupės nustatymus, <strong>viršuje palieskite grupės pavadinimą</strong>.', hint: 'Palieskite žodį „Šeima“ ekrano viršuje.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Palieskite Nutildyti pranešimus.</strong> Žinutes vis tiek gausite, bet telefonas nežvangės dėl kiekvienos.',
         hints: {'exit-group': 'Išeiti iš grupės reikštų visiškai ją palikti. Nutildymas švelnesnis: lieka grupėje, bet be žvangėjimo.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Pasirinkite, kiek laiko. <strong>Palieskite 1 savaitei.</strong>',
         hints: {'mute-8h': '8 valandoms irgi tinka. Šiai pratybai palieskite 1 savaitei.', 'mute-always': 'Visam laikui irgi tinka, bet galite ką nors praleisti. Šiai pratybai palieskite 1 savaitei.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Šaunu!</strong> Paskambinote vaizdo skambučiu, išjungėte savo mikrofoną, apvertėte kamerą ir nutildėte judrią grupę. Grupės žinutes vis tiek galite skaityti, kada tik norite.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Sveiki!', ticks: 'read', n: 1}, {text: 'Labas, mama! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Sekmadienio pietūs pas mus? 🍗', n: 1}, {from: 'Sarah', text: 'Taip, prašom!', n: 2}, {from: 'Dave', text: 'Kas atneš tortą? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Paties „WhatsApp“ nustatymai yra programos viduje. <strong>Apačioje dešinėje palieskite Nustatymai.</strong>',
                hints: {'chat-unknown': 'Su ta žinute susitvarkysime vėliau. Pirmiausia apačioje dešinėje palieskite Nustatymai.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Paties „WhatsApp“ nustatymai yra programos viduje. <strong>Viršuje dešinėje palieskite tris taškus ⋮.</strong>',
                hints: {'chat-unknown': 'Su ta žinute susitvarkysime vėliau. Pirmiausia viršuje dešinėje palieskite tris taškus.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Palieskite Nustatymai.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Palieskite Paskyra.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Dviejų žingsnių patvirtinimas</strong> prideda PIN, kurio reikia, jei kas nors bandytų nustatyti jūsų „WhatsApp“ kitame telefone. Net jei sukčius gautų jūsų 6 skaitmenų kodą, jis nepateks. <strong>Palieskite Dviejų žingsnių patvirtinimas.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Palieskite Įjungti.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Pasirinkite 6 skaitmenų PIN, kitokį nei telefono kodas. Šiai pratybai <strong>įveskite ${pinText}</strong>. <em>Čia neįveskite tikro PIN.</em>`,
             hint: `Įveskite mokomąjį PIN ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Dar kartą įveskite ${pinText}</strong>, kad patvirtintumėte.`, hint: `Dar kartą įveskite ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Pridėjus el. pašto adresą, galėsite atkurti PIN, jei jį pamirštumėte. Tikrame telefone tai verta padaryti. Čia <strong>palieskite Pirmyn</strong>.',
             hints: {skip: 'Galite praleisti, bet tada, pamiršus PIN, galite likti užrakinti. Šiai pratybai palieskite Pirmyn.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Dviejų žingsnių patvirtinimas įjungtas. <strong>Palieskite Atlikta.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Žinutėje sakoma, kad ji iš <em>„WhatsApp palaikymo“</em>, ir prašoma jūsų dviejų žingsnių PIN, kad „patvirtintumėte paskyrą“. Ką darote?',
                options: [
                    {t: 'Išsiunčiu, tai iš „WhatsApp“', why: '„WhatsApp“ niekada nerašys jums prašydamas PIN ar kodo. Tai sukčius, bandantis perimti jūsų paskyrą.'},
                    {t: 'Neatsakau, užblokuoju ir pranešu', ok: true, why: 'Būtent. Niekas, įskaitant „WhatsApp“, niekada neturėtų prašyti jūsų PIN ar 6 skaitmenų kodo.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Toliau neleiskite nepažįstamiesiems pridėti jūsų į grupes. Tai skiltyje <strong>Privatumas</strong>. <strong>Palieskite Grupės.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Mano kontaktai'; },
             say: '„Visi“ reiškia, kad bet kuris nepažįstamasis gali pridėti jus į grupę, o to ir naudojasi sukčiai. <strong>Palieskite Mano kontaktai.</strong>',
             hints: {'groups-everyone': 'Pasirinkus Visi, nepažįstamieji gali pridėti jus į grupes, įskaitant sukčių grupes. Palieskite Mano kontaktai.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Gauta žinutė iš jums nepažįstamo numerio: „Labas, mama, čia aš! Naujas numeris…“. Tai „Labas, mama“ sukčiavimas. <strong>Palieskite ją, kad atidarytumėte.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Labas, mama, čia aš! Naujas numeris, senas telefonas sugedo. Gali padėti sumokėti sąskaitą? Rytoj grąžinsiu x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Neatsakykite. „WhatsApp“ pastebi, kad numerio nėra jūsų kontaktuose. <strong>Palieskite Blokuoti.</strong>',
             hints: {'add-contact': 'Nepridėkite sukčiaus į kontaktus. Palieskite Blokuoti.', video: 'Neskambinkite jiems atgal. Palieskite Blokuoti.', voice: 'Neskambinkite jiems atgal. Palieskite Blokuoti.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Labas, mama, čia aš! Naujas numeris, senas telefonas sugedo. Gali padėti sumokėti sąskaitą? Rytoj grąžinsiu x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'Pažymėta parinktis Pranešti „WhatsApp“, o tai padeda „WhatsApp“ sustabdyti sukčių. <strong>Palieskite Blokuoti.</strong>',
             hints: {cancel: 'Atšaukus jie vis dar galėtų jums rašyti. Palieskite Blokuoti.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Šaunu!</strong> Įjungėte dviejų žingsnių patvirtinimą, neleidote nepažįstamiesiems pridėti jūsų į grupes ir užblokavote bei pranešėte apie sukčių. Jei kada abejotumėte dėl šeimos žinutės, paskambinkite jiems turimu numeriu.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Atgal') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Atgal')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Programos, palaikančios dinaminį tekstą (Dynamic Type), prisitaikys prie jūsų pasirinkto skaitymo dydžio.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Teksto dydis', [], {top: slider, back: 'Ekranas'});
        return list(p, 'Ekrano dydis ir tekstas', [{caption: 'Šrifto dydis'}, {id: 'bold', label: 'Paryškintas tekstas', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Teksto dydis yra programoje <strong>Nustatymai</strong>. <strong>Palieskite Nustatymai.</strong>', hint: 'Nustatymai yra pilka piktograma su krumpliaračiu.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Palieskite Ekranas ir ryškumas.</strong>', hint: 'Jis trečioje grupėje, žemiau Pritaikymas neįgaliesiems.'},
        {screen: c => list(p, 'Ekranas ir ryškumas', [{caption: 'IŠVAIZDA'}, {label: 'Šviesi', value: '⟦check⟧'}, {caption: 'TEKSTAS'}, {id: 'text-size', label: 'Teksto dydis'}, {id: 'bold', label: 'Paryškintas tekstas', toggle: !!c.bold}], {back: 'Nustatymai'}),
         target: 'text-size', say: '<strong>Palieskite Teksto dydis.</strong>', hints: {bold: 'Paryškintas tekstas bus toliau. Pirmiausia palieskite Teksto dydis.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Vilkite slankiklį į dešinę, kad raidės būtų didesnės. Čia <strong>du kartus palieskite didžiąją A</strong> ir stebėkite, kaip tekstas auga.', hint: 'Palieskite didžiąją A slankiklio dešinėje.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Daug lengviau skaityti! Dabar viršuje <strong>palieskite ‹ Ekranas</strong>, kad grįžtumėte.'},
        {screen: c => list(p, 'Ekranas ir ryškumas', [{caption: 'IŠVAIZDA'}, {label: 'Šviesi', value: '⟦check⟧'}, {caption: 'TEKSTAS'}, {id: 'text-size', label: 'Teksto dydis'}, {id: 'bold', label: 'Paryškintas tekstas', toggle: !!c.bold}], {back: 'Nustatymai'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Paryškintas tekstas</strong> daro raides storesnes ir aiškesnes. <strong>Palieskite, kad įjungtumėte.</strong>'},
        {screen: c => list(p, 'Ekranas ir ryškumas', [{caption: 'TEKSTAS'}, {label: 'Teksto dydis'}, {label: 'Paryškintas tekstas', toggle: true}], {back: 'Nustatymai'}),
         question: {q: 'Tekstas vis dar per mažas, net didžiausio dydžio nustatymu?', options: [
            {t: 'Daugiau nieko padaryti negalima', why: 'Yra daugiau! Nustatymai > Pritaikymas neįgaliesiems > Ekranas ir teksto dydis > Didesnis tekstas suteikia dar didesnius dydžius.'},
            {t: 'Nustatymai > Pritaikymas neįgaliesiems > Ekranas ir teksto dydis > Didesnis tekstas', ok: true, why: 'Taip. Ten įjunkite Didesni pritaikymo neįgaliesiems dydžiai, kad tekstas būtų tikrai didelis.'}]}},
        {screen: c => list(p, 'Ekranas ir ryškumas', [{caption: 'TEKSTAS'}, {label: 'Teksto dydis'}, {label: 'Paryškintas tekstas', toggle: true}], {back: 'Nustatymai'}), done: true,
         say: '<strong>Šaunu!</strong> Jūsų tekstas didesnis ir paryškintas Nustatymuose ir daugumoje programų.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Teksto dydis yra programoje <strong>Nustatymai</strong>. <strong>Palieskite Nustatymai.</strong>', hint: 'Nustatymai yra piktograma su krumpliaračiu.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Palieskite Ekranas ir lietimas.</strong> <em>„Samsung“ telefone tai Ekranas, tada Šrifto dydis ir stilius.</em>'},
        {screen: () => list(p, 'Ekranas ir lietimas', [{id: 'dark', label: 'Tamsioji tema', toggle: false}, {id: 'text-size', label: 'Ekrano dydis ir tekstas', sub: 'Šrifto dydis, paryškintas tekstas'}, {id: 'brightness', label: 'Ryškumo lygis', value: '70%'}]),
         target: 'text-size', say: '<strong>Palieskite Ekrano dydis ir tekstas.</strong>', hints: {dark: 'Tamsioji tema keičia spalvas, o ne dydį. Palieskite Ekrano dydis ir tekstas.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Vilkite Šrifto dydžio slankiklį į dešinę, kad raidės būtų didesnės. Čia <strong>du kartus palieskite didžiąją A</strong>.', hint: 'Palieskite didžiąją A slankiklio dešinėje.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Paryškintas tekstas</strong> daro raides aiškesnes. <strong>Palieskite, kad įjungtumėte.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Tekstas vis dar per mažas, net didžiausio dydžio nustatymu?', options: [
            {t: 'Daugiau nieko padaryti negalima', why: 'Išbandykite ir Ekrano dydį tame pačiame puslapyje: jis padidina viską, įskaitant mygtukus ir piktogramas.'},
            {t: 'Padidinti ir Ekrano dydį', ok: true, why: 'Taip. Ekrano dydis padidina viską ekrane, ne tik tekstą.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Šaunu!</strong> Jūsų tekstas didesnis ir paryškintas Nustatymuose ir daugumoje programų.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' ant violetinės' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Netrukdyti' : 'Fokusavimas'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Netrukdyti · Įjungta' : 'Netrukdyti · Išjungta'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Braukite aukštyn, kad uždarytumėte' : 'Uždaryti'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Jei telefonas neskamba, gali būti įjungtas režimas „Netrukdyti“. Spartieji nustatymai yra <strong>Valdymo centre</strong>: <strong>braukite žemyn iš viršutinio dešiniojo kampo</strong> (arba palieskite juostelę viršuje).'
                          : 'Jei telefonas neskamba, gali būti įjungtas režimas „Netrukdyti“. <strong>Braukite žemyn nuo ekrano viršaus</strong>, kad pamatytumėte sparčiuosius nustatymus (arba palieskite juostelę viršuje).',
         hints: {'pull-up': 'Braukite į kitą pusę: žemyn nuo viršaus.', 'pull-left': 'Braukite žemyn, o ne į šoną.', 'pull-right': 'Braukite žemyn, o ne į šoną.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Mėnulis ⟦moon⟧ reiškia, kad <strong>įjungtas režimas „Netrukdyti“</strong>, todėl skambučiai ir žinutės nutildyti. <strong>Palieskite jį, kad išjungtumėte.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Dabar padidinkite garsumą <strong>garsumo mygtuku telefono šone</strong> (viršutiniu). <strong>Tris kartus palieskite ＋ mokomojo telefono krašte.</strong>',
         hint: 'Palieskite ＋ mygtuką dešiniajame telefono krašte.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: '„iPhone“ vis dar neskamba. Kas dar galėtų būti?', options: [
                {t: 'Skambučio/tylos jungiklis arba veiksmo mygtukas nustatytas į tylą', ok: true, why: 'Taip. Daugelis „iPhone“ turi mažą jungiklį virš garsumo mygtukų: jei matosi oranžinė, telefonas veikia tyliuoju režimu. Naujesniuose vietoj jo yra veiksmo mygtukas.'},
                {t: 'Telefonas sugedęs', why: 'Dažniausiai ne! Pirmiausia patikrinkite tylos jungiklį virš garsumo mygtukų.'}]}
            : {q: 'Paspaudėte garsumo mygtuką, bet pasikeitė tik medijos garsumas. Ką daryti?', options: [
                {t: 'Palieskite ⋯ arba nustatymų piktogramą garsumo juostoje, kad pamatytumėte skambučio garsumą', ok: true, why: 'Taip. Garsumo mygtukai dažnai keičia medijos garsumą; palieskite tris taškus garsumo juostoje, kad pakeistumėte skambučio garsumą.'},
                {t: 'Pasiduoti', why: 'Pasirodžiusioje garsumo juostoje palieskite tris taškus ⋯ ir padidinkite skambučio garsumą.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Šaunu!</strong> „Netrukdyti“ išjungta ir garsumas padidintas, todėl girdėsite skambučius ir žinutes.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOLIS 500 mg</strong><br>Gerkite 1–2 tabletes kas 4–6 valandas.<br>Per 24 valandas negerkite daugiau kaip 8 tablečių.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Didintuvas', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? '„iPhone“ turi programą <strong>Didintuvas</strong>. Jei jos nėra pradžios ekrane, braukite žemyn ekrano viduryje ir įveskite „Didintuvas“. <strong>Palieskite Didintuvas.</strong>'
                          : 'Daugelis „Android“ telefonų turi programą <strong>Didintuvas</strong>. <em>„Samsung“ telefone ji yra sparčiuosiuose nustatymuose arba Pritaikyme neįgaliesiems.</em> <strong>Palieskite Didintuvas.</strong>',
         hint: 'Ieškokite juodos piktogramos su didinamuoju stiklu.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Nukreipkite telefoną į ką nors smulkaus, pavyzdžiui, šią vaistų etiketę. <strong>Tris kartus palieskite ＋</strong>, kad priartintumėte (tikrame telefone galite vilkti slankiklį).', hint: 'Palieskite ＋ slankiklio dešinėje.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Silpnoje šviesoje padeda žibintuvėlis. <strong>Palieskite žibintuvėlį</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Dreba rankos? <strong>Palieskite didįjį apvalų mygtuką</strong>, kad sustabdytumėte vaizdą ir galėtumėte skaityti nelaikydami telefono nejudančio.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Kam dar praverčia didintuvas?', options: [
            {t: 'Meniu, kainų etiketėms ir smulkiam šriftui laiškuose skaityti', ok: true, why: 'Taip, ir jis visada kišenėje. Kai kurie žmonės laiko jį Valdymo centre ar sparčiuosiuose nustatymuose, kad atidarytų vienu palietimu.'},
            {t: 'Skambučiams padaryti garsesnius', why: 'Tam skirti garsumo mygtukai. Didintuvas skirtas smulkiems dalykams geriau matyti.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Šaunu!</strong> Dabar galite priartinti smulkų šriftą, jį apšviesti ir sustabdyti vaizdą.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Pasimatysim kavos rytmetyje ketvirtadienį' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Ar ateisi ketvirtadienį? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">SMS žinutė</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Klausoma… kalbėkite dabar</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Vietoj rašymo galite kalbėti. <strong>Atidarykite Žinutes.</strong>', hint: 'Žinutės yra žalias kalbėjimo debesėlis.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean paklausė apie ketvirtadienį. <strong>Palieskite žinutės laukelį</strong> apačioje.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Atsiranda klaviatūra. <strong>Palieskite mikrofoną</strong> ⟦mic⟧ klaviatūroje, tada ištarkite žinutę.', hint: 'Mikrofonas yra klaviatūroje, šalia tarpo klavišo.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Tikrame telefone dabar pasakytumėte: <em>„Pasimatysim kavos rytmetyje ketvirtadienį“</em>. Žodžiai atsiranda jums kalbant. Patikrinkite juos, tada <strong>palieskite siųsti</strong> ⟦send-horizontal⟧.',
         hint: 'Palaukite, kol atsiras žodžiai, tada palieskite siuntimo rodyklę.'},
        {screen: () => home(p), target: 'settings',
         say: 'Telefonas taip pat gali <strong>skaityti jums garsiai</strong>. Įjunkime tai. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Palieskite Pritaikymas neįgaliesiems.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Prieinamumas', [{caption: 'REGA'}, {id: 'voiceover', label: 'VoiceOver', value: 'Išjungta'}, {id: 'zoom', label: 'Padidinimas', value: 'Išjungta'}, {id: 'spoken', label: 'Tariamas turinys'}], {back: 'Nustatymai'})
            : list(p, 'Prieinamumas', [{id: 'select-speak', label: 'Pasirinkite ir išgirskite', sub: 'Išjungta'}, {id: 'talkback', label: 'TalkBack', sub: 'Išjungta'}, {id: 'magnification', label: 'Didinimas'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Palieskite Tariamas turinys.</strong>' : '<strong>Palieskite Pasirinkite ir išgirskite.</strong>',
         hints: {voiceover: 'VoiceOver pakeičia viso telefono veikimą, o tai gali painioti. Palieskite Tariamas turinys.', talkback: 'TalkBack pakeičia viso telefono veikimą, o tai gali painioti. Palieskite Pasirinkite ir išgirskite.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Tariamas turinys', [{id: 'speak-selection', label: 'Tarti pasirinkimą', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Tarti ekraną', toggle: !!c.speakScreen, sub: 'Braukite žemyn dviem pirštais nuo ekrano viršaus, kad išgirstumėte skaitymą garsiai.'}], {back: 'Prieinamumas'})
            : list(p, 'Pasirinkite ir išgirskite', [{id: 'speak-screen', label: 'Naudoti „Pasirinkite ir išgirskite“', toggle: !!c.speakScreen, sub: 'Palieskite spartųjį mygtuką, tada palieskite bet ką ekrane, kad išgirstumėte perskaitytą.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Įjunkite Tarti ekraną.</strong> Tada bet kur telefone braukimas žemyn dviem pirštais nuo viršaus perskaito ekraną garsiai.' : '<strong>Įjunkite Naudoti „Pasirinkite ir išgirskite“.</strong> Atsiras mažas spartusis mygtukas: palieskite jį, tada bet kurį tekstą, kad jį išgirstumėte.',
         hints: {'speak-selection': 'Tai skaito tik jūsų pažymėtus žodžius. Tarti ekraną paprasčiau: įjunkite jį.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Tariamas turinys', [{label: 'Tarti pasirinkimą', toggle: false}, {label: 'Tarti ekraną', toggle: true}], {back: 'Prieinamumas'})
            : list(p, 'Pasirinkite ir išgirskite', [{label: 'Naudoti „Pasirinkite ir išgirskite“', toggle: true}]), done: true,
         say: '<strong>Šaunu!</strong> Dabar galite kalbėti vietoj rašymo, o telefonas gali jums skaityti garsiai.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Daug klausos aparatų gali jungtis prie telefono, todėl skambučiai ir muzika girdimi tiesiai juose. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Palieskite Pritaikymas neįgaliesiems.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Prieinamumas', [{caption: 'KLAUSA'}, {id: 'hearing-devices', label: 'Klausos įrenginiai'}, {id: 'live-captions', label: 'Subtitrai realiuoju laiku', value: c.captions ? 'Įjungta' : 'Išjungta'}, {id: 'subtitles', label: 'Subtitrai'}], {back: 'Nustatymai'})
            : list(p, 'Prieinamumas', [{id: 'hearing-devices', label: 'Klausos aparatai', sub: c.paired ? 'Prijungta' : 'Neprijungta'}, {id: 'live-captions', label: 'Subtitrai realiuoju laiku', sub: c.captions ? 'Įjungta' : 'Išjungta'}, {id: 'sound-amp', label: 'Garso stiprintuvas'}]),
         target: 'hearing-devices', say: `<strong>Palieskite ${p === 'ios' ? 'Klausos įrenginiai' : 'Klausos aparatai'}.</strong> Pirmiausia įsidėkite klausos aparatus ir uždarykite jų baterijų dureles, kad jie persikrautų, kad telefonas juos rastų.`,
         hints: {'live-captions': 'Subtitrai bus toliau. Pirmiausia prijunkite klausos aparatus.'}},
        {screen: c => list(p, p === 'ios' ? 'Klausos įrenginiai' : 'Klausos aparatai', [{caption: p === 'ios' ? '„MFI“ KLAUSOS ĮRENGINIAI' : 'Galimi įrenginiai'}, {id: 'aids', label: 'Margaret klausos aparatai', sub: 'Kairė ir dešinė'}],
            {overlay: c.pairing ? dialog(p, 'Susieti su „Margaret klausos aparatai“?', 'Jie bus naudojami skambučiams ir garsui.', [['cancel', 'Atšaukti'], ['pair', 'Susieti']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Telefonas juos randa. <strong>Palieskite savo klausos aparatus.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Klausos įrenginiai' : 'Klausos aparatai', [{id: 'aids', label: 'Margaret klausos aparatai', sub: 'Kairė ir dešinė'}],
            {overlay: dialog(p, 'Susieti su „Margaret klausos aparatai“?', 'Jie bus naudojami skambučiams ir garsui.', [['cancel', 'Atšaukti'], ['pair', 'Susieti']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Palieskite Susieti.</strong> (Su dviem klausos aparatais telefonas gali paklausti du kartus, po kartą kiekvienam.)'},
        {screen: c => list(p, p === 'ios' ? 'Klausos įrenginiai' : 'Klausos aparatai', [{label: 'Margaret klausos aparatai', sub: 'Prijungta ⟦check⟧'}]), target: 'back',
         say: 'Prijungta! Skambučiai dabar girdimi per klausos aparatus. <strong>Palieskite Atgal.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Prieinamumas', [{caption: 'KLAUSA'}, {id: 'hearing-devices', label: 'Klausos įrenginiai'}, {id: 'live-captions', label: 'Subtitrai realiuoju laiku', value: c.captions ? 'Įjungta' : 'Išjungta'}], {back: 'Nustatymai'})
            : list(p, 'Prieinamumas', [{id: 'hearing-devices', label: 'Klausos aparatai', sub: 'Prijungta'}, {id: 'live-captions', label: 'Subtitrai realiuoju laiku', sub: c.captions ? 'Įjungta' : 'Išjungta'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Subtitrai realiuoju laiku' : 'Subtitrai realiuoju laiku'}</strong> rodo ekrane viską, kas sakoma: vaizdo įrašuose, skambučiuose ir balso žinutėse. <strong>Palieskite, kad įjungtumėte.</strong>`},
        {screen: c => list(p, 'Prieinamumas', [{label: p === 'ios' ? 'Subtitrai realiuoju laiku' : 'Subtitrai realiuoju laiku', toggle: true}, {label: 'Klausos aparatai', sub: 'Prijungta'}]), done: true,
         say: '<strong>Šaunu!</strong> Klausos aparatai prijungti, o ištarti žodžiai dabar rodomi kaip subtitrai.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Skruzdė', 'Barsukas', 'Katė', 'Šuo', 'Erelis', 'Lapė', 'Ožka', 'Ežys', 'Ibis', 'Kuosa', 'Tulžys', 'Ėriukas', 'Kurmis',
                     'Tritonas', 'Ūdra', 'Kirvasnapis', 'Raudongurklis', 'Ruonis', 'Rupūžė', 'Pelėnas', 'Nykštukas', 'Zebras'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Paspauskite ir palaikykite gėlę</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Kopijuoti</span><span>Bendrinti</span><span>Ištrinti</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebras</h3><p>Zebrai turi juodas ir baltas juosteles. Dviejų zebrų juostų raštas niekada nebūna visiškai vienodas.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Palietimas</strong> reiškia lengvai paliesti ekraną vienu pirštu ir iškart atitraukti, tarsi spaustumėte mygtuką. <strong>Palieskite žvaigždutę.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Paspaudimas ir laikymas</strong> reiškia laikyti pirštą ant ko nors sekundę ar dvi. Dažniausiai atsiveria papildomos parinktys. <strong>Paspauskite ir laikykite gėlę</strong>, kol kas nors įvyks. (Su pele laikykite nuspaudę mygtuką.)',
         hint: 'Laikykite pirštą ant gėlės sekundę ar dvi.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Atsirado meniu. Ką paprastai daro paspaudimas ir laikymas?', options: [
            {t: 'Parodo papildomas parinktis, pvz., kopijuoti, bendrinti ar ištrinti', ok: true, why: 'Taip. Paspaudus ir palaikius žinutes, nuotraukas ir programas atsiranda tokių parinkčių.'},
            {t: 'Iškart viską ištrina', why: 'Ne, tik parodo parinkčių meniu. Nieko nenutinka, kol nepasirenkate.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Braukimas</strong> reiškia pirštą slinkti ekranu, tarsi versti puslapį. <strong>Du kartus braukite nuotrauką kairėn</strong>, kad pamatytumėte kitas. (Su pele spustelėkite, vilkite ir paleiskite.)',
         hint: 'Slinkite pirštu iš dešinės į kairę per nuotrauką. Arba naudokite mygtuką „Negalite braukti?“.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Slinkimas</strong> reiškia pirštą slinkti ekranu aukštyn, kad pamatytumėte daugiau sąrašo, kaip šio. <strong>Nuslinkite žemyn ir palieskite Zebras</strong> pačioje apačioje. (Su pele naudokite ratuką.)',
         hint: 'Slinkite sąrašą aukštyn pirštu, kad pasiektumėte Zebras apačioje.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Norėdami grįžti puslapiu atgal „iPhone“, <strong>palieskite ‹ Atgal</strong> viršuje kairėje (arba braukite nuo kairiojo ekrano krašto).' : 'Norėdami grįžti puslapiu atgal „Android“, <strong>palieskite atgal rodyklę ◁</strong> apačioje (arba braukite nuo kairiojo ar dešiniojo ekrano krašto).',
         hints: {'home-pill': 'Tai nuveda visai į pradžią. Verčiau palieskite atgal rodyklę ◁.', 'home-bar': 'Tai nuveda visai į pradžią. Verčiau palieskite ‹ Atgal.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Norėdami iš bet kur patekti į pradžios ekraną, <strong>braukite aukštyn nuo juostos apačioje</strong> (arba palieskite juostą čia). Senesniuose „iPhone“ su apvaliu pradžios mygtuku: paspauskite jį.'
                          : 'Norėdami iš bet kur patekti į pradžios ekraną, <strong>palieskite pradžios apskritimą ○</strong> apačioje (arba braukite aukštyn nuo apatinio krašto).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Atgal grąžina vienu puslapiu. Norėdami grįžti į pradžią, palieskite pradžios apskritimą ○.'}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Pasipraktikavote paliesti, paspausti ir laikyti, braukti, slinkti, grįžti atgal ir į pradžią: judesius, kuriuos naudosite kasdien.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Prijungta', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internetas', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'TINKLAI' : 'Galimi tinklai'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Nustatymai',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Įveskite „BT-Hub-7F2A“ slaptažodį</strong></p>
                ${field('wifipass', 'Slaptažodis', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Prisijungti' : 'Prisijungti'}</button>
                <button type="button" class="cp" data-tap="cancel">Atšaukti</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Naudojant namų Wi-Fi taupomi mobilieji duomenys. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Palieskite Wi-Fi</strong>, netoli viršaus.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Palieskite Tinklas ir internetas.</strong> <em>„Samsung“ telefone tai Ryšiai, tada Wi-Fi.</em>'},
               {screen: () => list(p, 'Tinklas ir internetas', [{id: 'internet', label: 'Internetas', sub: 'Wi-Fi ir mobilieji duomenys'}, {id: 'sims', label: 'SIM kortelės'}, {id: 'hotspot', label: 'Viešosios prieigos taškas ir susiejimas'}]),
                target: 'internet', say: '<strong>Palieskite Internetas.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Jūsų Wi-Fi pavadinimas ir slaptažodis dažniausiai yra lipduke maršruto parinktuvo gale (dėžutėje su lemputėmis). Šio mokomojo maršruto parinktuvo lipdukas rodo:<br><span class="ahd">Tinklas: <strong>BT-Hub-7F2A</strong><br>Slaptažodis: <strong>Green-Apple-42</strong></span><strong>Palieskite BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Tai kaimyno Wi-Fi. Suraskite pavadinimą savo lipduke: BT-Hub-7F2A.', 'net-sky-12345': 'Tai kažkieno kito Wi-Fi. Suraskite pavadinimą savo lipduke: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Slaptažodis turi tiksliai sutapti su lipduku, įskaitant didžiąsias raides ir brūkšnelius: Green-Apple-42',
         say: 'Įveskite slaptažodį <strong>tiksliai</strong> taip, kaip jis parašytas lipduke: <strong>Green-Apple-42</strong>. Didžiosios raidės svarbios! Tada <strong>palieskite Prisijungti</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Prisijungta! Dabar telefonas pats prisijungs prie šio Wi-Fi, kai būsite namie. Ar saugu naudoti nemokamą Wi-Fi kavinėje?', options: [
            {t: 'Taip, naršyti, bet venkite interneto bankininkystės', ok: true, why: 'Būtent. Viešas Wi-Fi tinka naujienoms skaityti ar autobuso laikui patikrinti. Bankininkystei naudokite mobiliuosius duomenis ar namų Wi-Fi.'},
            {t: 'Taip, viskam', why: 'Viešą Wi-Fi gali stebėti kiti. Naršyti tinka, bet bankininkystei naudokite mobiliuosius duomenis ar namų Wi-Fi.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Šaunu!</strong> Prisijungėte prie Wi-Fi. Ieškokite vėduoklės formos Wi-Fi simbolio ekrano viršuje.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Naujas kontaktas' : 'Sukurti kontaktą', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Vardas', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Mobiliojo telefono numeris', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Atlikta' : 'Išsaugoti'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Kontaktas', [
        {label: 'Mobilusis', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Pridėti prie mėgstamiausių' : (ctx.fav ? '⟦star⟧ Mėgstamiausias' : '⟦star⟧ Pridėti prie mėgstamiausių')},
        {id: 'share', label: 'Bendrinti kontaktą'}], {back: 'Kontaktai'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Kontaktai', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Išsaugoję žmogaus numerį, galėsite jam skambinti pagal vardą. „iPhone“ kontaktai yra programoje <strong>Telefonas</strong>. <strong>Palieskite Telefonas.</strong>' : '<strong>Palieskite Kontaktai.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Kontaktai', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Kontaktai', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Tai jūsų kontaktų sąrašas. <strong>Viršuje dešinėje palieskite +</strong>, kad pridėtumėte žmogų.' : 'Tai jūsų kontaktų sąrašas. <strong>Palieskite + mygtuką</strong>, kad pridėtumėte žmogų.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Įveskite vardą ir mokomąjį numerį 07700 900456, tada palieskite ' + (p === 'ios' ? 'Atlikta.' : 'Išsaugoti.'),
         say: `Įveskite žmogaus <strong>vardą</strong> (pabandykite „Ann“) ir jo numerį. Pratybai naudokite <strong>07700 900456</strong>. Tada <strong>palieskite ${p === 'ios' ? 'Atlikta' : 'Išsaugoti'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Išsaugota! Mėgstamiausi yra žmonės, kuriems skambinate dažniausiai, rodomi viršuje, kad paskambintumėte vienu palietimu. <strong>Palieskite ' + (p === 'ios' ? 'Pridėti prie mėgstamiausių' : 'žvaigždutę') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Kurį kontaktą verta išsaugoti su „ICE“ (In Case of Emergency, t. y. kritinės padėties atveju) prieš vardą?', options: [
            {t: 'Artimiausią giminaitį, pvz., „ICE Sarah“', ok: true, why: 'Taip. Medikai žino ieškoti ICE. Dar geriau pridėti kritinės padėties kontaktą prie Medicininio ID, apie tai kurse „Telefono saugumas“.'},
            {t: 'Jūsų bankas', why: 'ICE skirtas asmeniui, su kuriuo reikia susisiekti, jei jums kas nors nutiktų, dažniausiai artimiausiam giminaičiui.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Šaunu!</strong> Išsaugojote kontaktą ir padarėte jį mėgstamiausiu.'},
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
    const recents = p => app(p, 'Naujausi', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Jūsų telefonas skamba: skambina Jean. <strong>Palieskite žalią mygtuką, kad atsilieptumėte.</strong>' + (p === 'android' ? ' <em>Kai kuriuose „Android“ telefonuose vietoj to žalią mygtuką reikia perbraukti aukštyn.</em>' : ' <em>Jei „iPhone“ užrakintas, vietoj to žalią mygtuką reikia nustumti į šoną.</em>'),
         hints: {decline: 'Raudonas atmeta skambutį. Palieskite žalią, kad atsilieptumėte.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Kalbate! Kad geriau girdėtumėte arba kalbėtumėte neimdami telefono į rankas, <strong>palieskite garsiakalbį</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Kai baigsite, <strong>palieskite raudoną mygtuką</strong>, kad padėtumėte ragelį.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Anksčiau praleidote Dave skambutį. Praleisti skambučiai naujausiuose skambučiuose rodomi <strong>raudonai</strong>. <strong>Palieskite Dave</strong>, kad jam perskambintumėte.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Skamba Dave. Kai baigsite kalbėti, <strong>palieskite raudoną mygtuką</strong>, kad padėtumėte ragelį.'},
        {screen: () => recents(p), question: {q: 'Kažkas skambina nežinomu numeriu ir sako, kad yra iš jūsų banko. Ką darote?', options: [
            {t: 'Padedu ragelį ir skambinu 159, kad saugiai susisiekčiau su banku', ok: true, why: 'Būtent. Visada galite padėti ragelį ir perskambinti jums patikimu numeriu. 159 sujungia su jūsų pačių banku.'},
            {t: 'Darau, ką liepia, juk tai bankas', why: 'Sukčiai nuolat apsimeta bankais, o numerį galima suklastoti. Padėkite ragelį ir skambinkite 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Šaunu!</strong> Dabar galite atsiliepti, naudoti garsiakalbį, padėti ragelį ir perskambinti į praleistus skambučius.'},
    ], {});

    function smsList(p) {
        return app(p, 'Žinutės', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Paskutinis jūsų patikrinimas buvo kovą. Užsiregistruokite internetu arba paskambinkite mums.</span><small>prieš 3 mėn.</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'SMS žinutė', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'SMS žinutės yra programoje <strong>Žinutės</strong>. <strong>Palieskite Žinutės.</strong>', hint: 'Tai kalbėjimo debesėlio piktograma.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Naujos žinutės rodomos paryškintai. <strong>Palieskite žinutę iš Dantisto</strong>, kad ją perskaitytumėte.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Pirmiausia žinutės laukelyje įveskite Y, tada palieskite siuntimo rodyklę.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Dantistas prašo atsakyti <strong>Y</strong>, kad patvirtintumėte. <strong>Palieskite žinutės laukelį, įveskite Y, tada palieskite siuntimo rodyklę</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Atlikta! Dabar sutvarkykite: <strong>paspauskite ir palaikykite senąją žinutę</strong> viršuje (laikykite pirštą ant jos sekundę ar dvi).', hint: 'Laikykite pirštą ant senosios žinutės viršuje, kol atsiras meniu.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Atsiranda meniu. <strong>Palieskite Ištrinti.</strong>',
         hints: {copy: 'Kopijuoti nukopijuoja žodžius. Palieskite Ištrinti.', forward: 'Persiųsti išsiunčia ją kam nors kitam. Palieskite Ištrinti.'}},
        {screen: c => smsChat(p, c), question: {q: 'SMS iš nežinomo numerio sako, kad jūsų siuntinys sulaikytas, ir prašo sumokėti £1,45 per nuorodą. Ką darote?', options: [
            {t: 'Nepaliečiu nuorodos. Persiunčiu numeriu 7726, tada ištrinu', ok: true, why: 'Būtent. 7726 nemokamas ir praneša jūsų tinklui. Kurjeriai nesiunčia SMS su nuorodomis, prašančiomis mokesčio.'},
            {t: 'Sumoku, juk tik £1,45', why: '£1,45 yra jaukas, kad išgautų jūsų kortelės duomenis. Nepalieskite nuorodos: persiųskite numeriu 7726 ir ištrinkite.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Šaunu!</strong> Galite skaityti SMS žinutes, į jas atsakyti ir ištrinti nereikalingas.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Žemėlapiai', 15], ['WhatsApp', 9], ['Fotoaparatas', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Akumuliatorius', [{id: 'low-power', label: 'Mažos energijos režimas', toggle: saver, sub: 'Sumažina veiklą fone, kol galėsite visiškai įkrauti.'}, {caption: 'AKUMULIATORIAUS NAUDOJIMAS PAGAL PROGRAMĄ'}], {back: 'Nustatymai', top: head, bottom: apps})
            : list(p, 'Akumuliatorius', [{id: 'low-power', label: 'Akumuliatoriaus tausojimo priemonė', toggle: saver, sub: 'Išjungia kai kurias funkcijas, kad akumuliatorius veiktų ilgiau.'}, {caption: 'Akumuliatoriaus naudojimas'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Senka akumuliatorius? <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Palieskite Akumuliatorius.</strong>', hint: p === 'ios' ? 'Akumuliatorius yra trečioje grupėje.' : 'Akumuliatorius yra sąraše po Pranešimų.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Liko 23 %. <strong>${p === 'ios' ? 'Mažos energijos režimas' : 'Akumuliatoriaus tausojimo priemonė'}</strong> pailgina veikimo laiką. <strong>Palieskite, kad įjungtumėte.</strong> Akumuliatoriaus simbolis tampa ${p === 'ios' ? 'yellow' : 'orange'}, kad primintų.`},
        {screen: c => batteryPage(p, c), question: {q: 'Sąraše matyti, kad šiandien daugiausia akumuliatoriaus sunaudojo Facebook. Kas padeda akumuliatoriui veikti ilgiausiai?', options: [
            {t: 'Sumažinti ekrano ryškumą ir uždaryti programas, kurių nebereikia', ok: true, why: 'Taip. Ekranas naudoja daugiausia energijos. Sumažinkite ryškumą, o tokios programos kaip Facebook ir YouTube sunaudoja daug.'},
            {t: 'Įkrauti iki 100 % kas valandą', why: 'Dažnas įkrovimas nekenkia, bet nepadaro, kad veiktų ilgiau. Sumažinkite ryškumą ir naudokite energijos taupymo režimą.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Šaunu!</strong> Energijos taupymas įjungtas ir žinote, kurios programos sunaudoja daugiausia.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'mobilusis · 3 skambučiai' : 'Įtariamas šlamštas · 3 skambučiai'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Naujausi', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>mobilusis</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>mobilusis</small><span>Vakar</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Tas pats nežinomas numeris vis jums skambina. Užblokuokime jį. <strong>Atidarykite programą Telefonas.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `Naujausiuose skambučiuose <strong>palieskite ⓘ</strong> šalia numerio 07700 900842${p === 'android' ? ' (kai kuriuose „Android“ telefonuose palieskite patį numerį)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Bendrinti kontaktą'}, {id: 'block', label: p === 'ios' ? 'Blokuoti šį skambintoją' : 'Blokuoti / pranešti apie šlamštą', danger: true}], {back: 'Naujausi'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Blokuoti šį skambintoją' : 'Blokuoti / pranešti apie šlamštą'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Blokuoti šį skambintoją?', 'Negausite telefono skambučių, žinučių ar „FaceTime“ iš žmonių, esančių jūsų blokavimo sąraše.', [['cancel', 'Atšaukti'], ['confirm', 'Blokuoti kontaktą']])
            : dialog(p, 'Blokuoti 07700 900842?', '⟦square-check⟧ Pranešti apie skambutį kaip apie šlamštą', [['cancel', 'Atšaukti'], ['confirm', 'Blokuoti']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Blokuoti kontaktą' : 'Blokuoti'}.</strong>${p === 'android' ? ' Palikus pažymėtą „Pranešti apie skambutį kaip apie šlamštą“, padedama įspėti kitus žmones.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Užblokuota! Taip pat galite <strong>nutildyti visus skambučius iš jums nežinomų numerių</strong>. <strong>Palieskite Nustatymai.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Nuslinkite iki apačios ir <strong>palieskite Programos</strong>.'},
            {screen: () => list(p, 'Programos', [{id: 'app-phone', label: 'Telefonas'}, {id: 'app-messages', label: 'Žinutės'}, {id: 'app-mail', label: 'Paštas'}], {back: 'Nustatymai'}), target: 'app-phone', say: '<strong>Palieskite Telefonas.</strong>'},
            {screen: c => list(p, 'Telefonas', [{id: 'silence', label: 'Nutildyti nežinomus skambintojus', toggle: !!c.silence}, {id: 'blocked', label: 'Užblokuoti kontaktai', value: '1'}], {back: 'Programos'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Įjunkite Nutildyti nežinomus skambintojus.</strong> Skambučiai iš numerių, kurių nėra jūsų kontaktuose, nukreipiami tiesiai į balso paštą ir vis tiek rodomi naujausiuose skambučiuose.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Užblokuota! Taip pat galite <strong>filtruoti šlamšto skambučius</strong>. <strong>Viršuje dešinėje palieskite tris taškus ⋮.</strong>'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Palieskite Nustatymai.</strong>'},
            {screen: () => list(p, 'Nustatymai', [{id: 'caller-id', label: 'Skambintojo ID ir šlamštas'}, {id: 'blocked', label: 'Užblokuoti numeriai'}, {id: 'sounds', label: 'Garsai ir vibracija'}]), target: 'caller-id', say: '<strong>Palieskite Skambintojo ID ir šlamštas.</strong>'},
            {screen: c => list(p, 'Skambintojo ID ir šlamštas', [{id: 'caller-show', label: 'Rodyti skambintojo ir šlamšto ID', toggle: true}, {id: 'silence', label: 'Filtruoti šlamšto skambučius', toggle: !!c.silence, sub: 'Įtariami šlamšto skambučiai telefono neskambins'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Įjunkite Filtruoti šlamšto skambučius.</strong> Įtariami sukčių skambučiai telefono neskambins.'},
        ]),
        {screen: c => list(p, 'Atlikta', [{label: 'Užblokuoti numeriai', value: '1'}, {label: p === 'ios' ? 'Nutildyti nežinomus skambintojus' : 'Filtruoti šlamšto skambučius', toggle: true}]),
         question: {q: 'Ar nutildžius nežinomus skambintojus galima praleisti tikrą skambutį, pavyzdžiui, iš ligoninės ar kurjerio?', options: [
            {t: 'Taip, todėl kartkartėmis patikrinkite balso paštą ir praleistus skambučius', ok: true, why: 'Būtent. Tikri skambintojai dažniausiai palieka žinutę, o praleisti skambučiai vis tiek rodomi sąraše.'},
            {t: 'Ne, jie visada prisiskambins', why: 'Nežinomi numeriai nukreipiami į balso paštą, įskaitant tikrus. Kartkartėmis patikrinkite balso paštą ir praleistus skambučius.'}]}},
        {screen: () => list(p, 'Atlikta', [{label: 'Užblokuoti numeriai', value: '1'}, {label: p === 'ios' ? 'Nutildyti nežinomus skambintojus' : 'Filtruoti šlamšto skambučius', toggle: true}]), done: true,
         say: '<strong>Šaunu!</strong> Užblokavote įkyrų numerį ir sumažinote sukčių skambučių.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: jūsų siuntinys sulaikytas dėl nesumokėto £1,45 mokesčio. Sumokėkite dabar ir užsakykite pristatymą iš naujo: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Kam: ${field('fwdto', 'Numeris', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Ačiū. Atsiųskite telefono numerį, iš kurio gavote sukčių SMS.</span><small>dabar</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Ačiū, jūsų pranešimas gautas.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Nauja žinutė') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'SMS žinutė', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Daugiau… tada Persiųsti' : 'Persiųsti'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Gavote sukčių SMS, apsimetančią Royal Mail. Prieš ištrindami pranešite apie ją, tai nemokama. <strong>Atidarykite Žinutes.</strong>'},
        {screen: () => app(p, 'Žinutės', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Palieskite žinutę</strong>, kad ją atidarytumėte. Nepalieskite joje esančios nuorodos!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Paspauskite ir palaikykite žinutę</strong> (laikykite ant jos pirštą), kol atsiras meniu. Nepalieskite nuorodos.', hint: 'Laikykite pirštą ant pilko žinutės debesėlio sekundę ar dvi.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Palieskite Daugiau…</strong>, tada persiuntimo rodyklę (čia vienas mygtukas atlieka abu).' : '<strong>Palieskite Persiųsti.</strong> (Kai kuriuose telefonuose tai po trimis taškais ⋮ viršuje.)',
         hints: {delete: 'Pirmiausia pranešite, tada galėsite ištrinti.', copy: 'Palieskite Persiųsti, kad išsiųstumėte ją numeriu 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'Laukelyje „Kam“ įveskite 7726 (telefono klaviatūroje jis sudaro žodį SPAM), tada palieskite siųsti.',
         action: c => { c.sent7726 = true; }, say: 'Laukelyje <strong>Kam</strong> įveskite <strong>7726</strong>. (Klaviatūroje jis sudaro S-P-A-M.) Tada <strong>palieskite siųsti</strong> ⟦send-horizontal⟧. Tai nemokama.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Įveskite sukčiaus numerį 07700 900911, tada palieskite siųsti.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 atsako ir klausia, iš kurio numerio atėjo sukčių žinutė. <strong>Įveskite 07700 900911</strong> ir <strong>palieskite siųsti</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Apie ją pranešėte. Ką dabar daryti su sukčių SMS?', options: [
            {t: 'Ištrinti ją ir užblokuoti numerį', ok: true, why: 'Taip. Apie ją pranešta, todėl galite ištrinti. Užblokavus numerį, daugiau žinučių iš jo negausite.'},
            {t: 'Paliesti nuorodą ir patikrinti, ar ji tikra', why: 'Niekada nepalieskite nuorodų sukčių SMS žinutėse. Ištrinkite ją ir užblokuokite numerį.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Šaunu!</strong> Pranešėte apie sukčių SMS numeriu 7726, o tai padeda tinklams ją užblokuoti visiems. Sukčių el. laiškus siųskite į report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Naujinimai taiso saugos spragas, todėl jie svarbūs. Pirmiausia prijunkite telefoną prie įkroviklio ir Wi-Fi. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Palieskite Bendra.</strong>'},
        {screen: () => list(p, 'Bendra', [{id: 'about', label: 'Apie'}, {id: 'software', label: 'Programinės įrangos naujinimas', value: '1'}, {id: 'storage', label: '„iPhone“ saugykla'}], {back: 'Nustatymai'}), target: 'software', say: '<strong>Palieskite Programinės įrangos naujinimas.</strong> Raudonas 1 reiškia, kad laukia naujinimas.'},
        {screen: () => list(p, 'Programinės įrangos naujinimas', [{id: 'auto', label: 'Automatiniai naujinimai', value: 'Išjungta'}], {back: 'Bendra',
            bottom: '<div class="hu"><strong>iOS naujinimas</strong><p>Šiame naujinime yra svarbių saugos pataisų, ir jis rekomenduojamas visiems naudotojams.</p><button type="button" class="ce co" data-tap="update-now">Atnaujinti dabar</button></div>'}),
         target: 'update-now', say: '<strong>Palieskite Atnaujinti dabar.</strong>', hints: {auto: 'Automatinius naujinimus irgi verta įjungti vėliau. Pirmiausia palieskite Atnaujinti dabar.'}},
        {screen: c => codeScreen(p, c, 'Įveskite kodą', ''), sequence: PRACTICE.map(d => 'k' + d), say: '„iPhone“ prašo kodo. <strong>Įveskite mokomąjį kodą 4 7 1 9 3 6.</strong>', hint: 'Įveskite 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Programinės įrangos naujinimas', [], {back: 'Bendra', bottom: `<div class="hu"><strong>${c.busy ? 'Atsisiunčiama…' : 'Paruošta diegti'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Pirmiausia jis atsisiunčiamas, o tai gali užtrukti kelias minutes. Tada <strong>palieskite Įdiegti dabar</strong>. Telefonas persikrauna, todėl darykite tai, kai 15–30 minučių jo nereikės.'},
        {screen: () => list(p, 'Programinės įrangos naujinimas', [{id: 'auto', label: 'Automatiniai naujinimai', value: 'Įjungta'}], {back: 'Bendra', bottom: '<div class="hu"><strong>Jūsų „iPhone“ atnaujintas</strong></div>'}),
         question: {q: 'Ar verta įjungti Automatinius naujinimus?', options: [
            {t: 'Taip, tada jis atsinaujina naktį, kol kraunasi', ok: true, why: 'Būtent. Nustatymai > Bendra > Programinės įrangos naujinimas > Automatiniai naujinimai. Jis įdiegiamas naktį, kai prijungtas prie įkroviklio ir Wi-Fi.'},
            {t: 'Ne, naujinimai neprivalomi', why: 'Naujinimai taiso saugos spragas, kuriomis naudojasi sukčiai. Automatiniai naujinimai apsaugo jus, nereikalaudami nieko prisiminti.'}]}},
        {screen: () => list(p, 'Programinės įrangos naujinimas', [], {bottom: '<div class="hu"><strong>Jūsų „iPhone“ atnaujintas ⟦check⟧</strong></div>'}), done: true, say: '<strong>Šaunu!</strong> Telefonas atnaujintas ir apsaugotas nuo naujausių problemų.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Naujinimai taiso saugos spragas, todėl jie svarbūs. Pirmiausia prijunkite telefoną prie įkroviklio ir Wi-Fi. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Nuslinkite žemyn ir <strong>palieskite Sistema</strong>. <em>„Samsung“ telefone tai Programinės įrangos naujinimas, netoli apačios.</em>'},
        {screen: () => list(p, 'Sistema', [{id: 'languages', label: 'Kalbos'}, {id: 'date', label: 'Data ir laikas'}, {id: 'software', label: 'Programinės įrangos naujinimai', sub: 'Yra naujinimas'}]), target: 'software', say: '<strong>Palieskite Programinės įrangos naujiniai.</strong>'},
        {screen: () => list(p, 'Programinės įrangos naujinimai', [{id: 'system-update', label: 'Sistemos naujinys', sub: 'Yra naujinimas'}, {id: 'play-update', label: 'Google Play sistemos naujinys'}]), target: 'system-update', say: '<strong>Palieskite Sistemos naujinys.</strong>'},
        {screen: () => list(p, 'Sistemos naujinys', [], {bottom: '<div class="hu"><strong>Yra sistemos naujinys</strong><p>Jame yra svarbių saugos pataisų.</p><button type="button" class="ce dk" data-tap="download">Atsisiųsti ir įdiegti</button></div>'}),
         target: 'download', say: '<strong>Palieskite Atsisiųsti ir įdiegti.</strong>'},
        {screen: c => list(p, 'Sistemos naujinys', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Atsisiunčiama ir diegiama…' : 'Paleiskite iš naujo, kad baigtumėte'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Jis atsisiunčiamas ir ruošiamas, o tai gali užtrukti. Tada <strong>palieskite Paleisti iš naujo dabar</strong>. Telefonas išsijungia ir vėl įsijungia, o tai užtrunka kelias minutes.'},
        {screen: () => list(p, 'Sistemos naujinys', [], {bottom: '<div class="hu"><strong>Jūsų sistema atnaujinta</strong></div>'}),
         question: {q: 'Jūsų telefonas jau metų metus negavo naujinimo. Ką tai gali reikšti?', options: [
            {t: 'Jis gali būti per senas saugos naujinimams, todėl mažiau saugus', ok: true, why: 'Taip. Senesni telefonai nustoja gauti naujinimus. Venkite juose bankininkystės ir, kai galite, apsvarstykite pakeitimą.'},
            {t: 'Jis veikia puikiai', why: 'Telefonai po kelerių metų nustoja gauti naujinimus, todėl saugos spragos lieka neužtaisytos.'}]}},
        {screen: () => list(p, 'Sistemos naujinys', [], {bottom: '<div class="hu"><strong>Jūsų sistema atnaujinta ⟦check⟧</strong></div>'}), done: true, say: '<strong>Šaunu!</strong> Telefonas atnaujintas ir apsaugotas nuo naujausių problemų.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (dukra)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Medicininis ID' : 'Medicininė informacija', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'pvz., 2 tipo diabetas', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'pvz., Penicillin', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Rodyti, kai užrakinta</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Atlikta' : 'Išsaugoti'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Pasirinkite kontaktą</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Sveikata', '#fff', ICON2.health]]), target: 'health', say: '<strong>Medicininis ID</strong> leidžia medikams pamatyti jūsų alergijas ir kritinės padėties kontaktą, net kai telefonas užrakintas. <strong>Atidarykite programą Sveikata.</strong>'},
            {screen: () => app(p, 'Suvestinė', '<p class="cf">Čia rodomi jūsų sveikatos duomenys.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Palieskite savo nuotrauką</strong> viršuje dešinėje.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Sveikatos duomenys'}, {id: 'medical', label: 'Medicininis ID'}], {back: 'Suvestinė'}), target: 'medical', say: '<strong>Palieskite Medicininis ID.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Telefone galima saugoti <strong>medicininę informaciją</strong>, kurią medikai gali matyti net užrakintą. <strong>Palieskite Nustatymai.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Nuslinkite žemyn ir <strong>palieskite Sauga ir kritinė padėtis</strong>. <em>„Samsung“ telefone tai Sauga ir kritinė padėtis.</em>'},
            {screen: () => list(p, 'Sauga ir kritinė padėtis', [{id: 'medical', label: 'Medicininė informacija'}, {id: 'contacts-ec', label: 'Kritinės padėties kontaktai'}, {id: 'sos', label: 'Pagalbos SOS'}]), target: 'medical', say: '<strong>Palieskite Medicininė informacija.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Pirmiausia įveskite alergiją (pratybai – „Penicillin“), tada pridėkite kritinės padėties kontaktą.',
         say: 'Užpildykite viską, ką turėtų žinoti medikai. Pratybai alergijų skiltyje įveskite <strong>Penicillin</strong>. Tada <strong>palieskite pridėti kritinės padėties kontaktą</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Pasirinkite, kam skambinti kritinės padėties atveju. <strong>Palieskite Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '„Rodyti, kai užrakinta“ įjungta, todėl medikai tai mato. <strong>Palieskite Atlikta.</strong>' : '<strong>Palieskite Išsaugoti.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Medicininis ID' : 'Medicininė informacija', [{label: 'Alergijos', sub: typed(c, 'allergies')}, {label: 'Kritinės padėties kontaktas', sub: 'Sarah (dukra)'}]),
         question: {q: p === 'ios' ? 'Kaip medikas pamatytų jūsų Medicininį ID, jei telefonas užrakintas?' : 'Kaip medikas tai pamatytų, jei telefonas užrakintas?', options: [
            {t: 'Per mygtuką „Kritinė padėtis“ užrakinimo ekrane', ok: true, why: 'Taip. Palietus Kritinė padėtis užrakinimo ekrane, parodoma jūsų medicininė informacija neatrakinant telefono.'},
            {t: 'Negali', why: 'Gali: mygtukas Kritinė padėtis užrakinimo ekrane tai parodo nereikalaujant kodo.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Medicininis ID' : 'Medicininė informacija', [{label: 'Alergijos', sub: typed(c, 'allergies')}, {label: 'Kritinės padėties kontaktas', sub: 'Sarah (dukra)'}]), done: true,
         say: '<strong>Šaunu!</strong> Jūsų medicininė informacija ir kritinės padėties kontaktas išsaugoti. Jei kviečiate pagalbą per Pagalbos SOS, apie tai pranešama ir jūsų kritinės padėties kontaktui.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Rasti' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Grojamas garsas…' : '⟦volume-2⟧ Groti garsą'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Pažymėti kaip prarastą' : 'Apsaugoti įrenginį'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Jei telefonas kada nors pasimestų, galėsite jį rasti, priversti skambėti ar užrakinti, bet tik jei tai iš anksto įjungta. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Palieskite savo vardą</strong> viršuje.'},
            {screen: () => list(p, '„Apple“ paskyra', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Rasti'}, {id: 'family', label: 'Šeimos bendrinimas'}], {back: 'Nustatymai'}), target: 'findmy', say: '<strong>Palieskite Rasti.</strong>'},
            {screen: c => list(p, 'Rasti', [{id: 'find-toggle', label: 'Rasti „iPhone“', toggle: !!c.findOn}, {label: 'Siųsti paskutinę vietą', toggle: !!c.findOn}], {back: '„Apple“ paskyra'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Įjunkite Rasti „iPhone“.</strong> „Siųsti paskutinę vietą“ išsiunčia jo vietą prieš pat išsikraunant akumuliatoriui.'},
            {screen: () => homeWith(p, [['findmy', 'Rasti', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Dabar įsivaizduokite, kad nerandate telefono. Kitame „Apple“ įrenginyje atidarytumėte <strong>Rasti</strong> (arba kompiuteryje eitumėte į icloud.com/find). Čia <strong>palieskite Rasti</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Nuslinkite žemyn ir <strong>palieskite Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Visos paslaugos'}, {id: 'account', label: 'Tvarkykite savo Google paskyrą'}]), target: 'all-services', say: '<strong>Palieskite Visos paslaugos.</strong>'},
            {screen: () => list(p, 'Visos paslaugos', [{id: 'find-hub', label: 'Find Hub', sub: 'Anksčiau vadinta Rasti įrenginį'}, {id: 'theft', label: 'Apsauga nuo vagystės'}]), target: 'find-hub', say: '<strong>Palieskite Find Hub</strong> (anksčiau vadinosi Rasti įrenginį). <em>„Samsung“ turi ir savo: Nustatymai &gt; Sauga ir privatumas &gt; Pamesto įrenginio apsauga.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Naudoti Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Įjunkite Naudoti Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Dabar įsivaizduokite, kad nerandate telefono. Kitame telefone ar planšetėje atidarytumėte <strong>Find Hub</strong> arba kompiuteryje eitumėte į google.com/android/find. Čia <strong>palieskite Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Štai jis, žemėlapyje. Jei jis kažkur netoliese, pavyzdžiui, įkrito už sofos, <strong>palieskite Groti garsą</strong>: jis garsiai skamba, net tylusis režimas netrukdo.'},
        {screen: c => findMap(p, c), question: {q: 'Žemėlapyje telefonas rodomas vietoje, kurioje niekada nebuvote. Ką daryti?', options: [
            {t: 'Naudoti Pažymėti kaip prarastą arba Apsaugoti įrenginį, kad jį užrakinčiau, ir susisiekti su policija', ok: true, why: 'Taip. Užrakinkite jį per Rasti arba Find Hub, patys ten neikite ir praneškite policijai bei savo ryšio operatoriui.'},
            {t: 'Nueiti ir pasiimti jį patiems', why: 'Niekada nesiginčykite su vagimi. Užrakinkite telefoną nuotoliniu būdu ir susisiekite su policija.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Šaunu!</strong> Telefono paieška įjungta ir žinote, kaip priversti jį skambėti ar užrakinti.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Nemokami technologijų patarimai</strong>${UI.qr}<small>Nuskaitykite mane</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Ištrinti šią nuotrauką?', p === 'ios' ? 'Ji 30 dienų bus laikoma skiltyje Neseniai ištrinti.' : 'Ji kurį laiką bus šiukšliadėžėje, kol bus pašalinta visam laikui.', [['cancel', 'Atšaukti'], ['confirm-delete', 'Ištrinti']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Atidarykite Fotoaparatą.</strong> <em>Patarimas: daugumoje telefonų taip pat galite braukti kairėn užrakinimo ekrane.</em>', hint: 'Fotoaparatas yra pilka piktograma su fotoaparatu.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Nukreipkite jį į gėles ir laikykite nejudant. <strong>Palieskite didelį apvalų mygtuką</strong>, kad nufotografuotumėte.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Spragt! Išsaugota. <strong>Palieskite mažą paveikslėlį</strong> kampe, kad ją pamatytumėte.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Norėdami pažiūrėti iš arčiau, padėkite du pirštus ant nuotraukos ir išskirkite juos. Čia <strong>du kartus palieskite ＋</strong>.', hint: 'Palieskite ＋ viršuje dešinėje.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Puiku! Norėdami ją kam nors išsiųsti, <strong>palieskite bendrinimo mygtuką</strong> ⇪ (dėžutė su rodykle).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Pasirinkite, kaip siųsti: per Žinutes, el. paštu, „WhatsApp“ ir pan. <strong>Palieskite Žinutės.</strong> (Tada pasirinktumėte, kam siųsti.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Išsiųsta! Dabar, jei nufotografuosite nuotrauką, kurios nenorite, <strong>palieskite šiukšliadėžę</strong> ⟦trash-2⟧, kad ją ištrintumėte.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Telefonas pirmiausia pasitikrina. <strong>Palieskite Ištrinti.</strong>'},
        {screen: () => app(p, 'Nuotraukos', '<p class="cf">Nuotraukų dar nėra.</p>', {back: false, color: '#fff'}), question: {q: 'Per klaidą ištrynėte nuotrauką! Ką galite daryti?', options: [
            {t: p === 'ios' ? 'Pažiūrėti Albumai > Neseniai ištrinti ir ją atkurti' : 'Pažiūrėti Šiukšliadėžėje (Biblioteka > Šiukšliadėžė) ir ją atkurti', ok: true, why: 'Taip. Ištrintos nuotraukos kurį laiką išsaugomos, dažniausiai maždaug mėnesį, todėl galite jas atgauti.'},
            {t: 'Nieko, jos nebėra visam laikui', why: 'Nesijaudinkite! Kurį laiką ji laikoma skiltyje Neseniai ištrinti („iPhone“) arba Šiukšliadėžėje („Android“).'}]}},
        {screen: () => app(p, 'Nuotraukos', '<p class="cf">Viskas atlikta.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Šaunu!</strong> Galite fotografuoti, priartinti, bendrinti ir ištrinti nuotraukas.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Jei jūsų šeima taip pat turi „iPhone“, <strong>FaceTime</strong> leidžia skambinti vaizdo skambučiais nemokamai. <strong>Palieskite FaceTime.</strong>' : '<strong>Google Meet</strong> leidžia skambinti vaizdo skambučiais nemokamai iš „Android“, taip pat į „iPhone“. <strong>Palieskite Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Naujas „FaceTime“' : 'Naujas'}</button><p class="cf">Čia atsiranda naujausi skambučiai.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Naujas „FaceTime“' : 'Naujas'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Naujas „FaceTime“' : 'Skambinti', `<div class="xz">To: ${field('callto', 'Vardas ar numeris', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Vaizdo skambutis'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Pirmiausia laukelyje „Kam“ įveskite Sarah.',
             say: 'Įveskite kieno nors iš jūsų kontaktų vardą. <strong>Įveskite Sarah</strong>, tada <strong>palieskite vaizdo mygtuką</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Skamba, tada Sarah atsiliepia. Kad parodytumėte jai sodą, <strong>palieskite apvertimo mygtuką</strong> ⟦switch-camera⟧, kad naudotumėte galinę kamerą.', hint: 'Palaukite, kol Sarah atsilieps, tada palieskite ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Kai baigsite, <strong>palieskite raudoną mygtuką</strong>, kad padėtumėte ragelį.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Vaizdo · 3 min.</p>', {back: false, color: '#fff'}), question: {q: 'Jūsų draugas turi „Android“ telefoną, o jūs „iPhone“. Ar vis tiek galite skambinti vaizdo skambučiu?', options: [
                {t: 'Taip, per „WhatsApp“ ar Google Meet, kurie veikia abiejuose', ok: true, why: 'Būtent. „FaceTime“ daugiausia veikia tarp „iPhone“. „WhatsApp“ ir Google Meet veikia abiejuose.'},
                {t: 'Ne, niekada', why: 'Galite: „WhatsApp“ ir Google Meet veikia abiejų tipų telefonuose.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Viskas atlikta.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Šaunu!</strong> Paskambinote vaizdo skambučiu ir parodėte vaizdą iš galinės kameros.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR kodai yra tie kvadratiniai juodai balti raštai ant plakatų ir meniu. Jūsų kamera gali juos nuskaityti, papildomos programos nereikia. <strong>Atidarykite Fotoaparatą.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Nukreipkite kamerą į kodą ir akimirką palaikykite nejudant. <strong>Ekrane atsiranda nuoroda</strong>: patikrinkite, ar ji atrodo kaip iš to, iš ko tikitės, tada <strong>palieskite ją</strong>.',
         hints: {shutter: 'Fotografuoti nereikia: tiesiog nukreipkite ir palaukite, kol atsiras nuoroda, tada palieskite nuorodą.'},
         hint: p === 'android' ? 'Palaukite, kol atsiras nuoroda, tada palieskite ją. Jei nieko neatsiranda, išbandykite Google Lens.' : 'Palaukite, kol atsiras nuoroda, tada palieskite ją.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Nemokami technologijų patarimai</h3><p>Paprastai parašyti patarimai apie telefonus, kompiuterius ir saugų naudojimąsi internetu.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Automobilių stovėjimo aikštelės mokėjimo aparate matote QR kodo lipduką. Koks saugiausias būdas sumokėti?', options: [
            {t: 'Naudoti oficialią aikštelės programą ar patį aparatą, o ne užklijuotą QR kodą', ok: true, why: 'Taip. Sukčiai užklijuoja netikrus QR kodus ant tikrųjų, kad pavogtų kortelių duomenis. Patikrinkite, ar tai lipdukas, ir naudokite oficialią programą ar ženklą.'},
            {t: 'Nuskaityti ir sumokėti, taip greičiau', why: 'Netikri QR lipdukai ant stovėjimo aikštelių aparatų yra žinomas sukčiavimas. Naudokite oficialią programą ar patį aparatą.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Nemokami technologijų patarimai</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Šaunu!</strong> Galite nuskaityti QR kodus kamera ir žinote, kad pirmiausia reikia patikrinti nuorodą.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Sekmadienio nuotraukos 📷', 'Labas, mama, štai nuotraukos iš pietų…'],
                       ['tv', 'TV Licensing', 'Jūsų licencija PASIBAIGĖ', 'Veikite dabar, kad išvengtumėte baudžiamojo persekiojimo. Atnaujinkite savo mokėjimo…'],
                       ['library', 'Bridlington biblioteka', 'Jūsų knygas reikia grąžinti', 'Jūsų paimtus leidinius reikia grąžinti penktadienį.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Gauti' : 'Pagrindiniai', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · man</p><h3>Sekmadienio nuotraukos 📷</h3><p>Labas, mama, štai nuotraukos iš pietų. Buvo malonu tave pamatyti! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Parašykite atsakymą…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Jūsų licencija PASIBAIGĖ</h3><p>Veikite dabar, kad išvengtumėte baudžiamojo persekiojimo. Per 24 valandas atnaujinkite savo mokėjimo duomenis: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Perkelti į Šlamštą' : '⋮ Pranešti apie sukčiavimą'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Paštas' : 'jūsų el. pašto programa (daugumoje „Android“ telefonų – Gmail)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Nauji laiškai rodomi paryškintai. <strong>Palieskite Sarah laišką</strong>, kad jį perskaitytumėte.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Norėdami atsakyti, <strong>palieskite Atsakyti</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Pirmiausia įrašykite trumpą atsakymą, tada palieskite Siųsti.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Įrašykite trumpą atsakymą</strong> (pvz., „Ačiū, labai patinka!“) ir <strong>palieskite Siųsti</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Išsiųsta ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Atgal į gautus laiškus</button>', {color: '#fff'}), target: 'back', say: '<strong>Palieskite Atgal</strong>, kad grįžtumėte į gautus laiškus.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Yra nerimą keliantis laiškas iš „TV Licensing“. <strong>Atidarykite jį</strong>, bet nieko jame nepalieskite.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Sukčių laiškuose dažnai naudojamas tikras pavadinimas, bet netikras adresas. <strong>Palieskite siuntėjo vardą</strong>, kad pamatytumėte tikrą el. pašto adresą.',
         hint: 'Palieskite „TV Licensing“ laiško viršuje.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Jis iš <strong>outlook-mail.com</strong>, o ne tvlicensing.co.uk. Tai sukčiavimas. <strong>Palieskite ' + (p === 'ios' ? 'Perkelti į Šlamštą' : 'Pranešti apie sukčiavimą') + '.</strong> Sukčių laiškus taip pat galite persiųsti į report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Kas išdavė sukčiavimą?', options: [
            {t: 'Tikrasis siuntėjo adresas, grasinimai ir 24 valandų terminas', ok: true, why: 'Būtent. Tikros organizacijos negrasina terminais, o jų laiškai ateina iš jų pačių interneto adreso.'},
            {t: 'Nieko, atrodė tikras', why: 'Patikrinkite siuntėjo adresą: tai nebuvo „TV Licensing“ adresas. Grasinimai ir trumpi terminai taip pat yra didelis įspėjamasis ženklas.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Šaunu!</strong> Galite skaityti laiškus ir į juos atsakyti, atpažinti sukčiavimą ir apie jį pranešti.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Gauti' : 'Įdiegti';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play parduotuvė'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Palieskite Paieška.</strong>' : '<strong>Palieskite paieškos juostą.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Ieškojome „NHS App“. Daug programų savo pavadinime turi „NHS“. Patikrinkite, <strong>kas ją sukūrė</strong>: tikrąją sukūrė <strong>NHS England</strong>. <strong>Palieskite ' + (p === 'ios' ? 'Gauti' : 'Įdiegti') + ' šalia tikrosios.</strong>',
         hints: {'fake1-get': 'Ją sukūrė HealthApps Ltd, ir tai reklama. Tikrąją NHS App sukūrė NHS England.', 'fake2-get': 'Ją sukūrė QuickDev Apps, o ne NHS. Tikrąją sukūrė NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Įdiegta! Dabar pašalinkite programą, kuria niekada nesinaudojate, kad sutvarkytumėte ir atlaisvintumėte vietos. <strong>Paspauskite ir palaikykite programą Orai</strong>, kol atsiras meniu.', hint: 'Laikykite pirštą ant piktogramos Orai sekundę ar dvi.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Pašalinti „Orai“?' : 'Orai', p === 'ios' ? 'Pašalinus iš pradžios ekrano, programa liks jūsų programų bibliotekoje.' : '', p === 'ios'
            ? [['delete-app', 'Ištrinti programą'], ['remove-home', 'Pašalinti iš pradžios ekrano'], ['cancel', 'Atšaukti']] : [['app-info', 'Programos informacija'], ['delete-app', 'Pašalinti'], ['cancel', 'Atšaukti']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Palieskite Pašalinti programą</strong>, tada <strong>Ištrinti programą</strong> (čia tai vienas mygtukas).' : '<strong>Palieskite Pašalinti.</strong>',
         hints: {'remove-home': 'Tai tik paslepia piktogramą, programa lieka telefone. Palieskite Ištrinti programą.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Programa prašo sumokėti, kad „atrakintų“ jūsų NHS įrašus. Ką manote?', options: [
            {t: 'Tai ne tikroji NHS App, kuri visiškai nemokama', ok: true, why: 'Būtent. NHS App nemokama. Ištrinkite viską, kas prašo mokėti už NHS paslaugas.'},
            {t: 'Sumokėti, juk tai NHS', why: 'Tikroji NHS App nemokama ir ją sukūrė NHS England. Programa, prašanti pinigų, nėra tikroji.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Šaunu!</strong> Galite atskirti tikras programas nuo klastočių ir pašalinti nereikalingas programas.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Sveiki sugrįžę.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Prisijungti su Face ID' : 'Prisijungti su piršto atspaudu'}</button>
                <button type="button" class="cp" data-tap="password">Prisijungti su el. paštu ir slaptažodžiu</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Receptai'], ['appointments', '⟦calendar⟧', 'Vizitai'], ['records', '⟦clipboard-list⟧', 'Jūsų sveikata'], ['messages', '⟦mail⟧', 'Žinutės']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Receptai', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Užsakyti pakartotinį receptą</strong><small>Pasirinkite vaistus, kurie jums jau išrašyti</small></button><div class="ck"><strong>Peržiūrėti užsakymus</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipino 5 mg tabletės'], ['med-2', 'Atorvastatino 20 mg tabletės']];
            return app(p, 'Pasirinkite vaistus', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Patvirtinkite užsakymą', `<p class="cf">Amlodipino 5 mg tabletės<br>Atsiimti: jūsų nurodytoje vaistinėje</p><button type="button" class="ce co" data-tap="confirm">Patvirtinti ir užsakyti</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Užsakymas išsiųstas', '<p class="cf">⟦check⟧ Jūsų recepto prašymas išsiųstas jūsų šeimos gydytojo kabinetui. Paprastai tai užtrunka 2–3 darbo dienas.</p><button type="button" class="cp" data-tap="home">Atgal į pradžią</button>', {color: NHS});
        return app(p, 'Vizitai', '<div class="fo"><div class="ck"><strong>Vizitas pas šeimos gydytoją</strong><small>Antradienį 10:30 · Jūsų šeimos gydytojo kabinetas</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> yra nemokama ir leidžia užsakyti pakartotinius receptus, matyti vizitus ir dar daugiau. (Ši mokomoji versija netikra, sukurta tik šiai pamokai.) <strong>Palieskite NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Kai nustatysite per NHS login, galėsite prisijungti naudodami ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Palieskite Prisijungti su ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Tai irgi tinka, bet veidas ar piršto atspaudas greitesni. Palieskite mėlyną mygtuką.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Palieskite Receptai.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Palieskite Užsakyti pakartotinį receptą.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Pirmiausia palieskite vaistą, kad jį pažymėtumėte, tada palieskite Tęsti.',
         say: '<strong>Palieskite jums reikalingą vaistą</strong>, kad jį pažymėtumėte (išbandykite Amlodipiną), tada <strong>palieskite Tęsti</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Patikrinkite, ar viskas gerai, tada <strong>palieskite Patvirtinti ir užsakyti</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Išsiųsta jūsų gydytojo kabinetui! <strong>Palieskite Atgal į pradžią.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Taip pat galite pasitikrinti vizitus. <strong>Palieskite Vizitai.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'SMS sako: „NHS: jums priklauso nemokamas testų rinkinys, įveskite banko duomenis, kad sumokėtumėte už siuntimą“. Kas tai?', options: [
            {t: 'Sukčiavimas. NHS niekada neprašo banko duomenų SMS žinute', ok: true, why: 'Būtent. Naudokite NHS App arba tiesiogiai kreipkitės į savo gydytojo kabinetą, niekada nespauskite SMS nuorodų.'},
            {t: 'Tikra, juk tik siuntimas', why: 'NHS niekada nesiunčia SMS, prašančių banko duomenų. Tai sukčiavimas: persiųskite numeriu 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Šaunu!</strong> Užsakėte pakartotinį receptą ir pasitikrinote vizitus.'},
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
        if (page === 'login') return app(p, 'Mokomasis bankas', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Prisijungti su Face ID' : 'Prisijungti su piršto atspaudu'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Jūsų sąskaitos', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Šiandien'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Šiandien'], ['txn-pension', 'Valstybinė pensija', '+£921.60', 'Vakar'], ['txn-water', 'Yorkshire Water tiesioginis debetas', '−£38.00', 'Pirm.']];
            return app(p, 'Einamoji sąskaita', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Mokėjimas', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Šiandien, 03:12 · Kortelė, baigiasi 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Užšaldyti kortelę</strong><small>${ctx.frozen ? 'Kortelė užšaldyta ⟦check⟧' : 'Iškart sustabdykite mokėjimus'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Pranešti apie šį mokėjimą</strong><small>Neatpažįstate? Pasakykite mums</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Bankas', BANK, ICON2.pound]]), target: 'bank',
         say: 'Banko programos leidžia bet kada pasitikrinti savo pinigus. (Tai netikras bankas pratyboms.) <strong>Atidarykite banko programą.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Prisijunkite naudodami ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Niekam neduokite savo bankininkystės kodo.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Palieskite savo Einamąją sąskaitą</strong>, kad pamatytumėte, kas įmokėta ir išmokėta.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Peržiūrėkite mokėjimus. Vieno jūs neatpažįstate: <strong>£249 3 val. nakties interneto svetainei, parduodančiai dovanų korteles</strong>. <strong>Palieskite jį.</strong>',
         hints: {'txn-tesco': 'Tai jūsų apsipirkimas. Ieškokite to, kurio neatpažįstate.', 'txn-pension': 'Tai jums mokama pensija. Ieškokite išsiskiriančio.', 'txn-water': 'Tai jūsų sąskaita už vandenį. Ieškokite išsiskiriančio.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Palieskite Užšaldyti kortelę</strong>. Tai iškart sustabdo tolesnius mokėjimus, o vėliau galite ją atšaldyti, jei paaiškės, kad viskas gerai.',
         hints: {report: 'Pirmiausia užšaldykite kortelę, kad sustabdytumėte tolesnius mokėjimus. Tada praneškite.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Užšaldėte kortelę. Kas toliau?', options: [
            {t: 'Paskambinti bankui numeriu 159 ar numeriu ant kortelės arba pranešti programoje', ok: true, why: 'Taip. Jie gali ištirti, atšaukti kortelę ir dažnai susigrąžinti pinigus. Kuo greičiau jiems pasakysite, tuo geriau.'},
            {t: 'Palaukti ir pažiūrėti, ar pasikartos', why: 'Iškart pasakykite savo bankui. Kuo greičiau jie sužinos, tuo daugiau gali padaryti.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Šaunu!</strong> Patikrinote sąskaitą, pastebėjote neatpažintą mokėjimą ir užšaldėte kortelę.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Mokomasis bankas</strong><span>•••• 4421</span><small>DEBETO</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `<p class="cf">Pridėkite kortelę, kad galėtumėte mokėti parduotuvėse telefonu.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Pridėti kortelę' : '＋ Pridėti į Wallet'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Pridėti kortelę', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Laikykite kortelę rėmelyje…' : 'Kortelė rasta ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Patikrinti kortelę', `<p class="cf">Bankas turi patikrinti, ar tai jūs. Pasirinkite, kaip gauti kodą:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>SMS žinutė</strong><small>numeriu ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Paskambinti bankui</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Įveskite kodą', `<div class="jp ex"><strong>Žinutės · dabar</strong><span>Mokomasis bankas: jūsų Wallet kodas 529173. Niekam jo neduokite.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Jūsų kortelė paruošta naudoti.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Laikykite prie skaitytuvo…' : 'Laikykite prie skaitytuvo…') : '⟦check⟧ Atlikta'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Wallet' : 'Wallet', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Mokėti telefonu greita ir saugu: parduotuvės nemato jūsų kortelės numerio. <strong>Atidarykite ${p === 'ios' ? 'Wallet' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Pridėti kortelę' : '＋ Pridėti į Wallet'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Telefonas kortelei perskaityti naudoja kamerą, tad numerio įvesti nereikia. <strong>Laikykite kortelę rėmelyje</strong>, tada <strong>palieskite Pirmyn</strong>. <em>Niekada neįveskite kortelės numerio svetainėje, atėjusioje per SMS ar el. laišką.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Bankas tikrina, ar tai tikrai jūs. <strong>Palieskite SMS žinutė.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Iš banko SMS žinute ateina kodas. <strong>Įveskite 5 2 9 1 7 3.</strong> Prisiminkite: šis kodas įvedamas tik jūsų pačių telefone ir niekada neduodamas tam, kas jo prašo.', hint: 'Įveskite kodą iš žinutės: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Jūsų kortelė paruošta. Dabar sumokėkime parduotuvėje. <strong>Palieskite bet kurioje kortelės vietoje.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'Prie kasos <strong>du kartus paspauskite šoninį mygtuką</strong> „iPhone“ (čia du kartus palieskite ⟦power⟧), pažiūrėkite į ekraną dėl Face ID, tada laikykite telefono viršų prie kortelių skaitytuvo.', hint: 'Du kartus palieskite šoninį mygtuką ⟦power⟧.'}
            : {target: 'pay-now', say: 'Prie kasos tiesiog <strong>atrakinkite telefoną ir laikykite jo galą prie kortelių skaitytuvo</strong>. Čia <strong>palieskite kortelių skaitytuvą</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Ar saugu mokėti telefonu?', options: [
            {t: 'Taip, saugiau nei kortele: reikia jūsų veido, piršto atspaudo ar kodo, o parduotuvės nemato jūsų kortelės numerio', ok: true, why: 'Būtent. O jei pamestumėte telefoną, niekas negalės juo sumokėti jo neatrakinęs.'},
            {t: 'Ne, juo gali naudotis bet kas', why: 'Kiekvienam mokėjimui reikia jūsų veido, piršto atspaudo ar kodo, todėl tai iš tikrųjų saugiau nei bekontaktė kortelė.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Šaunu!</strong> Jūsų kortelė yra telefone ir atlikote mokomąjį mokėjimą.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>DEBETO</small></div>', '<small>DEBETO</small></div></button>');
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
            return app(p, 'Mokomasis geležinkelis', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Pasirinkite stotį'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Pridėti nuolaidų kortelę'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Pasirinkite stotį</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Pridėti nuolaidų kortelę</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Be nuolaidų kortelės']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Tiesioginis'], ['t-1145', '11:45', '12:32', 'Tiesioginis'], ['t-1245', '12:45', '13:32', 'Tiesioginis']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Kainos išgalvotos šiai pratybai. Pritaikyta nuolaidų kortelės nuolaida.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Ne piko vienos krypties bilietas</strong><span>£7,40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Ne piko dienos bilietas pirmyn ir atgal</strong><small>Grįžkite šiandien</small><span>£9,85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Jūsų bilietas', `<div class="adt"><strong>Ne piko dienos bilietas pirmyn ir atgal</strong><span>Bridlington ⇄ Hull</span><span>Šiandien · Senior Railcard</span>
            ${UI.qr}<small>Nuskaitykite jį prie bilietų vartų arba parodykite konduktoriui.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Traukiniai', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Traukinių programos leidžia pirkti bilietus telefone be eilės. (Ši mokomoji programa netikra: kainos ir laikai išgalvoti.) <strong>Atidarykite Traukinius.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Važiuojate iš Bridlington. <strong>Palieskite Į</strong>, kad pasirinktumėte, kur važiuojate.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Palieskite Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Daugiau nei 60 metų? <strong>Senior Railcard</strong> sutaupo trečdalį daugumos bilietų kainos. <strong>Palieskite Nuolaidų kortelė</strong>, kad pridėtumėte savo.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Palieskite Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Palieskite Rasti traukinius.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Štai traukiniai. <strong>Palieskite 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Grįžtate šiandien? Dienos bilietas pirmyn ir atgal dažniausiai pigesnis nei du vienos krypties. <strong>Palieskite Ne piko dienos bilietas pirmyn ir atgal</strong>, tada sumokėkite.',
         hints: {single: 'Vienos krypties bilietas tinka tik į vieną pusę. Šiandien grįžtate, todėl palieskite Ne piko dienos bilietas pirmyn ir atgal.', pay: 'Pirmiausia pasirinkite bilietą: palieskite Ne piko dienos bilietas pirmyn ir atgal.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Palieskite ${p === 'ios' ? 'Mokėti' : 'G Pay'}</strong>, kad sumokėtumėte telefone esančia kortele (iš bekontakčių mokėjimų pamokos).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Prieš kelionę namo telefono akumuliatorius senka. Ką verta padaryti?', options: [
            {t: 'Nufotografuoti bilieto ekraną ir įjungti akumuliatoriaus taupymą', ok: true, why: 'Taip. Kai kurie bilietai tinka ir iš ekrano kopijos, o taupymas padeda akumuliatoriui ilgiau išsilaikyti. Daug programų taip pat leidžia pridėti bilietą į Wallet.'},
            {t: 'Nieko, bus gerai', why: 'Jei telefonas išsijungs, bilieto negalėsite parodyti. Padarykite ekrano kopiją ir taupykite akumuliatorių.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Šaunu!</strong> Suplanavote kelionę, pridėjote nuolaidų kortelę ir nusipirkote bilietą telefone.'},
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

    const busTable = `<div class="sj"><strong>Autobusas 121: Bridlington – Hull</strong><small>Tik mokomieji laikai</small>
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
        return app(p, 'Autobusų laikai', busTable, {back: false, color: '#fff',
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
            ? 'Ekrano kopija yra viso to, kas rodoma ekrane, nuotrauka, pavyzdžiui, šių autobusų laikų. Tuo pačiu metu paspauskite <strong>šoninį mygtuką</strong> (dešinėje) ir <strong>garsumo didinimo mygtuką</strong> (kairėje), tada paleiskite. Čia <strong>palieskite šoninį mygtuką, tada garsumo didinimo</strong>.'
            : 'Ekrano kopija yra viso to, kas rodoma ekrane, nuotrauka, pavyzdžiui, šių autobusų laikų. Tuo pačiu metu paspauskite <strong>maitinimo mygtuką</strong> ir <strong>garsumo mažinimo mygtuką</strong>, tada paleiskite. Čia <strong>palieskite maitinimo mygtuką, tada garsumo mažinimo</strong>.',
         hints: {'vol-down': p === 'ios' ? '„iPhone“ tai garsumo DIDINIMAS su šoniniu mygtuku.' : 'Pradėkite nuo maitinimo mygtuko, dešinės pusės viršuje.',
                 'vol-up': p === 'ios' ? 'Pradėkite nuo šoninio mygtuko dešinėje.' : '„Android“ tai garsumo MAŽINIMAS su maitinimo mygtuku.',
                 side: 'Dabar garsumo didinimo mygtukas kairėje.', power: 'Dabar garsumo mažinimo mygtukas.'},
         hint: p === 'ios' ? 'Šoninis mygtukas yra dešiniajame krašte. Garsumo didinimas – kairėje.' : 'Maitinimo mygtukas yra viršutinis mygtukas dešiniajame krašte.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Spragt! Apatiniame kampe atsiranda mažas paveikslėlis. <strong>Palieskite jį</strong>, kad pamatytumėte ekrano kopiją. <em>Jei paliksite, po kelių sekundžių ji išsaugoma pati.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Čia galite ant jos piešti ar ją apkarpyti. <strong>Viršuje kairėje palieskite Atlikta</strong>.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Palieskite Išsaugoti nuotraukose.</strong>', hints: {'delete-shot': 'Taip ji būtų išmesta. Palieskite Išsaugoti nuotraukose.', 'save-files': 'Failai irgi tinka, bet Nuotraukas rasti lengviau. Palieskite Išsaugoti nuotraukose.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Spragt! Atsiranda mažas paveikslėlis su mygtukais apačioje. Ji jau išsaugota. <strong>Palieskite Bendrinti</strong>, kad kam nors išsiųstumėte.', hints: {'shot-edit': 'Redaguoti leidžia apkarpyti ar piešti ant jos. Kol kas palieskite Bendrinti.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Palieskite Sarah</strong>, kad išsiųstumėte jai autobusų laikus.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Kur vėliau rasite savo ekrano kopijas?', options: [
            {t: 'Programoje Nuotraukos, albume Ekrano kopijos', ok: true, why: 'Taip. Jos išsaugomos kartu su nuotraukomis, todėl galite jas žiūrėti, bendrinti ar ištrinti kaip bet kurią nuotrauką.'},
            {t: 'Jos pranyksta po dienos', why: 'Jos lieka, kol jas ištrinsite. Ieškokite programoje Nuotraukos, albume Ekrano kopijos.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Šaunu!</strong> Ekrano kopijos praverčia autobusų laikams, bilietams, klaidų pranešimams ir viskam, ką norite išsaugoti ar kam nors parodyti. Baigę galite jas ištrinti iš Nuotraukų.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Ieškoti Žemėlapiuose'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah atsiuntė jums adresą SMS žinute. Nukopijavę jį nereikės rašyti iš naujo. <strong>Atidarykite Žinutes.</strong>'},
        {screen: () => app(p, 'Žinutės', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Palieskite Sarah žinutę.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Paspauskite ir palaikykite žinutę su adresu</strong> (laikykite pirštą sekundę ar dvi), kol atsiras meniu.', hint: 'Laikykite pirštą ant antrosios žinutės, kol atsiras meniu.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Palieskite Kopijuoti.</strong> Dabar telefonas prisimena žodžius ir jie paruošti įklijuoti kitur.',
         hints: {reply: 'Atsakyti pradėtų žinutę. Palieskite Kopijuoti.', forward: 'Persiųsti išsiunčia žinutę kam nors. Palieskite Kopijuoti.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Nukopijuota! Dabar eikite į pradžios ekraną. Čia <strong>palieskite juostą ekrano apačioje</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Atidarykite Žemėlapius</strong>, kad rastumėte adresą.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Paspauskite ir palaikykite paieškos laukelį</strong>, kol atsiras mažas mygtukas „Įklijuoti“.', hint: 'Laikykite pirštą ant paieškos laukelio viršuje.',
         hints: {'search-tap': 'Trumpas palietimas atidaro klaviatūrą. Verčiau paspauskite ir palaikykite, kol atsiras Įklijuoti.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Palieskite Įklijuoti.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Atsiranda visas adresas be rašymo. <strong>Palieskite rezultatą.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Norite nukopijuoti tik telefono numerį iš ilgos žinutės vidurio. Kaip?', options: [
            {t: 'Paspausti ir palaikyti, tada palieskite Pasirinkti (arba vilkite mažus rankenėles), kad pasirinktumėte tik reikiamą dalį, tada Kopijuoti', ok: true,
             why: 'Taip. Vilkite rankenėles abiejose paryškintų žodžių pusėse, kad pasirinktumėte būtent tai, ko norite.'},
            {t: 'Galite nukopijuoti tik visą žinutę', why: 'Galite pasirinkti dalį: paspauskite ir palaikykite, palieskite Pasirinkti ir vilkite mažas rankenėles.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Šaunu!</strong> Kopijavimas ir įklijavimas veikia beveik visur: žinutėse, el. laiškuose, tinklalapiuose ir formose. Kopijuoti: paspauskite ir palaikykite; įklijuoti: paspauskite ir palaikykite.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Saugykla'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, '„iPhone“ saugykla', [{caption: 'REKOMENDACIJOS'},
                ctx.offloaded ? {label: 'Iškelti nenaudojamas programas', value: 'Įjungta ⟦check⟧'} : {id: 'offload', label: 'Iškelti nenaudojamas programas', sub: 'Sutaupykite 2,1 GB. Pašalina nenaudojamas programas, bet palieka jų duomenis.', value: 'Įjungti'},
                {caption: 'PROGRAMOS'}, {label: 'Nuotraukos', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'Bendra', top: bar});
        }
        return list(p, 'Saugykla', [{label: 'Nuotraukos ir vaizdo įrašai', value: '21,3 GB'}, {label: 'Programos', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Įskaitant „WhatsApp“'}, {label: 'Dokumentai ir kita', value: '4,1 GB'},
            {label: 'Sistema', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ Išvalyta 1,1 GB nereikalingų failų</p>' : '<button type="button" class="ce dk" data-tap="free-up">Atlaisvinti vietos</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Nustatymai', `<div class="fo">${[['account', 'Paskyra'], ['privacy', 'Privatumas'], ['chats', 'Pokalbiai'], ['notifications', 'Pranešimai'], ['storage', 'Saugykla ir duomenys'], ['help', 'Pagalba']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Saugykla ir duomenys', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Tvarkyti saugyklą', `<div class="iq"><span>„WhatsApp“ naudoja ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Didesni nei 5 MB</strong><small>Nėra ką peržiūrėti</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Daug kartų persiųsta</strong><small>112 elementų · 0,9 GB</small></div>
                <div class="he">POKALBIAI</div><div class="ck"><strong>Šeima</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Didesni nei 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Ištrinti 23 elementus?', 'Jie bus ištrinti iš „WhatsApp“. Nuotraukos, jau išsaugotos telefono galerijoje, liks ten.', [['cancel', 'Atšaukti'], ['confirm-delete', 'Ištrinti']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Rodoma „Saugykla beveik pilna“? Išsiaiškinkime, kas užima vietą. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Palieskite Bendra.</strong>'},
            {screen: () => list(p, 'Bendra', [{id: 'about', label: 'Apie'}, {id: 'update', label: 'Programinės įrangos naujinimas'}, {id: 'storage', label: '„iPhone“ saugykla'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN ir įrenginių valdymas'}], {back: 'Nustatymai'}),
             target: 'storage', say: '<strong>Palieskite „iPhone“ saugykla.</strong> Viskam suskaičiuoti reikia kelių sekundžių.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Spalvota juosta rodo, kas užima vietą. Pirmiausia greita nauda: <strong>Iškelti nenaudojamas programas</strong> pašalina kurį laiką nenaudotas programas, bet palieka jūsų duomenis, jei vėl jų norėtumėte. <strong>Palieskite Įjungti.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Palieskite Saugykla.</strong> <em>„Samsung“ telefone tai Akumuliatorius ir įrenginio priežiūra, tada Saugykla.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Spalvota juosta rodo, kas užima vietą. <strong>Palieskite Atlaisvinti vietos.</strong>'},
            {screen: () => app(p, 'Failai', `<div class="ke"><strong>Ištrinti nereikalingus failus</strong><small>1,1 GB laikinų programų failų</small><button type="button" class="ce dk" data-tap="clean">Išvalyti</button></div>
                <div class="ke"><strong>Ištrinti senas ekrano kopijas</strong><small>214 MB</small><span class="fd">Pasirinkti ir atlaisvinti vietos</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Nereikalingus failus saugu ištrinti: tai laikini failai, kurių programoms nereikia. <strong>Palieskite Išvalyti.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: '„WhatsApp“ naudoja 14,8 GB. Kas ją užpildo?', options: [
            {t: 'Vaizdo įrašai ir nuotraukos, kuriuos jums atsiuntė, ypač grupėse', ok: true, why: 'Taip. Kiekvienas šeimos ar grupės pokalbyje atsiųstas vaizdo įrašas išsaugomas telefone. „WhatsApp“ gali rasti ir ištrinti didžiuosius.'},
            {t: 'Jūsų tekstinės žinutės', why: 'Tekstas užima labai mažai vietos. Vietos užima žmonių siunčiami vaizdo įrašai ir nuotraukos, ypač grupėse.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Atidarykite „WhatsApp“.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? '„WhatsApp“ apačioje dešinėje palieskite <strong>Nustatymai</strong>. Čia jis jau atidarytas. <strong>Palieskite Saugykla ir duomenys.</strong>'
                          : '„WhatsApp“ viršuje palieskite <strong>tris taškus ⋮</strong>, tada <strong>Nustatymai</strong>. Čia jis jau atidarytas. <strong>Palieskite Saugykla ir duomenys.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Palieskite Tvarkyti saugyklą.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Daugiausia vietos sutaupantys elementai yra viršuje. <strong>Palieskite Didesni nei 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Tai dideli vaizdo įrašai, kuriuos jums atsiuntė. Jei norite kurį nors pasilikti, pirmiausia išsaugokite jį savo nuotraukose. <strong>Palieskite Pasirinkti viską.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Palieskite Ištrinti.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Tai ištrina tik kopijas „WhatsApp“ viduje. <strong>Palieskite Ištrinti</strong>, kad patvirtintumėte.', hints: {cancel: 'Atšaukus jie lieka. Šiai pratybai palieskite Ištrinti.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Šaunu!</strong> Atlaisvinote daugiau nei 7 GB. Verta tai daryti kas keletą mėnesių. Taip pat ištuštinkite <strong>Neseniai ištrinti</strong> programoje Nuotraukos, nes ištrintos nuotraukos dar 30 dienų užima vietą.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Pasaulio laikrodis'], ['alarms', 'Žadintuvai'], ['stopwatch', 'Chronometras'], ['timers', 'Laikmačiai']]
            : [['alarms', 'Žadintuvas'], ['world', 'Laikrodis'], ['timers', 'Laikmatis'], ['stopwatch', 'Chronometras']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Šiandien</small><strong>Londonas</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Australija</small><strong>Sidnėjus</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Tabletės')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Žadintuvas</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Pasaulio laikrodis' : 'Laikrodis') : (p === 'ios' ? 'Žadintuvai' : 'Žadintuvas')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Niekada'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Žadintuvas', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Žadintuvas gali kasdien priminti išgerti tabletes. <strong>Atidarykite programą Laikrodis.</strong>', hint: 'Tai juoda piktograma su baltu ciferblatu.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Palieskite ${p === 'ios' ? 'Žadintuvai' : 'Žadintuvas'}</strong> ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Palieskite +</strong>, kad pridėtumėte naują žadintuvą.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Tikrame telefone laikui nustatyti slinkite skaičius. Čia <strong>palieskite 08:00</strong>.', hints: {'t-07': 'Šiai pratybai pasirinkite 08:00.', 't-09': 'Šiai pratybai pasirinkite 08:00.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Jo reikia kasdien, ne tik vieną kartą. <strong>Palieskite Kartoti.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Kasdien'; }, say: '<strong>Palieskite Kasdien.</strong>',
         hints: {never: 'Niekada reiškia, kad suskamba tik vieną kartą. Palieskite Kasdien.', weekdays: 'Darbo dienomis praleidžia savaitgalį. Palieskite Kasdien.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Pirmiausia laukelyje Žymė įveskite žymę, pvz., Tabletės.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Žymė parodo, kam skirtas žadintuvas. <strong>Palieskite laukelį Žymė ir įveskite Tabletės</strong>, tada <strong>palieskite Išsaugoti</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Žadintuvas suskamba 8 val. Išgeriate tabletes. Kurį mygtuką spaudžiate?', options: [
            {t: 'Stabdyti', ok: true, why: 'Taip. Stabdyti išjungia jį iki rytojaus 8 val., nes jis kartojasi kasdien.'},
            {t: 'Atidėti', why: 'Atidėjus jis vėl suskamba maždaug po 9 minučių. Naudokite, jei reikia šiek tiek daugiau laiko, bet Stabdyti išjungia iki rytojaus.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Šaunu!</strong> Jūsų tablečių žadintuvas kas rytą suskamba 8 val. ' + (p === 'ios' ? 'Programoje <strong>Sveikata</strong> taip pat yra skiltis Vaistai, kuri primena ir veda žurnalą.' : 'Taip pat galite paprašyti Google: „Primink man kasdien 8 val. išgerti tabletes“.')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jei telefonas pasimestų ar sugestų, ar jūsų nuotraukos būtų saugios? Patikrinkime. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Palieskite savo vardą</strong> viršuje.'},
        {screen: () => list(p, '„Apple“ paskyra', [{id: 'personal', label: 'Asmeninė informacija'}, {id: 'security', label: 'Prisijungimas ir sauga'}, {id: 'payment', label: 'Mokėjimas ir pristatymas'}, {id: 'subscriptions', label: 'Prenumeratos'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Šeimos bendrinimas'}, {id: 'findmy', label: 'Rasti'}], {back: 'Nustatymai'}),
         target: 'icloud', say: '<strong>Palieskite iCloud.</strong> iCloud yra „Apple“ internetinė saugykla.'},
        {screen: c => list(p, 'iCloud', [{caption: 'SAUGYKLA: PANAUDOTA 4,2 GB IŠ 5 GB'}, {caption: 'IŠSAUGOTA ICLOUD'}, {id: 'photos', label: 'Nuotraukos', value: c.photoSync ? 'Įjungta' : 'Išjungta'}, {id: 'backup', label: 'iCloud atsarginė kopija', value: c.backedUp ? 'Įjungta' : 'Išjungta'},
            {label: 'Kontaktai', value: 'Įjungta'}, {label: 'Pastabos', value: 'Įjungta'}], {back: '„Apple“ paskyra'}),
         target: 'photos', say: 'Nuotraukos ir Atsarginė kopija abi yra <strong>Išjungtos</strong>. Tai reiškia, kad pamestas telefonas reikštų prarastas nuotraukas. <strong>Palieskite Nuotraukos.</strong>'},
        {screen: c => list(p, 'Nuotraukos', [{id: 'sync', label: 'Sinchronizuoti šį „iPhone“', toggle: !!c.photoSync, sub: 'Laiko jūsų nuotraukas ir vaizdo įrašus iCloud, todėl jie saugūs, jei prarastumėte telefoną.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Palieskite Sinchronizuoti šį „iPhone“</strong>, kad įjungtumėte.'},
        {screen: c => list(p, 'Nuotraukos', [{label: 'Sinchronizuoti šį „iPhone“', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Palieskite ‹ iCloud</strong>, kad grįžtumėte.'},
        {screen: c => list(p, 'iCloud', [{caption: 'SAUGYKLA: PANAUDOTA 4,2 GB IŠ 5 GB'}, {caption: 'IŠSAUGOTA ICLOUD'}, {id: 'photos', label: 'Nuotraukos', value: 'Įjungta'}, {id: 'backup', label: 'iCloud atsarginė kopija', value: 'Išjungta'}], {back: '„Apple“ paskyra'}),
         target: 'backup', say: 'Dabar sukurkite atsarginę kopiją visko kito: nustatymų, žinučių ir programų. <strong>Palieskite iCloud atsarginė kopija.</strong>'},
        {screen: c => list(p, 'Atsarginė kopija', [{id: 'backup-toggle', label: 'Kurti šio „iPhone“ atsarginę kopiją', toggle: !!c.backedUp, sub: 'Kuria atsarginę kopiją automatiškai kiekvieną naktį, kai „iPhone“ kraunasi, užrakintas ir prijungtas prie Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Palieskite Kurti šio „iPhone“ atsarginę kopiją</strong>, kad įjungtumėte.'},
        {screen: () => list('ios', 'Atsarginė kopija', [{label: 'Kurti šio „iPhone“ atsarginę kopiją', toggle: true}, {id: 'backup-now', label: 'Kurti atsarginę kopiją dabar', sub: 'Paskutinė sėkminga atsarginė kopija: Niekada'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Nuo šiol ji bus kuriama kiekvieną naktį. Pirmą kartą padarykite dabar: <strong>palieskite Kurti atsarginę kopiją dabar</strong>.'},
        {screen: c => list('ios', 'Atsarginė kopija', [{label: 'Kurti šio „iPhone“ atsarginę kopiją', toggle: true}, {label: c.busy ? 'Kuriama atsarginė kopija…' : 'Kurti atsarginę kopiją dabar', sub: c.busy ? 'Liko apie 5 minutės' : 'Paskutinė sėkminga atsarginė kopija: ką tik ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'SMS sako: „Jūsų iCloud saugykla pilna. Jūsų nuotraukos šiandien bus ištrintos. Sumokėkite 99 p čia: [link]“. Ką darote?', options: [
            {t: 'Nepaisau nuorodos. Patikrinu Nustatymai > mano vardas > iCloud, tada persiunčiu SMS numeriu 7726', ok: true, why: 'Taip. Tai dažnas sukčiavimas. „Apple“ nesiunčia SMS su nuorodomis ir niekada taip netrina jūsų nuotraukų. Savo tikrą saugyklą patikrinkite Nustatymuose.'},
            {t: 'Greitai sumoku, kad išsaugočiau nuotraukas', why: 'Tai sukčiavimas, siekiantis išgauti kortelės duomenis. Savo tikrą saugyklą patikrinkite Nustatymai > mano vardas > iCloud ir persiųskite SMS numeriu 7726.'}]}},
        {screen: () => list('ios', 'Atsarginė kopija', [{label: 'Kurti šio „iPhone“ atsarginę kopiją', toggle: true}, {label: 'Kurti atsarginę kopiją dabar', sub: 'Paskutinė sėkminga atsarginė kopija: ką tik ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Šaunu!</strong> Jūsų nuotraukos ir telefonas turi atsarginę kopiją. Nemokami 5 GB greitai prisipildo nuotraukomis; jei tai nutiks, daugiau vietos (iCloud+) kainuoja nedidelį mėnesinį mokestį, ir ją perkate tik Nustatymuose, niekada ne per SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Jei telefonas pasimestų ar sugestų, ar jūsų nuotraukos būtų saugios? Patikrinkime. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Palieskite Google.</strong> Jis netoli apačios.', hint: 'Nuslinkite sąrašą žemyn: Google yra netoli apačios.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Tvarkykite savo Google paskyrą', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Atsarginė kopija', sub: 'Išjungta'}, {id: 'autofill', label: 'Automatinis pildymas'}, {id: 'devices', label: 'Įrenginiai ir bendrinimas'}]),
         target: 'backup', say: 'Atsarginė kopija rodo <strong>Išjungta</strong>. <strong>Palieskite Atsarginė kopija.</strong> <em>„Samsung“ telefone tai Nustatymai > Paskyros ir atsarginė kopija.</em>'},
        {screen: c => list(p, 'Atsarginė kopija', [{id: 'backup-toggle', label: 'Atsarginė kopija per „Google One“', toggle: !!c.backedUp, sub: 'Kuria atsarginę programų, žinučių, skambučių istorijos, kontaktų ir nustatymų kopiją.'},
            {id: 'photos-backup', label: 'Nuotraukos ir vaizdo įrašai', sub: c.photoSync ? 'Įjungta · Google Photos' : 'Išjungta · Google Photos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Palieskite Atsarginė kopija per „Google One“</strong>, kad įjungtumėte.'},
        {screen: c => list(p, 'Atsarginė kopija', [{label: 'Atsarginė kopija per „Google One“', toggle: true}, {id: 'photos-backup', label: 'Nuotraukos ir vaizdo įrašai', sub: 'Išjungta · Google Photos'}]),
         target: 'photos-backup', say: 'Nuotraukos atskirai. <strong>Palieskite Nuotraukos ir vaizdo įrašai.</strong>'},
        {screen: c => list(p, 'Atsarginė kopija', [{id: 'photos-toggle', label: 'Kurti nuotraukų ir vaizdo įrašų atsarginę kopiją', toggle: !!c.photoSync, sub: 'Išsaugo juos Google Photos, todėl jie saugūs, jei prarastumėte telefoną.'},
            {label: 'Atsarginės kopijos kokybė', value: 'Saugyklos taupymas'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Palieskite Kurti nuotraukų ir vaizdo įrašų atsarginę kopiją</strong>, kad įjungtumėte.'},
        {screen: () => list(p, 'Atsarginė kopija', [{label: 'Kurti nuotraukų ir vaizdo įrašų atsarginę kopiją', toggle: true}, {id: 'backup-now', label: 'Kurti atsarginę kopiją dabar', sub: 'Paskutinė atsarginė kopija: Niekada'}]),
         target: 'backup-now', say: 'Nuo šiol kopija kuriama pati, per Wi-Fi. Pirmą kartą padarykite dabar: <strong>palieskite Kurti atsarginę kopiją dabar</strong>.'},
        {screen: c => list(p, 'Atsarginė kopija', [{label: 'Kurti nuotraukų ir vaizdo įrašų atsarginę kopiją', toggle: true}, {label: c.busy ? 'Kuriama atsarginė kopija…' : 'Kurti atsarginę kopiją dabar', sub: c.busy ? '1,204 items left' : 'Paskutinė atsarginė kopija: ką tik ⟦check⟧'}]), wait: 1500,
         question: {q: 'SMS sako: „Jūsų Google saugykla pilna. Jūsų nuotraukos šiandien bus ištrintos. Sumokėkite 99 p čia: [link]“. Ką darote?', options: [
            {t: 'Nepaisau nuorodos. Patikrinu Nustatymai > Google > Atsarginė kopija, tada persiunčiu SMS numeriu 7726', ok: true, why: 'Taip. Tai dažnas sukčiavimas. Google nesiunčia tokių SMS su nuorodomis. Savo tikrą saugyklą patikrinkite Nustatymuose.'},
            {t: 'Greitai sumoku, kad išsaugočiau nuotraukas', why: 'Tai sukčiavimas, siekiantis išgauti kortelės duomenis. Savo tikrą saugyklą patikrinkite Nustatymuose ir persiųskite SMS numeriu 7726.'}]}},
        {screen: () => list(p, 'Atsarginė kopija', [{label: 'Kurti nuotraukų ir vaizdo įrašų atsarginę kopiją', toggle: true}, {label: 'Kurti atsarginę kopiją dabar', sub: 'Paskutinė atsarginė kopija: ką tik ⟦check⟧'}]), done: true,
         say: '<strong>Šaunu!</strong> Jūsų nuotraukos ir telefonas turi atsarginę kopiją. Google suteikia 15 GB nemokamai; jei jie prisipildys, daugiau vietos kainuoja nedidelį mėnesinį mokestį, ir ją perkate tik Nustatymuose ar programoje Google One, niekada ne per SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 SVEIKINAME! 🎉</strong><p>Jūs išrinkti laimėti £500 pirkinių čekį!</p>
        <button type="button" class="aeb" data-tap="claim">ATSIIMKITE DABAR</button><small>Reklama</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Programos informacija', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>Sistemos paslauga</strong><small>Versija 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Atidaryti</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Pašalinti</button>
            <button type="button" data-tap="force-stop">Priverstinai sustabdyti</button></div>
            <div class="cj ex"><span class="hf"><strong>Akumuliatorius</strong><small>38 % naudojimas nuo paskutinio visiško įkrovimo</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Leidimai</strong><small>Rodyti virš kitų programų, Įrenginio administratorius</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'Sistemos paslauga', 'Ar norite pašalinti šią programą?', [['cancel', 'Atšaukti'], ['confirm-uninstall', 'Gerai']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>KALENDORIUS · dabar</strong>
            <span>⚠️ Jūsų „iPhone“ gali būti užkrėstas! Palieskite čia, kad išvalytumėte dabar.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Reklamos šokinėja jūsų pradžios ekrane, nors nė viena programa neatidaryta. Tai paprastai reiškia, kad įsivėlė bloga programa. Pirmiausia <strong>nepalieskite reklamos. Palieskite mažą ⟦x⟧, kad ją uždarytumėte.</strong>',
         hints: {claim: 'Niekada nepalieskite pačios reklamos. Ieškokite mažo ⟦x⟧ kampe.'}, hint: '⟦x⟧ yra mažas, reklamos viršutiniame dešiniajame kampe.'},
        {screen: () => home(p), target: 'settings', say: 'Blogos programos veikia nuolat, todėl sunaudoja daug akumuliatoriaus. Taip jas galima rasti. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Palieskite Akumuliatorius.</strong> <em>„Samsung“ telefone tai Akumuliatorius ir įrenginio priežiūra, tada Akumuliatorius.</em>'},
        {screen: () => list(p, 'Akumuliatorius', [{id: 'usage', label: 'Akumuliatoriaus naudojimas', sub: 'Žiūrėti naudojimą nuo paskutinio visiško įkrovimo'}, {label: 'Akumuliatoriaus tausojimo priemonė', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Palieskite Akumuliatoriaus naudojimas.</strong> <em>Kai kuriuose „Samsung“ telefonuose palieskite diagramą arba Žr. išsamiau.</em>'},
        {screen: () => list(p, 'Akumuliatoriaus naudojimas', [], {top: `<div class="nl">${[['Sistemos paslauga', 38], ['Ekranas', 21], ['WhatsApp', 12], ['YouTube', 8], ['Fotoaparatas', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Kuris iš šių atrodo netinkamai?', options: [
            {t: 'Sistemos paslauga: niekada ja nesinaudojote, o ji naudoja daugiausia akumuliatoriaus', ok: true, why: 'Taip. Blogos programos duoda sau nuobodžius pavadinimus, pvz., „Sistemos paslauga“ ar „Klaviatūros nustatymai“, kad jų nepastebėtumėte. Užsirašykite jos pavadinimą.'},
            {t: 'Ekranas', why: 'Ekranas visada naudoja daug akumuliatoriaus; tai normalu. Keista yra „Sistemos paslauga“, kuria niekada nesinaudojote.'},
            {t: 'WhatsApp', why: '„WhatsApp“ yra programa, kuria naudojatės, todėl tai normalu. Keista yra „Sistemos paslauga“.'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Dabar suraskime ją tarp programų. Grįžę į Nustatymus, <strong>palieskite Programos</strong>.'},
        {screen: () => list(p, 'Programos', [{caption: 'Neseniai atidarytos programos'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Žr. visas 46 programas'}, {id: 'default-apps', label: 'Numatytosios programos'}]),
         target: 'all-apps', say: '<strong>Palieskite Žr. visas programas.</strong>'},
        {screen: () => list(p, 'Visos programos', ['Skaičiuotuvas', 'Kalendorius', 'Fotoaparatas', 'Chrome', 'Laikrodis', 'Kontaktai', 'Gmail', 'Žemėlapiai'].map(n => ({label: n})).concat([{id: 'system-service', label: 'Sistemos paslauga'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Sąrašas išdėstytas abėcėlės tvarka. <strong>Palieskite Sistemos paslauga.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Mygtukas <strong>Pašalinti</strong> pilkas. Blogos programos taip daro, kad negalėtumėte jų pašalinti. Pirmiausia <strong>palieskite Priverstinai sustabdyti</strong>, kad ji nebeveiktų.',
         hints: {uninstall: 'Jis pilkas, todėl dar neveiks. Pirmiausia palieskite Priverstinai sustabdyti.', open: 'Neatidarykite jos. Palieskite Priverstinai sustabdyti.'}},
        {screen: () => list(p, 'Ieškoti nustatymuose', [{caption: 'Rezultatai pagal „įrenginio administratorius“'}, {id: 'device-admin', label: 'Įrenginio administratoriaus programos', sub: 'Sauga ir privatumas > Daugiau saugos nustatymų'}]),
         target: 'device-admin',
         say: 'Dabar atimkite jos ypatingą leidimą. Nustatymuose viršuje esančioje paieškos juostoje <strong>ieškokite „įrenginio administratorius“</strong>. Štai rezultatas: <strong>palieskite Įrenginio administratoriaus programos</strong>.'},
        {screen: c => list(p, 'Įrenginio administratoriaus programos', [{label: 'Rasti įrenginį', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'Sistemos paslauga', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Išjungti šią įrenginio administravimo programą?', 'Sistemos paslauga nebegalės neleisti jos pašalinti.', [['cancel', 'Atšaukti'], ['deactivate', 'Išjungti']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Rasti įrenginį yra Google paslauga ir tai gerai. <strong>Palieskite jungiklį šalia Sistemos paslauga.</strong>', hints: {'find-my': 'Palikite Rasti įrenginį įjungtą. Palieskite Sistemos paslauga.'}},
        {screen: c => list(p, 'Įrenginio administratoriaus programos', [{label: 'Rasti įrenginį', toggle: true, sub: 'Google'}, {label: 'Sistemos paslauga', toggle: true}],
            {overlay: dialog(p, 'Išjungti šią įrenginio administravimo programą?', 'Sistemos paslauga nebegalės neleisti jos pašalinti.', [['cancel', 'Atšaukti'], ['deactivate', 'Išjungti']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Palieskite Išjungti.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Grįžus į Sistemos paslauga, <strong>Pašalinti</strong> dabar veikia. <strong>Palieskite Pašalinti.</strong>', hints: {'force-stop': 'Ji jau sustabdyta. Palieskite Pašalinti.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Palieskite Gerai.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Pašalinta! Galiausiai paprašykite Google patikrinti, ar nėra dar ko nors. <strong>Atidarykite Play parduotuvę.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Žalingų programų nerasta' : 'Nuskaityti telefoną'}</strong>
            <small>${c.scanned ? 'Patikrinta ką tik' : 'Paskutinį kartą nuskaityta: prieš 3 savaites'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'Play parduotuvėje palieskite savo <strong>profilio nuotrauką</strong> (viršuje dešinėje), tada <strong>Play Protect</strong>. Čia jis jau atidarytas. <strong>Palieskite Nuskaityti.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Žalingų programų nerasta</strong><small>Patikrinta ką tik</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Šaunu!</strong> Radote blogą programą pagal akumuliatoriaus naudojimą, atėmėte jos ypatingą leidimą, ją pašalinote ir patikrinote telefoną. Kad to išvengtumėte: diekite programas tik iš Play parduotuvės ir būkite atsargūs su nemokamomis žibintuvėlio, „valymo“ ir „greitinimo“ programomis.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Kalendoriaus pranešime sakoma: „Jūsų „iPhone“ gali būti užkrėstas! Palieskite čia, kad išvalytumėte dabar.“ Kas tai?', options: [
            {t: 'Šlamštas, įsivėlęs į jūsų kalendorių. Nepalieskite jo', ok: true, why: 'Taip. Paliesdami „Leisti“ abejotinoje svetainėje, į „iPhone“ galite pridėti šlamšto kalendorių. Jo „įvykiai“ yra reklamos, panašios į įspėjimus. Su jūsų „iPhone“ viskas gerai.'},
            {t: 'Tikras „Apple“ įspėjimas', why: '„Apple“ nesiunčia įspėjimų apie virusus per Kalendorių. Tai šlamštas iš prenumeruojamo kalendoriaus. Nepalieskite.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Pašalinkime šlamšto kalendorių. <strong>Palieskite Nustatymai</strong>, o ne pranešimą.', hints: {notif: 'Nepalieskite įspėjimo. Palieskite Nustatymai.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Nuslinkite žemyn ir <strong>palieskite Programos</strong>.', hint: 'Programos yra paskutinėje grupėje.'},
        {screen: () => list(p, 'Programos', ['App Store', 'Knygos'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Kalendorius'}, {label: 'Fotoaparatas'}, {label: 'Kontaktai'}, {label: 'Paštas'}]), {back: 'Nustatymai'}),
         target: 'calendar', say: '<strong>Palieskite Kalendorius.</strong>'},
        {screen: () => list(p, 'Kalendorius', [{id: 'accounts', label: 'Kalendoriaus paskyros', value: '2'}, {label: 'Laiko juostos keitimas', value: 'Išjungta'}, {label: 'Numatytieji įspėjimo laikai'}], {back: 'Programos'}),
         target: 'accounts', say: '<strong>Palieskite Kalendoriaus paskyros.</strong>'},
        {screen: () => list(p, 'Kalendoriaus paskyros', [{caption: 'PASKYROS'}, {label: 'iCloud', sub: 'Kalendoriai, kontaktai ir dar 7'}, {id: 'subscribed', label: 'Prenumeruojami kalendoriai', value: '1'}], {back: 'Kalendorius'}),
         target: 'subscribed', say: 'iCloud yra jūsų pačių. <strong>Palieskite Prenumeruojami kalendoriai.</strong>'},
        {screen: () => list(p, 'Prenumeruojami kalendoriai', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Užsiprenumeruota'}], {back: 'Kalendoriaus paskyros'}),
         target: 'spam-cal', say: 'Štai jis: kalendorius, kurio niekada nenorėjote pridėti. <strong>Palieskite Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serveris', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Ištrinti paskyrą', danger: true}],
            {back: 'Atgal', overlay: c.askDelete ? dialog(p, 'Ar tikrai?', 'Tai ištrins kalendorių ir jo įvykius iš jūsų „iPhone“.', [['cancel', 'Atšaukti'], ['confirm-delete', 'Ištrinti paskyrą']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Palieskite Ištrinti paskyrą.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serveris', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Ištrinti paskyrą', danger: true}],
            {back: 'Atgal', overlay: dialog(p, 'Ar tikrai?', 'Tai ištrins kalendorių ir jo įvykius iš jūsų „iPhone“.', [['cancel', 'Atšaukti'], ['confirm-delete', 'Ištrinti paskyrą']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Palieskite Ištrinti paskyrą</strong>, kad patvirtintumėte.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Pašalinta. Dar vienas patikrinimas: abejotinos svetainės taip pat gali įdiegti „profilį“. <strong>Palieskite Bendra.</strong>'},
        {screen: () => list(p, 'Bendra', [{id: 'about', label: 'Apie'}, {id: 'update', label: 'Programinės įrangos naujinimas'}, {id: 'storage', label: '„iPhone“ saugykla'}, {id: 'vpn', label: 'VPN ir įrenginių valdymas'}], {back: 'Nustatymai'}),
         target: 'vpn', say: '<strong>Palieskite VPN ir įrenginių valdymas.</strong>'},
        {screen: c => list(p, 'VPN ir įrenginių valdymas', c.profileGone ? [{label: 'VPN', value: 'Neprijungta'}] : [{label: 'VPN', value: 'Neprijungta'}, {caption: 'KONFIGŪRAVIMO PROFILIS'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Nepatikrintas'}], {back: 'Bendra'}),
         target: 'profile', say: 'Jei čia matote profilį, kurio nepažįstate (iš darbo ar mokyklos tinka), pašalinkite jį. <strong>Palieskite Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Profilis', [{label: 'Free Phone Booster', sub: 'Nepatikrintas · Turi: interneto iškarpas, sertifikatus'}, {caption: ' '}, {id: 'remove-profile', label: 'Pašalinti profilį', danger: true}],
            {back: 'Atgal', overlay: c.askRemove ? dialog(p, 'Pašalinti profilį', 'Pašalinus šį profilį bus ištrinti visi jo nustatymai.', [['cancel', 'Atšaukti'], ['confirm-remove', 'Pašalinti']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Palieskite Pašalinti profilį</strong>. „iPhone“ paprašys jūsų kodo.'},
        {screen: c => list(p, 'Profilis', [{label: 'Free Phone Booster', sub: 'Nepatikrintas'}, {caption: ' '}, {label: 'Pašalinti profilį', danger: true}],
            {back: 'Atgal', overlay: dialog(p, 'Pašalinti profilį', 'Pašalinus šį profilį bus ištrinti visi jo nustatymai.', [['cancel', 'Atšaukti'], ['confirm-remove', 'Pašalinti']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Palieskite Pašalinti.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Šaunu!</strong> Netikri įspėjimai dingo. Kad tai nepasikartotų: svetainėse bet kuriame iššokančiame lange, prašančiame pridėti kalendorių ar profilį, palieskite <strong>Neleisti</strong> arba <strong>Uždaryti</strong>, o programas diekite tik iš App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Atšaukta · Baigiasi spalio 22 d.'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4,99 per savaitę · Atnaujinama spalio 22 d.'};
        return list(p, 'Prenumeratos', [{caption: p === 'ios' ? 'AKTYVIOS' : 'Aktyvi'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0,99 per mėnesį' : '£1,59 per mėnesį'},
            {caption: p === 'ios' ? 'NEAKTYVIOS' : 'Pasibaigusi'}, {label: 'Crossword Daily', sub: 'Pasibaigė kovo 3 d.'}], {back: p === 'ios' ? '„Apple“ paskyra' : 'Atgal'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'JŪSŲ PRENUMERATA' : 'Planas'}, {label: 'Savaitinis', sub: '£4,99 per savaitę. Pradėta kaip 3 dienų nemokamas bandomasis laikotarpis.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Atšaukti prenumeratą' : 'Atšaukti prenumeratą', danger: true}],
            {back: 'Prenumeratos', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Patvirtinti atšaukimą' : 'Atšaukti prenumeratą?', 'Galėsite naudotis iki spalio 22 d. Daugiau nebus imama mokesčio.', [['keep', p === 'ios' ? 'Ne dabar' : 'Palikti']].concat([['confirm-cancel', p === 'ios' ? 'Patvirtinti' : 'Atšaukti prenumeratą']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Nemokami bandomieji laikotarpiai dažnai be jūsų žinios virsta mokamais planais. Patikrinkime. <strong>Palieskite Nustatymai.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Palieskite savo vardą</strong> viršuje.'},
            {screen: () => list(p, '„Apple“ paskyra', [{id: 'personal', label: 'Asmeninė informacija'}, {id: 'security', label: 'Prisijungimas ir sauga'}, {id: 'payment', label: 'Mokėjimas ir pristatymas'}, {id: 'subscriptions', label: 'Prenumeratos'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Nustatymai'}),
             target: 'subscriptions', say: '<strong>Palieskite Prenumeratos.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Nemokami bandomieji laikotarpiai dažnai be jūsų žinios virsta mokamais planais. Patikrinkime. <strong>Atidarykite Play parduotuvę.</strong>'},
            {screen: c => app(p, 'Play parduotuvė', `<div class="hp"><span>SIŪLOME JUMS</span><strong>Programos pradžiai</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Palieskite savo profilio nuotrauką</strong>, apvalią raidę viršuje dešinėje.'},
            {screen: c => app(p, 'Play parduotuvė', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Palieskite Mokėjimai ir prenumeratos.</strong>'},
            {screen: () => list(p, 'Mokėjimai ir prenumeratos', [{id: 'methods', label: 'Mokėjimo būdai'}, {id: 'subscriptions', label: 'Prenumeratos', sub: 'Tvarkykite prenumeratas'}, {id: 'budget', label: 'Biudžetas ir istorija'}]),
             target: 'subscriptions', say: '<strong>Palieskite Prenumeratos.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '„Photo Editor Pro“ prasidėjo kaip nemokamas bandomasis laikotarpis, o dabar kainuoja <strong>£4,99 kas savaitę</strong>. Tai daugiau nei £250 per metus! <strong>Palieskite ją.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Atšaukti prenumeratą' : 'Atšaukti prenumeratą'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Patvirtinti' : 'Atšaukti prenumeratą'}.</strong>`, hints: {keep: 'Tai ir toliau mokama. Palieskite ' + (p === 'ios' ? 'Patvirtinti' : 'Atšaukti prenumeratą') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Ištrinate programą Photo Editor iš telefono. Ar tai sustabdo mokėjimus?', options: [
            {t: 'Ne. Reikia atšaukti prenumeratą, kaip ką tik padarėte', ok: true, why: 'Būtent. Programos ištrynimas NEatšaukia prenumeratos. Mokate, kol atšauksite ją čia.'},
            {t: 'Taip, ištrynus programą mokėjimai sustoja', why: 'Ne! Mokate, kol atšauksite pačią prenumeratą, čia.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Šaunu!</strong> Sutaupėte £4,99 per savaitę. Patarimas: pradėdami nemokamą bandomąjį laikotarpį, nustatykite žadintuvą dienai prieš jo pabaigą. Taip pat kartkartėmis peržiūrėkite savo banko programos reguliarių mokėjimų sąrašą.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Naujesniuose „iPhone“ yra <strong>Apple Intelligence</strong>: DI, kuris už jus rašo, apibendrina ir redaguoja. Galite jį išjungti. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Palieskite Apple Intelligence ir Siri.</strong>', hint: 'Jis trečioje grupėje, žemiau Pritaikymas neįgaliesiems.'},
        {screen: c => list(p, 'Apple Intelligence ir Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Rašymo įrankiai, pranešimų santraukos, Image Playground ir dar daugiau.'},
            {caption: 'PLĖTINIAI'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Išjungta' : 'Įjungta'}, {caption: 'SIRI'}, {label: 'Kalbėkite su Siri', value: '„Siri“ arba „Hey Siri“'}],
            {back: 'Nustatymai', overlay: c.askOff ? dialog(p, 'Išjungti Apple Intelligence?', 'Tokios funkcijos kaip Rašymo įrankiai ir santraukos nebebus pasiekiamos.', [['cancel', 'Atšaukti'], ['confirm-off', 'Išjungti']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Palieskite Apple Intelligence jungiklį</strong>, kad išjungtumėte.', hints: {chatgpt: 'ChatGPT darysime vėliau. Pirmiausia palieskite Apple Intelligence jungiklį.'}},
        {screen: c => list(p, 'Apple Intelligence ir Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'PLĖTINIAI'}, {label: 'ChatGPT', value: 'Įjungta'}],
            {back: 'Nustatymai', overlay: dialog(p, 'Išjungti Apple Intelligence?', 'Tokios funkcijos kaip Rašymo įrankiai ir santraukos nebebus pasiekiamos.', [['cancel', 'Atšaukti'], ['confirm-off', 'Išjungti']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Palieskite Išjungti.</strong>'},
        {screen: c => list(p, 'Apple Intelligence ir Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'PLĖTINIAI'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Įjungta'}], {back: 'Nustatymai'}),
         target: 'chatgpt', say: 'ChatGPT plėtinys gali siųsti jūsų klausimus į ChatGPT, bendrovę už „Apple“ ribų. <strong>Palieskite ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Naudoti ChatGPT', toggle: !c.gptOff, sub: 'Siri gali siųsti užklausas į ChatGPT.'}], {back: 'Atgal'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Palieskite Naudoti ChatGPT</strong>, kad išjungtumėte.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Naudoti ChatGPT', toggle: false}], {back: 'Atgal'}),
         question: {q: '„WhatsApp“, Facebook ir kitos programos taip pat turi DI pokalbius. Kokia saugi taisyklė?', options: [
            {t: 'Niekada neįvesti asmeninių duomenų (banko, sveikatos, slaptažodžių, adresų) į jokį DI pokalbį', ok: true, why: 'Taip. Tai, ką įvedate, gali būti saugoma ir naudojama DI mokyti. Elkitės taip, tarsi kalbėtumėte su nepažįstamuoju.'},
            {t: 'DI pokalbiai privatūs, todėl galima viską', why: 'Jie nėra privatūs kaip telefono skambutis. Tai, ką įvedate, gali būti saugoma. Asmeninių duomenų jiems neduokite.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Naudoti ChatGPT', toggle: false}], {back: 'Atgal'}), done: true,
         say: '<strong>Šaunu!</strong> Apple Intelligence ir ChatGPT išjungti. Bet kada galite įjungti juos vėl toje pačioje vietoje. Siri vis tiek veikia kaip įprasta.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '„Android“ telefonai dabar turi <strong>Gemini</strong>, Google DI. Laikant paspaudus maitinimo mygtuką, jis gali netyčia atsidaryti. Pakeiskime tai. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Palieskite Programos.</strong>'},
        {screen: () => list(p, 'Programos', [{caption: 'Neseniai atidarytos programos'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Žr. visas 45 programas'}, {id: 'default-apps', label: 'Numatytosios programos', sub: 'Pagelbiklio, naršyklės ir telefono programos'}]),
         target: 'default-apps', say: '<strong>Palieskite Numatytosios programos.</strong>'},
        {screen: () => list(p, 'Numatytosios programos', [{label: 'Naršyklės programa', sub: 'Chrome'}, {id: 'assistant', label: 'Skaitmeninio pagelbiklio programa', sub: 'Gemini'}, {label: 'Telefono programa', sub: 'Telefonas'}, {label: 'SMS programa', sub: 'Žinutės'}]),
         target: 'assistant', say: '<strong>Palieskite Skaitmeninio pagelbiklio programa.</strong>'},
        {screen: c => list(p, 'Skaitmeninio pagelbiklio programa', [{id: 'assistant-app', label: 'Numatytoji skaitmeninio pagelbiklio programa', sub: c.noAssist ? 'Nėra' : 'Gemini'}, {label: 'Naudoti ekrano tekstą', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Numatytoji skaitmeninio pagelbiklio programa</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nėra</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Palieskite Numatytoji skaitmeninio pagelbiklio programa.</strong>'},
        {screen: c => list(p, 'Skaitmeninio pagelbiklio programa', [{label: 'Numatytoji skaitmeninio pagelbiklio programa', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Numatytoji skaitmeninio pagelbiklio programa</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nėra</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Palieskite Nėra.</strong> Gemini nebeatsiras, kai laikysite paspaudę maitinimo mygtuką.', hints: {'assist-gemini': 'Tai palieka Gemini. Palieskite Nėra.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Toliau neleiskite Gemini saugoti to, ką jai įvedate. <strong>Atidarykite programą Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Sveika, Margaret<br><small>Kuo galiu padėti šiandien?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Palieskite savo profilio nuotrauką</strong> viršuje dešinėje.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Palieskite „Gemini“ programų veikla.</strong> <em>Kai kuriuose telefonuose tai vadinasi Saugoti veiklą.</em>'},
        {screen: c => app(p, '„Gemini“ programų veikla', `<p class="cf"><strong>${c.actOff ? 'Išjungta' : 'Įjungta'}</strong><br>${c.actOff ? 'Jūsų pokalbiai nebesaugomi jūsų paskyroje ir nenaudojami Google DI tobulinti.' : 'Jūsų pokalbiai saugomi jūsų Google paskyroje ir gali būti peržiūrimi Google DI tobulinti.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Išjungti</button><button type="button" class="cj" data-tap="off-delete">Išjungti ir ištrinti veiklą</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Palieskite Išjungti.</strong>'},
        {screen: c => app(p, '„Gemini“ programų veikla', '<p class="cf"><strong>Įjungta</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Išjungti</button><button type="button" class="cj" data-tap="off-delete">Išjungti ir ištrinti veiklą</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Palieskite Išjungti ir ištrinti veiklą</strong>, kad būtų išvalyta ir tai, kas jau išsaugota.', hints: {'off-only': 'Taip nustojama saugoti naujus pokalbius, bet senieji lieka. Palieskite Išjungti ir ištrinti veiklą.'}},
        {screen: c => app(p, '„Gemini“ programų veikla', '<p class="cf"><strong>Išjungta</strong></p>', {color: '#fff'}),
         question: {q: '„WhatsApp“, Facebook ir kitos programos taip pat turi DI pokalbius. Kokia saugi taisyklė?', options: [
            {t: 'Niekada neįvesti asmeninių duomenų (banko, sveikatos, slaptažodžių, adresų) į jokį DI pokalbį', ok: true, why: 'Taip. Tai, ką įvedate, gali būti saugoma ir naudojama DI mokyti. Elkitės taip, tarsi kalbėtumėte su nepažįstamuoju.'},
            {t: 'DI pokalbiai privatūs, todėl galima viską', why: 'Jie nėra privatūs kaip telefono skambutis. Tai, ką įvedate, gali būti saugoma. Asmeninių duomenų jiems neduokite.'}]}},
        {screen: c => app(p, '„Gemini“ programų veikla', '<p class="cf"><strong>Išjungta</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Šaunu!</strong> Gemini nebeatsiranda paspaudus maitinimo mygtuką ir nesaugo jūsų pokalbių. „Samsung“ telefone taip pat pažiūrėkite <strong>Nustatymai > Galaxy AI</strong>, kur kiekviena funkcija turi savo jungiklį.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jūsų „Apple“ paskyroje laikomos nuotraukos, kontaktai ir mokėjimai. Patikrinkime, ar ji apsaugota. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Palieskite savo vardą</strong> viršuje.'},
        {screen: () => list(p, '„Apple“ paskyra', [{id: 'personal', label: 'Asmeninė informacija'}, {id: 'security', label: 'Prisijungimas ir sauga'}, {id: 'payment', label: 'Mokėjimas ir pristatymas'}, {id: 'subscriptions', label: 'Prenumeratos'}], {back: 'Nustatymai'}),
         target: 'security', say: '<strong>Palieskite Prisijungimas ir sauga.</strong>'},
        {screen: () => list(p, 'Prisijungimas ir sauga', [{label: 'El. paštas ir telefono numeriai', sub: '+44 7700 900123'}, {label: 'Keisti slaptažodį'}, {caption: ' '}, {label: 'Dviejų veiksnių autentifikavimas', value: 'Įjungta'},
            {id: 'recovery', label: 'Paskyros atkūrimas'}], {back: '„Apple“ paskyra'}),
         target: 'recovery', say: '<strong>Dviejų veiksnių autentifikavimas</strong> rodo Įjungta: gerai. Tai reiškia, kad naujam įrenginiui prieš prisijungiant reikia kodo iš jūsų telefono. Dabar <strong>palieskite Paskyros atkūrimas</strong>.'},
        {screen: c => list(p, 'Paskyros atkūrimas', [{caption: 'ATKŪRIMO KONTAKTAS'}, c.recovery ? {label: 'Sarah', sub: 'Laukiama, kol Sarah sutiks'} : {id: 'add-contact', label: 'Pridėti atkūrimo kontaktą…', sub: 'Kažkas, kuo pasitikite, galintis padėti vėl patekti į paskyrą.'}],
            {back: 'Atgal', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Pasirinkite atkūrimo kontaktą</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (dukra)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Jei kada pamirštumėte slaptažodį, <strong>atkūrimo kontaktas</strong> gali gauti kodą, padedantį jums vėl prisijungti. Jis nemato jūsų duomenų. <strong>Palieskite Pridėti atkūrimo kontaktą.</strong>'},
        {screen: c => list(p, 'Paskyros atkūrimas', [{caption: 'ATKŪRIMO KONTAKTAS'}, {label: 'Pridėti atkūrimo kontaktą…'}],
            {back: 'Atgal', overlay: `<div class="ei"><div class="cv"><p><strong>Pasirinkite atkūrimo kontaktą</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (dukra)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Pasirinkite kuo pasitikintį žmogų, turintį „iPhone“. <strong>Palieskite Sarah.</strong>', hints: {'pick-dave': 'Šiai pratybai pasirinkite Sarah.'}},
        {screen: c => list(p, 'Paskyros atkūrimas', [{caption: 'ATKŪRIMO KONTAKTAS'}, {label: 'Sarah', sub: 'Laukiama, kol Sarah sutiks'}], {back: 'Atgal'}),
         question: {q: 'Kažkas paskambina sakydamas, kad yra iš „Apple“. Prašo perskaityti 6 skaitmenų kodą, ką tik atsiradusį jūsų telefone. Ką darote?', options: [
            {t: 'Padedu ragelį. Niekam neduodu to kodo', ok: true, why: 'Būtent. Tas kodas įleidžia žmogų į jūsų paskyrą. „Apple“ niekada neskambins ir jo neprašys.'},
            {t: 'Perskaitau, juk jie iš „Apple“', why: '„Apple“ niekada neprašys to kodo. Bet kas, kas jį turi, gali patekti į jūsų paskyrą. Padėkite ragelį.'}]}},
        {screen: c => list(p, 'Paskyros atkūrimas', [{caption: 'ATKŪRIMO KONTAKTAS'}, {label: 'Sarah', sub: 'Laukiama, kol Sarah sutiks'}], {back: 'Atgal'}), done: true,
         say: '<strong>Šaunu!</strong> Dviejų veiksnių autentifikavimas įjungtas, ir Sarah gali padėti jums vėl patekti. „iPhone“ taip pat gali prisiminti slaptažodžius už jus programoje <strong>Slaptažodžiai</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Jūsų Google paskyroje laikomi laiškai, nuotraukos ir kontaktai. Uždėkime jai antrą spyną. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Palieskite Google.</strong>', hint: 'Google yra netoli sąrašo apačios.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Tvarkykite savo Google paskyrą', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Atsarginė kopija'}, {id: 'autofill', label: 'Automatinis pildymas'}]),
         target: 'manage', say: '<strong>Palieskite Tvarkykite savo Google paskyrą.</strong>'},
        {screen: () => app(p, 'Google paskyra', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Palieskite Sauga</strong> viršuje.'},
        {screen: c => list(p, 'Sauga', [{caption: 'Kaip prisijungiate prie Google'}, {id: '2sv', label: '2 veiksmų patvirtinimas', sub: c.twoOn ? 'Įjungta' : 'Išjungta'}, {label: 'Slaptažodis', sub: 'Paskutinį kartą pakeista prieš 2 metus'}, {label: 'Atkūrimo telefonas', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>2 veiksmų patvirtinimas</strong> išjungtas. Tai reiškia, kad prisijungiant naujame įrenginyje reikia ir į telefoną atsiųsto kodo, todėl pavogto slaptažodžio nepakanka. <strong>Palieskite jį.</strong>'},
        {screen: () => list(p, '2 veiksmų patvirtinimas', [], {top: '<p class="cf">Jūsų telefono numeris: <strong>07700 900123</strong><br>Išsiųsime kodą SMS žinute šiuo numeriu, kad patikrintume, ar jis jūsų.</p><button type="button" class="ce dk" data-tap="send-code">Siųsti kodą</button>'}),
         target: 'send-code', say: '<strong>Palieskite Siųsti kodą.</strong>'},
        {screen: c => list(p, '2 veiksmų patvirtinimas', [], {top: `<div class="sd"><strong>ŽINUTĖS · dabar</strong><span>G-382605 yra jūsų Google patvirtinimo kodas.</span></div>
            <p class="cf">Įveskite kodą, kurį išsiuntėme SMS numeriu 07700 900123</p>${field('gcode', 'Įveskite kodą', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Pirmyn</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Įveskite 6 skaitmenis iš žinutės: 382605.',
         say: 'Ateina SMS su kodu. <strong>Laukelyje įveskite 382605</strong> ir <strong>palieskite Pirmyn</strong>. <em>(Mokomasis kodas. Niekada neįveskite tikro kodo niekur, išskyrus ten, kur patys jo paprašėte.)</em>'},
        {screen: () => list(p, '2 veiksmų patvirtinimas', [], {top: '<p class="cf">Jūsų telefono numeris patikrintas ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Įjungti 2 veiksmų patvirtinimą</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Palieskite Įjungti 2 veiksmų patvirtinimą.</strong>'},
        {screen: c => list(p, 'Sauga', [{caption: 'Kaip prisijungiate prie Google'}, {label: '2 veiksmų patvirtinimas', sub: 'Įjungta ⟦check⟧'}, {label: 'Atkūrimo telefonas', sub: '07700 900123'}]),
         question: {q: 'Kažkas paskambina sakydamas, kad yra iš Google. Prašo perskaityti kodą, ką tik atsiųstą jums SMS. Ką darote?', options: [
            {t: 'Padedu ragelį. Niekam neduodu to kodo', ok: true, why: 'Būtent. Tas kodas įleidžia žmogų į jūsų paskyrą. Google niekada neskambins ir jo neprašys.'},
            {t: 'Perskaitau, juk jie iš Google', why: 'Google niekada neprašys to kodo. Bet kas, kas jį turi, gali patekti į jūsų paskyrą. Padėkite ragelį.'}]}},
        {screen: c => list(p, 'Sauga', [{caption: 'Kaip prisijungiate prie Google'}, {label: '2 veiksmų patvirtinimas', sub: 'Įjungta ⟦check⟧'}]), done: true,
         say: '<strong>Šaunu!</strong> Jūsų Google paskyrai dabar reikia ir telefono, ir slaptažodžio. Google taip pat gali prisiminti jūsų slaptažodžius: Nustatymuose ieškokite <strong>Google slaptažodžių tvarkyklės</strong>.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Nuostabus rytinis pasivaikščiojimas pajūrio promenada! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Kitas pasivaikščiojimas: šeštadienį, 10 val., nuo uosto.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Naujų draugystės užklausų nėra.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Žiūrėti savo profilį</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Nustatymai ir privatumas</strong></button><div class="ck"><strong>Pagalba ir palaikymas</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Pasirūpinkime, kad tik jūsų draugai matytų, ką skelbiate. <strong>Atidarykite Facebook.</strong> <em>(Mokomoji versija. Ne tikroji programa.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Palieskite Meniu</strong> apačioje dešinėje.', hints: {'tab-friends': 'Draugystės užklausas apžvelgsime po akimirkos. Pirmiausia palieskite Meniu.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Palieskite Nustatymai ir privatumas</strong>.'},
        {screen: c => list(p, 'Nustatymai', [{caption: 'Auditorija ir matomumas'}, {id: 'posts', label: 'Įrašai', sub: 'Kas gali matyti jūsų būsimus įrašus: ' + (c.audience || 'Viešas')}, {label: 'Profilio informacija'}, {label: 'Kaip žmonės jus randa ir su jumis susisiekia'},
            {caption: 'Jūsų veikla'}, {label: 'Veiklos žurnalas'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Kas gali matyti jūsų būsimus įrašus?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Viešas<small>Bet kas Facebook ar už jo ribų</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Draugai<small>Jūsų draugai Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tik aš</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Jūsų įrašai nustatyti kaip <strong>Viešas</strong>: juos gali matyti bet kas pasaulyje. <strong>Palieskite Įrašai.</strong>'},
        {screen: c => list(p, 'Nustatymai', [{caption: 'Auditorija ir matomumas'}, {label: 'Įrašai', sub: 'Kas gali matyti jūsų būsimus įrašus: Viešas'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Kas gali matyti jūsų būsimus įrašus?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Viešas<small>Bet kas Facebook ar už jo ribų</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Draugai<small>Jūsų draugai Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tik aš</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Draugai'; }, say: '<strong>Palieskite Draugai.</strong>',
         hints: {'aud-public': 'Viešas yra tai, kas buvo. Palieskite Draugai.', 'aud-me': 'Tik aš reiškia, kad niekas kitas nemato jūsų įrašų. Palieskite Draugai.'}},
        {screen: c => list(p, 'Nustatymai', [{caption: 'Auditorija ir matomumas'}, {label: 'Įrašai', sub: 'Kas gali matyti jūsų būsimus įrašus: Draugai ⟦check⟧'}, {id: 'back-feed', label: '‹ Atgal į Facebook'}]),
         target: 'back-feed', say: 'Atlikta. Dabar <strong>palieskite Atgal į Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Turite draugystės užklausą. <strong>Palieskite Draugai.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Draugystės užklausa nuo „Jean Smith“. Bet jūs jau esate Jean draugai (ji jūsų sraute). Kas vyksta?', options: [
            {t: 'Tikriausiai tai Jean profilio kopija, sukurta sukčiaus', ok: true, why: 'Taip. Sukčiai nukopijuoja žmogaus vardą ir nuotrauką, tada rašo jo draugams prašydami pinigų. Tikroji Jean jau yra jūsų draugė.'},
            {t: 'Jean turbūt turi antrą paskyrą', why: 'Galbūt, bet daug labiau tikėtina, kad tai sukčiaus sukurta kopija: ji prisijungė prieš 2 dienas. Paklauskite Jean telefonu.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Palieskite Ištrinti</strong>, kad atmestumėte užklausą.', hints: {'confirm-jean': 'Nepatvirtinkite nukopijuoto profilio. Palieskite Ištrinti.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Šaunu!</strong> Jūsų įrašai matomi tik draugams ir išvengėte netikro profilio. Praneškite Jean, kad ji galėtų apie jį pranešti. Taip pat būkite atsargūs su Marketplace pirkėjais, kurie nori mokėti „per kurjerį“ arba prašo kodų, atsiųstų į jūsų telefoną.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Ieškoti čia'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Autobusų ir geležinkelio stotis, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Ligoninė, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Bažnyčia, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Autobusų ir geležinkelio stotis · 25 mylios</small><button type="button" class="ce co" data-tap="directions">Maršrutas</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min. (25 mylios)</strong><small>Greičiausias maršrutas per A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Eikite 4 min. iki <strong>Bridlington Bus Station</strong>, 3 aikštelė</li>
                <li>⟦bus⟧ <strong>121</strong> į Hull pusę · 10:15 · <b class="ahy">Laiku</b></li><li>Išlipkite <strong>Hull Paragon Interchange</strong> (24 stotelės)</li></ol>
                <button type="button" class="ce co" data-tap="start">Pradėti</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Žemėlapiai gali suplanuoti kelionę autobusu su laikais realiuoju laiku. Nuvažiuokime į Hull autobusu. <strong>Atidarykite Žemėlapius.</strong>' + (p === 'ios' ? ' <em>(Google Maps veikia taip pat, jei jį labiau mėgstate.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Palieskite paieškos laukelį</strong> viršuje.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Įvedėme „Hull interchange“. <strong>Palieskite Hull Paragon Interchange</strong>, autobusų stotį.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Palieskite Maršrutas.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Pirmiausia rodomas važiavimas automobiliu. <strong>Palieskite autobusą</strong> ⟦bus⟧, kad pamatytumėte viešąjį transportą.', hints: {'mode-walk': 'Aštuonios valandos! Verčiau palieskite autobusą.', 'mode-car': 'Tai važiavimas automobiliu. Palieskite autobusą.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Štai autobusai, artimiausias pirmas. „Laiku“ rodoma realiuoju laiku. <strong>Palieskite 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Kur lipate į autobusą?', options: [
            {t: 'Bridlington Bus Station, 3 aikštelė', ok: true, why: 'Taip. Žemėlapiai pasako, kur eiti pėsčiomis, kokiu autobusu važiuoti ir kur išlipti.'},
            {t: 'Hull Paragon Interchange', why: 'Ten išlipate. Autobusą pagaunate Bridlington Bus Station, 3 aikštelėje.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Šaunu!</strong> Tikroje kelionėje palieskite <strong>Pradėti</strong>, ir Žemėlapiai pasakys, kada artėja jūsų stotelė. Su autobuso bilietu jį tiesiog parodote vairuotojui kaip įprasta. <em>(Tik mokomieji laikai: tikruosius pasitikrinkite tą dieną.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Pagalbos SOS</strong> paskambina 999 už jus ir išsiunčia jūsų buvimo vietą SMS pasirinktiems žmonėms. Patikrinkime, ar jis paruoštas. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Palieskite Pagalbos SOS.</strong>', hint: 'Jis trečioje grupėje, su raudona piktograma.'},
        {screen: c => list(p, 'Pagalbos SOS', [{label: 'Skambinti laikant ir paleidžiant', toggle: true, sub: 'Palaikykite šoninį ir garsumo mygtuką, tada paleiskite.'},
            {id: 'five', label: 'Skambinti penkis kartus paspaudus mygtuką', toggle: !!c.five, sub: 'Greitai penkis kartus paspauskite šoninį mygtuką.'}, {caption: ' '},
            {id: 'contacts', label: 'Nustatyti kritinės padėties kontaktus programoje Sveikata'}, {label: 'Avarijos aptikimas', toggle: true, sub: 'Paskambina 999 po rimtos automobilio avarijos.'}], {back: 'Nustatymai'}),
         target: 'five', action: c => { c.five = true; }, say: 'Penkis kartus paspausti šoninį mygtuką lengva prisiminti išsigandus. <strong>Įjunkite Skambinti penkis kartus paspaudus mygtuką.</strong>'},
        {screen: c => list(p, 'Pagalbos SOS', [{label: 'Skambinti laikant ir paleidžiant', toggle: true}, {label: 'Skambinti penkis kartus paspaudus mygtuką', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Nustatyti kritinės padėties kontaktus programoje Sveikata'}], {back: 'Nustatymai', overlay: c.pick ? sheet('Pridėti kritinės padėties kontaktą', [['pick-sarah', 'Sarah', 'Dukra · 07700 900333'], ['pick-dave', 'Dave', 'Draugas']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Dabar pasirinkite, kas gaus SMS su jūsų buvimo vieta. <strong>Palieskite Nustatyti kritinės padėties kontaktus.</strong>'},
        {screen: () => list(p, 'Pagalbos SOS', [{label: 'Skambinti penkis kartus paspaudus mygtuką', toggle: true}], {back: 'Nustatymai', overlay: sheet('Pridėti kritinės padėties kontaktą', [['pick-sarah', 'Sarah', 'Dukra · 07700 900333'], ['pick-dave', 'Dave', 'Draugas']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Palieskite Sarah</strong>, savo dukrą.', hints: {'pick-dave': 'Šiai pratybai pasirinkite Sarah.'}},
        {screen: () => list(p, 'Pagalbos SOS', [{label: 'Skambinti penkis kartus paspaudus mygtuką', toggle: true}, {caption: 'KRITINĖS PADĖTIES KONTAKTAI'}, {label: 'Sarah', sub: 'Dukra'}], {back: 'Nustatymai'}),
         question: {q: 'Nukritote ir negalite tinkamai pasiekti telefono ekrano. Ką darote?', options: [
            {t: 'Greitai penkis kartus paspaudžiu šoninį mygtuką', ok: true, why: 'Taip. Prasideda atgalinė atskaita, tada paskambinama 999 ir Sarah SMS žinute išsiunčiama, kur esate.'},
            {t: 'Atrakinu telefoną ir randu programą Telefonas', why: 'Kritinėje situacijoje tai lėta. Penkis kartus paspaudus šoninį mygtuką veikia net užrakintame telefone.'}]}},
        {screen: () => list(p, 'Pagalbos SOS', [{label: 'Skambinti penkis kartus paspaudus mygtuką', toggle: true}, {caption: 'KRITINĖS PADĖTIES KONTAKTAI'}, {label: 'Sarah', sub: 'Dukra'}], {back: 'Nustatymai'}), done: true,
         say: '<strong>Šaunu!</strong> Pagalbos SOS paruoštas, ir Sarah bus pranešta, kur esate. Jei paspausite per klaidą, atgalinės atskaitos metu tiesiog palieskite Stabdyti.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Pagalbos SOS</strong> paskambina 999 už jus ir išsiunčia jūsų buvimo vietą SMS pasirinktiems žmonėms. Patikrinkime, ar jis paruoštas. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Palieskite Sauga ir kritinė padėtis.</strong> <em>„Samsung“ telefone tai irgi Sauga ir kritinė padėtis.</em>', hint: 'Nuslinkite žemyn: jis netoli apačios.'},
        {screen: () => list(p, 'Sauga ir kritinė padėtis', [{id: 'medical', label: 'Medicininė informacija'}, {id: 'contacts-ec', label: 'Kritinės padėties kontaktai'}, {id: 'sos', label: 'Pagalbos SOS', sub: 'Išjungta'}, {label: 'Avarijos aptikimas'}]),
         target: 'sos', say: 'Pagalbos SOS yra <strong>Išjungta</strong>. <strong>Palieskite Pagalbos SOS.</strong>'},
        {screen: c => list(p, 'Pagalbos SOS', [{id: 'sos-toggle', label: 'Naudoti Pagalbos SOS', toggle: !!c.sosOn, sub: 'Paspauskite maitinimo mygtuką 5 ar daugiau kartų, kad pradėtumėte kritinės padėties veiksmus.'}, {label: 'Bendrinti informaciją su kritinės padėties kontaktais', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Palieskite Naudoti Pagalbos SOS</strong>, kad įjungtumėte.'},
        {screen: () => list(p, 'Sauga ir kritinė padėtis', [{id: 'medical', label: 'Medicininė informacija'}, {id: 'contacts-ec', label: 'Kritinės padėties kontaktai', sub: 'Nėra'}, {label: 'Pagalbos SOS', sub: 'Įjungta'}]),
         target: 'contacts-ec', say: 'Dabar pasirinkite, kas gaus SMS su jūsų buvimo vieta. <strong>Palieskite Kritinės padėties kontaktai.</strong>'},
        {screen: c => list(p, 'Kritinės padėties kontaktai', [{id: 'add', label: '＋ Pridėti kontaktą'}], {overlay: c.pick ? sheet('Pasirinkite kontaktą', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Palieskite Pridėti kontaktą.</strong>'},
        {screen: () => list(p, 'Kritinės padėties kontaktai', [{label: '＋ Pridėti kontaktą'}], {overlay: sheet('Pasirinkite kontaktą', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Palieskite Sarah</strong>, savo dukrą.', hints: {'pick-dave': 'Šiai pratybai pasirinkite Sarah.'}},
        {screen: () => list(p, 'Kritinės padėties kontaktai', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Pridėti kontaktą'}]),
         question: {q: 'Nukritote ir negalite tinkamai pasiekti telefono ekrano. Ką darote?', options: [
            {t: 'Greitai penkis kartus paspaudžiu maitinimo mygtuką', ok: true, why: 'Taip. Prasideda atgalinė atskaita, tada paskambinama 999 ir Sarah pasidalijama, kur esate.'},
            {t: 'Atrakinu telefoną ir randu programą Telefonas', why: 'Kritinėje situacijoje tai lėta. Penkis kartus paspaudus maitinimo mygtuką veikia net užrakintame telefone.'}]}},
        {screen: () => list(p, 'Kritinės padėties kontaktai', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Šaunu!</strong> Pagalbos SOS įjungtas, ir Sarah bus pranešta, kur esate. Jei paspausite per klaidą, atgalinės atskaitos metu palieskite Atšaukti.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Įspėjimai apie kritinę padėtį perspėja apie netoliese esantį pavojų, pavyzdžiui, stiprų potvynį. Kažkas išjungė vieną šiame telefone. Sutvarkykime. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Palieskite Pranešimai.</strong>'},
            {screen: c => list(p, 'Pranešimai', [{label: 'Rodyti peržiūras', value: 'Visada'}, {caption: 'PRANEŠIMŲ STILIUS'}, {label: 'Žinutės', sub: 'Juostos, garsai, ženkliukai'}, {label: 'WhatsApp', sub: 'Juostos, garsai, ženkliukai'},
                {caption: 'VALDŽIOS ĮSPĖJIMAI'}, {label: 'Ekstremalūs įspėjimai', toggle: true}, {id: 'severe', label: 'Rimti įspėjimai', toggle: !!c.severe}, {label: 'Bandomieji įspėjimai', toggle: false}], {back: 'Nustatymai'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Valdžios įspėjimai yra pačioje apačioje. <strong>Rimti įspėjimai</strong> išjungti. <strong>Palieskite, kad įjungtumėte.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Palieskite Sauga ir kritinė padėtis.</strong>', hint: 'Jis netoli sąrašo apačios.'},
            {screen: () => list(p, 'Sauga ir kritinė padėtis', [{label: 'Medicininė informacija'}, {label: 'Pagalbos SOS'}, {id: 'wea', label: 'Belaidžiai įspėjimai apie kritinę padėtį'}, {label: 'Įspėjimai apie nežinomus sekiklius'}]),
             target: 'wea', say: '<strong>Palieskite Belaidžiai įspėjimai apie kritinę padėtį.</strong> <em>Kai kuriuose telefonuose tai vadinasi Įspėjimai apie kritinę padėtį.</em>'},
            {screen: c => list(p, 'Belaidžiai įspėjimai apie kritinę padėtį', [{label: 'Leisti įspėjimus', toggle: true}, {label: 'Ekstremalios grėsmės', toggle: true}, {id: 'severe', label: 'Rimtos grėsmės', toggle: !!c.severe}, {label: 'Bandomieji įspėjimai', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Rimtos grėsmės</strong> išjungtos. <strong>Palieskite, kad įjungtumėte.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Kritinės padėties įspėjimas: rimtas</strong><p>Netoli pajūrio promenados tikimasi stipraus potvynio. Persikelkite į aukštesnę vietą. Daugiau: gov.uk/alerts</p><button type="button" data-tap="ok">Gerai</button></div>`,
         target: 'ok', say: 'Taip atrodo įspėjimas. Jis apie 10 sekundžių garsiai kaukia sirena, net tylusis režimas netrukdo. <strong>Palieskite Gerai.</strong> <em>(Tik pratyboms.)</em>'},
        {screen: () => home(p), question: {q: 'Įspėjimas ateina jums vairuojant. Ką daryti?', options: [
            {t: 'Sustoti saugioje vietoje prieš jį skaitant', ok: true, why: 'Taip. Niekada neskaitykite telefono vairuodami. Saugiai sustokite, tada skaitykite.'},
            {t: 'Perskaityti iškart vairuojant', why: 'Niekada neskaitykite telefono vairuodami. Pirmiausia raskite saugią vietą sustoti.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Telefonas dabar perspės jus apie rimtą netoliese esantį pavojų. Tikri įspėjimai niekada neprašo asmeninių duomenų ar pinigų: jei prašo, tai sukčiavimas.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Trys dalykai, dėl kurių pavogtas telefonas vagiui daug mažiau naudingas. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Palieskite Face ID ir kodas.</strong> <em>Tikrame „iPhone“ toliau įvestumėte savo kodą.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Nuslinkite žemyn ir <strong>palieskite Pavogto įrenginio apsauga</strong>.'},
            {screen: c => list(p, 'Pavogto įrenginio apsauga', [{id: 'sdp', label: 'Pavogto įrenginio apsauga', toggle: !!c.sdp, sub: 'Ne namuose, kodui ar „Apple“ paskyrai keisti reikia Face ID ir 1 valandos laukimo.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Tai sustabdo vagį, kuris matė, kaip įvedėte kodą, ir užrakina jus. <strong>Įjunkite.</strong>'},
            {screen: () => list(p, 'Pavogto įrenginio apsauga', [{label: 'Pavogto įrenginio apsauga', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Toliau paslėpkite žinutes užrakinimo ekrane. <strong>Palieskite ‹ Face ID</strong>, kad grįžtumėte.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Palieskite Pranešimai.</strong>'},
            {screen: c => list(p, 'Pranešimai', [{id: 'previews', label: 'Rodyti peržiūras', value: c.previews || 'Visada'}, {label: 'Ekrano bendrinimas', value: 'Pranešimai išjungti'}], {back: 'Nustatymai',
                overlay: c.pickPrev ? sheet('Rodyti peržiūras', [['prev-always', 'Visada'], ['prev-unlocked', 'Kai atrakinta', 'Rekomenduojama'], ['prev-never', 'Niekada']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Dabar bet kas gali perskaityti jūsų žinutes, įskaitant saugos kodus, neatrakinęs telefono. <strong>Palieskite Rodyti peržiūras.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Palieskite Google.</strong>', hint: 'Jis netoli sąrašo apačios.'},
            {screen: () => list(p, 'Google', [{label: 'Tvarkykite savo Google paskyrą'}, {id: 'all-services', label: 'Visos paslaugos'}, {label: 'Atsarginė kopija'}]), target: 'all-services', say: '<strong>Palieskite Visos paslaugos.</strong>'},
            {screen: () => list(p, 'Visos paslaugos', [{caption: 'Asmeninė ir įrenginio sauga'}, {id: 'theft', label: 'Apsauga nuo vagystės'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Palieskite Apsauga nuo vagystės.</strong>'},
            {screen: c => list(p, 'Apsauga nuo vagystės', [{id: 'tdl', label: 'Vagystės aptikimo užraktas', toggle: !!c.tdl, sub: 'Užrakina ekraną, jei pajunta, kad kas nors išplėšia telefoną ir bėga.'}, {label: 'Neprisijungusio įrenginio užraktas', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Įjunkite Vagystės aptikimo užraktą.</strong> Jei kas nors čiupęs jūsų telefoną pabėgtų, jis užsirakina pats.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Toliau paslėpkite žinutes užrakinimo ekrane. Grįžę į Nustatymus, <strong>palieskite Pranešimai</strong>.'},
            {screen: c => list(p, 'Pranešimai', [{id: 'previews', label: 'Pranešimai užrakinimo ekrane', sub: c.previews || 'Rodyti visą turinį'}, {label: 'Pranešimų istorija'}], {
                overlay: c.pickPrev ? sheet('Pranešimai užrakinimo ekrane', [['prev-always', 'Rodyti visą turinį'], ['prev-unlocked', 'Slėpti neskelbtiną turinį', 'Rekomenduojama'], ['prev-never', 'Nerodyti jokių pranešimų']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Dabar bet kas gali perskaityti jūsų žinutes, įskaitant saugos kodus, neatrakinęs telefono. <strong>Palieskite Pranešimai užrakinimo ekrane.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Pranešimai', [{label: 'Rodyti peržiūras', value: 'Visada'}], {back: 'Nustatymai', overlay: sheet('Rodyti peržiūras', [['prev-always', 'Visada'], ['prev-unlocked', 'Kai atrakinta', 'Rekomenduojama'], ['prev-never', 'Niekada']])})
                : list(p, 'Pranešimai', [{label: 'Pranešimai užrakinimo ekrane', sub: 'Rodyti visą turinį'}], {overlay: sheet('Pranešimai užrakinimo ekrane', [['prev-always', 'Rodyti visą turinį'], ['prev-unlocked', 'Slėpti neskelbtiną turinį', 'Rekomenduojama'], ['prev-never', 'Nerodyti jokių pranešimų']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Kai atrakinta' : 'Slėpti neskelbtiną turinį'}.</strong>`, hints: {'prev-always': 'Taip buvo. Pasirinkite rekomenduojamą.', 'prev-never': 'Tai paslepia juos visiškai, o tai gali erzinti. Pasirinkite rekomenduojamą.'}},
        {screen: () => home(p), target: 'phone', say: 'Galiausiai suraskite savo telefono IMEI numerį. Jūsų ryšio operatoriui jo reikia pavogtam telefonui užblokuoti. <strong>Atidarykite programą Telefonas.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'Klaviatūroje <strong>surinkite *#06#</strong> (žvaigždutė, grotelės, nulis, šeši, grotelės).', hint: 'Pradėkite nuo žvaigždutės klavišo *, apačioje kairėje.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Įrenginio informacija', 'IMEI: 35 209900 176148 1 (mokomasis numeris)', [['ok', 'Gerai']])}),
         target: 'ok', say: 'Tas ilgas skaičius yra jūsų <strong>IMEI</strong>. Tikrame telefone užsirašykite jį saugioje vietoje (ne telefone!). <strong>Palieskite Gerai.</strong>'},
        {screen: () => home(p), question: {q: 'Jūsų telefoną išplėšė. Kam skambinate pirmiausia?', options: [
            {t: 'Savo bankui, iš kito žmogaus telefono', ok: true, why: 'Taip. Vagys pirmiausia taikosi į banko programas. Tada užrakinkite telefoną internetu, paskambinkite savo ryšio operatoriui ir praneškite numeriu 101.'},
            {t: 'Palaukti ir pažiūrėti, ar atsiras', why: 'Svarbus greitis. Iškart paskambinkite savo bankui, tada užrakinkite telefoną ir paskambinkite ryšio operatoriui.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Jūsų telefoną vagiui daug sunkiau naudoti, ir žinote, kur rasti savo IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'RASTI' : 'ĮSPĖJIMAS APIE SEKIKLĮ', title: p === 'ios' ? 'Su jumis juda „AirTag“' : 'Su jumis keliauja nežinomas sekiklis',
            text: '<br>Šio daikto buvimo vietą gali matyti jo savininkas.'}),
         target: 'alert', say: 'Telefonas pastebėjo ne jūsų sekiklį, judantį kartu su jumis. Nepanikuokite: dažnai tai per klaidą šeimos nario. <strong>Palieskite įspėjimą.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Nežinomas „AirTag“' : 'Nežinomas sekiklis', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Su jumis matomas nuo <strong>10:12</strong> šiandien, 4 vietose.</p>
            <button type="button" class="ce co" data-tap="play">Groti garsą</button>
            <button type="button" class="cp" data-tap="learn">Sužinokite apie šį ${p === 'ios' ? '„AirTag“' : 'Sekiklis'}</button>
            <button type="button" class="cp" data-tap="disable">Išjungimo instrukcijos</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Žemėlapyje rodoma, kur jis buvo kartu su jumis. <strong>Palieskite Groti garsą</strong>, kad jį rastumėte.'},
        {screen: () => app(p, p === 'ios' ? 'Nežinomas „AirTag“' : 'Nežinomas sekiklis', '<p class="cf">⟦volume-2⟧ <strong>Grojamas garsas…</strong><br>Klausykitės čirškimo garso.</p>', {color: '#fff'}),
         question: {q: 'Girdite silpną čirškimą. Kur ieškoti?', options: [
            {t: 'Krepšiuose, paltų kišenėse, automobilyje ir viskame, ką esate pasiskolinę', ok: true, why: 'Taip. Sekikliai maži, maždaug didelės monetos dydžio, ir dažnai įkišami į pamušalus, kišenes ar automobilius.'},
            {t: 'Niekur, tiesiog nekreipti dėmesio', why: 'Verta jį rasti. Patikrinkite krepšius, kišenes ir automobilį: gali būti, kad tai tiesiog šeimos nario.'}]}},
        {screen: c => app(p, 'Sekiklis rastas', `<p class="cf">Laikykite telefono viršų prie sekiklio, kad sužinotumėte daugiau apie jį.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Laikykite prie sekiklio</button>`, {color: '#fff'}),
         target: 'scan', say: 'Radote jį paltų pamušale. <strong>Palieskite Laikykite prie sekiklio</strong>, kad pamatytumėte, kam jis priklauso.'},
        {screen: () => app(p, 'Apie šį sekiklį', '<p class="cf"><strong>Ne režime Prarasta</strong><br>Serijos numeris: P4R7-ACT1CE<br>Savininko duomenys perduodami tik policijai.</p>', {color: '#fff'}),
         question: {q: 'Tai ne šeimos nario, ir nerimaujate, kad kažkas jį paslėpė jus sekdamas. Ką darote?', options: [
            {t: 'Saugau jį ir nuvežu policijai (arba skambinu 999, jei man gresia pavojus)', ok: true, why: 'Taip. Neišmeskite jo: policija gali nustatyti savininką. National Stalking Helpline telefonas 0808 802 0300.'},
            {t: 'Išmetu į šiukšliadėžę', why: 'Tai gali būti įrodymas, o policija gali nustatyti savininką. Pasilikite jį ir nuneškite policijai arba skambinkite 999, jei jums gresia pavojus.'}]}},
        {screen: () => app(p, 'Apie šį sekiklį', '<p class="cf">Pagalba: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 val.) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Šaunu!</strong> Dabar žinote, kaip rasti sekiklį ir ką daryti. ' + (p === 'android' ? 'Patikrinkite, ar įspėjimai įjungti skiltyje <strong>Nustatymai &gt; Sauga ir kritinė padėtis &gt; Įspėjimai apie nežinomus sekiklius</strong>.' : '„iPhone“ sekiklius tikrina automatiškai.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Esate ant skardžio tako ir kažkas nukrito. Adreso nėra. Kai skambinate 999, dauguma telefonų automatiškai išsiunčia jūsų vietą, bet padeda ir trys žodžiai. <strong>Atidarykite what3words.</strong> <em>(Mokomoji versija.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Mėlynas taškas esate jūs. Kiekvienas 3 metrų kvadratas turi savo tris žodžius. Jūsų yra <strong>puffin.chalk.lantern</strong>. Palaukite akimirką, kol taškas nusistovės, tada <strong>palieskite Gavau savo 3 žodžius</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Dabar skambinkite 999. <strong>Atidarykite programą Telefonas.</strong> <em>(Tik pratyboms: niekada neskambinkite 999 bandydami.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Surinkite 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Palieskite žalią skambinimo mygtuką.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Kritinės padėties skambutis · 0:08</small></div>
            <p class="hi">„Skubi pagalba, kuri tarnyba? … Greitoji pagalba. Kur tiksliai įvyko nelaimė?“</p>${homeIndicator(p)}</div>`,
         question: {q: 'Operatorius klausia, kur esate. Ką sakote?', options: [
            {t: '„Esu ant skardžio tako. Mano what3words adresas: puffin, chalk, lantern.“', ok: true, why: 'Taip. Pasakykite, kur esate, savais žodžiais, tada pasakykite tris žodžius. Jei prašo, žodžius perskaitykite raidėmis.'},
            {t: '„Nežinau, kažkur prie jūros“', why: 'Jie bandys jus rasti, bet trys žodžiai nurodo jūsų vietą 3 metrų tikslumu. Perskaitykite juos iš programos.'}]}},
        {screen: () => home(p), question: {q: 'Draugas kurčias ir negali skambinti balsu. Kaip jis gali pasiekti 999?', options: [
            {t: 'Dabar užsiregistruoti pagalbos SMS žinutėms (nusiųsti SMS „register“ numeriu 999) arba naudoti programą 999 BSL', ok: true, why: 'Taip. Pagalbos SMS veikia tik jei iš anksto užsiregistravote. Programa 999 BSL sujungia su gestų kalbos vertėju.'},
            {t: 'Negali', why: 'Gali. Užsiregistruokite pagalbos SMS žinutėms nusiųsdami SMS „register“ numeriu 999 arba naudokite nemokamą programą 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Atminkite: pasakykite, kur esate, tada pasakykite savo tris žodžius. Programa what3words savo žodžiams rasti veikia be ryšio, bet skambinti reikia ryšio.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Nereaguoja</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Telefonas užstrigo: palietimai nieko nedaro ir jis neišsijungia įprastu būdu. Ar tai didelė problema?', options: [
            {t: 'Dažniausiai ne. „Priverstinis paleidimas iš naujo“ tai sutvarko ir nieko neprarandate', ok: true, why: 'Teisingai. Priverstinis paleidimas iš naujo tarsi išjungia telefoną iš lizdo. Jūsų nuotraukos ir žinutės saugios.'},
            {t: 'Taip, jis sugedęs', why: 'Dažniausiai ne! Priverstinis paleidimas iš naujo sutvarko daugumą užstrigusių telefonų ir nieko neprarandate.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? '„iPhone“: <strong>paspauskite ir paleiskite garsumo didinimo mygtuką</strong>, tada <strong>paspauskite ir paleiskite garsumo mažinimo mygtuką</strong>, tada <strong>paspauskite ir laikykite šoninį mygtuką</strong>, kol atsiras „Apple“ logotipas (apie 10 sekundžių). Čia palieskite juos šia tvarka.'
            : 'Daugumoje „Android“ telefonų: <strong>maždaug 10 sekundžių kartu paspauskite ir laikykite maitinimo bei garsumo mažinimo mygtukus</strong>, kol jis persikraus. Čia palieskite maitinimo, tada garsumo mažinimo. <em>(Google Pixel: 30 sekundžių laikykite tik maitinimo mygtuką.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Pirmiausia garsumo didinimas.' : 'Pradėkite nuo maitinimo mygtuko.', side: 'Šoninis mygtukas paskutinis, po abiejų garsumo mygtukų.'},
         hint: p === 'ios' ? 'Garsumo didinimas, tada garsumo mažinimas, tada šoninis mygtukas.' : 'Maitinimas, tada garsumo mažinimas.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Logotipas atsirado. Ką daryti dabar?', options: [
            {t: 'Paleisti ir palaukti, kol įsijungs', ok: true, why: 'Taip. Tai užtrunka minutę. Gali tekti vieną kartą įvesti kodą.'},
            {t: 'Toliau spausti visus mygtukus', why: 'Paleiskite, kai atsiras logotipas, ir palaukite minutę, kol įsijungs.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Šaunu!</strong> Telefonas persikrovė. Jei jis ir toliau stringa, patikrinkite naujinimus ir atlaisvinkite saugyklos. Kartą per savaitę paleidus telefoną iš naujo jis veikia sklandžiai.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Įjungta' : 'Išjungta'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Išjungta' : (ctx.signal ? 'Įjungta · 4G' : 'Nėra paslaugos')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Išjungta' : 'Namai'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Braukite aukštyn, kad uždarytumėte' : 'Uždaryti'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Nėra paslaugos</span>'), target: 'pull-down',
         say: 'Telefonas rodo <strong>Nėra paslaugos</strong>, nors ryte veikė. Greitas sprendimas: įjunkite ir išjunkite Lėktuvo režimą, kad jis prisijungtų iš naujo. ' + (p === 'ios' ? '<strong>Braukite žemyn iš viršutinio dešiniojo kampo</strong> (arba palieskite juostelę).' : '<strong>Braukite žemyn iš viršaus</strong> (arba palieskite juostelę).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Palieskite Lėktuvo režimas</strong>, kad įjungtumėte. Viskas belaidžio išsijungia.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Palaukite apie 10 sekundžių… tada <strong>dar kartą palieskite Lėktuvo režimas</strong>, kad išjungtumėte.'},
        {screen: c => quickPanel(p, c), question: {q: 'Mobilieji duomenys vėl veikia per 4G. Kada dar praverčia Lėktuvo režimas?', options: [
            {t: 'Lėktuve arba užsienyje, kad išvengtumėte tarptinklinio ryšio mokesčių (Wi-Fi vis tiek galite įjungti)', ok: true, why: 'Taip. Įjungus Lėktuvo režimą Wi-Fi galima vėl įjungti, kad naudotumėte viešbučio ar laivo Wi-Fi.'},
            {t: 'Telefonui įkrauti', why: 'Jis kraunasi šiek tiek greičiau, bet daugiausia skirtas skrydžiams ir tarptinklinio ryšio mokesčiams užsienyje išvengti.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Šaunu!</strong> Jei Lėktuvo režimas nepadeda, paleiskite telefoną iš naujo. Vis dar nėra ryšio? Patikrinkite ryšio operatoriaus svetainėje, ar jūsų vietovėje nėra gedimų.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · dabar</strong><span>🎁 Jūsų NEMOKAMI gyvenimai laukia! Grįžkite ir žaiskite! 🎉</span></button>',
         target: 'settings', say: 'Žaidimas nuolat zyzia beprasmėmis žinutėmis. Bet kuriai programai galite išjungti pranešimus. <strong>Palieskite Nustatymai</strong>, o ne žinutę.', hints: {notif: 'Tai atidaro žaidimą. Verčiau palieskite Nustatymai.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Palieskite Pranešimai.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Pranešimai', [{label: 'Rodyti peržiūras', value: 'Kai atrakinta'}, {caption: 'PRANEŠIMŲ STILIUS'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Juostos, garsai, ženkliukai'}, {label: 'Žinutės', sub: 'Juostos, garsai, ženkliukai'}, {label: 'WhatsApp', sub: 'Juostos, garsai, ženkliukai'}], {back: 'Nustatymai'})
            : list(p, 'Pranešimai', [{id: 'app-notifs', label: 'Programų pranešimai'}, {id: 'history', label: 'Pranešimų istorija'}, {label: 'Pranešimai užrakinimo ekrane'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Palieskite Bubble Pop.</strong>' : '<strong>Palieskite Programų pranešimai.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Programų pranešimai', [{label: 'Žinutės', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Palieskite jungiklį šalia Bubble Pop</strong>, kad išjungtumėte jos pranešimus.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Leisti pranešimus', toggle: !c.off}], {back: 'Pranešimai'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Išjunkite Leisti pranešimus.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Pranešimai', [{label: 'Programų pranešimai'}, {id: 'history', label: 'Pranešimų istorija', sub: 'Išjungta'}]), target: 'history',
             say: 'Naudingas priedas: jei kada nors per klaidą nubrauksite žinutę, Pranešimų istorija išsaugo kopiją. <strong>Palieskite Pranešimų istorija.</strong>'},
            {screen: c => list(p, 'Pranešimų istorija', [{id: 'hist-toggle', label: 'Naudoti pranešimų istoriją', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Įjunkite.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Kurių programų pranešimus verta palikti įjungtus?', options: [
            {t: 'Žinutes, skambučius, „WhatsApp“, banką ir viską, apie ką norėtumėte sužinoti iškart', ok: true, why: 'Taip. Palikite svarbiuosius, o žaidimų, parduotuvių ir viso, kas tik zyzia, pranešimus išjunkite.'},
            {t: 'Išjungti visus', why: 'Praleistumėte žinutes ir skambučius! Palikite svarbiuosius, o žaidimų ir apsipirkimo programų pranešimus išjunkite.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Šaunu!</strong> Bubble Pop jūsų daugiau netrukdys. ' + (p === 'ios' ? 'Jei per klaidą nubrauksite žinutę, braukite aukštyn nuo užrakinimo ekrano vidurio, kad pamatytumėte ankstesnes.' : 'O pranešimų istorija išsaugo kopiją visko, ką nubrauksite.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Iki pasimatymo ančių sodo centre x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">SMS žinutė</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Įvedėte „Dunnington sodo centras“ ir telefonas tai pakeitė. Kodėl?', options: [
            {t: 'Automatinis taisymas atspėjo ne tą žodį', ok: true, why: 'Taip. Automatinis taisymas pakeičia žodžius, kurių nepažįsta. Galite jį išjungti arba išmokyti naujų žodžių.'},
            {t: 'Telefonas sugedęs', why: 'Tai tik automatinio taisymo spėjimas. Galite jį išjungti arba išmokyti žodžių.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Palieskite Bendra.</strong>'},
            {screen: () => list(p, 'Bendra', [{label: 'Apie'}, {label: 'Programinės įrangos naujinimas'}, {id: 'keyboard', label: 'Klaviatūra'}, {label: 'Kalba ir regionas'}], {back: 'Nustatymai'}), target: 'keyboard', say: '<strong>Palieskite Klaviatūra.</strong>'},
            {screen: c => list(p, 'Klaviatūros', [{id: 'replace', label: 'Teksto pakeitimas'}, {caption: 'VISOS KLAVIATŪROS'}, {label: 'Automatinės didžiosios raidės', toggle: true}, {id: 'ac', label: 'Automatinis taisymas', toggle: !c.acOff}, {label: 'Nuspėjamasis tekstas', toggle: true}], {back: 'Bendra'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Išjunkite Automatinį taisymą.</strong> Rašybos klaidos vis tiek pabraukiamos raudonai, todėl galite jas ištaisyti patys.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Palieskite Sistema.</strong> Ji apačioje.'},
            {screen: () => list(p, 'Sistema', [{id: 'keyboard', label: 'Klaviatūra'}, {label: 'Kalbos'}, {label: 'Data ir laikas'}]), target: 'keyboard', say: '<strong>Palieskite Klaviatūra.</strong>'},
            {screen: () => list(p, 'Klaviatūra', [{id: 'gboard', label: 'Gboard', sub: 'Ekrano klaviatūra'}]), target: 'gboard', say: '<strong>Palieskite Gboard.</strong> <em>„Samsung“ telefone tai „Samsung“ klaviatūra > Išmanusis rašymas.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Nuostatos'}, {id: 'correction', label: 'Teksto taisymas'}, {label: 'Rašymas slenkant'}]), target: 'correction', say: '<strong>Palieskite Teksto taisymas.</strong>'},
            {screen: c => list(p, 'Teksto taisymas', [{label: 'Rodyti pasiūlymų juostą', toggle: true}, {id: 'ac', label: 'Automatinis taisymas', toggle: !c.acOff}, {label: 'Rašybos tikrinimas', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Išjunkite Automatinį taisymą.</strong> Rašybos klaidos vis tiek pabraukiamos raudonai, todėl galite jas ištaisyti patys.'},
        ]),
        {screen: () => home(p), question: {q: 'Norėtumėte palikti automatinį taisymą, bet jis visada pakeičia „Dunnington“. Ką dar galėtumėte padaryti?', options: [
            {t: 'Pridėti jį į telefono žodyną, kad išmoktų žodį', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Naudoti Teksto pakeitimą tuose pačiuose klaviatūros nustatymuose.' : 'Palieskite žodį pasiūlymų juostoje ir pasirinkite pridėti jį į žodyną.')},
            {t: 'Nieko, tiesiog kęsti', why: 'Galite jį išmokyti: ' + (p === 'ios' ? 'pridėkite žodį skiltyje Klaviatūra > Teksto pakeitimas.' : 'palieskite žodį pasiūlymuose ir pridėkite jį į žodyną.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Daugiau netikėtų žodžių pakeitimų. Bet kada galite vėl įjungti toje pačioje vietoje.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Turite naujas belaides ausines. Ką darote pirmiausia?', options: [
            {t: 'Įjungiu „susiejimo režimą“ (dažniausiai laikoma mygtuką, kol sumirksi lemputė)', ok: true, why: 'Taip. Susiejimo režimas leidžia telefonui jas rasti. Dėžėje esančios instrukcijos tiksliai pasako, kaip.'},
            {t: 'Įkišu jas į telefoną', why: 'Belaidės ausinės jungiasi per Bluetooth. Pirmiausia įjunkite susiejimo režimą, dažniausiai laikydami mygtuką, kol sumirksi lemputė.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Ausinių lemputė mirksi. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Palieskite Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Palieskite Prijungti įrenginiai.</strong>'},
            {screen: () => list(p, 'Prijungti įrenginiai', [{id: 'pair', label: '＋ Susieti naują įrenginį'}, {label: 'Išsaugoti įrenginiai', sub: 'Automobilis'}]), target: 'pair', say: '<strong>Palieskite Susieti naują įrenginį.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Susieti naują įrenginį', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'MANO ĮRENGINIAI' : 'Išsaugota'}, {label: 'Automobilis', sub: 'Neprijungta'},
            {caption: p === 'ios' ? 'KITI ĮRENGINIAI' : 'Galimi įrenginiai'}, {id: 'headphones', label: '⟦headphones⟧ Mokomosios ausinės'}, {label: 'Kaimyno televizorius'}], {back: 'Nustatymai'}),
         target: 'headphones', say: 'Telefonas ieško netoliese esančių įrenginių. <strong>Palieskite Mokomosios ausinės.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'MANO ĮRENGINIAI'}, {label: '⟦headphones⟧ Mokomosios ausinės', sub: 'Prijungta ⟦check⟧'}, {label: 'Automobilis', sub: 'Neprijungta'}], {back: 'Nustatymai'}),
         question: {q: 'Kai kitą kartą įjungsite ausines, ar reikės tai daryti iš naujo?', options: [
            {t: 'Ne, nuo šiol jos jungsis pačios', ok: true, why: 'Taip. Susieti reikia tik vieną kartą. Vėliau jos jungiasi automatiškai, kai įjungtos ir netoliese.'},
            {t: 'Taip, kaskart', why: 'Susieti reikia tik vieną kartą. Vėliau jos jungiasi pačios.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Mokomosios ausinės', sub: 'Prijungta ⟦check⟧'}], {back: 'Nustatymai'}), done: true,
         say: '<strong>Šaunu!</strong> Tie patys žingsniai tinka automobiliui, garsiakalbiui ar klausos aparatams. Jei kas nors nesijungia, išjunkite ir įjunkite Bluetooth ir vėl įjunkite įrenginio susiejimo režimą.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">„${ctx.said || 'Močiute? Čia aš, Tom! Pamečiau telefoną ir turiu bėdų. Man šiandien reikia £400 baudai. Prašau, nesakyk mamai!'}“</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Paprašyti šeimos saugios frazės</button><button type="button" data-tap="send-money">Pasakyti, kad išsiųsite pinigus</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Skambina nežinomas numeris. <strong>Atsiliepkite</strong>, kad išbandytumėte, ką daryti.', hints: {decline: 'Tikrame gyvenime atmesti skambutį yra gerai! Šiai pratybai palieskite Atsiliepti.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Ee… ką? Močiute, tam nėra laiko! Prašau, pinigų reikia dabar!'; },
         say: 'Skamba lygiai kaip jūsų anūkas Tom. Bet sukčiai gali nukopijuoti balsus. Jūsų šeima susitarė dėl <strong>saugios frazės</strong>. <strong>Paprašykite jos.</strong>',
         hints: {'send-money': 'Niekada nesutikite siųsti pinigų per tokį skambutį. Paprašykite saugios frazės.', end: 'Padėti ragelį irgi gerai! Bet pirmiausia pasipraktikuokite paprašyti saugios frazės.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Jie jos nežino ir spaudžia stipriau. Tai sukčius. <strong>Padėkite ragelį</strong> raudonu mygtuku.', hints: {'send-money': 'Ne! Jie nežinojo frazės. Padėkite ragelį.', 'ask-phrase': 'Paprašėte, ir jie negalėjo atsakyti. Padėkite ragelį.'}},
        {screen: () => home(p), question: {q: 'Vis dar šiek tiek nerimaujate dėl Tom. Ką darote?', options: [
            {t: 'Paskambinu Tom (arba jo mamai) numeriu, kurį jau turiu', ok: true, why: 'Taip. Visada skambinkite atgal jums žinomu numeriu. Tikrasis Tom bus gerai ir neprieštaraus, kad patikrinate.'},
            {t: 'Perskambinu numeriu, iš kurio skambino', why: 'Taip vėl prisiskambinsite sukčiui. Paskambinkite Tom numeriu, kurį jau turite.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Jei skambutis susijęs su jūsų banko sąskaita, galite skambinti <strong>159</strong>, kad saugiai susisiektumėte su savo banku. Pasipraktikuokite: <strong>atidarykite programą Telefonas</strong>.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Surinkite 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Palieskite žalią skambinimo mygtuką.</strong> <em>(Tik pratyboms: niekur neskambinama.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">„Sveiki atvykę į 159. Pasakykite savo banko pavadinimą, ir mes jus sujungsime.“</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Šaunu!</strong> 159 sujungia su jūsų tikruoju banku. Dėl saugios frazės su šeima susitarkite akis į akį ir niekada neskelbkite jos internete.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Labas'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Braukite aukštyn, kad atidarytumėte' : 'Pradėti'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Jūsų naujas telefonas išimtas iš dėžutės ir įjungtas. Senąjį <strong>telefoną</strong> laikykite šalia, įkrautą ir prijungtą prie Wi-Fi. <strong>Palieskite ${p === 'ios' ? 'Braukite aukštyn, kad atidarytumėte' : 'Pradėti'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Greitas paleidimas' : 'Kopijuoti programas ir duomenis', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Priartinkite senąjį „iPhone“ prie šio, kad nustatytumėte jį su „Apple“ paskyra.' : 'Nukopijuokite programas, nuotraukas, kontaktus ir dar daugiau iš senojo telefono.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Tęskite senajame „iPhone“' : 'Naudoti senąjį įrenginį'}</button>
            <button type="button" class="cp" data-tap="manual">Vietoj to nustatyti rankiniu būdu</button>`}),
         target: 'use-old', say: 'Kopijavimas iš senojo telefono sutaupo viską nustatinėti iš naujo. <strong>Palieskite ' + (p === 'ios' ? 'Tęskite senajame „iPhone“' : 'Naudoti senąjį įrenginį') + '.</strong>', hints: {manual: 'Galite, bet kopijuoti daug paprasčiau. Palieskite kitą mygtuką.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">Jūsų <strong>senajame</strong> telefone atsiranda pranešimas. Nukreipkite jo kamerą į šį raštą.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Senasis telefonas nuskaitė</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'Senajame telefone palieskite Tęsti, tada laikykite jį virš šio rašto, kad kamera jį matytų. Čia <strong>palieskite Senasis telefonas nuskaitė</strong>.'},
        {screen: c => codeScreen(p, c, 'Įveskite senojo telefono kodą', 'Taip saugiai nukopijuojami jūsų nustatymai.'), sequence: CODE_KEYS,
         say: `Įveskite senojo telefono kodą. Pratyboms naudokite <strong>${codeText}</strong>.`, hint: `Įveskite mokomąjį kodą ${codeText}.`},
        {screen: () => list(p, 'Perkelkite savo duomenis', [], {noBack: true, top: `<p class="cf">Pasirinkite, ką perkelti:</p>
            <div class="cj ex"><span>Nuotraukos ir vaizdo įrašai</span>${tog(true)}</div><div class="cj ex"><span>Kontaktai ir žinutės</span>${tog(true)}</div><div class="cj ex"><span>Programos</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Tęsti</button>`}),
         target: 'transfer', say: 'Viskas pažymėta. <strong>Palieskite Tęsti.</strong> Laikykite abu telefonus arti vienas kito ir prijungtus prie įkroviklio.'},
        {screen: c => list(p, 'Perkeliama…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Liko apie 25 minutės' : 'Perkėlimas baigtas ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Perkėlimas baigtas. Ką daryti su senuoju telefonu?', options: [
            {t: 'Pasilikti savaitei, patikrinti, ar nieko netrūksta, tada tinkamai išvalyti prieš parduodant ar perdirbant', ok: true, why: 'Taip. Pirmiausia patikrinkite, ar nuotraukos, „WhatsApp“ ir banko programos veikia naujame telefone. Kitoje pamokoje parodoma, kaip išvalyti senąjį.'},
            {t: 'Iškart išmesti į šiukšliadėžę', why: 'Jame vis dar visa jūsų informacija! Patikrinkite, ar naujame telefone viskas yra, tada tinkamai išvalykite senąjį.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Jūsų naujame telefone yra nuotraukos, kontaktai ir programos. Kai kurios programos, pvz., banko ir „WhatsApp“, prašo prisijungti iš naujo; paruoškite savo duomenis.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Parduodate, dovanojate ar perdirbate senąjį telefoną? Atlikite tai teisinga tvarka, kitaip naujasis savininkas negalės juo naudotis. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '1 žingsnis: atsijunkite nuo „Apple“ paskyros. <strong>Palieskite savo vardą</strong>.'},
            {screen: c => list(p, '„Apple“ paskyra', [{label: 'Asmeninė informacija'}, {label: 'Prisijungimas ir sauga'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Atsijungti', danger: true}], {back: 'Nustatymai',
                overlay: c.ask ? dialog(p, 'Atsijungti?', 'Norint išjungti Rasti, reikia jūsų slaptažodžio. (Pratyba: įvesta už jus.)', [['cancel', 'Atšaukti'], ['turn-off', 'Išjungti']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Nuslinkite iki apačios ir <strong>palieskite Atsijungti</strong>.'},
            {screen: () => list(p, '„Apple“ paskyra', [{label: 'Atsijungti', danger: true}], {back: 'Nustatymai', overlay: dialog(p, 'Atsijungti?', 'Norint išjungti Rasti, reikia jūsų slaptažodžio. (Pratyba: įvesta už jus.)', [['cancel', 'Atšaukti'], ['turn-off', 'Išjungti']])}),
             target: 'turn-off', say: 'Tai išjungia <strong>Rasti</strong>, kuris kitaip užrakintų telefoną jums. <strong>Palieskite Išjungti.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: '2 žingsnis: ištrinkite viską. <strong>Palieskite Bendra.</strong>'},
            {screen: () => list(p, 'Bendra', [{label: 'Apie'}, {label: '„iPhone“ saugykla'}, {id: 'reset', label: 'Perkelti arba atkurti „iPhone“'}], {back: 'Nustatymai'}), target: 'reset', say: '<strong>Palieskite Perkelti arba atkurti „iPhone“</strong> apačioje.'},
            {screen: c => list(p, 'Perkelti arba atkurti „iPhone“', [{label: 'Atkurti'}, {id: 'erase', label: 'Ištrinti visą turinį ir nustatymus'}], {back: 'Bendra',
                overlay: c.askErase ? dialog(p, 'Ištrinti šį „iPhone“?', 'Bus ištrintos visos nuotraukos, žinutės ir programos.', [['cancel', 'Atšaukti'], ['confirm-erase', 'Ištrinti']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Palieskite Ištrinti visą turinį ir nustatymus.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '1 žingsnis: pašalinkite savo Google paskyrą. <strong>Palieskite Google</strong>. <em>(„Samsung“ telefone taip pat pašalinkite savo „Samsung“ paskyrą.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Tvarkykite savo Google paskyrą'}, {id: 'accounts', label: 'Šio įrenginio paskyros', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Palieskite Šio įrenginio paskyros.</strong>'},
            {screen: c => list(p, 'Google paskyra', [{label: 'margaret.smith@example.com'}, {label: 'Paskyros sinchronizavimas'}, {id: 'remove', label: 'Pašalinti paskyrą', danger: true}], {overlay: c.ask ? dialog(p, 'Pašalinti paskyrą?', 'Ją pašalinus iš šio telefono ištrinamos jos žinutės, kontaktai ir duomenys.', [['cancel', 'Atšaukti'], ['confirm-remove', 'Pašalinti paskyrą']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Be šio žingsnio po atstatymo telefonas lieka užrakintas jūsų paskyrai. <strong>Palieskite Pašalinti paskyrą.</strong>'},
            {screen: () => list(p, 'Paskyra', [{label: 'Pašalinti paskyrą', danger: true}], {overlay: dialog(p, 'Pašalinti paskyrą?', 'Ją pašalinus iš šio telefono ištrinamos jos žinutės, kontaktai ir duomenys.', [['cancel', 'Atšaukti'], ['confirm-remove', 'Pašalinti paskyrą']])}),
             target: 'confirm-remove', say: '<strong>Palieskite Pašalinti paskyrą.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: '2 žingsnis: ištrinkite viską. <strong>Apačioje palieskite Sistema</strong>.'},
            {screen: () => list(p, 'Sistema', [{label: 'Kalbos'}, {label: 'Programinės įrangos naujinys'}, {id: 'reset', label: 'Atstatymo parinktys'}]), target: 'reset', say: '<strong>Palieskite Atstatymo parinktys.</strong>'},
            {screen: c => list(p, 'Atstatymo parinktys', [{label: 'Atstatyti Wi-Fi, mobilųjį ryšį ir Bluetooth'}, {id: 'erase', label: 'Ištrinti visus duomenis (gamyklinis atstatymas)'}], {overlay: c.askErase ? dialog(p, 'Ištrinti visus duomenis?', 'Bus ištrintos visos nuotraukos, žinutės ir programos.', [['cancel', 'Atšaukti'], ['confirm-erase', 'Ištrinti visus duomenis']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Palieskite Ištrinti visus duomenis (gamyklinis atstatymas).</strong>'},
        ]),
        {screen: () => list(p, 'Atkurti', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Ištrinti šį „iPhone“?' : 'Ištrinti visus duomenis?', 'Bus ištrintos visos nuotraukos, žinutės ir programos.', [['cancel', 'Atšaukti'], ['confirm-erase', p === 'ios' ? 'Ištrinti' : 'Ištrinti visus duomenis']])}),
         target: 'confirm-erase', say: 'Darykite tai tik tada, kai nuotraukos saugiai perkeltos į naująjį telefoną arba turi atsarginę kopiją. <strong>Palieskite ' + (p === 'ios' ? 'Ištrinti' : 'Ištrinti visus duomenis') + '.</strong> <em>(Pratyba: nieko neištrinama.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Labas'}</h3><p class="cf">Paruoštas kitam savininkui</p>${homeIndicator(p)}</div>`,
         question: {q: 'Dar vienas dalykas prieš atiduodant?', options: [
            {t: 'Išimti SIM kortelę (ir bet kokią atminties kortelę)', ok: true, why: 'Taip. SIM kortelėje yra jūsų telefono numeris. Išimkite ją maža priemone arba sąvaržėle.'},
            {t: 'Nieko daugiau', why: 'Išimkite SIM kortelę ir bet kokią atminties kortelę. Jūsų numeris yra SIM kortelėje.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Labas'}</h3><p class="cf">Paruoštas kitam savininkui</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Šaunu!</strong> Atsijunkite, ištrinkite viską, išimkite SIM kortelę: būtent šia tvarka. Ekranas „Sveiki“ reiškia, kad jis paruoštas kitam žmogui.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Priminimas</strong><span>Paskambinti Sarah</span><small>Šiandien 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, vėliau lietūs</span><small>Aukščiausia 14° · Žemiausia 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} klauso… ką norėtumėte pasakyti?`}</p>${result}
            <div class="wh">${[['say-remind', '„Primink man paskambinti Sarah 3 valandą“'], ['say-weather', '„Koks šiandien oras?“'], ['say-joke', '„Užsakyk man picą“']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Šoninis mygtukas (paspausti ir laikyti)' : 'Maitinimo mygtukas (paspausti ir laikyti)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> atlieka užduotis, kai paprašote garsiai. <strong>Paspauskite ir laikykite šoninį mygtuką</strong> (dešinėje), kol atsiras Siri. Taip pat galite tiesiog pasakyti „Siri“ arba „Hey Siri“.'
                          : 'Telefonas gali atlikti užduotis, kai paprašote garsiai. <strong>Paspauskite ir laikykite maitinimo mygtuką</strong> (dešinėje), kol atsiras pagelbiklis. Taip pat galite pasakyti „Hey Google“.',
         hint: 'Laikykite pirštą (ar pelės mygtuką) nuspaudę ant mygtuko dešiniajame krašte.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Tikrame telefone tiesiog kalbėtumėte. Čia <strong>palieskite „Primink man paskambinti Sarah 3 valandą“</strong>.', hints: {'say-joke': 'Pirmiausia išbandykite priminimą.', 'say-weather': 'Pirmiausia išbandykite priminimą.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Padaryta: 3 valandą pasirodys priminimas. Dabar <strong>paklauskite apie orą</strong>.', hints: {'say-remind': 'Nustatyta. Dabar paklauskite apie orą.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Ko iš šių dalykų galite paprašyti telefono?', options: [
            {t: 'Visko: „Paskambink Sarah“, „Nustatyk 10 minučių laikmatį“, „Įjunk žibintuvėlį“, „Perskaityk mano žinutes“', ok: true, why: 'Taip. Patogu, kai rankos užimtos, akys pavargusios arba rašyti sunku.'},
            {t: 'Tik oro', why: 'Jis gali daug: skambinti, laikmačius, žibintuvėlį, skaityti žinutes, žadintuvus ir dar daugiau.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Šaunu!</strong> Kalbėkite aiškiai ir natūraliai, tarsi su žmogumi. Jei neteisingai išgirsta, tiesiog paprašykite dar kartą.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Tekstas'], ['lens-translate', 'Išversti'], ['lens-search', 'Paieška']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Meniu' : 'Carte'}</strong><span>${ctx.translated ? 'Žuvies sriuba' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Vištiena su grybais' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Obuolių pyragas' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington gydytojo kabinetas</strong><span>Atėjo laikas jūsų skiepui nuo gripo.</span><span>Norėdami užsiregistruoti, skambinkite ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Tiesioginis tekstas' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Kamera gali skaityti tekstą. Nukopijuokime telefono numerį iš laiško. <strong>Atidarykite Fotoaparatą.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Nukreipkite ją į laišką. Kai ji pastebi tekstą, atsiranda mažas <strong>teksto mygtukas ⟦scan-text⟧</strong>. <strong>Palieskite jį.</strong>' : 'Nukreipkite ją į laišką ir <strong>palieskite Lens mygtuką ◎</strong>.',
         hints: {shutter: 'Tai padaro įprastą nuotrauką. Palieskite: ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'Lens mygtukas ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Dabar tekstas yra tikras tekstas. <strong>Palieskite telefono numerį.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Palieskite Kopijuoti</strong>, kad paruoštumėte įklijuoti į žinutę ar kontaktus. <em>(Skambinti iškart paskambintų.)</em>', hints: {'call-num': 'Tai paskambintų šiuo numeriu. Šiai pratybai palieskite Kopijuoti.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'Atostogaujate? Dabar ji nukreipta į prancūzišką meniu. ' + (p === 'ios' ? 'Tai gali padaryti programa Translate arba Google programos Lens. ' : '') + '<strong>Palieskite Išversti.</strong>', hints: {'lens-text': 'Tai nukopijuoja prancūzišką tekstą. Palieskite Išversti.', 'lens-search': 'Palieskite Išversti.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Ką dar kamera gali taip padaryti?', options: [
            {t: 'Atpažinti augalus ir paukščius bei nuskaityti laiškus į PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Programoje Pastabos palieskite sąvaržėlę, tada Nuskaityti dokumentus, kad laiškai taptų PDF.' : 'Google Drive palieskite +, tada Nuskaityti, kad laiškai taptų PDF.')},
            {t: 'Tik fotografuoti', why: 'Ji gali daug daugiau: atpažinti augalus, versti, kopijuoti tekstą ir nuskaityti laiškus į PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Šaunu!</strong> Kamera nukopijavote numerį ir išvertėte meniu. ' + (p === 'ios' ? 'Tiesioginis tekstas veikia ir su jau padarytomis nuotraukomis.' : 'Google Lens veikia ir su jau padarytomis nuotraukomis.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Bibliotekos el. knygos', `<p class="cf">Prisijungta su bibliotekos kortele</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">El. knygos</button><button type="button" data-tap="tab-audio" class="on">Garso knygos</button></div>
                <div class="aeo">${[['book-1', 'Švyturys Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Vasaros prie jūros', 'J. Marsh', '#f59e0b'], ['book-3', 'Tylusis sodas', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Grąžinti per 21 dieną' : 'Laisvi 3 iš 5 egzempliorių'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Biblioteka', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'Su nemokama bibliotekos kortele telefone galite skolintis el. knygas ir garso knygas. East Riding bibliotekos naudoja programą <strong>BorrowBox</strong>. Tai mokomoji versija. <strong>Atidarykite ją.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Esate prisijungę su bibliotekos kortele. <strong>Palieskite Švyturys Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Skolintis nemokama. <strong>Palieskite Pasiskolinti.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Ji jūsų 21 dieną. <strong>Palieskite Klausyti.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Palieskite paleidimo mygtuką ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Klausote lovoje? <strong>Miego laikmatis</strong> sustabdo po kurio laiko, kad nepamestumėte vietos. <strong>Palieskite Miego laikmatis.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Kas nutinka, kai praeina 21 diena?', options: [
            {t: 'Ji grįžta pati. Jokių baudų, o jei nebaigėte, galite pratęsti', ok: true, why: 'Taip. El. knygos ir garso knygos grįžta automatiškai.'},
            {t: 'Gaunate baudą', why: 'Baudų nėra. Ji grįžta pati, o jei nebaigėte, galite pratęsti.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Šaunu!</strong> Kad pradėtumėte iš tikrųjų, užsiregistruokite eastridinglibraries.co.uk arba bet kurioje bibliotekoje, tada atsisiųskite BorrowBox ir prisijunkite su savo kortele.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road automobilių stovėjimo aikštelė</span><span>Mokėkite programa: vietos numeris <b>4471</b></span></div>
                <p class="cf">Įveskite vietos numerį nuo ženklo</p>${field('parkcode', 'Vietos numeris', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Rasti aikštelę</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Sumokėti £3,20' : 'Pasirinkite laiką'}</button>`, {color});
        }
        return app(p, 'Stovėjimas', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Daug stovėjimo aikštelių leidžia mokėti programa, tad monetų nereikia. Kiekviena savivaldybė naudoja skirtingas programas (ženklas pasako, kurią). Tai mokomoji. <strong>Atidarykite Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Įveskite vietos numerį nuo ženklo: 4471.',
         say: 'Kiekviena stovėjimo aikštelė ženkle turi <strong>vietos numerį</strong>. <strong>Laukelyje įveskite 4471</strong> ir <strong>palieskite Rasti aikštelę</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Jūsų automobilio numeris jau išsaugotas. <strong>Pasirinkite 2 valandas.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Už naudojimąsi programa imamas nedidelis aptarnavimo mokestis. <strong>Palieskite Sumokėti £3,20.</strong> <em>(Pratyba: pinigai neimami.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Vėluojate parduotuvėse. Ką galite padaryti?', options: [
            {t: 'Programoje paliesti Pratęsti ir pridėti laiko negrįžus prie automobilio', ok: true, why: 'Taip. Tai didelis mokėjimo per programą privalumas. Dauguma taip pat primena prieš pasibaigiant laikui.'},
            {t: 'Nieko, gausite baudą', why: 'Dauguma stovėjimo programų leidžia paliesti Pratęsti ir pridėti laiko iš bet kur.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Šaunu!</strong> Dauguma aparatų vis tiek priima korteles ar monetas, o daug programų taip pat leidžia mokėti paskambinus numeriu ar išsiuntus SMS. Niekada nemokėkite per ant aparato užklijuotą QR kodo lipduką: jie gali būti netikri.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Jūsų sutartis baigėsi 2026 m. kovo 3 d. Operatorių galite pakeisti nemokamai. Jūsų mėnesio kaina yra £24,00. Norėdami pakeisti operatorių ir pasilikti numerį, nusiųskite SMS PAC numeriu 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'SMS žinutė', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Ar vis dar esate įsipareigoję sutarčiai, ar permokate? Tai pasako viena nemokama SMS. <strong>Atidarykite Žinutes.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Žinutės laukelyje įveskite INFO, tada palieskite siųsti.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Pradėjome naują žinutę numeriu <strong>85075</strong>. <strong>Įveskite INFO</strong> ir <strong>palieskite siųsti</strong>. Tai nemokama visuose JK tinkluose.'},
        {screen: c => smsTo(p, c), question: {q: 'Atsakyme sakoma, kad sutartis baigėsi, o jūs vis dar mokate £24 per mėnesį. Ką tai reiškia?', options: [
            {t: 'Telefonas jau išmokėtas. Pasiūlymas tik su SIM kortele gali kainuoti daug mažiau, o numerį galite pasilikti', ok: true, why: 'Taip. Nusiųskite SMS PAC numeriu 65075, kad gautumėte kodą operatoriui pakeisti ir numeriui pasilikti. Likusį darbą atlieka naujasis operatorius.'},
            {t: 'Nieko, toliau mokėti', why: 'Galbūt mokate už jau išmokėtą telefoną. Pasiūlymas tik su SIM kortele gali daug sutaupyti.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Dar vienas taupymo būdas keliaujant užsienyje: išjunkite duomenų tarptinklinį ryšį, kad netikėtai neišleistumėte pinigų. <strong>Palieskite Nustatymai.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Palieskite Mobilusis ryšys.</strong>'},
            {screen: () => list(p, 'Mobilusis ryšys', [{label: 'Mobilieji duomenys', toggle: true}, {id: 'options', label: 'Mobiliųjų duomenų parinktys', value: 'Tarptinklinis ryšys įjungtas'}, {label: 'Asmeninė prieigos vieta'}], {back: 'Nustatymai'}), target: 'options', say: '<strong>Palieskite Mobiliųjų duomenų parinktys.</strong>'},
            {screen: c => list(p, 'Mobiliųjų duomenų parinktys', [{id: 'roam', label: 'Duomenų tarptinklinis ryšys', toggle: !c.roamOff}, {label: 'Balsas ir duomenys', value: '5G automatiškai'}], {back: 'Mobilusis ryšys'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Išjunkite Duomenų tarptinklinį ryšį.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Palieskite Tinklas ir internetas.</strong>'},
            {screen: () => list(p, 'Tinklas ir internetas', [{label: 'Internetas', sub: 'Namų Wi-Fi'}, {id: 'sims', label: 'SIM kortelės', sub: 'Jūsų tinklas'}, {label: 'Lėktuvo režimas', toggle: false}]), target: 'sims', say: '<strong>Palieskite SIM kortelės.</strong>'},
            {screen: c => list(p, 'SIM kortelės', [{label: 'Mobilieji duomenys', toggle: true}, {id: 'roam', label: 'Tarptinklinis ryšys', toggle: !c.roamOff, sub: 'Prisijungti prie duomenų paslaugų esant tarptinkliniam ryšiui'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Išjunkite Tarptinklinį ryšį.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Šaunu!</strong> Užsienyje vis tiek galite naudoti Wi-Fi „WhatsApp“, vaizdo skambučiams ir žemėlapiams. Vėl įjunkite tarptinklinį ryšį, jei reikia mobiliųjų duomenų ir žinote, kiek ima jūsų operatorius.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Rasti', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Pasidalijus vieta šeima gali matyti, kad saugiai grįžote namo. Tai jūsų pasirinkimas, ir bet kada galite sustoti. <strong>Atidarykite Rasti.</strong>'},
        {screen: c => app(p, 'Žmonės', `<p class="cf">Kol kas niekas nesidalija.</p><button type="button" class="ce co" data-tap="share">Bendrinti mano vietą</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Palieskite Bendrinti mano vietą.</strong>'},
        {screen: c => app(p, 'Bendrinti su', '', {color: '#fff', overlay: sheet('Pasirinkite kontaktą', [['pick-sarah', 'Sarah', 'Dukra'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Palieskite Sarah.</strong>', hints: {'pick-dave': 'Šiai pratybai pasirinkite Sarah.'}},
        {screen: c => app(p, 'Bendrinti su Sarah', '', {color: '#fff', overlay: sheet('Kiek laiko?', [['one-hour', 'Bendrinti vieną valandą'], ['day', 'Bendrinti iki dienos pabaigos'], ['always', 'Bendrinti neribotai']])}),
         target: 'always', say: 'Pasirinkite, kiek laiko. Šeimai, kuria pasitikite, <strong>palieskite Bendrinti neribotai</strong>. Bet kada galite sustoti.', hints: {'one-hour': 'Tai patogu vienai kelionei. Šiai pratybai pasirinkite Bendrinti neribotai.', day: 'Šiai pratybai pasirinkite Bendrinti neribotai.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Pasidalijus vieta šeima gali matyti, kad saugiai grįžote namo. Tai jūsų pasirinkimas, ir bet kada galite sustoti. <strong>Atidarykite Žemėlapius.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Palieskite savo profilio nuotrauką</strong> viršuje dešinėje.'},
        {screen: () => app(p, 'Žemėlapiai', '', {color: '#fff', overlay: sheet('', [['sharing', 'Vietos bendrinimas'], ['timeline', 'Jūsų chronologija'], ['settings', 'Nustatymai']])}), target: 'sharing', say: '<strong>Palieskite Vietos bendrinimas.</strong>'},
        {screen: () => app(p, 'Vietos bendrinimas', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Palieskite Naujas bendrinimas.</strong>'},
        {screen: () => app(p, 'Bendrinti su', '', {color: '#fff', overlay: sheet('Pasirinkite kontaktą', [['pick-sarah', 'Sarah', 'Dukra'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Palieskite Sarah.</strong>', hints: {'pick-dave': 'Šiai pratybai pasirinkite Sarah.'}},
        {screen: () => app(p, 'Bendrinti su Sarah', '', {color: '#fff', overlay: sheet('Kiek laiko?', [['one-hour', '1 valandą'], ['always', 'Kol to neišjungsite']])}),
         target: 'always', say: 'Šeimai, kuria pasitikite, <strong>palieskite Kol to neišjungsite</strong>.', hints: {'one-hour': 'Patogu vienai kelionei. Šiai pratybai pasirinkite Kol to neišjungsite.'}},
    ]).concat([
        {screen: () => app(p, 'Bendrinama su Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah mato, kur esate. ${p === 'ios' ? 'Palieskite Nustoti bendrinti' : 'Palieskite Stabdyti'} bet kada.</p>`, {color: '#fff'}),
         question: {q: 'Kažkas, ką ką tik sutikote internete, prašo pasidalyti vieta. Ar turėtumėte?', options: [
            {t: 'Ne. Dalinkitės tik su artima šeima ar draugais, kuriais pasitikite', ok: true, why: 'Būtent. Jūsų vieta parodo, kur gyvenate ir kada išeinate. Dalinkitės tik su žmonėmis, kuriais pasitikite.'},
            {t: 'Taip, atrodo malonūs', why: 'Dalinkitės vieta tik su artima šeima ir draugais. Ji parodo, kur gyvenate ir kada išeinate.'}]}},
        {screen: () => app(p, 'Bendrinama su Sarah', '<p class="cf">Sarah mato, kur esate.</p>', {color: '#fff'}), done: true,
         say: '<strong>Šaunu!</strong> Sarah mato, kad esate saugūs. Kartkartėmis patikrinkite, su kuo dalijatės, ir nustokite dalytis su tais, kam nereikia.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jūsų anūkas Leo gauna savo pirmąjį „iPhone“. <strong>Ekrano laikas</strong> nustato sveikus apribojimus. Tai <strong>Leo</strong> telefonas. <strong>Palieskite Nustatymai.</strong>'},
        {screen: c => list(p, 'Nustatymai', [{label: 'Leo', sub: '„Apple“ paskyra'}, {label: 'Pranešimai'}, {id: 'screen-time', label: 'Ekrano laikas'}, {label: 'Bendra'}], {noBack: true}), target: 'screen-time', say: '<strong>Palieskite Ekrano laikas.</strong>'},
        {screen: c => list(p, 'Ekrano laikas', [{id: 'downtime', label: 'Prastova', sub: c.downtime ? '20:00 – 07:00' : 'Išjungta'}, {label: 'Programų apribojimai'}, {id: 'content', label: 'Turinio ir privatumo apribojimai', sub: c.content ? 'Įjungta' : 'Išjungta'}, {label: 'Naudoti ekrano laiko kodą'}], {back: 'Nustatymai'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Prastova</strong> naktį užrakina daugumą programų (skambučiai veikia). <strong>Palieskite Prastova</strong>, kad ją įjungtumėte, nuo 20:00 iki 7:00.'},
        {screen: c => list(p, 'Ekrano laikas', [{label: 'Prastova', sub: '20:00 – 07:00'}, {label: 'Programų apribojimai'}, {id: 'content', label: 'Turinio ir privatumo apribojimai', sub: c.content ? 'Įjungta' : 'Išjungta'}], {back: 'Nustatymai'}),
         target: 'content', action: c => { c.content = true; }, say: 'Toliau sustabdykite netikėtus pirkinius ir suaugusiesiems skirtą turinį. <strong>Palieskite Turinio ir privatumo apribojimai.</strong>'},
        {screen: c => list(p, 'Turinys ir privatumas', [{label: 'Turinio ir privatumo apribojimai', toggle: true}, {id: 'purchases', label: 'Pirkiniai App Store', value: c.noBuy ? 'Neleisti' : 'Leisti'}, {label: 'Interneto turinys', value: 'Apriboti suaugusiesiems skirtas svetaines'}], {back: 'Ekrano laikas'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Suaugusiesiems skirtos svetainės dabar apribotos. <strong>Palieskite Pirkiniai App Store</strong>, kad sustabdytumėte išlaidas programose.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Jūsų anūkas Leo gauna savo pirmąjį „Android“ telefoną. Nemokama Google programa <strong>Family Link</strong> nustato sveikus apribojimus iš <strong>jūsų</strong> telefono. <strong>Atidarykite Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Palieskite Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Valdikliai'}, {id: 'screen-time', label: 'Ekrano laikas', sub: c.downtime ? 'Miego laikas 20:00 – 07:00' : 'Be apribojimų'}, {id: 'content', label: 'Turinio apribojimai', sub: c.noBuy ? 'Pirkiniams reikia jūsų patvirtinimo' : 'Google Play: leisti viską'}, {label: 'Vieta', sub: 'Įjungta'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Palieskite Ekrano laikas</strong>, kad nustatytumėte miego laiką nuo 20:00 iki 7:00, kai telefonas užsirakina (skambučiai veikia).'},
        {screen: c => list(p, 'Leo', [{caption: 'Valdikliai'}, {label: 'Ekrano laikas', sub: 'Miego laikas 20:00 – 07:00'}, {id: 'content', label: 'Turinio apribojimai', sub: c.noBuy ? 'Pirkiniams reikia jūsų patvirtinimo' : 'Google Play: leisti viską'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Toliau sustabdykite netikėtas išlaidas. <strong>Palieskite Turinio apribojimai</strong>, kad pirkiniams reikėtų jūsų patvirtinimo.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Ekrano laikas' : 'Leo', [{label: p === 'ios' ? 'Prastova' : 'Ekrano laikas', sub: '20:00 – 07:00'}, {label: 'Pirkiniai', sub: p === 'ios' ? 'Neleisti' : 'Reikia jūsų patvirtinimo'}]),
         question: {q: 'Kas svarbiausia, be nustatymų?', options: [
            {t: 'Kalbėtis su jais: jie visada gali jums pasakyti, jei kas nors internete juos jaudina', ok: true, why: 'Taip. Joks nustatymas nesugauna visko. Svarbiausia būti žmogumi, su kuriuo jie gali kalbėtis.'},
            {t: 'Nustatymai padaro viską', why: 'Jie labai padeda, bet nieko nesugauna visko. Įsitikinkite, kad jie žino, jog visada gali kalbėtis su jumis.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Ekrano laikas' : 'Leo', [{label: 'Prastova', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Šaunu!</strong> Leo turi miego laiką ir negali išleisti pinigų neatsiklausęs. ' + (p === 'ios' ? 'Nustatykite ekrano laiko kodą, kad tik jūs galėtumėte tai keisti.' : 'Family Link leidžia bet kada tai keisti iš jūsų pačių telefono.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Failų naršyklė', mac: 'Finder', linux: 'Failai'},
        settings: {windows: 'Nustatymai', mac: 'Sistemos nustatymai', linux: 'Sistemos nustatymai'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Programinės įrangos tvarkyklė'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Pradėti', mac: 'Programos', linux: 'Meniu'},
        editor: {windows: 'Užrašinė', mac: 'TextEdit', linux: 'Teksto redaktorius'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Paštas', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Naujinimų tvarkyklė', terminal: 'Terminalas', trash: 'Šiukšliadėžė', apps: 'Programos', chrome: 'Chrome', shield: 'Windows sauga', fw: 'Užkarda'}[kind]);

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
        windows: {title: 'Šiukšlinė', empty: 'Ištuštinti šiukšlinę', confirm: n => `Ar tikrai norite visam laikui ištrinti šiuos ${n} elementus?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Siūlėsi padėti su kiekvienu pradėtu laišku. Išėjo į pensiją 2007 m.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Pradedantysis: 999 sekundžių. Apie tai nekalbame.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Laimėdavote partiją, ir kortos šokinėdamos nusiristi ekranu. Spustelėkite mane du kartus!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Ššššš… bumbt… kssshhh. Ir niekas negalėdavo naudotis telefonu, kol buvote prisijungę.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Ta banguota žalia kalva ir mėlynas dangus milijonuose ekranų nuo 2001 m.', ''],
            ['⟦save⟧', 'Diskelis (A:)', '1,44 MB. Mygtukas Įrašyti vis dar atrodo kaip jis.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '„3D Pinball“, nemokamas su Windows, kol Vista jį pašalino.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger krustelėjimas', 'Kažkas jus krustelėjo, ir visas ekranas sudrebėjo. Spustelėkite mane du kartus!', 'shake'],
            ['⟦file-text⟧', 'Laiškas savivaldybei GALUTINIS (2) (galutinis).doc', 'Visi tokį turime.', ''],
        ]},
        mac: {title: 'Šiukšliadėžė', empty: 'Ištuštinti šiukšliadėžę', confirm: () => 'Ar tikrai norite visam laikui ištrinti šiukšliadėžėje esančius elementus? Šio veiksmo atšaukti negalėsite.', items: [
            ['⟦rainbow⟧', 'Sukamasis paplūdimio kamuolys', 'Vaivorykštinis ratas, reiškęs „palaukite“… ir laukite. Spustelėkite mane du kartus!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Permatomas, kiaušinio formos ir mėlynas. Jį turėjo kiekviena mokykla.', ''],
            ['⟦music⟧', 'iPod su spaudžiamu ratuku', '1 000 dainų kišenėje. Sukite ratu nykščiu.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Mažas besišypsantis kompiuteris, sveikindavęs kiekvieną kartą įjungus.', ''],
            ['⟦bell⟧', 'Įsijungimo garsas', 'Tas didelis akordas, kai įjungdavote. Daug kas vis dar jo pasigenda.', ''],
            ['⟦droplet⟧', 'Aqua mygtukai', 'Tokie blizgūs ir mėlyni, kad norėjosi palaižyti.', ''],
            ['⟦calendar-days⟧', 'Informacijos skydelio valdikliai', 'Skaičiuotuvas, orai ir lipnus lapelis atskirame sluoksnyje. Dingo nuo 2019 m.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Kur visi įrašėme savo CD ir sinchronizavome savo iPod.', ''],
        ]},
        linux: {title: 'Šiukšlinė', empty: 'Ištuštinti šiukšlinę', confirm: () => 'Ištuštinti visus elementus iš šiukšlinės? Visi šiukšlinėje esantys elementai bus ištrinti visam laikui.', items: [
            ['⟦bird⟧', 'Pingvinas Tux (pliušinis)', 'Linux talismanas nuo 1996 m. Labai norisi apkabinti.', ''],
            ['⟦eye⟧', 'xeyes', 'Akių pora, sekanti jūsų pelės žymeklį. Du kartus spustelėkite mane!', 'eyes'],
            ['⟦app-window⟧', 'Siūbuojantys langai', 'Senieji darbalaukio efektai darydavo, kad vilkdami langai siūbuotų kaip drebutiena. Du kartus spustelėkite mane!', 'wobble'],
            ['⟦save⟧', 'Diegimo diskeliai 1–50', 'Ankstyvam Linux įdiegti reikėdavo visos dėžės diskelių.', ''],
            ['⟦disc⟧', 'Nemokamas Ubuntu CD paštu', 'Linux CD galėjai užsisakyti nemokamai, ir jis ateidavo paštu.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Prognozuojama kasmet maždaug nuo 1999 m. Gal šie metai bus tie?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'Kiekvienas „Linux Mint“ leidimas turi moters vardą, pvz., Zena, Xia ir Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Senas pokštas: pasakyk „sudo“, ir kompiuteris daro, kas liepta.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Šis aplankas tuščias.' : 'The ' + egg.title + ' tuščias.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Du kartus spustelėkite ką nors, kad pažiūrėtumėte.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Ne' : 'Atšaukti'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Taip' : 'Tuščia'}</button></div></div>` : '';
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
        ['Banguota kalva', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Žydrai žalia 95', '#008080'],
        ['Dryžuotas', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Naktinis dangus', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Pajūris', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Garsiausias Wi-Fi žodžių žaismas.'],
        ['The LAN Before Time', 'LAN yra „vietinis tinklas“. Šis labai, labai senas.'],
        ['Abraham Linksys', 'Prieš aštuoniasdešimt septynis megabitus…'],
        ['Bill Wi the Science Fi', 'Mokslas valdo!'],
        ['Drop It Like It\'s Hotspot', 'Kažkieno telefono prieigos taškas su humoro jausmu.'],
        ['Silence of the LANs', 'Labai, labai tylus tinklas.'],
        ['Tell My Wi-Fi Love Her', 'Ak.'],
        ['Get Off My LAN', 'Tikriausiai niurzgus kaimynas.'],
        ['Bridlington Seagulls', 'Jie jau pavogė jūsų bulvytes. Neduokite jiems ir slaptažodžio.'],
        ['FREE WIFI (honest)', 'Tinklas, vadinamas „free Wi-Fi“, kurio nepažįstate, yra būtent toks, prie kurio neverta jungtis!'],
    ];

    const FORTUNES = ['Šiandien gera diena nuotraukų atsarginei kopijai.', 'Stiprus slaptažodis yra laimingas slaptažodis.', 'Sulauksite telefono skambučio. Tai bus sukčiai. Padėkite ragelį.',
        'Ar bandėte išjungti ir vėl įjungti?', 'Geriausias laikas atnaujinti buvo vakar. Antras geriausias laikas yra dabar.', 'Puodelis arbatos sutvarko daugumą dalykų. Tik ne kompiuterius.',
        'Niekada neduokite slaptažodžio nepažįstamajam. Nei žuvėdrai.', 'Rasite pultelį. Jis už sofos.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP adresas: 192.168.1.42<br>Maršrutizatorius: 192.168.1.1<br>Signalas: −54 dBm (labai geras)<br>Kanalas: 36 (5 GHz)<br>Greitis: 866 Mbps<br>Sauga: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi išjungtas. Įjunkite jį, kad pamatytumėte tinklus.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Nėra interneto</strong><br>Pabandykite patikrinti Wi-Fi. Paspauskite <kbd>tarpo klavišą</kbd> arba palieskite, kad žaistumėte.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>ŽAIDIMAS BAIGTAS · paspauskite tarpo klavišą, kad žaistumėte vėl</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Ar šiandien mūkei?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Išbandykite: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Mū!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Įvedėte „sl“ vietoj „ls“? Štai garvežys.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (mokomoji) | | | | | | Darbalaukis: Cinnamon | | | | | | Apvalkalas: bash | \\_____/ | Veikimo laikas: nuo pusryčių \\___________/ Atmintis: niekada nepamiršta gimtadienio`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Gerai. 🥪');
        else if (lc === 'make me a sandwich') say('Ką? Pasidaryk pats.');
        else if (/rm\s+-rf/.test(lc)) say('Gerai bandėte! Šis mokomasis terminalas neleis nieko sugadinti.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: komanda nerasta (išbandykite „help“)`);
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
        else if (note) note.textContent = 'Ši mokomoji naršyklė neieško tikrame internete. Nieko, ką įvedate, niekur nesiunčiama.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Balandžio 1-oji! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Kodas aktyvuotas! +30 gyvybių 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Sveiki atvykę į Macintosh.</p></div><p>Kodas aktyvuotas! +30 gyvybių 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Kodas aktyvuotas! +30 gyvybių 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Kiti langai paslėpti.' : 'Aero Shake! (Kitų langų, kuriuos reikėtų paslėpti, nebuvo.)');
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
                funToast(screen, 'Wi-Fi įjungtas. Prisijungta prie Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi išjungtas.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Jungkitės tik prie jums žinomų tinklų.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Balandžio 1-oji! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Rodinys'], ['', 'Rikiuoti pagal'], ['refresh', 'Atnaujinti'], ['', 'Naujas'], ['wall', 'Suasmeninti']]
                : os === 'mac' ? [['', 'Naujas aplankas'], ['', 'Gauti informaciją'], ['wall', 'Keisti ekrano foną…'], ['', 'Naudoti krūvas']]
                : [['', 'Sukurti naują aplanką'], ['terminal', 'Atidaryti terminale'], ['wall', 'Keisti darbalaukio foną']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Ekrano fonas: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (mokomoji versija)</small>
                <dl><dt>Lustas</dt><dd>Bridlington Silicon B1</dd><dt>Atmintis</dt><dd>Niekada nepamiršta gimtadienio</dd><dt>Paleidimo diskas</dt><dd>Mokomasis HD</dd><dt>Serijos numeris</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Užrašinė' : os === 'mac' ? 'TextEdit' : 'Teksto redaktorius';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Be pavadinimo – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Eil. 1, stulp. 1 &nbsp;|&nbsp; 100 % &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Paprastas tekstas'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Sveiki! Tai mokomasis terminalas. Įveskite „help“, kad pamatytumėte, ką galite išbandyti. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Orai'], ['news', '⟦newspaper⟧', 'Naujienos'], ['bus', '⟦bus⟧', 'Autobusų laikai'], ['recipes', '⟦cake-slice⟧', 'Receptai']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Bridlington oras</h3><p class="fd">Mokomoji prognozė</p><div class="ajf">${[['Šiandien', '⟦cloud-sun⟧', '13°'], ['Pen.', '⟦cloud-rain⟧', '11°'], ['Šeš.', '⟦wind⟧', '10°'], ['Sek.', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Žuvėdrų aktyvumas: <strong>labai didelis</strong>. Saugokite bulvytes.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Mokomosios naujienos</h3><ul class="news">
            <li><strong>Vietinis gyventojas pagaliau randa televizoriaus pultelį</strong> už sofos po trijų savaičių.</li>
            <li><strong>Pastebėta žuvėdra su 99 Flake</strong>. Ledų savininkas „nesižavi“.</li>
            <li><strong>Močiutė lenkia anūką vaizdo skambučiuose</strong>: „Aš tiesiog paspaudžiau žalią mygtuką.“</li>
            <li><strong>Tyrimas nustatė</strong>, kad 9 iš 10 kompiuterio problemų išsprendžia išjungimas ir vėl įjungimas.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Autobusų laikai</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Viktorijos biskvitinis pyragas</h3><p>Išmaišykite po 200 g sviesto, cukraus ir miltų su kildinamaisiais miltais su 4 kiaušiniais. Kepkite dviejose formose 180 °C temperatūroje 20–25 minutes. Įdarykite uogiene ir grietinėle.</p><p class="fd">Patarimas: nustatykite telefone laikmatį arba paprašykite: „Nustatyk 25 minučių laikmatį“.</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Naujas skirtukas' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Ieškokite arba įveskite interneto adresą'}</div>
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
        Documents: [['⟦file-text⟧', 'Shopping list.txt'], ['⟦file-text⟧', 'Letter to council.docx'], ['⟦folder⟧', 'Receptai'], ['⟦file-spreadsheet⟧', 'Christmas card list.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Council tax bill.pdf'], ['⟦file-text⟧', 'Bus timetable.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Seaside brass band.mp3'], ['⟦music⟧', 'Sixties hits.mp3']],
    };
    function funFiles(screen, os, folder = 'Paveikslėliai', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Šiukšlinė' : os === 'mac' ? 'Šiukšliadėžė' : 'Šiukšlinė'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Dog on the beach.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Prisijungta prie Home-WiFi-5G' : 'Wi-Fi išjungtas.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Suasmeninimas' : os === 'mac' ? 'Ekrano fonas' : 'Fonai'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Programinės įrangos naujinimas' : 'Naujinimai'}</h3><p class="mj">⟦check⟧ Esate atnaujinę</p><p class="cf">Paskutinį kartą tikrinta: šiandien, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Tikrinti naujinimus</button><p class="zi"></p>`,
            about: `<h3>Apie</h3><div class="zk"><div><span>Įrenginio pavadinimas</span><b>MARGARET-PRACTICE</b></div><div><span>Sistema</span><b>${os === 'windows' ? 'Windows 11 (mokomoji)' : os === 'mac' ? 'macOS 27 (mokomoji)' : 'Linux Mint 22.3 (mokomoji)'}</b></div>
                <div><span>Procesorius</span><b>Bridlington Silicon B1</b></div><div><span>Atmintis</span><b>Niekada nepamiršta gimtadienio</b></div><div><span>Saugykla</span><b>Pakanka anūkų nuotraukoms</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Suasmeninimas' : os === 'mac' ? 'Ekrano fonas' : 'Fonai'], ['update', 'Naujinimai'], ['about', 'Apie']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Mokomasis minų ieškotojas', 'Klasikinis minų ieškojimo žaidimas.'], ['solitaire', '⟦spade⟧', 'Pasjansas', 'Netrukus šioje mokomojoje parduotuvėje.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Netrukus šioje mokomojoje parduotuvėje.'], ['weather', '⟦cloud-sun⟧', 'Orai', 'Netrukus šioje mokomojoje parduotuvėje.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Atidaryti' : (os === 'mac' ? 'Gauti' : 'Įdiegti')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Mokomasis minų ieškotojas', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Spustelėkite, kad kastumėte. Dešiniuoju pelės mygtuku spustelėkite (arba paspauskite ir laikykite), kad pastatytumėte vėliavėlę.</p></div>`, 'bz'));
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
        ['Mama', 'Kaip išjungti šitą daiktą?', 'Labas, mielasis, parašiau šį laišką, bet nerandu išjungimo mygtuko. Ar tai apvalus? Myliu, mama xx P. S. Paspaudžiau jį. Nieko nenutiko. Ar taip ir turi būti?'],
        ['Bridlington Walkers', 'Šeštadienio pasivaikščiojimas', 'Susitinkame uoste 10 val. Pasiimkite termosą ir neperšlampamą striukę. Praėjusios savaitės žuvėdros incidento nenagrinėsime.'],
        ['Princas Abu (Labai turtingas)', 'SKUBU: laimėjote £4 000 000!!!', 'Mielas Brangus Drauge, aš esu princas ir man reikia jūsų banko duomenų, kad galėčiau atsiųsti jums keturis milijonus svarų. Taip pat atsiųskite £50 už pašto ženklą. — Tai sukčiavimas! Tikri žmonės neišdalija milijonų el. paštu. Ištrinkite laišką arba persiųskite jį į report@phishing.gov.uk.'],
        ['Sarah', 'Sekmadienio nuotraukos 🌻', 'Štai nuotraukos iš sodo. Šuo suėdė dar vieną saulėgrąžą.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Paštas', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Tai mokomasis kompiuteris, todėl jo išjungti negalima 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Atsisiuntimai', '⟦triangle-alert⟧ „Nemokamos valymo“ programos dažnai yra šlamštas ar dar blogiau. Geriausia jį ištrinti, o ne atidaryti!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `„${n}“ tikrame kompiuteryje čia atsivertų.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi įjungtas.' : 'Wi-Fi išjungtas.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Tikrinami naujinimai…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Naujų naujinimų nėra. Viskas paruošta!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Ši tik pademonstravimui mokomojoje parduotuvėje.'); return true; }
            el.textContent = 'Diegiama…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Atidaryti'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Be pavadinimo 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Failas Redagavimas Rodinys Įterpimas Formatas <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Gerb. ponia ar pone, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Naujinimų tvarkyklė', '<div class="ajz"><p class="mj">⟦check⟧ Jūsų sistema atnaujinta</p><p class="cf">Linux Mint pats tikrina naujinimus ir rodo tašką ant skydelio, kai jų yra.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Rašykite čia, kad ieškotumėte</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Šiukšlinė', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Kompiuteris', '⟦monitor⟧')}${icon('Namai', '⟦house⟧')}${icon('Šiukšlinė', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Ieškoti programų, nustatymų ir dokumentų')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Paieška')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Rašykite, kad ieškotumėte…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Naujas skirtukas <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Ieškokite arba įveskite interneto adresą</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Tai <strong>darbalaukis</strong>. Juosta apačioje yra <strong>užduočių juosta</strong>. Naršyklę atidarykite iš meniu Pradėti: <strong>spustelėkite Pradėti</strong>, keturis kvadratus.'
            : os === 'mac' ? 'Tai <strong>darbalaukis</strong>. Programų eilutė apačioje yra <strong>Dock</strong>, o juosta viršuje – <strong>meniu juosta</strong>. <strong>Spustelėkite Programos</strong> (kvadratų tinklelį), kad pamatytumėte visas programas.'
            : 'Tai „Linux Mint“ <strong>darbalaukis</strong>. Juosta apačioje yra <strong>skydelis</strong>. Jūsų programos yra Meniu: <strong>spustelėkite Meniu</strong>, apačioje kairėje.',
         hint: os === 'mac' ? 'Programos yra Dock apačioje, šalia Finder.' : (os === 'windows' ? 'Pradėti yra keturi mėlyni kvadratai užduočių juostoje.' : 'Mygtukas Meniu yra pačiame apatinio skydelio kairėje.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Spustelėkite ${N.browser[os]}</strong>, naršyklę.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Kiekvienas langas turi tris spalvotus mygtukus <strong>viršuje kairėje</strong>. Geltonas paslepia langą. <strong>Spustelėkite geltoną mygtuką.</strong>'
            : 'Kiekvienas langas turi tris mygtukus <strong>viršuje dešinėje</strong>. Linija <strong>—</strong> paslepia langą (sumažina). <strong>Spustelėkite —</strong>.',
         hints: {'win-close': 'Tai jį uždaro. Pirmiausia paslėpkite jį naudodami ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Tai užpildo visą ekraną. Pirmiausia paslėpkite jį.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Jis paslėptas, bet neuždarytas. Tai, kad yra ${os === 'mac' ? 'taškas po jo piktograma Dock juostoje' : 'line under its icon'}, rodo, jog jis vis dar atidarytas. <strong>Spustelėkite ${N.browser[os]} piktogramą</strong>, kad jį grąžintumėte.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Dabar padarykite, kad užpildytų ekraną: <strong>spustelėkite mygtuką ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: '„Mac“ raudonas mygtukas uždaro langą. Bet programa gali toliau veikti. Kaip ją visiškai uždaryti?', options: [
                {t: 'Paspausti ⟦command⟧ Cmd + Q arba viršuje programos meniu pasirinkti Quit', ok: true, why: 'Taip. Taškas po programa Dock reiškia, kad ji vis dar veikia. ⟦command⟧ Cmd + Q ją uždaro.'},
                {t: 'Du kartus spustelėti raudoną mygtuką', why: 'Raudonas mygtukas uždaro tik langus. ⟦command⟧ Cmd + Q (arba programos meniu > Quit) uždaro programą.'}]}
            : {q: 'Kur yra lango uždarymo mygtukas?', options: [
                {t: 'Viršuje dešinėje: ⟦x⟧', ok: true, why: 'Taip. „Windows“ ir „Linux Mint“ trys mygtukai yra viršuje dešinėje. („Mac“ jie viršuje kairėje, raudonas, geltonas ir žalias.)'},
                {t: 'Apačioje kairėje', why: 'Jis yra kiekvieno lango viršuje dešinėje: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Šaunu!</strong> Galite atidaryti, paslėpti, grąžinti, padidinti ir uždaryti langus. Tai didžioji dalis darbo kompiuteriu.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Namai' : 'Namai'], ['desktop', 'Darbalaukis'], ['documents', 'Dokumentai'], ['downloads', 'Atsisiuntimai'], ['pictures', 'Paveikslėliai']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB atmintukas']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Dokumentai'], ['pictures', '⟦folder⟧', 'Paveikslėliai'], ['downloads', '⟦folder⟧', 'Atsisiuntimai']],
            downloads: [['photo', '⟦image⟧', 'Holiday photo.jpg'], ['bill', '⟦file-text⟧', 'Council tax bill.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Holiday photo.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Atostogos')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Letter to council.docx'], ['recipes', '⟦folder⟧', 'Receptai']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Dokumentai']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Naujas aplankas', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Namai' : 'Namai', downloads: 'Atsisiuntimai', pictures: 'Paveikslėliai', documents: 'Dokumentai', usb: 'USB atmintukas', desktop: 'Darbalaukis'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Šis aplankas tuščias</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Kopijuoti' : 'Kopijuoti';
    const pasteLabel = os => os === 'mac' ? 'Įklijuoti elementą' : 'Įklijuoti';
    const newFolderLabel = os => os === 'mac' ? 'Naujas aplankas' : os === 'windows' ? 'Naujas > Aplankas' : 'Sukurti naują aplanką';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Jūsų nuotraukos ir laiškai laikomi <strong>aplankuose</strong>. <strong>Spustelėkite ${N.files[os]}</strong>, kad į juos pažiūrėtumėte.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'Dock kairėje' : 'esanti čia: ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Šone yra pagrindiniai aplankai. Tai, ką atsisiunčiate iš laiškų ir svetainių, patenka į <strong>Atsisiuntimai</strong>. <strong>Spustelėkite Atsisiuntimai.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Atidaryti'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Pervardyti'], ['menu-delete', os === 'mac' ? 'Perkelti į šiukšliadėžę' : 'Ištrinti']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Nukopijuokime atostogų nuotrauką į Paveikslėlius, kur jai vieta. <strong>Spustelėkite dešiniuoju mygtuku</strong> ant <strong>Holiday photo.jpg</strong>: paspauskite <strong>dešinįjį</strong> pelės mygtuką. <em>' + (os === 'mac' ? 'Jutikliniame kilimėlyje spustelėkite dviem pirštais.' : 'Jutikliniame ekrane paspauskite ir laikykite.') + '</em>',
         hint: 'Ant nuotraukos naudokite dešinįjį pelės mygtuką.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Atsiranda meniu. <strong>Spustelėkite ${copyLabel(os)}.</strong> <em>(Spartusis klavišas yra ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Ne tą! Spustelėkite Kopijuoti.', 'menu-open': 'Tai atidaro nuotrauką. Spustelėkite Kopijuoti.', 'menu-rename': 'Spustelėkite Kopijuoti.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Kairėje spustelėkite Paveikslėliai.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Paveikslėliai tušti. <strong>Dešiniuoju mygtuku spustelėkite tuščioje baltoje vietoje.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Spustelėkite ${pasteLabel(os)}.</strong> <em>(Arba ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Aplanką sukursime vėliau. Pirmiausia spustelėkite ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Nuotrauka dabar yra ir Paveikslėliuose. Dabar sukurkite aplanką atostogų nuotraukoms laikyti kartu. <strong>Dar kartą spustelėkite dešiniuoju mygtuku tuščioje vietoje.</strong>', hints: {'rc-photo2': 'Spustelėkite dešiniuoju mygtuku tuščioje vietoje, o ne ant nuotraukos.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Spustelėkite ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Pirmiausia įveskite aplanko pavadinimą, pvz., Atostogos.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Įveskite pavadinimą</strong>, pvz., <strong>Atostogos</strong>, tada <strong>spustelėkite Gerai</strong> (arba paspauskite Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Kur dažniausiai patenka failai iš laiškų ir svetainių?', options: [
            {t: 'Į aplanką Atsisiuntimai', ok: true, why: 'Taip. Jei nerandate atsisiųsto failo, pirmiausia ieškokite Atsisiuntimuose.'},
            {t: 'Į darbalaukį', why: 'Dažniausiai į Atsisiuntimus. Jei ko nors nerandate, pirmiausia ieškokite ten.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Šaunu!</strong> Spustelėjimas dešiniuoju mygtuku yra daugumos dalykų paslaptis: kopijavimas, įklijavimas, pervardijimas ir naujas aplankas yra tame meniu.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Įveskite tinklo slaptažodį</p>${field('wifipass', 'Slaptažodis', ctx)}<button type="button" class="ce co" data-tap="connect">Prisijungti</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi tinklai'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Prisijungta prie Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Norėdami prisijungti prie Wi-Fi, <strong>spustelėkite Wi-Fi simbolį</strong> ${os === 'mac' ? 'ekrano viršuje dešinėje' : 'apačioje dešinėje, šalia laikrodžio'}.`, hint: os === 'mac' ? 'Jis yra meniu juostoje viršuje dešinėje.' : 'Jis yra šalia laikrodžio apačioje dešinėje.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Jūsų tinklo pavadinimas yra lipduke ant maršruto parinktuvo. Šis mokomasis yra <strong>Home-WiFi-5G</strong>. <strong>Spustelėkite jį.</strong>', hints: {'net-neighbour': 'Tai kaimyno! Pasirinkite Home-WiFi-5G.', 'net-cafe': 'Tai ne jūsų namų. Pasirinkite Home-WiFi-5G.', 'tray-wifi': 'Wi-Fi tinklų sąrašas jau atidarytas. Spustelėkite Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Įveskite slaptažodį tiksliai: Green-Apple-42 (didžioji G ir A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Įveskite slaptažodį iš lipduko <strong>tiksliai</strong>: <strong>Green-Apple-42</strong>. Tada <strong>spustelėkite Prisijungti</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Wi-Fi skydelis jau atidarytas. Įveskite slaptažodį laukelyje, tada spustelėkite Prisijungti.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Esate kavinėje su nemokamu Wi-Fi. Ar galima naudotis internetine bankininkyste?', options: [
            {t: 'Geriau palaukti iki namų arba naudoti telefono mobiliuosius duomenis', ok: true, why: 'Taip. Nemokamas Wi-Fi tinka naršymui, bet bankininkystei naudokite namų Wi-Fi ar mobiliuosius duomenis.'},
            {t: 'Taip, tinka bet koks Wi-Fi', why: 'Nemokamas viešas Wi-Fi tinka naršymui, bet bankininkystę pasilikite namams ar mobiliesiems duomenims.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Šaunu!</strong> Kompiuteris prisimins slaptažodį ir kitą kartą prisijungs pats.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Pirkinių sąrašas: pienas, duona, kiaušiniai, arbatos maišeliai, atvirukas Jean gimtadieniui';
        const note = pcWin(os, `Pirkinių sąrašas – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Naujas laiškas Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Spustelėkite čia, kad rašytumėte…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Paštas' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Spartieji klavišai sutaupo daug spustelėjimų. <strong>${CMDL(os)}</strong> yra klavišas ${os === 'mac' ? 'abipus tarpo klavišo, pažymėtas ⟦command⟧' : 'klaviatūros apačioje kairėje'}. Norėdami pažymėti visą tekstą, laikykite <strong>${CMDL(os)}</strong> ir paspauskite <strong>A</strong>. <em>Naudokite tikrą klaviatūrą arba mygtukus ekrane.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Pažymėta. Dabar nukopijuokite: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Nukopijuota! <strong>Spustelėkite laiško viduje</strong> Sarah, kur parašyta „Spustelėkite čia, kad rašytumėte“.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Dabar įklijuokite: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Oi, per klaidą kažką ištrynėte. Kuris spartusis klavišas tai atšaukia?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Taip. ${CMDL(os)} + Z atšaukia paskutinį veiksmą beveik kiekvienoje programoje. Paspauskite dar kartą, kad atšauktumėte daugiau.`},
            {t: 'Escape', why: `Escape uždaro meniu. ${CMDL(os)} + Z yra atšaukimas.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Kaip padaryti ekrano kopiją (ekrano nuotrauką)?', options: [
            {t: os === 'windows' ? 'Windows klavišas + Shift + S, tada apibrėžti, ko norite' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, tada apibrėžti, ko norite' : 'Paspausti klavišą Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Taip. Ji nukopijuojama, o pranešimas leidžia ją išsaugoti. Klavišas Print Screen taip pat veikia.' : os === 'mac' ? 'Taip. Paveikslėlis išsaugomas darbalaukyje. Shift + ⟦command⟧ Cmd + 3 nufotografuoja visą ekraną.' : 'Taip. Linux Mint išsaugo jį aplanke Paveikslėliai. Shift + Print Screen leidžia pasirinkti sritį.'},
            {t: 'Nufotografuoti ekraną telefonu', why: 'Tinka, bet ekrano kopija daug aiškesnė. ' + (os === 'windows' ? 'Windows klavišas + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Paspauskite Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Šaunu!</strong> Svarbiausi keturi: <strong>${CMDL(os)} + C</strong> kopijuoti, <strong>V</strong> įklijuoti, <strong>Z</strong> atšaukti, <strong>A</strong> pažymėti viską. Jie veikia beveik kiekvienoje programoje.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Nemokamai', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Nemokama · Pirkiniai programoje', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Ieškoti programų</span></button><div class="hp"><span>RODOMA</span><strong>Programos jūsų naujam kompiuteriui</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Atidaryti' : (os === 'mac' ? 'Gauti' : 'Įdiegti')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Diegiamas LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Mokomoji parduotuvė: pavadinimai ir kainos yra pavyzdžiai.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Saugiausia vieta programoms gauti yra įtaisytoji parduotuvė: <strong>${N.store[os]}</strong>. <strong>Spustelėkite ją.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Norite kažko laiškams rašyti, kaip Word. <strong>Spustelėkite paieškos laukelį.</strong> Ieškosime „office“.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> yra nemokama „Microsoft Office“ alternatyva, kurią sukūrė <strong>The Document Foundation</strong>. Patikrinkite, kas ją sukūrė, tada <strong>spustelėkite ' + (os === 'mac' ? 'Gauti' : 'Įdiegti') + ' šalia LibreOffice</strong>.',
         hints: {'get-fake1': 'Tai reklama, ir už ją imama £29,99 per metus. LibreOffice nemokamas.', 'get-fake2': 'Ją sukūrė AppMakers, ir joje yra pirkinių programoje. Pasirinkite LibreOffice, kurį sukūrė The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Svetainės iššokantis langas sako: „Jūsų kompiuteris lėtas! Atsisiųskite Speed Booster dabar“. Ką darote?', options: [
            {t: 'Uždarau jį. Programas diegiu tik iš parduotuvės arba paties kūrėjo svetainės', ok: true, why: 'Būtent. Iššokantys langai, siūlantys „greitintuvus“ ar „valiklius“, dažnai yra šlamštas ar dar blogiau.'},
            {t: 'Atsisiunčiu, gal padės', why: 'Jie dažnai yra šlamštas ar žalingi. Diekite tik iš parduotuvės arba paties kūrėjo svetainės.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Šaunu!</strong> LibreOffice įdiegtas. Tikrinkite kūrėją, nekreipkite dėmesio į reklamas ir būkite atsargūs su „nemokamomis“ programomis, kurios vėliau prašo pinigų.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Namai'], ['system', 'Sistema'], ['bluetooth', 'Bluetooth ir įrenginiai'], ['network', 'Tinklas ir internetas'], ['accounts', 'Paskyros'], ['privacy', 'Privatumas ir sauga'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Pradžia</h3><p class="cf">Rekomenduojami nustatymai ir jūsų paskyra.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Esate atnaujinę</p>' : ctx.ready ? `<p class="cf">Norint baigti diegti naujinimus, reikia paleisti iš naujo.</p><button type="button" class="ce co bz" data-tap="restart">Paleisti iš naujo dabar</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Atsisiunčiama… 45 %' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Nustatymai', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Bendra'], ['privacy', 'Privatumas ir sauga'], ['users', 'Naudotojai ir grupės']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Jūsų Mac atnaujintas</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Atsisiunčiama… liko apie 10 minučių' : 'Saugos ir klaidų pataisymai'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Privatumas ir sauga</h3><p class="cf"><strong>Sauga</strong><br>Leisti programas iš:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store ir žinomų kūrėjų</button>`,
            };
            return pcWin(os, 'Sistemos nustatymai', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Sistemos nustatymai</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Naujinimų tvarkyklė', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Jūsų sistema atnaujinta</p>' : `<div class="ahf">${['Naršyklė Firefox', 'Linux branduolys (sauga)', 'LibreOffice', 'Sistemos bibliotekos'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Diegiami naujinimai…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Reikia patvirtinti tapatybę</strong></p><p class="fd">Įveskite slaptažodį, kad įdiegtumėte naujinimus. (Pratyba: įvesta už jus.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Atšaukti</button><button type="button" class="adg" data-tap="auth-ok">Patvirtinti tapatybę</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Naujinimai taiso saugos spragas, kuriomis naudojasi sukčiai. Patikrinkime, ar jų yra. <strong>Spustelėkite Pradėti.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Spustelėkite Parametrai</strong> (krumpliaratis).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Spustelėkite Windows Update</strong>, sąrašo kairėje apačioje.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Laukia naujinimai. <strong>Spustelėkite Atsisiųsti ir įdiegti viską.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Pirmiausia išsaugokite, ką dirbate, tada <strong>spustelėkite Paleisti iš naujo dabar</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Naujinimai taiso saugos spragas, kuriomis naudojasi sukčiai. <strong>Viršuje kairėje spustelėkite „Apple“ meniu</strong> (logotipą).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Spustelėkite Sistemos nustatymai…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Esate skiltyje Bendra. <strong>Spustelėkite Programinės įrangos naujinimas.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Naujinimas paruoštas. Prijunkite įkroviklį, tada <strong>spustelėkite Atnaujinti dabar</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac jį atsisiunčia, tada paleidžiamas iš naujo, kad įdiegtų.',
         question: {q: 'Automatiniai naujinimai įjungti. Ar vis tiek reikia ką nors daryti?', options: [
            {t: 'Tiesiog paleisti iš naujo, kai paprašo, ir kartkartėmis palikti prijungtą prie įkroviklio per naktį', ok: true, why: 'Taip. Naujinimai dažnai įdiegiami per naktį. Paleidus iš naujo, kai paprašo, jie užbaigiami.'},
            {t: 'Išjungti automatinius naujinimus', why: 'Palikite juos įjungtus: jie saugo jus. Tiesiog paleiskite iš naujo, kai Mac paprašys.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Naujinimai taiso saugos spragas. „Linux Mint“ <strong>skydelis</strong> prie laikrodžio rodo tašką, kai laukia naujinimų. <strong>Spustelėkite skydelį.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Naujinimų tvarkyklė pateikia juos visus. <strong>Spustelėkite Įdiegti naujinimus.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux prieš keisdamas ką nors svarbaus paprašo <strong>jūsų slaptažodžio</strong>. Tai gerai. <strong>Spustelėkite Patvirtinti tapatybę.</strong>', hints: {'auth-cancel': 'Tai atšaukia naujinimus. Spustelėkite Patvirtinti tapatybę.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Kaip dažnai reikia diegti naujinimus?', options: [
            {t: 'Kai tik skydelis rodo tašką: tai užtrunka vos minutę', ok: true, why: 'Taip. „Linux Mint“ retai reikia paleisti iš naujo, išskyrus kai kuriuos saugos naujinimus.'},
            {t: 'Kartą per metus', why: 'Diekite juos, kai tik skydelis rodo tašką. Tai užtrunka vos minutę.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Šaunu!</strong> Kompiuteris atnaujintas. Naujinimų diegimas yra geriausias dalykas, kurį galite padaryti saugumui.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistema', 'Ekranas, garsas, apie'], ['tile-devices', '⟦printer⟧', 'Įrenginiai', 'Bluetooth, spausdintuvai'], ['tile-network', '⟦globe⟧', 'Tinklas ir internetas', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Paskyros', 'Jūsų sąskaitos'], ['tile-update', '⟦refresh-cw⟧', 'Naujinimas ir sauga', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Jūsų kompiuteris užregistruotas Extended Security Updates</p><p class="cf">Saugos naujinimai iki 2027 m. spalio 12 d.</p>' : `<div class="ahg"><strong>Windows 10 palaikymas baigėsi</strong><p>Jūsų kompiuteris neatitinka Windows 11 reikalavimų. Užsiregistruokite Extended Security Updates, kad ir toliau gautumėte saugos naujinimus.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Užsiregistruoti dabar</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="cf">Pasirinkite, kaip užsiregistruoti:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Sukurti kompiuterio nustatymų atsarginę kopiją</strong><small>Nemokamai, su Microsoft paskyra</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Panaudoti 1 000 Microsoft Rewards taškų</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Vienkartinis pirkinys</strong><small>Mokama</small></button>${ctx.busy ? '<p class="cf">Registruojama…</p>' : ''}`;
        return pcWin('windows', 'Nustatymai', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Jei jūsų kompiuteris atrodo taip, su Pradėti kairiausiai, tai gali būti <strong>Windows 10</strong>. Patikrinkime. <strong>Spustelėkite Pradėti.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Spustelėkite Parametrai</strong> (krumpliaratis).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Spustelėkite Sistema.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Rašoma Windows 10 Home. Ką tai reiškia 2026 m.?', options: [
            {t: 'Microsoft nutraukė įprastą palaikymą 2025 m. spalį. Jis vis dar veikia, bet norint likti saugiam, reikia Extended Security Updates', ok: true,
             why: 'Taip. Nemokama Extended Security Updates programa namų naudotojams dabar teikiama iki 2027 m. spalio 12 d. Po to Windows 10 nebegaus jokių saugos pataisų.'},
            {t: 'Nieko, Windows 10 bus atnaujinamas amžinai', why: 'Įprastas palaikymas baigėsi 2025 m. spalį. Extended Security Updates dabar teikiami iki 2027 m. spalio 12 d., tada nutrūksta.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Spustelėkite ← Pradžia</strong>, kad grįžtumėte.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Spustelėkite Naujinimas ir sauga.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Šis nešiojamasis kompiuteris per senas Windows 11, todėl Windows siūlo <strong>Extended Security Updates</strong>. <strong>Spustelėkite Užsiregistruoti dabar.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Nemokamas būdas – sukurti nustatymų atsarginę kopiją Microsoft paskyroje. <strong>Spustelėkite Sukurti kompiuterio nustatymų atsarginę kopiją.</strong>', hints: {'esu-buy': 'Mokėti nereikia. Pasirinkite nemokamą atsarginės kopijos parinktį.', 'esu-points': 'Tinka, jei turite taškų, bet atsarginės kopijos parinktis nemokama visiems.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Kokios jūsų galimybės iki 2027 m. spalio?', options: [
            {t: 'Atnaujinti į Windows 11, jei galima, nusipirkti naują kompiuterį arba senesnį perjungti į Linux Mint (nemokamas)', ok: true, why: 'Taip. Linux Mint nemokamas ir gerai veikia senesniuose nešiojamuosiuose kompiuteriuose. Kitose pamokose parodoma, kur kas yra Mac ir „Linux Mint“.'},
            {t: 'Naudoti Windows 10 po 2027 m. bankininkystei', why: 'Po 2027 m. spalio jis negauna saugos pataisų, todėl bankininkystei nesaugus. Atnaujinkite, pakeiskite arba pereikite prie Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Šaunu!</strong> Žinote, kurį Windows turite ir kaip jį išlaikyti saugų iki 2027 m. spalio. Saugokitės skambučių ar iššokančių langų, siūlančių „atnaujinti“ už mokestį: tai sukčiavimas.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Pereinate nuo Windows? „Mac“ programos yra apačioje esančiame <strong>Dock</strong>, o kiekvienos programos meniu – viršuje esančioje <strong>meniu juostoje</strong>. <strong>Dock spustelėkite Safari</strong>, naršyklę.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: '„Mac“ langų mygtukai yra <strong>viršuje kairėje</strong>. <strong>Spustelėkite raudoną</strong>, kad uždarytumėte langą.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Langas dingo, bet matote <strong>tašką po Safari</strong> Dock? Jis vis dar veikia. Norėdami jį išjungti, <strong>spustelėkite dešiniuoju mygtuku Safari Dock</strong> (jutikliniame kilimėlyje dviem pirštais).', hint: 'Spustelėkite dešiniuoju mygtuku (arba dviem pirštais) Safari piktogramą Dock.',
         hints: {'app-browser': 'Paprastas spustelėjimas jį atidaro iš naujo. Verčiau spustelėkite dešiniuoju mygtuku.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Spustelėkite Quit.</strong> <em>(Spartusis klavišas yra ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Nustatymai yra po <strong>„Apple“ meniu</strong> (logotipu) viršuje kairėje. <strong>Spustelėkite jį.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Čia taip pat yra Išjungti ir Paleisti iš naujo. <strong>Spustelėkite Sistemos nustatymai…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin('mac', c, 'general')}),
         question: {q: '„Windows“ kopijuojate Ctrl + C. Kaip „Mac“?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Taip. Dauguma Windows spartųjų klavišų „Mac“ naudoja ⟦command⟧ Cmd vietoj Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, tas pats', why: '„Mac“ tai ⟦command⟧ Cmd + C. Dauguma Ctrl sparčiųjų klavišų tampa ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Šaunu!</strong> Dock apačioje, meniu viršuje, langų mygtukai viršuje kairėje, ⟦command⟧ Cmd vietoj Ctrl ir „Apple“ meniu nustatymams bei išjungimui.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> yra nemokama sistema, labai panaši į Windows, gerai veikianti senesniuose kompiuteriuose. Jūsų programos yra <strong>Meniu</strong> apačioje kairėje, kaip mygtukas Pradėti. <strong>Spustelėkite Meniu.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: '„Linux Mint“ jau turi įdiegtų nemokamų programų. Laiškams rašyti naudokite <strong>LibreOffice Writer</strong>, veikiantį kaip Microsoft Word. <strong>Spustelėkite jį.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Be pavadinimo 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Failas Redagavimas Rodinys Įterpimas Formatas <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Gerb. ponia ar pone,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Ar galite atidaryti Word dokumentus, kuriuos jums atsiunčia el. paštu?', options: [
            {t: 'Taip. LibreOffice atidaro ir išsaugo Word (.docx) failus', ok: true, why: 'Taip. Išsaugodami kažką Word naudotojui, parinkite Word formatą (.docx) per Įrašyti kaip.'},
            {t: 'Ne, tam reikia Windows', why: 'LibreOffice atidaro ir išsaugo Word (.docx) failus, todėl galite keistis dokumentais su Word naudotojais.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Be pavadinimo 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Gerb. ponia ar pone,</div></div>', {max: true})}),
         target: 'win-close', say: 'Langų mygtukai yra viršuje dešinėje, kaip Windows. <strong>Spustelėkite ⟦x⟧</strong>, kad uždarytumėte Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Dabar suraskime, kur gauti daugiau programų. <strong>Dar kartą spustelėkite Meniu</strong>.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Programinės įrangos tvarkyklė</strong> yra nemokama „Linux Mint“ programų parduotuvė. <strong>Spustelėkite ją.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Programinės įrangos tvarkyklė', `<div class="jo"><div class="gq">${ICON.search}<span>Paieška</span></div>
            <div class="aan">${['Internetas', 'Biuras', 'Grafika', 'Garsas ir vaizdas', 'Žaidimai', 'Prieinamumas'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Tūkstančiai nemokamų programų, patikrintų „Linux Mint“.</p></div>`, {max: true})}),
         question: {q: 'Ar reikia pirkti antivirusinę programą „Linux Mint“?', options: [
            {t: 'Ne. Laikykite atnaujintą, programas gaukite iš Programinės įrangos tvarkyklės, ir būsite gerai apsaugoti', ok: true, why: 'Taip. Linux turi mažai virusų. Darbą atlieka naujinimai ir įtaisytoji užkarda. Sukčiavimas el. laiškuose ir svetainėse vis tiek galioja, tad būkite budrūs.'},
            {t: 'Taip, pačią brangiausią', why: 'Ne. Laikykite atnaujintą ir programas gaukite iš Programinės įrangos tvarkyklės. Saugokitės el. laiškų ir svetainių sukčiavimo kaip įprasta.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Šaunu!</strong> Meniu apačioje kairėje, uždarymas viršuje dešinėje, LibreOffice dokumentams, Firefox internetui, Programinės įrangos tvarkyklė programoms ir skydelis naujinimams.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB atmintukas prijungtas</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Prieš keisdami kompiuterius, nukopijuokite failus į <strong>USB atmintuką</strong>. Įkiškite jį į USB lizdą kompiuterio šone. Čia <strong>spustelėkite Įkišti USB atmintuką</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB atmintukas prijungtas</div>'}), target: 'app-files', say: `<strong>Atidarykite ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Atidaryti'], ['menu-copy', 'Kopijuoti'], ['menu-rename', 'Pervardyti']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Jūsų laiškai yra <strong>Dokumentuose</strong>. <strong>Dešiniuoju mygtuku spustelėkite aplanką Dokumentai.</strong> <em>(Paskui tą patį padarykite su Paveikslėliais.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Spustelėkite Kopijuoti.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Jūsų USB atmintukas yra kairėje. <strong>Spustelėkite USB atmintukas.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Jis tuščias. <strong>Dešiniuoju mygtuku spustelėkite tuščioje vietoje.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Spustelėkite ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Kopijuojami 214 elementų… liko 1 minutė' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Išimti']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Baigta! Prieš ištraukdami atmintuką, <strong>išimkite</strong> jį programiškai, kad nieko nesugadintumėte. <strong>Kairėje dešiniuoju mygtuku spustelėkite USB atmintukas.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Spustelėkite Išimti.</strong> Tada jį saugu ištraukti.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Kitas būdas perkelti failus į naują kompiuterį?', options: [
            {t: 'Internetinė saugykla: OneDrive, iCloud arba Google Drive', ok: true, why: 'Taip. Įkelkite iš seno kompiuterio, prisijunkite naujame, ir jie bus ten. USB atmintukas taip pat gera papildoma kopija.'},
            {t: 'Visus failus po vieną nusiųsti sau el. paštu', why: 'Tai užtruktų amžinybę! Naudokite USB atmintuką arba internetinę saugyklą, pvz., OneDrive, iCloud ar Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Šaunu!</strong> Naujame kompiuteryje įkiškite atmintuką, atidarykite jį ir nukopijuokite aplankus į Dokumentus ir Paveikslėlius.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Bridlington autobusų laikai ⟦star⟧ Receptai</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Neprisijungta</span><button type="button" data-tap="sync">Įjungti sinchronizavimą…</button><button type="button" data-tap="guest">Atidaryti svečio profilį</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Prisijungti su Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Pratyba: įvesta už jus.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Pirmyn</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Įjungti sinchronizavimą?</strong></p><p class="fd">Jūsų žymės, slaptažodžiai ir istorija bus išsaugoti jūsų Google paskyroje ir rodomi visuose jūsų įrenginiuose.</p><div class="jn"><button type="button" data-tap="cancel">Atšaukti</button><button type="button" class="adg" data-tap="yes-in">Taip, sutinku</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Naujas skirtukas</span>${profile}</div><div class="qn">⟦search⟧ Ieškokite Google arba įveskite URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Sinchronizuojamos jūsų žymės…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Jei senajame kompiuteryje naudojote <strong>Chrome</strong>, prisijungus žymės ir išsaugoti slaptažodžiai atkeliauja į naująjį. („Firefox“ ir „Edge“ veikia taip pat.) <strong>Spustelėkite Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Viršuje dešinėje spustelėkite asmens piktogramą.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Spustelėkite Įjungti sinchronizavimą…</strong>', hints: {guest: 'Svečio profilis nieko neišsaugo. Spustelėkite Įjungti sinchronizavimą.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Prisijunkite su <strong>ta pačia Google paskyra</strong>, kurią naudojote senajame kompiuteryje. <strong>Spustelėkite Pirmyn.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Spustelėkite Taip, sutinku.</strong>', hints: {cancel: 'Tai sustabdo sinchronizavimą. Spustelėkite Taip, sutinku.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Jūsų žymės grįžo. Ar saugu naršyklėje saugoti slaptažodžius?', options: [
            {t: 'Taip, jei jūsų Google paskyra turi stiprų slaptažodį ir 2 veiksmų patvirtinimą', ok: true, why: 'Taip. Tai daug saugiau nei visur naudoti tą patį slaptažodį. Pačią paskyrą apsaugokite 2 veiksmų patvirtinimu.'},
            {t: 'Ne, verčiau juos užrašyti ant lipnaus lapelio ekrane', why: 'Naršyklės slaptažodžių tvarkyklė yra kur kas saugesnė nei užrašas ekrane, jei jūsų paskyra turi 2 veiksmų patvirtinimą.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Šaunu!</strong> Jūsų žymės ir slaptažodžiai sekė paskui jus. Viešame ar bendrame kompiuteryje sinchronizavimo neįjunkite.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistema'} Saugos įspėjimas ⚠️</strong>
            <p>Jūsų kompiuteris UŽKRĖSTAS 5 virusais! Jūsų banko duomenys ir nuotraukos pavojuje.</p><p>Neišjunkite kompiuterio. Skambinkite pagalbos tarnybai dabar:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Skambinti dabar</button><button type="button" data-tap="fake-close">Uždaryti</button></div>
            <small>(Mokomasis sukčių puslapis. Numeris netikras.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Palikti svetainę?</strong></p><p class="fd">Jūsų atlikti pakeitimai gali būti neišsaugoti.</p><div class="jn"><button type="button" data-tap="stay">Likti</button><button type="button" class="adg" data-tap="leave">Išeiti</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Tai staiga užpildė jūsų ekraną naršant. Ar tai tikra?', options: [
            {t: 'Ne. Tai netikra svetainė, bandanti išgąsdinti jus, kad paskambintumėte sukčiams', ok: true, why: 'Būtent. Tikri įspėjimai niekada nerodo telefono numerio, kuriuo reikia skambinti. Neskambinkite ir nieko puslapyje nespauskite.'},
            {t: 'Taip, greitai paskambinu numeriu', why: 'Niekada neskambinkite. Tai netikras puslapis. „Palaikymo“ žmonės bandys perimti jūsų kompiuterį ir pinigus.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Jis užpildė visą ekraną, tad nematote, kaip jį uždaryti. Paspauskite klavišą <strong>Esc</strong> (klaviatūros viršuje kairėje), kad išeitumėte iš viso ekrano.',
         hints: {'call-btn': 'Niekada! Paspauskite klavišą Esc.', 'fake-close': 'Puslapyje esantys mygtukai gali būti spąstai. Verčiau klaviatūroje paspauskite klavišą Esc.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Dabar matote naršyklę. <strong>Uždarykite skirtuką</strong> naudodami jo ⟦x⟧.',
         hints: {'call-btn': 'Nieko puslapyje nespauskite. Uždarykite skirtuką naudodami jo ⟦x⟧.', 'fake-close': 'Tai sukčių puslapio dalis. Naudokite ⟦x⟧ paties skirtuko.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Jis bando jus ten išlaikyti. <strong>Spustelėkite Išeiti.</strong>', hints: {stay: 'Spustelėkite Išeiti.'}},
        {screen: c => scareware(os, c), question: {q: 'O jei jis visai neužsidaro?', options: [
            {t: os === 'windows' ? 'Paspausti Ctrl + Shift + Esc, kad atsidarytų Užduočių tvarkytuvė, pasirinkti naršyklę ir spustelėti Baigti užduotį' : os === 'mac' ? 'Paspausti ⟦command⟧ Cmd + Option + Esc ir priverstinai uždaryti naršyklę (Force Quit)' : 'Dešiniuoju mygtuku spustelėti naršyklę skydelyje ir pasirinkti Uždaryti arba paleisti kompiuterį iš naujo',
             ok: true, why: 'Taip. Vėl atidarę naršyklę, neleiskite jai atkurti senų puslapių. Paleidimas iš naujo taip pat padeda.'},
            {t: 'Paskambinti numeriu, kad padėtų jį uždaryti', why: 'Niekada neskambinkite. ' + (os === 'windows' ? 'Naudokite Ctrl + Shift + Esc (Užduočių tvarkytuvė) naršyklei uždaryti.' : os === 'mac' ? 'Naudokite ⟦command⟧ Cmd + Option + Esc priverstiniam uždarymui (Force Quit).' : 'Uždarykite naršyklę iš skydelio arba paleiskite iš naujo.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Šaunu!</strong> Jūsų kompiuteris niekada nebuvo užkrėstas: tai buvo tik tinklalapis. Jei vis dėlto paskambinote tokiu numeriu, susisiekite su banku ir pakeiskite slaptažodžius iš kito įrenginio.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows sauga', `<div class="aif"><h3>Apsauga nuo virusų ir grėsmių</h3><p class="mj">⟦check⟧ Dabartinių grėsmių nėra</p>
                <p class="cf">Paskutinis nuskaitymas: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Vykdomas greitasis nuskaitymas… nuskaityta 12 840 failų</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Apsauga nuo virusų</span><span>⟦check⟧ Užkarda</span><span>⟦check⟧ Programų ir naršyklės valdymas</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Užkardos konfigūravimas', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Užkarda įjungta</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows turi įtaisytą nemokamą antivirusinę programą, vadinamą <strong>Windows sauga</strong>. Patikrinkime, ar ji veikia. <strong>Spustelėkite Pradėti.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Spustelėkite Parametrai.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Kairėje spustelėkite Privatumas ir sauga.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Spustelėkite Windows sauga.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Žalios varnelės reiškia, kad esate apsaugoti. Dėl ramybės <strong>spustelėkite Greitasis nuskaitymas</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Ar reikia mokėti už dar vieną antivirusinę programą?', options: [
            {t: 'Ne. Windows sauga daugumai žmonių pakanka, o dvi gali sulėtinti kompiuterį', ok: true, why: 'Taip. Atnaujinkite Windows ir laikykite įjungtą Windows saugą. Mokamos dažnai tik prideda iššokančių langų ir prenumeratų.'},
            {t: 'Taip, kuo daugiau, tuo geriau', why: 'Dvi antivirusinės programos gali konfliktuoti ir sulėtinti darbą. Daugumai žmonių pakanka Windows saugos.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: '„Mac“ turi įtaisytą nemokamą apsaugą, kuri fone tikrina programas ir failus. Patikrinkime vieną nustatymą. <strong>Spustelėkite „Apple“ meniu</strong> (logotipą).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Spustelėkite Sistemos nustatymai…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Kairėje spustelėkite Privatumas ir sauga.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Pasirinkta „Leisti programas iš App Store ir žinomų kūrėjų“. Ar turėtumėte tai keisti?', options: [
            {t: 'Ne, palikti. Tai blokuoja programas iš nežinomų kūrėjų', ok: true, why: 'Taip. Jei svetainė liepia tai pakeisti, kad kažką įdiegtumėte, tai didelis įspėjamasis ženklas.'},
            {t: 'Taip, leisti programas iš bet kur', why: 'Palikite kaip yra. Tai neleidžia programoms iš nežinomų kūrėjų. Svetainė, liepianti tai pakeisti, yra įspėjamasis ženklas.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistemos nustatymai', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Ar reikia pirkti antivirusinę programą „Mac“?', options: [
            {t: 'Dauguma žmonių ne. Laikykite atnaujintą ir diekite programas tik iš patikimų vietų', ok: true, why: 'Taip. Darbą atlieka naujinimai ir įtaisytoji apsauga. Iššokantys langai, sakantys, kad jūsų „Mac“ užkrėstas, yra sukčiavimas.'},
            {t: 'Taip, tą, kurią siūlo iššokantis langas', why: 'Iššokantys langai, siūlantys „Mac“ antivirusinę programą, dažniausiai yra sukčiavimas. Verčiau laikykite „Mac“ atnaujintą.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: '„Linux Mint“ turi įtaisytą <strong>užkardą</strong>, blokuojančią nepageidaujamus ryšius. Ji išjungta, kol jos neįjungsite. <strong>Spustelėkite Meniu.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Spustelėkite Užkarda.</strong> <em>(Jei jos nematote, Meniu paieškoje įveskite „užkarda“.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Spustelėkite jungiklį Būsena</strong>, kad įjungtumėte užkardą.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Kas dar saugo „Linux Mint“?', options: [
            {t: 'Naujinimų diegimas, kai skydelis rodo tašką, ir programų gavimas iš Programinės įrangos tvarkyklės', ok: true, why: 'Taip. Ir įprastos taisyklės: būkite atsargūs su laiškų nuorodomis ir iššokančiais langais.'},
            {t: 'Daugiau nieko nereikia', why: 'Toliau diekite naujinimus ir gaukite programas iš Programinės įrangos tvarkyklės. Sukčiavimas el. laiškais ir svetainėmis vis tiek galioja.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Šaunu!</strong> Įtaisytoji kompiuterio apsauga įjungta. Naujinimai, atsargumas su nuorodomis ir diegimas tik iš patikimų vietų padaro likusį darbą.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Siuntinių pristatymas</strong><span>Nesutikome jūsų: suplanuokite pristatymą iš naujo šiandien</span></button>
            <div class="lx"><strong>Sarah</strong><span>Sekmadienio nuotraukos</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Šeštadienio pasivaikščiojimas</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Siuntinių pristatymas</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Šiandien bandėme pristatyti jūsų siuntinį, bet namie nieko nebuvo. Norint suplanuoti pristatymą iš naujo, reikia £1,45 mokesčio.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Suplanuoti pristatymą iš naujo</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Pranešti apie sukčiavimą</button><button type="button" data-tap="reply">Atsakyti</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Paštas', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Praneštas ir perkeltas į Šlamštą</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Štai jūsų laiškas naršyklėje. <strong>Atidarykite laišką Siuntinių pristatymas.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Kompiuteryje galite patikrinti, kur nuoroda iš tikrųjų veda, <strong>jos nespustelėję</strong>. <strong>Užveskite pelę ant „Suplanuoti pristatymą iš naujo“</strong> ir palaikykite nejudindami. <em>(Jutikliniame ekrane paspauskite ir laikykite.)</em>',
         hints: {'click-link': 'Nespauskite! Tiesiog palaikykite pelės žymeklį virš jos.'}, hint: 'Palaikykite pelės žymeklį virš mėlynos nuorodos, jos nespausdami.'},
        {screen: c => webmail(os, c), question: {q: 'Tikrasis adresas atsiranda apačioje: parcel-redelivery.example.top. Ar saugu?', options: [
            {t: 'Ne. Tai ne tikros pristatymo bendrovės svetainė, ir jie nori mokesčio', ok: true, why: 'Taip. Kurjeriai neima smulkių mokesčių el. paštu ar SMS. Tikrasis adresas ją išduoda.'},
            {t: 'Taip, jame parašyta „parcel“', why: '„Parcel“ gali įrašyti į interneto adresą bet kas. Tai ne tikras kurjeris, o mokestis yra sukčiavimas.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Spustelėkite Pranešti apie sukčiavimą.</strong> Sukčių laiškus taip pat galite persiųsti į report@phishing.gov.uk.', hints: {reply: 'Niekada neatsakykite sukčiams. Spustelėkite Pranešti apie sukčiavimą.', 'click-link': 'Nespauskite nuorodos! Verčiau pranešti apie ją.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Šaunu!</strong> Užveskite pelę prieš spustelėdami: jei adresas neatitinka bendrovės, nespauskite.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (mokomasis numeris). Tai tikrasis kodas telefono IMEI rasti.',
        '999': 'Tai mokomasis telefonas, todėl negali skambinti 999. Tikroje kritinėje situacijoje skambinkite 999 arba 112.',
        '112': 'Tai mokomasis telefonas, todėl negali skambinti 112. 112 veikia lygiai kaip 999 JK ir visoje Europoje.',
        '159': '159 saugiai sujungia su jūsų pačių banku. Naudokite, jei skambutis dėl jūsų pinigų kelia nerimą.',
        '7726': '7726 yra numeris, kuriuo persiunčiamos sukčių SMS. Senų telefonų klaviatūrose jis sudaro žodį „SPAM“!',
        '123': 'speaking-clock',
        '1471': 'Telefono numeriu 07700 900842 šiandien 11:20 skambinta. (Pratyba. 1471 pasako, kas paskutinis skambino į jūsų stacionarųjį telefoną.)',
        '01189998819991197253': 'Tai kritinės padėties numeris iš „The IT Crowd“. Ar bandėte išjungti ir vėl įjungti?',
        '101': '101 yra policijos numeris ne kritinėms situacijoms.',
        '111': '111 yra NHS pagalba, kai skubu, bet ne kritinė situacija.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Telefonas', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Įveskite numerį</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mama', '#f472b6', [['them', 'Maniau, kad LOL reiškia „lots of love“ (daug meilės). Rašau tai po visko!'], ['them', 'Todėl jūsų teta neatsakė?'], ['them', 'Išsiųsta iš mano iPad']]],
        ['Nežinomas', '#94a3b8', [['them', 'Sveikiname! Laimėjote NEMOKAMĄ telefoną. Spustelėkite čia, kad atsiimtumėte: prize-winner.example'], ['note', 'Tai sukčiavimas. Nepalieskite nuorodos: persiųskite numeriu 7726, tada ištrinkite.']]],
        ['Sarah', '#a78bfa', [['them', 'Tėtis mokosi naudoti jaustukus 😂'], ['them', 'Atsiuntė man baklažaną ir parašė „vakarienei?“ 🍆']]],
        ['Dantistas', '#38bdf8', [['them', 'Priminimas: jūsų vizitas antradienį 10:30. Atsakykite Y, kad patvirtintumėte.']]],
    ];
    const MUM_REPLIES = ['Kas čia?', 'Paskambink man, be akinių negaliu skaityti žinučių', 'Puiku! 👍', 'Ar gavai mano paskutinę žinutę? Per klaidą išsiunčiau ją katei.', 'Išsiųsta iš mano iPad', 'Gerai, mielasis xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Žinutės', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Žuvėdra vėl smogia' : 'Nuotrauka', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Pagauta nusikaltimo vietoje Bridlington pajūrio promenadoje. Bulvytės neatgautos.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Nuotraukos', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Laikrodis', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Orai', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Šalta, su sniego dribsniais' : 'Saulėta tarpais, vėjuota'}</p>
            <div class="ajf">${[['Pen.', '⟦cloud-rain⟧', '11°'], ['Šeš.', '⟦wind⟧', '10°'], ['Sek.', '⟦sun⟧', '14°'], ['Pirm.', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Žuvėdrų įspėjimas: <strong>aukštas</strong>. Saugokite bulvytes.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Per spintą, tada eikite toliau pro žibintą.', home: 'Nėra kaip namie. 🏠', 'mėnulis': '384 400 km. Eismas nedidelis.',
        chips: 'Artimiausia žuvies ir bulvyčių užkandinė: bet kur Bridlington pajūrio promenadoje. 🍟', 'north pole': 'Kalėdų Senelio dirbtuvės. Uždarytos iki gruodžio. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Graži vieta!',
        'flamborough': 'Flamborough Head: švyturys, skardžiai ir kirvasnapiai. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `„${inp.value.trim()}“: ši mokomoji žemėlapių programa žino tik kelias vietas. Išbandykite Bridlington, Flamborough ar Narniją.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Nustatymai', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Lėktuvo režimas' : 'Lėktuvo režimas', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Tamsusis režimas', st.dark)}${row('dnd', 'Netrukdyti', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Apie' : 'Apie telefoną'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Apie' : 'Apie telefoną', `<div class="aic"><div class="lq">
            <div class="ho"><span>Pavadinimas</span><b>Margaret telefonas</b></div>
            <div class="ho"><span>Modelis</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS versija' : 'Android versija'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Saugykla</span><b>Pakanka anūkų nuotraukoms</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Serijos numeris</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Klasikinis senųjų mobiliųjų telefonų žaidimas.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Yra reklamų · Pirkiniai programoje'], ['knit', '⟦scissors⟧', 'Mezgimo raštai', 'Netrukus šioje mokomojoje parduotuvėje.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play parduotuvė', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Atidaryti' : (p === 'ios' ? 'Gauti' : 'Įdiegti')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Rezultatas: <b class="ado">0</b></span><span>Geriausias: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Palieskite kryptį (arba naudokite rodyklių klavišus), kad pradėtumėte</p>
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
                f.querySelector('.vy').textContent = `Žaidimas baigtas! Rezultatas ${score}. Palieskite kryptį, kad žaistumėte vėl.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Lėktuvas', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Netrukdyti', st.dnd)}${t('torch', '⟦flashlight⟧', 'Žibintuvėlis', st.torch)}${t('dark', '⟦sun-moon⟧', 'Tamsusis režimas', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Braukite aukštyn, kad uždarytumėte' : 'Uždaryti'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Naujas ekrano fonas');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `„Po trečiojo signalo laikas bus ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} ir ${t.getSeconds()} sekundės… pyp, pyp, pyp.“ (Senasis kalbantis laikrodis!)`; return; }
                msg.textContent = egg || (n ? 'Šis mokomasis telefonas negali skambinti tikrai. Išbandykite 123, 1471 arba *#06#…' : 'Pirmiausia įveskite numerį.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Atsiųskite savo banko duomenis, kad atsiimtumėte prizą!!! (Tai sukčiavimas. Užblokuokite šį numerį.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Ačiū, jūsų vizitas patvirtintas. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Paštas', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Pradėti'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Stabdyti'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Pradėti'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Pasitepėte saulės kremu! Čia beveik Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Žibintuvėlis įjungtas. (Vietoj galinės šviesos švyti ekranas.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Lėktuvo režimas įjungtas: jokių skambučių, SMS ar mobiliųjų duomenų.' : 'Lėktuvo režimas išjungtas.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Ekrano fonas pakeistas. Eikite į pradžią, kad pamatytumėte!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Dabar esate kūrėjas! (Tikra „Android“ paslaptis: 7 kartus palieskite Versijos numerį.)' : st.build >= 3 ? `Iki kūrėjo liko ${7 - st.build} žingsniai.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Ačiū, kad praktikavotės!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Žibintuvėlio programos nereikia: jis įtaisytas telefono sparčiuosiuose nustatymuose. Nemokamos žibintuvėlio programos dažnai pilnos reklamų ar dar blogiau!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Tik pademonstravimui mokomojoje parduotuvėje.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Diegiama…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Atidaryti'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Programėlė', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Ši mokomoji programa yra savo pamokos dalis. Peržiūrėkite kursus, kad išbandytumėte ją tinkamai.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Radote paslaptį!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Skambutis baigtas' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Nežinomas' ? 'Skambintojas' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Nežinomas', number: '0161 496 0423', who: 'm', tag: 'Nėra jūsų kontaktuose',
         intro: 'Jūsų telefonas skamba. Numerio nėra jūsų kontaktuose. <strong>Atsiliepkite</strong>, kad pasipraktikuotumėte. <em>Padidinkite garsą, kad girdėtumėte skambintoją.</em>',
         lines: [
            {text: 'Laba diena, čia Mark iš jūsų banko sukčiavimo prevencijos skyriaus. Pastebėjome įtartinų mokėjimų jūsų sąskaitoje. Prieš tęsdamas, ar galite patvirtinti savo vardą ir pavardę, gimimo datą ir ilgą numerį ant banko kortelės?',
             q: 'Skambintojas sako, kad yra iš jūsų banko. Ką darote?', options: [
                {t: 'Pateikiu duomenis, juk jis iš banko', why: 'Bankas, kuris jums skambina, niekada neprašys viso kortelės numerio. Taip sukčiai išgauna jūsų duomenis.'},
                {t: 'Pasakau, kad perskambinsiu į banką numeriu ant kortelės, ir padedu ragelį', ok: true, why: 'Būtent. Skambinkite numeriu ant kortelės, jei galite, iš kito telefono, arba rinkite 159.'},
                {t: 'Paprašau jo įrodyti, kas jis', why: 'Sukčiai skamba įtikinamai ir dažnai jau žino dalį jūsų duomenų. Saugiausia padėti ragelį ir patiems paskambinti į banką.'}]},
            {text: 'Prašau nepadėkite ragelio! Nusikaltėliai dabar ima pinigus iš jūsų sąskaitos. Reikia visus pinigus perkelti į saugią sąskaitą, kurią jums sukursiu. Tai reikia padaryti per artimiausias dešimt minučių.',
             q: 'Jis sako, kad skubu ir turite perkelti pinigus. Kas toliau?', options: [
                {t: 'Greitai perkelti pinigus, kol per vėlu', why: '„Saugios sąskaitos“ nėra. Bankas niekada neprašys perkelti pinigų. Tai ir yra sukčiavimas.'},
                {t: 'Padėti ragelį. Tikras bankas niekada neprašo perkelti pinigų į „saugią sąskaitą“', ok: true, why: 'Taip. Skubėjimas ir „saugi sąskaita“ išduoda sukčius. Padėkite ragelį ir rinkite 159.'}]}],
         hang: 'Padėkite ragelį raudonu mygtuku.'},
        {letter: '?', color: '#64748b', name: 'Nežinomas', number: '020 7946 0815', who: 'robot', tag: 'Nėra jūsų kontaktuose',
         intro: 'Dar vienas skambutis. <strong>Atsiliepkite.</strong>',
         lines: [
            {text: 'Tai automatinis pranešimas iš H M R C. Dėl nesumokėtų mokesčių išduotas jūsų arešto orderis. Norėdami kalbėtis su pareigūnu, dabar paspauskite 1.',
             q: 'Įrašytas balsas sako, kad būsite areštuotas dėl mokesčių. Ką darote?', options: [
                {t: 'Paspaudžiu 1, kad sutvarkyčiau', why: 'Paspaudus 1 prisijungiama prie sukčių, kurie reikalaus apmokėjimo, dažnai dovanų kortelėmis. HMRC niekada nesigrasina areštu įrašytu pranešimu.'},
                {t: 'Padedu ragelį. HMRC neskambina su arešto grasinimais', ok: true, why: 'Teisingai. HMRC pirmiausia parašo jums ir niekada nesigrasina areštu telefonu.'}]}],
         hang: 'Padėkite ragelį.'},
        {letter: '?', color: '#64748b', name: 'Nežinomas', number: '0113 496 0332', who: 'm', tag: 'Nėra jūsų kontaktuose',
         intro: 'Vėl jūsų telefonas. <strong>Atsiliepkite.</strong>',
         lines: [
            {text: 'Laba diena, skambinu iš Windows techninio skyriaus. Jūsų kompiuteris siuntė mums klaidų pranešimus ir turi labai pavojingą virusą. Prašau įjunkite savo kompiuterį, ir aš padėsiu jį sutvarkyti.',
             q: 'Jis sako, kad jūsų kompiuteryje yra virusas. Ką darote?', options: [
                {t: 'Įjungiu kompiuterį ir darau, ką jis sako', why: 'Jis paprašytų įdiegti programą, leidžiančią jam valdyti jūsų kompiuterį, tada prašytų pinigų. Microsoft niekada taip neskambina.'},
                {t: 'Padedu ragelį. Kompiuterių bendrovės neskambina dėl virusų', ok: true, why: 'Būtent. Niekada neįleiskite skambintojo į savo kompiuterį.'},
                {t: 'Paaiškinu, kad neturiu kompiuterio', why: 'Nereikia aiškinti ar ginčytis. Tiesiog padėkite ragelį.'}]}],
         hang: 'Padėkite ragelį.'},
        {letter: '?', color: '#64748b', name: 'Nežinomas', number: '0808 157 0190', who: 'f', tag: 'Nėra jūsų kontaktuose',
         intro: 'Dar vienas skambutis. <strong>Atsiliepkite.</strong>',
         lines: [
            {text: 'Laba diena. Jūsų internetinės prekybos paskyroje pateiktas užsakymas naujam „iPhone“, kainuojančiam devyni šimtai devyniasdešimt devynis svarus. Jei šio užsakymo nepateikėte, paspauskite 1, kad jį atšauktumėte ir pakalbėtumėte su mūsų komanda.',
             q: 'Neužsakėte „iPhone“. Ką darote?', options: [
                {t: 'Paspaudžiu 1, kad atšaukčiau užsakymą', why: 'Paspaudus 1 prisijungiama prie sukčiaus, kuris „grąžins“ pinigus prašydamas banko duomenų ar jūsų kompiuterio valdymo.'},
                {t: 'Padedu ragelį, tada pats patikrinu paskyrą programoje ar svetainėje', ok: true, why: 'Taip. Jei užsakymas tikrai būtų, jį matytumėte savo paskyroje. Niekada nenaudokite skambintojo duoto numerio ar mygtuko.'}]}],
         hang: 'Padėkite ragelį.'},
        {letter: 'S', color: '#16a34a', name: 'Gydytojo kabinetas', number: '01632 960211', who: 'f', tag: 'Išsaugota jūsų kontaktuose',
         intro: 'Dar vienas skambutis: šį kartą tai gydytojo kabinetas, išsaugotas jūsų kontaktuose. <strong>Atsiliepkite.</strong>',
         lines: [
            {text: 'Laba diena, čia Sue iš gydytojo kabineto. Tik trumpas priminimas, kad jūsų skiepas nuo gripo užsakytas antradienį dešimtą valandą. Nieko daryti nereikia. Jei reikia pakeisti, paskambinkite įprastu numeriu. Viso gero!',
             q: 'Ar šis skambutis yra sukčiavimas?', options: [
                {t: 'Taip: padėti ragelį ir užblokuoti numerį', why: 'Šis tvarkoje! Ji nieko neprašė, neskubino ir pasakė naudoti įprastą numerį.'},
                {t: 'Tikriausiai tikras: ji neprašė pinigų ar duomenų ir pasakė skambinti įprastu numeriu', ok: true, why: 'Būtent. Tikri skambintojai nespaudžia. Jei abejojate, skambinkite atgal jums žinomu numeriu.'}]}],
         hang: 'Skambutis baigėsi. <strong>Palieskite raudoną mygtuką</strong>, kad padėtumėte ragelį.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Skambutis ${n + 1} iš ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'Tikrame gyvenime nežinomais numeriais neatsiliepti yra gerai! Šiai pratybai atsiliepkite paliesdami žalią mygtuką.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Kuris iš šių yra sukčių skambučio požymis?', options: [
            {t: 'Skubinimas, grasinimas ar liepimas laikyti paslaptyje', ok: true, why: 'Taip. Spaudimas yra didžiausias požymis. Tikras skambintojas mielai leidžia jums nesiskubinti ir perskambinti.'},
            {t: 'Skambintojas žino jūsų vardą', why: 'Sukčiai dažnai žino jūsų vardą ir net dalį paskyros duomenų. Vien dėl to skambutis netampa tikru.'},
            {t: 'Numeris atrodo vietinis', why: 'Sukčiai gali padaryti, kad jūsų ekrane atsirastų bet koks numeris, net vietinis ar jūsų banko. Nepasitikėkite numeriu.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Šaunu!</strong> Padėjote ragelį keturiems sukčiams ir atpažinote tikrą skambutį. Atminkite: jei abejojate, padėkite ragelį ir skambinkite atgal patikimu numeriu. Savo bankui rinkite 159.'},
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
            ios: ['iPhone', 'Sukurta „Apple“'], android: ['Android', 'Samsung, Google Pixel, Motorola ir kiti'],
            windows: ['Windows', 'Dauguma nešiojamųjų ir stacionarių kompiuterių'], mac: ['Mac', 'Sukurta „Apple“: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu ir kiti'],
        };
        const notSure = isPC
            ? 'Pažiūrėkite į ekraną. „Windows“ apačioje turi mygtuką Pradėti (keturi maži kvadratai). „Mac“ viršuje kairėje turi „Apple“ logotipą. „Linux Mint“ apačioje kairėje turi mygtuką Meniu.'
            : '„iPhone“ gale yra „Apple“ logotipas (obuolys su įkąstu kąsniu). Jei jūsiškis neturi, tai beveik tikrai „Android“ telefonas.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Kokį ${isPC ? 'kompiuterį naudojate' : 'telefoną turite'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Nesate tikri?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Parodyk, kur</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Išgirsti dar kartą</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Atgal vienu žingsniu</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Perjungti: ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">MOKOMASIS ${isPC ? 'KOMPIUTERIS' : 'TELEFONAS'}: netikras. Nieko, ką čia darote, niekur nesiunčiama.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Išjungti balsą' : 'Įjungti balsą'; };
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
            showBtn.textContent = 'Atgal į pamoką';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Parodyk, kur';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Baigta!' : `${i + 1} žingsnis iš ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Teisingai!' : 'Ne visai.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Tęsti</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Bandyti dar kartą</button>${pageNext
                ? `<button type="button" class="ap vb">Gerai padaryta! ${last ? 'Dabar užbaikite kursą' : 'Gal išbandykite kitą pamoką'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Ne visai. ' + (step.hint || 'Dar kartą peržiūrėkite instrukcijas.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Dar ne visai. Dar kartą peržiūrėkite instrukcijas.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Ne visai. ' + (step.hint || 'Dar kartą peržiūrėkite instrukcijas.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Programėlė';
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
                else hint.textContent = 'Spustelėkite jį dešiniuoju pelės mygtuku. „Mac“ jutikliniame kilimėlyje spustelėkite dviem pirštais. Jutikliniame ekrane paspauskite ir laikykite.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Laikykite pirštą (ar pelės mygtuką) nuspaudę, kol kas nors įvyks.';
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
                showBtn.textContent = 'Parodyk, kur';
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
