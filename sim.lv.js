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
            ? [['phone', 'Tālrunis', '#22c55e', ICON.phone], ['messages', 'Ziņas', '#22c55e', ICON.bubble], ['camera', 'Kamera', '#6b7280', ICON.camera],
               ['photos', 'Fotoattēli', '#e5e7eb', ICON.photos], ['mail', 'Pasts', '#3b82f6', ICON.mail], ['clock', 'Pulkstenis', '#111827', ICON.clock],
               ['weather', 'Laikapstākļi', '#38bdf8', ICON.weather], ['maps', 'Kartes', '#22c55e', ICON.map], ['settings', 'Iestatījumi', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Tālrunis', '#2563eb', ICON.phone], ['messages', 'Ziņas', '#3b82f6', ICON.bubble], ['camera', 'Kamera', '#6b7280', ICON.camera],
               ['photos', 'Fotoattēli', '#e5e7eb', ICON.photos], ['clock', 'Pulkstenis', '#111827', ICON.clock], ['maps', 'Kartes', '#16a34a', ICON.map],
               ['settings', 'Iestatījumi', '#475569', ICON.settings], ['weather', 'Laikapstākļi', '#38bdf8', ICON.weather], ['mail', 'E-pasts', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Velciet uz leju no augšējā labā stūra ⟦chevron-down⟧' : 'Velciet uz leju no augšas ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Šodien</div>
                <div class="hp"><span>IZCELTS</span><strong>Lietotnes, kas mums patīk šonedēļ</strong></div>
                <div class="hp alt"><span>SĀCIET</span><strong>Idejas jūsu jaunajam iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Šodien</button><button type="button" data-tap="games">Spēles</button>
                    <button type="button" data-tap="apps">Lietotnes</button><button type="button" data-tap="search-tab">${ICON.search}Meklēt</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Meklēt lietotnes un spēles</span></button>
            <div class="tg"><span class="on">Jums</span><span>Populārākās</span><span>Bērniem</span></div>
            <div class="hp"><span>JUMS IETEIKTS</span><strong>Lietotnes, ar ko sākt</strong></div>
            <div class="hp alt"><span>POPULĀRAS</span><strong>Paliec saziņā</strong></div>
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
        const btnLabel = p === 'ios' ? 'Iegūt' : 'Instalēt';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 mljrd.+ lejupielāžu' : 'Sociālie tīkli'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Bezmaksas</span></div></div>
                <p class="agm">Īstā iPhone tālrunī jums var nākties divreiz nospiest sānu pogu, paskatīties ekrānā, lai darbotos Face ID, vai šeit ierakstīt savu Apple Account paroli.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Instalēt</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Atcelt</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Laipni lūdzam WhatsApp</h3>
            <p>Izlasiet mūsu <u>Privātuma politiku</u>. Pieskarieties “Piekrist un turpināt”, lai piekristu <u>Pakalpojumu sniegšanas noteikumiem</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Piekrist un turpināt</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Ievadiet savu tālruņa numuru</h3>
            <p>WhatsApp ir jāpārbauda jūsu tālruņa numurs. Var tikt piemērota operatora maksa.</p>
            <div class="abt">Apvienotā Karaliste <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Tālāk</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Vai šis numurs ir pareizs?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Rediģēt</button><button type="button" data-tap="yes">${ios ? 'Jā' : 'Labi'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>ZIŅAS · tikko</strong><span>Jūsu WhatsApp kods: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Nedodiet šo kodu citiem.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Numura verifikācija</h3>
            <p>Gaida, lai automātiski noteiktu 6 ciparu kodu, kas nosūtīts ar SMS uz <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Nesaņēmāt kodu?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['“WhatsApp” vēlas piekļūt jūsu kontaktiem', 'Lai redzētu, kuri jūsu draugi lieto WhatsApp.', 'Atļaut WhatsApp piekļūt jūsu kontaktiem?']
            : ['“WhatsApp” vēlas jums sūtīt paziņojumus', 'Lai zinātu, kad ienāk jauna ziņa.', 'Atļaut WhatsApp sūtīt jums paziņojumus?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Profila informācija</h3>
            <p>Lūdzu, ierakstiet savu vārdu un, ja vēlaties, pievienojiet profila fotoattēlu.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Jūsu vārds</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Tālāk</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Tērzēšanas' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Viss gatavs${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Jūsu tērzēšanas parādīsies šeit. Pieskarieties jaunās tērzēšanas pogai, lai uzrakstītu kādam no saviem kontaktiem.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Šis ir jūsu tālruņa sākuma ekrāns. Lietotnes tiek lejupielādētas no <strong>${store}</strong>. Tas ir bez maksas, un tā ir droša vieta, kur iegūt lietotnes. <strong>Pieskarieties ${store}.</strong>`,
                 hint: `Meklējiet ikonu ${store}. ${p === 'ios' ? "Tā ir zila ar baltu burtu A." : "Tas ir krāsains trīsstūris."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Tagad jāatrod WhatsApp. <strong>Pieskarieties Meklēt</strong> apakšā labajā pusē.' : 'Tagad jāatrod WhatsApp. <strong>Pieskarieties meklēšanas joslai</strong> augšā.',
                 hint: p === 'ios' ? 'Meklēšana ir palielināmais stikls apakšā labajā pusē.' : 'Meklēšanas joslā ir rakstīts “Meklēt lietotnes un spēles”.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Mēs jūsu vietā ierakstījām <em>whatsapp</em>. Parādās ieteikumu saraksts. <strong>Pieskarieties “whatsapp messenger”.</strong>",
                 hint: 'Pieskarieties ieteikumam, kurā rakstīts “whatsapp messenger”.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Uzmanieties: dažas lietotnes uzdodas par WhatsApp. Īstā saucas <strong>WhatsApp Messenger</strong>, to izveidojis <strong>WhatsApp Inc.</strong>, un tā ir bez maksas. <strong>Pieskarieties ${p === 'ios' ? 'Iegūt' : 'Instalēt'} blakus īstajai.</strong>`,
                 hints: {'fake1-get': 'Tā ir “WhatsUp Chat Free” no Fun Apps Ltd. Tas ir viltojums, un atzīme “Ad” nozīmē, ka tā ir reklāma. Pārbaudiet nosaukumu un to, kas to izveidojis.',
                         'fake2-get': 'Tā ir “WA Messenger for Chat Pro” no LuckyDev Studio, kopija. Īsto ir izveidojis WhatsApp Inc.'},
                 hint: 'Atrodiet “WhatsApp Messenger”, ko izveidojis “WhatsApp Inc.”'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Pirms instalēšanas iPhone pārbauda, vai tas patiešām esat jūs. Īstā iPhone tālrunī varat izmantot <strong>Face ID</strong>, savu <strong>pirkstu nospiedumu</strong> (Touch ID) vai savu <strong>Apple Account paroli</strong>. Šeit vienkārši <strong>pieskarieties Instalēt.</strong>',
                    hints: {'sheet-cancel': 'Atcelšana apturētu lejupielādi. Pieskarieties Instalēt.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Notiek lejupielāde. Kad tā pabeigta, poga mainās uz <strong>Atvērt</strong>. <strong>Pieskarieties Atvērt.</strong>`,
                 hint: 'Pagaidiet, līdz pogā būs rakstīts Atvērt, tad pieskarieties tai.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp tiek atvērts pirmo reizi. Tas lūdz piekrist tā noteikumiem. <strong>Pieskarieties “Piekrist un turpināt”.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp izmanto jūsu mobilā tālruņa numuru, lai draugi jūs varētu atrast. <strong>Pieskarieties tālruņa numura lodziņam,</strong> un mēs ievadīsim vingrināšanās numuru.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Īstā tālrunī ierakstītu savu mobilā tālruņa numuru. Šeit esam izmantojuši izdomātu: <strong>07700 900123</strong>. <strong>Pieskarieties Tālāk.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp pārbauda, vai numuru ierakstījāt pareizi. Šis ir pareizs, tāpēc <strong>pieskarieties ${p === 'ios' ? 'Jā' : 'Labi'}.</strong>`,
                 hints: {edit: `Ja būtu kļūda, jāpieskaras Rediģēt. Šis numurs ir pareizs, tāpēc pieskarieties ${p === 'ios' ? 'Jā' : 'Labi'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp atsūta īsziņu ar 6 ciparu kodu, lai pārbaudītu, ka numurs ir jūsu. iPhone piedāvā to ievadīt jūsu vietā. <strong>Pieskarieties kodam virs tastatūras.</strong>'
                    : 'WhatsApp atsūta īsziņu ar 6 ciparu kodu, lai pārbaudītu, ka numurs ir jūsu. Daudzi Android tālruņi to ievada paši. Ja jūsējais to nedara, <strong>pieskarieties ziņai</strong> augšā.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Kamēr iestatāt, draugs jums raksta: <em>“Sveiki! Es kļūdas pēc nosūtīju tev 6 ciparu kodu, vai vari to man atsūtīt atpakaļ?”</em> Ko jūs darāt?',
                    options: [
                        {t: 'Nosūtu, viņš ir draugs', why: 'Tā ir izplatīta krāpšana. Kāds ir pārņēmis jūsu drauga kontu, un šis kods atdotu viņam arī jūsējo.'},
                        {t: 'Nesūtu. Neviens nedrīkst to prasīt', ok: true, why: 'Tieši tā. Šis kods ir jūsu WhatsApp atslēga. Nekad nedodiet to nevienam, pat draugam vai cilvēkam, kurš saka, ka ir no WhatsApp.'},
                        {t: 'Nosūtu tikai pirmos 3 ciparus', why: 'Pat daļa koda krāpniekam palīdz. Nekad nedodiet nevienu tā daļu.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp lūdz piekļuvi jūsu kontaktiem, lai varētu parādīt, kuri draugi lieto WhatsApp. <strong>Pieskarieties Atļaut.</strong>',
                 hints: {deny: 'Varat izvēlēties neatļaut, bet tad WhatsApp nevar parādīt jūsu draugu vārdus. Šim vingrinājumam pieskarieties Atļaut.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Paziņojumi ļauj uzzināt, kad ienāk ziņa, pat ja WhatsApp ir aizvērts. <strong>Pieskarieties Atļaut.</strong>',
                 hints: {deny: 'Bez paziņojumiem jūs nezināsiet, kad kāds jums raksta. Šim vingrinājumam pieskarieties Atļaut.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Pēdējais solis: jūsu vārdu redz draugi. <strong>Lodziņā ierakstiet savu vārdu</strong>, tad <strong>pieskarieties Tālāk</strong>. (Tas paliek šajā lapā un netiek nekur sūtīts.)',
                 hints: {photo: 'Īstajā lietotnē fotoattēlu varat izvēlēties tagad vai pievienot vēlāk iestatījumos. Šoreiz to izlaidīsim: ierakstiet savu vārdu un pieskarieties Tālāk.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Lieliski, jūs esat iestatījuši WhatsApp!</strong> Jūsu tērzēšanas parādīsies šeit. Nākamajās nodarbībās nosūtīsiet savu pirmo ziņu.'},
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
            const lockName = ctx.touch ? 'Touch ID un piekļuves kods' : 'Face ID un piekļuves kods';
            const groups = [
                [['airplane', 'Lidmašīnas režīms', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Mobilais pakalpojums', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Paziņojumi', '#ef4444', '⟦bell⟧'], ['sounds', 'Skaņas un haptika', '#ec4899', '⟦volume-2⟧'], ['focus', 'Fokuss', '#6366f1', '⟦moon⟧']],
                [['general', 'Vispārīgi', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Pieejamība', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence un Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Displejs un spilgtums', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Ārkārtas SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Privātums un drošība', '#3b82f6', '⟦hand⟧'], ['battery', 'Akumulators', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Lietotnes', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple Account, iCloud un citi</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Tīkls un internets', 'Mobilie dati, Wi-Fi, tīklājs'], ['devices', 'Savienotās ierīces', 'Bluetooth, savienošana pārī'],
            ['apps', 'Lietotnes', 'Nesen lietotās lietotnes, noklusējuma lietotnes'], ['notifications', 'Paziņojumi', 'Paziņojumu vēsture'], ['battery', 'Akumulators', '85%'], ['storage', 'Krātuve', '91% used'],
            ['sound', 'Skaņa un vibrācija', 'Skaļums, haptika'], ['display', 'Displejs un pieskāriens', 'Tumšais motīvs, fonta lielums'],
            ['accessibility', 'Pieejamība', 'Displejs, mijiedarbība, audio'], ['security', 'Drošība un konfidencialitāte', 'Lietotņu drošība, ierīces bloķēšana, atļaujas'],
            ['location', 'Atrašanās vieta', 'Ieslēgta'], ['safety', 'Drošība un ārkārtas situācijas', 'Ārkārtas SOS, medicīniskā informācija, brīdinājumi'],
            ['google', 'Google', 'Pakalpojumi un preferences'], ['system', 'Sistēma', 'Valodas, laiks, programmatūras atjauninājumi']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID un piekļuves kods' : 'Face ID un piekļuves kods';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>1. pirksts</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Atiestatīt Face ID</span></div><div class="cj ex"><span>Iestatīt alternatīvu izskatu</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Izslēgt piekļuves kodu</span></div><div class="cj ex"><span>Mainīt piekļuves kodu</span></div>'
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

    const androidSecurity = () => androidList('Drošība un konfidencialitāte', [
        ['device-unlock', 'Ierīces atbloķēšana', 'Ekrāna bloķēšana, sejas un pirkstu nospiedumu atbloķēšana'], ['app-security', 'Lietotņu drošība', 'Skenēt lietotnes, vai tās nav kaitīgas'],
        ['theft', 'Aizsardzība pret zādzību', 'Bloķējiet tālruni, ja tas tiek nozagts'], ['privacy', 'Privātums', 'Atļaujas, konta darbības']]);
    const androidDeviceUnlock = ctx => androidList('Ierīces atbloķēšana', [
        ['screen-lock', 'Ekrāna bloķēšana', ctx.passcodeSet ? 'PIN' : 'Nav'], ['face-finger', 'Sejas un pirkstu nospiedumu atbloķēšana', ctx.faceDone || ctx.fingerDone ? 'Iestatīt' : 'Iestatiet, lai atbloķētu ātrāk']]);
    const androidFaceFinger = ctx => androidList('Sejas un pirkstu nospiedumu atbloķēšana', [
        ['face-unlock', 'Sejas atbloķēšana', ctx.faceDone ? 'Seja pievienota' : 'Iestatīt'], ['fingerprint-unlock', 'Pirkstu nospiedumu atbloķēšana', ctx.fingerDone ? '1 fingerprint' : 'Iestatīt']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Pirmā Face ID skenēšana pabeigta.' : 'Face ID tagad ir iestatīts.') : 'Seja pievienota';
        const btn = p === 'ios' ? (first ? 'Turpināt' : 'Gatavs') : 'Gatavs';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Lēnām kustiniet galvu, lai pabeigtu apli.' : 'Turiet seju aplī un lēnām kustiniet galvu.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Pabeigts' : 'Pielāgojiet satvērienu') : (stage === 'grip' ? 'Pielāgojiet satvērienu' : 'Uzlieciet pirkstu'))
            : (ready ? 'Pirkstu nospiedums pievienots' : 'Pieskarieties sensoram');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Tagad savu pirkstu nospiedumu varat izmantot, lai atbloķētu iPhone.' : 'Tagad uzlieciet pirksta malas uz sākuma pogas.')
                     : (stage === 'grip' ? 'Atlieciet pirksta malas uz sākuma pogas.' : 'Vairākkārt paceliet un atkal uzlieciet pirkstu uz sākuma pogas.'))
            : (ready ? 'Tagad varat izmantot pirkstu nospiedumu, lai atbloķētu tālruni.' : 'Pieskarieties sensoram, paceliet un pieskarieties vēlreiz, līdz pirkstu nospiedums ir pilns.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Turpināt' : 'Gatavs'}</button>` : sensor}
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
                 say: 'Piekļuves kods, Face ID un Touch ID atrodas lietotnē <strong>Iestatījumi</strong>. <strong>Pieskarieties Iestatījumi</strong> (pelēkais zobrats).',
                 hint: 'Iestatījumi ir pelēka ikona ar zobratu.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Ja vajag, ritiniet sarakstu uz leju un <strong>pieskarieties ${ctx.touch ? 'Touch ID un piekļuves kods' : 'Face ID un piekļuves kods'}</strong>.`,
                 hint: `Meklējiet “${ctx.touch ? 'Touch ID un piekļuves kods' : 'Face ID un piekļuves kods'}” zem Displejs un spilgtums.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Ekrāna bloķēšana, sejas atbloķēšana un pirkstu nospiedumi atrodas lietotnē <strong>Iestatījumi</strong>. <strong>Pieskarieties Iestatījumi</strong> (zobrats).',
             hint: 'Iestatījumi ir ikona ar zobratu.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Ja vajag, ritiniet uz leju un <strong>pieskarieties Drošība un konfidencialitāte</strong>. <em>Samsung tālrunī tā saucas Drošība un konfidencialitāte, tad Biometrija vai Bloķēšanas ekrāns.</em>',
             hint: 'Meklējiet “Drošība un konfidencialitāte” saraksta apakšā.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Pieskarieties Ierīces atbloķēšana.</strong>',
             hint: 'Tā ir pirmā iespēja, “Ierīces atbloķēšana”.'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Ievadiet piekļuves kodu' : 'Ievadiet savu PIN', p === 'ios' ? '' : 'Lai turpinātu, ievadiet savu PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}Tālrunis vispirms pārbauda, vai tas esat jūs. <strong>Ievadiet vingrināšanās kodu: ${codeText}</strong>. <em>Nekad nerakstiet savu īsto piekļuves kodu vietnē.</em>`,
        hint: `Ievadiet vingrināšanās kodu ${codeText}, vienu ciparu pēc otra.`,
    });

    const safestQuestion = {
        q: 'Kurš no šiem būtu <strong>drošākais</strong> piekļuves kods?',
        options: [
            {t: '123456', why: '123456 ir visbiežāk lietotais piekļuves kods, tāpēc tas ir viens no pirmajiem, ko zaglis izmēģinātu.'},
            {t: 'Jūsu dzimšanas diena, piemēram, 140352', why: 'Dzimšanas dienas ir viegli uzzināt no sociālajiem medijiem, kartītēm vai pasta. Izvairieties no datumiem, kam ir nozīme.'},
            {t: 'Seši cipari, kam nav nozīmes nevienam citam', ok: true, why: 'Tieši tā. Nejauši cipari, kas nav datums, raksts vai atkārtojums, ir vissmagāk uzminami.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Šim tālrunim vēl nav piekļuves koda, tāpēc to varētu atvērt ikviens. <strong>Pieskarieties Ieslēgt piekļuves kodu.</strong>',
                 hints: {stolen: 'Aizsardzība pret nozagtu ierīci ir aprakstīta 4. nodarbībā. Vispirms ieslēdziet piekļuves kodu.'}},
                {screen: c => codeScreen(p, c, 'Iestatīt piekļuves kodu', 'Ievadiet piekļuves kodu', '<p class="aeh">Piekļuves koda opcijas</p>'), sequence: CODE_KEYS,
                 say: `Izvēlieties 6 ciparus, ko atcerēsieties. Šim vingrinājumam <strong>ievadiet ${codeText}</strong>. <em>Lūdzu, nerakstiet šeit savu īsto piekļuves kodu.</em>`,
                 hint: `Ievadiet ${codeText}, vienu ciparu pēc otra.`},
                {screen: c => codeScreen(p, c, 'Iestatīt piekļuves kodu', 'Ievadiet jauno piekļuves kodu vēlreiz'), sequence: CODE_KEYS,
                 say: `iPhone jautā vēlreiz, lai pārliecinātos, ka nekļūdījāties. <strong>Ievadiet ${codeText} vēlreiz.</strong>`,
                 hint: `Ievadiet ${codeText} vēlreiz.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Lieliski, jūsu vingrināšanās tālrunim tagad ir piekļuves kods!</strong> Īstā iPhone tālrunī šajā brīdī var tikt prasīta arī jūsu Apple Account parole.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Ekrāna bloķēšanas vērtība ir <strong>Nav</strong>, tāpēc šo tālruni varētu atvērt ikviens. <strong>Pieskarieties Ekrāna bloķēšana.</strong>'},
            {screen: () => androidList('Izvēlieties ekrāna bloķēšanu', [['none', 'Nav'], ['swipe', 'Pavilkšana'], ['pattern', 'Raksts'], ['pin', 'PIN'], ['password', 'Parole']]),
             target: 'pin', say: 'Ir dažas iespējas. <strong>PIN</strong> (cipari) ir viegls un drošs. <strong>Pieskarieties PIN.</strong>',
             hints: {none: 'Nav nozīmē, ka tālruni var atvērt ikviens.', swipe: 'Pavilkšana tikai atver tālruni ar vilkšanu, tāpēc tā neko neaizsargā.',
                     pattern: 'Rakstus var uzminēt pēc traipiem, ko pirksts atstāj uz ekrāna. PIN ir drošāks.',
                     password: 'Parole der arī, taču PIN katru dienu ir ātrāk ievadīt. Šim vingrinājumam pieskarieties PIN.'}},
            {screen: c => codeScreen(p, c, 'Izvēlieties PIN', 'PIN jābūt vismaz 4 cipariem'), sequence: CODE_KEYS,
             say: `6 cipari ir drošāki par 4. Šim vingrinājumam <strong>ievadiet ${codeText}</strong>. <em>Lūdzu, nerakstiet šeit savu īsto PIN.</em>`,
             hint: `Ievadiet ${codeText}, vienu ciparu pēc otra.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Izvēlieties PIN', 'PIN jābūt vismaz 4 cipariem', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Pieskarieties Tālāk.</strong>'},
            {screen: c => codeScreen(p, c, 'Ievadiet PIN vēlreiz', ''), sequence: CODE_KEYS,
             say: `Tālrunis jautā vēlreiz, lai pārliecinātos, ka nekļūdījāties. <strong>Ievadiet ${codeText} vēlreiz.</strong>`, hint: `Ievadiet ${codeText} vēlreiz.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Ievadiet PIN vēlreiz', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Pieskarieties Apstiprināt.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Paziņojumi bloķēšanas ekrānā', [['show-all', 'Rādīt visu paziņojumu saturu'], ['hide-sensitive', 'Paslēpt sensitīvo saturu'], ['dont-show', 'Nerādīt paziņojumus vispār']], false),
             target: 'hide-sensitive',
             say: 'Tālrunis jautā, kādas ziņas rādīt bloķētajā ekrānā. <strong>Paslēpt sensitīvo saturu</strong> ir laba izvēle: redzēsiet, ka ziņa ir ienākusi, bet ne to, kas tajā rakstīts. <strong>Pieskarieties tam.</strong>',
             hints: {'show-all': 'Tas parāda visu, arī kodus no jūsu bankas, ikvienam, kas paņem jūsu tālruni. Pieskarieties “Paslēpt sensitīvo saturu”.',
                     'dont-show': 'Tas der, bet jūs neredzēsiet, kad ienāk ziņas. Šim vingrinājumam pieskarieties “Paslēpt sensitīvo saturu”.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Lieliski, jūsu vingrināšanās tālrunim tagad ir PIN!</strong> Ekrāna bloķēšanai tagad ir norādīts PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Pieskarieties Iestatīt Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Kā iestatīt Face ID</strong>
                    <p>Vispirms novietojiet seju kameras kadrā. Pēc tam kustiniet galvu aplī, lai parādītu visus savas sejas leņķus.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Sākt</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Turiet tālruni sejas priekšā apmēram rokas stieples attālumā, it kā uzņemtu pašportretu. <strong>Pieskarieties Sākt.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Īstā iPhone tālrunī tagad <strong>lēnām kustiniet galvu aplī</strong>, it kā zīmētu apli ar degunu. Gredzens aizpildās skenēšanas laikā. Kad tas pabeigts, <strong>pieskarieties Turpināt</strong>.',
                 hint: 'Pagaidiet, līdz aplis aizpildās, tad pieskarieties Turpināt.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Tas skenē otru reizi, lai pārliecinātos. Vēlreiz kustiniet galvu aplī. Kad tas pabeigts, <strong>pieskarieties Gatavs</strong>.',
                 hint: 'Pagaidiet, līdz aplis aizpildās, tad pieskarieties Gatavs.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Draugs lūdz pievienot <em>savu</em> seju jūsu tālrunim “tikai tā, katram gadījumam”. Ko jūs darāt?',
                    options: [
                        {t: 'Ļauju, tas ir ērti', why: 'Ikviens, kura seja ir iestatīta, var atvērt jūsu tālruni un apstiprināt maksājumus jūsu lietotnēs. Iestatiet tikai savu seju.'},
                        {t: 'Atsaku. Tālruni drīkst atbloķēt tikai mana seja', ok: true, why: 'Tieši tā. Ja kādam, kam uzticaties, vajag piekļuvi, dodiet viņam savu piekļuves kodu un vajadzības gadījumā vēlāk to nomainiet.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Lieliski, Face ID ir iestatīts!</strong> Tagad varat atbloķēt tālruni, vienkārši paskatoties uz to, un pēc tam pavilkt uz augšu.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Pieskarieties Sejas un pirkstu nospiedumu atbloķēšana.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Pieskarieties Sejas atbloķēšana.</strong>',
             hints: {'fingerprint-unlock': 'Tie ir pirkstu nospiedumi, kas ir 3. nodarbībā. Šobrīd pieskarieties Sejas atbloķēšana.'}},
            {screen: () => consent(p, 'Atbloķēšana ar seju', 'Izmantojiet seju, lai atbloķētu tālruni un lietotnēs apstiprinātu, ka tas esat jūs. Jūsu seja tiek glabāta tikai šajā tālrunī.', 'Piekrītu'),
             target: 'agree', say: 'Tālrunis paskaidro, kā tas izmanto jūsu seju. <strong>Pieskarieties Piekrītu.</strong>',
             hints: {cancel: 'Atcelšana apturētu iestatīšanu. Pieskarieties Piekrītu, lai turpinātu.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Turiet tālruni acu augstumā apmēram rokas stieples attālumā. Īstā tālrunī jūs <strong>turat seju aplī un lēnām kustināt galvu</strong>. Kad tas pabeigts, <strong>pieskarieties Gatavs</strong>.',
             hint: 'Pagaidiet, līdz aplis aizpildās, tad pieskarieties Gatavs.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Daudzos Android tālruņos sejas atbloķēšana ir mazāk droša nekā pirkstu nospiedums. Ko tas nozīmē jums?',
                options: [
                    {t: 'Tas der visam', why: 'Daudzos tālruņos sejas atbloķēšana izmanto parastu kameru, ko var vieglāk apmānīt. Dažas bankas lietotnes šā iemesla dēļ to nepieņem.'},
                    {t: 'Izmantot to atbloķēšanai, bet bankas darījumiem izmantot pirkstu nospiedumu vai PIN, ja banka to prasa', ok: true, why: 'Pareizi. Tālrunis pateiks, vai sejas atbloķēšanu var izmantot maksājumiem un bankas darījumiem. Ja nevar, izmantojiet pirkstu nospiedumu vai PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Lieliski, sejas atbloķēšana ir iestatīta!</strong> Tagad varat atbloķēt tālruni, paskatoties uz to.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Pieskarieties Pievienot pirkstu nospiedumu…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID izmanto <strong>sākuma pogu</strong> vecāku iPhone, piemēram, iPhone SE, priekšpusē. <strong>Pieskarieties tālruņa apakšā esošajai sākuma pogai 6 reizes</strong>, it kā paceltu un atkal uzliktu pirkstu.',
                 hint: 'Pieskarieties apaļajai sākuma pogai vingrināšanās tālruņa apakšā.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Tagad vajag pirksta galiņa malas. <strong>Pieskarieties Turpināt.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Īstā iPhone tālrunī uz pogas uzliekat pirksta <strong>sānus un galiņu</strong>. <strong>Pieskarieties sākuma pogai vēl 4 reizes.</strong>',
                 hint: 'Pieskarieties apaļajai sākuma pogai apakšā.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Viss gatavs. <strong>Pieskarieties Turpināt.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Kuru pirkstu vislabāk pievienot pirmo?',
                    options: [
                        {t: 'Īkšķi vai pirkstu, ar kuru visbiežāk turat tālruni', ok: true, why: 'Jā. Sākuma pogai tas parasti ir īkšķis. Varat pievienot līdz 5 pirkstiem, tāpēc ir vērts pievienot abus īkšķus.'},
                        {t: 'Jebkuru pirkstu, tam nav nozīmes', why: 'Tas darbojas ar jebkuru pirkstu, bet izvēlieties to, kas dabiski nonāk uz pogas, kad paņemat tālruni, parasti īkšķi.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Lieliski, jūsu pirkstu nospiedums ir iestatīts!</strong> Lai atbloķētu, uzlieciet pirkstu uz sākuma pogas. Citus pirkstus varat pievienot tāpat.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Pieskarieties Sejas un pirkstu nospiedumu atbloķēšana.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Pieskarieties Pirkstu nospiedumu atbloķēšana.</strong>',
             hints: {'face-unlock': 'Tā ir atbloķēšana ar seju, kas ir 2. nodarbībā. Šobrīd pieskarieties Pirkstu nospiedumu atbloķēšana.'}},
            {screen: () => consent(p, 'Atbloķēšana ar pirkstu nospiedumu', 'Izmantojiet pirkstu nospiedumu, lai atbloķētu tālruni vai apstiprinātu, ka tas esat jūs, piemēram, pierakstoties lietotnēs. Jūsu pirkstu nospiedums tiek glabāts tikai šajā tālrunī.', 'Piekrītu'),
             target: 'agree', say: '<strong>Pieskarieties Piekrītu.</strong>', hints: {cancel: 'Atcelšana apturētu iestatīšanu. Pieskarieties Piekrītu, lai turpinātu.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Sensors var būt uz ekrāna, tālruņa aizmugurē vai ieslēgšanas pogā, un tālrunis parāda, kur tieši. Šeit tas ir uz ekrāna. <strong>Pieskarieties sensoram 6 reizes</strong>, it kā paceltu un atkal uzliktu pirkstu.',
             hint: 'Pieskarieties apaļajam sensoram ekrāna apakšā.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Jūsu pirkstu nospiedums ir ierakstīts. <strong>Pieskarieties Gatavs.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Kuru pirkstu vislabāk pievienot pirmo?',
                options: [
                    {t: 'Pirkstu, kas dabiski pieskaras sensoram, kad paņemat tālruni', ok: true, why: 'Jā. Sensoram aizmugurē tas parasti ir rādītājpirksts, bet sensoram uz ekrāna vai sānos īkšķis. Varat pievienot vairākus.'},
                    {t: 'Jebkuru pirkstu, tam nav nozīmes', why: 'Der jebkurš pirksts, bet izvēlieties to, kas dabiski nonāk uz sensora. Tā atbloķēšana ir ātra un vienkārša.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Lieliski, jūsu pirkstu nospiedums ir iestatīts!</strong> Pieskarieties sensoram, lai atbloķētu. Citus pirkstus varat pievienot tāpat.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Saulespuķes dārzā', '#fde68a'], ['🐶', 'Suns uz dīvāna', '#fecaca'], ['🏖️', 'Diena pludmalē', '#bae6fd'],
                    ['🎂', 'Dzimšanas dienas torte', '#fbcfe8'], ['🌅', 'Saulriets virs jūras', '#fed7aa'], ['🐈', 'Kaķis aizmidzis', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Izlasīts' : state === 'sent' ? 'Nosūtīts' : 'Piegādāts'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Sveika, mamm, tas esmu es! Jauns numurs, vecais tālrunis salūza…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Ģimene', last: 'Dave: Kas atnesīs torti? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Tiekamies ceturtdien!', time: 'Vakar', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Sveika, mamm! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Jauna tērzēšana' : 'Izvēlieties kontaktpersonu'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Ģimene', '#f59e0b', 'Dave, Jean, Sarah, jūs'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Pievienot (plus)' : 'Pievienot failu (saspraude)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Šis numurs nav jūsu kontaktos.</p><div><button type="button" data-tap="block">Bloķēt</button><button type="button" data-tap="add-contact">Pievienot</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Fotoattēli' : 'Galerija'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Bloķēt +44 7700 900842?</strong></p><p class="fd">Bloķētie kontakti nevar jums zvanīt vai sūtīt ziņas.</p>
                <p class="fd">⟦square-check⟧ Ziņot WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Atcelt</button><button type="button" data-tap="confirm-block">Bloķēt</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Nesenie' : 'Galerija'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Zvana…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Ieslēgt skaņu' : 'Izslēgt skaņu'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Skaņa izslēgta uz 1 nedēļu' : 'Izslēgts'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Izslēgt paziņojumu skaņu uz…</strong></p>
                <button type="button" data-tap="mute-8h">8 stundām</button><button type="button" data-tap="mute-week">1 nedēļu</button><button type="button" data-tap="mute-always">Vienmēr</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Iestatījumi', [['account', 'Konts', 'Drošības paziņojumi, numura maiņa'], ['privacy', 'Privātums', 'Bloķēt kontaktus, ziņas, kas izzūd'],
                ['chats', 'Tērzēšanas', 'Motīvs, fona attēli'], ['notifications', 'Paziņojumi', 'Ziņu, grupu un zvanu signāli']]],
            account: ['Konts', [['twostep', 'Divpakāpju verifikācija', ctx.twoStep ? 'Ieslēgta' : 'Izslēgts'], ['change-number', 'Mainīt numuru', ''], ['delete-account', 'Dzēst kontu', '']]],
            privacy: ['Privātums', [['last-seen', 'Pēdējoreiz redzēts un tiešsaistē', 'Visi'], ['profile-photo', 'Profila attēls', 'Visi'],
                ['groups', 'Grupas', ctx.groupsSetting || 'Visi'], ['blocked', 'Bloķētie kontakti', ctx.blocked ? '1' : 'Nav']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Kas var mani pievienot grupām</strong></p>
                <button type="button" data-tap="groups-everyone">Visi</button><button type="button" data-tap="groups-contacts">Mani kontakti</button>
                <button type="button" data-tap="groups-except">Mani kontakti, izņemot…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Divpakāpju verifikācija</h3><p>Lai nodrošinātu papildu drošību, ieslēdziet divpakāpju verifikāciju, kas prasīs PIN, kad atkal reģistrēsiet savu tālruņa numuru WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Ieslēgt</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Pievienot e-pasta adresi</h3>
                <p>Pievienojiet e-pasta adresi, lai varētu atiestatīt PIN, ja to aizmirstat.</p>
                <div class="tk ex">jūsu e-pasta adrese</div>
                <button type="button" class="ce ox" data-tap="email-next">Tālāk</button>
                <button type="button" class="cp wd" data-tap="skip">Izlaist</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Divpakāpju verifikācija ir ieslēgta</h3><p>Jums prasīs PIN, ja iestatīsiet WhatsApp jaunā tālrunī.</p>
                <button type="button" class="ce ox" data-tap="done">Gatavs</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Izveidojiet 6 ciparu PIN' : 'Apstipriniet savu PIN'}</strong>
            <p>${stage === 'pin' ? 'Tas būs vajadzīgs, lai iestatītu WhatsApp jaunā tālrunī.' : 'Ierakstiet to pašu PIN vēlreiz.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Šis ir jūsu tērzēšanu saraksts. Lai sāktu jaunu, <strong>pieskarieties jaunās tērzēšanas pogai</strong> (zīmulis augšā labajā pusē).'
                          : 'Šis ir jūsu tērzēšanu saraksts. Lai sāktu jaunu, <strong>pieskarieties zaļajai + pogai</strong> apakšā labajā pusē.',
         hints: {'chat-family': 'Tas atver esošu tērzēšanu. Tā vietā sāciet jaunu.', 'chat-jean': 'Tas atver esošu tērzēšanu. Tā vietā sāciet jaunu.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp rāda jūsu kontaktus, kuri to lieto. <strong>Pieskarieties Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Vispirms lodziņā uzrakstiet ziņu, tad pieskarieties sūtīšanas bultiņai.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Sveika, mamm! 😊 Tik jauki tevi dzirdēt!', n: 2}); },
         say: '<strong>Pieskarieties ziņas lodziņam</strong> apakšā, <strong>uzrakstiet īsu ziņu</strong> (piemēram, “Sveiki!”), tad <strong>pieskarieties sūtīšanas bultiņai</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Mikrofons ir paredzēts balss ziņām, kas būs nākamās. Vispirms uzrakstiet ziņu un pieskarieties sūtīšanas bultiņai.', attach: 'Tas ir fotoattēliem, kas būs nākamie. Vispirms uzrakstiet ziņu un pieskarieties sūtīšanai.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah ir atbildējusi! Zem jūsu ziņas ir <strong>divi zili ķeksīši ⟦check-check⟧</strong>. Ko tie nozīmē?',
            options: [
                {t: 'Ziņu neizdevās nosūtīt', why: 'Pie neizdevušās ziņas redzams pulkstenis vai sarkans brīdinājums. Ķeksīši nozīmē, ka viss izdevies.'},
                {t: 'Sarah to ir izlasījusi', ok: true, why: 'Jā! Viens pelēks ķeksītis nozīmē nosūtīts, divi pelēki ķeksīši nozīmē piegādāts viņas tālrunim, bet divi zili ķeksīši nozīmē, ka viņa to ir izlasījusi.'},
                {t: 'Tā tika nosūtīta divreiz', why: 'Nē, tā tika nosūtīta tikai vienreiz. Divi zili ķeksīši nozīmē, ka tā ir izlasīta.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Tagad nosūtiet fotoattēlu. <strong>Pieskarieties ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> blakus ziņas lodziņam.`,
         hints: {camera: 'Kamera uzņem jaunu fotoattēlu. Lai nosūtītu jau uzņemtu, pieskarieties ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Pieskarieties ${p === 'ios' ? 'Fotoattēli' : 'Galerija'}</strong>, lai izvēlētos no tālrunī esošajiem fotoattēliem.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Šie ir (iedomātie) fotoattēli jūsu tālrunī. <strong>Pieskarieties saulespuķēm</strong> 🌻.',
         hint: 'Pieskarieties fotoattēlam ar saulespuķēm.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Burvīgi! 🌻 Vai tās ir no jūsu dārza?', n: 4}); },
         say: 'Ja vēlaties, varat ierakstīt parakstu. Tad <strong>pieskarieties sūtīšanas bultiņai</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Balss ziņas ir noderīgas, ja rakstīšana sagādā grūtības. Īstā tālrunī, kamēr runājat, jūs <strong>turat nospiestu mikrofonu</strong> ⟦mic⟧, tad atlaižat, lai nosūtītu. Šeit <strong>vienreiz pieskarieties mikrofonam, lai sāktu, tad pieskarieties sūtīšanas bultiņai</strong>, lai nosūtītu.',
         hint: 'Pieskarieties mikrofonam, tad sūtīšanas bultiņai.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Lieliski!</strong> Jūs esat nosūtījuši ziņu, fotoattēlu un balss ziņu. Lai jebkurā laikā atbildētu Sarah, atveriet WhatsApp un pieskarieties viņas tērzēšanai.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Pieskarieties Sarah tērzēšanai,</strong> lai to atvērtu.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Tērzēšanas augšā ir divas zvana pogas: <strong>video kamera</strong> video zvanam un <strong>tālrunis</strong> balss zvanam. <strong>Pieskarieties video kamerai</strong> ⟦video⟧.',
         hints: {voice: 'Tas veic balss zvanu bez video. Šim vingrinājumam pieskarieties video kamerai.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Tas zvana uz Sarah tālruni, un, kad viņa atbild, jūs redzat viens otru. Ja jums apkārt ir trokšņaini, <strong>pieskarieties mikrofonam</strong> ⟦mic⟧, lai izslēgtu savu skaņu.',
         hint: 'Mikrofona poga ir apakšējā rindā.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Jūsu skaņa ir izslēgta: Sarah jūs redz, bet nedzird. Lai viņai kaut ko parādītu, <strong>pieskarieties apgriešanas pogai</strong> ⟦switch-camera⟧, lai pārslēgtos uz kameru tālruņa aizmugurē.',
         hints: {mute: 'Vēlāk pieskarieties mikrofonam vēlreiz, lai ieslēgtu skaņu. Tagad izmēģiniet apgriešanas pogu.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Tagad Sarah redz to, uz ko vērsiet tālruni. Kad esat beiguši, <strong>pieskarieties sarkanajai pogai</strong>, lai beigtu zvanu.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Video zvani patērē daudz datu. Kā tos labāk veikt?',
            options: [
                {t: 'Mājās ar Wi-Fi, kad vien iespējams', ok: true, why: 'Jā. Izmantojot Wi-Fi, zvani netērē jūsu mobilo datu apjomu, tāpēc ir bez maksas, lai cik ilgi runātu.'},
                {t: 'Tam nav nozīmes', why: 'Izmantojot mobilos datus, garš video zvans var ātri izmantot visu jūsu datu apjomu. Wi-Fi ir labākais, kad vien iespējams.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Tagad grupas. Grupā Ģimene ir daudz jaunu ziņu, un paziņojumi nemitīgi sprakšķ. <strong>Pieskarieties grupai Ģimene.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Lai mainītu grupas iestatījumus, <strong>pieskarieties grupas nosaukumam</strong> augšā.', hint: 'Pieskarieties vārdam “Ģimene” ekrāna augšā.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Pieskarieties Izslēgt paziņojumu skaņu.</strong> Ziņas joprojām saņemsiet, bet tālrunis nevibrēs pie katras.',
         hints: {'exit-group': 'Iziet no grupas nozīmētu to pamest pavisam. Skaņas izslēgšana ir saudzīgāka: jūs paliekat grupā, bet bez nemitīgas vibrēšanas.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Izvēlieties, uz cik ilgi. <strong>Pieskarieties 1 nedēļu.</strong>',
         hints: {'mute-8h': 'Der arī 8 stundas. Šim vingrinājumam pieskarieties 1 nedēļu.', 'mute-always': 'Der arī Vienmēr, bet jūs varat kaut ko nokavēt. Šim vingrinājumam pieskarieties 1 nedēļu.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Lieliski!</strong> Jūs esat veikuši video zvanu, izslēguši savu skaņu, apgriezuši kameru un apklusinājuši aizņemtu grupu. Grupas ziņas joprojām varat lasīt, kad vien vēlaties.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Sveiki!', ticks: 'read', n: 1}, {text: 'Sveika, mamm! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Svētdienas pusdienas pie mums? 🍗', n: 1}, {from: 'Sarah', text: 'Jā, lūdzu!', n: 2}, {from: 'Dave', text: 'Kas atnesīs torti? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'WhatsApp paša iestatījumi ir lietotnē. <strong>Pieskarieties Iestatījumi</strong> apakšā labajā pusē.',
                hints: {'chat-unknown': 'Ar šo ziņu nodarbosimies vēlāk. Vispirms pieskarieties Iestatījumi apakšā labajā pusē.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'WhatsApp paša iestatījumi ir lietotnē. <strong>Pieskarieties trim punktiem ⋮</strong> augšā labajā pusē.',
                hints: {'chat-unknown': 'Ar šo ziņu nodarbosimies vēlāk. Vispirms pieskarieties trim punktiem augšā labajā pusē.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Pieskarieties Iestatījumi.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Pieskarieties Konts.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Divpakāpju verifikācija</strong> pievieno PIN, kas vajadzīgs, ja kāds mēģina iestatīt jūsu WhatsApp citā tālrunī. Pat ja krāpnieks iegūst jūsu 6 ciparu kodu, viņš netiek iekšā. <strong>Pieskarieties Divpakāpju verifikācija.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Pieskarieties Ieslēgt.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Izvēlieties 6 ciparu PIN, kas atšķiras no tālruņa piekļuves koda. Šim vingrinājumam <strong>ierakstiet ${pinText}</strong>. <em>Nerakstiet šeit īstu PIN.</em>`,
             hint: `Ierakstiet vingrināšanās PIN ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Ierakstiet ${pinText} vēlreiz</strong>, lai to apstiprinātu.`, hint: `Ievadiet ${pinText} vēlreiz.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Pievienojot e-pasta adresi, varēsiet atiestatīt PIN, ja to aizmirstat. Īstajā tālrunī to ir vērts izdarīt. Šeit <strong>pieskarieties Tālāk</strong>.',
             hints: {skip: 'Varat to izlaist, bet tad PIN aizmiršana var atstāt jūs bez piekļuves. Šim vingrinājumam pieskarieties Tālāk.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Divpakāpju verifikācija ir ieslēgta. <strong>Pieskarieties Gatavs.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Ziņā rakstīts, ka tā ir no <em>“WhatsApp atbalsta”</em>, un tiek prasīts jūsu divpakāpju PIN, lai “verificētu jūsu kontu”. Ko jūs darāt?',
                options: [
                    {t: 'Nosūtu, tā ir no WhatsApp', why: 'WhatsApp nekad nerakstīs jums, lai prasītu PIN vai kodu. Tas ir krāpnieks, kas mēģina pārņemt jūsu kontu.'},
                    {t: 'Neatbildu, bloķēju un ziņoju par viņu', ok: true, why: 'Tieši tā. Neviens, arī WhatsApp, nekad nedrīkst prasīt jūsu PIN vai 6 ciparu kodu.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Tālāk neļaujiet svešiniekiem pievienot jūs grupām. Tas ir sadaļā <strong>Privātums</strong>. <strong>Pieskarieties Grupas.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Mani kontakti'; },
             say: '“Visi” nozīmē, ka jebkurš svešinieks var pievienot jūs grupai, ko krāpnieki izmanto. <strong>Pieskarieties Mani kontakti.</strong>',
             hints: {'groups-everyone': 'Ja izvēlēts Visi, svešinieki var pievienot jūs grupām, arī krāpnieku grupām. Pieskarieties Mani kontakti.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Ienākusi ziņa no numura, ko nepazīstat: “Sveika, mamm, tas esmu es! Jauns numurs…”. Tā ir “Sveika, mamm” krāpšana. <strong>Pieskarieties tai, lai atvērtu.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Sveika, mamm, tas esmu es! Jauns numurs, vecais tālrunis salūza. Vai vari man palīdzēt samaksāt rēķinu? Rīt atdošu x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Neatbildiet. WhatsApp pamana, ka numura nav jūsu kontaktos. <strong>Pieskarieties Bloķēt.</strong>',
             hints: {'add-contact': 'Nepievienojiet krāpnieku saviem kontaktiem. Pieskarieties Bloķēt.', video: 'Neatzvaniet viņiem. Pieskarieties Bloķēt.', voice: 'Neatzvaniet viņiem. Pieskarieties Bloķēt.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Sveika, mamm, tas esmu es! Jauns numurs, vecais tālrunis salūza. Vai vari man palīdzēt samaksāt rēķinu? Rīt atdošu x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'Atzīme pie “Ziņot WhatsApp” ir ielikta, un tas palīdz WhatsApp apturēt krāpnieku. <strong>Pieskarieties Bloķēt.</strong>',
             hints: {cancel: 'Atcelšana ļautu viņiem turpināt jums rakstīt. Pieskarieties Bloķēt.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Lieliski!</strong> Jūs esat ieslēguši divpakāpju verifikāciju, neļāvuši svešiniekiem pievienot jūs grupām un bloķējuši krāpnieku un ziņojuši par viņu. Ja kādreiz neesat drošs par ģimenes locekļa ziņu, piezvaniet viņam uz numuru, kas jums jau ir.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Atpakaļ') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Atpakaļ')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Lietotnes, kas atbalsta dinamisko teksta izmēru, pielāgosies jūsu vēlamajam lasīšanas izmēram.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Teksta lielums', [], {top: slider, back: 'Displejs'});
        return list(p, 'Displeja lielums un teksts', [{caption: 'Fonta lielums'}, {id: 'bold', label: 'Treknraksts', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Teksta lielums ir lietotnē <strong>Iestatījumi</strong>. <strong>Pieskarieties Iestatījumi.</strong>', hint: 'Iestatījumi ir pelēka ikona ar zobratu.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Pieskarieties Displejs un spilgtums.</strong>', hint: 'Tas ir trešajā grupā, zem Pieejamība.'},
        {screen: c => list(p, 'Displejs un spilgtums', [{caption: 'IZSKATS'}, {label: 'Gaišs', value: '⟦check⟧'}, {caption: 'TEKSTS'}, {id: 'text-size', label: 'Teksta lielums'}, {id: 'bold', label: 'Treknraksts', toggle: !!c.bold}], {back: 'Iestatījumi'}),
         target: 'text-size', say: '<strong>Pieskarieties Teksta lielums.</strong>', hints: {bold: 'Treknraksts būs nākamais. Vispirms pieskarieties Teksta lielums.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Velciet slīdni pa labi, lai rakstu padarītu lielāku. Šeit <strong>divreiz pieskarieties lielajam burtam A</strong> un vērojiet, kā teksts aug.', hint: 'Pieskarieties lielajam burtam A slīdņa labajā pusē.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Daudz vieglāk lasīt! Tagad <strong>pieskarieties ‹ Displejs</strong> augšā, lai atgrieztos.'},
        {screen: c => list(p, 'Displejs un spilgtums', [{caption: 'IZSKATS'}, {label: 'Gaišs', value: '⟦check⟧'}, {caption: 'TEKSTS'}, {id: 'text-size', label: 'Teksta lielums'}, {id: 'bold', label: 'Treknraksts', toggle: !!c.bold}], {back: 'Iestatījumi'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Treknraksts</strong> padara burtus biezākus un skaidrākus. <strong>Pieskarieties tam, lai to ieslēgtu.</strong>'},
        {screen: c => list(p, 'Displejs un spilgtums', [{caption: 'TEKSTS'}, {label: 'Teksta lielums'}, {label: 'Treknraksts', toggle: true}], {back: 'Iestatījumi'}),
         question: {q: 'Teksts joprojām par mazu pat lielākajā iestatījumā?', options: [
            {t: 'Vairāk neko nevar izdarīt', why: 'Ir vēl! Iestatījumi > Pieejamība > Displejs un teksta lielums > Lielāks teksts piedāvā vēl lielākus izmērus.'},
            {t: 'Iestatījumi > Pieejamība > Displejs un teksta lielums > Lielāks teksts', ok: true, why: 'Jā. Ieslēdziet tur Lielāki pieejamības izmēri, lai iegūtu patiešām lielu tekstu.'}]}},
        {screen: c => list(p, 'Displejs un spilgtums', [{caption: 'TEKSTS'}, {label: 'Teksta lielums'}, {label: 'Treknraksts', toggle: true}], {back: 'Iestatījumi'}), done: true,
         say: '<strong>Lieliski!</strong> Jūsu teksts ir lielāks un treknāks, iestatījumos un lielākajā daļā lietotņu.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Teksta lielums ir lietotnē <strong>Iestatījumi</strong>. <strong>Pieskarieties Iestatījumi.</strong>', hint: 'Iestatījumi ir ikona ar zobratu.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Pieskarieties Displejs un pieskāriens.</strong> <em>Samsung tālrunī tas ir Displejs, tad Fonta lielums un stils.</em>'},
        {screen: () => list(p, 'Displejs un pieskāriens', [{id: 'dark', label: 'Tumšais motīvs', toggle: false}, {id: 'text-size', label: 'Displeja lielums un teksts', sub: 'Fonta lielums, treknraksts'}, {id: 'brightness', label: 'Spilgtuma līmenis', value: '70%'}]),
         target: 'text-size', say: '<strong>Pieskarieties Displeja lielums un teksts.</strong>', hints: {dark: 'Tumšais motīvs maina krāsas, nevis izmēru. Pieskarieties Displeja lielums un teksts.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Velciet Fonta lieluma slīdni pa labi, lai rakstu padarītu lielāku. Šeit <strong>divreiz pieskarieties lielajam burtam A</strong>.', hint: 'Pieskarieties lielajam burtam A slīdņa labajā pusē.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Treknraksts</strong> padara burtus skaidrākus. <strong>Pieskarieties tam, lai to ieslēgtu.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Teksts joprojām par mazu pat lielākajā iestatījumā?', options: [
            {t: 'Vairāk neko nevar izdarīt', why: 'Izmēģiniet arī Displeja lielumu tajā pašā lapā: tas palielina visu, arī pogas un ikonas.'},
            {t: 'Palielināt arī Displeja lielumu', ok: true, why: 'Jā. Displeja lielums palielina visu uz ekrāna, ne tikai tekstu.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Lieliski!</strong> Jūsu teksts ir lielāks un treknāks, iestatījumos un lielākajā daļā lietotņu.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' uz violetā' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Netraucēt' : 'Fokuss'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Netraucēt · Ieslēgts' : 'Netraucēt · Izslēgts'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Velciet uz augšu, lai aizvērtu' : 'Aizvērt'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Ja tālrunis nezvana, iespējams, ir ieslēgts režīms Netraucēt. Ātrie iestatījumi ir <strong>Vadības centrā</strong>: <strong>velciet uz leju no augšējā labā stūra</strong> (vai pieskarieties joslai augšā).'
                          : 'Ja tālrunis nezvana, iespējams, ir ieslēgts režīms Netraucēt. <strong>Velciet uz leju no ekrāna augšas</strong>, lai redzētu ātros iestatījumus (vai pieskarieties joslai augšā).',
         hints: {'pull-up': 'Velciet otrā virzienā: uz leju no augšas.', 'pull-left': 'Velciet uz leju, nevis uz sāniem.', 'pull-right': 'Velciet uz leju, nevis uz sāniem.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Mēness ⟦moon⟧ nozīmē, ka <strong>Netraucēt ir ieslēgts</strong>, tāpēc zvani un ziņas ir apklusinātas. <strong>Pieskarieties tam, lai to izslēgtu.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Tagad palieliniet skaļumu ar <strong>skaļuma pogu tālruņa sānos</strong> (augšējo). <strong>Pieskarieties ＋ vingrināšanās tālruņa malā 3 reizes.</strong>',
         hint: 'Pieskarieties pogai ＋ tālruņa labajā malā.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'Jūsu iPhone joprojām nezvana. Kas vēl varētu būt?', options: [
                {t: 'Zvana/klusuma slēdzis vai darbības poga ir iestatīta uz klusumu', ok: true, why: 'Jā. Daudziem iPhone virs skaļuma pogām ir neliels slēdzis: ja tas rāda oranžu krāsu, tālrunis ir klusuma režīmā. Jaunākajiem tā vietā ir darbības poga.'},
                {t: 'Tālrunis ir salūzis', why: 'Parasti nē! Vispirms pārbaudiet klusuma slēdzi virs skaļuma pogām.'}]}
            : {q: 'Jūs nospiedāt skaļuma pogu, bet tā mainīja tikai multivides skaļumu. Ko tagad darīt?', options: [
                {t: 'Pieskarieties ⋯ vai iestatījumu ikonai uz skaļuma joslas, lai redzētu zvana skaļumu', ok: true, why: 'Jā. Skaļuma pogas bieži maina multivides skaļumu; pieskarieties trim punktiem uz skaļuma joslas, lai mainītu zvana skaļumu.'},
                {t: 'Padoties', why: 'Pieskarieties trim punktiem ⋯ uz parādījušās skaļuma joslas un palieliniet zvana skaļumu.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Lieliski!</strong> Netraucēt ir izslēgts un skaļums ir palielināts, tāpēc dzirdēsiet zvanus un ziņas.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500mg</strong><br>Lietot 1–2 tabletes ik pēc 4–6 stundām.<br>Nelietot vairāk par 8 tabletēm 24 stundās.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Lupa', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'Jūsu iPhone ir lietotne <strong>Lupa</strong>. Ja tās nav sākuma ekrānā, velciet uz leju ekrāna vidū un ierakstiet “Lupa”. <strong>Pieskarieties Lupa.</strong>'
                          : 'Daudziem Android tālruņiem ir lietotne <strong>Palielinātājs</strong>. <em>Samsung tālrunī tā ir ātrajos iestatījumos vai sadaļā Pieejamība.</em> <strong>Pieskarieties Palielinātājs.</strong>',
         hint: 'Meklējiet melnu ikonu ar palielināmo stiklu.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Vērsiet tālruni uz kaut ko mazu, piemēram, šo zāļu etiķeti. <strong>Pieskarieties ＋ trīs reizes</strong>, lai pietuvinātu (īstā tālrunī varat vilkt slīdni).', hint: 'Pieskarieties ＋ slīdņa labajā pusē.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Vājā apgaismojumā palīdz lukturītis. <strong>Pieskarieties lukturītim</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Mazliet trīc rokas? <strong>Pieskarieties lielajai apaļajai pogai</strong>, lai iesaldētu attēlu un varētu to izlasīt, nenoturot tālruni mierā.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Kam vēl noder lupa?', options: [
            {t: 'Lai lasītu ēdienkartes, cenu zīmes un sīko druku vēstulēs', ok: true, why: 'Jā, un tā vienmēr ir jūsu kabatā. Daži cilvēki to ievieto Vadības centrā vai ātrajos iestatījumos, lai tā būtu pieejama ar vienu pieskārienu.'},
            {t: 'Lai zvani būtu skaļāki', why: 'Tam ir skaļuma pogas. Lupa paredzēta, lai skaidrāk redzētu sīkas lietas.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Lieliski!</strong> Tagad varat pietuvināt sīko druku, apgaismot to un iesaldēt attēlu.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Tiekamies kafijas rītā ceturtdien' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Vai nāksi ceturtdien? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Īsziņa</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Klausās… runājiet</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Varat runāt, nevis rakstīt. <strong>Atveriet Ziņas.</strong>', hint: 'Ziņas ir zaļais runas burbulis.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean ir jautājusi par ceturtdienu. <strong>Pieskarieties ziņas lodziņam</strong> apakšā.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Parādās tastatūra. <strong>Pieskarieties mikrofonam</strong> ⟦mic⟧ uz tastatūras, tad izrunājiet savu ziņu.', hint: 'Mikrofons ir uz tastatūras blakus atstarpes taustiņam.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Īstā tālrunī tagad teiktu: <em>“Tiekamies kafijas rītā ceturtdien”</em>. Vārdi parādās, kamēr runājat. Pārbaudiet tos, tad <strong>pieskarieties sūtīšanai</strong> ⟦send-horizontal⟧.',
         hint: 'Pagaidiet, līdz parādās vārdi, tad pieskarieties sūtīšanas bultiņai.'},
        {screen: () => home(p), target: 'settings',
         say: 'Tālrunis var arī <strong>nolasīt jums vārdus skaļi</strong>. Ieslēgsim to. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Pieskarieties Pieejamība.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Pieejamība', [{caption: 'REDZE'}, {id: 'voiceover', label: 'VoiceOver', value: 'Izslēgts'}, {id: 'zoom', label: 'Tālummaiņa', value: 'Izslēgts'}, {id: 'spoken', label: 'Runātais saturs'}], {back: 'Iestatījumi'})
            : list(p, 'Pieejamība', [{id: 'select-speak', label: 'Atlasīt, lai runātu', sub: 'Izslēgts'}, {id: 'talkback', label: 'TalkBack', sub: 'Izslēgts'}, {id: 'magnification', label: 'Palielināšana'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Pieskarieties Runātais saturs.</strong>' : '<strong>Pieskarieties Atlasīt, lai runātu.</strong>',
         hints: {voiceover: 'VoiceOver maina visa tālruņa darbību, kas var radīt apjukumu. Pieskarieties Runātais saturs.', talkback: 'TalkBack maina visa tālruņa darbību, kas var radīt apjukumu. Pieskarieties Atlasīt, lai runātu.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Runātais saturs', [{id: 'speak-selection', label: 'Atlases izrunāšana', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Ekrāna izrunāšana', toggle: !!c.speakScreen, sub: 'Velciet uz leju ar diviem pirkstiem no ekrāna augšas, lai to dzirdētu nolasītu.'}], {back: 'Pieejamība'})
            : list(p, 'Atlasīt, lai runātu', [{id: 'speak-screen', label: 'Izmantot Atlasīt, lai runātu', toggle: !!c.speakScreen, sub: 'Pieskarieties saīsnei, tad pieskarieties jebkam uz ekrāna, lai to dzirdētu nolasītu.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Ieslēdziet Ekrāna izrunāšanu.</strong> Pēc tam jebkurā tālruņa vietā, velkot uz leju no augšas ar diviem pirkstiem, ekrāns tiek nolasīts skaļi.' : '<strong>Ieslēdziet Izmantot Atlasīt, lai runātu.</strong> Parādās neliela saīsnes poga: pieskarieties tai, tad pieskarieties jebkuram tekstam, lai to dzirdētu.',
         hints: {'speak-selection': 'Tas nolasa tikai jūsu iezīmētos vārdus. Vieglāk ir ar Ekrāna izrunāšanu: ieslēdziet to.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Runātais saturs', [{label: 'Atlases izrunāšana', toggle: false}, {label: 'Ekrāna izrunāšana', toggle: true}], {back: 'Pieejamība'})
            : list(p, 'Atlasīt, lai runātu', [{label: 'Izmantot Atlasīt, lai runātu', toggle: true}]), done: true,
         say: '<strong>Lieliski!</strong> Tagad varat runāt, nevis rakstīt, un likt tālrunim nolasīt jums tekstus skaļi.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Daudzus dzirdes aparātus var savienot ar tālruni, lai zvani un mūzika nonāk tieši tajos. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Pieskarieties Pieejamība.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Pieejamība', [{caption: 'DZIRDE'}, {id: 'hearing-devices', label: 'Dzirdes ierīces'}, {id: 'live-captions', label: 'Tiešraides subtitri', value: c.captions ? 'Ieslēgta' : 'Izslēgts'}, {id: 'subtitles', label: 'Subtitri un titri'}], {back: 'Iestatījumi'})
            : list(p, 'Pieejamība', [{id: 'hearing-devices', label: 'Dzirdes aparāti', sub: c.paired ? 'Savienots' : 'Nav savienots'}, {id: 'live-captions', label: 'Tiešraides subtitri', sub: c.captions ? 'Ieslēgta' : 'Izslēgts'}, {id: 'sound-amp', label: 'Skaņas pastiprinātājs'}]),
         target: 'hearing-devices', say: `<strong>Pieskarieties ${p === 'ios' ? 'Dzirdes ierīces' : 'Dzirdes aparāti'}.</strong> Vispirms ievietojiet dzirdes aparātus ausīs un aizveriet to akumulatora vāciņus, lai tie restartētos, tad tālrunis tos varēs atrast.`,
         hints: {'live-captions': 'Subtitri būs nākamie. Vispirms savienojiet dzirdes aparātus.'}},
        {screen: c => list(p, p === 'ios' ? 'Dzirdes ierīces' : 'Dzirdes aparāti', [{caption: p === 'ios' ? 'MFI DZIRDES IERĪCES' : 'Pieejamās ierīces'}, {id: 'aids', label: 'Margaret dzirdes aparāti', sub: 'Kreisais un labais'}],
            {overlay: c.pairing ? dialog(p, 'Savienot pārī ar “Margaret dzirdes aparāti”?', 'Tie tiks izmantoti zvaniem un audio.', [['cancel', 'Atcelt'], ['pair', 'Savienot pārī']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Tālrunis tos atrod. <strong>Pieskarieties saviem dzirdes aparātiem.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Dzirdes ierīces' : 'Dzirdes aparāti', [{id: 'aids', label: 'Margaret dzirdes aparāti', sub: 'Kreisais un labais'}],
            {overlay: dialog(p, 'Savienot pārī ar “Margaret dzirdes aparāti”?', 'Tie tiks izmantoti zvaniem un audio.', [['cancel', 'Atcelt'], ['pair', 'Savienot pārī']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Pieskarieties Savienot pārī.</strong> (Ja ir divi dzirdes aparāti, tālrunis var jautāt divreiz, katram atsevišķi.)'},
        {screen: c => list(p, p === 'ios' ? 'Dzirdes ierīces' : 'Dzirdes aparāti', [{label: 'Margaret dzirdes aparāti', sub: 'Savienots ⟦check⟧'}]), target: 'back',
         say: 'Savienots! Zvani tagad atskanēs jūsu dzirdes aparātos. <strong>Pieskarieties Atpakaļ.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Pieejamība', [{caption: 'DZIRDE'}, {id: 'hearing-devices', label: 'Dzirdes ierīces'}, {id: 'live-captions', label: 'Tiešraides subtitri', value: c.captions ? 'Ieslēgta' : 'Izslēgts'}], {back: 'Iestatījumi'})
            : list(p, 'Pieejamība', [{id: 'hearing-devices', label: 'Dzirdes aparāti', sub: 'Savienots'}, {id: 'live-captions', label: 'Tiešraides subtitri', sub: c.captions ? 'Ieslēgta' : 'Izslēgts'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Tiešraides subtitri' : 'Tiešraides subtitri'}</strong> rāda uz ekrāna visu izrunāto: videoklipus, zvanus un balss ziņas. <strong>Pieskarieties tam, lai to ieslēgtu.</strong>`},
        {screen: c => list(p, 'Pieejamība', [{label: p === 'ios' ? 'Tiešraides subtitri' : 'Tiešraides subtitri', toggle: true}, {label: 'Dzirdes aparāti', sub: 'Savienots'}]), done: true,
         say: '<strong>Lieliski!</strong> Jūsu dzirdes aparāti ir savienoti, un izrunātie vārdi tagad parādās kā subtitri.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Antilope', 'Bebrs', 'Cūka', 'Delfīns', 'Ezis', 'Flamings', 'Govs', 'Haizivs', 'Ibiss', 'Jērs', 'Kaķis', 'Lapsa', 'Mērkaķis',
                     'Nīlzirgs', 'Odze', 'Pīle', 'Ronis', 'Suns', 'Tītars', 'Ūdrs', 'Vāvere', 'Zebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Turiet nospiestu ziedu</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Kopēt</span><span>Kopīgot</span><span>Dzēst</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebra</h3><p>Zebrām ir melnas un baltas svītras. Divām zebrām nav tieši vienāda raksta.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Pieskarties</strong> nozīmē viegli pieskarties ekrānam ar vienu pirkstu un uzreiz atlaist, kā nospiežot pogu. <strong>Pieskarieties zvaigznei.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Turēt nospiestu</strong> nozīmē vienu vai divas sekundes turēt pirkstu uz kaut kā. Tas parasti parāda papildu iespējas. <strong>Turiet nospiestu ziedu</strong>, līdz kaut kas notiek. (Ar peli turiet pogu nospiestu.)',
         hint: 'Vienu vai divas sekundes turiet pirkstu uz zieda.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Parādījās izvēlne. Ko parasti dara turēšana nospiestu?', options: [
            {t: 'Parāda papildu iespējas, piemēram, kopēt, kopīgot vai dzēst', ok: true, why: 'Jā. Turot nospiestu ziņas, fotoattēlus un lietotnes, parādās šādas iespējas.'},
            {t: 'Uzreiz izdzēš lietas', why: 'Nē, tā tikai parāda iespēju izvēlni. Nekas nenotiek, kamēr kādu neizvēlaties.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Vilkšana</strong> nozīmē slidināt pirkstu pāri ekrānam, kā pāršķirot lapu. <strong>Divreiz velciet fotoattēlu pa kreisi</strong>, lai redzētu nākamos. (Ar peli noklikšķiniet, velciet un atlaidiet.)',
         hint: 'Slidiniet pirkstu no labās uz kreiso pusi pāri fotoattēlam. Vai arī izmantojiet pogu “Nevar vilkt?”.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Ritināšana</strong> nozīmē slidināt pirkstu uz augšu pa ekrānu, lai redzētu vairāk saraksta, tāpat kā šeit. <strong>Ritiniet uz leju un pieskarieties Zebra</strong> pašā apakšā. (Ar peli izmantojiet ritenīti.)',
         hint: 'Slidiniet sarakstu uz augšu ar pirkstu, lai nonāktu pie Zebra apakšā.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Lai iPhone tālrunī atgrieztos vienu lapu atpakaļ, <strong>pieskarieties ‹ Atpakaļ</strong> augšā kreisajā pusē (vai velciet no ekrāna kreisās malas uz iekšu).' : 'Lai Android tālrunī atgrieztos vienu lapu atpakaļ, <strong>pieskarieties atpakaļ bultiņai ◁</strong> apakšā (vai velciet no ekrāna kreisās vai labās malas uz iekšu).',
         hints: {'home-pill': 'Tas aizved pilnīgi uz sākumu. Tā vietā pieskarieties atpakaļ bultiņai ◁.', 'home-bar': 'Tas aizved pilnīgi uz sākumu. Tā vietā pieskarieties ‹ Atpakaļ.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Lai no jebkuras vietas nonāktu sākuma ekrānā, <strong>velciet uz augšu no joslas ekrāna apakšā</strong> (vai pieskarieties joslai šeit). Vecākiem iPhone ar apaļo sākuma pogu: nospiediet to.'
                          : 'Lai no jebkuras vietas nonāktu sākuma ekrānā, <strong>pieskarieties sākuma aplim ○</strong> apakšā (vai velciet uz augšu no apakšējās malas).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Atpakaļ aizved vienu lapu atpakaļ. Pieskarieties sākuma aplim ○, lai nonāktu sākumā.'}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Jūs esat vingrinājušies pieskarties, turēt nospiestu, vilkt, ritināt, atgriezties un doties uz sākumu: kustības, ko izmantosiet katru dienu.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Savienots', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internets', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'TĪKLI' : 'Pieejamie tīkli'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Iestatījumi',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Ievadiet paroli tīklam “BT-Hub-7F2A”</strong></p>
                ${field('wifipass', 'Parole', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Pievienoties' : 'Izveidot savienojumu'}</button>
                <button type="button" class="cp" data-tap="cancel">Atcelt</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wi-Fi lietošana mājās taupa jūsu mobilos datus. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Pieskarieties Wi-Fi</strong> netālu no augšas.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Pieskarieties Tīkls un internets.</strong> <em>Samsung tālrunī tas ir Savienojumi, tad Wi-Fi.</em>'},
               {screen: () => list(p, 'Tīkls un internets', [{id: 'internet', label: 'Internets', sub: 'Wi-Fi un mobilie dati'}, {id: 'sims', label: 'SIM kartes'}, {id: 'hotspot', label: 'Tīklājs un piesaiste'}]),
                target: 'internet', say: '<strong>Pieskarieties Internets.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Jūsu Wi-Fi nosaukums un parole parasti ir uz uzlīmes rūtera aizmugurē (kastē ar gaismiņām). Šī vingrināšanās rūtera uzlīmē ir rakstīts:<br><span class="ahd">Tīkls: <strong>BT-Hub-7F2A</strong><br>Parole: <strong>Green-Apple-42</strong></span><strong>Pieskarieties BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Tas ir kaimiņa Wi-Fi. Atrodiet nosaukumu uz savas uzlīmes: BT-Hub-7F2A.', 'net-sky-12345': 'Tas ir kāda cita Wi-Fi. Atrodiet nosaukumu uz savas uzlīmes: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Parolei jāsakrīt ar uzlīmi pilnīgi precīzi, arī lielie burti un domuzīmes: Green-Apple-42',
         say: 'Ierakstiet paroli <strong>tieši</strong> tā, kā tā ir uz uzlīmes: <strong>Green-Apple-42</strong>. Lielie burti ir svarīgi! Pēc tam <strong>pieskarieties Pievienoties</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Jūs esat savienoti! Tālrunis tagad pats pievienosies šim Wi-Fi, kad vien būsiet mājās. Vai kafejnīcā ir droši izmantot bezmaksas Wi-Fi?', options: [
            {t: 'Jā, lai pārlūkotu internetu, bet izvairieties no internetbankas', ok: true, why: 'Tieši tā. Publiskais Wi-Fi der ziņu lasīšanai vai autobusa laika pārbaudei. Bankas darījumiem izmantojiet mobilos datus vai mājas Wi-Fi.'},
            {t: 'Jā, visam', why: 'Publisko Wi-Fi var novērot citi. Tas der pārlūkošanai, bet bankas darījumiem izmantojiet mobilos datus vai mājas Wi-Fi.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs esat savienoti ar Wi-Fi. Meklējiet vēdekļveida Wi-Fi simbolu ekrāna augšā.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Jauns kontakts' : 'Izveidot kontaktu', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Vārds', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Mobilā tālruņa numurs', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gatavs' : 'Saglabāt'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Kontakts', [
        {label: 'Mobilais', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Pievienot izlasei' : (ctx.fav ? '⟦star⟧ Izlasē' : '⟦star⟧ Pievienot izlasei')},
        {id: 'share', label: 'Kopīgot kontaktu'}], {back: 'Kontakti'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Kontakti', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Saglabājot cilvēka numuru, varat viņam piezvanīt pēc vārda. iPhone tālrunī kontakti ir lietotnē <strong>Tālrunis</strong>. <strong>Pieskarieties Tālrunis.</strong>' : '<strong>Pieskarieties Kontakti.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Kontakti', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Kontakti', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Šis ir jūsu kontaktu saraksts. <strong>Pieskarieties +</strong> augšā labajā pusē, lai pievienotu kādu.' : 'Šis ir jūsu kontaktu saraksts. <strong>Pieskarieties pogai +</strong>, lai pievienotu kādu.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Ierakstiet vārdu un vingrināšanās numuru 07700 900456, tad pieskarieties ' + (p === 'ios' ? 'Gatavs.' : 'Saglabāt.'),
         say: `Ierakstiet cilvēka <strong>vārdu</strong> (izmēģiniet “Ann”) un viņa numuru. Vingrinājumam izmantojiet <strong>07700 900456</strong>. Pēc tam <strong>pieskarieties ${p === 'ios' ? 'Gatavs' : 'Saglabāt'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Saglabāts! Izlase ir cilvēki, kam zvanāt visbiežāk, un viņi tiek rādīti augšā, lai varētu piezvanīt ar vienu pieskārienu. <strong>Pieskarieties ' + (p === 'ios' ? 'Pievienot izlasei' : 'zvaigznei') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Kuru kontaktu ir vērts saglabāt ar “ICE” (In Case of Emergency jeb ārkārtas gadījumam) pirms vārda?', options: [
            {t: 'Tuvāko radinieku, piemēram, “ICE Sarah”', ok: true, why: 'Jā. Mediķi zina, ka jāmeklē ICE. Vēl labāk ir pievienot ārkārtas kontaktpersonu savam Medicīniskajam ID, kas aprakstīts kursā „Tālruņa drošība”.'},
            {t: 'Jūsu banka', why: 'ICE ir cilvēkam, kuram jāpiezvana, ja ar jums kaut kas notiek, parasti tuvākajam radiniekam.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs esat saglabājuši kontaktu un pievienojuši to izlasei.'},
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
    const recents = p => app(p, 'Nesenie', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Jūsu tālrunis zvana: zvana Jean. <strong>Pieskarieties zaļajai pogai, lai atbildētu.</strong>' + (p === 'android' ? ' <em>Dažos Android tālruņos zaļā poga tā vietā jāvelk uz augšu.</em>' : ' <em>Ja jūsu iPhone ir bloķēts, zaļā poga tā vietā jāpavelk uz sāniem.</em>'),
         hints: {decline: 'Sarkanā noraida zvanu. Pieskarieties zaļajai, lai atbildētu.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Jūs runājat! Lai labāk dzirdētu vai runātu, neturot tālruni pie auss, <strong>pieskarieties skaļrunim</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Kad esat beiguši, <strong>pieskarieties sarkanajai pogai</strong>, lai nolikti klausuli.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Agrāk jums bija neatbildēts zvans no Dave. Neatbildētie zvani nesenajos zvanos ir <strong>sarkanā</strong> krāsā. <strong>Pieskarieties Dave</strong>, lai viņam atzvanītu.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Tiek zvanīts Dave. Kad esat beiguši runāt, <strong>pieskarieties sarkanajai pogai</strong>, lai nolikti klausuli.'},
        {screen: () => recents(p), question: {q: 'Kāds zvana no jums nezināma numura un saka, ka ir no jūsu bankas. Ko jūs darāt?', options: [
            {t: 'Nolieku klausuli un zvanu uz 159, lai droši sazinātos ar savu banku', ok: true, why: 'Tieši tā. Vienmēr varat nolikt klausuli un atzvanīt uz numuru, kam uzticaties. 159 savieno jūs ar jūsu pašu banku.'},
            {t: 'Daru, ko viņi saka, tā ir banka', why: 'Krāpnieki visu laiku uzdodas par bankām, un numuru var viltot. Nolieciet klausuli un zvaniet uz 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Lieliski!</strong> Jūs protat atbildēt uz zvanu, izmantot skaļruni, nolikt klausuli un atzvanīt uz neatbildētajiem zvaniem.'},
    ], {});

    function smsList(p) {
        return app(p, 'Ziņas', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Jūsu pēdējā pārbaude bija martā. Pierakstieties tiešsaistē vai zvaniet mums.</span><small>pirms 3 mēnešiem</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Īsziņa', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Īsziņas ir lietotnē <strong>Ziņas</strong>. <strong>Pieskarieties Ziņas.</strong>', hint: 'Tā ir runas burbuļa ikona.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Jaunās ziņas ir treknrakstā. <strong>Pieskarieties zobārsta ziņai,</strong> lai to izlasītu.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Vispirms ziņas lodziņā ierakstiet Y, tad pieskarieties sūtīšanas bultiņai.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Zobārsts lūdz apstiprināt, atbildot <strong>Y</strong>. <strong>Pieskarieties ziņas lodziņam, ierakstiet Y, tad pieskarieties sūtīšanas bultiņai</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Gatavs! Tagad sakārtojiet: <strong>turiet nospiestu veco ziņu</strong> augšā (vienu vai divas sekundes turiet uz tās pirkstu).', hint: 'Turiet pirkstu uz vecās ziņas augšā, līdz parādās izvēlne.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Parādās izvēlne. <strong>Pieskarieties Dzēst.</strong>',
         hints: {copy: 'Kopēt nokopē vārdus. Pieskarieties Dzēst.', forward: 'Pārsūtīt nosūta to kādam citam. Pieskarieties Dzēst.'}},
        {screen: c => smsChat(p, c), question: {q: 'Īsziņā no nezināma numura teikts, ka jūsu sūtījums ir aizturēts, un lūgts samaksāt £1.45, izmantojot saiti. Ko jūs darāt?', options: [
            {t: 'Nepieskaros saitei. Pārsūtu to uz 7726 un tad izdzēšu', ok: true, why: 'Tieši tā. 7726 ir bez maksas un ziņo par to jūsu operatoram. Kurjeri neraksta īsziņas ar saitēm, kurās prasa maksu.'},
            {t: 'Samaksāju, tie ir tikai £1.45', why: 'Šie £1.45 ir ēsma, lai izvilinātu jūsu kartes datus. Nepieskarieties saitei: pārsūtiet to uz 7726 un izdzēsiet.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs protat lasīt un atbildēt uz īsziņām un dzēst tās, kas nav vajadzīgas.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Kartes', 15], ['WhatsApp', 9], ['Kamera', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Akumulators', [{id: 'low-power', label: 'Zemas jaudas režīms', toggle: saver, sub: 'Samazina fona darbību, līdz varat pilnībā uzlādēt.'}, {caption: 'AKUMULATORA IZMANTOJUMS PĒC LIETOTNĒM'}], {back: 'Iestatījumi', top: head, bottom: apps})
            : list(p, 'Akumulators', [{id: 'low-power', label: 'Akumulatora taupītājs', toggle: saver, sub: 'Izslēdz dažas funkcijas, lai akumulators kalpotu ilgāk.'}, {caption: 'Akumulatora izmantojums'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Akumulators drīz izlādēsies? <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Pieskarieties Akumulators.</strong>', hint: p === 'ios' ? 'Akumulators ir trešajā grupā.' : 'Akumulators ir sarakstā pēc Paziņojumiem.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Atlicis 23%. <strong>${p === 'ios' ? 'Zemas jaudas režīms' : 'Akumulatora taupītājs'}</strong> to pagarina. <strong>Pieskarieties tam, lai to ieslēgtu.</strong> Akumulatora simbols kļūst ${p === 'ios' ? 'yellow' : 'orange'}, lai jums atgādinātu.`},
        {screen: c => batteryPage(p, c), question: {q: 'Sarakstā redzams, ka Facebook šodien izmantoja visvairāk akumulatora. Kas palīdz akumulatoram kalpot visilgāk?', options: [
            {t: 'Samazināt ekrāna spilgtumu un aizvērt lietotnes, ar kurām esat beiguši', ok: true, why: 'Jā. Ekrāns patērē visvairāk enerģijas. Samaziniet spilgtumu, un lietotnes, piemēram, Facebook un YouTube, patērē daudz.'},
            {t: 'Uzlādēt līdz 100% katru stundu', why: 'Biežā uzlāde nekaitē, bet neliek akumulatoram kalpot ilgāk. Samaziniet spilgtumu un izmantojiet akumulatora taupīšanas režīmu.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Lieliski!</strong> Akumulatora taupīšana ir ieslēgta, un jūs zināt, kuras lietotnes patērē visvairāk enerģijas.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'mobilais · 3 zvani' : 'Iespējams surogātzvans · 3 zvani'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Nesenie', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>mobilais</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>mobilais</small><span>Vakar</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Jums atkal un atkal zvana viens un tas pats nezināms numurs. Bloķēsim to. <strong>Atveriet lietotni Tālrunis.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `Nesenajos zvanos <strong>pieskarieties ⓘ</strong> blakus numuram 07700 900842${p === 'android' ? ' (dažos Android tālruņos pieskarieties pašam numuram)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Kopīgot kontaktu'}, {id: 'block', label: p === 'ios' ? 'Bloķēt šo zvanītāju' : 'Bloķēt/ziņot par surogātu', danger: true}], {back: 'Nesenie'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Bloķēt šo zvanītāju' : 'Bloķēt/ziņot par surogātu'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Bloķēt šo zvanītāju?', 'Jūs nesaņemsiet zvanus, ziņas vai FaceTime no cilvēkiem, kas ir jūsu bloķēto sarakstā.', [['cancel', 'Atcelt'], ['confirm', 'Bloķēt kontaktu']])
            : dialog(p, 'Bloķēt 07700 900842?', '⟦square-check⟧ Ziņot par zvanu kā surogātu', [['cancel', 'Atcelt'], ['confirm', 'Bloķēt']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Bloķēt kontaktu' : 'Bloķēt'}.</strong>${p === 'android' ? ' Ja atstājat atzīmētu “Ziņot par zvanu kā surogātu”, tas palīdz brīdināt citus.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Bloķēts! Varat arī <strong>apklusināt visus zvanus no nepazīstamiem numuriem</strong>. <strong>Pieskarieties Iestatījumi.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Ritiniet līdz apakšai un <strong>pieskarieties Lietotnes</strong>.'},
            {screen: () => list(p, 'Lietotnes', [{id: 'app-phone', label: 'Tālrunis'}, {id: 'app-messages', label: 'Ziņas'}, {id: 'app-mail', label: 'Pasts'}], {back: 'Iestatījumi'}), target: 'app-phone', say: '<strong>Pieskarieties Tālrunis.</strong>'},
            {screen: c => list(p, 'Tālrunis', [{id: 'silence', label: 'Apklusināt nezināmos zvanītājus', toggle: !!c.silence}, {id: 'blocked', label: 'Bloķētie kontakti', value: '1'}], {back: 'Lietotnes'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Ieslēdziet Apklusināt nezināmos zvanītājus.</strong> Zvani no numuriem, kas nav jūsu kontaktos, nonāk tieši balss pastā un joprojām redzami nesenajos zvanos.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Bloķēts! Varat arī <strong>filtrēt surogātzvanus</strong>. <strong>Pieskarieties trim punktiem ⋮</strong> augšā labajā pusē.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Pieskarieties Iestatījumi.</strong>'},
            {screen: () => list(p, 'Iestatījumi', [{id: 'caller-id', label: 'Zvanītāja ID un surogātzvani'}, {id: 'blocked', label: 'Bloķētie numuri'}, {id: 'sounds', label: 'Skaņas un vibrācija'}]), target: 'caller-id', say: '<strong>Pieskarieties Zvanītāja ID un surogātzvani.</strong>'},
            {screen: c => list(p, 'Zvanītāja ID un surogātzvani', [{id: 'caller-show', label: 'Rādīt zvanītāja un surogātzvanu ID', toggle: true}, {id: 'silence', label: 'Filtrēt surogātzvanus', toggle: !!c.silence, sub: 'Iespējamie surogātzvani nezvanīs jūsu tālrunim'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Ieslēdziet Filtrēt surogātzvanus.</strong> Iespējami krāpnieciski zvani nezvanīs jūsu tālrunim.'},
        ]),
        {screen: c => list(p, 'Gatavs', [{label: 'Bloķētie numuri', value: '1'}, {label: p === 'ios' ? 'Apklusināt nezināmos zvanītājus' : 'Filtrēt surogātzvanus', toggle: true}]),
         question: {q: 'Vai nezināmo zvanītāju apklusināšana nozīmē, ka varat nokavēt īstu zvanu, piemēram, no slimnīcas vai piegādātāja?', options: [
            {t: 'Jā, tāpēc ik palaikam pārbaudiet balss pastu un neatbildētos zvanus', ok: true, why: 'Tieši tā. Īsti zvanītāji parasti atstāj ziņu, un neatbildētie zvani joprojām redzami jūsu sarakstā.'},
            {t: 'Nē, viņi vienmēr tiks cauri', why: 'Nezināmie numuri nonāk balss pastā, arī īstie. Laiku pa laikam pārbaudiet balss pastu un neatbildētos zvanus.'}]}},
        {screen: () => list(p, 'Gatavs', [{label: 'Bloķētie numuri', value: '1'}, {label: p === 'ios' ? 'Apklusināt nezināmos zvanītājus' : 'Filtrēt surogātzvanus', toggle: true}]), done: true,
         say: '<strong>Lieliski!</strong> Jūs esat bloķējuši traucējošu numuru un samazinājuši krāpniecisko zvanu skaitu.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: jūsu sūtījums ir aizturēts neapmaksātas £1.45 maksas dēļ. Samaksājiet tagad, lai pārplānotu: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Kam: ${field('fwdto', 'Numurs', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Paldies. Lūdzu, atsūtiet tālruņa numuru, no kura nāca krāpnieciskā īsziņa.</span><small>tikko</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Paldies, jūsu ziņojums ir saņemts.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Jauna ziņa') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Īsziņa', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Vairāk… tad Pārsūtīt' : 'Pārsūtīt'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Jūs esat saņēmuši krāpniecisku īsziņu, kas uzdodas par Royal Mail. Pirms to dzēšat, bez maksas par to paziņojiet. <strong>Atveriet Ziņas.</strong>'},
        {screen: () => app(p, 'Ziņas', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Pieskarieties ziņai,</strong> lai to atvērtu. Nepieskarieties tajā esošajai saitei!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Turiet nospiestu ziņu</strong> (turiet uz tās pirkstu), līdz parādās izvēlne. Nepieskarieties saitei.', hint: 'Vienu vai divas sekundes turiet pirkstu uz pelēkā ziņas burbuļa.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Pieskarieties Vairāk…,</strong> tad pārsūtīšanas bultiņai (šeit viena poga dara abus).' : '<strong>Pieskarieties Pārsūtīt.</strong> (Dažos tālruņos tā ir zem trim punktiem ⋮ augšā.)',
         hints: {delete: 'Vispirms par to paziņojiet, tad varēsiet to dzēst.', copy: 'Pieskarieties Pārsūtīt, lai to nosūtītu uz 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'Lodziņā “Kam” ierakstiet 7726 (uz tālruņa tastatūras tas veido vārdu SPAM), tad pieskarieties sūtīšanai.',
         action: c => { c.sent7726 = true; }, say: 'Lodziņā <strong>Kam</strong> ierakstiet <strong>7726</strong>. (Uz tastatūras tas veido S-P-A-M.) Tad <strong>pieskarieties sūtīšanai</strong> ⟦send-horizontal⟧. Tas ir bez maksas.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Ierakstiet krāpnieka numuru 07700 900911, tad pieskarieties sūtīšanai.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 atbild, jautājot, no kura numura nāca krāpšana. <strong>Ierakstiet 07700 900911</strong> un <strong>pieskarieties sūtīšanai</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Jūs esat par to paziņojuši. Ko tagad darīt ar krāpniecisko īsziņu?', options: [
            {t: 'Izdzēst to un bloķēt numuru', ok: true, why: 'Jā. Par to ir paziņots, tāpēc varat to dzēst. Bloķēšana neļauj saņemt vairāk īsziņu no šī numura.'},
            {t: 'Pieskarties saitei, lai pārbaudītu, vai tā ir īsta', why: 'Nekad nepieskarieties saitēm krāpnieciskās īsziņās. Izdzēsiet to un bloķējiet numuru.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs esat paziņojuši par krāpniecisku īsziņu uz 7726, kas palīdz operatoriem to bloķēt visiem. Krāpnieciskie e-pasti jānosūta uz report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Atjauninājumi novērš drošības problēmas, tāpēc tie ir svarīgi. Vispirms pievienojiet tālruni lādētājam un izveidojiet savienojumu ar Wi-Fi. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Pieskarieties Vispārīgi.</strong>'},
        {screen: () => list(p, 'Vispārīgi', [{id: 'about', label: 'Par'}, {id: 'software', label: 'Programmatūras atjaunināšana', value: '1'}, {id: 'storage', label: 'iPhone krātuve'}], {back: 'Iestatījumi'}), target: 'software', say: '<strong>Pieskarieties Programmatūras atjaunināšana.</strong> Sarkanais 1 nozīmē, ka gaida atjauninājums.'},
        {screen: () => list(p, 'Programmatūras atjaunināšana', [{id: 'auto', label: 'Automātiskie atjauninājumi', value: 'Izslēgts'}], {back: 'Vispārīgi',
            bottom: '<div class="hu"><strong>iOS atjauninājums</strong><p>Šis atjauninājums ietver svarīgus drošības labojumus, un to iesaka visiem lietotājiem.</p><button type="button" class="ce co" data-tap="update-now">Atjaunināt tūlīt</button></div>'}),
         target: 'update-now', say: '<strong>Pieskarieties Atjaunināt tūlīt.</strong>', hints: {auto: 'Pēc tam ir vērts ieslēgt arī automātiskos atjauninājumus. Vispirms pieskarieties Atjaunināt tūlīt.'}},
        {screen: c => codeScreen(p, c, 'Ievadiet piekļuves kodu', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone prasa jūsu piekļuves kodu. <strong>Ierakstiet vingrināšanās kodu 4 7 1 9 3 6.</strong>', hint: 'Ierakstiet 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Programmatūras atjaunināšana', [], {back: 'Vispārīgi', bottom: `<div class="hu"><strong>${c.busy ? 'Lejupielādē…' : 'Gatavs instalēšanai'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Vispirms tas lejupielādējas, kas var aizņemt dažas minūtes. Tad <strong>pieskarieties Instalēt tūlīt</strong>. Tālrunis restartējas, tāpēc dariet to, kad tas jums nebūs vajadzīgs 15 līdz 30 minūtes.'},
        {screen: () => list(p, 'Programmatūras atjaunināšana', [{id: 'auto', label: 'Automātiskie atjauninājumi', value: 'Ieslēgta'}], {back: 'Vispārīgi', bottom: '<div class="hu"><strong>Jūsu iPhone ir atjaunināts</strong></div>'}),
         question: {q: 'Vai ir vērts ieslēgt automātiskos atjauninājumus?', options: [
            {t: 'Jā, tad tas atjauninās naktī, kamēr lādējas', ok: true, why: 'Tieši tā. Iestatījumi > Vispārīgi > Programmatūras atjaunināšana > Automātiskie atjauninājumi. Tas instalējas naktī, kad tālrunis ir pievienots lādētājam un Wi-Fi tīklā.'},
            {t: 'Nē, atjauninājumi nav obligāti', why: 'Atjauninājumi novērš drošības caurumus, ko izmanto krāpnieki. Automātiskie atjauninājumi pasargā jūs, nevajadzot par tiem atcerēties.'}]}},
        {screen: () => list(p, 'Programmatūras atjaunināšana', [], {bottom: '<div class="hu"><strong>Jūsu iPhone ir atjaunināts ⟦check⟧</strong></div>'}), done: true, say: '<strong>Lieliski!</strong> Jūsu tālrunis ir atjaunināts un aizsargāts pret jaunākajām problēmām.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Atjauninājumi novērš drošības problēmas, tāpēc tie ir svarīgi. Vispirms pievienojiet tālruni lādētājam un izveidojiet savienojumu ar Wi-Fi. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Ritiniet uz leju un <strong>pieskarieties Sistēma</strong>. <em>Samsung tālrunī tā ir Programmatūras atjaunināšana netālu no apakšas.</em>'},
        {screen: () => list(p, 'Sistēma', [{id: 'languages', label: 'Valodas'}, {id: 'date', label: 'Datums un laiks'}, {id: 'software', label: 'Programmatūras atjauninājumi', sub: 'Pieejams atjauninājums'}]), target: 'software', say: '<strong>Pieskarieties Programmatūras atjauninājumi.</strong>'},
        {screen: () => list(p, 'Programmatūras atjauninājumi', [{id: 'system-update', label: 'Sistēmas atjauninājums', sub: 'Pieejams atjauninājums'}, {id: 'play-update', label: 'Google Play sistēmas atjauninājums'}]), target: 'system-update', say: '<strong>Pieskarieties Sistēmas atjauninājums.</strong>'},
        {screen: () => list(p, 'Sistēmas atjauninājums', [], {bottom: '<div class="hu"><strong>Pieejams sistēmas atjauninājums</strong><p>Ietver svarīgus drošības labojumus.</p><button type="button" class="ce dk" data-tap="download">Lejupielādēt un instalēt</button></div>'}),
         target: 'download', say: '<strong>Pieskarieties Lejupielādēt un instalēt.</strong>'},
        {screen: c => list(p, 'Sistēmas atjauninājums', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Lejupielādē un instalē…' : 'Restartējiet, lai pabeigtu'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Tas lejupielādējas un sagatavojas, kas var aizņemt laiku. Tad <strong>pieskarieties Restartēt tūlīt</strong>. Tālrunis izslēdzas un atkal ieslēdzas, kas aizņem dažas minūtes.'},
        {screen: () => list(p, 'Sistēmas atjauninājums', [], {bottom: '<div class="hu"><strong>Jūsu sistēma ir atjaunināta</strong></div>'}),
         question: {q: 'Jūsu tālrunis jau gadiem nav saņēmis atjauninājumu. Ko tas varētu nozīmēt?', options: [
            {t: 'Tas var būt par vecu, lai saņemtu drošības atjauninājumus, tāpēc tas ir mazāk drošs', ok: true, why: 'Jā. Vecāki tālruņi pārstāj saņemt atjauninājumus. Neveiciet tajos bankas darījumus un, kad vien varat, apsveriet nomaiņu.'},
            {t: 'Tas darbojas lieliski', why: 'Tālruņi pēc dažiem gadiem pārstāj saņemt atjauninājumus, un drošības caurumi paliek nelabotas.'}]}},
        {screen: () => list(p, 'Sistēmas atjauninājums', [], {bottom: '<div class="hu"><strong>Jūsu sistēma ir atjaunināta ⟦check⟧</strong></div>'}), done: true, say: '<strong>Lieliski!</strong> Jūsu tālrunis ir atjaunināts un aizsargāts pret jaunākajām problēmām.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (meita)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Medicīniskais ID' : 'Medicīniskā informācija', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'piem., 2. tipa cukura diabēts', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'piem., penicilīns', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Rādīt, kad bloķēts</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gatavs' : 'Saglabāt'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Izvēlieties kontaktu</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Veselība', '#fff', ICON2.health]]), target: 'health', say: '<strong>Medicīniskais ID</strong> ļauj mediķiem redzēt jūsu alerģijas un ārkārtas kontaktpersonu, pat ja tālrunis ir bloķēts. <strong>Atveriet lietotni Veselība.</strong>'},
            {screen: () => app(p, 'Kopsavilkums', '<p class="cf">Šeit tiek rādīti jūsu veselības dati.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Pieskarieties savam attēlam</strong> augšā labajā pusē.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Veselības dati'}, {id: 'medical', label: 'Medicīniskais ID'}], {back: 'Kopsavilkums'}), target: 'medical', say: '<strong>Pieskarieties Medicīniskais ID.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Tālrunī var glabāt <strong>medicīnisko informāciju</strong>, ko mediķi var redzēt, pat ja tas ir bloķēts. <strong>Pieskarieties Iestatījumi.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Ritiniet uz leju un <strong>pieskarieties Drošība un ārkārtas situācijas</strong>. <em>Samsung tālrunī tas ir Drošība un ārkārtas situācijas.</em>'},
            {screen: () => list(p, 'Drošība un ārkārtas situācijas', [{id: 'medical', label: 'Medicīniskā informācija'}, {id: 'contacts-ec', label: 'Ārkārtas kontaktpersonas'}, {id: 'sos', label: 'Ārkārtas SOS'}]), target: 'medical', say: '<strong>Pieskarieties Medicīniskā informācija.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Vispirms ierakstiet alerģiju (vingrinājumam “Penicilīns”), tad pievienojiet ārkārtas kontaktpersonu.',
         say: 'Aizpildiet visu, kas mediķiem būtu jāzina. Vingrinājumam sadaļā alerģijas ierakstiet <strong>Penicilīns</strong>. Tad <strong>pieskarieties ārkārtas kontaktpersonas pievienošanai</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Izvēlieties, kam zvanīt ārkārtas situācijā. <strong>Pieskarieties Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '“Rādīt, kad bloķēts” ir ieslēgts, tāpēc mediķi to var redzēt. <strong>Pieskarieties Gatavs.</strong>' : '<strong>Pieskarieties Saglabāt.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Medicīniskais ID' : 'Medicīniskā informācija', [{label: 'Alerģijas', sub: typed(c, 'allergies')}, {label: 'Ārkārtas kontaktpersona', sub: 'Sarah (meita)'}]),
         question: {q: p === 'ios' ? 'Kā mediķis redzētu jūsu Medicīnisko ID, ja tālrunis ir bloķēts?' : 'Kā mediķis to redzētu, ja tālrunis ir bloķēts?', options: [
            {t: 'Caur pogu “Ārkārtas” bloķētajā ekrānā', ok: true, why: 'Jā. Pieskaroties pogai Ārkārtas bloķētajā ekrānā, tiek parādīta jūsu medicīniskā informācija, neatbloķējot tālruni.'},
            {t: 'Viņi nevar', why: 'Var: to parāda poga Ārkārtas bloķētajā ekrānā, un piekļuves kods nav vajadzīgs.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Medicīniskais ID' : 'Medicīniskā informācija', [{label: 'Alerģijas', sub: typed(c, 'allergies')}, {label: 'Ārkārtas kontaktpersona', sub: 'Sarah (meita)'}]), done: true,
         say: '<strong>Lieliski!</strong> Jūsu medicīniskā informācija un ārkārtas kontaktpersona ir saglabāta. Ja izsaucat palīdzību ar Ārkārtas SOS, jūsu ārkārtas kontaktpersona tiek informēta arī.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Find My' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Atskaņo skaņu…' : '⟦volume-2⟧ Atskaņot skaņu'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Atzīmēt kā pazudušu' : 'Nodrošināt ierīci'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Ja tālrunis kādreiz pazustu, varat to atrast, likt tam zvanīt vai to bloķēt, taču tikai tad, ja tas ir ieslēgts jau iepriekš. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Pieskarieties savam vārdam</strong> augšā.'},
            {screen: () => list(p, 'Apple Account', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Find My'}, {id: 'family', label: 'Ģimenes koplietošana'}], {back: 'Iestatījumi'}), target: 'findmy', say: '<strong>Pieskarieties Find My.</strong>'},
            {screen: c => list(p, 'Find My', [{id: 'find-toggle', label: 'Find My iPhone', toggle: !!c.findOn}, {label: 'Nosūtīt pēdējo atrašanās vietu', toggle: !!c.findOn}], {back: 'Apple Account'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Ieslēdziet Find My iPhone.</strong> “Nosūtīt pēdējo atrašanās vietu” nosūta tālruņa atrašanās vietu tieši pirms akumulators izlādējas.'},
            {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Tagad iedomājieties, ka nevarat atrast tālruni. Citā Apple ierīcē atvērtu <strong>Find My</strong> (vai datorā atvērtu icloud.com/find). Šeit <strong>pieskarieties Find My</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Ritiniet uz leju un <strong>pieskarieties Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Visi pakalpojumi'}, {id: 'account', label: 'Pārvaldiet savu Google kontu'}]), target: 'all-services', say: '<strong>Pieskarieties Visi pakalpojumi.</strong>'},
            {screen: () => list(p, 'Visi pakalpojumi', [{id: 'find-hub', label: 'Find Hub', sub: 'Iepriekš saucās Find My Device'}, {id: 'theft', label: 'Aizsardzība pret zādzību'}]), target: 'find-hub', say: '<strong>Pieskarieties Find Hub</strong> (agrāk tas saucās Find My Device). <em>Samsung ir arī savs: Iestatījumi &gt; Drošība un konfidencialitāte &gt; Pazaudētas ierīces aizsardzība.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Izmantot Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Ieslēdziet Izmantot Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Tagad iedomājieties, ka nevarat atrast tālruni. Citā tālrunī vai planšetē atvērtu <strong>Find Hub</strong> vai datorā atvērtu google.com/android/find. Šeit <strong>pieskarieties Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Lūk, tas ir kartē. Ja tas ir tuvumā, piemēram, aiz dīvāna malas, <strong>pieskarieties Atskaņot skaņu</strong>: tas skaļi zvana, pat ja ir klusuma režīmā.'},
        {screen: c => findMap(p, c), question: {q: 'Karte rāda jūsu tālruni vietā, kur jūs nekad neesat bijuši. Ko darīt?', options: [
            {t: 'Izmantot Atzīmēt kā pazudušu vai Nodrošināt ierīci, lai to bloķētu, un sazināties ar policiju', ok: true, why: 'Jā. Bloķējiet to no Find My vai Find Hub, pats uz turieni neejiet un paziņojiet policijai un savam operatoram.'},
            {t: 'Pašam aiziet un to atgūt', why: 'Nekad nekonfrontējiet zagli. Bloķējiet tālruni attālināti un sazinieties ar policiju.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Lieliski!</strong> Tālruņa atrašana ir ieslēgta, un jūs zināt, kā likt tam zvanīt vai to bloķēt.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Bezmaksas tehnoloģiju padomi</strong>${UI.qr}<small>Noskenējiet mani</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Dzēst šo fotoattēlu?', p === 'ios' ? 'Tas tiks glabāts sadaļā Nesen dzēstie 30 dienas.' : 'Tas kādu laiku tiks glabāts atkritnē, pirms pazudīs pavisam.', [['cancel', 'Atcelt'], ['confirm-delete', 'Dzēst']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Atveriet Kameru.</strong> <em>Padoms: lielākajā daļā tālruņu varat arī pavilkt pa kreisi bloķētajā ekrānā.</em>', hint: 'Kamera ir pelēka ikona ar fotoaparātu.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Vērsiet to uz ziediem un turiet mierīgi. <strong>Pieskarieties lielajai apaļajai pogai</strong>, lai uzņemtu fotoattēlu.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Klik! Tas ir saglabāts. <strong>Pieskarieties mazajam attēlam</strong> stūrī, lai to apskatītu.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Lai apskatītu tuvāk, uzlieciet uz fotoattēla divus pirkstus un izpletiet tos. Šeit <strong>divreiz pieskarieties ＋</strong>.', hint: 'Pieskarieties ＋ augšā labajā pusē.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Jauki! Lai to kādam nosūtītu, <strong>pieskarieties kopīgošanas pogai</strong> ⇪ (kaste ar bultiņu).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Izvēlieties, kā to nosūtīt: Ziņas, e-pasts, WhatsApp un tā tālāk. <strong>Pieskarieties Ziņas.</strong> (Pēc tam izvēlētos, kam to sūtīt.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Nosūtīts! Ja uzņemat fotoattēlu, kas jums nepatīk, <strong>pieskarieties atkritnei</strong> ⟦trash-2⟧, lai to izdzēstu.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Tālrunis vispirms pārjautā. <strong>Pieskarieties Dzēst.</strong>'},
        {screen: () => app(p, 'Fotoattēli', '<p class="cf">Fotoattēlu vēl nav.</p>', {back: false, color: '#fff'}), question: {q: 'Jūs kļūdas pēc izdzēsāt fotoattēlu! Ko darīt?', options: [
            {t: p === 'ios' ? 'Atvērt Albumi > Nesen dzēstie un to atgūt' : 'Atvērt Atkritni (Bibliotēka > Atkritne) un to atjaunot', ok: true, why: 'Jā. Izdzēstie fotoattēli kādu laiku tiek glabāti, parasti apmēram mēnesi, tāpēc varat tos atgūt.'},
            {t: 'Neko, tas ir pazudis uz visiem laikiem', why: 'Neuztraucieties! Tas kādu laiku tiek glabāts sadaļā Nesen dzēstie (iPhone) vai Atkritnē (Android).'}]}},
        {screen: () => app(p, 'Fotoattēli', '<p class="cf">Viss gatavs.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Lieliski!</strong> Jūs protat uzņemt, pietuvināt, kopīgot un dzēst fotoattēlus.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Ja arī jūsu ģimenei ir iPhone, <strong>FaceTime</strong> ļauj bez maksas veikt video zvanus. <strong>Pieskarieties FaceTime.</strong>' : '<strong>Google Meet</strong> ļauj bez maksas veikt video zvanus no Android, arī uz iPhone. <strong>Pieskarieties Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Jauns FaceTime' : 'Jauns'}</button><p class="cf">Šeit parādās nesenie zvani.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Jauns FaceTime' : 'Jauns'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Jauns FaceTime' : 'Zvanīt', `<div class="xz">To: ${field('callto', 'Vārds vai numurs', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Videozvans'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Vispirms lodziņā “Kam” ierakstiet Sarah.',
             say: 'Ierakstiet kāda sava kontakta vārdu. <strong>Ierakstiet Sarah</strong>, tad <strong>pieskarieties video pogai</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Tas zvana, tad Sarah atbild. Lai viņai parādītu dārzu, <strong>pieskarieties apgriešanas pogai</strong> ⟦switch-camera⟧, lai izmantotu aizmugures kameru.', hint: 'Pagaidiet, līdz Sarah atbild, tad pieskarieties ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Kad esat beiguši, <strong>pieskarieties sarkanajai pogai</strong>, lai nolikti klausuli.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Video · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'Jūsu draugam ir Android tālrunis, bet jums iPhone. Vai joprojām varat veikt video zvanu?', options: [
                {t: 'Jā, izmantojot WhatsApp vai Google Meet, kas darbojas abos', ok: true, why: 'Tieši tā. FaceTime galvenokārt ir no iPhone uz iPhone. WhatsApp un Google Meet darbojas abos.'},
                {t: 'Nē, nekad', why: 'Varat: WhatsApp un Google Meet darbojas abu veidu tālruņos.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Viss gatavs.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Lieliski!</strong> Jūs esat veikuši video zvanu un parādījuši skatu no aizmugures kameras.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR kodi ir tie kvadrātveida melnbaltie raksti uz plakātiem un ēdienkartēm. Kamera tos var nolasīt, papildu lietotne nav vajadzīga. <strong>Atveriet Kameru.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Vērsiet kameru uz kodu un mirkli turiet mierīgi. <strong>Ekrānā parādās saite</strong>: pārbaudiet, vai tā izskatās kā no tā, no kā to gaidāt, tad <strong>pieskarieties tai</strong>.',
         hints: {shutter: 'Fotoattēls nav jāuzņem: vienkārši vērsiet kameru un pagaidiet, līdz parādās saite, tad pieskarieties saitei.'},
         hint: p === 'android' ? 'Pagaidiet, līdz parādās saite, tad pieskarieties tai. Ja nekas neparādās, izmēģiniet Google Lens.' : 'Pagaidiet, līdz parādās saite, tad pieskarieties tai.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Bezmaksas tehnoloģiju padomi</h3><p>Vienkārši padomi par tālruņiem, datoriem un drošību internetā.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Redzat QR koda uzlīmi uz autostāvvietas maksājumu automāta. Kā drošāk samaksāt?', options: [
            {t: 'Izmantot autostāvvietas oficiālo lietotni vai automātu, nevis uzlīmētu QR kodu', ok: true, why: 'Jā. Krāpnieki uzlīmē viltus QR kodus virs īstajiem, lai nozagtu kartes datus. Pārbaudiet, vai tā ir uzlīme, un izmantojiet oficiālo lietotni vai zīmi.'},
            {t: 'Noskenēt un samaksāt, tas ir ātrāk', why: 'Viltus QR uzlīmes uz autostāvvietu automātiem ir zināma krāpšana. Izmantojiet oficiālo lietotni vai pašu automātu.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Bezmaksas tehnoloģiju padomi</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Lieliski!</strong> Jūs protat skenēt QR kodus ar kameru un zināt, ka vispirms jāpārbauda saite.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Fotoattēli no svētdienas 📷', 'Sveika, mamm, šeit ir fotoattēli no pusdienām…'],
                       ['tv', 'TV Licensing', 'Jūsu licencei ir BEIDZIES TERMIŅŠ', 'Rīkojieties tūlīt, lai izvairītos no kriminālvajāšanas. Atjauniniet savu maksājumu…'],
                       ['library', 'Bridlington Library', 'Jūsu grāmatām beidzas termiņš', 'Jūsu grāmatas jāatdod piektdien.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Iesūtne' : 'Galvenā', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · man</p><h3>Fotoattēli no svētdienas 📷</h3><p>Sveika, mamm, šeit ir fotoattēli no pusdienām. Tik jauki bija tevi satikt! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Uzrakstiet atbildi…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Jūsu licencei ir BEIDZIES TERMIŅŠ</h3><p>Rīkojieties tūlīt, lai izvairītos no kriminālvajāšanas. Atjauniniet maksājuma datus 24 stundu laikā: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Pārvietot uz surogātpastu' : '⋮ Ziņot par pikšķerēšanu'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Pasts' : 'jūsu e-pasta lietotne (Gmail lielākajā daļā Android tālruņu)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Jaunie e-pasti ir treknrakstā. <strong>Pieskarieties Sarah e-pastam,</strong> lai to izlasītu.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Lai atbildētu, <strong>pieskarieties Atbildēt</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Vispirms uzrakstiet īsu atbildi, tad pieskarieties Sūtīt.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Uzrakstiet īsu atbildi</strong> (piemēram, “Paldies, tās ir burvīgas!”) un <strong>pieskarieties Sūtīt</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Nosūtīts ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Atpakaļ uz iesūtni</button>', {color: '#fff'}), target: 'back', say: '<strong>Pieskarieties Atpakaļ,</strong> lai atgrieztos iesūtnē.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Ir satraucošs e-pasts no “TV Licensing”. <strong>Atveriet to,</strong> bet nepieskarieties nekam tajā.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Krāpnieciskie e-pasti bieži izmanto īstu nosaukumu, bet viltotu adresi. <strong>Pieskarieties sūtītāja vārdam,</strong> lai redzētu īsto e-pasta adresi.',
         hint: 'Pieskarieties “TV Licensing” e-pasta augšā.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Tas ir no <strong>outlook-mail.com</strong>, nevis tvlicensing.co.uk. Tā ir krāpšana. <strong>Pieskarieties ' + (p === 'ios' ? 'Pārvietot uz surogātpastu' : 'Ziņot par pikšķerēšanu') + '.</strong> Krāpnieciskos e-pastus varat arī pārsūtīt uz report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Kas atklāja krāpšanu?', options: [
            {t: 'Sūtītāja īstā adrese, draudi un 24 stundu termiņš', ok: true, why: 'Tieši tā. Īstas organizācijas jums nedraud ar termiņiem, un to e-pasti nāk no to paša tīmekļa adreses.'},
            {t: 'Nekas, tas izskatījās īsts', why: 'Pārbaudiet sūtītāja adresi: tā nebija TV Licensing adrese. Draudi un saspringti termiņi arī ir lielas brīdinājuma pazīmes.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs protat lasīt e-pastus un atbildēt uz tiem, kā arī atpazīt krāpšanu un ziņot par to.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Iegūt' : 'Instalēt';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Pieskarieties Meklēt.</strong>' : '<strong>Pieskarieties meklēšanas joslai.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Mēs meklējām “NHS App”. Daudzu lietotņu nosaukumos ir “NHS”. Pārbaudiet, <strong>kas to izveidojis</strong>: īstā ir no <strong>NHS England</strong>. <strong>Pieskarieties ' + (p === 'ios' ? 'Iegūt' : 'Instalēt') + ' blakus īstajai.</strong>',
         hints: {'fake1-get': 'To izveidojis HealthApps Ltd, un tā ir reklāma. Īsto NHS App ir izveidojis NHS England.', 'fake2-get': 'To izveidojis QuickDev Apps, nevis NHS. Īsto ir izveidojis NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Instalēts! Tagad noņemiet lietotni, ko nekad nelietojat, lai sakārtotu un atbrīvotu vietu. <strong>Turiet nospiestu lietotni Laikapstākļi,</strong> līdz parādās izvēlne.', hint: 'Vienu vai divas sekundes turiet pirkstu uz ikonas Laikapstākļi.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Noņemt “Laikapstākļi”?' : 'Laikapstākļi', p === 'ios' ? 'Noņemot no sākuma ekrāna, lietotne paliks jūsu lietotņu bibliotēkā.' : '', p === 'ios'
            ? [['delete-app', 'Dzēst lietotni'], ['remove-home', 'Noņemt no sākuma ekrāna'], ['cancel', 'Atcelt']] : [['app-info', 'Informācija par lietotni'], ['delete-app', 'Atinstalēt'], ['cancel', 'Atcelt']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Pieskarieties Noņemt lietotni,</strong> tad <strong>Dzēst lietotni</strong> (šeit tā ir viena poga).' : '<strong>Pieskarieties Atinstalēt.</strong>',
         hints: {'remove-home': 'Tas tikai paslēpj ikonu; lietotne paliek jūsu tālrunī. Pieskarieties Dzēst lietotni.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Kāda lietotne prasa maksājumu, lai “atbloķētu” jūsu NHS ierakstus. Ko jūs domājat?', options: [
            {t: 'Tā nav īstā NHS App, kas ir pilnīgi bezmaksas', ok: true, why: 'Tieši tā. NHS App ir bezmaksas. Dzēsiet visu, kas prasa maksāt par NHS pakalpojumiem.'},
            {t: 'Maksāt, tas ir NHS vajadzībām', why: 'Īstā NHS App ir bezmaksas, un to ir izveidojis NHS England. Lietotne, kas prasa naudu, nav īstā.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Lieliski!</strong> Jūs protat atšķirt īstās lietotnes no līdzīgiem viltojumiem un noņemt lietotnes, kas nav vajadzīgas.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Laipni lūdzam atpakaļ.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Pieteikties ar Face ID' : 'Pieteikties ar pirkstu nospiedumu'}</button>
                <button type="button" class="cp" data-tap="password">Pieteikties ar e-pastu un paroli</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Recepšu zāles'], ['appointments', '⟦calendar⟧', 'Pieraksti'], ['records', '⟦clipboard-list⟧', 'Jūsu veselība'], ['messages', '⟦mail⟧', 'Ziņas']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Recepšu zāles', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Pasūtīt atkārtotu recepti</strong><small>Izvēlieties zāles, kas jums jau ir izrakstītas</small></button><div class="ck"><strong>Skatīt savus pasūtījumus</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipine 5 mg tabletes'], ['med-2', 'Atorvastatin 20 mg tabletes']];
            return app(p, 'Izvēlieties zāles', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Apstipriniet pasūtījumu', `<p class="cf">Amlodipine 5 mg tabletes<br>Saņemšana: jūsu norādītajā aptiekā</p><button type="button" class="ce co" data-tap="confirm">Apstiprināt un pasūtīt</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Pasūtījums nosūtīts', '<p class="cf">⟦check⟧ Jūsu receptes pieprasījums ir nosūtīts jūsu ģimenes ārsta praksei. Parasti tas aizņem 2 līdz 3 darbdienas.</p><button type="button" class="cp" data-tap="home">Atpakaļ uz sākumu</button>', {color: NHS});
        return app(p, 'Pieraksti', '<div class="fo"><div class="ck"><strong>Pieraksts pie ģimenes ārsta</strong><small>Otrdien plkst. 10:30 · Jūsu ģimenes ārsta prakse</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> ir bezmaksas, un ar to varat pasūtīt atkārtotas receptes, apskatīt pierakstus un vēl daudz ko. (Šī vingrināšanās versija ir izdomāta, izveidota tikai šai nodarbībai.) <strong>Pieskarieties NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Kad esat to iestatījuši ar NHS login, varat pieteikties ar savu ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Pieskarieties Pieteikties ar ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Tas der arī, taču seja vai pirkstu nospiedums ir ātrāks. Pieskarieties zilajai pogai.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Pieskarieties Recepšu zāles.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Pieskarieties Pasūtīt atkārtotu recepti.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Vispirms pieskarieties zālēm, lai tās atzīmētu, tad pieskarieties Turpināt.',
         say: '<strong>Pieskarieties zālēm, kas jums vajadzīgas,</strong> lai tās atzīmētu (izmēģiniet Amlodipine), tad <strong>pieskarieties Turpināt</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Pārbaudiet, vai viss pareizi, tad <strong>pieskarieties Apstiprināt un pasūtīt</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Nosūtīts jūsu ģimenes ārsta praksei! <strong>Pieskarieties Atpakaļ uz sākumu.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Varat arī pārbaudīt savus pierakstus. <strong>Pieskarieties Pieraksti.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Īsziņā rakstīts: “NHS: jums pienākas bezmaksas testa komplekts, ievadiet bankas datus, lai samaksātu par pasta nosūtīšanu”. Kas tas ir?', options: [
            {t: 'Krāpšana. NHS nekad neprasa bankas datus īsziņā', ok: true, why: 'Tieši tā. Izmantojiet NHS App vai sazinieties ar savu ģimenes ārsta praksi tieši, nekad ne ar īsziņās esošām saitēm.'},
            {t: 'Īsta, tie ir tikai pasta izdevumi', why: 'NHS nekad nesūta īsziņas, kurās prasa bankas datus. Tā ir krāpšana: pārsūtiet to uz 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Lieliski!</strong> Jūs esat pasūtījuši atkārtotu recepti un pārbaudījuši savus pierakstus.'},
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
        if (page === 'login') return app(p, 'Vingrināšanās banka', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Pieteikties ar Face ID' : 'Pieteikties ar pirkstu nospiedumu'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Jūsu konti', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Šodien'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Šodien'], ['txn-pension', 'State Pension', '+£921.60', 'Vakar'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Pirm.']];
            return app(p, 'Norēķinu konts', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Maksājums', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Šodien, 03:12 · Karte, kas beidzas ar 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Iesaldēt karti</strong><small>${ctx.frozen ? 'Karte iesaldēta ⟦check⟧' : 'Nekavējoties apturēt maksājumus'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Ziņot par šo maksājumu</strong><small>Neatpazīstat to? Pastāstiet mums</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Banka', BANK, ICON2.pound]]), target: 'bank',
         say: 'Bankas lietotnes ļauj jebkurā laikā pārbaudīt savu naudu. (Šī ir izdomāta banka vingrināšanai.) <strong>Atveriet lietotni Banka.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Pieteikties ar savu ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Nekad nedodiet nevienam savu bankas piekļuves kodu.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Pieskarieties savam Norēķinu kontam,</strong> lai redzētu, kas ienācis un izmaksāts.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Pārskatiet maksājumus. Vienu no tiem neatpazīstat: <strong>£249 plkst. 3 naktī dāvanu karšu vietnei</strong>. <strong>Pieskarieties tam.</strong>',
         hints: {'txn-tesco': 'Tie ir jūsu pirkumi. Meklējiet to, ko neatpazīstat.', 'txn-pension': 'Tā ir jūsu pensijas izmaksa. Meklējiet izņēmumu.', 'txn-water': 'Tas ir jūsu ūdens rēķins. Meklējiet izņēmumu.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Pieskarieties Iesaldēt karti</strong>. Tas nekavējoties aptur turpmākos maksājumus, un vēlāk varat to atsaldēt, ja izrādās, ka viss kārtībā.',
         hints: {report: 'Vispirms iesaldējiet karti, lai apturētu turpmākos maksājumus. Tad par to ziņojiet.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Jūs esat iesaldējuši karti. Kas tālāk?', options: [
            {t: 'Piezvanīt savai bankai uz 159 vai numuru uz kartes vai ziņot lietotnē', ok: true, why: 'Jā. Viņi var izmeklēt, atcelt karti un bieži atgūt naudu. Jo ātrāk jūs viņiem pastāstāt, jo labāk.'},
            {t: 'Pagaidīt un paskatīties, vai tas atkārtosies', why: 'Pastāstiet savai bankai nekavējoties. Jo ātrāk viņi uzzina, jo vairāk var paveikt.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Lieliski!</strong> Jūs pārbaudījāt savu kontu, pamanījāt maksājumu, ko neatpazināt, un iesaldējāt karti.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Vingrināšanās banka</strong><span>•••• 4421</span><small>DEBETA</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Maks' : 'Google Wallet', `<p class="cf">Pievienojiet karti, lai ar tālruni maksātu veikalos.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Pievienot karti' : '＋ Pievienot makam'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Pievienot karti', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Turiet karti kadrā…' : 'Karte atrasta ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Apstiprināt karti', `<p class="cf">Jūsu bankai jāpārbauda, vai tas esat jūs. Izvēlieties, kā saņemt kodu:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Īsziņa</strong><small>uz ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Piezvanīt savai bankai</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Ievadiet kodu', `<div class="jp ex"><strong>Ziņas · tikko</strong><span>Vingrināšanās banka: jūsu Wallet kods ir 529173. Nekad nedodiet to nevienam.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Maks' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Jūsu karte ir gatava lietošanai.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Turiet pie lasītāja…' : 'Turiet pie lasītāja…') : '⟦check⟧ Gatavs'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Maks' : 'Maks', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Maksāšana ar tālruni ir ātra un droša: veikali nekad neredz jūsu kartes numuru. <strong>Atveriet ${p === 'ios' ? 'Maks' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Pievienot karti' : '＋ Pievienot makam'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Tālrunis izmanto kameru, lai nolasītu jūsu karti, tāpēc numurs nav jāraksta. <strong>Turiet karti kadrā</strong>, tad <strong>pieskarieties Tālāk</strong>. <em>Nekad neierakstiet kartes numuru vietnē, uz kuru jūs novirza īsziņa vai e-pasts.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Jūsu banka pārbauda, vai tas patiešām esat jūs. <strong>Pieskarieties Īsziņa.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'No jūsu bankas pienāk kods īsziņā. <strong>Ierakstiet 5 2 9 1 7 3.</strong> Atcerieties: šo kodu raksta tikai savā tālrunī un nekad nedod nevienam, kas to prasa.', hint: 'Ierakstiet kodu no ziņas: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Jūsu karte ir gatava. Tagad samaksāsim veikalā. <strong>Pieskarieties jebkurā kartes vietā.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'Pie kases <strong>divreiz nospiediet sānu pogu</strong> savā iPhone (šeit divreiz pieskarieties ⟦power⟧), paskatieties ekrānā, lai darbotos Face ID, tad turiet tālruņa augšdaļu pie karšu lasītāja.', hint: 'Divreiz pieskarieties pogai ⟦power⟧ sānos.'}
            : {target: 'pay-now', say: 'Pie kases vienkārši <strong>atbloķējiet tālruni un turiet tā aizmuguri pie karšu lasītāja</strong>. Šeit <strong>pieskarieties karšu lasītājam</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Vai maksāšana ar tālruni ir droša?', options: [
            {t: 'Jā, drošāka nekā ar karti: vajag jūsu seju, pirkstu nospiedumu vai piekļuves kodu, un veikali neredz jūsu kartes numuru', ok: true, why: 'Tieši tā. Un, ja pazaudējat tālruni, neviens ar to nevar maksāt, neatbloķējot to.'},
            {t: 'Nē, to varētu izmantot ikviens', why: 'Katram maksājumam vajag jūsu seju, pirkstu nospiedumu vai piekļuves kodu, tāpēc tas patiesībā ir drošāk nekā bezkontakta karte.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Lieliski!</strong> Jūsu karte ir tālrunī, un jūs esat veikuši vingrināšanās maksājumu.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>DEBETA</small></div>', '<small>DEBETA</small></div></button>');
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
            return app(p, 'Vingrināšanās vilcieni', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Izvēlieties staciju'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Pievienot Railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Izvēlieties staciju</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Pievienot Railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Bez Railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Tiešais'], ['t-1145', '11:45', '12:32', 'Tiešais'], ['t-1245', '12:45', '13:32', 'Tiešais']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Cenas šim vingrinājumam ir izdomātas. Railcard atlaide piemērota.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Off-Peak Single</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Off-Peak Day Return</strong><small>Atgriezieties šodien</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Jūsu biļete', `<div class="adt"><strong>Off-Peak Day Return</strong><span>Bridlington ⇄ Hull</span><span>Šodien · Senior Railcard</span>
            ${UI.qr}<small>Noskenējiet to pie biļešu vārtiem vai parādiet konduktoram.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Vilcieni', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Vilcienu lietotnes ļauj nopirkt biļetes tālrunī bez rindas. (Šī vingrināšanās lietotne ir izdomāta: cenas un laiki ir izdomāti.) <strong>Atveriet Vilcieni.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Jūs dodaties no Bridlington. <strong>Pieskarieties Uz,</strong> lai izvēlētos, kurp dodaties.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Pieskarieties Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Vecāki par 60? <strong>Senior Railcard</strong> ļauj ietaupīt trešdaļu no lielākās daļas biļešu. <strong>Pieskarieties Railcard,</strong> lai pievienotu savu.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Pieskarieties Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Pieskarieties Atrast vilcienus.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Šeit ir vilcieni. <strong>Pieskarieties 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Atgriežaties šodien? Biļete turp un atpakaļ vienā dienā (day return) parasti ir lētāka par divām biļetēm vienā virzienā. <strong>Pieskarieties Off-Peak Day Return</strong>, tad maksājiet.',
         hints: {single: 'Single ir tikai vienā virzienā. Jūs atgriežaties šodien, tāpēc pieskarieties Off-Peak Day Return.', pay: 'Vispirms izvēlieties biļeti: pieskarieties Off-Peak Day Return.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Pieskarieties ${p === 'ios' ? 'Maksāt' : 'G Pay'},</strong> lai maksātu ar tālrunī esošo karti (no bezkontakta maksājumu nodarbības).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Pirms vilciena mājupceļā tālruņa akumulators ir gandrīz tukšs. Kas būtu laba ideja?', options: [
            {t: 'Uzņemt biļetes ekrānuzņēmumu un ieslēgt akumulatora taupīšanu', ok: true, why: 'Jā. Dažas biļetes der arī no ekrānuzņēmuma, un akumulatora taupīšana palīdz tam kalpot ilgāk. Daudzas lietotnes ļauj biļeti pievienot arī Makam.'},
            {t: 'Neko, viss būs labi', why: 'Ja tālrunis izslēdzas, biļeti nevarēsit uzrādīt. Uzņemiet ekrānuzņēmumu un taupiet akumulatoru.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Lieliski!</strong> Jūs esat saplānojuši braucienu, pievienojuši Railcard un nopirkuši biļeti tālrunī.'},
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

    const busTable = `<div class="sj"><strong>121. autobuss: Bridlington – Hull</strong><small>Tikai vingrināšanās laiki</small>
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
        return app(p, 'Autobusu laiki', busTable, {back: false, color: '#fff',
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
            ? 'Ekrānuzņēmums ir fotoattēls ar visu, kas ir jūsu ekrānā, piemēram, šiem autobusu laikiem. Vienlaikus nospiediet <strong>sānu pogu</strong> (labajā pusē) un <strong>skaļuma palielināšanas pogu</strong> (kreisajā pusē), tad atlaidiet. Šeit <strong>pieskarieties sānu pogai, tad skaļuma palielināšanas pogai</strong>.'
            : 'Ekrānuzņēmums ir fotoattēls ar visu, kas ir jūsu ekrānā, piemēram, šiem autobusu laikiem. Vienlaikus nospiediet <strong>ieslēgšanas pogu</strong> un <strong>skaļuma samazināšanas pogu</strong>, tad atlaidiet. Šeit <strong>pieskarieties ieslēgšanas pogai, tad skaļuma samazināšanas pogai</strong>.',
         hints: {'vol-down': p === 'ios' ? 'iPhone tālrunī tā ir skaļuma PALIELINĀŠANA kopā ar sānu pogu.' : 'Sāciet ar ieslēgšanas pogu, labās malas augšdaļā.',
                 'vol-up': p === 'ios' ? 'Sāciet ar sānu pogu labajā pusē.' : 'Android tālrunī tā ir skaļuma SAMAZINĀŠANA kopā ar ieslēgšanas pogu.',
                 side: 'Tagad skaļuma palielināšanas poga kreisajā pusē.', power: 'Tagad skaļuma samazināšanas poga.'},
         hint: p === 'ios' ? 'Sānu poga ir labajā malā. Skaļuma palielināšana ir kreisajā pusē.' : 'Ieslēgšanas poga ir augšējā poga labajā malā.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Klik! Apakšējā stūrī parādās neliels attēls. <strong>Pieskarieties tam,</strong> lai redzētu ekrānuzņēmumu. <em>Ja to atstājat, tas pats saglabājas pēc dažām sekundēm.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Šeit varat uz tā zīmēt vai to apgriezt. <strong>Pieskarieties Gatavs</strong> augšā kreisajā pusē.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Pieskarieties Saglabāt Fotoattēlos.</strong>', hints: {'delete-shot': 'Tas to izmestu. Pieskarieties Saglabāt Fotoattēlos.', 'save-files': 'Faili der arī, taču Fotoattēlus ir vieglāk atrast. Pieskarieties Saglabāt Fotoattēlos.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Klik! Parādās neliels attēls ar pogām zem tā. Tas jau ir saglabāts. <strong>Pieskarieties Kopīgot,</strong> lai to kādam nosūtītu.', hints: {'shot-edit': 'Rediģēt ļauj to apgriezt vai uz tā zīmēt. Šobrīd pieskarieties Kopīgot.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Pieskarieties Sarah,</strong> lai nosūtītu viņai autobusu laikus.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Kur vēlāk varat atrast savus ekrānuzņēmumus?', options: [
            {t: 'Lietotnē Fotoattēli, albumā Ekrānuzņēmumi', ok: true, why: 'Jā. Tie tiek saglabāti kopā ar fotoattēliem, tāpēc varat tos skatīties, kopīgot vai dzēst kā jebkuru fotoattēlu.'},
            {t: 'Tie pazūd pēc vienas dienas', why: 'Tie paliek, līdz tos izdzēšat. Meklējiet lietotnē Fotoattēli, albumā Ekrānuzņēmumi.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Lieliski!</strong> Ekrānuzņēmumi ir noderīgi autobusu laikiem, biļetēm, kļūdu ziņojumiem un visam, ko vēlaties paturēt vai kādam parādīt. Kad esat beiguši, varat tos dzēst no Fotoattēliem.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Meklēt Kartēs'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah ir atsūtījusi jums adresi īsziņā. Nokopējot to, nav jāraksta no jauna. <strong>Atveriet Ziņas.</strong>'},
        {screen: () => app(p, 'Ziņas', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Pieskarieties Sarah ziņai.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Turiet nospiestu ziņu ar adresi</strong> (vienu vai divas sekundes turiet uz tās pirkstu), līdz parādās izvēlne.', hint: 'Turiet pirkstu uz otrās ziņas, līdz parādās izvēlne.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Pieskarieties Kopēt.</strong> Tālrunis tagad atceras vārdus, gatavus ielīmēšanai citur.',
         hints: {reply: 'Atbildēt sāktu ziņu. Pieskarieties Kopēt.', forward: 'Pārsūtīt nosūta ziņu kādam citam. Pieskarieties Kopēt.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Nokopēts! Tagad dodieties uz sākuma ekrānu. Šeit <strong>pieskarieties joslai ekrāna apakšā</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Atveriet Kartes,</strong> lai varētu atrast adresi.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Turiet nospiestu meklēšanas lodziņu,</strong> līdz parādās neliela poga “Ielīmēt”.', hint: 'Turiet pirkstu uz meklēšanas lodziņa augšā.',
         hints: {'search-tap': 'Ātrs pieskāriens atver tastatūru. Tā vietā turiet nospiestu, līdz parādās Ielīmēt.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Pieskarieties Ielīmēt.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Parādās visa adrese, bez rakstīšanas. <strong>Pieskarieties rezultātam.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Vēlaties nokopēt tikai tālruņa numuru no garas ziņas vidus. Kā?', options: [
            {t: 'Turēt nospiestu, tad pieskarties Atlasīt (vai vilkt mazos turus), lai izvēlētos tikai vajadzīgo daļu, tad Kopēt', ok: true,
             why: 'Jā. Velciet turus abās izcelto vārdu pusēs, lai izvēlētos tieši to, ko vēlaties.'},
            {t: 'Var nokopēt tikai visu ziņu', why: 'Varat izvēlēties daļu: turiet nospiestu, pieskarieties Atlasīt un velciet mazos turus.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Lieliski!</strong> Kopēšana un ielīmēšana darbojas gandrīz visur: ziņās, e-pastos, tīmekļa lapās un veidlapās. Turiet nospiestu, lai kopētu; turiet nospiestu, lai ielīmētu.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Krātuve'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'iPhone krātuve', [{caption: 'IETEIKUMI'},
                ctx.offloaded ? {label: 'Izlādēt neizmantotās lietotnes', value: 'Ieslēgts ⟦check⟧'} : {id: 'offload', label: 'Izlādēt neizmantotās lietotnes', sub: 'Ietaupiet 2,1 GB. Noņem lietotnes, kuras neizmantojat, bet saglabā to datus.', value: 'Ieslēgt'},
                {caption: 'LIETOTNES'}, {label: 'Fotoattēli', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'Vispārīgi', top: bar});
        }
        return list(p, 'Krātuve', [{label: 'Fotoattēli un video', value: '21,3 GB'}, {label: 'Lietotnes', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Ieskaitot WhatsApp'}, {label: 'Dokumenti un citi', value: '4,1 GB'},
            {label: 'Sistēma', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1,1 GB nevajadzīgo failu iztīrīti</p>' : '<button type="button" class="ce dk" data-tap="free-up">Atbrīvot vietu</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Iestatījumi', `<div class="fo">${[['account', 'Konts'], ['privacy', 'Privātums'], ['chats', 'Tērzēšanas'], ['notifications', 'Paziņojumi'], ['storage', 'Krātuve un dati'], ['help', 'Palīdzība']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Krātuve un dati', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Pārvaldīt krātuvi', `<div class="iq"><span>WhatsApp izmanto ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Lielāki par 5 MB</strong><small>Nav ko pārskatīt</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Pārsūtīts daudzas reizes</strong><small>112 vienumi · 0,9 GB</small></div>
                <div class="he">TĒRZĒŠANAS</div><div class="ck"><strong>Ģimene</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Lielāki par 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Dzēst 23 vienumus?', 'Tie tiks izdzēsti no WhatsApp. Fotoattēli, kas jau saglabāti jūsu tālruņa galerijā, tur paliek.', [['cancel', 'Atcelt'], ['confirm-delete', 'Dzēst']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Redzat “Krātuve gandrīz pilna”? Noskaidrosim, kas aizņem vietu. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Pieskarieties Vispārīgi.</strong>'},
            {screen: () => list(p, 'Vispārīgi', [{id: 'about', label: 'Par'}, {id: 'update', label: 'Programmatūras atjaunināšana'}, {id: 'storage', label: 'iPhone krātuve'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN un ierīču pārvaldība'}], {back: 'Iestatījumi'}),
             target: 'storage', say: '<strong>Pieskarieties iPhone krātuve.</strong> Visa aprēķināšana aizņem dažas sekundes.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Krāsainā josla rāda, kas aizņem vietu. Vispirms ātrs ieguvums: <strong>Izlādēt neizmantotās lietotnes</strong> noņem lietotnes, kuras kādu laiku neesat izmantojuši, bet saglabā jūsu datus, ja vēlaties tās atgūt. <strong>Pieskarieties Ieslēgt.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Pieskarieties Krātuve.</strong> <em>Samsung tālrunī tā ir Akumulators un ierīces apkope, tad Krātuve.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Krāsainā josla rāda, kas aizņem vietu. <strong>Pieskarieties Atbrīvot vietu.</strong>'},
            {screen: () => app(p, 'Faili', `<div class="ke"><strong>Dzēst nevajadzīgos failus</strong><small>1,1 GB pagaidu failu no lietotnēm</small><button type="button" class="ce dk" data-tap="clean">Iztīrīt</button></div>
                <div class="ke"><strong>Dzēst vecos ekrānuzņēmumus</strong><small>214 MB</small><span class="fd">Atlasīt un atbrīvot</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Nevajadzīgos failus var droši dzēst: tie ir pagaidu faili, kas lietotnēm nav vajadzīgi. <strong>Pieskarieties Iztīrīt.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp izmanto 14,8 GB. Kas to piepilda?', options: [
            {t: 'Video un fotoattēli, ko cilvēki jums sūtījuši, īpaši grupās', ok: true, why: 'Jā. Katrs ģimenes vai grupas tērzēšanā nosūtītais video tiek saglabāts jūsu tālrunī. WhatsApp var atrast un izdzēst lielākos.'},
            {t: 'Jūsu teksta ziņas', why: 'Teksts gandrīz neaizņem vietu. Tie ir video un fotoattēli, ko cilvēki sūta, īpaši grupās.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Atveriet WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'WhatsApp pieskarieties <strong>Iestatījumi</strong> apakšā labajā pusē. Šeit tas ir atvērts. <strong>Pieskarieties Krātuve un dati.</strong>'
                          : 'WhatsApp pieskarieties <strong>trim punktiem ⋮</strong> augšā, tad <strong>Iestatījumi</strong>. Šeit tas ir atvērts. <strong>Pieskarieties Krātuve un dati.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Pieskarieties Pārvaldīt krātuvi.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Visvairāk vietas ietaupošie ir augšā. <strong>Pieskarieties Lielāki par 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Šie ir lieli video, ko cilvēki jums sūtījuši. Ja kādu vēlaties paturēt, vispirms saglabājiet to fotoattēlos. <strong>Pieskarieties Atlasīt visu.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Pieskarieties Dzēst.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Tas izdzēš tikai kopijas WhatsApp iekšienē. <strong>Pieskarieties Dzēst,</strong> lai apstiprinātu.', hints: {cancel: 'Atcelšana tos saglabā. Šim vingrinājumam pieskarieties Dzēst.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Lieliski!</strong> Jūs esat atbrīvojuši vairāk nekā 7 GB. To vērts darīt ik pēc dažiem mēnešiem. Iztukšojiet arī <strong>Nesen dzēstie</strong> sadaļā Fotoattēli, jo izdzēstie fotoattēli vēl 30 dienas aizņem vietu.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Pasaules pulkstenis'], ['alarms', 'Modinātāji'], ['stopwatch', 'Hronometrs'], ['timers', 'Taimeri']]
            : [['alarms', 'Modinātājs'], ['world', 'Pulkstenis'], ['timers', 'Taimeris'], ['stopwatch', 'Hronometrs']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Šodien</small><strong>Londona</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Austrālija</small><strong>Sidneja</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Tabletes')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Modinātājs</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Pasaules pulkstenis' : 'Pulkstenis') : (p === 'ios' ? 'Modinātāji' : 'Modinātājs')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Nekad'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Modinātājs', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Modinātājs var atgādināt katru dienu iedzert tabletes. <strong>Atveriet lietotni Pulkstenis.</strong>', hint: 'Tā ir melna ikona ar baltu pulksteņa ciparnīcu.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Pieskarieties ${p === 'ios' ? 'Modinātāji' : 'Modinātājs'}</strong> ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Pieskarieties +,</strong> lai pievienotu jaunu modinātāju.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Īstā tālrunī laiku iestata, ritinot ciparus. Šeit <strong>pieskarieties 08:00</strong>.', hints: {'t-07': 'Šim vingrinājumam izvēlieties 08:00.', 't-09': 'Šim vingrinājumam izvēlieties 08:00.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Tas vajadzīgs katru dienu, nevis tikai vienreiz. <strong>Pieskarieties Atkārtot.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Katru dienu'; }, say: '<strong>Pieskarieties Katru dienu.</strong>',
         hints: {never: 'Nekad nozīmē, ka tas atskan tikai vienreiz. Pieskarieties Katru dienu.', weekdays: 'Darbdienās izlaiž nedēļas nogali. Pieskarieties Katru dienu.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Vispirms lodziņā Nosaukums ierakstiet nosaukumu, piemēram, Tabletes.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Nosaukums norāda, kam modinātājs paredzēts. <strong>Pieskarieties lodziņam Nosaukums un ierakstiet Tabletes,</strong> tad <strong>pieskarieties Saglabāt</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Modinātājs atskan plkst. 8. Jūs iedzerat tabletes. Kuru pogu nospiežat?', options: [
            {t: 'Apturēt', ok: true, why: 'Jā. Apturēt to izslēdz līdz rītdienas plkst. 8, jo tas atkārtojas katru dienu.'},
            {t: 'Atlikt', why: 'Atlikt liek tam atkal zvanīt pēc apmēram 9 minūtēm. Izmantojiet to, ja vajag mazliet ilgāk, bet Apturēt to izslēdz līdz rītdienai.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Lieliski!</strong> Jūsu tablešu modinātājs atskan plkst. 8 katru rītu. ' + (p === 'ios' ? 'Lietotnē <strong>Veselība</strong> ir arī sadaļa Zāles, kas atgādina un veic uzskaiti.' : 'Varat arī pateikt Google: “Atgādini man katru dienu plkst. 8 iedzert tabletes”.')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Ja tālrunis pazustu vai salūztu, vai jūsu fotoattēli būtu drošībā? Pārbaudīsim. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Pieskarieties savam vārdam</strong> augšā.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personiskā informācija'}, {id: 'security', label: 'Pierakstīšanās un drošība'}, {id: 'payment', label: 'Maksājumi un piegāde'}, {id: 'subscriptions', label: 'Abonementi'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Ģimenes koplietošana'}, {id: 'findmy', label: 'Find My'}], {back: 'Iestatījumi'}),
         target: 'icloud', say: '<strong>Pieskarieties iCloud.</strong> iCloud ir Apple tiešsaistes krātuve.'},
        {screen: c => list(p, 'iCloud', [{caption: 'KRĀTUVE: IZMANTOTI 4,2 GB NO 5 GB'}, {caption: 'SAGLABĀTS ICLOUD'}, {id: 'photos', label: 'Fotoattēli', value: c.photoSync ? 'Ieslēgta' : 'Izslēgts'}, {id: 'backup', label: 'iCloud dublējums', value: c.backedUp ? 'Ieslēgta' : 'Izslēgts'},
            {label: 'Kontakti', value: 'Ieslēgta'}, {label: 'Piezīmes', value: 'Ieslēgta'}], {back: 'Apple Account'}),
         target: 'photos', say: 'Fotoattēli un Dublējums abi ir <strong>Izslēgti</strong>. Tas nozīmē, ka pazaudēts tālrunis nozīmētu pazaudētus fotoattēlus. <strong>Pieskarieties Fotoattēli.</strong>'},
        {screen: c => list(p, 'Fotoattēli', [{id: 'sync', label: 'Sinhronizēt šo iPhone', toggle: !!c.photoSync, sub: 'Glabā jūsu fotoattēlus un video iCloud, lai tie būtu drošībā, ja pazaudējat tālruni.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Pieskarieties Sinhronizēt šo iPhone,</strong> lai to ieslēgtu.'},
        {screen: c => list(p, 'Fotoattēli', [{label: 'Sinhronizēt šo iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Pieskarieties ‹ iCloud,</strong> lai atgrieztos.'},
        {screen: c => list(p, 'iCloud', [{caption: 'KRĀTUVE: IZMANTOTI 4,2 GB NO 5 GB'}, {caption: 'SAGLABĀTS ICLOUD'}, {id: 'photos', label: 'Fotoattēli', value: 'Ieslēgta'}, {id: 'backup', label: 'iCloud dublējums', value: 'Izslēgts'}], {back: 'Apple Account'}),
         target: 'backup', say: 'Tagad dublējiet visu pārējo: iestatījumus, ziņas un lietotnes. <strong>Pieskarieties iCloud dublējums.</strong>'},
        {screen: c => list(p, 'Rezerves kopija', [{id: 'backup-toggle', label: 'Dublēt šo iPhone', toggle: !!c.backedUp, sub: 'Dublē automātiski katru nakti, kad iPhone lādējas, ir bloķēts un savienots ar Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Pieskarieties Dublēt šo iPhone,</strong> lai to ieslēgtu.'},
        {screen: () => list('ios', 'Rezerves kopija', [{label: 'Dublēt šo iPhone', toggle: true}, {id: 'backup-now', label: 'Dublēt tūlīt', sub: 'Pēdējais sekmīgais dublējums: nekad'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Turpmāk tas dublēs katru nakti. Pirmo izdariet tagad: <strong>pieskarieties Dublēt tūlīt</strong>.'},
        {screen: c => list('ios', 'Rezerves kopija', [{label: 'Dublēt šo iPhone', toggle: true}, {label: c.busy ? 'Notiek dublēšana…' : 'Dublēt tūlīt', sub: c.busy ? 'Atlikušas apmēram 5 minūtes' : 'Pēdējais sekmīgais dublējums: tikko ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Īsziņā rakstīts: “Jūsu iCloud krātuve ir pilna. Jūsu fotoattēli šodien tiks dzēsti. Samaksājiet 99p šeit: [link]”. Ko jūs darāt?', options: [
            {t: 'Ignorēju saiti. Pārbaudu Iestatījumi > jūsu vārds > iCloud, tad pārsūtu īsziņu uz 7726', ok: true, why: 'Jā. Šī ir izplatīta krāpšana. Apple nesūta saites īsziņās un nekad tā nedzēš jūsu fotoattēlus. Pārbaudiet savu īsto krātuvi sadaļā Iestatījumi.'},
            {t: 'Ātri maksāju, lai saglabātu fotoattēlus', why: 'Tā ir krāpšana, lai iegūtu jūsu kartes datus. Pārbaudiet savu īsto krātuvi sadaļā Iestatījumi > jūsu vārds > iCloud un pārsūtiet īsziņu uz 7726.'}]}},
        {screen: () => list('ios', 'Rezerves kopija', [{label: 'Dublēt šo iPhone', toggle: true}, {label: 'Dublēt tūlīt', sub: 'Pēdējais sekmīgais dublējums: tikko ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Lieliski!</strong> Jūsu fotoattēli un tālrunis ir dublēti. Bezmaksas 5 GB ar fotoattēliem aizpildās ātri; ja tā notiek, papildu vieta (iCloud+) maksā nelielu mēneša maksu, un to pērk tikai iestatījumos, nekad ne no īsziņas.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Ja tālrunis pazustu vai salūztu, vai jūsu fotoattēli būtu drošībā? Pārbaudīsim. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Pieskarieties Google.</strong> Tas ir netālu no apakšas.', hint: 'Ritiniet sarakstu uz leju: Google ir netālu no apakšas.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Pārvaldiet savu Google kontu', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Rezerves kopija', sub: 'Izslēgts'}, {id: 'autofill', label: 'Automātiskā aizpilde'}, {id: 'devices', label: 'Ierīces un koplietošana'}]),
         target: 'backup', say: 'Dublēšana ir <strong>Izslēgta</strong>. <strong>Pieskarieties Dublēšana.</strong> <em>Samsung tālrunī tas ir Iestatījumi > Konti un dublēšana.</em>'},
        {screen: c => list(p, 'Rezerves kopija', [{id: 'backup-toggle', label: 'Dublēšana ar Google One', toggle: !!c.backedUp, sub: 'Dublē lietotnes, ziņas, zvanu vēsturi, kontaktus un iestatījumus.'},
            {id: 'photos-backup', label: 'Fotoattēli un video', sub: c.photoSync ? 'Ieslēgta · Google fotoattēli' : 'Izslēgta · Google fotoattēli'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Pieskarieties Dublēšana ar Google One,</strong> lai to ieslēgtu.'},
        {screen: c => list(p, 'Rezerves kopija', [{label: 'Dublēšana ar Google One', toggle: true}, {id: 'photos-backup', label: 'Fotoattēli un video', sub: 'Izslēgta · Google fotoattēli'}]),
         target: 'photos-backup', say: 'Fotoattēli ir atsevišķi. <strong>Pieskarieties Fotoattēli un video.</strong>'},
        {screen: c => list(p, 'Rezerves kopija', [{id: 'photos-toggle', label: 'Dublēt fotoattēlus un video', toggle: !!c.photoSync, sub: 'Saglabā tos Google fotoattēlos, lai tie būtu drošībā, ja pazaudējat tālruni.'},
            {label: 'Dublēšanas kvalitāte', value: 'Krātuves taupīšana'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Pieskarieties Dublēt fotoattēlus un video,</strong> lai to ieslēgtu.'},
        {screen: () => list(p, 'Rezerves kopija', [{label: 'Dublēt fotoattēlus un video', toggle: true}, {id: 'backup-now', label: 'Dublēt tūlīt', sub: 'Pēdējais dublējums: nekad'}]),
         target: 'backup-now', say: 'Turpmāk tas dublējas pats, izmantojot Wi-Fi. Pirmo izdariet tagad: <strong>pieskarieties Dublēt tūlīt</strong>.'},
        {screen: c => list(p, 'Rezerves kopija', [{label: 'Dublēt fotoattēlus un video', toggle: true}, {label: c.busy ? 'Notiek dublēšana…' : 'Dublēt tūlīt', sub: c.busy ? '1,204 items left' : 'Pēdējais dublējums: tikko ⟦check⟧'}]), wait: 1500,
         question: {q: 'Īsziņā rakstīts: “Jūsu Google krātuve ir pilna. Jūsu fotoattēli šodien tiks dzēsti. Samaksājiet 99p šeit: [link]”. Ko jūs darāt?', options: [
            {t: 'Ignorēju saiti. Pārbaudu Iestatījumi > Google > Dublēšana, tad pārsūtu īsziņu uz 7726', ok: true, why: 'Jā. Šī ir izplatīta krāpšana. Google nesūta šādas saites īsziņās. Pārbaudiet savu īsto krātuvi sadaļā Iestatījumi.'},
            {t: 'Ātri maksāju, lai saglabātu fotoattēlus', why: 'Tā ir krāpšana, lai iegūtu jūsu kartes datus. Pārbaudiet savu īsto krātuvi sadaļā Iestatījumi un pārsūtiet īsziņu uz 7726.'}]}},
        {screen: () => list(p, 'Rezerves kopija', [{label: 'Dublēt fotoattēlus un video', toggle: true}, {label: 'Dublēt tūlīt', sub: 'Pēdējais dublējums: tikko ⟦check⟧'}]), done: true,
         say: '<strong>Lieliski!</strong> Jūsu fotoattēli un tālrunis ir dublēti. Google dod jums 15 GB bez maksas; ja tas aizpildās, papildu vieta maksā nelielu mēneša maksu, un to pērk tikai iestatījumos vai lietotnē Google One, nekad ne no īsziņas.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 APSVEICAM! 🎉</strong><p>Jūs esat izvēlēti, lai laimētu £500 vērtu pirkumu kuponu!</p>
        <button type="button" class="aeb" data-tap="claim">SAŅEMT TŪLĪT</button><small>Reklāma</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Informācija par lietotni', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Versija 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Atvērt</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Atinstalēt</button>
            <button type="button" data-tap="force-stop">Piespiedu apturēšana</button></div>
            <div class="cj ex"><span class="hf"><strong>Akumulators</strong><small>38% izmantots kopš pēdējās pilnās uzlādes</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Atļaujas</strong><small>Attēlošana virs citām lietotnēm, ierīces administrators</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Vai vēlaties atinstalēt šo lietotni?', [['cancel', 'Atcelt'], ['confirm-uninstall', 'Labi']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>KALENDĀRS · tikko</strong>
            <span>⚠️ Jūsu iPhone var būt inficēts! Pieskarieties šeit, lai to iztīrītu tūlīt.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Reklāmas uznirst jūsu sākuma ekrānā, kaut gan neviena lietotne nav atvērta. Tas parasti nozīmē, ka tālrunī ir iekļuvusi slikta lietotne. Vispirms <strong>nepieskarieties reklāmai. Pieskarieties mazajam ⟦x⟧, lai to aizvērtu.</strong>',
         hints: {claim: 'Nekad nepieskarieties pašai reklāmai. Meklējiet mazo ⟦x⟧ stūrī.'}, hint: '⟦x⟧ ir mazs, reklāmas augšējā labajā stūrī.'},
        {screen: () => home(p), target: 'settings', say: 'Sliktas lietotnes darbojas visu laiku, tāpēc patērē daudz akumulatora. Tā tās var atrast. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Pieskarieties Akumulators.</strong> <em>Samsung tālrunī tas ir Akumulators un ierīces apkope, tad Akumulators.</em>'},
        {screen: () => list(p, 'Akumulators', [{id: 'usage', label: 'Akumulatora izmantojums', sub: 'Skatīt izmantojumu kopš pēdējās pilnās uzlādes'}, {label: 'Akumulatora taupītājs', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Pieskarieties Akumulatora izmantojums.</strong> <em>Dažos Samsung tālruņos pieskarieties diagrammai vai Skatīt informāciju.</em>'},
        {screen: () => list(p, 'Akumulatora izmantojums', [], {top: `<div class="nl">${[['System Service', 38], ['Ekrāns', 21], ['WhatsApp', 12], ['YouTube', 8], ['Kamera', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Kas no šī izskatās neierasti?', options: [
            {t: 'System Service: jūs to nekad neesat lietojuši, un tā izmanto visvairāk akumulatora', ok: true, why: 'Jā. Sliktas lietotnes sev dod garlaicīgus nosaukumus, piemēram, “System Service” vai “Keyboard Settings”, lai jūs tās nepamanītu. Pierakstiet tās nosaukumu.'},
            {t: 'Ekrāns', why: 'Ekrāns vienmēr izmanto daudz akumulatora; tas ir normāli. Neierastais ir “System Service”, ko jūs nekad neesat lietojuši.'},
            {t: 'WhatsApp', why: 'WhatsApp ir lietotne, ko jūs lietojat, tāpēc tas ir normāli. Neierastais ir “System Service”.'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Tagad atradīsim to jūsu lietotnēs. Atgriezušies Iestatījumos, <strong>pieskarieties Lietotnes</strong>.'},
        {screen: () => list(p, 'Lietotnes', [{caption: 'Nesen atvērtās lietotnes'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Skatīt visas 46 lietotnes'}, {id: 'default-apps', label: 'Noklusējuma lietotnes'}]),
         target: 'all-apps', say: '<strong>Pieskarieties Skatīt visas lietotnes.</strong>'},
        {screen: () => list(p, 'Visas lietotnes', ['Kalkulators', 'Kalendārs', 'Kamera', 'Chrome', 'Pulkstenis', 'Kontakti', 'Gmail', 'Kartes'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Saraksts ir alfabētiskā secībā. <strong>Pieskarieties System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Poga <strong>Atinstalēt</strong> ir pelēka. Sliktas lietotnes to dara, lai jūs nevarētu tās noņemt. Vispirms <strong>pieskarieties Piespiedu apturēšana</strong>, lai apturētu tās darbību.',
         hints: {uninstall: 'Tā ir pelēka, tāpēc vēl nedarbosies. Vispirms pieskarieties Piespiedu apturēšana.', open: 'Neatveriet to. Pieskarieties Piespiedu apturēšana.'}},
        {screen: () => list(p, 'Meklēt iestatījumos', [{caption: 'Rezultāti vaicājumam “device admin”'}, {id: 'device-admin', label: 'Ierīces administratora lietotnes', sub: 'Drošība un konfidencialitāte > Citi drošības iestatījumi'}]),
         target: 'device-admin',
         say: 'Tagad atņemiet tai īpašo atļauju. Iestatījumos <strong>meklējiet “device admin”</strong>, izmantojot meklēšanas joslu augšā. Šeit ir rezultāts: <strong>pieskarieties Ierīces administratora lietotnes</strong>.'},
        {screen: c => list(p, 'Ierīces administratora lietotnes', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Deaktivizēt šo ierīces administratora lietotni?', 'System Service vairs nevarēs neļaut jums to atinstalēt.', [['cancel', 'Atcelt'], ['deactivate', 'Deaktivizēt']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device ir Google lietotne, un ar to viss kārtībā. <strong>Pieskarieties slēdzim blakus System Service.</strong>', hints: {'find-my': 'Atstājiet Find My Device ieslēgtu. Pieskarieties System Service.'}},
        {screen: c => list(p, 'Ierīces administratora lietotnes', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Deaktivizēt šo ierīces administratora lietotni?', 'System Service vairs nevarēs neļaut jums to atinstalēt.', [['cancel', 'Atcelt'], ['deactivate', 'Deaktivizēt']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Pieskarieties Deaktivizēt.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Atgriezušies pie System Service, <strong>Atinstalēt</strong> tagad darbojas. <strong>Pieskarieties Atinstalēt.</strong>', hints: {'force-stop': 'Tā jau ir apturēta. Pieskarieties Atinstalēt.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Pieskarieties Labi.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Prom! Visbeidzot ļaujiet Google pārbaudīt, vai nav kas cits. <strong>Atveriet Play Store.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Kaitīgas lietotnes nav atrastas' : 'Skenēt tālruni'}</strong>
            <small>${c.scanned ? 'Pārbaudīts tikko' : 'Pēdējā skenēšana: pirms 3 nedēļām'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'Play Store pieskarieties savam <strong>profila attēlam</strong> (augšā labajā pusē), tad <strong>Play Protect</strong>. Šeit tas ir atvērts. <strong>Pieskarieties Skenēt.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Kaitīgas lietotnes nav atrastas</strong><small>Pārbaudīts tikko</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Lieliski!</strong> Jūs atradāt sliktu lietotni pēc akumulatora izmantojuma, atņēmāt tai īpašo atļauju, atinstalējāt to un pārbaudījāt tālruni. Lai no tām izvairītos: instalējiet lietotnes tikai no Play Store un uzmanieties no bezmaksas lukturīša, “tīrītāju” un “paātrinātāju” lietotnēm.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Jūsu Kalendāra paziņojumā rakstīts: “Jūsu iPhone var būt inficēts! Pieskarieties šeit, lai to iztīrītu tūlīt.” Kas tas ir?', options: [
            {t: 'Surogātpasts, kas iekļuvis jūsu kalendārā. Nepieskarieties tam', ok: true, why: 'Jā. Pieskaroties “Atļaut” aizdomīgā vietnē, iPhone tālrunim var pievienot surogātpasta kalendāru. Tā “notikumi” ir reklāmas, kas izskatās kā brīdinājumi. Jūsu iPhone ir kārtībā.'},
            {t: 'Īsts Apple brīdinājums', why: 'Apple nesūta vīrusu brīdinājumus caur Kalendāru. Tas ir surogātpasts no abonēta kalendāra. Nepieskarieties tam.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Noņemsim surogātpasta kalendāru. <strong>Pieskarieties Iestatījumi,</strong> nevis paziņojumam.', hints: {notif: 'Nepieskarieties brīdinājumam. Pieskarieties Iestatījumi.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Ritiniet uz leju un <strong>pieskarieties Lietotnes</strong>.', hint: 'Lietotnes ir pēdējā grupā.'},
        {screen: () => list(p, 'Lietotnes', ['App Store', 'Grāmatas'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Kalendārs'}, {label: 'Kamera'}, {label: 'Kontakti'}, {label: 'Pasts'}]), {back: 'Iestatījumi'}),
         target: 'calendar', say: '<strong>Pieskarieties Kalendārs.</strong>'},
        {screen: () => list(p, 'Kalendārs', [{id: 'accounts', label: 'Kalendāra konti', value: '2'}, {label: 'Laika joslas ignorēšana', value: 'Izslēgts'}, {label: 'Noklusējuma brīdinājumu laiki'}], {back: 'Lietotnes'}),
         target: 'accounts', say: '<strong>Pieskarieties Kalendāra konti.</strong>'},
        {screen: () => list(p, 'Kalendāra konti', [{caption: 'KONTI'}, {label: 'iCloud', sub: 'Kalendāri, kontakti un vēl 7'}, {id: 'subscribed', label: 'Abonētie kalendāri', value: '1'}], {back: 'Kalendārs'}),
         target: 'subscribed', say: 'iCloud ir jūsu pašu. <strong>Pieskarieties Abonētie kalendāri.</strong>'},
        {screen: () => list(p, 'Abonētie kalendāri', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Abonēts'}], {back: 'Kalendāra konti'}),
         target: 'spam-cal', say: 'Lūk, kalendārs, ko jūs nekad nevēlējāties pievienot. <strong>Pieskarieties Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serveris', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Dzēst kontu', danger: true}],
            {back: 'Atpakaļ', overlay: c.askDelete ? dialog(p, 'Vai esat pārliecināts?', 'Tas izdzēsīs kalendāru un tā notikumus no jūsu iPhone.', [['cancel', 'Atcelt'], ['confirm-delete', 'Dzēst kontu']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Pieskarieties Dzēst kontu.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serveris', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Dzēst kontu', danger: true}],
            {back: 'Atpakaļ', overlay: dialog(p, 'Vai esat pārliecināts?', 'Tas izdzēsīs kalendāru un tā notikumus no jūsu iPhone.', [['cancel', 'Atcelt'], ['confirm-delete', 'Dzēst kontu']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Pieskarieties Dzēst kontu,</strong> lai apstiprinātu.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Prom. Vēl viena pārbaude: aizdomīgas vietnes var instalēt arī “profilu”. <strong>Pieskarieties Vispārīgi.</strong>'},
        {screen: () => list(p, 'Vispārīgi', [{id: 'about', label: 'Par'}, {id: 'update', label: 'Programmatūras atjaunināšana'}, {id: 'storage', label: 'iPhone krātuve'}, {id: 'vpn', label: 'VPN un ierīču pārvaldība'}], {back: 'Iestatījumi'}),
         target: 'vpn', say: '<strong>Pieskarieties VPN un ierīču pārvaldība.</strong>'},
        {screen: c => list(p, 'VPN un ierīču pārvaldība', c.profileGone ? [{label: 'VPN', value: 'Nav savienots'}] : [{label: 'VPN', value: 'Nav savienots'}, {caption: 'KONFIGURĀCIJAS PROFILS'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Nepārbaudīts'}], {back: 'Vispārīgi'}),
         target: 'profile', say: 'Ja šeit redzat profilu, ko neatpazīstat (profils no darba vai skolas ir kārtībā), noņemiet to. <strong>Pieskarieties Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Profils', [{label: 'Free Phone Booster', sub: 'Nepārbaudīts · Satur: tīmekļa saīsnes, sertifikāti'}, {caption: ' '}, {id: 'remove-profile', label: 'Noņemt profilu', danger: true}],
            {back: 'Atpakaļ', overlay: c.askRemove ? dialog(p, 'Noņemt profilu', 'Noņemot šo profilu, tiks dzēsti visi tā iestatījumi.', [['cancel', 'Atcelt'], ['confirm-remove', 'Noņemt']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Pieskarieties Noņemt profilu</strong>. iPhone prasīs jūsu piekļuves kodu.'},
        {screen: c => list(p, 'Profils', [{label: 'Free Phone Booster', sub: 'Nepārbaudīts'}, {caption: ' '}, {label: 'Noņemt profilu', danger: true}],
            {back: 'Atpakaļ', overlay: dialog(p, 'Noņemt profilu', 'Noņemot šo profilu, tiks dzēsti visi tā iestatījumi.', [['cancel', 'Atcelt'], ['confirm-remove', 'Noņemt']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Pieskarieties Noņemt.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Lieliski!</strong> Viltus brīdinājumi ir pazuduši. Lai tas neatkārtotos: vietnēs pieskarieties <strong>Neatļaut</strong> vai <strong>Aizvērt</strong> jebkurā uznirstošajā logā, kas prasa pievienot kalendāru vai profilu, un instalējiet lietotnes tikai no App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Atcelts · Beidzas 22. oktobrī'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 nedēļā · Atjaunojas 22. oktobrī'};
        return list(p, 'Abonementi', [{caption: p === 'ios' ? 'AKTĪVI' : 'Aktīvs'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 mēnesī' : '£1.59 mēnesī'},
            {caption: p === 'ios' ? 'NEAKTĪVI' : 'Beidzies'}, {label: 'Crossword Daily', sub: 'Beidzies 3. martā'}], {back: p === 'ios' ? 'Apple Account' : 'Atpakaļ'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'JŪSU ABONEMENTS' : 'Plāns'}, {label: 'Katru nedēļu', sub: '£4.99 nedēļā. Sākās kā 3 dienu bezmaksas izmēģinājums.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Atcelt abonementu' : 'Atcelt abonementu', danger: true}],
            {back: 'Abonementi', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Apstiprināt atcelšanu' : 'Atcelt abonementu?', 'Varat to lietot līdz 22. oktobrim. Jums vairs netiks piemērota maksa.', [['keep', p === 'ios' ? 'Ne tagad' : 'Paturēt']].concat([['confirm-cancel', p === 'ios' ? 'Apstiprināt' : 'Atcelt abonementu']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Bezmaksas izmēģinājumi bieži kļūst par maksas plāniem, jums to nepamanot. Pārbaudīsim. <strong>Pieskarieties Iestatījumi.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Pieskarieties savam vārdam</strong> augšā.'},
            {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personiskā informācija'}, {id: 'security', label: 'Pierakstīšanās un drošība'}, {id: 'payment', label: 'Maksājumi un piegāde'}, {id: 'subscriptions', label: 'Abonementi'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Iestatījumi'}),
             target: 'subscriptions', say: '<strong>Pieskarieties Abonementi.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Bezmaksas izmēģinājumi bieži kļūst par maksas plāniem, jums to nepamanot. Pārbaudīsim. <strong>Atveriet Play Store.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>JUMS IETEIKTS</span><strong>Lietotnes, ar ko sākt</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Pieskarieties savam profila attēlam,</strong> apaļajam burtam augšā labajā pusē.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Pieskarieties Maksājumi un abonementi.</strong>'},
            {screen: () => list(p, 'Maksājumi un abonementi', [{id: 'methods', label: 'Maksājumu veidi'}, {id: 'subscriptions', label: 'Abonementi', sub: 'Pārvaldīt abonementus'}, {id: 'budget', label: 'Budžets un vēsture'}]),
             target: 'subscriptions', say: '<strong>Pieskarieties Abonementi.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '“Photo Editor Pro” sākās kā bezmaksas izmēģinājums, un tagad tas maksā <strong>£4.99 katru nedēļu</strong>. Tas ir vairāk nekā £250 gadā! <strong>Pieskarieties tam.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Atcelt abonementu' : 'Atcelt abonementu'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Apstiprināt' : 'Atcelt abonementu'}.</strong>`, hints: {keep: 'Šis turpina maksāt. Pieskarieties ' + (p === 'ios' ? 'Apstiprināt' : 'Atcelt abonementu') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Jūs izdzēšat lietotni Photo Editor no tālruņa. Vai tas aptur maksājumus?', options: [
            {t: 'Nē. Jāatceļ abonements, kā jūs tikko izdarījāt', ok: true, why: 'Tieši tā. Lietotnes dzēšana abonementu NEATCEĻ. Jūs turpināt maksāt, kamēr to neatceļat šeit.'},
            {t: 'Jā, lietotnes dzēšana to aptur', why: 'Tā nav! Jūs turpināt maksāt, kamēr neatceļat pašu abonementu, šeit.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Lieliski!</strong> Jūs esat ietaupījuši £4.99 nedēļā. Padoms: sākot bezmaksas izmēģinājumu, iestatiet modinātāju uz dienu pirms tā beigām. Laiku pa laikam pārbaudiet arī savas bankas lietotnes regulāro maksājumu sarakstu.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jaunākajiem iPhone ir <strong>Apple Intelligence</strong>: mākslīgais intelekts, kas raksta, apkopo un rediģē jūsu vietā. To var izslēgt. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Pieskarieties Apple Intelligence un Siri.</strong>', hint: 'Tas ir trešajā grupā, zem Pieejamība.'},
        {screen: c => list(p, 'Apple Intelligence un Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Rakstīšanas rīki, paziņojumu kopsavilkumi, Image Playground un citi.'},
            {caption: 'PAPLAŠINĀJUMI'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Izslēgts' : 'Ieslēgta'}, {caption: 'SIRI'}, {label: 'Runāt ar Siri', value: '“Siri” vai “Hey Siri”'}],
            {back: 'Iestatījumi', overlay: c.askOff ? dialog(p, 'Izslēgt Apple Intelligence?', 'Tādas funkcijas kā Rakstīšanas rīki un kopsavilkumi vairs nebūs pieejamas.', [['cancel', 'Atcelt'], ['confirm-off', 'Izslēgt']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Pieskarieties Apple Intelligence slēdzim,</strong> lai to izslēgtu.', hints: {chatgpt: 'ChatGPT darīsim nākamo. Vispirms pieskarieties Apple Intelligence slēdzim.'}},
        {screen: c => list(p, 'Apple Intelligence un Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'PAPLAŠINĀJUMI'}, {label: 'ChatGPT', value: 'Ieslēgta'}],
            {back: 'Iestatījumi', overlay: dialog(p, 'Izslēgt Apple Intelligence?', 'Tādas funkcijas kā Rakstīšanas rīki un kopsavilkumi vairs nebūs pieejamas.', [['cancel', 'Atcelt'], ['confirm-off', 'Izslēgt']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Pieskarieties Izslēgt.</strong>'},
        {screen: c => list(p, 'Apple Intelligence un Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'PAPLAŠINĀJUMI'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Ieslēgta'}], {back: 'Iestatījumi'}),
         target: 'chatgpt', say: 'ChatGPT paplašinājums var sūtīt jūsu jautājumus uz ChatGPT, uzņēmumu ārpus Apple. <strong>Pieskarieties ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Izmantot ChatGPT', toggle: !c.gptOff, sub: 'Siri var sūtīt pieprasījumus uz ChatGPT.'}], {back: 'Atpakaļ'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Pieskarieties Izmantot ChatGPT,</strong> lai to izslēgtu.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Izmantot ChatGPT', toggle: false}], {back: 'Atpakaļ'}),
         question: {q: 'WhatsApp, Facebook un citām lietotnēm ir arī MI tērzēšana. Kāds ir drošais noteikums?', options: [
            {t: 'Nekad nerakstīt personiskus datus (banka, veselība, paroles, adreses) nevienā MI tērzēšanā', ok: true, why: 'Jā. To, ko rakstāt, var glabāt un izmantot MI apmācīšanai. Uzskatiet to par sarunu ar svešinieku.'},
            {t: 'MI tērzēšana ir privāta, tāpēc der viss', why: 'Tās nav privātas kā tālruņa zvans. To, ko rakstāt, var glabāt. Neierakstiet tajās personiskus datus.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Izmantot ChatGPT', toggle: false}], {back: 'Atpakaļ'}), done: true,
         say: '<strong>Lieliski!</strong> Apple Intelligence un ChatGPT ir izslēgti. Jebkurā laikā varat tos atkal ieslēgt tajā pašā vietā. Siri joprojām darbojas kā parasti.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Android tālruņiem tagad ir <strong>Gemini</strong>, Google mākslīgais intelekts. Turot ieslēgšanas pogu, tas var atvērties nejauši. Mainīsim to. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Pieskarieties Lietotnes.</strong>'},
        {screen: () => list(p, 'Lietotnes', [{caption: 'Nesen atvērtās lietotnes'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Skatīt visas 45 lietotnes'}, {id: 'default-apps', label: 'Noklusējuma lietotnes', sub: 'Asistenta, pārlūka un tālruņa lietotnes'}]),
         target: 'default-apps', say: '<strong>Pieskarieties Noklusējuma lietotnes.</strong>'},
        {screen: () => list(p, 'Noklusējuma lietotnes', [{label: 'Pārlūka lietotne', sub: 'Chrome'}, {id: 'assistant', label: 'Digitālā asistenta lietotne', sub: 'Gemini'}, {label: 'Tālruņa lietotne', sub: 'Tālrunis'}, {label: 'SMS lietotne', sub: 'Ziņas'}]),
         target: 'assistant', say: '<strong>Pieskarieties Digitālā asistenta lietotne.</strong>'},
        {screen: c => list(p, 'Digitālā asistenta lietotne', [{id: 'assistant-app', label: 'Noklusējuma digitālā asistenta lietotne', sub: c.noAssist ? 'Nav' : 'Gemini'}, {label: 'Izmantot tekstu no ekrāna', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Noklusējuma digitālā asistenta lietotne</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nav</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Pieskarieties Noklusējuma digitālā asistenta lietotne.</strong>'},
        {screen: c => list(p, 'Digitālā asistenta lietotne', [{label: 'Noklusējuma digitālā asistenta lietotne', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Noklusējuma digitālā asistenta lietotne</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nav</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Pieskarieties Nav.</strong> Gemini vairs neuzliks, kad turēsit ieslēgšanas pogu.', hints: {'assist-gemini': 'Tas atstāj Gemini. Pieskarieties Nav.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Tālāk neļaujiet Gemini paturēt to, ko tam rakstāt. <strong>Atveriet lietotni Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Sveika, Margaret<br><small>Kā šodien varu palīdzēt?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Pieskarieties savam profila attēlam</strong> augšā labajā pusē.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Pieskarieties Gemini lietotņu darbības.</strong> <em>Dažos tālruņos to sauc par Darbību saglabāšanu.</em>'},
        {screen: c => app(p, 'Gemini lietotņu darbības', `<p class="cf"><strong>${c.actOff ? 'Izslēgts' : 'Ieslēgta'}</strong><br>${c.actOff ? 'Jūsu tērzēšanas vairs netiek saglabātas jūsu kontā un netiek izmantotas Google MI uzlabošanai.' : 'Jūsu tērzēšanas tiek saglabātas jūsu Google kontā, un tās var pārskatīt, lai uzlabotu Google MI.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Izslēgt</button><button type="button" class="cj" data-tap="off-delete">Izslēgt un dzēst darbības</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Pieskarieties Izslēgt.</strong>'},
        {screen: c => app(p, 'Gemini lietotņu darbības', '<p class="cf"><strong>Ieslēgts</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Izslēgt</button><button type="button" class="cj" data-tap="off-delete">Izslēgt un dzēst darbības</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Pieskarieties Izslēgt un dzēst darbības,</strong> lai notīrītu arī to, ko tas jau saglabājis.', hints: {'off-only': 'Tas pārtrauc jaunu tērzēšanu saglabāšanu, bet atstāj vecās. Pieskarieties Izslēgt un dzēst darbības.'}},
        {screen: c => app(p, 'Gemini lietotņu darbības', '<p class="cf"><strong>Izslēgts</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook un citām lietotnēm ir arī MI tērzēšana. Kāds ir drošais noteikums?', options: [
            {t: 'Nekad nerakstīt personiskus datus (banka, veselība, paroles, adreses) nevienā MI tērzēšanā', ok: true, why: 'Jā. To, ko rakstāt, var glabāt un izmantot MI apmācīšanai. Uzskatiet to par sarunu ar svešinieku.'},
            {t: 'MI tērzēšana ir privāta, tāpēc der viss', why: 'Tās nav privātas kā tālruņa zvans. To, ko rakstāt, var glabāt. Neierakstiet tajās personiskus datus.'}]}},
        {screen: c => app(p, 'Gemini lietotņu darbības', '<p class="cf"><strong>Izslēgts</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Lieliski!</strong> Gemini vairs neuzliek no ieslēgšanas pogas un neglabā jūsu tērzēšanas. Samsung tālrunī skatiet arī <strong>Iestatījumi > Galaxy AI</strong>, kur katrai funkcijai ir savs slēdzis.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jūsu Apple Account glabā jūsu fotoattēlus, kontaktus un maksājumus. Pārbaudīsim, vai tas ir aizsargāts. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Pieskarieties savam vārdam</strong> augšā.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Personiskā informācija'}, {id: 'security', label: 'Pierakstīšanās un drošība'}, {id: 'payment', label: 'Maksājumi un piegāde'}, {id: 'subscriptions', label: 'Abonementi'}], {back: 'Iestatījumi'}),
         target: 'security', say: '<strong>Pieskarieties Pierakstīšanās un drošība.</strong>'},
        {screen: () => list(p, 'Pierakstīšanās un drošība', [{label: 'E-pasts un tālruņa numuri', sub: '+44 7700 900123'}, {label: 'Mainīt paroli'}, {caption: ' '}, {label: 'Divu faktoru autentifikācija', value: 'Ieslēgta'},
            {id: 'recovery', label: 'Konta atkopšana'}], {back: 'Apple Account'}),
         target: 'recovery', say: '<strong>Divu faktoru autentifikācija</strong> ir Ieslēgta: labi. Tas nozīmē, ka jaunai ierīcei pirms pieteikšanās vajadzīgs kods no jūsu tālruņa. Tagad <strong>pieskarieties Konta atkopšana</strong>.'},
        {screen: c => list(p, 'Konta atkopšana', [{caption: 'ATKOPŠANAS KONTAKTPERSONA'}, c.recovery ? {label: 'Sarah', sub: 'Gaida, līdz Sarah pieņems'} : {id: 'add-contact', label: 'Pievienot atkopšanas kontaktpersonu…', sub: 'Kāds, kam uzticaties un kas var palīdzēt atgūt piekļuvi jūsu kontam.'}],
            {back: 'Atpakaļ', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Izvēlieties atkopšanas kontaktpersonu</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (meita)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Ja kādreiz aizmirstat paroli, <strong>atkopšanas kontaktpersona</strong> var dabūt kodu, lai palīdzētu jums atgūt piekļuvi. Viņi neredz jūsu datus. <strong>Pieskarieties Pievienot atkopšanas kontaktpersonu.</strong>'},
        {screen: c => list(p, 'Konta atkopšana', [{caption: 'ATKOPŠANAS KONTAKTPERSONA'}, {label: 'Pievienot atkopšanas kontaktpersonu…'}],
            {back: 'Atpakaļ', overlay: `<div class="ei"><div class="cv"><p><strong>Izvēlieties atkopšanas kontaktpersonu</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (meita)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Izvēlieties kādu, kam uzticaties un kam ir iPhone. <strong>Pieskarieties Sarah.</strong>', hints: {'pick-dave': 'Šim vingrinājumam izvēlieties Sarah.'}},
        {screen: c => list(p, 'Konta atkopšana', [{caption: 'ATKOPŠANAS KONTAKTPERSONA'}, {label: 'Sarah', sub: 'Gaida, līdz Sarah pieņems'}], {back: 'Atpakaļ'}),
         question: {q: 'Kāds zvana un saka, ka ir no Apple. Viņš lūdz nolasīt 6 ciparu kodu, kas tikko parādījies jūsu tālrunī. Ko jūs darāt?', options: [
            {t: 'Nolieku klausuli. Nekad nedodu šo kodu nevienam', ok: true, why: 'Tieši tā. Šis kods ļauj kādam iekļūt jūsu kontā. Apple nekad nezvanīs un neprasīs to.'},
            {t: 'Nolasu to, viņi ir no Apple', why: 'Apple nekad neprasīs šo kodu. Ikviens, kam tas ir, var iekļūt jūsu kontā. Nolieciet klausuli.'}]}},
        {screen: c => list(p, 'Konta atkopšana', [{caption: 'ATKOPŠANAS KONTAKTPERSONA'}, {label: 'Sarah', sub: 'Gaida, līdz Sarah pieņems'}], {back: 'Atpakaļ'}), done: true,
         say: '<strong>Lieliski!</strong> Divu faktoru autentifikācija ir ieslēgta, un Sarah var palīdzēt jums atgūt piekļuvi. iPhone var arī atcerēties paroles jūsu vietā lietotnē <strong>Paroles</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Jūsu Google konts glabā jūsu e-pastus, fotoattēlus un kontaktus. Pievienosim tam otru slēdzeni. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Pieskarieties Google.</strong>', hint: 'Google ir netālu no saraksta apakšas.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Pārvaldiet savu Google kontu', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Rezerves kopija'}, {id: 'autofill', label: 'Automātiskā aizpilde'}]),
         target: 'manage', say: '<strong>Pieskarieties Pārvaldīt savu Google kontu.</strong>'},
        {screen: () => app(p, 'Google konts', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Pieskarieties Drošība</strong> augšā.'},
        {screen: c => list(p, 'Drošība', [{caption: 'Kā pierakstāties Google'}, {id: '2sv', label: 'Divpakāpju verifikācija', sub: c.twoOn ? 'Ieslēgta' : 'Izslēgts'}, {label: 'Parole', sub: 'Pēdējoreiz mainīts pirms 2 gadiem'}, {label: 'Atkopšanas tālrunis', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Divpakāpju verifikācija</strong> ir Izslēgta. Tas nozīmē, ka pierakstīšanās jaunā ierīcē prasa arī jūsu tālrunī nosūtītu kodu, tāpēc nozagtas paroles nepietiek. <strong>Pieskarieties tai.</strong>'},
        {screen: () => list(p, 'Divpakāpju verifikācija', [], {top: '<p class="cf">Jūsu tālruņa numurs: <strong>07700 900123</strong><br>Mēs nosūtīsim kodu uz šo numuru, lai pārbaudītu, vai tas ir jūsu.</p><button type="button" class="ce dk" data-tap="send-code">Nosūtīt kodu</button>'}),
         target: 'send-code', say: '<strong>Pieskarieties Nosūtīt kodu.</strong>'},
        {screen: c => list(p, 'Divpakāpju verifikācija', [], {top: `<div class="sd"><strong>ZIŅAS · tikko</strong><span>G-382605 ir jūsu Google verifikācijas kods.</span></div>
            <p class="cf">Ievadiet kodu, ko nosūtījām uz 07700 900123</p>${field('gcode', 'Ievadiet kodu', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Tālāk</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Ierakstiet 6 ciparus no ziņas: 382605.',
         say: 'Pienāk īsziņa ar kodu. <strong>Lodziņā ierakstiet 382605</strong> un <strong>pieskarieties Tālāk</strong>. <em>(Vingrināšanās kods. Nekad nerakstiet īstu kodu nekur citur, kā tikai tur, kur paši to pieprasījāt.)</em>'},
        {screen: () => list(p, 'Divpakāpju verifikācija', [], {top: '<p class="cf">Jūsu tālruņa numurs ir pārbaudīts ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Ieslēgt divpakāpju verifikāciju</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Pieskarieties Ieslēgt divpakāpju verifikāciju.</strong>'},
        {screen: c => list(p, 'Drošība', [{caption: 'Kā pierakstāties Google'}, {label: 'Divpakāpju verifikācija', sub: 'Ieslēgta ⟦check⟧'}, {label: 'Atkopšanas tālrunis', sub: '07700 900123'}]),
         question: {q: 'Kāds zvana un saka, ka ir no Google. Viņš lūdz nolasīt kodu, kas tikko nosūtīts jums īsziņā. Ko jūs darāt?', options: [
            {t: 'Nolieku klausuli. Nekad nedodu šo kodu nevienam', ok: true, why: 'Tieši tā. Šis kods ļauj kādam iekļūt jūsu kontā. Google nekad nezvanīs un neprasīs to.'},
            {t: 'Nolasu to, viņi ir no Google', why: 'Google nekad neprasīs šo kodu. Ikviens, kam tas ir, var iekļūt jūsu kontā. Nolieciet klausuli.'}]}},
        {screen: c => list(p, 'Drošība', [{caption: 'Kā pierakstāties Google'}, {label: 'Divpakāpju verifikācija', sub: 'Ieslēgta ⟦check⟧'}]), done: true,
         say: '<strong>Lieliski!</strong> Jūsu Google kontam tagad vajadzīgs gan jūsu tālrunis, gan parole. Google var atcerēties arī jūsu paroles: iestatījumos meklējiet <strong>Google paroļu pārvaldnieku</strong>.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Burvīga pastaiga gar jūras krastu šorīt! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Nākamā pastaiga: sestdien, plkst. 10:00, no ostas.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Nav jaunu draudzības pieprasījumu.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Skatīt savu profilu</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Iestatījumi un privātums</strong></button><div class="ck"><strong>Palīdzība un atbalsts</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Parūpēsimies, lai jūsu ierakstus redz tikai draugi. <strong>Atveriet Facebook.</strong> <em>(Vingrināšanās versija. Nav īstā lietotne.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Pieskarieties Izvēlne</strong> apakšā labajā pusē.', hints: {'tab-friends': 'Pie draudzības pieprasījumiem nonāksim pēc brīža. Vispirms pieskarieties Izvēlne.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Pieskarieties Iestatījumi un privātums</strong>.'},
        {screen: c => list(p, 'Iestatījumi', [{caption: 'Auditorija un redzamība'}, {id: 'posts', label: 'Ieraksti', sub: 'Kas var redzēt jūsu turpmākos ierakstus: ' + (c.audience || 'Publiski')}, {label: 'Profila informācija'}, {label: 'Kā cilvēki jūs atrod un sazinās ar jums'},
            {caption: 'Jūsu darbības'}, {label: 'Darbību žurnāls'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Kas var redzēt jūsu turpmākos ierakstus?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Publiski<small>Ikviens Facebook vai ārpus tā</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Draugi<small>Jūsu draugi Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tikai es</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Jūsu ieraksti ir iestatīti uz <strong>Publiski</strong>: tos var redzēt ikviens pasaulē. <strong>Pieskarieties Ieraksti.</strong>'},
        {screen: c => list(p, 'Iestatījumi', [{caption: 'Auditorija un redzamība'}, {label: 'Ieraksti', sub: 'Kas var redzēt jūsu turpmākos ierakstus: Publiski'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Kas var redzēt jūsu turpmākos ierakstus?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Publiski<small>Ikviens Facebook vai ārpus tā</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Draugi<small>Jūsu draugi Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tikai es</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Draugi'; }, say: '<strong>Pieskarieties Draugi.</strong>',
         hints: {'aud-public': 'Publiski ir tas, kas bija. Pieskarieties Draugi.', 'aud-me': 'Tikai es nozīmē, ka neviens cits neredz jūsu ierakstus. Pieskarieties Draugi.'}},
        {screen: c => list(p, 'Iestatījumi', [{caption: 'Auditorija un redzamība'}, {label: 'Ieraksti', sub: 'Kas var redzēt jūsu turpmākos ierakstus: Draugi ⟦check⟧'}, {id: 'back-feed', label: '‹ Atpakaļ uz Facebook'}]),
         target: 'back-feed', say: 'Gatavs. Tagad <strong>pieskarieties Atpakaļ uz Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Jums ir draudzības pieprasījums. <strong>Pieskarieties Draugi.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Draudzības pieprasījums no “Jean Smith”. Taču jūs jau esat draugi ar Jean (viņa ir jūsu plūsmā). Kas notiek?', options: [
            {t: 'Tā, visticamāk, ir Jean profila kopija, ko izveidojis krāpnieks', ok: true, why: 'Jā. Krāpnieki nokopē kāda vārdu un fotoattēlu, tad raksta viņa draugiem un lūdz naudu. Īstā Jean jau ir jūsu draudzene.'},
            {t: 'Jean droši vien ir otrs konts', why: 'Iespējams, bet daudz ticamāk, ka tā ir krāpnieka veidota kopija: tā izveidota pirms 2 dienām. Pārbaudiet pie Jean pa tālruni.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Pieskarieties Dzēst,</strong> lai noraidītu pieprasījumu.', hints: {'confirm-jean': 'Neapstipriniet nokopētu profilu. Pieskarieties Dzēst.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Lieliski!</strong> Jūsu ieraksti ir tikai draugiem, un esat izvairījušies no viltus profila. Pastāstiet Jean, lai viņa var par to ziņot. Uzmanieties arī no Marketplace pircējiem, kas vēlas maksāt “ar kurjeru” vai prasa uz jūsu tālruni nosūtītus kodus.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Meklēt šeit'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Autobusu un vilcienu stacija, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Slimnīca, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Baznīca, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Autobusu un vilcienu stacija · 25 jūdzes</small><button type="button" class="ce co" data-tap="directions">Norādes</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min (25 jūdzes)</strong><small>Ātrākais maršruts pa A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Ejiet 4 min līdz <strong>Bridlington Bus Station</strong>, 3. platforma</li>
                <li>⟦bus⟧ <strong>121</strong> uz Hull · 10:15 · <b class="ahy">Laikā</b></li><li>Izkāpiet pieturā <strong>Hull Paragon Interchange</strong> (24 pieturas)</li></ol>
                <button type="button" class="ce co" data-tap="start">Sākt</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Kartes var saplānot autobusa braucienu ar reāllaika informāciju. Dosimies uz Hull ar autobusu. <strong>Atveriet Kartes.</strong>' + (p === 'ios' ? ' <em>(Google Maps darbojas tāpat, ja vēlaties to.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Pieskarieties meklēšanas lodziņam</strong> augšā.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Mēs ierakstījām “Hull interchange”. <strong>Pieskarieties Hull Paragon Interchange,</strong> autobusu stacijai.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Pieskarieties Norādes.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Vispirms tiek rādīts brauciens ar auto. <strong>Pieskarieties autobusam</strong> ⟦bus⟧, lai redzētu sabiedrisko transportu.', hints: {'mode-walk': 'Astoņas stundas! Tā vietā pieskarieties autobusam.', 'mode-car': 'Tas ir brauciens ar auto. Pieskarieties autobusam.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Šeit ir autobusi, tuvākais pirmais. “Laikā” ir reāllaika informācija. <strong>Pieskarieties 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Kur jāiekāpj autobusā?', options: [
            {t: 'Bridlington Bus Station, 3. platforma', ok: true, why: 'Jā. Kartes pasaka, kur iet, kurš autobuss un kur izkāpt.'},
            {t: 'Hull Paragon Interchange', why: 'Tur izkāpjat. Autobusā iekāpjat Bridlington Bus Station, 3. platformā.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Lieliski!</strong> Īstā braucienā pieskarieties <strong>Sākt</strong>, un Kartes pateiks, kad tuvojas jūsu pietura. Ar autobusa biļeti to vienkārši parādiet vadītājam kā parasti. <em>(Tikai vingrināšanās laiki: patiesos pārbaudiet attiecīgajā dienā.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Ārkārtas SOS</strong> zvana uz 999 jūsu vietā un nosūta jūsu atrašanās vietu īsziņā cilvēkiem, kurus izvēlaties. Pārbaudīsim, vai tas ir gatavs. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Pieskarieties Ārkārtas SOS.</strong>', hint: 'Tas ir trešajā grupā, ar sarkanu ikonu.'},
        {screen: c => list(p, 'Ārkārtas SOS', [{label: 'Zvanīt, turot un atlaižot', toggle: true, sub: 'Turiet sānu pogu un skaļuma pogu, tad atlaidiet.'},
            {id: 'five', label: 'Zvanīt ar 5 pogas nospiešanām', toggle: !!c.five, sub: 'Ātri piecas reizes nospiediet sānu pogu.'}, {caption: ' '},
            {id: 'contacts', label: 'Iestatīt ārkārtas kontaktpersonas lietotnē Veselība'}, {label: 'Avārijas noteikšana', toggle: true, sub: 'Zvana uz 999 pēc smagas autoavārijas.'}], {back: 'Iestatījumi'}),
         target: 'five', action: c => { c.five = true; }, say: 'Sānu pogas piecas reizes nospiešanu ir viegli atcerēties panikā. <strong>Ieslēdziet Zvanīt ar 5 pogas nospiešanām.</strong>'},
        {screen: c => list(p, 'Ārkārtas SOS', [{label: 'Zvanīt, turot un atlaižot', toggle: true}, {label: 'Zvanīt ar 5 pogas nospiešanām', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Iestatīt ārkārtas kontaktpersonas lietotnē Veselība'}], {back: 'Iestatījumi', overlay: c.pick ? sheet('Pievienot ārkārtas kontaktpersonu', [['pick-sarah', 'Sarah', 'Meita · 07700 900333'], ['pick-dave', 'Dave', 'Draugs']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Tagad izvēlieties, kurš saņems īsziņu ar jūsu atrašanās vietu. <strong>Pieskarieties Iestatīt ārkārtas kontaktpersonas.</strong>'},
        {screen: () => list(p, 'Ārkārtas SOS', [{label: 'Zvanīt ar 5 pogas nospiešanām', toggle: true}], {back: 'Iestatījumi', overlay: sheet('Pievienot ārkārtas kontaktpersonu', [['pick-sarah', 'Sarah', 'Meita · 07700 900333'], ['pick-dave', 'Dave', 'Draugs']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Pieskarieties Sarah,</strong> savai meitai.', hints: {'pick-dave': 'Šim vingrinājumam izvēlieties Sarah.'}},
        {screen: () => list(p, 'Ārkārtas SOS', [{label: 'Zvanīt ar 5 pogas nospiešanām', toggle: true}, {caption: 'ĀRKĀRTAS KONTAKTPERSONAS'}, {label: 'Sarah', sub: 'Meita'}], {back: 'Iestatījumi'}),
         question: {q: 'Jūs esat nokrituši un nevarat pareizi aizsniegt tālruņa ekrānu. Ko jūs darāt?', options: [
            {t: 'Ātri piecas reizes nospiest sānu pogu', ok: true, why: 'Jā. Sākas atpakaļskaitīšana, tad tas zvana uz 999 un nosūta Sarah īsziņu, kur jūs atrodaties.'},
            {t: 'Atbloķēt tālruni un atrast lietotni Tālrunis', why: 'Tas ir lēni ārkārtas situācijā. Sānu pogas piecas reizes nospiešana darbojas, pat ja tālrunis ir bloķēts.'}]}},
        {screen: () => list(p, 'Ārkārtas SOS', [{label: 'Zvanīt ar 5 pogas nospiešanām', toggle: true}, {caption: 'ĀRKĀRTAS KONTAKTPERSONAS'}, {label: 'Sarah', sub: 'Meita'}], {back: 'Iestatījumi'}), done: true,
         say: '<strong>Lieliski!</strong> Ārkārtas SOS ir gatavs, un Sarah uzzinās, kur jūs atrodaties. Ja nospiežat to kļūdas pēc, atpakaļskaitīšanas laikā vienkārši pieskarieties Apturēt.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Ārkārtas SOS</strong> zvana uz 999 jūsu vietā un nosūta jūsu atrašanās vietu īsziņā cilvēkiem, kurus izvēlaties. Pārbaudīsim, vai tas ir gatavs. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Pieskarieties Drošība un ārkārtas situācijas.</strong> <em>Samsung tālrunī tas ir Drošība un ārkārtas situācijas.</em>', hint: 'Ritiniet uz leju: tas ir netālu no apakšas.'},
        {screen: () => list(p, 'Drošība un ārkārtas situācijas', [{id: 'medical', label: 'Medicīniskā informācija'}, {id: 'contacts-ec', label: 'Ārkārtas kontaktpersonas'}, {id: 'sos', label: 'Ārkārtas SOS', sub: 'Izslēgts'}, {label: 'Autoavārijas noteikšana'}]),
         target: 'sos', say: 'Ārkārtas SOS ir <strong>Izslēgts</strong>. <strong>Pieskarieties Ārkārtas SOS.</strong>'},
        {screen: c => list(p, 'Ārkārtas SOS', [{id: 'sos-toggle', label: 'Izmantot Ārkārtas SOS', toggle: !!c.sosOn, sub: 'Nospiediet ieslēgšanas pogu 5 reizes vai vairāk, lai sāktu ārkārtas darbības.'}, {label: 'Kopīgot informāciju ar ārkārtas kontaktpersonām', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Pieskarieties Izmantot Ārkārtas SOS,</strong> lai to ieslēgtu.'},
        {screen: () => list(p, 'Drošība un ārkārtas situācijas', [{id: 'medical', label: 'Medicīniskā informācija'}, {id: 'contacts-ec', label: 'Ārkārtas kontaktpersonas', sub: 'Nav'}, {label: 'Ārkārtas SOS', sub: 'Ieslēgta'}]),
         target: 'contacts-ec', say: 'Tagad izvēlieties, kurš saņems īsziņu ar jūsu atrašanās vietu. <strong>Pieskarieties Ārkārtas kontaktpersonas.</strong>'},
        {screen: c => list(p, 'Ārkārtas kontaktpersonas', [{id: 'add', label: '＋ Pievienot kontaktpersonu'}], {overlay: c.pick ? sheet('Izvēlieties kontaktpersonu', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Pieskarieties Pievienot kontaktpersonu.</strong>'},
        {screen: () => list(p, 'Ārkārtas kontaktpersonas', [{label: '＋ Pievienot kontaktpersonu'}], {overlay: sheet('Izvēlieties kontaktpersonu', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Pieskarieties Sarah,</strong> savai meitai.', hints: {'pick-dave': 'Šim vingrinājumam izvēlieties Sarah.'}},
        {screen: () => list(p, 'Ārkārtas kontaktpersonas', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Pievienot kontaktpersonu'}]),
         question: {q: 'Jūs esat nokrituši un nevarat pareizi aizsniegt tālruņa ekrānu. Ko jūs darāt?', options: [
            {t: 'Ātri piecas reizes nospiest ieslēgšanas pogu', ok: true, why: 'Jā. Sākas atpakaļskaitīšana, tad tas zvana uz 999 un kopīgo jūsu atrašanās vietu ar Sarah.'},
            {t: 'Atbloķēt tālruni un atrast lietotni Tālrunis', why: 'Tas ir lēni ārkārtas situācijā. Ieslēgšanas pogas piecas reizes nospiešana darbojas, pat ja tālrunis ir bloķēts.'}]}},
        {screen: () => list(p, 'Ārkārtas kontaktpersonas', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Lieliski!</strong> Ārkārtas SOS ir ieslēgts, un Sarah uzzinās, kur jūs atrodaties. Ja nospiežat to kļūdas pēc, atpakaļskaitīšanas laikā pieskarieties Atcelt.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Ārkārtas brīdinājumi ļauj uzzināt par tuvumā esošām briesmām, piemēram, nopietniem plūdiem. Kāds šajā tālrunī vienu ir izslēdzis. Salabosim to. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Pieskarieties Paziņojumi.</strong>'},
            {screen: c => list(p, 'Paziņojumi', [{label: 'Rādīt priekšskatījumus', value: 'Vienmēr'}, {caption: 'PAZIŅOJUMU STILS'}, {label: 'Ziņas', sub: 'Joslas, skaņas, nozīmītes'}, {label: 'WhatsApp', sub: 'Joslas, skaņas, nozīmītes'},
                {caption: 'VALDĪBAS BRĪDINĀJUMI'}, {label: 'Ārkārtas brīdinājumi', toggle: true}, {id: 'severe', label: 'Nopietni brīdinājumi', toggle: !!c.severe}, {label: 'Testa brīdinājumi', toggle: false}], {back: 'Iestatījumi'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Valdības brīdinājumi ir pašā apakšā. <strong>Nopietni brīdinājumi</strong> ir izslēgti. <strong>Pieskarieties tiem, lai tos ieslēgtu.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Pieskarieties Drošība un ārkārtas situācijas.</strong>', hint: 'Tas ir netālu no saraksta apakšas.'},
            {screen: () => list(p, 'Drošība un ārkārtas situācijas', [{label: 'Medicīniskā informācija'}, {label: 'Ārkārtas SOS'}, {id: 'wea', label: 'Bezvadu ārkārtas brīdinājumi'}, {label: 'Nezināmu izsekotāju brīdinājumi'}]),
             target: 'wea', say: '<strong>Pieskarieties Bezvadu ārkārtas brīdinājumi.</strong> <em>Dažos tālruņos to sauc par Ārkārtas brīdinājumiem.</em>'},
            {screen: c => list(p, 'Bezvadu ārkārtas brīdinājumi', [{label: 'Atļaut brīdinājumus', toggle: true}, {label: 'Ārkārtēji draudi', toggle: true}, {id: 'severe', label: 'Nopietni draudi', toggle: !!c.severe}, {label: 'Testa brīdinājumi', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Nopietni draudi</strong> ir izslēgti. <strong>Pieskarieties tiem, lai tos ieslēgtu.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Ārkārtas brīdinājums: nopietns</strong><p>Pie jūras krasta gaidāmi nopietni plūdi. Dodieties uz augstāku vietu. Vairāk: gov.uk/alerts</p><button type="button" data-tap="ok">Labi</button></div>`,
         target: 'ok', say: 'Šādi izskatās brīdinājums. Tas skaļi sirēnē apmēram 10 sekundes, pat klusuma režīmā. <strong>Pieskarieties Labi.</strong> <em>(Tikai vingrināšanās.)</em>'},
        {screen: () => home(p), question: {q: 'Brīdinājums ienāk, kamēr jūs vadāt auto. Ko darīt?', options: [
            {t: 'Apstāties drošā vietā un tad izlasīt', ok: true, why: 'Jā. Nekad nelasiet tālruni, vadot auto. Apstājieties droši, tad izlasiet.'},
            {t: 'Izlasīt uzreiz, vadot auto', why: 'Nekad nelasiet tālruni, vadot auto. Vispirms atrodiet drošu vietu, kur apstāties.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Tālrunis tagad brīdinās jūs par nopietnām briesmām tuvumā. Īsti brīdinājumi nekad neprasa personiskus datus vai naudu: ja kāds prasa, tā ir krāpšana.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Trīs lietas, kas padara nozagtu tālruni zaglim daudz mazāk noderīgu. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Pieskarieties Face ID un piekļuves kods.</strong> <em>Īstā iPhone tālrunī nākamais solis būs ievadīt piekļuves kodu.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Ritiniet uz leju un <strong>pieskarieties Aizsardzība pret nozagtu ierīci</strong>.'},
            {screen: c => list(p, 'Aizsardzība pret nozagtu ierīci', [{id: 'sdp', label: 'Aizsardzība pret nozagtu ierīci', toggle: !!c.sdp, sub: 'Ārpus mājām piekļuves koda vai Apple Account maiņai vajadzīgs Face ID un 1 stundas gaidīšana.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Tas neļauj zagļim, kas vērojis, kā ievadāt piekļuves kodu, jūs izslēgt no tālruņa. <strong>Ieslēdziet to.</strong>'},
            {screen: () => list(p, 'Aizsardzība pret nozagtu ierīci', [{label: 'Aizsardzība pret nozagtu ierīci', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Tālāk paslēpiet ziņas bloķētajā ekrānā. <strong>Pieskarieties ‹ Face ID,</strong> lai atgrieztos.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Pieskarieties Paziņojumi.</strong>'},
            {screen: c => list(p, 'Paziņojumi', [{id: 'previews', label: 'Rādīt priekšskatījumus', value: c.previews || 'Vienmēr'}, {label: 'Ekrāna kopīgošana', value: 'Paziņojumi izslēgti'}], {back: 'Iestatījumi',
                overlay: c.pickPrev ? sheet('Rādīt priekšskatījumus', [['prev-always', 'Vienmēr'], ['prev-unlocked', 'Kad atbloķēts', 'Ieteicams'], ['prev-never', 'Nekad']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Pašlaik ikviens var lasīt jūsu ziņas, arī drošības kodus, neatbloķējot tālruni. <strong>Pieskarieties Rādīt priekšskatījumus.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Pieskarieties Google.</strong>', hint: 'Tas ir netālu no saraksta apakšas.'},
            {screen: () => list(p, 'Google', [{label: 'Pārvaldiet savu Google kontu'}, {id: 'all-services', label: 'Visi pakalpojumi'}, {label: 'Rezerves kopija'}]), target: 'all-services', say: '<strong>Pieskarieties Visi pakalpojumi.</strong>'},
            {screen: () => list(p, 'Visi pakalpojumi', [{caption: 'Personiskā un ierīces drošība'}, {id: 'theft', label: 'Aizsardzība pret zādzību'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Pieskarieties Aizsardzība pret zādzību.</strong>'},
            {screen: c => list(p, 'Aizsardzība pret zādzību', [{id: 'tdl', label: 'Zādzības atklāšanas bloķēšana', toggle: !!c.tdl, sub: 'Bloķē ekrānu, ja nojauš, ka kāds izrauj tālruni un aizbēg.'}, {label: 'Bezsaistes ierīces bloķēšana', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Ieslēdziet Zādzības atklāšanas bloķēšana.</strong> Ja kāds sagrābj tālruni un aizbēg, tas bloķējas pats.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Tālāk paslēpiet ziņas bloķētajā ekrānā. Atgriezušies Iestatījumos, <strong>pieskarieties Paziņojumi</strong>.'},
            {screen: c => list(p, 'Paziņojumi', [{id: 'previews', label: 'Paziņojumi bloķēšanas ekrānā', sub: c.previews || 'Rādīt visu saturu'}, {label: 'Paziņojumu vēsture'}], {
                overlay: c.pickPrev ? sheet('Paziņojumi bloķēšanas ekrānā', [['prev-always', 'Rādīt visu saturu'], ['prev-unlocked', 'Paslēpt sensitīvo saturu', 'Ieteicams'], ['prev-never', 'Nerādīt nekādus paziņojumus']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Pašlaik ikviens var lasīt jūsu ziņas, arī drošības kodus, neatbloķējot tālruni. <strong>Pieskarieties Paziņojumi bloķēšanas ekrānā.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Paziņojumi', [{label: 'Rādīt priekšskatījumus', value: 'Vienmēr'}], {back: 'Iestatījumi', overlay: sheet('Rādīt priekšskatījumus', [['prev-always', 'Vienmēr'], ['prev-unlocked', 'Kad atbloķēts', 'Ieteicams'], ['prev-never', 'Nekad']])})
                : list(p, 'Paziņojumi', [{label: 'Paziņojumi bloķēšanas ekrānā', sub: 'Rādīt visu saturu'}], {overlay: sheet('Paziņojumi bloķēšanas ekrānā', [['prev-always', 'Rādīt visu saturu'], ['prev-unlocked', 'Paslēpt sensitīvo saturu', 'Ieteicams'], ['prev-never', 'Nerādīt nekādus paziņojumus']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Kad atbloķēts' : 'Paslēpt sensitīvo saturu'}.</strong>`, hints: {'prev-always': 'Tā tas bija. Izvēlieties ieteicamo.', 'prev-never': 'Tas paslēpj tos pilnībā, kas var traucēt. Izvēlieties ieteicamo.'}},
        {screen: () => home(p), target: 'phone', say: 'Visbeidzot atrodiet sava tālruņa IMEI numuru. Jūsu operatoram tas vajadzīgs, lai bloķētu nozagtu tālruni. <strong>Atveriet lietotni Tālrunis.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'Uz ciparu tastatūras <strong>ievadiet *#06#</strong> (zvaigznīte, režģis, nulle, seši, režģis).', hint: 'Sāciet ar zvaigznītes taustiņu *, apakšā pa kreisi.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Ierīces informācija', 'IMEI: 35 209900 176148 1 (vingrināšanās numurs)', [['ok', 'Labi']])}),
         target: 'ok', say: 'Šis garais numurs ir jūsu <strong>IMEI</strong>. Īstā tālrunī pierakstiet to drošā vietā (ne tālrunī!). <strong>Pieskarieties Labi.</strong>'},
        {screen: () => home(p), question: {q: 'Jūsu tālrunis ir nozagts. Kam zvanāt vispirms?', options: [
            {t: 'Savai bankai, no kāda cita tālruņa', ok: true, why: 'Jā. Zagļi vispirms ķeras pie bankas lietotnēm. Pēc tam bloķējiet tālruni tiešsaistē, piezvaniet savam operatoram un ziņojiet par to uz 101.'},
            {t: 'Pagaidīt un paskatīties, vai tas atradīsies', why: 'Ātrums ir svarīgs. Nekavējoties piezvaniet savai bankai, tad bloķējiet tālruni un piezvaniet savam operatoram.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Jūsu tālruni zaglim ir daudz grūtāk lietot, un jūs zināt, kur atrast savu IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'FIND MY' : 'IZSEKOTĀJA BRĪDINĀJUMS', title: p === 'ios' ? 'AirTag atrasts kustībā kopā ar jums' : 'Nezināms izsekotājs pārvietojas kopā ar jums',
            text: '<br>Šī priekšmeta atrašanās vietu var redzēt tā īpašnieks.'}),
         target: 'alert', say: 'Tālrunis ir pamanījis izsekotāju, kas nav jūsu un pārvietojas kopā ar jums. Neuztraucieties: bieži tas kļūdas pēc pieder ģimenes loceklim. <strong>Pieskarieties brīdinājumam.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Nezināms AirTag' : 'Nezināms izsekotājs', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Redzēts kopā ar jums kopš <strong>10:12</strong> šodien, 4 vietās.</p>
            <button type="button" class="ce co" data-tap="play">Atskaņot skaņu</button>
            <button type="button" class="cp" data-tap="learn">Uzzināt par šo ${p === 'ios' ? 'AirTag' : 'Izsekotājs'}</button>
            <button type="button" class="cp" data-tap="disable">Atspējošanas norādījumi</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Karte rāda, kur tas ir bijis kopā ar jums. <strong>Pieskarieties Atskaņot skaņu,</strong> lai to atrastu.'},
        {screen: () => app(p, p === 'ios' ? 'Nezināms AirTag' : 'Nezināms izsekotājs', '<p class="cf">⟦volume-2⟧ <strong>Atskaņo skaņu…</strong><br>Klausieties čirpošu skaņu.</p>', {color: '#fff'}),
         question: {q: 'Jūs dzirdat vāju čirpšanu. Kur meklēt?', options: [
            {t: 'Somās, mēteļu kabatās, mašīnā un visā, ko esat aizņēmušies', ok: true, why: 'Jā. Izsekotāji ir mazi, apmēram lielas monētas izmērā, un bieži tiek paslēpti oderē, kabatās vai mašīnās.'},
            {t: 'Nekur, vienkārši ignorēt', why: 'Ir vērts to atrast. Pārbaudiet somas, kabatas un mašīnu: tas var būt vienkārši ģimenes locekļa.'}]}},
        {screen: c => app(p, 'Izsekotājs atrasts', `<p class="cf">Turiet tālruņa augšdaļu pie izsekotāja, lai uzzinātu vairāk par to.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Turiet pie izsekotāja</button>`, {color: '#fff'}),
         target: 'scan', say: 'Jūs to atradāt mēteļa oderē. <strong>Pieskarieties Turiet pie izsekotāja,</strong> lai redzētu, kam tas pieder.'},
        {screen: () => app(p, 'Par šo izsekotāju', '<p class="cf"><strong>Nav pazaudēšanas režīmā</strong><br>Sērijas numurs: P4R7-ACT1CE<br>Īpašnieka informācija tiek kopīgota tikai ar policiju.</p>', {color: '#fff'}),
         question: {q: 'Tas nav ģimenes locekļa, un jūs uztraucaties, ka kāds to paslēpis, lai jums sekotu. Ko jūs darāt?', options: [
            {t: 'Saglabāt to drošībā un aiznest policijai (vai zvanīt uz 999, ja esat briesmās)', ok: true, why: 'Jā. Nemetiet to prom: policija var atrast tā īpašnieku. Nacionālā vajāšanas palīdzības līnija ir 0808 802 0300.'},
            {t: 'Izmest atkritumu tvertnē', why: 'Tie var būt pierādījumi, un policija var atrast īpašnieku. Saglabājiet to un aiznesiet policijai vai zvaniet uz 999, ja esat briesmās.'}]}},
        {screen: () => app(p, 'Par šo izsekotāju', '<p class="cf">Palīdzība: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 stundas) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Lieliski!</strong> Jūs zināt, kā atrast izsekotāju un ko darīt. ' + (p === 'android' ? 'Pārbaudiet, vai brīdinājumi ir ieslēgti sadaļā <strong>Iestatījumi > Drošība un ārkārtas situācijas > Nezināmu izsekotāju brīdinājumi</strong>.' : 'iPhone tālruņi izsekotājus pārbauda automātiski.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Jūs esat uz klints takas, un kāds ir nokritis. Adreses nav. Kad zvanāt uz 999, lielākā daļa tālruņu automātiski nosūta jūsu atrašanās vietu, bet trīs vārdi palīdz arī. <strong>Atveriet what3words.</strong> <em>(Vingrināšanās versija.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Zilais punkts esat jūs. Katram 3 metru kvadrātam ir savi trīs vārdi. Jūsu vārdi ir <strong>puffin.chalk.lantern</strong>. Pagaidiet brīdi, līdz punkts nostabilizējas, tad <strong>pieskarieties I\'ve got my 3 words</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Tagad zvaniet uz 999. <strong>Atveriet lietotni Tālrunis.</strong> <em>(Tikai vingrināšanās: nekad nezvaniet uz 999 izmēģinājumam.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Ievadiet 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Pieskarieties zaļajai zvana pogai.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Ārkārtas zvans · 0:08</small></div>
            <p class="hi">“Ārkārtas dienests, kuru dienestu? … Ātro palīdzību. Kur tieši notikusi ārkārtas situācija?”</p>${homeIndicator(p)}</div>`,
         question: {q: 'Zvanu pieņēmējs jautā, kur jūs atrodaties. Ko jūs sakāt?', options: [
            {t: '“Esmu uz klints takas. Mana what3words adrese ir puffin, chalk, lantern.”', ok: true, why: 'Jā. Pasakiet, kur atrodaties, saviem vārdiem, tad nosauciet trīs vārdus. Ja prasa, izsakiet jebkuru vārdu pa burtiem.'},
            {t: '“Nezinu, kaut kur pie jūras”', why: 'Viņi centīsies jūs atrast, bet trīs vārdi nosaka jūsu vietu ar 3 metru precizitāti. Nolasiet tos no lietotnes.'}]}},
        {screen: () => home(p), question: {q: 'Draugs ir kurls un nevar veikt balss zvanus. Kā viņš var sazināties ar 999?', options: [
            {t: 'Jau tagad reģistrēties ārkārtas īsziņām (nosūtīt “register” uz 999) vai izmantot lietotni 999 BSL', ok: true, why: 'Jā. Ārkārtas īsziņas darbojas tikai tad, ja vispirms reģistrējaties. Lietotne 999 BSL savieno ar zīmju valodas tulku.'},
            {t: 'Viņi nevar', why: 'Var. Reģistrējieties ārkārtas īsziņām, nosūtot “register” uz 999, vai izmantojiet bezmaksas lietotni 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Atcerieties: pasakiet, kur atrodaties, tad nosauciet savus trīs vārdus. Lietotne what3words bez signāla atrod jūsu vārdus, bet zvanīšanai signāls ir vajadzīgs.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Nereaģē</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Jūsu tālrunis ir iesprūdis: pieskaršanās neko nedara, un tas neizslēdzas parastajā veidā. Vai tā ir liela problēma?', options: [
            {t: 'Parasti nē. “Piespiedu restartēšana” to novērš, un jūs neko nezaudējat', ok: true, why: 'Pareizi. Piespiedu restartēšana ir kā izslēgšana no kontaktligzdas. Jūsu fotoattēli un ziņas ir drošībā.'},
            {t: 'Jā, tas ir salūzis', why: 'Parasti nē! Piespiedu restartēšana novērš lielāko daļu iesaldētu tālruņu, un jūs neko nezaudējat.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'iPhone tālrunī: <strong>nospiediet un atlaidiet skaļuma palielināšanu</strong>, tad <strong>nospiediet un atlaidiet skaļuma samazināšanu</strong>, tad <strong>turiet nospiestu sānu pogu</strong>, līdz parādās Apple logotips (apmēram 10 sekundes). Šeit pieskarieties tām šādā secībā.'
            : 'Lielākajā daļā Android tālruņu: <strong>kopā turiet nospiestu ieslēgšanas pogu un skaļuma samazināšanu</strong> apmēram 10 sekundes, līdz tas restartējas. Šeit pieskarieties ieslēgšanai, tad skaļuma samazināšanai. <em>(Google Pixel: turiet tikai ieslēgšanas pogu 30 sekundes.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Vispirms ir skaļuma palielināšana.' : 'Sāciet ar ieslēgšanas pogu.', side: 'Sānu poga ir pēdējā, pēc abām skaļuma pogām.'},
         hint: p === 'ios' ? 'Skaļuma palielināšana, tad skaļuma samazināšana, tad sānu poga.' : 'Ieslēgšana, tad skaļuma samazināšana.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Logotips ir parādījies. Ko tagad?', options: [
            {t: 'Atlaist un pagaidīt, līdz tas startē', ok: true, why: 'Jā. Tas aizņem minūti. Iespējams, vienreiz būs jāievada piekļuves kods.'},
            {t: 'Turpināt spiest visas pogas', why: 'Atlaidiet, kad parādās logotips, un dodiet tam minūti, lai startētu.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Lieliski!</strong> Jūsu tālrunis ir restartējies. Ja tas turpina iesalt, pārbaudiet atjauninājumus un atbrīvojiet krātuvi. Restartējot tālruni reizi nedēļā, tas darbojas raiti.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Ieslēgta' : 'Izslēgts'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Izslēgts' : (ctx.signal ? 'Ieslēgts · 4G' : 'Nav pakalpojuma')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Izslēgts' : 'Sākums'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Velciet uz augšu, lai aizvērtu' : 'Aizvērt'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Nav pakalpojuma</span>'), target: 'pull-down',
         say: 'Tālrunis rāda <strong>Nav pakalpojuma</strong>, kaut gan šorīt darbojās. Ātrs risinājums ir ieslēgt un izslēgt Lidmašīnas režīmu, kas liek tam pievienoties no jauna. ' + (p === 'ios' ? '<strong>Velciet uz leju no augšējā labā stūra</strong> (vai pieskarieties joslai).' : '<strong>Velciet uz leju no augšas</strong> (vai pieskarieties joslai).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Pieskarieties Lidmašīnas režīms,</strong> lai to ieslēgtu. Viss bezvadu izslēdzas.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Pagaidiet apmēram 10 sekundes… tad <strong>vēlreiz pieskarieties Lidmašīnas režīms,</strong> lai to izslēgtu.'},
        {screen: c => quickPanel(p, c), question: {q: 'Mobilie dati atkal ir ieslēgti 4G. Kad vēl noder Lidmašīnas režīms?', options: [
            {t: 'Lidmašīnā vai ārzemēs, lai izvairītos no viesabonēšanas maksas (Wi-Fi joprojām var ieslēgt)', ok: true, why: 'Jā. Kamēr Lidmašīnas režīms ir ieslēgts, Wi-Fi varat ieslēgt atpakaļ, lai izmantotu viesnīcas vai kuģa Wi-Fi.'},
            {t: 'Lai uzlādētu tālruni', why: 'Tas uzlādējas mazliet ātrāk, taču galvenokārt paredzēts lidojumiem un viesabonēšanas maksas novēršanai ārzemēs.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Lieliski!</strong> Ja Lidmašīnas režīms nepalīdz, restartējiet tālruni. Joprojām nav pakalpojuma? Operatora vietnē pārbaudiet, vai jūsu apvidū nav problēmu.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · tikko</strong><span>🎁 Jūsu BEZMAKSAS dzīvības jūs gaida! Atgriezieties un spēlējiet! 🎉</span></button>',
         target: 'settings', say: 'Kāda spēle nemitīgi sūta bezjēdzīgas ziņas. Paziņojumus varat izslēgt jebkurai lietotnei. <strong>Pieskarieties Iestatījumi,</strong> nevis ziņai.', hints: {notif: 'Tas atver spēli. Tā vietā pieskarieties Iestatījumi.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Pieskarieties Paziņojumi.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Paziņojumi', [{label: 'Rādīt priekšskatījumus', value: 'Kad atbloķēts'}, {caption: 'PAZIŅOJUMU STILS'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Joslas, skaņas, nozīmītes'}, {label: 'Ziņas', sub: 'Joslas, skaņas, nozīmītes'}, {label: 'WhatsApp', sub: 'Joslas, skaņas, nozīmītes'}], {back: 'Iestatījumi'})
            : list(p, 'Paziņojumi', [{id: 'app-notifs', label: 'Lietotņu paziņojumi'}, {id: 'history', label: 'Paziņojumu vēsture'}, {label: 'Paziņojumi bloķēšanas ekrānā'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Pieskarieties Bubble Pop.</strong>' : '<strong>Pieskarieties Lietotņu paziņojumi.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Lietotņu paziņojumi', [{label: 'Ziņas', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Pieskarieties slēdzim blakus Bubble Pop,</strong> lai izslēgtu tās paziņojumus.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Atļaut paziņojumus', toggle: !c.off}], {back: 'Paziņojumi'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Izslēdziet Atļaut paziņojumus.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Paziņojumi', [{label: 'Lietotņu paziņojumi'}, {id: 'history', label: 'Paziņojumu vēsture', sub: 'Izslēgts'}]), target: 'history',
             say: 'Noderīgs papildinājums: ja kādreiz kļūdas pēc noņemat ziņu ar vilkšanu, Paziņojumu vēsture glabā kopiju. <strong>Pieskarieties Paziņojumu vēsture.</strong>'},
            {screen: c => list(p, 'Paziņojumu vēsture', [{id: 'hist-toggle', label: 'Izmantot paziņojumu vēsturi', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Ieslēdziet to.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Kuru lietotņu paziņojumus ir vērts atstāt ieslēgtus?', options: [
            {t: 'Ziņas, zvanus, WhatsApp, banku un visu, par ko vēlētos uzzināt uzreiz', ok: true, why: 'Jā. Paturiet svarīgos un izslēdziet spēles, veikalus un visu, kas tikai uzmācas.'},
            {t: 'Izslēgt visus', why: 'Jūs nokavētu ziņas un zvanus! Paturiet svarīgos un izslēdziet spēles un iepirkšanās lietotnes.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Lieliski!</strong> Bubble Pop jūs vairs netraucēs. ' + (p === 'ios' ? 'Ja kļūdas pēc noņemat ziņu ar vilkšanu, velciet uz augšu no bloķētā ekrāna vidus, lai redzētu agrākās.' : 'Un paziņojumu vēsture glabā kopiju visam, ko noņemat ar vilkšanu.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Tiekamies dumpīgajā dārzu centrā x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Īsziņa</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Jūs uzrakstījāt “Dunnington dārzu centrs”, un tālrunis to nomainīja. Kāpēc?', options: [
            {t: 'Automātiskā labošana uzminēja nepareizu vārdu', ok: true, why: 'Jā. Automātiskā labošana aizvieto vārdus, kurus tā nepazīst. Varat to izslēgt vai iemācīt tai jaunus vārdus.'},
            {t: 'Tālrunis ir salūzis', why: 'Tā tikai automātiskā labošana minēja. Varat to izslēgt vai iemācīt tai vārdus.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Pieskarieties Vispārīgi.</strong>'},
            {screen: () => list(p, 'Vispārīgi', [{label: 'Par'}, {label: 'Programmatūras atjaunināšana'}, {id: 'keyboard', label: 'Tastatūra'}, {label: 'Valoda un reģions'}], {back: 'Iestatījumi'}), target: 'keyboard', say: '<strong>Pieskarieties Tastatūra.</strong>'},
            {screen: c => list(p, 'Tastatūras', [{id: 'replace', label: 'Teksta aizstāšana'}, {caption: 'VISAS TASTATŪRAS'}, {label: 'Automātiskie lielie burti', toggle: true}, {id: 'ac', label: 'Automātiskā labošana', toggle: !c.acOff}, {label: 'Teksta prognozēšana', toggle: true}], {back: 'Vispārīgi'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Izslēdziet Automātiskā labošana.</strong> Pareizrakstības kļūdām joprojām tiek pasvītrots sarkans, tāpēc varat tās labot paši.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Pieskarieties Sistēma.</strong> Tā ir apakšā.'},
            {screen: () => list(p, 'Sistēma', [{id: 'keyboard', label: 'Tastatūra'}, {label: 'Valodas'}, {label: 'Datums un laiks'}]), target: 'keyboard', say: '<strong>Pieskarieties Tastatūra.</strong>'},
            {screen: () => list(p, 'Tastatūra', [{id: 'gboard', label: 'Gboard', sub: 'Ekrāna tastatūra'}]), target: 'gboard', say: '<strong>Pieskarieties Gboard.</strong> <em>Samsung tālrunī tas ir Samsung tastatūra > Gudrā rakstīšana.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferences'}, {id: 'correction', label: 'Teksta labošana'}, {label: 'Rakstīšana ar slidināšanu'}]), target: 'correction', say: '<strong>Pieskarieties Teksta labošana.</strong>'},
            {screen: c => list(p, 'Teksta labošana', [{label: 'Rādīt ieteikumu joslu', toggle: true}, {id: 'ac', label: 'Automātiskā labošana', toggle: !c.acOff}, {label: 'Pareizrakstības pārbaude', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Izslēdziet Automātiskā labošana.</strong> Pareizrakstības kļūdām joprojām tiek pasvītrots sarkans, tāpēc varat tās labot paši.'},
        ]),
        {screen: () => home(p), question: {q: 'Jūs labāk paturētu automātisko labošanu, bet tā vienmēr maina “Dunnington”. Ko vēl varētu darīt?', options: [
            {t: 'Pievienot to tālruņa vārdnīcai, lai tas iemācās vārdu', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Izmantojiet Teksta aizstāšanu tajos pašos tastatūras iestatījumos.' : 'Pieskarieties vārdam ieteikumu joslā un izvēlieties pievienot to vārdnīcai.')},
            {t: 'Neko, vienkārši samierināties', why: 'Jūs varat tam iemācīt: ' + (p === 'ios' ? 'pievienojiet vārdu sadaļā Tastatūra > Teksta aizstāšana.' : 'pieskarieties vārdam ieteikumos un pievienojiet to savai vārdnīcai.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Vairs nebūs pārsteidzošu vārdu nomaiņu. Jebkurā laikā varat to atkal ieslēgt tajā pašā vietā.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Jums ir jaunas bezvadu austiņas. Ko darāt vispirms?', options: [
            {t: 'Ieslēdzu tās “savienošanas pārī režīmā” (parasti jātur poga, līdz mirgo gaisma)', ok: true, why: 'Jā. Savienošanas pārī režīms ļauj tālrunim tās atrast. Instrukcijas kastē precīzi pasaka, kā.'},
            {t: 'Iespraužu tās tālrunī', why: 'Bezvadu austiņas savienojas ar Bluetooth. Vispirms ieslēdziet tās savienošanas pārī režīmā, parasti turot pogu, līdz mirgo gaisma.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Austiņu gaisma mirgo. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Pieskarieties Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Pieskarieties Savienotās ierīces.</strong>'},
            {screen: () => list(p, 'Savienotās ierīces', [{id: 'pair', label: '＋ Savienot pārī jaunu ierīci'}, {label: 'Saglabātās ierīces', sub: 'Auto'}]), target: 'pair', say: '<strong>Pieskarieties Savienot pārī jaunu ierīci.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Savienot pārī jaunu ierīci', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'MANAS IERĪCES' : 'Saglabāts'}, {label: 'Auto', sub: 'Nav savienots'},
            {caption: p === 'ios' ? 'CITAS IERĪCES' : 'Pieejamās ierīces'}, {id: 'headphones', label: '⟦headphones⟧ Vingrināšanās austiņas'}, {label: 'Kaimiņa televizors'}], {back: 'Iestatījumi'}),
         target: 'headphones', say: 'Tālrunis meklē tuvumā esošas ierīces. <strong>Pieskarieties Vingrināšanās austiņas.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'MANAS IERĪCES'}, {label: '⟦headphones⟧ Vingrināšanās austiņas', sub: 'Savienots ⟦check⟧'}, {label: 'Auto', sub: 'Nav savienots'}], {back: 'Iestatījumi'}),
         question: {q: 'Vai nākamreiz, ieslēdzot austiņas, tas jādara vēlreiz?', options: [
            {t: 'Nē, no šī brīža tās savienojas pašas', ok: true, why: 'Jā. Savienot pārī jāveic tikai vienreiz. Pēc tam tās savienojas automātiski, kad ir ieslēgtas un tuvumā.'},
            {t: 'Jā, katru reizi', why: 'Savienot pārī jāveic tikai vienreiz. Pēc tam tās savienojas pašas.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Vingrināšanās austiņas', sub: 'Savienots ⟦check⟧'}], {back: 'Iestatījumi'}), done: true,
         say: '<strong>Lieliski!</strong> Tie paši soļi der automašīnai, skaļrunim vai dzirdes aparātiem. Ja kaut kas nesavienojas, izslēdziet un ieslēdziet Bluetooth un atkal ieslēdziet ierīci savienošanas pārī režīmā.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">“${ctx.said || 'Vecmāmiņ? Tas esmu es, Tom! Esmu pazaudējis tālruni, un man ir nepatikšanas. Man šodien vajag £400 sodam. Lūdzu, nestāsti mammai!'}”</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Pajautāt ģimenes drošības frāzi</button><button type="button" data-tap="send-money">Pateikt, ka nosūtīsit naudu</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Zvana nezināms numurs. <strong>Atbildiet,</strong> lai vingrinātos, ko darīt.', hints: {decline: 'Īstajā dzīvē noraidīt ir pilnīgi kārtībā! Šim vingrinājumam pieskarieties Atbildēt.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Hm… ko? Vecmāmiņ, tam nav laika! Lūdzu, man nauda vajadzīga tagad!'; },
         say: 'Skan tieši kā jūsu mazdēls Tom. Taču krāpnieki var kopēt balsis. Jūsu ģimene vienojās par <strong>drošības frāzi</strong>. <strong>Pajautājiet to.</strong>',
         hints: {'send-money': 'Nekad nepiekrītiet sūtīt naudu šādā zvanā. Pajautājiet drošības frāzi.', end: 'Nolikt klausuli arī ir kārtībā! Bet vispirms vingrinieties pajautāt drošības frāzi.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Viņi to nezina un spiež vēl stiprāk. Tas ir krāpnieks. <strong>Nolieciet klausuli</strong> ar sarkano pogu.', hints: {'send-money': 'Nē! Viņi nezināja frāzi. Nolieciet klausuli.', 'ask-phrase': 'Jūs pajautājāt, un viņi nevarēja atbildēt. Nolieciet klausuli.'}},
        {screen: () => home(p), question: {q: 'Jūs joprojām mazliet uztraucaties par Tom. Ko jūs darāt?', options: [
            {t: 'Piezvanīt Tom (vai viņa mammai) uz numuru, kas jums jau ir', ok: true, why: 'Jā. Vienmēr zvaniet atpakaļ uz numuru, ko zināt. Īstais Tom būs kārtībā un neiebildīs, ka pārbaudāt.'},
            {t: 'Atzvanīt uz numuru, no kura zvanīja', why: 'Tas atkal sasniedz krāpnieku. Piezvaniet Tom uz numuru, kas jums jau ir.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Ja zvans ir par jūsu bankas kontu, varat piezvanīt uz <strong>159</strong>, lai droši sazinātos ar savu banku. <strong>Atveriet lietotni Tālrunis</strong>, lai vingrinātos.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Ievadiet 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Pieskarieties zaļajai zvana pogai.</strong> <em>(Tikai vingrināšanās: nekas netiek zvanīts.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">“Laipni lūdzam 159. Lūdzu, nosauciet savas bankas nosaukumu, un mēs jūs savienosim.”</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Lieliski!</strong> 159 savieno jūs ar jūsu īsto banku. Vienojieties par drošības frāzi ar ģimeni klātienē un nekad to nepublicējiet internetā.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Sveiki!'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Velciet uz augšu, lai atvērtu' : 'Sākt'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Jūsu jaunais tālrunis ir izņemts no kastes un ieslēgts. Turiet <strong>veco tālruni</strong> tuvumā, uzlādētu un pieslēgtu Wi-Fi. <strong>Pieskarieties ${p === 'ios' ? 'Velciet uz augšu, lai atvērtu' : 'Sākt'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Ātrā sākšana' : 'Kopēt lietotnes un datus', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Pietuviniet savu veco iPhone šim, lai to iestatītu ar savu Apple Account.' : 'Nokopējiet lietotnes, fotoattēlus, kontaktus un citu no sava vecā tālruņa.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Turpināt vecajā iPhone' : 'Izmantot veco ierīci'}</button>
            <button type="button" class="cp" data-tap="manual">Tā vietā iestatīt manuāli</button>`}),
         target: 'use-old', say: 'Kopējot no vecā tālruņa, nav jāiestata viss no jauna. <strong>Pieskarieties ' + (p === 'ios' ? 'Turpināt vecajā iPhone' : 'Izmantot veco ierīci') + '.</strong>', hints: {manual: 'Varat, taču kopēšana ir daudz vieglāka. Pieskarieties otrai pogai.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">Jūsu <strong>vecajā</strong> tālrunī parādās ziņa. Vērsiet tā kameru uz šo rakstu.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Vecais tālrunis ir noskenējis</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'Vecajā tālrunī pieskarieties Turpināt, tad turiet to virs šī raksta, lai kamera to redzētu. Šeit <strong>pieskarieties Vecais tālrunis ir noskenējis</strong>.'},
        {screen: c => codeScreen(p, c, 'Ievadiet sava vecā tālruņa piekļuves kodu', 'Tas droši nokopē jūsu iestatījumus.'), sequence: CODE_KEYS,
         say: `Ievadiet sava vecā tālruņa piekļuves kodu. Vingrinājumam izmantojiet <strong>${codeText}</strong>.`, hint: `Ievadiet vingrināšanās kodu ${codeText}.`},
        {screen: () => list(p, 'Pārsūtiet savus datus', [], {noBack: true, top: `<p class="cf">Izvēlieties, ko pārnest:</p>
            <div class="cj ex"><span>Fotoattēli un video</span>${tog(true)}</div><div class="cj ex"><span>Kontakti un ziņas</span>${tog(true)}</div><div class="cj ex"><span>Lietotnes</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Turpināt</button>`}),
         target: 'transfer', say: 'Viss ir atzīmēts. <strong>Pieskarieties Turpināt.</strong> Turiet abus tālruņus tuvu kopā un pieslēgtus lādētājam.'},
        {screen: c => list(p, 'Notiek pārsūtīšana…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Atlikušas apmēram 25 minūtes' : 'Pārsūtīšana pabeigta ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Pārsūtīšana ir pabeigta. Ko darīt ar veco tālruni?', options: [
            {t: 'Paturēt to nedēļu, lai pārbaudītu, vai nekā netrūkst, tad to pienācīgi notīrīt pirms pārdošanas vai nodošanas pārstrādei', ok: true, why: 'Jā. Vispirms pārbaudiet, vai fotoattēli, WhatsApp un bankas lietotnes darbojas jaunajā tālrunī. Nākamajā nodarbībā parādīts, kā notīrīt veco.'},
            {t: 'Uzreiz izmest atkritumos', why: 'Tajā vēl ir visa jūsu informācija! Pārbaudiet, vai jaunajā tālrunī ir viss, tad pienācīgi notīriet veco.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Jūsu jaunajā tālrunī ir jūsu fotoattēli, kontakti un lietotnes. Dažas lietotnes, piemēram, banka un WhatsApp, prasa pierakstīties vēlreiz; sagatavojiet savus datus.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Pārdodat, atdodat vai nododat pārstrādei savu veco tālruni? Veiciet to pareizā secībā, citādi nākamais īpašnieks to nevarēs lietot. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '1. solis: izrakstieties no sava Apple Account. <strong>Pieskarieties savam vārdam</strong>.'},
            {screen: c => list(p, 'Apple Account', [{label: 'Personiskā informācija'}, {label: 'Pierakstīšanās un drošība'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Izrakstīties', danger: true}], {back: 'Iestatījumi',
                overlay: c.ask ? dialog(p, 'Izrakstīties?', 'Lai izslēgtu Find My, vajadzīga jūsu parole. (Vingrinājums: ievadīta jūsu vietā.)', [['cancel', 'Atcelt'], ['turn-off', 'Izslēgt']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Ritiniet līdz apakšai un <strong>pieskarieties Izrakstīties</strong>.'},
            {screen: () => list(p, 'Apple Account', [{label: 'Izrakstīties', danger: true}], {back: 'Iestatījumi', overlay: dialog(p, 'Izrakstīties?', 'Lai izslēgtu Find My, vajadzīga jūsu parole. (Vingrinājums: ievadīta jūsu vietā.)', [['cancel', 'Atcelt'], ['turn-off', 'Izslēgt']])}),
             target: 'turn-off', say: 'Tas izslēdz <strong>Find My</strong>, kas citādi piesaistītu tālruni jums. <strong>Pieskarieties Izslēgt.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: '2. solis: notīriet to. <strong>Pieskarieties Vispārīgi.</strong>'},
            {screen: () => list(p, 'Vispārīgi', [{label: 'Par'}, {label: 'iPhone krātuve'}, {id: 'reset', label: 'Pārsūtīt vai atiestatīt iPhone'}], {back: 'Iestatījumi'}), target: 'reset', say: '<strong>Pieskarieties Pārsūtīt vai atiestatīt iPhone</strong> apakšā.'},
            {screen: c => list(p, 'Pārsūtīt vai atiestatīt iPhone', [{label: 'Atiestatīt'}, {id: 'erase', label: 'Izdzēst visu saturu un iestatījumus'}], {back: 'Vispārīgi',
                overlay: c.askErase ? dialog(p, 'Izdzēst šo iPhone?', 'Visi fotoattēli, ziņas un lietotnes tiks dzēstas.', [['cancel', 'Atcelt'], ['confirm-erase', 'Izdzēst']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Pieskarieties Izdzēst visu saturu un iestatījumus.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '1. solis: noņemiet savu Google kontu. <strong>Pieskarieties Google</strong>. <em>(Samsung tālrunī noņemiet arī savu Samsung kontu.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Pārvaldiet savu Google kontu'}, {id: 'accounts', label: 'Konti šajā ierīcē', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Pieskarieties Konti šajā ierīcē.</strong>'},
            {screen: c => list(p, 'Google konts', [{label: 'margaret.smith@example.com'}, {label: 'Konta sinhronizācija'}, {id: 'remove', label: 'Noņemt kontu', danger: true}], {overlay: c.ask ? dialog(p, 'Noņemt kontu?', 'Noņemot to, no šī tālruņa tiek dzēstas tā ziņas, kontakti un dati.', [['cancel', 'Atcelt'], ['confirm-remove', 'Noņemt kontu']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Bez tā tālrunis pēc atiestatīšanas paliek piesaistīts jūsu kontam. <strong>Pieskarieties Noņemt kontu.</strong>'},
            {screen: () => list(p, 'Konts', [{label: 'Noņemt kontu', danger: true}], {overlay: dialog(p, 'Noņemt kontu?', 'Noņemot to, no šī tālruņa tiek dzēstas tā ziņas, kontakti un dati.', [['cancel', 'Atcelt'], ['confirm-remove', 'Noņemt kontu']])}),
             target: 'confirm-remove', say: '<strong>Pieskarieties Noņemt kontu.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: '2. solis: notīriet to. <strong>Pieskarieties Sistēma</strong> apakšā.'},
            {screen: () => list(p, 'Sistēma', [{label: 'Valodas'}, {label: 'Programmatūras atjauninājums'}, {id: 'reset', label: 'Atiestatīšanas opcijas'}]), target: 'reset', say: '<strong>Pieskarieties Atiestatīšanas opcijas.</strong>'},
            {screen: c => list(p, 'Atiestatīšanas opcijas', [{label: 'Atiestatīt Wi-Fi, mobilo tīklu un Bluetooth'}, {id: 'erase', label: 'Dzēst visus datus (rūpnīcas atiestatīšana)'}], {overlay: c.askErase ? dialog(p, 'Dzēst visus datus?', 'Visi fotoattēli, ziņas un lietotnes tiks dzēstas.', [['cancel', 'Atcelt'], ['confirm-erase', 'Dzēst visus datus']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Pieskarieties Dzēst visus datus (rūpnīcas atiestatīšana).</strong>'},
        ]),
        {screen: () => list(p, 'Atiestatīt', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Izdzēst šo iPhone?' : 'Dzēst visus datus?', 'Visi fotoattēli, ziņas un lietotnes tiks dzēstas.', [['cancel', 'Atcelt'], ['confirm-erase', p === 'ios' ? 'Izdzēst' : 'Dzēst visus datus']])}),
         target: 'confirm-erase', say: 'Dariet to tikai tad, kad fotoattēli ir droši jaunajā tālrunī vai dublēti. <strong>Pieskarieties ' + (p === 'ios' ? 'Izdzēst' : 'Dzēst visus datus') + '.</strong> <em>(Vingrinājums: nekas netiek dzēsts.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Sveiki!'}</h3><p class="cf">Gatavs nākamajam īpašniekam</p>${homeIndicator(p)}</div>`,
         question: {q: 'Vēl viena lieta, pirms to atdodat?', options: [
            {t: 'Izņemt SIM karti (un jebkuru atmiņas karti)', ok: true, why: 'Jā. SIM kartē ir jūsu tālruņa numurs. Izņemiet to ar mazo rīku vai saspraudi.'},
            {t: 'Nekā cita', why: 'Izņemiet savu SIM karti un jebkuru atmiņas karti. Jūsu numurs ir SIM kartē.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Sveiki' : 'Sveiki!'}</h3><p class="cf">Gatavs nākamajam īpašniekam</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Lieliski!</strong> Izrakstīties, notīrīt, izņemt SIM: tādā secībā. Ekrāns “Sveiki” nozīmē, ka tas ir gatavs kādam citam.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Atgādinājums</strong><span>Piezvanīt Sarah</span><small>Šodien plkst. 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, vēlāk lietus gāzes</span><small>Augstākā 14° · Zemākā 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} klausās… ko vēlaties pateikt?`}</p>${result}
            <div class="wh">${[['say-remind', '“Atgādini man piezvanīt Sarah plkst. 3”'], ['say-weather', '“Kāds šodien laiks?”'], ['say-joke', '“Pasūti man picu”']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Sānu poga (turēt nospiestu)' : 'Ieslēgšanas poga (turēt nospiestu)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> veic darbus, kad lūdzat skaļi. <strong>Turiet nospiestu sānu pogu</strong> (labajā pusē), līdz parādās Siri. Varat arī vienkārši pateikt “Siri” vai “Hey Siri”.'
                          : 'Tālrunis var veikt darbus, kad lūdzat skaļi. <strong>Turiet nospiestu ieslēgšanas pogu</strong> (labajā pusē), līdz parādās asistents. Varat arī pateikt “Hey Google”.',
         hint: 'Turiet pirkstu (vai peles pogu) nospiestu uz pogas labajā malā.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Īstā tālrunī jūs vienkārši runātu. Šeit <strong>pieskarieties “Atgādini man piezvanīt Sarah plkst. 3”</strong>.', hints: {'say-joke': 'Vispirms izmēģiniet atgādinājumu.', 'say-weather': 'Vispirms izmēģiniet atgādinājumu.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Gatavs: atgādinājums parādīsies plkst. 3. Tagad <strong>pajautājiet par laikapstākļiem</strong>.', hints: {'say-remind': 'Tas ir iestatīts. Tagad pajautājiet par laikapstākļiem.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Ko no šī varētu pajautāt tālrunim?', options: [
            {t: 'Visu: “Piezvani Sarah”, “Iestati taimeri uz 10 minūtēm”, “Ieslēdz lukturīti”, “Nolasi manas ziņas”', ok: true, why: 'Jā. Tas noder, kad rokas ir aizņemtas, acis nogurušas vai rakstīšana sagādā grūtības.'},
            {t: 'Tikai laikapstākļus', why: 'Tas var daudz: zvanus, taimerus, lukturīti, ziņu nolasīšanu, modinātājus un citu.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Lieliski!</strong> Runājiet skaidri un dabiski, kā ar cilvēku. Ja tas pārprot, vienkārši pajautājiet vēlreiz.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Teksts'], ['lens-translate', 'Tulkot'], ['lens-search', 'Meklēt']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Izvēlne' : 'Carte'}</strong><span>${ctx.translated ? 'Zivju zupa' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Vistas gaļa ar sēnēm' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Ābolu kūka' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Jūsu gripas vakcinācijai pienācis laiks.</span><span>Lai pierakstītos, zvaniet ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Live Text' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Kamera var nolasīt rakstīto. Nokopēsim tālruņa numuru no vēstules. <strong>Atveriet Kameru.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Vērsiet to uz vēstuli. Kad tā pamana tekstu, parādās maza <strong>teksta poga ⟦scan-text⟧</strong>. <strong>Pieskarieties tai.</strong>' : 'Vērsiet to uz vēstuli un <strong>pieskarieties Lens pogai ◎</strong>.',
         hints: {shutter: 'Tas uzņem parastu fotoattēlu. Pieskarieties ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'Lens pogai ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Teksts tagad ir īsts teksts. <strong>Pieskarieties tālruņa numuram.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Pieskarieties Kopēt,</strong> lai varētu ielīmēt ziņā vai kontaktos. <em>(Zvanīt to uzreiz sazvanītu.)</em>', hints: {'call-num': 'Tas piezvanītu uz numuru. Šim vingrinājumam pieskarieties Kopēt.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'Atvaļinājumā? Tagad tā ir vērsta uz franču ēdienkarti. ' + (p === 'ios' ? 'To var izdarīt lietotne Tulkotājs vai Google lietotnes Lens. ' : '') + '<strong>Pieskarieties Tulkot.</strong>', hints: {'lens-text': 'Tas nokopē franču tekstu. Pieskarieties Tulkot.', 'lens-search': 'Pieskarieties Tulkot.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Ko vēl kamera var šādi darīt?', options: [
            {t: 'Atpazīt augus un putnus un skenēt vēstules PDF formātā', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Lietotnē Piezīmes pieskarieties saspraudei, tad Skenēt dokumentus, lai pārvērstu vēstules PDF.' : 'Google Drive pieskarieties + tad Skenēt, lai pārvērstu vēstules PDF.')},
            {t: 'Tikai uzņemt fotoattēlus', why: 'Tā var daudz vairāk: atpazīt augus, tulkot, kopēt tekstu un skenēt vēstules PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Lieliski!</strong> Jūs ar kameru nokopējāt numuru un iztulkojāt ēdienkarti. ' + (p === 'ios' ? 'Live Text darbojas arī ar jau uzņemtiem fotoattēliem.' : 'Google Lens darbojas arī ar jau uzņemtiem fotoattēliem.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Bibliotēkas e-grāmatas', `<p class="cf">Pierakstījies ar bibliotēkas karti</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">E-grāmatas</button><button type="button" data-tap="tab-audio" class="on">E-audiogrāmatas</button></div>
                <div class="aeo">${[['book-1', 'Flamborough bāka', 'A. Whitby', '#0ea5e9'], ['book-2', 'Vasaras pie jūras', 'J. Marsh', '#f59e0b'], ['book-3', 'Kluss dārzs', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Jāatdod pēc 21 dienas' : 'Pieejami 3 no 5 eksemplāriem'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Bibliotēka', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'Ar bezmaksas bibliotēkas karti varat tālrunī aizņemties e-grāmatas un audiogrāmatas. East Riding Libraries izmanto lietotni <strong>BorrowBox</strong>. Šī ir vingrināšanās versija. <strong>Atveriet to.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Jūs esat pierakstījušies ar bibliotēkas karti. <strong>Pieskarieties Flamborough bāka.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Aizņemties ir bez maksas. <strong>Pieskarieties Aizņemties.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Tā ir jūsu uz 21 dienu. <strong>Pieskarieties Klausīties.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Pieskarieties atskaņošanas pogai ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Klausāties gultā? <strong>Miega taimeris</strong> to aptur pēc kāda laika, lai nepazaudētu vietu. <strong>Pieskarieties Miega taimeris.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Kas notiek, kad 21 diena ir pagājusi?', options: [
            {t: 'Tā atgriežas pati. Nekādu sodu, un varat pagarināt, ja neesat pabeiguši', ok: true, why: 'Jā. E-grāmatas un audiogrāmatas atgriežas automātiski.'},
            {t: 'Jums uzliek sodu', why: 'Sodu nav. Tā atgriežas pati, un varat to pagarināt, ja neesat pabeiguši.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Lieliski!</strong> Lai sāktu pa īstam, reģistrējieties vietnē eastridinglibraries.co.uk vai jebkurā bibliotēkā, tad lejupielādējiet BorrowBox un pierakstieties ar savu karti.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>Maksāt ar lietotni: atrašanās vietas numurs <b>4471</b></span></div>
                <p class="cf">Ievadiet atrašanās vietas numuru no zīmes</p>${field('parkcode', 'Atrašanās vietas numurs', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Atrast stāvvietu</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Maksāt £3.20' : 'Izvēlieties laiku'}</button>`, {color});
        }
        return app(p, 'Stāvvieta', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Daudzās stāvvietās var maksāt ar lietotni, tāpēc monētas nav vajadzīgas. Katra pašvaldība izmanto savas lietotnes (zīme pasaka, kuru). Šī ir vingrināšanās lietotne. <strong>Atveriet Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Ierakstiet atrašanās vietas numuru no zīmes: 4471.',
         say: 'Katrai stāvvietai uz zīmes ir <strong>atrašanās vietas numurs</strong>. <strong>Lodziņā ierakstiet 4471</strong> un <strong>pieskarieties Atrast stāvvietu</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Jūsu auto numura zīme jau ir saglabāta. <strong>Izvēlieties 2 stundas.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Par lietotnes izmantošanu ir neliela pakalpojuma maksa. <strong>Pieskarieties Maksāt £3.20.</strong> <em>(Vingrinājums: nauda netiek ieturēta.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Veikalos kavējaties. Ko varat darīt?', options: [
            {t: 'Lietotnē pieskarties Pagarināt, lai pievienotu laiku, neatgriežoties pie auto', ok: true, why: 'Jā. Tas ir lielais maksāšanas ar lietotni pluss. Lielākā daļa arī atgādina, pirms laiks beidzas.'},
            {t: 'Neko, dabūsiet sodu', why: 'Lielākā daļa stāvvietu lietotņu ļauj pieskarties Pagarināt, lai pievienotu laiku no jebkuras vietas.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Lieliski!</strong> Lielākā daļa automātu joprojām pieņem arī kartes vai monētas, un daudzas lietotnes ļauj maksāt arī, piezvanot uz numuru vai nosūtot īsziņu. Nekad nemaksājiet ar QR koda uzlīmi uz automāta: tās var būt viltotas.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Jūsu līgums ir beidzies 2026. gada 3. martā. Varat pāriet bez maksas. Jūsu mēneša maksa ir £24.00. Lai pārietu un paturētu savu numuru, nosūtiet īsziņu PAC uz 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Īsziņa', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Vai jums vēl ir līgums vai maksājat par daudz? Viena bezmaksas īsziņa to pateiks. <strong>Atveriet Ziņas.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Ziņas lodziņā ierakstiet INFO, tad pieskarieties sūtīšanai.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Mēs esam sākuši jaunu ziņu uz <strong>85075</strong>. <strong>Ierakstiet INFO</strong> un <strong>pieskarieties sūtīšanai</strong>. Tas ir bez maksas visos Apvienotās Karalistes tīklos.'},
        {screen: c => smsTo(p, c), question: {q: 'Atbildē teikts, ka jūsu līgums ir beidzies un jūs joprojām maksājat £24 mēnesī. Ko tas nozīmē?', options: [
            {t: 'Jūsu tālrunis ir nomaksāts. Piedāvājums tikai ar SIM varētu maksāt daudz mazāk, un varat paturēt savu numuru', ok: true, why: 'Jā. Nosūtiet PAC uz 65075, lai saņemtu kodu pārejai ar numura saglabāšanu. Pārējo izdara jaunais operators.'},
            {t: 'Neko, maksāt tālāk', why: 'Iespējams, jūs maksājat par tālruni, kas jau nomaksāts. Piedāvājums tikai ar SIM varētu ietaupīt daudz.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Vēl viens ietaupījums braucieniem uz ārzemēm: izslēdziet datu viesabonēšanu, lai nesaņemtu pārsteidzošus rēķinus. <strong>Pieskarieties Iestatījumi.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Pieskarieties Mobilais pakalpojums.</strong>'},
            {screen: () => list(p, 'Mobilais pakalpojums', [{label: 'Mobilie dati', toggle: true}, {id: 'options', label: 'Mobilo datu opcijas', value: 'Viesabonēšana ieslēgta'}, {label: 'Personiskais tīklājs'}], {back: 'Iestatījumi'}), target: 'options', say: '<strong>Pieskarieties Mobilo datu opcijas.</strong>'},
            {screen: c => list(p, 'Mobilo datu opcijas', [{id: 'roam', label: 'Datu viesabonēšana', toggle: !c.roamOff}, {label: 'Balss un dati', value: '5G Auto'}], {back: 'Mobilais pakalpojums'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Izslēdziet Datu viesabonēšana.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Pieskarieties Tīkls un internets.</strong>'},
            {screen: () => list(p, 'Tīkls un internets', [{label: 'Internets', sub: 'Mājas Wi-Fi'}, {id: 'sims', label: 'SIM kartes', sub: 'Jūsu tīkls'}, {label: 'Lidojuma režīms', toggle: false}]), target: 'sims', say: '<strong>Pieskarieties SIM kartes.</strong>'},
            {screen: c => list(p, 'SIM kartes', [{label: 'Mobilie dati', toggle: true}, {id: 'roam', label: 'Viesabonēšana', toggle: !c.roamOff, sub: 'Izveidot savienojumu ar datu pakalpojumiem viesabonēšanas laikā'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Izslēdziet Viesabonēšana.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Lieliski!</strong> Ārzemēs joprojām varat izmantot Wi-Fi WhatsApp, video zvaniem un kartēm. Ieslēdziet viesabonēšanu atpakaļ, ja vajag mobilos datus un zināt, cik jūsu operators ņem.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Atrašanās vietas kopīgošana ļauj ģimenei redzēt, ka droši nonācāt mājās. Tā ir jūsu izvēle, un varat pārtraukt jebkurā laikā. <strong>Atveriet Find My.</strong>'},
        {screen: c => app(p, 'Cilvēki', `<p class="cf">Neviens vēl nekopīgo.</p><button type="button" class="ce co" data-tap="share">Kopīgot manu atrašanās vietu</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Pieskarieties Kopīgot manu atrašanās vietu.</strong>'},
        {screen: c => app(p, 'Kopīgot ar', '', {color: '#fff', overlay: sheet('Izvēlieties kontaktpersonu', [['pick-sarah', 'Sarah', 'Meita'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Pieskarieties Sarah.</strong>', hints: {'pick-dave': 'Šim vingrinājumam izvēlieties Sarah.'}},
        {screen: c => app(p, 'Kopīgot ar Sarah', '', {color: '#fff', overlay: sheet('Cik ilgi?', [['one-hour', 'Kopīgot uz vienu stundu'], ['day', 'Kopīgot līdz dienas beigām'], ['always', 'Kopīgot uz nenoteiktu laiku']])}),
         target: 'always', say: 'Izvēlieties, cik ilgi. Ģimenei, kurai uzticaties, <strong>pieskarieties Kopīgot uz nenoteiktu laiku</strong>. Varat pārtraukt jebkurā laikā.', hints: {'one-hour': 'Tas noder vienam braucienam. Šim vingrinājumam izvēlieties Kopīgot uz nenoteiktu laiku.', day: 'Šim vingrinājumam izvēlieties Kopīgot uz nenoteiktu laiku.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Atrašanās vietas kopīgošana ļauj ģimenei redzēt, ka droši nonācāt mājās. Tā ir jūsu izvēle, un varat pārtraukt jebkurā laikā. <strong>Atveriet Kartes.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Pieskarieties savam profila attēlam</strong> augšā labajā pusē.'},
        {screen: () => app(p, 'Kartes', '', {color: '#fff', overlay: sheet('', [['sharing', 'Atrašanās vietas kopīgošana'], ['timeline', 'Jūsu hronoloģija'], ['settings', 'Iestatījumi']])}), target: 'sharing', say: '<strong>Pieskarieties Atrašanās vietas kopīgošana.</strong>'},
        {screen: () => app(p, 'Atrašanās vietas kopīgošana', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Pieskarieties Jauna kopīgošana.</strong>'},
        {screen: () => app(p, 'Kopīgot ar', '', {color: '#fff', overlay: sheet('Izvēlieties kontaktpersonu', [['pick-sarah', 'Sarah', 'Meita'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Pieskarieties Sarah.</strong>', hints: {'pick-dave': 'Šim vingrinājumam izvēlieties Sarah.'}},
        {screen: () => app(p, 'Kopīgot ar Sarah', '', {color: '#fff', overlay: sheet('Cik ilgi?', [['one-hour', '1 stundu'], ['always', 'Līdz jūs to izslēdzat']])}),
         target: 'always', say: 'Ģimenei, kurai uzticaties, <strong>pieskarieties Līdz jūs to izslēdzat</strong>.', hints: {'one-hour': 'Noder vienam braucienam. Šim vingrinājumam izvēlieties Līdz jūs to izslēdzat.'}},
    ]).concat([
        {screen: () => app(p, 'Kopīgo ar Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah var redzēt, kur jūs atrodaties. ${p === 'ios' ? 'Pieskarieties Pārtraukt kopīgošanu' : 'Pieskarieties Apturēt'} jebkurā laikā.</p>`, {color: '#fff'}),
         question: {q: 'Kāds, ko tikko iepazināt internetā, lūdz kopīgot jūsu atrašanās vietu. Vai to darīt?', options: [
            {t: 'Nē. Kopīgojiet tikai ar tuviem ģimenes locekļiem vai draugiem, kuriem uzticaties', ok: true, why: 'Tieši tā. Jūsu atrašanās vieta parāda, kur dzīvojat un kad esat prom. Ierobežojiet to ar cilvēkiem, kuriem uzticaties.'},
            {t: 'Jā, viņi šķiet jauki', why: 'Kopīgojiet atrašanās vietu tikai ar tuviem ģimenes locekļiem un draugiem. Tā parāda, kur dzīvojat un kad esat prom.'}]}},
        {screen: () => app(p, 'Kopīgo ar Sarah', '<p class="cf">Sarah var redzēt, kur jūs atrodaties.</p>', {color: '#fff'}), done: true,
         say: '<strong>Lieliski!</strong> Sarah var redzēt, ka esat drošībā. Laiku pa laikam pārbaudiet, ar ko kopīgojat, un pārtrauciet kopīgot ar visiem, kam tas nav nepieciešams.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Jūsu mazdēls Leo saņem savu pirmo iPhone. <strong>Ekrāna laiks</strong> nosaka veselīgus ierobežojumus. Šis ir <strong>Leo</strong> tālrunis. <strong>Pieskarieties Iestatījumi.</strong>'},
        {screen: c => list(p, 'Iestatījumi', [{label: 'Leo', sub: 'Apple Account'}, {label: 'Paziņojumi'}, {id: 'screen-time', label: 'Ekrāna laiks'}, {label: 'Vispārīgi'}], {noBack: true}), target: 'screen-time', say: '<strong>Pieskarieties Ekrāna laiks.</strong>'},
        {screen: c => list(p, 'Ekrāna laiks', [{id: 'downtime', label: 'Dīkstāve', sub: c.downtime ? '20:00 – 07:00' : 'Izslēgts'}, {label: 'Lietotņu ierobežojumi'}, {id: 'content', label: 'Satura un privātuma ierobežojumi', sub: c.content ? 'Ieslēgta' : 'Izslēgts'}, {label: 'Izmantot Ekrāna laika piekļuves kodu'}], {back: 'Iestatījumi'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Dīkstāve</strong> naktī bloķē lielāko daļu lietotņu (zvani joprojām darbojas). <strong>Pieskarieties Dīkstāve,</strong> lai to ieslēgtu, no 20:00 līdz 7:00.'},
        {screen: c => list(p, 'Ekrāna laiks', [{label: 'Dīkstāve', sub: '20:00 – 07:00'}, {label: 'Lietotņu ierobežojumi'}, {id: 'content', label: 'Satura un privātuma ierobežojumi', sub: c.content ? 'Ieslēgta' : 'Izslēgts'}], {back: 'Iestatījumi'}),
         target: 'content', action: c => { c.content = true; }, say: 'Tālāk apturiet pārsteiguma pirkumus un pieaugušo saturu. <strong>Pieskarieties Satura un privātuma ierobežojumi.</strong>'},
        {screen: c => list(p, 'Saturs un privātums', [{label: 'Satura un privātuma ierobežojumi', toggle: true}, {id: 'purchases', label: 'App Store pirkumi', value: c.noBuy ? 'Neatļaut' : 'Atļaut'}, {label: 'Tīmekļa saturs', value: 'Ierobežot pieaugušo vietnes'}], {back: 'Ekrāna laiks'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Pieaugušo vietnes tagad ir ierobežotas. <strong>Pieskarieties App Store pirkumi,</strong> lai apturētu tēriņus lietotnēs.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Jūsu mazdēls Leo saņem savu pirmo Android tālruni. Google bezmaksas lietotne <strong>Family Link</strong> nosaka veselīgus ierobežojumus no <strong>jūsu</strong> tālruņa. <strong>Atveriet Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Pieskarieties Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Vadīklas'}, {id: 'screen-time', label: 'Ekrāna laiks', sub: c.downtime ? 'Gulētiešanas laiks 20:00 – 07:00' : 'Bez ierobežojumiem'}, {id: 'content', label: 'Satura ierobežojumi', sub: c.noBuy ? 'Pirkumiem vajadzīgs jūsu apstiprinājums' : 'Google Play: atļaut visu'}, {label: 'Atrašanās vieta', sub: 'Ieslēgta'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Pieskarieties Ekrāna laiks,</strong> lai iestatītu gulētiešanas laiku no 20:00 līdz 7:00, kad tālrunis bloķējas (zvani joprojām darbojas).'},
        {screen: c => list(p, 'Leo', [{caption: 'Vadīklas'}, {label: 'Ekrāna laiks', sub: 'Gulētiešanas laiks 20:00 – 07:00'}, {id: 'content', label: 'Satura ierobežojumi', sub: c.noBuy ? 'Pirkumiem vajadzīgs jūsu apstiprinājums' : 'Google Play: atļaut visu'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Tālāk apturiet pārsteiguma tēriņus. <strong>Pieskarieties Satura ierobežojumi,</strong> lai pirkumiem vajadzētu jūsu apstiprinājumu.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Ekrāna laiks' : 'Leo', [{label: p === 'ios' ? 'Dīkstāve' : 'Ekrāna laiks', sub: '20:00 – 07:00'}, {label: 'Pirkumi', sub: p === 'ios' ? 'Neatļaut' : 'Vajadzīgs jūsu apstiprinājums'}]),
         question: {q: 'Kas ir vissvarīgākais līdztekus iestatījumiem?', options: [
            {t: 'Sarunas ar viņu: viņš vienmēr var pastāstīt, ja kaut kas internetā viņu satrauc', ok: true, why: 'Jā. Neviens iestatījums neaptver visu. Vissvarīgāk ir būt cilvēkam, ar kuru viņš var parunāt.'},
            {t: 'Iestatījumi dara visu', why: 'Tie ļoti palīdz, taču nekas neaptver visu. Parūpējieties, lai viņš zina, ka vienmēr var runāt ar jums.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Ekrāna laiks' : 'Leo', [{label: 'Dīkstāve', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Lieliski!</strong> Leo ir gulētiešanas laiks, un viņš nevar tērēt naudu, neprasot. ' + (p === 'ios' ? 'Iestatiet Ekrāna laika piekļuves kodu, lai tikai jūs varētu to mainīt.' : 'Family Link ļauj to mainīt no sava tālruņa jebkurā laikā.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Failu pārlūks', mac: 'Finder', linux: 'Faili'},
        settings: {windows: 'Iestatījumi', mac: 'Sistēmas iestatījumi', linux: 'Sistēmas iestatījumi'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Programmatūras pārvaldnieks'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Sākt', mac: 'Lietotnes', linux: 'Izvēlne'},
        editor: {windows: 'Notepad', mac: 'TextEdit', linux: 'Teksta redaktors'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Pasts', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Atjauninājumu pārvaldnieks', terminal: 'Terminālis', trash: 'Atkritne', apps: 'Lietotnes', chrome: 'Chrome', shield: 'Windows drošība', fw: 'Ugunsmūris'}[kind]);

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
        windows: {title: 'Atkritne', empty: 'Iztukšot atkritni', confirm: n => `Vai tiešām vēlaties neatgriezeniski izdzēst šos ${n} vienumus?`, items: [
            ['⟦paperclip⟧', 'Biroja palīgs (saspraude).exe', 'Piedāvāja palīdzēt ar katru vēstuli, ko jebkad sākāt rakstīt. Pensionēts 2007. gadā.', ''],
            ['⟦bomb⟧', 'Saperis labākie rezultāti.txt', 'Iesācējs: 999 sekundes. Par to nerunājam.', ''],
            ['⟦spade⟧', 'Pasjansa uzvaras kārtis.gif', 'Uzvarēji spēlē, un kārtis lēkāja pār ekrānu. Veiciet dubultklikšķi uz manis!', 'cards'],
            ['⟦phone⟧', 'Iezvanes modems.wav', 'Šššš… bongs… kššššš. Un neviens nevarēja lietot tālruni, kamēr jūs bijāt tiešsaistē.', ''],
            ['⟦mountain-snow⟧', 'Zaļā pakalna fona attēls.jpg', 'Tas zaļais pakalns un zilās debesis miljoniem ekrānu kopš 2001. gada.', ''],
            ['⟦save⟧', 'Diskete (A:)', '1,44 MB. Pogai Saglabāt joprojām ir tāds izskats.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, bez maksas kopā ar Windows, līdz Vista to atņēma.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger paraustīšana', 'Kāds jums nosūtīja paraustīšanu, un viss ekrāns nodrebēja. Veiciet dubultklikšķi uz manis!', 'shake'],
            ['⟦file-text⟧', 'Vēstule pašvaldībai GALĪGĀ (2) (galīgā).doc', 'Mums visiem tāda ir.', ''],
        ]},
        mac: {title: 'Atkritne', empty: 'Iztukšot atkritni', confirm: () => 'Vai tiešām vēlaties neatgriezeniski izdzēst vienumus atkritnē? Šo darbību nevar atsaukt.', items: [
            ['⟦rainbow⟧', 'Griežas pludmales bumba', 'Varavīksnes ritenis, kas nozīmēja “lūdzu, uzgaidiet”… un gaidiet. Veiciet dubultklikšķi uz manis!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Caurspīdīgs, olas formas un zils. Katrā skolā tāds bija.', ''],
            ['⟦music⟧', 'iPod ar klikšķa ripu', '1000 dziesmu kabatā. Riņķī un apkārt ar īkšķi.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Mazais smaidošais dators, kas sveicināja katrā ieslēgšanas reizē.', ''],
            ['⟦bell⟧', 'Ieslēgšanas skaņa', 'Tas lielais akords, ieslēdzot datoru. Daudziem tā joprojām pietrūkst.', ''],
            ['⟦droplet⟧', 'Aqua pogas', 'Tik spīdīgas un zilas, ka gribējās aplaizīt.', ''],
            ['⟦calendar-days⟧', 'Dashboard sīkrīki', 'Kalkulators, laikapstākļi un pielīmējama piezīme savā slānī. Pazuduši kopš 2019. gada.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Kur mēs visi ierakstījām savus CD un sinhronizējām iPod.', ''],
        ]},
        linux: {title: 'Atkritne', empty: 'Iztukšot atkritni', confirm: () => 'Iztukšot visus vienumus atkritnē? Visi atkritnē esošie vienumi tiks neatgriezeniski izdzēsti.', items: [
            ['⟦bird⟧', 'Tux pingvīns (plīša)', 'Linux talismans kopš 1996. gada. Ļoti apskaujams.', ''],
            ['⟦eye⟧', 'xeyes', 'Acu pāris, kas seko jūsu peles rādītājam. Veiciet dubultklikšķi uz manis!', 'eyes'],
            ['⟦app-window⟧', 'Šūpojošies logi', 'Vecie darbvirsmas efekti lika logiem šūpoties kā želejai, tos velkot. Veiciet dubultklikšķi uz manis!', 'wobble'],
            ['⟦save⟧', 'Instalēšanas disketes 1–50', 'Agrīnajam Linux instalēšanai varēja vajadzēt veselu disketu kasti.', ''],
            ['⟦disc⟧', 'Bezmaksas Ubuntu CD pa pastu', 'Linux CD varēja pasūtīt bez maksas, un tas atnāca pa pastu.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Pareģots katru gadu kopš 1999. gada. Varbūt šis ir tas gads?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'Katram Linux Mint izdevumam ir sievietes vārds, piemēram, Zena, Xia un Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Vecs joks: pasakiet “sudo”, un dators dara, kas liek.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Šī mape ir tukša.' : 'The ' + egg.title + ' ir tukša.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Veiciet dubultklikšķi uz kaut kā, lai apskatītu.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Nē' : 'Atcelt'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Jā' : 'Tukšs'}</button></div></div>` : '';
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
        ['Viļņains pakalns', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Svītriņas', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Nakts debesis', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Jūras krasts', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Slavenākais Wi-Fi vārdu spēles joks.'],
        ['The LAN Before Time', 'LAN ir “lokālais tīkls”. Šis ir ļoti, ļoti vecs.'],
        ['Abraham Linksys', 'Pirms četrdesmit septiņiem megabitiem…'],
        ['Bill Wi the Science Fi', 'Zinātne valda!'],
        ['Drop It Like It\'s Hotspot', 'Kāda cilvēka tālruņa tīklājs ar humora izjūtu.'],
        ['Silence of the LANs', 'Ļoti, ļoti kluss tīkls.'],
        ['Tell My Wi-Fi Love Her', 'Ak.'],
        ['Get Off My LAN', 'Droši vien kāds saīdzis kaimiņš.'],
        ['Bridlington Seagulls', 'Tās jau ir paņēmušas jūsu čipsus. Nedodiet tām arī savu paroli.'],
        ['FREE WIFI (honest)', 'Tīkls ar nosaukumu “free Wi-Fi”, ko neatpazīstat, ir tieši tāds, kuram nevajag pievienoties!'],
    ];

    const FORTUNES = ['Šodien ir laba diena, lai dublētu fotoattēlus.', 'Stipra parole ir laimīga parole.', 'Jums piezvanīs. Tā būs krāpšana. Nolieciet klausuli.',
        'Vai esat mēģinājuši izslēgt un atkal ieslēgt?', 'Labākais laiks atjaunināšanai bija vakar. Otrs labākais laiks ir tagad.', 'Tase tējas salabo gandrīz visu. Tikai ne datorus.',
        'Nekad nedodiet paroli svešiniekam. Vai kaijai.', 'Jūs atradīsiet tālvadības pulti. Tā ir aiz dīvāna malas.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP adrese: 192.168.1.42<br>Rūteris: 192.168.1.1<br>Signāls: −54 dBm (ļoti labs)<br>Kanāls: 36 (5 GHz)<br>Ātrums: 866 Mbps<br>Drošība: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi ir izslēgts. Ieslēdziet to, lai redzētu tīklus.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Nav interneta</strong><br>Pārbaudiet savu Wi-Fi. Nospiediet <kbd>atstarpes taustiņu</kbd> vai pieskarieties, lai spēlētu.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>SPĒLE BEIGTA · nospiediet atstarpi, lai spēlētu vēlreiz</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Vai šodien jau esat mūkuši?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Izmēģiniet: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Mū!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Ierakstījāt “sl” “ls” vietā? Lūk, tvaika vilciens.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (practice) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: kopš brokastīm \\___________/ Memory: nekad neaizmirst dzimšanas dienu`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Labi. 🥪');
        else if (lc === 'make me a sandwich') say('Ko? Pagatavo pats.');
        else if (/rm\s+-rf/.test(lc)) say('Laba doma! Šis vingrināšanās terminālis neļaus jums neko sabojāt.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: command not found (izmēģiniet “help”)`);
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
        else if (note) note.textContent = 'Šis vingrināšanās pārlūks nemeklē īstajā internetā. Nekas, ko ierakstāt, netiek nekur sūtīts.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Pirmā aprīļa joks! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Cheat kods aktivizēts! +30 dzīvības 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Welcome to Macintosh.</p></div><p>Cheat kods aktivizēts! +30 dzīvības 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Cheat kods aktivizēts! +30 dzīvības 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Pārējie logi ir paslēpti.' : 'Aero Shake! (Nebija citu logu, ko paslēpt.)');
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
                funToast(screen, 'Wi-Fi ir ieslēgts. Savienots ar Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi ir izslēgts.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Pievienojieties tikai tīkliem, kurus pazīstat.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Pirmā aprīļa joks! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Skats'], ['', 'Kārtot pēc'], ['refresh', 'Atsvaidzināt'], ['', 'Jauns'], ['wall', 'Personalizēt']]
                : os === 'mac' ? [['', 'Jauna mape'], ['', 'Iegūt informāciju'], ['wall', 'Mainīt fona attēlu…'], ['', 'Izmantot kaudzes']]
                : [['', 'Izveidot jaunu mapi'], ['terminal', 'Atvērt terminālī'], ['wall', 'Mainīt darbvirsmas fonu']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Fona attēls: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (vingrināšanās izdevums)</small>
                <dl><dt>Mikroshēma</dt><dd>Bridlington Silicon B1</dd><dt>Atmiņa</dt><dd>Nekad neaizmirst dzimšanas dienu</dd><dt>Startēšanas disks</dt><dd>Vingrināšanās HD</dd><dt>Sērijas numurs</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notepad' : os === 'mac' ? 'TextEdit' : 'Teksta redaktors';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Bez nosaukuma – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Rnd 1, kol. 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Vienkāršs teksts'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Laipni lūdzam! Šis ir vingrināšanās terminālis. Ierakstiet “help”, lai redzētu, ko varat izmēģināt. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Laikapstākļi'], ['news', '⟦newspaper⟧', 'Ziņas'], ['bus', '⟦bus⟧', 'Autobusu laiki'], ['recipes', '⟦cake-slice⟧', 'Receptes']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Bridlington laikapstākļi</h3><p class="fd">Vingrināšanās prognoze</p><div class="ajf">${[['Šodien', '⟦cloud-sun⟧', '13°'], ['Pk', '⟦cloud-rain⟧', '11°'], ['Se', '⟦wind⟧', '10°'], ['Sv', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Kaiju aktivitāte: <strong>ļoti augsta</strong>. Sargiet savus čipsus.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Vingrināšanās ziņas</h3><ul class="news">
            <li><strong>Vietējais vīrietis beidzot atrod TV tālvadības pulti</strong> aiz dīvāna malas pēc trīs nedēļām.</li>
            <li><strong>Pamanīta kaija ar 99 Flake</strong>. Saldējuma īpašnieks “nav sajūsmā”.</li>
            <li><strong>Vecmāmiņa pārspēj mazdēlu video zvanos</strong>: “Es vienkārši nospiedu zaļo pogu.”</li>
            <li><strong>Pētījums rāda,</strong> ka 9 no 10 datoru problēmām novērš, izslēdzot un atkal ieslēdzot.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Autobusu laiki</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Viktorijas biskvīts</h3><p>Samaisiet pa 200 g sviesta, cukura un miltu ar cepamo pulveri ar 4 olām. Cepiet divās formās 180°C temperatūrā 20–25 minūtes. Pildiet ar ievārījumu un krējumu.</p><p class="fd">Padoms: iestatiet taimeri tālrunī vai pajautājiet tam: “Iestati taimeri uz 25 minūtēm”.</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Jauna cilne' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Meklējiet vai ierakstiet tīmekļa adresi'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Suns pludmalē.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Iepirkumu saraksts.txt'], ['⟦file-text⟧', 'Vēstule pašvaldībai.docx'], ['⟦folder⟧', 'Receptes'], ['⟦file-spreadsheet⟧', 'Ziemassvētku kartīšu saraksts.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Pašvaldības nodokļa rēķins.pdf'], ['⟦file-text⟧', 'Autobusu saraksts.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Piejūras pūtēju orķestris.mp3'], ['⟦music⟧', 'Sešdesmito hiti.mp3']],
    };
    function funFiles(screen, os, folder = 'Attēli', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Atkritne' : os === 'mac' ? 'Atkritne' : 'Atkritne'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Suns pludmalē.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Savienots ar Home-WiFi-5G' : 'Wi-Fi ir izslēgts.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalizēšana' : os === 'mac' ? 'Fona attēls' : 'Foni'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows atjaunināšana' : os === 'mac' ? 'Programmatūras atjaunināšana' : 'Atjauninājumi'}</h3><p class="mj">⟦check⟧ Viss ir atjaunināts</p><p class="cf">Pēdējā pārbaude: šodien, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Pārbaudīt atjauninājumus</button><p class="zi"></p>`,
            about: `<h3>Par</h3><div class="zk"><div><span>Ierīces nosaukums</span><b>MARGARET-PRACTICE</b></div><div><span>Sistēma</span><b>${os === 'windows' ? 'Windows 11 (vingrināšanās)' : os === 'mac' ? 'macOS 27 (vingrināšanās)' : 'Linux Mint 22.3 (vingrināšanās)'}</b></div>
                <div><span>Procesors</span><b>Bridlington Silicon B1</b></div><div><span>Atmiņa</span><b>Nekad neaizmirst dzimšanas dienu</b></div><div><span>Krātuve</span><b>Pietiekami daudz mazbērnu fotoattēliem</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalizēšana' : os === 'mac' ? 'Fona attēls' : 'Foni'], ['update', 'Atjauninājumi'], ['about', 'Par']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Vingrināšanās Saperis', 'Klasiskā mīnu meklēšanas spēle.'], ['solitaire', '⟦spade⟧', 'Pasjanss', 'Drīzumā šajā vingrināšanās veikalā.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Drīzumā šajā vingrināšanās veikalā.'], ['weather', '⟦cloud-sun⟧', 'Laikapstākļi', 'Drīzumā šajā vingrināšanās veikalā.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Atvērt' : (os === 'mac' ? 'Iegūt' : 'Instalēt')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Vingrināšanās Saperis', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Noklikšķiniet, lai rakt. Ar labo peles pogu (vai turot nospiestu) novietojiet karogu.</p></div>`, 'bz'));
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
        ['Mamma', 'Kā šo lietu izslēgt?', 'Sveiks, mīļais, es uzrakstīju šo e-pastu, bet nevaru atrast izslēgšanas pogu. Vai tā ir tā apaļā? Mīlestībā, mamma xx P.S. Es to nospiedu. Nekas nenotika. Vai tā ir pareizi?'],
        ['Bridlington Walkers', 'Sestdienas pastaiga', 'Tiekamies ostā plkst. 10. Līdzi termoss un ūdensnecaurlaidīga jaka. Pagājušās nedēļas kaijas incidentu nepārrunāsim.'],
        ['Prince Abu (ļoti bagāts)', 'STEIDZAMI: jūs esat laimējis £4,000,000!!!', 'Mīļais dārgais draugs, es esmu princis, un man vajadzīgi jūsu bankas dati, lai nosūtītu jums četrus miljonus mārciņu. Lūdzu, nosūtiet arī £50 par pastmarku. — Šī ir krāpšana! Īsti cilvēki neizdala miljonus pa e-pastu. Izdzēsiet to vai pārsūtiet uz report@phishing.gov.uk.'],
        ['Sarah', 'Fotoattēli no svētdienas 🌻', 'Šeit ir fotoattēli no dārza. Suns ir apēdis vēl vienu saulespuķi.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Pasts', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Šis ir vingrināšanās dators, tāpēc to nevar izslēgt 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Lejupielādes', '⟦triangle-alert⟧ “Bezmaksas tīrītāja” programmas bieži ir nevērtīgas vai sliktākas. Labāk to izdzēst, nevis atvērt!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `“${n}” īstā datorā tiktu atvērts šeit.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi ir ieslēgts.' : 'Wi-Fi ir izslēgts.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Pārbauda atjauninājumus…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Nav jaunu atjauninājumu. Viss kārtībā!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Šis ir tikai izrādei vingrināšanās veikalā.'); return true; }
            el.textContent = 'Instalē…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Atvērt'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Fails Rediģēt Skats Ievietot Formāts <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Cienījamais kungs vai dāma, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Atjauninājumu pārvaldnieks', '<div class="ajz"><p class="mj">⟦check⟧ Jūsu sistēma ir atjaunināta</p><p class="cf">Linux Mint atjauninājumus pārbauda pats un parāda punktu uz vairoga, kad tādi ir.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Rakstiet šeit, lai meklētu</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Atkritne', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Dators', '⟦monitor⟧')}${icon('Sākums', '⟦house⟧')}${icon('Atkritne', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Meklēt lietotnes, iestatījumus un dokumentus')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Meklēt')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Rakstiet, lai meklētu…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Jauna cilne <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Meklējiet vai ierakstiet tīmekļa adresi</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Šī ir <strong>darbvirsma</strong>. Josla gar apakšu ir <strong>uzdevumjosla</strong>. Atveriet tīmekļa pārlūku no izvēlnes Sākt: <strong>noklikšķiniet uz Sākt</strong>, četriem kvadrātiem.'
            : os === 'mac' ? 'Šī ir <strong>darbvirsma</strong>. Lietotņu rinda apakšā ir <strong>Dock</strong>, un josla gar augšu ir <strong>izvēļņu josla</strong>. <strong>Noklikšķiniet uz Lietotnes</strong> (kvadrātu režģis), lai redzētu visas lietotnes.'
            : 'Šī ir <strong>darbvirsma</strong> sistēmā Linux Mint. Josla gar apakšu ir <strong>panelis</strong>. Jūsu lietotnes ir izvēlnē Izvēlne: <strong>noklikšķiniet uz Izvēlne</strong>, apakšā pa kreisi.',
         hint: os === 'mac' ? 'Lietotnes ir Dock apakšā, blakus Finder.' : (os === 'windows' ? 'Sākt ir četri zilie kvadrāti uzdevumjoslā.' : 'Izvēlnes poga ir apakšējā paneļa kreisajā malā.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Noklikšķiniet uz ${N.browser[os]}</strong>, tīmekļa pārlūka.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Katram logam <strong>augšā kreisajā pusē</strong> ir trīs krāsainas pogas. Dzeltenā paslēpj logu. <strong>Noklikšķiniet uz dzeltenās pogas.</strong>'
            : 'Katram logam <strong>augšā labajā pusē</strong> ir trīs pogas. Svītra <strong>—</strong> paslēpj logu (samazina). <strong>Noklikšķiniet uz —.</strong>',
         hints: {'win-close': 'Tas to aizver. Vispirms paslēpiet to ar ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Tas to palielina visam ekrānam. Vispirms paslēpiet to.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Tas ir paslēpts, nevis aizvērts. ${os === 'mac' ? 'punkts zem tā ikonas Dock' : 'line under its icon'} rāda, ka tas joprojām ir atvērts. <strong>Noklikšķiniet uz ikonas ${N.browser[os]}</strong>, lai to atgrieztu.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Tagad palieliniet to visam ekrānam: <strong>noklikšķiniet uz pogas ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Mac datorā sarkanā poga aizver logu. Bet lietotne var turpināt darboties. Kā to pilnībā aizvērt?', options: [
                {t: 'Nospiest ⟦command⟧ Cmd + Q vai augšā lietotnes izvēlnē izvēlēties Quit', ok: true, why: 'Jā. Punkts zem lietotnes Dock nozīmē, ka tā joprojām darbojas. ⟦command⟧ Cmd + Q to aizver.'},
                {t: 'Divreiz noklikšķināt uz sarkanās pogas', why: 'Sarkanā poga aizver tikai logus. ⟦command⟧ Cmd + Q (vai lietotnes izvēlne > Quit) aizver lietotni.'}]}
            : {q: 'Kur ir loga aizvēršanas poga?', options: [
                {t: 'Augšā labajā pusē: ⟦x⟧', ok: true, why: 'Jā. Sistēmās Windows un Linux Mint trīs pogas ir augšā labajā pusē. (Mac datorā tās ir augšā kreisajā pusē, sarkanā, dzeltenā un zaļā krāsā.)'},
                {t: 'Apakšā kreisajā pusē', why: 'Tā ir katra loga augšējā labajā pusē: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Lieliski!</strong> Jūs protat atvērt, paslēpt, atgriezt, palielināt un aizvērt logus. Tā ir lielākā daļa datora lietošanas.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Sākums' : 'Sākums'], ['desktop', 'Darbvirsma'], ['documents', 'Dokumenti'], ['downloads', 'Lejupielādes'], ['pictures', 'Attēli']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB zibatmiņa']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Dokumenti'], ['pictures', '⟦folder⟧', 'Attēli'], ['downloads', '⟦folder⟧', 'Lejupielādes']],
            downloads: [['photo', '⟦image⟧', 'Brīvdienu foto.jpg'], ['bill', '⟦file-text⟧', 'Pašvaldības nodokļa rēķins.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Brīvdienu foto.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Brīvdienas')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Vēstule pašvaldībai.docx'], ['recipes', '⟦folder⟧', 'Receptes']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Dokumenti']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Jauna mape', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Sākums' : 'Sākums', downloads: 'Lejupielādes', pictures: 'Attēli', documents: 'Dokumenti', usb: 'USB zibatmiņa', desktop: 'Darbvirsma'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Šī mape ir tukša</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Kopēt' : 'Kopēt';
    const pasteLabel = os => os === 'mac' ? 'Ielīmēt vienumu' : 'Ielīmēt';
    const newFolderLabel = os => os === 'mac' ? 'Jauna mape' : os === 'windows' ? 'Jauns > Mape' : 'Izveidot jaunu mapi';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Jūsu fotoattēli un vēstules tiek glabāti <strong>mapēs</strong>. <strong>Noklikšķiniet uz ${N.files[os]}</strong>, lai tās apskatītu.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'Doka kreisajā pusē' : 'uz ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Sānos ir jūsu galvenās mapes. Visi faili, ko lejupielādējat no e-pastiem un vietnēm, nonāk mapē <strong>Lejupielādes</strong>. <strong>Noklikšķiniet uz Lejupielādes.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Atvērt'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Pārdēvēt'], ['menu-delete', os === 'mac' ? 'Pārvietot uz atkritni' : 'Dzēst']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Nokopēsim brīvdienu fotoattēlu mapē Attēli, kur tam jābūt. <strong>Noklikšķiniet ar labo pogu</strong> uz <strong>Brīvdienu foto.jpg</strong>: nospiediet <strong>labo</strong> peles pogu. <em>' + (os === 'mac' ? 'Skārienpaliktnī noklikšķiniet ar diviem pirkstiem.' : 'Skārienekrānā turiet nospiestu.') + '</em>',
         hint: 'Izmantojiet labo peles pogu uz fotoattēla.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Parādās izvēlne. <strong>Noklikšķiniet uz ${copyLabel(os)}.</strong> <em>(Īsinājumtaustiņš ir ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Ne šo! Noklikšķiniet uz Kopēt.', 'menu-open': 'Tas atver fotoattēlu. Noklikšķiniet uz Kopēt.', 'menu-rename': 'Noklikšķiniet uz Kopēt.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Noklikšķiniet uz Attēli</strong> kreisajā pusē.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Mape Attēli ir tukša. <strong>Noklikšķiniet ar labo pogu uz tukšās baltās vietas.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Noklikšķiniet uz ${pasteLabel(os)}.</strong> <em>(Vai ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Mapi izveidosim nākamo. Vispirms noklikšķiniet uz ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Fotoattēls tagad ir arī mapē Attēli. Tagad izveidojiet mapi, lai brīvdienu fotoattēli būtu kopā. <strong>Vēlreiz noklikšķiniet ar labo pogu uz tukšās vietas.</strong>', hints: {'rc-photo2': 'Noklikšķiniet ar labo pogu uz tukšās vietas, nevis uz fotoattēla.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Noklikšķiniet uz ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Vispirms ierakstiet mapes nosaukumu, piemēram, Brīvdienas.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Ierakstiet nosaukumu</strong>, piemēram, <strong>Brīvdienas</strong>, tad <strong>noklikšķiniet uz Labi</strong> (vai nospiediet Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Kur parasti nonāk faili no e-pastiem un vietnēm?', options: [
            {t: 'Mapē Lejupielādes', ok: true, why: 'Jā. Ja nevarat atrast kaut ko lejupielādētu, vispirms meklējiet mapē Lejupielādes.'},
            {t: 'Uz darbvirsmas', why: 'Parasti mapē Lejupielādes. Ja kaut ko nevarat atrast, meklējiet tur vispirms.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Lieliski!</strong> Labais klikšķis ir noslēpums lielākajai daļai lietu: kopēšana, ielīmēšana, pārdēvēšana un jauna mape ir šajā izvēlnē.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Ievadiet tīkla paroli</p>${field('wifipass', 'Parole', ctx)}<button type="button" class="ce co" data-tap="connect">Izveidot savienojumu</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi tīkli'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Savienots ar Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Lai izveidotu savienojumu ar Wi-Fi, <strong>noklikšķiniet uz Wi-Fi simbola</strong> ${os === 'mac' ? 'ekrāna augšā labajā pusē' : 'apakšā labajā pusē, pie pulksteņa'}.`, hint: os === 'mac' ? 'Tas ir izvēļņu joslā augšā labajā pusē.' : 'Tas ir pie pulksteņa apakšā labajā pusē.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Jūsu tīkla nosaukums ir uz uzlīmes uz rūtera. Šis vingrināšanās tīkls ir <strong>Home-WiFi-5G</strong>. <strong>Noklikšķiniet uz tā.</strong>', hints: {'net-neighbour': 'Tas ir jūsu kaimiņa! Izvēlieties Home-WiFi-5G.', 'net-cafe': 'Tas nav jūsu mājas tīkls. Izvēlieties Home-WiFi-5G.', 'tray-wifi': 'Wi-Fi tīklu saraksts jau ir atvērts. Noklikšķiniet uz Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Ierakstiet paroli precīzi: Green-Apple-42 (lielais G un A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Ierakstiet paroli no uzlīmes <strong>precīzi</strong>: <strong>Green-Apple-42</strong>. Tad <strong>noklikšķiniet uz Izveidot savienojumu</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Wi-Fi panelis jau ir atvērts. Ierakstiet paroli lodziņā, tad noklikšķiniet uz Izveidot savienojumu.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Jūs esat kafejnīcā ar bezmaksas Wi-Fi. Vai tas der internetbankai?', options: [
            {t: 'Labāk pagaidīt līdz mājām vai izmantot tālruņa mobilos datus', ok: true, why: 'Jā. Bezmaksas Wi-Fi der pārlūkošanai, bet bankas darījumiem izmantojiet mājas Wi-Fi vai mobilos datus.'},
            {t: 'Jā, jebkurš Wi-Fi ir kārtībā', why: 'Bezmaksas publiskais Wi-Fi der pārlūkošanai, bet bankas darījumus atstājiet mājām vai mobilajiem datiem.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Lieliski!</strong> Dators atcerēsies paroli un nākamreiz savienosies pats.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Iepirkumu saraksts: piens, maize, olas, tējas maisiņi, dzimšanas dienas kartīte Jean';
        const note = pcWin(os, `Iepirkumu saraksts – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Jauns e-pasts Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Noklikšķiniet šeit, lai rakstītu…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Pasts' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Īsinājumtaustiņi ietaupa daudz klikšķu. <strong>${CMDL(os)}</strong> ir taustiņš ${os === 'mac' ? 'abpus atstarpes taustiņam, atzīmēts ar ⟦command⟧' : 'tastatūras apakšā pa kreisi'}. Lai atlasītu visu tekstu, turiet <strong>${CMDL(os)}</strong> un nospiediet <strong>A</strong>. <em>Izmantojiet īsto tastatūru vai pogas uz ekrāna.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Tas ir izcelts. Tagad nokopējiet: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Nokopēts! <strong>Noklikšķiniet e-pasta iekšpusē,</strong> kas adresēts Sarah, kur rakstīts “Noklikšķiniet šeit, lai rakstītu”.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Tagad ielīmējiet: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Hmm, jūs kļūdas pēc kaut ko izdzēsāt. Kurš īsinājumtaustiņš to atsauc?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Jā. ${CMDL(os)} + Z atsauc pēdējo darbību gandrīz katrā lietotnē. Nospiediet vēlreiz, lai atsauktu vēl.`},
            {t: 'Escape', why: `Escape aizver izvēlnes. ${CMDL(os)} + Z ir atsaukšana.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Kā uzņemt ekrānuzņēmumu (ekrāna attēlu)?', options: [
            {t: os === 'windows' ? 'Windows taustiņš + Shift + S, tad velciet pāri vajadzīgajam' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, tad velciet pāri vajadzīgajam' : 'Nospiediet taustiņu Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Jā. Tas ir nokopēts, un paziņojums ļauj to saglabāt. Darbojas arī taustiņš Print Screen.' : os === 'mac' ? 'Jā. Attēls tiek saglabāts uz darbvirsmas. Shift + ⟦command⟧ Cmd + 3 uzņem visu ekrānu.' : 'Jā. Linux Mint to saglabā mapē Attēli. Shift + Print Screen ļauj izvēlēties apgabalu.'},
            {t: 'Nofotografēt ekrānu ar tālruni', why: 'Tas darbojas, bet ekrānuzņēmums ir daudz skaidrāks. ' + (os === 'windows' ? 'Windows taustiņš + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Nospiediet Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Lieliski!</strong> Lielā četrinieka: <strong>${CMDL(os)} + C</strong> kopēt, <strong>V</strong> ielīmēt, <strong>Z</strong> atsaukt, <strong>A</strong> atlasīt visu. Tie darbojas gandrīz katrā lietotnē.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Bezmaksas', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Bezmaksas · Pirkumi lietotnē', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Meklēt lietotnes</span></button><div class="hp"><span>IZCELTS</span><strong>Lietotnes jūsu jaunajam datoram</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Atvērt' : (os === 'mac' ? 'Iegūt' : 'Instalēt')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Instalē LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Vingrināšanās veikals: nosaukumi un cenas ir piemēri.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Drošākā vieta lietotņu iegūšanai ir iebūvētais veikals: <strong>${N.store[os]}</strong>. <strong>Noklikšķiniet uz tā.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Jums vajag kaut ko vēstuļu rakstīšanai, piemēram, Word. <strong>Noklikšķiniet uz meklēšanas lodziņa.</strong> Meklēsim “office”.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> ir bezmaksas alternatīva Microsoft Office, ko izveidojis <strong>The Document Foundation</strong>. Pārbaudiet, kas to izveidojis, tad <strong>noklikšķiniet ' + (os === 'mac' ? 'Iegūt' : 'Instalēt') + ' blakus LibreOffice</strong>.',
         hints: {'get-fake1': 'Tā ir reklāma, un par to jāmaksā £29.99 gadā. LibreOffice ir bezmaksas.', 'get-fake2': 'To izveidojis AppMakers, un tai ir pirkumi lietotnē. Izvēlieties LibreOffice, ko izveidojis The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Tīmekļa vietnes uznirstošajā logā rakstīts “Jūsu dators ir lēns! Lejupielādējiet Speed Booster tūlīt”. Ko jūs darāt?', options: [
            {t: 'Aizvērt to. Lietotnes instalēt tikai no veikala vai paša izstrādātāja vietnes', ok: true, why: 'Tieši tā. Uznirstošie logi, kas piedāvā “paātrinātājus” vai “tīrītājus”, bieži ir nevērtīgi vai sliktāki.'},
            {t: 'Lejupielādēt, tas varētu palīdzēt', why: 'Tie bieži ir nevērtīgi vai kaitīgi. Instalējiet tikai no veikala vai paša izstrādātāja vietnes.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Lieliski!</strong> LibreOffice ir instalēts. Pārbaudiet izstrādātāju, ignorējiet reklāmas un uzmanieties no “bezmaksas” lietotnēm, kas vēlāk prasa naudu.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Sākums'], ['system', 'Sistēma'], ['bluetooth', 'Bluetooth un ierīces'], ['network', 'Tīkls un internets'], ['accounts', 'Konti'], ['privacy', 'Privātums un drošība'], ['update', 'Windows atjaunināšana']];
            const pages = {
                home: '<h3>Sākums</h3><p class="cf">Ieteiktie iestatījumi un jūsu konts.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Viss ir atjaunināts</p>' : ctx.ready ? `<p class="cf">Lai pabeigtu atjauninājumu instalēšanu, nepieciešama restartēšana.</p><button type="button" class="ce co bz" data-tap="restart">Restartēt tūlīt</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Lejupielādē… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Iestatījumi', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Vispārīgi'], ['privacy', 'Privātums un drošība'], ['users', 'Lietotāji un grupas']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Jūsu Mac ir atjaunināts</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Lejupielādē… atlikušas apmēram 10 minūtes' : 'Drošības un kļūdu labojumi'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Privātums un drošība</h3><p class="cf"><strong>Drošība</strong><br>Atļaut lietotnes no:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store un zināmi izstrādātāji</button>`,
            };
            return pcWin(os, 'Sistēmas iestatījumi', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Sistēmas iestatījumi</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Atjauninājumu pārvaldnieks', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Jūsu sistēma ir atjaunināta</p>' : `<div class="ahf">${['Firefox tīmekļa pārlūks', 'Linux kodols (drošība)', 'LibreOffice', 'Sistēmas bibliotēkas'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Instalē atjauninājumus…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Nepieciešama autentifikācija</strong></p><p class="fd">Ievadiet paroli, lai instalētu atjauninājumus. (Vingrinājums: ievadīta jūsu vietā.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Atcelt</button><button type="button" class="adg" data-tap="auth-ok">Autentificēt</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Atjauninājumi novērš drošības caurumus, ko izmanto krāpnieki. Pārbaudīsim, vai tādi ir. <strong>Noklikšķiniet uz Sākt.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Noklikšķiniet uz Iestatījumi</strong> (zobrats).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Noklikšķiniet uz Windows atjaunināšana</strong> saraksta apakšā kreisajā pusē.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Ir gaidoši atjauninājumi. <strong>Noklikšķiniet uz Lejupielādēt un instalēt visu.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Vispirms saglabājiet visu, pie kā strādājat, tad <strong>noklikšķiniet uz Restartēt tūlīt</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Atjauninājumi novērš drošības caurumus, ko izmanto krāpnieki. <strong>Noklikšķiniet uz Apple izvēlnes</strong> (logotipa) augšā kreisajā pusē.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Noklikšķiniet uz Sistēmas iestatījumi…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Jūs esat sadaļā Vispārīgi. <strong>Noklikšķiniet uz Programmatūras atjaunināšana.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Atjauninājums ir gatavs. Pievienojiet lādētāju, tad <strong>noklikšķiniet uz Atjaunināt tūlīt</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac to lejupielādē, tad restartējas, lai to instalētu.',
         question: {q: 'Automātiskie atjauninājumi ir ieslēgti. Vai vēl kas jādara?', options: [
            {t: 'Tikai restartēt, kad tas prasa, un laiku pa laikam atstāt pieslēgtu lādētājam pa nakti', ok: true, why: 'Jā. Atjauninājumi bieži instalējas naktī. Restartēšana pēc pieprasījuma tos pabeidz.'},
            {t: 'Izslēgt automātiskos atjauninājumus', why: 'Paturiet tos ieslēgtus: tie sargā jūs. Vienkārši restartējiet, kad Mac to prasa.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Atjauninājumi novērš drošības caurumus. Sistēmā Linux Mint <strong>vairogs</strong> pie pulksteņa rāda punktu, kad gaida atjauninājumi. <strong>Noklikšķiniet uz vairoga.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Atjauninājumu pārvaldnieks tos visus uzskaita. <strong>Noklikšķiniet uz Instalēt atjauninājumus.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux pirms jebkā svarīga maiņas prasa <strong>jūsu paroli</strong>. Tas ir labi. <strong>Noklikšķiniet uz Autentificēt.</strong>', hints: {'auth-cancel': 'Tas atceļ atjauninājumus. Noklikšķiniet uz Autentificēt.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Cik bieži jāinstalē atjauninājumi?', options: [
            {t: 'Kad vien vairogs rāda punktu: tas aizņem tikai minūti', ok: true, why: 'Jā. Linux Mint restartēšana vajadzīga reti, izņemot dažus drošības atjauninājumus.'},
            {t: 'Reizi gadā', why: 'Instalējiet tos, kad vien vairogs rāda punktu. Tas aizņem tikai minūti.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Lieliski!</strong> Jūsu dators ir atjaunināts. Atjaunināšana ir vislabākā lieta, ko varat darīt savai drošībai.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistēma', 'Displejs, skaņa, par'], ['tile-devices', '⟦printer⟧', 'Ierīces', 'Bluetooth, printeri'], ['tile-network', '⟦globe⟧', 'Tīkls un internets', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Konti', 'Jūsu konti'], ['tile-update', '⟦refresh-cw⟧', 'Atjaunināšana un drošība', 'Windows atjaunināšana']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Jūsu dators ir pieteikts Extended Security Updates</p><p class="cf">Drošības atjauninājumi līdz 2027. gada 12. oktobrim.</p>' : `<div class="ahg"><strong>Windows 10 atbalsts ir beidzies</strong><p>Jūsu dators neatbilst Windows 11 prasībām. Piesakieties Extended Security Updates, lai turpinātu saņemt drošības atjauninājumus.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Pieteikties tūlīt</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="cf">Izvēlieties, kā pieteikties:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Dublēt datora iestatījumus</strong><small>Bezmaksas, ar Microsoft kontu</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Izmantot 1000 Microsoft Rewards punktus</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Vienreizējs pirkums</strong><small>Maksas</small></button>${ctx.busy ? '<p class="cf">Piesakās…</p>' : ''}`;
        return pcWin('windows', 'Iestatījumi', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Ja jūsu dators izskatās šādi, ar Sākt pašā kreisajā pusē, iespējams, tas ir <strong>Windows 10</strong>. Pārbaudīsim. <strong>Noklikšķiniet uz Sākt.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Noklikšķiniet uz Iestatījumi</strong> (zobrats).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Noklikšķiniet uz Sistēma.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Rakstīts Windows 10 Home. Ko tas nozīmē 2026. gadā?', options: [
            {t: 'Microsoft pārtrauca parasto atbalstu 2025. gada oktobrī. Tas joprojām darbojas, bet drošībai vajag Extended Security Updates', ok: true,
             why: 'Jā. Bezmaksas programma Extended Security Updates mājas lietotājiem tagad darbojas līdz 2027. gada 12. oktobrim. Pēc tam Windows 10 vairs nesaņems drošības labojumus.'},
            {t: 'Neko, Windows 10 tiks atjaunināts mūžīgi', why: 'Parastais atbalsts beidzās 2025. gada oktobrī. Extended Security Updates tagad darbojas līdz 2027. gada 12. oktobrim, tad beidzas.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Noklikšķiniet uz ← Sākums,</strong> lai atgrieztos.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Noklikšķiniet uz Atjaunināšana un drošība.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Šis klēpjdators ir par vecu operētājsistēmai Windows 11, tāpēc Windows piedāvā <strong>Extended Security Updates</strong>. <strong>Noklikšķiniet uz Pieteikties tūlīt.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Bezmaksas veids ir dublēt iestatījumus Microsoft kontā. <strong>Noklikšķiniet uz Dublēt datora iestatījumus.</strong>', hints: {'esu-buy': 'Maksāt nav vajadzības. Izvēlieties bezmaksas dublēšanas opciju.', 'esu-points': 'Tas der, ja jums ir punkti, taču dublēšanas opcija ir bezmaksas visiem.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Kādas ir jūsu iespējas pirms 2027. gada oktobra?', options: [
            {t: 'Uzlabot uz Windows 11, ja iespējams, nopirkt jaunu datoru vai pārslēgt vecāku uz Linux Mint (bezmaksas)', ok: true, why: 'Jā. Linux Mint ir bezmaksas un labi darbojas vecākos klēpjdatoros. Nākamajās nodarbībās parādīts, kur kas atrodas Mac datorā un Linux Mint.'},
            {t: 'Pēc 2027. gada turpināt lietot Windows 10 bankas darījumiem', why: 'Pēc 2027. gada oktobra tas nesaņem drošības labojumus, tāpēc nav drošs bankas darījumiem. Uzlabojiet, nomainiet vai pārslēdzieties uz Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Lieliski!</strong> Jūs zināt, kāds Windows jums ir un kā to saglabāt drošu līdz 2027. gada oktobrim. Uzmanieties no zvaniem vai uznirstošajiem logiem, kas piedāvā jūs “uzlabot” par maksu: tā ir krāpšana.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Pārejat no Windows? Mac datorā lietotnes atrodas <strong>Dock</strong> apakšā, un katras lietotnes izvēlnes ir <strong>izvēļņu joslā</strong> augšā. <strong>Noklikšķiniet uz Safari</strong>, tīmekļa pārlūka, Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Mac datorā loga pogas ir <strong>augšā kreisajā pusē</strong>. <strong>Noklikšķiniet uz sarkanās,</strong> lai aizvērtu logu.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Logs ir pazudis, bet vai redzat <strong>punktu zem Safari</strong> Dock? Tas joprojām darbojas. Lai to aizvērtu, <strong>noklikšķiniet ar labo pogu uz Safari Dock</strong> (divi pirksti uz skārienpaliktņa).', hint: 'Noklikšķiniet ar labo pogu (vai ar diviem pirkstiem) uz Safari ikonas Dock.',
         hints: {'app-browser': 'Parasts klikšķis to atver atkal. Tā vietā noklikšķiniet ar labo pogu.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Noklikšķiniet uz Quit.</strong> <em>(Īsinājumtaustiņš ir ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Iestatījumi atrodas <strong>Apple izvēlnē</strong> (logotipā) augšā kreisajā pusē. <strong>Noklikšķiniet uz tās.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Izslēgšana (Shut Down) un restartēšana (Restart) arī ir šeit. <strong>Noklikšķiniet uz Sistēmas iestatījumi…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'Windows kopē ar Ctrl + C. Kā tas ir Mac datorā?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Jā. Lielākā daļa Windows īsinājumtaustiņu Mac datorā izmanto ⟦command⟧ Cmd Ctrl vietā: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, tāpat', why: 'Mac datorā tas ir ⟦command⟧ Cmd + C. Lielākā daļa Ctrl īsinājumtaustiņu kļūst par ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Lieliski!</strong> Dock apakšā, izvēlnes augšā, loga pogas augšā kreisajā pusē, ⟦command⟧ Cmd Ctrl vietā un Apple izvēlne iestatījumiem un izslēgšanai.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> ir bezmaksas sistēma, kas darbojas ļoti līdzīgi Windows un labi darbojas vecākos datoros. Jūsu lietotnes ir <strong>Izvēlnē</strong> apakšā pa kreisi, kā Sākt poga. <strong>Noklikšķiniet uz Izvēlne.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint ir jau instalētas bezmaksas lietotnes. Vēstulēm izmantojiet <strong>LibreOffice Writer</strong>, kas darbojas kā Microsoft Word. <strong>Noklikšķiniet uz tā.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Fails Rediģēt Skats Ievietot Formāts <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Cienījamais kungs vai dāma,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Vai varat atvērt Word dokumentus, ko cilvēki jums sūta e-pastā?', options: [
            {t: 'Jā. LibreOffice atver un saglabā Word (.docx) failus', ok: true, why: 'Jā. Saglabājot to, ko sūtīsit Word lietotājam, sadaļā Saglabāt kā izvēlieties Word formātu (.docx).'},
            {t: 'Nē, tam vajag Windows', why: 'LibreOffice atver un saglabā Word (.docx) failus, tāpēc varat apmainīties ar dokumentiem ar Word lietotājiem.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Untitled 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Cienījamais kungs vai dāma,</div></div>', {max: true})}),
         target: 'win-close', say: 'Loga pogas ir augšā labajā pusē, tieši kā Windows. <strong>Noklikšķiniet uz ⟦x⟧</strong>, lai aizvērtu Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Tagad atradīsim, kur iegūt vairāk lietotņu. <strong>Vēlreiz noklikšķiniet uz Izvēlne.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Programmatūras pārvaldnieks</strong> ir Linux Mint bezmaksas lietotņu veikals. <strong>Noklikšķiniet uz tā.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Programmatūras pārvaldnieks', `<div class="jo"><div class="gq">${ICON.search}<span>Meklēt</span></div>
            <div class="aan">${['Internets', 'Birojs', 'Grafika', 'Skaņa un video', 'Spēles', 'Pieejamība'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Tūkstošiem bezmaksas lietotņu, ko pārbaudījis Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Vai Linux Mint jāpērk antivīruss?', options: [
            {t: 'Nē. Atjauniniet to, iegūstiet lietotnes no Programmatūras pārvaldnieka, un esat labi aizsargāti', ok: true, why: 'Jā. Linux ir maz vīrusu. Atjauninājumi un iebūvētais ugunsmūris dara savu. E-pastu un vietņu krāpšana joprojām ir aktuāla, tāpēc esiet modri.'},
            {t: 'Jā, visdārgāko', why: 'Nē. Atjauniniet to un iegūstiet lietotnes no Programmatūras pārvaldnieka. Kā parasti, uzmanieties no e-pastu un vietņu krāpšanas.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Lieliski!</strong> Izvēlne apakšā pa kreisi, aizvēršana augšā pa labi, LibreOffice dokumentiem, Firefox tīmeklim, Programmatūras pārvaldnieks lietotnēm un vairogs atjauninājumiem.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB zibatmiņa pievienota</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Pirms mainiet datoru, nokopējiet failus uz <strong>USB zibatmiņu</strong>. Iebīdiet to USB slotā datora sānā. Šeit <strong>noklikšķiniet uz Pievienot USB zibatmiņu</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB zibatmiņa pievienota</div>'}), target: 'app-files', say: `<strong>Atveriet ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Atvērt'], ['menu-copy', 'Kopēt'], ['menu-rename', 'Pārdēvēt']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Jūsu vēstules ir mapē <strong>Dokumenti</strong>. <strong>Noklikšķiniet ar labo pogu uz mapes Dokumenti.</strong> <em>(Pēc tam tāpat izdariet ar Attēli.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Noklikšķiniet uz Kopēt.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Jūsu USB zibatmiņa ir kreisajā pusē. <strong>Noklikšķiniet uz USB zibatmiņa.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Tā ir tukša. <strong>Noklikšķiniet ar labo pogu uz tukšās vietas.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Noklikšķiniet uz ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Kopē 214 vienumus… atlikusi 1 minūte' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Izstumt']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Gatavs! Pirms izvelkat zibatmiņu, <strong>izstumiet</strong> to, lai nekas netiktu sabojāts. <strong>Noklikšķiniet ar labo pogu uz USB zibatmiņa</strong> kreisajā pusē.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Noklikšķiniet uz Izstumt.</strong> Tad to var droši izņemt.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Cits veids, kā pārvietot failus uz jaunu datoru?', options: [
            {t: 'Tiešsaistes krātuve: OneDrive, iCloud vai Google Drive', ok: true, why: 'Jā. Augšupielādējiet no vecā datora, pierakstieties jaunajā, un tie ir tur. USB zibatmiņa ir arī laba papildu kopija.'},
            {t: 'Nosūtīt katru failu sev pa e-pastam pa vienam', why: 'Tas aizņemtu mūžību! Izmantojiet USB zibatmiņu vai tiešsaistes krātuvi, piemēram, OneDrive, iCloud vai Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Lieliski!</strong> Jaunajā datorā pievienojiet zibatmiņu, atveriet to un nokopējiet mapes savos Dokumentos un Attēlos.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Bridlington autobusu laiki ⟦star⟧ Receptes</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Nav pierakstījies</span><button type="button" data-tap="sync">Ieslēgt sinhronizāciju…</button><button type="button" data-tap="guest">Atvērt viesa profilu</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Pierakstīties ar Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Vingrinājums: ievadīts jūsu vietā.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Tālāk</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Ieslēgt sinhronizāciju?</strong></p><p class="fd">Jūsu grāmatzīmes, paroles un vēsture tiks saglabātas jūsu Google kontā un parādīsies visās jūsu ierīcēs.</p><div class="jn"><button type="button" data-tap="cancel">Atcelt</button><button type="button" class="adg" data-tap="yes-in">Jā, piekrītu</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Jauna cilne</span>${profile}</div><div class="qn">⟦search⟧ Meklēt Google vai ierakstīt URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Sinhronizē jūsu grāmatzīmes…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Ja vecajā datorā lietojāt <strong>Chrome</strong>, pierakstīšanās atnes grāmatzīmes un saglabātās paroles uz jauno. (Firefox un Edge darbojas tāpat.) <strong>Noklikšķiniet uz Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Noklikšķiniet uz personas ikonas</strong> augšā labajā pusē.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Noklikšķiniet uz Ieslēgt sinhronizāciju…</strong>', hints: {guest: 'Viesa profils neko nesaglabā. Noklikšķiniet uz Ieslēgt sinhronizāciju.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Pierakstieties ar <strong>to pašu Google kontu</strong>, ko lietojāt vecajā datorā. <strong>Noklikšķiniet uz Tālāk.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Noklikšķiniet uz Jā, piekrītu.</strong>', hints: {cancel: 'Tas aptur sinhronizāciju. Noklikšķiniet uz Jā, piekrītu.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Jūsu grāmatzīmes ir atpakaļ. Vai paroļu saglabāšana pārlūkā ir droša?', options: [
            {t: 'Jā, ja jūsu Google kontam ir stipra parole un divpakāpju verifikācija', ok: true, why: 'Jā. Tas ir daudz drošāk nekā vienas paroles atkārtota lietošana visur. Aizsargājiet pašu kontu ar divpakāpju verifikāciju.'},
            {t: 'Nē, uzrakstīt tās uz pielīmējamas piezīmes uz ekrāna', why: 'Pārlūka paroļu pārvaldnieks ir daudz drošāks nekā piezīme uz ekrāna, ja vien jūsu kontam ir divpakāpju verifikācija.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Lieliski!</strong> Jūsu grāmatzīmes un paroles ir sekojušas jums. Publiskā vai koplietotā datorā nesinhronizējiet.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistēma'} Drošības brīdinājums ⚠️</strong>
            <p>Jūsu dators ir INFICĒTS ar 5 vīrusiem! Jūsu bankas dati un fotoattēli ir apdraudēti.</p><p>Neizslēdziet datoru. Zvaniet atbalstam tagad:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Zvanīt tagad</button><button type="button" data-tap="fake-close">Aizvērt</button></div>
            <small>(Vingrināšanās krāpniecības lapa. Numurs nav īsts.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Pamest vietni?</strong></p><p class="fd">Jūsu veiktās izmaiņas var netikt saglabātas.</p><div class="jn"><button type="button" data-tap="stay">Palikt</button><button type="button" class="adg" data-tap="leave">Pamest</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Pārlūkojot tas pēkšņi aizpildīja jūsu ekrānu. Vai tas ir īsts?', options: [
            {t: 'Nē. Tā ir viltota vietne, kas mēģina jūs nobiedēt, lai zvanītu krāpniekiem', ok: true, why: 'Tieši tā. Īsti brīdinājumi nekad nerāda tālruņa numuru, uz kuru zvanīt. Nezvaniet un nekam nenoklikšķiniet lapā.'},
            {t: 'Jā, ātri piezvanīt uz numuru', why: 'Nekad nezvaniet. Tā ir viltota lapa. “Atbalsta” cilvēki mēģinās pārņemt kontroli pār jūsu datoru un naudu.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Tas ir aizpildījis visu ekrānu, lai neredzētu, kā to aizvērt. Nospiediet taustiņu <strong>Esc</strong> (tastatūras augšā pa kreisi), lai izietu no pilnekrāna režīma.',
         hints: {'call-btn': 'Nekad! Nospiediet taustiņu Esc.', 'fake-close': 'Pogas lapā var būt lamatas. Tā vietā nospiediet tastatūras taustiņu Esc.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Tagad redzat pārlūku. <strong>Aizveriet cilni</strong> ar tās ⟦x⟧.',
         hints: {'call-btn': 'Nenoklikšķiniet uz nekā lapā. Aizveriet cilni ar tās ⟦x⟧.', 'fake-close': 'Tā ir daļa no krāpniecības lapas. Izmantojiet ⟦x⟧ uz pašas cilnes.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Tā mēģina jūs noturēt tur. <strong>Noklikšķiniet uz Pamest.</strong>', hints: {stay: 'Noklikšķiniet uz Pamest.'}},
        {screen: c => scareware(os, c), question: {q: 'Ko darīt, ja tā neaizveras vispār?', options: [
            {t: os === 'windows' ? 'Nospiest Ctrl + Shift + Esc, lai atvērtu Uzdevumu pārvaldnieku, izvēlēties pārlūku un noklikšķināt uz Beigt uzdevumu' : os === 'mac' ? 'Nospiest ⟦command⟧ Cmd + Option + Esc un piespiedu kārtā aizvērt pārlūku' : 'Noklikšķināt ar labo pogu uz pārlūka panelī un izvēlēties Aizvērt vai restartēt datoru',
             ok: true, why: 'Jā. Kad pārlūku atvērsiet vēlreiz, neļaujiet tam atjaunot vecās lapas. Der arī datora restartēšana.'},
            {t: 'Piezvanīt uz numuru, lai saņemtu palīdzību to aizvērt', why: 'Nekad nezvaniet. ' + (os === 'windows' ? 'Izmantojiet Ctrl + Shift + Esc (Uzdevumu pārvaldnieks), lai aizvērtu pārlūku.' : os === 'mac' ? 'Izmantojiet ⟦command⟧ Cmd + Option + Esc, lai piespiedu kārtā aizvērtu.' : 'Aizveriet pārlūku no paneļa vai restartējiet.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Lieliski!</strong> Jūsu dators nekad nebija inficēts: tā bija tikai tīmekļa lapa. Ja tomēr piezvanījāt uz šādu numuru, sazinieties ar savu banku un nomainiet paroles no citas ierīces.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows drošība', `<div class="aif"><h3>Aizsardzība pret vīrusiem un draudiem</h3><p class="mj">⟦check⟧ Pašlaik nav draudu</p>
                <p class="cf">Pēdējā skenēšana: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Notiek ātrā skenēšana… noskenēti 12 840 faili</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Aizsardzība pret vīrusiem</span><span>⟦check⟧ Ugunsmūris</span><span>⟦check⟧ Lietotņu un pārlūka vadība</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Ugunsmūra konfigurācija', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Ugunsmūris ir ieslēgts</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows ir iebūvēts bezmaksas antivīruss ar nosaukumu <strong>Windows drošība</strong>. Pārbaudīsim, vai tas darbojas. <strong>Noklikšķiniet uz Sākt.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Noklikšķiniet uz Iestatījumi.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Noklikšķiniet uz Privātums un drošība</strong> kreisajā pusē.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Noklikšķiniet uz Windows drošība.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Zaļas atzīmes nozīmē, ka esat aizsargāti. Mieram <strong>noklikšķiniet uz Ātrā skenēšana</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Vai jāmaksā par vēl vienu antivīrusu?', options: [
            {t: 'Nē. Windows drošība lielākajai daļai cilvēku ir pietiekama, un divi var palēnināt datoru', ok: true, why: 'Jā. Atjauniniet Windows un turiet ieslēgtu Windows drošību. Maksas antivīrusi bieži vien tikai pievieno uznirstošos logus un abonementus.'},
            {t: 'Jā, jo vairāk, jo labāk', why: 'Divas antivīrusa programmas var konfliktēt un palēnināt darbu. Windows drošība lielākajai daļai cilvēku ir pietiekama.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac datoriem ir iebūvēta bezmaksas aizsardzība, kas fonā pārbauda lietotnes un failus. Pārbaudīsim vienu iestatījumu. <strong>Noklikšķiniet uz Apple izvēlnes</strong> (logotipa).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Noklikšķiniet uz Sistēmas iestatījumi…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Noklikšķiniet uz Privātums un drošība</strong> kreisajā pusē.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Ir izvēlēts “Atļaut lietotnes no App Store un zināmiem izstrādātājiem”. Vai to vajadzētu mainīt?', options: [
            {t: 'Nē, atstājiet. Tas bloķē nezināmu izstrādātāju lietotnes', ok: true, why: 'Jā. Ja vietne liek to mainīt, lai kaut ko instalētu, tā ir liela brīdinājuma zīme.'},
            {t: 'Jā, atļaut lietotnes no jebkurienes', why: 'Atstājiet kā ir. Tas aptur nezināmu izstrādātāju lietotnes. Vietne, kas liek to mainīt, ir brīdinājuma zīme.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistēmas iestatījumi', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Vai Mac datoram jāpērk antivīruss?', options: [
            {t: 'Lielākajai daļai nav. Atjauniniet to un instalējiet lietotnes tikai no uzticamām vietām', ok: true, why: 'Jā. Atjauninājumi un iebūvētā aizsardzība dara savu. Uznirstošie logi, kas saka, ka jūsu Mac ir inficēts, ir krāpšana.'},
            {t: 'Jā, jebkuru, ko piedāvā uznirstošais logs', why: 'Uznirstošie logi, kas piedāvā Mac antivīrusu, parasti ir krāpšana. Tā vietā atjauniniet savu Mac.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint ir iebūvēts <strong>ugunsmūris</strong>, kas bloķē nevēlamus savienojumus. Tas ir izslēgts, līdz to ieslēdzat. <strong>Noklikšķiniet uz Izvēlne.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Noklikšķiniet uz Ugunsmūris.</strong> <em>(Meklējiet izvēlnē “firewall”, ja to neredzat.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Noklikšķiniet uz slēdža Status,</strong> lai ieslēgtu ugunsmūri.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Kas vēl pasargā Linux Mint?', options: [
            {t: 'Atjauninājumu instalēšana, kad vairogs rāda punktu, un lietotņu iegūšana no Programmatūras pārvaldnieka', ok: true, why: 'Jā. Un parastie noteikumi: esiet uzmanīgi ar e-pasta saitēm un uznirstošajiem logiem.'},
            {t: 'Nekas cits nav vajadzīgs', why: 'Turpiniet instalēt atjauninājumus un iegūt lietotnes no Programmatūras pārvaldnieka. E-pastu un vietņu krāpšana joprojām ir aktuāla.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Lieliski!</strong> Jūsu datora iebūvētā aizsardzība ir ieslēgta. Pārējo paveic atjauninājumi, piesardzība ar saitēm un instalēšana tikai no uzticamām vietām.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Sūtījumu piegāde</strong><span>Mēs jūs neatradām: pārkārtojiet piegādi šodien</span></button>
            <div class="lx"><strong>Sarah</strong><span>Fotoattēli no svētdienas</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Sestdienas pastaiga</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Sūtījumu piegāde</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Mēs šodien mēģinājām piegādāt jūsu sūtījumu, bet neviena nebija mājās. Lai pārkārtotu piegādi, nepieciešama maksa £1.45.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Pārkārtot piegādi</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Ziņot par pikšķerēšanu</button><button type="button" data-tap="reply">Atbildēt</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Pasts', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Paziņots un pārvietots uz surogātpastu</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Šeit ir jūsu e-pasts pārlūkā. <strong>Atveriet e-pastu Sūtījumu piegāde.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Datorā varat pārbaudīt, uz kurieni saite patiesībā ved, <strong>to nenoklikšķinot</strong>. <strong>Pavirziet peli virs “Pārkārtot piegādi”</strong> un turiet mierīgi. <em>(Skārienekrānā turiet to nospiestu.)</em>',
         hints: {'click-link': 'Nenoklikšķiniet! Vienkārši novietojiet peles rādītāju virs tās.'}, hint: 'Novietojiet peles rādītāju virs zilās saites, nenoklikšķinot.'},
        {screen: c => webmail(os, c), question: {q: 'Apakšā parādās īstā adrese: parcel-redelivery.example.top. Vai tā ir droša?', options: [
            {t: 'Nē. Tā nav īsta piegādes uzņēmuma vietne, un viņi prasa maksu', ok: true, why: 'Jā. Kurjeri neprasa nelielas maksas pa e-pastu vai īsziņu. Īstā adrese to atklāj.'},
            {t: 'Jā, tajā ir vārds “parcel”', why: 'Jebkurš var ierakstīt “parcel” tīmekļa adresē. Tas nav īsts kurjers, un maksa ir krāpšana.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Noklikšķiniet uz Ziņot par pikšķerēšanu.</strong> Krāpnieciskos e-pastus varat arī pārsūtīt uz report@phishing.gov.uk.', hints: {reply: 'Nekad neatbildiet krāpniekiem. Noklikšķiniet uz Ziņot par pikšķerēšanu.', 'click-link': 'Nenoklikšķiniet uz saites! Tā vietā par to paziņojiet.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Lieliski!</strong> Pavirziet peli, pirms noklikšķināt: ja adrese nesakrīt ar uzņēmumu, nenoklikšķiniet.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (vingrināšanās numurs). Šis ir īstais kods, lai atrastu sava tālruņa IMEI.',
        '999': 'Šis ir vingrināšanās tālrunis, tāpēc tas nevar zvanīt uz 999. Īstā ārkārtas situācijā zvaniet uz 999 vai 112.',
        '112': 'Šis ir vingrināšanās tālrunis, tāpēc tas nevar zvanīt uz 112. 112 darbojas tāpat kā 999 Apvienotajā Karalistē un visā Eiropā.',
        '159': '159 droši savieno jūs ar jūsu pašu banku. Izmantojiet to, ja zvans par jūsu naudu jūs uztrauc.',
        '7726': '7726 ir numurs, uz kuru pārsūtīt krāpnieciskas īsziņas. Uz vecajām tālruņu tastatūrām tas veido vārdu “SPAM”!',
        '123': 'speaking-clock',
        '1471': 'Tālruņa numurs 07700 900842 šodien zvanīja plkst. 11:20. (Vingrinājums. 1471 pasaka, kurš pēdējais zvanīja uz jūsu fiksēto tālruni.)',
        '01189998819991197253': 'Tas ir ārkārtas numurs no The IT Crowd. Vai esat mēģinājuši izslēgt un atkal ieslēgt?',
        '101': '101 ir policijas numurs lietām, kas nav ārkārtas situācijas.',
        '111': '111 ir NHS palīdzība, kad tas ir steidzami, bet nav ārkārtas situācija.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Tālrunis', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Ievadiet numuru</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mamma', '#f472b6', [['them', 'Domāju, ka LOL nozīmē “lots of love”. Es to rakstu pie visa!'], ['them', 'Vai tāpēc tava tante nav atbildējusi?'], ['them', 'Nosūtīts no mana iPad']]],
        ['Nezināms', '#94a3b8', [['them', 'Apsveicam! Jūs esat laimējis BEZMAKSAS tālruni. Noklikšķiniet šeit, lai saņemtu: prize-winner.example'], ['note', 'Šī ir krāpšana. Nepieskarieties saitei: pārsūtiet to uz 7726, tad izdzēsiet.']]],
        ['Sarah', '#a78bfa', [['them', 'Tētis mācās lietot emocijzīmes 😂'], ['them', 'Viņš man atsūtīja baklažānu un teica “vakariņām šovakar?” 🍆']]],
        ['Zobārsts', '#38bdf8', [['them', 'Atgādinājums: jūsu pieraksts ir otrdien plkst. 10:30. Atbildiet Y, lai apstiprinātu.']]],
    ];
    const MUM_REPLIES = ['Kas tas ir?', 'Piezvani man, es nevaru lasīt ziņas bez brillēm', 'Burvīgi! 👍', 'Vai saņēmi manu pēdējo ziņu? Kļūdas pēc nosūtīju to kaķim.', 'Nosūtīts no mana iPad', 'Labi, mīļumiņ xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Ziņas', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Kaija atkal uzbrūk' : 'Fotoattēls', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Pieķerta nozieguma vietā Bridlington promenādē. Čipsi netika atgūti.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Fotoattēli', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Pulkstenis', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Laikapstākļi', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Auksts, ar sniega brāzmām' : 'Saulaini periodi, vējains'}</p>
            <div class="ajf">${[['Pk', '⟦cloud-rain⟧', '11°'], ['Se', '⟦wind⟧', '10°'], ['Sv', '⟦sun⟧', '14°'], ['Pirm.', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Kaiju brīdinājums: <strong>augsts</strong>. Sargiet savus čipsus.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Cauri drēbju skapim, tad turpiniet iet garām laternas stabam.', home: 'Nav tādas vietas kā mājas. 🏠', 'mēness': '238 855 jūdzes. Satiksme nav intensīva.',
        chips: 'Tuvākā čipsu bode: jebkur Bridlington promenādē. 🍟', 'north pole': 'Ziemassvētku vecīša darbnīca. Slēgta līdz decembrim. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Burvīga vieta!',
        'flamborough': 'Flamborough Head: bāka, klintis un jūras papagaiļi. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `“${inp.value.trim()}”: šī vingrināšanās karte zina tikai dažas vietas. Izmēģiniet Bridlington, Flamborough vai Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Iestatījumi', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Lidmašīnas režīms' : 'Lidojuma režīms', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Tumšais režīms', st.dark)}${row('dnd', 'Netraucēt', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Par' : 'Par tālruni'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Par' : 'Par tālruni', `<div class="aic"><div class="lq">
            <div class="ho"><span>Nosaukums</span><b>Margaret tālrunis</b></div>
            <div class="ho"><span>Modelis</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS versija' : 'Android versija'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Krātuve</span><b>Pietiekami daudz mazbērnu fotoattēliem</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Sērijas numurs</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Klasiskā spēle no vecajiem mobilajiem tālruņiem.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Satur reklāmas · Pirkumi lietotnē'], ['knit', '⟦scissors⟧', 'Adīšanas raksti', 'Drīzumā šajā vingrināšanās veikalā.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Atvērt' : (p === 'ios' ? 'Iegūt' : 'Instalēt')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Rezultāts: <b class="ado">0</b></span><span>Labākais: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Pieskarieties virzienam (vai izmantojiet bulttaustiņus), lai sāktu</p>
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
                f.querySelector('.vy').textContent = `Spēle beigusies! Rezultāts ${score}. Pieskarieties virzienam, lai spēlētu vēlreiz.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Lidmašīna', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Netraucēt', st.dnd)}${t('torch', '⟦flashlight⟧', 'Lukturītis', st.torch)}${t('dark', '⟦sun-moon⟧', 'Tumšais režīms', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Velciet uz augšu, lai aizvērtu' : 'Aizvērt'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Jauns fona attēls');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `“Pie trešā signāla laiks būs ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} un ${t.getSeconds()} sekundes… pīkst, pīkst, pīkst.” (Vecais runājošais pulkstenis!)`; return; }
                msg.textContent = egg || (n ? 'Šis vingrināšanās tālrunis nevar veikt īstus zvanus. Izmēģiniet 123, 1471 vai *#06#…' : 'Vispirms ierakstiet numuru.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Lūdzu, nosūtiet savus bankas datus, lai saņemtu balvu!!! (Tā ir krāpšana. Bloķējiet šo numuru.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Paldies, jūsu pieraksts ir apstiprināts. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Pasts', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Sākt'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Apturēt'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Sākt'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Saules krēms uzlikts! Tas ir gandrīz kā Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Lukturītis ieslēgts. (Ekrāns mirdz gaismas vietā aizmugurē.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Lidmašīnas režīms ieslēgts: nekādu zvanu, īsziņu vai mobilo datu.' : 'Lidmašīnas režīms izslēgts.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Fona attēls nomainīts. Dodieties uz sākumu, lai to redzētu!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Tagad jūs esat izstrādātājs! (Īsts Android noslēpums: 7 reizes pieskarieties Build number.)' : st.build >= 3 ? `Jums vēl ${7 - st.build} soļi, lai kļūtu par izstrādātāju.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Paldies, ka vingrinājāties!</b>' : '<span>🤖</span><b>Vingrināšanās 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Jums nav vajadzīga lukturīša lietotne: tas ir iebūvēts jūsu tālruņa ātrajos iestatījumos. Bezmaksas lukturīša lietotnes bieži ir pilnas ar reklāmām vai sliktāk!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Tikai izrādei vingrināšanās veikalā.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Instalē…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Atvērt'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Lietotne', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Šī vingrināšanās lietotne ir daļa no savas nodarbības. Paskatieties kursos, lai to izmēģinātu pa īstam.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Jūs atradāt noslēpumu!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Zvans beidzies' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Nezināms' ? 'Zvanītājs' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Nezināms', number: '0161 496 0423', who: 'm', tag: 'Nav jūsu kontaktos',
         intro: 'Jūsu tālrunis zvana. Numurs nav saglabāts jūsu kontaktos. <strong>Atbildiet,</strong> lai vingrinātos. <em>Palieliniet skaņu, lai dzirdētu zvanītāju.</em>',
         lines: [
            {text: 'Sveiki, šeit Mark no jūsu bankas krāpšanas novēršanas komandas. Mēs pamanījām aizdomīgus maksājumus jūsu kontā. Pirms turpinu, vai varat apstiprināt savu pilno vārdu, dzimšanas datumu un garo numuru uz jūsu bankas kartes?',
             q: 'Zvanītājs saka, ka ir no jūsu bankas. Ko jūs darāt?', options: [
                {t: 'Sniedzu datus, viņš ir no bankas', why: 'Banka, kas jums zvana, nekad neprasīs jūsu pilnu kartes numuru. Tā krāpnieki iegūst jūsu datus.'},
                {t: 'Pasaku, ka atzvanīšu savai bankai uz numuru uz savas kartes, un nolieku klausuli', ok: true, why: 'Tieši tā. Zvaniet uz numuru uz kartes, ja iespējams, no cita tālruņa, vai ievadiet 159.'},
                {t: 'Palūdzu viņam pierādīt, kas viņš ir', why: 'Krāpnieki skan pārliecinoši un bieži jau zina dažus jūsu datus. Drošākais ir nolikt klausuli un piezvanīt savai bankai paši.'}]},
            {text: 'Lūdzu, nelieciet klausuli! Noziedznieki tieši tagad ņem naudu no jūsu konta. Jums viss jāpārvieto uz drošu kontu, ko es jums izveidošu. Tas jāizdara nākamo desmit minūšu laikā.',
             q: 'Viņš saka, ka tas ir steidzami un jums jāpārvieto nauda. Ko tagad?', options: [
                {t: 'Ātri pārvietot naudu, kamēr nav par vēlu', why: '“Drošs konts” nepastāv. Jūsu banka nekad neprasīs pārvietot naudu. Tā ir krāpšana.'},
                {t: 'Nolieku klausuli. Īsta banka nekad neprasa pārvietot naudu uz “drošu kontu”', ok: true, why: 'Jā. Steiga un “drošais konts” ir pazīmes. Nolieciet klausuli un ievadiet 159.'}]}],
         hang: 'Nolieciet klausuli ar sarkano pogu.'},
        {letter: '?', color: '#64748b', name: 'Nezināms', number: '020 7946 0815', who: 'robot', tag: 'Nav jūsu kontaktos',
         intro: 'Vēl viens zvans. <strong>Atbildiet.</strong>',
         lines: [
            {text: 'Šis ir automātisks ziņojums no H M R C. Pret jums izdots apcietināšanas orderis par nesamaksātiem nodokļiem. Lai runātu ar amatpersonu, nospiediet 1 tagad.',
             q: 'Ierakstīta balss saka, ka jūs apcietinās par nodokļiem. Ko jūs darāt?', options: [
                {t: 'Nospiest 1, lai to nokārtotu', why: 'Nospiežot 1, jūs savieno ar krāpniekiem, kuri prasīs maksājumu, bieži dāvanu kartēs. HMRC nekad nedraud ar apcietināšanu ierakstītā ziņojumā.'},
                {t: 'Nolikt klausuli. HMRC nezvana ar apcietināšanas draudiem', ok: true, why: 'Pareizi. HMRC vispirms raksta jums un nekad nedraud ar apcietināšanu pa tālruni.'}]}],
         hang: 'Nolieciet klausuli.'},
        {letter: '?', color: '#64748b', name: 'Nezināms', number: '0113 496 0332', who: 'm', tag: 'Nav jūsu kontaktos',
         intro: 'Jūsu tālrunis atkal zvana. <strong>Atbildiet.</strong>',
         lines: [
            {text: 'Sveiki, es zvanu no Windows tehniskā departamenta. Jūsu dators ir sūtījis mums kļūdu ziņojumus, un tajā ir ļoti bīstams vīruss. Lūdzu, ejiet un ieslēdziet datoru, un es palīdzēšu to salabot.',
             q: 'Viņš saka, ka jūsu datorā ir vīruss. Ko jūs darāt?', options: [
                {t: 'Ieslēdzu datoru un izpildu viņa norādījumus', why: 'Viņš lūgtu instalēt programmu, kas ļauj viņam kontrolēt jūsu datoru, tad prasītu naudu. Microsoft nekad tā nezvana.'},
                {t: 'Nolieku klausuli. Datoru uzņēmumi nezvana par vīrusiem', ok: true, why: 'Tieši tā. Nekad neļaujiet zvanītājam piekļūt jūsu datoram.'},
                {t: 'Paskaidroju, ka man nav datora', why: 'Jums nav jāpaskaidro vai jāstrīdas. Vienkārši nolieciet klausuli.'}]}],
         hang: 'Nolieciet klausuli.'},
        {letter: '?', color: '#64748b', name: 'Nezināms', number: '0808 157 0190', who: 'f', tag: 'Nav jūsu kontaktos',
         intro: 'Vēl viens zvans. <strong>Atbildiet.</strong>',
         lines: [
            {text: 'Sveiki. Jūsu tiešsaistes iepirkšanās kontā ir veikts pasūtījums jaunam iPhone par deviņi simti deviņdesmit deviņām mārciņām. Ja jūs šo pasūtījumu neveicāt, nospiediet 1, lai to atceltu un runātu ar mūsu komandu.',
             q: 'Jūs neesat pasūtījuši iPhone. Ko jūs darāt?', options: [
                {t: 'Nospiest 1, lai atceltu pasūtījumu', why: 'Nospiežot 1, jūs savieno ar krāpnieku, kurš “atmaksās” naudu, prasot jūsu bankas datus vai piekļuvi jūsu datoram.'},
                {t: 'Nolikt klausuli, tad pašam pārbaudīt kontu lietotnē vai vietnē', ok: true, why: 'Jā. Ja pasūtījums tiešām būtu, jūs to redzētu savā kontā. Nekad neizmantojiet numuru vai pogu, ko dod zvanītājs.'}]}],
         hang: 'Nolieciet klausuli.'},
        {letter: 'S', color: '#16a34a', name: 'Ģimenes ārsta prakse', number: '01632 960211', who: 'f', tag: 'Saglabāts jūsu kontaktos',
         intro: 'Vēl viens zvans: šoreiz tā ir ārsta prakse, saglabāta jūsu kontaktos. <strong>Atbildiet.</strong>',
         lines: [
            {text: 'Sveiki, šeit Sue no ārsta prakses. Tikai ātrs atgādinājums, ka jūsu gripas vakcinācija ir pierakstīta otrdien plkst. desmitos. Jums nekas nav jādara. Ja vajag to mainīt, piezvaniet mums uz parasto numuru. Uz drīzu redzēšanos!',
             q: 'Vai šis zvans ir krāpšana?', options: [
                {t: 'Jā: nolikt klausuli un bloķēt numuru', why: 'Šis ir kārtībā! Viņa neko neprasīja, nesteidzināja jūs un teica izmantot parasto numuru.'},
                {t: 'Droši vien īsts: viņa neprasīja naudu vai datus un teica zvanīt uz parasto numuru', ok: true, why: 'Tieši tā. Īsti zvani nespiež uz jums. Ja kādreiz neesat pārliecināti, atzvaniet uz numuru, kas jums jau ir.'}]}],
         hang: 'Zvans ir beidzies. <strong>Pieskarieties sarkanajai pogai,</strong> lai nolikti klausuli.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>${n + 1}. zvans no ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'Īstajā dzīvē ir pilnīgi kārtībā neatbildēt uz nepazīstamiem numuriem! Šim vingrinājumam pieskarieties zaļajai pogai, lai atbildētu.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Kas no šī ir krāpnieciska zvana pazīme?', options: [
            {t: 'Steiga, draudi vai prasība turēt to noslēpumā', ok: true, why: 'Jā. Spiediens ir lielākā pazīme. Īsts zvanītājs labprāt ļauj jums neskubināties un atzvanīt.'},
            {t: 'Zvanītājs zina jūsu vārdu', why: 'Krāpnieki bieži zina jūsu vārdu un pat dažus konta datus. Tas vien nepadara zvanu īstu.'},
            {t: 'Numurs izskatās vietējs', why: 'Krāpnieki var likt jūsu ekrānā parādīties jebkuram numuram, pat vietējam vai jūsu bankas. Neuzticieties numuram.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Lieliski!</strong> Jūs nolikāt klausuli četriem krāpniekiem un pamanījāt īsto zvanu. Atcerieties: šaubu gadījumā nolieciet klausuli un atzvaniet uz numuru, kam uzticaties. Savai bankai ievadiet 159.'},
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
            ios: ['iPhone', 'Ražo Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola un citi'],
            windows: ['Windows', 'Lielākā daļa klēpjdatoru un galddatoru'], mac: ['Mac', 'Ražo Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu un citi'],
        };
        const notSure = isPC
            ? 'Paskatieties uz ekrānu. Windows apakšā ir poga Sākt (četri mazi kvadrāti). Mac augšā kreisajā pusē ir Apple logotips. Linux Mint apakšā kreisajā pusē ir poga Izvēlne.'
            : 'iPhone aizmugurē ir Apple logotips (ābols ar iekodienu). Ja jūsējam tā nav, tas gandrīz noteikti ir Android tālrunis.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Kurš ${isPC ? 'dators jums ir' : 'tālrunis jums ir'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Neesat pārliecināti?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Parādiet, kur</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Dzirdēt vēlreiz</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Atpakaļ vienu soli</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Pārslēgt ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">VINGRINĀŠANĀS ${isPC ? 'DATORS' : 'TĀLRUNIS'}: nav īsts. Nekas, ko šeit darāt, netiek nekur sūtīts.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Izslēgt balsi' : 'Ieslēgt balsi'; };
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
            showBtn.textContent = 'Atpakaļ uz nodarbību';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Parādiet, kur';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Pabeigts!' : `${i + 1}. solis no ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Pareizi!' : 'Gandrīz.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Turpināt</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Mēģināt vēlreiz</button>${pageNext
                ? `<button type="button" class="ap vb">Labs darbs! ${last ? 'Tagad pabeidziet kursu' : 'Kāpēc gan neizmēģināt nākamo nodarbību'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Gandrīz. ' + (step.hint || 'Vēlreiz paskatieties instrukcijas.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Vēl ne gluži. Vēlreiz paskatieties instrukcijas.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Gandrīz. ' + (step.hint || 'Vēlreiz paskatieties instrukcijas.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Lietotne';
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
                else hint.textContent = 'Noklikšķiniet ar labo pogu: nospiediet labo peles pogu. Mac skārienpaliktnī noklikšķiniet ar diviem pirkstiem. Skārienekrānā turiet nospiestu.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Turiet pirkstu (vai peles pogu) nospiestu uz tā, līdz kaut kas notiek.';
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
                showBtn.textContent = 'Parādiet, kur';
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
