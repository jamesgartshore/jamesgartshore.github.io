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
            ? [['phone', 'Telefone', '#22c55e', ICON.phone], ['messages', 'Mensagens', '#22c55e', ICON.bubble], ['camera', 'Câmara', '#6b7280', ICON.camera],
               ['photos', 'Fotografias', '#e5e7eb', ICON.photos], ['mail', 'Correio', '#3b82f6', ICON.mail], ['clock', 'Relógio', '#111827', ICON.clock],
               ['weather', 'Meteorologia', '#38bdf8', ICON.weather], ['maps', 'Mapas', '#22c55e', ICON.map], ['settings', 'Definições', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Telefone', '#2563eb', ICON.phone], ['messages', 'Mensagens', '#3b82f6', ICON.bubble], ['camera', 'Câmara', '#6b7280', ICON.camera],
               ['photos', 'Fotografias', '#e5e7eb', ICON.photos], ['clock', 'Relógio', '#111827', ICON.clock], ['maps', 'Mapas', '#16a34a', ICON.map],
               ['settings', 'Definições', '#475569', ICON.settings], ['weather', 'Meteorologia', '#38bdf8', ICON.weather], ['mail', 'Email', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Deslize para baixo a partir do canto superior direito ⟦chevron-down⟧' : 'Deslize para baixo a partir do topo ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Hoje</div>
                <div class="hp"><span>EM DESTAQUE</span><strong>Apps de que gostamos esta semana</strong></div>
                <div class="hp alt"><span>PRIMEIROS PASSOS</span><strong>Ideias para o seu novo iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Hoje</button><button type="button" data-tap="games">Jogos</button>
                    <button type="button" data-tap="apps">Apps</button><button type="button" data-tap="search-tab">${ICON.search}Pesquisar</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Pesquisar apps e jogos</span></button>
            <div class="tg"><span class="on">Para si</span><span>Mais populares</span><span>Crianças</span></div>
            <div class="hp"><span>SUGERIDO PARA SI</span><strong>Apps para começar</strong></div>
            <div class="hp alt"><span>POPULARES</span><strong>Mantenha o contacto</strong></div>
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
        const btnLabel = p === 'ios' ? 'Obter' : 'Instalar';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? 'Mais de 5 mil milhões de descargas' : 'Redes sociais'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Grátis</span></div></div>
                <p class="agm">No seu iPhone a sério, pode ter de carregar duas vezes no botão lateral, olhar para o ecrã para o Face ID ou escrever aqui a palavra-passe da sua Conta Apple.</p>
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
            <h3>Bem-vindo ao WhatsApp</h3>
            <p>Leia a nossa <u>Política de Privacidade</u>. Toque em "Aceitar e continuar" para aceitar os <u>Termos de Serviço</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Aceitar e continuar</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Introduza o seu número de telefone</h3>
            <p>O WhatsApp vai precisar de verificar o seu número de telefone. Podem ser aplicados custos do operador.</p>
            <div class="abt">Reino Unido <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Seguinte</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Este número está correto?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Editar</button><button type="button" data-tap="yes">${ios ? 'Sim' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>MENSAGENS · agora</strong><span>O seu código do WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Não partilhe este código com outras pessoas.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>A verificar o seu número</h3>
            <p>A aguardar a deteção automática de um código de 6 dígitos enviado por SMS para <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Não recebeu um código?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['"WhatsApp" quer aceder aos seus contactos', 'Para poder ver quais dos seus amigos usam o WhatsApp.', 'Permitir que o WhatsApp aceda aos seus contactos?']
            : ['"WhatsApp" quer enviar-lhe notificações', 'Para saber quando chega uma mensagem nova.', 'Permitir que o WhatsApp lhe envie notificações?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Informações do perfil</h3>
            <p>Escreva o seu nome e junte uma fotografia de perfil, se quiser.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">O seu nome</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Seguinte</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Conversas' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Está tudo pronto${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>As suas conversas vão aparecer aqui. Toque no botão de nova conversa para enviar mensagem a alguém dos seus contactos.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Este é o ecrã inicial do telemóvel. As apps são descarregadas da <strong>${store}</strong>. É gratuita e é o sítio seguro para obter apps. <strong>Toque em ${store}.</strong>`,
                 hint: `Procure o ícone ${store}. ${p === 'ios' ? "É azul com um A branco." : "É um triângulo colorido."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Agora tem de procurar o WhatsApp. <strong>Toque em Pesquisar</strong>, em baixo, à direita.' : 'Agora tem de procurar o WhatsApp. <strong>Toque na barra de pesquisa</strong> no topo.',
                 hint: p === 'ios' ? 'A pesquisa é a lupa em baixo, à direita.' : 'A barra de pesquisa diz "Pesquisar apps e jogos".'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Escrevemos <em>whatsapp</em> por si. Aparece uma lista de sugestões. <strong>Toque em \"whatsapp messenger\".</strong>",
                 hint: 'Toque na sugestão que diz "whatsapp messenger".'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Cuidado: algumas apps fazem-se passar pelo WhatsApp. A verdadeira chama-se <strong>WhatsApp Messenger</strong>, é criada pela <strong>WhatsApp Inc.</strong> e é gratuita. <strong>Toque em ${p === 'ios' ? 'Obter' : 'Instalar'} junto à verdadeira.</strong>`,
                 hints: {'fake1-get': 'Esta é a "WhatsUp Chat Free" da Fun Apps Ltd. É uma imitação, e a etiqueta "Anúncio" significa que é publicidade. Verifique o nome e quem a criou.',
                         'fake2-get': 'Esta é a "WA Messenger for Chat Pro" da LuckyDev Studio, uma cópia. A verdadeira é criada pela WhatsApp Inc.'},
                 hint: 'Procure "WhatsApp Messenger", criada pela "WhatsApp Inc."'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'O iPhone confirma que é mesmo você antes de instalar. Num iPhone a sério, pode usar o <strong>Face ID</strong>, a sua <strong>impressão digital</strong> (Touch ID) ou a <strong>palavra-passe da Conta Apple</strong>. Aqui, basta <strong>tocar em Instalar.</strong>',
                    hints: {'sheet-cancel': 'Cancelar interromperia a descarga. Toque antes em Instalar.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Está a descarregar. Quando terminar, o botão passa a <strong>Abrir</strong>. <strong>Toque em Abrir.</strong>`,
                 hint: 'Espere que o botão diga Abrir e depois toque nele.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'O WhatsApp abre pela primeira vez. Pede-lhe que aceite os termos. <strong>Toque em "Aceitar e continuar".</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'O WhatsApp usa o seu número de telemóvel, para os amigos o encontrarem. <strong>Toque na caixa do número de telefone</strong> e nós preenchemos um número de treino.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Num telemóvel a sério, escreveria o seu número de telemóvel. Aqui usámos um inventado: <strong>07700 900123</strong>. <strong>Toque em Seguinte.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `O WhatsApp confirma se escreveu bem. Este está certo, por isso <strong>toque em ${p === 'ios' ? 'Sim' : 'OK'}.</strong>`,
                 hints: {edit: `Tocaria em Editar se tivesse errado. Este número está certo, por isso toque em ${p === 'ios' ? 'Sim' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'O WhatsApp envia uma mensagem de texto com um código de 6 dígitos, para confirmar que o número é seu. O iPhone oferece-se para o preencher por si. <strong>Toque no código por cima do teclado.</strong>'
                    : 'O WhatsApp envia uma mensagem de texto com um código de 6 dígitos, para confirmar que o número é seu. Muitos telemóveis Android preenchem-no sozinhos. Se o seu não o fizer, <strong>toque na mensagem</strong> no topo.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Enquanto configura, um amigo envia-lhe uma mensagem: <em>"Olá! Enviei-te um código de 6 dígitos por engano, podes devolvê-lo?"</em> O que faz?',
                    options: [
                        {t: 'Envio-o, é um amigo', why: 'Isto é uma burla comum. Alguém tomou conta da conta do seu amigo, e esse código entregaria também a sua.'},
                        {t: 'Não o envio. Ninguém deve pedi-lo', ok: true, why: 'Exatamente. Esse código é a chave do seu WhatsApp. Nunca o partilhe com ninguém, nem com um amigo nem com quem diga ser do WhatsApp.'},
                        {t: 'Envio só os primeiros 3 dígitos', why: 'Mesmo uma parte do código ajuda um burlão. Nunca partilhe nenhuma parte.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'O WhatsApp pede para ver os seus contactos, para lhe mostrar quais dos amigos usam o WhatsApp. <strong>Toque em Permitir.</strong>',
                 hints: {deny: 'Pode escolher não permitir, mas então o WhatsApp não consegue mostrar os nomes dos seus amigos. Neste treino, toque em Permitir.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'As notificações avisam-no quando chega uma mensagem, mesmo com o WhatsApp fechado. <strong>Toque em Permitir.</strong>',
                 hints: {deny: 'Sem notificações, não saberá quando alguém lhe envia uma mensagem. Toque em Permitir neste treino.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Último passo: o seu nome é o que os amigos veem. <strong>Escreva o seu primeiro nome na caixa</strong> e depois <strong>toque em Seguinte</strong>. (Fica nesta página e não é enviado para lado nenhum.)',
                 hints: {photo: 'Na aplicação a sério pode escolher uma fotografia agora, ou juntá-la mais tarde nas Definições. Vamos saltar isso por agora: escreva o seu nome e toque em Seguinte.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Muito bem, configurou o WhatsApp!</strong> As suas conversas vão aparecer aqui. Nas próximas lições vai enviar a sua primeira mensagem.'},
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
            const lockName = ctx.touch ? 'Touch ID &amp; código' : 'Face ID &amp; código';
            const groups = [
                [['airplane', 'Modo de avião', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Dados móveis', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Notificações', '#ef4444', '⟦bell⟧'], ['sounds', 'Sons &amp; vibrações', '#ec4899', '⟦volume-2⟧'], ['focus', 'Concentração', '#6366f1', '⟦moon⟧']],
                [['general', 'Geral', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Acessibilidade', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence &amp; Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Ecrã &amp; luminosidade', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'SOS de Emergência', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Privacidade &amp; segurança', '#3b82f6', '⟦hand⟧'], ['battery', 'Bateria', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Apps', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Conta Apple, iCloud e mais</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Rede &amp; Internet', 'Dados móveis, Wi-Fi, ponto de acesso'], ['devices', 'Dispositivos ligados', 'Bluetooth, sincronização'],
            ['apps', 'Apps', 'Apps recentes, apps predefinidas'], ['notifications', 'Notificações', 'Histórico de notificações'], ['battery', 'Bateria', '85%'], ['storage', 'Armazenamento', '91% used'],
            ['sound', 'Som &amp; vibração', 'Volume, háptica'], ['display', 'Ecrã &amp; toque', 'Tema escuro, tamanho do tipo de letra'],
            ['accessibility', 'Acessibilidade', 'Ecrã, interação, áudio'], ['security', 'Segurança &amp; privacidade', 'Segurança das apps, bloqueio do dispositivo, autorizações'],
            ['location', 'Localização', 'Ativada'], ['safety', 'Segurança &amp; emergência', 'SOS de emergência, informações médicas, alertas'],
            ['google', 'Google', 'Serviços &amp; preferências'], ['system', 'Sistema', 'Idiomas, hora, atualizações de software']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID &amp; código' : 'Face ID &amp; código';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Dedo 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Repor o Face ID</span></div><div class="cj ex"><span>Configurar uma aparência alternativa</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Desativar o código</span></div><div class="cj ex"><span>Alterar o código</span></div>'
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

    const androidSecurity = () => androidList('Segurança &amp; privacidade', [
        ['device-unlock', 'Desbloqueio do dispositivo', 'Bloqueio de ecrã, desbloqueio facial e por impressão digital'], ['app-security', 'Segurança das apps', 'Analise as apps para detetar comportamentos nocivos'],
        ['theft', 'Proteção contra roubo', 'Bloqueie o telemóvel se for roubado'], ['privacy', 'Privacidade', 'Autorizações, atividade da conta']]);
    const androidDeviceUnlock = ctx => androidList('Desbloqueio do dispositivo', [
        ['screen-lock', 'Bloqueio de ecrã', ctx.passcodeSet ? 'PIN' : 'Nenhum'], ['face-finger', 'Desbloqueio facial e por impressão digital', ctx.faceDone || ctx.fingerDone ? 'Configurar' : 'Configure para desbloquear mais depressa']]);
    const androidFaceFinger = ctx => androidList('Desbloqueio facial e por impressão digital', [
        ['face-unlock', 'Desbloqueio facial', ctx.faceDone ? 'Rosto adicionado' : 'Configurar'], ['fingerprint-unlock', 'Desbloqueio por impressão digital', ctx.fingerDone ? '1 fingerprint' : 'Configurar']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Primeira leitura do Face ID concluída.' : 'O Face ID está agora configurado.') : 'Rosto adicionado';
        const btn = p === 'ios' ? (first ? 'Continuar' : 'Concluído') : 'Concluído';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Mova a cabeça lentamente para completar o círculo.' : 'Mantenha o rosto no círculo e mova a cabeça lentamente.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Completo' : 'Ajuste a forma de segurar') : (stage === 'grip' ? 'Ajuste a forma de segurar' : 'Coloque o dedo'))
            : (ready ? 'Impressão digital adicionada' : 'Toque no sensor');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'A sua impressão digital já pode ser usada para desbloquear o iPhone.' : 'Agora coloque as extremidades da ponta do dedo no botão principal.')
                     : (stage === 'grip' ? 'Pouse as extremidades da ponta do dedo no botão principal.' : 'Levante e pouse o dedo no botão principal várias vezes.'))
            : (ready ? 'Já pode usar a impressão digital para desbloquear o telemóvel.' : 'Toque no sensor, levante e toque de novo até a impressão digital ficar completa.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Continuar' : 'Concluído'}</button>` : sensor}
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
                 say: 'O código, o Face ID e o Touch ID estão todos na app <strong>Definições</strong>. <strong>Toque em Definições</strong> (a roda dentada cinzenta).',
                 hint: 'As Definições são o ícone cinzento com uma roda dentada.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Se for preciso, desça na lista e <strong>toque em ${ctx.touch ? 'Touch ID &amp; código' : 'Face ID &amp; código'}</strong>.`,
                 hint: `Procure "${ctx.touch ? 'Touch ID & código' : 'Face ID & código'}", por baixo de Ecrã & luminosidade.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'O bloqueio de ecrã, o Desbloqueio facial e as impressões digitais estão todos na app <strong>Definições</strong>. <strong>Toque em Definições</strong> (a roda dentada).',
             hint: 'As Definições são o ícone com uma roda dentada.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Se for preciso, desça e <strong>toque em Segurança &amp; privacidade</strong>. <em>Num Samsung, chama-se Segurança e privacidade, depois Dados biométricos ou Ecrã de bloqueio.</em>',
             hint: 'Procure "Segurança & privacidade" perto do fundo da lista.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Toque em Desbloqueio do dispositivo.</strong>',
             hint: 'É a primeira opção, "Desbloqueio do dispositivo".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Introduza o código' : 'Introduza o PIN', p === 'ios' ? '' : 'Para continuar, introduza o PIN'),
        sequence: CODE_KEYS,
        say: `${extraSay}O telemóvel confirma primeiro que é você. <strong>Escreva o código de treino: ${codeText}</strong>. <em>Nunca escreva o seu código verdadeiro num site.</em>`,
        hint: `Escreva o código de treino ${codeText}, um número de cada vez.`,
    });

    const safestQuestion = {
        q: 'Qual destes seria o código <strong>mais seguro</strong>?',
        options: [
            {t: '123456', why: '123456 é o código mais usado de todos, por isso é dos primeiros que um ladrão experimentaria.'},
            {t: 'A sua data de nascimento, como 140352', why: 'As datas de nascimento são fáceis de descobrir, nas redes sociais, em cartões ou no correio. Evite datas que tenham significado.'},
            {t: 'Seis números que não significam nada para mais ninguém', ok: true, why: 'Exatamente. Números aleatórios que não são uma data, um padrão ou uma repetição são os mais difíceis de adivinhar.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Este telemóvel ainda não tem código, por isso qualquer pessoa o poderia abrir. <strong>Toque em Ativar código.</strong>',
                 hints: {stolen: 'A Proteção de dispositivo roubado é explicada na lição 4. Primeiro, ative o código.'}},
                {screen: c => codeScreen(p, c, 'Definir código', 'Introduza um código', '<p class="aeh">Opções de código</p>'), sequence: CODE_KEYS,
                 say: `Escolha 6 números de que se lembre. Neste treino, <strong>escreva ${codeText}</strong>. <em>Por favor, não escreva aqui o seu código verdadeiro.</em>`,
                 hint: `Escreva ${codeText}, um número de cada vez.`},
                {screen: c => codeScreen(p, c, 'Definir código', 'Volte a introduzir o novo código'), sequence: CODE_KEYS,
                 say: `O iPhone pergunta outra vez, para ter a certeza de que não se enganou. <strong>Escreva ${codeText} de novo.</strong>`,
                 hint: `Escreva ${codeText} de novo.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Muito bem, o telemóvel de treino já tem um código!</strong> Num iPhone a sério, pode também ser-lhe pedida neste ponto a palavra-passe da Conta Apple.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'O Bloqueio de ecrã diz <strong>Nenhum</strong>, por isso qualquer pessoa podia abrir este telemóvel. <strong>Toque em Bloqueio de ecrã.</strong>'},
            {screen: () => androidList('Escolher bloqueio de ecrã', [['none', 'Nenhum'], ['swipe', 'Deslizar'], ['pattern', 'Padrão'], ['pin', 'PIN'], ['password', 'Palavra-passe']]),
             target: 'pin', say: 'Há várias escolhas. Um <strong>PIN</strong> (números) é fácil e seguro. <strong>Toque em PIN.</strong>',
             hints: {none: 'Nenhum significa que qualquer pessoa pode abrir o telemóvel.', swipe: 'Deslizar só abre o telemóvel com um deslize, por isso não protege nada.',
                     pattern: 'Os padrões podem ser adivinhados pelas marcas que o dedo deixa no ecrã. Um PIN é mais seguro.',
                     password: 'Uma palavra-passe também serve, mas um PIN é mais rápido de escrever todos os dias. Toque em PIN neste treino.'}},
            {screen: c => codeScreen(p, c, 'Escolha um PIN', 'O PIN tem de ter pelo menos 4 dígitos'), sequence: CODE_KEYS,
             say: `6 números são mais seguros do que 4. Neste treino, <strong>escreva ${codeText}</strong>. <em>Por favor, não escreva aqui o seu PIN verdadeiro.</em>`,
             hint: `Escreva ${codeText}, um número de cada vez.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Escolha um PIN', 'O PIN tem de ter pelo menos 4 dígitos', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Toque em Seguinte.</strong>'},
            {screen: c => codeScreen(p, c, 'Volte a introduzir o PIN', ''), sequence: CODE_KEYS,
             say: `O telemóvel pergunta outra vez, para ter a certeza de que não se enganou. <strong>Escreva ${codeText} de novo.</strong>`, hint: `Escreva ${codeText} de novo.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Volte a introduzir o PIN', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Toque em Confirmar.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Notificações no ecrã de bloqueio', [['show-all', 'Mostrar todo o conteúdo das notificações'], ['hide-sensitive', 'Ocultar conteúdo sensível'], ['dont-show', 'Não mostrar notificações']], false),
             target: 'hide-sensitive',
             say: 'O telemóvel pergunta que mensagens devem aparecer no ecrã bloqueado. <strong>Ocultar conteúdo sensível</strong> é uma boa escolha: vê que chegou uma mensagem, mas não o que diz. <strong>Toque nessa opção.</strong>',
             hints: {'show-all': 'Isso mostra tudo, incluindo códigos do banco, a quem pegar no telemóvel. Toque em "Ocultar conteúdo sensível".',
                     'dont-show': 'Funciona, mas não saberá quando chegam mensagens. Neste treino, toque em "Ocultar conteúdo sensível".'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Muito bem, o telemóvel de treino já tem um PIN!</strong> O Bloqueio de ecrã diz agora PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Toque em Configurar o Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Como configurar o Face ID</strong>
                    <p>Primeiro, posicione o rosto na moldura da câmara. Depois, mova a cabeça em círculo para mostrar todos os ângulos do rosto.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Começar</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Segure o telemóvel à frente do rosto, a cerca de um braço de distância, como se tirasse uma selfie. <strong>Toque em Começar.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Num iPhone a sério, agora <strong>move a cabeça lentamente em círculo</strong>, como se desenhasse um círculo com o nariz. O anel vai-se preenchendo durante a leitura. Quando terminar, <strong>toque em Continuar</strong>.',
                 hint: 'Espere que o círculo fique cheio e depois toque em Continuar.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Faz uma segunda leitura, para ter a certeza. Mova de novo a cabeça em círculo. Quando terminar, <strong>toque em Concluído</strong>.',
                 hint: 'Espere que o círculo fique cheio e depois toque em Concluído.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Um amigo pede para adicionar <em>o rosto dele</em> ao seu telemóvel, "só por precaução". O que faz?',
                    options: [
                        {t: 'Deixo, é prático', why: 'Qualquer pessoa cujo rosto esteja configurado pode abrir o seu telemóvel e aprovar pagamentos nas suas apps. Configure só o seu próprio rosto.'},
                        {t: 'Digo que não. Só o meu rosto deve desbloquear o meu telemóvel', ok: true, why: 'Exatamente. Se alguém de confiança precisar de entrar, partilhe antes o seu código com essa pessoa e, se for preciso, mude-o depois.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Muito bem, o Face ID está configurado!</strong> Agora pode desbloquear o telemóvel só ao olhar para ele e depois deslizar para cima.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Toque em Desbloqueio facial e por impressão digital.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Toque em Desbloqueio facial.</strong>',
             hints: {'fingerprint-unlock': 'Isso são as impressões digitais, que ficam para a lição 3. Por agora, toque em Desbloqueio facial.'}},
            {screen: () => consent(p, 'Desbloquear com o rosto', 'Use o rosto para desbloquear o telemóvel e confirmar que é você nas apps. O seu rosto fica guardado só neste telemóvel.', 'Aceito'),
             target: 'agree', say: 'O telemóvel explica como usa o seu rosto. <strong>Toque em Aceito.</strong>',
             hints: {cancel: 'Cancelar interromperia a configuração. Toque em Aceito para continuar.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Segure o telemóvel à altura dos olhos, a cerca de um braço de distância. Num telemóvel a sério, <strong>mantém o rosto no círculo e move a cabeça lentamente</strong>. Quando terminar, <strong>toque em Concluído</strong>.',
             hint: 'Espere que o círculo fique cheio e depois toque em Concluído.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Em muitos telemóveis Android, o Desbloqueio facial é menos seguro do que a impressão digital. O que significa isso para si?',
                options: [
                    {t: 'Serve para tudo', why: 'Em muitos telemóveis, o desbloqueio facial usa uma câmara normal, que pode ser enganada com mais facilidade. Algumas apps do banco não o aceitam por essa razão.'},
                    {t: 'Usá-lo para desbloquear, e usar a impressão digital ou o PIN no banco se o banco o pedir', ok: true, why: 'Está certo. O telemóvel diz-lhe se o Desbloqueio facial pode ser usado para pagamentos e para o banco. Se não puder, use a impressão digital ou o PIN.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Muito bem, o Desbloqueio facial está configurado!</strong> Agora pode desbloquear o telemóvel só ao olhar para ele.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Toque em Adicionar uma impressão digital…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'O Touch ID usa o <strong>botão principal</strong> na frente dos iPhones mais antigos, como o iPhone SE. <strong>Toque 6 vezes no botão principal em baixo no telemóvel de treino</strong>, como se levantasse e pousasse o dedo.',
                 hint: 'Toque no botão principal redondo, em baixo no telemóvel de treino.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Agora precisa das extremidades da ponta do dedo. <strong>Toque em Continuar.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Num iPhone a sério, pousa os <strong>lados e a ponta</strong> do dedo no botão. <strong>Toque mais 4 vezes no botão principal.</strong>',
                 hint: 'Toque no botão principal redondo, em baixo.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Está pronto. <strong>Toque em Continuar.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Qual é o melhor dedo para adicionar primeiro?',
                    options: [
                        {t: 'O polegar ou o dedo que mais usa para segurar o telemóvel', ok: true, why: 'Sim. Num botão principal, costuma ser o polegar. Pode adicionar até 5 dedos, por isso vale a pena adicionar os dois polegares.'},
                        {t: 'Qualquer dedo, tanto faz', why: 'Funciona com qualquer dedo, mas escolha aquele que naturalmente pousa no botão quando pega no telemóvel, normalmente um polegar.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Muito bem, a impressão digital está configurada!</strong> Pouse o dedo no botão principal para desbloquear. Pode adicionar mais dedos da mesma forma.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Toque em Desbloqueio facial e por impressão digital.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Toque em Desbloqueio por impressão digital.</strong>',
             hints: {'face-unlock': 'Isso é o desbloqueio facial, da lição 2. Por agora, toque em Desbloqueio por impressão digital.'}},
            {screen: () => consent(p, 'Desbloquear com a impressão digital', 'Use a impressão digital para desbloquear o telemóvel ou confirmar que é você, por exemplo ao iniciar sessão em apps. A impressão digital fica guardada só neste telemóvel.', 'Aceito'),
             target: 'agree', say: '<strong>Toque em Aceito.</strong>', hints: {cancel: 'Cancelar interromperia a configuração. Toque em Aceito para continuar.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'O sensor pode estar no ecrã, na parte de trás do telemóvel ou no botão de ligar, e o telemóvel mostra-lhe onde. Aqui está no ecrã. <strong>Toque 6 vezes no sensor</strong>, como se levantasse e pousasse o dedo.',
             hint: 'Toque no sensor redondo perto da parte de baixo do ecrã.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'A impressão digital foi registada. <strong>Toque em Concluído.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Qual é o melhor dedo para adicionar primeiro?',
                options: [
                    {t: 'O dedo que naturalmente toca no sensor quando pega no telemóvel', ok: true, why: 'Sim. Num sensor atrás costuma ser o indicador, e num sensor no ecrã ou ao lado, o polegar. Pode adicionar mais do que um.'},
                    {t: 'Qualquer dedo, tanto faz', why: 'Qualquer dedo serve, mas escolha o que naturalmente cai sobre o sensor. Assim desbloqueia de forma rápida e fácil.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Muito bem, a impressão digital está configurada!</strong> Toque no sensor para desbloquear. Pode adicionar mais dedos da mesma forma.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Girassóis no jardim', '#fde68a'], ['🐶', 'O cão no sofá', '#fecaca'], ['🏖️', 'Um dia na praia', '#bae6fd'],
                    ['🎂', 'Um bolo de aniversário', '#fbcfe8'], ['🌅', 'Pôr do sol sobre o mar', '#fed7aa'], ['🐈', 'O gato a dormir', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Lida' : state === 'sent' ? 'Enviada' : 'Entregue'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Olá, mãe, sou eu! Número novo, o telemóvel antigo avariou…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Família', last: 'Dave: Quem traz o bolo? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Vemo-nos quinta-feira!', time: 'Ontem', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Olá, mãe! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Nova conversa' : 'Selecionar contacto'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Família', '#f59e0b', 'Dave, Jean, Sarah, Você'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Adicionar (mais)' : 'Anexar (clipe)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Este número não está nos seus contactos.</p><div><button type="button" data-tap="block">Bloquear</button><button type="button" data-tap="add-contact">Adicionar</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Fotografias' : 'Galeria'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Bloquear +44 7700 900842?</strong></p><p class="fd">Os contactos bloqueados não podem ligar-lhe nem enviar-lhe mensagens.</p>
                <p class="fd">⟦square-check⟧ Denunciar ao WhatsApp</p>
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Recentes' : 'Galeria'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>A chamar…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Reativar som' : 'Silenciar'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Silenciada durante 1 semana' : 'Desativado'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Silenciar notificações durante…</strong></p>
                <button type="button" data-tap="mute-8h">8 horas</button><button type="button" data-tap="mute-week">1 semana</button><button type="button" data-tap="mute-always">Sempre</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Definições', [['account', 'Conta', 'Notificações de segurança, alterar número'], ['privacy', 'Privacidade', 'Bloquear contactos, mensagens temporárias'],
                ['chats', 'Conversas', 'Tema, imagens de fundo'], ['notifications', 'Notificações', 'Sons de mensagens, grupos e chamadas']]],
            account: ['Conta', [['twostep', 'Verificação em dois passos', ctx.twoStep ? 'Ativada' : 'Desativado'], ['change-number', 'Alterar número', ''], ['delete-account', 'Eliminar conta', '']]],
            privacy: ['Privacidade', [['last-seen', 'Visto por último e online', 'Todos'], ['profile-photo', 'Fotografia de perfil', 'Todos'],
                ['groups', 'Grupos', ctx.groupsSetting || 'Todos'], ['blocked', 'Contactos bloqueados', ctx.blocked ? '1' : 'Nenhum']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Quem me pode adicionar a grupos</strong></p>
                <button type="button" data-tap="groups-everyone">Todos</button><button type="button" data-tap="groups-contacts">Os meus contactos</button>
                <button type="button" data-tap="groups-except">Os meus contactos, exceto…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Verificação em dois passos</h3><p>Para maior segurança, ative a verificação em dois passos, que exigirá um PIN quando voltar a registar o seu número de telefone no WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Ativar</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Adicionar um endereço de email</h3>
                <p>Adicione um endereço de email para poder repor o PIN se se esquecer dele.</p>
                <div class="tk ex">o seu endereço de email</div>
                <button type="button" class="ce ox" data-tap="email-next">Seguinte</button>
                <button type="button" class="cp wd" data-tap="skip">Ignorar</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>A verificação em dois passos está ativada</h3><p>Ser-lhe-á pedido o PIN se configurar o WhatsApp num telemóvel novo.</p>
                <button type="button" class="ce ox" data-tap="done">Concluído</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Crie um PIN de 6 dígitos' : 'Confirme o PIN'}</strong>
            <p>${stage === 'pin' ? 'Vai precisar dele para configurar o WhatsApp num telemóvel novo.' : 'Escreva o mesmo PIN outra vez.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Esta é a sua lista de conversas. Para começar uma nova, <strong>toque no botão de nova conversa</strong> (o lápis, em cima à direita).'
                          : 'Esta é a sua lista de conversas. Para começar uma nova, <strong>toque no botão verde +</strong> em baixo, à direita.',
         hints: {'chat-family': 'Isso abre uma conversa existente. Comece antes uma nova.', 'chat-jean': 'Isso abre uma conversa existente. Comece antes uma nova.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'O WhatsApp mostra as pessoas dos seus contactos que o usam. <strong>Toque em Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Escreva primeiro uma mensagem na caixa e depois toque na seta de enviar.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Olá, mãe! 😊 Que bom ter notícias tuas!', n: 2}); },
         say: '<strong>Toque na caixa de mensagem</strong> em baixo, <strong>escreva uma mensagem curta</strong> (como "Olá!") e depois <strong>toque na seta de enviar</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'O microfone serve para mensagens de voz, que vêm a seguir. Primeiro escreva uma mensagem e toque na seta de enviar.', attach: 'Isso é para fotografias, que vêm a seguir. Primeiro escreva uma mensagem e toque em enviar.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'A Sarah respondeu! Por baixo da sua mensagem há <strong>dois vistos azuis ⟦check-check⟧</strong>. O que significam?',
            options: [
                {t: 'A mensagem não foi enviada', why: 'Uma mensagem que falhou mostra um pequeno relógio ou um aviso vermelho. Os vistos significam que correu bem.'},
                {t: 'A Sarah leu-a', ok: true, why: 'Sim! Um visto cinzento significa enviada, dois vistos cinzentos significam entregue ao telemóvel dela, e dois vistos azuis significam que ela a leu.'},
                {t: 'Foi enviada duas vezes', why: 'Não, só foi enviada uma vez. Dois vistos azuis significam que foi lida.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Agora envie uma fotografia. <strong>Toque em ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> ao lado da caixa de mensagem.`,
         hints: {camera: 'A câmara tira uma fotografia nova. Para enviar uma que já tirou, toque em ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Toque em ${p === 'ios' ? 'Fotografias' : 'Galeria'}</strong> para escolher entre as fotografias do telemóvel.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Estas são as fotografias (de faz de conta) do seu telemóvel. <strong>Toque nos girassóis</strong> 🌻.',
         hint: 'Toque na fotografia com os girassóis.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Lindos! 🌻 São do seu jardim?', n: 4}); },
         say: 'Pode escrever uma legenda, se quiser. Depois <strong>toque na seta de enviar</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'As mensagens de voz são práticas quando escrever é complicado. Num telemóvel a sério, <strong>mantém o microfone premido</strong> ⟦mic⟧ enquanto fala e depois larga para enviar. Aqui, <strong>toque uma vez no microfone para começar e depois na seta de enviar</strong> para a enviar.',
         hint: 'Toque no microfone e depois na seta de enviar.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Muito bem!</strong> Enviou uma mensagem, uma fotografia e uma mensagem de voz. Para responder à Sarah quando quiser, abra o WhatsApp e toque na conversa dela.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Toque na conversa da Sarah</strong> para a abrir.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'No topo da conversa há dois botões de chamada: a <strong>câmara de vídeo</strong> para uma videochamada e o <strong>telefone</strong> para uma chamada de voz. <strong>Toque na câmara de vídeo</strong> ⟦video⟧.',
         hints: {voice: 'Isso faz uma chamada de voz, sem vídeo. Neste treino, toque na câmara de vídeo.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Toca no telemóvel da Sarah e, quando ela atender, veem-se um ao outro. Se estiver barulhento onde está, <strong>toque no microfone</strong> ⟦mic⟧ para se silenciar.',
         hint: 'O botão do microfone está na fila em baixo.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Está silenciado: a Sarah vê-o mas não o ouve. Para lhe mostrar alguma coisa, <strong>toque no botão de virar</strong> ⟦switch-camera⟧ para mudar para a câmara de trás do telemóvel.',
         hints: {mute: 'Toque outra vez no microfone mais tarde para reativar o som. Por agora, experimente o botão de virar.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Agora a Sarah vê aquilo para que está a apontar o telemóvel. Quando acabar, <strong>toque no botão vermelho</strong> para terminar a chamada.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'As videochamadas gastam muitos dados. Qual é a melhor forma de fazer uma?',
            options: [
                {t: 'Com Wi-Fi em casa, sempre que possível', ok: true, why: 'Sim. Com Wi-Fi, as chamadas não gastam o seu plano de dados móveis, por isso são gratuitas por mais tempo que fale.'},
                {t: 'Tanto faz', why: 'Com dados móveis, uma videochamada longa pode gastar o plano rapidamente. O Wi-Fi é o melhor, sempre que possível.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Agora os grupos. O grupo Família tem muitas mensagens novas e as notificações não param de vibrar. <strong>Toque no grupo Família.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Para alterar as definições de um grupo, <strong>toque no nome do grupo</strong> no topo.', hint: 'Toque na palavra "Família" no topo do ecrã.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Toque em Silenciar notificações.</strong> Continua a receber as mensagens, mas o telemóvel não vibra a cada uma.',
         hints: {'exit-group': 'Sair do grupo sairia por completo. Silenciar é mais suave: fica no grupo, mas sem as vibrações.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Escolha durante quanto tempo. <strong>Toque em 1 semana.</strong>',
         hints: {'mute-8h': '8 horas também serve. Neste treino, toque em 1 semana.', 'mute-always': 'Sempre também serve, mas pode perder coisas. Neste treino, toque em 1 semana.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Muito bem!</strong> Fez uma videochamada, silenciou-se, virou a câmara e silenciou um grupo movimentado. Pode continuar a ler as mensagens do grupo quando quiser.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Olá!', ticks: 'read', n: 1}, {text: 'Olá, mãe! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Almoço de domingo cá em casa? 🍗', n: 1}, {from: 'Sarah', text: 'Sim, por favor!', n: 2}, {from: 'Dave', text: 'Quem traz o bolo? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'As definições do WhatsApp estão dentro da app. <strong>Toque em Definições</strong> em baixo, à direita.',
                hints: {'chat-unknown': 'Já tratamos dessa mensagem. Primeiro, toque em Definições em baixo, à direita.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'As definições do WhatsApp estão dentro da app. <strong>Toque nos três pontos ⋮</strong> em cima, à direita.',
                hints: {'chat-unknown': 'Já tratamos dessa mensagem. Primeiro, toque nos três pontos em cima, à direita.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Toque em Definições.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Toque em Conta.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: 'A <strong>verificação em dois passos</strong> acrescenta um PIN que é necessário se alguém tentar configurar o seu WhatsApp noutro telemóvel. Mesmo que um burlão obtenha o seu código de 6 dígitos, não consegue entrar. <strong>Toque em Verificação em dois passos.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Toque em Ativar.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Escolha um PIN de 6 dígitos, diferente do código de desbloqueio do telemóvel. Neste treino, <strong>escreva ${pinText}</strong>. <em>Não escreva aqui um PIN verdadeiro.</em>`,
             hint: `Escreva o PIN de treino ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Escreva ${pinText} de novo</strong> para o confirmar.`, hint: `Escreva ${pinText} de novo.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Juntar o seu endereço de email permite-lhe repor o PIN se se esquecer dele. Vale a pena fazê-lo no telemóvel a sério. Aqui, <strong>toque em Seguinte</strong>.',
             hints: {skip: 'Pode ignorar, mas depois, se se esquecer do PIN, pode ficar sem acesso. Toque em Seguinte neste treino.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'A verificação em dois passos está ativada. <strong>Toque em Concluído.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Uma mensagem diz ser do <em>"Apoio do WhatsApp"</em> e pede o seu PIN de dois passos para "verificar a sua conta". O que faz?',
                options: [
                    {t: 'Envio, é do WhatsApp', why: 'O WhatsApp nunca lhe enviará uma mensagem a pedir o PIN ou o código. É um burlão a tentar tomar conta da sua conta.'},
                    {t: 'Não respondo, e bloqueio e denuncio', ok: true, why: 'Exatamente. Ninguém, nem o próprio WhatsApp, deve pedir o seu PIN ou o código de 6 dígitos.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'A seguir, impeça os desconhecidos de o adicionarem a grupos. Isto está em <strong>Privacidade</strong>. <strong>Toque em Grupos.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Os meus contactos'; },
             say: '"Todos" significa que qualquer desconhecido o pode adicionar a um grupo, o que os burlões aproveitam. <strong>Toque em Os meus contactos.</strong>',
             hints: {'groups-everyone': '"Todos" deixa os desconhecidos adicioná-lo a grupos, incluindo grupos de burlas. Toque em Os meus contactos.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Chegou uma mensagem de um número que não conhece: "Olá, mãe, sou eu! Número novo…". É a burla do "Olá, mãe". <strong>Toque nela para a abrir.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Olá, mãe, sou eu! Número novo, o telemóvel antigo avariou. Podes ajudar-me a pagar uma conta? Devolvo-te amanhã x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Não responda. O WhatsApp repara que o número não está nos seus contactos. <strong>Toque em Bloquear.</strong>',
             hints: {'add-contact': 'Não adicione um burlão aos seus contactos. Toque em Bloquear.', video: 'Não lhes ligue de volta. Toque em Bloquear.', voice: 'Não lhes ligue de volta. Toque em Bloquear.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Olá, mãe, sou eu! Número novo, o telemóvel antigo avariou. Podes ajudar-me a pagar uma conta? Devolvo-te amanhã x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '"Denunciar ao WhatsApp" está marcado, o que ajuda o WhatsApp a travar o burlão. <strong>Toque em Bloquear.</strong>',
             hints: {cancel: 'Cancelar deixaria essa pessoa a poder enviar-lhe mensagens. Toque em Bloquear.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Muito bem!</strong> Ativou a verificação em dois passos, impediu os desconhecidos de o adicionarem a grupos, e bloqueou e denunciou um burlão. Se alguma vez tiver dúvidas sobre uma mensagem de um familiar, ligue-lhe para o número que já tem.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Voltar') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Voltar')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">As apps que suportam o Tipo Dinâmico ajustam-se ao tamanho de leitura que preferir.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Tamanho do texto', [], {top: slider, back: 'Ecrã'});
        return list(p, 'Tamanho do ecrã e do texto', [{caption: 'Tamanho do tipo de letra'}, {id: 'bold', label: 'Texto a negrito', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'O tamanho do texto está na app <strong>Definições</strong>. <strong>Toque em Definições.</strong>', hint: 'As Definições são o ícone cinzento com uma roda dentada.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Toque em Ecrã &amp; luminosidade.</strong>', hint: 'Está no terceiro grupo, por baixo de Acessibilidade.'},
        {screen: c => list(p, 'Ecrã &amp; luminosidade', [{caption: 'ASPETO'}, {label: 'Claro', value: '⟦check⟧'}, {caption: 'TEXTO'}, {id: 'text-size', label: 'Tamanho do texto'}, {id: 'bold', label: 'Texto a negrito', toggle: !!c.bold}], {back: 'Definições'}),
         target: 'text-size', say: '<strong>Toque em Tamanho do texto.</strong>', hints: {bold: 'O Texto a negrito vem a seguir. Primeiro, toque em Tamanho do texto.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Arraste o cursor para a direita para aumentar a letra. Aqui, <strong>toque duas vezes no A grande</strong> e veja o texto crescer.', hint: 'Toque no A grande, à direita do cursor.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Muito mais fácil de ler! Agora <strong>toque em ‹ Ecrã</strong> no topo para voltar atrás.'},
        {screen: c => list(p, 'Ecrã &amp; luminosidade', [{caption: 'ASPETO'}, {label: 'Claro', value: '⟦check⟧'}, {caption: 'TEXTO'}, {id: 'text-size', label: 'Tamanho do texto'}, {id: 'bold', label: 'Texto a negrito', toggle: !!c.bold}], {back: 'Definições'}),
         target: 'bold', action: c => { c.bold = true; }, say: 'O <strong>Texto a negrito</strong> torna as letras mais grossas e mais nítidas. <strong>Toque nele para o ativar.</strong>'},
        {screen: c => list(p, 'Ecrã &amp; luminosidade', [{caption: 'TEXTO'}, {label: 'Tamanho do texto'}, {label: 'Texto a negrito', toggle: true}], {back: 'Definições'}),
         question: {q: 'O texto continua pequeno, mesmo no tamanho máximo?', options: [
            {t: 'Não se pode fazer mais nada', why: 'Há mais! Definições > Acessibilidade > Ecrã e tamanho do texto > Texto maior dá tamanhos ainda maiores.'},
            {t: 'Definições > Acessibilidade > Ecrã e tamanho do texto > Texto maior', ok: true, why: 'Sim. Ative aí os Tamanhos de acessibilidade maiores para ter texto mesmo grande.'}]}},
        {screen: c => list(p, 'Ecrã &amp; luminosidade', [{caption: 'TEXTO'}, {label: 'Tamanho do texto'}, {label: 'Texto a negrito', toggle: true}], {back: 'Definições'}), done: true,
         say: '<strong>Muito bem!</strong> O seu texto está maior e mais negro, nas Definições e na maioria das apps.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'O tamanho do texto está na app <strong>Definições</strong>. <strong>Toque em Definições.</strong>', hint: 'As Definições são o ícone com uma roda dentada.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Toque em Ecrã &amp; toque.</strong> <em>Num Samsung, é Ecrã, depois Tamanho e estilo do tipo de letra.</em>'},
        {screen: () => list(p, 'Ecrã &amp; toque', [{id: 'dark', label: 'Tema escuro', toggle: false}, {id: 'text-size', label: 'Tamanho do ecrã e do texto', sub: 'Tamanho do tipo de letra, texto a negrito'}, {id: 'brightness', label: 'Nível de brilho', value: '70%'}]),
         target: 'text-size', say: '<strong>Toque em Tamanho do ecrã e do texto.</strong>', hints: {dark: 'O tema escuro muda as cores, não o tamanho. Toque em Tamanho do ecrã e do texto.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Arraste o cursor do Tamanho do tipo de letra para a direita para aumentar a letra. Aqui, <strong>toque duas vezes no A grande</strong>.', hint: 'Toque no A grande, à direita do cursor.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: 'O <strong>texto a negrito</strong> torna as letras mais nítidas. <strong>Toque nele para o ativar.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'O texto continua pequeno, mesmo no tamanho máximo?', options: [
            {t: 'Não se pode fazer mais nada', why: 'Experimente também o Tamanho do ecrã, na mesma página: torna tudo maior, incluindo botões e ícones.'},
            {t: 'Aumentar também o Tamanho do ecrã', ok: true, why: 'Sim. O Tamanho do ecrã aumenta tudo o que está no ecrã, não só o texto.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Muito bem!</strong> O seu texto está maior e mais negro, nas Definições e na maioria das apps.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' sobre roxo' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Não incomodar' : 'Concentração'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Não incomodar · Ativado' : 'Não incomodar · Desativado'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Deslize para cima para fechar' : 'Fechar'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Se o telemóvel não tocar, o Não incomodar pode estar ativado. As definições rápidas estão no <strong>Centro de Controlo</strong>: <strong>deslize para baixo a partir do canto superior direito</strong> (ou toque na faixa no topo).'
                          : 'Se o telemóvel não tocar, o Não incomodar pode estar ativado. <strong>Deslize para baixo a partir do topo do ecrã</strong> para ver as definições rápidas (ou toque na faixa no topo).',
         hints: {'pull-up': 'Deslize no outro sentido: para baixo, a partir do topo.', 'pull-left': 'Deslize para baixo, não para o lado.', 'pull-right': 'Deslize para baixo, não para o lado.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `A lua ⟦moon⟧ significa que o <strong>Não incomodar está ativado</strong>, por isso as chamadas e mensagens estão silenciadas. <strong>Toque nela para o desativar.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Agora aumente o volume com o <strong>botão de volume na lateral do telemóvel</strong> (o de cima). <strong>Toque 3 vezes no ＋ na margem do telemóvel de treino.</strong>',
         hint: 'Toque no botão ＋ na margem direita do telemóvel.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'O iPhone continua a não tocar. O que mais poderá ser?', options: [
                {t: 'O interruptor Toque/Silêncio ou o botão de Ação está em silêncio', ok: true, why: 'Sim. Muitos iPhones têm um pequeno interruptor por cima dos botões de volume: se aparecer laranja, o telemóvel está em silêncio. Os mais recentes usam antes o botão de Ação.'},
                {t: 'O telemóvel está avariado', why: 'Normalmente não! Verifique primeiro o interruptor de silêncio por cima dos botões de volume.'}]}
            : {q: 'Carregou no botão de volume, mas só mudou o volume dos conteúdos multimédia. E agora?', options: [
                {t: 'Tocar no ícone ⋯ ou de definições na barra de volume para ver o volume do toque', ok: true, why: 'Sim. Os botões de volume mudam muitas vezes o volume dos conteúdos multimédia; toque nos três pontos na barra de volume para mudar o volume do toque.'},
                {t: 'Desistir', why: 'Toque nos três pontos ⋯ na barra de volume que aparece e aumente o volume do toque.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Muito bem!</strong> O Não incomodar está desativado e o volume está alto, por isso vai ouvir as chamadas e as mensagens.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500mg</strong><br>Tome 1-2 comprimidos de 4 em 4 a 6 horas.<br>Não tome mais de 8 comprimidos em 24 horas.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Lupa', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'O iPhone tem uma app <strong>Lupa</strong>. Se não estiver no ecrã inicial, deslize para baixo a meio do ecrã e escreva "Lupa". <strong>Toque em Lupa.</strong>'
                          : 'Muitos telemóveis Android têm uma app <strong>Lupa</strong>. <em>Num Samsung, está nas definições rápidas ou em Acessibilidade.</em> <strong>Toque em Lupa.</strong>',
         hint: 'Procure o ícone preto com uma lupa.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Aponte o telemóvel a algo pequeno, como este rótulo de medicamento. <strong>Toque em ＋ três vezes</strong> para aumentar (num telemóvel a sério, pode arrastar o cursor).', hint: 'Toque no ＋ à direita do cursor.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Com pouca luz, a lanterna ajuda. <strong>Toque na lanterna</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Tem as mãos um pouco trémulas? <strong>Toque no botão redondo grande</strong> para congelar a imagem, para poder lê-la sem ter de ficar quieto.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Para que mais serve a lupa?', options: [
            {t: 'Ler ementas, etiquetas de preços e letras pequenas em cartas', ok: true, why: 'Sim, e está sempre no seu bolso. Algumas pessoas deixam-na no Centro de Controlo ou nas definições rápidas, para a abrir com um toque.'},
            {t: 'Aumentar o som das chamadas', why: 'Isso são os botões de volume. A lupa serve para ver melhor coisas pequenas.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Muito bem!</strong> Agora já sabe ampliar letras pequenas, iluminá-las e congelar a imagem.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Vemo-nos no encontro do café na quinta-feira' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Vens na quinta-feira? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Mensagem de texto</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ A ouvir… fale agora</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Pode falar em vez de escrever. <strong>Abra as Mensagens.</strong>', hint: 'As Mensagens são o balão de fala verde.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'A Jean perguntou sobre quinta-feira. <strong>Toque na caixa de mensagem</strong> em baixo.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'O teclado aparece. <strong>Toque no microfone</strong> ⟦mic⟧ no teclado e depois diga a sua mensagem.', hint: 'O microfone está no teclado, ao lado da barra de espaço.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Num telemóvel a sério, agora diria: <em>"Vemo-nos no encontro do café na quinta-feira"</em>. As palavras aparecem à medida que fala. Confira-as e depois <strong>toque em enviar</strong> ⟦send-horizontal⟧.',
         hint: 'Espere que as palavras apareçam e depois toque na seta de enviar.'},
        {screen: () => home(p), target: 'settings',
         say: 'O telemóvel também lhe pode <strong>ler coisas em voz alta</strong>. Vamos ativar isso. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Toque em Acessibilidade.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Acessibilidade', [{caption: 'VISÃO'}, {id: 'voiceover', label: 'VoiceOver', value: 'Desativado'}, {id: 'zoom', label: 'Zoom', value: 'Desativado'}, {id: 'spoken', label: 'Conteúdo falado'}], {back: 'Definições'})
            : list(p, 'Acessibilidade', [{id: 'select-speak', label: 'Selecionar para ouvir', sub: 'Desativado'}, {id: 'talkback', label: 'TalkBack', sub: 'Desativado'}, {id: 'magnification', label: 'Ampliação'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Toque em Conteúdo falado.</strong>' : '<strong>Toque em Selecionar para ouvir.</strong>',
         hints: {voiceover: 'O VoiceOver muda a forma como todo o telemóvel funciona, o que pode ser confuso. Toque em Conteúdo falado.', talkback: 'O TalkBack muda a forma como todo o telemóvel funciona, o que pode ser confuso. Toque em Selecionar para ouvir.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Conteúdo falado', [{id: 'speak-selection', label: 'Falar seleção', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Falar ecrã', toggle: !!c.speakScreen, sub: 'Deslize para baixo com dois dedos a partir do topo do ecrã para o ouvir ler em voz alta.'}], {back: 'Acessibilidade'})
            : list(p, 'Selecionar para ouvir', [{id: 'speak-screen', label: 'Usar Selecionar para ouvir', toggle: !!c.speakScreen, sub: 'Toque no atalho e depois toque em qualquer coisa no ecrã para a ouvir ler em voz alta.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Ative Falar ecrã.</strong> Depois, em qualquer sítio do telemóvel, deslizar para baixo com dois dedos a partir do topo lê o ecrã em voz alta.' : '<strong>Ative Usar Selecionar para ouvir.</strong> Aparece um pequeno botão de atalho: toque nele e depois em qualquer texto para o ouvir.',
         hints: {'speak-selection': 'Isso lê apenas as palavras que destacar. Falar ecrã é mais fácil: ative essa opção.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Conteúdo falado', [{label: 'Falar seleção', toggle: false}, {label: 'Falar ecrã', toggle: true}], {back: 'Acessibilidade'})
            : list(p, 'Selecionar para ouvir', [{label: 'Usar Selecionar para ouvir', toggle: true}]), done: true,
         say: '<strong>Muito bem!</strong> Agora pode falar em vez de escrever, e fazer o telemóvel ler-lhe coisas em voz alta.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Muitos aparelhos auditivos podem ligar-se ao telemóvel, para que as chamadas e a música vão diretamente para eles. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Toque em Acessibilidade.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Acessibilidade', [{caption: 'AUDIÇÃO'}, {id: 'hearing-devices', label: 'Dispositivos auditivos'}, {id: 'live-captions', label: 'Legendas em direto', value: c.captions ? 'Ativada' : 'Desativado'}, {id: 'subtitles', label: 'Legendas &amp; legendagem'}], {back: 'Definições'})
            : list(p, 'Acessibilidade', [{id: 'hearing-devices', label: 'Aparelhos auditivos', sub: c.paired ? 'Ligado' : 'Não ligado'}, {id: 'live-captions', label: 'Transcrição instantânea', sub: c.captions ? 'Ativada' : 'Desativado'}, {id: 'sound-amp', label: 'Amplificador de som'}]),
         target: 'hearing-devices', say: `<strong>Toque em ${p === 'ios' ? 'Dispositivos auditivos' : 'Aparelhos auditivos'}.</strong> Coloque primeiro os aparelhos auditivos e feche as portas das pilhas para os reiniciar, para o telemóvel os conseguir encontrar.`,
         hints: {'live-captions': 'As legendas vêm a seguir. Primeiro, ligue os aparelhos auditivos.'}},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Aparelhos auditivos', [{caption: p === 'ios' ? 'DISPOSITIVOS AUDITIVOS MFI' : 'Dispositivos disponíveis'}, {id: 'aids', label: 'Aparelhos auditivos da Margaret', sub: 'Esquerdo e direito'}],
            {overlay: c.pairing ? dialog(p, 'Emparelhar com "Aparelhos auditivos da Margaret"?', 'Serão usados para chamadas e áudio.', [['cancel', 'Cancelar'], ['pair', 'Emparelhar']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'O telemóvel encontra-os. <strong>Toque nos seus aparelhos auditivos.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Aparelhos auditivos', [{id: 'aids', label: 'Aparelhos auditivos da Margaret', sub: 'Esquerdo e direito'}],
            {overlay: dialog(p, 'Emparelhar com "Aparelhos auditivos da Margaret"?', 'Serão usados para chamadas e áudio.', [['cancel', 'Cancelar'], ['pair', 'Emparelhar']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Toque em Emparelhar.</strong> (Com dois aparelhos auditivos, o telemóvel pode perguntar duas vezes, uma por cada um.)'},
        {screen: c => list(p, p === 'ios' ? 'Dispositivos auditivos' : 'Aparelhos auditivos', [{label: 'Aparelhos auditivos da Margaret', sub: 'Ligado ⟦check⟧'}]), target: 'back',
         say: 'Ligado! As chamadas passam agora pelos seus aparelhos auditivos. <strong>Toque em Voltar.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Acessibilidade', [{caption: 'AUDIÇÃO'}, {id: 'hearing-devices', label: 'Dispositivos auditivos'}, {id: 'live-captions', label: 'Legendas em direto', value: c.captions ? 'Ativada' : 'Desativado'}], {back: 'Definições'})
            : list(p, 'Acessibilidade', [{id: 'hearing-devices', label: 'Aparelhos auditivos', sub: 'Ligado'}, {id: 'live-captions', label: 'Transcrição instantânea', sub: c.captions ? 'Ativada' : 'Desativado'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `A <strong>${p === 'ios' ? 'Legendas em direto' : 'Transcrição instantânea'}</strong> mostra no ecrã as palavras de tudo o que é falado: vídeos, chamadas e mensagens de voz. <strong>Toque nela para a ativar.</strong>`},
        {screen: c => list(p, 'Acessibilidade', [{label: p === 'ios' ? 'Legendas em direto' : 'Transcrição instantânea', toggle: true}, {label: 'Aparelhos auditivos', sub: 'Ligado'}]), done: true,
         say: '<strong>Muito bem!</strong> Os aparelhos auditivos estão ligados e as palavras faladas aparecem agora como legendas.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Abelha', 'Burro', 'Cão', 'Doninha', 'Esquilo', 'Foca', 'Gato', 'Hiena', 'Íbis', 'Javali', 'Koala', 'Lebre', 'Morcego',
                     'Narval', 'Ovelha', 'Pato', 'Raposa', 'Sapo', 'Texugo', 'Urso', 'Vaca', 'Zebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Prima sem soltar a flor</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Copiar</span><span>Partilhar</span><span>Apagar</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebra</h3><p>As zebras têm riscas pretas e brancas. Não há duas zebras com exatamente o mesmo padrão.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Tocar</strong> significa tocar de leve no ecrã com um dedo e levantá-lo logo, como se carregasse num botão. <strong>Toque na estrela.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Premir sem soltar</strong> significa manter o dedo sobre algo durante um ou dois segundos. Costuma mostrar opções adicionais. <strong>Prima sem soltar a flor</strong> até acontecer alguma coisa. (Com um rato, mantenha o botão premido.)',
         hint: 'Mantenha o dedo sobre a flor durante um ou dois segundos.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Apareceu um menu. O que costuma fazer premir sem soltar?', options: [
            {t: 'Mostra opções adicionais, como copiar, partilhar ou apagar', ok: true, why: 'Sim. Premir sem soltar mensagens, fotografias e apps mostra opções como estas.'},
            {t: 'Apaga as coisas logo', why: 'Não, só mostra um menu de opções. Nada acontece até escolher uma.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Deslizar</strong> significa passar o dedo pelo ecrã, como quem vira uma página. <strong>Deslize duas vezes para a esquerda sobre a fotografia</strong> para ver as seguintes. (Com um rato, clique, arraste e solte.)',
         hint: 'Passe o dedo da direita para a esquerda sobre a fotografia. Ou use o botão "Não consegue deslizar?".'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Deslocar</strong> significa passar o dedo para cima no ecrã para ver mais de uma lista, como esta. <strong>Desloque para baixo e toque em Zebra</strong>, mesmo no fim. (Com um rato, use a roda de deslocação.)',
         hint: 'Passe a lista para cima com o dedo para chegar à Zebra no fim.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Para voltar uma página num iPhone, <strong>toque em ‹ Voltar</strong> no canto superior esquerdo (ou deslize a partir da margem esquerda do ecrã).' : 'Para voltar uma página no Android, <strong>toque na seta para trás ◁</strong> em baixo (ou deslize a partir da margem esquerda ou direita do ecrã).',
         hints: {'home-pill': 'Isso leva-o até ao ecrã inicial. Toque antes na seta para trás ◁.', 'home-bar': 'Isso leva-o até ao ecrã inicial. Toque antes em ‹ Voltar.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Para ir ao ecrã inicial a partir de qualquer sítio, <strong>deslize para cima a partir da barra</strong> na parte de baixo do ecrã (ou toque na barra aqui). Nos iPhones mais antigos com botão principal redondo: carregue nele.'
                          : 'Para ir ao ecrã inicial a partir de qualquer sítio, <strong>toque no círculo inicial ○</strong> em baixo (ou deslize para cima a partir da margem de baixo).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Voltar leva uma página atrás. Toque no círculo inicial ○ para ir ao ecrã inicial.'}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> Praticou tocar, premir sem soltar, deslizar, deslocar, voltar atrás e ir ao ecrã inicial: os gestos que vai usar todos os dias.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Ligado', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'REDES' : 'Redes disponíveis'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Definições',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Introduza a palavra-passe de "BT-Hub-7F2A"</strong></p>
                ${field('wifipass', 'Palavra-passe', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Aderir' : 'Ligar'}</button>
                <button type="button" class="cp" data-tap="cancel">Cancelar</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Usar o Wi-Fi em casa poupa os dados móveis. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Toque em Wi-Fi</strong>, perto do topo.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Toque em Rede &amp; Internet.</strong> <em>Num Samsung, é Ligações e depois Wi-Fi.</em>'},
               {screen: () => list(p, 'Rede &amp; Internet', [{id: 'internet', label: 'Internet', sub: 'Wi-Fi e dados móveis'}, {id: 'sims', label: 'SIM'}, {id: 'hotspot', label: 'Zona Wi-Fi &amp; partilha de ligação'}]),
                target: 'internet', say: '<strong>Toque em Internet.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'O nome e a palavra-passe do Wi-Fi costumam estar num autocolante na parte de trás do router (a caixa com luzes). O autocolante deste router de treino diz:<br><span class="ahd">Rede: <strong>BT-Hub-7F2A</strong><br>Palavra-passe: <strong>Green-Apple-42</strong></span><strong>Toque em BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Esse é o Wi-Fi de um vizinho. Procure o nome que está no autocolante: BT-Hub-7F2A.', 'net-sky-12345': 'Esse é o Wi-Fi de outra pessoa. Procure o nome que está no autocolante: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'A palavra-passe tem de ser igual à do autocolante, incluindo maiúsculas e traços: Green-Apple-42',
         say: 'Escreva a palavra-passe <strong>exatamente</strong> como está no autocolante: <strong>Green-Apple-42</strong>. As maiúsculas contam! Depois <strong>toque em Aderir</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Está ligado! O telemóvel vai agora ligar-se a este Wi-Fi sozinho sempre que estiver em casa. É seguro usar o Wi-Fi gratuito num café?', options: [
            {t: 'Sim, para navegar, mas evite o banco online nele', ok: true, why: 'Exatamente. O Wi-Fi público serve para ler as notícias ou ver o horário de um autocarro. Para o banco, use os dados móveis ou o Wi-Fi de casa.'},
            {t: 'Sim, para tudo', why: 'O Wi-Fi público pode ser observado por outras pessoas. Serve para navegar, mas use os dados móveis ou o Wi-Fi de casa para o banco.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Muito bem!</strong> Está ligado ao Wi-Fi. Procure o símbolo do Wi-Fi, em forma de leque, no topo do ecrã.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Novo contacto' : 'Criar contacto', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Nome próprio', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Número de telemóvel', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Concluído' : 'Guardar'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Contacto', [
        {label: 'Telemóvel', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Adicionar aos Favoritos' : (ctx.fav ? '⟦star⟧ Favorito' : '⟦star⟧ Adicionar aos favoritos')},
        {id: 'share', label: 'Partilhar contacto'}], {back: 'Contactos'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Contactos', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Guardar o número de alguém permite-lhe ligar-lhe pelo nome. No iPhone, os contactos estão na app <strong>Telefone</strong>. <strong>Toque em Telefone.</strong>' : '<strong>Toque em Contactos.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Contactos', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Contactos', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Esta é a sua lista de contactos. <strong>Toque em +</strong> no canto superior direito para adicionar alguém.' : 'Esta é a sua lista de contactos. <strong>Toque no botão +</strong> para adicionar alguém.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Escreva um nome próprio e o número de treino 07700 900456 e depois toque em ' + (p === 'ios' ? 'Concluído.' : 'Guardar.'),
         say: `Escreva o <strong>nome próprio</strong> da pessoa (experimente "Ann") e o número dela. Para treinar, use <strong>07700 900456</strong>. Depois <strong>toque em ${p === 'ios' ? 'Concluído' : 'Guardar'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Guardado! Os favoritos são as pessoas a quem mais liga, mostradas no topo para ligar com um só toque. <strong>Toque ' + (p === 'ios' ? 'Adicionar aos Favoritos' : 'na estrela') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Qual contacto vale a pena guardar com "ICE" (In Case of Emergency, em caso de emergência) antes do nome?', options: [
            {t: 'O seu familiar mais próximo, como "ICE Sarah"', ok: true, why: 'Sim. Os paramédicos sabem procurar o ICE. Melhor ainda, junte um contacto de emergência à sua Ficha Médica, explicada no curso Manter o telemóvel seguro.'},
            {t: 'O seu banco', why: 'O ICE é para a pessoa a contactar se lhe acontecer alguma coisa, normalmente o familiar mais próximo.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Muito bem!</strong> Guardou um contacto e fez dele um favorito.'},
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
    const recents = p => app(p, 'Recentes', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'O telemóvel está a tocar: a Jean está a ligar. <strong>Toque no botão verde para atender.</strong>' + (p === 'android' ? ' <em>Em alguns telemóveis Android, desliza-se o botão verde para cima.</em>' : ' <em>Se o iPhone estiver bloqueado, desliza-se o botão verde para o lado.</em>'),
         hints: {decline: 'O vermelho recusa a chamada. Toque no verde para atender.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Está a falar! Para ouvir melhor, ou para falar sem as mãos, <strong>toque em altifalante</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Quando terminar, <strong>toque no botão vermelho</strong> para desligar.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Perdeu há pouco uma chamada do Dave. As chamadas perdidas aparecem a <strong>vermelho</strong> nas chamadas recentes. <strong>Toque em Dave</strong> para lhe ligar de volta.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Está a chamar o Dave. Quando terminar de falar, <strong>toque no botão vermelho</strong> para desligar.'},
        {screen: () => recents(p), question: {q: 'Alguém liga de um número que não conhece, a dizer que é do seu banco. O que faz?', options: [
            {t: 'Desligo e ligo para o 159 para contactar o banco em segurança', ok: true, why: 'Exatamente. Pode sempre desligar e voltar a ligar para um número de confiança. O 159 liga-o ao seu próprio banco.'},
            {t: 'Faço o que dizem, é o banco', why: 'Os burlões fazem-se passar por bancos a toda a hora, e o número pode ser falsificado. Desligue e ligue para o 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Muito bem!</strong> Sabe atender, usar o altifalante, desligar e ligar de volta a chamadas perdidas.'},
    ], {});

    function smsList(p) {
        return app(p, 'Mensagens', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>A sua última consulta de rotina foi em março. Marque online ou ligue-nos.</span><small>há 3 meses</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Mensagem de texto', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'As mensagens de texto estão na app <strong>Mensagens</strong>. <strong>Toque em Mensagens.</strong>', hint: 'É o ícone do balão de fala.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'As mensagens novas aparecem a negrito. <strong>Toque na mensagem do Dentista</strong> para a ler.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Escreva primeiro S na caixa de mensagem e depois toque na seta de enviar.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'O dentista pede que responda <strong>S</strong> para confirmar. <strong>Toque na caixa de mensagem, escreva S e depois toque na seta de enviar</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Feito! Agora arrume: <strong>prima sem soltar a mensagem antiga</strong> no topo (mantenha o dedo sobre ela durante um ou dois segundos).', hint: 'Mantenha o dedo sobre a mensagem antiga no topo até aparecer um menu.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Aparece um menu. <strong>Toque em Apagar.</strong>',
         hints: {copy: 'Copiar copia as palavras. Toque em Apagar.', forward: 'Reencaminhar envia-a a outra pessoa. Toque em Apagar.'}},
        {screen: c => smsChat(p, c), question: {q: 'Uma mensagem de um número desconhecido diz que a sua encomenda está retida e pede-lhe que pague 1,45 £ através de uma ligação. O que faz?', options: [
            {t: 'Não toco na ligação. Reencaminho-a para o 7726 e depois apago-a', ok: true, why: 'Exatamente. O 7726 é gratuito e denuncia-a à sua operadora. As transportadoras não enviam mensagens com ligações a pedir taxas.'},
            {t: 'Pago, é só 1,45 £', why: 'As 1,45 £ são isco para obter os dados do seu cartão. Não toque na ligação: reencaminhe-a para o 7726 e apague-a.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Muito bem!</strong> Sabe ler e responder a mensagens de texto, e apagar as que não precisa.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Mapas', 15], ['WhatsApp', 9], ['Câmara', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Bateria', [{id: 'low-power', label: 'Modo de baixo consumo', toggle: saver, sub: 'Reduz a atividade em segundo plano até poder carregar totalmente.'}, {caption: 'UTILIZAÇÃO DA BATERIA POR APP'}], {back: 'Definições', top: head, bottom: apps})
            : list(p, 'Bateria', [{id: 'low-power', label: 'Poupança de bateria', toggle: saver, sub: 'Desativa algumas funcionalidades para a bateria durar mais.'}, {caption: 'Utilização da bateria'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'A bateria está a acabar? <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Toque em Bateria.</strong>', hint: p === 'ios' ? 'A Bateria está no terceiro grupo.' : 'A Bateria está na lista, depois de Notificações.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Está nos 23%. O <strong>${p === 'ios' ? 'Modo de baixo consumo' : 'Poupança de bateria'}</strong> faz com que dure mais tempo. <strong>Toque nele para o ativar.</strong> O símbolo da bateria fica ${p === 'ios' ? 'yellow' : 'orange'} para lho lembrar.`},
        {screen: c => batteryPage(p, c), question: {q: 'A lista mostra que o Facebook gastou mais bateria hoje. O que ajuda a bateria a durar mais?', options: [
            {t: 'Baixar o brilho do ecrã e fechar as apps que já não está a usar', ok: true, why: 'Sim. O ecrã é o que gasta mais energia. Baixe o brilho, e apps como o Facebook e o YouTube gastam muito.'},
            {t: 'Carregá-la a 100% a cada hora', why: 'Carregar com frequência não faz mal, mas não faz durar mais. Baixe o brilho e use o modo de poupança de bateria.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Muito bem!</strong> A poupança de bateria está ativada e sabe quais as apps que gastam mais energia.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'telemóvel · 3 chamadas' : 'Suspeita de spam · 3 chamadas'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Recentes', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>telemóvel</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>telemóvel</small><span>Ontem</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'O mesmo número desconhecido não pára de lhe ligar. Vamos bloqueá-lo. <strong>Abra a app Telefone.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `Nas chamadas recentes, <strong>toque no ⓘ</strong> junto ao número 07700 900842${p === 'android' ? ' (em alguns telemóveis Android, toque no próprio número)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Partilhar contacto'}, {id: 'block', label: p === 'ios' ? 'Bloquear este interlocutor' : 'Bloquear/denunciar spam', danger: true}], {back: 'Recentes'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Bloquear este interlocutor' : 'Bloquear/denunciar spam'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Bloquear este interlocutor?', 'Não receberá chamadas telefónicas, mensagens nem FaceTime de pessoas que estejam na sua lista de bloqueados.', [['cancel', 'Cancelar'], ['confirm', 'Bloquear contacto']])
            : dialog(p, 'Bloquear 07700 900842?', '⟦square-check⟧ Denunciar chamada como spam', [['cancel', 'Cancelar'], ['confirm', 'Bloquear']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Bloquear contacto' : 'Bloquear'}.</strong>${p === 'android' ? ' Deixar "Denunciar chamada como spam" marcado ajuda a avisar outras pessoas.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Bloqueado! Também pode <strong>silenciar todas as chamadas de números que não conhece</strong>. <strong>Toque em Definições.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Desça até ao fundo e <strong>toque em Apps</strong>.'},
            {screen: () => list(p, 'Apps', [{id: 'app-phone', label: 'Telefone'}, {id: 'app-messages', label: 'Mensagens'}, {id: 'app-mail', label: 'Correio'}], {back: 'Definições'}), target: 'app-phone', say: '<strong>Toque em Telefone.</strong>'},
            {screen: c => list(p, 'Telefone', [{id: 'silence', label: 'Silenciar chamadas de desconhecidos', toggle: !!c.silence}, {id: 'blocked', label: 'Contactos bloqueados', value: '1'}], {back: 'Apps'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Ative Silenciar chamadas de desconhecidos.</strong> As chamadas de números que não estão nos seus contactos vão direitas para o correio de voz e continuam a aparecer nas chamadas recentes.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Bloqueado! Também pode <strong>filtrar chamadas de spam</strong>. <strong>Toque nos três pontos ⋮</strong> em cima, à direita.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Toque em Definições.</strong>'},
            {screen: () => list(p, 'Definições', [{id: 'caller-id', label: 'ID do autor da chamada &amp; spam'}, {id: 'blocked', label: 'Números bloqueados'}, {id: 'sounds', label: 'Sons e vibração'}]), target: 'caller-id', say: '<strong>Toque em ID do autor da chamada &amp; spam.</strong>'},
            {screen: c => list(p, 'ID do autor da chamada &amp; spam', [{id: 'caller-show', label: 'Ver ID do autor da chamada e de spam', toggle: true}, {id: 'silence', label: 'Filtrar chamadas de spam', toggle: !!c.silence, sub: 'As chamadas com suspeita de spam não farão tocar o telemóvel'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Ative Filtrar chamadas de spam.</strong> As chamadas com suspeita de burla não farão tocar o telemóvel.'},
        ]),
        {screen: c => list(p, 'Concluído', [{label: 'Números bloqueados', value: '1'}, {label: p === 'ios' ? 'Silenciar chamadas de desconhecidos' : 'Filtrar chamadas de spam', toggle: true}]),
         question: {q: 'Silenciar os desconhecidos pode fazer com que perca uma chamada genuína, por exemplo de um hospital ou de um estafeta?', options: [
            {t: 'Sim, por isso veja de vez em quando o correio de voz e as chamadas perdidas', ok: true, why: 'Exatamente. Quem liga a sério costuma deixar mensagem, e as chamadas perdidas continuam a aparecer na lista.'},
            {t: 'Não, chegam sempre até si', why: 'Os números desconhecidos vão para o correio de voz, incluindo os genuínos. Veja o correio de voz e as chamadas perdidas de vez em quando.'}]}},
        {screen: () => list(p, 'Concluído', [{label: 'Números bloqueados', value: '1'}, {label: p === 'ios' ? 'Silenciar chamadas de desconhecidos' : 'Filtrar chamadas de spam', toggle: true}]), done: true,
         say: '<strong>Muito bem!</strong> Bloqueou um número incómodo e reduziu as chamadas de burla.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: a sua encomenda está retida por uma taxa de 1,45 £ por pagar. Pague agora para voltar a marcar: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Para: ${field('fwdto', 'Número', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Obrigado. Envie o número de telefone de onde veio a mensagem de burla.</span><small>agora</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Obrigado, a sua denúncia foi recebida.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Nova mensagem') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Mensagem de texto', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Mais… e depois Reencaminhar' : 'Reencaminhar'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Recebeu uma mensagem de burla a fazer-se passar pela Royal Mail. Antes de a apagar, denuncie-a, é gratuito. <strong>Abra as Mensagens.</strong>'},
        {screen: () => app(p, 'Mensagens', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Toque na mensagem</strong> para a abrir. Não toque na ligação que está lá dentro!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Prima sem soltar a mensagem</strong> (mantenha o dedo sobre ela) até aparecer um menu. Não toque na ligação.', hint: 'Mantenha o dedo sobre o balão cinzento da mensagem durante um ou dois segundos.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Toque em Mais…</strong> e depois na seta de reencaminhar (aqui, um só botão faz as duas coisas).' : '<strong>Toque em Reencaminhar.</strong> (Em alguns telemóveis, está por baixo dos três pontos ⋮ no topo.)',
         hints: {delete: 'Denuncie-a primeiro e depois pode apagá-la.', copy: 'Toque em Reencaminhar para a enviar para o 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'Na caixa "Para", escreva 7726 (no teclado do telefone forma SPAM) e depois toque em enviar.',
         action: c => { c.sent7726 = true; }, say: 'Na caixa <strong>Para</strong>, escreva <strong>7726</strong>. (No teclado forma S-P-A-M.) Depois <strong>toque em enviar</strong> ⟦send-horizontal⟧. É gratuito.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Escreva o número do burlão, 07700 900911, e depois toque em enviar.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: 'O 7726 responde, a perguntar de que número veio a burla. <strong>Escreva 07700 900911</strong> e <strong>toque em enviar</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Denunciou-a. O que deve fazer agora à mensagem de burla?', options: [
            {t: 'Apagá-la e bloquear o número', ok: true, why: 'Sim. Está denunciada, por isso pode apagá-la. Bloquear impede mais mensagens desse número.'},
            {t: 'Tocar na ligação para ver se é verdadeira', why: 'Nunca toque em ligações de mensagens de burla. Apague-a e bloqueie o número.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Muito bem!</strong> Denunciou uma mensagem de burla ao 7726, o que ajuda as operadoras a bloqueá-la para todos. Os emails de burla vão para report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'As atualizações corrigem problemas de segurança, por isso são importantes. Ligue primeiro o telemóvel à corrente e ao Wi-Fi. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toque em Geral.</strong>'},
        {screen: () => list(p, 'Geral', [{id: 'about', label: 'Acerca'}, {id: 'software', label: 'Atualização de software', value: '1'}, {id: 'storage', label: 'Armazenamento do iPhone'}], {back: 'Definições'}), target: 'software', say: '<strong>Toque em Atualização de software.</strong> O 1 vermelho significa que há uma atualização à espera.'},
        {screen: () => list(p, 'Atualização de software', [{id: 'auto', label: 'Atualizações automáticas', value: 'Desativado'}], {back: 'Geral',
            bottom: '<div class="hu"><strong>Atualização do iOS</strong><p>Esta atualização inclui correções de segurança importantes e é recomendada para todos os utilizadores.</p><button type="button" class="ce co" data-tap="update-now">Atualizar agora</button></div>'}),
         target: 'update-now', say: '<strong>Toque em Atualizar agora.</strong>', hints: {auto: 'Vale a pena ativar também as atualizações automáticas, depois disto. Primeiro, toque em Atualizar agora.'}},
        {screen: c => codeScreen(p, c, 'Introduza o código', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'O iPhone pede o seu código. <strong>Escreva o código de treino 4 7 1 9 3 6.</strong>', hint: 'Escreva 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Atualização de software', [], {back: 'Geral', bottom: `<div class="hu"><strong>${c.busy ? 'A descarregar…' : 'Pronta para instalar'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Primeiro descarrega, o que pode demorar alguns minutos. Depois <strong>toque em Instalar agora</strong>. O telemóvel reinicia, por isso faça-o quando não precisar dele durante 15 a 30 minutos.'},
        {screen: () => list(p, 'Atualização de software', [{id: 'auto', label: 'Atualizações automáticas', value: 'Ativada'}], {back: 'Geral', bottom: '<div class="hu"><strong>O seu iPhone está atualizado</strong></div>'}),
         question: {q: 'Vale a pena ativar as Atualizações automáticas?', options: [
            {t: 'Sim, assim atualiza durante a noite enquanto carrega', ok: true, why: 'Exatamente. Definições > Geral > Atualização de software > Atualizações automáticas. Instala durante a noite, quando está ligado à corrente e ao Wi-Fi.'},
            {t: 'Não, as atualizações são opcionais', why: 'As atualizações corrigem falhas de segurança que os burlões aproveitam. As atualizações automáticas mantêm-no seguro sem ter de se lembrar.'}]}},
        {screen: () => list(p, 'Atualização de software', [], {bottom: '<div class="hu"><strong>O seu iPhone está atualizado ⟦check⟧</strong></div>'}), done: true, say: '<strong>Muito bem!</strong> O telemóvel está atualizado e protegido contra os problemas mais recentes.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'As atualizações corrigem problemas de segurança, por isso são importantes. Ligue primeiro o telemóvel à corrente e ao Wi-Fi. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Desça e <strong>toque em Sistema</strong>. <em>Num Samsung, é Atualização de software, perto do fim.</em>'},
        {screen: () => list(p, 'Sistema', [{id: 'languages', label: 'Idiomas'}, {id: 'date', label: 'Data &amp; hora'}, {id: 'software', label: 'Atualizações de software', sub: 'Atualização disponível'}]), target: 'software', say: '<strong>Toque em Atualizações de software.</strong>'},
        {screen: () => list(p, 'Atualizações de software', [{id: 'system-update', label: 'Atualização do sistema', sub: 'Atualização disponível'}, {id: 'play-update', label: 'Atualização do sistema Google Play'}]), target: 'system-update', say: '<strong>Toque em Atualização do sistema.</strong>'},
        {screen: () => list(p, 'Atualização do sistema', [], {bottom: '<div class="hu"><strong>Atualização do sistema disponível</strong><p>Inclui correções de segurança importantes.</p><button type="button" class="ce dk" data-tap="download">Descarregar &amp; instalar</button></div>'}),
         target: 'download', say: '<strong>Toque em Descarregar &amp; instalar.</strong>'},
        {screen: c => list(p, 'Atualização do sistema', [], {bottom: `<div class="hu"><strong>${c.busy ? 'A descarregar e a instalar…' : 'Reinicie para concluir'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Descarrega e prepara-se, o que pode demorar algum tempo. Depois <strong>toque em Reiniciar agora</strong>. O telemóvel desliga-se e volta a ligar-se, o que demora alguns minutos.'},
        {screen: () => list(p, 'Atualização do sistema', [], {bottom: '<div class="hu"><strong>O sistema está atualizado</strong></div>'}),
         question: {q: 'O telemóvel não recebe uma atualização há anos. O que pode significar?', options: [
            {t: 'Pode ser demasiado antigo para receber atualizações de segurança, por isso é menos seguro', ok: true, why: 'Sim. Os telemóveis mais antigos deixam de receber atualizações. Evite usá-los para o banco e pense em substituí-los quando puder.'},
            {t: 'Está a funcionar na perfeição', why: 'Os telemóveis deixam de receber atualizações ao fim de alguns anos, o que deixa falhas de segurança por corrigir.'}]}},
        {screen: () => list(p, 'Atualização do sistema', [], {bottom: '<div class="hu"><strong>O sistema está atualizado ⟦check⟧</strong></div>'}), done: true, say: '<strong>Muito bem!</strong> O telemóvel está atualizado e protegido contra os problemas mais recentes.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (Filha)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Ficha Médica' : 'Informações médicas', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'p. ex. Diabetes tipo 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'p. ex. Penicilina', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Mostrar com o ecrã bloqueado</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Concluído' : 'Guardar'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Escolher um contacto</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Saúde', '#fff', ICON2.health]]), target: 'health', say: 'Uma <strong>Ficha Médica</strong> permite que os paramédicos vejam as suas alergias e o seu contacto de emergência, mesmo com o telemóvel bloqueado. <strong>Abra a app Saúde.</strong>'},
            {screen: () => app(p, 'Resumo', '<p class="cf">Os seus dados de saúde aparecem aqui.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Toque na sua fotografia</strong> no canto superior direito.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Detalhes de saúde'}, {id: 'medical', label: 'Ficha Médica'}], {back: 'Resumo'}), target: 'medical', say: '<strong>Toque em Ficha Médica.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'O telemóvel pode guardar <strong>informações médicas</strong> que os paramédicos conseguem ver, mesmo com ele bloqueado. <strong>Toque em Definições.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Desça e <strong>toque em Segurança &amp; emergência</strong>. <em>Num Samsung, é Segurança e emergência.</em>'},
            {screen: () => list(p, 'Segurança &amp; emergência', [{id: 'medical', label: 'Informações médicas'}, {id: 'contacts-ec', label: 'Contactos de emergência'}, {id: 'sos', label: 'SOS de Emergência'}]), target: 'medical', say: '<strong>Toque em Informações médicas.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Escreva primeiro uma alergia (para treinar, "Penicilina") e depois junte um contacto de emergência.',
         say: 'Preencha tudo o que os paramédicos devam saber. Para treinar, escreva <strong>Penicilina</strong> em alergias. Depois <strong>toque em adicionar contacto de emergência</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Escolha a quem ligar numa emergência. <strong>Toque em Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '"Mostrar com o ecrã bloqueado" está ativado, por isso os paramédicos conseguem ver. <strong>Toque em Concluído.</strong>' : '<strong>Toque em Guardar.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Ficha Médica' : 'Informações médicas', [{label: 'Alergias', sub: typed(c, 'allergies')}, {label: 'Contacto de emergência', sub: 'Sarah (Filha)'}]),
         question: {q: p === 'ios' ? 'Como é que um paramédico veria a sua Ficha Médica se o telemóvel estivesse bloqueado?' : 'Como é que um paramédico veria isto se o telemóvel estivesse bloqueado?', options: [
            {t: 'Através do botão "Emergência" no ecrã de bloqueio', ok: true, why: 'Sim. Tocar em Emergência no ecrã de bloqueio mostra as suas informações médicas, sem desbloquear o telemóvel.'},
            {t: 'Não conseguiria', why: 'Consegue: o botão Emergência no ecrã de bloqueio mostra-as, sem precisar do código.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Ficha Médica' : 'Informações médicas', [{label: 'Alergias', sub: typed(c, 'allergies')}, {label: 'Contacto de emergência', sub: 'Sarah (Filha)'}]), done: true,
         say: '<strong>Muito bem!</strong> As suas informações médicas e o contacto de emergência ficaram guardados. Se pedir ajuda com o SOS de Emergência, o contacto de emergência também é avisado.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Encontrar' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ A tocar…' : '⟦volume-2⟧ Reproduzir som'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Marcar como perdido' : 'Proteger o dispositivo'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Se alguma vez perder o telemóvel, pode encontrá-lo, fazê-lo tocar ou bloqueá-lo, mas só se isto estiver ativado antes. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toque no seu nome</strong> no topo.'},
            {screen: () => list(p, 'Conta Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Encontrar'}, {id: 'family', label: 'Partilha em Família'}], {back: 'Definições'}), target: 'findmy', say: '<strong>Toque em Encontrar.</strong>'},
            {screen: c => list(p, 'Encontrar', [{id: 'find-toggle', label: 'Encontrar o iPhone', toggle: !!c.findOn}, {label: 'Enviar última localização', toggle: !!c.findOn}], {back: 'Conta Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Ative Encontrar o iPhone.</strong> "Enviar última localização" envia a localização do telemóvel mesmo antes de a bateria acabar.'},
            {screen: () => homeWith(p, [['findmy', 'Encontrar', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Agora imagine que não encontra o telemóvel. Noutro aparelho Apple abriria a app <strong>Encontrar</strong> (ou iria a icloud.com/find num computador). Aqui, <strong>toque em Encontrar</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Desça e <strong>toque em Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Todos os serviços'}, {id: 'account', label: 'Gerir a sua Conta Google'}]), target: 'all-services', say: '<strong>Toque em Todos os serviços.</strong>'},
            {screen: () => list(p, 'Todos os serviços', [{id: 'find-hub', label: 'Find Hub', sub: 'Anteriormente chamado Localizar o meu dispositivo'}, {id: 'theft', label: 'Proteção contra roubo'}]), target: 'find-hub', say: '<strong>Toque em Find Hub</strong> (antes chamava-se Localizar o meu dispositivo). <em>A Samsung também tem o seu próprio: Definições &gt; Segurança e privacidade &gt; Proteção de dispositivo perdido.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Usar o Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Ative Usar o Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Agora imagine que não encontra o telemóvel. Noutro telemóvel ou tablet abriria o <strong>Find Hub</strong>, ou iria a google.com/android/find num computador. Aqui, <strong>toque em Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Aí está ele, no mapa. Se estiver algures por perto, como ao lado do sofá, <strong>toque em Reproduzir som</strong>: toca bem alto, mesmo em silêncio.'},
        {screen: c => findMap(p, c), question: {q: 'O mapa mostra o telemóvel num sítio onde nunca esteve. O que deve fazer?', options: [
            {t: 'Usar Marcar como perdido ou Proteger o dispositivo para o bloquear, e contactar a polícia', ok: true, why: 'Sim. Bloqueie-o a partir do Encontrar ou do Find Hub, não vá lá pessoalmente, e comunique à polícia e à operadora.'},
            {t: 'Ir buscá-lo eu mesmo', why: 'Nunca confronte um ladrão. Bloqueie o telemóvel à distância e contacte a polícia.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Muito bem!</strong> A função de encontrar o telemóvel está ativada e sabe como o fazer tocar ou bloqueá-lo.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Dicas tecnológicas gratuitas</strong>${UI.qr}<small>Leia-me</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Apagar esta fotografia?', p === 'ios' ? 'Ficará guardada em Apagadas Recentemente durante 30 dias.' : 'Será movida para a reciclagem durante algum tempo antes de desaparecer.', [['cancel', 'Cancelar'], ['confirm-delete', 'Apagar']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Abra a Câmara.</strong> <em>Dica: na maioria dos telemóveis também pode deslizar para a esquerda no ecrã de bloqueio.</em>', hint: 'A câmara é o ícone cinzento com uma máquina fotográfica.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Aponte-a às flores e mantenha-a firme. <strong>Toque no botão redondo grande</strong> para tirar uma fotografia.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Clique! Ficou guardada. <strong>Toque na pequena imagem</strong> no canto para a ver.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Para ver mais de perto, ponha dois dedos na fotografia e afaste-os. Aqui, <strong>toque duas vezes em ＋</strong>.', hint: 'Toque no ＋ em cima, à direita.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Que bonito! Para a enviar a alguém, <strong>toque no botão de partilhar</strong> ⇪ (uma caixa com uma seta).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Escolha como a enviar: Mensagens, email, WhatsApp e por aí fora. <strong>Toque em Mensagens.</strong> (Depois escolheria a quem a enviar.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Enviada! Agora, se tirar uma fotografia de que não gosta, <strong>toque no caixote do lixo</strong> ⟦trash-2⟧ para a apagar.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'O telemóvel confirma primeiro. <strong>Toque em Apagar.</strong>'},
        {screen: () => app(p, 'Fotografias', '<p class="cf">Ainda sem fotografias.</p>', {back: false, color: '#fff'}), question: {q: 'Apagou uma fotografia sem querer! O que pode fazer?', options: [
            {t: p === 'ios' ? 'Ir a Álbuns > Apagadas Recentemente e recuperá-la' : 'Ir à Reciclagem (Biblioteca > Reciclagem) e restaurá-la', ok: true, why: 'Sim. As fotografias apagadas ficam guardadas durante algum tempo, normalmente cerca de um mês, por isso pode recuperá-las.'},
            {t: 'Nada, desapareceu para sempre', why: 'Não se preocupe! Fica guardada em Apagadas Recentemente (iPhone) ou na Reciclagem (Android) durante algum tempo.'}]}},
        {screen: () => app(p, 'Fotografias', '<p class="cf">Está feito.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Muito bem!</strong> Sabe tirar, ampliar, partilhar e apagar fotografias.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Se a sua família também tiver iPhones, o <strong>FaceTime</strong> faz videochamadas gratuitas. <strong>Toque em FaceTime.</strong>' : 'O <strong>Google Meet</strong> faz videochamadas gratuitas a partir do Android, e também para iPhones. <strong>Toque em Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Novo FaceTime' : 'Nova'}</button><p class="cf">As chamadas recentes aparecem aqui.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Novo FaceTime' : 'Nova'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Novo FaceTime' : 'Ligar', `<div class="xz">To: ${field('callto', 'Nome ou número', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Videochamada'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Escreva primeiro Sarah na caixa "Para".',
             say: 'Escreva o nome de alguém dos seus contactos. <strong>Escreva Sarah</strong> e depois <strong>toque no botão de vídeo</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Toca, e a Sarah atende. Para lhe mostrar o jardim, <strong>toque no botão de virar</strong> ⟦switch-camera⟧ para usar a câmara de trás.', hint: 'Espere que a Sarah atenda e depois toque em ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Quando terminar, <strong>toque no botão vermelho</strong> para desligar.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Vídeo · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'O seu amigo tem um telemóvel Android e você tem um iPhone. Ainda podem fazer videochamadas?', options: [
                {t: 'Sim, com o WhatsApp ou o Google Meet, que funcionam nos dois', ok: true, why: 'Exatamente. O FaceTime funciona sobretudo de iPhone para iPhone. O WhatsApp e o Google Meet funcionam entre os dois.'},
                {t: 'Não, nunca', why: 'Podem: o WhatsApp e o Google Meet funcionam nos dois tipos de telemóvel.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Está feito.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Muito bem!</strong> Fez uma videochamada e mostrou a vista da câmara de trás.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Os códigos QR são aqueles padrões quadrados a preto e branco que se veem em cartazes e ementas. A câmara consegue lê-los, sem precisar de mais nenhuma app. <strong>Abra a Câmara.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Aponte a câmara ao código e mantenha-a quieta por um momento. <strong>Aparece uma ligação no ecrã</strong>: confirme que parece vir de quem esperaria e depois <strong>toque nela</strong>.',
         hints: {shutter: 'Não é preciso tirar uma fotografia: basta apontar e esperar que a ligação apareça, e depois tocar nela.'},
         hint: p === 'android' ? 'Espere que a ligação apareça e depois toque nela. Se não aparecer nada, experimente o Google Lens.' : 'Espere que a ligação apareça e depois toque nela.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Dicas tecnológicas gratuitas</h3><p>Dicas em linguagem simples sobre telemóveis, computadores e como se manter seguro online.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Vê um autocolante com um código QR numa máquina de pagamento de um parque de estacionamento. Qual é a forma mais segura de pagar?', options: [
            {t: 'Usar a app oficial do parque ou a máquina, não um código QR colado', ok: true, why: 'Sim. Os burlões colam códigos QR falsos por cima dos verdadeiros para roubar dados de cartões. Veja se é um autocolante e use a app ou a sinalização oficial.'},
            {t: 'Digitalizar e pagar, é mais rápido', why: 'Os autocolantes de códigos QR falsos nas máquinas dos parques de estacionamento são uma burla conhecida. Use a app oficial ou a própria máquina.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Dicas tecnológicas gratuitas</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Muito bem!</strong> Sabe digitalizar códigos QR com a câmara e sabe que deve verificar primeiro a ligação.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Fotografias de domingo 📷', 'Olá, mãe, aqui estão as fotografias do almoço…'],
                       ['tv', 'TV Licensing', 'A sua licença EXPIROU', 'Aja agora para evitar um processo judicial. Atualize o seu pagamento…'],
                       ['library', 'Biblioteca de Bridlington', 'Os seus livros têm de ser devolvidos', 'Os seus itens têm de ser devolvidos na sexta-feira.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Caixa de entrada' : 'Principal', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · para mim</p><h3>Fotografias de domingo 📷</h3><p>Olá, mãe, aqui estão as fotografias do almoço. Foi tão bom ver-te! x</p>
                <div class="aep">⟦image⟧ almoco.jpg</div>${ctx.replying ? `${field('mailreply', 'Escreva a sua resposta…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>A sua licença EXPIROU</h3><p>Aja agora para evitar um processo judicial. Atualize os seus dados de pagamento em 24 horas: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Mover para Lixo' : '⋮ Denunciar phishing'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Correio' : 'a sua app de email (o Gmail na maioria dos telemóveis Android)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Os emails novos aparecem a negrito. <strong>Toque no email da Sarah</strong> para o ler.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Para responder, <strong>toque em Responder</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Escreva primeiro uma resposta curta e depois toque em Enviar.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Escreva uma resposta curta</strong> (como "Obrigado, adorei!") e <strong>toque em Enviar</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Enviado ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Voltar à caixa de entrada</button>', {color: '#fff'}), target: 'back', say: '<strong>Toque em Voltar</strong> para regressar à caixa de entrada.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Há um email preocupante da "TV Licensing". <strong>Abra-o</strong>, mas não toque em nada lá dentro.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Os emails de burla costumam usar um nome verdadeiro, mas um endereço falso. <strong>Toque no nome do remetente</strong> para ver o verdadeiro endereço de email.',
         hint: 'Toque em "TV Licensing" no topo do email.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Vem de <strong>outlook-mail.com</strong>, não de tvlicensing.co.uk. É uma burla. <strong>Toque em ' + (p === 'ios' ? 'Mover para Lixo' : 'Denunciar phishing') + '.</strong> Também pode reencaminhar emails de burla para report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'O que denunciou a burla?', options: [
            {t: 'O verdadeiro endereço do remetente, as ameaças e o prazo de 24 horas', ok: true, why: 'Exatamente. As organizações a sério não o ameaçam com prazos, e os emails delas vêm do seu próprio endereço na internet.'},
            {t: 'Nada, parecia verdadeiro', why: 'Verifique o endereço do remetente: não era o da TV Licensing. As ameaças e os prazos apertados também são grandes sinais de alerta.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Muito bem!</strong> Sabe ler e responder a emails, e detetar e denunciar uma burla.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Obter' : 'Instalar';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Toque em Pesquisar.</strong>' : '<strong>Toque na barra de pesquisa.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Pesquisámos "NHS App". Muitas apps usam "NHS" no nome. Veja <strong>quem a criou</strong>: a verdadeira é da <strong>NHS England</strong>. <strong>Toque em ' + (p === 'ios' ? 'Obter' : 'Instalar') + ' junto à verdadeira.</strong>',
         hints: {'fake1-get': 'Esta é da HealthApps Ltd, e é um anúncio. A verdadeira NHS App é criada pela NHS England.', 'fake2-get': 'Esta é da QuickDev Apps, não do NHS. A verdadeira é criada pela NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Instalada! Agora remova uma app que nunca usa, para arrumar e libertar espaço. <strong>Prima sem soltar a app Meteorologia</strong> até aparecer um menu.', hint: 'Mantenha o dedo sobre o ícone Meteorologia durante um ou dois segundos.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Remover "Meteorologia"?' : 'Meteorologia', p === 'ios' ? 'Remover do Ecrã Principal mantém a app na Biblioteca de Apps.' : '', p === 'ios'
            ? [['delete-app', 'Apagar app'], ['remove-home', 'Remover do Ecrã Principal'], ['cancel', 'Cancelar']] : [['app-info', 'Informações da app'], ['delete-app', 'Desinstalar'], ['cancel', 'Cancelar']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Toque em Remover app</strong> e depois em <strong>Apagar app</strong> (aqui é um só botão).' : '<strong>Toque em Desinstalar.</strong>',
         hints: {'remove-home': 'Isso só esconde o ícone; a app continua no telemóvel. Toque em Apagar app.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Uma app pede um pagamento para "desbloquear" os seus registos do NHS. O que acha?', options: [
            {t: 'Não é a verdadeira NHS App, que é totalmente gratuita', ok: true, why: 'Exatamente. A NHS App é gratuita. Apague tudo o que peça para pagar por serviços do NHS.'},
            {t: 'Pago, é para o NHS', why: 'A verdadeira NHS App é gratuita e criada pela NHS England. Uma app que peça dinheiro não é a verdadeira.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Muito bem!</strong> Sabe distinguir apps verdadeiras de imitações, e remover as apps de que não precisa.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Bem-vindo de volta.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Iniciar sessão com Face ID' : 'Iniciar sessão com impressão digital'}</button>
                <button type="button" class="cp" data-tap="password">Iniciar sessão com email e palavra-passe</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Receitas'], ['appointments', '⟦calendar⟧', 'Consultas'], ['records', '⟦clipboard-list⟧', 'A sua saúde'], ['messages', '⟦mail⟧', 'Mensagens']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Receitas', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Pedir uma receita repetida</strong><small>Escolha medicamentos que já lhe foram receitados</small></button><div class="ck"><strong>Ver os seus pedidos</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipina, comprimidos de 5 mg'], ['med-2', 'Atorvastatina, comprimidos de 20 mg']];
            return app(p, 'Escolher medicamentos', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Confirme o seu pedido', `<p class="cf">Amlodipina, comprimidos de 5 mg<br>Levantar em: A sua farmácia indicada</p><button type="button" class="ce co" data-tap="confirm">Confirmar e pedir</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Pedido enviado', '<p class="cf">⟦check⟧ O seu pedido de receita foi enviado para o seu centro de saúde. Costuma demorar 2 a 3 dias úteis.</p><button type="button" class="cp" data-tap="home">Voltar ao início</button>', {color: NHS});
        return app(p, 'Consultas', '<div class="fo"><div class="ck"><strong>Consulta no médico de família</strong><small>Terça-feira às 10:30 · O seu centro de saúde</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: 'A <strong>NHS App</strong> é gratuita e permite-lhe pedir receitas repetidas, ver consultas e muito mais. (Esta versão de treino é de faz de conta, feita só para esta lição.) <strong>Toque em NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Depois de a configurar com o NHS login, pode iniciar sessão com ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Toque em Iniciar sessão com ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Isso também funciona, mas o rosto ou a impressão digital são mais rápidos. Toque no botão azul.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Toque em Receitas.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Toque em Pedir uma receita repetida.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Toque primeiro num medicamento para o assinalar e depois toque em Continuar.',
         say: '<strong>Toque no medicamento de que precisa</strong> para o assinalar (experimente a Amlodipina) e depois <strong>toque em Continuar</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Confirme que está certo e depois <strong>toque em Confirmar e pedir</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Enviado para o seu centro de saúde! <strong>Toque em Voltar ao início.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Também pode ver as suas consultas. <strong>Toque em Consultas.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Uma mensagem diz "NHS: tem direito a um kit de teste gratuito, introduza os seus dados bancários para pagar o envio". O que é?', options: [
            {t: 'Uma burla. O NHS nunca pede dados bancários por mensagem', ok: true, why: 'Exatamente. Use a NHS App ou contacte diretamente o seu centro de saúde, nunca as ligações de mensagens.'},
            {t: 'Verdadeira, é só o envio', why: 'O NHS nunca envia mensagens a pedir dados bancários. É uma burla: reencaminhe-a para o 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Muito bem!</strong> Pediu uma receita repetida e consultou as suas consultas.'},
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
        if (page === 'login') return app(p, 'Banco de Treino', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Iniciar sessão com Face ID' : 'Iniciar sessão com impressão digital'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'As suas contas', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Hoje'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Hoje'], ['txn-pension', 'State Pension', '+£921.60', 'Ontem'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Seg']];
            return app(p, 'Conta à ordem', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Pagamento', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Hoje, 03:12 · Cartão terminado em 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Congelar cartão</strong><small>${ctx.frozen ? 'Cartão congelado ⟦check⟧' : 'Pare os pagamentos de imediato'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Denunciar este pagamento</strong><small>Não o reconhece? Diga-nos</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Banco', BANK, ICON2.pound]]), target: 'bank',
         say: 'As apps do banco permitem-lhe ver o seu dinheiro a qualquer hora. (Este é um banco de faz de conta, para treino.) <strong>Abra a app do Banco.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Inicie sessão com ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Nunca partilhe com ninguém o código da sua app do banco.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Toque na sua Conta à ordem</strong> para ver o que entrou e saiu.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Veja os pagamentos. Há um que não reconhece: <strong>249 £ às 3 da manhã, num site de cartões-presente</strong>. <strong>Toque nele.</strong>',
         hints: {'txn-tesco': 'Isso são as suas compras. Procure um que não reconheça.', 'txn-pension': 'Isso é a sua pensão a ser paga. Procure o que destoa.', 'txn-water': 'Isso é a sua conta da água. Procure o que destoa.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Toque em Congelar cartão</strong>. Impede mais pagamentos de imediato, e pode descongelá-lo mais tarde se afinal estiver tudo bem.',
         hints: {report: 'Congele primeiro o cartão, para impedir mais pagamentos. Depois denuncie.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Congelou o cartão. E agora?', options: [
            {t: 'Ligar ao banco para o 159 ou para o número que está no cartão, ou denunciar na app', ok: true, why: 'Sim. Podem investigar, cancelar o cartão e muitas vezes recuperar o dinheiro. Quanto mais cedo lhes disser, melhor.'},
            {t: 'Esperar para ver se volta a acontecer', why: 'Avise o banco de imediato. Quanto mais cedo souber, mais pode fazer.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Muito bem!</strong> Consultou a conta, detetou um pagamento que não reconhecia e congelou o cartão.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Banco de Treino</strong><span>•••• 4421</span><small>DÉBITO</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Carteira' : 'Google Wallet', `<p class="cf">Adicione um cartão para pagar nas lojas com o telemóvel.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Adicionar cartão' : '＋ Adicionar à Carteira'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Adicionar cartão', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Segure o cartão dentro da moldura…' : 'Cartão encontrado ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Verificar cartão', `<p class="cf">O seu banco precisa de confirmar que é você. Escolha como receber um código:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Mensagem de texto</strong><small>para ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Ligar ao banco</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Introduza o código', `<div class="jp ex"><strong>Mensagens · agora</strong><span>Banco de Treino: o seu código da Carteira é 529173. Nunca o partilhe.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Carteira' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ O seu cartão está pronto a usar.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Aproxime do leitor…' : 'Aproxime do leitor…') : '⟦check⟧ Concluído'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Carteira' : 'Carteira', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Pagar com o telemóvel é rápido e seguro: as lojas nunca veem o número do cartão. <strong>Abra ${p === 'ios' ? 'Carteira' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Adicionar cartão' : '＋ Adicionar à Carteira'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'O telemóvel usa a câmara para ler o cartão, para não ter de escrever o número. <strong>Segure o cartão dentro da moldura</strong> e depois <strong>toque em Seguinte</strong>. <em>Nunca escreva o número do cartão num site a partir de uma mensagem ou email.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'O seu banco confirma que é mesmo você. <strong>Toque em Mensagem de texto.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Chega um código por mensagem do seu banco. <strong>Escreva 5 2 9 1 7 3.</strong> Lembre-se: este código só se escreve no seu próprio telemóvel, nunca se dá a quem o pedir.', hint: 'Escreva o código da mensagem: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'O cartão está pronto. Agora vamos pagar numa loja. <strong>Toque em qualquer ponto do cartão.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'Na caixa, <strong>carregue duas vezes no botão lateral</strong> do iPhone (aqui toque duas vezes em ⟦power⟧), olhe para o ecrã para o Face ID e depois aproxime a parte de cima do telemóvel do leitor de cartões.', hint: 'Toque duas vezes no botão ⟦power⟧ do lado.'}
            : {target: 'pay-now', say: 'Na caixa, basta <strong>desbloquear o telemóvel e aproximar a parte de trás dele do leitor de cartões</strong>. Aqui, <strong>toque no leitor de cartões</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Pagar com o telemóvel é seguro?', options: [
            {t: 'Sim, mais seguro do que o cartão: precisa do seu rosto, impressão digital ou código, e as lojas não veem o número do cartão', ok: true, why: 'Exatamente. E se perder o telemóvel, ninguém consegue pagar com ele sem o desbloquear.'},
            {t: 'Não, qualquer pessoa o podia usar', why: 'Cada pagamento precisa do rosto, da impressão digital ou do código, por isso é até mais seguro do que um cartão sem contacto.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Muito bem!</strong> O cartão está no telemóvel e fez um pagamento de treino.'},
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
            return app(p, 'Comboios de Treino', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Escolher estação'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Adicionar um cartão de desconto'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Escolha uma estação</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Adicionar um cartão de desconto</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Sem cartão de desconto']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Direto'], ['t-1145', '11:45', '12:32', 'Direto'], ['t-1245', '12:45', '13:32', 'Direto']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Os preços são inventados para este treino. Desconto do cartão aplicado.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Simples fora das horas de ponta</strong><span>7,40 £</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Ida e volta no dia, fora das horas de ponta</strong><small>Regresse hoje</small><span>9,85 £</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'O seu bilhete', `<div class="adt"><strong>Ida e volta no dia, fora das horas de ponta</strong><span>Bridlington ⇄ Hull</span><span>Hoje · Senior Railcard</span>
            ${UI.qr}<small>Digitalize isto na cancela da estação ou mostre-o ao revisor.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Comboios', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'As apps de comboios permitem comprar bilhetes no telemóvel, sem filas. (Esta app de treino é de faz de conta: os preços e os horários são inventados.) <strong>Abra Comboios.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Vai partir de Bridlington. <strong>Toque em Para</strong> para escolher o destino.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Toque em Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Tem mais de 60 anos? Um <strong>Senior Railcard</strong> poupa um terço na maioria dos bilhetes. <strong>Toque em Cartão de desconto</strong> para adicionar o seu.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Toque em Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Toque em Procurar comboios.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Aqui estão os comboios. <strong>Toque no das 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Vai voltar hoje? Um bilhete de ida e volta no dia costuma ser mais barato do que dois simples. <strong>Toque em Ida e volta no dia, fora das horas de ponta</strong> e depois pague.',
         hints: {single: 'Um simples é só para um sentido. Vai voltar hoje, por isso toque em Ida e volta no dia, fora das horas de ponta.', pay: 'Escolha primeiro o bilhete: toque em Ida e volta no dia, fora das horas de ponta.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Toque em ${p === 'ios' ? 'Pagar' : 'G Pay'}</strong> para pagar com o cartão que está no telemóvel (da lição sobre pagamentos sem contacto).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'A bateria do telemóvel está fraca antes do comboio de regresso. Qual é uma boa ideia?', options: [
            {t: 'Fazer uma captura de ecrã do bilhete e ativar a poupança de bateria', ok: true, why: 'Sim. Alguns bilhetes funcionam a partir de uma captura de ecrã, e a poupança de bateria ajuda a durar mais. Muitas apps também deixam adicionar o bilhete à Carteira.'},
            {t: 'Nada, vai correr bem', why: 'Se o telemóvel se desligar, não consegue mostrar o bilhete. Faça uma captura de ecrã e poupe bateria.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Muito bem!</strong> Planeou uma viagem, adicionou um cartão de desconto e comprou um bilhete no telemóvel.'},
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

    const busTable = `<div class="sj"><strong>Autocarro 121: Bridlington a Hull</strong><small>Apenas horários de treino</small>
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
        return app(p, 'Horários dos autocarros', busTable, {back: false, color: '#fff',
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
            ? 'Uma captura de ecrã é uma fotografia do que está no ecrã, como estes horários dos autocarros. Prima ao mesmo tempo o <strong>botão lateral</strong> (direita) e o <strong>aumentar volume</strong> (esquerda) e depois largue. Aqui, <strong>toque no botão lateral e depois em aumentar volume</strong>.'
            : 'Uma captura de ecrã é uma fotografia do que está no ecrã, como estes horários dos autocarros. Prima ao mesmo tempo o <strong>botão de ligar</strong> e o <strong>diminuir volume</strong> e depois largue. Aqui, <strong>toque no botão de ligar e depois em diminuir volume</strong>.',
         hints: {'vol-down': p === 'ios' ? 'No iPhone é aumentar o volume, com o botão lateral.' : 'Comece pelo botão de ligar, na parte de cima do lado direito.',
                 'vol-up': p === 'ios' ? 'Comece pelo botão lateral, à direita.' : 'No Android é diminuir o volume, com o botão de ligar.',
                 side: 'Agora o botão de aumentar o volume, à esquerda.', power: 'Agora o botão de diminuir o volume.'},
         hint: p === 'ios' ? 'O botão lateral está na margem direita. O de aumentar o volume está à esquerda.' : 'O botão de ligar é o botão de cima na margem direita.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Clique! Aparece uma pequena imagem no canto de baixo. <strong>Toque nela</strong> para ver a captura de ecrã. <em>Se a deixar, guarda-se sozinha ao fim de alguns segundos.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Pode desenhar nela ou cortá-la aqui. <strong>Toque em Concluído</strong> no canto superior esquerdo.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Toque em Guardar em Fotografias.</strong>', hints: {'delete-shot': 'Isso deitá-la-ia fora. Toque em Guardar em Fotografias.', 'save-files': 'Ficheiros também serve, mas as Fotografias são mais fáceis de encontrar. Toque em Guardar em Fotografias.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Clique! Aparece uma pequena imagem com botões por baixo. Já está guardada. <strong>Toque em Partilhar</strong> para a enviar a alguém.', hints: {'shot-edit': 'Editar permite cortar ou desenhar nela. Por agora, toque em Partilhar.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Toque em Sarah</strong> para lhe enviar os horários dos autocarros.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Onde pode encontrar mais tarde as capturas de ecrã?', options: [
            {t: 'Na app Fotografias, no álbum Capturas de ecrã', ok: true, why: 'Sim. Ficam guardadas com as fotografias, por isso pode vê-las, partilhá-las ou apagá-las como qualquer fotografia.'},
            {t: 'Desaparecem ao fim de um dia', why: 'Ficam até as apagar. Procure na app Fotografias, no álbum Capturas de ecrã.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Muito bem!</strong> As capturas de ecrã são úteis para horários de autocarros, bilhetes, mensagens de erro e tudo o que queira guardar ou mostrar a alguém. Pode apagá-las das Fotografias quando terminar.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Pesquisar nos Mapas'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'A Sarah enviou-lhe uma morada por mensagem. Copiá-la poupa-lhe escrevê-la de novo. <strong>Abra as Mensagens.</strong>'},
        {screen: () => app(p, 'Mensagens', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Toque na mensagem da Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Prima sem soltar a mensagem com a morada</strong> (mantenha o dedo sobre ela durante um ou dois segundos) até aparecer um menu.', hint: 'Mantenha o dedo premido sobre a segunda mensagem até aparecer um menu.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Toque em Copiar.</strong> O telemóvel fica agora a lembrar-se das palavras, prontas para colar noutro sítio.',
         hints: {reply: 'Responder iniciaria uma mensagem. Toque em Copiar.', forward: 'Reencaminhar envia a mensagem a alguém. Toque em Copiar.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Copiada! Agora vá para o ecrã inicial. Aqui, <strong>toque na barra em baixo no ecrã</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Abra os Mapas</strong>, para encontrar a morada.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Prima sem soltar a caixa de pesquisa</strong> até aparecer um pequeno botão "Colar".', hint: 'Mantenha o dedo sobre a caixa de pesquisa no topo.',
         hints: {'search-tap': 'Um toque rápido abre o teclado. Prima antes sem soltar, até aparecer Colar.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Toque em Colar.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'A morada completa aparece, sem escrever nada. <strong>Toque no resultado.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Quer copiar só um número de telefone do meio de uma mensagem longa. Como?', options: [
            {t: 'Premir sem soltar, tocar em Selecionar (ou arrastar as pequenas pegas) para escolher só a parte que quer e depois Copiar', ok: true,
             why: 'Sim. Arraste as pegas de cada lado das palavras realçadas para escolher exatamente o que quer.'},
            {t: 'Só se pode copiar a mensagem inteira', why: 'Pode escolher só uma parte: prima sem soltar, toque em Selecionar e arraste as pequenas pegas.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Muito bem!</strong> Copiar e colar funciona quase em todo o lado: mensagens, emails, páginas web e formulários. Prima sem soltar para copiar; prima sem soltar para colar.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Armazenamento'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Armazenamento do iPhone', [{caption: 'RECOMENDAÇÕES'},
                ctx.offloaded ? {label: 'Descarregar apps não usadas', value: 'Ativado ⟦check⟧'} : {id: 'offload', label: 'Descarregar apps não usadas', sub: 'Poupe 2,1 GB. Remove as apps que não usa, mas mantém os respetivos dados.', value: 'Ativar'},
                {caption: 'APPS'}, {label: 'Fotografias', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'Geral', top: bar});
        }
        return list(p, 'Armazenamento', [{label: 'Fotografias &amp; vídeos', value: '21,3 GB'}, {label: 'Apps', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Incluindo o WhatsApp'}, {label: 'Documentos &amp; outros', value: '4,1 GB'},
            {label: 'Sistema', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1,1 GB de ficheiros inúteis limpos</p>' : '<button type="button" class="ce dk" data-tap="free-up">Libertar espaço</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Definições', `<div class="fo">${[['account', 'Conta'], ['privacy', 'Privacidade'], ['chats', 'Conversas'], ['notifications', 'Notificações'], ['storage', 'Armazenamento e dados'], ['help', 'Ajuda']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Armazenamento e dados', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Gerir armazenamento', `<div class="iq"><span>O WhatsApp está a usar ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Maiores que 5 MB</strong><small>Nada para rever</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Reencaminhadas muitas vezes</strong><small>112 itens · 0,9 GB</small></div>
                <div class="he">CONVERSAS</div><div class="ck"><strong>Família</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Maiores que 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Apagar 23 itens?', 'Serão apagados do WhatsApp. As fotografias já guardadas na galeria do telemóvel continuam lá.', [['cancel', 'Cancelar'], ['confirm-delete', 'Apagar']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Está a aparecer "Armazenamento quase cheio"? Vamos descobrir o que está a ocupar o espaço. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toque em Geral.</strong>'},
            {screen: () => list(p, 'Geral', [{id: 'about', label: 'Acerca'}, {id: 'update', label: 'Atualização de software'}, {id: 'storage', label: 'Armazenamento do iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN &amp; Gestão de Dispositivos'}], {back: 'Definições'}),
             target: 'storage', say: '<strong>Toque em Armazenamento do iPhone.</strong> Demora alguns segundos a calcular tudo.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'A barra colorida mostra o que está a ocupar o espaço. Primeiro, uma ajuda rápida: <strong>Descarregar apps não usadas</strong> remove as apps que não usa há algum tempo, mas guarda os dados caso as queira de volta. <strong>Toque em Ativar.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Toque em Armazenamento.</strong> <em>Num Samsung, é Assistência da bateria e do dispositivo e depois Armazenamento.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'A barra colorida mostra o que está a ocupar o espaço. <strong>Toque em Libertar espaço.</strong>'},
            {screen: () => app(p, 'Ficheiros', `<div class="ke"><strong>Apagar ficheiros inúteis</strong><small>1,1 GB de ficheiros temporários de apps</small><button type="button" class="ce dk" data-tap="clean">Limpar</button></div>
                <div class="ke"><strong>Apagar capturas de ecrã antigas</strong><small>214 MB</small><span class="fd">Selecionar e libertar espaço</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Os ficheiros inúteis podem ser apagados em segurança: são ficheiros temporários de que as apps não precisam. <strong>Toque em Limpar.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'O WhatsApp está a usar 14,8 GB. O que o está a encher?', options: [
            {t: 'Vídeos e fotografias que as pessoas lhe enviaram, sobretudo em grupos', ok: true, why: 'Sim. Cada vídeo enviado numa conversa de família ou de grupo fica guardado no telemóvel. O WhatsApp consegue encontrar e apagar os maiores.'},
            {t: 'As suas mensagens de texto', why: 'O texto quase não ocupa espaço. São os vídeos e as fotografias que as pessoas enviam, sobretudo em grupos.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Abra o WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'No WhatsApp, toque em <strong>Definições</strong> em baixo, à direita. Aqui já está aberto. <strong>Toque em Armazenamento e dados.</strong>'
                          : 'No WhatsApp, toque nos <strong>três pontos ⋮</strong> no topo e depois em <strong>Definições</strong>. Aqui já está aberto. <strong>Toque em Armazenamento e dados.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Toque em Gerir armazenamento.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'O que mais espaço poupa está no topo. <strong>Toque em Maiores que 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Estes são vídeos grandes que as pessoas lhe enviaram. Se quiser guardar algum, guarde-o primeiro nas fotografias. <strong>Toque em Selecionar tudo.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Toque em Apagar.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Isto só apaga as cópias dentro do WhatsApp. <strong>Toque em Apagar</strong> para confirmar.', hints: {cancel: 'Cancelar mantém-nos. Neste treino, toque em Apagar.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Muito bem!</strong> Libertou mais de 7 GB. Vale a pena fazê-lo de poucos em poucos meses. Esvazie também <strong>Apagadas Recentemente</strong> nas Fotografias, porque as fotografias apagadas continuam a ocupar espaço durante 30 dias.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Relógio Mundial'], ['alarms', 'Alarmes'], ['stopwatch', 'Cronómetro'], ['timers', 'Temporizadores']]
            : [['alarms', 'Alarme'], ['world', 'Relógio'], ['timers', 'Temporizador'], ['stopwatch', 'Cronómetro']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Hoje</small><strong>Londres</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Austrália</small><strong>Sydney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Comprimidos')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Alarme</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Relógio Mundial' : 'Relógio') : (p === 'ios' ? 'Alarmes' : 'Alarme')}</strong>${add}</div>
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
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Alarme', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Um alarme pode lembrá-lo de tomar os comprimidos todos os dias. <strong>Abra a app Relógio.</strong>', hint: 'É o ícone preto com um mostrador de relógio branco.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Toque em ${p === 'ios' ? 'Alarmes' : 'Alarme'}</strong> no ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Toque em +</strong> para adicionar um alarme novo.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Num telemóvel a sério, desloca os números para acertar a hora. Aqui, <strong>toque em 08:00</strong>.', hints: {'t-07': 'Escolha 08:00 para este treino.', 't-09': 'Escolha 08:00 para este treino.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Precisa disto todos os dias, não só uma vez. <strong>Toque em Repetir.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Todos os dias'; }, say: '<strong>Toque em Todos os dias.</strong>',
         hints: {never: 'Nunca significa que toca só uma vez. Toque em Todos os dias.', weekdays: 'Dias úteis salta o fim de semana. Toque em Todos os dias.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Escreva primeiro uma etiqueta na caixa Etiqueta, como Comprimidos.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Uma etiqueta diz-lhe para que serve o alarme. <strong>Toque na caixa Etiqueta e escreva Comprimidos</strong> e depois <strong>toque em Guardar</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'O alarme toca às 8. Toma os comprimidos. Que botão prime?', options: [
            {t: 'Parar', ok: true, why: 'Sim. Parar desliga-o até amanhã às 8, porque se repete todos os dias.'},
            {t: 'Adiar', why: 'Adiar faz com que toque outra vez dentro de cerca de 9 minutos. Use-o se precisar de mais um bocadinho, mas Parar desliga-o até amanhã.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Muito bem!</strong> O alarme dos comprimidos toca às 8 todas as manhãs. ' + (p === 'ios' ? 'A app <strong>Saúde</strong> também tem uma secção de Medicação que o lembra e guarda um registo.' : 'Também pode pedir ao Google: "Lembra-me de tomar os comprimidos todos os dias às 8".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Se o telemóvel se perdesse ou avariasse, as suas fotografias estariam seguras? Vamos ver. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toque no seu nome</strong> no topo.'},
        {screen: () => list(p, 'Conta Apple', [{id: 'personal', label: 'Informações Pessoais'}, {id: 'security', label: 'Início de sessão &amp; segurança'}, {id: 'payment', label: 'Pagamento &amp; entrega'}, {id: 'subscriptions', label: 'Subscrições'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Partilha em Família'}, {id: 'findmy', label: 'Encontrar'}], {back: 'Definições'}),
         target: 'icloud', say: '<strong>Toque em iCloud.</strong> O iCloud é o armazenamento online da Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ARMAZENAMENTO: 4,2 GB DE 5 GB USADOS'}, {caption: 'GUARDADO NO ICLOUD'}, {id: 'photos', label: 'Fotografias', value: c.photoSync ? 'Ativada' : 'Desativado'}, {id: 'backup', label: 'Cópia de Segurança do iCloud', value: c.backedUp ? 'Ativada' : 'Desativado'},
            {label: 'Contactos', value: 'Ativada'}, {label: 'Notas', value: 'Ativada'}], {back: 'Conta Apple'}),
         target: 'photos', say: 'As Fotografias e a Cópia de Segurança estão ambas <strong>Desativadas</strong>. Isso significa que perder o telemóvel seria perder as fotografias. <strong>Toque em Fotografias.</strong>'},
        {screen: c => list(p, 'Fotografias', [{id: 'sync', label: 'Sincronizar este iPhone', toggle: !!c.photoSync, sub: 'Mantém as suas fotografias e vídeos no iCloud, para ficarem seguros se perder o telemóvel.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Toque em Sincronizar este iPhone</strong> para o ativar.'},
        {screen: c => list(p, 'Fotografias', [{label: 'Sincronizar este iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Toque em ‹ iCloud</strong> para voltar atrás.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ARMAZENAMENTO: 4,2 GB DE 5 GB USADOS'}, {caption: 'GUARDADO NO ICLOUD'}, {id: 'photos', label: 'Fotografias', value: 'Ativada'}, {id: 'backup', label: 'Cópia de Segurança do iCloud', value: 'Desativado'}], {back: 'Conta Apple'}),
         target: 'backup', say: 'Agora faça cópia de segurança de tudo o resto: definições, mensagens e apps. <strong>Toque em Cópia de Segurança do iCloud.</strong>'},
        {screen: c => list(p, 'Cópia de segurança', [{id: 'backup-toggle', label: 'Fazer cópia de segurança deste iPhone', toggle: !!c.backedUp, sub: 'Faz cópia de segurança automaticamente todas as noites, quando o iPhone está a carregar, bloqueado e ligado ao Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Toque em Fazer cópia de segurança deste iPhone</strong> para a ativar.'},
        {screen: () => list('ios', 'Cópia de segurança', [{label: 'Fazer cópia de segurança deste iPhone', toggle: true}, {id: 'backup-now', label: 'Fazer cópia de segurança agora', sub: 'Última cópia de segurança bem-sucedida: Nunca'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'A partir de agora, fará cópia de segurança todas as noites. Faça a primeira agora: <strong>toque em Fazer cópia de segurança agora</strong>.'},
        {screen: c => list('ios', 'Cópia de segurança', [{label: 'Fazer cópia de segurança deste iPhone', toggle: true}, {label: c.busy ? 'A fazer cópia de segurança…' : 'Fazer cópia de segurança agora', sub: c.busy ? 'Faltam cerca de 5 minutos' : 'Última cópia de segurança bem-sucedida: Agora mesmo ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Uma mensagem diz "O seu armazenamento do iCloud está cheio. As suas fotografias serão apagadas hoje. Pague 99 p aqui: [link]". O que faz?', options: [
            {t: 'Ignoro a ligação. Verifico em Definições > o seu nome > iCloud e depois reencaminho a mensagem para o 7726', ok: true, why: 'Sim. Esta é uma burla comum. A Apple não envia ligações por mensagem e nunca apaga as suas fotografias assim. Verifique o seu armazenamento verdadeiro nas Definições.'},
            {t: 'Pago depressa para salvar as fotografias', why: 'É uma burla para obter os dados do seu cartão. Verifique o seu armazenamento verdadeiro em Definições > o seu nome > iCloud e reencaminhe a mensagem para o 7726.'}]}},
        {screen: () => list('ios', 'Cópia de segurança', [{label: 'Fazer cópia de segurança deste iPhone', toggle: true}, {label: 'Fazer cópia de segurança agora', sub: 'Última cópia de segurança bem-sucedida: Agora mesmo ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Muito bem!</strong> As suas fotografias e o telemóvel têm cópia de segurança. Os 5 GB gratuitos enchem depressa com fotografias; se isso acontecer, mais espaço (iCloud+) custa uma pequena mensalidade, e só se compra nas Definições, nunca a partir de uma mensagem.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Se o telemóvel se perdesse ou avariasse, as suas fotografias estariam seguras? Vamos ver. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toque em Google.</strong> Fica perto do fim.', hint: 'Desça na lista: o Google fica perto do fim.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gerir a sua Conta Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Cópia de segurança', sub: 'Desativado'}, {id: 'autofill', label: 'Preenchimento automático'}, {id: 'devices', label: 'Dispositivos &amp; partilha'}]),
         target: 'backup', say: 'A Cópia de segurança diz <strong>Desativada</strong>. <strong>Toque em Cópia de segurança.</strong> <em>Num Samsung, é Definições > Contas e cópia de segurança.</em>'},
        {screen: c => list(p, 'Cópia de segurança', [{id: 'backup-toggle', label: 'Cópia de segurança do Google One', toggle: !!c.backedUp, sub: 'Faz cópia de segurança das apps, mensagens, histórico de chamadas, contactos e definições.'},
            {id: 'photos-backup', label: 'Fotografias &amp; vídeos', sub: c.photoSync ? 'Ativada · Google Fotos' : 'Desativada · Google Fotos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Toque em Cópia de segurança do Google One</strong> para a ativar.'},
        {screen: c => list(p, 'Cópia de segurança', [{label: 'Cópia de segurança do Google One', toggle: true}, {id: 'photos-backup', label: 'Fotografias &amp; vídeos', sub: 'Desativada · Google Fotos'}]),
         target: 'photos-backup', say: 'As fotografias são à parte. <strong>Toque em Fotografias &amp; vídeos.</strong>'},
        {screen: c => list(p, 'Cópia de segurança', [{id: 'photos-toggle', label: 'Fazer cópia de segurança de fotografias e vídeos', toggle: !!c.photoSync, sub: 'Guarda-os no Google Fotos, para ficarem seguros se perder o telemóvel.'},
            {label: 'Qualidade da cópia de segurança', value: 'Poupança de armazenamento'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Toque em Fazer cópia de segurança de fotografias e vídeos</strong> para a ativar.'},
        {screen: () => list(p, 'Cópia de segurança', [{label: 'Fazer cópia de segurança de fotografias e vídeos', toggle: true}, {id: 'backup-now', label: 'Fazer cópia de segurança agora', sub: 'Última cópia de segurança: Nunca'}]),
         target: 'backup-now', say: 'A partir de agora faz cópia de segurança sozinha, com Wi-Fi. Faça a primeira agora: <strong>toque em Fazer cópia de segurança agora</strong>.'},
        {screen: c => list(p, 'Cópia de segurança', [{label: 'Fazer cópia de segurança de fotografias e vídeos', toggle: true}, {label: c.busy ? 'A fazer cópia de segurança…' : 'Fazer cópia de segurança agora', sub: c.busy ? '1,204 items left' : 'Última cópia de segurança: Agora mesmo ⟦check⟧'}]), wait: 1500,
         question: {q: 'Uma mensagem diz "O seu armazenamento do Google está cheio. As suas fotografias serão apagadas hoje. Pague 99 p aqui: [link]". O que faz?', options: [
            {t: 'Ignoro a ligação. Verifico em Definições > Google > Cópia de segurança e depois reencaminho a mensagem para o 7726', ok: true, why: 'Sim. Esta é uma burla comum. O Google não envia ligações destas por mensagem. Verifique o seu armazenamento verdadeiro nas Definições.'},
            {t: 'Pago depressa para salvar as fotografias', why: 'É uma burla para obter os dados do seu cartão. Verifique o seu armazenamento verdadeiro nas Definições e reencaminhe a mensagem para o 7726.'}]}},
        {screen: () => list(p, 'Cópia de segurança', [{label: 'Fazer cópia de segurança de fotografias e vídeos', toggle: true}, {label: 'Fazer cópia de segurança agora', sub: 'Última cópia de segurança: Agora mesmo ⟦check⟧'}]), done: true,
         say: '<strong>Muito bem!</strong> As suas fotografias e o telemóvel têm cópia de segurança. O Google dá-lhe 15 GB gratuitos; se encherem, mais espaço custa uma pequena mensalidade, e só se compra nas Definições ou na app Google One, nunca a partir de uma mensagem.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 PARABÉNS! 🎉</strong><p>Foi selecionado para ganhar um vale de compras de 500 £!</p>
        <button type="button" class="aeb" data-tap="claim">RECLAMAR AGORA</button><small>Anúncio</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Informações da app', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>Serviço do Sistema</strong><small>Versão 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Abrir</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Desinstalar</button>
            <button type="button" data-tap="force-stop">Forçar paragem</button></div>
            <div class="cj ex"><span class="hf"><strong>Bateria</strong><small>38% de utilização desde a última carga completa</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Autorizações</strong><small>Sobrepor a outras apps, Administrador do dispositivo</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'Serviço do Sistema', 'Quer desinstalar esta app?', [['cancel', 'Cancelar'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>CALENDÁRIO · agora</strong>
            <span>⚠️ O seu iPhone pode estar infetado! Toque aqui para o limpar agora.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Estão a aparecer anúncios no ecrã inicial, mesmo sem nenhuma app aberta. Isso costuma significar que uma app maliciosa se infiltrou. Primeiro, <strong>não toque no anúncio. Toque no pequeno ⟦x⟧ para o fechar.</strong>',
         hints: {claim: 'Nunca toque no próprio anúncio. Procure o pequeno ⟦x⟧ no canto.'}, hint: 'O ⟦x⟧ é pequeno e fica no canto superior direito do anúncio.'},
        {screen: () => home(p), target: 'settings', say: 'As apps maliciosas funcionam o tempo todo, por isso gastam muita bateria. É assim que as encontra. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Toque em Bateria.</strong> <em>Num Samsung, é Assistência da bateria e do dispositivo e depois Bateria.</em>'},
        {screen: () => list(p, 'Bateria', [{id: 'usage', label: 'Utilização da bateria', sub: 'Ver utilização desde a última carga completa'}, {label: 'Poupança de bateria', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Toque em Utilização da bateria.</strong> <em>Nalguns Samsung, toque no gráfico ou em Ver detalhes.</em>'},
        {screen: () => list(p, 'Utilização da bateria', [], {top: `<div class="nl">${[['Serviço do Sistema', 38], ['Ecrã', 21], ['WhatsApp', 12], ['YouTube', 8], ['Câmara', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Qual destas parece estranha?', options: [
            {t: 'Serviço do Sistema: nunca a usou e é a que gasta mais bateria', ok: true, why: 'Sim. As apps maliciosas dão-se nomes sem graça como "Serviço do Sistema" ou "Definições do Teclado" para não dar por elas. Tome nota do nome.'},
            {t: 'Ecrã', why: 'O ecrã gasta sempre muita bateria; é normal. A estranha é o "Serviço do Sistema", que nunca usou.'},
            {t: 'WhatsApp', why: 'O WhatsApp é uma app que usa, por isso é normal. A estranha é o "Serviço do Sistema".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Agora vamos encontrá-la nas suas apps. De volta às Definições, <strong>toque em Apps</strong>.'},
        {screen: () => list(p, 'Apps', [{caption: 'Apps abertas recentemente'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Ver todas as 46 apps'}, {id: 'default-apps', label: 'Apps predefinidas'}]),
         target: 'all-apps', say: '<strong>Toque em Ver todas as apps.</strong>'},
        {screen: () => list(p, 'Todas as apps', ['Calculadora', 'Calendário', 'Câmara', 'Chrome', 'Relógio', 'Contactos', 'Gmail', 'Mapas'].map(n => ({label: n})).concat([{id: 'system-service', label: 'Serviço do Sistema'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'A lista está por ordem alfabética. <strong>Toque em Serviço do Sistema.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'O botão <strong>Desinstalar</strong> está a cinzento. As apps maliciosas fazem isto para o impedir de as remover. Primeiro, <strong>toque em Forçar paragem</strong> para a parar.',
         hints: {uninstall: 'Está a cinzento, por isso ainda não funciona. Toque primeiro em Forçar paragem.', open: 'Não a abra. Toque em Forçar paragem.'}},
        {screen: () => list(p, 'Pesquisar definições', [{caption: 'Resultados para "administração do dispositivo"'}, {id: 'device-admin', label: 'Apps de administração do dispositivo', sub: 'Segurança &amp; privacidade > Outras definições de segurança'}]),
         target: 'device-admin',
         say: 'Agora retire-lhe a autorização especial. Nas Definições, <strong>pesquise "administração do dispositivo"</strong> na barra de pesquisa no topo. Aqui está o resultado: <strong>toque em Apps de administração do dispositivo</strong>.'},
        {screen: c => list(p, 'Apps de administração do dispositivo', [{label: 'Localizar o meu dispositivo', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'Serviço do Sistema', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Desativar esta app de administração do dispositivo?', 'O Serviço do Sistema deixará de poder impedi-lo de o desinstalar.', [['cancel', 'Cancelar'], ['deactivate', 'Desativar']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'O Localizar o meu dispositivo é da Google e está bem. <strong>Toque no interruptor junto a Serviço do Sistema.</strong>', hints: {'find-my': 'Deixe o Localizar o meu dispositivo ativado. Toque em Serviço do Sistema.'}},
        {screen: c => list(p, 'Apps de administração do dispositivo', [{label: 'Localizar o meu dispositivo', toggle: true, sub: 'Google'}, {label: 'Serviço do Sistema', toggle: true}],
            {overlay: dialog(p, 'Desativar esta app de administração do dispositivo?', 'O Serviço do Sistema deixará de poder impedi-lo de o desinstalar.', [['cancel', 'Cancelar'], ['deactivate', 'Desativar']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Toque em Desativar.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'De volta ao Serviço do Sistema, o botão <strong>Desinstalar</strong> já funciona. <strong>Toque em Desinstalar.</strong>', hints: {'force-stop': 'Já está parada. Toque em Desinstalar.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Toque em OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Desapareceu! Por fim, peça à Google que procure mais alguma coisa. <strong>Abra a Play Store.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Não foram encontradas apps nocivas' : 'Analisar o telemóvel'}</strong>
            <small>${c.scanned ? 'Verificado agora mesmo' : 'Última análise: há 3 semanas'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'Na Play Store, toque na sua <strong>fotografia de perfil</strong> (em cima, à direita) e depois em <strong>Play Protect</strong>. Aqui já está aberto. <strong>Toque em Analisar.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Não foram encontradas apps nocivas</strong><small>Verificado agora mesmo</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Muito bem!</strong> Encontrou a app maliciosa pelo gasto de bateria, retirou-lhe a autorização especial, desinstalou-a e verificou o telemóvel. Para as evitar: instale apps só da Play Store e desconfie de apps gratuitas de lanterna, de "limpeza" e de "aceleração".'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Uma notificação do Calendário diz "O seu iPhone pode estar infetado! Toque aqui para o limpar agora." O que é?', options: [
            {t: 'Spam que se infiltrou no seu calendário. Não toque nele', ok: true, why: 'Sim. Tocar em "Permitir" num site duvidoso pode adicionar um calendário de spam ao iPhone. Os "eventos" dele são anúncios que parecem avisos. O iPhone está bem.'},
            {t: 'Um aviso verdadeiro da Apple', why: 'A Apple não envia avisos de vírus através do Calendário. É spam de um calendário subscrito. Não toque nele.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Vamos remover o calendário de spam. <strong>Toque em Definições</strong>, não na notificação.', hints: {notif: 'Não toque no aviso. Toque em Definições.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Desça e <strong>toque em Apps</strong>.', hint: 'As Apps estão no último grupo.'},
        {screen: () => list(p, 'Apps', ['App Store', 'Livros'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Calendário'}, {label: 'Câmara'}, {label: 'Contactos'}, {label: 'Correio'}]), {back: 'Definições'}),
         target: 'calendar', say: '<strong>Toque em Calendário.</strong>'},
        {screen: () => list(p, 'Calendário', [{id: 'accounts', label: 'Contas do Calendário', value: '2'}, {label: 'Substituição do Fuso Horário', value: 'Desativado'}, {label: 'Horas de Alerta Predefinidas'}], {back: 'Apps'}),
         target: 'accounts', say: '<strong>Toque em Contas do Calendário.</strong>'},
        {screen: () => list(p, 'Contas do Calendário', [{caption: 'CONTAS'}, {label: 'iCloud', sub: 'Calendários, Contactos e mais 7'}, {id: 'subscribed', label: 'Calendários Subscritos', value: '1'}], {back: 'Calendário'}),
         target: 'subscribed', say: 'O iCloud é o seu próprio. <strong>Toque em Calendários Subscritos.</strong>'},
        {screen: () => list(p, 'Calendários Subscritos', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Subscrito'}], {back: 'Contas do Calendário'}),
         target: 'spam-cal', say: 'Aí está: um calendário que nunca quis adicionar. <strong>Toque em Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Servidor', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Apagar Conta', danger: true}],
            {back: 'Voltar', overlay: c.askDelete ? dialog(p, 'Tem a certeza?', 'Isto vai apagar o calendário e os respetivos eventos do iPhone.', [['cancel', 'Cancelar'], ['confirm-delete', 'Apagar Conta']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Toque em Apagar Conta.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Servidor', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Apagar Conta', danger: true}],
            {back: 'Voltar', overlay: dialog(p, 'Tem a certeza?', 'Isto vai apagar o calendário e os respetivos eventos do iPhone.', [['cancel', 'Cancelar'], ['confirm-delete', 'Apagar Conta']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Toque em Apagar Conta</strong> para confirmar.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Desapareceu. Mais uma verificação: os sites duvidosos também podem instalar um "perfil". <strong>Toque em Geral.</strong>'},
        {screen: () => list(p, 'Geral', [{id: 'about', label: 'Acerca'}, {id: 'update', label: 'Atualização de software'}, {id: 'storage', label: 'Armazenamento do iPhone'}, {id: 'vpn', label: 'VPN &amp; Gestão de Dispositivos'}], {back: 'Definições'}),
         target: 'vpn', say: '<strong>Toque em VPN &amp; Gestão de Dispositivos.</strong>'},
        {screen: c => list(p, 'VPN &amp; Gestão de Dispositivos', c.profileGone ? [{label: 'VPN', value: 'Não Ligado'}] : [{label: 'VPN', value: 'Não Ligado'}, {caption: 'PERFIL DE CONFIGURAÇÃO'}, {id: 'profile', label: 'Acelerador de Telemóvel Grátis', sub: 'Não verificado'}], {back: 'Geral'}),
         target: 'profile', say: 'Se vir aqui um perfil que não reconhece (um do seu trabalho ou escola não faz mal), remova-o. <strong>Toque em Acelerador de Telemóvel Grátis.</strong>'},
        {screen: c => list(p, 'Perfil', [{label: 'Acelerador de Telemóvel Grátis', sub: 'Não verificado · Contém: Atalhos Web, Certificados'}, {caption: ' '}, {id: 'remove-profile', label: 'Remover Perfil', danger: true}],
            {back: 'Voltar', overlay: c.askRemove ? dialog(p, 'Remover Perfil', 'Remover este perfil vai apagar todas as respetivas definições.', [['cancel', 'Cancelar'], ['confirm-remove', 'Remover']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Toque em Remover Perfil</strong>. O iPhone vai pedir o seu código.'},
        {screen: c => list(p, 'Perfil', [{label: 'Acelerador de Telemóvel Grátis', sub: 'Não verificado'}, {caption: ' '}, {label: 'Remover Perfil', danger: true}],
            {back: 'Voltar', overlay: dialog(p, 'Remover Perfil', 'Remover este perfil vai apagar todas as respetivas definições.', [['cancel', 'Cancelar'], ['confirm-remove', 'Remover']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Toque em Remover.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Muito bem!</strong> Os falsos avisos desapareceram. Para que não volte a acontecer: nos sites, toque em <strong>Não permitir</strong> ou <strong>Fechar</strong> em qualquer janela que peça para adicionar um calendário ou perfil, e instale apps só da App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Cancelada · Termina a 22 de outubro'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '4,99 £ por semana · Renova a 22 de outubro'};
        return list(p, 'Subscrições', [{caption: p === 'ios' ? 'ATIVAS' : 'Ativa'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '0,99 £ por mês' : '1,59 £ por mês'},
            {caption: p === 'ios' ? 'INATIVAS' : 'Expirada'}, {label: 'Crossword Daily', sub: 'Expirou a 3 de março'}], {back: p === 'ios' ? 'Conta Apple' : 'Voltar'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'A SUA SUBSCRIÇÃO' : 'Plano'}, {label: 'Semanal', sub: '4,99 £ por semana. Começou como um período experimental gratuito de 3 dias.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Cancelar subscrição' : 'Cancelar subscrição', danger: true}],
            {back: 'Subscrições', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Confirmar cancelamento' : 'Cancelar subscrição?', 'Pode continuar a usá-la até 22 de outubro. Não lhe será cobrado mais nada.', [['keep', p === 'ios' ? 'Agora não' : 'Manter']].concat([['confirm-cancel', p === 'ios' ? 'Confirmar' : 'Cancelar subscrição']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Os períodos experimentais gratuitos muitas vezes passam a planos pagos sem dar por isso. Vamos verificar. <strong>Toque em Definições.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toque no seu nome</strong> no topo.'},
            {screen: () => list(p, 'Conta Apple', [{id: 'personal', label: 'Informações Pessoais'}, {id: 'security', label: 'Início de sessão &amp; segurança'}, {id: 'payment', label: 'Pagamento &amp; entrega'}, {id: 'subscriptions', label: 'Subscrições'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Definições'}),
             target: 'subscriptions', say: '<strong>Toque em Subscrições.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Os períodos experimentais gratuitos muitas vezes passam a planos pagos sem dar por isso. Vamos verificar. <strong>Abra a Play Store.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>SUGERIDO PARA SI</span><strong>Apps para começar</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Toque na sua fotografia de perfil</strong>, a letra redonda em cima, à direita.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Toque em Pagamentos &amp; subscrições.</strong>'},
            {screen: () => list(p, 'Pagamentos &amp; subscrições', [{id: 'methods', label: 'Métodos de pagamento'}, {id: 'subscriptions', label: 'Subscrições', sub: 'Gerir as suas subscrições'}, {id: 'budget', label: 'Orçamento &amp; histórico'}]),
             target: 'subscriptions', say: '<strong>Toque em Subscrições.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: 'O "Photo Editor Pro" começou como um período experimental gratuito e agora custa <strong>4,99 £ todas as semanas</strong>. Isso é mais de 250 £ por ano! <strong>Toque nele.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Cancelar subscrição' : 'Cancelar subscrição'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Confirmar' : 'Cancelar subscrição'}.</strong>`, hints: {keep: 'Essa continua a pagar. Toque em ' + (p === 'ios' ? 'Confirmar' : 'Cancelar subscrição') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Apagar a app Photo Editor do telemóvel. Isso pára os pagamentos?', options: [
            {t: 'Não. Tem de cancelar a subscrição, como acabou de fazer', ok: true, why: 'Exatamente. Apagar a app NÃO cancela a subscrição. Continua a pagar até a cancelar aqui.'},
            {t: 'Sim, apagar a app pára os pagamentos', why: 'Não pára! Continua a pagar até cancelar a própria subscrição, aqui.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Muito bem!</strong> Poupou 4,99 £ por semana. Dica: quando começar um período experimental gratuito, defina um alarme para o dia anterior ao fim. Veja também de vez em quando, na app do banco, a lista de pagamentos regulares.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Os iPhones mais recentes têm o <strong>Apple Intelligence</strong>: IA que escreve, resume e edita por si. Pode desativá-lo. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Toque em Apple Intelligence &amp; Siri.</strong>', hint: 'Está no terceiro grupo, por baixo de Acessibilidade.'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Ferramentas de Escrita, resumos de notificações, Image Playground e mais.'},
            {caption: 'EXTENSÕES'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Desativado' : 'Ativada'}, {caption: 'SIRI'}, {label: 'Falar com a Siri', value: '"Siri" ou "Ei Siri"'}],
            {back: 'Definições', overlay: c.askOff ? dialog(p, 'Desativar o Apple Intelligence?', 'Funcionalidades como as Ferramentas de Escrita e os resumos deixarão de estar disponíveis.', [['cancel', 'Cancelar'], ['confirm-off', 'Desativar']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Toque no interruptor do Apple Intelligence</strong> para o desativar.', hints: {chatgpt: 'Trataremos do ChatGPT a seguir. Primeiro, toque no interruptor do Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'EXTENSÕES'}, {label: 'ChatGPT', value: 'Ativada'}],
            {back: 'Definições', overlay: dialog(p, 'Desativar o Apple Intelligence?', 'Funcionalidades como as Ferramentas de Escrita e os resumos deixarão de estar disponíveis.', [['cancel', 'Cancelar'], ['confirm-off', 'Desativar']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Toque em Desativar.</strong>'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'EXTENSÕES'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Ativada'}], {back: 'Definições'}),
         target: 'chatgpt', say: 'A extensão do ChatGPT pode enviar as suas perguntas ao ChatGPT, uma empresa de fora da Apple. <strong>Toque em ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Usar o ChatGPT', toggle: !c.gptOff, sub: 'A Siri pode enviar pedidos ao ChatGPT.'}], {back: 'Voltar'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Toque em Usar o ChatGPT</strong> para o desativar.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Usar o ChatGPT', toggle: false}], {back: 'Voltar'}),
         question: {q: 'O WhatsApp, o Facebook e outras apps também têm conversas com IA. Qual é a regra segura?', options: [
            {t: 'Nunca escrever dados pessoais (banco, saúde, palavras-passe, moradas) em nenhuma conversa com IA', ok: true, why: 'Sim. O que escreve pode ser guardado e usado para treinar a IA. Trate-o como uma conversa com um desconhecido.'},
            {t: 'As conversas com IA são privadas, por isso tudo é aceitável', why: 'Não são privadas como uma chamada telefónica. O que escreve pode ser guardado. Mantenha os dados pessoais fora delas.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Usar o ChatGPT', toggle: false}], {back: 'Voltar'}), done: true,
         say: '<strong>Muito bem!</strong> O Apple Intelligence e o ChatGPT estão desativados. Pode voltar a ativá-los quando quiser, no mesmo sítio. A Siri continua a funcionar normalmente.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Os telemóveis Android já vêm com o <strong>Gemini</strong>, a IA da Google. Manter premido o botão de ligar pode abri-lo sem querer. Vamos mudar isso. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Toque em Apps.</strong>'},
        {screen: () => list(p, 'Apps', [{caption: 'Apps abertas recentemente'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Ver todas as 45 apps'}, {id: 'default-apps', label: 'Apps predefinidas', sub: 'Apps de assistente, navegador e telefone'}]),
         target: 'default-apps', say: '<strong>Toque em Apps predefinidas.</strong>'},
        {screen: () => list(p, 'Apps predefinidas', [{label: 'App de navegador', sub: 'Chrome'}, {id: 'assistant', label: 'App de assistente digital', sub: 'Gemini'}, {label: 'App Telefone', sub: 'Telefone'}, {label: 'App de SMS', sub: 'Mensagens'}]),
         target: 'assistant', say: '<strong>Toque em App de assistente digital.</strong>'},
        {screen: c => list(p, 'App de assistente digital', [{id: 'assistant-app', label: 'App de assistente digital predefinida', sub: c.noAssist ? 'Nenhum' : 'Gemini'}, {label: 'Usar texto do ecrã', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>App de assistente digital predefinida</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nenhuma</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Toque em App de assistente digital predefinida.</strong>'},
        {screen: c => list(p, 'App de assistente digital', [{label: 'App de assistente digital predefinida', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>App de assistente digital predefinida</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Nenhuma</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Toque em Nenhuma.</strong> O Gemini deixa de aparecer quando mantém premido o botão de ligar.', hints: {'assist-gemini': 'Isso mantém o Gemini. Toque em Nenhuma.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'A seguir, impeça o Gemini de guardar o que lhe escreve. <strong>Abra a app Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Olá, Margaret<br><small>Como posso ajudar hoje?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Toque na sua fotografia de perfil</strong> em cima, à direita.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Toque em Atividade das apps Gemini.</strong> <em>Em alguns telemóveis chama-se Manter atividade.</em>'},
        {screen: c => app(p, 'Atividade das apps Gemini', `<p class="cf"><strong>${c.actOff ? 'Desativado' : 'Ativada'}</strong><br>${c.actOff ? 'As suas conversas já não são guardadas na sua conta nem usadas para melhorar a IA da Google.' : 'As suas conversas são guardadas na sua Conta Google e podem ser revistas para melhorar a IA da Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Desativar</button><button type="button" class="cj" data-tap="off-delete">Desativar e apagar atividade</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Toque em Desativar.</strong>'},
        {screen: c => app(p, 'Atividade das apps Gemini', '<p class="cf"><strong>Ativada</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Desativar</button><button type="button" class="cj" data-tap="off-delete">Desativar e apagar atividade</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Toque em Desativar e apagar atividade</strong>, para limpar também o que já guardou.', hints: {'off-only': 'Isso pára de guardar conversas novas, mas mantém as antigas. Toque em Desativar e apagar atividade.'}},
        {screen: c => app(p, 'Atividade das apps Gemini', '<p class="cf"><strong>Desativada</strong></p>', {color: '#fff'}),
         question: {q: 'O WhatsApp, o Facebook e outras apps também têm conversas com IA. Qual é a regra segura?', options: [
            {t: 'Nunca escrever dados pessoais (banco, saúde, palavras-passe, moradas) em nenhuma conversa com IA', ok: true, why: 'Sim. O que escreve pode ser guardado e usado para treinar a IA. Trate-o como uma conversa com um desconhecido.'},
            {t: 'As conversas com IA são privadas, por isso tudo é aceitável', why: 'Não são privadas como uma chamada telefónica. O que escreve pode ser guardado. Mantenha os dados pessoais fora delas.'}]}},
        {screen: c => app(p, 'Atividade das apps Gemini', '<p class="cf"><strong>Desativada</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Muito bem!</strong> O Gemini deixou de aparecer com o botão de ligar e não guarda as suas conversas. Num Samsung, veja também <strong>Definições > Galaxy AI</strong>, onde cada funcionalidade tem o seu próprio interruptor.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'A sua Conta Apple guarda as suas fotografias, contactos e pagamentos. Vamos verificar se está protegida. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Toque no seu nome</strong> no topo.'},
        {screen: () => list(p, 'Conta Apple', [{id: 'personal', label: 'Informações Pessoais'}, {id: 'security', label: 'Início de sessão &amp; segurança'}, {id: 'payment', label: 'Pagamento &amp; entrega'}, {id: 'subscriptions', label: 'Subscrições'}], {back: 'Definições'}),
         target: 'security', say: '<strong>Toque em Início de sessão &amp; segurança.</strong>'},
        {screen: () => list(p, 'Início de sessão &amp; segurança', [{label: 'Email &amp; números de telefone', sub: '+44 7700 900123'}, {label: 'Alterar palavra-passe'}, {caption: ' '}, {label: 'Autenticação de dois fatores', value: 'Ativada'},
            {id: 'recovery', label: 'Recuperação de conta'}], {back: 'Conta Apple'}),
         target: 'recovery', say: 'A <strong>Autenticação de dois fatores</strong> diz Ativada: ótimo. Significa que um dispositivo novo precisa de um código do seu telemóvel antes de iniciar sessão. Agora, <strong>toque em Recuperação de conta</strong>.'},
        {screen: c => list(p, 'Recuperação de conta', [{caption: 'CONTACTO DE RECUPERAÇÃO'}, c.recovery ? {label: 'Sarah', sub: 'A aguardar que a Sarah aceite'} : {id: 'add-contact', label: 'Adicionar contacto de recuperação…', sub: 'Alguém de confiança que o pode ajudar a recuperar o acesso à sua conta.'}],
            {back: 'Voltar', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Escolha um contacto de recuperação</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (Filha)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Se alguma vez se esquecer da palavra-passe, um <strong>contacto de recuperação</strong> pode obter-lhe um código que o ajuda a voltar a entrar. Não consegue ver os seus dados. <strong>Toque em Adicionar contacto de recuperação.</strong>'},
        {screen: c => list(p, 'Recuperação de conta', [{caption: 'CONTACTO DE RECUPERAÇÃO'}, {label: 'Adicionar contacto de recuperação…'}],
            {back: 'Voltar', overlay: `<div class="ei"><div class="cv"><p><strong>Escolha um contacto de recuperação</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (Filha)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Escolha alguém de confiança que tenha um iPhone. <strong>Toque em Sarah.</strong>', hints: {'pick-dave': 'Neste treino, escolha a Sarah.'}},
        {screen: c => list(p, 'Recuperação de conta', [{caption: 'CONTACTO DE RECUPERAÇÃO'}, {label: 'Sarah', sub: 'A aguardar que a Sarah aceite'}], {back: 'Voltar'}),
         question: {q: 'Alguém liga a dizer que é da Apple. Pede-lhe que leia o código de 6 dígitos que acabou de aparecer no telemóvel. O que faz?', options: [
            {t: 'Desligo. Nunca dou esse código a ninguém', ok: true, why: 'Exatamente. Esse código deixa alguém entrar na sua conta. A Apple nunca ligará a pedi-lo.'},
            {t: 'Leio-o, são da Apple', why: 'A Apple nunca pede esse código. Quem o tiver pode entrar na sua conta. Desligue.'}]}},
        {screen: c => list(p, 'Recuperação de conta', [{caption: 'CONTACTO DE RECUPERAÇÃO'}, {label: 'Sarah', sub: 'A aguardar que a Sarah aceite'}], {back: 'Voltar'}), done: true,
         say: '<strong>Muito bem!</strong> A autenticação de dois fatores está ativada e a Sarah pode ajudá-lo a voltar a entrar. O iPhone também pode memorizar palavras-passe por si, na app <strong>Palavras-passe</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'A sua Conta Google guarda os seus emails, fotografias e contactos. Vamos acrescentar-lhe um segundo cadeado. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toque em Google.</strong>', hint: 'O Google fica perto do fim da lista.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gerir a sua Conta Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Cópia de segurança'}, {id: 'autofill', label: 'Preenchimento automático'}]),
         target: 'manage', say: '<strong>Toque em Gerir a sua Conta Google.</strong>'},
        {screen: () => app(p, 'Conta Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Toque em Segurança</strong> ao longo do topo.'},
        {screen: c => list(p, 'Segurança', [{caption: 'Como inicia sessão no Google'}, {id: '2sv', label: 'Verificação em 2 passos', sub: c.twoOn ? 'Ativada' : 'Desativado'}, {label: 'Palavra-passe', sub: 'Alterada pela última vez há 2 anos'}, {label: 'Telefone de recuperação', sub: '07700 900123'}]),
         target: '2sv', say: 'A <strong>Verificação em 2 passos</strong> está Desativada. Significa que iniciar sessão num dispositivo novo também exige um código enviado para o telemóvel, por isso uma palavra-passe roubada não chega. <strong>Toque nela.</strong>'},
        {screen: () => list(p, 'Verificação em 2 passos', [], {top: '<p class="cf">O seu número de telefone: <strong>07700 900123</strong><br>Vamos enviar um código por mensagem para este número, para confirmar que é seu.</p><button type="button" class="ce dk" data-tap="send-code">Enviar código</button>'}),
         target: 'send-code', say: '<strong>Toque em Enviar código.</strong>'},
        {screen: c => list(p, 'Verificação em 2 passos', [], {top: `<div class="sd"><strong>MENSAGENS · agora</strong><span>G-382605 é o seu código de verificação do Google.</span></div>
            <p class="cf">Introduza o código que enviámos por mensagem para 07700 900123</p>${field('gcode', 'Introduza o código', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Seguinte</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Escreva os 6 números da mensagem: 382605.',
         say: 'Chega uma mensagem com um código. <strong>Escreva 382605 na caixa</strong> e <strong>toque em Seguinte</strong>. <em>(Um código de treino. Nunca escreva um verdadeiro em lado nenhum, a não ser onde o pediu.)</em>'},
        {screen: () => list(p, 'Verificação em 2 passos', [], {top: '<p class="cf">O seu número de telefone foi verificado ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Ativar a verificação em 2 passos</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Toque em Ativar a verificação em 2 passos.</strong>'},
        {screen: c => list(p, 'Segurança', [{caption: 'Como inicia sessão no Google'}, {label: 'Verificação em 2 passos', sub: 'Ativada ⟦check⟧'}, {label: 'Telefone de recuperação', sub: '07700 900123'}]),
         question: {q: 'Alguém liga a dizer que é do Google. Pede-lhe que leia o código que acabou de lhe ser enviado por mensagem. O que faz?', options: [
            {t: 'Desligo. Nunca dou esse código a ninguém', ok: true, why: 'Exatamente. Esse código deixa alguém entrar na sua conta. O Google nunca ligará a pedi-lo.'},
            {t: 'Leio-o, são do Google', why: 'O Google nunca pede esse código. Quem o tiver pode entrar na sua conta. Desligue.'}]}},
        {screen: c => list(p, 'Segurança', [{caption: 'Como inicia sessão no Google'}, {label: 'Verificação em 2 passos', sub: 'Ativada ⟦check⟧'}]), done: true,
         say: '<strong>Muito bem!</strong> A sua Conta Google precisa agora do telemóvel e da palavra-passe. O Google também pode memorizar as suas palavras-passe: procure o <strong>Gestor de Palavras-passe do Google</strong> nas Definições.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Passeio lindo pela marginal esta manhã! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Próximo passeio: sábado, 10:00, a partir do porto.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Sem novos pedidos de amizade.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Ver o seu perfil</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Definições &amp; privacidade</strong></button><div class="ck"><strong>Ajuda &amp; suporte</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Vamos garantir que só os seus amigos veem o que publica. <strong>Abra o Facebook.</strong> <em>(Uma versão de treino. Não é a aplicação verdadeira.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Toque em Menu</strong> em baixo, à direita.', hints: {'tab-friends': 'Vamos ver os pedidos de amizade daqui a pouco. Primeiro, toque em Menu.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Toque em Definições &amp; privacidade</strong>.'},
        {screen: c => list(p, 'Definições', [{caption: 'Audiência e visibilidade'}, {id: 'posts', label: 'Publicações', sub: 'Quem pode ver as suas publicações futuras: ' + (c.audience || 'Público')}, {label: 'Detalhes do perfil'}, {label: 'Como as pessoas o encontram e contactam'},
            {caption: 'A sua atividade'}, {label: 'Registo de atividade'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Quem pode ver as suas publicações futuras?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Público<small>Qualquer pessoa, dentro ou fora do Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Amigos<small>Os seus amigos no Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Só eu</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'As suas publicações estão definidas como <strong>Públicas</strong>: qualquer pessoa no mundo as pode ver. <strong>Toque em Publicações.</strong>'},
        {screen: c => list(p, 'Definições', [{caption: 'Audiência e visibilidade'}, {label: 'Publicações', sub: 'Quem pode ver as suas publicações futuras: Público'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Quem pode ver as suas publicações futuras?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Público<small>Qualquer pessoa, dentro ou fora do Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Amigos<small>Os seus amigos no Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Só eu</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Amigos'; }, say: '<strong>Toque em Amigos.</strong>',
         hints: {'aud-public': 'Público é o que estava. Toque em Amigos.', 'aud-me': 'Só eu significa que ninguém mais vê as suas publicações. Toque em Amigos.'}},
        {screen: c => list(p, 'Definições', [{caption: 'Audiência e visibilidade'}, {label: 'Publicações', sub: 'Quem pode ver as suas publicações futuras: Amigos ⟦check⟧'}, {id: 'back-feed', label: '‹ Voltar ao Facebook'}]),
         target: 'back-feed', say: 'Feito. Agora <strong>toque em Voltar ao Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Tem um pedido de amizade. <strong>Toque em Amigos.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Um pedido de amizade de "Jean Smith". Mas já é amigo da Jean (ela aparece no seu feed). O que se passa?', options: [
            {t: 'Provavelmente é uma cópia do perfil da Jean, feita por um burlão', ok: true, why: 'Sim. Os burlões copiam o nome e a fotografia de alguém e depois enviam mensagens aos amigos a pedir dinheiro. A Jean verdadeira já é sua amiga.'},
            {t: 'A Jean deve ter uma segunda conta', why: 'É possível, mas é muito mais provável que seja uma cópia feita por um burlão: foi criada há 2 dias. Confirme com a Jean por telefone.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Toque em Apagar</strong> para recusar o pedido.', hints: {'confirm-jean': 'Não confirme um perfil copiado. Toque em Apagar.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Muito bem!</strong> As suas publicações são só para amigos e evitou um perfil falso. Avise a Jean, para ela o denunciar. Desconfie também de compradores do Marketplace que queiram pagar "por transportadora" ou que peçam códigos enviados para o seu telemóvel.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Pesquisar aqui'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Estação de autocarros e comboios, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Hospital, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Igreja, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Estação de autocarros e comboios · 25 milhas</small><button type="button" class="ce co" data-tap="directions">Como chegar</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min (25 milhas)</strong><small>Percurso mais rápido, pela A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ A pé 4 min até à <strong>Estação de Autocarros de Bridlington</strong>, cais 3</li>
                <li>⟦bus⟧ <strong>121</strong> em direção a Hull · 10:15 · <b class="ahy">Pontual</b></li><li>Saia em <strong>Hull Paragon Interchange</strong> (24 paragens)</li></ol>
                <button type="button" class="ce co" data-tap="start">Iniciar</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Os Mapas podem planear uma viagem de autocarro, com horários em direto. Vamos a Hull de autocarro. <strong>Abra os Mapas.</strong>' + (p === 'ios' ? ' <em>(O Google Maps funciona da mesma forma, se preferir.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Toque na caixa de pesquisa</strong> no topo.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Escrevemos "Hull interchange". <strong>Toque em Hull Paragon Interchange</strong>, a estação de autocarros.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Toque em Como chegar.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Mostra primeiro de carro. <strong>Toque no autocarro</strong> ⟦bus⟧ para ver os transportes públicos.', hints: {'mode-walk': 'Oito horas! Toque antes no autocarro.', 'mode-car': 'Isso é de carro. Toque no autocarro.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Aqui estão os autocarros, com o próximo primeiro. "Pontual" é em direto. <strong>Toque no das 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Onde apanha o autocarro?', options: [
            {t: 'Estação de Autocarros de Bridlington, cais 3', ok: true, why: 'Sim. Os Mapas dizem-lhe para onde caminhar, que autocarro apanhar e onde sair.'},
            {t: 'Hull Paragon Interchange', why: 'É onde sai. Apanha-o na Estação de Autocarros de Bridlington, cais 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Muito bem!</strong> Toque em <strong>Iniciar</strong> numa viagem a sério e os Mapas avisam-no quando a paragem estiver a chegar. Com passe de autocarro, mostra-o ao motorista como sempre. <em>(Apenas horários de treino: confirme os verdadeiros no dia.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: 'O <strong>SOS de Emergência</strong> liga para o 999 por si e envia a sua localização por mensagem às pessoas que escolher. Vamos verificar se está pronto. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Toque em SOS de Emergência.</strong>', hint: 'Está no terceiro grupo, com um ícone vermelho.'},
        {screen: c => list(p, 'SOS de Emergência', [{label: 'Ligar ao manter premido e soltar', toggle: true, sub: 'Mantenha premidos o botão lateral e um botão de volume e depois solte.'},
            {id: 'five', label: 'Ligar com 5 pressões do botão', toggle: !!c.five, sub: 'Carregue 5 vezes rapidamente no botão lateral.'}, {caption: ' '},
            {id: 'contacts', label: 'Configurar contactos de emergência em Saúde'}, {label: 'Deteção de Acidentes', toggle: true, sub: 'Liga para o 999 após um acidente de automóvel grave.'}], {back: 'Definições'}),
         target: 'five', action: c => { c.five = true; }, say: 'Carregar 5 vezes no botão lateral é fácil de lembrar num momento de pânico. <strong>Ative Ligar com 5 pressões do botão.</strong>'},
        {screen: c => list(p, 'SOS de Emergência', [{label: 'Ligar ao manter premido e soltar', toggle: true}, {label: 'Ligar com 5 pressões do botão', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Configurar contactos de emergência em Saúde'}], {back: 'Definições', overlay: c.pick ? sheet('Adicionar contacto de emergência', [['pick-sarah', 'Sarah', 'Filha · 07700 900333'], ['pick-dave', 'Dave', 'Amigo']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Agora escolha quem recebe uma mensagem com a sua localização. <strong>Toque em Configurar contactos de emergência.</strong>'},
        {screen: () => list(p, 'SOS de Emergência', [{label: 'Ligar com 5 pressões do botão', toggle: true}], {back: 'Definições', overlay: sheet('Adicionar contacto de emergência', [['pick-sarah', 'Sarah', 'Filha · 07700 900333'], ['pick-dave', 'Dave', 'Amigo']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Toque em Sarah</strong>, a sua filha.', hints: {'pick-dave': 'Escolha a Sarah para este treino.'}},
        {screen: () => list(p, 'SOS de Emergência', [{label: 'Ligar com 5 pressões do botão', toggle: true}, {caption: 'CONTACTOS DE EMERGÊNCIA'}, {label: 'Sarah', sub: 'Filha'}], {back: 'Definições'}),
         question: {q: 'Caiu e não consegue chegar bem ao ecrã do telemóvel. O que faz?', options: [
            {t: 'Carrego 5 vezes rapidamente no botão lateral', ok: true, why: 'Sim. Começa uma contagem decrescente e depois liga para o 999 e envia à Sarah uma mensagem com o sítio onde está.'},
            {t: 'Desbloqueio o telemóvel e procuro a app Telefone', why: 'Isso é lento numa emergência. Carregar 5 vezes no botão lateral funciona mesmo com o telemóvel bloqueado.'}]}},
        {screen: () => list(p, 'SOS de Emergência', [{label: 'Ligar com 5 pressões do botão', toggle: true}, {caption: 'CONTACTOS DE EMERGÊNCIA'}, {label: 'Sarah', sub: 'Filha'}], {back: 'Definições'}), done: true,
         say: '<strong>Muito bem!</strong> O SOS de Emergência está pronto e a Sarah será informada de onde está. Se o premir por engano, basta tocar em Parar durante a contagem decrescente.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'O <strong>SOS de Emergência</strong> liga para o 999 por si e envia a sua localização por mensagem às pessoas que escolher. Vamos verificar se está pronto. <strong>Toque em Definições.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Toque em Segurança &amp; emergência.</strong> <em>Num Samsung, também é Segurança e emergência.</em>', hint: 'Desça: fica perto do fim.'},
        {screen: () => list(p, 'Segurança &amp; emergência', [{id: 'medical', label: 'Informações médicas'}, {id: 'contacts-ec', label: 'Contactos de emergência'}, {id: 'sos', label: 'SOS de Emergência', sub: 'Desativado'}, {label: 'Deteção de acidentes de automóvel'}]),
         target: 'sos', say: 'O SOS de emergência está <strong>Desativado</strong>. <strong>Toque em SOS de emergência.</strong>'},
        {screen: c => list(p, 'SOS de Emergência', [{id: 'sos-toggle', label: 'Usar o SOS de emergência', toggle: !!c.sosOn, sub: 'Carregue 5 vezes ou mais no botão de ligar para iniciar ações de emergência.'}, {label: 'Partilhar informações com contactos de emergência', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Toque em Usar o SOS de emergência</strong> para o ativar.'},
        {screen: () => list(p, 'Segurança &amp; emergência', [{id: 'medical', label: 'Informações médicas'}, {id: 'contacts-ec', label: 'Contactos de emergência', sub: 'Nenhum'}, {label: 'SOS de Emergência', sub: 'Ativada'}]),
         target: 'contacts-ec', say: 'Agora escolha quem recebe uma mensagem com a sua localização. <strong>Toque em Contactos de emergência.</strong>'},
        {screen: c => list(p, 'Contactos de emergência', [{id: 'add', label: '＋ Adicionar contacto'}], {overlay: c.pick ? sheet('Escolher um contacto', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Toque em Adicionar contacto.</strong>'},
        {screen: () => list(p, 'Contactos de emergência', [{label: '＋ Adicionar contacto'}], {overlay: sheet('Escolher um contacto', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Toque em Sarah</strong>, a sua filha.', hints: {'pick-dave': 'Escolha a Sarah para este treino.'}},
        {screen: () => list(p, 'Contactos de emergência', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Adicionar contacto'}]),
         question: {q: 'Caiu e não consegue chegar bem ao ecrã do telemóvel. O que faz?', options: [
            {t: 'Carrego 5 vezes rapidamente no botão de ligar', ok: true, why: 'Sim. Começa uma contagem decrescente e depois liga para o 999 e partilha com a Sarah o sítio onde está.'},
            {t: 'Desbloqueio o telemóvel e procuro a app Telefone', why: 'Isso é lento numa emergência. Carregar 5 vezes no botão de ligar funciona mesmo com o telemóvel bloqueado.'}]}},
        {screen: () => list(p, 'Contactos de emergência', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Muito bem!</strong> O SOS de emergência está ativado e a Sarah será informada de onde está. Se o premir por engano, toque em Cancelar durante a contagem decrescente.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Os Alertas de Emergência avisam-no de perigos por perto, como inundações graves. Alguém desativou um neste telemóvel. Vamos corrigir isso. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toque em Notificações.</strong>'},
            {screen: c => list(p, 'Notificações', [{label: 'Mostrar pré-visualizações', value: 'Sempre'}, {caption: 'ESTILO DE NOTIFICAÇÃO'}, {label: 'Mensagens', sub: 'Faixas, Sons, Distintivos'}, {label: 'WhatsApp', sub: 'Faixas, Sons, Distintivos'},
                {caption: 'ALERTAS GOVERNAMENTAIS'}, {label: 'Alertas Extremos', toggle: true}, {id: 'severe', label: 'Alertas Graves', toggle: !!c.severe}, {label: 'Alertas de Teste', toggle: false}], {back: 'Definições'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Os Alertas Governamentais estão mesmo no fim. Os <strong>Alertas Graves</strong> estão desativados. <strong>Toque neles para os ativar.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Toque em Segurança &amp; emergência.</strong>', hint: 'Fica perto do fim da lista.'},
            {screen: () => list(p, 'Segurança &amp; emergência', [{label: 'Informações médicas'}, {label: 'SOS de Emergência'}, {id: 'wea', label: 'Alertas de emergência sem fios'}, {label: 'Alertas de localizadores desconhecidos'}]),
             target: 'wea', say: '<strong>Toque em Alertas de emergência sem fios.</strong> <em>Nalguns telemóveis chama-se Alertas de emergência.</em>'},
            {screen: c => list(p, 'Alertas de emergência sem fios', [{label: 'Permitir alertas', toggle: true}, {label: 'Ameaças extremas', toggle: true}, {id: 'severe', label: 'Ameaças graves', toggle: !!c.severe}, {label: 'Alertas de teste', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: 'As <strong>Ameaças graves</strong> estão desativadas. <strong>Toque nelas para as ativar.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Alerta de emergência: Grave</strong><p>Prevêem-se inundações graves perto da frente marítima. Dirija-se para um local mais alto. Mais em gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'É assim que um alerta se parece. Faz um som de sirene alto durante cerca de 10 segundos, mesmo em silêncio. <strong>Toque em OK.</strong> <em>(Apenas treino.)</em>'},
        {screen: () => home(p), question: {q: 'Chega um alerta enquanto conduz. O que deve fazer?', options: [
            {t: 'Parar num sítio seguro antes de o ler', ok: true, why: 'Sim. Nunca leia o telemóvel enquanto conduz. Pare em segurança e leia depois.'},
            {t: 'Lê-lo logo, enquanto conduzo', why: 'Nunca leia o telemóvel enquanto conduz. Encontre primeiro um sítio seguro para parar.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> O telemóvel vai agora avisá-lo de perigos graves por perto. Os alertas verdadeiros nunca pedem dados pessoais nem dinheiro: se algum pedir, é uma burla.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Três coisas que tornam um telemóvel roubado muito menos útil a um ladrão. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Toque em Face ID &amp; código.</strong> <em>Num iPhone a sério, a seguir vai introduzir o código.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Desça e <strong>toque em Proteção de Dispositivo Roubado</strong>.'},
            {screen: c => list(p, 'Proteção de Dispositivo Roubado', [{id: 'sdp', label: 'Proteção de Dispositivo Roubado', toggle: !!c.sdp, sub: 'Longe de casa, alterar o código ou a Conta Apple exige Face ID e uma espera de 1 hora.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Isto impede que um ladrão que o viu escrever o código o deixe sem acesso. <strong>Ative-a.</strong>'},
            {screen: () => list(p, 'Proteção de Dispositivo Roubado', [{label: 'Proteção de Dispositivo Roubado', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'A seguir, oculte as mensagens no ecrã de bloqueio. <strong>Toque em ‹ Face ID</strong> para voltar atrás.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toque em Notificações.</strong>'},
            {screen: c => list(p, 'Notificações', [{id: 'previews', label: 'Mostrar pré-visualizações', value: c.previews || 'Sempre'}, {label: 'Partilha de Ecrã', value: 'Notificações Desativadas'}], {back: 'Definições',
                overlay: c.pickPrev ? sheet('Mostrar pré-visualizações', [['prev-always', 'Sempre'], ['prev-unlocked', 'Quando Desbloqueado', 'Recomendado'], ['prev-never', 'Nunca']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Neste momento, qualquer pessoa pode ler as suas mensagens, incluindo códigos de segurança, sem desbloquear o telemóvel. <strong>Toque em Mostrar pré-visualizações.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Toque em Google.</strong>', hint: 'Fica perto do fim da lista.'},
            {screen: () => list(p, 'Google', [{label: 'Gerir a sua Conta Google'}, {id: 'all-services', label: 'Todos os serviços'}, {label: 'Cópia de segurança'}]), target: 'all-services', say: '<strong>Toque em Todos os serviços.</strong>'},
            {screen: () => list(p, 'Todos os serviços', [{caption: 'Segurança pessoal &amp; do dispositivo'}, {id: 'theft', label: 'Proteção contra roubo'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Toque em Proteção contra roubo.</strong>'},
            {screen: c => list(p, 'Proteção contra roubo', [{id: 'tdl', label: 'Bloqueio por Deteção de Roubo', toggle: !!c.tdl, sub: 'Bloqueia o ecrã se detetar que alguém lhe arrancou o telemóvel e fugiu.'}, {label: 'Bloqueio do Dispositivo Offline', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Ative o Bloqueio por Deteção de Roubo.</strong> Se alguém lhe agarrar no telemóvel e fugir, ele bloqueia-se sozinho.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'A seguir, oculte as mensagens no ecrã de bloqueio. De volta às Definições, <strong>toque em Notificações</strong>.'},
            {screen: c => list(p, 'Notificações', [{id: 'previews', label: 'Notificações no ecrã de bloqueio', sub: c.previews || 'Mostrar todo o conteúdo'}, {label: 'Histórico de notificações'}], {
                overlay: c.pickPrev ? sheet('Notificações no ecrã de bloqueio', [['prev-always', 'Mostrar todo o conteúdo'], ['prev-unlocked', 'Ocultar conteúdo sensível', 'Recomendado'], ['prev-never', 'Não mostrar notificações']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Neste momento, qualquer pessoa pode ler as suas mensagens, incluindo códigos de segurança, sem desbloquear o telemóvel. <strong>Toque em Notificações no ecrã de bloqueio.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Notificações', [{label: 'Mostrar pré-visualizações', value: 'Sempre'}], {back: 'Definições', overlay: sheet('Mostrar pré-visualizações', [['prev-always', 'Sempre'], ['prev-unlocked', 'Quando Desbloqueado', 'Recomendado'], ['prev-never', 'Nunca']])})
                : list(p, 'Notificações', [{label: 'Notificações no ecrã de bloqueio', sub: 'Mostrar todo o conteúdo'}], {overlay: sheet('Notificações no ecrã de bloqueio', [['prev-always', 'Mostrar todo o conteúdo'], ['prev-unlocked', 'Ocultar conteúdo sensível', 'Recomendado'], ['prev-never', 'Não mostrar notificações']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Quando Desbloqueado' : 'Ocultar conteúdo sensível'}.</strong>`, hints: {'prev-always': 'Era assim que estava. Escolha a recomendada.', 'prev-never': 'Isso oculta-as por completo, o que pode ser incómodo. Escolha a recomendada.'}},
        {screen: () => home(p), target: 'phone', say: 'Por fim, descubra o número IMEI do telemóvel. A sua operadora precisa dele para bloquear um telemóvel roubado. <strong>Abra a app Telefone.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'No teclado, <strong>escreva *#06#</strong> (asterisco, cardinal, zero, seis, cardinal).', hint: 'Comece pela tecla do asterisco *, em baixo à esquerda.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Informações do dispositivo', 'IMEI: 35 209900 176148 1 (número de treino)', [['ok', 'OK']])}),
         target: 'ok', say: 'Esse número comprido é o seu <strong>IMEI</strong>. Num telemóvel a sério, escreva-o num sítio seguro (não no telemóvel!). <strong>Toque em OK.</strong>'},
        {screen: () => home(p), question: {q: 'Arrancaram-lhe o telemóvel. A quem liga primeiro?', options: [
            {t: 'Ao banco, a partir do telemóvel de outra pessoa', ok: true, why: 'Sim. Os ladrões vão primeiro às apps do banco. Depois bloqueie o telemóvel online, ligue à operadora e comunique à polícia pelo 101.'},
            {t: 'Espero para ver se aparece', why: 'A rapidez conta. Ligue ao banco de imediato e depois bloqueie o telemóvel e ligue à operadora.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> O telemóvel ficou muito mais difícil de usar por um ladrão e sabe onde encontrar o IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'ENCONTRAR' : 'ALERTA DE LOCALIZADOR', title: p === 'ios' ? 'AirTag encontrado a deslocar-se consigo' : 'Localizador desconhecido a viajar consigo',
            text: '<br>A localização deste item pode ser vista pelo proprietário.'}),
         target: 'alert', say: 'O telemóvel reparou num localizador que não é seu a deslocar-se consigo. Não entre em pânico: muitas vezes é de um familiar, por engano. <strong>Toque no alerta.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'AirTag desconhecido' : 'Localizador desconhecido', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Visto consigo desde as <strong>10:12</strong> de hoje, em 4 locais.</p>
            <button type="button" class="ce co" data-tap="play">Reproduzir som</button>
            <button type="button" class="cp" data-tap="learn">Saber mais sobre este ${p === 'ios' ? 'AirTag' : 'Localizador'}</button>
            <button type="button" class="cp" data-tap="disable">Instruções para desativar</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'O mapa mostra por onde andou consigo. <strong>Toque em Reproduzir som</strong> para o conseguir encontrar.'},
        {screen: () => app(p, p === 'ios' ? 'AirTag desconhecido' : 'Localizador desconhecido', '<p class="cf">⟦volume-2⟧ <strong>A tocar…</strong><br>Oiça um som de pio.</p>', {color: '#fff'}),
         question: {q: 'Ouve um pio fraco. Onde deve procurar?', options: [
            {t: 'Em malas, bolsos de casacos, no carro e em tudo o que tenha pedido emprestado', ok: true, why: 'Sim. Os localizadores são pequenos, do tamanho de uma moeda grande, e muitas vezes escondem-se em forros, bolsos ou carros.'},
            {t: 'Em lado nenhum, ignoro', why: 'Vale a pena encontrá-lo. Veja as malas, os bolsos e o carro: pode ser só de um familiar.'}]}},
        {screen: c => app(p, 'Localizador encontrado', `<p class="cf">Aproxime a parte de cima do telemóvel do localizador para saber mais sobre ele.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Aproximar do localizador</button>`, {color: '#fff'}),
         target: 'scan', say: 'Encontrou-o no forro do casaco. <strong>Toque em Aproximar do localizador</strong> para ver a quem pertence.'},
        {screen: () => app(p, 'Sobre este localizador', '<p class="cf"><strong>Não está em Modo Perdido</strong><br>Número de série: P4R7-ACT1CE<br>Os dados do proprietário só são partilhados com a polícia.</p>', {color: '#fff'}),
         question: {q: 'Não é de um familiar e receia que alguém o tenha escondido para o seguir. O que faz?', options: [
            {t: 'Guardo-o em segurança e levo-o à polícia (ou ligo para o 999 se estiver em perigo)', ok: true, why: 'Sim. Não o deite fora: a polícia consegue chegar ao proprietário. A National Stalking Helpline é o 0808 802 0300.'},
            {t: 'Deito-o no lixo', why: 'Pode ser prova, e a polícia consegue encontrar o proprietário. Guarde-o e leve-o à polícia, ou ligue para o 999 se estiver em perigo.'}]}},
        {screen: () => app(p, 'Sobre este localizador', '<p class="cf">Ajuda: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 horas) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Muito bem!</strong> Sabe como encontrar um localizador e o que fazer. ' + (p === 'android' ? 'Verifique se os alertas estão ativados em <strong>Definições > Segurança &amp; emergência > Alertas de localizadores desconhecidos</strong>.' : 'Os iPhones verificam automaticamente a presença de localizadores.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Está num trilho na falésia e alguém caiu. Não há morada. Quando liga para o 999, a maioria dos telemóveis envia a sua localização automaticamente, mas três palavras também ajudam. <strong>Abra o what3words.</strong> <em>(Uma versão de treino.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'O ponto azul é você. Cada quadrado de 3 metros tem as suas próprias três palavras. As suas são <strong>puffin.chalk.lantern</strong>. Espere um momento para o ponto estabilizar e depois <strong>toque em Já tenho as minhas 3 palavras</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Agora ligue para o 999. <strong>Abra a app Telefone.</strong> <em>(Apenas treino: nunca ligue para o 999 para testar.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Marque 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Toque no botão verde de chamada.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Chamada de emergência · 0:08</small></div>
            <p class="hi">"Emergência, que serviço? … Ambulância. Qual é a localização exata da emergência?"</p>${homeIndicator(p)}</div>`,
         question: {q: 'O operador pergunta onde está. O que diz?', options: [
            {t: '"Estou no trilho da falésia. O meu endereço what3words é puffin, chalk, lantern."', ok: true, why: 'Sim. Diga onde está pelas suas palavras e depois dê as três palavras. Soletre qualquer palavra, se lhe pedirem.'},
            {t: '"Não sei, algures perto do mar"', why: 'Vão tentar encontrá-lo, mas três palavras localizam-no com 3 metros de precisão. Leia-as da app.'}]}},
        {screen: () => home(p), question: {q: 'Um amigo é surdo e não pode fazer chamadas de voz. Como pode contactar o 999?', options: [
            {t: 'Registar-se agora no SMS de emergência (enviar "register" para o 999), ou usar a app 999 BSL', ok: true, why: 'Sim. O SMS de emergência só funciona se se registar primeiro. A app 999 BSL liga a um intérprete de língua gestual.'},
            {t: 'Não conseguiria', why: 'Pode. Registe-se no SMS de emergência enviando "register" para o 999, ou use a app gratuita 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> Lembre-se: diga onde está e depois dê as três palavras. A app what3words funciona sem rede para encontrar as suas palavras, mas precisa de rede para ligar.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Sem resposta</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'O telemóvel está bloqueado: tocar não faz nada e não se desliga da forma normal. É um grande problema?', options: [
            {t: 'Normalmente não. Um "reinício forçado" resolve e não perde nada', ok: true, why: 'Certo. Um reinício forçado é como desligar da tomada. As fotografias e mensagens estão seguras.'},
            {t: 'Sim, está avariado', why: 'Normalmente não! Um reinício forçado resolve a maioria dos telemóveis bloqueados, e não perde nada.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'Num iPhone: <strong>prima e solte o aumentar volume</strong>, depois <strong>prima e solte o diminuir volume</strong>, e depois <strong>mantenha premido o botão lateral</strong> até aparecer o logótipo da Apple (cerca de 10 segundos). Aqui, toque neles por essa ordem.'
            : 'Na maioria dos telemóveis Android: <strong>mantenha premidos ao mesmo tempo o botão de ligar e o diminuir volume</strong> durante cerca de 10 segundos, até reiniciar. Aqui, toque em ligar e depois em diminuir volume. <em>(Google Pixel: mantenha premido apenas o botão de ligar durante 30 segundos.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Primeiro vem o aumentar volume.' : 'Comece pelo botão de ligar.', side: 'O botão lateral é o último, depois dos dois botões de volume.'},
         hint: p === 'ios' ? 'Aumentar volume, depois diminuir volume, depois o botão lateral.' : 'Ligar e depois diminuir volume.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'O logótipo apareceu. E agora?', options: [
            {t: 'Largar e esperar que arranque', ok: true, why: 'Sim. Demora um minuto. Pode ter de escrever o código uma vez.'},
            {t: 'Continuar a carregar em todos os botões', why: 'Largue assim que o logótipo aparecer e dê-lhe um minuto para arrancar.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Muito bem!</strong> O telemóvel reiniciou. Se continuar a bloquear, procure atualizações e liberte espaço de armazenamento. Reiniciar o telemóvel uma vez por semana mantém-no a funcionar bem.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Ativada' : 'Desativado'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Desativado' : (ctx.signal ? 'Ativado · 4G' : 'Sem serviço')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Desativado' : 'Casa'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Deslize para cima para fechar' : 'Fechar'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Sem serviço</span>'), target: 'pull-down',
         say: 'O telemóvel diz <strong>Sem serviço</strong>, embora esta manhã funcionasse. Uma solução rápida é ativar e desativar o modo de avião, o que o obriga a voltar a ligar-se. ' + (p === 'ios' ? '<strong>Deslize para baixo a partir do canto superior direito</strong> (ou toque na faixa).' : '<strong>Deslize para baixo a partir do topo</strong> (ou toque na faixa).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Toque em Modo de avião</strong> para o ativar. Tudo o que é sem fios se desliga.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Espere cerca de 10 segundos… e depois <strong>toque outra vez em Modo de avião</strong> para o desativar.'},
        {screen: c => quickPanel(p, c), question: {q: 'Os dados móveis voltaram em 4G. Quando mais é útil o modo de avião?', options: [
            {t: 'Num avião, ou no estrangeiro para evitar custos de roaming (pode ativar o Wi-Fi na mesma)', ok: true, why: 'Sim. Pode voltar a ativar o Wi-Fi com o modo de avião ligado, para usar o Wi-Fi do hotel ou do navio.'},
            {t: 'Para carregar o telemóvel', why: 'Carrega um pouco mais depressa, mas serve sobretudo para voos e para evitar custos de roaming no estrangeiro.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Muito bem!</strong> Se o modo de avião não resolver, reinicie o telemóvel. Continua sem serviço? Veja no site da sua operadora se há problemas na sua zona.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · agora</strong><span>🎁 As suas vidas GRÁTIS estão à espera! Volte e jogue! 🎉</span></button>',
         target: 'settings', say: 'Um jogo não pára de apitar com mensagens inúteis. Pode desativar as notificações de qualquer app. <strong>Toque em Definições</strong>, não na mensagem.', hints: {notif: 'Isso abre o jogo. Toque antes em Definições.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Toque em Notificações.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Notificações', [{label: 'Mostrar pré-visualizações', value: 'Quando Desbloqueado'}, {caption: 'ESTILO DE NOTIFICAÇÃO'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Faixas, Sons, Distintivos'}, {label: 'Mensagens', sub: 'Faixas, Sons, Distintivos'}, {label: 'WhatsApp', sub: 'Faixas, Sons, Distintivos'}], {back: 'Definições'})
            : list(p, 'Notificações', [{id: 'app-notifs', label: 'Notificações de apps'}, {id: 'history', label: 'Histórico de notificações'}, {label: 'Notificações no ecrã de bloqueio'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Toque em Bubble Pop.</strong>' : '<strong>Toque em Notificações de apps.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Notificações de apps', [{label: 'Mensagens', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Toque no interruptor junto a Bubble Pop</strong> para desativar as notificações dele.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Permitir notificações', toggle: !c.off}], {back: 'Notificações'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Desative Permitir notificações.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Notificações', [{label: 'Notificações de apps'}, {id: 'history', label: 'Histórico de notificações', sub: 'Desativado'}]), target: 'history',
             say: 'Extra útil: se alguma vez afastar uma mensagem por engano, o Histórico de notificações guarda uma cópia. <strong>Toque em Histórico de notificações.</strong>'},
            {screen: c => list(p, 'Histórico de notificações', [{id: 'hist-toggle', label: 'Usar histórico de notificações', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Ative-o.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'As notificações de que apps vale a pena manter?', options: [
            {t: 'Mensagens, chamadas, WhatsApp, o banco e tudo o que gostaria de saber de imediato', ok: true, why: 'Sim. Mantenha as importantes e desative jogos, lojas e tudo o que só o chateia.'},
            {t: 'Desativá-las todas', why: 'Perderia mensagens e chamadas! Mantenha as importantes e desative jogos e apps de compras.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Muito bem!</strong> O Bubble Pop não o vai incomodar mais. ' + (p === 'ios' ? 'Se afastar uma mensagem por engano, deslize para cima a partir do meio do ecrã de bloqueio para ver as anteriores.' : 'E o histórico de notificações guarda uma cópia de tudo o que afastar.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Vemo-nos no centro de jardinagem de dunas x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Mensagem de texto</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Escreveu "centro de jardinagem de Dunnington" e o telemóvel alterou. Porquê?', options: [
            {t: 'A correção automática adivinhou a palavra errada', ok: true, why: 'Sim. A correção automática troca palavras que não conhece. Pode desativá-la ou ensinar-lhe palavras novas.'},
            {t: 'O telemóvel está avariado', why: 'É só a correção automática a adivinhar. Pode desativá-la ou ensinar-lhe palavras.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Toque em Geral.</strong>'},
            {screen: () => list(p, 'Geral', [{label: 'Acerca'}, {label: 'Atualização de software'}, {id: 'keyboard', label: 'Teclado'}, {label: 'Idioma &amp; Região'}], {back: 'Definições'}), target: 'keyboard', say: '<strong>Toque em Teclado.</strong>'},
            {screen: c => list(p, 'Teclados', [{id: 'replace', label: 'Substituição de Texto'}, {caption: 'TODOS OS TECLADOS'}, {label: 'Maiúsculas Automáticas', toggle: true}, {id: 'ac', label: 'Correção Automática', toggle: !c.acOff}, {label: 'Texto Preditivo', toggle: true}], {back: 'Geral'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Desative a Correção Automática.</strong> Os erros ortográficos continuam a ficar sublinhados a vermelho, para os corrigir você mesmo.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Toque em Sistema.</strong> Fica em baixo.'},
            {screen: () => list(p, 'Sistema', [{id: 'keyboard', label: 'Teclado'}, {label: 'Idiomas'}, {label: 'Data &amp; hora'}]), target: 'keyboard', say: '<strong>Toque em Teclado.</strong>'},
            {screen: () => list(p, 'Teclado', [{id: 'gboard', label: 'Gboard', sub: 'Teclado no ecrã'}]), target: 'gboard', say: '<strong>Toque em Gboard.</strong> <em>Num Samsung, é Teclado Samsung > Escrita inteligente.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferências'}, {id: 'correction', label: 'Correção de texto'}, {label: 'Escrita por deslize'}]), target: 'correction', say: '<strong>Toque em Correção de texto.</strong>'},
            {screen: c => list(p, 'Correção de texto', [{label: 'Mostrar barra de sugestões', toggle: true}, {id: 'ac', label: 'Correção automática', toggle: !c.acOff}, {label: 'Verificação ortográfica', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Desative a Correção automática.</strong> Os erros ortográficos continuam a ficar sublinhados a vermelho, para os corrigir você mesmo.'},
        ]),
        {screen: () => home(p), question: {q: 'Preferia manter a correção automática, mas ela muda sempre "Dunnington". O que mais podia fazer?', options: [
            {t: 'Adicioná-la ao dicionário do telemóvel, para ele aprender a palavra', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Use a Substituição de Texto nas mesmas definições do Teclado.' : 'Toque na palavra na barra de sugestões e escolha adicioná-la ao dicionário.')},
            {t: 'Nada, aguentar', why: 'Pode ensiná-lo: ' + (p === 'ios' ? 'adicione a palavra em Teclado > Substituição de Texto.' : 'toque na palavra nas sugestões e adicione-a ao dicionário.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> Chega de trocas de palavras surpresa. Pode voltar a ativá-la quando quiser, no mesmo sítio.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Tem uns auscultadores sem fios novos. O que faz primeiro?', options: [
            {t: 'Pô-los em "modo de emparelhamento" (normalmente mantém-se o botão premido até uma luz piscar)', ok: true, why: 'Sim. O modo de emparelhamento deixa o telemóvel encontrá-los. As instruções na caixa explicam exatamente como.'},
            {t: 'Ligá-los ao telemóvel com um cabo', why: 'Os auscultadores sem fios ligam-se por Bluetooth. Ponha-os primeiro em modo de emparelhamento, normalmente mantendo o botão premido até uma luz piscar.'}]}},
        {screen: () => home(p), target: 'settings', say: 'A luz dos auscultadores está a piscar. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Toque em Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Toque em Dispositivos ligados.</strong>'},
            {screen: () => list(p, 'Dispositivos ligados', [{id: 'pair', label: '＋ Emparelhar novo dispositivo'}, {label: 'Dispositivos guardados', sub: 'Carro'}]), target: 'pair', say: '<strong>Toque em Emparelhar novo dispositivo.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Emparelhar novo dispositivo', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'OS MEUS DISPOSITIVOS' : 'Guardado'}, {label: 'Carro', sub: 'Não ligado'},
            {caption: p === 'ios' ? 'OUTROS DISPOSITIVOS' : 'Dispositivos disponíveis'}, {id: 'headphones', label: '⟦headphones⟧ Auscultadores de Treino'}, {label: 'TV do vizinho'}], {back: 'Definições'}),
         target: 'headphones', say: 'O telemóvel está à procura de dispositivos por perto. <strong>Toque em Auscultadores de Treino.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'OS MEUS DISPOSITIVOS'}, {label: '⟦headphones⟧ Auscultadores de Treino', sub: 'Ligado ⟦check⟧'}, {label: 'Carro', sub: 'Não ligado'}], {back: 'Definições'}),
         question: {q: 'Da próxima vez que ligar os auscultadores, tem de fazer isto outra vez?', options: [
            {t: 'Não, a partir de agora ligam-se sozinhos', ok: true, why: 'Sim. Só se emparelha uma vez. Depois ligam-se automaticamente quando estão ligados e por perto.'},
            {t: 'Sim, de cada vez', why: 'Só se emparelha uma vez. Depois ligam-se sozinhos.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Auscultadores de Treino', sub: 'Ligado ⟦check⟧'}], {back: 'Definições'}), done: true,
         say: '<strong>Muito bem!</strong> Os mesmos passos servem para um carro, uma coluna ou aparelhos auditivos. Se algo não ligar, desligue e volte a ligar o Bluetooth e ponha o dispositivo outra vez em modo de emparelhamento.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">"${ctx.said || 'Avó? Sou eu, o Tom! Perdi o telemóvel e estou em apuros. Preciso de 400 £ para uma multa, hoje. Por favor, não digas à mãe!'}"</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Pedir a frase de segurança da família</button><button type="button" data-tap="send-money">Dizer que vai enviar o dinheiro</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Está a tocar um número desconhecido. <strong>Atenda</strong>, para praticar o que fazer.', hints: {decline: 'Recusar é perfeitamente aceitável na vida real! Neste treino, toque em Atender.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Hã… o quê? Avó, não há tempo para isso! Por favor, preciso do dinheiro agora!'; },
         say: 'Soa mesmo ao seu neto Tom. Mas os burlões conseguem copiar vozes. A sua família combinou uma <strong>frase de segurança</strong>. <strong>Peça-a.</strong>',
         hints: {'send-money': 'Nunca aceite enviar dinheiro numa chamada destas. Peça a frase de segurança.', end: 'Desligar também é boa ideia! Mas primeiro, pratique pedir a frase de segurança.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Não a sabem e estão a insistir mais. Isso é um burlão. <strong>Desligue</strong> com o botão vermelho.', hints: {'send-money': 'Não! Não sabiam a frase. Desligue.', 'ask-phrase': 'Pediu e não souberam responder. Desligue.'}},
        {screen: () => home(p), question: {q: 'Continua um pouco preocupado com o Tom. O que faz?', options: [
            {t: 'Ligo ao Tom (ou à mãe dele) para o número que já tenho dele', ok: true, why: 'Sim. Ligue sempre para um número que conhece. O Tom verdadeiro vai estar bem e não se importa que verifique.'},
            {t: 'Ligo de volta para o número que me ligou', why: 'Isso chega outra vez ao burlão. Ligue ao Tom para o número que já tem dele.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Se uma chamada for sobre a sua conta bancária, pode ligar para o <strong>159</strong> para contactar o seu próprio banco em segurança. <strong>Abra a app Telefone</strong> para praticar.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Marque 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Toque no botão verde de chamada.</strong> <em>(Apenas treino: não se liga a ninguém.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">"Bem-vindo ao 159. Diga o nome do seu banco e ligamo-lo."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Muito bem!</strong> O 159 liga-o ao seu banco verdadeiro. Combine uma frase de segurança com a família pessoalmente e nunca a publique online.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Olá' : 'Olá'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Deslize para cima para abrir' : 'Começar'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `O telemóvel novo já saiu da caixa e está ligado. Mantenha o <strong>telemóvel antigo</strong> por perto, carregado e ligado ao Wi-Fi. <strong>Toque em ${p === 'ios' ? 'Deslize para cima para abrir' : 'Começar'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Início Rápido' : 'Copiar apps &amp; dados', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Aproxime o iPhone antigo deste para o configurar com a sua Conta Apple.' : 'Copie as apps, fotografias, contactos e mais do telemóvel antigo.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Continue no iPhone antigo' : 'Usar o dispositivo antigo'}</button>
            <button type="button" class="cp" data-tap="manual">Configurar manualmente</button>`}),
         target: 'use-old', say: 'Copiar do telemóvel antigo poupa-lhe configurar tudo de novo. <strong>Toque ' + (p === 'ios' ? 'Continue no iPhone antigo' : 'Usar o dispositivo antigo') + '.</strong>', hints: {manual: 'Pode, mas copiar é muito mais fácil. Toque no outro botão.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">No telemóvel <strong>antigo</strong> aparece uma mensagem. Aponte a câmara para este padrão.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">O telemóvel antigo leu-o</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'No telemóvel antigo, toque em Continuar e depois segure-o sobre este padrão para a câmara o ver. Aqui, <strong>toque em O telemóvel antigo leu-o</strong>.'},
        {screen: c => codeScreen(p, c, 'Introduza o código do telemóvel antigo', 'Isto copia as suas definições em segurança.'), sequence: CODE_KEYS,
         say: `Escreva o código do telemóvel antigo. Para treinar, use <strong>${codeText}</strong>.`, hint: `Escreva o código de treino ${codeText}.`},
        {screen: () => list(p, 'Transfira os seus dados', [], {noBack: true, top: `<p class="cf">Escolha o que levar:</p>
            <div class="cj ex"><span>Fotografias e vídeos</span>${tog(true)}</div><div class="cj ex"><span>Contactos e mensagens</span>${tog(true)}</div><div class="cj ex"><span>Apps</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Continuar</button>`}),
         target: 'transfer', say: 'Está tudo assinalado. <strong>Toque em Continuar.</strong> Mantenha os dois telemóveis juntos e ligados à corrente.'},
        {screen: c => list(p, 'A transferir…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Faltam cerca de 25 minutos' : 'Transferência concluída ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'A transferência terminou. O que deve fazer ao telemóvel antigo?', options: [
            {t: 'Guardá-lo uma semana para ver se não falta nada e depois apagá-lo bem antes de o vender ou reciclar', ok: true, why: 'Sim. Veja primeiro se as fotografias, o WhatsApp e as apps do banco funcionam no telemóvel novo. A próxima lição mostra como apagar o antigo.'},
            {t: 'Deitá-lo logo no lixo', why: 'Ainda tem toda a sua informação! Veja se o telemóvel novo tem tudo e depois apague bem o antigo.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> O telemóvel novo tem as suas fotografias, contactos e apps. Algumas apps, como as do banco e o WhatsApp, pedem para iniciar sessão outra vez; tenha os seus dados à mão.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Vai vender, dar ou reciclar o telemóvel antigo? Faça isto pela ordem certa, ou o próximo dono não o consegue usar. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Passo 1: termine a sessão da Conta Apple. <strong>Toque no seu nome</strong>.'},
            {screen: c => list(p, 'Conta Apple', [{label: 'Informações Pessoais'}, {label: 'Início de sessão &amp; segurança'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Terminar sessão', danger: true}], {back: 'Definições',
                overlay: c.ask ? dialog(p, 'Terminar sessão?', 'A palavra-passe é necessária para desativar o Encontrar. (Treino: já preenchida.)', [['cancel', 'Cancelar'], ['turn-off', 'Desativar']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Desça até ao fim e <strong>toque em Terminar sessão</strong>.'},
            {screen: () => list(p, 'Conta Apple', [{label: 'Terminar sessão', danger: true}], {back: 'Definições', overlay: dialog(p, 'Terminar sessão?', 'A palavra-passe é necessária para desativar o Encontrar. (Treino: já preenchida.)', [['cancel', 'Cancelar'], ['turn-off', 'Desativar']])}),
             target: 'turn-off', say: 'Isto desativa o <strong>Encontrar</strong>, que de outra forma bloquearia o telemóvel para si. <strong>Toque em Desativar.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Passo 2: apague-o. <strong>Toque em Geral.</strong>'},
            {screen: () => list(p, 'Geral', [{label: 'Acerca'}, {label: 'Armazenamento do iPhone'}, {id: 'reset', label: 'Transferir ou Repor o iPhone'}], {back: 'Definições'}), target: 'reset', say: '<strong>Toque em Transferir ou Repor o iPhone</strong>, em baixo.'},
            {screen: c => list(p, 'Transferir ou Repor o iPhone', [{label: 'Repor'}, {id: 'erase', label: 'Apagar Todo o Conteúdo e Definições'}], {back: 'Geral',
                overlay: c.askErase ? dialog(p, 'Apagar Este iPhone?', 'Todas as fotografias, mensagens e apps serão apagadas.', [['cancel', 'Cancelar'], ['confirm-erase', 'Apagar']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Toque em Apagar Todo o Conteúdo e Definições.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Passo 1: remova a Conta Google. <strong>Toque em Google</strong>. <em>(Num Samsung, remova também a conta Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Gerir a sua Conta Google'}, {id: 'accounts', label: 'Contas neste dispositivo', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Toque em Contas neste dispositivo.</strong>'},
            {screen: c => list(p, 'Conta Google', [{label: 'margaret.smith@example.com'}, {label: 'Sincronização da conta'}, {id: 'remove', label: 'Remover conta', danger: true}], {overlay: c.ask ? dialog(p, 'Remover conta?', 'Remover apaga as respetivas mensagens, contactos e dados deste telemóvel.', [['cancel', 'Cancelar'], ['confirm-remove', 'Remover conta']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Sem isto, o telemóvel fica bloqueado para a sua conta depois de repor. <strong>Toque em Remover conta.</strong>'},
            {screen: () => list(p, 'Conta', [{label: 'Remover conta', danger: true}], {overlay: dialog(p, 'Remover conta?', 'Remover apaga as respetivas mensagens, contactos e dados deste telemóvel.', [['cancel', 'Cancelar'], ['confirm-remove', 'Remover conta']])}),
             target: 'confirm-remove', say: '<strong>Toque em Remover conta.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Passo 2: apague-o. <strong>Toque em Sistema</strong>, em baixo.'},
            {screen: () => list(p, 'Sistema', [{label: 'Idiomas'}, {label: 'Atualização de software'}, {id: 'reset', label: 'Opções de reposição'}]), target: 'reset', say: '<strong>Toque em Opções de reposição.</strong>'},
            {screen: c => list(p, 'Opções de reposição', [{label: 'Repor Wi-Fi, dados móveis &amp; Bluetooth'}, {id: 'erase', label: 'Apagar todos os dados (reposição de fábrica)'}], {overlay: c.askErase ? dialog(p, 'Apagar todos os dados?', 'Todas as fotografias, mensagens e apps serão apagadas.', [['cancel', 'Cancelar'], ['confirm-erase', 'Apagar todos os dados']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Toque em Apagar todos os dados (reposição de fábrica).</strong>'},
        ]),
        {screen: () => list(p, 'Repor', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Apagar Este iPhone?' : 'Apagar todos os dados?', 'Todas as fotografias, mensagens e apps serão apagadas.', [['cancel', 'Cancelar'], ['confirm-erase', p === 'ios' ? 'Apagar' : 'Apagar todos os dados']])}),
         target: 'confirm-erase', say: 'Só faça isto depois de as fotografias estarem em segurança no telemóvel novo ou com cópia de segurança. <strong>Toque ' + (p === 'ios' ? 'Apagar' : 'Apagar todos os dados') + '.</strong> <em>(Treino: nada é apagado.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Olá' : 'Olá'}</h3><p class="cf">Pronto para o próximo dono</p>${homeIndicator(p)}</div>`,
         question: {q: 'Mais uma coisa antes de o entregar?', options: [
            {t: 'Retirar o cartão SIM (e qualquer cartão de memória)', ok: true, why: 'Sim. O SIM tem o seu número de telefone. Retire-o com a ferramenta pequena ou um clipe.'},
            {t: 'Nada mais', why: 'Retire o cartão SIM e qualquer cartão de memória. O seu número está no SIM.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Olá' : 'Olá'}</h3><p class="cf">Pronto para o próximo dono</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Muito bem!</strong> Termine sessão, apague, retire o SIM: por esta ordem. O ecrã "Olá" significa que está pronto para outra pessoa.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Lembrete</strong><span>Ligar à Sarah</span><small>Hoje às 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, aguaceiros mais tarde</span><small>Máx. 14° · Mín. 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} está a ouvir… o que gostaria de dizer?`}</p>${result}
            <div class="wh">${[['say-remind', '"Lembra-me de ligar à Sarah às 3"'], ['say-weather', '"Como está o tempo hoje?"'], ['say-joke', '"Pede-me uma pizza"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Botão lateral (manter premido)' : 'Botão de ligar (manter premido)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? 'A <strong>Siri</strong> faz coisas quando lhe pede em voz alta. <strong>Mantenha premido o botão lateral</strong> (à direita) até a Siri aparecer. Também pode dizer apenas "Siri" ou "Ei Siri".'
                          : 'O telemóvel faz coisas quando lhe pede em voz alta. <strong>Mantenha premido o botão de ligar</strong> (à direita) até o assistente aparecer. Também pode dizer "Ok Google".',
         hint: 'Mantenha o dedo (ou o botão do rato) premido no botão da margem direita.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Num telemóvel a sério, bastava falar. Aqui, <strong>toque em "Lembra-me de ligar à Sarah às 3"</strong>.', hints: {'say-joke': 'Experimente primeiro o lembrete.', 'say-weather': 'Experimente primeiro o lembrete.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Feito: um lembrete aparece às 3 horas. Agora <strong>pergunte pelo tempo</strong>.', hints: {'say-remind': 'Está definido. Agora pergunte pelo tempo.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Qual destas coisas podia pedir ao telemóvel?', options: [
            {t: 'Todas: "Ligar à Sarah", "Definir um temporizador de 10 minutos", "Acender a lanterna", "Ler as minhas mensagens"', ok: true, why: 'Sim. É útil quando tem as mãos ocupadas, os olhos cansados ou escrever é complicado.'},
            {t: 'Só o tempo', why: 'Faz muito: chamadas, temporizadores, a lanterna, ler mensagens, alarmes e mais.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Muito bem!</strong> Fale com clareza e naturalidade, como se falasse com uma pessoa. Se ouvir mal, peça outra vez.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Texto'], ['lens-translate', 'Traduzir'], ['lens-search', 'Pesquisar']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Menu' : 'Carte'}</strong><span>${ctx.translated ? 'Sopa de peixe' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Frango com cogumelos' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Tarte de maçã' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Centro de Saúde de Bridlington</strong><span>Está na hora da sua vacina contra a gripe.</span><span>Para marcar, ligue ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Texto em Direto' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'A câmara consegue ler texto escrito. Vamos copiar um número de telefone de uma carta. <strong>Abra a Câmara.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Aponte-a à carta. Quando detetar texto, aparece um pequeno <strong>botão de texto ⟦scan-text⟧</strong>. <strong>Toque nele.</strong>' : 'Aponte-a à carta e <strong>toque no botão do Lens ◎</strong>.',
         hints: {shutter: 'Isso tira uma fotografia normal. Toque no ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'botão do Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'O texto escrito é agora texto a sério. <strong>Toque no número de telefone.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Toque em Copiar</strong>, pronto para colar numa mensagem ou nos contactos. <em>(Ligar ligaria logo para o número.)</em>', hints: {'call-num': 'Isso ligaria para o número. Neste treino, toque em Copiar.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'De férias? Agora está a apontar para uma ementa em francês. ' + (p === 'ios' ? 'A app Traduzir ou o Lens da app Google conseguem fazer isto. ' : '') + '<strong>Toque em Traduzir.</strong>', hints: {'lens-text': 'Isso copia o francês. Toque em Traduzir.', 'lens-search': 'Toque em Traduzir.'}},
        {screen: c => cameraLens(p, c), question: {q: 'O que mais pode a câmara fazer assim?', options: [
            {t: 'Identificar plantas e aves, e digitalizar cartas para um PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Na app Notas, toque no clipe e depois em Digitalizar Documentos, para transformar cartas num PDF.' : 'No Google Drive, toque em + e depois em Digitalizar, para transformar cartas num PDF.')},
            {t: 'Só tirar fotografias', why: 'Faz muito mais: identifica plantas, traduz, copia texto e digitaliza cartas para PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Muito bem!</strong> Copiou um número e traduziu uma ementa com a câmara. ' + (p === 'ios' ? 'O Texto em Direto também funciona em fotografias que já tirou.' : 'O Google Lens também funciona em fotografias que já tirou.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'eBooks da biblioteca', `<p class="cf">Sessão iniciada com o seu cartão de biblioteca</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">eBooks</button><button type="button" data-tap="tab-audio" class="on">Audiolivros digitais</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'A devolver em 21 dias' : '3 de 5 exemplares disponíveis'}</small>
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
         say: 'Com um cartão de biblioteca gratuito, pode pedir emprestados eBooks e audiolivros no telemóvel. As East Riding Libraries usam a app <strong>BorrowBox</strong>. Esta é uma versão de treino. <strong>Abra-a.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Tem a sessão iniciada com o cartão de biblioteca. <strong>Toque em The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'É grátis pedir emprestado. <strong>Toque em Pedir emprestado.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'É seu durante 21 dias. <strong>Toque em Ouvir.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Toque no botão de reproduzir ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'A ouvir na cama? Um <strong>temporizador de sono</strong> pára-o passado algum tempo, para não perder o sítio. <strong>Toque em Temporizador de sono.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'O que acontece quando passam os 21 dias?', options: [
            {t: 'Devolve-se sozinho. Sem multas, e pode renovar se ainda não acabou', ok: true, why: 'Sim. Os eBooks e audiolivros devolvem-se automaticamente.'},
            {t: 'Paga uma multa', why: 'Não há multas. Devolve-se sozinho, e pode renovar se ainda não acabou.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Muito bem!</strong> Para começar a sério, inscreva-se em eastridinglibraries.co.uk ou em qualquer biblioteca, depois descarregue o BorrowBox e inicie sessão com o seu cartão.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Estacionar', `<div class="rc"><strong>P</strong><span>Parque de Estacionamento de Harbour Road</span><span>Pague pela app: local <b>4471</b></span></div>
                <p class="cf">Introduza o número do local que está na placa</p>${field('parkcode', 'Número do local', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Procurar parque</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Pagar 3,20 £' : 'Escolher um tempo'}</button>`, {color});
        }
        return app(p, 'Estacionamento', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Estacionar', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Muitos parques de estacionamento deixam pagar por app, por isso não precisa de moedas. Cada autarquia usa apps diferentes (a placa diz qual). Esta é de treino. <strong>Abra Estacionar.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Escreva o número do local que está na placa: 4471.',
         say: 'Todos os parques têm um <strong>número do local</strong> na placa. <strong>Escreva 4471</strong> na caixa e <strong>toque em Procurar parque</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'A matrícula do seu carro já está guardada. <strong>Escolha 2 horas.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Há uma pequena taxa de serviço por usar a app. <strong>Toque em Pagar 3,20 £.</strong> <em>(Treino: não é cobrado dinheiro.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Está atrasado nas compras. O que pode fazer?', options: [
            {t: 'Tocar em Prolongar na app para acrescentar tempo, sem voltar ao carro', ok: true, why: 'Sim. Essa é a grande vantagem de pagar por app. A maioria também o avisa antes de acabar o tempo.'},
            {t: 'Nada, vai levar uma multa', why: 'A maioria das apps de estacionamento deixa tocar em Prolongar para acrescentar tempo, esteja onde estiver.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Muito bem!</strong> A maioria das máquinas ainda aceita cartões ou moedas, e muitas apps também deixam pagar ligando para um número ou enviando uma mensagem. Nunca pague através de um autocolante com código QR numa máquina: podem ser falsos.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>O seu contrato terminou a 3 de março de 2026. Pode mudar sem custos. O seu preço mensal é 24,00 £. Para mudar e manter o número, envie PAC para 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Mensagem de texto', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Ainda tem fidelização ou está a pagar demais? Uma mensagem gratuita diz-lhe. <strong>Abra as Mensagens.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Escreva INFO na caixa de mensagem e depois toque em enviar.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Começámos uma mensagem nova para o <strong>85075</strong>. <strong>Escreva INFO</strong> e <strong>toque em enviar</strong>. É gratuito em todas as redes do Reino Unido.'},
        {screen: c => smsTo(p, c), question: {q: 'A resposta diz que o contrato acabou e que continua a pagar 24 £ por mês. O que significa?', options: [
            {t: 'O telemóvel já está pago. Um plano só com SIM pode custar muito menos, e pode manter o número', ok: true, why: 'Sim. Envie PAC para o 65075 para obter um código para mudar e manter o número. O novo fornecedor trata do resto.'},
            {t: 'Nada, continuo a pagar', why: 'Pode estar a pagar por um telemóvel que já está pago. Um plano só com SIM podia poupar-lhe muito.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Mais uma poupança, para viagens ao estrangeiro: desative o roaming de dados para não ter surpresas na fatura. <strong>Toque em Definições.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Toque em Dados móveis.</strong>'},
            {screen: () => list(p, 'Dados móveis', [{label: 'Dados Móveis', toggle: true}, {id: 'options', label: 'Opções de Dados Móveis', value: 'Roaming Ativado'}, {label: 'Ponto de Acesso Pessoal'}], {back: 'Definições'}), target: 'options', say: '<strong>Toque em Opções de Dados Móveis.</strong>'},
            {screen: c => list(p, 'Opções de Dados Móveis', [{id: 'roam', label: 'Roaming de Dados', toggle: !c.roamOff}, {label: 'Voz &amp; Dados', value: '5G Automático'}], {back: 'Dados móveis'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Desative o Roaming de Dados.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Toque em Rede &amp; Internet.</strong>'},
            {screen: () => list(p, 'Rede &amp; Internet', [{label: 'Internet', sub: 'Wi-Fi de casa'}, {id: 'sims', label: 'SIM', sub: 'A sua rede'}, {label: 'Modo de avião', toggle: false}]), target: 'sims', say: '<strong>Toque em SIM.</strong>'},
            {screen: c => list(p, 'SIM', [{label: 'Dados móveis', toggle: true}, {id: 'roam', label: 'Roaming', toggle: !c.roamOff, sub: 'Ligar a serviços de dados em roaming'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Desative o Roaming.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Muito bem!</strong> No estrangeiro, pode continuar a usar o Wi-Fi para o WhatsApp, videochamadas e mapas. Volte a ativar o roaming se precisar de dados móveis e souber quanto cobra a sua operadora.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Encontrar', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Partilhar a localização permite que a família veja que chegou bem a casa. É uma escolha sua e pode parar quando quiser. <strong>Abra o Encontrar.</strong>'},
        {screen: c => app(p, 'Pessoas', `<p class="cf">Ninguém está a partilhar ainda.</p><button type="button" class="ce co" data-tap="share">Partilhar a Minha Localização</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Toque em Partilhar a Minha Localização.</strong>'},
        {screen: c => app(p, 'Partilhar com', '', {color: '#fff', overlay: sheet('Escolher um contacto', [['pick-sarah', 'Sarah', 'Filha'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Toque em Sarah.</strong>', hints: {'pick-dave': 'Escolha a Sarah para este treino.'}},
        {screen: c => app(p, 'Partilhar com a Sarah', '', {color: '#fff', overlay: sheet('Durante quanto tempo?', [['one-hour', 'Partilhar durante uma hora'], ['day', 'Partilhar até ao fim do dia'], ['always', 'Partilhar indefinidamente']])}),
         target: 'always', say: 'Escolha durante quanto tempo. Para a família em quem confia, <strong>toque em Partilhar indefinidamente</strong>. Pode parar a qualquer momento.', hints: {'one-hour': 'Isso é útil para uma viagem. Neste treino, escolha Partilhar indefinidamente.', day: 'Neste treino, escolha Partilhar indefinidamente.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Partilhar a localização permite que a família veja que chegou bem a casa. É uma escolha sua e pode parar quando quiser. <strong>Abra os Mapas.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Toque na sua fotografia de perfil</strong> em cima, à direita.'},
        {screen: () => app(p, 'Mapas', '', {color: '#fff', overlay: sheet('', [['sharing', 'Partilha de localização'], ['timeline', 'A sua Cronologia'], ['settings', 'Definições']])}), target: 'sharing', say: '<strong>Toque em Partilha de localização.</strong>'},
        {screen: () => app(p, 'Partilha de localização', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Toque em Nova partilha.</strong>'},
        {screen: () => app(p, 'Partilhar com', '', {color: '#fff', overlay: sheet('Escolher um contacto', [['pick-sarah', 'Sarah', 'Filha'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Toque em Sarah.</strong>', hints: {'pick-dave': 'Escolha a Sarah para este treino.'}},
        {screen: () => app(p, 'Partilhar com a Sarah', '', {color: '#fff', overlay: sheet('Durante quanto tempo?', [['one-hour', 'Durante 1 hora'], ['always', 'Até desativar isto']])}),
         target: 'always', say: 'Para a família em quem confia, <strong>toque em Até desativar isto</strong>.', hints: {'one-hour': 'Útil para uma viagem. Neste treino, escolha Até desativar isto.'}},
    ]).concat([
        {screen: () => app(p, 'A partilhar com a Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">A Sarah consegue ver onde está. ${p === 'ios' ? 'Toque em Parar de partilhar' : 'Toque em Parar'} a qualquer momento.</p>`, {color: '#fff'}),
         question: {q: 'Alguém que acabou de conhecer online pede-lhe que partilhe a sua localização. Deve fazê-lo?', options: [
            {t: 'Não. Só partilho com a família próxima ou amigos em quem confio', ok: true, why: 'Exatamente. A sua localização mostra onde vive e quando está fora. Reserve-a para pessoas de confiança.'},
            {t: 'Sim, parecem simpáticos', why: 'Partilhe a localização só com a família próxima e amigos. Mostra onde vive e quando está fora.'}]}},
        {screen: () => app(p, 'A partilhar com a Sarah', '<p class="cf">A Sarah consegue ver onde está.</p>', {color: '#fff'}), done: true,
         say: '<strong>Muito bem!</strong> A Sarah vê que está em segurança. Verifique de vez em quando com quem está a partilhar, e pare de partilhar com quem não precisar.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'O seu neto Leo vai receber o primeiro iPhone. O <strong>Tempo de Ecrã</strong> define limites saudáveis. Este é o telemóvel do <strong>Leo</strong>. <strong>Toque em Definições.</strong>'},
        {screen: c => list(p, 'Definições', [{label: 'Leo', sub: 'Conta Apple'}, {label: 'Notificações'}, {id: 'screen-time', label: 'Tempo de Ecrã'}, {label: 'Geral'}], {noBack: true}), target: 'screen-time', say: '<strong>Toque em Tempo de Ecrã.</strong>'},
        {screen: c => list(p, 'Tempo de Ecrã', [{id: 'downtime', label: 'Tempo de Pausa', sub: c.downtime ? '20:00 – 07:00' : 'Desativado'}, {label: 'Limites de Apps'}, {id: 'content', label: 'Restrições de Conteúdo &amp; Privacidade', sub: c.content ? 'Ativada' : 'Desativado'}, {label: 'Usar Código do Tempo de Ecrã'}], {back: 'Definições'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: 'O <strong>Tempo de Pausa</strong> bloqueia a maioria das apps à noite (as chamadas continuam a funcionar). <strong>Toque em Tempo de Pausa</strong> para o ativar, das 20:00 às 07:00.'},
        {screen: c => list(p, 'Tempo de Ecrã', [{label: 'Tempo de Pausa', sub: '20:00 – 07:00'}, {label: 'Limites de Apps'}, {id: 'content', label: 'Restrições de Conteúdo &amp; Privacidade', sub: c.content ? 'Ativada' : 'Desativado'}], {back: 'Definições'}),
         target: 'content', action: c => { c.content = true; }, say: 'A seguir, impeça compras surpresa e conteúdo para adultos. <strong>Toque em Restrições de Conteúdo &amp; Privacidade.</strong>'},
        {screen: c => list(p, 'Conteúdo &amp; Privacidade', [{label: 'Restrições de Conteúdo &amp; Privacidade', toggle: true}, {id: 'purchases', label: 'Compras na App Store', value: c.noBuy ? 'Não Permitir' : 'Permitir'}, {label: 'Conteúdo Web', value: 'Limitar Websites para Adultos'}], {back: 'Tempo de Ecrã'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Os websites para adultos estão agora limitados. <strong>Toque em Compras na App Store</strong> para impedir gastos dentro das apps.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'O seu neto Leo vai receber o primeiro telemóvel Android. A app gratuita <strong>Family Link</strong> da Google define limites saudáveis a partir do <strong>seu</strong> telemóvel. <strong>Abra o Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Toque em Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Controlos'}, {id: 'screen-time', label: 'Tempo de ecrã', sub: c.downtime ? 'Hora de deitar 20:00 – 07:00' : 'Sem limites'}, {id: 'content', label: 'Restrições de conteúdo', sub: c.noBuy ? 'As compras precisam da sua aprovação' : 'Google Play: permitir tudo'}, {label: 'Localização', sub: 'Ativada'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Toque em Tempo de ecrã</strong> para definir a hora de deitar, das 20:00 às 07:00, em que o telemóvel bloqueia (as chamadas continuam a funcionar).'},
        {screen: c => list(p, 'Leo', [{caption: 'Controlos'}, {label: 'Tempo de ecrã', sub: 'Hora de deitar 20:00 – 07:00'}, {id: 'content', label: 'Restrições de conteúdo', sub: c.noBuy ? 'As compras precisam da sua aprovação' : 'Google Play: permitir tudo'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'A seguir, impeça gastos surpresa. <strong>Toque em Restrições de conteúdo</strong> para que as compras precisem da sua aprovação.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Tempo de Ecrã' : 'Leo', [{label: p === 'ios' ? 'Tempo de Pausa' : 'Tempo de ecrã', sub: '20:00 – 07:00'}, {label: 'Compras', sub: p === 'ios' ? 'Não Permitir' : 'Precisam da sua aprovação'}]),
         question: {q: 'O que importa mais, a par das definições?', options: [
            {t: 'Conversar com eles: podem sempre contar-lhe se algo online os incomodar', ok: true, why: 'Sim. Nenhuma definição apanha tudo. Ser alguém com quem podem falar é o que mais importa.'},
            {t: 'As definições fazem tudo', why: 'Ajudam muito, mas nada apanha tudo. Garanta que sabem que podem sempre falar consigo.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Tempo de Ecrã' : 'Leo', [{label: 'Tempo de Pausa', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Muito bem!</strong> O Leo tem hora de deitar e não pode gastar dinheiro sem pedir. ' + (p === 'ios' ? 'Defina um código do Tempo de Ecrã para que só você possa alterar estas opções.' : 'O Family Link permite alterar estas opções a partir do seu próprio telemóvel, a qualquer momento.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Explorador de Ficheiros', mac: 'Finder', linux: 'Ficheiros'},
        settings: {windows: 'Definições', mac: 'Definições do Sistema', linux: 'Definições do Sistema'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Gestor de Software'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Iniciar', mac: 'Apps', linux: 'Menu'},
        editor: {windows: 'Bloco de Notas', mac: 'TextEdit', linux: 'Editor de Texto'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Correio', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Gestor de Atualizações', terminal: 'Terminal', trash: 'Reciclagem', apps: 'Apps', chrome: 'Chrome', shield: 'Segurança do Windows', fw: 'Firewall'}[kind]);

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
        windows: {title: 'Reciclagem', empty: 'Esvaziar a Reciclagem', confirm: n => `Tem a certeza de que quer eliminar permanentemente estes ${n} itens?`, items: [
            ['⟦paperclip⟧', 'Assistente do Office (clipe).exe', 'Oferecia ajuda em todas as cartas que alguma vez começou a escrever. Reformado em 2007.', ''],
            ['⟦bomb⟧', 'Melhores pontuações do Minesweeper.txt', 'Principiante: 999 segundos. Não falamos nisso.', ''],
            ['⟦spade⟧', 'Cartas vencedoras do Solitaire.gif', 'Ganhava um jogo e as cartas desciam aos saltos pelo ecrã. Faça duplo clique!', 'cards'],
            ['⟦phone⟧', 'Modem de acesso telefónico.wav', 'Screeech… bong… kssshhh. E ninguém podia usar o telefone enquanto estava online.', ''],
            ['⟦mountain-snow⟧', 'Fundo de ecrã da colina verde.jpg', 'Aquela colina verde ondulante e céu azul, em milhões de ecrãs desde 2001.', ''],
            ['⟦save⟧', 'Disquete (A:)', '1,44 MB. O botão Guardar ainda se parece com uma.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, grátis com o Windows até o Vista o tirar.', ''],
            ['⟦bell-ring⟧', 'Tremor do MSN Messenger', 'Alguém lhe enviou um tremor e o ecrã inteiro abanou. Faça duplo clique!', 'shake'],
            ['⟦file-text⟧', 'Carta à câmara FINAL (2) (final).doc', 'Todos temos uma.', ''],
        ]},
        mac: {title: 'Reciclagem', empty: 'Esvaziar a Reciclagem', confirm: () => 'Tem a certeza de que quer apagar permanentemente os itens da Reciclagem? Não pode anular esta ação.', items: [
            ['⟦rainbow⟧', 'Bola de praia a rodar', 'A roda arco-íris que queria dizer "aguarde, por favor"… e aguarde. Faça duplo clique!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Transparente, em forma de ovo e azul. Todas as escolas tinham um.', ''],
            ['⟦music⟧', 'iPod com roda de cliques', '1000 músicas no bolso. Roda que roda com o polegar.', ''],
            ['⟦smile⟧', 'Happy Mac', 'O pequeno computador sorridente que o recebia em cada arranque.', ''],
            ['⟦bell⟧', 'Som de arranque', 'Aquele grande acorde ao ligar. Muita gente ainda tem saudades dele.', ''],
            ['⟦droplet⟧', 'Botões Aqua', 'Tão brilhantes e azuis que apeteciam lamber.', ''],
            ['⟦calendar-days⟧', 'Widgets do Dashboard', 'Uma calculadora, o tempo e uma nota autocolante numa camada à parte. Desaparecidos desde 2019.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Onde todos gravávamos os nossos CDs e sincronizávamos os iPods.', ''],
        ]},
        linux: {title: 'Reciclagem', empty: 'Esvaziar a Reciclagem', confirm: () => 'Esvaziar todos os itens da Reciclagem? Todos os itens da Reciclagem serão apagados permanentemente.', items: [
            ['⟦bird⟧', 'Tux, o pinguim (de peluche)', 'A mascote do Linux desde 1996. Muito abraçável.', ''],
            ['⟦eye⟧', 'xeyes', 'Um par de olhos que seguem o ponteiro do rato. Faça duplo clique!', 'eyes'],
            ['⟦app-window⟧', 'Janelas trémulas', 'Os antigos efeitos do ambiente de trabalho faziam as janelas tremer como gelatina quando as arrastava. Faça duplo clique!', 'wobble'],
            ['⟦save⟧', 'Disquetes de instalação 1–50', 'O Linux dos primeiros tempos podia precisar de uma caixa inteira de disquetes para instalar.', ''],
            ['⟦disc⟧', 'CD do Ubuntu grátis pelo correio', 'Podia encomendar-se um CD de Linux de graça e chegava pelo correio.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Previsto todos os anos desde cerca de 1999. Talvez seja este?', ''],
            ['⟦leaf⟧', 'Nomes do Mint.txt', 'Cada versão do Linux Mint tem um nome de mulher, como Zena, Xia e Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Uma piada antiga: diga "sudo" e o computador faz o que lhe mandam.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Esta pasta está vazia.' : 'The ' + egg.title + ' está vazia.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Faça duplo clique em algo para espreitar.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Não' : 'Cancelar'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Sim' : 'Vazia'}</button></div></div>` : '';
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
        ['Colina ondulante', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Verde-azulado 95', '#008080'],
        ['Riscas finas', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Céu noturno', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Beira-mar', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'O trocadilho de Wi-Fi mais famoso de todos.'],
        ['The LAN Before Time', 'Uma LAN é uma "rede de área local". Esta é muito, muito antiga.'],
        ['Abraham Linksys', 'Há oitenta e sete megabits…'],
        ['Bill Wi the Science Fi', 'A ciência é o máximo!'],
        ['Drop It Like It\'s Hotspot', 'O ponto de acesso do telemóvel de alguém, com sentido de humor.'],
        ['Silence of the LANs', 'Uma rede muito, muito silenciosa.'],
        ['Tell My Wi-Fi Love Her', 'Ah.'],
        ['Get Off My LAN', 'Provavelmente um vizinho rabugento.'],
        ['Bridlington Seagulls', 'Já lhe levaram as batatas fritas. Não lhes dê também a palavra-passe.'],
        ['FREE WIFI (a sério)', 'Uma rede chamada "free Wi-Fi" que não reconhece é exatamente o tipo de rede a que não se deve ligar!'],
    ];

    const FORTUNES = ['Hoje é um bom dia para fazer cópia de segurança das suas fotografias.', 'Uma palavra-passe forte é uma palavra-passe feliz.', 'Vai receber uma chamada telefónica. Vai ser uma burla. Desligue.',
        'Já experimentou desligar e voltar a ligar?', 'A melhor altura para atualizar foi ontem. A segunda melhor é agora.', 'Uma chávena de chá resolve quase tudo. Computadores é que não.',
        'Nunca dê a palavra-passe a um desconhecido. Nem a uma gaivota.', 'Vai encontrar o comando. Está ao lado do sofá.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">Endereço IP: 192.168.1.42<br>Router: 192.168.1.1<br>Sinal: −54 dBm (muito bom)<br>Canal: 36 (5 GHz)<br>Velocidade: 866 Mbps<br>Segurança: WPA3 Pessoal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">O Wi-Fi está desativado. Ative-o para ver as redes.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Sem internet</strong><br>Experimente verificar o Wi-Fi. Prima <kbd>Espaço</kbd> ou toque para jogar.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>FIM DO JOGO · prima Espaço para jogar de novo</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Já mugiu hoje?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Experimente: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Muu!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Escreveu "sl" em vez de "ls"? Tome lá um comboio a vapor.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | SO: Linux Mint 22.3 (treino) | | | | | | Ambiente: Cinnamon | | | | | | Shell: bash | \\_____/ | Ligado: desde o pequeno-almoço \\___________/ Memória: nunca se esquece de um aniversário`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Está bem. 🥪');
        else if (lc === 'make me a sandwich') say('O quê? Faça-o você.');
        else if (/rm\s+-rf/.test(lc)) say('Boa tentativa! Este terminal de treino não o deixa estragar nada.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: comando não encontrado (experimente "help")`);
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
        else if (note) note.textContent = 'Este navegador de treino não pesquisa na internet verdadeira. Nada do que escrever é enviado para lado nenhum.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Peixe de abril! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Código de batota ativado! +30 vidas 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Bem-vindo ao Macintosh.</p></div><p>Código de batota ativado! +30 vidas 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Código de batota ativado! +30 vidas 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! As outras janelas foram recolhidas.' : 'Aero Shake! (Não havia outras janelas para recolher.)');
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
                funToast(screen, 'O Wi-Fi está ativado. Ligado a Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'O Wi-Fi está desativado.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Ligue-se apenas a redes que conheça.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Peixe de abril! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Ver'], ['', 'Ordenar por'], ['refresh', 'Atualizar'], ['', 'Nova'], ['wall', 'Personalizar']]
                : os === 'mac' ? [['', 'Nova Pasta'], ['', 'Obter Informações'], ['wall', 'Alterar o Fundo do Ecrã…'], ['', 'Usar Pilhas']]
                : [['', 'Criar Nova Pasta'], ['terminal', 'Abrir no Terminal'], ['wall', 'Alterar o Fundo do Ambiente de Trabalho']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Fundo do ecrã: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook de Treino</strong><small>macOS 27 (edição de treino)</small>
                <dl><dt>Chip</dt><dd>Bridlington Silicon B1</dd><dt>Memória</dt><dd>Nunca se esquece de um aniversário</dd><dt>Disco de arranque</dt><dd>HD de Treino</dd><dt>Número de série</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Bloco de Notas' : os === 'mac' ? 'TextEdit' : 'Editor de Texto';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Sem título – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Lin 1, Col 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Texto simples'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Bem-vindo! Este é um terminal de treino. Escreva "help" para ver o que pode experimentar. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Meteorologia'], ['news', '⟦newspaper⟧', 'Notícias'], ['bus', '⟦bus⟧', 'Horários dos autocarros'], ['recipes', '⟦cake-slice⟧', 'Receitas']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Tempo em Bridlington</h3><p class="fd">Previsão de treino</p><div class="ajf">${[['Hoje', '⟦cloud-sun⟧', '13°'], ['Sex', '⟦cloud-rain⟧', '11°'], ['Sáb', '⟦wind⟧', '10°'], ['Dom', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Atividade de gaivotas: <strong>muito alta</strong>. Proteja as suas batatas fritas.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Notícias de Treino</h3><ul class="news">
            <li><strong>Homem local encontra finalmente o comando da TV</strong> ao lado do sofá, ao fim de três semanas.</li>
            <li><strong>Gaivota avistada com um gelado 99 Flake</strong>. Dono do gelado "nada divertido".</li>
            <li><strong>Avó vence neto nas videochamadas</strong>: "Só carreguei no botão verde."</li>
            <li><strong>Estudo conclui que</strong> 9 em cada 10 problemas de computador se resolvem desligando e voltando a ligar.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Horários dos autocarros</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Bolo Victoria</h3><p>Misture 200 g de manteiga, de açúcar e de farinha com fermento com 4 ovos. Leve ao forno em duas formas a 180 °C durante 20–25 minutos. Recheie com doce e creme.</p><p class="fd">Dica: defina um temporizador no telemóvel, ou peça-lhe: "Define um temporizador de 25 minutos".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Novo separador' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Pesquise ou escreva um endereço web'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Cão na praia.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Lista de compras.txt'], ['⟦file-text⟧', 'Carta à câmara.docx'], ['⟦folder⟧', 'Receitas'], ['⟦file-spreadsheet⟧', 'Lista de cartões de Natal.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Fatura do imposto municipal.pdf'], ['⟦file-text⟧', 'Horário dos autocarros.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Banda filarmónica à beira-mar.mp3'], ['⟦music⟧', 'Êxitos dos anos sessenta.mp3']],
    };
    function funFiles(screen, os, folder = 'Imagens', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Reciclagem' : os === 'mac' ? 'Reciclagem' : 'Reciclagem'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Cão na praia.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Ligado a Home-WiFi-5G' : 'O Wi-Fi está desativado.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalização' : os === 'mac' ? 'Fundo do ecrã' : 'Fundos'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Atualização de software' : 'Atualizações'}</h3><p class="mj">⟦check⟧ Está atualizado</p><p class="cf">Última verificação: hoje, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Procurar atualizações</button><p class="zi"></p>`,
            about: `<h3>Acerca de</h3><div class="zk"><div><span>Nome do dispositivo</span><b>MARGARET-TREINO</b></div><div><span>Sistema</span><b>${os === 'windows' ? 'Windows 11 (treino)' : os === 'mac' ? 'macOS 27 (treino)' : 'Linux Mint 22.3 (treino)'}</b></div>
                <div><span>Processador</span><b>Bridlington Silicon B1</b></div><div><span>Memória</span><b>Nunca se esquece de um aniversário</b></div><div><span>Armazenamento</span><b>Muito espaço para fotografias dos netos</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalização' : os === 'mac' ? 'Fundo do ecrã' : 'Fundos'], ['update', 'Atualizações'], ['about', 'Acerca']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Minas de Treino', 'O clássico jogo de caça às minas.'], ['solitaire', '⟦spade⟧', 'Paciência', 'Em breve nesta loja de treino.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Em breve nesta loja de treino.'], ['weather', '⟦cloud-sun⟧', 'Meteorologia', 'Em breve nesta loja de treino.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Abrir' : (os === 'mac' ? 'Obter' : 'Instalar')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Minas de Treino', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Clique para escavar. Clique com o botão direito (ou mantenha premido) para colocar uma bandeira.</p></div>`, 'bz'));
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
        ['Mãe', 'Como é que se desliga isto?', 'Olá, meu querido, escrevi este email mas não encontro o botão de desligar. É o redondo? Beijinhos, Mãe xx P.S. Já carreguei nele. Não aconteceu nada. Está certo?'],
        ['Bridlington Walkers', 'O passeio de sábado', 'Encontro no porto às 10:00. Tragam uma garrafa térmica e um impermeável. O incidente das gaivotas da semana passada não será discutido.'],
        ['Príncipe Abu (Muito Rico)', 'URGENTE: ganhou 4.000.000 £!!!', 'Querido Amigo, sou um príncipe e preciso dos seus dados bancários para lhe enviar quatro milhões de libras. Envie também 50 £ para o selo. — Isto é uma burla! Pessoas verdadeiras não dão milhões por email. Apague-o, ou reencaminhe-o para report@phishing.gov.uk.'],
        ['Sarah', 'Fotografias de domingo 🌻', 'Aqui estão as fotografias do jardim. O cão comeu mais um girassol.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Correio', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Este é um computador de treino, por isso não se pode desligar 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Transferências', '⟦triangle-alert⟧ Os programas de "limpeza gratuita" costumam ser lixo ou pior. O melhor é apagá-lo, não abri-lo!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `"${n}" abrir-se-ia aqui num computador a sério.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'O Wi-Fi está ativado.' : 'O Wi-Fi está desativado.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'A procurar atualizações…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Sem novas atualizações. Está tudo em dia!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Este é só de enfeite na loja de treino.'); return true; }
            el.textContent = 'A instalar…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Abrir'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Sem título 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Ficheiro Editar Ver Inserir Formatar <b>N</b> <i>I</i> <u>S</u></div><textarea class="vk agd" aria-label="Document">Exmo. Senhor ou Exma. Senhora, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Gestor de Atualizações', '<div class="ajz"><p class="mj">⟦check⟧ O sistema está atualizado</p><p class="cf">O Linux Mint verifica as atualizações sozinho e mostra um ponto no escudo quando há alguma.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Escreva aqui para pesquisar</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Reciclagem', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Computador', '⟦monitor⟧')}${icon('Casa', '⟦house⟧')}${icon('Reciclagem', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Pesquisar apps, definições e documentos')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Pesquisar')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Escreva para pesquisar…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Novo separador <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Pesquise ou escreva um endereço web</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Este é o <strong>ambiente de trabalho</strong>. A barra ao longo da parte de baixo é a <strong>barra de tarefas</strong>. Abra o navegador a partir do menu Iniciar: <strong>clique em Iniciar</strong>, os quatro quadrados.'
            : os === 'mac' ? 'Este é o <strong>ambiente de trabalho</strong>. A fila de apps em baixo é a <strong>Dock</strong>, e a barra ao longo do topo é a <strong>barra de menus</strong>. <strong>Clique em Apps</strong> (a grelha de quadrados) para ver todas as suas apps.'
            : 'Este é o <strong>ambiente de trabalho</strong> no Linux Mint. A barra ao longo da parte de baixo é o <strong>painel</strong>. As suas apps estão no Menu: <strong>clique em Menu</strong>, em baixo à esquerda.',
         hint: os === 'mac' ? 'As Apps estão na Dock em baixo, junto ao Finder.' : (os === 'windows' ? 'Iniciar são os quatro quadrados azuis na barra de tarefas.' : 'O botão Menu fica no extremo esquerdo do painel de baixo.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Clique em ${N.browser[os]}</strong>, o navegador.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Cada janela tem três botões coloridos no <strong>canto superior esquerdo</strong>. O amarelo recolhe a janela. <strong>Clique no botão amarelo.</strong>'
            : 'Cada janela tem três botões no <strong>canto superior direito</strong>. A linha <strong>—</strong> recolhe a janela (minimizar). <strong>Clique em —</strong>.',
         hints: {'win-close': 'Isso fecha-a. Primeiro, recolha-a com o ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Isso faz com que ocupe o ecrã todo. Primeiro, recolha-a.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Está escondida, não fechada. O ${os === 'mac' ? 'ponto por baixo do ícone na Dock' : 'line under its icon'} mostra que continua aberta. <strong>Clique no ícone ${N.browser[os]}</strong> para a trazer de volta.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Agora faça-a ocupar o ecrã todo: <strong>clique no botão ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Num Mac, o botão vermelho fecha a janela. Mas a app pode continuar a funcionar. Como a fecha por completo?', options: [
                {t: 'Prima ⟦command⟧ Cmd + Q, ou escolha Sair no menu da app, no topo', ok: true, why: 'Sim. Um ponto por baixo de uma app na Dock significa que ainda está a funcionar. ⟦command⟧ Cmd + Q fecha-a.'},
                {t: 'Clicar duas vezes no botão vermelho', why: 'O botão vermelho só fecha janelas. ⟦command⟧ Cmd + Q (ou o menu da app > Sair) fecha a app.'}]}
            : {q: 'Onde fica o botão de fechar numa janela?', options: [
                {t: 'Canto superior direito: o ⟦x⟧', ok: true, why: 'Sim. No Windows e no Linux Mint, os três botões ficam no canto superior direito. (Num Mac ficam no canto superior esquerdo, a vermelho, amarelo e verde.)'},
                {t: 'Canto inferior esquerdo', why: 'Fica no canto superior direito de todas as janelas: o ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Muito bem!</strong> Sabe abrir, esconder, trazer de volta, aumentar e fechar janelas. É a maior parte de usar um computador.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Casa' : 'Casa'], ['desktop', 'Ambiente de Trabalho'], ['documents', 'Documentos'], ['downloads', 'Transferências'], ['pictures', 'Imagens']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ Pen USB']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Documentos'], ['pictures', '⟦folder⟧', 'Imagens'], ['downloads', '⟦folder⟧', 'Transferências']],
            downloads: [['photo', '⟦image⟧', 'Fotografia de férias.jpg'], ['bill', '⟦file-text⟧', 'Fatura do imposto municipal.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Fotografia de férias.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Férias')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Carta à câmara.docx'], ['recipes', '⟦folder⟧', 'Receitas']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Documentos']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Nova pasta', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Casa' : 'Casa', downloads: 'Transferências', pictures: 'Imagens', documents: 'Documentos', usb: 'Pen USB', desktop: 'Ambiente de Trabalho'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Esta pasta está vazia</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Copiar' : 'Copiar';
    const pasteLabel = os => os === 'mac' ? 'Colar Item' : 'Colar';
    const newFolderLabel = os => os === 'mac' ? 'Nova Pasta' : os === 'windows' ? 'Novo > Pasta' : 'Criar Nova Pasta';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `As suas fotografias e cartas ficam guardadas em <strong>pastas</strong>. <strong>Clique em ${N.files[os]}</strong> para as ver.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'à esquerda da Dock' : 'na ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Ao lado ficam as suas pastas principais. O que descarrega de emails e de sites vai para as <strong>Transferências</strong>. <strong>Clique em Transferências.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Abrir'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Mudar o nome'], ['menu-delete', os === 'mac' ? 'Mover para a Reciclagem' : 'Apagar']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Vamos copiar a fotografia de férias para as Imagens, que é o seu lugar. <strong>Clique com o botão direito</strong> em <strong>Fotografia de férias.jpg</strong>: prima o botão <strong>direito</strong> do rato. <em>' + (os === 'mac' ? 'Num trackpad, clique com dois dedos.' : 'Num ecrã tátil, mantenha premido.') + '</em>',
         hint: 'Use o botão direito do rato na fotografia.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Aparece um menu. <strong>Clique em ${copyLabel(os)}.</strong> <em>(O atalho é ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Essa não! Clique em Copiar.', 'menu-open': 'Isso abre a fotografia. Clique em Copiar.', 'menu-rename': 'Clique em Copiar.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Clique em Imagens</strong> à esquerda.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'As Imagens estão vazias. <strong>Clique com o botão direito no espaço branco vazio.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Clique em ${pasteLabel(os)}.</strong> <em>(Ou ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Vamos criar uma pasta a seguir. Primeiro, clique em ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'A fotografia está agora também nas Imagens. Agora crie uma pasta para guardar as fotografias de férias juntas. <strong>Clique com o botão direito outra vez no espaço vazio.</strong>', hints: {'rc-photo2': 'Clique com o botão direito no espaço vazio, não na fotografia.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Clique em ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Escreva primeiro um nome para a pasta, como Férias.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Escreva um nome</strong>, como <strong>Férias</strong>, e depois <strong>clique em OK</strong> (ou prima Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Onde costumam ir parar os ficheiros de emails e de sites?', options: [
            {t: 'Na pasta Transferências', ok: true, why: 'Sim. Se não encontrar algo que descarregou, procure primeiro nas Transferências.'},
            {t: 'No ambiente de trabalho', why: 'Normalmente nas Transferências. Procure aí primeiro se não encontrar alguma coisa.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Muito bem!</strong> O clique com o botão direito é o segredo para a maior parte das coisas: copiar, colar, mudar o nome e criar pasta estão todos nesse menu.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Introduza a palavra-passe da rede</p>${field('wifipass', 'Palavra-passe', ctx)}<button type="button" class="ce co" data-tap="connect">Ligar</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Redes Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Ligado a Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Para se ligar ao Wi-Fi, <strong>clique no símbolo do Wi-Fi</strong> ${os === 'mac' ? 'no canto superior direito do ecrã' : 'em baixo à direita, perto do relógio'}.`, hint: os === 'mac' ? 'Está na barra de menus, em cima à direita.' : 'Está perto do relógio, em baixo à direita.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'O nome da sua rede está no autocolante do router. Esta rede de treino é a <strong>Home-WiFi-5G</strong>. <strong>Clique nela.</strong>', hints: {'net-neighbour': 'Essa é a do vizinho! Escolha Home-WiFi-5G.', 'net-cafe': 'Essa não é a de sua casa. Escolha Home-WiFi-5G.', 'tray-wifi': 'A lista de redes Wi-Fi já está aberta. Clique em Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Escreva a palavra-passe exatamente: Green-Apple-42 (G e A maiúsculos).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Escreva a palavra-passe do autocolante <strong>exatamente</strong>: <strong>Green-Apple-42</strong>. Depois <strong>clique em Ligar</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'O painel do Wi-Fi já está aberto. Escreva a palavra-passe na caixa e depois clique em Ligar.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Está num café com Wi-Fi gratuito. Pode usá-lo para o banco online?', options: [
            {t: 'Melhor esperar até chegar a casa, ou usar os dados móveis do telemóvel', ok: true, why: 'Sim. O Wi-Fi gratuito serve para navegar, mas para o banco use o Wi-Fi de casa ou os dados móveis.'},
            {t: 'Sim, qualquer Wi-Fi serve', why: 'O Wi-Fi público gratuito serve para navegar, mas guarde o banco para casa ou para os dados móveis.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Muito bem!</strong> O computador vai memorizar a palavra-passe e ligar-se sozinho da próxima vez.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Lista de compras: leite, pão, ovos, saquetas de chá, cartão de aniversário para a Jean';
        const note = pcWin(os, `Lista de compras – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Novo email para a Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Clique aqui para escrever…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Correio' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Os atalhos de teclado poupam muitos cliques. <strong>${CMDL(os)}</strong> é a tecla ${os === 'mac' ? 'de cada lado da barra de espaço, marcada com ⟦command⟧' : 'no canto inferior esquerdo do teclado'}. Para selecionar todo o texto, mantenha premida <strong>${CMDL(os)}</strong> e carregue em <strong>A</strong>. <em>Use o teclado a sério ou os botões no ecrã.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Está realçado. Agora copie: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Copiado! <strong>Clique dentro do email</strong> para a Sarah, onde diz "Clique aqui para escrever".'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Agora cole: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Ups, apagou algo por engano. Que atalho o desfaz?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Sim. ${CMDL(os)} + Z desfaz a última coisa que fez, em quase todas as apps. Carregue outra vez para desfazer mais.`},
            {t: 'Escape', why: `Escape fecha menus. ${CMDL(os)} + Z é desfazer.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Como se tira uma captura de ecrã (uma fotografia do ecrã)?', options: [
            {t: os === 'windows' ? 'Tecla Windows + Shift + S e depois arrastar sobre o que quer' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4 e depois arrastar sobre o que quer' : 'Premir a tecla Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Sim. Fica copiada e uma notificação deixa-o guardá-la. A tecla Print Screen também funciona.' : os === 'mac' ? 'Sim. A imagem fica guardada no ambiente de trabalho. Shift + ⟦command⟧ Cmd + 3 captura o ecrã todo.' : 'Sim. O Linux Mint guarda-a na pasta Imagens. Shift + Print Screen deixa-o escolher uma área.'},
            {t: 'Fotografar o ecrã com o telemóvel', why: 'Funciona, mas uma captura de ecrã é muito mais nítida. ' + (os === 'windows' ? 'Tecla Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Prima Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Muito bem!</strong> Os quatro grandes: <strong>${CMDL(os)} + C</strong> copiar, <strong>V</strong> colar, <strong>Z</strong> desfazer, <strong>A</strong> selecionar tudo. Funcionam em quase todas as apps.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Gratuito', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Grátis · Compras na app', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Pesquisar apps</span></button><div class="hp"><span>EM DESTAQUE</span><strong>Apps para o seu computador novo</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Abrir' : (os === 'mac' ? 'Obter' : 'Instalar')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">A instalar o LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Loja de treino: os nomes e os preços são exemplos.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `O sítio mais seguro para obter apps é a loja integrada: <strong>${N.store[os]}</strong>. <strong>Clique nela.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Quer algo para escrever cartas, como o Word. <strong>Clique na caixa de pesquisa.</strong> Vamos pesquisar "office".'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: 'O <strong>LibreOffice</strong> é uma alternativa gratuita ao Microsoft Office, criada pela <strong>The Document Foundation</strong>. Veja quem a criou e depois <strong>clique em ' + (os === 'mac' ? 'Obter' : 'Instalar') + ' junto ao LibreOffice</strong>.',
         hints: {'get-fake1': 'Essa é um anúncio e custa 29,99 £ por ano. O LibreOffice é gratuito.', 'get-fake2': 'Essa é da AppMakers e tem compras na app. Escolha o LibreOffice, da The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Uma janela de um site diz "O seu PC está lento! Descarregue já o Speed Booster". O que faz?', options: [
            {t: 'Fecho-a. Só instalo apps da loja ou do site do próprio criador', ok: true, why: 'Exatamente. As janelas que oferecem "aceleradores" ou "limpadores" costumam ser lixo ou pior.'},
            {t: 'Descarrego, pode ajudar', why: 'Costumam ser lixo ou prejudiciais. Instale apenas da loja ou do site do próprio criador.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Muito bem!</strong> O LibreOffice está instalado. Verifique o criador, ignore os anúncios e desconfie de apps "grátis" que mais tarde pedem dinheiro.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Casa'], ['system', 'Sistema'], ['bluetooth', 'Bluetooth e dispositivos'], ['network', 'Rede e Internet'], ['accounts', 'Contas'], ['privacy', 'Privacidade e segurança'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Início</h3><p class="cf">Definições recomendadas e a sua conta.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Está atualizado</p>' : ctx.ready ? `<p class="cf">É necessário reiniciar para concluir a instalação das atualizações.</p><button type="button" class="ce co bz" data-tap="restart">Reiniciar agora</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'A descarregar… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Definições', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Geral'], ['privacy', 'Privacidade e Segurança'], ['users', 'Utilizadores e Grupos']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ O Mac está atualizado</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'A descarregar… faltam cerca de 10 minutos' : 'Correções de segurança e de erros'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Privacidade e Segurança</h3><p class="cf"><strong>Segurança</strong><br>Permitir aplicações de:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store e programadores conhecidos</button>`,
            };
            return pcWin(os, 'Definições do Sistema', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Definições do Sistema</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Gestor de Atualizações', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ O sistema está atualizado</p>' : `<div class="ahf">${['Navegador web Firefox', 'Kernel do Linux (segurança)', 'LibreOffice', 'Bibliotecas do sistema'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">A instalar atualizações…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Autenticação necessária</strong></p><p class="fd">Introduza a palavra-passe para instalar atualizações. (Treino: já preenchida.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Cancelar</button><button type="button" class="adg" data-tap="auth-ok">Autenticar</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'As atualizações corrigem falhas de segurança que os burlões aproveitam. Vamos ver se há. <strong>Clique em Iniciar.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Clique em Definições</strong> (a roda dentada).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Clique em Windows Update</strong>, no fundo da lista à esquerda.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Há atualizações à espera. <strong>Clique em Descarregar e instalar tudo.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Guarde primeiro tudo o que estiver a fazer e depois <strong>clique em Reiniciar agora</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'As atualizações corrigem falhas de segurança que os burlões aproveitam. <strong>Clique no menu Apple</strong> (o logótipo) no canto superior esquerdo.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Clique em Definições do Sistema…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Está em Geral. <strong>Clique em Atualização de Software.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Há uma atualização pronta. Ligue o carregador e depois <strong>clique em Atualizar Agora</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'O Mac descarrega-a e depois reinicia para a instalar.',
         question: {q: 'As atualizações automáticas estão ativadas. Ainda precisa de fazer alguma coisa?', options: [
            {t: 'Só reiniciar quando pedir, e deixá-lo ligado à corrente durante a noite de vez em quando', ok: true, why: 'Sim. As atualizações costumam instalar-se durante a noite. Reiniciar quando pedido conclui-as.'},
            {t: 'Desativar as atualizações automáticas', why: 'Mantenha-as ativadas: protegem-no. Basta reiniciar quando o Mac pedir.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'As atualizações corrigem falhas de segurança. No Linux Mint, o <strong>escudo</strong> perto do relógio mostra um ponto quando há atualizações à espera. <strong>Clique no escudo.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'O Gestor de Atualizações lista-as todas. <strong>Clique em Instalar Atualizações.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'O Linux pede <strong>a sua palavra-passe</strong> antes de alterar algo importante. É bom sinal. <strong>Clique em Autenticar.</strong>', hints: {'auth-cancel': 'Isso cancela as atualizações. Clique em Autenticar.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Com que frequência deve instalar atualizações?', options: [
            {t: 'Sempre que o escudo mostrar um ponto: só demora um minuto', ok: true, why: 'Sim. O Linux Mint raramente precisa de reiniciar, exceto em algumas atualizações de segurança.'},
            {t: 'Uma vez por ano', why: 'Instale-as sempre que o escudo mostrar um ponto. Só demora um minuto.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Muito bem!</strong> O computador está atualizado. Mantê-lo atualizado é a melhor coisa que pode fazer para se manter seguro.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistema', 'Ecrã, som, informações do sistema'], ['tile-devices', '⟦printer⟧', 'Dispositivos', 'Bluetooth, impressoras'], ['tile-network', '⟦globe⟧', 'Rede e Internet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Contas', 'As suas contas'], ['tile-update', '⟦refresh-cw⟧', 'Atualização e Segurança', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ O PC está inscrito nas Atualizações de Segurança Alargadas</p><p class="cf">Atualizações de segurança até 12 de outubro de 2027.</p>' : `<div class="ahg"><strong>O suporte do Windows 10 terminou</strong><p>O PC não cumpre os requisitos para executar o Windows 11. Inscreva-se nas Atualizações de Segurança Alargadas para continuar a receber atualizações de segurança.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Inscrever agora</button></div>`}`;
        else inner = `<h3>Atualizações de Segurança Alargadas</h3><p class="cf">Escolha como se inscrever:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Fazer cópia de segurança das definições do PC</strong><small>Gratuito, com uma conta Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Usar 1000 pontos Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Compra única</strong><small>Pago</small></button>${ctx.busy ? '<p class="cf">A inscrever…</p>' : ''}`;
        return pcWin('windows', 'Definições', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Se o computador se parece com isto, com o Iniciar no extremo esquerdo, pode ser o <strong>Windows 10</strong>. Vamos ver. <strong>Clique em Iniciar.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Clique em Definições</strong> (a roda dentada).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Clique em Sistema.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Diz Windows 10 Home. O que significa isso em 2026?', options: [
            {t: 'A Microsoft deixou o suporte normal em outubro de 2025. Ainda funciona, mas precisa das Atualizações de Segurança Alargadas para se manter seguro', ok: true,
             why: 'Sim. O programa gratuito de Atualizações de Segurança Alargadas para utilizadores domésticos dura agora até 12 de outubro de 2027. Depois disso, o Windows 10 não recebe mais correções de segurança.'},
            {t: 'Nada, o Windows 10 vai ser atualizado para sempre', why: 'O suporte normal terminou em outubro de 2025. As Atualizações de Segurança Alargadas duram agora até 12 de outubro de 2027 e depois acabam.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Clique em ← Início</strong> para voltar atrás.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Clique em Atualização e Segurança.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Este portátil é demasiado antigo para o Windows 11, por isso o Windows oferece as <strong>Atualizações de Segurança Alargadas</strong>. <strong>Clique em Inscrever agora.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'A forma gratuita é fazer cópia de segurança das definições para uma conta Microsoft. <strong>Clique em Fazer cópia de segurança das definições do PC.</strong>', hints: {'esu-buy': 'Não precisa de pagar. Escolha a opção gratuita de cópia de segurança.', 'esu-points': 'Funciona se tiver os pontos, mas a opção de cópia de segurança é gratuita para todos.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Que opções tem antes de outubro de 2027?', options: [
            {t: 'Passar para o Windows 11 se puder, comprar um computador novo, ou mudar um mais antigo para o Linux Mint (gratuito)', ok: true, why: 'Sim. O Linux Mint é gratuito e funciona bem em portáteis mais antigos. As próximas lições mostram onde ficam as coisas num Mac e no Linux Mint.'},
            {t: 'Continuar a usar o Windows 10 depois de 2027 para o banco', why: 'Depois de outubro de 2027 não recebe correções de segurança, por isso não é seguro para o banco. Atualize, substitua ou mude para o Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Muito bem!</strong> Sabe qual Windows tem e como o manter seguro até outubro de 2027. Cuidado com chamadas ou janelas que se oferecem para o "atualizar" mediante pagamento: são burlas.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Vem do Windows? Num Mac, as apps ficam na <strong>Dock</strong> em baixo, e os menus de cada app ficam na <strong>barra de menus</strong> no topo. <strong>Clique em Safari</strong>, o navegador, na Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Os botões da janela ficam no <strong>canto superior esquerdo</strong> num Mac. <strong>Clique no vermelho</strong> para fechar a janela.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'A janela desapareceu, mas vê o <strong>ponto por baixo do Safari</strong> na Dock? Ainda está a funcionar. Para o fechar, <strong>clique com o botão direito no Safari na Dock</strong> (dois dedos num trackpad).', hint: 'Clique com o botão direito (ou com dois dedos) no ícone do Safari na Dock.',
         hints: {'app-browser': 'Um clique normal abre-o outra vez. Clique antes com o botão direito.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Clique em Sair.</strong> <em>(O atalho é ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'As definições ficam no <strong>menu Apple</strong> (o logótipo) no canto superior esquerdo. <strong>Clique nele.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Desligar e Reiniciar também estão aqui. <strong>Clique em Definições do Sistema…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'No Windows copia-se com Ctrl + C. E num Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Sim. A maioria dos atalhos do Windows usa ⟦command⟧ Cmd num Mac em vez de Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, o mesmo', why: 'Num Mac é ⟦command⟧ Cmd + C. A maioria dos atalhos com Ctrl passa a usar ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Muito bem!</strong> Dock em baixo, menus em cima, botões da janela em cima à esquerda, ⟦command⟧ Cmd em vez de Ctrl, e o menu Apple para as definições e para desligar.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: 'O <strong>Linux Mint</strong> é um sistema gratuito que funciona muito como o Windows, e corre bem em computadores mais antigos. As apps estão no <strong>Menu</strong>, em baixo à esquerda, como o botão Iniciar. <strong>Clique em Menu.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'O Linux Mint já vem com apps gratuitas instaladas. Para cartas, use o <strong>LibreOffice Writer</strong>, que funciona como o Microsoft Word. <strong>Clique nele.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Sem título 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Ficheiro Editar Ver Inserir Formatar <b>N</b> <i>I</i> <u>S</u></div><div class="vk">Exmo. Senhor ou Exma. Senhora,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Consegue abrir os documentos Word que lhe enviam por email?', options: [
            {t: 'Sim. O LibreOffice abre e guarda ficheiros Word (.docx)', ok: true, why: 'Sim. Ao guardar algo para enviar a quem usa o Word, escolha o formato Word (.docx) em Guardar Como.'},
            {t: 'Não, para isso é preciso o Windows', why: 'O LibreOffice abre e guarda ficheiros Word (.docx), por isso pode trocar documentos com quem usa o Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Sem título 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Exmo. Senhor ou Exma. Senhora,</div></div>', {max: true})}),
         target: 'win-close', say: 'Os botões da janela ficam no canto superior direito, tal como no Windows. <strong>Clique em ⟦x⟧</strong> para fechar o Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Agora vamos ver onde obter mais apps. <strong>Clique outra vez em Menu</strong>.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: 'O <strong>Gestor de Software</strong> é a loja de apps gratuita do Linux Mint. <strong>Clique nele.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Gestor de Software', `<div class="jo"><div class="gq">${ICON.search}<span>Pesquisar</span></div>
            <div class="aan">${['Internet', 'Escritório', 'Gráficos', 'Som e vídeo', 'Jogos', 'Acessibilidade'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Milhares de apps gratuitas, verificadas pelo Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'É preciso comprar antivírus para o Linux Mint?', options: [
            {t: 'Não. Mantenha-o atualizado, obtenha as apps no Gestor de Software e fica bem protegido', ok: true, why: 'Não é preciso. O Linux tem poucos vírus. As atualizações e a firewall integrada fazem o trabalho. As burlas de emails e sites continuam a aplicar-se, por isso mantenha-se atento.'},
            {t: 'Sim, o mais caro', why: 'Não. Mantenha-o atualizado e obtenha as apps no Gestor de Software. Cuidado com as burlas de emails e sites, como sempre.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Muito bem!</strong> Menu em baixo à esquerda, fechar em cima à direita, LibreOffice para documentos, Firefox para a web, Gestor de Software para apps e o escudo para atualizações.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ Pen USB ligada</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Antes de trocar de computador, copie os ficheiros para uma <strong>pen USB</strong>. Enfie-a numa ranhura USB do lado do computador. Aqui, <strong>clique em Ligar a pen USB</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ Pen USB ligada</div>'}), target: 'app-files', say: `<strong>Abra ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Abrir'], ['menu-copy', 'Copiar'], ['menu-rename', 'Mudar o nome']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'As suas cartas estão em <strong>Documentos</strong>. <strong>Clique com o botão direito na pasta Documentos.</strong> <em>(Faça o mesmo às Imagens depois.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Clique em Copiar.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'A pen USB está à esquerda. <strong>Clique em Pen USB.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Está vazia. <strong>Clique com o botão direito no espaço vazio.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Clique em ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'A copiar 214 itens… falta 1 minuto' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Ejetar']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Pronto! Antes de tirar a pen, <strong>ejete-a</strong> para não estragar nada. <strong>Clique com o botão direito em Pen USB</strong> à esquerda.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Clique em Ejetar.</strong> Depois já pode retirá-la em segurança.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Outra forma de passar ficheiros para um computador novo?', options: [
            {t: 'Armazenamento online: OneDrive, iCloud ou Google Drive', ok: true, why: 'Sim. Carregue a partir do computador antigo, inicie sessão no novo e estão lá. Uma pen USB também é uma boa cópia extra.'},
            {t: 'Enviar todos os ficheiros por email para si, um a um', why: 'Isso demoraria uma eternidade! Use uma pen USB ou armazenamento online como o OneDrive, o iCloud ou o Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Muito bem!</strong> No computador novo, ligue a pen, abra-a e copie as pastas para os Documentos e as Imagens.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Horários dos autocarros de Bridlington ⟦star⟧ Receitas</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Sem sessão iniciada</span><button type="button" data-tap="sync">Ativar a sincronização…</button><button type="button" data-tap="guest">Abrir perfil de convidado</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Iniciar sessão com o Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Treino: já preenchida.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Seguinte</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Ativar a sincronização?</strong></p><p class="fd">Os seus marcadores, palavras-passe e histórico serão guardados na Conta Google e aparecerão em todos os seus dispositivos.</p><div class="jn"><button type="button" data-tap="cancel">Cancelar</button><button type="button" class="adg" data-tap="yes-in">Sim, quero</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Novo separador</span>${profile}</div><div class="qn">⟦search⟧ Pesquise no Google ou escreva um URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">A sincronizar os seus marcadores…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Se usava o <strong>Chrome</strong> no computador antigo, iniciar sessão traz os marcadores e as palavras-passe guardadas para o novo. (O Firefox e o Edge funcionam da mesma forma.) <strong>Clique em Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Clique no ícone da pessoa</strong> no canto superior direito.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Clique em Ativar a sincronização…</strong>', hints: {guest: 'Um perfil de convidado não guarda nada. Clique em Ativar a sincronização.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Inicie sessão com a <strong>mesma conta Google</strong> que usava no computador antigo. <strong>Clique em Seguinte.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Clique em Sim, quero.</strong>', hints: {cancel: 'Isso pára a sincronização. Clique em Sim, quero.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Os marcadores voltaram. É seguro guardar palavras-passe no navegador?', options: [
            {t: 'Sim, se a conta Google tiver uma palavra-passe forte e verificação em 2 passos', ok: true, why: 'Sim. É muito mais seguro do que reutilizar uma só palavra-passe em todo o lado. Proteja a própria conta com a verificação em 2 passos.'},
            {t: 'Não, escrevê-las num post-it colado no ecrã', why: 'Um gestor de palavras-passe do navegador é muito mais seguro do que uma nota no ecrã, desde que a conta tenha verificação em 2 passos.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Muito bem!</strong> Os marcadores e as palavras-passe seguiram-no. Num computador público ou partilhado, não ative a sincronização.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistema'} Alerta de Segurança ⚠️</strong>
            <p>O seu computador está INFETADO com 5 vírus! Os seus dados bancários e fotografias estão em risco.</p><p>Não desligue o computador. Ligue já para o apoio:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Ligar agora</button><button type="button" data-tap="fake-close">Fechar</button></div>
            <small>(Página de burla de treino. O número não é verdadeiro.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Sair do site?</strong></p><p class="fd">As alterações que fez podem não ser guardadas.</p><div class="jn"><button type="button" data-tap="stay">Ficar</button><button type="button" class="adg" data-tap="leave">Sair</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Isto encheu-lhe o ecrã de repente enquanto navegava. É verdadeiro?', options: [
            {t: 'Não. É um site falso a tentar assustá-lo para ligar a burlões', ok: true, why: 'Exatamente. Os avisos verdadeiros nunca mostram um número de telefone para ligar. Não ligue e não clique em nada na página.'},
            {t: 'Sim, ligo depressa para o número', why: 'Nunca ligue. É uma página falsa. As pessoas do "apoio" vão tentar tomar o controlo do seu computador e do seu dinheiro.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Ocupou o ecrã todo para não ver como a fechar. Prima a tecla <strong>Esc</strong> (em cima, à esquerda do teclado) para sair do ecrã inteiro.',
         hints: {'call-btn': 'Nunca! Prima a tecla Esc.', 'fake-close': 'Os botões da página podem ser armadilhas. Prima antes a tecla Esc do teclado.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Agora já vê o navegador. <strong>Feche o separador</strong> com o ⟦x⟧.',
         hints: {'call-btn': 'Não clique em nada na página. Feche o separador com o ⟦x⟧.', 'fake-close': 'Isso faz parte da página de burla. Use o ⟦x⟧ do próprio separador.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Tenta mantê-lo lá. <strong>Clique em Sair.</strong>', hints: {stay: 'Clique em Sair.'}},
        {screen: c => scareware(os, c), question: {q: 'E se não fechar de maneira nenhuma?', options: [
            {t: os === 'windows' ? 'Premir Ctrl + Shift + Esc para abrir o Gestor de Tarefas, escolher o navegador e clicar em Terminar tarefa' : os === 'mac' ? 'Premir ⟦command⟧ Cmd + Option + Esc e Forçar a Saída do navegador' : 'Clicar com o botão direito no navegador no painel e escolher Fechar, ou reiniciar o computador',
             ok: true, why: 'Sim. Quando voltar a abrir o navegador, não deixe que restaure as páginas antigas. Reiniciar o computador também funciona.'},
            {t: 'Ligar para o número para pedir ajuda a fechá-lo', why: 'Nunca ligue. ' + (os === 'windows' ? 'Use Ctrl + Shift + Esc (Gestor de Tarefas) para fechar o navegador.' : os === 'mac' ? 'Use ⟦command⟧ Cmd + Option + Esc para Forçar a Saída.' : 'Feche o navegador a partir do painel, ou reinicie.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Muito bem!</strong> O computador nunca esteve infetado: era só uma página web. Se chegou a ligar para um número destes, contacte o banco e mude as palavras-passe a partir de outro dispositivo.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Segurança do Windows', `<div class="aif"><h3>Proteção contra vírus e ameaças</h3><p class="mj">⟦check⟧ Sem ameaças atuais</p>
                <p class="cf">Última análise: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Análise rápida em curso… 12.840 ficheiros analisados</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Proteção antivírus</span><span>⟦check⟧ Firewall</span><span>⟦check⟧ Controlo de aplicações e do navegador</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Configuração da Firewall', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ A Firewall está ativada</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'O Windows tem um antivírus gratuito integrado, chamado <strong>Segurança do Windows</strong>. Vamos ver se está a funcionar. <strong>Clique em Iniciar.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Clique em Definições.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Clique em Privacidade e segurança</strong> à esquerda.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Clique em Segurança do Windows.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Os vistos verdes significam que está protegido. Para ficar descansado, <strong>clique em Análise rápida</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Precisa de pagar por outro antivírus além deste?', options: [
            {t: 'Não. A Segurança do Windows chega para a maioria das pessoas, e dois podem abrandar o computador', ok: true, why: 'Certo. Mantenha o Windows atualizado e a Segurança do Windows ativada. Os pagos muitas vezes só acrescentam janelas e subscrições.'},
            {t: 'Sim, quantos mais melhor', why: 'Dois programas antivírus podem chocar e abrandar tudo. A Segurança do Windows chega para a maioria das pessoas.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Os Macs têm proteção gratuita integrada que verifica apps e ficheiros em segundo plano. Vamos ver uma definição. <strong>Clique no menu Apple</strong> (o logótipo).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Clique em Definições do Sistema…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Clique em Privacidade e Segurança</strong> à esquerda.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Está escolhido "Permitir aplicações da App Store e de programadores conhecidos". Deve mudar isso?', options: [
            {t: 'Não, deixe como está. Bloqueia apps de criadores desconhecidos', ok: true, why: 'Certo. Se um site lhe diz para mudar isto para instalar alguma coisa, é um grande sinal de alerta.'},
            {t: 'Sim, permitir apps de qualquer origem', why: 'Deixe como está. Impede apps de criadores desconhecidos. Um site que lhe diga para mudar isto é um sinal de alerta.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Definições do Sistema', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'É preciso comprar antivírus para um Mac?', options: [
            {t: 'A maioria das pessoas não precisa. Mantenha-o atualizado e instale apps só de sítios de confiança', ok: true, why: 'Não é preciso. As atualizações e a proteção integrada fazem o trabalho. Janelas a dizer que o Mac está infetado são burlas.'},
            {t: 'Sim, seja qual for a janela que o oferecer', why: 'As janelas que oferecem antivírus para Mac costumam ser burlas. Mantenha antes o Mac atualizado.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'O Linux Mint tem uma <strong>firewall</strong> integrada, que bloqueia ligações indesejadas. Está desativada até a ativar. <strong>Clique em Menu.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Clique em Firewall.</strong> <em>(Pesquise "firewall" no Menu se não a vir.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Clique no interruptor Estado</strong> para ativar a firewall.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'O que mais mantém o Linux Mint seguro?', options: [
            {t: 'Instalar atualizações quando o escudo mostra um ponto, e obter apps no Gestor de Software', ok: true, why: 'Certo. E as regras habituais: cuidado com ligações de emails e janelas.'},
            {t: 'Não é preciso mais nada', why: 'Continue a instalar atualizações e a obter apps no Gestor de Software. As burlas de emails e sites continuam a aplicar-se.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Muito bem!</strong> A proteção integrada do computador está ativada. Atualizações, cuidado com as ligações e instalar só de sítios de confiança fazem o resto.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Entrega de Encomendas</strong><span>Não o encontrámos: reagende a entrega hoje</span></button>
            <div class="lx"><strong>Sarah</strong><span>Fotografias de domingo</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>O passeio de sábado</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Entrega de Encomendas</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Tentámos entregar a sua encomenda hoje mas não estava ninguém em casa. É necessária uma taxa de 1,45 £ para reagendar a entrega.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Reagendar entrega</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Denunciar phishing</button><button type="button" data-tap="reply">Responder</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Correio', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Denunciado e movido para o Lixo</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Aqui está o seu email, no navegador. <strong>Abra o email da Entrega de Encomendas.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Num computador pode ver para onde uma ligação leva mesmo <strong>sem clicar nela</strong>. <strong>Passe o rato por cima de "Reagendar entrega"</strong> e mantenha-o quieto. <em>(Num ecrã tátil, mantenha premido.)</em>',
         hints: {'click-link': 'Não clique! Basta pousar o ponteiro do rato por cima.'}, hint: 'Pouse o ponteiro do rato sobre a ligação azul, sem clicar.'},
        {screen: c => webmail(os, c), question: {q: 'O endereço verdadeiro aparece em baixo: parcel-redelivery.example.top. É seguro?', options: [
            {t: 'Não. Não é o site de uma empresa de entregas verdadeira, e pedem uma taxa', ok: true, why: 'Certo. As transportadoras não cobram pequenas taxas por email ou mensagem. O endereço verdadeiro denuncia-a.'},
            {t: 'Sim, tem "parcel" lá dentro', why: 'Qualquer pessoa pode pôr "parcel" num endereço web. Não é uma transportadora verdadeira, e a taxa é a burla.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Clique em Denunciar phishing.</strong> Também pode reencaminhar emails de burla para report@phishing.gov.uk.', hints: {reply: 'Nunca responda a burlões. Clique em Denunciar phishing.', 'click-link': 'Não clique na ligação! Denuncie-a antes.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Muito bem!</strong> Pouse o rato antes de clicar: se o endereço não corresponder à empresa, não clique.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (número de treino). Este é o código verdadeiro para encontrar o IMEI do telemóvel.',
        '999': 'Este é um telemóvel de treino, por isso não pode ligar para o 999. Numa emergência verdadeira, ligue 999 ou 112.',
        '112': 'Este é um telemóvel de treino, por isso não pode ligar para o 112. O 112 funciona como o 999 no Reino Unido e em toda a Europa.',
        '159': 'O 159 liga-o em segurança ao seu próprio banco. Use-o se uma chamada sobre o seu dinheiro o preocupar.',
        '7726': 'O 7726 é para onde reencaminha mensagens de burla. Nos teclados de telefone antigos, escreve "SPAM"!',
        '123': 'speaking-clock',
        '1471': 'O número de telefone 07700 900842 ligou hoje às 11:20. (Treino. O 1471 diz-lhe quem ligou por último para o telefone fixo.)',
        '01189998819991197253': 'Esse é o número de emergência de The IT Crowd. Já tentou desligar e voltar a ligar?',
        '101': 'O 101 é o número da polícia para o que não são emergências.',
        '111': 'O 111 é a ajuda do NHS quando é urgente mas não é uma emergência.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Telefone', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Introduza um número</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mãe', '#f472b6', [['them', 'Pensava que LOL queria dizer "lots of love". Tenho escrito isso em tudo!'], ['them', 'É por isso que a tua tia não respondeu?'], ['them', 'Enviado do meu iPad']]],
        ['Desconhecido', '#94a3b8', [['them', 'Parabéns! Ganhou um telemóvel GRÁTIS. Clique aqui para reclamar: prize-winner.example'], ['note', 'Isto é uma burla. Não toque na ligação: reencaminhe-a para o 7726 e depois apague-a.']]],
        ['Sarah', '#a78bfa', [['them', 'O pai está a aprender a usar emojis 😂'], ['them', 'Mandou-me uma beringela e disse "para o jantar?" 🍆']]],
        ['Dentista', '#38bdf8', [['them', 'Lembrete: a sua consulta é na terça-feira às 10:30. Responda S para confirmar.']]],
    ];
    const MUM_REPLIES = ['Quem é?', 'Liga-me, não consigo ler mensagens sem os óculos', 'Que bom! 👍', 'Recebeste a minha última mensagem? Mandei-a ao gato por engano.', 'Enviado do meu iPad', 'Está bem, meu amor xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Mensagens', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'A gaivota ataca outra vez' : 'Fotografia', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Apanhada em flagrante na marginal de Bridlington. As batatas fritas não foram recuperadas.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Fotografias', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Relógio', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Meteorologia', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Frio, com aguaceiros de neve' : 'Abertas, com vento'}</p>
            <div class="ajf">${[['Sex', '⟦cloud-rain⟧', '11°'], ['Sáb', '⟦wind⟧', '10°'], ['Dom', '⟦sun⟧', '14°'], ['Seg', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Aviso de gaivotas: <strong>alto</strong>. Proteja as suas batatas fritas.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Pelo guarda-fatos, e depois continue a andar até passar o candeeiro.', home: 'Não há lugar como o lar. 🏠', 'a lua': '238.855 milhas. O trânsito está fluido.',
        chips: 'Banca de batatas fritas mais próxima: em qualquer ponto da marginal de Bridlington. 🍟', 'north pole': 'A oficina do Pai Natal. Fechada até dezembro. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Lugar encantador!',
        'flamborough': 'Flamborough Head: farol, falésias e papagaios-do-mar. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": este mapa de treino só conhece alguns sítios. Experimente Bridlington, Flamborough ou Nárnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Definições', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Modo de avião' : 'Modo de avião', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Modo escuro', st.dark)}${row('dnd', 'Não incomodar', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Acerca' : 'Acerca do telemóvel'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Acerca' : 'Acerca do telemóvel', `<div class="aic"><div class="lq">
            <div class="ho"><span>Nome</span><b>Telemóvel da Margaret</b></div>
            <div class="ho"><span>Modelo</span><b>${p === 'ios' ? 'iPhone de Treino' : 'Pixel de Treino'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Versão do iOS' : 'Versão do Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Armazenamento</span><b>Muito espaço para fotografias dos netos</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Número de série</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'O jogo clássico dos telemóveis antigos.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Contém anúncios · Compras na app'], ['knit', '⟦scissors⟧', 'Padrões de Tricô', 'Em breve nesta loja de treino.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Abrir' : (p === 'ios' ? 'Obter' : 'Instalar')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Pontos: <b class="ado">0</b></span><span>Melhor: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Toque numa direção (ou use as teclas de setas) para começar</p>
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
                f.querySelector('.vy').textContent = `Fim do jogo! Pontuação ${score}. Toque numa direção para jogar de novo.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Avião', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Não incomodar', st.dnd)}${t('torch', '⟦flashlight⟧', 'Lanterna', st.torch)}${t('dark', '⟦sun-moon⟧', 'Modo escuro', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Deslize para cima para fechar' : 'Fechar'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Novo fundo de ecrã');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"Ao terceiro sinal, serão ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} e ${t.getSeconds()} segundos… pip, pip, pip." (O antigo relógio falante!)`; return; }
                msg.textContent = egg || (n ? 'Este telemóvel de treino não pode fazer chamadas verdadeiras. Experimente 123, 1471 ou *#06#…' : 'Escreva primeiro um número.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Envie os seus dados bancários para reclamar o prémio!!! (É uma burla. Bloqueie este número.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Obrigado, a sua consulta está confirmada. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Correio', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Iniciar'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Parar'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Iniciar'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Protetor solar posto! Isto já é praticamente a Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Lanterna ligada. (O ecrã brilha em vez da luz de trás.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Modo de avião ativado: sem chamadas, mensagens nem dados móveis.' : 'Modo de avião desativado.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Fundo de ecrã alterado. Vá ao ecrã inicial para o ver!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Agora é um programador! (Um segredo verdadeiro do Android: toque 7 vezes em Número da versão.)' : st.build >= 3 ? `Faltam-lhe ${7 - st.build} passos para ser programador.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Obrigado por praticar!</b>' : '<span>🤖</span><b>Treino 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Não precisa de uma app de lanterna: já vem nas definições rápidas do telemóvel. As apps de lanterna gratuitas costumam estar cheias de anúncios, ou pior!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Só de enfeite na loja de treino.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'A instalar…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Abrir'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Aplicação', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Esta app de treino faz parte de uma lição própria. Espreite os cursos para a experimentar a sério.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Encontrou um segredo!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Chamada terminada' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Desconhecido' ? 'Quem liga' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Desconhecido', number: '0161 496 0423', who: 'm', tag: 'Não está nos seus contactos',
         intro: 'O telemóvel está a tocar. O número não está guardado nos seus contactos. <strong>Atenda</strong> para praticar. <em>Aumente o som para ouvir quem liga.</em>',
         lines: [
            {text: 'Olá, fala o Mark da equipa de fraude do seu banco. Detetámos pagamentos suspeitos na sua conta. Antes de continuar, pode confirmar o seu nome completo, a sua data de nascimento e o número comprido do seu cartão bancário?',
             q: 'Quem liga diz ser do seu banco. O que faz?', options: [
                {t: 'Dou os dados, ele é do banco', why: 'Um banco que lhe liga nunca pede o número completo do cartão. É assim que os burlões obtêm os seus dados.'},
                {t: 'Digo que volto a ligar ao banco para o número que está no cartão, e desligo', ok: true, why: 'Exatamente. Ligue para o número do cartão, de outro telemóvel se puder, ou marque 159.'},
                {t: 'Peço-lhe que prove quem é', why: 'Os burlões soam convincentes e muitas vezes já sabem alguns dos seus dados. O mais seguro é desligar e ligar você mesmo ao banco.'}]},
            {text: 'Por favor, não desligue! Criminosos estão a retirar dinheiro da sua conta neste momento. Tem de passar tudo para uma conta segura que vou criar para si. Temos de o fazer nos próximos dez minutos.',
             q: 'Diz que é urgente e que tem de mover o dinheiro. E agora?', options: [
                {t: 'Movo o dinheiro depressa, antes que seja tarde', why: 'Não existe nenhuma "conta segura". O seu banco nunca lhe pedirá para mover dinheiro. Esta é a burla.'},
                {t: 'Desligo. Um banco verdadeiro nunca pede para mover dinheiro para uma "conta segura"', ok: true, why: 'Certo. A pressa e a "conta segura" denunciam a burla. Desligue e marque 159.'}]}],
         hang: 'Desligue com o botão vermelho.'},
        {letter: '?', color: '#64748b', name: 'Desconhecido', number: '020 7946 0815', who: 'robot', tag: 'Não está nos seus contactos',
         intro: 'Outra chamada. <strong>Atenda.</strong>',
         lines: [
            {text: 'Esta é uma mensagem automática da H M R C. Foi emitido um mandado de detenção contra si, por impostos por pagar. Para falar com um agente, prima 1 agora.',
             q: 'Uma voz gravada diz que vai ser detido por causa de impostos. O que faz?', options: [
                {t: 'Prima 1 para resolver', why: 'Premir 1 liga-o a burlões, que vão exigir pagamento, muitas vezes em cartões-presente. A HMRC nunca ameaça com detenção numa mensagem gravada.'},
                {t: 'Desligo. A HMRC não liga com ameaças de detenção', ok: true, why: 'Certo. A HMRC escreve-lhe primeiro e nunca ameaça com detenção ao telefone.'}]}],
         hang: 'Desligue.'},
        {letter: '?', color: '#64748b', name: 'Desconhecido', number: '0113 496 0332', who: 'm', tag: 'Não está nos seus contactos',
         intro: 'O telemóvel outra vez. <strong>Atenda.</strong>',
         lines: [
            {text: 'Olá, estou a ligar do departamento técnico do Windows. O seu computador tem-nos enviado mensagens de erro e tem um vírus muito perigoso. Por favor, vá ligar o computador e eu ajudo-o a resolvê-lo.',
             q: 'Ele diz que o seu computador tem um vírus. O que faz?', options: [
                {t: 'Ligo o computador e sigo as instruções dele', why: 'Ele pedir-lhe-ia para instalar um programa que lhe dá controlo do computador e depois pediria dinheiro. A Microsoft nunca liga assim.'},
                {t: 'Desligo. As empresas de computadores não ligam por causa de vírus', ok: true, why: 'Exatamente. Nunca deixe quem liga entrar no seu computador.'},
                {t: 'Explico que não tenho computador', why: 'Não precisa de explicar nem de discutir. Basta desligar.'}]}],
         hang: 'Desligue.'},
        {letter: '?', color: '#64748b', name: 'Desconhecido', number: '0808 157 0190', who: 'f', tag: 'Não está nos seus contactos',
         intro: 'Outra chamada. <strong>Atenda.</strong>',
         lines: [
            {text: 'Olá. Foi feita uma encomenda de um iPhone novo, no valor de novecentas e noventa e nove libras, na sua conta de compras online. Se não fez esta encomenda, prima 1 para a cancelar e falar com a nossa equipa.',
             q: 'Não encomendou nenhum iPhone. O que faz?', options: [
                {t: 'Prima 1 para cancelar a encomenda', why: 'Premir 1 liga-o a um burlão, que o vai "reembolsar" pedindo os seus dados bancários ou o controlo do computador.'},
                {t: 'Desligo e depois verifico eu mesmo a conta, na app ou no site', ok: true, why: 'Certo. Se houvesse mesmo uma encomenda, veria na sua conta. Nunca use um número ou botão que quem liga lhe indique.'}]}],
         hang: 'Desligue.'},
        {letter: 'S', color: '#16a34a', name: 'Centro de Saúde', number: '01632 960211', who: 'f', tag: 'Guardado nos seus contactos',
         intro: 'Mais uma chamada: desta vez é o centro de saúde, guardado nos seus contactos. <strong>Atenda.</strong>',
         lines: [
            {text: 'Olá, fala a Sue do centro de saúde. Só um lembrete rápido de que a sua vacina contra a gripe está marcada para terça-feira às dez horas. Não precisa de fazer nada. Se precisar de mudar, ligue-nos para o número do costume. Até breve!',
             q: 'Esta chamada é uma burla?', options: [
                {t: 'Sim: desligo e bloqueio o número', why: 'Esta está bem! Ela não pediu nada, não o apressou e disse-lhe para usar o número do costume.'},
                {t: 'Provavelmente verdadeira: não pediu dinheiro nem dados e disse para ligar para o número do costume', ok: true, why: 'Exatamente. As chamadas verdadeiras não o pressionam. Se alguma vez tiver dúvidas, ligue de volta para o número que já tem.'}]}],
         hang: 'A chamada terminou. <strong>Toque no botão vermelho</strong> para desligar.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Chamada ${n + 1} de ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'Na vida real, não há mal em não atender números que não conhece! Neste treino, toque no botão verde para atender.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Qual destes é um sinal de chamada de burla?', options: [
            {t: 'Ser apressado, ameaçado ou mandado guardar segredo', ok: true, why: 'Certo. A pressão é o sinal mais claro. Quem liga a sério não se importa que se tome o tempo que for preciso e se ligue de volta.'},
            {t: 'Quem liga sabe o seu nome', why: 'Os burlões muitas vezes sabem o seu nome, e até alguns dados da conta. Isso por si só não torna uma chamada verdadeira.'},
            {t: 'O número parece local', why: 'Os burlões conseguem fazer aparecer no ecrã qualquer número, até um local ou o do seu banco. Não confie no número.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Muito bem!</strong> Desligou a quatro burlões e reconheceu a chamada verdadeira. Lembre-se: na dúvida, desligue e ligue de volta para um número de confiança. Para o banco, marque 159.'},
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
            ios: ['iPhone', 'Criado pela Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola e outros'],
            windows: ['Windows', 'A maioria dos portáteis e PCs de secretária'], mac: ['Mac', 'Criado pela Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu e outros'],
        };
        const notSure = isPC
            ? 'Olhe para o ecrã. O Windows tem um botão Iniciar (quatro quadradinhos) em baixo. Um Mac tem o logótipo da Apple no canto superior esquerdo. O Linux Mint tem um botão Menu em baixo à esquerda.'
            : 'Um iPhone tem o logótipo da Apple (uma maçã trincada) atrás. Se o seu não tem, é quase de certeza um telemóvel Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Que ${isPC ? 'computador usa' : 'telemóvel tem'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Não tem a certeza?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Mostre-me onde</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Ouvir de novo</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Voltar um passo</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Trocar de ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">${isPC ? 'COMPUTADOR' : 'TELEMÓVEL'} DE TREINO: não é verdadeiro. Nada do que fizer aqui é enviado para lado nenhum.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Desativar a voz' : 'Ativar a voz'; };
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
            showBtn.textContent = 'Voltar à lição';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Mostre-me onde';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Concluído!' : `Passo ${i + 1} de ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Certo!' : 'Quase.'}</p><p>${o.why}</p>`;
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Tentar outra vez</button>${pageNext
                ? `<button type="button" class="ap vb">Bom trabalho! ${last ? 'Agora conclua o curso' : 'Que tal experimentar a próxima lição'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Quase. ' + (step.hint || 'Leia outra vez as instruções.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Ainda não. Leia outra vez as instruções.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Quase. ' + (step.hint || 'Leia outra vez as instruções.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Aplicação';
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
                else hint.textContent = 'Clique nele com o botão direito: prima o botão direito do rato. No trackpad de um Mac, clique com dois dedos. Num ecrã tátil, mantenha premido.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Mantenha o dedo (ou o botão do rato) premido sobre isto até acontecer alguma coisa.';
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
                showBtn.textContent = 'Mostre-me onde';
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
