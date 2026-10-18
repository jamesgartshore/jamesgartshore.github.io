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
            ? [['phone', 'ஃபோன்', '#22c55e', ICON.phone], ['messages', 'செய்திகள்', '#22c55e', ICON.bubble], ['camera', 'கேமரா', '#6b7280', ICON.camera],
               ['photos', 'புகைப்படங்கள்', '#e5e7eb', ICON.photos], ['mail', 'மெயில்', '#3b82f6', ICON.mail], ['clock', 'கடிகாரம்', '#111827', ICON.clock],
               ['weather', 'வானிலை', '#38bdf8', ICON.weather], ['maps', 'வரைபடங்கள்', '#22c55e', ICON.map], ['settings', 'அமைப்புகள்', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'ஃபோன்', '#2563eb', ICON.phone], ['messages', 'செய்திகள்', '#3b82f6', ICON.bubble], ['camera', 'கேமரா', '#6b7280', ICON.camera],
               ['photos', 'புகைப்படங்கள்', '#e5e7eb', ICON.photos], ['clock', 'கடிகாரம்', '#111827', ICON.clock], ['maps', 'வரைபடங்கள்', '#16a34a', ICON.map],
               ['settings', 'அமைப்புகள்', '#475569', ICON.settings], ['weather', 'வானிலை', '#38bdf8', ICON.weather], ['mail', 'மின்னஞ்சல்', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'மேல் வலது மூலையிலிருந்து கீழே ஸ்வைப் செய்யுங்கள் ⟦chevron-down⟧' : 'மேலிருந்து கீழே ஸ்வைப் செய்யுங்கள் ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">இன்று</div>
                <div class="hp"><span>சிறப்பு</span><strong>இந்த வாரம் நாங்கள் விரும்பும் செயலிகள்</strong></div>
                <div class="hp alt"><span>தொடங்குங்கள்</span><strong>உங்கள் புதிய iPhone-க்கான யோசனைகள்</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">இன்று</button><button type="button" data-tap="games">கேம்ஸ்</button>
                    <button type="button" data-tap="apps">செயலிகள்</button><button type="button" data-tap="search-tab">${ICON.search}தேடல்</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>செயலிகள் & கேம்ஸைத் தேடு</span></button>
            <div class="tg"><span class="on">உங்களுக்காக</span><span>சிறந்த பட்டியல்கள்</span><span>குழந்தைகள்</span></div>
            <div class="hp"><span>உங்களுக்குப் பரிந்துரைக்கப்பட்டவை</span><strong>தொடங்க உதவும் செயலிகள்</strong></div>
            <div class="hp alt"><span>பிரபலமானவை</span><strong>தொடர்பில் இருங்கள்</strong></div>
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
        const btnLabel = p === 'ios' ? 'Get' : 'Install';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '500 கோடிக்கு மேல் பதிவிறக்கங்கள்' : 'சமூக வலைப்பின்னல்'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · இலவசம்</span></div></div>
                <p class="agm">உண்மையான iPhone-இல், பக்கவாட்டு பட்டனை இருமுறை அழுத்தவோ, Face ID-க்காகத் திரையைப் பார்க்கவோ, உங்கள் Apple Account கடவுச்சொல்லை இங்கே தட்டச்சு செய்யவோ வேண்டியிருக்கலாம்.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Install</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Cancel</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>WhatsApp-க்கு வரவேற்கிறோம்</h3>
            <p>எங்கள் <u>தனியுரிமைக் கொள்கையைப்</u> படியுங்கள். <u>சேவை விதிமுறைகளை</u> ஏற்க "Agree and continue" என்பதைத் தட்டுங்கள்.</p>
            <button type="button" class="ce ox" data-tap="agree">Agree and continue</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>உங்கள் ஃபோன் எண்ணை உள்ளிடுங்கள்</h3>
            <p>உங்கள் ஃபோன் எண்ணை WhatsApp சரிபார்க்க வேண்டும். நெட்வொர்க் கட்டணங்கள் பொருந்தலாம்.</p>
            <div class="abt">United Kingdom <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Next</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>இது சரியான எண்ணா?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Edit</button><button type="button" data-tap="yes">${ios ? 'Yes' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>செய்திகள் · இப்போது</strong><span>உங்கள் WhatsApp குறியீடு: ${CODE.slice(0, 3)}-${CODE.slice(3)}. இந்தக் குறியீட்டை மற்றவர்களுடன் பகிராதீர்கள்.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>உங்கள் எண்ணைச் சரிபார்க்கிறது</h3>
            <p>SMS மூலம் <strong>+44 ${NUMBER}</strong> எண்ணுக்கு அனுப்பப்பட்ட 6 இலக்கக் குறியீட்டைத் தானாகக் கண்டறியக் காத்திருக்கிறது.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">குறியீடு வரவில்லையா?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['"WhatsApp" உங்கள் தொடர்புகளை அணுக விரும்புகிறது', 'உங்கள் நண்பர்களில் யார் WhatsApp பயன்படுத்துகிறார்கள் என்பதைப் பார்க்க.', 'உங்கள் தொடர்புகளை அணுக WhatsApp-ஐ அனுமதிக்கவா?']
            : ['"WhatsApp" உங்களுக்கு அறிவிப்புகளை அனுப்ப விரும்புகிறது', 'புதிய செய்தி வரும்போது உங்களுக்குத் தெரிவதற்காக.', 'உங்களுக்கு அறிவிப்புகளை அனுப்ப WhatsApp-ஐ அனுமதிக்கவா?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>சுயவிவரத் தகவல்</h3>
            <p>உங்கள் பெயரைத் தட்டச்சு செய்து, விரும்பினால் சுயவிவரப் புகைப்படத்தைச் சேருங்கள்.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">உங்கள் பெயர்</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Next</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'அரட்டைகள்' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>நீங்கள் தயார்${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>உங்கள் அரட்டைகள் இங்கே தோன்றும். உங்கள் தொடர்புகளில் ஒருவருக்குச் செய்தி அனுப்ப புதிய அரட்டை பட்டனைத் தட்டுங்கள்.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `இது உங்கள் ஃபோனின் முகப்புத் திரை. செயலிகள் <strong>${store}</strong> இலிருந்து பதிவிறக்கப்படுகின்றன. இது இலவசம், செயலிகளைப் பெற இதுவே பாதுகாப்பான இடம். <strong>${store}-ஐத் தட்டுங்கள்.</strong>`,
                 hint: `${store} ஐகானைத் தேடுங்கள். ${p === 'ios' ? "இது நீல நிறத்தில், வெள்ளை நிற A எழுத்துடன் இருக்கும்." : "இது வண்ண முக்கோணம்."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'இப்போது WhatsApp-ஐத் தேட வேண்டும். கீழ் வலது மூலையில் உள்ள <strong>தேடலைத் தட்டுங்கள்</strong>.' : 'இப்போது WhatsApp-ஐத் தேட வேண்டும். மேலே உள்ள <strong>தேடல் பெட்டியைத் தட்டுங்கள்</strong>.',
                 hint: p === 'ios' ? 'தேடல் என்பது கீழ் வலது மூலையில் உள்ள உருப்பெருக்கிக் கண்ணாடி.' : 'தேடல் பெட்டியில் "செயலிகள் & கேம்ஸைத் தேடு" என்று இருக்கும்.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "உங்களுக்காக <em>whatsapp</em> எனத் தட்டச்சு செய்துள்ளோம். பரிந்துரைகளின் பட்டியல் தோன்றும். <strong>\"whatsapp messenger\" என்பதைத் தட்டுங்கள்.</strong>",
                 hint: '"whatsapp messenger" எனச் சொல்லும் பரிந்துரையைத் தட்டுங்கள்.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `கவனம்: சில செயலிகள் WhatsApp போல நடிக்கின்றன. உண்மையானதன் பெயர் <strong>WhatsApp Messenger</strong>, உருவாக்கியது <strong>WhatsApp Inc.</strong>, அது இலவசம். உண்மையானதன் அருகில் உள்ள <strong>${p === 'ios' ? 'Get' : 'Install'}-ஐத் தட்டுங்கள்.</strong>`,
                 hints: {'fake1-get': 'அது Fun Apps Ltd உருவாக்கிய "WhatsUp Chat Free". அது ஒரு போலி; "Ad" குறி இருந்தால் அது விளம்பரம் என்று அர்த்தம். பெயரையும் உருவாக்கியவரையும் சரிபாருங்கள்.',
                         'fake2-get': 'அது LuckyDev Studio உருவாக்கிய "WA Messenger for Chat Pro", ஒரு போலி. உண்மையானதை உருவாக்கியது WhatsApp Inc.'},
                 hint: '"WhatsApp Inc." உருவாக்கிய "WhatsApp Messenger"-ஐக் கண்டுபிடியுங்கள்.'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'நிறுவும் முன் அது நீங்கள்தானா என்று உங்கள் iPhone சரிபார்க்கும். உண்மையான iPhone-இல் <strong>Face ID</strong>, உங்கள் <strong>கைரேகை</strong> (Touch ID), அல்லது உங்கள் <strong>Apple Account கடவுச்சொல்லைப்</strong> பயன்படுத்தலாம். இங்கே <strong>Install-ஐத் தட்டுங்கள்.</strong>',
                    hints: {'sheet-cancel': 'Cancel என்றால் பதிவிறக்கம் நின்றுவிடும். அதற்குப் பதிலாக Install-ஐத் தட்டுங்கள்.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `பதிவிறக்கம் நடக்கிறது. முடிந்ததும் பட்டன் <strong>Open</strong> ஆக மாறும். <strong>Open-ஐத் தட்டுங்கள்.</strong>`,
                 hint: 'பட்டன் Open எனும் வரை காத்திருந்து, பிறகு அதைத் தட்டுங்கள்.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp முதல்முறையாகத் திறக்கிறது. அதன் விதிமுறைகளை ஏற்கச் சொல்லும். <strong>"Agree and continue" என்பதைத் தட்டுங்கள்.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'உங்கள் நண்பர்கள் உங்களைக் கண்டுபிடிக்க WhatsApp உங்கள் மொபைல் எண்ணைப் பயன்படுத்துகிறது. <strong>ஃபோன் எண் பெட்டியைத் தட்டுங்கள்</strong>, நாங்கள் ஒரு பயிற்சி எண்ணை நிரப்புவோம்.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `உண்மையான ஃபோனில் உங்கள் சொந்த மொபைல் எண்ணைத் தட்டச்சு செய்வீர்கள். இங்கே கற்பனையான எண்ணைப் பயன்படுத்தியுள்ளோம்: <strong>07700 900123</strong>. <strong>Next-ஐத் தட்டுங்கள்.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `நீங்கள் சரியாகத் தட்டச்சு செய்தீர்களா என்று WhatsApp சரிபார்க்கும். இது சரியானது, எனவே <strong>${p === 'ios' ? 'Yes' : 'OK'}-ஐத் தட்டுங்கள்.</strong>`,
                 hints: {edit: `தவறு செய்திருந்தால் Edit-ஐத் தட்டுவீர்கள். இந்த எண் சரியானது, எனவே ${p === 'ios' ? 'Yes' : 'OK'}-ஐத் தட்டுங்கள்.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'எண் உங்களுடையதா என்று சரிபார்க்க, WhatsApp 6 இலக்கக் குறியீட்டுடன் ஒரு குறுஞ்செய்தி அனுப்பும். உங்கள் iPhone அதை உங்களுக்காக நிரப்ப முன்வரும். <strong>விசைப்பலகைக்கு மேலே உள்ள குறியீட்டைத் தட்டுங்கள்.</strong>'
                    : 'எண் உங்களுடையதா என்று சரிபார்க்க, WhatsApp 6 இலக்கக் குறியீட்டுடன் ஒரு குறுஞ்செய்தி அனுப்பும். பல Android ஃபோன்கள் அதைத் தாமாகவே நிரப்பும். உங்களுடையது நிரப்பவில்லையென்றால், மேலே உள்ள <strong>செய்தியைத் தட்டுங்கள்</strong>.'},
                {screen: c => waCode(p, c),
                 question: {q: 'நீங்கள் அமைத்துக்கொண்டிருக்கும்போது, ஒரு நண்பர் உங்களுக்குச் செய்தி அனுப்புகிறார்: <em>"ஹாய்! தவறுதலாக உனக்கு ஒரு 6 இலக்கக் குறியீட்டை அனுப்பிவிட்டேன், அதை எனக்கே திருப்பி அனுப்ப முடியுமா?"</em> நீங்கள் என்ன செய்வீர்கள்?',
                    options: [
                        {t: 'அனுப்புவேன், அவர் என் நண்பர்தானே', why: 'இது ஒரு பொதுவான மோசடி. யாரோ உங்கள் நண்பரின் கணக்கைக் கைப்பற்றியிருக்கிறார்கள், அந்தக் குறியீடு உங்கள் கணக்கையும் அவர்களிடம் ஒப்படைத்துவிடும்.'},
                        {t: 'அனுப்ப மாட்டேன். யாரும் அதைக் கேட்கவே கூடாது', ok: true, why: 'சரியே. அந்தக் குறியீடு உங்கள் WhatsApp-இன் சாவி. நண்பர் அல்லது WhatsApp-இலிருந்து வருவதாகச் சொல்பவர் உட்பட யாருடனும் அதைப் பகிராதீர்கள்.'},
                        {t: 'முதல் 3 இலக்கங்களை மட்டும் அனுப்புவேன்', why: 'குறியீட்டின் ஒரு பகுதியும் மோசடிக்காரருக்கு உதவும். அதில் எதையும் பகிராதீர்கள்.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'எந்த நண்பர்கள் WhatsApp பயன்படுத்துகிறார்கள் என்பதைக் காட்ட, WhatsApp உங்கள் தொடர்புகளைப் பார்க்க அனுமதி கேட்கிறது. <strong>Allow-ஐத் தட்டுங்கள்.</strong>',
                 hints: {deny: 'அதை அனுமதிக்காமல் இருக்கலாம், ஆனால் அப்போது WhatsApp உங்கள் நண்பர்களின் பெயர்களைக் காட்ட முடியாது. இந்தப் பயிற்சிக்கு Allow-ஐத் தட்டுங்கள்.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'WhatsApp மூடியிருந்தாலும், செய்தி வரும்போது அறிவிப்புகள் உங்களுக்குத் தெரிவிக்கும். <strong>Allow-ஐத் தட்டுங்கள்.</strong>',
                 hints: {deny: 'அறிவிப்புகள் இல்லாவிட்டால், யாராவது உங்களுக்குச் செய்தி அனுப்பும்போது உங்களுக்குத் தெரியாது. இந்தப் பயிற்சிக்கு Allow-ஐத் தட்டுங்கள்.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'கடைசிப் படி: உங்கள் நண்பர்கள் பார்ப்பது உங்கள் பெயரைத்தான். <strong>பெட்டியில் உங்கள் முதல் பெயரைத் தட்டச்சு செய்யுங்கள்</strong>, பிறகு <strong>Next-ஐத் தட்டுங்கள்</strong>. (இது இந்தப் பக்கத்தில் மட்டுமே இருக்கும், எங்கும் அனுப்பப்படாது.)',
                 hints: {photo: 'உண்மையான செயலியில் இப்போதே ஒரு புகைப்படத்தைத் தேர்ந்தெடுக்கலாம், அல்லது பிறகு அமைப்புகளில் சேர்க்கலாம். இப்போதைக்கு அதைத் தவிர்ப்போம்: உங்கள் பெயரைத் தட்டச்சு செய்து Next-ஐத் தட்டுங்கள்.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>சபாஷ், WhatsApp-ஐ அமைத்துவிட்டீர்கள்!</strong> உங்கள் அரட்டைகள் இங்கே தோன்றும். அடுத்த பாடங்களில் உங்கள் முதல் செய்தியை அனுப்புவீர்கள்.'},
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
            const lockName = ctx.touch ? 'Touch ID &amp; கடவுக்குறியீடு' : 'Face ID &amp; கடவுக்குறியீடு';
            const groups = [
                [['airplane', 'ஏர்பிளேன் பயன்முறை', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'புளூடூத்', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'மொபைல் சேவை', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'அறிவிப்புகள்', '#ef4444', '⟦bell⟧'], ['sounds', 'ஒலிகள் &amp; ஹாப்டிக்ஸ்', '#ec4899', '⟦volume-2⟧'], ['focus', 'ஃபோகஸ்', '#6366f1', '⟦moon⟧']],
                [['general', 'பொது', '#8e8e93', '⟦settings⟧'], ['accessibility', 'அணுகல்தன்மை', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence &amp; Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'டிஸ்ப்ளே &amp; ஒளிர்வு', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'அவசர SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'தனியுரிமை &amp; பாதுகாப்பு', '#3b82f6', '⟦hand⟧'], ['battery', 'பேட்டரி', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'செயலிகள்', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple Account, iCloud மற்றும் பல</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'நெட்வொர்க் &amp; இணையம்', 'மொபைல், Wi-Fi, ஹாட்ஸ்பாட்'], ['devices', 'இணைக்கப்பட்ட சாதனங்கள்', 'Bluetooth, இணைத்தல்'],
            ['apps', 'செயலிகள்', 'சமீபத்திய செயலிகள், இயல்புநிலை செயலிகள்'], ['notifications', 'அறிவிப்புகள்', 'அறிவிப்பு வரலாறு'], ['battery', 'பேட்டரி', '85%'], ['storage', 'சேமிப்பகம்', '91% used'],
            ['sound', 'ஒலி &amp; அதிர்வு', 'ஒலியளவு, ஹாப்டிக்ஸ்'], ['display', 'டிஸ்ப்ளே &amp; தொடுதல்', 'இருண்ட தீம், எழுத்துரு அளவு'],
            ['accessibility', 'அணுகல்தன்மை', 'டிஸ்ப்ளே, தொடர்பு, ஆடியோ'], ['security', 'பாதுகாப்பு &amp; தனியுரிமை', 'செயலிகள் பாதுகாப்பு, சாதனப் பூட்டு, அனுமதிகள்'],
            ['location', 'இருப்பிடம்', 'ஆன்'], ['safety', 'பாதுகாப்பு &amp; அவசரநிலை', 'அவசர SOS, மருத்துவத் தகவல், எச்சரிக்கைகள்'],
            ['google', 'Google', 'சேவைகள் &amp; விருப்பத்தேர்வுகள்'], ['system', 'சிஸ்டம்', 'மொழிகள், நேரம், மென்பொருள் புதுப்பிப்புகள்']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID &amp; கடவுக்குறியீடு' : 'Face ID &amp; கடவுக்குறியீடு';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>விரல் 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Face ID-ஐ மீட்டமை</span></div><div class="cj ex"><span>மாற்றுத் தோற்றத்தை அமை</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>கடவுக்குறியீட்டை அணை</span></div><div class="cj ex"><span>கடவுக்குறியீட்டை மாற்று</span></div>'
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

    const androidSecurity = () => androidList('பாதுகாப்பு &amp; தனியுரிமை', [
        ['device-unlock', 'சாதனத்தைத் திறத்தல்', 'திரைப் பூட்டு, முகம் &amp; கைரேகை மூலம் திறத்தல்'], ['app-security', 'செயலிகள் பாதுகாப்பு', 'தீங்கான செயல்பாடுகளுக்கு செயலிகளை ஸ்கேன் செய்யுங்கள்'],
        ['theft', 'திருட்டுப் பாதுகாப்பு', 'ஃபோன் திருடப்பட்டால் அதைப் பூட்டுங்கள்'], ['privacy', 'தனியுரிமை', 'அனுமதிகள், கணக்குச் செயல்பாடு']]);
    const androidDeviceUnlock = ctx => androidList('சாதனத்தைத் திறத்தல்', [
        ['screen-lock', 'திரைப் பூட்டு', ctx.passcodeSet ? 'PIN' : 'எதுவுமில்லை'], ['face-finger', 'முகம் &amp; கைரேகை மூலம் திறத்தல்', ctx.faceDone || ctx.fingerDone ? 'அமை' : 'வேகமாகத் திறக்க அமையுங்கள்']]);
    const androidFaceFinger = ctx => androidList('முகம் &amp; கைரேகை மூலம் திறத்தல்', [
        ['face-unlock', 'முகம் மூலம் திறத்தல்', ctx.faceDone ? 'முகம் சேர்க்கப்பட்டது' : 'அமை'], ['fingerprint-unlock', 'கைரேகை மூலம் திறத்தல்', ctx.fingerDone ? '1 fingerprint' : 'அமை']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'முதல் Face ID ஸ்கேன் முடிந்தது.' : 'Face ID இப்போது அமைக்கப்பட்டது.') : 'முகம் சேர்க்கப்பட்டது';
        const btn = p === 'ios' ? (first ? 'தொடர்' : 'முடிந்தது') : 'முடிந்தது';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'வட்டத்தை முடிக்க உங்கள் தலையை மெதுவாக அசையுங்கள்.' : 'உங்கள் முகத்தை வட்டத்துக்குள் வைத்து, தலையை மெதுவாக அசையுங்கள்.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'முடிந்தது' : 'பிடியை மாற்றுங்கள்') : (stage === 'grip' ? 'பிடியை மாற்றுங்கள்' : 'உங்கள் விரலை வையுங்கள்'))
            : (ready ? 'கைரேகை சேர்க்கப்பட்டது' : 'சென்சாரைத் தொடுங்கள்');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'உங்கள் iPhone-ஐத் திறக்க இப்போது உங்கள் கைரேகையைப் பயன்படுத்தலாம்.' : 'இப்போது உங்கள் விரல் நுனியின் ஓரங்களை முகப்பு பட்டனில் வையுங்கள்.')
                     : (stage === 'grip' ? 'உங்கள் விரல் நுனியின் ஓரங்களை முகப்பு பட்டனில் வையுங்கள்.' : 'முகப்பு பட்டனில் விரலை மீண்டும் மீண்டும் தூக்கி வையுங்கள்.'))
            : (ready ? 'உங்கள் ஃபோனைத் திறக்க இப்போது உங்கள் கைரேகையைப் பயன்படுத்தலாம்.' : 'கைரேகை நிரம்பும் வரை சென்சாரைத் தொட்டு, எடுத்து, மீண்டும் தொடுங்கள்.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'தொடர்' : 'முடிந்தது'}</button>` : sensor}
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
                 say: 'கடவுக்குறியீடு, Face ID, Touch ID அனைத்தும் <strong>அமைப்புகள்</strong> செயலியில் உள்ளன. <strong>அமைப்புகளைத் தட்டுங்கள்</strong> (சாம்பல் நிற கியர்).',
                 hint: 'அமைப்புகள் என்பது கியர் படம் உள்ள சாம்பல் நிற ஐகான்.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `தேவைப்பட்டால் பட்டியலில் கீழே உருட்டி, <strong>${ctx.touch ? 'Touch ID &amp; கடவுக்குறியீடு' : 'Face ID &amp; கடவுக்குறியீடு'}-ஐத் தட்டுங்கள்</strong>.`,
                 hint: `டிஸ்ப்ளே & ஒளிர்வுக்குக் கீழே "${ctx.touch ? 'Touch ID & கடவுக்குறியீடு' : 'Face ID & கடவுக்குறியீடு'}" என்பதைத் தேடுங்கள்.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'திரைப் பூட்டு, முகம் மூலம் திறத்தல், கைரேகைகள் அனைத்தும் <strong>அமைப்புகள்</strong> செயலியில் உள்ளன. <strong>அமைப்புகளைத் தட்டுங்கள்</strong> (கியர்).',
             hint: 'அமைப்புகள் என்பது கியர் படம் உள்ள ஐகான்.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'தேவைப்பட்டால் கீழே உருட்டி, <strong>பாதுகாப்பு &amp; தனியுரிமை என்பதைத் தட்டுங்கள்</strong>. <em>Samsung-இல் இது பாதுகாப்பு மற்றும் தனியுரிமை, பிறகு பயோமெட்ரிக்ஸ் அல்லது பூட்டுத் திரை எனப்படும்.</em>',
             hint: 'பட்டியலின் கீழ்ப்பகுதியில் "பாதுகாப்பு & தனியுரிமை" என்பதைத் தேடுங்கள்.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>சாதனத்தைத் திறத்தல் என்பதைத் தட்டுங்கள்.</strong>',
             hint: 'இது முதல் விருப்பம், "சாதனத்தைத் திறத்தல்".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'கடவுக்குறியீட்டை உள்ளிடுங்கள்' : 'உங்கள் PIN-ஐ உள்ளிடுங்கள்', p === 'ios' ? '' : 'தொடர, உங்கள் PIN-ஐ உள்ளிடுங்கள்'),
        sequence: CODE_KEYS,
        say: `${extraSay}முதலில் அது நீங்கள்தானா என்று உங்கள் ஃபோன் சரிபார்க்கும். <strong>பயிற்சிக் குறியீட்டைத் தட்டச்சு செய்யுங்கள்: ${codeText}</strong>. <em>உங்கள் உண்மையான கடவுக்குறியீட்டை எந்த இணையதளத்திலும் தட்டச்சு செய்யாதீர்கள்.</em>`,
        hint: `பயிற்சிக் குறியீடு ${codeText}-ஐ ஒவ்வொரு எண்ணாகத் தட்டச்சு செய்யுங்கள்.`,
    });

    const safestQuestion = {
        q: 'இவற்றில் எது <strong>மிகவும் பாதுகாப்பான</strong> கடவுக்குறியீடாக இருக்கும்?',
        options: [
            {t: '123456', why: '123456 என்பது எல்லாவற்றையும் விட அதிகம் பயன்படுத்தப்படும் கடவுக்குறியீடு, எனவே திருடன் முதலில் முயல்பவற்றில் அதுவும் ஒன்று.'},
            {t: 'உங்கள் பிறந்தநாள், 140352 போல', why: 'சமூக ஊடகங்கள், வாழ்த்து அட்டைகள் அல்லது அஞ்சல் மூலம் பிறந்தநாள்களை எளிதில் கண்டுபிடிக்கலாம். அர்த்தமுள்ள தேதிகளைத் தவிருங்கள்.'},
            {t: 'வேறு யாருக்கும் எந்த அர்த்தமும் தராத ஆறு எண்கள்', ok: true, why: 'சரியே. தேதி, வடிவம் அல்லது திரும்பத் திரும்ப வரும் எண்கள் இல்லாத தற்செயலான எண்களையே ஊகிப்பது மிகவும் கடினம்.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'இந்த ஃபோனில் இன்னும் கடவுக்குறியீடு இல்லை, எனவே யார் வேண்டுமானாலும் திறக்கலாம். <strong>கடவுக்குறியீட்டை இயக்கு என்பதைத் தட்டுங்கள்.</strong>',
                 hints: {stolen: 'திருடப்பட்ட சாதனப் பாதுகாப்பு பாடம் 4-இல் வருகிறது. முதலில் கடவுக்குறியீட்டை இயக்குங்கள்.'}},
                {screen: c => codeScreen(p, c, 'கடவுக்குறியீட்டை அமை', 'ஒரு கடவுக்குறியீட்டை உள்ளிடுங்கள்', '<p class="aeh">கடவுக்குறியீட்டு விருப்பங்கள்</p>'), sequence: CODE_KEYS,
                 say: `உங்களுக்கு நினைவில் இருக்கும் 6 எண்களைத் தேர்ந்தெடுங்கள். இந்தப் பயிற்சிக்கு, <strong>${codeText}-ஐத் தட்டச்சு செய்யுங்கள்</strong>. <em>இங்கே உங்கள் உண்மையான கடவுக்குறியீட்டைத் தட்டச்சு செய்ய வேண்டாம்.</em>`,
                 hint: `${codeText}-ஐ ஒவ்வொரு எண்ணாகத் தட்டச்சு செய்யுங்கள்.`},
                {screen: c => codeScreen(p, c, 'கடவுக்குறியீட்டை அமை', 'உங்கள் புதிய கடவுக்குறியீட்டை மீண்டும் உள்ளிடுங்கள்'), sequence: CODE_KEYS,
                 say: `நீங்கள் தவறு செய்யவில்லை என்பதை உறுதிசெய்ய உங்கள் iPhone மீண்டும் கேட்கும். <strong>${codeText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.</strong>`,
                 hint: `${codeText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>சபாஷ், உங்கள் பயிற்சி ஃபோனுக்கு இப்போது கடவுக்குறியீடு உள்ளது!</strong> உண்மையான iPhone-இல் இந்தக் கட்டத்தில் உங்கள் Apple Account கடவுச்சொல்லையும் கேட்கலாம்.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'திரைப் பூட்டு <strong>எதுவுமில்லை</strong> என்று உள்ளது, எனவே யார் வேண்டுமானாலும் இந்த ஃபோனைத் திறக்கலாம். <strong>திரைப் பூட்டைத் தட்டுங்கள்.</strong>'},
            {screen: () => androidList('திரைப் பூட்டைத் தேர்ந்தெடுங்கள்', [['none', 'எதுவுமில்லை'], ['swipe', 'ஸ்வைப்'], ['pattern', 'பேட்டர்ன்'], ['pin', 'PIN'], ['password', 'கடவுச்சொல்']]),
             target: 'pin', say: 'சில தேர்வுகள் உள்ளன. <strong>PIN</strong> (எண்கள்) எளிதானது, பாதுகாப்பானது. <strong>PIN-ஐத் தட்டுங்கள்.</strong>',
             hints: {none: 'எதுவுமில்லை என்றால் யார் வேண்டுமானாலும் உங்கள் ஃபோனைத் திறக்கலாம்.', swipe: 'ஸ்வைப் என்பது ஒரு ஸ்வைப்பில் ஃபோனைத் திறக்கும், எனவே எதையும் பாதுகாக்காது.',
                     pattern: 'உங்கள் விரல் திரையில் விடும் தடங்களிலிருந்து பேட்டர்னை ஊகிக்க முடியும். PIN பாதுகாப்பானது.',
                     password: 'கடவுச்சொல்லும் வேலை செய்யும், ஆனால் தினமும் தட்டச்சு செய்ய PIN விரைவானது. இந்தப் பயிற்சிக்கு PIN-ஐத் தட்டுங்கள்.'}},
            {screen: c => codeScreen(p, c, 'PIN-ஐத் தேர்ந்தெடுங்கள்', 'PIN குறைந்தது 4 இலக்கங்கள் இருக்க வேண்டும்'), sequence: CODE_KEYS,
             say: `4-ஐ விட 6 எண்கள் பாதுகாப்பானவை. இந்தப் பயிற்சிக்கு, <strong>${codeText}-ஐத் தட்டச்சு செய்யுங்கள்</strong>. <em>இங்கே உங்கள் உண்மையான PIN-ஐத் தட்டச்சு செய்ய வேண்டாம்.</em>`,
             hint: `${codeText}-ஐ ஒவ்வொரு எண்ணாகத் தட்டச்சு செய்யுங்கள்.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'PIN-ஐத் தேர்ந்தெடுங்கள்', 'PIN குறைந்தது 4 இலக்கங்கள் இருக்க வேண்டும்', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Next-ஐத் தட்டுங்கள்.</strong>'},
            {screen: c => codeScreen(p, c, 'உங்கள் PIN-ஐ மீண்டும் உள்ளிடுங்கள்', ''), sequence: CODE_KEYS,
             say: `நீங்கள் தவறு செய்யவில்லை என்பதை உறுதிசெய்ய உங்கள் ஃபோன் மீண்டும் கேட்கும். <strong>${codeText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.</strong>`, hint: `${codeText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'உங்கள் PIN-ஐ மீண்டும் உள்ளிடுங்கள்', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>உறுதிப்படுத்து என்பதைத் தட்டுங்கள்.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('பூட்டுத் திரையில் அறிவிப்புகள்', [['show-all', 'அனைத்து அறிவிப்பு உள்ளடக்கத்தையும் காட்டு'], ['hide-sensitive', 'முக்கிய உள்ளடக்கத்தை மறை'], ['dont-show', 'அறிவிப்புகளையே காட்டாதே']], false),
             target: 'hide-sensitive',
             say: 'பூட்டிய திரையில் எந்தச் செய்திகள் தெரிய வேண்டும் என்று உங்கள் ஃபோன் கேட்கிறது. <strong>முக்கிய உள்ளடக்கத்தை மறை</strong> நல்ல தேர்வு: செய்தி வந்தது தெரியும், ஆனால் அதில் என்ன உள்ளது என்று தெரியாது. <strong>அதைத் தட்டுங்கள்.</strong>',
             hints: {'show-all': 'அது உங்கள் வங்கியிலிருந்து வரும் குறியீடுகள் உட்பட எல்லாவற்றையும், உங்கள் ஃபோனை எடுக்கும் எவருக்கும் காட்டும். "முக்கிய உள்ளடக்கத்தை மறை" என்பதைத் தட்டுங்கள்.',
                     'dont-show': 'அதுவும் வேலை செய்யும், ஆனால் செய்திகள் வரும்போது உங்களுக்குத் தெரியாது. இந்தப் பயிற்சிக்கு "முக்கிய உள்ளடக்கத்தை மறை" என்பதைத் தட்டுங்கள்.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>சபாஷ், உங்கள் பயிற்சி ஃபோனுக்கு இப்போது PIN உள்ளது!</strong> திரைப் பூட்டு இப்போது PIN என்று காட்டுகிறது.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Face ID-ஐ அமை என்பதைத் தட்டுங்கள்.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Face ID-ஐ அமைப்பது எப்படி</strong>
                    <p>முதலில் உங்கள் முகத்தைக் கேமரா சட்டத்துக்குள் வையுங்கள். பிறகு உங்கள் முகத்தின் எல்லாக் கோணங்களையும் காட்ட, தலையை வட்டமாகச் சுழற்றுங்கள்.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">தொடங்கு</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'செல்ஃபி எடுப்பது போல, உங்கள் ஃபோனை முகத்தின் முன்னால் கை நீட்டிய தூரத்தில் பிடியுங்கள். <strong>தொடங்கு என்பதைத் தட்டுங்கள்.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'உண்மையான iPhone-இல் இப்போது மூக்கால் வட்டம் வரைவது போல, <strong>தலையை மெதுவாக வட்டமாகச் சுழற்றுவீர்கள்</strong>. ஸ்கேன் ஆகும்போது வளையம் நிரம்பும். முடிந்ததும் <strong>தொடர் என்பதைத் தட்டுங்கள்</strong>.',
                 hint: 'வட்டம் நிரம்பும் வரை காத்திருந்து, பிறகு தொடர் என்பதைத் தட்டுங்கள்.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'உறுதிசெய்ய அது இரண்டாவது முறை ஸ்கேன் செய்யும். மீண்டும் தலையை வட்டமாகச் சுழற்றுங்கள். முடிந்ததும் <strong>முடிந்தது என்பதைத் தட்டுங்கள்</strong>.',
                 hint: 'வட்டம் நிரம்பும் வரை காத்திருந்து, பிறகு முடிந்தது என்பதைத் தட்டுங்கள்.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'ஒரு நண்பர் "எதற்கும் இருக்கட்டும்" என்று <em>தன்</em> முகத்தையும் உங்கள் ஃபோனில் சேர்க்கச் சொல்கிறார். நீங்கள் என்ன செய்வீர்கள்?',
                    options: [
                        {t: 'அனுமதிப்பேன், வசதியாக இருக்கும்', why: 'முகம் அமைக்கப்பட்ட எவரும் உங்கள் ஃபோனைத் திறக்கவும், உங்கள் செயலிகளில் பணம் செலுத்த ஒப்புதல் அளிக்கவும் முடியும். உங்கள் சொந்த முகத்தை மட்டுமே அமையுங்கள்.'},
                        {t: 'மாட்டேன் என்பேன். என் முகம் மட்டுமே என் ஃபோனைத் திறக்க வேண்டும்', ok: true, why: 'சரியே. நீங்கள் நம்பும் ஒருவர் உள்ளே வர வேண்டுமென்றால், அதற்குப் பதிலாக உங்கள் கடவுக்குறியீட்டை அவருடன் பகிர்ந்து, தேவைப்பட்டால் பிறகு அதை மாற்றுங்கள்.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>சபாஷ், Face ID அமைக்கப்பட்டது!</strong> இனி உங்கள் ஃபோனைப் பார்த்தாலே அது திறக்கும்; பிறகு மேலே ஸ்வைப் செய்யுங்கள்.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>முகம் &amp; கைரேகை மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>முகம் மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.</strong>',
             hints: {'fingerprint-unlock': 'அது கைரேகைகள், பாடம் 3-இல் வருகிறது. இப்போதைக்கு முகம் மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.'}},
            {screen: () => consent(p, 'உங்கள் முகத்தால் திறங்கள்', 'உங்கள் ஃபோனைத் திறக்கவும், செயலிகளில் அது நீங்கள்தான் என்று உறுதிப்படுத்தவும் உங்கள் முகத்தைப் பயன்படுத்துங்கள். உங்கள் முகம் இந்த ஃபோனில் மட்டுமே சேமிக்கப்படும்.', 'நான் ஒப்புக்கொள்கிறேன்'),
             target: 'agree', say: 'உங்கள் முகத்தை ஃபோன் எப்படிப் பயன்படுத்துகிறது என்பதை அது விளக்குகிறது. <strong>நான் ஒப்புக்கொள்கிறேன் என்பதைத் தட்டுங்கள்.</strong>',
             hints: {cancel: 'ரத்துசெய் என்றால் அமைப்பு நின்றுவிடும். தொடர நான் ஒப்புக்கொள்கிறேன் என்பதைத் தட்டுங்கள்.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'உங்கள் ஃபோனைக் கண் மட்டத்தில், கை நீட்டிய தூரத்தில் பிடியுங்கள். உண்மையான ஃபோனில் <strong>உங்கள் முகத்தை வட்டத்துக்குள் வைத்து, தலையை மெதுவாக அசைப்பீர்கள்</strong>. முடிந்ததும் <strong>முடிந்தது என்பதைத் தட்டுங்கள்</strong>.',
             hint: 'வட்டம் நிரம்பும் வரை காத்திருந்து, பிறகு முடிந்தது என்பதைத் தட்டுங்கள்.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'பல Android ஃபோன்களில், முகம் மூலம் திறத்தல் கைரேகையை விடப் பாதுகாப்பு குறைவு. இது உங்களுக்கு என்ன அர்த்தம்?',
                options: [
                    {t: 'எல்லாவற்றுக்கும் அது சரியே', why: 'பல ஃபோன்களில் முகம் மூலம் திறத்தல் சாதாரண கேமராவைப் பயன்படுத்துவதால் அதை எளிதில் ஏமாற்றலாம். அதனால் சில வங்கிச் செயலிகள் அதை ஏற்பதில்லை.'},
                    {t: 'திறக்க அதைப் பயன்படுத்துங்கள்; வங்கி கேட்டால் வங்கிச் சேவைக்குக் கைரேகை அல்லது PIN-ஐப் பயன்படுத்துங்கள்', ok: true, why: 'சரியே. முகம் மூலம் திறத்தலைப் பணம் செலுத்தவும் வங்கிச் சேவைக்கும் பயன்படுத்த முடியுமா என்பதை உங்கள் ஃபோன் சொல்லும். முடியாவிட்டால் உங்கள் கைரேகை அல்லது PIN-ஐப் பயன்படுத்துங்கள்.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>சபாஷ், முகம் மூலம் திறத்தல் அமைக்கப்பட்டது!</strong> இனி உங்கள் ஃபோனைப் பார்த்தாலே அது திறக்கும்.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>கைரேகையைச் சேர்… என்பதைத் தட்டுங்கள்.</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'iPhone SE போன்ற பழைய iPhone-களின் முன்புறத்தில் உள்ள <strong>முகப்பு பட்டனை</strong> Touch ID பயன்படுத்துகிறது. விரலைத் தூக்கி வைப்பது போல, <strong>பயிற்சி ஃபோனின் கீழ் உள்ள முகப்பு பட்டனை 6 முறை தட்டுங்கள்</strong>.',
                 hint: 'பயிற்சி ஃபோனின் கீழ் உள்ள வட்டமான முகப்பு பட்டனைத் தட்டுங்கள்.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'இப்போது அதற்கு உங்கள் விரல் நுனியின் ஓரங்கள் தேவை. <strong>தொடர் என்பதைத் தட்டுங்கள்.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'உண்மையான iPhone-இல் உங்கள் விரலின் <strong>பக்கங்களையும் நுனியையும்</strong> பட்டனில் வைப்பீர்கள். <strong>முகப்பு பட்டனை இன்னும் 4 முறை தட்டுங்கள்.</strong>',
                 hint: 'கீழ் உள்ள வட்டமான முகப்பு பட்டனைத் தட்டுங்கள்.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'முடிந்துவிட்டது. <strong>தொடர் என்பதைத் தட்டுங்கள்.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'முதலில் எந்த விரலைச் சேர்ப்பது சிறந்தது?',
                    options: [
                        {t: 'ஃபோனைப் பிடிக்க நீங்கள் மிக அதிகமாகப் பயன்படுத்தும் பெருவிரல் அல்லது விரல்', ok: true, why: 'ஆம். முகப்பு பட்டனுக்கு அது பொதுவாக உங்கள் பெருவிரல். 5 விரல்கள் வரை சேர்க்கலாம், எனவே இரண்டு பெருவிரல்களையும் சேர்ப்பது நல்லது.'},
                        {t: 'எந்த விரலும், பரவாயில்லை', why: 'எந்த விரலிலும் வேலை செய்யும், ஆனால் ஃபோனை எடுக்கும்போது இயல்பாகப் பட்டனில் படும் விரலைத் தேர்ந்தெடுங்கள், பொதுவாக பெருவிரல்.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>சபாஷ், உங்கள் கைரேகை அமைக்கப்பட்டது!</strong> திறக்க முகப்பு பட்டனில் விரலை வையுங்கள். இதே முறையில் மேலும் விரல்களைச் சேர்க்கலாம்.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>முகம் &amp; கைரேகை மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>கைரேகை மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.</strong>',
             hints: {'face-unlock': 'அது முகம் மூலம் திறத்தல், பாடம் 2-இல் வந்தது. இப்போதைக்கு கைரேகை மூலம் திறத்தல் என்பதைத் தட்டுங்கள்.'}},
            {screen: () => consent(p, 'கைரேகையால் திறங்கள்', 'செயலிகளில் உள்நுழையும்போது போல, உங்கள் ஃபோனைத் திறக்கவும், அது நீங்கள்தான் என்று உறுதிப்படுத்தவும் உங்கள் கைரேகையைப் பயன்படுத்துங்கள். உங்கள் கைரேகை இந்த ஃபோனில் மட்டுமே சேமிக்கப்படும்.', 'நான் ஒப்புக்கொள்கிறேன்'),
             target: 'agree', say: '<strong>நான் ஒப்புக்கொள்கிறேன் என்பதைத் தட்டுங்கள்.</strong>', hints: {cancel: 'ரத்துசெய் என்றால் அமைப்பு நின்றுவிடும். தொடர நான் ஒப்புக்கொள்கிறேன் என்பதைத் தட்டுங்கள்.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'சென்சார் திரையிலோ, ஃபோனின் பின்புறத்திலோ, பவர் பட்டனிலோ இருக்கலாம்; எங்கே என்பதை உங்கள் ஃபோன் காட்டும். இங்கே அது திரையில் உள்ளது. விரலைத் தூக்கி வைப்பது போல, <strong>சென்சாரை 6 முறை தட்டுங்கள்</strong>.',
             hint: 'திரையின் கீழ்ப்பகுதிக்கு அருகில் உள்ள வட்டமான சென்சாரைத் தட்டுங்கள்.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'உங்கள் கைரேகை பதிவு செய்யப்பட்டது. <strong>முடிந்தது என்பதைத் தட்டுங்கள்.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'முதலில் எந்த விரலைச் சேர்ப்பது சிறந்தது?',
                options: [
                    {t: 'ஃபோனை எடுக்கும்போது இயல்பாகச் சென்சாரைத் தொடும் விரல்', ok: true, why: 'ஆம். பின்புறச் சென்சாருக்கு அது பொதுவாக ஆள்காட்டி விரல்; திரையிலோ பக்கவாட்டிலோ உள்ளதற்குப் பெருவிரல். ஒன்றுக்கு மேற்பட்டவற்றைச் சேர்க்கலாம்.'},
                    {t: 'எந்த விரலும், பரவாயில்லை', why: 'எந்த விரலும் வேலை செய்யும், ஆனால் இயல்பாகச் சென்சாரில் படும் விரலைத் தேர்ந்தெடுங்கள். திறப்பதை அது விரைவாகவும் எளிதாகவும் ஆக்கும்.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>சபாஷ், உங்கள் கைரேகை அமைக்கப்பட்டது!</strong> திறக்கச் சென்சாரைத் தொடுங்கள். இதே முறையில் மேலும் விரல்களைச் சேர்க்கலாம்.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'தோட்டத்தில் சூரியகாந்திப் பூக்கள்', '#fde68a'], ['🐶', 'சோபாவில் இருக்கும் நாய்', '#fecaca'], ['🏖️', 'கடற்கரையில் ஒரு நாள்', '#bae6fd'],
                    ['🎂', 'ஒரு பிறந்தநாள் கேக்', '#fbcfe8'], ['🌅', 'கடல் மேல் சூரிய அஸ்தமனம்', '#fed7aa'], ['🐈', 'தூங்கும் பூனை', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'படிக்கப்பட்டது' : state === 'sent' ? 'அனுப்பப்பட்டது' : 'சென்றடைந்தது'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'ஹாய் அம்மா, இது நான்தான்! புதிய எண், பழைய ஃபோன் உடைந்துவிட்டது…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Family', last: 'Dave: கேக்கை யார் கொண்டு வருகிறார்கள்? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'வியாழக்கிழமை சந்திப்போம்!', time: 'நேற்று', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'ஹாய் அம்மா! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'புதிய அரட்டை' : 'தொடர்பைத் தேர்ந்தெடுங்கள்'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Family', '#f59e0b', 'Dave, Jean, Sarah, நீங்கள்'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'சேர் (பிளஸ்)' : 'இணை (காகிதக் கிளிப்)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>இந்த எண் உங்கள் தொடர்புகளில் இல்லை.</p><div><button type="button" data-tap="block">தடு</button><button type="button" data-tap="add-contact">சேர்</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'புகைப்படங்கள்' : 'கேலரி'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>+44 7700 900842 எண்ணைத் தடுக்கவா?</strong></p><p class="fd">தடுக்கப்பட்ட தொடர்புகள் உங்களை அழைக்கவோ உங்களுக்குச் செய்தி அனுப்பவோ முடியாது.</p>
                <p class="fd">⟦square-check⟧ WhatsApp-இடம் புகாரளி</p>
                <div class="et"><button type="button" data-tap="cancel">ரத்துசெய்</button><button type="button" data-tap="confirm-block">தடு</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'சமீபத்தியவை' : 'கேலரி'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>அழைக்கிறது…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'ஒலியை இயக்கு' : 'ஒலியடக்கு'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? '1 வாரத்துக்கு ஒலியடக்கப்பட்டது' : 'ஆஃப்'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>அறிவிப்புகளை ஒலியடக்கு…</strong></p>
                <button type="button" data-tap="mute-8h">8 மணி நேரம்</button><button type="button" data-tap="mute-week">1 வாரம்</button><button type="button" data-tap="mute-always">எப்போதும்</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['அமைப்புகள்', [['account', 'கணக்கு', 'பாதுகாப்பு அறிவிப்புகள், எண்ணை மாற்று'], ['privacy', 'தனியுரிமை', 'தொடர்புகளைத் தடு, தானாக மறையும் செய்திகள்'],
                ['chats', 'அரட்டைகள்', 'தீம், வால்பேப்பர்கள்'], ['notifications', 'அறிவிப்புகள்', 'செய்தி, குழு, அழைப்பு ஒலிகள்']]],
            account: ['கணக்கு', [['twostep', 'இரண்டு படி சரிபார்ப்பு', ctx.twoStep ? 'ஆன்' : 'ஆஃப்'], ['change-number', 'எண்ணை மாற்று', ''], ['delete-account', 'கணக்கை நீக்கு', '']]],
            privacy: ['தனியுரிமை', [['last-seen', 'கடைசியாகப் பார்த்தது & ஆன்லைன்', 'அனைவரும்'], ['profile-photo', 'சுயவிவரப் புகைப்படம்', 'அனைவரும்'],
                ['groups', 'குழுக்கள்', ctx.groupsSetting || 'அனைவரும்'], ['blocked', 'தடுக்கப்பட்ட தொடர்புகள்', ctx.blocked ? '1' : 'எதுவுமில்லை']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>என்னைக் குழுக்களில் யார் சேர்க்கலாம்</strong></p>
                <button type="button" data-tap="groups-everyone">அனைவரும்</button><button type="button" data-tap="groups-contacts">என் தொடர்புகள்</button>
                <button type="button" data-tap="groups-except">என் தொடர்புகள், இவர்கள் தவிர…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>இரு-படிச் சரிபார்ப்பு</h3><p>கூடுதல் பாதுகாப்புக்காக, இரு-படிச் சரிபார்ப்பை இயக்குங்கள்; உங்கள் ஃபோன் எண்ணை WhatsApp-இல் மீண்டும் பதிவு செய்யும்போது அது PIN கேட்கும்.</p>
                <button type="button" class="ce ox" data-tap="turn-on">இயக்கு</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>மின்னஞ்சல் முகவரியைச் சேருங்கள்</h3>
                <p>PIN-ஐ மறந்துவிட்டால் அதை மீட்டமைக்க ஒரு மின்னஞ்சல் முகவரியைச் சேருங்கள்.</p>
                <div class="tk ex">உங்கள் மின்னஞ்சல் முகவரி</div>
                <button type="button" class="ce ox" data-tap="email-next">Next</button>
                <button type="button" class="cp wd" data-tap="skip">தவிர்</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>இரு-படிச் சரிபார்ப்பு இயக்கப்பட்டது</h3><p>புதிய ஃபோனில் WhatsApp-ஐ அமைத்தால் உங்கள் PIN கேட்கப்படும்.</p>
                <button type="button" class="ce ox" data-tap="done">முடிந்தது</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? '6 இலக்க PIN-ஐ உருவாக்குங்கள்' : 'உங்கள் PIN-ஐ உறுதிப்படுத்துங்கள்'}</strong>
            <p>${stage === 'pin' ? 'புதிய ஃபோனில் WhatsApp-ஐ அமைக்க இது தேவைப்படும்.' : 'அதே PIN-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'இது உங்கள் அரட்டைகளின் பட்டியல். புதிதாக ஒன்றைத் தொடங்க, <strong>புதிய அரட்டை பட்டனைத் தட்டுங்கள்</strong> (மேல் வலதில் உள்ள பென்சில்).'
                          : 'இது உங்கள் அரட்டைகளின் பட்டியல். புதிதாக ஒன்றைத் தொடங்க, கீழ் வலதில் உள்ள <strong>பச்சை + பட்டனைத் தட்டுங்கள்</strong>.',
         hints: {'chat-family': 'அது ஏற்கெனவே உள்ள அரட்டையைத் திறக்கும். அதற்குப் பதிலாகப் புதிதாகத் தொடங்குங்கள்.', 'chat-jean': 'அது ஏற்கெனவே உள்ள அரட்டையைத் திறக்கும். அதற்குப் பதிலாகப் புதிதாகத் தொடங்குங்கள்.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'உங்கள் தொடர்புகளில் WhatsApp பயன்படுத்துபவர்களை அது காட்டும். <strong>Sarah-வைத் தட்டுங்கள்.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'முதலில் பெட்டியில் ஒரு செய்தியைத் தட்டச்சு செய்து, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'ஹாய் அம்மா! 😊 உங்களிடமிருந்து கேட்க மகிழ்ச்சி!', n: 2}); },
         say: 'கீழே உள்ள <strong>செய்திப் பெட்டியைத் தட்டி</strong>, ("Hello!" போன்ற) <strong>ஒரு சிறு செய்தியைத் தட்டச்சு செய்து</strong>, <strong>அனுப்பு அம்புக்குறியைத் தட்டுங்கள்</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'மைக்ரோஃபோன் குரல் செய்திகளுக்கானது, அது அடுத்து வரும். முதலில் ஒரு செய்தியைத் தட்டச்சு செய்து அனுப்பு அம்புக்குறியைத் தட்டுங்கள்.', attach: 'அது புகைப்படங்களுக்கானது, அது அடுத்து வரும். முதலில் ஒரு செய்தியைத் தட்டச்சு செய்து அனுப்பு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah பதிலளித்துவிட்டார்! உங்கள் செய்திக்குக் கீழே <strong>இரண்டு நீல டிக் குறிகள் ⟦check-check⟧</strong> உள்ளன. அவற்றின் அர்த்தம் என்ன?',
            options: [
                {t: 'செய்தி அனுப்பப்படவில்லை', why: 'அனுப்பப்படாத செய்தியில் சிறிய கடிகாரம் அல்லது சிவப்பு எச்சரிக்கை தெரியும். டிக் குறிகள் என்றால் அது வேலை செய்தது.'},
                {t: 'Sarah அதைப் படித்துவிட்டார்', ok: true, why: 'ஆம்! ஒரு சாம்பல் டிக் என்றால் அனுப்பப்பட்டது, இரண்டு சாம்பல் டிக் என்றால் அவர் ஃபோனுக்குச் சென்றடைந்தது, இரண்டு நீல டிக் என்றால் அவர் படித்துவிட்டார்.'},
                {t: 'அது இரண்டு முறை அனுப்பப்பட்டது', why: 'இல்லை, அது ஒருமுறை மட்டுமே அனுப்பப்பட்டது. இரண்டு நீல டிக் என்றால் படிக்கப்பட்டது.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `இப்போது ஒரு புகைப்படத்தை அனுப்புங்கள். செய்திப் பெட்டிக்கு அருகில் உள்ள <strong>${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}-ஐத் தட்டுங்கள்</strong>.`,
         hints: {camera: 'கேமரா புதிய புகைப்படம் எடுக்கும். ஏற்கெனவே எடுத்த ஒன்றை அனுப்ப, தட்டுங்கள் ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `உங்கள் ஃபோனில் உள்ள புகைப்படங்களிலிருந்து தேர்ந்தெடுக்க <strong>${p === 'ios' ? 'புகைப்படங்கள்' : 'கேலரி'}-ஐத் தட்டுங்கள்</strong>.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'இவை உங்கள் ஃபோனில் உள்ள (பொய்யான) புகைப்படங்கள். <strong>சூரியகாந்திப் புகைப்படத்தைத் தட்டுங்கள்</strong> 🌻.',
         hint: 'சூரியகாந்திப் பூக்கள் உள்ள புகைப்படத்தைத் தட்டுங்கள்.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'அழகு! 🌻 இவை உங்கள் தோட்டத்தில் எடுத்தவையா?', n: 4}); },
         say: 'விரும்பினால் ஒரு தலைப்பைத் தட்டச்சு செய்யலாம். பிறகு <strong>அனுப்பு அம்புக்குறியைத் தட்டுங்கள்</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'தட்டச்சு செய்வது சிரமமாக இருந்தால் குரல் செய்திகள் வசதியானவை. உண்மையான ஃபோனில் பேசும்போது <strong>மைக்ரோஃபோனை அழுத்திப் பிடித்து</strong> ⟦mic⟧, அனுப்ப விட்டுவிடுவீர்கள். இங்கே, <strong>தொடங்க மைக்ரோஃபோனை ஒருமுறை தட்டி, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்</strong>.',
         hint: 'மைக்ரோஃபோனைத் தட்டி, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>சபாஷ்!</strong> ஒரு செய்தி, ஒரு புகைப்படம், ஒரு குரல் செய்தியை அனுப்பிவிட்டீர்கள். எப்போது வேண்டுமானாலும் Sarah-வுக்குப் பதிலளிக்க, WhatsApp-ஐத் திறந்து அவருடைய அரட்டையைத் தட்டுங்கள்.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: 'திறக்க <strong>Sarah-வின் அரட்டையைத் தட்டுங்கள்</strong>.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'அரட்டையின் மேலே இரண்டு அழைப்புப் பட்டன்கள் உள்ளன: வீடியோ அழைப்புக்கு <strong>வீடியோ கேமரா</strong>, குரல் அழைப்புக்கு <strong>ஃபோன்</strong>. <strong>வீடியோ கேமராவைத் தட்டுங்கள்</strong> ⟦video⟧.',
         hints: {voice: 'அது வீடியோ இல்லாமல் குரல் அழைப்பைச் செய்யும். இந்தப் பயிற்சிக்கு வீடியோ கேமராவைத் தட்டுங்கள்.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'அது Sarah-வின் ஃபோனை ஒலிக்கச் செய்யும்; அவர் பதிலளித்ததும் நீங்கள் ஒருவரை ஒருவர் பார்க்கலாம். நீங்கள் இருக்கும் இடத்தில் சத்தமாக இருந்தால், உங்களை ஒலியடக்க <strong>மைக்ரோஃபோனைத் தட்டுங்கள்</strong> ⟦mic⟧.',
         hint: 'மைக்ரோஃபோன் பட்டன் கீழ்வரிசையில் உள்ளது.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'நீங்கள் ஒலியடக்கப்பட்டுள்ளீர்கள்: Sarah உங்களைப் பார்க்கலாம், ஆனால் கேட்க முடியாது. அவருக்கு ஏதாவது காட்ட, உங்கள் ஃபோனின் பின்புறக் கேமராவுக்கு மாற <strong>திருப்பு பட்டனைத் தட்டுங்கள்</strong> ⟦switch-camera⟧.',
         hints: {mute: 'பிறகு ஒலியை இயக்க மைக்ரோஃபோனை மீண்டும் தட்டுங்கள். இப்போதைக்குத் திருப்பு பட்டனை முயலுங்கள்.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'இப்போது உங்கள் ஃபோனை நீங்கள் எதன் பக்கம் காட்டுகிறீர்களோ அதை Sarah பார்க்கலாம். முடிந்ததும் அழைப்பை முடிக்க <strong>சிவப்புப் பட்டனைத் தட்டுங்கள்</strong>.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'வீடியோ அழைப்புகள் நிறைய டேட்டாவைப் பயன்படுத்தும். ஒன்றைச் செய்ய சிறந்த வழி எது?',
            options: [
                {t: 'முடிந்தால் வீட்டில் Wi-Fi-இல்', ok: true, why: 'ஆம். Wi-Fi-இல் அழைப்புகள் உங்கள் மொபைல் டேட்டா அளவைப் பயன்படுத்தாது, எனவே எவ்வளவு நேரம் பேசினாலும் இலவசம்.'},
                {t: 'அது முக்கியமில்லை', why: 'மொபைல் டேட்டாவில் நீண்ட வீடியோ அழைப்பு உங்கள் அளவை விரைவாகத் தீர்த்துவிடும். முடிந்தவரை Wi-Fi சிறந்தது.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'இப்போது குழுக்கள். Family குழுவில் நிறைய புதிய செய்திகள் உள்ளன, அறிவிப்புகள் அதிர்ந்துகொண்டே இருக்கின்றன. <strong>Family குழுவைத் தட்டுங்கள்.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'ஒரு குழுவின் அமைப்புகளை மாற்ற, மேலே <strong>குழுவின் பெயரைத் தட்டுங்கள்</strong>.', hint: 'திரையின் மேலே உள்ள "Family" என்ற சொல்லைத் தட்டுங்கள்.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>அறிவிப்புகளை ஒலியடக்கு என்பதைத் தட்டுங்கள்.</strong> செய்திகள் இன்னும் வரும், ஆனால் ஒவ்வொன்றுக்கும் உங்கள் ஃபோன் அதிராது.',
         hints: {'exit-group': 'குழுவிலிருந்து வெளியேறு என்றால் அதை முழுவதுமாக விட்டுவிடுவீர்கள். ஒலியடக்குவது மென்மையானது: குழுவில் இருப்பீர்கள், ஆனால் அதிர்வு இருக்காது.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'எவ்வளவு நேரம் என்று தேர்ந்தெடுங்கள். <strong>1 வாரம் என்பதைத் தட்டுங்கள்.</strong>',
         hints: {'mute-8h': '8 மணி நேரமும் வேலை செய்யும். இந்தப் பயிற்சிக்கு 1 வாரம் என்பதைத் தட்டுங்கள்.', 'mute-always': 'எப்போதும் என்பதும் வேலை செய்யும், ஆனால் சிலவற்றை நீங்கள் தவறவிடலாம். இந்தப் பயிற்சிக்கு 1 வாரம் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>சபாஷ்!</strong> வீடியோ அழைப்பு செய்தீர்கள், உங்களை ஒலியடக்கினீர்கள், கேமராவைத் திருப்பினீர்கள், பரபரப்பான குழுவை ஒலியடக்கினீர்கள். குழுவின் செய்திகளை எப்போது வேண்டுமானாலும் இன்னும் படிக்கலாம்.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'வணக்கம்!', ticks: 'read', n: 1}, {text: 'ஹாய் அம்மா! 😊', n: 2}],
        family: [{from: 'Jean', text: 'ஞாயிற்றுக்கிழமை மதிய உணவு எங்கள் வீட்டில்? 🍗', n: 1}, {from: 'Sarah', text: 'ஆம், தயவுசெய்து!', n: 2}, {from: 'Dave', text: 'கேக்கை யார் கொண்டு வருகிறார்கள்? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'WhatsApp-இன் சொந்த அமைப்புகள் செயலிக்குள்ளேயே உள்ளன. கீழ் வலதில் உள்ள <strong>அமைப்புகளைத் தட்டுங்கள்</strong>.',
                hints: {'chat-unknown': 'அந்தச் செய்தியைப் பிறகு பார்ப்போம். முதலில் கீழ் வலதில் உள்ள அமைப்புகளைத் தட்டுங்கள்.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'WhatsApp-இன் சொந்த அமைப்புகள் செயலிக்குள்ளேயே உள்ளன. மேல் வலதில் உள்ள <strong>மூன்று புள்ளிகளை ⋮ தட்டுங்கள்</strong>.',
                hints: {'chat-unknown': 'அந்தச் செய்தியைப் பிறகு பார்ப்போம். முதலில் மேல் வலதில் உள்ள மூன்று புள்ளிகளைத் தட்டுங்கள்.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>கணக்கு என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: 'யாராவது உங்கள் WhatsApp-ஐ வேறொரு ஃபோனில் அமைக்க முயன்றால் தேவைப்படும் PIN-ஐ <strong>இரு-படிச் சரிபார்ப்பு</strong> சேர்க்கிறது. மோசடிக்காரருக்கு உங்கள் 6 இலக்கக் குறியீடு கிடைத்தாலும் உள்ளே நுழைய முடியாது. <strong>இரு-படிச் சரிபார்ப்பைத் தட்டுங்கள்.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>இயக்கு என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `உங்கள் ஃபோனின் கடவுக்குறியீட்டிலிருந்து வேறுபட்ட 6 இலக்க PIN-ஐத் தேர்ந்தெடுங்கள். இந்தப் பயிற்சிக்கு, <strong>${pinText}-ஐத் தட்டச்சு செய்யுங்கள்</strong>. <em>இங்கே உண்மையான PIN-ஐத் தட்டச்சு செய்யாதீர்கள்.</em>`,
             hint: `பயிற்சி PIN ${pinText}-ஐத் தட்டச்சு செய்யுங்கள்.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `உறுதிப்படுத்த <strong>${pinText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்</strong>.`, hint: `${pinText}-ஐ மீண்டும் தட்டச்சு செய்யுங்கள்.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'மின்னஞ்சல் முகவரியைச் சேர்த்தால், PIN-ஐ மறந்துவிட்டால் அதை மீட்டமைக்கலாம். உங்கள் உண்மையான ஃபோனில் இதைச் செய்வது நல்லது. இங்கே <strong>Next-ஐத் தட்டுங்கள்</strong>.',
             hints: {skip: 'அதைத் தவிர்க்கலாம், ஆனால் PIN-ஐ மறந்தால் உங்களால் உள்ளே நுழைய முடியாமல் போகலாம். இந்தப் பயிற்சிக்கு Next-ஐத் தட்டுங்கள்.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'இரு-படிச் சரிபார்ப்பு இயக்கப்பட்டது. <strong>முடிந்தது என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'ஒரு செய்தி தான் <em>"WhatsApp ஆதரவு"</em> என்று சொல்லி, "உங்கள் கணக்கைச் சரிபார்க்க" உங்கள் இரு-படி PIN-ஐக் கேட்கிறது. நீங்கள் என்ன செய்வீர்கள்?',
                options: [
                    {t: 'அனுப்புவேன், அது WhatsApp-இடமிருந்து வந்தது', why: 'உங்கள் PIN அல்லது குறியீட்டைக் கேட்டு WhatsApp ஒருபோதும் உங்களுக்குச் செய்தி அனுப்பாது. இது உங்கள் கணக்கைக் கைப்பற்ற முயலும் மோசடிக்காரர்.'},
                    {t: 'பதிலளிக்க மாட்டேன்; அவர்களைத் தடுத்துப் புகாரளிப்பேன்', ok: true, why: 'சரியே. WhatsApp உட்பட யாருமே உங்கள் PIN அல்லது 6 இலக்கக் குறியீட்டைக் கேட்கக் கூடாது.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'அடுத்து, அந்நியர்கள் உங்களைக் குழுக்களில் சேர்ப்பதைத் தடுங்கள். இது <strong>தனியுரிமை</strong> பகுதியில் உள்ளது. <strong>குழுக்கள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'என் தொடர்புகள்'; },
             say: '"அனைவரும்" என்றால் எந்த அந்நியரும் உங்களை ஒரு குழுவில் சேர்க்கலாம்; மோசடிக்காரர்கள் இதைப் பயன்படுத்துகிறார்கள். <strong>என் தொடர்புகள் என்பதைத் தட்டுங்கள்.</strong>',
             hints: {'groups-everyone': 'அனைவரும் என்றால் அந்நியர்கள் உங்களை மோசடிக் குழுக்கள் உட்பட குழுக்களில் சேர்க்கலாம். என் தொடர்புகள் என்பதைத் தட்டுங்கள்.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'உங்களுக்குத் தெரியாத எண்ணிலிருந்து ஒரு செய்தி வந்துள்ளது: "ஹாய் அம்மா, இது நான்தான்! புதிய எண்…". இது "ஹாய் அம்மா" மோசடி. <strong>திறக்க அதைத் தட்டுங்கள்.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'ஹாய் அம்மா, இது நான்தான்! புதிய எண், பழைய ஃபோன் உடைந்துவிட்டது. ஒரு கட்டணம் செலுத்த எனக்கு உதவ முடியுமா? நாளைக்குத் திருப்பித் தருகிறேன் x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'பதிலளிக்க வேண்டாம். அந்த எண் உங்கள் தொடர்புகளில் இல்லை என்பதை WhatsApp கவனிக்கிறது. <strong>தடு என்பதைத் தட்டுங்கள்.</strong>',
             hints: {'add-contact': 'மோசடிக்காரரை உங்கள் தொடர்புகளில் சேர்க்காதீர்கள். தடு என்பதைத் தட்டுங்கள்.', video: 'அவர்களைத் திருப்பி அழைக்காதீர்கள். தடு என்பதைத் தட்டுங்கள்.', voice: 'அவர்களைத் திருப்பி அழைக்காதீர்கள். தடு என்பதைத் தட்டுங்கள்.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'ஹாய் அம்மா, இது நான்தான்! புதிய எண், பழைய ஃபோன் உடைந்துவிட்டது. ஒரு கட்டணம் செலுத்த எனக்கு உதவ முடியுமா? நாளைக்குத் திருப்பித் தருகிறேன் x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '"WhatsApp-இடம் புகாரளி" குறியிடப்பட்டுள்ளது; மோசடிக்காரரைத் தடுக்க இது WhatsApp-க்கு உதவும். <strong>தடு என்பதைத் தட்டுங்கள்.</strong>',
             hints: {cancel: 'ரத்துசெய் என்றால் அவர்கள் இன்னும் உங்களுக்குச் செய்தி அனுப்ப முடியும். தடு என்பதைத் தட்டுங்கள்.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>சபாஷ்!</strong> இரு-படிச் சரிபார்ப்பை இயக்கினீர்கள், அந்நியர்கள் உங்களைக் குழுக்களில் சேர்ப்பதைத் தடுத்தீர்கள், ஒரு மோசடிக்காரரைத் தடுத்துப் புகாரளித்தீர்கள். குடும்பத்தினரிடமிருந்து வந்த செய்தி குறித்துச் சந்தேகம் இருந்தால், உங்களிடம் ஏற்கெனவே உள்ள எண்ணில் அவர்களை அழையுங்கள்.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'பின்') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'பின்')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">டைனமிக் டைப்பை ஆதரிக்கும் செயலிகள், நீங்கள் விரும்பும் படிப்பு அளவுக்கு மாறிக்கொள்ளும்.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'எழுத்து அளவு', [], {top: slider, back: 'டிஸ்ப்ளே'});
        return list(p, 'டிஸ்ப்ளே அளவும் எழுத்தும்', [{caption: 'எழுத்துரு அளவு'}, {id: 'bold', label: 'தடித்த எழுத்து', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'எழுத்து அளவு <strong>அமைப்புகள்</strong> செயலியில் உள்ளது. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>', hint: 'அமைப்புகள் என்பது கியர் படம் உள்ள சாம்பல் நிற ஐகான்.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>டிஸ்ப்ளே &amp; ஒளிர்வு என்பதைத் தட்டுங்கள்.</strong>', hint: 'இது மூன்றாவது குழுவில், அணுகல்தன்மைக்குக் கீழே உள்ளது.'},
        {screen: c => list(p, 'டிஸ்ப்ளே &amp; ஒளிர்வு', [{caption: 'தோற்றம்'}, {label: 'வெளிர்', value: '⟦check⟧'}, {caption: 'எழுத்து'}, {id: 'text-size', label: 'எழுத்து அளவு'}, {id: 'bold', label: 'தடித்த எழுத்து', toggle: !!c.bold}], {back: 'அமைப்புகள்'}),
         target: 'text-size', say: '<strong>எழுத்து அளவு என்பதைத் தட்டுங்கள்.</strong>', hints: {bold: 'தடித்த எழுத்து அடுத்து வரும். முதலில் எழுத்து அளவு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'எழுத்தைப் பெரிதாக்க ஸ்லைடரை வலப்புறம் இழுக்கலாம். இங்கே <strong>பெரிய A-ஐ இரண்டு முறை தட்டி</strong> எழுத்து வளர்வதைப் பாருங்கள்.', hint: 'ஸ்லைடரின் வலப்பக்கத்தில் உள்ள பெரிய A-ஐத் தட்டுங்கள்.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'படிக்க மிகவும் எளிதாகிவிட்டது! இப்போது பின்செல்ல மேலே <strong>‹ டிஸ்ப்ளே என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'டிஸ்ப்ளே &amp; ஒளிர்வு', [{caption: 'தோற்றம்'}, {label: 'வெளிர்', value: '⟦check⟧'}, {caption: 'எழுத்து'}, {id: 'text-size', label: 'எழுத்து அளவு'}, {id: 'bold', label: 'தடித்த எழுத்து', toggle: !!c.bold}], {back: 'அமைப்புகள்'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>தடித்த எழுத்து</strong> எழுத்துகளைத் தடிமனாகவும் தெளிவாகவும் ஆக்கும். <strong>இயக்க அதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'டிஸ்ப்ளே &amp; ஒளிர்வு', [{caption: 'எழுத்து'}, {label: 'எழுத்து அளவு'}, {label: 'தடித்த எழுத்து', toggle: true}], {back: 'அமைப்புகள்'}),
         question: {q: 'மிகப் பெரிய அமைப்பிலும் எழுத்து இன்னும் சிறியதாக இருக்கிறதா?', options: [
            {t: 'இனி எதுவும் செய்ய முடியாது', why: 'இன்னும் உள்ளது! அமைப்புகள் > அணுகல்தன்மை > டிஸ்ப்ளே &amp; எழுத்து அளவு > பெரிய எழுத்து இன்னும் பெரிய அளவுகளைத் தரும்.'},
            {t: 'அமைப்புகள் > அணுகல்தன்மை > டிஸ்ப்ளே &amp; எழுத்து அளவு > பெரிய எழுத்து', ok: true, why: 'ஆம். மிகப் பெரிய எழுத்துக்கு அங்கே பெரிய அணுகல்தன்மை அளவுகளை இயக்குங்கள்.'}]}},
        {screen: c => list(p, 'டிஸ்ப்ளே &amp; ஒளிர்வு', [{caption: 'எழுத்து'}, {label: 'எழுத்து அளவு'}, {label: 'தடித்த எழுத்து', toggle: true}], {back: 'அமைப்புகள்'}), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் எழுத்து இப்போது பெரிதாகவும் தடிமனாகவும் உள்ளது, அமைப்புகளிலும் பெரும்பாலான செயலிகளிலும்.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'எழுத்து அளவு <strong>அமைப்புகள்</strong> செயலியில் உள்ளது. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>', hint: 'அமைப்புகள் என்பது கியர் படம் உள்ள ஐகான்.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>டிஸ்ப்ளே &amp; தொடுதல் என்பதைத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது டிஸ்ப்ளே, பிறகு எழுத்துரு அளவும் பாணியும்.</em>'},
        {screen: () => list(p, 'டிஸ்ப்ளே &amp; தொடுதல்', [{id: 'dark', label: 'இருண்ட தீம்', toggle: false}, {id: 'text-size', label: 'டிஸ்ப்ளே அளவும் எழுத்தும்', sub: 'எழுத்துரு அளவு, தடித்த எழுத்து'}, {id: 'brightness', label: 'ஒளிர்வு நிலை', value: '70%'}]),
         target: 'text-size', say: '<strong>டிஸ்ப்ளே அளவும் எழுத்தும் என்பதைத் தட்டுங்கள்.</strong>', hints: {dark: 'இருண்ட தீம் நிறங்களை மாற்றும், அளவை அல்ல. டிஸ்ப்ளே அளவும் எழுத்தும் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'எழுத்தைப் பெரிதாக்க எழுத்துரு அளவு ஸ்லைடரை வலப்புறம் இழுக்கலாம். இங்கே <strong>பெரிய A-ஐ இரண்டு முறை தட்டுங்கள்</strong>.', hint: 'ஸ்லைடரின் வலப்பக்கத்தில் உள்ள பெரிய A-ஐத் தட்டுங்கள்.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>தடித்த எழுத்து</strong> எழுத்துகளை இன்னும் தெளிவாக்கும். <strong>இயக்க அதைத் தட்டுங்கள்.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'மிகப் பெரிய அமைப்பிலும் எழுத்து இன்னும் சிறியதாக இருக்கிறதா?', options: [
            {t: 'இனி எதுவும் செய்ய முடியாது', why: 'அதே பக்கத்தில் டிஸ்ப்ளே அளவையும் முயலுங்கள்: அது பட்டன்கள், ஐகான்கள் உட்பட எல்லாவற்றையும் பெரிதாக்கும்.'},
            {t: 'டிஸ்ப்ளே அளவையும் பெரிதாக்குவேன்', ok: true, why: 'ஆம். டிஸ்ப்ளே அளவு எழுத்தை மட்டுமல்ல, திரையில் உள்ள அனைத்தையும் பெரிதாக்கும்.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் எழுத்து இப்போது பெரிதாகவும் தடிமனாகவும் உள்ளது, அமைப்புகளிலும் பெரும்பாலான செயலிகளிலும்.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' ஊதா நிறத்தில்' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'தொந்தரவு செய்ய வேண்டாம்' : 'ஃபோகஸ்'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'தொந்தரவு செய்யாதே · ஆன்' : 'தொந்தரவு செய்யாதே · ஆஃப்'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'மூட மேலே ஸ்வைப் செய்யுங்கள்' : 'மூடு'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'உங்கள் ஃபோன் ஒலிக்கவில்லையென்றால், தொந்தரவு செய்யாதே ஆன் ஆகியிருக்கலாம். விரைவு அமைப்புகள் <strong>கண்ட்ரோல் சென்டரில்</strong> உள்ளன: <strong>மேல் வலது மூலையிலிருந்து கீழே ஸ்வைப் செய்யுங்கள்</strong> (அல்லது மேலே உள்ள பட்டையைத் தட்டுங்கள்).'
                          : 'உங்கள் ஃபோன் ஒலிக்கவில்லையென்றால், தொந்தரவு செய்யாதே ஆன் ஆகியிருக்கலாம். விரைவு அமைப்புகளைப் பார்க்க <strong>திரையின் மேலிருந்து கீழே ஸ்வைப் செய்யுங்கள்</strong> (அல்லது மேலே உள்ள பட்டையைத் தட்டுங்கள்).',
         hints: {'pull-up': 'மறுபுறம் ஸ்வைப் செய்யுங்கள்: மேலிருந்து கீழே.', 'pull-left': 'பக்கவாட்டில் அல்ல, கீழே ஸ்வைப் செய்யுங்கள்.', 'pull-right': 'பக்கவாட்டில் அல்ல, கீழே ஸ்வைப் செய்யுங்கள்.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `நிலா ⟦moon⟧ என்றால் <strong>தொந்தரவு செய்யாதே ஆன் ஆகியுள்ளது</strong>, எனவே அழைப்புகளும் செய்திகளும் ஒலியடக்கப்பட்டுள்ளன. <strong>அதை அணைக்க அதைத் தட்டுங்கள்.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'இப்போது <strong>ஃபோனின் பக்கத்தில் உள்ள ஒலியளவு பட்டனால்</strong> (மேலே உள்ளது) ஒலியளவைக் கூட்டுங்கள். <strong>பயிற்சி ஃபோனின் ஓரத்தில் உள்ள ＋ ஐ 3 முறை தட்டுங்கள்.</strong>',
         hint: 'ஃபோனின் வலது ஓரத்தில் உள்ள ＋ பட்டனைத் தட்டுங்கள்.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'உங்கள் iPhone இன்னும் ஒலிக்கவில்லை. வேறு என்னவாக இருக்கலாம்?', options: [
                {t: 'Ring/Silent சுவிட்ச் அல்லது Action பட்டன் அமைதியாக அமைக்கப்பட்டுள்ளது', ok: true, why: 'ஆம். பல iPhone-களில் ஒலியளவு பட்டன்களுக்கு மேலே ஒரு சிறு சுவிட்ச் இருக்கும்: அது ஆரஞ்சு நிறத்தில் தெரிந்தால் ஃபோன் அமைதியில் உள்ளது. புதியவற்றில் அதற்குப் பதிலாக Action பட்டன் இருக்கும்.'},
                {t: 'ஃபோன் பழுதடைந்துவிட்டது', why: 'பொதுவாக இல்லை! முதலில் ஒலியளவு பட்டன்களுக்கு மேலே உள்ள அமைதிச் சுவிட்சைப் பாருங்கள்.'}]}
            : {q: 'ஒலியளவு பட்டனை அழுத்தினீர்கள், ஆனால் அது மீடியா ஒலியளவை மட்டுமே மாற்றியது. இப்போது என்ன செய்வது?', options: [
                {t: 'ரிங் ஒலியளவைப் பார்க்க, ஒலியளவுப் பட்டையில் உள்ள ⋯ அல்லது அமைப்புகள் ஐகானைத் தட்டுங்கள்', ok: true, why: 'ஆம். ஒலியளவு பட்டன்கள் பெரும்பாலும் மீடியா ஒலியளவையே மாற்றும்; ரிங் ஒலியளவை மாற்ற, ஒலியளவுப் பட்டையில் உள்ள மூன்று புள்ளிகளைத் தட்டுங்கள்.'},
                {t: 'கைவிட்டுவிடுவேன்', why: 'தோன்றும் ஒலியளவுப் பட்டையில் உள்ள மூன்று புள்ளிகள் ⋯ ஐத் தட்டி, ரிங் ஒலியளவைக் கூட்டுங்கள்.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>சபாஷ்!</strong> தொந்தரவு செய்யாதே அணைக்கப்பட்டது, ஒலியளவு கூட்டப்பட்டது, எனவே அழைப்புகளும் செய்திகளும் உங்களுக்குக் கேட்கும்.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARACETAMOL 500mg</strong><br>ஒவ்வொரு 4-6 மணி நேரத்துக்கும் 1-2 மாத்திரைகள் எடுத்துக்கொள்ளுங்கள்.<br>24 மணி நேரத்தில் 8 மாத்திரைகளுக்கு மேல் எடுக்காதீர்கள்.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'உருப்பெருக்கி', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'உங்கள் iPhone-இல் <strong>உருப்பெருக்கி</strong> செயலி உள்ளது. அது முகப்புத் திரையில் இல்லையென்றால், திரையின் நடுவில் கீழே ஸ்வைப் செய்து "உருப்பெருக்கி" எனத் தட்டச்சு செய்யுங்கள். <strong>உருப்பெருக்கியைத் தட்டுங்கள்.</strong>'
                          : 'பல Android ஃபோன்களில் <strong>உருப்பெருக்கி</strong> செயலி உள்ளது. <em>Samsung-இல் அது விரைவு அமைப்புகளிலோ அணுகல்தன்மையிலோ இருக்கும்.</em> <strong>உருப்பெருக்கியைத் தட்டுங்கள்.</strong>',
         hint: 'உருப்பெருக்கிக் கண்ணாடி படம் உள்ள கறுப்பு ஐகானைத் தேடுங்கள்.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'இந்த மருந்து லேபிள் போன்ற சிறிய ஒன்றின் பக்கம் உங்கள் ஃபோனைக் காட்டுங்கள். பெரிதாக்க <strong>＋ ஐ மூன்று முறை தட்டுங்கள்</strong> (உண்மையான ஃபோனில் ஸ்லைடரை இழுக்கலாம்).', hint: 'ஸ்லைடரின் வலப்பக்கத்தில் உள்ள ＋ ஐத் தட்டுங்கள்.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'மங்கலான வெளிச்சத்தில் டார்ச் உதவும். <strong>டார்ச்சைத் தட்டுங்கள்</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'கைகள் சிறிது நடுங்குகின்றனவா? படத்தை உறையவைக்க <strong>பெரிய வட்டப் பட்டனைத் தட்டுங்கள்</strong>; அசையாமல் பிடிக்காமலேயே படிக்கலாம்.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'உருப்பெருக்கி வேறு எதற்கு வசதியாக இருக்கும்?', options: [
            {t: 'உணவுப் பட்டியல்கள், விலைச் சீட்டுகள், கடிதங்களில் உள்ள சிறிய எழுத்துகளைப் படிக்க', ok: true, why: 'ஆம், அது எப்போதும் உங்கள் பாக்கெட்டிலேயே இருக்கிறது. சிலர் ஒரே தொடுதலில் எடுக்க அதைக் கண்ட்ரோல் சென்டரிலோ விரைவு அமைப்புகளிலோ வைத்திருக்கிறார்கள்.'},
            {t: 'ஃபோன் அழைப்புகளை உரத்து ஒலிக்கச் செய்ய', why: 'அது ஒலியளவு பட்டன்களின் வேலை. உருப்பெருக்கி சிறிய விஷயங்களைத் தெளிவாகப் பார்க்க உதவும்.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>சபாஷ்!</strong> இப்போது சிறிய எழுத்துகளைப் பெரிதாக்கவும், ஒளியூட்டவும், படத்தை உறையவைக்கவும் உங்களால் முடியும்.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'வியாழக்கிழமை காபி காலைச் சந்திப்பில் சந்திப்போம்' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>வியாழக்கிழமை வருகிறீர்களா? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">குறுஞ்செய்தி</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ கேட்கிறது… இப்போது பேசுங்கள்</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'தட்டச்சு செய்வதற்குப் பதிலாக பேசலாம். <strong>செய்திகளைத் திறங்கள்.</strong>', hint: 'செய்திகள் என்பது பச்சை நிற உரையாடல் குமிழி.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'வியாழக்கிழமை பற்றி Jean கேட்டுள்ளார். கீழே உள்ள <strong>செய்திப் பெட்டியைத் தட்டுங்கள்</strong>.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'விசைப்பலகை தோன்றும். விசைப்பலகையில் <strong>மைக்ரோஃபோனை</strong> ⟦mic⟧ தட்டி, உங்கள் செய்தியைப் பேசுங்கள்.', hint: 'மைக்ரோஃபோன் விசைப்பலகையில், ஸ்பேஸ் பாருக்கு அருகில் உள்ளது.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'உண்மையான ஃபோனில் இப்போது நீங்கள் சொல்வீர்கள்: <em>"வியாழக்கிழமை காபி காலைச் சந்திப்பில் சந்திப்போம்"</em>. நீங்கள் பேசும்போதே சொற்கள் தோன்றும். அவற்றைச் சரிபார்த்து, <strong>அனுப்பு என்பதைத் தட்டுங்கள்</strong> ⟦send-horizontal⟧.',
         hint: 'சொற்கள் தோன்றும் வரை காத்திருந்து, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்.'},
        {screen: () => home(p), target: 'settings',
         say: 'உங்கள் ஃபோன் உங்களுக்காக <strong>சத்தமாகப் படித்துக் காட்டவும்</strong> முடியும். அதை இயக்குவோம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>அணுகல்தன்மை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'அணுகல்தன்மை', [{caption: 'பார்வை'}, {id: 'voiceover', label: 'VoiceOver', value: 'ஆஃப்'}, {id: 'zoom', label: 'ஜூம்', value: 'ஆஃப்'}, {id: 'spoken', label: 'பேசப்படும் உள்ளடக்கம்'}], {back: 'அமைப்புகள்'})
            : list(p, 'அணுகல்தன்மை', [{id: 'select-speak', label: 'பேசுவதற்குத் தேர்ந்தெடு', sub: 'ஆஃப்'}, {id: 'talkback', label: 'TalkBack', sub: 'ஆஃப்'}, {id: 'magnification', label: 'உருப்பெருக்கம்'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>பேசப்படும் உள்ளடக்கம் என்பதைத் தட்டுங்கள்.</strong>' : '<strong>பேசுவதற்குத் தேர்ந்தெடு என்பதைத் தட்டுங்கள்.</strong>',
         hints: {voiceover: 'VoiceOver முழு ஃபோனும் இயங்கும் விதத்தை மாற்றும், அது குழப்பமாக இருக்கலாம். பேசப்படும் உள்ளடக்கம் என்பதைத் தட்டுங்கள்.', talkback: 'TalkBack முழு ஃபோனும் இயங்கும் விதத்தை மாற்றும், அது குழப்பமாக இருக்கலாம். பேசுவதற்குத் தேர்ந்தெடு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => p === 'ios'
            ? list(p, 'பேசப்படும் உள்ளடக்கம்', [{id: 'speak-selection', label: 'தேர்வைப் பேசு', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'திரையைப் பேசு', toggle: !!c.speakScreen, sub: 'திரையைச் சத்தமாகக் கேட்க, திரையின் மேலிருந்து இரண்டு விரல்களால் கீழே ஸ்வைப் செய்யுங்கள்.'}], {back: 'அணுகல்தன்மை'})
            : list(p, 'பேசுவதற்குத் தேர்ந்தெடு', [{id: 'speak-screen', label: 'பேசுவதற்குத் தேர்ந்தெடுவைப் பயன்படுத்து', toggle: !!c.speakScreen, sub: 'குறுக்குவழியைத் தட்டி, பிறகு சத்தமாகக் கேட்க திரையில் எதையும் தட்டுங்கள்.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>திரையைப் பேசு என்பதை இயக்குங்கள்.</strong> பிறகு, உங்கள் ஃபோனில் எங்கிருந்தாலும், மேலிருந்து இரண்டு விரல்களால் கீழே ஸ்வைப் செய்தால் திரையைச் சத்தமாகப் படித்துக் காட்டும்.' : '<strong>பேசுவதற்குத் தேர்ந்தெடுவைப் பயன்படுத்து என்பதை இயக்குங்கள்.</strong> ஒரு சிறு குறுக்குவழிப் பட்டன் தோன்றும்: அதைத் தட்டி, பிறகு கேட்க விரும்பும் எந்த எழுத்தையும் தட்டுங்கள்.',
         hints: {'speak-selection': 'அது நீங்கள் தேர்ந்தெடுத்த சொற்களை மட்டுமே படிக்கும். திரையைப் பேசு எளிதானது: அதை இயக்குங்கள்.'}},
        {screen: c => p === 'ios'
            ? list(p, 'பேசப்படும் உள்ளடக்கம்', [{label: 'தேர்வைப் பேசு', toggle: false}, {label: 'திரையைப் பேசு', toggle: true}], {back: 'அணுகல்தன்மை'})
            : list(p, 'பேசுவதற்குத் தேர்ந்தெடு', [{label: 'பேசுவதற்குத் தேர்ந்தெடுவைப் பயன்படுத்து', toggle: true}]), done: true,
         say: '<strong>சபாஷ்!</strong> இப்போது தட்டச்சு செய்வதற்குப் பதிலாகப் பேசலாம், உங்கள் ஃபோன் உங்களுக்குச் சத்தமாகப் படித்துக் காட்டவும் செய்யலாம்.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'பல செவிப்புலன் கருவிகளை உங்கள் ஃபோனுடன் இணைக்கலாம்; அப்போது அழைப்புகளும் இசையும் நேரடியாக அவற்றுக்கே வரும். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>அணுகல்தன்மை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'அணுகல்தன்மை', [{caption: 'செவிப்புலன்'}, {id: 'hearing-devices', label: 'செவித்திறன் சாதனங்கள்'}, {id: 'live-captions', label: 'நேரலைத் தலைப்புகள்', value: c.captions ? 'ஆன்' : 'ஆஃப்'}, {id: 'subtitles', label: 'வசனங்கள் &amp; தலைப்புகள்'}], {back: 'அமைப்புகள்'})
            : list(p, 'அணுகல்தன்மை', [{id: 'hearing-devices', label: 'செவிப்புலன் கருவிகள்', sub: c.paired ? 'இணைக்கப்பட்டது' : 'இணைக்கப்படவில்லை'}, {id: 'live-captions', label: 'நேரலைத் தலைப்பு', sub: c.captions ? 'ஆன்' : 'ஆஃப்'}, {id: 'sound-amp', label: 'ஒலிப் பெருக்கி'}]),
         target: 'hearing-devices', say: `<strong>${p === 'ios' ? 'செவித்திறன் சாதனங்கள்' : 'செவிப்புலன் கருவிகள்'}-ஐத் தட்டுங்கள்.</strong> முதலில் உங்கள் செவிப்புலன் கருவிகளைக் காதில் வைத்து, அவற்றின் பேட்டரிக் கதவுகளை மூடி மீண்டும் தொடங்கச் செய்யுங்கள்; அப்போது ஃபோனால் அவற்றைக் கண்டுபிடிக்க முடியும்.`,
         hints: {'live-captions': 'தலைப்புகள் அடுத்து வரும். முதலில் செவிப்புலன் கருவிகளை இணையுங்கள்.'}},
        {screen: c => list(p, p === 'ios' ? 'செவித்திறன் சாதனங்கள்' : 'செவிப்புலன் கருவிகள்', [{caption: p === 'ios' ? 'MFI செவித்திறன் சாதனங்கள்' : 'கிடைக்கும் சாதனங்கள்'}, {id: 'aids', label: 'Margaret-இன் செவிப்புலன் கருவிகள்', sub: 'இடது மற்றும் வலது'}],
            {overlay: c.pairing ? dialog(p, '"Margaret-இன் செவிப்புலன் கருவிகளுடன்" இணைக்கவா?', 'அவை அழைப்புகளுக்கும் ஆடியோவுக்கும் பயன்படுத்தப்படும்.', [['cancel', 'ரத்துசெய்'], ['pair', 'இணை']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'உங்கள் ஃபோன் அவற்றைக் கண்டுபிடிக்கிறது. <strong>உங்கள் செவிப்புலன் கருவிகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'செவித்திறன் சாதனங்கள்' : 'செவிப்புலன் கருவிகள்', [{id: 'aids', label: 'Margaret-இன் செவிப்புலன் கருவிகள்', sub: 'இடது மற்றும் வலது'}],
            {overlay: dialog(p, '"Margaret-இன் செவிப்புலன் கருவிகளுடன்" இணைக்கவா?', 'அவை அழைப்புகளுக்கும் ஆடியோவுக்கும் பயன்படுத்தப்படும்.', [['cancel', 'ரத்துசெய்'], ['pair', 'இணை']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>இணை என்பதைத் தட்டுங்கள்.</strong> (இரண்டு செவிப்புலன் கருவிகள் இருந்தால், உங்கள் ஃபோன் ஒவ்வொன்றுக்கும் ஒருமுறை என இரண்டு முறை கேட்கலாம்.)'},
        {screen: c => list(p, p === 'ios' ? 'செவித்திறன் சாதனங்கள்' : 'செவிப்புலன் கருவிகள்', [{label: 'Margaret-இன் செவிப்புலன் கருவிகள்', sub: 'இணைக்கப்பட்டது ⟦check⟧'}]), target: 'back',
         say: 'இணைக்கப்பட்டது! இனி அழைப்புகள் உங்கள் செவிப்புலன் கருவிகளில் ஒலிக்கும். <strong>பின் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'அணுகல்தன்மை', [{caption: 'செவிப்புலன்'}, {id: 'hearing-devices', label: 'செவித்திறன் சாதனங்கள்'}, {id: 'live-captions', label: 'நேரலைத் தலைப்புகள்', value: c.captions ? 'ஆன்' : 'ஆஃப்'}], {back: 'அமைப்புகள்'})
            : list(p, 'அணுகல்தன்மை', [{id: 'hearing-devices', label: 'செவிப்புலன் கருவிகள்', sub: 'இணைக்கப்பட்டது'}, {id: 'live-captions', label: 'நேரலைத் தலைப்பு', sub: c.captions ? 'ஆன்' : 'ஆஃப்'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'நேரலைத் தலைப்புகள்' : 'நேரலைத் தலைப்பு'}</strong> பேசப்படும் எதற்கும், வீடியோக்கள், அழைப்புகள், குரல் செய்திகள் உட்பட, திரையில் சொற்களைக் காட்டும். <strong>இயக்க அதைத் தட்டுங்கள்.</strong>`},
        {screen: c => list(p, 'அணுகல்தன்மை', [{label: p === 'ios' ? 'நேரலைத் தலைப்புகள்' : 'நேரலைத் தலைப்பு', toggle: true}, {label: 'செவிப்புலன் கருவிகள்', sub: 'இணைக்கப்பட்டது'}]), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் செவிப்புலன் கருவிகள் இணைக்கப்பட்டன, பேசப்படும் சொற்கள் இப்போது தலைப்புகளாகத் தோன்றும்.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['எறும்பு', 'பேட்ஜர்', 'பூனை', 'நாய்', 'கழுகு', 'நரி', 'வெள்ளாடு', 'முள்ளெலி', 'ஐபிஸ்', 'ஜாக்டா', 'மீன்கொத்தி', 'ஆட்டுக்குட்டி', 'மோல்',
                     'நீர்ப்பல்லி', 'நீர்நாய்', 'பஃபின்', 'ராபின்', 'கடல்நாய்', 'தேரை', 'வோல்', 'ரென்', 'வரிக்குதிரை'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>பூவை அழுத்திப் பிடியுங்கள்</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>நகலெடு</span><span>பகிர்</span><span>நீக்கு</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>வரிக்குதிரை</h3><p>வரிக்குதிரைகளுக்குக் கறுப்பு வெள்ளைக் கோடுகள் உண்டு. இரண்டு வரிக்குதிரைகளுக்கும் ஒரே மாதிரி அமைப்பு இருப்பதில்லை.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>தட்டுதல்</strong> என்றால், ஒரு விரலால் திரையை மெதுவாகத் தொட்டு உடனே எடுத்துவிடுவது, பட்டனை அழுத்துவது போல. <strong>நட்சத்திரத்தைத் தட்டுங்கள்.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>அழுத்திப் பிடித்தல்</strong> என்றால், ஒன்றின் மேல் உங்கள் விரலை ஒரு விநாடி அல்லது இரண்டு விநாடிகள் வைத்திருப்பது. இது பொதுவாக கூடுதல் விருப்பங்களைக் காட்டும். ஏதாவது நடக்கும் வரை <strong>பூவை அழுத்திப் பிடியுங்கள்</strong>. (மவுஸ் என்றால் பட்டனை அழுத்திப் பிடியுங்கள்.)',
         hint: 'பூவின் மேல் உங்கள் விரலை ஒரு விநாடி அல்லது இரண்டு விநாடிகள் வைத்திருங்கள்.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'ஒரு மெனு தோன்றியது. அழுத்திப் பிடிப்பது பொதுவாக என்ன செய்யும்?', options: [
            {t: 'நகலெடு, பகிர், நீக்கு போன்ற கூடுதல் விருப்பங்களைக் காட்டும்', ok: true, why: 'ஆம். செய்திகள், புகைப்படங்கள், செயலிகள் மீது அழுத்திப் பிடித்தால் இவை போன்ற விருப்பங்கள் தோன்றும்.'},
            {t: 'உடனே பொருட்களை நீக்கிவிடும்', why: 'இல்லை, அது விருப்பங்களின் மெனுவை மட்டுமே காட்டும். நீங்கள் ஒன்றைத் தேர்ந்தெடுக்கும் வரை எதுவும் நடக்காது.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>ஸ்வைப் செய்தல்</strong> என்றால், பக்கத்தைத் திருப்புவது போல உங்கள் விரலைத் திரை முழுவதும் நகர்த்துவது. அடுத்த படங்களைப் பார்க்க <strong>புகைப்படத்தை இடப்புறம் இரண்டு முறை ஸ்வைப் செய்யுங்கள்</strong>. (மவுஸ் என்றால் கிளிக் செய்து, இழுத்து, விடுங்கள்.)',
         hint: 'உங்கள் விரலைப் புகைப்படத்தின் குறுக்கே வலப்பக்கத்திலிருந்து இடப்பக்கமாக நகர்த்துங்கள். அல்லது "ஸ்வைப் செய்ய முடியவில்லையா?" பட்டனைப் பயன்படுத்துங்கள்.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>உருட்டுதல்</strong> என்றால், இதைப் போன்ற பட்டியலில் மேலும் பார்க்க விரலைத் திரையில் மேல்நோக்கி நகர்த்துவது. <strong>கீழே உருட்டி, மிகக் கீழே உள்ள வரிக்குதிரையைத் தட்டுங்கள்</strong>. (மவுஸ் என்றால் ஸ்க்ரோல் சக்கரத்தைப் பயன்படுத்துங்கள்.)',
         hint: 'கீழே உள்ள வரிக்குதிரையை அடைய, பட்டியலை உங்கள் விரலால் மேல்நோக்கி நகர்த்துங்கள்.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'iPhone-இல் முந்தைய பக்கத்துக்குச் செல்ல, மேல் இடதில் உள்ள <strong>‹ பின் என்பதைத் தட்டுங்கள்</strong> (அல்லது திரையின் இடது விளிம்பிலிருந்து உள்ளே ஸ்வைப் செய்யுங்கள்).' : 'Android-இல் முந்தைய பக்கத்துக்குச் செல்ல, கீழே உள்ள <strong>பின் அம்புக்குறி ◁ ஐத் தட்டுங்கள்</strong> (அல்லது திரையின் இடது அல்லது வலது விளிம்பிலிருந்து உள்ளே ஸ்வைப் செய்யுங்கள்).',
         hints: {'home-pill': 'அது நேராக முகப்புக்கே கொண்டு செல்லும். அதற்குப் பதிலாக பின் அம்புக்குறி ◁ ஐத் தட்டுங்கள்.', 'home-bar': 'அது நேராக முகப்புக்கே கொண்டு செல்லும். அதற்குப் பதிலாக ‹ பின் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'எங்கிருந்தும் முகப்புத் திரைக்குச் செல்ல, திரையின் கீழ் உள்ள <strong>பட்டையிலிருந்து மேலே ஸ்வைப் செய்யுங்கள்</strong> (அல்லது இங்குள்ள பட்டையைத் தட்டுங்கள்). வட்டமான முகப்பு பட்டன் உள்ள பழைய iPhone-களில்: அதை அழுத்துங்கள்.'
                          : 'எங்கிருந்தும் முகப்புத் திரைக்குச் செல்ல, கீழே உள்ள <strong>முகப்பு வட்டம் ○ ஐத் தட்டுங்கள்</strong> (அல்லது கீழ் விளிம்பிலிருந்து மேலே ஸ்வைப் செய்யுங்கள்).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'பின் என்பது ஒரு பக்கம் பின்னே செல்லும். முகப்புக்குச் செல்ல முகப்பு வட்டம் ○ ஐத் தட்டுங்கள்.'}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> தட்டுதல், அழுத்திப் பிடித்தல், ஸ்வைப் செய்தல், உருட்டுதல், பின்செல்லுதல், முகப்புக்குச் செல்லுதல் ஆகியவற்றைப் பயிற்சி செய்துவிட்டீர்கள்: தினமும் நீங்கள் பயன்படுத்தப் போகும் அசைவுகள் இவையே.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'இணைக்கப்பட்டது', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'இணையம்', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'நெட்வொர்க்குகள்' : 'கிடைக்கும் நெட்வொர்க்குகள்'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'அமைப்புகள்',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>"BT-Hub-7F2A" கடவுச்சொல்லை உள்ளிடுங்கள்</strong></p>
                ${field('wifipass', 'கடவுச்சொல்', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'சேர்' : 'இணை'}</button>
                <button type="button" class="cp" data-tap="cancel">ரத்துசெய்</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'வீட்டில் Wi-Fi பயன்படுத்தினால் உங்கள் மொபைல் டேட்டா மிச்சமாகும். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: 'மேலே அருகில் உள்ள <strong>Wi-Fi-ஐத் தட்டுங்கள்</strong>.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>நெட்வொர்க் &amp; இணையம் என்பதைத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது இணைப்புகள், பிறகு Wi-Fi.</em>'},
               {screen: () => list(p, 'நெட்வொர்க் &amp; இணையம்', [{id: 'internet', label: 'இணையம்', sub: 'Wi-Fi மற்றும் மொபைல் டேட்டா'}, {id: 'sims', label: 'SIM-கள்'}, {id: 'hotspot', label: 'ஹாட்ஸ்பாட் &amp; டெதரிங்'}]),
                target: 'internet', say: '<strong>இணையம் என்பதைத் தட்டுங்கள்.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'உங்கள் Wi-Fi பெயரும் கடவுச்சொல்லும் பொதுவாக ரவுட்டரின் (விளக்குகள் உள்ள பெட்டி) பின்புறம் உள்ள ஸ்டிக்கரில் இருக்கும். இந்தப் பயிற்சி ரவுட்டரின் ஸ்டிக்கரில் உள்ளது:<br><span class="ahd">நெட்வொர்க்: <strong>BT-Hub-7F2A</strong><br>கடவுச்சொல்: <strong>Green-Apple-42</strong></span><strong>BT-Hub-7F2A-ஐத் தட்டுங்கள்.</strong>',
         hints: {'net-vm-neighbour': 'அது அண்டை வீட்டாரின் Wi-Fi. உங்கள் ஸ்டிக்கரில் உள்ள பெயரைக் கண்டுபிடியுங்கள்: BT-Hub-7F2A.', 'net-sky-12345': 'அது வேறொருவரின் Wi-Fi. உங்கள் ஸ்டிக்கரில் உள்ள பெயரைக் கண்டுபிடியுங்கள்: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'கடவுச்சொல் பெரிய எழுத்துகள், கோடுகள் உட்பட ஸ்டிக்கரில் உள்ளதுடன் சரியாகப் பொருந்த வேண்டும்: Green-Apple-42',
         say: 'கடவுச்சொல்லை ஸ்டிக்கரில் உள்ளபடியே <strong>சரியாகத்</strong> தட்டச்சு செய்யுங்கள்: <strong>Green-Apple-42</strong>. பெரிய எழுத்துகள் முக்கியம்! பிறகு <strong>சேர் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'இணைந்துவிட்டீர்கள்! இனி நீங்கள் வீட்டில் இருக்கும்போதெல்லாம் உங்கள் ஃபோன் தானாகவே இந்த Wi-Fi-இல் இணையும். ஒரு கஃபேவில் இலவச Wi-Fi பயன்படுத்துவது பாதுகாப்பானதா?', options: [
            {t: 'ஆம், உலாவலுக்கு; ஆனால் அதில் ஆன்லைன் வங்கிச் சேவையைத் தவிருங்கள்', ok: true, why: 'சரியே. செய்திகளைப் படிக்க அல்லது பேருந்து நேரத்தைப் பார்க்க பொது Wi-Fi சரிதான். வங்கிச் சேவைக்கு உங்கள் மொபைல் டேட்டா அல்லது வீட்டு Wi-Fi-ஐப் பயன்படுத்துங்கள்.'},
            {t: 'ஆம், எல்லாவற்றுக்கும்', why: 'பொது Wi-Fi-ஐ மற்றவர்கள் கண்காணிக்க முடியும். உலாவலுக்கு அது சரிதான், ஆனால் வங்கிச் சேவைக்கு உங்கள் மொபைல் டேட்டா அல்லது வீட்டு Wi-Fi-ஐப் பயன்படுத்துங்கள்.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>சபாஷ்!</strong> நீங்கள் Wi-Fi-இல் இணைந்துவிட்டீர்கள். உங்கள் திரையின் மேலே விசிறி வடிவ Wi-Fi குறியைத் தேடுங்கள்.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'புதிய தொடர்பு' : 'தொடர்பை உருவாக்கு', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'முதல் பெயர்', ctx)}<span class="se">Mobile number</span>${field('cnum', 'மொபைல் எண்', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'முடிந்தது' : 'சேமி'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'தொடர்பு', [
        {label: 'மொபைல்', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'பிடித்தவையில் சேர்' : (ctx.fav ? '⟦star⟧ பிடித்தவை' : '⟦star⟧ பிடித்தவையில் சேர்')},
        {id: 'share', label: 'தொடர்பைப் பகிர்'}], {back: 'தொடர்புகள்'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'தொடர்புகள்', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'ஒருவரின் எண்ணைச் சேமித்தால் பெயரைச் சொல்லி அழைக்கலாம். iPhone-இல் தொடர்புகள் <strong>ஃபோன்</strong> செயலியில் உள்ளன. <strong>ஃபோனைத் தட்டுங்கள்.</strong>' : '<strong>தொடர்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'தொடர்புகள்', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'தொடர்புகள்', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'இது உங்கள் தொடர்புப் பட்டியல். ஒருவரைச் சேர்க்க மேல் வலதில் உள்ள <strong>+ ஐத் தட்டுங்கள்</strong>.' : 'இது உங்கள் தொடர்புப் பட்டியல். ஒருவரைச் சேர்க்க <strong>+ பட்டனைத் தட்டுங்கள்</strong>.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'முதல் பெயரையும் பயிற்சி எண் 07700 900456-ஐயும் தட்டச்சு செய்து, பிறகு ' + (p === 'ios' ? 'முடிந்தது என்பதைத் தட்டுங்கள்.' : 'சேமி என்பதைத் தட்டுங்கள்.'),
         say: `அந்த நபரின் <strong>முதல் பெயரையும்</strong> ("Ann" என்று முயலுங்கள்), அவர் எண்ணையும் தட்டச்சு செய்யுங்கள். பயிற்சிக்கு <strong>07700 900456</strong>-ஐப் பயன்படுத்துங்கள். பிறகு <strong>${p === 'ios' ? 'முடிந்தது' : 'சேமி'} என்பதைத் தட்டுங்கள்</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'சேமிக்கப்பட்டது! பிடித்தவை என்பவர்கள் நீங்கள் அதிகம் அழைப்பவர்கள்; ஒரே தட்டலில் அழைக்க அவர்கள் மேலே காட்டப்படுவார்கள். <strong> ' + (p === 'ios' ? 'பிடித்தவையில் சேர்' : 'நட்சத்திரத்தைத் தட்டுங்கள்') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'அவசரத் தேவைக்கான "ICE" (In Case of Emergency) என்பதை எந்தத் தொடர்பின் பெயருக்கு முன் சேர்த்துச் சேமிப்பது நல்லது?', options: [
            {t: 'உங்கள் நெருங்கிய உறவினர், "ICE Sarah" போல', ok: true, why: 'ஆம். துணை மருத்துவர்கள் ICE-ஐத் தேடுவார்கள் என்பது அவர்களுக்குத் தெரியும். இன்னும் சிறப்பாக, உங்கள் மருத்துவ ஐடியில் ஓர் அவசரத் தொடர்பைச் சேருங்கள்; இது உங்கள் ஃபோனைப் பாதுகாப்பாக வைத்தல் பாடநெறியில் உள்ளது.'},
            {t: 'உங்கள் வங்கி', why: 'உங்களுக்கு ஏதாவது நேர்ந்தால் தொடர்புகொள்ள வேண்டியவருக்கே ICE, பொதுவாக உங்கள் நெருங்கிய உறவினர்.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>சபாஷ்!</strong> ஒரு தொடர்பைச் சேமித்து, அவரைப் பிடித்தவராக்கிவிட்டீர்கள்.'},
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
    const recents = p => app(p, 'சமீபத்தியவை', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'உங்கள் ஃபோன் ஒலிக்கிறது: Jean அழைக்கிறார். <strong>பதிலளிக்கப் பச்சைப் பட்டனைத் தட்டுங்கள்.</strong>' + (p === 'android' ? ' <em>சில Android ஃபோன்களில் அதற்குப் பதிலாகப் பச்சைப் பட்டனை மேல்நோக்கி ஸ்வைப் செய்வீர்கள்.</em>' : ' <em>உங்கள் iPhone பூட்டியிருந்தால், அதற்குப் பதிலாகப் பச்சைப் பட்டனை ஸ்லைடு செய்வீர்கள்.</em>'),
         hints: {decline: 'சிவப்பு என்றால் அழைப்பை நிராகரிக்கும். பதிலளிக்கப் பச்சையைத் தட்டுங்கள்.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'நீங்கள் பேசுகிறீர்கள்! நன்றாகக் கேட்க, அல்லது கையில் பிடிக்காமல் பேச, <strong>ஸ்பீக்கரைத் தட்டுங்கள்</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'முடிந்ததும், அழைப்பைத் துண்டிக்க <strong>சிவப்புப் பட்டனைத் தட்டுங்கள்</strong>.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'முன்பு Dave-இடமிருந்து ஓர் அழைப்பைத் தவறவிட்டீர்கள். தவறிய அழைப்புகள் சமீபத்திய அழைப்புகளில் <strong>சிவப்பு</strong> நிறத்தில் தெரியும். அவரைத் திருப்பி அழைக்க <strong>Dave-ஐத் தட்டுங்கள்</strong>.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'அது Dave-ஐ அழைக்கிறது. பேசி முடிந்ததும், துண்டிக்க <strong>சிவப்புப் பட்டனைத் தட்டுங்கள்</strong>.'},
        {screen: () => recents(p), question: {q: 'உங்களுக்குத் தெரியாத எண்ணிலிருந்து ஒருவர் அழைத்து, தான் உங்கள் வங்கியிலிருந்து பேசுவதாகச் சொல்கிறார். நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'துண்டித்துவிட்டு, உங்கள் வங்கியைப் பாதுகாப்பாகத் தொடர்புகொள்ள 159-ஐ அழைப்பேன்', ok: true, why: 'சரியே. எப்போது வேண்டுமானாலும் துண்டித்துவிட்டு, நீங்கள் நம்பும் எண்ணில் திருப்பி அழைக்கலாம். 159 உங்களை உங்கள் சொந்த வங்கியுடன் இணைக்கும்.'},
            {t: 'அவர்கள் சொல்வதைச் செய்வேன், அது வங்கிதானே', why: 'மோசடிக்காரர்கள் எப்போதும் வங்கிபோல நடிக்கிறார்கள், எண்ணையும் போலியாக்கலாம். துண்டித்துவிட்டு 159-ஐ அழையுங்கள்.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>சபாஷ்!</strong> நீங்கள் பதிலளிக்கலாம், ஸ்பீக்கரைப் பயன்படுத்தலாம், துண்டிக்கலாம், தவறிய அழைப்புகளைத் திருப்பி அழைக்கலாம்.'},
    ], {});

    function smsList(p) {
        return app(p, 'செய்திகள்', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>உங்கள் கடைசிப் பரிசோதனை மார்ச்சில் நடந்தது. ஆன்லைனில் முன்பதிவு செய்யுங்கள் அல்லது எங்களை அழையுங்கள்.</span><small>3 மாதங்களுக்கு முன்</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'குறுஞ்செய்தி', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'குறுஞ்செய்திகள் <strong>செய்திகள்</strong> செயலியில் உள்ளன. <strong>செய்திகளைத் தட்டுங்கள்.</strong>', hint: 'இது உரையாடல் குமிழி ஐகான்.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'புதிய செய்திகள் தடித்த எழுத்தில் தெரியும். படிக்க <strong>பல் மருத்துவரிடமிருந்து வந்த செய்தியைத் தட்டுங்கள்</strong>.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'முதலில் செய்திப் பெட்டியில் Y எனத் தட்டச்சு செய்து, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'உறுதிப்படுத்த <strong>Y</strong> எனப் பதிலளிக்கச் சொல்லிப் பல் மருத்துவர் கேட்கிறார். <strong>செய்திப் பெட்டியைத் தட்டி, Y எனத் தட்டச்சு செய்து, பிறகு அனுப்பு அம்புக்குறியைத் தட்டுங்கள்</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'முடிந்தது! இப்போது ஒழுங்குபடுத்துங்கள்: மேலே உள்ள <strong>பழைய செய்தியை அழுத்திப் பிடியுங்கள்</strong> (ஒரு விநாடி அல்லது இரண்டு விநாடிகள் உங்கள் விரலை அதன் மேல் வைத்திருங்கள்).', hint: 'ஒரு மெனு தோன்றும் வரை மேலே உள்ள பழைய செய்தியின் மேல் உங்கள் விரலை வைத்திருங்கள்.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'ஒரு மெனு தோன்றுகிறது. <strong>நீக்கு என்பதைத் தட்டுங்கள்.</strong>',
         hints: {copy: 'நகலெடு என்பது சொற்களை நகலெடுக்கும். நீக்கு என்பதைத் தட்டுங்கள்.', forward: 'முன்னனுப்பு என்பது வேறொருவருக்கு அனுப்பும். நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => smsChat(p, c), question: {q: 'தெரியாத எண்ணிலிருந்து வந்த குறுஞ்செய்தி, உங்கள் பார்சல் நிறுத்தப்பட்டுள்ளது என்றும், ஓர் இணைப்பைப் பயன்படுத்தி £1.45 செலுத்தச் சொல்லியும் கேட்கிறது. நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'இணைப்பைத் தட்ட மாட்டேன். அதை 7726-க்கு முன்னனுப்பிவிட்டு, நீக்குவேன்', ok: true, why: 'சரியே. 7726 இலவசம்; அது உங்கள் நெட்வொர்க்கிடம் புகாரளிக்கும். கூரியர்கள் கட்டணம் கேட்டு இணைப்புகளுடன் குறுஞ்செய்தி அனுப்புவதில்லை.'},
            {t: 'செலுத்துவேன், £1.45 தானே', why: '£1.45 என்பது உங்கள் கார்டு விவரங்களைப் பெறுவதற்கான தூண்டில். இணைப்பைத் தட்டாதீர்கள்: அதை 7726-க்கு முன்னனுப்பிவிட்டு நீக்குங்கள்.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>சபாஷ்!</strong> குறுஞ்செய்திகளைப் படிக்கவும் பதிலளிக்கவும், தேவையற்றவற்றை நீக்கவும் உங்களால் முடியும்.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['வரைபடங்கள்', 15], ['WhatsApp', 9], ['கேமரா', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'பேட்டரி', [{id: 'low-power', label: 'குறைந்த பவர் பயன்முறை', toggle: saver, sub: 'முழுமையாக சார்ஜ் செய்யும் வரை பின்னணிச் செயல்பாட்டைக் குறைக்கும்.'}, {caption: 'செயலி வாரியாக பேட்டரி பயன்பாடு'}], {back: 'அமைப்புகள்', top: head, bottom: apps})
            : list(p, 'பேட்டரி', [{id: 'low-power', label: 'பேட்டரி சேமிப்பான்', toggle: saver, sub: 'பேட்டரி நீண்ட நேரம் நிற்க சில அம்சங்களை அணைக்கும்.'}, {caption: 'பேட்டரி பயன்பாடு'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'பேட்டரி குறைகிறதா? <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>பேட்டரியைத் தட்டுங்கள்.</strong>', hint: p === 'ios' ? 'பேட்டரி மூன்றாவது குழுவில் உள்ளது.' : 'பேட்டரி பட்டியலில், அறிவிப்புகளுக்குப் பிறகு உள்ளது.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `நீங்கள் 23%-இல் இருக்கிறீர்கள். <strong>${p === 'ios' ? 'குறைந்த பவர் பயன்முறை' : 'பேட்டரி சேமிப்பான்'}</strong> அதை நீண்ட நேரம் நிற்கச் செய்யும். <strong>இயக்க அதைத் தட்டுங்கள்.</strong> நினைவூட்ட பேட்டரி குறி ${p === 'ios' ? 'yellow' : 'orange'} நிறமாக மாறும்.`},
        {screen: c => batteryPage(p, c), question: {q: 'இன்று Facebook அதிக பேட்டரியைப் பயன்படுத்தியதாகப் பட்டியல் காட்டுகிறது. பேட்டரி மிக நீண்ட நேரம் நிற்க எது உதவும்?', options: [
            {t: 'திரையின் ஒளிர்வைக் குறைத்து, முடித்த செயலிகளை மூடுவது', ok: true, why: 'ஆம். திரைதான் அதிக மின்சாரத்தைப் பயன்படுத்தும். ஒளிர்வைக் குறைக்கவும்; Facebook, YouTube போன்ற செயலிகள் நிறையப் பயன்படுத்தும்.'},
            {t: 'ஒவ்வொரு மணி நேரமும் 100% வரை சார்ஜ் செய்வது', why: 'அடிக்கடி சார்ஜ் செய்வது கெடுதல் இல்லை, ஆனால் அது பேட்டரியை நீண்ட நேரம் நிற்கச் செய்யாது. ஒளிர்வைக் குறைத்து, பேட்டரி சேமிப்புப் பயன்முறையைப் பயன்படுத்துங்கள்.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>சபாஷ்!</strong> பேட்டரி சேமிப்பு இயக்கத்தில் உள்ளது, எந்த செயலிகள் அதிக மின்சாரத்தைப் பயன்படுத்துகின்றன என்பதும் உங்களுக்குத் தெரியும்.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'மொபைல் · 3 அழைப்புகள்' : 'சந்தேகத்துக்குரிய ஸ்பேம் · 3 அழைப்புகள்'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'சமீபத்தியவை', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>மொபைல்</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>மொபைல்</small><span>நேற்று</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'அதே தெரியாத எண் உங்களை மீண்டும் மீண்டும் அழைக்கிறது. அதைத் தடுப்போம். <strong>ஃபோன் செயலியைத் திறங்கள்.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `உங்கள் சமீபத்திய அழைப்புகளில், 07700 900842${p === 'android' ? ' (சில Android ஃபோன்களில் எண்ணையே தட்டுங்கள்)' : ''} எண்ணுக்கு அருகில் உள்ள <strong>ⓘ ஐத் தட்டுங்கள்</strong>.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'தொடர்பைப் பகிர்'}, {id: 'block', label: p === 'ios' ? 'இந்த அழைப்பாளரைத் தடு' : 'தடு/ஸ்பேம் எனப் புகாரளி', danger: true}], {back: 'சமீபத்தியவை'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'இந்த அழைப்பாளரைத் தடு' : 'தடு/ஸ்பேம் எனப் புகாரளி'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'இந்த அழைப்பாளரைத் தடுக்கவா?', 'உங்கள் தடுப்புப் பட்டியலில் உள்ளவர்களிடமிருந்து ஃபோன் அழைப்புகள், செய்திகள் அல்லது FaceTime வராது.', [['cancel', 'ரத்துசெய்'], ['confirm', 'தொடர்பைத் தடு']])
            : dialog(p, '07700 900842 எண்ணைத் தடுக்கவா?', '⟦square-check⟧ அழைப்பை ஸ்பேம் எனப் புகாரளி', [['cancel', 'ரத்துசெய்'], ['confirm', 'தடு']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'தொடர்பைத் தடு' : 'தடு'}.</strong>${p === 'android' ? ' "அழைப்பை ஸ்பேம் எனப் புகாரளி" என்பதில் குறியிட்டு வைத்தால் மற்றவர்களுக்கு எச்சரிக்கை செய்ய உதவும்.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'தடுக்கப்பட்டது! <strong>உங்களுக்குத் தெரியாத எண்களிலிருந்து வரும் எல்லா அழைப்புகளையும் அமைதியாக்கவும்</strong> முடியும். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'கீழே உருட்டி <strong>செயலிகளைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'செயலிகள்', [{id: 'app-phone', label: 'ஃபோன்'}, {id: 'app-messages', label: 'செய்திகள்'}, {id: 'app-mail', label: 'மெயில்'}], {back: 'அமைப்புகள்'}), target: 'app-phone', say: '<strong>ஃபோனைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'ஃபோன்', [{id: 'silence', label: 'தெரியாத அழைப்பாளர்களை அமைதியாக்கு', toggle: !!c.silence}, {id: 'blocked', label: 'தடுக்கப்பட்ட தொடர்புகள்', value: '1'}], {back: 'செயலிகள்'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>தெரியாத அழைப்பாளர்களை அமைதியாக்கு என்பதை இயக்குங்கள்.</strong> உங்கள் தொடர்புகளில் இல்லாத எண்களின் அழைப்புகள் நேராக குரலஞ்சலுக்குச் செல்லும், ஆனாலும் உங்கள் சமீபத்திய அழைப்புகளில் தெரியும்.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'தடுக்கப்பட்டது! <strong>ஸ்பேம் அழைப்புகளை வடிகட்டவும்</strong> முடியும். மேல் வலதில் உள்ள <strong>மூன்று புள்ளிகளைத் ⋮ தட்டுங்கள்</strong>.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'அமைப்புகள்', [{id: 'caller-id', label: 'அழைப்பாளர் ஐடி &amp; ஸ்பேம்'}, {id: 'blocked', label: 'தடுக்கப்பட்ட எண்கள்'}, {id: 'sounds', label: 'ஒலிகளும் அதிர்வும்'}]), target: 'caller-id', say: '<strong>அழைப்பாளர் ஐடி &amp; ஸ்பேம் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'அழைப்பாளர் ஐடி &amp; ஸ்பேம்', [{id: 'caller-show', label: 'அழைப்பாளர் மற்றும் ஸ்பேம் ஐடியைப் பார்', toggle: true}, {id: 'silence', label: 'ஸ்பேம் அழைப்புகளை வடிகட்டு', toggle: !!c.silence, sub: 'சந்தேகத்துக்குரிய ஸ்பேம் அழைப்புகள் உங்கள் ஃபோனை ஒலிக்கச் செய்யாது'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>ஸ்பேம் அழைப்புகளை வடிகட்டு என்பதை இயக்குங்கள்.</strong> சந்தேகத்துக்குரிய மோசடி அழைப்புகள் உங்கள் ஃபோனை ஒலிக்கச் செய்யாது.'},
        ]),
        {screen: c => list(p, 'முடிந்தது', [{label: 'தடுக்கப்பட்ட எண்கள்', value: '1'}, {label: p === 'ios' ? 'தெரியாத அழைப்பாளர்களை அமைதியாக்கு' : 'ஸ்பேம் அழைப்புகளை வடிகட்டு', toggle: true}]),
         question: {q: 'தெரியாத அழைப்பாளர்களை அமைதியாக்குவதால், மருத்துவமனை அல்லது டெலிவரி ஓட்டுநர் போன்ற உண்மையான அழைப்பைத் தவறவிடக்கூடுமா?', options: [
            {t: 'ஆம், எனவே அவ்வப்போது உங்கள் குரலஞ்சலையும் தவறிய அழைப்புகளையும் பாருங்கள்', ok: true, why: 'சரியே. உண்மையான அழைப்பாளர்கள் பொதுவாகச் செய்தி விட்டுச் செல்வார்கள், தவறிய அழைப்புகளும் உங்கள் பட்டியலில் தெரியும்.'},
            {t: 'இல்லை, அவர்கள் எப்போதும் வந்தடைவார்கள்', why: 'தெரியாத எண்கள் குரலஞ்சலுக்குச் செல்லும், உண்மையானவையும் அப்படியே. உங்கள் குரலஞ்சலையும் தவறிய அழைப்புகளையும் அவ்வப்போது பாருங்கள்.'}]}},
        {screen: () => list(p, 'முடிந்தது', [{label: 'தடுக்கப்பட்ட எண்கள்', value: '1'}, {label: p === 'ios' ? 'தெரியாத அழைப்பாளர்களை அமைதியாக்கு' : 'ஸ்பேம் அழைப்புகளை வடிகட்டு', toggle: true}]), done: true,
         say: '<strong>சபாஷ்!</strong> தொல்லை தரும் எண்ணைத் தடுத்து, மோசடி அழைப்புகளைக் குறைத்துவிட்டீர்கள்.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: செலுத்தப்படாத £1.45 கட்டணத்தால் உங்கள் பார்சல் நிறுத்தப்பட்டுள்ளது. மீண்டும் முன்பதிவு செய்ய இப்போதே செலுத்துங்கள்: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">பெறுநர்: ${field('fwdto', 'எண்', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>நன்றி. மோசடிக் குறுஞ்செய்தி வந்த ஃபோன் எண்ணை அனுப்புங்கள்.</span><small>இப்போது</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>நன்றி, உங்கள் புகார் பெறப்பட்டது.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'புதிய செய்தி') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'குறுஞ்செய்தி', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'மேலும்… பிறகு முன்னனுப்பு' : 'முன்னனுப்பு'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Royal Mail போல நடிக்கும் மோசடிக் குறுஞ்செய்தி உங்களுக்கு வந்துள்ளது. நீக்கும் முன், அதை இலவசமாகப் புகாரளியுங்கள். <strong>செய்திகளைத் திறங்கள்.</strong>'},
        {screen: () => app(p, 'செய்திகள்', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: 'திறக்க <strong>செய்தியைத் தட்டுங்கள்</strong>. உள்ளே இருக்கும் இணைப்பைத் தட்டாதீர்கள்!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: 'ஒரு மெனு தோன்றும் வரை <strong>செய்தியை அழுத்திப் பிடியுங்கள்</strong> (உங்கள் விரலை அதன் மேல் வைத்திருங்கள்). இணைப்பைத் தட்டாதீர்கள்.', hint: 'ஒரு விநாடி அல்லது இரண்டு விநாடிகள் சாம்பல் நிறச் செய்திக் குமிழி மேல் உங்கள் விரலை வைத்திருங்கள்.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>மேலும்… என்பதைத் தட்டுங்கள்</strong>, பிறகு முன்னனுப்பும் அம்புக்குறியைத் தட்டுங்கள் (இங்கே ஒரே பட்டன் இரண்டையும் செய்கிறது).' : '<strong>முன்னனுப்பு என்பதைத் தட்டுங்கள்.</strong> (சில ஃபோன்களில் இது மேலே உள்ள மூன்று புள்ளிகளின் ⋮ கீழ் இருக்கும்.)',
         hints: {delete: 'முதலில் புகாரளியுங்கள், பிறகு நீக்கலாம்.', copy: '7726-க்கு அனுப்ப முன்னனுப்பு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: '"பெறுநர்" பெட்டியில் 7726 எனத் தட்டச்சு செய்யுங்கள் (ஃபோன் விசைப்பலகையில் இது SPAM என்று எழுதும்), பிறகு அனுப்பு என்பதைத் தட்டுங்கள்.',
         action: c => { c.sent7726 = true; }, say: '<strong>பெறுநர்</strong> பெட்டியில் <strong>7726</strong> எனத் தட்டச்சு செய்யுங்கள். (விசைப்பலகையில் இது S-P-A-M என்று எழுதும்.) பிறகு <strong>அனுப்பு என்பதைத் தட்டுங்கள்</strong> ⟦send-horizontal⟧. இது இலவசம்.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'மோசடிக்காரரின் எண் 07700 900911-ஐத் தட்டச்சு செய்து, பிறகு அனுப்பு என்பதைத் தட்டுங்கள்.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: 'மோசடி எந்த எண்ணிலிருந்து வந்தது என்று கேட்டு 7726 பதிலளிக்கும். <strong>07700 900911 எனத் தட்டச்சு செய்து</strong> <strong>அனுப்பு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'புகாரளித்துவிட்டீர்கள். இப்போது அந்த மோசடிக் குறுஞ்செய்தியை என்ன செய்ய வேண்டும்?', options: [
            {t: 'அதை நீக்கிவிட்டு, அந்த எண்ணைத் தடுப்பேன்', ok: true, why: 'ஆம். புகாரளிக்கப்பட்டுவிட்டதால் நீக்கலாம். தடுத்தால் அந்த எண்ணிலிருந்து மேலும் குறுஞ்செய்திகள் வராது.'},
            {t: 'அது உண்மையானதா என்று பார்க்க இணைப்பைத் தட்டுவேன்', why: 'மோசடிக் குறுஞ்செய்திகளில் உள்ள இணைப்புகளை ஒருபோதும் தட்டாதீர்கள். அதை நீக்கி, எண்ணைத் தடுங்கள்.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>சபாஷ்!</strong> மோசடிக் குறுஞ்செய்தியை 7726-க்குப் புகாரளித்துவிட்டீர்கள்; இது நெட்வொர்க்குகள் அனைவருக்கும் அதைத் தடுக்க உதவும். மோசடி மின்னஞ்சல்கள் report@phishing.gov.uk-க்குச் செல்ல வேண்டும்.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'புதுப்பிப்புகள் பாதுகாப்புச் சிக்கல்களைச் சரிசெய்கின்றன, எனவே அவை முக்கியம். முதலில் உங்கள் ஃபோனை மின்சாரத்தில் இணைத்து, Wi-Fi-இல் இணையுங்கள். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>பொது என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'பொது', [{id: 'about', label: 'பற்றி'}, {id: 'software', label: 'மென்பொருள் புதுப்பிப்பு', value: '1'}, {id: 'storage', label: 'iPhone சேமிப்பகம்'}], {back: 'அமைப்புகள்'}), target: 'software', say: '<strong>மென்பொருள் புதுப்பிப்பு என்பதைத் தட்டுங்கள்.</strong> சிவப்பு 1 என்றால் ஒரு புதுப்பிப்பு காத்திருக்கிறது.'},
        {screen: () => list(p, 'மென்பொருள் புதுப்பிப்பு', [{id: 'auto', label: 'தானியங்கிப் புதுப்பிப்புகள்', value: 'ஆஃப்'}], {back: 'பொது',
            bottom: '<div class="hu"><strong>iOS புதுப்பிப்பு</strong><p>இந்தப் புதுப்பிப்பில் முக்கியமான பாதுகாப்புத் திருத்தங்கள் உள்ளன; அனைத்துப் பயனர்களுக்கும் பரிந்துரைக்கப்படுகிறது.</p><button type="button" class="ce co" data-tap="update-now">இப்போது புதுப்பி</button></div>'}),
         target: 'update-now', say: '<strong>இப்போது புதுப்பி என்பதைத் தட்டுங்கள்.</strong>', hints: {auto: 'இதற்குப் பிறகு தானியங்கிப் புதுப்பிப்புகளையும் இயக்குவது நல்லது. முதலில் இப்போது புதுப்பி என்பதைத் தட்டுங்கள்.'}},
        {screen: c => codeScreen(p, c, 'கடவுக்குறியீட்டை உள்ளிடுங்கள்', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'உங்கள் iPhone கடவுக்குறியீட்டைக் கேட்கிறது. <strong>பயிற்சிக் குறியீடு 4 7 1 9 3 6-ஐத் தட்டச்சு செய்யுங்கள்.</strong>', hint: '4 7 1 9 3 6-ஐத் தட்டச்சு செய்யுங்கள்.'},
        {screen: c => list(p, 'மென்பொருள் புதுப்பிப்பு', [], {back: 'பொது', bottom: `<div class="hu"><strong>${c.busy ? 'பதிவிறக்குகிறது…' : 'நிறுவத் தயார்'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'முதலில் அது பதிவிறக்கும்; அதற்குச் சில நிமிடங்கள் ஆகலாம். பிறகு <strong>இப்போது நிறுவு என்பதைத் தட்டுங்கள்</strong>. உங்கள் ஃபோன் மறுதொடங்கும், எனவே 15 முதல் 30 நிமிடங்களுக்கு அது தேவைப்படாத நேரத்தில் செய்யுங்கள்.'},
        {screen: () => list(p, 'மென்பொருள் புதுப்பிப்பு', [{id: 'auto', label: 'தானியங்கிப் புதுப்பிப்புகள்', value: 'ஆன்'}], {back: 'பொது', bottom: '<div class="hu"><strong>உங்கள் iPhone புதுப்பிக்கப்பட்டுள்ளது</strong></div>'}),
         question: {q: 'தானியங்கிப் புதுப்பிப்புகளை இயக்குவது பயனுள்ளதா?', options: [
            {t: 'ஆம், அப்போது சார்ஜ் ஆகும்போது இரவில் புதுப்பிக்கும்', ok: true, why: 'சரியே. அமைப்புகள் > பொது > மென்பொருள் புதுப்பிப்பு > தானியங்கிப் புதுப்பிப்புகள். மின்சாரத்தில் இணைத்து Wi-Fi-இல் இருக்கும்போது இரவில் நிறுவும்.'},
            {t: 'இல்லை, புதுப்பிப்புகள் விருப்பமானவையே', why: 'மோசடிக்காரர்கள் பயன்படுத்தும் பாதுகாப்பு ஓட்டைகளைப் புதுப்பிப்புகள் அடைக்கின்றன. தானியங்கிப் புதுப்பிப்புகள் நினைவில் வைக்காமலேயே உங்களைப் பாதுகாக்கும்.'}]}},
        {screen: () => list(p, 'மென்பொருள் புதுப்பிப்பு', [], {bottom: '<div class="hu"><strong>உங்கள் iPhone புதுப்பிக்கப்பட்டுள்ளது ⟦check⟧</strong></div>'}), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் ஃபோன் புதுப்பிக்கப்பட்டு, சமீபத்திய சிக்கல்களிலிருந்து பாதுகாக்கப்படுகிறது.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'புதுப்பிப்புகள் பாதுகாப்புச் சிக்கல்களைச் சரிசெய்கின்றன, எனவே அவை முக்கியம். முதலில் உங்கள் ஃபோனை மின்சாரத்தில் இணைத்து, Wi-Fi-இல் இணையுங்கள். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'கீழே உருட்டி <strong>சிஸ்டம் என்பதைத் தட்டுங்கள்</strong>. <em>Samsung-இல் இது கீழ்ப்பகுதிக்கு அருகில் உள்ள மென்பொருள் புதுப்பிப்பு.</em>'},
        {screen: () => list(p, 'சிஸ்டம்', [{id: 'languages', label: 'மொழிகள்'}, {id: 'date', label: 'தேதி &amp; நேரம்'}, {id: 'software', label: 'மென்பொருள் புதுப்பிப்புகள்', sub: 'புதுப்பிப்பு உள்ளது'}]), target: 'software', say: '<strong>மென்பொருள் புதுப்பிப்புகள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'மென்பொருள் புதுப்பிப்புகள்', [{id: 'system-update', label: 'சிஸ்டம் புதுப்பிப்பு', sub: 'புதுப்பிப்பு உள்ளது'}, {id: 'play-update', label: 'Google Play சிஸ்டம் புதுப்பிப்பு'}]), target: 'system-update', say: '<strong>சிஸ்டம் புதுப்பிப்பு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'சிஸ்டம் புதுப்பிப்பு', [], {bottom: '<div class="hu"><strong>சிஸ்டம் புதுப்பிப்பு உள்ளது</strong><p>முக்கியமான பாதுகாப்புத் திருத்தங்கள் உள்ளன.</p><button type="button" class="ce dk" data-tap="download">பதிவிறக்கி நிறுவு</button></div>'}),
         target: 'download', say: '<strong>பதிவிறக்கி நிறுவு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'சிஸ்டம் புதுப்பிப்பு', [], {bottom: `<div class="hu"><strong>${c.busy ? 'பதிவிறக்கி நிறுவுகிறது…' : 'முடிக்க மறுதொடங்கு'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'அது பதிவிறக்கி தயாராகும்; அதற்குச் சிறிது நேரம் ஆகலாம். பிறகு <strong>இப்போது மறுதொடங்கு என்பதைத் தட்டுங்கள்</strong>. உங்கள் ஃபோன் அணைந்து மீண்டும் இயங்கும்; அதற்குச் சில நிமிடங்கள் ஆகும்.'},
        {screen: () => list(p, 'சிஸ்டம் புதுப்பிப்பு', [], {bottom: '<div class="hu"><strong>உங்கள் சிஸ்டம் புதுப்பிக்கப்பட்டுள்ளது</strong></div>'}),
         question: {q: 'உங்கள் ஃபோனுக்குப் பல ஆண்டுகளாகப் புதுப்பிப்பு வரவில்லை. அதற்கு என்ன அர்த்தமாக இருக்கலாம்?', options: [
            {t: 'பாதுகாப்புப் புதுப்பிப்புகளைப் பெற முடியாத அளவுக்குப் பழையதாக இருக்கலாம், எனவே பாதுகாப்பு குறைவு', ok: true, why: 'ஆம். பழைய ஃபோன்களுக்குப் புதுப்பிப்புகள் வருவது நின்றுவிடும். அவற்றில் வங்கிச் சேவையைத் தவிருங்கள், முடிந்தபோது மாற்றுவதைப் பரிசீலியுங்கள்.'},
            {t: 'அது மிகச் சிறப்பாக வேலை செய்கிறது', why: 'சில ஆண்டுகளுக்குப் பிறகு ஃபோன்களுக்குப் புதுப்பிப்புகள் வருவது நின்றுவிடும்; அதனால் பாதுகாப்பு ஓட்டைகள் சரிசெய்யப்படாமல் இருக்கும்.'}]}},
        {screen: () => list(p, 'சிஸ்டம் புதுப்பிப்பு', [], {bottom: '<div class="hu"><strong>உங்கள் சிஸ்டம் புதுப்பிக்கப்பட்டுள்ளது ⟦check⟧</strong></div>'}), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் ஃபோன் புதுப்பிக்கப்பட்டு, சமீபத்திய சிக்கல்களிலிருந்து பாதுகாக்கப்படுகிறது.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (மகள்)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'மருத்துவ ஐடி' : 'மருத்துவத் தகவல்', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'எ.கா. வகை 2 நீரிழிவு', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'எ.கா. Penicillin', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>பூட்டியிருக்கும்போது காட்டு</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'முடிந்தது' : 'சேமி'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>ஒரு தொடர்பைத் தேர்ந்தெடுங்கள்</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'உடல்நலம்', '#fff', ICON2.health]]), target: 'health', say: 'உங்கள் ஃபோன் பூட்டியிருந்தாலும், <strong>மருத்துவ ஐடி</strong> மூலம் துணை மருத்துவர்கள் உங்கள் ஒவ்வாமைகளையும் அவசரத் தொடர்பையும் பார்க்கலாம். <strong>உடல்நலம் செயலியைத் திறங்கள்.</strong>'},
            {screen: () => app(p, 'சுருக்கம்', '<p class="cf">உங்கள் உடல்நலத் தரவு இங்கே காட்டப்படும்.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: 'மேல் வலதில் உள்ள <strong>உங்கள் படத்தைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'உடல்நல விவரங்கள்'}, {id: 'medical', label: 'மருத்துவ ஐடி'}], {back: 'சுருக்கம்'}), target: 'medical', say: '<strong>மருத்துவ ஐடி என்பதைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'உங்கள் ஃபோன் பூட்டியிருந்தாலும் துணை மருத்துவர்கள் பார்க்கக்கூடிய <strong>மருத்துவத் தகவலை</strong> அதில் சேமிக்கலாம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'கீழே உருட்டி <strong>பாதுகாப்பு &amp; அவசரநிலை என்பதைத் தட்டுங்கள்</strong>. <em>Samsung-இல் இது பாதுகாப்பு மற்றும் அவசரநிலை.</em>'},
            {screen: () => list(p, 'பாதுகாப்பு &amp; அவசரநிலை', [{id: 'medical', label: 'மருத்துவத் தகவல்'}, {id: 'contacts-ec', label: 'அவசரத் தொடர்புகள்'}, {id: 'sos', label: 'அவசர SOS'}]), target: 'medical', say: '<strong>மருத்துவத் தகவல் என்பதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'முதலில் ஓர் ஒவ்வாமையைத் தட்டச்சு செய்யுங்கள் (பயிற்சிக்கு, "Penicillin"), பிறகு ஓர் அவசரத் தொடர்பைச் சேருங்கள்.',
         say: 'துணை மருத்துவர்கள் தெரிந்துகொள்ள வேண்டிய எதையும் நிரப்புங்கள். பயிற்சிக்கு ஒவ்வாமைகளில் <strong>Penicillin</strong> எனத் தட்டச்சு செய்யுங்கள். பிறகு <strong>அவசரத் தொடர்பைச் சேர் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'அவசரத்தில் யாரை அழைக்க வேண்டும் என்பதைத் தேர்ந்தெடுங்கள். <strong>Sarah-வைத் தட்டுங்கள்.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '"பூட்டியிருக்கும்போது காட்டு" இயக்கத்தில் உள்ளது, எனவே துணை மருத்துவர்கள் இதைப் பார்க்கலாம். <strong>முடிந்தது என்பதைத் தட்டுங்கள்.</strong>' : '<strong>சேமி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'மருத்துவ ஐடி' : 'மருத்துவத் தகவல்', [{label: 'ஒவ்வாமைகள்', sub: typed(c, 'allergies')}, {label: 'அவசரத் தொடர்பு', sub: 'Sarah (மகள்)'}]),
         question: {q: p === 'ios' ? 'உங்கள் ஃபோன் பூட்டியிருந்தால் துணை மருத்துவர் உங்கள் மருத்துவ ஐடியை எப்படிப் பார்ப்பார்?' : 'உங்கள் ஃபோன் பூட்டியிருந்தால் துணை மருத்துவர் இதை எப்படிப் பார்ப்பார்?', options: [
            {t: 'பூட்டுத் திரையில் உள்ள "அவசரம்" பட்டன் மூலம்', ok: true, why: 'ஆம். பூட்டுத் திரையில் அவசரம் என்பதைத் தட்டினால், ஃபோனைத் திறக்காமலேயே உங்கள் மருத்துவத் தகவல் தெரியும்.'},
            {t: 'அவர்களால் முடியாது', why: 'முடியும்: பூட்டுத் திரையில் உள்ள அவசரம் பட்டன் அதைக் காட்டும், உங்கள் கடவுக்குறியீடு தேவையில்லை.'}]}},
        {screen: c => list(p, p === 'ios' ? 'மருத்துவ ஐடி' : 'மருத்துவத் தகவல்', [{label: 'ஒவ்வாமைகள்', sub: typed(c, 'allergies')}, {label: 'அவசரத் தொடர்பு', sub: 'Sarah (மகள்)'}]), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் மருத்துவத் தகவலும் அவசரத் தொடர்பும் சேமிக்கப்பட்டன. அவசர SOS மூலம் உதவிக்கு அழைத்தால், உங்கள் அவசரத் தொடர்புக்கும் தெரிவிக்கப்படும்.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Find My' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ ஒலி எழுப்புகிறது…' : '⟦volume-2⟧ ஒலி எழுப்பு'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'தொலைந்ததாகக் குறி' : 'சாதனத்தைப் பாதுகாப்பாக்கு'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'உங்கள் ஃபோன் எப்போதாவது தொலைந்தால், கண்டுபிடிக்கவும், ஒலிக்கச் செய்யவும், பூட்டவும் முடியும்; ஆனால் இது முன்கூட்டியே இயக்கப்பட்டிருந்தால் மட்டுமே. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'மேலே <strong>உங்கள் பெயரைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'Apple Account', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Find My'}, {id: 'family', label: 'குடும்பப் பகிர்வு'}], {back: 'அமைப்புகள்'}), target: 'findmy', say: '<strong>Find My என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'Find My', [{id: 'find-toggle', label: 'Find My iPhone', toggle: !!c.findOn}, {label: 'கடைசி இருப்பிடத்தை அனுப்பு', toggle: !!c.findOn}], {back: 'Apple Account'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Find My iPhone-ஐ இயக்குங்கள்.</strong> "கடைசி இருப்பிடத்தை அனுப்பு" என்பது பேட்டரி தீர்வதற்குச் சற்று முன் அதன் இருப்பிடத்தை அனுப்பும்.'},
            {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'இப்போது உங்கள் ஃபோனைக் கண்டுபிடிக்க முடியவில்லை என்று கற்பனை செய்யுங்கள். வேறொரு Apple சாதனத்தில் <strong>Find My</strong>-ஐத் திறப்பீர்கள் (அல்லது கணினியில் icloud.com/find-க்குச் செல்வீர்கள்). இங்கே <strong>Find My-ஐத் தட்டுங்கள்</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'கீழே உருட்டி <strong>Google-ஐத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'அனைத்துச் சேவைகள்'}, {id: 'account', label: 'உங்கள் Google கணக்கை நிர்வகியுங்கள்'}]), target: 'all-services', say: '<strong>அனைத்துச் சேவைகள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'அனைத்துச் சேவைகள்', [{id: 'find-hub', label: 'Find Hub', sub: 'முன்பு Find My Device என அழைக்கப்பட்டது'}, {id: 'theft', label: 'திருட்டுப் பாதுகாப்பு'}]), target: 'find-hub', say: '<strong>Find Hub-ஐத் தட்டுங்கள்</strong> (இது முன்பு Find My Device என அழைக்கப்பட்டது). <em>Samsung-இலும் தனியாக ஒன்று உண்டு: அமைப்புகள் &gt; பாதுகாப்பு மற்றும் தனியுரிமை &gt; தொலைந்த சாதனப் பாதுகாப்பு.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Find Hub-ஐப் பயன்படுத்து', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Find Hub-ஐப் பயன்படுத்து என்பதை இயக்குங்கள்.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'இப்போது உங்கள் ஃபோனைக் கண்டுபிடிக்க முடியவில்லை என்று கற்பனை செய்யுங்கள். வேறொரு ஃபோன் அல்லது டேப்லெட்டில் <strong>Find Hub</strong>-ஐத் திறப்பீர்கள், அல்லது கணினியில் google.com/android/find-க்குச் செல்வீர்கள். இங்கே <strong>Find Hub-ஐத் தட்டுங்கள்</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'இதோ, வரைபடத்தில் உள்ளது. சோபாவின் ஓரத்தில் போல அருகிலேயே எங்காவது இருந்தால், <strong>ஒலி எழுப்பு என்பதைத் தட்டுங்கள்</strong>: அமைதிப் பயன்முறையிலும் அது உரத்து ஒலிக்கும்.'},
        {screen: c => findMap(p, c), question: {q: 'நீங்கள் என்றும் சென்றிராத இடத்தில் உங்கள் ஃபோன் இருப்பதாக வரைபடம் காட்டுகிறது. என்ன செய்ய வேண்டும்?', options: [
            {t: 'தொலைந்ததாகக் குறி அல்லது சாதனத்தைப் பாதுகாப்பாக்கு மூலம் பூட்டி, காவல்துறையைத் தொடர்புகொள்ளுங்கள்', ok: true, why: 'ஆம். Find My அல்லது Find Hub மூலம் அதைப் பூட்டுங்கள், நீங்களே அங்கே செல்லாதீர்கள், காவல்துறைக்கும் உங்கள் நெட்வொர்க்குக்கும் புகாரளியுங்கள்.'},
            {t: 'நானே போய் அதை மீட்டுவருவேன்', why: 'திருடனை ஒருபோதும் எதிர்கொள்ளாதீர்கள். ஃபோனைத் தொலைவிலிருந்து பூட்டி, காவல்துறையைத் தொடர்புகொள்ளுங்கள்.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் ஃபோனைக் கண்டுபிடிக்கும் வசதி இயக்கப்பட்டது; அதை ஒலிக்கச் செய்வது அல்லது பூட்டுவது எப்படி என்பதும் உங்களுக்குத் தெரியும்.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>இலவசத் தொழில்நுட்பக் குறிப்புகள்</strong>${UI.qr}<small>என்னை ஸ்கேன் செய்</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'இந்தப் புகைப்படத்தை நீக்கவா?', p === 'ios' ? 'இது 30 நாட்களுக்கு "சமீபத்தில் நீக்கப்பட்டவை" என்பதில் வைக்கப்படும்.' : 'முழுமையாக நீங்கும் முன் சிறிது காலம் அது குப்பைத்தொட்டிக்கு நகர்த்தப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-delete', 'நீக்கு']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>கேமராவைத் திறங்கள்.</strong> <em>குறிப்பு: பெரும்பாலான ஃபோன்களில் பூட்டுத் திரையில் இடப்புறம் ஸ்வைப் செய்தும் திறக்கலாம்.</em>', hint: 'கேமரா என்பது கேமரா படம் உள்ள சாம்பல் நிற ஐகான்.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'அதை மலர்களின் பக்கம் காட்டி அசையாமல் பிடியுங்கள். புகைப்படம் எடுக்க <strong>பெரிய வட்டப் பட்டனைத் தட்டுங்கள்</strong>.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'படம் எடுத்தாயிற்று! அது சேமிக்கப்பட்டது. அதைப் பார்க்க மூலையில் உள்ள <strong>சிறு படத்தைத் தட்டுங்கள்</strong>.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'நெருக்கமாகப் பார்க்க, புகைப்படத்தின் மீது இரண்டு விரல்களை வைத்து விரியுங்கள். இங்கே <strong>＋ ஐ இரண்டு முறை தட்டுங்கள்</strong>.', hint: 'மேல் வலதில் உள்ள ＋ ஐத் தட்டுங்கள்.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'அழகு! யாருக்காவது அனுப்ப, ⇪ <strong>பகிர் பட்டனைத் தட்டுங்கள்</strong> (அம்புக்குறியுடன் ஒரு பெட்டி).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'எப்படி அனுப்புவது எனத் தேர்ந்தெடுங்கள்: செய்திகள், மின்னஞ்சல், WhatsApp எனப் பல. <strong>செய்திகளைத் தட்டுங்கள்.</strong> (பிறகு யாருக்கு அனுப்புவது என்று தேர்ந்தெடுப்பீர்கள்.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'அனுப்பப்பட்டது! இப்போது, உங்களுக்குப் பிடிக்காத புகைப்படத்தை எடுத்துவிட்டால், அதை நீக்க <strong>குப்பைத்தொட்டியைத் தட்டுங்கள்</strong> ⟦trash-2⟧.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'முதலில் உங்கள் ஃபோன் உறுதி செய்யும். <strong>நீக்கு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => app(p, 'புகைப்படங்கள்', '<p class="cf">இன்னும் புகைப்படங்கள் இல்லை.</p>', {back: false, color: '#fff'}), question: {q: 'தவறுதலாக ஒரு புகைப்படத்தை நீக்கிவிட்டீர்கள்! என்ன செய்யலாம்?', options: [
            {t: p === 'ios' ? 'ஆல்பங்கள் > சமீபத்தில் நீக்கப்பட்டவை என்பதில் பார்த்து மீட்டெடுப்பேன்' : 'குப்பைத்தொட்டியில் (லைப்ரரி > குப்பைத்தொட்டி) பார்த்து மீட்டெடுப்பேன்', ok: true, why: 'ஆம். நீக்கிய புகைப்படங்கள் சிறிது காலம், பொதுவாக ஒரு மாதம் வரை வைக்கப்படும், எனவே அவற்றைத் திரும்பப் பெறலாம்.'},
            {t: 'எதுவும் இல்லை, அது என்றென்றைக்குமாகப் போய்விட்டது', why: 'கவலை வேண்டாம்! அது சிறிது காலம் "சமீபத்தில் நீக்கப்பட்டவை" (iPhone) அல்லது குப்பைத்தொட்டியில் (Android) இருக்கும்.'}]}},
        {screen: () => app(p, 'புகைப்படங்கள்', '<p class="cf">எல்லாம் முடிந்தது.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>சபாஷ்!</strong> புகைப்படங்களை எடுக்கவும், பெரிதாக்கவும், பகிரவும், நீக்கவும் உங்களால் முடியும்.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'உங்கள் குடும்பத்தினரிடமும் iPhone இருந்தால், <strong>FaceTime</strong> இலவச வீடியோ அழைப்புகளைச் செய்யும். <strong>FaceTime-ஐத் தட்டுங்கள்.</strong>' : '<strong>Google Meet</strong> Android-இலிருந்தும், iPhone-களுக்கும் இலவச வீடியோ அழைப்புகளைச் செய்யும். <strong>Google Meet-ஐத் தட்டுங்கள்.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'புதிய FaceTime' : 'புதியது'}</button><p class="cf">சமீபத்திய அழைப்புகள் இங்கே தோன்றும்.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'புதிய FaceTime' : 'புதியது'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'புதிய FaceTime' : 'அழை', `<div class="xz">To: ${field('callto', 'பெயர் அல்லது எண்', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'வீடியோ அழைப்பு'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'முதலில் "பெறுநர்" பெட்டியில் Sarah எனத் தட்டச்சு செய்யுங்கள்.',
             say: 'உங்கள் தொடர்புகளில் உள்ள ஒருவரின் பெயரைத் தட்டச்சு செய்யுங்கள். <strong>Sarah எனத் தட்டச்சு செய்து</strong>, பிறகு <strong>வீடியோ பட்டனைத் தட்டுங்கள்</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'அது ஒலிக்கிறது, பிறகு Sarah பதிலளிக்கிறார். அவருக்குத் தோட்டத்தைக் காட்ட, பின்புறக் கேமராவைப் பயன்படுத்த <strong>திருப்பு பட்டனைத் தட்டுங்கள்</strong> ⟦switch-camera⟧.', hint: 'Sarah பதிலளிக்கும் வரை காத்திருந்து, பிறகு ⟦switch-camera⟧-ஐத் தட்டுங்கள்.'},
            {screen: c => waCall(p, c), target: 'end', say: 'முடிந்ததும், அழைப்பைத் துண்டிக்க <strong>சிவப்புப் பட்டனைத் தட்டுங்கள்</strong>.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · வீடியோ · 3 நிமி</p>', {back: false, color: '#fff'}), question: {q: 'உங்கள் நண்பரிடம் Android ஃபோன், உங்களிடம் iPhone. அப்படியும் வீடியோ அழைப்பு செய்ய முடியுமா?', options: [
                {t: 'ஆம், இரண்டிலும் வேலை செய்யும் WhatsApp அல்லது Google Meet மூலம்', ok: true, why: 'சரியே. FaceTime முக்கியமாக iPhone-இலிருந்து iPhone-க்கு. WhatsApp-உம் Google Meet-உம் இரண்டிலும் வேலை செய்யும்.'},
                {t: 'இல்லை, ஒருபோதும் முடியாது', why: 'முடியும்: WhatsApp-உம் Google Meet-உம் இரண்டு வகை ஃபோன்களிலும் வேலை செய்யும்.'}]}},
            {screen: () => app(p, appName, '<p class="cf">எல்லாம் முடிந்தது.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>சபாஷ்!</strong> வீடியோ அழைப்பு செய்து, உங்கள் பின்புறக் கேமராவின் காட்சியைக் காட்டிவிட்டீர்கள்.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR குறியீடுகள் என்பவை சுவரொட்டிகளிலும் உணவுப் பட்டியல்களிலும் காணப்படும் கறுப்பு வெள்ளைச் சதுர வடிவங்கள். கூடுதல் செயலி எதுவும் தேவையில்லாமல் உங்கள் கேமரா அவற்றைப் படிக்கும். <strong>கேமராவைத் திறங்கள்.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'கேமராவை அந்தக் குறியீட்டின் பக்கம் காட்டி, சற்று அசையாமல் பிடியுங்கள். <strong>திரையில் ஓர் இணைப்பு தோன்றும்</strong>: நீங்கள் எதிர்பார்க்கும் நிறுவனத்தின் இணைப்பு போலத் தெரிகிறதா எனப் பார்த்து, பிறகு <strong>அதைத் தட்டுங்கள்</strong>.',
         hints: {shutter: 'புகைப்படம் எடுக்கத் தேவையில்லை: காட்டி, இணைப்பு தோன்றும் வரை காத்திருந்து, இணைப்பைத் தட்டுங்கள்.'},
         hint: p === 'android' ? 'இணைப்பு தோன்றும் வரை காத்திருந்து, அதைத் தட்டுங்கள். எதுவும் தோன்றவில்லையென்றால், Google Lens-ஐ முயலுங்கள்.' : 'இணைப்பு தோன்றும் வரை காத்திருந்து, அதைத் தட்டுங்கள்.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>இலவசத் தொழில்நுட்பக் குறிப்புகள்</h3><p>ஃபோன்கள், கணினிகள், ஆன்லைனில் பாதுகாப்பாக இருப்பது பற்றிய எளிய மொழிக் குறிப்புகள்.</p></div>', {color: '#f8fafc'}),
         question: {q: 'வாகன நிறுத்துமிடக் கட்டண இயந்திரத்தில் ஒரு QR குறியீடு ஸ்டிக்கரைப் பார்க்கிறீர்கள். பணம் செலுத்த மிகப் பாதுகாப்பான வழி எது?', options: [
            {t: 'ஒட்டப்பட்ட QR குறியீட்டை அல்ல, வாகன நிறுத்துமிடத்தின் அதிகாரப்பூர்வ செயலியை அல்லது இயந்திரத்தைப் பயன்படுத்துவேன்', ok: true, why: 'ஆம். கார்டு விவரங்களைத் திருட, மோசடிக்காரர்கள் உண்மையான QR குறியீடுகளின் மேல் போலியானவற்றை ஒட்டுகிறார்கள். அது ஸ்டிக்கரா எனப் பார்த்து, அதிகாரப்பூர்வ செயலியையோ பலகையையோ பயன்படுத்துங்கள்.'},
            {t: 'ஸ்கேன் செய்து செலுத்துவேன், அது வேகமானது', why: 'வாகன நிறுத்துமிட இயந்திரங்களில் போலி QR ஸ்டிக்கர்கள் ஒரு அறியப்பட்ட மோசடி. அதிகாரப்பூர்வ செயலியை அல்லது இயந்திரத்தையே பயன்படுத்துங்கள்.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>இலவசத் தொழில்நுட்பக் குறிப்புகள்</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கேமராவால் QR குறியீடுகளை ஸ்கேன் செய்ய முடியும், முதலில் இணைப்பைச் சரிபார்க்க வேண்டும் என்பதும் உங்களுக்குத் தெரியும்.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'ஞாயிற்றுக்கிழமைப் புகைப்படங்கள் 📷', 'ஹாய் அம்மா, மதிய உணவின்போது எடுத்த புகைப்படங்கள் இதோ…'],
                       ['tv', 'TV Licensing', 'உங்கள் உரிமம் காலாவதியாகிவிட்டது', 'வழக்குத் தொடரப்படுவதைத் தவிர்க்க இப்போதே செயல்படுங்கள். உங்கள் கட்டணத்தைப் புதுப்பியுங்கள்…'],
                       ['library', 'Bridlington நூலகம்', 'உங்கள் புத்தகங்களைத் திருப்பித் தர வேண்டிய நேரம்', 'உங்கள் பொருட்களை வெள்ளிக்கிழமைக்குள் திருப்பித் தர வேண்டும்.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'இன்பாக்ஸ்' : 'முதன்மை', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · எனக்கு</p><h3>ஞாயிற்றுக்கிழமைப் புகைப்படங்கள் 📷</h3><p>ஹாய் அம்மா, மதிய உணவின்போது எடுத்த புகைப்படங்கள் இதோ. உங்களைப் பார்த்தது மகிழ்ச்சி! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'உங்கள் பதிலை எழுதுங்கள்…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>உங்கள் உரிமம் காலாவதியாகிவிட்டது</h3><p>வழக்குத் தொடரப்படுவதைத் தவிர்க்க இப்போதே செயல்படுங்கள். 24 மணி நேரத்துக்குள் உங்கள் கட்டண விவரங்களைப் புதுப்பியுங்கள்: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'குப்பை மின்னஞ்சலுக்கு நகர்த்து' : '⋮ ஃபிஷிங் எனப் புகாரளி'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'மெயில்' : 'உங்கள் மின்னஞ்சல் செயலி (பெரும்பாலான Android ஃபோன்களில் Gmail)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'புதிய மின்னஞ்சல்கள் தடித்த எழுத்தில் இருக்கும். படிக்க <strong>Sarah-வின் மின்னஞ்சலைத் தட்டுங்கள்</strong>.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'பதிலளிக்க, ↩ <strong>பதிலளி என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'முதலில் ஒரு சிறு பதிலைத் தட்டச்சு செய்து, பிறகு அனுப்பு என்பதைத் தட்டுங்கள்.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>ஒரு சிறு பதிலைத் தட்டச்சு செய்து</strong> ("நன்றி, எனக்குப் பிடித்திருக்கிறது!" போல), <strong>அனுப்பு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => app(p, '', '<p class="cf">அனுப்பப்பட்டது ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ இன்பாக்ஸுக்குத் திரும்பு</button>', {color: '#fff'}), target: 'back', say: 'இன்பாக்ஸுக்குத் திரும்ப <strong>பின் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: '"TV Licensing" என்ற பெயரில் கவலையளிக்கும் ஒரு மின்னஞ்சல் உள்ளது. <strong>அதைத் திறங்கள்</strong>, ஆனால் உள்ளே எதையும் தட்டாதீர்கள்.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'மோசடி மின்னஞ்சல்கள் பெரும்பாலும் உண்மையான பெயரையும் போலி முகவரியையும் பயன்படுத்தும். உண்மையான மின்னஞ்சல் முகவரியைப் பார்க்க <strong>அனுப்புநரின் பெயரைத் தட்டுங்கள்</strong>.',
         hint: 'மின்னஞ்சலின் மேலே உள்ள "TV Licensing" என்பதைத் தட்டுங்கள்.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'இது tvlicensing.co.uk இலிருந்து அல்ல, <strong>outlook-mail.com</strong> இலிருந்து வந்தது. இது ஒரு மோசடி. <strong> ' + (p === 'ios' ? 'குப்பை மின்னஞ்சலுக்கு நகர்த்து' : 'ஃபிஷிங் எனப் புகாரளி') + 'என்பதைத் தட்டுங்கள்.</strong> மோசடி மின்னஞ்சல்களை report@phishing.gov.uk-க்கும் முன்னனுப்பலாம்.'},
        {screen: c => inbox(p, c), question: {q: 'மோசடியை எது காட்டிக்கொடுத்தது?', options: [
            {t: 'அனுப்புநரின் உண்மையான முகவரி, மிரட்டல்கள், 24 மணி நேரக் கெடு', ok: true, why: 'சரியே. உண்மையான நிறுவனங்கள் கெடுக்களால் உங்களை மிரட்டுவதில்லை; அவற்றின் மின்னஞ்சல்கள் அவற்றின் சொந்த இணைய முகவரியிலிருந்து வரும்.'},
            {t: 'எதுவும் இல்லை, உண்மையானது போலத் தெரிந்தது', why: 'அனுப்புநரின் முகவரியைச் சரிபாருங்கள்: அது TV Licensing-உடையது அல்ல. மிரட்டல்களும் இறுக்கமான கெடுக்களும் பெரிய எச்சரிக்கை அடையாளங்கள்.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>சபாஷ்!</strong> மின்னஞ்சல்களைப் படிக்கவும் பதிலளிக்கவும், மோசடியைக் கண்டறிந்து புகாரளிக்கவும் உங்களால் முடியும்.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Get' : 'Install';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>தேடலைத் தட்டுங்கள்.</strong>' : '<strong>தேடல் பெட்டியைத் தட்டுங்கள்.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'நாங்கள் "NHS App" எனத் தேடினோம். பல செயலிகள் தங்கள் பெயரில் "NHS" என்பதைப் பயன்படுத்துகின்றன. <strong>யார் உருவாக்கினார்கள்</strong> எனப் பாருங்கள்: உண்மையானதை உருவாக்கியது <strong>NHS England</strong>. <strong>உண்மையானதன் அருகில் உள்ள ' + (p === 'ios' ? 'Get' : 'Install') + ' என்பதைத் தட்டுங்கள்.</strong>',
         hints: {'fake1-get': 'அதை உருவாக்கியது HealthApps Ltd, அது ஒரு விளம்பரம். உண்மையான NHS App-ஐ உருவாக்கியது NHS England.', 'fake2-get': 'அதை உருவாக்கியது QuickDev Apps, NHS அல்ல. உண்மையானதை உருவாக்கியது NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'நிறுவப்பட்டது! இப்போது, ஒழுங்குபடுத்தவும் இடத்தை விடுவிக்கவும், நீங்கள் ஒருபோதும் பயன்படுத்தாத ஒரு செயலியை அகற்றுங்கள். ஒரு மெனு தோன்றும் வரை <strong>வானிலை செயலியை அழுத்திப் பிடியுங்கள்</strong>.', hint: 'ஒரு விநாடி அல்லது இரண்டு விநாடிகள் வானிலை ஐகான் மேல் உங்கள் விரலை வைத்திருங்கள்.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? '"வானிலை"யை அகற்றவா?' : 'வானிலை', p === 'ios' ? 'முகப்புத் திரையிலிருந்து அகற்றினால், செயலி உங்கள் செயலி லைப்ரரியில் இருக்கும்.' : '', p === 'ios'
            ? [['delete-app', 'செயலியை நீக்கு'], ['remove-home', 'முகப்புத் திரையிலிருந்து அகற்று'], ['cancel', 'ரத்துசெய்']] : [['app-info', 'செயலி தகவல்'], ['delete-app', 'நிறுவல்நீக்கு'], ['cancel', 'ரத்துசெய்']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>செயலியை அகற்று என்பதைத் தட்டி</strong>, பிறகு <strong>செயலியை நீக்கு</strong> என்பதைத் தட்டுங்கள் (இங்கே இது ஒரே பட்டன்).' : '<strong>நிறுவல்நீக்கு என்பதைத் தட்டுங்கள்.</strong>',
         hints: {'remove-home': 'அது ஐகானை மட்டுமே மறைக்கும்; செயலி உங்கள் ஃபோனில் அப்படியே இருக்கும். செயலியை நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'ஒரு செயலி உங்கள் NHS பதிவுகளைத் "திறக்க" பணம் கேட்கிறது. இதைப் பற்றி என்ன நினைக்கிறீர்கள்?', options: [
            {t: 'இது முழுவதும் இலவசமான உண்மையான NHS App அல்ல', ok: true, why: 'சரியே. NHS App இலவசம். NHS சேவைகளுக்குப் பணம் கேட்கும் எதையும் நீக்கிவிடுங்கள்.'},
            {t: 'செலுத்துவேன், அது NHS-க்குத்தானே', why: 'உண்மையான NHS App இலவசம், அதை உருவாக்கியது NHS England. பணம் கேட்கும் செயலி உண்மையானது அல்ல.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>சபாஷ்!</strong> உண்மையான செயலிகளையும் போலிகளையும் வேறுபடுத்தவும், தேவையில்லாத செயலிகளை அகற்றவும் உங்களால் முடியும்.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>மீண்டும் வருக.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Face ID மூலம் உள்நுழையுங்கள்' : 'கைரேகை மூலம் உள்நுழையுங்கள்'}</button>
                <button type="button" class="cp" data-tap="password">மின்னஞ்சல் மற்றும் கடவுச்சொல் மூலம் உள்நுழையுங்கள்</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'மருந்துச் சீட்டுகள்'], ['appointments', '⟦calendar⟧', 'சந்திப்புகள்'], ['records', '⟦clipboard-list⟧', 'உங்கள் உடல்நலம்'], ['messages', '⟦mail⟧', 'செய்திகள்']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'மருந்துச் சீட்டுகள்', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>மீண்டும் மருந்துச் சீட்டு ஆர்டர் செய்யுங்கள்</strong><small>ஏற்கெனவே பரிந்துரைக்கப்பட்ட மருந்துகளைத் தேர்ந்தெடுங்கள்</small></button><div class="ck"><strong>உங்கள் ஆர்டர்களைப் பாருங்கள்</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipine 5mg மாத்திரைகள்'], ['med-2', 'Atorvastatin 20mg மாத்திரைகள்']];
            return app(p, 'மருந்துகளைத் தேர்ந்தெடுங்கள்', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'உங்கள் ஆர்டரை உறுதிப்படுத்துங்கள்', `<p class="cf">Amlodipine 5mg மாத்திரைகள்<br>எடுக்கும் இடம்: நீங்கள் தேர்ந்தெடுத்த மருந்தகம்</p><button type="button" class="ce co" data-tap="confirm">உறுதிப்படுத்தி ஆர்டர் செய்</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'ஆர்டர் அனுப்பப்பட்டது', '<p class="cf">⟦check⟧ உங்கள் மருந்துச் சீட்டுக் கோரிக்கை உங்கள் GP மருத்துவமனைக்கு அனுப்பப்பட்டது. வழக்கமாக 2 முதல் 3 வேலை நாட்கள் ஆகும்.</p><button type="button" class="cp" data-tap="home">முகப்புக்குத் திரும்பு</button>', {color: NHS});
        return app(p, 'சந்திப்புகள்', '<div class="fo"><div class="ck"><strong>GP சந்திப்பு</strong><small>செவ்வாய் 10:30 · உங்கள் GP மருத்துவமனை</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> இலவசம்; அதில் மீண்டும் மருந்துச் சீட்டு ஆர்டர் செய்யலாம், சந்திப்புகளைப் பார்க்கலாம், இன்னும் பலவும் செய்யலாம். (இந்தப் பயிற்சிப் பதிப்பு பொய்யானது, இந்தப் பாடத்துக்காக மட்டும் செய்யப்பட்டது.) <strong>NHS App-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `NHS login மூலம் அமைத்த பிறகு, உங்கள் ${p === 'ios' ? 'face' : 'fingerprint'} மூலம் உள்நுழையலாம். <strong>"${p === 'ios' ? 'Face ID' : 'fingerprint'} மூலம் உள்நுழையுங்கள்" என்பதைத் தட்டுங்கள்.</strong>`,
         hints: {password: 'அதுவும் வேலை செய்யும், ஆனால் உங்கள் முகம் அல்லது கைரேகை விரைவானது. நீலப் பட்டனைத் தட்டுங்கள்.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>மருந்துச் சீட்டுகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>மீண்டும் மருந்துச் சீட்டு ஆர்டர் செய்யுங்கள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'முதலில் ஒரு மருந்தைத் தட்டித் தேர்ந்தெடுத்து, பிறகு தொடர் என்பதைத் தட்டுங்கள்.',
         say: '<strong>உங்களுக்குத் தேவையான மருந்தைத் தட்டி</strong> அதைத் தேர்ந்தெடுங்கள் (Amlodipine-ஐ முயலுங்கள்), பிறகு <strong>தொடர் என்பதைத் தட்டுங்கள்</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'சரியாக உள்ளதா எனப் பார்த்து, பிறகு <strong>உறுதிப்படுத்தி ஆர்டர் செய் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'உங்கள் மருத்துவமனைக்கு அனுப்பப்பட்டது! <strong>முகப்புக்குத் திரும்பு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'உங்கள் சந்திப்புகளையும் பார்க்கலாம். <strong>சந்திப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'ஒரு குறுஞ்செய்தி "NHS: நீங்கள் இலவச பரிசோதனைக் கருவிக்குத் தகுதியானவர், அஞ்சல் கட்டணம் செலுத்த உங்கள் வங்கி விவரங்களை உள்ளிடுங்கள்" என்று கூறுகிறது. இது என்ன?', options: [
            {t: 'ஒரு மோசடி. NHS ஒருபோதும் குறுஞ்செய்தியில் வங்கி விவரங்களைக் கேட்காது', ok: true, why: 'சரியே. NHS App அல்லது உங்கள் GP மருத்துவமனையை நேரடியாகப் பயன்படுத்துங்கள்; குறுஞ்செய்தி இணைப்புகளை ஒருபோதும் பயன்படுத்தாதீர்கள்.'},
            {t: 'உண்மையானது, அஞ்சல் கட்டணம்தானே', why: 'NHS ஒருபோதும் குறுஞ்செய்தியில் வங்கி விவரங்களைக் கேட்காது. இது ஒரு மோசடி: 7726-க்கு முன்னனுப்புங்கள்.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>சபாஷ்!</strong> மீண்டும் மருந்துச் சீட்டு ஆர்டர் செய்து, உங்கள் சந்திப்புகளைப் பார்த்துவிட்டீர்கள்.'},
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
        if (page === 'login') return app(p, 'பயிற்சி வங்கி', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Face ID மூலம் உள்நுழையுங்கள்' : 'கைரேகை மூலம் உள்நுழையுங்கள்'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'உங்கள் கணக்குகள்', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'இன்று'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'இன்று'], ['txn-pension', 'அரசு ஓய்வூதியம்', '+£921.60', 'நேற்று'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'திங்கள்']];
            return app(p, 'நடப்புக் கணக்கு', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'பணம் செலுத்துதல்', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>இன்று, 03:12 · 4421 இல் முடியும் கார்டு</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ கார்டை முடக்கு</strong><small>${ctx.frozen ? 'கார்டு முடக்கப்பட்டது ⟦check⟧' : 'உடனே பணம் செலுத்துதல்களை நிறுத்து'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>இந்தப் பணம் செலுத்துதலைப் புகாரளி</strong><small>இது உங்களுடையது இல்லையா? எங்களிடம் சொல்லுங்கள்</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'வங்கி', BANK, ICON2.pound]]), target: 'bank',
         say: 'வங்கி செயலிகள் மூலம் எப்போது வேண்டுமானாலும் உங்கள் பணத்தைப் பார்க்கலாம். (இது பயிற்சிக்கான பொய்யான வங்கி.) <strong>வங்கி செயலியைத் திறங்கள்.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>உங்கள் ${p === 'ios' ? 'face' : 'fingerprint'} மூலம் உள்நுழையுங்கள்.</strong> உங்கள் வங்கிக் கடவுக்குறியீட்டை யாருடனும் பகிராதீர்கள்.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: 'என்ன வரவு வைக்கப்பட்டது, என்ன செலவானது என்று பார்க்க <strong>உங்கள் நடப்புக் கணக்கைத் தட்டுங்கள்</strong>.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'பணம் செலுத்துதல்களைப் பாருங்கள். அவற்றில் ஒன்று உங்களுக்குத் தெரியாதது: <strong>அதிகாலை 3 மணிக்கு, ஒரு பரிசு கார்டு இணையதளத்துக்கு £249</strong>. <strong>அதைத் தட்டுங்கள்.</strong>',
         hints: {'txn-tesco': 'அது உங்கள் ஷாப்பிங். உங்களுக்குத் தெரியாத ஒன்றைத் தேடுங்கள்.', 'txn-pension': 'அது உங்கள் ஓய்வூதியம் வரவு வைக்கப்படுவது. பொருந்தாத ஒன்றைத் தேடுங்கள்.', 'txn-water': 'அது உங்கள் தண்ணீர்க் கட்டணம். பொருந்தாத ஒன்றைத் தேடுங்கள்.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>கார்டை முடக்கு என்பதைத் தட்டுங்கள்</strong>. இது உடனே மேலும் பணம் செலுத்துவதை நிறுத்தும்; பிறகு எல்லாம் சரியென்று தெரிந்தால் முடக்கத்தை நீக்கலாம்.',
         hints: {report: 'மேலும் பணம் செலுத்தப்படுவதை நிறுத்த, முதலில் கார்டை முடக்குங்கள். பிறகு புகாரளியுங்கள்.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'கார்டை முடக்கிவிட்டீர்கள். அடுத்து என்ன?', options: [
            {t: '159-இல் அல்லது கார்டில் உள்ள எண்ணில் உங்கள் வங்கியை அழையுங்கள், அல்லது செயலியில் புகாரளியுங்கள்', ok: true, why: 'ஆம். அவர்கள் விசாரித்து, கார்டை ரத்து செய்து, பெரும்பாலும் பணத்தை மீட்டுத் தர முடியும். எவ்வளவு சீக்கிரம் சொல்கிறீர்களோ அவ்வளவு நல்லது.'},
            {t: 'மீண்டும் நடக்கிறதா எனக் காத்திருந்து பார்ப்பேன்', why: 'உடனே உங்கள் வங்கியிடம் சொல்லுங்கள். அவர்களுக்கு எவ்வளவு சீக்கிரம் தெரிகிறதோ அவ்வளவு அதிகம் செய்ய முடியும்.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கணக்கைப் பார்த்து, உங்களுக்குத் தெரியாத ஒரு பணம் செலுத்துதலைக் கண்டறிந்து, கார்டை முடக்கிவிட்டீர்கள்.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>பயிற்சி வங்கி</strong><span>•••• 4421</span><small>டெபிட்</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'வாலெட்' : 'Google Wallet', `<p class="cf">கடைகளில் உங்கள் ஃபோன் மூலம் பணம் செலுத்த ஒரு கார்டைச் சேருங்கள்.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ கார்டைச் சேர்' : '＋ வாலெட்டில் சேர்'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'கார்டைச் சேர்', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'உங்கள் கார்டைச் சட்டத்துக்குள் பிடியுங்கள்…' : 'கார்டு கண்டறியப்பட்டது ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'கார்டைச் சரிபார்', `<p class="cf">அது நீங்கள்தானா என்று உங்கள் வங்கி சரிபார்க்க வேண்டும். குறியீட்டை எப்படிப் பெறுவது எனத் தேர்ந்தெடுங்கள்:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>குறுஞ்செய்தி</strong><small>••••• •••123 எண்ணுக்கு</small></button><button type="button" class="ck" data-tap="verify-call"><strong>உங்கள் வங்கியை அழையுங்கள்</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'குறியீட்டை உள்ளிடுங்கள்', `<div class="jp ex"><strong>செய்திகள் · இப்போது</strong><span>பயிற்சி வங்கி: உங்கள் Wallet குறியீடு 529173. இதை ஒருபோதும் பகிராதீர்கள்.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'வாலெட்' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ உங்கள் கார்டு பயன்படுத்தத் தயார்.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'ரீடர் அருகே பிடியுங்கள்…' : 'ரீடரில் பிடியுங்கள்…') : '⟦check⟧ முடிந்தது'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'வாலெட்' : 'வாலெட்', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `ஃபோன் மூலம் பணம் செலுத்துவது விரைவானது, பாதுகாப்பானது: உங்கள் கார்டு எண்ணைக் கடைகள் ஒருபோதும் பார்ப்பதில்லை. <strong>${p === 'ios' ? 'வாலெட்' : 'Google Wallet'}-ஐத் திறங்கள்.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ கார்டைச் சேர்' : '＋ வாலெட்டில் சேர்'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'எண்ணைத் தட்டச்சு செய்ய வேண்டியதில்லை என்பதற்காக, உங்கள் ஃபோன் கேமராவால் உங்கள் கார்டைப் படிக்கும். <strong>உங்கள் கார்டைச் சட்டத்துக்குள் பிடியுங்கள்</strong>, பிறகு <strong>Next-ஐத் தட்டுங்கள்</strong>. <em>குறுஞ்செய்தி அல்லது மின்னஞ்சலில் வந்த இணையதளத்தில் உங்கள் கார்டு எண்ணை ஒருபோதும் தட்டச்சு செய்யாதீர்கள்.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'அது உண்மையிலேயே நீங்கள்தானா என்று உங்கள் வங்கி சரிபார்க்கும். <strong>குறுஞ்செய்தி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'உங்கள் வங்கியிடமிருந்து குறுஞ்செய்தியாக ஒரு குறியீடு வரும். <strong>5 2 9 1 7 3 எனத் தட்டச்சு செய்யுங்கள்.</strong> நினைவில் வையுங்கள்: இந்தக் குறியீட்டை உங்கள் சொந்த ஃபோனில் மட்டுமே தட்டச்சு செய்ய வேண்டும்; கேட்கும் யாருக்கும் ஒருபோதும் கொடுக்கக் கூடாது.', hint: 'செய்தியில் உள்ள குறியீட்டைத் தட்டச்சு செய்யுங்கள்: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'உங்கள் கார்டு தயார். இப்போது ஒரு கடையில் பணம் செலுத்துவோம். <strong>கார்டில் எங்காவது தட்டுங்கள்.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'பில் கவுண்டரில், உங்கள் iPhone-இன் <strong>பக்கவாட்டு பட்டனை இருமுறை அழுத்துங்கள்</strong> (இங்கே ⟦power⟧ ஐ இருமுறை தட்டுங்கள்), Face ID-க்காகத் திரையைப் பாருங்கள், பிறகு உங்கள் ஃபோனின் மேற்பகுதியை கார்டு ரீடர் அருகே பிடியுங்கள்.', hint: 'பக்கத்தில் உள்ள ⟦power⟧ பட்டனை இருமுறை தட்டுங்கள்.'}
            : {target: 'pay-now', say: 'பில் கவுண்டரில், <strong>உங்கள் ஃபோனைத் திறந்து அதன் பின்புறத்தை கார்டு ரீடர் அருகே பிடியுங்கள்</strong>. இங்கே <strong>கார்டு ரீடரைத் தட்டுங்கள்</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'ஃபோன் மூலம் பணம் செலுத்துவது பாதுகாப்பானதா?', options: [
            {t: 'ஆம், கார்டை விடப் பாதுகாப்பானது: அதற்கு உங்கள் முகம், கைரேகை அல்லது கடவுக்குறியீடு தேவை, உங்கள் கார்டு எண்ணைக் கடைகள் பார்ப்பதில்லை', ok: true, why: 'சரியே. உங்கள் ஃபோனை இழந்தாலும், அதைத் திறக்காமல் யாரும் அதைக் கொண்டு பணம் செலுத்த முடியாது.'},
            {t: 'இல்லை, யார் வேண்டுமானாலும் பயன்படுத்தலாம்', why: 'ஒவ்வொரு பணம் செலுத்துதலுக்கும் உங்கள் முகம், கைரேகை அல்லது கடவுக்குறியீடு தேவை, எனவே தொடுதலற்ற கார்டை விட இது உண்மையில் பாதுகாப்பானது.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கார்டு உங்கள் ஃபோனில் உள்ளது, நீங்கள் ஒரு பயிற்சிப் பணம் செலுத்துதலையும் செய்துவிட்டீர்கள்.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>டெபிட்</small></div>', '<small>டெபிட்</small></div></button>');
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
            return app(p, 'பயிற்சி ரயில்', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'நிலையத்தைத் தேர்ந்தெடுங்கள்'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'ரயில்கார்டைச் சேர்'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>ஒரு நிலையத்தைத் தேர்ந்தெடுங்கள்</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>ரயில்கார்டைச் சேர்</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'ரயில்கார்டு இல்லை']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'நேரடி'], ['t-1145', '11:45', '12:32', 'நேரடி'], ['t-1245', '12:45', '13:32', 'நேரடி']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">இந்தப் பயிற்சிக்காக விலைகள் கற்பனையானவை. ரயில்கார்டு தள்ளுபடி பயன்படுத்தப்பட்டது.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>ஆஃப்-பீக் ஒருவழி</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>ஆஃப்-பீக் அன்றே திரும்பும் டிக்கெட்</strong><small>இன்றே திரும்புங்கள்</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'உங்கள் டிக்கெட்', `<div class="adt"><strong>ஆஃப்-பீக் அன்றே திரும்பும் டிக்கெட்</strong><span>Bridlington ⇄ Hull</span><span>இன்று · Senior Railcard</span>
            ${UI.qr}<small>இதை டிக்கெட் வாயிலில் ஸ்கேன் செய்யுங்கள், அல்லது ரயில் காவலரிடம் காட்டுங்கள்.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'ரயில்கள்', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'ரயில் செயலிகள் மூலம் வரிசையில் நிற்காமல் உங்கள் ஃபோனிலேயே டிக்கெட் வாங்கலாம். (இந்தப் பயிற்சி செயலி பொய்யானது: விலைகளும் நேரங்களும் கற்பனையானவை.) <strong>ரயில்களைத் திறங்கள்.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'நீங்கள் Bridlington-இலிருந்து செல்கிறீர்கள். எங்கே செல்கிறீர்கள் என்று தேர்ந்தெடுக்க <strong>செல்லுமிடம் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Hull-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: '60 வயதுக்கு மேலா? <strong>Senior Railcard</strong> பெரும்பாலான டிக்கெட்டுகளில் மூன்றில் ஒரு பங்கு மிச்சப்படுத்தும். உங்களுடையதைச் சேர்க்க <strong>ரயில்கார்டு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Senior Railcard-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>ரயில்களைக் கண்டுபிடி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'இதோ ரயில்கள். <strong>10:45 ரயிலைத் தட்டுங்கள்.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'இன்றே திரும்புகிறீர்களா? இரண்டு ஒருவழி டிக்கெட்டுகளை விட, அன்றே திரும்பும் டிக்கெட் பொதுவாக மலிவு. <strong>ஆஃப்-பீக் அன்றே திரும்பும் டிக்கெட்டைத் தட்டுங்கள்</strong>, பிறகு பணம் செலுத்துங்கள்.',
         hints: {single: 'ஒருவழி டிக்கெட் ஒரு திசைக்கு மட்டுமே. நீங்கள் இன்றே திரும்புகிறீர்கள், எனவே ஆஃப்-பீக் அன்றே திரும்பும் டிக்கெட்டைத் தட்டுங்கள்.', pay: 'முதலில் உங்கள் டிக்கெட்டைத் தேர்ந்தெடுங்கள்: ஆஃப்-பீக் அன்றே திரும்பும் டிக்கெட்டைத் தட்டுங்கள்.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `உங்கள் ஃபோனில் உள்ள கார்டில் (தொடுதலற்ற பணம் செலுத்தும் பாடத்தில் உள்ளது) பணம் செலுத்த <strong>${p === 'ios' ? 'செலுத்து' : 'G Pay'}-ஐத் தட்டுங்கள்</strong>.`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'வீடு திரும்பும் ரயிலுக்கு முன் உங்கள் ஃபோன் பேட்டரி குறைவாக உள்ளது. நல்ல யோசனை என்ன?', options: [
            {t: 'டிக்கெட்டின் ஸ்கிரீன்ஷாட் எடுத்து, பேட்டரி சேமிப்பை இயக்குவேன்', ok: true, why: 'ஆம். சில டிக்கெட்டுகள் ஸ்கிரீன்ஷாட்டிலிருந்தும் வேலை செய்யும், பேட்டரி சேமிப்பு அது நீண்ட நேரம் நிற்க உதவும். பல செயலிகள் டிக்கெட்டை Wallet-இலும் சேர்க்க அனுமதிக்கின்றன.'},
            {t: 'எதுவும் செய்யமாட்டேன், சரியாக இருக்கும்', why: 'உங்கள் ஃபோன் அணைந்துவிட்டால் டிக்கெட்டைக் காட்ட முடியாது. ஸ்கிரீன்ஷாட் எடுத்து பேட்டரியைச் சேமியுங்கள்.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>சபாஷ்!</strong> ஒரு பயணத்தைத் திட்டமிட்டு, ரயில்கார்டைச் சேர்த்து, உங்கள் ஃபோனிலேயே டிக்கெட் வாங்கிவிட்டீர்கள்.'},
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

    const busTable = `<div class="sj"><strong>பேருந்து 121: Bridlington முதல் Hull வரை</strong><small>பயிற்சி நேரங்கள் மட்டும்</small>
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
        return app(p, 'பேருந்து நேரங்கள்', busTable, {back: false, color: '#fff',
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
            ? 'ஸ்கிரீன்ஷாட் என்பது இந்தப் பேருந்து நேரங்கள் போல உங்கள் திரையில் இருப்பதன் புகைப்படம். <strong>பக்கவாட்டு பட்டனையும்</strong> (வலது) <strong>ஒலியளவு கூட்டு பட்டனையும்</strong> (இடது) ஒரே நேரத்தில் அழுத்தி, பிறகு விட்டுவிடுங்கள். இங்கே <strong>பக்கவாட்டு பட்டனைத் தட்டி, பிறகு ஒலியளவு கூட்டு பட்டனைத் தட்டுங்கள்</strong>.'
            : 'ஸ்கிரீன்ஷாட் என்பது இந்தப் பேருந்து நேரங்கள் போல உங்கள் திரையில் இருப்பதன் புகைப்படம். <strong>பவர் பட்டனையும்</strong> <strong>ஒலியளவு குறை பட்டனையும்</strong> ஒரே நேரத்தில் அழுத்தி, பிறகு விட்டுவிடுங்கள். இங்கே <strong>பவர் பட்டனைத் தட்டி, பிறகு ஒலியளவு குறை பட்டனைத் தட்டுங்கள்</strong>.',
         hints: {'vol-down': p === 'ios' ? 'iPhone-இல் இது பக்கவாட்டு பட்டனுடன் ஒலியளவு கூட்டு.' : 'வலது பக்கத்தின் மேற்பகுதியில் உள்ள பவர் பட்டனில் தொடங்குங்கள்.',
                 'vol-up': p === 'ios' ? 'வலதில் உள்ள பக்கவாட்டு பட்டனில் தொடங்குங்கள்.' : 'Android-இல் இது பவர் பட்டனுடன் ஒலியளவு குறை.',
                 side: 'இப்போது இடதில் உள்ள ஒலியளவு கூட்டு பட்டன்.', power: 'இப்போது ஒலியளவு குறை பட்டன்.'},
         hint: p === 'ios' ? 'பக்கவாட்டு பட்டன் வலது ஓரத்தில் உள்ளது. ஒலியளவு கூட்டு இடதில் உள்ளது.' : 'பவர் பட்டன் வலது ஓரத்தில் உள்ள மேல் பட்டன்.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'கிளிக்! கீழ் மூலையில் ஒரு சிறு படம் தோன்றும். உங்கள் ஸ்கிரீன்ஷாட்டைப் பார்க்க <strong>அதைத் தட்டுங்கள்</strong>. <em>அதை அப்படியே விட்டால், சில விநாடிகளில் தானாகவே சேமிக்கப்படும்.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'இங்கே அதில் வரையலாம் அல்லது வெட்டலாம். மேல் இடதில் உள்ள <strong>முடிந்தது என்பதைத் தட்டுங்கள்</strong>.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Photos-இல் சேமி என்பதைத் தட்டுங்கள்.</strong>', hints: {'delete-shot': 'அது அதை அகற்றிவிடும். Photos-இல் சேமி என்பதைத் தட்டுங்கள்.', 'save-files': 'Files-உம் வேலை செய்யும், ஆனால் Photos-இல் கண்டுபிடிப்பது எளிது. Photos-இல் சேமி என்பதைத் தட்டுங்கள்.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'கிளிக்! கீழே பட்டன்களுடன் ஒரு சிறு படம் தோன்றும். அது ஏற்கெனவே சேமிக்கப்பட்டுவிட்டது. யாருக்காவது அனுப்ப <strong>பகிர் என்பதைத் தட்டுங்கள்</strong>.', hints: {'shot-edit': 'திருத்து என்பது வெட்டவோ வரையவோ உதவும். இப்போதைக்கு பகிர் என்பதைத் தட்டுங்கள்.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: 'பேருந்து நேரங்களை அனுப்ப <strong>Sarah-வைத் தட்டுங்கள்</strong>.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'உங்கள் ஸ்கிரீன்ஷாட்களைப் பிறகு எங்கே கண்டுபிடிக்கலாம்?', options: [
            {t: 'Photos செயலியில், ஸ்கிரீன்ஷாட்கள் ஆல்பத்தில்', ok: true, why: 'ஆம். அவை உங்கள் புகைப்படங்களுடன் சேமிக்கப்படும், எனவே எந்தப் புகைப்படத்தையும் போலவே அவற்றைப் பார்க்கலாம், பகிரலாம், நீக்கலாம்.'},
            {t: 'ஒரு நாளில் அவை மறைந்துவிடும்', why: 'நீங்கள் நீக்கும் வரை அவை இருக்கும். Photos செயலியில், ஸ்கிரீன்ஷாட்கள் ஆல்பத்தில் பாருங்கள்.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>சபாஷ்!</strong> பேருந்து நேரங்கள், டிக்கெட்டுகள், பிழைச் செய்திகள், வைத்திருக்க அல்லது யாருக்காவது காட்ட விரும்பும் எதற்கும் ஸ்கிரீன்ஷாட்கள் வசதியானவை. முடிந்ததும் Photos-இலிருந்து அவற்றை நீக்கலாம்.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'வரைபடங்களில் தேடு'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah உங்களுக்கு ஒரு முகவரியைக் குறுஞ்செய்தியாக அனுப்பியுள்ளார். அதை நகலெடுத்தால் மீண்டும் தட்டச்சு செய்ய வேண்டியதில்லை. <strong>செய்திகளைத் திறங்கள்.</strong>'},
        {screen: () => app(p, 'செய்திகள்', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Sarah-வின் செய்தியைத் தட்டுங்கள்.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: 'ஒரு மெனு தோன்றும் வரை <strong>முகவரி உள்ள செய்தியை அழுத்திப் பிடியுங்கள்</strong> (ஒரு விநாடி அல்லது இரண்டு விநாடிகள் உங்கள் விரலை அதன் மேல் வைத்திருங்கள்).', hint: 'ஒரு மெனு தோன்றும் வரை இரண்டாவது செய்தியின் மேல் உங்கள் விரலை அழுத்தி வைத்திருங்கள்.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>நகலெடு என்பதைத் தட்டுங்கள்.</strong> உங்கள் ஃபோன் இப்போது அந்தச் சொற்களை நினைவில் வைத்துள்ளது, வேறிடத்தில் ஒட்டத் தயார்.',
         hints: {reply: 'பதிலளி என்பது ஒரு செய்தியைத் தொடங்கும். நகலெடு என்பதைத் தட்டுங்கள்.', forward: 'முன்னனுப்பு என்பது செய்தியை வேறொருவருக்கு அனுப்பும். நகலெடு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'நகலெடுக்கப்பட்டது! இப்போது முகப்புத் திரைக்குச் செல்லுங்கள். இங்கே <strong>திரையின் கீழ் உள்ள பட்டையைத் தட்டுங்கள்</strong>.'},
        {screen: () => home(p), target: 'maps', say: 'முகவரியைக் கண்டுபிடிக்க <strong>வரைபடங்களைத் திறங்கள்</strong>.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: 'ஒரு சிறிய "ஒட்டு" பட்டன் தோன்றும் வரை <strong>தேடல் பெட்டியை அழுத்திப் பிடியுங்கள்</strong>.', hint: 'மேலே உள்ள தேடல் பெட்டியின் மேல் உங்கள் விரலை வைத்திருங்கள்.',
         hints: {'search-tap': 'விரைவாகத் தட்டினால் விசைப்பலகை திறக்கும். அதற்குப் பதிலாக, ஒட்டு தோன்றும் வரை அழுத்திப் பிடியுங்கள்.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>ஒட்டு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'தட்டச்சு செய்யாமலேயே முழு முகவரியும் தோன்றும். <strong>முடிவைத் தட்டுங்கள்.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'ஒரு நீண்ட செய்தியின் நடுவிலிருந்து ஒரு ஃபோன் எண்ணை மட்டும் நகலெடுக்க விரும்புகிறீர்கள். எப்படி?', options: [
            {t: 'அழுத்திப் பிடித்து, தேர்ந்தெடு என்பதைத் தட்டி (அல்லது சிறு கைப்பிடிகளை இழுத்து) தேவையான பகுதியை மட்டும் தேர்ந்தெடுத்து, பிறகு நகலெடு', ok: true,
             why: 'ஆம். உங்களுக்கு என்ன வேண்டுமோ அதைச் சரியாகத் தேர்ந்தெடுக்க, சிறப்பிக்கப்பட்ட சொற்களின் இருபுறமும் உள்ள கைப்பிடிகளை இழுங்கள்.'},
            {t: 'முழுச் செய்தியையும் மட்டுமே நகலெடுக்க முடியும்', why: 'அதன் ஒரு பகுதியைத் தேர்ந்தெடுக்கலாம்: அழுத்திப் பிடித்து, தேர்ந்தெடு என்பதைத் தட்டி, சிறு கைப்பிடிகளை இழுங்கள்.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>சபாஷ்!</strong> நகலெடுத்து ஒட்டுதல் கிட்டத்தட்ட எல்லா இடங்களிலும் வேலை செய்யும்: செய்திகள், மின்னஞ்சல்கள், வலைப்பக்கங்கள், படிவங்கள். நகலெடுக்க அழுத்திப் பிடியுங்கள்; ஒட்டவும் அழுத்திப் பிடியுங்கள்.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'சேமிப்பகம்'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'iPhone சேமிப்பகம்', [{caption: 'பரிந்துரைகள்'},
                ctx.offloaded ? {label: 'பயன்படுத்தாத செயலிகளை ஆஃப்லோடு செய்', value: 'இயக்கப்பட்டது ⟦check⟧'} : {id: 'offload', label: 'பயன்படுத்தாத செயலிகளை ஆஃப்லோடு செய்', sub: '2.1 GB சேமிக்கலாம். நீங்கள் பயன்படுத்தாத செயலிகளை நீக்கும், ஆனால் அவற்றின் தரவை வைத்திருக்கும்.', value: 'இயக்கு'},
                {caption: 'செயலிகள்'}, {label: 'புகைப்படங்கள்', value: '21.3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7.6 GB' : '14.8 GB'}, {label: 'Facebook', value: '2.4 GB'}, {label: 'BBC iPlayer', value: '1.9 GB'}],
            {back: 'பொது', top: bar});
        }
        return list(p, 'சேமிப்பகம்', [{label: 'புகைப்படங்கள் &amp; வீடியோக்கள்', value: '21.3 GB'}, {label: 'செயலிகள்', value: ctx.cleaned ? '18.4 GB' : '25.2 GB', sub: 'WhatsApp உட்பட'}, {label: 'ஆவணங்கள் &amp; பிற', value: '4.1 GB'},
            {label: 'சிஸ்டம்', value: '7.6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1.1 GB தேவையற்ற கோப்புகள் சுத்தம் செய்யப்பட்டன</p>' : '<button type="button" class="ce dk" data-tap="free-up">இடத்தை விடுவி</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'அமைப்புகள்', `<div class="fo">${[['account', 'கணக்கு'], ['privacy', 'தனியுரிமை'], ['chats', 'அரட்டைகள்'], ['notifications', 'அறிவிப்புகள்'], ['storage', 'சேமிப்பகமும் தரவும்'], ['help', 'உதவி']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'சேமிப்பகமும் தரவும்', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7.6 GB' : '14.8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'சேமிப்பகத்தை நிர்வகி', `<div class="iq"><span>WhatsApp ${ctx.cleaned ? '7.6' : '14.8'} GB பயன்படுத்துகிறது</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>5 MB-ஐ விடப் பெரியவை</strong><small>பார்க்க எதுவும் இல்லை</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>பலமுறை முன்னனுப்பப்பட்டவை</strong><small>112 உருப்படிகள் · 0.9 GB</small></div>
                <div class="he">அரட்டைகள்</div><div class="ck"><strong>Family</strong><small>3.1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1.8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, '5 MB-ஐ விடப் பெரியவை', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, '23 உருப்படிகளை நீக்கவா?', 'அவை WhatsApp-இலிருந்து நீக்கப்படும். உங்கள் ஃபோனின் கேலரியில் ஏற்கெனவே சேமிக்கப்பட்ட புகைப்படங்கள் அங்கேயே இருக்கும்.', [['cancel', 'ரத்துசெய்'], ['confirm-delete', 'நீக்கு']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '"சேமிப்பகம் கிட்டத்தட்ட நிரம்பிவிட்டது" என்று வருகிறதா? எது இடத்தை எடுத்துக்கொள்கிறது என்று பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>பொது என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'பொது', [{id: 'about', label: 'பற்றி'}, {id: 'update', label: 'மென்பொருள் புதுப்பிப்பு'}, {id: 'storage', label: 'iPhone சேமிப்பகம்'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN &amp; சாதன நிர்வாகம்'}], {back: 'அமைப்புகள்'}),
             target: 'storage', say: '<strong>iPhone சேமிப்பகம் என்பதைத் தட்டுங்கள்.</strong> எல்லாவற்றையும் கணக்கிட சில விநாடிகள் ஆகும்.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'வண்ணப் பட்டை எது இடத்தை எடுக்கிறது என்று காட்டுகிறது. முதலில் ஒரு விரைவான வழி: <strong>பயன்படுத்தாத செயலிகளை ஆஃப்லோடு செய்</strong> என்பது சிறிது காலமாகப் பயன்படுத்தாத செயலிகளை நீக்கும், ஆனால் அவற்றைத் திரும்ப விரும்பினால் உங்கள் தரவை வைத்திருக்கும். <strong>இயக்கு என்பதைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>சேமிப்பகத்தைத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது பேட்டரி மற்றும் சாதனப் பராமரிப்பு, பிறகு சேமிப்பகம்.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'வண்ணப் பட்டை எது இடத்தை எடுக்கிறது என்று காட்டுகிறது. <strong>இடத்தை விடுவி என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => app(p, 'கோப்புகள்', `<div class="ke"><strong>தேவையற்ற கோப்புகளை நீக்கு</strong><small>செயலிகள் உருவாக்கிய 1.1 GB தற்காலிகக் கோப்புகள்</small><button type="button" class="ce dk" data-tap="clean">சுத்தம் செய்</button></div>
                <div class="ke"><strong>பழைய ஸ்கிரீன்ஷாட்களை நீக்கு</strong><small>214 MB</small><span class="fd">தேர்ந்தெடுத்து இடத்தை விடுவி</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'தேவையற்ற கோப்புகளை நீக்குவது பாதுகாப்பானது: அவை செயலிகளுக்குத் தேவையில்லாத தற்காலிகக் கோப்புகள். <strong>சுத்தம் செய் என்பதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp 14.8 GB பயன்படுத்துகிறது. எது அதை நிரப்புகிறது?', options: [
            {t: 'மற்றவர்கள் உங்களுக்கு அனுப்பிய வீடியோக்களும் புகைப்படங்களும், குறிப்பாகக் குழுக்களில்', ok: true, why: 'ஆம். குடும்ப அல்லது குழு அரட்டையில் அனுப்பப்படும் ஒவ்வொரு வீடியோவும் உங்கள் ஃபோனில் சேமிக்கப்படும். பெரியவற்றை WhatsApp கண்டுபிடித்து நீக்கும்.'},
            {t: 'உங்கள் குறுஞ்செய்திகள்', why: 'உரை கிட்டத்தட்ட இடமே எடுப்பதில்லை. மற்றவர்கள் அனுப்பும் வீடியோக்களும் புகைப்படங்களும்தான், குறிப்பாகக் குழுக்களில்.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>WhatsApp-ஐத் திறங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'WhatsApp-இல், கீழ் வலதில் உள்ள <strong>அமைப்புகளைத்</strong> தட்டுங்கள். இங்கே அது திறந்துள்ளது. <strong>சேமிப்பகமும் தரவும் என்பதைத் தட்டுங்கள்.</strong>'
                          : 'WhatsApp-இல், மேலே உள்ள <strong>மூன்று புள்ளிகளைத் ⋮</strong> தட்டி, பிறகு <strong>அமைப்புகளைத்</strong> தட்டுங்கள். இங்கே அது திறந்துள்ளது. <strong>சேமிப்பகமும் தரவும் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>சேமிப்பகத்தை நிர்வகி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'அதிக இடத்தை மிச்சப்படுத்துபவை மேலே உள்ளன. <strong>5 MB-ஐ விடப் பெரியவை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'இவை மற்றவர்கள் உங்களுக்கு அனுப்பிய பெரிய வீடியோக்கள். ஒன்றை வைத்திருக்க விரும்பினால், முதலில் அதை உங்கள் புகைப்படங்களில் சேமியுங்கள். <strong>அனைத்தையும் தேர்ந்தெடு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>நீக்கு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'இது WhatsApp-க்குள் இருக்கும் நகல்களை மட்டுமே நீக்கும். உறுதிப்படுத்த <strong>நீக்கு என்பதைத் தட்டுங்கள்</strong>.', hints: {cancel: 'ரத்துசெய் என்றால் அவை அப்படியே இருக்கும். இந்தப் பயிற்சிக்கு நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>சபாஷ்!</strong> 7 GB-க்கு மேல் இடத்தை விடுவித்துவிட்டீர்கள். சில மாதங்களுக்கு ஒருமுறை இதைச் செய்வது நல்லது. Photos-இல் உள்ள <strong>சமீபத்தில் நீக்கப்பட்டவை</strong> என்பதையும் காலி செய்யுங்கள், ஏனெனில் நீக்கிய புகைப்படங்கள் 30 நாட்களுக்கு இன்னும் இடத்தை எடுக்கும்.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'உலகக் கடிகாரம்'], ['alarms', 'அலாரங்கள்'], ['stopwatch', 'ஸ்டாப்வாட்ச்'], ['timers', 'டைமர்கள்']]
            : [['alarms', 'அலாரம்'], ['world', 'கடிகாரம்'], ['timers', 'டைமர்'], ['stopwatch', 'ஸ்டாப்வாட்ச்']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>இன்று</small><strong>லண்டன்</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>ஆஸ்திரேலியா</small><strong>சிட்னி</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'மாத்திரைகள்')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>அலாரம்</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'உலகக் கடிகாரம்' : 'கடிகாரம்') : (p === 'ios' ? 'அலாரங்கள்' : 'அலாரம்')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'ஒருபோதுமில்லை'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'அலாரம்', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'தினமும் உங்கள் மாத்திரைகளை எடுத்துக்கொள்ள ஒரு அலாரம் நினைவூட்டும். <strong>கடிகாரம் செயலியைத் திறங்கள்.</strong>', hint: 'இது வெள்ளைக் கடிகார முகம் உள்ள கறுப்பு ஐகான்.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `${p === 'ios' ? 'bottom' : 'bottom left'} <strong>${p === 'ios' ? 'அலாரங்கள்' : 'அலாரம்'}-ஐத் தட்டுங்கள்</strong>.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: 'புதிய அலாரத்தைச் சேர்க்க <strong>+ ஐத் தட்டுங்கள்</strong>.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'உண்மையான ஃபோனில் நேரத்தை அமைக்க எண்களை உருட்டுவீர்கள். இங்கே <strong>08:00 ஐத் தட்டுங்கள்</strong>.', hints: {'t-07': 'இந்தப் பயிற்சிக்கு 08:00 ஐத் தேர்ந்தெடுங்கள்.', 't-09': 'இந்தப் பயிற்சிக்கு 08:00 ஐத் தேர்ந்தெடுங்கள்.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'இது உங்களுக்குத் தினமும் தேவை, ஒருமுறை மட்டும் அல்ல. <strong>மீண்டும் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'தினமும்'; }, say: '<strong>தினமும் என்பதைத் தட்டுங்கள்.</strong>',
         hints: {never: 'ஒருபோதுமில்லை என்றால் ஒருமுறை மட்டுமே ஒலிக்கும். தினமும் என்பதைத் தட்டுங்கள்.', weekdays: 'வார நாட்கள் என்றால் வார இறுதியைத் தவிர்க்கும். தினமும் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'முதலில் லேபிள் பெட்டியில் மாத்திரைகள் போல ஒரு லேபிளைத் தட்டச்சு செய்யுங்கள்.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'அலாரம் எதற்காக என்று லேபிள் சொல்லும். <strong>லேபிள் பெட்டியைத் தட்டி மாத்திரைகள் எனத் தட்டச்சு செய்யுங்கள்</strong>, பிறகு <strong>சேமி என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'அலாரம் 8 மணிக்கு ஒலிக்கிறது. நீங்கள் மாத்திரைகளை எடுத்துக்கொள்கிறீர்கள். எந்தப் பட்டனை அழுத்துவீர்கள்?', options: [
            {t: 'நிறுத்து', ok: true, why: 'ஆம். நிறுத்து என்பது நாளை 8 மணி வரை அதை அணைக்கும், ஏனெனில் அது தினமும் மீண்டும் வரும்.'},
            {t: 'உறக்கநிலை', why: 'உறக்கநிலை என்பது சுமார் 9 நிமிடங்களில் மீண்டும் ஒலிக்கச் செய்யும். சிறிது நேரம் வேண்டுமென்றால் அதைப் பயன்படுத்துங்கள், ஆனால் நிறுத்து என்பது நாளை வரை அணைக்கும்.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் மாத்திரை அலாரம் ஒவ்வொரு காலையும் 8 மணிக்கு ஒலிக்கும். ' + (p === 'ios' ? '<strong>உடல்நலம்</strong> செயலியிலும் மருந்துகள் பகுதி உள்ளது; அது உங்களுக்கு நினைவூட்டி, பதிவையும் வைத்திருக்கும்.' : 'Google-இடமும் கேட்கலாம்: "தினமும் 8 மணிக்கு மாத்திரை எடுக்க எனக்கு நினைவூட்டு".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'உங்கள் ஃபோன் தொலைந்தாலோ உடைந்தாலோ, உங்கள் புகைப்படங்கள் பாதுகாப்பாக இருக்குமா? பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: 'மேலே <strong>உங்கள் பெயரைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'தனிப்பட்ட தகவல்'}, {id: 'security', label: 'உள்நுழைவு &amp; பாதுகாப்பு'}, {id: 'payment', label: 'பணம் செலுத்தல் &amp; டெலிவரி'}, {id: 'subscriptions', label: 'சந்தாக்கள்'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4.2 GB'}, {id: 'family', label: 'குடும்பப் பகிர்வு'}, {id: 'findmy', label: 'Find My'}], {back: 'அமைப்புகள்'}),
         target: 'icloud', say: '<strong>iCloud-ஐத் தட்டுங்கள்.</strong> iCloud என்பது Apple-இன் ஆன்லைன் சேமிப்பகம்.'},
        {screen: c => list(p, 'iCloud', [{caption: 'சேமிப்பகம்: 5 GB-இல் 4.2 GB பயன்படுத்தப்பட்டது'}, {caption: 'iCloud-இல் சேமிக்கப்பட்டவை'}, {id: 'photos', label: 'புகைப்படங்கள்', value: c.photoSync ? 'ஆன்' : 'ஆஃப்'}, {id: 'backup', label: 'iCloud காப்புப்பிரதி', value: c.backedUp ? 'ஆன்' : 'ஆஃப்'},
            {label: 'தொடர்புகள்', value: 'ஆன்'}, {label: 'குறிப்புகள்', value: 'ஆன்'}], {back: 'Apple Account'}),
         target: 'photos', say: 'புகைப்படங்களும் காப்புப்பிரதியும் இரண்டுமே <strong>ஆஃப்</strong> என்று உள்ளன. அதாவது, ஃபோன் தொலைந்தால் புகைப்படங்களும் தொலைந்துவிடும். <strong>புகைப்படங்களைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'புகைப்படங்கள்', [{id: 'sync', label: 'இந்த iPhone-ஐ ஒத்திசை', toggle: !!c.photoSync, sub: 'உங்கள் புகைப்படங்களையும் வீடியோக்களையும் iCloud-இல் வைத்திருக்கும்; அதனால் ஃபோனை இழந்தாலும் அவை பாதுகாப்பாக இருக்கும்.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: 'இயக்க <strong>இந்த iPhone-ஐ ஒத்திசை என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'புகைப்படங்கள்', [{label: 'இந்த iPhone-ஐ ஒத்திசை', toggle: true}], {back: 'iCloud'}), target: 'back', say: 'பின்செல்ல <strong>‹ iCloud என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'iCloud', [{caption: 'சேமிப்பகம்: 5 GB-இல் 4.2 GB பயன்படுத்தப்பட்டது'}, {caption: 'iCloud-இல் சேமிக்கப்பட்டவை'}, {id: 'photos', label: 'புகைப்படங்கள்', value: 'ஆன்'}, {id: 'backup', label: 'iCloud காப்புப்பிரதி', value: 'ஆஃப்'}], {back: 'Apple Account'}),
         target: 'backup', say: 'இப்போது மற்ற எல்லாவற்றையும் காப்புப்பிரதி எடுங்கள்: அமைப்புகள், செய்திகள், செயலிகள். <strong>iCloud காப்புப்பிரதி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'காப்புப்பிரதி', [{id: 'backup-toggle', label: 'இந்த iPhone-ஐக் காப்புப்பிரதி எடு', toggle: !!c.backedUp, sub: 'உங்கள் iPhone சார்ஜ் ஆகும்போது, பூட்டியிருக்கும்போது, Wi-Fi-இல் இருக்கும்போது தினமும் இரவு தானாகக் காப்புப்பிரதி எடுக்கும்.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: 'இயக்க <strong>இந்த iPhone-ஐக் காப்புப்பிரதி எடு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => list('ios', 'காப்புப்பிரதி', [{label: 'இந்த iPhone-ஐக் காப்புப்பிரதி எடு', toggle: true}, {id: 'backup-now', label: 'இப்போது காப்புப்பிரதி எடு', sub: 'கடைசி வெற்றிகரமான காப்புப்பிரதி: இல்லை'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'இனி தினமும் இரவு காப்புப்பிரதி எடுக்கும். முதலாவதை இப்போதே செய்யுங்கள்: <strong>இப்போது காப்புப்பிரதி எடு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list('ios', 'காப்புப்பிரதி', [{label: 'இந்த iPhone-ஐக் காப்புப்பிரதி எடு', toggle: true}, {label: c.busy ? 'காப்புப்பிரதி எடுக்கிறது…' : 'இப்போது காப்புப்பிரதி எடு', sub: c.busy ? 'சுமார் 5 நிமிடங்கள் மீதம்' : 'கடைசி வெற்றிகரமான காப்புப்பிரதி: இப்போதுதான் ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'ஒரு குறுஞ்செய்தி "உங்கள் iCloud சேமிப்பகம் நிரம்பிவிட்டது. உங்கள் புகைப்படங்கள் இன்று நீக்கப்படும். 99p இங்கே செலுத்துங்கள்: [link]" என்று கூறுகிறது. நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'இணைப்பைப் புறக்கணிப்பேன். அமைப்புகள் > உங்கள் பெயர் > iCloud என்பதில் பார்த்து, குறுஞ்செய்தியை 7726-க்கு முன்னனுப்புவேன்', ok: true, why: 'ஆம். இது ஒரு பொதுவான மோசடி. Apple இணைப்புகளைக் குறுஞ்செய்தியாக அனுப்பாது, உங்கள் புகைப்படங்களை இப்படி நீக்கவும் செய்யாது. உங்கள் உண்மையான சேமிப்பகத்தை அமைப்புகளில் பாருங்கள்.'},
            {t: 'புகைப்படங்களைக் காக்க விரைவாகச் செலுத்துவேன்', why: 'இது உங்கள் கார்டு விவரங்களைப் பெறுவதற்கான மோசடி. உங்கள் உண்மையான சேமிப்பகத்தை அமைப்புகள் > உங்கள் பெயர் > iCloud என்பதில் பாருங்கள், குறுஞ்செய்தியை 7726-க்கு முன்னனுப்புங்கள்.'}]}},
        {screen: () => list('ios', 'காப்புப்பிரதி', [{label: 'இந்த iPhone-ஐக் காப்புப்பிரதி எடு', toggle: true}, {label: 'இப்போது காப்புப்பிரதி எடு', sub: 'கடைசி வெற்றிகரமான காப்புப்பிரதி: இப்போதுதான் ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் புகைப்படங்களும் ஃபோனும் காப்புப்பிரதி எடுக்கப்பட்டன. இலவச 5 GB புகைப்படங்களால் விரைவாக நிரம்பிவிடும்; நிரம்பினால், கூடுதல் இடத்துக்கு (iCloud+) சிறிய மாதக் கட்டணம் உண்டு, அதை அமைப்புகளில் மட்டுமே வாங்குங்கள், குறுஞ்செய்தி மூலம் ஒருபோதும் வாங்காதீர்கள்.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'உங்கள் ஃபோன் தொலைந்தாலோ உடைந்தாலோ, உங்கள் புகைப்படங்கள் பாதுகாப்பாக இருக்குமா? பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google-ஐத் தட்டுங்கள்.</strong> அது கீழ்ப்பகுதிக்கு அருகில் உள்ளது.', hint: 'பட்டியலில் கீழே உருட்டுங்கள்: Google கீழ்ப்பகுதிக்கு அருகில் உள்ளது.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'உங்கள் Google கணக்கை நிர்வகியுங்கள்', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'காப்புப்பிரதி', sub: 'ஆஃப்'}, {id: 'autofill', label: 'தானாக நிரப்புதல்'}, {id: 'devices', label: 'சாதனங்கள் &amp; பகிர்வு'}]),
         target: 'backup', say: 'காப்புப்பிரதி <strong>ஆஃப்</strong> என்று உள்ளது. <strong>காப்புப்பிரதியைத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது அமைப்புகள் > கணக்குகளும் காப்புப்பிரதியும்.</em>'},
        {screen: c => list(p, 'காப்புப்பிரதி', [{id: 'backup-toggle', label: 'Google One மூலம் காப்புப்பிரதி', toggle: !!c.backedUp, sub: 'செயலிகள், செய்திகள், அழைப்பு வரலாறு, தொடர்புகள், அமைப்புகளைக் காப்புப்பிரதி எடுக்கும்.'},
            {id: 'photos-backup', label: 'புகைப்படங்கள் &amp; வீடியோக்கள்', sub: c.photoSync ? 'ஆன் · Google Photos' : 'ஆஃப் · Google Photos'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: 'இயக்க <strong>Google One மூலம் காப்புப்பிரதி என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'காப்புப்பிரதி', [{label: 'Google One மூலம் காப்புப்பிரதி', toggle: true}, {id: 'photos-backup', label: 'புகைப்படங்கள் &amp; வீடியோக்கள்', sub: 'ஆஃப் · Google Photos'}]),
         target: 'photos-backup', say: 'புகைப்படங்கள் தனியாக உள்ளன. <strong>புகைப்படங்கள் &amp; வீடியோக்கள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'காப்புப்பிரதி', [{id: 'photos-toggle', label: 'புகைப்படங்களையும் வீடியோக்களையும் காப்புப்பிரதி எடு', toggle: !!c.photoSync, sub: 'அவற்றை Google Photos-இல் சேமிக்கும்; அதனால் ஃபோனை இழந்தாலும் அவை பாதுகாப்பாக இருக்கும்.'},
            {label: 'காப்புப்பிரதித் தரம்', value: 'சேமிப்பக மிச்சப்படுத்தி'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: 'இயக்க <strong>புகைப்படங்களையும் வீடியோக்களையும் காப்புப்பிரதி எடு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'காப்புப்பிரதி', [{label: 'புகைப்படங்களையும் வீடியோக்களையும் காப்புப்பிரதி எடு', toggle: true}, {id: 'backup-now', label: 'இப்போது காப்புப்பிரதி எடு', sub: 'கடைசிக் காப்புப்பிரதி: இல்லை'}]),
         target: 'backup-now', say: 'இனி Wi-Fi-இல் அது தானாகவே காப்புப்பிரதி எடுக்கும். முதலாவதை இப்போதே செய்யுங்கள்: <strong>இப்போது காப்புப்பிரதி எடு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'காப்புப்பிரதி', [{label: 'புகைப்படங்களையும் வீடியோக்களையும் காப்புப்பிரதி எடு', toggle: true}, {label: c.busy ? 'காப்புப்பிரதி எடுக்கிறது…' : 'இப்போது காப்புப்பிரதி எடு', sub: c.busy ? '1,204 items left' : 'கடைசிக் காப்புப்பிரதி: இப்போதுதான் ⟦check⟧'}]), wait: 1500,
         question: {q: 'ஒரு குறுஞ்செய்தி "உங்கள் Google சேமிப்பகம் நிரம்பிவிட்டது. உங்கள் புகைப்படங்கள் இன்று நீக்கப்படும். 99p இங்கே செலுத்துங்கள்: [link]" என்று கூறுகிறது. நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'இணைப்பைப் புறக்கணிப்பேன். அமைப்புகள் > Google > காப்புப்பிரதி என்பதில் பார்த்து, குறுஞ்செய்தியை 7726-க்கு முன்னனுப்புவேன்', ok: true, why: 'ஆம். இது ஒரு பொதுவான மோசடி. Google இது போன்ற இணைப்புகளைக் குறுஞ்செய்தியாக அனுப்பாது. உங்கள் உண்மையான சேமிப்பகத்தை அமைப்புகளில் பாருங்கள்.'},
            {t: 'புகைப்படங்களைக் காக்க விரைவாகச் செலுத்துவேன்', why: 'இது உங்கள் கார்டு விவரங்களைப் பெறுவதற்கான மோசடி. உங்கள் உண்மையான சேமிப்பகத்தை அமைப்புகளில் பார்த்து, குறுஞ்செய்தியை 7726-க்கு முன்னனுப்புங்கள்.'}]}},
        {screen: () => list(p, 'காப்புப்பிரதி', [{label: 'புகைப்படங்களையும் வீடியோக்களையும் காப்புப்பிரதி எடு', toggle: true}, {label: 'இப்போது காப்புப்பிரதி எடு', sub: 'கடைசிக் காப்புப்பிரதி: இப்போதுதான் ⟦check⟧'}]), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் புகைப்படங்களும் ஃபோனும் காப்புப்பிரதி எடுக்கப்பட்டன. Google உங்களுக்கு 15 GB இலவசமாகத் தருகிறது; நிரம்பினால், கூடுதல் இடத்துக்கு சிறிய மாதக் கட்டணம் உண்டு, அதை அமைப்புகளிலோ Google One செயலியிலோ மட்டுமே வாங்குங்கள், குறுஞ்செய்தி மூலம் ஒருபோதும் வாங்காதீர்கள்.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 வாழ்த்துகள்! 🎉</strong><p>£500 ஷாப்பிங் வவுச்சரை வெல்ல நீங்கள் தேர்ந்தெடுக்கப்பட்டுள்ளீர்கள்!</p>
        <button type="button" class="aeb" data-tap="claim">இப்போதே பெறுங்கள்</button><small>விளம்பரம்</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'செயலி தகவல்', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>System Service</strong><small>பதிப்பு 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">திற</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">நிறுவல்நீக்கு</button>
            <button type="button" data-tap="force-stop">வலுக்கட்டாயமாக நிறுத்து</button></div>
            <div class="cj ex"><span class="hf"><strong>பேட்டரி</strong><small>கடைசி முழு சார்ஜுக்குப் பிறகு 38% பயன்பாடு</small></span></div>
            <div class="cj ex"><span class="hf"><strong>அனுமதிகள்</strong><small>பிற செயலிகளுக்கு மேல் காட்டு, சாதன நிர்வாகி</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'System Service', 'இந்த செயலியை நிறுவல்நீக்க விரும்புகிறீர்களா?', [['cancel', 'ரத்துசெய்'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>நாள்காட்டி · இப்போது</strong>
            <span>⚠️ உங்கள் iPhone பாதிக்கப்பட்டிருக்கலாம்! இப்போதே சுத்தம் செய்ய இங்கே தட்டுங்கள்.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'எந்த செயலியும் திறக்கப்படாத போதும் உங்கள் முகப்புத் திரையில் விளம்பரங்கள் தோன்றுகின்றன. பொதுவாக ஏதோ ஒரு தீங்கான செயலி உள்ளே நுழைந்துவிட்டது என்று அர்த்தம். முதலில், <strong>விளம்பரத்தைத் தட்டாதீர்கள். அதை மூட சிறிய ⟦x⟧ ஐத் தட்டுங்கள்.</strong>',
         hints: {claim: 'விளம்பரத்தையே தட்டாதீர்கள். மூலையில் உள்ள சிறிய ⟦x⟧ ஐத் தேடுங்கள்.'}, hint: '⟦x⟧ சிறியது, விளம்பரத்தின் மேல் வலது மூலையில் இருக்கும்.'},
        {screen: () => home(p), target: 'settings', say: 'தீங்கான செயலிகள் எப்போதும் இயங்கும், அதனால் நிறைய பேட்டரியைப் பயன்படுத்தும். அவற்றைக் கண்டுபிடிக்கும் வழி இதுவே. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>பேட்டரியைத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது பேட்டரி மற்றும் சாதனப் பராமரிப்பு, பிறகு பேட்டரி.</em>'},
        {screen: () => list(p, 'பேட்டரி', [{id: 'usage', label: 'பேட்டரி பயன்பாடு', sub: 'கடைசி முழு சார்ஜுக்குப் பிறகான பயன்பாட்டைப் பார்'}, {label: 'பேட்டரி சேமிப்பான்', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>பேட்டரி பயன்பாட்டைத் தட்டுங்கள்.</strong> <em>சில Samsung-களில் வரைபடத்தையோ விவரங்களைப் பார் என்பதையோ தட்டுங்கள்.</em>'},
        {screen: () => list(p, 'பேட்டரி பயன்பாடு', [], {top: `<div class="nl">${[['System Service', 38], ['திரை', 21], ['WhatsApp', 12], ['YouTube', 8], ['கேமரா', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'இவற்றில் எது பொருத்தமில்லாமல் தெரிகிறது?', options: [
            {t: 'System Service: நீங்கள் ஒருபோதும் பயன்படுத்தியதில்லை, ஆனால் அது அதிக பேட்டரியைப் பயன்படுத்துகிறது', ok: true, why: 'ஆம். தீங்கான செயலிகள் உங்கள் கவனத்துக்கு வராமலிருக்க "System Service" அல்லது "Keyboard Settings" போன்ற மந்தமான பெயர்களை வைத்துக்கொள்ளும். அதன் பெயரைக் குறித்துக்கொள்ளுங்கள்.'},
            {t: 'திரை', why: 'திரை எப்போதும் நிறைய பேட்டரியைப் பயன்படுத்தும்; அது இயல்பானது. பொருந்தாதது, நீங்கள் ஒருபோதும் பயன்படுத்தாத "System Service".'},
            {t: 'WhatsApp', why: 'WhatsApp நீங்கள் பயன்படுத்தும் செயலி, எனவே அது இயல்பானது. பொருந்தாதது "System Service".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'இப்போது உங்கள் செயலிகளில் அதைக் கண்டுபிடிப்போம். அமைப்புகளுக்குத் திரும்பி, <strong>செயலிகளைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'செயலிகள்', [{caption: 'சமீபத்தில் திறந்த செயலிகள்'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: '46 செயலிகளையும் பார்'}, {id: 'default-apps', label: 'இயல்புநிலை செயலிகள்'}]),
         target: 'all-apps', say: '<strong>அனைத்து செயலிகளையும் பார் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'அனைத்து செயலிகள்', ['கால்குலேட்டர்', 'நாள்காட்டி', 'கேமரா', 'Chrome', 'கடிகாரம்', 'தொடர்புகள்', 'Gmail', 'வரைபடங்கள்'].map(n => ({label: n})).concat([{id: 'system-service', label: 'System Service'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'பட்டியல் அகர வரிசையில் உள்ளது. <strong>System Service-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: '<strong>நிறுவல்நீக்கு</strong> பட்டன் சாம்பல் நிறத்தில் உள்ளது. தீங்கான செயலிகள் உங்களைத் தங்களை நீக்கவிடாமல் தடுக்க இப்படிச் செய்கின்றன. முதலில் அதன் இயக்கத்தை நிறுத்த <strong>வலுக்கட்டாயமாக நிறுத்து என்பதைத் தட்டுங்கள்</strong>.',
         hints: {uninstall: 'அது சாம்பல் நிறத்தில் உள்ளது, எனவே இன்னும் வேலை செய்யாது. முதலில் வலுக்கட்டாயமாக நிறுத்து என்பதைத் தட்டுங்கள்.', open: 'அதைத் திறக்காதீர்கள். வலுக்கட்டாயமாக நிறுத்து என்பதைத் தட்டுங்கள்.'}},
        {screen: () => list(p, 'அமைப்புகளைத் தேடு', [{caption: '"சாதன நிர்வாகி" க்கான முடிவுகள்'}, {id: 'device-admin', label: 'சாதன நிர்வாக செயலிகள்', sub: 'பாதுகாப்பு &amp; தனியுரிமை > கூடுதல் பாதுகாப்பு அமைப்புகள்'}]),
         target: 'device-admin',
         say: 'இப்போது அதன் சிறப்பு அனுமதியை நீக்குங்கள். அமைப்புகளில், மேலே உள்ள தேடல் பெட்டியைப் பயன்படுத்தி <strong>"சாதன நிர்வாகி" எனத் தேடுங்கள்</strong>. இதோ முடிவு: <strong>சாதன நிர்வாக செயலிகளைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'சாதன நிர்வாக செயலிகள்', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'System Service', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'இந்த சாதன நிர்வாக செயலியைச் செயலிழக்கச் செய்யவா?', 'System Service இனி தன்னை நிறுவல்நீக்க விடாமல் உங்களைத் தடுக்க முடியாது.', [['cancel', 'ரத்துசெய்'], ['deactivate', 'செயலிழக்கச் செய்']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device என்பது Google-உடையது, அது சரிதான். <strong>System Service அருகில் உள்ள சுவிட்சைத் தட்டுங்கள்.</strong>', hints: {'find-my': 'Find My Device-ஐ இயக்கத்திலேயே விடுங்கள். System Service-ஐத் தட்டுங்கள்.'}},
        {screen: c => list(p, 'சாதன நிர்வாக செயலிகள்', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'System Service', toggle: true}],
            {overlay: dialog(p, 'இந்த சாதன நிர்வாக செயலியைச் செயலிழக்கச் செய்யவா?', 'System Service இனி தன்னை நிறுவல்நீக்க விடாமல் உங்களைத் தடுக்க முடியாது.', [['cancel', 'ரத்துசெய்'], ['deactivate', 'செயலிழக்கச் செய்']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>செயலிழக்கச் செய் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'System Service-க்குத் திரும்பியதும், <strong>நிறுவல்நீக்கு</strong> இப்போது வேலை செய்கிறது. <strong>நிறுவல்நீக்கு என்பதைத் தட்டுங்கள்.</strong>', hints: {'force-stop': 'அது ஏற்கெனவே நிறுத்தப்பட்டுவிட்டது. நிறுவல்நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>OK-ஐத் தட்டுங்கள்.</strong>'},
        {screen: () => home(p), target: 'store', say: 'போய்விட்டது! கடைசியாக, வேறு எதுவும் இருக்கிறதா என்று Google-ஐச் சரிபார்க்கச் சொல்லுங்கள். <strong>Play Store-ஐத் திறங்கள்.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'தீங்கான செயலிகள் எதுவும் இல்லை' : 'உங்கள் ஃபோனை ஸ்கேன் செய்'}</strong>
            <small>${c.scanned ? 'இப்போதுதான் சரிபார்க்கப்பட்டது' : 'கடைசி ஸ்கேன்: 3 வாரங்களுக்கு முன்'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'Play Store-இல், மேல் வலதில் உள்ள உங்கள் <strong>சுயவிவரப் படத்தைத்</strong> தட்டி, பிறகு <strong>Play Protect-ஐத்</strong> தட்டுங்கள். இங்கே அது திறந்துள்ளது. <strong>ஸ்கேன் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>தீங்கான செயலிகள் எதுவும் இல்லை</strong><small>இப்போதுதான் சரிபார்க்கப்பட்டது</small></div>', {color: '#fff'}), done: true,
         say: '<strong>சபாஷ்!</strong> பேட்டரி பயன்பாட்டை வைத்துத் தீங்கான செயலியைக் கண்டுபிடித்து, அதன் சிறப்பு அனுமதியை நீக்கி, நிறுவல்நீக்கி, உங்கள் ஃபோனைச் சரிபார்த்துவிட்டீர்கள். அவற்றைத் தவிர்க்க: Play Store-இலிருந்து மட்டுமே செயலிகளை நிறுவுங்கள், இலவச டார்ச், "கிளீனர்", "பூஸ்டர்" செயலிகள் விஷயத்தில் எச்சரிக்கையாக இருங்கள்.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'உங்கள் நாள்காட்டியிலிருந்து ஒரு அறிவிப்பு "உங்கள் iPhone பாதிக்கப்பட்டிருக்கலாம்! இப்போதே சுத்தம் செய்ய இங்கே தட்டுங்கள்." என்று கூறுகிறது. இது என்ன?', options: [
            {t: 'உங்கள் நாள்காட்டிக்குள் நுழைந்த ஸ்பேம். அதைத் தட்டாதீர்கள்', ok: true, why: 'ஆம். சந்தேகத்துக்குரிய இணையதளத்தில் "Allow" என்பதைத் தட்டினால், உங்கள் iPhone-இல் ஸ்பேம் நாள்காட்டி சேர்க்கப்படலாம். அதன் "நிகழ்வுகள்" எச்சரிக்கைகள் போலத் தெரியும் விளம்பரங்கள். உங்கள் iPhone நன்றாகவே உள்ளது.'},
            {t: 'Apple-இடமிருந்து உண்மையான எச்சரிக்கை', why: 'Apple வைரஸ் எச்சரிக்கைகளை உங்கள் நாள்காட்டி வழியாக அனுப்பாது. இது குழுசேர்ந்த நாள்காட்டியிலிருந்து வரும் ஸ்பேம். அதைத் தட்டாதீர்கள்.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'ஸ்பேம் நாள்காட்டியை நீக்குவோம். அறிவிப்பை அல்ல, <strong>அமைப்புகளைத் தட்டுங்கள்</strong>.', hints: {notif: 'எச்சரிக்கையைத் தட்டாதீர்கள். அமைப்புகளைத் தட்டுங்கள்.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'கீழே உருட்டி <strong>செயலிகளைத் தட்டுங்கள்</strong>.', hint: 'செயலிகள் கடைசிக் குழுவில் உள்ளது.'},
        {screen: () => list(p, 'செயலிகள்', ['App Store', 'புத்தகங்கள்'].map(n => ({label: n})).concat([{id: 'calendar', label: 'நாள்காட்டி'}, {label: 'கேமரா'}, {label: 'தொடர்புகள்'}, {label: 'மெயில்'}]), {back: 'அமைப்புகள்'}),
         target: 'calendar', say: '<strong>நாள்காட்டியைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'நாள்காட்டி', [{id: 'accounts', label: 'நாள்காட்டிக் கணக்குகள்', value: '2'}, {label: 'நேர மண்டல மேலெழுதல்', value: 'ஆஃப்'}, {label: 'இயல்புநிலை எச்சரிக்கை நேரங்கள்'}], {back: 'செயலிகள்'}),
         target: 'accounts', say: '<strong>நாள்காட்டிக் கணக்குகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'நாள்காட்டிக் கணக்குகள்', [{caption: 'கணக்குகள்'}, {label: 'iCloud', sub: 'நாள்காட்டிகள், தொடர்புகள் மற்றும் 7'}, {id: 'subscribed', label: 'குழுசேர்ந்த நாள்காட்டிகள்', value: '1'}], {back: 'நாள்காட்டி'}),
         target: 'subscribed', say: 'iCloud உங்களுடையதே. <strong>குழுசேர்ந்த நாள்காட்டிகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'குழுசேர்ந்த நாள்காட்டிகள்', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'குழுசேர்ந்தது'}], {back: 'நாள்காட்டிக் கணக்குகள்'}),
         target: 'spam-cal', say: 'இதோ: நீங்கள் சேர்க்க நினைக்காத ஒரு நாள்காட்டி. <strong>Phone-Security-Alerts-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'சர்வர்', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'கணக்கை நீக்கு', danger: true}],
            {back: 'பின்', overlay: c.askDelete ? dialog(p, 'உறுதியாக இருக்கிறீர்களா?', 'இது நாள்காட்டியையும் அதன் நிகழ்வுகளையும் உங்கள் iPhone-இலிருந்து நீக்கும்.', [['cancel', 'ரத்துசெய்'], ['confirm-delete', 'கணக்கை நீக்கு']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>கணக்கை நீக்கு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'சர்வர்', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'கணக்கை நீக்கு', danger: true}],
            {back: 'பின்', overlay: dialog(p, 'உறுதியாக இருக்கிறீர்களா?', 'இது நாள்காட்டியையும் அதன் நிகழ்வுகளையும் உங்கள் iPhone-இலிருந்து நீக்கும்.', [['cancel', 'ரத்துசெய்'], ['confirm-delete', 'கணக்கை நீக்கு']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: 'உறுதிப்படுத்த <strong>கணக்கை நீக்கு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'போய்விட்டது. இன்னும் ஒரு சோதனை: சந்தேகத்துக்குரிய இணையதளங்கள் ஒரு "சுயவிவரத்தையும்" நிறுவலாம். <strong>பொது என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'பொது', [{id: 'about', label: 'பற்றி'}, {id: 'update', label: 'மென்பொருள் புதுப்பிப்பு'}, {id: 'storage', label: 'iPhone சேமிப்பகம்'}, {id: 'vpn', label: 'VPN &amp; சாதன நிர்வாகம்'}], {back: 'அமைப்புகள்'}),
         target: 'vpn', say: '<strong>VPN &amp; சாதன நிர்வாகம் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'VPN &amp; சாதன நிர்வாகம்', c.profileGone ? [{label: 'VPN', value: 'இணைக்கப்படவில்லை'}] : [{label: 'VPN', value: 'இணைக்கப்படவில்லை'}, {caption: 'உள்ளமைவு சுயவிவரம்'}, {id: 'profile', label: 'Free Phone Booster', sub: 'சரிபார்க்கப்படாதது'}], {back: 'பொது'}),
         target: 'profile', say: 'இங்கே உங்களுக்குத் தெரியாத ஒரு சுயவிவரம் இருந்தால் (உங்கள் வேலை அல்லது பள்ளியிலிருந்து வந்தது சரிதான்), அதை அகற்றுங்கள். <strong>Free Phone Booster-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'சுயவிவரம்', [{label: 'Free Phone Booster', sub: 'சரிபார்க்கப்படாதது · உள்ளடக்கம்: Web Clips, சான்றிதழ்கள்'}, {caption: ' '}, {id: 'remove-profile', label: 'சுயவிவரத்தை அகற்று', danger: true}],
            {back: 'பின்', overlay: c.askRemove ? dialog(p, 'சுயவிவரத்தை அகற்று', 'இந்தச் சுயவிவரத்தை அகற்றினால் அதன் எல்லா அமைப்புகளும் நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-remove', 'அகற்று']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>சுயவிவரத்தை அகற்று என்பதைத் தட்டுங்கள்</strong>. உங்கள் iPhone கடவுக்குறியீட்டைக் கேட்கும்.'},
        {screen: c => list(p, 'சுயவிவரம்', [{label: 'Free Phone Booster', sub: 'சரிபார்க்கப்படாதது'}, {caption: ' '}, {label: 'சுயவிவரத்தை அகற்று', danger: true}],
            {back: 'பின்', overlay: dialog(p, 'சுயவிவரத்தை அகற்று', 'இந்தச் சுயவிவரத்தை அகற்றினால் அதன் எல்லா அமைப்புகளும் நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-remove', 'அகற்று']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>அகற்று என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>சபாஷ்!</strong> போலி எச்சரிக்கைகள் போய்விட்டன. இது மீண்டும் நடக்காமலிருக்க: இணையதளங்களில் நாள்காட்டி அல்லது சுயவிவரத்தைச் சேர்க்கக் கேட்கும் எந்தப் பாப்-அப்பிலும் <strong>அனுமதிக்காதே</strong> அல்லது <strong>மூடு</strong> என்பதைத் தட்டுங்கள்; App Store-இலிருந்து மட்டுமே செயலிகளை நிறுவுங்கள்.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'ரத்துசெய்யப்பட்டது · 22 அக்டோபரில் முடிகிறது'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: 'வாரத்துக்கு £4.99 · 22 அக்டோபரில் புதுப்பிக்கப்படும்'};
        return list(p, 'சந்தாக்கள்', [{caption: p === 'ios' ? 'செயலில்' : 'செயலில்'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? 'மாதத்துக்கு £0.99' : 'மாதத்துக்கு £1.59'},
            {caption: p === 'ios' ? 'செயலில் இல்லை' : 'காலாவதியானது'}, {label: 'Crossword Daily', sub: '3 மார்ச்சில் காலாவதியானது'}], {back: p === 'ios' ? 'Apple Account' : 'பின்'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'உங்கள் சந்தா' : 'திட்டம்'}, {label: 'வாராந்திரம்', sub: 'வாரத்துக்கு £4.99. 3 நாள் இலவச சோதனையாகத் தொடங்கியது.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'சந்தாவை ரத்துசெய்' : 'சந்தாவை ரத்துசெய்', danger: true}],
            {back: 'சந்தாக்கள்', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'ரத்துசெய்வதை உறுதிப்படுத்து' : 'சந்தாவை ரத்துசெய்யவா?', '22 அக்டோபர் வரை இதைத் தொடர்ந்து பயன்படுத்தலாம். மீண்டும் கட்டணம் வசூலிக்கப்படாது.', [['keep', p === 'ios' ? 'இப்போது வேண்டாம்' : 'வைத்திரு']].concat([['confirm-cancel', p === 'ios' ? 'உறுதிப்படுத்து' : 'சந்தாவை ரத்துசெய்']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'இலவசச் சோதனைகள் நீங்கள் கவனிக்காமலேயே கட்டணத் திட்டங்களாக மாறிவிடுவது பெரும்பாலும் நடக்கும். சரிபார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: 'மேலே <strong>உங்கள் பெயரைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'தனிப்பட்ட தகவல்'}, {id: 'security', label: 'உள்நுழைவு &amp; பாதுகாப்பு'}, {id: 'payment', label: 'பணம் செலுத்தல் &amp; டெலிவரி'}, {id: 'subscriptions', label: 'சந்தாக்கள்'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'அமைப்புகள்'}),
             target: 'subscriptions', say: '<strong>சந்தாக்களைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'இலவசச் சோதனைகள் நீங்கள் கவனிக்காமலேயே கட்டணத் திட்டங்களாக மாறிவிடுவது பெரும்பாலும் நடக்கும். சரிபார்ப்போம். <strong>Play Store-ஐத் திறங்கள்.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>உங்களுக்குப் பரிந்துரைக்கப்பட்டவை</span><strong>தொடங்க உதவும் செயலிகள்</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: 'மேல் வலதில் உள்ள வட்ட எழுத்தான <strong>உங்கள் சுயவிவரப் படத்தைத் தட்டுங்கள்</strong>.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>கட்டணங்கள் &amp; சந்தாக்கள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'கட்டணங்கள் &amp; சந்தாக்கள்', [{id: 'methods', label: 'கட்டண முறைகள்'}, {id: 'subscriptions', label: 'சந்தாக்கள்', sub: 'உங்கள் சந்தாக்களை நிர்வகியுங்கள்'}, {id: 'budget', label: 'பட்ஜெட் &amp; வரலாறு'}]),
             target: 'subscriptions', say: '<strong>சந்தாக்களைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '"Photo Editor Pro" இலவசச் சோதனையாகத் தொடங்கி, இப்போது <strong>ஒவ்வொரு வாரமும் £4.99</strong> ஆகிவிட்டது. அது ஆண்டுக்கு £250-க்கு மேல்! <strong>அதைத் தட்டுங்கள்.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'சந்தாவை ரத்துசெய்' : 'சந்தாவை ரத்துசெய்'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'உறுதிப்படுத்து' : 'சந்தாவை ரத்துசெய்'}.</strong>`, hints: {keep: 'அது தொடர்ந்து பணம் செலுத்தச் செய்யும். இதைத் தட்டுங்கள்: ' + (p === 'ios' ? 'உறுதிப்படுத்து' : 'சந்தாவை ரத்துசெய்') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'உங்கள் ஃபோனிலிருந்து Photo Editor செயலியை நீக்குகிறீர்கள். அது பணம் செலுத்துவதை நிறுத்துமா?', options: [
            {t: 'இல்லை. இப்போது செய்தது போலச் சந்தாவை ரத்துசெய்ய வேண்டும்', ok: true, why: 'சரியே. செயலியை நீக்குவது சந்தாவை ரத்துசெய்யாது. இங்கே ரத்துசெய்யும் வரை நீங்கள் பணம் செலுத்திக்கொண்டே இருப்பீர்கள்.'},
            {t: 'ஆம், செயலியை நீக்கினால் அது நின்றுவிடும்', why: 'நிற்காது! இங்கே சந்தாவையே ரத்துசெய்யும் வரை நீங்கள் பணம் செலுத்திக்கொண்டே இருப்பீர்கள்.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>சபாஷ்!</strong> வாரத்துக்கு £4.99 மிச்சப்படுத்திவிட்டீர்கள். குறிப்பு: இலவசச் சோதனை தொடங்கும்போது, அது முடிவதற்கு முந்தைய நாளுக்கு ஓர் அலாரம் வையுங்கள். உங்கள் வங்கி செயலியில் உள்ள வழக்கமான கட்டணங்களின் பட்டியலையும் அவ்வப்போது சரிபாருங்கள்.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'புதிய iPhone-களில் <strong>Apple Intelligence</strong> உள்ளது: உங்களுக்காக எழுதும், சுருக்கும், திருத்தும் AI. அதை அணைக்கலாம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Apple Intelligence &amp; Siri என்பதைத் தட்டுங்கள்.</strong>', hint: 'இது மூன்றாவது குழுவில், அணுகல்தன்மைக்குக் கீழே உள்ளது.'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'எழுத்துக் கருவிகள், அறிவிப்புச் சுருக்கங்கள், Image Playground மற்றும் பல.'},
            {caption: 'நீட்டிப்புகள்'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'ஆஃப்' : 'ஆன்'}, {caption: 'SIRI'}, {label: 'Siri-யுடன் பேசு', value: '"Siri" அல்லது "Hey Siri"'}],
            {back: 'அமைப்புகள்', overlay: c.askOff ? dialog(p, 'Apple Intelligence-ஐ அணைக்கவா?', 'எழுத்துக் கருவிகள், சுருக்கங்கள் போன்ற அம்சங்கள் இனி கிடைக்காது.', [['cancel', 'ரத்துசெய்'], ['confirm-off', 'அணை']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: 'அணைக்க <strong>Apple Intelligence சுவிட்சைத் தட்டுங்கள்</strong>.', hints: {chatgpt: 'ChatGPT-ஐ அடுத்து செய்வோம். முதலில் Apple Intelligence சுவிட்சைத் தட்டுங்கள்.'}},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'நீட்டிப்புகள்'}, {label: 'ChatGPT', value: 'ஆன்'}],
            {back: 'அமைப்புகள்', overlay: dialog(p, 'Apple Intelligence-ஐ அணைக்கவா?', 'எழுத்துக் கருவிகள், சுருக்கங்கள் போன்ற அம்சங்கள் இனி கிடைக்காது.', [['cancel', 'ரத்துசெய்'], ['confirm-off', 'அணை']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>அணை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'Apple Intelligence &amp; Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'நீட்டிப்புகள்'}, {id: 'chatgpt', label: 'ChatGPT', value: 'ஆன்'}], {back: 'அமைப்புகள்'}),
         target: 'chatgpt', say: 'ChatGPT நீட்டிப்பு உங்கள் கேள்விகளை Apple-க்கு வெளியே உள்ள நிறுவனமான ChatGPT-க்கு அனுப்பலாம். <strong>ChatGPT-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'ChatGPT-ஐப் பயன்படுத்து', toggle: !c.gptOff, sub: 'Siri கோரிக்கைகளை ChatGPT-க்கு அனுப்பலாம்.'}], {back: 'பின்'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: 'அணைக்க <strong>ChatGPT-ஐப் பயன்படுத்து என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'ChatGPT-ஐப் பயன்படுத்து', toggle: false}], {back: 'பின்'}),
         question: {q: 'WhatsApp, Facebook மற்றும் பிற செயலிகளிலும் AI அரட்டைகள் உள்ளன. பாதுகாப்பான விதி என்ன?', options: [
            {t: 'எந்த AI அரட்டையிலும் தனிப்பட்ட விவரங்களை (வங்கி, உடல்நலம், கடவுச்சொற்கள், முகவரிகள்) ஒருபோதும் தட்டச்சு செய்யக் கூடாது', ok: true, why: 'ஆம். நீங்கள் தட்டச்சு செய்வது சேமிக்கப்பட்டு AI-க்குப் பயிற்சி அளிக்கப் பயன்படுத்தப்படலாம். அந்நியருடன் பேசுவது போலவே நடத்துங்கள்.'},
            {t: 'AI அரட்டைகள் தனிப்பட்டவை, எனவே எதையும் சொல்லலாம்', why: 'அவை ஃபோன் அழைப்பைப் போலத் தனிப்பட்டவை அல்ல. நீங்கள் தட்டச்சு செய்வது சேமிக்கப்படலாம். தனிப்பட்ட விவரங்களை அவற்றில் தவிருங்கள்.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'ChatGPT-ஐப் பயன்படுத்து', toggle: false}], {back: 'பின்'}), done: true,
         say: '<strong>சபாஷ்!</strong> Apple Intelligence-உம் ChatGPT-உம் அணைக்கப்பட்டன. அதே இடத்தில் எப்போது வேண்டுமானாலும் மீண்டும் இயக்கலாம். Siri வழக்கம்போல் வேலை செய்யும்.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Android ஃபோன்களில் இப்போது Google-இன் AI ஆன <strong>Gemini</strong> வருகிறது. பவர் பட்டனை அழுத்திப் பிடித்தால் தவறுதலாக அது திறக்கலாம். அதை மாற்றுவோம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>செயலிகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'செயலிகள்', [{caption: 'சமீபத்தில் திறந்த செயலிகள்'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: '45 செயலிகளையும் பார்'}, {id: 'default-apps', label: 'இயல்புநிலை செயலிகள்', sub: 'உதவியாளர், உலாவி, ஃபோன் செயலிகள்'}]),
         target: 'default-apps', say: '<strong>இயல்புநிலை செயலிகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'இயல்புநிலை செயலிகள்', [{label: 'உலாவி செயலி', sub: 'Chrome'}, {id: 'assistant', label: 'டிஜிட்டல் அசிஸ்டண்ட் செயலிகள்', sub: 'Gemini'}, {label: 'ஃபோன் செயலி', sub: 'ஃபோன்'}, {label: 'SMS செயலி', sub: 'செய்திகள்'}]),
         target: 'assistant', say: '<strong>டிஜிட்டல் அசிஸ்டண்ட் செயலிகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'டிஜிட்டல் அசிஸ்டண்ட் செயலிகள்', [{id: 'assistant-app', label: 'இயல்புநிலை டிஜிட்டல் அசிஸ்டண்ட் செயலி', sub: c.noAssist ? 'எதுவுமில்லை' : 'Gemini'}, {label: 'திரையிலிருந்து உரையைப் பயன்படுத்து', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>இயல்புநிலை டிஜிட்டல் அசிஸ்டண்ட் செயலி</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">ஏதுமில்லை</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>இயல்புநிலை டிஜிட்டல் அசிஸ்டண்ட் செயலி என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'டிஜிட்டல் அசிஸ்டண்ட் செயலிகள்', [{label: 'இயல்புநிலை டிஜிட்டல் அசிஸ்டண்ட் செயலி', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>இயல்புநிலை டிஜிட்டல் அசிஸ்டண்ட் செயலி</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">ஏதுமில்லை</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>ஏதுமில்லை என்பதைத் தட்டுங்கள்.</strong> பவர் பட்டனை அழுத்திப் பிடிக்கும்போது Gemini திறக்காது.', hints: {'assist-gemini': 'அது Gemini-யை அப்படியே வைத்திருக்கும். ஏதுமில்லை என்பதைத் தட்டுங்கள்.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'அடுத்து, நீங்கள் Gemini-யிடம் தட்டச்சு செய்வதை அது சேமிப்பதைத் தடுப்போம். <strong>Gemini செயலியைத் திறங்கள்.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">வணக்கம், Margaret<br><small>இன்று நான் உங்களுக்கு எப்படி உதவலாம்?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: 'மேல் வலதில் <strong>உங்கள் சுயவிவரப் படத்தைத் தட்டுங்கள்</strong>.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Gemini Apps Activity என்பதைத் தட்டுங்கள்.</strong> <em>சில ஃபோன்களில் இது Keep Activity எனப்படும்.</em>'},
        {screen: c => app(p, 'Gemini Apps Activity', `<p class="cf"><strong>${c.actOff ? 'ஆஃப்' : 'ஆன்'}</strong><br>${c.actOff ? 'உங்கள் அரட்டைகள் இனி உங்கள் கணக்கில் சேமிக்கப்படாது, Google-இன் AI-ஐ மேம்படுத்தவும் பயன்படுத்தப்படாது.' : 'உங்கள் அரட்டைகள் உங்கள் Google கணக்கில் சேமிக்கப்படும்; Google-இன் AI-ஐ மேம்படுத்த அவை மதிப்பாய்வு செய்யப்படலாம்.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">அணை</button><button type="button" class="cj" data-tap="off-delete">அணைத்து, செயல்பாட்டை நீக்கு</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>அணை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="cf"><strong>ஆன்</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">அணை</button><button type="button" class="cj" data-tap="off-delete">அணைத்து, செயல்பாட்டை நீக்கு</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: 'அது ஏற்கெனவே சேமித்தவற்றையும் அழிக்க, <strong>அணைத்து, செயல்பாட்டை நீக்கு என்பதைத் தட்டுங்கள்</strong>.', hints: {'off-only': 'அது புதிய அரட்டைகளைச் சேமிப்பதை நிறுத்தும், ஆனால் பழையவற்றை வைத்திருக்கும். அணைத்து, செயல்பாட்டை நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="cf"><strong>ஆஃப்</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook மற்றும் பிற செயலிகளிலும் AI அரட்டைகள் உள்ளன. பாதுகாப்பான விதி என்ன?', options: [
            {t: 'எந்த AI அரட்டையிலும் தனிப்பட்ட விவரங்களை (வங்கி, உடல்நலம், கடவுச்சொற்கள், முகவரிகள்) ஒருபோதும் தட்டச்சு செய்யக் கூடாது', ok: true, why: 'ஆம். நீங்கள் தட்டச்சு செய்வது சேமிக்கப்பட்டு AI-க்குப் பயிற்சி அளிக்கப் பயன்படுத்தப்படலாம். அந்நியருடன் பேசுவது போலவே நடத்துங்கள்.'},
            {t: 'AI அரட்டைகள் தனிப்பட்டவை, எனவே எதையும் சொல்லலாம்', why: 'அவை ஃபோன் அழைப்பைப் போலத் தனிப்பட்டவை அல்ல. நீங்கள் தட்டச்சு செய்வது சேமிக்கப்படலாம். தனிப்பட்ட விவரங்களை அவற்றில் தவிருங்கள்.'}]}},
        {screen: c => app(p, 'Gemini Apps Activity', '<p class="cf"><strong>ஆஃப்</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>சபாஷ்!</strong> Gemini இனி பவர் பட்டனிலிருந்து திறக்காது, உங்கள் அரட்டைகளையும் சேமிக்காது. Samsung-இல், ஒவ்வொரு அம்சத்துக்கும் தனி சுவிட்ச் உள்ள <strong>அமைப்புகள் > Galaxy AI</strong> என்பதிலும் பாருங்கள்.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'உங்கள் Apple Account-இல் உங்கள் புகைப்படங்கள், தொடர்புகள், பணம் செலுத்தல்கள் உள்ளன. அது பாதுகாக்கப்பட்டுள்ளதா எனப் பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: 'மேலே <strong>உங்கள் பெயரைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'தனிப்பட்ட தகவல்'}, {id: 'security', label: 'உள்நுழைவு &amp; பாதுகாப்பு'}, {id: 'payment', label: 'பணம் செலுத்தல் &amp; டெலிவரி'}, {id: 'subscriptions', label: 'சந்தாக்கள்'}], {back: 'அமைப்புகள்'}),
         target: 'security', say: '<strong>உள்நுழைவு &amp; பாதுகாப்பு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'உள்நுழைவு &amp; பாதுகாப்பு', [{label: 'மின்னஞ்சலும் ஃபோன் எண்களும்', sub: '+44 7700 900123'}, {label: 'கடவுச்சொல்லை மாற்று'}, {caption: ' '}, {label: 'இரு காரணி அங்கீகாரம்', value: 'ஆன்'},
            {id: 'recovery', label: 'கணக்கு மீட்பு'}], {back: 'Apple Account'}),
         target: 'recovery', say: '<strong>இரு காரணி அங்கீகாரம்</strong> ஆன் என்று உள்ளது: நல்லது. புதிய சாதனம் உள்நுழைவதற்கு முன் உங்கள் ஃபோனிலிருந்து ஒரு குறியீடு தேவைப்படும் என்று அர்த்தம். இப்போது, <strong>கணக்கு மீட்பைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'கணக்கு மீட்பு', [{caption: 'மீட்புத் தொடர்பு'}, c.recovery ? {label: 'Sarah', sub: 'Sarah ஏற்கக் காத்திருக்கிறது'} : {id: 'add-contact', label: 'மீட்புத் தொடர்பைச் சேர்…', sub: 'உங்கள் கணக்கிற்குள் மீண்டும் நுழைய உதவக்கூடிய, நீங்கள் நம்பும் ஒருவர்.'}],
            {back: 'பின்', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>மீட்புத் தொடர்பைத் தேர்ந்தெடுங்கள்</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (மகள்)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'உங்கள் கடவுச்சொல்லை எப்போதாவது மறந்தால், மீண்டும் நுழைய உதவ ஒரு <strong>மீட்புத் தொடர்பு</strong> உங்களுக்கு ஒரு குறியீட்டைப் பெற்றுத் தர முடியும். அவர்களால் உங்கள் தரவைப் பார்க்க முடியாது. <strong>மீட்புத் தொடர்பைச் சேர் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'கணக்கு மீட்பு', [{caption: 'மீட்புத் தொடர்பு'}, {label: 'மீட்புத் தொடர்பைச் சேர்…'}],
            {back: 'பின்', overlay: `<div class="ei"><div class="cv"><p><strong>மீட்புத் தொடர்பைத் தேர்ந்தெடுங்கள்</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (மகள்)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'iPhone வைத்திருக்கும், நீங்கள் நம்பும் ஒருவரைத் தேர்ந்தெடுங்கள். <strong>Sarah-வைத் தட்டுங்கள்.</strong>', hints: {'pick-dave': 'இந்தப் பயிற்சிக்கு Sarah-வைத் தேர்ந்தெடுங்கள்.'}},
        {screen: c => list(p, 'கணக்கு மீட்பு', [{caption: 'மீட்புத் தொடர்பு'}, {label: 'Sarah', sub: 'Sarah ஏற்கக் காத்திருக்கிறது'}], {back: 'பின்'}),
         question: {q: 'ஒருவர் தான் Apple-இலிருந்து அழைப்பதாகச் சொல்கிறார். உங்கள் ஃபோனில் இப்போது தோன்றிய 6 இலக்கக் குறியீட்டைப் படித்துச் சொல்லும்படி கேட்கிறார். நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'துண்டிப்பேன். அந்தக் குறியீட்டை யாருக்கும் கொடுக்க மாட்டேன்', ok: true, why: 'சரியே. அந்தக் குறியீடு ஒருவரை உங்கள் கணக்கில் நுழைய விடும். Apple ஒருபோதும் அழைத்து அதைக் கேட்காது.'},
            {t: 'படித்துச் சொல்வேன், அவர்கள் Apple-இலிருந்து தானே', why: 'Apple அந்தக் குறியீட்டை ஒருபோதும் கேட்காது. அது யாரிடம் இருந்தாலும் உங்கள் கணக்கில் நுழையலாம். துண்டியுங்கள்.'}]}},
        {screen: c => list(p, 'கணக்கு மீட்பு', [{caption: 'மீட்புத் தொடர்பு'}, {label: 'Sarah', sub: 'Sarah ஏற்கக் காத்திருக்கிறது'}], {back: 'பின்'}), done: true,
         say: '<strong>சபாஷ்!</strong> இரு காரணி அங்கீகாரம் இயக்கப்பட்டுள்ளது, மீண்டும் உள்ளே நுழைய Sarah உங்களுக்கு உதவலாம். உங்கள் iPhone கடவுச்சொற்களையும் உங்களுக்காக நினைவில் வைத்துக்கொள்ளலாம், <strong>Passwords</strong> செயலியில்.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'உங்கள் Google கணக்கில் உங்கள் மின்னஞ்சல்கள், புகைப்படங்கள், தொடர்புகள் உள்ளன. அதற்கு இரண்டாவது பூட்டைச் சேர்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google-ஐத் தட்டுங்கள்.</strong>', hint: 'Google பட்டியலின் கீழ்ப்பகுதிக்கு அருகில் உள்ளது.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'உங்கள் Google கணக்கை நிர்வகியுங்கள்', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'காப்புப்பிரதி'}, {id: 'autofill', label: 'தானாக நிரப்புதல்'}]),
         target: 'manage', say: '<strong>உங்கள் Google கணக்கை நிர்வகியுங்கள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => app(p, 'Google கணக்கு', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: 'மேலே உள்ள <strong>பாதுகாப்பைத்</strong> தட்டுங்கள்.'},
        {screen: c => list(p, 'பாதுகாப்பு', [{caption: 'Google-இல் நீங்கள் எப்படி உள்நுழைகிறீர்கள்'}, {id: '2sv', label: '2-படிச் சரிபார்ப்பு', sub: c.twoOn ? 'ஆன்' : 'ஆஃப்'}, {label: 'கடவுச்சொல்', sub: 'கடைசியாக 2 ஆண்டுகளுக்கு முன் மாற்றப்பட்டது'}, {label: 'மீட்பு ஃபோன்', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>2-படிச் சரிபார்ப்பு</strong> ஆஃப் என்று உள்ளது. புதிய சாதனத்தில் உள்நுழைய உங்கள் ஃபோனுக்கு அனுப்பப்படும் குறியீடும் தேவை என்று அர்த்தம்; அதனால் திருடப்பட்ட கடவுச்சொல் மட்டும் போதாது. <strong>அதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, '2-படிச் சரிபார்ப்பு', [], {top: '<p class="cf">உங்கள் ஃபோன் எண்: <strong>07700 900123</strong><br>இது உங்களுடையதா என்று சரிபார்க்க இந்த எண்ணுக்கு ஒரு குறியீட்டைக் குறுஞ்செய்தி அனுப்புவோம்.</p><button type="button" class="ce dk" data-tap="send-code">குறியீட்டை அனுப்பு</button>'}),
         target: 'send-code', say: '<strong>குறியீட்டை அனுப்பு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, '2-படிச் சரிபார்ப்பு', [], {top: `<div class="sd"><strong>செய்திகள் · இப்போது</strong><span>G-382605 உங்கள் Google சரிபார்ப்புக் குறியீடு.</span></div>
            <p class="cf">07700 900123 எண்ணுக்கு நாங்கள் குறுஞ்செய்தி அனுப்பிய குறியீட்டை உள்ளிடுங்கள்</p>${field('gcode', 'குறியீட்டை உள்ளிடுங்கள்', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">அடுத்து</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'குறுஞ்செய்தியில் உள்ள 6 எண்களைத் தட்டச்சு செய்யுங்கள்: 382605.',
         say: 'ஒரு குறியீட்டுடன் குறுஞ்செய்தி வருகிறது. <strong>பெட்டியில் 382605 எனத் தட்டச்சு செய்து</strong> <strong>அடுத்து என்பதைத் தட்டுங்கள்</strong>. <em>(இது பயிற்சிக் குறியீடு. நீங்களே கேட்ட இடத்தைத் தவிர வேறெங்கும் உண்மையான குறியீட்டைத் தட்டச்சு செய்யாதீர்கள்.)</em>'},
        {screen: () => list(p, '2-படிச் சரிபார்ப்பு', [], {top: '<p class="cf">உங்கள் ஃபோன் எண் சரிபார்க்கப்பட்டது ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">2-படிச் சரிபார்ப்பை இயக்கு</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>2-படிச் சரிபார்ப்பை இயக்கு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'பாதுகாப்பு', [{caption: 'Google-இல் நீங்கள் எப்படி உள்நுழைகிறீர்கள்'}, {label: '2-படிச் சரிபார்ப்பு', sub: 'ஆன் ⟦check⟧'}, {label: 'மீட்பு ஃபோன்', sub: '07700 900123'}]),
         question: {q: 'ஒருவர் தான் Google-இலிருந்து அழைப்பதாகச் சொல்கிறார். உங்களுக்கு இப்போது குறுஞ்செய்தியாக வந்த குறியீட்டைப் படித்துச் சொல்லும்படி கேட்கிறார். நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'துண்டிப்பேன். அந்தக் குறியீட்டை யாருக்கும் கொடுக்க மாட்டேன்', ok: true, why: 'சரியே. அந்தக் குறியீடு ஒருவரை உங்கள் கணக்கில் நுழைய விடும். Google ஒருபோதும் அழைத்து அதைக் கேட்காது.'},
            {t: 'படித்துச் சொல்வேன், அவர்கள் Google-இலிருந்து தானே', why: 'Google அந்தக் குறியீட்டை ஒருபோதும் கேட்காது. அது யாரிடம் இருந்தாலும் உங்கள் கணக்கில் நுழையலாம். துண்டியுங்கள்.'}]}},
        {screen: c => list(p, 'பாதுகாப்பு', [{caption: 'Google-இல் நீங்கள் எப்படி உள்நுழைகிறீர்கள்'}, {label: '2-படிச் சரிபார்ப்பு', sub: 'ஆன் ⟦check⟧'}]), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் Google கணக்கில் இனி கடவுச்சொல்லுடன் உங்கள் ஃபோனும் தேவை. Google உங்கள் கடவுச்சொற்களை நினைவில் வைத்துக்கொள்ளவும் முடியும்: அமைப்புகளில் <strong>Google கடவுச்சொல் நிர்வாகியைத்</strong> தேடுங்கள்.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>இன்று காலை கடற்கரையோர நடை அருமை! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>அடுத்த நடை: சனிக்கிழமை, காலை 10 மணி, துறைமுகத்திலிருந்து.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">புதிய நட்பு அழைப்புகள் இல்லை.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>உங்கள் சுயவிவரத்தைப் பார்</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>அமைப்புகள் &amp; தனியுரிமை</strong></button><div class="ck"><strong>உதவியும் ஆதரவும்</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'நீங்கள் இடுவதை உங்கள் நண்பர்கள் மட்டுமே பார்க்கிறார்கள் என்பதை உறுதிசெய்வோம். <strong>Facebook-ஐத் திறங்கள்.</strong> <em>(இது பயிற்சிப் பதிப்பு. உண்மையான செயலி அல்ல.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: 'கீழ் வலதில் உள்ள <strong>மெனுவைத் தட்டுங்கள்</strong>.', hints: {'tab-friends': 'நட்பு அழைப்புகளை சிறிது நேரத்தில் பார்ப்போம். முதலில் மெனுவைத் தட்டுங்கள்.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>அமைப்புகள் &amp; தனியுரிமை என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'அமைப்புகள்', [{caption: 'பார்வையாளர்களும் தெரிவுநிலையும்'}, {id: 'posts', label: 'இடுகைகள்', sub: 'உங்கள் எதிர்கால இடுகைகளை யார் பார்க்கலாம்: ' + (c.audience || 'பொது')}, {label: 'சுயவிவர விவரங்கள்'}, {label: 'மக்கள் உங்களை எப்படிக் கண்டுபிடித்துத் தொடர்புகொள்கிறார்கள்'},
            {caption: 'உங்கள் செயல்பாடு'}, {label: 'செயல்பாட்டுப் பதிவு'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>உங்கள் எதிர்கால இடுகைகளை யார் பார்க்கலாம்?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ பொது<small>Facebook-இல் இருக்கும் அல்லது இல்லாத எவரும்</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ நண்பர்கள்<small>Facebook-இல் உங்கள் நண்பர்கள்</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ நான் மட்டும்</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'உங்கள் இடுகைகள் <strong>பொது</strong> என அமைக்கப்பட்டுள்ளன: உலகில் உள்ள எவரும் அவற்றைப் பார்க்கலாம். <strong>இடுகைகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'அமைப்புகள்', [{caption: 'பார்வையாளர்களும் தெரிவுநிலையும்'}, {label: 'இடுகைகள்', sub: 'உங்கள் எதிர்கால இடுகைகளை யார் பார்க்கலாம்: பொது'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>உங்கள் எதிர்கால இடுகைகளை யார் பார்க்கலாம்?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ பொது<small>Facebook-இல் இருக்கும் அல்லது இல்லாத எவரும்</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ நண்பர்கள்<small>Facebook-இல் உங்கள் நண்பர்கள்</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ நான் மட்டும்</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'நண்பர்கள்'; }, say: '<strong>நண்பர்கள் என்பதைத் தட்டுங்கள்.</strong>',
         hints: {'aud-public': 'பொது என்பது முன்பிருந்தது. நண்பர்கள் என்பதைத் தட்டுங்கள்.', 'aud-me': 'நான் மட்டும் என்றால் வேறு யாரும் உங்கள் இடுகைகளைப் பார்க்க மாட்டார்கள். நண்பர்கள் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => list(p, 'அமைப்புகள்', [{caption: 'பார்வையாளர்களும் தெரிவுநிலையும்'}, {label: 'இடுகைகள்', sub: 'உங்கள் எதிர்கால இடுகைகளை யார் பார்க்கலாம்: நண்பர்கள் ⟦check⟧'}, {id: 'back-feed', label: '‹ Facebook-க்குத் திரும்பு'}]),
         target: 'back-feed', say: 'முடிந்தது. இப்போது <strong>Facebook-க்குத் திரும்பு என்பதைத் தட்டுங்கள்</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'உங்களுக்கு ஒரு நட்பு அழைப்பு வந்துள்ளது. <strong>நண்பர்கள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: '"Jean Smith" இடமிருந்து ஒரு நட்பு அழைப்பு. ஆனால் நீங்கள் ஏற்கெனவே Jean-உடன் நண்பர்கள் (அவர் உங்கள் ஃபீடில் இருக்கிறார்). என்ன நடக்கிறது?', options: [
            {t: 'இது ஒருவேளை மோசடிக்காரர் உருவாக்கிய Jean-இன் சுயவிவரப் போலி', ok: true, why: 'ஆம். மோசடிக்காரர்கள் ஒருவரின் பெயரையும் புகைப்படத்தையும் நகலெடுத்து, அவர் நண்பர்களுக்குச் செய்தி அனுப்பிப் பணம் கேட்கிறார்கள். உண்மையான Jean ஏற்கெனவே உங்கள் நண்பர்.'},
            {t: 'Jean-க்கு இரண்டாவது கணக்கு இருக்க வேண்டும்', why: 'இருக்கலாம், ஆனால் இது மோசடிக்காரர் உருவாக்கிய போலி என்பதே மிகவும் சாத்தியம்: இது 2 நாட்களுக்கு முன்தான் சேர்ந்தது. Jean-ஐ ஃபோனில் அழைத்துக் கேளுங்கள்.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: 'அழைப்பை நிராகரிக்க <strong>நீக்கு என்பதைத் தட்டுங்கள்</strong>.', hints: {'confirm-jean': 'நகலெடுக்கப்பட்ட சுயவிவரத்தை உறுதிப்படுத்தாதீர்கள். நீக்கு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் இடுகைகள் இப்போது நண்பர்களுக்கு மட்டுமே, போலிச் சுயவிவரத்திலிருந்தும் தப்பித்துவிட்டீர்கள். Jean புகாரளிக்கும்படி அவருக்குத் தெரிவியுங்கள். "கூரியர் மூலம்" பணம் செலுத்த விரும்பும், அல்லது உங்கள் ஃபோனுக்கு அனுப்பப்படும் குறியீடுகளைக் கேட்கும் Marketplace வாங்குபவர்களிடமும் எச்சரிக்கையாக இருங்கள்.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'இங்கே தேடு'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>பேருந்து, ரயில் நிலையம், Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>மருத்துவமனை, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>தேவாலயம், Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>பேருந்து, ரயில் நிலையம் · 25 மைல்</small><button type="button" class="ce co" data-tap="directions">வழிகாட்டுதல்கள்</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 நிமி (25 மைல்)</strong><small>வேகமான வழி, A614 வழியாக</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ 4 நிமிடம் நடந்து <strong>Bridlington Bus Station</strong>, நிறுத்தம் 3-க்குச் செல்லுங்கள்</li>
                <li>⟦bus⟧ <strong>121</strong> Hull நோக்கி · 10:15 · <b class="ahy">சரியான நேரம்</b></li><li><strong>Hull Paragon Interchange</strong> இல் இறங்குங்கள் (24 நிறுத்தங்கள்)</li></ol>
                <button type="button" class="ce co" data-tap="start">தொடங்கு</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'நேரலை நேரங்களுடன் பேருந்துப் பயணத்தை வரைபடங்கள் திட்டமிடும். பேருந்தில் Hull செல்வோம். <strong>வரைபடங்களைத் திறங்கள்.</strong>' + (p === 'ios' ? ' <em>(நீங்கள் விரும்பினால் Google Maps-உம் இதே போலத்தான் வேலை செய்யும்.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: 'மேலே உள்ள <strong>தேடல் பெட்டியைத் தட்டுங்கள்</strong>.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'நாங்கள் "Hull interchange" எனத் தட்டச்சு செய்துள்ளோம். பேருந்து நிலையமான <strong>Hull Paragon Interchange-ஐத் தட்டுங்கள்</strong>.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>வழிகாட்டுதல்கள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'அது முதலில் வாகனம் ஓட்டுவதைக் காட்டுகிறது. பொதுப் போக்குவரத்தைப் பார்க்க <strong>பேருந்தைத் தட்டுங்கள்</strong> ⟦bus⟧.', hints: {'mode-walk': 'எட்டு மணி நேரம்! அதற்குப் பதிலாகப் பேருந்தைத் தட்டுங்கள்.', 'mode-car': 'அது வாகனம் ஓட்டுவது. பேருந்தைத் தட்டுங்கள்.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'இதோ பேருந்துகள், அடுத்த பேருந்து முதலில். "சரியான நேரம்" என்பது நேரலைத் தகவல். <strong>10:15-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'பேருந்தை எங்கே பிடிப்பீர்கள்?', options: [
            {t: 'Bridlington Bus Station, நிறுத்தம் 3', ok: true, why: 'ஆம். எங்கே நடந்து செல்ல வேண்டும், எந்தப் பேருந்து, எங்கே இறங்க வேண்டும் என்பதை வரைபடங்கள் சொல்லும்.'},
            {t: 'Hull Paragon Interchange', why: 'அது நீங்கள் இறங்கும் இடம். நீங்கள் அதை Bridlington Bus Station, நிறுத்தம் 3-இல் பிடிப்பீர்கள்.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>சபாஷ்!</strong> உண்மையான பயணத்தில் <strong>தொடங்கு</strong> என்பதைத் தட்டினால், உங்கள் நிறுத்தம் வரப்போவதை வரைபடங்கள் சொல்லும். பேருந்து பாஸ் இருந்தால், வழக்கம்போல ஓட்டுநரிடம் காட்டுங்கள். <em>(பயிற்சி நேரங்கள் மட்டுமே: அன்றைய உண்மையான நேரங்களைச் சரிபாருங்கள்.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>அவசர SOS</strong> உங்களுக்காக 999-ஐ அழைத்து, நீங்கள் தேர்ந்தெடுத்தவர்களுக்கு உங்கள் இருப்பிடத்தைக் குறுஞ்செய்தி அனுப்பும். அது தயாராக உள்ளதா எனப் பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>அவசர SOS என்பதைத் தட்டுங்கள்.</strong>', hint: 'இது மூன்றாவது குழுவில், சிவப்பு ஐகானுடன் உள்ளது.'},
        {screen: c => list(p, 'அவசர SOS', [{label: 'பிடித்து விட்டு அழை', toggle: true, sub: 'பக்கவாட்டு பட்டனையும் ஒரு ஒலியளவு பட்டனையும் அழுத்திப் பிடித்து, பிறகு விடுங்கள்.'},
            {id: 'five', label: '5 முறை அழுத்தி அழை', toggle: !!c.five, sub: 'பக்கவாட்டு பட்டனை விரைவாக 5 முறை அழுத்துங்கள்.'}, {caption: ' '},
            {id: 'contacts', label: 'உடல்நலத்தில் அவசரத் தொடர்புகளை அமை'}, {label: 'விபத்து கண்டறிதல்', toggle: true, sub: 'கடுமையான கார் விபத்துக்குப் பிறகு 999-ஐ அழைக்கும்.'}], {back: 'அமைப்புகள்'}),
         target: 'five', action: c => { c.five = true; }, say: 'பதற்றத்திலும் பக்கவாட்டு பட்டனை 5 முறை அழுத்துவது நினைவில் வைக்க எளிது. <strong>5 முறை அழுத்தி அழை என்பதை இயக்குங்கள்.</strong>'},
        {screen: c => list(p, 'அவசர SOS', [{label: 'பிடித்து விட்டு அழை', toggle: true}, {label: '5 முறை அழுத்தி அழை', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'உடல்நலத்தில் அவசரத் தொடர்புகளை அமை'}], {back: 'அமைப்புகள்', overlay: c.pick ? sheet('அவசரத் தொடர்பைச் சேர்', [['pick-sarah', 'Sarah', 'மகள் · 07700 900333'], ['pick-dave', 'Dave', 'நண்பர்']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'இப்போது உங்கள் இருப்பிடத்துடன் குறுஞ்செய்தி யாருக்குப் போக வேண்டும் என்பதைத் தேர்ந்தெடுங்கள். <strong>அவசரத் தொடர்புகளை அமை என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'அவசர SOS', [{label: '5 முறை அழுத்தி அழை', toggle: true}], {back: 'அமைப்புகள்', overlay: sheet('அவசரத் தொடர்பைச் சேர்', [['pick-sarah', 'Sarah', 'மகள் · 07700 900333'], ['pick-dave', 'Dave', 'நண்பர்']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: 'உங்கள் மகளான <strong>Sarah-வைத் தட்டுங்கள்</strong>.', hints: {'pick-dave': 'இந்தப் பயிற்சிக்கு Sarah-வைத் தேர்ந்தெடுங்கள்.'}},
        {screen: () => list(p, 'அவசர SOS', [{label: '5 முறை அழுத்தி அழை', toggle: true}, {caption: 'அவசரத் தொடர்புகள்'}, {label: 'Sarah', sub: 'மகள்'}], {back: 'அமைப்புகள்'}),
         question: {q: 'நீங்கள் கீழே விழுந்துவிட்டீர்கள், ஃபோன் திரையை நன்றாக எட்ட முடியவில்லை. என்ன செய்வீர்கள்?', options: [
            {t: 'பக்கவாட்டு பட்டனை விரைவாக 5 முறை அழுத்துவேன்', ok: true, why: 'ஆம். ஒரு கவுண்ட்டவுன் தொடங்கும், பிறகு அது 999-ஐ அழைத்து, நீங்கள் எங்கே இருக்கிறீர்கள் என்று Sarah-வுக்குக் குறுஞ்செய்தி அனுப்பும்.'},
            {t: 'ஃபோனைத் திறந்து ஃபோன் செயலியைத் தேடுவேன்', why: 'அவசரத்தில் அது மெதுவானது. பக்கவாட்டு பட்டனை 5 முறை அழுத்தினால், ஃபோன் பூட்டியிருந்தாலும் வேலை செய்யும்.'}]}},
        {screen: () => list(p, 'அவசர SOS', [{label: '5 முறை அழுத்தி அழை', toggle: true}, {caption: 'அவசரத் தொடர்புகள்'}, {label: 'Sarah', sub: 'மகள்'}], {back: 'அமைப்புகள்'}), done: true,
         say: '<strong>சபாஷ்!</strong> அவசர SOS தயார்; நீங்கள் எங்கே இருக்கிறீர்கள் என்று Sarah-வுக்குத் தெரிவிக்கப்படும். தவறுதலாக அழுத்திவிட்டால், கவுண்ட்டவுனின்போது நிறுத்து என்பதைத் தட்டுங்கள்.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>அவசர SOS</strong> உங்களுக்காக 999-ஐ அழைத்து, நீங்கள் தேர்ந்தெடுத்தவர்களுக்கு உங்கள் இருப்பிடத்தைக் குறுஞ்செய்தி அனுப்பும். அது தயாராக உள்ளதா எனப் பார்ப்போம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>பாதுகாப்பு &amp; அவசரநிலை என்பதைத் தட்டுங்கள்.</strong> <em>Samsung-இலும் இது பாதுகாப்பு மற்றும் அவசரநிலை.</em>', hint: 'கீழே உருட்டுங்கள்: அது கீழ்ப்பகுதிக்கு அருகில் உள்ளது.'},
        {screen: () => list(p, 'பாதுகாப்பு &amp; அவசரநிலை', [{id: 'medical', label: 'மருத்துவத் தகவல்'}, {id: 'contacts-ec', label: 'அவசரத் தொடர்புகள்'}, {id: 'sos', label: 'அவசர SOS', sub: 'ஆஃப்'}, {label: 'கார் விபத்து கண்டறிதல்'}]),
         target: 'sos', say: 'அவசர SOS <strong>ஆஃப்</strong> என்று உள்ளது. <strong>அவசர SOS என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'அவசர SOS', [{id: 'sos-toggle', label: 'அவசர SOS-ஐப் பயன்படுத்து', toggle: !!c.sosOn, sub: 'அவசர நடவடிக்கைகளைத் தொடங்க பவர் பட்டனை 5 முறை அல்லது அதற்கு மேல் அழுத்துங்கள்.'}, {label: 'அவசரத் தொடர்புகளுடன் தகவலைப் பகிர்', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: 'இயக்க <strong>அவசர SOS-ஐப் பயன்படுத்து என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => list(p, 'பாதுகாப்பு &amp; அவசரநிலை', [{id: 'medical', label: 'மருத்துவத் தகவல்'}, {id: 'contacts-ec', label: 'அவசரத் தொடர்புகள்', sub: 'எதுவுமில்லை'}, {label: 'அவசர SOS', sub: 'ஆன்'}]),
         target: 'contacts-ec', say: 'இப்போது உங்கள் இருப்பிடத்துடன் குறுஞ்செய்தி யாருக்குப் போக வேண்டும் என்பதைத் தேர்ந்தெடுங்கள். <strong>அவசரத் தொடர்புகள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'அவசரத் தொடர்புகள்', [{id: 'add', label: '＋ தொடர்பைச் சேர்'}], {overlay: c.pick ? sheet('ஒரு தொடர்பைத் தேர்ந்தெடுங்கள்', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>தொடர்பைச் சேர் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => list(p, 'அவசரத் தொடர்புகள்', [{label: '＋ தொடர்பைச் சேர்'}], {overlay: sheet('ஒரு தொடர்பைத் தேர்ந்தெடுங்கள்', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: 'உங்கள் மகளான <strong>Sarah-வைத் தட்டுங்கள்</strong>.', hints: {'pick-dave': 'இந்தப் பயிற்சிக்கு Sarah-வைத் தேர்ந்தெடுங்கள்.'}},
        {screen: () => list(p, 'அவசரத் தொடர்புகள்', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ தொடர்பைச் சேர்'}]),
         question: {q: 'நீங்கள் கீழே விழுந்துவிட்டீர்கள், ஃபோன் திரையை நன்றாக எட்ட முடியவில்லை. என்ன செய்வீர்கள்?', options: [
            {t: 'பவர் பட்டனை விரைவாக 5 முறை அழுத்துவேன்', ok: true, why: 'ஆம். ஒரு கவுண்ட்டவுன் தொடங்கும், பிறகு அது 999-ஐ அழைத்து, நீங்கள் எங்கே இருக்கிறீர்கள் என்பதை Sarah-வுடன் பகிரும்.'},
            {t: 'ஃபோனைத் திறந்து ஃபோன் செயலியைத் தேடுவேன்', why: 'அவசரத்தில் அது மெதுவானது. பவர் பட்டனை 5 முறை அழுத்தினால், ஃபோன் பூட்டியிருந்தாலும் வேலை செய்யும்.'}]}},
        {screen: () => list(p, 'அவசரத் தொடர்புகள்', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>சபாஷ்!</strong> அவசர SOS இயக்கத்தில் உள்ளது; நீங்கள் எங்கே இருக்கிறீர்கள் என்று Sarah-வுக்குத் தெரிவிக்கப்படும். தவறுதலாக அழுத்திவிட்டால், கவுண்ட்டவுனின்போது ரத்துசெய் என்பதைத் தட்டுங்கள்.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'கடுமையான வெள்ளம் போன்ற அருகிலுள்ள ஆபத்துகள் பற்றி அவசர எச்சரிக்கைகள் உங்களை எச்சரிக்கும். இந்த ஃபோனில் யாரோ ஒன்றை அணைத்துவிட்டார்கள். அதைச் சரிசெய்வோம். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>அறிவிப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'அறிவிப்புகள்', [{label: 'முன்னோட்டங்களைக் காட்டு', value: 'எப்போதும்'}, {caption: 'அறிவிப்பு பாணி'}, {label: 'செய்திகள்', sub: 'பேனர்கள், ஒலிகள், பேட்ஜ்கள்'}, {label: 'WhatsApp', sub: 'பேனர்கள், ஒலிகள், பேட்ஜ்கள்'},
                {caption: 'அரசு எச்சரிக்கைகள்'}, {label: 'தீவிர எச்சரிக்கைகள்', toggle: true}, {id: 'severe', label: 'கடுமையான எச்சரிக்கைகள்', toggle: !!c.severe}, {label: 'சோதனை எச்சரிக்கைகள்', toggle: false}], {back: 'அமைப்புகள்'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'அரசு எச்சரிக்கைகள் மிகக் கீழே உள்ளன. <strong>கடுமையான எச்சரிக்கைகள்</strong> ஆஃப் என்று உள்ளது. <strong>இயக்க அதைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>பாதுகாப்பு &amp; அவசரநிலை என்பதைத் தட்டுங்கள்.</strong>', hint: 'இது பட்டியலின் கீழ்ப்பகுதிக்கு அருகில் உள்ளது.'},
            {screen: () => list(p, 'பாதுகாப்பு &amp; அவசரநிலை', [{label: 'மருத்துவத் தகவல்'}, {label: 'அவசர SOS'}, {id: 'wea', label: 'வயர்லெஸ் அவசர எச்சரிக்கைகள்'}, {label: 'தெரியாத டிராக்கர் எச்சரிக்கைகள்'}]),
             target: 'wea', say: '<strong>வயர்லெஸ் அவசர எச்சரிக்கைகள் என்பதைத் தட்டுங்கள்.</strong> <em>சில ஃபோன்களில் இது அவசர எச்சரிக்கைகள் எனப்படும்.</em>'},
            {screen: c => list(p, 'வயர்லெஸ் அவசர எச்சரிக்கைகள்', [{label: 'எச்சரிக்கைகளை அனுமதி', toggle: true}, {label: 'தீவிர அச்சுறுத்தல்கள்', toggle: true}, {id: 'severe', label: 'கடுமையான அச்சுறுத்தல்கள்', toggle: !!c.severe}, {label: 'சோதனை எச்சரிக்கைகள்', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>கடுமையான அச்சுறுத்தல்கள்</strong> ஆஃப் என்று உள்ளது. <strong>இயக்க அதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ அவசர எச்சரிக்கை: கடுமையானது</strong><p>கடற்கரையோரம் அருகே கடுமையான வெள்ளம் எதிர்பார்க்கப்படுகிறது. உயரமான இடத்துக்குச் செல்லுங்கள். மேலும் gov.uk/alerts-இல்</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'ஓர் எச்சரிக்கை இப்படித்தான் இருக்கும். அமைதிப் பயன்முறையிலும் சுமார் 10 விநாடிகளுக்கு உரத்த சைரன் ஒலி எழுப்பும். <strong>OK-ஐத் தட்டுங்கள்.</strong> <em>(பயிற்சி மட்டுமே.)</em>'},
        {screen: () => home(p), question: {q: 'நீங்கள் வாகனம் ஓட்டும்போது ஓர் எச்சரிக்கை வருகிறது. என்ன செய்ய வேண்டும்?', options: [
            {t: 'படிக்கும் முன் பாதுகாப்பான இடத்தில் வாகனத்தை ஓரமாக நிறுத்துவேன்', ok: true, why: 'ஆம். வாகனம் ஓட்டும்போது ஒருபோதும் ஃபோனைப் படிக்காதீர்கள். பாதுகாப்பாக நிறுத்தி, பிறகு படியுங்கள்.'},
            {t: 'வாகனம் ஓட்டும்போதே உடனே படிப்பேன்', why: 'வாகனம் ஓட்டும்போது ஒருபோதும் ஃபோனைப் படிக்காதீர்கள். முதலில் பாதுகாப்பாக நிறுத்த ஓர் இடத்தைக் கண்டுபிடியுங்கள்.'}]}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> அருகிலுள்ள கடுமையான ஆபத்துகள் பற்றி உங்கள் ஃபோன் இனி உங்களை எச்சரிக்கும். உண்மையான எச்சரிக்கைகள் தனிப்பட்ட விவரங்களையோ பணத்தையோ ஒருபோதும் கேட்காது: கேட்டால் அது மோசடி.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'திருடப்பட்ட ஃபோன் திருடனுக்குப் பயனற்றதாக்கும் மூன்று விஷயங்கள். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Face ID &amp; கடவுக்குறியீடு என்பதைத் தட்டுங்கள்.</strong> <em>உண்மையான iPhone-இல் அடுத்து உங்கள் கடவுக்குறியீட்டை உள்ளிடுவீர்கள்.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'கீழே உருட்டி <strong>திருடப்பட்ட சாதனப் பாதுகாப்பைத் தட்டுங்கள்</strong>.'},
            {screen: c => list(p, 'திருடப்பட்ட சாதனப் பாதுகாப்பு', [{id: 'sdp', label: 'திருடப்பட்ட சாதனப் பாதுகாப்பு', toggle: !!c.sdp, sub: 'வீட்டை விட்டு வெளியே இருக்கும்போது, உங்கள் கடவுக்குறியீட்டையோ Apple Account-ஐயோ மாற்ற Face ID தேவை, மேலும் 1 மணி நேரக் காத்திருப்பும்.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'உங்கள் கடவுக்குறியீட்டைப் பார்த்துவிட்ட திருடன் உங்களை வெளியே தள்ளிப் பூட்டுவதை இது தடுக்கும். <strong>இதை இயக்குங்கள்.</strong>'},
            {screen: () => list(p, 'திருடப்பட்ட சாதனப் பாதுகாப்பு', [{label: 'திருடப்பட்ட சாதனப் பாதுகாப்பு', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'அடுத்து, பூட்டுத் திரையில் செய்திகளை மறையுங்கள். பின்செல்ல <strong>‹ Face ID என்பதைத் தட்டுங்கள்</strong>.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>அறிவிப்புகளைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'அறிவிப்புகள்', [{id: 'previews', label: 'முன்னோட்டங்களைக் காட்டு', value: c.previews || 'எப்போதும்'}, {label: 'திரைப் பகிர்வு', value: 'அறிவிப்புகள் ஆஃப்'}], {back: 'அமைப்புகள்',
                overlay: c.pickPrev ? sheet('முன்னோட்டங்களைக் காட்டு', [['prev-always', 'எப்போதும்'], ['prev-unlocked', 'திறந்திருக்கும்போது', 'பரிந்துரைக்கப்பட்டது'], ['prev-never', 'ஒருபோதுமில்லை']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'இப்போது, உங்கள் ஃபோனைத் திறக்காமலேயே பாதுகாப்புக் குறியீடுகள் உட்பட உங்கள் செய்திகளை யார் வேண்டுமானாலும் படிக்கலாம். <strong>முன்னோட்டங்களைக் காட்டு என்பதைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google-ஐத் தட்டுங்கள்.</strong>', hint: 'இது பட்டியலின் கீழ்ப்பகுதிக்கு அருகில் உள்ளது.'},
            {screen: () => list(p, 'Google', [{label: 'உங்கள் Google கணக்கை நிர்வகியுங்கள்'}, {id: 'all-services', label: 'அனைத்துச் சேவைகள்'}, {label: 'காப்புப்பிரதி'}]), target: 'all-services', say: '<strong>அனைத்துச் சேவைகள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'அனைத்துச் சேவைகள்', [{caption: 'தனிப்பட்ட &amp; சாதனப் பாதுகாப்பு'}, {id: 'theft', label: 'திருட்டுப் பாதுகாப்பு'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>திருட்டுப் பாதுகாப்பு என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'திருட்டுப் பாதுகாப்பு', [{id: 'tdl', label: 'திருட்டுக் கண்டறிதல் பூட்டு', toggle: !!c.tdl, sub: 'யாராவது உங்கள் ஃபோனைப் பறித்துக்கொண்டு ஓடுவதை உணர்ந்தால் உங்கள் திரையைப் பூட்டும்.'}, {label: 'ஆஃப்லைன் சாதனப் பூட்டு', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>திருட்டுக் கண்டறிதல் பூட்டை இயக்குங்கள்.</strong> யாராவது உங்கள் ஃபோனைப் பிடுங்கிக்கொண்டு ஓடினால், அது தானாகவே பூட்டிக்கொள்ளும்.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'அடுத்து, பூட்டுத் திரையில் செய்திகளை மறையுங்கள். அமைப்புகளுக்குத் திரும்பி, <strong>அறிவிப்புகளைத் தட்டுங்கள்</strong>.'},
            {screen: c => list(p, 'அறிவிப்புகள்', [{id: 'previews', label: 'பூட்டுத் திரையில் அறிவிப்புகள்', sub: c.previews || 'அனைத்து உள்ளடக்கத்தையும் காட்டு'}, {label: 'அறிவிப்பு வரலாறு'}], {
                overlay: c.pickPrev ? sheet('பூட்டுத் திரையில் அறிவிப்புகள்', [['prev-always', 'அனைத்து உள்ளடக்கத்தையும் காட்டு'], ['prev-unlocked', 'முக்கிய உள்ளடக்கத்தை மறை', 'பரிந்துரைக்கப்பட்டது'], ['prev-never', 'எந்த அறிவிப்பையும் காட்டாதே']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'இப்போது, உங்கள் ஃபோனைத் திறக்காமலேயே பாதுகாப்புக் குறியீடுகள் உட்பட உங்கள் செய்திகளை யார் வேண்டுமானாலும் படிக்கலாம். <strong>பூட்டுத் திரையில் அறிவிப்புகள் என்பதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'அறிவிப்புகள்', [{label: 'முன்னோட்டங்களைக் காட்டு', value: 'எப்போதும்'}], {back: 'அமைப்புகள்', overlay: sheet('முன்னோட்டங்களைக் காட்டு', [['prev-always', 'எப்போதும்'], ['prev-unlocked', 'திறந்திருக்கும்போது', 'பரிந்துரைக்கப்பட்டது'], ['prev-never', 'ஒருபோதுமில்லை']])})
                : list(p, 'அறிவிப்புகள்', [{label: 'பூட்டுத் திரையில் அறிவிப்புகள்', sub: 'அனைத்து உள்ளடக்கத்தையும் காட்டு'}], {overlay: sheet('பூட்டுத் திரையில் அறிவிப்புகள்', [['prev-always', 'அனைத்து உள்ளடக்கத்தையும் காட்டு'], ['prev-unlocked', 'முக்கிய உள்ளடக்கத்தை மறை', 'பரிந்துரைக்கப்பட்டது'], ['prev-never', 'எந்த அறிவிப்பையும் காட்டாதே']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'திறந்திருக்கும்போது' : 'முக்கிய உள்ளடக்கத்தை மறை'}.</strong>`, hints: {'prev-always': 'அது முன்பிருந்த நிலை. பரிந்துரைக்கப்பட்டதைத் தேர்ந்தெடுங்கள்.', 'prev-never': 'அது முழுவதுமாக மறைத்துவிடும், அது எரிச்சலூட்டலாம். பரிந்துரைக்கப்பட்டதைத் தேர்ந்தெடுங்கள்.'}},
        {screen: () => home(p), target: 'phone', say: 'கடைசியாக, உங்கள் ஃபோனின் IMEI எண்ணைக் கண்டுபிடியுங்கள். திருடப்பட்ட ஃபோனைத் தடுக்க உங்கள் நெட்வொர்க்குக்கு அது தேவை. <strong>ஃபோன் செயலியைத் திறங்கள்.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'எண் விசைப்பலகையில் <strong>*#06# எனத் தட்டச்சு செய்யுங்கள்</strong> (நட்சத்திரம், ஹாஷ், பூஜ்யம், ஆறு, ஹாஷ்).', hint: 'கீழ் இடதில் உள்ள நட்சத்திர விசை * இல் தொடங்குங்கள்.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'சாதனத் தகவல்', 'IMEI: 35 209900 176148 1 (பயிற்சி எண்)', [['ok', 'OK']])}),
         target: 'ok', say: 'அந்த நீண்ட எண்தான் உங்கள் <strong>IMEI</strong>. உண்மையான ஃபோனில் அதை எங்காவது பாதுகாப்பான இடத்தில் (ஃபோனில் அல்ல!) எழுதி வையுங்கள். <strong>OK-ஐத் தட்டுங்கள்.</strong>'},
        {screen: () => home(p), question: {q: 'உங்கள் ஃபோன் பறிக்கப்பட்டுவிட்டது. முதலில் யாரை அழைப்பீர்கள்?', options: [
            {t: 'உங்கள் வங்கியை, வேறொருவரின் ஃபோனிலிருந்து', ok: true, why: 'ஆம். திருடர்கள் முதலில் வங்கி செயலிகளைத் தேடுவார்கள். பிறகு ஆன்லைனில் ஃபோனைப் பூட்டி, உங்கள் நெட்வொர்க்கை அழைத்து, 101-இல் புகாரளியுங்கள்.'},
            {t: 'காத்திருந்து அது கிடைக்கிறதா என்று பார்ப்பேன்', why: 'வேகம் முக்கியம். உடனே உங்கள் வங்கியை அழையுங்கள், பிறகு ஃபோனைப் பூட்டி உங்கள் நெட்வொர்க்கை அழையுங்கள்.'}]}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் ஃபோனைத் திருடன் பயன்படுத்துவது இப்போது மிகவும் கடினம்; உங்கள் IMEI-ஐ எங்கே கண்டுபிடிப்பது என்பதும் உங்களுக்குத் தெரியும்.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'FIND MY' : 'டிராக்கர் எச்சரிக்கை', title: p === 'ios' ? 'AirTag உங்களுடன் நகர்வதாகக் கண்டறியப்பட்டது' : 'தெரியாத டிராக்கர் உங்களுடன் பயணிக்கிறது',
            text: '<br>இந்தப் பொருளின் இருப்பிடத்தை அதன் உரிமையாளர் பார்க்க முடியும்.'}),
         target: 'alert', say: 'உங்களுடையது அல்லாத ஒரு டிராக்கர் உங்களுடன் நகர்வதை உங்கள் ஃபோன் கவனித்துள்ளது. பதற்றப்பட வேண்டாம்: அது பெரும்பாலும் ஒரு குடும்ப உறுப்பினருடையதாகத் தவறுதலாக இருக்கும். <strong>எச்சரிக்கையைத் தட்டுங்கள்.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'தெரியாத AirTag' : 'தெரியாத டிராக்கர்', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">இன்று <strong>10:12</strong> முதல் 4 இடங்களில் உங்களுடன் காணப்பட்டது.</p>
            <button type="button" class="ce co" data-tap="play">ஒலி எழுப்பு</button>
            <button type="button" class="cp" data-tap="learn">இந்த ${p === 'ios' ? 'AirTag' : 'டிராக்கர்'} பற்றி அறிக</button>
            <button type="button" class="cp" data-tap="disable">முடக்குவதற்கான வழிமுறைகள்</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'அது உங்களுடன் எங்கெல்லாம் இருந்தது என்பதை வரைபடம் காட்டுகிறது. அதைக் கண்டுபிடிக்க <strong>ஒலி எழுப்பு என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => app(p, p === 'ios' ? 'தெரியாத AirTag' : 'தெரியாத டிராக்கர்', '<p class="cf">⟦volume-2⟧ <strong>ஒலி எழுப்புகிறது…</strong><br>கீச்சிடும் ஒலியைக் கவனியுங்கள்.</p>', {color: '#fff'}),
         question: {q: 'மெல்லிய கீச்சொலி கேட்கிறது. எங்கே தேட வேண்டும்?', options: [
            {t: 'பைகள், கோட் பாக்கெட்டுகள், கார், இரவல் வாங்கிய எதிலும்', ok: true, why: 'ஆம். டிராக்கர்கள் சிறியவை, ஒரு பெரிய நாணயம் அளவு; பெரும்பாலும் உட்புறத் துணி, பாக்கெட்டுகள் அல்லது கார்களில் மறைத்து வைக்கப்படும்.'},
            {t: 'எங்கும் இல்லை, புறக்கணிப்பேன்', why: 'அதைக் கண்டுபிடிப்பது நல்லது. பைகள், பாக்கெட்டுகள், உங்கள் காரைப் பாருங்கள்: அது ஒரு குடும்ப உறுப்பினருடையதாக இருக்கலாம்.'}]}},
        {screen: c => app(p, 'டிராக்கர் கிடைத்தது', `<p class="cf">அதைப் பற்றி மேலும் அறிய உங்கள் ஃபோனின் மேற்பகுதியை டிராக்கர் அருகே பிடியுங்கள்.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">டிராக்கர் அருகே பிடியுங்கள்</button>`, {color: '#fff'}),
         target: 'scan', say: 'உங்கள் கோட்டின் உட்புறத் துணியில் கண்டுபிடித்துவிட்டீர்கள். அது யாருடையது என்று பார்க்க <strong>டிராக்கர் அருகே பிடியுங்கள் என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => app(p, 'இந்த டிராக்கர் பற்றி', '<p class="cf"><strong>தொலைந்த பயன்முறையில் இல்லை</strong><br>வரிசை எண்: P4R7-ACT1CE<br>உரிமையாளர் விவரங்கள் காவல்துறையுடன் மட்டுமே பகிரப்படும்.</p>', {color: '#fff'}),
         question: {q: 'அது ஒரு குடும்ப உறுப்பினருடையது அல்ல, உங்களைப் பின்தொடர யாரோ அதை மறைத்து வைத்தார்கள் என்று கவலைப்படுகிறீர்கள். என்ன செய்வீர்கள்?', options: [
            {t: 'அதைப் பத்திரமாக வைத்துக் காவல்துறையிடம் கொண்டுசெல்வேன் (ஆபத்தில் இருந்தால் 999-ஐ அழைப்பேன்)', ok: true, why: 'ஆம். அதை எறியாதீர்கள்: காவல்துறை அதன் உரிமையாளரைக் கண்டுபிடிக்க முடியும். தேசிய ஸ்டாக்கிங் ஹெல்ப்லைன் எண் 0808 802 0300.'},
            {t: 'குப்பைத்தொட்டியில் போடுவேன்', why: 'அது சான்றாக இருக்கலாம், காவல்துறை உரிமையாளரைக் கண்டுபிடிக்க முடியும். அதை வைத்துக் காவல்துறையிடம் கொண்டுசெல்லுங்கள், ஆபத்தில் இருந்தால் 999-ஐ அழையுங்கள்.'}]}},
        {screen: () => app(p, 'இந்த டிராக்கர் பற்றி', '<p class="cf">உதவி: தேசிய ஸ்டாக்கிங் ஹெல்ப்லைன் 0808 802 0300<br>குடும்ப வன்முறை ஹெல்ப்லைன் (24 மணி நேரம்) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>சபாஷ்!</strong> டிராக்கரைக் கண்டுபிடிப்பது எப்படி என்பதும், என்ன செய்ய வேண்டும் என்பதும் உங்களுக்குத் தெரியும். ' + (p === 'android' ? '<strong>அமைப்புகள் > பாதுகாப்பு &amp; அவசரநிலை > தெரியாத டிராக்கர் எச்சரிக்கைகள்</strong> என்பதில் எச்சரிக்கைகள் இயக்கத்தில் உள்ளனவா எனப் பாருங்கள்.' : 'iPhone-கள் டிராக்கர்களைத் தானாகவே சரிபார்க்கும்.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'நீங்கள் ஒரு குன்றின் பாதையில் இருக்கிறீர்கள், யாரோ கீழே விழுந்துவிட்டார். முகவரி எதுவும் இல்லை. 999-ஐ அழைக்கும்போது, பெரும்பாலான ஃபோன்கள் உங்கள் இருப்பிடத்தைத் தானாகவே அனுப்பும், ஆனால் மூன்று சொற்களும் உதவும். <strong>what3words-ஐத் திறங்கள்.</strong> <em>(பயிற்சிப் பதிப்பு.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'நீலப் புள்ளி நீங்கள்தான். ஒவ்வொரு 3 மீட்டர் சதுரத்துக்கும் அதற்கே உரிய மூன்று சொற்கள் உண்டு. உங்களுடையவை <strong>puffin.chalk.lantern</strong>. புள்ளி நிலைபெறும் வரை சிறிது காத்திருந்து, பிறகு <strong>என் 3 சொற்கள் கிடைத்துவிட்டன என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'இப்போது 999-ஐ அழையுங்கள். <strong>ஃபோன் செயலியைத் திறங்கள்.</strong> <em>(பயிற்சி மட்டுமே: சோதிக்க ஒருபோதும் 999-ஐ அழைக்காதீர்கள்.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>999 எனத் தட்டச்சு செய்யுங்கள்.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>பச்சை அழைப்புப் பட்டனைத் தட்டுங்கள்.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>அவசர அழைப்பு · 0:08</small></div>
            <p class="hi">"அவசரம், எந்தச் சேவை? … ஆம்புலன்ஸ். அவசரநிலை நடக்கும் இடம் சரியாக எது?"</p>${homeIndicator(p)}</div>`,
         question: {q: 'நீங்கள் எங்கே இருக்கிறீர்கள் என்று அழைப்பைக் கையாள்பவர் கேட்கிறார். என்ன சொல்வீர்கள்?', options: [
            {t: '"நான் குன்றின் பாதையில் இருக்கிறேன். என் what3words முகவரி puffin, chalk, lantern."', ok: true, why: 'ஆம். நீங்கள் எங்கே இருக்கிறீர்கள் என்பதை உங்கள் சொந்த வார்த்தைகளில் சொல்லி, பிறகு மூன்று சொற்களைச் சொல்லுங்கள். கேட்டால் எந்தச் சொல்லையும் எழுத்துக் கூட்டிச் சொல்லுங்கள்.'},
            {t: '"எனக்குத் தெரியவில்லை, கடலுக்கு அருகில் எங்கோ"', why: 'அவர்கள் உங்களைக் கண்டுபிடிக்க முயல்வார்கள், ஆனால் மூன்று சொற்கள் உங்களை 3 மீட்டருக்குள் துல்லியமாகக் காட்டும். செயலியிலிருந்து அவற்றைப் படித்துச் சொல்லுங்கள்.'}]}},
        {screen: () => home(p), question: {q: 'ஒரு நண்பருக்குக் காது கேட்காது, குரல் அழைப்புகள் செய்ய முடியாது. அவர் 999-ஐ எப்படித் தொடர்புகொள்ளலாம்?', options: [
            {t: 'இப்போதே அவசரக் குறுஞ்செய்திக்குப் பதிவு செய்யலாம் (999-க்கு "register" எனக் குறுஞ்செய்தி அனுப்புங்கள்), அல்லது 999 BSL செயலியைப் பயன்படுத்தலாம்', ok: true, why: 'ஆம். அவசரக் குறுஞ்செய்தி முதலில் பதிவு செய்தால் மட்டுமே வேலை செய்யும். 999 BSL செயலி சைகை மொழி மொழிபெயர்ப்பாளருடன் இணைக்கும்.'},
            {t: 'அவர்களால் முடியாது', why: 'முடியும். 999-க்கு "register" எனக் குறுஞ்செய்தி அனுப்பி அவசரக் குறுஞ்செய்திக்குப் பதிவு செய்யலாம், அல்லது இலவச 999 BSL செயலியைப் பயன்படுத்தலாம்.'}]}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> நினைவில் வையுங்கள்: நீங்கள் எங்கே இருக்கிறீர்கள் என்று சொல்லி, பிறகு உங்கள் மூன்று சொற்களைச் சொல்லுங்கள். உங்கள் சொற்களைக் கண்டுபிடிக்க what3words செயலி சிக்னல் இல்லாமலும் வேலை செய்யும், ஆனால் அழைக்க உங்களுக்கு சிக்னல் தேவை.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>பதிலளிக்கவில்லை</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'உங்கள் ஃபோன் சிக்கிக்கொண்டது: தட்டினால் எதுவும் நடக்கவில்லை, வழக்கமான முறையில் அணையவும் இல்லை. இது பெரிய பிரச்சினையா?', options: [
            {t: 'பொதுவாக இல்லை. "வலுக்கட்டாய மறுதொடக்கம்" அதைச் சரிசெய்யும், எதையும் இழக்க மாட்டீர்கள்', ok: true, why: 'சரி. வலுக்கட்டாய மறுதொடக்கம் என்பது சுவரில் உள்ள சுவிட்சை அணைப்பது போன்றது. உங்கள் புகைப்படங்களும் செய்திகளும் பாதுகாப்பாக உள்ளன.'},
            {t: 'ஆம், அது பழுதடைந்துவிட்டது', why: 'பொதுவாக இல்லை! வலுக்கட்டாய மறுதொடக்கம் பெரும்பாலான உறைந்த ஃபோன்களைச் சரிசெய்யும், எதையும் இழக்க மாட்டீர்கள்.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'iPhone-இல்: <strong>ஒலியளவு கூட்டு பட்டனை அழுத்தி விடுங்கள்</strong>, பிறகு <strong>ஒலியளவு குறை பட்டனை அழுத்தி விடுங்கள்</strong>, பிறகு Apple லோகோ தோன்றும் வரை (சுமார் 10 விநாடிகள்) <strong>பக்கவாட்டு பட்டனை அழுத்திப் பிடியுங்கள்</strong>. இங்கே, அவற்றை அந்த வரிசையில் தட்டுங்கள்.'
            : 'பெரும்பாலான Android ஃபோன்களில்: அது மறுதொடங்கும் வரை, சுமார் 10 விநாடிகளுக்கு <strong>பவர் பட்டனையும் ஒலியளவு குறை பட்டனையும் சேர்த்து அழுத்திப் பிடியுங்கள்</strong>. இங்கே பவர், பிறகு ஒலியளவு குறை என்பதைத் தட்டுங்கள். <em>(Google Pixel: பவர் பட்டனை மட்டும் 30 விநாடிகள் பிடியுங்கள்.)</em>',
         hints: {'vol-down': p === 'ios' ? 'ஒலியளவு கூட்டு முதலில் வரும்.' : 'பவர் பட்டனில் தொடங்குங்கள்.', side: 'பக்கவாட்டு பட்டன் கடைசி, இரண்டு ஒலியளவு பட்டன்களுக்குப் பிறகு.'},
         hint: p === 'ios' ? 'ஒலியளவு கூட்டு, பிறகு ஒலியளவு குறை, பிறகு பக்கவாட்டு பட்டன்.' : 'பவர், பிறகு ஒலியளவு குறை.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'லோகோ தோன்றிவிட்டது. இப்போது என்ன?', options: [
            {t: 'விட்டுவிட்டு, அது தொடங்கும் வரை காத்திருப்பேன்', ok: true, why: 'ஆம். ஒரு நிமிடம் ஆகும். ஒருமுறை உங்கள் கடவுக்குறியீட்டைத் தட்டச்சு செய்ய வேண்டியிருக்கலாம்.'},
            {t: 'எல்லாப் பட்டன்களையும் தொடர்ந்து அழுத்திக்கொண்டிருப்பேன்', why: 'லோகோ தோன்றியதும் விட்டுவிட்டு, தொடங்க ஒரு நிமிடம் கொடுங்கள்.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் ஃபோன் மறுதொடங்கிவிட்டது. அது தொடர்ந்து உறைந்தால், புதுப்பிப்புகளைச் சரிபார்த்து சேமிப்பிடத்தை விடுவியுங்கள். வாரத்துக்கு ஒருமுறை ஃபோனை மறுதொடங்கினால் அது சீராக இயங்கும்.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'ஆன்' : 'ஆஃப்'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'ஆஃப்' : (ctx.signal ? 'ஆன் · 4G' : 'சேவை இல்லை')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'ஆஃப்' : 'முகப்பு'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'மூட மேலே ஸ்வைப் செய்யுங்கள்' : 'மூடு'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">சேவை இல்லை</span>'), target: 'pull-down',
         say: 'இன்று காலை வேலை செய்தும் உங்கள் ஃபோன் <strong>சேவை இல்லை</strong> என்று காட்டுகிறது. ஏர்பிளேன் பயன்முறையை இயக்கி அணைப்பது ஒரு விரைவான தீர்வு; அது மீண்டும் இணைய வைக்கும். ' + (p === 'ios' ? '<strong>மேல் வலது மூலையிலிருந்து கீழே ஸ்வைப் செய்யுங்கள்</strong> (அல்லது பட்டையைத் தட்டுங்கள்).' : '<strong>மேலிருந்து கீழே ஸ்வைப் செய்யுங்கள்</strong> (அல்லது பட்டையைத் தட்டுங்கள்).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: 'இயக்க <strong>ஏர்பிளேன் பயன்முறையைத் தட்டுங்கள்</strong>. வயர்லெஸ் அனைத்தும் அணைந்துவிடும்.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'சுமார் 10 விநாடிகள் காத்திருங்கள்… பிறகு அணைக்க <strong>ஏர்பிளேன் பயன்முறையை மீண்டும் தட்டுங்கள்</strong>.'},
        {screen: c => quickPanel(p, c), question: {q: 'மொபைல் டேட்டா 4G-இல் மீண்டும் இயங்குகிறது. ஏர்பிளேன் பயன்முறை வேறு எப்போது வசதியானது?', options: [
            {t: 'விமானத்தில், அல்லது வெளிநாட்டில் ரோமிங் கட்டணங்களைத் தவிர்க்க (Wi-Fi-ஐ இன்னும் இயக்கலாம்)', ok: true, why: 'ஆம். ஏர்பிளேன் பயன்முறை இயக்கத்தில் இருக்கும்போதே, ஹோட்டல் அல்லது கப்பல் Wi-Fi-ஐப் பயன்படுத்த Wi-Fi-ஐ மீண்டும் இயக்கலாம்.'},
            {t: 'ஃபோனை சார்ஜ் செய்ய', why: 'அது சற்று வேகமாக சார்ஜ் ஆகும், ஆனால் முக்கியமாக விமானப் பயணங்களுக்கும் வெளிநாட்டில் ரோமிங் கட்டணங்களைத் தவிர்ப்பதற்கும்தான்.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>சபாஷ்!</strong> ஏர்பிளேன் பயன்முறை அதைச் சரிசெய்யாவிட்டால், ஃபோனை மறுதொடங்குங்கள். இன்னும் சேவை இல்லையா? உங்கள் பகுதியில் ஏதேனும் சிக்கல்கள் உள்ளனவா என்று உங்கள் நெட்வொர்க்கின் இணையதளத்தில் பாருங்கள்.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · இப்போது</strong><span>🎁 உங்கள் இலவச உயிர்கள் காத்திருக்கின்றன! திரும்பி வந்து விளையாடுங்கள்! 🎉</span></button>',
         target: 'settings', say: 'ஒரு கேம் அர்த்தமற்ற செய்திகளால் தொடர்ந்து அதிர்கிறது. எந்த செயலிக்கும் அறிவிப்புகளை அணைக்கலாம். செய்தியை அல்ல, <strong>அமைப்புகளைத் தட்டுங்கள்</strong>.', hints: {notif: 'அது கேமைத் திறக்கும். அதற்குப் பதிலாக அமைப்புகளைத் தட்டுங்கள்.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>அறிவிப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'அறிவிப்புகள்', [{label: 'முன்னோட்டங்களைக் காட்டு', value: 'திறந்திருக்கும்போது'}, {caption: 'அறிவிப்பு பாணி'}, {id: 'bubble', label: 'Bubble Pop', sub: 'பேனர்கள், ஒலிகள், பேட்ஜ்கள்'}, {label: 'செய்திகள்', sub: 'பேனர்கள், ஒலிகள், பேட்ஜ்கள்'}, {label: 'WhatsApp', sub: 'பேனர்கள், ஒலிகள், பேட்ஜ்கள்'}], {back: 'அமைப்புகள்'})
            : list(p, 'அறிவிப்புகள்', [{id: 'app-notifs', label: 'செயலி அறிவிப்புகள்'}, {id: 'history', label: 'அறிவிப்பு வரலாறு'}, {label: 'பூட்டுத் திரையில் அறிவிப்புகள்'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Bubble Pop-ஐத் தட்டுங்கள்.</strong>' : '<strong>செயலி அறிவிப்புகள் என்பதைத் தட்டுங்கள்.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'செயலி அறிவிப்புகள்', [{label: 'செய்திகள்', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: 'அதன் அறிவிப்புகளை அணைக்க <strong>Bubble Pop அருகில் உள்ள சுவிட்சைத் தட்டுங்கள்</strong>.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'அறிவிப்புகளை அனுமதி', toggle: !c.off}], {back: 'அறிவிப்புகள்'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>அறிவிப்புகளை அனுமதி என்பதை அணையுங்கள்.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'அறிவிப்புகள்', [{label: 'செயலி அறிவிப்புகள்'}, {id: 'history', label: 'அறிவிப்பு வரலாறு', sub: 'ஆஃப்'}]), target: 'history',
             say: 'கூடுதல் வசதி: தவறுதலாக ஒரு செய்தியை ஸ்வைப் செய்து அகற்றிவிட்டால், அறிவிப்பு வரலாறு அதன் நகலை வைத்திருக்கும். <strong>அறிவிப்பு வரலாற்றைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'அறிவிப்பு வரலாறு', [{id: 'hist-toggle', label: 'அறிவிப்பு வரலாற்றைப் பயன்படுத்து', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>அதை இயக்குங்கள்.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'எந்த செயலிகளின் அறிவிப்புகளை இயக்கத்திலேயே வைத்திருப்பது நல்லது?', options: [
            {t: 'செய்திகள், அழைப்புகள், WhatsApp, உங்கள் வங்கி, உடனே தெரிந்துகொள்ள விரும்பும் எதுவும்', ok: true, why: 'ஆம். முக்கியமானவற்றை வைத்திருங்கள்; கேம்ஸ், கடைகள், தொல்லை தரும் எதையும் அணையுங்கள்.'},
            {t: 'எல்லாவற்றையும் அணைப்பேன்', why: 'செய்திகளையும் அழைப்புகளையும் தவறவிடுவீர்கள்! முக்கியமானவற்றை வைத்திருங்கள்; கேம்ஸ், ஷாப்பிங் செயலிகளை அணையுங்கள்.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>சபாஷ்!</strong> Bubble Pop இனி உங்களைத் தொந்தரவு செய்யாது. ' + (p === 'ios' ? 'தவறுதலாக ஒரு செய்தியை ஸ்வைப் செய்து அகற்றிவிட்டால், முந்தையவற்றைப் பார்க்க பூட்டுத் திரையின் நடுவிலிருந்து மேலே ஸ்வைப் செய்யுங்கள்.' : 'நீங்கள் ஸ்வைப் செய்து அகற்றும் எதன் நகலையும் அறிவிப்பு வரலாறு வைத்திருக்கும்.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>ducking garden centre-இல் சந்திப்போம் x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">குறுஞ்செய்தி</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'நீங்கள் "Dunnington garden centre" எனத் தட்டச்சு செய்தீர்கள், உங்கள் ஃபோன் அதை மாற்றிவிட்டது. ஏன்?', options: [
            {t: 'தானியங்கித் திருத்தம் தவறான சொல்லை ஊகித்தது', ok: true, why: 'ஆம். தானியங்கித் திருத்தம் தனக்குத் தெரியாத சொற்களை மாற்றிவிடும். அதை அணைக்கலாம், அல்லது புதிய சொற்களைக் கற்றுக்கொடுக்கலாம்.'},
            {t: 'ஃபோன் பழுதடைந்துவிட்டது', why: 'இது தானியங்கித் திருத்தத்தின் ஊகம் மட்டுமே. அதை அணைக்கலாம் அல்லது சொற்களைக் கற்றுக்கொடுக்கலாம்.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>பொது என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'பொது', [{label: 'பற்றி'}, {label: 'மென்பொருள் புதுப்பிப்பு'}, {id: 'keyboard', label: 'கீபோர்டு'}, {label: 'மொழி &amp; பிராந்தியம்'}], {back: 'அமைப்புகள்'}), target: 'keyboard', say: '<strong>கீபோர்டைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'கீபோர்டுகள்', [{id: 'replace', label: 'உரை மாற்றீடு'}, {caption: 'அனைத்து கீபோர்டுகள்'}, {label: 'தானியங்கிப் பெரிய எழுத்து', toggle: true}, {id: 'ac', label: 'தானியங்கித் திருத்தம்', toggle: !c.acOff}, {label: 'முன்கணிப்பு உரை', toggle: true}], {back: 'பொது'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>தானியங்கித் திருத்தத்தை அணையுங்கள்.</strong> எழுத்துப் பிழைகளுக்கு இன்னும் சிவப்புக் கோடு இடப்படும், எனவே நீங்களே திருத்திக்கொள்ளலாம்.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>சிஸ்டத்தைத் தட்டுங்கள்.</strong> அது கீழே உள்ளது.'},
            {screen: () => list(p, 'சிஸ்டம்', [{id: 'keyboard', label: 'கீபோர்டு'}, {label: 'மொழிகள்'}, {label: 'தேதி &amp; நேரம்'}]), target: 'keyboard', say: '<strong>கீபோர்டைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'கீபோர்டு', [{id: 'gboard', label: 'Gboard', sub: 'திரை கீபோர்டு'}]), target: 'gboard', say: '<strong>Gboard-ஐத் தட்டுங்கள்.</strong> <em>Samsung-இல் இது Samsung Keyboard > ஸ்மார்ட் டைப்பிங்.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'விருப்பத்தேர்வுகள்'}, {id: 'correction', label: 'உரைத் திருத்தம்'}, {label: 'இழுத்துத் தட்டச்சு'}]), target: 'correction', say: '<strong>உரைத் திருத்தத்தைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'உரைத் திருத்தம்', [{label: 'பரிந்துரைப் பட்டையைக் காட்டு', toggle: true}, {id: 'ac', label: 'தானியங்கித் திருத்தம்', toggle: !c.acOff}, {label: 'எழுத்துப்பிழைச் சரிபார்ப்பு', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>தானியங்கித் திருத்தத்தை அணையுங்கள்.</strong> எழுத்துப் பிழைகளுக்கு இன்னும் சிவப்புக் கோடு இடப்படும், எனவே நீங்களே திருத்திக்கொள்ளலாம்.'},
        ]),
        {screen: () => home(p), question: {q: 'தானியங்கித் திருத்தத்தை வைத்திருக்க விரும்புகிறீர்கள், ஆனால் அது எப்போதும் "Dunnington" என்பதை மாற்றிவிடுகிறது. வேறு என்ன செய்யலாம்?', options: [
            {t: 'ஃபோனின் அகராதியில் சேர்ப்பேன், அப்போது அது அந்தச் சொல்லைக் கற்றுக்கொள்ளும்', ok: true, why: 'Yes. ' + (p === 'ios' ? 'அதே கீபோர்டு அமைப்புகளில் உரை மாற்றீட்டைப் பயன்படுத்துங்கள்.' : 'பரிந்துரைப் பட்டையில் உள்ள சொல்லைத் தட்டி, அதை உங்கள் அகராதியில் சேர்க்கத் தேர்ந்தெடுங்கள்.')},
            {t: 'எதுவும் இல்லை, சகித்துக்கொள்வேன்', why: 'நீங்கள் அதற்குக் கற்றுக்கொடுக்கலாம்: ' + (p === 'ios' ? 'கீபோர்டு > உரை மாற்றீடு என்பதில் அந்தச் சொல்லைச் சேருங்கள்.' : 'பரிந்துரைகளில் உள்ள சொல்லைத் தட்டி, அதை உங்கள் அகராதியில் சேருங்கள்.')}]}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> இனி எதிர்பாராத சொல் மாற்றங்கள் இல்லை. அதே இடத்தில் எப்போது வேண்டுமானாலும் மீண்டும் இயக்கலாம்.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'உங்களிடம் புதிய வயர்லெஸ் ஹெட்ஃபோன்கள் உள்ளன. முதலில் என்ன செய்வீர்கள்?', options: [
            {t: 'அவற்றை "இணைப்புப் பயன்முறையில்" வைப்பேன் (பொதுவாக ஒளி மினுங்கும் வரை பட்டனை அழுத்திப் பிடிப்பது)', ok: true, why: 'ஆம். இணைப்புப் பயன்முறை உங்கள் ஃபோன் அவற்றைக் கண்டுபிடிக்க உதவும். பெட்டியில் உள்ள வழிமுறைகள் சரியாக எப்படி என்று சொல்லும்.'},
            {t: 'அவற்றை ஃபோனில் செருகுவேன்', why: 'வயர்லெஸ் ஹெட்ஃபோன்கள் Bluetooth மூலம் இணைகின்றன. முதலில் அவற்றை இணைப்புப் பயன்முறையில் வையுங்கள், பொதுவாக ஒளி மினுங்கும் வரை பட்டனை அழுத்திப் பிடிப்பதன் மூலம்.'}]}},
        {screen: () => home(p), target: 'settings', say: 'ஹெட்ஃபோன்களின் ஒளி மினுங்குகிறது. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Bluetooth-ஐத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>இணைக்கப்பட்ட சாதனங்களைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'இணைக்கப்பட்ட சாதனங்கள்', [{id: 'pair', label: '＋ புதிய சாதனத்தை இணை'}, {label: 'சேமிக்கப்பட்ட சாதனங்கள்', sub: 'கார்'}]), target: 'pair', say: '<strong>புதிய சாதனத்தை இணை என்பதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'புளூடூத்' : 'புதிய சாதனத்தை இணை', [{label: 'புளூடூத்', toggle: true}, {caption: p === 'ios' ? 'என் சாதனங்கள்' : 'சேமிக்கப்பட்டது'}, {label: 'கார்', sub: 'இணைக்கப்படவில்லை'},
            {caption: p === 'ios' ? 'பிற சாதனங்கள்' : 'கிடைக்கும் சாதனங்கள்'}, {id: 'headphones', label: '⟦headphones⟧ பயிற்சி ஹெட்ஃபோன்கள்'}, {label: 'அண்டை வீட்டாரின் டிவி'}], {back: 'அமைப்புகள்'}),
         target: 'headphones', say: 'உங்கள் ஃபோன் அருகிலுள்ள சாதனங்களைத் தேடுகிறது. <strong>Practice Headphones-ஐத் தட்டுங்கள்.</strong>', hints: {}},
        {screen: () => list(p, 'புளூடூத்', [{label: 'புளூடூத்', toggle: true}, {caption: 'என் சாதனங்கள்'}, {label: '⟦headphones⟧ பயிற்சி ஹெட்ஃபோன்கள்', sub: 'இணைக்கப்பட்டது ⟦check⟧'}, {label: 'கார்', sub: 'இணைக்கப்படவில்லை'}], {back: 'அமைப்புகள்'}),
         question: {q: 'அடுத்த முறை ஹெட்ஃபோன்களை இயக்கும்போது, இதை மீண்டும் செய்ய வேண்டுமா?', options: [
            {t: 'இல்லை, இனி அவை தாமாகவே இணையும்', ok: true, why: 'ஆம். ஒருமுறை மட்டுமே இணைக்க வேண்டும். அதன் பிறகு அவை இயக்கத்தில் இருந்து அருகில் இருக்கும்போது தானாக இணையும்.'},
            {t: 'ஆம், ஒவ்வொரு முறையும்', why: 'ஒருமுறை மட்டுமே இணைக்க வேண்டும். அதன் பிறகு அவை தாமாகவே இணையும்.'}]}},
        {screen: () => list(p, 'புளூடூத்', [{label: '⟦headphones⟧ பயிற்சி ஹெட்ஃபோன்கள்', sub: 'இணைக்கப்பட்டது ⟦check⟧'}], {back: 'அமைப்புகள்'}), done: true,
         say: '<strong>சபாஷ்!</strong> கார், ஸ்பீக்கர் அல்லது செவிப்புலன் கருவிகளுக்கும் இதே படிகள்தான். ஏதாவது இணையவில்லையென்றால், Bluetooth-ஐ அணைத்து இயக்கி, சாதனத்தை மீண்டும் இணைப்புப் பயன்முறையில் வையுங்கள்.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">"${ctx.said || 'பாட்டி? நான் Tom! என் ஃபோன் தொலைந்துவிட்டது, நான் சிக்கலில் இருக்கிறேன். இன்றே அபராதம் கட்ட £400 வேண்டும். தயவுசெய்து அம்மாவிடம் சொல்லாதீர்கள்!'}"</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">குடும்பப் பாதுகாப்புச் சொற்றொடரைக் கேளுங்கள்</button><button type="button" data-tap="send-money">பணம் அனுப்புவதாகச் சொல்லுங்கள்</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'தெரியாத எண் அழைக்கிறது. என்ன செய்வது என்று பழக, <strong>பதிலளியுங்கள்</strong>.', hints: {decline: 'நிஜ வாழ்க்கையில் நிராகரிப்பதும் சரிதான்! இந்தப் பயிற்சிக்கு, பதிலளி என்பதைத் தட்டுங்கள்.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'ஏ… என்ன? பாட்டி, அதற்கெல்லாம் நேரமில்லை! தயவுசெய்து, எனக்கு இப்போதே பணம் வேண்டும்!'; },
         say: 'அது உங்கள் பேரன் Tom குரல் போலவே இருக்கிறது. ஆனால் மோசடிக்காரர்கள் குரல்களை நகலெடுக்க முடியும். உங்கள் குடும்பம் ஒரு <strong>பாதுகாப்புச் சொற்றொடர்</strong> ஒப்புக்கொண்டுள்ளது. <strong>அதைக் கேளுங்கள்.</strong>',
         hints: {'send-money': 'இது போன்ற அழைப்பில் பணம் அனுப்ப ஒருபோதும் ஒப்புக்கொள்ளாதீர்கள். பாதுகாப்புச் சொற்றொடரைக் கேளுங்கள்.', end: 'துண்டிப்பதும் சரிதான்! ஆனால் முதலில் பாதுகாப்புச் சொற்றொடரைக் கேட்கப் பழகுங்கள்.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'அவர்களுக்கு அது தெரியவில்லை, மேலும் கடுமையாக வற்புறுத்துகிறார்கள். அவர் ஒரு மோசடிக்காரர். சிவப்புப் பட்டனால் <strong>துண்டியுங்கள்</strong>.', hints: {'send-money': 'வேண்டாம்! அவர்களுக்குச் சொற்றொடர் தெரியவில்லை. துண்டியுங்கள்.', 'ask-phrase': 'நீங்கள் கேட்டீர்கள், அவர்களால் பதிலளிக்க முடியவில்லை. துண்டியுங்கள்.'}},
        {screen: () => home(p), question: {q: 'Tom பற்றி உங்களுக்கு இன்னும் சிறிது கவலை இருக்கிறது. என்ன செய்வீர்கள்?', options: [
            {t: 'Tom-ஐ (அல்லது அவர் அம்மாவை) உங்களிடம் ஏற்கெனவே உள்ள எண்ணில் அழைப்பேன்', ok: true, why: 'ஆம். எப்போதும் உங்களுக்குத் தெரிந்த எண்ணில் திருப்பி அழையுங்கள். உண்மையான Tom நன்றாகவே இருப்பார், நீங்கள் சரிபார்ப்பதை அவர் தவறாக நினைக்க மாட்டார்.'},
            {t: 'உங்களை அழைத்த எண்ணைத் திருப்பி அழைப்பேன்', why: 'அது மீண்டும் மோசடிக்காரரிடமே சென்றுவிடும். Tom-ஐ உங்களிடம் ஏற்கெனவே உள்ள எண்ணில் அழையுங்கள்.'}]}},
        {screen: () => home(p), target: 'phone', say: 'ஓர் அழைப்பு உங்கள் வங்கிக் கணக்கைப் பற்றியதாக இருந்தால், உங்கள் சொந்த வங்கியைப் பாதுகாப்பாகத் தொடர்புகொள்ள <strong>159</strong>-ஐ அழைக்கலாம். பழக <strong>ஃபோன் செயலியைத் திறங்கள்</strong>.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>159 எனத் தட்டச்சு செய்யுங்கள்.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>பச்சை அழைப்புப் பட்டனைத் தட்டுங்கள்.</strong> <em>(பயிற்சி மட்டுமே: எதுவும் அழைக்கப்படாது.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">"159-க்கு வரவேற்கிறோம். உங்கள் வங்கியின் பெயரைச் சொல்லுங்கள், நாங்கள் உங்களை இணைப்போம்."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>சபாஷ்!</strong> 159 உங்களை உங்கள் உண்மையான வங்கியுடன் இணைக்கும். குடும்பத்துடன் நேரில் ஒரு பாதுகாப்புச் சொற்றொடரை ஒப்புக்கொள்ளுங்கள், அதை ஆன்லைனில் ஒருபோதும் பதிவிடாதீர்கள்.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'வணக்கம்' : 'ஹாய்'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'திறக்க மேலே ஸ்வைப் செய்யுங்கள்' : 'தொடங்கு'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `உங்கள் புதிய ஃபோன் பெட்டியிலிருந்து வெளியே எடுக்கப்பட்டு இயக்கப்பட்டுள்ளது. உங்கள் <strong>பழைய ஃபோனை</strong> அருகில், சார்ஜ் செய்து, Wi-Fi-இல் வைத்திருங்கள். <strong>${p === 'ios' ? 'திறக்க மேலே ஸ்வைப் செய்யுங்கள்' : 'தொடங்கு'}-ஐத் தட்டுங்கள்.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Quick Start' : 'செயலிகள் &amp; தரவை நகலெடு', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'உங்கள் Apple Account மூலம் இதை அமைக்க, உங்கள் பழைய iPhone-ஐ இதற்கு அருகே கொண்டுவாருங்கள்.' : 'உங்கள் செயலிகள், புகைப்படங்கள், தொடர்புகள் மற்றும் பலவற்றை உங்கள் பழைய ஃபோனிலிருந்து நகலெடுங்கள்.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'உங்கள் பழைய iPhone-இல் தொடருங்கள்' : 'உங்கள் பழைய சாதனத்தைப் பயன்படுத்து'}</button>
            <button type="button" class="cp" data-tap="manual">அதற்குப் பதிலாக கைமுறையாக அமை</button>`}),
         target: 'use-old', say: 'பழைய ஃபோனிலிருந்து நகலெடுத்தால் எல்லாவற்றையும் மீண்டும் அமைக்க வேண்டியதில்லை. <strong>இதைத் தட்டுங்கள்: ' + (p === 'ios' ? 'உங்கள் பழைய iPhone-இல் தொடருங்கள்' : 'உங்கள் பழைய சாதனத்தைப் பயன்படுத்து') + '.</strong>', hints: {manual: 'நீங்கள் அப்படிச் செய்யலாம், ஆனால் நகலெடுப்பது மிகவும் எளிது. மற்றொரு பட்டனைத் தட்டுங்கள்.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">உங்கள் <strong>பழைய</strong> ஃபோனில் ஒரு செய்தி தோன்றும். அதன் கேமராவை இந்த வடிவத்தின் பக்கம் காட்டுங்கள்.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">பழைய ஃபோன் ஸ்கேன் செய்துவிட்டது</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'பழைய ஃபோனில் தொடர் என்பதைத் தட்டி, கேமரா பார்க்கும்படி இந்த வடிவத்தின் மேல் பிடியுங்கள். இங்கே <strong>பழைய ஃபோன் ஸ்கேன் செய்துவிட்டது என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => codeScreen(p, c, 'உங்கள் பழைய ஃபோனின் கடவுக்குறியீட்டை உள்ளிடுங்கள்', 'இது உங்கள் அமைப்புகளைப் பாதுகாப்பாக நகலெடுக்கும்.'), sequence: CODE_KEYS,
         say: `உங்கள் பழைய ஃபோனின் கடவுக்குறியீட்டைத் தட்டச்சு செய்யுங்கள். பயிற்சிக்கு, <strong>${codeText}</strong> ஐப் பயன்படுத்துங்கள்.`, hint: `பயிற்சிக் குறியீடு ${codeText}-ஐத் தட்டச்சு செய்யுங்கள்.`},
        {screen: () => list(p, 'உங்கள் தரவை மாற்றுங்கள்', [], {noBack: true, top: `<p class="cf">எதைக் கொண்டுவர வேண்டும் என்பதைத் தேர்ந்தெடுங்கள்:</p>
            <div class="cj ex"><span>புகைப்படங்களும் வீடியோக்களும்</span>${tog(true)}</div><div class="cj ex"><span>தொடர்புகளும் செய்திகளும்</span>${tog(true)}</div><div class="cj ex"><span>செயலிகள்</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">தொடர்</button>`}),
         target: 'transfer', say: 'எல்லாம் குறியிடப்பட்டுள்ளது. <strong>தொடர் என்பதைத் தட்டுங்கள்.</strong> இரண்டு ஃபோன்களையும் அருகருகே, மின்சாரத்தில் இணைத்து வைத்திருங்கள்.'},
        {screen: c => list(p, 'மாற்றுகிறது…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'சுமார் 25 நிமிடங்கள் மீதம்' : 'மாற்றம் முடிந்தது ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'மாற்றம் முடிந்தது. பழைய ஃபோனை என்ன செய்ய வேண்டும்?', options: [
            {t: 'எதுவும் விடுபடவில்லையா எனப் பார்க்க ஒரு வாரம் வைத்திருந்து, விற்பதற்கோ மறுசுழற்சி செய்வதற்கோ முன் சரியாக அழிப்பேன்', ok: true, why: 'ஆம். புதிய ஃபோனில் உங்கள் புகைப்படங்கள், WhatsApp, வங்கி செயலிகள் வேலை செய்கின்றனவா என்று முதலில் பாருங்கள். பழையதை எப்படி அழிப்பது என்று அடுத்த பாடம் காட்டும்.'},
            {t: 'உடனே குப்பைத்தொட்டியில் எறிவேன்', why: 'அதில் இன்னும் உங்கள் எல்லாத் தகவல்களும் உள்ளன! புதிய ஃபோனில் எல்லாம் உள்ளதா எனப் பார்த்து, பிறகு பழையதைச் சரியாக அழியுங்கள்.'}]}},
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் புதிய ஃபோனில் உங்கள் புகைப்படங்கள், தொடர்புகள், செயலிகள் உள்ளன. வங்கி, WhatsApp போன்ற சில செயலிகள் மீண்டும் உள்நுழையக் கேட்கும்; உங்கள் விவரங்களைத் தயாராக வைத்திருங்கள்.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'பழைய ஃபோனை விற்கிறீர்களா, தருகிறீர்களா, மறுசுழற்சி செய்கிறீர்களா? இவற்றைச் சரியான வரிசையில் செய்யுங்கள், இல்லையென்றால் அடுத்த உரிமையாளரால் அதைப் பயன்படுத்த முடியாது. <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'படி 1: உங்கள் Apple Account-இலிருந்து வெளியேறுங்கள். <strong>உங்கள் பெயரைத் தட்டுங்கள்</strong>.'},
            {screen: c => list(p, 'Apple Account', [{label: 'தனிப்பட்ட தகவல்'}, {label: 'உள்நுழைவு &amp; பாதுகாப்பு'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'வெளியேறு', danger: true}], {back: 'அமைப்புகள்',
                overlay: c.ask ? dialog(p, 'வெளியேறவா?', 'Find My-ஐ அணைக்க உங்கள் கடவுச்சொல் தேவை. (பயிற்சி: உங்களுக்காக உள்ளிடப்பட்டது.)', [['cancel', 'ரத்துசெய்'], ['turn-off', 'அணை']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'கீழே உருட்டி <strong>வெளியேறு என்பதைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'Apple Account', [{label: 'வெளியேறு', danger: true}], {back: 'அமைப்புகள்', overlay: dialog(p, 'வெளியேறவா?', 'Find My-ஐ அணைக்க உங்கள் கடவுச்சொல் தேவை. (பயிற்சி: உங்களுக்காக உள்ளிடப்பட்டது.)', [['cancel', 'ரத்துசெய்'], ['turn-off', 'அணை']])}),
             target: 'turn-off', say: 'இது <strong>Find My</strong>-ஐ அணைக்கும்; இல்லையென்றால் ஃபோன் உங்களுக்கே பூட்டப்பட்டிருக்கும். <strong>அணை என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'படி 2: அதை அழியுங்கள். <strong>பொது என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'பொது', [{label: 'பற்றி'}, {label: 'iPhone சேமிப்பகம்'}, {id: 'reset', label: 'iPhone-ஐ மாற்று அல்லது மீட்டமை'}], {back: 'அமைப்புகள்'}), target: 'reset', say: 'கீழே உள்ள <strong>iPhone-ஐ மாற்று அல்லது மீட்டமை என்பதைத் தட்டுங்கள்</strong>.'},
            {screen: c => list(p, 'iPhone-ஐ மாற்று அல்லது மீட்டமை', [{label: 'மீட்டமை'}, {id: 'erase', label: 'அனைத்து உள்ளடக்கத்தையும் அமைப்புகளையும் அழி'}], {back: 'பொது',
                overlay: c.askErase ? dialog(p, 'இந்த iPhone-ஐ அழிக்கவா?', 'எல்லாப் புகைப்படங்களும் செய்திகளும் செயலிகளும் நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-erase', 'அழி']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>அனைத்து உள்ளடக்கத்தையும் அமைப்புகளையும் அழி என்பதைத் தட்டுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'படி 1: உங்கள் Google கணக்கை அகற்றுங்கள். <strong>Google-ஐத் தட்டுங்கள்</strong>. <em>(Samsung-இல், உங்கள் Samsung கணக்கையும் அகற்றுங்கள்.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'உங்கள் Google கணக்கை நிர்வகியுங்கள்'}, {id: 'accounts', label: 'இந்தச் சாதனத்தில் உள்ள கணக்குகள்', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>இந்தச் சாதனத்தில் உள்ள கணக்குகள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'Google கணக்கு', [{label: 'margaret.smith@example.com'}, {label: 'கணக்கு ஒத்திசைவு'}, {id: 'remove', label: 'கணக்கை அகற்று', danger: true}], {overlay: c.ask ? dialog(p, 'கணக்கை அகற்றவா?', 'அகற்றினால் அதன் செய்திகள், தொடர்புகள், தரவு இந்த ஃபோனிலிருந்து நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-remove', 'கணக்கை அகற்று']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'இது இல்லாவிட்டால், மீட்டமைத்த பிறகும் ஃபோன் உங்கள் கணக்குக்கே பூட்டப்பட்டிருக்கும். <strong>கணக்கை அகற்று என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'கணக்கு', [{label: 'கணக்கை அகற்று', danger: true}], {overlay: dialog(p, 'கணக்கை அகற்றவா?', 'அகற்றினால் அதன் செய்திகள், தொடர்புகள், தரவு இந்த ஃபோனிலிருந்து நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-remove', 'கணக்கை அகற்று']])}),
             target: 'confirm-remove', say: '<strong>கணக்கை அகற்று என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'படி 2: அதை அழியுங்கள். கீழே உள்ள <strong>சிஸ்டத்தைத் தட்டுங்கள்</strong>.'},
            {screen: () => list(p, 'சிஸ்டம்', [{label: 'மொழிகள்'}, {label: 'மென்பொருள் புதுப்பிப்பு'}, {id: 'reset', label: 'மீட்டமைப்பு விருப்பங்கள்'}]), target: 'reset', say: '<strong>மீட்டமைப்பு விருப்பங்கள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'மீட்டமைப்பு விருப்பங்கள்', [{label: 'Wi-Fi, மொபைல் &amp; Bluetooth-ஐ மீட்டமை'}, {id: 'erase', label: 'அனைத்துத் தரவையும் அழி (தொழிற்சாலை மீட்டமைப்பு)'}], {overlay: c.askErase ? dialog(p, 'அனைத்துத் தரவையும் அழிக்கவா?', 'எல்லாப் புகைப்படங்களும் செய்திகளும் செயலிகளும் நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-erase', 'அனைத்துத் தரவையும் அழி']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>அனைத்துத் தரவையும் அழி (தொழிற்சாலை மீட்டமைப்பு) என்பதைத் தட்டுங்கள்.</strong>'},
        ]),
        {screen: () => list(p, 'மீட்டமை', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'இந்த iPhone-ஐ அழிக்கவா?' : 'அனைத்துத் தரவையும் அழிக்கவா?', 'எல்லாப் புகைப்படங்களும் செய்திகளும் செயலிகளும் நீக்கப்படும்.', [['cancel', 'ரத்துசெய்'], ['confirm-erase', p === 'ios' ? 'அழி' : 'அனைத்துத் தரவையும் அழி']])}),
         target: 'confirm-erase', say: 'உங்கள் புகைப்படங்கள் புதிய ஃபோனில் பாதுகாப்பாக இருந்த பிறகு அல்லது காப்புப்பிரதி எடுக்கப்பட்ட பிறகு மட்டுமே இதைச் செய்யுங்கள். <strong> ' + (p === 'ios' ? 'அழி' : 'அனைத்துத் தரவையும் அழி') + 'என்பதைத் தட்டுங்கள்.</strong> <em>(பயிற்சி: எதுவும் நீக்கப்படாது.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'வணக்கம்' : 'ஹாய்'}</h3><p class="cf">அடுத்த உரிமையாளருக்குத் தயார்</p>${homeIndicator(p)}</div>`,
         question: {q: 'ஒப்படைக்கும் முன் ஒரே ஒரு விஷயம் மீதம் உள்ளதா?', options: [
            {t: 'SIM கார்டை (மற்றும் ஏதேனும் மெமரி கார்டை) வெளியே எடுப்பேன்', ok: true, why: 'ஆம். SIM-இல் உங்கள் ஃபோன் எண் உள்ளது. சிறு கருவி அல்லது காகிதக் கிளிப்பால் அதை வெளியே எடுங்கள்.'},
            {t: 'வேறு எதுவும் இல்லை', why: 'உங்கள் SIM கார்டையும், ஏதேனும் மெமரி கார்டையும் வெளியே எடுங்கள். உங்கள் எண் SIM-இல் உள்ளது.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'வணக்கம்' : 'ஹாய்'}</h3><p class="cf">அடுத்த உரிமையாளருக்குத் தயார்</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>சபாஷ்!</strong> வெளியேறுங்கள், அழியுங்கள், SIM-ஐ அகற்றுங்கள்: இந்த வரிசையில். "வணக்கம்" திரை தெரிந்தால் அது வேறொருவருக்குத் தயார் என்று அர்த்தம்.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>நினைவூட்டல்</strong><span>Sarah-வை அழை</span><small>இன்று 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, பிறகு மழைத்தூறல்</span><small>அதிகபட்சம் 14° · குறைந்தபட்சம் 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} கேட்கிறது… என்ன சொல்ல விரும்புகிறீர்கள்?`}</p>${result}
            <div class="wh">${[['say-remind', '"3 மணிக்கு Sarah-வை அழைக்க எனக்கு நினைவூட்டு"'], ['say-weather', '"இன்று வானிலை எப்படி?"'], ['say-joke', '"எனக்கு ஒரு பிட்சா ஆர்டர் செய்"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'பக்கவாட்டு பட்டன் (அழுத்திப் பிடிக்கவும்)' : 'பவர் பட்டன் (அழுத்திப் பிடிக்கவும்)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? 'நீங்கள் சத்தமாகக் கேட்டால் <strong>Siri</strong> வேலைகளைச் செய்யும். Siri தோன்றும் வரை <strong>பக்கவாட்டு பட்டனை அழுத்திப் பிடியுங்கள்</strong> (வலதில் உள்ளது). "Siri" அல்லது "Hey Siri" என்றும் சொல்லலாம்.'
                          : 'நீங்கள் சத்தமாகக் கேட்டால் உங்கள் ஃபோன் வேலைகளைச் செய்யும். உதவியாளர் தோன்றும் வரை <strong>பவர் பட்டனை அழுத்திப் பிடியுங்கள்</strong> (வலதில் உள்ளது). "Hey Google" என்றும் சொல்லலாம்.',
         hint: 'வலது ஓரத்தில் உள்ள பட்டனின் மேல் உங்கள் விரலை (அல்லது மவுஸ் பட்டனை) அழுத்தி வைத்திருங்கள்.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'உண்மையான ஃபோனில் நீங்கள் பேசினால் போதும். இங்கே <strong>"3 மணிக்கு Sarah-வை அழைக்க எனக்கு நினைவூட்டு" என்பதைத் தட்டுங்கள்</strong>.', hints: {'say-joke': 'முதலில் நினைவூட்டலை முயலுங்கள்.', 'say-weather': 'முதலில் நினைவூட்டலை முயலுங்கள்.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'முடிந்தது: 3 மணிக்கு ஒரு நினைவூட்டல் தோன்றும். இப்போது <strong>வானிலை பற்றிக் கேளுங்கள்</strong>.', hints: {'say-remind': 'அது அமைக்கப்பட்டது. இப்போது வானிலை பற்றிக் கேளுங்கள்.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'இவற்றில் எதையெல்லாம் உங்கள் ஃபோனிடம் கேட்கலாம்?', options: [
            {t: 'எல்லாவற்றையும்: "Sarah-வை அழை", "10 நிமிடத்துக்கு டைமர் வை", "டார்ச்சை இயக்கு", "என் செய்திகளைப் படி"', ok: true, why: 'ஆம். உங்கள் கைகள் நிறைந்திருக்கும்போது, கண்கள் சோர்வாக இருக்கும்போது, அல்லது தட்டச்சு செய்வது சிரமமாக இருக்கும்போது இது வசதி.'},
            {t: 'வானிலை மட்டும்', why: 'இது நிறையச் செய்யும்: அழைப்புகள், டைமர்கள், டார்ச், செய்திகளைப் படித்தல், அலாரங்கள் மற்றும் பல.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>சபாஷ்!</strong> ஒருவரிடம் பேசுவது போல தெளிவாகவும் இயல்பாகவும் பேசுங்கள். தவறாகக் கேட்டால், மீண்டும் கேளுங்கள்.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'உரை'], ['lens-translate', 'மொழிபெயர்'], ['lens-search', 'தேடு']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'மெனு' : 'Carte'}</strong><span>${ctx.translated ? 'மீன் சூப்' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'காளான் சேர்த்த கோழி' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'ஆப்பிள் டார்ட்' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington மருத்துவமனை</strong><span>உங்கள் காய்ச்சல் தடுப்பூசி போட வேண்டிய நேரம்.</span><span>முன்பதிவு செய்ய, ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'} ஐ அழையுங்கள்</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Live Text' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'உங்கள் கேமரா எழுத்தைப் படிக்கும். ஒரு கடிதத்திலிருந்து ஃபோன் எண்ணை நகலெடுப்போம். <strong>கேமராவைத் திறங்கள்.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'அதைக் கடிதத்தின் பக்கம் காட்டுங்கள். எழுத்தை அது கண்டறிந்ததும், ஒரு சிறிய <strong>உரை பட்டன் ⟦scan-text⟧</strong> தோன்றும். <strong>அதைத் தட்டுங்கள்.</strong>' : 'அதைக் கடிதத்தின் பக்கம் காட்டி <strong>Lens பட்டன் ◎ ஐத் தட்டுங்கள்</strong>.',
         hints: {shutter: 'அது சாதாரணப் புகைப்படம் எடுக்கும். இதைத் தட்டுங்கள்: ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'Lens பட்டன் ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'எழுத்து இப்போது உண்மையான உரையாகிவிட்டது. <strong>ஃபோன் எண்ணைத் தட்டுங்கள்.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>நகலெடு என்பதைத் தட்டுங்கள்</strong>; செய்தியிலோ தொடர்புகளிலோ ஒட்டத் தயாராகும். <em>(அழை என்பது உடனே அந்த எண்ணை அழைக்கும்.)</em>', hints: {'call-num': 'அது அந்த எண்ணை அழைத்துவிடும். இந்தப் பயிற்சிக்கு நகலெடு என்பதைத் தட்டுங்கள்.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'விடுமுறையில் இருக்கிறீர்களா? இப்போது அது ஒரு பிரெஞ்சு உணவுப் பட்டியலின் பக்கம் காட்டப்படுகிறது. ' + (p === 'ios' ? 'Translate செயலி அல்லது Google செயலியின் Lens இதைச் செய்ய முடியும். ' : '') + '<strong>மொழிபெயர் என்பதைத் தட்டுங்கள்.</strong>', hints: {'lens-text': 'அது பிரெஞ்சை நகலெடுக்கும். மொழிபெயர் என்பதைத் தட்டுங்கள்.', 'lens-search': 'மொழிபெயர் என்பதைத் தட்டுங்கள்.'}},
        {screen: c => cameraLens(p, c), question: {q: 'கேமரா இந்த முறையில் வேறு என்ன செய்ய முடியும்?', options: [
            {t: 'தாவரங்களையும் பறவைகளையும் அடையாளம் காணவும், கடிதங்களை PDF-ஆக ஸ்கேன் செய்யவும்', ok: true, why: 'Yes. ' + (p === 'ios' ? 'குறிப்புகள் செயலியில், காகிதக் கிளிப்பைத் தட்டி, பிறகு ஆவணங்களை ஸ்கேன் செய் என்பதைத் தட்டினால், கடிதங்கள் PDF-ஆக மாறும்.' : 'Google Drive-இல், + ஐத் தட்டி, பிறகு ஸ்கேன் என்பதைத் தட்டினால், கடிதங்கள் PDF-ஆக மாறும்.')},
            {t: 'புகைப்படம் எடுக்க மட்டும்', why: 'இது இன்னும் நிறையச் செய்யும்: தாவரங்களை அடையாளம் காணுதல், மொழிபெயர்த்தல், உரையை நகலெடுத்தல், கடிதங்களை PDF-ஆக ஸ்கேன் செய்தல்.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கேமராவால் ஓர் எண்ணை நகலெடுத்து, ஓர் உணவுப் பட்டியலை மொழிபெயர்த்துவிட்டீர்கள். ' + (p === 'ios' ? 'Live Text, ஏற்கெனவே எடுத்த புகைப்படங்களிலும் வேலை செய்யும்.' : 'Google Lens, ஏற்கெனவே எடுத்த புகைப்படங்களிலும் வேலை செய்யும்.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'நூலக மின்னூல்கள்', `<p class="cf">உங்கள் நூலக அட்டையுடன் உள்நுழைந்துள்ளீர்கள்</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">மின்னூல்கள்</button><button type="button" data-tap="tab-audio" class="on">ஒலிநூல்கள்</button></div>
                <div class="aeo">${[['book-1', 'Flamborough கலங்கரை விளக்கம்', 'A. Whitby', '#0ea5e9'], ['book-2', 'கடற்கரைக் கோடைகள்', 'J. Marsh', '#f59e0b'], ['book-3', 'அமைதியான தோட்டம்', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? '21 நாட்களில் திருப்பித் தர வேண்டும்' : '5 பிரதிகளில் 3 கிடைக்கும்'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'நூலகம்', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'இலவச நூலக அட்டை இருந்தால், உங்கள் ஃபோனில் மின்னூல்களையும் ஒலிநூல்களையும் இரவல் வாங்கலாம். East Riding நூலகங்கள் <strong>BorrowBox</strong> செயலியைப் பயன்படுத்துகின்றன. இது ஒரு பயிற்சிப் பதிப்பு. <strong>அதைத் திறங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'உங்கள் நூலக அட்டையுடன் உள்நுழைந்துள்ளீர்கள். <strong>Flamborough கலங்கரை விளக்கத்தைத் தட்டுங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'இரவல் வாங்குவது இலவசம். <strong>இரவல் வாங்கு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'இது 21 நாட்களுக்கு உங்களுடையது. <strong>கேள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>இயக்கு பட்டன் ▶ ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'படுக்கையில் கேட்கிறீர்களா? <strong>தூக்க டைமர்</strong> சிறிது நேரத்துக்குப் பிறகு அதை நிறுத்தும்; அதனால் நீங்கள் எங்கே இருந்தீர்கள் என்பது மறக்காது. <strong>தூக்க டைமரைத் தட்டுங்கள்.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: '21 நாட்கள் முடிந்ததும் என்ன நடக்கும்?', options: [
            {t: 'அது தானாகவே திரும்பிவிடும். அபராதம் இல்லை, முடிக்கவில்லையென்றால் புதுப்பிக்கலாம்', ok: true, why: 'ஆம். மின்னூல்களும் ஒலிநூல்களும் தாமாகவே திரும்பிவிடும்.'},
            {t: 'உங்களுக்கு அபராதம் விதிக்கப்படும்', why: 'அபராதம் இல்லை. அது தானாகவே திரும்பிவிடும்; முடிக்கவில்லையென்றால் புதுப்பிக்கலாம்.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>சபாஷ்!</strong> உண்மையாகத் தொடங்க, eastridinglibraries.co.uk-இல் அல்லது எந்த நூலகத்திலும் சேர்ந்து, பிறகு BorrowBox-ஐப் பதிவிறக்கி, உங்கள் அட்டையுடன் உள்நுழையுங்கள்.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road வாகன நிறுத்துமிடம்</span><span>செயலி மூலம் செலுத்த: இட எண் <b>4471</b></span></div>
                <p class="cf">பலகையில் உள்ள இட எண்ணை உள்ளிடுங்கள்</p>${field('parkcode', 'இட எண்', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">வாகன நிறுத்துமிடத்தைக் கண்டுபிடி</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? '£3.20 செலுத்து' : 'நேரத்தைத் தேர்ந்தெடுங்கள்'}</button>`, {color});
        }
        return app(p, 'வாகன நிறுத்தம்', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'பல வாகன நிறுத்துமிடங்களில் செயலி மூலம் பணம் செலுத்தலாம், எனவே நாணயங்கள் தேவையில்லை. ஒவ்வொரு நகராட்சியும் வெவ்வேறு செயலிகளைப் பயன்படுத்துகிறது (பலகை எது என்று சொல்லும்). இது ஒரு பயிற்சிப் பதிப்பு. <strong>Park-ஐத் திறங்கள்.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'பலகையில் உள்ள இட எண்ணைத் தட்டச்சு செய்யுங்கள்: 4471.',
         say: 'ஒவ்வொரு வாகன நிறுத்துமிடப் பலகையிலும் ஓர் <strong>இட எண்</strong> இருக்கும். பெட்டியில் <strong>4471 எனத் தட்டச்சு செய்து</strong> <strong>வாகன நிறுத்துமிடத்தைக் கண்டுபிடி என்பதைத் தட்டுங்கள்</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'உங்கள் காரின் நம்பர் பிளேட் ஏற்கெனவே சேமிக்கப்பட்டுள்ளது. <strong>2 மணி நேரத்தைத் தேர்ந்தெடுங்கள்.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'செயலியைப் பயன்படுத்துவதற்கு ஒரு சிறிய சேவைக் கட்டணம் உண்டு. <strong>£3.20 செலுத்து என்பதைத் தட்டுங்கள்.</strong> <em>(பயிற்சி: பணம் எடுக்கப்படாது.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'கடைகளில் உங்களுக்கு நேரமாகிறது. என்ன செய்யலாம்?', options: [
            {t: 'காருக்குத் திரும்பாமலேயே கூடுதல் நேரம் சேர்க்க, செயலியில் நீட்டி என்பதைத் தட்டுவேன்', ok: true, why: 'ஆம். செயலி மூலம் செலுத்துவதன் பெரிய நன்மை அதுதான். பெரும்பாலானவை உங்கள் நேரம் முடிவதற்கு முன் நினைவூட்டவும் செய்யும்.'},
            {t: 'எதுவும் இல்லை, அபராதச் சீட்டு கிடைக்கும்', why: 'பெரும்பாலான வாகன நிறுத்த செயலிகளில் நீங்கள் எங்கிருந்தாலும் நேரத்தைச் சேர்க்க நீட்டி என்பதைத் தட்டலாம்.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>சபாஷ்!</strong> பெரும்பாலான இயந்திரங்கள் இன்னும் கார்டுகளையோ நாணயங்களையோ ஏற்கும், பல செயலிகள் ஒரு எண்ணை அழைத்தோ குறுஞ்செய்தி அனுப்பியோ செலுத்தவும் அனுமதிக்கும். இயந்திரத்தில் ஒட்டப்பட்ட QR குறியீடு ஸ்டிக்கர் மூலம் ஒருபோதும் செலுத்தாதீர்கள்: அவை போலியாக இருக்கலாம்.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>3 மார்ச் 2026 முதல் உங்கள் ஒப்பந்தம் முடிந்துவிட்டது. செலவின்றி மாறலாம். உங்கள் மாதக் கட்டணம் £24.00. உங்கள் எண்ணை வைத்துக்கொண்டு மாற, 65075-க்கு PAC எனக் குறுஞ்செய்தி அனுப்புங்கள்.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'குறுஞ்செய்தி', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'இன்னும் ஒப்பந்தத்தில் இருக்கிறீர்களா, அல்லது அதிகம் செலுத்துகிறீர்களா? ஒரு இலவசக் குறுஞ்செய்தி சொல்லிவிடும். <strong>செய்திகளைத் திறங்கள்.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'செய்திப் பெட்டியில் INFO எனத் தட்டச்சு செய்து, பிறகு அனுப்பு என்பதைத் தட்டுங்கள்.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: '<strong>85075</strong> எண்ணுக்குப் புதிய செய்தியைத் தொடங்கியுள்ளோம். <strong>INFO எனத் தட்டச்சு செய்து</strong> <strong>அனுப்பு என்பதைத் தட்டுங்கள்</strong>. இது ஒவ்வொரு UK நெட்வொர்க்கிலும் இலவசம்.'},
        {screen: c => smsTo(p, c), question: {q: 'நீங்கள் ஒப்பந்தத்தில் இல்லை, இன்னும் மாதம் £24 செலுத்துகிறீர்கள் என்று பதில் சொல்கிறது. இதன் அர்த்தம் என்ன?', options: [
            {t: 'உங்கள் ஃபோனுக்கான கட்டணம் முடிந்துவிட்டது. SIM-மட்டும் ஒப்பந்தம் மிகவும் மலிவாக இருக்கலாம், உங்கள் எண்ணையும் வைத்துக்கொள்ளலாம்', ok: true, why: 'ஆம். உங்கள் எண்ணை வைத்துக்கொண்டு மாற, குறியீட்டுக்கு 65075-க்கு PAC எனக் குறுஞ்செய்தி அனுப்புங்கள். மீதியை உங்கள் புதிய வழங்குநர் பார்த்துக்கொள்வார்.'},
            {t: 'எதுவும் இல்லை, தொடர்ந்து செலுத்துவேன்', why: 'நீங்கள் ஏற்கெனவே முழுமையாகச் செலுத்திய ஃபோனுக்கு இன்னும் செலுத்திக்கொண்டிருக்கலாம். SIM-மட்டும் ஒப்பந்தம் உங்களுக்கு நிறையச் சேமிக்கலாம்.'}]}},
        {screen: () => home(p), target: 'settings', say: 'வெளிநாட்டுப் பயணங்களுக்கு இன்னொரு சேமிப்பு: எதிர்பாராத கட்டணம் வராமலிருக்க டேட்டா ரோமிங்கை அணையுங்கள். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>மொபைல் சேவையைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'மொபைல் சேவை', [{label: 'மொபைல் டேட்டா', toggle: true}, {id: 'options', label: 'மொபைல் டேட்டா விருப்பங்கள்', value: 'ரோமிங் ஆன்'}, {label: 'தனிப்பட்ட ஹாட்ஸ்பாட்'}], {back: 'அமைப்புகள்'}), target: 'options', say: '<strong>மொபைல் டேட்டா விருப்பங்கள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'மொபைல் டேட்டா விருப்பங்கள்', [{id: 'roam', label: 'டேட்டா ரோமிங்', toggle: !c.roamOff}, {label: 'குரலும் டேட்டாவும்', value: '5G Auto'}], {back: 'மொபைல் சேவை'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>டேட்டா ரோமிங்கை அணையுங்கள்.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>நெட்வொர்க் &amp; இணையம் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: () => list(p, 'நெட்வொர்க் &amp; இணையம்', [{label: 'இணையம்', sub: 'வீட்டு Wi-Fi'}, {id: 'sims', label: 'SIM-கள்', sub: 'உங்கள் நெட்வொர்க்'}, {label: 'ஏர்பிளேன் பயன்முறை', toggle: false}]), target: 'sims', say: '<strong>SIM-கள் என்பதைத் தட்டுங்கள்.</strong>'},
            {screen: c => list(p, 'SIM-கள்', [{label: 'மொபைல் டேட்டா', toggle: true}, {id: 'roam', label: 'ரோமிங்', toggle: !c.roamOff, sub: 'ரோமிங்கின்போது டேட்டா சேவைகளுடன் இணை'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>ரோமிங்கை அணையுங்கள்.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>சபாஷ்!</strong> வெளிநாட்டிலும் WhatsApp, வீடியோ அழைப்புகள், வரைபடங்களுக்கு Wi-Fi-ஐப் பயன்படுத்தலாம். மொபைல் டேட்டா தேவைப்பட்டு, உங்கள் நெட்வொர்க் எவ்வளவு கட்டணம் வசூலிக்கிறது என்று தெரிந்தால், ரோமிங்கை மீண்டும் இயக்குங்கள்.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Find My', '#22c55e', ICON2.find]]), target: 'findmy', say: 'உங்கள் இருப்பிடத்தைப் பகிர்ந்தால், நீங்கள் பாதுகாப்பாக வீடு சேர்ந்ததை உங்கள் குடும்பத்தினர் பார்க்கலாம். இது உங்கள் விருப்பம், எப்போது வேண்டுமானாலும் நிறுத்தலாம். <strong>Find My-ஐத் திறங்கள்.</strong>'},
        {screen: c => app(p, 'நபர்கள்', `<p class="cf">இதுவரை யாரும் பகிரவில்லை.</p><button type="button" class="ce co" data-tap="share">என் இருப்பிடத்தைப் பகிர்</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>என் இருப்பிடத்தைப் பகிர் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => app(p, 'இவருடன் பகிர்', '', {color: '#fff', overlay: sheet('ஒரு தொடர்பைத் தேர்ந்தெடுங்கள்', [['pick-sarah', 'Sarah', 'மகள்'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Sarah-வைத் தட்டுங்கள்.</strong>', hints: {'pick-dave': 'இந்தப் பயிற்சிக்கு Sarah-வைத் தேர்ந்தெடுங்கள்.'}},
        {screen: c => app(p, 'Sarah-வுடன் பகிர்', '', {color: '#fff', overlay: sheet('எவ்வளவு நேரம்?', [['one-hour', 'ஒரு மணி நேரத்துக்குப் பகிர்'], ['day', 'நாள் முடியும் வரை பகிர்'], ['always', 'காலவரையின்றிப் பகிர்']])}),
         target: 'always', say: 'எவ்வளவு நேரம் என்று தேர்ந்தெடுங்கள். நீங்கள் நம்பும் குடும்பத்தினருக்கு, <strong>காலவரையின்றிப் பகிர் என்பதைத் தட்டுங்கள்</strong>. எப்போது வேண்டுமானாலும் நிறுத்தலாம்.', hints: {'one-hour': 'ஒரு பயணத்துக்கு அது வசதி. இந்தப் பயிற்சிக்கு காலவரையின்றிப் பகிர் என்பதைத் தேர்ந்தெடுங்கள்.', day: 'இந்தப் பயிற்சிக்கு காலவரையின்றிப் பகிர் என்பதைத் தேர்ந்தெடுங்கள்.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'உங்கள் இருப்பிடத்தைப் பகிர்ந்தால், நீங்கள் பாதுகாப்பாக வீடு சேர்ந்ததை உங்கள் குடும்பத்தினர் பார்க்கலாம். இது உங்கள் விருப்பம், எப்போது வேண்டுமானாலும் நிறுத்தலாம். <strong>வரைபடங்களைத் திறங்கள்.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: 'மேல் வலதில் <strong>உங்கள் சுயவிவரப் படத்தைத் தட்டுங்கள்</strong>.'},
        {screen: () => app(p, 'வரைபடங்கள்', '', {color: '#fff', overlay: sheet('', [['sharing', 'இருப்பிடப் பகிர்வு'], ['timeline', 'உங்கள் காலவரிசை'], ['settings', 'அமைப்புகள்']])}), target: 'sharing', say: '<strong>இருப்பிடப் பகிர்வு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => app(p, 'இருப்பிடப் பகிர்வு', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>புதிய பகிர்வு என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: () => app(p, 'இவருடன் பகிர்', '', {color: '#fff', overlay: sheet('ஒரு தொடர்பைத் தேர்ந்தெடுங்கள்', [['pick-sarah', 'Sarah', 'மகள்'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Sarah-வைத் தட்டுங்கள்.</strong>', hints: {'pick-dave': 'இந்தப் பயிற்சிக்கு Sarah-வைத் தேர்ந்தெடுங்கள்.'}},
        {screen: () => app(p, 'Sarah-வுடன் பகிர்', '', {color: '#fff', overlay: sheet('எவ்வளவு நேரம்?', [['one-hour', '1 மணி நேரத்துக்கு'], ['always', 'நீங்கள் இதை அணைக்கும் வரை']])}),
         target: 'always', say: 'நீங்கள் நம்பும் குடும்பத்தினருக்கு, <strong>நீங்கள் இதை அணைக்கும் வரை என்பதைத் தட்டுங்கள்</strong>.', hints: {'one-hour': 'ஒரு பயணத்துக்கு வசதி. இந்தப் பயிற்சிக்கு நீங்கள் இதை அணைக்கும் வரை என்பதைத் தேர்ந்தெடுங்கள்.'}},
    ]).concat([
        {screen: () => app(p, 'Sarah-வுடன் பகிர்கிறது', `<div class="vl"><span class="pt"></span></div><p class="cf">நீங்கள் எங்கே இருக்கிறீர்கள் என்பதை Sarah பார்க்க முடியும். எப்போது வேண்டுமானாலும் ${p === 'ios' ? 'பகிர்வை நிறுத்து என்பதைத் தட்டுங்கள்' : 'நிறுத்து என்பதைத் தட்டுங்கள்'}</p>`, {color: '#fff'}),
         question: {q: 'ஆன்லைனில் இப்போதுதான் சந்தித்த ஒருவர் உங்கள் இருப்பிடத்தைப் பகிரச் சொல்கிறார். பகிர வேண்டுமா?', options: [
            {t: 'வேண்டாம். நெருங்கிய குடும்பத்தினருடனோ நீங்கள் நம்பும் நண்பர்களுடனோ மட்டுமே பகிருங்கள்', ok: true, why: 'சரியே. உங்கள் இருப்பிடம் நீங்கள் எங்கே வசிக்கிறீர்கள், எப்போது வெளியே இருக்கிறீர்கள் என்பதைக் காட்டும். நீங்கள் நம்புபவர்களுக்கு மட்டும் வையுங்கள்.'},
            {t: 'ஆம், அவர்கள் நல்லவர்கள் போலத் தெரிகிறார்கள்', why: 'உங்கள் இருப்பிடத்தை நெருங்கிய குடும்பத்தினருடனும் நண்பர்களுடனும் மட்டுமே பகிருங்கள். நீங்கள் எங்கே வசிக்கிறீர்கள், எப்போது வெளியே இருக்கிறீர்கள் என்பதை அது காட்டும்.'}]}},
        {screen: () => app(p, 'Sarah-வுடன் பகிர்கிறது', '<p class="cf">நீங்கள் எங்கே இருக்கிறீர்கள் என்பதை Sarah பார்க்க முடியும்.</p>', {color: '#fff'}), done: true,
         say: '<strong>சபாஷ்!</strong> நீங்கள் பாதுகாப்பாக இருப்பதை Sarah பார்க்கலாம். யாருடன் பகிர்கிறீர்கள் என்பதை அவ்வப்போது பாருங்கள், தேவையில்லாதவர்களுடன் பகிர்வதை நிறுத்துங்கள்.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'உங்கள் பேரன் Leo தன் முதல் iPhone-ஐப் பெறுகிறான். <strong>Screen Time</strong> ஆரோக்கியமான வரம்புகளை அமைக்கும். இது <strong>Leo-வின்</strong> ஃபோன். <strong>அமைப்புகளைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'அமைப்புகள்', [{label: 'Leo', sub: 'Apple Account'}, {label: 'அறிவிப்புகள்'}, {id: 'screen-time', label: 'Screen Time'}, {label: 'பொது'}], {noBack: true}), target: 'screen-time', say: '<strong>Screen Time-ஐத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'Screen Time', [{id: 'downtime', label: 'டவுன்டைம்', sub: c.downtime ? '20:00 – 07:00' : 'ஆஃப்'}, {label: 'செயலி வரம்புகள்'}, {id: 'content', label: 'உள்ளடக்கம் &amp; தனியுரிமைக் கட்டுப்பாடுகள்', sub: c.content ? 'ஆன்' : 'ஆஃப்'}, {label: 'Screen Time கடவுக்குறியீட்டைப் பயன்படுத்து'}], {back: 'அமைப்புகள்'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>டவுன்டைம்</strong> இரவில் பெரும்பாலான செயலிகளைப் பூட்டும் (அழைப்புகள் இன்னும் வேலை செய்யும்). இரவு 8 முதல் காலை 7 வரை இயக்க <strong>டவுன்டைமைத் தட்டுங்கள்</strong>.'},
        {screen: c => list(p, 'Screen Time', [{label: 'டவுன்டைம்', sub: '20:00 – 07:00'}, {label: 'செயலி வரம்புகள்'}, {id: 'content', label: 'உள்ளடக்கம் &amp; தனியுரிமைக் கட்டுப்பாடுகள்', sub: c.content ? 'ஆன்' : 'ஆஃப்'}], {back: 'அமைப்புகள்'}),
         target: 'content', action: c => { c.content = true; }, say: 'அடுத்து, எதிர்பாராத வாங்குதல்களையும் வயதுவந்தோர் உள்ளடக்கத்தையும் நிறுத்துங்கள். <strong>உள்ளடக்கம் &amp; தனியுரிமைக் கட்டுப்பாடுகள் என்பதைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'உள்ளடக்கம் &amp; தனியுரிமை', [{label: 'உள்ளடக்கம் &amp; தனியுரிமைக் கட்டுப்பாடுகள்', toggle: true}, {id: 'purchases', label: 'App Store வாங்குதல்கள்', value: c.noBuy ? 'அனுமதிக்காதே' : 'அனுமதி'}, {label: 'வலை உள்ளடக்கம்', value: 'வயதுவந்தோர் இணையதளங்களை வரம்பிடு'}], {back: 'Screen Time'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'வயதுவந்தோர் இணையதளங்கள் இப்போது வரம்பிடப்பட்டுள்ளன. செயலிகளுக்குள் செலவு செய்வதை நிறுத்த <strong>App Store வாங்குதல்களைத் தட்டுங்கள்</strong>.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'உங்கள் பேரன் Leo தன் முதல் Android ஃபோனைப் பெறுகிறான். Google-இன் இலவச <strong>Family Link</strong> செயலி <strong>உங்கள்</strong> ஃபோனிலிருந்தே ஆரோக்கியமான வரம்புகளை அமைக்கும். <strong>Family Link-ஐத் திறங்கள்.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Leo-வைத் தட்டுங்கள்.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'கட்டுப்பாடுகள்'}, {id: 'screen-time', label: 'திரை நேரம்', sub: c.downtime ? 'உறங்கும் நேரம் 20:00 – 07:00' : 'வரம்புகள் இல்லை'}, {id: 'content', label: 'உள்ளடக்கக் கட்டுப்பாடுகள்', sub: c.noBuy ? 'வாங்குதல்களுக்கு உங்கள் ஒப்புதல் தேவை' : 'Google Play: அனைத்தையும் அனுமதி'}, {label: 'இருப்பிடம்', sub: 'ஆன்'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: 'ஃபோன் பூட்டும் உறங்கும் நேரத்தை, இரவு 8 முதல் காலை 7 வரை, அமைக்க <strong>திரை நேரத்தைத் தட்டுங்கள்</strong> (அழைப்புகள் இன்னும் வேலை செய்யும்).'},
        {screen: c => list(p, 'Leo', [{caption: 'கட்டுப்பாடுகள்'}, {label: 'திரை நேரம்', sub: 'உறங்கும் நேரம் 20:00 – 07:00'}, {id: 'content', label: 'உள்ளடக்கக் கட்டுப்பாடுகள்', sub: c.noBuy ? 'வாங்குதல்களுக்கு உங்கள் ஒப்புதல் தேவை' : 'Google Play: அனைத்தையும் அனுமதி'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'அடுத்து, எதிர்பாராத செலவுகளை நிறுத்துங்கள். வாங்குதல்களுக்கு உங்கள் ஒப்புதல் தேவைப்பட <strong>உள்ளடக்கக் கட்டுப்பாடுகளைத் தட்டுங்கள்</strong>.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Screen Time' : 'Leo', [{label: p === 'ios' ? 'டவுன்டைம்' : 'திரை நேரம்', sub: '20:00 – 07:00'}, {label: 'வாங்குதல்கள்', sub: p === 'ios' ? 'அனுமதிக்காதே' : 'உங்கள் ஒப்புதல் தேவை'}]),
         question: {q: 'அமைப்புகளுடன் சேர்த்து, எது மிக முக்கியம்?', options: [
            {t: 'அவர்களுடன் பேசுவது: ஆன்லைனில் ஏதாவது அவர்களை வருத்தப்படுத்தினால் அவர்கள் எப்போதும் உங்களிடம் சொல்லலாம்', ok: true, why: 'ஆம். எந்த அமைப்பும் எல்லாவற்றையும் பிடிக்காது. அவர்கள் பேசக்கூடிய ஒருவராக நீங்கள் இருப்பதே மிக முக்கியம்.'},
            {t: 'அமைப்புகளே எல்லாவற்றையும் செய்யும்', why: 'அவை மிகவும் உதவும், ஆனால் எதுவும் எல்லாவற்றையும் பிடிக்காது. அவர்கள் எப்போதும் உங்களிடம் பேசலாம் என்பதை அவர்கள் அறிந்திருக்கச் செய்யுங்கள்.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Screen Time' : 'Leo', [{label: 'டவுன்டைம்', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>சபாஷ்!</strong> Leo-வுக்கு உறங்கும் நேரம் உள்ளது, கேட்காமல் பணம் செலவழிக்கவும் முடியாது. ' + (p === 'ios' ? 'இவற்றை நீங்கள் மட்டுமே மாற்றும்படி Screen Time கடவுக்குறியீட்டை அமையுங்கள்.' : 'Family Link, இவற்றை உங்கள் சொந்த ஃபோனிலிருந்து எப்போது வேண்டுமானாலும் மாற்ற அனுமதிக்கும்.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'File Explorer', mac: 'Finder', linux: 'கோப்புகள்'},
        settings: {windows: 'அமைப்புகள்', mac: 'சிஸ்டம் அமைப்புகள்', linux: 'சிஸ்டம் அமைப்புகள்'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'மென்பொருள் மேலாளர்'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'தொடக்கம்', mac: 'செயலிகள்', linux: 'மெனு'},
        editor: {windows: 'Notepad', mac: 'TextEdit', linux: 'உரை திருத்தி'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'மெயில்', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'புதுப்பிப்பு மேலாளர்', terminal: 'Terminal', trash: 'குப்பைத்தொட்டி', apps: 'செயலிகள்', chrome: 'Chrome', shield: 'Windows Security', fw: 'ஃபயர்வால்'}[kind]);

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
        windows: {title: 'மறுசுழற்சித் தொட்டி', empty: 'மறுசுழற்சித் தொட்டியைக் காலி செய்', confirm: n => `இந்த ${n} உருப்படிகளை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'நீங்கள் எழுதத் தொடங்கிய ஒவ்வொரு கடிதத்துக்கும் உதவ முன்வந்தது. 2007-இல் ஓய்வு பெற்றது.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'தொடக்கநிலை: 999 விநாடிகள். அதைப் பற்றிப் பேச வேண்டாம்.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'ஒரு ஆட்டத்தில் வென்றால் சீட்டுகள் திரையில் துள்ளிக் குதித்து வரும். என்னை இருமுறை கிளிக் செய்யுங்கள்!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'கிர்ர்ர்… பாங்… ஷ்ஷ்ஷ்ஷ். நீங்கள் ஆன்லைனில் இருக்கும்போது யாரும் ஃபோனைப் பயன்படுத்த முடியாது.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'அந்த அலையலையான பச்சை மலையும் நீல வானமும், 2001 முதல் கோடிக்கணக்கான திரைகளில்.', ''],
            ['⟦save⟧', 'Floppy disk (A:)', '1.44 MB. சேமி பட்டன் இன்னும் அதைப் போலவே தெரிகிறது.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', 'Windows உடன் இலவசமாக வந்த 3D Pinball; Vista அதை நீக்கும் வரை.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'யாரோ உங்களுக்கு nudge அனுப்பினார், உங்கள் திரை முழுவதும் குலுங்கியது. என்னை இருமுறை கிளிக் செய்யுங்கள்!', 'shake'],
            ['⟦file-text⟧', 'Letter to council FINAL (2) (final).doc', 'நம் எல்லோரிடமும் ஒன்று இருக்கிறது.', ''],
        ]},
        mac: {title: 'குப்பைத்தொட்டி', empty: 'குப்பைத்தொட்டியைக் காலி செய்', confirm: () => 'குப்பைத்தொட்டியில் உள்ளவற்றை நிரந்தரமாக அழிக்க விரும்புகிறீர்களா? இந்தச் செயலைத் திரும்பப் பெற முடியாது.', items: [
            ['⟦rainbow⟧', 'சுழலும் கடற்கரைப் பந்து', '"தயவுசெய்து காத்திருங்கள்" என்று பொருள்படும் வானவில் சக்கரம்… மீண்டும் காத்திருப்பு. என்னை இருமுறை கிளிக் செய்யுங்கள்!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'ஊடுருவிப் பார்க்கக்கூடிய, முட்டை வடிவ, நீல நிறக் கணினி. ஒவ்வொரு பள்ளியிலும் ஒன்று இருந்தது.', ''],
            ['⟦music⟧', 'கிளிக் வீல் உள்ள iPod', 'உங்கள் பாக்கெட்டில் 1,000 பாடல்கள். உங்கள் கட்டைவிரலால் சுற்றிச் சுற்றி.', ''],
            ['⟦smile⟧', 'Happy Mac', 'ஒவ்வொரு முறை தொடங்கும்போதும் உங்களை வரவேற்கும் சிறிய சிரிக்கும் கணினி.', ''],
            ['⟦bell⟧', 'தொடக்க ஒலி', 'இயக்கும்போது கேட்கும் அந்தப் பெரிய இசைக்கூட்டு ஒலி. பலர் இன்னும் அதை நினைத்து ஏங்குகிறார்கள்.', ''],
            ['⟦droplet⟧', 'Aqua பட்டன்கள்', 'நக்கிவிடலாம் போலத் தோன்றும் அளவுக்குப் பளபளப்பாகவும் நீலமாகவும் இருந்தன.', ''],
            ['⟦calendar-days⟧', 'Dashboard விட்ஜெட்டுகள்', 'ஒரு கால்குலேட்டர், வானிலை, ஒரு ஒட்டும் குறிப்பு, தனி அடுக்கில். 2019 முதல் இல்லை.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'நாம் அனைவரும் CD-களை எரித்து, iPod-களை ஒத்திசைத்த இடம்.', ''],
        ]},
        linux: {title: 'குப்பை', empty: 'குப்பையைக் காலி செய்', confirm: () => 'குப்பையில் உள்ள அனைத்தையும் காலி செய்யவா? குப்பையில் உள்ள அனைத்தும் நிரந்தரமாக நீக்கப்படும்.', items: [
            ['⟦bird⟧', 'Tux பென்குயின் (பொம்மை)', '1996 முதல் Linux-இன் சின்னம். கட்டிப்பிடிக்க மிகவும் ஏற்றது.', ''],
            ['⟦eye⟧', 'xeyes', 'உங்கள் மவுஸ் பாயிண்டரைப் பின்தொடரும் ஒரு ஜோடிக் கண்கள். என்னை இருமுறை கிளிக் செய்யுங்கள்!', 'eyes'],
            ['⟦app-window⟧', 'ஆடும் சாளரங்கள்', 'பழைய டெஸ்க்டாப் விளைவுகள், இழுக்கும்போது சாளரங்களை ஜெல்லி போல ஆடச் செய்தன. என்னை இருமுறை கிளிக் செய்யுங்கள்!', 'wobble'],
            ['⟦save⟧', 'நிறுவல் பிளாப்பிகள் 1–50', 'ஆரம்பகால Linux-ஐ நிறுவ ஒரு பெட்டி நிறைய பிளாப்பி டிஸ்க்குகள் தேவைப்படலாம்.', ''],
            ['⟦disc⟧', 'அஞ்சலில் இலவச Ubuntu CD', 'நீங்கள் ஒரு Linux CD-ஐ இலவசமாக ஆர்டர் செய்யலாம், அது அஞ்சலில் வரும்.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', '1999 முதல் ஒவ்வோர் ஆண்டும் கணிக்கப்படுகிறது. ஒருவேளை இதுவே அந்த ஆண்டா?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'ஒவ்வொரு Linux Mint வெளியீட்டுக்கும் Zena, Xia, Vanessa போல ஒரு பெண்ணின் பெயர் உண்டு.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'ஒரு பழைய நகைச்சுவை: "sudo" என்று சொன்னால் கணினி சொன்னதைச் செய்யும்.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'இந்தக் கோப்புறை காலியாக உள்ளது.' : 'The ' + egg.title + ' காலியாக உள்ளது.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'பார்க்க எதையாவது இருமுறை கிளிக் செய்யுங்கள்.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'இல்லை' : 'ரத்துசெய்'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Yes' : 'காலி'}</button></div></div>` : '';
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
        ['அலையலையான மலை', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Teal 95', '#008080'],
        ['மெல்லிய கோடுகள்', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['இரவு வானம்', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['கடற்கரை', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'எல்லாவற்றிலும் மிகப் பிரபலமான Wi-Fi சிலேடை.'],
        ['The LAN Before Time', 'LAN என்பது "உள்ளூர்ப் பகுதி நெட்வொர்க்". இது மிக மிகப் பழையது.'],
        ['Abraham Linksys', 'எண்பத்தேழு மெகாபிட்டுகளுக்கு முன்பு…'],
        ['Bill Wi the Science Fi', 'அறிவியலே சிறந்தது!'],
        ['Drop It Like It\'s Hotspot', 'யாரோ ஒருவரின் ஃபோன் ஹாட்ஸ்பாட், நகைச்சுவை உணர்வுடன்.'],
        ['Silence of the LANs', 'மிக மிக அமைதியான நெட்வொர்க்.'],
        ['Tell My Wi-Fi Love Her', 'ஆஹா.'],
        ['Get Off My LAN', 'ஒருவேளை ஒரு எரிச்சல் கொண்ட அண்டை வீட்டார்.'],
        ['Bridlington Seagulls', 'அவை ஏற்கெனவே உங்கள் சிப்ஸைப் பறித்துவிட்டன. உங்கள் கடவுச்சொல்லையும் கொடுத்துவிடாதீர்கள்.'],
        ['FREE WIFI (honest)', 'உங்களுக்குத் தெரியாத "இலவச Wi-Fi" என்ற பெயருள்ள நெட்வொர்க்கில் இணையவே கூடாது!'],
    ];

    const FORTUNES = ['இன்று உங்கள் புகைப்படங்களைக் காப்புப்பிரதி எடுக்க நல்ல நாள்.', 'வலுவான கடவுச்சொல் மகிழ்ச்சியான கடவுச்சொல்.', 'உங்களுக்கு ஒரு ஃபோன் அழைப்பு வரும். அது ஒரு மோசடியாக இருக்கும். துண்டியுங்கள்.',
        'அதை அணைத்து மீண்டும் இயக்கிப் பார்த்தீர்களா?', 'புதுப்பிக்க சிறந்த நேரம் நேற்று. இரண்டாவது சிறந்த நேரம் இப்போது.', 'ஒரு கோப்பை தேநீர் பெரும்பாலானவற்றைச் சரிசெய்யும். கணினிகளை அல்ல.',
        'உங்கள் கடவுச்சொல்லை அந்நியருக்குக் கொடுக்காதீர்கள். கடற்புறாவுக்கும்தான்.', 'நீங்கள் ரிமோட்டைக் கண்டுபிடிப்பீர்கள். அது சோபாவின் ஓரத்தில் இருக்கும்.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP முகவரி: 192.168.1.42<br>ரவுட்டர்: 192.168.1.1<br>சிக்னல்: −54 dBm (மிக நன்று)<br>சேனல்: 36 (5 GHz)<br>வேகம்: 866 Mbps<br>பாதுகாப்பு: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi ஆஃப் ஆகியுள்ளது. நெட்வொர்க்குகளைப் பார்க்க அதை இயக்குங்கள்.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>இணையம் இல்லை</strong><br>உங்கள் Wi-Fi-ஐச் சரிபாருங்கள். விளையாட <kbd>Space</kbd> ஐ அழுத்துங்கள் அல்லது தட்டுங்கள்.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>ஆட்டம் முடிந்தது · மீண்டும் விளையாட Space ஐ அழுத்துங்கள்</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."இன்று மூ சொன்னீர்களா?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('முயலுங்கள்: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'மூ!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('("ls" என்பதற்குப் பதிலாக "sl" எனத் தட்டச்சு செய்தீர்களா? ஒரு நீராவி ரயில் இதோ.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (practice) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: காலை உணவிலிருந்து \\___________/ Memory: பிறந்தநாளை ஒருபோதும் மறக்காது`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('சரி. 🥪');
        else if (lc === 'make me a sandwich') say('என்ன? நீங்களே செய்துகொள்ளுங்கள்.');
        else if (/rm\s+-rf/.test(lc)) say('நல்ல முயற்சி! இந்தப் பயிற்சி டெர்மினல் எதையும் உடைக்க விடாது.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: கட்டளை கிடைக்கவில்லை ("help" என்று முயலுங்கள்)`);
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
        else if (note) note.textContent = 'இந்தப் பயிற்சி உலாவி உண்மையான இணையத்தில் தேடாது. நீங்கள் தட்டச்சு செய்வது எங்கும் அனுப்பப்படாது.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'ஏப்ரல் முட்டாள்! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>ஏமாற்றுக் குறியீடு செயல்பட்டது! +30 உயிர்கள் 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Macintosh-க்கு வரவேற்கிறோம்.</p></div><p>ஏமாற்றுக் குறியீடு செயல்பட்டது! +30 உயிர்கள் 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>ஏமாற்றுக் குறியீடு செயல்பட்டது! +30 உயிர்கள் 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! மற்ற சாளரங்கள் ஒதுக்கப்பட்டன.' : 'Aero Shake! (ஒதுக்க வேறு சாளரங்கள் எதுவும் இல்லை.)');
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
                funToast(screen, 'Wi-Fi இயக்கத்தில் உள்ளது. Home-WiFi-5G உடன் இணைக்கப்பட்டுள்ளது.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi ஆஃப் ஆகியுள்ளது.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(உங்களுக்குத் தெரிந்த நெட்வொர்க்குகளில் மட்டும் இணையுங்கள்.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'ஏப்ரல் முட்டாள்! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'காண்'], ['', 'இதன்படி வரிசைப்படுத்து'], ['refresh', 'புதுப்பி'], ['', 'புதியது'], ['wall', 'தனிப்பயனாக்கு']]
                : os === 'mac' ? [['', 'புதிய கோப்புறை'], ['', 'தகவலைப் பெறு'], ['wall', 'வால்பேப்பரை மாற்று…'], ['', 'Stacks-ஐப் பயன்படுத்து']]
                : [['', 'புதிய கோப்புறையை உருவாக்கு'], ['terminal', 'டெர்மினலில் திற'], ['wall', 'டெஸ்க்டாப் பின்னணியை மாற்று']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `வால்பேப்பர்: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (பயிற்சிப் பதிப்பு)</small>
                <dl><dt>சிப்</dt><dd>Bridlington Silicon B1</dd><dt>நினைவகம்</dt><dd>பிறந்தநாளை ஒருபோதும் மறக்காது</dd><dt>தொடக்க டிஸ்க்</dt><dd>Practice HD</dd><dt>வரிசை எண்</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Notepad' : os === 'mac' ? 'TextEdit' : 'உரை திருத்தி';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `பெயரிடப்படாதது – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'வரி 1, நெடுவரிசை 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'எளிய உரை'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">வரவேற்கிறோம்! இது ஒரு பயிற்சி டெர்மினல். என்ன முயலலாம் என்று பார்க்க "help" எனத் தட்டச்சு செய்யுங்கள். </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'வானிலை'], ['news', '⟦newspaper⟧', 'செய்திகள்'], ['bus', '⟦bus⟧', 'பேருந்து நேரங்கள்'], ['recipes', '⟦cake-slice⟧', 'சமையல் குறிப்புகள்']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Bridlington வானிலை</h3><p class="fd">பயிற்சி முன்னறிவிப்பு</p><div class="ajf">${[['இன்று', '⟦cloud-sun⟧', '13°'], ['வெள்ளி', '⟦cloud-rain⟧', '11°'], ['சனி', '⟦wind⟧', '10°'], ['ஞாயிறு', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>கடற்புறா நடமாட்டம்: <strong>மிக அதிகம்</strong>. உங்கள் சிப்ஸைக் காத்துக்கொள்ளுங்கள்.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ பயிற்சிச் செய்திகள்</h3><ul class="news">
            <li><strong>உள்ளூர் மனிதர் மூன்று வாரங்களுக்குப் பிறகு டிவி ரிமோட்டை</strong> சோபாவின் ஓரத்தில் கண்டுபிடித்தார்.</li>
            <li><strong>99 Flake உடன் காணப்பட்ட கடற்புறா</strong>. ஐஸ்கிரீம் உரிமையாளர் "மகிழ்ச்சியடையவில்லை".</li>
            <li><strong>வீடியோ அழைப்பில் பேரனை வென்ற பாட்டி</strong>: "நான் பச்சைப் பட்டனை அழுத்தினேன், அவ்வளவுதான்."</li>
            <li><strong>ஆய்வு கூறுகிறது:</strong> 10 கணினிப் பிரச்சினைகளில் 9, அணைத்து மீண்டும் இயக்குவதால் சரியாகின்றன.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ பேருந்து நேரங்கள்</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Victoria sponge</h3><p>200g வெண்ணெய், சர்க்கரை, self-raising மாவு ஆகியவற்றை 4 முட்டைகளுடன் கலக்குங்கள். இரண்டு தட்டுகளில் 180°C-இல் 20–25 நிமிடங்கள் சுடுங்கள். ஜாமும் கிரீமும் நிரப்புங்கள்.</p><p class="fd">குறிப்பு: உங்கள் ஃபோனில் ஒரு டைமர் வையுங்கள், அல்லது அதனிடம் கேளுங்கள்: "25 நிமிடங்களுக்கு டைமர் வை".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'புதிய டேப்' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'தேடுங்கள் அல்லது இணைய முகவரியைத் தட்டச்சு செய்யுங்கள்'}</div>
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
        Documents: [['⟦file-text⟧', 'Shopping list.txt'], ['⟦file-text⟧', 'Letter to council.docx'], ['⟦folder⟧', 'சமையல் குறிப்புகள்'], ['⟦file-spreadsheet⟧', 'Christmas card list.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Council tax bill.pdf'], ['⟦file-text⟧', 'Bus timetable.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Seaside brass band.mp3'], ['⟦music⟧', 'Sixties hits.mp3']],
    };
    function funFiles(screen, os, folder = 'படங்கள்', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'மறுசுழற்சித் தொட்டி' : os === 'mac' ? 'குப்பைத்தொட்டி' : 'குப்பை'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Dog on the beach.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Home-WiFi-5G உடன் இணைக்கப்பட்டுள்ளது' : 'Wi-Fi ஆஃப் ஆகியுள்ளது.'}</p>`,
            look: `<h3>${os === 'windows' ? 'தனிப்பயனாக்கம்' : os === 'mac' ? 'வால்பேப்பர்' : 'பின்னணிகள்'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'மென்பொருள் புதுப்பிப்பு' : 'புதுப்பிப்புகள்'}</h3><p class="mj">⟦check⟧ நீங்கள் புதுப்பித்த நிலையில் உள்ளீர்கள்</p><p class="cf">கடைசியாகச் சரிபார்த்தது: இன்று, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">புதுப்பிப்புகளைச் சரிபார்</button><p class="zi"></p>`,
            about: `<h3>பற்றி</h3><div class="zk"><div><span>சாதனப் பெயர்</span><b>MARGARET-PRACTICE</b></div><div><span>சிஸ்டம்</span><b>${os === 'windows' ? 'Windows 11 (பயிற்சி)' : os === 'mac' ? 'macOS 27 (பயிற்சி)' : 'Linux Mint 22.3 (பயிற்சி)'}</b></div>
                <div><span>ப்ராசஸர்</span><b>Bridlington Silicon B1</b></div><div><span>நினைவகம்</span><b>பிறந்தநாளை ஒருபோதும் மறக்காது</b></div><div><span>சேமிப்பகம்</span><b>பேரக்குழந்தைகளின் புகைப்படங்களுக்குப் போதுமான அளவு</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'தனிப்பயனாக்கம்' : os === 'mac' ? 'வால்பேப்பர்' : 'பின்னணிகள்'], ['update', 'புதுப்பிப்புகள்'], ['about', 'பற்றி']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'பயிற்சி மைன்ஸ்', 'கிளாசிக் கண்ணிவெடி தேடும் விளையாட்டு.'], ['solitaire', '⟦spade⟧', 'பேஷன்ஸ்', 'இந்தப் பயிற்சிக் கடைக்கு விரைவில் வருகிறது.'], ['paint', '⟦paintbrush⟧', 'Paint', 'இந்தப் பயிற்சிக் கடைக்கு விரைவில் வருகிறது.'], ['weather', '⟦cloud-sun⟧', 'வானிலை', 'இந்தப் பயிற்சிக் கடைக்கு விரைவில் வருகிறது.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'திற' : (os === 'mac' ? 'Get' : 'Install')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'பயிற்சி மைன்ஸ்', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">தோண்ட கிளிக் செய்யுங்கள். கொடியை நட வலது கிளிக் செய்யுங்கள் (அல்லது அழுத்திப் பிடியுங்கள்).</p></div>`, 'bz'));
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
        ['அம்மா', 'இதை எப்படி அணைப்பது?', 'வணக்கம் கண்ணே, இந்த மின்னஞ்சலை எழுதிவிட்டேன், ஆனால் அணைக்கும் பட்டனைக் காணோம். அந்த வட்டமானதா? அன்புடன் அம்மா xx பி.கு. நான் அதை அழுத்திவிட்டேன். ஒன்றும் நடக்கவில்லை. அது சரியா?'],
        ['Bridlington Walkers', 'சனிக்கிழமை நடை', 'காலை 10 மணிக்குத் துறைமுகத்தில் சந்திப்போம். ஒரு ஃபிளாஸ்க்கும் மழைக்கோட்டும் கொண்டு வாருங்கள். கடந்த வாரக் கடற்புறா சம்பவம் பற்றிப் பேசப்படாது.'],
        ['இளவரசர் Abu (மிகப் பணக்காரர்)', 'அவசரம்: நீங்கள் £4,000,000 வென்றுள்ளீர்கள்!!!', 'அன்பான நண்பரே, நான் ஓர் இளவரசர், உங்களுக்கு நான்கு மில்லியன் பவுண்டுகள் அனுப்ப உங்கள் வங்கி விவரங்கள் தேவை. தபால் தலைக்கு £50 அனுப்புங்கள். — இது ஒரு மோசடி! உண்மையான மனிதர்கள் மின்னஞ்சலில் மில்லியன்களை இலவசமாகக் கொடுப்பதில்லை. அதை நீக்குங்கள், அல்லது report@phishing.gov.uk-க்கு முன்னனுப்புங்கள்.'],
        ['Sarah', 'ஞாயிற்றுக்கிழமைப் புகைப்படங்கள் 🌻', 'தோட்டத்தில் எடுத்த புகைப்படங்கள் இதோ. நாய் இன்னொரு சூரியகாந்தியைத் தின்றுவிட்டது.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'மெயில்', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'இது ஒரு பயிற்சிக் கணினி, எனவே இதை அணைக்க முடியாது 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'பதிவிறக்கங்கள்', '⟦triangle-alert⟧ "இலவச கிளீனர்" நிரல்கள் பெரும்பாலும் குப்பை அல்லது அதைவிட மோசம். அதைத் திறக்காமல் நீக்குவதே நல்லது!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `உண்மையான கணினியில் "${n}" இங்கே திறக்கும்.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi இயக்கத்தில் உள்ளது.' : 'Wi-Fi ஆஃப் ஆகியுள்ளது.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'புதுப்பிப்புகளைச் சரிபார்க்கிறது…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ புதிய புதுப்பிப்புகள் இல்லை. எல்லாம் தயார்!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'இது பயிற்சிக் கடையில் காட்சிக்காக மட்டுமே.'); return true; }
            el.textContent = 'நிறுவுகிறது…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'திற'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'பெயரிடப்படாதது 1 – LibreOffice Writer', '<div class="aju"><div class="yd">கோப்பு திருத்து காண் செருகு வடிவமை <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">அன்புடையீர், </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'புதுப்பிப்பு மேலாளர்', '<div class="ajz"><p class="mj">⟦check⟧ உங்கள் சிஸ்டம் புதுப்பிக்கப்பட்டுள்ளது</p><p class="cf">Linux Mint புதுப்பிப்புகளைத் தானாகவே சரிபார்க்கும்; புதுப்பிப்புகள் இருக்கும்போது கேடயத்தில் ஒரு புள்ளி காட்டும்.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ தேட இங்கே தட்டச்சு செய்யுங்கள்</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('மறுசுழற்சித் தொட்டி', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('கணினி', '⟦monitor⟧')}${icon('முகப்பு', '⟦house⟧')}${icon('குப்பை', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('செயலிகள், அமைப்புகள், ஆவணங்களைத் தேடுங்கள்')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('தேடு')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('தேட தட்டச்சு செய்யுங்கள்…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">புதிய டேப் <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ தேடுங்கள் அல்லது இணைய முகவரியைத் தட்டச்சு செய்யுங்கள்</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'இது <strong>டெஸ்க்டாப்</strong>. கீழே உள்ள பட்டை <strong>பணிப்பட்டி</strong>. தொடக்க மெனுவிலிருந்து உலாவியைத் திறங்கள்: நான்கு சதுரங்களான <strong>தொடக்கத்தைக் கிளிக் செய்யுங்கள்</strong>.'
            : os === 'mac' ? 'இது <strong>டெஸ்க்டாப்</strong>. கீழே உள்ள செயலிகளின் வரிசை <strong>Dock</strong>, மேலே உள்ள பட்டை <strong>மெனு பட்டை</strong>. உங்கள் எல்லாச் செயலிகளையும் பார்க்க <strong>செயலிகளைக் கிளிக் செய்யுங்கள்</strong> (சதுரங்களின் கட்டம்).'
            : 'இது Linux Mint-இல் உள்ள <strong>டெஸ்க்டாப்</strong>. கீழே உள்ள பட்டை <strong>பேனல்</strong>. உங்கள் செயலிகள் மெனுவில் உள்ளன: கீழ் இடதில் <strong>மெனுவைக் கிளிக் செய்யுங்கள்</strong>.',
         hint: os === 'mac' ? 'செயலிகள், கீழே உள்ள Dock-இல், Finder-க்கு அருகில் உள்ளது.' : (os === 'windows' ? 'தொடக்கம் என்பது பணிப்பட்டியில் உள்ள நான்கு நீலச் சதுரங்கள்.' : 'மெனு பட்டன் கீழ் பேனலின் மிக இடதுபுறத்தில் உள்ளது.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `உலாவியான <strong>${N.browser[os]}-ஐக் கிளிக் செய்யுங்கள்</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'ஒவ்வொரு சாளரத்திலும் <strong>மேல் இடதில்</strong> மூன்று வண்ணப் பட்டன்கள் உள்ளன. மஞ்சள் பட்டன் சாளரத்தை மறைக்கும். <strong>மஞ்சள் பட்டனைக் கிளிக் செய்யுங்கள்.</strong>'
            : 'ஒவ்வொரு சாளரத்திலும் <strong>மேல் வலதில்</strong> மூன்று பட்டன்கள் உள்ளன. <strong>—</strong> கோடு சாளரத்தை மறைக்கும் (சிறிதாக்கு). <strong>— ஐக் கிளிக் செய்யுங்கள்.</strong>',
         hints: {'win-close': 'அது அதை மூடிவிடும். முதலில் இதனால் அதை மறையுங்கள்: ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'அது திரை முழுவதும் நிரப்பும். முதலில் அதை மறையுங்கள்.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `அது மூடப்படவில்லை, மறைக்கப்பட்டுள்ளது. ${os === 'mac' ? 'Dock-இல் அதன் ஐகானுக்குக் கீழே உள்ள புள்ளி' : 'line under its icon'} அது இன்னும் திறந்துள்ளது என்பதைக் காட்டுகிறது. அதைத் திரும்பக் கொண்டுவர <strong>${N.browser[os]} ஐகானைக் கிளிக் செய்யுங்கள்</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `இப்போது அதைத் திரை முழுவதும் நிரப்புங்கள்: <strong>${os === 'mac' ? 'green' : '▢'} பட்டனைக் கிளிக் செய்யுங்கள்</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Mac-இல் சிவப்புப் பட்டன் சாளரத்தை மூடும். ஆனால் செயலி தொடர்ந்து இயங்கலாம். அதை முழுவதுமாக எப்படி வெளியேறச் செய்வது?', options: [
                {t: '⟦command⟧ Cmd + Q ஐ அழுத்துங்கள், அல்லது மேலே உள்ள செயலியின் மெனுவில் வெளியேறு என்பதைத் தேர்ந்தெடுங்கள்', ok: true, why: 'ஆம். Dock-இல் ஒரு செயலிக்குக் கீழே புள்ளி இருந்தால் அது இன்னும் இயங்குகிறது என்று அர்த்தம். ⟦command⟧ Cmd + Q அதை வெளியேறச் செய்யும்.'},
                {t: 'சிவப்புப் பட்டனை இருமுறை கிளிக் செய்வேன்', why: 'சிவப்புப் பட்டன் சாளரங்களை மட்டுமே மூடும். ⟦command⟧ Cmd + Q (அல்லது செயலி மெனு > வெளியேறு) செயலியை வெளியேறச் செய்யும்.'}]}
            : {q: 'ஒரு சாளரத்தில் மூடும் பட்டன் எங்கே உள்ளது?', options: [
                {t: 'மேல் வலது: ⟦x⟧', ok: true, why: 'ஆம். Windows, Linux Mint-இல் மூன்று பட்டன்களும் மேல் வலதில் உள்ளன. (Mac-இல் அவை மேல் இடதில், சிவப்பு, மஞ்சள், பச்சை நிறங்களில் உள்ளன.)'},
                {t: 'கீழ் இடது', why: 'இது ஒவ்வொரு சாளரத்தின் மேல் வலதில் உள்ளது: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>சபாஷ்!</strong> சாளரங்களைத் திறக்கவும், மறைக்கவும், திரும்பக் கொண்டுவரவும், பெரிதாக்கவும், மூடவும் உங்களால் முடியும். கணினியைப் பயன்படுத்துவதில் பெரும்பகுதி அதுதான்.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'முகப்பு' : 'முகப்பு'], ['desktop', 'டெஸ்க்டாப்'], ['documents', 'ஆவணங்கள்'], ['downloads', 'பதிவிறக்கங்கள்'], ['pictures', 'படங்கள்']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB ஸ்டிக்']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'ஆவணங்கள்'], ['pictures', '⟦folder⟧', 'படங்கள்'], ['downloads', '⟦folder⟧', 'பதிவிறக்கங்கள்']],
            downloads: [['photo', '⟦image⟧', 'Holiday photo.jpg'], ['bill', '⟦file-text⟧', 'Council tax bill.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Holiday photo.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'விடுமுறைகள்')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Letter to council.docx'], ['recipes', '⟦folder⟧', 'சமையல் குறிப்புகள்']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'ஆவணங்கள்']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'புதிய கோப்புறை', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'முகப்பு' : 'முகப்பு', downloads: 'பதிவிறக்கங்கள்', pictures: 'படங்கள்', documents: 'ஆவணங்கள்', usb: 'USB ஸ்டிக்', desktop: 'டெஸ்க்டாப்'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">இந்தக் கோப்புறை காலியாக உள்ளது</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'நகலெடு' : 'நகலெடு';
    const pasteLabel = os => os === 'mac' ? 'உருப்படியை ஒட்டு' : 'ஒட்டு';
    const newFolderLabel = os => os === 'mac' ? 'புதிய கோப்புறை' : os === 'windows' ? 'புதியது > கோப்புறை' : 'புதிய கோப்புறையை உருவாக்கு';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `உங்கள் புகைப்படங்களும் கடிதங்களும் <strong>கோப்புறைகளில்</strong> வைக்கப்படுகின்றன. அவற்றைப் பார்க்க <strong>${N.files[os]}-ஐக் கிளிக் செய்யுங்கள்</strong>.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'Dock-இன் இடது பக்கத்தில்' : 'இதில் ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'பக்கத்தில் உங்கள் முக்கியக் கோப்புறைகள் உள்ளன. மின்னஞ்சல்களிலிருந்தும் இணையதளங்களிலிருந்தும் நீங்கள் பதிவிறக்குபவை <strong>பதிவிறக்கங்கள்</strong> என்பதில் செல்லும். <strong>பதிவிறக்கங்களைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'திற'], ['menu-copy', copyLabel(os)], ['menu-rename', 'மறுபெயரிடு'], ['menu-delete', os === 'mac' ? 'குப்பைத்தொட்டிக்கு நகர்த்து' : 'நீக்கு']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'விடுமுறைப் புகைப்படத்தை அது இருக்க வேண்டிய படங்கள் கோப்புறைக்கு நகலெடுப்போம். <strong>Holiday photo.jpg</strong> மீது <strong>வலது கிளிக்</strong> செய்யுங்கள்: <strong>வலது பக்க</strong> மவுஸ் பட்டனை அழுத்துங்கள். <em>' + (os === 'mac' ? 'டிராக்பேடில், இரண்டு விரல்களால் கிளிக் செய்யுங்கள்.' : 'தொடுதிரையில், அழுத்திப் பிடியுங்கள்.') + '</em>',
         hint: 'புகைப்படத்தின் மீது வலது பக்க மவுஸ் பட்டனைப் பயன்படுத்துங்கள்.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `ஒரு மெனு தோன்றும். <strong>${copyLabel(os)}-ஐக் கிளிக் செய்யுங்கள்.</strong> <em>(குறுக்குவழி ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'அது அல்ல! நகலெடு என்பதைக் கிளிக் செய்யுங்கள்.', 'menu-open': 'அது புகைப்படத்தைத் திறக்கும். நகலெடு என்பதைக் கிளிக் செய்யுங்கள்.', 'menu-rename': 'நகலெடு என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: 'இடதில் <strong>படங்களைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'படங்கள் காலியாக உள்ளது. <strong>காலியான வெள்ளை இடத்தில் வலது கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>${pasteLabel(os)}-ஐக் கிளிக் செய்யுங்கள்.</strong> <em>(அல்லது ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'அடுத்து ஒரு கோப்புறையை உருவாக்குவோம். முதலில், இதைக் கிளிக் செய்யுங்கள்: ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'புகைப்படம் இப்போது படங்களிலும் உள்ளது. இப்போது விடுமுறைப் புகைப்படங்களை ஒன்றாக வைக்க ஒரு கோப்புறையை உருவாக்குங்கள். <strong>மீண்டும் காலி இடத்தில் வலது கிளிக் செய்யுங்கள்.</strong>', hints: {'rc-photo2': 'புகைப்படத்தில் அல்ல, காலி இடத்தில் வலது கிளிக் செய்யுங்கள்.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>${newFolderLabel(os)}-ஐக் கிளிக் செய்யுங்கள்.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'முதலில் கோப்புறைக்கு Holidays போல ஒரு பெயரைத் தட்டச்சு செய்யுங்கள்.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Holidays</strong> போல <strong>ஒரு பெயரைத் தட்டச்சு செய்து</strong>, பிறகு <strong>OK-ஐக் கிளிக் செய்யுங்கள்</strong> (அல்லது Enter ஐ அழுத்துங்கள்).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'மின்னஞ்சல்களிலிருந்தும் இணையதளங்களிலிருந்தும் வரும் கோப்புகள் பொதுவாக எங்கே சேரும்?', options: [
            {t: 'பதிவிறக்கங்கள் கோப்புறையில்', ok: true, why: 'ஆம். நீங்கள் பதிவிறக்கியதைக் கண்டுபிடிக்க முடியவில்லையென்றால், முதலில் பதிவிறக்கங்களில் பாருங்கள்.'},
            {t: 'டெஸ்க்டாப்பில்', why: 'பொதுவாகப் பதிவிறக்கங்களில். எதையாவது கண்டுபிடிக்க முடியவில்லையென்றால் முதலில் அங்கே பாருங்கள்.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>சபாஷ்!</strong> வலது கிளிக் பெரும்பாலான விஷயங்களுக்கான ரகசியம்: நகலெடு, ஒட்டு, மறுபெயரிடு, புதிய கோப்புறை எல்லாம் அந்த மெனுவில் உள்ளன.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>நெட்வொர்க் கடவுச்சொல்லை உள்ளிடுங்கள்</p>${field('wifipass', 'கடவுச்சொல்', ctx)}<button type="button" class="ce co" data-tap="connect">இணை</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi நெட்வொர்க்குகள்'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Home-WiFi-5G உடன் இணைக்கப்பட்டுள்ளது</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Wi-Fi-இல் இணைய, <strong>Wi-Fi குறியைக் கிளிக் செய்யுங்கள்</strong> ${os === 'mac' ? 'திரையின் மேல் வலதில்' : 'கீழ் வலதில், கடிகாரத்துக்கு அருகில்'}.`, hint: os === 'mac' ? 'இது மேல் வலதில் உள்ள மெனு பட்டையில் உள்ளது.' : 'இது கீழ் வலதில், கடிகாரத்துக்கு அருகில் உள்ளது.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'உங்கள் நெட்வொர்க்கின் பெயர் உங்கள் ரவுட்டரில் உள்ள ஸ்டிக்கரில் இருக்கும். இந்தப் பயிற்சி ரவுட்டருடையது <strong>Home-WiFi-5G</strong>. <strong>அதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {'net-neighbour': 'அது உங்கள் அண்டை வீட்டாருடையது! Home-WiFi-5G ஐத் தேர்ந்தெடுங்கள்.', 'net-cafe': 'அது உங்கள் வீட்டு நெட்வொர்க் அல்ல. Home-WiFi-5G ஐத் தேர்ந்தெடுங்கள்.', 'tray-wifi': 'Wi-Fi நெட்வொர்க்குகளின் பட்டியல் ஏற்கெனவே திறந்துள்ளது. Home-WiFi-5G ஐக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'கடவுச்சொல்லைச் சரியாகத் தட்டச்சு செய்யுங்கள்: Green-Apple-42 (பெரிய G மற்றும் A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'ஸ்டிக்கரில் உள்ளபடியே <strong>சரியாகக்</strong> கடவுச்சொல்லைத் தட்டச்சு செய்யுங்கள்: <strong>Green-Apple-42</strong>. பிறகு <strong>இணை என்பதைக் கிளிக் செய்யுங்கள்</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Wi-Fi பேனல் ஏற்கெனவே திறந்துள்ளது. பெட்டியில் கடவுச்சொல்லைத் தட்டச்சு செய்து, பிறகு இணை என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'இலவச Wi-Fi உள்ள ஒரு கஃபேயில் இருக்கிறீர்கள். ஆன்லைன் வங்கிச் சேவைக்கு அது சரியா?', options: [
            {t: 'வீடு திரும்பும் வரை காத்திருப்பது, அல்லது உங்கள் ஃபோனின் மொபைல் டேட்டாவைப் பயன்படுத்துவது நல்லது', ok: true, why: 'ஆம். இலவச Wi-Fi உலாவலுக்குச் சரி, ஆனால் வங்கிச் சேவைக்கு உங்கள் வீட்டு Wi-Fi அல்லது மொபைல் டேட்டாவைப் பயன்படுத்துங்கள்.'},
            {t: 'ஆம், எந்த Wi-Fi-உம் சரிதான்', why: 'இலவசப் பொது Wi-Fi உலாவலுக்குச் சரிதான், ஆனால் வங்கிச் சேவையை வீட்டிலோ மொபைல் டேட்டாவிலோ வைத்துக்கொள்ளுங்கள்.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கணினி கடவுச்சொல்லை நினைவில் வைத்து, அடுத்த முறை தானாகவே இணையும்.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'பொருட்கள் பட்டியல்: பால், ரொட்டி, முட்டை, தேநீர்ப் பைகள், Jean-க்கு பிறந்தநாள் அட்டை';
        const note = pcWin(os, `பொருட்கள் பட்டியல் – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Sarah-வுக்குப் புதிய மின்னஞ்சல்', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'எழுத இங்கே கிளிக் செய்யுங்கள்…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'மெயில்' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `கீபோர்டு குறுக்குவழிகள் நிறைய கிளிக்குகளைச் சேமிக்கும். <strong>${CMDL(os)}</strong> என்பது ${os === 'mac' ? 'ஸ்பேஸ் பாரின் இருபுறமும் உள்ள, ⟦command⟧ எனக் குறிக்கப்பட்ட' : 'கீபோர்டின் கீழ் இடதில் உள்ள'} விசை. எல்லா எழுத்தையும் தேர்ந்தெடுக்க, <strong>${CMDL(os)}</strong> ஐ அழுத்திப் பிடித்து <strong>A</strong> ஐ அழுத்துங்கள். <em>உங்கள் உண்மையான கீபோர்டையோ திரையில் உள்ள பட்டன்களையோ பயன்படுத்துங்கள்.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `அது தேர்ந்தெடுக்கப்பட்டுவிட்டது. இப்போது நகலெடுங்கள்: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'நகலெடுக்கப்பட்டது! Sarah-வுக்கான மின்னஞ்சலில், "எழுத இங்கே கிளிக் செய்யுங்கள்" என்று உள்ள இடத்தில் <strong>கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `இப்போது ஒட்டுங்கள்: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `அடடா, தவறுதலாக எதையோ நீக்கிவிட்டீர்கள். அதைத் திரும்பப் பெறும் குறுக்குவழி எது?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `ஆம். கிட்டத்தட்ட எல்லாச் செயலிகளிலும் ${CMDL(os)} + Z நீங்கள் கடைசியாகச் செய்ததைச் செயல்தவிர்க்கும். மேலும் செயல்தவிர்க்க மீண்டும் அழுத்துங்கள்.`},
            {t: 'Escape', why: `Escape மெனுக்களை மூடும். ${CMDL(os)} + Z செயல்தவிர்ப்பு.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'ஸ்கிரீன்ஷாட்டை (திரையின் படம்) எப்படி எடுப்பீர்கள்?', options: [
            {t: os === 'windows' ? 'Windows விசை + Shift + S, பிறகு வேண்டியதன் மேல் இழுக்கவும்' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, பிறகு வேண்டியதன் மேல் இழுக்கவும்' : 'Print Screen விசையை (PrtSc) அழுத்தவும்', ok: true,
             why: os === 'windows' ? 'ஆம். அது நகலெடுக்கப்படும், ஓர் அறிவிப்பு அதைச் சேமிக்க அனுமதிக்கும். Print Screen விசையும் வேலை செய்யும்.' : os === 'mac' ? 'ஆம். படம் உங்கள் டெஸ்க்டாப்பில் சேமிக்கப்படும். Shift + ⟦command⟧ Cmd + 3 முழுத் திரையையும் எடுக்கும்.' : 'ஆம். Linux Mint அதை உங்கள் படங்கள் கோப்புறையில் சேமிக்கும். Shift + Print Screen ஒரு பகுதியைத் தேர்ந்தெடுக்க உதவும்.'},
            {t: 'உங்கள் ஃபோனால் திரையைப் புகைப்படம் எடுப்பேன்', why: 'அதுவும் வேலை செய்யும், ஆனால் ஸ்கிரீன்ஷாட் மிகவும் தெளிவானது. ' + (os === 'windows' ? 'Windows விசை + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Print Screen ஐ அழுத்துங்கள்.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>சபாஷ்!</strong> முக்கிய நான்கு: <strong>${CMDL(os)} + C</strong> நகலெடு, <strong>V</strong> ஒட்டு, <strong>Z</strong> செயல்தவிர், <strong>A</strong> அனைத்தையும் தேர்ந்தெடு. அவை கிட்டத்தட்ட எல்லாச் செயலிகளிலும் வேலை செய்யும்.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'இலவசம்', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'இலவசம் · செயலிக்குள் வாங்குதல்கள்', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>செயலிகளைத் தேடு</span></button><div class="hp"><span>சிறப்பு</span><strong>உங்கள் புதிய கணினிக்கான செயலிகள்</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'திற' : (os === 'mac' ? 'Get' : 'Install')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">LibreOffice-ஐ நிறுவுகிறது…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">பயிற்சிக் கடை: பெயர்களும் விலைகளும் எடுத்துக்காட்டுகள்.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `செயலிகளைப் பெற மிகப் பாதுகாப்பான இடம் உள்ளமைந்த கடை: <strong>${N.store[os]}</strong>. <strong>அதைக் கிளிக் செய்யுங்கள்.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Word போல கடிதங்கள் எழுத ஏதாவது வேண்டும். <strong>தேடல் பெட்டியைக் கிளிக் செய்யுங்கள்.</strong> நாங்கள் "office" எனத் தேடுவோம்.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> என்பது Microsoft Office-க்கு ஓர் இலவச மாற்று; இதை <strong>The Document Foundation</strong> உருவாக்கியது. யார் உருவாக்கினார்கள் எனப் பார்த்து, பிறகு <strong> ' + (os === 'mac' ? 'Get' : 'Install') + ' என்பதை LibreOffice</strong> அருகில் கிளிக் செய்யுங்கள்.',
         hints: {'get-fake1': 'அது ஒரு விளம்பரம், ஆண்டுக்கு £29.99 வசூலிக்கிறது. LibreOffice இலவசம்.', 'get-fake2': 'அதை உருவாக்கியது AppMakers, செயலிக்குள் வாங்குதல்கள் உண்டு. The Document Foundation உருவாக்கிய LibreOffice-ஐத் தேர்ந்தெடுங்கள்.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'ஒரு இணையதளப் பாப்-அப் "உங்கள் PC மெதுவாக உள்ளது! இப்போதே Speed Booster-ஐப் பதிவிறக்குங்கள்" என்று கூறுகிறது. நீங்கள் என்ன செய்வீர்கள்?', options: [
            {t: 'அதை மூடுவேன். கடையிலிருந்து அல்லது உருவாக்கியவரின் சொந்த இணையதளத்திலிருந்து மட்டுமே செயலிகளை நிறுவுவேன்', ok: true, why: 'சரியே. "பூஸ்டர்கள்" அல்லது "கிளீனர்கள்" தருவதாகச் சொல்லும் பாப்-அப்கள் பெரும்பாலும் குப்பை அல்லது அதைவிட மோசம்.'},
            {t: 'பதிவிறக்குவேன், ஒருவேளை உதவலாம்', why: 'இவை பெரும்பாலும் குப்பை அல்லது தீங்கானவை. கடையிலிருந்து அல்லது உருவாக்கியவரின் சொந்த இணையதளத்திலிருந்து மட்டுமே நிறுவுங்கள்.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>சபாஷ்!</strong> LibreOffice நிறுவப்பட்டது. உருவாக்கியவரைச் சரிபாருங்கள், விளம்பரங்களைப் புறக்கணியுங்கள், பிறகு பணம் கேட்கும் "இலவச" செயலிகளிடம் எச்சரிக்கையாக இருங்கள்.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'முகப்பு'], ['system', 'சிஸ்டம்'], ['bluetooth', 'Bluetooth &amp; சாதனங்கள்'], ['network', 'நெட்வொர்க் &amp; இணையம்'], ['accounts', 'கணக்குகள்'], ['privacy', 'தனியுரிமை &amp; பாதுகாப்பு'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>முகப்பு</h3><p class="cf">பரிந்துரைக்கப்பட்ட அமைப்புகளும் உங்கள் கணக்கும்.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ நீங்கள் புதுப்பித்த நிலையில் உள்ளீர்கள்</p>' : ctx.ready ? `<p class="cf">புதுப்பிப்புகளை நிறுவி முடிக்க மறுதொடக்கம் தேவை.</p><button type="button" class="ce co bz" data-tap="restart">இப்போது மறுதொடங்கு</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'பதிவிறக்குகிறது… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'அமைப்புகள்', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'புளூடூத்'], ['general', 'பொது'], ['privacy', 'தனியுரிமை &amp; பாதுகாப்பு'], ['users', 'பயனர்களும் குழுக்களும்']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ உங்கள் Mac புதுப்பிக்கப்பட்டுள்ளது</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'பதிவிறக்குகிறது… சுமார் 10 நிமிடங்கள் மீதம்' : 'பாதுகாப்புத் திருத்தங்களும் பிழைத் திருத்தங்களும்'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>தனியுரிமை &amp; பாதுகாப்பு</h3><p class="cf"><strong>பாதுகாப்பு</strong><br>இவற்றிலிருந்து செயலிகளை அனுமதி:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store &amp; அறியப்பட்ட டெவலப்பர்கள்</button>`,
            };
            return pcWin(os, 'சிஸ்டம் அமைப்புகள்', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>சிஸ்டம் அமைப்புகள்</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'புதுப்பிப்பு மேலாளர்', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ உங்கள் சிஸ்டம் புதுப்பிக்கப்பட்டுள்ளது</p>' : `<div class="ahf">${['Firefox இணைய உலாவி', 'Linux கெர்னல் (பாதுகாப்பு)', 'LibreOffice', 'சிஸ்டம் நூலகங்கள்'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">புதுப்பிப்புகளை நிறுவுகிறது…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>அங்கீகாரம் தேவை</strong></p><p class="fd">புதுப்பிப்புகளை நிறுவ உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள். (பயிற்சி: உங்களுக்காக உள்ளிடப்பட்டது.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">ரத்துசெய்</button><button type="button" class="adg" data-tap="auth-ok">அங்கீகரி</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'மோசடிக்காரர்கள் பயன்படுத்தும் பாதுகாப்பு ஓட்டைகளைப் புதுப்பிப்புகள் அடைக்கின்றன. அவை உள்ளனவா எனப் பார்ப்போம். <strong>தொடக்கத்தைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>அமைப்புகளைக் கிளிக் செய்யுங்கள்</strong> (கியர்).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: 'இடதில் உள்ள பட்டியலின் கீழே உள்ள <strong>Windows Update-ஐக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'புதுப்பிப்புகள் காத்திருக்கின்றன. <strong>அனைத்தையும் பதிவிறக்கி நிறுவு என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'முதலில் நீங்கள் செய்துகொண்டிருக்கும் எதையும் சேமியுங்கள், பிறகு <strong>இப்போது மறுதொடங்கு என்பதைக் கிளிக் செய்யுங்கள்</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'மோசடிக்காரர்கள் பயன்படுத்தும் பாதுகாப்பு ஓட்டைகளைப் புதுப்பிப்புகள் அடைக்கின்றன. மேல் இடதில் உள்ள <strong>Apple மெனுவைக் கிளிக் செய்யுங்கள்</strong> (லோகோ).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>சிஸ்டம் அமைப்புகள்… என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'நீங்கள் பொது என்பதில் இருக்கிறீர்கள். <strong>மென்பொருள் புதுப்பிப்பு என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'ஒரு புதுப்பிப்பு தயார். உங்கள் சார்ஜரை இணைத்து, பிறகு <strong>இப்போது புதுப்பி என்பதைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'உங்கள் Mac அதைப் பதிவிறக்கி, நிறுவ மறுதொடங்கும்.',
         question: {q: 'தானியங்கிப் புதுப்பிப்புகள் இயக்கத்தில் உள்ளன. இன்னும் ஏதாவது செய்ய வேண்டுமா?', options: [
            {t: 'கேட்கும்போது மறுதொடங்குங்கள், அவ்வப்போது இரவில் மின்சாரத்தில் இணைத்து விடுங்கள்', ok: true, why: 'ஆம். புதுப்பிப்புகள் பெரும்பாலும் இரவில் நிறுவப்படும். கேட்கும்போது மறுதொடங்கினால் அவை முடியும்.'},
            {t: 'தானியங்கிப் புதுப்பிப்புகளை அணைப்பேன்', why: 'அவற்றை இயக்கத்திலேயே வையுங்கள்: அவை உங்களைப் பாதுகாக்கின்றன. உங்கள் Mac கேட்கும்போது மறுதொடங்குங்கள்.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'புதுப்பிப்புகள் பாதுகாப்பு ஓட்டைகளை அடைக்கின்றன. Linux Mint-இல், புதுப்பிப்புகள் காத்திருக்கும்போது கடிகாரத்துக்கு அருகில் உள்ள <strong>கேடயத்தில்</strong> ஒரு புள்ளி தெரியும். <strong>கேடயத்தைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'புதுப்பிப்பு மேலாளர் அவை அனைத்தையும் பட்டியலிடும். <strong>புதுப்பிப்புகளை நிறுவு என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'முக்கியமான எதையும் மாற்றும் முன் Linux <strong>உங்கள் கடவுச்சொல்லை</strong> கேட்கும். அது நல்லதுதான். <strong>அங்கீகரி என்பதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {'auth-cancel': 'அது புதுப்பிப்புகளை ரத்துசெய்துவிடும். அங்கீகரி என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'புதுப்பிப்புகளை எவ்வளவு அடிக்கடி நிறுவ வேண்டும்?', options: [
            {t: 'கேடயத்தில் புள்ளி தெரியும் போதெல்லாம்: அதற்கு ஒரு நிமிடம் மட்டுமே ஆகும்', ok: true, why: 'ஆம். சில பாதுகாப்புப் புதுப்பிப்புகளைத் தவிர, Linux Mint-க்கு மறுதொடக்கம் அரிதாகவே தேவைப்படும்.'},
            {t: 'ஆண்டுக்கு ஒருமுறை', why: 'கேடயத்தில் புள்ளி தெரியும் போதெல்லாம் நிறுவுங்கள். அதற்கு ஒரு நிமிடம் மட்டுமே ஆகும்.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கணினி புதுப்பிக்கப்பட்டுள்ளது. அதைப் புதுப்பித்த நிலையில் வைத்திருப்பதே பாதுகாப்பாக இருக்க நீங்கள் செய்யக்கூடிய மிகச் சிறந்த ஒரே விஷயம்.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'சிஸ்டம்', 'திரை, ஒலி, பற்றி'], ['tile-devices', '⟦printer⟧', 'சாதனங்கள்', 'Bluetooth, பிரிண்டர்கள்'], ['tile-network', '⟦globe⟧', 'நெட்வொர்க் & இணையம்', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'கணக்குகள்', 'உங்கள் கணக்குகள்'], ['tile-update', '⟦refresh-cw⟧', 'புதுப்பிப்பு & பாதுகாப்பு', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ உங்கள் PC Extended Security Updates-இல் பதிவு செய்யப்பட்டுள்ளது</p><p class="cf">12 அக்டோபர் 2027 வரை பாதுகாப்புப் புதுப்பிப்புகள்.</p>' : `<div class="ahg"><strong>Windows 10 ஆதரவு முடிந்துவிட்டது</strong><p>உங்கள் PC, Windows 11-ஐ இயக்கத் தேவையான தகுதிகளைப் பூர்த்தி செய்யவில்லை. தொடர்ந்து பாதுகாப்புப் புதுப்பிப்புகளைப் பெற Extended Security Updates-இல் பதிவு செய்யுங்கள்.</p>
            <button type="button" class="ce co bz" data-tap="enroll">இப்போதே பதிவு செய்</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="cf">எப்படிப் பதிவு செய்வது எனத் தேர்ந்தெடுங்கள்:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>உங்கள் PC அமைப்புகளைக் காப்புப்பிரதி எடு</strong><small>இலவசம், Microsoft கணக்குடன்</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>1,000 Microsoft Rewards புள்ளிகளைப் பயன்படுத்து</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>ஒருமுறை வாங்குதல்</strong><small>கட்டணம்</small></button>${ctx.busy ? '<p class="cf">பதிவு செய்கிறது…</p>' : ''}`;
        return pcWin('windows', 'அமைப்புகள்', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'உங்கள் கணினி இப்படித் தெரிந்தால், தொடக்கம் மிக இடதில் இருந்தால், அது <strong>Windows 10</strong> ஆக இருக்கலாம். சரிபார்ப்போம். <strong>தொடக்கத்தைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>அமைப்புகளைக் கிளிக் செய்யுங்கள்</strong> (கியர்).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>சிஸ்டத்தைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'இது Windows 10 Home என்று கூறுகிறது. 2026-இல் அதற்கு என்ன அர்த்தம்?', options: [
            {t: 'Microsoft 2025 அக்டோபரில் வழக்கமான ஆதரவை நிறுத்தியது. அது இன்னும் வேலை செய்யும், ஆனால் பாதுகாப்பாக இருக்க Extended Security Updates தேவை', ok: true,
             why: 'ஆம். வீட்டுப் பயனர்களுக்கான இலவச Extended Security Updates திட்டம் இப்போது 12 அக்டோபர் 2027 வரை நீடிக்கிறது. அதன் பிறகு Windows 10-க்கு எந்தப் பாதுகாப்புத் திருத்தங்களும் வராது.'},
            {t: 'எதுவும் இல்லை, Windows 10 என்றென்றும் புதுப்பிக்கப்படும்', why: 'வழக்கமான ஆதரவு 2025 அக்டோபரில் முடிந்தது. Extended Security Updates இப்போது 12 அக்டோபர் 2027 வரை நீடிக்கின்றன, பிறகு நின்றுவிடும்.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: 'பின்செல்ல <strong>← முகப்பைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>புதுப்பிப்பு &amp; பாதுகாப்பு என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'இந்த லேப்டாப் Windows 11-க்கு மிகவும் பழையது, எனவே Windows <strong>Extended Security Updates</strong> வழங்குகிறது. <strong>இப்போதே பதிவு செய் என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'இலவச வழி, உங்கள் அமைப்புகளை Microsoft கணக்கில் காப்புப்பிரதி எடுப்பது. <strong>உங்கள் PC அமைப்புகளைக் காப்புப்பிரதி எடு என்பதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {'esu-buy': 'நீங்கள் பணம் செலுத்த வேண்டியதில்லை. இலவசக் காப்புப்பிரதி விருப்பத்தைத் தேர்ந்தெடுங்கள்.', 'esu-points': 'உங்களிடம் புள்ளிகள் இருந்தால் அது வேலை செய்யும், ஆனால் காப்புப்பிரதி விருப்பம் அனைவருக்கும் இலவசம்.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: '2027 அக்டோபருக்கு முன் உங்கள் விருப்பங்கள் என்ன?', options: [
            {t: 'முடிந்தால் Windows 11-க்கு மேம்படுத்துவது, புதிய கணினி வாங்குவது, அல்லது பழையதை Linux Mint-க்கு (இலவசம்) மாற்றுவது', ok: true, why: 'ஆம். Linux Mint இலவசம், பழைய லேப்டாப்களிலும் நன்றாக இயங்கும். Mac-இலும் Linux Mint-இலும் எது எங்கே உள்ளது என்பதை அடுத்த பாடங்கள் காட்டும்.'},
            {t: '2027-க்குப் பிறகும் வங்கிச் சேவைக்கு Windows 10-ஐப் பயன்படுத்துவது', why: '2027 அக்டோபருக்குப் பிறகு அதற்கு எந்தப் பாதுகாப்புத் திருத்தங்களும் வராது, எனவே வங்கிச் சேவைக்குப் பாதுகாப்பானது அல்ல. மேம்படுத்துங்கள், மாற்றுங்கள் அல்லது Linux Mint-க்கு மாறுங்கள்.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>சபாஷ்!</strong> உங்களிடம் எந்த Windows உள்ளது என்பதும், 2027 அக்டோபர் வரை அதைப் பாதுகாப்பாக வைத்திருப்பது எப்படி என்பதும் உங்களுக்குத் தெரியும். கட்டணத்துக்கு "மேம்படுத்த" முன்வரும் அழைப்புகள் அல்லது பாப்-அப்கள் குறித்து எச்சரிக்கையாக இருங்கள்: அவை மோசடிகள்.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Windows-இலிருந்து மாறுகிறீர்களா? Mac-இல் செயலிகள் கீழே உள்ள <strong>Dock</strong>-இல் இருக்கும், ஒவ்வொரு செயலியின் மெனுக்களும் மேலே உள்ள <strong>மெனு பட்டையில்</strong> இருக்கும். Dock-இல் உள்ள உலாவியான <strong>Safari-ஐக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Mac-இல் சாளரப் பட்டன்கள் <strong>மேல் இடதில்</strong> உள்ளன. சாளரத்தை மூட <strong>சிவப்புப் பட்டனைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'சாளரம் போய்விட்டது, ஆனால் Dock-இல் <strong>Safari-க்குக் கீழே உள்ள புள்ளியைப்</strong> பார்த்தீர்களா? அது இன்னும் இயங்குகிறது. வெளியேற, <strong>Dock-இல் Safari-ஐ வலது கிளிக் செய்யுங்கள்</strong> (டிராக்பேடில் இரண்டு விரல்கள்).', hint: 'Dock-இல் உள்ள Safari ஐகானை வலது கிளிக் செய்யுங்கள் (அல்லது இரண்டு விரல்களால் கிளிக் செய்யுங்கள்).',
         hints: {'app-browser': 'சாதாரணக் கிளிக் அதை மீண்டும் திறக்கும். அதற்குப் பதிலாக வலது கிளிக் செய்யுங்கள்.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>வெளியேறு என்பதைக் கிளிக் செய்யுங்கள்.</strong> <em>(குறுக்குவழி ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'அமைப்புகள் மேல் இடதில் உள்ள <strong>Apple மெனுவின்</strong> (லோகோ) கீழ் உள்ளன. <strong>அதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'அணை, மறுதொடங்கு ஆகியவையும் இங்கேதான். <strong>சிஸ்டம் அமைப்புகள்… என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'Windows-இல் Ctrl + C மூலம் நகலெடுக்கிறீர்கள். Mac-இல் அது என்ன?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'ஆம். பெரும்பாலான Windows குறுக்குவழிகள் Mac-இல் Ctrl-க்குப் பதிலாக ⟦command⟧ Cmd-ஐப் பயன்படுத்தும்: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, அதே', why: 'Mac-இல் அது ⟦command⟧ Cmd + C. பெரும்பாலான Ctrl குறுக்குவழிகள் ⟦command⟧ Cmd ஆக மாறும்.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>சபாஷ்!</strong> கீழே Dock, மேலே மெனுக்கள், மேல் இடதில் சாளரப் பட்டன்கள், Ctrl-க்குப் பதிலாக ⟦command⟧ Cmd, அமைப்புகளுக்கும் அணைப்பதற்கும் Apple மெனு.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> என்பது Windows போலவே பெரிதும் இயங்கும், பழைய கணினிகளிலும் நன்றாக ஓடும் ஓர் இலவச சிஸ்டம். உங்கள் செயலிகள் தொடக்கப் பட்டன் போல கீழ் இடதில் உள்ள <strong>மெனுவில்</strong> உள்ளன. <strong>மெனுவைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint ஏற்கெனவே நிறுவப்பட்ட இலவசச் செயலிகளுடன் வருகிறது. கடிதங்களுக்கு, Microsoft Word போல வேலை செய்யும் <strong>LibreOffice Writer-ஐப்</strong> பயன்படுத்துங்கள். <strong>அதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'பெயரிடப்படாதது 1 – LibreOffice Writer', '<div class="aju"><div class="yd">கோப்பு திருத்து காண் செருகு வடிவமை <b>B</b> <i>I</i> <u>U</u></div><div class="vk">அன்புடையீர்,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'மற்றவர்கள் உங்களுக்கு மின்னஞ்சல் செய்யும் Word ஆவணங்களைத் திறக்க முடியுமா?', options: [
            {t: 'ஆம். LibreOffice Word (.docx) கோப்புகளைத் திறக்கும், சேமிக்கும்', ok: true, why: 'ஆம். Word பயனருக்கு அனுப்ப ஏதாவது சேமிக்கும்போது, Save As-இல் Word வடிவத்தை (.docx) தேர்ந்தெடுங்கள்.'},
            {t: 'இல்லை, அதற்கு Windows தேவை', why: 'LibreOffice Word (.docx) கோப்புகளைத் திறக்கும், சேமிக்கும்; அதனால் Word பயனர்களுடன் ஆவணங்களைப் பரிமாறிக்கொள்ளலாம்.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'பெயரிடப்படாதது 1 – LibreOffice Writer', '<div class="aju"><div class="vk">அன்புடையீர்,</div></div>', {max: true})}),
         target: 'win-close', say: 'சாளரப் பட்டன்கள் Windows போலவே மேல் வலதில் உள்ளன. Writer-ஐ மூட <strong>⟦x⟧-ஐக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: () => desk('linux'), target: 'start', say: 'இப்போது மேலும் செயலிகளை எங்கே பெறுவது எனப் பார்ப்போம். <strong>மெனுவை</strong> மீண்டும் கிளிக் செய்யுங்கள்.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>மென்பொருள் மேலாளர்</strong> என்பது Linux Mint-இன் இலவசச் செயலிக் கடை. <strong>அதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'மென்பொருள் மேலாளர்', `<div class="jo"><div class="gq">${ICON.search}<span>தேடு</span></div>
            <div class="aan">${['இணையம்', 'அலுவலகம்', 'வரைகலை', 'ஒலி & வீடியோ', 'விளையாட்டுகள்', 'அணுகல்தன்மை'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Linux Mint சரிபார்த்த ஆயிரக்கணக்கான இலவசச் செயலிகள்.</p></div>`, {max: true})}),
         question: {q: 'Linux Mint-க்கு வைரஸ் தடுப்பு வாங்க வேண்டுமா?', options: [
            {t: 'இல்லை. புதுப்பித்து வையுங்கள், மென்பொருள் மேலாளரிலிருந்து செயலிகளைப் பெறுங்கள், நன்றாகப் பாதுகாக்கப்படுவீர்கள்', ok: true, why: 'ஆம். Linux-இல் வைரஸ்கள் குறைவு. புதுப்பிப்புகளும் உள்ளமைந்த ஃபயர்வாலும் வேலையைச் செய்கின்றன. மின்னஞ்சல்கள், இணையதளங்களில் உள்ள மோசடிகள் இன்னும் பொருந்தும், எனவே விழிப்புடன் இருங்கள்.'},
            {t: 'ஆம், மிக விலை உயர்ந்ததை', why: 'இல்லை. புதுப்பித்து வையுங்கள், மென்பொருள் மேலாளரிலிருந்து செயலிகளைப் பெறுங்கள். வழக்கம்போல மின்னஞ்சல், இணையதள மோசடிகளிடம் எச்சரிக்கையாக இருங்கள்.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>சபாஷ்!</strong> கீழ் இடதில் மெனு, மேல் வலதில் மூடு, ஆவணங்களுக்கு LibreOffice, இணையத்துக்கு Firefox, செயலிகளுக்கு மென்பொருள் மேலாளர், புதுப்பிப்புகளுக்குக் கேடயம்.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB ஸ்டிக் இணைக்கப்பட்டது</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'கணினிகளை மாற்றும் முன், உங்கள் கோப்புகளை <strong>USB ஸ்டிக்கில்</strong> நகலெடுங்கள். அதைக் கணினியின் பக்கத்தில் உள்ள USB துளையில் செருகுங்கள். இங்கே <strong>USB ஸ்டிக்கைச் செருகு என்பதைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB ஸ்டிக் இணைக்கப்பட்டது</div>'}), target: 'app-files', say: `<strong>${N.files[os]}-ஐத் திறங்கள்.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'திற'], ['menu-copy', 'நகலெடு'], ['menu-rename', 'மறுபெயரிடு']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'உங்கள் கடிதங்கள் <strong>ஆவணங்களில்</strong> உள்ளன. <strong>ஆவணங்கள் கோப்புறையை வலது கிளிக் செய்யுங்கள்.</strong> <em>(பிறகு படங்களுக்கும் அதையே செய்யுங்கள்.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>நகலெடு என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'உங்கள் USB ஸ்டிக் இடதில் உள்ளது. <strong>USB ஸ்டிக்கைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'அது காலியாக உள்ளது. <strong>காலி இடத்தில் வலது கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>${pasteLabel(os)}-ஐக் கிளிக் செய்யுங்கள்.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? '214 உருப்படிகளை நகலெடுக்கிறது… 1 நிமிடம் மீதம்' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'வெளியேற்று']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'முடிந்தது! ஸ்டிக்கை வெளியே இழுக்கும் முன், எதுவும் சேதமடையாமலிருக்க அதை <strong>வெளியேற்றுங்கள்</strong>. இடதில் <strong>USB ஸ்டிக்கை வலது கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>வெளியேற்று என்பதைக் கிளிக் செய்யுங்கள்.</strong> பிறகு அதை எடுப்பது பாதுகாப்பானது.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'புதிய கணினிக்குக் கோப்புகளை மாற்ற வேறு வழி?', options: [
            {t: 'ஆன்லைன் சேமிப்பகம்: OneDrive, iCloud அல்லது Google Drive', ok: true, why: 'ஆம். பழைய கணினியிலிருந்து பதிவேற்றி, புதியதில் உள்நுழைந்தால் அவை அங்கே இருக்கும். USB ஸ்டிக்கும் ஒரு நல்ல கூடுதல் நகல்.'},
            {t: 'ஒவ்வொரு கோப்பையும் ஒவ்வொன்றாக எனக்கே மின்னஞ்சல் செய்வேன்', why: 'அதற்கு மிக நீண்ட நேரம் ஆகும்! USB ஸ்டிக் அல்லது OneDrive, iCloud, Google Drive போன்ற ஆன்லைன் சேமிப்பகத்தைப் பயன்படுத்துங்கள்.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>சபாஷ்!</strong> புதிய கணினியில் ஸ்டிக்கைச் செருகி, திறந்து, கோப்புறைகளை உங்கள் ஆவணங்கள், படங்களில் நகலெடுங்கள்.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC வானிலை ⟦star⟧ NHS App ⟦star⟧ Bridlington பேருந்து நேரங்கள் ⟦star⟧ சமையல் குறிப்புகள்</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">உள்நுழையவில்லை</span><button type="button" data-tap="sync">ஒத்திசைவை இயக்கு…</button><button type="button" data-tap="guest">விருந்தினர் சுயவிவரத்தைத் திற</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Google மூலம் உள்நுழைக</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(பயிற்சி: உங்களுக்காக உள்ளிடப்பட்டது.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">அடுத்து</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>ஒத்திசைவை இயக்கவா?</strong></p><p class="fd">உங்கள் புக்மார்க்குகள், கடவுச்சொற்கள், வரலாறு உங்கள் Google கணக்கில் சேமிக்கப்பட்டு, உங்கள் எல்லாச் சாதனங்களிலும் தோன்றும்.</p><div class="jn"><button type="button" data-tap="cancel">ரத்துசெய்</button><button type="button" class="adg" data-tap="yes-in">ஆம், சேர்கிறேன்</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">புதிய டேப்</span>${profile}</div><div class="qn">⟦search⟧ Google-இல் தேடுங்கள் அல்லது URL-ஐத் தட்டச்சு செய்யுங்கள்</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">உங்கள் புக்மார்க்குகளை ஒத்திசைக்கிறது…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'உங்கள் பழைய கணினியில் <strong>Chrome</strong> பயன்படுத்தியிருந்தால், உள்நுழைவது உங்கள் புக்மார்க்குகளையும் சேமித்த கடவுச்சொற்களையும் புதியதற்குக் கொண்டுவரும். (Firefox-உம் Edge-உம் இதே போலவே வேலை செய்யும்.) <strong>Chrome-ஐக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: 'மேல் வலதில் உள்ள <strong>நபர் ஐகானைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>ஒத்திசைவை இயக்கு… என்பதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {guest: 'விருந்தினர் சுயவிவரம் எதையும் சேமிக்காது. ஒத்திசைவை இயக்கு என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'பழைய கணினியில் பயன்படுத்திய <strong>அதே Google கணக்கில்</strong> உள்நுழையுங்கள். <strong>அடுத்து என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>ஆம், சேர்கிறேன் என்பதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {cancel: 'அது ஒத்திசைவை நிறுத்திவிடும். ஆம், சேர்கிறேன் என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'உங்கள் புக்மார்க்குகள் திரும்ப வந்துவிட்டன. உலாவியில் கடவுச்சொற்களைச் சேமிப்பது பாதுகாப்பானதா?', options: [
            {t: 'ஆம், உங்கள் Google கணக்கில் வலுவான கடவுச்சொல்லும் 2-படிச் சரிபார்ப்பும் இருந்தால்', ok: true, why: 'ஆம். ஒரே கடவுச்சொல்லை எல்லா இடங்களிலும் பயன்படுத்துவதை விட இது மிகவும் பாதுகாப்பானது. கணக்கையே 2-படிச் சரிபார்ப்பால் பாதுகாப்பாக வையுங்கள்.'},
            {t: 'இல்லை, அதற்குப் பதிலாகத் திரையில் ஒட்டும் குறிப்பில் எழுதி வைப்பேன்', why: 'உங்கள் கணக்கில் 2-படிச் சரிபார்ப்பு இருந்தால், திரையில் ஒட்டிய குறிப்பை விட உலாவியின் கடவுச்சொல் நிர்வாகி மிகவும் பாதுகாப்பானது.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>சபாஷ்!</strong> உங்கள் புக்மார்க்குகளும் கடவுச்சொற்களும் உங்களைப் பின்தொடர்ந்து வந்துவிட்டன. பொது அல்லது பகிர்ந்த கணினியில் ஒத்திசைவை இயக்காதீர்கள்.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'சிஸ்டம்'} பாதுகாப்பு எச்சரிக்கை ⚠️</strong>
            <p>உங்கள் கணினியில் 5 வைரஸ்கள் தொற்றியுள்ளன! உங்கள் வங்கி விவரங்களும் புகைப்படங்களும் ஆபத்தில் உள்ளன.</p><p>உங்கள் கணினியை அணைக்காதீர்கள். இப்போதே ஆதரவை அழையுங்கள்:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">இப்போதே அழை</button><button type="button" data-tap="fake-close">மூடு</button></div>
            <small>(பயிற்சி மோசடிப் பக்கம். இந்த எண் உண்மையானது அல்ல.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>தளத்தை விட்டு வெளியேறவா?</strong></p><p class="fd">நீங்கள் செய்த மாற்றங்கள் சேமிக்கப்படாமல் போகலாம்.</p><div class="jn"><button type="button" data-tap="stay">இரு</button><button type="button" class="adg" data-tap="leave">வெளியேறு</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'உலாவிக்கொண்டிருக்கும்போது இது திடீரென உங்கள் திரையை நிரப்பிவிட்டது. இது உண்மையா?', options: [
            {t: 'இல்லை. மோசடிக்காரர்களை அழைக்க உங்களைப் பயமுறுத்த முயலும் போலி இணையதளம்', ok: true, why: 'சரியே. உண்மையான எச்சரிக்கைகள் ஒருபோதும் அழைக்க ஒரு ஃபோன் எண்ணைக் காட்டாது. அழைக்காதீர்கள், பக்கத்தில் எதையும் கிளிக் செய்யாதீர்கள்.'},
            {t: 'ஆம், அந்த எண்ணை உடனே அழைப்பேன்', why: 'ஒருபோதும் அழைக்காதீர்கள். இது போலிப் பக்கம். "ஆதரவு" ஆட்கள் உங்கள் கணினியையும் பணத்தையும் கைப்பற்ற முயல்வார்கள்.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'அது முழுத் திரையையும் நிரப்பிவிட்டது, அதனால் அதை மூடும் வழி தெரியவில்லை. முழுத் திரையிலிருந்து வெளியேற கீபோர்டின் <strong>Esc</strong> விசையை (மேல் இடது) அழுத்துங்கள்.',
         hints: {'call-btn': 'வேண்டாம்! Esc விசையை அழுத்துங்கள்.', 'fake-close': 'பக்கத்தில் உள்ள பட்டன்கள் பொறிகளாக இருக்கலாம். அதற்குப் பதிலாக உங்கள் கீபோர்டில் Esc விசையை அழுத்துங்கள்.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'இப்போது உலாவி தெரிகிறது. அதன் ⟦x⟧ மூலம் <strong>டேப்பை மூடுங்கள்</strong>.',
         hints: {'call-btn': 'பக்கத்தில் எதையும் கிளிக் செய்யாதீர்கள். டேப்பின் ⟦x⟧ மூலம் அதை மூடுங்கள்.', 'fake-close': 'அது மோசடிப் பக்கத்தின் பகுதி. டேப்பிலேயே உள்ள ⟦x⟧ ஐப் பயன்படுத்துங்கள்.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'அது உங்களை அங்கேயே வைத்திருக்க முயல்கிறது. <strong>வெளியேறு என்பதைக் கிளிக் செய்யுங்கள்.</strong>', hints: {stay: 'வெளியேறு என்பதைக் கிளிக் செய்யுங்கள்.'}},
        {screen: c => scareware(os, c), question: {q: 'அது மூடவே மாட்டேன் என்றால் என்ன செய்வது?', options: [
            {t: os === 'windows' ? 'Task Manager-ஐத் திறக்க Ctrl + Shift + Esc ஐ அழுத்தி, உலாவியைத் தேர்ந்தெடுத்து End task என்பதைக் கிளிக் செய்யுங்கள்' : os === 'mac' ? '⟦command⟧ Cmd + Option + Esc ஐ அழுத்தி உலாவியை Force Quit செய்யுங்கள்' : 'பேனலில் உள்ள உலாவியை வலது கிளிக் செய்து Close என்பதைத் தேர்ந்தெடுங்கள், அல்லது கணினியை மறுதொடங்குங்கள்',
             ok: true, why: 'ஆம். உலாவியை மீண்டும் திறக்கும்போது, பழைய பக்கங்களை மீட்டெடுக்க விடாதீர்கள். கணினியை மறுதொடங்குவதும் வேலை செய்யும்.'},
            {t: 'அதை மூட உதவி பெற அந்த எண்ணை அழைப்பேன்', why: 'ஒருபோதும் அழைக்காதீர்கள். ' + (os === 'windows' ? 'உலாவியை மூட Ctrl + Shift + Esc (Task Manager) ஐப் பயன்படுத்துங்கள்.' : os === 'mac' ? 'Force Quit செய்ய ⟦command⟧ Cmd + Option + Esc ஐப் பயன்படுத்துங்கள்.' : 'பேனலிலிருந்து உலாவியை மூடுங்கள், அல்லது மறுதொடங்குங்கள்.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கணினியில் வைரஸ் தொற்றவே இல்லை: அது ஒரு வலைப்பக்கம் மட்டுமே. இது போன்ற ஓர் எண்ணை நீங்கள் அழைத்திருந்தால், உங்கள் வங்கியைத் தொடர்புகொண்டு, வேறொரு சாதனத்திலிருந்து உங்கள் கடவுச்சொற்களை மாற்றுங்கள்.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows Security', `<div class="aif"><h3>வைரஸ் &amp; அச்சுறுத்தல் பாதுகாப்பு</h3><p class="mj">⟦check⟧ தற்போதைய அச்சுறுத்தல்கள் இல்லை</p>
                <p class="cf">கடைசி ஸ்கேன்: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">விரைவு ஸ்கேன் நடக்கிறது… 12,840 கோப்புகள் ஸ்கேன் செய்யப்பட்டன</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ வைரஸ் பாதுகாப்பு</span><span>⟦check⟧ ஃபயர்வால்</span><span>⟦check⟧ செயலி &amp; உலாவி கட்டுப்பாடு</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'ஃபயர்வால் உள்ளமைவு', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ ஃபயர்வால் இயக்கத்தில் உள்ளது</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows-இல் <strong>Windows Security</strong> எனப்படும் இலவச வைரஸ் தடுப்பு உள்ளமைந்துள்ளது. அது வேலை செய்கிறதா எனப் பார்ப்போம். <strong>தொடக்கத்தைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>அமைப்புகளைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: 'இடதில் <strong>தனியுரிமை &amp; பாதுகாப்பு என்பதைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Windows Security-ஐக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'பச்சை டிக் குறிகள் நீங்கள் பாதுகாக்கப்பட்டுள்ளீர்கள் என்று அர்த்தம். மன நிம்மதிக்கு, <strong>விரைவு ஸ்கேனைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'இன்னொரு வைரஸ் தடுப்புக்கும் பணம் செலுத்த வேண்டுமா?', options: [
            {t: 'இல்லை. பெரும்பாலானவர்களுக்கு Windows Security போதும், இரண்டு இருந்தால் கணினி மெதுவாகலாம்', ok: true, why: 'ஆம். Windows-ஐப் புதுப்பித்தும் Windows Security-ஐ இயக்கத்திலும் வையுங்கள். கட்டண வைரஸ் தடுப்புகள் பெரும்பாலும் பாப்-அப்களையும் சந்தாக்களையும் மட்டுமே சேர்க்கும்.'},
            {t: 'ஆம், எவ்வளவு அதிகமோ அவ்வளவு நல்லது', why: 'இரண்டு வைரஸ் தடுப்பு நிரல்கள் ஒன்றோடொன்று மோதி எல்லாவற்றையும் மெதுவாக்கலாம். பெரும்பாலானவர்களுக்கு Windows Security போதும்.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac-களில் செயலிகளையும் கோப்புகளையும் பின்னணியில் சரிபார்க்கும் இலவசப் பாதுகாப்பு உள்ளமைந்துள்ளது. ஓர் அமைப்பைப் பார்ப்போம். <strong>Apple மெனுவைக் கிளிக் செய்யுங்கள்</strong> (லோகோ).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>சிஸ்டம் அமைப்புகள்… என்பதைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: 'இடதில் <strong>தனியுரிமை &amp; பாதுகாப்பு என்பதைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, c, 'privacy')}),
         question: {q: '"App Store & அறியப்பட்ட டெவலப்பர்களிடமிருந்து செயலிகளை அனுமதி" தேர்ந்தெடுக்கப்பட்டுள்ளது. இதை மாற்ற வேண்டுமா?', options: [
            {t: 'இல்லை, அப்படியே விடுங்கள். தெரியாத உருவாக்குநர்களின் செயலிகளை அது தடுக்கும்', ok: true, why: 'ஆம். ஏதாவது நிறுவ இதை மாற்றும்படி ஓர் இணையதளம் சொன்னால், அது பெரிய எச்சரிக்கை அடையாளம்.'},
            {t: 'ஆம், எங்கிருந்தும் செயலிகளை அனுமதிப்பேன்', why: 'அப்படியே விடுங்கள். தெரியாத உருவாக்குநர்களின் செயலிகளை அது தடுக்கும். இதை மாற்றும்படி ஓர் இணையதளம் சொன்னால் அது எச்சரிக்கை அடையாளம்.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'சிஸ்டம் அமைப்புகள்', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Mac-க்கு வைரஸ் தடுப்பு வாங்க வேண்டுமா?', options: [
            {t: 'பெரும்பாலானவர்களுக்கு வேண்டாம். புதுப்பித்து வையுங்கள், நம்பகமான இடங்களிலிருந்து மட்டுமே செயலிகளை நிறுவுங்கள்', ok: true, why: 'ஆம். புதுப்பிப்புகளும் உள்ளமைந்த பாதுகாப்பும் வேலையைச் செய்கின்றன. உங்கள் Mac-இல் வைரஸ் தொற்றியுள்ளது என்று சொல்லும் பாப்-அப்கள் மோசடிகள்.'},
            {t: 'ஆம், எந்தப் பாப்-அப் வழங்குகிறதோ அதை', why: 'Mac வைரஸ் தடுப்பு வழங்கும் பாப்-அப்கள் பெரும்பாலும் மோசடிகள். அதற்குப் பதிலாக உங்கள் Mac-ஐப் புதுப்பித்து வையுங்கள்.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint-இல் தேவையற்ற இணைப்புகளைத் தடுக்கும் உள்ளமைந்த <strong>ஃபயர்வால்</strong> உள்ளது. நீங்கள் இயக்கும் வரை அது அணைந்திருக்கும். <strong>மெனுவைக் கிளிக் செய்யுங்கள்.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>ஃபயர்வாலைக் கிளிக் செய்யுங்கள்.</strong> <em>(தெரியவில்லையென்றால் மெனுவில் "firewall" எனத் தேடுங்கள்.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: 'ஃபயர்வாலை இயக்க <strong>நிலை சுவிட்சைக் கிளிக் செய்யுங்கள்</strong>.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Linux Mint-ஐப் பாதுகாப்பாக வைத்திருக்க வேறு என்ன உதவும்?', options: [
            {t: 'கேடயத்தில் புள்ளி தெரியும்போது புதுப்பிப்புகளை நிறுவுவது, மென்பொருள் மேலாளரிலிருந்து செயலிகளைப் பெறுவது', ok: true, why: 'ஆம். வழக்கமான விதிகளும்: மின்னஞ்சல் இணைப்புகளிலும் பாப்-அப்களிலும் கவனமாக இருங்கள்.'},
            {t: 'வேறு எதுவும் தேவையில்லை', why: 'தொடர்ந்து புதுப்பிப்புகளை நிறுவுங்கள், மென்பொருள் மேலாளரிலிருந்து செயலிகளைப் பெறுங்கள். மின்னஞ்சல், இணையதள மோசடிகள் இன்னும் பொருந்தும்.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>சபாஷ்!</strong> உங்கள் கணினியின் உள்ளமைந்த பாதுகாப்பு இயக்கத்தில் உள்ளது. புதுப்பிப்புகள், இணைப்புகளில் கவனம், நம்பகமான இடங்களிலிருந்து மட்டுமே நிறுவுதல் ஆகியவை மீதியைச் செய்யும்.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>பார்சல் டெலிவரி</strong><span>உங்களைச் சந்திக்க முடியவில்லை: இன்றே டெலிவரியை மறுஏற்பாடு செய்யுங்கள்</span></button>
            <div class="lx"><strong>Sarah</strong><span>ஞாயிற்றுக்கிழமைப் புகைப்படங்கள்</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>சனிக்கிழமை நடை</span></div></div>`;
        const mail = `<div class="aau"><p><strong>பார்சல் டெலிவரி</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>இன்று உங்கள் பார்சலை டெலிவரி செய்ய முயன்றோம், ஆனால் வீட்டில் யாரும் இல்லை. டெலிவரியை மறுஏற்பாடு செய்ய £1.45 கட்டணம் தேவை.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">டெலிவரியை மறுஏற்பாடு செய்</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ ஃபிஷிங் எனப் புகாரளி</button><button type="button" data-tap="reply">பதிலளி</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'மெயில்', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ புகாரளிக்கப்பட்டு குப்பை மின்னஞ்சலுக்கு நகர்த்தப்பட்டது</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'இதோ உங்கள் மின்னஞ்சல், உலாவியில். <strong>பார்சல் டெலிவரி மின்னஞ்சலைத் திறங்கள்.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'கணினியில் ஓர் இணைப்பு உண்மையில் எங்கே செல்கிறது என்பதை <strong>கிளிக் செய்யாமலேயே</strong> பார்க்கலாம். <strong>"டெலிவரியை மறுஏற்பாடு செய்" மேல் மவுஸை நகர்த்தி</strong> அசையாமல் வையுங்கள். <em>(தொடுதிரையில், அதை அழுத்திப் பிடியுங்கள்.)</em>',
         hints: {'click-link': 'கிளிக் செய்யாதீர்கள்! மவுஸ் பாயிண்டரை அதன் மேல் வையுங்கள், அவ்வளவுதான்.'}, hint: 'கிளிக் செய்யாமல், நீல இணைப்பின் மேல் மவுஸ் பாயிண்டரை வையுங்கள்.'},
        {screen: c => webmail(os, c), question: {q: 'உண்மையான முகவரி கீழே தோன்றுகிறது: parcel-redelivery.example.top. இது பாதுகாப்பானதா?', options: [
            {t: 'இல்லை. இது உண்மையான டெலிவரி நிறுவனத்தின் இணையதளம் அல்ல, அவர்கள் கட்டணமும் கேட்கிறார்கள்', ok: true, why: 'ஆம். கூரியர்கள் மின்னஞ்சலிலோ குறுஞ்செய்தியிலோ சிறு கட்டணம் வசூலிப்பதில்லை. உண்மையான முகவரியே காட்டிக்கொடுக்கிறது.'},
            {t: 'இல்லை, அதில் "parcel" என்று இருக்கிறதே', why: 'யார் வேண்டுமானாலும் இணைய முகவரியில் "parcel" என்று வைக்கலாம். இது உண்மையான கூரியர் அல்ல, கட்டணமே மோசடி.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>ஃபிஷிங் எனப் புகாரளி என்பதைக் கிளிக் செய்யுங்கள்.</strong> மோசடி மின்னஞ்சல்களை report@phishing.gov.uk-க்கும் முன்னனுப்பலாம்.', hints: {reply: 'மோசடிக்காரர்களுக்கு ஒருபோதும் பதிலளிக்காதீர்கள். ஃபிஷிங் எனப் புகாரளி என்பதைக் கிளிக் செய்யுங்கள்.', 'click-link': 'இணைப்பைக் கிளிக் செய்யாதீர்கள்! அதற்குப் பதிலாகப் புகாரளியுங்கள்.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>சபாஷ்!</strong> கிளிக் செய்யும் முன் மவுஸை வையுங்கள்: முகவரி நிறுவனத்துடன் பொருந்தவில்லையென்றால் கிளிக் செய்யாதீர்கள்.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (பயிற்சி எண்). உங்கள் ஃபோனின் IMEI-ஐக் கண்டுபிடிக்க உதவும் உண்மையான குறியீடு இதுவே.',
        '999': 'இது ஒரு பயிற்சி ஃபோன், எனவே 999-ஐ அழைக்க முடியாது. உண்மையான அவசரத்தில், 999 அல்லது 112-ஐ அழையுங்கள்.',
        '112': 'இது ஒரு பயிற்சி ஃபோன், எனவே 112-ஐ அழைக்க முடியாது. UK-விலும் ஐரோப்பா முழுவதும் 112 என்பது 999 போலவே வேலை செய்யும்.',
        '159': '159 உங்களை உங்கள் சொந்த வங்கியுடன் பாதுகாப்பாக இணைக்கும். உங்கள் பணம் பற்றிய அழைப்பு கவலையளித்தால் இதைப் பயன்படுத்துங்கள்.',
        '7726': 'மோசடிக் குறுஞ்செய்திகளை முன்னனுப்ப வேண்டிய எண் 7726. பழைய ஃபோன் விசைப்பலகைகளில் அது "SPAM" என்று எழுதும்!',
        '123': 'speaking-clock',
        '1471': '07700 900842 என்ற ஃபோன் எண் இன்று 11:20-க்கு அழைத்தது. (பயிற்சி. உங்கள் லேண்ட்லைனை கடைசியாக அழைத்தவர் யார் என்பதை 1471 சொல்லும்.)',
        '01189998819991197253': 'அது The IT Crowd-இல் வரும் அவசர எண். அதை அணைத்து மீண்டும் இயக்கிப் பார்த்தீர்களா?',
        '101': 'அவசரமில்லாத விஷயங்களுக்கான காவல்துறை எண் 101.',
        '111': 'அவசரம் ஆனால் ஆபத்து இல்லை என்ற நிலையில் NHS உதவி 111.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'ஃபோன்', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">ஒரு எண்ணை உள்ளிடுங்கள்</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['அம்மா', '#f472b6', [['them', 'LOL என்றால் "lots of love" என்று நினைத்தேன். எல்லாவற்றிலும் அதைப் போட்டுக்கொண்டிருந்தேன்!'], ['them', 'அதனால்தான் உங்கள் அத்தை பதிலளிக்கவில்லையா?'], ['them', 'என் iPad-இலிருந்து அனுப்பப்பட்டது']]],
        ['தெரியாதது', '#94a3b8', [['them', 'வாழ்த்துகள்! நீங்கள் ஒரு இலவச ஃபோனை வென்றுள்ளீர்கள். பெற இங்கே கிளிக் செய்யுங்கள்: prize-winner.example'], ['note', 'இது ஒரு மோசடி. இணைப்பைத் தட்டாதீர்கள்: அதை 7726-க்கு முன்னனுப்பிவிட்டு, நீக்குங்கள்.']]],
        ['Sarah', '#a78bfa', [['them', 'அப்பா எமோஜிகளைப் பயன்படுத்தக் கற்றுக்கொள்கிறார் 😂'], ['them', 'அவர் எனக்கு ஒரு கத்தரிக்காயை அனுப்பி "இன்றிரவு தேநீருக்கா?" என்றார் 🍆']]],
        ['பல் மருத்துவர்', '#38bdf8', [['them', 'நினைவூட்டல்: உங்கள் சந்திப்பு செவ்வாய் 10:30-க்கு. உறுதிப்படுத்த Y என பதிலளியுங்கள்.']]],
    ];
    const MUM_REPLIES = ['இது யார்?', 'என்னை அழையுங்கள், கண்ணாடி இல்லாமல் என்னால் குறுஞ்செய்தி படிக்க முடியாது', 'அருமை! 👍', 'என் கடைசிச் செய்தி கிடைத்ததா? தவறுதலாக அதைப் பூனைக்கு அனுப்பிவிட்டேன்.', 'என் iPad-இலிருந்து அனுப்பப்பட்டது', 'சரி கண்ணே xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'செய்திகள்', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'கடற்புறா மீண்டும் தாக்கியது' : 'புகைப்படம்', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Bridlington கடற்கரையோரத்தில் கையும் களவுமாக. சிப்ஸ் மீட்கப்படவில்லை.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'புகைப்படங்கள்', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'கடிகாரம்', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'வானிலை', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'குளிர், பனித்தூறலுடன்' : 'இடையிடையே வெயில், காற்று'}</p>
            <div class="ajf">${[['வெள்ளி', '⟦cloud-rain⟧', '11°'], ['சனி', '⟦wind⟧', '10°'], ['ஞாயிறு', '⟦sun⟧', '14°'], ['திங்கள்', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">கடற்புறா எச்சரிக்கை: <strong>அதிகம்</strong>. உங்கள் சிப்ஸைக் காத்துக்கொள்ளுங்கள்.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'அலமாரி வழியாகச் சென்று, பிறகு விளக்குக் கம்பத்தைக் கடந்து நடந்துகொண்டே இருங்கள்.', home: 'வீடு போன்ற இடம் வேறு இல்லை. 🏠', 'நிலா': '238,855 மைல். போக்குவரத்து குறைவு.',
        chips: 'அருகிலுள்ள சிப்ஸ் கடை: Bridlington கடற்கரையோரத்தில் எங்கும். 🍟', 'north pole': 'சாண்டாவின் பட்டறை. டிசம்பர் வரை மூடப்பட்டுள்ளது. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. அருமையான இடம்!',
        'flamborough': 'Flamborough Head: கலங்கரை விளக்கம், பாறைகள், பஃபின்கள். 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": இந்தப் பயிற்சி வரைபடத்துக்குச் சில இடங்களே தெரியும். Bridlington, Flamborough அல்லது Narnia-வை முயலுங்கள்.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'அமைப்புகள்', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'ஏர்பிளேன் பயன்முறை' : 'ஏர்பிளேன் பயன்முறை', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'புளூடூத்', st.bt)}</div>
            <div class="lq">${row('dark', 'இருண்ட பயன்முறை', st.dark)}${row('dnd', 'தொந்தரவு செய்ய வேண்டாம்', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'பற்றி' : 'ஃபோன் பற்றி'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'பற்றி' : 'ஃபோன் பற்றி', `<div class="aic"><div class="lq">
            <div class="ho"><span>பெயர்</span><b>Margaret-இன் ஃபோன்</b></div>
            <div class="ho"><span>மாடல்</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS பதிப்பு' : 'Android பதிப்பு'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>சேமிப்பகம்</span><b>பேரக்குழந்தைகளின் புகைப்படங்களுக்குப் போதுமான அளவு</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>வரிசை எண்</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'பழைய மொபைல் ஃபோன்களின் கிளாசிக் விளையாட்டு.'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', 'விளம்பரங்கள் உள்ளன · செயலிக்குள் வாங்குதல்கள்'], ['knit', '⟦scissors⟧', 'பின்னல் வடிவங்கள்', 'இந்தப் பயிற்சிக் கடைக்கு விரைவில் வருகிறது.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'திற' : (p === 'ios' ? 'Get' : 'Install')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>மதிப்பெண்: <b class="ado">0</b></span><span>சிறந்தது: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">தொடங்க ஒரு திசையைத் தட்டுங்கள் (அல்லது அம்புக்குறி விசைகளைப் பயன்படுத்துங்கள்)</p>
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
                f.querySelector('.vy').textContent = `ஆட்டம் முடிந்தது! மதிப்பெண் ${score}. மீண்டும் விளையாட ஒரு திசையைத் தட்டுங்கள்.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'ஏர்பிளேன்', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'புளூடூத்', st.bt)}${t('dnd', '⟦moon⟧', 'தொந்தரவு செய்ய வேண்டாம்', st.dnd)}${t('torch', '⟦flashlight⟧', 'டார்ச்', st.torch)}${t('dark', '⟦sun-moon⟧', 'இருண்ட பயன்முறை', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'மூட மேலே ஸ்வைப் செய்யுங்கள்' : 'மூடு'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'புதிய வால்பேப்பர்');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"மூன்றாவது ஒலியில், நேரம் ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} மற்றும் ${t.getSeconds()} விநாடிகள்… பீப், பீப், பீப்." (பழைய பேசும் கடிகாரம்!)`; return; }
                msg.textContent = egg || (n ? 'இந்தப் பயிற்சி ஃபோனால் உண்மையான அழைப்புகள் செய்ய முடியாது. 123, 1471 அல்லது *#06# ஐ முயலுங்கள்…' : 'முதலில் ஒரு எண்ணைத் தட்டச்சு செய்யுங்கள்.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'உங்கள் பரிசைப் பெற உங்கள் வங்கி விவரங்களை அனுப்புங்கள்!!! (இது ஒரு மோசடி. இந்த எண்ணைத் தடுங்கள்.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'நன்றி, உங்கள் சந்திப்பு உறுதிப்படுத்தப்பட்டது. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'மெயில்', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'தொடக்கம்'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'நிறுத்து'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'தொடக்கம்'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ சன் கிரீம் போட்டாச்சு! இது கிட்டத்தட்ட Costa del Bridlington தான்.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ டார்ச் இயக்கத்தில் உள்ளது. (பின்புற விளக்குக்குப் பதிலாக திரை ஒளிர்கிறது.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ ஏர்பிளேன் பயன்முறை இயக்கத்தில்: அழைப்புகள், குறுஞ்செய்திகள், மொபைல் டேட்டா இல்லை.' : 'ஏர்பிளேன் பயன்முறை அணைந்தது.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'வால்பேப்பர் மாற்றப்பட்டது. பார்க்க முகப்புக்குச் செல்லுங்கள்!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ நீங்கள் இப்போது ஒரு டெவலப்பர்! (உண்மையான Android ரகசியம்: பில்ட் எண்ணை 7 முறை தட்டுங்கள்.)' : st.build >= 3 ? `டெவலப்பர் ஆக இன்னும் ${7 - st.build} படிகள் உள்ளன.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>பயிற்சி செய்ததற்கு நன்றி!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'உங்களுக்கு டார்ச் செயலி தேவையில்லை: அது உங்கள் ஃபோனின் விரைவு அமைப்புகளிலேயே உள்ளமைந்துள்ளது. இலவச டார்ச் செயலிகள் பெரும்பாலும் விளம்பரங்களால் நிறைந்தவை, அல்லது அதைவிட மோசம்!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'பயிற்சிக் கடையில் காட்சிக்காக மட்டுமே.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'நிறுவுகிறது…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'திற'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'செயலி (ஆப்)', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>இந்தப் பயிற்சிச் செயலி அதற்கே உரிய பாடத்தின் ஒரு பகுதி. அதைச் சரியாக முயல கற்றுக்கொள்ளுங்கள் பாடநெறிகளைப் பாருங்கள்.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ நீங்கள் ஒரு ரகசியத்தைக் கண்டுபிடித்துவிட்டீர்கள்!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'அழைப்பு முடிந்தது' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'தெரியாதது' ? 'அழைப்பவர்' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'தெரியாதது', number: '0161 496 0423', who: 'm', tag: 'உங்கள் தொடர்புகளில் இல்லை',
         intro: 'உங்கள் ஃபோன் ஒலிக்கிறது. அந்த எண் உங்கள் தொடர்புகளில் சேமிக்கப்படவில்லை. பழக <strong>பதிலளியுங்கள்</strong>. <em>அழைப்பவர் பேசுவது கேட்க உங்கள் ஒலியைக் கூட்டுங்கள்.</em>',
         lines: [
            {text: 'வணக்கம், நான் உங்கள் வங்கியின் மோசடித் தடுப்புக் குழுவிலிருந்து Mark பேசுகிறேன். உங்கள் கணக்கில் சந்தேகத்துக்குரிய சில பணம் செலுத்துதல்களைக் கண்டறிந்தோம். நான் தொடரும் முன், உங்கள் முழுப் பெயர், பிறந்த தேதி, வங்கி கார்டில் உள்ள நீண்ட எண்ணை உறுதிப்படுத்த முடியுமா?',
             q: 'அழைப்பவர் தான் உங்கள் வங்கியிலிருந்து என்கிறார். நீங்கள் என்ன செய்வீர்கள்?', options: [
                {t: 'விவரங்களைக் கொடுப்பேன், அவர் வங்கியிலிருந்து தானே', why: 'உங்களை அழைக்கும் வங்கி ஒருபோதும் உங்கள் முழு கார்டு எண்ணைக் கேட்காது. இப்படித்தான் மோசடிக்காரர்கள் உங்கள் விவரங்களைப் பெறுகிறார்கள்.'},
                {t: 'உங்கள் கார்டில் உள்ள எண்ணில் வங்கியைத் திருப்பி அழைப்பேன் என்று சொல்லி, துண்டிப்பேன்', ok: true, why: 'சரியே. உங்கள் கார்டில் உள்ள எண்ணில், முடிந்தால் வேறொரு ஃபோனிலிருந்து அழையுங்கள், அல்லது 159-ஐ அழையுங்கள்.'},
                {t: 'அவர் யார் என்று நிரூபிக்கச் சொல்வேன்', why: 'மோசடிக்காரர்கள் நம்பும்படி பேசுவார்கள், உங்கள் சில விவரங்கள் அவர்களுக்கு ஏற்கெனவே தெரிந்திருக்கும். துண்டித்துவிட்டு நீங்களே உங்கள் வங்கியை அழைப்பதே மிகப் பாதுகாப்பானது.'}]},
            {text: 'தயவுசெய்து துண்டிக்காதீர்கள்! குற்றவாளிகள் இப்போதே உங்கள் கணக்கிலிருந்து பணம் எடுக்கிறார்கள். நான் உங்களுக்காக அமைக்கும் ஒரு பாதுகாப்பான கணக்குக்கு எல்லாவற்றையும் மாற்ற வேண்டும். அடுத்த பத்து நிமிடங்களுக்குள் செய்ய வேண்டும்.',
             q: 'இது அவசரம், உங்கள் பணத்தை மாற்ற வேண்டும் என்கிறார். இப்போது என்ன?', options: [
                {t: 'மிகத் தாமதமாகும் முன் விரைவாகப் பணத்தை மாற்றுவேன்', why: '"பாதுகாப்பான கணக்கு" என்று எதுவும் இல்லை. உங்கள் வங்கி ஒருபோதும் பணத்தை மாற்றச் சொல்லாது. இதுவே மோசடி.'},
                {t: 'துண்டிப்பேன். உண்மையான வங்கி ஒருபோதும் "பாதுகாப்பான கணக்குக்கு" பணத்தை மாற்றச் சொல்லாது', ok: true, why: 'ஆம். அவசரமும் "பாதுகாப்பான கணக்கும்" காட்டிக்கொடுக்கின்றன. துண்டித்துவிட்டு 159-ஐ அழையுங்கள்.'}]}],
         hang: 'சிவப்புப் பட்டனால் துண்டியுங்கள்.'},
        {letter: '?', color: '#64748b', name: 'தெரியாதது', number: '020 7946 0815', who: 'robot', tag: 'உங்கள் தொடர்புகளில் இல்லை',
         intro: 'இன்னொரு அழைப்பு. <strong>பதிலளியுங்கள்.</strong>',
         lines: [
            {text: 'இது H M R C-இடமிருந்து ஒரு தானியங்கிச் செய்தி. செலுத்தப்படாத வரிக்காக உங்களைக் கைது செய்ய வாரண்ட் பிறப்பிக்கப்பட்டுள்ளது. ஓர் அதிகாரியுடன் பேச, இப்போதே 1-ஐ அழுத்துங்கள்.',
             q: 'வரி தொடர்பாக உங்களைக் கைது செய்வார்கள் என்று பதிவுசெய்யப்பட்ட குரல் சொல்கிறது. நீங்கள் என்ன செய்வீர்கள்?', options: [
                {t: 'சரிசெய்ய 1-ஐ அழுத்துவேன்', why: '1-ஐ அழுத்தினால் உங்களை மோசடிக்காரர்களிடம் இணைக்கும்; அவர்கள் பெரும்பாலும் பரிசு அட்டைகளில் பணம் கேட்பார்கள். பதிவுசெய்யப்பட்ட செய்தியில் HMRC ஒருபோதும் கைது செய்வோம் என்று மிரட்டாது.'},
                {t: 'துண்டிப்பேன். HMRC கைது மிரட்டல்களுடன் அழைக்காது', ok: true, why: 'சரி. HMRC முதலில் உங்களுக்குக் கடிதம் எழுதும், ஃபோனில் ஒருபோதும் கைது செய்வோம் என்று மிரட்டாது.'}]}],
         hang: 'துண்டியுங்கள்.'},
        {letter: '?', color: '#64748b', name: 'தெரியாதது', number: '0113 496 0332', who: 'm', tag: 'உங்கள் தொடர்புகளில் இல்லை',
         intro: 'மீண்டும் உங்கள் ஃபோன். <strong>பதிலளியுங்கள்.</strong>',
         lines: [
            {text: 'வணக்கம், நான் Windows தொழில்நுட்பப் பிரிவிலிருந்து அழைக்கிறேன். உங்கள் கணினி எங்களுக்குப் பிழைச் செய்திகளை அனுப்பிக்கொண்டிருக்கிறது, அதில் மிக ஆபத்தான வைரஸ் உள்ளது. தயவுசெய்து உங்கள் கணினியை இயக்குங்கள், நான் அதைச் சரிசெய்ய உதவுகிறேன்.',
             q: 'உங்கள் கணினியில் வைரஸ் இருப்பதாக அவர் சொல்கிறார். நீங்கள் என்ன செய்வீர்கள்?', options: [
                {t: 'கணினியை இயக்கி, அவர் சொல்வதைப் பின்பற்றுவேன்', why: 'உங்கள் கணினியைக் கட்டுப்படுத்த அனுமதிக்கும் ஒரு நிரலை நிறுவச் சொல்லி, பிறகு பணம் கேட்பார். Microsoft இப்படி ஒருபோதும் அழைக்காது.'},
                {t: 'துண்டிப்பேன். கணினி நிறுவனங்கள் வைரஸ்களைப் பற்றி அழைப்பதில்லை', ok: true, why: 'சரியே. அழைப்பவரை ஒருபோதும் உங்கள் கணினிக்குள் அனுமதிக்காதீர்கள்.'},
                {t: 'என்னிடம் கணினி இல்லை என்று விளக்குவேன்', why: 'விளக்கவோ வாதிடவோ தேவையில்லை. துண்டித்துவிடுங்கள்.'}]}],
         hang: 'துண்டியுங்கள்.'},
        {letter: '?', color: '#64748b', name: 'தெரியாதது', number: '0808 157 0190', who: 'f', tag: 'உங்கள் தொடர்புகளில் இல்லை',
         intro: 'இன்னொரு அழைப்பு. <strong>பதிலளியுங்கள்.</strong>',
         lines: [
            {text: 'வணக்கம். தொள்ளாயிரத்துத் தொண்ணூற்றொன்பது பவுண்டு மதிப்புள்ள புதிய iPhone-க்கான ஆர்டர் உங்கள் ஆன்லைன் ஷாப்பிங் கணக்கில் செய்யப்பட்டுள்ளது. இந்த ஆர்டரை நீங்கள் செய்யவில்லையென்றால், அதை ரத்துசெய்து எங்கள் குழுவுடன் பேச 1-ஐ அழுத்துங்கள்.',
             q: 'நீங்கள் iPhone ஆர்டர் செய்யவில்லை. என்ன செய்வீர்கள்?', options: [
                {t: 'ஆர்டரை ரத்துசெய்ய 1-ஐ அழுத்துவேன்', why: '1-ஐ அழுத்தினால் உங்களை ஒரு மோசடிக்காரரிடம் இணைக்கும்; அவர் உங்கள் வங்கி விவரங்களையோ உங்கள் கணினியின் கட்டுப்பாட்டையோ கேட்டு "பணத்தைத் திருப்பித் தருவார்".'},
                {t: 'துண்டித்துவிட்டு, செயலியிலோ இணையதளத்திலோ நானே என் கணக்கைச் சரிபார்ப்பேன்', ok: true, why: 'ஆம். உண்மையிலேயே ஆர்டர் இருந்தால், உங்கள் கணக்கில் தெரியும். அழைப்பவர் தரும் எண்ணையோ பட்டனையோ ஒருபோதும் பயன்படுத்தாதீர்கள்.'}]}],
         hang: 'துண்டியுங்கள்.'},
        {letter: 'S', color: '#16a34a', name: 'மருத்துவமனை', number: '01632 960211', who: 'f', tag: 'உங்கள் தொடர்புகளில் சேமிக்கப்பட்டது',
         intro: 'இன்னும் ஒரு அழைப்பு: இந்த முறை உங்கள் தொடர்புகளில் சேமிக்கப்பட்ட மருத்துவமனை. <strong>பதிலளியுங்கள்.</strong>',
         lines: [
            {text: 'வணக்கம், நான் மருத்துவமனையிலிருந்து Sue. உங்கள் காய்ச்சல் தடுப்பூசி செவ்வாய் காலை பத்து மணிக்கு முன்பதிவாகியுள்ளது என்ற சிறிய நினைவூட்டல்தான். நீங்கள் எதுவும் செய்ய வேண்டியதில்லை. மாற்ற வேண்டுமென்றால், வழக்கமான எண்ணில் எங்களை அழையுங்கள். இப்போதைக்கு வணக்கம்!',
             q: 'இந்த அழைப்பு மோசடியா?', options: [
                {t: 'ஆம்: துண்டித்து அந்த எண்ணைத் தடுப்பேன்', why: 'இது சரிதான்! அவர் எதையும் கேட்கவில்லை, உங்களை அவசரப்படுத்தவில்லை, வழக்கமான எண்ணைப் பயன்படுத்தச் சொன்னார்.'},
                {t: 'ஒருவேளை உண்மையானது: அவர் பணமோ விவரங்களோ கேட்கவில்லை, வழக்கமான எண்ணில் அழைக்கச் சொன்னார்', ok: true, why: 'சரியே. உண்மையான அழைப்புகள் உங்களை நெருக்குவதில்லை. எப்போதாவது சந்தேகம் இருந்தால், உங்களிடம் ஏற்கெனவே உள்ள எண்ணில் திருப்பி அழையுங்கள்.'}]}],
         hang: 'அழைப்பு முடிந்துவிட்டது. துண்டிக்க <strong>சிவப்புப் பட்டனைத் தட்டுங்கள்</strong>.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>அழைப்பு ${n + 1} / ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'நிஜ வாழ்க்கையில், தெரியாத எண்களுக்குப் பதிலளிக்காமல் இருப்பதும் சரிதான்! இந்தப் பயிற்சிக்கு, பதிலளிக்கப் பச்சைப் பட்டனைத் தட்டுங்கள்.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'இவற்றில் எது மோசடி அழைப்பின் அடையாளம்?', options: [
            {t: 'அவசரப்படுத்தப்படுவது, மிரட்டப்படுவது, அல்லது ரகசியமாக வைக்கச் சொல்லப்படுவது', ok: true, why: 'ஆம். நெருக்கடியே மிகப் பெரிய காட்டிக்கொடுப்பு. உண்மையான அழைப்பாளர் நீங்கள் நிதானமாக யோசித்துத் திருப்பி அழைப்பதை விரும்புவார்.'},
            {t: 'அழைப்பவருக்கு உங்கள் பெயர் தெரியும்', why: 'மோசடிக்காரர்களுக்கு உங்கள் பெயரும், சில கணக்கு விவரங்களும் கூடப் பெரும்பாலும் தெரியும். அதனால் மட்டும் ஓர் அழைப்பு உண்மையானது ஆகிவிடாது.'},
            {t: 'எண் உள்ளூர் எண் போலத் தெரிகிறது', why: 'மோசடிக்காரர்கள் உங்கள் திரையில் எந்த எண்ணையும், உள்ளூர் எண்ணையோ உங்கள் வங்கியின் எண்ணையோ கூடத் தோன்றச் செய்ய முடியும். எண்ணை நம்பாதீர்கள்.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>சபாஷ்!</strong> நான்கு மோசடிக்காரர்களைத் துண்டித்து, உண்மையான அழைப்பைக் கண்டறிந்தீர்கள். நினைவில் வையுங்கள்: சந்தேகம் இருந்தால் துண்டியுங்கள், நீங்கள் நம்பும் எண்ணில் திருப்பி அழையுங்கள். உங்கள் வங்கிக்கு 159-ஐ டயல் செய்யுங்கள்.'},
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
            ios: ['iPhone', 'Apple தயாரிப்பு'], android: ['Android (ஆண்ட்ராய்டு)', 'Samsung, Google Pixel, Motorola மற்றும் பிற'],
            windows: ['Windows', 'பெரும்பாலான லேப்டாப்கள், டெஸ்க்டாப் PC-கள்'], mac: ['Mac', 'Apple தயாரிப்பு: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu மற்றும் பிற'],
        };
        const notSure = isPC
            ? 'உங்கள் திரையைப் பாருங்கள். Windows-இல் கீழே தொடக்கப் பட்டன் (நான்கு சிறு சதுரங்கள்) இருக்கும். Mac-இல் மேல் இடதில் Apple லோகோ இருக்கும். Linux Mint-இல் கீழ் இடதில் மெனு பட்டன் இருக்கும்.'
            : 'iPhone-இன் பின்புறத்தில் Apple லோகோ (கடிக்கப்பட்ட ஆப்பிள்) இருக்கும். உங்களுடையதில் இல்லையென்றால், அது கிட்டத்தட்ட நிச்சயமாக Android ஃபோன்.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>${isPC ? 'நீங்கள் பயன்படுத்தும் கணினி எது' : 'உங்களிடம் உள்ள ஃபோன் எது'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>உறுதியாகத் தெரியவில்லையா?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>எங்கே என்று காட்டு</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ மீண்டும் கேள்</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">ஒரு படி பின்னால்</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>மாறு ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">${isPC ? 'பயிற்சிக் கணினி' : 'பயிற்சி ஃபோன்'}: உண்மையானது அல்ல. இங்கே நீங்கள் செய்யும் எதுவும் எங்கும் அனுப்பப்படாது.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'குரலை அணை' : 'குரலை இயக்கு'; };
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
            showBtn.textContent = 'பாடத்துக்குத் திரும்பு';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'எங்கே என்று காட்டு';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'முடிந்தது!' : `படி ${i + 1} / ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'சரி!' : 'இன்னும் சரியாகவில்லை.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">தொடருங்கள்</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">மீண்டும் முயலுங்கள்</button>${pageNext
                ? `<button type="button" class="ap vb">நன்று! ${last ? 'இப்போது பாடநெறியை முடியுங்கள்' : 'அடுத்த பாடத்தை முயன்று பார்க்கலாமே'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('இன்னும் சரியாகவில்லை. ' + (step.hint || 'வழிமுறைகளை மீண்டும் ஒருமுறை பாருங்கள்.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'இன்னும் சரியாகவில்லை. வழிமுறைகளை மீண்டும் ஒருமுறை பாருங்கள்.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('இன்னும் சரியாகவில்லை. ' + (step.hint || 'வழிமுறைகளை மீண்டும் ஒருமுறை பாருங்கள்.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'செயலி (ஆப்)';
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
                else hint.textContent = 'வலது கிளிக் செய்யுங்கள்: வலது பக்க மவுஸ் பட்டனை அழுத்துங்கள். Mac டிராக்பேடில் இரண்டு விரல்களால் கிளிக் செய்யுங்கள். தொடுதிரையில் அழுத்திப் பிடியுங்கள்.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'ஏதாவது நடக்கும் வரை அதன் மேல் உங்கள் விரலை (அல்லது மவுஸ் பட்டனை) அழுத்தி வைத்திருங்கள்.';
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
                showBtn.textContent = 'எங்கே என்று காட்டு';
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
