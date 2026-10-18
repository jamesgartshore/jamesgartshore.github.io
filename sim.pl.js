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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Sklep Play'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Telefon', '#22c55e', ICON.phone], ['messages', 'Wiadomości', '#22c55e', ICON.bubble], ['camera', 'Aparat', '#6b7280', ICON.camera],
               ['photos', 'Zdjęcia', '#e5e7eb', ICON.photos], ['mail', 'Poczta', '#3b82f6', ICON.mail], ['clock', 'Zegar', '#111827', ICON.clock],
               ['weather', 'Pogoda', '#38bdf8', ICON.weather], ['maps', 'Mapy', '#22c55e', ICON.map], ['settings', 'Ustawienia', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Telefon', '#2563eb', ICON.phone], ['messages', 'Wiadomości', '#3b82f6', ICON.bubble], ['camera', 'Aparat', '#6b7280', ICON.camera],
               ['photos', 'Zdjęcia', '#e5e7eb', ICON.photos], ['clock', 'Zegar', '#111827', ICON.clock], ['maps', 'Mapy', '#16a34a', ICON.map],
               ['settings', 'Ustawienia', '#475569', ICON.settings], ['weather', 'Pogoda', '#38bdf8', ICON.weather], ['mail', 'E-mail', '#ef4444', ICON.mail],
               ['store', 'Sklep Play', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Przesuń palcem w dół od prawego górnego rogu ⟦chevron-down⟧' : 'Przesuń palcem w dół od góry ekranu ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Dzisiaj</div>
                <div class="hp"><span>WYRÓŻNIONE</span><strong>Aplikacje, które lubimy w tym tygodniu</strong></div>
                <div class="hp alt"><span>NA START</span><strong>Pomysły na twojego nowego iPhone'a</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Dzisiaj</button><button type="button" data-tap="games">Gry</button>
                    <button type="button" data-tap="apps">Aplikacje</button><button type="button" data-tap="search-tab">${ICON.search}Szukaj</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Szukaj aplikacji i gier</span></button>
            <div class="tg"><span class="on">Dla ciebie</span><span>Najlepsze</span><span>Dla dzieci</span></div>
            <div class="hp"><span>POLECANE DLA CIEBIE</span><strong>Aplikacje na start</strong></div>
            <div class="hp alt"><span>POPULARNE</span><strong>Bądź w kontakcie</strong></div>
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
        const btnLabel = p === 'ios' ? 'Pobierz' : 'Zainstaluj';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 mld+ pobrań' : 'Sieci społecznościowe'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Bezpłatna</span></div></div>
                <p class="agm">Na prawdziwym iPhonie może być trzeba dwukrotnie nacisnąć przycisk boczny, spojrzeć na ekran, żeby użyć Face ID, albo wpisać tutaj hasło do konta Apple.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Zainstaluj</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Anuluj</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Witamy w WhatsApp</h3>
            <p>Przeczytaj naszą <u>Politykę prywatności</u>. Dotknij „Zgadzam się i kontynuuj”, aby zaakceptować <u>Warunki korzystania z usługi</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Zgadzam się i kontynuuj</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Wpisz swój numer telefonu</h3>
            <p>WhatsApp musi sprawdzić twój numer telefonu. Mogą obowiązywać opłaty operatora.</p>
            <div class="abt">Wielka Brytania <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Dalej</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Czy ten numer jest poprawny?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Edytuj</button><button type="button" data-tap="yes">${ios ? 'Tak' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>WIADOMOŚCI · teraz</strong><span>Twój kod WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Nie udostępniaj tego kodu innym.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Weryfikowanie numeru</h3>
            <p>Oczekiwanie na automatyczne wykrycie 6-cyfrowego kodu wysłanego SMS-em na numer <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Kod nie dotarł?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['„WhatsApp” chce uzyskać dostęp do twoich kontaktów', 'Żebyś widział, którzy znajomi korzystają z WhatsAppa.', 'Zezwolić WhatsAppowi na dostęp do kontaktów?']
            : ['„WhatsApp” chce wysyłać ci powiadomienia', 'Żebyś wiedział, kiedy przyjdzie nowa wiadomość.', 'Zezwolić WhatsAppowi na wysyłanie powiadomień?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Informacje profilowe</h3>
            <p>Wpisz swoje imię i w razie ochoty dodaj zdjęcie profilowe.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Twoje imię</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Dalej</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Czaty' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Wszystko gotowe${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Tutaj pojawią się twoje czaty. Dotknij przycisku nowego czatu, żeby napisać do kogoś z kontaktów.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `To ekran główny twojego telefonu. Aplikacje pobiera się z <strong>${store}</strong>. Jest to bezpłatne i to bezpieczne miejsce na aplikacje. <strong>Dotknij ${store}.</strong>`,
                 hint: `Szukaj ikony ${store}. ${p === 'ios' ? "Jest niebieska z białą literą A." : "To kolorowy trójkąt."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Teraz musisz wyszukać WhatsApp. <strong>Dotknij Szukaj</strong> w prawym dolnym rogu.' : 'Teraz musisz wyszukać WhatsApp. <strong>Dotknij paska wyszukiwania</strong> u góry.',
                 hint: p === 'ios' ? 'Szukaj to lupa w prawym dolnym rogu.' : 'Pasek wyszukiwania ma napis „Szukaj aplikacji i gier”.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Wpisaliśmy za ciebie <em>whatsapp</em>. Pojawia się lista podpowiedzi. <strong>Dotknij „whatsapp messenger”.</strong>",
                 hint: 'Dotknij podpowiedzi „whatsapp messenger”.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Uwaga: niektóre aplikacje udają WhatsApp. Prawdziwa nazywa się <strong>WhatsApp Messenger</strong>, jej autorem jest <strong>WhatsApp Inc.</strong> i jest bezpłatna. <strong>Dotknij ${p === 'ios' ? 'Pobierz' : 'Zainstaluj'} obok prawdziwej.</strong>`,
                 hints: {'fake1-get': 'To „WhatsUp Chat Free” od Fun Apps Ltd. To podróbka, a etykieta „Reklama” oznacza, że to reklama. Sprawdź nazwę i autora.',
                         'fake2-get': 'To „WA Messenger for Chat Pro” od LuckyDev Studio, czyli kopia. Prawdziwą aplikację tworzy WhatsApp Inc.'},
                 hint: 'Znajdź „WhatsApp Messenger” od „WhatsApp Inc.”'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Twój iPhone sprawdza, czy to naprawdę ty, zanim zainstaluje aplikację. Na prawdziwym iPhonie możesz użyć <strong>Face ID</strong>, <strong>odcisku palca</strong> (Touch ID) lub <strong>hasła do konta Apple</strong>. Tutaj po prostu <strong>dotknij Zainstaluj.</strong>',
                    hints: {'sheet-cancel': 'Anuluj zatrzyma pobieranie. Dotknij zamiast tego Zainstaluj.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Trwa pobieranie. Gdy się skończy, przycisk zmieni się na <strong>Otwórz</strong>. <strong>Dotknij Otwórz.</strong>`,
                 hint: 'Poczekaj, aż przycisk zmieni się na Otwórz, a potem go dotknij.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp otwiera się po raz pierwszy. Prosi o zgodę na warunki. <strong>Dotknij „Zgadzam się i kontynuuj”.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp używa twojego numeru telefonu komórkowego, żeby znajomi mogli cię znaleźć. <strong>Dotknij pola z numerem telefonu</strong>, a my wpiszemy numer ćwiczebny.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Na prawdziwym telefonie wpisałbyś własny numer komórkowy. Tutaj użyliśmy zmyślonego: <strong>07700 900123</strong>. <strong>Dotknij Dalej.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp sprawdza, czy numer został wpisany poprawnie. Ten jest dobry, więc <strong>dotknij ${p === 'ios' ? 'Tak' : 'OK'}.</strong>`,
                 hints: {edit: `Dotknąłbyś Edytuj, gdybyś się pomylił. Ten numer jest poprawny, więc dotknij ${p === 'ios' ? 'Tak' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp wysyła SMS-a z 6-cyfrowym kodem, żeby sprawdzić, czy numer jest twój. Twój iPhone proponuje, że wpisze go za ciebie. <strong>Dotknij kodu nad klawiaturą.</strong>'
                    : 'WhatsApp wysyła SMS-a z 6-cyfrowym kodem, żeby sprawdzić, czy numer jest twój. Wiele telefonów z Androidem wpisuje go samodzielnie. Jeśli twój tego nie robi, <strong>dotknij wiadomości</strong> u góry.'},
                {screen: c => waCode(p, c),
                 question: {q: 'W trakcie konfiguracji znajomy pisze do ciebie: <em>„Cześć! Przez pomyłkę wysłałem ci 6-cyfrowy kod, możesz mi go odesłać?”</em> Co robisz?',
                    options: [
                        {t: 'Wysyłam, to przecież znajomy', why: 'To częste oszustwo. Ktoś przejął konto twojego znajomego, a ten kod oddałby mu także twoje.'},
                        {t: 'Nie wysyłam. Nikt nigdy nie powinien o niego prosić', ok: true, why: 'Dokładnie. Ten kod to klucz do twojego WhatsAppa. Nigdy nikomu go nie podawaj, nawet znajomemu ani komuś, kto podaje się za pracownika WhatsAppa.'},
                        {t: 'Wysyłam tylko pierwsze 3 cyfry', why: 'Nawet część kodu pomaga oszustowi. Nigdy nie podawaj żadnej jego części.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp prosi o dostęp do twoich kontaktów, żeby pokazać ci, którzy znajomi z niego korzystają. <strong>Dotknij Zezwól.</strong>',
                 hints: {deny: 'Możesz nie zezwolić, ale wtedy WhatsApp nie pokaże imion twoich znajomych. W tym ćwiczeniu dotknij Zezwól.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Powiadomienia informują cię o nadejściu wiadomości, nawet gdy WhatsApp jest zamknięty. <strong>Dotknij Zezwól.</strong>',
                 hints: {deny: 'Bez powiadomień nie dowiesz się, że ktoś do ciebie napisał. Dotknij Zezwól w tym ćwiczeniu.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Ostatni krok: twoje imię widzą znajomi. <strong>Wpisz swoje imię w polu</strong>, a potem <strong>dotknij Dalej</strong>. (Zostaje na tej stronie i nie jest nigdzie wysyłane.)',
                 hints: {photo: 'W prawdziwej aplikacji możesz teraz wybrać zdjęcie albo dodać je później w Ustawieniach. Na razie je pomińmy: wpisz imię i dotknij Dalej.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Brawo, WhatsApp jest skonfigurowany!</strong> Tutaj pojawią się twoje czaty. W kolejnych lekcjach wyślesz swoją pierwszą wiadomość.'},
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
            const lockName = ctx.touch ? 'Touch ID i kod' : 'Face ID i kod';
            const groups = [
                [['airplane', 'Tryb samolotowy', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Sieć komórkowa', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Powiadomienia', '#ef4444', '⟦bell⟧'], ['sounds', 'Dźwięki i wibracje', '#ec4899', '⟦volume-2⟧'], ['focus', 'Skupienie', '#6366f1', '⟦moon⟧']],
                [['general', 'Ogólne', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Dostępność', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence i Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Ekran i jasność', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Alarm SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Prywatność i ochrona', '#3b82f6', '⟦hand⟧'], ['battery', 'Bateria', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Aplikacje', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Konto Apple, iCloud i więcej</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Sieć i internet', 'Komórkowa, Wi-Fi, hotspot'], ['devices', 'Połączone urządzenia', 'Bluetooth, parowanie'],
            ['apps', 'Aplikacje', 'Ostatnie aplikacje, aplikacje domyślne'], ['notifications', 'Powiadomienia', 'Historia powiadomień'], ['battery', 'Bateria', '85%'], ['storage', 'Pamięć', '91% used'],
            ['sound', 'Dźwięk i wibracje', 'Głośność, wibracje'], ['display', 'Wyświetlacz i dotyk', 'Ciemny motyw, rozmiar czcionki'],
            ['accessibility', 'Dostępność', 'Wyświetlacz, interakcje, dźwięk'], ['security', 'Zabezpieczenia i prywatność', 'Zabezpieczenia aplikacji, blokada urządzenia, uprawnienia'],
            ['location', 'Lokalizacja', 'Włączona'], ['safety', 'Bezpieczeństwo i alarmy', 'Alarm SOS, informacje medyczne, alerty'],
            ['google', 'Google', 'Usługi i preferencje'], ['system', 'System', 'Języki, czas, aktualizacje oprogramowania']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID i kod' : 'Face ID i kod';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Palec 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Zresetuj Face ID</span></div><div class="cj ex"><span>Skonfiguruj alternatywny wygląd</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Wyłącz kod</span></div><div class="cj ex"><span>Zmień kod</span></div>'
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

    const androidSecurity = () => androidList('Zabezpieczenia i prywatność', [
        ['device-unlock', 'Odblokowanie urządzenia', 'Blokada ekranu, rozpoznawanie twarzy i odcisk palca'], ['app-security', 'Zabezpieczenia aplikacji', 'Skanuj aplikacje pod kątem szkodliwego działania'],
        ['theft', 'Ochrona przed kradzieżą', 'Zablokuj telefon, jeśli zostanie skradziony'], ['privacy', 'Prywatność', 'Uprawnienia, aktywność konta']]);
    const androidDeviceUnlock = ctx => androidList('Odblokowanie urządzenia', [
        ['screen-lock', 'Blokada ekranu', ctx.passcodeSet ? 'PIN' : 'Brak'], ['face-finger', 'Rozpoznawanie twarzy i odcisk palca', ctx.faceDone || ctx.fingerDone ? 'Skonfiguruj' : 'Skonfiguruj, aby odblokowywać szybciej']]);
    const androidFaceFinger = ctx => androidList('Rozpoznawanie twarzy i odcisk palca', [
        ['face-unlock', 'Rozpoznawanie twarzy', ctx.faceDone ? 'Dodano twarz' : 'Skonfiguruj'], ['fingerprint-unlock', 'Odblokowanie odciskiem palca', ctx.fingerDone ? '1 fingerprint' : 'Skonfiguruj']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Pierwsze skanowanie Face ID zakończone.' : 'Face ID jest już skonfigurowany.') : 'Dodano twarz';
        const btn = p === 'ios' ? (first ? 'Kontynuuj' : 'Gotowe') : 'Gotowe';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Powoli poruszaj głową, aby dokończyć okrąg.' : 'Trzymaj twarz w okręgu i powoli poruszaj głową.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Zakończono' : 'Dostosuj chwyt') : (stage === 'grip' ? 'Dostosuj chwyt' : 'Przyłóż palec'))
            : (ready ? 'Dodano odcisk palca' : 'Dotknij czujnika');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Twojego odcisku palca można teraz używać do odblokowywania iPhone\'a.' : 'Teraz przyłóż krawędzie opuszki palca do przycisku Home.')
                     : (stage === 'grip' ? 'Oprzyj krawędzie opuszki palca na przycisku Home.' : 'Wielokrotnie unoś palec i opieraj go na przycisku Home.'))
            : (ready ? 'Teraz możesz odblokowywać telefon odciskiem palca.' : 'Dotykaj czujnika, unoś palec i dotykaj ponownie, aż odcisk będzie pełny.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Kontynuuj' : 'Gotowe'}</button>` : sensor}
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
                 say: 'Kod, Face ID i Touch ID znajdziesz w aplikacji <strong>Ustawienia</strong>. <strong>Dotknij Ustawienia</strong> (szare kółko zębate).',
                 hint: 'Ustawienia to szara ikona z kółkiem zębatym.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `W razie potrzeby przewiń listę w dół i <strong>dotknij ${ctx.touch ? 'Touch ID i kod' : 'Face ID i kod'}</strong>.`,
                 hint: `Szukaj „${ctx.touch ? 'Touch ID i kod' : 'Face ID i kod'}”, poniżej Ekran i jasność.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Blokadę ekranu, rozpoznawanie twarzy i odciski palców znajdziesz w aplikacji <strong>Ustawienia</strong>. <strong>Dotknij Ustawienia</strong> (kółko zębate).',
             hint: 'Ustawienia to ikona z kółkiem zębatym.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'W razie potrzeby przewiń w dół i <strong>dotknij Zabezpieczenia i prywatność</strong>. <em>W telefonie Samsung nazywa się to Zabezpieczenia i prywatność, a potem Dane biometryczne lub Ekran blokady.</em>',
             hint: 'Szukaj „Zabezpieczenia i prywatność” w dolnej części listy.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Dotknij Odblokowanie urządzenia.</strong>',
             hint: 'To pierwsza opcja, „Odblokowanie urządzenia”.'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Wpisz kod' : 'Wpisz swój PIN', p === 'ios' ? '' : 'Aby kontynuować, wpisz swój PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}Telefon najpierw sprawdza, czy to ty. <strong>Wpisz kod ćwiczebny: ${codeText}</strong>. <em>Nigdy nie wpisuj swojego prawdziwego kodu na stronie internetowej.</em>`,
        hint: `Wpisz kod ćwiczebny ${codeText}, po jednej cyfrze.`,
    });

    const safestQuestion = {
        q: 'Który z tych kodów będzie <strong>najbezpieczniejszy</strong>?',
        options: [
            {t: '123456', why: '123456 to najczęściej używany kod ze wszystkich, więc jest jednym z pierwszych, które wypróbuje złodziej.'},
            {t: 'Twoja data urodzenia, na przykład 140352', why: 'Daty urodzenia łatwo znaleźć w mediach społecznościowych, kartkach czy poczcie. Unikaj dat, które coś znaczą.'},
            {t: 'Sześć cyfr, które nikomu nic nie mówią', ok: true, why: 'Dokładnie. Losowe cyfry, które nie są datą, wzorem ani powtórzeniem, najtrudniej odgadnąć.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Ten telefon nie ma jeszcze kodu, więc każdy mógłby go otworzyć. <strong>Dotknij Włącz kod.</strong>',
                 hints: {stolen: 'Ochrona skradzionego urządzenia jest omówiona w lekcji 4. Najpierw włącz kod.'}},
                {screen: c => codeScreen(p, c, 'Ustaw kod', 'Wpisz kod', '<p class="aeh">Opcje kodu</p>'), sequence: CODE_KEYS,
                 say: `Wybierz 6 cyfr, które zapamiętasz. W tym ćwiczeniu <strong>wpisz ${codeText}</strong>. <em>Nie wpisuj tutaj swojego prawdziwego kodu.</em>`,
                 hint: `Wpisz ${codeText}, po jednej cyfrze.`},
                {screen: c => codeScreen(p, c, 'Ustaw kod', 'Wpisz nowy kod ponownie'), sequence: CODE_KEYS,
                 say: `Twój iPhone prosi o to jeszcze raz, żeby upewnić się, że nie ma pomyłki. <strong>Wpisz ponownie ${codeText}.</strong>`,
                 hint: `Wpisz ponownie ${codeText}.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Brawo, twój telefon ćwiczeniowy ma teraz kod!</strong> Na prawdziwym iPhonie w tym miejscu możesz też zostać poproszony o hasło do konta Apple.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Blokada ekranu ma wartość <strong>Brak</strong>, więc każdy mógłby otworzyć ten telefon. <strong>Dotknij Blokada ekranu.</strong>'},
            {screen: () => androidList('Wybierz blokadę ekranu', [['none', 'Brak'], ['swipe', 'Przesunięcie'], ['pattern', 'Wzór'], ['pin', 'PIN'], ['password', 'Hasło']]),
             target: 'pin', say: 'Masz kilka możliwości. <strong>PIN</strong> (cyfry) jest prosty i bezpieczny. <strong>Dotknij PIN.</strong>',
             hints: {none: 'Brak oznacza, że każdy może otworzyć twój telefon.', swipe: 'Przesunięcie po prostu otwiera telefon ruchem palca, więc niczego nie chroni.',
                     pattern: 'Wzór można odgadnąć po śladach palca na ekranie. PIN jest bezpieczniejszy.',
                     password: 'Hasło też się nadaje, ale PIN szybciej wpisać na co dzień. W tym ćwiczeniu dotknij PIN.'}},
            {screen: c => codeScreen(p, c, 'Wybierz PIN', 'PIN musi mieć co najmniej 4 cyfry'), sequence: CODE_KEYS,
             say: `6 cyfr jest bezpieczniejsze niż 4. W tym ćwiczeniu <strong>wpisz ${codeText}</strong>. <em>Nie wpisuj tutaj swojego prawdziwego PIN-u.</em>`,
             hint: `Wpisz ${codeText}, po jednej cyfrze.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Wybierz PIN', 'PIN musi mieć co najmniej 4 cyfry', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Dotknij Dalej.</strong>'},
            {screen: c => codeScreen(p, c, 'Wpisz PIN ponownie', ''), sequence: CODE_KEYS,
             say: `Telefon prosi o to jeszcze raz, żeby upewnić się, że nie ma pomyłki. <strong>Wpisz ponownie ${codeText}.</strong>`, hint: `Wpisz ponownie ${codeText}.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Wpisz PIN ponownie', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Dotknij Potwierdź.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Powiadomienia na ekranie blokady', [['show-all', 'Pokaż całą zawartość powiadomień'], ['hide-sensitive', 'Ukryj poufną zawartość'], ['dont-show', 'Nie pokazuj w ogóle powiadomień']], false),
             target: 'hide-sensitive',
             say: 'Telefon pyta, jakie wiadomości mają być widoczne na zablokowanym ekranie. <strong>Ukryj poufną zawartość</strong> to dobry wybór: zobaczysz, że przyszła wiadomość, ale nie to, co w niej jest. <strong>Dotknij tej opcji.</strong>',
             hints: {'show-all': 'To pokazuje wszystko, także kody z banku, każdemu, kto weźmie twój telefon do ręki. Dotknij „Ukryj poufną zawartość”.',
                     'dont-show': 'To też działa, ale nie zobaczysz, kiedy przychodzą wiadomości. W tym ćwiczeniu dotknij „Ukryj poufną zawartość”.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Brawo, twój telefon ćwiczeniowy ma teraz PIN!</strong> Blokada ekranu ma teraz wartość PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Dotknij Skonfiguruj Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Jak skonfigurować Face ID</strong>
                    <p>Najpierw ustaw twarz w kadrze aparatu. Potem poruszaj głową po okręgu, żeby pokazać wszystkie strony twarzy.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Rozpocznij</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Trzymaj telefon przed twarzą, mniej więcej na wyciągnięcie ręki, jak do selfie. <strong>Dotknij Rozpocznij.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Na prawdziwym iPhonie teraz <strong>powoli poruszasz głową po okręgu</strong>, jakbyś rysował nosem koło. Pierścień wypełnia się w trakcie skanowania. Gdy skończy, <strong>dotknij Kontynuuj</strong>.',
                 hint: 'Poczekaj, aż koło się wypełni, a potem dotknij Kontynuuj.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Skanuje drugi raz, dla pewności. Znów poruszaj głową po okręgu. Gdy skończy, <strong>dotknij Gotowe</strong>.',
                 hint: 'Poczekaj, aż koło się wypełni, a potem dotknij Gotowe.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Znajomy prosi, żeby dodać do twojego telefonu <em>swoją</em> twarz, „na wszelki wypadek”. Co robisz?',
                    options: [
                        {t: 'Pozwalam, to wygodne', why: 'Każdy, czyja twarz jest dodana, może otworzyć twój telefon i zatwierdzać płatności w aplikacjach. Dodawaj tylko własną twarz.'},
                        {t: 'Odmawiam. Tylko moja twarz powinna odblokowywać mój telefon', ok: true, why: 'Dokładnie. Jeśli ktoś zaufany musi się dostać do telefonu, podaj mu swój kod, a potem w razie potrzeby go zmień.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Brawo, Face ID jest skonfigurowany!</strong> Teraz możesz odblokować telefon, po prostu patrząc na niego, a potem przesuwając palcem w górę.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Dotknij Rozpoznawanie twarzy i odcisk palca.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Dotknij Rozpoznawanie twarzy.</strong>',
             hints: {'fingerprint-unlock': 'To odciski palców, czyli lekcja 3. Na razie dotknij Rozpoznawanie twarzy.'}},
            {screen: () => consent(p, 'Odblokowuj twarzą', 'Używaj twarzy, żeby odblokować telefon i potwierdzać w aplikacjach, że to ty. Twoja twarz jest przechowywana tylko w tym telefonie.', 'Zgadzam się'),
             target: 'agree', say: 'Telefon wyjaśnia, jak używa twojej twarzy. <strong>Dotknij Zgadzam się.</strong>',
             hints: {cancel: 'Anuluj przerwie konfigurację. Dotknij Zgadzam się, żeby kontynuować.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Trzymaj telefon na wysokości oczu, mniej więcej na wyciągnięcie ręki. Na prawdziwym telefonie <strong>trzymasz twarz w okręgu i powoli poruszasz głową</strong>. Gdy skończy, <strong>dotknij Gotowe</strong>.',
             hint: 'Poczekaj, aż koło się wypełni, a potem dotknij Gotowe.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'W wielu telefonach z Androidem rozpoznawanie twarzy jest mniej bezpieczne niż odcisk palca. Co to dla ciebie oznacza?',
                options: [
                    {t: 'Nadaje się do wszystkiego', why: 'W wielu telefonach rozpoznawanie twarzy korzysta ze zwykłego aparatu, który łatwiej oszukać. Niektóre aplikacje bankowe z tego powodu go nie akceptują.'},
                    {t: 'Używam go do odblokowywania, a do bankowości odcisku palca lub PIN-u, jeśli bank o to poprosi', ok: true, why: 'Zgadza się. Telefon powie ci, czy rozpoznawania twarzy można używać do płatności i bankowości. Jeśli nie, użyj odcisku palca lub PIN-u.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Brawo, rozpoznawanie twarzy jest skonfigurowane!</strong> Teraz możesz odblokować telefon, patrząc na niego.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Dotknij Dodaj odcisk palca…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID korzysta z <strong>przycisku Home</strong> z przodu starszych iPhone\'ów, takich jak iPhone SE. <strong>Dotknij 6 razy przycisku Home na dole telefonu ćwiczeniowego</strong>, jakbyś unosił i opierał palec.',
                 hint: 'Dotknij okrągłego przycisku Home na dole telefonu ćwiczeniowego.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Teraz potrzebuje krawędzi opuszki palca. <strong>Dotknij Kontynuuj.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Na prawdziwym iPhonie opierasz na przycisku <strong>boki i czubek</strong> palca. <strong>Dotknij przycisku Home jeszcze 4 razy.</strong>',
                 hint: 'Dotknij okrągłego przycisku Home na dole.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Gotowe. <strong>Dotknij Kontynuuj.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Który palec najlepiej dodać jako pierwszy?',
                    options: [
                        {t: 'Kciuk lub palec, którym najczęściej trzymasz telefon', ok: true, why: 'Tak. Przy przycisku Home to zwykle kciuk. Możesz dodać do 5 palców, więc warto dodać oba kciuki.'},
                        {t: 'Dowolny palec, to bez znaczenia', why: 'Działa z każdym palcem, ale wybierz ten, który naturalnie spoczywa na przycisku, gdy bierzesz telefon do ręki, zwykle kciuk.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Brawo, odcisk palca jest skonfigurowany!</strong> Oprzyj palec na przycisku Home, żeby odblokować telefon. Kolejne palce dodasz w ten sam sposób.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Dotknij Rozpoznawanie twarzy i odcisk palca.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Dotknij Odblokowanie odciskiem palca.</strong>',
             hints: {'face-unlock': 'To odblokowywanie twarzą, z lekcji 2. Na razie dotknij Odblokowanie odciskiem palca.'}},
            {screen: () => consent(p, 'Odblokowuj odciskiem palca', 'Używaj odcisku palca, żeby odblokować telefon lub potwierdzić, że to ty, na przykład przy logowaniu do aplikacji. Twój odcisk palca jest przechowywany tylko w tym telefonie.', 'Zgadzam się'),
             target: 'agree', say: '<strong>Dotknij Zgadzam się.</strong>', hints: {cancel: 'Anuluj przerwie konfigurację. Dotknij Zgadzam się, żeby kontynuować.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Czujnik może być na ekranie, z tyłu telefonu albo w przycisku zasilania, a telefon pokazuje, gdzie. Tutaj jest na ekranie. <strong>Dotknij czujnika 6 razy</strong>, jakbyś unosił i opierał palec.',
             hint: 'Dotknij okrągłego czujnika w dolnej części ekranu.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Twój odcisk palca został zapisany. <strong>Dotknij Gotowe.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Który palec najlepiej dodać jako pierwszy?',
                options: [
                    {t: 'Palec, który naturalnie dotyka czujnika, gdy bierzesz telefon do ręki', ok: true, why: 'Tak. Przy czujniku z tyłu jest to zwykle palec wskazujący, a przy czujniku na ekranie lub z boku kciuk. Możesz dodać więcej niż jeden.'},
                    {t: 'Dowolny palec, to bez znaczenia', why: 'Działa każdy palec, ale wybierz ten, który naturalnie trafia na czujnik. Odblokowywanie będzie szybkie i łatwe.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Brawo, odcisk palca jest skonfigurowany!</strong> Dotknij czujnika, żeby odblokować telefon. Kolejne palce dodasz w ten sam sposób.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Słoneczniki w ogrodzie', '#fde68a'], ['🐶', 'Pies na kanapie', '#fecaca'], ['🏖️', 'Dzień na plaży', '#bae6fd'],
                    ['🎂', 'Tort urodzinowy', '#fbcfe8'], ['🌅', 'Zachód słońca nad morzem', '#fed7aa'], ['🐈', 'Śpiący kot', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Przeczytano' : state === 'sent' ? 'Wysłano' : 'Doręczono'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Cześć mamo, to ja! Nowy numer, stary telefon się zepsuł…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Rodzina', last: 'Dave: Kto przynosi tort? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Do zobaczenia w czwartek!', time: 'Wczoraj', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Cześć mamo! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Nowy czat' : 'Wybierz kontakt'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Rodzina', '#f59e0b', 'Dave, Jean, Sarah, Ty'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Dodaj (plus)' : 'Załącz (spinacz)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Tego numeru nie ma w twoich kontaktach.</p><div><button type="button" data-tap="block">Zablokuj</button><button type="button" data-tap="add-contact">Dodaj</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Zdjęcia' : 'Galeria'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Zablokować +44 7700 900842?</strong></p><p class="fd">Zablokowane kontakty nie mogą do ciebie dzwonić ani wysyłać ci wiadomości.</p>
                <p class="fd">⟦square-check⟧ Zgłoś do WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Anuluj</button><button type="button" data-tap="confirm-block">Zablokuj</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Ostatnie' : 'Galeria'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Dzwonię…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Włącz dźwięk' : 'Wycisz'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Wyciszone na 1 tydzień' : 'Wyłączone'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Wycisz powiadomienia na…</strong></p>
                <button type="button" data-tap="mute-8h">8 godzin</button><button type="button" data-tap="mute-week">1 tydzień</button><button type="button" data-tap="mute-always">Zawsze</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Ustawienia', [['account', 'Konto', 'Powiadomienia o bezpieczeństwie, zmiana numeru'], ['privacy', 'Prywatność', 'Blokowanie kontaktów, znikające wiadomości'],
                ['chats', 'Czaty', 'Motyw, tapety'], ['notifications', 'Powiadomienia', 'Dźwięki wiadomości, grup i połączeń']]],
            account: ['Konto', [['twostep', 'Weryfikacja dwuetapowa', ctx.twoStep ? 'Włączona' : 'Wyłączone'], ['change-number', 'Zmień numer', ''], ['delete-account', 'Usuń konto', '']]],
            privacy: ['Prywatność', [['last-seen', 'Ostatnio online i dostępność', 'Wszyscy'], ['profile-photo', 'Zdjęcie profilowe', 'Wszyscy'],
                ['groups', 'Grupy', ctx.groupsSetting || 'Wszyscy'], ['blocked', 'Zablokowane kontakty', ctx.blocked ? '1' : 'Brak']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Kto może dodawać mnie do grup</strong></p>
                <button type="button" data-tap="groups-everyone">Wszyscy</button><button type="button" data-tap="groups-contacts">Moje kontakty</button>
                <button type="button" data-tap="groups-except">Moje kontakty z wyjątkiem…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Weryfikacja dwuetapowa</h3><p>Dla większego bezpieczeństwa włącz weryfikację dwuetapową, która będzie wymagać PIN-u przy ponownej rejestracji numeru telefonu w WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Włącz</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Dodaj adres e-mail</h3>
                <p>Dodaj adres e-mail, żeby móc zresetować PIN, jeśli go zapomnisz.</p>
                <div class="tk ex">twój adres e-mail</div>
                <button type="button" class="ce ox" data-tap="email-next">Dalej</button>
                <button type="button" class="cp wd" data-tap="skip">Pomiń</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Weryfikacja dwuetapowa jest włączona</h3><p>Zostaniesz poproszony o PIN, jeśli skonfigurujesz WhatsApp na nowym telefonie.</p>
                <button type="button" class="ce ox" data-tap="done">Gotowe</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Utwórz 6-cyfrowy PIN' : 'Potwierdź PIN'}</strong>
            <p>${stage === 'pin' ? 'Będzie ci potrzebny do skonfigurowania WhatsApp na nowym telefonie.' : 'Wpisz ten sam PIN ponownie.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'To lista twoich czatów. Aby rozpocząć nowy, <strong>dotknij przycisku nowego czatu</strong> (ołówek, w prawym górnym rogu).'
                          : 'To lista twoich czatów. Aby rozpocząć nowy, <strong>dotknij zielonego przycisku +</strong> w prawym dolnym rogu.',
         hints: {'chat-family': 'To otwiera istniejący czat. Rozpocznij zamiast tego nowy.', 'chat-jean': 'To otwiera istniejący czat. Rozpocznij zamiast tego nowy.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp pokazuje osoby z twoich kontaktów, które z niego korzystają. <strong>Dotknij Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Najpierw wpisz wiadomość w polu, a potem dotknij strzałki wysyłania.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Cześć mamo! 😊 Miło cię słyszeć!', n: 2}); },
         say: '<strong>Dotknij pola wiadomości</strong> na dole, <strong>wpisz krótką wiadomość</strong> (na przykład „Cześć!”), a potem <strong>dotknij strzałki wysyłania</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Mikrofon służy do wiadomości głosowych, które będą za chwilę. Najpierw wpisz wiadomość i dotknij strzałki wysyłania.', attach: 'To służy do zdjęć, które będą za chwilę. Najpierw wpisz wiadomość i dotknij wyślij.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah odpisała! Pod twoją wiadomością są <strong>dwa niebieskie haczyki ⟦check-check⟧</strong>. Co oznaczają?',
            options: [
                {t: 'Nie udało się wysłać wiadomości', why: 'Wiadomość, która się nie wysłała, ma mały zegar lub czerwone ostrzeżenie. Haczyki oznaczają, że się udało.'},
                {t: 'Sarah ją przeczytała', ok: true, why: 'Tak! Jeden szary haczyk oznacza wysłane, dwa szare doręczone na jej telefon, a dwa niebieskie, że ją przeczytała.'},
                {t: 'Została wysłana dwa razy', why: 'Nie, została wysłana tylko raz. Dwa niebieskie haczyki oznaczają, że została przeczytana.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Teraz wyślij zdjęcie. <strong>Dotknij ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> obok pola wiadomości.`,
         hints: {camera: 'Aparat robi nowe zdjęcie. Aby wysłać zdjęcie, które już zrobiłeś, dotknij ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Dotknij ${p === 'ios' ? 'Zdjęcia' : 'Galeria'}</strong>, żeby wybrać spośród zdjęć w telefonie.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'To (udawane) zdjęcia w twoim telefonie. <strong>Dotknij słoneczników</strong> 🌻.',
         hint: 'Dotknij zdjęcia ze słonecznikami.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Piękne! 🌻 Czy to z twojego ogrodu?', n: 4}); },
         say: 'Jeśli chcesz, możesz wpisać podpis. Potem <strong>dotknij strzałki wysyłania</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Wiadomości głosowe są przydatne, gdy pisanie sprawia kłopot. Na prawdziwym telefonie <strong>naciskasz i przytrzymujesz mikrofon</strong> ⟦mic⟧, kiedy mówisz, a potem puszczasz, żeby wysłać. Tutaj <strong>dotknij mikrofonu raz, żeby zacząć, a potem dotknij strzałki wysyłania</strong>, żeby wysłać.',
         hint: 'Dotknij mikrofonu, a potem strzałki wysyłania.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Brawo!</strong> Wysłałeś wiadomość, zdjęcie i wiadomość głosową. Aby w dowolnej chwili odpisać Sarah, otwórz WhatsApp i dotknij jej czatu.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Dotknij czatu Sarah</strong>, żeby go otworzyć.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'U góry czatu są dwa przyciski połączeń: <strong>kamera</strong> do rozmowy wideo i <strong>telefon</strong> do rozmowy głosowej. <strong>Dotknij kamery</strong> ⟦video⟧.',
         hints: {voice: 'To rozmowa głosowa, bez obrazu. W tym ćwiczeniu dotknij kamery.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Dzwoni na telefon Sarah, a gdy odbierze, możecie się widzieć. Jeśli tam, gdzie jesteś, jest głośno, <strong>dotknij mikrofonu</strong> ⟦mic⟧, żeby się wyciszyć.',
         hint: 'Przycisk mikrofonu jest w rzędzie na dole.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Jesteś wyciszony: Sarah cię widzi, ale nie słyszy. Aby coś jej pokazać, <strong>dotknij przycisku odwracania</strong> ⟦switch-camera⟧, żeby przełączyć się na aparat z tyłu telefonu.',
         hints: {mute: 'Później dotknij mikrofonu ponownie, żeby włączyć dźwięk. Na razie wypróbuj przycisk odwracania.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Teraz Sarah widzi to, na co kierujesz telefon. Gdy skończysz, <strong>dotknij czerwonego przycisku</strong>, żeby zakończyć rozmowę.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Rozmowy wideo zużywają dużo danych. Jak najlepiej je prowadzić?',
            options: [
                {t: 'Przez Wi-Fi w domu, kiedy się da', ok: true, why: 'Tak. Przez Wi-Fi rozmowy nie zużywają limitu danych mobilnych, więc są bezpłatne bez względu na to, jak długo rozmawiasz.'},
                {t: 'To bez znaczenia', why: 'Przez internet mobilny długa rozmowa wideo może szybko zużyć limit. Wi-Fi jest najlepsze, kiedy tylko się da.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Teraz grupy. W grupie Rodzina jest mnóstwo nowych wiadomości, a powiadomienia ciągle brzęczą. <strong>Dotknij grupy Rodzina.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Aby zmienić ustawienia grupy, <strong>dotknij nazwy grupy</strong> u góry.', hint: 'Dotknij słowa „Rodzina” u góry ekranu.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Dotknij Wycisz powiadomienia.</strong> Nadal będziesz dostawać wiadomości, ale telefon nie będzie brzęczał przy każdej.',
         hints: {'exit-group': 'Opuszczenie grupy całkiem by cię z niej usunęło. Wyciszenie jest łagodniejsze: zostajesz w grupie, ale bez brzęczenia.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Wybierz, na jak długo. <strong>Dotknij 1 tydzień.</strong>',
         hints: {'mute-8h': '8 godzin też się nadaje. W tym ćwiczeniu dotknij 1 tydzień.', 'mute-always': 'Zawsze też się nadaje, ale możesz coś przegapić. W tym ćwiczeniu dotknij 1 tydzień.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Brawo!</strong> Nawiązałeś rozmowę wideo, wyciszyłeś się, odwróciłeś aparat i wyciszyłeś ruchliwą grupę. Wiadomości z grupy możesz czytać, kiedy tylko chcesz.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Cześć!', ticks: 'read', n: 1}, {text: 'Cześć mamo! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Niedzielny obiad u nas? 🍗', n: 1}, {from: 'Sarah', text: 'Tak, poproszę!', n: 2}, {from: 'Dave', text: 'Kto przynosi tort? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Ustawienia WhatsAppa są w samej aplikacji. <strong>Dotknij Ustawień</strong> w prawym dolnym rogu.',
                hints: {'chat-unknown': 'Tą wiadomością zajmiemy się później. Najpierw dotknij Ustawień w prawym dolnym rogu.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Ustawienia WhatsAppa są w samej aplikacji. <strong>Dotknij trzech kropek ⋮</strong> w prawym górnym rogu.',
                hints: {'chat-unknown': 'Tą wiadomością zajmiemy się później. Najpierw dotknij trzech kropek w prawym górnym rogu.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Dotknij Ustawienia.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Dotknij Konto.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Weryfikacja dwuetapowa</strong> dodaje PIN, który jest potrzebny, jeśli ktoś spróbuje skonfigurować twój WhatsApp na innym telefonie. Nawet jeśli oszust zdobędzie twój 6-cyfrowy kod, nie dostanie się do konta. <strong>Dotknij Weryfikacja dwuetapowa.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Dotknij Włącz.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Wybierz 6-cyfrowy PIN, inny niż kod odblokowania telefonu. W tym ćwiczeniu <strong>wpisz ${pinText}</strong>. <em>Nie wpisuj tutaj prawdziwego PIN-u.</em>`,
             hint: `Wpisz ćwiczebny PIN ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Wpisz ponownie ${pinText}</strong>, żeby go potwierdzić.`, hint: `Wpisz ponownie ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Dodanie adresu e-mail pozwala zresetować PIN, jeśli go zapomnisz. Na prawdziwym telefonie warto to zrobić. Tutaj <strong>dotknij Dalej</strong>.',
             hints: {skip: 'Możesz to pominąć, ale wtedy zapomnienie PIN-u może cię zablokować. W tym ćwiczeniu dotknij Dalej.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Weryfikacja dwuetapowa jest włączona. <strong>Dotknij Gotowe.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Wiadomość podaje, że jest od <em>„WhatsApp Support”</em> i prosi o twój PIN weryfikacji dwuetapowej, żeby „zweryfikować konto”. Co robisz?',
                options: [
                    {t: 'Wysyłam, to od WhatsApp', why: 'WhatsApp nigdy nie napisze do ciebie z prośbą o PIN ani kod. To oszust, który próbuje przejąć twoje konto.'},
                    {t: 'Nie odpowiadam, blokuję i zgłaszam', ok: true, why: 'Dokładnie. Nikt, także WhatsApp, nigdy nie powinien prosić o twój PIN ani 6-cyfrowy kod.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Dalej: nie pozwól obcym dodawać cię do grup. To jest w <strong>Prywatność</strong>. <strong>Dotknij Grupy.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Moje kontakty'; },
             say: '„Wszyscy” oznacza, że każdy obcy może dodać cię do grupy, a właśnie tak działają oszuści. <strong>Dotknij Moje kontakty.</strong>',
             hints: {'groups-everyone': 'Opcja Wszyscy pozwala obcym dodawać cię do grup, także oszukańczych. Dotknij Moje kontakty.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Przyszła wiadomość z nieznanego numeru: „Cześć mamo, to ja! Nowy numer…”. To oszustwo „Cześć mamo”. <strong>Dotknij jej, żeby ją otworzyć.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Cześć mamo, to ja! Nowy numer, stary telefon się zepsuł. Możesz mi pomóc zapłacić rachunek? Oddam ci jutro x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Nie odpowiadaj. WhatsApp zauważa, że tego numeru nie ma w twoich kontaktach. <strong>Dotknij Zablokuj.</strong>',
             hints: {'add-contact': 'Nie dodawaj oszusta do kontaktów. Dotknij Zablokuj.', video: 'Nie oddzwaniaj. Dotknij Zablokuj.', voice: 'Nie oddzwaniaj. Dotknij Zablokuj.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Cześć mamo, to ja! Nowy numer, stary telefon się zepsuł. Możesz mi pomóc zapłacić rachunek? Oddam ci jutro x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'Zaznaczone jest „Zgłoś do WhatsApp”, co pomaga WhatsAppowi powstrzymać oszusta. <strong>Dotknij Zablokuj.</strong>',
             hints: {cancel: 'Anuluj sprawiłoby, że nadal mógłby do ciebie pisać. Dotknij Zablokuj.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Brawo!</strong> Włączyłeś weryfikację dwuetapową, nie pozwalasz obcym dodawać cię do grup oraz zablokowałeś i zgłosiłeś oszusta. Jeśli kiedykolwiek nie jesteś pewien wiadomości od rodziny, zadzwoń do nich na numer, który już masz.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Wstecz') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Wstecz')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Aplikacje obsługujące Dynamic Type dostosują się do twojego ulubionego rozmiaru czytania.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Rozmiar tekstu', [], {top: slider, back: 'Ekran'});
        return list(p, 'Rozmiar ekranu i tekst', [{caption: 'Rozmiar czcionki'}, {id: 'bold', label: 'Pogrubiony tekst', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Rozmiar tekstu znajdziesz w aplikacji <strong>Ustawienia</strong>. <strong>Dotknij Ustawienia.</strong>', hint: 'Ustawienia to szara ikona z kółkiem zębatym.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Dotknij Ekran i jasność.</strong>', hint: 'Jest w trzeciej grupie, poniżej Dostępność.'},
        {screen: c => list(p, 'Ekran i jasność', [{caption: 'WYGLĄD'}, {label: 'Jasny', value: '⟦check⟧'}, {caption: 'TEKST'}, {id: 'text-size', label: 'Rozmiar tekstu'}, {id: 'bold', label: 'Pogrubiony tekst', toggle: !!c.bold}], {back: 'Ustawienia'}),
         target: 'text-size', say: '<strong>Dotknij Rozmiar tekstu.</strong>', hints: {bold: 'Pogrubiony tekst jest następny. Najpierw dotknij Rozmiar tekstu.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Przeciągnij suwak w prawo, żeby pismo było większe. Tutaj <strong>dotknij dużego A dwa razy</strong> i patrz, jak tekst rośnie.', hint: 'Dotknij dużego A po prawej stronie suwaka.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'O wiele łatwiej czytać! Teraz <strong>dotknij ‹ Ekran</strong> u góry, żeby wrócić.'},
        {screen: c => list(p, 'Ekran i jasność', [{caption: 'WYGLĄD'}, {label: 'Jasny', value: '⟦check⟧'}, {caption: 'TEKST'}, {id: 'text-size', label: 'Rozmiar tekstu'}, {id: 'bold', label: 'Pogrubiony tekst', toggle: !!c.bold}], {back: 'Ustawienia'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Pogrubiony tekst</strong> sprawia, że litery są grubsze i wyraźniejsze. <strong>Dotknij go, żeby włączyć.</strong>'},
        {screen: c => list(p, 'Ekran i jasność', [{caption: 'TEKST'}, {label: 'Rozmiar tekstu'}, {label: 'Pogrubiony tekst', toggle: true}], {back: 'Ustawienia'}),
         question: {q: 'Tekst nadal za mały, nawet przy największym ustawieniu?', options: [
            {t: 'Nic więcej nie da się zrobić', why: 'Jest coś więcej! Ustawienia > Dostępność > Ekran i rozmiar tekstu > Większy tekst daje jeszcze większe rozmiary.'},
            {t: 'Ustawienia > Dostępność > Ekran i rozmiar tekstu > Większy tekst', ok: true, why: 'Tak. Włącz tam Większe rozmiary dostępności, a tekst będzie naprawdę duży.'}]}},
        {screen: c => list(p, 'Ekran i jasność', [{caption: 'TEKST'}, {label: 'Rozmiar tekstu'}, {label: 'Pogrubiony tekst', toggle: true}], {back: 'Ustawienia'}), done: true,
         say: '<strong>Brawo!</strong> Twój tekst jest większy i pogrubiony, w Ustawieniach i w większości aplikacji.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Rozmiar tekstu znajdziesz w aplikacji <strong>Ustawienia</strong>. <strong>Dotknij Ustawienia.</strong>', hint: 'Ustawienia to ikona z kółkiem zębatym.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Dotknij Wyświetlacz i dotyk.</strong> <em>W telefonie Samsung to Ekran, a potem Rozmiar i styl czcionki.</em>'},
        {screen: () => list(p, 'Wyświetlacz i dotyk', [{id: 'dark', label: 'Ciemny motyw', toggle: false}, {id: 'text-size', label: 'Rozmiar ekranu i tekst', sub: 'Rozmiar czcionki, pogrubiony tekst'}, {id: 'brightness', label: 'Poziom jasności', value: '70%'}]),
         target: 'text-size', say: '<strong>Dotknij Rozmiar ekranu i tekst.</strong>', hints: {dark: 'Ciemny motyw zmienia kolory, nie rozmiar. Dotknij Rozmiar ekranu i tekst.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Przeciągnij suwak Rozmiar czcionki w prawo, żeby pismo było większe. Tutaj <strong>dotknij dużego A dwa razy</strong>.', hint: 'Dotknij dużego A po prawej stronie suwaka.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Pogrubiony tekst</strong> sprawia, że litery są wyraźniejsze. <strong>Dotknij go, żeby włączyć.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Tekst nadal za mały, nawet przy największym ustawieniu?', options: [
            {t: 'Nic więcej nie da się zrobić', why: 'Wypróbuj też Rozmiar ekranu, na tej samej stronie: powiększa wszystko, także przyciski i ikony.'},
            {t: 'Powiększ też Rozmiar ekranu', ok: true, why: 'Tak. Rozmiar ekranu powiększa wszystko na ekranie, nie tylko tekst.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Brawo!</strong> Twój tekst jest większy i pogrubiony, w Ustawieniach i w większości aplikacji.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' na fioletowym' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Nie przeszkadzać' : 'Skupienie'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Nie przeszkadzać · Włączone' : 'Nie przeszkadzać · Wyłączone'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Przesuń w górę, aby zamknąć' : 'Zamknij'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Jeśli telefon nie dzwoni, może być włączony tryb Nie przeszkadzać. Szybkie ustawienia są w <strong>Centrum sterowania</strong>: <strong>przesuń palcem w dół od prawego górnego rogu</strong> (albo dotknij paska u góry).'
                          : 'Jeśli telefon nie dzwoni, może być włączony tryb Nie przeszkadzać. <strong>Przesuń palcem w dół od góry ekranu</strong>, żeby zobaczyć szybkie ustawienia (albo dotknij paska u góry).',
         hints: {'pull-up': 'Przesuń w drugą stronę: w dół od góry.', 'pull-left': 'Przesuń w dół, nie na bok.', 'pull-right': 'Przesuń w dół, nie na bok.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Księżyc ⟦moon⟧ oznacza, że <strong>Nie przeszkadzać jest włączone</strong>, więc połączenia i wiadomości są wyciszone. <strong>Dotknij go, żeby wyłączyć.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Teraz zwiększ głośność <strong>przyciskiem głośności z boku telefonu</strong> (górnym). <strong>Dotknij 3 razy ＋ na krawędzi telefonu ćwiczeniowego.</strong>',
         hint: 'Dotknij przycisku ＋ na prawej krawędzi telefonu.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'Twój iPhone nadal nie dzwoni. Co jeszcze może być przyczyną?', options: [
                {t: 'Przełącznik dzwonek/cisza lub przycisk czynności jest ustawiony na ciszę', ok: true, why: 'Tak. Wiele iPhone\'ów ma mały przełącznik nad przyciskami głośności: jeśli jest pomarańczowy, telefon jest wyciszony. Nowsze mają zamiast niego przycisk czynności.'},
                {t: 'Telefon jest zepsuty', why: 'Zwykle nie! Najpierw sprawdź przełącznik wyciszenia nad przyciskami głośności.'}]}
            : {q: 'Nacisnąłeś przycisk głośności, ale zmienił tylko głośność multimediów. Co teraz?', options: [
                {t: 'Dotknij ⋯ lub ikony ustawień na pasku głośności, żeby zobaczyć głośność dzwonka', ok: true, why: 'Tak. Przyciski głośności często zmieniają głośność multimediów; dotknij trzech kropek na pasku głośności, żeby zmienić głośność dzwonka.'},
                {t: 'Poddaję się', why: 'Dotknij trzech kropek ⋯ na pasku głośności, który się pojawi, i zwiększ głośność dzwonka.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Brawo!</strong> Nie przeszkadzać jest wyłączone, a głośność zwiększona, więc usłyszysz połączenia i wiadomości.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500 mg</strong><br>Przyjmować 1-2 tabletki co 4-6 godzin.<br>Nie przyjmować więcej niż 8 tabletek w ciągu 24 godzin.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Lupa', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'Twój iPhone ma aplikację <strong>Lupa</strong>. Jeśli nie ma jej na ekranie głównym, przesuń palcem w dół na środku ekranu i wpisz „Lupa”. <strong>Dotknij Lupa.</strong>'
                          : 'Wiele telefonów z Androidem ma aplikację <strong>Lupa</strong>. <em>W telefonie Samsung jest ona w szybkich ustawieniach lub w Ułatwieniach dostępu.</em> <strong>Dotknij Lupa.</strong>',
         hint: 'Szukaj czarnej ikony z lupą.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Skieruj telefon na coś małego, na przykład tę etykietę leku. <strong>Dotknij ＋ trzy razy</strong>, żeby przybliżyć (na prawdziwym telefonie możesz przeciągnąć suwak).', hint: 'Dotknij ＋ po prawej stronie suwaka.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Przy słabym świetle pomaga latarka. <strong>Dotknij latarki</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Trzęsą ci się trochę ręce? <strong>Dotknij dużego okrągłego przycisku</strong>, żeby zatrzymać obraz i móc czytać bez trzymania telefonu nieruchomo.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Do czego jeszcze przydaje się lupa?', options: [
            {t: 'Do czytania menu, metek z cenami i drobnego druku w listach', ok: true, why: 'Tak, i zawsze masz ją w kieszeni. Niektórzy trzymają ją w Centrum sterowania lub szybkich ustawieniach, żeby otwierać jednym dotknięciem.'},
            {t: 'Do zwiększania głośności rozmów', why: 'Do tego służą przyciski głośności. Lupa pomaga lepiej widzieć drobne rzeczy.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Brawo!</strong> Umiesz już przybliżać drobny druk, oświetlać go i zatrzymywać obraz.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Do zobaczenia w czwartek na kawie' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Przyjdziesz w czwartek? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Wiadomość tekstowa</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Słucham… mów teraz</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Możesz mówić zamiast pisać. <strong>Otwórz Wiadomości.</strong>', hint: 'Wiadomości to zielona chmurka rozmowy.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean pyta o czwartek. <strong>Dotknij pola wiadomości</strong> na dole.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Pojawia się klawiatura. <strong>Dotknij mikrofonu</strong> ⟦mic⟧ na klawiaturze, a potem powiedz wiadomość.', hint: 'Mikrofon jest na klawiaturze, obok spacji.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Na prawdziwym telefonie powiedziałbyś teraz: <em>„Do zobaczenia w czwartek na kawie”</em>. Słowa pojawiają się, gdy mówisz. Sprawdź je, a potem <strong>dotknij wyślij</strong> ⟦send-horizontal⟧.',
         hint: 'Poczekaj, aż pojawią się słowa, a potem dotknij strzałki wysyłania.'},
        {screen: () => home(p), target: 'settings',
         say: 'Telefon może też <strong>czytać ci rzeczy na głos</strong>. Włączmy to. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Dotknij Dostępność.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Dostępność', [{caption: 'WZROK'}, {id: 'voiceover', label: 'VoiceOver', value: 'Wyłączone'}, {id: 'zoom', label: 'Zoom', value: 'Wyłączone'}, {id: 'spoken', label: 'Czytanie zawartości'}], {back: 'Ustawienia'})
            : list(p, 'Dostępność', [{id: 'select-speak', label: 'Wybierz, aby usłyszeć', sub: 'Wyłączone'}, {id: 'talkback', label: 'TalkBack', sub: 'Wyłączone'}, {id: 'magnification', label: 'Powiększenie'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Dotknij Czytanie zawartości.</strong>' : '<strong>Dotknij Wybierz, aby usłyszeć.</strong>',
         hints: {voiceover: 'VoiceOver zmienia sposób działania całego telefonu, co może być mylące. Dotknij Czytanie zawartości.', talkback: 'TalkBack zmienia sposób działania całego telefonu, co może być mylące. Dotknij Wybierz, aby usłyszeć.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Czytanie zawartości', [{id: 'speak-selection', label: 'Czytaj zaznaczone', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Czytaj ekran', toggle: !!c.speakScreen, sub: 'Przesuń dwoma palcami w dół od góry ekranu, żeby usłyszeć jego odczytanie.'}], {back: 'Dostępność'})
            : list(p, 'Wybierz, aby usłyszeć', [{id: 'speak-screen', label: 'Użyj opcji Wybierz, aby usłyszeć', toggle: !!c.speakScreen, sub: 'Dotknij skrótu, a potem dotknij czegokolwiek na ekranie, żeby usłyszeć odczytanie.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Włącz Czytaj ekran.</strong> Potem w dowolnym miejscu telefonu przesunięcie dwoma palcami w dół od góry odczyta ekran na głos.' : '<strong>Włącz Użyj opcji Wybierz, aby usłyszeć.</strong> Pojawi się mały przycisk skrótu: dotknij go, a potem dotknij dowolnego tekstu, żeby go usłyszeć.',
         hints: {'speak-selection': 'To czyta tylko zaznaczone słowa. Łatwiej użyć Czytaj ekran: włącz to.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Czytanie zawartości', [{label: 'Czytaj zaznaczone', toggle: false}, {label: 'Czytaj ekran', toggle: true}], {back: 'Dostępność'})
            : list(p, 'Wybierz, aby usłyszeć', [{label: 'Użyj opcji Wybierz, aby usłyszeć', toggle: true}]), done: true,
         say: '<strong>Brawo!</strong> Możesz już mówić zamiast pisać i sprawić, żeby telefon czytał ci rzeczy na głos.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wiele aparatów słuchowych można połączyć z telefonem, żeby rozmowy i muzyka szły prosto do nich. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Dotknij Dostępność.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Dostępność', [{caption: 'SŁUCH'}, {id: 'hearing-devices', label: 'Urządzenia słuchowe'}, {id: 'live-captions', label: 'Napisy na żywo', value: c.captions ? 'Włączona' : 'Wyłączone'}, {id: 'subtitles', label: 'Napisy i podpisy'}], {back: 'Ustawienia'})
            : list(p, 'Dostępność', [{id: 'hearing-devices', label: 'Aparaty słuchowe', sub: c.paired ? 'Połączono' : 'Niepołączono'}, {id: 'live-captions', label: 'Napisy na żywo', sub: c.captions ? 'Włączona' : 'Wyłączone'}, {id: 'sound-amp', label: 'Wzmacniacz dźwięku'}]),
         target: 'hearing-devices', say: `<strong>Dotknij ${p === 'ios' ? 'Urządzenia słuchowe' : 'Aparaty słuchowe'}.</strong> Najpierw załóż aparaty słuchowe i zamknij klapki baterii, żeby je uruchomić ponownie, aby telefon mógł je znaleźć.`,
         hints: {'live-captions': 'Napisy są następne. Najpierw połącz aparaty słuchowe.'}},
        {screen: c => list(p, p === 'ios' ? 'Urządzenia słuchowe' : 'Aparaty słuchowe', [{caption: p === 'ios' ? 'URZĄDZENIA SŁUCHOWE MFI' : 'Dostępne urządzenia'}, {id: 'aids', label: 'Aparaty słuchowe Margaret', sub: 'Lewy i prawy'}],
            {overlay: c.pairing ? dialog(p, 'Sparować z „Aparaty słuchowe Margaret”?', 'Będą używane do połączeń i dźwięku.', [['cancel', 'Anuluj'], ['pair', 'Sparuj']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Telefon je znajduje. <strong>Dotknij swoich aparatów słuchowych.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Urządzenia słuchowe' : 'Aparaty słuchowe', [{id: 'aids', label: 'Aparaty słuchowe Margaret', sub: 'Lewy i prawy'}],
            {overlay: dialog(p, 'Sparować z „Aparaty słuchowe Margaret”?', 'Będą używane do połączeń i dźwięku.', [['cancel', 'Anuluj'], ['pair', 'Sparuj']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Dotknij Sparuj.</strong> (Przy dwóch aparatach słuchowych telefon może zapytać dwa razy, raz o każdy.)'},
        {screen: c => list(p, p === 'ios' ? 'Urządzenia słuchowe' : 'Aparaty słuchowe', [{label: 'Aparaty słuchowe Margaret', sub: 'Połączono ⟦check⟧'}]), target: 'back',
         say: 'Połączono! Rozmowy będą teraz odtwarzane przez twoje aparaty słuchowe. <strong>Dotknij Wstecz.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Dostępność', [{caption: 'SŁUCH'}, {id: 'hearing-devices', label: 'Urządzenia słuchowe'}, {id: 'live-captions', label: 'Napisy na żywo', value: c.captions ? 'Włączona' : 'Wyłączone'}], {back: 'Ustawienia'})
            : list(p, 'Dostępność', [{id: 'hearing-devices', label: 'Aparaty słuchowe', sub: 'Połączono'}, {id: 'live-captions', label: 'Napisy na żywo', sub: c.captions ? 'Włączona' : 'Wyłączone'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Napisy na żywo' : 'Napisy na żywo'}</strong> pokazuje na ekranie słowa z wszystkiego, co jest mówione: filmów, rozmów i wiadomości głosowych. <strong>Dotknij go, żeby włączyć.</strong>`},
        {screen: c => list(p, 'Dostępność', [{label: p === 'ios' ? 'Napisy na żywo' : 'Napisy na żywo', toggle: true}, {label: 'Aparaty słuchowe', sub: 'Połączono'}]), done: true,
         say: '<strong>Brawo!</strong> Twoje aparaty słuchowe są połączone, a wypowiadane słowa pojawiają się teraz jako napisy.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Mrówka', 'Borsuk', 'Kot', 'Pies', 'Orzeł', 'Lis', 'Koza', 'Jeż', 'Ibis', 'Kawka', 'Zimorodek', 'Jagnię', 'Kret',
                     'Traszka', 'Wydra', 'Maskonur', 'Rudzik', 'Foka', 'Ropucha', 'Nornik', 'Strzyżyk', 'Zebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Naciśnij i przytrzymaj kwiat</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Kopiuj</span><span>Udostępnij</span><span>Usuń</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebra</h3><p>Zebry mają czarno-białe paski. Nie ma dwóch zebr z dokładnie takim samym wzorem.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Dotknięcie</strong> oznacza lekkie dotknięcie ekranu jednym palcem i natychmiastowe puszczenie, jak naciśnięcie przycisku. <strong>Dotknij gwiazdki.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Naciśnięcie i przytrzymanie</strong> oznacza trzymanie palca na czymś przez sekundę lub dwie. Zwykle pojawiają się wtedy dodatkowe opcje. <strong>Naciśnij i przytrzymaj kwiat</strong>, aż coś się stanie. (Myszką przytrzymaj przycisk.)',
         hint: 'Przytrzymaj palec na kwiatku przez sekundę lub dwie.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Pojawiło się menu. Co zwykle robi naciśnięcie i przytrzymanie?', options: [
            {t: 'Pokazuje dodatkowe opcje, takie jak kopiuj, udostępnij lub usuń', ok: true, why: 'Tak. Naciśnięcie i przytrzymanie wiadomości, zdjęć i aplikacji pokazuje takie opcje.'},
            {t: 'Od razu usuwa rzeczy', why: 'Nie, pokazuje tylko menu opcji. Nic się nie dzieje, dopóki jednej nie wybierzesz.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Przesunięcie</strong> oznacza sunięcie palcem po ekranie, jak przewracanie kartki. <strong>Przesuń zdjęcie w lewo dwa razy</strong>, żeby zobaczyć następne. (Myszką kliknij, przeciągnij i puść.)',
         hint: 'Przesuń palec od prawej do lewej po zdjęciu. Albo użyj przycisku „Nie możesz przesunąć?”.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Przewijanie</strong> oznacza sunięcie palcem w górę ekranu, żeby zobaczyć więcej z listy, takiej jak ta. <strong>Przewiń w dół i dotknij Zebra</strong>, na samym dole. (Myszką użyj kółka przewijania.)',
         hint: 'Przesuń listę palcem w górę, żeby dotrzeć do Zebry na dole.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Aby cofnąć się o stronę na iPhonie, <strong>dotknij ‹ Wstecz</strong> w lewym górnym rogu (albo przesuń palcem od lewej krawędzi ekranu).' : 'Aby cofnąć się o stronę w Androidzie, <strong>dotknij strzałki wstecz ◁</strong> na dole (albo przesuń palcem od lewej lub prawej krawędzi ekranu).',
         hints: {'home-pill': 'To wraca aż do ekranu głównego. Dotknij zamiast tego strzałki wstecz ◁.', 'home-bar': 'To wraca aż do ekranu głównego. Dotknij zamiast tego ‹ Wstecz.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Aby przejść do ekranu głównego z dowolnego miejsca, <strong>przesuń palcem w górę od paska na dole</strong> ekranu (albo dotknij paska tutaj). Starsze iPhone\'y z okrągłym przyciskiem Home: naciśnij go.'
                          : 'Aby przejść do ekranu głównego z dowolnego miejsca, <strong>dotknij kółka ekranu głównego ○</strong> na dole (albo przesuń palcem w górę od dolnej krawędzi).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Wstecz cofa o jedną stronę. Dotknij kółka ekranu głównego ○, żeby wrócić do ekranu głównego.'}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Przećwiczyłeś dotykanie, naciskanie i przytrzymywanie, przesuwanie, przewijanie, cofanie się i wracanie do ekranu głównego: ruchy, których będziesz używać codziennie.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Połączono', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'SIECI' : 'Dostępne sieci'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Ustawienia',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Wpisz hasło do sieci „BT-Hub-7F2A”</strong></p>
                ${field('wifipass', 'Hasło', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Dołącz' : 'Połącz'}</button>
                <button type="button" class="cp" data-tap="cancel">Anuluj</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Korzystanie z Wi-Fi w domu oszczędza dane mobilne. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Dotknij Wi-Fi</strong>, blisko góry.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Dotknij Sieć i internet.</strong> <em>W telefonie Samsung to Połączenia, a potem Wi-Fi.</em>'},
               {screen: () => list(p, 'Sieć i internet', [{id: 'internet', label: 'Internet', sub: 'Wi-Fi i dane mobilne'}, {id: 'sims', label: 'Karty SIM'}, {id: 'hotspot', label: 'Hotspot i tethering'}]),
                target: 'internet', say: '<strong>Dotknij Internet.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Nazwa i hasło twojego Wi-Fi są zwykle na naklejce z tyłu routera (pudełka ze światełkami). Naklejka tego ćwiczebnego routera mówi:<br><span class="ahd">Sieć: <strong>BT-Hub-7F2A</strong><br>Hasło: <strong>Green-Apple-42</strong></span><strong>Dotknij BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'To Wi-Fi sąsiada. Znajdź nazwę z twojej naklejki: BT-Hub-7F2A.', 'net-sky-12345': 'To Wi-Fi kogoś innego. Znajdź nazwę z twojej naklejki: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Hasło musi dokładnie zgadzać się z naklejką, łącznie z wielkimi literami i myślnikami: Green-Apple-42',
         say: 'Wpisz hasło <strong>dokładnie</strong> tak, jak jest na naklejce: <strong>Green-Apple-42</strong>. Wielkie litery mają znaczenie! Potem <strong>dotknij Dołącz</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Jesteś połączony! Telefon będzie teraz sam łączył się z tym Wi-Fi, gdy będziesz w domu. Czy korzystanie z darmowego Wi-Fi w kawiarni jest bezpieczne?', options: [
            {t: 'Tak, do przeglądania, ale unikaj tam bankowości internetowej', ok: true, why: 'Dokładnie. Publiczne Wi-Fi jest w porządku do czytania wiadomości albo sprawdzenia rozkładu autobusu. Do bankowości używaj internetu mobilnego lub domowego Wi-Fi.'},
            {t: 'Tak, do wszystkiego', why: 'Publiczne Wi-Fi mogą podglądać inni. Nadaje się do przeglądania, ale do bankowości używaj internetu mobilnego lub domowego Wi-Fi.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Brawo!</strong> Jesteś połączony z Wi-Fi. Szukaj symbolu Wi-Fi w kształcie wachlarza u góry ekranu.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Nowy kontakt' : 'Utwórz kontakt', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Imię', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Numer komórkowy', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gotowe' : 'Zapisz'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Kontakt', [
        {label: 'Komórkowy', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Dodaj do ulubionych' : (ctx.fav ? '⟦star⟧ Ulubiony' : '⟦star⟧ Dodaj do ulubionych')},
        {id: 'share', label: 'Udostępnij kontakt'}], {back: 'Kontakty'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Kontakty', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Zapisanie numeru osoby pozwala dzwonić do niej po imieniu. Na iPhonie kontakty są w aplikacji <strong>Telefon</strong>. <strong>Dotknij Telefon.</strong>' : '<strong>Dotknij Kontakty.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Kontakty', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Kontakty', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'To twoja lista kontaktów. <strong>Dotknij +</strong> w prawym górnym rogu, żeby kogoś dodać.' : 'To twoja lista kontaktów. <strong>Dotknij przycisku +</strong>, żeby kogoś dodać.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Wpisz imię i ćwiczebny numer 07700 900456, a potem dotknij ' + (p === 'ios' ? 'Gotowe.' : 'Zapisz.'),
         say: `Wpisz <strong>imię</strong> osoby (spróbuj „Ann”) i jej numer. W ćwiczeniu użyj <strong>07700 900456</strong>. Potem <strong>dotknij ${p === 'ios' ? 'Gotowe' : 'Zapisz'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Zapisano! Ulubione to osoby, do których dzwonisz najczęściej, widoczne u góry, żeby dzwonić jednym dotknięciem. <strong>Dotknij ' + (p === 'ios' ? 'Dodaj do ulubionych' : 'gwiazdki') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Który kontakt warto zapisać z „ICE” (In Case of Emergency, czyli na wypadek nagłej sytuacji) przed imieniem?', options: [
            {t: 'Twoją najbliższą osobę, na przykład „ICE Sarah”', ok: true, why: 'Tak. Ratownicy medyczni wiedzą, że trzeba szukać ICE. Jeszcze lepiej dodać kontakt alarmowy do Karty medycznej, o czym jest w kursie Bezpieczny telefon.'},
            {t: 'Twój bank', why: 'ICE to osoba, z którą należy się skontaktować, gdyby coś ci się stało, zwykle najbliższa rodzina.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Brawo!</strong> Zapisałeś kontakt i dodałeś go do ulubionych.'},
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
    const recents = p => app(p, 'Ostatnie', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Twój telefon dzwoni: dzwoni Jean. <strong>Dotknij zielonego przycisku, żeby odebrać.</strong>' + (p === 'android' ? ' <em>W niektórych telefonach z Androidem zamiast tego przesuwa się zielony przycisk w górę.</em>' : ' <em>Jeśli iPhone jest zablokowany, zamiast tego przesuwasz zielony przycisk w bok.</em>'),
         hints: {decline: 'Czerwony odrzuca połączenie. Dotknij zielonego, żeby odebrać.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Rozmawiasz! Aby lepiej słyszeć albo rozmawiać bez trzymania telefonu, <strong>dotknij głośnika</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Gdy skończysz, <strong>dotknij czerwonego przycisku</strong>, żeby się rozłączyć.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Wcześniej nie odebrałeś połączenia od Dave. Nieodebrane połączenia są w ostatnich połączeniach na <strong>czerwono</strong>. <strong>Dotknij Dave</strong>, żeby do niego oddzwonić.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Dzwoni do Dave. Gdy skończysz rozmowę, <strong>dotknij czerwonego przycisku</strong>, żeby się rozłączyć.'},
        {screen: () => recents(p), question: {q: 'Ktoś dzwoni z nieznanego numeru i mówi, że jest z twojego banku. Co robisz?', options: [
            {t: 'Rozłączam się i dzwonię pod 159, żeby bezpiecznie połączyć się z bankiem', ok: true, why: 'Dokładnie. Zawsze możesz się rozłączyć i oddzwonić na numer, któremu ufasz. 159 łączy cię z twoim własnym bankiem.'},
            {t: 'Robię, co mówią, to przecież bank', why: 'Oszuści bez przerwy podszywają się pod banki, a numer można podrobić. Rozłącz się i zadzwoń pod 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Brawo!</strong> Umiesz odbierać, używać głośnika, rozłączać się i oddzwaniać na nieodebrane połączenia.'},
    ], {});

    function smsList(p) {
        return app(p, 'Wiadomości', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Twoja ostatnia kontrola była w marcu. Umów się online lub zadzwoń do nas.</span><small>3 miesiące temu</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Wiadomość tekstowa', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'SMS-y są w aplikacji <strong>Wiadomości</strong>. <strong>Dotknij Wiadomości.</strong>', hint: 'To ikona chmurki rozmowy.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Nowe wiadomości są pogrubione. <strong>Dotknij wiadomości od Dentysty</strong>, żeby ją przeczytać.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Najpierw wpisz Y w polu wiadomości, a potem dotknij strzałki wysyłania.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Dentysta prosi, żebyś odpisał <strong>Y</strong>, aby potwierdzić. <strong>Dotknij pola wiadomości, wpisz Y, a potem dotknij strzałki wysyłania</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Gotowe! Teraz posprzątaj: <strong>naciśnij i przytrzymaj starą wiadomość</strong> u góry (trzymaj na niej palec przez sekundę lub dwie).', hint: 'Trzymaj palec na starej wiadomości u góry, aż pojawi się menu.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Pojawia się menu. <strong>Dotknij Usuń.</strong>',
         hints: {copy: 'Kopiuj kopiuje tekst. Dotknij Usuń.', forward: 'Prześlij dalej wysyła ją komuś innemu. Dotknij Usuń.'}},
        {screen: c => smsChat(p, c), question: {q: 'SMS z nieznanego numeru informuje, że twoja paczka jest wstrzymana, i prosi o zapłacenie 1,45 £ przez link. Co robisz?', options: [
            {t: 'Nie dotykam linku. Przesyłam go na 7726, a potem usuwam', ok: true, why: 'Dokładnie. 7726 jest bezpłatny i zgłasza oszustwo twojej sieci. Kurierzy nie wysyłają SMS-ów z linkami z prośbą o opłaty.'},
            {t: 'Płacę, to tylko 1,45 £', why: '1,45 £ to przynęta, żeby wyłudzić dane twojej karty. Nie dotykaj linku: prześlij SMS-a na 7726 i usuń go.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Brawo!</strong> Umiesz czytać SMS-y i odpowiadać na nie oraz usuwać te, których nie potrzebujesz.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Mapy', 15], ['WhatsApp', 9], ['Aparat', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Bateria', [{id: 'low-power', label: 'Tryb niskiego zużycia energii', toggle: saver, sub: 'Ogranicza aktywność w tle, dopóki nie naładujesz telefonu do pełna.'}, {caption: 'ZUŻYCIE BATERII WEDŁUG APLIKACJI'}], {back: 'Ustawienia', top: head, bottom: apps})
            : list(p, 'Bateria', [{id: 'low-power', label: 'Oszczędzanie baterii', toggle: saver, sub: 'Wyłącza niektóre funkcje, żeby bateria działała dłużej.'}, {caption: 'Zużycie baterii'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Bateria się kończy? <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Dotknij Bateria.</strong>', hint: p === 'ios' ? 'Bateria jest w trzeciej grupie.' : 'Bateria jest na liście, po Powiadomieniach.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Masz 23%. <strong>${p === 'ios' ? 'Tryb niskiego zużycia energii' : 'Oszczędzanie baterii'}</strong> sprawia, że bateria wytrzyma dłużej. <strong>Dotknij, żeby włączyć.</strong> Symbol baterii zmieni się na ${p === 'ios' ? 'yellow' : 'orange'}, żeby ci o tym przypominać.`},
        {screen: c => batteryPage(p, c), question: {q: 'Lista pokazuje, że dziś Facebook zużył najwięcej baterii. Co najbardziej pomaga baterii wytrzymać dłużej?', options: [
            {t: 'Zmniejszyć jasność ekranu i zamykać aplikacje, z których skończyłem korzystać', ok: true, why: 'Tak. Ekran zużywa najwięcej energii. Zmniejsz jasność, a aplikacje takie jak Facebook i YouTube zużywają dużo.'},
            {t: 'Ładować do 100% co godzinę', why: 'Częste ładowanie nie szkodzi, ale nie sprawia, że bateria wytrzyma dłużej. Zmniejsz jasność i używaj trybu oszczędzania baterii.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Brawo!</strong> Oszczędzanie baterii jest włączone i wiesz, które aplikacje zużywają najwięcej energii.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'komórkowy · 3 połączenia' : 'Podejrzenie spamu · 3 połączenia'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Ostatnie', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>komórkowy</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>komórkowy</small><span>Wczoraj</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Ten sam nieznany numer ciągle do ciebie dzwoni. Zablokujmy go. <strong>Otwórz aplikację Telefon.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `W ostatnich połączeniach <strong>dotknij ⓘ</strong> obok numeru 07700 900842${p === 'android' ? ' (w niektórych telefonach z Androidem dotknij samego numeru)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Udostępnij kontakt'}, {id: 'block', label: p === 'ios' ? 'Zablokuj tego rozmówcę' : 'Zablokuj / zgłoś spam', danger: true}], {back: 'Ostatnie'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Zablokuj tego rozmówcę' : 'Zablokuj / zgłoś spam'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Zablokować tego rozmówcę?', 'Nie będziesz otrzymywać połączeń, wiadomości ani FaceTime od osób z listy zablokowanych.', [['cancel', 'Anuluj'], ['confirm', 'Zablokuj kontakt']])
            : dialog(p, 'Zablokować 07700 900842?', '⟦square-check⟧ Zgłoś połączenie jako spam', [['cancel', 'Anuluj'], ['confirm', 'Zablokuj']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Zablokuj kontakt' : 'Zablokuj'}.</strong>${p === 'android' ? ' Pozostawienie zaznaczonego „Zgłoś połączenie jako spam” pomaga ostrzegać innych.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Zablokowano! Możesz też <strong>wyciszyć wszystkie połączenia z numerów, których nie znasz</strong>. <strong>Dotknij Ustawienia.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Przewiń na sam dół i <strong>dotknij Aplikacje</strong>.'},
            {screen: () => list(p, 'Aplikacje', [{id: 'app-phone', label: 'Telefon'}, {id: 'app-messages', label: 'Wiadomości'}, {id: 'app-mail', label: 'Poczta'}], {back: 'Ustawienia'}), target: 'app-phone', say: '<strong>Dotknij Telefon.</strong>'},
            {screen: c => list(p, 'Telefon', [{id: 'silence', label: 'Wyciszaj nieznanych dzwoniących', toggle: !!c.silence}, {id: 'blocked', label: 'Zablokowane kontakty', value: '1'}], {back: 'Aplikacje'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Włącz Wyciszaj nieznanych dzwoniących.</strong> Połączenia z numerów, których nie ma w kontaktach, trafiają prosto na pocztę głosową, a nadal widać je w ostatnich połączeniach.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Zablokowano! Możesz też <strong>filtrować połączenia spamowe</strong>. <strong>Dotknij trzech kropek ⋮</strong> w prawym górnym rogu.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Dotknij Ustawienia.</strong>'},
            {screen: () => list(p, 'Ustawienia', [{id: 'caller-id', label: 'Identyfikator rozmówcy i spam'}, {id: 'blocked', label: 'Zablokowane numery'}, {id: 'sounds', label: 'Dźwięki i wibracje'}]), target: 'caller-id', say: '<strong>Dotknij Identyfikator rozmówcy i spam.</strong>'},
            {screen: c => list(p, 'Identyfikator rozmówcy i spam', [{id: 'caller-show', label: 'Pokazuj identyfikator rozmówcy i spamu', toggle: true}, {id: 'silence', label: 'Filtruj połączenia spamowe', toggle: !!c.silence, sub: 'Podejrzane połączenia spamowe nie będą dzwonić'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Włącz Filtruj połączenia spamowe.</strong> Podejrzane oszukańcze połączenia nie będą dzwonić.'},
        ]),
        {screen: c => list(p, 'Gotowe', [{label: 'Zablokowane numery', value: '1'}, {label: p === 'ios' ? 'Wyciszaj nieznanych dzwoniących' : 'Filtruj połączenia spamowe', toggle: true}]),
         question: {q: 'Czy wyciszanie nieznanych dzwoniących może sprawić, że przegapisz prawdziwe połączenie, na przykład ze szpitala albo od kuriera?', options: [
            {t: 'Tak, więc od czasu do czasu sprawdzaj pocztę głosową i nieodebrane połączenia', ok: true, why: 'Dokładnie. Prawdziwi dzwoniący zwykle zostawiają wiadomość, a nieodebrane połączenia nadal widać na liście.'},
            {t: 'Nie, zawsze się dodzwonią', why: 'Nieznane numery trafiają na pocztę głosową, także prawdziwe. Od czasu do czasu sprawdzaj pocztę głosową i nieodebrane połączenia.'}]}},
        {screen: () => list(p, 'Gotowe', [{label: 'Zablokowane numery', value: '1'}, {label: p === 'ios' ? 'Wyciszaj nieznanych dzwoniących' : 'Filtruj połączenia spamowe', toggle: true}]), done: true,
         say: '<strong>Brawo!</strong> Zablokowałeś uciążliwy numer i ograniczyłeś oszukańcze połączenia.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: twoja paczka jest wstrzymana z powodu niezapłaconej opłaty 1,45 £. Zapłać teraz, aby umówić ponowne doręczenie: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Do: ${field('fwdto', 'Numer', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Dziękujemy. Prześlij numer telefonu, z którego przyszedł oszukańczy SMS.</span><small>teraz</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Dziękujemy, twoje zgłoszenie zostało przyjęte.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Nowa wiadomość') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Wiadomość tekstowa', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Więcej… potem Prześlij dalej' : 'Prześlij dalej'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Dostałeś oszukańczy SMS podszywający się pod Royal Mail. Zanim go usuniesz, zgłoś go, bezpłatnie. <strong>Otwórz Wiadomości.</strong>'},
        {screen: () => app(p, 'Wiadomości', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Dotknij wiadomości</strong>, żeby ją otworzyć. Nie dotykaj linku w środku!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Naciśnij i przytrzymaj wiadomość</strong> (trzymaj na niej palec), aż pojawi się menu. Nie dotykaj linku.', hint: 'Trzymaj palec na szarej chmurce wiadomości przez sekundę lub dwie.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Dotknij Więcej…</strong>, a potem strzałki przesyłania dalej (tutaj jeden przycisk robi jedno i drugie).' : '<strong>Dotknij Prześlij dalej.</strong> (W niektórych telefonach jest pod trzema kropkami ⋮ u góry.)',
         hints: {delete: 'Najpierw zgłoś, potem możesz usunąć.', copy: 'Dotknij Prześlij dalej, żeby wysłać ją na 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'W polu „Do” wpisz 7726 (na klawiaturze telefonu układa się to w SPAM), a potem dotknij wyślij.',
         action: c => { c.sent7726 = true; }, say: 'W polu <strong>Do</strong> wpisz <strong>7726</strong>. (Na klawiaturze układa się to w S-P-A-M.) Potem <strong>dotknij wyślij</strong> ⟦send-horizontal⟧. To bezpłatne.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Wpisz numer oszusta, 07700 900911, a potem dotknij wyślij.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 odpowiada, pytając, z jakiego numeru przyszło oszustwo. <strong>Wpisz 07700 900911</strong> i <strong>dotknij wyślij</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Zgłosiłeś to. Co teraz zrobić z oszukańczym SMS-em?', options: [
            {t: 'Usunąć go i zablokować numer', ok: true, why: 'Tak. Jest zgłoszony, więc możesz go usunąć. Zablokowanie powstrzyma kolejne SMS-y z tego numeru.'},
            {t: 'Dotknąć linku, żeby sprawdzić, czy jest prawdziwy', why: 'Nigdy nie dotykaj linków w oszukańczych SMS-ach. Usuń go i zablokuj numer.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Brawo!</strong> Zgłosiłeś oszukańczy SMS na 7726, co pomaga sieciom blokować go dla wszystkich. Oszukańcze e-maile wysyła się na report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Aktualizacje naprawiają problemy z bezpieczeństwem, więc są ważne. Najpierw podłącz telefon do ładowarki i połącz się z Wi-Fi. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Dotknij Ogólne.</strong>'},
        {screen: () => list(p, 'Ogólne', [{id: 'about', label: 'Informacje'}, {id: 'software', label: 'Aktualizacja oprogramowania', value: '1'}, {id: 'storage', label: 'Pamięć iPhone\'a'}], {back: 'Ustawienia'}), target: 'software', say: '<strong>Dotknij Aktualizacja oprogramowania.</strong> Czerwona 1 oznacza, że czeka aktualizacja.'},
        {screen: () => list(p, 'Aktualizacja oprogramowania', [{id: 'auto', label: 'Aktualizacje automatyczne', value: 'Wyłączone'}], {back: 'Ogólne',
            bottom: '<div class="hu"><strong>Aktualizacja iOS</strong><p>Ta aktualizacja zawiera ważne poprawki zabezpieczeń i jest zalecana dla wszystkich użytkowników.</p><button type="button" class="ce co" data-tap="update-now">Zaktualizuj teraz</button></div>'}),
         target: 'update-now', say: '<strong>Dotknij Zaktualizuj teraz.</strong>', hints: {auto: 'Warto też później włączyć aktualizacje automatyczne. Najpierw dotknij Zaktualizuj teraz.'}},
        {screen: c => codeScreen(p, c, 'Wpisz kod', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'Twój iPhone prosi o kod. <strong>Wpisz kod ćwiczebny 4 7 1 9 3 6.</strong>', hint: 'Wpisz 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Aktualizacja oprogramowania', [], {back: 'Ogólne', bottom: `<div class="hu"><strong>${c.busy ? 'Pobieranie…' : 'Gotowe do instalacji'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Najpierw się pobiera, co może potrwać kilka minut. Potem <strong>dotknij Zainstaluj teraz</strong>. Telefon się uruchomi ponownie, więc zrób to, gdy nie będzie ci potrzebny przez 15 do 30 minut.'},
        {screen: () => list(p, 'Aktualizacja oprogramowania', [{id: 'auto', label: 'Aktualizacje automatyczne', value: 'Włączona'}], {back: 'Ogólne', bottom: '<div class="hu"><strong>Twój iPhone jest aktualny</strong></div>'}),
         question: {q: 'Czy warto włączyć aktualizacje automatyczne?', options: [
            {t: 'Tak, wtedy aktualizuje się w nocy podczas ładowania', ok: true, why: 'Dokładnie. Ustawienia > Ogólne > Aktualizacja oprogramowania > Aktualizacje automatyczne. Instaluje się w nocy, gdy telefon jest podłączony do ładowarki i do Wi-Fi.'},
            {t: 'Nie, aktualizacje są opcjonalne', why: 'Aktualizacje naprawiają luki w zabezpieczeniach, które wykorzystują oszuści. Aktualizacje automatyczne chronią cię bez konieczności pamiętania.'}]}},
        {screen: () => list(p, 'Aktualizacja oprogramowania', [], {bottom: '<div class="hu"><strong>Twój iPhone jest aktualny ⟦check⟧</strong></div>'}), done: true, say: '<strong>Brawo!</strong> Twój telefon jest zaktualizowany i chroniony przed najnowszymi problemami.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Aktualizacje naprawiają problemy z bezpieczeństwem, więc są ważne. Najpierw podłącz telefon do ładowarki i połącz się z Wi-Fi. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Przewiń w dół i <strong>dotknij System</strong>. <em>W telefonie Samsung to Aktualizacja oprogramowania, blisko dołu.</em>'},
        {screen: () => list(p, 'System', [{id: 'languages', label: 'Języki'}, {id: 'date', label: 'Data i godzina'}, {id: 'software', label: 'Aktualizacje oprogramowania', sub: 'Dostępna aktualizacja'}]), target: 'software', say: '<strong>Dotknij Aktualizacje oprogramowania.</strong>'},
        {screen: () => list(p, 'Aktualizacje oprogramowania', [{id: 'system-update', label: 'Aktualizacja systemu', sub: 'Dostępna aktualizacja'}, {id: 'play-update', label: 'Aktualizacja systemowa Google Play'}]), target: 'system-update', say: '<strong>Dotknij Aktualizacja systemu.</strong>'},
        {screen: () => list(p, 'Aktualizacja systemu', [], {bottom: '<div class="hu"><strong>Dostępna aktualizacja systemu</strong><p>Zawiera ważne poprawki zabezpieczeń.</p><button type="button" class="ce dk" data-tap="download">Pobierz i zainstaluj</button></div>'}),
         target: 'download', say: '<strong>Dotknij Pobierz i zainstaluj.</strong>'},
        {screen: c => list(p, 'Aktualizacja systemu', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Pobieranie i instalowanie…' : 'Uruchom ponownie, aby zakończyć'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Pobiera się i przygotowuje, co może chwilę potrwać. Potem <strong>dotknij Uruchom ponownie teraz</strong>. Telefon wyłączy się i włączy ponownie, co zajmie kilka minut.'},
        {screen: () => list(p, 'Aktualizacja systemu', [], {bottom: '<div class="hu"><strong>Twój system jest aktualny</strong></div>'}),
         question: {q: 'Twój telefon nie dostawał aktualizacji od lat. Co to może oznaczać?', options: [
            {t: 'Może być za stary, by dostawać aktualizacje zabezpieczeń, więc jest mniej bezpieczny', ok: true, why: 'Tak. Starsze telefony przestają dostawać aktualizacje. Unikaj na nich bankowości i rozważ wymianę, gdy tylko będzie to możliwe.'},
            {t: 'Działa doskonale', why: 'Telefony po kilku latach przestają dostawać aktualizacje, co zostawia luki w zabezpieczeniach niezałatane.'}]}},
        {screen: () => list(p, 'Aktualizacja systemu', [], {bottom: '<div class="hu"><strong>Twój system jest aktualny ⟦check⟧</strong></div>'}), done: true, say: '<strong>Brawo!</strong> Twój telefon jest zaktualizowany i chroniony przed najnowszymi problemami.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (córka)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Karta medyczna' : 'Informacje medyczne', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'np. cukrzyca typu 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'np. penicylina', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Pokazuj, gdy zablokowany</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gotowe' : 'Zapisz'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Wybierz kontakt</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Zdrowie', '#fff', ICON2.health]]), target: 'health', say: '<strong>Karta medyczna</strong> pozwala ratownikom zobaczyć twoje alergie i kontakt alarmowy, nawet gdy telefon jest zablokowany. <strong>Otwórz aplikację Zdrowie.</strong>'},
            {screen: () => app(p, 'Podsumowanie', '<p class="cf">Tutaj widać twoje dane zdrowotne.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Dotknij swojego zdjęcia</strong> w prawym górnym rogu.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Szczegóły zdrowia'}, {id: 'medical', label: 'Karta medyczna'}], {back: 'Podsumowanie'}), target: 'medical', say: '<strong>Dotknij Karta medyczna.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Telefon może przechowywać <strong>informacje medyczne</strong>, które ratownicy widzą nawet wtedy, gdy jest zablokowany. <strong>Dotknij Ustawienia.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Przewiń w dół i <strong>dotknij Bezpieczeństwo i alarmy</strong>. <em>W telefonie Samsung to Bezpieczeństwo i alarmy.</em>'},
            {screen: () => list(p, 'Bezpieczeństwo i alarmy', [{id: 'medical', label: 'Informacje medyczne'}, {id: 'contacts-ec', label: 'Kontakty alarmowe'}, {id: 'sos', label: 'Alarm SOS'}]), target: 'medical', say: '<strong>Dotknij Informacje medyczne.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Najpierw wpisz alergię (w ćwiczeniu „Penicylina”), a potem dodaj kontakt alarmowy.',
         say: 'Wpisz wszystko, co powinni wiedzieć ratownicy. W ćwiczeniu wpisz <strong>Penicylina</strong> w polu alergii. Potem <strong>dotknij dodaj kontakt alarmowy</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Wybierz, do kogo dzwonić w nagłym wypadku. <strong>Dotknij Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '„Pokazuj, gdy zablokowany” jest włączone, więc ratownicy to zobaczą. <strong>Dotknij Gotowe.</strong>' : '<strong>Dotknij Zapisz.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Karta medyczna' : 'Informacje medyczne', [{label: 'Alergie', sub: typed(c, 'allergies')}, {label: 'Kontakt alarmowy', sub: 'Sarah (córka)'}]),
         question: {q: p === 'ios' ? 'Jak ratownik zobaczy twoją Kartę medyczną, jeśli telefon jest zablokowany?' : 'Jak ratownik to zobaczy, jeśli telefon jest zablokowany?', options: [
            {t: 'Przez przycisk „Połączenie alarmowe” na ekranie blokady', ok: true, why: 'Tak. Dotknięcie przycisku alarmowego na ekranie blokady pokazuje twoje informacje medyczne bez odblokowywania telefonu.'},
            {t: 'Nie może', why: 'Może: przycisk alarmowy na ekranie blokady to pokazuje, bez potrzeby podawania kodu.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Karta medyczna' : 'Informacje medyczne', [{label: 'Alergie', sub: typed(c, 'allergies')}, {label: 'Kontakt alarmowy', sub: 'Sarah (córka)'}]), done: true,
         say: '<strong>Brawo!</strong> Twoje informacje medyczne i kontakt alarmowy są zapisane. Jeśli wezwiesz pomoc przez Alarm SOS, kontakt alarmowy też zostanie powiadomiony.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Lokalizator' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Odtwarzanie dźwięku…' : '⟦volume-2⟧ Odtwórz dźwięk'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Oznacz jako zgubiony' : 'Zabezpiecz urządzenie'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Jeśli kiedykolwiek zgubisz telefon, możesz go znaleźć, sprawić, żeby zadzwonił, lub go zablokować, ale tylko jeśli najpierw to włączysz. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Dotknij swojego imienia</strong> u góry.'},
            {screen: () => list(p, 'Konto Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Lokalizator'}, {id: 'family', label: 'Udostępnianie rodzinne'}], {back: 'Ustawienia'}), target: 'findmy', say: '<strong>Dotknij Lokalizator.</strong>'},
            {screen: c => list(p, 'Lokalizator', [{id: 'find-toggle', label: 'Znajdź mój iPhone', toggle: !!c.findOn}, {label: 'Wyślij ostatnią lokalizację', toggle: !!c.findOn}], {back: 'Konto Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Włącz Znajdź mój iPhone.</strong> „Wyślij ostatnią lokalizację” wysyła lokalizację tuż przed wyczerpaniem baterii.'},
            {screen: () => homeWith(p, [['findmy', 'Lokalizator', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Teraz wyobraź sobie, że nie możesz znaleźć telefonu. Na innym urządzeniu Apple otworzyłbyś <strong>Lokalizator</strong> (albo na komputerze wszedłbyś na icloud.com/find). Tutaj <strong>dotknij Lokalizator</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Przewiń w dół i <strong>dotknij Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Wszystkie usługi'}, {id: 'account', label: 'Zarządzaj kontem Google'}]), target: 'all-services', say: '<strong>Dotknij Wszystkie usługi.</strong>'},
            {screen: () => list(p, 'Wszystkie usługi', [{id: 'find-hub', label: 'Find Hub', sub: 'Wcześniej nazywało się Znajdź moje urządzenie'}, {id: 'theft', label: 'Ochrona przed kradzieżą'}]), target: 'find-hub', say: '<strong>Dotknij Find Hub</strong> (wcześniej nazywało się Znajdź moje urządzenie). <em>Samsung ma też własne: Ustawienia &gt; Zabezpieczenia i prywatność &gt; Ochrona zgubionego urządzenia.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Używaj Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Włącz Używaj Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Teraz wyobraź sobie, że nie możesz znaleźć telefonu. Na innym telefonie lub tablecie otworzyłbyś <strong>Find Hub</strong> albo na komputerze wszedłbyś na google.com/android/find. Tutaj <strong>dotknij Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Jest, na mapie. Jeśli jest gdzieś blisko, na przykład wsunięty w bok kanapy, <strong>dotknij Odtwórz dźwięk</strong>: zadzwoni głośno, nawet gdy jest wyciszony.'},
        {screen: c => findMap(p, c), question: {q: 'Mapa pokazuje twój telefon w miejscu, w którym nigdy nie byłeś. Co powinieneś zrobić?', options: [
            {t: 'Użyć Oznacz jako zgubiony lub Zabezpiecz urządzenie, żeby go zablokować, i skontaktować się z policją', ok: true, why: 'Tak. Zablokuj go przez Lokalizator lub Find Hub, nie jedź tam sam, a o zgubie powiadom policję i swoją sieć.'},
            {t: 'Pójść i odzyskać go samemu', why: 'Nigdy nie konfrontuj się ze złodziejem. Zablokuj telefon zdalnie i skontaktuj się z policją.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Brawo!</strong> Wyszukiwanie telefonu jest włączone i wiesz, jak sprawić, żeby zadzwonił, albo jak go zablokować.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Bezpłatne porady technologiczne</strong>${UI.qr}<small>Zeskanuj mnie</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Usunąć to zdjęcie?', p === 'ios' ? 'Będzie przechowywane w Ostatnio usuniętych przez 30 dni.' : 'Zostanie na jakiś czas przeniesione do kosza, zanim zniknie na dobre.', [['cancel', 'Anuluj'], ['confirm-delete', 'Usuń']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Otwórz Aparat.</strong> <em>Wskazówka: w większości telefonów możesz też przesunąć palcem w lewo na ekranie blokady.</em>', hint: 'Aparat to szara ikona z aparatem.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Skieruj go na kwiaty i trzymaj nieruchomo. <strong>Dotknij dużego okrągłego przycisku</strong>, żeby zrobić zdjęcie.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Pstryk! Zapisane. <strong>Dotknij małego obrazka</strong> w rogu, żeby je zobaczyć.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Aby przyjrzeć się z bliska, połóż dwa palce na zdjęciu i rozsuń je. Tutaj <strong>dotknij ＋ dwa razy</strong>.', hint: 'Dotknij ＋ w prawym górnym rogu.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Pięknie! Aby wysłać je komuś, <strong>dotknij przycisku udostępniania</strong> ⇪ (pudełko ze strzałką).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Wybierz, jak je wysłać: Wiadomościami, e-mailem, WhatsAppem i tak dalej. <strong>Dotknij Wiadomości.</strong> (Potem wybrałbyś, do kogo je wysłać.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Wysłane! Jeśli zrobisz zdjęcie, którego nie chcesz, <strong>dotknij kosza</strong> ⟦trash-2⟧, żeby je usunąć.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Telefon najpierw pyta. <strong>Dotknij Usuń.</strong>'},
        {screen: () => app(p, 'Zdjęcia', '<p class="cf">Na razie brak zdjęć.</p>', {back: false, color: '#fff'}), question: {q: 'Usunąłeś zdjęcie przez pomyłkę! Co możesz zrobić?', options: [
            {t: p === 'ios' ? 'Zajrzeć do Albumy > Ostatnio usunięte i je odzyskać' : 'Zajrzeć do Kosza (Biblioteka > Kosz) i je przywrócić', ok: true, why: 'Tak. Usunięte zdjęcia są przechowywane przez jakiś czas, zwykle około miesiąca, więc możesz je odzyskać.'},
            {t: 'Nic, przepadło na zawsze', why: 'Spokojnie! Przez jakiś czas jest przechowywane w Ostatnio usuniętych (iPhone) lub w Koszu (Android).'}]}},
        {screen: () => app(p, 'Zdjęcia', '<p class="cf">Gotowe.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Brawo!</strong> Umiesz robić zdjęcia, powiększać je, udostępniać i usuwać.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Jeśli twoja rodzina też ma iPhone\'y, <strong>FaceTime</strong> pozwala na bezpłatne rozmowy wideo. <strong>Dotknij FaceTime.</strong>' : '<strong>Google Meet</strong> umożliwia bezpłatne rozmowy wideo z Androida, także z iPhone\'ami. <strong>Dotknij Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Nowy FaceTime' : 'Nowe'}</button><p class="cf">Tutaj pojawią się ostatnie rozmowy.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Nowy FaceTime' : 'Nowe'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Nowy FaceTime' : 'Zadzwoń', `<div class="xz">To: ${field('callto', 'Imię lub numer', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Rozmowa wideo'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Najpierw wpisz Sarah w polu „Do”.',
             say: 'Wpisz imię kogoś z twoich kontaktów. <strong>Wpisz Sarah</strong>, a potem <strong>dotknij przycisku wideo</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Dzwoni, a potem Sarah odbiera. Aby pokazać jej ogród, <strong>dotknij przycisku odwracania</strong> ⟦switch-camera⟧, żeby użyć aparatu z tyłu.', hint: 'Poczekaj, aż Sarah odbierze, a potem dotknij ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Gdy skończysz, <strong>dotknij czerwonego przycisku</strong>, żeby się rozłączyć.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Wideo · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'Twoja znajoma ma telefon z Androidem, a ty iPhone\'a. Czy nadal możecie rozmawiać wideo?', options: [
                {t: 'Tak, przez WhatsApp lub Google Meet, które działają na obu', ok: true, why: 'Dokładnie. FaceTime działa głównie między iPhone\'ami. WhatsApp i Google Meet działają na obu systemach.'},
                {t: 'Nie, nigdy', why: 'Możecie: WhatsApp i Google Meet działają na obu rodzajach telefonów.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Gotowe.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Brawo!</strong> Nawiązałeś rozmowę wideo i pokazałeś widok z tylnego aparatu.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Kody QR to te kwadratowe czarno-białe wzory na plakatach i menu. Twój aparat potrafi je odczytać, bez dodatkowej aplikacji. <strong>Otwórz Aparat.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Skieruj aparat na kod i chwilę potrzymaj nieruchomo. <strong>Na ekranie pojawi się link</strong>: sprawdź, czy wygląda na pochodzący od tego, kogo się spodziewasz, a potem <strong>dotknij go</strong>.',
         hints: {shutter: 'Nie trzeba robić zdjęcia: po prostu skieruj aparat i poczekaj, aż pojawi się link, a potem go dotknij.'},
         hint: p === 'android' ? 'Poczekaj, aż pojawi się link, a potem go dotknij. Jeśli nic się nie pojawi, spróbuj Google Lens.' : 'Poczekaj, aż pojawi się link, a potem go dotknij.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Bezpłatne porady technologiczne</h3><p>Proste porady o telefonach, komputerach i bezpieczeństwie w internecie.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Widzisz naklejkę z kodem QR na automacie do płacenia na parkingu. Jaki jest najbezpieczniejszy sposób zapłaty?', options: [
            {t: 'Użyć oficjalnej aplikacji parkingu lub automatu, a nie przyklejonego kodu QR', ok: true, why: 'Tak. Oszuści naklejają fałszywe kody QR na prawdziwe, żeby wyłudzić dane karty. Sprawdź, czy to naklejka, i użyj oficjalnej aplikacji lub tablicy.'},
            {t: 'Zeskanować i zapłacić, tak szybciej', why: 'Fałszywe naklejki z kodami QR na automatach parkingowych to znane oszustwo. Użyj oficjalnej aplikacji albo samego automatu.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Bezpłatne porady technologiczne</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Brawo!</strong> Umiesz skanować kody QR aparatem i wiesz, że trzeba najpierw sprawdzić link.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Zdjęcia z niedzieli 📷', 'Cześć mamo, oto zdjęcia z obiadu…'],
                       ['tv', 'TV Licensing', 'Twoja licencja WYGASŁA', 'Działaj teraz, aby uniknąć postępowania sądowego. Zaktualizuj dane płatności…'],
                       ['library', 'Bridlington Library', 'Twoje książki trzeba zwrócić', 'Termin zwrotu upływa w piątek.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Odebrane' : 'Główne', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · do mnie</p><h3>Zdjęcia z niedzieli 📷</h3><p>Cześć mamo, oto zdjęcia z obiadu. Miło było cię zobaczyć! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Napisz odpowiedź…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Twoja licencja WYGASŁA</h3><p>Działaj teraz, aby uniknąć postępowania sądowego. Zaktualizuj dane płatności w ciągu 24 godzin: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Przenieś do spamu' : '⋮ Zgłoś wyłudzanie informacji'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Poczta' : 'twoja aplikacja pocztowa (Gmail w większości telefonów z Androidem)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Nowe e-maile są pogrubione. <strong>Dotknij e-maila od Sarah</strong>, żeby go przeczytać.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Aby odpowiedzieć, <strong>dotknij Odpowiedz</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Najpierw wpisz krótką odpowiedź, a potem dotknij Wyślij.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Wpisz krótką odpowiedź</strong> (na przykład „Dziękuję, są cudowne!”) i <strong>dotknij Wyślij</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Wysłano ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Wróć do odebranych</button>', {color: '#fff'}), target: 'back', say: '<strong>Dotknij Wstecz</strong>, żeby wrócić do odebranych.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Jest niepokojący e-mail od „TV Licensing”. <strong>Otwórz go</strong>, ale niczego w środku nie dotykaj.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Oszukańcze e-maile często używają prawdziwej nazwy, ale fałszywego adresu. <strong>Dotknij nazwy nadawcy</strong>, żeby zobaczyć prawdziwy adres e-mail.',
         hint: 'Dotknij „TV Licensing” u góry e-maila.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Pochodzi z <strong>outlook-mail.com</strong>, a nie z tvlicensing.co.uk. To oszustwo. <strong>Dotknij ' + (p === 'ios' ? 'Przenieś do spamu' : 'Zgłoś wyłudzanie informacji') + '.</strong> Możesz też przesyłać oszukańcze e-maile na report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Co zdradziło oszustwo?', options: [
            {t: 'Prawdziwy adres nadawcy, groźby i 24-godzinny termin', ok: true, why: 'Dokładnie. Prawdziwe instytucje nie straszą terminami, a ich e-maile przychodzą z ich własnego adresu internetowego.'},
            {t: 'Nic, wyglądał prawdziwie', why: 'Sprawdź adres nadawcy: nie był to adres TV Licensing. Groźby i krótkie terminy to też duże sygnały ostrzegawcze.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Brawo!</strong> Umiesz czytać e-maile i odpowiadać na nie oraz rozpoznawać i zgłaszać oszustwa.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Pobierz' : 'Zainstaluj';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Sklep Play'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Dotknij Szukaj.</strong>' : '<strong>Dotknij paska wyszukiwania.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Wyszukaliśmy „NHS App”. Wiele aplikacji ma w nazwie „NHS”. Sprawdź, <strong>kto ją stworzył</strong>: prawdziwą stworzyło <strong>NHS England</strong>. <strong>Dotknij ' + (p === 'ios' ? 'Pobierz' : 'Zainstaluj') + ' obok prawdziwej.</strong>',
         hints: {'fake1-get': 'Ta jest od HealthApps Ltd i to reklama. Prawdziwą NHS App tworzy NHS England.', 'fake2-get': 'Ta jest od QuickDev Apps, a nie od NHS. Prawdziwą tworzy NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Zainstalowane! Teraz usuń aplikację, której nigdy nie używasz, żeby uporządkować ekran i zwolnić miejsce. <strong>Naciśnij i przytrzymaj aplikację Pogoda</strong>, aż pojawi się menu.', hint: 'Przytrzymaj palec na ikonie Pogoda przez sekundę lub dwie.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Usunąć „Pogoda”?' : 'Pogoda', p === 'ios' ? 'Usunięcie z ekranu początkowego zachowa aplikację w Bibliotece aplikacji.' : '', p === 'ios'
            ? [['delete-app', 'Skasuj aplikację'], ['remove-home', 'Usuń z ekranu początkowego'], ['cancel', 'Anuluj']] : [['app-info', 'Informacje o aplikacji'], ['delete-app', 'Odinstaluj'], ['cancel', 'Anuluj']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Dotknij Usuń aplikację</strong>, a potem <strong>Skasuj aplikację</strong> (tutaj to jeden przycisk).' : '<strong>Dotknij Odinstaluj.</strong>',
         hints: {'remove-home': 'To tylko ukrywa ikonę; aplikacja zostaje w telefonie. Dotknij Skasuj aplikację.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Aplikacja prosi o opłatę za „odblokowanie” twoich danych NHS. Co o tym myślisz?', options: [
            {t: 'To nie jest prawdziwa NHS App, która jest całkowicie bezpłatna', ok: true, why: 'Dokładnie. NHS App jest bezpłatna. Usuń wszystko, co każe płacić za usługi NHS.'},
            {t: 'Płacę, to dla NHS', why: 'Prawdziwa NHS App jest bezpłatna i tworzy ją NHS England. Aplikacja żądająca pieniędzy nie jest prawdziwa.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Brawo!</strong> Umiesz odróżnić prawdziwe aplikacje od podróbek i usuwać aplikacje, których nie potrzebujesz.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Witaj ponownie.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Zaloguj się przez Face ID' : 'Zaloguj się odciskiem palca'}</button>
                <button type="button" class="cp" data-tap="password">Zaloguj się e-mailem i hasłem</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Recepty'], ['appointments', '⟦calendar⟧', 'Wizyty'], ['records', '⟦clipboard-list⟧', 'Twoje zdrowie'], ['messages', '⟦mail⟧', 'Wiadomości']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Recepty', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Zamów powtórną receptę</strong><small>Wybierz leki, które już masz przepisane</small></button><div class="ck"><strong>Zobacz swoje zamówienia</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Tabletki amlodypiny 5 mg'], ['med-2', 'Tabletki atorwastatyny 20 mg']];
            return app(p, 'Wybierz leki', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Potwierdź zamówienie', `<p class="cf">Tabletki amlodypiny 5 mg<br>Odbiór: Twoja wybrana apteka</p><button type="button" class="ce co" data-tap="confirm">Potwierdź i zamów</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Zamówienie wysłane', '<p class="cf">⟦check⟧ Twoja prośba o receptę została wysłana do przychodni lekarza rodzinnego. Zwykle trwa to 2 do 3 dni roboczych.</p><button type="button" class="cp" data-tap="home">Wróć do strony głównej</button>', {color: NHS});
        return app(p, 'Wizyty', '<div class="fo"><div class="ck"><strong>Wizyta u lekarza rodzinnego</strong><small>Wtorek o 10:30 · Twoja przychodnia</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> jest bezpłatna i pozwala zamawiać powtórne recepty, sprawdzać wizyty i nie tylko. (Ta ćwiczebna wersja jest udawana, stworzona tylko na potrzeby tej lekcji.) <strong>Dotknij NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Gdy skonfigurujesz ją przez NHS login, możesz logować się za pomocą ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Dotknij Zaloguj się przez ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'To też działa, ale twarz lub odcisk palca są szybsze. Dotknij niebieskiego przycisku.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Dotknij Recepty.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Dotknij Zamów powtórną receptę.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Najpierw dotknij leku, żeby go zaznaczyć, a potem dotknij Kontynuuj.',
         say: '<strong>Dotknij potrzebnego leku</strong>, żeby go zaznaczyć (spróbuj Amlodypina), a potem <strong>dotknij Kontynuuj</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Sprawdź, czy wszystko się zgadza, a potem <strong>dotknij Potwierdź i zamów</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Wysłano do przychodni! <strong>Dotknij Wróć do strony głównej.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Możesz też sprawdzić swoje wizyty. <strong>Dotknij Wizyty.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'SMS głosi: „NHS: kwalifikujesz się do bezpłatnego zestawu testowego, podaj dane bankowe, aby opłacić wysyłkę”. Co to jest?', options: [
            {t: 'Oszustwo. NHS nigdy nie prosi o dane bankowe w SMS-ie', ok: true, why: 'Dokładnie. Korzystaj z NHS App albo kontaktuj się bezpośrednio z przychodnią, nigdy przez linki w SMS-ach.'},
            {t: 'Prawdziwy, to tylko wysyłka', why: 'NHS nigdy nie prosi w SMS-ach o dane bankowe. To oszustwo: prześlij go na 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Brawo!</strong> Zamówiłeś powtórną receptę i sprawdziłeś swoje wizyty.'},
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
        if (page === 'login') return app(p, 'Bank ćwiczebny', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Zaloguj się przez Face ID' : 'Zaloguj się odciskiem palca'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Twoje konta', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Dzisiaj'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Dzisiaj'], ['txn-pension', 'Emerytura państwowa', '+£921.60', 'Wczoraj'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'pon.']];
            return app(p, 'Rachunek bieżący', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Płatność', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Dzisiaj, 03:12 · Karta kończąca się na 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Zamroź kartę</strong><small>${ctx.frozen ? 'Karta zamrożona ⟦check⟧' : 'Natychmiast wstrzymaj płatności'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Zgłoś tę płatność</strong><small>Nie rozpoznajesz jej? Powiedz nam</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Bank', BANK, ICON2.pound]]), target: 'bank',
         say: 'Aplikacje bankowe pozwalają sprawdzać pieniądze o każdej porze. (To udawany bank do ćwiczeń.) <strong>Otwórz aplikację Bank.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Zaloguj się za pomocą ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Nigdy nie podawaj nikomu kodu do bankowości.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Dotknij swojego Rachunku bieżącego</strong>, żeby zobaczyć wpłaty i wypłaty.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Przejrzyj płatności. Jednej nie rozpoznajesz: <strong>249 £ o 3 w nocy, w serwisie z kartami podarunkowymi</strong>. <strong>Dotknij jej.</strong>',
         hints: {'txn-tesco': 'To twoje zakupy. Szukaj płatności, której nie rozpoznajesz.', 'txn-pension': 'To wpłata twojej emerytury. Szukaj tej, która odstaje.', 'txn-water': 'To twój rachunek za wodę. Szukaj tej, która odstaje.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Dotknij Zamroź kartę</strong>. Natychmiast wstrzymuje wszystkie kolejne płatności, a później możesz ją odmrozić, jeśli okaże się, że wszystko jest w porządku.',
         hints: {report: 'Najpierw zamroź kartę, żeby zatrzymać kolejne płatności. Potem zgłoś sprawę.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Karta jest zamrożona. Co dalej?', options: [
            {t: 'Zadzwonić do banku pod 159 lub na numer z karty albo zgłosić sprawę w aplikacji', ok: true, why: 'Tak. Bank może to zbadać, anulować kartę i często odzyskać pieniądze. Im szybciej mu powiesz, tym lepiej.'},
            {t: 'Poczekać i zobaczyć, czy się powtórzy', why: 'Powiedz bankowi od razu. Im szybciej się dowie, tym więcej może zrobić.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Brawo!</strong> Sprawdziłeś konto, zauważyłeś płatność, której nie rozpoznałeś, i zamroziłeś kartę.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Bank ćwiczebny</strong><span>•••• 4421</span><small>DEBETOWA</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `<p class="cf">Dodaj kartę, żeby płacić telefonem w sklepach.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Dodaj kartę' : '＋ Dodaj do Wallet'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Dodaj kartę', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Ustaw kartę w ramce…' : 'Znaleziono kartę ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Zweryfikuj kartę', `<p class="cf">Twój bank musi sprawdzić, czy to ty. Wybierz, jak otrzymać kod:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Wiadomość tekstowa</strong><small>na ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Zadzwoń do banku</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Wpisz kod', `<div class="jp ex"><strong>Wiadomości · teraz</strong><span>Bank ćwiczebny: twój kod do Wallet to 529173. Nikomu go nie podawaj.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Twoja karta jest gotowa do użycia.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Przyłóż do czytnika…' : 'Przyłóż do czytnika…') : '⟦check⟧ Gotowe'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Wallet' : 'Wallet', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Płacenie telefonem jest szybkie i bezpieczne: sklepy nigdy nie widzą numeru twojej karty. <strong>Otwórz ${p === 'ios' ? 'Wallet' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Dodaj kartę' : '＋ Dodaj do Wallet'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Telefon odczytuje kartę aparatem, więc nie musisz wpisywać numeru. <strong>Ustaw kartę w ramce</strong>, a potem <strong>dotknij Dalej</strong>. <em>Nigdy nie wpisuj numeru karty na stronie internetowej z SMS-a ani e-maila.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Twój bank sprawdza, czy to naprawdę ty. <strong>Dotknij Wiadomość tekstowa.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'SMS od banku przynosi kod. <strong>Wpisz 5 2 9 1 7 3.</strong> Pamiętaj: ten kod wpisuje się wyłącznie we własnym telefonie, nigdy nie podaje się go nikomu, kto o niego prosi.', hint: 'Wpisz kod z wiadomości: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Twoja karta jest gotowa. Teraz zapłaćmy w sklepie. <strong>Dotknij karty w dowolnym miejscu.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'Przy kasie <strong>dwukrotnie naciśnij przycisk boczny</strong> w iPhonie (tutaj dotknij ⟦power⟧ dwa razy), spójrz na ekran, żeby użyć Face ID, a potem przyłóż górną część telefonu do czytnika kart.', hint: 'Dotknij dwa razy przycisku ⟦power⟧ z boku.'}
            : {target: 'pay-now', say: 'Przy kasie po prostu <strong>odblokuj telefon i przyłóż jego tył do czytnika kart</strong>. Tutaj <strong>dotknij czytnika kart</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Czy płacenie telefonem jest bezpieczne?', options: [
            {t: 'Tak, bezpieczniejsze niż kartą: wymaga twarzy, odcisku palca lub kodu, a sklepy nie widzą numeru karty', ok: true, why: 'Dokładnie. A jeśli zgubisz telefon, nikt nie może nim zapłacić bez odblokowania.'},
            {t: 'Nie, każdy mógłby z niego skorzystać', why: 'Każda płatność wymaga twarzy, odcisku palca lub kodu, więc jest właściwie bezpieczniejsza niż karta zbliżeniowa.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Brawo!</strong> Twoja karta jest w telefonie i wykonałeś płatność ćwiczebną.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>DEBETOWA</small></div>', '<small>DEBETOWA</small></div></button>');
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
            return app(p, 'Kolej ćwiczebna', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Wybierz stację'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Dodaj kartę zniżkową'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Wybierz stację</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Dodaj kartę zniżkową</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Bez karty zniżkowej']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Bezpośredni'], ['t-1145', '11:45', '12:32', 'Bezpośredni'], ['t-1245', '12:45', '13:32', 'Bezpośredni']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Ceny są zmyślone na potrzeby ćwiczenia. Zastosowano zniżkę z karty.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Bilet w jedną stronę poza szczytem</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Bilet powrotny na dzień poza szczytem</strong><small>Powrót dziś</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Twój bilet', `<div class="adt"><strong>Bilet powrotny na dzień poza szczytem</strong><span>Bridlington ⇄ Hull</span><span>Dzisiaj · Senior Railcard</span>
            ${UI.qr}<small>Zeskanuj to przy bramce biletowej albo pokaż konduktorowi.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Pociągi', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Aplikacje kolejowe pozwalają kupować bilety w telefonie, bez kolejki. (Ta ćwiczebna aplikacja jest udawana: ceny i godziny są zmyślone.) <strong>Otwórz Pociągi.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Jedziesz z Bridlington. <strong>Dotknij Do</strong>, żeby wybrać, dokąd jedziesz.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Dotknij Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Masz ponad 60 lat? <strong>Senior Railcard</strong> daje trzecią część zniżki na większość biletów. <strong>Dotknij Karta zniżkowa</strong>, żeby dodać swoją.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Dotknij Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Dotknij Znajdź pociągi.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Oto pociągi. <strong>Dotknij 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Wracasz dziś? Bilet powrotny na dzień jest zwykle tańszy niż dwa bilety w jedną stronę. <strong>Dotknij Bilet powrotny na dzień poza szczytem</strong>, a potem zapłać.',
         hints: {single: 'Bilet w jedną stronę jest tylko tam. Wracasz dziś, więc dotknij Bilet powrotny na dzień poza szczytem.', pay: 'Najpierw wybierz bilet: dotknij Bilet powrotny na dzień poza szczytem.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Dotknij ${p === 'ios' ? 'Zapłać' : 'G Pay'}</strong>, żeby zapłacić kartą z telefonu (z lekcji o płatnościach zbliżeniowych).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Bateria w telefonie jest na wyczerpaniu przed pociągiem powrotnym. Co dobrze zrobić?', options: [
            {t: 'Zrobić zrzut ekranu biletu i włączyć oszczędzanie baterii', ok: true, why: 'Tak. Niektóre bilety działają ze zrzutu ekranu, a oszczędzanie baterii pomaga jej wytrzymać. Wiele aplikacji pozwala też dodać bilet do Wallet.'},
            {t: 'Nic, jakoś to będzie', why: 'Jeśli telefon się wyłączy, nie pokażesz biletu. Zrób zrzut ekranu i oszczędzaj baterię.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Brawo!</strong> Zaplanowałeś podróż, dodałeś kartę zniżkową i kupiłeś bilet w telefonie.'},
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

    const busTable = `<div class="sj"><strong>Autobus 121: Bridlington – Hull</strong><small>Godziny tylko ćwiczeniowe</small>
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
        return app(p, 'Godziny autobusów', busTable, {back: false, color: '#fff',
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
            ? 'Zrzut ekranu to zdjęcie tego, co jest na ekranie, na przykład tych godzin autobusów. Naciśnij jednocześnie <strong>przycisk boczny</strong> (po prawej) i <strong>zwiększanie głośności</strong> (po lewej), a potem puść. Tutaj <strong>dotknij przycisku bocznego, a potem zwiększania głośności</strong>.'
            : 'Zrzut ekranu to zdjęcie tego, co jest na ekranie, na przykład tych godzin autobusów. Naciśnij jednocześnie <strong>przycisk zasilania</strong> i <strong>zmniejszanie głośności</strong>, a potem puść. Tutaj <strong>dotknij przycisku zasilania, a potem zmniejszania głośności</strong>.',
         hints: {'vol-down': p === 'ios' ? 'W iPhonie to głośność W GÓRĘ, z przyciskiem bocznym.' : 'Zacznij od przycisku zasilania, w górnej części prawej strony.',
                 'vol-up': p === 'ios' ? 'Zacznij od przycisku bocznego po prawej.' : 'W Androidzie to głośność W DÓŁ, z przyciskiem zasilania.',
                 side: 'Teraz przycisk zwiększania głośności, po lewej.', power: 'Teraz przycisk zmniejszania głośności.'},
         hint: p === 'ios' ? 'Przycisk boczny jest na prawej krawędzi. Zwiększanie głośności jest po lewej.' : 'Przycisk zasilania to górny przycisk na prawej krawędzi.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Pstryk! W dolnym rogu pojawia się mały obrazek. <strong>Dotknij go</strong>, żeby zobaczyć zrzut ekranu. <em>Jeśli go zostawisz, po kilku sekundach zapisze się sam.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Możesz tu po nim rysować albo go przyciąć. <strong>Dotknij Gotowe</strong> w lewym górnym rogu.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Dotknij Zachowaj w Zdjęciach.</strong>', hints: {'delete-shot': 'To by go wyrzuciło. Dotknij Zachowaj w Zdjęciach.', 'save-files': 'Pliki też się nadają, ale Zdjęcia łatwiej znaleźć. Dotknij Zachowaj w Zdjęciach.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Pstryk! Pojawia się mały obrazek z przyciskami pod spodem. Jest już zapisany. <strong>Dotknij Udostępnij</strong>, żeby wysłać go komuś.', hints: {'shot-edit': 'Edytuj pozwala przyciąć lub rysować po zrzucie. Na razie dotknij Udostępnij.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Dotknij Sarah</strong>, żeby wysłać jej godziny autobusów.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Gdzie później znajdziesz swoje zrzuty ekranu?', options: [
            {t: 'W aplikacji Zdjęcia, w albumie Zrzuty ekranu', ok: true, why: 'Tak. Są zapisane razem ze zdjęciami, więc możesz je oglądać, udostępniać lub usuwać jak każde zdjęcie.'},
            {t: 'Znikają po jednym dniu', why: 'Zostają, dopóki ich nie usuniesz. Szukaj w aplikacji Zdjęcia, w albumie Zrzuty ekranu.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Brawo!</strong> Zrzuty ekranu przydają się do godzin autobusów, biletów, komunikatów o błędach i wszystkiego, co chcesz zachować lub komuś pokazać. Gdy skończysz, możesz je usunąć ze Zdjęć.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Szukaj w Mapach'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah przysłała ci SMS-em adres. Skopiowanie go oszczędza ponownego pisania. <strong>Otwórz Wiadomości.</strong>'},
        {screen: () => app(p, 'Wiadomości', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Dotknij wiadomości od Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Naciśnij i przytrzymaj wiadomość z adresem</strong> (trzymaj na niej palec przez sekundę lub dwie), aż pojawi się menu.', hint: 'Trzymaj palec na drugiej wiadomości, aż pojawi się menu.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Dotknij Kopiuj.</strong> Telefon zapamiętuje teraz te słowa, gotowe do wklejenia gdzie indziej.',
         hints: {reply: 'Odpowiedz rozpocznie wiadomość. Dotknij Kopiuj.', forward: 'Prześlij dalej wysyła wiadomość komuś. Dotknij Kopiuj.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Skopiowano! Teraz przejdź na ekran główny. Tutaj <strong>dotknij paska u dołu ekranu</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Otwórz Mapy</strong>, żeby znaleźć adres.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Naciśnij i przytrzymaj pole wyszukiwania</strong>, aż pojawi się mały przycisk „Wklej”.', hint: 'Trzymaj palec na polu wyszukiwania u góry.',
         hints: {'search-tap': 'Krótkie dotknięcie otwiera klawiaturę. Zamiast tego naciśnij i przytrzymaj, aż pojawi się Wklej.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Dotknij Wklej.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Cały adres pojawia się bez pisania. <strong>Dotknij wyniku.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Chcesz skopiować sam numer telefonu ze środka długiej wiadomości. Jak?', options: [
            {t: 'Nacisnąć i przytrzymać, dotknąć Zaznacz (albo przeciągnąć małe uchwyty), żeby wybrać tylko ten fragment, a potem Kopiuj', ok: true,
             why: 'Tak. Przeciągnij uchwyty po obu stronach podświetlonych słów, żeby wybrać dokładnie to, co chcesz.'},
            {t: 'Można skopiować tylko całą wiadomość', why: 'Możesz wybrać jej część: naciśnij i przytrzymaj, dotknij Zaznacz i przeciągnij małe uchwyty.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Brawo!</strong> Kopiowanie i wklejanie działa prawie wszędzie: w wiadomościach, e-mailach, na stronach internetowych i w formularzach. Naciśnij i przytrzymaj, żeby skopiować; naciśnij i przytrzymaj, żeby wkleić.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Pamięć'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Pamięć iPhone\'a', [{caption: 'ZALECENIA'},
                ctx.offloaded ? {label: 'Odciążaj nieużywane aplikacje', value: 'Włączone ⟦check⟧'} : {id: 'offload', label: 'Odciążaj nieużywane aplikacje', sub: 'Zaoszczędź 2,1 GB. Usuwa aplikacje, których nie używasz, ale zachowuje ich dane.', value: 'Włącz'},
                {caption: 'APLIKACJE'}, {label: 'Zdjęcia', value: '21.3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7.6 GB' : '14.8 GB'}, {label: 'Facebook', value: '2.4 GB'}, {label: 'BBC iPlayer', value: '1.9 GB'}],
            {back: 'Ogólne', top: bar});
        }
        return list(p, 'Pamięć', [{label: 'Zdjęcia i filmy', value: '21.3 GB'}, {label: 'Aplikacje', value: ctx.cleaned ? '18.4 GB' : '25.2 GB', sub: 'W tym WhatsApp'}, {label: 'Dokumenty i inne', value: '4.1 GB'},
            {label: 'System', value: '7.6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ Wyczyszczono 1,1 GB zbędnych plików</p>' : '<button type="button" class="ce dk" data-tap="free-up">Zwolnij miejsce</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Ustawienia', `<div class="fo">${[['account', 'Konto'], ['privacy', 'Prywatność'], ['chats', 'Czaty'], ['notifications', 'Powiadomienia'], ['storage', 'Pamięć i dane'], ['help', 'Pomoc']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Pamięć i dane', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7.6 GB' : '14.8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Zarządzaj pamięcią', `<div class="iq"><span>WhatsApp zajmuje ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Większe niż 5 MB</strong><small>Nic do sprawdzenia</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Przesyłane wielokrotnie</strong><small>112 elementów · 0,9 GB</small></div>
                <div class="he">CZATY</div><div class="ck"><strong>Rodzina</strong><small>3.1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1.8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Większe niż 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Usunąć 23 elementy?', 'Zostaną usunięte z WhatsAppa. Zdjęcia już zapisane w galerii telefonu tam pozostaną.', [['cancel', 'Anuluj'], ['confirm-delete', 'Usuń']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Pojawia się „Pamięć prawie pełna”? Sprawdźmy, co zajmuje miejsce. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Dotknij Ogólne.</strong>'},
            {screen: () => list(p, 'Ogólne', [{id: 'about', label: 'Informacje'}, {id: 'update', label: 'Aktualizacja oprogramowania'}, {id: 'storage', label: 'Pamięć iPhone\'a'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN i zarządzanie urządzeniem'}], {back: 'Ustawienia'}),
             target: 'storage', say: '<strong>Dotknij Pamięć iPhone\'a.</strong> Obliczenie wszystkiego zajmuje kilka sekund.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Kolorowy pasek pokazuje, co zajmuje miejsce. Najpierw szybki sposób: <strong>Odciążaj nieużywane aplikacje</strong> usuwa aplikacje, z których od dawna nie korzystałeś, ale zachowuje twoje dane na wypadek, gdybyś chciał je przywrócić. <strong>Dotknij Włącz.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Dotknij Pamięć.</strong> <em>W telefonie Samsung to Opieka nad baterią i urządzeniem, a potem Pamięć.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Kolorowy pasek pokazuje, co zajmuje miejsce. <strong>Dotknij Zwolnij miejsce.</strong>'},
            {screen: () => app(p, 'Pliki', `<div class="ke"><strong>Usuń zbędne pliki</strong><small>1,1 GB plików tymczasowych z aplikacji</small><button type="button" class="ce dk" data-tap="clean">Wyczyść</button></div>
                <div class="ke"><strong>Usuń stare zrzuty ekranu</strong><small>214 MB</small><span class="fd">Zaznacz i zwolnij miejsce</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Zbędne pliki można bezpiecznie usunąć: to pliki tymczasowe, których aplikacje nie potrzebują. <strong>Dotknij Wyczyść.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp zajmuje 14,8 GB. Co go zapełnia?', options: [
            {t: 'Filmy i zdjęcia, które ludzie ci wysłali, zwłaszcza w grupach', ok: true, why: 'Tak. Każdy film wysłany na czacie rodzinnym lub grupowym jest zapisywany w telefonie. WhatsApp potrafi znaleźć i usunąć te duże.'},
            {t: 'Twoje wiadomości tekstowe', why: 'Tekst prawie nie zajmuje miejsca. To filmy i zdjęcia, które ludzie wysyłają, zwłaszcza w grupach.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Otwórz WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'W WhatsAppie dotknij <strong>Ustawień</strong> w prawym dolnym rogu. Tutaj jest już otwarte. <strong>Dotknij Pamięć i dane.</strong>'
                          : 'W WhatsAppie dotknij <strong>trzech kropek ⋮</strong> u góry, a potem <strong>Ustawień</strong>. Tutaj jest już otwarte. <strong>Dotknij Pamięć i dane.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Dotknij Zarządzaj pamięcią.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Największe oszczędności miejsca są u góry. <strong>Dotknij Większe niż 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'To duże filmy, które ludzie ci wysłali. Jeśli chcesz któryś zachować, najpierw zapisz go w zdjęciach. <strong>Dotknij Zaznacz wszystko.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Dotknij Usuń.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'To usuwa tylko kopie wewnątrz WhatsAppa. <strong>Dotknij Usuń</strong>, żeby potwierdzić.', hints: {cancel: 'Anuluj je zachowa. W tym ćwiczeniu dotknij Usuń.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Brawo!</strong> Zwolniłeś ponad 7 GB. Warto to robić co kilka miesięcy. Opróżnij też <strong>Ostatnio usunięte</strong> w Zdjęciach, bo usunięte zdjęcia zajmują miejsce jeszcze przez 30 dni.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Zegar światowy'], ['alarms', 'Budziki'], ['stopwatch', 'Stoper'], ['timers', 'Minutniki']]
            : [['alarms', 'Budzik'], ['world', 'Zegar'], ['timers', 'Minutnik'], ['stopwatch', 'Stoper']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Dzisiaj</small><strong>Londyn</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Australia</small><strong>Sydney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Tabletki')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Budzik</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Zegar światowy' : 'Zegar') : (p === 'ios' ? 'Budziki' : 'Budzik')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Nigdy'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Budzik', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Budzik może codziennie przypominać o zażyciu tabletek. <strong>Otwórz aplikację Zegar.</strong>', hint: 'To czarna ikona z białą tarczą zegara.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Dotknij ${p === 'ios' ? 'Budziki' : 'Budzik'}</strong> (${p === 'ios' ? 'bottom' : 'bottom left'}).`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Dotknij +</strong>, żeby dodać nowy budzik.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Na prawdziwym telefonie przewijasz cyfry, żeby ustawić godzinę. Tutaj <strong>dotknij 08:00</strong>.', hints: {'t-07': 'Wybierz 08:00 w tym ćwiczeniu.', 't-09': 'Wybierz 08:00 w tym ćwiczeniu.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Potrzebujesz tego codziennie, nie tylko raz. <strong>Dotknij Powtarzaj.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Codziennie'; }, say: '<strong>Dotknij Codziennie.</strong>',
         hints: {never: 'Nigdy oznacza, że zadzwoni tylko raz. Dotknij Codziennie.', weekdays: 'Dni robocze pomijają weekend. Dotknij Codziennie.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Najpierw wpisz etykietę w polu Etykieta, na przykład Tabletki.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Etykieta mówi, do czego służy budzik. <strong>Dotknij pola Etykieta i wpisz Tabletki</strong>, a potem <strong>dotknij Zapisz</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Budzik dzwoni o 8. Bierzesz tabletki. Który przycisk naciskasz?', options: [
            {t: 'Zatrzymaj', ok: true, why: 'Tak. Zatrzymaj wyłącza go do jutra do 8, bo powtarza się codziennie.'},
            {t: 'Drzemka', why: 'Drzemka sprawia, że zadzwoni ponownie za około 9 minut. Użyj jej, jeśli potrzebujesz chwili dłużej, ale Zatrzymaj wyłącza go do jutra.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Brawo!</strong> Budzik na tabletki dzwoni każdego ranka o 8. ' + (p === 'ios' ? 'Aplikacja <strong>Zdrowie</strong> ma też sekcję Leki, która przypomina i prowadzi dziennik.' : 'Możesz też poprosić Google: „Przypominaj mi codziennie o 8 o zażyciu tabletek”.')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Gdyby telefon zginął lub się zepsuł, czy twoje zdjęcia byłyby bezpieczne? Sprawdźmy. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Dotknij swojego imienia</strong> u góry.'},
        {screen: () => list(p, 'Konto Apple', [{id: 'personal', label: 'Dane osobowe'}, {id: 'security', label: 'Logowanie i zabezpieczenia'}, {id: 'payment', label: 'Płatności i dostawa'}, {id: 'subscriptions', label: 'Subskrypcje'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4.2 GB'}, {id: 'family', label: 'Udostępnianie rodzinne'}, {id: 'findmy', label: 'Lokalizator'}], {back: 'Ustawienia'}),
         target: 'icloud', say: '<strong>Dotknij iCloud.</strong> iCloud to internetowa pamięć Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'PAMIĘĆ: WYKORZYSTANO 4,2 GB Z 5 GB'}, {caption: 'ZAPISANE W ICLOUD'}, {id: 'photos', label: 'Zdjęcia', value: c.photoSync ? 'Włączona' : 'Wyłączone'}, {id: 'backup', label: 'Kopia iCloud', value: c.backedUp ? 'Włączona' : 'Wyłączone'},
            {label: 'Kontakty', value: 'Włączona'}, {label: 'Notatki', value: 'Włączona'}], {back: 'Konto Apple'}),
         target: 'photos', say: 'Zdjęcia i kopia zapasowa są <strong>wyłączone</strong>. To znaczy, że zgubiony telefon oznaczałby utratę zdjęć. <strong>Dotknij Zdjęcia.</strong>'},
        {screen: c => list(p, 'Zdjęcia', [{id: 'sync', label: 'Synchronizuj ten iPhone', toggle: !!c.photoSync, sub: 'Przechowuje twoje zdjęcia i filmy w iCloud, więc są bezpieczne, jeśli zgubisz telefon.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Dotknij Synchronizuj ten iPhone</strong>, żeby to włączyć.'},
        {screen: c => list(p, 'Zdjęcia', [{label: 'Synchronizuj ten iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Dotknij ‹ iCloud</strong>, żeby wrócić.'},
        {screen: c => list(p, 'iCloud', [{caption: 'PAMIĘĆ: WYKORZYSTANO 4,2 GB Z 5 GB'}, {caption: 'ZAPISANE W ICLOUD'}, {id: 'photos', label: 'Zdjęcia', value: 'Włączona'}, {id: 'backup', label: 'Kopia iCloud', value: 'Wyłączone'}], {back: 'Konto Apple'}),
         target: 'backup', say: 'Teraz utwórz kopię całej reszty: ustawień, wiadomości i aplikacji. <strong>Dotknij Kopia iCloud.</strong>'},
        {screen: c => list(p, 'Kopia zapasowa', [{id: 'backup-toggle', label: 'Utwórz kopię zapasową tego iPhone\'a', toggle: !!c.backedUp, sub: 'Tworzy kopię automatycznie każdej nocy, gdy iPhone się ładuje, jest zablokowany i ma Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Dotknij Utwórz kopię zapasową tego iPhone\'a</strong>, żeby to włączyć.'},
        {screen: () => list('ios', 'Kopia zapasowa', [{label: 'Utwórz kopię zapasową tego iPhone\'a', toggle: true}, {id: 'backup-now', label: 'Utwórz kopię teraz', sub: 'Ostatnia udana kopia: Nigdy'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Od teraz będzie tworzyć kopię każdej nocy. Pierwszą zrób teraz: <strong>dotknij Utwórz kopię teraz</strong>.'},
        {screen: c => list('ios', 'Kopia zapasowa', [{label: 'Utwórz kopię zapasową tego iPhone\'a', toggle: true}, {label: c.busy ? 'Tworzenie kopii…' : 'Utwórz kopię teraz', sub: c.busy ? 'Pozostało około 5 minut' : 'Ostatnia udana kopia: Przed chwilą ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'SMS głosi: „Twoja pamięć iCloud jest pełna. Twoje zdjęcia zostaną dziś usunięte. Zapłać 99 pensów tutaj: [link]”. Co robisz?', options: [
            {t: 'Ignoruję link. Sprawdzam w Ustawienia > moje imię > iCloud, a SMS-a przesyłam na 7726', ok: true, why: 'Tak. To częste oszustwo. Apple nie wysyła linków SMS-em i nigdy nie usuwa zdjęć w taki sposób. Sprawdź prawdziwy stan pamięci w Ustawieniach.'},
            {t: 'Szybko płacę, żeby uratować zdjęcia', why: 'To oszustwo mające wyłudzić dane karty. Sprawdź prawdziwy stan pamięci w Ustawienia > twoje imię > iCloud i prześlij SMS-a na 7726.'}]}},
        {screen: () => list('ios', 'Kopia zapasowa', [{label: 'Utwórz kopię zapasową tego iPhone\'a', toggle: true}, {label: 'Utwórz kopię teraz', sub: 'Ostatnia udana kopia: Przed chwilą ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Brawo!</strong> Twoje zdjęcia i telefon mają kopię zapasową. Bezpłatne 5 GB szybko zapełnia się zdjęciami; jeśli tak się stanie, więcej miejsca (iCloud+) kosztuje niewielką miesięczną opłatę i kupujesz je tylko w Ustawieniach, nigdy przez SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Gdyby telefon zginął lub się zepsuł, czy twoje zdjęcia byłyby bezpieczne? Sprawdźmy. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Dotknij Google.</strong> Jest blisko dołu.', hint: 'Przewiń listę w dół: Google jest blisko dołu.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Zarządzaj kontem Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Kopia zapasowa', sub: 'Wyłączone'}, {id: 'autofill', label: 'Autouzupełnianie'}, {id: 'devices', label: 'Urządzenia i udostępnianie'}]),
         target: 'backup', say: 'Kopia zapasowa ma wartość <strong>Wyłączona</strong>. <strong>Dotknij Kopia zapasowa.</strong> <em>W telefonie Samsung to Ustawienia > Konta i kopia zapasowa.</em>'},
        {screen: c => list(p, 'Kopia zapasowa', [{id: 'backup-toggle', label: 'Kopia zapasowa Google One', toggle: !!c.backedUp, sub: 'Tworzy kopię aplikacji, wiadomości, historii połączeń, kontaktów i ustawień.'},
            {id: 'photos-backup', label: 'Zdjęcia i filmy', sub: c.photoSync ? 'Włączone · Zdjęcia Google' : 'Wyłączone · Zdjęcia Google'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Dotknij Kopia zapasowa Google One</strong>, żeby to włączyć.'},
        {screen: c => list(p, 'Kopia zapasowa', [{label: 'Kopia zapasowa Google One', toggle: true}, {id: 'photos-backup', label: 'Zdjęcia i filmy', sub: 'Wyłączone · Zdjęcia Google'}]),
         target: 'photos-backup', say: 'Zdjęcia są osobno. <strong>Dotknij Zdjęcia i filmy.</strong>'},
        {screen: c => list(p, 'Kopia zapasowa', [{id: 'photos-toggle', label: 'Twórz kopię zdjęć i filmów', toggle: !!c.photoSync, sub: 'Zapisuje je w Zdjęciach Google, więc są bezpieczne, jeśli zgubisz telefon.'},
            {label: 'Jakość kopii', value: 'Oszczędzanie miejsca'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Dotknij Twórz kopię zdjęć i filmów</strong>, żeby to włączyć.'},
        {screen: () => list(p, 'Kopia zapasowa', [{label: 'Twórz kopię zdjęć i filmów', toggle: true}, {id: 'backup-now', label: 'Utwórz kopię teraz', sub: 'Ostatnia kopia: Nigdy'}]),
         target: 'backup-now', say: 'Od teraz tworzy kopię sama, przez Wi-Fi. Pierwszą zrób teraz: <strong>dotknij Utwórz kopię teraz</strong>.'},
        {screen: c => list(p, 'Kopia zapasowa', [{label: 'Twórz kopię zdjęć i filmów', toggle: true}, {label: c.busy ? 'Tworzenie kopii…' : 'Utwórz kopię teraz', sub: c.busy ? '1,204 items left' : 'Ostatnia kopia: Przed chwilą ⟦check⟧'}]), wait: 1500,
         question: {q: 'SMS głosi: „Twoja pamięć Google jest pełna. Twoje zdjęcia zostaną dziś usunięte. Zapłać 99 pensów tutaj: [link]”. Co robisz?', options: [
            {t: 'Ignoruję link. Sprawdzam w Ustawienia > Google > Kopia zapasowa, a SMS-a przesyłam na 7726', ok: true, why: 'Tak. To częste oszustwo. Google nie wysyła takich linków SMS-em. Sprawdź prawdziwy stan pamięci w Ustawieniach.'},
            {t: 'Szybko płacę, żeby uratować zdjęcia', why: 'To oszustwo mające wyłudzić dane karty. Sprawdź prawdziwy stan pamięci w Ustawieniach i prześlij SMS-a na 7726.'}]}},
        {screen: () => list(p, 'Kopia zapasowa', [{label: 'Twórz kopię zdjęć i filmów', toggle: true}, {label: 'Utwórz kopię teraz', sub: 'Ostatnia kopia: Przed chwilą ⟦check⟧'}]), done: true,
         say: '<strong>Brawo!</strong> Twoje zdjęcia i telefon mają kopię zapasową. Google daje ci 15 GB za darmo; jeśli się zapełni, więcej miejsca kosztuje niewielką miesięczną opłatę i kupujesz je tylko w Ustawieniach lub aplikacji Google One, nigdy przez SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 GRATULACJE! 🎉</strong><p>Wybrano cię, żebyś wygrał bon zakupowy o wartości 500 £!</p>
        <button type="button" class="aeb" data-tap="claim">ODBIERZ TERAZ</button><small>Reklama</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Informacje o aplikacji', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Wersja 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Otwórz</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Odinstaluj</button>
            <button type="button" data-tap="force-stop">Wymuś zatrzymanie</button></div>
            <div class="cj ex"><span class="hf"><strong>Bateria</strong><small>38% zużycia od ostatniego pełnego naładowania</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Uprawnienia</strong><small>Wyświetlanie nad innymi aplikacjami, Administrator urządzenia</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Czy chcesz odinstalować tę aplikację?', [['cancel', 'Anuluj'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>KALENDARZ · teraz</strong>
            <span>⚠️ Twój iPhone może być zainfekowany! Dotknij tutaj, aby go teraz wyczyścić.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Na ekranie głównym wyskakują reklamy, mimo że żadna aplikacja nie jest otwarta. Zwykle oznacza to, że wkradła się zła aplikacja. Najpierw <strong>nie dotykaj reklamy. Dotknij małego ⟦x⟧, żeby ją zamknąć.</strong>',
         hints: {claim: 'Nigdy nie dotykaj samej reklamy. Szukaj małego ⟦x⟧ w rogu.'}, hint: '⟦x⟧ jest małe, w prawym górnym rogu reklamy.'},
        {screen: () => home(p), target: 'settings', say: 'Złe aplikacje działają cały czas, więc zużywają dużo baterii. Tak je znajdziesz. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Dotknij Bateria.</strong> <em>W telefonie Samsung to Opieka nad baterią i urządzeniem, a potem Bateria.</em>'},
        {screen: () => list(p, 'Bateria', [{id: 'usage', label: 'Zużycie baterii', sub: 'Zobacz zużycie od ostatniego pełnego naładowania'}, {label: 'Oszczędzanie baterii', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Dotknij Zużycie baterii.</strong> <em>W niektórych telefonach Samsung dotknij wykresu lub Zobacz szczegóły.</em>'},
        {screen: () => list(p, 'Zużycie baterii', [], {top: `<div class="nl">${[['System Service', 38], ['Ekran', 21], ['WhatsApp', 12], ['YouTube', 8], ['Aparat', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Co z tego wygląda nie na miejscu?', options: [
            {t: 'System Service: nigdy z niego nie korzystałeś, a zużywa najwięcej baterii', ok: true, why: 'Tak. Złe aplikacje nadają sobie nudne nazwy, takie jak „System Service” lub „Keyboard Settings”, żebyś ich nie zauważył. Zapisz sobie jej nazwę.'},
            {t: 'Ekran', why: 'Ekran zawsze zużywa dużo baterii; to normalne. Dziwna jest „System Service”, z której nigdy nie korzystałeś.'},
            {t: 'WhatsApp', why: 'WhatsApp to aplikacja, z której korzystasz, więc to normalne. Dziwna jest „System Service”.'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Teraz znajdźmy ją w twoich aplikacjach. Wróć do Ustawień i <strong>dotknij Aplikacje</strong>.'},
        {screen: () => list(p, 'Aplikacje', [{caption: 'Ostatnio otwarte aplikacje'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Zobacz wszystkie 46 aplikacji'}, {id: 'default-apps', label: 'Aplikacje domyślne'}]),
         target: 'all-apps', say: '<strong>Dotknij Zobacz wszystkie aplikacje.</strong>'},
        {screen: () => list(p, 'Wszystkie aplikacje', ['Kalkulator', 'Kalendarz', 'Aparat', 'Chrome', 'Zegar', 'Kontakty', 'Gmail', 'Mapy'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Lista jest w kolejności alfabetycznej. <strong>Dotknij System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Przycisk <strong>Odinstaluj</strong> jest wyszarzony. Złe aplikacje robią tak, żebyś nie mógł ich usunąć. Najpierw <strong>dotknij Wymuś zatrzymanie</strong>, żeby przestała działać.',
         hints: {uninstall: 'Jest wyszarzony, więc jeszcze nie zadziała. Najpierw dotknij Wymuś zatrzymanie.', open: 'Nie otwieraj jej. Dotknij Wymuś zatrzymanie.'}},
        {screen: () => list(p, 'Szukaj w ustawieniach', [{caption: 'Wyniki dla „administrator urządzenia”'}, {id: 'device-admin', label: 'Aplikacje administratora urządzenia', sub: 'Zabezpieczenia i prywatność > Więcej ustawień zabezpieczeń'}]),
         target: 'device-admin',
         say: 'Teraz odbierz jej specjalne uprawnienie. W Ustawieniach <strong>wyszukaj „administrator urządzenia”</strong> na pasku wyszukiwania u góry. Oto wynik: <strong>dotknij Aplikacje administratora urządzenia</strong>.'},
        {screen: c => list(p, 'Aplikacje administratora urządzenia', [{label: 'Znajdź moje urządzenie', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Dezaktywować tę aplikację administratora urządzenia?', 'System Service nie będzie już mogła uniemożliwiać ci jej odinstalowania.', [['cancel', 'Anuluj'], ['deactivate', 'Dezaktywuj']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Znajdź moje urządzenie jest od Google i jest w porządku. <strong>Dotknij przełącznika obok System Service.</strong>', hints: {'find-my': 'Zostaw Znajdź moje urządzenie włączone. Dotknij System Service.'}},
        {screen: c => list(p, 'Aplikacje administratora urządzenia', [{label: 'Znajdź moje urządzenie', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Dezaktywować tę aplikację administratora urządzenia?', 'System Service nie będzie już mogła uniemożliwiać ci jej odinstalowania.', [['cancel', 'Anuluj'], ['deactivate', 'Dezaktywuj']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Dotknij Dezaktywuj.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Wracając do System Service, <strong>Odinstaluj</strong> już działa. <strong>Dotknij Odinstaluj.</strong>', hints: {'force-stop': 'Jest już zatrzymana. Dotknij Odinstaluj.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Dotknij OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Zniknęła! Na koniec poproś Google o sprawdzenie, czy nie ma czegoś jeszcze. <strong>Otwórz Sklep Play.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Nie znaleziono szkodliwych aplikacji' : 'Przeskanuj telefon'}</strong>
            <small>${c.scanned ? 'Sprawdzono przed chwilą' : 'Ostatnio skanowano: 3 tygodnie temu'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'W Sklepie Play dotknij swojego <strong>zdjęcia profilowego</strong> (w prawym górnym rogu), a potem <strong>Play Protect</strong>. Tutaj jest już otwarte. <strong>Dotknij Skanuj.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Nie znaleziono szkodliwych aplikacji</strong><small>Sprawdzono przed chwilą</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Brawo!</strong> Znalazłeś złą aplikację po zużyciu baterii, odebrałeś jej specjalne uprawnienie, odinstalowałeś ją i sprawdziłeś telefon. Aby tego uniknąć: instaluj aplikacje tylko ze Sklepu Play i uważaj na darmowe latarki oraz aplikacje „czyszczące” i „przyspieszające”.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Powiadomienie z Kalendarza głosi: „Twój iPhone może być zainfekowany! Dotknij tutaj, aby go teraz wyczyścić.” Co to jest?', options: [
            {t: 'Spam, który wkradł się do kalendarza. Nie dotykaj go', ok: true, why: 'Tak. Dotknięcie „Zezwól” na podejrzanej stronie może dodać do iPhone\'a spamowy kalendarz. Jego „wydarzenia” to reklamy podobne do ostrzeżeń. Twój iPhone jest w porządku.'},
            {t: 'Prawdziwe ostrzeżenie od Apple', why: 'Apple nie wysyła ostrzeżeń o wirusach przez Kalendarz. To spam z subskrybowanego kalendarza. Nie dotykaj go.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Usuńmy spamowy kalendarz. <strong>Dotknij Ustawienia</strong>, a nie powiadomienia.', hints: {notif: 'Nie dotykaj ostrzeżenia. Dotknij Ustawienia.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Przewiń w dół i <strong>dotknij Aplikacje</strong>.', hint: 'Aplikacje są w ostatniej grupie.'},
        {screen: () => list(p, 'Aplikacje', ['App Store', 'Książki'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Kalendarz'}, {label: 'Aparat'}, {label: 'Kontakty'}, {label: 'Poczta'}]), {back: 'Ustawienia'}),
         target: 'calendar', say: '<strong>Dotknij Kalendarz.</strong>'},
        {screen: () => list(p, 'Kalendarz', [{id: 'accounts', label: 'Konta kalendarza', value: '2'}, {label: 'Zastąpienie strefy czasowej', value: 'Wyłączone'}, {label: 'Domyślne czasy alertów'}], {back: 'Aplikacje'}),
         target: 'accounts', say: '<strong>Dotknij Konta kalendarza.</strong>'},
        {screen: () => list(p, 'Konta kalendarza', [{caption: 'KONTA'}, {label: 'iCloud', sub: 'Kalendarze, kontakty i 7 więcej'}, {id: 'subscribed', label: 'Subskrybowane kalendarze', value: '1'}], {back: 'Kalendarz'}),
         target: 'subscribed', say: 'iCloud jest twój własny. <strong>Dotknij Subskrybowane kalendarze.</strong>'},
        {screen: () => list(p, 'Subskrybowane kalendarze', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Subskrybowany'}], {back: 'Konta kalendarza'}),
         target: 'spam-cal', say: 'Jest: kalendarz, którego nigdy nie chciałeś dodawać. <strong>Dotknij Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serwer', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Usuń konto', danger: true}],
            {back: 'Wstecz', overlay: c.askDelete ? dialog(p, 'Czy na pewno?', 'Spowoduje to usunięcie kalendarza i jego wydarzeń z twojego iPhone\'a.', [['cancel', 'Anuluj'], ['confirm-delete', 'Usuń konto']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Dotknij Usuń konto.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Serwer', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Usuń konto', danger: true}],
            {back: 'Wstecz', overlay: dialog(p, 'Czy na pewno?', 'Spowoduje to usunięcie kalendarza i jego wydarzeń z twojego iPhone\'a.', [['cancel', 'Anuluj'], ['confirm-delete', 'Usuń konto']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Dotknij Usuń konto</strong>, żeby potwierdzić.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Zniknął. Jeszcze jedno sprawdzenie: podejrzane strony mogą też zainstalować „profil”. <strong>Dotknij Ogólne.</strong>'},
        {screen: () => list(p, 'Ogólne', [{id: 'about', label: 'Informacje'}, {id: 'update', label: 'Aktualizacja oprogramowania'}, {id: 'storage', label: 'Pamięć iPhone\'a'}, {id: 'vpn', label: 'VPN i zarządzanie urządzeniem'}], {back: 'Ustawienia'}),
         target: 'vpn', say: '<strong>Dotknij VPN i zarządzanie urządzeniem.</strong>'},
        {screen: c => list(p, 'VPN i zarządzanie urządzeniem', c.profileGone ? [{label: 'VPN', value: 'Niepołączony'}] : [{label: 'VPN', value: 'Niepołączony'}, {caption: 'PROFIL KONFIGURACYJNY'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Niezweryfikowany'}], {back: 'Ogólne'}),
         target: 'profile', say: 'Jeśli widzisz tu profil, którego nie rozpoznajesz (ten z pracy lub szkoły jest w porządku), usuń go. <strong>Dotknij Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Profil', [{label: 'Free Phone Booster', sub: 'Niezweryfikowany · Zawiera: Web Clips, Certyfikaty'}, {caption: ' '}, {id: 'remove-profile', label: 'Usuń profil', danger: true}],
            {back: 'Wstecz', overlay: c.askRemove ? dialog(p, 'Usuń profil', 'Usunięcie tego profilu skasuje wszystkie jego ustawienia.', [['cancel', 'Anuluj'], ['confirm-remove', 'Usuń']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Dotknij Usuń profil</strong>. iPhone poprosi o kod.'},
        {screen: c => list(p, 'Profil', [{label: 'Free Phone Booster', sub: 'Niezweryfikowany'}, {caption: ' '}, {label: 'Usuń profil', danger: true}],
            {back: 'Wstecz', overlay: dialog(p, 'Usuń profil', 'Usunięcie tego profilu skasuje wszystkie jego ustawienia.', [['cancel', 'Anuluj'], ['confirm-remove', 'Usuń']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Dotknij Usuń.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Brawo!</strong> Fałszywe ostrzeżenia zniknęły. Aby to się nie powtórzyło: na stronach internetowych dotknij <strong>Nie zezwalaj</strong> lub <strong>Zamknij</strong> przy każdym oknie z prośbą o dodanie kalendarza lub profilu i instaluj aplikacje tylko z App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Anulowana · Kończy się 22 października'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '4,99 £ tygodniowo · Odnawia się 22 października'};
        return list(p, 'Subskrypcje', [{caption: p === 'ios' ? 'AKTYWNE' : 'Aktywna'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '0,99 £ miesięcznie' : '1,59 £ miesięcznie'},
            {caption: p === 'ios' ? 'NIEAKTYWNE' : 'Wygasła'}, {label: 'Crossword Daily', sub: 'Wygasła 3 marca'}], {back: p === 'ios' ? 'Konto Apple' : 'Wstecz'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'TWOJA SUBSKRYPCJA' : 'Plan'}, {label: 'Tygodniowy', sub: '4,99 £ tygodniowo. Zaczęła się jako 3-dniowy bezpłatny okres próbny.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Anuluj subskrypcję' : 'Anuluj subskrypcję', danger: true}],
            {back: 'Subskrypcje', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Potwierdź anulowanie' : 'Anulować subskrypcję?', 'Możesz z niej korzystać do 22 października. Nie zostaniesz ponownie obciążony.', [['keep', p === 'ios' ? 'Nie teraz' : 'Zachowaj']].concat([['confirm-cancel', p === 'ios' ? 'Potwierdź' : 'Anuluj subskrypcję']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Bezpłatne okresy próbne często zmieniają się w płatne plany, zanim to zauważysz. Sprawdźmy. <strong>Dotknij Ustawienia.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Dotknij swojego imienia</strong> u góry.'},
            {screen: () => list(p, 'Konto Apple', [{id: 'personal', label: 'Dane osobowe'}, {id: 'security', label: 'Logowanie i zabezpieczenia'}, {id: 'payment', label: 'Płatności i dostawa'}, {id: 'subscriptions', label: 'Subskrypcje'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Ustawienia'}),
             target: 'subscriptions', say: '<strong>Dotknij Subskrypcje.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Bezpłatne okresy próbne często zmieniają się w płatne plany, zanim to zauważysz. Sprawdźmy. <strong>Otwórz Sklep Play.</strong>'},
            {screen: c => app(p, 'Sklep Play', `<div class="hp"><span>POLECANE DLA CIEBIE</span><strong>Aplikacje na start</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Dotknij swojego zdjęcia profilowego</strong>, okrągłej litery w prawym górnym rogu.'},
            {screen: c => app(p, 'Sklep Play', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Dotknij Płatności i subskrypcje.</strong>'},
            {screen: () => list(p, 'Płatności i subskrypcje', [{id: 'methods', label: 'Metody płatności'}, {id: 'subscriptions', label: 'Subskrypcje', sub: 'Zarządzaj subskrypcjami'}, {id: 'budget', label: 'Budżet i historia'}]),
             target: 'subscriptions', say: '<strong>Dotknij Subskrypcje.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '„Photo Editor Pro” zaczęło się jako bezpłatny okres próbny, a teraz kosztuje <strong>4,99 £ co tydzień</strong>. To ponad 250 £ rocznie! <strong>Dotknij tej pozycji.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Anuluj subskrypcję' : 'Anuluj subskrypcję'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Potwierdź' : 'Anuluj subskrypcję'}.</strong>`, hints: {keep: 'To nadal pobiera opłaty. Dotknij ' + (p === 'ios' ? 'Potwierdź' : 'Anuluj subskrypcję') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Usuwasz aplikację Photo Editor z telefonu. Czy to zatrzyma płatności?', options: [
            {t: 'Nie. Trzeba anulować subskrypcję, tak jak przed chwilą', ok: true, why: 'Dokładnie. Usunięcie aplikacji NIE anuluje subskrypcji. Płacisz dalej, dopóki jej tu nie anulujesz.'},
            {t: 'Tak, usunięcie aplikacji to zatrzymuje', why: 'Nie zatrzymuje! Płacisz dalej, dopóki nie anulujesz samej subskrypcji, tutaj.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Brawo!</strong> Oszczędzasz 4,99 £ tygodniowo. Wskazówka: gdy zaczynasz bezpłatny okres próbny, ustaw budzik na dzień przed jego końcem. Od czasu do czasu sprawdzaj też w aplikacji banku listę płatności cyklicznych.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Nowsze iPhone\'y mają <strong>Apple Intelligence</strong>: sztuczną inteligencję, która pisze, streszcza i edytuje za ciebie. Możesz ją wyłączyć. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Dotknij Apple Intelligence i Siri.</strong>', hint: 'Jest w trzeciej grupie, poniżej Dostępność.'},
        {screen: c => list(p, 'Apple Intelligence i Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Narzędzia pisania, podsumowania powiadomień, Image Playground i więcej.'},
            {caption: 'ROZSZERZENIA'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Wyłączone' : 'Włączona'}, {caption: 'SIRI'}, {label: 'Rozmawiaj z Siri', value: '„Siri” lub „Hej Siri”'}],
            {back: 'Ustawienia', overlay: c.askOff ? dialog(p, 'Wyłączyć Apple Intelligence?', 'Funkcje takie jak Narzędzia pisania i podsumowania przestaną być dostępne.', [['cancel', 'Anuluj'], ['confirm-off', 'Wyłącz']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Dotknij przełącznika Apple Intelligence</strong>, żeby go wyłączyć.', hints: {chatgpt: 'ChatGPT zrobimy za chwilę. Najpierw dotknij przełącznika Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence i Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'ROZSZERZENIA'}, {label: 'ChatGPT', value: 'Włączona'}],
            {back: 'Ustawienia', overlay: dialog(p, 'Wyłączyć Apple Intelligence?', 'Funkcje takie jak Narzędzia pisania i podsumowania przestaną być dostępne.', [['cancel', 'Anuluj'], ['confirm-off', 'Wyłącz']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Dotknij Wyłącz.</strong>'},
        {screen: c => list(p, 'Apple Intelligence i Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'ROZSZERZENIA'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Włączona'}], {back: 'Ustawienia'}),
         target: 'chatgpt', say: 'Rozszerzenie ChatGPT może wysyłać twoje pytania do ChatGPT, firmy spoza Apple. <strong>Dotknij ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Używaj ChatGPT', toggle: !c.gptOff, sub: 'Siri może wysyłać zapytania do ChatGPT.'}], {back: 'Wstecz'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Dotknij Używaj ChatGPT</strong>, żeby to wyłączyć.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Używaj ChatGPT', toggle: false}], {back: 'Wstecz'}),
         question: {q: 'WhatsApp, Facebook i inne aplikacje też mają czaty z AI. Jaka jest bezpieczna zasada?', options: [
            {t: 'Nigdy nie wpisuj danych osobowych (bank, zdrowie, hasła, adresy) w żadnym czacie z AI', ok: true, why: 'Tak. To, co wpiszesz, może być przechowywane i używane do trenowania AI. Traktuj to jak rozmowę z obcym.'},
            {t: 'Czaty z AI są prywatne, więc wszystko wolno', why: 'Nie są prywatne jak rozmowa telefoniczna. To, co wpiszesz, może być przechowywane. Nie wpisuj tam danych osobowych.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Używaj ChatGPT', toggle: false}], {back: 'Wstecz'}), done: true,
         say: '<strong>Brawo!</strong> Apple Intelligence i ChatGPT są wyłączone. W każdej chwili możesz je włączyć z powrotem w tym samym miejscu. Siri nadal działa jak zwykle.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Telefony z Androidem mają teraz <strong>Gemini</strong>, sztuczną inteligencję Google. Przytrzymanie przycisku zasilania może ją przypadkiem uruchomić. Zmieńmy to. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Dotknij Aplikacje.</strong>'},
        {screen: () => list(p, 'Aplikacje', [{caption: 'Ostatnio otwarte aplikacje'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Zobacz wszystkie 45 aplikacji'}, {id: 'default-apps', label: 'Aplikacje domyślne', sub: 'Aplikacje asystenta, przeglądarki i telefonu'}]),
         target: 'default-apps', say: '<strong>Dotknij Aplikacje domyślne.</strong>'},
        {screen: () => list(p, 'Aplikacje domyślne', [{label: 'Aplikacja przeglądarki', sub: 'Chrome'}, {id: 'assistant', label: 'Aplikacja asystenta cyfrowego', sub: 'Gemini'}, {label: 'Aplikacja telefonu', sub: 'Telefon'}, {label: 'Aplikacja SMS', sub: 'Wiadomości'}]),
         target: 'assistant', say: '<strong>Dotknij Aplikacja asystenta cyfrowego.</strong>'},
        {screen: c => list(p, 'Aplikacja asystenta cyfrowego', [{id: 'assistant-app', label: 'Domyślna aplikacja asystenta cyfrowego', sub: c.noAssist ? 'Brak' : 'Gemini'}, {label: 'Używaj tekstu z ekranu', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Domyślna aplikacja asystenta cyfrowego</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Brak</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Dotknij Domyślna aplikacja asystenta cyfrowego.</strong>'},
        {screen: c => list(p, 'Aplikacja asystenta cyfrowego', [{label: 'Domyślna aplikacja asystenta cyfrowego', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Domyślna aplikacja asystenta cyfrowego</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Brak</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Dotknij Brak.</strong> Gemini nie będzie się już pojawiać po przytrzymaniu przycisku zasilania.', hints: {'assist-gemini': 'To zostawia Gemini. Dotknij Brak.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Teraz zrób tak, żeby Gemini nie zachowywało tego, co do niego wpisujesz. <strong>Otwórz aplikację Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Cześć, Margaret<br><small>W czym mogę ci dziś pomóc?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Dotknij swojego zdjęcia profilowego</strong> w prawym górnym rogu.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Dotknij Aktywność w aplikacjach Gemini.</strong> <em>W niektórych telefonach nazywa się to Zachowaj aktywność.</em>'},
        {screen: c => app(p, 'Aktywność w aplikacjach Gemini', `<p class="cf"><strong>${c.actOff ? 'Wyłączone' : 'Włączona'}</strong><br>${c.actOff ? 'Twoje czaty nie są już zapisywane na twoim koncie ani używane do ulepszania AI Google.' : 'Twoje czaty są zapisywane na twoim koncie Google i mogą być sprawdzane w celu ulepszania AI Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Wyłącz</button><button type="button" class="cj" data-tap="off-delete">Wyłącz i usuń aktywność</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Dotknij Wyłącz.</strong>'},
        {screen: c => app(p, 'Aktywność w aplikacjach Gemini', '<p class="cf"><strong>Włączone</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Wyłącz</button><button type="button" class="cj" data-tap="off-delete">Wyłącz i usuń aktywność</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Dotknij Wyłącz i usuń aktywność</strong>, żeby wyczyścić też to, co już zapisał.', hints: {'off-only': 'To przestaje zapisywać nowe czaty, ale zachowuje stare. Dotknij Wyłącz i usuń aktywność.'}},
        {screen: c => app(p, 'Aktywność w aplikacjach Gemini', '<p class="cf"><strong>Wyłączone</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook i inne aplikacje też mają czaty z AI. Jaka jest bezpieczna zasada?', options: [
            {t: 'Nigdy nie wpisuj danych osobowych (bank, zdrowie, hasła, adresy) w żadnym czacie z AI', ok: true, why: 'Tak. To, co wpiszesz, może być przechowywane i używane do trenowania AI. Traktuj to jak rozmowę z obcym.'},
            {t: 'Czaty z AI są prywatne, więc wszystko wolno', why: 'Nie są prywatne jak rozmowa telefoniczna. To, co wpiszesz, może być przechowywane. Nie wpisuj tam danych osobowych.'}]}},
        {screen: c => app(p, 'Aktywność w aplikacjach Gemini', '<p class="cf"><strong>Wyłączone</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Brawo!</strong> Gemini nie wyskakuje już po przytrzymaniu przycisku zasilania i nie zachowuje twoich czatów. W telefonie Samsung sprawdź też <strong>Ustawienia > Galaxy AI</strong>, gdzie każda funkcja ma własny przełącznik.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Twoje konto Apple przechowuje zdjęcia, kontakty i płatności. Sprawdźmy, czy jest chronione. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Dotknij swojego imienia</strong> u góry.'},
        {screen: () => list(p, 'Konto Apple', [{id: 'personal', label: 'Dane osobowe'}, {id: 'security', label: 'Logowanie i zabezpieczenia'}, {id: 'payment', label: 'Płatności i dostawa'}, {id: 'subscriptions', label: 'Subskrypcje'}], {back: 'Ustawienia'}),
         target: 'security', say: '<strong>Dotknij Logowanie i zabezpieczenia.</strong>'},
        {screen: () => list(p, 'Logowanie i zabezpieczenia', [{label: 'E-mail i numery telefonów', sub: '+44 7700 900123'}, {label: 'Zmień hasło'}, {caption: ' '}, {label: 'Uwierzytelnianie dwuskładnikowe', value: 'Włączona'},
            {id: 'recovery', label: 'Odzyskiwanie konta'}], {back: 'Konto Apple'}),
         target: 'recovery', say: '<strong>Uwierzytelnianie dwuskładnikowe</strong> ma wartość Włączone: dobrze. Oznacza to, że nowe urządzenie potrzebuje kodu z twojego telefonu, zanim się zaloguje. Teraz <strong>dotknij Odzyskiwanie konta</strong>.'},
        {screen: c => list(p, 'Odzyskiwanie konta', [{caption: 'KONTAKT DO ODZYSKIWANIA'}, c.recovery ? {label: 'Sarah', sub: 'Oczekiwanie na akceptację przez Sarah'} : {id: 'add-contact', label: 'Dodaj kontakt do odzyskiwania…', sub: 'Ktoś, komu ufasz, kto może pomóc ci wrócić na konto.'}],
            {back: 'Wstecz', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Wybierz kontakt do odzyskiwania</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (córka)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Jeśli kiedykolwiek zapomnisz hasła, <strong>kontakt do odzyskiwania</strong> może dać ci kod, który pomoże ci wrócić na konto. Nie widzi twoich danych. <strong>Dotknij Dodaj kontakt do odzyskiwania.</strong>'},
        {screen: c => list(p, 'Odzyskiwanie konta', [{caption: 'KONTAKT DO ODZYSKIWANIA'}, {label: 'Dodaj kontakt do odzyskiwania…'}],
            {back: 'Wstecz', overlay: `<div class="ei"><div class="cv"><p><strong>Wybierz kontakt do odzyskiwania</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (córka)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Wybierz kogoś, komu ufasz, kto ma iPhone\'a. <strong>Dotknij Sarah.</strong>', hints: {'pick-dave': 'W tym ćwiczeniu wybierz Sarah.'}},
        {screen: c => list(p, 'Odzyskiwanie konta', [{caption: 'KONTAKT DO ODZYSKIWANIA'}, {label: 'Sarah', sub: 'Oczekiwanie na akceptację przez Sarah'}], {back: 'Wstecz'}),
         question: {q: 'Ktoś dzwoni i mówi, że jest z Apple. Prosi, żebyś podał 6-cyfrowy kod, który właśnie pojawił się na telefonie. Co robisz?', options: [
            {t: 'Rozłączam się. Nigdy nikomu nie podaję tego kodu', ok: true, why: 'Dokładnie. Ten kod wpuszcza kogoś na twoje konto. Apple nigdy nie zadzwoni z prośbą o niego.'},
            {t: 'Podaję go, to przecież Apple', why: 'Apple nigdy nie poprosi o ten kod. Każdy, kto go ma, może wejść na twoje konto. Rozłącz się.'}]}},
        {screen: c => list(p, 'Odzyskiwanie konta', [{caption: 'KONTAKT DO ODZYSKIWANIA'}, {label: 'Sarah', sub: 'Oczekiwanie na akceptację przez Sarah'}], {back: 'Wstecz'}), done: true,
         say: '<strong>Brawo!</strong> Uwierzytelnianie dwuskładnikowe jest włączone, a Sarah może pomóc ci wrócić na konto. iPhone może też zapamiętywać za ciebie hasła, w aplikacji <strong>Hasła</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Twoje konto Google przechowuje e-maile, zdjęcia i kontakty. Dodajmy do niego drugi zamek. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Dotknij Google.</strong>', hint: 'Google jest blisko dołu listy.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Zarządzaj kontem Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Kopia zapasowa'}, {id: 'autofill', label: 'Autouzupełnianie'}]),
         target: 'manage', say: '<strong>Dotknij Zarządzaj kontem Google.</strong>'},
        {screen: () => app(p, 'Konto Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Dotknij Bezpieczeństwo</strong> na górnym pasku.'},
        {screen: c => list(p, 'Bezpieczeństwo', [{caption: 'Jak logujesz się w Google'}, {id: '2sv', label: 'Weryfikacja dwuetapowa', sub: c.twoOn ? 'Włączona' : 'Wyłączone'}, {label: 'Hasło', sub: 'Ostatnia zmiana 2 lata temu'}, {label: 'Telefon do odzyskiwania', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Weryfikacja dwuetapowa</strong> jest wyłączona. Oznacza to, że logowanie na nowym urządzeniu wymaga też kodu wysłanego na telefon, więc skradzione hasło nie wystarczy. <strong>Dotknij jej.</strong>'},
        {screen: () => list(p, 'Weryfikacja dwuetapowa', [], {top: '<p class="cf">Twój numer telefonu: <strong>07700 900123</strong><br>Wyślemy SMS-em kod na ten numer, żeby sprawdzić, czy jest twój.</p><button type="button" class="ce dk" data-tap="send-code">Wyślij kod</button>'}),
         target: 'send-code', say: '<strong>Dotknij Wyślij kod.</strong>'},
        {screen: c => list(p, 'Weryfikacja dwuetapowa', [], {top: `<div class="sd"><strong>WIADOMOŚCI · teraz</strong><span>G-382605 to twój kod weryfikacyjny Google.</span></div>
            <p class="cf">Wpisz kod, który wysłaliśmy SMS-em na 07700 900123</p>${field('gcode', 'Wpisz kod', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Dalej</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Wpisz 6 cyfr z SMS-a: 382605.',
         say: 'Przychodzi SMS z kodem. <strong>Wpisz 382605 w polu</strong> i <strong>dotknij Dalej</strong>. <em>(To kod ćwiczebny. Nigdy nie wpisuj prawdziwego kodu nigdzie poza miejscem, o które sam prosiłeś.)</em>'},
        {screen: () => list(p, 'Weryfikacja dwuetapowa', [], {top: '<p class="cf">Twój numer telefonu został sprawdzony ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Włącz weryfikację dwuetapową</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Dotknij Włącz weryfikację dwuetapową.</strong>'},
        {screen: c => list(p, 'Bezpieczeństwo', [{caption: 'Jak logujesz się w Google'}, {label: 'Weryfikacja dwuetapowa', sub: 'Włączona ⟦check⟧'}, {label: 'Telefon do odzyskiwania', sub: '07700 900123'}]),
         question: {q: 'Ktoś dzwoni i mówi, że jest z Google. Prosi, żebyś podał kod, który właśnie dostałeś SMS-em. Co robisz?', options: [
            {t: 'Rozłączam się. Nigdy nikomu nie podaję tego kodu', ok: true, why: 'Dokładnie. Ten kod wpuszcza kogoś na twoje konto. Google nigdy nie zadzwoni z prośbą o niego.'},
            {t: 'Podaję go, to przecież Google', why: 'Google nigdy nie poprosi o ten kod. Każdy, kto go ma, może wejść na twoje konto. Rozłącz się.'}]}},
        {screen: c => list(p, 'Bezpieczeństwo', [{caption: 'Jak logujesz się w Google'}, {label: 'Weryfikacja dwuetapowa', sub: 'Włączona ⟦check⟧'}]), done: true,
         say: '<strong>Brawo!</strong> Twoje konto Google wymaga teraz telefonu, a nie tylko hasła. Google może też zapamiętywać twoje hasła: szukaj <strong>Menedżera haseł Google</strong> w Ustawieniach.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Piękny spacer wzdłuż promenady dziś rano! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Następny spacer: sobota, 10:00, z portu.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Brak nowych zaproszeń do grona znajomych.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Zobacz swój profil</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Ustawienia i prywatność</strong></button><div class="ck"><strong>Pomoc i wsparcie</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Upewnijmy się, że tylko twoi znajomi widzą to, co publikujesz. <strong>Otwórz Facebooka.</strong> <em>(Wersja ćwiczebna. To nie prawdziwa aplikacja.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Dotknij Menu</strong> w prawym dolnym rogu.', hints: {'tab-friends': 'Zaproszeniami do grona znajomych zajmiemy się za chwilę. Najpierw dotknij Menu.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Dotknij Ustawienia i prywatność</strong>.'},
        {screen: c => list(p, 'Ustawienia', [{caption: 'Odbiorcy i widoczność'}, {id: 'posts', label: 'Posty', sub: 'Kto może widzieć twoje przyszłe posty: ' + (c.audience || 'Publiczny')}, {label: 'Szczegóły profilu'}, {label: 'Jak ludzie cię znajdują i kontaktują się z tobą'},
            {caption: 'Twoja aktywność'}, {label: 'Dziennik aktywności'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Kto może widzieć twoje przyszłe posty?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Publiczny<small>Każdy na Facebooku i poza nim</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Znajomi<small>Twoi znajomi na Facebooku</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tylko ja</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Twoje posty są ustawione na <strong>Publiczny</strong>: każdy na świecie może je zobaczyć. <strong>Dotknij Posty.</strong>'},
        {screen: c => list(p, 'Ustawienia', [{caption: 'Odbiorcy i widoczność'}, {label: 'Posty', sub: 'Kto może widzieć twoje przyszłe posty: Publiczny'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Kto może widzieć twoje przyszłe posty?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Publiczny<small>Każdy na Facebooku i poza nim</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Znajomi<small>Twoi znajomi na Facebooku</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Tylko ja</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Znajomi'; }, say: '<strong>Dotknij Znajomi.</strong>',
         hints: {'aud-public': 'Publiczny to było dotychczasowe ustawienie. Dotknij Znajomi.', 'aud-me': 'Tylko ja oznacza, że nikt inny nie widzi twoich postów. Dotknij Znajomi.'}},
        {screen: c => list(p, 'Ustawienia', [{caption: 'Odbiorcy i widoczność'}, {label: 'Posty', sub: 'Kto może widzieć twoje przyszłe posty: Znajomi ⟦check⟧'}, {id: 'back-feed', label: '‹ Wróć do Facebooka'}]),
         target: 'back-feed', say: 'Gotowe. Teraz <strong>dotknij Wróć do Facebooka</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Masz zaproszenie do grona znajomych. <strong>Dotknij Znajomi.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Zaproszenie do grona znajomych od „Jean Smith”. Ale Jean już jest twoją znajomą (widać ją w twoim kanale). Co się dzieje?', options: [
            {t: 'Prawdopodobnie to kopia profilu Jean, stworzona przez oszusta', ok: true, why: 'Tak. Oszuści kopiują czyjeś imię i zdjęcie, a potem piszą do jego znajomych z prośbą o pieniądze. Prawdziwa Jean jest już twoją znajomą.'},
            {t: 'Jean pewnie ma drugie konto', why: 'Możliwe, ale o wiele bardziej prawdopodobne, że to kopia stworzona przez oszusta: to konto powstało 2 dni temu. Sprawdź u Jean telefonicznie.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Dotknij Usuń</strong>, żeby odrzucić zaproszenie.', hints: {'confirm-jean': 'Nie potwierdzaj skopiowanego profilu. Dotknij Usuń.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Brawo!</strong> Twoje posty są tylko dla znajomych i uniknąłeś fałszywego profilu. Powiedz Jean, żeby mogła go zgłosić. Uważaj też na kupujących z Marketplace, którzy chcą zapłacić „przez kuriera” albo proszą o kody wysłane na twój telefon.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Szukaj tutaj'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Dworzec autobusowy i kolejowy, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Szpital, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Kościół, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Dworzec autobusowy i kolejowy · 25 mil</small><button type="button" class="ce co" data-tap="directions">Trasa</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min (25 mil)</strong><small>Najszybsza trasa przez A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Spacer 4 min do <strong>Bridlington Bus Station</strong>, stanowisko 3</li>
                <li>⟦bus⟧ <strong>121</strong> w kierunku Hull · 10:15 · <b class="ahy">Punktualnie</b></li><li>Wysiądź na <strong>Hull Paragon Interchange</strong> (24 przystanki)</li></ol>
                <button type="button" class="ce co" data-tap="start">Start</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Mapy mogą zaplanować podróż autobusem, z aktualnymi godzinami. Jedźmy do Hull autobusem. <strong>Otwórz Mapy.</strong>' + (p === 'ios' ? ' <em>(Mapy Google działają tak samo, jeśli wolisz je.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Dotknij pola wyszukiwania</strong> u góry.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Wpisaliśmy „Hull interchange”. <strong>Dotknij Hull Paragon Interchange</strong>, czyli dworca autobusowego.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Dotknij Trasa.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Najpierw pokazuje jazdę samochodem. <strong>Dotknij autobusu</strong> ⟦bus⟧, żeby zobaczyć transport publiczny.', hints: {'mode-walk': 'Osiem godzin! Dotknij zamiast tego autobusu.', 'mode-car': 'To jazda samochodem. Dotknij autobusu.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Oto autobusy, najbliższy na początku. „Punktualnie” oznacza dane na żywo. <strong>Dotknij 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Gdzie wsiadasz do autobusu?', options: [
            {t: 'Bridlington Bus Station, stanowisko 3', ok: true, why: 'Tak. Mapy mówią, dokąd iść pieszo, którym autobusem jechać i gdzie wysiąść.'},
            {t: 'Hull Paragon Interchange', why: 'Tam wysiadasz. Wsiadasz na Bridlington Bus Station, stanowisko 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Brawo!</strong> Dotknij <strong>Start</strong> podczas prawdziwej podróży, a Mapy powiedzą ci, kiedy zbliża się twój przystanek. Z biletem miesięcznym po prostu pokazujesz go kierowcy jak zwykle. <em>(Tylko godziny ćwiczeniowe: prawdziwe sprawdź na miejscu.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Alarm SOS</strong> dzwoni za ciebie pod 999 i wysyła SMS-em twoją lokalizację wybranym osobom. Sprawdźmy, czy jest gotowy. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Dotknij Alarm SOS.</strong>', hint: 'Jest w trzeciej grupie, z czerwoną ikoną.'},
        {screen: c => list(p, 'Alarm SOS', [{label: 'Zadzwoń przez przytrzymanie i puszczenie', toggle: true, sub: 'Przytrzymaj przycisk boczny i przycisk głośności, a potem puść.'},
            {id: 'five', label: 'Zadzwoń przez 5 naciśnięć przycisku', toggle: !!c.five, sub: 'Naciśnij szybko przycisk boczny 5 razy.'}, {caption: ' '},
            {id: 'contacts', label: 'Skonfiguruj kontakty alarmowe w aplikacji Zdrowie'}, {label: 'Wykrywanie wypadku', toggle: true, sub: 'Dzwoni pod 999 po poważnym wypadku samochodowym.'}], {back: 'Ustawienia'}),
         target: 'five', action: c => { c.five = true; }, say: 'Pięć naciśnięć przycisku bocznego łatwo zapamiętać w panice. <strong>Włącz Zadzwoń przez 5 naciśnięć przycisku.</strong>'},
        {screen: c => list(p, 'Alarm SOS', [{label: 'Zadzwoń przez przytrzymanie i puszczenie', toggle: true}, {label: 'Zadzwoń przez 5 naciśnięć przycisku', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Skonfiguruj kontakty alarmowe w aplikacji Zdrowie'}], {back: 'Ustawienia', overlay: c.pick ? sheet('Dodaj kontakt alarmowy', [['pick-sarah', 'Sarah', 'Córka · 07700 900333'], ['pick-dave', 'Dave', 'Znajomy']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Teraz wybierz, kto dostanie SMS-a z twoją lokalizacją. <strong>Dotknij Skonfiguruj kontakty alarmowe.</strong>'},
        {screen: () => list(p, 'Alarm SOS', [{label: 'Zadzwoń przez 5 naciśnięć przycisku', toggle: true}], {back: 'Ustawienia', overlay: sheet('Dodaj kontakt alarmowy', [['pick-sarah', 'Sarah', 'Córka · 07700 900333'], ['pick-dave', 'Dave', 'Znajomy']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Dotknij Sarah</strong>, swojej córki.', hints: {'pick-dave': 'W tym ćwiczeniu wybierz Sarah.'}},
        {screen: () => list(p, 'Alarm SOS', [{label: 'Zadzwoń przez 5 naciśnięć przycisku', toggle: true}, {caption: 'KONTAKTY ALARMOWE'}, {label: 'Sarah', sub: 'Córka'}], {back: 'Ustawienia'}),
         question: {q: 'Upadłeś i nie możesz porządnie sięgnąć do ekranu telefonu. Co robisz?', options: [
            {t: 'Naciskam szybko przycisk boczny 5 razy', ok: true, why: 'Tak. Zaczyna się odliczanie, a potem dzwoni pod 999 i wysyła Sarah SMS-a z informacją, gdzie jesteś.'},
            {t: 'Odblokowuję telefon i szukam aplikacji Telefon', why: 'To za wolne w nagłym wypadku. Pięć naciśnięć przycisku bocznego działa nawet wtedy, gdy telefon jest zablokowany.'}]}},
        {screen: () => list(p, 'Alarm SOS', [{label: 'Zadzwoń przez 5 naciśnięć przycisku', toggle: true}, {caption: 'KONTAKTY ALARMOWE'}, {label: 'Sarah', sub: 'Córka'}], {back: 'Ustawienia'}), done: true,
         say: '<strong>Brawo!</strong> Alarm SOS jest gotowy, a Sarah dowie się, gdzie jesteś. Jeśli naciśniesz go przez pomyłkę, po prostu dotknij Stop podczas odliczania.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Alarm SOS</strong> dzwoni za ciebie pod 999 i wysyła SMS-em twoją lokalizację wybranym osobom. Sprawdźmy, czy jest gotowy. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Dotknij Bezpieczeństwo i alarmy.</strong> <em>W telefonie Samsung to też Bezpieczeństwo i alarmy.</em>', hint: 'Przewiń w dół: jest blisko dołu.'},
        {screen: () => list(p, 'Bezpieczeństwo i alarmy', [{id: 'medical', label: 'Informacje medyczne'}, {id: 'contacts-ec', label: 'Kontakty alarmowe'}, {id: 'sos', label: 'Alarm SOS', sub: 'Wyłączone'}, {label: 'Wykrywanie wypadku samochodowego'}]),
         target: 'sos', say: 'Alarm SOS jest <strong>wyłączony</strong>. <strong>Dotknij Alarm SOS.</strong>'},
        {screen: c => list(p, 'Alarm SOS', [{id: 'sos-toggle', label: 'Używaj Alarmu SOS', toggle: !!c.sosOn, sub: 'Naciśnij przycisk zasilania 5 razy lub więcej, aby uruchomić działania alarmowe.'}, {label: 'Udostępniaj informacje kontaktom alarmowym', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Dotknij Używaj Alarmu SOS</strong>, żeby to włączyć.'},
        {screen: () => list(p, 'Bezpieczeństwo i alarmy', [{id: 'medical', label: 'Informacje medyczne'}, {id: 'contacts-ec', label: 'Kontakty alarmowe', sub: 'Brak'}, {label: 'Alarm SOS', sub: 'Włączona'}]),
         target: 'contacts-ec', say: 'Teraz wybierz, kto dostanie SMS-a z twoją lokalizacją. <strong>Dotknij Kontakty alarmowe.</strong>'},
        {screen: c => list(p, 'Kontakty alarmowe', [{id: 'add', label: '＋ Dodaj kontakt'}], {overlay: c.pick ? sheet('Wybierz kontakt', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Dotknij Dodaj kontakt.</strong>'},
        {screen: () => list(p, 'Kontakty alarmowe', [{label: '＋ Dodaj kontakt'}], {overlay: sheet('Wybierz kontakt', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Dotknij Sarah</strong>, swojej córki.', hints: {'pick-dave': 'W tym ćwiczeniu wybierz Sarah.'}},
        {screen: () => list(p, 'Kontakty alarmowe', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Dodaj kontakt'}]),
         question: {q: 'Upadłeś i nie możesz porządnie sięgnąć do ekranu telefonu. Co robisz?', options: [
            {t: 'Naciskam szybko przycisk zasilania 5 razy', ok: true, why: 'Tak. Zaczyna się odliczanie, a potem dzwoni pod 999 i udostępnia Sarah, gdzie jesteś.'},
            {t: 'Odblokowuję telefon i szukam aplikacji Telefon', why: 'To za wolne w nagłym wypadku. Pięć naciśnięć przycisku zasilania działa nawet wtedy, gdy telefon jest zablokowany.'}]}},
        {screen: () => list(p, 'Kontakty alarmowe', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Brawo!</strong> Alarm SOS jest włączony, a Sarah dowie się, gdzie jesteś. Jeśli naciśniesz go przez pomyłkę, dotknij Anuluj podczas odliczania.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Alerty alarmowe ostrzegają o niebezpieczeństwie w pobliżu, na przykład o poważnej powodzi. Ktoś wyłączył jeden z nich w tym telefonie. Naprawmy to. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Dotknij Powiadomienia.</strong>'},
            {screen: c => list(p, 'Powiadomienia', [{label: 'Pokazuj podglądy', value: 'Zawsze'}, {caption: 'STYL POWIADOMIEŃ'}, {label: 'Wiadomości', sub: 'Banery, dźwięki, plakietki'}, {label: 'WhatsApp', sub: 'Banery, dźwięki, plakietki'},
                {caption: 'ALERTY RZĄDOWE'}, {label: 'Alerty ekstremalne', toggle: true}, {id: 'severe', label: 'Alerty poważne', toggle: !!c.severe}, {label: 'Alerty testowe', toggle: false}], {back: 'Ustawienia'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Alerty rządowe są na samym dole. <strong>Alerty poważne</strong> są wyłączone. <strong>Dotknij ich, żeby włączyć.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Dotknij Bezpieczeństwo i alarmy.</strong>', hint: 'Jest blisko dołu listy.'},
            {screen: () => list(p, 'Bezpieczeństwo i alarmy', [{label: 'Informacje medyczne'}, {label: 'Alarm SOS'}, {id: 'wea', label: 'Bezprzewodowe alerty alarmowe'}, {label: 'Alerty o nieznanych lokalizatorach'}]),
             target: 'wea', say: '<strong>Dotknij Bezprzewodowe alerty alarmowe.</strong> <em>W niektórych telefonach nazywa się to Alerty alarmowe.</em>'},
            {screen: c => list(p, 'Bezprzewodowe alerty alarmowe', [{label: 'Zezwalaj na alerty', toggle: true}, {label: 'Zagrożenia ekstremalne', toggle: true}, {id: 'severe', label: 'Poważne zagrożenia', toggle: !!c.severe}, {label: 'Alerty testowe', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Poważne zagrożenia</strong> są wyłączone. <strong>Dotknij ich, żeby włączyć.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Alert alarmowy: Poważny</strong><p>W pobliżu promenady spodziewane są poważne powodzie. Przejdź w wyżej położone miejsce. Więcej na gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'Tak wygląda alert. Wydaje głośny dźwięk syreny przez około 10 sekund, nawet gdy telefon jest wyciszony. <strong>Dotknij OK.</strong> <em>(Tylko ćwiczenie.)</em>'},
        {screen: () => home(p), question: {q: 'Alert przychodzi, gdy prowadzisz samochód. Co powinieneś zrobić?', options: [
            {t: 'Zatrzymać się w bezpiecznym miejscu, zanim go przeczytam', ok: true, why: 'Tak. Nigdy nie czytaj telefonu podczas jazdy. Zatrzymaj się bezpiecznie, a potem przeczytaj.'},
            {t: 'Przeczytać od razu podczas jazdy', why: 'Nigdy nie czytaj telefonu podczas jazdy. Najpierw znajdź bezpieczne miejsce, żeby się zatrzymać.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Telefon będzie teraz ostrzegać cię o poważnym niebezpieczeństwie w pobliżu. Prawdziwe alerty nigdy nie proszą o dane osobowe ani pieniądze: jeśli któryś prosi, to oszustwo.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Trzy rzeczy, które sprawiają, że skradziony telefon jest dla złodzieja o wiele mniej przydatny. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Dotknij Face ID i kod.</strong> <em>Na prawdziwym iPhonie za chwilę wpiszesz swój kod.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Przewiń w dół i <strong>dotknij Ochrona skradzionego urządzenia</strong>.'},
            {screen: c => list(p, 'Ochrona skradzionego urządzenia', [{id: 'sdp', label: 'Ochrona skradzionego urządzenia', toggle: !!c.sdp, sub: 'Poza domem zmiana kodu lub konta Apple wymaga Face ID i godzinnego oczekiwania.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'To powstrzymuje złodzieja, który widział, jak wpisujesz kod, przed zablokowaniem ci dostępu. <strong>Włącz to.</strong>'},
            {screen: () => list(p, 'Ochrona skradzionego urządzenia', [{label: 'Ochrona skradzionego urządzenia', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Dalej: ukryj wiadomości na ekranie blokady. <strong>Dotknij ‹ Face ID</strong>, żeby wrócić.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Dotknij Powiadomienia.</strong>'},
            {screen: c => list(p, 'Powiadomienia', [{id: 'previews', label: 'Pokazuj podglądy', value: c.previews || 'Zawsze'}, {label: 'Udostępnianie ekranu', value: 'Powiadomienia wyłączone'}], {back: 'Ustawienia',
                overlay: c.pickPrev ? sheet('Pokazuj podglądy', [['prev-always', 'Zawsze'], ['prev-unlocked', 'Gdy odblokowany', 'Zalecane'], ['prev-never', 'Nigdy']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Teraz każdy może czytać twoje wiadomości, także kody bezpieczeństwa, bez odblokowywania telefonu. <strong>Dotknij Pokazuj podglądy.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Dotknij Google.</strong>', hint: 'Jest blisko dołu listy.'},
            {screen: () => list(p, 'Google', [{label: 'Zarządzaj kontem Google'}, {id: 'all-services', label: 'Wszystkie usługi'}, {label: 'Kopia zapasowa'}]), target: 'all-services', say: '<strong>Dotknij Wszystkie usługi.</strong>'},
            {screen: () => list(p, 'Wszystkie usługi', [{caption: 'Bezpieczeństwo osobiste i urządzenia'}, {id: 'theft', label: 'Ochrona przed kradzieżą'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Dotknij Ochrona przed kradzieżą.</strong>'},
            {screen: c => list(p, 'Ochrona przed kradzieżą', [{id: 'tdl', label: 'Blokada po wykryciu kradzieży', toggle: !!c.tdl, sub: 'Blokuje ekran, gdy wykryje, że ktoś wyrywa ci telefon i ucieka.'}, {label: 'Blokada urządzenia offline', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Włącz Blokadę po wykryciu kradzieży.</strong> Jeśli ktoś chwyci telefon i ucieknie, zablokuje się sam.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Dalej: ukryj wiadomości na ekranie blokady. Wracając do Ustawień, <strong>dotknij Powiadomienia</strong>.'},
            {screen: c => list(p, 'Powiadomienia', [{id: 'previews', label: 'Powiadomienia na ekranie blokady', sub: c.previews || 'Pokaż całą zawartość'}, {label: 'Historia powiadomień'}], {
                overlay: c.pickPrev ? sheet('Powiadomienia na ekranie blokady', [['prev-always', 'Pokaż całą zawartość'], ['prev-unlocked', 'Ukryj poufną zawartość', 'Zalecane'], ['prev-never', 'Nie pokazuj żadnych powiadomień']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Teraz każdy może czytać twoje wiadomości, także kody bezpieczeństwa, bez odblokowywania telefonu. <strong>Dotknij Powiadomienia na ekranie blokady.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Powiadomienia', [{label: 'Pokazuj podglądy', value: 'Zawsze'}], {back: 'Ustawienia', overlay: sheet('Pokazuj podglądy', [['prev-always', 'Zawsze'], ['prev-unlocked', 'Gdy odblokowany', 'Zalecane'], ['prev-never', 'Nigdy']])})
                : list(p, 'Powiadomienia', [{label: 'Powiadomienia na ekranie blokady', sub: 'Pokaż całą zawartość'}], {overlay: sheet('Powiadomienia na ekranie blokady', [['prev-always', 'Pokaż całą zawartość'], ['prev-unlocked', 'Ukryj poufną zawartość', 'Zalecane'], ['prev-never', 'Nie pokazuj żadnych powiadomień']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Gdy odblokowany' : 'Ukryj poufną zawartość'}.</strong>`, hints: {'prev-always': 'Tak było. Wybierz zalecane.', 'prev-never': 'To ukrywa je całkowicie, co może być uciążliwe. Wybierz zalecane.'}},
        {screen: () => home(p), target: 'phone', say: 'Na koniec znajdź numer IMEI telefonu. Twoja sieć potrzebuje go, żeby zablokować skradziony telefon. <strong>Otwórz aplikację Telefon.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'Na klawiaturze <strong>wpisz *#06#</strong> (gwiazdka, krzyżyk, zero, sześć, krzyżyk).', hint: 'Zacznij od klawisza gwiazdki *, w lewym dolnym rogu.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Informacje o urządzeniu', 'IMEI: 35 209900 176148 1 (numer ćwiczebny)', [['ok', 'OK']])}),
         target: 'ok', say: 'Ten długi numer to twój <strong>IMEI</strong>. Na prawdziwym telefonie zapisz go w bezpiecznym miejscu (nie w telefonie!). <strong>Dotknij OK.</strong>'},
        {screen: () => home(p), question: {q: 'Ktoś wyrwał ci telefon. Do kogo dzwonisz najpierw?', options: [
            {t: 'Do banku, z cudzego telefonu', ok: true, why: 'Tak. Złodzieje biorą się najpierw za aplikacje bankowe. Potem zablokuj telefon online, zadzwoń do swojej sieci i zgłoś sprawę pod 101.'},
            {t: 'Poczekać i zobaczyć, czy się znajdzie', why: 'Liczy się szybkość. Zadzwoń od razu do banku, potem zablokuj telefon i zadzwoń do swojej sieci.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Twój telefon jest o wiele trudniejszy do użycia dla złodzieja i wiesz, gdzie znaleźć IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'LOKALIZATOR' : 'ALERT O LOKALIZATORZE', title: p === 'ios' ? 'AirTag przemieszcza się razem z tobą' : 'Nieznany lokalizator podróżuje z tobą',
            text: '<br>Właściciel może zobaczyć lokalizację tego przedmiotu.'}),
         target: 'alert', say: 'Telefon zauważył lokalizator, który nie jest twój i przemieszcza się razem z tobą. Spokojnie: często jest to przez pomyłkę lokalizator kogoś z rodziny. <strong>Dotknij alertu.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Nieznany AirTag' : 'Nieznany lokalizator', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Z tobą od <strong>10:12</strong> dzisiaj, w 4 miejscach.</p>
            <button type="button" class="ce co" data-tap="play">Odtwórz dźwięk</button>
            <button type="button" class="cp" data-tap="learn">Dowiedz się więcej o tym ${p === 'ios' ? 'AirTag' : 'Lokalizator'}</button>
            <button type="button" class="cp" data-tap="disable">Instrukcja wyłączania</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Mapa pokazuje, gdzie był razem z tobą. <strong>Dotknij Odtwórz dźwięk</strong>, żeby go znaleźć.'},
        {screen: () => app(p, p === 'ios' ? 'Nieznany AirTag' : 'Nieznany lokalizator', '<p class="cf">⟦volume-2⟧ <strong>Odtwarzanie dźwięku…</strong><br>Nasłuchuj ćwierkającego dźwięku.</p>', {color: '#fff'}),
         question: {q: 'Słyszysz cichy ćwierk. Gdzie powinieneś szukać?', options: [
            {t: 'W torbach, kieszeniach płaszcza, samochodzie i we wszystkim, co pożyczyłeś', ok: true, why: 'Tak. Lokalizatory są małe, mniej więcej wielkości dużej monety, i często ukryte w podszewkach, kieszeniach lub samochodach.'},
            {t: 'Nigdzie, po prostu zignorować', why: 'Warto go znaleźć. Sprawdź torby, kieszenie i samochód: może to po prostu lokalizator kogoś z rodziny.'}]}},
        {screen: c => app(p, 'Znaleziono lokalizator', `<p class="cf">Przyłóż górną część telefonu do lokalizatora, żeby zobaczyć o nim więcej.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Przyłóż do lokalizatora</button>`, {color: '#fff'}),
         target: 'scan', say: 'Znalazłeś go w podszewce płaszcza. <strong>Dotknij Przyłóż do lokalizatora</strong>, żeby zobaczyć, do kogo należy.'},
        {screen: () => app(p, 'O tym lokalizatorze', '<p class="cf"><strong>Nie w trybie zgubienia</strong><br>Numer seryjny: P4R7-ACT1CE<br>Dane właściciela są udostępniane tylko policji.</p>', {color: '#fff'}),
         question: {q: 'To nie lokalizator kogoś z rodziny i martwisz się, że ktoś go ukrył, żeby cię śledzić. Co robisz?', options: [
            {t: 'Zachowuję go bezpiecznie i zanoszę na policję (albo dzwonię pod 999, jeśli jestem w niebezpieczeństwie)', ok: true, why: 'Tak. Nie wyrzucaj go: policja może ustalić jego właściciela. National Stalking Helpline działa pod numerem 0808 802 0300.'},
            {t: 'Wyrzucam do kosza', why: 'Może to być dowód, a policja może ustalić właściciela. Zachowaj go i zanieś na policję albo zadzwoń pod 999, jeśli jesteś w niebezpieczeństwie.'}]}},
        {screen: () => app(p, 'O tym lokalizatorze', '<p class="cf">Pomoc: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (całodobowo) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Brawo!</strong> Wiesz, jak znaleźć lokalizator i co zrobić. ' + (p === 'android' ? 'Sprawdź, czy alerty są włączone w <strong>Ustawienia > Bezpieczeństwo i alarmy > Alerty o nieznanych lokalizatorach</strong>.' : 'iPhone\'y same sprawdzają, czy w pobliżu nie ma lokalizatorów.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Jesteś na ścieżce na klifie i ktoś upadł. Nie ma adresu. Gdy dzwonisz pod 999, większość telefonów wysyła twoją lokalizację automatycznie, ale pomagają też trzy słowa. <strong>Otwórz what3words.</strong> <em>(Wersja ćwiczebna.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Niebieska kropka to ty. Każdy kwadrat o boku 3 metrów ma własne trzy słowa. Twoje to <strong>puffin.chalk.lantern</strong>. Poczekaj chwilę, aż kropka się ustabilizuje, a potem <strong>dotknij I\'ve got my 3 words</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Teraz zadzwoń pod 999. <strong>Otwórz aplikację Telefon.</strong> <em>(Tylko ćwiczenie: nigdy nie dzwoń pod 999 w ramach testu.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Wpisz 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Dotknij zielonego przycisku połączenia.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Połączenie alarmowe · 0:08</small></div>
            <p class="hi">„Numer alarmowy, jaka służba? … Pogotowie. Jakie jest dokładne miejsce zdarzenia?”</p>${homeIndicator(p)}</div>`,
         question: {q: 'Dyspozytor pyta, gdzie jesteś. Co mówisz?', options: [
            {t: '„Jestem na ścieżce na klifie. Mój adres what3words to puffin, chalk, lantern.”', ok: true, why: 'Tak. Powiedz własnymi słowami, gdzie jesteś, a potem podaj trzy słowa. Przeliteruj każde, jeśli poproszą.'},
            {t: '„Nie wiem, gdzieś blisko morza”', why: 'Będą próbować cię znaleźć, ale trzy słowa wskazują twoje miejsce z dokładnością do 3 metrów. Odczytaj je z aplikacji.'}]}},
        {screen: () => home(p), question: {q: 'Twój znajomy jest głuchy i nie może dzwonić. Jak może skontaktować się z numerem 999?', options: [
            {t: 'Zarejestrować się teraz do alarmowych SMS-ów (wysłać SMS-a „register” na 999) albo użyć aplikacji 999 BSL', ok: true, why: 'Tak. Alarmowy SMS działa tylko po wcześniejszej rejestracji. Aplikacja 999 BSL łączy z tłumaczem języka migowego.'},
            {t: 'Nie może', why: 'Może. Zarejestruj się do alarmowych SMS-ów, wysyłając SMS-a „register” na 999, albo użyj bezpłatnej aplikacji 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Pamiętaj: powiedz, gdzie jesteś, a potem podaj swoje trzy słowa. Aplikacja what3words działa bez zasięgu przy znajdowaniu twoich słów, ale do zadzwonienia zasięg jest potrzebny.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Nie odpowiada</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Telefon się zawiesił: dotyk nic nie robi i nie da się go wyłączyć normalnie. Czy to duży problem?', options: [
            {t: 'Zwykle nie. „Wymuszone ponowne uruchomienie” to naprawia i nic nie tracisz', ok: true, why: 'Zgadza się. Wymuszone ponowne uruchomienie jest jak wyłączenie z prądu. Twoje zdjęcia i wiadomości są bezpieczne.'},
            {t: 'Tak, jest zepsuty', why: 'Zwykle nie! Wymuszone ponowne uruchomienie naprawia większość zawieszonych telefonów i nic nie tracisz.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'W iPhonie: <strong>naciśnij i puść zwiększanie głośności</strong>, potem <strong>naciśnij i puść zmniejszanie głośności</strong>, a potem <strong>naciśnij i przytrzymaj przycisk boczny</strong>, aż pojawi się logo Apple (około 10 sekund). Tutaj dotknij ich w tej kolejności.'
            : 'W większości telefonów z Androidem: <strong>naciśnij i przytrzymaj razem przycisk zasilania i zmniejszanie głośności</strong> przez około 10 sekund, aż telefon uruchomi się ponownie. Tutaj dotknij zasilania, a potem zmniejszania głośności. <em>(Google Pixel: przytrzymaj tylko przycisk zasilania przez 30 sekund.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Najpierw zwiększanie głośności.' : 'Zacznij od przycisku zasilania.', side: 'Przycisk boczny jest ostatni, po obu przyciskach głośności.'},
         hint: p === 'ios' ? 'Zwiększanie głośności, potem zmniejszanie głośności, a potem przycisk boczny.' : 'Zasilanie, potem zmniejszanie głośności.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Pojawiło się logo. Co teraz?', options: [
            {t: 'Puścić przyciski i poczekać, aż telefon się uruchomi', ok: true, why: 'Tak. To trwa minutę. Może być trzeba raz wpisać kod.'},
            {t: 'Dalej naciskać wszystkie przyciski', why: 'Puść przyciski, gdy pojawi się logo, i daj telefonowi minutę na uruchomienie.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Brawo!</strong> Telefon uruchomił się ponownie. Jeśli nadal się zawiesza, sprawdź aktualizacje i zwolnij miejsce. Restartowanie telefonu raz w tygodniu sprawia, że działa płynnie.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Włączona' : 'Wyłączone'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Wyłączone' : (ctx.signal ? 'Wł. · 4G' : 'Brak usługi')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Wyłączone' : 'Ekran główny'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Przesuń w górę, aby zamknąć' : 'Zamknij'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Brak usługi</span>'), target: 'pull-down',
         say: 'Telefon pokazuje <strong>Brak usługi</strong>, choć rano działał. Szybki sposób to włączyć i wyłączyć tryb samolotowy, co sprawia, że łączy się od nowa. ' + (p === 'ios' ? '<strong>Przesuń palcem w dół od prawego górnego rogu</strong> (albo dotknij paska).' : '<strong>Przesuń palcem w dół od góry ekranu</strong> (albo dotknij paska).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Dotknij Tryb samolotowy</strong>, żeby go włączyć. Wszystko bezprzewodowe się wyłącza.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Poczekaj około 10 sekund… potem <strong>dotknij Tryb samolotowy jeszcze raz</strong>, żeby go wyłączyć.'},
        {screen: c => quickPanel(p, c), question: {q: 'Dane mobilne wróciły na 4G. Kiedy jeszcze przydaje się tryb samolotowy?', options: [
            {t: 'W samolocie albo za granicą, żeby uniknąć opłat roamingowych (Wi-Fi nadal możesz włączyć)', ok: true, why: 'Tak. Możesz włączyć Wi-Fi z powrotem przy włączonym trybie samolotowym, żeby korzystać z Wi-Fi w hotelu lub na statku.'},
            {t: 'Do ładowania telefonu', why: 'Ładuje się trochę szybciej, ale służy głównie do lotów i unikania opłat roamingowych za granicą.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Brawo!</strong> Jeśli tryb samolotowy nie pomaga, uruchom telefon ponownie. Nadal brak usługi? Sprawdź na stronie swojej sieci, czy w twojej okolicy nie ma awarii.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · teraz</strong><span>🎁 Czekają na ciebie DARMOWE życia! Wróć i graj! 🎉</span></button>',
         target: 'settings', say: 'Gra bez przerwy brzęczy bezsensownymi wiadomościami. Powiadomienia możesz wyłączyć dla każdej aplikacji. <strong>Dotknij Ustawienia</strong>, a nie wiadomości.', hints: {notif: 'To otwiera grę. Dotknij zamiast tego Ustawienia.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Dotknij Powiadomienia.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Powiadomienia', [{label: 'Pokazuj podglądy', value: 'Gdy odblokowany'}, {caption: 'STYL POWIADOMIEŃ'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Banery, dźwięki, plakietki'}, {label: 'Wiadomości', sub: 'Banery, dźwięki, plakietki'}, {label: 'WhatsApp', sub: 'Banery, dźwięki, plakietki'}], {back: 'Ustawienia'})
            : list(p, 'Powiadomienia', [{id: 'app-notifs', label: 'Powiadomienia aplikacji'}, {id: 'history', label: 'Historia powiadomień'}, {label: 'Powiadomienia na ekranie blokady'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Dotknij Bubble Pop.</strong>' : '<strong>Dotknij Powiadomienia aplikacji.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Powiadomienia aplikacji', [{label: 'Wiadomości', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Dotknij przełącznika obok Bubble Pop</strong>, żeby wyłączyć jej powiadomienia.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Zezwalaj na powiadomienia', toggle: !c.off}], {back: 'Powiadomienia'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Wyłącz Zezwalaj na powiadomienia.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Powiadomienia', [{label: 'Powiadomienia aplikacji'}, {id: 'history', label: 'Historia powiadomień', sub: 'Wyłączone'}]), target: 'history',
             say: 'Przydatny dodatek: jeśli kiedykolwiek przez pomyłkę odrzucisz wiadomość, Historia powiadomień przechowuje jej kopię. <strong>Dotknij Historia powiadomień.</strong>'},
            {screen: c => list(p, 'Historia powiadomień', [{id: 'hist-toggle', label: 'Używaj historii powiadomień', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Włącz to.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Których aplikacji powiadomienia warto zostawić?', options: [
            {t: 'Wiadomości, połączeń, WhatsAppa, banku i wszystkiego, o czym chcesz wiedzieć od razu', ok: true, why: 'Tak. Zostaw te ważne, a wyłącz gry, sklepy i wszystko, co tylko się narzuca.'},
            {t: 'Wyłączyć wszystkie', why: 'Przegapiłbyś wiadomości i połączenia! Zostaw te ważne, a wyłącz gry i aplikacje zakupowe.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Brawo!</strong> Bubble Pop już ci nie przeszkodzi. ' + (p === 'ios' ? 'Jeśli przez pomyłkę odrzucisz wiadomość, przesuń palcem w górę od środka ekranu blokady, żeby zobaczyć wcześniejsze.' : 'A historia powiadomień przechowuje kopię wszystkiego, co odrzucisz.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Do zobaczenia w ducking garden centre x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Wiadomość tekstowa</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Wpisałeś „Dunnington garden centre”, a telefon to zmienił. Dlaczego?', options: [
            {t: 'Autokorekta zgadła złe słowo', ok: true, why: 'Tak. Autokorekta zamienia słowa, których nie zna. Możesz ją wyłączyć albo uczyć nowych słów.'},
            {t: 'Telefon jest zepsuty', why: 'To tylko autokorekta, która zgaduje. Możesz ją wyłączyć albo uczyć słów.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Dotknij Ogólne.</strong>'},
            {screen: () => list(p, 'Ogólne', [{label: 'Informacje'}, {label: 'Aktualizacja oprogramowania'}, {id: 'keyboard', label: 'Klawiatura'}, {label: 'Język i region'}], {back: 'Ustawienia'}), target: 'keyboard', say: '<strong>Dotknij Klawiatura.</strong>'},
            {screen: c => list(p, 'Klawiatury', [{id: 'replace', label: 'Zamiana tekstu'}, {caption: 'WSZYSTKIE KLAWIATURY'}, {label: 'Automatyczne wielkie litery', toggle: true}, {id: 'ac', label: 'Autokorekta', toggle: !c.acOff}, {label: 'Przewidywanie tekstu', toggle: true}], {back: 'Ogólne'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Wyłącz Autokorektę.</strong> Błędy pisowni nadal są podkreślane na czerwono, więc możesz je poprawić sam.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Dotknij System.</strong> Jest na dole.'},
            {screen: () => list(p, 'System', [{id: 'keyboard', label: 'Klawiatura'}, {label: 'Języki'}, {label: 'Data i godzina'}]), target: 'keyboard', say: '<strong>Dotknij Klawiatura.</strong>'},
            {screen: () => list(p, 'Klawiatura', [{id: 'gboard', label: 'Gboard', sub: 'Klawiatura ekranowa'}]), target: 'gboard', say: '<strong>Dotknij Gboard.</strong> <em>W telefonie Samsung to Klawiatura Samsung > Inteligentne pisanie.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferencje'}, {id: 'correction', label: 'Poprawianie tekstu'}, {label: 'Pisanie przesuwane'}]), target: 'correction', say: '<strong>Dotknij Poprawianie tekstu.</strong>'},
            {screen: c => list(p, 'Poprawianie tekstu', [{label: 'Pokazuj pasek podpowiedzi', toggle: true}, {id: 'ac', label: 'Autokorekta', toggle: !c.acOff}, {label: 'Sprawdzanie pisowni', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Wyłącz Autokorektę.</strong> Błędy pisowni nadal są podkreślane na czerwono, więc możesz je poprawić sam.'},
        ]),
        {screen: () => home(p), question: {q: 'Wolisz zostawić autokorektę, ale ona zawsze zmienia „Dunnington”. Co jeszcze możesz zrobić?', options: [
            {t: 'Dodać słowo do słownika telefonu, żeby się go nauczył', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Użyj Zamiany tekstu w tych samych ustawieniach klawiatury.' : 'Dotknij słowa na pasku podpowiedzi i wybierz dodanie go do słownika.')},
            {t: 'Nic, po prostu to znosić', why: 'Możesz go tego nauczyć: ' + (p === 'ios' ? 'dodaj słowo w Klawiatura > Zamiana tekstu.' : 'dotknij słowa w podpowiedziach i dodaj je do słownika.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Koniec niespodziewanych zamian słów. W każdej chwili możesz ją włączyć z powrotem w tym samym miejscu.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Masz nowe bezprzewodowe słuchawki. Co robisz najpierw?', options: [
            {t: 'Wprowadzam je w „tryb parowania” (zwykle trzeba przytrzymać przycisk, aż zamiga lampka)', ok: true, why: 'Tak. Tryb parowania pozwala telefonowi je znaleźć. Instrukcja w pudełku podaje dokładnie jak.'},
            {t: 'Podłączam je do telefonu kablem', why: 'Bezprzewodowe słuchawki łączą się przez Bluetooth. Najpierw wprowadź je w tryb parowania, zwykle przytrzymując przycisk, aż zamiga lampka.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Lampka w słuchawkach miga. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Dotknij Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Dotknij Połączone urządzenia.</strong>'},
            {screen: () => list(p, 'Połączone urządzenia', [{id: 'pair', label: '＋ Sparuj nowe urządzenie'}, {label: 'Zapisane urządzenia', sub: 'Samochód'}]), target: 'pair', say: '<strong>Dotknij Sparuj nowe urządzenie.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Sparuj nowe urządzenie', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'MOJE URZĄDZENIA' : 'Zapisane'}, {label: 'Samochód', sub: 'Niepołączono'},
            {caption: p === 'ios' ? 'INNE URZĄDZENIA' : 'Dostępne urządzenia'}, {id: 'headphones', label: '⟦headphones⟧ Słuchawki ćwiczebne'}, {label: 'Telewizor sąsiada'}], {back: 'Ustawienia'}),
         target: 'headphones', say: 'Telefon szuka urządzeń w pobliżu. <strong>Dotknij Słuchawki ćwiczebne.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'MOJE URZĄDZENIA'}, {label: '⟦headphones⟧ Słuchawki ćwiczebne', sub: 'Połączono ⟦check⟧'}, {label: 'Samochód', sub: 'Niepołączono'}], {back: 'Ustawienia'}),
         question: {q: 'Czy następnym razem, gdy włączysz słuchawki, trzeba będzie to zrobić znowu?', options: [
            {t: 'Nie, od teraz łączą się same', ok: true, why: 'Tak. Parujesz tylko raz. Potem łączą się automatycznie, gdy są włączone i w pobliżu.'},
            {t: 'Tak, za każdym razem', why: 'Parujesz tylko raz. Potem łączą się same.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Słuchawki ćwiczebne', sub: 'Połączono ⟦check⟧'}], {back: 'Ustawienia'}), done: true,
         say: '<strong>Brawo!</strong> Te same kroki działają dla samochodu, głośnika lub aparatów słuchowych. Jeśli coś się nie łączy, wyłącz i włącz Bluetooth i znów wprowadź urządzenie w tryb parowania.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">„${ctx.said || 'Babciu? To ja, Tom! Zgubiłem telefon i mam kłopoty. Potrzebuję 400 £ na mandat, dziś. Proszę, nie mów mamie!'}”</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Poproś o rodzinne hasło bezpieczeństwa</button><button type="button" data-tap="send-money">Powiedz, że wyślesz pieniądze</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Dzwoni nieznany numer. <strong>Odbierz</strong>, żeby poćwiczyć, co robić.', hints: {decline: 'W prawdziwym życiu odrzucenie jest w porządku! W tym ćwiczeniu dotknij Odbierz.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Eee… co? Babciu, nie ma na to czasu! Proszę, potrzebuję pieniędzy teraz!'; },
         say: 'Brzmi dokładnie jak twój wnuk, Tom. Ale oszuści potrafią kopiować głosy. Twoja rodzina ustaliła <strong>hasło bezpieczeństwa</strong>. <strong>Poproś o nie.</strong>',
         hints: {'send-money': 'Nigdy nie zgadzaj się wysłać pieniędzy podczas takiej rozmowy. Poproś o hasło bezpieczeństwa.', end: 'Rozłączenie się też jest w porządku! Ale najpierw poćwicz proszenie o hasło bezpieczeństwa.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Nie zna go i naciska jeszcze mocniej. To oszust. <strong>Rozłącz się</strong> czerwonym przyciskiem.', hints: {'send-money': 'Nie! Nie znali hasła. Rozłącz się.', 'ask-phrase': 'Zapytałeś, a nie potrafili odpowiedzieć. Rozłącz się.'}},
        {screen: () => home(p), question: {q: 'Nadal trochę martwisz się o wnuka, Tom. Co robisz?', options: [
            {t: 'Dzwonię do wnuka (Tom) albo jego mamy na numer, który już mam', ok: true, why: 'Tak. Zawsze oddzwaniaj na numer, który znasz. Prawdziwemu wnukowi nic nie będzie i nie obrazi się, że sprawdzasz.'},
            {t: 'Oddzwaniam pod numer, który do mnie dzwonił', why: 'To znów trafia do oszusta. Zadzwoń do wnuka na numer, który już masz.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Jeśli rozmowa dotyczy twojego konta bankowego, możesz zadzwonić pod <strong>159</strong>, żeby bezpiecznie połączyć się z własnym bankiem. <strong>Otwórz aplikację Telefon</strong>, żeby poćwiczyć.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Wpisz 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Dotknij zielonego przycisku połączenia.</strong> <em>(Tylko ćwiczenie: nic nie jest wybierane.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">„Witamy w 159. Podaj nazwę swojego banku, a my cię połączymy.”</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Brawo!</strong> 159 łączy cię z twoim prawdziwym bankiem. Ustal z rodziną hasło bezpieczeństwa osobiście i nigdy nie publikuj go w internecie.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Witaj' : 'Cześć'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Przesuń w górę, aby otworzyć' : 'Rozpocznij'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Twój nowy telefon jest wyjęty z pudełka i włączony. Trzymaj <strong>stary telefon</strong> w pobliżu, naładowany i połączony z Wi-Fi. <strong>Dotknij ${p === 'ios' ? 'Przesuń w górę, aby otworzyć' : 'Rozpocznij'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Szybki start' : 'Kopiuj aplikacje i dane', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Przybliż swojego starego iPhone\'a do tego, żeby skonfigurować go z kontem Apple.' : 'Skopiuj aplikacje, zdjęcia, kontakty i więcej ze starego telefonu.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Kontynuuj na starym iPhonie' : 'Użyj starego urządzenia'}</button>
            <button type="button" class="cp" data-tap="manual">Skonfiguruj ręcznie</button>`}),
         target: 'use-old', say: 'Kopiowanie ze starego telefonu oszczędza ponownego konfigurowania wszystkiego. <strong>Dotknij ' + (p === 'ios' ? 'Kontynuuj na starym iPhonie' : 'Użyj starego urządzenia') + '.</strong>', hints: {manual: 'Można, ale kopiowanie jest o wiele łatwiejsze. Dotknij drugiego przycisku.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">Na <strong>starym</strong> telefonie pojawia się wiadomość. Skieruj jego aparat na ten wzór.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Stary telefon zeskanował wzór</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'Na starym telefonie dotknij Kontynuuj, a potem trzymaj go nad tym wzorem, żeby aparat go widział. Tutaj <strong>dotknij Stary telefon zeskanował wzór</strong>.'},
        {screen: c => codeScreen(p, c, 'Wpisz kod starego telefonu', 'To bezpiecznie kopiuje twoje ustawienia.'), sequence: CODE_KEYS,
         say: `Wpisz kod starego telefonu. W ćwiczeniu użyj <strong>${codeText}</strong>.`, hint: `Wpisz kod ćwiczebny ${codeText}.`},
        {screen: () => list(p, 'Przenieś swoje dane', [], {noBack: true, top: `<p class="cf">Wybierz, co przenieść:</p>
            <div class="cj ex"><span>Zdjęcia i filmy</span>${tog(true)}</div><div class="cj ex"><span>Kontakty i wiadomości</span>${tog(true)}</div><div class="cj ex"><span>Aplikacje</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Kontynuuj</button>`}),
         target: 'transfer', say: 'Wszystko jest zaznaczone. <strong>Dotknij Kontynuuj.</strong> Trzymaj oba telefony blisko siebie i podłączone do ładowarki.'},
        {screen: c => list(p, 'Przenoszenie…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Pozostało około 25 minut' : 'Przenoszenie zakończone ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Przenoszenie się skończyło. Co zrobić ze starym telefonem?', options: [
            {t: 'Zachować go na tydzień, żeby sprawdzić, czy niczego nie brakuje, a potem porządnie wyczyścić przed sprzedażą lub oddaniem do recyklingu', ok: true, why: 'Tak. Najpierw sprawdź, czy zdjęcia, WhatsApp i aplikacje bankowe działają na nowym telefonie. Następna lekcja pokazuje, jak wyczyścić stary.'},
            {t: 'Od razu wyrzucić do kosza', why: 'Nadal są na nim wszystkie twoje informacje! Sprawdź, czy nowy telefon ma wszystko, a potem porządnie wyczyść stary.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Twój nowy telefon ma twoje zdjęcia, kontakty i aplikacje. Niektóre aplikacje, jak bankowe i WhatsApp, każą zalogować się ponownie; miej gotowe dane.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Sprzedajesz, oddajesz lub przekazujesz do recyklingu stary telefon? Zrób to we właściwej kolejności, bo inaczej kolejny właściciel nie będzie mógł z niego korzystać. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Krok 1: wyloguj się z konta Apple. <strong>Dotknij swojego imienia</strong>.'},
            {screen: c => list(p, 'Konto Apple', [{label: 'Dane osobowe'}, {label: 'Logowanie i zabezpieczenia'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Wyloguj', danger: true}], {back: 'Ustawienia',
                overlay: c.ask ? dialog(p, 'Wylogować?', 'Hasło jest potrzebne do wyłączenia Lokalizatora. (Ćwiczenie: wpisano je za ciebie.)', [['cancel', 'Anuluj'], ['turn-off', 'Wyłącz']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Przewiń na sam dół i <strong>dotknij Wyloguj</strong>.'},
            {screen: () => list(p, 'Konto Apple', [{label: 'Wyloguj', danger: true}], {back: 'Ustawienia', overlay: dialog(p, 'Wylogować?', 'Hasło jest potrzebne do wyłączenia Lokalizatora. (Ćwiczenie: wpisano je za ciebie.)', [['cancel', 'Anuluj'], ['turn-off', 'Wyłącz']])}),
             target: 'turn-off', say: 'To wyłącza <strong>Lokalizator</strong>, który inaczej zablokowałby telefon na ciebie. <strong>Dotknij Wyłącz.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Krok 2: wyczyść go. <strong>Dotknij Ogólne.</strong>'},
            {screen: () => list(p, 'Ogólne', [{label: 'Informacje'}, {label: 'Pamięć iPhone\'a'}, {id: 'reset', label: 'Przenieś lub zresetuj iPhone\'a'}], {back: 'Ustawienia'}), target: 'reset', say: '<strong>Dotknij Przenieś lub zresetuj iPhone\'a</strong>, na dole.'},
            {screen: c => list(p, 'Przenieś lub zresetuj iPhone\'a', [{label: 'Resetuj'}, {id: 'erase', label: 'Wymaż całą zawartość i ustawienia'}], {back: 'Ogólne',
                overlay: c.askErase ? dialog(p, 'Wymazać ten iPhone?', 'Wszystkie zdjęcia, wiadomości i aplikacje zostaną usunięte.', [['cancel', 'Anuluj'], ['confirm-erase', 'Wymaż']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Dotknij Wymaż całą zawartość i ustawienia.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Krok 1: usuń konto Google. <strong>Dotknij Google</strong>. <em>(W telefonie Samsung usuń też konto Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Zarządzaj kontem Google'}, {id: 'accounts', label: 'Konta na tym urządzeniu', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Dotknij Konta na tym urządzeniu.</strong>'},
            {screen: c => list(p, 'Konto Google', [{label: 'margaret.smith@example.com'}, {label: 'Synchronizacja konta'}, {id: 'remove', label: 'Usuń konto', danger: true}], {overlay: c.ask ? dialog(p, 'Usunąć konto?', 'Usunięcie kasuje z tego telefonu jego wiadomości, kontakty i dane.', [['cancel', 'Anuluj'], ['confirm-remove', 'Usuń konto']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Bez tego telefon po resecie pozostaje zablokowany na twoje konto. <strong>Dotknij Usuń konto.</strong>'},
            {screen: () => list(p, 'Konto', [{label: 'Usuń konto', danger: true}], {overlay: dialog(p, 'Usunąć konto?', 'Usunięcie kasuje z tego telefonu jego wiadomości, kontakty i dane.', [['cancel', 'Anuluj'], ['confirm-remove', 'Usuń konto']])}),
             target: 'confirm-remove', say: '<strong>Dotknij Usuń konto.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Krok 2: wyczyść go. <strong>Dotknij System</strong>, na dole.'},
            {screen: () => list(p, 'System', [{label: 'Języki'}, {label: 'Aktualizacja oprogramowania'}, {id: 'reset', label: 'Opcje resetowania'}]), target: 'reset', say: '<strong>Dotknij Opcje resetowania.</strong>'},
            {screen: c => list(p, 'Opcje resetowania', [{label: 'Zresetuj Wi-Fi, sieć komórkową i Bluetooth'}, {id: 'erase', label: 'Usuń wszystkie dane (przywrócenie ustawień fabrycznych)'}], {overlay: c.askErase ? dialog(p, 'Usunąć wszystkie dane?', 'Wszystkie zdjęcia, wiadomości i aplikacje zostaną usunięte.', [['cancel', 'Anuluj'], ['confirm-erase', 'Usuń wszystkie dane']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Dotknij Usuń wszystkie dane (przywrócenie ustawień fabrycznych).</strong>'},
        ]),
        {screen: () => list(p, 'Resetuj', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Wymazać ten iPhone?' : 'Usunąć wszystkie dane?', 'Wszystkie zdjęcia, wiadomości i aplikacje zostaną usunięte.', [['cancel', 'Anuluj'], ['confirm-erase', p === 'ios' ? 'Wymaż' : 'Usuń wszystkie dane']])}),
         target: 'confirm-erase', say: 'Rób to dopiero wtedy, gdy twoje zdjęcia są bezpieczne na nowym telefonie lub mają kopię zapasową. <strong>Dotknij ' + (p === 'ios' ? 'Wymaż' : 'Usuń wszystkie dane') + '.</strong> <em>(Ćwiczenie: nic nie jest usuwane.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Witaj' : 'Cześć'}</h3><p class="cf">Gotowy dla nowego właściciela</p>${homeIndicator(p)}</div>`,
         question: {q: 'Ostatnia rzecz, zanim go przekażesz?', options: [
            {t: 'Wyjąć kartę SIM (i ewentualną kartę pamięci)', ok: true, why: 'Tak. Na karcie SIM jest twój numer telefonu. Wysuń ją małym narzędziem albo spinaczem.'},
            {t: 'Nic więcej', why: 'Wyjmij kartę SIM i ewentualną kartę pamięci. Twój numer jest na karcie SIM.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Witaj' : 'Cześć'}</h3><p class="cf">Gotowy dla nowego właściciela</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Brawo!</strong> Wyloguj się, wyczyść, wyjmij kartę SIM: w tej kolejności. Ekran „Witaj” oznacza, że jest gotowy dla kogoś innego.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Przypomnienie</strong><span>Zadzwonić do Sarah</span><small>Dzisiaj o 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, później przelotne opady</span><small>Max 14° · Min 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} słucha… co chcesz powiedzieć?`}</p>${result}
            <div class="wh">${[['say-remind', '„Przypomnij mi o telefonie do Sarah o 3”'], ['say-weather', '„Jaka dziś pogoda?”'], ['say-joke', '„Zamów mi pizzę”']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Przycisk boczny (naciśnij i przytrzymaj)' : 'Przycisk zasilania (naciśnij i przytrzymaj)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> robi rzeczy, o które prosisz na głos. <strong>Naciśnij i przytrzymaj przycisk boczny</strong> (po prawej), aż pojawi się Siri. Możesz też po prostu powiedzieć „Siri” lub „Hej Siri”.'
                          : 'Telefon potrafi robić rzeczy, o które prosisz na głos. <strong>Naciśnij i przytrzymaj przycisk zasilania</strong> (po prawej), aż pojawi się asystent. Możesz też powiedzieć „Hey Google”.',
         hint: 'Trzymaj palec (lub przycisk myszy) na przycisku na prawej krawędzi.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Na prawdziwym telefonie po prostu byś mówił. Tutaj <strong>dotknij „Przypomnij mi o telefonie do Sarah o 3”</strong>.', hints: {'say-joke': 'Najpierw spróbuj przypomnienia.', 'say-weather': 'Najpierw spróbuj przypomnienia.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Gotowe: przypomnienie pojawi się o 15:00. Teraz <strong>zapytaj o pogodę</strong>.', hints: {'say-remind': 'Ustawione. Teraz zapytaj o pogodę.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'O co z tego możesz poprosić telefon?', options: [
            {t: 'O wszystko: „Zadzwoń do Sarah”, „Ustaw minutnik na 10 minut”, „Włącz latarkę”, „Przeczytaj moje wiadomości”', ok: true, why: 'Tak. To przydatne, gdy masz zajęte ręce, zmęczone oczy albo pisanie sprawia kłopot.'},
            {t: 'Tylko o pogodę', why: 'Potrafi dużo: połączenia, minutniki, latarkę, czytanie wiadomości, budziki i więcej.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Brawo!</strong> Mów wyraźnie i naturalnie, jak do człowieka. Jeśli źle usłyszy, po prostu zapytaj jeszcze raz.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Tekst'], ['lens-translate', 'Przetłumacz'], ['lens-search', 'Szukaj']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Menu' : 'Carte'}</strong><span>${ctx.translated ? 'Zupa rybna' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Kurczak z pieczarkami' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Tarta jabłkowa' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Czas na szczepienie przeciw grypie.</span><span>Aby się umówić, zadzwoń pod ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Tekst na żywo' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Twój aparat potrafi czytać pismo. Skopiujmy numer telefonu z listu. <strong>Otwórz Aparat.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Skieruj go na list. Gdy wykryje pismo, pojawi się mały <strong>przycisk tekstu ⟦scan-text⟧</strong>. <strong>Dotknij go.</strong>' : 'Skieruj go na list i <strong>dotknij przycisku Lens ◎</strong>.',
         hints: {shutter: 'To robi zwykłe zdjęcie. Dotknij: ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'Przycisk Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Pismo jest teraz prawdziwym tekstem. <strong>Dotknij numeru telefonu.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Dotknij Kopiuj</strong>, żeby wkleić go do wiadomości lub kontaktów. <em>(Opcja Zadzwoń od razu wybrałaby ten numer.)</em>', hints: {'call-num': 'To zadzwoniłoby pod ten numer. W tym ćwiczeniu dotknij Kopiuj.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'Na wakacjach? Teraz aparat jest skierowany na francuskie menu. ' + (p === 'ios' ? 'Potrafi to aplikacja Tłumacz albo Lens w aplikacji Google. ' : '') + '<strong>Dotknij Przetłumacz.</strong>', hints: {'lens-text': 'To kopiuje francuski tekst. Dotknij Przetłumacz.', 'lens-search': 'Dotknij Przetłumacz.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Co jeszcze aparat potrafi w ten sposób?', options: [
            {t: 'Rozpoznawać rośliny i ptaki oraz skanować listy do PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'W aplikacji Notatki dotknij spinacza, a potem Skanuj dokumenty, żeby zamienić listy w PDF.' : 'W Dysku Google dotknij +, a potem Skanuj, żeby zamienić listy w PDF.')},
            {t: 'Tylko robić zdjęcia', why: 'Robi o wiele więcej: rozpoznaje rośliny, tłumaczy, kopiuje tekst i skanuje listy do PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Brawo!</strong> Skopiowałeś numer i przetłumaczyłeś menu aparatem. ' + (p === 'ios' ? 'Tekst na żywo działa też na zdjęciach, które już zrobiłeś.' : 'Google Lens działa też na zdjęciach, które już zrobiłeś.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'E-booki z biblioteki', `<p class="cf">Zalogowano kartą biblioteczną</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">E-booki</button><button type="button" data-tap="tab-audio" class="on">Audiobooki</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Termin zwrotu za 21 dni' : 'Dostępne 3 z 5 egzemplarzy'}</small>
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
         say: 'Z bezpłatną kartą biblioteczną możesz wypożyczać e-booki i audiobooki w telefonie. East Riding Libraries korzystają z aplikacji <strong>BorrowBox</strong>. To wersja ćwiczebna. <strong>Otwórz ją.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Jesteś zalogowany kartą biblioteczną. <strong>Dotknij The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Wypożyczenie jest bezpłatne. <strong>Dotknij Wypożycz.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Jest twoja na 21 dni. <strong>Dotknij Słuchaj.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Dotknij przycisku odtwarzania ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Słuchasz w łóżku? <strong>Wyłącznik czasowy</strong> zatrzymuje odtwarzanie po jakimś czasie, żebyś nie zgubił miejsca. <strong>Dotknij Wyłącznik czasowy.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Co się dzieje, gdy mija 21 dni?', options: [
            {t: 'Wraca sama. Bez kar, a jeśli jeszcze nie skończyłeś, możesz przedłużyć', ok: true, why: 'Tak. E-booki i audiobooki zwracają się automatycznie.'},
            {t: 'Dostajesz karę', why: 'Nie ma kar. Zwraca się sama, a jeśli jeszcze nie skończyłeś, możesz przedłużyć.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Brawo!</strong> Aby zacząć naprawdę, zapisz się na eastridinglibraries.co.uk lub w dowolnej bibliotece, potem pobierz BorrowBox i zaloguj się swoją kartą.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>Płatność w aplikacji: lokalizacja <b>4471</b></span></div>
                <p class="cf">Wpisz numer lokalizacji z tablicy</p>${field('parkcode', 'Numer lokalizacji', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Znajdź parking</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Zapłać 3,20 £' : 'Wybierz czas'}</button>`, {color});
        }
        return app(p, 'Parking', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Wiele parkingów pozwala płacić w aplikacji, więc nie potrzebujesz monet. Każda rada używa innych aplikacji (tablica mówi, której). Ta jest ćwiczebna. <strong>Otwórz Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Wpisz numer lokalizacji z tablicy: 4471.',
         say: 'Każdy parking ma <strong>numer lokalizacji</strong> na tablicy. <strong>Wpisz 4471</strong> w polu i <strong>dotknij Znajdź parking</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Numer rejestracyjny twojego samochodu jest już zapisany. <strong>Wybierz 2 godziny.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Za korzystanie z aplikacji jest mała opłata serwisowa. <strong>Dotknij Zapłać 3,20 £.</strong> <em>(Ćwiczenie: żadne pieniądze nie są pobierane.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Spóźniasz się, jesteś w sklepach. Co możesz zrobić?', options: [
            {t: 'Dotknąć Przedłuż w aplikacji, żeby dodać czas, bez wracania do samochodu', ok: true, why: 'Tak. To wielki plus płacenia w aplikacji. Większość przypomina też, zanim skończy się czas.'},
            {t: 'Nic, dostaniesz mandat', why: 'W większości aplikacji parkingowych możesz dotknąć Przedłuż, żeby dodać czas, skądkolwiek jesteś.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Brawo!</strong> Większość automatów nadal przyjmuje karty lub monety, a wiele aplikacji pozwala też płacić przez zadzwonienie pod numer lub wysłanie SMS-a. Nigdy nie płać przez naklejkę z kodem QR na automacie: mogą być fałszywe.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Twoja umowa wygasła 3 marca 2026. Możesz zmienić operatora bez opłat. Twoja miesięczna opłata to 24,00 £. Aby zmienić operatora i zachować numer, wyślij SMS-a PAC na 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Wiadomość tekstowa', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Czy nadal masz umowę, czy płacisz za dużo? Jeden bezpłatny SMS to wyjaśni. <strong>Otwórz Wiadomości.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Wpisz INFO w polu wiadomości, a potem dotknij wyślij.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Rozpoczęliśmy nową wiadomość do <strong>85075</strong>. <strong>Wpisz INFO</strong> i <strong>dotknij wyślij</strong>. Jest bezpłatna we wszystkich sieciach w Wielkiej Brytanii.'},
        {screen: c => smsTo(p, c), question: {q: 'Odpowiedź mówi, że umowa ci wygasła, a nadal płacisz 24 £ miesięcznie. Co to oznacza?', options: [
            {t: 'Telefon jest spłacony. Oferta tylko z kartą SIM mogłaby kosztować znacznie mniej, a numer możesz zachować', ok: true, why: 'Tak. Wyślij SMS-a PAC na 65075, żeby dostać kod pozwalający zmienić operatora i zachować numer. Resztę załatwia nowy operator.'},
            {t: 'Nic, płacić dalej', why: 'Możesz płacić za telefon, który już spłaciłeś. Oferta tylko z kartą SIM mogłaby sporo zaoszczędzić.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Jeszcze jedna oszczędność, na wyjazdy za granicę: wyłącz roaming danych, żeby nie dostać niespodziewanego rachunku. <strong>Dotknij Ustawienia.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Dotknij Sieć komórkowa.</strong>'},
            {screen: () => list(p, 'Sieć komórkowa', [{label: 'Dane komórkowe', toggle: true}, {id: 'options', label: 'Opcje danych komórkowych', value: 'Roaming włączony'}, {label: 'Osobisty hotspot'}], {back: 'Ustawienia'}), target: 'options', say: '<strong>Dotknij Opcje danych komórkowych.</strong>'},
            {screen: c => list(p, 'Opcje danych komórkowych', [{id: 'roam', label: 'Roaming danych', toggle: !c.roamOff}, {label: 'Głos i dane', value: '5G Auto'}], {back: 'Sieć komórkowa'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Wyłącz Roaming danych.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Dotknij Sieć i internet.</strong>'},
            {screen: () => list(p, 'Sieć i internet', [{label: 'Internet', sub: 'Domowe Wi-Fi'}, {id: 'sims', label: 'Karty SIM', sub: 'Twoja sieć'}, {label: 'Tryb samolotowy', toggle: false}]), target: 'sims', say: '<strong>Dotknij Karty SIM.</strong>'},
            {screen: c => list(p, 'Karty SIM', [{label: 'Dane mobilne', toggle: true}, {id: 'roam', label: 'Roaming', toggle: !c.roamOff, sub: 'Łącz z usługami danych podczas roamingu'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Wyłącz Roaming.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Brawo!</strong> Za granicą nadal możesz używać Wi-Fi do WhatsAppa, rozmów wideo i map. Włącz roaming z powrotem, jeśli potrzebujesz danych mobilnych i wiesz, ile liczy twoja sieć.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Lokalizator', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Udostępnianie lokalizacji pozwala rodzinie zobaczyć, że bezpiecznie dotarłeś do domu. To twój wybór i możesz przestać w każdej chwili. <strong>Otwórz Lokalizator.</strong>'},
        {screen: c => app(p, 'Osoby', `<p class="cf">Nikt jeszcze nie udostępnia.</p><button type="button" class="ce co" data-tap="share">Udostępnij moją lokalizację</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Dotknij Udostępnij moją lokalizację.</strong>'},
        {screen: c => app(p, 'Udostępnij', '', {color: '#fff', overlay: sheet('Wybierz kontakt', [['pick-sarah', 'Sarah', 'Córka'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Dotknij Sarah.</strong>', hints: {'pick-dave': 'W tym ćwiczeniu wybierz Sarah.'}},
        {screen: c => app(p, 'Udostępnij Sarah', '', {color: '#fff', overlay: sheet('Na jak długo?', [['one-hour', 'Udostępnij na godzinę'], ['day', 'Udostępnij do końca dnia'], ['always', 'Udostępnij bezterminowo']])}),
         target: 'always', say: 'Wybierz, na jak długo. Dla rodziny, której ufasz, <strong>dotknij Udostępnij bezterminowo</strong>. Możesz przestać w każdej chwili.', hints: {'one-hour': 'To przydatne przy jednej podróży. W tym ćwiczeniu wybierz Udostępnij bezterminowo.', day: 'W tym ćwiczeniu wybierz Udostępnij bezterminowo.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Udostępnianie lokalizacji pozwala rodzinie zobaczyć, że bezpiecznie dotarłeś do domu. To twój wybór i możesz przestać w każdej chwili. <strong>Otwórz Mapy.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Dotknij swojego zdjęcia profilowego</strong> w prawym górnym rogu.'},
        {screen: () => app(p, 'Mapy', '', {color: '#fff', overlay: sheet('', [['sharing', 'Udostępnianie lokalizacji'], ['timeline', 'Twoja oś czasu'], ['settings', 'Ustawienia']])}), target: 'sharing', say: '<strong>Dotknij Udostępnianie lokalizacji.</strong>'},
        {screen: () => app(p, 'Udostępnianie lokalizacji', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Dotknij Nowe udostępnienie.</strong>'},
        {screen: () => app(p, 'Udostępnij', '', {color: '#fff', overlay: sheet('Wybierz kontakt', [['pick-sarah', 'Sarah', 'Córka'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Dotknij Sarah.</strong>', hints: {'pick-dave': 'W tym ćwiczeniu wybierz Sarah.'}},
        {screen: () => app(p, 'Udostępnij Sarah', '', {color: '#fff', overlay: sheet('Na jak długo?', [['one-hour', 'Na 1 godzinę'], ['always', 'Dopóki tego nie wyłączysz']])}),
         target: 'always', say: 'Dla rodziny, której ufasz, <strong>dotknij Dopóki tego nie wyłączysz</strong>.', hints: {'one-hour': 'Przydatne przy jednej podróży. W tym ćwiczeniu wybierz Dopóki tego nie wyłączysz.'}},
    ]).concat([
        {screen: () => app(p, 'Udostępnianie dla Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah widzi, gdzie jesteś. ${p === 'ios' ? 'Dotknij Zatrzymaj udostępnianie' : 'Dotknij Zatrzymaj'} w dowolnej chwili.</p>`, {color: '#fff'}),
         question: {q: 'Ktoś, kogo dopiero poznałeś w internecie, prosi o udostępnienie lokalizacji. Czy powinieneś?', options: [
            {t: 'Nie. Udostępniaj tylko najbliższej rodzinie lub znajomym, którym ufasz', ok: true, why: 'Dokładnie. Twoja lokalizacja pokazuje, gdzie mieszkasz i kiedy cię nie ma. Zachowaj ją dla zaufanych osób.'},
            {t: 'Tak, wydają się mili', why: 'Udostępniaj lokalizację tylko najbliższej rodzinie i znajomym. Pokazuje, gdzie mieszkasz i kiedy cię nie ma.'}]}},
        {screen: () => app(p, 'Udostępnianie dla Sarah', '<p class="cf">Sarah widzi, gdzie jesteś.</p>', {color: '#fff'}), done: true,
         say: '<strong>Brawo!</strong> Sarah widzi, że jesteś bezpieczny. Od czasu do czasu sprawdzaj, komu udostępniasz, i przestań udostępniać każdemu, komu nie trzeba.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Twój wnuk Leo dostaje swojego pierwszego iPhone\'a. <strong>Czas przed ekranem</strong> ustawia zdrowe limity. To jest telefon <strong>Leo</strong>. <strong>Dotknij Ustawienia.</strong>'},
        {screen: c => list(p, 'Ustawienia', [{label: 'Leo', sub: 'Konto Apple'}, {label: 'Powiadomienia'}, {id: 'screen-time', label: 'Czas przed ekranem'}, {label: 'Ogólne'}], {noBack: true}), target: 'screen-time', say: '<strong>Dotknij Czas przed ekranem.</strong>'},
        {screen: c => list(p, 'Czas przed ekranem', [{id: 'downtime', label: 'Przerwa od ekranu', sub: c.downtime ? '20:00 – 07:00' : 'Wyłączone'}, {label: 'Limity aplikacji'}, {id: 'content', label: 'Ograniczenia treści i prywatności', sub: c.content ? 'Włączona' : 'Wyłączone'}, {label: 'Użyj kodu Czasu przed ekranem'}], {back: 'Ustawienia'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Przerwa od ekranu</strong> blokuje większość aplikacji w nocy (połączenia nadal działają). <strong>Dotknij Przerwa od ekranu</strong>, żeby ją włączyć, od 20:00 do 7:00.'},
        {screen: c => list(p, 'Czas przed ekranem', [{label: 'Przerwa od ekranu', sub: '20:00 – 07:00'}, {label: 'Limity aplikacji'}, {id: 'content', label: 'Ograniczenia treści i prywatności', sub: c.content ? 'Włączona' : 'Wyłączone'}], {back: 'Ustawienia'}),
         target: 'content', action: c => { c.content = true; }, say: 'Dalej: zatrzymaj niespodziewane zakupy i treści dla dorosłych. <strong>Dotknij Ograniczenia treści i prywatności.</strong>'},
        {screen: c => list(p, 'Treści i prywatność', [{label: 'Ograniczenia treści i prywatności', toggle: true}, {id: 'purchases', label: 'Zakupy w App Store', value: c.noBuy ? 'Nie zezwalaj' : 'Zezwalaj'}, {label: 'Treści internetowe', value: 'Ogranicz strony dla dorosłych'}], {back: 'Czas przed ekranem'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Strony dla dorosłych są teraz ograniczone. <strong>Dotknij Zakupy w App Store</strong>, żeby zatrzymać wydatki w aplikacjach.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Twój wnuk Leo dostaje swojego pierwszego telefonu z Androidem. Bezpłatna aplikacja Google <strong>Family Link</strong> ustawia zdrowe limity z <strong>twojego</strong> telefonu. <strong>Otwórz Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Dotknij Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Kontrola'}, {id: 'screen-time', label: 'Czas przed ekranem', sub: c.downtime ? 'Pora snu 20:00 – 07:00' : 'Bez limitów'}, {id: 'content', label: 'Ograniczenia treści', sub: c.noBuy ? 'Zakupy wymagają twojej zgody' : 'Google Play: zezwalaj na wszystko'}, {label: 'Lokalizacja', sub: 'Włączona'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Dotknij Czas przed ekranem</strong>, żeby ustawić porę snu, od 20:00 do 7:00, kiedy telefon się blokuje (połączenia nadal działają).'},
        {screen: c => list(p, 'Leo', [{caption: 'Kontrola'}, {label: 'Czas przed ekranem', sub: 'Pora snu 20:00 – 07:00'}, {id: 'content', label: 'Ograniczenia treści', sub: c.noBuy ? 'Zakupy wymagają twojej zgody' : 'Google Play: zezwalaj na wszystko'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Dalej: zatrzymaj niespodziewane wydatki. <strong>Dotknij Ograniczenia treści</strong>, żeby zakupy wymagały twojej zgody.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Czas przed ekranem' : 'Leo', [{label: p === 'ios' ? 'Przerwa od ekranu' : 'Czas przed ekranem', sub: '20:00 – 07:00'}, {label: 'Zakupy', sub: p === 'ios' ? 'Nie zezwalaj' : 'Wymaga twojej zgody'}]),
         question: {q: 'Co jest najważniejsze, oprócz ustawień?', options: [
            {t: 'Rozmowa z nimi: zawsze mogą ci powiedzieć, jeśli coś w internecie ich zdenerwuje', ok: true, why: 'Tak. Żadne ustawienie nie wyłapie wszystkiego. Najważniejsze jest bycie kimś, z kim mogą rozmawiać.'},
            {t: 'Ustawienia robią wszystko', why: 'Bardzo pomagają, ale nic nie wyłapie wszystkiego. Upewnij się, że wiedzą, że zawsze mogą porozmawiać z tobą.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Czas przed ekranem' : 'Leo', [{label: 'Przerwa od ekranu', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Brawo!</strong> Leo ma porę snu i nie może wydawać pieniędzy bez pytania. ' + (p === 'ios' ? 'Ustaw kod Czasu przed ekranem, żeby tylko ty mógł zmieniać te ustawienia.' : 'Family Link pozwala zmieniać je w każdej chwili z twojego telefonu.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Eksplorator plików', mac: 'Finder', linux: 'Pliki'},
        settings: {windows: 'Ustawienia', mac: 'Ustawienia systemowe', linux: 'Ustawienia systemowe'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Menedżer oprogramowania'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Start', mac: 'Aplikacje', linux: 'Menu'},
        editor: {windows: 'Notatnik', mac: 'TextEdit', linux: 'Edytor tekstu'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Poczta', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Menedżer aktualizacji', terminal: 'Terminal', trash: 'Kosz', apps: 'Aplikacje', chrome: 'Chrome', shield: 'Zabezpieczenia Windows', fw: 'Zapora'}[kind]);

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
        windows: {title: 'Kosz', empty: 'Opróżnij Kosz', confirm: n => `Czy na pewno chcesz trwale usunąć elementy (${n})?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Proponował pomoc przy każdym liście, który zacząłeś pisać. Przeszedł na emeryturę w 2007.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Początkujący: 999 sekund. Nie rozmawiamy o tym.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Wygraj partię, a karty skakały po ekranie. Kliknij mnie dwukrotnie!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Skrzeeek… bong… kssshhh. I nikt nie mógł korzystać z telefonu, gdy byłeś online.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Zielone pagórki i błękitne niebo na milionach ekranów od 2001 roku.', ''],
            ['⟦save⟧', 'Dyskietka (A:)', '1,44 MB. Przycisk Zapisz nadal tak wygląda.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, dołączony za darmo do Windows, dopóki Vista go nie zabrała.', ''],
            ['⟦bell-ring⟧', 'Szturchnięcie w MSN Messenger', 'Ktoś cię szturchnął i cały ekran zadrżał. Kliknij mnie dwukrotnie!', 'shake'],
            ['⟦file-text⟧', 'Pismo do urzędu OSTATECZNE (2) (ostateczne).doc', 'Każdy ma taki.', ''],
        ]},
        mac: {title: 'Kosz', empty: 'Opróżnij Kosz', confirm: () => 'Czy na pewno chcesz trwale usunąć elementy z Kosza? Tej czynności nie można cofnąć.', items: [
            ['⟦rainbow⟧', 'Wirująca kolorowa piłka', 'Tęczowe kółko, które znaczyło „proszę czekać”… i czekać. Kliknij mnie dwukrotnie!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Przezroczysty, jajowaty i niebieski. Każda szkoła takiego miała.', ''],
            ['⟦music⟧', 'iPod z kółkiem click wheel', '1000 piosenek w kieszeni. Kółko za kółkiem kciukiem.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Mały uśmiechnięty komputer, który witał cię przy każdym uruchomieniu.', ''],
            ['⟦bell⟧', 'Dźwięk startowy', 'Ten wielki akord po włączeniu. Wielu nadal za nim tęskni.', ''],
            ['⟦droplet⟧', 'Przyciski Aqua', 'Tak błyszczące i niebieskie, że chciało się je polizać.', ''],
            ['⟦calendar-days⟧', 'Widżety Dashboard', 'Kalkulator, pogoda i karteczka na osobnej warstwie. Zniknęły w 2019.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Tu wszyscy nagrywaliśmy płyty CD i synchronizowaliśmy iPody.', ''],
        ]},
        linux: {title: 'Kosz', empty: 'Opróżnij Kosz', confirm: () => 'Usunąć wszystkie elementy z Kosza? Wszystkie elementy w Koszu zostaną trwale usunięte.', items: [
            ['⟦bird⟧', 'Pingwin Tux (pluszak)', 'Maskotka Linuksa od 1996. Bardzo przytulny.', ''],
            ['⟦eye⟧', 'xeyes', 'Para oczu, które śledzą wskaźnik myszy. Kliknij mnie dwukrotnie!', 'eyes'],
            ['⟦app-window⟧', 'Chwiejne okna', 'Dawne efekty pulpitu sprawiały, że okna trzęsły się jak galareta, gdy je przeciągałeś. Kliknij mnie dwukrotnie!', 'wobble'],
            ['⟦save⟧', 'Dyskietki instalacyjne 1–50', 'Dawny Linux mógł wymagać do instalacji całego pudełka dyskietek.', ''],
            ['⟦disc⟧', 'Darmowa płyta CD z Ubuntu pocztą', 'Można było bezpłatnie zamówić płytę CD z Linuksem i przychodziła pocztą.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Przepowiadany co roku od około 1999. Może to ten rok?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'Każde wydanie Linux Mint ma żeńskie imię, na przykład Zena, Xia i Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Stary żart: powiedz „sudo”, a komputer robi, co mu każesz.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Ten folder jest pusty.' : 'The ' + egg.title + ' jest pusty.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Kliknij coś dwukrotnie, żeby zajrzeć.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Nie' : 'Anuluj'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Tak' : 'Pusty'}</button></div></div>` : '';
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
        ['Pagórkowaty krajobraz', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Prążki', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Nocne niebo', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Nadmorski', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Najsłynniejszy żart o Wi-Fi ze wszystkich.'],
        ['The LAN Before Time', 'LAN to „sieć lokalna”. Ta jest bardzo, bardzo stara.'],
        ['Abraham Linksys', 'Osiemdziesiąt siedem megabitów temu…'],
        ['Bill Wi the Science Fi', 'Nauka rządzi!'],
        ['Drop It Like It\'s Hotspot', 'Czyjś hotspot z telefonu, z poczuciem humoru.'],
        ['Silence of the LANs', 'Bardzo, bardzo cicha sieć.'],
        ['Tell My Wi-Fi Love Her', 'Ojej.'],
        ['Get Off My LAN', 'Pewnie zrzędliwy sąsiad.'],
        ['Bridlington Seagulls', 'Mewy już zabrały ci frytki. Nie oddawaj im jeszcze hasła.'],
        ['FREE WIFI (honest)', 'Sieci o nazwie „darmowe Wi-Fi”, której nie rozpoznajesz, właśnie nie należy dołączać!'],
    ];

    const FORTUNES = ['Dziś dobry dzień na kopię zapasową zdjęć.', 'Silne hasło to szczęśliwe hasło.', 'Odbierzesz telefon. To będzie oszustwo. Rozłącz się.',
        'Próbowałeś wyłączyć i włączyć ponownie?', 'Najlepszy czas na aktualizację był wczoraj. Drugi najlepszy jest teraz.', 'Filiżanka herbaty naprawia większość rzeczy. Komputerów jednak nie.',
        'Nigdy nie podawaj hasła obcemu. Ani mewie.', 'Znajdziesz pilota. Jest z boku kanapy.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">Adres IP: 192.168.1.42<br>Router: 192.168.1.1<br>Sygnał: −54 dBm (bardzo dobry)<br>Kanał: 36 (5 GHz)<br>Prędkość: 866 Mb/s<br>Zabezpieczenia: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi jest wyłączone. Włącz je, aby zobaczyć sieci.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Brak internetu</strong><br>Spróbuj sprawdzić Wi-Fi. Naciśnij <kbd>Spację</kbd> lub dotknij, aby zagrać.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>KONIEC GRY · naciśnij Spację, aby zagrać ponownie</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Czy dziś już zamuczałeś?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Spróbuj: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Muu!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Wpisano „sl” zamiast „ls”? Proszę, pociąg parowy.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (ćwiczeniowy) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: od śniadania \\___________/ Memory: nigdy nie zapomina o urodzinach`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Dobra. 🥪');
        else if (lc === 'make me a sandwich') say('Co? Zrób sobie sam.');
        else if (/rm\s+-rf/.test(lc)) say('Dobra próba! W tym ćwiczeniowym terminalu niczego nie da się zepsuć.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: nie znaleziono polecenia (spróbuj „help”)`);
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
        else if (note) note.textContent = 'Ta ćwiczeniowa przeglądarka nie przeszukuje prawdziwego internetu. Nic, co wpiszesz, nie jest nigdzie wysyłane.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Prima aprilis! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Kod oszusta aktywowany! +30 żyć 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Witaj w Macintosh.</p></div><p>Kod oszusta aktywowany! +30 żyć 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Kod oszusta aktywowany! +30 żyć 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Pozostałe okna zostały schowane.' : 'Aero Shake! (Nie było innych okien do schowania.)');
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
                funToast(screen, 'Wi-Fi jest włączone. Połączono z Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi jest wyłączone.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Dołączaj tylko do sieci, które znasz.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Prima aprilis! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Widok'], ['', 'Sortuj według'], ['refresh', 'Odśwież'], ['', 'Nowe'], ['wall', 'Personalizuj']]
                : os === 'mac' ? [['', 'Nowy folder'], ['', 'Pobierz informacje'], ['wall', 'Zmień tapetę…'], ['', 'Użyj stosów']]
                : [['', 'Utwórz nowy folder'], ['terminal', 'Otwórz w Terminalu'], ['wall', 'Zmień tło pulpitu']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Tapeta: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (wersja ćwiczeniowa)</small>
                <dl><dt>Chip</dt><dd>Bridlington Silicon B1</dd><dt>Pamięć</dt><dd>Nigdy nie zapomina o urodzinach</dd><dt>Dysk startowy</dt><dd>Practice HD</dd><dt>Numer seryjny</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notatnik' : os === 'mac' ? 'TextEdit' : 'Edytor tekstu';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Bez tytułu – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Wiersz 1, kol. 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Zwykły tekst'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Witaj! To ćwiczeniowy terminal. Wpisz „help”, żeby zobaczyć, co możesz wypróbować. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Pogoda'], ['news', '⟦newspaper⟧', 'Wiadomości'], ['bus', '⟦bus⟧', 'Godziny autobusów'], ['recipes', '⟦cake-slice⟧', 'Przepisy']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Pogoda w Bridlington</h3><p class="fd">Prognoza ćwiczeniowa</p><div class="ajf">${[['Dzisiaj', '⟦cloud-sun⟧', '13°'], ['pt.', '⟦cloud-rain⟧', '11°'], ['sob.', '⟦wind⟧', '10°'], ['niedz.', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Aktywność mew: <strong>bardzo wysoka</strong>. Pilnuj swoich frytek.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Ćwiczeniowe wiadomości</h3><ul class="news">
            <li><strong>Miejscowy mężczyzna w końcu znalazł pilota do telewizora</strong> z boku kanapy, po trzech tygodniach.</li>
            <li><strong>Mewa przyłapana z lodem 99 Flake</strong>. Właściciel lodów „nieszczególnie rozbawiony”.</li>
            <li><strong>Babcia pokonuje wnuka w rozmowach wideo</strong>: „Po prostu nacisnęłam zielony przycisk.”</li>
            <li><strong>Badanie:</strong> 9 na 10 problemów z komputerem rozwiązuje wyłączenie i ponowne włączenie.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Godziny autobusów</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Ciasto Victoria</h3><p>Wymieszaj po 200 g masła, cukru i mąki z proszkiem do pieczenia z 4 jajkami. Piecz w dwóch foremkach w 180°C przez 20–25 minut. Przełóż dżemem i kremem.</p><p class="fd">Wskazówka: ustaw minutnik w telefonie albo poproś go: „Ustaw minutnik na 25 minut”.</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Nowa karta' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Wyszukaj lub wpisz adres internetowy'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Pies na plaży.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Lista zakupów.txt'], ['⟦file-text⟧', 'Pismo do urzędu.docx'], ['⟦folder⟧', 'Przepisy'], ['⟦file-spreadsheet⟧', 'Lista kartek świątecznych.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Rachunek za podatek lokalny.pdf'], ['⟦file-text⟧', 'Rozkład jazdy autobusów.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Nadmorska orkiestra dęta.mp3'], ['⟦music⟧', 'Przeboje lat sześćdziesiątych.mp3']],
    };
    function funFiles(screen, os, folder = 'Obrazy', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Kosz' : os === 'mac' ? 'Kosz' : 'Kosz'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Pies na plaży.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Połączono z Home-WiFi-5G' : 'Wi-Fi jest wyłączone.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalizacja' : os === 'mac' ? 'Tapeta' : 'Tła'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Aktualizacja oprogramowania' : 'Aktualizacje'}</h3><p class="mj">⟦check⟧ Jesteś na bieżąco</p><p class="cf">Ostatnie sprawdzenie: dzisiaj, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Sprawdź dostępność aktualizacji</button><p class="zi"></p>`,
            about: `<h3>Informacje</h3><div class="zk"><div><span>Nazwa urządzenia</span><b>MARGARET-PRACTICE</b></div><div><span>System</span><b>${os === 'windows' ? 'Windows 11 (ćwiczeniowy)' : os === 'mac' ? 'macOS 27 (ćwiczeniowy)' : 'Linux Mint 22.3 (ćwiczeniowy)'}</b></div>
                <div><span>Procesor</span><b>Bridlington Silicon B1</b></div><div><span>Pamięć</span><b>Nigdy nie zapomina o urodzinach</b></div><div><span>Pamięć masowa</span><b>Dużo miejsca na zdjęcia wnuków</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalizacja' : os === 'mac' ? 'Tapeta' : 'Tła'], ['update', 'Aktualizacje'], ['about', 'Informacje']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Ćwiczeniowy Saper', 'Klasyczna gra w szukanie min.'], ['solitaire', '⟦spade⟧', 'Pasjans', 'Wkrótce w tym ćwiczeniowym sklepie.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Wkrótce w tym ćwiczeniowym sklepie.'], ['weather', '⟦cloud-sun⟧', 'Pogoda', 'Wkrótce w tym ćwiczeniowym sklepie.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Otwórz' : (os === 'mac' ? 'Pobierz' : 'Zainstaluj')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Ćwiczeniowy Saper', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Kliknij, aby kopać. Kliknij prawym przyciskiem (albo naciśnij i przytrzymaj), aby postawić flagę.</p></div>`, 'bz'));
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
        ['Mama', 'Jak wyłączyć to cudo?', 'Cześć kochanie, napisałam ten e-mail, ale nie mogę znaleźć przycisku wyłączania. Czy to ten okrągły? Całuję, Mama xx P.S. Nacisnęłam go. Nic się nie stało. Czy tak ma być?'],
        ['Bridlington Walkers', 'Sobotni spacer', 'Spotykamy się w porcie o 10:00. Weźcie termos i przeciwdeszczówkę. Incydent z mewą z zeszłego tygodnia nie będzie omawiany.'],
        ['Książę Abu (Bardzo Bogaty)', 'PILNE: wygrałeś 4 000 000 £!!!', 'Drogi Ukochany Przyjacielu, jestem księciem i potrzebuję twoich danych bankowych, żeby wysłać ci cztery miliony funtów. Prześlij też 50 £ na znaczek. — To oszustwo! Prawdziwi ludzie nie rozdają milionów e-mailem. Usuń go albo prześlij na report@phishing.gov.uk.'],
        ['Sarah', 'Zdjęcia z niedzieli 🌻', 'Oto zdjęcia z ogrodu. Pies zjadł kolejny słonecznik.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Poczta', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'To komputer ćwiczeniowy, więc nie da się go wyłączyć 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Pobrane', '⟦triangle-alert⟧ Programy „darmowe czyściki” to często śmieci lub coś gorszego. Najlepiej go usunąć, a nie otwierać!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `„${n}” otworzyłby się tutaj na prawdziwym komputerze.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi jest włączone.' : 'Wi-Fi jest wyłączone.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Sprawdzanie aktualizacji…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Brak nowych aktualizacji. Wszystko gotowe!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Ten jest tylko dla ozdoby w ćwiczeniowym sklepie.'); return true; }
            el.textContent = 'Instalowanie…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Otwórz'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Bez tytułu 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Plik Edycja Widok Wstaw Format <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Szanowni Państwo, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Menedżer aktualizacji', '<div class="ajz"><p class="mj">⟦check⟧ Twój system jest aktualny</p><p class="cf">Linux Mint sam sprawdza aktualizacje i pokazuje kropkę na tarczy, gdy są dostępne.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Wpisz tutaj, aby wyszukać</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Kosz', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Komputer', '⟦monitor⟧')}${icon('Ekran główny', '⟦house⟧')}${icon('Kosz', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Szukaj aplikacji, ustawień i dokumentów')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Szukaj')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Wpisz, aby wyszukać…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Nowa karta <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Wyszukaj lub wpisz adres internetowy</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'To jest <strong>pulpit</strong>. Pasek wzdłuż dołu to <strong>pasek zadań</strong>. Otwórz przeglądarkę z menu Start: <strong>kliknij Start</strong>, cztery kwadraty.'
            : os === 'mac' ? 'To jest <strong>pulpit</strong>. Rząd aplikacji na dole to <strong>Dock</strong>, a pasek wzdłuż góry to <strong>pasek menu</strong>. <strong>Kliknij Aplikacje</strong> (siatka kwadratów), żeby zobaczyć wszystkie aplikacje.'
            : 'To jest <strong>pulpit</strong> w Linux Mint. Pasek wzdłuż dołu to <strong>panel</strong>. Twoje aplikacje są w Menu: <strong>kliknij Menu</strong>, w lewym dolnym rogu.',
         hint: os === 'mac' ? 'Aplikacje są w Docku na dole, obok Findera.' : (os === 'windows' ? 'Start to cztery niebieskie kwadraty na pasku zadań.' : 'Przycisk Menu jest po lewej stronie dolnego panelu.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Kliknij ${N.browser[os]}</strong>, przeglądarkę internetową.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Każde okno ma trzy kolorowe przyciski w <strong>lewym górnym rogu</strong>. Żółty chowa okno. <strong>Kliknij żółty przycisk.</strong>'
            : 'Każde okno ma trzy przyciski w <strong>prawym górnym rogu</strong>. Kreska <strong>—</strong> chowa okno (minimalizuje). <strong>Kliknij —</strong>.',
         hints: {'win-close': 'To je zamyka. Najpierw schowaj je za pomocą przycisku ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'To powiększa je na cały ekran. Najpierw schowaj je.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Jest schowane, nie zamknięte. ${os === 'mac' ? 'Kropka pod jego ikoną w Docku' : 'line under its icon'} pokazuje, że nadal jest otwarte. <strong>Kliknij ikonę ${N.browser[os]}</strong>, żeby je przywrócić.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Teraz powiększ je na cały ekran: <strong>kliknij przycisk ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Na Macu czerwony przycisk zamyka okno. Ale aplikacja może nadal działać. Jak całkowicie ją zamknąć?', options: [
                {t: 'Nacisnąć ⟦command⟧ Cmd + Q albo wybrać Zakończ z menu aplikacji u góry', ok: true, why: 'Tak. Kropka pod aplikacją w Docku oznacza, że nadal działa. ⟦command⟧ Cmd + Q ją zamyka.'},
                {t: 'Kliknąć czerwony przycisk dwa razy', why: 'Czerwony przycisk zamyka tylko okna. ⟦command⟧ Cmd + Q (albo menu aplikacji > Zakończ) zamyka aplikację.'}]}
            : {q: 'Gdzie jest przycisk zamykania okna?', options: [
                {t: 'Prawy górny róg: ⟦x⟧', ok: true, why: 'Tak. W Windows i Linux Mint trzy przyciski są w prawym górnym rogu. (Na Macu są w lewym górnym rogu, czerwony, żółty i zielony.)'},
                {t: 'Lewy dolny róg', why: 'Jest w prawym górnym rogu każdego okna: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Brawo!</strong> Umiesz otwierać, chować, przywracać, powiększać i zamykać okna. To większość obsługi komputera.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Ekran główny' : 'Ekran główny'], ['desktop', 'Pulpit'], ['documents', 'Dokumenty'], ['downloads', 'Pobrane'], ['pictures', 'Obrazy']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ Pendrive']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Dokumenty'], ['pictures', '⟦folder⟧', 'Obrazy'], ['downloads', '⟦folder⟧', 'Pobrane']],
            downloads: [['photo', '⟦image⟧', 'Zdjęcie z wakacji.jpg'], ['bill', '⟦file-text⟧', 'Rachunek za podatek lokalny.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Zdjęcie z wakacji.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Wakacje')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Pismo do urzędu.docx'], ['recipes', '⟦folder⟧', 'Przepisy']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Dokumenty']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Nowy folder', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Ekran główny' : 'Ekran główny', downloads: 'Pobrane', pictures: 'Obrazy', documents: 'Dokumenty', usb: 'Pendrive', desktop: 'Pulpit'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Ten folder jest pusty</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Kopiuj' : 'Kopiuj';
    const pasteLabel = os => os === 'mac' ? 'Wklej element' : 'Wklej';
    const newFolderLabel = os => os === 'mac' ? 'Nowy folder' : os === 'windows' ? 'Nowy > Folder' : 'Utwórz nowy folder';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Twoje zdjęcia i listy są przechowywane w <strong>folderach</strong>. <strong>Kliknij ${N.files[os]}</strong>, żeby je obejrzeć.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'po lewej stronie Docka' : 'na ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Z boku są twoje główne foldery. To, co pobierasz z e-maili i stron internetowych, trafia do <strong>Pobrane</strong>. <strong>Kliknij Pobrane.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Otwórz'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Zmień nazwę'], ['menu-delete', os === 'mac' ? 'Przenieś do Kosza' : 'Usuń']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Skopiujmy zdjęcie z wakacji do Obrazów, gdzie jego miejsce. <strong>Kliknij prawym przyciskiem</strong> na <strong>Zdjęcie z wakacji.jpg</strong>: naciśnij <strong>prawy</strong> przycisk myszy. <em>' + (os === 'mac' ? 'Na gładziku kliknij dwoma palcami.' : 'Na ekranie dotykowym naciśnij i przytrzymaj.') + '</em>',
         hint: 'Użyj prawego przycisku myszy na zdjęciu.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Pojawia się menu. <strong>Kliknij ${copyLabel(os)}.</strong> <em>(Skrót to ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Nie to! Kliknij Kopiuj.', 'menu-open': 'To otwiera zdjęcie. Kliknij Kopiuj.', 'menu-rename': 'Kliknij Kopiuj.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Kliknij Obrazy</strong> po lewej.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Obrazy są puste. <strong>Kliknij prawym przyciskiem na pustym białym miejscu.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Kliknij ${pasteLabel(os)}.</strong> <em>(Albo ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Folder zrobimy za chwilę. Najpierw kliknij ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Zdjęcie jest teraz też w Obrazach. Teraz utwórz folder, żeby trzymać razem zdjęcia z wakacji. <strong>Znów kliknij prawym przyciskiem na pustym miejscu.</strong>', hints: {'rc-photo2': 'Kliknij prawym przyciskiem na pustym miejscu, nie na zdjęciu.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Kliknij ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Najpierw wpisz nazwę folderu, na przykład Wakacje.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Wpisz nazwę</strong>, na przykład <strong>Wakacje</strong>, a potem <strong>kliknij OK</strong> (albo naciśnij Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Gdzie zwykle trafiają pliki z e-maili i stron internetowych?', options: [
            {t: 'Do folderu Pobrane', ok: true, why: 'Tak. Jeśli nie możesz czegoś znaleźć, co pobrałeś, zajrzyj najpierw do Pobranych.'},
            {t: 'Na pulpit', why: 'Zwykle do Pobranych. Zajrzyj tam najpierw, jeśli czegoś nie możesz znaleźć.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Brawo!</strong> Prawy przycisk to sekret większości rzeczy: kopiowanie, wklejanie, zmiana nazwy i nowy folder są w tym menu.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Wpisz hasło do sieci</p>${field('wifipass', 'Hasło', ctx)}<button type="button" class="ce co" data-tap="connect">Połącz</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Sieci Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Połączono z Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Aby połączyć się z Wi-Fi, <strong>kliknij symbol Wi-Fi</strong> ${os === 'mac' ? 'w prawym górnym rogu ekranu' : 'w prawym dolnym rogu, blisko zegara'}.`, hint: os === 'mac' ? 'Jest na pasku menu w prawym górnym rogu.' : 'Jest blisko zegara w prawym dolnym rogu.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Nazwa twojej sieci jest na naklejce na routerze. Ta ćwiczeniowa to <strong>Home-WiFi-5G</strong>. <strong>Kliknij ją.</strong>', hints: {'net-neighbour': 'To sieć sąsiada! Wybierz Home-WiFi-5G.', 'net-cafe': 'To nie jest twoja domowa. Wybierz Home-WiFi-5G.', 'tray-wifi': 'Lista sieci Wi-Fi jest już otwarta. Kliknij Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Wpisz hasło dokładnie: Green-Apple-42 (wielkie G i A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Wpisz hasło z naklejki <strong>dokładnie</strong>: <strong>Green-Apple-42</strong>. Potem <strong>kliknij Połącz</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Panel Wi-Fi jest już otwarty. Wpisz hasło w polu, a potem kliknij Połącz.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Jesteś w kawiarni z darmowym Wi-Fi. Czy można z niego korzystać do bankowości internetowej?', options: [
            {t: 'Lepiej poczekać do domu albo użyć danych mobilnych telefonu', ok: true, why: 'Tak. Darmowe Wi-Fi jest w porządku do przeglądania, ale do bankowości używaj domowego Wi-Fi lub danych mobilnych.'},
            {t: 'Tak, każde Wi-Fi jest w porządku', why: 'Darmowe publiczne Wi-Fi jest w porządku do przeglądania, ale bankowość zostaw na dom lub dane mobilne.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Brawo!</strong> Komputer zapamięta hasło i następnym razem połączy się sam.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Lista zakupów: mleko, chleb, jajka, torebki herbaty, kartka urodzinowa dla Jean';
        const note = pcWin(os, `Lista zakupów – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Nowy e-mail do Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Kliknij tutaj, aby pisać…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Poczta' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Skróty klawiszowe oszczędzają mnóstwo klikania. <strong>${CMDL(os)}</strong> to klawisz ${os === 'mac' ? 'po obu stronach spacji, oznaczony ⟦command⟧' : 'w lewym dolnym rogu klawiatury'}. Aby zaznaczyć cały tekst, przytrzymaj <strong>${CMDL(os)}</strong> i naciśnij <strong>A</strong>. <em>Użyj prawdziwej klawiatury albo przycisków na ekranie.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Jest zaznaczone. Teraz skopiuj: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Skopiowano! <strong>Kliknij wewnątrz e-maila</strong> do Sarah, gdzie jest napis „Kliknij tutaj, aby pisać”.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Teraz wklej: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Ups, coś przez pomyłkę usunąłeś. Który skrót to cofa?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Tak. ${CMDL(os)} + Z cofa ostatnią rzecz, którą zrobiłeś, w prawie każdej aplikacji. Naciśnij ponownie, żeby cofnąć więcej.`},
            {t: 'Escape', why: `Escape zamyka menu. ${CMDL(os)} + Z to cofnij.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Jak zrobić zrzut ekranu (zdjęcie ekranu)?', options: [
            {t: os === 'windows' ? 'Klawisz Windows + Shift + S, a potem zaznacz to, co chcesz' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, a potem zaznacz to, co chcesz' : 'Nacisnąć klawisz Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Tak. Zostaje skopiowany, a powiadomienie pozwala go zapisać. Klawisz Print Screen też działa.' : os === 'mac' ? 'Tak. Obraz zapisuje się na pulpicie. Shift + ⟦command⟧ Cmd + 3 robi zrzut całego ekranu.' : 'Tak. Linux Mint zapisuje go w folderze Obrazy. Shift + Print Screen pozwala wybrać obszar.'},
            {t: 'Zrobić telefonem zdjęcie ekranu', why: 'To działa, ale zrzut ekranu jest o wiele wyraźniejszy. ' + (os === 'windows' ? 'Klawisz Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Naciśnij Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Brawo!</strong> Wielka czwórka: <strong>${CMDL(os)} + C</strong> kopiuj, <strong>V</strong> wklej, <strong>Z</strong> cofnij, <strong>A</strong> zaznacz wszystko. Działają w prawie każdej aplikacji.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Bezpłatny', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Bezpłatna · Zakupy w aplikacji', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Szukaj aplikacji</span></button><div class="hp"><span>WYRÓŻNIONE</span><strong>Aplikacje na twój nowy komputer</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Otwórz' : (os === 'mac' ? 'Pobierz' : 'Zainstaluj')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Instalowanie LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Sklep ćwiczeniowy: nazwy i ceny są przykładowe.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Najbezpieczniejsze miejsce na aplikacje to wbudowany sklep: <strong>${N.store[os]}</strong>. <strong>Kliknij go.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Chcesz czegoś do pisania listów, jak Word. <strong>Kliknij pole wyszukiwania.</strong> Wyszukamy „office”.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> to bezpłatna alternatywa dla Microsoft Office, tworzona przez <strong>The Document Foundation</strong>. Sprawdź, kto ją stworzył, a potem <strong>kliknij ' + (os === 'mac' ? 'Pobierz' : 'Zainstaluj') + ' obok LibreOffice</strong>.',
         hints: {'get-fake1': 'To reklama i kosztuje 29,99 £ rocznie. LibreOffice jest bezpłatny.', 'get-fake2': 'Ta jest od AppMakers i ma zakupy w aplikacji. Wybierz LibreOffice od The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Okno na stronie internetowej głosi: „Twój komputer jest wolny! Pobierz Speed Booster teraz”. Co robisz?', options: [
            {t: 'Zamykam je. Instaluję aplikacje tylko ze sklepu lub ze strony samego producenta', ok: true, why: 'Dokładnie. Okna oferujące „przyspieszacze” lub „czyściki” to często śmieci lub coś gorszego.'},
            {t: 'Pobieram, może pomoże', why: 'To często śmieci lub coś szkodliwego. Instaluj tylko ze sklepu lub ze strony samego producenta.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Brawo!</strong> LibreOffice jest zainstalowany. Sprawdzaj producenta, ignoruj reklamy i uważaj na „darmowe” aplikacje, które później chcą pieniędzy.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Ekran główny'], ['system', 'System'], ['bluetooth', 'Bluetooth i urządzenia'], ['network', 'Sieć i internet'], ['accounts', 'Konta'], ['privacy', 'Prywatność i zabezpieczenia'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Strona główna</h3><p class="cf">Zalecane ustawienia i twoje konto.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Jesteś na bieżąco</p>' : ctx.ready ? `<p class="cf">Wymagane ponowne uruchomienie, aby dokończyć instalację aktualizacji.</p><button type="button" class="ce co bz" data-tap="restart">Uruchom ponownie teraz</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Pobieranie… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Ustawienia', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Ogólne'], ['privacy', 'Prywatność i bezpieczeństwo'], ['users', 'Użytkownicy i grupy']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Twój Mac jest aktualny</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Pobieranie… pozostało około 10 minut' : 'Poprawki zabezpieczeń i błędów'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Prywatność i bezpieczeństwo</h3><p class="cf"><strong>Zabezpieczenia</strong><br>Zezwalaj na aplikacje z:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store i znani deweloperzy</button>`,
            };
            return pcWin(os, 'Ustawienia systemowe', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Ustawienia systemowe</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Menedżer aktualizacji', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Twój system jest aktualny</p>' : `<div class="ahf">${['Przeglądarka internetowa Firefox', 'Jądro Linuksa (zabezpieczenia)', 'LibreOffice', 'Biblioteki systemowe'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Instalowanie aktualizacji…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Wymagane uwierzytelnienie</strong></p><p class="fd">Wpisz hasło, aby zainstalować aktualizacje. (Ćwiczenie: wpisano je za ciebie.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Anuluj</button><button type="button" class="adg" data-tap="auth-ok">Uwierzytelnij</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Aktualizacje naprawiają luki w zabezpieczeniach, które wykorzystują oszuści. Sprawdźmy, czy są dostępne. <strong>Kliknij Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Kliknij Ustawienia</strong> (kółko zębate).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Kliknij Windows Update</strong>, na dole listy po lewej.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Czekają aktualizacje. <strong>Kliknij Pobierz i zainstaluj wszystko.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Najpierw zapisz wszystko, nad czym pracujesz, a potem <strong>kliknij Uruchom ponownie teraz</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Aktualizacje naprawiają luki w zabezpieczeniach, które wykorzystują oszuści. <strong>Kliknij menu Apple</strong> (logo) w lewym górnym rogu.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Kliknij Ustawienia systemowe…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Jesteś w Ogólne. <strong>Kliknij Aktualizacja oprogramowania.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Aktualizacja jest gotowa. Podłącz ładowarkę, a potem <strong>kliknij Zaktualizuj teraz</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac ją pobiera, a potem uruchamia się ponownie, żeby ją zainstalować.',
         question: {q: 'Aktualizacje automatyczne są włączone. Czy nadal musisz coś robić?', options: [
            {t: 'Tylko uruchomić ponownie, gdy o to poprosi, i od czasu do czasu zostawić w ładowarce na noc', ok: true, why: 'Tak. Aktualizacje często instalują się w nocy. Ponowne uruchomienie na prośbę je kończy.'},
            {t: 'Wyłączyć aktualizacje automatyczne', why: 'Zostaw je włączone: chronią cię. Po prostu uruchom ponownie, gdy Mac o to poprosi.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Aktualizacje naprawiają luki w zabezpieczeniach. W Linux Mint <strong>tarcza</strong> obok zegara pokazuje kropkę, gdy czekają aktualizacje. <strong>Kliknij tarczę.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Menedżer aktualizacji wyświetla je wszystkie. <strong>Kliknij Zainstaluj aktualizacje.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux prosi o <strong>twoje hasło</strong>, zanim zmieni cokolwiek ważnego. To dobrze. <strong>Kliknij Uwierzytelnij.</strong>', hints: {'auth-cancel': 'To anuluje aktualizacje. Kliknij Uwierzytelnij.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Jak często należy instalować aktualizacje?', options: [
            {t: 'Za każdym razem, gdy tarcza pokazuje kropkę: to zajmuje tylko minutę', ok: true, why: 'Tak. Linux Mint rzadko wymaga ponownego uruchomienia, poza niektórymi aktualizacjami zabezpieczeń.'},
            {t: 'Raz w roku', why: 'Instaluj je za każdym razem, gdy tarcza pokazuje kropkę. To zajmuje tylko minutę.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Brawo!</strong> Twój komputer jest aktualny. Aktualizowanie to najlepsza rzecz, jaką możesz zrobić, żeby być bezpiecznym.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'System', 'Ekran, dźwięk, informacje'], ['tile-devices', '⟦printer⟧', 'Urządzenia', 'Bluetooth, drukarki'], ['tile-network', '⟦globe⟧', 'Sieć i internet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Konta', 'Twoje konta'], ['tile-update', '⟦refresh-cw⟧', 'Aktualizacja i zabezpieczenia', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Twój komputer jest zapisany do Rozszerzonych aktualizacji zabezpieczeń</p><p class="cf">Aktualizacje zabezpieczeń do 12 października 2027.</p>' : `<div class="ahg"><strong>Wsparcie dla Windows 10 się zakończyło</strong><p>Twój komputer nie spełnia wymagań, aby uruchomić Windows 11. Zapisz się do Rozszerzonych aktualizacji zabezpieczeń, aby nadal je otrzymywać.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Zapisz się teraz</button></div>`}`;
        else inner = `<h3>Rozszerzone aktualizacje zabezpieczeń</h3><p class="cf">Wybierz sposób zapisu:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Utwórz kopię ustawień komputera</strong><small>Bezpłatnie, z kontem Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Użyj 1000 punktów Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Zakup jednorazowy</strong><small>Płatne</small></button>${ctx.busy ? '<p class="cf">Zapisywanie…</p>' : ''}`;
        return pcWin('windows', 'Ustawienia', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Jeśli twój komputer wygląda tak, z Start po lewej stronie, może to być <strong>Windows 10</strong>. Sprawdźmy. <strong>Kliknij Start.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Kliknij Ustawienia</strong> (kółko zębate).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Kliknij System.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Jest napisane Windows 10 Home. Co to oznacza w 2026 roku?', options: [
            {t: 'Microsoft zakończył normalne wsparcie w październiku 2025. Nadal działa, ale potrzebuje Rozszerzonych aktualizacji zabezpieczeń, żeby być bezpieczny', ok: true,
             why: 'Tak. Bezpłatny program Rozszerzonych aktualizacji zabezpieczeń dla użytkowników domowych trwa teraz do 12 października 2027. Potem Windows 10 nie dostaje już poprawek zabezpieczeń.'},
            {t: 'Nic, Windows 10 będzie aktualizowany w nieskończoność', why: 'Normalne wsparcie zakończyło się w październiku 2025. Rozszerzone aktualizacje zabezpieczeń trwają teraz do 12 października 2027, a potem się kończą.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Kliknij ← Strona główna</strong>, żeby wrócić.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Kliknij Aktualizacja i zabezpieczenia.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Ten laptop jest za stary na Windows 11, więc Windows oferuje <strong>Rozszerzone aktualizacje zabezpieczeń</strong>. <strong>Kliknij Zapisz się teraz.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Bezpłatny sposób to utworzenie kopii ustawień na koncie Microsoft. <strong>Kliknij Utwórz kopię ustawień komputera.</strong>', hints: {'esu-buy': 'Nie musisz płacić. Wybierz bezpłatną opcję kopii.', 'esu-points': 'To działa, jeśli masz punkty, ale opcja kopii jest bezpłatna dla wszystkich.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Jakie masz możliwości przed październikiem 2027?', options: [
            {t: 'Przejść na Windows 11, jeśli się da, kupić nowy komputer albo przełączyć starszy na Linux Mint (bezpłatny)', ok: true, why: 'Tak. Linux Mint jest bezpłatny i dobrze działa na starszych laptopach. Kolejne lekcje pokazują, co gdzie jest na Macu i w Linux Mint.'},
            {t: 'Używać Windows 10 po 2027 do bankowości', why: 'Po październiku 2027 nie dostaje poprawek zabezpieczeń, więc nie jest bezpieczny do bankowości. Przejdź na nowszy system, wymień komputer lub przełącz się na Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Brawo!</strong> Wiesz, jaki masz Windows i jak go zabezpieczyć do października 2027. Uważaj na telefony i okna z ofertą „aktualizacji” za opłatą: to oszustwa.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Przesiadasz się z Windows? Na Macu aplikacje są w <strong>Docku</strong> na dole, a menu każdej aplikacji w <strong>pasku menu</strong> u góry. <strong>Kliknij Safari</strong>, przeglądarkę internetową, w Docku.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Przyciski okna są w <strong>lewym górnym rogu</strong> na Macu. <strong>Kliknij czerwony</strong>, żeby zamknąć okno.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Okno zniknęło, ale widzisz <strong>kropkę pod Safari</strong> w Docku? Nadal działa. Aby je zakończyć, <strong>kliknij prawym przyciskiem Safari w Docku</strong> (dwoma palcami na gładziku).', hint: 'Kliknij prawym przyciskiem (albo dwoma palcami) ikonę Safari w Docku.',
         hints: {'app-browser': 'Zwykłe kliknięcie otwiera je ponownie. Kliknij zamiast tego prawym przyciskiem.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Kliknij Zakończ.</strong> <em>(Skrót to ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Ustawienia są w <strong>menu Apple</strong> (logo) w lewym górnym rogu. <strong>Kliknij je.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Wyłącz i Uruchom ponownie też są tutaj. <strong>Kliknij Ustawienia systemowe…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'W Windows kopiujesz przez Ctrl + C. Jak to jest na Macu?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Tak. Większość skrótów Windows używa na Macu ⟦command⟧ Cmd zamiast Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, tak samo', why: 'Na Macu to ⟦command⟧ Cmd + C. Większość skrótów z Ctrl zamienia się w ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Brawo!</strong> Dock na dole, menu u góry, przyciski okna w lewym górnym rogu, ⟦command⟧ Cmd zamiast Ctrl i menu Apple do ustawień i wyłączania.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> to bezpłatny system, który działa podobnie do Windows i dobrze radzi sobie na starszych komputerach. Twoje aplikacje są w <strong>Menu</strong> w lewym dolnym rogu, jak przycisk Start. <strong>Kliknij Menu.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint ma zainstalowane bezpłatne aplikacje. Do pisania listów użyj <strong>LibreOffice Writer</strong>, który działa jak Microsoft Word. <strong>Kliknij go.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Bez tytułu 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Plik Edycja Widok Wstaw Format <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Szanowni Państwo,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Czy możesz otwierać dokumenty Word, które ludzie ci wysyłają e-mailem?', options: [
            {t: 'Tak. LibreOffice otwiera i zapisuje pliki Word (.docx)', ok: true, why: 'Tak. Zapisując coś dla użytkownika Worda, wybierz format Word (.docx) w Zapisz jako.'},
            {t: 'Nie, do tego potrzebujesz Windows', why: 'LibreOffice otwiera i zapisuje pliki Word (.docx), więc możesz wymieniać dokumenty z użytkownikami Worda.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Bez tytułu 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Szanowni Państwo,</div></div>', {max: true})}),
         target: 'win-close', say: 'Przyciski okna są w prawym górnym rogu, tak jak w Windows. <strong>Kliknij ⟦x⟧</strong>, żeby zamknąć Writera.'},
        {screen: () => desk('linux'), target: 'start', say: 'Teraz znajdźmy, skąd brać więcej aplikacji. <strong>Kliknij Menu</strong> jeszcze raz.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Menedżer oprogramowania</strong> to bezpłatny sklep z aplikacjami Linux Mint. <strong>Kliknij go.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Menedżer oprogramowania', `<div class="jo"><div class="gq">${ICON.search}<span>Szukaj</span></div>
            <div class="aan">${['Internet', 'Biuro', 'Grafika', 'Dźwięk i wideo', 'Gry', 'Dostępność'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Tysiące bezpłatnych aplikacji, sprawdzonych przez Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Czy musisz kupować antywirus do Linux Mint?', options: [
            {t: 'Nie. Aktualizuj go, bierz aplikacje z Menedżera oprogramowania, a będziesz dobrze chroniony', ok: true, why: 'Tak. W Linuksie jest niewiele wirusów. Aktualizacje i wbudowana zapora robią swoje. Oszustwa w e-mailach i na stronach nadal obowiązują, więc zachowaj czujność.'},
            {t: 'Tak, najdroższy', why: 'Nie. Aktualizuj go i bierz aplikacje z Menedżera oprogramowania. Uważaj na oszustwa e-mailowe i internetowe jak zwykle.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Brawo!</strong> Menu w lewym dolnym rogu, zamykanie w prawym górnym, LibreOffice do dokumentów, Firefox do internetu, Menedżer oprogramowania do aplikacji i tarcza do aktualizacji.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ Pendrive podłączony</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Zanim zmienisz komputer, skopiuj pliki na <strong>pendrive</strong>. Wsuń go do gniazda USB z boku komputera. Tutaj <strong>kliknij Podłącz pendrive</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ Pendrive podłączony</div>'}), target: 'app-files', say: `<strong>Otwórz ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Otwórz'], ['menu-copy', 'Kopiuj'], ['menu-rename', 'Zmień nazwę']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Twoje listy są w <strong>Dokumentach</strong>. <strong>Kliknij prawym przyciskiem folder Dokumenty.</strong> <em>(Potem zrób to samo z Obrazami.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Kliknij Kopiuj.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Twój pendrive jest po lewej. <strong>Kliknij Pendrive.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Jest pusty. <strong>Kliknij prawym przyciskiem na pustym miejscu.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Kliknij ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Kopiowanie 214 elementów… pozostała 1 minuta' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Wysuń']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Gotowe! Zanim wyjmiesz pendrive, <strong>wysuń go</strong>, żeby nic się nie uszkodziło. <strong>Kliknij prawym przyciskiem Pendrive</strong> po lewej.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Kliknij Wysuń.</strong> Wtedy można go bezpiecznie wyjąć.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Inny sposób przeniesienia plików na nowy komputer?', options: [
            {t: 'Pamięć online: OneDrive, iCloud lub Dysk Google', ok: true, why: 'Tak. Wyślij je ze starego komputera, zaloguj się na nowym i są tam. Pendrive to też dobra dodatkowa kopia.'},
            {t: 'Wysłać sobie każdy plik e-mailem po kolei', why: 'To by trwało wieki! Użyj pendrive\'a albo pamięci online, takiej jak OneDrive, iCloud lub Dysk Google.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Brawo!</strong> Na nowym komputerze włóż pendrive, otwórz go i skopiuj foldery do Dokumentów i Obrazów.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Godziny autobusów w Bridlington ⟦star⟧ Przepisy</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Nie zalogowano</span><button type="button" data-tap="sync">Włącz synchronizację…</button><button type="button" data-tap="guest">Otwórz profil gościa</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Zaloguj się przez Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Ćwiczenie: wpisano za ciebie.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Dalej</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Włączyć synchronizację?</strong></p><p class="fd">Twoje zakładki, hasła i historia zostaną zapisane na koncie Google i pojawią się na wszystkich twoich urządzeniach.</p><div class="jn"><button type="button" data-tap="cancel">Anuluj</button><button type="button" class="adg" data-tap="yes-in">Tak, włączam</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Nowa karta</span>${profile}</div><div class="qn">⟦search⟧ Wyszukaj w Google lub wpisz adres URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Synchronizowanie zakładek…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Jeśli używałeś <strong>Chrome</strong> na starym komputerze, zalogowanie przenosi zakładki i zapisane hasła na nowy. (Firefox i Edge działają tak samo.) <strong>Kliknij Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Kliknij ikonę osoby</strong> w prawym górnym rogu.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Kliknij Włącz synchronizację…</strong>', hints: {guest: 'Profil gościa niczego nie zapisuje. Kliknij Włącz synchronizację.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Zaloguj się <strong>tym samym kontem Google</strong>, którego używałeś na starym komputerze. <strong>Kliknij Dalej.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Kliknij Tak, włączam.</strong>', hints: {cancel: 'To zatrzymuje synchronizację. Kliknij Tak, włączam.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Twoje zakładki wróciły. Czy zapisywanie haseł w przeglądarce jest bezpieczne?', options: [
            {t: 'Tak, jeśli konto Google ma silne hasło i weryfikację dwuetapową', ok: true, why: 'Tak. To o wiele bezpieczniej niż używanie jednego hasła wszędzie. Chroń samo konto weryfikacją dwuetapową.'},
            {t: 'Nie, zapisz je zamiast tego na karteczce przyklejonej do ekranu', why: 'Menedżer haseł w przeglądarce jest o wiele bezpieczniejszy niż karteczka na ekranie, o ile twoje konto ma weryfikację dwuetapową.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Brawo!</strong> Twoje zakładki i hasła przeniosły się za tobą. Na publicznym lub współdzielonym komputerze nie włączaj synchronizacji.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'System'} Alert bezpieczeństwa ⚠️</strong>
            <p>Twój komputer jest ZAINFEKOWANY 5 wirusami! Twoje dane bankowe i zdjęcia są zagrożone.</p><p>Nie wyłączaj komputera. Zadzwoń teraz do pomocy technicznej:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Zadzwoń teraz</button><button type="button" data-tap="fake-close">Zamknij</button></div>
            <small>(Ćwiczeniowa strona oszustów. Ten numer nie jest prawdziwy.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Opuścić stronę?</strong></p><p class="fd">Wprowadzone zmiany mogą nie zostać zapisane.</p><div class="jn"><button type="button" data-tap="stay">Zostań</button><button type="button" class="adg" data-tap="leave">Opuść</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'To nagle wypełniło ci ekran podczas przeglądania. Czy to prawda?', options: [
            {t: 'Nie. To fałszywa strona, która ma cię przestraszyć, żebyś zadzwonił do oszustów', ok: true, why: 'Dokładnie. Prawdziwe ostrzeżenia nigdy nie pokazują numeru telefonu, pod który trzeba zadzwonić. Nie dzwoń i niczego nie klikaj na tej stronie.'},
            {t: 'Tak, szybko dzwonię pod ten numer', why: 'Nigdy nie dzwoń. To fałszywa strona. „Pomoc techniczna” będzie próbować przejąć kontrolę nad twoim komputerem i pieniędzmi.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Wypełniło cały ekran, więc nie widać, jak je zamknąć. Naciśnij klawisz <strong>Esc</strong> (w lewym górnym rogu klawiatury), żeby wyjść z trybu pełnoekranowego.',
         hints: {'call-btn': 'Nigdy! Naciśnij klawisz Esc.', 'fake-close': 'Przyciski na stronie mogą być pułapkami. Naciśnij zamiast tego klawisz Esc na klawiaturze.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Teraz widać przeglądarkę. <strong>Zamknij kartę</strong> za pomocą jej ⟦x⟧.',
         hints: {'call-btn': 'Niczego nie klikaj na stronie. Zamknij kartę za pomocą jej ⟦x⟧.', 'fake-close': 'To część fałszywej strony. Użyj ⟦x⟧ na samej karcie.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Próbuje cię tam zatrzymać. <strong>Kliknij Opuść.</strong>', hints: {stay: 'Kliknij Opuść.'}},
        {screen: c => scareware(os, c), question: {q: 'A jeśli w ogóle się nie zamyka?', options: [
            {t: os === 'windows' ? 'Naciśnij Ctrl + Shift + Esc, aby otworzyć Menedżera zadań, wybierz przeglądarkę i kliknij Zakończ zadanie' : os === 'mac' ? 'Naciśnij ⟦command⟧ Cmd + Option + Esc i wymuś zakończenie przeglądarki' : 'Kliknij prawym przyciskiem przeglądarkę na panelu i wybierz Zamknij albo uruchom komputer ponownie',
             ok: true, why: 'Tak. Gdy ponownie otworzysz przeglądarkę, nie pozwól jej przywrócić starych stron. Ponowne uruchomienie komputera też działa.'},
            {t: 'Zadzwonić pod ten numer po pomoc w zamknięciu', why: 'Nigdy tam nie dzwoń. ' + (os === 'windows' ? 'Użyj Ctrl + Shift + Esc (Menedżer zadań), aby zamknąć przeglądarkę.' : os === 'mac' ? 'Użyj ⟦command⟧ Cmd + Option + Esc, aby wymusić zakończenie.' : 'Zamknij przeglądarkę z panelu albo uruchom komputer ponownie.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Brawo!</strong> Twój komputer nigdy nie był zainfekowany: to była tylko strona internetowa. Jeśli zadzwoniłeś pod taki numer, skontaktuj się z bankiem i zmień hasła z innego urządzenia.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Zabezpieczenia Windows', `<div class="aif"><h3>Ochrona przed wirusami i zagrożeniami</h3><p class="mj">⟦check⟧ Brak bieżących zagrożeń</p>
                <p class="cf">Ostatnie skanowanie: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Trwa szybkie skanowanie… przeskanowano 12 840 plików</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Ochrona przed wirusami</span><span>⟦check⟧ Zapora</span><span>⟦check⟧ Kontrola aplikacji i przeglądarki</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Konfiguracja zapory', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Zapora jest włączona</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows ma wbudowany bezpłatny antywirus, zwany <strong>Zabezpieczenia Windows</strong>. Sprawdźmy, czy działa. <strong>Kliknij Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Kliknij Ustawienia.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Kliknij Prywatność i zabezpieczenia</strong> po lewej.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Kliknij Zabezpieczenia Windows.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Zielone ptaszki oznaczają, że jesteś chroniony. Dla spokoju <strong>kliknij Szybkie skanowanie</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Czy musisz płacić za dodatkowy antywirus?', options: [
            {t: 'Nie. Zabezpieczenia Windows wystarczają większości ludzi, a dwa mogą spowalniać komputer', ok: true, why: 'Tak. Aktualizuj Windows i zostaw Zabezpieczenia Windows włączone. Płatne często tylko dodają okna i subskrypcje.'},
            {t: 'Tak, im więcej, tym lepiej', why: 'Dwa programy antywirusowe mogą się gryźć i spowalniać pracę. Zabezpieczenia Windows wystarczają większości ludzi.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac ma wbudowaną bezpłatną ochronę, która w tle sprawdza aplikacje i pliki. Sprawdźmy jedno ustawienie. <strong>Kliknij menu Apple</strong> (logo).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Kliknij Ustawienia systemowe…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Kliknij Prywatność i bezpieczeństwo</strong> po lewej.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Wybrane jest „Zezwalaj na aplikacje z App Store i znani deweloperzy”. Czy powinieneś to zmienić?', options: [
            {t: 'Nie, zostaw. Blokuje aplikacje od nieznanych producentów', ok: true, why: 'Tak. Jeśli strona każe ci to zmienić, żeby coś zainstalować, to duży sygnał ostrzegawczy.'},
            {t: 'Tak, zezwalaj na aplikacje z dowolnego źródła', why: 'Zostaw tak, jak jest. Zatrzymuje aplikacje od nieznanych producentów. Strona każąca ci to zmienić to sygnał ostrzegawczy.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Ustawienia systemowe', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Czy musisz kupować antywirus do Maca?', options: [
            {t: 'Większość ludzi nie. Aktualizuj go i instaluj aplikacje tylko z zaufanych miejsc', ok: true, why: 'Tak. Aktualizacje i wbudowana ochrona robią swoje. Okna głoszące, że Mac jest zainfekowany, to oszustwa.'},
            {t: 'Tak, każdy, który zaoferuje wyskakujące okno', why: 'Okna oferujące antywirus do Maca to zwykle oszustwa. Zamiast tego aktualizuj Maca.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint ma wbudowaną <strong>zaporę</strong>, która blokuje niechciane połączenia. Jest wyłączona, dopóki jej nie włączysz. <strong>Kliknij Menu.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Kliknij Zapora.</strong> <em>(Wyszukaj „zapora” w Menu, jeśli jej nie widzisz.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Kliknij przełącznik Stan</strong>, żeby włączyć zaporę.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Co jeszcze chroni Linux Mint?', options: [
            {t: 'Instalowanie aktualizacji, gdy tarcza pokazuje kropkę, i bierzenie aplikacji z Menedżera oprogramowania', ok: true, why: 'Tak. I zwykłe zasady: ostrożność z linkami w e-mailach i wyskakującymi oknami.'},
            {t: 'Nic więcej nie jest potrzebne', why: 'Instaluj aktualizacje i bierz aplikacje z Menedżera oprogramowania. Oszustwa w e-mailach i na stronach nadal obowiązują.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Brawo!</strong> Wbudowana ochrona twojego komputera jest włączona. Resztę załatwiają aktualizacje, ostrożność z linkami i instalowanie tylko z zaufanych miejsc.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Dostawa paczek</strong><span>Nie zastaliśmy cię: umów dostawę ponownie dziś</span></button>
            <div class="lx"><strong>Sarah</strong><span>Zdjęcia z niedzieli</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Sobotni spacer</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Dostawa paczek</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Próbowaliśmy dziś dostarczyć twoją paczkę, ale nikogo nie było w domu. Aby umówić ponowną dostawę, wymagana jest opłata 1,45 £.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Umów ponowną dostawę</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Zgłoś wyłudzanie informacji</button><button type="button" data-tap="reply">Odpowiedz</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Poczta', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Zgłoszono i przeniesiono do spamu</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Oto twój e-mail, w przeglądarce. <strong>Otwórz e-mail od Dostawy paczek.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Na komputerze możesz sprawdzić, dokąd naprawdę prowadzi link, <strong>bez klikania w niego</strong>. <strong>Najedź myszą na „Umów ponowną dostawę”</strong> i potrzymaj nieruchomo. <em>(Na ekranie dotykowym naciśnij i przytrzymaj.)</em>',
         hints: {'click-link': 'Nie klikaj! Po prostu zatrzymaj wskaźnik myszy nad nim.'}, hint: 'Zatrzymaj wskaźnik myszy nad niebieskim linkiem, bez klikania.'},
        {screen: c => webmail(os, c), question: {q: 'Na dole pojawia się prawdziwy adres: parcel-redelivery.example.top. Czy jest bezpieczny?', options: [
            {t: 'Nie. To nie strona prawdziwej firmy kurierskiej, a chcą opłaty', ok: true, why: 'Tak. Kurierzy nie pobierają drobnych opłat przez e-mail ani SMS. Prawdziwy adres to zdradza.'},
            {t: 'Tak, jest w nim „parcel”', why: 'Każdy może wpisać „parcel” w adresie. To nie prawdziwy kurier, a opłata to oszustwo.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Kliknij Zgłoś wyłudzanie informacji.</strong> Oszukańcze e-maile możesz też przesyłać na report@phishing.gov.uk.', hints: {reply: 'Nigdy nie odpowiadaj oszustom. Kliknij Zgłoś wyłudzanie informacji.', 'click-link': 'Nie klikaj linku! Zgłoś go zamiast tego.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Brawo!</strong> Najedź, zanim klikniesz: jeśli adres nie pasuje do firmy, nie klikaj.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (numer ćwiczeniowy). To prawdziwy kod do sprawdzenia numeru IMEI telefonu.',
        '999': 'To telefon ćwiczeniowy, więc nie może dzwonić pod 999. W prawdziwym nagłym wypadku zadzwoń pod 999 lub 112.',
        '112': 'To telefon ćwiczeniowy, więc nie może dzwonić pod 112. 112 działa jak 999 w Wielkiej Brytanii i w całej Europie.',
        '159': '159 bezpiecznie łączy cię z twoim bankiem. Użyj go, jeśli rozmowa o twoich pieniądzach cię niepokoi.',
        '7726': 'Na 7726 przesyła się oszukańcze SMS-y. Na starych klawiaturach telefonów układa się to w „SPAM”!',
        '123': 'speaking-clock',
        '1471': 'Numer telefonu 07700 900842 dzwonił dziś o 11:20. (Ćwiczenie. 1471 mówi, kto ostatnio dzwonił na twój telefon stacjonarny.)',
        '01189998819991197253': 'To numer alarmowy z serialu The IT Crowd. Próbowałeś wyłączyć i włączyć ponownie?',
        '101': '101 to numer policji w sprawach, które nie są nagłymi wypadkami.',
        '111': '111 to pomoc NHS, gdy sprawa jest pilna, ale to nie nagły wypadek.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Telefon', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Wpisz numer</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mama', '#f472b6', [['them', 'Myślałam, że LOL znaczy „lots of love”. Dopisywałam to do wszystkiego!'], ['them', 'Czy dlatego twoja ciocia nie odpisała?'], ['them', 'Wysłano z mojego iPada']]],
        ['Nieznany', '#94a3b8', [['them', 'Gratulacje! Wygrałeś DARMOWY telefon. Kliknij tutaj, aby odebrać: prize-winner.example'], ['note', 'To oszustwo. Nie dotykaj linku: prześlij go na 7726, a potem usuń.']]],
        ['Sarah', '#a78bfa', [['them', 'Tata uczy się używać emotikonów 😂'], ['them', 'Przysłał mi bakłażana i napisał „na kolację dziś?” 🍆']]],
        ['Dentysta', '#38bdf8', [['them', 'Przypomnienie: twoja wizyta jest we wtorek o 10:30. Odpowiedz Y, aby potwierdzić.']]],
    ];
    const MUM_REPLIES = ['Kto to?', 'Zadzwoń do mnie, nie mogę czytać SMS-ów bez okularów', 'Świetnie! 👍', 'Dostałeś moją ostatnią wiadomość? Wysłałam ją kotu przez pomyłkę.', 'Wysłano z mojego iPada', 'OK kochanie xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Wiadomości', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Mewa znowu atakuje' : 'Zdjęcie', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Przyłapana na gorącym uczynku na promenadzie w Bridlington. Frytek nie odzyskano.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Zdjęcia', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Zegar', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Pogoda', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Zimno, przelotny śnieg' : 'Przejaśnienia, wietrznie'}</p>
            <div class="ajf">${[['pt.', '⟦cloud-rain⟧', '11°'], ['sob.', '⟦wind⟧', '10°'], ['niedz.', '⟦sun⟧', '14°'], ['pon.', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Ostrzeżenie przed mewami: <strong>wysokie</strong>. Pilnuj swoich frytek.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Przez szafę, a potem idź dalej, mijając latarnię.', home: 'Nie ma jak w domu. 🏠', 'Księżyc': '238 855 mil. Ruch niewielki.',
        chips: 'Najbliższy bar z frytkami: gdziekolwiek na promenadzie w Bridlington. 🍟', 'north pole': 'Warsztat Świętego Mikołaja. Zamknięty do grudnia. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Śliczne miejsce!',
        'flamborough': 'Flamborough Head: latarnia morska, klify i maskonury. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `„${inp.value.trim()}”: ta ćwiczeniowa mapa zna tylko kilka miejsc. Spróbuj Bridlington, Flamborough lub Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Ustawienia', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Tryb samolotowy' : 'Tryb samolotowy', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Tryb ciemny', st.dark)}${row('dnd', 'Nie przeszkadzać', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Informacje' : 'Informacje o telefonie'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Informacje' : 'Informacje o telefonie', `<div class="aic"><div class="lq">
            <div class="ho"><span>Nazwa</span><b>Telefon Margaret</b></div>
            <div class="ho"><span>Model</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Wersja iOS' : 'Wersja Androida'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Pamięć</span><b>Dużo miejsca na zdjęcia wnuków</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Numer seryjny</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Klasyczna gra ze starych telefonów komórkowych.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Zawiera reklamy · Zakupy w aplikacji'], ['knit', '⟦scissors⟧', 'Wzory na drutach', 'Wkrótce w tym ćwiczeniowym sklepie.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Sklep Play', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Otwórz' : (p === 'ios' ? 'Pobierz' : 'Zainstaluj')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Wynik: <b class="ado">0</b></span><span>Najlepszy: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Dotknij kierunku (albo użyj klawiszy strzałek), aby zacząć</p>
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
                f.querySelector('.vy').textContent = `Koniec gry! Wynik ${score}. Dotknij kierunku, aby zagrać ponownie.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Tryb samolotowy', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Nie przeszkadzać', st.dnd)}${t('torch', '⟦flashlight⟧', 'Latarka', st.torch)}${t('dark', '⟦sun-moon⟧', 'Tryb ciemny', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Przesuń w górę, aby zamknąć' : 'Zamknij'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Nowa tapeta');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `„Przy trzecim sygnale będzie godzina ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} i ${t.getSeconds()} sekund… pip, pip, pip.” (Stary zegar mówiący!)`; return; }
                msg.textContent = egg || (n ? 'Ten telefon ćwiczeniowy nie wykonuje prawdziwych połączeń. Wypróbuj 123, 1471 lub *#06#…' : 'Najpierw wpisz numer.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Prześlij swoje dane bankowe, aby odebrać nagrodę!!! (To oszustwo. Zablokuj ten numer.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Dziękujemy, twoja wizyta została potwierdzona. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Poczta', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Start'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Zatrzymaj'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Start'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Krem z filtrem nałożony! To praktycznie Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Latarka włączona. (Świeci ekran zamiast światła z tyłu.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Tryb samolotowy włączony: bez połączeń, SMS-ów i danych mobilnych.' : 'Tryb samolotowy wyłączony.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Tapeta zmieniona. Wróć na ekran główny, żeby ją zobaczyć!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Jesteś teraz programistą! (Prawdziwy sekret Androida: dotknij 7 razy Numer kompilacji.)' : st.build >= 3 ? `Do zostania programistą dzieli cię ${7 - st.build} kroków.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Dziękujemy za ćwiczenia!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Nie potrzebujesz aplikacji latarki: jest wbudowana w szybkie ustawienia telefonu. Darmowe aplikacje latarki są często pełne reklam albo gorzej!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Tylko dla ozdoby w ćwiczeniowym sklepie.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Instalowanie…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Otwórz'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Aplikacja', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Ta ćwiczeniowa aplikacja jest częścią własnej lekcji. Zajrzyj do kursów, żeby wypróbować ją porządnie.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Znalazłeś sekret!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Połączenie zakończone' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Nieznany' ? 'Dzwoniący' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Nieznany', number: '0161 496 0423', who: 'm', tag: 'Nie ma w twoich kontaktach',
         intro: 'Twój telefon dzwoni. Numeru nie ma w twoich kontaktach. <strong>Odbierz</strong>, żeby poćwiczyć. <em>Zwiększ głośność, żeby słyszeć dzwoniącego.</em>',
         lines: [
            {text: 'Dzień dobry, tu Mark z zespołu ds. oszustw w twoim banku. Zauważyliśmy podejrzane płatności na twoim koncie. Zanim przejdę dalej, czy możesz potwierdzić swoje pełne imię i nazwisko, datę urodzenia oraz długi numer z karty bankowej?',
             q: 'Dzwoniący mówi, że jest z twojego banku. Co robisz?', options: [
                {t: 'Podaję dane, to przecież bank', why: 'Bank, który do ciebie dzwoni, nigdy nie poprosi o pełny numer karty. W ten sposób oszuści zdobywają twoje dane.'},
                {t: 'Mówię, że oddzwonię do banku na numer z karty, i się rozłączam', ok: true, why: 'Dokładnie. Zadzwoń na numer z karty, jeśli się da z innego telefonu, albo wybierz 159.'},
                {t: 'Proszę, żeby udowodnił, kim jest', why: 'Oszuści brzmią przekonująco i często znają już część twoich danych. Najbezpieczniej rozłączyć się i samemu zadzwonić do banku.'}]},
            {text: 'Proszę się nie rozłączać! Przestępcy właśnie teraz zabierają pieniądze z pani konta. Musi pani przenieść wszystko na bezpieczne konto, które dla pani założę. Musimy to zrobić w ciągu najbliższych dziesięciu minut.',
             q: 'Mówi, że to pilne i musisz przenieść pieniądze. Co teraz?', options: [
                {t: 'Szybko przenoszę pieniądze, zanim będzie za późno', why: 'Nie ma czegoś takiego jak „bezpieczne konto”. Bank nigdy nie poprosi cię o przeniesienie pieniędzy. To właśnie jest oszustwo.'},
                {t: 'Rozłączam się. Prawdziwy bank nigdy nie prosi o przeniesienie pieniędzy na „bezpieczne konto”', ok: true, why: 'Tak. Pośpiech i „bezpieczne konto” to sygnały oszustwa. Rozłącz się i wybierz 159.'}]}],
         hang: 'Rozłącz się czerwonym przyciskiem.'},
        {letter: '?', color: '#64748b', name: 'Nieznany', number: '020 7946 0815', who: 'robot', tag: 'Nie ma w twoich kontaktach',
         intro: 'Kolejne połączenie. <strong>Odbierz.</strong>',
         lines: [
            {text: 'To automatyczna wiadomość z H M R C. Wydano nakaz aresztowania pana za niezapłacony podatek. Aby porozmawiać z funkcjonariuszem, proszę nacisnąć teraz 1.',
             q: 'Nagrany głos mówi, że zostaniesz aresztowany za podatek. Co robisz?', options: [
                {t: 'Naciskam 1, żeby to załatwić', why: 'Naciśnięcie 1 łączy z oszustami, którzy zażądają zapłaty, często kartami podarunkowymi. HMRC nigdy nie grozi aresztowaniem w nagranej wiadomości.'},
                {t: 'Rozłączam się. HMRC nie dzwoni z groźbami aresztowania', ok: true, why: 'Zgadza się. HMRC najpierw pisze do ciebie i nigdy nie grozi aresztowaniem przez telefon.'}]}],
         hang: 'Rozłącz się.'},
        {letter: '?', color: '#64748b', name: 'Nieznany', number: '0113 496 0332', who: 'm', tag: 'Nie ma w twoich kontaktach',
         intro: 'Znów twój telefon. <strong>Odbierz.</strong>',
         lines: [
            {text: 'Dzień dobry, dzwonię z działu technicznego Windows. Twój komputer wysyłał do nas komunikaty o błędach i ma bardzo niebezpiecznego wirusa. Proszę podejść i włączyć komputer, a pomogę go naprawić.',
             q: 'Mówi, że twój komputer ma wirusa. Co robisz?', options: [
                {t: 'Włączam komputer i wykonuję jego polecenia', why: 'Poprosiłby cię o zainstalowanie programu, który pozwala mu sterować komputerem, a potem o pieniądze. Microsoft nigdy tak nie dzwoni.'},
                {t: 'Rozłączam się. Firmy komputerowe nie dzwonią w sprawie wirusów', ok: true, why: 'Dokładnie. Nigdy nie wpuszczaj dzwoniącego na swój komputer.'},
                {t: 'Tłumaczę, że nie mam komputera', why: 'Nie musisz tłumaczyć ani się spierać. Po prostu się rozłącz.'}]}],
         hang: 'Rozłącz się.'},
        {letter: '?', color: '#64748b', name: 'Nieznany', number: '0808 157 0190', who: 'f', tag: 'Nie ma w twoich kontaktach',
         intro: 'Kolejne połączenie. <strong>Odbierz.</strong>',
         lines: [
            {text: 'Dzień dobry. Na pana koncie zakupowym złożono zamówienie na nowego iPhone\'a za dziewięćset dziewięćdziesiąt dziewięć funtów. Jeśli to nie pan złożył to zamówienie, proszę nacisnąć 1, aby je anulować i porozmawiać z naszym zespołem.',
             q: 'Nie zamawiałeś iPhone\'a. Co robisz?', options: [
                {t: 'Naciskam 1, żeby anulować zamówienie', why: 'Naciśnięcie 1 łączy z oszustem, który „zwróci” ci pieniądze, prosząc o dane bankowe albo przejęcie kontroli nad komputerem.'},
                {t: 'Rozłączam się, a potem sam sprawdzam konto w aplikacji lub na stronie internetowej', ok: true, why: 'Tak. Gdyby naprawdę było zamówienie, zobaczyłbyś je na koncie. Nigdy nie używaj numeru ani przycisku podanego przez dzwoniącego.'}]}],
         hang: 'Rozłącz się.'},
        {letter: 'S', color: '#16a34a', name: 'Przychodnia', number: '01632 960211', who: 'f', tag: 'Zapisane w kontaktach',
         intro: 'Jeszcze jedno połączenie: tym razem to przychodnia lekarska, zapisana w twoich kontaktach. <strong>Odbierz.</strong>',
         lines: [
            {text: 'Dzień dobry, tu Sue z przychodni. Krótkie przypomnienie, że szczepienie przeciw grypie masz umówione na wtorek na dziesiątą. Nie musisz nic robić. Jeśli chcesz to zmienić, zadzwoń do nas na zwykły numer. Do usłyszenia!',
             q: 'Czy to połączenie to oszustwo?', options: [
                {t: 'Tak: rozłącz się i zablokuj numer', why: 'To jest w porządku! Niczego nie żądała, nie poganiała cię i kazała dzwonić na zwykły numer.'},
                {t: 'Prawdopodobnie prawdziwe: nie prosiła o pieniądze ani dane i kazała dzwonić na zwykły numer', ok: true, why: 'Dokładnie. Prawdziwe połączenia nie wywierają presji. Jeśli kiedykolwiek masz wątpliwości, oddzwoń na numer, który już masz.'}]}],
         hang: 'Rozmowa się skończyła. <strong>Dotknij czerwonego przycisku</strong>, żeby się rozłączyć.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Połączenie ${n + 1} z ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'W prawdziwym życiu można nie odbierać nieznanych numerów! W tym ćwiczeniu dotknij zielonego przycisku, żeby odebrać.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Co z tego jest oznaką oszukańczego połączenia?', options: [
            {t: 'Poganianie, groźby lub polecenie, żeby zachować to w tajemnicy', ok: true, why: 'Tak. Presja to największy sygnał. Prawdziwy dzwoniący chętnie da ci czas i pozwoli oddzwonić.'},
            {t: 'Dzwoniący zna twoje imię', why: 'Oszuści często znają twoje imię, a nawet część danych konta. Samo to nie czyni połączenia prawdziwym.'},
            {t: 'Numer wygląda na lokalny', why: 'Oszuści mogą sprawić, że na ekranie pojawi się dowolny numer, nawet lokalny albo twojego banku. Nie ufaj numerowi.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Brawo!</strong> Rozłączyłeś się z czterema oszustami i rozpoznałeś prawdziwe połączenie. Pamiętaj: w razie wątpliwości rozłącz się i oddzwoń na numer, któremu ufasz. Do swojego banku wybierz 159.'},
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
            ios: ['iPhone', 'Produkcji Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola i inne'],
            windows: ['Windows', 'Większość laptopów i komputerów stacjonarnych'], mac: ['Mac', 'Produkcji Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu i inne'],
        };
        const notSure = isPC
            ? 'Spójrz na ekran. Windows ma na dole przycisk Start (cztery małe kwadraty). Mac ma w lewym górnym rogu logo Apple. Linux Mint ma w lewym dolnym rogu przycisk Menu.'
            : 'iPhone ma z tyłu logo Apple (nadgryzione jabłko). Jeśli twój go nie ma, to prawie na pewno telefon z Androidem.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Jaki ${isPC ? 'komputer masz' : 'telefon masz'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Nie jesteś pewien?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Pokaż, gdzie</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Posłuchaj jeszcze raz</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Krok wstecz</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Przełącz ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">ĆWICZENIOWY ${isPC ? 'KOMPUTER' : 'TELEFON'}: nieprawdziwy. Nic, co tu robisz, nie jest nigdzie wysyłane.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Wyłącz głos' : 'Włącz głos'; };
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
            showBtn.textContent = 'Wróć do lekcji';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Pokaż, gdzie';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Ukończone!' : `Krok ${i + 1} z ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Dobrze!' : 'Prawie.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Dalej</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Spróbuj jeszcze raz</button>${pageNext
                ? `<button type="button" class="ap vb">Dobra robota! ${last ? 'Teraz ukończ kurs' : 'Może następna lekcja'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Prawie. ' + (step.hint || 'Przyjrzyj się jeszcze raz instrukcji.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Jeszcze nie całkiem. Przyjrzyj się jeszcze raz instrukcji.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Prawie. ' + (step.hint || 'Przyjrzyj się jeszcze raz instrukcji.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Aplikacja';
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
                else hint.textContent = 'Kliknij to prawym przyciskiem: naciśnij prawy przycisk myszy. Na gładziku Maca kliknij dwoma palcami. Na ekranie dotykowym naciśnij i przytrzymaj.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Trzymaj palec (lub przycisk myszy) wciśnięty na tym, aż coś się stanie.';
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
                showBtn.textContent = 'Pokaż, gdzie';
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
