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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play Маркет'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', 'Телефон', '#22c55e', ICON.phone], ['messages', 'Сообщения', '#22c55e', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Фото', '#e5e7eb', ICON.photos], ['mail', 'Почта', '#3b82f6', ICON.mail], ['clock', 'Часы', '#111827', ICON.clock],
               ['weather', 'Погода', '#38bdf8', ICON.weather], ['maps', 'Карты', '#22c55e', ICON.map], ['settings', 'Настройки', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Телефон', '#2563eb', ICON.phone], ['messages', 'Сообщения', '#3b82f6', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Фото', '#e5e7eb', ICON.photos], ['clock', 'Часы', '#111827', ICON.clock], ['maps', 'Карты', '#16a34a', ICON.map],
               ['settings', 'Настройки', '#475569', ICON.settings], ['weather', 'Погода', '#38bdf8', ICON.weather], ['mail', 'Почта', '#ef4444', ICON.mail],
               ['store', 'Play Маркет', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Проведите вниз от правого верхнего угла ⟦chevron-down⟧' : 'Проведите вниз от верхнего края ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Сегодня</div>
                <div class="hp"><span>ВЫБОР РЕДАКЦИИ</span><strong>Приложения недели</strong></div>
                <div class="hp alt"><span>С ЧЕГО НАЧАТЬ</span><strong>Идеи для вашего нового iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Сегодня</button><button type="button" data-tap="games">Игры</button>
                    <button type="button" data-tap="apps">Приложения</button><button type="button" data-tap="search-tab">${ICON.search}Поиск</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Поиск приложений и игр</span></button>
            <div class="tg"><span class="on">Для вас</span><span>Топ-чарты</span><span>Детям</span></div>
            <div class="hp"><span>РЕКОМЕНДУЕМ ВАМ</span><strong>Приложения для начала</strong></div>
            <div class="hp alt"><span>ПОПУЛЯРНОЕ</span><strong>Оставайтесь на связи</strong></div>
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
        const btnLabel = p === 'ios' ? 'Загрузить' : 'Установить';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? 'Более 5 млрд загрузок' : 'Социальные сети'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Бесплатно</span></div></div>
                <p class="agm">На настоящем iPhone вам может понадобиться дважды нажать боковую кнопку, посмотреть на экран для Face ID или ввести здесь пароль от Apple Account.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Установить</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Отмена</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Добро пожаловать в WhatsApp</h3>
            <p>Прочитайте нашу <u>Политику конфиденциальности</u>. Нажмите «Принять и продолжить», чтобы принять <u>Условия использования</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Принять и продолжить</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Введите свой номер телефона</h3>
            <p>WhatsApp потребуется проверить ваш номер телефона. Может взиматься плата оператора.</p>
            <div class="abt">Великобритания <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Далее</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Это верный номер?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Изменить</button><button type="button" data-tap="yes">${ios ? 'Да' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>СООБЩЕНИЯ · сейчас</strong><span>Ваш код WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Не сообщайте этот код другим.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Проверка номера</h3>
            <p>Ожидание автоматического определения 6-значного кода, отправленного по SMS на номер <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Не получили код?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['«WhatsApp» запрашивает доступ к вашим контактам', 'Чтобы вы видели, кто из ваших друзей пользуется WhatsApp.', 'Разрешить WhatsApp доступ к вашим контактам?']
            : ['«WhatsApp» хочет отправлять вам уведомления', 'Чтобы вы знали, когда приходит новое сообщение.', 'Разрешить WhatsApp отправлять вам уведомления?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Данные профиля</h3>
            <p>Введите своё имя и при желании добавьте фото профиля.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Ваше имя</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Далее</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Чаты' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Всё готово${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Здесь появятся ваши чаты. Нажмите кнопку нового чата, чтобы написать кому-то из ваших контактов.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Это главный экран вашего телефона. Приложения скачиваются из <strong>${store}</strong>. Это бесплатно, и это безопасное место для получения приложений. <strong>Нажмите ${store}.</strong>`,
                 hint: `Найдите значок ${store}. ${p === 'ios' ? "Он синий с белой буквой A." : "Это цветной треугольник."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Теперь нужно найти WhatsApp. <strong>Нажмите «Поиск»</strong> внизу справа.' : 'Теперь нужно найти WhatsApp. <strong>Нажмите на строку поиска</strong> вверху.',
                 hint: p === 'ios' ? 'Поиск — это лупа внизу справа.' : 'В строке поиска написано «Поиск приложений и игр».'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Мы ввели <em>whatsapp</em> за вас. Появился список подсказок. <strong>Нажмите «whatsapp messenger».</strong>",
                 hint: 'Нажмите на подсказку «whatsapp messenger».'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Осторожно: некоторые приложения притворяются WhatsApp. Настоящее называется <strong>WhatsApp Messenger</strong>, его разработчик — <strong>WhatsApp Inc.</strong>, и оно бесплатное. <strong>Нажмите ${p === 'ios' ? 'Загрузить' : 'Установить'} рядом с настоящим.</strong>`,
                 hints: {'fake1-get': 'Это «WhatsUp Chat Free» от Fun Apps Ltd. Это подделка, а пометка «Реклама» означает, что это рекламное объявление. Проверяйте название и разработчика.',
                         'fake2-get': 'Это «WA Messenger for Chat Pro» от LuckyDev Studio, копия. Настоящее приложение сделано WhatsApp Inc.'},
                 hint: 'Найдите «WhatsApp Messenger» от «WhatsApp Inc.»'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Перед установкой iPhone проверяет, что это действительно вы. На настоящем iPhone это может быть <strong>Face ID</strong>, ваш <strong>отпечаток пальца</strong> (Touch ID) или <strong>пароль от Apple Account</strong>. Здесь просто <strong>нажмите «Установить».</strong>',
                    hints: {'sheet-cancel': '«Отмена» остановит загрузку. Нажмите «Установить».'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Идёт загрузка. Когда она закончится, кнопка превратится в <strong>«Открыть»</strong>. <strong>Нажмите «Открыть».</strong>`,
                 hint: 'Подождите, пока на кнопке появится «Открыть», и нажмите её.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp открывается впервые. Он просит принять его условия. <strong>Нажмите «Принять и продолжить».</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp использует номер вашего мобильного, чтобы друзья могли вас найти. <strong>Нажмите на поле с номером телефона</strong>, и мы подставим тренировочный номер.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `На настоящем телефоне вы введёте свой номер мобильного. Здесь мы взяли выдуманный: <strong>07700 900123</strong>. <strong>Нажмите «Далее».</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp просит убедиться, что вы ввели номер правильно. Этот верный, поэтому <strong>нажмите ${p === 'ios' ? 'Да' : 'OK'}.</strong>`,
                 hints: {edit: `Если бы вы ошиблись, вы бы нажали «Изменить». Этот номер верный, поэтому нажмите ${p === 'ios' ? 'Да' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp присылает SMS с 6-значным кодом, чтобы проверить, что номер ваш. iPhone предлагает подставить его за вас. <strong>Нажмите на код над клавиатурой.</strong>'
                    : 'WhatsApp присылает SMS с 6-значным кодом, чтобы проверить, что номер ваш. Многие телефоны Android подставляют его сами. Если у вас этого не произошло, <strong>нажмите на сообщение</strong> вверху.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Пока вы настраиваете приложение, вам пишет друг: <em>«Привет! Я случайно отправил тебе 6-значный код, можешь переслать его мне?»</em> Что вы сделаете?',
                    options: [
                        {t: 'Отправлю, это же друг', why: 'Это распространённая мошенническая схема. Кто-то захватил аккаунт вашего друга, и этот код отдал бы ему и ваш.'},
                        {t: 'Не отправлю. Такой код никто не должен просить', ok: true, why: 'Верно. Этот код — ключ от вашего WhatsApp. Никому его не сообщайте, даже другу или тому, кто говорит, что он из WhatsApp.'},
                        {t: 'Отправлю только первые 3 цифры', why: 'Даже часть кода помогает мошеннику. Не сообщайте из него ничего.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp просит доступ к вашим контактам, чтобы показать, кто из друзей им пользуется. <strong>Нажмите «Разрешить».</strong>',
                 hints: {deny: 'Можно не разрешать, но тогда WhatsApp не сможет показывать имена ваших друзей. В этой тренировке нажмите «Разрешить».'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Уведомления сообщают о новом сообщении, даже когда WhatsApp закрыт. <strong>Нажмите «Разрешить».</strong>',
                 hints: {deny: 'Без уведомлений вы не узнаете, что вам написали. В этой тренировке нажмите «Разрешить».'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Последний шаг: ваше имя видят друзья. <strong>Введите своё имя в поле</strong>, затем <strong>нажмите «Далее»</strong>. (Оно остаётся на этой странице и никуда не отправляется.)',
                 hints: {photo: 'В настоящем приложении можно сразу выбрать фото или добавить его позже в настройках. Сейчас пропустим: введите имя и нажмите «Далее».'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Отлично, вы настроили WhatsApp!</strong> Здесь появятся ваши чаты. На следующих уроках вы отправите своё первое сообщение.'},
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
            const lockName = ctx.touch ? 'Touch ID и код-пароль' : 'Face ID и код-пароль';
            const groups = [
                [['airplane', 'Авиарежим', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Сотовая связь', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Уведомления', '#ef4444', '⟦bell⟧'], ['sounds', 'Звуки, тактильные сигналы', '#ec4899', '⟦volume-2⟧'], ['focus', 'Фокусирование', '#6366f1', '⟦moon⟧']],
                [['general', 'Основные', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Доступность', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence и Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Экран и яркость', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Экстренный вызов — SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Конфиденциальность и безопасность', '#3b82f6', '⟦hand⟧'], ['battery', 'Аккумулятор', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Приложения', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple Account, iCloud и другое</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Сеть и интернет', 'Мобильная сеть, Wi-Fi, точка доступа'], ['devices', 'Подключённые устройства', 'Bluetooth, сопряжение'],
            ['apps', 'Приложения', 'Недавние приложения, приложения по умолчанию'], ['notifications', 'Уведомления', 'История уведомлений'], ['battery', 'Аккумулятор', '85%'], ['storage', 'Хранилище', '91% used'],
            ['sound', 'Звук и вибрация', 'Громкость, тактильные сигналы'], ['display', 'Экран и касания', 'Тёмная тема, размер шрифта'],
            ['accessibility', 'Доступность', 'Экран, взаимодействие, звук'], ['security', 'Безопасность и конфиденциальность', 'Защита приложений, блокировка устройства, разрешения'],
            ['location', 'Геолокация', 'Вкл.'], ['safety', 'Безопасность и экстренные случаи', 'Экстренный вызов, медицинские данные, оповещения'],
            ['google', 'Google', 'Сервисы и настройки'], ['system', 'Система', 'Языки, время, обновления ПО']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID и код-пароль' : 'Face ID и код-пароль';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Палец 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Сбросить Face ID</span></div><div class="cj ex"><span>Настроить альтернативный внешний вид</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Выключить код-пароль</span></div><div class="cj ex"><span>Сменить код-пароль</span></div>'
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

    const androidSecurity = () => androidList('Безопасность и конфиденциальность', [
        ['device-unlock', 'Разблокировка устройства', 'Блокировка экрана, разблокировка по лицу и отпечатку'], ['app-security', 'Защита приложений', 'Проверка приложений на вредоносное поведение'],
        ['theft', 'Защита от кражи', 'Заблокируйте телефон, если его украдут'], ['privacy', 'Конфиденциальность', 'Разрешения, действия в аккаунте']]);
    const androidDeviceUnlock = ctx => androidList('Разблокировка устройства', [
        ['screen-lock', 'Блокировка экрана', ctx.passcodeSet ? 'PIN-код' : 'Нет'], ['face-finger', 'Разблокировка по лицу и отпечатку', ctx.faceDone || ctx.fingerDone ? 'Настроить' : 'Настройте для более быстрой разблокировки']]);
    const androidFaceFinger = ctx => androidList('Разблокировка по лицу и отпечатку', [
        ['face-unlock', 'Разблокировка по лицу', ctx.faceDone ? 'Лицо добавлено' : 'Настроить'], ['fingerprint-unlock', 'Разблокировка по отпечатку', ctx.fingerDone ? '1 fingerprint' : 'Настроить']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Первое сканирование Face ID завершено.' : 'Face ID настроен.') : 'Лицо добавлено';
        const btn = p === 'ios' ? (first ? 'Продолжить' : 'Готово') : 'Готово';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Медленно двигайте головой, чтобы замкнуть круг.' : 'Держите лицо в круге и медленно двигайте головой.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Завершено' : 'Измените положение руки') : (stage === 'grip' ? 'Измените положение руки' : 'Приложите палец'))
            : (ready ? 'Отпечаток добавлен' : 'Коснитесь датчика');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Теперь отпечаток пальца можно использовать для разблокировки iPhone.' : 'Теперь приложите к кнопке «Домой» края кончика пальца.')
                     : (stage === 'grip' ? 'Положите края кончика пальца на кнопку «Домой».' : 'Несколько раз приподнимите и снова приложите палец к кнопке «Домой».'))
            : (ready ? 'Теперь вы можете разблокировать телефон отпечатком пальца.' : 'Касайтесь датчика, поднимайте палец и касайтесь снова, пока отпечаток не заполнится.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Продолжить' : 'Готово'}</button>` : sensor}
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
                 say: 'Код-пароль, Face ID и Touch ID находятся в приложении <strong>Настройки</strong>. <strong>Нажмите «Настройки»</strong> (серая шестерёнка).',
                 hint: '«Настройки» — серый значок с шестерёнкой.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `При необходимости прокрутите список вниз и <strong>нажмите ${ctx.touch ? 'Touch ID и код-пароль' : 'Face ID и код-пароль'}</strong>.`,
                 hint: `Найдите «${ctx.touch ? 'Touch ID и код-пароль' : 'Face ID и код-пароль'}» под пунктом «Экран и яркость».`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Блокировка экрана, разблокировка по лицу и отпечатки находятся в приложении <strong>Настройки</strong>. <strong>Нажмите «Настройки»</strong> (шестерёнка).',
             hint: '«Настройки» — значок с шестерёнкой.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'При необходимости прокрутите вниз и <strong>нажмите «Безопасность и конфиденциальность»</strong>. <em>На Samsung этот раздел называется «Безопасность и конфиденциальность», затем «Биометрия» или «Экран блокировки».</em>',
             hint: 'Найдите «Безопасность и конфиденциальность» ближе к концу списка.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Нажмите «Разблокировка устройства».</strong>',
             hint: 'Это первый пункт, «Разблокировка устройства».'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Введите код-пароль' : 'Введите PIN-код', p === 'ios' ? '' : 'Чтобы продолжить, введите PIN-код'),
        sequence: CODE_KEYS,
        say: `${extraSay}Сначала телефон проверяет, что это вы. <strong>Введите тренировочный код: ${codeText}</strong>. <em>Никогда не вводите свой настоящий код-пароль на сайте.</em>`,
        hint: `Введите тренировочный код ${codeText}, по одной цифре.`,
    });

    const safestQuestion = {
        q: 'Какой из этих код-паролей будет <strong>самым надёжным</strong>?',
        options: [
            {t: '123456', why: '123456 — самый популярный код-пароль, поэтому вор попробует его одним из первых.'},
            {t: 'Ваш день рождения, например 140352', why: 'Дату рождения легко узнать из соцсетей, открыток или писем. Избегайте дат, которые что-то значат.'},
            {t: 'Шесть цифр, которые ничего не значат для других', ok: true, why: 'Верно. Случайные цифры, не похожие на дату, закономерность или повтор, угадать труднее всего.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'На этом телефоне ещё нет код-пароля, поэтому его может открыть любой. <strong>Нажмите «Включить код-пароль».</strong>',
                 hints: {stolen: 'Защита украденного устройства разбирается на уроке 4. Сначала включите код-пароль.'}},
                {screen: c => codeScreen(p, c, 'Задать код-пароль', 'Введите код-пароль', '<p class="aeh">Параметры код-пароля</p>'), sequence: CODE_KEYS,
                 say: `Выберите 6 цифр, которые вы запомните. Для этой тренировки <strong>введите ${codeText}</strong>. <em>Пожалуйста, не вводите здесь свой настоящий код-пароль.</em>`,
                 hint: `Введите ${codeText}, по одной цифре.`},
                {screen: c => codeScreen(p, c, 'Задать код-пароль', 'Повторите новый код-пароль'), sequence: CODE_KEYS,
                 say: `iPhone просит ввести его ещё раз, чтобы убедиться, что вы не ошиблись. <strong>Введите ${codeText} ещё раз.</strong>`,
                 hint: `Введите ${codeText} ещё раз.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Отлично, на вашем учебном телефоне теперь есть код-пароль!</strong> На настоящем iPhone на этом этапе также могут попросить пароль от Apple Account.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Блокировка экрана: <strong>Нет</strong>, поэтому телефон может открыть любой. <strong>Нажмите «Блокировка экрана».</strong>'},
            {screen: () => androidList('Выбор блокировки экрана', [['none', 'Нет'], ['swipe', 'Свайп'], ['pattern', 'Графический ключ'], ['pin', 'PIN-код'], ['password', 'Пароль']]),
             target: 'pin', say: 'Есть несколько вариантов. <strong>PIN-код</strong> (цифры) прост и надёжен. <strong>Нажмите «PIN-код».</strong>',
             hints: {none: '«Нет» означает, что телефон может открыть любой.', swipe: '«Свайп» просто открывает телефон движением пальца, поэтому ничего не защищает.',
                     pattern: 'Графический ключ можно угадать по следам пальца на экране. PIN-код безопаснее.',
                     password: 'Пароль тоже подойдёт, но PIN-код быстрее вводить каждый день. В этой тренировке нажмите «PIN-код».'}},
            {screen: c => codeScreen(p, c, 'Выберите PIN-код', 'PIN-код должен содержать не менее 4 цифр'), sequence: CODE_KEYS,
             say: `6 цифр надёжнее, чем 4. Для этой тренировки <strong>введите ${codeText}</strong>. <em>Пожалуйста, не вводите здесь свой настоящий PIN-код.</em>`,
             hint: `Введите ${codeText}, по одной цифре.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Выберите PIN-код', 'PIN-код должен содержать не менее 4 цифр', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Нажмите «Далее».</strong>'},
            {screen: c => codeScreen(p, c, 'Повторите PIN-код', ''), sequence: CODE_KEYS,
             say: `Телефон просит ввести его ещё раз, чтобы убедиться, что вы не ошиблись. <strong>Введите ${codeText} ещё раз.</strong>`, hint: `Введите ${codeText} ещё раз.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Повторите PIN-код', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Нажмите «Подтвердить».</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Уведомления на заблокированном экране', [['show-all', 'Показывать всё содержимое уведомлений'], ['hide-sensitive', 'Скрывать конфиденциальное содержимое'], ['dont-show', 'Не показывать уведомления']], false),
             target: 'hide-sensitive',
             say: 'Телефон спрашивает, что показывать на заблокированном экране. Хороший выбор — <strong>«Скрывать конфиденциальное содержимое»</strong>: вы увидите, что пришло сообщение, но не его текст. <strong>Нажмите на этот вариант.</strong>',
             hints: {'show-all': 'Тогда любой, кто возьмёт ваш телефон, увидит всё, в том числе коды из банка. Нажмите «Скрывать конфиденциальное содержимое».',
                     'dont-show': 'Так тоже можно, но вы не будете видеть, когда приходят сообщения. В этой тренировке нажмите «Скрывать конфиденциальное содержимое».'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Отлично, на вашем учебном телефоне теперь есть PIN-код!</strong> Теперь в блокировке экрана указан PIN-код.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Нажмите «Настроить Face ID».</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Как настроить Face ID</strong>
                    <p>Сначала расположите лицо в рамке камеры. Затем поводите головой по кругу, чтобы показать лицо со всех сторон.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Начать</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Держите телефон перед лицом на расстоянии вытянутой руки, как при съёмке селфи. <strong>Нажмите «Начать».</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'На настоящем iPhone теперь нужно <strong>медленно водить головой по кругу</strong>, будто рисуете круг носом. Кольцо заполняется по мере сканирования. Когда оно заполнится, <strong>нажмите «Продолжить»</strong>.',
                 hint: 'Подождите, пока круг заполнится, затем нажмите «Продолжить».'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Для надёжности идёт второе сканирование. Снова поводите головой по кругу. Когда закончите, <strong>нажмите «Готово»</strong>.',
                 hint: 'Подождите, пока круг заполнится, затем нажмите «Готово».', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Друг просит добавить на ваш телефон <em>своё</em> лицо, «на всякий случай». Что вы сделаете?',
                    options: [
                        {t: 'Разрешу, так удобно', why: 'Любой, чьё лицо настроено, сможет открыть ваш телефон и подтверждать платежи в приложениях. Настраивайте только своё лицо.'},
                        {t: 'Откажу. Телефон должно разблокировать только моё лицо', ok: true, why: 'Верно. Если доверенному человеку нужен доступ, лучше сообщите ему код-пароль, а потом при необходимости смените его.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Отлично, Face ID настроен!</strong> Теперь вы можете разблокировать телефон, просто посмотрев на него и проведя пальцем вверх.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Нажмите «Разблокировка по лицу и отпечатку».</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Нажмите «Разблокировка по лицу».</strong>',
             hints: {'fingerprint-unlock': 'Это отпечатки пальцев, о них урок 3. Сейчас нажмите «Разблокировка по лицу».'}},
            {screen: () => consent(p, 'Разблокировка по лицу', 'Используйте лицо, чтобы разблокировать телефон и подтверждать, что это вы, в приложениях. Ваше лицо хранится только на этом телефоне.', 'Согласен'),
             target: 'agree', say: 'Телефон объясняет, как он использует ваше лицо. <strong>Нажмите «Согласен».</strong>',
             hints: {cancel: '«Отмена» остановит настройку. Нажмите «Согласен», чтобы продолжить.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Держите телефон на уровне глаз на расстоянии вытянутой руки. На настоящем телефоне нужно <strong>держать лицо в круге и медленно двигать головой</strong>. Когда закончите, <strong>нажмите «Готово»</strong>.',
             hint: 'Подождите, пока круг заполнится, затем нажмите «Готово».', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Во многих телефонах Android разблокировка по лицу менее надёжна, чем по отпечатку пальца. Что это значит для вас?',
                options: [
                    {t: 'Для всего подойдёт', why: 'Во многих телефонах для этого используется обычная камера, которую проще обмануть. Поэтому некоторые банковские приложения такой способ не принимают.'},
                    {t: 'Использовать для разблокировки, а для банка — отпечаток пальца или PIN-код, если этого требует банк', ok: true, why: 'Верно. Телефон сообщит, можно ли использовать разблокировку по лицу для платежей и банковских приложений. Если нельзя, используйте отпечаток пальца или PIN-код.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Отлично, разблокировка по лицу настроена!</strong> Теперь вы можете разблокировать телефон, просто посмотрев на него.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Нажмите «Добавить отпечаток…»</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID использует <strong>кнопку «Домой»</strong> на передней панели старых iPhone, например iPhone SE. <strong>Нажмите кнопку «Домой» внизу учебного телефона 6 раз</strong>, будто прикладываете и поднимаете палец.',
                 hint: 'Нажмите круглую кнопку «Домой» внизу учебного телефона.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Теперь нужны края кончика пальца. <strong>Нажмите «Продолжить».</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'На настоящем iPhone нужно прикладывать к кнопке <strong>бока и кончик</strong> пальца. <strong>Нажмите кнопку «Домой» ещё 4 раза.</strong>',
                 hint: 'Нажмите круглую кнопку «Домой» внизу.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Всё готово. <strong>Нажмите «Продолжить».</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Какой палец лучше добавить первым?',
                    options: [
                        {t: 'Большой или другой палец, которым вы чаще всего держите телефон', ok: true, why: 'Да. Для кнопки «Домой» это обычно большой палец. Можно добавить до 5 пальцев, поэтому стоит добавить оба больших.'},
                        {t: 'Любой, это неважно', why: 'Подойдёт любой палец, но выберите тот, который сам ложится на кнопку, когда вы берёте телефон, обычно большой.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Отлично, ваш отпечаток пальца настроен!</strong> Приложите палец к кнопке «Домой», чтобы разблокировать телефон. Другие пальцы можно добавить так же.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Нажмите «Разблокировка по лицу и отпечатку».</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Нажмите «Разблокировка по отпечатку».</strong>',
             hints: {'face-unlock': 'Это разблокировка по лицу, она на уроке 2. Сейчас нажмите «Разблокировка по отпечатку».'}},
            {screen: () => consent(p, 'Разблокировка по отпечатку', 'Используйте отпечаток пальца, чтобы разблокировать телефон или подтвердить, что это вы, например при входе в приложения. Ваш отпечаток хранится только на этом телефоне.', 'Согласен'),
             target: 'agree', say: '<strong>Нажмите «Согласен».</strong>', hints: {cancel: '«Отмена» остановит настройку. Нажмите «Согласен», чтобы продолжить.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Датчик может быть на экране, на задней панели или на кнопке питания, и телефон покажет, где именно. Здесь он на экране. <strong>Коснитесь датчика 6 раз</strong>, будто прикладываете и поднимаете палец.',
             hint: 'Коснитесь круглого датчика у нижнего края экрана.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Отпечаток записан. <strong>Нажмите «Готово».</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Какой палец лучше добавить первым?',
                options: [
                    {t: 'Палец, который сам касается датчика, когда вы берёте телефон', ok: true, why: 'Да. Для датчика на задней панели это обычно указательный палец, а для датчика на экране или сбоку — большой. Можно добавить несколько.'},
                    {t: 'Любой, это неважно', why: 'Подойдёт любой палец, но выберите тот, который сам ложится на датчик. Так разблокировать телефон быстро и легко.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Отлично, ваш отпечаток пальца настроен!</strong> Коснитесь датчика, чтобы разблокировать телефон. Другие пальцы можно добавить так же.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Подсолнухи в саду', '#fde68a'], ['🐶', 'Собака на диване', '#fecaca'], ['🏖️', 'День на пляже', '#bae6fd'],
                    ['🎂', 'Праздничный торт', '#fbcfe8'], ['🌅', 'Закат над морем', '#fed7aa'], ['🐈', 'Спящий кот', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Прочитано' : state === 'sent' ? 'Отправлено' : 'Доставлено'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Привет, мам, это я! Новый номер, старый телефон сломался…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Семья', last: 'Dave: Кто принесёт торт? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Увидимся в четверг!', time: 'Вчера', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Привет, мам! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Новый чат' : 'Выберите контакт'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Семья', '#f59e0b', 'Dave, Jean, Sarah, Вы'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Добавить (плюс)' : 'Прикрепить (скрепка)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Этого номера нет в ваших контактах.</p><div><button type="button" data-tap="block">Заблокировать</button><button type="button" data-tap="add-contact">Добавить</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Фото' : 'Галерея'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Заблокировать +44 7700 900842?</strong></p><p class="fd">Заблокированные контакты не смогут вам звонить и писать.</p>
                <p class="fd">⟦square-check⟧ Пожаловаться в WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Отмена</button><button type="button" data-tap="confirm-block">Заблокировать</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Недавние' : 'Галерея'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Вызов…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Включить звук' : 'Отключить звук'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Без звука на 1 неделю' : 'Выкл.'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Отключить уведомления на…</strong></p>
                <button type="button" data-tap="mute-8h">8 часов</button><button type="button" data-tap="mute-week">1 неделю</button><button type="button" data-tap="mute-always">Всегда</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Настройки', [['account', 'Аккаунт', 'Уведомления безопасности, смена номера'], ['privacy', 'Конфиденциальность', 'Блокировка контактов, исчезающие сообщения'],
                ['chats', 'Чаты', 'Тема, обои'], ['notifications', 'Уведомления', 'Сигналы сообщений, групп и звонков']]],
            account: ['Аккаунт', [['twostep', 'Двухэтапная проверка', ctx.twoStep ? 'Вкл.' : 'Выкл.'], ['change-number', 'Сменить номер', ''], ['delete-account', 'Удалить аккаунт', '']]],
            privacy: ['Конфиденциальность', [['last-seen', 'Был(а) в сети и онлайн', 'Все'], ['profile-photo', 'Фото профиля', 'Все'],
                ['groups', 'Группы', ctx.groupsSetting || 'Все'], ['blocked', 'Заблокированные контакты', ctx.blocked ? '1' : 'Нет']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Кто может добавлять меня в группы</strong></p>
                <button type="button" data-tap="groups-everyone">Все</button><button type="button" data-tap="groups-contacts">Мои контакты</button>
                <button type="button" data-tap="groups-except">Мои контакты, кроме…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Двухшаговая проверка</h3><p>Для дополнительной защиты включите двухшаговую проверку: при повторной регистрации вашего номера в WhatsApp потребуется PIN-код.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Включить</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Добавьте адрес электронной почты</h3>
                <p>Добавьте адрес электронной почты, чтобы сбросить PIN-код, если забудете его.</p>
                <div class="tk ex">ваш адрес электронной почты</div>
                <button type="button" class="ce ox" data-tap="email-next">Далее</button>
                <button type="button" class="cp wd" data-tap="skip">Пропустить</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Двухшаговая проверка включена</h3><p>PIN-код потребуется, если вы настроите WhatsApp на новом телефоне.</p>
                <button type="button" class="ce ox" data-tap="done">Готово</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Придумайте 6-значный PIN-код' : 'Подтвердите PIN-код'}</strong>
            <p>${stage === 'pin' ? 'Он понадобится, чтобы настроить WhatsApp на новом телефоне.' : 'Введите тот же PIN-код ещё раз.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Это список ваших чатов. Чтобы начать новый, <strong>нажмите кнопку нового чата</strong> (карандаш вверху справа).'
                          : 'Это список ваших чатов. Чтобы начать новый, <strong>нажмите зелёную кнопку +</strong> внизу справа.',
         hints: {'chat-family': 'Так откроется уже существующий чат. Лучше начните новый.', 'chat-jean': 'Так откроется уже существующий чат. Лучше начните новый.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp показывает людей из ваших контактов, которые им пользуются. <strong>Нажмите Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Сначала напишите сообщение в поле, затем нажмите стрелку отправки.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Привет, мам! 😊 Как приятно тебя слышать!', n: 2}); },
         say: '<strong>Нажмите на поле сообщения</strong> внизу, <strong>напишите короткое сообщение</strong> (например, «Привет!»), затем <strong>нажмите стрелку отправки</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Микрофон нужен для голосовых сообщений, до них мы ещё дойдём. Сначала напишите сообщение и нажмите стрелку отправки.', attach: 'Это для фото, до них мы ещё дойдём. Сначала напишите сообщение и нажмите «Отправить».'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah ответила! Под вашим сообщением <strong>две синие галочки ⟦check-check⟧</strong>. Что они означают?',
            options: [
                {t: 'Сообщение не удалось отправить', why: 'Неотправленное сообщение помечено маленькими часами или красным значком предупреждения. Галочки значат, что всё получилось.'},
                {t: 'Sarah прочитала его', ok: true, why: 'Да! Одна серая галочка означает «отправлено», две серые — «доставлено на её телефон», а две синие — «она прочитала».'},
                {t: 'Оно было отправлено дважды', why: 'Нет, оно отправлено только один раз. Две синие галочки значат, что сообщение прочитано.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Теперь отправьте фото. <strong>Нажмите ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> рядом с полем сообщения.`,
         hints: {camera: 'Камера делает новый снимок. Чтобы отправить уже сделанный, нажмите ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Нажмите ${p === 'ios' ? 'Фото' : 'Галерея'}</strong>, чтобы выбрать из фото на вашем телефоне.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Это (понарошку) фото на вашем телефоне. <strong>Нажмите на подсолнухи</strong> 🌻.',
         hint: 'Нажмите на фото с подсолнухами.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Красота! 🌻 Это из вашего сада?', n: 4}); },
         say: 'Если хотите, добавьте подпись. Затем <strong>нажмите стрелку отправки</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Голосовые сообщения удобны, когда набирать текст трудно. На настоящем телефоне нужно <strong>нажать и удерживать микрофон</strong> ⟦mic⟧, пока говорите, а затем отпустить, чтобы отправить. Здесь <strong>один раз нажмите микрофон, чтобы начать, затем нажмите стрелку отправки</strong>.',
         hint: 'Нажмите микрофон, затем стрелку отправки.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Отлично!</strong> Вы отправили сообщение, фото и голосовое сообщение. Чтобы в любой момент ответить Sarah, откройте WhatsApp и нажмите на её чат.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Нажмите на чат с Sarah</strong>, чтобы открыть его.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Вверху чата две кнопки звонка: <strong>видеокамера</strong> для видеозвонка и <strong>телефон</strong> для голосового звонка. <strong>Нажмите видеокамеру</strong> ⟦video⟧.',
         hints: {voice: 'Это голосовой звонок без видео. В этой тренировке нажмите видеокамеру.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Звонок идёт на телефон Sarah, а когда она ответит, вы увидите друг друга. Если у вас шумно, <strong>нажмите микрофон</strong> ⟦mic⟧, чтобы отключить свой звук.',
         hint: 'Кнопка микрофона находится в нижнем ряду.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Ваш звук отключён: Sarah видит вас, но не слышит. Чтобы показать ей что-нибудь, <strong>нажмите кнопку переворота</strong> ⟦switch-camera⟧ и переключитесь на камеру на задней стороне телефона.',
         hints: {mute: 'Позже нажмите микрофон ещё раз, чтобы включить звук. Сейчас попробуйте кнопку переворота.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Теперь Sarah видит то, на что вы направили телефон. Когда закончите, <strong>нажмите красную кнопку</strong>, чтобы завершить звонок.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Видеозвонки расходуют много трафика. Как лучше всего их делать?',
            options: [
                {t: 'По домашнему Wi-Fi, когда есть возможность', ok: true, why: 'Да. По Wi-Fi звонки не тратят ваш мобильный трафик, поэтому они бесплатны, как бы долго вы ни говорили.'},
                {t: 'Неважно', why: 'В мобильной сети долгий видеозвонок может быстро израсходовать ваш трафик. Лучше всего Wi-Fi, когда он доступен.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Теперь группы. В группе «Семья» много новых сообщений, и уведомления всё время жужжат. <strong>Нажмите на группу «Семья».</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Чтобы изменить настройки группы, <strong>нажмите на её название</strong> вверху.', hint: 'Нажмите на слово «Семья» вверху экрана.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Нажмите «Отключить уведомления».</strong> Сообщения вы по-прежнему будете получать, но телефон не будет жужжать на каждое.',
         hints: {'exit-group': '«Выйти из группы» удалит вас из неё совсем. Отключение уведомлений мягче: вы остаётесь в группе, но без жужжания.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Выберите, на какой срок. <strong>Нажмите «1 неделю».</strong>',
         hints: {'mute-8h': '8 часов тоже подойдёт. В этой тренировке нажмите «1 неделю».', 'mute-always': '«Всегда» тоже подойдёт, но вы можете что-то пропустить. В этой тренировке нажмите «1 неделю».'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Отлично!</strong> Вы сделали видеозвонок, отключили свой звук, перевернули камеру и отключили шумную группу. Читать сообщения группы можно в любой момент.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Привет!', ticks: 'read', n: 1}, {text: 'Привет, мам! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Воскресный обед у нас? 🍗', n: 1}, {from: 'Sarah', text: 'Да, с удовольствием!', n: 2}, {from: 'Dave', text: 'Кто принесёт торт? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Собственные настройки WhatsApp находятся внутри приложения. <strong>Нажмите «Настройки»</strong> внизу справа.',
                hints: {'chat-unknown': 'С этим сообщением разберёмся позже. Сначала нажмите «Настройки» внизу справа.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Собственные настройки WhatsApp находятся внутри приложения. <strong>Нажмите три точки ⋮</strong> вверху справа.',
                hints: {'chat-unknown': 'С этим сообщением разберёмся позже. Сначала нажмите три точки вверху справа.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Нажмите «Настройки».</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Нажмите «Аккаунт».</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Двухшаговая проверка</strong> добавляет PIN-код, который понадобится, если кто-то попытается настроить ваш WhatsApp на другом телефоне. Даже если мошенник узнает ваш 6-значный код, войти он не сможет. <strong>Нажмите «Двухшаговая проверка».</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Нажмите «Включить».</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Выберите 6-значный PIN-код, не совпадающий с код-паролем телефона. Для этой тренировки <strong>введите ${pinText}</strong>. <em>Не вводите здесь настоящий PIN-код.</em>`,
             hint: `Введите тренировочный PIN-код ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Введите ${pinText} ещё раз</strong>, чтобы подтвердить.`, hint: `Введите ${pinText} ещё раз.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Если добавить адрес электронной почты, можно будет сбросить PIN-код, когда вы его забудете. На настоящем телефоне это стоит сделать. Здесь <strong>нажмите «Далее»</strong>.',
             hints: {skip: 'Можно пропустить, но тогда, забыв PIN-код, вы можете потерять доступ. В этой тренировке нажмите «Далее».'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Двухшаговая проверка включена. <strong>Нажмите «Готово».</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Приходит сообщение от <em>«Поддержки WhatsApp»</em> с просьбой назвать PIN-код двухшаговой проверки, чтобы «подтвердить аккаунт». Что вы сделаете?',
                options: [
                    {t: 'Отправлю, это же от WhatsApp', why: 'WhatsApp никогда не попросит у вас в сообщении PIN-код или код. Это мошенник, который пытается захватить ваш аккаунт.'},
                    {t: 'Не отвечу, заблокирую и пожалуюсь', ok: true, why: 'Верно. Никто, включая WhatsApp, не должен просить ваш PIN-код или 6-значный код.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Теперь запретите незнакомцам добавлять вас в группы. Это находится в разделе <strong>«Конфиденциальность»</strong>. <strong>Нажмите «Группы».</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Мои контакты'; },
             say: '«Все» означает, что любой незнакомец может добавить вас в группу, чем пользуются мошенники. <strong>Нажмите «Мои контакты».</strong>',
             hints: {'groups-everyone': 'Вариант «Все» позволяет незнакомцам добавлять вас в группы, в том числе мошеннические. Нажмите «Мои контакты».'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Пришло сообщение с незнакомого номера: «Привет, мам, это я! Новый номер…». Это мошенническая схема «Привет, мам». <strong>Нажмите на него, чтобы открыть.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Привет, мам, это я! Новый номер, старый телефон сломался. Поможешь оплатить счёт? Завтра верну x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Не отвечайте. WhatsApp замечает, что этого номера нет в ваших контактах. <strong>Нажмите «Заблокировать».</strong>',
             hints: {'add-contact': 'Не добавляйте мошенника в контакты. Нажмите «Заблокировать».', video: 'Не перезванивайте. Нажмите «Заблокировать».', voice: 'Не перезванивайте. Нажмите «Заблокировать».'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Привет, мам, это я! Новый номер, старый телефон сломался. Поможешь оплатить счёт? Завтра верну x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'Галочка у пункта «Пожаловаться в WhatsApp» стоит, и это помогает WhatsApp остановить мошенника. <strong>Нажмите «Заблокировать».</strong>',
             hints: {cancel: 'Если нажать «Отмена», этот человек сможет и дальше вам писать. Нажмите «Заблокировать».'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Отлично!</strong> Вы включили двухшаговую проверку, запретили незнакомцам добавлять вас в группы, заблокировали мошенника и пожаловались на него. Если вы сомневаетесь в сообщении от родных, позвоните им на номер, который у вас уже есть.'},
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Приложения, поддерживающие динамический шрифт, подстроятся под выбранный вами размер текста.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Размер текста', [], {top: slider, back: 'Экран'});
        return list(p, 'Размер экрана и текста', [{caption: 'Размер шрифта'}, {id: 'bold', label: 'Жирный шрифт', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Размер текста находится в приложении <strong>Настройки</strong>. <strong>Нажмите «Настройки».</strong>', hint: '«Настройки» — серый значок с шестерёнкой.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Нажмите «Экран и яркость».</strong>', hint: 'Он в третьей группе, под пунктом «Универсальный доступ».'},
        {screen: c => list(p, 'Экран и яркость', [{caption: 'ОФОРМЛЕНИЕ'}, {label: 'Светлое', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Размер текста'}, {id: 'bold', label: 'Жирный шрифт', toggle: !!c.bold}], {back: 'Настройки'}),
         target: 'text-size', say: '<strong>Нажмите «Размер текста».</strong>', hints: {bold: '«Жирный шрифт» будет следующим. Сначала нажмите «Размер текста».'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Перетащите ползунок вправо, чтобы буквы стали крупнее. Здесь <strong>дважды нажмите на большую A</strong> и посмотрите, как растёт текст.', hint: 'Нажмите на большую A справа от ползунка.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Намного легче читать! Теперь <strong>нажмите ‹ Экран</strong> вверху, чтобы вернуться.'},
        {screen: c => list(p, 'Экран и яркость', [{caption: 'ОФОРМЛЕНИЕ'}, {label: 'Светлое', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Размер текста'}, {id: 'bold', label: 'Жирный шрифт', toggle: !!c.bold}], {back: 'Настройки'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Жирный шрифт</strong> делает буквы толще и чётче. <strong>Нажмите, чтобы включить.</strong>'},
        {screen: c => list(p, 'Экран и яркость', [{caption: 'ТЕКСТ'}, {label: 'Размер текста'}, {label: 'Жирный шрифт', toggle: true}], {back: 'Настройки'}),
         question: {q: 'Текст всё равно мелкий, даже при самом большом размере?', options: [
            {t: 'Больше ничего сделать нельзя', why: 'Можно ещё! Настройки > Универсальный доступ > Дисплей и размер текста > Увеличенный текст даёт ещё более крупные размеры.'},
            {t: 'Настройки > Универсальный доступ > Дисплей и размер текста > Увеличенный текст', ok: true, why: 'Да. Включите там «Увеличенные размеры», и текст станет по-настоящему крупным.'}]}},
        {screen: c => list(p, 'Экран и яркость', [{caption: 'ТЕКСТ'}, {label: 'Размер текста'}, {label: 'Жирный шрифт', toggle: true}], {back: 'Настройки'}), done: true,
         say: '<strong>Отлично!</strong> Текст стал крупнее и жирнее, в настройках и в большинстве приложений.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Размер текста находится в приложении <strong>Настройки</strong>. <strong>Нажмите «Настройки».</strong>', hint: '«Настройки» — значок с шестерёнкой.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Нажмите «Экран и касания».</strong> <em>На Samsung это «Экран», затем «Размер и стиль шрифта».</em>'},
        {screen: () => list(p, 'Экран и касания', [{id: 'dark', label: 'Тёмная тема', toggle: false}, {id: 'text-size', label: 'Размер экрана и текста', sub: 'Размер шрифта, жирный шрифт'}, {id: 'brightness', label: 'Уровень яркости', value: '70%'}]),
         target: 'text-size', say: '<strong>Нажмите «Размер экрана и текста».</strong>', hints: {dark: 'Тёмная тема меняет цвета, а не размер. Нажмите «Размер экрана и текста».'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Перетащите ползунок «Размер шрифта» вправо, чтобы буквы стали крупнее. Здесь <strong>дважды нажмите на большую A</strong>.', hint: 'Нажмите на большую A справа от ползунка.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Жирный шрифт</strong> делает буквы чётче. <strong>Нажмите, чтобы включить.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Текст всё равно мелкий, даже при самом большом размере?', options: [
            {t: 'Больше ничего сделать нельзя', why: 'Попробуйте и «Размер экрана» на той же странице: он увеличивает всё, включая кнопки и значки.'},
            {t: 'Увеличить и «Размер экрана»', ok: true, why: 'Да. «Размер экрана» увеличивает всё на экране, а не только текст.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Отлично!</strong> Текст стал крупнее и жирнее, в настройках и в большинстве приложений.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' на фиолетовом фоне' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Не беспокоить' : 'Фокусирование'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Не беспокоить · Вкл.' : 'Не беспокоить · Выкл.'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Проведите вверх, чтобы закрыть' : 'Закрыть'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Если телефон не звонит, возможно, включён режим «Не беспокоить». Быстрые настройки находятся в <strong>Пункте управления</strong>: <strong>проведите вниз от правого верхнего угла</strong> (или нажмите на полоску вверху).'
                          : 'Если телефон не звонит, возможно, включён режим «Не беспокоить». <strong>Проведите вниз от верхнего края экрана</strong>, чтобы увидеть быстрые настройки (или нажмите на полоску вверху).',
         hints: {'pull-up': 'Проведите в другую сторону: вниз от верхнего края.', 'pull-left': 'Проведите вниз, а не в сторону.', 'pull-right': 'Проведите вниз, а не в сторону.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Луна ⟦moon⟧ означает, что <strong>режим «Не беспокоить» включён</strong> и звонки и сообщения не слышны. <strong>Нажмите на неё, чтобы выключить.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Теперь увеличьте громкость <strong>кнопкой громкости на боку телефона</strong> (верхней). <strong>Нажмите ＋ на краю учебного телефона 3 раза.</strong>',
         hint: 'Нажмите кнопку ＋ на правом краю телефона.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'iPhone всё равно не звонит. В чём ещё может быть дело?', options: [
                {t: 'Переключатель «Звонок/Бесшумно» или кнопка действия переведены в бесшумный режим', ok: true, why: 'Да. У многих iPhone над кнопками громкости есть маленький переключатель: если виден оранжевый цвет, телефон в бесшумном режиме. В новых моделях вместо него кнопка действия.'},
                {t: 'Телефон сломан', why: 'Обычно нет! Сначала проверьте переключатель бесшумного режима над кнопками громкости.'}]}
            : {q: 'Вы нажали кнопку громкости, но изменилась только громкость мультимедиа. Что делать?', options: [
                {t: 'Нажать ⋯ или значок настроек на полосе громкости, чтобы увидеть громкость звонка', ok: true, why: 'Да. Кнопки громкости часто меняют громкость мультимедиа; нажмите три точки на полосе громкости, чтобы изменить громкость звонка.'},
                {t: 'Сдаться', why: 'Нажмите три точки ⋯ на появившейся полосе громкости и увеличьте громкость звонка.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Отлично!</strong> Режим «Не беспокоить» выключен, громкость увеличена, и вы услышите звонки и сообщения.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>ПАРАЦЕТАМОЛ 500 мг</strong><br>Принимайте по 1–2 таблетки каждые 4–6 часов.<br>Не принимайте более 8 таблеток в сутки.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Лупа', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'В вашем iPhone есть приложение <strong>«Лупа»</strong>. Если его нет на главном экране, проведите вниз посередине экрана и введите «Лупа». <strong>Нажмите «Лупа».</strong>'
                          : 'Во многих телефонах Android есть приложение <strong>«Лупа»</strong>. <em>На Samsung оно находится в быстрых настройках или в разделе «Специальные возможности».</em> <strong>Нажмите «Лупа».</strong>',
         hint: 'Найдите чёрный значок с увеличительным стеклом.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Направьте телефон на что-нибудь мелкое, например на эту этикетку лекарства. <strong>Нажмите ＋ три раза</strong>, чтобы приблизить (на настоящем телефоне можно перетащить ползунок).', hint: 'Нажмите ＋ справа от ползунка.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'При слабом освещении поможет фонарик. <strong>Нажмите на фонарик</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Дрожат руки? <strong>Нажмите большую круглую кнопку</strong>, чтобы зафиксировать изображение, и читайте его, не удерживая телефон неподвижно.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Для чего ещё удобна лупа?', options: [
            {t: 'Чтобы читать меню, ценники и мелкий шрифт в письмах', ok: true, why: 'Да, и она всегда в кармане. Некоторые держат её в Пункте управления или в быстрых настройках, чтобы открывать одним нажатием.'},
            {t: 'Чтобы делать звонки громче', why: 'Для этого кнопки громкости. Лупа нужна, чтобы лучше видеть мелкие предметы.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Отлично!</strong> Теперь вы можете приближать мелкий шрифт, подсвечивать его и фиксировать изображение.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Увидимся на утреннем кофе в четверг' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Ты придёшь в четверг? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Текстовое сообщение</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Слушаю… говорите</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Можно говорить вместо того, чтобы печатать. <strong>Откройте «Сообщения».</strong>', hint: '«Сообщения» — это зелёное облачко с речью.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean спрашивает про четверг. <strong>Нажмите на поле сообщения</strong> внизу.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Появляется клавиатура. <strong>Нажмите на микрофон</strong> ⟦mic⟧ на клавиатуре и продиктуйте сообщение.', hint: 'Микрофон находится на клавиатуре, рядом с пробелом.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'На настоящем телефоне вы бы сейчас сказали: <em>«Увидимся на утреннем кофе в четверг»</em>. Слова появляются по мере речи. Проверьте их и <strong>нажмите «Отправить»</strong> ⟦send-horizontal⟧.',
         hint: 'Подождите, пока появятся слова, затем нажмите стрелку отправки.'},
        {screen: () => home(p), target: 'settings',
         say: 'Телефон также умеет <strong>читать вслух</strong>. Давайте это включим. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Нажмите «Универсальный доступ».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступность', [{caption: 'ЗРЕНИЕ'}, {id: 'voiceover', label: 'VoiceOver', value: 'Выкл.'}, {id: 'zoom', label: 'Увеличение', value: 'Выкл.'}, {id: 'spoken', label: 'Речь'}], {back: 'Настройки'})
            : list(p, 'Доступность', [{id: 'select-speak', label: 'Озвучивание при нажатии', sub: 'Выкл.'}, {id: 'talkback', label: 'TalkBack', sub: 'Выкл.'}, {id: 'magnification', label: 'Увеличение экрана'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Нажмите «Речь».</strong>' : '<strong>Нажмите «Озвучивание при нажатии».</strong>',
         hints: {voiceover: 'VoiceOver меняет работу всего телефона, и это может сбивать с толку. Нажмите «Речь».', talkback: 'TalkBack меняет работу всего телефона, и это может сбивать с толку. Нажмите «Озвучивание при нажатии».'}},
        {screen: c => p === 'ios'
            ? list(p, 'Речь', [{id: 'speak-selection', label: 'Проговаривание выбранного', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Проговаривание экрана', toggle: !!c.speakScreen, sub: 'Проведите двумя пальцами вниз от верхнего края экрана, чтобы услышать, как он читается вслух.'}], {back: 'Доступность'})
            : list(p, 'Озвучивание при нажатии', [{id: 'speak-screen', label: 'Использовать «Озвучивание при нажатии»', toggle: !!c.speakScreen, sub: 'Нажмите ярлык, затем нажмите на любое место на экране, чтобы услышать прочитанное вслух.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Включите «Проговаривание экрана».</strong> Затем в любом месте телефона достаточно провести двумя пальцами вниз от верхнего края, и экран прочитают вслух.' : '<strong>Включите «Использовать "Озвучивание при нажатии"».</strong> Появится маленькая кнопка-ярлык: нажмите её, затем нажмите на любой текст, чтобы услышать его.',
         hints: {'speak-selection': 'Это читает только выделенные слова. «Проговаривание экрана» проще: включите его.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Речь', [{label: 'Проговаривание выбранного', toggle: false}, {label: 'Проговаривание экрана', toggle: true}], {back: 'Доступность'})
            : list(p, 'Озвучивание при нажатии', [{label: 'Использовать «Озвучивание при нажатии»', toggle: true}]), done: true,
         say: '<strong>Отлично!</strong> Теперь вы можете говорить вместо того, чтобы печатать, а телефон может читать вам вслух.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Многие слуховые аппараты можно подключить к телефону, и тогда звонки и музыка звучат прямо в них. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Нажмите «Универсальный доступ».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступность', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слуховые устройства'}, {id: 'live-captions', label: 'Живые субтитры', value: c.captions ? 'Вкл.' : 'Выкл.'}, {id: 'subtitles', label: 'Субтитры'}], {back: 'Настройки'})
            : list(p, 'Доступность', [{id: 'hearing-devices', label: 'Слуховые аппараты', sub: c.paired ? 'Подключено' : 'Не подключено'}, {id: 'live-captions', label: 'Автоматические субтитры', sub: c.captions ? 'Вкл.' : 'Выкл.'}, {id: 'sound-amp', label: 'Усилитель звука'}]),
         target: 'hearing-devices', say: `<strong>Нажмите ${p === 'ios' ? 'Слуховые устройства' : 'Слуховые аппараты'}.</strong> Сначала наденьте слуховые аппараты и закройте и откройте крышки батареек, чтобы они перезапустились, тогда телефон их найдёт.`,
         hints: {'live-captions': 'Субтитры будут следующим шагом. Сначала подключите слуховые аппараты.'}},
        {screen: c => list(p, p === 'ios' ? 'Слуховые устройства' : 'Слуховые аппараты', [{caption: p === 'ios' ? 'СЛУХОВЫЕ УСТРОЙСТВА MFI' : 'Доступные устройства'}, {id: 'aids', label: 'Слуховые аппараты Margaret', sub: 'Левый и правый'}],
            {overlay: c.pairing ? dialog(p, 'Подключить «Слуховые аппараты Margaret»?', 'Они будут использоваться для звонков и звука.', [['cancel', 'Отмена'], ['pair', 'Подключить']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Телефон нашёл их. <strong>Нажмите на свои слуховые аппараты.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Слуховые устройства' : 'Слуховые аппараты', [{id: 'aids', label: 'Слуховые аппараты Margaret', sub: 'Левый и правый'}],
            {overlay: dialog(p, 'Подключить «Слуховые аппараты Margaret»?', 'Они будут использоваться для звонков и звука.', [['cancel', 'Отмена'], ['pair', 'Подключить']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Нажмите «Подключить».</strong> (Если слуховых аппаратов два, телефон может спросить дважды, по разу для каждого.)'},
        {screen: c => list(p, p === 'ios' ? 'Слуховые устройства' : 'Слуховые аппараты', [{label: 'Слуховые аппараты Margaret', sub: 'Подключено ⟦check⟧'}]), target: 'back',
         say: 'Подключено! Теперь звонки будут звучать в ваших слуховых аппаратах. <strong>Нажмите «Назад».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступность', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слуховые устройства'}, {id: 'live-captions', label: 'Живые субтитры', value: c.captions ? 'Вкл.' : 'Выкл.'}], {back: 'Настройки'})
            : list(p, 'Доступность', [{id: 'hearing-devices', label: 'Слуховые аппараты', sub: 'Подключено'}, {id: 'live-captions', label: 'Автоматические субтитры', sub: c.captions ? 'Вкл.' : 'Выкл.'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Живые субтитры' : 'Автоматические субтитры'}</strong> показывает на экране слова из всего, что произносится: видео, звонков и голосовых сообщений. <strong>Нажмите, чтобы включить.</strong>`},
        {screen: c => list(p, 'Доступность', [{label: p === 'ios' ? 'Живые субтитры' : 'Автоматические субтитры', toggle: true}, {label: 'Слуховые аппараты', sub: 'Подключено'}]), done: true,
         say: '<strong>Отлично!</strong> Ваши слуховые аппараты подключены, и произносимые слова теперь появляются в виде субтитров.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Муравей', 'Барсук', 'Кошка', 'Собака', 'Орёл', 'Лиса', 'Коза', 'Ёж', 'Ибис', 'Галка', 'Зимородок', 'Ягнёнок', 'Крот',
                     'Тритон', 'Выдра', 'Тупик', 'Малиновка', 'Тюлень', 'Жаба', 'Полёвка', 'Крапивник', 'Зебра'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Нажмите на цветок и удерживайте</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Копировать</span><span>Поделиться</span><span>Удалить</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Зебра</h3><p>У зебр чёрно-белые полосы. Двух зебр с одинаковым узором не бывает.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Нажать</strong> значит слегка коснуться экрана одним пальцем и сразу убрать палец, как при нажатии кнопки. <strong>Нажмите на звезду.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Нажать и удерживать</strong> значит держать палец на чём-то секунду-две. Обычно появляются дополнительные варианты. <strong>Нажмите на цветок и удерживайте</strong>, пока что-нибудь не произойдёт. (С мышью удерживайте нажатой кнопку.)',
         hint: 'Подержите палец на цветке секунду-две.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Появилось меню. Что обычно происходит, если нажать и удерживать?', options: [
            {t: 'Показываются дополнительные варианты, например «Копировать», «Поделиться» или «Удалить»', ok: true, why: 'Да. Если нажать и удерживать сообщение, фото или приложение, появляются такие варианты.'},
            {t: 'Сразу удаляет', why: 'Нет, просто показывается меню вариантов. Пока вы не выберете один из них, ничего не происходит.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Провести пальцем</strong> значит скользнуть пальцем по экрану, как при перелистывании страницы. <strong>Дважды проведите по фото влево</strong>, чтобы увидеть следующие. (С мышью щёлкните, потяните и отпустите.)',
         hint: 'Проведите пальцем по фото справа налево. Или нажмите кнопку «Не получается провести?»'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Прокрутка</strong> значит скользить пальцем вверх по экрану, чтобы увидеть остальную часть списка, как этот. <strong>Прокрутите вниз и нажмите «Зебра»</strong>, в самом конце. (С мышью используйте колёсико.)',
         hint: 'Проведите по списку пальцем вверх, чтобы добраться до «Зебра» внизу.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Чтобы вернуться на страницу назад на iPhone, <strong>нажмите ‹ Назад</strong> вверху слева (или проведите от левого края экрана).' : 'Чтобы вернуться на страницу назад на Android, <strong>нажмите стрелку «назад» ◁</strong> внизу (или проведите от левого или правого края экрана).',
         hints: {'home-pill': 'Это ведёт сразу на главный экран. Нажмите вместо этого стрелку «назад» ◁.', 'home-bar': 'Это ведёт сразу на главный экран. Нажмите вместо этого ‹ Назад.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Чтобы перейти на главный экран откуда угодно, <strong>проведите вверх от полоски внизу</strong> экрана (или нажмите на полоску здесь). На старых iPhone с круглой кнопкой «Домой» нажмите её.'
                          : 'Чтобы перейти на главный экран откуда угодно, <strong>нажмите круг «Домой» ○</strong> внизу (или проведите вверх от нижнего края).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': '«Назад» возвращает на одну страницу. Нажмите круг «Домой» ○, чтобы перейти на главный экран.'}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> Вы потренировались нажимать, нажимать и удерживать, проводить пальцем, прокручивать, возвращаться назад и переходить на главный экран: этими движениями вы будете пользоваться каждый день.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Подключено', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Интернет', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'СЕТИ' : 'Доступные сети'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Настройки',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Введите пароль для «BT-Hub-7F2A»</strong></p>
                ${field('wifipass', 'Пароль', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Подключиться' : 'Подключить'}</button>
                <button type="button" class="cp" data-tap="cancel">Отмена</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wi-Fi дома экономит мобильный трафик. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Нажмите Wi-Fi</strong> у верхнего края.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Нажмите «Сеть и интернет».</strong> <em>На Samsung это «Подключения», затем Wi-Fi.</em>'},
               {screen: () => list(p, 'Сеть и интернет', [{id: 'internet', label: 'Интернет', sub: 'Wi-Fi и мобильный интернет'}, {id: 'sims', label: 'SIM-карты'}, {id: 'hotspot', label: 'Точка доступа и режим модема'}]),
                target: 'internet', say: '<strong>Нажмите «Интернет».</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Название и пароль вашего Wi-Fi обычно написаны на наклейке на задней стороне роутера (коробочки с лампочками). На наклейке этого учебного роутера написано:<br><span class="ahd">Сеть: <strong>BT-Hub-7F2A</strong><br>Пароль: <strong>Green-Apple-42</strong></span><strong>Нажмите BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Это Wi-Fi соседей. Найдите название на своей наклейке: BT-Hub-7F2A.', 'net-sky-12345': 'Это чужой Wi-Fi. Найдите название на своей наклейке: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Пароль должен точно совпадать с наклейкой, включая заглавные буквы и дефисы: Green-Apple-42',
         say: 'Введите пароль <strong>точно</strong> так, как он написан на наклейке: <strong>Green-Apple-42</strong>. Заглавные буквы важны! Затем <strong>нажмите «Подключиться»</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Вы подключены! Теперь телефон будет сам подключаться к этой сети Wi-Fi, когда вы дома. Безопасно ли пользоваться бесплатным Wi-Fi в кафе?', options: [
            {t: 'Да, для просмотра сайтов, но не пользуйтесь через него онлайн-банком', ok: true, why: 'Верно. Общедоступный Wi-Fi подходит, чтобы почитать новости или узнать расписание автобуса. Для банка используйте мобильный интернет или домашний Wi-Fi.'},
            {t: 'Да, для всего', why: 'За общедоступным Wi-Fi могут следить посторонние. Для просмотра сайтов он подходит, а для банка используйте мобильный интернет или домашний Wi-Fi.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Отлично!</strong> Вы подключены к Wi-Fi. Ищите значок Wi-Fi в виде веера вверху экрана.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Новый контакт' : 'Создать контакт', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Имя', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Номер мобильного', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Сохранить'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Контакт', [
        {label: 'мобильный', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Добавить в избранное' : (ctx.fav ? '⟦star⟧ Избранное' : '⟦star⟧ Добавить в избранное')},
        {id: 'share', label: 'Поделиться контактом'}], {back: 'Контакты'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Контакты', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Если сохранить чей-то номер, вы сможете звонить человеку по имени. На iPhone контакты находятся в приложении <strong>Телефон</strong>. <strong>Нажмите «Телефон».</strong>' : '<strong>Нажмите «Контакты».</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Контакты', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Контакты', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Это список ваших контактов. <strong>Нажмите +</strong> вверху справа, чтобы добавить человека.' : 'Это список ваших контактов. <strong>Нажмите кнопку +</strong>, чтобы добавить человека.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Введите имя и тренировочный номер 07700 900456, затем нажмите ' + (p === 'ios' ? '«Готово».' : '«Сохранить».'),
         say: `Введите <strong>имя</strong> человека (например, «Ann») и его номер. Для тренировки используйте <strong>07700 900456</strong>. Затем <strong>нажмите ${p === 'ios' ? 'Готово' : 'Сохранить'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Сохранено! Избранные — это люди, которым вы звоните чаще всего; они показаны вверху, чтобы звонить одним нажатием. <strong>Нажмите ' + (p === 'ios' ? 'Добавить в избранное' : 'на звезду') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Какой контакт стоит сохранить с пометкой «ICE» (на случай экстренной ситуации) перед именем?', options: [
            {t: 'Ваш ближайший родственник, например «ICE Sarah»', ok: true, why: 'Да. Медики знают, что нужно искать ICE. Ещё лучше добавить экстренный контакт в Медкарту, об этом в курсе «Безопасность телефона».'},
            {t: 'Ваш банк', why: 'ICE — это тот, с кем нужно связаться, если с вами что-то случится, обычно ближайший родственник.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Отлично!</strong> Вы сохранили контакт и добавили его в избранное.'},
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
    const recents = p => app(p, 'Недавние', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Звонит телефон: вам звонит Jean. <strong>Нажмите зелёную кнопку, чтобы ответить.</strong>' + (p === 'android' ? ' <em>На некоторых телефонах Android зелёную кнопку нужно смахнуть вверх.</em>' : ' <em>Если iPhone заблокирован, зелёную кнопку нужно сдвинуть вправо.</em>'),
         hints: {decline: 'Красная кнопка отклоняет звонок. Чтобы ответить, нажмите зелёную.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Вы разговариваете! Чтобы лучше слышать или говорить без рук, <strong>нажмите «Динамик»</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Когда закончите, <strong>нажмите красную кнопку</strong>, чтобы положить трубку.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Ранее вы пропустили звонок от Dave. Пропущенные звонки в списке недавних показаны <strong>красным</strong>. <strong>Нажмите Dave</strong>, чтобы перезвонить.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Идёт вызов Dave. Когда закончите разговор, <strong>нажмите красную кнопку</strong>, чтобы положить трубку.'},
        {screen: () => recents(p), question: {q: 'Кто-то звонит с незнакомого номера и говорит, что он из вашего банка. Что вы сделаете?', options: [
            {t: 'Положу трубку и позвоню на 159, чтобы безопасно связаться с банком', ok: true, why: 'Верно. Всегда можно положить трубку и перезвонить на номер, которому вы доверяете. 159 соединяет с вашим собственным банком.'},
            {t: 'Сделаю, как говорят, это же банк', why: 'Мошенники постоянно выдают себя за банки, и номер можно подделать. Положите трубку и позвоните на 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Отлично!</strong> Вы умеете отвечать на звонки, включать динамик, класть трубку и перезванивать по пропущенным.'},
    ], {});

    function smsList(p) {
        return app(p, 'Сообщения', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Ваш последний осмотр был в марте. Запишитесь онлайн или позвоните нам.</span><small>3 месяца назад</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Текстовое сообщение', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Текстовые сообщения находятся в приложении <strong>«Сообщения»</strong>. <strong>Нажмите «Сообщения».</strong>', hint: 'Это значок с облачком речи.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Новые сообщения выделены жирным. <strong>Нажмите на сообщение от стоматолога</strong>, чтобы прочитать его.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Сначала введите Y в поле сообщения, затем нажмите стрелку отправки.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Стоматолог просит ответить <strong>Y</strong>, чтобы подтвердить запись. <strong>Нажмите на поле сообщения, введите Y и нажмите стрелку отправки</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Готово! Теперь наведите порядок: <strong>нажмите на старое сообщение вверху и удерживайте</strong> (держите палец на нём секунду-две).', hint: 'Держите палец на старом сообщении вверху, пока не появится меню.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Появляется меню. <strong>Нажмите «Удалить».</strong>',
         hints: {copy: '«Скопировать» копирует текст. Нажмите «Удалить».', forward: '«Переслать» отправляет сообщение другому человеку. Нажмите «Удалить».'}},
        {screen: c => smsChat(p, c), question: {q: 'SMS с незнакомого номера сообщает, что вашу посылку задержали, и просит заплатить £1.45 по ссылке. Что вы сделаете?', options: [
            {t: 'Не буду нажимать на ссылку. Перешлю на 7726, затем удалю', ok: true, why: 'Верно. 7726 бесплатный, и оттуда сообщение передают вашему оператору. Курьеры не присылают ссылки с просьбой оплатить сбор.'},
            {t: 'Заплачу, это всего £1.45', why: '£1.45 — это приманка, чтобы получить данные вашей карты. Не нажимайте на ссылку: перешлите сообщение на 7726 и удалите.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Отлично!</strong> Вы умеете читать SMS, отвечать на них и удалять ненужные.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Карты', 15], ['WhatsApp', 9], ['Камера', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Аккумулятор', [{id: 'low-power', label: 'Режим энергосбережения', toggle: saver, sub: 'Снижает фоновую активность, пока вы не зарядите телефон полностью.'}, {caption: 'АККУМУЛЯТОР ПО ПРИЛОЖЕНИЯМ'}], {back: 'Настройки', top: head, bottom: apps})
            : list(p, 'Аккумулятор', [{id: 'low-power', label: 'Экономия заряда', toggle: saver, sub: 'Отключает некоторые функции, чтобы аккумулятор держал дольше.'}, {caption: 'Использование заряда'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Садится аккумулятор? <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Нажмите «Аккумулятор».</strong>', hint: p === 'ios' ? '«Аккумулятор» находится в третьей группе.' : '«Аккумулятор» есть в списке, после пункта «Уведомления».'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Заряд 23%. <strong>${p === 'ios' ? 'Режим энергосбережения' : 'Экономия заряда'}</strong> помогает продержаться дольше. <strong>Нажмите, чтобы включить.</strong> В напоминание значок аккумулятора станет ${p === 'ios' ? 'yellow' : 'orange'}.`},
        {screen: c => batteryPage(p, c), question: {q: 'В списке видно, что сегодня больше всего заряда потратил Facebook. Что лучше всего помогает продлить заряд?', options: [
            {t: 'Уменьшить яркость экрана и закрывать приложения, которыми закончили пользоваться', ok: true, why: 'Да. Больше всего энергии потребляет экран. Меньше яркость, и приложения вроде Facebook и YouTube тоже расходуют много.'},
            {t: 'Заряжать до 100% каждый час', why: 'Частая зарядка не вредит, но заряд от неё дольше не держится. Уменьшите яркость и используйте режим экономии заряда.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Отлично!</strong> Режим экономии заряда включён, и вы знаете, какие приложения тратят больше всего энергии.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'мобильный · 3 звонка' : 'Возможный спам · 3 звонка'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Недавние', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>мобильный</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>мобильный</small><span>Вчера</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Один и тот же незнакомый номер продолжает вам звонить. Давайте его заблокируем. <strong>Откройте приложение «Телефон».</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `В списке недавних звонков <strong>нажмите ⓘ</strong> рядом с номером 07700 900842${p === 'android' ? ' (на некоторых телефонах Android нажмите на сам номер)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Поделиться контактом'}, {id: 'block', label: p === 'ios' ? 'Заблокировать абонента' : 'Заблокировать/пожаловаться на спам', danger: true}], {back: 'Недавние'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Заблокировать абонента' : 'Заблокировать/пожаловаться на спам'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Заблокировать этого абонента?', 'Вы не будете получать звонки, сообщения и вызовы FaceTime от людей из списка заблокированных.', [['cancel', 'Отмена'], ['confirm', 'Заблокировать контакт']])
            : dialog(p, 'Заблокировать 07700 900842?', '⟦square-check⟧ Пожаловаться на звонок как на спам', [['cancel', 'Отмена'], ['confirm', 'Заблокировать']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Заблокировать контакт' : 'Заблокировать'}.</strong>${p === 'android' ? ' Если оставить галочку у пункта «Пожаловаться на звонок как на спам», вы поможете предупредить других людей.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Заблокировано! Можно также <strong>заглушить все звонки с незнакомых номеров</strong>. <strong>Нажмите «Настройки».</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Прокрутите в самый низ и <strong>нажмите «Приложения»</strong>.'},
            {screen: () => list(p, 'Приложения', [{id: 'app-phone', label: 'Телефон'}, {id: 'app-messages', label: 'Сообщения'}, {id: 'app-mail', label: 'Почта'}], {back: 'Настройки'}), target: 'app-phone', say: '<strong>Нажмите «Телефон».</strong>'},
            {screen: c => list(p, 'Телефон', [{id: 'silence', label: 'Заглушение неизвестных', toggle: !!c.silence}, {id: 'blocked', label: 'Заблокированные контакты', value: '1'}], {back: 'Приложения'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Включите «Заглушение неизвестных».</strong> Звонки с номеров, которых нет в ваших контактах, сразу попадают на голосовую почту и всё равно видны в списке недавних.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Заблокировано! Можно также <strong>фильтровать спам-звонки</strong>. <strong>Нажмите три точки ⋮</strong> вверху справа.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Нажмите «Настройки».</strong>'},
            {screen: () => list(p, 'Настройки', [{id: 'caller-id', label: 'Определитель номера и спам'}, {id: 'blocked', label: 'Заблокированные номера'}, {id: 'sounds', label: 'Звуки и вибрация'}]), target: 'caller-id', say: '<strong>Нажмите «Определитель номера и спам».</strong>'},
            {screen: c => list(p, 'Определитель номера и спам', [{id: 'caller-show', label: 'Показывать данные об абонентах и спаме', toggle: true}, {id: 'silence', label: 'Фильтровать спам-звонки', toggle: !!c.silence, sub: 'Телефон не будет звонить при возможных спам-звонках'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Включите «Фильтровать спам-звонки».</strong> Телефон не будет звонить при возможных мошеннических звонках.'},
        ]),
        {screen: c => list(p, 'Готово', [{label: 'Заблокированные номера', value: '1'}, {label: p === 'ios' ? 'Заглушение неизвестных' : 'Фильтровать спам-звонки', toggle: true}]),
         question: {q: 'Не пропустите ли вы настоящий звонок, например из больницы или от курьера, если заглушить неизвестные номера?', options: [
            {t: 'Да, поэтому время от времени проверяйте голосовую почту и пропущенные звонки', ok: true, why: 'Верно. Настоящие абоненты обычно оставляют сообщение, а пропущенные звонки всё равно видны в списке.'},
            {t: 'Нет, они всегда дозвонятся', why: 'Звонки с неизвестных номеров, в том числе настоящие, попадают на голосовую почту. Время от времени проверяйте голосовую почту и пропущенные звонки.'}]}},
        {screen: () => list(p, 'Готово', [{label: 'Заблокированные номера', value: '1'}, {label: p === 'ios' ? 'Заглушение неизвестных' : 'Фильтровать спам-звонки', toggle: true}]), done: true,
         say: '<strong>Отлично!</strong> Вы заблокировали назойливый номер и сократили число мошеннических звонков.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: ваша посылка задержана из-за неоплаченного сбора £1.45. Оплатите сейчас, чтобы назначить доставку заново: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Кому: ${field('fwdto', 'Номер', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Спасибо. Пожалуйста, пришлите номер телефона, с которого пришло мошенническое SMS.</span><small>сейчас</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Спасибо, ваше сообщение получено.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Новое сообщение') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Текстовое сообщение', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Ещё… затем «Переслать»' : 'Переслать'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Вам пришло мошенническое SMS от имени Royal Mail. Прежде чем удалить его, сообщите о нём, это бесплатно. <strong>Откройте «Сообщения».</strong>'},
        {screen: () => app(p, 'Сообщения', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Нажмите на сообщение</strong>, чтобы открыть его. Не нажимайте на ссылку внутри!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Нажмите на сообщение и удерживайте</strong> (держите палец на нём), пока не появится меню. Не нажимайте на ссылку.', hint: 'Держите палец на сером облачке сообщения секунду-две.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Нажмите «Ещё…»</strong>, затем стрелку «Переслать» (здесь одна кнопка делает и то и другое).' : '<strong>Нажмите «Переслать».</strong> (На некоторых телефонах она находится под тремя точками ⋮ вверху.)',
         hints: {delete: 'Сначала сообщите о нём, потом можно удалить.', copy: 'Нажмите «Переслать», чтобы отправить сообщение на 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'В поле «Кому» введите 7726 (на клавиатуре телефона это буквы SPAM), затем нажмите «Отправить».',
         action: c => { c.sent7726 = true; }, say: 'В поле <strong>«Кому»</strong> введите <strong>7726</strong>. (На клавиатуре телефона это буквы S-P-A-M.) Затем <strong>нажмите «Отправить»</strong> ⟦send-horizontal⟧. Это бесплатно.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Введите номер мошенника, 07700 900911, затем нажмите «Отправить».',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 отвечает и спрашивает, с какого номера пришло мошенническое сообщение. <strong>Введите 07700 900911</strong> и <strong>нажмите «Отправить»</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Вы сообщили о нём. Что теперь сделать с мошенническим SMS?', options: [
            {t: 'Удалить и заблокировать номер', ok: true, why: 'Да. Вы уже сообщили о нём, поэтому его можно удалить. Блокировка не даст этому номеру присылать новые сообщения.'},
            {t: 'Нажать на ссылку, чтобы проверить, настоящая ли она', why: 'Никогда не нажимайте на ссылки в мошеннических SMS. Удалите сообщение и заблокируйте номер.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Отлично!</strong> Вы сообщили о мошенническом SMS на 7726, и это помогает операторам блокировать его для всех. Мошеннические письма отправляйте на report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Обновления исправляют проблемы с безопасностью, поэтому они важны. Сначала подключите телефон к зарядке и к Wi-Fi. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Нажмите «Основные».</strong>'},
        {screen: () => list(p, 'Основные', [{id: 'about', label: 'Об этом устройстве'}, {id: 'software', label: 'Обновление ПО', value: '1'}, {id: 'storage', label: 'Хранилище iPhone'}], {back: 'Настройки'}), target: 'software', say: '<strong>Нажмите «Обновление ПО».</strong> Красная 1 означает, что обновление ждёт установки.'},
        {screen: () => list(p, 'Обновление ПО', [{id: 'auto', label: 'Автообновление', value: 'Выкл.'}], {back: 'Основные',
            bottom: '<div class="hu"><strong>Обновление iOS</strong><p>Это обновление содержит важные исправления безопасности и рекомендуется всем пользователям.</p><button type="button" class="ce co" data-tap="update-now">Обновить сейчас</button></div>'}),
         target: 'update-now', say: '<strong>Нажмите «Обновить сейчас».</strong>', hints: {auto: 'Потом стоит включить и автообновление. Сначала нажмите «Обновить сейчас».'}},
        {screen: c => codeScreen(p, c, 'Введите код-пароль', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone запрашивает код-пароль. <strong>Введите тренировочный код 4 7 1 9 3 6.</strong>', hint: 'Введите 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Обновление ПО', [], {back: 'Основные', bottom: `<div class="hu"><strong>${c.busy ? 'Загрузка…' : 'Готово к установке'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Сначала идёт загрузка, это может занять несколько минут. Затем <strong>нажмите «Установить сейчас»</strong>. Телефон перезагрузится, поэтому делайте это, когда он не понадобится 15–30 минут.'},
        {screen: () => list(p, 'Обновление ПО', [{id: 'auto', label: 'Автообновление', value: 'Вкл.'}], {back: 'Основные', bottom: '<div class="hu"><strong>Ваш iPhone обновлён</strong></div>'}),
         question: {q: 'Стоит ли включить автообновление?', options: [
            {t: 'Да, тогда обновление установится ночью во время зарядки', ok: true, why: 'Верно. Настройки > Основные > Обновление ПО > Автообновление. Обновление ставится ночью, когда телефон на зарядке и подключён к Wi-Fi.'},
            {t: 'Нет, обновления необязательны', why: 'Обновления закрывают бреши в безопасности, которыми пользуются мошенники. Автообновление защищает вас, и не нужно ничего помнить.'}]}},
        {screen: () => list(p, 'Обновление ПО', [], {bottom: '<div class="hu"><strong>Ваш iPhone обновлён ⟦check⟧</strong></div>'}), done: true, say: '<strong>Отлично!</strong> Телефон обновлён и защищён от новейших проблем.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Обновления исправляют проблемы с безопасностью, поэтому они важны. Сначала подключите телефон к зарядке и к Wi-Fi. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Прокрутите вниз и <strong>нажмите «Система»</strong>. <em>На Samsung это «Обновление ПО» ближе к концу списка.</em>'},
        {screen: () => list(p, 'Система', [{id: 'languages', label: 'Языки'}, {id: 'date', label: 'Дата и время'}, {id: 'software', label: 'Обновления системы', sub: 'Доступно обновление'}]), target: 'software', say: '<strong>Нажмите «Обновления ПО».</strong>'},
        {screen: () => list(p, 'Обновления системы', [{id: 'system-update', label: 'Обновление системы', sub: 'Доступно обновление'}, {id: 'play-update', label: 'Обновление системы Google Play'}]), target: 'system-update', say: '<strong>Нажмите «Обновление системы».</strong>'},
        {screen: () => list(p, 'Обновление системы', [], {bottom: '<div class="hu"><strong>Доступно обновление системы</strong><p>Содержит важные исправления безопасности.</p><button type="button" class="ce dk" data-tap="download">Скачать и установить</button></div>'}),
         target: 'download', say: '<strong>Нажмите «Скачать и установить».</strong>'},
        {screen: c => list(p, 'Обновление системы', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Скачивание и установка…' : 'Перезагрузите для завершения'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Сначала идут загрузка и подготовка, это может занять время. Затем <strong>нажмите «Перезагрузить сейчас»</strong>. Телефон выключится и снова включится, это займёт несколько минут.'},
        {screen: () => list(p, 'Обновление системы', [], {bottom: '<div class="hu"><strong>Ваша система обновлена</strong></div>'}),
         question: {q: 'Ваш телефон не получал обновлений годами. Что это может значить?', options: [
            {t: 'Он, возможно, слишком старый для обновлений безопасности, а значит, менее безопасен', ok: true, why: 'Да. Старые телефоны перестают получать обновления. Не пользуйтесь на них онлайн-банком и по возможности замените телефон.'},
            {t: 'Он прекрасно работает', why: 'Через несколько лет телефоны перестают получать обновления, и бреши в безопасности остаются незакрытыми.'}]}},
        {screen: () => list(p, 'Обновление системы', [], {bottom: '<div class="hu"><strong>Ваша система обновлена ⟦check⟧</strong></div>'}), done: true, say: '<strong>Отлично!</strong> Телефон обновлён и защищён от новейших проблем.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (дочь)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Медкарта' : 'Медицинская информация', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'например, диабет 2 типа', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'например, пенициллин', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Показывать на заблокированном экране</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Сохранить'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Выберите контакт</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Здоровье', '#fff', ICON2.health]]), target: 'health', say: '<strong>Медкарта</strong> позволяет медикам увидеть ваши аллергии и экстренный контакт, даже когда телефон заблокирован. <strong>Откройте приложение «Здоровье».</strong>'},
            {screen: () => app(p, 'Сводка', '<p class="cf">Здесь показаны ваши данные о здоровье.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Нажмите на своё фото</strong> вверху справа.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Данные о здоровье'}, {id: 'medical', label: 'Медкарта'}], {back: 'Сводка'}), target: 'medical', say: '<strong>Нажмите «Медкарта».</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'В телефоне можно сохранить <strong>медицинскую информацию</strong>, которую увидят медики, даже когда он заблокирован. <strong>Нажмите «Настройки».</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Прокрутите вниз и <strong>нажмите «Безопасность и экстренные случаи»</strong>. <em>На Samsung это «Безопасность и экстренные случаи».</em>'},
            {screen: () => list(p, 'Безопасность и экстренные случаи', [{id: 'medical', label: 'Медицинская информация'}, {id: 'contacts-ec', label: 'Экстренные контакты'}, {id: 'sos', label: 'Экстренный вызов — SOS'}]), target: 'medical', say: '<strong>Нажмите «Медицинская информация».</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Сначала укажите аллергию (для тренировки «Пенициллин»), затем добавьте экстренный контакт.',
         say: 'Заполните всё, что стоит знать медикам. Для тренировки введите <strong>пенициллин</strong> в разделе аллергий. Затем <strong>нажмите «Добавить экстренный контакт»</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Выберите, кому звонить в экстренной ситуации. <strong>Нажмите Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? 'Параметр «Показывать на заблокированном экране» включён, поэтому медики смогут это увидеть. <strong>Нажмите «Готово».</strong>' : '<strong>Нажмите «Сохранить».</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Медкарта' : 'Медицинская информация', [{label: 'Аллергии', sub: typed(c, 'allergies')}, {label: 'Экстренный контакт', sub: 'Sarah (дочь)'}]),
         question: {q: p === 'ios' ? 'Как медик увидит вашу Медкарту, если телефон заблокирован?' : 'Как медик увидит это, если телефон заблокирован?', options: [
            {t: 'Через кнопку «Экстренный вызов» на заблокированном экране', ok: true, why: 'Да. Если нажать «Экстренный вызов» на заблокированном экране, появится ваша медицинская информация, и разблокировать телефон не нужно.'},
            {t: 'Никак', why: 'Увидит: кнопка «Экстренный вызов» на заблокированном экране показывает её, и код-пароль не нужен.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Медкарта' : 'Медицинская информация', [{label: 'Аллергии', sub: typed(c, 'allergies')}, {label: 'Экстренный контакт', sub: 'Sarah (дочь)'}]), done: true,
         say: '<strong>Отлично!</strong> Ваша медицинская информация и экстренный контакт сохранены. Если вы позовёте на помощь через «Экстренный вызов — SOS», ваш экстренный контакт тоже получит уведомление.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Локатор' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Воспроизведение звука…' : '⟦volume-2⟧ Воспроизвести звук'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Отметить как пропавшее' : 'Заблокировать устройство'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Если телефон потеряется, вы сможете найти его, заставить зазвонить или заблокировать, но только если эта функция заранее включена. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Нажмите на своё имя</strong> вверху.'},
            {screen: () => list(p, 'Apple Account', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Локатор'}, {id: 'family', label: 'Семейный доступ'}], {back: 'Настройки'}), target: 'findmy', say: '<strong>Нажмите «Локатор».</strong>'},
            {screen: c => list(p, 'Локатор', [{id: 'find-toggle', label: 'Найти iPhone', toggle: !!c.findOn}, {label: 'Отправить последнюю геопозицию', toggle: !!c.findOn}], {back: 'Apple Account'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Включите «Найти iPhone».</strong> Функция «Отправить последнюю геопозицию» передаёт местоположение незадолго до того, как аккумулятор разрядится.'},
            {screen: () => homeWith(p, [['findmy', 'Локатор', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Представьте, что вы не можете найти телефон. На другом устройстве Apple вы бы открыли <strong>«Локатор»</strong> (или зашли на icloud.com/find с компьютера). Здесь <strong>нажмите «Локатор»</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Прокрутите вниз и <strong>нажмите Google</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Все сервисы'}, {id: 'account', label: 'Управление аккаунтом Google'}]), target: 'all-services', say: '<strong>Нажмите «Все сервисы».</strong>'},
            {screen: () => list(p, 'Все сервисы', [{id: 'find-hub', label: 'Find Hub', sub: 'Ранее называлось «Найти устройство»'}, {id: 'theft', label: 'Защита от кражи'}]), target: 'find-hub', say: '<strong>Нажмите Find Hub</strong> (раньше он назывался «Найти устройство»). <em>У Samsung есть и собственный сервис: Настройки &gt; Безопасность и конфиденциальность &gt; Защита потерянного устройства.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Использовать Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Включите «Использовать Find Hub».</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Представьте, что вы не можете найти телефон. На другом телефоне или планшете вы бы открыли <strong>Find Hub</strong> или зашли на google.com/android/find с компьютера. Здесь <strong>нажмите Find Hub</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Вот он, на карте. Если он где-то рядом, например завалился за диван, <strong>нажмите «Воспроизвести звук»</strong>: он громко зазвонит, даже если выключен звук.'},
        {screen: c => findMap(p, c), question: {q: 'На карте телефон там, где вы никогда не были. Что делать?', options: [
            {t: 'Заблокировать его через «Отметить как пропавшее» или «Заблокировать устройство» и обратиться в полицию', ok: true, why: 'Да. Заблокируйте его через «Локатор» или Find Hub, не ходите туда сами и сообщите в полицию и своему оператору.'},
            {t: 'Пойти и забрать самому', why: 'Никогда не вступайте в конфликт с вором. Заблокируйте телефон удалённо и обратитесь в полицию.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Отлично!</strong> Поиск телефона включён, и вы знаете, как заставить его звонить или заблокировать.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Бесплатные советы по технике</strong>${UI.qr}<small>Отсканируйте</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Удалить это фото?', p === 'ios' ? 'Оно будет храниться в разделе «Недавно удалённые» 30 дней.' : 'Некоторое время оно будет лежать в корзине, прежде чем исчезнет навсегда.', [['cancel', 'Отмена'], ['confirm-delete', 'Удалить']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Откройте «Камеру».</strong> <em>Подсказка: на большинстве телефонов её можно открыть, проведя влево по заблокированному экрану.</em>', hint: 'Камера — серый значок с изображением фотоаппарата.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Направьте её на цветы и держите ровно. <strong>Нажмите большую круглую кнопку</strong>, чтобы сделать фото.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Щёлк! Снимок сохранён. <strong>Нажмите на маленькую картинку</strong> в углу, чтобы его увидеть.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Чтобы рассмотреть поближе, поставьте на фото два пальца и раздвиньте их. Здесь <strong>дважды нажмите ＋</strong>.', hint: 'Нажмите ＋ вверху справа.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Прекрасно! Чтобы отправить его кому-нибудь, <strong>нажмите кнопку «Поделиться»</strong> ⇪ (квадрат со стрелкой).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Выберите, как отправить: «Сообщения», электронная почта, WhatsApp и так далее. <strong>Нажмите «Сообщения».</strong> (Потом вы выберете, кому отправить.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Отправлено! Если теперь вы сделаете ненужное фото, <strong>нажмите на корзину</strong> ⟦trash-2⟧, чтобы удалить его.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Телефон сначала уточняет. <strong>Нажмите «Удалить».</strong>'},
        {screen: () => app(p, 'Фото', '<p class="cf">Фото пока нет.</p>', {back: false, color: '#fff'}), question: {q: 'Вы случайно удалили фото! Что можно сделать?', options: [
            {t: p === 'ios' ? 'Зайти в «Альбомы» > «Недавно удалённые» и восстановить его' : 'Зайти в «Корзину» («Библиотека» > «Корзина») и восстановить его', ok: true, why: 'Да. Удалённые фото некоторое время хранятся, обычно около месяца, поэтому их можно вернуть.'},
            {t: 'Ничего, оно пропало навсегда', why: 'Не волнуйтесь! Оно некоторое время хранится в разделе «Недавно удалённые» (iPhone) или в корзине (Android).'}]}},
        {screen: () => app(p, 'Фото', '<p class="cf">Всё готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Отлично!</strong> Вы умеете делать фото, приближать их, делиться ими и удалять.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Если у ваших родных тоже iPhone, <strong>FaceTime</strong> позволяет бесплатно звонить по видео. <strong>Нажмите FaceTime.</strong>' : '<strong>Google Meet</strong> позволяет бесплатно звонить по видео с Android, в том числе на iPhone. <strong>Нажмите Google Meet.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Новый FaceTime' : 'Новый'}</button><p class="cf">Здесь появятся недавние звонки.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Новый FaceTime' : 'Новый'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Новый FaceTime' : 'Позвонить', `<div class="xz">To: ${field('callto', 'Имя или номер', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Видеозвонок'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Сначала введите Sarah в поле «Кому».',
             say: 'Введите имя кого-то из ваших контактов. <strong>Введите Sarah</strong>, затем <strong>нажмите кнопку видео</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Идёт вызов, затем Sarah отвечает. Чтобы показать ей сад, <strong>нажмите кнопку переворота</strong> ⟦switch-camera⟧ и переключитесь на камеру на задней стороне.', hint: 'Подождите, пока Sarah ответит, затем нажмите ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Когда закончите, <strong>нажмите красную кнопку</strong>, чтобы положить трубку.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Видео · 3 мин</p>', {back: false, color: '#fff'}), question: {q: 'У вашего друга телефон Android, а у вас iPhone. Можно ли всё равно звонить по видео?', options: [
                {t: 'Да, через WhatsApp или Google Meet, которые работают на обоих', ok: true, why: 'Верно. FaceTime в основном для связи между iPhone. WhatsApp и Google Meet работают на обоих типах телефонов.'},
                {t: 'Нет, никогда', why: 'Можно: WhatsApp и Google Meet работают на телефонах обоих видов.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Всё готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Отлично!</strong> Вы сделали видеозвонок и показали картинку с задней камеры.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR-коды — это квадратные чёрно-белые узоры на плакатах и меню. Камера умеет их считывать, дополнительное приложение не нужно. <strong>Откройте «Камеру».</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Наведите камеру на код и подержите неподвижно. <strong>На экране появится ссылка</strong>: убедитесь, что она похожа на ожидаемую, затем <strong>нажмите на неё</strong>.',
         hints: {shutter: 'Фотографировать не нужно: просто наведите камеру, подождите, пока появится ссылка, и нажмите на неё.'},
         hint: p === 'android' ? 'Подождите, пока появится ссылка, и нажмите на неё. Если ничего не появилось, попробуйте Google Lens.' : 'Подождите, пока появится ссылка, и нажмите на неё.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Бесплатные советы по технике</h3><p>Советы простым языком о телефонах, компьютерах и безопасности в интернете.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Вы видите наклейку с QR-кодом на автомате оплаты парковки. Как безопаснее всего заплатить?', options: [
            {t: 'Использовать официальное приложение парковки или сам автомат, а не наклеенный QR-код', ok: true, why: 'Да. Мошенники клеят поддельные QR-коды поверх настоящих, чтобы украсть данные карты. Проверьте, не наклейка ли это, и пользуйтесь официальным приложением или табличкой.'},
            {t: 'Отсканировать и заплатить, так быстрее', why: 'Поддельные QR-наклейки на автоматах парковки — известная мошенническая схема. Пользуйтесь официальным приложением или самим автоматом.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Бесплатные советы по технике</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Отлично!</strong> Вы умеете сканировать QR-коды камерой и знаете, что ссылку нужно сначала проверить.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Фото с воскресенья 📷', 'Привет, мам, вот фото с обеда…'],
                       ['tv', 'TV Licensing', 'Срок действия вашей лицензии ИСТЁК', 'Действуйте сейчас, чтобы избежать судебного преследования. Обновите платёжные данные…'],
                       ['library', 'Bridlington Library', 'Пора сдавать книги', 'Ваши книги нужно вернуть до пятницы.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Входящие' : 'Основные', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · мне</p><h3>Фото с воскресенья 📷</h3><p>Привет, мам, вот фото с обеда. Было так здорово тебя увидеть! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Напишите ответ…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Срок действия вашей лицензии ИСТЁК</h3><p>Действуйте сейчас, чтобы избежать судебного преследования. Обновите платёжные данные в течение 24 часов: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Переместить в «Нежелательные»' : '⋮ Сообщить о фишинге'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Почта' : 'ваше приложение электронной почты (на большинстве телефонов Android это Gmail)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Новые письма выделены жирным. <strong>Нажмите на письмо от Sarah</strong>, чтобы прочитать.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Чтобы ответить, <strong>нажмите «Ответить»</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Сначала напишите короткий ответ, затем нажмите «Отправить».',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Напишите короткий ответ</strong> (например, «Спасибо, очень нравится!») и <strong>нажмите «Отправить»</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Отправлено ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Назад во входящие</button>', {color: '#fff'}), target: 'back', say: '<strong>Нажмите «Назад»</strong>, чтобы вернуться во входящие.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Пришло тревожное письмо от «TV Licensing». <strong>Откройте его</strong>, но ничего внутри не нажимайте.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Мошеннические письма часто используют настоящее имя, но поддельный адрес. <strong>Нажмите на имя отправителя</strong>, чтобы увидеть настоящий адрес электронной почты.',
         hint: 'Нажмите «TV Licensing» вверху письма.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Оно пришло с <strong>outlook-mail.com</strong>, а не с tvlicensing.co.uk. Это мошенничество. <strong>Нажмите ' + (p === 'ios' ? 'Переместить в «Нежелательные»' : '«Сообщить о фишинге»') + '.</strong> Мошеннические письма также можно пересылать на report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Что выдало мошенников?', options: [
            {t: 'Настоящий адрес отправителя, угрозы и срок в 24 часа', ok: true, why: 'Верно. Настоящие организации не пугают сроками, а их письма приходят с их собственного веб-адреса.'},
            {t: 'Ничего, оно выглядело настоящим', why: 'Проверьте адрес отправителя: это был не адрес TV Licensing. Угрозы и сжатые сроки тоже серьёзные тревожные признаки.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Отлично!</strong> Вы умеете читать письма, отвечать на них, а также замечать мошенничество и сообщать о нём.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Загрузить' : 'Установить';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Маркет'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Нажмите «Поиск».</strong>' : '<strong>Нажмите на строку поиска.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Мы искали «NHS App». Во многих приложениях в названии есть «NHS». Проверьте, <strong>кто его выпустил</strong>: настоящее приложение выпускает <strong>NHS England</strong>. <strong>Нажмите ' + (p === 'ios' ? 'Загрузить' : 'Установить') + ' рядом с настоящим.</strong>',
         hints: {'fake1-get': 'Это приложение от HealthApps Ltd, и это реклама. Настоящее NHS App выпускает NHS England.', 'fake2-get': 'Это от QuickDev Apps, а не от NHS. Настоящее выпускает NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Установлено! Теперь удалите приложение, которым не пользуетесь, чтобы навести порядок и освободить место. <strong>Нажмите на приложение «Погода» и удерживайте</strong>, пока не появится меню.', hint: 'Подержите палец на значке «Погода» секунду-две.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Удалить «Погода»?' : 'Погода', p === 'ios' ? 'Если убрать с экрана «Домой», приложение останется в библиотеке приложений.' : '', p === 'ios'
            ? [['delete-app', 'Удалить приложение'], ['remove-home', 'Удалить с экрана «Домой»'], ['cancel', 'Отмена']] : [['app-info', 'О приложении'], ['delete-app', 'Удалить'], ['cancel', 'Отмена']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Нажмите «Удалить приложение»</strong>, затем <strong>«Удалить приложение»</strong> (здесь это одна кнопка).' : '<strong>Нажмите «Удалить».</strong>',
         hints: {'remove-home': 'Так скрывается только значок; приложение остаётся на телефоне. Нажмите «Удалить приложение».'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Приложение просит заплатить, чтобы «разблокировать» ваши медицинские записи NHS. Что вы об этом думаете?', options: [
            {t: 'Это не настоящее NHS App, которое полностью бесплатно', ok: true, why: 'Верно. NHS App бесплатное. Удаляйте всё, что просит заплатить за услуги NHS.'},
            {t: 'Заплатить, это же для NHS', why: 'Настоящее NHS App бесплатное, его выпускает NHS England. Приложение, которое просит денег, не настоящее.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Отлично!</strong> Вы умеете отличать настоящие приложения от подделок и удалять ненужные.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>С возвращением.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Войти по Face ID' : 'Войти по отпечатку пальца'}</button>
                <button type="button" class="cp" data-tap="password">Войти по электронной почте и паролю</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Рецепты'], ['appointments', '⟦calendar⟧', 'Приёмы'], ['records', '⟦clipboard-list⟧', 'Ваше здоровье'], ['messages', '⟦mail⟧', 'Сообщения']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Рецепты', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Заказать повторный рецепт</strong><small>Выберите лекарства, которые вам уже назначены</small></button><div class="ck"><strong>Ваши заказы</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Амлодипин, таблетки 5 мг'], ['med-2', 'Аторвастатин, таблетки 20 мг']];
            return app(p, 'Выберите лекарства', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Подтвердите заказ', `<p class="cf">Амлодипин, таблетки 5 мг<br>Получить в: вашей аптеке</p><button type="button" class="ce co" data-tap="confirm">Подтвердить и заказать</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Заказ отправлен', '<p class="cf">⟦check⟧ Ваш запрос на рецепт отправлен в вашу поликлинику (GP surgery). Обычно это занимает 2–3 рабочих дня.</p><button type="button" class="cp" data-tap="home">На главную</button>', {color: NHS});
        return app(p, 'Приёмы', '<div class="fo"><div class="ck"><strong>Приём у врача общей практики</strong><small>Вторник в 10:30 · Ваша поликлиника</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> бесплатно: через него можно заказывать повторные рецепты, смотреть записи на приём и многое другое. (Эта учебная версия понарошку, она сделана только для этого урока.) <strong>Нажмите NHS App.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Когда вы настроите вход через NHS login, вы сможете входить по ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Нажмите «Войти по ${p === 'ios' ? 'Face ID' : 'fingerprint'}».</strong>`,
         hints: {password: 'Так тоже можно, но лицо или отпечаток быстрее. Нажмите синюю кнопку.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Нажмите «Рецепты».</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Нажмите «Заказать повторный рецепт».</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Сначала нажмите на лекарство, чтобы отметить его, затем нажмите «Продолжить».',
         say: '<strong>Нажмите на нужное лекарство</strong>, чтобы отметить его (например, амлодипин), затем <strong>нажмите «Продолжить»</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Проверьте, всё ли верно, затем <strong>нажмите «Подтвердить и заказать»</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Отправлено в вашу поликлинику! <strong>Нажмите «На главную».</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Можно также посмотреть записи на приём. <strong>Нажмите «Приёмы».</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'SMS гласит: «NHS: вам положен бесплатный набор для теста, введите данные банка, чтобы оплатить пересылку». Что это?', options: [
            {t: 'Мошенничество. NHS никогда не просит данные банка по SMS', ok: true, why: 'Верно. Пользуйтесь NHS App или обращайтесь в свою поликлинику напрямую, а не по ссылкам из SMS.'},
            {t: 'Настоящее, это же только пересылка', why: 'NHS никогда не просит данные банка по SMS. Это мошенничество: перешлите сообщение на 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Отлично!</strong> Вы заказали повторный рецепт и посмотрели записи на приём.'},
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
        if (page === 'login') return app(p, 'Учебный банк', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Войти по Face ID' : 'Войти по отпечатку пальца'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Ваши счета', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Сегодня'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Сегодня'], ['txn-pension', 'Государственная пенсия', '+£921.60', 'Вчера'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Пн']];
            return app(p, 'Текущий счёт', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Платёж', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Сегодня, 03:12 · Карта с номером на 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Заморозить карту</strong><small>${ctx.frozen ? 'Карта заморожена ⟦check⟧' : 'Мгновенно остановите платежи'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Сообщить об этом платеже</strong><small>Не узнаёте его? Сообщите нам</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Банк', BANK, ICON2.pound]]), target: 'bank',
         say: 'Банковские приложения позволяют проверять свои деньги в любое время. (Это учебный банк понарошку.) <strong>Откройте приложение «Банк».</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Войдите по ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Никому не сообщайте код доступа к банку.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Нажмите на свой Текущий счёт</strong>, чтобы увидеть поступления и платежи.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Просмотрите платежи. Один из них вы не узнаёте: <strong>£249 в 3 часа ночи на сайт подарочных карт</strong>. <strong>Нажмите на него.</strong>',
         hints: {'txn-tesco': 'Это ваши покупки. Ищите тот платёж, который вы не узнаёте.', 'txn-pension': 'Это поступление вашей пенсии. Ищите платёж, который выбивается из остальных.', 'txn-water': 'Это ваш счёт за воду. Ищите платёж, который выбивается из остальных.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Нажмите «Заморозить карту»</strong>. Это сразу остановит любые новые платежи, а позже карту можно разморозить, если окажется, что всё в порядке.',
         hints: {report: 'Сначала заморозьте карту, чтобы остановить новые платежи. Затем сообщите о платеже.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Вы заморозили карту. Что дальше?', options: [
            {t: 'Позвонить в банк по номеру 159 или по номеру на карте либо сообщить в приложении', ok: true, why: 'Да. Банк может провести проверку, отменить карту и часто вернуть деньги. Чем скорее вы сообщите, тем лучше.'},
            {t: 'Подождать и посмотреть, повторится ли', why: 'Сразу сообщите в банк. Чем раньше они узнают, тем больше смогут сделать.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Отлично!</strong> Вы проверили счёт, заметили незнакомый платёж и заморозили карту.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Учебный банк</strong><span>•••• 4421</span><small>ДЕБЕТОВАЯ</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `<p class="cf">Добавьте карту, чтобы платить в магазинах телефоном.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Добавить карту' : '＋ Добавить в Wallet'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Добавить карту', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Расположите карту в рамке…' : 'Карта найдена ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Подтвердить карту', `<p class="cf">Банку нужно убедиться, что это вы. Выберите, как получить код:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>SMS</strong><small>на ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Позвонить в банк</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Введите код', `<div class="jp ex"><strong>Сообщения · сейчас</strong><span>Учебный банк: ваш код для Wallet 529173. Никому его не сообщайте.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Wallet' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Ваша карта готова к использованию.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Поднесите к терминалу…' : 'Поднесите к терминалу…') : '⟦check⟧ Готово'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Wallet' : 'Wallet', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Оплата телефоном быстра и безопасна: магазины не видят номер вашей карты. <strong>Откройте ${p === 'ios' ? 'Wallet' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Добавить карту' : '＋ Добавить в Wallet'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Телефон считывает карту камерой, поэтому номер вводить не нужно. <strong>Расположите карту в рамке</strong>, затем <strong>нажмите «Далее»</strong>. <em>Никогда не вводите номер карты на сайте по ссылке из SMS или письма.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Банк проверяет, что это действительно вы. <strong>Нажмите «SMS».</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Банк присылает код по SMS. <strong>Введите 5 2 9 1 7 3.</strong> Помните: этот код вводят только на своём телефоне и никогда не сообщают тем, кто его просит.', hint: 'Введите код из сообщения: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Ваша карта готова. Теперь заплатим в магазине. <strong>Нажмите на карту в любом месте.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'На кассе <strong>дважды нажмите боковую кнопку</strong> на iPhone (здесь дважды нажмите ⟦power⟧), посмотрите на экран для Face ID, затем поднесите верхнюю часть телефона к терминалу.', hint: 'Дважды нажмите кнопку ⟦power⟧ сбоку.'}
            : {target: 'pay-now', say: 'На кассе просто <strong>разблокируйте телефон и поднесите его заднюю сторону к терминалу</strong>. Здесь <strong>нажмите на терминал</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Безопасно ли платить телефоном?', options: [
            {t: 'Да, безопаснее карты: нужно лицо, отпечаток пальца или код-пароль, а магазины не видят номер вашей карты', ok: true, why: 'Верно. А если вы потеряете телефон, никто не сможет заплатить им, не разблокировав его.'},
            {t: 'Нет, им может воспользоваться кто угодно', why: 'Для каждого платежа нужно лицо, отпечаток пальца или код-пароль, так что это даже безопаснее бесконтактной карты.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Отлично!</strong> Ваша карта теперь в телефоне, и вы совершили тренировочный платёж.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>ДЕБЕТОВАЯ</small></div>', '<small>ДЕБЕТОВАЯ</small></div></button>');
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
            return app(p, 'Учебные поезда', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Выберите станцию'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Добавить карту Railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Выберите станцию</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Добавить карту Railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Без карты Railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Без пересадок'], ['t-1145', '11:45', '12:32', 'Без пересадок'], ['t-1245', '12:45', '13:32', 'Без пересадок']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Цены выдуманы для этой тренировки. Скидка по карте Railcard применена.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Билет в одну сторону вне часа пик</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Билет туда и обратно на день вне часа пик</strong><small>Вернуться сегодня</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Ваш билет', `<div class="adt"><strong>Билет туда и обратно на день вне часа пик</strong><span>Bridlington ⇄ Hull</span><span>Сегодня · Senior Railcard</span>
            ${UI.qr}<small>Отсканируйте его у турникета на платформе или покажите проводнику.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Поезда', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Приложения для поездов позволяют покупать билеты на телефоне без очереди. (Это учебное приложение понарошку: цены и время выдуманы.) <strong>Откройте «Поезда».</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Вы едете из Bridlington. <strong>Нажмите «Куда»</strong>, чтобы выбрать, куда вы едете.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Нажмите Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Вам больше 60? <strong>Senior Railcard</strong> даёт скидку в треть на большинство билетов. <strong>Нажмите «Railcard»</strong>, чтобы добавить свою.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Нажмите Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Нажмите «Найти поезда».</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Вот поезда. <strong>Нажмите на 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Возвращаетесь сегодня? Билет туда и обратно на день обычно дешевле двух билетов в одну сторону. <strong>Нажмите «Билет туда и обратно на день вне часа пик»</strong>, затем оплатите.',
         hints: {single: 'Билет в одну сторону — только в одну сторону. Вы возвращаетесь сегодня, поэтому нажмите «Билет туда и обратно на день вне часа пик».', pay: 'Сначала выберите билет: нажмите «Билет туда и обратно на день вне часа пик».'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Нажмите ${p === 'ios' ? 'Оплатить' : 'G Pay'}</strong>, чтобы оплатить картой из вашего телефона (из урока про бесконтактную оплату).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Батарея телефона почти села, а вам ещё ехать домой на поезде. Что хорошо бы сделать?', options: [
            {t: 'Сделать снимок экрана с билетом и включить режим экономии заряда', ok: true, why: 'Да. Некоторые билеты принимают по снимку экрана, а экономия заряда поможет телефону продержаться. Во многих приложениях билет можно также добавить в Wallet.'},
            {t: 'Ничего, всё будет нормально', why: 'Если телефон разрядится, билет показать не получится. Сделайте снимок экрана и экономьте заряд.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Отлично!</strong> Вы спланировали поездку, добавили карту Railcard и купили билет на телефоне.'},
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

    const busTable = `<div class="sj"><strong>Автобус 121: Bridlington – Hull</strong><small>Время только для тренировки</small>
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
        return app(p, 'Расписание автобусов', busTable, {back: false, color: '#fff',
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
            ? 'Снимок экрана — это фото того, что сейчас на экране, например этого расписания автобусов. Одновременно нажмите <strong>боковую кнопку</strong> (справа) и <strong>кнопку увеличения громкости</strong> (слева), затем отпустите. Здесь <strong>нажмите боковую кнопку, затем кнопку увеличения громкости</strong>.'
            : 'Снимок экрана — это фото того, что сейчас на экране, например этого расписания автобусов. Одновременно нажмите <strong>кнопку питания</strong> и <strong>кнопку уменьшения громкости</strong>, затем отпустите. Здесь <strong>нажмите кнопку питания, затем кнопку уменьшения громкости</strong>.',
         hints: {'vol-down': p === 'ios' ? 'На iPhone это громкость ВВЕРХ вместе с боковой кнопкой.' : 'Начните с кнопки питания, она вверху на правой стороне.',
                 'vol-up': p === 'ios' ? 'Начните с боковой кнопки справа.' : 'На Android это громкость ВНИЗ вместе с кнопкой питания.',
                 side: 'Теперь кнопка увеличения громкости, слева.', power: 'Теперь кнопка уменьшения громкости.'},
         hint: p === 'ios' ? 'Боковая кнопка на правом краю. Кнопка увеличения громкости слева.' : 'Кнопка питания — верхняя кнопка на правом краю.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Щёлк! В нижнем углу появляется маленькая картинка. <strong>Нажмите на неё</strong>, чтобы увидеть снимок экрана. <em>Если оставить её, снимок сохранится сам через несколько секунд.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Здесь на снимке можно рисовать или обрезать его. <strong>Нажмите «Готово»</strong> вверху слева.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Нажмите «Сохранить в Фото».</strong>', hints: {'delete-shot': 'Так снимок будет удалён. Нажмите «Сохранить в Фото».', 'save-files': 'В «Файлы» тоже можно, но в «Фото» искать проще. Нажмите «Сохранить в Фото».'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Щёлк! Появляется маленькая картинка с кнопками под ней. Снимок уже сохранён. <strong>Нажмите «Поделиться»</strong>, чтобы отправить его кому-нибудь.', hints: {'shot-edit': '«Изменить» позволяет обрезать снимок или рисовать на нём. Сейчас нажмите «Поделиться».'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Нажмите Sarah</strong>, чтобы отправить ей расписание автобусов.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Где потом найти снимки экрана?', options: [
            {t: 'В приложении «Фото», в альбоме «Снимки экрана»', ok: true, why: 'Да. Они сохраняются вместе с фото, поэтому их можно смотреть, отправлять и удалять, как любое фото.'},
            {t: 'Они исчезают через день', why: 'Они хранятся, пока вы их не удалите. Ищите в приложении «Фото», в альбоме «Снимки экрана».'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Отлично!</strong> Снимки экрана удобны для расписаний автобусов, билетов, сообщений об ошибках и всего, что хочется сохранить или показать. Когда снимок станет не нужен, удалите его из «Фото».'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Поиск по Картам'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah прислала вам адрес в сообщении. Если его скопировать, не придётся набирать заново. <strong>Откройте «Сообщения».</strong>'},
        {screen: () => app(p, 'Сообщения', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Нажмите на сообщение Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Нажмите на сообщение с адресом и удерживайте</strong> (держите палец на нём секунду-две), пока не появится меню.', hint: 'Держите палец на втором сообщении, пока не появится меню.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Нажмите «Скопировать».</strong> Теперь телефон запомнил этот текст и его можно вставить в другое место.',
         hints: {reply: '«Ответить» начнёт сообщение. Нажмите «Скопировать».', forward: '«Переслать» отправляет сообщение кому-то. Нажмите «Скопировать».'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Скопировано! Теперь перейдите на главный экран. Здесь <strong>нажмите на полоску внизу экрана</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Откройте «Карты»</strong>, чтобы найти адрес.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Нажмите на поле поиска и удерживайте</strong>, пока не появится маленькая кнопка «Вставить».', hint: 'Держите палец на поле поиска вверху.',
         hints: {'search-tap': 'Короткое нажатие открывает клавиатуру. Вместо этого нажмите и удерживайте, пока не появится «Вставить».'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Нажмите «Вставить».</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Весь адрес появился без набора текста. <strong>Нажмите на результат.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Вам нужно скопировать только номер телефона из середины длинного сообщения. Как это сделать?', options: [
            {t: 'Нажать и удерживать, затем нажать «Выбрать» (или перетащить маленькие маркеры), чтобы выделить нужный кусок, затем «Скопировать»', ok: true,
             why: 'Да. Перетащите маркеры по обе стороны выделенных слов, чтобы выбрать ровно то, что нужно.'},
            {t: 'Можно скопировать только сообщение целиком', why: 'Можно выбрать и часть: нажмите и удерживайте, нажмите «Выбрать» и перетащите маленькие маркеры.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Отлично!</strong> Копирование и вставка работают почти везде: в сообщениях, письмах, на веб-страницах и в формах. Нажмите и удерживайте, чтобы скопировать; нажмите и удерживайте, чтобы вставить.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Хранилище'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Хранилище iPhone', [{caption: 'РЕКОМЕНДАЦИИ'},
                ctx.offloaded ? {label: 'Сгружать неиспользуемые', value: 'Включено ⟦check⟧'} : {id: 'offload', label: 'Сгружать неиспользуемые', sub: 'Освободит 2,1 ГБ. Удаляет приложения, которыми вы не пользуетесь, но сохраняет их данные.', value: 'Включить'},
                {caption: 'ПРИЛОЖЕНИЯ'}, {label: 'Фото', value: '21,3 ГБ'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 ГБ' : '14,8 ГБ'}, {label: 'Facebook', value: '2,4 ГБ'}, {label: 'BBC iPlayer', value: '1,9 ГБ'}],
            {back: 'Основные', top: bar});
        }
        return list(p, 'Хранилище', [{label: 'Фото и видео', value: '21,3 ГБ'}, {label: 'Приложения', value: ctx.cleaned ? '18,4 ГБ' : '25,2 ГБ', sub: 'Включая WhatsApp'}, {label: 'Документы и прочее', value: '4,1 ГБ'},
            {label: 'Система', value: '7,6 ГБ'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ Очищено 1,1 ГБ ненужных файлов</p>' : '<button type="button" class="ce dk" data-tap="free-up">Освободить место</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Настройки', `<div class="fo">${[['account', 'Аккаунт'], ['privacy', 'Конфиденциальность'], ['chats', 'Чаты'], ['notifications', 'Уведомления'], ['storage', 'Хранилище и данные'], ['help', 'Справка']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Хранилище и данные', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 ГБ' : '14,8 ГБ'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Управление хранилищем', `<div class="iq"><span>WhatsApp занимает ${ctx.cleaned ? '7.6' : '14.8'} ГБ</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Больше 5 МБ</strong><small>Нечего проверять</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Пересланные много раз</strong><small>112 объектов · 0,9 ГБ</small></div>
                <div class="he">ЧАТЫ</div><div class="ck"><strong>Семья</strong><small>3,1 ГБ</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 ГБ</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} МБ</small></span>`).join('');
        return app(p, 'Больше 5 МБ', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Удалить 23 объекта?', 'Они будут удалены из WhatsApp. Фото, уже сохранённые в галерее телефона, там останутся.', [['cancel', 'Отмена'], ['confirm-delete', 'Удалить']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Видите сообщение «Память почти заполнена»? Давайте выясним, что занимает место. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Нажмите «Основные».</strong>'},
            {screen: () => list(p, 'Основные', [{id: 'about', label: 'Об этом устройстве'}, {id: 'update', label: 'Обновление ПО'}, {id: 'storage', label: 'Хранилище iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN и управление устройством'}], {back: 'Настройки'}),
             target: 'storage', say: '<strong>Нажмите «Хранилище iPhone».</strong> Нужно несколько секунд, чтобы всё посчитать.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Цветная полоса показывает, что занимает место. Для начала быстрый результат: <strong>«Сгружать неиспользуемые»</strong> убирает приложения, которыми вы давно не пользовались, но сохраняет данные на случай, если они снова понадобятся. <strong>Нажмите «Включить».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Нажмите «Хранилище».</strong> <em>На Samsung это «Обслуживание аккумулятора и устройства», затем «Хранилище».</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Цветная полоса показывает, что занимает место. <strong>Нажмите «Освободить место».</strong>'},
            {screen: () => app(p, 'Файлы', `<div class="ke"><strong>Удалить ненужные файлы</strong><small>1,1 ГБ временных файлов от приложений</small><button type="button" class="ce dk" data-tap="clean">Очистить</button></div>
                <div class="ke"><strong>Удалить старые снимки экрана</strong><small>214 МБ</small><span class="fd">Выбрать и освободить место</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Ненужные файлы можно спокойно удалять: это временные файлы, которые приложениям не нужны. <strong>Нажмите «Очистить».</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp занимает 14,8 ГБ. Чем он заполнен?', options: [
            {t: 'Видео и фото, которые вам присылают, особенно в группах', ok: true, why: 'Да. Каждое видео из семейного или группового чата сохраняется на вашем телефоне. WhatsApp умеет находить и удалять самые большие.'},
            {t: 'Ваши текстовые сообщения', why: 'Текст почти не занимает места. Место занимают видео и фото, которые присылают, особенно в группах.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Откройте WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'В WhatsApp нажмите <strong>«Настройки»</strong> внизу справа. Здесь он уже открыт. <strong>Нажмите «Хранилище и данные».</strong>'
                          : 'В WhatsApp нажмите <strong>три точки ⋮</strong> вверху, затем <strong>«Настройки»</strong>. Здесь он уже открыт. <strong>Нажмите «Хранилище и данные».</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Нажмите «Управление хранилищем».</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Самые большие файлы, освобождающие больше всего места, находятся вверху. <strong>Нажмите «Больше 5 МБ».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Это большие видео, которые вам прислали. Если хотите сохранить какое-то, сначала сохраните его в фото. <strong>Нажмите «Выбрать все».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Нажмите «Удалить».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Так удаляются только копии внутри WhatsApp. <strong>Нажмите «Удалить»</strong>, чтобы подтвердить.', hints: {cancel: '«Отмена» сохранит их. В этой тренировке нажмите «Удалить».'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Отлично!</strong> Вы освободили более 7 ГБ. Так стоит делать раз в несколько месяцев. Также очищайте <strong>«Недавно удалённые»</strong> в «Фото»: удалённые фото ещё 30 дней занимают место.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Мировые часы'], ['alarms', 'Будильники'], ['stopwatch', 'Секундомер'], ['timers', 'Таймеры']]
            : [['alarms', 'Будильник'], ['world', 'Часы'], ['timers', 'Таймер'], ['stopwatch', 'Секундомер']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Сегодня</small><strong>Лондон</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Австралия</small><strong>Сидней</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Таблетки')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Будильник</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Мировые часы' : 'Часы') : (p === 'ios' ? 'Будильники' : 'Будильник')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Никогда'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Будильник', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Будильник может напоминать вам принимать таблетки каждый день. <strong>Откройте приложение «Часы».</strong>', hint: 'Это чёрный значок с белым циферблатом.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Нажмите ${p === 'ios' ? 'Будильники' : 'Будильник'}</strong> в ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Нажмите +</strong>, чтобы добавить новый будильник.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'На настоящем телефоне время задают, прокручивая цифры. Здесь <strong>нажмите 08:00</strong>.', hints: {'t-07': 'Для этой тренировки выберите 08:00.', 't-09': 'Для этой тренировки выберите 08:00.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Таблетки нужны каждый день, а не один раз. <strong>Нажмите «Повтор».</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Каждый день'; }, say: '<strong>Нажмите «Каждый день».</strong>',
         hints: {never: '«Никогда» означает, что будильник сработает только один раз. Нажмите «Каждый день».', weekdays: '«По будням» пропускает выходные. Нажмите «Каждый день».'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Сначала введите название в поле «Название», например «Таблетки».',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Название подскажет, для чего этот будильник. <strong>Нажмите на поле «Название» и введите «Таблетки»</strong>, затем <strong>нажмите «Сохранить»</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Будильник звонит в 8. Вы принимаете таблетки. Какую кнопку нажать?', options: [
            {t: 'Стоп', ok: true, why: 'Да. «Стоп» выключает будильник до завтрашних 8 часов, потому что он повторяется каждый день.'},
            {t: 'Отложить', why: '«Отложить» заставит его зазвонить снова примерно через 9 минут. Пользуйтесь этим, если нужно ещё немного времени, но «Стоп» выключает его до завтра.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Отлично!</strong> Ваш будильник для таблеток теперь звонит каждое утро в 8. ' + (p === 'ios' ? 'В приложении <strong>«Здоровье»</strong> тоже есть раздел «Лекарства», который напоминает о приёме и ведёт журнал.' : 'Можно также попросить Google: «Напомни мне принимать таблетки каждый день в 8».')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Если телефон потеряется или сломается, ваши фото будут в безопасности? Давайте проверим. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Нажмите на своё имя</strong> вверху.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Личная информация'}, {id: 'security', label: 'Вход и безопасность'}, {id: 'payment', label: 'Оплата и доставка'}, {id: 'subscriptions', label: 'Подписки'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 ГБ'}, {id: 'family', label: 'Семейный доступ'}, {id: 'findmy', label: 'Локатор'}], {back: 'Настройки'}),
         target: 'icloud', say: '<strong>Нажмите iCloud.</strong> iCloud — это онлайн-хранилище Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ХРАНИЛИЩЕ: ИСПОЛЬЗОВАНО 4,2 ГБ ИЗ 5 ГБ'}, {caption: 'СОХРАНЕНО В ICLOUD'}, {id: 'photos', label: 'Фото', value: c.photoSync ? 'Вкл.' : 'Выкл.'}, {id: 'backup', label: 'Копия iCloud', value: c.backedUp ? 'Вкл.' : 'Выкл.'},
            {label: 'Контакты', value: 'Вкл.'}, {label: 'Заметки', value: 'Вкл.'}], {back: 'Apple Account'}),
         target: 'photos', say: '«Фото» и резервная копия оба <strong>выключены</strong>. Это значит, что при потере телефона фото пропадут. <strong>Нажмите «Фото».</strong>'},
        {screen: c => list(p, 'Фото', [{id: 'sync', label: 'Синхронизировать этот iPhone', toggle: !!c.photoSync, sub: 'Хранит ваши фото и видео в iCloud, чтобы они были в безопасности, если вы потеряете телефон.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Нажмите «Синхронизировать этот iPhone»</strong>, чтобы включить.'},
        {screen: c => list(p, 'Фото', [{label: 'Синхронизировать этот iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Нажмите ‹ iCloud</strong>, чтобы вернуться.'},
        {screen: c => list(p, 'iCloud', [{caption: 'ХРАНИЛИЩЕ: ИСПОЛЬЗОВАНО 4,2 ГБ ИЗ 5 ГБ'}, {caption: 'СОХРАНЕНО В ICLOUD'}, {id: 'photos', label: 'Фото', value: 'Вкл.'}, {id: 'backup', label: 'Копия iCloud', value: 'Выкл.'}], {back: 'Apple Account'}),
         target: 'backup', say: 'Теперь сохраните всё остальное: настройки, сообщения и приложения. <strong>Нажмите «Копия iCloud».</strong>'},
        {screen: c => list(p, 'Резервная копия', [{id: 'backup-toggle', label: 'Создавать копию этого iPhone', toggle: !!c.backedUp, sub: 'Автоматически создаёт копию каждую ночь, когда iPhone заряжается, заблокирован и подключён к Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Нажмите «Создавать копию этого iPhone»</strong>, чтобы включить.'},
        {screen: () => list('ios', 'Резервная копия', [{label: 'Создавать копию этого iPhone', toggle: true}, {id: 'backup-now', label: 'Создать копию сейчас', sub: 'Последняя успешная копия: никогда'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Теперь копия будет создаваться каждую ночь. Сделайте первую прямо сейчас: <strong>нажмите «Создать копию сейчас»</strong>.'},
        {screen: c => list('ios', 'Резервная копия', [{label: 'Создавать копию этого iPhone', toggle: true}, {label: c.busy ? 'Создание копии…' : 'Создать копию сейчас', sub: c.busy ? 'Осталось около 5 минут' : 'Последняя успешная копия: только что ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Приходит SMS: «Хранилище iCloud заполнено. Ваши фото будут удалены сегодня. Оплатите 99 пенсов здесь: [link]». Что вы сделаете?', options: [
            {t: 'Проигнорирую ссылку. Проверю в Настройки > ваше имя > iCloud, затем перешлю SMS на 7726', ok: true, why: 'Да. Это распространённая мошенническая схема. Apple не присылает ссылки по SMS и никогда не удаляет ваши фото таким образом. Проверьте настоящий объём хранилища в «Настройках».'},
            {t: 'Быстро заплачу, чтобы сохранить фото', why: 'Это мошенничество с целью получить данные вашей карты. Проверьте настоящее хранилище в Настройки > ваше имя > iCloud и перешлите SMS на 7726.'}]}},
        {screen: () => list('ios', 'Резервная копия', [{label: 'Создавать копию этого iPhone', toggle: true}, {label: 'Создать копию сейчас', sub: 'Последняя успешная копия: только что ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Отлично!</strong> Ваши фото и телефон сохранены в резервной копии. Бесплатные 5 ГБ быстро заполняются фотографиями; если так случится, дополнительное место (iCloud+) стоит небольшую ежемесячную плату, и покупать его нужно только в «Настройках», а не по SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Если телефон потеряется или сломается, ваши фото будут в безопасности? Давайте проверим. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Нажмите Google.</strong> Он ближе к концу списка.', hint: 'Прокрутите список вниз: Google ближе к концу.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Управление аккаунтом Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервная копия', sub: 'Выкл.'}, {id: 'autofill', label: 'Автозаполнение'}, {id: 'devices', label: 'Устройства и обмен данными'}]),
         target: 'backup', say: 'Резервное копирование: <strong>Выкл.</strong> <strong>Нажмите «Резервное копирование».</strong> <em>На Samsung: Настройки > Учётные записи и архивация.</em>'},
        {screen: c => list(p, 'Резервная копия', [{id: 'backup-toggle', label: 'Резервное копирование Google One', toggle: !!c.backedUp, sub: 'Сохраняет приложения, сообщения, историю звонков, контакты и настройки.'},
            {id: 'photos-backup', label: 'Фото и видео', sub: c.photoSync ? 'Вкл. · Google Фото' : 'Выкл. · Google Фото'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Нажмите «Резервное копирование Google One»</strong>, чтобы включить.'},
        {screen: c => list(p, 'Резервная копия', [{label: 'Резервное копирование Google One', toggle: true}, {id: 'photos-backup', label: 'Фото и видео', sub: 'Выкл. · Google Фото'}]),
         target: 'photos-backup', say: 'Фото сохраняются отдельно. <strong>Нажмите «Фото и видео».</strong>'},
        {screen: c => list(p, 'Резервная копия', [{id: 'photos-toggle', label: 'Копировать фото и видео', toggle: !!c.photoSync, sub: 'Сохраняет их в Google Фото, чтобы они были в безопасности, если вы потеряете телефон.'},
            {label: 'Качество копий', value: 'Экономия места'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Нажмите «Копировать фото и видео»</strong>, чтобы включить.'},
        {screen: () => list(p, 'Резервная копия', [{label: 'Копировать фото и видео', toggle: true}, {id: 'backup-now', label: 'Копировать сейчас', sub: 'Последняя копия: никогда'}]),
         target: 'backup-now', say: 'Теперь копирование идёт само, по Wi-Fi. Сделайте первую копию сейчас: <strong>нажмите «Копировать сейчас»</strong>.'},
        {screen: c => list(p, 'Резервная копия', [{label: 'Копировать фото и видео', toggle: true}, {label: c.busy ? 'Создание копии…' : 'Копировать сейчас', sub: c.busy ? '1,204 items left' : 'Последняя копия: только что ⟦check⟧'}]), wait: 1500,
         question: {q: 'Приходит SMS: «Хранилище Google заполнено. Ваши фото будут удалены сегодня. Оплатите 99 пенсов здесь: [link]». Что вы сделаете?', options: [
            {t: 'Проигнорирую ссылку. Проверю в Настройки > Google > Резервное копирование, затем перешлю SMS на 7726', ok: true, why: 'Да. Это распространённая мошенническая схема. Google не присылает такие ссылки по SMS. Проверьте настоящий объём хранилища в «Настройках».'},
            {t: 'Быстро заплачу, чтобы сохранить фото', why: 'Это мошенничество с целью получить данные вашей карты. Проверьте настоящее хранилище в «Настройках» и перешлите SMS на 7726.'}]}},
        {screen: () => list(p, 'Резервная копия', [{label: 'Копировать фото и видео', toggle: true}, {label: 'Копировать сейчас', sub: 'Последняя копия: только что ⟦check⟧'}]), done: true,
         say: '<strong>Отлично!</strong> Ваши фото и телефон сохранены в резервной копии. Google даёт вам 15 ГБ бесплатно; если место закончится, дополнительное стоит небольшую ежемесячную плату, и покупать его нужно только в «Настройках» или в приложении Google One, а не по SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 ПОЗДРАВЛЯЕМ! 🎉</strong><p>Вы выбраны для получения подарочного сертификата на £500!</p>
        <button type="button" class="aeb" data-tap="claim">ПОЛУЧИТЬ</button><small>Реклама</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'О приложении', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>Версия 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Открыть</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Удалить</button>
            <button type="button" data-tap="force-stop">Остановить</button></div>
            <div class="cj ex"><span class="hf"><strong>Аккумулятор</strong><small>38% с момента последней полной зарядки</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Разрешения</strong><small>Отображение поверх других приложений, Администратор устройства</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'Удалить это приложение?', [['cancel', 'Отмена'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>КАЛЕНДАРЬ · сейчас</strong>
            <span>⚠️ Ваш iPhone может быть заражён! Нажмите здесь, чтобы очистить его сейчас.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'На главном экране всплывает реклама, хотя ни одно приложение не открыто. Обычно это значит, что туда пробралось вредное приложение. Сначала <strong>не нажимайте на рекламу. Нажмите на маленький ⟦x⟧, чтобы её закрыть.</strong>',
         hints: {claim: 'Никогда не нажимайте на саму рекламу. Ищите маленький ⟦x⟧ в углу.'}, hint: 'Маленький ⟦x⟧ находится в правом верхнем углу рекламы.'},
        {screen: () => home(p), target: 'settings', say: 'Вредные приложения работают постоянно и потому расходуют много заряда. По этому признаку их и находят. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Нажмите «Аккумулятор».</strong> <em>На Samsung это «Обслуживание аккумулятора и устройства», затем «Аккумулятор».</em>'},
        {screen: () => list(p, 'Аккумулятор', [{id: 'usage', label: 'Использование заряда', sub: 'Показать расход с последней полной зарядки'}, {label: 'Экономия заряда', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Нажмите «Использование заряда».</strong> <em>На некоторых Samsung нажмите на график или «Подробнее».</em>'},
        {screen: () => list(p, 'Использование заряда', [], {top: `<div class="nl">${[['System Service', 38], ['Экран', 21], ['WhatsApp', 12], ['YouTube', 8], ['Камера', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Что из этого выглядит подозрительно?', options: [
            {t: 'System Service: вы им никогда не пользовались, а он расходует больше всего заряда', ok: true, why: 'Да. Вредные приложения дают себе скучные названия вроде «System Service» или «Keyboard Settings», чтобы вы их не заметили. Запомните его название.'},
            {t: 'Экран', why: 'Экран всегда расходует много заряда, это нормально. Подозрителен «System Service», которым вы никогда не пользовались.'},
            {t: 'WhatsApp', why: 'WhatsApp вы пользуетесь, так что это нормально. Подозрителен «System Service».'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Теперь найдём его среди ваших приложений. Вернувшись в «Настройки», <strong>нажмите «Приложения»</strong>.'},
        {screen: () => list(p, 'Приложения', [{caption: 'Недавно открытые приложения'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Показать все приложения (46)'}, {id: 'default-apps', label: 'Приложения по умолчанию'}]),
         target: 'all-apps', say: '<strong>Нажмите «Показать все приложения».</strong>'},
        {screen: () => list(p, 'Все приложения', ['Калькулятор', 'Календарь', 'Камера', 'Chrome', 'Часы', 'Контакты', 'Gmail', 'Карты'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Список идёт по алфавиту. <strong>Нажмите System Service.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Кнопка <strong>«Удалить»</strong> серая и недоступна. Вредные приложения так делают, чтобы вы не смогли их убрать. Сначала <strong>нажмите «Остановить»</strong>, чтобы оно перестало работать.',
         hints: {uninstall: 'Она серая, поэтому пока не сработает. Сначала нажмите «Остановить».', open: 'Не открывайте его. Нажмите «Остановить».'}},
        {screen: () => list(p, 'Поиск настроек', [{caption: 'Результаты по запросу «администратор устройства»'}, {id: 'device-admin', label: 'Приложения администратора устройства', sub: 'Безопасность и конфиденциальность > Другие настройки безопасности'}]),
         target: 'device-admin',
         say: 'Теперь отберите у него особое разрешение. В «Настройках» <strong>найдите «администратор устройства»</strong> с помощью строки поиска вверху. Вот результат: <strong>нажмите «Приложения администратора устройства»</strong>.'},
        {screen: c => list(p, 'Приложения администратора устройства', [{label: 'Найти устройство', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Отключить это приложение администратора устройства?', 'System Service больше не сможет мешать вам удалить его.', [['cancel', 'Отмена'], ['deactivate', 'Отключить']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: '«Найти устройство» — сервис Google, он в порядке. <strong>Нажмите переключатель рядом с System Service.</strong>', hints: {'find-my': 'Оставьте «Найти устройство» включённым. Нажмите System Service.'}},
        {screen: c => list(p, 'Приложения администратора устройства', [{label: 'Найти устройство', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'Отключить это приложение администратора устройства?', 'System Service больше не сможет мешать вам удалить его.', [['cancel', 'Отмена'], ['deactivate', 'Отключить']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Нажмите «Отключить».</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Вернувшись в System Service, увидите, что <strong>«Удалить»</strong> теперь работает. <strong>Нажмите «Удалить».</strong>', hints: {'force-stop': 'Оно уже остановлено. Нажмите «Удалить».'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Нажмите OK.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Удалено! Наконец, попросите Google проверить, нет ли чего-то ещё. <strong>Откройте Play Маркет.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Вредоносных приложений не найдено' : 'Проверить телефон'}</strong>
            <small>${c.scanned ? 'Проверено только что' : 'Последняя проверка: 3 недели назад'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'В Play Маркете нажмите на <strong>фото профиля</strong> (вверху справа), затем <strong>Play Protect</strong>. Здесь он уже открыт. <strong>Нажмите «Проверить».</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Вредоносных приложений не найдено</strong><small>Проверено только что</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Отлично!</strong> Вы нашли вредное приложение по расходу заряда, отобрали у него особое разрешение, удалили его и проверили телефон. Чтобы не столкнуться с такими приложениями: устанавливайте их только из Play Маркета и остерегайтесь бесплатных фонариков, «очистителей» и «ускорителей».'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Уведомление из Календаря гласит: «Ваш iPhone может быть заражён! Нажмите здесь, чтобы очистить его сейчас». Что это?', options: [
            {t: 'Спам, который пробрался в ваш календарь. Не нажимайте на него', ok: true, why: 'Да. Если нажать «Разрешить» на сомнительном сайте, на iPhone может добавиться спам-календарь. Его «события» — это реклама, замаскированная под предупреждения. С вашим iPhone всё в порядке.'},
            {t: 'Настоящее предупреждение от Apple', why: 'Apple не присылает предупреждения о вирусах через Календарь. Это спам из календаря, на который оформлена подписка. Не нажимайте на него.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Давайте удалим спам-календарь. <strong>Нажмите «Настройки»</strong>, а не уведомление.', hints: {notif: 'Не нажимайте на предупреждение. Нажмите «Настройки».'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Прокрутите вниз и <strong>нажмите «Приложения»</strong>.', hint: '«Приложения» находятся в последней группе.'},
        {screen: () => list(p, 'Приложения', ['App Store', 'Книги'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Календарь'}, {label: 'Камера'}, {label: 'Контакты'}, {label: 'Почта'}]), {back: 'Настройки'}),
         target: 'calendar', say: '<strong>Нажмите «Календарь».</strong>'},
        {screen: () => list(p, 'Календарь', [{id: 'accounts', label: 'Учётные записи календаря', value: '2'}, {label: 'Переопределение часового пояса', value: 'Выкл.'}, {label: 'Время уведомлений по умолчанию'}], {back: 'Приложения'}),
         target: 'accounts', say: '<strong>Нажмите «Учётные записи календаря».</strong>'},
        {screen: () => list(p, 'Учётные записи календаря', [{caption: 'УЧЁТНЫЕ ЗАПИСИ'}, {label: 'iCloud', sub: 'Календари, контакты и ещё 7'}, {id: 'subscribed', label: 'Подписные календари', value: '1'}], {back: 'Календарь'}),
         target: 'subscribed', say: 'iCloud — ваш собственный. <strong>Нажмите «Подписные календари».</strong>'},
        {screen: () => list(p, 'Подписные календари', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Подписка оформлена'}], {back: 'Учётные записи календаря'}),
         target: 'spam-cal', say: 'Вот он: календарь, который вы не собирались добавлять. <strong>Нажмите Phone-Security-Alerts.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сервер', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Удалить учётную запись', danger: true}],
            {back: 'Назад', overlay: c.askDelete ? dialog(p, 'Вы уверены?', 'Календарь и его события будут удалены с вашего iPhone.', [['cancel', 'Отмена'], ['confirm-delete', 'Удалить учётную запись']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Нажмите «Удалить учётную запись».</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сервер', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Удалить учётную запись', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Вы уверены?', 'Календарь и его события будут удалены с вашего iPhone.', [['cancel', 'Отмена'], ['confirm-delete', 'Удалить учётную запись']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Нажмите «Удалить учётную запись»</strong> для подтверждения.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Удалено. Ещё одна проверка: сомнительные сайты могут также установить «профиль». <strong>Нажмите «Основные».</strong>'},
        {screen: () => list(p, 'Основные', [{id: 'about', label: 'Об этом устройстве'}, {id: 'update', label: 'Обновление ПО'}, {id: 'storage', label: 'Хранилище iPhone'}, {id: 'vpn', label: 'VPN и управление устройством'}], {back: 'Настройки'}),
         target: 'vpn', say: '<strong>Нажмите «VPN и управление устройством».</strong>'},
        {screen: c => list(p, 'VPN и управление устройством', c.profileGone ? [{label: 'VPN', value: 'Не подключено'}] : [{label: 'VPN', value: 'Не подключено'}, {caption: 'ПРОФИЛЬ КОНФИГУРАЦИИ'}, {id: 'profile', label: 'Free Phone Booster', sub: 'Не проверен'}], {back: 'Основные'}),
         target: 'profile', say: 'Если вы видите здесь незнакомый профиль (профиль с работы или из школы — это нормально), удалите его. <strong>Нажмите Free Phone Booster.</strong>'},
        {screen: c => list(p, 'Профиль', [{label: 'Free Phone Booster', sub: 'Не проверен · Содержит: веб-клипы, сертификаты'}, {caption: ' '}, {id: 'remove-profile', label: 'Удалить профиль', danger: true}],
            {back: 'Назад', overlay: c.askRemove ? dialog(p, 'Удалить профиль', 'При удалении этого профиля будут удалены все его настройки.', [['cancel', 'Отмена'], ['confirm-remove', 'Удалить']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Нажмите «Удалить профиль»</strong>. iPhone попросит ввести код-пароль.'},
        {screen: c => list(p, 'Профиль', [{label: 'Free Phone Booster', sub: 'Не проверен'}, {caption: ' '}, {label: 'Удалить профиль', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Удалить профиль', 'При удалении этого профиля будут удалены все его настройки.', [['cancel', 'Отмена'], ['confirm-remove', 'Удалить']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Нажмите «Удалить».</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Отлично!</strong> Поддельные предупреждения исчезли. Чтобы это не повторилось, на сайтах нажимайте <strong>«Не разрешать»</strong> или <strong>«Закрыть»</strong> в любом всплывающем окне с просьбой добавить календарь или профиль и устанавливайте приложения только из App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Отменена · Заканчивается 22 октября'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 в неделю · Продлевается 22 октября'};
        return list(p, 'Подписки', [{caption: p === 'ios' ? 'АКТИВНЫЕ' : 'Активна'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 в месяц' : '£1.59 в месяц'},
            {caption: p === 'ios' ? 'НЕАКТИВНЫЕ' : 'Истекла'}, {label: 'Crossword Daily', sub: 'Истекла 3 марта'}], {back: p === 'ios' ? 'Apple Account' : 'Назад'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'ВАША ПОДПИСКА' : 'Тариф'}, {label: 'Еженедельно', sub: '£4.99 в неделю. Началась с бесплатного пробного периода на 3 дня.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Отменить подписку' : 'Отменить подписку', danger: true}],
            {back: 'Подписки', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Подтвердить отмену' : 'Отменить подписку?', 'Пользоваться ею можно до 22 октября. Больше деньги списываться не будут.', [['keep', p === 'ios' ? 'Не сейчас' : 'Оставить']].concat([['confirm-cancel', p === 'ios' ? 'Подтвердить' : 'Отменить подписку']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Бесплатные пробные периоды часто незаметно превращаются в платные подписки. Давайте проверим. <strong>Нажмите «Настройки».</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Нажмите на своё имя</strong> вверху.'},
            {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Личная информация'}, {id: 'security', label: 'Вход и безопасность'}, {id: 'payment', label: 'Оплата и доставка'}, {id: 'subscriptions', label: 'Подписки'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Настройки'}),
             target: 'subscriptions', say: '<strong>Нажмите «Подписки».</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Бесплатные пробные периоды часто незаметно превращаются в платные подписки. Давайте проверим. <strong>Откройте Play Маркет.</strong>'},
            {screen: c => app(p, 'Play Маркет', `<div class="hp"><span>РЕКОМЕНДУЕМ ВАМ</span><strong>Приложения для начала</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Нажмите на фото профиля</strong>, круглую букву вверху справа.'},
            {screen: c => app(p, 'Play Маркет', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Нажмите «Платежи и подписки».</strong>'},
            {screen: () => list(p, 'Платежи и подписки', [{id: 'methods', label: 'Способы оплаты'}, {id: 'subscriptions', label: 'Подписки', sub: 'Управление подписками'}, {id: 'budget', label: 'Бюджет и история'}]),
             target: 'subscriptions', say: '<strong>Нажмите «Подписки».</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '«Photo Editor Pro» начался с бесплатного пробного периода, а теперь стоит <strong>£4.99 каждую неделю</strong>. Это более £250 в год! <strong>Нажмите на него.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Отменить подписку' : 'Отменить подписку'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Подтвердить' : 'Отменить подписку'}.</strong>`, hints: {keep: 'Так платежи продолжатся. Нажмите ' + (p === 'ios' ? 'Подтвердить' : 'Отменить подписку') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Вы удалили приложение Photo Editor с телефона. Остановит ли это платежи?', options: [
            {t: 'Нет. Нужно отменить подписку, как вы только что сделали', ok: true, why: 'Верно. Удаление приложения НЕ отменяет подписку. Вы продолжаете платить, пока не отмените её здесь.'},
            {t: 'Да, удаление приложения всё остановит', why: 'Нет! Вы продолжаете платить, пока не отмените саму подписку здесь.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Отлично!</strong> Вы сэкономили £4.99 в неделю. Совет: когда начинаете бесплатный пробный период, поставьте будильник на день до его окончания. Также время от времени проверяйте в банковском приложении список регулярных платежей.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'В новых iPhone есть <strong>Apple Intelligence</strong>: ИИ, который пишет, делает краткие изложения и редактирует за вас. Его можно отключить. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Нажмите «Apple Intelligence и Siri».</strong>', hint: 'Он в третьей группе, под пунктом «Универсальный доступ».'},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Инструменты письма, краткие изложения уведомлений, Image Playground и другое.'},
            {caption: 'РАСШИРЕНИЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Выкл.' : 'Вкл.'}, {caption: 'SIRI'}, {label: 'Разговор с Siri', value: '«Siri» или «Привет, Siri»'}],
            {back: 'Настройки', overlay: c.askOff ? dialog(p, 'Выключить Apple Intelligence?', 'Такие функции, как инструменты письма и краткие изложения, перестанут быть доступны.', [['cancel', 'Отмена'], ['confirm-off', 'Выключить']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Нажмите переключатель Apple Intelligence</strong>, чтобы выключить.', hints: {chatgpt: 'Расширением ChatGPT займёмся дальше. Сначала нажмите переключатель Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'РАСШИРЕНИЯ'}, {label: 'ChatGPT', value: 'Вкл.'}],
            {back: 'Настройки', overlay: dialog(p, 'Выключить Apple Intelligence?', 'Такие функции, как инструменты письма и краткие изложения, перестанут быть доступны.', [['cancel', 'Отмена'], ['confirm-off', 'Выключить']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Нажмите «Выключить».</strong>'},
        {screen: c => list(p, 'Apple Intelligence и Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'РАСШИРЕНИЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Вкл.'}], {back: 'Настройки'}),
         target: 'chatgpt', say: 'Расширение ChatGPT может отправлять ваши вопросы в ChatGPT, компанию за пределами Apple. <strong>Нажмите ChatGPT.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Использовать ChatGPT', toggle: !c.gptOff, sub: 'Siri может отправлять запросы в ChatGPT.'}], {back: 'Назад'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Нажмите «Использовать ChatGPT»</strong>, чтобы выключить.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Использовать ChatGPT', toggle: false}], {back: 'Назад'}),
         question: {q: 'В WhatsApp, Facebook и других приложениях тоже есть ИИ-чаты. Каково безопасное правило?', options: [
            {t: 'Никогда не вводить личные данные (банк, здоровье, пароли, адреса) ни в один ИИ-чат', ok: true, why: 'Да. То, что вы вводите, может сохраняться и использоваться для обучения ИИ. Относитесь к этому как к разговору с незнакомцем.'},
            {t: 'ИИ-чаты частные, поэтому можно писать что угодно', why: 'Они не частные, как телефонный разговор. То, что вы вводите, может сохраняться. Не вводите туда личные данные.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Использовать ChatGPT', toggle: false}], {back: 'Назад'}), done: true,
         say: '<strong>Отлично!</strong> Apple Intelligence и ChatGPT выключены. Включить их снова можно в любой момент там же. Siri по-прежнему работает как обычно.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Теперь в телефонах Android есть <strong>Gemini</strong>, ИИ от Google. Удержание кнопки питания может случайно его открыть. Давайте это изменим. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Нажмите «Приложения».</strong>'},
        {screen: () => list(p, 'Приложения', [{caption: 'Недавно открытые приложения'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Показать все приложения (45)'}, {id: 'default-apps', label: 'Приложения по умолчанию', sub: 'Помощник, браузер и приложения телефона'}]),
         target: 'default-apps', say: '<strong>Нажмите «Приложения по умолчанию».</strong>'},
        {screen: () => list(p, 'Приложения по умолчанию', [{label: 'Приложение браузера', sub: 'Chrome'}, {id: 'assistant', label: 'Приложение цифрового помощника', sub: 'Gemini'}, {label: 'Приложение телефона', sub: 'Телефон'}, {label: 'Приложение для SMS', sub: 'Сообщения'}]),
         target: 'assistant', say: '<strong>Нажмите «Приложение цифрового помощника».</strong>'},
        {screen: c => list(p, 'Приложение цифрового помощника', [{id: 'assistant-app', label: 'Приложение цифрового помощника по умолчанию', sub: c.noAssist ? 'Нет' : 'Gemini'}, {label: 'Использовать текст с экрана', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Приложение цифрового помощника по умолчанию</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Нет</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Нажмите «Приложение цифрового помощника по умолчанию».</strong>'},
        {screen: c => list(p, 'Приложение цифрового помощника', [{label: 'Приложение цифрового помощника по умолчанию', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Приложение цифрового помощника по умолчанию</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Нет</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Нажмите «Нет».</strong> Gemini больше не будет всплывать при удержании кнопки питания.', hints: {'assist-gemini': 'Так Gemini останется. Нажмите «Нет».'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Теперь сделайте так, чтобы Gemini не хранил то, что вы ему пишете. <strong>Откройте приложение Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Здравствуйте, Margaret<br><small>Чем могу помочь сегодня?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Нажмите на фото профиля</strong> вверху справа.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Нажмите «История приложений Gemini».</strong> <em>На некоторых телефонах она называется «Сохранять историю».</em>'},
        {screen: c => app(p, 'История приложений Gemini', `<p class="cf"><strong>${c.actOff ? 'Выкл.' : 'Вкл.'}</strong><br>${c.actOff ? 'Ваши чаты больше не сохраняются в аккаунте и не используются для улучшения ИИ Google.' : 'Ваши чаты сохраняются в аккаунте Google и могут просматриваться для улучшения ИИ Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Отключить</button><button type="button" class="cj" data-tap="off-delete">Отключить и удалить историю</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Нажмите «Отключить».</strong>'},
        {screen: c => app(p, 'История приложений Gemini', '<p class="cf"><strong>Вкл.</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Отключить</button><button type="button" class="cj" data-tap="off-delete">Отключить и удалить историю</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Нажмите «Отключить и удалить историю»</strong>, чтобы стереть и то, что уже сохранилось.', hints: {'off-only': 'Так новые чаты перестанут сохраняться, но старые останутся. Нажмите «Отключить и удалить историю».'}},
        {screen: c => app(p, 'История приложений Gemini', '<p class="cf"><strong>Выкл.</strong></p>', {color: '#fff'}),
         question: {q: 'В WhatsApp, Facebook и других приложениях тоже есть ИИ-чаты. Каково безопасное правило?', options: [
            {t: 'Никогда не вводить личные данные (банк, здоровье, пароли, адреса) ни в один ИИ-чат', ok: true, why: 'Да. То, что вы вводите, может сохраняться и использоваться для обучения ИИ. Относитесь к этому как к разговору с незнакомцем.'},
            {t: 'ИИ-чаты частные, поэтому можно писать что угодно', why: 'Они не частные, как телефонный разговор. То, что вы вводите, может сохраняться. Не вводите туда личные данные.'}]}},
        {screen: c => app(p, 'История приложений Gemini', '<p class="cf"><strong>Выкл.</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Отлично!</strong> Gemini больше не всплывает от кнопки питания и не хранит ваши чаты. На Samsung загляните также в <strong>Настройки > Galaxy AI</strong>: у каждой функции там свой переключатель.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'В вашем Apple Account хранятся фото, контакты и платёжные данные. Давайте проверим, что он защищён. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Нажмите на своё имя</strong> вверху.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Личная информация'}, {id: 'security', label: 'Вход и безопасность'}, {id: 'payment', label: 'Оплата и доставка'}, {id: 'subscriptions', label: 'Подписки'}], {back: 'Настройки'}),
         target: 'security', say: '<strong>Нажмите «Вход и безопасность».</strong>'},
        {screen: () => list(p, 'Вход и безопасность', [{label: 'Электронная почта и номера телефонов', sub: '+44 7700 900123'}, {label: 'Изменить пароль'}, {caption: ' '}, {label: 'Двухфакторная аутентификация', value: 'Вкл.'},
            {id: 'recovery', label: 'Восстановление учётной записи'}], {back: 'Apple Account'}),
         target: 'recovery', say: '<strong>Двухфакторная аутентификация</strong>: вкл. Это хорошо: новому устройству для входа понадобится код с вашего телефона. Теперь <strong>нажмите «Восстановление учётной записи»</strong>.'},
        {screen: c => list(p, 'Восстановление учётной записи', [{caption: 'КОНТАКТ ДЛЯ ВОССТАНОВЛЕНИЯ'}, c.recovery ? {label: 'Sarah', sub: 'Ожидание подтверждения от Sarah'} : {id: 'add-contact', label: 'Добавить контакт для восстановления…', sub: 'Человек, которому вы доверяете и который сможет помочь вам вернуть доступ к учётной записи.'}],
            {back: 'Назад', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Выберите контакт для восстановления</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (дочь)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Если вы когда-нибудь забудете пароль, <strong>контакт для восстановления</strong> сможет получить для вас код, чтобы помочь вернуть доступ. Ваших данных он не увидит. <strong>Нажмите «Добавить контакт для восстановления».</strong>'},
        {screen: c => list(p, 'Восстановление учётной записи', [{caption: 'КОНТАКТ ДЛЯ ВОССТАНОВЛЕНИЯ'}, {label: 'Добавить контакт для восстановления…'}],
            {back: 'Назад', overlay: `<div class="ei"><div class="cv"><p><strong>Выберите контакт для восстановления</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (дочь)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Выберите человека, которому доверяете и у которого есть iPhone. <strong>Нажмите Sarah.</strong>', hints: {'pick-dave': 'Для этой тренировки выберите Sarah.'}},
        {screen: c => list(p, 'Восстановление учётной записи', [{caption: 'КОНТАКТ ДЛЯ ВОССТАНОВЛЕНИЯ'}, {label: 'Sarah', sub: 'Ожидание подтверждения от Sarah'}], {back: 'Назад'}),
         question: {q: 'Кто-то звонит и говорит, что он из Apple. Он просит продиктовать 6-значный код, который только что появился на вашем телефоне. Что вы сделаете?', options: [
            {t: 'Положу трубку. Этот код никому нельзя сообщать', ok: true, why: 'Верно. Этот код впускает человека в вашу учётную запись. Apple никогда не позвонит с просьбой назвать его.'},
            {t: 'Продиктую, это же Apple', why: 'Apple никогда не спросит этот код. Тот, у кого он есть, может войти в вашу учётную запись. Положите трубку.'}]}},
        {screen: c => list(p, 'Восстановление учётной записи', [{caption: 'КОНТАКТ ДЛЯ ВОССТАНОВЛЕНИЯ'}, {label: 'Sarah', sub: 'Ожидание подтверждения от Sarah'}], {back: 'Назад'}), done: true,
         say: '<strong>Отлично!</strong> Двухфакторная аутентификация включена, и Sarah сможет помочь вам вернуть доступ. iPhone может также запоминать пароли за вас в приложении <strong>«Пароли»</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'В вашем аккаунте Google хранятся письма, фото и контакты. Добавим ему второй замок. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Нажмите Google.</strong>', hint: 'Google находится ближе к концу списка.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Управление аккаунтом Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервная копия'}, {id: 'autofill', label: 'Автозаполнение'}]),
         target: 'manage', say: '<strong>Нажмите «Управление аккаунтом Google».</strong>'},
        {screen: () => app(p, 'Аккаунт Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Нажмите «Безопасность»</strong> вверху.'},
        {screen: c => list(p, 'Безопасность', [{caption: 'Как вы входите в Google'}, {id: '2sv', label: 'Двухэтапная аутентификация', sub: c.twoOn ? 'Вкл.' : 'Выкл.'}, {label: 'Пароль', sub: 'Изменено 2 года назад'}, {label: 'Телефон для восстановления', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Двухэтапная аутентификация</strong>: выкл. Она означает, что для входа на новом устройстве нужен ещё и код, отправленный на ваш телефон, поэтому украденного пароля недостаточно. <strong>Нажмите на неё.</strong>'},
        {screen: () => list(p, 'Двухэтапная аутентификация', [], {top: '<p class="cf">Ваш номер телефона: <strong>07700 900123</strong><br>Мы отправим на этот номер SMS с кодом, чтобы проверить, что он ваш.</p><button type="button" class="ce dk" data-tap="send-code">Отправить код</button>'}),
         target: 'send-code', say: '<strong>Нажмите «Отправить код».</strong>'},
        {screen: c => list(p, 'Двухэтапная аутентификация', [], {top: `<div class="sd"><strong>СООБЩЕНИЯ · сейчас</strong><span>G-382605 — ваш код подтверждения Google.</span></div>
            <p class="cf">Введите код, отправленный по SMS на 07700 900123</p>${field('gcode', 'Введите код', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Далее</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Введите 6 цифр из SMS: 382605.',
         say: 'Приходит SMS с кодом. <strong>Введите 382605 в поле</strong> и <strong>нажмите «Далее»</strong>. <em>(Это тренировочный код. Настоящие коды вводите только там, где вы сами их запросили.)</em>'},
        {screen: () => list(p, 'Двухэтапная аутентификация', [], {top: '<p class="cf">Ваш номер телефона проверен ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Включить двухэтапную аутентификацию</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Нажмите «Включить двухэтапную аутентификацию».</strong>'},
        {screen: c => list(p, 'Безопасность', [{caption: 'Как вы входите в Google'}, {label: 'Двухэтапная аутентификация', sub: 'Вкл. ⟦check⟧'}, {label: 'Телефон для восстановления', sub: '07700 900123'}]),
         question: {q: 'Кто-то звонит и говорит, что он из Google. Он просит продиктовать код, который вам только что пришёл по SMS. Что вы сделаете?', options: [
            {t: 'Положу трубку. Этот код никому нельзя сообщать', ok: true, why: 'Верно. Этот код впускает человека в ваш аккаунт. Google никогда не позвонит с просьбой назвать его.'},
            {t: 'Продиктую, это же Google', why: 'Google никогда не спросит этот код. Тот, у кого он есть, может войти в ваш аккаунт. Положите трубку.'}]}},
        {screen: c => list(p, 'Безопасность', [{caption: 'Как вы входите в Google'}, {label: 'Двухэтапная аутентификация', sub: 'Вкл. ⟦check⟧'}]), done: true,
         say: '<strong>Отлично!</strong> Теперь для входа в аккаунт Google нужен не только пароль, но и ваш телефон. Google также может запоминать ваши пароли: найдите <strong>Google Password Manager</strong> в настройках.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Чудесная прогулка по набережной сегодня утром! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Следующая прогулка: суббота, 10:00, от гавани.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Новых запросов в друзья нет.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Посмотреть профиль</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Настройки и конфиденциальность</strong></button><div class="ck"><strong>Помощь и поддержка</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Давайте убедимся, что то, что вы публикуете, видят только друзья. <strong>Откройте Facebook.</strong> <em>(Это учебная версия, а не настоящее приложение.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Нажмите «Меню»</strong> внизу справа.', hints: {'tab-friends': 'Запросами в друзья займёмся чуть позже. Сначала нажмите «Меню».'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Нажмите «Настройки и конфиденциальность»</strong>.'},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимость'}, {id: 'posts', label: 'Публикации', sub: 'Кто может видеть ваши будущие публикации: ' + (c.audience || 'Все')}, {label: 'Данные профиля'}, {label: 'Как люди находят вас и связываются с вами'},
            {caption: 'Ваши действия'}, {label: 'Журнал действий'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Кто может видеть ваши будущие публикации?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Все<small>Любой человек на Facebook и вне его</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Друзья<small>Ваши друзья на Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Только я</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Ваши публикации открыты для <strong>всех</strong>: их может увидеть любой человек в мире. <strong>Нажмите «Публикации».</strong>'},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимость'}, {label: 'Публикации', sub: 'Кто может видеть ваши будущие публикации: Все'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Кто может видеть ваши будущие публикации?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Все<small>Любой человек на Facebook и вне его</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Друзья<small>Ваши друзья на Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Только я</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Друзья'; }, say: '<strong>Нажмите «Друзья».</strong>',
         hints: {'aud-public': '«Все» — это как было. Нажмите «Друзья».', 'aud-me': '«Только я» значит, что никто другой не увидит ваши публикации. Нажмите «Друзья».'}},
        {screen: c => list(p, 'Настройки', [{caption: 'Аудитория и видимость'}, {label: 'Публикации', sub: 'Кто может видеть ваши будущие публикации: Друзья ⟦check⟧'}, {id: 'back-feed', label: '‹ Назад в Facebook'}]),
         target: 'back-feed', say: 'Готово. Теперь <strong>нажмите «Назад в Facebook»</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'У вас запрос в друзья. <strong>Нажмите «Друзья».</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Запрос в друзья от «Jean Smith». Но вы с Jean уже друзья (она есть в вашей ленте). Что происходит?', options: [
            {t: 'Скорее всего, это копия профиля Jean, созданная мошенником', ok: true, why: 'Да. Мошенники копируют чьё-то имя и фото, а потом пишут друзьям этого человека и просят денег. Настоящая Jean уже у вас в друзьях.'},
            {t: 'У Jean, должно быть, второй аккаунт', why: 'Возможно, но гораздо вероятнее, что это копия, созданная мошенником: ей 2 дня. Уточните у Jean по телефону.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Нажмите «Удалить»</strong>, чтобы отклонить запрос.', hints: {'confirm-jean': 'Не подтверждайте скопированный профиль. Нажмите «Удалить».'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Отлично!</strong> Ваши публикации теперь только для друзей, и вы избежали поддельного профиля. Сообщите Jean, чтобы она могла пожаловаться. Также остерегайтесь покупателей на Marketplace, которые хотят заплатить «через курьера» или просят коды, присланные на ваш телефон.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Искать здесь'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Автовокзал и железнодорожная станция, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Больница, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Церковь, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Автовокзал и железнодорожная станция · 25 миль</small><button type="button" class="ce co" data-tap="directions">Маршрут</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 мин (25 миль)</strong><small>Самый быстрый маршрут, по A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Идите 4 мин до <strong>Bridlington Bus Station</strong>, платформа 3</li>
                <li>⟦bus⟧ <strong>121</strong> в сторону Hull · 10:15 · <b class="ahy">По расписанию</b></li><li>Выйдите на <strong>Hull Paragon Interchange</strong> (24 остановки)</li></ol>
                <button type="button" class="ce co" data-tap="start">Начать</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: '«Карты» умеют планировать поездку на автобусе с данными о движении в реальном времени. Давайте поедем в Hull на автобусе. <strong>Откройте «Карты».</strong>' + (p === 'ios' ? ' <em>(Google Maps работает так же, если вам больше нравится он.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Нажмите на строку поиска</strong> вверху.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Мы ввели «Hull interchange». <strong>Нажмите Hull Paragon Interchange</strong>, автовокзал.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Нажмите «Маршрут».</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Сначала показан маршрут на машине. <strong>Нажмите на автобус</strong> ⟦bus⟧, чтобы увидеть общественный транспорт.', hints: {'mode-walk': 'Восемь часов! Нажмите лучше на автобус.', 'mode-car': 'Это маршрут на машине. Нажмите на автобус.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Вот автобусы, ближайший первым. «По расписанию» — данные в реальном времени. <strong>Нажмите на 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Где вы садитесь на автобус?', options: [
            {t: 'Bridlington Bus Station, платформа 3', ok: true, why: 'Да. «Карты» подсказывают, куда идти пешком, какой автобус взять и где выйти.'},
            {t: 'Hull Paragon Interchange', why: 'Это место, где вы выходите. Садитесь вы на Bridlington Bus Station, платформа 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Отлично!</strong> В настоящей поездке нажмите <strong>«Начать»</strong>, и «Карты» подскажут, когда будет ваша остановка. С проездным просто покажите его водителю, как обычно. <em>(Время только для тренировки: проверяйте настоящее в день поездки.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Экстренный вызов — SOS</strong> звонит за вас на 999 и отправляет SMS с вашим местоположением выбранным вами людям. Давайте проверим, что он готов. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Нажмите «Экстренный вызов — SOS».</strong>', hint: 'Он в третьей группе, с красным значком.'},
        {screen: c => list(p, 'Экстренный вызов — SOS', [{label: 'Вызов удержанием и отпусканием', toggle: true, sub: 'Удерживайте боковую кнопку и кнопку громкости, затем отпустите.'},
            {id: 'five', label: 'Вызов 5 нажатиями кнопки', toggle: !!c.five, sub: 'Быстро нажмите боковую кнопку 5 раз.'}, {caption: ' '},
            {id: 'contacts', label: 'Настроить экстренные контакты в приложении «Здоровье»'}, {label: 'Обнаружение аварии', toggle: true, sub: 'Звонит на 999 после серьёзной автомобильной аварии.'}], {back: 'Настройки'}),
         target: 'five', action: c => { c.five = true; }, say: '5 нажатий боковой кнопки легко запомнить в панике. <strong>Включите «Вызов 5 нажатиями кнопки».</strong>'},
        {screen: c => list(p, 'Экстренный вызов — SOS', [{label: 'Вызов удержанием и отпусканием', toggle: true}, {label: 'Вызов 5 нажатиями кнопки', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Настроить экстренные контакты в приложении «Здоровье»'}], {back: 'Настройки', overlay: c.pick ? sheet('Добавить экстренный контакт', [['pick-sarah', 'Sarah', 'Дочь · 07700 900333'], ['pick-dave', 'Dave', 'Друг']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Теперь выберите, кто получит SMS с вашим местоположением. <strong>Нажмите «Настроить экстренные контакты».</strong>'},
        {screen: () => list(p, 'Экстренный вызов — SOS', [{label: 'Вызов 5 нажатиями кнопки', toggle: true}], {back: 'Настройки', overlay: sheet('Добавить экстренный контакт', [['pick-sarah', 'Sarah', 'Дочь · 07700 900333'], ['pick-dave', 'Dave', 'Друг']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Нажмите Sarah</strong>, вашу дочь.', hints: {'pick-dave': 'Для этой тренировки выберите Sarah.'}},
        {screen: () => list(p, 'Экстренный вызов — SOS', [{label: 'Вызов 5 нажатиями кнопки', toggle: true}, {caption: 'ЭКСТРЕННЫЕ КОНТАКТЫ'}, {label: 'Sarah', sub: 'Дочь'}], {back: 'Настройки'}),
         question: {q: 'Вы упали и не можете нормально дотянуться до экрана телефона. Что вы сделаете?', options: [
            {t: 'Быстро нажму боковую кнопку 5 раз', ok: true, why: 'Да. Начинается обратный отсчёт, затем телефон звонит на 999 и отправляет Sarah SMS, где вы находитесь.'},
            {t: 'Разблокирую телефон и найду приложение «Телефон»', why: 'В экстренной ситуации это долго. 5 нажатий боковой кнопки срабатывают, даже когда телефон заблокирован.'}]}},
        {screen: () => list(p, 'Экстренный вызов — SOS', [{label: 'Вызов 5 нажатиями кнопки', toggle: true}, {caption: 'ЭКСТРЕННЫЕ КОНТАКТЫ'}, {label: 'Sarah', sub: 'Дочь'}], {back: 'Настройки'}), done: true,
         say: '<strong>Отлично!</strong> Экстренный вызов — SOS готов, и Sarah узнает, где вы находитесь. Если нажмёте по ошибке, просто нажмите «Стоп» во время обратного отсчёта.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Экстренный вызов — SOS</strong> звонит за вас на 999 и отправляет SMS с вашим местоположением выбранным вами людям. Давайте проверим, что он готов. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Нажмите «Безопасность и экстренные случаи».</strong> <em>На Samsung этот раздел называется так же.</em>', hint: 'Прокрутите вниз: он ближе к концу.'},
        {screen: () => list(p, 'Безопасность и экстренные случаи', [{id: 'medical', label: 'Медицинская информация'}, {id: 'contacts-ec', label: 'Экстренные контакты'}, {id: 'sos', label: 'Экстренный вызов — SOS', sub: 'Выкл.'}, {label: 'Обнаружение автоаварии'}]),
         target: 'sos', say: 'Экстренный вызов — SOS: <strong>выкл.</strong> <strong>Нажмите «Экстренный вызов — SOS».</strong>'},
        {screen: c => list(p, 'Экстренный вызов — SOS', [{id: 'sos-toggle', label: 'Использовать экстренный вызов — SOS', toggle: !!c.sosOn, sub: 'Нажмите кнопку питания 5 раз или больше, чтобы запустить экстренные действия.'}, {label: 'Делиться информацией с экстренными контактами', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Нажмите «Использовать экстренный вызов — SOS»</strong>, чтобы включить.'},
        {screen: () => list(p, 'Безопасность и экстренные случаи', [{id: 'medical', label: 'Медицинская информация'}, {id: 'contacts-ec', label: 'Экстренные контакты', sub: 'Нет'}, {label: 'Экстренный вызов — SOS', sub: 'Вкл.'}]),
         target: 'contacts-ec', say: 'Теперь выберите, кто получит SMS с вашим местоположением. <strong>Нажмите «Экстренные контакты».</strong>'},
        {screen: c => list(p, 'Экстренные контакты', [{id: 'add', label: '＋ Добавить контакт'}], {overlay: c.pick ? sheet('Выберите контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Нажмите «Добавить контакт».</strong>'},
        {screen: () => list(p, 'Экстренные контакты', [{label: '＋ Добавить контакт'}], {overlay: sheet('Выберите контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Нажмите Sarah</strong>, вашу дочь.', hints: {'pick-dave': 'Для этой тренировки выберите Sarah.'}},
        {screen: () => list(p, 'Экстренные контакты', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Добавить контакт'}]),
         question: {q: 'Вы упали и не можете нормально дотянуться до экрана телефона. Что вы сделаете?', options: [
            {t: 'Быстро нажму кнопку питания 5 раз', ok: true, why: 'Да. Начинается обратный отсчёт, затем телефон звонит на 999 и сообщает Sarah, где вы находитесь.'},
            {t: 'Разблокирую телефон и найду приложение «Телефон»', why: 'В экстренной ситуации это долго. 5 нажатий кнопки питания срабатывают, даже когда телефон заблокирован.'}]}},
        {screen: () => list(p, 'Экстренные контакты', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Отлично!</strong> Экстренный вызов — SOS включён, и Sarah узнает, где вы находитесь. Если нажмёте по ошибке, нажмите «Отмена» во время обратного отсчёта.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Экстренные оповещения предупреждают об опасности поблизости, например о сильном наводнении. На этом телефоне кто-то отключил одно из них. Давайте это исправим. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Нажмите «Уведомления».</strong>'},
            {screen: c => list(p, 'Уведомления', [{label: 'Показ миниатюр', value: 'Всегда'}, {caption: 'СТИЛЬ УВЕДОМЛЕНИЙ'}, {label: 'Сообщения', sub: 'Баннеры, звуки, наклейки'}, {label: 'WhatsApp', sub: 'Баннеры, звуки, наклейки'},
                {caption: 'ГОСУДАРСТВЕННЫЕ ОПОВЕЩЕНИЯ'}, {label: 'Экстренные оповещения', toggle: true}, {id: 'severe', label: 'Серьезные оповещения', toggle: !!c.severe}, {label: 'Тестовые оповещения', toggle: false}], {back: 'Настройки'}),
             target: 'severe', action: c => { c.severe = true; }, say: '«Государственные оповещения» находятся в самом низу. <strong>«Серьезные оповещения»</strong> выключены. <strong>Нажмите на них, чтобы включить.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Нажмите «Безопасность и экстренные случаи».</strong>', hint: 'Он ближе к концу списка.'},
            {screen: () => list(p, 'Безопасность и экстренные случаи', [{label: 'Медицинская информация'}, {label: 'Экстренный вызов — SOS'}, {id: 'wea', label: 'Экстренные оповещения по беспроводной сети'}, {label: 'Оповещения о неизвестных трекерах'}]),
             target: 'wea', say: '<strong>Нажмите «Экстренные оповещения по беспроводной сети».</strong> <em>На некоторых телефонах это называется «Экстренные оповещения».</em>'},
            {screen: c => list(p, 'Экстренные оповещения по беспроводной сети', [{label: 'Разрешить оповещения', toggle: true}, {label: 'Крайняя опасность', toggle: true}, {id: 'severe', label: 'Серьёзная опасность', toggle: !!c.severe}, {label: 'Тестовые оповещения', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>«Серьёзная опасность»</strong> выключено. <strong>Нажмите, чтобы включить.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Экстренное оповещение: серьёзная опасность</strong><p>Ожидается сильное наводнение у набережной. Перейдите на возвышенное место. Подробнее на gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'Так выглядит оповещение. Оно издаёт громкий сигнал сирены около 10 секунд, даже в бесшумном режиме. <strong>Нажмите OK.</strong> <em>(Только для тренировки.)</em>'},
        {screen: () => home(p), question: {q: 'Оповещение приходит, когда вы за рулём. Что нужно сделать?', options: [
            {t: 'Остановиться в безопасном месте и только потом прочитать', ok: true, why: 'Да. Никогда не читайте телефон за рулём. Безопасно остановитесь, затем читайте.'},
            {t: 'Прочитать сразу, не останавливаясь', why: 'Никогда не читайте телефон за рулём. Сначала найдите безопасное место для остановки.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> Теперь телефон будет предупреждать вас о серьёзной опасности поблизости. Настоящие оповещения никогда не просят личные данные или деньги: если просит, это мошенничество.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Три вещи, из-за которых краденый телефон становится гораздо менее полезным для вора. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Нажмите «Face ID и код-пароль».</strong> <em>На настоящем iPhone дальше нужно будет ввести код-пароль.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Прокрутите вниз и <strong>нажмите «Защита украденного устройства»</strong>.'},
            {screen: c => list(p, 'Защита украденного устройства', [{id: 'sdp', label: 'Защита украденного устройства', toggle: !!c.sdp, sub: 'Вдали от дома для смены код-пароля или Apple Account нужен Face ID и ожидание в 1 час.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Это не даст вору, подсмотревшему ваш код-пароль, закрыть вам доступ. <strong>Включите её.</strong>'},
            {screen: () => list(p, 'Защита украденного устройства', [{label: 'Защита украденного устройства', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Теперь скроем сообщения на заблокированном экране. <strong>Нажмите ‹ Face ID</strong>, чтобы вернуться.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Нажмите «Уведомления».</strong>'},
            {screen: c => list(p, 'Уведомления', [{id: 'previews', label: 'Показ миниатюр', value: c.previews || 'Всегда'}, {label: 'Демонстрация экрана', value: 'Уведомления выкл.'}], {back: 'Настройки',
                overlay: c.pickPrev ? sheet('Показ миниатюр', [['prev-always', 'Всегда'], ['prev-unlocked', 'Без блокировки', 'Рекомендуется'], ['prev-never', 'Никогда']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Сейчас любой может прочитать ваши сообщения, в том числе коды безопасности, не разблокируя телефон. <strong>Нажмите «Показ миниатюр».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Нажмите Google.</strong>', hint: 'Он ближе к концу списка.'},
            {screen: () => list(p, 'Google', [{label: 'Управление аккаунтом Google'}, {id: 'all-services', label: 'Все сервисы'}, {label: 'Резервная копия'}]), target: 'all-services', say: '<strong>Нажмите «Все сервисы».</strong>'},
            {screen: () => list(p, 'Все сервисы', [{caption: 'Личная безопасность и безопасность устройства'}, {id: 'theft', label: 'Защита от кражи'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Нажмите «Защита от кражи».</strong>'},
            {screen: c => list(p, 'Защита от кражи', [{id: 'tdl', label: 'Блокировка при обнаружении кражи', toggle: !!c.tdl, sub: 'Блокирует экран, если телефон чувствует, что его выхватили и убегают.'}, {label: 'Блокировка офлайн-устройства', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Включите «Блокировку при обнаружении кражи».</strong> Если кто-то выхватит телефон и убежит, он заблокируется сам.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Теперь скроем сообщения на заблокированном экране. Вернувшись в «Настройки», <strong>нажмите «Уведомления»</strong>.'},
            {screen: c => list(p, 'Уведомления', [{id: 'previews', label: 'Уведомления на заблокированном экране', sub: c.previews || 'Показывать всё содержимое'}, {label: 'История уведомлений'}], {
                overlay: c.pickPrev ? sheet('Уведомления на заблокированном экране', [['prev-always', 'Показывать всё содержимое'], ['prev-unlocked', 'Скрывать конфиденциальное содержимое', 'Рекомендуется'], ['prev-never', 'Не показывать уведомления']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Сейчас любой может прочитать ваши сообщения, в том числе коды безопасности, не разблокируя телефон. <strong>Нажмите «Уведомления на заблокированном экране».</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Уведомления', [{label: 'Показ миниатюр', value: 'Всегда'}], {back: 'Настройки', overlay: sheet('Показ миниатюр', [['prev-always', 'Всегда'], ['prev-unlocked', 'Без блокировки', 'Рекомендуется'], ['prev-never', 'Никогда']])})
                : list(p, 'Уведомления', [{label: 'Уведомления на заблокированном экране', sub: 'Показывать всё содержимое'}], {overlay: sheet('Уведомления на заблокированном экране', [['prev-always', 'Показывать всё содержимое'], ['prev-unlocked', 'Скрывать конфиденциальное содержимое', 'Рекомендуется'], ['prev-never', 'Не показывать уведомления']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Без блокировки' : 'Скрывать конфиденциальное содержимое'}.</strong>`, hints: {'prev-always': 'Так было раньше. Выберите рекомендуемый вариант.', 'prev-never': 'Это скрывает их полностью, что может раздражать. Выберите рекомендуемый вариант.'}},
        {screen: () => home(p), target: 'phone', say: 'Наконец, найдите IMEI вашего телефона. Он нужен оператору, чтобы заблокировать украденный телефон. <strong>Откройте приложение «Телефон».</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'На клавиатуре <strong>наберите *#06#</strong> (звёздочка, решётка, ноль, шесть, решётка).', hint: 'Начните с клавиши со звёздочкой *, внизу слева.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Сведения об устройстве', 'IMEI: 35 209900 176148 1 (учебный номер)', [['ok', 'OK']])}),
         target: 'ok', say: 'Этот длинный номер и есть ваш <strong>IMEI</strong>. На настоящем телефоне запишите его в надёжном месте (не в самом телефоне!). <strong>Нажмите OK.</strong>'},
        {screen: () => home(p), question: {q: 'У вас выхватили телефон. Кому вы позвоните в первую очередь?', options: [
            {t: 'В свой банк, с чужого телефона', ok: true, why: 'Да. Воры в первую очередь идут в банковские приложения. Затем заблокируйте телефон онлайн, позвоните оператору и сообщите в полицию по номеру 101.'},
            {t: 'Подождать, вдруг найдётся', why: 'Важна скорость. Сразу позвоните в банк, затем заблокируйте телефон и позвоните оператору.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> Вашим телефоном вору будет гораздо труднее воспользоваться, и вы знаете, где найти IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'ЛОКАТОР' : 'ОПОВЕЩЕНИЕ О ТРЕКЕРЕ', title: p === 'ios' ? 'AirTag перемещается вместе с вами' : 'Неизвестный трекер перемещается вместе с вами',
            text: '<br>Местоположение этого предмета может видеть его владелец.'}),
         target: 'alert', say: 'Телефон заметил, что вместе с вами перемещается чужой трекер. Не паникуйте: часто это по ошибке чей-то родственник. <strong>Нажмите на оповещение.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Неизвестный AirTag' : 'Неизвестный трекер', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">С вами с <strong>10:12</strong> сегодня, в 4 местах.</p>
            <button type="button" class="ce co" data-tap="play">Воспроизвести звук</button>
            <button type="button" class="cp" data-tap="learn">Узнать об этом ${p === 'ios' ? 'AirTag' : 'Трекер'}</button>
            <button type="button" class="cp" data-tap="disable">Инструкции по отключению</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'На карте видно, где он был вместе с вами. <strong>Нажмите «Воспроизвести звук»</strong>, чтобы найти его.'},
        {screen: () => app(p, p === 'ios' ? 'Неизвестный AirTag' : 'Неизвестный трекер', '<p class="cf">⟦volume-2⟧ <strong>Воспроизведение звука…</strong><br>Прислушайтесь к писку.</p>', {color: '#fff'}),
         question: {q: 'Вы слышите тихий писк. Где искать?', options: [
            {t: 'В сумках, карманах пальто, в машине и среди всего, что вам одолжили', ok: true, why: 'Да. Трекеры маленькие, размером с крупную монету, и их часто прячут в подкладке, карманах или машине.'},
            {t: 'Нигде, просто проигнорировать', why: 'Его стоит найти. Проверьте сумки, карманы и машину: возможно, это просто чей-то родственник.'}]}},
        {screen: c => app(p, 'Трекер найден', `<p class="cf">Поднесите верхнюю часть телефона к трекеру, чтобы узнать о нём больше.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Поднесите к трекеру</button>`, {color: '#fff'}),
         target: 'scan', say: 'Вы нашли его в подкладке пальто. <strong>Нажмите «Поднесите к трекеру»</strong>, чтобы увидеть, кому он принадлежит.'},
        {screen: () => app(p, 'Об этом трекере', '<p class="cf"><strong>Не в режиме пропажи</strong><br>Серийный номер: P4R7-ACT1CE<br>Данные владельца передаются только полиции.</p>', {color: '#fff'}),
         question: {q: 'Это не трекер кого-то из родных, и вы боитесь, что его подбросили, чтобы следить за вами. Что вы сделаете?', options: [
            {t: 'Сохраню его и отнесу в полицию (или позвоню на 999, если мне грозит опасность)', ok: true, why: 'Да. Не выбрасывайте его: полиция может найти его владельца. Национальная линия помощи при преследовании (National Stalking Helpline): 0808 802 0300.'},
            {t: 'Выброшу в мусор', why: 'Это может быть доказательством, а полиция может найти владельца. Сохраните его и отнесите в полицию или позвоните на 999, если вам грозит опасность.'}]}},
        {screen: () => app(p, 'Об этом трекере', '<p class="cf">Помощь: National Stalking Helpline 0808 802 0300<br>Линия помощи при домашнем насилии (круглосуточно) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Отлично!</strong> Вы знаете, как найти трекер и что делать. ' + (p === 'android' ? 'Убедитесь, что оповещения включены, в <strong>Настройки > Безопасность и экстренные случаи > Оповещения о неизвестных трекерах</strong>.' : 'iPhone проверяет наличие трекеров автоматически.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Вы на тропе над обрывом, и кто-то упал. Адреса нет. Когда вы звоните на 999, большинство телефонов отправляют ваше местоположение автоматически, но три слова тоже помогают. <strong>Откройте what3words.</strong> <em>(Учебная версия.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Синяя точка — это вы. У каждого квадрата 3 на 3 метра есть свои три слова. Ваши: <strong>puffin.chalk.lantern</strong>. Подождите, пока точка успокоится, затем <strong>нажмите «Мои 3 слова готовы»</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Теперь звоните на 999. <strong>Откройте приложение «Телефон».</strong> <em>(Только для тренировки: никогда не звоните на 999 ради проверки.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Наберите 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Нажмите зелёную кнопку вызова.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Экстренный вызов · 0:08</small></div>
            <p class="hi">«Экстренная служба, какая служба вам нужна? … Скорая помощь. Где именно произошло происшествие?»</p>${homeIndicator(p)}</div>`,
         question: {q: 'Оператор спрашивает, где вы находитесь. Что вы скажете?', options: [
            {t: '«Я на тропе над обрывом. Мой адрес в what3words: puffin, chalk, lantern».', ok: true, why: 'Да. Скажите своими словами, где вы, затем назовите три слова. Если попросят, продиктуйте любое слово по буквам.'},
            {t: '«Не знаю, где-то у моря»', why: 'Они постараются вас найти, но три слова определяют ваше место с точностью до 3 метров. Прочитайте их из приложения.'}]}},
        {screen: () => home(p), question: {q: 'Ваш друг глухой и не может звонить голосом. Как ему связаться с 999?', options: [
            {t: 'Заранее зарегистрироваться для экстренных SMS (отправить «register» на 999) или пользоваться приложением 999 BSL', ok: true, why: 'Да. Экстренные SMS работают, только если зарегистрироваться заранее. Приложение 999 BSL соединяет с переводчиком жестового языка.'},
            {t: 'Никак', why: 'Это возможно. Зарегистрируйтесь для экстренных SMS, отправив «register» на 999, или пользуйтесь бесплатным приложением 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> Помните: скажите, где вы находитесь, затем назовите три слова. Приложение what3words показывает ваши слова и без сигнала, но чтобы позвонить, сигнал нужен.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Не отвечает</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Телефон завис: нажатия ничего не делают, и он не выключается обычным способом. Это серьёзная проблема?', options: [
            {t: 'Обычно нет. «Принудительная перезагрузка» помогает, и ничего не теряется', ok: true, why: 'Верно. Принудительная перезагрузка — как выключить телефон из розетки. Ваши фото и сообщения в безопасности.'},
            {t: 'Да, он сломан', why: 'Обычно нет! Принудительная перезагрузка помогает большинству зависших телефонов, и ничего не теряется.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'На iPhone: <strong>нажмите и отпустите кнопку увеличения громкости</strong>, затем <strong>нажмите и отпустите кнопку уменьшения громкости</strong>, затем <strong>нажмите и удерживайте боковую кнопку</strong>, пока не появится логотип Apple (около 10 секунд). Здесь нажмите их в таком порядке.'
            : 'На большинстве телефонов Android: <strong>одновременно нажмите и удерживайте кнопку питания и кнопку уменьшения громкости</strong> около 10 секунд, пока телефон не перезагрузится. Здесь нажмите кнопку питания, затем кнопку уменьшения громкости. <em>(Google Pixel: удерживайте только кнопку питания 30 секунд.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Сначала кнопка увеличения громкости.' : 'Начните с кнопки питания.', side: 'Боковая кнопка идёт последней, после обеих кнопок громкости.'},
         hint: p === 'ios' ? 'Увеличение громкости, затем уменьшение громкости, затем боковая кнопка.' : 'Питание, затем уменьшение громкости.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Появился логотип. Что теперь?', options: [
            {t: 'Отпустить кнопку и подождать, пока телефон включится', ok: true, why: 'Да. Это займёт минуту. Возможно, нужно будет один раз ввести код-пароль.'},
            {t: 'Продолжать нажимать все кнопки', why: 'Отпустите, как только появится логотип, и подождите минуту, пока телефон включится.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Отлично!</strong> Телефон перезагрузился. Если он продолжает зависать, проверьте обновления и освободите место. Если перезагружать телефон раз в неделю, он будет работать без сбоев.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Вкл.' : 'Выкл.'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Выкл.' : (ctx.signal ? 'Вкл. · 4G' : 'Нет сети')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Выкл.' : 'Дом'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Проведите вверх, чтобы закрыть' : 'Закрыть'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Нет сети</span>'), target: 'pull-down',
         say: 'Телефон показывает <strong>«Нет сети»</strong>, хотя утром всё работало. Быстрый способ исправить: включить и выключить авиарежим, и телефон переподключится. ' + (p === 'ios' ? '<strong>Проведите вниз от правого верхнего угла</strong> (или нажмите на полоску).' : '<strong>Проведите вниз от верхнего края</strong> (или нажмите на полоску).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Нажмите «Авиарежим»</strong>, чтобы включить его. Всё беспроводное отключится.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Подождите около 10 секунд… затем <strong>снова нажмите «Авиарежим»</strong>, чтобы выключить.'},
        {screen: c => quickPanel(p, c), question: {q: 'Мобильный интернет снова работает по 4G. Когда ещё удобен авиарежим?', options: [
            {t: 'В самолёте или за границей, чтобы не платить за роуминг (Wi-Fi можно включить)', ok: true, why: 'Да. При включённом авиарежиме можно снова включить Wi-Fi, чтобы пользоваться Wi-Fi в отеле или на корабле.'},
            {t: 'Чтобы зарядить телефон', why: 'Он заряжается чуть быстрее, но этот режим нужен в основном для полётов и чтобы не платить за роуминг за границей.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Отлично!</strong> Если авиарежим не помог, перезагрузите телефон. Всё ещё нет сети? Посмотрите на сайте вашего оператора, нет ли неполадок в вашем районе.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · сейчас</strong><span>🎁 Вас ждут БЕСПЛАТНЫЕ жизни! Возвращайтесь и играйте! 🎉</span></button>',
         target: 'settings', say: 'Игра то и дело присылает бессмысленные сообщения. Уведомления можно отключить для любого приложения. <strong>Нажмите «Настройки»</strong>, а не сообщение.', hints: {notif: 'Так откроется игра. Нажмите «Настройки».'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Нажмите «Уведомления».</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Уведомления', [{label: 'Показ миниатюр', value: 'Без блокировки'}, {caption: 'СТИЛЬ УВЕДОМЛЕНИЙ'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Баннеры, звуки, наклейки'}, {label: 'Сообщения', sub: 'Баннеры, звуки, наклейки'}, {label: 'WhatsApp', sub: 'Баннеры, звуки, наклейки'}], {back: 'Настройки'})
            : list(p, 'Уведомления', [{id: 'app-notifs', label: 'Уведомления приложений'}, {id: 'history', label: 'История уведомлений'}, {label: 'Уведомления на заблокированном экране'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Нажмите Bubble Pop.</strong>' : '<strong>Нажмите «Уведомления приложений».</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Уведомления приложений', [{label: 'Сообщения', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Нажмите переключатель рядом с Bubble Pop</strong>, чтобы отключить его уведомления.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Допуск уведомлений', toggle: !c.off}], {back: 'Уведомления'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Выключите «Допуск уведомлений».</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Уведомления', [{label: 'Уведомления приложений'}, {id: 'history', label: 'История уведомлений', sub: 'Выкл.'}]), target: 'history',
             say: 'Полезное дополнение: если вы случайно смахнёте сообщение, «История уведомлений» сохранит его копию. <strong>Нажмите «История уведомлений».</strong>'},
            {screen: c => list(p, 'История уведомлений', [{id: 'hist-toggle', label: 'Использовать историю уведомлений', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Включите её.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Уведомления каких приложений стоит оставить включёнными?', options: [
            {t: 'Сообщения, звонки, WhatsApp, банк и всё, о чём вы хотите знать сразу', ok: true, why: 'Да. Оставьте важные, а игры, магазины и всё, что просто надоедает, отключите.'},
            {t: 'Отключить все', why: 'Вы пропустите сообщения и звонки! Оставьте важные, а игры и приложения магазинов отключите.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Отлично!</strong> Bubble Pop больше не будет вас беспокоить. ' + (p === 'ios' ? 'Если вы случайно смахнули сообщение, проведите вверх от середины заблокированного экрана, чтобы увидеть предыдущие.' : 'А история уведомлений хранит копию всего, что вы смахнули.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Увидимся в ducking garden centre x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Текстовое сообщение</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Вы набрали «Dunnington garden centre», а телефон изменил это. Почему?', options: [
            {t: 'Автокоррекция угадала не то слово', ok: true, why: 'Да. Автокоррекция заменяет слова, которых не знает. Её можно отключить или научить новым словам.'},
            {t: 'Телефон сломан', why: 'Это просто автокоррекция угадывает. Её можно отключить или научить словам.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Нажмите «Основные».</strong>'},
            {screen: () => list(p, 'Основные', [{label: 'Об этом устройстве'}, {label: 'Обновление ПО'}, {id: 'keyboard', label: 'Клавиатура'}, {label: 'Язык и регион'}], {back: 'Настройки'}), target: 'keyboard', say: '<strong>Нажмите «Клавиатура».</strong>'},
            {screen: c => list(p, 'Клавиатуры', [{id: 'replace', label: 'Замена текста'}, {caption: 'ВСЕ КЛАВИАТУРЫ'}, {label: 'Автопрописные', toggle: true}, {id: 'ac', label: 'Автокоррекция', toggle: !c.acOff}, {label: 'Предиктивный ввод', toggle: true}], {back: 'Основные'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Выключите «Автокоррекция».</strong> Орфографические ошибки по-прежнему подчёркиваются красным, так что вы сможете исправить их сами.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Нажмите «Система».</strong> Он в самом низу.'},
            {screen: () => list(p, 'Система', [{id: 'keyboard', label: 'Клавиатура'}, {label: 'Языки'}, {label: 'Дата и время'}]), target: 'keyboard', say: '<strong>Нажмите «Клавиатура».</strong>'},
            {screen: () => list(p, 'Клавиатура', [{id: 'gboard', label: 'Gboard', sub: 'Экранная клавиатура'}]), target: 'gboard', say: '<strong>Нажмите Gboard.</strong> <em>На Samsung это Клавиатура Samsung > Умный набор.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Настройки'}, {id: 'correction', label: 'Исправление текста'}, {label: 'Непрерывный ввод'}]), target: 'correction', say: '<strong>Нажмите «Исправление текста».</strong>'},
            {screen: c => list(p, 'Исправление текста', [{label: 'Показывать строку подсказок', toggle: true}, {id: 'ac', label: 'Автоисправление', toggle: !c.acOff}, {label: 'Проверка орфографии', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Выключите «Автоисправление».</strong> Орфографические ошибки по-прежнему подчёркиваются красным, так что вы сможете исправить их сами.'},
        ]),
        {screen: () => home(p), question: {q: 'Вы предпочли бы оставить автокоррекцию, но она всегда меняет «Dunnington». Что ещё можно сделать?', options: [
            {t: 'Добавить слово в словарь телефона, чтобы он его выучил', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Использовать «Замену текста» в тех же настройках клавиатуры.' : 'Нажать на слово в строке подсказок и выбрать добавление в словарь.')},
            {t: 'Ничего, просто терпеть', why: 'Его можно научить: ' + (p === 'ios' ? 'добавьте слово в «Клавиатура» > «Замена текста».' : 'нажмите на слово в подсказках и добавьте его в словарь.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> Больше никаких неожиданных замен слов. Включить её снова можно в любой момент там же.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'У вас новые беспроводные наушники. Что вы сделаете в первую очередь?', options: [
            {t: 'Переведу их в «режим сопряжения» (обычно нужно удерживать кнопку, пока не замигает индикатор)', ok: true, why: 'Да. Режим сопряжения позволяет телефону их найти. В инструкции в коробке написано, как именно это сделать.'},
            {t: 'Подключу их к телефону проводом', why: 'Беспроводные наушники подключаются по Bluetooth. Сначала переведите их в режим сопряжения, обычно удерживая кнопку, пока не замигает индикатор.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Индикатор наушников мигает. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Нажмите Bluetooth.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Нажмите «Подключённые устройства».</strong>'},
            {screen: () => list(p, 'Подключённые устройства', [{id: 'pair', label: '＋ Подключить новое устройство'}, {label: 'Сохранённые устройства', sub: 'Автомобиль'}]), target: 'pair', say: '<strong>Нажмите «Подключить новое устройство».</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Подключить новое устройство', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'МОИ УСТРОЙСТВА' : 'Сохранено'}, {label: 'Автомобиль', sub: 'Не подключено'},
            {caption: p === 'ios' ? 'ДРУГИЕ УСТРОЙСТВА' : 'Доступные устройства'}, {id: 'headphones', label: '⟦headphones⟧ Учебные наушники'}, {label: 'Телевизор соседей'}], {back: 'Настройки'}),
         target: 'headphones', say: 'Телефон ищет устройства поблизости. <strong>Нажмите «Учебные наушники».</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'МОИ УСТРОЙСТВА'}, {label: '⟦headphones⟧ Учебные наушники', sub: 'Подключено ⟦check⟧'}, {label: 'Автомобиль', sub: 'Не подключено'}], {back: 'Настройки'}),
         question: {q: 'Когда вы в следующий раз включите наушники, придётся ли делать это снова?', options: [
            {t: 'Нет, теперь они будут подключаться сами', ok: true, why: 'Нет. Сопряжение делается один раз. После этого они подключаются автоматически, когда включены и находятся рядом.'},
            {t: 'Да, каждый раз', why: 'Сопряжение делается только один раз. После этого они подключаются сами.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Учебные наушники', sub: 'Подключено ⟦check⟧'}], {back: 'Настройки'}), done: true,
         say: '<strong>Отлично!</strong> Те же шаги подходят для автомобиля, колонки или слуховых аппаратов. Если что-то не подключается, выключите и включите Bluetooth и снова переведите устройство в режим сопряжения.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">«${ctx.said || 'Бабушка? Это я, Tom! Я потерял телефон, у меня неприятности. Мне нужно £400 на штраф, сегодня. Пожалуйста, не говори маме!'}»</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Попросить семейную кодовую фразу</button><button type="button" data-tap="send-money">Сказать, что отправите деньги</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Звонит незнакомый номер. <strong>Ответьте</strong>, чтобы потренироваться, как себя вести.', hints: {decline: 'В жизни можно и отклонить! Но для этой тренировки нажмите «Ответить».'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Э-э… что? Бабушка, на это нет времени! Пожалуйста, деньги нужны прямо сейчас!'; },
         say: 'Звучит точно как ваш внук Tom. Но мошенники умеют копировать голоса. Ваша семья договорилась о <strong>кодовой фразе</strong>. <strong>Попросите её назвать.</strong>',
         hints: {'send-money': 'Никогда не соглашайтесь отправлять деньги во время такого звонка. Попросите кодовую фразу.', end: 'Положить трубку тоже можно! Но сначала потренируйтесь просить кодовую фразу.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Они её не знают и давят сильнее. Это мошенник. <strong>Положите трубку</strong> красной кнопкой.', hints: {'send-money': 'Не надо! Они не знали фразу. Положите трубку.', 'ask-phrase': 'Вы спросили, и они не смогли ответить. Положите трубку.'}},
        {screen: () => home(p), question: {q: 'Вы всё ещё немного переживаете за Tom. Что вы сделаете?', options: [
            {t: 'Позвоню Tom (или его маме) на номер, который у меня уже есть', ok: true, why: 'Да. Всегда перезванивайте на номер, который знаете. Настоящий Tom будет в порядке и не обидится, что вы проверяете.'},
            {t: 'Перезвоню на номер, с которого звонили', why: 'Так вы снова дозвонитесь до мошенника. Позвоните Tom на номер, который у вас уже есть.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Если звонок касается вашего банковского счёта, вы можете позвонить на <strong>159</strong>, чтобы безопасно связаться со своим банком. <strong>Откройте приложение «Телефон»</strong>, чтобы потренироваться.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Наберите 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Нажмите зелёную кнопку вызова.</strong> <em>(Только для тренировки: набор номера не происходит.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">«Добро пожаловать в 159. Назовите свой банк, и мы вас соединим».</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Отлично!</strong> 159 соединяет вас с вашим настоящим банком. Договоритесь с семьёй о кодовой фразе при личной встрече и никогда не публикуйте её в интернете.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравствуйте' : 'Привет'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Проведите вверх, чтобы открыть' : 'Начать'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Ваш новый телефон достали из коробки и включили. Держите <strong>старый телефон</strong> рядом, заряженным и подключённым к Wi-Fi. <strong>Нажмите ${p === 'ios' ? 'Проведите вверх, чтобы открыть' : 'Начать'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Быстрое начало' : 'Скопировать приложения и данные', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Поднесите старый iPhone к этому, чтобы настроить его с вашим Apple Account.' : 'Скопируйте приложения, фото, контакты и многое другое со старого телефона.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Продолжите на старом iPhone' : 'Используйте старое устройство'}</button>
            <button type="button" class="cp" data-tap="manual">Настроить вручную</button>`}),
         target: 'use-old', say: 'Копирование со старого телефона избавляет от необходимости всё настраивать заново. <strong>Нажмите ' + (p === 'ios' ? 'Продолжите на старом iPhone' : 'Используйте старое устройство') + '.</strong>', hints: {manual: 'Можно, но копировать гораздо проще. Нажмите другую кнопку.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">На вашем <strong>старом</strong> телефоне появится сообщение. Наведите его камеру на этот узор.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Старый телефон отсканировал</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'На старом телефоне нажмите «Продолжить», затем поднесите его к этому узору, чтобы камера его увидела. Здесь <strong>нажмите «Старый телефон отсканировал»</strong>.'},
        {screen: c => codeScreen(p, c, 'Введите код-пароль старого телефона', 'Так ваши настройки копируются безопасно.'), sequence: CODE_KEYS,
         say: `Введите код-пароль старого телефона. Для тренировки используйте <strong>${codeText}</strong>.`, hint: `Введите тренировочный код ${codeText}.`},
        {screen: () => list(p, 'Перенос данных', [], {noBack: true, top: `<p class="cf">Выберите, что перенести:</p>
            <div class="cj ex"><span>Фото и видео</span>${tog(true)}</div><div class="cj ex"><span>Контакты и сообщения</span>${tog(true)}</div><div class="cj ex"><span>Приложения</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Продолжить</button>`}),
         target: 'transfer', say: 'Всё отмечено. <strong>Нажмите «Продолжить».</strong> Держите оба телефона рядом и подключёнными к зарядке.'},
        {screen: c => list(p, 'Перенос…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Осталось около 25 минут' : 'Перенос завершён ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Перенос завершён. Что делать со старым телефоном?', options: [
            {t: 'Подержать неделю, чтобы убедиться, что ничего не пропало, а потом как следует стереть данные перед продажей или утилизацией', ok: true, why: 'Да. Сначала убедитесь, что фото, WhatsApp и банковские приложения работают на новом телефоне. Как стереть данные на старом, показано на следующем уроке.'},
            {t: 'Сразу выбросить', why: 'На нём ещё вся ваша информация! Убедитесь, что на новом телефоне всё есть, затем как следует сотрите данные на старом.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> На новом телефоне теперь ваши фото, контакты и приложения. Некоторые приложения, например банковские и WhatsApp, попросят войти снова; держите наготове свои данные.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Продаёте, отдаёте или сдаёте на утилизацию старый телефон? Делайте это в правильном порядке, иначе следующий владелец не сможет им пользоваться. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Шаг 1: выйдите из Apple Account. <strong>Нажмите на своё имя</strong>.'},
            {screen: c => list(p, 'Apple Account', [{label: 'Личная информация'}, {label: 'Вход и безопасность'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Выйти', danger: true}], {back: 'Настройки',
                overlay: c.ask ? dialog(p, 'Выйти?', 'Пароль нужен, чтобы выключить «Локатор». (Для тренировки он введён за вас.)', [['cancel', 'Отмена'], ['turn-off', 'Выключить']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Прокрутите в самый низ и <strong>нажмите «Выйти»</strong>.'},
            {screen: () => list(p, 'Apple Account', [{label: 'Выйти', danger: true}], {back: 'Настройки', overlay: dialog(p, 'Выйти?', 'Пароль нужен, чтобы выключить «Локатор». (Для тренировки он введён за вас.)', [['cancel', 'Отмена'], ['turn-off', 'Выключить']])}),
             target: 'turn-off', say: 'Это выключает <strong>«Локатор»</strong>, который иначе привязал бы телефон к вам. <strong>Нажмите «Выключить».</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Шаг 2: сотрите данные. <strong>Нажмите «Основные».</strong>'},
            {screen: () => list(p, 'Основные', [{label: 'Об этом устройстве'}, {label: 'Хранилище iPhone'}, {id: 'reset', label: 'Перенос или сброс iPhone'}], {back: 'Настройки'}), target: 'reset', say: '<strong>Нажмите «Перенос или сброс iPhone»</strong> внизу.'},
            {screen: c => list(p, 'Перенос или сброс iPhone', [{label: 'Сбросить'}, {id: 'erase', label: 'Стереть контент и настройки'}], {back: 'Основные',
                overlay: c.askErase ? dialog(p, 'Стереть этот iPhone?', 'Все фото, сообщения и приложения будут удалены.', [['cancel', 'Отмена'], ['confirm-erase', 'Стереть']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Нажмите «Стереть контент и настройки».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Шаг 1: удалите аккаунт Google. <strong>Нажмите Google</strong>. <em>(На Samsung удалите также аккаунт Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Управление аккаунтом Google'}, {id: 'accounts', label: 'Аккаунты на этом устройстве', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Нажмите «Аккаунты на этом устройстве».</strong>'},
            {screen: c => list(p, 'Аккаунт Google', [{label: 'margaret.smith@example.com'}, {label: 'Синхронизация аккаунта'}, {id: 'remove', label: 'Удалить аккаунт', danger: true}], {overlay: c.ask ? dialog(p, 'Удалить аккаунт?', 'При удалении с этого телефона будут стёрты его сообщения, контакты и данные.', [['cancel', 'Отмена'], ['confirm-remove', 'Удалить аккаунт']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Без этого телефон после сброса останется привязанным к вашему аккаунту. <strong>Нажмите «Удалить аккаунт».</strong>'},
            {screen: () => list(p, 'Аккаунт', [{label: 'Удалить аккаунт', danger: true}], {overlay: dialog(p, 'Удалить аккаунт?', 'При удалении с этого телефона будут стёрты его сообщения, контакты и данные.', [['cancel', 'Отмена'], ['confirm-remove', 'Удалить аккаунт']])}),
             target: 'confirm-remove', say: '<strong>Нажмите «Удалить аккаунт».</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Шаг 2: сотрите данные. <strong>Нажмите «Система»</strong> внизу.'},
            {screen: () => list(p, 'Система', [{label: 'Языки'}, {label: 'Обновление ПО'}, {id: 'reset', label: 'Параметры сброса'}]), target: 'reset', say: '<strong>Нажмите «Параметры сброса».</strong>'},
            {screen: c => list(p, 'Параметры сброса', [{label: 'Сброс Wi-Fi, мобильной сети и Bluetooth'}, {id: 'erase', label: 'Стереть все данные (сброс до заводских настроек)'}], {overlay: c.askErase ? dialog(p, 'Стереть все данные?', 'Все фото, сообщения и приложения будут удалены.', [['cancel', 'Отмена'], ['confirm-erase', 'Стереть все данные']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Нажмите «Стереть все данные (сброс до заводских настроек)».</strong>'},
        ]),
        {screen: () => list(p, 'Сбросить', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Стереть этот iPhone?' : 'Стереть все данные?', 'Все фото, сообщения и приложения будут удалены.', [['cancel', 'Отмена'], ['confirm-erase', p === 'ios' ? 'Стереть' : 'Стереть все данные']])}),
         target: 'confirm-erase', say: 'Делайте это, только когда ваши фото надёжно сохранены на новом телефоне или в резервной копии. <strong>Нажмите ' + (p === 'ios' ? 'Стереть' : 'Стереть все данные') + '.</strong> <em>(Тренировка: ничего не удаляется.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравствуйте' : 'Привет'}</h3><p class="cf">Готов к следующему владельцу</p>${homeIndicator(p)}</div>`,
         question: {q: 'Что ещё нужно сделать, прежде чем передавать телефон?', options: [
            {t: 'Достать SIM-карту (и карту памяти, если есть)', ok: true, why: 'Да. На SIM-карте ваш номер телефона. Достаньте её специальным инструментом или скрепкой.'},
            {t: 'Больше ничего', why: 'Достаньте SIM-карту и карту памяти, если она есть. Ваш номер записан на SIM-карте.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Здравствуйте' : 'Привет'}</h3><p class="cf">Готов к следующему владельцу</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Отлично!</strong> Выйти из аккаунта, стереть данные, достать SIM-карту: именно в таком порядке. Экран «Здравствуйте» означает, что телефон готов для другого человека.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Напоминание</strong><span>Позвонить Sarah</span><small>Сегодня в 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, позже ливни</span><small>Днём 14° · Ночью 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} слушает… что вы хотите сказать?`}</p>${result}
            <div class="wh">${[['say-remind', '«Напомни позвонить Sarah в 3 часа»'], ['say-weather', '«Какая сегодня погода?»'], ['say-joke', '«Закажи мне пиццу»']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Боковая кнопка (нажать и удерживать)' : 'Кнопка питания (нажать и удерживать)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> выполняет просьбы, сказанные вслух. <strong>Нажмите и удерживайте боковую кнопку</strong> (справа), пока не появится Siri. Можно также просто сказать «Siri» или «Привет, Siri».'
                          : 'Телефон может выполнять просьбы, сказанные вслух. <strong>Нажмите и удерживайте кнопку питания</strong> (справа), пока не появится помощник. Можно также сказать «Окей, Google».',
         hint: 'Держите палец (или кнопку мыши) нажатым на кнопке на правом краю.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'На настоящем телефоне вы бы просто произнесли это. Здесь <strong>нажмите «Напомни позвонить Sarah в 3 часа»</strong>.', hints: {'say-joke': 'Сначала попробуйте напоминание.', 'say-weather': 'Сначала попробуйте напоминание.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Готово: напоминание появится в 3 часа. Теперь <strong>спросите о погоде</strong>.', hints: {'say-remind': 'Это задано. Теперь спросите о погоде.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'О чём из этого можно попросить телефон?', options: [
            {t: 'Обо всём: «Позвони Sarah», «Поставь таймер на 10 минут», «Включи фонарик», «Прочитай мои сообщения»', ok: true, why: 'Да. Это удобно, когда заняты руки, устали глаза или трудно печатать.'},
            {t: 'Только о погоде', why: 'Он умеет многое: звонки, таймеры, фонарик, чтение сообщений, будильники и не только.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Отлично!</strong> Говорите чётко и естественно, как с человеком. Если телефон расслышал неверно, просто спросите ещё раз.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Текст'], ['lens-translate', 'Перевести'], ['lens-search', 'Поиск']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Меню' : 'Carte'}</strong><span>${ctx.translated ? 'Рыбный суп' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Курица с грибами' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Яблочный пирог' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Пора сделать прививку от гриппа.</span><span>Чтобы записаться, позвоните ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Распознавание текста' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Камера умеет читать текст. Скопируем номер телефона из письма. <strong>Откройте «Камеру».</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Наведите её на письмо. Когда камера заметит текст, появится маленькая <strong>кнопка текста ⟦scan-text⟧</strong>. <strong>Нажмите на неё.</strong>' : 'Наведите её на письмо и <strong>нажмите кнопку Lens ◎</strong>.',
         hints: {shutter: 'Так делается обычное фото. Нажмите ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'кнопку Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Теперь надпись стала настоящим текстом. <strong>Нажмите на номер телефона.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Нажмите «Скопировать»</strong>, чтобы потом вставить в сообщение или контакты. <em>(«Позвонить» сразу набрал бы номер.)</em>', hints: {'call-num': 'Так телефон бы набрал этот номер. В этой тренировке нажмите «Скопировать».'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'В отпуске? Теперь камера направлена на французское меню. ' + (p === 'ios' ? 'Это умеют приложение «Переводчик» или Lens в приложении Google. ' : '') + '<strong>Нажмите «Перевести».</strong>', hints: {'lens-text': 'Так скопируется французский текст. Нажмите «Перевести».', 'lens-search': 'Нажмите «Перевести».'}},
        {screen: c => cameraLens(p, c), question: {q: 'Что ещё камера умеет делать таким образом?', options: [
            {t: 'Определять растения и птиц, а также сканировать письма в PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'В приложении «Заметки» нажмите на скрепку, затем «Отсканировать документы», чтобы превратить письма в PDF.' : 'В Google Диске нажмите +, затем «Сканировать», чтобы превратить письма в PDF.')},
            {t: 'Только делать фото', why: 'Она умеет гораздо больше: определять растения, переводить, копировать текст и сканировать письма в PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Отлично!</strong> Вы скопировали номер и перевели меню с помощью камеры. ' + (p === 'ios' ? 'Распознавание текста работает и на уже сделанных фото.' : 'Google Lens работает и на уже сделанных фото.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Электронные книги библиотеки', `<p class="cf">Вход выполнен по читательскому билету</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">Электронные книги</button><button type="button" data-tap="tab-audio" class="on">Аудиокниги</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Вернуть через 21 день' : 'Доступно 3 экземпляра из 5'}</small>
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
         say: 'С бесплатным читательским билетом можно брать электронные книги и аудиокниги на телефон. Библиотеки East Riding используют приложение <strong>BorrowBox</strong>. Это учебная версия. <strong>Откройте её.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Вы вошли по читательскому билету. <strong>Нажмите The Lighthouse at Flamborough.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Брать книги бесплатно. <strong>Нажмите «Взять».</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Она ваша на 21 день. <strong>Нажмите «Слушать».</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Нажмите кнопку воспроизведения ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Слушаете в постели? <strong>Таймер сна</strong> остановит воспроизведение через некоторое время, чтобы вы не потеряли место. <strong>Нажмите «Таймер сна».</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Что произойдёт, когда пройдут 21 день?', options: [
            {t: 'Книга вернётся сама. Штрафов нет, а если вы не дочитали, срок можно продлить', ok: true, why: 'Да. Электронные книги и аудиокниги возвращаются автоматически.'},
            {t: 'Вам выставят штраф', why: 'Штрафов нет. Книга возвращается сама, а если вы не дочитали, её можно продлить.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Отлично!</strong> Чтобы начать по-настоящему, вступите в библиотеку на eastridinglibraries.co.uk или в любой библиотеке, затем скачайте BorrowBox и войдите по своему билету.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Car Park</span><span>Оплата в приложении: номер места <b>4471</b></span></div>
                <p class="cf">Введите номер места с таблички</p>${field('parkcode', 'Номер места', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Найти парковку</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Оплатить £3.20' : 'Выберите время'}</button>`, {color});
        }
        return app(p, 'Парковка', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Во многих парковках можно платить через приложение, так что монеты не нужны. Каждый совет использует свои приложения (на табличке указано, какое). Это учебное. <strong>Откройте Park.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Введите номер места с таблички: 4471.',
         say: 'У каждой парковки есть <strong>номер места</strong> на табличке. <strong>Введите 4471</strong> в поле и <strong>нажмите «Найти парковку»</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Номер вашей машины уже сохранён. <strong>Выберите 2 часа.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'За использование приложения взимается небольшой сервисный сбор. <strong>Нажмите «Оплатить £3.20».</strong> <em>(Тренировка: деньги не списываются.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Вы задерживаетесь в магазинах. Что можно сделать?', options: [
            {t: 'Нажать «Продлить» в приложении, чтобы добавить время, не возвращаясь к машине', ok: true, why: 'Да. В этом большой плюс оплаты через приложение. Большинство также напоминают о конце оплаченного времени.'},
            {t: 'Ничего, получите штраф', why: 'В большинстве приложений для парковки можно нажать «Продлить» и добавить время откуда угодно.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Отлично!</strong> В большинстве автоматов по-прежнему принимают карты или монеты, а во многих приложениях можно платить и по звонку на номер или SMS. Никогда не платите через QR-наклейку на автомате: она может быть поддельной.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Срок вашего контракта истёк 3 марта 2026 г. Вы можете сменить оператора бесплатно. Ваш ежемесячный платёж: £24.00. Чтобы сменить оператора и сохранить номер, отправьте SMS с текстом PAC на 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Текстовое сообщение', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Вы всё ещё по контракту или переплачиваете? Одно бесплатное SMS всё прояснит. <strong>Откройте «Сообщения».</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Введите INFO в поле сообщения, затем нажмите «Отправить».',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Мы начали новое сообщение на номер <strong>85075</strong>. <strong>Введите INFO</strong> и <strong>нажмите «Отправить»</strong>. Это бесплатно у всех британских операторов.'},
        {screen: c => smsTo(p, c), question: {q: 'В ответе сказано, что контракт закончился, а вы всё ещё платите £24 в месяц. Что это значит?', options: [
            {t: 'За телефон вы уже расплатились. Тариф только с SIM-картой может стоить гораздо дешевле, а номер можно сохранить', ok: true, why: 'Да. Отправьте SMS с текстом PAC на 65075, чтобы получить код для смены оператора с сохранением номера. Остальное сделает новый оператор.'},
            {t: 'Ничего, продолжать платить', why: 'Возможно, вы платите за телефон, за который уже расплатились. Тариф только с SIM-картой может сэкономить вам много денег.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Ещё один способ сэкономить, для поездок за границу: отключите роуминг данных, чтобы не получить неожиданный счёт. <strong>Нажмите «Настройки».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Нажмите «Сотовая связь».</strong>'},
            {screen: () => list(p, 'Сотовая связь', [{label: 'Сотовые данные', toggle: true}, {id: 'options', label: 'Параметры данных', value: 'Роуминг вкл.'}, {label: 'Режим модема'}], {back: 'Настройки'}), target: 'options', say: '<strong>Нажмите «Параметры данных».</strong>'},
            {screen: c => list(p, 'Параметры данных', [{id: 'roam', label: 'Роуминг данных', toggle: !c.roamOff}, {label: 'Голос и данные', value: '5G Авто'}], {back: 'Сотовая связь'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Выключите «Роуминг данных».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Нажмите «Сеть и интернет».</strong>'},
            {screen: () => list(p, 'Сеть и интернет', [{label: 'Интернет', sub: 'Домашний Wi-Fi'}, {id: 'sims', label: 'SIM-карты', sub: 'Ваш оператор'}, {label: 'Режим полёта', toggle: false}]), target: 'sims', say: '<strong>Нажмите «SIM-карты».</strong>'},
            {screen: c => list(p, 'SIM-карты', [{label: 'Мобильный интернет', toggle: true}, {id: 'roam', label: 'Роуминг', toggle: !c.roamOff, sub: 'Подключаться к службам передачи данных в роуминге'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Выключите «Роуминг».</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Отлично!</strong> За границей вы по-прежнему можете пользоваться Wi-Fi для WhatsApp, видеозвонков и карт. Включите роуминг снова, если вам нужен мобильный интернет и вы знаете тарифы своего оператора.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Локатор', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Если вы делитесь геопозицией, родные видят, что вы благополучно добрались домой. Это ваш выбор, и в любой момент можно остановить. <strong>Откройте «Локатор».</strong>'},
        {screen: c => app(p, 'Люди', `<p class="cf">Пока никто не делится геопозицией.</p><button type="button" class="ce co" data-tap="share">Поделиться геопозицией</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Нажмите «Поделиться геопозицией».</strong>'},
        {screen: c => app(p, 'Поделиться с', '', {color: '#fff', overlay: sheet('Выберите контакт', [['pick-sarah', 'Sarah', 'Дочь'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Нажмите Sarah.</strong>', hints: {'pick-dave': 'Для этой тренировки выберите Sarah.'}},
        {screen: c => app(p, 'Поделиться с Sarah', '', {color: '#fff', overlay: sheet('На какой срок?', [['one-hour', 'Поделиться на один час'], ['day', 'Поделиться до конца дня'], ['always', 'Поделиться без срока']])}),
         target: 'always', say: 'Выберите срок. Для родных, которым вы доверяете, <strong>нажмите «Поделиться без срока»</strong>. Остановить можно в любой момент.', hints: {'one-hour': 'Это удобно для одной поездки. В этой тренировке выберите «Поделиться без срока».', day: 'В этой тренировке выберите «Поделиться без срока».'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Если вы делитесь геопозицией, родные видят, что вы благополучно добрались домой. Это ваш выбор, и в любой момент можно остановить. <strong>Откройте «Карты».</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Нажмите на фото профиля</strong> вверху справа.'},
        {screen: () => app(p, 'Карты', '', {color: '#fff', overlay: sheet('', [['sharing', 'Передача геоданных'], ['timeline', 'Ваша хронология'], ['settings', 'Настройки']])}), target: 'sharing', say: '<strong>Нажмите «Передача геоданных».</strong>'},
        {screen: () => app(p, 'Передача геоданных', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Нажмите «Новый доступ».</strong>'},
        {screen: () => app(p, 'Поделиться с', '', {color: '#fff', overlay: sheet('Выберите контакт', [['pick-sarah', 'Sarah', 'Дочь'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Нажмите Sarah.</strong>', hints: {'pick-dave': 'Для этой тренировки выберите Sarah.'}},
        {screen: () => app(p, 'Поделиться с Sarah', '', {color: '#fff', overlay: sheet('На какой срок?', [['one-hour', 'На 1 час'], ['always', 'Пока вы не отключите']])}),
         target: 'always', say: 'Для родных, которым вы доверяете, <strong>нажмите «Пока вы не отключите»</strong>.', hints: {'one-hour': 'Удобно для одной поездки. В этой тренировке выберите «Пока вы не отключите».'}},
    ]).concat([
        {screen: () => app(p, 'Передача геоданных Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah видит, где вы находитесь. ${p === 'ios' ? 'Нажмите «Остановить доступ»' : 'Нажмите «Остановить»'} — в любой момент.</p>`, {color: '#fff'}),
         question: {q: 'Человек, с которым вы только что познакомились в интернете, просит поделиться геопозицией. Стоит ли?', options: [
            {t: 'Нет. Делитесь только с близкими родными или друзьями, которым доверяете', ok: true, why: 'Верно. Геопозиция показывает, где вы живёте и когда вас нет дома. Делитесь ею только с теми, кому доверяете.'},
            {t: 'Да, они кажутся милыми', why: 'Делитесь геопозицией только с близкими родными и друзьями. Она показывает, где вы живёте и когда вас нет дома.'}]}},
        {screen: () => app(p, 'Передача геоданных Sarah', '<p class="cf">Sarah видит, где вы находитесь.</p>', {color: '#fff'}), done: true,
         say: '<strong>Отлично!</strong> Sarah видит, что у вас всё в порядке. Время от времени проверяйте, с кем вы делитесь, и прекращайте делиться с теми, кому это не нужно.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Ваш внук Leo получает свой первый iPhone. <strong>Экранное время</strong> задаёт разумные ограничения. Это телефон <strong>Leo</strong>. <strong>Нажмите «Настройки».</strong>'},
        {screen: c => list(p, 'Настройки', [{label: 'Leo', sub: 'Apple Account'}, {label: 'Уведомления'}, {id: 'screen-time', label: 'Экранное время'}, {label: 'Основные'}], {noBack: true}), target: 'screen-time', say: '<strong>Нажмите «Экранное время».</strong>'},
        {screen: c => list(p, 'Экранное время', [{id: 'downtime', label: 'В покое', sub: c.downtime ? '20:00 – 07:00' : 'Выкл.'}, {label: 'Лимиты приложений'}, {id: 'content', label: 'Контент и конфиденциальность', sub: c.content ? 'Вкл.' : 'Выкл.'}, {label: 'Использовать код-пароль Экранного времени'}], {back: 'Настройки'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>«В покое»</strong> блокирует большинство приложений на ночь (звонки при этом работают). <strong>Нажмите «В покое»</strong>, чтобы включить, с 20:00 до 7:00.'},
        {screen: c => list(p, 'Экранное время', [{label: 'В покое', sub: '20:00 – 07:00'}, {label: 'Лимиты приложений'}, {id: 'content', label: 'Контент и конфиденциальность', sub: c.content ? 'Вкл.' : 'Выкл.'}], {back: 'Настройки'}),
         target: 'content', action: c => { c.content = true; }, say: 'Теперь остановим неожиданные покупки и контент для взрослых. <strong>Нажмите «Контент и конфиденциальность».</strong>'},
        {screen: c => list(p, 'Контент и конфиденциальность', [{label: 'Контент и конфиденциальность', toggle: true}, {id: 'purchases', label: 'Покупки в App Store', value: c.noBuy ? 'Не разрешать' : 'Разрешить'}, {label: 'Веб-контент', value: 'Ограничить сайты для взрослых'}], {back: 'Экранное время'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Сайты для взрослых теперь ограничены. <strong>Нажмите «Покупки в App Store»</strong>, чтобы остановить покупки внутри приложений.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Ваш внук Leo получает свой первый телефон Android. Бесплатное приложение Google <strong>Family Link</strong> задаёт разумные ограничения с <strong>вашего</strong> телефона. <strong>Откройте Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Нажмите Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Элементы управления'}, {id: 'screen-time', label: 'Экранное время', sub: c.downtime ? 'Время сна 20:00 – 07:00' : 'Без ограничений'}, {id: 'content', label: 'Ограничения контента', sub: c.noBuy ? 'Покупки требуют вашего подтверждения' : 'Google Play: разрешить всё'}, {label: 'Геолокация', sub: 'Вкл.'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Нажмите «Экранное время»</strong>, чтобы задать время сна с 20:00 до 7:00, когда телефон блокируется (звонки при этом работают).'},
        {screen: c => list(p, 'Leo', [{caption: 'Элементы управления'}, {label: 'Экранное время', sub: 'Время сна 20:00 – 07:00'}, {id: 'content', label: 'Ограничения контента', sub: c.noBuy ? 'Покупки требуют вашего подтверждения' : 'Google Play: разрешить всё'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Теперь остановим неожиданные траты. <strong>Нажмите «Ограничения контента»</strong>, чтобы покупки требовали вашего подтверждения.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Экранное время' : 'Leo', [{label: p === 'ios' ? 'В покое' : 'Экранное время', sub: '20:00 – 07:00'}, {label: 'Покупки', sub: p === 'ios' ? 'Не разрешать' : 'Требуют подтверждения'}]),
         question: {q: 'Что важнее всего вместе с настройками?', options: [
            {t: 'Разговоры с ребёнком: он всегда может рассказать вам, если что-то в интернете его расстроило', ok: true, why: 'Да. Ни одна настройка не ловит всё. Важнее всего быть человеком, с которым можно поговорить.'},
            {t: 'Настройки делают всё', why: 'Они очень помогают, но не ловят всё. Пусть ребёнок знает, что всегда может поговорить с вами.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Экранное время' : 'Leo', [{label: 'В покое', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Отлично!</strong> У Leo есть время сна, и он не может тратить деньги, не спросив. ' + (p === 'ios' ? 'Задайте код-пароль Экранного времени, чтобы менять эти настройки могли только вы.' : 'Family Link позволяет менять эти настройки со своего телефона в любое время.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Проводник', mac: 'Finder', linux: 'Файлы'},
        settings: {windows: 'Настройки', mac: 'Системные настройки', linux: 'Системные настройки'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Менеджер программ'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Пуск', mac: 'Приложения', linux: 'Меню'},
        editor: {windows: 'Блокнот', mac: 'TextEdit', linux: 'Текстовый редактор'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Почта', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Менеджер обновлений', terminal: 'Терминал', trash: 'Корзина', apps: 'Приложения', chrome: 'Chrome', shield: 'Безопасность Windows', fw: 'Брандмауэр'}[kind]);

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
        windows: {title: 'Корзина', empty: 'Очистить корзину', confirm: n => `Вы уверены, что хотите навсегда удалить эти объекты (${n})?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Предлагал помощь с каждым начатым вами письмом. На пенсии с 2007 года.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Новичок: 999 секунд. Мы об этом не говорим.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Выигрывали партию, и карты прыгали вниз по экрану. Дважды щёлкните меня!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Скрииип… бом… кссшшш. И никто не мог пользоваться телефоном, пока вы были в интернете.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Зелёный холм и синее небо на миллионах экранов с 2001 года.', ''],
            ['⟦save⟧', 'Floppy disk (A:)', '1,44 МБ. Кнопка «Сохранить» до сих пор выглядит именно так.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D-пинбол, бесплатно с Windows, пока Vista его не убрала.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'Вам присылали «толчок», и весь экран трясся. Дважды щёлкните меня!', 'shake'],
            ['⟦file-text⟧', 'Letter to council FINAL (2) (final).doc', 'У каждого такой есть.', ''],
        ]},
        mac: {title: 'Корзина', empty: 'Очистить корзину', confirm: () => 'Вы уверены, что хотите навсегда стереть объекты из корзины? Это действие нельзя отменить.', items: [
            ['⟦rainbow⟧', 'Spinning beach ball', 'Радужное колесо, которое означало «подождите»… и ждите. Дважды щёлкните меня!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Прозрачный, яйцевидный и синий. Такой был в каждой школе.', ''],
            ['⟦music⟧', 'iPod с колесом прокрутки', '1000 песен в кармане. Круг за кругом большим пальцем.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Маленький улыбающийся компьютер, который встречал вас при каждом включении.', ''],
            ['⟦bell⟧', 'Звук запуска', 'Тот самый громкий аккорд при включении. Многие до сих пор по нему скучают.', ''],
            ['⟦droplet⟧', 'Кнопки Aqua', 'Такие блестящие и голубые, что их хотелось лизнуть.', ''],
            ['⟦calendar-days⟧', 'Виджеты Dashboard', 'Калькулятор, погода и стикер на отдельном слое. Исчезли в 2019 году.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Здесь мы все записывали диски и синхронизировали свои iPod.', ''],
        ]},
        linux: {title: 'Корзина', empty: 'Очистить корзину', confirm: () => 'Удалить из корзины все объекты? Все объекты в корзине будут удалены навсегда.', items: [
            ['⟦bird⟧', 'Пингвин Tux (плюшевый)', 'Талисман Linux с 1996 года. Его очень хочется обнять.', ''],
            ['⟦eye⟧', 'xeyes', 'Пара глаз, которые следят за указателем мыши. Дважды щёлкните меня!', 'eyes'],
            ['⟦app-window⟧', 'Колышущиеся окна', 'Старые эффекты рабочего стола заставляли окна колыхаться, как желе, когда их перетаскивали. Дважды щёлкните меня!', 'wobble'],
            ['⟦save⟧', 'Установочные дискеты 1–50', 'Ранний Linux мог устанавливаться с целой коробки дискет.', ''],
            ['⟦disc⟧', 'Бесплатный диск Ubuntu по почте', 'Диск с Linux можно было заказать бесплатно, и его присылали по почте.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Это предсказывают каждый год примерно с 1999-го. Может, в этот раз получится?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'У каждого выпуска Linux Mint женское имя, например Zena, Xia и Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Старая шутка: скажите «sudo», и компьютер делает, что велено.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Эта папка пуста.' : 'The ' + egg.title + ' пуста.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Дважды щёлкните по чему-нибудь, чтобы посмотреть.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Нет' : 'Отмена'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Да' : 'Пусто'}</button></div></div>` : '';
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
        ['Холмистая местность', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Бирюзовый 95', '#008080'],
        ['Тонкие полоски', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Ночное небо', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Побережье', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Самый известный каламбур про Wi-Fi.'],
        ['The LAN Before Time', 'LAN — это «локальная сеть». Эта очень-очень старая.'],
        ['Abraham Linksys', 'Восемьдесят семь мегабит тому назад…'],
        ['Bill Wi the Science Fi', 'Наука рулит!'],
        ['Drop It Like It\'s Hotspot', 'Чья-то точка доступа на телефоне, с чувством юмора.'],
        ['Silence of the LANs', 'Очень-очень тихая сеть.'],
        ['Tell My Wi-Fi Love Her', 'Как мило.'],
        ['Get Off My LAN', 'Наверное, сердитый сосед.'],
        ['Bridlington Seagulls', 'Они уже забрали вашу картошку. Не отдавайте им ещё и пароль.'],
        ['FREE WIFI (honest)', 'Сеть под названием «free Wi-Fi», которую вы не знаете, — как раз такая, к которой подключаться не стоит!'],
    ];

    const FORTUNES = ['Сегодня хороший день, чтобы сохранить копию своих фото.', 'Надёжный пароль — счастливый пароль.', 'Вам позвонят. Это будут мошенники. Положите трубку.',
        'А вы пробовали выключить и снова включить?', 'Лучшее время для обновления было вчера. Второе лучшее время — сейчас.', 'Чашка чая решает почти всё. Кроме компьютеров.',
        'Никогда не говорите пароль незнакомцу. Или чайке.', 'Вы найдёте пульт. Он завалился за диван.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP-адрес: 192.168.1.42<br>Роутер: 192.168.1.1<br>Сигнал: −54 дБм (очень хороший)<br>Канал: 36 (5 ГГц)<br>Скорость: 866 Мбит/с<br>Защита: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi выключен. Включите его, чтобы увидеть сети.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Нет интернета</strong><br>Проверьте Wi-Fi. Нажмите <kbd>пробел</kbd> или коснитесь, чтобы играть.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>ИГРА ОКОНЧЕНА · нажмите пробел, чтобы сыграть снова</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Вы сегодня мычали?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Попробуйте: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Муу!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Вы набрали «sl» вместо «ls»? Получайте паровозик.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | ОС: Linux Mint 22.3 (учебная) | | | | | | Рабочий стол: Cinnamon | | | | | | Оболочка: bash | \\_____/ | Время работы: с завтрака \\___________/ Память: никогда не забывает дни рождения`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Хорошо. 🥪');
        else if (lc === 'make me a sandwich') say('Что? Сделайте сами.');
        else if (/rm\s+-rf/.test(lc)) say('Хорошая попытка! В этом учебном терминале ничего нельзя сломать.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: команда не найдена (попробуйте «help»)`);
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
        else if (note) note.textContent = 'Этот учебный браузер не ищет в настоящем интернете. Ничего из того, что вы вводите, никуда не отправляется.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Первоапрельская шутка! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Чит-код активирован! +30 жизней 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Welcome to Macintosh.</p></div><p>Чит-код активирован! +30 жизней 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Чит-код активирован! +30 жизней 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Остальные окна убраны.' : 'Aero Shake! (Других окон, чтобы их убрать, не было.)');
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
                funToast(screen, 'Wi-Fi включён. Подключено к Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi выключен.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Подключайтесь только к известным сетям.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Первоапрельская шутка! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Вид'], ['', 'Сортировать по'], ['refresh', 'Обновить'], ['', 'Новый'], ['wall', 'Персонализация']]
                : os === 'mac' ? [['', 'Новая папка'], ['', 'Свойства'], ['wall', 'Сменить обои рабочего стола…'], ['', 'Использовать стопки']]
                : [['', 'Создать папку'], ['terminal', 'Открыть в терминале'], ['wall', 'Изменить фон рабочего стола']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Обои: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (учебная версия)</small>
                <dl><dt>Чип</dt><dd>Bridlington Silicon B1</dd><dt>Память</dt><dd>Никогда не забывает дни рождения</dd><dt>Загрузочный диск</dt><dd>Practice HD</dd><dt>Серийный номер</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Блокнот' : os === 'mac' ? 'TextEdit' : 'Текстовый редактор';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Без имени – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Стр 1, стлб 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Обычный текст'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Добро пожаловать! Это учебный терминал. Введите «help», чтобы увидеть, что можно попробовать. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Погода'], ['news', '⟦newspaper⟧', 'Новости'], ['bus', '⟦bus⟧', 'Расписание автобусов'], ['recipes', '⟦cake-slice⟧', 'Рецепты']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Погода в Bridlington</h3><p class="fd">Учебный прогноз</p><div class="ajf">${[['Сегодня', '⟦cloud-sun⟧', '13°'], ['Пт', '⟦cloud-rain⟧', '11°'], ['Сб', '⟦wind⟧', '10°'], ['Вс', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Активность чаек: <strong>очень высокая</strong>. Берегите картошку фри.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Учебные новости</h3><ul class="news">
            <li><strong>Местный житель наконец нашёл пульт от телевизора</strong> за диваном, спустя три недели.</li>
            <li><strong>Чайку заметили с мороженым 99 Flake</strong>. Владелец мороженого «не в восторге».</li>
            <li><strong>Бабушка обыграла внука в видеозвонках</strong>: «Я просто нажала зелёную кнопку».</li>
            <li><strong>Исследование показало:</strong> 9 из 10 проблем с компьютером решаются выключением и повторным включением.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Расписание автобусов</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Бисквит «Виктория»</h3><p>Смешайте по 200 г масла, сахара и муки с разрыхлителем и 4 яйца. Выпекайте в двух формах при 180°C 20–25 минут. Прослоите джемом и кремом.</p><p class="fd">Совет: поставьте на телефоне таймер или попросите его: «Поставь таймер на 25 минут».</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Новая вкладка' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Введите запрос или веб-адрес'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Собака на пляже.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Список покупок.txt'], ['⟦file-text⟧', 'Письмо в совет.docx'], ['⟦folder⟧', 'Рецепты'], ['⟦file-spreadsheet⟧', 'Список рождественских открыток.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Счёт за муниципальный налог.pdf'], ['⟦file-text⟧', 'Расписание автобусов.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Духовой оркестр на набережной.mp3'], ['⟦music⟧', 'Хиты шестидесятых.mp3']],
    };
    function funFiles(screen, os, folder = 'Изображения', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Корзина' : os === 'mac' ? 'Корзина' : 'Корзина'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Собака на пляже.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Подключено к Home-WiFi-5G' : 'Wi-Fi выключен.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Персонализация' : os === 'mac' ? 'Обои' : 'Фоны'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Центр обновления Windows' : os === 'mac' ? 'Обновление ПО' : 'Обновления'}</h3><p class="mj">⟦check⟧ У вас установлены все обновления</p><p class="cf">Последняя проверка: сегодня, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Проверить наличие обновлений</button><p class="zi"></p>`,
            about: `<h3>О программе</h3><div class="zk"><div><span>Имя устройства</span><b>MARGARET-PRACTICE</b></div><div><span>Система</span><b>${os === 'windows' ? 'Windows 11 (учебная версия)' : os === 'mac' ? 'macOS 27 (учебная версия)' : 'Linux Mint 22.3 (учебная версия)'}</b></div>
                <div><span>Процессор</span><b>Bridlington Silicon B1</b></div><div><span>Память</span><b>Никогда не забывает дни рождения</b></div><div><span>Хранилище</span><b>Много места для фото внуков</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Персонализация' : os === 'mac' ? 'Обои' : 'Фоны'], ['update', 'Обновления'], ['about', 'Об этом устройстве']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Practice Mines', 'Классическая игра в поиск мин.'], ['solitaire', '⟦spade⟧', 'Пасьянс', 'Скоро в этом учебном магазине.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Скоро в этом учебном магазине.'], ['weather', '⟦cloud-sun⟧', 'Погода', 'Скоро в этом учебном магазине.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Открыть' : (os === 'mac' ? 'Загрузить' : 'Установить')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Practice Mines', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Щёлкните, чтобы копать. Щёлкните правой кнопкой (или нажмите и удерживайте), чтобы поставить флажок.</p></div>`, 'bz'));
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
        ['Мама', 'Как выключить эту штуку?', 'Здравствуй, дорогой, я написала это письмо, но не могу найти кнопку выключения. Это круглая? Целую, мама xx P.S. Я её нажала. Ничего не произошло. Так и должно быть?'],
        ['Bridlington Walkers', 'Субботняя прогулка', 'Встречаемся на гавани в 10:00. Возьмите термос и непромокаемую куртку. Случай с чайкой на прошлой неделе обсуждать не будем.'],
        ['Принц Абу (Очень богатый)', 'СРОЧНО: вы выиграли £4 000 000!!!', 'Дорогой Возлюбленный Друг, я принц, и мне нужны данные вашего банковского счёта, чтобы отправить вам четыре миллиона фунтов. Пожалуйста, также вышлите £50 на марку. — Это мошенничество! Настоящие люди не раздают миллионы по электронной почте. Удалите письмо или перешлите его на report@phishing.gov.uk.'],
        ['Sarah', 'Фото с воскресенья 🌻', 'Вот фото из сада. Собака съела ещё один подсолнух.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Почта', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Это учебный компьютер, поэтому его нельзя выключить 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Загрузки', '⟦triangle-alert⟧ Программы «бесплатной очистки» часто бесполезны или хуже. Лучше удалить её, а не открывать!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `На настоящем компьютере здесь открылся бы «${n}».`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi включён.' : 'Wi-Fi выключен.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Проверка обновлений…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Новых обновлений нет. Всё готово!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Это только для вида в учебном магазине.'); return true; }
            el.textContent = 'Установка…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Открыть'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Без имени 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Файл Правка Вид Вставка Формат <b>Ж</b> <i>К</i> <u>Ч</u></div><textarea class="vk agd" aria-label="Document">Уважаемые господа, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Менеджер обновлений', '<div class="ajz"><p class="mj">⟦check⟧ Ваша система обновлена</p><p class="cf">Linux Mint сама проверяет наличие обновлений и показывает точку на щите, когда они есть.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Введите здесь запрос для поиска</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Корзина', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Компьютер', '⟦monitor⟧')}${icon('Дом', '⟦house⟧')}${icon('Корзина', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Поиск приложений, настроек и документов')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Поиск')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Введите запрос…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Новая вкладка <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Введите запрос или веб-адрес</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Это <strong>рабочий стол</strong>. Полоса внизу — <strong>панель задач</strong>. Откройте веб-браузер через меню «Пуск»: <strong>нажмите «Пуск»</strong>, четыре квадрата.'
            : os === 'mac' ? 'Это <strong>рабочий стол</strong>. Ряд приложений внизу — <strong>Dock</strong>, а полоса вверху — <strong>строка меню</strong>. <strong>Нажмите «Приложения»</strong> (сетка из квадратов), чтобы увидеть все приложения.'
            : 'Это <strong>рабочий стол</strong> в Linux Mint. Полоса внизу — <strong>панель</strong>. Ваши приложения находятся в меню: <strong>нажмите «Меню»</strong> слева внизу.',
         hint: os === 'mac' ? '«Приложения» находятся в Dock внизу, рядом с Finder.' : (os === 'windows' ? '«Пуск» — это четыре синих квадрата на панели задач.' : 'Кнопка «Меню» находится в левом краю нижней панели.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Нажмите ${N.browser[os]}</strong>, веб-браузер.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'У каждого окна есть три цветные кнопки <strong>вверху слева</strong>. Жёлтая убирает окно. <strong>Нажмите жёлтую кнопку.</strong>'
            : 'У каждого окна есть три кнопки <strong>вверху справа</strong>. Линия <strong>—</strong> убирает окно (сворачивает). <strong>Нажмите —</strong>.',
         hints: {'win-close': 'Это закроет окно. Сначала уберите его кнопкой: ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Это развернёт окно на весь экран. Сначала уберите его.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Окно скрыто, а не закрыто. ${os === 'mac' ? 'Точка под значком в Dock' : 'line under its icon'} показывает, что оно ещё открыто. <strong>Нажмите на значок ${N.browser[os]}</strong>, чтобы вернуть его.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Теперь разверните окно на весь экран: <strong>нажмите кнопку ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'На Mac красная кнопка закрывает окно. Но приложение может продолжать работать. Как полностью выйти из него?', options: [
                {t: 'Нажать ⟦command⟧ Cmd + Q или выбрать «Завершить» в меню приложения вверху', ok: true, why: 'Да. Точка под приложением в Dock означает, что оно ещё работает. ⟦command⟧ Cmd + Q завершает его.'},
                {t: 'Дважды нажать красную кнопку', why: 'Красная кнопка только закрывает окна. ⟦command⟧ Cmd + Q (или меню приложения > «Завершить») завершает работу приложения.'}]}
            : {q: 'Где находится кнопка закрытия окна?', options: [
                {t: 'Вверху справа: ⟦x⟧', ok: true, why: 'Да. В Windows и Linux Mint три кнопки находятся вверху справа. (На Mac они вверху слева, красная, жёлтая и зелёная.)'},
                {t: 'Внизу слева', why: 'Она вверху справа в каждом окне: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Отлично!</strong> Вы умеете открывать, скрывать, возвращать, увеличивать и закрывать окна. Это почти всё, что нужно для работы с компьютером.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Дом' : 'Дом'], ['desktop', 'Рабочий стол'], ['documents', 'Документы'], ['downloads', 'Загрузки'], ['pictures', 'Изображения']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB-накопитель']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Документы'], ['pictures', '⟦folder⟧', 'Изображения'], ['downloads', '⟦folder⟧', 'Загрузки']],
            downloads: [['photo', '⟦image⟧', 'Фото из отпуска.jpg'], ['bill', '⟦file-text⟧', 'Счёт за муниципальный налог.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Фото из отпуска.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Отпуск')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Письмо в совет.docx'], ['recipes', '⟦folder⟧', 'Рецепты']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Документы']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Новая папка', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Дом' : 'Дом', downloads: 'Загрузки', pictures: 'Изображения', documents: 'Документы', usb: 'USB-накопитель', desktop: 'Рабочий стол'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Эта папка пуста</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Копировать' : 'Копировать';
    const pasteLabel = os => os === 'mac' ? 'Вставить объект' : 'Вставить';
    const newFolderLabel = os => os === 'mac' ? 'Новая папка' : os === 'windows' ? 'Создать > Папку' : 'Создать папку';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Ваши фото и письма хранятся в <strong>папках</strong>. <strong>Нажмите ${N.files[os]}</strong>, чтобы посмотреть их.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'слева в Dock' : 'на ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Слева находятся ваши основные папки. Всё, что вы скачиваете из писем и с сайтов, попадает в <strong>«Загрузки»</strong>. <strong>Нажмите «Загрузки».</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Открыть'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Переименовать'], ['menu-delete', os === 'mac' ? 'Переместить в корзину' : 'Удалить']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Скопируем фото из отпуска в «Изображения», где ему место. <strong>Щёлкните правой кнопкой</strong> на <strong>Фото из отпуска.jpg</strong>: нажмите <strong>правую</strong> кнопку мыши. <em>' + (os === 'mac' ? 'На трекпаде щёлкните двумя пальцами.' : 'На сенсорном экране нажмите и удерживайте.') + '</em>',
         hint: 'Используйте правую кнопку мыши на фото.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Появляется меню. <strong>Нажмите ${copyLabel(os)}.</strong> <em>(Сочетание клавиш: ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Не тот пункт! Нажмите «Копировать».', 'menu-open': 'Так фото откроется. Нажмите «Копировать».', 'menu-rename': 'Нажмите «Копировать».'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Нажмите «Изображения»</strong> слева.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'В «Изображениях» пусто. <strong>Щёлкните правой кнопкой на пустом белом месте.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Нажмите ${pasteLabel(os)}.</strong> <em>(Или ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Папку создадим следом. Сначала нажмите ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Теперь фото есть и в «Изображениях». Создайте папку, чтобы хранить фото из отпуска вместе. <strong>Снова щёлкните правой кнопкой на пустом месте.</strong>', hints: {'rc-photo2': 'Щёлкните правой кнопкой на пустом месте, а не на фото.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Нажмите ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Сначала введите название папки, например «Отпуск».',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Введите название</strong>, например <strong>«Отпуск»</strong>, затем <strong>нажмите OK</strong> (или нажмите Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Куда обычно попадают файлы из писем и с сайтов?', options: [
            {t: 'В папку «Загрузки»', ok: true, why: 'Да. Если не можете найти скачанное, сначала загляните в «Загрузки».'},
            {t: 'На рабочий стол', why: 'Обычно в «Загрузки». Если не можете что-то найти, посмотрите сначала там.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Отлично!</strong> Щелчок правой кнопкой — секрет почти всего: копирование, вставка, переименование и создание папки находятся в этом меню.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Введите пароль сети</p>${field('wifipass', 'Пароль', ctx)}<button type="button" class="ce co" data-tap="connect">Подключиться</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Сети Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Подключено к Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Чтобы подключиться к Wi-Fi, <strong>нажмите значок Wi-Fi</strong> ${os === 'mac' ? 'вверху справа на экране' : 'внизу справа, рядом с часами'}.`, hint: os === 'mac' ? 'Он в строке меню вверху справа.' : 'Он рядом с часами внизу справа.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Название вашей сети написано на наклейке на роутере. Эта учебная — <strong>Home-WiFi-5G</strong>. <strong>Нажмите на неё.</strong>', hints: {'net-neighbour': 'Это сеть соседей! Выберите Home-WiFi-5G.', 'net-cafe': 'Это не ваша домашняя сеть. Выберите Home-WiFi-5G.', 'tray-wifi': 'Список сетей Wi-Fi уже открыт. Нажмите Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Введите пароль точно: Green-Apple-42 (заглавные G и A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Введите пароль с наклейки <strong>точно</strong>: <strong>Green-Apple-42</strong>. Затем <strong>нажмите «Подключиться»</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Панель Wi-Fi уже открыта. Введите пароль в поле, затем нажмите «Подключиться».'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Вы в кафе с бесплатным Wi-Fi. Можно ли пользоваться им для онлайн-банка?', options: [
            {t: 'Лучше подождать до дома или использовать мобильный интернет телефона', ok: true, why: 'Да. Бесплатный Wi-Fi подходит для просмотра сайтов, но для банка используйте домашний Wi-Fi или мобильный интернет.'},
            {t: 'Да, любой Wi-Fi подойдёт', why: 'Бесплатный общедоступный Wi-Fi подходит для просмотра сайтов, но банк оставьте для дома или мобильного интернета.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Отлично!</strong> Компьютер запомнит пароль и в следующий раз подключится сам.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Список покупок: молоко, хлеб, яйца, чайные пакетики, открытка на день рождения для Jean';
        const note = pcWin(os, `Список покупок – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Новое письмо для Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Нажмите здесь, чтобы написать…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Почта' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Сочетания клавиш избавляют от множества щелчков. <strong>${CMDL(os)}</strong> — это клавиша ${os === 'mac' ? 'по обе стороны от пробела, с надписью ⟦command⟧' : 'в левом нижнем углу клавиатуры'}. Чтобы выделить весь текст, удерживайте <strong>${CMDL(os)}</strong> и нажмите <strong>A</strong>. <em>Используйте настоящую клавиатуру или кнопки на экране.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Текст выделен. Теперь скопируйте его: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Скопировано! <strong>Щёлкните внутри письма</strong> для Sarah, где написано «Нажмите здесь, чтобы написать».'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Теперь вставьте: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Ой, вы случайно что-то удалили. Какое сочетание клавиш отменяет это?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Да. ${CMDL(os)} + Z отменяет последнее действие почти в любом приложении. Нажмите ещё раз, чтобы отменить больше.`},
            {t: 'Escape', why: `Escape закрывает меню. ${CMDL(os)} + Z — это отмена.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Как сделать снимок экрана (картинку того, что на экране)?', options: [
            {t: os === 'windows' ? 'Клавиша Windows + Shift + S, затем выделите нужную область' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, затем выделите нужную область' : 'Нажать клавишу Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Да. Снимок копируется, а уведомление позволяет его сохранить. Клавиша Print Screen тоже работает.' : os === 'mac' ? 'Да. Снимок сохраняется на рабочем столе. Shift + ⟦command⟧ Cmd + 3 снимает весь экран.' : 'Да. Linux Mint сохраняет его в папке «Изображения». Shift + Print Screen позволяет выбрать область.'},
            {t: 'Сфотографировать экран телефоном', why: 'Это сработает, но снимок экрана гораздо чётче. ' + (os === 'windows' ? 'Клавиша Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Нажмите Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Отлично!</strong> Большая четвёрка: <strong>${CMDL(os)} + C</strong> копировать, <strong>V</strong> вставить, <strong>Z</strong> отменить, <strong>A</strong> выделить всё. Они работают почти в любом приложении.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Бесплатно', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Бесплатно · Покупки в приложении', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Поиск приложений</span></button><div class="hp"><span>ВЫБОР РЕДАКЦИИ</span><strong>Приложения для нового компьютера</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Открыть' : (os === 'mac' ? 'Загрузить' : 'Установить')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Установка LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Учебный магазин: названия и цены приведены для примера.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Самое безопасное место для получения приложений — встроенный магазин: <strong>${N.store[os]}</strong>. <strong>Щёлкните его.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Вам нужна программа для писем, вроде Word. <strong>Щёлкните поле поиска.</strong> Мы поищем «office».'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> — бесплатная альтернатива Microsoft Office от <strong>The Document Foundation</strong>. Проверьте, кто его выпустил, затем <strong>нажмите ' + (os === 'mac' ? 'Загрузить' : 'Установить') + ' рядом с LibreOffice</strong>.',
         hints: {'get-fake1': 'Это реклама, и с вас берут £29.99 в год. LibreOffice бесплатный.', 'get-fake2': 'Это от AppMakers, и там есть покупки внутри приложения. Выберите LibreOffice от The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Всплывающее окно на сайте сообщает: «Ваш компьютер тормозит! Скачайте Speed Booster сейчас». Что вы сделаете?', options: [
            {t: 'Закрою его. Устанавливаю приложения только из магазина или с сайта самого разработчика', ok: true, why: 'Верно. Всплывающие окна с «ускорителями» или «очистителями» часто бесполезны или хуже.'},
            {t: 'Скачаю, вдруг поможет', why: 'Такие программы часто бесполезны или вредны. Устанавливайте только из магазина или с сайта самого разработчика.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Отлично!</strong> LibreOffice установлен. Проверяйте разработчика, не обращайте внимания на рекламу и остерегайтесь «бесплатных» приложений, которые потом просят денег.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Дом'], ['system', 'Система'], ['bluetooth', 'Bluetooth и устройства'], ['network', 'Сеть и Интернет'], ['accounts', 'Учётные записи'], ['privacy', 'Конфиденциальность и защита'], ['update', 'Центр обновления Windows']];
            const pages = {
                home: '<h3>Главная</h3><p class="cf">Рекомендуемые параметры и ваша учётная запись.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ У вас установлены все обновления</p>' : ctx.ready ? `<p class="cf">Для завершения установки обновлений требуется перезагрузка.</p><button type="button" class="ce co bz" data-tap="restart">Перезагрузить сейчас</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Загрузка… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Настройки', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Основные'], ['privacy', 'Конфиденциальность и безопасность'], ['users', 'Пользователи и группы']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ На вашем Mac установлена последняя версия ПО</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Загрузка… осталось около 10 минут' : 'Исправления безопасности и ошибок'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Конфиденциальность и безопасность</h3><p class="cf"><strong>Безопасность</strong><br>Разрешить использование приложений из:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store и от известных разработчиков</button>`,
            };
            return pcWin(os, 'Системные настройки', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Системные настройки</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Менеджер обновлений', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Ваша система обновлена</p>' : `<div class="ahf">${['Веб-браузер Firefox', 'Ядро Linux (безопасность)', 'LibreOffice', 'Системные библиотеки'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Установка обновлений…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Требуется аутентификация</strong></p><p class="fd">Введите пароль, чтобы установить обновления. (Тренировка: введён за вас.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Отмена</button><button type="button" class="adg" data-tap="auth-ok">Аутентифицироваться</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Обновления закрывают бреши в безопасности, которыми пользуются мошенники. Давайте проверим их наличие. <strong>Нажмите «Пуск».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Нажмите «Параметры»</strong> (шестерёнка).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Нажмите «Центр обновления Windows»</strong> внизу списка слева.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Обновления ждут установки. <strong>Нажмите «Скачать и установить все».</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Сначала сохраните всё, над чем работаете, затем <strong>нажмите «Перезагрузить сейчас»</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Обновления закрывают бреши в безопасности, которыми пользуются мошенники. <strong>Нажмите меню Apple</strong> (логотип) вверху слева.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Нажмите «Системные настройки…»</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Вы в разделе «Основные». <strong>Нажмите «Обновление ПО».</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Обновление готово. Подключите зарядное устройство, затем <strong>нажмите «Обновить сейчас»</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac скачает его, затем перезагрузится для установки.',
         question: {q: 'Автоматические обновления включены. Нужно ли вам всё ещё что-то делать?', options: [
            {t: 'Просто перезагружать, когда просит, и время от времени оставлять на ночь на зарядке', ok: true, why: 'Да. Обновления часто устанавливаются ночью. Перезагрузка по запросу завершает их установку.'},
            {t: 'Выключить автоматические обновления', why: 'Оставьте их включёнными: они защищают вас. Просто перезагружайтесь, когда Mac попросит.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Обновления закрывают бреши в безопасности. В Linux Mint <strong>щит</strong> рядом с часами показывает точку, когда есть обновления. <strong>Нажмите на щит.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Менеджер обновлений показывает их все. <strong>Нажмите «Установить обновления».</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux просит <strong>ваш пароль</strong> перед любыми важными изменениями. Это хорошо. <strong>Нажмите «Аутентифицироваться».</strong>', hints: {'auth-cancel': 'Так обновления отменятся. Нажмите «Аутентифицироваться».'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Как часто нужно устанавливать обновления?', options: [
            {t: 'Всякий раз, когда на щите появляется точка: это занимает минуту', ok: true, why: 'Да. Linux Mint редко требует перезагрузки, кроме некоторых обновлений безопасности.'},
            {t: 'Раз в год', why: 'Устанавливайте их, когда на щите появляется точка. Это занимает всего минуту.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Отлично!</strong> Ваш компьютер обновлён. Регулярные обновления — лучшее, что можно сделать для безопасности.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Система', 'Экран, звук, о системе'], ['tile-devices', '⟦printer⟧', 'Устройства', 'Bluetooth, принтеры'], ['tile-network', '⟦globe⟧', 'Сеть и Интернет', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Учётные записи', 'Ваши счета'], ['tile-update', '⟦refresh-cw⟧', 'Обновление и безопасность', 'Центр обновления Windows']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Ваш компьютер зарегистрирован в программе расширенных обновлений безопасности</p><p class="cf">Обновления безопасности до 12 октября 2027 г.</p>' : `<div class="ahg"><strong>Поддержка Windows 10 закончилась</strong><p>Ваш компьютер не соответствует требованиям для работы Windows 11. Зарегистрируйтесь в программе расширенных обновлений безопасности, чтобы продолжать получать обновления безопасности.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Зарегистрироваться сейчас</button></div>`}`;
        else inner = `<h3>Расширенные обновления безопасности</h3><p class="cf">Выберите способ регистрации:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Резервное копирование параметров компьютера</strong><small>Бесплатно, с учётной записью Майкрософт</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Использовать 1000 баллов Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Разовая покупка</strong><small>Платно</small></button>${ctx.busy ? '<p class="cf">Регистрация…</p>' : ''}`;
        return pcWin('windows', 'Настройки', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Если ваш компьютер выглядит так, с «Пуском» в самом левом углу, возможно, у вас <strong>Windows 10</strong>. Давайте проверим. <strong>Нажмите «Пуск».</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Нажмите «Параметры»</strong> (шестерёнка).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Нажмите «Система».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Здесь написано Windows 10 Home. Что это значит в 2026 году?', options: [
            {t: 'Microsoft прекратила обычную поддержку в октябре 2025 года. Система работает, но для безопасности нужны расширенные обновления безопасности', ok: true,
             why: 'Да. Бесплатная программа расширенных обновлений безопасности для домашних пользователей действует до 12 октября 2027 года. После этого Windows 10 больше не получит исправлений безопасности.'},
            {t: 'Ничего, Windows 10 будет обновляться вечно', why: 'Обычная поддержка закончилась в октябре 2025 года. Расширенные обновления безопасности действуют до 12 октября 2027 года, затем прекращаются.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Нажмите ← Главная</strong>, чтобы вернуться.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Нажмите «Обновление и безопасность».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Этот ноутбук слишком старый для Windows 11, поэтому Windows предлагает <strong>расширенные обновления безопасности</strong>. <strong>Нажмите «Зарегистрироваться сейчас».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Бесплатный способ — сохранить свои параметры в учётной записи Майкрософт. <strong>Нажмите «Резервное копирование параметров компьютера».</strong>', hints: {'esu-buy': 'Платить не нужно. Выберите бесплатный вариант с резервным копированием.', 'esu-points': 'Это сработает, если у вас есть баллы, но вариант с резервным копированием бесплатен для всех.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Какие у вас варианты до октября 2027 года?', options: [
            {t: 'Перейти на Windows 11, если компьютер подходит, купить новый компьютер или установить на старый Linux Mint (бесплатно)', ok: true, why: 'Да. Linux Mint бесплатный и хорошо работает на старых ноутбуках. На следующих уроках показано, где что находится на Mac и в Linux Mint.'},
            {t: 'Продолжить пользоваться Windows 10 после 2027 года для банка', why: 'После октября 2027 года исправления безопасности выходить не будут, поэтому для банка она небезопасна. Перейдите на новую версию, замените компьютер или установите Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Отлично!</strong> Вы знаете, какая у вас Windows и как сохранять безопасность до октября 2027 года. Остерегайтесь звонков и всплывающих окон, предлагающих «обновить» вас за плату: это мошенничество.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Переходите с Windows? На Mac приложения находятся в <strong>Dock</strong> внизу, а меню каждого приложения — в <strong>строке меню</strong> вверху. <strong>Нажмите Safari</strong>, веб-браузер, в Dock.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Кнопки окна на Mac находятся <strong>вверху слева</strong>. <strong>Нажмите красную</strong>, чтобы закрыть окно.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Окно исчезло, но видите <strong>точку под Safari</strong> в Dock? Приложение всё ещё работает. Чтобы выйти из него, <strong>щёлкните правой кнопкой по Safari в Dock</strong> (двумя пальцами на трекпаде).', hint: 'Щёлкните правой кнопкой (или двумя пальцами) по значку Safari в Dock.',
         hints: {'app-browser': 'Обычный щелчок снова откроет его. Щёлкните правой кнопкой.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Нажмите «Завершить».</strong> <em>(Сочетание клавиш: ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Настройки находятся в <strong>меню Apple</strong> (логотип) вверху слева. <strong>Нажмите на него.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Здесь же «Выключить» и «Перезагрузить». <strong>Нажмите «Системные настройки…»</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системные настройки', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'В Windows копируют сочетанием Ctrl + C. А на Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Да. Большинство сочетаний Windows на Mac используют ⟦command⟧ Cmd вместо Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, так же', why: 'На Mac это ⟦command⟧ Cmd + C. Большинство сочетаний с Ctrl заменяются на ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системные настройки', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Отлично!</strong> Dock внизу, меню вверху, кнопки окна вверху слева, ⟦command⟧ Cmd вместо Ctrl и меню Apple для настроек и выключения.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> — бесплатная система, которая во многом похожа на Windows и хорошо работает на старых компьютерах. Ваши приложения находятся в <strong>меню</strong> слева внизу, как кнопка «Пуск». <strong>Нажмите «Меню».</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'В Linux Mint уже есть бесплатные приложения. Для писем используйте <strong>LibreOffice Writer</strong>, который работает как Microsoft Word. <strong>Нажмите на него.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Без имени 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Файл Правка Вид Вставка Формат <b>Ж</b> <i>К</i> <u>Ч</u></div><div class="vk">Уважаемые господа,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Можно ли открывать документы Word, которые вам присылают по почте?', options: [
            {t: 'Да. LibreOffice открывает и сохраняет файлы Word (.docx)', ok: true, why: 'Да. Когда сохраняете что-то для пользователя Word, выберите формат Word (.docx) в «Сохранить как».'},
            {t: 'Нет, для этого нужна Windows', why: 'LibreOffice открывает и сохраняет файлы Word (.docx), так что вы можете обмениваться документами с пользователями Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Без имени 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Уважаемые господа,</div></div>', {max: true})}),
         target: 'win-close', say: 'Кнопки окна находятся вверху справа, как в Windows. <strong>Нажмите ⟦x⟧</strong>, чтобы закрыть Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Теперь посмотрим, где взять ещё приложения. <strong>Снова нажмите «Меню».</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Менеджер программ</strong> — бесплатный магазин приложений Linux Mint. <strong>Нажмите на него.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Менеджер программ', `<div class="jo"><div class="gq">${ICON.search}<span>Поиск</span></div>
            <div class="aan">${['Интернет', 'Офис', 'Графика', 'Звук и видео', 'Игры', 'Доступность'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Тысячи бесплатных приложений, проверенных Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Нужно ли покупать антивирус для Linux Mint?', options: [
            {t: 'Нет. Обновляйте систему, берите приложения из Менеджера программ, и вы хорошо защищены', ok: true, why: 'Нет. В Linux мало вирусов. Обновления и встроенный брандмауэр справляются. Мошенничество в письмах и на сайтах по-прежнему актуально, так что будьте внимательны.'},
            {t: 'Да, самый дорогой', why: 'Нет. Обновляйте систему и берите приложения из Менеджера программ. Как обычно, остерегайтесь мошенничества в письмах и на сайтах.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Отлично!</strong> Меню слева внизу, закрытие вверху справа, LibreOffice для документов, Firefox для интернета, Менеджер программ для приложений и щит для обновлений.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB-накопитель подключён</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Перед тем как менять компьютер, скопируйте файлы на <strong>USB-накопитель</strong>. Вставьте его в USB-разъём сбоку компьютера. Здесь <strong>нажмите «Вставить USB-накопитель»</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB-накопитель подключён</div>'}), target: 'app-files', say: `<strong>Откройте ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Открыть'], ['menu-copy', 'Копировать'], ['menu-rename', 'Переименовать']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Ваши письма находятся в <strong>Документах</strong>. <strong>Щёлкните правой кнопкой по папке «Документы».</strong> <em>(Потом сделайте то же для «Изображений».)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Нажмите «Копировать».</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'USB-накопитель слева. <strong>Нажмите «USB-накопитель».</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Он пуст. <strong>Щёлкните правой кнопкой на пустом месте.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Нажмите ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Копирование 214 объектов… осталась 1 минута' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Извлечь']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Готово! Прежде чем вынимать накопитель, <strong>извлеките</strong> его, чтобы ничего не повредилось. <strong>Щёлкните правой кнопкой по «USB-накопитель»</strong> слева.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Нажмите «Извлечь».</strong> Теперь его можно безопасно вынуть.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Есть ли другой способ перенести файлы на новый компьютер?', options: [
            {t: 'Онлайн-хранилище: OneDrive, iCloud или Google Drive', ok: true, why: 'Да. Загрузите файлы со старого компьютера, войдите на новом, и они там. USB-накопитель тоже хорошая дополнительная копия.'},
            {t: 'Отправить себе по почте каждый файл по одному', why: 'Это заняло бы целую вечность! Используйте USB-накопитель или онлайн-хранилище вроде OneDrive, iCloud или Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Отлично!</strong> На новом компьютере вставьте накопитель, откройте его и скопируйте папки в «Документы» и «Изображения».'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Bridlington bus times ⟦star⟧ Рецепты</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Вход не выполнен</span><button type="button" data-tap="sync">Включить синхронизацию…</button><button type="button" data-tap="guest">Открыть гостевой профиль</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Войти через Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Тренировка: введено за вас.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Далее</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Включить синхронизацию?</strong></p><p class="fd">Ваши закладки, пароли и история будут сохраняться в аккаунте Google и появятся на всех ваших устройствах.</p><div class="jn"><button type="button" data-tap="cancel">Отмена</button><button type="button" class="adg" data-tap="yes-in">Да, включить</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Новая вкладка</span>${profile}</div><div class="qn">⟦search⟧ Введите запрос в Google или URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Синхронизация закладок…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Если на старом компьютере вы пользовались <strong>Chrome</strong>, вход перенесёт закладки и сохранённые пароли на новый. (Firefox и Edge работают так же.) <strong>Нажмите Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Нажмите значок человека</strong> вверху справа.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Нажмите «Включить синхронизацию…»</strong>', hints: {guest: 'Гостевой профиль ничего не сохраняет. Нажмите «Включить синхронизацию».'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Войдите через <strong>тот же аккаунт Google</strong>, что и на старом компьютере. <strong>Нажмите «Далее».</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Нажмите «Да, включить».</strong>', hints: {cancel: 'Так синхронизация остановится. Нажмите «Да, включить».'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Ваши закладки вернулись. Безопасно ли сохранять пароли в браузере?', options: [
            {t: 'Да, если у аккаунта Google надёжный пароль и двухэтапная аутентификация', ok: true, why: 'Да. Это гораздо безопаснее, чем использовать один пароль везде. Защитите сам аккаунт двухэтапной аутентификацией.'},
            {t: 'Нет, лучше записать их на стикер на экране', why: 'Менеджер паролей в браузере гораздо безопаснее записки на экране, если для аккаунта включена двухэтапная аутентификация.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Отлично!</strong> Ваши закладки и пароли переехали вместе с вами. На общедоступном или чужом компьютере синхронизацию не включайте.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Система'} Предупреждение безопасности ⚠️</strong>
            <p>Ваш компьютер ЗАРАЖЁН 5 вирусами! Данные вашего банка и фото в опасности.</p><p>Не выключайте компьютер. Позвоните в поддержку сейчас:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Позвонить</button><button type="button" data-tap="fake-close">Закрыть</button></div>
            <small>(Учебная мошенническая страница. Номер не настоящий.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Покинуть сайт?</strong></p><p class="fd">Внесённые изменения могут не сохраниться.</p><div class="jn"><button type="button" data-tap="stay">Остаться</button><button type="button" class="adg" data-tap="leave">Покинуть</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Это внезапно заняло весь экран, пока вы просматривали сайты. Это настоящее?', options: [
            {t: 'Нет. Это поддельный сайт, который пугает, чтобы вы позвонили мошенникам', ok: true, why: 'Верно. Настоящие предупреждения никогда не показывают номер для звонка. Не звоните и ничего не нажимайте на странице.'},
            {t: 'Да, быстро позвонить по номеру', why: 'Никогда не звоните. Это поддельная страница. «Сотрудники поддержки» попытаются получить контроль над вашим компьютером и деньгами.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Страница заняла весь экран, чтобы вы не видели, как её закрыть. Нажмите клавишу <strong>Esc</strong> (вверху слева на клавиатуре), чтобы выйти из полноэкранного режима.',
         hints: {'call-btn': 'Ни в коем случае! Нажмите клавишу Esc.', 'fake-close': 'Кнопки на странице могут быть ловушками. Лучше нажмите клавишу Esc на клавиатуре.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Теперь браузер виден. <strong>Закройте вкладку</strong> её кнопкой ⟦x⟧.',
         hints: {'call-btn': 'Ничего не нажимайте на странице. Закройте вкладку её кнопкой ⟦x⟧.', 'fake-close': 'Это часть мошеннической страницы. Используйте ⟦x⟧ на самой вкладке.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Она пытается удержать вас. <strong>Нажмите «Покинуть».</strong>', hints: {stay: 'Нажмите «Покинуть».'}},
        {screen: c => scareware(os, c), question: {q: 'А если она вообще не закрывается?', options: [
            {t: os === 'windows' ? 'Нажать Ctrl + Shift + Esc, чтобы открыть Диспетчер задач, выбрать браузер и нажать «Снять задачу»' : os === 'mac' ? 'Нажать ⟦command⟧ Cmd + Option + Esc и принудительно завершить браузер' : 'Щёлкнуть правой кнопкой по браузеру на панели и выбрать «Закрыть» или перезагрузить компьютер',
             ok: true, why: 'Да. Когда снова откроете браузер, не позволяйте ему восстанавливать старые страницы. Перезагрузка компьютера тоже помогает.'},
            {t: 'Позвонить по номеру, чтобы получить помощь в закрытии', why: 'Никогда не звоните по нему. ' + (os === 'windows' ? 'Используйте Ctrl + Shift + Esc (Диспетчер задач), чтобы закрыть браузер.' : os === 'mac' ? 'Используйте ⟦command⟧ Cmd + Option + Esc для принудительного завершения.' : 'Закройте браузер с панели или перезагрузите компьютер.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Отлично!</strong> Ваш компьютер никогда не был заражён: это была просто веб-страница. Если вы всё же позвонили по такому номеру, свяжитесь с банком и смените пароли с другого устройства.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Безопасность Windows', `<div class="aif"><h3>Защита от вирусов и угроз</h3><p class="mj">⟦check⟧ Текущих угроз нет</p>
                <p class="cf">Последняя проверка: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Выполняется быстрая проверка… проверено 12 840 файлов</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Защита от вирусов</span><span>⟦check⟧ Брандмауэр</span><span>⟦check⟧ Управление приложениями и браузером</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Настройка брандмауэра', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Брандмауэр включён</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'В Windows есть встроенный бесплатный антивирус, он называется <strong>«Безопасность Windows»</strong>. Давайте проверим, что он работает. <strong>Нажмите «Пуск».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Нажмите «Параметры».</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Нажмите «Конфиденциальность и защита»</strong> слева.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Нажмите «Безопасность Windows».</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Зелёные галочки означают, что вы защищены. Для спокойствия <strong>нажмите «Быстрая проверка»</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Нужно ли платить ещё за один антивирус?', options: [
            {t: 'Нет. «Безопасности Windows» достаточно для большинства людей, а два антивируса могут замедлить компьютер', ok: true, why: 'Да. Обновляйте Windows и держите «Безопасность Windows» включённой. Платные антивирусы часто только добавляют всплывающие окна и подписки.'},
            {t: 'Да, чем больше, тем лучше', why: 'Два антивируса могут мешать друг другу и замедлять работу. «Безопасности Windows» достаточно для большинства людей.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'В Mac есть встроенная бесплатная защита, которая в фоне проверяет приложения и файлы. Давайте проверим одну настройку. <strong>Нажмите меню Apple</strong> (логотип).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Нажмите «Системные настройки…»</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Нажмите «Конфиденциальность и безопасность»</strong> слева.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Выбрано «Разрешить использование приложений из App Store и от известных разработчиков». Стоит ли это менять?', options: [
            {t: 'Нет, оставить. Это блокирует приложения от неизвестных разработчиков', ok: true, why: 'Да. Если сайт просит изменить это, чтобы что-то установить, это серьёзный тревожный признак.'},
            {t: 'Да, разрешить приложения из любых источников', why: 'Оставьте как есть. Это не пускает приложения от неизвестных разработчиков. Если сайт просит это изменить, это тревожный признак.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системные настройки', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Нужно ли покупать антивирус для Mac?', options: [
            {t: 'Большинству не нужно. Обновляйте систему и устанавливайте приложения только из надёжных мест', ok: true, why: 'Да. Обновления и встроенная защита справляются. Всплывающие окна о заражении Mac — это мошенничество.'},
            {t: 'Да, любой, который предложит всплывающее окно', why: 'Всплывающие окна с предложением антивируса для Mac обычно мошеннические. Лучше обновляйте Mac.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'В Linux Mint есть встроенный <strong>брандмауэр</strong>, который блокирует нежелательные подключения. Он выключен, пока вы его не включите. <strong>Нажмите «Меню».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Нажмите «Брандмауэр».</strong> <em>(Если не видите его, введите «брандмауэр» в поиск по меню.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Нажмите переключатель «Состояние»</strong>, чтобы включить брандмауэр.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Что ещё защищает Linux Mint?', options: [
            {t: 'Установка обновлений, когда на щите появляется точка, и получение приложений из Менеджера программ', ok: true, why: 'Да. И обычные правила: осторожнее со ссылками в письмах и всплывающими окнами.'},
            {t: 'Больше ничего не нужно', why: 'Продолжайте устанавливать обновления и берите приложения из Менеджера программ. Мошенничество в письмах и на сайтах по-прежнему актуально.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Отлично!</strong> Встроенная защита вашего компьютера включена. Обновления, осторожность со ссылками и установка только из надёжных мест сделают остальное.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Доставка посылок</strong><span>Мы вас не застали: назначьте доставку заново сегодня</span></button>
            <div class="lx"><strong>Sarah</strong><span>Фото с воскресенья</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Субботняя прогулка</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Доставка посылок</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Мы пытались доставить вашу посылку сегодня, но дома никого не было. Для повторной доставки необходимо заплатить £1.45.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Назначить доставку заново</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Сообщить о фишинге</button><button type="button" data-tap="reply">Ответить</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Почта', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Сообщение отправлено и перемещено в «Нежелательные»</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Вот ваша почта в браузере. <strong>Откройте письмо от «Доставки посылок».</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'На компьютере можно проверить, куда на самом деле ведёт ссылка, <strong>не нажимая на неё</strong>. <strong>Наведите мышь на «Назначить доставку заново»</strong> и подержите неподвижно. <em>(На сенсорном экране нажмите и удерживайте.)</em>',
         hints: {'click-link': 'Не нажимайте! Просто задержите указатель мыши над ссылкой.'}, hint: 'Задержите указатель мыши над синей ссылкой, не нажимая.'},
        {screen: c => webmail(os, c), question: {q: 'Внизу появляется настоящий адрес: parcel-redelivery.example.top. Он безопасен?', options: [
            {t: 'Нет. Это не сайт настоящей службы доставки, и они требуют плату', ok: true, why: 'Да. Курьеры не берут небольшие сборы по почте или SMS. Настоящий адрес выдаёт мошенников.'},
            {t: 'Да, в нём есть слово «parcel»', why: 'Любой может вставить «parcel» в веб-адрес. Это не настоящий курьер, и сбор — это и есть мошенничество.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Нажмите «Сообщить о фишинге».</strong> Мошеннические письма также можно пересылать на report@phishing.gov.uk.', hints: {reply: 'Никогда не отвечайте мошенникам. Нажмите «Сообщить о фишинге».', 'click-link': 'Не нажимайте на ссылку! Лучше сообщите о ней.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Отлично!</strong> Наведите, прежде чем нажимать: если адрес не совпадает с названием компании, не нажимайте.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (учебный номер). Это настоящий код для поиска IMEI вашего телефона.',
        '999': 'Это учебный телефон, поэтому он не может звонить на 999. В настоящей экстренной ситуации звоните на 999 или 112.',
        '112': 'Это учебный телефон, поэтому он не может звонить на 112. 112 работает так же, как 999, в Великобритании и по всей Европе.',
        '159': '159 безопасно соединяет вас с вашим банком. Используйте его, если звонок о ваших деньгах вас тревожит.',
        '7726': 'Номер 7726 — это куда пересылают мошеннические SMS. На старых телефонных клавиатурах он складывается в слово «SPAM»!',
        '123': 'speaking-clock',
        '1471': 'Номер телефона 07700 900842 звонил сегодня в 11:20. (Тренировка. 1471 сообщает, кто последним звонил на ваш стационарный телефон.)',
        '01189998819991197253': 'Это экстренный номер из «The IT Crowd». А вы пробовали выключить и снова включить?',
        '101': '101 — номер полиции для случаев, не требующих экстренного вмешательства.',
        '111': '111 — помощь NHS, когда дело срочное, но не экстренное.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Телефон', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Введите номер</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Мама', '#f472b6', [['them', 'Я думала, LOL значит «lots of love» (с большой любовью). Я пишу это везде!'], ['them', 'Потому тётя тебе и не отвечает?'], ['them', 'Отправлено с моего iPad']]],
        ['Неизвестный', '#94a3b8', [['them', 'Поздравляем! Вы выиграли БЕСПЛАТНЫЙ телефон. Нажмите здесь, чтобы получить: prize-winner.example'], ['note', 'Это мошенничество. Не нажимайте на ссылку: перешлите сообщение на 7726, затем удалите его.']]],
        ['Sarah', '#a78bfa', [['them', 'Папа учится пользоваться эмодзи 😂'], ['them', 'Он прислал мне баклажан и написал «на ужин сегодня?» 🍆']]],
        ['Стоматолог', '#38bdf8', [['them', 'Напоминание: ваша запись во вторник в 10:30. Ответьте Y для подтверждения.']]],
    ];
    const MUM_REPLIES = ['Кто это?', 'Позвони мне, я не могу читать сообщения без очков', 'Чудесно! 👍', 'Ты получил моё последнее сообщение? Я по ошибке отправила его коту.', 'Отправлено с моего iPad', 'Хорошо, дорогая xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Сообщения', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Чайка снова в деле' : 'Фото', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Поймана с поличным на набережной Bridlington. Картошку фри вернуть не удалось.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Фото', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Часы', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Погода', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Холодно, небольшой снег' : 'Солнечные прояснения, ветрено'}</p>
            <div class="ajf">${[['Пт', '⟦cloud-rain⟧', '11°'], ['Сб', '⟦wind⟧', '10°'], ['Вс', '⟦sun⟧', '14°'], ['Пн', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Предупреждение о чайках: <strong>высокое</strong>. Берегите картошку фри.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Через платяной шкаф, затем идите дальше мимо фонаря.', home: 'Нет места лучше дома. 🏠', 'луна': '238 855 миль. Пробок почти нет.',
        chips: 'Ближайшая рыбная забегаловка: любая на набережной Bridlington. 🍟', 'north pole': 'Мастерская Санты. Закрыта до декабря. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Чудесное место!',
        'flamborough': 'Flamborough Head: маяк, скалы и тупики. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `«${inp.value.trim()}»: эта учебная карта знает лишь несколько мест. Попробуйте Bridlington, Flamborough или Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Настройки', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Авиарежим' : 'Режим полёта', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Тёмный режим', st.dark)}${row('dnd', 'Не беспокоить', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Об этом устройстве' : 'О телефоне'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Об этом устройстве' : 'О телефоне', `<div class="aic"><div class="lq">
            <div class="ho"><span>Имя</span><b>Телефон Margaret</b></div>
            <div class="ho"><span>Модель</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Версия iOS' : 'Версия Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Хранилище</span><b>Много места для фото внуков</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Серийный номер</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Классическая игра из старых мобильных телефонов.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'Есть реклама · Покупки в приложении'], ['knit', '⟦scissors⟧', 'Схемы для вязания', 'Скоро в этом учебном магазине.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Маркет', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Открыть' : (p === 'ios' ? 'Загрузить' : 'Установить')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Счёт: <b class="ado">0</b></span><span>Рекорд: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Нажмите направление (или клавиши со стрелками), чтобы начать</p>
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
                f.querySelector('.vy').textContent = `Игра окончена! Счёт ${score}. Нажмите направление, чтобы сыграть снова.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Авиарежим', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Не беспокоить', st.dnd)}${t('torch', '⟦flashlight⟧', 'Фонарик', st.torch)}${t('dark', '⟦sun-moon⟧', 'Тёмный режим', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Проведите вверх, чтобы закрыть' : 'Закрыть'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Новые обои');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `«При третьем сигнале точное время будет ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} и ${t.getSeconds()} секунд… бип, бип, бип». (Старые говорящие часы!)`; return; }
                msg.textContent = egg || (n ? 'Этот учебный телефон не может делать настоящие звонки. Попробуйте 123, 1471 или *#06#…' : 'Сначала введите номер.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Пожалуйста, вышлите данные вашего банка, чтобы получить приз!!! (Это мошенничество. Заблокируйте этот номер.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Спасибо, ваша запись подтверждена. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Почта', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Пуск'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Стоп'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Пуск'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Крем от загара нанесён! Это же почти Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Фонарик включён. (Светится экран, а не лампочка на задней панели.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Авиарежим включён: ни звонков, ни SMS, ни мобильного интернета.' : 'Авиарежим выключен.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Обои сменены. Перейдите на главный экран, чтобы их увидеть!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Теперь вы разработчик! (Настоящий секрет Android: нажмите «Номер сборки» 7 раз.)' : st.build >= 3 ? `До статуса разработчика осталось шагов: ${7 - st.build}.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Спасибо за тренировку!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Приложение-фонарик не нужно: он встроен в быстрые настройки телефона. Бесплатные фонарики часто полны рекламы или чего похуже!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Только для вида в учебном магазине.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Установка…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Открыть'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Приложение', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Это учебное приложение является частью отдельного урока. Загляните в курсы раздела «Учиться», чтобы попробовать его как следует.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Вы нашли секрет!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Вызов завершён' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Неизвестный' ? 'Звонящий' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Неизвестный', number: '0161 496 0423', who: 'm', tag: 'Нет в ваших контактах',
         intro: 'Звонит телефон. Номера нет в ваших контактах. <strong>Ответьте</strong>, чтобы потренироваться. <em>Сделайте звук погромче, чтобы слышать звонящего.</em>',
         lines: [
            {text: 'Здравствуйте, это Mark из отдела по борьбе с мошенничеством вашего банка. Мы заметили подозрительные платежи по вашему счёту. Прежде чем продолжить, подтвердите, пожалуйста, ваше полное имя, дату рождения и длинный номер на вашей банковской карте.',
             q: 'Звонящий говорит, что он из вашего банка. Что вы сделаете?', options: [
                {t: 'Назову данные, он же из банка', why: 'Банк, который звонит вам, никогда не спросит полный номер карты. Именно так мошенники получают ваши данные.'},
                {t: 'Скажу, что перезвоню в банк по номеру на карте, и положу трубку', ok: true, why: 'Верно. Позвоните на номер на карте, по возможности с другого телефона, или наберите 159.'},
                {t: 'Попрошу его доказать, кто он', why: 'Мошенники говорят убедительно и часто уже знают часть ваших данных. Безопаснее всего положить трубку и самому позвонить в банк.'}]},
            {text: 'Пожалуйста, не вешайте трубку! Преступники прямо сейчас снимают деньги с вашего счёта. Вам нужно перевести всё на безопасный счёт, который я для вас открою. Нужно успеть в ближайшие десять минут.',
             q: 'Он говорит, что это срочно и деньги нужно перевести. Что теперь?', options: [
                {t: 'Быстро перевести деньги, пока не поздно', why: 'Никакого «безопасного счёта» не существует. Банк никогда не попросит вас переводить деньги. Это и есть мошенничество.'},
                {t: 'Положить трубку. Настоящий банк никогда не просит переводить деньги на «безопасный счёт»', ok: true, why: 'Да. Спешка и «безопасный счёт» выдают мошенников. Положите трубку и наберите 159.'}]}],
         hang: 'Положите трубку красной кнопкой.'},
        {letter: '?', color: '#64748b', name: 'Неизвестный', number: '020 7946 0815', who: 'robot', tag: 'Нет в ваших контактах',
         intro: 'Ещё один звонок. <strong>Ответьте.</strong>',
         lines: [
            {text: 'Это автоматическое сообщение от H M R C. Выдан ордер на ваш арест за неуплаченные налоги. Чтобы поговорить с сотрудником, нажмите 1 прямо сейчас.',
             q: 'Записанный голос говорит, что вас арестуют из-за налогов. Что вы сделаете?', options: [
                {t: 'Нажму 1, чтобы всё уладить', why: 'Если нажать 1, вас соединят с мошенниками, которые потребуют платёж, часто подарочными картами. HMRC никогда не угрожает арестом в записанном сообщении.'},
                {t: 'Положить трубку. HMRC не звонит с угрозами ареста', ok: true, why: 'Верно. HMRC сначала пишет вам письмо и никогда не угрожает арестом по телефону.'}]}],
         hang: 'Положите трубку.'},
        {letter: '?', color: '#64748b', name: 'Неизвестный', number: '0113 496 0332', who: 'm', tag: 'Нет в ваших контактах',
         intro: 'Снова звонит телефон. <strong>Ответьте.</strong>',
         lines: [
            {text: 'Здравствуйте, я звоню из технического отдела Windows. Ваш компьютер присылает нам сообщения об ошибках, и на нём очень опасный вирус. Пожалуйста, включите компьютер, и я помогу вам всё исправить.',
             q: 'Он говорит, что на вашем компьютере вирус. Что вы сделаете?', options: [
                {t: 'Включу компьютер и буду выполнять его указания', why: 'Он попросит установить программу, которая даёт ему управлять вашим компьютером, а потом потребует деньги. Microsoft никогда так не звонит.'},
                {t: 'Положу трубку. Компьютерные компании не звонят из-за вирусов', ok: true, why: 'Верно. Никогда не пускайте звонящего на свой компьютер.'},
                {t: 'Объясню, что у меня нет компьютера', why: 'Объяснять или спорить не нужно. Просто положите трубку.'}]}],
         hang: 'Положите трубку.'},
        {letter: '?', color: '#64748b', name: 'Неизвестный', number: '0808 157 0190', who: 'f', tag: 'Нет в ваших контактах',
         intro: 'Ещё один звонок. <strong>Ответьте.</strong>',
         lines: [
            {text: 'Здравствуйте. В вашем аккаунте интернет-магазина оформлен заказ на новый iPhone стоимостью девятьсот девяносто девять фунтов. Если вы не делали этот заказ, нажмите 1, чтобы отменить его и поговорить с нашей командой.',
             q: 'Вы не заказывали iPhone. Что вы сделаете?', options: [
                {t: 'Нажму 1, чтобы отменить заказ', why: 'Если нажать 1, вас соединят с мошенником, который «вернёт» деньги, спросив данные вашего банка или потребовав доступ к вашему компьютеру.'},
                {t: 'Положу трубку, а затем сам проверю свой аккаунт в приложении или на сайте', ok: true, why: 'Да. Если бы заказ действительно был, вы увидели бы его в своём аккаунте. Никогда не пользуйтесь номером или кнопкой, которые назвал звонящий.'}]}],
         hang: 'Положите трубку.'},
        {letter: 'S', color: '#16a34a', name: 'Поликлиника', number: '01632 960211', who: 'f', tag: 'Сохранён в ваших контактах',
         intro: 'Ещё один звонок: на этот раз из поликлиники, она сохранена в ваших контактах. <strong>Ответьте.</strong>',
         lines: [
            {text: 'Здравствуйте, это Sue из поликлиники. Напоминаю, что ваша прививка от гриппа назначена на вторник на десять часов. Ничего делать не нужно. Если понадобится перенести, позвоните нам по обычному номеру. До свидания!',
             q: 'Это мошеннический звонок?', options: [
                {t: 'Да: положить трубку и заблокировать номер', why: 'Этот в порядке! Она ничего не просила, не торопила вас и сказала звонить по обычному номеру.'},
                {t: 'Скорее всего, настоящий: она не просила ни денег, ни данных и сказала звонить по обычному номеру', ok: true, why: 'Верно. Настоящие звонящие не давят на вас. Если сомневаетесь, перезвоните на номер, который у вас уже есть.'}]}],
         hang: 'Звонок завершён. <strong>Нажмите красную кнопку</strong>, чтобы положить трубку.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Звонок ${n + 1} из ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'В жизни не отвечать на незнакомые номера совершенно нормально! Для этой тренировки нажмите зелёную кнопку, чтобы ответить.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Что из этого — признак мошеннического звонка?', options: [
            {t: 'Вас торопят, пугают или просят держать всё в секрете', ok: true, why: 'Да. Давление — главный признак. Настоящий звонящий не против, чтобы вы не спешили и перезвонили.'},
            {t: 'Звонящий знает ваше имя', why: 'Мошенники часто знают ваше имя и даже некоторые данные счёта. Само по себе это не делает звонок настоящим.'},
            {t: 'Номер выглядит местным', why: 'Мошенники могут показать на вашем экране любой номер, даже местный или номер вашего банка. Не доверяйте номеру.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Отлично!</strong> Вы положили трубку четырём мошенникам и распознали настоящий звонок. Помните: если сомневаетесь, положите трубку и перезвоните на номер, которому доверяете. Для банка наберите 159.'},
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
            ios: ['iPhone', 'Выпускает Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola и другие'],
            windows: ['Windows', 'Большинство ноутбуков и настольных ПК'], mac: ['Mac', 'Выпускает Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu и другие'],
        };
        const notSure = isPC
            ? 'Посмотрите на экран. В Windows внизу есть кнопка «Пуск» (четыре маленьких квадрата). На Mac вверху слева логотип Apple. В Linux Mint внизу слева кнопка «Меню».'
            : 'На задней стороне iPhone есть логотип Apple (надкусанное яблоко). Если у вас его нет, это почти наверняка телефон Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>${isPC ? 'Каким компьютером вы пользуетесь' : 'Какой у вас телефон'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Не уверены?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Покажите, где</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Послушать ещё раз</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Назад на шаг</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Переключить: ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">УЧЕБНЫЙ ${isPC ? 'КОМПЬЮТЕР' : 'ТЕЛЕФОН'}: не настоящий. Ничто из того, что вы здесь делаете, никуда не отправляется.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Выключить голос' : 'Включить голос'; };
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
            showBtn.textContent = 'Назад к уроку';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Покажите, где';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Готово!' : `Шаг ${i + 1} из ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Верно!' : 'Не совсем.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Продолжить</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Попробовать ещё раз</button>${pageNext
                ? `<button type="button" class="ap vb">Отлично! ${last ? 'Теперь завершите курс' : 'Почему бы не попробовать следующий урок'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Не совсем. ' + (step.hint || 'Ещё раз внимательно прочитайте инструкции.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Пока не получилось. Ещё раз внимательно прочитайте инструкции.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Не совсем. ' + (step.hint || 'Ещё раз внимательно прочитайте инструкции.'));
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
                else hint.textContent = 'Щёлкните правой кнопкой: нажмите правую кнопку мыши. На трекпаде Mac щёлкните двумя пальцами. На сенсорном экране нажмите и удерживайте.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Держите палец (или кнопку мыши) нажатым, пока что-нибудь не произойдёт.';
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
                showBtn.textContent = 'Покажите, где';
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
