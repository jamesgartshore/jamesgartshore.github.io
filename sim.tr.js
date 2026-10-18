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
            ? [['phone', 'Telefon', '#22c55e', ICON.phone], ['messages', 'Mesajlar', '#22c55e', ICON.bubble], ['camera', 'Kamera', '#6b7280', ICON.camera],
               ['photos', 'Fotoğraflar', '#e5e7eb', ICON.photos], ['mail', 'Mail', '#3b82f6', ICON.mail], ['clock', 'Saat', '#111827', ICON.clock],
               ['weather', 'Hava Durumu', '#38bdf8', ICON.weather], ['maps', 'Haritalar', '#22c55e', ICON.map], ['settings', 'Ayarlar', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Telefon', '#2563eb', ICON.phone], ['messages', 'Mesajlar', '#3b82f6', ICON.bubble], ['camera', 'Kamera', '#6b7280', ICON.camera],
               ['photos', 'Fotoğraflar', '#e5e7eb', ICON.photos], ['clock', 'Saat', '#111827', ICON.clock], ['maps', 'Haritalar', '#16a34a', ICON.map],
               ['settings', 'Ayarlar', '#475569', ICON.settings], ['weather', 'Hava Durumu', '#38bdf8', ICON.weather], ['mail', 'E-posta', '#ef4444', ICON.mail],
               ['store', 'Play Store', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Sağ üst köşeden aşağı kaydırın ⟦chevron-down⟧' : 'Üstten aşağı kaydırın ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Bugün</div>
                <div class="hp"><span>ÖNE ÇIKAN</span><strong>Bu hafta sevdiğimiz uygulamalar</strong></div>
                <div class="hp alt"><span>BAŞLAYIN</span><strong>Yeni iPhone'unuz için fikirler</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Bugün</button><button type="button" data-tap="games">Oyunlar</button>
                    <button type="button" data-tap="apps">Uygulamalar</button><button type="button" data-tap="search-tab">${ICON.search}Ara</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Uygulama ve oyun ara</span></button>
            <div class="tg"><span class="on">Sizin İçin</span><span>En Çok Kullanılanlar</span><span>Çocuklar</span></div>
            <div class="hp"><span>SİZİN İÇİN ÖNERİLEN</span><strong>Başlamanız için uygulamalar</strong></div>
            <div class="hp alt"><span>POPÜLER</span><strong>İletişimde kalın</strong></div>
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
        const btnLabel = p === 'ios' ? 'Al' : 'Yükle';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 milyar+ indirme' : 'Sosyal Ağ'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Ücretsiz</span></div></div>
                <p class="agm">Gerçek iPhone'unuzda yan düğmeye çift tıklamanız, Face ID için ekrana bakmanız ya da Apple Hesabı şifrenizi buraya yazmanız gerekebilir.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Yükle</button>
                <button type="button" class="cp" data-tap="sheet-cancel">İptal</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>WhatsApp'a Hoş Geldiniz</h3>
            <p>Okuyun: <u>Gizlilik Politikamız</u>. <u>Hizmet Şartları</u>'nı kabul etmek için "Kabul Et ve Devam Et"e dokunun.</p>
            <button type="button" class="ce ox" data-tap="agree">Kabul Et ve Devam Et</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Telefon numaranızı girin</h3>
            <p>WhatsApp'ın telefon numaranızı doğrulaması gerekecek. Operatör ücretleri uygulanabilir.</p>
            <div class="abt">Birleşik Krallık <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">İleri</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Numara doğru mu?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Düzenle</button><button type="button" data-tap="yes">${ios ? 'Evet' : 'Tamam'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>MESAJLAR · şimdi</strong><span>WhatsApp kodunuz: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Bu kodu başkalarıyla paylaşmayın.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Numaranız doğrulanıyor</h3>
            <p><strong>+44 ${NUMBER}</strong> numarasına SMS ile gönderilen 6 haneli kod otomatik olarak algılanmayı bekliyor.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Kod almadınız mı?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['"WhatsApp" Kişilerinize Erişmek İstiyor', 'Arkadaşlarınızdan hangilerinin WhatsApp kullandığını görebilmeniz için.', 'WhatsApp\'ın kişilerinize erişmesine izin verilsin mi?']
            : ['"WhatsApp" Size Bildirim Göndermek İstiyor', 'Yeni bir mesaj geldiğinde haberiniz olsun diye.', 'WhatsApp\'ın size bildirim göndermesine izin verilsin mi?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Profil bilgisi</h3>
            <p>Lütfen adınızı yazın ve isterseniz bir profil fotoğrafı ekleyin.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Adınız</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">İleri</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Sohbetler' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Hazırsınız${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Sohbetleriniz burada görünecek. Kişilerinizden birine mesaj yazmak için yeni sohbet düğmesine dokunun.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Burası telefonunuzun ana ekranı. Uygulamalar <strong>${store}</strong> üzerinden indirilir. Ücretsizdir ve uygulama almak için güvenli yerdir. <strong>Dokunun: ${store}.</strong>`,
                 hint: `${store} simgesini arayın. ${p === 'ios' ? "Mavi renkli ve üzerinde beyaz bir A harfi var." : "Renkli bir üçgen."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Şimdi WhatsApp\'ı aramanız gerekiyor. Sağ alttaki <strong>Ara\'ya dokunun</strong>.' : 'Şimdi WhatsApp\'ı aramanız gerekiyor. Üstteki <strong>arama çubuğuna dokunun</strong>.',
                 hint: p === 'ios' ? 'Ara, sağ alttaki büyüteçtir.' : 'Arama çubuğunda "Uygulama ve oyun ara" yazıyor.'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Sizin için <em>whatsapp</em> yazdık. Bir öneri listesi görünüyor. <strong>\"whatsapp messenger\"a dokunun.</strong>",
                 hint: '"whatsapp messenger" yazan öneriye dokunun.'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Dikkat: bazı uygulamalar WhatsApp gibi davranır. Gerçeğinin adı <strong>WhatsApp Messenger</strong>, yapımcısı <strong>WhatsApp Inc.</strong> ve ücretsizdir. <strong>Gerçeğinin yanındaki şu düğmeye dokunun: ${p === 'ios' ? 'Al' : 'Yükle'}.</strong>`,
                 hints: {'fake1-get': 'Bu, Fun Apps Ltd\'nin "WhatsUp Chat Free" uygulaması. Bir taklit ve "Reklam" etiketi bunun bir reklam olduğunu gösteriyor. Adına ve yapımcısına bakın.',
                         'fake2-get': 'Bu, LuckyDev Studio\'nun "WA Messenger for Chat Pro" uygulaması, bir kopya. Gerçeğini WhatsApp Inc. yapar.'},
                 hint: '"WhatsApp Inc." tarafından yapılan "WhatsApp Messenger"ı bulun.'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'iPhone\'unuz yüklemeden önce gerçekten siz olduğunuzu kontrol eder. Gerçek bir iPhone\'da <strong>Face ID</strong>, <strong>parmak izinizi</strong> (Touch ID) ya da <strong>Apple Hesabı şifrenizi</strong> kullanabilirsiniz. Burada yalnızca <strong>Yükle\'ye dokunun.</strong>',
                    hints: {'sheet-cancel': 'İptal, indirmeyi durdurur. Bunun yerine Yükle\'ye dokunun.'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `İndiriliyor. Bittiğinde düğme <strong>Aç</strong> olarak değişir. <strong>Aç'a dokunun.</strong>`,
                 hint: 'Düğmede Aç yazana kadar bekleyin, sonra ona dokunun.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp ilk kez açılıyor. Şartlarını kabul etmenizi istiyor. <strong>"Kabul Et ve Devam Et"e dokunun.</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp, arkadaşlarınızın sizi bulabilmesi için cep telefonu numaranızı kullanır. <strong>Telefon numarası kutusuna dokunun</strong>; biz deneme amaçlı bir numara dolduracağız.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `Gerçek bir telefonda kendi cep telefonu numaranızı yazarsınız. Burada uydurma bir numara kullandık: <strong>07700 900123</strong>. <strong>İleri'ye dokunun.</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp doğru yazıp yazmadığınızı kontrol ediyor. Bu doğru, bu yüzden <strong>dokunun: ${p === 'ios' ? 'Evet' : 'Tamam'}.</strong>`,
                 hints: {edit: `Bir hata yapmış olsaydınız Düzenle'ye dokunurdunuz. Bu numara doğru, bu yüzden dokunun: ${p === 'ios' ? 'Evet' : 'Tamam'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp, numaranın size ait olduğunu doğrulamak için 6 haneli bir kodla kısa mesaj gönderir. iPhone\'unuz bunu sizin yerinize doldurmayı önerir. <strong>Klavyenin üstündeki koda dokunun.</strong>'
                    : 'WhatsApp, numaranın size ait olduğunu doğrulamak için 6 haneli bir kodla kısa mesaj gönderir. Birçok Android telefon bunu kendiliğinden doldurur. Sizinki doldurmazsa üstteki <strong>mesaja dokunun</strong>.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Kurulum sırasında bir arkadaşınız size yazıyor: <em>"Selam! Sana yanlışlıkla 6 haneli bir kod gönderdim, bana geri gönderebilir misin?"</em> Ne yaparsınız?',
                    options: [
                        {t: 'Gönderirim, arkadaşım', why: 'Bu yaygın bir dolandırıcılıktır. Biri arkadaşınızın hesabını ele geçirmiş ve o kod, sizinkini de onlara teslim eder.'},
                        {t: 'Göndermem. Kimse bunu istememeli', ok: true, why: 'Aynen öyle. O kod WhatsApp\'ınızın anahtarıdır. Arkadaşınız ya da WhatsApp\'tan olduğunu söyleyen biri bile olsa kimseyle paylaşmayın.'},
                        {t: 'Yalnızca ilk 3 hanesini gönderirim', why: 'Kodun bir kısmı bile dolandırıcıya yardımcı olur. Hiçbirini paylaşmayın.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp, hangi arkadaşlarınızın WhatsApp kullandığını gösterebilmek için kişilerinizi görmek istiyor. <strong>İzin Ver\'e dokunun.</strong>',
                 hints: {deny: 'İzin vermeyebilirsiniz, ama o zaman WhatsApp arkadaşlarınızın adlarını gösteremez. Bu alıştırma için İzin Ver\'e dokunun.'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Bildirimler, WhatsApp kapalıyken bile bir mesaj geldiğinde sizi haberdar eder. <strong>İzin Ver\'e dokunun.</strong>',
                 hints: {deny: 'Bildirimler olmadan biri size yazdığında haberiniz olmaz. Bu alıştırma için İzin Ver\'e dokunun.'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Son adım: adınız arkadaşlarınızın gördüğü şeydir. <strong>Kutuya adınızı yazın</strong>, sonra <strong>İleri\'ye dokunun</strong>. (Bu sayfada kalır, hiçbir yere gönderilmez.)',
                 hints: {photo: 'Gerçek uygulamada şimdi bir fotoğraf seçebilir ya da sonra Ayarlar\'dan ekleyebilirsiniz. Şimdilik geçelim: adınızı yazın ve İleri\'ye dokunun.'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Tebrikler, WhatsApp\'ı kurdunuz!</strong> Sohbetleriniz burada görünecek. Sonraki derslerde ilk mesajınızı göndereceksiniz.'},
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
            const lockName = ctx.touch ? 'Touch ID ve Parola' : 'Face ID ve Parola';
            const groups = [
                [['airplane', 'Uçak Modu', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Hücresel', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Bildirimler', '#ef4444', '⟦bell⟧'], ['sounds', 'Ses ve Haptikler', '#ec4899', '⟦volume-2⟧'], ['focus', 'Odak', '#6366f1', '⟦moon⟧']],
                [['general', 'Genel', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Erişilebilirlik', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence ve Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Ekran ve Parlaklık', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Acil Durum SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Gizlilik ve Güvenlik', '#3b82f6', '⟦hand⟧'], ['battery', 'Pil', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Uygulamalar', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple Hesabı, iCloud ve daha fazlası</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Ağ ve internet', 'Mobil, Wi-Fi, hotspot'], ['devices', 'Bağlı cihazlar', 'Bluetooth, eşleştirme'],
            ['apps', 'Uygulamalar', 'Son uygulamalar, varsayılan uygulamalar'], ['notifications', 'Bildirimler', 'Bildirim geçmişi'], ['battery', 'Pil', '85%'], ['storage', 'Depolama', '91% used'],
            ['sound', 'Ses ve titreşim', 'Ses düzeyi, dokunsal geri bildirim'], ['display', 'Ekran ve dokunma', 'Koyu tema, yazı tipi boyutu'],
            ['accessibility', 'Erişilebilirlik', 'Ekran, etkileşim, ses'], ['security', 'Güvenlik ve gizlilik', 'Uygulama güvenliği, cihaz kilidi, izinler'],
            ['location', 'Konum', 'Açık'], ['safety', 'Güvenlik ve acil durum', 'Acil Durum SOS, tıbbi bilgiler, uyarılar'],
            ['google', 'Google', 'Hizmetler ve tercihler'], ['system', 'Sistem', 'Diller, saat, yazılım güncellemeleri']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID ve Parola' : 'Face ID ve Parola';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Parmak 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Face ID\'yi Sıfırla</span></div><div class="cj ex"><span>Alternatif Görünüm Ayarla</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Parolayı Kapat</span></div><div class="cj ex"><span>Parolayı Değiştir</span></div>'
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

    const androidSecurity = () => androidList('Güvenlik ve gizlilik', [
        ['device-unlock', 'Cihaz kilidi açma', 'Ekran kilidi, Yüz ve Parmak İzi ile Kilit Açma'], ['app-security', 'Uygulama güvenliği', 'Uygulamaları zararlı davranışlara karşı tara'],
        ['theft', 'Hırsızlığa karşı koruma', 'Telefonunuz çalınırsa kilitleyin'], ['privacy', 'Gizlilik', 'İzinler, hesap etkinliği']]);
    const androidDeviceUnlock = ctx => androidList('Cihaz kilidi açma', [
        ['screen-lock', 'Ekran kilidi', ctx.passcodeSet ? 'PIN' : 'Yok'], ['face-finger', 'Yüz ve Parmak İzi ile Kilit Açma', ctx.faceDone || ctx.fingerDone ? 'Kur' : 'Daha hızlı kilit açmak için kurun']]);
    const androidFaceFinger = ctx => androidList('Yüz ve Parmak İzi ile Kilit Açma', [
        ['face-unlock', 'Yüz Tanıma ile Kilit Açma', ctx.faceDone ? 'Yüz eklendi' : 'Kur'], ['fingerprint-unlock', 'Parmak İzi ile Kilit Açma', ctx.fingerDone ? '1 fingerprint' : 'Kur']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'İlk Face ID taraması tamamlandı.' : 'Face ID artık ayarlandı.') : 'Yüz eklendi';
        const btn = p === 'ios' ? (first ? 'Devam' : 'Bitti') : 'Bitti';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Daireyi tamamlamak için başınızı yavaşça hareket ettirin.' : 'Yüzünüzü daire içinde tutun ve başınızı yavaşça hareket ettirin.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Tamamlandı' : 'Tutuşunuzu Ayarlayın') : (stage === 'grip' ? 'Tutuşunuzu Ayarlayın' : 'Parmağınızı Yerleştirin'))
            : (ready ? 'Parmak izi eklendi' : 'Sensöre dokunun');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Parmak iziniz artık iPhone\'unuzun kilidini açmak için kullanılabilir.' : 'Şimdi parmak ucunuzun kenarlarını Ana Ekran düğmesine yerleştirin.')
                     : (stage === 'grip' ? 'Parmak ucunuzun kenarlarını Ana Ekran düğmesine dayayın.' : 'Parmağınızı Ana Ekran düğmesine tekrar tekrar dokundurup kaldırın.'))
            : (ready ? 'Artık telefonunuzun kilidini parmak izinizle açabilirsiniz.' : 'Parmak izi dolana kadar sensöre dokunun, parmağınızı kaldırın ve tekrar dokunun.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Devam' : 'Bitti'}</button>` : sensor}
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
                 say: 'Parola, Face ID ve Touch ID\'nin hepsi <strong>Ayarlar</strong> uygulamasındadır. <strong>Ayarlar\'a dokunun</strong> (gri dişli).',
                 hint: 'Ayarlar, dişli çarklı gri simgedir.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Gerekirse listeyi aşağı kaydırın ve <strong>dokunun: ${ctx.touch ? 'Touch ID ve Parola' : 'Face ID ve Parola'}</strong>.`,
                 hint: `Ekran ve Parlaklık'ın altında "${ctx.touch ? 'Touch ID ve Parola' : 'Face ID ve Parola'}" öğesini arayın.`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Ekran kilidi, Yüz Tanıma ile Kilit Açma ve parmak izlerinin hepsi <strong>Ayarlar</strong> uygulamasındadır. <strong>Ayarlar\'a dokunun</strong> (dişli).',
             hint: 'Ayarlar, dişli çarklı simgedir.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Gerekirse aşağı kaydırın ve <strong>Güvenlik ve gizlilik\'e dokunun</strong>. <em>Samsung\'da adı Güvenlik ve gizlilik, sonra Biyometri ya da Kilit ekranıdır.</em>',
             hint: 'Listenin alt kısmına yakın "Güvenlik ve gizlilik" öğesini arayın.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Cihaz kilidi açma\'ya dokunun.</strong>',
             hint: 'İlk seçenek, "Cihaz kilidi açma".'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Parolayı Girin' : 'PIN\'inizi girin', p === 'ios' ? '' : 'Devam etmek için PIN\'inizi girin'),
        sequence: CODE_KEYS,
        say: `${extraSay}Telefonunuz önce sizin olduğunuzu doğrular. <strong>Deneme kodunu yazın: ${codeText}</strong>. <em>Gerçek şifrenizi asla bir web sitesine yazmayın.</em>`,
        hint: `Deneme kodunu yazın ${codeText}, her seferinde bir rakam.`,
    });

    const safestQuestion = {
        q: 'Bunlardan hangisi <strong>en güvenli</strong> şifre olur?',
        options: [
            {t: '123456', why: '123456 en sık kullanılan şifredir, bu yüzden bir hırsızın ilk deneyeceklerinden biridir.'},
            {t: 'Doğum gününüz, örneğin 140352', why: 'Doğum günleri sosyal medyadan, kartlardan ya da postadan kolayca öğrenilir. Bir anlam taşıyan tarihlerden kaçının.'},
            {t: 'Başkası için hiçbir anlamı olmayan altı rakam', ok: true, why: 'Aynen öyle. Tarih, örüntü ya da tekrar olmayan rastgele rakamlar tahmin etmesi en zor olanlardır.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'Bu telefonda henüz şifre yok, yani herkes açabilir. <strong>Parolayı Aç\'a dokunun.</strong>',
                 hints: {stolen: 'Çalınan Aygıt Koruması 4. derste anlatılıyor. Önce parolayı açın.'}},
                {screen: c => codeScreen(p, c, 'Parola Ayarla', 'Bir parola girin', '<p class="aeh">Parola Seçenekleri</p>'), sequence: CODE_KEYS,
                 say: `Hatırlayacağınız 6 rakam seçin. Bu alıştırma için <strong>yazın: ${codeText}</strong>. <em>Lütfen gerçek şifrenizi buraya yazmayın.</em>`,
                 hint: `Yazın: ${codeText}, her seferinde bir rakam.`},
                {screen: c => codeScreen(p, c, 'Parola Ayarla', 'Yeni parolanızı tekrar girin'), sequence: CODE_KEYS,
                 say: `iPhone'unuz, hata yapmadığınızdan emin olmak için tekrar soruyor. <strong>Tekrar yazın: ${codeText}.</strong>`,
                 hint: `Tekrar yazın: ${codeText}.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Tebrikler, deneme telefonunuzda artık bir şifre var!</strong> Gerçek bir iPhone\'da bu aşamada Apple Hesabı şifreniz de istenebilir.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Ekran kilidinde <strong>Yok</strong> yazıyor, yani bu telefonu herkes açabilir. <strong>Ekran kilidi\'ne dokunun.</strong>'},
            {screen: () => androidList('Ekran kilidini seçin', [['none', 'Yok'], ['swipe', 'Kaydırma'], ['pattern', 'Desen'], ['pin', 'PIN'], ['password', 'Şifre']]),
             target: 'pin', say: 'Birkaç seçenek var. <strong>PIN</strong> (rakamlar) kolay ve güvenlidir. <strong>PIN\'e dokunun.</strong>',
             hints: {none: 'Yok, telefonunuzu herkesin açabileceği anlamına gelir.', swipe: 'Kaydırma telefonu yalnızca bir kaydırmayla açar, yani hiçbir şeyi korumaz.',
                     pattern: 'Desenler, parmağınızın ekranda bıraktığı izlerden tahmin edilebilir. PIN daha güvenlidir.',
                     password: 'Şifre de olur, ama PIN her gün yazmak için daha hızlıdır. Bu alıştırma için PIN\'e dokunun.'}},
            {screen: c => codeScreen(p, c, 'PIN seçin', 'PIN en az 4 haneli olmalı'), sequence: CODE_KEYS,
             say: `6 rakam 4 rakamdan daha güvenlidir. Bu alıştırma için <strong>yazın: ${codeText}</strong>. <em>Lütfen gerçek PIN'inizi buraya yazmayın.</em>`,
             hint: `Yazın: ${codeText}, her seferinde bir rakam.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'PIN seçin', 'PIN en az 4 haneli olmalı', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>İleri\'ye dokunun.</strong>'},
            {screen: c => codeScreen(p, c, 'PIN\'inizi tekrar girin', ''), sequence: CODE_KEYS,
             say: `Telefonunuz, hata yapmadığınızdan emin olmak için tekrar soruyor. <strong>Tekrar yazın: ${codeText}.</strong>`, hint: `Tekrar yazın: ${codeText}.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'PIN\'inizi tekrar girin', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Onayla\'ya dokunun.</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Kilit ekranındaki bildirimler', [['show-all', 'Tüm bildirim içeriğini göster'], ['hide-sensitive', 'Hassas içeriği gizle'], ['dont-show', 'Bildirimleri hiç gösterme']], false),
             target: 'hide-sensitive',
             say: 'Telefonunuz, kilitli ekranda hangi mesajların görüneceğini soruyor. <strong>Hassas içeriği gizle</strong> iyi bir seçimdir: bir mesaj geldiğini görürsünüz ama ne yazdığını görmezsiniz. <strong>Ona dokunun.</strong>',
             hints: {'show-all': 'Bu, bankanızdan gelen kodlar dahil her şeyi telefonunuzu eline alan herkese gösterir. "Hassas içeriği gizle"ye dokunun.',
                     'dont-show': 'Bu da olur, ama mesajların geldiğini görmezsiniz. Bu alıştırma için "Hassas içeriği gizle"ye dokunun.'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Tebrikler, deneme telefonunuzda artık bir PIN var!</strong> Ekran kilidinde şimdi PIN yazıyor.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Face ID\'yi Ayarla\'ya dokunun.</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Face ID Nasıl Ayarlanır</strong>
                    <p>Önce yüzünüzü kamera çerçevesine yerleştirin. Sonra yüzünüzün tüm açılarını göstermek için başınızı daire çizerek hareket ettirin.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Başla</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Telefonu yüzünüzün önünde, kolunuzun uzunluğu kadar uzakta, selfie çeker gibi tutun. <strong>Başla\'ya dokunun.</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'Gerçek bir iPhone\'da şimdi <strong>başınızı yavaşça daire çizerek hareket ettirirsiniz</strong>; sanki burnunuzla bir daire çiziyormuş gibi. Tarama sürerken halka dolar. Bittiğinde <strong>Devam\'a dokunun</strong>.',
                 hint: 'Dairenin dolmasını bekleyin, sonra Devam\'a dokunun.'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Emin olmak için ikinci kez tarar. Başınızı yine daire çizerek hareket ettirin. Bittiğinde <strong>Bitti\'ye dokunun</strong>.',
                 hint: 'Dairenin dolmasını bekleyin, sonra Bitti\'ye dokunun.', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Bir arkadaşınız "her ihtimale karşı" <em>kendi</em> yüzünü telefonunuza eklemek istiyor. Ne yaparsınız?',
                    options: [
                        {t: 'İzin veririm, kullanışlı', why: 'Yüzü kayıtlı olan herkes telefonunuzu açabilir ve uygulamalarınızdaki ödemeleri onaylayabilir. Yalnızca kendi yüzünüzü ayarlayın.'},
                        {t: 'Hayır derim. Telefonumun kilidini yalnızca benim yüzüm açmalı', ok: true, why: 'Aynen öyle. Güvendiğiniz biri telefonunuza girmek zorundaysa bunun yerine şifrenizi paylaşın ve gerekirse sonra değiştirin.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Tebrikler, Face ID kuruldu!</strong> Artık telefonunuzun kilidini yalnızca ona bakarak, sonra da yukarı kaydırarak açabilirsiniz.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Yüz ve Parmak İzi ile Kilit Açma\'ya dokunun.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Yüz Tanıma ile Kilit Açma\'ya dokunun.</strong>',
             hints: {'fingerprint-unlock': 'O parmak izi, yani 3. ders. Şimdilik Yüz Tanıma ile Kilit Açma\'ya dokunun.'}},
            {screen: () => consent(p, 'Yüzünüzle kilidi açın', 'Telefonunuzun kilidini açmak ve uygulamalarda siz olduğunuzu onaylamak için yüzünüzü kullanın. Yüzünüz yalnızca bu telefonda saklanır.', 'Kabul ediyorum'),
             target: 'agree', say: 'Telefonunuz yüzünüzü nasıl kullandığını açıklıyor. <strong>Kabul ediyorum\'a dokunun.</strong>',
             hints: {cancel: 'İptal, kurulumu durdurur. Devam etmek için Kabul ediyorum\'a dokunun.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Telefonunuzu göz hizasında, kolunuzun uzunluğu kadar uzakta tutun. Gerçek bir telefonda <strong>yüzünüzü daire içinde tutar ve başınızı yavaşça hareket ettirirsiniz</strong>. Bittiğinde <strong>Bitti\'ye dokunun</strong>.',
             hint: 'Dairenin dolmasını bekleyin, sonra Bitti\'ye dokunun.', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'Birçok Android telefonda Yüz Tanıma ile Kilit Açma parmak izinden daha az güvenlidir. Bu sizin için ne anlama geliyor?',
                options: [
                    {t: 'Her şey için sorun değil', why: 'Birçok telefonda yüzle kilit açma, daha kolay kandırılabilen sıradan bir kamera kullanır. Bu yüzden bazı bankacılık uygulamaları bunu kabul etmez.'},
                    {t: 'Kilit açmak için kullanırım, bankam isterse bankacılıkta parmak izi ya da PIN kullanırım', ok: true, why: 'Doğru. Telefonunuz, Yüz Tanıma ile Kilit Açma\'nın ödemeler ve bankacılık için kullanılıp kullanılamayacağını size söyler. Kullanılamıyorsa parmak izinizi ya da PIN\'inizi kullanın.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Tebrikler, Yüz Tanıma ile Kilit Açma kuruldu!</strong> Artık telefonunuzun kilidini ona bakarak açabilirsiniz.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Parmak İzi Ekle\'ye dokunun…</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID, iPhone SE gibi eski iPhone\'ların ön yüzündeki <strong>Ana Ekran düğmesini</strong> kullanır. <strong>Deneme telefonunun altındaki Ana Ekran düğmesine 6 kez dokunun</strong>; parmağınızı kaldırıp bırakıyormuş gibi.',
                 hint: 'Deneme telefonunun altındaki yuvarlak Ana Ekran düğmesine dokunun.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Şimdi parmak ucunuzun kenarları gerekiyor. <strong>Devam\'a dokunun.</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'Gerçek bir iPhone\'da parmağınızın <strong>yanlarını ve ucunu</strong> düğmeye dayarsınız. <strong>Ana Ekran düğmesine 4 kez daha dokunun.</strong>',
                 hint: 'Alttaki yuvarlak Ana Ekran düğmesine dokunun.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Hepsi tamam. <strong>Devam\'a dokunun.</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Önce hangi parmağı eklemek en iyisidir?',
                    options: [
                        {t: 'Telefonu tutarken en çok kullandığım başparmak ya da parmak', ok: true, why: 'Evet. Ana Ekran düğmesi için bu genellikle başparmağınızdır. 5 parmağa kadar ekleyebilirsiniz, bu yüzden iki başparmağı da eklemekte fayda var.'},
                        {t: 'Herhangi bir parmak, fark etmez', why: 'Her parmakla çalışır, ama telefonu alırken düğmenin üzerine kendiliğinden gelen parmağı seçin; genellikle başparmak.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Tebrikler, parmak iziniz kuruldu!</strong> Kilidi açmak için parmağınızı Ana Ekran düğmesine dayayın. Daha fazla parmağı aynı şekilde ekleyebilirsiniz.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Yüz ve Parmak İzi ile Kilit Açma\'ya dokunun.</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Parmak İzi ile Kilit Açma\'ya dokunun.</strong>',
             hints: {'face-unlock': 'O yüzle kilit açma, yani 2. ders. Şimdilik Parmak İzi ile Kilit Açma\'ya dokunun.'}},
            {screen: () => consent(p, 'Parmak iziyle kilidi açın', 'Telefonunuzun kilidini açmak ya da uygulamalara giriş yaparken olduğu gibi siz olduğunuzu onaylamak için parmak izinizi kullanın. Parmak iziniz yalnızca bu telefonda saklanır.', 'Kabul ediyorum'),
             target: 'agree', say: '<strong>Kabul ediyorum\'a dokunun.</strong>', hints: {cancel: 'İptal, kurulumu durdurur. Devam etmek için Kabul ediyorum\'a dokunun.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Sensör ekranda, telefonun arkasında ya da güç düğmesinde olabilir ve telefonunuz size nerede olduğunu gösterir. Burada ekranda. <strong>Sensöre 6 kez dokunun</strong>; parmağınızı kaldırıp bırakıyormuş gibi.',
             hint: 'Ekranın altına yakın yuvarlak sensöre dokunun.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Parmak iziniz kaydedildi. <strong>Bitti\'ye dokunun.</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Önce hangi parmağı eklemek en iyisidir?',
                options: [
                    {t: 'Telefonu alırken sensöre kendiliğinden dokunan parmak', ok: true, why: 'Evet. Arkadaki sensör için bu genellikle işaret parmağıdır, ekrandaki ya da yandaki sensör için başparmak. Birden fazla ekleyebilirsiniz.'},
                    {t: 'Herhangi bir parmak, fark etmez', why: 'Her parmak olur, ama sensöre kendiliğinden denk gelen parmağı seçin. Kilit açmayı hızlı ve kolay yapar.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Tebrikler, parmak iziniz kuruldu!</strong> Kilidi açmak için sensöre dokunun. Daha fazla parmağı aynı şekilde ekleyebilirsiniz.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Bahçedeki ayçiçekleri', '#fde68a'], ['🐶', 'Kanepedeki köpek', '#fecaca'], ['🏖️', 'Plajda bir gün', '#bae6fd'],
                    ['🎂', 'Bir doğum günü pastası', '#fbcfe8'], ['🌅', 'Denizde gün batımı', '#fed7aa'], ['🐈', 'Uyuyan kedi', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Okundu' : state === 'sent' ? 'Gönderildi' : 'İletildi'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Selam anne, benim! Yeni numara, eski telefon bozuldu…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Aile', last: 'Dave: Pastayı kim getiriyor? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'Perşembe görüşürüz!', time: 'Dün', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Selam anne! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Yeni Sohbet' : 'Kişi seç'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Aile', '#f59e0b', 'Dave, Jean, Sarah, Siz'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Ekle (artı)' : 'Ekle (ataç)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Bu numara kişilerinizde yok.</p><div><button type="button" data-tap="block">Engelle</button><button type="button" data-tap="add-contact">Ekle</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Fotoğraflar' : 'Galeri'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>+44 7700 900842 engellensin mi?</strong></p><p class="fd">Engellenen kişiler sizi arayamaz ya da size mesaj gönderemez.</p>
                <p class="fd">⟦square-check⟧ WhatsApp'a bildir</p>
                <div class="et"><button type="button" data-tap="cancel">İptal</button><button type="button" data-tap="confirm-block">Engelle</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Son Aramalar' : 'Galeri'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Çalıyor…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Sesi aç' : 'Sessize al'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? '1 hafta sessize alındı' : 'Kapalı'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Bildirimleri şu süreyle sessize al…</strong></p>
                <button type="button" data-tap="mute-8h">8 saat</button><button type="button" data-tap="mute-week">1 hafta</button><button type="button" data-tap="mute-always">Her zaman</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Ayarlar', [['account', 'Hesap', 'Güvenlik bildirimleri, numara değiştirme'], ['privacy', 'Gizlilik', 'Kişileri engelle, kaybolan mesajlar'],
                ['chats', 'Sohbetler', 'Tema, duvar kâğıtları'], ['notifications', 'Bildirimler', 'Mesaj, grup ve arama sesleri']]],
            account: ['Hesap', [['twostep', 'İki adımlı doğrulama', ctx.twoStep ? 'Açık' : 'Kapalı'], ['change-number', 'Numara değiştir', ''], ['delete-account', 'Hesabı sil', '']]],
            privacy: ['Gizlilik', [['last-seen', 'Son görülme ve çevrimiçi', 'Herkes'], ['profile-photo', 'Profil fotoğrafı', 'Herkes'],
                ['groups', 'Gruplar', ctx.groupsSetting || 'Herkes'], ['blocked', 'Engellenen kişiler', ctx.blocked ? '1' : 'Yok']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Beni gruplara kimler ekleyebilir</strong></p>
                <button type="button" data-tap="groups-everyone">Herkes</button><button type="button" data-tap="groups-contacts">Kişilerim</button>
                <button type="button" data-tap="groups-except">Şunlar hariç kişilerim…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>İki adımlı doğrulama</h3><p>Ek güvenlik için, telefon numaranızı WhatsApp'a yeniden kaydederken PIN isteyecek iki adımlı doğrulamayı açın.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Aç</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>E-posta adresi ekle</h3>
                <p>PIN'inizi unutursanız sıfırlayabilmeniz için bir e-posta adresi ekleyin.</p>
                <div class="tk ex">e-posta adresiniz</div>
                <button type="button" class="ce ox" data-tap="email-next">İleri</button>
                <button type="button" class="cp wd" data-tap="skip">Atla</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>İki adımlı doğrulama açık</h3><p>WhatsApp'ı yeni bir telefonda kurarsanız PIN'iniz istenecek.</p>
                <button type="button" class="ce ox" data-tap="done">Bitti</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? '6 haneli bir PIN oluşturun' : 'PIN\'inizi onaylayın'}</strong>
            <p>${stage === 'pin' ? 'WhatsApp\'ı yeni bir telefonda kurmak için buna ihtiyacınız olacak.' : 'Aynı PIN\'i tekrar yazın.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Bu sizin sohbet listeniz. Yenisini başlatmak için <strong>yeni sohbet düğmesine dokunun</strong> (sağ üstteki kalem).'
                          : 'Bu sizin sohbet listeniz. Yenisini başlatmak için sağ alttaki <strong>yeşil + düğmesine dokunun</strong>.',
         hints: {'chat-family': 'Bu, var olan bir sohbeti açar. Bunun yerine yeni bir sohbet başlatın.', 'chat-jean': 'Bu, var olan bir sohbeti açar. Bunun yerine yeni bir sohbet başlatın.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp, kişilerinizden onu kullananları gösterir. <strong>Sarah\'ya dokunun.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Önce kutuya bir mesaj yazın, sonra gönder okuna dokunun.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Selam anne! 😊 Sesini duymak ne güzel!', n: 2}); },
         say: 'Alttaki <strong>mesaj kutusuna dokunun</strong>, <strong>kısa bir mesaj yazın</strong> (örneğin "Merhaba!"), sonra <strong>gönder okuna dokunun</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Mikrofon, sırada olan sesli mesajlar içindir. Önce bir mesaj yazın ve gönder okuna dokunun.', attach: 'O, sırada olan fotoğraflar içindir. Önce bir mesaj yazın ve gönder\'e dokunun.'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah yanıt verdi! Mesajınızın altında <strong>iki mavi tik ⟦check-check⟧</strong> var. Ne anlama geliyorlar?',
            options: [
                {t: 'Mesaj gönderilemedi', why: 'Başarısız bir mesajda küçük bir saat ya da kırmızı bir uyarı görünür. Tikler başarılı olduğu anlamına gelir.'},
                {t: 'Sarah okudu', ok: true, why: 'Evet! Bir gri tik gönderildi, iki gri tik telefonuna iletildi, iki mavi tik okudu demektir.'},
                {t: 'İki kez gönderildi', why: 'Hayır, yalnızca bir kez gönderildi. İki mavi tik okunduğu anlamına gelir.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Şimdi bir fotoğraf gönderin. Mesaj kutusunun yanındaki <strong>${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'} simgesine dokunun</strong>.`,
         hints: {camera: 'Kamera yeni bir fotoğraf çeker. Önceden çektiğiniz birini göndermek için şuna dokunun: ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `Telefonunuzdaki fotoğraflardan seçmek için <strong>dokunun: ${p === 'ios' ? 'Fotoğraflar' : 'Galeri'}</strong>.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Bunlar telefonunuzdaki (sahte) fotoğraflar. <strong>Ayçiçeklerine dokunun</strong> 🌻.',
         hint: 'İçinde ayçiçekleri olan fotoğrafa dokunun.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Harika! 🌻 Bunlar bahçenizden mi?', n: 4}); },
         say: 'İsterseniz bir açıklama yazabilirsiniz. Sonra <strong>gönder okuna dokunun</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Yazmak zor geliyorsa sesli mesajlar işe yarar. Gerçek bir telefonda konuşurken <strong>mikrofona basılı tutarsınız</strong> ⟦mic⟧, göndermek için bırakırsınız. Burada göndermek için <strong>mikrofona bir kez dokunarak başlayın, sonra gönder okuna dokunun</strong>.',
         hint: 'Mikrofona, sonra gönder okuna dokunun.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Tebrikler!</strong> Bir mesaj, bir fotoğraf ve bir sesli mesaj gönderdiniz. Sarah\'ya istediğiniz zaman yanıt vermek için WhatsApp\'ı açın ve onun sohbetine dokunun.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: 'Açmak için <strong>Sarah\'nın sohbetine dokunun</strong>.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Sohbetin üstünde iki arama düğmesi var: görüntülü arama için <strong>video kamera</strong>, sesli arama için <strong>telefon</strong>. <strong>Video kameraya dokunun</strong> ⟦video⟧.',
         hints: {voice: 'Bu, görüntüsüz sesli arama yapar. Bu alıştırma için video kameraya dokunun.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Sarah\'nın telefonu çalar ve o cevap verdiğinde birbirinizi görürsünüz. Bulunduğunuz yer gürültülüyse kendinizi sessize almak için <strong>mikrofona dokunun</strong> ⟦mic⟧.',
         hint: 'Mikrofon düğmesi alttaki sıradadır.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Sessizdesiniz: Sarah sizi görüyor ama duymuyor. Ona bir şey göstermek için telefonunuzun arkasındaki kameraya geçmek üzere <strong>çevir düğmesine dokunun</strong> ⟦switch-camera⟧.',
         hints: {mute: 'Sesi açmak için daha sonra mikrofona tekrar dokunun. Şimdilik çevir düğmesini deneyin.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Şimdi Sarah, telefonunuzu neye doğrulttuğunuzu görebiliyor. Bitirdiğinizde aramayı sonlandırmak için <strong>kırmızı düğmeye dokunun</strong>.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Görüntülü aramalar çok veri harcar. Bir tane yapmanın en iyi yolu nedir?',
            options: [
                {t: 'Mümkünse evde Wi-Fi üzerinden', ok: true, why: 'Evet. Wi-Fi\'de aramalar mobil veri hakkınızdan düşmez, bu yüzden ne kadar konuşursanız konuşun ücretsizdir.'},
                {t: 'Fark etmez', why: 'Mobil veride uzun bir görüntülü arama hakkınızı hızla tüketebilir. Mümkünse Wi-Fi en iyisidir.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Şimdi gruplara geçelim. Aile grubunda çok sayıda yeni mesaj var ve bildirimler durmadan titreşiyor. <strong>Aile grubuna dokunun.</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Bir grubun ayarlarını değiştirmek için üstteki <strong>grubun adına dokunun</strong>.', hint: 'Ekranın üstündeki "Aile" sözcüğüne dokunun.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Bildirimleri sessize al\'a dokunun.</strong> Mesajlar yine gelir, ama telefonunuz her biri için titreşmez.',
         hints: {'exit-group': 'Gruptan çık, gruptan tamamen ayrılmanızı sağlar. Sessize almak daha yumuşaktır: grupta kalırsınız ama titreşim olmaz.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Ne kadar süreyle olacağını seçin. <strong>1 hafta\'ya dokunun.</strong>',
         hints: {'mute-8h': '8 saat de olur. Bu alıştırma için 1 hafta\'ya dokunun.', 'mute-always': 'Her zaman da olur, ama bir şeyleri kaçırabilirsiniz. Bu alıştırma için 1 hafta\'ya dokunun.'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Tebrikler!</strong> Görüntülü arama yaptınız, kendinizi sessize aldınız, kamerayı çevirdiniz ve yoğun bir grubu sessize aldınız. Grubun mesajlarını istediğiniz zaman yine okuyabilirsiniz.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Merhaba!', ticks: 'read', n: 1}, {text: 'Selam anne! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Pazar yemeği bizde mi? 🍗', n: 1}, {from: 'Sarah', text: 'Evet lütfen!', n: 2}, {from: 'Dave', text: 'Pastayı kim getiriyor? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'WhatsApp\'ın kendi ayarları uygulamanın içindedir. Sağ alttaki <strong>Ayarlar\'a dokunun</strong>.',
                hints: {'chat-unknown': 'O mesajla sonra ilgileneceğiz. Önce sağ alttaki Ayarlar\'a dokunun.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'WhatsApp\'ın kendi ayarları uygulamanın içindedir. Sağ üstteki <strong>üç noktaya ⋮ dokunun</strong>.',
                hints: {'chat-unknown': 'O mesajla sonra ilgileneceğiz. Önce sağ üstteki üç noktaya dokunun.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Ayarlar\'a dokunun.</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Hesap\'a dokunun.</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>İki adımlı doğrulama</strong>, biri WhatsApp\'ınızı başka bir telefonda kurmaya çalışırsa gereken bir PIN ekler. Bir dolandırıcı 6 haneli kodunuzu ele geçirse bile içeri giremez. <strong>İki adımlı doğrulama\'ya dokunun.</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Aç\'a dokunun.</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Telefonunuzun şifresinden farklı, 6 haneli bir PIN seçin. Bu alıştırma için <strong>yazın: ${pinText}</strong>. <em>Buraya gerçek bir PIN yazmayın.</em>`,
             hint: `Deneme PIN'ini yazın: ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `Onaylamak için <strong>tekrar yazın: ${pinText}</strong>.`, hint: `Tekrar yazın: ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'E-posta adresi eklemek, PIN\'inizi unutursanız sıfırlayabilmenizi sağlar. Gerçek telefonunuzda yapmaya değer. Burada <strong>İleri\'ye dokunun</strong>.',
             hints: {skip: 'Atlayabilirsiniz, ama PIN\'inizi unutursanız hesabınızdan çıkmış olabilirsiniz. Bu alıştırma için İleri\'ye dokunun.'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'İki adımlı doğrulama açık. <strong>Bitti\'ye dokunun.</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Bir mesaj <em>"WhatsApp Desteği"</em>\'nden geldiğini söylüyor ve "hesabınızı doğrulamak" için iki adımlı PIN\'inizi istiyor. Ne yaparsınız?',
                options: [
                    {t: 'Gönderirim, WhatsApp\'tan geliyor', why: 'WhatsApp size asla PIN\'inizi ya da kodunuzu isteyen bir mesaj göndermez. Bu, hesabınızı ele geçirmeye çalışan bir dolandırıcıdır.'},
                    {t: 'Yanıtlamam, engeller ve bildiririm', ok: true, why: 'Aynen öyle. Hiç kimse, WhatsApp dahil, PIN\'inizi ya da 6 haneli kodu asla istememeli.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Sırada yabancıların sizi gruplara eklemesini engellemek var. Bu, <strong>Gizlilik</strong> içinde. <strong>Gruplar\'a dokunun.</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Kişilerim'; },
             say: '"Herkes", her yabancının sizi bir gruba ekleyebileceği anlamına gelir; dolandırıcılar bunu kullanır. <strong>Kişilerim\'e dokunun.</strong>',
             hints: {'groups-everyone': 'Herkes seçeneği yabancıların sizi dolandırıcılık grupları dahil gruplara eklemesine izin verir. Kişilerim\'e dokunun.'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Tanımadığınız bir numaradan mesaj geldi: "Selam anne, benim! Yeni numara…". Bu "Selam anne" dolandırıcılığı. <strong>Açmak için ona dokunun.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Selam anne, benim! Yeni numara, eski telefon bozuldu. Bir faturayı ödememe yardım edebilir misin? Yarın sana geri öderim x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Yanıtlamayın. WhatsApp numaranın kişilerinizde olmadığını fark ediyor. <strong>Engelle\'ye dokunun.</strong>',
             hints: {'add-contact': 'Bir dolandırıcıyı kişilerinize eklemeyin. Engelle\'ye dokunun.', video: 'Onları geri aramayın. Engelle\'ye dokunun.', voice: 'Onları geri aramayın. Engelle\'ye dokunun.'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Selam anne, benim! Yeni numara, eski telefon bozuldu. Bir faturayı ödememe yardım edebilir misin? Yarın sana geri öderim x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '"WhatsApp\'a bildir" işaretli; bu, WhatsApp\'ın dolandırıcıyı durdurmasına yardımcı olur. <strong>Engelle\'ye dokunun.</strong>',
             hints: {cancel: 'İptal, onların size mesaj atabilmesini sürdürür. Engelle\'ye dokunun.'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Tebrikler!</strong> İki adımlı doğrulamayı açtınız, yabancıların sizi gruplara eklemesini durdurdunuz ve bir dolandırıcıyı engelleyip bildirdiniz. Ailenizden gelen bir mesajdan emin değilseniz onları elinizdeki numaradan arayın.'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = 'Geri') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || 'Geri')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Dinamik Metin'i destekleyen uygulamalar tercih ettiğiniz okuma boyutuna uyum sağlar.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Metin Boyutu', [], {top: slider, back: 'Ekran'});
        return list(p, 'Ekran boyutu ve metin', [{caption: 'Yazı tipi boyutu'}, {id: 'bold', label: 'Kalın metin', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Metin boyutu <strong>Ayarlar</strong> uygulamasındadır. <strong>Ayarlar\'a dokunun.</strong>', hint: 'Ayarlar, dişli çarklı gri simgedir.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Ekran ve Parlaklık\'a dokunun.</strong>', hint: 'Üçüncü grupta, Erişilebilirlik\'in altında.'},
        {screen: c => list(p, 'Ekran ve Parlaklık', [{caption: 'GÖRÜNÜM'}, {label: 'Açık', value: '⟦check⟧'}, {caption: 'METİN'}, {id: 'text-size', label: 'Metin Boyutu'}, {id: 'bold', label: 'Kalın Metin', toggle: !!c.bold}], {back: 'Ayarlar'}),
         target: 'text-size', say: '<strong>Metin Boyutu\'na dokunun.</strong>', hints: {bold: 'Kalın Metin sırada. Önce Metin Boyutu\'na dokunun.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Yazıyı büyütmek için kaydırıcıyı sağa sürükleyin. Burada <strong>büyük A\'ya iki kez dokunun</strong> ve metnin büyümesini izleyin.', hint: 'Kaydırıcının sağındaki büyük A\'ya dokunun.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Okumak çok daha kolay! Şimdi geri dönmek için üstteki <strong>‹ Ekran\'a dokunun</strong>.'},
        {screen: c => list(p, 'Ekran ve Parlaklık', [{caption: 'GÖRÜNÜM'}, {label: 'Açık', value: '⟦check⟧'}, {caption: 'METİN'}, {id: 'text-size', label: 'Metin Boyutu'}, {id: 'bold', label: 'Kalın Metin', toggle: !!c.bold}], {back: 'Ayarlar'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Kalın Metin</strong> harfleri daha kalın ve net yapar. <strong>Açmak için ona dokunun.</strong>'},
        {screen: c => list(p, 'Ekran ve Parlaklık', [{caption: 'METİN'}, {label: 'Metin Boyutu'}, {label: 'Kalın Metin', toggle: true}], {back: 'Ayarlar'}),
         question: {q: 'En büyük ayarda bile metin hâlâ çok mu küçük?', options: [
            {t: 'Yapılacak başka bir şey yok', why: 'Daha fazlası var! Ayarlar > Erişilebilirlik > Ekran ve Metin Boyutu > Daha Büyük Metin daha da büyük boyutlar sunar.'},
            {t: 'Ayarlar > Erişilebilirlik > Ekran ve Metin Boyutu > Daha Büyük Metin', ok: true, why: 'Evet. Gerçekten büyük metin için orada Daha Büyük Erişilebilirlik Boyutları\'nı açın.'}]}},
        {screen: c => list(p, 'Ekran ve Parlaklık', [{caption: 'METİN'}, {label: 'Metin Boyutu'}, {label: 'Kalın Metin', toggle: true}], {back: 'Ayarlar'}), done: true,
         say: '<strong>Tebrikler!</strong> Metniniz Ayarlar\'da ve çoğu uygulamada daha büyük ve daha kalın.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Metin boyutu <strong>Ayarlar</strong> uygulamasındadır. <strong>Ayarlar\'a dokunun.</strong>', hint: 'Ayarlar, dişli çarklı simgedir.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Ekran ve dokunma\'ya dokunun.</strong> <em>Samsung\'da Ekran, sonra Yazı tipi boyutu ve stili.</em>'},
        {screen: () => list(p, 'Ekran ve dokunma', [{id: 'dark', label: 'Koyu tema', toggle: false}, {id: 'text-size', label: 'Ekran boyutu ve metin', sub: 'Yazı tipi boyutu, kalın metin'}, {id: 'brightness', label: 'Parlaklık düzeyi', value: '70%'}]),
         target: 'text-size', say: '<strong>Ekran boyutu ve metin\'e dokunun.</strong>', hints: {dark: 'Koyu tema boyutu değil renkleri değiştirir. Ekran boyutu ve metin\'e dokunun.'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Yazıyı büyütmek için Yazı tipi boyutu kaydırıcısını sağa sürükleyin. Burada <strong>büyük A\'ya iki kez dokunun</strong>.', hint: 'Kaydırıcının sağındaki büyük A\'ya dokunun.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Kalın metin</strong> harfleri daha net yapar. <strong>Açmak için ona dokunun.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'En büyük ayarda bile metin hâlâ çok mu küçük?', options: [
            {t: 'Yapılacak başka bir şey yok', why: 'Aynı sayfada Ekran boyutunu da deneyin: düğmeler ve simgeler dahil her şeyi büyütür.'},
            {t: 'Ekran boyutunu da büyütürüm', ok: true, why: 'Evet. Ekran boyutu yalnızca metni değil, ekrandaki her şeyi büyütür.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Tebrikler!</strong> Metniniz Ayarlar\'da ve çoğu uygulamada daha büyük ve daha kalın.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' mor zeminde' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Rahatsız Etmeyin' : 'Odak'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Rahatsız Etmeyin · Açık' : 'Rahatsız Etmeyin · Kapalı'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Kapatmak için yukarı kaydırın' : 'Kapat'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Telefonunuz çalmıyorsa Rahatsız Etmeyin açık olabilir. Hızlı ayarlar <strong>Denetim Merkezi</strong>\'ndedir: <strong>sağ üst köşeden aşağı kaydırın</strong> (ya da üstteki şeride dokunun).'
                          : 'Telefonunuz çalmıyorsa Rahatsız Etmeyin açık olabilir. Hızlı ayarları görmek için <strong>ekranın üstünden aşağı kaydırın</strong> (ya da üstteki şeride dokunun).',
         hints: {'pull-up': 'Diğer yöne kaydırın: üstten aşağı.', 'pull-left': 'Yana değil, aşağı kaydırın.', 'pull-right': 'Yana değil, aşağı kaydırın.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Ay ⟦moon⟧ simgesi, <strong>Rahatsız Etmeyin'in açık olduğunu</strong> ve aramaların ve mesajların sessize alındığını gösterir. <strong>Kapatmak için ona dokunun.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Şimdi sesi telefonunuzun <strong>yan tarafındaki ses düğmesiyle</strong> (üstteki) açın. <strong>Deneme telefonunun kenarındaki ＋ düğmesine 3 kez dokunun.</strong>',
         hint: 'Telefonun sağ kenarındaki ＋ düğmesine dokunun.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'iPhone\'unuz hâlâ çalmıyor. Başka ne olabilir?', options: [
                {t: 'Zil/Sessiz anahtarı ya da Eylem düğmesi sessize ayarlı', ok: true, why: 'Evet. Birçok iPhone\'da ses düğmelerinin üstünde küçük bir anahtar vardır: turuncu görünüyorsa telefon sessizdedir. Yeni modeller bunun yerine Eylem düğmesini kullanır.'},
                {t: 'Telefon bozuk', why: 'Genellikle hayır! Önce ses düğmelerinin üstündeki sessiz anahtarına bakın.'}]}
            : {q: 'Ses düğmesine bastınız ama yalnızca medya sesi değişti. Şimdi ne yapmalı?', options: [
                {t: 'Zil sesi düzeyini görmek için ses çubuğundaki ⋯ ya da ayarlar simgesine dokunun', ok: true, why: 'Evet. Ses düğmeleri çoğu zaman medya sesini değiştirir; zil sesini değiştirmek için ses çubuğundaki üç noktaya dokunun.'},
                {t: 'Vazgeçerim', why: 'Görünen ses çubuğundaki üç noktaya ⋯ dokunun ve zil sesini yükseltin.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Tebrikler!</strong> Rahatsız Etmeyin kapalı ve ses açık, bu yüzden aramaları ve mesajları duyacaksınız.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>PARASETAMOL 500mg</strong><br>Her 4-6 saatte 1-2 tablet alın.<br>24 saatte 8 tabletten fazla almayın.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Büyüteç', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'iPhone\'unuzda bir <strong>Büyüteç</strong> uygulaması var. Ana ekranınızda yoksa ekranın ortasından aşağı kaydırın ve "Büyüteç" yazın. <strong>Büyüteç\'e dokunun.</strong>'
                          : 'Birçok Android telefonda bir <strong>Büyüteç</strong> uygulaması vardır. <em>Samsung\'da hızlı ayarlarda ya da Erişilebilirlik içindedir.</em> <strong>Büyüteç\'e dokunun.</strong>',
         hint: 'Büyüteç çizimli siyah simgeyi arayın.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Telefonunuzu bu ilaç etiketi gibi küçük bir şeye doğrultun. Yakınlaştırmak için <strong>＋\'ya üç kez dokunun</strong> (gerçek bir telefonda kaydırıcıyı sürükleyebilirsiniz).', hint: 'Kaydırıcının sağındaki ＋\'ya dokunun.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'Loş ışıkta fener yardımcı olur. <strong>Feneri açın</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Elleriniz biraz titriyor mu? Görüntüyü dondurmak için <strong>büyük yuvarlak düğmeye dokunun</strong>; böylece sabit tutmadan okuyabilirsiniz.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Büyüteç başka ne işe yarar?', options: [
            {t: 'Menüleri, fiyat etiketlerini ve mektuplardaki küçük yazıları okumaya', ok: true, why: 'Evet, üstelik her zaman cebinizde. Bazıları tek dokunuşla ulaşmak için onu Denetim Merkezi\'nde ya da hızlı ayarlarda tutar.'},
            {t: 'Telefon aramalarını daha yüksek sesli yapmaya', why: 'O ses düğmelerinin işi. Büyüteç, küçük şeyleri daha net görmek içindir.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Tebrikler!</strong> Artık küçük yazıları yakınlaştırabilir, aydınlatabilir ve görüntüyü dondurabilirsiniz.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Perşembe günü kahve buluşmasında görüşürüz' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Perşembe geliyor musun? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Kısa mesaj</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Dinleniyor… şimdi konuşun</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Yazmak yerine konuşabilirsiniz. <strong>Mesajlar\'ı açın.</strong>', hint: 'Mesajlar, yeşil konuşma balonudur.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean Perşembe günü hakkında sormuş. Alttaki <strong>mesaj kutusuna dokunun</strong>.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'Klavye görünür. Klavyedeki <strong>mikrofona dokunun</strong> ⟦mic⟧, sonra mesajınızı söyleyin.', hint: 'Mikrofon klavyenin üzerinde, boşluk çubuğunun yanındadır.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'Gerçek bir telefonda şimdi şunu söylerdiniz: <em>"Perşembe günü kahve buluşmasında görüşürüz"</em>. Sözcükler konuştukça belirir. Kontrol edin, sonra <strong>gönder\'e dokunun</strong> ⟦send-horizontal⟧.',
         hint: 'Sözcüklerin belirmesini bekleyin, sonra gönder okuna dokunun.'},
        {screen: () => home(p), target: 'settings',
         say: 'Telefonunuz size ayrıca bir şeyleri <strong>yüksek sesle okuyabilir</strong>. Hadi bunu açalım. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Erişilebilirlik\'e dokunun.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Erişilebilirlik', [{caption: 'GÖRME'}, {id: 'voiceover', label: 'VoiceOver', value: 'Kapalı'}, {id: 'zoom', label: 'Yakınlaştırma', value: 'Kapalı'}, {id: 'spoken', label: 'Seslendirilen İçerik'}], {back: 'Ayarlar'})
            : list(p, 'Erişilebilirlik', [{id: 'select-speak', label: 'Seslendirmek için Seç', sub: 'Kapalı'}, {id: 'talkback', label: 'TalkBack', sub: 'Kapalı'}, {id: 'magnification', label: 'Büyütme'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Seslendirilen İçerik\'e dokunun.</strong>' : '<strong>Seslendirmek için Seç\'e dokunun.</strong>',
         hints: {voiceover: 'VoiceOver tüm telefonun çalışma şeklini değiştirir, bu da kafa karıştırıcı olabilir. Seslendirilen İçerik\'e dokunun.', talkback: 'TalkBack tüm telefonun çalışma şeklini değiştirir, bu da kafa karıştırıcı olabilir. Seslendirmek için Seç\'e dokunun.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Seslendirilen İçerik', [{id: 'speak-selection', label: 'Seçimi Seslendir', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Ekranı Seslendir', toggle: !!c.speakScreen, sub: 'Ekranın okunmasını duymak için ekranın üstünden iki parmakla aşağı kaydırın.'}], {back: 'Erişilebilirlik'})
            : list(p, 'Seslendirmek için Seç', [{id: 'speak-screen', label: 'Seslendirmek için Seç\'i kullan', toggle: !!c.speakScreen, sub: 'Kısayola dokunun, sonra okunmasını duymak için ekrandaki herhangi bir şeye dokunun.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Ekranı Seslendir\'i açın.</strong> Sonra telefonunuzun herhangi bir yerinde, üstten iki parmakla aşağı kaydırmak ekranı sesli okur.' : '<strong>Seslendirmek için Seç\'i kullan\'ı açın.</strong> Küçük bir kısayol düğmesi belirir: ona dokunun, sonra duymak için herhangi bir metne dokunun.',
         hints: {'speak-selection': 'O yalnızca vurguladığınız sözcükleri okur. Ekranı Seslendir daha kolaydır: onu açın.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Seslendirilen İçerik', [{label: 'Seçimi Seslendir', toggle: false}, {label: 'Ekranı Seslendir', toggle: true}], {back: 'Erişilebilirlik'})
            : list(p, 'Seslendirmek için Seç', [{label: 'Seslendirmek için Seç\'i kullan', toggle: true}]), done: true,
         say: '<strong>Tebrikler!</strong> Artık yazmak yerine konuşabilir ve telefonunuzun size bir şeyleri sesli okumasını sağlayabilirsiniz.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Birçok işitme cihazı telefonunuza bağlanabilir; böylece aramalar ve müzik doğrudan cihazlara gider. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Erişilebilirlik\'e dokunun.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Erişilebilirlik', [{caption: 'İŞİTME'}, {id: 'hearing-devices', label: 'İşitme Cihazları'}, {id: 'live-captions', label: 'Canlı Altyazılar', value: c.captions ? 'Açık' : 'Kapalı'}, {id: 'subtitles', label: 'Alt Yazılar ve Açıklamalı Altyazılar'}], {back: 'Ayarlar'})
            : list(p, 'Erişilebilirlik', [{id: 'hearing-devices', label: 'İşitme cihazları', sub: c.paired ? 'Bağlı' : 'Bağlı değil'}, {id: 'live-captions', label: 'Canlı Altyazı', sub: c.captions ? 'Açık' : 'Kapalı'}, {id: 'sound-amp', label: 'Ses Yükseltici'}]),
         target: 'hearing-devices', say: `<strong>Dokunun: ${p === 'ios' ? 'İşitme Cihazları' : 'İşitme cihazları'}.</strong> Önce işitme cihazlarınızı takın ve telefonun onları bulabilmesi için pil kapaklarını kapatıp yeniden başlatın.`,
         hints: {'live-captions': 'Altyazılar sırada. Önce işitme cihazlarını bağlayın.'}},
        {screen: c => list(p, p === 'ios' ? 'İşitme Cihazları' : 'İşitme cihazları', [{caption: p === 'ios' ? 'MFI İŞİTME CİHAZLARI' : 'Kullanılabilir cihazlar'}, {id: 'aids', label: 'Margaret\'in işitme cihazları', sub: 'Sol ve sağ'}],
            {overlay: c.pairing ? dialog(p, '"Margaret\'in işitme cihazları" ile eşleştirilsin mi?', 'Aramalar ve ses için kullanılacaklar.', [['cancel', 'İptal'], ['pair', 'Eşleştir']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Telefonunuz onları buluyor. <strong>İşitme cihazlarınıza dokunun.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'İşitme Cihazları' : 'İşitme cihazları', [{id: 'aids', label: 'Margaret\'in işitme cihazları', sub: 'Sol ve sağ'}],
            {overlay: dialog(p, '"Margaret\'in işitme cihazları" ile eşleştirilsin mi?', 'Aramalar ve ses için kullanılacaklar.', [['cancel', 'İptal'], ['pair', 'Eşleştir']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Eşleştir\'e dokunun.</strong> (İki işitme cihazıyla telefonunuz iki kez, her biri için bir kez sorabilir.)'},
        {screen: c => list(p, p === 'ios' ? 'İşitme Cihazları' : 'İşitme cihazları', [{label: 'Margaret\'in işitme cihazları', sub: 'Bağlandı ⟦check⟧'}]), target: 'back',
         say: 'Bağlandı! Aramalar artık işitme cihazlarınızdan çalacak. <strong>Geri\'ye dokunun.</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Erişilebilirlik', [{caption: 'İŞİTME'}, {id: 'hearing-devices', label: 'İşitme Cihazları'}, {id: 'live-captions', label: 'Canlı Altyazılar', value: c.captions ? 'Açık' : 'Kapalı'}], {back: 'Ayarlar'})
            : list(p, 'Erişilebilirlik', [{id: 'hearing-devices', label: 'İşitme cihazları', sub: 'Bağlı'}, {id: 'live-captions', label: 'Canlı Altyazı', sub: c.captions ? 'Açık' : 'Kapalı'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Canlı Altyazılar' : 'Canlı Altyazı'}</strong>, konuşulan her şey için ekranda sözcükleri gösterir: videolar, aramalar ve sesli mesajlar. <strong>Açmak için ona dokunun.</strong>`},
        {screen: c => list(p, 'Erişilebilirlik', [{label: p === 'ios' ? 'Canlı Altyazılar' : 'Canlı Altyazı', toggle: true}, {label: 'İşitme cihazları', sub: 'Bağlı'}]), done: true,
         say: '<strong>Tebrikler!</strong> İşitme cihazlarınız bağlandı ve konuşulan sözcükler artık altyazı olarak görünüyor.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Arı', 'Baykuş', 'Ceylan', 'Deve', 'Eşek', 'Fil', 'Geyik', 'Horoz', 'İbis', 'Jaguar', 'Kedi', 'Leylek', 'Maymun',
                     'Narval', 'Ördek', 'Penguen', 'Ren geyiği', 'Sincap', 'Tilki', 'Vaşak', 'Yunus', 'Zebra'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Çiçeğe basılı tutun</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Kopyala</span><span>Paylaş</span><span>Sil</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Zebra</h3><p>Zebraların siyah beyaz çizgileri vardır. İki zebranın deseni tıpatıp aynı değildir.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Dokunmak</strong>, ekrana tek parmakla hafifçe dokunup hemen çekmek demektir; bir düğmeye basar gibi. <strong>Yıldıza dokunun.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Basılı tutmak</strong>, parmağınızı bir şeyin üzerinde bir iki saniye tutmak demektir. Genellikle ek seçenekler getirir. Bir şey olana kadar <strong>çiçeğe basılı tutun</strong>. (Fareyle düğmeyi basılı tutun.)',
         hint: 'Parmağınızı çiçeğin üzerinde bir iki saniye tutun.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'Bir menü belirdi. Basılı tutmak genellikle ne yapar?', options: [
            {t: 'Kopyala, paylaş ya da sil gibi ek seçenekleri gösterir', ok: true, why: 'Evet. Mesajlara, fotoğraflara ve uygulamalara basılı tutmak bunlar gibi seçenekler getirir.'},
            {t: 'Şeyleri hemen siler', why: 'Hayır, yalnızca bir seçenek menüsü gösterir. Siz birini seçene kadar hiçbir şey olmaz.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Kaydırmak</strong>, parmağınızı ekranın üzerinde sayfa çevirir gibi sürmek demektir. Sonrakileri görmek için <strong>fotoğrafı sola iki kez kaydırın</strong>. (Fareyle tıklayın, sürükleyin ve bırakın.)',
         hint: 'Parmağınızı fotoğrafın üzerinde sağdan sola sürün. Ya da "Kaydıramıyor musunuz?" düğmesini kullanın.'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Aşağı kaydırmak</strong>, bunun gibi bir listenin devamını görmek için parmağınızı ekranda yukarı sürmek demektir. <strong>Aşağı kaydırın ve en alttaki Zebra\'ya dokunun</strong>. (Fareyle kaydırma tekerleğini kullanın.)',
         hint: 'Alttaki Zebra\'ya ulaşmak için listeyi parmağınızla yukarı doğru sürün.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'iPhone\'da bir sayfa geri gitmek için sol üstteki <strong>‹ Geri\'ye dokunun</strong> (ya da ekranın sol kenarından içeri kaydırın).' : 'Android\'de bir sayfa geri gitmek için alttaki <strong>geri okuna ◁ dokunun</strong> (ya da ekranın sol veya sağ kenarından içeri kaydırın).',
         hints: {'home-pill': 'O, doğrudan ana ekrana götürür. Bunun yerine geri okuna ◁ dokunun.', 'home-bar': 'O, doğrudan ana ekrana götürür. Bunun yerine ‹ Geri\'ye dokunun.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Her yerden ana ekrana gitmek için ekranın altındaki <strong>çubuktan yukarı kaydırın</strong> (ya da buradaki çubuğa dokunun). Yuvarlak Ana Ekran düğmeli eski iPhone\'larda: ona basın.'
                          : 'Her yerden ana ekrana gitmek için alttaki <strong>ana ekran dairesine ○ dokunun</strong> (ya da alt kenardan yukarı kaydırın).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': 'Geri, bir sayfa geriye götürür. Ana ekrana gitmek için ana ekran dairesine ○ dokunun.'}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Dokunmayı, basılı tutmayı, kaydırmayı, aşağı kaydırmayı, geri gitmeyi ve ana ekrana gitmeyi denediniz: her gün kullanacağınız hareketler.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Bağlı', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'İnternet', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'AĞLAR' : 'Kullanılabilir ağlar'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Ayarlar',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>"BT-Hub-7F2A" için şifreyi girin</strong></p>
                ${field('wifipass', 'Şifre', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Katıl' : 'Bağlan'}</button>
                <button type="button" class="cp" data-tap="cancel">İptal</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Evde Wi-Fi kullanmak mobil verinizi korur. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: 'Üstteki <strong>Wi-Fi\'ye dokunun</strong>.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Ağ ve internet\'e dokunun.</strong> <em>Samsung\'da Bağlantılar, sonra Wi-Fi.</em>'},
               {screen: () => list(p, 'Ağ ve internet', [{id: 'internet', label: 'İnternet', sub: 'Wi-Fi ve mobil veri'}, {id: 'sims', label: 'SIM\'ler'}, {id: 'hotspot', label: 'Hotspot ve bağlantı paylaşımı'}]),
                target: 'internet', say: '<strong>İnternet\'e dokunun.</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Wi-Fi adınız ve şifreniz genellikle modeminizin (ışıklı kutu) arkasındaki bir etikette yazar. Bu deneme modeminin etiketinde şöyle yazıyor:<br><span class="ahd">Ağ: <strong>BT-Hub-7F2A</strong><br>Şifre: <strong>Green-Apple-42</strong></span><strong>BT-Hub-7F2A\'ya dokunun.</strong>',
         hints: {'net-vm-neighbour': 'Bu bir komşunun Wi-Fi\'si. Etiketinizdeki adı bulun: BT-Hub-7F2A.', 'net-sky-12345': 'Bu başkasının Wi-Fi\'si. Etiketinizdeki adı bulun: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Şifre, büyük harfler ve tireler dahil etiketle tam olarak aynı olmalı: Green-Apple-42',
         say: 'Şifreyi etiketteki gibi <strong>aynen</strong> yazın: <strong>Green-Apple-42</strong>. Büyük harfler önemlidir! Sonra <strong>Katıl\'a dokunun</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Bağlandınız! Evdeyken telefonunuz artık bu Wi-Fi\'ye kendiliğinden bağlanacak. Bir kafede ücretsiz Wi-Fi kullanmak güvenli mi?', options: [
            {t: 'Evet, gezinmek için, ama üzerinde internet bankacılığından kaçının', ok: true, why: 'Aynen öyle. Herkese açık Wi-Fi, haber okumak ya da otobüs saatine bakmak için sorun değildir. Bankacılık için mobil veriyi ya da ev Wi-Fi\'nizi kullanın.'},
            {t: 'Evet, her şey için', why: 'Herkese açık Wi-Fi başkaları tarafından izlenebilir. Gezinmek için sorun değil, ama bankacılık için mobil veriyi ya da ev Wi-Fi\'nizi kullanın.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Tebrikler!</strong> Wi-Fi\'ye bağlandınız. Ekranınızın üstünde yelpaze biçimli Wi-Fi simgesini arayın.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Yeni Kişi' : 'Kişi oluştur', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Ad', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Cep telefonu numarası', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Bitti' : 'Kaydet'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Kişi', [
        {label: 'Cep', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Favorilere Ekle' : (ctx.fav ? '⟦star⟧ Favori' : '⟦star⟧ Favorilere ekle')},
        {id: 'share', label: 'Kişiyi Paylaş'}], {back: 'Kişiler'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Kişiler', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Birinin numarasını kaydetmek, onu adıyla aramanızı sağlar. iPhone\'da kişiler <strong>Telefon</strong> uygulamasındadır. <strong>Telefon\'a dokunun.</strong>' : '<strong>Kişiler\'e dokunun.</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Kişiler', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Kişiler', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Bu sizin kişi listeniz. Birini eklemek için sağ üstteki <strong>+\'ya dokunun</strong>.' : 'Bu sizin kişi listeniz. Birini eklemek için <strong>+ düğmesine dokunun</strong>.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Bir ad ve deneme numarasını yazın: 07700 900456, sonra dokunun: ' + (p === 'ios' ? 'Bitti.' : 'Kaydet.'),
         say: `Kişinin <strong>adını</strong> yazın ("Ann" deneyin) ve numarasını. Alıştırma için <strong>07700 900456</strong> kullanın. Sonra <strong>dokunun: ${p === 'ios' ? 'Bitti' : 'Kaydet'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Kaydedildi! Favoriler, en çok aradığınız kişilerdir ve tek dokunuşla aramak için en üstte gösterilir. <strong>Dokunun: ' + (p === 'ios' ? 'Favorilere Ekle' : 'yıldız') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Adının önüne "ICE" (Acil Durumda Aranacak Kişi) yazarak kaydetmeye hangi kişi değer?', options: [
            {t: '"ICE Sarah" gibi, en yakın akrabanız', ok: true, why: 'Evet. Sağlık görevlileri ICE\'ı aramayı bilir. Daha da iyisi, Tıbbi Kimlik\'inize bir acil durum kişisi ekleyin; bu, Telefonunuzu güvende tutmak kursunda anlatılıyor.'},
            {t: 'Bankanız', why: 'ICE, size bir şey olursa aranacak kişi içindir; genellikle en yakın akrabanız.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Tebrikler!</strong> Bir kişi kaydettiniz ve onu favori yaptınız.'},
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
    const recents = p => app(p, 'Son Aramalar', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Telefonunuz çalıyor: Jean arıyor. <strong>Cevaplamak için yeşil düğmeye dokunun.</strong>' + (p === 'android' ? ' <em>Bazı Android telefonlarda bunun yerine yeşil düğmeyi yukarı kaydırırsınız.</em>' : ' <em>iPhone\'unuz kilitliyse bunun yerine yeşil düğmeyi karşıya kaydırırsınız.</em>'),
         hints: {decline: 'Kırmızı aramayı reddeder. Cevaplamak için yeşile dokunun.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Konuşuyorsunuz! Daha iyi duymak ya da eller serbest konuşmak için <strong>hoparlöre dokunun</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Bitirdiğinizde kapatmak için <strong>kırmızı düğmeye dokunun</strong>.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Daha önce Dave\'den bir arama kaçırdınız. Kaçırılan aramalar son aramalarınızda <strong>kırmızı</strong> görünür. Onu geri aramak için <strong>Dave\'e dokunun</strong>.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Dave aranıyor. Konuşmanız bitince kapatmak için <strong>kırmızı düğmeye dokunun</strong>.'},
        {screen: () => recents(p), question: {q: 'Tanımadığınız bir numaradan biri arıyor ve bankanızdan olduğunu söylüyor. Ne yaparsınız?', options: [
            {t: 'Kapatır ve bankama güvenle ulaşmak için 159\'u ararım', ok: true, why: 'Aynen öyle. Telefonu her zaman kapatıp güvendiğiniz bir numaradan geri arayabilirsiniz. 159 sizi kendi bankanıza bağlar.'},
            {t: 'Dediklerini yaparım, banka bu', why: 'Dolandırıcılar sürekli banka gibi davranır ve numara taklit edilebilir. Kapatın ve 159\'u arayın.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Tebrikler!</strong> Aramaları cevaplayabilir, hoparlörü kullanabilir, kapatabilir ve kaçırılan aramaları geri arayabilirsiniz.'},
    ], {});

    function smsList(p) {
        return app(p, 'Mesajlar', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Son kontrolünüz Mart ayındaydı. Çevrimiçi randevu alın ya da bizi arayın.</span><small>3 ay önce</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Kısa mesaj', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Kısa mesajlar <strong>Mesajlar</strong> uygulamasındadır. <strong>Mesajlar\'a dokunun.</strong>', hint: 'Konuşma balonu simgesidir.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Yeni mesajlar kalın görünür. Okumak için <strong>Diş Hekimi\'nden gelen mesaja dokunun</strong>.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Önce mesaj kutusuna Y yazın, sonra gönder okuna dokunun.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Diş hekimi onaylamak için <strong>Y</strong> yanıtlamanızı istiyor. <strong>Mesaj kutusuna dokunun, Y yazın, sonra gönder okuna dokunun</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Tamam! Şimdi toparlayın: en üstteki <strong>eski mesaja basılı tutun</strong> (parmağınızı bir iki saniye üzerinde tutun).', hint: 'Bir menü belirene kadar parmağınızı en üstteki eski mesajın üzerinde tutun.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'Bir menü belirir. <strong>Sil\'e dokunun.</strong>',
         hints: {copy: 'Kopyala, sözcükleri kopyalar. Sil\'e dokunun.', forward: 'İlet, mesajı başkasına gönderir. Sil\'e dokunun.'}},
        {screen: c => smsChat(p, c), question: {q: 'Tanımadığınız bir numaradan gelen kısa mesaj, paketinizin tutulduğunu söylüyor ve bir bağlantıyla £1,45 ödemenizi istiyor. Ne yaparsınız?', options: [
            {t: 'Bağlantıya dokunmam. 7726\'ya iletir, sonra silerim', ok: true, why: 'Aynen öyle. 7726 ücretsizdir ve mesajı şebekenize bildirir. Kuryeler ücret isteyen bağlantılar göndermez.'},
            {t: 'Öderim, sadece £1,45', why: '£1,45 kart bilgilerinizi almak için bir yemdir. Bağlantıya dokunmayın: 7726\'ya iletin ve silin.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Tebrikler!</strong> Kısa mesajları okuyabilir, yanıtlayabilir ve ihtiyacınız olmayanları silebilirsiniz.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Haritalar', 15], ['WhatsApp', 9], ['Kamera', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Pil', [{id: 'low-power', label: 'Düşük Güç Modu', toggle: saver, sub: 'Tam şarj edene kadar arka plan etkinliğini azaltır.'}, {caption: 'UYGULAMAYA GÖRE PİL KULLANIMI'}], {back: 'Ayarlar', top: head, bottom: apps})
            : list(p, 'Pil', [{id: 'low-power', label: 'Pil Tasarrufu', toggle: saver, sub: 'Pilin daha uzun dayanması için bazı özellikleri kapatır.'}, {caption: 'Pil kullanımı'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Pil mi azalıyor? <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Pil\'e dokunun.</strong>', hint: p === 'ios' ? 'Pil üçüncü gruptadır.' : 'Pil, listede Bildirimler\'den sonradır.'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `Pil %23'te. <strong>${p === 'ios' ? 'Düşük Güç Modu' : 'Pil Tasarrufu'}</strong> pilin daha uzun dayanmasını sağlar. <strong>Açmak için ona dokunun.</strong> Hatırlatmak için pil simgesi şu renge döner: ${p === 'ios' ? 'yellow' : 'orange'}.`},
        {screen: c => batteryPage(p, c), question: {q: 'Liste, bugün en çok pili Facebook\'un kullandığını gösteriyor. Pilin en uzun dayanmasına ne yardımcı olur?', options: [
            {t: 'Ekran parlaklığını düşürmek ve işiniz biten uygulamaları kapatmak', ok: true, why: 'Evet. En çok gücü ekran harcar. Parlaklığı düşürün; Facebook ve YouTube gibi uygulamalar da çok harcar.'},
            {t: 'Her saat %100\'e kadar şarj etmek', why: 'Sık şarj etmek zarar vermez, ama pilin daha uzun dayanmasını sağlamaz. Parlaklığı düşürün ve pil tasarruf modunu kullanın.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Tebrikler!</strong> Pil tasarrufu açık ve hangi uygulamaların en çok güç kullandığını biliyorsunuz.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'cep · 3 arama' : 'Şüpheli spam · 3 arama'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Son Aramalar', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>cep</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>cep</small><span>Dün</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Aynı bilinmeyen numara sizi arayıp duruyor. Hadi engelleyelim. <strong>Telefon uygulamasını açın.</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `Son aramalarınızda 07700 900842${p === 'android' ? ' (bazı Android telefonlarda numaranın kendisine dokunun)' : ''} numarasının yanındaki <strong>ⓘ'ye dokunun</strong>.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Kişiyi Paylaş'}, {id: 'block', label: p === 'ios' ? 'Bu Arayanı Engelle' : 'Spam\'i engelle/bildir', danger: true}], {back: 'Son Aramalar'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Bu Arayanı Engelle' : 'Spam\'i engelle/bildir'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Bu arayan engellensin mi?', 'Engelleme listenizdeki kişilerden telefon araması, mesaj veya FaceTime almayacaksınız.', [['cancel', 'İptal'], ['confirm', 'Kişiyi Engelle']])
            : dialog(p, '07700 900842 engellensin mi?', '⟦square-check⟧ Aramayı spam olarak bildir', [['cancel', 'İptal'], ['confirm', 'Engelle']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Kişiyi Engelle' : 'Engelle'}.</strong>${p === 'android' ? ' "Aramayı spam olarak bildir" işaretli kalırsa başkalarını uyarmaya yardımcı olur.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Engellendi! Ayrıca <strong>tanımadığınız numaralardan gelen tüm aramaları sessize alabilirsiniz</strong>. <strong>Ayarlar\'a dokunun.</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'En alta kaydırın ve <strong>Uygulamalar\'a dokunun</strong>.'},
            {screen: () => list(p, 'Uygulamalar', [{id: 'app-phone', label: 'Telefon'}, {id: 'app-messages', label: 'Mesajlar'}, {id: 'app-mail', label: 'Mail'}], {back: 'Ayarlar'}), target: 'app-phone', say: '<strong>Telefon\'a dokunun.</strong>'},
            {screen: c => list(p, 'Telefon', [{id: 'silence', label: 'Bilinmeyen Arayanları Sessize Al', toggle: !!c.silence}, {id: 'blocked', label: 'Engellenen Kişiler', value: '1'}], {back: 'Uygulamalar'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Bilinmeyen Arayanları Sessize Al\'ı açın.</strong> Kişilerinizde olmayan numaralardan gelen aramalar doğrudan sesli mesaja gider ve yine de son aramalarınızda görünür.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Engellendi! Ayrıca <strong>spam aramaları filtreleyebilirsiniz</strong>. Sağ üstteki <strong>üç noktaya ⋮ dokunun</strong>.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Ayarlar\'a dokunun.</strong>'},
            {screen: () => list(p, 'Ayarlar', [{id: 'caller-id', label: 'Arayan kimliği ve spam'}, {id: 'blocked', label: 'Engellenen numaralar'}, {id: 'sounds', label: 'Sesler ve titreşim'}]), target: 'caller-id', say: '<strong>Arayan kimliği ve spam\'e dokunun.</strong>'},
            {screen: c => list(p, 'Arayan kimliği ve spam', [{id: 'caller-show', label: 'Arayan ve spam kimliğini gör', toggle: true}, {id: 'silence', label: 'Spam aramaları filtrele', toggle: !!c.silence, sub: 'Şüpheli spam aramalar telefonunuzu çaldırmaz'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Spam aramaları filtrele\'yi açın.</strong> Şüpheli dolandırıcılık aramaları telefonunuzu çaldırmaz.'},
        ]),
        {screen: c => list(p, 'Bitti', [{label: 'Engellenen numaralar', value: '1'}, {label: p === 'ios' ? 'Bilinmeyen Arayanları Sessize Al' : 'Spam aramaları filtrele', toggle: true}]),
         question: {q: 'Bilinmeyen arayanları sessize almak, hastane ya da kurye gibi gerçek bir aramayı kaçırmanıza yol açabilir mi?', options: [
            {t: 'Evet, bu yüzden sesli mesajınıza ve kaçırılan aramalara arada bir bakın', ok: true, why: 'Aynen öyle. Gerçek arayanlar genellikle mesaj bırakır ve kaçırılan aramalar yine listenizde görünür.'},
            {t: 'Hayır, her zaman ulaşırlar', why: 'Bilinmeyen numaralar, gerçek olanlar dahil sesli mesaja gider. Sesli mesajınıza ve kaçırılan aramalara zaman zaman bakın.'}]}},
        {screen: () => list(p, 'Bitti', [{label: 'Engellenen numaralar', value: '1'}, {label: p === 'ios' ? 'Bilinmeyen Arayanları Sessize Al' : 'Spam aramaları filtrele', toggle: true}]), done: true,
         say: '<strong>Tebrikler!</strong> Can sıkıcı bir numarayı engellediniz ve dolandırıcılık aramalarını azalttınız.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: ödenmemiş £1,45 ücret nedeniyle paketiniz bekletiliyor. Yeniden teslimat için şimdi ödeyin: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Kime: ${field('fwdto', 'Numara', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Teşekkürler. Lütfen dolandırıcılık mesajının geldiği telefon numarasını gönderin.</span><small>şimdi</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Teşekkürler, bildiriminiz alındı.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Yeni mesaj') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Kısa mesaj', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Diğer… sonra İlet' : 'İlet'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Royal Mail gibi görünen bir dolandırıcılık mesajı aldınız. Silmeden önce ücretsiz olarak bildirin. <strong>Mesajlar\'ı açın.</strong>'},
        {screen: () => app(p, 'Mesajlar', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: 'Açmak için <strong>mesaja dokunun</strong>. İçindeki bağlantıya dokunmayın!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: 'Bir menü belirene kadar <strong>mesaja basılı tutun</strong> (parmağınızı üzerinde tutun). Bağlantıya dokunmayın.', hint: 'Parmağınızı gri mesaj balonunun üzerinde bir iki saniye tutun.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Diğer…\'e dokunun</strong>, sonra ilet okuna (burada tek düğme ikisini de yapar).' : '<strong>İlet\'e dokunun.</strong> (Bazı telefonlarda üstteki üç noktanın ⋮ altındadır.)',
         hints: {delete: 'Önce bildirin, sonra silebilirsiniz.', copy: '7726\'ya göndermek için İlet\'e dokunun.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: '"Kime" kutusuna 7726 yazın (telefon tuş takımında SPAM yazar), sonra gönder\'e dokunun.',
         action: c => { c.sent7726 = true; }, say: '<strong>Kime</strong> kutusuna <strong>7726</strong> yazın. (Tuş takımında S-P-A-M yazar.) Sonra <strong>gönder\'e dokunun</strong> ⟦send-horizontal⟧. Ücretsizdir.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Dolandırıcının numarasını yazın: 07700 900911, sonra gönder\'e dokunun.',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 yanıt verip dolandırıcılığın hangi numaradan geldiğini soruyor. <strong>07700 900911 yazın</strong> ve <strong>gönder\'e dokunun</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Bildirdiniz. Şimdi dolandırıcılık mesajıyla ne yapmalısınız?', options: [
            {t: 'Silerim ve numarayı engellerim', ok: true, why: 'Evet. Bildirildi, yani silebilirsiniz. Engellemek o numaradan daha fazla mesaj gelmesini önler.'},
            {t: 'Gerçek olup olmadığını kontrol etmek için bağlantıya dokunurum', why: 'Dolandırıcılık mesajlarındaki bağlantılara asla dokunmayın. Silin ve numarayı engelleyin.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Tebrikler!</strong> Bir dolandırıcılık mesajını 7726\'ya bildirdiniz; bu, şebekelerin onu herkes için engellemesine yardımcı olur. Dolandırıcılık e-postaları report@phishing.gov.uk adresine gider.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Güncellemeler güvenlik sorunlarını giderir, bu yüzden önemlidir. Önce telefonunuzu şarja takın ve Wi-Fi\'ye bağlanın. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Genel\'e dokunun.</strong>'},
        {screen: () => list(p, 'Genel', [{id: 'about', label: 'Hakkında'}, {id: 'software', label: 'Yazılım Güncelleme', value: '1'}, {id: 'storage', label: 'iPhone Depolama Alanı'}], {back: 'Ayarlar'}), target: 'software', say: '<strong>Yazılım Güncelleme\'ye dokunun.</strong> Kırmızı 1, bekleyen bir güncelleme olduğu anlamına gelir.'},
        {screen: () => list(p, 'Yazılım Güncelleme', [{id: 'auto', label: 'Otomatik Güncellemeler', value: 'Kapalı'}], {back: 'Genel',
            bottom: '<div class="hu"><strong>iOS güncellemesi</strong><p>Bu güncelleme önemli güvenlik düzeltmelerini içerir ve tüm kullanıcılara önerilir.</p><button type="button" class="ce co" data-tap="update-now">Şimdi Güncelle</button></div>'}),
         target: 'update-now', say: '<strong>Şimdi Güncelle\'ye dokunun.</strong>', hints: {auto: 'Bundan sonra Otomatik Güncellemeleri açmaya da değer. Önce Şimdi Güncelle\'ye dokunun.'}},
        {screen: c => codeScreen(p, c, 'Parolayı Girin', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone\'unuz parolanızı soruyor. <strong>Deneme kodunu yazın: 4 7 1 9 3 6.</strong>', hint: '4 7 1 9 3 6 yazın.'},
        {screen: c => list(p, 'Yazılım Güncelleme', [], {back: 'Genel', bottom: `<div class="hu"><strong>${c.busy ? 'İndiriliyor…' : 'Yüklemeye hazır'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Önce indirilir, bu birkaç dakika sürebilir. Sonra <strong>Şimdi Yükle\'ye dokunun</strong>. Telefonunuz yeniden başlar, bu yüzden 15 ila 30 dakika ona ihtiyacınız olmayacağı bir zamanda yapın.'},
        {screen: () => list(p, 'Yazılım Güncelleme', [{id: 'auto', label: 'Otomatik Güncellemeler', value: 'Açık'}], {back: 'Genel', bottom: '<div class="hu"><strong>iPhone\'unuz güncel</strong></div>'}),
         question: {q: 'Otomatik Güncellemeleri açmaya değer mi?', options: [
            {t: 'Evet, o zaman şarjdayken gece boyunca güncellenir', ok: true, why: 'Aynen öyle. Ayarlar > Genel > Yazılım Güncelleme > Otomatik Güncellemeler. Fişe takılıyken ve Wi-Fi\'deyken gece yüklenir.'},
            {t: 'Hayır, güncellemeler isteğe bağlıdır', why: 'Güncellemeler dolandırıcıların kullandığı güvenlik açıklarını kapatır. Otomatik güncellemeler, hatırlamanıza gerek kalmadan sizi güvende tutar.'}]}},
        {screen: () => list(p, 'Yazılım Güncelleme', [], {bottom: '<div class="hu"><strong>iPhone\'unuz güncel ⟦check⟧</strong></div>'}), done: true, say: '<strong>Tebrikler!</strong> Telefonunuz güncellendi ve en son sorunlara karşı korunuyor.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Güncellemeler güvenlik sorunlarını giderir, bu yüzden önemlidir. Önce telefonunuzu şarja takın ve Wi-Fi\'ye bağlanın. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Aşağı kaydırın ve <strong>Sistem\'e dokunun</strong>. <em>Samsung\'da altta yakın, Yazılım güncelleme.</em>'},
        {screen: () => list(p, 'Sistem', [{id: 'languages', label: 'Diller'}, {id: 'date', label: 'Tarih ve saat'}, {id: 'software', label: 'Yazılım güncellemeleri', sub: 'Güncelleme mevcut'}]), target: 'software', say: '<strong>Yazılım güncellemeleri\'ne dokunun.</strong>'},
        {screen: () => list(p, 'Yazılım güncellemeleri', [{id: 'system-update', label: 'Sistem güncellemesi', sub: 'Güncelleme mevcut'}, {id: 'play-update', label: 'Google Play sistem güncellemesi'}]), target: 'system-update', say: '<strong>Sistem güncellemesi\'ne dokunun.</strong>'},
        {screen: () => list(p, 'Sistem güncellemesi', [], {bottom: '<div class="hu"><strong>Sistem güncellemesi mevcut</strong><p>Önemli güvenlik düzeltmelerini içerir.</p><button type="button" class="ce dk" data-tap="download">İndir ve yükle</button></div>'}),
         target: 'download', say: '<strong>İndir ve yükle\'ye dokunun.</strong>'},
        {screen: c => list(p, 'Sistem güncellemesi', [], {bottom: `<div class="hu"><strong>${c.busy ? 'İndiriliyor ve yükleniyor…' : 'Bitirmek için yeniden başlat'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'İndirilir ve hazırlanır, bu biraz zaman alabilir. Sonra <strong>Şimdi yeniden başlat\'a dokunun</strong>. Telefonunuz kapanıp yeniden açılır, bu birkaç dakika sürer.'},
        {screen: () => list(p, 'Sistem güncellemesi', [], {bottom: '<div class="hu"><strong>Sisteminiz güncel</strong></div>'}),
         question: {q: 'Telefonunuz yıllardır güncelleme almamış. Bu ne anlama gelebilir?', options: [
            {t: 'Güvenlik güncellemeleri almak için çok eski olabilir, yani daha az güvenli', ok: true, why: 'Evet. Eski telefonlar güncelleme almayı bırakır. Üzerlerinde bankacılıktan kaçının ve mümkün olduğunda değiştirmeyi düşünün.'},
            {t: 'Mükemmel çalışıyor', why: 'Telefonlar birkaç yıl sonra güncelleme almayı bırakır; bu da güvenlik açıklarının kapatılmamasına yol açar.'}]}},
        {screen: () => list(p, 'Sistem güncellemesi', [], {bottom: '<div class="hu"><strong>Sisteminiz güncel ⟦check⟧</strong></div>'}), done: true, say: '<strong>Tebrikler!</strong> Telefonunuz güncellendi ve en son sorunlara karşı korunuyor.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (Kızım)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Tıbbi Kimlik' : 'Tıbbi bilgiler', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'ör. Tip 2 diyabet', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'ör. Penicillin', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Kilitliyken Göster</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Bitti' : 'Kaydet'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Bir kişi seçin</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Sağlık', '#fff', ICON2.health]]), target: 'health', say: '<strong>Tıbbi Kimlik</strong>, telefonunuz kilitliyken bile sağlık görevlilerinin alerjilerinizi ve acil durum kişinizi görmesini sağlar. <strong>Sağlık uygulamasını açın.</strong>'},
            {screen: () => app(p, 'Özet', '<p class="cf">Sağlık verileriniz burada gösterilir.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: 'Sağ üstteki <strong>resminize dokunun</strong>.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Sağlık Ayrıntıları'}, {id: 'medical', label: 'Tıbbi Kimlik'}], {back: 'Özet'}), target: 'medical', say: '<strong>Tıbbi Kimlik\'e dokunun.</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Telefonunuz, kilitliyken bile sağlık görevlilerinin görebileceği <strong>tıbbi bilgileri</strong> saklayabilir. <strong>Ayarlar\'a dokunun.</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Aşağı kaydırın ve <strong>Güvenlik ve acil durum\'a dokunun</strong>. <em>Samsung\'da adı Güvenlik ve acil durum.</em>'},
            {screen: () => list(p, 'Güvenlik ve acil durum', [{id: 'medical', label: 'Tıbbi bilgiler'}, {id: 'contacts-ec', label: 'Acil durum kişileri'}, {id: 'sos', label: 'Acil Durum SOS'}]), target: 'medical', say: '<strong>Tıbbi bilgiler\'e dokunun.</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Önce bir alerji yazın (alıştırma için "Penicillin"), sonra bir acil durum kişisi ekleyin.',
         say: 'Sağlık görevlilerinin bilmesi gereken her şeyi doldurun. Alıştırma için alerjiler altına <strong>Penicillin</strong> yazın. Sonra <strong>acil durum kişisi ekle\'ye dokunun</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Acil durumda kimin aranacağını seçin. <strong>Sarah\'ya dokunun.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '"Kilitliyken Göster" açık, yani sağlık görevlileri görebilir. <strong>Bitti\'ye dokunun.</strong>' : '<strong>Kaydet\'e dokunun.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Tıbbi Kimlik' : 'Tıbbi bilgiler', [{label: 'Alerjiler', sub: typed(c, 'allergies')}, {label: 'Acil durum kişisi', sub: 'Sarah (Kızım)'}]),
         question: {q: p === 'ios' ? 'Telefonunuz kilitliyse bir sağlık görevlisi Tıbbi Kimlik\'inizi nasıl görür?' : 'Telefonunuz kilitliyse bir sağlık görevlisi bunu nasıl görür?', options: [
            {t: 'Kilit ekranındaki "Acil Durum" düğmesinden', ok: true, why: 'Evet. Kilit ekranında Acil Durum\'a dokunmak, telefonunuzun kilidini açmadan tıbbi bilgilerinizi gösterir.'},
            {t: 'Göremezler', why: 'Görebilirler: kilit ekranındaki Acil Durum düğmesi, parolanız gerekmeden onu gösterir.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Tıbbi Kimlik' : 'Tıbbi bilgiler', [{label: 'Alerjiler', sub: typed(c, 'allergies')}, {label: 'Acil durum kişisi', sub: 'Sarah (Kızım)'}]), done: true,
         say: '<strong>Tebrikler!</strong> Tıbbi bilgileriniz ve acil durum kişiniz kaydedildi. Acil Durum SOS ile yardım çağırırsanız acil durum kişinize de haber verilir.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Bul' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Ses çalınıyor…' : '⟦volume-2⟧ Ses Çal'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Kayıp Olarak İşaretle' : 'Cihazı güvene al'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Telefonunuz kaybolursa onu bulabilir, çaldırabilir ya da kilitleyebilirsiniz, ama yalnızca bu önce açıksa. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Üstteki <strong>adınıza dokunun</strong>.'},
            {screen: () => list(p, 'Apple Hesabı', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Bul'}, {id: 'family', label: 'Aile Paylaşımı'}], {back: 'Ayarlar'}), target: 'findmy', say: '<strong>Bul\'a dokunun.</strong>'},
            {screen: c => list(p, 'Bul', [{id: 'find-toggle', label: 'iPhone\'umu Bul', toggle: !!c.findOn}, {label: 'Son Konumu Gönder', toggle: !!c.findOn}], {back: 'Apple Hesabı'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>iPhone\'umu Bul\'u açın.</strong> "Son Konumu Gönder", pil bitmeden hemen önce konumunu gönderir.'},
            {screen: () => homeWith(p, [['findmy', 'Bul', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Şimdi telefonunuzu bulamadığınızı düşünün. Başka bir Apple cihazında <strong>Bul</strong> uygulamasını açardınız (ya da bilgisayarda icloud.com/find adresine giderdiniz). Burada <strong>Bul\'a dokunun</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Aşağı kaydırın ve <strong>Google\'a dokunun</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Tüm hizmetler'}, {id: 'account', label: 'Google Hesabınızı yönetin'}]), target: 'all-services', say: '<strong>Tüm hizmetler\'e dokunun.</strong>'},
            {screen: () => list(p, 'Tüm hizmetler', [{id: 'find-hub', label: 'Find Hub', sub: 'Eskiden Cihazımı Bul olarak adlandırılıyordu'}, {id: 'theft', label: 'Hırsızlığa karşı koruma'}]), target: 'find-hub', say: '<strong>Find Hub\'a dokunun</strong> (eskiden Cihazımı Bul olarak adlandırılıyordu). <em>Samsung\'un kendi seçeneği de var: Ayarlar &gt; Güvenlik ve gizlilik &gt; Kayıp cihaz koruması.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Find Hub\'ı kullan', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Find Hub\'ı kullan\'ı açın.</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Şimdi telefonunuzu bulamadığınızı düşünün. Başka bir telefon ya da tablette <strong>Find Hub</strong> uygulamasını açardınız ya da bilgisayarda google.com/android/find adresine giderdiniz. Burada <strong>Find Hub\'a dokunun</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'İşte haritada. Yakınlarda bir yerdeyse, örneğin kanepenin kenarında, <strong>Ses Çal\'a dokunun</strong>: sessizdeyken bile yüksek sesle çalar.'},
        {screen: c => findMap(p, c), question: {q: 'Harita telefonunuzu hiç gitmediğiniz bir yerde gösteriyor. Ne yapmalısınız?', options: [
            {t: 'Kilitlemek için Kayıp Olarak İşaretle ya da Cihazı güvene al\'ı kullanır ve polisle iletişime geçerim', ok: true, why: 'Evet. Bul ya da Find Hub\'dan kilitleyin, oraya kendiniz gitmeyin ve polise ve şebekenize bildirin.'},
            {t: 'Gidip kendim geri alırım', why: 'Bir hırsızla asla yüzleşmeyin. Telefonu uzaktan kilitleyin ve polisle iletişime geçin.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Tebrikler!</strong> Telefonunuzu bulma özelliği açık ve onu nasıl çaldıracağınızı ya da kilitleyeceğinizi biliyorsunuz.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Ücretsiz teknoloji ipuçları</strong>${UI.qr}<small>Beni tara</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Bu fotoğraf silinsin mi?', p === 'ios' ? '30 gün boyunca Yakın Zamanda Silinenler\'de tutulur.' : 'Tamamen silinmeden önce bir süre çöp kutusuna taşınır.', [['cancel', 'İptal'], ['confirm-delete', 'Sil']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Kamera\'yı açın.</strong> <em>İpucu: çoğu telefonda kilit ekranında sola kaydırarak da açabilirsiniz.</em>', hint: 'Kamera, üzerinde kamera olan gri simgedir.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Çiçeklere doğrultun ve sabit tutun. Fotoğraf çekmek için <strong>büyük yuvarlak düğmeye dokunun</strong>.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Çıt! Kaydedildi. Görmek için köşedeki <strong>küçük resme dokunun</strong>.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Daha yakından bakmak için iki parmağınızı fotoğrafın üzerine koyup birbirinden ayırın. Burada <strong>＋\'ya iki kez dokunun</strong>.', hint: 'Sağ üstteki ＋\'ya dokunun.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Çok güzel! Birine göndermek için <strong>paylaş düğmesine dokunun</strong> ⇪ (oklu bir kutu).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Nasıl göndereceğinizi seçin: Mesajlar, e-posta, WhatsApp vb. <strong>Mesajlar\'a dokunun.</strong> (Sonra kime göndereceğinizi seçersiniz.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Gönderildi! Şimdi, istemediğiniz bir fotoğraf çekerseniz silmek için <strong>çöp kutusuna dokunun</strong> ⟦trash-2⟧.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Telefonunuz önce kontrol eder. <strong>Sil\'e dokunun.</strong>'},
        {screen: () => app(p, 'Fotoğraflar', '<p class="cf">Henüz fotoğraf yok.</p>', {back: false, color: '#fff'}), question: {q: 'Yanlışlıkla bir fotoğrafı sildiniz! Ne yapabilirsiniz?', options: [
            {t: p === 'ios' ? 'Albümler > Yakın Zamanda Silinenler\'e bakar ve geri alırım' : 'Çöp kutusuna (Kitaplık > Çöp kutusu) bakar ve geri yüklerim', ok: true, why: 'Evet. Silinen fotoğraflar bir süre, genellikle yaklaşık bir ay, saklanır; böylece geri alabilirsiniz.'},
            {t: 'Hiçbir şey, sonsuza dek gitti', why: 'Merak etmeyin! Bir süre Yakın Zamanda Silinenler\'de (iPhone) ya da Çöp kutusunda (Android) saklanır.'}]}},
        {screen: () => app(p, 'Fotoğraflar', '<p class="cf">Hepsi tamam.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Tebrikler!</strong> Fotoğraf çekebilir, yakınlaştırabilir, paylaşabilir ve silebilirsiniz.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Ailenizde de iPhone varsa <strong>FaceTime</strong> ücretsiz görüntülü arama yapar. <strong>FaceTime\'a dokunun.</strong>' : '<strong>Google Meet</strong>, Android\'den ve iPhone\'lara da ücretsiz görüntülü arama yapar. <strong>Google Meet\'e dokunun.</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Yeni FaceTime' : 'Yeni'}</button><p class="cf">Son aramalar burada görünür.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Yeni FaceTime' : 'Yeni'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Yeni FaceTime' : 'Ara', `<div class="xz">To: ${field('callto', 'Ad ya da numara', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Görüntülü arama'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Önce "Kime" kutusuna Sarah yazın.',
             say: 'Kişilerinizdeki birinin adını yazın. <strong>Sarah yazın</strong>, sonra <strong>video düğmesine dokunun</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Çalar, sonra Sarah cevap verir. Ona bahçeyi göstermek için arkadaki kamerayı kullanmak üzere <strong>çevir düğmesine dokunun</strong> ⟦switch-camera⟧.', hint: 'Sarah\'nın cevap vermesini bekleyin, sonra dokunun: ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Bitirdiğinizde kapatmak için <strong>kırmızı düğmeye dokunun</strong>.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Görüntülü · 3 dk</p>', {back: false, color: '#fff'}), question: {q: 'Arkadaşınızın Android telefonu var, sizin iPhone\'unuz. Yine de görüntülü arama yapabilir misiniz?', options: [
                {t: 'Evet, her ikisinde de çalışan WhatsApp ya da Google Meet ile', ok: true, why: 'Aynen öyle. FaceTime esas olarak iPhone\'dan iPhone\'a çalışır. WhatsApp ve Google Meet her ikisinde de çalışır.'},
                {t: 'Hayır, asla', why: 'Yapabilirsiniz: WhatsApp ve Google Meet her iki tür telefonda da çalışır.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Hepsi tamam.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Tebrikler!</strong> Görüntülü arama yaptınız ve arka kameranızın görüntüsünü gösterdiniz.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR kodları, afişlerde ve menülerde gördüğünüz kare siyah beyaz desenlerdir. Kameranız bunları ek uygulama olmadan okuyabilir. <strong>Kamera\'yı açın.</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Kamerayı koda doğrultun ve bir an sabit tutun. Ekranda bir <strong>bağlantı belirir</strong>: beklediğiniz kişi ya da kurumdan gibi göründüğünü kontrol edin, sonra <strong>ona dokunun</strong>.',
         hints: {shutter: 'Fotoğraf çekmeniz gerekmez: yalnızca doğrultun, bağlantının belirmesini bekleyin, sonra bağlantıya dokunun.'},
         hint: p === 'android' ? 'Bağlantının belirmesini bekleyin, sonra ona dokunun. Hiçbir şey belirmezse Google Lens\'i deneyin.' : 'Bağlantının belirmesini bekleyin, sonra ona dokunun.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Ücretsiz teknoloji ipuçları</h3><p>Telefonlar, bilgisayarlar ve internette güvende kalma üzerine sade dille ipuçları.</p></div>', {color: '#f8fafc'}),
         question: {q: 'Bir otopark ödeme makinesinde QR kodu etiketi görüyorsunuz. Ödemenin en güvenli yolu nedir?', options: [
            {t: 'Yapıştırılmış QR kodunu değil, otoparkın resmi uygulamasını ya da makineyi kullanırım', ok: true, why: 'Evet. Dolandırıcılar kart bilgilerini çalmak için gerçek kodların üzerine sahte QR kodları yapıştırır. Etiket olup olmadığına bakın ve resmi uygulamayı ya da tabelayı kullanın.'},
            {t: 'Tarar ve öderim, daha hızlı', why: 'Otopark makinelerindeki sahte QR etiketleri bilinen bir dolandırıcılıktır. Resmi uygulamayı ya da makinenin kendisini kullanın.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Ücretsiz teknoloji ipuçları</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Tebrikler!</strong> QR kodlarını kameranızla tarayabilirsiniz ve önce bağlantıyı kontrol etmeniz gerektiğini biliyorsunuz.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Pazar günkü fotoğraflar 📷', 'Selam anne, öğle yemeğinden fotoğraflar burada…'],
                       ['tv', 'TV Licensing', 'Lisansınızın süresi DOLDU', 'Kovuşturmadan kaçınmak için hemen harekete geçin. Ödeme bilgilerinizi güncelleyin…'],
                       ['library', 'Bridlington Library', 'Kitaplarınızın iade zamanı geldi', 'Ürünlerinizin Cuma günü iade edilmesi gerekiyor.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Gelen Kutusu' : 'Birincil', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · bana</p><h3>Pazar günkü fotoğraflar 📷</h3><p>Selam anne, öğle yemeğinden fotoğraflar burada. Seni görmek çok güzeldi! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Yanıtınızı yazın…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Lisansınızın süresi DOLDU</h3><p>Kovuşturmadan kaçınmak için hemen harekete geçin. Ödeme bilgilerinizi 24 saat içinde güncelleyin: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Gereksiz Posta\'ya Taşı' : '⋮ Kimlik avını bildir'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Mail' : 'e-posta uygulamanız (çoğu Android telefonda Gmail)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Yeni e-postalar kalın görünür. Okumak için <strong>Sarah\'nın e-postasına dokunun</strong>.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Yanıtlamak için <strong>Yanıtla\'ya dokunun</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Önce kısa bir yanıt yazın, sonra Gönder\'e dokunun.',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Kısa bir yanıt yazın</strong> (örneğin "Teşekkürler, bayıldım!") ve <strong>Gönder\'e dokunun</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Gönderildi ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Gelen kutusuna dön</button>', {color: '#fff'}), target: 'back', say: 'Gelen kutunuza dönmek için <strong>Geri\'ye dokunun</strong>.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: '"TV Licensing" adından endişe verici bir e-posta var. <strong>Açın</strong>, ama içindeki hiçbir şeye dokunmayın.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Dolandırıcılık e-postaları çoğu zaman gerçek bir ad ama sahte bir adres kullanır. Gerçek e-posta adresini görmek için <strong>göndericinin adına dokunun</strong>.',
         hint: 'E-postanın üstündeki "TV Licensing"e dokunun.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: '<strong>outlook-mail.com</strong> adresinden geliyor, tvlicensing.co.uk değil. Bu bir dolandırıcılık. <strong>Dokunun: ' + (p === 'ios' ? 'Gereksiz Posta\'ya Taşı' : 'Kimlik avını bildir') + '.</strong> Dolandırıcılık e-postalarını report@phishing.gov.uk adresine de iletebilirsiniz.'},
        {screen: c => inbox(p, c), question: {q: 'Dolandırıcılığı ele veren neydi?', options: [
            {t: 'Göndericinin gerçek adresi, tehditler ve 24 saatlik süre', ok: true, why: 'Aynen öyle. Gerçek kurumlar sizi süre sınırıyla tehdit etmez ve e-postaları kendi web adreslerinden gelir.'},
            {t: 'Hiçbir şey, gerçek görünüyordu', why: 'Göndericinin adresine bakın: TV Licensing\'e ait değildi. Tehditler ve kısa süre sınırları da büyük uyarı işaretleridir.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Tebrikler!</strong> E-postaları okuyabilir ve yanıtlayabilir, bir dolandırıcılığı fark edip bildirebilirsiniz.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Al' : 'Yükle';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Store'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Ara\'ya dokunun.</strong>' : '<strong>Arama çubuğuna dokunun.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: '"NHS App" aradık. Pek çok uygulama adında "NHS" kullanır. <strong>Kimin yaptığına</strong> bakın: gerçeğini <strong>NHS England</strong> yapar. <strong>Şu düğmeye dokunun: ' + (p === 'ios' ? 'Al' : 'Yükle') + ' (gerçek olanın yanında).</strong>',
         hints: {'fake1-get': 'Bu, HealthApps Ltd\'nin ve bir reklam. Gerçek NHS App\'i NHS England yapar.', 'fake2-get': 'Bu, QuickDev Apps\'in, NHS\'in değil. Gerçeğini NHS England yapar.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Yüklendi! Şimdi hiç kullanmadığınız bir uygulamayı kaldırın; ortalığı toparlayın ve yer açın. Bir menü belirene kadar <strong>Hava Durumu uygulamasına basılı tutun</strong>.', hint: 'Parmağınızı Hava Durumu simgesinin üzerinde bir iki saniye tutun.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? '"Hava Durumu" kaldırılsın mı?' : 'Hava Durumu', p === 'ios' ? 'Ana Ekran\'dan kaldırmak uygulamayı Uygulama Kitaplığı\'nızda tutar.' : '', p === 'ios'
            ? [['delete-app', 'Uygulamayı Sil'], ['remove-home', 'Ana Ekran\'dan Kaldır'], ['cancel', 'İptal']] : [['app-info', 'Uygulama bilgisi'], ['delete-app', 'Kaldır'], ['cancel', 'İptal']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Uygulamayı Kaldır\'a dokunun</strong>, sonra <strong>Uygulamayı Sil\'e</strong> (burada tek düğme).' : '<strong>Kaldır\'a dokunun.</strong>',
         hints: {'remove-home': 'Bu yalnızca simgeyi gizler; uygulama telefonunuzda kalır. Uygulamayı Sil\'e dokunun.'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Bir uygulama NHS kayıtlarınızın "kilidini açmak" için ödeme istiyor. Ne düşünürsünüz?', options: [
            {t: 'Bu gerçek NHS App değil; o tamamen ücretsizdir', ok: true, why: 'Aynen öyle. NHS App ücretsizdir. NHS hizmetleri için ödeme isteyen her şeyi silin.'},
            {t: 'Öderim, NHS için', why: 'Gerçek NHS App ücretsizdir ve NHS England tarafından yapılır. Para isteyen bir uygulama gerçeği değildir.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Tebrikler!</strong> Gerçek uygulamaları taklitlerinden ayırabilir ve ihtiyacınız olmayan uygulamaları kaldırabilirsiniz.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>Tekrar hoş geldiniz.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Face ID ile giriş yap' : 'Parmak iziyle giriş yap'}</button>
                <button type="button" class="cp" data-tap="password">E-posta ve şifreyle giriş yap</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Reçeteler'], ['appointments', '⟦calendar⟧', 'Randevular'], ['records', '⟦clipboard-list⟧', 'Sağlığınız'], ['messages', '⟦mail⟧', 'Mesajlar']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Reçeteler', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Tekrar reçete sipariş edin</strong><small>Size zaten yazılmış ilaçları seçin</small></button><div class="ck"><strong>Siparişlerinizi görüntüleyin</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipine 5mg tablet'], ['med-2', 'Atorvastatin 20mg tablet']];
            return app(p, 'İlaçları seçin', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Siparişinizi onaylayın', `<p class="cf">Amlodipine 5mg tablet<br>Teslim alınacak yer: Belirlediğiniz eczane</p><button type="button" class="ce co" data-tap="confirm">Onayla ve sipariş ver</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Sipariş gönderildi', '<p class="cf">⟦check⟧ Reçete talebiniz GP muayenehanenize gönderildi. Genellikle 2 ila 3 iş günü sürer.</p><button type="button" class="cp" data-tap="home">Ana sayfaya dön</button>', {color: NHS});
        return app(p, 'Randevular', '<div class="fo"><div class="ck"><strong>GP randevusu</strong><small>Salı 10:30 · GP muayenehaneniz</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> ücretsizdir; tekrar reçete sipariş etmenizi, randevularınızı görmenizi ve daha fazlasını yapmanızı sağlar. (Bu deneme sürümü sahtedir, yalnızca bu ders için hazırlandı.) <strong>NHS App\'e dokunun.</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `NHS login ile kurduktan sonra ${p === 'ios' ? 'face' : 'fingerprint'} ile giriş yapabilirsiniz. <strong>Dokunun: ${p === 'ios' ? 'Face ID' : 'fingerprint'} ile giriş yap.</strong>`,
         hints: {password: 'O da olur, ama yüzünüz ya da parmak iziniz daha hızlıdır. Mavi düğmeye dokunun.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Reçeteler\'e dokunun.</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Tekrar reçete sipariş edin\'e dokunun.</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Önce işaretlemek için bir ilaca dokunun, sonra Devam\'a dokunun.',
         say: 'İşaretlemek için <strong>ihtiyacınız olan ilaca dokunun</strong> (Amlodipine\'i deneyin), sonra <strong>Devam\'a dokunun</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Doğru olduğunu kontrol edin, sonra <strong>Onayla ve sipariş ver\'e dokunun</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Muayenehanenize gönderildi! <strong>Ana sayfaya dön\'e dokunun.</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Randevularınıza da bakabilirsiniz. <strong>Randevular\'a dokunun.</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'Bir mesaj şöyle diyor: "NHS: ücretsiz test kitine hak kazandınız, posta ücreti için banka bilgilerinizi girin". Bu nedir?', options: [
            {t: 'Bir dolandırıcılık. NHS kısa mesajla asla banka bilgisi istemez', ok: true, why: 'Aynen öyle. NHS App\'i ya da GP muayenehanenizi doğrudan kullanın, kısa mesajlardaki bağlantıları asla.'},
            {t: 'Gerçek, sadece posta ücreti', why: 'NHS kısa mesajla asla banka bilgisi istemez. Bu bir dolandırıcılık: 7726\'ya iletin.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Tebrikler!</strong> Tekrar reçete sipariş ettiniz ve randevularınıza baktınız.'},
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
        if (page === 'login') return app(p, 'Deneme Bankası', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Face ID ile giriş yap' : 'Parmak iziyle giriş yap'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Hesaplarınız', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Bugün'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Bugün'], ['txn-pension', 'State Pension', '+£921.60', 'Dün'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Pzt']];
            return app(p, 'Vadesiz hesap', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Ödeme', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Bugün, 03:12 · Sonu 4421 ile biten kart</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Kartı dondur</strong><small>${ctx.frozen ? 'Kart donduruldu ⟦check⟧' : 'Ödemeleri hemen durdurun'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Bu ödemeyi bildir</strong><small>Tanımadınız mı? Bize bildirin</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Banka', BANK, ICON2.pound]]), target: 'bank',
         say: 'Bankacılık uygulamaları, paranıza istediğiniz zaman bakmanızı sağlar. (Bu, alıştırma için sahte bir bankadır.) <strong>Banka uygulamasını açın.</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>${p === 'ios' ? 'face' : 'fingerprint'} ile giriş yapın.</strong> Bankacılık şifrenizi asla kimseyle paylaşmayın.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: 'Neler yatırılıp çekildiğini görmek için <strong>Vadesiz hesabınıza dokunun</strong>.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Ödemelere göz atın. Birini tanımıyorsunuz: <strong>gece 3\'te bir hediye kartı web sitesine £249</strong>. <strong>Ona dokunun.</strong>',
         hints: {'txn-tesco': 'Bu sizin alışverişiniz. Tanımadığınız bir tanesini arayın.', 'txn-pension': 'Bu, yatan emekli maaşınız. Aykırı olanı arayın.', 'txn-water': 'Bu, su faturanız. Aykırı olanı arayın.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Kartı dondur\'a dokunun</strong>. Daha fazla ödemeyi hemen durdurur ve sorun çıkmazsa daha sonra çözebilirsiniz.',
         hints: {report: 'Daha fazla ödemeyi durdurmak için önce kartı dondurun. Sonra bildirin.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Kartı dondurdunuz. Sırada ne var?', options: [
            {t: 'Bankamı 159\'dan ya da kartın üzerindeki numaradan ararım ya da uygulamada bildiririm', ok: true, why: 'Evet. Araştırabilir, kartı iptal edebilir ve çoğu zaman parayı geri alabilirler. Ne kadar erken söylerseniz o kadar iyi.'},
            {t: 'Bekler ve tekrar olup olmayacağını görürüm', why: 'Bankanıza hemen söyleyin. Ne kadar erken bilirlerse o kadar çok şey yapabilirler.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Tebrikler!</strong> Hesabınıza baktınız, tanımadığınız bir ödemeyi fark ettiniz ve kartınızı dondurdunuz.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Deneme Bankası</strong><span>•••• 4421</span><small>BANKA KARTI</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Cüzdan' : 'Google Wallet', `<p class="cf">Mağazalarda telefonunuzla ödeme yapmak için bir kart ekleyin.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Kart ekle' : '＋ Cüzdan\'a ekle'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Kart ekle', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Kartınızı çerçevenin içinde tutun…' : 'Kart bulundu ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Kartı doğrula', `<p class="cf">Bankanızın sizin olduğunuzu doğrulaması gerekiyor. Kodu nasıl alacağınızı seçin:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>Kısa mesaj</strong><small>••••• •••123 numarasına</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Bankanızı arayın</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Kodu girin', `<div class="jp ex"><strong>Mesajlar · şimdi</strong><span>Deneme Bankası: Cüzdan kodunuz 529173. Asla paylaşmayın.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Cüzdan' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Kartınız kullanıma hazır.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Okuyucuya yaklaştırın…' : 'Okuyucuya tutun…') : '⟦check⟧ Bitti'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Cüzdan' : 'Cüzdan', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Telefonla ödeme yapmak hızlı ve güvenlidir: mağazalar kart numaranızı asla görmez. <strong>Açın: ${p === 'ios' ? 'Cüzdan' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Kart ekle' : '＋ Cüzdan\'a ekle'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Telefonunuz kartınızı okumak için kamerayı kullanır, böylece numarayı yazmanız gerekmez. <strong>Kartınızı çerçevenin içinde tutun</strong>, sonra <strong>İleri\'ye dokunun</strong>. <em>Kart numaranızı bir mesajdaki ya da e-postadaki hiçbir web sitesine asla yazmayın.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Bankanız gerçekten siz olduğunuzu kontrol ediyor. <strong>Kısa mesaj\'a dokunun.</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Bankanızdan kısa mesajla bir kod gelir. <strong>5 2 9 1 7 3 yazın.</strong> Unutmayın: bu kod yalnızca kendi telefonunuza yazılır, isteyen hiç kimseye verilmez.', hint: 'Mesajdaki kodu yazın: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Kartınız hazır. Şimdi bir mağazada ödeme yapalım. <strong>Kartın herhangi bir yerine dokunun.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'Kasada iPhone\'unuzun <strong>yan düğmesine çift tıklayın</strong> (burada ⟦power⟧ düğmesine iki kez dokunun), Face ID için ekrana bakın, sonra telefonunuzun üst kısmını kart okuyucuya yaklaştırın.', hint: 'Yandaki ⟦power⟧ düğmesine iki kez dokunun.'}
            : {target: 'pay-now', say: 'Kasada yalnızca <strong>telefonunuzun kilidini açın ve arkasını kart okuyucuya yaklaştırın</strong>. Burada <strong>kart okuyucuya dokunun</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Telefonla ödeme yapmak güvenli mi?', options: [
            {t: 'Evet, kartınızdan daha güvenli: yüzünüzü, parmak izinizi ya da şifrenizi ister ve mağazalar kart numaranızı görmez', ok: true, why: 'Aynen öyle. Üstelik telefonunuzu kaybederseniz kilidini açmadan kimse onunla ödeme yapamaz.'},
            {t: 'Hayır, herkes kullanabilir', why: 'Her ödeme yüzünüzü, parmak izinizi ya da şifrenizi ister; bu yüzden temassız karttan aslında daha güvenlidir.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Tebrikler!</strong> Kartınız telefonunuzda ve deneme amaçlı bir ödeme yaptınız.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>BANKA KARTI</small></div>', '<small>BANKA KARTI</small></div></button>');
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
            return app(p, 'Deneme Tren', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'İstasyon seçin'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Railcard ekle'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>İstasyon seçin</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Railcard ekle</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Railcard yok']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Aktarmasız'], ['t-1145', '11:45', '12:32', 'Aktarmasız'], ['t-1245', '12:45', '13:32', 'Aktarmasız']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Fiyatlar bu alıştırma için uydurmadır. Railcard indirimi uygulandı.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Yoğun Olmayan Saat Tek Yön</strong><span>£7,40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Yoğun Olmayan Saat Günübirlik Gidiş-Dönüş</strong><small>Bugün dönün</small><span>£9,85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Biletiniz', `<div class="adt"><strong>Yoğun Olmayan Saat Günübirlik Gidiş-Dönüş</strong><span>Bridlington ⇄ Hull</span><span>Bugün · Senior Railcard</span>
            ${UI.qr}<small>Bunu bilet turnikesinde okutun ya da görevliye gösterin.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Trenler', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Tren uygulamaları, sıra beklemeden telefonunuzdan bilet almanızı sağlar. (Bu deneme uygulaması sahtedir: fiyatlar ve saatler uydurmadır.) <strong>Trenler\'i açın.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Bridlington\'dan gidiyorsunuz. Nereye gideceğinizi seçmek için <strong>Nereye\'ye dokunun</strong>.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Hull\'a dokunun.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: '60 yaşın üzerinde misiniz? <strong>Senior Railcard</strong>, çoğu biletten üçte bir tasarruf sağlar. Kendinizinkini eklemek için <strong>Railcard\'a dokunun</strong>.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Senior Railcard\'a dokunun.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Trenleri bul\'a dokunun.</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'İşte trenler. <strong>10:45\'e dokunun.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Bugün dönüyor musunuz? Günübirlik gidiş-dönüş genellikle iki tek yön biletten ucuzdur. <strong>Yoğun Olmayan Saat Günübirlik Gidiş-Dönüş\'e dokunun</strong>, sonra ödeyin.',
         hints: {single: 'Tek yön yalnızca bir yönlüdür. Bugün dönüyorsunuz, bu yüzden Yoğun Olmayan Saat Günübirlik Gidiş-Dönüş\'e dokunun.', pay: 'Önce biletinizi seçin: Yoğun Olmayan Saat Günübirlik Gidiş-Dönüş\'e dokunun.'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `Telefonunuzdaki kartla ödemek için <strong>dokunun: ${p === 'ios' ? 'Öde' : 'G Pay'}</strong> (temassız ödeme dersinden).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Eve dönüş treninizden önce telefonunuzun pili azaldı. İyi bir fikir nedir?', options: [
            {t: 'Biletin ekran görüntüsünü alıp pil tasarrufunu açmak', ok: true, why: 'Evet. Bazı biletler ekran görüntüsüyle de geçer ve pil tasarrufu daha uzun dayanmasına yardımcı olur. Birçok uygulama ayrıca bileti Cüzdan\'a eklemenize izin verir.'},
            {t: 'Hiçbir şey, sorun olmaz', why: 'Telefonunuz kapanırsa biletinizi gösteremezsiniz. Ekran görüntüsü alın ve pil tasarrufu yapın.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Tebrikler!</strong> Bir yolculuk planladınız, bir railcard eklediniz ve telefonunuzdan bilet aldınız.'},
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

    const busTable = `<div class="sj"><strong>121 numaralı otobüs: Bridlington - Hull</strong><small>Yalnızca deneme saatleri</small>
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
        return app(p, 'Otobüs saatleri', busTable, {back: false, color: '#fff',
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
            ? 'Ekran görüntüsü, ekranınızda ne varsa onun fotoğrafıdır; bu otobüs saatleri gibi. <strong>Yan düğmeye</strong> (sağda) ve <strong>ses artırma düğmesine</strong> (solda) aynı anda basın, sonra bırakın. Burada <strong>yan düğmeye, sonra ses artırma düğmesine dokunun</strong>.'
            : 'Ekran görüntüsü, ekranınızda ne varsa onun fotoğrafıdır; bu otobüs saatleri gibi. <strong>Güç düğmesine</strong> ve <strong>ses azaltma düğmesine</strong> aynı anda basın, sonra bırakın. Burada <strong>güç düğmesine, sonra ses azaltma düğmesine dokunun</strong>.',
         hints: {'vol-down': p === 'ios' ? 'iPhone\'da yan düğmeyle birlikte ses ARTIRMA düğmesidir.' : 'Sağ kenarın üst kısmındaki güç düğmesiyle başlayın.',
                 'vol-up': p === 'ios' ? 'Sağdaki yan düğmeyle başlayın.' : 'Android\'de güç düğmesiyle birlikte ses AZALTMA düğmesidir.',
                 side: 'Şimdi soldaki ses artırma düğmesi.', power: 'Şimdi ses azaltma düğmesi.'},
         hint: p === 'ios' ? 'Yan düğme sağ kenardadır. Ses artırma solda.' : 'Güç düğmesi, sağ kenardaki üstteki düğmedir.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Klik! Alt köşede küçük bir resim belirir. Ekran görüntünüzü görmek için <strong>ona dokunun</strong>. <em>Bırakırsanız birkaç saniye sonra kendiliğinden kaydedilir.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Burada üzerine çizebilir ya da kırpabilirsiniz. Sol üstteki <strong>Bitti\'ye dokunun</strong>.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Fotoğraflar\'a Kaydet\'e dokunun.</strong>', hints: {'delete-shot': 'Bu onu çöpe atar. Fotoğraflar\'a Kaydet\'e dokunun.', 'save-files': 'Dosyalar da olur, ama Fotoğraflar\'ı bulmak daha kolaydır. Fotoğraflar\'a Kaydet\'e dokunun.'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Klik! Altında düğmeler olan küçük bir resim belirir. Zaten kaydedildi. Birine göndermek için <strong>Paylaş\'a dokunun</strong>.', hints: {'shot-edit': 'Düzenle, kırpmanızı ya da üzerine çizmenizi sağlar. Şimdilik Paylaş\'a dokunun.'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: 'Otobüs saatlerini göndermek için <strong>Sarah\'ya dokunun</strong>.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Ekran görüntülerinizi sonra nerede bulabilirsiniz?', options: [
            {t: 'Fotoğraflar uygulamasında, Ekran Görüntüleri albümünde', ok: true, why: 'Evet. Fotoğraflarınızla birlikte kaydedilir; bu yüzden her fotoğraf gibi bakabilir, paylaşabilir ya da silebilirsiniz.'},
            {t: 'Bir gün sonra kaybolurlar', why: 'Siz silene kadar kalırlar. Fotoğraflar uygulamasında, Ekran Görüntüleri albümüne bakın.'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Tebrikler!</strong> Ekran görüntüleri otobüs saatleri, biletler, hata mesajları ve saklamak ya da birine göstermek istediğiniz her şey için kullanışlıdır. İşiniz bitince Fotoğraflar\'dan silebilirsiniz.'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Haritalar\'da ara'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah size bir adres yazdı. Kopyalamak, yeniden yazmanızı önler. <strong>Mesajlar\'ı açın.</strong>'},
        {screen: () => app(p, 'Mesajlar', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Sarah\'nın mesajına dokunun.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: 'Bir menü belirene kadar <strong>adresli mesaja basılı tutun</strong> (parmağınızı bir iki saniye üzerinde tutun).', hint: 'Bir menü belirene kadar parmağınızı ikinci mesajın üzerinde basılı tutun.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Kopyala\'ya dokunun.</strong> Telefonunuz artık sözcükleri hatırlıyor, başka bir yere yapıştırmaya hazır.',
         hints: {reply: 'Yanıtla bir mesaj başlatır. Kopyala\'ya dokunun.', forward: 'İlet, mesajı başkasına gönderir. Kopyala\'ya dokunun.'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Kopyalandı! Şimdi ana ekrana gidin. Burada <strong>ekranın altındaki çubuğa dokunun</strong>.'},
        {screen: () => home(p), target: 'maps', say: 'Adresi bulabilmek için <strong>Haritalar\'ı açın</strong>.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: 'Küçük bir "Yapıştır" düğmesi belirene kadar <strong>arama kutusuna basılı tutun</strong>.', hint: 'Parmağınızı üstteki arama kutusunda tutun.',
         hints: {'search-tap': 'Kısa bir dokunuş klavyeyi açar. Bunun yerine Yapıştır belirene kadar basılı tutun.'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Yapıştır\'a dokunun.</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'Adresin tamamı yazmadan belirir. <strong>Sonuca dokunun.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Uzun bir mesajın ortasından yalnızca bir telefon numarasını kopyalamak istiyorsunuz. Nasıl?', options: [
            {t: 'Basılı tutar, sonra Seç\'e dokunur (ya da küçük tutamaçları sürükler) yalnızca istediğim kısmı seçer, sonra Kopyala\'ya dokunurum', ok: true,
             why: 'Evet. Vurgulanan sözcüklerin iki yanındaki tutamaçları sürükleyerek tam istediğinizi seçin.'},
            {t: 'Yalnızca mesajın tamamını kopyalayabilirsiniz', why: 'Bir kısmını seçebilirsiniz: basılı tutun, Seç\'e dokunun ve küçük tutamaçları sürükleyin.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Tebrikler!</strong> Kopyala ve yapıştır neredeyse her yerde çalışır: mesajlar, e-postalar, web sayfaları ve formlar. Kopyalamak için basılı tutun; yapıştırmak için basılı tutun.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Depolama'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'iPhone Depolama Alanı', [{caption: 'ÖNERİLER'},
                ctx.offloaded ? {label: 'Kullanılmayan Uygulamaları Boşalt', value: 'Etkin ⟦check⟧'} : {id: 'offload', label: 'Kullanılmayan Uygulamaları Boşalt', sub: '2,1 GB tasarruf edin. Kullanmadığınız uygulamaları kaldırır ama verilerini tutar.', value: 'Etkinleştir'},
                {caption: 'UYGULAMALAR'}, {label: 'Fotoğraflar', value: '21,3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 GB' : '14,8 GB'}, {label: 'Facebook', value: '2,4 GB'}, {label: 'BBC iPlayer', value: '1,9 GB'}],
            {back: 'Genel', top: bar});
        }
        return list(p, 'Depolama', [{label: 'Fotoğraflar ve videolar', value: '21,3 GB'}, {label: 'Uygulamalar', value: ctx.cleaned ? '18,4 GB' : '25,2 GB', sub: 'WhatsApp dahil'}, {label: 'Belgeler ve diğer', value: '4,1 GB'},
            {label: 'Sistem', value: '7,6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 1,1 GB gereksiz dosya temizlendi</p>' : '<button type="button" class="ce dk" data-tap="free-up">Yer aç</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Ayarlar', `<div class="fo">${[['account', 'Hesap'], ['privacy', 'Gizlilik'], ['chats', 'Sohbetler'], ['notifications', 'Bildirimler'], ['storage', 'Depolama ve veri'], ['help', 'Yardım']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Depolama ve veri', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 GB' : '14,8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Depolamayı yönet', `<div class="iq"><span>WhatsApp ${ctx.cleaned ? '7.6' : '14.8'} GB kullanıyor</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>5 MB\'tan büyük</strong><small>İncelenecek bir şey yok</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Çok kez iletildi</strong><small>112 öğe · 0,9 GB</small></div>
                <div class="he">SOHBETLER</div><div class="ck"><strong>Aile</strong><small>3,1 GB</small></div><div class="ck"><strong>Bridlington Yürüyüş Grubu</strong><small>1,8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, '5 MB\'tan büyük', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, '23 öğe silinsin mi?', 'WhatsApp\'tan silinecekler. Telefonunuzun galerisine zaten kaydedilmiş fotoğraflar orada kalır.', [['cancel', 'İptal'], ['confirm-delete', 'Sil']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '"Depolama neredeyse dolu" mu uyarısı alıyorsunuz? Yeri neyin doldurduğunu bulalım. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Genel\'e dokunun.</strong>'},
            {screen: () => list(p, 'Genel', [{id: 'about', label: 'Hakkında'}, {id: 'update', label: 'Yazılım Güncelleme'}, {id: 'storage', label: 'iPhone Depolama Alanı'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN ve Aygıt Yönetimi'}], {back: 'Ayarlar'}),
             target: 'storage', say: '<strong>iPhone Depolama Alanı\'na dokunun.</strong> Her şeyi hesaplaması birkaç saniye sürer.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Renkli çubuk, yeri neyin doldurduğunu gösterir. Önce kolay bir kazanç: <strong>Kullanılmayan Uygulamaları Boşalt</strong>, bir süredir kullanmadığınız uygulamaları kaldırır ama geri isterseniz diye verilerinizi tutar. <strong>Etkinleştir\'e dokunun.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Depolama\'ya dokunun.</strong> <em>Samsung\'da Pil ve cihaz bakımı, sonra Depolama.</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Renkli çubuk, yeri neyin doldurduğunu gösterir. <strong>Yer aç\'a dokunun.</strong>'},
            {screen: () => app(p, 'Dosyalar', `<div class="ke"><strong>Gereksiz dosyaları sil</strong><small>Uygulamalardan 1,1 GB geçici dosya</small><button type="button" class="ce dk" data-tap="clean">Temizle</button></div>
                <div class="ke"><strong>Eski ekran görüntülerini sil</strong><small>214 MB</small><span class="fd">Seçin ve yer açın</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Gereksiz dosyaları silmek güvenlidir: uygulamaların ihtiyaç duymadığı geçici dosyalardır. <strong>Temizle\'ye dokunun.</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp 14,8 GB kullanıyor. Onu ne dolduruyor?', options: [
            {t: 'İnsanların size gönderdiği videolar ve fotoğraflar, özellikle gruplarda', ok: true, why: 'Evet. Bir aile ya da grup sohbetinde gönderilen her video telefonunuza kaydedilir. WhatsApp büyük olanları bulup silebilir.'},
            {t: 'Yazılı mesajlarınız', why: 'Yazı neredeyse hiç yer kaplamaz. Asıl yeri insanların gönderdiği videolar ve fotoğraflar, özellikle gruplarda kaplar.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>WhatsApp\'ı açın.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'WhatsApp\'ta sağ alttaki <strong>Ayarlar\'a</strong> dokunun. Burada açık. <strong>Depolama ve veri\'ye dokunun.</strong>'
                          : 'WhatsApp\'ta üstteki <strong>üç noktaya ⋮</strong>, sonra <strong>Ayarlar\'a</strong> dokunun. Burada açık. <strong>Depolama ve veri\'ye dokunun.</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Depolamayı yönet\'e dokunun.</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'En çok yer kazandıranlar en üstte. <strong>5 MB\'tan büyük\'e dokunun.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Bunlar size gönderilen büyük videolar. Birini saklamak istiyorsanız önce fotoğraflarınıza kaydedin. <strong>Tümünü seç\'e dokunun.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Sil\'e dokunun.</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Bu yalnızca WhatsApp\'ın içindeki kopyaları siler. Onaylamak için <strong>Sil\'e dokunun</strong>.', hints: {cancel: 'İptal onları saklar. Bu alıştırma için Sil\'e dokunun.'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Tebrikler!</strong> 7 GB\'tan fazla yer açtınız. Birkaç ayda bir yapmaya değer. Ayrıca Fotoğraflar\'daki <strong>Yakın Zamanda Silinenler</strong>\'i de boşaltın; çünkü silinen fotoğraflar 30 gün boyunca yer kaplamaya devam eder.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Dünya Saati'], ['alarms', 'Alarmlar'], ['stopwatch', 'Kronometre'], ['timers', 'Zamanlayıcılar']]
            : [['alarms', 'Alarm'], ['world', 'Saat'], ['timers', 'Zamanlayıcı'], ['stopwatch', 'Kronometre']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Bugün</small><strong>Londra</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Avustralya</small><strong>Sidney</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Haplar')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Alarm</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Dünya Saati' : 'Saat') : (p === 'ios' ? 'Alarmlar' : 'Alarm')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Asla'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Alarm', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Bir alarm, haplarınızı her gün almanızı hatırlatabilir. <strong>Saat uygulamasını açın.</strong>', hint: 'Beyaz saat yüzlü siyah simgedir.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `Şuraya bakın: ${p === 'ios' ? 'bottom' : 'bottom left'}. <strong>${p === 'ios' ? 'Alarmlar' : 'Alarm'}</strong> öğesine dokunun.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: 'Yeni bir alarm eklemek için <strong>+\'ya dokunun</strong>.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'Gerçek bir telefonda saati ayarlamak için rakamları kaydırırsınız. Burada <strong>08:00\'a dokunun</strong>.', hints: {'t-07': 'Bu alıştırma için 08:00\'ı seçin.', 't-09': 'Bu alıştırma için 08:00\'ı seçin.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Buna her gün ihtiyacınız var, yalnızca bir kez değil. <strong>Tekrarla\'ya dokunun.</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Her gün'; }, say: '<strong>Her gün\'e dokunun.</strong>',
         hints: {never: 'Asla, yalnızca bir kez çalacağı anlamına gelir. Her gün\'e dokunun.', weekdays: 'Hafta içi, hafta sonunu atlar. Her gün\'e dokunun.'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Önce Etiket kutusuna Haplar gibi bir etiket yazın.',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Etiket, alarmın ne için olduğunu söyler. <strong>Etiket kutusuna dokunun ve Haplar yazın</strong>, sonra <strong>Kaydet\'e dokunun</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Alarm saat 8\'de çalar. Haplarınızı alırsınız. Hangi düğmeye basarsınız?', options: [
            {t: 'Durdur', ok: true, why: 'Evet. Her gün tekrarladığı için Durdur, onu yarın saat 8\'e kadar kapatır.'},
            {t: 'Ertele', why: 'Ertele, yaklaşık 9 dakika sonra tekrar çalmasını sağlar. Biraz daha zamana ihtiyacınız varsa kullanın, ama Durdur onu yarına kadar kapatır.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Tebrikler!</strong> Haplar alarmınız her sabah saat 8\'de çalıyor. ' + (p === 'ios' ? '<strong>Sağlık</strong> uygulamasında ayrıca sizi hatırlatan ve kayıt tutan bir İlaçlar bölümü vardır.' : 'Google\'a da sorabilirsiniz: "Her gün saat 8\'de haplarımı almamı hatırlat".')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Telefonunuz kaybolsa ya da bozulsa fotoğraflarınız güvende olur muydu? Hadi kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: 'Üstteki <strong>adınıza dokunun</strong>.'},
        {screen: () => list(p, 'Apple Hesabı', [{id: 'personal', label: 'Kişisel Bilgiler'}, {id: 'security', label: 'Giriş ve Güvenlik'}, {id: 'payment', label: 'Ödeme ve Teslimat'}, {id: 'subscriptions', label: 'Abonelikler'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 GB'}, {id: 'family', label: 'Aile Paylaşımı'}, {id: 'findmy', label: 'Bul'}], {back: 'Ayarlar'}),
         target: 'icloud', say: '<strong>iCloud\'a dokunun.</strong> iCloud, Apple\'ın çevrimiçi depolama hizmetidir.'},
        {screen: c => list(p, 'iCloud', [{caption: 'DEPOLAMA: 5 GB\'TAN 4,2 GB KULLANILDI'}, {caption: 'ICLOUD\'A KAYDEDİLENLER'}, {id: 'photos', label: 'Fotoğraflar', value: c.photoSync ? 'Açık' : 'Kapalı'}, {id: 'backup', label: 'iCloud Yedekleme', value: c.backedUp ? 'Açık' : 'Kapalı'},
            {label: 'Kişiler', value: 'Açık'}, {label: 'Notlar', value: 'Açık'}], {back: 'Apple Hesabı'}),
         target: 'photos', say: 'Fotoğraflar ve Yedekleme ikisi de <strong>Kapalı</strong>. Bu, telefonun kaybolmasının fotoğrafların kaybolması demek olduğu anlamına gelir. <strong>Fotoğraflar\'a dokunun.</strong>'},
        {screen: c => list(p, 'Fotoğraflar', [{id: 'sync', label: 'Bu iPhone\'u Senkronize Et', toggle: !!c.photoSync, sub: 'Telefonunuzu kaybederseniz güvende olsun diye fotoğraflarınızı ve videolarınızı iCloud\'da tutar.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: 'Açmak için <strong>Bu iPhone\'u Senkronize Et\'e dokunun</strong>.'},
        {screen: c => list(p, 'Fotoğraflar', [{label: 'Bu iPhone\'u Senkronize Et', toggle: true}], {back: 'iCloud'}), target: 'back', say: 'Geri dönmek için <strong>‹ iCloud\'a dokunun</strong>.'},
        {screen: c => list(p, 'iCloud', [{caption: 'DEPOLAMA: 5 GB\'TAN 4,2 GB KULLANILDI'}, {caption: 'ICLOUD\'A KAYDEDİLENLER'}, {id: 'photos', label: 'Fotoğraflar', value: 'Açık'}, {id: 'backup', label: 'iCloud Yedekleme', value: 'Kapalı'}], {back: 'Apple Hesabı'}),
         target: 'backup', say: 'Şimdi diğer her şeyi yedekleyin: ayarlar, mesajlar ve uygulamalar. <strong>iCloud Yedekleme\'ye dokunun.</strong>'},
        {screen: c => list(p, 'Yedek', [{id: 'backup-toggle', label: 'Bu iPhone\'u Yedekle', toggle: !!c.backedUp, sub: 'iPhone\'unuz şarjdayken, kilitliyken ve Wi-Fi\'deyken her gece otomatik yedekler.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: 'Açmak için <strong>Bu iPhone\'u Yedekle\'ye dokunun</strong>.'},
        {screen: () => list('ios', 'Yedek', [{label: 'Bu iPhone\'u Yedekle', toggle: true}, {id: 'backup-now', label: 'Şimdi Yedekle', sub: 'Son başarılı yedekleme: Hiç'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Artık her gece yedekleyecek. İlkini şimdi yapın: <strong>Şimdi Yedekle\'ye dokunun</strong>.'},
        {screen: c => list('ios', 'Yedek', [{label: 'Bu iPhone\'u Yedekle', toggle: true}, {label: c.busy ? 'Yedekleniyor…' : 'Şimdi Yedekle', sub: c.busy ? 'Yaklaşık 5 dakika kaldı' : 'Son başarılı yedekleme: Az önce ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'Bir mesaj şöyle diyor: "iCloud depolama alanınız dolu. Fotoğraflarınız bugün silinecek. Buradan 99p ödeyin: [link]". Ne yaparsınız?', options: [
            {t: 'Bağlantıyı yok sayar, Ayarlar > adınız > iCloud\'dan kontrol eder, sonra mesajı 7726\'ya iletirim', ok: true, why: 'Evet. Bu yaygın bir dolandırıcılıktır. Apple bağlantı içeren mesaj göndermez ve fotoğraflarınızı asla böyle silmez. Gerçek depolama durumunuzu Ayarlar\'dan kontrol edin.'},
            {t: 'Fotoğrafları kurtarmak için hızlıca öderim', why: 'Kart bilgilerinizi almaya yönelik bir dolandırıcılıktır. Gerçek depolama durumunuzu Ayarlar > adınız > iCloud\'dan kontrol edin ve mesajı 7726\'ya iletin.'}]}},
        {screen: () => list('ios', 'Yedek', [{label: 'Bu iPhone\'u Yedekle', toggle: true}, {label: 'Şimdi Yedekle', sub: 'Son başarılı yedekleme: Az önce ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Tebrikler!</strong> Fotoğraflarınız ve telefonunuz yedeklendi. Ücretsiz 5 GB fotoğraflarla hızla dolar; dolarsa daha fazla alan (iCloud+) küçük bir aylık ücrete mal olur ve bunu yalnızca Ayarlar\'dan satın alırsınız, asla bir mesajdan değil.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Telefonunuz kaybolsa ya da bozulsa fotoğraflarınız güvende olur muydu? Hadi kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google\'a dokunun.</strong> Alt kısma yakın.', hint: 'Listeyi aşağı kaydırın: Google alt kısma yakın.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Google Hesabınızı yönetin', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Yedek', sub: 'Kapalı'}, {id: 'autofill', label: 'Otomatik doldurma'}, {id: 'devices', label: 'Cihazlar ve paylaşım'}]),
         target: 'backup', say: 'Yedekleme <strong>Kapalı</strong> diyor. <strong>Yedekleme\'ye dokunun.</strong> <em>Samsung\'da Ayarlar > Hesaplar ve yedekleme.</em>'},
        {screen: c => list(p, 'Yedek', [{id: 'backup-toggle', label: 'Google One ile yedekleme', toggle: !!c.backedUp, sub: 'Uygulamaları, mesajları, arama geçmişini, kişileri ve ayarları yedekler.'},
            {id: 'photos-backup', label: 'Fotoğraflar ve videolar', sub: c.photoSync ? 'Açık · Google Fotoğraflar' : 'Kapalı · Google Fotoğraflar'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: 'Açmak için <strong>Google One ile yedekleme\'ye dokunun</strong>.'},
        {screen: c => list(p, 'Yedek', [{label: 'Google One ile yedekleme', toggle: true}, {id: 'photos-backup', label: 'Fotoğraflar ve videolar', sub: 'Kapalı · Google Fotoğraflar'}]),
         target: 'photos-backup', say: 'Fotoğraflar ayrıdır. <strong>Fotoğraflar ve videolar\'a dokunun.</strong>'},
        {screen: c => list(p, 'Yedek', [{id: 'photos-toggle', label: 'Fotoğrafları ve videoları yedekle', toggle: !!c.photoSync, sub: 'Telefonunuzu kaybederseniz güvende olsun diye bunları Google Fotoğraflar\'a kaydeder.'},
            {label: 'Yedekleme kalitesi', value: 'Depolama tasarrufu'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: 'Açmak için <strong>Fotoğrafları ve videoları yedekle\'ye dokunun</strong>.'},
        {screen: () => list(p, 'Yedek', [{label: 'Fotoğrafları ve videoları yedekle', toggle: true}, {id: 'backup-now', label: 'Şimdi yedekle', sub: 'Son yedekleme: Hiç'}]),
         target: 'backup-now', say: 'Bundan sonra Wi-Fi\'deyken kendiliğinden yedekler. İlkini şimdi yapın: <strong>Şimdi yedekle\'ye dokunun</strong>.'},
        {screen: c => list(p, 'Yedek', [{label: 'Fotoğrafları ve videoları yedekle', toggle: true}, {label: c.busy ? 'Yedekleniyor…' : 'Şimdi yedekle', sub: c.busy ? '1,204 items left' : 'Son yedekleme: Az önce ⟦check⟧'}]), wait: 1500,
         question: {q: 'Bir mesaj şöyle diyor: "Google depolama alanınız dolu. Fotoğraflarınız bugün silinecek. Buradan 99p ödeyin: [link]". Ne yaparsınız?', options: [
            {t: 'Bağlantıyı yok sayar, Ayarlar > Google > Yedekleme\'den kontrol eder, sonra mesajı 7726\'ya iletirim', ok: true, why: 'Evet. Bu yaygın bir dolandırıcılıktır. Google böyle bağlantılar içeren mesajlar göndermez. Gerçek depolama durumunuzu Ayarlar\'dan kontrol edin.'},
            {t: 'Fotoğrafları kurtarmak için hızlıca öderim', why: 'Kart bilgilerinizi almaya yönelik bir dolandırıcılıktır. Gerçek depolama durumunuzu Ayarlar\'dan kontrol edin ve mesajı 7726\'ya iletin.'}]}},
        {screen: () => list(p, 'Yedek', [{label: 'Fotoğrafları ve videoları yedekle', toggle: true}, {label: 'Şimdi yedekle', sub: 'Son yedekleme: Az önce ⟦check⟧'}]), done: true,
         say: '<strong>Tebrikler!</strong> Fotoğraflarınız ve telefonunuz yedeklendi. Google size 15 GB ücretsiz verir; dolarsa daha fazla alan küçük bir aylık ücrete mal olur ve bunu yalnızca Ayarlar\'dan ya da Google One uygulamasından satın alırsınız, asla bir mesajdan değil.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 TEBRİKLER! 🎉</strong><p>£500 değerinde bir alışveriş çeki kazanmak için seçildiniz!</p>
        <button type="button" class="aeb" data-tap="claim">ŞİMDİ AL</button><small>Reklam</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Uygulama bilgisi', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>Sistem Hizmeti</strong><small>Sürüm 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Aç</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Kaldır</button>
            <button type="button" data-tap="force-stop">Durmaya zorla</button></div>
            <div class="cj ex"><span class="hf"><strong>Pil</strong><small>Son tam şarjdan beri %38 kullanım</small></span></div>
            <div class="cj ex"><span class="hf"><strong>İzinler</strong><small>Diğer uygulamaların üzerinde görüntüleme, Cihaz yöneticisi</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'Sistem Hizmeti', 'Bu uygulamayı kaldırmak istiyor musunuz?', [['cancel', 'İptal'], ['confirm-uninstall', 'Tamam']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>TAKVİM · şimdi</strong>
            <span>⚠️ iPhone'unuza virüs bulaşmış olabilir! Hemen temizlemek için buraya dokunun.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'Ana ekranınızda, hiçbir uygulama açık olmadığı hâlde reklamlar beliriyor. Bu genellikle kötü bir uygulamanın sinsice yüklendiği anlamına gelir. Önce <strong>reklama dokunmayın. Kapatmak için küçük ⟦x⟧ simgesine dokunun.</strong>',
         hints: {claim: 'Reklamın kendisine asla dokunmayın. Köşedeki küçük ⟦x⟧ simgesini arayın.'}, hint: '⟦x⟧ simgesi küçüktür ve reklamın sağ üst köşesindedir.'},
        {screen: () => home(p), target: 'settings', say: 'Kötü uygulamalar sürekli çalışır, bu yüzden çok pil harcarlar. Onları böyle bulursunuz. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Pil\'e dokunun.</strong> <em>Samsung\'da Pil ve cihaz bakımı, sonra Pil.</em>'},
        {screen: () => list(p, 'Pil', [{id: 'usage', label: 'Pil kullanımı', sub: 'Son tam şarjdan beri kullanımı görüntüle'}, {label: 'Pil Tasarrufu', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Pil kullanımı\'na dokunun.</strong> <em>Bazı Samsung\'larda grafiğe ya da Ayrıntıları görüntüle\'ye dokunun.</em>'},
        {screen: () => list(p, 'Pil kullanımı', [], {top: `<div class="nl">${[['Sistem Hizmeti', 38], ['Ekran', 21], ['WhatsApp', 12], ['YouTube', 8], ['Kamera', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Bunlardan hangisi yersiz görünüyor?', options: [
            {t: 'Sistem Hizmeti: hiç kullanmadınız ve en çok pili o harcıyor', ok: true, why: 'Evet. Kötü uygulamalar fark etmeyesiniz diye kendilerine "Sistem Hizmeti" ya da "Klavye Ayarları" gibi sıkıcı adlar verir. Adını not edin.'},
            {t: 'Ekran', why: 'Ekran her zaman çok pil harcar; bu normal. Garip olan, hiç kullanmadığınız "Sistem Hizmeti".'},
            {t: 'WhatsApp', why: 'WhatsApp kullandığınız bir uygulama, yani normal. Garip olan "Sistem Hizmeti".'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Şimdi onu uygulamalarınızda bulalım. Ayarlar\'a dönünce <strong>Uygulamalar\'a dokunun</strong>.'},
        {screen: () => list(p, 'Uygulamalar', [{caption: 'Son açılan uygulamalar'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: '46 uygulamanın tümünü göster'}, {id: 'default-apps', label: 'Varsayılan uygulamalar'}]),
         target: 'all-apps', say: '<strong>Tüm uygulamaları göster\'e dokunun.</strong>'},
        {screen: () => list(p, 'Tüm uygulamalar', ['Hesap Makinesi', 'Takvim', 'Kamera', 'Chrome', 'Saat', 'Kişiler', 'Gmail', 'Haritalar'].map(n => ({label: n})).concat([{id: 'system-service', label: 'Sistem Hizmeti'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Liste A\'dan Z\'ye sıralıdır. <strong>Sistem Hizmeti\'ne dokunun.</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: '<strong>Kaldır</strong> düğmesi gri. Kötü uygulamalar sizi kaldırmaktan caydırmak için bunu yapar. Önce çalışmasını durdurmak için <strong>Durmaya zorla\'ya dokunun</strong>.',
         hints: {uninstall: 'Gri olduğu için henüz çalışmaz. Önce Durmaya zorla\'ya dokunun.', open: 'Açmayın. Durmaya zorla\'ya dokunun.'}},
        {screen: () => list(p, 'Ayarlarda ara', [{caption: '"cihaz yöneticisi" için sonuçlar'}, {id: 'device-admin', label: 'Cihaz yöneticisi uygulamaları', sub: 'Güvenlik ve gizlilik > Diğer güvenlik ayarları'}]),
         target: 'device-admin',
         say: 'Şimdi özel iznini kaldırın. Ayarlar\'da üstteki arama çubuğunu kullanarak <strong>"cihaz yöneticisi" arayın</strong>. İşte sonuç: <strong>Cihaz yöneticisi uygulamaları\'na dokunun</strong>.'},
        {screen: c => list(p, 'Cihaz yöneticisi uygulamaları', [{label: 'Cihazımı Bul', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'Sistem Hizmeti', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Bu cihaz yöneticisi uygulaması devre dışı bırakılsın mı?', 'Sistem Hizmeti artık kaldırılmanızı engelleyemeyecek.', [['cancel', 'İptal'], ['deactivate', 'Devre dışı bırak']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Cihazımı Bul, Google\'a aittir ve sorun değildir. <strong>Sistem Hizmeti\'nin yanındaki anahtara dokunun.</strong>', hints: {'find-my': 'Cihazımı Bul açık kalsın. Sistem Hizmeti\'ne dokunun.'}},
        {screen: c => list(p, 'Cihaz yöneticisi uygulamaları', [{label: 'Cihazımı Bul', toggle: true, sub: 'Google'}, {label: 'Sistem Hizmeti', toggle: true}],
            {overlay: dialog(p, 'Bu cihaz yöneticisi uygulaması devre dışı bırakılsın mı?', 'Sistem Hizmeti artık kaldırılmanızı engelleyemeyecek.', [['cancel', 'İptal'], ['deactivate', 'Devre dışı bırak']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Devre dışı bırak\'a dokunun.</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Sistem Hizmeti\'ne dönünce <strong>Kaldır</strong> artık çalışıyor. <strong>Kaldır\'a dokunun.</strong>', hints: {'force-stop': 'Zaten durdu. Kaldır\'a dokunun.'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Tamam\'a dokunun.</strong>'},
        {screen: () => home(p), target: 'store', say: 'Gitti! Son olarak Google\'a başka bir şey olup olmadığını kontrol ettirin. <strong>Play Store\'u açın.</strong>'},
        {screen: c => app(p, 'Play Protect', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Zararlı uygulama bulunamadı' : 'Telefonunuzu tarayın'}</strong>
            <small>${c.scanned ? 'Az önce kontrol edildi' : 'Son tarama: 3 hafta önce'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'Play Store\'da sağ üstteki <strong>profil resminize</strong>, sonra <strong>Play Protect\'e</strong> dokunun. Burada açık. <strong>Tara\'ya dokunun.</strong>'},
        {screen: () => app(p, 'Play Protect', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Zararlı uygulama bulunamadı</strong><small>Az önce kontrol edildi</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Tebrikler!</strong> Kötü uygulamayı pil kullanımından buldunuz, özel iznini kaldırdınız, uygulamayı kaldırdınız ve telefonunuzu taradınız. Bunlardan kaçınmak için: uygulamaları yalnızca Play Store\'dan yükleyin ve ücretsiz fener, "temizleyici" ve "hızlandırıcı" uygulamalarına karşı dikkatli olun.'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Takviminizden gelen bir bildirim şöyle diyor: "iPhone\'unuza virüs bulaşmış olabilir! Hemen temizlemek için buraya dokunun." Bu nedir?', options: [
            {t: 'Takviminize sinsice girmiş spam. Dokunmayın', ok: true, why: 'Evet. Şüpheli bir web sitesinde "İzin Ver"e dokunmak iPhone\'unuza spam bir takvim ekleyebilir. "Etkinlikleri" uyarı gibi görünen reklamlardır. iPhone\'unuz sağlam.'},
            {t: 'Apple\'dan gerçek bir uyarı', why: 'Apple virüs uyarılarını Takviminiz üzerinden göndermez. Bu, abone olunan bir takvimden gelen spamdir. Dokunmayın.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Spam takvimi kaldıralım. Bildirime değil, <strong>Ayarlar\'a dokunun</strong>.', hints: {notif: 'Uyarıya dokunmayın. Ayarlar\'a dokunun.'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Aşağı kaydırın ve <strong>Uygulamalar\'a dokunun</strong>.', hint: 'Uygulamalar son gruptadır.'},
        {screen: () => list(p, 'Uygulamalar', ['App Store', 'Kitaplar'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Takvim'}, {label: 'Kamera'}, {label: 'Kişiler'}, {label: 'Mail'}]), {back: 'Ayarlar'}),
         target: 'calendar', say: '<strong>Takvim\'e dokunun.</strong>'},
        {screen: () => list(p, 'Takvim', [{id: 'accounts', label: 'Takvim Hesapları', value: '2'}, {label: 'Saat Dilimi Geçersiz Kılma', value: 'Kapalı'}, {label: 'Varsayılan Uyarı Zamanları'}], {back: 'Uygulamalar'}),
         target: 'accounts', say: '<strong>Takvim Hesapları\'na dokunun.</strong>'},
        {screen: () => list(p, 'Takvim Hesapları', [{caption: 'HESAPLAR'}, {label: 'iCloud', sub: 'Takvimler, Kişiler ve 7 tane daha'}, {id: 'subscribed', label: 'Abone Olunan Takvimler', value: '1'}], {back: 'Takvim'}),
         target: 'subscribed', say: 'iCloud sizin kendi hesabınız. <strong>Abone Olunan Takvimler\'e dokunun.</strong>'},
        {screen: () => list(p, 'Abone Olunan Takvimler', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Abone olundu'}], {back: 'Takvim Hesapları'}),
         target: 'spam-cal', say: 'İşte, eklemeyi hiç düşünmediğiniz bir takvim. <strong>Phone-Security-Alerts\'e dokunun.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Sunucu', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Hesabı Sil', danger: true}],
            {back: 'Geri', overlay: c.askDelete ? dialog(p, 'Emin misiniz?', 'Bu işlem, takvimi ve etkinliklerini iPhone\'unuzdan siler.', [['cancel', 'İptal'], ['confirm-delete', 'Hesabı Sil']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Hesabı Sil\'e dokunun.</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Sunucu', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Hesabı Sil', danger: true}],
            {back: 'Geri', overlay: dialog(p, 'Emin misiniz?', 'Bu işlem, takvimi ve etkinliklerini iPhone\'unuzdan siler.', [['cancel', 'İptal'], ['confirm-delete', 'Hesabı Sil']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: 'Onaylamak için <strong>Hesabı Sil\'e dokunun</strong>.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Gitti. Bir kontrol daha: şüpheli web siteleri bir "profil" de yükleyebilir. <strong>Genel\'e dokunun.</strong>'},
        {screen: () => list(p, 'Genel', [{id: 'about', label: 'Hakkında'}, {id: 'update', label: 'Yazılım Güncelleme'}, {id: 'storage', label: 'iPhone Depolama Alanı'}, {id: 'vpn', label: 'VPN ve Aygıt Yönetimi'}], {back: 'Ayarlar'}),
         target: 'vpn', say: '<strong>VPN ve Aygıt Yönetimi\'ne dokunun.</strong>'},
        {screen: c => list(p, 'VPN ve Aygıt Yönetimi', c.profileGone ? [{label: 'VPN', value: 'Bağlı Değil'}] : [{label: 'VPN', value: 'Bağlı Değil'}, {caption: 'YAPILANDIRMA PROFİLİ'}, {id: 'profile', label: 'Ücretsiz Telefon Hızlandırıcı', sub: 'Doğrulanmamış'}], {back: 'Genel'}),
         target: 'profile', say: 'Burada tanımadığınız bir profil görürseniz (işinizden ya da okulunuzdan gelen sorun değil), kaldırın. <strong>Ücretsiz Telefon Hızlandırıcı\'ya dokunun.</strong>'},
        {screen: c => list(p, 'Profil', [{label: 'Ücretsiz Telefon Hızlandırıcı', sub: 'Doğrulanmamış · İçerik: Web Klipleri, Sertifikalar'}, {caption: ' '}, {id: 'remove-profile', label: 'Profili Kaldır', danger: true}],
            {back: 'Geri', overlay: c.askRemove ? dialog(p, 'Profili Kaldır', 'Bu profili kaldırmak tüm ayarlarını siler.', [['cancel', 'İptal'], ['confirm-remove', 'Kaldır']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Profili Kaldır\'a dokunun</strong>. iPhone\'unuz parolanızı soracak.'},
        {screen: c => list(p, 'Profil', [{label: 'Ücretsiz Telefon Hızlandırıcı', sub: 'Doğrulanmamış'}, {caption: ' '}, {label: 'Profili Kaldır', danger: true}],
            {back: 'Geri', overlay: dialog(p, 'Profili Kaldır', 'Bu profili kaldırmak tüm ayarlarını siler.', [['cancel', 'İptal'], ['confirm-remove', 'Kaldır']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Kaldır\'a dokunun.</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Tebrikler!</strong> Sahte uyarılar gitti. Bir daha olmaması için: web sitelerinde, takvim ya da profil eklemeyi isteyen her açılır pencerede <strong>İzin Verme</strong> ya da <strong>Kapat</strong>\'a dokunun ve uygulamaları yalnızca App Store\'dan yükleyin.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'İptal edildi · 22 Ekim\'de bitiyor'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: 'Haftalık £4,99 · 22 Ekim\'de yenilenir'};
        return list(p, 'Abonelikler', [{caption: p === 'ios' ? 'AKTİF' : 'Aktif'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? 'Aylık £0,99' : 'Aylık £1,59'},
            {caption: p === 'ios' ? 'PASİF' : 'Süresi doldu'}, {label: 'Günlük Bulmaca', sub: '3 Mart\'ta süresi doldu'}], {back: p === 'ios' ? 'Apple Hesabı' : 'Geri'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'ABONELİĞİNİZ' : 'Plan'}, {label: 'Haftalık', sub: 'Haftalık £4,99. 3 günlük ücretsiz denemeyle başladı.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Aboneliği İptal Et' : 'Aboneliği iptal et', danger: true}],
            {back: 'Abonelikler', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'İptali Onayla' : 'Abonelik iptal edilsin mi?', '22 Ekim\'e kadar kullanmaya devam edebilirsiniz. Tekrar ücret alınmaz.', [['keep', p === 'ios' ? 'Şimdi Değil' : 'Sakla']].concat([['confirm-cancel', p === 'ios' ? 'Onayla' : 'Aboneliği iptal et']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Ücretsiz denemeler çoğu zaman siz fark etmeden ücretli plana dönüşür. Hadi kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: 'Üstteki <strong>adınıza dokunun</strong>.'},
            {screen: () => list(p, 'Apple Hesabı', [{id: 'personal', label: 'Kişisel Bilgiler'}, {id: 'security', label: 'Giriş ve Güvenlik'}, {id: 'payment', label: 'Ödeme ve Teslimat'}, {id: 'subscriptions', label: 'Abonelikler'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Ayarlar'}),
             target: 'subscriptions', say: '<strong>Abonelikler\'e dokunun.</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Ücretsiz denemeler çoğu zaman siz fark etmeden ücretli plana dönüşür. Hadi kontrol edelim. <strong>Play Store\'u açın.</strong>'},
            {screen: c => app(p, 'Play Store', `<div class="hp"><span>SİZİN İÇİN ÖNERİLEN</span><strong>Başlamanız için uygulamalar</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: 'Sağ üstteki yuvarlak harf olan <strong>profil resminize dokunun</strong>.'},
            {screen: c => app(p, 'Play Store', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Ödemeler ve abonelikler\'e dokunun.</strong>'},
            {screen: () => list(p, 'Ödemeler ve abonelikler', [{id: 'methods', label: 'Ödeme yöntemleri'}, {id: 'subscriptions', label: 'Abonelikler', sub: 'Aboneliklerinizi yönetin'}, {id: 'budget', label: 'Bütçe ve geçmiş'}]),
             target: 'subscriptions', say: '<strong>Abonelikler\'e dokunun.</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '"Photo Editor Pro" ücretsiz denemeyle başladı ve şimdi <strong>her hafta £4,99</strong>. Bu yılda £250\'den fazla! <strong>Ona dokunun.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Aboneliği İptal Et' : 'Aboneliği iptal et'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Onayla' : 'Aboneliği iptal et'}.</strong>`, hints: {keep: 'Bu ödemeye devam ediyor. Dokunun: ' + (p === 'ios' ? 'Onayla' : 'Aboneliği iptal et') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Photo Editor uygulamasını telefonunuzdan siliyorsunuz. Bu ödemeleri durdurur mu?', options: [
            {t: 'Hayır. Az önce yaptığınız gibi aboneliği iptal etmeniz gerekir', ok: true, why: 'Aynen öyle. Uygulamayı silmek aboneliği İPTAL ETMEZ. Burada iptal edene kadar ödemeye devam edersiniz.'},
            {t: 'Evet, uygulamayı silmek durdurur', why: 'Durdurmaz! Aboneliğin kendisini burada iptal edene kadar ödemeye devam edersiniz.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Tebrikler!</strong> Haftada £4,99 tasarruf ettiniz. İpucu: ücretsiz deneme başlattığınızda, bitiminden önceki gün için bir alarm kurun. Ayrıca ara sıra bankacılık uygulamanızdaki düzenli ödemeler listesine bakın.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Yeni iPhone\'larda yapay zekâ olan <strong>Apple Intelligence</strong> vardır: sizin için yazar, özetler ve düzenler. Kapatabilirsiniz. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Apple Intelligence ve Siri\'ye dokunun.</strong>', hint: 'Üçüncü grupta, Erişilebilirlik\'in altında.'},
        {screen: c => list(p, 'Apple Intelligence ve Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Yazma Araçları, bildirim özetleri, Image Playground ve daha fazlası.'},
            {caption: 'UZANTILAR'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Kapalı' : 'Açık'}, {caption: 'SIRI'}, {label: 'Siri ile Konuş', value: '"Siri" ya da "Hey Siri"'}],
            {back: 'Ayarlar', overlay: c.askOff ? dialog(p, 'Apple Intelligence Kapatılsın mı?', 'Yazma Araçları ve özetler gibi özellikler artık kullanılamayacak.', [['cancel', 'İptal'], ['confirm-off', 'Kapat']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: 'Kapatmak için <strong>Apple Intelligence anahtarına dokunun</strong>.', hints: {chatgpt: 'ChatGPT\'yi sonra yapacağız. Önce Apple Intelligence anahtarına dokunun.'}},
        {screen: c => list(p, 'Apple Intelligence ve Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'UZANTILAR'}, {label: 'ChatGPT', value: 'Açık'}],
            {back: 'Ayarlar', overlay: dialog(p, 'Apple Intelligence Kapatılsın mı?', 'Yazma Araçları ve özetler gibi özellikler artık kullanılamayacak.', [['cancel', 'İptal'], ['confirm-off', 'Kapat']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Kapat\'a dokunun.</strong>'},
        {screen: c => list(p, 'Apple Intelligence ve Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'UZANTILAR'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Açık'}], {back: 'Ayarlar'}),
         target: 'chatgpt', say: 'ChatGPT uzantısı sorularınızı Apple dışındaki bir şirket olan ChatGPT\'ye gönderebilir. <strong>ChatGPT\'ye dokunun.</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'ChatGPT\'yi Kullan', toggle: !c.gptOff, sub: 'Siri, istekleri ChatGPT\'ye gönderebilir.'}], {back: 'Geri'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: 'Kapatmak için <strong>ChatGPT\'yi Kullan\'a dokunun</strong>.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'ChatGPT\'yi Kullan', toggle: false}], {back: 'Geri'}),
         question: {q: 'WhatsApp, Facebook ve diğer uygulamalarda da yapay zekâ sohbetleri var. Güvenli kural nedir?', options: [
            {t: 'Hiçbir yapay zekâ sohbetine kişisel bilgi (banka, sağlık, şifre, adres) asla yazmamak', ok: true, why: 'Evet. Yazdıklarınız saklanabilir ve yapay zekâyı eğitmek için kullanılabilir. Bunu bir yabancıyla konuşmak gibi düşünün.'},
            {t: 'Yapay zekâ sohbetleri özeldir, yani her şey olur', why: 'Telefon görüşmesi gibi özel değiller. Yazdıklarınız saklanabilir. Kişisel bilgileri onların dışında tutun.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'ChatGPT\'yi Kullan', toggle: false}], {back: 'Geri'}), done: true,
         say: '<strong>Tebrikler!</strong> Apple Intelligence ve ChatGPT kapalı. Aynı yerden istediğiniz zaman yeniden açabilirsiniz. Siri her zamanki gibi çalışmaya devam eder.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Android telefonlar artık Google\'ın yapay zekâsı <strong>Gemini</strong> ile geliyor. Güç düğmesine basılı tutmak onu yanlışlıkla açabilir. Bunu değiştirelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Uygulamalar\'a dokunun.</strong>'},
        {screen: () => list(p, 'Uygulamalar', [{caption: 'Son açılan uygulamalar'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: '45 uygulamanın tümünü göster'}, {id: 'default-apps', label: 'Varsayılan uygulamalar', sub: 'Asistan, tarayıcı ve telefon uygulamaları'}]),
         target: 'default-apps', say: '<strong>Varsayılan uygulamalar\'a dokunun.</strong>'},
        {screen: () => list(p, 'Varsayılan uygulamalar', [{label: 'Tarayıcı uygulaması', sub: 'Chrome'}, {id: 'assistant', label: 'Dijital asistan uygulaması', sub: 'Gemini'}, {label: 'Telefon uygulaması', sub: 'Telefon'}, {label: 'SMS uygulaması', sub: 'Mesajlar'}]),
         target: 'assistant', say: '<strong>Dijital asistan uygulaması\'na dokunun.</strong>'},
        {screen: c => list(p, 'Dijital asistan uygulaması', [{id: 'assistant-app', label: 'Varsayılan dijital asistan uygulaması', sub: c.noAssist ? 'Yok' : 'Gemini'}, {label: 'Ekrandaki metni kullan', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Varsayılan dijital asistan uygulaması</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Yok</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Varsayılan dijital asistan uygulaması\'na dokunun.</strong>'},
        {screen: c => list(p, 'Dijital asistan uygulaması', [{label: 'Varsayılan dijital asistan uygulaması', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Varsayılan dijital asistan uygulaması</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Yok</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Yok\'a dokunun.</strong> Güç düğmesine basılı tuttuğunuzda Gemini açılmaz.', hints: {'assist-gemini': 'Bu Gemini\'yi tutar. Yok\'a dokunun.'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Sırada Gemini\'nin ona yazdıklarınızı saklamasını durdurmak var. <strong>Gemini uygulamasını açın.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Merhaba, Margaret<br><small>Bugün size nasıl yardımcı olabilirim?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: 'Sağ üstteki <strong>profil resminize dokunun</strong>.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Gemini Uygulamaları Etkinliği\'ne dokunun.</strong> <em>Bazı telefonlarda adı Etkinliği sakla.</em>'},
        {screen: c => app(p, 'Gemini Uygulamaları Etkinliği', `<p class="cf"><strong>${c.actOff ? 'Kapalı' : 'Açık'}</strong><br>${c.actOff ? 'Sohbetleriniz artık hesabınıza kaydedilmez ya da Google\'ın yapay zekâsını geliştirmek için kullanılmaz.' : 'Sohbetleriniz Google Hesabınıza kaydedilir ve Google\'ın yapay zekâsını geliştirmek için incelenebilir.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Kapat</button><button type="button" class="cj" data-tap="off-delete">Kapat ve etkinliği sil</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Kapat\'a dokunun.</strong>'},
        {screen: c => app(p, 'Gemini Uygulamaları Etkinliği', '<p class="cf"><strong>Açık</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Kapat</button><button type="button" class="cj" data-tap="off-delete">Kapat ve etkinliği sil</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: 'Zaten kaydedilenleri de silmek için <strong>Kapat ve etkinliği sil\'e dokunun</strong>.', hints: {'off-only': 'Bu yeni sohbetlerin kaydedilmesini durdurur ama eskileri tutar. Kapat ve etkinliği sil\'e dokunun.'}},
        {screen: c => app(p, 'Gemini Uygulamaları Etkinliği', '<p class="cf"><strong>Kapalı</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp, Facebook ve diğer uygulamalarda da yapay zekâ sohbetleri var. Güvenli kural nedir?', options: [
            {t: 'Hiçbir yapay zekâ sohbetine kişisel bilgi (banka, sağlık, şifre, adres) asla yazmamak', ok: true, why: 'Evet. Yazdıklarınız saklanabilir ve yapay zekâyı eğitmek için kullanılabilir. Bunu bir yabancıyla konuşmak gibi düşünün.'},
            {t: 'Yapay zekâ sohbetleri özeldir, yani her şey olur', why: 'Telefon görüşmesi gibi özel değiller. Yazdıklarınız saklanabilir. Kişisel bilgileri onların dışında tutun.'}]}},
        {screen: c => app(p, 'Gemini Uygulamaları Etkinliği', '<p class="cf"><strong>Kapalı</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Tebrikler!</strong> Gemini artık güç düğmesinden açılmıyor ve sohbetlerinizi saklamıyor. Samsung\'da ayrıca her özelliğin kendi anahtarı olan <strong>Ayarlar > Galaxy AI</strong>\'a da bakın.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Apple Hesabınız fotoğraflarınızı, kişilerinizi ve ödemelerinizi tutar. Korunduğunu kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: 'Üstteki <strong>adınıza dokunun</strong>.'},
        {screen: () => list(p, 'Apple Hesabı', [{id: 'personal', label: 'Kişisel Bilgiler'}, {id: 'security', label: 'Giriş ve Güvenlik'}, {id: 'payment', label: 'Ödeme ve Teslimat'}, {id: 'subscriptions', label: 'Abonelikler'}], {back: 'Ayarlar'}),
         target: 'security', say: '<strong>Giriş ve Güvenlik\'e dokunun.</strong>'},
        {screen: () => list(p, 'Giriş ve Güvenlik', [{label: 'E-posta ve Telefon Numaraları', sub: '+44 7700 900123'}, {label: 'Şifreyi Değiştir'}, {caption: ' '}, {label: 'İki Faktörlü Kimlik Doğrulama', value: 'Açık'},
            {id: 'recovery', label: 'Hesap Kurtarma'}], {back: 'Apple Hesabı'}),
         target: 'recovery', say: '<strong>İki Faktörlü Kimlik Doğrulama</strong> Açık diyor: iyi. Bu, yeni bir cihazın giriş yapabilmesi için telefonunuzdan bir kod gerektiği anlamına gelir. Şimdi <strong>Hesap Kurtarma\'ya dokunun</strong>.'},
        {screen: c => list(p, 'Hesap Kurtarma', [{caption: 'KURTARMA KİŞİSİ'}, c.recovery ? {label: 'Sarah', sub: 'Sarah\'nın kabul etmesi bekleniyor'} : {id: 'add-contact', label: 'Kurtarma Kişisi Ekle…', sub: 'Hesabınıza yeniden girmenize yardımcı olabilecek güvendiğiniz biri.'}],
            {back: 'Geri', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Bir kurtarma kişisi seçin</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (Kızım)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Şifrenizi unutursanız, bir <strong>kurtarma kişisi</strong> içeri girmenize yardımcı olacak bir kod alabilir. Verilerinizi göremez. <strong>Kurtarma Kişisi Ekle\'ye dokunun.</strong>'},
        {screen: c => list(p, 'Hesap Kurtarma', [{caption: 'KURTARMA KİŞİSİ'}, {label: 'Kurtarma Kişisi Ekle…'}],
            {back: 'Geri', overlay: `<div class="ei"><div class="cv"><p><strong>Bir kurtarma kişisi seçin</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (Kızım)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'iPhone\'u olan, güvendiğiniz birini seçin. <strong>Sarah\'ya dokunun.</strong>', hints: {'pick-dave': 'Bu alıştırma için Sarah\'yı seçin.'}},
        {screen: c => list(p, 'Hesap Kurtarma', [{caption: 'KURTARMA KİŞİSİ'}, {label: 'Sarah', sub: 'Sarah\'nın kabul etmesi bekleniyor'}], {back: 'Geri'}),
         question: {q: 'Biri arayıp Apple\'dan olduğunu söylüyor. Telefonunuzda az önce beliren 6 haneli kodu okumanızı istiyor. Ne yaparsınız?', options: [
            {t: 'Kapatırım. O kodu asla kimseye vermem', ok: true, why: 'Aynen öyle. O kod birinin hesabınıza girmesini sağlar. Apple asla arayıp bunu istemez.'},
            {t: 'Okurum, Apple\'dan arıyorlar', why: 'Apple asla o kodu istemez. Ona sahip olan herkes hesabınıza girebilir. Kapatın.'}]}},
        {screen: c => list(p, 'Hesap Kurtarma', [{caption: 'KURTARMA KİŞİSİ'}, {label: 'Sarah', sub: 'Sarah\'nın kabul etmesi bekleniyor'}], {back: 'Geri'}), done: true,
         say: '<strong>Tebrikler!</strong> İki faktörlü kimlik doğrulama açık ve Sarah içeri girmenize yardımcı olabilir. iPhone\'unuz ayrıca şifreleri sizin için <strong>Parolalar</strong> uygulamasında hatırlayabilir.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Google Hesabınız e-postalarınızı, fotoğraflarınızı ve kişilerinizi tutar. Ona ikinci bir kilit ekleyelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google\'a dokunun.</strong>', hint: 'Google listenin alt kısmına yakın.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Google Hesabınızı yönetin', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Yedek'}, {id: 'autofill', label: 'Otomatik doldurma'}]),
         target: 'manage', say: '<strong>Google Hesabınızı yönetin\'e dokunun.</strong>'},
        {screen: () => app(p, 'Google Hesabı', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: 'Üstteki <strong>Güvenlik\'e dokunun</strong>.'},
        {screen: c => list(p, 'Güvenlik', [{caption: 'Google\'da nasıl giriş yapıyorsunuz'}, {id: '2sv', label: '2 Adımlı Doğrulama', sub: c.twoOn ? 'Açık' : 'Kapalı'}, {label: 'Şifre', sub: 'Son değişiklik 2 yıl önce'}, {label: 'Kurtarma telefonu', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>2 Adımlı Doğrulama</strong> Kapalı. Bu, yeni bir cihazda giriş yapmak için telefonunuza gönderilen bir kodun da gerektiği anlamına gelir; böylece çalınmış bir şifre yeterli olmaz. <strong>Ona dokunun.</strong>'},
        {screen: () => list(p, '2 Adımlı Doğrulama', [], {top: '<p class="cf">Telefon numaranız: <strong>07700 900123</strong><br>Sizin olduğunu doğrulamak için bu numaraya kısa mesajla bir kod göndereceğiz.</p><button type="button" class="ce dk" data-tap="send-code">Kod gönder</button>'}),
         target: 'send-code', say: '<strong>Kod gönder\'e dokunun.</strong>'},
        {screen: c => list(p, '2 Adımlı Doğrulama', [], {top: `<div class="sd"><strong>MESAJLAR · şimdi</strong><span>G-382605, Google doğrulama kodunuzdur.</span></div>
            <p class="cf">07700 900123 numarasına kısa mesajla gönderdiğimiz kodu girin</p>${field('gcode', 'Kodu girin', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">İleri</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Mesajdaki 6 rakamı yazın: 382605.',
         say: 'Kodlu bir mesaj geliyor. <strong>Kutuya 382605 yazın</strong> ve <strong>İleri\'ye dokunun</strong>. <em>(Bir deneme kodu. Gerçek bir kodu, istediğiniz yerin dışında hiçbir yere yazmayın.)</em>'},
        {screen: () => list(p, '2 Adımlı Doğrulama', [], {top: '<p class="cf">Telefon numaranız doğrulandı ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">2 Adımlı Doğrulamayı aç</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>2 Adımlı Doğrulamayı aç\'a dokunun.</strong>'},
        {screen: c => list(p, 'Güvenlik', [{caption: 'Google\'da nasıl giriş yapıyorsunuz'}, {label: '2 Adımlı Doğrulama', sub: 'Açık ⟦check⟧'}, {label: 'Kurtarma telefonu', sub: '07700 900123'}]),
         question: {q: 'Biri arayıp Google\'dan olduğunu söylüyor. Size az önce kısa mesajla gönderilen kodu okumanızı istiyor. Ne yaparsınız?', options: [
            {t: 'Kapatırım. O kodu asla kimseye vermem', ok: true, why: 'Aynen öyle. O kod birinin hesabınıza girmesini sağlar. Google asla arayıp bunu istemez.'},
            {t: 'Okurum, Google\'dan arıyorlar', why: 'Google asla o kodu istemez. Ona sahip olan herkes hesabınıza girebilir. Kapatın.'}]}},
        {screen: c => list(p, 'Güvenlik', [{caption: 'Google\'da nasıl giriş yapıyorsunuz'}, {label: '2 Adımlı Doğrulama', sub: 'Açık ⟦check⟧'}]), done: true,
         say: '<strong>Tebrikler!</strong> Google Hesabınız artık şifrenizin yanı sıra telefonunuzu da gerektiriyor. Google şifrelerinizi de hatırlayabilir: Ayarlar\'da <strong>Google Şifre Yöneticisi</strong>\'ni arayın.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Bu sabah sahil boyunca harika bir yürüyüş! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Yürüyüş Grubu</strong><p>Sıradaki yürüyüş: Cumartesi, 10.00, limandan.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Yeni arkadaşlık isteği yok.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Profilinizi görün</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Ayarlar ve gizlilik</strong></button><div class="ck"><strong>Yardım ve destek</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Yalnızca arkadaşlarınızın paylaştıklarınızı görmesini sağlayalım. <strong>Facebook\'u açın.</strong> <em>(Bir deneme sürümü. Gerçek uygulama değil.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: 'Sağ alttaki <strong>Menü\'ye dokunun</strong>.', hints: {'tab-friends': 'Arkadaşlık isteklerine birazdan bakacağız. Önce Menü\'ye dokunun.'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Ayarlar ve gizlilik\'e dokunun</strong>.'},
        {screen: c => list(p, 'Ayarlar', [{caption: 'Kitle ve görünürlük'}, {id: 'posts', label: 'Gönderiler', sub: 'Gelecekteki gönderilerinizi kimler görebilir: ' + (c.audience || 'Herkese Açık')}, {label: 'Profil ayrıntıları'}, {label: 'İnsanlar sizi nasıl bulur ve iletişime geçer'},
            {caption: 'Etkinliğiniz'}, {label: 'Etkinlik günlüğü'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Gelecekteki gönderilerinizi kimler görebilir?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Herkese Açık<small>Facebook'ta olan ya da olmayan herkes</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Arkadaşlar<small>Facebook'taki arkadaşlarınız</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Yalnızca ben</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Gönderileriniz <strong>Herkese Açık</strong> olarak ayarlı: dünyadaki herkes görebilir. <strong>Gönderiler\'e dokunun.</strong>'},
        {screen: c => list(p, 'Ayarlar', [{caption: 'Kitle ve görünürlük'}, {label: 'Gönderiler', sub: 'Gelecekteki gönderilerinizi kimler görebilir: Herkese Açık'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Gelecekteki gönderilerinizi kimler görebilir?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Herkese Açık<small>Facebook'ta olan ya da olmayan herkes</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Arkadaşlar<small>Facebook'taki arkadaşlarınız</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Yalnızca ben</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Arkadaşlar'; }, say: '<strong>Arkadaşlar\'a dokunun.</strong>',
         hints: {'aud-public': 'Herkese Açık, eskiden olandı. Arkadaşlar\'a dokunun.', 'aud-me': 'Yalnızca ben, gönderilerinizi başka kimsenin görmediği anlamına gelir. Arkadaşlar\'a dokunun.'}},
        {screen: c => list(p, 'Ayarlar', [{caption: 'Kitle ve görünürlük'}, {label: 'Gönderiler', sub: 'Gelecekteki gönderilerinizi kimler görebilir: Arkadaşlar ⟦check⟧'}, {id: 'back-feed', label: '‹ Facebook\'a dön'}]),
         target: 'back-feed', say: 'Tamam. Şimdi <strong>Facebook\'a dön\'e dokunun</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'Bir arkadaşlık isteğiniz var. <strong>Arkadaşlar\'a dokunun.</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: '"Jean Smith"ten bir arkadaşlık isteği. Ama Jean ile zaten arkadaşsınız (akışınızda). Neler oluyor?', options: [
            {t: 'Muhtemelen bir dolandırıcının yaptığı Jean\'in profilinin kopyası', ok: true, why: 'Evet. Dolandırıcılar birinin adını ve fotoğrafını kopyalar, sonra arkadaşlarına para isteyen mesajlar atar. Gerçek Jean zaten arkadaşınız.'},
            {t: 'Jean\'in ikinci bir hesabı olmalı', why: 'Olabilir, ama bir dolandırıcının yaptığı kopya olma ihtimali çok daha yüksek: 2 gün önce katılmış. Jean\'e telefonla sorun.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: 'İsteği reddetmek için <strong>Sil\'e dokunun</strong>.', hints: {'confirm-jean': 'Kopyalanmış bir profili onaylamayın. Sil\'e dokunun.'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Tebrikler!</strong> Gönderileriniz yalnızca arkadaşlara açık ve sahte bir profilden kurtuldunuz. Jean\'e haber verin ki bildirebilsin. Ayrıca "kuryeyle" ödeme yapmak isteyen ya da telefonunuza gönderilen kodları isteyen Marketplace alıcılarına karşı dikkatli olun.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Burada ara'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Otobüs ve tren istasyonu, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Hastane, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Kilise, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Otobüs ve tren istasyonu · 25 mil</small><button type="button" class="ce co" data-tap="directions">Yol tarifi</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 dk (25 mil)</strong><small>En hızlı rota, A614 üzerinden</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ <strong>Bridlington Bus Station</strong>, 3 numaralı durağa 4 dk yürüyün</li>
                <li>⟦bus⟧ <strong>121</strong> Hull yönü · 10:15 · <b class="ahy">Zamanında</b></li><li><strong>Hull Paragon Interchange</strong> durağında inin (24 durak)</li></ol>
                <button type="button" class="ce co" data-tap="start">Başla</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: 'Haritalar, canlı saatlerle otobüs yolculuğu planlayabilir. Hull\'a otobüsle gidelim. <strong>Haritalar\'ı açın.</strong>' + (p === 'ios' ? ' <em>(Tercih ederseniz Google Haritalar da aynı şekilde çalışır.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: 'Üstteki <strong>arama kutusuna dokunun</strong>.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: '"Hull interchange" yazdık. Otobüs istasyonu olan <strong>Hull Paragon Interchange\'e dokunun</strong>.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Yol tarifi\'ne dokunun.</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Önce araçla gitmeyi gösteriyor. Toplu taşımayı görmek için <strong>otobüse dokunun</strong> ⟦bus⟧.', hints: {'mode-walk': 'Sekiz saat! Bunun yerine otobüse dokunun.', 'mode-car': 'O araçla gitmek. Otobüse dokunun.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'İşte otobüsler, sıradaki en üstte. "Zamanında" canlı bilgidir. <strong>10:15\'e dokunun.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Otobüse nereden binersiniz?', options: [
            {t: 'Bridlington Bus Station, 3 numaralı durak', ok: true, why: 'Evet. Haritalar nereye yürüyeceğinizi, hangi otobüse bineceğinizi ve nerede ineceğinizi söyler.'},
            {t: 'Hull Paragon Interchange', why: 'Orası ineceğiniz yer. Ona Bridlington Bus Station, 3 numaralı duraktan binersiniz.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Tebrikler!</strong> Gerçek bir yolculukta <strong>Başla\'ya</strong> dokunursanız Haritalar durağınızın ne zaman geldiğini söyler. Otobüs kartınız varsa her zamanki gibi şoföre gösterirsiniz. <em>(Yalnızca deneme saatleri: gerçekleri o gün kontrol edin.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Acil Durum SOS</strong>, sizin için 999\'u arar ve konumunuzu seçtiğiniz kişilere kısa mesajla gönderir. Hazır olduğunu kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Acil Durum SOS\'a dokunun.</strong>', hint: 'Üçüncü grupta, kırmızı simgeyle.'},
        {screen: c => list(p, 'Acil Durum SOS', [{label: 'Basılı Tutup Bırakarak Ara', toggle: true, sub: 'Yan düğmeyi ve bir ses düğmesini basılı tutun, sonra bırakın.'},
            {id: 'five', label: '5 Düğme Basışıyla Ara', toggle: !!c.five, sub: 'Yan düğmeye hızlıca 5 kez basın.'}, {caption: ' '},
            {id: 'contacts', label: 'Sağlık\'ta Acil Durum Kişilerini Ayarla'}, {label: 'Kaza Algılama', toggle: true, sub: 'Ciddi bir araba kazasından sonra 999\'u arar.'}], {back: 'Ayarlar'}),
         target: 'five', action: c => { c.five = true; }, say: 'Yan düğmeye 5 kez basmak panik anında hatırlaması kolaydır. <strong>5 Düğme Basışıyla Ara\'yı açın.</strong>'},
        {screen: c => list(p, 'Acil Durum SOS', [{label: 'Basılı Tutup Bırakarak Ara', toggle: true}, {label: '5 Düğme Basışıyla Ara', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Sağlık\'ta Acil Durum Kişilerini Ayarla'}], {back: 'Ayarlar', overlay: c.pick ? sheet('Acil durum kişisi ekle', [['pick-sarah', 'Sarah', 'Kızım · 07700 900333'], ['pick-dave', 'Dave', 'Arkadaş']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Şimdi konumunuzla birlikte kimin mesaj alacağını seçin. <strong>Acil Durum Kişilerini Ayarla\'ya dokunun.</strong>'},
        {screen: () => list(p, 'Acil Durum SOS', [{label: '5 Düğme Basışıyla Ara', toggle: true}], {back: 'Ayarlar', overlay: sheet('Acil durum kişisi ekle', [['pick-sarah', 'Sarah', 'Kızım · 07700 900333'], ['pick-dave', 'Dave', 'Arkadaş']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: 'Kızınız <strong>Sarah\'ya dokunun</strong>.', hints: {'pick-dave': 'Bu alıştırma için Sarah\'yı seçin.'}},
        {screen: () => list(p, 'Acil Durum SOS', [{label: '5 Düğme Basışıyla Ara', toggle: true}, {caption: 'ACİL DURUM KİŞİLERİ'}, {label: 'Sarah', sub: 'Kızım'}], {back: 'Ayarlar'}),
         question: {q: 'Düştünüz ve telefon ekranına düzgün ulaşamıyorsunuz. Ne yaparsınız?', options: [
            {t: 'Yan düğmeye hızlıca 5 kez basarım', ok: true, why: 'Evet. Bir geri sayım başlar, sonra 999\'u arar ve Sarah\'ya nerede olduğunuzu kısa mesajla bildirir.'},
            {t: 'Telefonun kilidini açıp Telefon uygulamasını bulurum', why: 'Bu acil durumda yavaştır. Yan düğmeye 5 kez basmak telefon kilitliyken bile çalışır.'}]}},
        {screen: () => list(p, 'Acil Durum SOS', [{label: '5 Düğme Basışıyla Ara', toggle: true}, {caption: 'ACİL DURUM KİŞİLERİ'}, {label: 'Sarah', sub: 'Kızım'}], {back: 'Ayarlar'}), done: true,
         say: '<strong>Tebrikler!</strong> Acil Durum SOS hazır ve Sarah\'ya nerede olduğunuz bildirilecek. Yanlışlıkla basarsanız geri sayım sırasında Durdur\'a dokunmanız yeterli.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Acil Durum SOS</strong>, sizin için 999\'u arar ve konumunuzu seçtiğiniz kişilere kısa mesajla gönderir. Hazır olduğunu kontrol edelim. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Güvenlik ve acil durum\'a dokunun.</strong> <em>Samsung\'da da adı Güvenlik ve acil durum.</em>', hint: 'Aşağı kaydırın: alt kısma yakın.'},
        {screen: () => list(p, 'Güvenlik ve acil durum', [{id: 'medical', label: 'Tıbbi bilgiler'}, {id: 'contacts-ec', label: 'Acil durum kişileri'}, {id: 'sos', label: 'Acil Durum SOS', sub: 'Kapalı'}, {label: 'Araba kazası algılama'}]),
         target: 'sos', say: 'Acil Durum SOS <strong>Kapalı</strong>. <strong>Acil Durum SOS\'a dokunun.</strong>'},
        {screen: c => list(p, 'Acil Durum SOS', [{id: 'sos-toggle', label: 'Acil Durum SOS\'u kullan', toggle: !!c.sosOn, sub: 'Acil durum eylemlerini başlatmak için güç düğmesine 5 kez veya daha fazla basın.'}, {label: 'Bilgileri acil durum kişileriyle paylaş', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: 'Açmak için <strong>Acil Durum SOS\'u kullan\'a dokunun</strong>.'},
        {screen: () => list(p, 'Güvenlik ve acil durum', [{id: 'medical', label: 'Tıbbi bilgiler'}, {id: 'contacts-ec', label: 'Acil durum kişileri', sub: 'Yok'}, {label: 'Acil Durum SOS', sub: 'Açık'}]),
         target: 'contacts-ec', say: 'Şimdi konumunuzla birlikte kimin mesaj alacağını seçin. <strong>Acil durum kişileri\'ne dokunun.</strong>'},
        {screen: c => list(p, 'Acil durum kişileri', [{id: 'add', label: '＋ Kişi ekle'}], {overlay: c.pick ? sheet('Bir kişi seçin', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Kişi ekle\'ye dokunun.</strong>'},
        {screen: () => list(p, 'Acil durum kişileri', [{label: '＋ Kişi ekle'}], {overlay: sheet('Bir kişi seçin', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: 'Kızınız <strong>Sarah\'ya dokunun</strong>.', hints: {'pick-dave': 'Bu alıştırma için Sarah\'yı seçin.'}},
        {screen: () => list(p, 'Acil durum kişileri', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Kişi ekle'}]),
         question: {q: 'Düştünüz ve telefon ekranına düzgün ulaşamıyorsunuz. Ne yaparsınız?', options: [
            {t: 'Güç düğmesine hızlıca 5 kez basarım', ok: true, why: 'Evet. Bir geri sayım başlar, sonra 999\'u arar ve nerede olduğunuzu Sarah ile paylaşır.'},
            {t: 'Telefonun kilidini açıp Telefon uygulamasını bulurum', why: 'Bu acil durumda yavaştır. Güç düğmesine 5 kez basmak telefon kilitliyken bile çalışır.'}]}},
        {screen: () => list(p, 'Acil durum kişileri', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Tebrikler!</strong> Acil Durum SOS açık ve Sarah\'ya nerede olduğunuz bildirilecek. Yanlışlıkla basarsanız geri sayım sırasında İptal\'e dokunun.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Acil Durum Uyarıları sizi yakındaki tehlikelere, örneğin şiddetli sele karşı uyarır. Biri bu telefonda birini kapatmış. Düzeltelim. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Bildirimler\'e dokunun.</strong>'},
            {screen: c => list(p, 'Bildirimler', [{label: 'Önizlemeleri Göster', value: 'Her Zaman'}, {caption: 'BİLDİRİM STİLİ'}, {label: 'Mesajlar', sub: 'Bannerlar, Sesler, Rozetler'}, {label: 'WhatsApp', sub: 'Bannerlar, Sesler, Rozetler'},
                {caption: 'HÜKÜMET UYARILARI'}, {label: 'Aşırı Uyarılar', toggle: true}, {id: 'severe', label: 'Ciddi Uyarılar', toggle: !!c.severe}, {label: 'Test Uyarıları', toggle: false}], {back: 'Ayarlar'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Hükümet Uyarıları en altta. <strong>Ciddi Uyarılar</strong> kapalı. <strong>Açmak için ona dokunun.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Güvenlik ve acil durum\'a dokunun.</strong>', hint: 'Listenin alt kısmına yakın.'},
            {screen: () => list(p, 'Güvenlik ve acil durum', [{label: 'Tıbbi bilgiler'}, {label: 'Acil Durum SOS'}, {id: 'wea', label: 'Kablosuz acil durum uyarıları'}, {label: 'Bilinmeyen izleyici uyarıları'}]),
             target: 'wea', say: '<strong>Kablosuz acil durum uyarıları\'na dokunun.</strong> <em>Bazı telefonlarda adı Acil durum uyarıları.</em>'},
            {screen: c => list(p, 'Kablosuz acil durum uyarıları', [{label: 'Uyarılara izin ver', toggle: true}, {label: 'Aşırı tehditler', toggle: true}, {id: 'severe', label: 'Ciddi tehditler', toggle: !!c.severe}, {label: 'Test uyarıları', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Ciddi tehditler</strong> kapalı. <strong>Açmak için ona dokunun.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Acil durum uyarısı: Ciddi</strong><p>Sahil şeridi yakınlarında şiddetli sel bekleniyor. Daha yüksek bir yere çıkın. Daha fazlası: gov.uk/alerts</p><button type="button" data-tap="ok">Tamam</button></div>`,
         target: 'ok', say: 'Bir uyarı böyle görünür. Sessizdeyken bile yaklaşık 10 saniye boyunca yüksek sesli bir siren çalar. <strong>Tamam\'a dokunun.</strong> <em>(Yalnızca alıştırma.)</em>'},
        {screen: () => home(p), question: {q: 'Araba sürerken bir uyarı geliyor. Ne yapmalısınız?', options: [
            {t: 'Okumadan önce güvenli bir yere çekerim', ok: true, why: 'Evet. Araba sürerken asla telefonunuza bakmayın. Güvenle durun, sonra okuyun.'},
            {t: 'Araba sürerken hemen okurum', why: 'Araba sürerken asla telefonunuza bakmayın. Önce durmak için güvenli bir yer bulun.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Telefonunuz artık sizi yakınınızdaki ciddi tehlikelere karşı uyaracak. Gerçek uyarılar asla kişisel bilgi ya da para istemez: istiyorsa dolandırıcılıktır.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Çalınan bir telefonu bir hırsız için çok daha az işe yarar yapan üç şey. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Face ID ve Parola\'ya dokunun.</strong> <em>Gerçek bir iPhone\'da sonra parolanızı girersiniz.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Aşağı kaydırın ve <strong>Çalınan Aygıt Koruması\'na dokunun</strong>.'},
            {screen: c => list(p, 'Çalınan Aygıt Koruması', [{id: 'sdp', label: 'Çalınan Aygıt Koruması', toggle: !!c.sdp, sub: 'Evden uzakta parolanızı ya da Apple Hesabınızı değiştirmek Face ID gerektirir ve 1 saat bekleme süresi vardır.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Bu, parolanızı yazarken sizi izlemiş bir hırsızın sizi dışarıda bırakmasını engeller. <strong>Açın.</strong>'},
            {screen: () => list(p, 'Çalınan Aygıt Koruması', [{label: 'Çalınan Aygıt Koruması', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Sırada kilit ekranındaki mesajları gizlemek var. Geri dönmek için <strong>‹ Face ID\'ye dokunun</strong>.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Bildirimler\'e dokunun.</strong>'},
            {screen: c => list(p, 'Bildirimler', [{id: 'previews', label: 'Önizlemeleri Göster', value: c.previews || 'Her Zaman'}, {label: 'Ekran Paylaşımı', value: 'Bildirimler Kapalı'}], {back: 'Ayarlar',
                overlay: c.pickPrev ? sheet('Önizlemeleri Göster', [['prev-always', 'Her Zaman'], ['prev-unlocked', 'Kilitli Değilken', 'Önerilen'], ['prev-never', 'Asla']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Şu anda herkes, güvenlik kodları dahil mesajlarınızı telefonunuzun kilidini açmadan okuyabilir. <strong>Önizlemeleri Göster\'e dokunun.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Google\'a dokunun.</strong>', hint: 'Listenin alt kısmına yakın.'},
            {screen: () => list(p, 'Google', [{label: 'Google Hesabınızı yönetin'}, {id: 'all-services', label: 'Tüm hizmetler'}, {label: 'Yedek'}]), target: 'all-services', say: '<strong>Tüm hizmetler\'e dokunun.</strong>'},
            {screen: () => list(p, 'Tüm hizmetler', [{caption: 'Kişisel ve cihaz güvenliği'}, {id: 'theft', label: 'Hırsızlığa karşı koruma'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Hırsızlığa karşı koruma\'ya dokunun.</strong>'},
            {screen: c => list(p, 'Hırsızlığa karşı koruma', [{id: 'tdl', label: 'Hırsızlık Algılama Kilidi', toggle: !!c.tdl, sub: 'Birinin telefonunuzu kapıp kaçtığını algılarsa ekranınızı kilitler.'}, {label: 'Çevrimdışı Cihaz Kilidi', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Hırsızlık Algılama Kilidi\'ni açın.</strong> Biri telefonunuzu kapıp kaçarsa telefon kendini kilitler.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Sırada kilit ekranındaki mesajları gizlemek var. Ayarlar\'a dönünce <strong>Bildirimler\'e dokunun</strong>.'},
            {screen: c => list(p, 'Bildirimler', [{id: 'previews', label: 'Kilit ekranındaki bildirimler', sub: c.previews || 'Tüm içeriği göster'}, {label: 'Bildirim geçmişi'}], {
                overlay: c.pickPrev ? sheet('Kilit ekranındaki bildirimler', [['prev-always', 'Tüm içeriği göster'], ['prev-unlocked', 'Hassas içeriği gizle', 'Önerilen'], ['prev-never', 'Hiçbir bildirimi gösterme']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Şu anda herkes, güvenlik kodları dahil mesajlarınızı telefonunuzun kilidini açmadan okuyabilir. <strong>Kilit ekranındaki bildirimler\'e dokunun.</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Bildirimler', [{label: 'Önizlemeleri Göster', value: 'Her Zaman'}], {back: 'Ayarlar', overlay: sheet('Önizlemeleri Göster', [['prev-always', 'Her Zaman'], ['prev-unlocked', 'Kilitli Değilken', 'Önerilen'], ['prev-never', 'Asla']])})
                : list(p, 'Bildirimler', [{label: 'Kilit ekranındaki bildirimler', sub: 'Tüm içeriği göster'}], {overlay: sheet('Kilit ekranındaki bildirimler', [['prev-always', 'Tüm içeriği göster'], ['prev-unlocked', 'Hassas içeriği gizle', 'Önerilen'], ['prev-never', 'Hiçbir bildirimi gösterme']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Kilitli Değilken' : 'Hassas içeriği gizle'}.</strong>`, hints: {'prev-always': 'Eskiden böyleydi. Önerilen seçeneği seçin.', 'prev-never': 'Bu onları tamamen gizler, bu da can sıkıcı olabilir. Önerilen seçeneği seçin.'}},
        {screen: () => home(p), target: 'phone', say: 'Son olarak telefonunuzun IMEI numarasını bulun. Şebekeniz çalınan bir telefonu engellemek için buna ihtiyaç duyar. <strong>Telefon uygulamasını açın.</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'Tuş takımında <strong>*#06# yazın</strong> (yıldız, kare, sıfır, altı, kare).', hint: 'Sol alttaki yıldız tuşu * ile başlayın.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Cihaz bilgisi', 'IMEI: 35 209900 176148 1 (deneme numarası)', [['ok', 'Tamam']])}),
         target: 'ok', say: 'Bu uzun numara sizin <strong>IMEI</strong> numaranız. Gerçek bir telefonda bunu güvenli bir yere yazın (telefonun kendisine değil!). <strong>Tamam\'a dokunun.</strong>'},
        {screen: () => home(p), question: {q: 'Telefonunuz kapıldı. İlk kimi ararsınız?', options: [
            {t: 'Bankamı, başka birinin telefonundan', ok: true, why: 'Evet. Hırsızlar önce bankacılık uygulamalarının peşine düşer. Sonra telefonu çevrimiçi kilitleyin, şebekenizi arayın ve 101\'e bildirin.'},
            {t: 'Bekler ve ortaya çıkıp çıkmadığına bakarım', why: 'Hız önemlidir. Hemen bankanızı arayın, sonra telefonu kilitleyin ve şebekenizi arayın.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Telefonunuzu bir hırsızın kullanması artık çok daha zor ve IMEI\'nizi nerede bulacağınızı biliyorsunuz.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'BUL' : 'İZLEYİCİ UYARISI', title: p === 'ios' ? 'AirTag Sizinle Birlikte Hareket Ederken Bulundu' : 'Sizinle seyahat eden bilinmeyen izleyici',
            text: '<br>Bu öğenin konumu sahibi tarafından görülebilir.'}),
         target: 'alert', say: 'Telefonunuz, sizinle birlikte dolaşan, size ait olmayan bir izleyici fark etti. Panik yapmayın: çoğu zaman yanlışlıkla bir aile üyesinin olur. <strong>Uyarıya dokunun.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Bilinmeyen AirTag' : 'Bilinmeyen izleyici', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Bugün <strong>10:12</strong>'den beri 4 yerde sizinle birlikte görüldü.</p>
            <button type="button" class="ce co" data-tap="play">Ses Çal</button>
            <button type="button" class="cp" data-tap="learn">Bu ${p === 'ios' ? 'AirTag' : 'İzleyici'} Hakkında Bilgi Edinin</button>
            <button type="button" class="cp" data-tap="disable">Devre Dışı Bırakma Talimatları</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Harita, sizinle birlikte nerelerde olduğunu gösterir. Bulabilmek için <strong>Ses Çal\'a dokunun</strong>.'},
        {screen: () => app(p, p === 'ios' ? 'Bilinmeyen AirTag' : 'Bilinmeyen izleyici', '<p class="cf">⟦volume-2⟧ <strong>Ses çalınıyor…</strong><br>Cıvıldayan bir ses dinleyin.</p>', {color: '#fff'}),
         question: {q: 'Hafif bir cıvıltı duyuyorsunuz. Nereye bakmalısınız?', options: [
            {t: 'Çantalarda, mont ceplerinde, arabada ve ödünç aldığınız her şeyde', ok: true, why: 'Evet. İzleyiciler küçüktür, büyük bir bozuk para büyüklüğündedir ve çoğu zaman astarlara, ceplere ya da arabalara sıkıştırılır.'},
            {t: 'Hiçbir yerde, yok sayarım', why: 'Bulmaya değer. Çantalarınıza, ceplerinize ve arabanıza bakın: sadece bir aile üyesinin olabilir.'}]}},
        {screen: c => app(p, 'İzleyici bulundu', `<p class="cf">Hakkında daha fazlasını görmek için telefonunuzun üst kısmını izleyiciye yaklaştırın.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">İzleyiciye yaklaştırın</button>`, {color: '#fff'}),
         target: 'scan', say: 'Mont astarınızda buldunuz. Kime ait olduğunu görmek için <strong>İzleyiciye yaklaştırın\'a dokunun</strong>.'},
        {screen: () => app(p, 'Bu izleyici hakkında', '<p class="cf"><strong>Kayıp Modunda Değil</strong><br>Seri numarası: P4R7-ACT1CE<br>Sahip bilgileri yalnızca polisle paylaşılır.</p>', {color: '#fff'}),
         question: {q: 'Bir aile üyesinin değil ve birinin sizi takip etmek için sakladığından endişeleniyorsunuz. Ne yaparsınız?', options: [
            {t: 'Güvenli bir yerde saklar ve polise götürürüm (tehlikedeyseniz 999\'u arayın)', ok: true, why: 'Evet. Atmayın: polis sahibini bulabilir. National Stalking Helpline\'ın numarası 0808 802 0300.'},
            {t: 'Çöpe atarım', why: 'Kanıt olabilir ve polis sahibini bulabilir. Saklayın ve onlara götürün; tehlikedeyseniz 999\'u arayın.'}]}},
        {screen: () => app(p, 'Bu izleyici hakkında', '<p class="cf">Yardım: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (24 saat) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Tebrikler!</strong> Bir izleyiciyi nasıl bulacağınızı ve ne yapacağınızı biliyorsunuz. ' + (p === 'android' ? '<strong>Ayarlar > Güvenlik ve acil durum > Bilinmeyen izleyici uyarıları</strong> bölümünde uyarıların açık olduğunu kontrol edin.' : 'iPhone\'lar izleyicileri otomatik olarak kontrol eder.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Bir uçurum patikasındasınız ve biri düştü. Adres yok. 999\'u aradığınızda çoğu telefon konumunuzu otomatik olarak gönderir, ama üç kelime de yardımcı olur. <strong>what3words\'ü açın.</strong> <em>(Bir deneme sürümü.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Mavi nokta sizsiniz. Her 3 metrelik karenin kendi üç kelimesi vardır. Sizinki <strong>puffin.chalk.lantern</strong>. Noktanın yerine oturması için bir an bekleyin, sonra <strong>3 kelimem hazır\'a dokunun</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Şimdi 999\'u arayın. <strong>Telefon uygulamasını açın.</strong> <em>(Yalnızca alıştırma: denemek için asla 999\'u aramayın.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>999 yazın.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Yeşil arama düğmesine dokunun.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Acil çağrı · 0:08</small></div>
            <p class="hi">"Acil durum, hangi hizmet? … Ambulans. Acil durumun tam konumu nedir?"</p>${homeIndicator(p)}</div>`,
         question: {q: 'Çağrı görevlisi nerede olduğunuzu soruyor. Ne dersiniz?', options: [
            {t: '"Uçurum patikasındayım. what3words adresim puffin, chalk, lantern."', ok: true, why: 'Evet. Nerede olduğunuzu kendi sözlerinizle söyleyin, sonra üç kelimeyi verin. İstenirse herhangi bir kelimeyi heceleyin.'},
            {t: '"Bilmiyorum, denizin yakınında bir yerde"', why: 'Sizi bulmaya çalışırlar, ama üç kelime sizi 3 metreye kadar belirler. Onları uygulamadan okuyun.'}]}},
        {screen: () => home(p), question: {q: 'Bir arkadaşınız sağır ve sesli arama yapamıyor. 999\'a nasıl ulaşabilir?', options: [
            {t: 'Şimdi acil durum mesajı için kaydolur (999\'a "register" yazıp gönderir) ya da 999 BSL uygulamasını kullanır', ok: true, why: 'Evet. Acil durum mesajı yalnızca önce kaydolursanız çalışır. 999 BSL uygulaması bir işaret dili tercümanına bağlanır.'},
            {t: 'Göremezler', why: 'Yapabilir. 999\'a "register" yazıp göndererek acil durum mesajına kaydolun ya da ücretsiz 999 BSL uygulamasını kullanın.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Unutmayın: nerede olduğunuzu söyleyin, sonra üç kelimenizi verin. what3words uygulaması kelimelerinizi bulmak için sinyalsiz de çalışır, ama aramak için sinyale ihtiyacınız var.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Yanıt vermiyor</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Telefonunuz takıldı: dokunmak hiçbir şey yapmıyor ve normal yoldan kapanmıyor. Bu büyük bir sorun mu?', options: [
            {t: 'Genellikle hayır. "Zorla yeniden başlatma" düzeltir ve hiçbir şey kaybetmezsiniz', ok: true, why: 'Doğru. Zorla yeniden başlatma, prizden çekmek gibidir. Fotoğraflarınız ve mesajlarınız güvende.'},
            {t: 'Evet, bozuk', why: 'Genellikle hayır! Zorla yeniden başlatma takılan çoğu telefonu düzeltir ve hiçbir şey kaybetmezsiniz.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'iPhone\'da: <strong>ses artırmaya basıp bırakın</strong>, sonra <strong>ses azaltmaya basıp bırakın</strong>, sonra Apple logosu görünene kadar (yaklaşık 10 saniye) <strong>yan düğmeye basılı tutun</strong>. Burada bu sırayla dokunun.'
            : 'Çoğu Android telefonda: yeniden başlayana kadar yaklaşık 10 saniye <strong>güç düğmesine ve ses azaltmaya birlikte basılı tutun</strong>. Burada önce güce, sonra ses azaltmaya dokunun. <em>(Google Pixel: yalnızca güç düğmesini 30 saniye basılı tutun.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Önce ses artırma gelir.' : 'Güç düğmesiyle başlayın.', side: 'Yan düğme en sonda, iki ses düğmesinden sonra.'},
         hint: p === 'ios' ? 'Ses artırma, sonra ses azaltma, sonra yan düğme.' : 'Güç, sonra ses azaltma.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'Logo göründü. Şimdi ne yapmalı?', options: [
            {t: 'Bırakıp açılmasını beklerim', ok: true, why: 'Evet. Bir dakika sürer. Parolanızı bir kez yazmanız gerekebilir.'},
            {t: 'Tüm düğmelere basmaya devam ederim', why: 'Logo göründüğünde bırakın ve açılması için bir dakika verin.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Tebrikler!</strong> Telefonunuz yeniden başladı. Takılmaya devam ederse güncellemeleri kontrol edin ve depolamada yer açın. Telefonunuzu haftada bir yeniden başlatmak sorunsuz çalışmasını sağlar.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Açık' : 'Kapalı'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Kapalı' : (ctx.signal ? 'Açık · 4G' : 'Hizmet yok')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Kapalı' : 'Ev'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Kapatmak için yukarı kaydırın' : 'Kapat'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Hizmet yok</span>'), target: 'pull-down',
         say: 'Telefonunuz <strong>Hizmet yok</strong> diyor, oysa bu sabah çalışıyordu. Hızlı bir çözüm, Uçak modunu açıp kapatmaktır; bu, yeniden bağlanmasını sağlar. ' + (p === 'ios' ? '<strong>Sağ üst köşeden aşağı kaydırın</strong> (ya da şeride dokunun).' : '<strong>Üstten aşağı kaydırın</strong> (ya da şeride dokunun).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: 'Açmak için <strong>Uçak modu\'na dokunun</strong>. Kablosuz her şey kapanır.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Yaklaşık 10 saniye bekleyin… sonra kapatmak için <strong>Uçak modu\'na tekrar dokunun</strong>.'},
        {screen: c => quickPanel(p, c), question: {q: 'Mobil veri yeniden 4G\'de. Uçak modu başka ne zaman işe yarar?', options: [
            {t: 'Uçakta ya da dolaşım (roaming) ücretlerinden kaçınmak için yurt dışında (Wi-Fi\'yi yine açabilirsiniz)', ok: true, why: 'Evet. Uçak modu açıkken otel ya da gemi Wi-Fi\'sini kullanmak için Wi-Fi\'yi yeniden açabilirsiniz.'},
            {t: 'Telefonu şarj etmek için', why: 'Biraz daha hızlı şarj olur, ama asıl uçuşlar ve yurt dışında dolaşım ücretlerinden kaçınmak içindir.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Tebrikler!</strong> Uçak modu düzeltmezse telefonunuzu yeniden başlatın. Hâlâ hizmet yok mu? Şebekenizin web sitesinde bölgenizdeki sorunlara bakın.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · şimdi</strong><span>🎁 ÜCRETSİZ canlarınız sizi bekliyor! Geri gelin ve oynayın! 🎉</span></button>',
         target: 'settings', say: 'Bir oyun anlamsız mesajlarla durmadan titreşiyor. Herhangi bir uygulamanın bildirimlerini kapatabilirsiniz. Mesaja değil, <strong>Ayarlar\'a dokunun</strong>.', hints: {notif: 'O oyunu açar. Bunun yerine Ayarlar\'a dokunun.'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Bildirimler\'e dokunun.</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Bildirimler', [{label: 'Önizlemeleri Göster', value: 'Kilitli Değilken'}, {caption: 'BİLDİRİM STİLİ'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Bannerlar, Sesler, Rozetler'}, {label: 'Mesajlar', sub: 'Bannerlar, Sesler, Rozetler'}, {label: 'WhatsApp', sub: 'Bannerlar, Sesler, Rozetler'}], {back: 'Ayarlar'})
            : list(p, 'Bildirimler', [{id: 'app-notifs', label: 'Uygulama bildirimleri'}, {id: 'history', label: 'Bildirim geçmişi'}, {label: 'Kilit ekranındaki bildirimler'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Bubble Pop\'a dokunun.</strong>' : '<strong>Uygulama bildirimleri\'ne dokunun.</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Uygulama bildirimleri', [{label: 'Mesajlar', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: 'Bildirimlerini kapatmak için <strong>Bubble Pop\'un yanındaki anahtara dokunun</strong>.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Bildirimlere İzin Ver', toggle: !c.off}], {back: 'Bildirimler'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Bildirimlere İzin Ver\'i kapatın.</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Bildirimler', [{label: 'Uygulama bildirimleri'}, {id: 'history', label: 'Bildirim geçmişi', sub: 'Kapalı'}]), target: 'history',
             say: 'Kullanışlı bir ekstra: bir mesajı yanlışlıkla kaydırıp kaldırırsanız Bildirim geçmişi bir kopyasını tutar. <strong>Bildirim geçmişi\'ne dokunun.</strong>'},
            {screen: c => list(p, 'Bildirim geçmişi', [{id: 'hist-toggle', label: 'Bildirim geçmişini kullan', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Açın.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Hangi uygulamaların bildirimlerini açık tutmaya değer?', options: [
            {t: 'Mesajlar, aramalar, WhatsApp, bankanız ve hemen bilmek isteyeceğiniz her şey', ok: true, why: 'Evet. Önemlileri tutun; oyunları, mağazaları ve yalnızca başınızın etini yiyen her şeyi kapatın.'},
            {t: 'Hepsini kapatırım', why: 'Mesajları ve aramaları kaçırırsınız! Önemlileri tutun, oyun ve alışveriş uygulamalarını kapatın.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Tebrikler!</strong> Bubble Pop artık sizi rahatsız etmeyecek. ' + (p === 'ios' ? 'Bir mesajı yanlışlıkla kaydırıp kaldırırsanız, öncekileri görmek için kilit ekranının ortasından yukarı kaydırın.' : 'Bildirim geçmişi de kaydırıp kaldırdığınız her şeyin bir kopyasını tutar.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Ducking bahçe merkezinde görüşürüz x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Kısa mesaj</span></div>${homeIndicator(p)}</div>`,
         question: {q: '"Dunnington bahçe merkezi" yazdınız ve telefonunuz değiştirdi. Neden?', options: [
            {t: 'Otomatik düzeltme yanlış sözcüğü tahmin etti', ok: true, why: 'Evet. Otomatik düzeltme tanımadığı sözcükleri değiştirir. Kapatabilir ya da ona yeni sözcükler öğretebilirsiniz.'},
            {t: 'Telefon bozuk', why: 'Bu sadece otomatik düzeltmenin tahmini. Kapatabilir ya da ona sözcükler öğretebilirsiniz.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Genel\'e dokunun.</strong>'},
            {screen: () => list(p, 'Genel', [{label: 'Hakkında'}, {label: 'Yazılım Güncelleme'}, {id: 'keyboard', label: 'Klavye'}, {label: 'Dil ve Bölge'}], {back: 'Ayarlar'}), target: 'keyboard', say: '<strong>Klavye\'ye dokunun.</strong>'},
            {screen: c => list(p, 'Klavyeler', [{id: 'replace', label: 'Metin Değiştirme'}, {caption: 'TÜM KLAVYELER'}, {label: 'Otomatik Büyük Harf', toggle: true}, {id: 'ac', label: 'Otomatik Düzeltme', toggle: !c.acOff}, {label: 'Tahmine Dayalı', toggle: true}], {back: 'Genel'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Otomatik Düzeltme\'yi kapatın.</strong> Yazım hataları yine kırmızı altı çizili görünür, böylece kendiniz düzeltebilirsiniz.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Sistem\'e dokunun.</strong> En altta.'},
            {screen: () => list(p, 'Sistem', [{id: 'keyboard', label: 'Klavye'}, {label: 'Diller'}, {label: 'Tarih ve saat'}]), target: 'keyboard', say: '<strong>Klavye\'ye dokunun.</strong>'},
            {screen: () => list(p, 'Klavye', [{id: 'gboard', label: 'Gboard', sub: 'Ekran klavyesi'}]), target: 'gboard', say: '<strong>Gboard\'a dokunun.</strong> <em>Samsung\'da Samsung Klavye > Akıllı yazma.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Tercihler'}, {id: 'correction', label: 'Metin düzeltme'}, {label: 'Kaydırarak yazma'}]), target: 'correction', say: '<strong>Metin düzeltme\'ye dokunun.</strong>'},
            {screen: c => list(p, 'Metin düzeltme', [{label: 'Öneri şeridini göster', toggle: true}, {id: 'ac', label: 'Otomatik düzeltme', toggle: !c.acOff}, {label: 'Yazım denetimi', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Otomatik düzeltme\'yi kapatın.</strong> Yazım hataları yine kırmızı altı çizili görünür, böylece kendiniz düzeltebilirsiniz.'},
        ]),
        {screen: () => home(p), question: {q: 'Otomatik düzeltmeyi tutmayı tercih edersiniz, ama o hep "Dunnington"ı değiştiriyor. Başka ne yapabilirsiniz?', options: [
            {t: 'Telefonun sözlüğüne ekleyip sözcüğü öğrenmesini sağlarım', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Aynı Klavye ayarlarındaki Metin Değiştirme\'yi kullanın.' : 'Öneri şeridindeki sözcüğe dokunun ve sözlüğünüze eklemeyi seçin.')},
            {t: 'Hiçbir şey, katlanırım', why: 'Ona öğretebilirsiniz: ' + (p === 'ios' ? 'sözcüğü Klavye > Metin Değiştirme\'ye ekleyin.' : 'önerilerdeki sözcüğe dokunun ve sözlüğünüze ekleyin.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Artık sürpriz sözcük değişiklikleri yok. Aynı yerden istediğiniz zaman yeniden açabilirsiniz.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'Yeni kablosuz kulaklıklarınız var. Önce ne yaparsınız?', options: [
            {t: 'Onları "eşleştirme moduna" alırım (genellikle bir ışık yanıp sönene kadar düğmeyi basılı tutarak)', ok: true, why: 'Evet. Eşleştirme modu telefonunuzun onları bulmasını sağlar. Kutudaki talimatlar tam olarak nasıl yapılacağını söyler.'},
            {t: 'Telefona takarım', why: 'Kablosuz kulaklıklar Bluetooth ile bağlanır. Önce onları eşleştirme moduna alın; genellikle bir ışık yanıp sönene kadar düğmeyi basılı tutarak.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Kulaklıkların ışığı yanıp sönüyor. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Bluetooth\'a dokunun.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Bağlı cihazlar\'a dokunun.</strong>'},
            {screen: () => list(p, 'Bağlı cihazlar', [{id: 'pair', label: '＋ Yeni cihaz eşleştir'}, {label: 'Kayıtlı cihazlar', sub: 'Araba'}]), target: 'pair', say: '<strong>Yeni cihaz eşleştir\'e dokunun.</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Yeni cihaz eşleştir', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'CİHAZLARIM' : 'Kayıtlı'}, {label: 'Araba', sub: 'Bağlı değil'},
            {caption: p === 'ios' ? 'DİĞER CİHAZLAR' : 'Kullanılabilir cihazlar'}, {id: 'headphones', label: '⟦headphones⟧ Deneme Kulaklığı'}, {label: 'Komşunun TV\'si'}], {back: 'Ayarlar'}),
         target: 'headphones', say: 'Telefonunuz yakındaki cihazları arıyor. <strong>Deneme Kulaklığı\'na dokunun.</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'CİHAZLARIM'}, {label: '⟦headphones⟧ Deneme Kulaklığı', sub: 'Bağlandı ⟦check⟧'}, {label: 'Araba', sub: 'Bağlı değil'}], {back: 'Ayarlar'}),
         question: {q: 'Kulaklıkları bir sonraki açışınızda bunu yeniden yapmanız gerekir mi?', options: [
            {t: 'Hayır, bundan sonra kendiliğinden bağlanırlar', ok: true, why: 'Evet. Yalnızca bir kez eşleştirirsiniz. Sonra açık ve yakındayken otomatik bağlanırlar.'},
            {t: 'Evet, her seferinde', why: 'Yalnızca bir kez eşleştirirsiniz. Sonra kendiliğinden bağlanırlar.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Deneme Kulaklığı', sub: 'Bağlandı ⟦check⟧'}], {back: 'Ayarlar'}), done: true,
         say: '<strong>Tebrikler!</strong> Aynı adımlar araba, hoparlör ya da işitme cihazları için de geçerlidir. Bir şey bağlanmazsa Bluetooth\'u kapatıp açın ve cihazı yeniden eşleştirme moduna alın.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">"${ctx.said || 'Büyükanne? Benim, Tom! Telefonumu kaybettim ve başım dertte. Bugün bir ceza için £400\'e ihtiyacım var. Lütfen anneme söyleme!'}"</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Aile gizli ifadesini sorun</button><button type="button" data-tap="send-money">Parayı göndereceğinizi söyleyin</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Tanımadığınız bir numara arıyor. Ne yapacağınızı alıştırmak için <strong>cevaplayın</strong>.', hints: {decline: 'Gerçek hayatta reddetmek iyi! Bu alıştırma için Cevapla\'ya dokunun.'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Şey… ne? Büyükanne, buna zaman yok! Lütfen, parayı şimdi istiyorum!'; },
         say: 'Torununuz Tom\'a tıpatıp benziyor. Ama dolandırıcılar sesleri kopyalayabilir. Aileniz bir <strong>gizli ifade</strong> üzerinde anlaşmıştı. <strong>Onu isteyin.</strong>',
         hints: {'send-money': 'Böyle bir görüşmede asla para göndermeyi kabul etmeyin. Gizli ifadeyi isteyin.', end: 'Kapatmak da iyi! Ama önce gizli ifadeyi istemeyi alıştırın.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Bilmiyorlar ve daha çok bastırıyorlar. Bu bir dolandırıcı. Kırmızı düğmeyle <strong>kapatın</strong>.', hints: {'send-money': 'Kapatmayın! Onlar ifadeyi bilmiyordu. Kapatın.', 'ask-phrase': 'İstediniz ve cevap veremediler. Kapatın.'}},
        {screen: () => home(p), question: {q: 'Hâlâ Tom için biraz endişelisiniz. Ne yaparsınız?', options: [
            {t: 'Tom\'u (ya da annesini) onun için zaten sahip olduğum numaradan ararım', ok: true, why: 'Evet. Her zaman bildiğiniz bir numaradan geri arayın. Gerçek Tom iyi olacaktır ve kontrol etmenize alınmaz.'},
            {t: 'Beni arayan numarayı geri ararım', why: 'Bu yine dolandırıcıya ulaşır. Tom\'u onun için zaten sahip olduğunuz numaradan arayın.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Bir arama banka hesabınızla ilgiliyse kendi bankanıza güvenle ulaşmak için <strong>159</strong>\'u arayabilirsiniz. Alıştırmak için <strong>Telefon uygulamasını açın</strong>.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>159 yazın.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Yeşil arama düğmesine dokunun.</strong> <em>(Yalnızca alıştırma: hiçbir şey aranmaz.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">"159'a hoş geldiniz. Lütfen bankanızın adını söyleyin, sizi bağlayalım."</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Tebrikler!</strong> 159 sizi gerçek bankanıza bağlar. Ailenizle yüz yüze bir gizli ifade üzerinde anlaşın ve onu asla çevrimiçi paylaşmayın.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Merhaba' : 'Selam'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Açmak için yukarı kaydırın' : 'Başlayın'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Yeni telefonunuz kutudan çıktı ve açıldı. <strong>Eski telefonunuzu</strong> yakında, şarjlı ve Wi-Fi'ye bağlı tutun. <strong>Dokunun: ${p === 'ios' ? 'Açmak için yukarı kaydırın' : 'Başlayın'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Hızlı Başlangıç' : 'Uygulamaları ve verileri kopyala', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Apple Hesabınızla kurmak için eski iPhone\'unuzu buna yaklaştırın.' : 'Uygulamalarınızı, fotoğraflarınızı, kişilerinizi ve daha fazlasını eski telefonunuzdan kopyalayın.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Eski iPhone\'unuzda devam edin' : 'Eski cihazınızı kullanın'}</button>
            <button type="button" class="cp" data-tap="manual">Bunun yerine elle kur</button>`}),
         target: 'use-old', say: 'Eski telefonunuzdan kopyalamak her şeyi yeniden kurmaktan kurtarır. <strong>Dokunun: ' + (p === 'ios' ? 'Eski iPhone\'unuzda devam edin' : 'Eski cihazınızı kullanın') + '.</strong>', hints: {manual: 'Yapabilirsiniz, ama kopyalamak çok daha kolay. Diğer düğmeye dokunun.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf"><strong>Eski</strong> telefonunuzda bir mesaj belirir. Kamerasını bu desene doğrultun.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Eski telefon taradı</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'Eski telefonda Devam\'a dokunun, sonra kamerası görebilsin diye bu desenin üzerine tutun. Burada <strong>Eski telefon taradı\'ya dokunun</strong>.'},
        {screen: c => codeScreen(p, c, 'Eski telefonunuzun parolasını girin', 'Bu, ayarlarınızı güvenle kopyalar.'), sequence: CODE_KEYS,
         say: `Eski telefonunuzun parolasını yazın. Alıştırma için <strong>${codeText}</strong> kullanın.`, hint: `Deneme kodunu yazın: ${codeText}.`},
        {screen: () => list(p, 'Verilerinizi aktarın', [], {noBack: true, top: `<p class="cf">Nelerin aktarılacağını seçin:</p>
            <div class="cj ex"><span>Fotoğraflar ve videolar</span>${tog(true)}</div><div class="cj ex"><span>Kişiler ve mesajlar</span>${tog(true)}</div><div class="cj ex"><span>Uygulamalar</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Devam</button>`}),
         target: 'transfer', say: 'Her şey işaretli. <strong>Devam\'a dokunun.</strong> İki telefonu birbirine yakın ve şarja takılı tutun.'},
        {screen: c => list(p, 'Aktarılıyor…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Yaklaşık 25 dakika kaldı' : 'Aktarım tamamlandı ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Aktarım bitti. Eski telefonla ne yapmalısınız?', options: [
            {t: 'Bir hafta saklar, eksik bir şey olmadığını kontrol eder, sonra satmadan ya da geri dönüştürmeden önce düzgünce silerim', ok: true, why: 'Evet. Önce fotoğraflarınızın, WhatsApp\'ın ve bankacılık uygulamalarının yeni telefonda çalıştığını kontrol edin. Sonraki ders eskisini nasıl sileceğinizi gösteriyor.'},
            {t: 'Hemen çöpe atarım', why: 'İçinde hâlâ tüm bilgileriniz var! Yeni telefonda her şeyin olduğunu kontrol edin, sonra eskisini düzgünce silin.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Yeni telefonunuzda fotoğraflarınız, kişileriniz ve uygulamalarınız var. Bankacılık ve WhatsApp gibi bazı uygulamalar yeniden giriş yapmanızı ister; bilgilerinizi hazır tutun.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Eski telefonunuzu mu satıyor, hediye ediyor ya da geri dönüştürüyorsunuz? Bunları doğru sırayla yapın, yoksa sonraki sahibi kullanamaz. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '1. adım: Apple Hesabınızdan çıkış yapın. <strong>Adınıza dokunun</strong>.'},
            {screen: c => list(p, 'Apple Hesabı', [{label: 'Kişisel Bilgiler'}, {label: 'Giriş ve Güvenlik'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Oturumu Kapat', danger: true}], {back: 'Ayarlar',
                overlay: c.ask ? dialog(p, 'Oturum kapatılsın mı?', 'Bul\'u kapatmak için şifreniz gerekir. (Alıştırma: sizin yerinize girildi.)', [['cancel', 'İptal'], ['turn-off', 'Kapat']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'En alta kaydırın ve <strong>Oturumu Kapat\'a dokunun</strong>.'},
            {screen: () => list(p, 'Apple Hesabı', [{label: 'Oturumu Kapat', danger: true}], {back: 'Ayarlar', overlay: dialog(p, 'Oturum kapatılsın mı?', 'Bul\'u kapatmak için şifreniz gerekir. (Alıştırma: sizin yerinize girildi.)', [['cancel', 'İptal'], ['turn-off', 'Kapat']])}),
             target: 'turn-off', say: 'Bu, telefonu size kilitleyecek olan <strong>Bul</strong>\'u kapatır. <strong>Kapat\'a dokunun.</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: '2. adım: silin. <strong>Genel\'e dokunun.</strong>'},
            {screen: () => list(p, 'Genel', [{label: 'Hakkında'}, {label: 'iPhone Depolama Alanı'}, {id: 'reset', label: 'iPhone\'u Aktar veya Sıfırla'}], {back: 'Ayarlar'}), target: 'reset', say: 'En alttaki <strong>iPhone\'u Aktar veya Sıfırla\'ya dokunun</strong>.'},
            {screen: c => list(p, 'iPhone\'u Aktar veya Sıfırla', [{label: 'Sıfırla'}, {id: 'erase', label: 'Tüm İçeriği ve Ayarları Sil'}], {back: 'Genel',
                overlay: c.askErase ? dialog(p, 'Bu iPhone Silinsin mi?', 'Tüm fotoğraflar, mesajlar ve uygulamalar silinecek.', [['cancel', 'İptal'], ['confirm-erase', 'Sil']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Tüm İçeriği ve Ayarları Sil\'e dokunun.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '1. adım: Google Hesabınızı kaldırın. <strong>Google\'a dokunun</strong>. <em>(Samsung\'da Samsung hesabınızı da kaldırın.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Google Hesabınızı yönetin'}, {id: 'accounts', label: 'Bu cihazdaki hesaplar', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Bu cihazdaki hesaplar\'a dokunun.</strong>'},
            {screen: c => list(p, 'Google hesabı', [{label: 'margaret.smith@example.com'}, {label: 'Hesap senkronizasyonu'}, {id: 'remove', label: 'Hesabı kaldır', danger: true}], {overlay: c.ask ? dialog(p, 'Hesap kaldırılsın mı?', 'Kaldırmak, onun mesajlarını, kişilerini ve verilerini bu telefondan siler.', [['cancel', 'İptal'], ['confirm-remove', 'Hesabı kaldır']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Bu yapılmazsa telefon sıfırlamadan sonra hesabınıza kilitli kalır. <strong>Hesabı kaldır\'a dokunun.</strong>'},
            {screen: () => list(p, 'Hesap', [{label: 'Hesabı kaldır', danger: true}], {overlay: dialog(p, 'Hesap kaldırılsın mı?', 'Kaldırmak, onun mesajlarını, kişilerini ve verilerini bu telefondan siler.', [['cancel', 'İptal'], ['confirm-remove', 'Hesabı kaldır']])}),
             target: 'confirm-remove', say: '<strong>Hesabı kaldır\'a dokunun.</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: '2. adım: silin. En alttaki <strong>Sistem\'e dokunun</strong>.'},
            {screen: () => list(p, 'Sistem', [{label: 'Diller'}, {label: 'Yazılım güncellemesi'}, {id: 'reset', label: 'Sıfırlama seçenekleri'}]), target: 'reset', say: '<strong>Sıfırlama seçenekleri\'ne dokunun.</strong>'},
            {screen: c => list(p, 'Sıfırlama seçenekleri', [{label: 'Wi-Fi\'yi, mobili ve Bluetooth\'u sıfırla'}, {id: 'erase', label: 'Tüm verileri sil (fabrika ayarlarına sıfırla)'}], {overlay: c.askErase ? dialog(p, 'Tüm veriler silinsin mi?', 'Tüm fotoğraflar, mesajlar ve uygulamalar silinecek.', [['cancel', 'İptal'], ['confirm-erase', 'Tüm verileri sil']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Tüm verileri sil (fabrika ayarlarına sıfırla)\'ya dokunun.</strong>'},
        ]),
        {screen: () => list(p, 'Sıfırla', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Bu iPhone Silinsin mi?' : 'Tüm veriler silinsin mi?', 'Tüm fotoğraflar, mesajlar ve uygulamalar silinecek.', [['cancel', 'İptal'], ['confirm-erase', p === 'ios' ? 'Sil' : 'Tüm verileri sil']])}),
         target: 'confirm-erase', say: 'Bunu yalnızca fotoğraflarınız yeni telefonunuza ya da yedeğe güvenle alındıktan sonra yapın. <strong>Dokunun: ' + (p === 'ios' ? 'Sil' : 'Tüm verileri sil') + '.</strong> <em>(Alıştırma: hiçbir şey silinmez.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Merhaba' : 'Selam'}</h3><p class="cf">Bir sonraki sahibine hazır</p>${homeIndicator(p)}</div>`,
         question: {q: 'Teslim etmeden önce son bir şey daha var mı?', options: [
            {t: 'SIM kartı (ve varsa hafıza kartını) çıkarırım', ok: true, why: 'Evet. SIM\'in üzerinde telefon numaranız var. Küçük aletle ya da bir ataçla çıkarın.'},
            {t: 'Başka bir şey yok', why: 'SIM kartınızı ve varsa hafıza kartını çıkarın. Numaranız SIM\'in üzerindedir.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Merhaba' : 'Selam'}</h3><p class="cf">Bir sonraki sahibine hazır</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Tebrikler!</strong> Oturumu kapatın, silin, SIM\'i çıkarın: bu sırayla. "Merhaba" ekranı, başkası için hazır olduğu anlamına gelir.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Anımsatıcı</strong><span>Sarah'yı ara</span><small>Bugün 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, daha sonra sağanak</span><small>En yüksek 14° · En düşük 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} dinliyor… ne söylemek istersiniz?`}</p>${result}
            <div class="wh">${[['say-remind', '"Saat 3\'te Sarah\'yı aramamı hatırlat"'], ['say-weather', '"Bugün hava nasıl?"'], ['say-joke', '"Bana bir pizza sipariş et"']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Yan düğme (basılı tutun)' : 'Güç düğmesi (basılı tutun)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong>, yüksek sesle istediğinizde işler yapar. Siri görünene kadar <strong>yan düğmeye basılı tutun</strong> (sağda). Ayrıca yalnızca "Siri" ya da "Hey Siri" diyebilirsiniz.'
                          : 'Telefonunuz yüksek sesle istediğinizde işler yapabilir. Asistan görünene kadar <strong>güç düğmesine basılı tutun</strong> (sağda). Ayrıca "Hey Google" diyebilirsiniz.',
         hint: 'Parmağınızı (ya da fare düğmesini) sağ kenardaki düğmenin üzerinde basılı tutun.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'Gerçek bir telefonda yalnızca konuşurdunuz. Burada <strong>"Saat 3\'te Sarah\'yı aramamı hatırlat"a dokunun</strong>.', hints: {'say-joke': 'Önce anımsatıcıyı deneyin.', 'say-weather': 'Önce anımsatıcıyı deneyin.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Tamam: saat 3\'te bir anımsatıcı çıkar. Şimdi <strong>hava durumunu sorun</strong>.', hints: {'say-remind': 'Ayarlandı. Şimdi hava durumunu sorun.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Bunlardan hangisini telefonunuza sorabilirsiniz?', options: [
            {t: 'Hepsini: "Sarah\'yı ara", "10 dakikalık zamanlayıcı kur", "Feneri aç", "Mesajlarımı oku"', ok: true, why: 'Evet. Elleriniz doluyken, gözleriniz yorulduğunda ya da yazmak zor geldiğinde kullanışlıdır.'},
            {t: 'Yalnızca hava durumunu', why: 'Çok şey yapabilir: aramalar, zamanlayıcılar, fener, mesaj okuma, alarmlar ve daha fazlası.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Tebrikler!</strong> Bir insanla konuşur gibi net ve doğal konuşun. Yanlış anlarsa yeniden sorun.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Metin'], ['lens-translate', 'Çevir'], ['lens-search', 'Ara']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Menü' : 'Carte'}</strong><span>${ctx.translated ? 'Balık çorbası' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Mantarlı tavuk' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Elmalı turta' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Muayenehanesi</strong><span>Grip aşınızın zamanı geldi.</span><span>Randevu için arayın: ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Canlı Metin' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Kameranız yazıları okuyabilir. Bir mektuptan telefon numarası kopyalayalım. <strong>Kamera\'yı açın.</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Mektuba doğrultun. Yazıyı fark ettiğinde küçük bir <strong>metin düğmesi ⟦scan-text⟧</strong> belirir. <strong>Ona dokunun.</strong>' : 'Mektuba doğrultun ve <strong>Lens düğmesine ◎ dokunun</strong>.',
         hints: {shutter: 'Bu normal bir fotoğraf çeker. Dokunun: ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'Lens düğmesi ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Yazı artık gerçek metin. <strong>Telefon numarasına dokunun.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: 'Bir mesaja ya da kişilerinize yapıştırmaya hazır olması için <strong>Kopyala\'ya dokunun</strong>. <em>(Ara, numarayı hemen arardı.)</em>', hints: {'call-num': 'Bu numarayı arar. Bu alıştırma için Kopyala\'ya dokunun.'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'Tatilde misiniz? Şimdi Fransızca bir menüye doğrultuyor. ' + (p === 'ios' ? 'Çeviri uygulaması ya da Google uygulamasının Lens\'i bunu yapabilir. ' : '') + '<strong>Çevir\'e dokunun.</strong>', hints: {'lens-text': 'Bu Fransızcayı kopyalar. Çevir\'e dokunun.', 'lens-search': 'Çevir\'e dokunun.'}},
        {screen: c => cameraLens(p, c), question: {q: 'Kamera bu şekilde başka ne yapabilir?', options: [
            {t: 'Bitkileri ve kuşları tanımlar, mektupları PDF olarak tarar', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Notlar uygulamasında ataca, sonra Belgeleri Tara\'ya dokunarak mektupları PDF\'ye çevirin.' : 'Google Drive\'da + simgesine, sonra Tara\'ya dokunarak mektupları PDF\'ye çevirin.')},
            {t: 'Yalnızca fotoğraf çeker', why: 'Çok daha fazlasını yapar: bitkileri tanımlar, çevirir, metin kopyalar ve mektupları PDF olarak tarar.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Tebrikler!</strong> Kameranızla bir numara kopyaladınız ve bir menüyü çevirdiniz. ' + (p === 'ios' ? 'Canlı Metin, daha önce çektiğiniz fotoğraflarda da çalışır.' : 'Google Lens, daha önce çektiğiniz fotoğraflarda da çalışır.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Kütüphane e-kitapları', `<p class="cf">Kütüphane kartınızla giriş yapıldı</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">E-kitaplar</button><button type="button" data-tap="tab-audio" class="on">Sesli kitaplar</button></div>
                <div class="aeo">${[['book-1', 'Flamborough\'daki Deniz Feneri', 'A. Whitby', '#0ea5e9'], ['book-2', 'Deniz Kenarında Yazlar', 'J. Marsh', '#f59e0b'], ['book-3', 'Sessiz Bahçe', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? '21 gün içinde iade edilmeli' : '5 kopyadan 3\'ü mevcut'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Kütüphane', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'Ücretsiz bir kütüphane kartıyla telefonunuzda e-kitap ve sesli kitap ödünç alabilirsiniz. East Riding Libraries <strong>BorrowBox</strong> uygulamasını kullanır. Bu bir deneme sürümüdür. <strong>Açın.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Kütüphane kartınızla giriş yaptınız. <strong>Flamborough\'daki Deniz Feneri\'ne dokunun.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Ödünç almak ücretsiz. <strong>Ödünç al\'a dokunun.</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: '21 gün boyunca sizin. <strong>Dinle\'ye dokunun.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Oynat düğmesine ▶ dokunun.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Yatakta mı dinliyorsunuz? <strong>Uyku zamanlayıcısı</strong> bir süre sonra durdurur, böylece yerinizi kaybetmezsiniz. <strong>Uyku zamanlayıcısı\'na dokunun.</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: '21 gün dolunca ne olur?', options: [
            {t: 'Kendiliğinden geri gider. Ceza yok ve bitirmediyseniz yenileyebilirsiniz', ok: true, why: 'Evet. E-kitaplar ve sesli kitaplar kendiliğinden iade edilir.'},
            {t: 'Ceza alırsınız', why: 'Ceza yok. Kendiliğinden iade edilir ve bitirmediyseniz yenileyebilirsiniz.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Tebrikler!</strong> Gerçekten başlamak için eastridinglibraries.co.uk adresinden ya da herhangi bir kütüphaneden üye olun, sonra BorrowBox\'ı indirin ve kartınızla giriş yapın.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road Otoparkı</span><span>Uygulamayla öde: konum <b>4471</b></span></div>
                <p class="cf">Tabeladaki konum numarasını girin</p>${field('parkcode', 'Konum numarası', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Otoparkı bul</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? '£3,20 öde' : 'Süre seçin'}</button>`, {color});
        }
        return app(p, 'Park', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Birçok otopark uygulamayla ödemeye izin verir, böylece bozuk paraya gerek kalmaz. Her belediye farklı uygulamalar kullanır (tabela hangisi olduğunu söyler). Bu bir deneme uygulaması. <strong>Park\'ı açın.</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Tabeladaki konum numarasını yazın: 4471.',
         say: 'Her otoparkın tabelasında bir <strong>konum numarası</strong> vardır. Kutuya <strong>4471 yazın</strong> ve <strong>Otoparkı bul\'a dokunun</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Arabanızın plakası zaten kayıtlı. <strong>2 saat seçin.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'Uygulamayı kullanmak için küçük bir hizmet bedeli var. <strong>£3,20 öde\'ye dokunun.</strong> <em>(Alıştırma: para çekilmez.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Alışverişte geç kalıyorsunuz. Ne yapabilirsiniz?', options: [
            {t: 'Arabaya dönmeden, daha fazla süre eklemek için uygulamada Uzat\'a dokunurum', ok: true, why: 'Evet. Uygulamayla ödemenin büyük artısı bu. Çoğu süreniz dolmadan önce de hatırlatır.'},
            {t: 'Hiçbir şey, ceza alırım', why: 'Çoğu park uygulaması, bulunduğunuz yerden süre eklemek için Uzat\'a dokunmanıza izin verir.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Tebrikler!</strong> Çoğu makine hâlâ kart ya da bozuk para da kabul eder ve birçok uygulama bir numarayı arayarak ya da kısa mesaj göndererek de ödemenize izin verir. Makinedeki QR kodu etiketiyle asla ödeme yapmayın: sahte olabilirler.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>3 Mart 2026'dan beri sözleşmeniz sona erdi. Ücretsiz geçiş yapabilirsiniz. Aylık ücretiniz £24,00. Geçiş yapıp numaranızı korumak için 65075'e PAC yazıp gönderin.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Kısa mesaj', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Hâlâ sözleşmede misiniz, yoksa fazla mı ödüyorsunuz? Ücretsiz tek bir mesaj söyler. <strong>Mesajlar\'ı açın.</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Mesaj kutusuna INFO yazın, sonra gönder\'e dokunun.',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: '<strong>85075</strong> numarasına yeni bir mesaj başlattık. <strong>INFO yazın</strong> ve <strong>gönder\'e dokunun</strong>. Her İngiltere şebekesinde ücretsizdir.'},
        {screen: c => smsTo(p, c), question: {q: 'Yanıt sözleşmenizin bittiğini ve hâlâ ayda £24 ödediğinizi söylüyor. Bu ne anlama geliyor?', options: [
            {t: 'Telefonunuzun parası ödenmiş. Yalnızca SIM\'li bir paket çok daha ucuz olabilir ve numaranızı koruyabilirsiniz', ok: true, why: 'Evet. Geçiş yapıp numaranızı korumak için bir kod almak üzere 65075\'e PAC yazıp gönderin. Gerisini yeni sağlayıcınız yapar.'},
            {t: 'Hiçbir şey, ödemeye devam', why: 'Zaten ödemesini bitirdiğiniz bir telefon için ödüyor olabilirsiniz. Yalnızca SIM\'li bir paket size çok tasarruf sağlayabilir.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Yurt dışı gezileri için bir tasarruf daha: sürpriz ücret alınmaması için veri dolaşımını kapatın. <strong>Ayarlar\'a dokunun.</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Hücresel\'e dokunun.</strong>'},
            {screen: () => list(p, 'Hücresel', [{label: 'Hücresel Veri', toggle: true}, {id: 'options', label: 'Hücresel Veri Seçenekleri', value: 'Dolaşım Açık'}, {label: 'Kişisel Erişim Noktası'}], {back: 'Ayarlar'}), target: 'options', say: '<strong>Hücresel Veri Seçenekleri\'ne dokunun.</strong>'},
            {screen: c => list(p, 'Hücresel Veri Seçenekleri', [{id: 'roam', label: 'Veri Dolaşımı', toggle: !c.roamOff}, {label: 'Ses ve Veri', value: '5G Otomatik'}], {back: 'Hücresel'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Veri Dolaşımı\'nı kapatın.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Ağ ve internet\'e dokunun.</strong>'},
            {screen: () => list(p, 'Ağ ve internet', [{label: 'İnternet', sub: 'Ev Wi-Fi\'si'}, {id: 'sims', label: 'SIM\'ler', sub: 'Şebekeniz'}, {label: 'Uçak modu', toggle: false}]), target: 'sims', say: '<strong>SIM\'ler\'e dokunun.</strong>'},
            {screen: c => list(p, 'SIM\'ler', [{label: 'Mobil veri', toggle: true}, {id: 'roam', label: 'Dolaşım', toggle: !c.roamOff, sub: 'Dolaşımdayken veri hizmetlerine bağlan'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Dolaşımı kapatın.</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Tebrikler!</strong> Yurt dışında WhatsApp, görüntülü aramalar ve haritalar için yine de Wi-Fi kullanabilirsiniz. Mobil veriye ihtiyacınız varsa ve şebekenizin ne kadar ücret aldığını biliyorsanız dolaşımı yeniden açın.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Bul', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Konumunuzu paylaşmak, ailenizin eve sağ salim vardığınızı görmesini sağlar. Seçim sizin ve istediğiniz zaman durdurabilirsiniz. <strong>Bul\'u açın.</strong>'},
        {screen: c => app(p, 'Kişiler', `<p class="cf">Henüz kimse paylaşmıyor.</p><button type="button" class="ce co" data-tap="share">Konumumu Paylaş</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Konumumu Paylaş\'a dokunun.</strong>'},
        {screen: c => app(p, 'Şununla paylaş', '', {color: '#fff', overlay: sheet('Bir kişi seçin', [['pick-sarah', 'Sarah', 'Kızım'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Sarah\'ya dokunun.</strong>', hints: {'pick-dave': 'Bu alıştırma için Sarah\'yı seçin.'}},
        {screen: c => app(p, 'Sarah ile paylaş', '', {color: '#fff', overlay: sheet('Ne kadar süreyle?', [['one-hour', 'Bir Saat Paylaş'], ['day', 'Gün Sonuna Kadar Paylaş'], ['always', 'Süresiz Paylaş']])}),
         target: 'always', say: 'Ne kadar süreyle olacağını seçin. Güvendiğiniz aile için <strong>Süresiz Paylaş\'a dokunun</strong>. İstediğiniz zaman durdurabilirsiniz.', hints: {'one-hour': 'Bu tek bir gezi için kullanışlı. Bu alıştırma için Süresiz Paylaş\'ı seçin.', day: 'Bu alıştırma için Süresiz Paylaş\'ı seçin.'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Konumunuzu paylaşmak, ailenizin eve sağ salim vardığınızı görmesini sağlar. Seçim sizin ve istediğiniz zaman durdurabilirsiniz. <strong>Haritalar\'ı açın.</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: 'Sağ üstteki <strong>profil resminize dokunun</strong>.'},
        {screen: () => app(p, 'Haritalar', '', {color: '#fff', overlay: sheet('', [['sharing', 'Konum paylaşımı'], ['timeline', 'Zaman Çizelgeniz'], ['settings', 'Ayarlar']])}), target: 'sharing', say: '<strong>Konum paylaşımı\'na dokunun.</strong>'},
        {screen: () => app(p, 'Konum paylaşımı', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Yeni paylaşım\'a dokunun.</strong>'},
        {screen: () => app(p, 'Şununla paylaş', '', {color: '#fff', overlay: sheet('Bir kişi seçin', [['pick-sarah', 'Sarah', 'Kızım'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Sarah\'ya dokunun.</strong>', hints: {'pick-dave': 'Bu alıştırma için Sarah\'yı seçin.'}},
        {screen: () => app(p, 'Sarah ile paylaş', '', {color: '#fff', overlay: sheet('Ne kadar süreyle?', [['one-hour', '1 saatliğine'], ['always', 'Siz kapatana kadar']])}),
         target: 'always', say: 'Güvendiğiniz aile için <strong>Siz kapatana kadar\'a dokunun</strong>.', hints: {'one-hour': 'Tek bir gezi için kullanışlı. Bu alıştırma için Siz kapatana kadar\'ı seçin.'}},
    ]).concat([
        {screen: () => app(p, 'Sarah ile paylaşılıyor', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah nerede olduğunuzu görebilir. İstediğiniz zaman ${p === 'ios' ? 'Paylaşımı Durdur\'a dokunun' : 'Durdur\'a dokunun'}.</p>`, {color: '#fff'}),
         question: {q: 'İnternette yeni tanıştığınız biri konumunuzu paylaşmanızı istiyor. Paylaşmalı mısınız?', options: [
            {t: 'Hayır. Yalnızca yakın aile ya da güvendiğiniz arkadaşlarla paylaşın', ok: true, why: 'Aynen öyle. Konumunuz nerede yaşadığınızı ve ne zaman dışarıda olduğunuzu gösterir. Güvendiğiniz kişilerle sınırlı tutun.'},
            {t: 'Evet, hoş görünüyorlar', why: 'Konumunuzu yalnızca yakın aile ve arkadaşlarla paylaşın. Nerede yaşadığınızı ve ne zaman dışarıda olduğunuzu gösterir.'}]}},
        {screen: () => app(p, 'Sarah ile paylaşılıyor', '<p class="cf">Sarah nerede olduğunuzu görebilir.</p>', {color: '#fff'}), done: true,
         say: '<strong>Tebrikler!</strong> Sarah güvende olduğunuzu görebilir. Kiminle paylaştığınızı ara sıra kontrol edin ve paylaşmanız gerekmeyen herkesle paylaşımı durdurun.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Torununuz Leo ilk iPhone\'unu alıyor. <strong>Ekran Süresi</strong> sağlıklı sınırlar koyar. Bu <strong>Leo\'nun</strong> telefonu. <strong>Ayarlar\'a dokunun.</strong>'},
        {screen: c => list(p, 'Ayarlar', [{label: 'Leo', sub: 'Apple Hesabı'}, {label: 'Bildirimler'}, {id: 'screen-time', label: 'Ekran Süresi'}, {label: 'Genel'}], {noBack: true}), target: 'screen-time', say: '<strong>Ekran Süresi\'ne dokunun.</strong>'},
        {screen: c => list(p, 'Ekran Süresi', [{id: 'downtime', label: 'Kapalı Kalma Süresi', sub: c.downtime ? '20:00 – 07:00' : 'Kapalı'}, {label: 'Uygulama Sınırları'}, {id: 'content', label: 'İçerik ve Gizlilik Kısıtlamaları', sub: c.content ? 'Açık' : 'Kapalı'}, {label: 'Ekran Süresi Parolasını Kullan'}], {back: 'Ayarlar'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>Kapalı Kalma Süresi</strong>, geceleri çoğu uygulamayı kilitler (aramalar yine çalışır). Akşam 8\'den sabah 7\'ye kadar açmak için <strong>Kapalı Kalma Süresi\'ne dokunun</strong>.'},
        {screen: c => list(p, 'Ekran Süresi', [{label: 'Kapalı Kalma Süresi', sub: '20:00 – 07:00'}, {label: 'Uygulama Sınırları'}, {id: 'content', label: 'İçerik ve Gizlilik Kısıtlamaları', sub: c.content ? 'Açık' : 'Kapalı'}], {back: 'Ayarlar'}),
         target: 'content', action: c => { c.content = true; }, say: 'Sırada sürpriz satın alımları ve yetişkin içeriğini durdurmak var. <strong>İçerik ve Gizlilik Kısıtlamaları\'na dokunun.</strong>'},
        {screen: c => list(p, 'İçerik ve Gizlilik', [{label: 'İçerik ve Gizlilik Kısıtlamaları', toggle: true}, {id: 'purchases', label: 'App Store Satın Alımları', value: c.noBuy ? 'İzin Verme' : 'İzin Ver'}, {label: 'Web İçeriği', value: 'Yetişkin Web Sitelerini Sınırla'}], {back: 'Ekran Süresi'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Yetişkin web siteleri artık sınırlı. Uygulama içi harcamayı durdurmak için <strong>App Store Satın Alımları\'na dokunun</strong>.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Torununuz Leo ilk Android telefonunu alıyor. Google\'ın ücretsiz <strong>Family Link</strong> uygulaması <strong>sizin</strong> telefonunuzdan sağlıklı sınırlar koyar. <strong>Family Link\'i açın.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Leo\'ya dokunun.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Denetimler'}, {id: 'screen-time', label: 'Ekran süresi', sub: c.downtime ? 'Yatma zamanı 20:00 – 07:00' : 'Sınır yok'}, {id: 'content', label: 'İçerik kısıtlamaları', sub: c.noBuy ? 'Satın alımlar onayınızı gerektirir' : 'Google Play: tümüne izin ver'}, {label: 'Konum', sub: 'Açık'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: 'Telefonun kilitlendiği (aramaların yine çalıştığı) akşam 8\'den sabah 7\'ye kadar bir yatma zamanı belirlemek için <strong>Ekran süresi\'ne dokunun</strong>.'},
        {screen: c => list(p, 'Leo', [{caption: 'Denetimler'}, {label: 'Ekran süresi', sub: 'Yatma zamanı 20:00 – 07:00'}, {id: 'content', label: 'İçerik kısıtlamaları', sub: c.noBuy ? 'Satın alımlar onayınızı gerektirir' : 'Google Play: tümüne izin ver'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Sırada sürpriz harcamaları durdurmak var. Satın alımlar onayınızı gerektirsin diye <strong>İçerik kısıtlamaları\'na dokunun</strong>.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Ekran Süresi' : 'Leo', [{label: p === 'ios' ? 'Kapalı Kalma Süresi' : 'Ekran süresi', sub: '20:00 – 07:00'}, {label: 'Satın alımlar', sub: p === 'ios' ? 'İzin Verme' : 'Onayınız gerekir'}]),
         question: {q: 'Ayarların yanında en önemli şey nedir?', options: [
            {t: 'Onlarla konuşmak: internette onları üzen bir şey olursa size her zaman söyleyebilirler', ok: true, why: 'Evet. Hiçbir ayar her şeyi yakalamaz. Konuşabilecekleri biri olmak en önemlisidir.'},
            {t: 'Ayarlar her şeyi yapar', why: 'Çok yardımcı olurlar, ama hiçbir şey her şeyi yakalamaz. Size her zaman konuşabileceklerini bildiklerinden emin olun.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Ekran Süresi' : 'Leo', [{label: 'Kapalı Kalma Süresi', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Tebrikler!</strong> Leo\'nun bir yatma zamanı var ve sormadan para harcayamaz. ' + (p === 'ios' ? 'Yalnızca sizin değiştirebilmeniz için bir Ekran Süresi parolası belirleyin.' : 'Family Link bunları istediğiniz zaman kendi telefonunuzdan değiştirmenize izin verir.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Dosya Gezgini', mac: 'Finder', linux: 'Dosyalar'},
        settings: {windows: 'Ayarlar', mac: 'Sistem Ayarları', linux: 'Sistem Ayarları'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Yazılım Yöneticisi'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Başlat', mac: 'Uygulamalar', linux: 'Menü'},
        editor: {windows: 'Not Defteri', mac: 'TextEdit', linux: 'Metin Düzenleyici'},
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
        writer: 'LibreOffice Writer', update: 'Güncelleme Yöneticisi', terminal: 'Terminal', trash: 'Çöp Kutusu', apps: 'Uygulamalar', chrome: 'Chrome', shield: 'Windows Güvenliği', fw: 'Güvenlik Duvarı'}[kind]);

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
        windows: {title: 'Geri Dönüşüm Kutusu', empty: 'Geri Dönüşüm Kutusunu Boşalt', confirm: n => `Bu ${n} öğeyi kalıcı olarak silmek istediğinizden emin misiniz?`, items: [
            ['⟦paperclip⟧', 'Office Asistanı (ataç).exe', 'Yazmaya başladığınız her mektupta yardım teklif ederdi. 2007\'de emekli oldu.', ''],
            ['⟦bomb⟧', 'Mayın Tarlası en yüksek skorlar.txt', 'Başlangıç: 999 saniye. Bundan bahsetmiyoruz.', ''],
            ['⟦spade⟧', 'Solitaire kazanan kartlar.gif', 'Bir oyunu kazanırdınız ve kartlar ekranda zıplayarak inerdi. Bana çift tıklayın!', 'cards'],
            ['⟦phone⟧', 'Çevirmeli modem.wav', 'Çıııııt… bong… kssshhh. Siz çevrimiçiyken kimse telefonu kullanamazdı.', ''],
            ['⟦mountain-snow⟧', 'Yeşil tepe duvar kâğıdı.jpg', 'O yuvarlak yeşil tepe ve mavi gökyüzü, 2001\'den beri milyonlarca ekranda.', ''],
            ['⟦save⟧', 'Disket (A:)', '1,44 MB. Kaydet düğmesi hâlâ ona benziyor.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, Vista onu kaldırana kadar Windows ile ücretsizdi.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger dürtme', 'Biri size dürtme gönderdi ve tüm ekranınız sarsıldı. Bana çift tıklayın!', 'shake'],
            ['⟦file-text⟧', 'Belediyeye mektup SON (2) (son).doc', 'Hepimizin bir tane var.', ''],
        ]},
        mac: {title: 'Çöp Kutusu', empty: 'Çöp Kutusunu Boşalt', confirm: () => 'Çöp Kutusu\'ndaki öğeleri kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.', items: [
            ['⟦rainbow⟧', 'Dönen plaj topu', 'Gökkuşağı tekerleği "lütfen bekleyin" demekti… ve beklerdiniz. Bana çift tıklayın!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Şeffaf, yumurta biçimli ve mavi. Her okulda bir tane vardı.', ''],
            ['⟦music⟧', 'Tekerlekli iPod (click wheel)', 'Cebinizde 1.000 şarkı. Başparmağınızla dönüp dönüp durun.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Her açılışta sizi karşılayan küçük gülümseyen bilgisayar.', ''],
            ['⟦bell⟧', 'Açılış sesi', 'Açtığınızda duyulan o büyük akor. Birçok kişi hâlâ özlüyor.', ''],
            ['⟦droplet⟧', 'Aqua düğmeleri', 'O kadar parlak ve maviydiler ki yalanacak kadar güzel görünürlerdi.', ''],
            ['⟦calendar-days⟧', 'Dashboard widget\'ları', 'Kendi katmanlarında bir hesap makinesi, hava durumu ve bir yapışkan not. 2019\'dan beri yok.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Hepimizin CD\'lerimizi yaktığı ve iPod\'larımızı eşzamanladığımız yer.', ''],
        ]},
        linux: {title: 'Çöp Sepeti', empty: 'Çöp Sepetini Boşalt', confirm: () => 'Çöp Sepeti\'ndeki tüm öğeler boşaltılsın mı? Çöp Sepeti\'ndeki tüm öğeler kalıcı olarak silinecek.', items: [
            ['⟦bird⟧', 'Tux penguen (peluş)', '1996\'dan beri Linux maskotu. Sarılmaya çok uygun.', ''],
            ['⟦eye⟧', 'xeyes', 'Fare imlecinizi izleyen bir çift göz. Bana çift tıklayın!', 'eyes'],
            ['⟦app-window⟧', 'Sallanan pencereler', 'Eski masaüstü efektleri, sürüklediğinizde pencereleri jöle gibi sallardı. Bana çift tıklayın!', 'wobble'],
            ['⟦save⟧', 'Kurulum disketleri 1–50', 'İlk Linux\'u kurmak koca bir kutu disket gerektirebilirdi.', ''],
            ['⟦disc⟧', 'Postayla ücretsiz Ubuntu CD\'si', 'Ücretsiz bir Linux CD\'si sipariş edebilirdiniz ve postayla gelirdi.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Yaklaşık 1999\'dan beri her yıl tahmin edildi. Belki bu yıldır?', ''],
            ['⟦leaf⟧', 'Mint adları.txt', 'Her Linux Mint sürümünün Zena, Xia ve Vanessa gibi bir kadın adı vardır.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Eski bir şaka: "sudo" deyin, bilgisayar söyleneni yapar.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Bu klasör boş.' : 'The ' + egg.title + ' boş.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Bir şeye bakmak için çift tıklayın.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Hayır' : 'İptal'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Evet' : 'Boş'}</button></div></div>` : '';
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
        ['Yuvarlak tepe', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Turkuaz 95', '#008080'],
        ['İnce çizgiler', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Gece gökyüzü', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Deniz kenarı', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Tüm Wi-Fi kelime oyunlarının en ünlüsü.'],
        ['The LAN Before Time', 'LAN, "yerel alan ağı" demektir. Bu çok, çok eski.'],
        ['Abraham Linksys', 'Seksen yedi megabit önce…'],
        ['Bill Wi the Science Fi', 'Bilim harika!'],
        ['Drop It Like It\'s Hotspot', 'Birinin telefon erişim noktası, mizah anlayışıyla.'],
        ['Silence of the LANs', 'Çok, çok sessiz bir ağ.'],
        ['Tell My Wi-Fi Love Her', 'Ayy.'],
        ['Get Off My LAN', 'Muhtemelen huysuz bir komşu.'],
        ['Bridlington Seagulls', 'Patateslerinizi zaten aldılar. Şifrenizi de vermeyin.'],
        ['FREE WIFI (honest)', '"Ücretsiz Wi-Fi" adında, tanımadığınız bir ağ tam da katılmamanız gereken türdendir!'],
    ];

    const FORTUNES = ['Bugün fotoğraflarınızı yedeklemek için güzel bir gün.', 'Güçlü bir şifre, mutlu bir şifredir.', 'Bir telefon araması alacaksınız. Bu bir dolandırıcılık olacak. Kapatın.',
        'Kapatıp tekrar açmayı denediniz mi?', 'Güncellemek için en iyi zaman dündü. İkinci en iyi zaman şimdi.', 'Bir fincan çay çoğu şeyi düzeltir. Bilgisayarları değil, ama.',
        'Şifrenizi asla bir yabancıya vermeyin. Ya da bir martıya.', 'Kumandayı bulacaksınız. Kanepenin kenarında.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP adresi: 192.168.1.42<br>Modem: 192.168.1.1<br>Sinyal: −54 dBm (çok iyi)<br>Kanal: 36 (5 GHz)<br>Hız: 866 Mbps<br>Güvenlik: WPA3 Kişisel</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi kapalı. Ağları görmek için açın.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>İnternet yok</strong><br>Wi-Fi'nizi kontrol etmeyi deneyin. Oynamak için <kbd>Boşluk</kbd> tuşuna basın ya da dokunun.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>OYUN BİTTİ · yeniden oynamak için Boşluk'a basın</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Bugün möölediniz mi?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Deneyin: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Möö!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('("ls" yerine "sl" mi yazdınız? Buyurun, bir buharlı tren.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (deneme) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Çalışma süresi: kahvaltıdan beri \\___________/ Bellek: doğum gününü asla unutmaz`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Tamam. 🥪');
        else if (lc === 'make me a sandwich') say('Ne? Kendin yap.');
        else if (/rm\s+-rf/.test(lc)) say('İyi deneme! Bu deneme terminali hiçbir şeyi bozmanıza izin vermez.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: komut bulunamadı ("help" deneyin)`);
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
        else if (note) note.textContent = 'Bu deneme tarayıcısı gerçek internette arama yapmaz. Yazdığınız hiçbir şey hiçbir yere gönderilmez.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, '1 Nisan şakası! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Deneme<sup>®</sup></b><strong>95</strong></div><p>Hile kodu etkinleştirildi! +30 can 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Macintosh\'a Hoş Geldiniz.</p></div><p>Hile kodu etkinleştirildi! +30 can 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Hile kodu etkinleştirildi! +30 can 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Diğer pencereler kaldırıldı.' : 'Aero Shake! (Kaldırılacak başka pencere yoktu.)');
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
                funToast(screen, 'Wi-Fi açık. Home-WiFi-5G\'ye bağlı.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi kapalı.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Yalnızca tanıdığınız ağlara katılın.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, '1 Nisan şakası! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Görünüm'], ['', 'Sırala'], ['refresh', 'Yenile'], ['', 'Yeni'], ['wall', 'Kişiselleştir']]
                : os === 'mac' ? [['', 'Yeni Klasör'], ['', 'Bilgi Al'], ['wall', 'Duvar Kâğıdını Değiştir…'], ['', 'Yığınları Kullan']]
                : [['', 'Yeni Klasör Oluştur'], ['terminal', 'Terminalde Aç'], ['wall', 'Masaüstü Arka Planını Değiştir']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Duvar kâğıdı: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Deneme</strong><small>macOS 27 (deneme sürümü)</small>
                <dl><dt>Çip</dt><dd>Bridlington Silicon B1</dd><dt>Bellek</dt><dd>Doğum gününü asla unutmaz</dd><dt>Başlangıç diski</dt><dd>Deneme HD</dd><dt>Seri numarası</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Not Defteri' : os === 'mac' ? 'TextEdit' : 'Metin Düzenleyici';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Adsız – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Sat 1, Süt 1 &nbsp;|&nbsp; %100 &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Düz metin'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Hoş geldiniz! Bu bir deneme terminali. Neler deneyebileceğinizi görmek için "help" yazın. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Hava Durumu'], ['news', '⟦newspaper⟧', 'Haberler'], ['bus', '⟦bus⟧', 'Otobüs saatleri'], ['recipes', '⟦cake-slice⟧', 'Tarifler']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Bridlington hava durumu</h3><p class="fd">Deneme hava tahmini</p><div class="ajf">${[['Bugün', '⟦cloud-sun⟧', '13°'], ['Cum', '⟦cloud-rain⟧', '11°'], ['Cmt', '⟦wind⟧', '10°'], ['Paz', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Martı hareketliliği: <strong>çok yüksek</strong>. Patateslerinize sahip çıkın.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Deneme Haberleri</h3><ul class="news">
            <li><strong>Yerel bir adam sonunda TV kumandasını buldu</strong>: üç hafta sonra kanepenin kenarında.</li>
            <li><strong>Bir martı 99 Flake ile görüldü</strong>. Dondurmanın sahibi "hiç memnun değil".</li>
            <li><strong>Büyükanne görüntülü aramada torununu yendi</strong>: "Ben sadece yeşil düğmeye bastım."</li>
            <li><strong>Araştırma buldu:</strong> bilgisayar sorunlarının 10'da 9'u kapatıp açarak çözülüyor.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Otobüs saatleri</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Victoria keki</h3><p>200'er gram tereyağı, şeker ve kabartma tozlu un ile 4 yumurtayı karıştırın. İki kalıpta 180°C'de 20–25 dakika pişirin. Reçel ve krema ile doldurun.</p><p class="fd">İpucu: telefonunuza bir zamanlayıcı kurun ya da ona şunu söyleyin: "25 dakikalık zamanlayıcı kur".</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Yeni sekme' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Arayın ya da bir web adresi yazın'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Plajdaki köpek.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Alışveriş listesi.txt'], ['⟦file-text⟧', 'Belediyeye mektup.docx'], ['⟦folder⟧', 'Tarifler'], ['⟦file-spreadsheet⟧', 'Noel kartı listesi.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Belediye vergisi faturası.pdf'], ['⟦file-text⟧', 'Otobüs tarifesi.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Sahil bando takımı.mp3'], ['⟦music⟧', 'Altmışların hitleri.mp3']],
    };
    function funFiles(screen, os, folder = 'Resimler', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Geri Dönüşüm Kutusu' : os === 'mac' ? 'Çöp Kutusu' : 'Çöp Sepeti'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Plajdaki köpek.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Home-WiFi-5G\'ye bağlı' : 'Wi-Fi kapalı.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Kişiselleştirme' : os === 'mac' ? 'Duvar kâğıdı' : 'Arka planlar'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows Update' : os === 'mac' ? 'Yazılım Güncelleme' : 'Güncellemeler'}</h3><p class="mj">⟦check⟧ Güncelsiniz</p><p class="cf">Son kontrol: bugün, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Güncellemeleri denetle</button><p class="zi"></p>`,
            about: `<h3>Hakkında</h3><div class="zk"><div><span>Cihaz adı</span><b>MARGARET-PRACTICE</b></div><div><span>Sistem</span><b>${os === 'windows' ? 'Windows 11 (deneme)' : os === 'mac' ? 'macOS 27 (deneme)' : 'Linux Mint 22.3 (deneme)'}</b></div>
                <div><span>İşlemci</span><b>Bridlington Silicon B1</b></div><div><span>Bellek</span><b>Doğum gününü asla unutmaz</b></div><div><span>Depolama</span><b>Torunların fotoğrafları için bolca yer</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Kişiselleştirme' : os === 'mac' ? 'Duvar kâğıdı' : 'Arka planlar'], ['update', 'Güncellemeler'], ['about', 'Hakkında']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Deneme Mayınları', 'Klasik mayın avı oyunu.'], ['solitaire', '⟦spade⟧', 'Patience', 'Yakında bu deneme mağazasında.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Yakında bu deneme mağazasında.'], ['weather', '⟦cloud-sun⟧', 'Hava Durumu', 'Yakında bu deneme mağazasında.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Aç' : (os === 'mac' ? 'Al' : 'Yükle')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Deneme Mayınları', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Kazmak için tıklayın. Bayrak dikmek için sağ tıklayın (ya da basılı tutun).</p></div>`, 'bz'));
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
        ['Anne', 'Bunu nasıl kapatırım?', 'Merhaba canım, bu e-postayı yazdım ama kapatma düğmesini bulamıyorum. Yuvarlak olan mı? Sevgiler, Annen xx Not: Ona bastım. Hiçbir şey olmadı. Normal mi?'],
        ['Bridlington Yürüyüş Grubu', 'Cumartesi yürüyüşü', 'Saat 10\'da limanda buluşuyoruz. Termos ve su geçirmez bir mont getirin. Geçen haftaki martı olayı konuşulmayacak.'],
        ['Prens Abu (Çok Zengin)', 'ACİL: £4.000.000 kazandınız!!!', 'Sevgili Dostum, ben bir prensim ve sana dört milyon sterlin göndermek için banka bilgilerine ihtiyacım var. Lütfen posta pulu için £50 de gönder. — Bu bir dolandırıcılık! Gerçek insanlar e-postayla milyonlar dağıtmaz. Silin ya da report@phishing.gov.uk adresine iletin.'],
        ['Sarah', 'Pazar günkü fotoğraflar 🌻', 'İşte bahçeden fotoğraflar. Köpek bir ayçiçeği daha yedi.'],
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
        if (what === 'power') { funToast(screen, 'Bu bir deneme bilgisayarı, bu yüzden kapatılamaz 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'İndirilenler', '⟦triangle-alert⟧ "Ücretsiz temizleyici" programları çoğu zaman çöp ya da daha kötüsüdür. Açmayın, silmek en iyisi!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `Gerçek bir bilgisayarda "${n}" burada açılırdı.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi açık.' : 'Wi-Fi kapalı.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Güncellemeler denetleniyor…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Yeni güncelleme yok. Her şey hazır!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Bu, deneme mağazasında yalnızca gösteri amaçlı.'); return true; }
            el.textContent = 'Yükleniyor…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Aç'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Adsız 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Dosya Düzen Görünüm Ekle Biçim <b>B</b> <i>İ</i> <u>A</u></div><textarea class="vk agd" aria-label="Document">Sayın Yetkili, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Güncelleme Yöneticisi', '<div class="ajz"><p class="mj">⟦check⟧ Sisteminiz güncel</p><p class="cf">Linux Mint güncellemeleri kendiliğinden denetler ve güncelleme olduğunda kalkanın üzerinde bir nokta gösterir.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Aramak için buraya yazın</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Geri Dönüşüm Kutusu', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Bilgisayar', '⟦monitor⟧')}${icon('Ev', '⟦house⟧')}${icon('Çöp Sepeti', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Uygulama, ayar ve belge ara')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Ara')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Aramak için yazın…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Yeni sekme <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Arayın ya da bir web adresi yazın</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Burası <strong>masaüstü</strong>. Alttaki çubuk <strong>görev çubuğu</strong>. Web tarayıcısını Başlat menüsünden açın: <strong>Başlat\'a tıklayın</strong>, dört kare.'
            : os === 'mac' ? 'Burası <strong>masaüstü</strong>. Alttaki uygulama sırası <strong>Dock</strong>, üstteki çubuk ise <strong>menü çubuğu</strong>. Tüm uygulamalarınızı görmek için <strong>Uygulamalar\'a tıklayın</strong> (kareli ızgara).'
            : 'Burası Linux Mint\'te <strong>masaüstü</strong>. Alttaki çubuk <strong>panel</strong>. Uygulamalarınız Menü\'dedir: sol alttaki <strong>Menü\'ye tıklayın</strong>.',
         hint: os === 'mac' ? 'Uygulamalar alttaki Dock\'ta, Finder\'ın yanında.' : (os === 'windows' ? 'Başlat, görev çubuğundaki dört mavi karedir.' : 'Menü düğmesi alt panelin en solundadır.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `Web tarayıcısı olan <strong>${N.browser[os]} öğesine tıklayın</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Her pencerenin <strong>sol üstünde</strong> üç renkli düğme vardır. Sarı olan pencereyi bir kenara kaldırır. <strong>Sarı düğmeye tıklayın.</strong>'
            : 'Her pencerenin <strong>sağ üstünde</strong> üç düğme vardır. <strong>—</strong> çizgisi pencereyi bir kenara kaldırır (küçültür). <strong>— düğmesine tıklayın</strong>.',
         hints: {'win-close': 'Bu onu kapatır. Önce şununla kaldırın: ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Bu ekranı kaplatır. Önce pencereyi kaldırın.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Gizli, kapalı değil. ${os === 'mac' ? 'Dock\'taki simgesinin altındaki nokta' : 'line under its icon'} hâlâ açık olduğunu gösterir. Geri getirmek için <strong>${N.browser[os]} simgesine tıklayın</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Şimdi ekranı kaplamasını sağlayın: <strong>${os === 'mac' ? 'green' : '▢'} düğmesine tıklayın</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'Mac\'te kırmızı düğme pencereyi kapatır. Ama uygulama çalışmaya devam edebilir. Ondan tamamen nasıl çıkarsınız?', options: [
                {t: '⟦command⟧ Cmd + Q\'ya basın ya da üstteki uygulama menüsünden Çık\'ı seçin', ok: true, why: 'Evet. Dock\'ta bir uygulamanın altındaki nokta hâlâ çalıştığı anlamına gelir. ⟦command⟧ Cmd + Q ondan çıkar.'},
                {t: 'Kırmızı düğmeye iki kez tıklayın', why: 'Kırmızı düğme yalnızca pencereleri kapatır. ⟦command⟧ Cmd + Q (ya da uygulama menüsü > Çık) uygulamadan çıkar.'}]}
            : {q: 'Bir pencerede kapatma düğmesi nerededir?', options: [
                {t: 'Sağ üstte: ⟦x⟧', ok: true, why: 'Evet. Windows\'ta ve Linux Mint\'te üç düğme sağ üsttedir. (Mac\'te sol üsttedir, kırmızı, sarı ve yeşil.)'},
                {t: 'Sol altta', why: 'Her pencerenin sağ üstündedir: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Tebrikler!</strong> Pencereleri açabilir, gizleyebilir, geri getirebilir, büyütebilir ve kapatabilirsiniz. Bilgisayar kullanmanın büyük kısmı budur.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Ev' : 'Ev'], ['desktop', 'Masaüstü'], ['documents', 'Belgeler'], ['downloads', 'İndirilenler'], ['pictures', 'Resimler']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB bellek']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Belgeler'], ['pictures', '⟦folder⟧', 'Resimler'], ['downloads', '⟦folder⟧', 'İndirilenler']],
            downloads: [['photo', '⟦image⟧', 'Tatil fotoğrafı.jpg'], ['bill', '⟦file-text⟧', 'Belediye vergisi faturası.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Tatil fotoğrafı.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Tatiller')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Belediyeye mektup.docx'], ['recipes', '⟦folder⟧', 'Tarifler']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Belgeler']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Yeni klasör', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Ev' : 'Ev', downloads: 'İndirilenler', pictures: 'Resimler', documents: 'Belgeler', usb: 'USB bellek', desktop: 'Masaüstü'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Bu klasör boş</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Kopyala' : 'Kopyala';
    const pasteLabel = os => os === 'mac' ? 'Öğeyi Yapıştır' : 'Yapıştır';
    const newFolderLabel = os => os === 'mac' ? 'Yeni Klasör' : os === 'windows' ? 'Yeni > Klasör' : 'Yeni Klasör Oluştur';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Fotoğraflarınız ve mektuplarınız <strong>klasörlerde</strong> tutulur. Bunlara bakmak için <strong>${N.files[os]} öğesine tıklayın</strong>.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'Dock\'un solunda' : 'şurada: ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Kenarda ana klasörleriniz var. E-postalardan ve web sitelerinden indirdikleriniz <strong>İndirilenler</strong>\'e gider. <strong>İndirilenler\'e tıklayın.</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Aç'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Yeniden adlandır'], ['menu-delete', os === 'mac' ? 'Çöp Kutusuna Taşı' : 'Sil']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Tatil fotoğrafını ait olduğu yere, Resimler\'e kopyalayalım. <strong>Tatil fotoğrafı.jpg</strong> üzerinde <strong>sağ tıklayın</strong>: farenin <strong>sağ</strong> düğmesine basın. <em>' + (os === 'mac' ? 'İzleme dörtgeninde iki parmakla tıklayın.' : 'Dokunmatik ekranda basılı tutun.') + '</em>',
         hint: 'Fotoğrafın üzerinde farenin sağ düğmesini kullanın.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `Bir menü belirir. <strong>${copyLabel(os)} öğesine tıklayın.</strong> <em>(Kısayol ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'O değil! Kopyala\'ya tıklayın.', 'menu-open': 'O fotoğrafı açar. Kopyala\'ya tıklayın.', 'menu-rename': 'Kopyala\'ya tıklayın.'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: 'Solda <strong>Resimler\'e tıklayın</strong>.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: 'Resimler boş. <strong>Boş beyaz alana sağ tıklayın.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>${pasteLabel(os)} öğesine tıklayın.</strong> <em>(Ya da ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Sırada klasör oluşturmak var. Önce şuna tıklayın: ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Fotoğraf artık Resimler\'de de var. Şimdi tatil fotoğraflarını bir arada tutmak için bir klasör oluşturun. <strong>Boş alana yeniden sağ tıklayın.</strong>', hints: {'rc-photo2': 'Fotoğrafa değil, boş alana sağ tıklayın.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>${newFolderLabel(os)} öğesine tıklayın.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Önce klasör için Tatiller gibi bir ad yazın.',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Tatiller</strong> gibi <strong>bir ad yazın</strong>, sonra <strong>Tamam\'a tıklayın</strong> (ya da Enter\'a basın).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'E-postalardan ve web sitelerinden gelen dosyalar genellikle nereye gider?', options: [
            {t: 'İndirilenler klasörüne', ok: true, why: 'Evet. İndirdiğiniz bir şeyi bulamıyorsanız önce İndirilenler\'e bakın.'},
            {t: 'Masaüstüne', why: 'Genellikle İndirilenler\'e. Bir şey bulamıyorsanız önce oraya bakın.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Tebrikler!</strong> Sağ tık çoğu işin sırrıdır: kopyala, yapıştır, yeniden adlandır ve yeni klasör hepsi o menüdedir.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Ağ şifresini girin</p>${field('wifipass', 'Şifre', ctx)}<button type="button" class="ce co" data-tap="connect">Bağlan</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi ağları'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Home-WiFi-5G\'ye bağlı</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Wi-Fi'ye bağlanmak için <strong>Wi-Fi simgesine tıklayın</strong> (${os === 'mac' ? 'ekranın sağ üst köşesinde' : 'sağ altta, saatin yanında'}).`, hint: os === 'mac' ? 'Sağ üstteki menü çubuğunda.' : 'Sağ altta, saatin yanında.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Ağınızın adı modeminizin üzerindeki etikette yazar. Bu deneme ağı <strong>Home-WiFi-5G</strong>. <strong>Ona tıklayın.</strong>', hints: {'net-neighbour': 'O komşunuzun! Home-WiFi-5G\'yi seçin.', 'net-cafe': 'Bu sizin ev ağınız değil. Home-WiFi-5G\'yi seçin.', 'tray-wifi': 'Wi-Fi ağları listesi zaten açık. Home-WiFi-5G\'ye tıklayın.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Şifreyi aynen yazın: Green-Apple-42 (büyük G ve A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Şifreyi etiketteki gibi <strong>aynen</strong> yazın: <strong>Green-Apple-42</strong>. Sonra <strong>Bağlan\'a tıklayın</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Wi-Fi paneli zaten açık. Şifreyi kutuya yazın, sonra Bağlan\'a tıklayın.'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Ücretsiz Wi-Fi olan bir kafedesiniz. İnternet bankacılığı için uygun mu?', options: [
            {t: 'Eve gelene kadar beklemek ya da telefonunuzun mobil verisini kullanmak daha iyi', ok: true, why: 'Evet. Ücretsiz Wi-Fi gezinmek için uygundur, ama bankacılık için ev Wi-Fi\'nizi ya da mobil veriyi kullanın.'},
            {t: 'Evet, her Wi-Fi uygundur', why: 'Ücretsiz herkese açık Wi-Fi gezinmek için uygundur, ama bankacılığı evde ya da mobil veriyle yapın.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Tebrikler!</strong> Bilgisayarınız şifreyi hatırlayacak ve bir dahaki sefere kendiliğinden bağlanacak.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Alışveriş listesi: süt, ekmek, yumurta, poşet çay, Jean için doğum günü kartı';
        const note = pcWin(os, `Alışveriş listesi – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Sarah\'ya yeni e-posta', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Yazmak için buraya tıklayın…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Mail' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Klavye kısayolları çok tıklamadan kurtarır. <strong>${CMDL(os)}</strong> tuşu: ${os === 'mac' ? 'boşluk çubuğunun iki yanındadır, üzerinde ⟦command⟧ yazar' : 'klavyenin sol altındadır'}. Tüm yazıyı seçmek için <strong>${CMDL(os)}</strong> tuşunu basılı tutun ve <strong>A</strong>'ya basın. <em>Gerçek klavyenizi ya da ekrandaki düğmeleri kullanın.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Seçildi. Şimdi kopyalayın: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Kopyalandı! "Yazmak için buraya tıklayın" yazan yere, Sarah\'ya e-postanın <strong>içine tıklayın</strong>.'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Şimdi yapıştırın: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Hoppala, yanlışlıkla bir şey sildiniz. Hangi kısayol bunu geri alır?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Evet. ${CMDL(os)} + Z, hemen her uygulamada yaptığınız son şeyi geri alır. Daha fazlasını geri almak için tekrar basın.`},
            {t: 'Escape', why: `Escape menüleri kapatır. ${CMDL(os)} + Z geri almadır.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Ekran görüntüsünü (ekranın bir resmini) nasıl alırsınız?', options: [
            {t: os === 'windows' ? 'Windows tuşu + Shift + S, sonra istediğiniz alanı sürükleyin' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, sonra istediğiniz alanı sürükleyin' : 'Print Screen tuşuna (PrtSc) basın', ok: true,
             why: os === 'windows' ? 'Evet. Kopyalanır ve bir bildirim kaydetmenizi sağlar. Print Screen tuşu da işe yarar.' : os === 'mac' ? 'Evet. Resim masaüstünüze kaydedilir. Shift + ⟦command⟧ Cmd + 3 tüm ekranı çeker.' : 'Evet. Linux Mint onu Resimler klasörünüze kaydeder. Shift + Print Screen bir alan seçmenizi sağlar.'},
            {t: 'Telefonunuzla ekranın fotoğrafını çekin', why: 'Bu işe yarar, ama ekran görüntüsü çok daha net. ' + (os === 'windows' ? 'Windows tuşu + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Print Screen\'e basın.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Tebrikler!</strong> Büyük dörtlü: <strong>${CMDL(os)} + C</strong> kopyala, <strong>V</strong> yapıştır, <strong>Z</strong> geri al, <strong>A</strong> tümünü seç. Hemen her uygulamada çalışırlar.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Ücretsiz', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Ücretsiz · Uygulama içi satın alımlar', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Uygulama ara</span></button><div class="hp"><span>ÖNE ÇIKAN</span><strong>Yeni bilgisayarınız için uygulamalar</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Aç' : (os === 'mac' ? 'Al' : 'Yükle')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">LibreOffice yükleniyor…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Deneme mağazası: adlar ve fiyatlar örnektir.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Uygulama almanın en güvenli yeri yerleşik mağazadır: <strong>${N.store[os]}</strong>. <strong>Ona tıklayın.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Word gibi mektup yazabileceğiniz bir şey istiyorsunuz. <strong>Arama kutusuna tıklayın.</strong> "office" araması yapacağız.'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong>, <strong>The Document Foundation</strong> tarafından yapılan, Microsoft Office\'e ücretsiz bir alternatiftir. Kimin yaptığına bakın, sonra <strong>şu düğmeye tıklayın: ' + (os === 'mac' ? 'Al' : 'Yükle') + ' (LibreOffice\'in yanındaki)</strong>.',
         hints: {'get-fake1': 'Bu bir reklam ve yılda £29,99 ücret alıyor. LibreOffice ücretsizdir.', 'get-fake2': 'Bu AppMakers\'ın ve uygulama içi satın alımları var. The Document Foundation\'ın LibreOffice\'ini seçin.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Bir web sitesi açılır penceresi "Bilgisayarınız yavaş! Speed Booster\'ı şimdi indirin" diyor. Ne yaparsınız?', options: [
            {t: 'Kapatırım. Uygulamaları yalnızca mağazadan ya da yapımcının kendi web sitesinden yüklerim', ok: true, why: 'Aynen öyle. "Hızlandırıcı" ya da "temizleyici" öneren açılır pencereler çoğu zaman çöp ya da daha kötüsüdür.'},
            {t: 'İndiririm, işe yarayabilir', why: 'Bunlar çoğu zaman çöp ya da zararlıdır. Yalnızca mağazadan ya da yapımcının kendi web sitesinden yükleyin.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Tebrikler!</strong> LibreOffice yüklendi. Yapımcıyı kontrol edin, reklamları yok sayın ve sonradan para isteyen "ücretsiz" uygulamalara karşı dikkatli olun.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Ev'], ['system', 'Sistem'], ['bluetooth', 'Bluetooth ve cihazlar'], ['network', 'Ağ ve internet'], ['accounts', 'Hesaplar'], ['privacy', 'Gizlilik ve güvenlik'], ['update', 'Windows Update']];
            const pages = {
                home: '<h3>Giriş</h3><p class="cf">Önerilen ayarlar ve hesabınız.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Güncelsiniz</p>' : ctx.ready ? `<p class="cf">Güncellemelerin yüklenmesini bitirmek için yeniden başlatma gerekiyor.</p><button type="button" class="ce co bz" data-tap="restart">Şimdi yeniden başlat</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'İndiriliyor… %45' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Ayarlar', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Genel'], ['privacy', 'Gizlilik ve Güvenlik'], ['users', 'Kullanıcılar ve Gruplar']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ Mac\'iniz güncel</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'İndiriliyor… yaklaşık 10 dakika kaldı' : 'Güvenlik ve hata düzeltmeleri'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Gizlilik ve Güvenlik</h3><p class="cf"><strong>Güvenlik</strong><br>Uygulamalara şuradan izin ver:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store ve Bilinen Geliştiriciler</button>`,
            };
            return pcWin(os, 'Sistem Ayarları', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Sistem Ayarları</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Güncelleme Yöneticisi', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Sisteminiz güncel</p>' : `<div class="ahf">${['Firefox web tarayıcısı', 'Linux çekirdeği (güvenlik)', 'LibreOffice', 'Sistem kitaplıkları'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Güncellemeler yükleniyor…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Kimlik doğrulama gerekli</strong></p><p class="fd">Güncellemeleri yüklemek için şifrenizi girin. (Alıştırma: sizin yerinize girildi.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">İptal</button><button type="button" class="adg" data-tap="auth-ok">Kimlik Doğrula</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Güncellemeler dolandırıcıların kullandığı güvenlik açıklarını kapatır. Hadi bakalım. <strong>Başlat\'a tıklayın.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Ayarlar\'a tıklayın</strong> (dişli).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: 'Soldaki listenin altındaki <strong>Windows Update\'e tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Güncellemeler bekliyor. <strong>Tümünü indir ve yükle\'ye tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Önce üzerinde çalıştığınız her şeyi kaydedin, sonra <strong>Şimdi yeniden başlat\'a tıklayın</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Güncellemeler dolandırıcıların kullandığı güvenlik açıklarını kapatır. Sol üstteki <strong>Apple menüsüne tıklayın</strong> (logo).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Sistem Ayarları…\'na tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Genel\'desiniz. <strong>Yazılım Güncelleme\'ye tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Bir güncelleme hazır. Şarj aletinizi takın, sonra <strong>Şimdi Güncelle\'ye tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac\'iniz onu indirir, sonra yüklemek için yeniden başlar.',
         question: {q: 'Otomatik güncellemeler açık. Yine de bir şey yapmanız gerekir mi?', options: [
            {t: 'Yalnızca istediğinde yeniden başlatın ve ara sıra gece boyunca şarjda bırakın', ok: true, why: 'Evet. Güncellemeler çoğu zaman gece yüklenir. İstendiğinde yeniden başlatmak onları tamamlar.'},
            {t: 'Otomatik güncellemeleri kapatın', why: 'Açık tutun: sizi güvende tutarlar. Mac\'iniz istediğinde yeniden başlatmanız yeterli.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Güncellemeler güvenlik açıklarını kapatır. Linux Mint\'te saatin yanındaki <strong>kalkan</strong>, güncellemeler beklediğinde bir nokta gösterir. <strong>Kalkana tıklayın.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Güncelleme Yöneticisi hepsini listeler. <strong>Güncellemeleri Yükle\'ye tıklayın.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux önemli bir şeyi değiştirmeden önce <strong>şifrenizi</strong> ister. Bu iyi bir şey. <strong>Kimlik Doğrula\'ya tıklayın.</strong>', hints: {'auth-cancel': 'Bu güncellemeleri iptal eder. Kimlik Doğrula\'ya tıklayın.'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Güncellemeleri ne sıklıkla yüklemelisiniz?', options: [
            {t: 'Kalkan nokta gösterdiğinde: bir dakika sürer', ok: true, why: 'Evet. Linux Mint, bazı güvenlik güncellemeleri dışında nadiren yeniden başlatma gerektirir.'},
            {t: 'Yılda bir', why: 'Kalkan nokta gösterdiğinde yükleyin. Bir dakika sürer.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Tebrikler!</strong> Bilgisayarınız güncel. Güncel tutmak, güvende kalmak için yapabileceğiniz tek en iyi şeydir.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Sistem', 'Ekran, ses, hakkında'], ['tile-devices', '⟦printer⟧', 'Cihazlar', 'Bluetooth, yazıcılar'], ['tile-network', '⟦globe⟧', 'Ağ ve İnternet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Hesaplar', 'Hesaplarınız'], ['tile-update', '⟦refresh-cw⟧', 'Güncelleştirme ve Güvenlik', 'Windows Update']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Bilgisayarınız Extended Security Updates\'e kayıtlı</p><p class="cf">12 Ekim 2027\'ye kadar güvenlik güncellemeleri.</p>' : `<div class="ahg"><strong>Windows 10 desteği sona erdi</strong><p>Bilgisayarınız Windows 11'i çalıştırma gereksinimlerini karşılamıyor. Güvenlik güncellemeleri almaya devam etmek için Extended Security Updates'e kaydolun.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Şimdi kaydol</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="cf">Nasıl kaydolacağınızı seçin:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Bilgisayar ayarlarınızı yedekleyin</strong><small>Ücretsiz, bir Microsoft hesabıyla</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>1.000 Microsoft Rewards puanı kullanın</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Tek seferlik satın alma</strong><small>Ücretli</small></button>${ctx.busy ? '<p class="cf">Kaydediliyor…</p>' : ''}`;
        return pcWin('windows', 'Ayarlar', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Bilgisayarınız böyle görünüyorsa, Başlat en solda, <strong>Windows 10</strong> olabilir. Hadi bakalım. <strong>Başlat\'a tıklayın.</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Ayarlar\'a tıklayın</strong> (dişli).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Sistem\'e tıklayın.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Windows 10 Home yazıyor. 2026\'da bu ne anlama geliyor?', options: [
            {t: 'Microsoft normal desteği Ekim 2025\'te bitirdi. Hâlâ çalışıyor ama güvende kalmak için Extended Security Updates gerekiyor', ok: true,
             why: 'Evet. Ev kullanıcıları için ücretsiz Extended Security Updates programı şimdi 12 Ekim 2027\'ye kadar sürüyor. Bundan sonra Windows 10 artık güvenlik düzeltmesi almayacak.'},
            {t: 'Hiçbir şey, Windows 10 sonsuza dek güncellenecek', why: 'Normal destek Ekim 2025\'te sona erdi. Extended Security Updates şimdi 12 Ekim 2027\'ye kadar sürüyor, sonra duruyor.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: 'Geri dönmek için <strong>← Giriş\'e tıklayın</strong>.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Güncelleştirme ve Güvenlik\'e tıklayın.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Bu dizüstü bilgisayar Windows 11 için çok eski, bu yüzden Windows <strong>Extended Security Updates</strong> sunuyor. <strong>Şimdi kaydol\'a tıklayın.</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Ücretsiz yol, ayarlarınızı bir Microsoft hesabına yedeklemektir. <strong>Bilgisayar ayarlarınızı yedekleyin\'e tıklayın.</strong>', hints: {'esu-buy': 'Ödemeniz gerekmez. Ücretsiz yedekleme seçeneğini seçin.', 'esu-points': 'Puanlarınız varsa bu da olur, ama yedekleme seçeneği herkes için ücretsiz.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Ekim 2027\'den önce seçenekleriniz neler?', options: [
            {t: 'Yapabiliyorsa Windows 11\'e yükseltmek, yeni bir bilgisayar almak ya da eskisini Linux Mint\'e (ücretsiz) geçirmek', ok: true, why: 'Evet. Linux Mint ücretsizdir ve eski dizüstü bilgisayarlarda iyi çalışır. Sonraki dersler her şeyin Mac\'te ve Linux Mint\'te nerede olduğunu gösteriyor.'},
            {t: '2027\'den sonra Windows 10\'u bankacılık için kullanmaya devam etmek', why: 'Ekim 2027\'den sonra güvenlik düzeltmesi almaz, bu yüzden bankacılık için güvenli değildir. Yükseltin, değiştirin ya da Linux Mint\'e geçin.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Tebrikler!</strong> Hangi Windows\'a sahip olduğunuzu ve Ekim 2027\'ye kadar nasıl güvende tutacağınızı biliyorsunuz. Ücret karşılığında sizi "yükseltmeyi" öneren aramalara ya da açılır pencerelere dikkat edin: bunlar dolandırıcılıktır.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Windows\'tan mı geçiyorsunuz? Mac\'te uygulamalar alttaki <strong>Dock</strong>\'ta, her uygulamanın menüleri üstteki <strong>menü çubuğunda</strong> bulunur. Dock\'ta web tarayıcısı olan <strong>Safari\'ye tıklayın</strong>.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Mac\'te pencere düğmeleri <strong>sol üsttedir</strong>. Pencereyi kapatmak için <strong>kırmızı olana tıklayın</strong>.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Pencere gitti, ama Dock\'ta <strong>Safari\'nin altındaki noktayı</strong> görüyor musunuz? Hâlâ çalışıyor. Ondan çıkmak için <strong>Dock\'ta Safari\'ye sağ tıklayın</strong> (izleme dörtgeninde iki parmakla).', hint: 'Dock\'taki Safari simgesine sağ tıklayın (ya da iki parmakla tıklayın).',
         hints: {'app-browser': 'Normal bir tıklama onu yeniden açar. Bunun yerine sağ tıklayın.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Çık\'a tıklayın.</strong> <em>(Kısayol ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Ayarlar, sol üstteki <strong>Apple menüsünün</strong> (logo) altındadır. <strong>Ona tıklayın.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Kapat ve Yeniden Başlat da burada. <strong>Sistem Ayarları…\'na tıklayın.</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'Windows\'ta Ctrl + C ile kopyalarsınız. Mac\'te nedir?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Evet. Çoğu Windows kısayolu Mac\'te Ctrl yerine ⟦command⟧ Cmd kullanır: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, aynısı', why: 'Mac\'te ⟦command⟧ Cmd + C\'dir. Çoğu Ctrl kısayolu ⟦command⟧ Cmd olur.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Tebrikler!</strong> Altta Dock, üstte menüler, sol üstte pencere düğmeleri, Ctrl yerine ⟦command⟧ Cmd ve ayarlar ile kapatma için Apple menüsü.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong>, Windows\'a çok benzer çalışan ve eski bilgisayarlarda iyi çalışan ücretsiz bir sistemdir. Uygulamalarınız, Başlat düğmesi gibi sol alttaki <strong>Menü</strong>\'dedir. <strong>Menü\'ye tıklayın.</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint, ücretsiz uygulamalarla birlikte gelir. Mektuplar için Microsoft Word gibi çalışan <strong>LibreOffice Writer</strong>\'ı kullanın. <strong>Ona tıklayın.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Adsız 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Dosya Düzen Görünüm Ekle Biçim <b>B</b> <i>İ</i> <u>A</u></div><div class="vk">Sayın Yetkili,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'İnsanların e-postayla gönderdiği Word belgelerini açabilir misiniz?', options: [
            {t: 'Evet. LibreOffice Word (.docx) dosyalarını açar ve kaydeder', ok: true, why: 'Evet. Bir Word kullanıcısına göndermek için kaydederken Farklı Kaydet\'te Word biçimini (.docx) seçin.'},
            {t: 'Hayır, bunun için Windows gerekir', why: 'LibreOffice Word (.docx) dosyalarını açar ve kaydeder, böylece Word kullanıcılarıyla belge alışverişi yapabilirsiniz.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Adsız 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Sayın Yetkili,</div></div>', {max: true})}),
         target: 'win-close', say: 'Pencere düğmeleri tıpkı Windows\'taki gibi sağ üsttedir. Writer\'ı kapatmak için <strong>⟦x⟧ öğesine tıklayın</strong>.'},
        {screen: () => desk('linux'), target: 'start', say: 'Şimdi daha fazla uygulamayı nereden alacağımızı bulalım. <strong>Menü\'ye</strong> yeniden tıklayın.'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Yazılım Yöneticisi</strong>, Linux Mint\'in ücretsiz uygulama mağazasıdır. <strong>Ona tıklayın.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Yazılım Yöneticisi', `<div class="jo"><div class="gq">${ICON.search}<span>Ara</span></div>
            <div class="aan">${['İnternet', 'Ofis', 'Grafik', 'Ses ve video', 'Oyunlar', 'Erişilebilirlik'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Linux Mint tarafından kontrol edilmiş binlerce ücretsiz uygulama.</p></div>`, {max: true})}),
         question: {q: 'Linux Mint için antivirüs satın almanız gerekir mi?', options: [
            {t: 'Hayır. Güncel tutun, uygulamaları Yazılım Yöneticisi\'nden alın, iyi korunursunuz', ok: true, why: 'Evet. Linux\'ta az virüs vardır. Güncellemeler ve yerleşik güvenlik duvarı işi görür. E-postalardaki ve web sitelerindeki dolandırıcılıklar yine geçerlidir, bu yüzden tetikte olun.'},
            {t: 'Evet, en pahalısını', why: 'Hayır. Güncel tutun ve uygulamaları Yazılım Yöneticisi\'nden alın. E-posta ve web sitesi dolandırıcılıklarına her zamanki gibi dikkat edin.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Tebrikler!</strong> Menü sol altta, kapatma sağ üstte, belgeler için LibreOffice, web için Firefox, uygulamalar için Yazılım Yöneticisi ve güncellemeler için kalkan.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB bellek bağlandı</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Bilgisayar değiştirmeden önce dosyalarınızı bir <strong>USB belleğe</strong> kopyalayın. Bilgisayarın yanındaki bir USB yuvasına takın. Burada <strong>USB belleği tak\'a tıklayın</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB bellek bağlandı</div>'}), target: 'app-files', say: `<strong>${N.files[os]} öğesini açın.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Aç'], ['menu-copy', 'Kopyala'], ['menu-rename', 'Yeniden adlandır']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Mektuplarınız <strong>Belgeler</strong>\'de. <strong>Belgeler klasörüne sağ tıklayın.</strong> <em>(Sonra aynısını Resimler için yapın.)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Kopyala\'ya tıklayın.</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'USB belleğiniz solda. <strong>USB belleğe tıklayın.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Boş. <strong>Boş alana sağ tıklayın.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>${pasteLabel(os)} öğesine tıklayın.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? '214 öğe kopyalanıyor… 1 dakika kaldı' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Çıkar']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Bitti! Belleği çekmeden önce hiçbir şey zarar görmesin diye <strong>çıkarın</strong>. Soldaki <strong>USB belleğe sağ tıklayın</strong>.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Çıkar\'a tıklayın.</strong> Sonra çıkarmak güvenli.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Dosyaları yeni bir bilgisayara taşımanın başka bir yolu?', options: [
            {t: 'Çevrimiçi depolama: OneDrive, iCloud ya da Google Drive', ok: true, why: 'Evet. Eski bilgisayardan yükleyin, yenisinde giriş yapın, orada olurlar. USB bellek de iyi bir ek kopyadır.'},
            {t: 'Her dosyayı tek tek kendime e-postayla gönderirim', why: 'Bu çok uzun sürerdi! USB bellek ya da OneDrive, iCloud veya Google Drive gibi çevrimiçi depolama kullanın.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Tebrikler!</strong> Yeni bilgisayarda belleği takın, açın ve klasörleri Belgeler ve Resimler\'inize kopyalayın.'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Bridlington otobüs saatleri ⟦star⟧ Tarifler</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Oturum açılmadı</span><button type="button" data-tap="sync">Senkronizasyonu aç…</button><button type="button" data-tap="guest">Misafir profilini aç</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Google ile oturum aç</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Alıştırma: sizin yerinize girildi.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">İleri</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Senkronizasyon açılsın mı?</strong></p><p class="fd">Yer imleriniz, şifreleriniz ve geçmişiniz Google Hesabınıza kaydedilecek ve tüm cihazlarınızda görünecek.</p><div class="jn"><button type="button" data-tap="cancel">İptal</button><button type="button" class="adg" data-tap="yes-in">Evet, katılıyorum</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Yeni sekme</span>${profile}</div><div class="qn">⟦search⟧ Google'da arayın ya da bir URL yazın</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Yer imleriniz senkronize ediliyor…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Eski bilgisayarınızda <strong>Chrome</strong> kullandıysanız, giriş yapmak yer imlerinizi ve kayıtlı şifrelerinizi yenisine getirir. (Firefox ve Edge de aynı şekilde çalışır.) <strong>Chrome\'a tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: 'Sağ üstteki <strong>kişi simgesine tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Senkronizasyonu aç…\'a tıklayın.</strong>', hints: {guest: 'Misafir profili hiçbir şeyi kaydetmez. Senkronizasyonu aç\'a tıklayın.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Eski bilgisayarda kullandığınız <strong>aynı Google hesabıyla</strong> giriş yapın. <strong>İleri\'ye tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Evet, katılıyorum\'a tıklayın.</strong>', hints: {cancel: 'Bu senkronizasyonu durdurur. Evet, katılıyorum\'a tıklayın.'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Yer imleriniz geri geldi. Şifreleri tarayıcınızda kaydetmek güvenli mi?', options: [
            {t: 'Evet, Google hesabınızın güçlü bir şifresi ve 2 adımlı doğrulaması varsa', ok: true, why: 'Evet. Her yerde aynı şifreyi kullanmaktan çok daha güvenlidir. Hesabın kendisini 2 adımlı doğrulamayla koruyun.'},
            {t: 'Hayır, bunun yerine ekrandaki yapışkan nota yazın', why: 'Hesabınızda 2 adımlı doğrulama olduğu sürece, tarayıcı şifre yöneticisi ekrandaki bir nottan çok daha güvenlidir.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Tebrikler!</strong> Yer imleriniz ve şifreleriniz sizi takip etti. Herkese açık ya da paylaşılan bir bilgisayarda senkronizasyonu açmayın.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Sistem'} Güvenlik Uyarısı ⚠️</strong>
            <p>Bilgisayarınıza 5 virüs BULAŞMIŞ! Banka bilgileriniz ve fotoğraflarınız risk altında.</p><p>Bilgisayarınızı kapatmayın. Destek hattını hemen arayın:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Şimdi ara</button><button type="button" data-tap="fake-close">Kapat</button></div>
            <small>(Deneme dolandırıcılık sayfası. Numara gerçek değil.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Siteden ayrılınsın mı?</strong></p><p class="fd">Yaptığınız değişiklikler kaydedilmeyebilir.</p><div class="jn"><button type="button" data-tap="stay">Kal</button><button type="button" class="adg" data-tap="leave">Ayrıl</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Bu, gezinirken birden ekranınızı kapladı. Gerçek mi?', options: [
            {t: 'Hayır. Sizi korkutup dolandırıcıları aratmaya çalışan sahte bir web sitesi', ok: true, why: 'Aynen öyle. Gerçek uyarılar asla aranacak bir telefon numarası göstermez. Aramayın ve sayfadaki hiçbir şeye tıklamayın.'},
            {t: 'Evet, numarayı hemen ararım', why: 'Asla aramayın. Bu sahte bir sayfa. "Destek" kişileri bilgisayarınızın ve paranızın denetimini ele geçirmeye çalışır.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Tüm ekranı kapladı, bu yüzden nasıl kapatacağınızı göremiyorsunuz. Tam ekrandan çıkmak için <strong>Esc</strong> tuşuna basın (klavyenin sol üstünde).',
         hints: {'call-btn': 'Asla! Esc tuşuna basın.', 'fake-close': 'Sayfadaki düğmeler tuzak olabilir. Bunun yerine klavyenizdeki Esc tuşuna basın.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Artık tarayıcıyı görebilirsiniz. <strong>Sekmeyi kapatın</strong>, üzerindeki ⟦x⟧ ile.',
         hints: {'call-btn': 'Sayfadaki hiçbir şeye tıklamayın. Sekmeyi üzerindeki ⟦x⟧ ile kapatın.', 'fake-close': 'O, dolandırıcılık sayfasının bir parçası. Sekmenin kendisindeki ⟦x⟧ düğmesini kullanın.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Sizi orada tutmaya çalışıyor. <strong>Ayrıl\'a tıklayın.</strong>', hints: {stay: 'Ayrıl\'a tıklayın.'}},
        {screen: c => scareware(os, c), question: {q: 'Hiç kapanmazsa ne olur?', options: [
            {t: os === 'windows' ? 'Görev Yöneticisi\'ni açmak için Ctrl + Shift + Esc tuşlarına basın, tarayıcıyı seçin ve Görevi sonlandır\'a tıklayın' : os === 'mac' ? '⟦command⟧ Cmd + Option + Esc tuşlarına basın ve tarayıcıyı Çıkmaya Zorla' : 'Paneldeki tarayıcıya sağ tıklayıp Kapat\'ı seçin ya da bilgisayarı yeniden başlatın',
             ok: true, why: 'Evet. Tarayıcıyı yeniden açtığınızda eski sayfaları geri yüklemesine izin vermeyin. Bilgisayarı yeniden başlatmak da işe yarar.'},
            {t: 'Kapatmama yardım istemek için numarayı ararım', why: 'Asla aramayın. ' + (os === 'windows' ? 'Tarayıcıyı kapatmak için Ctrl + Shift + Esc (Görev Yöneticisi) kullanın.' : os === 'mac' ? 'Çıkmaya Zorla için ⟦command⟧ Cmd + Option + Esc kullanın.' : 'Tarayıcıyı panelden kapatın ya da yeniden başlatın.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Tebrikler!</strong> Bilgisayarınıza hiç virüs bulaşmamıştı: yalnızca bir web sayfasıydı. Buna benzer bir numarayı aradıysanız bankanızla iletişime geçin ve şifrelerinizi başka bir cihazdan değiştirin.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows Güvenliği', `<div class="aif"><h3>Virüs ve tehdit koruması</h3><p class="mj">⟦check⟧ Geçerli tehdit yok</p>
                <p class="cf">Son tarama: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Hızlı tarama sürüyor… 12.840 dosya tarandı</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Virüs koruması</span><span>⟦check⟧ Güvenlik duvarı</span><span>⟦check⟧ Uygulama ve tarayıcı denetimi</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Güvenlik Duvarı Yapılandırması', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Güvenlik duvarı açık</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows\'ta <strong>Windows Güvenliği</strong> adlı ücretsiz yerleşik antivirüs vardır. Çalıştığını kontrol edelim. <strong>Başlat\'a tıklayın.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Ayarlar\'a tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: 'Solda <strong>Gizlilik ve güvenlik\'e tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Windows Güvenliği\'ne tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Yeşil işaretler korunduğunuz anlamına gelir. İçiniz rahat olsun diye <strong>Hızlı tarama\'ya tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Ayrıca başka bir antivirüse para ödemeniz gerekir mi?', options: [
            {t: 'Hayır. Windows Güvenliği çoğu insan için yeterlidir ve ikisi bilgisayarı yavaşlatabilir', ok: true, why: 'Evet. Windows\'u güncel tutun ve Windows Güvenliği\'ni açık bırakın. Ücretli olanlar çoğu zaman yalnızca açılır pencere ve abonelik ekler.'},
            {t: 'Evet, ne kadar çok o kadar iyi', why: 'İki antivirüs programı çakışıp işleri yavaşlatabilir. Windows Güvenliği çoğu insan için yeterlidir.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac\'lerde arka planda uygulamaları ve dosyaları kontrol eden ücretsiz yerleşik koruma vardır. Bir ayarı kontrol edelim. <strong>Apple menüsüne tıklayın</strong> (logo).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Sistem Ayarları…\'na tıklayın.</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: 'Solda <strong>Gizlilik ve Güvenlik\'e tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, c, 'privacy')}),
         question: {q: '"Uygulamalara App Store ve Bilinen Geliştiricilerden izin ver" seçili. Değiştirmeli misiniz?', options: [
            {t: 'Hayır, olduğu gibi bırakın. Bilinmeyen yapımcıların uygulamalarını engeller', ok: true, why: 'Evet. Bir web sitesi bir şey yüklemek için bunu değiştirmenizi söylüyorsa bu büyük bir uyarı işaretidir.'},
            {t: 'Evet, her yerden uygulamalara izin verin', why: 'Olduğu gibi bırakın. Bilinmeyen yapımcıların uygulamalarını durdurur. Bir web sitesinin bunu değiştirmenizi söylemesi bir uyarı işaretidir.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Sistem Ayarları', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Mac için antivirüs satın almanız gerekir mi?', options: [
            {t: 'Çoğu insanın gerekmez. Güncel tutun ve uygulamaları yalnızca güvenilir yerlerden yükleyin', ok: true, why: 'Evet. Güncellemeler ve yerleşik koruma işi görür. Mac\'inize virüs bulaştığını söyleyen açılır pencereler dolandırıcılıktır.'},
            {t: 'Evet, hangi açılır pencere sunarsa', why: 'Mac antivirüsü sunan açılır pencereler genellikle dolandırıcılıktır. Bunun yerine Mac\'inizi güncel tutun.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint\'in istenmeyen bağlantıları engelleyen yerleşik bir <strong>güvenlik duvarı</strong> vardır. Siz açana kadar kapalıdır. <strong>Menü\'ye tıklayın.</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Güvenlik Duvarı\'na tıklayın.</strong> <em>(Göremiyorsanız Menü\'de "firewall" arayın.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: 'Güvenlik duvarını açmak için <strong>Durum anahtarına tıklayın</strong>.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Linux Mint\'i başka ne güvende tutar?', options: [
            {t: 'Kalkan nokta gösterdiğinde güncellemeleri yüklemek ve uygulamaları Yazılım Yöneticisi\'nden almak', ok: true, why: 'Evet. Ve olağan kurallar: e-posta bağlantılarına ve açılır pencerelere dikkat edin.'},
            {t: 'Başka bir şeye gerek yok', why: 'Güncellemeleri yüklemeye ve uygulamaları Yazılım Yöneticisi\'nden almaya devam edin. E-posta ve web sitesi dolandırıcılıkları yine geçerlidir.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Tebrikler!</strong> Bilgisayarınızın yerleşik koruması açık. Güncellemeler, bağlantılara dikkat ve yalnızca güvenilir yerlerden yükleme gerisini halleder.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Paket Teslimatı</strong><span>Sizi kaçırdık: teslimatı bugün yeniden ayarlayın</span></button>
            <div class="lx"><strong>Sarah</strong><span>Pazar günkü fotoğraflar</span></div><div class="lx"><strong>Bridlington Yürüyüş Grubu</strong><span>Cumartesi yürüyüşü</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Paket Teslimatı</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Paketinizi bugün teslim etmeye çalıştık ama kimse evde değildi. Teslimatı yeniden ayarlamak için £1,45 ücret gerekiyor.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Teslimatı yeniden ayarla</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Kimlik avını bildir</button><button type="button" data-tap="reply">Yanıtla</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Mail', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Bildirildi ve Gereksiz Posta\'ya taşındı</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'İşte e-postanız, tarayıcıda. <strong>Paket Teslimatı e-postasını açın.</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'Bilgisayarda bir bağlantının gerçekte nereye gittiğini <strong>tıklamadan</strong> kontrol edebilirsiniz. <strong>Fareyi "Teslimatı yeniden ayarla" üzerine getirin</strong> ve sabit tutun. <em>(Dokunmatik ekranda basılı tutun.)</em>',
         hints: {'click-link': 'Tıklamayın! Fare imlecini üzerinde bekletin.'}, hint: 'Fare imlecini tıklamadan mavi bağlantının üzerinde bekletin.'},
        {screen: c => webmail(os, c), question: {q: 'Gerçek adres altta görünüyor: parcel-redelivery.example.top. Güvenli mi?', options: [
            {t: 'Hayır. Gerçek bir teslimat şirketinin web sitesi değil ve ücret istiyorlar', ok: true, why: 'Evet. Kuryeler e-posta ya da kısa mesajla küçük ücretler almaz. Gerçek adres onu ele veriyor.'},
            {t: 'Evet, içinde "parcel" yazıyor', why: 'Herkes bir web adresine "parcel" yazabilir. Gerçek bir kurye değil ve ücret dolandırıcılığın kendisi.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Kimlik avını bildir\'e tıklayın.</strong> Dolandırıcılık e-postalarını report@phishing.gov.uk adresine de iletebilirsiniz.', hints: {reply: 'Dolandırıcılara asla yanıt vermeyin. Kimlik avını bildir\'e tıklayın.', 'click-link': 'Bağlantıya tıklamayın! Bunun yerine bildirin.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Tebrikler!</strong> Tıklamadan önce üzerine gelin: adres şirketle eşleşmiyorsa tıklamayın.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (deneme numarası). Telefonunuzun IMEI numarasını bulmak için gerçek kod budur.',
        '999': 'Bu bir deneme telefonu, bu yüzden 999\'u arayamaz. Gerçek bir acil durumda 999 ya da 112\'yi arayın.',
        '112': 'Bu bir deneme telefonu, bu yüzden 112\'yi arayamaz. 112, İngiltere\'de ve Avrupa genelinde 999 gibi çalışır.',
        '159': '159 sizi kendi bankanıza güvenle bağlar. Paranızla ilgili bir arama sizi endişelendiriyorsa kullanın.',
        '7726': '7726, dolandırıcılık mesajlarını ilettiğiniz numaradır. Eski telefon tuş takımlarında "SPAM" yazar!',
        '123': 'speaking-clock',
        '1471': '07700 900842 numaralı telefon bugün 11:20\'de aradı. (Alıştırma. 1471 sabit hattınızı en son kimin aradığını söyler.)',
        '01189998819991197253': 'Bu, The IT Crowd dizisindeki acil durum numarası. Kapatıp tekrar açmayı denediniz mi?',
        '101': '101, acil olmayan durumlar için polis numarasıdır.',
        '111': '111, acil ama hayati olmayan durumlarda NHS yardımıdır.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Telefon', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Bir numara girin</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Anne', '#f472b6', [['them', 'LOL\'un "lots of love" (çok sevgi) demek olduğunu sanıyordum. Her şeyin sonuna yazıyordum!'], ['them', 'Teyzenin cevap vermemesi bu yüzden mi?'], ['them', 'iPad\'imden gönderildi']]],
        ['Bilinmeyen', '#94a3b8', [['them', 'Tebrikler! ÜCRETSİZ bir telefon kazandınız. Almak için buraya tıklayın: prize-winner.example'], ['note', 'Bu bir dolandırıcılık. Bağlantıya dokunmayın: 7726\'ya iletin, sonra silin.']]],
        ['Sarah', '#a78bfa', [['them', 'Babam emoji kullanmayı öğreniyor 😂'], ['them', 'Bana bir patlıcan gönderdi ve "bu akşam yemeği için mi?" dedi 🍆']]],
        ['Diş Hekimi', '#38bdf8', [['them', 'Hatırlatma: randevunuz Salı saat 10:30\'da. Onaylamak için Y yanıtlayın.']]],
    ];
    const MUM_REPLIES = ['Bu kim?', 'Beni ara, gözlüğüm olmadan mesaj okuyamıyorum', 'Harika! 👍', 'Son mesajımı aldın mı? Yanlışlıkla kediye gönderdim.', 'iPad\'imden gönderildi', 'Tamam canım xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Mesajlar', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Martı yine saldırdı' : 'Fotoğraf', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Bridlington sahilinde suçüstü yakalandı. Patatesler geri alınamadı.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Fotoğraflar', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Saat', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, 'Hava Durumu', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Soğuk, ara sıra kar' : 'Aralıklı güneş, rüzgârlı'}</p>
            <div class="ajf">${[['Cum', '⟦cloud-rain⟧', '11°'], ['Cmt', '⟦wind⟧', '10°'], ['Paz', '⟦sun⟧', '14°'], ['Pzt', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Martı uyarısı: <strong>yüksek</strong>. Patateslerinize sahip çıkın.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Dolabın içinden geçin, sonra sokak lambasını geçip yürümeye devam edin.', home: 'Evim, güzel evim. 🏠', 'ay': '238.855 mil. Trafik az.',
        chips: 'En yakın balık-patates dükkânı: Bridlington sahilinin her yeri. 🍟', 'north pole': 'Noel Baba\'nın atölyesi. Aralık\'a kadar kapalı. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Güzel bir yer!',
        'flamborough': 'Flamborough Head: deniz feneri, uçurumlar ve puffin kuşları. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `"${inp.value.trim()}": bu deneme haritası yalnızca birkaç yer biliyor. Bridlington, Flamborough ya da Narnia'yı deneyin.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Ayarlar', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Uçak Modu' : 'Uçak modu', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Koyu mod', st.dark)}${row('dnd', 'Rahatsız Etmeyin', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Hakkında' : 'Telefon hakkında'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Hakkında' : 'Telefon hakkında', `<div class="aic"><div class="lq">
            <div class="ho"><span>Ad</span><b>Margaret'in telefonu</b></div>
            <div class="ho"><span>Model</span><b>${p === 'ios' ? 'iPhone Deneme' : 'Pixel Deneme'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS sürümü' : 'Android sürümü'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Depolama</span><b>Torunların fotoğrafları için bolca yer</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Seri numarası</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Eski cep telefonlarının klasik oyunu.'], ['torch', '⟦flashlight⟧', 'Süper Parlak Fener ÜCRETSİZ', 'Reklam içerir · Uygulama içi satın alımlar'], ['knit', '⟦scissors⟧', 'Örgü Desenleri', 'Yakında bu deneme mağazasında.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Store', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Aç' : (p === 'ios' ? 'Al' : 'Yükle')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Skor: <b class="ado">0</b></span><span>En iyi: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Başlamak için bir yöne dokunun (ya da ok tuşlarını kullanın)</p>
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
                f.querySelector('.vy').textContent = `Oyun bitti! Skor ${score}. Yeniden oynamak için bir yöne dokunun.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Uçak', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Rahatsız Etmeyin', st.dnd)}${t('torch', '⟦flashlight⟧', 'Fener', st.torch)}${t('dark', '⟦sun-moon⟧', 'Koyu mod', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Kapatmak için yukarı kaydırın' : 'Kapat'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Yeni duvar kâğıdı');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `"Üçüncü sinyalde saat ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} ve ${t.getSeconds()} saniye olacak… bip, bip, bip." (Eski konuşan saat!)`; return; }
                msg.textContent = egg || (n ? 'Bu deneme telefonu gerçek arama yapamaz. 123, 1471 ya da *#06# deneyin…' : 'Önce bir numara yazın.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Ödülünüzü almak için lütfen banka bilgilerinizi gönderin!!! (Bu bir dolandırıcılık. Bu numarayı engelleyin.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Teşekkürler, randevunuz onaylandı. 🦷'});
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
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Başlat'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Durdur'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Başlat'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Güneş kremi sürüldü! Neredeyse Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Fener açık. (Arkadaki ışık yerine ekran parlar.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Uçak modu açık: arama, mesaj ya da mobil veri yok.' : 'Uçak modu kapalı.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Duvar kâğıdı değişti. Görmek için ana ekrana gidin!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Artık bir geliştiricisiniz! (Gerçek bir Android sırrı: Derleme numarasına 7 kez dokunun.)' : st.build >= 3 ? `Geliştirici olmaya artık ${7 - st.build} adım kaldı.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Alıştırma yaptığınız için teşekkürler!</b>' : '<span>🤖</span><b>Deneme 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Fener uygulamasına ihtiyacınız yok: telefonunuzun hızlı ayarlarında yerleşik olarak var. Ücretsiz fener uygulamaları çoğu zaman reklam dolu, hatta daha kötüsüdür!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Deneme mağazasında yalnızca gösteri amaçlı.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Yükleniyor…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Aç'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Uygulama', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Bu deneme uygulaması kendi dersinin bir parçasıdır. Düzgün denemek için Öğren kurslarına göz atın.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Bir sır buldunuz!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Arama sona erdi' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Bilinmeyen' ? 'Arayan' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Bilinmeyen', number: '0161 496 0423', who: 'm', tag: 'Kişilerinizde yok',
         intro: 'Telefonunuz çalıyor. Numara kişilerinizde kayıtlı değil. Alıştırma için <strong>cevaplayın</strong>. <em>Arayanı duymak için sesi açın.</em>',
         lines: [
            {text: 'Merhaba, ben bankanızın dolandırıcılık ekibinden Mark. Hesabınızda bazı şüpheli ödemeler fark ettik. Devam etmeden önce tam adınızı, doğum tarihinizi ve banka kartınızın üzerindeki uzun numarayı doğrulayabilir misiniz?',
             q: 'Arayan bankanızdan olduğunu söylüyor. Ne yaparsınız?', options: [
                {t: 'Bilgileri veririm, bankadan arıyor', why: 'Sizi arayan bir banka tam kart numaranızı asla istemez. Dolandırıcılar bilgilerinizi böyle alır.'},
                {t: 'Bankamı kartımın üzerindeki numaradan kendim arayacağımı söyler ve kapatırım', ok: true, why: 'Aynen öyle. Kartınızın üzerindeki numarayı arayın, mümkünse başka bir telefondan ya da 159\'u çevirin.'},
                {t: 'Kim olduğunu kanıtlamasını isterim', why: 'Dolandırıcılar ikna edici konuşur ve çoğu zaman bilgilerinizin bir kısmını zaten bilir. En güvenlisi kapatıp bankanızı kendiniz aramaktır.'}]},
            {text: 'Lütfen kapatmayın! Suçlular şu anda hesabınızdan para çekiyor. Her şeyi sizin için açacağım güvenli bir hesaba taşımanız gerekiyor. Bunu önümüzdeki on dakika içinde yapmalıyız.',
             q: 'Acil olduğunu ve paranızı taşımanız gerektiğini söylüyor. Şimdi ne yaparsınız?', options: [
                {t: 'Çok geç olmadan parayı hızlıca taşırım', why: '"Güvenli hesap" diye bir şey yoktur. Bankanız para taşımanızı asla istemez. Dolandırıcılık bu.'},
                {t: 'Kapatırım. Gerçek bir banka paranızı "güvenli bir hesaba" taşımanızı asla istemez', ok: true, why: 'Evet. Acele ve "güvenli hesap" onu ele verir. Kapatın ve 159\'u arayın.'}]}],
         hang: 'Kırmızı düğmeyle kapatın.'},
        {letter: '?', color: '#64748b', name: 'Bilinmeyen', number: '020 7946 0815', who: 'robot', tag: 'Kişilerinizde yok',
         intro: 'Bir arama daha. <strong>Cevaplayın.</strong>',
         lines: [
            {text: 'Bu, H M R C\'den otomatik bir mesajdır. Ödenmemiş vergi nedeniyle adınıza tutuklama emri çıkarıldı. Bir görevliyle konuşmak için şimdi 1\'e basın.',
             q: 'Kayıtlı bir ses vergi yüzünden tutuklanacağınızı söylüyor. Ne yaparsınız?', options: [
                {t: 'Sorunu çözmek için 1\'e basarım', why: '1\'e basmak sizi ödeme isteyecek (çoğu zaman hediye kartıyla) dolandırıcılara bağlar. HMRC kayıtlı bir mesajla asla tutuklamayla tehdit etmez.'},
                {t: 'Kapatırım. HMRC tutuklama tehdidiyle aramaz', ok: true, why: 'Doğru. HMRC önce size yazar ve telefonda asla tutuklamayla tehdit etmez.'}]}],
         hang: 'Kapatın.'},
        {letter: '?', color: '#64748b', name: 'Bilinmeyen', number: '0113 496 0332', who: 'm', tag: 'Kişilerinizde yok',
         intro: 'Yine telefonunuz. <strong>Cevaplayın.</strong>',
         lines: [
            {text: 'Merhaba, Windows teknik departmanından arıyorum. Bilgisayarınız bize hata mesajları gönderiyor ve çok tehlikeli bir virüs var. Lütfen gidip bilgisayarınızı açın, düzeltmenize yardım edeceğim.',
             q: 'Bilgisayarınızda virüs olduğunu söylüyor. Ne yaparsınız?', options: [
                {t: 'Bilgisayarı açar ve talimatlarını izlerim', why: 'Bilgisayarınızı uzaktan yönetmesini sağlayan bir program yüklemenizi, sonra da para istemeyi planlıyor. Microsoft asla böyle aramaz.'},
                {t: 'Kapatırım. Bilgisayar şirketleri virüsler için aramaz', ok: true, why: 'Aynen öyle. Bir arayanı asla bilgisayarınıza almayın.'},
                {t: 'Bilgisayarım olmadığını açıklarım', why: 'Açıklamanıza ya da tartışmanıza gerek yok. Sadece kapatın.'}]}],
         hang: 'Kapatın.'},
        {letter: '?', color: '#64748b', name: 'Bilinmeyen', number: '0808 157 0190', who: 'f', tag: 'Kişilerinizde yok',
         intro: 'Bir arama daha. <strong>Cevaplayın.</strong>',
         lines: [
            {text: 'Merhaba. Çevrimiçi alışveriş hesabınıza dokuz yüz doksan dokuz sterlin değerinde yeni bir iPhone siparişi verildi. Bu siparişi siz vermediyseniz iptal etmek ve ekibimizle konuşmak için 1\'e basın.',
             q: 'Bir iPhone sipariş etmediniz. Ne yaparsınız?', options: [
                {t: 'Siparişi iptal etmek için 1\'e basarım', why: '1\'e basmak sizi, banka bilgilerinizi ya da bilgisayarınızın denetimini isteyerek size "para iadesi" yapacak bir dolandırıcıya bağlar.'},
                {t: 'Kapatır, sonra hesabımı uygulamadan ya da web sitesinden kendim kontrol ederim', ok: true, why: 'Evet. Gerçekten bir sipariş olsaydı hesabınızda görürdünüz. Bir arayanın verdiği numarayı ya da düğmeyi asla kullanmayın.'}]}],
         hang: 'Kapatın.'},
        {letter: 'S', color: '#16a34a', name: 'Muayenehane', number: '01632 960211', who: 'f', tag: 'Kişilerinizde kayıtlı',
         intro: 'Bir arama daha: bu sefer kişilerinizde kayıtlı olan doktor muayenehanesi. <strong>Cevaplayın.</strong>',
         lines: [
            {text: 'Merhaba, muayenehaneden Sue. Grip aşınızın Salı saat ondaki randevusunu kısaca hatırlatmak istedim. Bir şey yapmanıza gerek yok. Değiştirmeniz gerekirse her zamanki numaradan bizi arayın. Şimdilik hoşça kalın!',
             q: 'Bu arama bir dolandırıcılık mı?', options: [
                {t: 'Evet: kapatır ve numarayı engellerim', why: 'Bu sorun değil! Hiçbir şey istemedi, sizi acele ettirmedi ve her zamanki numarayı kullanmanızı söyledi.'},
                {t: 'Muhtemelen gerçek: para ya da bilgi istemedi ve her zamanki numarayı aramanızı söyledi', ok: true, why: 'Aynen öyle. Gerçek aramalar size baskı yapmaz. Emin değilseniz zaten sahip olduğunuz numaradan geri arayın.'}]}],
         hang: 'Arama bitti. Kapatmak için <strong>kırmızı düğmeye dokunun</strong>.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Arama ${n + 1} / ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'Gerçek hayatta tanımadığınız numaralara cevap vermemek iyidir! Bu alıştırma için cevaplamak üzere yeşil düğmeye dokunun.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Bunlardan hangisi dolandırıcılık aramasının işaretidir?', options: [
            {t: 'Acele ettirilmek, tehdit edilmek ya da gizli tutmanız söylenmek', ok: true, why: 'Evet. Baskı en büyük ipucudur. Gerçek bir arayan, sizin acele etmemenizden ve geri aramanızdan memnun olur.'},
            {t: 'Arayan adınızı biliyor', why: 'Dolandırıcılar çoğu zaman adınızı, hatta bazı hesap bilgilerinizi bilir. Bu tek başına aramayı gerçek yapmaz.'},
            {t: 'Numara yerel görünüyor', why: 'Dolandırıcılar ekranınızda herhangi bir numarayı, yerel bir numarayı ya da bankanızınkini bile gösterebilir. Numaraya güvenmeyin.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Tebrikler!</strong> Dört dolandırıcıyı kapattınız ve gerçek aramayı fark ettiniz. Unutmayın: şüpheniz varsa kapatın ve güvendiğiniz bir numaradan geri arayın. Bankanız için 159\'u çevirin.'},
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
            ios: ['iPhone', 'Apple yapımı'], android: ['Android', 'Samsung, Google Pixel, Motorola ve diğerleri'],
            windows: ['Windows', 'Çoğu dizüstü ve masaüstü bilgisayar'], mac: ['Mac', 'Apple yapımı: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu ve diğerleri'],
        };
        const notSure = isPC
            ? 'Ekranınıza bakın. Windows\'un altta bir Başlat düğmesi (dört küçük kare) vardır. Mac\'in sol üstte bir Apple logosu vardır. Linux Mint\'in sol altta bir Menü düğmesi vardır.'
            : 'iPhone\'un arkasında bir Apple logosu (ısırılmış bir elma) vardır. Sizinkinde yoksa neredeyse kesinlikle bir Android telefondur.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Hangi ${isPC ? 'bilgisayarı kullanıyorsunuz' : 'telefona sahipsiniz'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Emin değil misiniz?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Nerede olduğunu göster</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Tekrar dinle</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Bir adım geri</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Değiştir: ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">${isPC ? 'BİLGİSAYAR' : 'TELEFON'} DENEME: gerçek değil. Burada yaptığınız hiçbir şey hiçbir yere gönderilmez.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Sesi kapat' : 'Sesi aç'; };
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
            showBtn.textContent = 'Derse dön';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Nerede olduğunu göster';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Bitti!' : `Adım ${i + 1} / ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Doğru!' : 'Tam değil.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Devam et</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Tekrar dene</button>${pageNext
                ? `<button type="button" class="ap vb">Aferin! ${last ? 'Şimdi kursu bitirin' : 'Neden sonraki dersi denemiyorsunuz'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Tam değil. ' + (step.hint || 'Talimatlara bir kez daha bakın.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Henüz değil. Talimatlara bir kez daha bakın.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Tam değil. ' + (step.hint || 'Talimatlara bir kez daha bakın.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Uygulama';
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
                else hint.textContent = 'Sağ tıklayın: farenin sağ düğmesine basın. Mac izleme dörtgeninde iki parmakla tıklayın. Dokunmatik ekranda basılı tutun.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Bir şey olana kadar parmağınızı (ya da fare düğmesini) üzerinde basılı tutun.';
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
                showBtn.textContent = 'Nerede olduğunu göster';
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
