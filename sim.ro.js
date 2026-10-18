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
            ? [['phone', 'Telefon', '#22c55e', ICON.phone], ['messages', 'Mesaje', '#22c55e', ICON.bubble], ['camera', 'Cameră', '#6b7280', ICON.camera],
               ['photos', 'Fotografii', '#e5e7eb', ICON.photos], ['mail', 'Mail', '#3b82f6', ICON.mail], ['clock', 'Ceas', '#111827', ICON.clock],
               ['weather', 'Meteo', '#38bdf8', ICON.weather], ['maps', 'Hărți', '#22c55e', ICON.map], ['settings', 'Setări', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Telefon', '#2563eb', ICON.phone], ['messages', 'Mesaje', '#3b82f6', ICON.bubble], ['camera', 'Cameră', '#6b7280', ICON.camera],
               ['photos', 'Fotografii', '#e5e7eb', ICON.photos], ['clock', 'Ceas', '#111827', ICON.clock], ['maps', 'Hărți', '#16a34a', ICON.map],
               ['settings', 'Setări', '#475569', ICON.settings], ['weather', 'Meteo', '#38bdf8', ICON.weather], ['mail', 'E-mail', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Glisează în jos din colțul din dreapta sus ⟦chevron-down⟧' : 'Glisează în jos de sus ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Azi</div>
                <div class="hp"><span>RECOMANDAT</span><strong>Aplicațiile preferate ale săptămânii</strong></div>
                <div class="hp alt"><span>PRIMII PAȘI</span><strong>Idei pentru noul tău iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Azi</button><button type="button" data-tap="games">Jocuri</button>
                    <button type="button" data-tap="apps">Aplicații</button><button type="button" data-tap="search-tab">${ICON.search}Caută</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Caută aplicații și jocuri</span></button>
            <div class="tg"><span class="on">Pentru tine</span><span>Top</span><span>Copii</span></div>
            <div class="hp"><span>SUGERAT PENTRU TINE</span><strong>Aplicații cu care să începi</strong></div>
            <div class="hp alt"><span>POPULARE</span><strong>Păstrează legătura</strong></div>
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
        const btnLabel = p === 'ios' ? 'Obține' : 'Instalează';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 mld.+ descărcări' : 'Rețele sociale'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Gratuit</span></div></div>
                <p class="agm">Pe iPhone-ul tău real, poate fi nevoie să apeși de două ori butonul lateral, să te uiți la ecran pentru Face ID sau să scrii aici parola contului Apple.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Instalează</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Anulează</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Bun venit la WhatsApp</h3>
            <p>Citește <u>Politica de confidențialitate</u>. Atinge „Acceptă și continuă” ca să accepți <u>Condițiile de utilizare</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Acceptă și continuă</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Introdu numărul de telefon</h3>
            <p>WhatsApp va trebui să verifice numărul tău de telefon. Se pot aplica taxe de la operator.</p>
            <div class="abt">Regatul Unit <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Următorul</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Acesta este numărul corect?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Editează</button><button type="button" data-tap="yes">${ios ? 'Da' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>MESAJE · acum</strong><span>Codul tău WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Nu da acest cod nimănui.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Se verifică numărul tău</h3>
            <p>Se așteaptă detectarea automată a unui cod din 6 cifre trimis prin SMS la <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Nu ai primit un cod?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['„WhatsApp” dorește să acceseze contactele tale', 'Ca să vezi care dintre prieteni folosesc WhatsApp.', 'Permiți WhatsApp să îți acceseze contactele?']
            : ['„WhatsApp” dorește să îți trimită notificări', 'Ca să știi când sosește un mesaj nou.', 'Permiți WhatsApp să îți trimită notificări?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Informații de profil</h3>
            <p>Scrie-ți numele și adaugă o poză de profil, dacă vrei.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Numele tău</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Următorul</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Chaturi' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Totul e gata${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Conversațiile tale vor apărea aici. Atinge butonul de chat nou ca să scrii cuiva din contactele tale.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Acesta este ecranul principal al telefonului tău. Aplicațiile se descarcă din <strong>${store}</strong>. Este gratuit și este locul sigur de unde iei aplicații. <strong>Atinge ${store}.</strong>`,
                 hint: `Caută pictograma ${store}. ${p === 'ios' ? "Este albastră, cu o literă A albă." : "Este un triunghi colorat."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Acum trebuie să cauți WhatsApp. <strong>Atinge Caută</strong>, în dreapta jos.' : 'Acum trebuie să cauți WhatsApp. <strong>Atinge bara de căutare</strong> de sus.',
                 hint: p === 'ios' ? 'Căutarea este lupa din dreapta jos.' : 'Bara de căutare spune „Caută aplicații și jocuri”.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Am scris <em>whatsapp</em> pentru tine. Apare o listă de sugestii. <strong>Atinge „whatsapp messenger”.</strong>",
                 hint: 'Atinge sugestia care spune „whatsapp messenger”.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Atenție: unele aplicații se dau drept WhatsApp. Cea adevărată se numește <strong>WhatsApp Messenger</strong>, este făcută de <strong>WhatsApp Inc.</strong> și este gratuită. <strong>Atinge ${p === 'ios' ? 'Obține' : 'Instalează'} lângă cea adevărată.</strong>`,
                 hints: {'fake1-get': 'Aceea este „WhatsUp Chat Free” de la Fun Apps Ltd. Este o imitație, iar eticheta „Ad” arată că e o reclamă. Verifică numele și cine a făcut-o.',
                         'fake2-get': 'Aceea este „WA Messenger for Chat Pro” de la LuckyDev Studio, o copie. Cea adevărată este făcută de WhatsApp Inc.'},
                 hint: 'Caută „WhatsApp Messenger”, făcut de „WhatsApp Inc.”'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'iPhone-ul verifică dacă ești chiar tu înainte să instaleze. Pe un iPhone real poți folosi <strong>Face ID</strong>, <strong>amprenta</strong> (Touch ID) sau <strong>parola contului Apple</strong>. Aici, doar <strong>atinge Instalează.</strong>',
                    hints: {'sheet-cancel': 'Anulează ar opri descărcarea. Atinge Instalează.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Se descarcă. Când s-a terminat, butonul se schimbă în <strong>Deschide</strong>. <strong>Atinge Deschide.</strong>`,
                 hint: 'Așteaptă până când butonul spune Deschide, apoi atinge-l.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp se deschide pentru prima dată. Îți cere să accepți condițiile. <strong>Atinge „Acceptă și continuă”.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp folosește numărul tău de mobil, ca prietenii să te poată găsi. <strong>Atinge caseta cu numărul de telefon</strong> și vom completa un număr de exersare.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Pe un telefon real ți-ai scrie propriul număr de mobil. Aici am folosit unul inventat: <strong>07700 900123</strong>. <strong>Atinge Următorul.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp verifică dacă l-ai scris corect. Acesta este corect, așa că <strong>atinge ${p === 'ios' ? 'Da' : 'OK'}.</strong>`,
                 hints: {edit: `Ai atinge Editează dacă ai fi greșit. Numărul acesta este corect, așa că atinge ${p === 'ios' ? 'Da' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp trimite un SMS cu un cod din 6 cifre, ca să verifice că numărul este al tău. iPhone-ul se oferă să îl completeze pentru tine. <strong>Atinge codul de deasupra tastaturii.</strong>'
                    : 'WhatsApp trimite un SMS cu un cod din 6 cifre, ca să verifice că numărul este al tău. Multe telefoane Android îl completează singure. Dacă al tău nu o face, <strong>atinge mesajul</strong> de sus.'},
                {screen: c => waCode(p, c),
                 question: {q: 'În timp ce configurezi, un prieten îți scrie: <em>„Salut! Ți-am trimis din greșeală un cod din 6 cifre, mi-l poți trimite înapoi?”</em> Ce faci?',
                    options: [
                        {t: 'Îl trimit, e un prieten', why: 'Aceasta este o înșelătorie des întâlnită. Cineva a preluat contul prietenului tău, iar acel cod ți-ar da și ție contul lor.'},
                        {t: 'Nu îl trimit. Nimeni nu trebuie să ți-l ceară vreodată', ok: true, why: 'Exact. Codul acela este cheia WhatsApp-ului tău. Nu-l da nimănui, nici unui prieten, nici cuiva care spune că e de la WhatsApp.'},
                        {t: 'Trimit doar primele 3 cifre', why: 'Chiar și o parte din cod îl ajută pe escroc. Nu da nimic din el.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp cere să îți vadă contactele, ca să-ți arate care dintre prieteni folosesc WhatsApp. <strong>Atinge Permite.</strong>',
                 hints: {deny: 'Poți alege să nu permiți, dar atunci WhatsApp nu poate afișa numele prietenilor tăi. Pentru acest exercițiu, atinge Permite.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Notificările te anunță când sosește un mesaj, chiar și când WhatsApp este închis. <strong>Atinge Permite.</strong>',
                 hints: {deny: 'Fără notificări nu vei ști când îți scrie cineva. Atinge Permite pentru acest exercițiu.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Ultimul pas: numele tău este ceea ce văd prietenii. <strong>Scrie-ți prenumele în casetă</strong>, apoi <strong>atinge Următorul</strong>. (Rămâne pe această pagină și nu este trimis nicăieri.)',
                 hints: {photo: 'În aplicația reală poți alege acum o poză sau poți adăuga una mai târziu în Setări. Deocamdată o sărim: scrie-ți numele și atinge Următorul.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Bravo, ai configurat WhatsApp!</strong> Conversațiile tale vor apărea aici. În lecțiile următoare vei trimite primul mesaj.'},
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
            const lockName = ctx.touch ? 'Touch ID și cod' : 'Face ID și cod';
            const groups = [
                [['airplane', 'Mod Avion', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Serviciu mobil', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Notificări', '#ef4444', '⟦bell⟧'], ['sounds', 'Sunete și haptică', '#ec4899', '⟦volume-2⟧'], ['focus', 'Focus', '#6366f1', '⟦moon⟧']],
                [['general', 'General', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Accesibilitate', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence și Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Ecran și luminozitate', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'SOS urgențe', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Confidențialitate și securitate', '#3b82f6', '⟦hand⟧'], ['battery', 'Baterie', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Aplicații', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Cont Apple, iCloud și altele</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Rețea și internet', 'Mobil, Wi-Fi, hotspot'], ['devices', 'Dispozitive conectate', 'Bluetooth, asociere'],
            ['apps', 'Aplicații', 'Aplicații recente, aplicații implicite'], ['notifications', 'Notificări', 'Istoric notificări'], ['battery', 'Baterie', '85%'], ['storage', 'Stocare', '91% used'],
            ['sound', 'Sunet și vibrații', 'Volum, haptică'], ['display', 'Afișaj și atingere', 'Temă întunecată, dimensiunea fontului'],
            ['accessibility', 'Accesibilitate', 'Afișaj, interacțiune, audio'], ['security', 'Securitate și confidențialitate', 'Securitatea aplicațiilor, blocarea dispozitivului, permisiuni'],
            ['location', 'Locație', 'Activat'], ['safety', 'Siguranță și urgențe', 'SOS urgențe, informații medicale, alerte'],
            ['google', 'Google', 'Servicii și preferințe'], ['system', 'Sistem', 'Limbi, oră, actualizări de software']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID și cod' : 'Face ID și cod';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Deget 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Resetează Face ID</span></div><div class="cj ex"><span>Configurează un aspect alternativ</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Dezactivează codul</span></div><div class="cj ex"><span>Schimbă codul</span></div>'
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

    const androidSecurity = () => androidList('Securitate și confidențialitate', [
        ['device-unlock', 'Deblocarea dispozitivului', 'Blocarea ecranului, deblocare facială și cu amprentă'], ['app-security', 'Securitatea aplicațiilor', 'Scanează aplicațiile pentru comportament dăunător'],
        ['theft', 'Protecție împotriva furtului', 'Blochează telefonul dacă este furat'], ['privacy', 'Confidențialitate', 'Permisiuni, activitatea contului']]);
    const androidDeviceUnlock = ctx => androidList('Deblocarea dispozitivului', [
        ['screen-lock', 'Blocarea ecranului', ctx.passcodeSet ? 'PIN' : 'Niciuna'], ['face-finger', 'Deblocare facială și cu amprentă', ctx.faceDone || ctx.fingerDone ? 'Configurează' : 'Configurează pentru deblocare mai rapidă']]);
    const androidFaceFinger = ctx => androidList('Deblocare facială și cu amprentă', [
        ['face-unlock', 'Deblocare facială', ctx.faceDone ? 'Față adăugată' : 'Configurează'], ['fingerprint-unlock', 'Deblocare cu amprentă', ctx.fingerDone ? '1 fingerprint' : 'Configurează']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Prima scanare Face ID este completă.' : 'Face ID este acum configurat.') : 'Față adăugată';
        const btn = p === 'ios' ? (first ? 'Continuă' : 'Gata') : 'Gata';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Mișcă-ți încet capul ca să completezi cercul.' : 'Ține fața în cerc și mișcă-ți încet capul.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Complet' : 'Ajustează-ți modul de ținere') : (stage === 'grip' ? 'Ajustează-ți modul de ținere' : 'Pune degetul'))
            : (ready ? 'Amprentă adăugată' : 'Atinge senzorul');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Amprenta ta poate fi acum folosită pentru a-ți debloca iPhone-ul.' : 'Acum pune marginile vârfului degetului pe butonul principal.')
                     : (stage === 'grip' ? 'Sprijină marginile vârfului degetului pe butonul principal.' : 'Ridică și pune degetul pe butonul principal, de mai multe ori.'))
            : (ready ? 'Acum îți poți folosi amprenta ca să-ți deblochezi telefonul.' : 'Atinge senzorul, ridică degetul și atinge-l din nou, până când amprenta este completă.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Continuă' : 'Gata'}</button>` : sensor}
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
                 say: 'Codul, Face ID și Touch ID se găsesc în aplicația <strong>Configurări</strong>. <strong>Atinge Configurări</strong> (rotița gri).',
                 hint: 'Configurări este pictograma gri cu o rotiță.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Derulează lista dacă e nevoie și <strong>atinge ${ctx.touch ? 'Touch ID și cod' : 'Face ID și cod'}</strong>.`,
                 hint: `Caută „${ctx.touch ? 'Touch ID și cod' : 'Face ID și cod'}”, sub Ecran și luminozitate.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Blocarea ecranului, deblocarea facială și amprentele se găsesc în aplicația <strong>Setări</strong>. <strong>Atinge Setări</strong> (rotița).',
             hint: 'Setări este pictograma cu o rotiță.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Derulează dacă e nevoie și <strong>atinge Securitate și confidențialitate</strong>. <em>Pe un Samsung se numește Securitate și confidențialitate, apoi Date biometrice sau Ecran de blocare.</em>',
             hint: 'Caută „Securitate și confidențialitate” spre partea de jos a listei.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Atinge Deblocarea dispozitivului.</strong>',
             hint: 'Este prima opțiune, „Deblocarea dispozitivului”.'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Introdu codul' : 'Introdu PIN-ul', p === 'ios' ? '' : 'Pentru a continua, introdu PIN-ul'),
        sequence: CODE_KEYS,
        say: `${extraSay}Telefonul verifică mai întâi că ești tu. <strong>Scrie codul de exersare: ${codeText}</strong>. <em>Nu scrie niciodată codul tău real pe un site.</em>`,
        hint: `Scrie codul de exersare ${codeText}, o cifră pe rând.`,
    });

    const safestQuestion = {
        q: 'Care dintre acestea ar fi cel mai <strong>sigur</strong> cod de acces?',
        options: [
            {t: '123456', why: '123456 este cel mai folosit cod dintre toate, așa că este unul dintre primele pe care le-ar încerca un hoț.'},
            {t: 'Ziua ta de naștere, de exemplu 140352', why: 'Zilele de naștere se află ușor, de pe rețelele sociale, din felicitări sau din corespondență. Evită datele care au o semnificație.'},
            {t: 'Șase cifre care nu înseamnă nimic pentru nimeni altcineva', ok: true, why: 'Exact. Cifrele aleatorii care nu sunt o dată, un model sau o repetiție sunt cel mai greu de ghicit.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Acest telefon nu are încă niciun cod, așa că oricine l-ar putea deschide. <strong>Atinge Activează codul.</strong>',
                 hints: {stolen: 'Protecția dispozitivelor furate este explicată în lecția 4. Mai întâi, activează codul.'}},
                {screen: c => codeScreen(p, c, 'Setează codul', 'Introdu un cod', '<p class="aeh">Opțiuni pentru cod</p>'), sequence: CODE_KEYS,
                 say: `Alege 6 cifre pe care le vei ține minte. Pentru acest exercițiu, <strong>scrie ${codeText}</strong>. <em>Te rog să nu scrii aici codul tău real.</em>`,
                 hint: `Scrie ${codeText}, o cifră pe rând.`},
                {screen: c => codeScreen(p, c, 'Setează codul', 'Introdu din nou noul cod'), sequence: CODE_KEYS,
                 say: `iPhone-ul îți cere din nou codul, ca să se asigure că nu ai greșit. <strong>Scrie din nou ${codeText}.</strong>`,
                 hint: `Scrie din nou ${codeText}.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Bravo, telefonul tău de exersare are acum un cod!</strong> Pe un iPhone real, ți se poate cere în acest moment și parola contului Apple.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Blocarea ecranului spune <strong>Niciuna</strong>, așa că oricine ar putea deschide acest telefon. <strong>Atinge Blocarea ecranului.</strong>'},
            {screen: () => androidList('Alege blocarea ecranului', [['none', 'Niciuna'], ['swipe', 'Glisare'], ['pattern', 'Model'], ['pin', 'PIN'], ['password', 'Parolă']]),
             target: 'pin', say: 'Ai câteva variante. Un <strong>PIN</strong> (cifre) este simplu și sigur. <strong>Atinge PIN.</strong>',
             hints: {none: 'Niciuna înseamnă că oricine îți poate deschide telefonul.', swipe: 'Glisarea doar deschide telefonul cu o mișcare a degetului, deci nu protejează nimic.',
                     pattern: 'Modelele pot fi ghicite după urmele pe care degetul le lasă pe ecran. Un PIN este mai sigur.',
                     password: 'Și o parolă merge, dar un PIN se scrie mai repede în fiecare zi. Atinge PIN pentru acest exercițiu.'}},
            {screen: c => codeScreen(p, c, 'Alege un PIN', 'PIN-ul trebuie să aibă cel puțin 4 cifre'), sequence: CODE_KEYS,
             say: `6 cifre sunt mai sigure decât 4. Pentru acest exercițiu, <strong>scrie ${codeText}</strong>. <em>Te rog să nu scrii aici PIN-ul tău real.</em>`,
             hint: `Scrie ${codeText}, o cifră pe rând.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Alege un PIN', 'PIN-ul trebuie să aibă cel puțin 4 cifre', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Atinge Următorul.</strong>'},
            {screen: c => codeScreen(p, c, 'Introdu din nou PIN-ul', ''), sequence: CODE_KEYS,
             say: `Telefonul îți cere din nou PIN-ul, ca să se asigure că nu ai greșit. <strong>Scrie din nou ${codeText}.</strong>`, hint: `Scrie din nou ${codeText}.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Introdu din nou PIN-ul', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Atinge Confirmă.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Notificări pe ecranul de blocare', [['show-all', 'Afișează tot conținutul notificărilor'], ['hide-sensitive', 'Ascunde conținutul sensibil'], ['dont-show', 'Nu afișa deloc notificările']], false),
             target: 'hide-sensitive',
             say: 'Telefonul te întreabă ce mesaje să apară pe ecranul blocat. <strong>Ascunde conținutul sensibil</strong> este o alegere bună: vezi că a sosit un mesaj, dar nu ce scrie în el. <strong>Atinge-o.</strong>',
             hints: {'show-all': 'Asta afișează totul, inclusiv codurile de la banca ta, oricui ia telefonul în mână. Atinge „Ascunde conținutul sensibil”.',
                     'dont-show': 'Merge și așa, dar nu vei vedea când sosesc mesaje. Pentru acest exercițiu, atinge „Ascunde conținutul sensibil”.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Bravo, telefonul tău de exersare are acum un PIN!</strong> Blocarea ecranului spune acum PIN.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Atinge Configurează Face ID.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Cum configurezi Face ID</strong>
                    <p>Mai întâi, așază fața în cadrul camerei. Apoi mișcă-ți capul în cerc ca să fie văzute toate unghiurile feței tale.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Începeți</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Ține telefonul în fața feței, la distanța unui braț întins, ca atunci când faci un selfie. <strong>Atinge Începeți.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Pe un iPhone real acum <strong>îți miști încet capul în cerc</strong>, ca și cum ai desena un cerc cu nasul. Inelul se umple pe măsură ce scanează. Când s-a terminat, <strong>atinge Continuă</strong>.',
                 hint: 'Așteaptă să se umple cercul, apoi atinge Continuă.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Scanează a doua oară, ca să fie sigur. Mișcă din nou capul în cerc. Când s-a terminat, <strong>atinge Gata</strong>.',
                 hint: 'Așteaptă să se umple cercul, apoi atinge Gata.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Un prieten cere să adauge <em>fața lui</em> pe telefonul tău, „pentru orice eventualitate”. Ce faci?',
                    options: [
                        {t: 'Îl las, e practic', why: 'Oricine are fața configurată îți poate deschide telefonul și aproba plăți în aplicațiile tale. Configurează doar fața ta.'},
                        {t: 'Spun nu. Doar fața mea trebuie să deblocheze telefonul', ok: true, why: 'Exact. Dacă cineva de încredere trebuie să intre, dă-i codul tău, iar apoi schimbă-l dacă este nevoie.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Bravo, Face ID este configurat!</strong> Acum îți poți debloca telefonul doar uitându-te la el, apoi glisând în sus.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Atinge Deblocare facială și cu amprentă.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Atinge Deblocare facială.</strong>',
             hints: {'fingerprint-unlock': 'Acelea sunt amprentele, din lecția 3. Deocamdată atinge Deblocare facială.'}},
            {screen: () => consent(p, 'Deblochează cu fața', 'Folosește fața ca să-ți deblochezi telefonul și să confirmi că ești tu în aplicații. Fața ta este stocată doar pe acest telefon.', 'Sunt de acord'),
             target: 'agree', say: 'Telefonul explică cum folosește fața ta. <strong>Atinge Sunt de acord.</strong>',
             hints: {cancel: 'Anulează ar opri configurarea. Atinge Sunt de acord ca să continui.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Ține telefonul la nivelul ochilor, la distanța unui braț întins. Pe un telefon real <strong>ții fața în cerc și îți miști încet capul</strong>. Când s-a terminat, <strong>atinge Gata</strong>.',
             hint: 'Așteaptă să se umple cercul, apoi atinge Gata.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Pe multe telefoane Android, deblocarea facială este mai puțin sigură decât amprenta. Ce înseamnă asta pentru tine?',
                options: [
                    {t: 'Este în regulă pentru orice', why: 'Pe multe telefoane, deblocarea facială folosește o cameră obișnuită, care poate fi păcălită mai ușor. Unele aplicații bancare nu o acceptă din acest motiv.'},
                    {t: 'O folosesc pentru deblocare și folosesc amprenta sau PIN-ul pentru bancă, dacă banca îmi cere', ok: true, why: 'Corect. Telefonul îți va spune dacă deblocarea facială poate fi folosită pentru plăți și pentru bancă. Dacă nu poate, folosește amprenta sau PIN-ul.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Bravo, deblocarea facială este configurată!</strong> Acum îți poți debloca telefonul uitându-te la el.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Atinge Adaugă o amprentă…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID folosește <strong>butonul principal</strong> de pe partea din față a iPhone-urilor mai vechi, precum iPhone SE. <strong>Atinge de 6 ori butonul principal din partea de jos a telefonului de exersare</strong>, ca și cum ai ridica și ai pune degetul.',
                 hint: 'Atinge butonul principal rotund din partea de jos a telefonului de exersare.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Acum are nevoie de marginile vârfului degetului. <strong>Atinge Continuă.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Pe un iPhone real, sprijini <strong>părțile laterale și vârful</strong> degetului pe buton. <strong>Atinge butonul principal încă de 4 ori.</strong>',
                 hint: 'Atinge butonul principal rotund din partea de jos.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Gata. <strong>Atinge Continuă.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Ce deget e cel mai bine să adaugi primul?',
                    options: [
                        {t: 'Degetul mare sau degetul pe care îl folosești cel mai mult ca să ții telefonul', ok: true, why: 'Da. Pentru un buton principal, este de obicei degetul mare. Poți adăuga până la 5 degete, așa că merită să adaugi ambele degete mari.'},
                        {t: 'Orice deget, nu contează', why: 'Merge cu orice deget, dar alege-l pe cel care se sprijină firesc pe buton când iei telefonul în mână, de obicei degetul mare.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Bravo, amprenta ta este configurată!</strong> Sprijină degetul pe butonul principal ca să deblochezi. Poți adăuga mai multe degete în același fel.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Atinge Deblocare facială și cu amprentă.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Atinge Deblocare cu amprentă.</strong>',
             hints: {'face-unlock': 'Aceea este deblocarea facială, din lecția 2. Deocamdată atinge Deblocare cu amprentă.'}},
            {screen: () => consent(p, 'Deblochează cu amprenta', 'Folosește amprenta ca să-ți deblochezi telefonul sau să confirmi că ești tu, de exemplu când te conectezi în aplicații. Amprenta ta este stocată doar pe acest telefon.', 'Sunt de acord'),
             target: 'agree', say: '<strong>Atinge Sunt de acord.</strong>', hints: {cancel: 'Anulează ar opri configurarea. Atinge Sunt de acord ca să continui.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Senzorul poate fi pe ecran, pe spatele telefonului sau pe butonul de pornire, iar telefonul îți arată unde. Aici este pe ecran. <strong>Atinge senzorul de 6 ori</strong>, ca și cum ai ridica și ai pune degetul.',
             hint: 'Atinge senzorul rotund din partea de jos a ecranului.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Amprenta ta a fost înregistrată. <strong>Atinge Gata.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Ce deget e cel mai bine să adaugi primul?',
                options: [
                    {t: 'Degetul care atinge firesc senzorul când iei telefonul în mână', ok: true, why: 'Da. Pentru un senzor de pe spate, de obicei este arătătorul, iar pentru unul de pe ecran sau din lateral, degetul mare. Poți adăuga mai multe.'},
                    {t: 'Orice deget, nu contează', why: 'Merge orice deget, dar alege-l pe cel care ajunge firesc pe senzor. Deblocarea devine rapidă și simplă.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Bravo, amprenta ta este configurată!</strong> Atinge senzorul ca să deblochezi. Poți adăuga mai multe degete în același fel.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Floarea-soarelui în grădină', '#fde68a'], ['🐶', 'Câinele pe canapea', '#fecaca'], ['🏖️', 'O zi la plajă', '#bae6fd'],
                    ['🎂', 'O tortă de ziua de naștere', '#fbcfe8'], ['🌅', 'Apus peste mare', '#fed7aa'], ['🐈', 'Pisica adormită', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Citit' : state === 'sent' ? 'Trimis' : 'Livrat'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Bună, mamă, sunt eu! Număr nou, telefonul vechi s-a stricat…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Familie', last: 'Dave: Cine aduce tortul? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Ne vedem joi!', time: 'Ieri', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Bună, mamă! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Chat nou' : 'Selectează contact'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Familie', '#f59e0b', 'Dave, Jean, Sarah, Tu'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Adaugă (plus)' : 'Atașează (agrafă)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Acest număr nu este în contactele tale.</p><div><button type="button" data-tap="block">Blochează</button><button type="button" data-tap="add-contact">Adaugă</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Fotografii' : 'Galerie'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Blochezi +44 7700 900842?</strong></p><p class="fd">Contactele blocate nu te pot suna și nu îți pot trimite mesaje.</p>
                <p class="fd">⟦square-check⟧ Raportează la WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Anulează</button><button type="button" data-tap="confirm-block">Blochează</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Recente' : 'Galerie'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Sună…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Activează sunetul' : 'Dezactivează sunetul'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Sunet dezactivat pentru 1 săptămână' : 'Dezactivat'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Dezactivează sunetul notificărilor pentru…</strong></p>
                <button type="button" data-tap="mute-8h">8 ore</button><button type="button" data-tap="mute-week">1 săptămână</button><button type="button" data-tap="mute-always">Întotdeauna</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Setări', [['account', 'Cont', 'Notificări de securitate, schimbarea numărului'], ['privacy', 'Confidențialitate', 'Blocarea contactelor, mesaje care dispar'],
                ['chats', 'Chaturi', 'Temă, imagini de fundal'], ['notifications', 'Notificări', 'Sunete pentru mesaje, grupuri și apeluri']]],
            account: ['Cont', [['twostep', 'Verificare în doi pași', ctx.twoStep ? 'Activat' : 'Dezactivat'], ['change-number', 'Schimbă numărul', ''], ['delete-account', 'Șterge contul', '']]],
            privacy: ['Confidențialitate', [['last-seen', 'Ultima conectare și online', 'Toată lumea'], ['profile-photo', 'Poză de profil', 'Toată lumea'],
                ['groups', 'Grupuri', ctx.groupsSetting || 'Toată lumea'], ['blocked', 'Contacte blocate', ctx.blocked ? '1' : 'Niciuna']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Cine mă poate adăuga în grupuri</strong></p>
                <button type="button" data-tap="groups-everyone">Toată lumea</button><button type="button" data-tap="groups-contacts">Contactele mele</button>
                <button type="button" data-tap="groups-except">Contactele mele, cu excepția…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Verificare în doi pași</h3><p>Pentru siguranță în plus, activează verificarea în doi pași, care va cere un PIN când îți înregistrezi din nou numărul de telefon în WhatsApp.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Activează</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Adaugă o adresă de e-mail</h3>
                <p>Adaugă o adresă de e-mail ca să îți poți reseta PIN-ul dacă îl uiți.</p>
                <div class="tk ex">adresa ta de e-mail</div>
                <button type="button" class="ce ox" data-tap="email-next">Următorul</button>
                <button type="button" class="cp wd" data-tap="skip">Omite</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Verificarea în doi pași este activată</h3><p>Ți se va cere PIN-ul dacă configurezi WhatsApp pe un telefon nou.</p>
                <button type="button" class="ce ox" data-tap="done">Gata</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Creează un PIN din 6 cifre' : 'Confirmă PIN-ul'}</strong>
            <p>${stage === 'pin' ? 'Vei avea nevoie de el ca să configurezi WhatsApp pe un telefon nou.' : 'Scrie din nou același PIN.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Aceasta este lista ta de conversații. Ca să începi una nouă, <strong>atinge butonul de chat nou</strong> (creionul, sus în dreapta).'
                          : 'Aceasta este lista ta de conversații. Ca să începi una nouă, <strong>atinge butonul verde +</strong> din dreapta jos.',
         hints: {'chat-family': 'Aceasta deschide o conversație existentă. Începe în schimb una nouă.', 'chat-jean': 'Aceasta deschide o conversație existentă. Începe în schimb una nouă.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp arată persoanele din contactele tale care îl folosesc. <strong>Atinge Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Scrie mai întâi un mesaj în casetă, apoi atinge săgeata de trimitere.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Bună, mamă! 😊 Ce bine că ai scris!', n: 2}); },
         say: '<strong>Atinge caseta de mesaj</strong> din partea de jos, <strong>scrie un mesaj scurt</strong> (de exemplu „Salut!”), apoi <strong>atinge săgeata de trimitere</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Microfonul este pentru mesaje vocale, care urmează. Mai întâi scrie un mesaj și atinge săgeata de trimitere.', attach: 'Aceasta este pentru poze, care urmează. Mai întâi scrie un mesaj și atinge trimite.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah a răspuns! Sub mesajul tău sunt <strong>două bife albastre ⟦check-check⟧</strong>. Ce înseamnă?',
            options: [
                {t: 'Mesajul nu s-a trimis', why: 'Un mesaj netrimis arată un mic ceas sau un avertisment roșu. Bifele înseamnă că a mers.'},
                {t: 'Sarah l-a citit', ok: true, why: 'Da! O bifă gri înseamnă trimis, două bife gri înseamnă livrat pe telefonul ei, iar două bife albastre înseamnă că l-a citit.'},
                {t: 'A fost trimis de două ori', why: 'Nu, a fost trimis o singură dată. Două bife albastre înseamnă că a fost citit.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Acum trimite o poză. <strong>Atinge ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> de lângă caseta de mesaj.`,
         hints: {camera: 'Camera face o poză nouă. Ca să trimiți una pe care ai făcut-o deja, atinge ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Atinge ${p === 'ios' ? 'Fotografii' : 'Galerie'}</strong> ca să alegi dintre pozele de pe telefon.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Acestea sunt pozele (închipuite) de pe telefonul tău. <strong>Atinge floarea-soarelui</strong> 🌻.',
         hint: 'Atinge poza cu floarea-soarelui.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Superbă! 🌻 Sunt din grădina ta?', n: 4}); },
         say: 'Poți scrie o descriere, dacă vrei. Apoi <strong>atinge săgeata de trimitere</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Mesajele vocale sunt practice când scrisul e greu. Pe un telefon real <strong>ții apăsat pe microfon</strong> ⟦mic⟧ cât vorbești, apoi ridici degetul ca să trimiți. Aici, <strong>atinge o dată microfonul ca să începi, apoi atinge săgeata de trimitere</strong> ca să-l trimiți.',
         hint: 'Atinge microfonul, apoi săgeata de trimitere.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Bravo!</strong> Ai trimis un mesaj, o poză și un mesaj vocal. Ca să-i răspunzi oricând lui Sarah, deschide WhatsApp și atinge conversația cu ea.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Atinge conversația cu Sarah</strong> ca să o deschizi.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Sus în conversație sunt două butoane de apel: <strong>camera video</strong> pentru apel video și <strong>telefonul</strong> pentru apel vocal. <strong>Atinge camera video</strong> ⟦video⟧.',
         hints: {voice: 'Aceasta face un apel vocal, fără video. Pentru acest exercițiu, atinge camera video.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Sună pe telefonul lui Sarah, iar când răspunde vă puteți vedea. Dacă e gălăgie unde te afli, <strong>atinge microfonul</strong> ⟦mic⟧ ca să-ți oprești sunetul.',
         hint: 'Butonul microfonului este în rândul din partea de jos.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Ai sunetul oprit: Sarah te vede, dar nu te aude. Ca să-i arăți ceva, <strong>atinge butonul de întoarcere</strong> ⟦switch-camera⟧ pentru a trece la camera din spatele telefonului.',
         hints: {mute: 'Atinge din nou microfonul mai târziu ca să-l reactivezi. Deocamdată încearcă butonul de întoarcere.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Acum Sarah vede spre ce îți îndrepți telefonul. Când ai terminat, <strong>atinge butonul roșu</strong> ca să închei apelul.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Apelurile video consumă multe date. Care e cea mai bună variantă să faci unul?',
            options: [
                {t: 'Pe Wi-Fi acasă, când se poate', ok: true, why: 'Da. Pe Wi-Fi, apelurile nu îți consumă pachetul de date mobile, așa că sunt gratuite oricât de mult vorbești.'},
                {t: 'Nu contează', why: 'Pe date mobile, un apel video lung îți poate consuma rapid pachetul. Wi-Fi este cel mai bun când se poate.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Acum, grupurile. Grupul Familie are multe mesaje noi, iar notificările tot sună. <strong>Atinge grupul Familie.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Ca să schimbi setările unui grup, <strong>atinge numele grupului</strong> din partea de sus.', hint: 'Atinge cuvântul „Familie” din partea de sus a ecranului.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Atinge Dezactivează sunetul notificărilor.</strong> Vei primi în continuare mesajele, dar telefonul nu va mai vibra la fiecare.',
         hints: {'exit-group': 'Părăsește grupul l-ar părăsi complet. Dezactivarea sunetului e mai blândă: rămâi în grup, dar fără vibrații.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Alege pentru cât timp. <strong>Atinge 1 săptămână.</strong>',
         hints: {'mute-8h': 'Merg și 8 ore. Pentru acest exercițiu, atinge 1 săptămână.', 'mute-always': 'Merge și Întotdeauna, dar ai putea pierde lucruri. Pentru acest exercițiu, atinge 1 săptămână.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Bravo!</strong> Ai făcut un apel video, ți-ai oprit sunetul, ai întors camera și ai redus la tăcere un grup aglomerat. Poți citi în continuare mesajele grupului oricând vrei.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Salut!', ticks: 'read', n: 1}, {text: 'Bună, mamă! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Prânz de duminică la noi? 🍗', n: 1}, {from: 'Sarah', text: 'Da, vă rog!', n: 2}, {from: 'Dave', text: 'Cine aduce tortul? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Setările WhatsApp sunt chiar în aplicație. <strong>Atinge Setări</strong> în dreapta jos.',
                hints: {'chat-unknown': 'Ne ocupăm de mesajul acela mai târziu. Mai întâi, atinge Setări în dreapta jos.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Setările WhatsApp sunt chiar în aplicație. <strong>Atinge cele trei puncte ⋮</strong> din dreapta sus.',
                hints: {'chat-unknown': 'Ne ocupăm de mesajul acela mai târziu. Mai întâi, atinge cele trei puncte din dreapta sus.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Atinge Setări.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Atinge Cont.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Verificarea în doi pași</strong> adaugă un PIN necesar dacă cineva încearcă să-ți configureze WhatsApp pe alt telefon. Chiar dacă un escroc află codul tău din 6 cifre, nu poate intra. <strong>Atinge Verificare în doi pași.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Atinge Activează.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Alege un PIN din 6 cifre, diferit de codul de deblocare al telefonului. Pentru acest exercițiu, <strong>scrie ${pinText}</strong>. <em>Nu scrie aici un PIN real.</em>`,
             hint: `Scrie PIN-ul de exersare ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Scrie din nou ${pinText}</strong> ca să confirmi.`, hint: `Scrie din nou ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Dacă adaugi adresa de e-mail, îți poți reseta PIN-ul dacă îl uiți. Merită să o faci pe telefonul tău real. Aici, <strong>atinge Următorul</strong>.',
             hints: {skip: 'Poți omite, dar dacă uiți PIN-ul, te-ai putea bloca. Atinge Următorul pentru acest exercițiu.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Verificarea în doi pași este activată. <strong>Atinge Gata.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Un mesaj spune că e de la <em>„Asistența WhatsApp”</em> și îți cere PIN-ul de verificare în doi pași ca să „îți verifice contul”. Ce faci?',
                options: [
                    {t: 'Îl trimit, e de la WhatsApp', why: 'WhatsApp nu îți va scrie niciodată ca să îți ceară PIN-ul sau codul. Acesta este un escroc care încearcă să-ți preia contul.'},
                    {t: 'Nu răspund, îl blochez și îl raportez', ok: true, why: 'Exact. Nimeni, nici măcar WhatsApp, nu trebuie să îți ceară vreodată PIN-ul sau codul din 6 cifre.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Apoi, oprește necunoscuții să te adauge în grupuri. Setarea se află în <strong>Confidențialitate</strong>. <strong>Atinge Grupuri.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Contactele mele'; },
             say: '„Toată lumea” înseamnă că orice necunoscut te poate adăuga într-un grup, lucru pe care îl folosesc escrocii. <strong>Atinge Contactele mele.</strong>',
             hints: {'groups-everyone': 'Toată lumea lasă necunoscuții să te adauge în grupuri, inclusiv în grupuri de înșelătorie. Atinge Contactele mele.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'A sosit un mesaj de la un număr pe care nu îl cunoști: „Bună, mamă, sunt eu! Număr nou…”. Este înșelătoria „Bună, mamă”. <strong>Atinge-l ca să-l deschizi.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Bună, mamă, sunt eu! Număr nou, telefonul vechi s-a stricat. Mă poți ajuta să plătesc o factură? Îți dau banii înapoi mâine x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Nu răspunde. WhatsApp observă că numărul nu este în contactele tale. <strong>Atinge Blochează.</strong>',
             hints: {'add-contact': 'Nu adăuga un escroc în contacte. Atinge Blochează.', video: 'Nu-i suna înapoi. Atinge Blochează.', voice: 'Nu-i suna înapoi. Atinge Blochează.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Bună, mamă, sunt eu! Număr nou, telefonul vechi s-a stricat. Mă poți ajuta să plătesc o factură? Îți dau banii înapoi mâine x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '„Raportează la WhatsApp” este bifat, ceea ce îl ajută pe WhatsApp să oprească escrocul. <strong>Atinge Blochează.</strong>',
             hints: {cancel: 'Anulează l-ar lăsa să îți mai poată scrie. Atinge Blochează.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Bravo!</strong> Ai activat verificarea în doi pași, ai oprit necunoscuții să te adauge în grupuri și ai blocat și raportat un escroc. Dacă ai vreodată dubii cu privire la un mesaj de la familie, sună-i la numărul pe care îl ai deja.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Înapoi') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Înapoi')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Aplicațiile care acceptă Dynamic Type își vor ajusta dimensiunea la cea preferată de tine pentru citit.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Dimensiune text', [], {top: slider, back: 'Afișaj'});
        return list(p, 'Dimensiune afișaj și text', [{caption: 'Dimensiunea fontului'}, {id: 'bold', label: 'Text aldin', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Dimensiunea textului se află în aplicația <strong>Configurări</strong>. <strong>Atinge Configurări.</strong>', hint: 'Configurări este pictograma gri cu o rotiță.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Atinge Ecran și luminozitate.</strong>', hint: 'Se află în al treilea grup, sub Accesibilitate.'},
        {screen: c => list(p, 'Ecran și luminozitate', [{caption: 'ASPECT'}, {label: 'Luminos', value: '⟦check⟧'}, {caption: 'TEXT'}, {id: 'text-size', label: 'Dimensiune text'}, {id: 'bold', label: 'Text aldin', toggle: !!c.bold}], {back: 'Setări'}),
         target: 'text-size', say: '<strong>Atinge Dimensiune text.</strong>', hints: {bold: 'Textul aldin vine după. Mai întâi, atinge Dimensiune text.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Trage cursorul spre dreapta ca să mărești scrisul. Aici, <strong>atinge de două ori litera A mare</strong> și urmărește cum crește textul.', hint: 'Atinge litera A mare din dreapta cursorului.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Mult mai ușor de citit! Acum <strong>atinge ‹ Afișaj</strong> din partea de sus ca să te întorci.'},
        {screen: c => list(p, 'Ecran și luminozitate', [{caption: 'ASPECT'}, {label: 'Luminos', value: '⟦check⟧'}, {caption: 'TEXT'}, {id: 'text-size', label: 'Dimensiune text'}, {id: 'bold', label: 'Text aldin', toggle: !!c.bold}], {back: 'Setări'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Textul aldin</strong> face literele mai groase și mai clare. <strong>Atinge-l ca să-l activezi.</strong>'},
        {screen: c => list(p, 'Ecran și luminozitate', [{caption: 'TEXT'}, {label: 'Dimensiune text'}, {label: 'Text aldin', toggle: true}], {back: 'Setări'}),
         question: {q: 'Textul tot e prea mic, chiar și la cea mai mare setare?', options: [
            {t: 'Nu se mai poate face nimic', why: 'Mai sunt și alte variante! Configurări > Accesibilitate > Dimensiune afișaj și text > Text mai mare oferă dimensiuni și mai mari.'},
            {t: 'Configurări > Accesibilitate > Dimensiune afișaj și text > Text mai mare', ok: true, why: 'Da. Activează acolo Dimensiuni accesibile mai mari pentru un text cu adevărat mare.'}]}},
        {screen: c => list(p, 'Ecran și luminozitate', [{caption: 'TEXT'}, {label: 'Dimensiune text'}, {label: 'Text aldin', toggle: true}], {back: 'Setări'}), done: true,
         say: '<strong>Bravo!</strong> Textul tău este mai mare și mai aldin, în Configurări și în majoritatea aplicațiilor.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Dimensiunea textului se află în aplicația <strong>Configurări</strong>. <strong>Atinge Configurări.</strong>', hint: 'Setări este pictograma cu o rotiță.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Atinge Afișaj și atingere.</strong> <em>Pe un Samsung se numește Afișaj, apoi Dimensiunea și stilul fontului.</em>'},
        {screen: () => list(p, 'Afișaj și atingere', [{id: 'dark', label: 'Temă întunecată', toggle: false}, {id: 'text-size', label: 'Dimensiune afișaj și text', sub: 'Dimensiunea fontului, text aldin'}, {id: 'brightness', label: 'Nivel de luminozitate', value: '70%'}]),
         target: 'text-size', say: '<strong>Atinge Dimensiune afișaj și text.</strong>', hints: {dark: 'Tema întunecată schimbă culorile, nu dimensiunea. Atinge Dimensiune afișaj și text.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Trage cursorul Dimensiunea fontului spre dreapta ca să mărești scrisul. Aici, <strong>atinge de două ori litera A mare</strong>.', hint: 'Atinge litera A mare din dreapta cursorului.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Textul aldin</strong> face literele mai clare. <strong>Atinge-l ca să-l activezi.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Textul tot e prea mic, chiar și la cea mai mare setare?', options: [
            {t: 'Nu se mai poate face nimic', why: 'Încearcă și Dimensiune afișaj, pe aceeași pagină: face totul mai mare, inclusiv butoanele și pictogramele.'},
            {t: 'Măresc și Dimensiune afișaj', ok: true, why: 'Da. Dimensiune afișaj mărește tot ce este pe ecran, nu doar textul.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Bravo!</strong> Textul tău este mai mare și mai aldin, în Configurări și în majoritatea aplicațiilor.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' pe mov' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Nu deranja' : 'Focus'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Nu deranja · Activat' : 'Nu deranja · Dezactivat'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Glisează în sus ca să închizi' : 'Închide'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Dacă telefonul nu sună, poate fi activat Nu deranja. Setările rapide se află în <strong>Centrul de control</strong>: <strong>glisează în jos din colțul din dreapta sus</strong> (sau atinge banda de sus).'
                          : 'Dacă telefonul nu sună, poate fi activat Nu deranja. <strong>Glisează în jos din partea de sus a ecranului</strong> ca să vezi setările rapide (sau atinge banda de sus).',
         hints: {'pull-up': 'Glisează în cealaltă direcție: în jos, din partea de sus.', 'pull-left': 'Glisează în jos, nu într-o parte.', 'pull-right': 'Glisează în jos, nu într-o parte.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Luna ⟦moon⟧ înseamnă că <strong>Nu deranja este activat</strong>, deci apelurile și mesajele sunt reduse la tăcere. <strong>Atinge-o ca să-l dezactivezi.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Acum ridică volumul cu <strong>butonul de volum de pe marginea telefonului</strong> (cel de sus). <strong>Atinge de 3 ori ＋ de pe marginea telefonului de exersare.</strong>',
         hint: 'Atinge butonul ＋ de pe marginea dreaptă a telefonului.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'iPhone-ul tot nu sună. Ce altceva ar putea fi?', options: [
                {t: 'Comutatorul Sonerie/Silențios sau butonul Action este setat pe silențios', ok: true, why: 'Da. Multe iPhone-uri au un mic comutator deasupra butoanelor de volum: dacă apare portocaliu, telefonul este pe silențios. Cele mai noi folosesc în schimb butonul Action.'},
                {t: 'Telefonul este stricat', why: 'De obicei nu! Verifică mai întâi comutatorul de silențios de deasupra butoanelor de volum.'}]}
            : {q: 'Ai apăsat butonul de volum, dar a schimbat doar volumul media. Ce faci acum?', options: [
                {t: 'Ating ⋯ sau pictograma de setări de pe bara de volum ca să văd volumul soneriei', ok: true, why: 'Da. Butoanele de volum schimbă adesea volumul media; atinge cele trei puncte de pe bara de volum ca să schimbi volumul soneriei.'},
                {t: 'Renunț', why: 'Atinge cele trei puncte ⋯ de pe bara de volum care apare și ridică volumul soneriei.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Bravo!</strong> Nu deranja este dezactivat și volumul este ridicat, așa că vei auzi apelurile și mesajele.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500 mg</strong><br>Luați 1-2 comprimate la fiecare 4-6 ore.<br>Nu luați mai mult de 8 comprimate în 24 de ore.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Lupă', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'iPhone-ul tău are o aplicație <strong>Lupă</strong>. Dacă nu este pe ecranul principal, glisează în jos la mijlocul ecranului și scrie „Lupă”. <strong>Atinge Lupă.</strong>'
                          : 'Multe telefoane Android au o aplicație <strong>Lupă</strong>. <em>Pe un Samsung se află în setările rapide sau în Accesibilitate.</em> <strong>Atinge Lupă.</strong>',
         hint: 'Caută pictograma neagră cu o lupă.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Îndreaptă telefonul spre ceva mic, cum ar fi eticheta acestui medicament. <strong>Atinge ＋ de trei ori</strong> ca să mărești (pe un telefon real poți trage cursorul).', hint: 'Atinge ＋ din dreapta cursorului.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'În lumină slabă, lanterna ajută. <strong>Atinge lanterna</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Ți se mișcă mâinile? <strong>Atinge butonul mare rotund</strong> ca să oprești imaginea, ca să poți citi fără să ții telefonul nemișcat.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'La ce altceva mai este utilă lupa?', options: [
            {t: 'Să citești meniuri, etichete cu prețuri și textul mărunt din scrisori', ok: true, why: 'Da, și o ai mereu în buzunar. Unii o țin în Centrul de control sau în setările rapide, ca să o deschidă dintr-o atingere.'},
            {t: 'Să faci apelurile mai tari', why: 'Pentru asta sunt butoanele de volum. Lupa e pentru a vedea mai clar lucrurile mici.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Bravo!</strong> Acum poți mări textul mărunt, îl poți lumina și poți opri imaginea.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Ne vedem joi la cafeaua de dimineață' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Vii joi? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Mesaj text</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Ascult… vorbește acum</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Poți vorbi în loc să scrii. <strong>Deschide Mesaje.</strong>', hint: 'Mesaje este balonul de conversație verde.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean a întrebat despre joi. <strong>Atinge caseta de mesaj</strong> din partea de jos.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Apare tastatura. <strong>Atinge microfonul</strong> ⟦mic⟧ de pe tastatură, apoi spune mesajul.', hint: 'Microfonul este pe tastatură, lângă bara de spațiu.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Pe un telefon real ai spune acum: <em>„Ne vedem joi la cafeaua de dimineață”</em>. Cuvintele apar pe măsură ce vorbești. Verifică-le, apoi <strong>atinge trimite</strong> ⟦send-horizontal⟧.',
         hint: 'Așteaptă să apară cuvintele, apoi atinge săgeata de trimitere.'},
        {screen: () => home(p), target: 'settings',
         say: 'Telefonul îți poate și <strong>citi lucruri cu voce tare</strong>. Hai să activăm asta. <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Atinge Accesibilitate.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilitate', [{caption: 'VEDERE'}, {id: 'voiceover', label: 'VoiceOver', value: 'Dezactivat'}, {id: 'zoom', label: 'Zoom', value: 'Dezactivat'}, {id: 'spoken', label: 'Conținut vorbit'}], {back: 'Setări'})
            : list(p, 'Accesibilitate', [{id: 'select-speak', label: 'Selectează ca să asculți', sub: 'Dezactivat'}, {id: 'talkback', label: 'TalkBack', sub: 'Dezactivat'}, {id: 'magnification', label: 'Mărire'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Atinge Conținut vorbit.</strong>' : '<strong>Atinge Selectează ca să asculți.</strong>',
         hints: {voiceover: 'VoiceOver schimbă felul în care funcționează tot telefonul, ceea ce poate deruta. Atinge Conținut vorbit.', talkback: 'TalkBack schimbă felul în care funcționează tot telefonul, ceea ce poate deruta. Atinge Selectează ca să asculți.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Conținut vorbit', [{id: 'speak-selection', label: 'Citire selecție', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Citire ecran', toggle: !!c.speakScreen, sub: 'Glisează în jos cu două degete din partea de sus a ecranului ca să auzi ecranul citit.'}], {back: 'Accesibilitate'})
            : list(p, 'Selectează ca să asculți', [{id: 'speak-screen', label: 'Folosește Selectează ca să asculți', toggle: !!c.speakScreen, sub: 'Atinge scurtătura, apoi atinge orice de pe ecran ca să auzi citit.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Activează Citire ecran.</strong> Apoi, oriunde pe telefon, glisarea în jos din partea de sus cu două degete citește ecranul cu voce tare.' : '<strong>Activează Folosește Selectează ca să asculți.</strong> Apare un mic buton de scurtătură: atinge-l, apoi atinge orice text ca să-l auzi.',
         hints: {'speak-selection': 'Aceasta citește doar cuvintele pe care le evidențiezi. Citire ecran e mai ușor: activează-l pe acela.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Conținut vorbit', [{label: 'Citire selecție', toggle: false}, {label: 'Citire ecran', toggle: true}], {back: 'Accesibilitate'})
            : list(p, 'Selectează ca să asculți', [{label: 'Folosește Selectează ca să asculți', toggle: true}]), done: true,
         say: '<strong>Bravo!</strong> Acum poți vorbi în loc să scrii și poți pune telefonul să îți citească lucrurile cu voce tare.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Multe aparate auditive se pot conecta la telefon, așa că apelurile și muzica ajung direct în ele. <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Atinge Accesibilitate.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilitate', [{caption: 'AUZ'}, {id: 'hearing-devices', label: 'Dispozitive auditive'}, {id: 'live-captions', label: 'Subtitrări live', value: c.captions ? 'Activat' : 'Dezactivat'}, {id: 'subtitles', label: 'Subtitrări și legende'}], {back: 'Setări'})
            : list(p, 'Accesibilitate', [{id: 'hearing-devices', label: 'Aparate auditive', sub: c.paired ? 'Conectat' : 'Neconectat'}, {id: 'live-captions', label: 'Subtitrare live', sub: c.captions ? 'Activat' : 'Dezactivat'}, {id: 'sound-amp', label: 'Amplificator de sunet'}]),
         target: 'hearing-devices', say: `<strong>Atinge ${p === 'ios' ? 'Dispozitive auditive' : 'Aparate auditive'}.</strong> Pune mai întâi aparatele auditive și închide capacele bateriilor ca să le repornești, ca telefonul să le găsească.`,
         hints: {'live-captions': 'Subtitrările vin după. Mai întâi, conectează aparatele auditive.'}},
        {screen: c => list(p, p === 'ios' ? 'Dispozitive auditive' : 'Aparate auditive', [{caption: p === 'ios' ? 'DISPOZITIVE AUDITIVE MFI' : 'Dispozitive disponibile'}, {id: 'aids', label: 'Aparatele auditive ale lui Margaret', sub: 'Stânga și dreapta'}],
            {overlay: c.pairing ? dialog(p, 'Asociezi cu „Aparatele auditive ale lui Margaret”?', 'Vor fi folosite pentru apeluri și sunet.', [['cancel', 'Anulează'], ['pair', 'Asociază']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Telefonul le găsește. <strong>Atinge aparatele tale auditive.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Dispozitive auditive' : 'Aparate auditive', [{id: 'aids', label: 'Aparatele auditive ale lui Margaret', sub: 'Stânga și dreapta'}],
            {overlay: dialog(p, 'Asociezi cu „Aparatele auditive ale lui Margaret”?', 'Vor fi folosite pentru apeluri și sunet.', [['cancel', 'Anulează'], ['pair', 'Asociază']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Atinge Asociază.</strong> (Cu două aparate auditive, telefonul te poate întreba de două ori, o dată pentru fiecare.)'},
        {screen: c => list(p, p === 'ios' ? 'Dispozitive auditive' : 'Aparate auditive', [{label: 'Aparatele auditive ale lui Margaret', sub: 'Conectat ⟦check⟧'}]), target: 'back',
         say: 'Conectat! Apelurile se vor auzi acum prin aparatele tale auditive. <strong>Atinge Înapoi.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Accesibilitate', [{caption: 'AUZ'}, {id: 'hearing-devices', label: 'Dispozitive auditive'}, {id: 'live-captions', label: 'Subtitrări live', value: c.captions ? 'Activat' : 'Dezactivat'}], {back: 'Setări'})
            : list(p, 'Accesibilitate', [{id: 'hearing-devices', label: 'Aparate auditive', sub: 'Conectat'}, {id: 'live-captions', label: 'Subtitrare live', sub: c.captions ? 'Activat' : 'Dezactivat'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Subtitrări live' : 'Subtitrare live'}</strong> arată pe ecran cuvintele rostite în orice: videoclipuri, apeluri și mesaje vocale. <strong>Atinge-l ca să-l activezi.</strong>`},
        {screen: c => list(p, 'Accesibilitate', [{label: p === 'ios' ? 'Subtitrări live' : 'Subtitrare live', toggle: true}, {label: 'Aparate auditive', sub: 'Conectat'}]), done: true,
         say: '<strong>Bravo!</strong> Aparatele tale auditive sunt conectate, iar cuvintele rostite apar acum ca subtitrări.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Furnică', 'Bursuc', 'Pisică', 'Câine', 'Vultur', 'Vulpe', 'Capră', 'Arici', 'Ibis', 'Stancă', 'Pescăraș albastru', 'Miel', 'Cârtiță',
                     'Triton', 'Vidră', 'Pufin', 'Măcăleandru', 'Focă', 'Broască râioasă', 'Șoarece de câmp', 'Pitulice', 'Zebră'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Ține apăsat pe floare</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Copiază</span><span>Distribuie</span><span>Șterge</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebră</h3><p>Zebrele au dungi albe și negre. Nu există două zebre cu exact același model.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Atingerea</strong> înseamnă să atingi ușor ecranul cu un deget și să-l ridici imediat, ca atunci când apeși un buton. <strong>Atinge steaua.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Apăsarea lungă</strong> înseamnă să ții degetul pe ceva o secundă sau două. De obicei apar opțiuni suplimentare. <strong>Ține apăsat pe floare</strong> până se întâmplă ceva. (Cu mouse-ul, ține apăsat butonul.)',
         hint: 'Ține degetul pe floare o secundă sau două.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'A apărut un meniu. Ce face de obicei apăsarea lungă?', options: [
            {t: 'Arată opțiuni suplimentare, precum copiază, distribuie sau șterge', ok: true, why: 'Da. Apăsarea lungă pe mesaje, poze și aplicații afișează opțiuni ca acestea.'},
            {t: 'Șterge lucrurile imediat', why: 'Nu, doar arată un meniu cu opțiuni. Nu se întâmplă nimic până nu alegi una.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Glisarea</strong> înseamnă să-ți plimbi degetul pe ecran, ca atunci când întorci o pagină. <strong>Glisează spre stânga pe poză de două ori</strong> ca să vezi următoarele. (Cu mouse-ul, dă clic, trage și eliberează.)',
         hint: 'Plimbă degetul de la dreapta la stânga pe poză. Sau folosește butonul „Nu poți glisa?”.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Derularea</strong> înseamnă să-ți plimbi degetul în sus pe ecran ca să vezi mai mult dintr-o listă, ca aceasta. <strong>Derulează în jos și atinge Zebră</strong>, chiar în partea de jos. (Cu mouse-ul, folosește rotița.)',
         hint: 'Plimbă lista în sus cu degetul ca să ajungi la Zebră, în partea de jos.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Ca să te întorci o pagină pe iPhone, <strong>atinge ‹ Înapoi</strong> din stânga sus (sau glisează dinspre marginea stângă a ecranului).' : 'Ca să te întorci o pagină pe Android, <strong>atinge săgeata de întoarcere ◁</strong> din partea de jos (sau glisează dinspre marginea stângă sau dreaptă a ecranului).',
         hints: {'home-pill': 'Aceasta te duce direct acasă. Atinge în schimb săgeata de întoarcere ◁.', 'home-bar': 'Aceasta te duce direct acasă. Atinge în schimb ‹ Înapoi.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Ca să ajungi la ecranul principal de oriunde, <strong>glisează în sus de la bara din partea de jos</strong> a ecranului (sau atinge bara de aici). iPhone-urile mai vechi cu buton principal rotund: apasă-l.'
                          : 'Ca să ajungi la ecranul principal de oriunde, <strong>atinge cercul de acasă ○</strong> din partea de jos (sau glisează în sus dinspre marginea de jos).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Înapoi te duce o pagină înapoi. Atinge cercul de acasă ○ ca să ajungi acasă.'}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Ai exersat atingerea, apăsarea lungă, glisarea, derularea, întoarcerea și revenirea acasă: gesturile pe care le vei folosi în fiecare zi.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Conectat', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Internet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'REȚELE' : 'Rețele disponibile'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Setări',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Introdu parola pentru „BT-Hub-7F2A”</strong></p>
                ${field('wifipass', 'Parolă', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Conectează-te' : 'Conectează'}</button>
                <button type="button" class="cp" data-tap="cancel">Anulează</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wi-Fi-ul de acasă îți economisește datele mobile. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Atinge Wi-Fi</strong>, aproape de partea de sus.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Atinge Rețea și internet.</strong> <em>Pe un Samsung se numește Conexiuni, apoi Wi-Fi.</em>'},
               {screen: () => list(p, 'Rețea și internet', [{id: 'internet', label: 'Internet', sub: 'Wi-Fi și date mobile'}, {id: 'sims', label: 'SIM-uri'}, {id: 'hotspot', label: 'Hotspot și tethering'}]),
                target: 'internet', say: '<strong>Atinge Internet.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Numele și parola Wi-Fi sunt de obicei pe un autocolant de pe spatele routerului (cutia cu luminițe). Autocolantul acestui router de exersare spune:<br><span class="ahd">Rețea: <strong>BT-Hub-7F2A</strong><br>Parolă: <strong>Green-Apple-42</strong></span><strong>Atinge BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Acesta este Wi-Fi-ul unui vecin. Caută numele de pe autocolant: BT-Hub-7F2A.', 'net-sky-12345': 'Acesta este Wi-Fi-ul altcuiva. Caută numele de pe autocolant: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Parola trebuie să se potrivească exact cu autocolantul, inclusiv literele mari și liniuțele: Green-Apple-42',
         say: 'Scrie parola <strong>exact</strong> cum este pe autocolant: <strong>Green-Apple-42</strong>. Literele mari contează! Apoi <strong>atinge Conectează-te</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Ești conectat! Telefonul se va conecta singur la acest Wi-Fi ori de câte ori ești acasă. E sigur să folosești Wi-Fi gratuit într-o cafenea?', options: [
            {t: 'Da, pentru navigat, dar evită banca online pe el', ok: true, why: 'Exact. Wi-Fi-ul public e în regulă pentru citit știri sau pentru a vedea ora unui autobuz. Pentru bancă, folosește datele mobile sau Wi-Fi-ul de acasă.'},
            {t: 'Da, pentru orice', why: 'Wi-Fi-ul public poate fi urmărit de alții. E în regulă pentru navigat, dar pentru bancă folosește datele mobile sau Wi-Fi-ul de acasă.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Bravo!</strong> Ești conectat la Wi-Fi. Caută simbolul Wi-Fi în formă de evantai în partea de sus a ecranului.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Contact nou' : 'Creează contact', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Prenume', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Număr de mobil', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gata' : 'Salvează'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Contact', [
        {label: 'Mobil', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Adaugă la favorite' : (ctx.fav ? '⟦star⟧ Favorit' : '⟦star⟧ Adaugă la favorite')},
        {id: 'share', label: 'Trimite contactul'}], {back: 'Contacte'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Contacte', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Dacă salvezi numărul cuiva, îl poți suna după nume. Pe iPhone, contactele se află în aplicația <strong>Telefon</strong>. <strong>Atinge Telefon.</strong>' : '<strong>Atinge Contacte.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Contacte', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Contacte', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Aceasta este lista ta de contacte. <strong>Atinge +</strong> din dreapta sus ca să adaugi pe cineva.' : 'Aceasta este lista ta de contacte. <strong>Atinge butonul +</strong> ca să adaugi pe cineva.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Scrie un prenume și numărul de exersare 07700 900456, apoi atinge ' + (p === 'ios' ? 'Gata.' : 'Salvează.'),
         say: `Scrie <strong>prenumele</strong> persoanei (încearcă „Ann”) și numărul ei. Pentru exersare, folosește <strong>07700 900456</strong>. Apoi <strong>atinge ${p === 'ios' ? 'Gata' : 'Salvează'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Salvat! Favoritele sunt persoanele pe care le suni cel mai des, afișate sus ca să le suni dintr-o atingere. <strong>Atinge ' + (p === 'ios' ? 'Adaugă la favorite' : 'steaua') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Ce contact merită salvat cu „ICE” (In Case of Emergency, adică în caz de urgență) în fața numelui?', options: [
            {t: 'Ruda ta cea mai apropiată, de exemplu „ICE Sarah”', ok: true, why: 'Da. Paramedicii știu să caute ICE. Și mai bine, adaugă un contact de urgență în Fișa ta medicală, lucru explicat în cursul Telefonul în siguranță.'},
            {t: 'Banca ta', why: 'ICE este pentru persoana de contactat dacă ți se întâmplă ceva, de obicei ruda ta cea mai apropiată.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Bravo!</strong> Ai salvat un contact și l-ai făcut favorit.'},
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
    const recents = p => app(p, 'Recente', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Telefonul sună: te sună Jean. <strong>Atinge butonul verde ca să răspunzi.</strong>' + (p === 'android' ? ' <em>Pe unele telefoane Android, glisezi în schimb butonul verde în sus.</em>' : ' <em>Dacă iPhone-ul este blocat, glisezi în schimb butonul verde într-o parte.</em>'),
         hints: {decline: 'Roșu respinge apelul. Atinge verde ca să răspunzi.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Vorbești! Ca să auzi mai bine sau ca să vorbești fără mâini, <strong>atinge difuzor</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Când ai terminat, <strong>atinge butonul roșu</strong> ca să închizi.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Ai pierdut mai devreme un apel de la Dave. Apelurile pierdute apar în <strong>roșu</strong> în apelurile recente. <strong>Atinge Dave</strong> ca să-l suni înapoi.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Sună la Dave. Când ai terminat de vorbit, <strong>atinge butonul roșu</strong> ca să închizi.'},
        {screen: () => recents(p), question: {q: 'Cineva te sună de la un număr pe care nu îl cunoști și spune că e de la banca ta. Ce faci?', options: [
            {t: 'Închid și sun la 159 ca să ajung în siguranță la banca mea', ok: true, why: 'Exact. Poți oricând să închizi și să suni înapoi la un număr de încredere. 159 te leagă la propria ta bancă.'},
            {t: 'Fac ce spun ei, e banca', why: 'Escrocii se dau mereu drept bănci, iar numărul poate fi falsificat. Închide și sună la 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Bravo!</strong> Poți răspunde, folosi difuzorul, închide și suna înapoi la apelurile pierdute.'},
    ], {});

    function smsList(p) {
        return app(p, 'Mesaje', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Ultimul tău control a fost în martie. Programează-te online sau sună-ne.</span><small>acum 3 luni</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Mesaj text', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Mesajele text se află în aplicația <strong>Mesaje</strong>. <strong>Atinge Mesaje.</strong>', hint: 'Este pictograma cu balon de conversație.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Mesajele noi apar îngroșat. <strong>Atinge mesajul de la Dentist</strong> ca să-l citești.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Scrie mai întâi Y în caseta de mesaj, apoi atinge săgeata de trimitere.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Dentistul îți cere să răspunzi <strong>Y</strong> pentru confirmare. <strong>Atinge caseta de mesaj, scrie Y, apoi atinge săgeata de trimitere</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Gata! Acum face ordine: <strong>ține apăsat pe mesajul vechi</strong> de sus (ține degetul pe el o secundă sau două).', hint: 'Ține degetul pe mesajul vechi de sus până apare un meniu.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Apare un meniu. <strong>Atinge Șterge.</strong>',
         hints: {copy: 'Copiază copiază cuvintele. Atinge Șterge.', forward: 'Redirecționează îl trimite altcuiva. Atinge Șterge.'}},
        {screen: c => smsChat(p, c), question: {q: 'Un SMS de la un număr necunoscut spune că pachetul tău este reținut și îți cere să plătești 1,45 £ printr-un link. Ce faci?', options: [
            {t: 'Nu ating linkul. Îl redirecționez la 7726, apoi îl șterg', ok: true, why: 'Exact. 7726 este gratuit și îl raportează rețelei tale. Curierii nu trimit SMS-uri cu linkuri prin care cer taxe.'},
            {t: 'Plătesc, sunt doar 1,45 £', why: 'Cei 1,45 £ sunt momeală ca să ți se afle datele cardului. Nu atinge linkul: redirecționează-l la 7726 și șterge-l.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Bravo!</strong> Poți citi mesaje text, poți răspunde la ele și poți șterge ce nu îți trebuie.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Hărți', 15], ['WhatsApp', 9], ['Cameră', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Baterie', [{id: 'low-power', label: 'Mod economie de energie', toggle: saver, sub: 'Reduce activitatea din fundal până când poți încărca complet bateria.'}, {caption: 'UTILIZAREA BATERIEI PE APLICAȚII'}], {back: 'Setări', top: head, bottom: apps})
            : list(p, 'Baterie', [{id: 'low-power', label: 'Economisire baterie', toggle: saver, sub: 'Dezactivează unele funcții ca bateria să țină mai mult.'}, {caption: 'Utilizarea bateriei'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Bateria se termină? <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Atinge Baterie.</strong>', hint: p === 'ios' ? 'Baterie este în al treilea grup.' : 'Baterie este în listă, după Notificări.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Ai 23%. <strong>${p === 'ios' ? 'Mod economie de energie' : 'Economisire baterie'}</strong> o face să țină mai mult. <strong>Atinge-l ca să-l activezi.</strong> Simbolul bateriei devine ${p === 'ios' ? 'yellow' : 'orange'} ca să-ți amintească.`},
        {screen: c => batteryPage(p, c), question: {q: 'Lista arată că Facebook a consumat cel mai mult din baterie astăzi. Ce ajută bateria să țină cel mai mult?', options: [
            {t: 'Reduc luminozitatea ecranului și închid aplicațiile cu care am terminat', ok: true, why: 'Da. Ecranul consumă cea mai multă energie. Redu luminozitatea, iar aplicații precum Facebook și YouTube consumă mult.'},
            {t: 'O încarc la 100% în fiecare oră', why: 'Încărcarea frecventă nu face rău, dar nu o face să țină mai mult. Redu luminozitatea și folosește modul de economisire a bateriei.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Bravo!</strong> Economisirea bateriei este activată și știi care aplicații consumă cel mai mult.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'mobil · 3 apeluri' : 'Posibil spam · 3 apeluri'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Recente', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>mobil</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>mobil</small><span>Ieri</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Același număr necunoscut tot te sună. Hai să-l blocăm. <strong>Deschide aplicația Telefon.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `În apelurile recente, <strong>atinge ⓘ</strong> de lângă numărul 07700 900842${p === 'android' ? ' (pe unele telefoane Android, atinge chiar numărul)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Trimite contactul'}, {id: 'block', label: p === 'ios' ? 'Blochează acest apelant' : 'Blochează/raportează spam', danger: true}], {back: 'Recente'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Blochează acest apelant' : 'Blochează/raportează spam'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Blochezi acest apelant?', 'Nu vei primi apeluri telefonice, mesaje sau FaceTime de la persoanele din lista ta de blocare.', [['cancel', 'Anulează'], ['confirm', 'Blochează contactul']])
            : dialog(p, 'Blochezi 07700 900842?', '⟦square-check⟧ Raportează apelul ca spam', [['cancel', 'Anulează'], ['confirm', 'Blochează']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Blochează contactul' : 'Blochează'}.</strong>${p === 'android' ? ' Dacă lași bifat „Raportează apelul ca spam”, îi ajuți și pe alții să fie avertizați.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Blocat! Poți și să <strong>reduci la tăcere toate apelurile de la numere pe care nu le cunoști</strong>. <strong>Atinge Configurări.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Derulează până jos și <strong>atinge Aplicații</strong>.'},
            {screen: () => list(p, 'Aplicații', [{id: 'app-phone', label: 'Telefon'}, {id: 'app-messages', label: 'Mesaje'}, {id: 'app-mail', label: 'Mail'}], {back: 'Setări'}), target: 'app-phone', say: '<strong>Atinge Telefon.</strong>'},
            {screen: c => list(p, 'Telefon', [{id: 'silence', label: 'Dezactivează sunetul apelanților necunoscuți', toggle: !!c.silence}, {id: 'blocked', label: 'Contacte blocate', value: '1'}], {back: 'Aplicații'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Activează Dezactivează sunetul apelanților necunoscuți.</strong> Apelurile de la numere care nu sunt în contactele tale merg direct la mesageria vocală și apar în continuare în apelurile recente.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Blocat! Poți și să <strong>filtrezi apelurile spam</strong>. <strong>Atinge cele trei puncte ⋮</strong> din dreapta sus.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Atinge Setări.</strong>'},
            {screen: () => list(p, 'Setări', [{id: 'caller-id', label: 'ID apelant și spam'}, {id: 'blocked', label: 'Numere blocate'}, {id: 'sounds', label: 'Sunete și vibrații'}]), target: 'caller-id', say: '<strong>Atinge ID apelant și spam.</strong>'},
            {screen: c => list(p, 'ID apelant și spam', [{id: 'caller-show', label: 'Vezi ID-ul apelantului și al spamului', toggle: true}, {id: 'silence', label: 'Filtrează apelurile spam', toggle: !!c.silence, sub: 'Apelurile suspectate de spam nu vor suna pe telefonul tău'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Activează Filtrează apelurile spam.</strong> Apelurile suspectate de înșelătorie nu vor suna pe telefonul tău.'},
        ]),
        {screen: c => list(p, 'Gata', [{label: 'Numere blocate', value: '1'}, {label: p === 'ios' ? 'Dezactivează sunetul apelanților necunoscuți' : 'Filtrează apelurile spam', toggle: true}]),
         question: {q: 'Ar putea reducerea la tăcere a apelanților necunoscuți să te facă să pierzi un apel real, de la un spital sau de la un curier?', options: [
            {t: 'Da, așa că verifică din când în când mesageria vocală și apelurile pierdute', ok: true, why: 'Exact. Apelanții reali lasă de obicei un mesaj, iar apelurile pierdute apar în continuare în listă.'},
            {t: 'Nu, ei vor ajunge mereu la tine', why: 'Numerele necunoscute merg la mesageria vocală, inclusiv cele reale. Verifică din când în când mesageria vocală și apelurile pierdute.'}]}},
        {screen: () => list(p, 'Gata', [{label: 'Numere blocate', value: '1'}, {label: p === 'ios' ? 'Dezactivează sunetul apelanților necunoscuți' : 'Filtrează apelurile spam', toggle: true}]), done: true,
         say: '<strong>Bravo!</strong> Ai blocat un număr deranjant și ai redus apelurile de înșelătorie.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: pachetul tău este reținut din cauza unei taxe neplătite de 1,45 £. Plătește acum pentru a reprograma: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Către: ${field('fwdto', 'Număr', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Mulțumim. Trimite numărul de telefon de la care a venit SMS-ul de înșelătorie.</span><small>acum</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Mulțumim, raportul tău a fost primit.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Mesaj nou') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Mesaj text', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Mai multe… apoi Redirecționează' : 'Redirecționează'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Ai primit un SMS de înșelătorie care se dă drept Royal Mail. Înainte să-l ștergi, raportează-l, gratuit. <strong>Deschide Mesaje.</strong>'},
        {screen: () => app(p, 'Mesaje', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Atinge mesajul</strong> ca să-l deschizi. Nu atinge linkul din el!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Ține apăsat pe mesaj</strong> (ține degetul pe el) până apare un meniu. Nu atinge linkul.', hint: 'Ține degetul pe balonul gri al mesajului o secundă sau două.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Atinge Mai multe…</strong>, apoi săgeata de redirecționare (aici, un singur buton face ambele).' : '<strong>Atinge Redirecționează.</strong> (Pe unele telefoane se află sub cele trei puncte ⋮ din partea de sus.)',
         hints: {delete: 'Raportează-l mai întâi, apoi îl poți șterge.', copy: 'Atinge Redirecționează ca să-l trimiți la 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'În caseta „Către” scrie 7726 (pe tastatura telefonului scrie SPAM), apoi atinge trimite.',
         action: c => { c.sent7726 = true; }, say: 'În caseta <strong>Către</strong> scrie <strong>7726</strong>. (Pe tastatura telefonului scrie S-P-A-M.) Apoi <strong>atinge trimite</strong> ⟦send-horizontal⟧. Este gratuit.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Scrie numărul escrocului, 07700 900911, apoi atinge trimite.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 răspunde și întreabă de la ce număr a venit înșelătoria. <strong>Scrie 07700 900911</strong> și <strong>atinge trimite</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'L-ai raportat. Ce ar trebui să faci acum cu SMS-ul de înșelătorie?', options: [
            {t: 'Îl șterg și blochez numărul', ok: true, why: 'Da. Este raportat, deci îl poți șterge. Blocarea oprește alte SMS-uri de la acel număr.'},
            {t: 'Ating linkul ca să verific dacă e adevărat', why: 'Nu atinge niciodată linkurile din SMS-urile de înșelătorie. Șterge-l și blochează numărul.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Bravo!</strong> Ai raportat un SMS de înșelătorie la 7726, ceea ce ajută rețelele să-l blocheze pentru toată lumea. E-mailurile de înșelătorie se trimit la report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Actualizările repară probleme de securitate, deci sunt importante. Conectează mai întâi telefonul la încărcător și la Wi-Fi. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Atinge General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'Despre'}, {id: 'software', label: 'Actualizare software', value: '1'}, {id: 'storage', label: 'Spațiu iPhone'}], {back: 'Setări'}), target: 'software', say: '<strong>Atinge Actualizare software.</strong> Cifra 1 roșie înseamnă că așteaptă o actualizare.'},
        {screen: () => list(p, 'Actualizare software', [{id: 'auto', label: 'Actualizări automate', value: 'Dezactivat'}], {back: 'General',
            bottom: '<div class="hu"><strong>Actualizare iOS</strong><p>Această actualizare include remedieri importante de securitate și este recomandată tuturor utilizatorilor.</p><button type="button" class="ce co" data-tap="update-now">Actualizează acum</button></div>'}),
         target: 'update-now', say: '<strong>Atinge Actualizează acum.</strong>', hints: {auto: 'Merită să activezi și actualizările automate, după aceasta. Mai întâi, atinge Actualizează acum.'}},
        {screen: c => codeScreen(p, c, 'Introdu codul', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone-ul îți cere codul. <strong>Scrie codul de exersare 4 7 1 9 3 6.</strong>', hint: 'Scrie 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Actualizare software', [], {back: 'General', bottom: `<div class="hu"><strong>${c.busy ? 'Se descarcă…' : 'Gata de instalare'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Se descarcă mai întâi, ceea ce poate dura câteva minute. Apoi <strong>atinge Instalează acum</strong>. Telefonul repornește, așa că fă asta când nu ai nevoie de el 15–30 de minute.'},
        {screen: () => list(p, 'Actualizare software', [{id: 'auto', label: 'Actualizări automate', value: 'Activat'}], {back: 'General', bottom: '<div class="hu"><strong>iPhone-ul tău este actualizat</strong></div>'}),
         question: {q: 'Merită să activezi Actualizările automate?', options: [
            {t: 'Da, atunci se actualizează peste noapte, în timp ce se încarcă', ok: true, why: 'Exact. Configurări > General > Actualizare software > Actualizări automate. Se instalează peste noapte, când este la încărcător și pe Wi-Fi.'},
            {t: 'Nu, actualizările sunt opționale', why: 'Actualizările repară breșe de securitate pe care le folosesc escrocii. Actualizările automate te protejează fără să trebuiască să-ți amintești.'}]}},
        {screen: () => list(p, 'Actualizare software', [], {bottom: '<div class="hu"><strong>iPhone-ul tău este actualizat ⟦check⟧</strong></div>'}), done: true, say: '<strong>Bravo!</strong> Telefonul tău este actualizat și protejat împotriva ultimelor probleme.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Actualizările repară probleme de securitate, deci sunt importante. Conectează mai întâi telefonul la încărcător și la Wi-Fi. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Derulează în jos și <strong>atinge Sistem</strong>. <em>Pe un Samsung se numește Actualizare software, aproape de partea de jos.</em>'},
        {screen: () => list(p, 'Sistem', [{id: 'languages', label: 'Limbi'}, {id: 'date', label: 'Dată și oră'}, {id: 'software', label: 'Actualizările de software', sub: 'Actualizare disponibilă'}]), target: 'software', say: '<strong>Atinge Actualizări software.</strong>'},
        {screen: () => list(p, 'Actualizările de software', [{id: 'system-update', label: 'Actualizare de sistem', sub: 'Actualizare disponibilă'}, {id: 'play-update', label: 'Actualizare de sistem Google Play'}]), target: 'system-update', say: '<strong>Atinge Actualizare de sistem.</strong>'},
        {screen: () => list(p, 'Actualizare de sistem', [], {bottom: '<div class="hu"><strong>Actualizare de sistem disponibilă</strong><p>Include remedieri importante de securitate.</p><button type="button" class="ce dk" data-tap="download">Descarcă și instalează</button></div>'}),
         target: 'download', say: '<strong>Atinge Descarcă și instalează.</strong>'},
        {screen: c => list(p, 'Actualizare de sistem', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Se descarcă și se instalează…' : 'Repornește pentru a termina'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Se descarcă și se pregătește, ceea ce poate dura o vreme. Apoi <strong>atinge Repornește acum</strong>. Telefonul se oprește și pornește din nou, ceea ce durează câteva minute.'},
        {screen: () => list(p, 'Actualizare de sistem', [], {bottom: '<div class="hu"><strong>Sistemul tău este actualizat</strong></div>'}),
         question: {q: 'Telefonul tău nu a primit nicio actualizare de ani de zile. Ce ar putea însemna asta?', options: [
            {t: 'Poate fi prea vechi ca să primească actualizări de securitate, deci este mai puțin sigur', ok: true, why: 'Da. Telefoanele mai vechi nu mai primesc actualizări. Evită banca pe ele și gândește-te să le înlocuiești când poți.'},
            {t: 'Funcționează perfect', why: 'Telefoanele nu mai primesc actualizări după câțiva ani, ceea ce lasă breșe de securitate nerezolvate.'}]}},
        {screen: () => list(p, 'Actualizare de sistem', [], {bottom: '<div class="hu"><strong>Sistemul tău este actualizat ⟦check⟧</strong></div>'}), done: true, say: '<strong>Bravo!</strong> Telefonul tău este actualizat și protejat împotriva ultimelor probleme.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (fiica)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Fișă medicală' : 'Informații medicale', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'de ex. diabet de tip 2', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'de ex. penicilină', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Afișează când este blocat</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Gata' : 'Salvează'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Alege un contact</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Sănătate', '#fff', ICON2.health]]), target: 'health', say: 'O <strong>Fișă medicală</strong> le permite paramedicilor să-ți vadă alergiile și contactul de urgență, chiar și când telefonul este blocat. <strong>Deschide aplicația Sănătate.</strong>'},
            {screen: () => app(p, 'Rezumat', '<p class="cf">Datele tale de sănătate apar aici.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Atinge poza ta</strong> din dreapta sus.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Detalii de sănătate'}, {id: 'medical', label: 'Fișă medicală'}], {back: 'Rezumat'}), target: 'medical', say: '<strong>Atinge Fișă medicală.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Telefonul poate stoca <strong>informații medicale</strong> pe care paramedicii le pot vedea, chiar și când este blocat. <strong>Atinge Setări.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Derulează în jos și <strong>atinge Siguranță și urgențe</strong>. <em>Pe un Samsung se numește Siguranță și urgențe.</em>'},
            {screen: () => list(p, 'Siguranță și urgențe', [{id: 'medical', label: 'Informații medicale'}, {id: 'contacts-ec', label: 'Contacte de urgență'}, {id: 'sos', label: 'SOS urgențe'}]), target: 'medical', say: '<strong>Atinge Informații medicale.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Scrie mai întâi o alergie (pentru exersare, „Penicilină”), apoi adaugă un contact de urgență.',
         say: 'Completează orice ar trebui să știe paramedicii. Pentru exersare, scrie <strong>Penicilină</strong> la alergii. Apoi <strong>atinge adaugă contact de urgență</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Alege pe cine să sune în caz de urgență. <strong>Atinge Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '„Afișează când este blocat” este activat, deci paramedicii o pot vedea. <strong>Atinge Gata.</strong>' : '<strong>Atinge Salvează.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Fișă medicală' : 'Informații medicale', [{label: 'Alergii', sub: typed(c, 'allergies')}, {label: 'Contact de urgență', sub: 'Sarah (fiica)'}]),
         question: {q: p === 'ios' ? 'Cum ar vedea un paramedic Fișa ta medicală dacă telefonul este blocat?' : 'Cum ar vedea un paramedic acestea dacă telefonul este blocat?', options: [
            {t: 'Prin butonul „Urgență” de pe ecranul blocat', ok: true, why: 'Da. Atingerea butonului Urgență de pe ecranul blocat afișează informațiile tale medicale, fără a debloca telefonul.'},
            {t: 'Nu pot', why: 'Pot: butonul Urgență de pe ecranul blocat le afișează, fără să fie nevoie de codul tău.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Fișă medicală' : 'Informații medicale', [{label: 'Alergii', sub: typed(c, 'allergies')}, {label: 'Contact de urgență', sub: 'Sarah (fiica)'}]), done: true,
         say: '<strong>Bravo!</strong> Informațiile tale medicale și contactul de urgență sunt salvate. Dacă ceri ajutor cu SOS urgențe, contactul tău de urgență este anunțat și el.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Find My' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Se redă sunetul…' : '⟦volume-2⟧ Redă sunetul'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Marchează ca pierdut' : 'Securizează dispozitivul'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Dacă ți se pierde vreodată telefonul, îl poți găsi, îl poți face să sune sau îl poți bloca, dar numai dacă aceasta este activată în prealabil. <strong>Atinge Setări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Atinge numele tău</strong> din partea de sus.'},
            {screen: () => list(p, 'Cont Apple', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Find My'}, {id: 'family', label: 'Partajare în familie'}], {back: 'Setări'}), target: 'findmy', say: '<strong>Atinge Find My.</strong>'},
            {screen: c => list(p, 'Find My', [{id: 'find-toggle', label: 'Find My iPhone', toggle: !!c.findOn}, {label: 'Trimite ultima locație', toggle: !!c.findOn}], {back: 'Cont Apple'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Activează Find My iPhone.</strong> „Trimite ultima locație” trimite locația chiar înainte să se descarce bateria.'},
            {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Acum imaginează-ți că nu-ți găsești telefonul. Pe alt dispozitiv Apple ai deschide <strong>Find My</strong> (sau ai merge la icloud.com/find de pe un calculator). Aici, <strong>atinge Find My</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Derulează în jos și <strong>atinge Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Toate serviciile'}, {id: 'account', label: 'Gestionează-ți Contul Google'}]), target: 'all-services', say: '<strong>Atinge Toate serviciile.</strong>'},
            {screen: () => list(p, 'Toate serviciile', [{id: 'find-hub', label: 'Find Hub', sub: 'Denumit anterior Find My Device'}, {id: 'theft', label: 'Protecție împotriva furtului'}]), target: 'find-hub', say: '<strong>Atinge Find Hub</strong> (se numea înainte Find My Device). <em>Samsung are și propriul serviciu: Setări &gt; Securitate și confidențialitate &gt; Protecție dispozitiv pierdut.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Folosește Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Activează Folosește Find Hub.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Acum imaginează-ți că nu-ți găsești telefonul. Pe alt telefon sau pe o tabletă ai deschide <strong>Find Hub</strong> sau ai merge la google.com/android/find de pe un calculator. Aici, <strong>atinge Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Iată-l, pe hartă. Dacă e undeva aproape, de exemplu printre pernele canapelei, <strong>atinge Redă sunetul</strong>: sună tare, chiar și când este pe silențios.'},
        {screen: c => findMap(p, c), question: {q: 'Harta arată telefonul într-un loc în care nu ai fost niciodată. Ce ar trebui să faci?', options: [
            {t: 'Folosesc Marchează ca pierdut sau Securizează dispozitivul ca să-l blochez și anunț poliția', ok: true, why: 'Da. Blochează-l din Find My sau Find Hub, nu te duce singur acolo și anunță poliția și operatorul de rețea.'},
            {t: 'Merg și îl iau înapoi singur', why: 'Nu te confrunta niciodată cu un hoț. Blochează telefonul de la distanță și anunță poliția.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Bravo!</strong> Găsirea telefonului este activată și știi cum să-l faci să sune sau să-l blochezi.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Sfaturi tehnice gratuite</strong>${UI.qr}<small>Scanează-mă</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Ștergi această poză?', p === 'ios' ? 'Va fi păstrată în Șterse recent timp de 30 de zile.' : 'Va fi mutată în coșul de gunoi pentru o vreme, înainte să dispară.', [['cancel', 'Anulează'], ['confirm-delete', 'Șterge']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Deschide Camera.</strong> <em>Sfat: pe majoritatea telefoanelor poți și să glisezi spre stânga pe ecranul blocat.</em>', hint: 'Camera este pictograma gri cu un aparat foto.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Îndreapt-o spre flori și ține-o nemișcată. <strong>Atinge butonul mare rotund</strong> ca să faci o poză.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Clic! E salvată. <strong>Atinge poza mică</strong> din colț ca s-o vezi.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Ca să privești mai de aproape, pune două degete pe poză și depărtează-le. Aici, <strong>atinge ＋ de două ori</strong>.', hint: 'Atinge ＋ din dreapta sus.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Frumos! Ca s-o trimiți cuiva, <strong>atinge butonul de distribuire</strong> ⇪ (o casetă cu o săgeată).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Alege cum s-o trimiți: Mesaje, e-mail, WhatsApp și așa mai departe. <strong>Atinge Mesaje.</strong> (Apoi ai alege cui s-o trimiți.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Trimisă! Acum, dacă faci o poză pe care n-o vrei, <strong>atinge coșul de gunoi</strong> ⟦trash-2⟧ ca s-o ștergi.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Telefonul verifică mai întâi. <strong>Atinge Șterge.</strong>'},
        {screen: () => app(p, 'Fotografii', '<p class="cf">Încă nu sunt poze.</p>', {back: false, color: '#fff'}), question: {q: 'Ai șters o poză din greșeală! Ce poți face?', options: [
            {t: p === 'ios' ? 'Mă uit în Albume > Șterse recent și o recuperez' : 'Mă uit în Coșul de gunoi (Bibliotecă > Coș de gunoi) și o restaurez', ok: true, why: 'Da. Pozele șterse sunt păstrate o vreme, de obicei aproximativ o lună, așa că le poți recupera.'},
            {t: 'Nimic, a dispărut pentru totdeauna', why: 'Nu-ți face griji! Este păstrată în Șterse recent (iPhone) sau în Coșul de gunoi (Android) o vreme.'}]}},
        {screen: () => app(p, 'Fotografii', '<p class="cf">Gata.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Bravo!</strong> Poți face poze, le poți mări, le poți trimite și le poți șterge.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Dacă și familia ta are iPhone-uri, <strong>FaceTime</strong> face apeluri video gratuite. <strong>Atinge FaceTime.</strong>' : '<strong>Google Meet</strong> face apeluri video gratuite de pe Android, inclusiv către iPhone-uri. <strong>Atinge Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'FaceTime nou' : 'Nou'}</button><p class="cf">Apelurile recente apar aici.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'FaceTime nou' : 'Nou'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'FaceTime nou' : 'Sună', `<div class="xz">To: ${field('callto', 'Nume sau număr', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Apel video'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Scrie mai întâi Sarah în caseta „Către”.',
             say: 'Scrie numele cuiva din contactele tale. <strong>Scrie Sarah</strong>, apoi <strong>atinge butonul video</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Sună, apoi Sarah răspunde. Ca să-i arăți grădina, <strong>atinge butonul de întoarcere</strong> ⟦switch-camera⟧ ca să folosești camera din spate.', hint: 'Așteaptă să răspundă Sarah, apoi atinge ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Când ai terminat, <strong>atinge butonul roșu</strong> ca să închizi.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Video · 3 min</p>', {back: false, color: '#fff'}), question: {q: 'Prietenul tău are un telefon Android, iar tu ai un iPhone. Puteți face totuși apel video?', options: [
                {t: 'Da, cu WhatsApp sau Google Meet, care merg pe amândouă', ok: true, why: 'Exact. FaceTime este în principal de la iPhone la iPhone. WhatsApp și Google Meet merg pe ambele.'},
                {t: 'Nu, niciodată', why: 'Se poate: WhatsApp și Google Meet merg pe ambele tipuri de telefoane.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Gata.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Bravo!</strong> Ai făcut un apel video și ai arătat imaginea de la camera din spate.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Codurile QR sunt acele modele pătrate alb-negru de pe afișe și meniuri. Camera ta le poate citi, fără nicio aplicație în plus. <strong>Deschide Camera.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Îndreaptă camera spre cod și ține-o nemișcată puțin. Apare un <strong>link pe ecran</strong>: verifică dacă arată ca de la cine te-ai aștepta, apoi <strong>atinge-l</strong>.',
         hints: {shutter: 'Nu trebuie să faci poză: doar îndreapt-o și așteaptă să apară linkul, apoi atinge linkul.'},
         hint: p === 'android' ? 'Așteaptă să apară linkul, apoi atinge-l. Dacă nu apare nimic, încearcă Google Lens.' : 'Așteaptă să apară linkul, apoi atinge-l.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Sfaturi tehnice gratuite</h3><p>Sfaturi pe înțelesul tuturor despre telefoane, calculatoare și siguranța pe internet.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Vezi un autocolant cu cod QR pe un automat de plată dintr-o parcare. Care e cea mai sigură cale de a plăti?', options: [
            {t: 'Folosesc aplicația oficială a parcării sau automatul, nu un cod QR lipit', ok: true, why: 'Da. Escrocii lipesc coduri QR false peste cele reale ca să fure datele cardului. Verifică dacă e un autocolant și folosește aplicația sau indicatorul oficial.'},
            {t: 'Îl scanez și plătesc, e mai rapid', why: 'Autocolantele QR false de pe automatele din parcări sunt o înșelătorie cunoscută. Folosește aplicația oficială sau chiar automatul.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Sfaturi tehnice gratuite</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Bravo!</strong> Poți scana coduri QR cu camera și știi să verifici mai întâi linkul.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Poze de duminică 📷', 'Bună, mamă, iată pozele de la prânz…'],
                       ['tv', 'TV Licensing', 'Licența ta a EXPIRAT', 'Acționează acum pentru a evita urmărirea penală. Actualizează-ți plata…'],
                       ['library', 'Bridlington Library', 'Cărțile tale trebuie returnate', 'Trebuie să returnezi cărțile vineri.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Mesaje primite' : 'Principale', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · către mine</p><h3>Poze de duminică 📷</h3><p>Bună, mamă, iată pozele de la prânz. Mi-a părut bine să te văd! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Scrie răspunsul…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Licența ta a EXPIRAT</h3><p>Acționează acum pentru a evita urmărirea penală. Actualizează-ți datele de plată în 24 de ore: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Mută la Nedorite' : '⋮ Raportează phishing'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Mail' : 'aplicația ta de e-mail (Gmail pe majoritatea telefoanelor Android)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'E-mailurile noi sunt îngroșate. <strong>Atinge e-mailul de la Sarah</strong> ca să-l citești.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Ca să răspunzi, <strong>atinge Răspunde</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Scrie mai întâi un răspuns scurt, apoi atinge Trimite.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Scrie un răspuns scurt</strong> (de exemplu „Mulțumesc, sunt superbe!”) și <strong>atinge Trimite</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Trimis ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Înapoi la mesaje primite</button>', {color: '#fff'}), target: 'back', say: '<strong>Atinge Înapoi</strong> ca să te întorci la mesajele primite.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Este un e-mail îngrijorător de la „TV Licensing”. <strong>Deschide-l</strong>, dar nu atinge nimic din el.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'E-mailurile de înșelătorie folosesc adesea un nume real, dar o adresă falsă. <strong>Atinge numele expeditorului</strong> ca să vezi adresa reală de e-mail.',
         hint: 'Atinge „TV Licensing” din partea de sus a e-mailului.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Vine de la <strong>outlook-mail.com</strong>, nu de la tvlicensing.co.uk. Este o înșelătorie. <strong>Atinge ' + (p === 'ios' ? 'Mută la Nedorite' : 'Raportează phishing') + '.</strong> Poți și să redirecționezi e-mailurile de înșelătorie la report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Ce a dat de gol înșelătoria?', options: [
            {t: 'Adresa reală a expeditorului, amenințările și termenul de 24 de ore', ok: true, why: 'Exact. Organizațiile reale nu te amenință cu termene limită, iar e-mailurile lor vin de la propria adresă web.'},
            {t: 'Nimic, părea real', why: 'Verifică adresa expeditorului: nu era a TV Licensing. Amenințările și termenele strânse sunt și ele semne mari de avertizare.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Bravo!</strong> Poți citi e-mailuri și răspunde la ele și poți recunoaște și raporta o înșelătorie.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Obține' : 'Instalează';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Atinge Caută.</strong>' : '<strong>Atinge bara de căutare.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Am căutat „NHS App”. Multe aplicații au „NHS” în nume. Verifică <strong>cine a făcut-o</strong>: cea adevărată este de la <strong>NHS England</strong>. <strong>Atinge ' + (p === 'ios' ? 'Obține' : 'Instalează') + ' lângă cea adevărată.</strong>',
         hints: {'fake1-get': 'Aceea este de la HealthApps Ltd și este o reclamă. NHS App adevărată este făcută de NHS England.', 'fake2-get': 'Aceea este de la QuickDev Apps, nu de la NHS. Cea adevărată este făcută de NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Instalată! Acum elimină o aplicație pe care nu o folosești niciodată, ca să faci ordine și să eliberezi spațiu. <strong>Ține apăsat pe aplicația Meteo</strong> până apare un meniu.', hint: 'Ține degetul pe pictograma Meteo o secundă sau două.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Elimini „Meteo”?' : 'Meteo', p === 'ios' ? 'Eliminarea de pe ecranul principal va păstra aplicația în Biblioteca de aplicații.' : '', p === 'ios'
            ? [['delete-app', 'Șterge aplicația'], ['remove-home', 'Elimină de pe ecranul principal'], ['cancel', 'Anulează']] : [['app-info', 'Informații aplicație'], ['delete-app', 'Dezinstalează'], ['cancel', 'Anulează']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Atinge Elimină aplicația</strong>, apoi <strong>Șterge aplicația</strong> (aici este un singur buton).' : '<strong>Atinge Dezinstalează.</strong>',
         hints: {'remove-home': 'Asta ascunde doar pictograma; aplicația rămâne pe telefon. Atinge Șterge aplicația.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'O aplicație cere o plată ca să „deblocheze” dosarul tău NHS. Ce crezi?', options: [
            {t: 'Nu este NHS App adevărată, care este complet gratuită', ok: true, why: 'Exact. NHS App este gratuită. Șterge orice îți cere să plătești pentru serviciile NHS.'},
            {t: 'Plătesc, e pentru NHS', why: 'NHS App adevărată este gratuită și făcută de NHS England. O aplicație care cere bani nu este cea adevărată.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Bravo!</strong> Poți deosebi aplicațiile adevărate de imitații și poți elimina aplicațiile de care nu ai nevoie.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Bine ai revenit.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Conectează-te cu Face ID' : 'Conectează-te cu amprenta'}</button>
                <button type="button" class="cp" data-tap="password">Conectează-te cu e-mail și parolă</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Rețete'], ['appointments', '⟦calendar⟧', 'Programări'], ['records', '⟦clipboard-list⟧', 'Sănătatea ta'], ['messages', '⟦mail⟧', 'Mesaje']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Rețete', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Comandă o rețetă repetată</strong><small>Alege medicamentele pe care le ai deja prescrise</small></button><div class="ck"><strong>Vezi comenzile tale</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipină 5 mg comprimate'], ['med-2', 'Atorvastatină 20 mg comprimate']];
            return app(p, 'Alege medicamentele', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Confirmă comanda', `<p class="cf">Amlodipină 5 mg comprimate<br>Ridicare de la: Farmacia ta aleasă</p><button type="button" class="ce co" data-tap="confirm">Confirmă și comandă</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Comandă trimisă', '<p class="cf">⟦check⟧ Cererea ta de rețetă a fost trimisă cabinetului medicului de familie. De obicei durează 2–3 zile lucrătoare.</p><button type="button" class="cp" data-tap="home">Înapoi la început</button>', {color: NHS});
        return app(p, 'Programări', '<div class="fo"><div class="ck"><strong>Programare la medicul de familie</strong><small>Marți la 10:30 · Cabinetul medicului tău de familie</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> este gratuită și îți permite să comanzi rețete repetate, să-ți vezi programările și multe altele. (Această versiune de exersare este închipuită, făcută doar pentru această lecție.) <strong>Atinge NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `După ce ai configurat-o cu NHS login, te poți conecta cu ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Atinge Conectează-te cu ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Merge și așa, dar fața sau amprenta sunt mai rapide. Atinge butonul albastru.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Atinge Rețete.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Atinge Comandă o rețetă repetată.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Atinge un medicament ca să-l bifezi mai întâi, apoi atinge Continuă.',
         say: '<strong>Atinge medicamentul de care ai nevoie</strong> ca să-l bifezi (încearcă Amlodipină), apoi <strong>atinge Continuă</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Verifică dacă e corect, apoi <strong>atinge Confirmă și comandă</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Trimisă cabinetului! <strong>Atinge Înapoi la început.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Îți poți verifica și programările. <strong>Atinge Programări.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Un SMS spune „NHS: ești eligibil pentru un test gratuit, introdu datele bancare pentru a plăti poșta”. Ce este?', options: [
            {t: 'O înșelătorie. NHS nu cere niciodată date bancare prin SMS', ok: true, why: 'Exact. Folosește NHS App sau cabinetul medicului de familie direct, niciodată linkuri din SMS-uri.'},
            {t: 'E real, sunt doar taxele poștale', why: 'NHS nu trimite niciodată SMS-uri prin care să ceară date bancare. Este o înșelătorie: redirecționează-l la 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Bravo!</strong> Ai comandat o rețetă repetată și ți-ai verificat programările.'},
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
        if (page === 'login') return app(p, 'Practice Bank', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Conectează-te cu Face ID' : 'Conectează-te cu amprenta'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Conturile tale', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Azi'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Azi'], ['txn-pension', 'Pensia de stat', '+£921.60', 'Ieri'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Lun']];
            return app(p, 'Cont curent', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Plată', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Azi, 03:12 · Card cu final 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Blochează cardul</strong><small>${ctx.frozen ? 'Card blocat ⟦check⟧' : 'Oprește imediat plățile'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Raportează această plată</strong><small>Nu o recunoști? Spune-ne</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Bancă', BANK, ICON2.pound]]), target: 'bank',
         say: 'Aplicațiile bancare îți permit să-ți verifici banii oricând. (Aceasta este o bancă închipuită, pentru exersare.) <strong>Deschide aplicația Bancă.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Conectează-te cu ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Nu da niciodată nimănui codul tău bancar.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Atinge Contul curent</strong> ca să vezi ce s-a plătit și ce s-a încasat.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Uită-te prin plăți. Una nu o recunoști: <strong>249 £ la ora 3 dimineața, către un site de carduri cadou</strong>. <strong>Atinge-o.</strong>',
         hints: {'txn-tesco': 'Acestea sunt cumpărăturile tale. Caută una pe care nu o recunoști.', 'txn-pension': 'Aceasta este pensia ta care se încasează. Caută cea ciudată.', 'txn-water': 'Aceasta este factura ta de apă. Caută cea ciudată.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Atinge Blochează cardul</strong>. Oprește imediat orice alte plăți și îl poți debloca mai târziu dacă se dovedește că era în regulă.',
         hints: {report: 'Blochează mai întâi cardul, ca să oprești alte plăți. Apoi raportează.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Ai blocat cardul. Ce urmează?', options: [
            {t: 'Sun banca la 159 sau la numărul de pe card, ori raportez în aplicație', ok: true, why: 'Da. Pot investiga, anula cardul și adesea recupera banii. Cu cât le spui mai repede, cu atât mai bine.'},
            {t: 'Aștept să văd dacă se mai întâmplă', why: 'Anunță banca imediat. Cu cât află mai repede, cu atât pot face mai multe.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Bravo!</strong> Ți-ai verificat contul, ai observat o plată pe care nu o recunoșteai și ți-ai blocat cardul.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Practice Bank</strong><span>•••• 4421</span><small>DEBIT</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Portofel' : 'Google Wallet', `<p class="cf">Adaugă un card ca să plătești în magazine cu telefonul.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Adaugă card' : '＋ Adaugă în Portofel'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Adaugă card', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Ține cardul în cadru…' : 'Card găsit ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Verifică cardul', `<p class="cf">Banca ta trebuie să verifice că ești tu. Alege cum primești un cod:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Mesaj text</strong><small>la ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Sună banca</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Introdu codul', `<div class="jp ex"><strong>Mesaje · acum</strong><span>Practice Bank: codul tău pentru Portofel este 529173. Nu-l da nimănui.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Portofel' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Cardul tău este gata de folosit.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Ține aproape de cititor…' : 'Ține lângă cititor…') : '⟦check⟧ Gata'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Portofel' : 'Portofel', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Plata cu telefonul este rapidă și sigură: magazinele nu văd niciodată numărul cardului tău. <strong>Deschide ${p === 'ios' ? 'Portofel' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Adaugă card' : '＋ Adaugă în Portofel'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Telefonul folosește camera ca să citească cardul, așa că nu trebuie să scrii numărul. <strong>Ține cardul în cadru</strong>, apoi <strong>atinge Următorul</strong>. <em>Nu scrie niciodată numărul cardului pe un site primit într-un SMS sau e-mail.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Banca ta verifică dacă ești chiar tu. <strong>Atinge Mesaj text.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Primești prin SMS un cod de la banca ta. <strong>Scrie 5 2 9 1 7 3.</strong> Ține minte: acest cod se scrie doar în propriul telefon și nu se dă niciodată cuiva care ți-l cere.', hint: 'Scrie codul din mesaj: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Cardul tău este gata. Acum hai să plătim într-un magazin. <strong>Atinge oriunde pe card.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'La casă, <strong>apasă de două ori butonul lateral</strong> al iPhone-ului (aici atinge ⟦power⟧ de două ori), uită-te la ecran pentru Face ID, apoi ține partea de sus a telefonului lângă cititorul de carduri.', hint: 'Atinge de două ori butonul ⟦power⟧ de pe margine.'}
            : {target: 'pay-now', say: 'La casă, doar <strong>deblochează telefonul și ține spatele lui lângă cititorul de carduri</strong>. Aici, <strong>atinge cititorul de carduri</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Este sigură plata cu telefonul?', options: [
            {t: 'Da, mai sigură decât cardul: cere fața, amprenta sau codul tău, iar magazinele nu văd numărul cardului', ok: true, why: 'Exact. Iar dacă îți pierzi telefonul, nimeni nu poate plăti cu el fără să-l deblocheze.'},
            {t: 'Nu, oricine l-ar putea folosi', why: 'Fiecare plată cere fața, amprenta sau codul tău, deci este de fapt mai sigură decât un card contactless.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Bravo!</strong> Cardul tău este în telefon și ai făcut o plată de exersare.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>DEBIT</small></div>', '<small>DEBIT</small></div></button>');
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
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Alege stația'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Adaugă un railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Alege o stație</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Adaugă un railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Fără railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Direct'], ['t-1145', '11:45', '12:32', 'Direct'], ['t-1245', '12:45', '13:32', 'Direct']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Prețurile sunt inventate pentru acest exercițiu. Reducerea railcard a fost aplicată.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Bilet dus Off-Peak</strong><span>7,40 £</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Bilet dus-întors Off-Peak, în aceeași zi</strong><small>Te întorci azi</small><span>9,85 £</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Biletul tău', `<div class="adt"><strong>Bilet dus-întors Off-Peak, în aceeași zi</strong><span>Bridlington ⇄ Hull</span><span>Azi · Senior Railcard</span>
            ${UI.qr}<small>Scanează-l la poarta de bilete sau arată-l controlorului.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Trenuri', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Aplicațiile pentru trenuri îți permit să cumperi bilete pe telefon, fără coadă. (Această aplicație de exersare este închipuită: prețurile și orele sunt inventate.) <strong>Deschide Trenuri.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Pleci din Bridlington. <strong>Atinge Către</strong> ca să alegi încotro mergi.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Atinge Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Ai peste 60 de ani? Un <strong>Senior Railcard</strong> îți face o treime reducere la majoritatea biletelor. <strong>Atinge Railcard</strong> ca să-l adaugi pe al tău.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Atinge Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Atinge Găsește trenuri.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Iată trenurile. <strong>Atinge cel de la 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Te întorci azi? Un bilet dus-întors în aceeași zi e de obicei mai ieftin decât două bilete dus. <strong>Atinge Bilet dus-întors Off-Peak, în aceeași zi</strong>, apoi plătește.',
         hints: {single: 'Biletul dus e doar într-o direcție. Te întorci azi, așa că atinge Bilet dus-întors Off-Peak, în aceeași zi.', pay: 'Alege mai întâi biletul: atinge Bilet dus-întors Off-Peak, în aceeași zi.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Atinge ${p === 'ios' ? 'Plătește' : 'G Pay'}</strong> ca să plătești cu cardul din telefon (din lecția despre plata contactless).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Bateria telefonului e aproape goală înainte de trenul spre casă. Ce idee bună ar fi?', options: [
            {t: 'Fac o captură de ecran a biletului și activez economisirea bateriei', ok: true, why: 'Da. Unele bilete merg dintr-o captură de ecran, iar economisirea bateriei ajută telefonul să reziste. Multe aplicații îți permit și să adaugi biletul în Portofel.'},
            {t: 'Nimic, va fi bine', why: 'Dacă telefonul se oprește, nu îți poți arăta biletul. Fă o captură de ecran și economisește bateria.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Bravo!</strong> Ți-ai planificat o călătorie, ai adăugat un railcard și ai cumpărat un bilet pe telefon.'},
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

    const busTable = `<div class="sj"><strong>Autobuzul 121: Bridlington – Hull</strong><small>Doar ore de exersare</small>
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
        return app(p, 'Orarul autobuzelor', busTable, {back: false, color: '#fff',
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
            ? 'O captură de ecran este o poză a ceea ce se vede pe ecran, de exemplu acest orar de autobuz. Apasă în același timp <strong>butonul lateral</strong> (dreapta) și <strong>volum sus</strong> (stânga), apoi eliberează. Aici, <strong>atinge butonul lateral, apoi volum sus</strong>.'
            : 'O captură de ecran este o poză a ceea ce se vede pe ecran, de exemplu acest orar de autobuz. Apasă în același timp <strong>butonul de pornire</strong> și <strong>volum jos</strong>, apoi eliberează. Aici, <strong>atinge butonul de pornire, apoi volum jos</strong>.',
         hints: {'vol-down': p === 'ios' ? 'Pe un iPhone este volum SUS, împreună cu butonul lateral.' : 'Începe cu butonul de pornire, din partea de sus a laturii drepte.',
                 'vol-up': p === 'ios' ? 'Începe cu butonul lateral din dreapta.' : 'Pe Android este volum JOS, împreună cu butonul de pornire.',
                 side: 'Acum butonul de volum sus, din stânga.', power: 'Acum butonul de volum jos.'},
         hint: p === 'ios' ? 'Butonul lateral este pe marginea dreaptă. Volum sus este în stânga.' : 'Butonul de pornire este butonul de sus de pe marginea dreaptă.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Clic! Apare o poză mică în colțul de jos. <strong>Atinge-o</strong> ca să-ți vezi captura de ecran. <em>Dacă o lași, se salvează singură după câteva secunde.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Poți desena pe ea sau o poți decupa aici. <strong>Atinge Gata</strong> din stânga sus.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Atinge Salvează în Fotografii.</strong>', hints: {'delete-shot': 'Asta ar șterge-o. Atinge Salvează în Fotografii.', 'save-files': 'Și Fișiere merge, dar Fotografii se găsește mai ușor. Atinge Salvează în Fotografii.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Clic! Apare o poză mică, cu butoane dedesubt. E deja salvată. <strong>Atinge Distribuie</strong> ca s-o trimiți cuiva.', hints: {'shot-edit': 'Editează îți permite să o decupezi sau să desenezi pe ea. Deocamdată atinge Distribuie.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Atinge Sarah</strong> ca să-i trimiți orarul autobuzelor.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Unde îți găsești capturile de ecran mai târziu?', options: [
            {t: 'În aplicația Fotografii, în albumul Capturi de ecran', ok: true, why: 'Da. Sunt salvate împreună cu pozele tale, așa că le poți privi, trimite sau șterge ca pe orice poză.'},
            {t: 'Dispar după o zi', why: 'Rămân până le ștergi. Caută în aplicația Fotografii, în albumul Capturi de ecran.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Bravo!</strong> Capturile de ecran sunt utile pentru orare de autobuz, bilete, mesaje de eroare și orice vrei să păstrezi sau să arăți cuiva. Le poți șterge din Fotografii când ai terminat.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Caută în Hărți'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah ți-a trimis o adresă prin SMS. Dacă o copiezi, nu mai trebuie să o scrii din nou. <strong>Deschide Mesaje.</strong>'},
        {screen: () => app(p, 'Mesaje', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Atinge mesajul de la Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Ține apăsat pe mesajul cu adresa</strong> (ține degetul pe el o secundă sau două) până apare un meniu.', hint: 'Ține degetul apăsat pe al doilea mesaj până apare un meniu.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Atinge Copiază.</strong> Telefonul ține minte acum cuvintele, gata să le lipești în altă parte.',
         hints: {reply: 'Răspunde ar începe un mesaj. Atinge Copiază.', forward: 'Redirecționează trimite mesajul cuiva. Atinge Copiază.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Copiat! Acum mergi la ecranul principal. Aici, <strong>atinge bara din partea de jos a ecranului</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Deschide Hărți</strong>, ca să poți găsi adresa.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Ține apăsat pe caseta de căutare</strong> până apare un mic buton „Lipește”.', hint: 'Ține degetul pe caseta de căutare din partea de sus.',
         hints: {'search-tap': 'O atingere scurtă deschide tastatura. Ține în schimb apăsat, până apare Lipește.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Atinge Lipește.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Întreaga adresă apare, fără să scrii nimic. <strong>Atinge rezultatul.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Vrei să copiezi doar un număr de telefon din mijlocul unui mesaj lung. Cum faci?', options: [
            {t: 'Țin apăsat, apoi ating Selectează (sau trag micile mânere) ca să aleg doar partea dorită, apoi Copiază', ok: true,
             why: 'Da. Trage mânerele de pe ambele părți ale cuvintelor evidențiate ca să alegi exact ce vrei.'},
            {t: 'Pot copia doar tot mesajul', why: 'Poți alege doar o parte: ține apăsat, atinge Selectează și trage micile mânere.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Bravo!</strong> Copierea și lipirea merg aproape peste tot: mesaje, e-mailuri, pagini web și formulare. Ține apăsat ca să copiezi; ține apăsat ca să lipești.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Stocare'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Spațiu iPhone', [{caption: 'RECOMANDĂRI'},
                ctx.offloaded ? {label: 'Descarcă aplicațiile nefolosite', value: 'Activat ⟦check⟧'} : {id: 'offload', label: 'Descarcă aplicațiile nefolosite', sub: 'Economisești 2,1 GB. Elimină aplicațiile pe care nu le folosești, dar păstrează datele lor.', value: 'Activează'},
                {caption: 'APLICAȚII'}, {label: 'Fotografii', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'General', top: bar});
        }
        return list(p, 'Stocare', [{label: 'Fotografii și videoclipuri', value: '21,3 GB'}, {label: 'Aplicații', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'Inclusiv WhatsApp'}, {label: 'Documente și altele', value: '4,1 GB'},
            {label: 'Sistem', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1,1 GB de fișiere inutile curățate</p>' : '<button type="button" class="ce dk" data-tap="free-up">Eliberează spațiu</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Setări', `<div class="fo">${[['account', 'Cont'], ['privacy', 'Confidențialitate'], ['chats', 'Chaturi'], ['notifications', 'Notificări'], ['storage', 'Spațiu de stocare și date'], ['help', 'Ajutor']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Spațiu de stocare și date', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Gestionează spațiul de stocare', `<div class="iq"><span>WhatsApp folosește ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Mai mari de 5 MB</strong><small>Nimic de verificat</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Redirecționate de multe ori</strong><small>112 elemente · 0,9 GB</small></div>
                <div class="he">CONVERSAȚII</div><div class="ck"><strong>Familie</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, 'Mai mari de 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Ștergi 23 de elemente?', 'Vor fi șterse din WhatsApp. Pozele deja salvate în galeria telefonului rămân acolo.', [['cancel', 'Anulează'], ['confirm-delete', 'Șterge']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Primești „Spațiu de stocare aproape plin”? Hai să aflăm ce ocupă spațiul. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Atinge General.</strong>'},
            {screen: () => list(p, 'General', [{id: 'about', label: 'Despre'}, {id: 'update', label: 'Actualizare software'}, {id: 'storage', label: 'Spațiu iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN și gestionarea dispozitivului'}], {back: 'Setări'}),
             target: 'storage', say: '<strong>Atinge Spațiu iPhone.</strong> Durează câteva secunde să calculeze totul.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Bara colorată arată ce ocupă spațiul. Mai întâi, o rezolvare rapidă: <strong>Descarcă aplicațiile nefolosite</strong> elimină aplicațiile pe care nu le-ai folosit de ceva vreme, dar păstrează datele în caz că vrei să le recuperezi. <strong>Atinge Activează.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Atinge Stocare.</strong> <em>Pe un Samsung se numește Baterie și îngrijirea dispozitivului, apoi Stocare.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Bara colorată arată ce ocupă spațiul. <strong>Atinge Eliberează spațiu.</strong>'},
            {screen: () => app(p, 'Fișiere', `<div class="ke"><strong>Șterge fișierele inutile</strong><small>1,1 GB de fișiere temporare ale aplicațiilor</small><button type="button" class="ce dk" data-tap="clean">Curăță</button></div>
                <div class="ke"><strong>Șterge capturile de ecran vechi</strong><small>214 MB</small><span class="fd">Selectează și eliberează</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Fișierele inutile se pot șterge fără grijă: sunt fișiere temporare de care aplicațiile nu au nevoie. <strong>Atinge Curăță.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp folosește 14,8 GB. Ce îl umple?', options: [
            {t: 'Videoclipurile și pozele primite de la oameni, mai ales în grupuri', ok: true, why: 'Da. Fiecare videoclip trimis într-o conversație de familie sau de grup este salvat pe telefon. WhatsApp le poate găsi și șterge pe cele mari.'},
            {t: 'Mesajele tale text', why: 'Textul ocupă aproape deloc spațiu. Videoclipurile și pozele trimise de oameni sunt cele care ocupă, mai ales în grupuri.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Deschide WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'În WhatsApp, atinge <strong>Setări</strong> în dreapta jos. Aici este deja deschis. <strong>Atinge Spațiu de stocare și date.</strong>'
                          : 'În WhatsApp, atinge <strong>cele trei puncte ⋮</strong> de sus, apoi <strong>Setări</strong>. Aici este deja deschis. <strong>Atinge Spațiu de stocare și date.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Atinge Gestionează spațiul de stocare.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Cele care economisesc cel mai mult spațiu sunt sus. <strong>Atinge Mai mari de 5 MB.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Acestea sunt videoclipuri mari pe care ți le-au trimis alții. Dacă vrei să păstrezi unul, salvează-l mai întâi în poze. <strong>Atinge Selectează tot.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Atinge Șterge.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Aceasta șterge doar copiile din WhatsApp. <strong>Atinge Șterge</strong> ca să confirmi.', hints: {cancel: 'Anulează le păstrează. Pentru acest exercițiu, atinge Șterge.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Bravo!</strong> Ai eliberat peste 7 GB. Merită să faci asta la câteva luni. Golește și <strong>Șterse recent</strong> din Fotografii, deoarece pozele șterse ocupă spațiu încă 30 de zile.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Ceas mondial'], ['alarms', 'Alarme'], ['stopwatch', 'Cronometru'], ['timers', 'Temporizatoare']]
            : [['alarms', 'Alarmă'], ['world', 'Ceas'], ['timers', 'Temporizator'], ['stopwatch', 'Cronometru']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Azi</small><strong>Londra</strong></span><em>${NOW.zone('Europa/Londra')}</em></div>
                <div class="jw"><span><small>Australia</small><strong>Sydney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Pastile')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Alarmă</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Ceas mondial' : 'Ceas') : (p === 'ios' ? 'Alarme' : 'Alarmă')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Niciodată'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Alarmă', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'O alarmă îți poate aminti să-ți iei pastilele în fiecare zi. <strong>Deschide aplicația Ceas.</strong>', hint: 'Este pictograma neagră cu un cadran alb de ceas.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Atinge ${p === 'ios' ? 'Alarme' : 'Alarmă'}</strong> din ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Atinge +</strong> ca să adaugi o alarmă nouă.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Pe un telefon real derulezi cifrele ca să setezi ora. Aici, <strong>atinge 08:00</strong>.', hints: {'t-07': 'Alege 08:00 pentru acest exercițiu.', 't-09': 'Alege 08:00 pentru acest exercițiu.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Ai nevoie de asta în fiecare zi, nu doar o dată. <strong>Atinge Repetă.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'În fiecare zi'; }, say: '<strong>Atinge În fiecare zi.</strong>',
         hints: {never: 'Niciodată înseamnă că sună o singură dată. Atinge În fiecare zi.', weekdays: 'Zilele lucrătoare sare peste weekend. Atinge În fiecare zi.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Scrie mai întâi o etichetă în caseta Etichetă, de exemplu Pastile.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'O etichetă îți spune pentru ce este alarma. <strong>Atinge caseta Etichetă și scrie Pastile</strong>, apoi <strong>atinge Salvează</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Alarma sună la 8. Îți iei pastilele. Pe ce buton apeși?', options: [
            {t: 'Oprește', ok: true, why: 'Da. Oprește o închide până mâine la 8, deoarece se repetă în fiecare zi.'},
            {t: 'Amână', why: 'Amână o face să sune din nou peste aproximativ 9 minute. Folosește-o dacă ai nevoie de puțin mai mult timp, dar Oprește o închide până mâine.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Bravo!</strong> Alarma pentru pastile sună la 8 în fiecare dimineață. ' + (p === 'ios' ? 'Aplicația <strong>Sănătate</strong> are și o secțiune Medicamente care îți amintește și ține un jurnal.' : 'Poți să-l și întrebi pe Google: „Amintește-mi să-mi iau pastilele în fiecare zi la 8”.')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Dacă telefonul ți s-ar pierde sau s-ar strica, ți-ar fi în siguranță pozele? Hai să verificăm. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Atinge numele tău</strong> din partea de sus.'},
        {screen: () => list(p, 'Cont Apple', [{id: 'personal', label: 'Informații personale'}, {id: 'security', label: 'Conectare și securitate'}, {id: 'payment', label: 'Plată și livrare'}, {id: 'subscriptions', label: 'Abonamente'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Partajare în familie'}, {id: 'findmy', label: 'Find My'}], {back: 'Setări'}),
         target: 'icloud', say: '<strong>Atinge iCloud.</strong> iCloud este spațiul de stocare online al Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'SPAȚIU: 4,2 GB DIN 5 GB FOLOSIȚI'}, {caption: 'SALVAT ÎN ICLOUD'}, {id: 'photos', label: 'Fotografii', value: c.photoSync ? 'Activat' : 'Dezactivat'}, {id: 'backup', label: 'Copie de rezervă iCloud', value: c.backedUp ? 'Activat' : 'Dezactivat'},
            {label: 'Contacte', value: 'Activat'}, {label: 'Note', value: 'Activat'}], {back: 'Cont Apple'}),
         target: 'photos', say: 'Fotografii și Copia de rezervă sunt ambele <strong>Dezactivate</strong>. Asta înseamnă că un telefon pierdut ar însemna poze pierdute. <strong>Atinge Fotografii.</strong>'},
        {screen: c => list(p, 'Fotografii', [{id: 'sync', label: 'Sincronizează acest iPhone', toggle: !!c.photoSync, sub: 'Îți păstrează pozele și videoclipurile în iCloud, ca să fie în siguranță dacă îți pierzi telefonul.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Atinge Sincronizează acest iPhone</strong> ca să activezi.'},
        {screen: c => list(p, 'Fotografii', [{label: 'Sincronizează acest iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Atinge ‹ iCloud</strong> ca să te întorci.'},
        {screen: c => list(p, 'iCloud', [{caption: 'SPAȚIU: 4,2 GB DIN 5 GB FOLOSIȚI'}, {caption: 'SALVAT ÎN ICLOUD'}, {id: 'photos', label: 'Fotografii', value: 'Activat'}, {id: 'backup', label: 'Copie de rezervă iCloud', value: 'Dezactivat'}], {back: 'Cont Apple'}),
         target: 'backup', say: 'Acum fă copie de rezervă pentru tot restul: setări, mesaje și aplicații. <strong>Atinge Copie de rezervă iCloud.</strong>'},
        {screen: c => list(p, 'Copie de rezervă', [{id: 'backup-toggle', label: 'Copie de rezervă pentru acest iPhone', toggle: !!c.backedUp, sub: 'Se face automat în fiecare noapte, când iPhone-ul se încarcă, este blocat și este pe Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Atinge Copie de rezervă pentru acest iPhone</strong> ca să activezi.'},
        {screen: () => list('ios', 'Copie de rezervă', [{label: 'Copie de rezervă pentru acest iPhone', toggle: true}, {id: 'backup-now', label: 'Fă copie de rezervă acum', sub: 'Ultima copie de rezervă reușită: niciodată'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Se va face în fiecare noapte de acum încolo. Fă-o pe prima acum: <strong>atinge Fă copie de rezervă acum</strong>.'},
        {screen: c => list('ios', 'Copie de rezervă', [{label: 'Copie de rezervă pentru acest iPhone', toggle: true}, {label: c.busy ? 'Se face copia de rezervă…' : 'Fă copie de rezervă acum', sub: c.busy ? 'Mai sunt aproximativ 5 minute' : 'Ultima copie de rezervă reușită: chiar acum ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Un SMS spune „Spațiul tău iCloud este plin. Pozele tale vor fi șterse azi. Plătește 99p aici: [link]”. Ce faci?', options: [
            {t: 'Ignor linkul. Verific în Configurări > numele meu > iCloud, apoi redirecționez SMS-ul la 7726', ok: true, why: 'Da. Aceasta este o înșelătorie frecventă. Apple nu trimite linkuri prin SMS și nu îți șterge niciodată pozele așa. Verifică spațiul tău real în Configurări.'},
            {t: 'Plătesc repede ca să salvez pozele', why: 'Este o înșelătorie ca să-ți afle datele cardului. Verifică spațiul tău real în Configurări > numele tău > iCloud și redirecționează SMS-ul la 7726.'}]}},
        {screen: () => list('ios', 'Copie de rezervă', [{label: 'Copie de rezervă pentru acest iPhone', toggle: true}, {label: 'Fă copie de rezervă acum', sub: 'Ultima copie de rezervă reușită: chiar acum ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Bravo!</strong> Pozele și telefonul tău au copie de rezervă. Cei 5 GB gratuiți se umplu repede cu poze; dacă se întâmplă, spațiul în plus (iCloud+) costă o taxă lunară mică, și îl cumperi doar din Configurări, niciodată dintr-un SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Dacă telefonul ți s-ar pierde sau s-ar strica, ți-ar fi în siguranță pozele? Hai să verificăm. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Atinge Google.</strong> Este aproape de partea de jos.', hint: 'Derulează lista în jos: Google este aproape de partea de jos.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gestionează-ți Contul Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Copie de rezervă', sub: 'Dezactivat'}, {id: 'autofill', label: 'Completare automată'}, {id: 'devices', label: 'Dispozitive și partajare'}]),
         target: 'backup', say: 'Copia de rezervă spune <strong>Dezactivat</strong>. <strong>Atinge Copie de rezervă.</strong> <em>Pe un Samsung se află la Setări > Conturi și copie de rezervă.</em>'},
        {screen: c => list(p, 'Copie de rezervă', [{id: 'backup-toggle', label: 'Copie de rezervă de la Google One', toggle: !!c.backedUp, sub: 'Face copie de rezervă pentru aplicații, mesaje, istoricul apelurilor, contacte și setări.'},
            {id: 'photos-backup', label: 'Fotografii și videoclipuri', sub: c.photoSync ? 'Activat · Google Photos' : 'Dezactivat · Google Photos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Atinge Copie de rezervă de la Google One</strong> ca să activezi.'},
        {screen: c => list(p, 'Copie de rezervă', [{label: 'Copie de rezervă de la Google One', toggle: true}, {id: 'photos-backup', label: 'Fotografii și videoclipuri', sub: 'Dezactivat · Google Photos'}]),
         target: 'photos-backup', say: 'Pozele sunt separate. <strong>Atinge Fotografii și videoclipuri.</strong>'},
        {screen: c => list(p, 'Copie de rezervă', [{id: 'photos-toggle', label: 'Copie de rezervă pentru fotografii și videoclipuri', toggle: !!c.photoSync, sub: 'Le salvează în Google Photos, ca să fie în siguranță dacă îți pierzi telefonul.'},
            {label: 'Calitatea copiei de rezervă', value: 'Economisire spațiu'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Atinge Copie de rezervă pentru fotografii și videoclipuri</strong> ca să activezi.'},
        {screen: () => list(p, 'Copie de rezervă', [{label: 'Copie de rezervă pentru fotografii și videoclipuri', toggle: true}, {id: 'backup-now', label: 'Fă copie de rezervă acum', sub: 'Ultima copie de rezervă: niciodată'}]),
         target: 'backup-now', say: 'De acum încolo se face singură, pe Wi-Fi. Fă-o pe prima acum: <strong>atinge Fă copie de rezervă acum</strong>.'},
        {screen: c => list(p, 'Copie de rezervă', [{label: 'Copie de rezervă pentru fotografii și videoclipuri', toggle: true}, {label: c.busy ? 'Se face copia de rezervă…' : 'Fă copie de rezervă acum', sub: c.busy ? '1,204 items left' : 'Ultima copie de rezervă: chiar acum ⟦check⟧'}]), wait: 1500,
         question: {q: 'Un SMS spune „Spațiul tău Google este plin. Pozele tale vor fi șterse azi. Plătește 99p aici: [link]”. Ce faci?', options: [
            {t: 'Ignor linkul. Verific în Setări > Google > Copie de rezervă, apoi redirecționez SMS-ul la 7726', ok: true, why: 'Da. Aceasta este o înșelătorie frecventă. Google nu trimite linkuri ca acesta prin SMS. Verifică spațiul tău real în Setări.'},
            {t: 'Plătesc repede ca să salvez pozele', why: 'Este o înșelătorie ca să-ți afle datele cardului. Verifică spațiul tău real în Setări și redirecționează SMS-ul la 7726.'}]}},
        {screen: () => list(p, 'Copie de rezervă', [{label: 'Copie de rezervă pentru fotografii și videoclipuri', toggle: true}, {label: 'Fă copie de rezervă acum', sub: 'Ultima copie de rezervă: chiar acum ⟦check⟧'}]), done: true,
         say: '<strong>Bravo!</strong> Pozele și telefonul tău au copie de rezervă. Google îți oferă 15 GB gratuit; dacă se umplu, spațiul în plus costă o taxă lunară mică, și îl cumperi doar din Setări sau din aplicația Google One, niciodată dintr-un SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 FELICITĂRI! 🎉</strong><p>Ai fost selectat să câștigi un voucher de cumpărături de 500 £!</p>
        <button type="button" class="aeb" data-tap="claim">REVENDICĂ ACUM</button><small>Reclamă</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Informații aplicație', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Versiunea 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Deschide</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Dezinstalează</button>
            <button type="button" data-tap="force-stop">Oprește forțat</button></div>
            <div class="cj ex"><span class="hf"><strong>Baterie</strong><small>38% consum de la ultima încărcare completă</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Permisiuni</strong><small>Afișare peste alte aplicații, administrator dispozitiv</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Vrei să dezinstalezi această aplicație?', [['cancel', 'Anulează'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>CALENDAR · acum</strong>
            <span>⚠️ iPhone-ul tău poate fi infectat! Atinge aici ca să îl cureți acum.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Reclame apar pe ecranul principal, deși nicio aplicație nu este deschisă. De obicei asta înseamnă că s-a strecurat o aplicație rea. Mai întâi, <strong>nu atinge reclama. Atinge micul ⟦x⟧ ca s-o închizi.</strong>',
         hints: {claim: 'Nu atinge niciodată reclama în sine. Caută micul ⟦x⟧ din colț.'}, hint: '⟦x⟧ este mic și se află în colțul din dreapta sus al reclamei.'},
        {screen: () => home(p), target: 'settings', say: 'Aplicațiile rele rulează tot timpul, deci folosesc multă baterie. Așa le poți găsi. <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Atinge Baterie.</strong> <em>Pe un Samsung se numește Baterie și îngrijirea dispozitivului, apoi Baterie.</em>'},
        {screen: () => list(p, 'Baterie', [{id: 'usage', label: 'Utilizarea bateriei', sub: 'Vezi consumul de la ultima încărcare completă'}, {label: 'Economisire baterie', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Atinge Utilizarea bateriei.</strong> <em>Pe unele Samsung-uri, atinge graficul sau Vezi detalii.</em>'},
        {screen: () => list(p, 'Utilizarea bateriei', [], {top: `<div class="nl">${[['System Service', 38], ['Ecran', 21], ['WhatsApp', 12], ['YouTube', 8], ['Cameră', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Care dintre acestea pare nelalocul său?', options: [
            {t: 'System Service: nu l-ai folosit niciodată și consumă cea mai multă baterie', ok: true, why: 'Da. Aplicațiile rele își dau nume plictisitoare, ca „System Service” sau „Keyboard Settings”, ca să nu le observi. Notează-i numele.'},
            {t: 'Ecran', why: 'Ecranul consumă mereu multă baterie; e normal. Cea ciudată este „System Service”, pe care nu ai folosit-o niciodată.'},
            {t: 'WhatsApp', why: 'WhatsApp este o aplicație pe care o folosești, deci e normal. Cea ciudată este „System Service”.'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Acum hai s-o găsim în aplicațiile tale. Înapoi în Setări, <strong>atinge Aplicații</strong>.'},
        {screen: () => list(p, 'Aplicații', [{caption: 'Aplicații deschise recent'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Vezi toate cele 46 de aplicații'}, {id: 'default-apps', label: 'Aplicații implicite'}]),
         target: 'all-apps', say: '<strong>Atinge Vezi toate aplicațiile.</strong>'},
        {screen: () => list(p, 'Toate aplicațiile', ['Calculator', 'Calendar', 'Cameră', 'Chrome', 'Ceas', 'Contacte', 'Gmail', 'Hărți'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Lista este în ordine alfabetică. <strong>Atinge System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Butonul <strong>Dezinstalează</strong> este gri. Aplicațiile rele fac asta ca să nu le poți elimina. Mai întâi, <strong>atinge Oprește forțat</strong> ca să nu mai ruleze.',
         hints: {uninstall: 'Este gri, deci nu merge încă. Atinge mai întâi Oprește forțat.', open: 'Nu o deschide. Atinge Oprește forțat.'}},
        {screen: () => list(p, 'Caută în setări', [{caption: 'Rezultate pentru „administrator dispozitiv”'}, {id: 'device-admin', label: 'Aplicații de administrare a dispozitivului', sub: 'Securitate și confidențialitate > Mai multe setări de securitate'}]),
         target: 'device-admin',
         say: 'Acum ia-i permisiunea specială. În Setări, <strong>caută „administrator dispozitiv”</strong> cu bara de căutare din partea de sus. Iată rezultatul: <strong>atinge Aplicații de administrare a dispozitivului</strong>.'},
        {screen: c => list(p, 'Aplicații de administrare a dispozitivului', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Dezactivezi această aplicație de administrare a dispozitivului?', 'System Service nu va mai putea să te oprească să o dezinstalezi.', [['cancel', 'Anulează'], ['deactivate', 'Dezactivează']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device este de la Google și este în regulă. <strong>Atinge comutatorul de lângă System Service.</strong>', hints: {'find-my': 'Lasă Find My Device activat. Atinge System Service.'}},
        {screen: c => list(p, 'Aplicații de administrare a dispozitivului', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Dezactivezi această aplicație de administrare a dispozitivului?', 'System Service nu va mai putea să te oprească să o dezinstalezi.', [['cancel', 'Anulează'], ['deactivate', 'Dezactivează']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Atinge Dezactivează.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Înapoi la System Service, <strong>Dezinstalează</strong> merge acum. <strong>Atinge Dezinstalează.</strong>', hints: {'force-stop': 'Este deja oprită. Atinge Dezinstalează.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Atinge OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Dispărută! În final, pune Google să verifice dacă mai e ceva. <strong>Deschide Play Store.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Nu au fost găsite aplicații dăunătoare' : 'Scanează telefonul'}</strong>
            <small>${c.scanned ? 'Verificat chiar acum' : 'Ultima scanare: acum 3 săptămâni'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'În Play Store, atinge <strong>poza de profil</strong> (dreapta sus), apoi <strong>Play Protect</strong>. Aici este deja deschis. <strong>Atinge Scanează.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Nu au fost găsite aplicații dăunătoare</strong><small>Verificat chiar acum</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Bravo!</strong> Ai găsit aplicația rea după consumul de baterie, i-ai luat permisiunea specială, ai dezinstalat-o și ți-ai verificat telefonul. Ca să le eviți: instalează aplicații doar din Play Store și fii precaut cu aplicațiile gratuite de lanternă, „curățare” și „accelerare”.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'O notificare din Calendar spune „iPhone-ul tău poate fi infectat! Atinge aici ca să îl cureți acum.” Ce este?', options: [
            {t: 'Spam care s-a strecurat în calendarul tău. Nu o atinge', ok: true, why: 'Da. Dacă atingi „Permite” pe un site dubios, se poate adăuga în iPhone un calendar de spam. „Evenimentele” lui sunt reclame care arată ca avertismente. iPhone-ul tău este în regulă.'},
            {t: 'Un avertisment real de la Apple', why: 'Apple nu trimite avertismente de virus prin Calendar. Este spam dintr-un calendar la care ești abonat. Nu o atinge.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Hai să eliminăm calendarul de spam. <strong>Atinge Configurări</strong>, nu notificarea.', hints: {notif: 'Nu atinge avertismentul. Atinge Configurări.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Derulează în jos și <strong>atinge Aplicații</strong>.', hint: 'Aplicații este în ultimul grup.'},
        {screen: () => list(p, 'Aplicații', ['App Store', 'Cărți'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Calendar'}, {label: 'Cameră'}, {label: 'Contacte'}, {label: 'Mail'}]), {back: 'Setări'}),
         target: 'calendar', say: '<strong>Atinge Calendar.</strong>'},
        {screen: () => list(p, 'Calendar', [{id: 'accounts', label: 'Conturi calendar', value: '2'}, {label: 'Înlocuire fus orar', value: 'Dezactivat'}, {label: 'Ore implicite pentru alerte'}], {back: 'Aplicații'}),
         target: 'accounts', say: '<strong>Atinge Conturi calendar.</strong>'},
        {screen: () => list(p, 'Conturi calendar', [{caption: 'CONTURI'}, {label: 'iCloud', sub: 'Calendare, Contacte și încă 7'}, {id: 'subscribed', label: 'Calendare la care ești abonat', value: '1'}], {back: 'Calendar'}),
         target: 'subscribed', say: 'iCloud este al tău. <strong>Atinge Calendare la care ești abonat.</strong>'},
        {screen: () => list(p, 'Calendare la care ești abonat', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Abonat'}], {back: 'Conturi calendar'}),
         target: 'spam-cal', say: 'Iată-l: un calendar pe care nu ai vrut niciodată să-l adaugi. <strong>Atinge Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Server', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Șterge contul', danger: true}],
            {back: 'Înapoi', overlay: c.askDelete ? dialog(p, 'Ești sigur?', 'Aceasta va șterge calendarul și evenimentele lui din iPhone.', [['cancel', 'Anulează'], ['confirm-delete', 'Șterge contul']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Atinge Șterge contul.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Server', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Șterge contul', danger: true}],
            {back: 'Înapoi', overlay: dialog(p, 'Ești sigur?', 'Aceasta va șterge calendarul și evenimentele lui din iPhone.', [['cancel', 'Anulează'], ['confirm-delete', 'Șterge contul']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Atinge Șterge contul</strong> ca să confirmi.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Dispărut. Încă o verificare: site-urile dubioase pot instala și un „profil”. <strong>Atinge General.</strong>'},
        {screen: () => list(p, 'General', [{id: 'about', label: 'Despre'}, {id: 'update', label: 'Actualizare software'}, {id: 'storage', label: 'Spațiu iPhone'}, {id: 'vpn', label: 'VPN și gestionarea dispozitivului'}], {back: 'Setări'}),
         target: 'vpn', say: '<strong>Atinge VPN și gestionarea dispozitivului.</strong>'},
        {screen: c => list(p, 'VPN și gestionarea dispozitivului', c.profileGone ? [{label: 'VPN', value: 'Neconectat'}] : [{label: 'VPN', value: 'Neconectat'}, {caption: 'PROFIL DE CONFIGURARE'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Neverificat'}], {back: 'General'}),
         target: 'profile', say: 'Dacă vezi aici un profil pe care nu îl recunoști (unul de la serviciu sau de la școală este în regulă), elimină-l. <strong>Atinge Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Profil', [{label: 'Free Phone Booster', sub: 'Neverificat · Conține: Web Clips, Certificate'}, {caption: ' '}, {id: 'remove-profile', label: 'Elimină profilul', danger: true}],
            {back: 'Înapoi', overlay: c.askRemove ? dialog(p, 'Elimină profilul', 'Eliminarea acestui profil va șterge toate setările lui.', [['cancel', 'Anulează'], ['confirm-remove', 'Elimină']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Atinge Elimină profilul</strong>. iPhone-ul îți va cere codul.'},
        {screen: c => list(p, 'Profil', [{label: 'Free Phone Booster', sub: 'Neverificat'}, {caption: ' '}, {label: 'Elimină profilul', danger: true}],
            {back: 'Înapoi', overlay: dialog(p, 'Elimină profilul', 'Eliminarea acestui profil va șterge toate setările lui.', [['cancel', 'Anulează'], ['confirm-remove', 'Elimină']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Atinge Elimină.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Bravo!</strong> Avertismentele false au dispărut. Ca să nu se mai întâmple: pe site-uri, atinge <strong>Nu permite</strong> sau <strong>Închide</strong> la orice fereastră care cere să adaugi un calendar sau un profil și instalează aplicații doar din App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Anulat · Se termină pe 22 octombrie'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '4,99 £ pe săptămână · Se reînnoiește pe 22 octombrie'};
        return list(p, 'Abonamente', [{caption: p === 'ios' ? 'ACTIVE' : 'Activ'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '0,99 £ pe lună' : '1,59 £ pe lună'},
            {caption: p === 'ios' ? 'INACTIVE' : 'Expirat'}, {label: 'Crossword Daily', sub: 'Expirat pe 3 martie'}], {back: p === 'ios' ? 'Cont Apple' : 'Înapoi'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'ABONAMENTUL TĂU' : 'Plan'}, {label: 'Săptămânal', sub: '4,99 £ pe săptămână. A început ca o perioadă de probă gratuită de 3 zile.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Anulează abonamentul' : 'Anulează abonamentul', danger: true}],
            {back: 'Abonamente', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Confirmă anularea' : 'Anulezi abonamentul?', 'Îl poți folosi până pe 22 octombrie. Nu vei mai fi taxat.', [['keep', p === 'ios' ? 'Nu acum' : 'Păstrează']].concat([['confirm-cancel', p === 'ios' ? 'Confirmă' : 'Anulează abonamentul']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Perioadele de probă gratuite se transformă adesea în abonamente plătite fără să observi. Hai să verificăm. <strong>Atinge Configurări.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Atinge numele tău</strong> din partea de sus.'},
            {screen: () => list(p, 'Cont Apple', [{id: 'personal', label: 'Informații personale'}, {id: 'security', label: 'Conectare și securitate'}, {id: 'payment', label: 'Plată și livrare'}, {id: 'subscriptions', label: 'Abonamente'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Setări'}),
             target: 'subscriptions', say: '<strong>Atinge Abonamente.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Perioadele de probă gratuite se transformă adesea în abonamente plătite fără să observi. Hai să verificăm. <strong>Deschide Play Store.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>SUGERAT PENTRU TINE</span><strong>Aplicații cu care să începi</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Atinge poza ta de profil</strong>, litera rotundă din dreapta sus.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Atinge Plăți și abonamente.</strong>'},
            {screen: () => list(p, 'Plăți și abonamente', [{id: 'methods', label: 'Metode de plată'}, {id: 'subscriptions', label: 'Abonamente', sub: 'Gestionează-ți abonamentele'}, {id: 'budget', label: 'Buget și istoric'}]),
             target: 'subscriptions', say: '<strong>Atinge Abonamente.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '„Photo Editor Pro” a început ca o perioadă de probă gratuită și acum costă <strong>4,99 £ în fiecare săptămână</strong>. Asta înseamnă peste 250 £ pe an! <strong>Atinge-l.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Anulează abonamentul' : 'Anulează abonamentul'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Confirmă' : 'Anulează abonamentul'}.</strong>`, hints: {keep: 'Acela continuă să se plătească. Atinge ' + (p === 'ios' ? 'Confirmă' : 'Anulează abonamentul') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Ștergi aplicația Photo Editor de pe telefon. Se opresc astfel plățile?', options: [
            {t: 'Nu. Trebuie să anulezi abonamentul, așa cum tocmai ai făcut', ok: true, why: 'Exact. Ștergerea aplicației NU anulează abonamentul. Continui să plătești până îl anulezi aici.'},
            {t: 'Da, ștergerea aplicației le oprește', why: 'Nu! Continui să plătești până anulezi abonamentul în sine, aici.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Bravo!</strong> Ai economisit 4,99 £ pe săptămână. Sfat: când începi o perioadă de probă gratuită, setează o alarmă pentru ziua dinaintea încheierii. Verifică din când în când și lista de plăți recurente din aplicația băncii tale.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'iPhone-urile mai noi au <strong>Apple Intelligence</strong>: AI care scrie, rezumă și editează pentru tine. Îl poți dezactiva. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Atinge Apple Intelligence și Siri.</strong>', hint: 'Se află în al treilea grup, sub Accesibilitate.'},
        {screen: c => list(p, 'Apple Intelligence și Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Instrumente de scris, rezumate ale notificărilor, Image Playground și altele.'},
            {caption: 'EXTENSII'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Dezactivat' : 'Activat'}, {caption: 'SIRI'}, {label: 'Vorbește cu Siri', value: '„Siri” sau „Hey Siri”'}],
            {back: 'Setări', overlay: c.askOff ? dialog(p, 'Dezactivezi Apple Intelligence?', 'Funcții precum Instrumentele de scris și rezumatele nu vor mai fi disponibile.', [['cancel', 'Anulează'], ['confirm-off', 'Dezactivează']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Atinge comutatorul Apple Intelligence</strong> ca să-l dezactivezi.', hints: {chatgpt: 'Ne ocupăm de ChatGPT după aceea. Mai întâi, atinge comutatorul Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence și Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'EXTENSII'}, {label: 'ChatGPT', value: 'Activat'}],
            {back: 'Setări', overlay: dialog(p, 'Dezactivezi Apple Intelligence?', 'Funcții precum Instrumentele de scris și rezumatele nu vor mai fi disponibile.', [['cancel', 'Anulează'], ['confirm-off', 'Dezactivează']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Atinge Dezactivează.</strong>'},
        {screen: c => list(p, 'Apple Intelligence și Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'EXTENSII'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Activat'}], {back: 'Setări'}),
         target: 'chatgpt', say: 'Extensia ChatGPT poate trimite întrebările tale la ChatGPT, o companie din afara Apple. <strong>Atinge ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Folosește ChatGPT', toggle: !c.gptOff, sub: 'Siri poate trimite cereri la ChatGPT.'}], {back: 'Înapoi'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Atinge Folosește ChatGPT</strong> ca să-l dezactivezi.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Folosește ChatGPT', toggle: false}], {back: 'Înapoi'}),
         question: {q: 'WhatsApp, Facebook și alte aplicații au și ele chaturi cu AI. Care e regula sigură?', options: [
            {t: 'Nu scriu niciodată detalii personale (bancă, sănătate, parole, adrese) în niciun chat cu AI', ok: true, why: 'Da. Ce scrii poate fi stocat și folosit pentru antrenarea AI-ului. Tratează-l ca pe o discuție cu un necunoscut.'},
            {t: 'Chaturile cu AI sunt private, deci orice e în regulă', why: 'Nu sunt private ca un apel telefonic. Ce scrii poate fi stocat. Ține detaliile personale departe de ele.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Folosește ChatGPT', toggle: false}], {back: 'Înapoi'}), done: true,
         say: '<strong>Bravo!</strong> Apple Intelligence și ChatGPT sunt dezactivate. Le poți reactiva oricând, în același loc. Siri funcționează în continuare ca de obicei.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Telefoanele Android vin acum cu <strong>Gemini</strong>, AI-ul Google. Ținând apăsat butonul de pornire, îl poți deschide din greșeală. Hai să schimbăm asta. <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Atinge Aplicații.</strong>'},
        {screen: () => list(p, 'Aplicații', [{caption: 'Aplicații deschise recent'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Vezi toate cele 45 de aplicații'}, {id: 'default-apps', label: 'Aplicații implicite', sub: 'Aplicații pentru asistent, browser și telefon'}]),
         target: 'default-apps', say: '<strong>Atinge Aplicații implicite.</strong>'},
        {screen: () => list(p, 'Aplicații implicite', [{label: 'Aplicație browser', sub: 'Chrome'}, {id: 'assistant', label: 'Aplicație asistent digital', sub: 'Gemini'}, {label: 'Aplicație Telefon', sub: 'Telefon'}, {label: 'Aplicație SMS', sub: 'Mesaje'}]),
         target: 'assistant', say: '<strong>Atinge Aplicație asistent digital.</strong>'},
        {screen: c => list(p, 'Aplicație asistent digital', [{id: 'assistant-app', label: 'Aplicație implicită asistent digital', sub: c.noAssist ? 'Niciuna' : 'Gemini'}, {label: 'Folosește text de pe ecran', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Aplicație implicită asistent digital</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Niciuna</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Atinge Aplicație implicită asistent digital.</strong>'},
        {screen: c => list(p, 'Aplicație asistent digital', [{label: 'Aplicație implicită asistent digital', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Aplicație implicită asistent digital</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Niciuna</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Atinge Niciuna.</strong> Gemini nu va mai apărea când ții apăsat butonul de pornire.', hints: {'assist-gemini': 'Asta îl păstrează pe Gemini. Atinge Niciuna.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Apoi, oprește-l pe Gemini să păstreze ce îi scrii. <strong>Deschide aplicația Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Salut, Margaret<br><small>Cu ce te pot ajuta azi?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Atinge poza ta de profil</strong> din dreapta sus.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Atinge Activitate în aplicațiile Gemini.</strong> <em>Pe unele telefoane se numește Păstrează activitatea.</em>'},
        {screen: c => app(p, 'Activitate în aplicațiile Gemini', `<p class="cf"><strong>${c.actOff ? 'Dezactivat' : 'Activat'}</strong><br>${c.actOff ? 'Conversațiile tale nu mai sunt salvate în cont și nu mai sunt folosite pentru a îmbunătăți AI-ul Google.' : 'Conversațiile tale sunt salvate în Contul tău Google și pot fi verificate pentru a îmbunătăți AI-ul Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Dezactivează</button><button type="button" class="cj" data-tap="off-delete">Dezactivează și șterge activitatea</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Atinge Dezactivează.</strong>'},
        {screen: c => app(p, 'Activitate în aplicațiile Gemini', '<p class="cf"><strong>Activat</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Dezactivează</button><button type="button" class="cj" data-tap="off-delete">Dezactivează și șterge activitatea</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Atinge Dezactivează și șterge activitatea</strong>, ca să ștergi și ce a salvat deja.', hints: {'off-only': 'Asta oprește salvarea conversațiilor noi, dar le păstrează pe cele vechi. Atinge Dezactivează și șterge activitatea.'}},
        {screen: c => app(p, 'Activitate în aplicațiile Gemini', '<p class="cf"><strong>Dezactivat</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook și alte aplicații au și ele chaturi cu AI. Care e regula sigură?', options: [
            {t: 'Nu scriu niciodată detalii personale (bancă, sănătate, parole, adrese) în niciun chat cu AI', ok: true, why: 'Da. Ce scrii poate fi stocat și folosit pentru antrenarea AI-ului. Tratează-l ca pe o discuție cu un necunoscut.'},
            {t: 'Chaturile cu AI sunt private, deci orice e în regulă', why: 'Nu sunt private ca un apel telefonic. Ce scrii poate fi stocat. Ține detaliile personale departe de ele.'}]}},
        {screen: c => app(p, 'Activitate în aplicațiile Gemini', '<p class="cf"><strong>Dezactivat</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Bravo!</strong> Gemini nu mai apare de la butonul de pornire și nu îți mai păstrează conversațiile. Pe un Samsung, uită-te și în <strong>Setări > Galaxy AI</strong>, unde fiecare funcție are propriul comutator.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Contul tău Apple îți ține pozele, contactele și plățile. Hai să verificăm dacă e protejat. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Atinge numele tău</strong> din partea de sus.'},
        {screen: () => list(p, 'Cont Apple', [{id: 'personal', label: 'Informații personale'}, {id: 'security', label: 'Conectare și securitate'}, {id: 'payment', label: 'Plată și livrare'}, {id: 'subscriptions', label: 'Abonamente'}], {back: 'Setări'}),
         target: 'security', say: '<strong>Atinge Conectare și securitate.</strong>'},
        {screen: () => list(p, 'Conectare și securitate', [{label: 'E-mail și numere de telefon', sub: '+44 7700 900123'}, {label: 'Schimbă parola'}, {caption: ' '}, {label: 'Autentificare cu doi factori', value: 'Activat'},
            {id: 'recovery', label: 'Recuperarea contului'}], {back: 'Cont Apple'}),
         target: 'recovery', say: '<strong>Autentificare cu doi factori</strong> spune Activat: bine. Înseamnă că un dispozitiv nou are nevoie de un cod de pe telefonul tău ca să se poată conecta. Acum, <strong>atinge Recuperarea contului</strong>.'},
        {screen: c => list(p, 'Recuperarea contului', [{caption: 'CONTACT DE RECUPERARE'}, c.recovery ? {label: 'Sarah', sub: 'Se așteaptă ca Sarah să accepte'} : {id: 'add-contact', label: 'Adaugă contact de recuperare…', sub: 'Cineva de încredere care te poate ajuta să intri din nou în cont.'}],
            {back: 'Înapoi', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Alege un contact de recuperare</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (fiica)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Dacă îți uiți vreodată parola, un <strong>contact de recuperare</strong> îți poate obține un cod care să te ajute să intri din nou. Nu îți poate vedea datele. <strong>Atinge Adaugă contact de recuperare.</strong>'},
        {screen: c => list(p, 'Recuperarea contului', [{caption: 'CONTACT DE RECUPERARE'}, {label: 'Adaugă contact de recuperare…'}],
            {back: 'Înapoi', overlay: `<div class="ei"><div class="cv"><p><strong>Alege un contact de recuperare</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (fiica)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Alege pe cineva de încredere care are iPhone. <strong>Atinge Sarah.</strong>', hints: {'pick-dave': 'Pentru acest exercițiu, alege-o pe Sarah.'}},
        {screen: c => list(p, 'Recuperarea contului', [{caption: 'CONTACT DE RECUPERARE'}, {label: 'Sarah', sub: 'Se așteaptă ca Sarah să accepte'}], {back: 'Înapoi'}),
         question: {q: 'Cineva sună și spune că e de la Apple. Îți cere să citești codul din 6 cifre care tocmai a apărut pe telefon. Ce faci?', options: [
            {t: 'Închid. Nu dau niciodată acel cod nimănui', ok: true, why: 'Exact. Acel cod îi permite cuiva să intre în contul tău. Apple nu va suna niciodată ca să ți-l ceară.'},
            {t: 'Îl citesc, e de la Apple', why: 'Apple nu va cere niciodată acel cod. Oricine îl are poate intra în contul tău. Închide.'}]}},
        {screen: c => list(p, 'Recuperarea contului', [{caption: 'CONTACT DE RECUPERARE'}, {label: 'Sarah', sub: 'Se așteaptă ca Sarah să accepte'}], {back: 'Înapoi'}), done: true,
         say: '<strong>Bravo!</strong> Autentificarea cu doi factori este activată, iar Sarah te poate ajuta să intri din nou. iPhone-ul îți poate ține minte și parolele, în aplicația <strong>Parole</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Contul tău Google îți ține e-mailurile, pozele și contactele. Hai să-i adăugăm o a doua încuietoare. <strong>Atinge Setări.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Atinge Google.</strong>', hint: 'Google este aproape de partea de jos a listei.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Gestionează-ți Contul Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Copie de rezervă'}, {id: 'autofill', label: 'Completare automată'}]),
         target: 'manage', say: '<strong>Atinge Gestionează-ți Contul Google.</strong>'},
        {screen: () => app(p, 'Cont Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Atinge Securitate</strong> din partea de sus.'},
        {screen: c => list(p, 'Securitate', [{caption: 'Cum te conectezi la Google'}, {id: '2sv', label: 'Verificare în doi pași', sub: c.twoOn ? 'Activat' : 'Dezactivat'}, {label: 'Parolă', sub: 'Ultima modificare: acum 2 ani'}, {label: 'Telefon de recuperare', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Verificarea în doi pași</strong> este Dezactivată. Înseamnă că, pentru a te conecta pe un dispozitiv nou, este nevoie și de un cod trimis pe telefon, așa că o parolă furată nu mai este suficientă. <strong>Atinge-o.</strong>'},
        {screen: () => list(p, 'Verificare în doi pași', [], {top: '<p class="cf">Numărul tău de telefon: <strong>07700 900123</strong><br>Vom trimite un cod prin SMS la acest număr ca să verificăm că este al tău.</p><button type="button" class="ce dk" data-tap="send-code">Trimite codul</button>'}),
         target: 'send-code', say: '<strong>Atinge Trimite codul.</strong>'},
        {screen: c => list(p, 'Verificare în doi pași', [], {top: `<div class="sd"><strong>MESAJE · acum</strong><span>G-382605 este codul tău de verificare Google.</span></div>
            <p class="cf">Introdu codul trimis prin SMS la 07700 900123</p>${field('gcode', 'Introdu codul', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Următorul</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Scrie cele 6 cifre din SMS: 382605.',
         say: 'Sosește un SMS cu un cod. <strong>Scrie 382605 în casetă</strong> și <strong>atinge Următorul</strong>. <em>(Un cod de exersare. Nu scrie niciodată un cod real altundeva decât acolo unde l-ai cerut.)</em>'},
        {screen: () => list(p, 'Verificare în doi pași', [], {top: '<p class="cf">Numărul tău de telefon este verificat ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Activează verificarea în doi pași</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Atinge Activează verificarea în doi pași.</strong>'},
        {screen: c => list(p, 'Securitate', [{caption: 'Cum te conectezi la Google'}, {label: 'Verificare în doi pași', sub: 'Activată ⟦check⟧'}, {label: 'Telefon de recuperare', sub: '07700 900123'}]),
         question: {q: 'Cineva sună și spune că e de la Google. Îți cere să citești codul care tocmai ți-a fost trimis prin SMS. Ce faci?', options: [
            {t: 'Închid. Nu dau niciodată acel cod nimănui', ok: true, why: 'Exact. Acel cod îi permite cuiva să intre în contul tău. Google nu va suna niciodată ca să ți-l ceară.'},
            {t: 'Îl citesc, e de la Google', why: 'Google nu va cere niciodată acel cod. Oricine îl are poate intra în contul tău. Închide.'}]}},
        {screen: c => list(p, 'Securitate', [{caption: 'Cum te conectezi la Google'}, {label: 'Verificare în doi pași', sub: 'Activată ⟦check⟧'}]), done: true,
         say: '<strong>Bravo!</strong> Contul tău Google cere acum și telefonul, nu doar parola. Google îți poate ține minte și parolele: caută <strong>Manager de parole Google</strong> în Setări.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Plimbare frumoasă pe faleză în dimineața asta! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Următoarea plimbare: sâmbătă, ora 10:00, de la port.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Nicio cerere nouă de prietenie.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Vezi profilul tău</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Setări și confidențialitate</strong></button><div class="ck"><strong>Ajutor și asistență</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Hai să ne asigurăm că doar prietenii tăi văd ce postezi. <strong>Deschide Facebook.</strong> <em>(O versiune de exersare. Nu este aplicația reală.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Atinge Meniu</strong> în dreapta jos.', hints: {'tab-friends': 'Ne ocupăm imediat de cererile de prietenie. Mai întâi, atinge Meniu.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Atinge Setări și confidențialitate</strong>.'},
        {screen: c => list(p, 'Setări', [{caption: 'Public și vizibilitate'}, {id: 'posts', label: 'Postări', sub: 'Cine poate vedea postările tale viitoare: ' + (c.audience || 'Public')}, {label: 'Detalii de profil'}, {label: 'Cum te găsesc și te contactează oamenii'},
            {caption: 'Activitatea ta'}, {label: 'Jurnal de activitate'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Cine poate vedea postările tale viitoare?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Public<small>Oricine, pe Facebook sau în afara lui</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Prieteni<small>Prietenii tăi de pe Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Doar eu</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Postările tale sunt setate pe <strong>Public</strong>: oricine din lume le poate vedea. <strong>Atinge Postări.</strong>'},
        {screen: c => list(p, 'Setări', [{caption: 'Public și vizibilitate'}, {label: 'Postări', sub: 'Cine poate vedea postările tale viitoare: Public'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Cine poate vedea postările tale viitoare?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Public<small>Oricine, pe Facebook sau în afara lui</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Prieteni<small>Prietenii tăi de pe Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Doar eu</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Prieteni'; }, say: '<strong>Atinge Prieteni.</strong>',
         hints: {'aud-public': 'Public este cum era. Atinge Prieteni.', 'aud-me': 'Doar eu înseamnă că nimeni altcineva nu îți vede postările. Atinge Prieteni.'}},
        {screen: c => list(p, 'Setări', [{caption: 'Public și vizibilitate'}, {label: 'Postări', sub: 'Cine poate vedea postările tale viitoare: Prieteni ⟦check⟧'}, {id: 'back-feed', label: '‹ Înapoi la Facebook'}]),
         target: 'back-feed', say: 'Gata. Acum <strong>atinge Înapoi la Facebook</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Ai o cerere de prietenie. <strong>Atinge Prieteni.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'O cerere de prietenie de la „Jean Smith”. Dar ești deja prieten cu Jean (apare în fluxul tău). Ce se întâmplă?', options: [
            {t: 'Probabil e o copie a profilului lui Jean, făcută de un escroc', ok: true, why: 'Da. Escrocii copiază numele și poza cuiva, apoi scriu prietenilor lui cerând bani. Adevărata Jean este deja prietena ta.'},
            {t: 'Jean trebuie să aibă un al doilea cont', why: 'Posibil, dar mult mai probabil e o copie făcută de un escroc: a apărut acum 2 zile. Verifică la telefon cu Jean.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Atinge Șterge</strong> ca să respingi cererea.', hints: {'confirm-jean': 'Nu confirma un profil copiat. Atinge Șterge.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Bravo!</strong> Postările tale sunt doar pentru prieteni și ai ocolit un profil fals. Anunț-o pe Jean, ca să-l poată raporta. Fii atent și la cumpărătorii din Marketplace care vor să plătească „prin curier” sau care cer coduri trimise pe telefonul tău.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Caută aici'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Autogară și gară, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Spital, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Biserică, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Autogară și gară · 25 de mile</small><button type="button" class="ce co" data-tap="directions">Indicații</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 min (25 de mile)</strong><small>Cel mai rapid traseu, prin A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Mergi pe jos 4 min până la <strong>Bridlington Bus Station</strong>, peronul 3</li>
                <li>⟦bus⟧ <strong>121</strong> spre Hull · 10:15 · <b class="ahy">La timp</b></li><li>Coboară la <strong>Hull Paragon Interchange</strong> (24 de stații)</li></ol>
                <button type="button" class="ce co" data-tap="start">Start</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Hărți poate planifica o călătorie cu autobuzul, cu ore în timp real. Hai să mergem la Hull cu autobuzul. <strong>Deschide Hărți.</strong>' + (p === 'ios' ? ' <em>(Google Maps funcționează la fel, dacă preferi.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Atinge caseta de căutare</strong> din partea de sus.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Am scris „Hull interchange”. <strong>Atinge Hull Paragon Interchange</strong>, autogara.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Atinge Indicații.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Arată mai întâi mersul cu mașina. <strong>Atinge autobuzul</strong> ⟦bus⟧ ca să vezi transportul în comun.', hints: {'mode-walk': 'Opt ore! Atinge în schimb autobuzul.', 'mode-car': 'Aceasta este mersul cu mașina. Atinge autobuzul.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Iată autobuzele, cu următorul primul. „La timp” este în timp real. <strong>Atinge 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Unde prinzi autobuzul?', options: [
            {t: 'Bridlington Bus Station, peronul 3', ok: true, why: 'Da. Hărți îți spune încotro să mergi pe jos, ce autobuz să iei și unde să cobori.'},
            {t: 'Hull Paragon Interchange', why: 'Acolo cobori. Îl prinzi la Bridlington Bus Station, peronul 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Bravo!</strong> Atinge <strong>Start</strong> într-o călătorie reală și Hărți îți spune când se apropie stația ta. Cu un abonament de autobuz, îl arăți șoferului ca de obicei. <em>(Ore doar pentru exersare: verifică orele reale în ziua respectivă.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>SOS urgențe</strong> sună la 999 pentru tine și trimite prin SMS locația ta persoanelor pe care le alegi. Hai să verificăm dacă e pregătit. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Atinge SOS urgențe.</strong>', hint: 'Este în al treilea grup, cu o pictogramă roșie.'},
        {screen: c => list(p, 'SOS urgențe', [{label: 'Apelează cu apăsare lungă și eliberare', toggle: true, sub: 'Ține apăsat butonul lateral și un buton de volum, apoi eliberează.'},
            {id: 'five', label: 'Apelează cu 5 apăsări de buton', toggle: !!c.five, sub: 'Apasă rapid butonul lateral de 5 ori.'}, {caption: ' '},
            {id: 'contacts', label: 'Configurează contactele de urgență în Sănătate'}, {label: 'Detectarea accidentelor', toggle: true, sub: 'Sună la 999 după un accident rutier grav.'}], {back: 'Setări'}),
         target: 'five', action: c => { c.five = true; }, say: 'Apăsarea butonului lateral de 5 ori se ține minte ușor în panică. <strong>Activează Apelează cu 5 apăsări de buton.</strong>'},
        {screen: c => list(p, 'SOS urgențe', [{label: 'Apelează cu apăsare lungă și eliberare', toggle: true}, {label: 'Apelează cu 5 apăsări de buton', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Configurează contactele de urgență în Sănătate'}], {back: 'Setări', overlay: c.pick ? sheet('Adaugă contact de urgență', [['pick-sarah', 'Sarah', 'Fiica · 07700 900333'], ['pick-dave', 'Dave', 'Prieten']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Acum alege cine primește un SMS cu locația ta. <strong>Atinge Configurează contactele de urgență.</strong>'},
        {screen: () => list(p, 'SOS urgențe', [{label: 'Apelează cu 5 apăsări de buton', toggle: true}], {back: 'Setări', overlay: sheet('Adaugă contact de urgență', [['pick-sarah', 'Sarah', 'Fiica · 07700 900333'], ['pick-dave', 'Dave', 'Prieten']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Atinge Sarah</strong>, fiica ta.', hints: {'pick-dave': 'Alege-o pe Sarah pentru acest exercițiu.'}},
        {screen: () => list(p, 'SOS urgențe', [{label: 'Apelează cu 5 apăsări de buton', toggle: true}, {caption: 'CONTACTE DE URGENȚĂ'}, {label: 'Sarah', sub: 'Fiica'}], {back: 'Setări'}),
         question: {q: 'Ai căzut și nu poți ajunge bine la ecranul telefonului. Ce faci?', options: [
            {t: 'Apăs rapid butonul lateral de 5 ori', ok: true, why: 'Da. Începe o numărătoare inversă, apoi sună la 999 și îi trimite lui Sarah un SMS cu locul unde ești.'},
            {t: 'Deblochez telefonul și caut aplicația Telefon', why: 'Asta e lent într-o urgență. Apăsarea butonului lateral de 5 ori merge chiar și când telefonul este blocat.'}]}},
        {screen: () => list(p, 'SOS urgențe', [{label: 'Apelează cu 5 apăsări de buton', toggle: true}, {caption: 'CONTACTE DE URGENȚĂ'}, {label: 'Sarah', sub: 'Fiica'}], {back: 'Setări'}), done: true,
         say: '<strong>Bravo!</strong> SOS urgențe este pregătit, iar Sarah va afla unde ești. Dacă îl apeși din greșeală, atinge Oprește în timpul numărătorii inverse.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>SOS urgențe</strong> sună la 999 pentru tine și trimite prin SMS locația ta persoanelor pe care le alegi. Hai să verificăm dacă e pregătit. <strong>Atinge Configurări.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Atinge Siguranță și urgențe.</strong> <em>Pe un Samsung se numește tot Siguranță și urgențe.</em>', hint: 'Derulează în jos: este aproape de partea de jos.'},
        {screen: () => list(p, 'Siguranță și urgențe', [{id: 'medical', label: 'Informații medicale'}, {id: 'contacts-ec', label: 'Contacte de urgență'}, {id: 'sos', label: 'SOS urgențe', sub: 'Dezactivat'}, {label: 'Detectarea accidentelor auto'}]),
         target: 'sos', say: 'SOS urgențe este <strong>Dezactivat</strong>. <strong>Atinge SOS urgențe.</strong>'},
        {screen: c => list(p, 'SOS urgențe', [{id: 'sos-toggle', label: 'Folosește SOS urgențe', toggle: !!c.sosOn, sub: 'Apasă butonul de pornire de 5 ori sau mai mult pentru a porni acțiunile de urgență.'}, {label: 'Trimite informații contactelor de urgență', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Atinge Folosește SOS urgențe</strong> ca să activezi.'},
        {screen: () => list(p, 'Siguranță și urgențe', [{id: 'medical', label: 'Informații medicale'}, {id: 'contacts-ec', label: 'Contacte de urgență', sub: 'Niciuna'}, {label: 'SOS urgențe', sub: 'Activat'}]),
         target: 'contacts-ec', say: 'Acum alege cine primește un SMS cu locația ta. <strong>Atinge Contacte de urgență.</strong>'},
        {screen: c => list(p, 'Contacte de urgență', [{id: 'add', label: '＋ Adaugă contact'}], {overlay: c.pick ? sheet('Alege un contact', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Atinge Adaugă contact.</strong>'},
        {screen: () => list(p, 'Contacte de urgență', [{label: '＋ Adaugă contact'}], {overlay: sheet('Alege un contact', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Atinge Sarah</strong>, fiica ta.', hints: {'pick-dave': 'Alege-o pe Sarah pentru acest exercițiu.'}},
        {screen: () => list(p, 'Contacte de urgență', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Adaugă contact'}]),
         question: {q: 'Ai căzut și nu poți ajunge bine la ecranul telefonului. Ce faci?', options: [
            {t: 'Apăs rapid butonul de pornire de 5 ori', ok: true, why: 'Da. Începe o numărătoare inversă, apoi sună la 999 și îi trimite lui Sarah locul unde ești.'},
            {t: 'Deblochez telefonul și caut aplicația Telefon', why: 'Asta e lent într-o urgență. Apăsarea butonului de pornire de 5 ori merge chiar și când telefonul este blocat.'}]}},
        {screen: () => list(p, 'Contacte de urgență', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Bravo!</strong> SOS urgențe este activat, iar Sarah va afla unde ești. Dacă îl apeși din greșeală, atinge Anulează în timpul numărătorii inverse.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Alertele de urgență te avertizează despre pericole din apropiere, cum ar fi inundațiile grave. Cineva a dezactivat una pe acest telefon. Hai să reparăm asta. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Atinge Notificări.</strong>'},
            {screen: c => list(p, 'Notificări', [{label: 'Afișează previzualizări', value: 'Întotdeauna'}, {caption: 'STILUL NOTIFICĂRILOR'}, {label: 'Mesaje', sub: 'Bannere, sunete, insigne'}, {label: 'WhatsApp', sub: 'Bannere, sunete, insigne'},
                {caption: 'ALERTE GUVERNAMENTALE'}, {label: 'Alerte extreme', toggle: true}, {id: 'severe', label: 'Alerte grave', toggle: !!c.severe}, {label: 'Alerte de test', toggle: false}], {back: 'Setări'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Alertele guvernamentale sunt chiar în partea de jos. <strong>Alerte grave</strong> este dezactivat. <strong>Atinge-l ca să-l activezi.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Atinge Siguranță și urgențe.</strong>', hint: 'Este aproape de partea de jos a listei.'},
            {screen: () => list(p, 'Siguranță și urgențe', [{label: 'Informații medicale'}, {label: 'SOS urgențe'}, {id: 'wea', label: 'Alerte de urgență wireless'}, {label: 'Alerte pentru trackere necunoscute'}]),
             target: 'wea', say: '<strong>Atinge Alerte de urgență wireless.</strong> <em>Pe unele telefoane se numește Alerte de urgență.</em>'},
            {screen: c => list(p, 'Alerte de urgență wireless', [{label: 'Permite alertele', toggle: true}, {label: 'Amenințări extreme', toggle: true}, {id: 'severe', label: 'Amenințări grave', toggle: !!c.severe}, {label: 'Alerte de test', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Amenințări grave</strong> este dezactivat. <strong>Atinge-l ca să-l activezi.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Alertă de urgență: gravă</strong><p>Se așteaptă inundații grave lângă faleză. Mergi spre un loc mai înalt. Mai multe la gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'Așa arată o alertă. Scoate un sunet puternic de sirenă timp de aproximativ 10 secunde, chiar și pe silențios. <strong>Atinge OK.</strong> <em>(Doar pentru exersare.)</em>'},
        {screen: () => home(p), question: {q: 'Sosește o alertă în timp ce conduci. Ce ar trebui să faci?', options: [
            {t: 'Opresc într-un loc sigur înainte să o citesc', ok: true, why: 'Da. Nu citi niciodată telefonul în timp ce conduci. Oprește în siguranță, apoi citește.'},
            {t: 'O citesc imediat, în timp ce conduc', why: 'Nu citi niciodată telefonul în timp ce conduci. Găsește mai întâi un loc sigur unde să oprești.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Telefonul te va avertiza acum despre pericole serioase din apropiere. Alertele reale nu cer niciodată date personale sau bani: dacă una o face, este o înșelătorie.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Trei lucruri care fac un telefon furat mult mai puțin util unui hoț. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Atinge Face ID și cod.</strong> <em>Pe un iPhone real vei introduce apoi codul.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Derulează în jos și <strong>atinge Protecția dispozitivelor furate</strong>.'},
            {screen: c => list(p, 'Protecția dispozitivelor furate', [{id: 'sdp', label: 'Protecția dispozitivelor furate', toggle: !!c.sdp, sub: 'Departe de casă, schimbarea codului sau a contului Apple cere Face ID și o așteptare de 1 oră.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Aceasta oprește un hoț care te-a văzut tastând codul să te blocheze în afara telefonului. <strong>Activează-l.</strong>'},
            {screen: () => list(p, 'Protecția dispozitivelor furate', [{label: 'Protecția dispozitivelor furate', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Apoi, ascunde mesajele de pe ecranul blocat. <strong>Atinge ‹ Face ID</strong> ca să te întorci.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Atinge Notificări.</strong>'},
            {screen: c => list(p, 'Notificări', [{id: 'previews', label: 'Afișează previzualizări', value: c.previews || 'Întotdeauna'}, {label: 'Partajarea ecranului', value: 'Notificări dezactivate'}], {back: 'Setări',
                overlay: c.pickPrev ? sheet('Afișează previzualizări', [['prev-always', 'Întotdeauna'], ['prev-unlocked', 'Când e deblocat', 'Recomandat'], ['prev-never', 'Niciodată']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Acum oricine poate citi mesajele tale, inclusiv codurile de securitate, fără să-ți deblocheze telefonul. <strong>Atinge Afișează previzualizări.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Atinge Google.</strong>', hint: 'Este aproape de partea de jos a listei.'},
            {screen: () => list(p, 'Google', [{label: 'Gestionează-ți Contul Google'}, {id: 'all-services', label: 'Toate serviciile'}, {label: 'Copie de rezervă'}]), target: 'all-services', say: '<strong>Atinge Toate serviciile.</strong>'},
            {screen: () => list(p, 'Toate serviciile', [{caption: 'Siguranță personală și a dispozitivului'}, {id: 'theft', label: 'Protecție împotriva furtului'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Atinge Protecție împotriva furtului.</strong>'},
            {screen: c => list(p, 'Protecție împotriva furtului', [{id: 'tdl', label: 'Blocare la detectarea furtului', toggle: !!c.tdl, sub: 'Îți blochează ecranul dacă simte că cineva îți smulge telefonul și fuge.'}, {label: 'Blocare dispozitiv offline', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Activează Blocare la detectarea furtului.</strong> Dacă cineva îți smulge telefonul și fuge, acesta se blochează singur.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Apoi, ascunde mesajele de pe ecranul blocat. Înapoi în Setări, <strong>atinge Notificări</strong>.'},
            {screen: c => list(p, 'Notificări', [{id: 'previews', label: 'Notificări pe ecranul de blocare', sub: c.previews || 'Afișează tot conținutul'}, {label: 'Istoric notificări'}], {
                overlay: c.pickPrev ? sheet('Notificări pe ecranul de blocare', [['prev-always', 'Afișează tot conținutul'], ['prev-unlocked', 'Ascunde conținutul sensibil', 'Recomandat'], ['prev-never', 'Nu afișa deloc notificările']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Acum oricine poate citi mesajele tale, inclusiv codurile de securitate, fără să-ți deblocheze telefonul. <strong>Atinge Notificări pe ecranul blocat.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Notificări', [{label: 'Afișează previzualizări', value: 'Întotdeauna'}], {back: 'Setări', overlay: sheet('Afișează previzualizări', [['prev-always', 'Întotdeauna'], ['prev-unlocked', 'Când e deblocat', 'Recomandat'], ['prev-never', 'Niciodată']])})
                : list(p, 'Notificări', [{label: 'Notificări pe ecranul de blocare', sub: 'Afișează tot conținutul'}], {overlay: sheet('Notificări pe ecranul de blocare', [['prev-always', 'Afișează tot conținutul'], ['prev-unlocked', 'Ascunde conținutul sensibil', 'Recomandat'], ['prev-never', 'Nu afișa deloc notificările']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Când e deblocat' : 'Ascunde conținutul sensibil'}.</strong>`, hints: {'prev-always': 'Așa era. Alege-o pe cea recomandată.', 'prev-never': 'Aceasta le ascunde complet, ceea ce poate fi supărător. Alege-o pe cea recomandată.'}},
        {screen: () => home(p), target: 'phone', say: 'În final, găsește numărul IMEI al telefonului. Operatorul de rețea îl cere ca să blocheze un telefon furat. <strong>Deschide aplicația Telefon.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'Pe tastatura numerică, <strong>formează *#06#</strong> (stea, diez, zero, șase, diez).', hint: 'Începe cu tasta stea *, în stânga jos.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Informații despre dispozitiv', 'IMEI: 35 209900 176148 1 (număr de exersare)', [['ok', 'OK']])}),
         target: 'ok', say: 'Acel număr lung este <strong>IMEI-ul</strong> tău. Pe un telefon real, notează-l undeva în siguranță (nu pe telefon!). <strong>Atinge OK.</strong>'},
        {screen: () => home(p), question: {q: 'Ți-a fost smuls telefonul. Pe cine suni primul?', options: [
            {t: 'Banca mea, de pe telefonul altcuiva', ok: true, why: 'Da. Hoții merg mai întâi la aplicațiile bancare. Apoi blochează telefonul online, sună operatorul de rețea și raportează la 101.'},
            {t: 'Aștept să văd dacă apare', why: 'Viteza contează. Sună banca imediat, apoi blochează telefonul și sună operatorul de rețea.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Telefonul tău este mult mai greu de folosit pentru un hoț și știi unde să găsești IMEI-ul.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'FIND MY' : 'ALERTĂ TRACKER', title: p === 'ios' ? 'AirTag găsit în mișcare împreună cu tine' : 'Tracker necunoscut care călătorește cu tine',
            text: '<br>Locația acestui obiect poate fi văzută de proprietarul lui.'}),
         target: 'alert', say: 'Telefonul a observat un tracker care nu este al tău și se mișcă împreună cu tine. Nu intra în panică: adesea este al unui membru al familiei, din greșeală. <strong>Atinge alerta.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'AirTag necunoscut' : 'Tracker necunoscut', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Văzut cu tine de la <strong>10:12</strong> azi, în 4 locuri.</p>
            <button type="button" class="ce co" data-tap="play">Redă sunetul</button>
            <button type="button" class="cp" data-tap="learn">Află despre acest ${p === 'ios' ? 'AirTag' : 'Tracker'}</button>
            <button type="button" class="cp" data-tap="disable">Instrucțiuni de dezactivare</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Harta arată pe unde a fost împreună cu tine. <strong>Atinge Redă sunetul</strong> ca să-l poți găsi.'},
        {screen: () => app(p, p === 'ios' ? 'AirTag necunoscut' : 'Tracker necunoscut', '<p class="cf">⟦volume-2⟧ <strong>Se redă sunetul…</strong><br>Ascultă un sunet de ciripit.</p>', {color: '#fff'}),
         question: {q: 'Auzi un ciripit slab. Unde ar trebui să cauți?', options: [
            {t: 'În genți, buzunare de haină, mașină și în orice ai împrumutat', ok: true, why: 'Da. Trackerele sunt mici, cam cât o monedă mare, și sunt adesea băgate în căptușeli, buzunare sau mașini.'},
            {t: 'Nicăieri, îl ignor', why: 'Merită să-l găsești. Verifică genți, buzunare și mașina: poate fi doar al unui membru al familiei.'}]}},
        {screen: c => app(p, 'Tracker găsit', `<p class="cf">Ține partea de sus a telefonului lângă tracker ca să afli mai multe despre el.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Ține lângă tracker</button>`, {color: '#fff'}),
         target: 'scan', say: 'L-ai găsit în căptușeala hainei. <strong>Atinge Ține lângă tracker</strong> ca să vezi cui aparține.'},
        {screen: () => app(p, 'Despre acest tracker', '<p class="cf"><strong>Nu este în Mod pierdut</strong><br>Număr de serie: P4R7-ACT1CE<br>Detaliile proprietarului sunt împărtășite doar cu poliția.</p>', {color: '#fff'}),
         question: {q: 'Nu este al unui membru al familiei și ești îngrijorat că cineva l-a ascuns ca să te urmărească. Ce faci?', options: [
            {t: 'Îl păstrez în siguranță și îl duc la poliție (sau sun la 999 dacă sunt în pericol)', ok: true, why: 'Da. Nu-l arunca: poliția îl poate urmări până la proprietar. National Stalking Helpline este la 0808 802 0300.'},
            {t: 'Îl arunc la gunoi', why: 'Poate fi o probă, iar poliția poate găsi proprietarul. Păstrează-l și du-l la ei sau sună la 999 dacă ești în pericol.'}]}},
        {screen: () => app(p, 'Despre acest tracker', '<p class="cf">Ajutor: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 de ore) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Bravo!</strong> Știi cum să găsești un tracker și ce să faci. ' + (p === 'android' ? 'Verifică dacă alertele sunt activate în <strong>Setări > Siguranță și urgențe > Alerte pentru trackere necunoscute</strong>.' : 'iPhone-urile verifică automat dacă există trackere.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Ești pe o potecă de pe stâncă și cineva a căzut. Nu există adresă. Când suni la 999, majoritatea telefoanelor trimit automat locația ta, dar și trei cuvinte ajută. <strong>Deschide what3words.</strong> <em>(O versiune de exersare.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Punctul albastru ești tu. Fiecare pătrat de 3 metri are propriile trei cuvinte. Ale tale sunt <strong>puffin.chalk.lantern</strong>. Așteaptă puțin ca punctul să se stabilizeze, apoi <strong>atinge Am cele 3 cuvinte</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Acum sună la 999. <strong>Deschide aplicația Telefon.</strong> <em>(Doar pentru exersare: nu suna niciodată la 999 pentru a testa.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Formează 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Atinge butonul verde de apelare.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Apel de urgență · 0:08</small></div>
            <p class="hi">„Urgențe, ce serviciu doriți? … Ambulanță. Care este locația exactă a urgenței?”</p>${homeIndicator(p)}</div>`,
         question: {q: 'Operatorul te întreabă unde ești. Ce spui?', options: [
            {t: '„Sunt pe poteca de pe stâncă. Adresa mea what3words este puffin, chalk, lantern.”', ok: true, why: 'Da. Spune unde ești cu propriile cuvinte, apoi spune cele trei cuvinte. Silabisește orice cuvânt dacă ți se cere.'},
            {t: '„Nu știu, undeva lângă mare”', why: 'Vor încerca să te găsească, dar trei cuvinte te localizează la 3 metri. Citește-le din aplicație.'}]}},
        {screen: () => home(p), question: {q: 'Un prieten este surd și nu poate suna. Cum poate ajunge la 999?', options: [
            {t: 'Se înregistrează acum pentru mesaje de urgență (trimite „register” prin SMS la 999) sau folosește aplicația 999 BSL', ok: true, why: 'Da. Mesajele de urgență funcționează doar dacă te înregistrezi mai întâi. Aplicația 999 BSL te conectează la un interpret de limbaj mimico-gestual.'},
            {t: 'Nu pot', why: 'Poate. Se înregistrează pentru mesaje de urgență trimițând „register” prin SMS la 999 sau folosește aplicația gratuită 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Ține minte: spune unde ești, apoi spune cele trei cuvinte. Aplicația what3words funcționează fără semnal ca să-ți găsești cuvintele, dar ai nevoie de semnal ca să suni.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Nu răspunde</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Telefonul s-a blocat: atingerile nu fac nimic și nu se oprește normal. Este o problemă mare?', options: [
            {t: 'De obicei nu. O „repornire forțată” o rezolvă și nu pierzi nimic', ok: true, why: 'Corect. O repornire forțată e ca și cum l-ai opri de la priză. Pozele și mesajele tale sunt în siguranță.'},
            {t: 'Da, e stricat', why: 'De obicei nu! O repornire forțată rezolvă majoritatea telefoanelor blocate și nu pierzi nimic.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'Pe un iPhone: <strong>apasă și eliberează volum sus</strong>, apoi <strong>apasă și eliberează volum jos</strong>, apoi <strong>ține apăsat butonul lateral</strong> până apare sigla Apple (aproximativ 10 secunde). Aici, atinge-le în această ordine.'
            : 'Pe majoritatea telefoanelor Android: <strong>ține apăsate butonul de pornire și volum jos împreună</strong> aproximativ 10 secunde, până repornește. Aici, atinge pornire, apoi volum jos. <em>(Google Pixel: ține apăsat doar butonul de pornire 30 de secunde.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Volum sus este primul.' : 'Începe cu butonul de pornire.', side: 'Butonul lateral este ultimul, după ambele butoane de volum.'},
         hint: p === 'ios' ? 'Volum sus, apoi volum jos, apoi butonul lateral.' : 'Pornire, apoi volum jos.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'A apărut sigla. Ce faci acum?', options: [
            {t: 'Las butonul și aștept să pornească', ok: true, why: 'Da. Durează un minut. Poate fi nevoie să scrii o dată codul.'},
            {t: 'Continui să apăs toate butoanele', why: 'Lasă butoanele când apare sigla și dă-i un minut să pornească.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Bravo!</strong> Telefonul a repornit. Dacă se blochează mereu, verifică actualizările și eliberează spațiu. Repornirea telefonului o dată pe săptămână îl ține în formă bună.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Activat' : 'Dezactivat'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Dezactivat' : (ctx.signal ? 'Activat · 4G' : 'Fără serviciu')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Dezactivat' : 'Acasă'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Glisează în sus ca să închizi' : 'Închide'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Fără serviciu</span>'), target: 'pull-down',
         say: 'Telefonul spune <strong>Fără serviciu</strong>, deși a mers în dimineața asta. O rezolvare rapidă este să activezi și să dezactivezi Modul avion, ceea ce îl face să se reconecteze. ' + (p === 'ios' ? '<strong>Glisează în jos din colțul din dreapta sus</strong> (sau atinge banda).' : '<strong>Glisează în jos de sus</strong> (sau atinge banda).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Atinge Mod avion</strong> ca să-l activezi. Tot ce este wireless se oprește.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Așteaptă aproximativ 10 secunde… apoi <strong>atinge din nou Mod avion</strong> ca să-l dezactivezi.'},
        {screen: c => quickPanel(p, c), question: {q: 'Datele mobile au revenit pe 4G. Când mai este util Modul avion?', options: [
            {t: 'Într-un avion sau în străinătate, ca să eviți taxele de roaming (poți totuși activa Wi-Fi)', ok: true, why: 'Da. Poți reactiva Wi-Fi cât timp Modul avion este activ, ca să folosești Wi-Fi-ul unui hotel sau al unei nave.'},
            {t: 'Ca să încarce telefonul', why: 'Se încarcă puțin mai repede, dar este în principal pentru zboruri și pentru a evita taxele de roaming în străinătate.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Bravo!</strong> Dacă Modul avion nu rezolvă problema, repornește telefonul. Tot fără serviciu? Verifică site-ul operatorului tău de rețea pentru probleme în zona ta.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · acum</strong><span>🎁 Vieți GRATUITE te așteaptă! Revino și joacă! 🎉</span></button>',
         target: 'settings', say: 'Un joc tot bâzâie cu mesaje fără rost. Poți dezactiva notificările pentru orice aplicație. <strong>Atinge Setări</strong>, nu mesajul.', hints: {notif: 'Asta deschide jocul. Atinge în schimb Setări.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Atinge Notificări.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Notificări', [{label: 'Afișează previzualizări', value: 'Când e deblocat'}, {caption: 'STILUL NOTIFICĂRILOR'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Bannere, sunete, insigne'}, {label: 'Mesaje', sub: 'Bannere, sunete, insigne'}, {label: 'WhatsApp', sub: 'Bannere, sunete, insigne'}], {back: 'Setări'})
            : list(p, 'Notificări', [{id: 'app-notifs', label: 'Notificări aplicații'}, {id: 'history', label: 'Istoric notificări'}, {label: 'Notificări pe ecranul de blocare'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Atinge Bubble Pop.</strong>' : '<strong>Atinge Notificări aplicații.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Notificări aplicații', [{label: 'Mesaje', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Atinge comutatorul de lângă Bubble Pop</strong> ca să-i dezactivezi notificările.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Permite notificările', toggle: !c.off}], {back: 'Notificări'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Dezactivează Permite notificările.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Notificări', [{label: 'Notificări aplicații'}, {id: 'history', label: 'Istoric notificări', sub: 'Dezactivat'}]), target: 'history',
             say: 'Un bonus util: dacă ștergi un mesaj din greșeală prin glisare, Istoricul notificărilor păstrează o copie. <strong>Atinge Istoric notificări.</strong>'},
            {screen: c => list(p, 'Istoric notificări', [{id: 'hist-toggle', label: 'Folosește istoricul notificărilor', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Activează-l.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Notificările căror aplicații merită păstrate?', options: [
            {t: 'Mesaje, apeluri, WhatsApp, banca ta și tot ce ai vrea să afli imediat', ok: true, why: 'Da. Păstrează-le pe cele importante și dezactivează jocurile, magazinele și tot ce doar te bate la cap.'},
            {t: 'Le dezactivez pe toate', why: 'Ai pierde mesaje și apeluri! Păstrează-le pe cele importante și dezactivează jocurile și aplicațiile de cumpărături.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Bravo!</strong> Bubble Pop nu te va mai deranja. ' + (p === 'ios' ? 'Dacă ștergi un mesaj din greșeală prin glisare, glisează în sus din mijlocul ecranului blocat ca să vezi mesajele anterioare.' : 'Iar istoricul notificărilor păstrează o copie a tot ce ștergi prin glisare.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Ne vedem la centrul de grădinărit Dunărea x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Mesaj text</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Ai scris „centrul de grădinărit Dunnington” și telefonul l-a schimbat. De ce?', options: [
            {t: 'Corectarea automată a ghicit cuvântul greșit', ok: true, why: 'Da. Corectarea automată înlocuiește cuvintele pe care nu le cunoaște. O poți dezactiva sau o poți învăța cuvinte noi.'},
            {t: 'Telefonul este stricat', why: 'Este doar corectarea automată care ghicește. O poți dezactiva sau o poți învăța cuvinte.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Atinge Setări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Atinge General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'Despre'}, {label: 'Actualizare software'}, {id: 'keyboard', label: 'Tastatură'}, {label: 'Limbă și regiune'}], {back: 'Setări'}), target: 'keyboard', say: '<strong>Atinge Tastatură.</strong>'},
            {screen: c => list(p, 'Tastaturi', [{id: 'replace', label: 'Înlocuire text'}, {caption: 'TOATE TASTATURILE'}, {label: 'Majuscule automate', toggle: true}, {id: 'ac', label: 'Corectare automată', toggle: !c.acOff}, {label: 'Text predictiv', toggle: true}], {back: 'General'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Dezactivează Corectare automată.</strong> Greșelile de ortografie primesc în continuare o subliniere roșie, așa că le poți corecta singur.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Atinge Sistem.</strong> Este în partea de jos.'},
            {screen: () => list(p, 'Sistem', [{id: 'keyboard', label: 'Tastatură'}, {label: 'Limbi'}, {label: 'Dată și oră'}]), target: 'keyboard', say: '<strong>Atinge Tastatură.</strong>'},
            {screen: () => list(p, 'Tastatură', [{id: 'gboard', label: 'Gboard', sub: 'Tastatură pe ecran'}]), target: 'gboard', say: '<strong>Atinge Gboard.</strong> <em>Pe un Samsung se numește Tastatură Samsung > Tastare inteligentă.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Preferințe'}, {id: 'correction', label: 'Corectare text'}, {label: 'Tastare prin glisare'}]), target: 'correction', say: '<strong>Atinge Corectare text.</strong>'},
            {screen: c => list(p, 'Corectare text', [{label: 'Afișează bara de sugestii', toggle: true}, {id: 'ac', label: 'Corectare automată', toggle: !c.acOff}, {label: 'Verificare ortografică', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Dezactivează Corectare automată.</strong> Greșelile de ortografie primesc în continuare o subliniere roșie, așa că le poți corecta singur.'},
        ]),
        {screen: () => home(p), question: {q: 'Ai prefera să păstrezi corectarea automată, dar îți schimbă mereu „Dunnington”. Ce altceva ai putea face?', options: [
            {t: 'Adaug cuvântul în dicționarul telefonului, ca să îl învețe', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Folosește Înlocuire text în aceleași setări ale tastaturii.' : 'Atinge cuvântul din bara de sugestii și alege să îl adaugi în dicționar.')},
            {t: 'Nimic, o suport așa', why: 'Poți să o înveți: ' + (p === 'ios' ? 'adaugă cuvântul în Tastatură > Înlocuire text.' : 'atinge cuvântul din sugestii și adaugă-l în dicționar.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Gata cu înlocuirile surpriză de cuvinte. O poți reactiva oricând, în același loc.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Ai primit căști wireless noi. Ce faci mai întâi?', options: [
            {t: 'Le pun în „mod de asociere” (de obicei ții apăsat butonul până clipește o lumină)', ok: true, why: 'Da. Modul de asociere permite telefonului să le găsească. Instrucțiunile din cutie spun exact cum.'},
            {t: 'Le conectez la telefon cu un cablu', why: 'Căștile wireless se conectează prin Bluetooth. Pune-le mai întâi în modul de asociere, de obicei ținând apăsat butonul până clipește o lumină.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Lumina căștilor clipește. <strong>Atinge Setări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Atinge Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Atinge Dispozitive conectate.</strong>'},
            {screen: () => list(p, 'Dispozitive conectate', [{id: 'pair', label: '＋ Asociază dispozitiv nou'}, {label: 'Dispozitive salvate', sub: 'Mașină'}]), target: 'pair', say: '<strong>Atinge Asociază dispozitiv nou.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Asociază dispozitiv nou', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'DISPOZITIVELE MELE' : 'Salvat'}, {label: 'Mașină', sub: 'Neconectat'},
            {caption: p === 'ios' ? 'ALTE DISPOZITIVE' : 'Dispozitive disponibile'}, {id: 'headphones', label: '⟦headphones⟧ Practice Headphones'}, {label: 'Televizorul vecinului'}], {back: 'Setări'}),
         target: 'headphones', say: 'Telefonul caută dispozitive din apropiere. <strong>Atinge Practice Headphones.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'DISPOZITIVELE MELE'}, {label: '⟦headphones⟧ Practice Headphones', sub: 'Conectat ⟦check⟧'}, {label: 'Mașină', sub: 'Neconectat'}], {back: 'Setări'}),
         question: {q: 'Data viitoare când pornești căștile, trebuie să faci din nou asta?', options: [
            {t: 'Nu, de acum încolo se conectează singure', ok: true, why: 'Da. Asociezi o singură dată. După aceea se conectează automat când sunt pornite și în apropiere.'},
            {t: 'Da, de fiecare dată', why: 'Asociezi o singură dată. După aceea se conectează singure.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Practice Headphones', sub: 'Conectat ⟦check⟧'}], {back: 'Setări'}), done: true,
         say: '<strong>Bravo!</strong> Aceiași pași merg pentru o mașină, o boxă sau aparate auditive. Dacă ceva nu se conectează, dezactivează și reactivează Bluetooth și pune dispozitivul din nou în modul de asociere.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">„${ctx.said || 'Bunico? Sunt eu, Tom! Mi-am pierdut telefonul și am probleme. Am nevoie de 400 £ pentru o amendă, azi. Te rog să nu-i spui mamei!'}”</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Cere fraza secretă a familiei</button><button type="button" data-tap="send-money">Spune că trimiți banii</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Sună un număr necunoscut. <strong>Răspunde</strong>, ca să exersezi ce trebuie să faci.', hints: {decline: 'În realitate e în regulă să refuzi! Pentru acest exercițiu, atinge Răspunde.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Ăă… ce? Bunico, nu e timp de asta! Te rog, am nevoie de bani acum!'; },
         say: 'Sună exact ca nepotul tău Tom. Dar escrocii pot copia vocile. Familia ta a stabilit o <strong>frază secretă</strong>. <strong>Cere-o.</strong>',
         hints: {'send-money': 'Nu accepta niciodată să trimiți bani într-un apel ca acesta. Cere fraza secretă.', end: 'Și să închizi e în regulă! Dar mai întâi, exersează cererea frazei secrete.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Nu o știe și insistă mai tare. Acesta este un escroc. <strong>Închide</strong> cu butonul roșu.', hints: {'send-money': 'Nu! Nu au știut fraza. Închide.', 'ask-phrase': 'Ai întrebat și nu au putut răspunde. Închide.'}},
        {screen: () => home(p), question: {q: 'Ești încă puțin îngrijorat pentru Tom. Ce faci?', options: [
            {t: 'Îl sun pe Tom (sau pe mama lui) la numărul pe care îl am deja pentru el', ok: true, why: 'Da. Sună mereu înapoi la un număr pe care îl cunoști. Adevăratul Tom va fi bine și nu se va supăra că verifici.'},
            {t: 'Sun înapoi la numărul care m-a sunat', why: 'Asta ajunge din nou la escroc. Sună-l pe Tom la numărul pe care îl ai deja pentru el.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Dacă un apel este despre contul tău bancar, poți suna la <strong>159</strong> ca să ajungi în siguranță la propria bancă. <strong>Deschide aplicația Telefon</strong> ca să exersezi.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Formează 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Atinge butonul verde de apelare.</strong> <em>(Doar pentru exersare: nu se formează niciun număr.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">„Bun venit la 159. Spune numele băncii tale și te vom conecta.”</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Bravo!</strong> 159 te conectează la banca ta reală. Stabilește o frază secretă cu familia față în față și nu o posta niciodată online.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Bună' : 'Salut'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Glisează în sus pentru a deschide' : 'Începeți'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Telefonul tău nou este scos din cutie și pornit. Ține <strong>telefonul vechi</strong> în apropiere, încărcat și conectat la Wi-Fi. <strong>Atinge ${p === 'ios' ? 'Glisează în sus pentru a deschide' : 'Începeți'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Pornire rapidă' : 'Copiază aplicațiile și datele', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Apropie vechiul iPhone de acesta ca să îl configurezi cu Contul tău Apple.' : 'Copiază aplicațiile, pozele, contactele și altele de pe telefonul vechi.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Continuă pe vechiul iPhone' : 'Folosește dispozitivul vechi'}</button>
            <button type="button" class="cp" data-tap="manual">Configurează manual în schimb</button>`}),
         target: 'use-old', say: 'Copierea de pe telefonul vechi te scutește să configurezi totul din nou. <strong>Atinge ' + (p === 'ios' ? 'Continuă pe vechiul iPhone' : 'Folosește dispozitivul vechi') + '.</strong>', hints: {manual: 'Poți, dar copierea este mult mai ușoară. Atinge celălalt buton.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">Pe telefonul tău <strong>vechi</strong> apare un mesaj. Îndreaptă camera lui spre acest model.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Telefonul vechi l-a scanat</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'Pe telefonul vechi, atinge Continuă, apoi ține-l deasupra acestui model ca să-l vadă camera. Aici, <strong>atinge Telefonul vechi l-a scanat</strong>.'},
        {screen: c => codeScreen(p, c, 'Introdu codul telefonului vechi', 'Asta copiază setările în siguranță.'), sequence: CODE_KEYS,
         say: `Scrie codul telefonului vechi. Pentru exersare, folosește <strong>${codeText}</strong>.`, hint: `Scrie codul de exersare ${codeText}.`},
        {screen: () => list(p, 'Transferă datele', [], {noBack: true, top: `<p class="cf">Alege ce să aduci:</p>
            <div class="cj ex"><span>Poze și videoclipuri</span>${tog(true)}</div><div class="cj ex"><span>Contacte și mesaje</span>${tog(true)}</div><div class="cj ex"><span>Aplicații</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Continuă</button>`}),
         target: 'transfer', say: 'Totul este bifat. <strong>Atinge Continuă.</strong> Ține ambele telefoane aproape unul de altul și conectate la încărcător.'},
        {screen: c => list(p, 'Se transferă…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Mai sunt aproximativ 25 de minute' : 'Transfer finalizat ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Transferul s-a terminat. Ce ar trebui să faci cu telefonul vechi?', options: [
            {t: 'Îl păstrez o săptămână ca să verific că nu lipsește nimic, apoi îl șterg corect înainte să-l vând sau să-l reciclez', ok: true, why: 'Da. Verifică mai întâi dacă pozele, WhatsApp și aplicațiile bancare funcționează pe telefonul nou. Lecția următoare arată cum să ștergi telefonul vechi.'},
            {t: 'Îl arunc imediat la gunoi', why: 'Încă are toate informațiile tale pe el! Verifică dacă telefonul nou are totul, apoi șterge corect telefonul vechi.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Telefonul tău nou are pozele, contactele și aplicațiile tale. Unele aplicații, precum cele bancare și WhatsApp, îți cer să te conectezi din nou; ține la îndemână datele tale.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Vinzi, dai sau reciclezi telefonul vechi? Fă acești pași în ordinea corectă, altfel următorul proprietar nu îl poate folosi. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Pasul 1: deconectează-te de la Contul tău Apple. <strong>Atinge numele tău</strong>.'},
            {screen: c => list(p, 'Cont Apple', [{label: 'Informații personale'}, {label: 'Conectare și securitate'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Deconectare', danger: true}], {back: 'Setări',
                overlay: c.ask ? dialog(p, 'Te deconectezi?', 'Parola este necesară pentru a dezactiva Find My. (Exersare: introdusă pentru tine.)', [['cancel', 'Anulează'], ['turn-off', 'Dezactivează']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Derulează până jos și <strong>atinge Deconectare</strong>.'},
            {screen: () => list(p, 'Cont Apple', [{label: 'Deconectare', danger: true}], {back: 'Setări', overlay: dialog(p, 'Te deconectezi?', 'Parola este necesară pentru a dezactiva Find My. (Exersare: introdusă pentru tine.)', [['cancel', 'Anulează'], ['turn-off', 'Dezactivează']])}),
             target: 'turn-off', say: 'Aceasta dezactivează <strong>Find My</strong>, care altfel ar bloca telefonul pe contul tău. <strong>Atinge Dezactivează.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Pasul 2: șterge-l. <strong>Atinge General.</strong>'},
            {screen: () => list(p, 'General', [{label: 'Despre'}, {label: 'Spațiu iPhone'}, {id: 'reset', label: 'Transferă sau resetează iPhone-ul'}], {back: 'Setări'}), target: 'reset', say: '<strong>Atinge Transferă sau resetează iPhone-ul</strong>, din partea de jos.'},
            {screen: c => list(p, 'Transferă sau resetează iPhone-ul', [{label: 'Resetează'}, {id: 'erase', label: 'Șterge tot conținutul și setările'}], {back: 'General',
                overlay: c.askErase ? dialog(p, 'Ștergi acest iPhone?', 'Toate pozele, mesajele și aplicațiile vor fi șterse.', [['cancel', 'Anulează'], ['confirm-erase', 'Șterge']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Atinge Șterge tot conținutul și setările.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Pasul 1: elimină Contul tău Google. <strong>Atinge Google</strong>. <em>(Pe un Samsung, elimină și contul Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Gestionează-ți Contul Google'}, {id: 'accounts', label: 'Conturi de pe acest dispozitiv', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Atinge Conturi de pe acest dispozitiv.</strong>'},
            {screen: c => list(p, 'Cont Google', [{label: 'margaret.smith@example.com'}, {label: 'Sincronizarea contului'}, {id: 'remove', label: 'Elimină contul', danger: true}], {overlay: c.ask ? dialog(p, 'Elimini contul?', 'Eliminarea lui șterge mesajele, contactele și datele lui de pe acest telefon.', [['cancel', 'Anulează'], ['confirm-remove', 'Elimină contul']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Fără acest pas, telefonul rămâne blocat pe contul tău după resetare. <strong>Atinge Elimină contul.</strong>'},
            {screen: () => list(p, 'Cont', [{label: 'Elimină contul', danger: true}], {overlay: dialog(p, 'Elimini contul?', 'Eliminarea lui șterge mesajele, contactele și datele lui de pe acest telefon.', [['cancel', 'Anulează'], ['confirm-remove', 'Elimină contul']])}),
             target: 'confirm-remove', say: '<strong>Atinge Elimină contul.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Pasul 2: șterge-l. <strong>Atinge Sistem</strong>, în partea de jos.'},
            {screen: () => list(p, 'Sistem', [{label: 'Limbi'}, {label: 'Actualizare software'}, {id: 'reset', label: 'Opțiuni de resetare'}]), target: 'reset', say: '<strong>Atinge Opțiuni de resetare.</strong>'},
            {screen: c => list(p, 'Opțiuni de resetare', [{label: 'Resetează Wi-Fi, rețeaua mobilă și Bluetooth'}, {id: 'erase', label: 'Șterge toate datele (revenire la setările din fabrică)'}], {overlay: c.askErase ? dialog(p, 'Ștergi toate datele?', 'Toate pozele, mesajele și aplicațiile vor fi șterse.', [['cancel', 'Anulează'], ['confirm-erase', 'Șterge toate datele']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Atinge Șterge toate datele (revenire la setările din fabrică).</strong>'},
        ]),
        {screen: () => list(p, 'Resetează', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Ștergi acest iPhone?' : 'Ștergi toate datele?', 'Toate pozele, mesajele și aplicațiile vor fi șterse.', [['cancel', 'Anulează'], ['confirm-erase', p === 'ios' ? 'Șterge' : 'Șterge toate datele']])}),
         target: 'confirm-erase', say: 'Fă asta doar după ce pozele tale sunt în siguranță pe telefonul nou sau au copie de rezervă. <strong>Atinge ' + (p === 'ios' ? 'Șterge' : 'Șterge toate datele') + '.</strong> <em>(Exersare: nu se șterge nimic.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Bună' : 'Salut'}</h3><p class="cf">Gata pentru următorul proprietar</p>${homeIndicator(p)}</div>`,
         question: {q: 'Un ultim lucru înainte să-l predai?', options: [
            {t: 'Scoate cartela SIM (și orice card de memorie)', ok: true, why: 'Da. Pe SIM se află numărul tău de telefon. Scoate-o cu micul instrument sau cu o agrafă de birou.'},
            {t: 'Nimic altceva', why: 'Scoate cartela SIM și orice card de memorie. Numărul tău este pe SIM.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Bună' : 'Salut'}</h3><p class="cf">Gata pentru următorul proprietar</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Bravo!</strong> Deconectează-te, șterge, scoate SIM-ul: în această ordine. Ecranul „Hello” înseamnă că este gata pentru altcineva.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Memento</strong><span>Sună-o pe Sarah</span><small>Azi la 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, ploaie mai târziu</span><small>Max. 14° · Min. 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} ascultă… ce vrei să spui?`}</p>${result}
            <div class="wh">${[['say-remind', '„Amintește-mi să o sun pe Sarah la 3”'], ['say-weather', '„Cum e vremea azi?”'], ['say-joke', '„Comandă-mi o pizza”']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Butonul lateral (ține apăsat)' : 'Butonul de pornire (ține apăsat)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> face lucruri când îi ceri cu voce tare. <strong>Ține apăsat butonul lateral</strong> (din dreapta) până apare Siri. Poți și să spui pur și simplu „Siri” sau „Hey Siri”.'
                          : 'Telefonul poate face lucruri când îi ceri cu voce tare. <strong>Ține apăsat butonul de pornire</strong> (din dreapta) până apare asistentul. Poți și să spui „Hey Google”.',
         hint: 'Ține degetul (sau butonul mouse-ului) apăsat pe butonul de pe marginea dreaptă.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Pe un telefon real ai vorbi pur și simplu. Aici, <strong>atinge „Amintește-mi să o sun pe Sarah la 3”</strong>.', hints: {'say-joke': 'Încearcă mai întâi memento-ul.', 'say-weather': 'Încearcă mai întâi memento-ul.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Gata: la ora 3 apare un memento. Acum <strong>întreabă despre vreme</strong>.', hints: {'say-remind': 'Este setat. Acum întreabă despre vreme.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Pe care dintre acestea le-ai putea cere telefonului?', options: [
            {t: 'Pe toate: „Sună-o pe Sarah”, „Setează un cronometru de 10 minute”, „Aprinde lanterna”, „Citește-mi mesajele”', ok: true, why: 'Da. E practic când ai mâinile ocupate, ochii obosiți sau scrisul e greu.'},
            {t: 'Doar vremea', why: 'Poate face multe: apeluri, cronometre, lanterna, citit mesaje, alarme și altele.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Bravo!</strong> Vorbește clar și natural, ca și cum ai vorbi cu o persoană. Dacă nu te înțelege, întreabă din nou.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Text'], ['lens-translate', 'Traduce'], ['lens-search', 'Caută']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Meniu' : 'Carte'}</strong><span>${ctx.translated ? 'Supă de pește' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Pui cu ciuperci' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Tartă cu mere' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Vaccinul tău antigripal este scadent.</span><span>Pentru programare, sună la ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Text live' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Camera ta poate citi ce e scris. Hai să copiem un număr de telefon dintr-o scrisoare. <strong>Deschide Camera.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Îndreapt-o spre scrisoare. Când observă text, apare un mic <strong>buton de text ⟦scan-text⟧</strong>. <strong>Atinge-l.</strong>' : 'Îndreapt-o spre scrisoare și <strong>atinge butonul Lens ◎</strong>.',
         hints: {shutter: 'Asta face o poză obișnuită. Atinge ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'butonul Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Textul scris este acum text real. <strong>Atinge numărul de telefon.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Atinge Copiază</strong>, gata să-l lipești într-un mesaj sau în contactele tale. <em>(Apelează l-ar apela imediat.)</em>', hints: {'call-num': 'Asta ar apela numărul. Pentru acest exercițiu, atinge Copiază.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'În vacanță? Acum e îndreptată spre un meniu în franceză. ' + (p === 'ios' ? 'Aplicația Traducere sau Lens din aplicația Google pot face asta. ' : '') + '<strong>Atinge Traduce.</strong>', hints: {'lens-text': 'Asta copiază textul în franceză. Atinge Traduce.', 'lens-search': 'Atinge Traduce.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Ce altceva mai poate face camera în felul acesta?', options: [
            {t: 'Să recunoască plante și păsări și să scaneze scrisori într-un PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'În aplicația Note, atinge agrafa, apoi Scanează documente, ca să transformi scrisorile într-un PDF.' : 'În Google Drive, atinge + apoi Scanează, ca să transformi scrisorile într-un PDF.')},
            {t: 'Doar să facă poze', why: 'Face mult mai mult: recunoaște plante, traduce, copiază text și scanează scrisori în PDF-uri.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Bravo!</strong> Ai copiat un număr și ai tradus un meniu cu camera. ' + (p === 'ios' ? 'Textul live funcționează și pe pozele pe care le-ai făcut deja.' : 'Google Lens funcționează și pe pozele pe care le-ai făcut deja.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Cărți electronice de la bibliotecă', `<p class="cf">Conectat cu cardul de bibliotecă</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">Cărți electronice</button><button type="button" data-tap="tab-audio" class="on">Cărți audio</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'De returnat în 21 de zile' : '3 din 5 exemplare disponibile'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Bibliotecă', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'Cu un card de bibliotecă gratuit, poți împrumuta cărți electronice și audio pe telefon. East Riding Libraries folosesc aplicația <strong>BorrowBox</strong>. Aceasta este o versiune de exersare. <strong>Deschide-o.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Ești conectat cu cardul de bibliotecă. <strong>Atinge The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Împrumutul este gratuit. <strong>Atinge Împrumută.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Este al tău timp de 21 de zile. <strong>Atinge Ascultă.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Atinge butonul de redare ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Asculți în pat? Un <strong>temporizator de somn</strong> îl oprește după un timp, ca să nu îți pierzi locul. <strong>Atinge Temporizator de somn.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Ce se întâmplă când se termină cele 21 de zile?', options: [
            {t: 'Se returnează singură. Fără amenzi, și poți prelungi dacă nu ai terminat', ok: true, why: 'Da. Cărțile electronice și cele audio se returnează automat.'},
            {t: 'Primești o amendă', why: 'Nu există amenzi. Se returnează singură și o poți prelungi dacă nu ai terminat.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Bravo!</strong> Ca să începi pe bune, înscrie-te la eastridinglibraries.co.uk sau la orice bibliotecă, apoi descarcă BorrowBox și conectează-te cu cardul tău.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>Plătește prin aplicație: locația <b>4471</b></span></div>
                <p class="cf">Introdu numărul locației de pe indicator</p>${field('parkcode', 'Numărul locației', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Găsește parcarea</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Plătește 3,20 £' : 'Alege durata'}</button>`, {color});
        }
        return app(p, 'Parcare', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Multe parcări îți permit să plătești prin aplicație, așa că nu ai nevoie de monede. Fiecare consiliu folosește aplicații diferite (indicatorul îți spune care). Aceasta este una de exersare. <strong>Deschide Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Scrie numărul locației de pe indicator: 4471.',
         say: 'Fiecare parcare are un <strong>număr de locație</strong> pe indicator. <strong>Scrie 4471</strong> în casetă și <strong>atinge Găsește parcarea</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Numărul de înmatriculare al mașinii tale este deja salvat. <strong>Alege 2 ore.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Există o mică taxă de serviciu pentru folosirea aplicației. <strong>Atinge Plătește 3,20 £.</strong> <em>(Exersare: nu se ia niciun ban.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Întârzii prin magazine. Ce poți face?', options: [
            {t: 'Ating Prelungește în aplicație ca să adaug mai mult timp, fără să mă întorc la mașină', ok: true, why: 'Da. Acesta este marele avantaj al plății prin aplicație. Majoritatea îți amintesc și înainte să-ți expire timpul.'},
            {t: 'Nimic, voi primi o amendă', why: 'Majoritatea aplicațiilor de parcare te lasă să atingi Prelungește ca să adaugi timp de oriunde te afli.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Bravo!</strong> Majoritatea automatelor acceptă în continuare carduri sau monede, iar multe aplicații te lasă să plătești și sunând la un număr sau trimițând un SMS. Nu plăti niciodată printr-un autocolant cu cod QR de pe un automat: poate fi fals.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Nu mai ești în contract din 3 martie 2026. Poți schimba operatorul fără costuri. Prețul tău lunar este 24,00 £. Pentru a schimba și a-ți păstra numărul, trimite PAC prin SMS la 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Mesaj text', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Mai ești în contract sau plătești prea mult? Un SMS gratuit îți spune. <strong>Deschide Mesaje.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Scrie INFO în caseta de mesaj, apoi atinge trimite.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Am început un mesaj nou către <strong>85075</strong>. <strong>Scrie INFO</strong> și <strong>atinge trimite</strong>. Este gratuit pe orice rețea din Marea Britanie.'},
        {screen: c => smsTo(p, c), question: {q: 'Răspunsul spune că nu mai ești în contract și plătești în continuare 24 £ pe lună. Ce înseamnă asta?', options: [
            {t: 'Telefonul tău este plătit. Un abonament doar cu SIM ar putea costa mult mai puțin, și îți poți păstra numărul', ok: true, why: 'Da. Trimite PAC prin SMS la 65075 ca să primești un cod pentru a schimba operatorul și a-ți păstra numărul. Noul tău furnizor face restul.'},
            {t: 'Nimic, continui să plătesc', why: 'Poate plătești pentru un telefon pe care l-ai plătit deja. Un abonament doar cu SIM te-ar putea face să economisești mult.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Încă o economie, pentru călătorii în străinătate: dezactivează roamingul de date ca să nu te taxeze prin surprindere. <strong>Atinge Configurări.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Atinge Serviciu mobil.</strong>'},
            {screen: () => list(p, 'Serviciu mobil', [{label: 'Date mobile', toggle: true}, {id: 'options', label: 'Opțiuni date mobile', value: 'Roaming activat'}, {label: 'Hotspot personal'}], {back: 'Setări'}), target: 'options', say: '<strong>Atinge Opțiuni date mobile.</strong>'},
            {screen: c => list(p, 'Opțiuni date mobile', [{id: 'roam', label: 'Roaming de date', toggle: !c.roamOff}, {label: 'Voce și date', value: '5G Auto'}], {back: 'Serviciu mobil'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Dezactivează Roaming de date.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Atinge Rețea și internet.</strong>'},
            {screen: () => list(p, 'Rețea și internet', [{label: 'Internet', sub: 'Wi-Fi de acasă'}, {id: 'sims', label: 'SIM-uri', sub: 'Rețeaua ta'}, {label: 'Mod avion', toggle: false}]), target: 'sims', say: '<strong>Atinge SIM-uri.</strong>'},
            {screen: c => list(p, 'SIM-uri', [{label: 'Date mobile', toggle: true}, {id: 'roam', label: 'Roaming', toggle: !c.roamOff, sub: 'Conectează-te la serviciile de date în roaming'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Dezactivează Roaming.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Bravo!</strong> Poți folosi în continuare Wi-Fi în străinătate pentru WhatsApp, apeluri video și hărți. Reactivează roamingul dacă ai nevoie de date mobile și știi cât te taxează operatorul.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Partajarea locației permite familiei să vadă că ai ajuns cu bine acasă. Alegerea îți aparține și poți opri oricând. <strong>Deschide Find My.</strong>'},
        {screen: c => app(p, 'Persoane', `<p class="cf">Nimeni nu partajează încă.</p><button type="button" class="ce co" data-tap="share">Partajează locația mea</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Atinge Partajează locația mea.</strong>'},
        {screen: c => app(p, 'Partajează cu', '', {color: '#fff', overlay: sheet('Alege un contact', [['pick-sarah', 'Sarah', 'Fiica'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Atinge Sarah.</strong>', hints: {'pick-dave': 'Alege-o pe Sarah pentru acest exercițiu.'}},
        {screen: c => app(p, 'Partajează cu Sarah', '', {color: '#fff', overlay: sheet('Cât timp?', [['one-hour', 'Partajează o oră'], ['day', 'Partajează până la sfârșitul zilei'], ['always', 'Partajează fără limită']])}),
         target: 'always', say: 'Alege cât timp. Pentru familia în care ai încredere, <strong>atinge Partajează fără limită</strong>. Poți opri oricând.', hints: {'one-hour': 'E practic pentru o singură călătorie. Pentru acest exercițiu, alege Partajează fără limită.', day: 'Pentru acest exercițiu, alege Partajează fără limită.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Partajarea locației permite familiei să vadă că ai ajuns cu bine acasă. Alegerea îți aparține și poți opri oricând. <strong>Deschide Hărți.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Atinge poza ta de profil</strong> din dreapta sus.'},
        {screen: () => app(p, 'Hărți', '', {color: '#fff', overlay: sheet('', [['sharing', 'Partajarea locației'], ['timeline', 'Cronologia ta'], ['settings', 'Setări']])}), target: 'sharing', say: '<strong>Atinge Partajarea locației.</strong>'},
        {screen: () => app(p, 'Partajarea locației', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Atinge Partajare nouă.</strong>'},
        {screen: () => app(p, 'Partajează cu', '', {color: '#fff', overlay: sheet('Alege un contact', [['pick-sarah', 'Sarah', 'Fiica'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Atinge Sarah.</strong>', hints: {'pick-dave': 'Alege-o pe Sarah pentru acest exercițiu.'}},
        {screen: () => app(p, 'Partajează cu Sarah', '', {color: '#fff', overlay: sheet('Cât timp?', [['one-hour', 'Timp de 1 oră'], ['always', 'Până o dezactivezi']])}),
         target: 'always', say: 'Pentru familia în care ai încredere, <strong>atinge Până o dezactivezi</strong>.', hints: {'one-hour': 'Practic pentru o singură călătorie. Pentru acest exercițiu, alege Până o dezactivezi.'}},
    ]).concat([
        {screen: () => app(p, 'Partajezi cu Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah poate vedea unde ești. ${p === 'ios' ? 'Atinge Oprește partajarea' : 'Atinge Oprește'} oricând.</p>`, {color: '#fff'}),
         question: {q: 'Cineva pe care tocmai l-ai cunoscut online îți cere să-ți partajezi locația. Ar trebui?', options: [
            {t: 'Nu. Partajează doar cu familia apropiată sau cu prieteni în care ai încredere', ok: true, why: 'Exact. Locația ta arată unde locuiești și când nu ești acasă. Păstrează-o pentru oameni în care ai încredere.'},
            {t: 'Da, par drăguți', why: 'Partajează-ți locația doar cu familia apropiată și cu prietenii. Arată unde locuiești și când nu ești acasă.'}]}},
        {screen: () => app(p, 'Partajezi cu Sarah', '<p class="cf">Sarah poate vedea unde ești.</p>', {color: '#fff'}), done: true,
         say: '<strong>Bravo!</strong> Sarah vede că ești în siguranță. Verifică din când în când cu cine partajezi și oprește partajarea cu oricine nu are nevoie.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Nepotul tău Leo primește primul lui iPhone. <strong>Timpul de utilizare</strong> stabilește limite sănătoase. Acesta este telefonul lui <strong>Leo</strong>. <strong>Atinge Configurări.</strong>'},
        {screen: c => list(p, 'Setări', [{label: 'Leo', sub: 'Cont Apple'}, {label: 'Notificări'}, {id: 'screen-time', label: 'Timp de utilizare'}, {label: 'General'}], {noBack: true}), target: 'screen-time', say: '<strong>Atinge Timp de utilizare.</strong>'},
        {screen: c => list(p, 'Timp de utilizare', [{id: 'downtime', label: 'Timp de pauză', sub: c.downtime ? '20:00 – 07:00' : 'Dezactivat'}, {label: 'Limite pentru aplicații'}, {id: 'content', label: 'Restricții de conținut și confidențialitate', sub: c.content ? 'Activat' : 'Dezactivat'}, {label: 'Folosește codul pentru Timp de utilizare'}], {back: 'Setări'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Timp de pauză</strong> blochează majoritatea aplicațiilor noaptea (apelurile merg în continuare). <strong>Atinge Timp de pauză</strong> ca să-l activezi, de la 20:00 la 07:00.'},
        {screen: c => list(p, 'Timp de utilizare', [{label: 'Timp de pauză', sub: '20:00 – 07:00'}, {label: 'Limite pentru aplicații'}, {id: 'content', label: 'Restricții de conținut și confidențialitate', sub: c.content ? 'Activat' : 'Dezactivat'}], {back: 'Setări'}),
         target: 'content', action: c => { c.content = true; }, say: 'Apoi, oprește cumpărăturile-surpriză și conținutul pentru adulți. <strong>Atinge Restricții de conținut și confidențialitate.</strong>'},
        {screen: c => list(p, 'Conținut și confidențialitate', [{label: 'Restricții de conținut și confidențialitate', toggle: true}, {id: 'purchases', label: 'Achiziții din App Store', value: c.noBuy ? 'Nu permite' : 'Permite'}, {label: 'Conținut web', value: 'Limitează site-urile pentru adulți'}], {back: 'Timp de utilizare'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Site-urile pentru adulți sunt acum limitate. <strong>Atinge Achiziții din App Store</strong> ca să oprești cheltuielile din aplicații.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Nepotul tău Leo primește primul lui telefon Android. Aplicația gratuită <strong>Family Link</strong> de la Google stabilește limite sănătoase de pe <strong>telefonul tău</strong>. <strong>Deschide Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Atinge Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Controale'}, {id: 'screen-time', label: 'Timp petrecut pe ecran', sub: c.downtime ? 'Ora de culcare 20:00 – 07:00' : 'Fără limite'}, {id: 'content', label: 'Restricții de conținut', sub: c.noBuy ? 'Achizițiile au nevoie de aprobarea ta' : 'Google Play: permite tot'}, {label: 'Locație', sub: 'Activat'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Atinge Timp petrecut pe ecran</strong> ca să setezi ora de culcare, de la 20:00 la 07:00, când telefonul se blochează (apelurile merg în continuare).'},
        {screen: c => list(p, 'Leo', [{caption: 'Controale'}, {label: 'Timp petrecut pe ecran', sub: 'Ora de culcare 20:00 – 07:00'}, {id: 'content', label: 'Restricții de conținut', sub: c.noBuy ? 'Achizițiile au nevoie de aprobarea ta' : 'Google Play: permite tot'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Apoi, oprește cheltuielile-surpriză. <strong>Atinge Restricții de conținut</strong> ca achizițiile să aibă nevoie de aprobarea ta.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Timp de utilizare' : 'Leo', [{label: p === 'ios' ? 'Timp de pauză' : 'Timp petrecut pe ecran', sub: '20:00 – 07:00'}, {label: 'Achiziții', sub: p === 'ios' ? 'Nu permite' : 'Au nevoie de aprobarea ta'}]),
         question: {q: 'Ce contează cel mai mult, pe lângă setări?', options: [
            {t: 'Să vorbești cu ei: pot oricând să-ți spună dacă ceva de pe internet îi supără', ok: true, why: 'Da. Nicio setare nu prinde tot. Cel mai important este să fii cineva cu care pot vorbi.'},
            {t: 'Setările fac totul', why: 'Ajută mult, dar nimic nu prinde tot. Asigură-te că știu că pot oricând să vorbească cu tine.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Timp de utilizare' : 'Leo', [{label: 'Timp de pauză', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Bravo!</strong> Leo are o oră de culcare și nu poate cheltui bani fără să ceară voie. ' + (p === 'ios' ? 'Setează un cod pentru Timp de utilizare, ca doar tu să poți schimba acestea.' : 'Family Link îți permite să le schimbi oricând de pe propriul telefon.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Explorator de fișiere', mac: 'Finder', linux: 'Fișiere'},
        settings: {windows: 'Setări', mac: 'Setări de sistem', linux: 'Setări de sistem'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Manager de software'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Start', mac: 'Aplicații', linux: 'Meniu'},
        editor: {windows: 'Notepad', mac: 'TextEdit', linux: 'Editor de text'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Mail', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Manager de actualizări', terminal: 'Terminal', trash: 'Coș de gunoi', apps: 'Aplicații', chrome: 'Chrome', shield: 'Securitate Windows', fw: 'Firewall'}[kind]);

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
        windows: {title: 'Coș de reciclare', empty: 'Golește Coșul de reciclare', confirm: n => `Sigur vrei să ștergi definitiv aceste ${n} elemente?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Se oferea să te ajute la fiecare scrisoare pe care ai început-o vreodată. Pensionat în 2007.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Începător: 999 de secunde. Nu vorbim despre asta.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Câștigai un joc și cărțile veneau săltând pe ecran. Dă dublu clic pe mine!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Screeech… bong… kssshhh. Și nimeni nu putea folosi telefonul cât erai online.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Dealul verde și cerul albastru, pe milioane de ecrane din 2001.', ''],
            ['⟦save⟧', 'Floppy disk (A:)', '1,44 MB. Butonul Salvare încă arată ca unul.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', 'Pinball 3D, gratuit cu Windows până când Vista l-a luat.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'Cineva îți trimitea un nudge și tot ecranul tremura. Dă dublu clic pe mine!', 'shake'],
            ['⟦file-text⟧', 'Letter to council FINAL (2) (final).doc', 'Fiecare avem unul.', ''],
        ]},
        mac: {title: 'Coș de gunoi', empty: 'Golește coșul de gunoi', confirm: () => 'Sigur vrei să ștergi definitiv elementele din Coșul de gunoi? Nu poți anula această acțiune.', items: [
            ['⟦rainbow⟧', 'Spinning beach ball', 'Roata colorată care însemna „te rog așteaptă”… și iar așteaptă. Dă dublu clic pe mine!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Transparent, în formă de ou și albastru. Fiecare școală avea unul.', ''],
            ['⟦music⟧', 'iPod cu roată click', '1.000 de melodii în buzunar. Roată după roată, cu degetul mare.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Micul calculator zâmbitor care te întâmpina la fiecare pornire.', ''],
            ['⟦bell⟧', 'Sunetul de pornire', 'Acordul acela mare când porneai calculatorul. Multora le e încă dor de el.', ''],
            ['⟦droplet⟧', 'Butoanele Aqua', 'Atât de lucioase și albastre, încât păreau bune de lins.', ''],
            ['⟦calendar-days⟧', 'Widgeturile Dashboard', 'Un calculator, vremea și un bilețel adeziv, pe un strat separat. Dispărute din 2019.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Locul unde ne scriam toate CD-urile și ne sincronizam iPod-urile.', ''],
        ]},
        linux: {title: 'Coș de gunoi', empty: 'Golește coșul de gunoi', confirm: () => 'Golești toate elementele din Coșul de gunoi? Toate elementele din Coșul de gunoi vor fi șterse definitiv.', items: [
            ['⟦bird⟧', 'Tux, pinguinul (de pluș)', 'Mascota Linux din 1996. Foarte drăgălaș de strâns în brațe.', ''],
            ['⟦eye⟧', 'xeyes', 'O pereche de ochi care urmăresc cursorul mouse-ului. Dă dublu clic pe mine!', 'eyes'],
            ['⟦app-window⟧', 'Ferestre legănate', 'Efectele vechi ale desktopului făceau ferestrele să se legene ca jeleul când le trăgeai. Dă dublu clic pe mine!', 'wobble'],
            ['⟦save⟧', 'Dischete de instalare 1–50', 'Primele versiuni de Linux puteau cere o cutie întreagă de dischete pentru instalare.', ''],
            ['⟦disc⟧', 'CD Ubuntu gratuit prin poștă', 'Puteai comanda gratuit un CD Linux și îți venea prin poștă.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Prevăzut în fiecare an din 1999 încoace. Poate acesta e anul?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'Fiecare versiune Linux Mint are un nume de femeie, ca Zena, Xia și Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'O glumă veche: spui „sudo” și calculatorul face ce i se spune.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Acest folder este gol.' : 'The ' + egg.title + ' este gol.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Dă dublu clic pe ceva ca să te uiți.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Nu' : 'Anulează'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Da' : 'Gol'}</button></div></div>` : '';
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
        ['Deal ondulat', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['Dungi fine', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Cer de noapte', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['La malul mării', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Cel mai faimos joc de cuvinte cu Wi-Fi dintre toate.'],
        ['The LAN Before Time', 'LAN înseamnă „rețea locală”. Aceasta este foarte, foarte veche.'],
        ['Abraham Linksys', 'Acum patruzeci și șapte de megabiți…'],
        ['Bill Wi the Science Fi', 'Știința e grozavă!'],
        ['Drop It Like It\'s Hotspot', 'Hotspotul de pe telefonul cuiva, cu simțul umorului.'],
        ['Silence of the LANs', 'O rețea foarte, foarte liniștită.'],
        ['Tell My Wi-Fi Love Her', 'Aww.'],
        ['Get Off My LAN', 'Probabil un vecin morocănos.'],
        ['Bridlington Seagulls', 'Ți-au luat deja cartofii prăjiți. Nu le da și parola.'],
        ['FREE WIFI (honest)', 'O rețea numită „free Wi-Fi” pe care nu o recunoști este exact genul la care să nu te conectezi!'],
    ];

    const FORTUNES = ['Azi e o zi bună să faci copie de rezervă pozelor.', 'O parolă puternică este o parolă fericită.', 'Vei primi un telefon. Va fi o înșelătorie. Închide.',
        'Ai încercat să-l oprești și să-l pornești din nou?', 'Cel mai bun moment pentru actualizare a fost ieri. Al doilea cel mai bun este acum.', 'O ceașcă de ceai rezolvă aproape orice. Calculatoarele nu, însă.',
        'Nu da niciodată parola unui necunoscut. Sau unui pescăruș.', 'Vei găsi telecomanda. E între pernele canapelei.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">Adresă IP: 192.168.1.42<br>Router: 192.168.1.1<br>Semnal: −54 dBm (foarte bun)<br>Canal: 36 (5 GHz)<br>Viteză: 866 Mbps<br>Securitate: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi este dezactivat. Activează-l ca să vezi rețelele.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Fără internet</strong><br>Încearcă să-ți verifici Wi-Fi-ul. Apasă <kbd>Spațiu</kbd> sau atinge pentru a juca.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>JOC TERMINAT · apasă Spațiu pentru a juca din nou</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Ai mugit azi?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Încearcă: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Muu!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Ai scris „sl” în loc de „ls”? Poftim un tren cu aburi.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (practice) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: de la micul dejun \\___________/ Memory: nu uită nicio zi de naștere`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Bine. 🥪');
        else if (lc === 'make me a sandwich') say('Ce? Fă-l singur.');
        else if (/rm\s+-rf/.test(lc)) say('Frumoasă încercare! Acest terminal de exersare nu te lasă să strici nimic.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: comandă negăsită (încearcă „help”)`);
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
        else if (note) note.textContent = 'Acest browser de exersare nu caută pe internetul real. Nimic din ce scrii nu este trimis nicăieri.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Păcăleală de 1 aprilie! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Cod de trișat activat! +30 de vieți 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Bun venit la Macintosh.</p></div><p>Cod de trișat activat! +30 de vieți 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Cod de trișat activat! +30 de vieți 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Celelalte ferestre au fost date la o parte.' : 'Aero Shake! (Nu erau alte ferestre de dat la o parte.)');
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
                funToast(screen, 'Wi-Fi este activat. Conectat la Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi este dezactivat.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Conectează-te doar la rețele pe care le cunoști.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Păcăleală de 1 aprilie! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Vizualizare'], ['', 'Sortează după'], ['refresh', 'Reîmprospătează'], ['', 'Nou'], ['wall', 'Personalizează']]
                : os === 'mac' ? [['', 'Folder nou'], ['', 'Obține informații'], ['wall', 'Schimbă imaginea de fundal…'], ['', 'Folosește grupuri']]
                : [['', 'Creează folder nou'], ['terminal', 'Deschide în Terminal'], ['wall', 'Schimbă fundalul desktopului']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Imagine de fundal: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (ediție de exersare)</small>
                <dl><dt>Cip</dt><dd>Bridlington Silicon B1</dd><dt>Memorie</dt><dd>Nu uită nicio zi de naștere</dd><dt>Disc de pornire</dt><dd>Practice HD</dd><dt>Număr de serie</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notepad' : os === 'mac' ? 'TextEdit' : 'Editor de text';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Fără titlu – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Rd 1, Col 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Text simplu'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Bun venit! Acesta este un terminal de exersare. Scrie „help” ca să vezi ce poți încerca. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Meteo'], ['news', '⟦newspaper⟧', 'Știri'], ['bus', '⟦bus⟧', 'Orarul autobuzelor'], ['recipes', '⟦cake-slice⟧', 'Rețete']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Vremea în Bridlington</h3><p class="fd">Prognoză de exersare</p><div class="ajf">${[['Azi', '⟦cloud-sun⟧', '13°'], ['Vin', '⟦cloud-rain⟧', '11°'], ['Sâm', '⟦wind⟧', '10°'], ['Dum', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Activitatea pescărușilor: <strong>foarte mare</strong>. Păzește-ți cartofii prăjiți.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Știri de exersare</h3><ul class="news">
            <li><strong>Un localnic și-a găsit în sfârșit telecomanda</strong> între pernele canapelei, după trei săptămâni.</li>
            <li><strong>Pescăruș văzut cu un 99 Flake</strong>. Proprietarul înghețatei: „deloc amuzat”.</li>
            <li><strong>O bunică își învinge nepotul la apeluri video</strong>: „Am apăsat doar butonul verde.”</li>
            <li><strong>Un studiu arată</strong> că 9 din 10 probleme de calculator se rezolvă oprindu-l și pornindu-l din nou.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Orarul autobuzelor</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Tort Victoria</h3><p>Amestecă câte 200 g de unt, zahăr și făină cu agent de creștere cu 4 ouă. Coace în două forme la 180°C timp de 20–25 de minute. Umple cu gem și frișcă.</p><p class="fd">Sfat: setează un cronometru pe telefon sau cere-i: „Setează un cronometru de 25 de minute”.</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Filă nouă' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Caută sau scrie o adresă web'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Câine pe plajă.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Listă de cumpărături.txt'], ['⟦file-text⟧', 'Scrisoare către consiliu.docx'], ['⟦folder⟧', 'Rețete'], ['⟦file-spreadsheet⟧', 'Listă felicitări de Crăciun.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Factură impozit local.pdf'], ['⟦file-text⟧', 'Orar autobuze.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Fanfară de pe litoral.mp3'], ['⟦music⟧', 'Hituri din anii șaizeci.mp3']],
    };
    function funFiles(screen, os, folder = 'Imagini', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Coș de reciclare' : os === 'mac' ? 'Coș de gunoi' : 'Coș de gunoi'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Câine pe plajă.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Conectat la Home-WiFi-5G' : 'Wi-Fi este dezactivat.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Personalizare' : os === 'mac' ? 'Imagine de fundal' : 'Fundaluri'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Actualizare software' : 'Actualizări'}</h3><p class="mj">⟦check⟧ Ești la zi</p><p class="cf">Ultima verificare: azi, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Verifică actualizările</button><p class="zi"></p>`,
            about: `<h3>Despre</h3><div class="zk"><div><span>Nume dispozitiv</span><b>MARGARET-PRACTICE</b></div><div><span>Sistem</span><b>${os === 'windows' ? 'Windows 11 (de exersare)' : os === 'mac' ? 'macOS 27 (de exersare)' : 'Linux Mint 22.3 (de exersare)'}</b></div>
                <div><span>Procesor</span><b>Bridlington Silicon B1</b></div><div><span>Memorie</span><b>Nu uită nicio zi de naștere</b></div><div><span>Stocare</span><b>Destul pentru poze cu nepoții</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Personalizare' : os === 'mac' ? 'Imagine de fundal' : 'Fundaluri'], ['update', 'Actualizări'], ['about', 'Despre']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Practice Mines', 'Clasicul joc de căutat mine.'], ['solitaire', '⟦spade⟧', 'Solitaire', 'În curând în acest magazin de exersare.'], ['paint', '⟦paintbrush⟧', 'Paint', 'În curând în acest magazin de exersare.'], ['weather', '⟦cloud-sun⟧', 'Meteo', 'În curând în acest magazin de exersare.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Deschide' : (os === 'mac' ? 'Obține' : 'Instalează')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Practice Mines', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Fă clic ca să sapi. Clic dreapta (sau ține apăsat) ca să pui un steag.</p></div>`, 'bz'));
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
        ['Mama', 'Cum opresc chestia asta?', 'Bună, dragă, am scris acest e-mail, dar nu găsesc butonul de oprire. E cel rotund? Cu drag, Mama xx P.S. L-am apăsat. Nu s-a întâmplat nimic. E normal?'],
        ['Bridlington Walkers', 'Plimbarea de sâmbătă', 'Ne întâlnim la port la ora 10. Adu un termos și o haină impermeabilă. Incidentul cu pescărușul de săptămâna trecută nu va fi discutat.'],
        ['Prințul Abu (Foarte bogat)', 'URGENT: ai câștigat 4.000.000 £!!!', 'Dragă prietene iubit, sunt un prinț și am nevoie de datele tale bancare ca să-ți trimit patru milioane de lire. Te rog trimite și 50 £ pentru timbru. — Aceasta este o înșelătorie! Oamenii reali nu dau milioane prin e-mail. Șterge-l sau redirecționează-l la report@phishing.gov.uk.'],
        ['Sarah', 'Poze de duminică 🌻', 'Iată pozele din grădină. Câinele a mâncat încă o floarea-soarelui.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Mail', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Acesta este un calculator de exersare, deci nu poate fi oprit 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Descărcări', '⟦triangle-alert⟧ Programele „de curățare gratuite” sunt adesea inutile sau mai rău. Cel mai bine este să îl ștergi, nu să îl deschizi!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `„${n}” s-ar deschide aici pe un calculator real.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi este activat.' : 'Wi-Fi este dezactivat.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Se caută actualizări…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Nicio actualizare nouă. Totul este în ordine!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Acesta este doar de decor în magazinul de exersare.'); return true; }
            el.textContent = 'Se instalează…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Deschide'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Fără titlu 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Fișier Editare Vizualizare Inserare Format <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Stimată doamnă / Stimate domn, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Manager de actualizări', '<div class="ajz"><p class="mj">⟦check⟧ Sistemul tău este la zi</p><p class="cf">Linux Mint verifică singur actualizările și afișează un punct pe scut când există.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Scrie aici pentru a căuta</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Coș de reciclare', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Calculator', '⟦monitor⟧')}${icon('Acasă', '⟦house⟧')}${icon('Coș de gunoi', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Caută aplicații, setări și documente')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Caută')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Scrie pentru a căuta…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Filă nouă <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Caută sau scrie o adresă web</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Acesta este <strong>desktopul</strong>. Bara din partea de jos este <strong>bara de activități</strong>. Deschide browserul din meniul Start: <strong>fă clic pe Start</strong>, cele patru pătrate.'
            : os === 'mac' ? 'Acesta este <strong>desktopul</strong>. Rândul de aplicații din partea de jos este <strong>Dock-ul</strong>, iar bara de sus este <strong>bara de meniu</strong>. <strong>Fă clic pe Aplicații</strong> (grila de pătrate) ca să vezi toate aplicațiile.'
            : 'Acesta este <strong>desktopul</strong> din Linux Mint. Bara din partea de jos este <strong>panoul</strong>. Aplicațiile tale sunt în Meniu: <strong>fă clic pe Meniu</strong>, în stânga jos.',
         hint: os === 'mac' ? 'Aplicații este în Dock, jos, lângă Finder.' : (os === 'windows' ? 'Start este cele patru pătrate albastre de pe bara de activități.' : 'Butonul Meniu este în extrema stângă a panoului de jos.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Fă clic pe ${N.browser[os]}</strong>, browserul web.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Fiecare fereastră are trei butoane colorate în <strong>stânga sus</strong>. Cel galben ascunde fereastra. <strong>Fă clic pe butonul galben.</strong>'
            : 'Fiecare fereastră are trei butoane în <strong>dreapta sus</strong>. Linia <strong>—</strong> ascunde fereastra (minimizare). <strong>Fă clic pe —.</strong>',
         hints: {'win-close': 'Asta o închide. Mai întâi, ascunde-o cu ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Asta o face să umple ecranul. Mai întâi, ascunde-o.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Este ascunsă, nu închisă. ${os === 'mac' ? 'punctul de sub pictograma ei din Dock' : 'line under its icon'} arată că este încă deschisă. <strong>Fă clic pe pictograma ${N.browser[os]}</strong> ca s-o aduci înapoi.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Acum fă-o să umple ecranul: <strong>fă clic pe butonul ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Pe un Mac, butonul roșu închide fereastra. Dar aplicația poate continua să ruleze. Cum o închizi complet?', options: [
                {t: 'Apăs ⟦command⟧ Cmd + Q sau aleg Ieșire din meniul aplicației, de sus', ok: true, why: 'Da. Un punct sub o aplicație din Dock înseamnă că încă rulează. ⟦command⟧ Cmd + Q o închide.'},
                {t: 'Fac clic de două ori pe butonul roșu', why: 'Butonul roșu închide doar ferestre. ⟦command⟧ Cmd + Q (sau meniul aplicației > Ieșire) închide aplicația.'}]}
            : {q: 'Unde este butonul de închidere al unei ferestre?', options: [
                {t: 'Dreapta sus: ⟦x⟧', ok: true, why: 'Da. Pe Windows și Linux Mint cele trei butoane sunt în dreapta sus. (Pe un Mac sunt în stânga sus, roșu, galben și verde.)'},
                {t: 'Stânga jos', why: 'Este în dreapta sus pe fiecare fereastră: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Bravo!</strong> Poți deschide, ascunde, aduce înapoi, mări și închide ferestre. Aceasta este cea mai mare parte din folosirea unui calculator.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Acasă' : 'Acasă'], ['desktop', 'Desktop'], ['documents', 'Documente'], ['downloads', 'Descărcări'], ['pictures', 'Imagini']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ Stick USB']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Documente'], ['pictures', '⟦folder⟧', 'Imagini'], ['downloads', '⟦folder⟧', 'Descărcări']],
            downloads: [['photo', '⟦image⟧', 'Poză de vacanță.jpg'], ['bill', '⟦file-text⟧', 'Factură impozit local.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Poză de vacanță.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Vacanțe')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Scrisoare către consiliu.docx'], ['recipes', '⟦folder⟧', 'Rețete']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Documente']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Folder nou', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Acasă' : 'Acasă', downloads: 'Descărcări', pictures: 'Imagini', documents: 'Documente', usb: 'Stick USB', desktop: 'Desktop'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Acest folder este gol</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Copiază' : 'Copiază';
    const pasteLabel = os => os === 'mac' ? 'Lipește elementul' : 'Lipește';
    const newFolderLabel = os => os === 'mac' ? 'Folder nou' : os === 'windows' ? 'Nou > Folder' : 'Creează folder nou';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Pozele și scrisorile tale sunt păstrate în <strong>foldere</strong>. <strong>Fă clic pe ${N.files[os]}</strong> ca să te uiți la ele.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'în stânga Dock-ului' : 'pe ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'În lateral sunt folderele tale principale. Lucrurile pe care le descarci din e-mailuri și de pe site-uri ajung în <strong>Descărcări</strong>. <strong>Fă clic pe Descărcări.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Deschide'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Redenumește'], ['menu-delete', os === 'mac' ? 'Mută în coșul de gunoi' : 'Șterge']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Hai să copiem poza de vacanță în Imagini, unde îi este locul. <strong>Clic dreapta</strong> pe <strong>Poză de vacanță.jpg</strong>: apasă butonul <strong>din dreapta</strong> al mouse-ului. <em>' + (os === 'mac' ? 'Pe un trackpad, fă clic cu două degete.' : 'Pe un ecran tactil, ține apăsat.') + '</em>',
         hint: 'Folosește butonul din dreapta al mouse-ului pe poză.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Apare un meniu. <strong>Fă clic pe ${copyLabel(os)}.</strong> <em>(Scurtătura este ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Nu pe acela! Fă clic pe Copiază.', 'menu-open': 'Asta deschide poza. Fă clic pe Copiază.', 'menu-rename': 'Fă clic pe Copiază.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Fă clic pe Imagini</strong> din stânga.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Imagini este gol. <strong>Fă clic dreapta pe spațiul alb gol.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Fă clic pe ${pasteLabel(os)}.</strong> <em>(Sau ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Vom face un folder în continuare. Mai întâi, fă clic pe ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Poza este acum și în Imagini. Acum fă un folder ca să ții împreună pozele de vacanță. <strong>Fă din nou clic dreapta pe spațiul gol.</strong>', hints: {'rc-photo2': 'Fă clic dreapta pe spațiul gol, nu pe poză.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Fă clic pe ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Scrie mai întâi un nume pentru folder, de exemplu Vacanțe.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Scrie un nume</strong>, de exemplu <strong>Vacanțe</strong>, apoi <strong>fă clic pe OK</strong> (sau apasă Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Unde ajung de obicei fișierele din e-mailuri și de pe site-uri?', options: [
            {t: 'În folderul Descărcări', ok: true, why: 'Da. Dacă nu găsești ceva ce ai descărcat, caută mai întâi în Descărcări.'},
            {t: 'Pe desktop', why: 'De obicei în Descărcări. Caută mai întâi acolo dacă nu găsești ceva.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Bravo!</strong> Clicul dreapta este secretul pentru multe lucruri: copiere, lipire, redenumire și folder nou sunt toate în acel meniu.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Introdu parola rețelei</p>${field('wifipass', 'Parolă', ctx)}<button type="button" class="ce co" data-tap="connect">Conectează</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Rețele Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Conectat la Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Ca să te conectezi la Wi-Fi, <strong>fă clic pe simbolul Wi-Fi</strong> ${os === 'mac' ? 'din dreapta sus a ecranului' : 'din dreapta jos, lângă ceas'}.`, hint: os === 'mac' ? 'Este în bara de meniu, în dreapta sus.' : 'Este lângă ceas, în dreapta jos.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Numele rețelei tale este pe autocolantul de pe router. Cea de exersare este <strong>Home-WiFi-5G</strong>. <strong>Fă clic pe ea.</strong>', hints: {'net-neighbour': 'Aceea este a vecinului tău! Alege Home-WiFi-5G.', 'net-cafe': 'Aceea nu este rețeaua ta de acasă. Alege Home-WiFi-5G.', 'tray-wifi': 'Lista rețelelor Wi-Fi este deja deschisă. Fă clic pe Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Scrie parola exact: Green-Apple-42 (G și A mari).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Scrie parola de pe autocolant <strong>exact</strong>: <strong>Green-Apple-42</strong>. Apoi <strong>fă clic pe Conectează</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Panoul Wi-Fi este deja deschis. Scrie parola în casetă, apoi fă clic pe Conectează.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Ești într-o cafenea cu Wi-Fi gratuit. E în regulă pentru banca online?', options: [
            {t: 'Mai bine aștept să ajung acasă sau folosesc datele mobile ale telefonului', ok: true, why: 'Da. Wi-Fi-ul gratuit e în regulă pentru navigat, dar pentru bancă folosește Wi-Fi-ul de acasă sau datele mobile.'},
            {t: 'Da, orice Wi-Fi e în regulă', why: 'Wi-Fi-ul public gratuit e în regulă pentru navigat, dar lasă banca pentru acasă sau pentru datele mobile.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Bravo!</strong> Calculatorul va ține minte parola și se va conecta singur data viitoare.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Listă de cumpărături: lapte, pâine, ouă, pliculețe de ceai, felicitare de ziua lui Jean';
        const note = pcWin(os, `Listă de cumpărături – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'E-mail nou către Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Fă clic aici ca să scrii…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Mail' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Scurtăturile de la tastatură te scutesc de multe clicuri. <strong>${CMDL(os)}</strong> este tasta ${os === 'mac' ? 'de o parte și de alta a barei de spațiu, marcată cu ⟦command⟧' : 'în stânga jos a tastaturii'}. Ca să selectezi tot textul, ține apăsat <strong>${CMDL(os)}</strong> și apasă <strong>A</strong>. <em>Folosește tastatura ta reală sau butoanele de pe ecran.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Este evidențiat. Acum copiază-l: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Copiat! <strong>Fă clic în interiorul e-mailului</strong> către Sarah, acolo unde scrie „Fă clic aici ca să scrii”.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Acum lipește: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Hopa, ai șters ceva din greșeală. Ce scurtătură anulează asta?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Da. ${CMDL(os)} + Z anulează ultimul lucru pe care l-ai făcut, în aproape orice aplicație. Apasă-o din nou ca să anulezi mai mult.`},
            {t: 'Escape', why: `Escape închide meniurile. ${CMDL(os)} + Z este anulare.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Cum faci o captură de ecran (o poză a ecranului)?', options: [
            {t: os === 'windows' ? 'Tasta Windows + Shift + S, apoi trage peste ce vrei' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, apoi trage peste ce vrei' : 'Apăs tasta Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Da. Este copiată, iar o notificare te lasă s-o salvezi. Funcționează și tasta Print Screen.' : os === 'mac' ? 'Da. Poza este salvată pe desktop. Shift + ⟦command⟧ Cmd + 3 captează tot ecranul.' : 'Da. Linux Mint o salvează în folderul Imagini. Shift + Print Screen îți permite să alegi o zonă.'},
            {t: 'Fac o poză a ecranului cu telefonul', why: 'Merge, dar o captură de ecran este mult mai clară. ' + (os === 'windows' ? 'Tasta Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Apasă Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Bravo!</strong> Cele patru mari: <strong>${CMDL(os)} + C</strong> copiere, <strong>V</strong> lipire, <strong>Z</strong> anulare, <strong>A</strong> selectare totală. Funcționează în aproape orice aplicație.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Gratuit', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Gratuit · Achiziții în aplicație', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Caută aplicații</span></button><div class="hp"><span>RECOMANDAT</span><strong>Aplicații pentru noul tău calculator</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Deschide' : (os === 'mac' ? 'Obține' : 'Instalează')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Se instalează LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Magazin de exersare: numele și prețurile sunt exemple.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Cel mai sigur loc de unde iei aplicații este magazinul încorporat: <strong>${N.store[os]}</strong>. <strong>Fă clic pe el.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Vrei ceva cu care să scrii scrisori, ca Word. <strong>Fă clic pe caseta de căutare.</strong> Vom căuta „office”.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> este o alternativă gratuită la Microsoft Office, făcută de <strong>The Document Foundation</strong>. Verifică cine l-a făcut, apoi <strong>fă clic ' + (os === 'mac' ? 'Obține' : 'Instalează') + ' lângă LibreOffice</strong>.',
         hints: {'get-fake1': 'Aceasta este o reclamă și costă 29,99 £ pe an. LibreOffice este gratuit.', 'get-fake2': 'Aceasta este de la AppMakers și are achiziții în aplicație. Alege LibreOffice, de la The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'O fereastră pop-up de pe un site spune „Calculatorul tău e lent! Descarcă Speed Booster acum”. Ce faci?', options: [
            {t: 'O închid. Instalez aplicații doar din magazin sau de pe site-ul producătorului', ok: true, why: 'Exact. Ferestrele pop-up care oferă „acceleratoare” sau „curățătoare” sunt adesea inutile sau mai rău.'},
            {t: 'O descarc, poate ajută', why: 'Acestea sunt adesea inutile sau dăunătoare. Instalează doar din magazin sau de pe site-ul producătorului.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Bravo!</strong> LibreOffice este instalat. Verifică producătorul, ignoră reclamele și fii precaut cu aplicațiile „gratuite” care cer bani mai târziu.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Acasă'], ['system', 'Sistem'], ['bluetooth', 'Bluetooth și dispozitive'], ['network', 'Rețea și internet'], ['accounts', 'Conturi'], ['privacy', 'Confidențialitate și securitate'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Acasă</h3><p class="cf">Setări recomandate și contul tău.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Ești la zi</p>' : ctx.ready ? `<p class="cf">Este necesară repornirea pentru a termina instalarea actualizărilor.</p><button type="button" class="ce co bz" data-tap="restart">Repornește acum</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Se descarcă… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Setări', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'General'], ['privacy', 'Confidențialitate și securitate'], ['users', 'Utilizatori și grupuri']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Mac-ul tău este la zi</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Se descarcă… mai sunt aproximativ 10 minute' : 'Remedieri de securitate și erori'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Confidențialitate și securitate</h3><p class="cf"><strong>Securitate</strong><br>Permite aplicații de la:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store și dezvoltatori cunoscuți</button>`,
            };
            return pcWin(os, 'Setări de sistem', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Setări de sistem</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Manager de actualizări', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Sistemul tău este la zi</p>' : `<div class="ahf">${['Browser web Firefox', 'Nucleu Linux (securitate)', 'LibreOffice', 'Biblioteci de sistem'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Se instalează actualizările…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Autentificare necesară</strong></p><p class="fd">Introdu parola pentru a instala actualizările. (Exersare: introdusă pentru tine.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Anulează</button><button type="button" class="adg" data-tap="auth-ok">Autentifică</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Actualizările repară breșe de securitate pe care le folosesc escrocii. Hai să verificăm dacă există. <strong>Fă clic pe Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Fă clic pe Setări</strong> (rotița).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Fă clic pe Windows Update</strong>, în partea de jos a listei din stânga.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Așteaptă actualizări. <strong>Fă clic pe Descarcă și instalează tot.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Salvează mai întâi tot ce lucrezi, apoi <strong>fă clic pe Repornește acum</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Actualizările repară breșe de securitate pe care le folosesc escrocii. <strong>Fă clic pe meniul Apple</strong> (sigla) din stânga sus.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Fă clic pe Setări de sistem…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Ești în General. <strong>Fă clic pe Actualizare software.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'O actualizare este gata. Conectează încărcătorul, apoi <strong>fă clic pe Actualizează acum</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac-ul o descarcă, apoi repornește ca s-o instaleze.',
         question: {q: 'Actualizările automate sunt activate. Mai trebuie să faci ceva?', options: [
            {t: 'Doar repornesc când mi se cere și las calculatorul la încărcat peste noapte din când în când', ok: true, why: 'Da. Actualizările se instalează adesea peste noapte. Repornirea când ți se cere le termină.'},
            {t: 'Dezactivez actualizările automate', why: 'Păstrează-le activate: te protejează. Doar repornește când îți cere Mac-ul.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Actualizările repară breșe de securitate. În Linux Mint, <strong>scutul</strong> de lângă ceas arată un punct când așteaptă actualizări. <strong>Fă clic pe scut.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Manager de actualizări le listează pe toate. <strong>Fă clic pe Instalează actualizările.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux îți cere <strong>parola</strong> înainte să schimbe ceva important. Este un lucru bun. <strong>Fă clic pe Autentifică.</strong>', hints: {'auth-cancel': 'Asta anulează actualizările. Fă clic pe Autentifică.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Cât de des ar trebui să instalezi actualizările?', options: [
            {t: 'Ori de câte ori scutul arată un punct: durează doar un minut', ok: true, why: 'Da. Linux Mint are rar nevoie de repornire, cu excepția unor actualizări de securitate.'},
            {t: 'O dată pe an', why: 'Instalează-le ori de câte ori scutul arată un punct. Durează doar un minut.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Bravo!</strong> Calculatorul tău este la zi. Să-l ții actualizat este cel mai bun lucru pe care îl poți face pentru siguranța ta.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistem', 'Afișaj, sunet, despre'], ['tile-devices', '⟦printer⟧', 'Dispozitive', 'Bluetooth, imprimante'], ['tile-network', '⟦globe⟧', 'Rețea și internet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Conturi', 'Conturile tale'], ['tile-update', '⟦refresh-cw⟧', 'Actualizare și securitate', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ PC-ul tău este înscris în Actualizări de securitate extinse</p><p class="cf">Actualizări de securitate până pe 12 octombrie 2027.</p>' : `<div class="ahg"><strong>Asistența pentru Windows 10 s-a încheiat</strong><p>PC-ul tău nu îndeplinește cerințele pentru Windows 11. Înscrie-te în Actualizări de securitate extinse ca să primești în continuare actualizări de securitate.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Înscrie-te acum</button></div>`}`;
        else inner = `<h3>Actualizări de securitate extinse</h3><p class="cf">Alege cum te înscrii:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Fă copie de rezervă setărilor PC-ului</strong><small>Gratuit, cu un cont Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Folosește 1.000 de puncte Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Achiziție unică</strong><small>Cu plată</small></button>${ctx.busy ? '<p class="cf">Se face înscrierea…</p>' : ''}`;
        return pcWin('windows', 'Setări', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Dacă și calculatorul tău arată așa, cu Start în extrema stângă, poate fi <strong>Windows 10</strong>. Hai să verificăm. <strong>Fă clic pe Start.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Fă clic pe Setări</strong> (rotița).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Fă clic pe Sistem.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Scrie Windows 10 Home. Ce înseamnă asta în 2026?', options: [
            {t: 'Microsoft a oprit asistența normală în octombrie 2025. Încă funcționează, dar are nevoie de Actualizări de securitate extinse ca să rămână sigur', ok: true,
             why: 'Da. Programul gratuit de Actualizări de securitate extinse pentru utilizatorii casnici rulează acum până pe 12 octombrie 2027. După aceea, Windows 10 nu mai primește remedieri de securitate.'},
            {t: 'Nimic, Windows 10 va fi actualizat pentru totdeauna', why: 'Asistența normală s-a încheiat în octombrie 2025. Actualizările de securitate extinse rulează acum până pe 12 octombrie 2027, apoi se opresc.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Fă clic pe ← Acasă</strong> ca să te întorci.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Fă clic pe Actualizare și securitate.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Acest laptop este prea vechi pentru Windows 11, așa că Windows oferă <strong>Actualizări de securitate extinse</strong>. <strong>Fă clic pe Înscrie-te acum.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Varianta gratuită este să faci copie de rezervă setărilor într-un cont Microsoft. <strong>Fă clic pe Fă copie de rezervă setărilor PC-ului.</strong>', hints: {'esu-buy': 'Nu trebuie să plătești. Alege opțiunea gratuită de copie de rezervă.', 'esu-points': 'Merge dacă ai punctele, dar opțiunea cu copie de rezervă este gratuită pentru toată lumea.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Ce opțiuni ai înainte de octombrie 2027?', options: [
            {t: 'Trec la Windows 11 dacă se poate, cumpăr un calculator nou sau trec unul mai vechi la Linux Mint (gratuit)', ok: true, why: 'Da. Linux Mint este gratuit și merge bine pe laptopuri mai vechi. Lecțiile următoare arată unde sunt lucrurile pe un Mac și în Linux Mint.'},
            {t: 'Continui să folosesc Windows 10 după 2027 pentru bancă', why: 'După octombrie 2027 nu mai primește remedieri de securitate, deci nu este sigur pentru bancă. Fă upgrade, înlocuiește-l sau treci la Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Bravo!</strong> Știi ce Windows ai și cum să-l ții în siguranță până în octombrie 2027. Fii atent la apeluri sau ferestre pop-up care îți oferă să „faci upgrade” contra cost: sunt înșelătorii.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Treci de la Windows? Pe un Mac, aplicațiile stau în <strong>Dock</strong>, în partea de jos, iar meniurile fiecărei aplicații sunt în <strong>bara de meniu</strong> de sus. <strong>Fă clic pe Safari</strong>, browserul web, în Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Butoanele ferestrei sunt în <strong>stânga sus</strong> pe un Mac. <strong>Fă clic pe cel roșu</strong> ca să închizi fereastra.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Fereastra a dispărut, dar vezi <strong>punctul de sub Safari</strong> din Dock? Încă rulează. Ca să o închizi, <strong>fă clic dreapta pe Safari în Dock</strong> (două degete pe un trackpad).', hint: 'Fă clic dreapta (sau clic cu două degete) pe pictograma Safari din Dock.',
         hints: {'app-browser': 'Un clic normal o deschide din nou. Fă în schimb clic dreapta.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Fă clic pe Ieșire.</strong> <em>(Scurtătura este ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Setările se află în <strong>meniul Apple</strong> (sigla) din stânga sus. <strong>Fă clic pe el.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Aici sunt și Oprire și Repornire. <strong>Fă clic pe Setări de sistem…</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'Pe Windows copiezi cu Ctrl + C. Cum e pe un Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Da. Majoritatea scurtăturilor Windows folosesc ⟦command⟧ Cmd pe un Mac în loc de Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, la fel', why: 'Pe un Mac este ⟦command⟧ Cmd + C. Majoritatea scurtăturilor cu Ctrl devin ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Bravo!</strong> Dock jos, meniuri sus, butoanele ferestrei în stânga sus, ⟦command⟧ Cmd în loc de Ctrl și meniul Apple pentru setări și oprire.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> este un sistem gratuit care funcționează foarte asemănător cu Windows și merge bine pe calculatoare mai vechi. Aplicațiile tale sunt în <strong>Meniu</strong>, în stânga jos, ca butonul Start. <strong>Fă clic pe Meniu.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint vine cu aplicații gratuite deja instalate. Pentru scrisori, folosește <strong>LibreOffice Writer</strong>, care funcționează ca Microsoft Word. <strong>Fă clic pe el.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Fără titlu 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Fișier Editare Vizualizare Inserare Format <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Stimată doamnă / Stimate domn,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Poți deschide documentele Word pe care ți le trimit alții prin e-mail?', options: [
            {t: 'Da. LibreOffice deschide și salvează fișiere Word (.docx)', ok: true, why: 'Da. Când salvezi ceva pentru un utilizator Word, alege formatul Word (.docx) la Salvare ca.'},
            {t: 'Nu, ai nevoie de Windows pentru asta', why: 'LibreOffice deschide și salvează fișiere Word (.docx), așa că poți schimba documente cu utilizatorii de Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Fără titlu 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Stimată doamnă / Stimate domn,</div></div>', {max: true})}),
         target: 'win-close', say: 'Butoanele ferestrei sunt în dreapta sus, la fel ca în Windows. <strong>Fă clic pe ⟦x⟧</strong> ca să închizi Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Acum hai să vedem de unde iei mai multe aplicații. <strong>Fă din nou clic pe Meniu</strong>.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Manager de software</strong> este magazinul gratuit de aplicații al Linux Mint. <strong>Fă clic pe el.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Manager de software', `<div class="jo"><div class="gq">${ICON.search}<span>Caută</span></div>
            <div class="aan">${['Internet', 'Birou', 'Grafică', 'Sunet și video', 'Jocuri', 'Accesibilitate'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Mii de aplicații gratuite, verificate de Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Trebuie să cumperi antivirus pentru Linux Mint?', options: [
            {t: 'Nu. Ține-l actualizat, ia aplicații din Manager de software și ești bine protejat', ok: true, why: 'Nu. Linux are puțini viruși. Actualizările și firewall-ul încorporat își fac treaba. Înșelătoriile din e-mailuri și de pe site-uri rămân valabile, așa că rămâi atent.'},
            {t: 'Da, cel mai scump', why: 'Nu. Ține-l actualizat și ia aplicații din Manager de software. Fii atent la înșelătoriile prin e-mail și de pe site-uri, ca de obicei.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Bravo!</strong> Meniu jos în stânga, închidere sus în dreapta, LibreOffice pentru documente, Firefox pentru web, Manager de software pentru aplicații și scutul pentru actualizări.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ Stick USB conectat</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Înainte să schimbi calculatoarele, copiază-ți fișierele pe un <strong>stick USB</strong>. Introdu-l într-un port USB de pe lateralul calculatorului. Aici, <strong>fă clic pe Conectează stick-ul USB</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ Stick USB conectat</div>'}), target: 'app-files', say: `<strong>Deschide ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Deschide'], ['menu-copy', 'Copiază'], ['menu-rename', 'Redenumește']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Scrisorile tale sunt în <strong>Documente</strong>. <strong>Fă clic dreapta pe folderul Documente.</strong> <em>(Fă același lucru apoi și pentru Imagini.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Fă clic pe Copiază.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Stick-ul USB este în stânga. <strong>Fă clic pe Stick USB.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Este gol. <strong>Fă clic dreapta pe spațiul gol.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Fă clic pe ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Se copiază 214 elemente… mai este 1 minut' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Scoate']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Gata! Înainte să scoți stick-ul, <strong>scoate-l</strong> din sistem ca să nu se strice nimic. <strong>Fă clic dreapta pe Stick USB</strong> în stânga.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Fă clic pe Scoate.</strong> Apoi îl poți scoate în siguranță.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Un alt mod de a muta fișierele pe un calculator nou?', options: [
            {t: 'Stocare online: OneDrive, iCloud sau Google Drive', ok: true, why: 'Da. Încarcă de pe calculatorul vechi, conectează-te pe cel nou și ele sunt acolo. Un stick USB este și el o copie suplimentară bună.'},
            {t: 'Îmi trimit fiecare fișier prin e-mail, pe rând', why: 'Ar dura o veșnicie! Folosește un stick USB sau stocare online, precum OneDrive, iCloud sau Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Bravo!</strong> Pe calculatorul nou, conectează stick-ul, deschide-l și copiază folderele în Documente și Imagini.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Orar autobuze Bridlington ⟦star⟧ Rețete</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Neconectat</span><button type="button" data-tap="sync">Activează sincronizarea…</button><button type="button" data-tap="guest">Deschide profilul de invitat</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Conectează-te cu Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Exersare: introdusă pentru tine.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Următorul</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Activezi sincronizarea?</strong></p><p class="fd">Marcajele, parolele și istoricul tău vor fi salvate în Contul tău Google și vor apărea pe toate dispozitivele tale.</p><div class="jn"><button type="button" data-tap="cancel">Anulează</button><button type="button" class="adg" data-tap="yes-in">Da, sunt de acord</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Filă nouă</span>${profile}</div><div class="qn">⟦search⟧ Caută pe Google sau introdu o adresă URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Se sincronizează marcajele…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Dacă ai folosit <strong>Chrome</strong> pe calculatorul vechi, conectarea aduce marcajele și parolele salvate pe cel nou. (Firefox și Edge funcționează la fel.) <strong>Fă clic pe Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Fă clic pe pictograma de persoană</strong> din dreapta sus.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Fă clic pe Activează sincronizarea…</strong>', hints: {guest: 'Un profil de invitat nu salvează nimic. Fă clic pe Activează sincronizarea.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Conectează-te cu <strong>același cont Google</strong> pe care l-ai folosit pe calculatorul vechi. <strong>Fă clic pe Următorul.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Fă clic pe Da, sunt de acord.</strong>', hints: {cancel: 'Asta oprește sincronizarea. Fă clic pe Da, sunt de acord.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Marcajele tale au revenit. E sigur să salvezi parole în browser?', options: [
            {t: 'Da, dacă Contul tău Google are o parolă puternică și verificare în doi pași', ok: true, why: 'Da. Este mult mai sigur decât să refolosești aceeași parolă peste tot. Protejează contul în sine cu verificare în doi pași.'},
            {t: 'Nu, le scriu pe un bilețel lipit pe ecran', why: 'Un manager de parole din browser este mult mai sigur decât un bilețel pe ecran, atâta timp cât contul tău are verificare în doi pași.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Bravo!</strong> Marcajele și parolele te-au urmat. Pe un calculator public sau partajat, nu activa sincronizarea.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistem'} Alertă de securitate ⚠️</strong>
            <p>Calculatorul tău este INFECTAT cu 5 viruși! Datele tale bancare și pozele sunt în pericol.</p><p>Nu opri calculatorul. Sună acum asistența:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Sună acum</button><button type="button" data-tap="fake-close">Închide</button></div>
            <small>(Pagină de exersare cu înșelătorie. Numărul nu este real.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Părăsești site-ul?</strong></p><p class="fd">Modificările făcute s-ar putea să nu fie salvate.</p><div class="jn"><button type="button" data-tap="stay">Rămâi</button><button type="button" class="adg" data-tap="leave">Pleacă</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Aceasta ți-a umplut brusc ecranul în timp ce navigai. Este reală?', options: [
            {t: 'Nu. Este un site fals care încearcă să te sperie ca să suni la escroci', ok: true, why: 'Exact. Avertismentele reale nu afișează niciodată un număr de telefon la care să suni. Nu suna și nu da clic pe nimic de pe pagină.'},
            {t: 'Da, sun repede la număr', why: 'Nu suna niciodată. Este o pagină falsă. Oamenii de la „asistență” vor încerca să preia controlul calculatorului și al banilor tăi.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Ți-a umplut tot ecranul, așa că nu vezi cum să o închizi. Apasă tasta <strong>Esc</strong> (stânga sus pe tastatură) ca să ieși din ecranul complet.',
         hints: {'call-btn': 'Niciodată! Apasă tasta Esc.', 'fake-close': 'Butoanele de pe pagină pot fi capcane. Apasă în schimb tasta Esc de pe tastatură.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Acum vezi browserul. <strong>Închide fila</strong> cu ⟦x⟧.',
         hints: {'call-btn': 'Nu da clic pe nimic de pe pagină. Închide fila cu ⟦x⟧.', 'fake-close': 'Aceea face parte din pagina de înșelătorie. Folosește ⟦x⟧ de pe filă.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Încearcă să te țină acolo. <strong>Fă clic pe Pleacă.</strong>', hints: {stay: 'Fă clic pe Pleacă.'}},
        {screen: c => scareware(os, c), question: {q: 'Dar dacă nu se închide deloc?', options: [
            {t: os === 'windows' ? 'Apăs Ctrl + Shift + Esc ca să deschid Managerul de activități, aleg browserul și fac clic pe Încheie activitatea' : os === 'mac' ? 'Apăs ⟦command⟧ Cmd + Option + Esc și forțez ieșirea din browser' : 'Fac clic dreapta pe browser în panou și aleg Închide sau repornesc calculatorul',
             ok: true, why: 'Da. Când deschizi din nou browserul, nu-l lăsa să restaureze paginile vechi. Și repornirea calculatorului funcționează.'},
            {t: 'Sun la număr ca să primesc ajutor să-l închid', why: 'Nu suna niciodată la el. ' + (os === 'windows' ? 'Folosește Ctrl + Shift + Esc (Manager de activități) ca să închizi browserul.' : os === 'mac' ? 'Folosește ⟦command⟧ Cmd + Option + Esc pentru a forța ieșirea.' : 'Închide browserul din panou sau repornește.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Bravo!</strong> Calculatorul tău nu a fost niciodată infectat: era doar o pagină web. Dacă ai sunat la un număr ca acesta, contactează-ți banca și schimbă-ți parolele de pe alt dispozitiv.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Securitate Windows', `<div class="aif"><h3>Protecție împotriva virușilor și amenințărilor</h3><p class="mj">⟦check⟧ Nicio amenințare curentă</p>
                <p class="cf">Ultima scanare: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Scanare rapidă în desfășurare… 12.840 de fișiere scanate</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Protecție antivirus</span><span>⟦check⟧ Firewall</span><span>⟦check⟧ Controlul aplicațiilor și al browserului</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Configurare firewall', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Firewall-ul este activat</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows are antivirus gratuit încorporat, numit <strong>Securitate Windows</strong>. Hai să verificăm dacă funcționează. <strong>Fă clic pe Start.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Fă clic pe Setări.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Fă clic pe Confidențialitate și securitate</strong> din stânga.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Fă clic pe Securitate Windows.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Bifele verzi înseamnă că ești protejat. Pentru liniștea ta, <strong>fă clic pe Scanare rapidă</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Trebuie să plătești și pentru alt antivirus?', options: [
            {t: 'Nu. Securitate Windows ajunge pentru majoritatea oamenilor, iar două pot încetini calculatorul', ok: true, why: 'Nu. Ține Windows actualizat și Securitate Windows activată. Cele cu plată adaugă adesea doar ferestre pop-up și abonamente.'},
            {t: 'Da, cu cât mai multe, cu atât mai bine', why: 'Două programe antivirus pot intra în conflict și pot încetini lucrurile. Securitate Windows ajunge pentru majoritatea oamenilor.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac-urile au protecție gratuită încorporată care verifică aplicațiile și fișierele în fundal. Hai să verificăm o setare. <strong>Fă clic pe meniul Apple</strong> (sigla).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Fă clic pe Setări de sistem…</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Fă clic pe Confidențialitate și securitate</strong> din stânga.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Este aleasă „Permite aplicații de la App Store și dezvoltatori cunoscuți”. Ar trebui s-o schimbi?', options: [
            {t: 'Nu, o las așa. Blochează aplicațiile de la producători necunoscuți', ok: true, why: 'Nu. Dacă un site îți spune să schimbi asta ca să instalezi ceva, este un semn mare de avertizare.'},
            {t: 'Da, permit aplicații de oriunde', why: 'Las-o așa cum e. Oprește aplicațiile de la producători necunoscuți. Un site care îți spune s-o schimbi este un semn de avertizare.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Setări de sistem', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Trebuie să cumperi antivirus pentru un Mac?', options: [
            {t: 'Majoritatea oamenilor nu. Ține-l actualizat și instalează aplicații doar din locuri de încredere', ok: true, why: 'Nu. Actualizările și protecția încorporată își fac treaba. Ferestrele pop-up care spun că Mac-ul tău este infectat sunt înșelătorii.'},
            {t: 'Da, de la orice pop-up care îl oferă', why: 'Ferestrele pop-up care oferă antivirus pentru Mac sunt de obicei înșelătorii. Ține în schimb Mac-ul actualizat.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint are un <strong>firewall</strong> încorporat, care blochează conexiunile nedorite. Este dezactivat până îl pornești. <strong>Fă clic pe Meniu.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Fă clic pe Firewall.</strong> <em>(Caută „firewall” în Meniu dacă nu-l vezi.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Fă clic pe comutatorul Stare</strong> ca să pornești firewall-ul.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Ce altceva mai protejează Linux Mint?', options: [
            {t: 'Instalarea actualizărilor când scutul arată un punct și luarea aplicațiilor din Manager de software', ok: true, why: 'Da. Și regulile obișnuite: fii atent la linkurile din e-mailuri și la ferestrele pop-up.'},
            {t: 'Nu mai este nevoie de nimic', why: 'Continuă să instalezi actualizările și ia aplicații din Manager de software. Înșelătoriile prin e-mail și de pe site-uri rămân valabile.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Bravo!</strong> Protecția încorporată a calculatorului tău este activată. Actualizările, atenția la linkuri și instalarea doar din locuri de încredere fac restul.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Parcel Delivery</strong><span>Ne-am ratat: reprogramează livrarea azi</span></button>
            <div class="lx"><strong>Sarah</strong><span>Poze de duminică</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Plimbarea de sâmbătă</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Parcel Delivery</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Am încercat să-ți livrăm pachetul azi, dar nu era nimeni acasă. Este necesară o taxă de 1,45 £ pentru a reprograma livrarea.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Reprogramează livrarea</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Raportează phishing</button><button type="button" data-tap="reply">Răspunde</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Mail', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Raportat și mutat în Nedorite</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Iată e-mailul tău, în browser. <strong>Deschide e-mailul Parcel Delivery.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Pe un calculator poți verifica unde duce de fapt un link <strong>fără să dai clic pe el</strong>. <strong>Mută mouse-ul peste „Reprogramează livrarea”</strong> și ține-l nemișcat. <em>(Pe un ecran tactil, ține apăsat pe el.)</em>',
         hints: {'click-link': 'Nu da clic! Doar ține cursorul deasupra lui.'}, hint: 'Ține cursorul mouse-ului deasupra linkului albastru, fără să dai clic.'},
        {screen: c => webmail(os, c), question: {q: 'Adresa reală apare în partea de jos: parcel-redelivery.example.top. Este sigură?', options: [
            {t: 'Nu. Nu este site-ul unei firme reale de livrări, iar cer o taxă', ok: true, why: 'Nu. Curierii nu cer taxe mici prin e-mail sau SMS. Adresa reală dă totul de gol.'},
            {t: 'Da, scrie „parcel” în ea', why: 'Oricine poate pune „parcel” într-o adresă web. Nu este un curier real, iar taxa este înșelătoria.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Fă clic pe Raportează phishing.</strong> Poți și să redirecționezi e-mailurile de înșelătorie la report@phishing.gov.uk.', hints: {reply: 'Nu răspunde niciodată escrocilor. Fă clic pe Raportează phishing.', 'click-link': 'Nu da clic pe link! Raportează-l în schimb.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Bravo!</strong> Ține cursorul deasupra înainte să dai clic: dacă adresa nu se potrivește cu firma, nu da clic.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (număr de exersare). Acesta este codul real pentru a găsi IMEI-ul telefonului tău.',
        '999': 'Acesta este un telefon de exersare, deci nu poate suna la 999. Într-o urgență reală, sună la 999 sau 112.',
        '112': 'Acesta este un telefon de exersare, deci nu poate suna la 112. 112 funcționează la fel ca 999 în Marea Britanie și în toată Europa.',
        '159': '159 te leagă în siguranță la propria ta bancă. Folosește-l dacă un apel despre banii tăi te îngrijorează.',
        '7726': '7726 este numărul la care redirecționezi SMS-urile de înșelătorie. Pe tastaturile vechi de telefon scrie „SPAM”!',
        '123': 'speaking-clock',
        '1471': 'Numărul de telefon 07700 900842 a sunat azi la 11:20. (Exersare. 1471 îți spune cine a sunat ultima oară pe telefonul tău fix.)',
        '01189998819991197253': 'Acesta este numărul de urgență din The IT Crowd. Ai încercat să-l oprești și să-l pornești din nou?',
        '101': '101 este numărul poliției pentru lucruri care nu sunt urgențe.',
        '111': '111 este ajutorul NHS când e urgent, dar nu e o urgență vitală.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Telefon', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Introdu un număr</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Mama', '#f472b6', [['them', 'Credeam că LOL înseamnă „lots of love”. L-am pus la toate!'], ['them', 'De-asta nu ți-a răspuns mătușa?'], ['them', 'Trimis de pe iPad-ul meu']]],
        ['Necunoscut', '#94a3b8', [['them', 'Felicitări! Ai câștigat un telefon GRATUIT. Fă clic aici pentru a-l revendica: prize-winner.example'], ['note', 'Aceasta este o înșelătorie. Nu atinge linkul: redirecționează-l la 7726, apoi șterge-l.']]],
        ['Sarah', '#a78bfa', [['them', 'Tata învață să folosească emoji-uri 😂'], ['them', 'Mi-a trimis o vânătă și a spus „pentru cina de diseară?” 🍆']]],
        ['Dentist', '#38bdf8', [['them', 'Memento: programarea ta este marți la 10:30. Răspunde Y pentru confirmare.']]],
    ];
    const MUM_REPLIES = ['Cine e?', 'Sună-mă, nu pot citi mesaje fără ochelari', 'Frumos! 👍', 'Ai primit ultimul meu mesaj? L-am trimis pisicii din greșeală.', 'Trimis de pe iPad-ul meu', 'OK, dragă xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Mesaje', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Pescărușul lovește din nou' : 'Poză', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Prins în flagrant pe faleza din Bridlington. Cartofii prăjiți nu au fost recuperați.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Fotografii', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Ceas', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Meteo', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Frig, cu ninsoare ușoară' : 'Perioade însorite, adiere de vânt'}</p>
            <div class="ajf">${[['Vin', '⟦cloud-rain⟧', '11°'], ['Sâm', '⟦wind⟧', '10°'], ['Dum', '⟦sun⟧', '14°'], ['Lun', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Avertisment pescăruși: <strong>ridicat</strong>. Păzește-ți cartofii prăjiți.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Prin dulap, apoi continuă să mergi pe lângă felinar.', home: 'Nu e ca acasă nicăieri. 🏠', 'luna': '238.855 de mile. Trafic redus.',
        chips: 'Cea mai apropiată prăjitorie de pește și cartofi: oriunde pe faleza din Bridlington. 🍟', 'north pole': 'Atelierul lui Moș Crăciun. Închis până în decembrie. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Un loc minunat!',
        'flamborough': 'Flamborough Head: far, stânci și pufini. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `„${inp.value.trim()}”: această hartă de exersare cunoaște doar câteva locuri. Încearcă Bridlington, Flamborough sau Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Setări', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Mod Avion' : 'Mod avion', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Mod întunecat', st.dark)}${row('dnd', 'Nu deranja', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Despre' : 'Despre telefon'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Despre' : 'Despre telefon', `<div class="aic"><div class="lq">
            <div class="ho"><span>Nume</span><b>Telefonul lui Margaret</b></div>
            <div class="ho"><span>Model</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Versiune iOS' : 'Versiune Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Stocare</span><b>Destul pentru poze cu nepoții</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Număr de serie</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Jocul clasic de pe telefoanele mobile vechi.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Conține reclame · Achiziții în aplicație'], ['knit', '⟦scissors⟧', 'Modele de tricotat', 'În curând în acest magazin de exersare.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Deschide' : (p === 'ios' ? 'Obține' : 'Instalează')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Scor: <b class="ado">0</b></span><span>Cel mai bun: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Atinge o direcție (sau folosește tastele săgeată) ca să începi</p>
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
                f.querySelector('.vy').textContent = `Joc terminat! Scor ${score}. Atinge o direcție ca să joci din nou.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Avion', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Nu deranja', st.dnd)}${t('torch', '⟦flashlight⟧', 'Lanternă', st.torch)}${t('dark', '⟦sun-moon⟧', 'Mod întunecat', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Glisează în sus ca să închizi' : 'Închide'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Imagine de fundal nouă');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `„La al treilea semnal sonor, ora va fi ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} și ${t.getSeconds()} secunde… bip, bip, bip.” (Vechiul ceas vorbitor!)`; return; }
                msg.textContent = egg || (n ? 'Acest telefon de exersare nu poate face apeluri reale. Încearcă 123, 1471 sau *#06#…' : 'Scrie mai întâi un număr.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Te rog trimite-ne datele tale bancare ca să-ți revendici premiul!!! (Este o înșelătorie. Blochează acest număr.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Mulțumim, programarea ta este confirmată. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Mail', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Start'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Oprește'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Start'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Cremă de soare pusă! E practic Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Lanternă pornită. (Ecranul luminează în loc de lumina din spate.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Mod avion activat: fără apeluri, SMS-uri sau date mobile.' : 'Mod avion dezactivat.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Imaginea de fundal a fost schimbată. Mergi acasă ca s-o vezi!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Acum ești dezvoltator! (Un secret real Android: atinge de 7 ori Număr build.)' : st.build >= 3 ? `Mai ești la ${7 - st.build} pași de a deveni dezvoltator.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Mulțumim că ai exersat!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Nu ai nevoie de o aplicație de lanternă: este încorporată în setările rapide ale telefonului. Aplicațiile gratuite de lanternă sunt adesea pline de reclame sau mai rău!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Doar de decor în magazinul de exersare.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Se instalează…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Deschide'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Aplicație', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Această aplicație de exersare face parte din propria ei lecție. Aruncă o privire prin cursurile de învățare ca s-o încerci cum trebuie.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Ai găsit un secret!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Apel încheiat' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Necunoscut' ? 'Apelant' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Necunoscut', number: '0161 496 0423', who: 'm', tag: 'Nu este în contactele tale',
         intro: 'Telefonul sună. Numărul nu este salvat în contactele tale. <strong>Răspunde</strong> ca să exersezi. <em>Ridică volumul ca să auzi apelantul.</em>',
         lines: [
            {text: 'Bună ziua, sunt Mark de la echipa antifraudă a băncii dumneavoastră. Am observat plăți suspecte în contul dumneavoastră. Înainte să continui, puteți confirma numele complet, data nașterii și numărul lung de pe cardul bancar?',
             q: 'Apelantul spune că este de la banca ta. Ce faci?', options: [
                {t: 'Dau datele, e de la bancă', why: 'O bancă care te sună nu îți va cere niciodată numărul complet al cardului. Așa își obțin escrocii datele.'},
                {t: 'Spun că sun eu înapoi banca la numărul de pe card și închid', ok: true, why: 'Exact. Sună la numărul de pe card, de pe alt telefon dacă poți, sau formează 159.'},
                {t: 'Îi cer să dovedească cine este', why: 'Escrocii sună convingător și adesea știu deja unele dintre datele tale. Cel mai sigur este să închizi și să-ți suni singur banca.'}]},
            {text: 'Vă rog să nu închideți! Infractorii vă iau bani din cont chiar acum. Trebuie să mutați totul într-un cont sigur pe care vi-l deschid eu. Trebuie să facem asta în următoarele zece minute.',
             q: 'Spune că e urgent și trebuie să-ți muți banii. Ce faci acum?', options: [
                {t: 'Mut banii repede, înainte să fie prea târziu', why: 'Nu există „cont sigur”. Banca ta nu îți va cere niciodată să muți bani. Aceasta este înșelătoria.'},
                {t: 'Închid. O bancă adevărată nu îți cere niciodată să muți bani într-un „cont sigur”', ok: true, why: 'Da. Graba și „contul sigur” dau totul de gol. Închide și formează 159.'}]}],
         hang: 'Închide cu butonul roșu.'},
        {letter: '?', color: '#64748b', name: 'Necunoscut', number: '020 7946 0815', who: 'robot', tag: 'Nu este în contactele tale',
         intro: 'Alt apel. <strong>Răspunde.</strong>',
         lines: [
            {text: 'Acesta este un mesaj automat de la H M R C. A fost emis un mandat de arestare pe numele dumneavoastră, pentru impozit neplătit. Pentru a vorbi cu un ofițer, apăsați 1 acum.',
             q: 'O voce înregistrată spune că vei fi arestat din cauza impozitelor. Ce faci?', options: [
                {t: 'Apăs 1 ca să rezolv', why: 'Apăsarea lui 1 te conectează la escroci, care vor cere plata, adesea în carduri cadou. HMRC nu amenință niciodată cu arestarea printr-un mesaj înregistrat.'},
                {t: 'Închid. HMRC nu sună cu amenințări de arestare', ok: true, why: 'Corect. HMRC îți scrie mai întâi și nu amenință niciodată cu arestarea la telefon.'}]}],
         hang: 'Închide.'},
        {letter: '?', color: '#64748b', name: 'Necunoscut', number: '0113 496 0332', who: 'm', tag: 'Nu este în contactele tale',
         intro: 'Telefonul din nou. <strong>Răspunde.</strong>',
         lines: [
            {text: 'Bună ziua, sun de la departamentul tehnic Windows. Calculatorul dumneavoastră ne-a trimis mesaje de eroare și are un virus foarte periculos. Vă rog să mergeți și să porniți calculatorul, iar eu vă voi ajuta să îl reparați.',
             q: 'Spune că ai un virus pe calculator. Ce faci?', options: [
                {t: 'Pornesc calculatorul și urmez instrucțiunile lui', why: 'Te-ar pune să instalezi un program care îi dă control asupra calculatorului, apoi ți-ar cere bani. Microsoft nu sună niciodată așa.'},
                {t: 'Închid. Firmele de calculatoare nu sună pentru viruși', ok: true, why: 'Exact. Nu lăsa niciodată un apelant să intre pe calculatorul tău.'},
                {t: 'Îi explic că nu am calculator', why: 'Nu trebuie să explici sau să te cerți. Doar închide.'}]}],
         hang: 'Închide.'},
        {letter: '?', color: '#64748b', name: 'Necunoscut', number: '0808 157 0190', who: 'f', tag: 'Nu este în contactele tale',
         intro: 'Alt apel. <strong>Răspunde.</strong>',
         lines: [
            {text: 'Bună ziua. O comandă pentru un iPhone nou, în valoare de nouă sute nouăzeci și nouă de lire, a fost plasată în contul dumneavoastră de cumpărături online. Dacă nu ați făcut această comandă, apăsați 1 pentru a o anula și a vorbi cu echipa noastră.',
             q: 'Nu ai comandat un iPhone. Ce faci?', options: [
                {t: 'Apăs 1 ca să anulez comanda', why: 'Apăsarea lui 1 te conectează la un escroc, care te va „rambursa” cerându-ți datele bancare sau controlul asupra calculatorului.'},
                {t: 'Închid, apoi îmi verific singur contul în aplicație sau pe site', ok: true, why: 'Da. Dacă ar exista cu adevărat o comandă, ai vedea-o în contul tău. Nu folosi niciodată un număr sau un buton pe care ți le dă un apelant.'}]}],
         hang: 'Închide.'},
        {letter: 'S', color: '#16a34a', name: 'Cabinet', number: '01632 960211', who: 'f', tag: 'Salvat în contactele tale',
         intro: 'Încă un apel: de data aceasta este cabinetul medicului, salvat în contactele tale. <strong>Răspunde.</strong>',
         lines: [
            {text: 'Bună ziua, sunt Sue de la cabinet. Doar o scurtă reamintire că vaccinul dumneavoastră antigripal este programat marți la ora zece. Nu trebuie să faceți nimic. Dacă doriți să îl schimbați, sunați-ne la numărul obișnuit. Pe curând!',
             q: 'Este acest apel o înșelătorie?', options: [
                {t: 'Da: închid și blochez numărul', why: 'Acesta e în regulă! Nu a cerut nimic, nu te-a grăbit și ți-a spus să folosești numărul obișnuit.'},
                {t: 'Probabil autentic: nu a cerut bani sau date și a spus să suni la numărul obișnuit', ok: true, why: 'Exact. Apelurile autentice nu te presează. Dacă ai vreodată dubii, sună înapoi la numărul pe care îl ai deja.'}]}],
         hang: 'Apelul s-a terminat. <strong>Atinge butonul roșu</strong> ca să închizi.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Apelul ${n + 1} din ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'În realitate e în regulă să nu răspunzi la numere pe care nu le cunoști! Pentru acest exercițiu, atinge butonul verde ca să răspunzi.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Care dintre acestea este un semn al unui apel de înșelătorie?', options: [
            {t: 'Să fii grăbit, amenințat sau să ți se spună să păstrezi secretul', ok: true, why: 'Da. Presiunea este cel mai mare indiciu. Un apelant autentic nu are nimic împotrivă să te lase să-ți iei timp și să suni înapoi.'},
            {t: 'Apelantul îți știe numele', why: 'Escrocii îți știu adesea numele și chiar unele detalii ale contului. Asta singură nu face un apel autentic.'},
            {t: 'Numărul pare local', why: 'Escrocii pot face să apară pe ecranul tău orice număr, chiar și unul local sau al băncii tale. Nu avea încredere în număr.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Bravo!</strong> Ai închis în fața a patru escroci și ai recunoscut apelul autentic. Ține minte: dacă ai dubii, închide și sună înapoi la un număr în care ai încredere. Pentru banca ta, formează 159.'},
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
            ios: ['iPhone', 'Făcut de Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola și altele'],
            windows: ['Windows', 'Majoritatea laptopurilor și calculatoarelor desktop'], mac: ['Mac', 'Făcut de Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu și altele'],
        };
        const notSure = isPC
            ? 'Uită-te la ecran. Windows are un buton Start (patru pătrățele) în partea de jos. Un Mac are o siglă Apple în stânga sus. Linux Mint are un buton Meniu în stânga jos.'
            : 'Un iPhone are o siglă Apple (un măr mușcat) pe spate. Dacă al tău nu are, este aproape sigur un telefon Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Ce ${isPC ? 'calculator folosești' : 'telefon ai'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Nu ești sigur?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Arată-mi unde</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Ascultă din nou</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Înapoi un pas</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Schimbă ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">EXERSARE ${isPC ? 'CALCULATOR' : 'TELEFON'}: nu este real. Nimic din ce faci aici nu este trimis nicăieri.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Oprește vocea' : 'Pornește vocea'; };
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
            showBtn.textContent = 'Înapoi la lecție';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Arată-mi unde';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Gata!' : `Pasul ${i + 1} din ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Corect!' : 'Nu chiar.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Continuă</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Încearcă din nou</button>${pageNext
                ? `<button type="button" class="ap vb">Bună treabă! ${last ? 'Acum termină cursul' : 'Încearcă lecția următoare'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Nu chiar. ' + (step.hint || 'Mai citește o dată instrucțiunile.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Încă nu chiar. Mai citește o dată instrucțiunile.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Nu chiar. ' + (step.hint || 'Mai citește o dată instrucțiunile.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Aplicație';
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
                else hint.textContent = 'Fă-i clic dreapta: apasă butonul din dreapta al mouse-ului. Pe trackpadul unui Mac, fă clic cu două degete. Pe un ecran tactil, ține apăsat.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Ține degetul (sau butonul mouse-ului) apăsat pe el până se întâmplă ceva.';
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
                showBtn.textContent = 'Arată-mi unde';
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
