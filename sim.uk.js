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
            ? [['phone', 'Телефон', '#22c55e', ICON.phone], ['messages', 'Повідомлення', '#22c55e', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Фото', '#e5e7eb', ICON.photos], ['mail', 'Пошта', '#3b82f6', ICON.mail], ['clock', 'Годинник', '#111827', ICON.clock],
               ['weather', 'Погода', '#38bdf8', ICON.weather], ['maps', 'Карти', '#22c55e', ICON.map], ['settings', 'Налаштування', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', 'Телефон', '#2563eb', ICON.phone], ['messages', 'Повідомлення', '#3b82f6', ICON.bubble], ['camera', 'Камера', '#6b7280', ICON.camera],
               ['photos', 'Фото', '#e5e7eb', ICON.photos], ['clock', 'Годинник', '#111827', ICON.clock], ['maps', 'Карти', '#16a34a', ICON.map],
               ['settings', 'Налаштування', '#475569', ICON.settings], ['weather', 'Погода', '#38bdf8', ICON.weather], ['mail', 'Електронна пошта', '#ef4444', ICON.mail],
               ['store', 'Play Маркет', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? 'Проведіть пальцем вниз від правого верхнього кута ⟦chevron-down⟧' : 'Проведіть пальцем вниз від верхнього краю ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">Сьогодні</div>
                <div class="hp"><span>ВИБРАНЕ</span><strong>Застосунки, які нам подобаються цього тижня</strong></div>
                <div class="hp alt"><span>ПОЧНІТЬ</span><strong>Ідеї для вашого нового iPhone</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">Сьогодні</button><button type="button" data-tap="games">Ігри</button>
                    <button type="button" data-tap="apps">Програми</button><button type="button" data-tap="search-tab">${ICON.search}Пошук</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>Пошук застосунків і ігор</span></button>
            <div class="tg"><span class="on">Для вас</span><span>Топ-чарти</span><span>Діти</span></div>
            <div class="hp"><span>ПРОПОНУЄМО ВАМ</span><strong>Застосунки для початку</strong></div>
            <div class="hp alt"><span>ПОПУЛЯРНЕ</span><strong>Залишайтеся на зв'язку</strong></div>
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
        const btnLabel = p === 'ios' ? 'Отримати' : 'Установити';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '5 млрд+ завантажень' : 'Соціальні мережі'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · Безкоштовно</span></div></div>
                <p class="agm">На справжньому iPhone може знадобитися двічі натиснути бічну кнопку, глянути на екран для Face ID або ввести тут пароль вашого Apple Account.</p>
                <button type="button" class="ce co" data-tap="sheet-install">Установити</button>
                <button type="button" class="cp" data-tap="sheet-cancel">Скасувати</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>Вітаємо у WhatsApp</h3>
            <p>Прочитайте нашу <u>Політику конфіденційності</u>. Торкніться «Прийняти й продовжити», щоб прийняти <u>Умови користування</u>.</p>
            <button type="button" class="ce ox" data-tap="agree">Прийняти й продовжити</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Введіть свій номер телефону</h3>
            <p>WhatsApp потрібно перевірити ваш номер телефону. Може стягуватися плата оператора.</p>
            <div class="abt">Велика Британія <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">Далі</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>Це правильний номер?</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">Змінити</button><button type="button" data-tap="yes">${ios ? 'Так' : 'OK'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>ПОВІДОМЛЕННЯ · зараз</strong><span>Ваш код WhatsApp: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Нікому не повідомляйте цей код.</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>Перевірка вашого номера</h3>
            <p>Очікуємо автоматичного виявлення 6-значного коду, надісланого в SMS на номер <strong>+44 ${NUMBER}</strong>.</p>
            <div class="sa">${boxes}</div>
            <p class="fd">Не отримали код?</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['«WhatsApp» просить доступ до ваших контактів', 'Щоб ви бачили, хто з ваших друзів користується WhatsApp.', 'Дозволити WhatsApp доступ до ваших контактів?']
            : ['«WhatsApp» просить дозвіл надсилати вам сповіщення', 'Щоб ви знали, коли надходить нове повідомлення.', 'Дозволити WhatsApp надсилати вам сповіщення?'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>Дані профілю</h3>
            <p>Введіть своє ім'я та, якщо хочете, додайте фото профілю.</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">Ваше ім'я</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">Далі</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? 'Чати' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>Усе готово${ctx.name ? ', ' + esc(ctx.name) : ''}!</h3>
            <p>Ваші чати з'являться тут. Торкніться кнопки нового чату, щоб написати комусь зі своїх контактів.</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `Це головний екран вашого телефона. Застосунки завантажують з <strong>${store}</strong>. Це безкоштовно, і це безпечне місце, де можна брати застосунки. <strong>Торкніться ${store}.</strong>`,
                 hint: `Знайдіть значок ${store}. ${p === 'ios' ? "Він синій з білою літерою A." : "Це кольоровий трикутник."}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? 'Тепер потрібно знайти WhatsApp. <strong>Торкніться «Пошук»</strong> унизу праворуч.' : 'Тепер потрібно знайти WhatsApp. <strong>Торкніться рядка пошуку</strong> угорі.',
                 hint: p === 'ios' ? 'Пошук — це лупа внизу праворуч.' : 'У рядку пошуку написано «Пошук застосунків і ігор».'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "Ми вже ввели <em>whatsapp</em> за вас. З'являється список підказок. <strong>Торкніться «whatsapp messenger».</strong>",
                 hint: 'Торкніться підказки «whatsapp messenger».'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `Обережно: деякі застосунки вдають WhatsApp. Справжній називається <strong>WhatsApp Messenger</strong>, його створила <strong>WhatsApp Inc.</strong>, і він безкоштовний. <strong>Торкніться ${p === 'ios' ? 'Отримати' : 'Установити'} поруч зі справжнім.</strong>`,
                 hints: {'fake1-get': 'Це «WhatsUp Chat Free» від Fun Apps Ltd. Це підробка, а позначка «Ad» означає, що це реклама. Перевіряйте назву й автора.',
                         'fake2-get': 'Це «WA Messenger for Chat Pro» від LuckyDev Studio, копія. Справжній створила WhatsApp Inc.'},
                 hint: 'Знайдіть «WhatsApp Messenger» від «WhatsApp Inc.»'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: 'Перш ніж установити, iPhone перевіряє, що це справді ви. На справжньому iPhone це може бути <strong>Face ID</strong>, ваш <strong>відбиток пальця</strong> (Touch ID) або <strong>пароль Apple Account</strong>. Тут просто <strong>торкніться «Установити».</strong>',
                    hints: {'sheet-cancel': '«Скасувати» зупинить завантаження. Натомість торкніться «Установити».'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `Триває завантаження. Коли воно завершиться, кнопка зміниться на <strong>Відкрити</strong>. <strong>Торкніться «Відкрити».</strong>`,
                 hint: 'Зачекайте, поки на кнопці з\'явиться «Відкрити», і торкніться її.'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp відкривається вперше. Він просить вас погодитися з умовами. <strong>Торкніться «Прийняти й продовжити».</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp використовує ваш мобільний номер, щоб друзі могли вас знайти. <strong>Торкніться поля номера телефону</strong>, і ми введемо навчальний номер.'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `На справжньому телефоні ви ввели б власний мобільний номер. Тут ми використали вигаданий: <strong>07700 900123</strong>. <strong>Торкніться «Далі».</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp перевіряє, чи ви ввели його правильно. Цей правильний, тож <strong>торкніться ${p === 'ios' ? 'Так' : 'OK'}.</strong>`,
                 hints: {edit: `Ви торкнулися б «Змінити», якби помилилися. Цей номер правильний, тож торкніться ${p === 'ios' ? 'Так' : 'OK'}.`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp надсилає SMS із 6-значним кодом, щоб перевірити, що номер ваш. iPhone пропонує підставити його сам. <strong>Торкніться коду над клавіатурою.</strong>'
                    : 'WhatsApp надсилає SMS із 6-значним кодом, щоб перевірити, що номер ваш. Багато телефонів Android підставляють його самі. Якщо ваш цього не робить, <strong>торкніться повідомлення</strong> угорі.'},
                {screen: c => waCode(p, c),
                 question: {q: 'Поки ви налаштовуєте, вам пише друг: <em>«Привіт! Я випадково надіслав(ла) вам 6-значний код, перешліть його мені, будь ласка».</em> Що ви зробите?',
                    options: [
                        {t: 'Надіслати, це ж друг', why: 'Це поширене шахрайство. Хтось захопив обліковий запис вашого друга, і цей код віддасть йому й ваш.'},
                        {t: 'Не надсилати. Цей код ніхто не повинен просити', ok: true, why: 'Саме так. Цей код — ключ до вашого WhatsApp. Ніколи нікому його не повідомляйте, навіть другові чи тому, хто каже, що він із WhatsApp.'},
                        {t: 'Надіслати лише перші 3 цифри', why: 'Навіть частина коду допомагає шахраю. Не повідомляйте жодної його частини.'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp просить доступ до ваших контактів, щоб показати, хто з друзів ним користується. <strong>Торкніться «Дозволити».</strong>',
                 hints: {deny: 'Можна не дозволяти, але тоді WhatsApp не зможе показати імена ваших друзів. Для цієї практики торкніться «Дозволити».'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: 'Сповіщення повідомляють, коли надходить повідомлення, навіть коли WhatsApp закрито. <strong>Торкніться «Дозволити».</strong>',
                 hints: {deny: 'Без сповіщень ви не дізнаєтеся, що вам хтось написав. Для цієї практики торкніться «Дозволити».'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: 'Останній крок: друзі бачать ваше ім\'я. <strong>Введіть своє ім\'я в поле</strong>, а потім <strong>торкніться «Далі»</strong>. (Воно залишається на цій сторінці й нікуди не надсилається.)',
                 hints: {photo: 'У справжньому застосунку фото можна вибрати зараз або додати пізніше в Налаштуваннях. Поки пропустімо його: введіть ім\'я й торкніться «Далі».'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>Чудово, ви налаштували WhatsApp!</strong> Ваші чати з\'являться тут. На наступних уроках ви надішлете своє перше повідомлення.'},
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
            const lockName = ctx.touch ? 'Touch ID і код допуску' : 'Face ID і код допуску';
            const groups = [
                [['airplane', 'Авіарежим', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', 'Bluetooth', '#3b82f6', '⟦bluetooth⟧'], ['mobile', 'Стільниковий зв\'язок', '#22c55e', '⟦antenna⟧']],
                [['notifications', 'Сповіщення', '#ef4444', '⟦bell⟧'], ['sounds', 'Звуки й тактильні сигнали', '#ec4899', '⟦volume-2⟧'], ['focus', 'Фокусування', '#6366f1', '⟦moon⟧']],
                [['general', 'Загальні', '#8e8e93', '⟦settings⟧'], ['accessibility', 'Доступність', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple Intelligence і Siri', '#a855f7', '⟦sparkles⟧'], ['display', 'Екран і яскравість', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', 'Екстрений виклик — SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', 'Конфіденційність і безпека', '#3b82f6', '⟦hand⟧'], ['battery', 'Акумулятор', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'Програми', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple Account, iCloud та інше</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', 'Мережа й інтернет', 'Мобільна мережа, Wi-Fi, точка доступу'], ['devices', 'Підключені пристрої', 'Bluetooth, створення пари'],
            ['apps', 'Програми', 'Нещодавні додатки, додатки за умовчанням'], ['notifications', 'Сповіщення', 'Історія сповіщень'], ['battery', 'Акумулятор', '85%'], ['storage', 'Сховище', '91% used'],
            ['sound', 'Звук і вібрація', 'Гучність, вібровідгук'], ['display', 'Екран і дотик', 'Темна тема, розмір шрифту'],
            ['accessibility', 'Доступність', 'Екран, взаємодія, звук'], ['security', 'Безпека та конфіденційність', 'Безпека додатків, блокування пристрою, дозволи'],
            ['location', 'Геодані', 'Увімк.'], ['safety', 'Безпека та екстрені ситуації', 'Екстрений виклик SOS, медична інформація, сповіщення'],
            ['google', 'Google', 'Сервіси та налаштування'], ['system', 'Система', 'Мови, час, оновлення ПЗ']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? 'Touch ID і код допуску' : 'Face ID і код допуску';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>Палець 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>Скинути Face ID</span></div><div class="cj ex"><span>Налаштувати альтернативний вигляд</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? 'TOUCH ID' : 'FACE ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>Вимкнути код допуску</span></div><div class="cj ex"><span>Змінити код допуску</span></div>'
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

    const androidSecurity = () => androidList('Безпека та конфіденційність', [
        ['device-unlock', 'Розблокування пристрою', 'Блокування екрана, розблокування за обличчям і відбитком пальця'], ['app-security', 'Безпека додатків', 'Перевірка додатків на шкідливу поведінку'],
        ['theft', 'Захист від крадіжки', 'Блокуйте телефон, якщо його вкрадено'], ['privacy', 'Конфіденційність', 'Дозволи, активність облікового запису']]);
    const androidDeviceUnlock = ctx => androidList('Розблокування пристрою', [
        ['screen-lock', 'Блокування екрана', ctx.passcodeSet ? 'PIN-код' : 'Немає'], ['face-finger', 'Розблокування за обличчям і відбитком пальця', ctx.faceDone || ctx.fingerDone ? 'Налаштувати' : 'Налаштуйте для швидшого розблокування']]);
    const androidFaceFinger = ctx => androidList('Розблокування за обличчям і відбитком пальця', [
        ['face-unlock', 'Розблокування за обличчям', ctx.faceDone ? 'Обличчя додано' : 'Налаштувати'], ['fingerprint-unlock', 'Розблокування відбитком пальця', ctx.fingerDone ? '1 fingerprint' : 'Налаштувати']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? 'Перше сканування Face ID завершено.' : 'Face ID налаштовано.') : 'Обличчя додано';
        const btn = p === 'ios' ? (first ? 'Продовжити' : 'Готово') : 'Готово';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? 'Повільно рухайте головою, щоб завершити коло.' : 'Тримайте обличчя в колі й повільно рухайте головою.') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Завершено' : 'Змініть положення в руці') : (stage === 'grip' ? 'Змініть положення в руці' : 'Покладіть палець'))
            : (ready ? 'Відбиток додано' : 'Торкніться сканера');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? 'Тепер відбиток пальця можна використовувати для розблокування iPhone.' : 'Тепер покладіть краї подушечки пальця на кнопку «Додому».')
                     : (stage === 'grip' ? 'Покладіть краї подушечки пальця на кнопку «Додому».' : 'Кілька разів підніміть і знову покладіть палець на кнопку «Додому».'))
            : (ready ? 'Тепер ви можете розблоковувати телефон відбитком пальця.' : 'Торкніться сканера, підніміть палець і торкніться знову, доки шкала відбитка не заповниться.');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? 'Продовжити' : 'Готово'}</button>` : sensor}
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
                 say: 'Код допуску, Face ID і Touch ID — усе це в застосунку <strong>Параметри</strong>. <strong>Торкніться «Параметри»</strong> (сіра шестірня).',
                 hint: 'Параметри — це сірий значок із шестірнею.'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `Прокрутіть список вниз, якщо потрібно, і <strong>торкніться ${ctx.touch ? 'Touch ID і код допуску' : 'Face ID і код допуску'}</strong>.`,
                 hint: `Шукайте «${ctx.touch ? 'Touch ID і код допуску' : 'Face ID і код допуску'}» під «Екран і яскравість».`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: 'Блокування екрана, розблокування за обличчям і відбитки пальців — усе це в застосунку <strong>Налаштування</strong>. <strong>Торкніться «Налаштування»</strong> (шестірня).',
             hint: 'Налаштування — це значок із шестірнею.'},
            {screen: c => settingsList(p, c), target: 'security',
             say: 'Прокрутіть вниз, якщо потрібно, і <strong>торкніться «Безпека та конфіденційність»</strong>. <em>На Samsung це «Безпека та конфіденційність», а потім «Біометричні дані» або «Екран блокування».</em>',
             hint: 'Шукайте «Безпека та конфіденційність» ближче до кінця списку.'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>Торкніться «Розблокування пристрою».</strong>',
             hint: 'Це перший пункт — «Розблокування пристрою».'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? 'Введіть код допуску' : 'Введіть PIN-код', p === 'ios' ? '' : 'Щоб продовжити, введіть PIN-код'),
        sequence: CODE_KEYS,
        say: `${extraSay}Спершу телефон перевіряє, що це ви. <strong>Введіть навчальний код: ${codeText}</strong>. <em>Ніколи не вводьте справжній код-пароль на сайті.</em>`,
        hint: `Введіть навчальний код ${codeText}, цифра за цифрою.`,
    });

    const safestQuestion = {
        q: 'Який із цих варіантів дасть <strong>найнадійніший</strong> код-пароль?',
        options: [
            {t: '123456', why: '123456 — найпоширеніший код-пароль, тож це один з перших, які спробує злодій.'},
            {t: 'Ваш день народження, наприклад 140352', why: 'Дні народження легко дізнатися із соціальних мереж, листівок чи пошти. Уникайте дат, що щось означають.'},
            {t: 'Шість цифр, які нічого не означають для інших', ok: true, why: 'Саме так. Випадкові цифри, які не є датою, візерунком чи повтором, вгадати найважче.'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: 'На цьому телефоні ще немає код-пароля, тож його може відкрити будь-хто. <strong>Торкніться «Увімкнути код допуску».</strong>',
                 hints: {stolen: 'Захист украденого пристрою розглянуто в уроці 4. Спершу ввімкніть код-пароль.'}},
                {screen: c => codeScreen(p, c, 'Установити код допуску', 'Введіть код допуску', '<p class="aeh">Параметри коду допуску</p>'), sequence: CODE_KEYS,
                 say: `Оберіть 6 цифр, які ви запам'ятаєте. Для цієї практики <strong>введіть ${codeText}</strong>. <em>Будь ласка, не вводьте тут свій справжній код-пароль.</em>`,
                 hint: `Введіть ${codeText}, цифра за цифрою.`},
                {screen: c => codeScreen(p, c, 'Установити код допуску', 'Введіть новий код допуску ще раз'), sequence: CODE_KEYS,
                 say: `iPhone просить ще раз, щоб переконатися, що ви не помилилися. <strong>Введіть ${codeText} ще раз.</strong>`,
                 hint: `Введіть ${codeText} ще раз.`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>Чудово, на вашому навчальному телефоні тепер є код-пароль!</strong> На справжньому iPhone на цьому етапі можуть також попросити пароль вашого Apple Account.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: 'Блокування екрана — <strong>Немає</strong>, тож цей телефон може відкрити будь-хто. <strong>Торкніться «Блокування екрана».</strong>'},
            {screen: () => androidList('Виберіть блокування екрана', [['none', 'Немає'], ['swipe', 'Проведення пальцем'], ['pattern', 'Графічний ключ'], ['pin', 'PIN-код'], ['password', 'Пароль']]),
             target: 'pin', say: 'Є кілька варіантів. <strong>PIN-код</strong> (цифри) простий і надійний. <strong>Торкніться «PIN-код».</strong>',
             hints: {none: '«Немає» означає, що телефон може відкрити будь-хто.', swipe: '«Проведення пальцем» лише відкриває телефон свайпом, тож нічого не захищає.',
                     pattern: 'Графічний ключ можна вгадати за слідами від пальця на екрані. PIN-код безпечніший.',
                     password: 'Пароль теж підійде, але PIN-код швидше вводити щодня. Для цієї практики торкніться «PIN-код».'}},
            {screen: c => codeScreen(p, c, 'Виберіть PIN-код', 'PIN-код має містити щонайменше 4 цифри'), sequence: CODE_KEYS,
             say: `6 цифр надійніші за 4. Для цієї практики <strong>введіть ${codeText}</strong>. <em>Будь ласка, не вводьте тут свій справжній PIN-код.</em>`,
             hint: `Введіть ${codeText}, цифра за цифрою.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Виберіть PIN-код', 'PIN-код має містити щонайменше 4 цифри', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>Торкніться «Далі».</strong>'},
            {screen: c => codeScreen(p, c, 'Введіть PIN-код ще раз', ''), sequence: CODE_KEYS,
             say: `Телефон просить ще раз, щоб переконатися, що ви не помилилися. <strong>Введіть ${codeText} ще раз.</strong>`, hint: `Введіть ${codeText} ще раз.`},
            {screen: c => codeScreen(p, {...c, full: true}, 'Введіть PIN-код ще раз', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>Торкніться «Підтвердити».</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('Сповіщення на екрані блокування', [['show-all', 'Показувати весь вміст сповіщень'], ['hide-sensitive', 'Приховувати конфіденційний вміст'], ['dont-show', 'Взагалі не показувати сповіщення']], false),
             target: 'hide-sensitive',
             say: 'Телефон питає, які повідомлення показувати на заблокованому екрані. Хороший вибір — <strong>«Приховувати конфіденційний вміст»</strong>: ви побачите, що надійшло повідомлення, але не його текст. <strong>Торкніться цього пункту.</strong>',
             hints: {'show-all': 'Тоді все видно кожному, хто візьме телефон, зокрема коди від вашого банку. Торкніться «Приховувати конфіденційний вміст».',
                     'dont-show': 'Це теж можна, але ви не побачите, коли надходять повідомлення. Для цієї практики торкніться «Приховувати конфіденційний вміст».'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>Чудово, на вашому навчальному телефоні тепер є PIN-код!</strong> Тепер у блокуванні екрана вказано PIN-код.'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>Торкніться «Налаштувати Face ID».</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>Як налаштувати Face ID</strong>
                    <p>Спершу розмістіть обличчя в рамці камери. Потім повертайте голову по колу, щоб показати всі боки обличчя.</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">Почати</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: 'Потримайте телефон перед обличчям на відстані витягнутої руки, ніби робите селфі. <strong>Торкніться «Почати».</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: 'На справжньому iPhone ви тепер <strong>повільно рухаєте головою по колу</strong>, ніби малюєте носом коло. Під час сканування кільце заповнюється. Коли воно заповниться, <strong>торкніться «Продовжити»</strong>.',
                 hint: 'Зачекайте, поки коло заповниться, а потім торкніться «Продовжити».'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: 'Для певності телефон сканує вдруге. Знову повільно рухайте головою по колу. Коли закінчите, <strong>торкніться «Готово»</strong>.',
                 hint: 'Зачекайте, поки коло заповниться, а потім торкніться «Готово».', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: 'Друг просить додати <em>його</em> обличчя до вашого телефона «про всяк випадок». Що ви зробите?',
                    options: [
                        {t: 'Дозволити, це зручно', why: 'Той, чиє обличчя налаштовано, може відкрити ваш телефон і підтверджувати платежі у ваших застосунках. Додавайте лише власне обличчя.'},
                        {t: 'Відмовити. Мій телефон має розблоковувати лише моє обличчя', ok: true, why: 'Саме так. Якщо комусь, кому ви довіряєте, потрібен доступ, краще повідомте йому код-пароль, а потім за потреби змініть його.'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>Чудово, Face ID налаштовано!</strong> Тепер ви можете розблокувати телефон, просто глянувши на нього, а потім провівши пальцем угору.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Торкніться «Розблокування за обличчям і відбитком пальця».</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>Торкніться «Розблокування за обличчям».</strong>',
             hints: {'fingerprint-unlock': 'Це відбитки пальців, їм присвячено урок 3. Поки торкніться «Розблокування за обличчям».'}},
            {screen: () => consent(p, 'Розблоковуйте обличчям', 'Розблоковуйте телефон і підтверджуйте в застосунках, що це ви, за допомогою обличчя. Ваше обличчя зберігається лише на цьому телефоні.', 'Погоджуюся'),
             target: 'agree', say: 'Телефон пояснює, як він використовує ваше обличчя. <strong>Торкніться «Погоджуюся».</strong>',
             hints: {cancel: '«Скасувати» зупинить налаштування. Торкніться «Погоджуюся», щоб продовжити.'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: 'Тримайте телефон на рівні очей, на відстані витягнутої руки. На справжньому телефоні ви <strong>тримаєте обличчя в колі й повільно рухаєте головою</strong>. Коли закінчите, <strong>торкніться «Готово»</strong>.',
             hint: 'Зачекайте, поки коло заповниться, а потім торкніться «Готово».', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: 'На багатьох телефонах Android розблокування за обличчям менш надійне, ніж відбиток пальця. Що це означає для вас?',
                options: [
                    {t: 'Для всього підходить', why: 'На багатьох телефонах розблокування за обличчям використовує звичайну камеру, яку легше обдурити. Через це деякі банківські застосунки його не приймають.'},
                    {t: 'Користуватися ним для розблокування, а для банківських операцій — відбитком пальця чи PIN-кодом, якщо цього просить банк', ok: true, why: 'Правильно. Телефон підкаже, чи можна розблокування за обличчям використовувати для платежів і банківських операцій. Якщо ні, скористайтеся відбитком пальця чи PIN-кодом.'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>Чудово, розблокування за обличчям налаштовано!</strong> Тепер ви можете розблокувати телефон, просто глянувши на нього.'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>Торкніться «Додати відбиток…»</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: 'Touch ID використовує <strong>кнопку «Додому»</strong> спереду на старіших iPhone, як-от iPhone SE. <strong>Торкніться кнопки «Додому» внизу навчального телефона 6 разів</strong>, ніби піднімаєте й кладете палець.',
                 hint: 'Торкніться круглої кнопки «Додому» внизу навчального телефона.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Тепер потрібні краї подушечки пальця. <strong>Торкніться «Продовжити».</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: 'На справжньому iPhone ви кладете на кнопку <strong>боки й кінчик</strong> пальця. <strong>Торкніться кнопки «Додому» ще 4 рази.</strong>',
                 hint: 'Торкніться круглої кнопки «Додому» внизу.'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: 'Усе готово. <strong>Торкніться «Продовжити».</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: 'Який палець найкраще додати першим?',
                    options: [
                        {t: 'Великий або інший палець, яким ви найчастіше тримаєте телефон', ok: true, why: 'Так. Для кнопки «Додому» це зазвичай великий палець. Можна додати до 5 пальців, тож варто додати обидва великі.'},
                        {t: 'Будь-який палець, це неважливо', why: 'Працюватиме з будь-яким пальцем, але оберіть той, який природно лягає на кнопку, коли ви берете телефон, зазвичай великий.'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>Чудово, відбиток пальця налаштовано!</strong> Покладіть палець на кнопку «Додому», щоб розблокувати. Інші пальці можна додати так само.'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>Торкніться «Розблокування за обличчям і відбитком пальця».</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>Торкніться «Розблокування відбитком пальця».</strong>',
             hints: {'face-unlock': 'Це розблокування за обличчям, з уроку 2. Поки торкніться «Розблокування відбитком пальця».'}},
            {screen: () => consent(p, 'Розблоковуйте відбитком пальця', 'Розблоковуйте телефон або підтверджуйте, що це ви, наприклад під час входу в застосунки, за допомогою відбитка пальця. Ваш відбиток зберігається лише на цьому телефоні.', 'Погоджуюся'),
             target: 'agree', say: '<strong>Торкніться «Погоджуюся».</strong>', hints: {cancel: '«Скасувати» зупинить налаштування. Торкніться «Погоджуюся», щоб продовжити.'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: 'Сканер може бути на екрані, на задній панелі телефона або на кнопці живлення, і телефон покаже, де саме. Тут він на екрані. <strong>Торкніться сканера 6 разів</strong>, ніби піднімаєте й кладете палець.',
             hint: 'Торкніться круглого сканера внизу екрана.'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: 'Ваш відбиток записано. <strong>Торкніться «Готово».</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: 'Який палець найкраще додати першим?',
                options: [
                    {t: 'Палець, який природно торкається сканера, коли ви берете телефон', ok: true, why: 'Так. Для сканера на задній панелі це зазвичай вказівний палець, а для сканера на екрані чи збоку — великий. Можна додати кілька.'},
                    {t: 'Будь-який палець, це неважливо', why: 'Працюватиме будь-який палець, але оберіть той, який природно лягає на сканер. Так розблоковувати швидко й легко.'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>Чудово, відбиток пальця налаштовано!</strong> Торкніться сканера, щоб розблокувати. Інші пальці можна додати так само.'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', 'Соняшники в саду', '#fde68a'], ['🐶', 'Пес на дивані', '#fecaca'], ['🏖️', 'День на пляжі', '#bae6fd'],
                    ['🎂', 'Святковий торт', '#fbcfe8'], ['🌅', 'Захід сонця над морем', '#fed7aa'], ['🐈', 'Кіт спить', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? 'Прочитано' : state === 'sent' ? 'Надіслано' : 'Доставлено'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: 'Привіт, мамо, це я! Новий номер, старий телефон зламався…', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: 'Родина', last: 'Dave: Хто принесе торт? 🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: 'До зустрічі в четвер!', time: 'Учора', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: 'Привіт, мамо! 😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Новий чат' : 'Виберіть контакт'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['Родина', '#f59e0b', 'Dave, Jean, Sarah, ви'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? 'Додати (плюс)' : 'Прикріпити (скріпка)'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>Цього номера немає у ваших контактах.</p><div><button type="button" data-tap="block">Заблокувати</button><button type="button" data-tap="add-contact">Додати</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? 'Фото' : 'Галерея'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>Заблокувати +44 7700 900842?</strong></p><p class="fd">Заблоковані контакти не можуть вам телефонувати чи надсилати повідомлення.</p>
                <p class="fd">⟦square-check⟧ Поскаржитися до WhatsApp</p>
                <div class="et"><button type="button" data-tap="cancel">Скасувати</button><button type="button" data-tap="confirm-block">Заблокувати</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? 'Нещодавні' : 'Галерея'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>Виклик…</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? 'Увімкнути звук' : 'Вимкнути звук'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? 'Звук вимкнено на 1 тиждень' : 'Вимк.'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>Вимкнути сповіщення на…</strong></p>
                <button type="button" data-tap="mute-8h">8 годин</button><button type="button" data-tap="mute-week">1 тиждень</button><button type="button" data-tap="mute-always">Завжди</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['Налаштування', [['account', 'Обліковий запис', 'Сповіщення безпеки, зміна номера'], ['privacy', 'Конфіденційність', 'Блокування контактів, зникаючі повідомлення'],
                ['chats', 'Чати', 'Тема, шпалери'], ['notifications', 'Сповіщення', 'Звуки повідомлень, груп і дзвінків']]],
            account: ['Обліковий запис', [['twostep', 'Двоетапна перевірка', ctx.twoStep ? 'Увімк.' : 'Вимк.'], ['change-number', 'Змінити номер', ''], ['delete-account', 'Видалити обліковий запис', '']]],
            privacy: ['Конфіденційність', [['last-seen', 'Остання активність і статус «онлайн»', 'Усі'], ['profile-photo', 'Фото профілю', 'Усі'],
                ['groups', 'Групи', ctx.groupsSetting || 'Усі'], ['blocked', 'Заблоковані контакти', ctx.blocked ? '1' : 'Немає']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>Хто може додавати мене до груп</strong></p>
                <button type="button" data-tap="groups-everyone">Усі</button><button type="button" data-tap="groups-contacts">Мої контакти</button>
                <button type="button" data-tap="groups-except">Мої контакти, крім…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Двоетапна перевірка</h3><p>Для додаткового захисту ввімкніть двоетапну перевірку: тоді під час повторної реєстрації вашого номера в WhatsApp потрібен буде PIN-код.</p>
                <button type="button" class="ce ox" data-tap="turn-on">Увімкнути</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>Додайте електронну адресу</h3>
                <p>Додайте електронну адресу, щоб могти скинути PIN-код, якщо забудете його.</p>
                <div class="tk ex">ваша електронна адреса</div>
                <button type="button" class="ce ox" data-tap="email-next">Далі</button>
                <button type="button" class="cp wd" data-tap="skip">Пропустити</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>Двоетапну перевірку ввімкнено</h3><p>Вас попросять ввести PIN-код, якщо ви налаштуєте WhatsApp на новому телефоні.</p>
                <button type="button" class="ce ox" data-tap="done">Готово</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? 'Створіть 6-значний PIN-код' : 'Підтвердьте PIN-код'}</strong>
            <p>${stage === 'pin' ? 'Він знадобиться, щоб налаштувати WhatsApp на новому телефоні.' : 'Введіть той самий PIN-код ще раз.'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? 'Це ваш список чатів. Щоб почати новий, <strong>торкніться кнопки нового чату</strong> (олівець угорі праворуч).'
                          : 'Це ваш список чатів. Щоб почати новий, <strong>торкніться зеленої кнопки +</strong> унизу праворуч.',
         hints: {'chat-family': 'Це відкриває наявний чат. Натомість почніть новий.', 'chat-jean': 'Це відкриває наявний чат. Натомість почніть новий.'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp показує людей з ваших контактів, які ним користуються. <strong>Торкніться Sarah.</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: 'Спершу наберіть повідомлення в полі, а потім торкніться стрілки надсилання.',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: 'Привіт, мамо! 😊 Як приємно тебе чути!', n: 2}); },
         say: '<strong>Торкніться поля повідомлення</strong> внизу, <strong>наберіть коротке повідомлення</strong> (наприклад, «Привіт!») і <strong>торкніться стрілки надсилання</strong> ⟦send-horizontal⟧.',
         hints: {mic: 'Мікрофон потрібен для голосових повідомлень, до них ми ще дійдемо. Спершу наберіть повідомлення й торкніться стрілки надсилання.', attach: 'Це для фото, до них ми ще дійдемо. Спершу наберіть повідомлення й торкніться «Надіслати».'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah відповіла! Під вашим повідомленням з\'явилися <strong>дві сині позначки ⟦check-check⟧</strong>. Що вони означають?',
            options: [
                {t: 'Повідомлення не вдалося надіслати', why: 'Якщо не вдалося, біля повідомлення видно маленький годинник або червоне попередження. Позначки означають, що все спрацювало.'},
                {t: 'Sarah прочитала його', ok: true, why: 'Так! Одна сіра позначка — надіслано, дві сірі — доставлено на її телефон, а дві сині — вона прочитала.'},
                {t: 'Його надіслано двічі', why: 'Ні, його надіслано лише один раз. Дві сині позначки означають, що його прочитано.'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `Тепер надішліть фото. <strong>Торкніться ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong> поруч із полем повідомлення.`,
         hints: {camera: 'Камера робить нове фото. Щоб надіслати вже зроблене фото, торкніться ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>Торкніться ${p === 'ios' ? 'Фото' : 'Галерея'}</strong>, щоб вибрати зі світлин на телефоні.`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: 'Це (навчальні) фото на вашому телефоні. <strong>Торкніться соняшників</strong> 🌻.',
         hint: 'Торкніться фото із соняшниками.'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: 'Чудово! 🌻 Це з вашого саду?', n: 4}); },
         say: 'За бажанням можна набрати підпис. Потім <strong>торкніться стрілки надсилання</strong> ⟦send-horizontal⟧.'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: 'Голосові повідомлення зручні, якщо набирати текст важко. На справжньому телефоні ви <strong>утримуєте мікрофон</strong> ⟦mic⟧, поки говорите, а потім відпускаєте, щоб надіслати. Тут <strong>торкніться мікрофона один раз, щоб почати, а потім стрілки надсилання</strong>, щоб надіслати.',
         hint: 'Торкніться мікрофона, а потім стрілки надсилання.'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>Чудово!</strong> Ви надіслали повідомлення, фото й голосове повідомлення. Щоб будь-коли відповісти Sarah, відкрийте WhatsApp і торкніться її чату.'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>Торкніться чату з Sarah</strong>, щоб відкрити його.'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: 'Угорі чату є дві кнопки дзвінка: <strong>відеокамера</strong> для відеодзвінка й <strong>телефон</strong> для голосового дзвінка. <strong>Торкніться відеокамери</strong> ⟦video⟧.',
         hints: {voice: 'Це голосовий дзвінок, без відео. Для цієї практики торкніться відеокамери.'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: 'Дзвонить телефон Sarah, а коли вона відповість, ви бачитимете одне одного. Якщо там, де ви, шумно, <strong>торкніться мікрофона</strong> ⟦mic⟧, щоб вимкнути свій звук.',
         hint: 'Кнопка мікрофона у рядку внизу.', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: 'Ваш звук вимкнено: Sarah бачить вас, але не чує. Щоб їй щось показати, <strong>торкніться кнопки перемикання</strong> ⟦switch-camera⟧, щоб перейти на камеру на задній панелі телефона.',
         hints: {mute: 'Згодом торкніться мікрофона ще раз, щоб увімкнути звук. Поки спробуйте кнопку перемикання.'}},
        {screen: c => waCall(p, c), target: 'end',
         say: 'Тепер Sarah бачить те, на що ви спрямовуєте телефон. Коли закінчите, <strong>торкніться червоної кнопки</strong>, щоб завершити дзвінок.',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Відеодзвінки витрачають багато даних. Як краще їх робити?',
            options: [
                {t: 'Через Wi-Fi вдома, коли можливо', ok: true, why: 'Так. Через Wi-Fi дзвінки не витрачають ваш мобільний трафік, тож вони безкоштовні, скільки б ви не розмовляли.'},
                {t: 'Це неважливо', why: 'Довгий відеодзвінок через мобільний інтернет може швидко вичерпати ваш трафік. Найкраще користуватися Wi-Fi, коли можна.'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: 'Тепер про групи. У групі «Родина» багато нових повідомлень, і сповіщення постійно вібрують. <strong>Торкніться групи «Родина».</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: 'Щоб змінити налаштування групи, <strong>торкніться її назви</strong> угорі.', hint: 'Торкніться слова «Родина» вгорі екрана.'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>Торкніться «Вимкнути сповіщення».</strong> Повідомлення все одно надходитимуть, але телефон не вібруватиме від кожного.',
         hints: {'exit-group': '«Вийти з групи» означає повністю її залишити. М\'якший варіант — вимкнути сповіщення: ви залишаєтеся в групі, але без вібрації.'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: 'Оберіть, на який час. <strong>Торкніться «1 тиждень».</strong>',
         hints: {'mute-8h': '«8 годин» теж підійде. Для цієї практики торкніться «1 тиждень».', 'mute-always': '«Завжди» теж підійде, але ви можете щось пропустити. Для цієї практики торкніться «1 тиждень».'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>Чудово!</strong> Ви зробили відеодзвінок, вимкнули свій звук, перемкнули камеру й вимкнули сповіщення галасливої групи. Повідомлення групи все одно можна читати будь-коли.'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: 'Привіт!', ticks: 'read', n: 1}, {text: 'Привіт, мамо! 😊', n: 2}],
        family: [{from: 'Jean', text: 'Обід у неділю в нас? 🍗', n: 1}, {from: 'Sarah', text: 'Так, будь ласка!', n: 2}, {from: 'Dave', text: 'Хто принесе торт? 🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'Власні налаштування WhatsApp — всередині застосунку. <strong>Торкніться «Налаштування»</strong> унизу праворуч.',
                hints: {'chat-unknown': 'З цим повідомленням розберемося пізніше. Спершу торкніться «Налаштування» унизу праворуч.'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'Власні налаштування WhatsApp — всередині застосунку. <strong>Торкніться трьох крапок ⋮</strong> угорі праворуч.',
                hints: {'chat-unknown': 'З цим повідомленням розберемося пізніше. Спершу торкніться трьох крапок угорі праворуч.'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>Торкніться «Налаштування».</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>Торкніться «Обліковий запис».</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>Двоетапна перевірка</strong> додає PIN-код, який потрібен, якщо хтось спробує налаштувати ваш WhatsApp на іншому телефоні. Навіть якщо шахрай дізнається ваш 6-значний код, він не зможе увійти. <strong>Торкніться «Двоетапна перевірка».</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>Торкніться «Увімкнути».</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `Оберіть 6-значний PIN-код, інший, ніж код-пароль телефона. Для цієї практики <strong>введіть ${pinText}</strong>. <em>Не вводьте тут справжній PIN-код.</em>`,
             hint: `Введіть навчальний PIN-код ${pinText}.`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>Введіть ${pinText} ще раз</strong>, щоб підтвердити.`, hint: `Введіть ${pinText} ще раз.`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: 'Якщо додати електронну адресу, PIN-код можна буде скинути, якщо ви його забудете. Це варто зробити на справжньому телефоні. Тут <strong>торкніться «Далі»</strong>.',
             hints: {skip: 'Можна пропустити, але тоді, забувши PIN-код, ви можете втратити доступ. Для цієї практики торкніться «Далі».'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: 'Двоетапну перевірку ввімкнено. <strong>Торкніться «Готово».</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: 'Повідомлення нібито від <em>«Підтримки WhatsApp»</em> просить ваш PIN-код двоетапної перевірки, щоб «підтвердити обліковий запис». Що ви зробите?',
                options: [
                    {t: 'Надіслати, це ж від WhatsApp', why: 'WhatsApp ніколи не напише вам із проханням назвати PIN-код чи код. Це шахрай, який намагається захопити ваш обліковий запис.'},
                    {t: 'Не відповідати, а заблокувати й поскаржитися', ok: true, why: 'Саме так. Ніхто, зокрема й WhatsApp, не повинен просити ваш PIN-код чи 6-значний код.'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: 'Далі не дозволимо незнайомцям додавати вас до груп. Це в розділі <strong>Приватність</strong>. <strong>Торкніться «Групи».</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = 'Мої контакти'; },
             say: '«Усі» означає, що будь-який незнайомець може додати вас до групи, чим користуються шахраї. <strong>Торкніться «Мої контакти».</strong>',
             hints: {'groups-everyone': '«Усі» дозволяє незнайомцям додавати вас до груп, зокрема шахрайських. Торкніться «Мої контакти».'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: 'Надійшло повідомлення з невідомого номера: «Привіт, мамо, це я! Новий номер…». Це шахрайство «Привіт, мамо». <strong>Торкніться його, щоб відкрити.</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: 'Привіт, мамо, це я! Новий номер, старий телефон зламався. Можеш допомогти мені сплатити рахунок? Завтра віддам x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: 'Не відповідайте. WhatsApp помічає, що цього номера немає у ваших контактах. <strong>Торкніться «Заблокувати».</strong>',
             hints: {'add-contact': 'Не додавайте шахрая до контактів. Торкніться «Заблокувати».', video: 'Не передзвонюйте їм. Торкніться «Заблокувати».', voice: 'Не передзвонюйте їм. Торкніться «Заблокувати».'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: 'Привіт, мамо, це я! Новий номер, старий телефон зламався. Можеш допомогти мені сплатити рахунок? Завтра віддам x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: 'Позначка «Поскаржитися до WhatsApp» увімкнена, це допомагає WhatsApp зупинити шахрая. <strong>Торкніться «Заблокувати».</strong>',
             hints: {cancel: '«Скасувати» залишить їм змогу писати вам. Торкніться «Заблокувати».'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>Чудово!</strong> Ви ввімкнули двоетапну перевірку, не дозволили незнайомцям додавати вас до груп, а також заблокували шахрая й поскаржилися на нього. Якщо ви сумніваєтеся щодо повідомлення від рідних, зателефонуйте їм на номер, який у вас уже є.'},
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">Застосунки, що підтримують динамічний розмір тексту, підлаштуються під ваш розмір для читання.</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, 'Розмір тексту', [], {top: slider, back: 'Екран'});
        return list(p, 'Розмір екрана й тексту', [{caption: 'Розмір шрифту'}, {id: 'bold', label: 'Жирний текст', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Розмір тексту налаштовується в застосунку <strong>Параметри</strong>. <strong>Торкніться «Параметри».</strong>', hint: 'Параметри — це сірий значок із шестірнею.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Торкніться «Екран і яскравість».</strong>', hint: 'Це в третій групі, під «Універсальним доступом».'},
        {screen: c => list(p, 'Екран і яскравість', [{caption: 'ВИГЛЯД'}, {label: 'Світла', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Розмір тексту'}, {id: 'bold', label: 'Жирний текст', toggle: !!c.bold}], {back: 'Налаштування'}),
         target: 'text-size', say: '<strong>Торкніться «Розмір тексту».</strong>', hints: {bold: '«Жирний текст» буде далі. Спершу торкніться «Розмір тексту».'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Перетягніть повзунок праворуч, щоб збільшити текст. Тут <strong>двічі торкніться великої літери A</strong> і дивіться, як росте текст.', hint: 'Торкніться великої літери A праворуч від повзунка.'},
        {screen: c => textSizePage(p, c), target: 'back', say: 'Набагато легше читати! Тепер <strong>торкніться ‹ Екран</strong> угорі, щоб повернутися.'},
        {screen: c => list(p, 'Екран і яскравість', [{caption: 'ВИГЛЯД'}, {label: 'Світла', value: '⟦check⟧'}, {caption: 'ТЕКСТ'}, {id: 'text-size', label: 'Розмір тексту'}, {id: 'bold', label: 'Жирний текст', toggle: !!c.bold}], {back: 'Налаштування'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>Жирний текст</strong> робить літери товстішими й чіткішими. <strong>Торкніться, щоб увімкнути.</strong>'},
        {screen: c => list(p, 'Екран і яскравість', [{caption: 'ТЕКСТ'}, {label: 'Розмір тексту'}, {label: 'Жирний текст', toggle: true}], {back: 'Налаштування'}),
         question: {q: 'Текст усе ще замалий, навіть при найбільшому розмірі?', options: [
            {t: 'Більше нічого не зробити', why: 'Є ще варіанти! Параметри > Універсальний доступ > Екран і розмір тексту > Збільшений текст дає ще більші розміри.'},
            {t: 'Параметри > Універсальний доступ > Екран і розмір тексту > Збільшений текст', ok: true, why: 'Так. Увімкніть там «Збільшені розміри для універсального доступу», щоб отримати справді великий текст.'}]}},
        {screen: c => list(p, 'Екран і яскравість', [{caption: 'ТЕКСТ'}, {label: 'Розмір тексту'}, {label: 'Жирний текст', toggle: true}], {back: 'Налаштування'}), done: true,
         say: '<strong>Чудово!</strong> Ваш текст став більшим і жирнішим, у Параметрах і в більшості застосунків.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Розмір тексту налаштовується в застосунку <strong>Параметри</strong>. <strong>Торкніться «Параметри».</strong>', hint: 'Налаштування — це значок із шестірнею.'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>Торкніться «Екран і дотик».</strong> <em>На Samsung це «Дисплей», потім «Розмір і стиль шрифту».</em>'},
        {screen: () => list(p, 'Екран і дотик', [{id: 'dark', label: 'Темна тема', toggle: false}, {id: 'text-size', label: 'Розмір екрана й тексту', sub: 'Розмір шрифту, жирний текст'}, {id: 'brightness', label: 'Рівень яскравості', value: '70%'}]),
         target: 'text-size', say: '<strong>Торкніться «Розмір екрана й тексту».</strong>', hints: {dark: 'Темна тема змінює кольори, а не розмір. Торкніться «Розмір екрана й тексту».'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: 'Перетягніть повзунок «Розмір шрифту» праворуч, щоб збільшити текст. Тут <strong>двічі торкніться великої літери A</strong>.', hint: 'Торкніться великої літери A праворуч від повзунка.'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>Жирний текст</strong> робить літери чіткішими. <strong>Торкніться, щоб увімкнути.</strong>'},
        {screen: c => textSizePage(p, c), question: {q: 'Текст усе ще замалий, навіть при найбільшому розмірі?', options: [
            {t: 'Більше нічого не зробити', why: 'Спробуйте також «Розмір екрана» на тій самій сторінці: він збільшує все, зокрема кнопки й значки.'},
            {t: 'Збільшити також розмір екрана', ok: true, why: 'Так. «Розмір екрана» збільшує все на екрані, а не лише текст.'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>Чудово!</strong> Ваш текст став більшим і жирнішим, у Параметрах і в більшості застосунків.'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' на фіолетовому' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? 'Не турбувати' : 'Фокусування'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? 'Не турбувати · Увімк.' : 'Не турбувати · Вимк.'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Проведіть угору, щоб закрити' : 'Закрити'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? 'Якщо телефон не дзвонить, можливо, увімкнено «Не турбувати». Швидкі налаштування знаходяться в <strong>Пункті керування</strong>: <strong>проведіть пальцем вниз від правого верхнього кута</strong> (або торкніться смужки вгорі).'
                          : 'Якщо телефон не дзвонить, можливо, увімкнено «Не турбувати». <strong>Проведіть пальцем вниз від верхнього краю екрана</strong>, щоб побачити швидкі налаштування (або торкніться смужки вгорі).',
         hints: {'pull-up': 'Проведіть в інший бік: вниз від верхнього краю.', 'pull-left': 'Проведіть вниз, а не вбік.', 'pull-right': 'Проведіть вниз, а не вбік.', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `Місяць ⟦moon⟧ означає, що <strong>«Не турбувати» увімкнено</strong>, тож дзвінки й повідомлення без звуку. <strong>Торкніться його, щоб вимкнути.</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: 'Тепер збільште гучність <strong>кнопкою гучності збоку телефона</strong> (верхньою). <strong>Торкніться ＋ на краю навчального телефона 3 рази.</strong>',
         hint: 'Торкніться кнопки ＋ на правому краї телефона.'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: 'iPhone все одно не дзвонить. У чому ще може бути річ?', options: [
                {t: 'Перемикач «Дзвінок/Без звуку» або кнопка дії стоїть на беззвучному режимі', ok: true, why: 'Так. На багатьох iPhone над кнопками гучності є маленький перемикач: якщо видно оранжевий колір, телефон у беззвучному режимі. На новіших замість нього кнопка дії.'},
                {t: 'Телефон зламався', why: 'Зазвичай ні! Спершу перевірте перемикач беззвучного режиму над кнопками гучності.'}]}
            : {q: 'Ви натиснули кнопку гучності, але змінилася лише гучність медіа. Що тепер?', options: [
                {t: 'Торкнутися значка ⋯ або налаштувань на смузі гучності, щоб побачити гучність дзвінка', ok: true, why: 'Так. Кнопки гучності часто змінюють гучність медіа; торкніться трьох крапок на смузі гучності, щоб змінити гучність дзвінка.'},
                {t: 'Здатися', why: 'Торкніться трьох крапок ⋯ на смузі гучності, що з\'явилася, і збільште гучність дзвінка.'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>Чудово!</strong> Режим «Не турбувати» вимкнено, гучність збільшено, тож ви почуєте дзвінки й повідомлення.'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>ПАРАЦЕТАМОЛ 500 мг</strong><br>Приймайте по 1–2 таблетки кожні 4–6 годин.<br>Не приймайте більше 8 таблеток за 24 години.</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', 'Лупа', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? 'На iPhone є застосунок <strong>«Лупа»</strong>. Якщо його немає на головному екрані, проведіть пальцем вниз посередині екрана й наберіть «Лупа». <strong>Торкніться «Лупа».</strong>'
                          : 'На багатьох телефонах Android є застосунок <strong>«Лупа»</strong>. <em>На Samsung він у швидких налаштуваннях або в розділі «Доступність».</em> <strong>Торкніться «Лупа».</strong>',
         hint: 'Шукайте чорний значок із лупою.'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: 'Наведіть телефон на щось дрібне, як-от ця етикетка ліків. <strong>Тричі торкніться ＋</strong>, щоб збільшити (на справжньому телефоні можна перетягнути повзунок).', hint: 'Торкніться ＋ праворуч від повзунка.'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: 'У тьмяному світлі допоможе ліхтарик. <strong>Торкніться ліхтарика</strong> ⟦flashlight⟧.'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: 'Тремтять руки? <strong>Торкніться великої круглої кнопки</strong>, щоб зупинити зображення, і ви зможете читати, не тримаючи телефон нерухомо.'},
        {screen: c => magnifierScreen(p, c), question: {q: 'Для чого ще зручна лупа?', options: [
            {t: 'Читати меню, цінники й дрібний шрифт у листах', ok: true, why: 'Так, і вона завжди в кишені. Дехто тримає її в Пункті керування чи швидких налаштуваннях, щоб відкривати одним дотиком.'},
            {t: 'Робити дзвінки гучнішими', why: 'Це кнопки гучності. Лупа допомагає краще бачити дрібні речі.'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>Чудово!</strong> Тепер ви вмієте збільшувати дрібний шрифт, підсвічувати його й зупиняти зображення.'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? 'Побачимося на кавовому ранку в четвер' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>Ти прийдеш у четвер? ☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">Текстове повідомлення</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ Слухаю… говоріть</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Можна говорити замість набору тексту. <strong>Відкрийте «Повідомлення».</strong>', hint: '«Повідомлення» — це зелена хмаринка для розмови.'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean запитала про четвер. <strong>Торкніться поля повідомлення</strong> внизу.'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: 'З\'являється клавіатура. <strong>Торкніться мікрофона</strong> ⟦mic⟧ на клавіатурі, а потім продиктуйте повідомлення.', hint: 'Мікрофон на клавіатурі, поруч із пробілом.'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: 'На справжньому телефоні ви б тепер сказали: <em>«Побачимося на кавовому ранку в четвер»</em>. Слова з\'являються, поки ви говорите. Перевірте їх, а потім <strong>торкніться «Надіслати»</strong> ⟦send-horizontal⟧.',
         hint: 'Зачекайте, поки з\'являться слова, а потім торкніться стрілки надсилання.'},
        {screen: () => home(p), target: 'settings',
         say: 'Телефон також може <strong>читати вам уголос</strong>. Увімкнімо це. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Торкніться «Універсальний доступ».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступність', [{caption: 'ЗІР'}, {id: 'voiceover', label: 'VoiceOver', value: 'Вимк.'}, {id: 'zoom', label: 'Збільшення', value: 'Вимк.'}, {id: 'spoken', label: 'Усний вміст'}], {back: 'Налаштування'})
            : list(p, 'Доступність', [{id: 'select-speak', label: 'Озвучення вибраного', sub: 'Вимк.'}, {id: 'talkback', label: 'TalkBack', sub: 'Вимк.'}, {id: 'magnification', label: 'Збільшення'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>Торкніться «Усний вміст».</strong>' : '<strong>Торкніться «Озвучення вибраного».</strong>',
         hints: {voiceover: 'VoiceOver змінює роботу всього телефона, що може збивати з пантелику. Торкніться «Усний вміст».', talkback: 'TalkBack змінює роботу всього телефона, що може збивати з пантелику. Торкніться «Озвучення вибраного».'}},
        {screen: c => p === 'ios'
            ? list(p, 'Усний вміст', [{id: 'speak-selection', label: 'Озвучити виділене', toggle: !!c.speakSel}, {id: 'speak-screen', label: 'Озвучити екран', toggle: !!c.speakScreen, sub: 'Проведіть двома пальцями вниз від верхнього краю екрана, щоб почути, як його читають уголос.'}], {back: 'Доступність'})
            : list(p, 'Озвучення вибраного', [{id: 'speak-screen', label: 'Використовувати «Озвучення вибраного»', toggle: !!c.speakScreen, sub: 'Торкніться ярлика, а потім будь-чого на екрані, щоб почути, як це читають уголос.'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>Увімкніть «Озвучити екран».</strong> Тоді в будь-якому місці телефона, якщо провести двома пальцями вниз від верхнього краю, екран читатимуть уголос.' : '<strong>Увімкніть «Використовувати "Озвучення вибраного"».</strong> З\'явиться маленька кнопка-ярлик: торкніться її, а потім будь-якого тексту, щоб почути його.',
         hints: {'speak-selection': 'Це читає лише виділені слова. Простіше «Озвучити екран»: увімкніть його.'}},
        {screen: c => p === 'ios'
            ? list(p, 'Усний вміст', [{label: 'Озвучити виділене', toggle: false}, {label: 'Озвучити екран', toggle: true}], {back: 'Доступність'})
            : list(p, 'Озвучення вибраного', [{label: 'Використовувати «Озвучення вибраного»', toggle: true}]), done: true,
         say: '<strong>Чудово!</strong> Тепер ви можете говорити замість набору тексту, а телефон може читати вам уголос.'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Багато слухових апаратів можна підключити до телефона, щоб дзвінки й музика йшли прямо в них. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>Торкніться «Універсальний доступ».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступність', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слухові пристрої'}, {id: 'live-captions', label: 'Живі субтитри', value: c.captions ? 'Увімк.' : 'Вимк.'}, {id: 'subtitles', label: 'Субтитри та підписи'}], {back: 'Налаштування'})
            : list(p, 'Доступність', [{id: 'hearing-devices', label: 'Слухові апарати', sub: c.paired ? 'Підключено' : 'Не підключено'}, {id: 'live-captions', label: 'Живі субтитри', sub: c.captions ? 'Увімк.' : 'Вимк.'}, {id: 'sound-amp', label: 'Підсилювач звуку'}]),
         target: 'hearing-devices', say: `<strong>Торкніться ${p === 'ios' ? 'Слухові пристрої' : 'Слухові апарати'}.</strong> Спершу вставте слухові апарати й закрийте дверцята батарейних відсіків, щоб їх перезапустити, і телефон зможе їх знайти.`,
         hints: {'live-captions': 'Субтитри будуть далі. Спершу підключіть слухові апарати.'}},
        {screen: c => list(p, p === 'ios' ? 'Слухові пристрої' : 'Слухові апарати', [{caption: p === 'ios' ? 'СЛУХОВІ ПРИСТРОЇ MFI' : 'Доступні пристрої'}, {id: 'aids', label: 'Слухові апарати Margaret', sub: 'Лівий і правий'}],
            {overlay: c.pairing ? dialog(p, 'Створити пару зі «Слухові апарати Margaret»?', 'Їх використовуватимуть для дзвінків і звуку.', [['cancel', 'Скасувати'], ['pair', 'Створити пару']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: 'Телефон знаходить їх. <strong>Торкніться своїх слухових апаратів.</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Слухові пристрої' : 'Слухові апарати', [{id: 'aids', label: 'Слухові апарати Margaret', sub: 'Лівий і правий'}],
            {overlay: dialog(p, 'Створити пару зі «Слухові апарати Margaret»?', 'Їх використовуватимуть для дзвінків і звуку.', [['cancel', 'Скасувати'], ['pair', 'Створити пару']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>Торкніться «Створити пару».</strong> (Якщо слухових апаратів два, телефон може запитати двічі, по одному разу для кожного.)'},
        {screen: c => list(p, p === 'ios' ? 'Слухові пристрої' : 'Слухові апарати', [{label: 'Слухові апарати Margaret', sub: 'Підключено ⟦check⟧'}]), target: 'back',
         say: 'Підключено! Тепер дзвінки лунатимуть через слухові апарати. <strong>Торкніться «Назад».</strong>'},
        {screen: c => p === 'ios'
            ? list(p, 'Доступність', [{caption: 'СЛУХ'}, {id: 'hearing-devices', label: 'Слухові пристрої'}, {id: 'live-captions', label: 'Живі субтитри', value: c.captions ? 'Увімк.' : 'Вимк.'}], {back: 'Налаштування'})
            : list(p, 'Доступність', [{id: 'hearing-devices', label: 'Слухові апарати', sub: 'Підключено'}, {id: 'live-captions', label: 'Живі субтитри', sub: c.captions ? 'Увімк.' : 'Вимк.'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? 'Живі субтитри' : 'Живі субтитри'}</strong> показує на екрані слова з усього, що звучить: відео, дзвінків і голосових повідомлень. <strong>Торкніться, щоб увімкнути.</strong>`},
        {screen: c => list(p, 'Доступність', [{label: p === 'ios' ? 'Живі субтитри' : 'Живі субтитри', toggle: true}, {label: 'Слухові апарати', sub: 'Підключено'}]), done: true,
         say: '<strong>Чудово!</strong> Ваші слухові апарати підключено, а вимовлені слова тепер з\'являються як субтитри.'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['Мураха', 'Борсук', 'Кіт', 'Пес', 'Орел', 'Лисиця', 'Коза', 'Їжак', 'Ібіс', 'Галка', 'Рибалочка', 'Ягня', 'Кріт',
                     'Тритон', 'Видра', 'Тупик', 'Малинівка', 'Тюлень', 'Ропуха', 'Полівка', 'Крапивник', 'Зебра'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>Утримуйте квітку</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>Копіювати</span><span>Поділитися</span><span>Видалити</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>Зебра</h3><p>У зебр чорно-білі смуги. Немає двох зебр з однаковим візерунком.</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>Торкнутися</strong> означає легко доторкнутися до екрана одним пальцем і одразу відпустити, як натиснути кнопку. <strong>Торкніться зірочки.</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>Утримувати</strong> означає тримати палець на чомусь секунду-дві. Зазвичай з\'являються додаткові параметри. <strong>Утримуйте квітку</strong>, доки щось не станеться. (З мишею утримуйте кнопку натиснутою.)',
         hint: 'Тримайте палець на квітці секунду-дві.'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: 'З\'явилося меню. Що зазвичай дає утримування?', options: [
            {t: 'Показує додаткові параметри, як-от копіювати, поділитися чи видалити', ok: true, why: 'Так. Утримування на повідомленнях, фото й застосунках відкриває такі параметри.'},
            {t: 'Одразу видаляє речі', why: 'Ні, воно лише показує меню параметрів. Нічого не станеться, доки ви не оберете один із них.'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>Провести пальцем</strong> означає ковзнути пальцем екраном, ніби перегортаєте сторінку. <strong>Двічі проведіть пальцем ліворуч по фото</strong>, щоб побачити наступні. (З мишею клацніть, потягніть і відпустіть.)',
         hint: 'Проведіть пальцем по фото справа наліво. Або скористайтеся кнопкою «Не виходить провести?».'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>Прокручувати</strong> означає ковзати пальцем угору екраном, щоб побачити більше зі списку, як-от цього. <strong>Прокрутіть вниз і торкніться «Зебра»</strong>, на самому кінці. (З мишею користуйтеся коліщатком.)',
         hint: 'Посуньте список пальцем угору, щоб дістатися до «Зебра» внизу.'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? 'Щоб повернутися на сторінку назад на iPhone, <strong>торкніться ‹ Назад</strong> угорі ліворуч (або проведіть пальцем від лівого краю екрана).' : 'Щоб повернутися на сторінку назад на Android, <strong>торкніться стрілки назад ◁</strong> унизу (або проведіть пальцем від лівого чи правого краю екрана).',
         hints: {'home-pill': 'Це повертає на головний екран. Натомість торкніться стрілки назад ◁.', 'home-bar': 'Це повертає на головний екран. Натомість торкніться ‹ Назад.'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? 'Щоб перейти на головний екран звідки завгодно, <strong>проведіть пальцем угору від смужки внизу</strong> екрана (або торкніться смужки тут). На старіших iPhone з круглою кнопкою «Додому» натисніть її.'
                          : 'Щоб перейти на головний екран звідки завгодно, <strong>торкніться кружечка «Додому» ○</strong> унизу (або проведіть пальцем угору від нижнього краю).',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': '«Назад» повертає на одну сторінку. Торкніться кружечка «Додому» ○, щоб перейти на головний екран.'}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> Ви потренувалися торкатися, утримувати, проводити пальцем, прокручувати, повертатися назад і переходити на головний екран: це рухи, якими ви користуватиметеся щодня.'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: 'Підключено', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : 'Інтернет', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? 'МЕРЕЖІ' : 'Доступні мережі'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: 'Налаштування',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>Введіть пароль для «BT-Hub-7F2A»</strong></p>
                ${field('wifipass', 'Пароль', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? 'Приєднатися' : 'Підключити'}</button>
                <button type="button" class="cp" data-tap="cancel">Скасувати</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Wi-Fi вдома заощаджує мобільний трафік. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>Торкніться «Wi-Fi»</strong> ближче до верху.'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>Торкніться «Мережа й інтернет».</strong> <em>На Samsung це «Підключення», потім «Wi-Fi».</em>'},
               {screen: () => list(p, 'Мережа й інтернет', [{id: 'internet', label: 'Інтернет', sub: 'Wi-Fi і мобільний інтернет'}, {id: 'sims', label: 'SIM-карти'}, {id: 'hotspot', label: 'Точка доступу й режим модема'}]),
                target: 'internet', say: '<strong>Торкніться «Інтернет».</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: 'Назва й пароль Wi-Fi зазвичай вказані на наклейці на задній панелі вашого роутера (коробки зі світлодіодами). На наклейці цього навчального роутера написано:<br><span class="ahd">Мережа: <strong>BT-Hub-7F2A</strong><br>Пароль: <strong>Green-Apple-42</strong></span><strong>Торкніться BT-Hub-7F2A.</strong>',
         hints: {'net-vm-neighbour': 'Це Wi-Fi сусіда. Знайдіть назву на своїй наклейці: BT-Hub-7F2A.', 'net-sky-12345': 'Це чужий Wi-Fi. Знайдіть назву на своїй наклейці: BT-Hub-7F2A.'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: 'Пароль має точно збігатися з наклейкою, зокрема великі літери й дефіси: Green-Apple-42',
         say: 'Введіть пароль <strong>точно</strong>, як на наклейці: <strong>Green-Apple-42</strong>. Великі літери мають значення! Потім <strong>торкніться «Приєднатися»</strong>.'},
        {screen: c => wifiList(p, c), question: {q: 'Ви підключені! Відтепер телефон сам приєднуватиметься до цього Wi-Fi, коли ви вдома. Чи безпечно користуватися безкоштовним Wi-Fi у кафе?', options: [
            {t: 'Так, для перегляду сайтів, але не для онлайн-банкінгу', ok: true, why: 'Саме так. Публічний Wi-Fi підходить, щоб почитати новини чи глянути розклад автобусів. Для банківських справ користуйтеся мобільним інтернетом або домашнім Wi-Fi.'},
            {t: 'Так, для всього', why: 'За публічним Wi-Fi можуть стежити інші. Для перегляду сайтів він підходить, але для банківських справ користуйтеся мобільним інтернетом або домашнім Wi-Fi.'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>Чудово!</strong> Ви підключені до Wi-Fi. Шукайте значок Wi-Fi у вигляді віяла вгорі екрана.'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? 'Новий контакт' : 'Створити контакт', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', 'Ім\'я', ctx)}<span class="se">Mobile number</span>${field('cnum', 'Номер мобільного', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Зберегти'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || 'Контакт', [
        {label: 'мобільний', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? 'Додати до обраного' : (ctx.fav ? '⟦star⟧ Обране' : '⟦star⟧ Додати до обраного')},
        {id: 'share', label: 'Поділитися контактом'}], {back: 'Контакти'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', 'Контакти', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? 'Збережений номер дає змогу телефонувати людині за іменем. На iPhone контакти в застосунку <strong>Телефон</strong>. <strong>Торкніться «Телефон».</strong>' : '<strong>Торкніться «Контакти».</strong>'},
        {screen: () => p === 'ios'
            ? app(p, 'Контакти', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, 'Контакти', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? 'Це ваш список контактів. Щоб додати людину, <strong>торкніться +</strong> угорі праворуч.' : 'Це ваш список контактів. Щоб додати людину, <strong>торкніться кнопки +</strong>.'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: 'Введіть ім\'я та навчальний номер 07700 900456, а потім торкніться ' + (p === 'ios' ? '«Готово».' : '«Зберегти».'),
         say: `Введіть <strong>ім'я</strong> людини (спробуйте «Ann») і її номер. Для практики використайте <strong>07700 900456</strong>. Потім <strong>торкніться ${p === 'ios' ? 'Готово' : 'Зберегти'}</strong>.`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: 'Збережено! Обране — це люди, яким ви телефонуєте найчастіше; вони вгорі, щоб дзвонити їм одним дотиком. <strong>Торкніться ' + (p === 'ios' ? 'Додати до обраного' : 'зірочки') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: 'Який контакт варто зберегти з позначкою «ICE» (на випадок надзвичайної ситуації) перед іменем?', options: [
            {t: 'Найближчого родича, наприклад «ICE Sarah»', ok: true, why: 'Так. Медики знають, що шукати ICE. Ще краще додати контакт для екстрених випадків до медичної картки; це розглянуто в курсі «Безпека телефона».'},
            {t: 'Ваш банк', why: 'ICE — для людини, з якою треба зв\'язатися, якщо з вами щось трапиться, зазвичай найближчого родича.'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>Чудово!</strong> Ви зберегли контакт і додали його до обраного.'},
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
    const recents = p => app(p, 'Нещодавні', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: 'Вам дзвонять: телефонує Jean. <strong>Торкніться зеленої кнопки, щоб відповісти.</strong>' + (p === 'android' ? ' <em>На деяких телефонах Android замість цього зелену кнопку проводять угору.</em>' : ' <em>Якщо iPhone заблоковано, зелену кнопку замість цього проводять убік.</em>'),
         hints: {decline: 'Червона відхиляє дзвінок. Щоб відповісти, торкніться зеленої.'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: 'Ви розмовляєте! Щоб краще чути або говорити, не тримаючи телефон біля вуха, <strong>торкніться гучномовця</strong>.'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: 'Коли закінчите, <strong>торкніться червоної кнопки</strong>, щоб покласти слухавку.'},
        {screen: () => recents(p), target: 'call-dave',
         say: 'Раніше ви пропустили дзвінок від Dave. Пропущені дзвінки в нещодавніх позначено <strong>червоним</strong>. <strong>Торкніться Dave</strong>, щоб передзвонити йому.'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: 'Іде виклик Dave. Коли закінчите розмову, <strong>торкніться червоної кнопки</strong>, щоб покласти слухавку.'},
        {screen: () => recents(p), question: {q: 'Вам телефонує незнайомий номер, і людина каже, що вона з вашого банку. Що ви зробите?', options: [
            {t: 'Покласти слухавку й зателефонувати на 159, щоб безпечно зв\'язатися з банком', ok: true, why: 'Саме так. Завжди можна покласти слухавку й передзвонити на номер, якому ви довіряєте. 159 з\'єднує вас із вашим банком.'},
            {t: 'Робити, що кажуть, це ж банк', why: 'Шахраї постійно прикидаються банками, а номер можна підробити. Киньте слухавку й зателефонуйте на 159.'}]}},
        {screen: () => recents(p), done: true, say: '<strong>Чудово!</strong> Ви вмієте відповідати на дзвінки, вмикати гучномовець, класти слухавку й передзвонювати за пропущеними.'},
    ], {});

    function smsList(p) {
        return app(p, 'Повідомлення', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>Ваш останній огляд був у березні. Запишіться онлайн або зателефонуйте нам.</span><small>3 місяці тому</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', 'Текстове повідомлення', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Текстові повідомлення знаходяться в застосунку <strong>Повідомлення</strong>. <strong>Торкніться «Повідомлення».</strong>', hint: 'Це значок хмаринки для розмови.'},
        {screen: () => smsList(p), target: 'open-dentist', say: 'Нові повідомлення виділено жирним. <strong>Торкніться повідомлення від Стоматолога</strong>, щоб прочитати його.'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: 'Спершу наберіть Y у полі повідомлення, а потім торкніться стрілки надсилання.',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: 'Стоматолог просить відповісти <strong>Y</strong> для підтвердження. <strong>Торкніться поля повідомлення, наберіть Y, а потім торкніться стрілки надсилання</strong> ⟦send-horizontal⟧.'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: 'Готово! Тепер наведіть лад: <strong>утримуйте старе повідомлення</strong> угорі (тримайте на ньому палець секунду-дві).', hint: 'Тримайте палець на старому повідомленні вгорі, доки не з\'явиться меню.'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: 'З\'явилося меню. <strong>Торкніться «Видалити».</strong>',
         hints: {copy: '«Копіювати» копіює слова. Торкніться «Видалити».', forward: '«Переслати» надсилає його комусь іншому. Торкніться «Видалити».'}},
        {screen: c => smsChat(p, c), question: {q: 'SMS від невідомого номера повідомляє, що вашу посилку затримано, і просить сплатити £1.45 за посиланням. Що ви зробите?', options: [
            {t: 'Не торкатися посилання. Переслати на 7726, а потім видалити', ok: true, why: 'Саме так. 7726 безкоштовний і повідомляє про це вашого оператора. Кур\'єри не надсилають SMS із посиланнями на оплату зборів.'},
            {t: 'Сплатити, це ж лише £1.45', why: '£1.45 — це принада, щоб виманити дані вашої картки. Не торкайтеся посилання: перешліть повідомлення на 7726 і видаліть його.'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>Чудово!</strong> Ви вмієте читати текстові повідомлення, відповідати на них і видаляти непотрібні.'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['Карти', 15], ['WhatsApp', 9], ['Камера', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, 'Акумулятор', [{id: 'low-power', label: 'Режим низького заряду', toggle: saver, sub: 'Зменшує фонову активність, доки ви не зможете повністю зарядити телефон.'}, {caption: 'ВИКОРИСТАННЯ АКУМУЛЯТОРА ЗА ЗАСТОСУНКАМИ'}], {back: 'Налаштування', top: head, bottom: apps})
            : list(p, 'Акумулятор', [{id: 'low-power', label: 'Економія заряду', toggle: saver, sub: 'Вимикає деякі функції, щоб акумулятор тримав довше.'}, {caption: 'Використання заряду'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Акумулятор розряджається? <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Торкніться «Акумулятор».</strong>', hint: p === 'ios' ? '«Акумулятор» — у третій групі.' : '«Акумулятор» — у списку, після «Сповіщень».'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `У вас 23%. <strong>${p === 'ios' ? 'Режим низького заряду' : 'Економія заряду'}</strong> подовжує роботу акумулятора. <strong>Торкніться, щоб увімкнути.</strong> Значок акумулятора стає ${p === 'ios' ? 'yellow' : 'orange'}, щоб нагадувати вам про це.`},
        {screen: c => batteryPage(p, c), question: {q: 'У списку видно, що найбільше заряду сьогодні витратив Facebook. Що найкраще допомагає акумулятору триматися довше?', options: [
            {t: 'Зменшити яскравість екрана й закривати застосунки, з якими ви закінчили', ok: true, why: 'Так. Найбільше енергії споживає екран. Зменште яскравість; а застосунки на кшталт Facebook і YouTube витрачають багато.'},
            {t: 'Заряджати до 100% щогодини', why: 'Часте заряджання не шкодить, але й не подовжує роботу. Зменште яскравість і користуйтеся режимом економії заряду.'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>Чудово!</strong> Економію заряду ввімкнено, і ви знаєте, які застосунки витрачають найбільше енергії.'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? 'мобільний · 3 дзвінки' : 'Імовірний спам · 3 дзвінки'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, 'Нещодавні', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>мобільний</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>мобільний</small><span>Учора</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: 'Той самий невідомий номер постійно вам телефонує. Заблокуймо його. <strong>Відкрийте застосунок «Телефон».</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `У нещодавніх дзвінках <strong>торкніться ⓘ</strong> поруч із номером 07700 900842${p === 'android' ? ' (на деяких телефонах Android торкніться самого номера)' : ''}.`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: 'Поділитися контактом'}, {id: 'block', label: p === 'ios' ? 'Заблокувати абонента' : 'Заблокувати/позначити як спам', danger: true}], {back: 'Нещодавні'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? 'Заблокувати абонента' : 'Заблокувати/позначити як спам'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, 'Заблокувати цього абонента?', 'Ви не отримуватимете дзвінків, повідомлень чи FaceTime від людей зі списку заблокованих.', [['cancel', 'Скасувати'], ['confirm', 'Заблокувати контакт']])
            : dialog(p, 'Заблокувати 07700 900842?', '⟦square-check⟧ Позначити дзвінок як спам', [['cancel', 'Скасувати'], ['confirm', 'Заблокувати']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? 'Заблокувати контакт' : 'Заблокувати'}.</strong>${p === 'android' ? ' Якщо залишити позначку «Позначити дзвінок як спам», це допоможе попередити інших.' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Заблоковано! Також можна <strong>вимкнути звук усіх дзвінків із невідомих номерів</strong>. <strong>Торкніться «Параметри».</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: 'Прокрутіть до кінця й <strong>торкніться «Програми»</strong>.'},
            {screen: () => list(p, 'Програми', [{id: 'app-phone', label: 'Телефон'}, {id: 'app-messages', label: 'Повідомлення'}, {id: 'app-mail', label: 'Пошта'}], {back: 'Налаштування'}), target: 'app-phone', say: '<strong>Торкніться «Телефон».</strong>'},
            {screen: c => list(p, 'Телефон', [{id: 'silence', label: 'Вимкнути звук невідомих абонентів', toggle: !!c.silence}, {id: 'blocked', label: 'Заблоковані контакти', value: '1'}], {back: 'Програми'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Увімкніть «Вимкнути звук невідомих абонентів».</strong> Дзвінки з номерів, яких немає у ваших контактах, одразу йдуть на голосову пошту й залишаються в нещодавніх дзвінках.'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: 'Заблоковано! Також можна <strong>фільтрувати спам-дзвінки</strong>. <strong>Торкніться трьох крапок ⋮</strong> угорі праворуч.'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>Торкніться «Налаштування».</strong>'},
            {screen: () => list(p, 'Налаштування', [{id: 'caller-id', label: 'Ідентифікатор абонента та спам'}, {id: 'blocked', label: 'Заблоковані номери'}, {id: 'sounds', label: 'Звуки та вібрація'}]), target: 'caller-id', say: '<strong>Торкніться «Ідентифікатор абонента та спам».</strong>'},
            {screen: c => list(p, 'Ідентифікатор абонента та спам', [{id: 'caller-show', label: 'Показувати ідентифікатор абонента та спам', toggle: true}, {id: 'silence', label: 'Фільтрувати спам-дзвінки', toggle: !!c.silence, sub: 'Імовірні спам-дзвінки не дзвонитимуть на ваш телефон'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>Увімкніть «Фільтрувати спам-дзвінки».</strong> Імовірні шахрайські дзвінки не дзвонитимуть на ваш телефон.'},
        ]),
        {screen: c => list(p, 'Готово', [{label: 'Заблоковані номери', value: '1'}, {label: p === 'ios' ? 'Вимкнути звук невідомих абонентів' : 'Фільтрувати спам-дзвінки', toggle: true}]),
         question: {q: 'Чи може вимкнення звуку невідомих абонентів призвести до пропуску справжнього дзвінка, наприклад із лікарні чи від кур\'єра?', options: [
            {t: 'Так, тож час від часу перевіряйте голосову пошту й пропущені дзвінки', ok: true, why: 'Саме так. Справжні абоненти зазвичай залишають повідомлення, а пропущені дзвінки все одно видно у списку.'},
            {t: 'Ні, вони завжди додзвоняться', why: 'Невідомі номери йдуть на голосову пошту, зокрема й справжні. Час від часу перевіряйте голосову пошту й пропущені дзвінки.'}]}},
        {screen: () => list(p, 'Готово', [{label: 'Заблоковані номери', value: '1'}, {label: p === 'ios' ? 'Вимкнути звук невідомих абонентів' : 'Фільтрувати спам-дзвінки', toggle: true}]), done: true,
         say: '<strong>Чудово!</strong> Ви заблокували набридливий номер і зменшили кількість шахрайських дзвінків.'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail: вашу посилку затримано через несплачений збір £1.45. Сплатіть зараз, щоб призначити нову доставку: royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">Кому: ${field('fwdto', 'Номер', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>Дякуємо. Надішліть, будь ласка, номер телефону, з якого надійшло шахрайське повідомлення.</span><small>зараз</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>Дякуємо, вашу заяву отримано.</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : 'Нове повідомлення') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', 'Текстове повідомлення', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? 'Ще… потім Переслати' : 'Переслати'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Вам надійшло шахрайське SMS від імені Royal Mail. Перш ніж видалити його, безкоштовно повідомте про нього. <strong>Відкрийте «Повідомлення».</strong>'},
        {screen: () => app(p, 'Повідомлення', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>Торкніться повідомлення</strong>, щоб відкрити його. Не торкайтеся посилання в ньому!'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>Утримуйте повідомлення</strong> (тримайте на ньому палець), доки не з\'явиться меню. Не торкайтеся посилання.', hint: 'Тримайте палець на сірій хмаринці повідомлення секунду-дві.'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>Торкніться «Ще…»</strong>, а потім стрілки пересилання (тут обидва дії виконує одна кнопка).' : '<strong>Торкніться «Переслати».</strong> (На деяких телефонах цей пункт під трьома крапками ⋮ угорі.)',
         hints: {delete: 'Спершу повідомте про нього, а потім видаліть.', copy: 'Торкніться «Переслати», щоб надіслати його на 7726.'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: 'У полі «Кому» введіть 7726 (на клавіатурі телефона це складається в слово SPAM), а потім торкніться «Надіслати».',
         action: c => { c.sent7726 = true; }, say: 'У полі <strong>«Кому»</strong> введіть <strong>7726</strong>. (На клавіатурі це літери S-P-A-M.) Потім <strong>торкніться «Надіслати»</strong> ⟦send-horizontal⟧. Це безкоштовно.'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: 'Введіть номер шахрая, 07700 900911, а потім торкніться «Надіслати».',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 відповідає запитом, з якого номера надійшло шахрайство. <strong>Введіть 07700 900911</strong> і <strong>торкніться «Надіслати»</strong>.'},
        {screen: c => scamThread(p, c), question: {q: 'Ви повідомили про це. Що тепер робити з шахрайським SMS?', options: [
            {t: 'Видалити його й заблокувати номер', ok: true, why: 'Так. Про нього повідомлено, тож можна видалити. Блокування не дасть цьому номеру надсилати нові SMS.'},
            {t: 'Торкнутися посилання, щоб перевірити, чи воно справжнє', why: 'Ніколи не торкайтеся посилань у шахрайських SMS. Видаліть повідомлення й заблокуйте номер.'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>Чудово!</strong> Ви повідомили про шахрайське SMS на 7726, що допомагає операторам заблокувати його для всіх. Шахрайські електронні листи надсилайте на report@phishing.gov.uk.'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Оновлення виправляють проблеми безпеки, тож вони важливі. Спершу підключіть телефон до зарядки й до Wi-Fi. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>Торкніться «Загальні».</strong>'},
        {screen: () => list(p, 'Загальні', [{id: 'about', label: 'Про пристрій'}, {id: 'software', label: 'Оновлення ПЗ', value: '1'}, {id: 'storage', label: 'Сховище iPhone'}], {back: 'Налаштування'}), target: 'software', say: '<strong>Торкніться «Оновлення ПЗ».</strong> Червона 1 означає, що оновлення чекає.'},
        {screen: () => list(p, 'Оновлення ПЗ', [{id: 'auto', label: 'Автоматичні оновлення', value: 'Вимк.'}], {back: 'Загальні',
            bottom: '<div class="hu"><strong>Оновлення iOS</strong><p>Це оновлення містить важливі виправлення безпеки і рекомендоване всім користувачам.</p><button type="button" class="ce co" data-tap="update-now">Оновити зараз</button></div>'}),
         target: 'update-now', say: '<strong>Торкніться «Оновити зараз».</strong>', hints: {auto: 'Після цього варто також увімкнути автоматичні оновлення. Спершу торкніться «Оновити зараз».'}},
        {screen: c => codeScreen(p, c, 'Введіть код допуску', ''), sequence: PRACTICE.map(d => 'k' + d), say: 'iPhone просить код допуску. <strong>Введіть навчальний код 4 7 1 9 3 6.</strong>', hint: 'Введіть 4 7 1 9 3 6.'},
        {screen: c => list(p, 'Оновлення ПЗ', [], {back: 'Загальні', bottom: `<div class="hu"><strong>${c.busy ? 'Завантаження…' : 'Готово до встановлення'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Спершу триває завантаження, що може зайняти кілька хвилин. Потім <strong>торкніться «Установити зараз»</strong>. Телефон перезапускається, тож робіть це, коли він не знадобиться 15–30 хвилин.'},
        {screen: () => list(p, 'Оновлення ПЗ', [{id: 'auto', label: 'Автоматичні оновлення', value: 'Увімк.'}], {back: 'Загальні', bottom: '<div class="hu"><strong>На вашому iPhone найновіша версія ПЗ</strong></div>'}),
         question: {q: 'Чи варто вмикати автоматичні оновлення?', options: [
            {t: 'Так, тоді він оновлюється вночі під час заряджання', ok: true, why: 'Саме так. Параметри > Загальні > Оновлення ПЗ > Автоматичні оновлення. Оновлення встановлюється вночі, коли телефон підключено до зарядки й до Wi-Fi.'},
            {t: 'Ні, оновлення необов\'язкові', why: 'Оновлення закривають дірки в безпеці, якими користуються шахраї. Автоматичні оновлення захищають вас, і не треба нічого пам\'ятати.'}]}},
        {screen: () => list(p, 'Оновлення ПЗ', [], {bottom: '<div class="hu"><strong>На вашому iPhone найновіша версія ПЗ ⟦check⟧</strong></div>'}), done: true, say: '<strong>Чудово!</strong> Ваш телефон оновлено й захищено від найновіших проблем.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Оновлення виправляють проблеми безпеки, тож вони важливі. Спершу підключіть телефон до зарядки й до Wi-Fi. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: 'Прокрутіть вниз і <strong>торкніться «Система»</strong>. <em>На Samsung це «Оновлення ПЗ» ближче до кінця.</em>'},
        {screen: () => list(p, 'Система', [{id: 'languages', label: 'Мови'}, {id: 'date', label: 'Дата й час'}, {id: 'software', label: 'Оновлення програмного забезпечення', sub: 'Доступне оновлення'}]), target: 'software', say: '<strong>Торкніться «Оновлення ПЗ».</strong>'},
        {screen: () => list(p, 'Оновлення програмного забезпечення', [{id: 'system-update', label: 'Оновлення системи', sub: 'Доступне оновлення'}, {id: 'play-update', label: 'Оновлення системи Google Play'}]), target: 'system-update', say: '<strong>Торкніться «Оновлення системи».</strong>'},
        {screen: () => list(p, 'Оновлення системи', [], {bottom: '<div class="hu"><strong>Доступне оновлення системи</strong><p>Містить важливі виправлення безпеки.</p><button type="button" class="ce dk" data-tap="download">Завантажити й установити</button></div>'}),
         target: 'download', say: '<strong>Торкніться «Завантажити й установити».</strong>'},
        {screen: c => list(p, 'Оновлення системи', [], {bottom: `<div class="hu"><strong>${c.busy ? 'Завантаження й установлення…' : 'Перезапустіть, щоб завершити'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: 'Оновлення завантажується й готується, що може зайняти певний час. Потім <strong>торкніться «Перезапустити зараз»</strong>. Телефон вимикається й вмикається знову, це займає кілька хвилин.'},
        {screen: () => list(p, 'Оновлення системи', [], {bottom: '<div class="hu"><strong>Ваша система оновлена</strong></div>'}),
         question: {q: 'Ваш телефон не оновлювався роками. Що це може означати?', options: [
            {t: 'Він, імовірно, надто старий для оновлень безпеки, тож менш безпечний', ok: true, why: 'Так. Старі телефони перестають отримувати оновлення. Не користуйтеся на них банківськими операціями й подумайте про заміну, коли зможете.'},
            {t: 'Він працює чудово', why: 'Телефони перестають отримувати оновлення через кілька років, і дірки в безпеці залишаються невиправленими.'}]}},
        {screen: () => list(p, 'Оновлення системи', [], {bottom: '<div class="hu"><strong>Ваша система оновлена ⟦check⟧</strong></div>'}), done: true, say: '<strong>Чудово!</strong> Ваш телефон оновлено й захищено від найновіших проблем.'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah (донька)</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? 'Медична картка' : 'Медична інформація', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', 'напр., цукровий діабет 2 типу', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', 'напр., Penicillin', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>Показувати на заблокованому екрані</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? 'Готово' : 'Зберегти'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>Виберіть контакт</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', 'Здоров\'я', '#fff', ICON2.health]]), target: 'health', say: '<strong>Медична картка</strong> дає змогу медикам побачити ваші алергії та контакт для екстрених випадків, навіть коли телефон заблоковано. <strong>Відкрийте застосунок «Здоров\'я».</strong>'},
            {screen: () => app(p, 'Підсумок', '<p class="cf">Тут показано ваші дані про здоров\'я.</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>Торкніться свого зображення</strong> угорі праворуч.'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: 'Дані про здоров\'я'}, {id: 'medical', label: 'Медична картка'}], {back: 'Підсумок'}), target: 'medical', say: '<strong>Торкніться «Медична картка».</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: 'Телефон може зберігати <strong>медичну інформацію</strong>, яку бачать медики, навіть коли він заблокований. <strong>Торкніться «Налаштування».</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: 'Прокрутіть вниз і <strong>торкніться «Безпека та екстрені ситуації»</strong>. <em>На Samsung це «Безпека та екстрені ситуації».</em>'},
            {screen: () => list(p, 'Безпека та екстрені ситуації', [{id: 'medical', label: 'Медична інформація'}, {id: 'contacts-ec', label: 'Контакти для екстрених випадків'}, {id: 'sos', label: 'Екстрений виклик — SOS'}]), target: 'medical', say: '<strong>Торкніться «Медична інформація».</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: 'Спершу введіть алергію (для практики «Penicillin»), а потім додайте контакт для екстрених випадків.',
         say: 'Заповніть усе, що варто знати медикам. Для практики введіть <strong>Penicillin</strong> в розділі алергій. Потім <strong>торкніться «додати контакт для екстрених випадків»</strong>.'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: 'Оберіть, кому телефонувати в екстреному випадку. <strong>Торкніться Sarah.</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? 'Параметр «Показувати на заблокованому екрані» увімкнено, тож медики можуть це бачити. <strong>Торкніться «Готово».</strong>' : '<strong>Торкніться «Зберегти».</strong>'},
        {screen: c => list(p, p === 'ios' ? 'Медична картка' : 'Медична інформація', [{label: 'Алергії', sub: typed(c, 'allergies')}, {label: 'Контакт для екстрених випадків', sub: 'Sarah (донька)'}]),
         question: {q: p === 'ios' ? 'Як медик побачить вашу медичну картку, якщо телефон заблоковано?' : 'Як медик побачить це, якщо телефон заблоковано?', options: [
            {t: 'Через кнопку «Екстрений виклик» на екрані блокування', ok: true, why: 'Так. Якщо торкнутися «Екстрений виклик» на екрані блокування, з\'являється ваша медична інформація, і розблоковувати телефон не потрібно.'},
            {t: 'Ніяк', why: 'Побачить: кнопка «Екстрений виклик» на екрані блокування показує це без вашого код-пароля.'}]}},
        {screen: c => list(p, p === 'ios' ? 'Медична картка' : 'Медична інформація', [{label: 'Алергії', sub: typed(c, 'allergies')}, {label: 'Контакт для екстрених випадків', sub: 'Sarah (донька)'}]), done: true,
         say: '<strong>Чудово!</strong> Вашу медичну інформацію й контакт для екстрених випадків збережено. Якщо ви викличете допомогу через «Екстрений виклик — SOS», вашому контакту для екстрених випадків теж повідомлять.'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? 'Локатор' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ Відтворення сигналу…' : '⟦volume-2⟧ Відтворити звук'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? 'Позначити як втрачений' : 'Заблокувати пристрій'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Якщо телефон колись загубиться, його можна знайти, змусити дзвонити чи заблокувати, але лише якщо це спершу ввімкнено. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Торкніться свого імені</strong> угорі.'},
            {screen: () => list(p, 'Apple Account', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: 'Локатор'}, {id: 'family', label: 'Сімейний доступ'}], {back: 'Налаштування'}), target: 'findmy', say: '<strong>Торкніться «Локатор».</strong>'},
            {screen: c => list(p, 'Локатор', [{id: 'find-toggle', label: 'Знайти iPhone', toggle: !!c.findOn}, {label: 'Надіслати останню геопозицію', toggle: !!c.findOn}], {back: 'Apple Account'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Увімкніть «Знайти iPhone».</strong> «Надіслати останню геопозицію» передає місцеперебування перед тим, як сяде батарея.'},
            {screen: () => homeWith(p, [['findmy', 'Локатор', '#22c55e', ICON2.find]]), target: 'findmy',
             say: 'Тепер уявіть, що ви не можете знайти телефон. На іншому пристрої Apple ви відкрили б <strong>«Локатор»</strong> (або перейшли б на icloud.com/find на комп\'ютері). Тут <strong>торкніться «Локатор»</strong>.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Прокрутіть вниз і <strong>торкніться «Google»</strong>.'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: 'Усі служби'}, {id: 'account', label: 'Керувати обліковим записом Google'}]), target: 'all-services', say: '<strong>Торкніться «Усі служби».</strong>'},
            {screen: () => list(p, 'Усі служби', [{id: 'find-hub', label: 'Find Hub', sub: 'Раніше називався Find My Device'}, {id: 'theft', label: 'Захист від крадіжки'}]), target: 'find-hub', say: '<strong>Торкніться «Find Hub»</strong> (раніше він називався Find My Device). <em>Samsung теж має власний: Налаштування &gt; Безпека та конфіденційність &gt; Захист від втрати пристрою.</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: 'Використовувати Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>Увімкніть «Використовувати Find Hub».</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: 'Тепер уявіть, що ви не можете знайти телефон. На іншому телефоні чи планшеті ви відкрили б <strong>Find Hub</strong> або перейшли б на google.com/android/find на комп\'ютері. Тут <strong>торкніться «Find Hub»</strong>.'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: 'Ось він, на карті. Якщо він десь поруч, наприклад між подушками дивана, <strong>торкніться «Відтворити звук»</strong>: він голосно дзвонить, навіть у беззвучному режимі.'},
        {screen: c => findMap(p, c), question: {q: 'Карта показує телефон там, де ви ніколи не були. Що робити?', options: [
            {t: 'Скористатися «Позначити як втрачений» або «Заблокувати пристрій» і звернутися до поліції', ok: true, why: 'Так. Заблокуйте його через «Локатор» або Find Hub, не їдьте туди самі й повідомте поліцію та свого оператора.'},
            {t: 'Поїхати й забрати його самому', why: 'Ніколи не вступайте в конфронтацію зі злодієм. Заблокуйте телефон віддалено й зверніться до поліції.'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>Чудово!</strong> Пошук телефона ввімкнено, і ви знаєте, як змусити його дзвонити чи заблокувати.'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>Безкоштовні поради щодо техніки</strong>${UI.qr}<small>Скануйте мене</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, 'Видалити це фото?', p === 'ios' ? 'Воно зберігатиметься в «Нещодавно видалених» 30 днів.' : 'Його буде переміщено в кошик, перш ніж воно зникне остаточно.', [['cancel', 'Скасувати'], ['confirm-delete', 'Видалити']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>Відкрийте «Камеру».</strong> <em>Порада: на більшості телефонів можна також провести пальцем ліворуч на екрані блокування.</em>', hint: '«Камера» — це сірий значок із фотоапаратом.'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: 'Наведіть її на квіти й тримайте нерухомо. <strong>Торкніться великої круглої кнопки</strong>, щоб зробити фото.'},
        {screen: c => cameraView(p, c), target: 'thumb', say: 'Клац! Збережено. <strong>Торкніться маленького зображення</strong> в кутку, щоб побачити його.'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: 'Щоб роздивитися ближче, покладіть на фото два пальці й розведіть їх. Тут <strong>двічі торкніться ＋</strong>.', hint: 'Торкніться ＋ угорі праворуч.'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: 'Чудово! Щоб надіслати його комусь, <strong>торкніться кнопки «Поділитися»</strong> ⇪ (квадрат зі стрілкою).'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: 'Оберіть, як надіслати: у «Повідомленнях», поштою, у WhatsApp тощо. <strong>Торкніться «Повідомлення».</strong> (Потім ви вибрали б, кому надіслати.)'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: 'Надіслано! Тепер, якщо ви зробите фото, яке вам не потрібне, <strong>торкніться кошика</strong> ⟦trash-2⟧, щоб видалити його.'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: 'Спершу телефон перепитує. <strong>Торкніться «Видалити».</strong>'},
        {screen: () => app(p, 'Фото', '<p class="cf">Фото ще немає.</p>', {back: false, color: '#fff'}), question: {q: 'Ви помилково видалили фото! Що можна зробити?', options: [
            {t: p === 'ios' ? 'Зайти в «Альбоми» > «Нещодавно видалені» й відновити його' : 'Зайти в «Кошик» (Бібліотека > Кошик) і відновити його', ok: true, why: 'Так. Видалені фото якийсь час зберігаються, зазвичай близько місяця, тож їх можна повернути.'},
            {t: 'Нічого, воно зникло назавжди', why: 'Не хвилюйтеся! Воно якийсь час зберігається в «Нещодавно видалених» (iPhone) або в «Кошику» (Android).'}]}},
        {screen: () => app(p, 'Фото', '<p class="cf">Усе готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Чудово!</strong> Ви вмієте фотографувати, збільшувати, надсилати й видаляти фото.'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? 'Якщо у ваших рідних теж iPhone, <strong>FaceTime</strong> дає змогу безкоштовно робити відеодзвінки. <strong>Торкніться «FaceTime».</strong>' : '<strong>Google Meet</strong> дає змогу безкоштовно робити відеодзвінки з Android, зокрема й на iPhone. <strong>Торкніться «Google Meet».</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? 'Новий FaceTime' : 'Новий'}</button><p class="cf">Тут з'являються нещодавні дзвінки.</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? 'Новий FaceTime' : 'Новий'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? 'Новий FaceTime' : 'Дзвінок', `<div class="xz">To: ${field('callto', 'Ім\'я або номер', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime' : 'Відеодзвінок'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: 'Спершу введіть Sarah в поле «Кому».',
             say: 'Введіть ім\'я людини з ваших контактів. <strong>Введіть Sarah</strong>, а потім <strong>торкніться кнопки відео</strong>.'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: 'Іде виклик, і Sarah відповідає. Щоб показати їй сад, <strong>торкніться кнопки перемикання</strong> ⟦switch-camera⟧, щоб використати камеру на задній панелі.', hint: 'Зачекайте, поки Sarah відповість, а потім торкніться ⟦switch-camera⟧.'},
            {screen: c => waCall(p, c), target: 'end', say: 'Коли закінчите, <strong>торкніться червоної кнопки</strong>, щоб покласти слухавку.'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · Відео · 3 хв</p>', {back: false, color: '#fff'}), question: {q: 'У вашого друга телефон Android, а у вас iPhone. Чи можна все одно зробити відеодзвінок?', options: [
                {t: 'Так, через WhatsApp або Google Meet, які працюють на обох', ok: true, why: 'Саме так. FaceTime здебільшого працює між iPhone. WhatsApp і Google Meet працюють на обох типах телефонів.'},
                {t: 'Ні, ніколи', why: 'Можна: WhatsApp і Google Meet працюють на обох типах телефонів.'}]}},
            {screen: () => app(p, appName, '<p class="cf">Усе готово.</p>', {back: false, color: '#fff'}), done: true, say: '<strong>Чудово!</strong> Ви зробили відеодзвінок і показали вид із задньої камери.'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'QR-коди — це квадратні чорно-білі візерунки на плакатах і в меню. Ваша камера вміє їх читати, додатковий застосунок не потрібен. <strong>Відкрийте «Камеру».</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: 'Наведіть камеру на код і трохи потримайте нерухомо. На екрані <strong>з\'явиться посилання</strong>: перевірте, чи воно схоже на очікуване, а потім <strong>торкніться його</strong>.',
         hints: {shutter: 'Фотографувати не потрібно: просто наведіть камеру й зачекайте, поки з\'явиться посилання, а потім торкніться його.'},
         hint: p === 'android' ? 'Зачекайте, поки з\'явиться посилання, і торкніться його. Якщо нічого не з\'являється, спробуйте Google Lens.' : 'Зачекайте, поки з\'явиться посилання, і торкніться його.'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Безкоштовні поради щодо техніки</h3><p>Зрозумілі поради щодо телефонів, комп\'ютерів і безпеки в інтернеті.</p></div>', {color: '#f8fafc'}),
         question: {q: 'На автоматі оплати паркінгу ви бачите наклейку з QR-кодом. Як найбезпечніше заплатити?', options: [
            {t: 'Скористатися офіційним застосунком паркінгу чи самим автоматом, а не наклеєним QR-кодом', ok: true, why: 'Так. Шахраї наклеюють фальшиві QR-коди поверх справжніх, щоб викрасти дані картки. Перевірте, чи це наклейка, і користуйтеся офіційним застосунком чи вказівником.'},
            {t: 'Відсканувати й заплатити, так швидше', why: 'Фальшиві QR-наклейки на автоматах паркінгу — відоме шахрайство. Користуйтеся офіційним застосунком або самим автоматом.'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>Безкоштовні поради щодо техніки</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>Чудово!</strong> Ви вмієте сканувати QR-коди камерою і знаєте, що спершу треба перевірити посилання.'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', 'Фото з неділі 📷', 'Привіт, мамо, ось фото з обіду…'],
                       ['tv', 'TV Licensing', 'Термін дії вашої ліцензії ЗАКІНЧИВСЯ', 'Діяйте негайно, щоб уникнути судового переслідування. Оновіть платіжні дані…'],
                       ['library', 'Bridlington Library', 'Час повернути книжки', 'Ваші книжки треба повернути в п\'ятницю.']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? 'Вхідні' : 'Основні', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · мені</p><h3>Фото з неділі 📷</h3><p>Привіт, мамо, ось фото з обіду. Було так приємно тебе бачити! x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', 'Напишіть відповідь…', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>Термін дії вашої ліцензії ЗАКІНЧИВСЯ</h3><p>Діяйте негайно, щоб уникнути судового переслідування. Оновіть платіжні дані протягом 24 годин: <u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? 'Перемістити до спаму' : '⋮ Повідомити про фішинг'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? 'Пошта' : 'ваш поштовий застосунок (Gmail на більшості телефонів Android)'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: 'Нові листи виділено жирним. <strong>Торкніться листа від Sarah</strong>, щоб прочитати його.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: 'Щоб відповісти, <strong>торкніться «Відповісти»</strong> ↩.'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: 'Спершу наберіть коротку відповідь, а потім торкніться «Надіслати».',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>Наберіть коротку відповідь</strong> (наприклад, «Дякую, чудові!») і <strong>торкніться «Надіслати»</strong>.'},
        {screen: () => app(p, '', '<p class="cf">Надіслано ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ Назад до вхідних</button>', {color: '#fff'}), target: 'back', say: '<strong>Торкніться «Назад»</strong>, щоб повернутися до вхідних.'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: 'Є тривожний лист від «TV Licensing». <strong>Відкрийте його</strong>, але нічого всередині не торкайтеся.'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: 'Шахрайські листи часто використовують справжню назву, але підроблену адресу. <strong>Торкніться імені відправника</strong>, щоб побачити справжню електронну адресу.',
         hint: 'Торкніться «TV Licensing» угорі листа.'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: 'Лист від <strong>outlook-mail.com</strong>, а не від tvlicensing.co.uk. Це шахрайство. <strong>Торкніться ' + (p === 'ios' ? 'Перемістити до спаму' : '«Повідомити про фішинг»') + '.</strong> Шахрайські листи також можна пересилати на report@phishing.gov.uk.'},
        {screen: c => inbox(p, c), question: {q: 'Що видало шахрайство?', options: [
            {t: 'Справжня адреса відправника, погрози й 24-годинний термін', ok: true, why: 'Саме так. Справжні організації не залякують вас термінами, а їхні листи надходять з їхньої власної вебадреси.'},
            {t: 'Нічого, усе виглядало справжнім', why: 'Перевірте адресу відправника: вона не належала TV Licensing. Погрози й дуже короткі терміни теж є серйозними ознаками небезпеки.'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>Чудово!</strong> Ви вмієте читати листи, відповідати на них, а також розпізнавати шахрайство й повідомляти про нього.'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? 'Отримати' : 'Установити';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play Маркет'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>Торкніться «Пошук».</strong>' : '<strong>Торкніться рядка пошуку.</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: 'Ми шукали «NHS App». Багато застосунків мають «NHS» у назві. Перевірте, <strong>хто його створив</strong>: справжній — від <strong>NHS England</strong>. <strong>Торкніться ' + (p === 'ios' ? 'Отримати' : 'Установити') + ' поруч зі справжнім.</strong>',
         hints: {'fake1-get': 'Цей від HealthApps Ltd, і це реклама. Справжній NHS App створила NHS England.', 'fake2-get': 'Цей від QuickDev Apps, а не від NHS. Справжній створила NHS England.'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: 'Встановлено! Тепер видаліть застосунок, яким ви ніколи не користуєтеся, щоб навести лад і звільнити місце. <strong>Утримуйте застосунок «Погода»</strong>, доки не з\'явиться меню.', hint: 'Тримайте палець на значку «Погода» секунду-дві.'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? 'Вилучити «Погода»?' : 'Погода', p === 'ios' ? 'Вилучення з екрана «Додому» залишить програму в Бібліотеці програм.' : '', p === 'ios'
            ? [['delete-app', 'Видалити програму'], ['remove-home', 'Вилучити з екрана «Додому»'], ['cancel', 'Скасувати']] : [['app-info', 'Про додаток'], ['delete-app', 'Видалити'], ['cancel', 'Скасувати']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>Торкніться «Вилучити програму»</strong>, а потім <strong>«Видалити програму»</strong> (тут це одна кнопка).' : '<strong>Торкніться «Видалити».</strong>',
         hints: {'remove-home': 'Це лише ховає значок; застосунок залишається на телефоні. Торкніться «Видалити програму».'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: 'Застосунок просить заплатити, щоб «розблокувати» ваші медичні записи NHS. Що ви про це думаєте?', options: [
            {t: 'Це не справжній NHS App, який повністю безкоштовний', ok: true, why: 'Саме так. NHS App безкоштовний. Видаляйте все, що просить платити за послуги NHS.'},
            {t: 'Заплатити, це ж для NHS', why: 'Справжній NHS App безкоштовний і створений NHS England. Застосунок, що просить гроші, не справжній.'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>Чудово!</strong> Ви вмієте відрізняти справжні застосунки від підробок і видаляти ті, що вам не потрібні.'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>З поверненням.</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? 'Увійти за допомогою Face ID' : 'Увійти за відбитком пальця'}</button>
                <button type="button" class="cp" data-tap="password">Увійти за допомогою електронної пошти та пароля</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', 'Рецепти'], ['appointments', '⟦calendar⟧', 'Прийоми'], ['records', '⟦clipboard-list⟧', 'Ваше здоров\'я'], ['messages', '⟦mail⟧', 'Повідомлення']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, 'Рецепти', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>Замовити повторний рецепт</strong><small>Оберіть ліки, які вам уже призначено</small></button><div class="ck"><strong>Переглянути замовлення</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Амлодипін 5 мг, таблетки'], ['med-2', 'Аторвастатин 20 мг, таблетки']];
            return app(p, 'Оберіть ліки', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, 'Підтвердьте замовлення', `<p class="cf">Амлодипін 5 мг, таблетки<br>Отримати в: ваша обрана аптека</p><button type="button" class="ce co" data-tap="confirm">Підтвердити й замовити</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, 'Замовлення надіслано', '<p class="cf">⟦check⟧ Ваш запит на рецепт надіслано до вашого кабінету сімейного лікаря. Зазвичай це займає 2–3 робочі дні.</p><button type="button" class="cp" data-tap="home">На головну</button>', {color: NHS});
        return app(p, 'Прийоми', '<div class="fo"><div class="ck"><strong>Прийом у сімейного лікаря</strong><small>Вівторок, 10:30 · ваш кабінет сімейного лікаря</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> безкоштовний і дає змогу замовляти повторні рецепти, переглядати прийоми тощо. (Ця навчальна версія вигадана, створена лише для цього уроку.) <strong>Торкніться «NHS App».</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `Коли ви налаштуєте його через NHS login, входити можна так: ${p === 'ios' ? 'face' : 'fingerprint'}. <strong>Торкніться кнопки входу: ${p === 'ios' ? 'Face ID' : 'fingerprint'}.</strong>`,
         hints: {password: 'Це теж спрацює, але з обличчям чи відбитком пальця швидше. Торкніться синьої кнопки.'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>Торкніться «Рецепти».</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>Торкніться «Замовити повторний рецепт».</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: 'Спершу торкніться ліків, щоб позначити їх, а потім торкніться «Продовжити».',
         say: '<strong>Торкніться потрібних ліків</strong>, щоб позначити їх (спробуйте амлодипін), а потім <strong>торкніться «Продовжити»</strong>.', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: 'Перевірте, чи все правильно, а потім <strong>торкніться «Підтвердити й замовити»</strong>.'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: 'Надіслано до вашого кабінету лікаря! <strong>Торкніться «На головну».</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: 'Також можна перевірити свої прийоми. <strong>Торкніться «Прийоми».</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: 'SMS повідомляє: «NHS: ви маєте право на безкоштовний набір для тесту, введіть банківські дані, щоб сплатити пересилання». Що це?', options: [
            {t: 'Шахрайство. NHS ніколи не просить банківські дані в SMS', ok: true, why: 'Саме так. Користуйтеся NHS App або звертайтеся безпосередньо до кабінету сімейного лікаря, ніколи не переходьте за посиланнями з SMS.'},
            {t: 'Справжнє, це ж лише пересилання', why: 'NHS ніколи не надсилає SMS із проханням про банківські дані. Це шахрайство: перешліть його на 7726.'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>Чудово!</strong> Ви замовили повторний рецепт і перевірили свої прийоми.'},
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
        if (page === 'login') return app(p, 'Навчальний банк', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? 'Увійти за допомогою Face ID' : 'Увійти за відбитком пальця'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, 'Ваші рахунки', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', 'Сьогодні'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', 'Сьогодні'], ['txn-pension', 'State Pension', '+£921.60', 'Учора'], ['txn-water', 'Yorkshire Water DD', '−£38.00', 'Пн']];
            return app(p, 'Поточний рахунок', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, 'Платіж', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>Сьогодні, 03:12 · Картка, що закінчується на 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ Заморозити картку</strong><small>${ctx.frozen ? 'Картку заморожено ⟦check⟧' : 'Одразу зупиніть платежі'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>Повідомити про цей платіж</strong><small>Не впізнаєте? Повідомте нам</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', 'Банк', BANK, ICON2.pound]]), target: 'bank',
         say: 'Банківські застосунки дають змогу в будь-який час перевірити свої гроші. (Це вигаданий банк для практики.) <strong>Відкрийте застосунок «Банк».</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>Увійдіть так: ${p === 'ios' ? 'face' : 'fingerprint'}.</strong> Ніколи нікому не повідомляйте свій банківський код-пароль.`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>Торкніться свого поточного рахунку</strong>, щоб побачити, що надійшло й що списано.'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: 'Перегляньте платежі. Один із них ви не впізнаєте: <strong>£249 о 3-й ночі на сайті подарункових карток</strong>. <strong>Торкніться його.</strong>',
         hints: {'txn-tesco': 'Це ваші покупки. Шукайте той, якого ви не впізнаєте.', 'txn-pension': 'Це надходить ваша пенсія. Шукайте той, що вирізняється.', 'txn-water': 'Це ваш рахунок за воду. Шукайте той, що вирізняється.'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>Торкніться «Заморозити картку»</strong>. Це одразу зупиняє будь-які подальші платежі, а розморозити її можна пізніше, якщо виявиться, що все гаразд.',
         hints: {report: 'Спершу заморозьте картку, щоб зупинити нові платежі. Потім повідомте про це.'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: 'Ви заморозили картку. Що далі?', options: [
            {t: 'Зателефонувати до банку на 159 або на номер на картці, чи повідомити про це в застосунку', ok: true, why: 'Так. Вони можуть розібратися, скасувати картку й часто повернути гроші. Чим швидше ви їм скажете, тим краще.'},
            {t: 'Зачекати й подивитися, чи повториться', why: 'Одразу повідомте банк. Чим швидше вони дізнаються, тим більше зможуть зробити.'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>Чудово!</strong> Ви перевірили рахунок, помітили платіж, якого не впізнали, і заморозили картку.'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Навчальний банк</strong><span>•••• 4421</span><small>ДЕБЕТОВА</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? 'Гаманець' : 'Google Wallet', `<p class="cf">Додайте картку, щоб платити телефоном у магазинах.</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ Додати картку' : '＋ Додати до гаманця'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, 'Додати картку', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? 'Розмістіть картку в рамці…' : 'Картку знайдено ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, 'Підтвердити картку', `<p class="cf">Банку потрібно переконатися, що це ви. Оберіть, як отримати код:</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>SMS</strong><small>на ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>Зателефонувати до банку</strong></button></div>`, {color});
        if (page === 'code') return app(p, 'Введіть код', `<div class="jp ex"><strong>Повідомлення · зараз</strong><span>Навчальний банк: ваш код для Wallet — 529173. Нікому його не повідомляйте.</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? 'Гаманець' : 'Google Wallet', `${card}<p class="cf">⟦check⟧ Вашу картку готово до використання.</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? 'Піднесіть до терміналу…' : 'Піднесіть до терміналу…') : '⟦check⟧ Готово'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? 'Гаманець' : 'Гаманець', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `Платити телефоном швидко й безпечно: магазини ніколи не бачать номер вашої картки. <strong>Відкрийте ${p === 'ios' ? 'Гаманець' : 'Google Wallet'}.</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ Додати картку' : '＋ Додати до гаманця'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: 'Телефон використовує камеру, щоб прочитати вашу картку, тож номер вводити не треба. <strong>Розмістіть картку в рамці</strong>, а потім <strong>торкніться «Далі»</strong>. <em>Ніколи не вводьте номер картки на сайті за посиланням із SMS чи листа.</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: 'Банк перевіряє, що це справді ви. <strong>Торкніться «SMS».</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: 'Від банку надходить SMS із кодом. <strong>Введіть 5 2 9 1 7 3.</strong> Пам\'ятайте: цей код вводять лише на власному телефоні й ніколи не повідомляють тому, хто його просить.', hint: 'Введіть код із повідомлення: 5 2 9 1 7 3.'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: 'Вашу картку готово. Тепер заплатимо в магазині. <strong>Торкніться будь-де на картці.</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: 'На касі <strong>двічі натисніть бічну кнопку</strong> на iPhone (тут двічі торкніться ⟦power⟧), гляньте на екран для Face ID, а потім піднесіть верхню частину телефона до термінала.', hint: 'Двічі торкніться кнопки ⟦power⟧ збоку.'}
            : {target: 'pay-now', say: 'На касі просто <strong>розблокуйте телефон і піднесіть його задню панель до термінала</strong>. Тут <strong>торкніться термінала</strong>.'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: 'Чи безпечно платити телефоном?', options: [
            {t: 'Так, безпечніше, ніж карткою: потрібне ваше обличчя, відбиток пальця чи код-пароль, а магазини не бачать номер вашої картки', ok: true, why: 'Саме так. А якщо ви загубите телефон, ніхто не зможе ним заплатити, не розблокувавши його.'},
            {t: 'Ні, ним може скористатися будь-хто', why: 'Кожен платіж потребує вашого обличчя, відбитка пальця чи код-пароля, тож це насправді безпечніше, ніж безконтактна картка.'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>Чудово!</strong> Ваша картка в телефоні, і ви здійснили навчальний платіж.'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>ДЕБЕТОВА</small></div>', '<small>ДЕБЕТОВА</small></div></button>');
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
            return app(p, 'Навчальна залізниця', `<div class="rr"><div><small>From</small><strong>Bridlington</strong></div>
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || 'Оберіть станцію'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : 'Додати Railcard'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>Оберіть станцію</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>Додати Railcard</strong></p>${[['rc-senior', 'Senior Railcard (60+)'], ['rc-two', 'Two Together Railcard'], ['rc-none', 'Без Railcard']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', 'Без пересадок'], ['t-1145', '11:45', '12:32', 'Без пересадок'], ['t-1245', '12:45', '13:32', 'Без пересадок']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">Ціни вигадані для цієї практики. Знижку Railcard застосовано.</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>Позапіковий квиток в один бік</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>Позапіковий квиток туди й назад</strong><small>Повернення сьогодні</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, 'Ваш квиток', `<div class="adt"><strong>Позапіковий квиток туди й назад</strong><span>Bridlington ⇄ Hull</span><span>Сьогодні · Senior Railcard</span>
            ${UI.qr}<small>Відскануйте його на турнікеті або покажіть провіднику.</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', 'Потяги', '#7c2d12', ICON2.train]]), target: 'trains',
         say: 'Застосунки для потягів дають змогу купувати квитки в телефоні, без черги. (Цей навчальний застосунок вигаданий: ціни й час умовні.) <strong>Відкрийте «Потяги».</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: 'Ви їдете з Bridlington. <strong>Торкніться «До»</strong>, щоб обрати, куди ви їдете.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>Торкніться Hull.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: 'Вам понад 60? <strong>Senior Railcard</strong> економить третину вартості більшості квитків. <strong>Торкніться «Railcard»</strong>, щоб додати свою.'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>Торкніться Senior Railcard.</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>Торкніться «Знайти потяги».</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: 'Ось потяги. <strong>Торкніться рейсу о 10:45.</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: 'Повертаєтеся сьогодні? Квиток туди й назад за день зазвичай дешевший за два квитки в один бік. <strong>Торкніться «Позапіковий квиток туди й назад»</strong>, а потім сплатіть.',
         hints: {single: 'Квиток в один бік діє лише в одному напрямку. Ви повертаєтеся сьогодні, тож торкніться «Позапіковий квиток туди й назад».', pay: 'Спершу оберіть квиток: торкніться «Позапіковий квиток туди й назад».'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>Торкніться ${p === 'ios' ? 'Сплатити' : 'G Pay'}</strong>, щоб заплатити карткою з вашого телефона (з уроку про безконтактну оплату).`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: 'Батарея телефона розряджається ще до вашого потяга додому. Що варто зробити?', options: [
            {t: 'Зробити знімок екрана з квитком і ввімкнути економію заряду', ok: true, why: 'Так. Деякі квитки працюють зі знімка екрана, а економія заряду допомагає телефону протриматися довше. У багатьох застосунках квиток також можна додати до гаманця.'},
            {t: 'Нічого, усе буде гаразд', why: 'Якщо телефон вимкнеться, ви не зможете показати квиток. Зробіть знімок екрана й заощаджуйте заряд.'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>Чудово!</strong> Ви спланували поїздку, додали Railcard і купили квиток у телефоні.'},
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

    const busTable = `<div class="sj"><strong>Автобус 121: Bridlington – Hull</strong><small>Лише навчальний розклад</small>
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
        return app(p, 'Розклад автобусів', busTable, {back: false, color: '#fff',
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
            ? 'Знімок екрана — це фото того, що зараз на екрані, як-от цей розклад автобусів. Одночасно натисніть <strong>бічну кнопку</strong> (праворуч) і <strong>збільшення гучності</strong> (ліворуч), а потім відпустіть. Тут <strong>торкніться бічної кнопки, а потім збільшення гучності</strong>.'
            : 'Знімок екрана — це фото того, що зараз на екрані, як-от цей розклад автобусів. Одночасно натисніть <strong>кнопку живлення</strong> і <strong>зменшення гучності</strong>, а потім відпустіть. Тут <strong>торкніться кнопки живлення, а потім зменшення гучності</strong>.',
         hints: {'vol-down': p === 'ios' ? 'На iPhone це збільшення гучності разом із бічною кнопкою.' : 'Почніть із кнопки живлення, угорі на правому боці.',
                 'vol-up': p === 'ios' ? 'Почніть із бічної кнопки праворуч.' : 'На Android це зменшення гучності разом із кнопкою живлення.',
                 side: 'Тепер кнопка збільшення гучності, ліворуч.', power: 'Тепер кнопка зменшення гучності.'},
         hint: p === 'ios' ? 'Бічна кнопка на правому краї. Збільшення гучності — на лівому.' : 'Кнопка живлення — верхня кнопка на правому краї.'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: 'Клац! У нижньому куті з\'являється маленьке зображення. <strong>Торкніться його</strong>, щоб побачити знімок екрана. <em>Якщо залишити, воно саме збережеться за кілька секунд.</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: 'Тут на ньому можна малювати або обрізати його. <strong>Торкніться «Готово»</strong> угорі ліворуч.'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>Торкніться «Зберегти у Фото».</strong>', hints: {'delete-shot': 'Це викине його. Торкніться «Зберегти у Фото».', 'save-files': '«Файли» теж підійдуть, але у «Фото» його легше знайти. Торкніться «Зберегти у Фото».'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: 'Клац! З\'являється маленьке зображення з кнопками під ним. Знімок уже збережено. <strong>Торкніться «Поділитися»</strong>, щоб надіслати його комусь.', hints: {'shot-edit': '«Редагувати» дає змогу обрізати знімок або малювати на ньому. Поки торкніться «Поділитися».'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>Торкніться Sarah</strong>, щоб надіслати їй розклад автобусів.'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: 'Де потім знайти свої знімки екрана?', options: [
            {t: 'У застосунку «Фото», в альбомі «Знімки екрана»', ok: true, why: 'Так. Вони зберігаються разом із вашими фото, тож їх можна переглядати, надсилати чи видаляти, як будь-яке фото.'},
            {t: 'Вони зникають через добу', why: 'Вони залишаються, доки ви їх не видалите. Шукайте в застосунку «Фото», в альбомі «Знімки екрана».'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>Чудово!</strong> Знімки екрана зручні для розкладів автобусів, квитків, повідомлень про помилки й усього, що ви хочете зберегти чи комусь показати. Закінчивши, можете видалити їх із «Фото».'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || 'Пошук на Картах'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah надіслала вам адресу в SMS. Якщо її скопіювати, не доведеться набирати знову. <strong>Відкрийте «Повідомлення».</strong>'},
        {screen: () => app(p, 'Повідомлення', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>Торкніться повідомлення від Sarah.</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>Утримуйте повідомлення з адресою</strong> (тримайте на ньому палець секунду-дві), доки не з\'явиться меню.', hint: 'Тримайте палець на другому повідомленні, доки не з\'явиться меню.'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>Торкніться «Скопіювати».</strong> Тепер телефон пам\'ятає ці слова, і їх можна вставити в іншому місці.',
         hints: {reply: '«Відповісти» починає повідомлення. Торкніться «Скопіювати».', forward: '«Переслати» надсилає повідомлення комусь. Торкніться «Скопіювати».'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: 'Скопійовано! Тепер перейдіть на головний екран. Тут <strong>торкніться смужки внизу екрана</strong>.'},
        {screen: () => home(p), target: 'maps', say: '<strong>Відкрийте «Карти»</strong>, щоб знайти адресу.'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>Утримуйте поле пошуку</strong>, доки не з\'явиться маленька кнопка «Вставити».', hint: 'Тримайте палець на полі пошуку вгорі.',
         hints: {'search-tap': 'Короткий дотик відкриває клавіатуру. Натомість утримуйте, доки не з\'явиться «Вставити».'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>Торкніться «Вставити».</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: 'З\'являється вся адреса, без набору тексту. <strong>Торкніться результату.</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: 'Ви хочете скопіювати лише номер телефону із середини довгого повідомлення. Як?', options: [
            {t: 'Утримувати, потім торкнутися «Вибрати» (або перетягнути маленькі маркери), щоб вибрати лише потрібне, а потім «Скопіювати»', ok: true,
             why: 'Так. Перетягніть маркери з обох боків виділених слів, щоб вибрати саме те, що потрібно.'},
            {t: 'Скопіювати можна лише все повідомлення', why: 'Можна вибрати лише частину: утримуйте, торкніться «Вибрати» й перетягніть маленькі маркери.'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>Чудово!</strong> Копіювання й вставлення працює майже скрізь: у повідомленнях, листах, на вебсторінках і у формах. Утримуйте, щоб скопіювати; утримуйте, щоб вставити.'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : 'Сховище'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'Сховище iPhone', [{caption: 'РЕКОМЕНДАЦІЇ'},
                ctx.offloaded ? {label: 'Вивантажувати невикористані програми', value: 'Увімкнено ⟦check⟧'} : {id: 'offload', label: 'Вивантажувати невикористані програми', sub: 'Заощадьте 2,1 ГБ. Видаляє програми, якими ви не користуєтеся, але зберігає їхні дані.', value: 'Увімкнути'},
                {caption: 'ПРОГРАМИ'}, {label: 'Фото', value: '21,3 ГБ'}, {label: 'WhatsApp', value: ctx.cleaned ? '7,6 ГБ' : '14,8 ГБ'}, {label: 'Facebook', value: '2,4 ГБ'}, {label: 'BBC iPlayer', value: '1,9 ГБ'}],
            {back: 'Загальні', top: bar});
        }
        return list(p, 'Сховище', [{label: 'Фото й відео', value: '21,3 ГБ'}, {label: 'Програми', value: ctx.cleaned ? '18,4 ГБ' : '25,2 ГБ', sub: 'Зокрема WhatsApp'}, {label: 'Документи й інше', value: '4,1 ГБ'},
            {label: 'Система', value: '7,6 ГБ'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ Очищено 1,1 ГБ сміттєвих файлів</p>' : '<button type="button" class="ce dk" data-tap="free-up">Звільнити місце</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, 'Налаштування', `<div class="fo">${[['account', 'Обліковий запис'], ['privacy', 'Конфіденційність'], ['chats', 'Чати'], ['notifications', 'Сповіщення'], ['storage', 'Сховище й дані'], ['help', 'Довідка']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, 'Сховище й дані', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7,6 ГБ' : '14,8 ГБ'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, 'Керування сховищем', `<div class="iq"><span>WhatsApp займає ${ctx.cleaned ? '7.6' : '14.8'} ГБ</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>Більше за 5 МБ</strong><small>Нічого переглядати</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>Переслано багато разів</strong><small>112 елементів · 0,9 ГБ</small></div>
                <div class="he">ЧАТИ</div><div class="ck"><strong>Родина</strong><small>3,1 ГБ</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1,8 ГБ</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} МБ</small></span>`).join('');
        return app(p, 'Більше за 5 МБ', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, 'Видалити 23 елементи?', 'Їх буде видалено з WhatsApp. Фото, уже збережені в галереї вашого телефона, залишаться там.', [['cancel', 'Скасувати'], ['confirm-delete', 'Видалити']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Бачите «Сховище майже заповнене»? З\'ясуймо, що займає місце. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Торкніться «Загальні».</strong>'},
            {screen: () => list(p, 'Загальні', [{id: 'about', label: 'Про пристрій'}, {id: 'update', label: 'Оновлення ПЗ'}, {id: 'storage', label: 'Сховище iPhone'}, {id: 'airdrop', label: 'AirDrop'}, {id: 'vpn', label: 'VPN і керування пристроєм'}], {back: 'Налаштування'}),
             target: 'storage', say: '<strong>Торкніться «Сховище iPhone».</strong> Потрібно кілька секунд, щоб усе підрахувати.'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: 'Кольорова смуга показує, що займає місце. Спершу швидка перемога: <strong>«Вивантажувати невикористані програми»</strong> прибирає програми, якими ви давно не користувалися, але зберігає ваші дані на випадок, якщо вони знадобляться знову. <strong>Торкніться «Увімкнути».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>Торкніться «Сховище».</strong> <em>На Samsung це «Батарея та обслуговування пристрою», потім «Сховище».</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: 'Кольорова смуга показує, що займає місце. <strong>Торкніться «Звільнити місце».</strong>'},
            {screen: () => app(p, 'Файли', `<div class="ke"><strong>Видалити сміттєві файли</strong><small>1,1 ГБ тимчасових файлів від застосунків</small><button type="button" class="ce dk" data-tap="clean">Очистити</button></div>
                <div class="ke"><strong>Видалити старі знімки екрана</strong><small>214 МБ</small><span class="fd">Вибрати й звільнити місце</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: 'Сміттєві файли можна безпечно видаляти: це тимчасові файли, які застосункам не потрібні. <strong>Торкніться «Очистити».</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp займає 14,8 ГБ. Що його заповнює?', options: [
            {t: 'Відео й фото, які вам надсилають, особливо в групах', ok: true, why: 'Так. Кожне відео, надіслане в чаті родини чи групи, зберігається на вашому телефоні. WhatsApp може знайти й видалити великі.'},
            {t: 'Ваші текстові повідомлення', why: 'Текст майже не займає місця. Місце займають відео й фото, які надсилають люди, особливо в групах.'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>Відкрийте WhatsApp.</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? 'У WhatsApp торкніться <strong>«Налаштування»</strong> унизу праворуч. Тут його вже відкрито. <strong>Торкніться «Сховище й дані».</strong>'
                          : 'У WhatsApp торкніться <strong>трьох крапок ⋮</strong> угорі, а потім <strong>«Налаштування»</strong>. Тут його вже відкрито. <strong>Торкніться «Сховище й дані».</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>Торкніться «Керування сховищем».</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: 'Найбільші заощаджувачі місця вгорі. <strong>Торкніться «Більше за 5 МБ».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: 'Це великі відео, які вам надсилали. Якщо хочете зберегти якесь, спершу збережіть його у фото. <strong>Торкніться «Вибрати все».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>Торкніться «Видалити».</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: 'Це видаляє лише копії всередині WhatsApp. <strong>Торкніться «Видалити»</strong>, щоб підтвердити.', hints: {cancel: '«Скасувати» залишає їх. Для цієї практики торкніться «Видалити».'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>Чудово!</strong> Ви звільнили понад 7 ГБ. Це варто робити раз на кілька місяців. Також очищуйте <strong>«Нещодавно видалені»</strong> у «Фото», бо видалені фото ще 30 днів займають місце.'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', 'Світовий час'], ['alarms', 'Будильники'], ['stopwatch', 'Секундомір'], ['timers', 'Таймери']]
            : [['alarms', 'Будильник'], ['world', 'Годинник'], ['timers', 'Таймер'], ['stopwatch', 'Секундомір']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>Сьогодні</small><strong>Лондон</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>Австралія</small><strong>Сідней</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || 'Таблетки')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>Будильник</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? 'Світовий час' : 'Годинник') : (p === 'ios' ? 'Будильники' : 'Будильник')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || 'Ніколи'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', 'Будильник', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: 'Будильник може щодня нагадувати вам прийняти таблетки. <strong>Відкрийте застосунок «Годинник».</strong>', hint: 'Це чорний значок із білим циферблатом.'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>Торкніться ${p === 'ios' ? 'Будильники' : 'Будильник'}</strong> ${p === 'ios' ? 'bottom' : 'bottom left'}.`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>Торкніться +</strong>, щоб додати новий будильник.'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: 'На справжньому телефоні час задають прокручуванням цифр. Тут <strong>торкніться 08:00</strong>.', hints: {'t-07': 'Для цієї практики оберіть 08:00.', 't-09': 'Для цієї практики оберіть 08:00.'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: 'Це потрібно щодня, а не один раз. <strong>Торкніться «Повтор».</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = 'Щодня'; }, say: '<strong>Торкніться «Щодня».</strong>',
         hints: {never: '«Ніколи» означає, що він спрацює лише раз. Торкніться «Щодня».', weekdays: '«Будні» пропускають вихідні. Торкніться «Щодня».'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: 'Спершу введіть назву в полі «Назва», наприклад «Таблетки».',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: 'Назва підказує, для чого будильник. <strong>Торкніться поля «Назва» й введіть «Таблетки»</strong>, а потім <strong>торкніться «Зберегти»</strong>.'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: 'Будильник дзвенить о 8. Ви приймаєте таблетки. Яку кнопку натиснути?', options: [
            {t: 'Стоп', ok: true, why: 'Так. «Стоп» вимикає його до завтра о 8, бо він повторюється щодня.'},
            {t: 'Відкласти', why: '«Відкласти» змушує його задзвеніти знову приблизно через 9 хвилин. Користуйтеся цим, якщо потрібно ще трохи, але «Стоп» вимикає його до завтра.'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>Чудово!</strong> Ваш будильник для таблеток дзвенить щоранку о 8. ' + (p === 'ios' ? 'У застосунку <strong>«Здоров\'я»</strong> теж є розділ «Ліки», який нагадує вам і веде журнал.' : 'Також можна попросити Google: «Нагадуй мені щодня о 8 приймати таблетки».')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Якби телефон загубився чи зламався, ваші фото були б у безпеці? Перевіримо. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Торкніться свого імені</strong> угорі.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Особисті дані'}, {id: 'security', label: 'Вхід і безпека'}, {id: 'payment', label: 'Оплата і доставка'}, {id: 'subscriptions', label: 'Підписки'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4,2 ГБ'}, {id: 'family', label: 'Сімейний доступ'}, {id: 'findmy', label: 'Локатор'}], {back: 'Налаштування'}),
         target: 'icloud', say: '<strong>Торкніться «iCloud».</strong> iCloud — це онлайн-сховище Apple.'},
        {screen: c => list(p, 'iCloud', [{caption: 'СХОВИЩЕ: ВИКОРИСТАНО 4,2 ГБ ІЗ 5 ГБ'}, {caption: 'ЗБЕРЕЖЕНО В ICLOUD'}, {id: 'photos', label: 'Фото', value: c.photoSync ? 'Увімк.' : 'Вимк.'}, {id: 'backup', label: 'Резервна копія iCloud', value: c.backedUp ? 'Увімк.' : 'Вимк.'},
            {label: 'Контакти', value: 'Увімк.'}, {label: 'Нотатки', value: 'Увімк.'}], {back: 'Apple Account'}),
         target: 'photos', say: '«Фото» і «Резервна копія» обидва <strong>вимкнені</strong>. Це означає, що з втратою телефона втратяться й фото. <strong>Торкніться «Фото».</strong>'},
        {screen: c => list(p, 'Фото', [{id: 'sync', label: 'Синхронізувати цей iPhone', toggle: !!c.photoSync, sub: 'Зберігає ваші фото й відео в iCloud, щоб вони були в безпеці, якщо ви загубите телефон.'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>Торкніться «Синхронізувати цей iPhone»</strong>, щоб увімкнути.'},
        {screen: c => list(p, 'Фото', [{label: 'Синхронізувати цей iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>Торкніться ‹ iCloud</strong>, щоб повернутися.'},
        {screen: c => list(p, 'iCloud', [{caption: 'СХОВИЩЕ: ВИКОРИСТАНО 4,2 ГБ ІЗ 5 ГБ'}, {caption: 'ЗБЕРЕЖЕНО В ICLOUD'}, {id: 'photos', label: 'Фото', value: 'Увімк.'}, {id: 'backup', label: 'Резервна копія iCloud', value: 'Вимк.'}], {back: 'Apple Account'}),
         target: 'backup', say: 'Тепер створимо копію всього іншого: налаштувань, повідомлень і програм. <strong>Торкніться «Резервна копія iCloud».</strong>'},
        {screen: c => list(p, 'Резервна копія', [{id: 'backup-toggle', label: 'Створювати копію цього iPhone', toggle: !!c.backedUp, sub: 'Автоматично створює копію щоночі, коли iPhone заряджається, заблокований і підключений до Wi-Fi.'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Торкніться «Створювати копію цього iPhone»</strong>, щоб увімкнути.'},
        {screen: () => list('ios', 'Резервна копія', [{label: 'Створювати копію цього iPhone', toggle: true}, {id: 'backup-now', label: 'Створити копію зараз', sub: 'Остання успішна копія: ніколи'}], {back: 'iCloud'}),
         target: 'backup-now', say: 'Відтепер копія створюватиметься щоночі. Першу зробіть зараз: <strong>торкніться «Створити копію зараз»</strong>.'},
        {screen: c => list('ios', 'Резервна копія', [{label: 'Створювати копію цього iPhone', toggle: true}, {label: c.busy ? 'Створення копії…' : 'Створити копію зараз', sub: c.busy ? 'Залишилося приблизно 5 хвилин' : 'Остання успішна копія: щойно ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: 'SMS повідомляє: «Ваше сховище iCloud заповнене. Сьогодні ваші фото буде видалено. Сплатіть 99 пенсів тут: [link]». Що ви зробите?', options: [
            {t: 'Проігнорувати посилання. Перевірити в Параметри > ваше ім\'я > iCloud, а потім переслати SMS на 7726', ok: true, why: 'Так. Це поширене шахрайство. Apple не надсилає посилань в SMS і ніколи так не видаляє ваші фото. Перевірте справжній стан сховища в Параметрах.'},
            {t: 'Швидко заплатити, щоб зберегти фото', why: 'Це шахрайство, щоб виманити дані вашої картки. Перевірте справжній стан сховища в Параметри > ваше ім\'я > iCloud і перешліть SMS на 7726.'}]}},
        {screen: () => list('ios', 'Резервна копія', [{label: 'Створювати копію цього iPhone', toggle: true}, {label: 'Створити копію зараз', sub: 'Остання успішна копія: щойно ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>Чудово!</strong> Копії ваших фото й телефона створено. Безкоштовні 5 ГБ швидко заповнюються фото; якщо це станеться, додаткове місце (iCloud+) коштує невелику щомісячну плату, і купувати його слід лише в Параметрах, ніколи не за посиланням із SMS.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Якби телефон загубився чи зламався, ваші фото були б у безпеці? Перевіримо. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Торкніться «Google».</strong> Він ближче до кінця.', hint: 'Прокрутіть список вниз: Google ближче до кінця.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Керувати обліковим записом Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервна копія', sub: 'Вимк.'}, {id: 'autofill', label: 'Автозаповнення'}, {id: 'devices', label: 'Пристрої та обмін'}]),
         target: 'backup', say: 'Резервне копіювання — <strong>Вимк.</strong> <strong>Торкніться «Резервне копіювання».</strong> <em>На Samsung це Налаштування > Облікові записи та резервне копіювання.</em>'},
        {screen: c => list(p, 'Резервна копія', [{id: 'backup-toggle', label: 'Резервне копіювання Google One', toggle: !!c.backedUp, sub: 'Створює копії додатків, повідомлень, історії дзвінків, контактів і налаштувань.'},
            {id: 'photos-backup', label: 'Фото й відео', sub: c.photoSync ? 'Увімк. · Google Фото' : 'Вимк. · Google Фото'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>Торкніться «Резервне копіювання Google One»</strong>, щоб увімкнути.'},
        {screen: c => list(p, 'Резервна копія', [{label: 'Резервне копіювання Google One', toggle: true}, {id: 'photos-backup', label: 'Фото й відео', sub: 'Вимк. · Google Фото'}]),
         target: 'photos-backup', say: 'Фото — окремо. <strong>Торкніться «Фото й відео».</strong>'},
        {screen: c => list(p, 'Резервна копія', [{id: 'photos-toggle', label: 'Створювати копії фото й відео', toggle: !!c.photoSync, sub: 'Зберігає їх у Google Фото, щоб вони були в безпеці, якщо ви загубите телефон.'},
            {label: 'Якість копій', value: 'Економія місця'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>Торкніться «Створювати копії фото й відео»</strong>, щоб увімкнути.'},
        {screen: () => list(p, 'Резервна копія', [{label: 'Створювати копії фото й відео', toggle: true}, {id: 'backup-now', label: 'Створити копію зараз', sub: 'Остання копія: ніколи'}]),
         target: 'backup-now', say: 'Відтепер копії створюватимуться самі, через Wi-Fi. Першу зробіть зараз: <strong>торкніться «Створити копію зараз»</strong>.'},
        {screen: c => list(p, 'Резервна копія', [{label: 'Створювати копії фото й відео', toggle: true}, {label: c.busy ? 'Створення копії…' : 'Створити копію зараз', sub: c.busy ? '1,204 items left' : 'Остання копія: щойно ⟦check⟧'}]), wait: 1500,
         question: {q: 'SMS повідомляє: «Ваше сховище Google заповнене. Сьогодні ваші фото буде видалено. Сплатіть 99 пенсів тут: [link]». Що ви зробите?', options: [
            {t: 'Проігнорувати посилання. Перевірити в Налаштування > Google > Резервне копіювання, а потім переслати SMS на 7726', ok: true, why: 'Так. Це поширене шахрайство. Google не надсилає таких посилань в SMS. Перевірте справжній стан сховища в Налаштуваннях.'},
            {t: 'Швидко заплатити, щоб зберегти фото', why: 'Це шахрайство, щоб виманити дані вашої картки. Перевірте справжній стан сховища в Налаштуваннях і перешліть SMS на 7726.'}]}},
        {screen: () => list(p, 'Резервна копія', [{label: 'Створювати копії фото й відео', toggle: true}, {label: 'Створити копію зараз', sub: 'Остання копія: щойно ⟦check⟧'}]), done: true,
         say: '<strong>Чудово!</strong> Копії ваших фото й телефона створено. Google дає вам 15 ГБ безкоштовно; якщо вони заповняться, додаткове місце коштує невелику щомісячну плату, і купувати його слід лише в Налаштуваннях або в застосунку Google One, ніколи не за посиланням із SMS.'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 ВІТАЄМО! 🎉</strong><p>Вас обрано для виграшу ваучера на покупки на £500!</p>
        <button type="button" class="aeb" data-tap="claim">ОТРИМАТИ ЗАРАЗ</button><small>Реклама</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, 'Про додаток', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>Системна служба</strong><small>Версія 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">Відкрити</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">Видалити</button>
            <button type="button" data-tap="force-stop">Зупинити примусово</button></div>
            <div class="cj ex"><span class="hf"><strong>Акумулятор</strong><small>38% використання від останньої повної зарядки</small></span></div>
            <div class="cj ex"><span class="hf"><strong>Дозволи</strong><small>Показ поверх інших додатків, Адміністратор пристрою</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, 'Системна служба', 'Видалити цей додаток?', [['cancel', 'Скасувати'], ['confirm-uninstall', 'OK']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>КАЛЕНДАР · зараз</strong>
            <span>⚠️ Ваш iPhone може бути заражений! Торкніться тут, щоб очистити його зараз.</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: 'На головному екрані спливає реклама, хоча жоден застосунок не відкрито. Зазвичай це означає, що проник шкідливий застосунок. Спершу <strong>не торкайтеся реклами. Торкніться маленького значка ⟦x⟧, щоб закрити її.</strong>',
         hints: {claim: 'Ніколи не торкайтеся самої реклами. Шукайте маленький значок ⟦x⟧ у кутку.'}, hint: 'Значок ⟦x⟧ маленький, у правому верхньому куті реклами.'},
        {screen: () => home(p), target: 'settings', say: 'Шкідливі застосунки працюють постійно, тож витрачають багато заряду. Так їх можна знайти. <strong>Торкніться «Налаштування».</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>Торкніться «Акумулятор».</strong> <em>На Samsung це «Батарея та обслуговування пристрою», потім «Батарея».</em>'},
        {screen: () => list(p, 'Акумулятор', [{id: 'usage', label: 'Використання заряду', sub: 'Переглянути використання від останньої повної зарядки'}, {label: 'Економія заряду', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>Торкніться «Використання заряду».</strong> <em>На деяких Samsung торкніться графіка або «Переглянути деталі».</em>'},
        {screen: () => list(p, 'Використання заряду', [], {top: `<div class="nl">${[['Системна служба', 38], ['Екран', 21], ['WhatsApp', 12], ['YouTube', 8], ['Камера', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: 'Що з цього виглядає недоречним?', options: [
            {t: 'Системна служба: ви нею ніколи не користувалися, а вона витрачає найбільше заряду', ok: true, why: 'Так. Шкідливі застосунки дають собі нудні назви на кшталт «Системна служба» чи «Налаштування клавіатури», щоб ви їх не помітили. Запишіть її назву.'},
            {t: 'Екран', why: 'Екран завжди витрачає багато заряду, це нормально. Дивне тут — «Системна служба», якою ви ніколи не користувалися.'},
            {t: 'WhatsApp', why: 'WhatsApp — застосунок, яким ви користуєтеся, тож це нормально. Дивне тут — «Системна служба».'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Тепер знайдімо її серед ваших додатків. Повернувшись у Налаштування, <strong>торкніться «Додатки»</strong>.'},
        {screen: () => list(p, 'Програми', [{caption: 'Нещодавно відкриті додатки'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: 'Показати всі 46 додатків'}, {id: 'default-apps', label: 'Додатки за умовчанням'}]),
         target: 'all-apps', say: '<strong>Торкніться «Показати всі додатки».</strong>'},
        {screen: () => list(p, 'Усі додатки', ['Калькулятор', 'Календар', 'Камера', 'Chrome', 'Годинник', 'Контакти', 'Gmail', 'Карти'].map(n => ({label: n})).concat([{id: 'system-service', label: 'Системна служба'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: 'Список розташовано за алфавітом, від A до Z. <strong>Торкніться «Системна служба».</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: 'Кнопка <strong>«Видалити»</strong> неактивна. Шкідливі застосунки роблять так, щоб ви не могли їх прибрати. Спершу <strong>торкніться «Зупинити примусово»</strong>, щоб зупинити її роботу.',
         hints: {uninstall: 'Вона неактивна, тож поки не спрацює. Спершу торкніться «Зупинити примусово».', open: 'Не відкривайте її. Торкніться «Зупинити примусово».'}},
        {screen: () => list(p, 'Пошук у налаштуваннях', [{caption: 'Результати для «адміністратор пристрою»'}, {id: 'device-admin', label: 'Додатки адміністратора пристрою', sub: 'Безпека та конфіденційність > Інші параметри безпеки'}]),
         target: 'device-admin',
         say: 'Тепер заберімо в неї особливий дозвіл. У Налаштуваннях <strong>знайдіть «адміністратор пристрою»</strong> через рядок пошуку вгорі. Ось результат: <strong>торкніться «Додатки адміністратора пристрою»</strong>.'},
        {screen: c => list(p, 'Додатки адміністратора пристрою', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: 'Системна служба', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, 'Деактивувати цей додаток адміністратора пристрою?', '«Системна служба» більше не зможе заважати вам її видалити.', [['cancel', 'Скасувати'], ['deactivate', 'Деактивувати']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: 'Find My Device — від Google, з ним усе гаразд. <strong>Торкніться перемикача біля «Системна служба».</strong>', hints: {'find-my': 'Залиште Find My Device увімкненим. Торкніться «Системна служба».'}},
        {screen: c => list(p, 'Додатки адміністратора пристрою', [{label: 'Find My Device', toggle: true, sub: 'Google'}, {label: 'Системна служба', toggle: true}],
            {overlay: dialog(p, 'Деактивувати цей додаток адміністратора пристрою?', '«Системна служба» більше не зможе заважати вам її видалити.', [['cancel', 'Скасувати'], ['deactivate', 'Деактивувати']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>Торкніться «Деактивувати».</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: 'Повернувшись до «Системної служби», бачите, що <strong>«Видалити»</strong> тепер працює. <strong>Торкніться «Видалити».</strong>', hints: {'force-stop': 'Вона вже зупинена. Торкніться «Видалити».'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>Торкніться «OK».</strong>'},
        {screen: () => home(p), target: 'store', say: 'Видалено! Нарешті попросіть Google перевірити, чи немає чогось ще. <strong>Відкрийте Play Маркет.</strong>'},
        {screen: c => app(p, 'Play Захист', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? 'Шкідливих додатків не знайдено' : 'Просканувати телефон'}</strong>
            <small>${c.scanned ? 'Перевірено щойно' : 'Останнє сканування: 3 тижні тому'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: 'У Play Маркеті торкніться свого <strong>фото профілю</strong> (угорі праворуч), а потім <strong>«Play Захист»</strong>. Тут його вже відкрито. <strong>Торкніться «Сканувати».</strong>'},
        {screen: () => app(p, 'Play Захист', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>Шкідливих додатків не знайдено</strong><small>Перевірено щойно</small></div>', {color: '#fff'}), done: true,
         say: '<strong>Чудово!</strong> Ви знайшли шкідливий застосунок за споживанням заряду, забрали в нього особливий дозвіл, видалили його й перевірили телефон. Щоб їх уникати: встановлюйте застосунки лише з Play Маркету і остерігайтеся безкоштовних ліхтариків, «очисників» та «прискорювачів».'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: 'Сповіщення від вашого Календаря каже: «Ваш iPhone може бути заражений! Торкніться тут, щоб очистити його зараз.» Що це?', options: [
            {t: 'Спам, що пробрався у ваш календар. Не торкайтеся його', ok: true, why: 'Так. Якщо торкнутися «Дозволити» на сумнівному сайті, до iPhone можна додати спам-календар. Його «події» — це реклама, схожа на попередження. З вашим iPhone все гаразд.'},
            {t: 'Справжнє попередження від Apple', why: 'Apple не надсилає попереджень про віруси через Календар. Це спам із підписаного календаря. Не торкайтеся його.'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: 'Видалімо спам-календар. <strong>Торкніться «Параметри»</strong>, а не сповіщення.', hints: {notif: 'Не торкайтеся попередження. Торкніться «Параметри».'}},
        {screen: c => settingsList(p, c), target: 'apps', say: 'Прокрутіть вниз і <strong>торкніться «Програми»</strong>.', hint: '«Програми» — в останній групі.'},
        {screen: () => list(p, 'Програми', ['App Store', 'Книги'].map(n => ({label: n})).concat([{id: 'calendar', label: 'Календар'}, {label: 'Камера'}, {label: 'Контакти'}, {label: 'Пошта'}]), {back: 'Налаштування'}),
         target: 'calendar', say: '<strong>Торкніться «Календар».</strong>'},
        {screen: () => list(p, 'Календар', [{id: 'accounts', label: 'Облікові записи календарів', value: '2'}, {label: 'Примусовий часовий пояс', value: 'Вимк.'}, {label: 'Час сповіщень за умовчанням'}], {back: 'Програми'}),
         target: 'accounts', say: '<strong>Торкніться «Облікові записи календарів».</strong>'},
        {screen: () => list(p, 'Облікові записи календарів', [{caption: 'ОБЛІКОВІ ЗАПИСИ'}, {label: 'iCloud', sub: 'Календарі, Контакти та ще 7'}, {id: 'subscribed', label: 'Підписані календарі', value: '1'}], {back: 'Календар'}),
         target: 'subscribed', say: 'iCloud — ваш власний. <strong>Торкніться «Підписані календарі».</strong>'},
        {screen: () => list(p, 'Підписані календарі', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: 'Підписано'}], {back: 'Облікові записи календарів'}),
         target: 'spam-cal', say: 'Ось він: календар, який ви ніколи не збиралися додавати. <strong>Торкніться «Phone-Security-Alerts».</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сервер', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: 'Видалити обліковий запис', danger: true}],
            {back: 'Назад', overlay: c.askDelete ? dialog(p, 'Ви впевнені?', 'Це видалить календар і його події з вашого iPhone.', [['cancel', 'Скасувати'], ['confirm-delete', 'Видалити обліковий запис']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>Торкніться «Видалити обліковий запис».</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: 'Сервер', value: 'clean-phone-now.example'}, {caption: ' '}, {label: 'Видалити обліковий запис', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Ви впевнені?', 'Це видалить календар і його події з вашого iPhone.', [['cancel', 'Скасувати'], ['confirm-delete', 'Видалити обліковий запис']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>Торкніться «Видалити обліковий запис»</strong>, щоб підтвердити.'},
        {screen: c => settingsList(p, c), target: 'general', say: 'Видалено. Ще одна перевірка: сумнівні сайти можуть також встановлювати «профіль». <strong>Торкніться «Загальні».</strong>'},
        {screen: () => list(p, 'Загальні', [{id: 'about', label: 'Про пристрій'}, {id: 'update', label: 'Оновлення ПЗ'}, {id: 'storage', label: 'Сховище iPhone'}, {id: 'vpn', label: 'VPN і керування пристроєм'}], {back: 'Налаштування'}),
         target: 'vpn', say: '<strong>Торкніться «VPN і керування пристроєм».</strong>'},
        {screen: c => list(p, 'VPN і керування пристроєм', c.profileGone ? [{label: 'VPN', value: 'Не підключено'}] : [{label: 'VPN', value: 'Не підключено'}, {caption: 'ПРОФІЛЬ КОНФІГУРАЦІЇ'}, {id: 'profile', label: 'Безкоштовний підсилювач телефона', sub: 'Неперевірено'}], {back: 'Загальні'}),
         target: 'profile', say: 'Якщо ви бачите тут профіль, якого не впізнаєте (профіль від роботи чи школи — це нормально), видаліть його. <strong>Торкніться «Безкоштовний підсилювач телефона».</strong>'},
        {screen: c => list(p, 'Профіль', [{label: 'Безкоштовний підсилювач телефона', sub: 'Неперевірений · Містить: веб-кліпи, сертифікати'}, {caption: ' '}, {id: 'remove-profile', label: 'Видалити профіль', danger: true}],
            {back: 'Назад', overlay: c.askRemove ? dialog(p, 'Видалити профіль', 'Видалення цього профілю призведе до видалення всіх його параметрів.', [['cancel', 'Скасувати'], ['confirm-remove', 'Видалити']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>Торкніться «Видалити профіль»</strong>. iPhone попросить код допуску.'},
        {screen: c => list(p, 'Профіль', [{label: 'Безкоштовний підсилювач телефона', sub: 'Неперевірено'}, {caption: ' '}, {label: 'Видалити профіль', danger: true}],
            {back: 'Назад', overlay: dialog(p, 'Видалити профіль', 'Видалення цього профілю призведе до видалення всіх його параметрів.', [['cancel', 'Скасувати'], ['confirm-remove', 'Видалити']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>Торкніться «Видалити».</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>Чудово!</strong> Фальшиві попередження зникли. Щоб це не повторилося: на сайтах торкайтеся <strong>«Не дозволяти»</strong> або <strong>«Закрити»</strong> у будь-якому спливаючому вікні із проханням додати календар чи профіль, і встановлюйте застосунки лише з App Store.'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: 'Скасовано · Закінчується 22 жовтня'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '£4.99 на тиждень · Поновлюється 22 жовтня'};
        return list(p, 'Підписки', [{caption: p === 'ios' ? 'АКТИВНІ' : 'Активна'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '£0.99 на місяць' : '£1.59 на місяць'},
            {caption: p === 'ios' ? 'НЕАКТИВНІ' : 'Закінчилася'}, {label: 'Crossword Daily', sub: 'Закінчилася 3 березня'}], {back: p === 'ios' ? 'Apple Account' : 'Назад'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? 'ВАША ПІДПИСКА' : 'План'}, {label: 'Щотижня', sub: '£4.99 на тиждень. Почалася як 3-денна безкоштовна пробна версія.'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? 'Скасувати підписку' : 'Скасувати підписку', danger: true}],
            {back: 'Підписки', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? 'Підтвердити скасування' : 'Скасувати підписку?', 'Ви можете користуватися нею до 22 жовтня. Більше гроші не списуватимуться.', [['keep', p === 'ios' ? 'Не зараз' : 'Залишити']].concat([['confirm-cancel', p === 'ios' ? 'Підтвердити' : 'Скасувати підписку']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: 'Безкоштовні пробні періоди часто непомітно стають платними підписками. Перевіримо. <strong>Торкніться «Параметри».</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>Торкніться свого імені</strong> угорі.'},
            {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Особисті дані'}, {id: 'security', label: 'Вхід і безпека'}, {id: 'payment', label: 'Оплата і доставка'}, {id: 'subscriptions', label: 'Підписки'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: 'Налаштування'}),
             target: 'subscriptions', say: '<strong>Торкніться «Підписки».</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: 'Безкоштовні пробні періоди часто непомітно стають платними підписками. Перевіримо. <strong>Відкрийте Play Маркет.</strong>'},
            {screen: c => app(p, 'Play Маркет', `<div class="hp"><span>ПРОПОНУЄМО ВАМ</span><strong>Застосунки для початку</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>Торкніться свого фото профілю</strong>, круглої літери вгорі праворуч.'},
            {screen: c => app(p, 'Play Маркет', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>Торкніться «Платежі та підписки».</strong>'},
            {screen: () => list(p, 'Платежі та підписки', [{id: 'methods', label: 'Способи оплати'}, {id: 'subscriptions', label: 'Підписки', sub: 'Керувати підписками'}, {id: 'budget', label: 'Бюджет та історія'}]),
             target: 'subscriptions', say: '<strong>Торкніться «Підписки».</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '«Photo Editor Pro» почався як безкоштовна пробна версія, а тепер це <strong>£4.99 щотижня</strong>. Це понад £250 на рік! <strong>Торкніться її.</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? 'Скасувати підписку' : 'Скасувати підписку'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? 'Підтвердити' : 'Скасувати підписку'}.</strong>`, hints: {keep: 'Вона й далі списує гроші. Торкніться ' + (p === 'ios' ? 'Підтвердити' : 'Скасувати підписку') + '.'}},
        {screen: c => subsList(p, c), question: {q: 'Ви видалили застосунок Photo Editor з телефона. Чи зупиняє це платежі?', options: [
            {t: 'Ні. Потрібно скасувати підписку, як ви щойно зробили', ok: true, why: 'Саме так. Видалення застосунку НЕ скасовує підписку. Ви платите, доки не скасуєте її тут.'},
            {t: 'Так, видалення застосунку зупиняє платежі', why: 'Ні! Ви платите, доки не скасуєте саму підписку, ось тут.'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>Чудово!</strong> Ви заощадили £4.99 на тиждень. Порада: коли починаєте безкоштовний пробний період, поставте будильник на день до його закінчення. Також час від часу переглядайте список регулярних платежів у банківському застосунку.'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Новіші iPhone мають <strong>Apple Intelligence</strong>: ШІ, який пише, підсумовує й редагує за вас. Його можна вимкнути. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>Торкніться «Apple Intelligence і Siri».</strong>', hint: 'Це в третій групі, під «Універсальним доступом».'},
        {screen: c => list(p, 'Apple Intelligence і Siri', [{id: 'ai-toggle', label: 'Apple Intelligence', toggle: !c.aiOff, sub: 'Інструменти для письма, підсумки сповіщень, Image Playground та інше.'},
            {caption: 'РОЗШИРЕННЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? 'Вимк.' : 'Увімк.'}, {caption: 'SIRI'}, {label: 'Розмова із Siri', value: '«Siri» або «Hey Siri»'}],
            {back: 'Налаштування', overlay: c.askOff ? dialog(p, 'Вимкнути Apple Intelligence?', 'Функції на кшталт інструментів для письма та підсумків більше не будуть доступні.', [['cancel', 'Скасувати'], ['confirm-off', 'Вимкнути']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>Торкніться перемикача Apple Intelligence</strong>, щоб вимкнути його.', hints: {chatgpt: 'ChatGPT зробимо наступним. Спершу торкніться перемикача Apple Intelligence.'}},
        {screen: c => list(p, 'Apple Intelligence і Siri', [{label: 'Apple Intelligence', toggle: true}, {caption: 'РОЗШИРЕННЯ'}, {label: 'ChatGPT', value: 'Увімк.'}],
            {back: 'Налаштування', overlay: dialog(p, 'Вимкнути Apple Intelligence?', 'Функції на кшталт інструментів для письма та підсумків більше не будуть доступні.', [['cancel', 'Скасувати'], ['confirm-off', 'Вимкнути']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>Торкніться «Вимкнути».</strong>'},
        {screen: c => list(p, 'Apple Intelligence і Siri', [{label: 'Apple Intelligence', toggle: false}, {caption: 'РОЗШИРЕННЯ'}, {id: 'chatgpt', label: 'ChatGPT', value: 'Увімк.'}], {back: 'Налаштування'}),
         target: 'chatgpt', say: 'Розширення ChatGPT може надсилати ваші запитання до ChatGPT, компанії поза Apple. <strong>Торкніться «ChatGPT».</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: 'Використовувати ChatGPT', toggle: !c.gptOff, sub: 'Siri може надсилати запити до ChatGPT.'}], {back: 'Назад'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>Торкніться «Використовувати ChatGPT»</strong>, щоб вимкнути.'},
        {screen: () => list(p, 'ChatGPT', [{label: 'Використовувати ChatGPT', toggle: false}], {back: 'Назад'}),
         question: {q: 'У WhatsApp, Facebook та інших застосунках теж є ШІ-чати. Яке правило безпеки?', options: [
            {t: 'Ніколи не вводити особисті дані (банк, здоров\'я, паролі, адреси) в жоден ШІ-чат', ok: true, why: 'Так. Те, що ви вводите, може зберігатися й використовуватися для навчання ШІ. Ставтеся до цього як до розмови з незнайомцем.'},
            {t: 'ШІ-чати приватні, тож можна писати що завгодно', why: 'Вони не приватні, як телефонна розмова. Те, що ви вводите, може зберігатися. Не вводьте туди особисті дані.'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: 'Використовувати ChatGPT', toggle: false}], {back: 'Назад'}), done: true,
         say: '<strong>Чудово!</strong> Apple Intelligence і ChatGPT вимкнено. Увімкнути їх знову можна будь-коли в тому самому місці. Siri працює як зазвичай.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'Телефони Android тепер постачаються з <strong>Gemini</strong>, ШІ від Google. Утримування кнопки живлення може випадково його відкривати. Змінімо це. <strong>Торкніться «Налаштування».</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>Торкніться «Додатки».</strong>'},
        {screen: () => list(p, 'Програми', [{caption: 'Нещодавно відкриті додатки'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: 'Показати всі 45 додатків'}, {id: 'default-apps', label: 'Додатки за умовчанням', sub: 'Додатки помічника, браузера й телефона'}]),
         target: 'default-apps', say: '<strong>Торкніться «Додатки за умовчанням».</strong>'},
        {screen: () => list(p, 'Додатки за умовчанням', [{label: 'Додаток браузера', sub: 'Chrome'}, {id: 'assistant', label: 'Додаток цифрового помічника', sub: 'Gemini'}, {label: 'Додаток «Телефон»', sub: 'Телефон'}, {label: 'Додаток для SMS', sub: 'Повідомлення'}]),
         target: 'assistant', say: '<strong>Торкніться «Додаток цифрового помічника».</strong>'},
        {screen: c => list(p, 'Додаток цифрового помічника', [{id: 'assistant-app', label: 'Додаток цифрового помічника за умовчанням', sub: c.noAssist ? 'Немає' : 'Gemini'}, {label: 'Використовувати текст з екрана', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>Додаток цифрового помічника за умовчанням</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Немає</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>Торкніться «Додаток цифрового помічника за умовчанням».</strong>'},
        {screen: c => list(p, 'Додаток цифрового помічника', [{label: 'Додаток цифрового помічника за умовчанням', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Додаток цифрового помічника за умовчанням</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">Немає</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>Торкніться «Немає».</strong> Gemini більше не з\'являтиметься, коли ви утримуєте кнопку живлення.', hints: {'assist-gemini': 'Це залишає Gemini. Торкніться «Немає».'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: 'Далі зробімо так, щоб Gemini не зберігав те, що ви йому пишете. <strong>Відкрийте застосунок Gemini.</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">Привіт, Margaret<br><small>Чим я можу вам допомогти сьогодні?</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>Торкніться свого фото профілю</strong> угорі праворуч.'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>Торкніться «Активність у застосунках Gemini».</strong> <em>На деяких телефонах це називається «Зберігати активність».</em>'},
        {screen: c => app(p, 'Активність у застосунках Gemini', `<p class="cf"><strong>${c.actOff ? 'Вимк.' : 'Увімк.'}</strong><br>${c.actOff ? 'Ваші чати більше не зберігаються у вашому обліковому записі й не використовуються для покращення ШІ Google.' : 'Ваші чати зберігаються у вашому обліковому записі Google і можуть переглядатися для покращення ШІ Google.'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Вимкнути</button><button type="button" class="cj" data-tap="off-delete">Вимкнути й видалити активність</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>Торкніться «Вимкнути».</strong>'},
        {screen: c => app(p, 'Активність у застосунках Gemini', '<p class="cf"><strong>Увімк.</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">Вимкнути</button><button type="button" class="cj" data-tap="off-delete">Вимкнути й видалити активність</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>Торкніться «Вимкнути й видалити активність»</strong>, щоб очистити також те, що вже збережено.', hints: {'off-only': 'Це зупиняє збереження нових чатів, але залишає старі. Торкніться «Вимкнути й видалити активність».'}},
        {screen: c => app(p, 'Активність у застосунках Gemini', '<p class="cf"><strong>Вимк.</strong></p>', {color: '#fff'}),
         question: {q: 'У WhatsApp, Facebook та інших застосунках теж є ШІ-чати. Яке правило безпеки?', options: [
            {t: 'Ніколи не вводити особисті дані (банк, здоров\'я, паролі, адреси) в жоден ШІ-чат', ok: true, why: 'Так. Те, що ви вводите, може зберігатися й використовуватися для навчання ШІ. Ставтеся до цього як до розмови з незнайомцем.'},
            {t: 'ШІ-чати приватні, тож можна писати що завгодно', why: 'Вони не приватні, як телефонна розмова. Те, що ви вводите, може зберігатися. Не вводьте туди особисті дані.'}]}},
        {screen: c => app(p, 'Активність у застосунках Gemini', '<p class="cf"><strong>Вимк.</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>Чудово!</strong> Gemini більше не з\'являється від кнопки живлення і не зберігає ваші чати. На Samsung також зазирніть у <strong>Налаштування > Galaxy AI</strong>, де кожна функція має власний перемикач.'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'У вашому Apple Account зберігаються ваші фото, контакти й платежі. Перевіримо, чи він захищений. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>Торкніться свого імені</strong> угорі.'},
        {screen: () => list(p, 'Apple Account', [{id: 'personal', label: 'Особисті дані'}, {id: 'security', label: 'Вхід і безпека'}, {id: 'payment', label: 'Оплата і доставка'}, {id: 'subscriptions', label: 'Підписки'}], {back: 'Налаштування'}),
         target: 'security', say: '<strong>Торкніться «Вхід і безпека».</strong>'},
        {screen: () => list(p, 'Вхід і безпека', [{label: 'Електронна пошта й номери телефонів', sub: '+44 7700 900123'}, {label: 'Змінити пароль'}, {caption: ' '}, {label: 'Двофакторна автентифікація', value: 'Увімк.'},
            {id: 'recovery', label: 'Відновлення облікового запису'}], {back: 'Apple Account'}),
         target: 'recovery', say: '<strong>Двофакторна автентифікація</strong> — «Увімк.»: чудово. Це означає, що новий пристрій потребує коду з вашого телефона, перш ніж увійти. Тепер <strong>торкніться «Відновлення облікового запису»</strong>.'},
        {screen: c => list(p, 'Відновлення облікового запису', [{caption: 'КОНТАКТ ДЛЯ ВІДНОВЛЕННЯ'}, c.recovery ? {label: 'Sarah', sub: 'Очікування, поки Sarah прийме'} : {id: 'add-contact', label: 'Додати контакт для відновлення…', sub: 'Людина, якій ви довіряєте і яка може допомогти вам повернути доступ до облікового запису.'}],
            {back: 'Назад', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>Виберіть контакт для відновлення</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (донька)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: 'Якщо ви колись забудете пароль, <strong>контакт для відновлення</strong> може отримати для вас код, щоб допомогти повернути доступ. Він не бачить ваших даних. <strong>Торкніться «Додати контакт для відновлення».</strong>'},
        {screen: c => list(p, 'Відновлення облікового запису', [{caption: 'КОНТАКТ ДЛЯ ВІДНОВЛЕННЯ'}, {label: 'Додати контакт для відновлення…'}],
            {back: 'Назад', overlay: `<div class="ei"><div class="cv"><p><strong>Виберіть контакт для відновлення</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah (донька)</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: 'Оберіть людину, якій довіряєте і яка має iPhone. <strong>Торкніться Sarah.</strong>', hints: {'pick-dave': 'Для цієї практики оберіть Sarah.'}},
        {screen: c => list(p, 'Відновлення облікового запису', [{caption: 'КОНТАКТ ДЛЯ ВІДНОВЛЕННЯ'}, {label: 'Sarah', sub: 'Очікування, поки Sarah прийме'}], {back: 'Назад'}),
         question: {q: 'Хтось телефонує і каже, що він з Apple. Просить назвати 6-значний код, який щойно з\'явився на вашому телефоні. Що ви зробите?', options: [
            {t: 'Покласти слухавку. Ніколи нікому не повідомляти цей код', ok: true, why: 'Саме так. Цей код дає комусь доступ до вашого облікового запису. Apple ніколи не телефонує з проханням назвати його.'},
            {t: 'Назвати, це ж з Apple', why: 'Apple ніколи не просить цей код. Хто його має, може потрапити у ваш обліковий запис. Киньте слухавку.'}]}},
        {screen: c => list(p, 'Відновлення облікового запису', [{caption: 'КОНТАКТ ДЛЯ ВІДНОВЛЕННЯ'}, {label: 'Sarah', sub: 'Очікування, поки Sarah прийме'}], {back: 'Назад'}), done: true,
         say: '<strong>Чудово!</strong> Двофакторну автентифікацію ввімкнено, і Sarah може допомогти вам повернути доступ. iPhone також може запам\'ятовувати паролі за вас у застосунку <strong>«Паролі»</strong>.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: 'У вашому обліковому записі Google зберігаються ваша пошта, фото й контакти. Додаймо до нього другий замок. <strong>Торкніться «Налаштування».</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>Торкніться «Google».</strong>', hint: 'Google ближче до кінця списку.'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: 'Керувати обліковим записом Google', sub: 'margaret.smith@example.com'}, {id: 'backup', label: 'Резервна копія'}, {id: 'autofill', label: 'Автозаповнення'}]),
         target: 'manage', say: '<strong>Торкніться «Керувати обліковим записом Google».</strong>'},
        {screen: () => app(p, 'Обліковий запис Google', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>Торкніться «Безпека»</strong> угорі.'},
        {screen: c => list(p, 'Безпека', [{caption: 'Як ви входите в Google'}, {id: '2sv', label: 'Двоетапна перевірка', sub: c.twoOn ? 'Увімк.' : 'Вимк.'}, {label: 'Пароль', sub: 'Востаннє змінено 2 роки тому'}, {label: 'Телефон для відновлення', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>Двоетапна перевірка</strong> — «Вимк.». Це означає, що для входу на новому пристрої потрібен ще й код, надісланий на ваш телефон, тож викраденого пароля недостатньо. <strong>Торкніться її.</strong>'},
        {screen: () => list(p, 'Двоетапна перевірка', [], {top: '<p class="cf">Ваш номер телефону: <strong>07700 900123</strong><br>Ми надішлемо на цей номер SMS із кодом, щоб перевірити, що він ваш.</p><button type="button" class="ce dk" data-tap="send-code">Надіслати код</button>'}),
         target: 'send-code', say: '<strong>Торкніться «Надіслати код».</strong>'},
        {screen: c => list(p, 'Двоетапна перевірка', [], {top: `<div class="sd"><strong>ПОВІДОМЛЕННЯ · зараз</strong><span>G-382605 — ваш код підтвердження Google.</span></div>
            <p class="cf">Введіть код, який ми надіслали в SMS на 07700 900123</p>${field('gcode', 'Введіть код', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">Далі</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: 'Введіть 6 цифр із SMS: 382605.',
         say: 'Надходить SMS із кодом. <strong>Введіть 382605 у поле</strong> і <strong>торкніться «Далі»</strong>. <em>(Це навчальний код. Ніколи не вводьте справжній код ніде, окрім місця, де його попросили.)</em>'},
        {screen: () => list(p, 'Двоетапна перевірка', [], {top: '<p class="cf">Ваш номер телефону перевірено ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">Увімкнути двоетапну перевірку</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>Торкніться «Увімкнути двоетапну перевірку».</strong>'},
        {screen: c => list(p, 'Безпека', [{caption: 'Як ви входите в Google'}, {label: 'Двоетапна перевірка', sub: 'Увімк. ⟦check⟧'}, {label: 'Телефон для відновлення', sub: '07700 900123'}]),
         question: {q: 'Хтось телефонує і каже, що він з Google. Просить назвати код, який вам щойно надійшов у SMS. Що ви зробите?', options: [
            {t: 'Покласти слухавку. Ніколи нікому не повідомляти цей код', ok: true, why: 'Саме так. Цей код дає комусь доступ до вашого облікового запису. Google ніколи не телефонує з проханням назвати його.'},
            {t: 'Назвати, це ж з Google', why: 'Google ніколи не просить цей код. Хто його має, може потрапити у ваш обліковий запис. Киньте слухавку.'}]}},
        {screen: c => list(p, 'Безпека', [{caption: 'Як ви входите в Google'}, {label: 'Двоетапна перевірка', sub: 'Увімк. ⟦check⟧'}]), done: true,
         say: '<strong>Чудово!</strong> Тепер вашому обліковому запису Google потрібен і ваш телефон, і пароль. Google також може запам\'ятовувати ваші паролі: шукайте <strong>Менеджер паролів Google</strong> у Налаштуваннях.'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>Чудова прогулянка набережною сьогодні вранці! 🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>Наступна прогулянка: субота, 10:00, від гавані.</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">Нових запитів у друзі немає.</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>Переглянути профіль</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>Налаштування та конфіденційність</strong></button><div class="ck"><strong>Довідка та підтримка</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: 'Переконаймося, що те, що ви публікуєте, бачать лише ваші друзі. <strong>Відкрийте Facebook.</strong> <em>(Навчальна версія. Не справжній застосунок.)</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>Торкніться «Меню»</strong> унизу праворуч.', hints: {'tab-friends': 'Запити в друзі розглянемо за мить. Спершу торкніться «Меню».'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>Торкніться «Налаштування та конфіденційність»</strong>.'},
        {screen: c => list(p, 'Налаштування', [{caption: 'Аудиторія та видимість'}, {id: 'posts', label: 'Публікації', sub: 'Хто може бачити ваші майбутні публікації: ' + (c.audience || 'Публічно')}, {label: 'Дані профілю'}, {label: 'Як люди вас знаходять і зв\'язуються з вами'},
            {caption: 'Ваша активність'}, {label: 'Журнал дій'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>Хто може бачити ваші майбутні публікації?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Публічно<small>Будь-хто у Facebook чи за його межами</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Друзі<small>Ваші друзі у Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Лише я</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: 'Ваші публікації мають доступ <strong>Публічно</strong>: їх може бачити будь-хто у світі. <strong>Торкніться «Публікації».</strong>'},
        {screen: c => list(p, 'Налаштування', [{caption: 'Аудиторія та видимість'}, {label: 'Публікації', sub: 'Хто може бачити ваші майбутні публікації: Публічно'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>Хто може бачити ваші майбутні публікації?</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ Публічно<small>Будь-хто у Facebook чи за його межами</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ Друзі<small>Ваші друзі у Facebook</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ Лише я</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = 'Друзі'; }, say: '<strong>Торкніться «Друзі».</strong>',
         hints: {'aud-public': '«Публічно» — це те, що було. Торкніться «Друзі».', 'aud-me': '«Лише я» означає, що ніхто інший не бачить ваших публікацій. Торкніться «Друзі».'}},
        {screen: c => list(p, 'Налаштування', [{caption: 'Аудиторія та видимість'}, {label: 'Публікації', sub: 'Хто може бачити ваші майбутні публікації: Друзі ⟦check⟧'}, {id: 'back-feed', label: '‹ Назад до Facebook'}]),
         target: 'back-feed', say: 'Готово. Тепер <strong>торкніться «Назад до Facebook»</strong>.', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: 'У вас є запит у друзі. <strong>Торкніться «Друзі».</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: 'Запит у друзі від «Jean Smith». Але ви вже друзі з Jean (вона є у вашій стрічці). Що відбувається?', options: [
            {t: 'Ймовірно, це копія профілю Jean, створена шахраєм', ok: true, why: 'Так. Шахраї копіюють чиєсь ім\'я та фото, а потім пишуть її друзям із проханням про гроші. Справжня Jean уже ваша подруга.'},
            {t: 'У Jean, мабуть, другий обліковий запис', why: 'Можливо, але набагато ймовірніше, що це копія, створена шахраєм: його створено 2 дні тому. Уточніть у Jean по телефону.'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>Торкніться «Видалити»</strong>, щоб відхилити запит.', hints: {'confirm-jean': 'Не підтверджуйте скопійований профіль. Торкніться «Видалити».'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>Чудово!</strong> Ваші публікації тепер лише для друзів, і ви уникли фальшивого профілю. Повідомте Jean, щоб вона могла поскаржитися на нього. Також остерігайтеся покупців на Marketplace, які хочуть заплатити «через кур\'єра» або просять коди, надіслані на ваш телефон.'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : 'Шукати тут'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>Автобусна й залізнична станція, Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>Лікарня, Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>Церква, Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>Автобусна й залізнична станція · 25 миль</small><button type="button" class="ce co" data-tap="directions">Маршрут</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 хв (25 миль)</strong><small>Найшвидший маршрут через A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ Пройдіть пішки 4 хв до <strong>Bridlington Bus Station</strong>, платформа 3</li>
                <li>⟦bus⟧ <strong>121</strong> до Hull · 10:15 · <b class="ahy">Вчасно</b></li><li>Вийдіть на <strong>Hull Paragon Interchange</strong> (24 зупинки)</li></ol>
                <button type="button" class="ce co" data-tap="start">Почати</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: '«Карти» можуть спланувати поїздку автобусом із розкладом наживо. Поїдьмо до Hull автобусом. <strong>Відкрийте «Карти».</strong>' + (p === 'ios' ? ' <em>(Google Maps працює так само, якщо вам більше подобається він.)</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>Торкніться поля пошуку</strong> угорі.'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: 'Ми ввели «Hull interchange». <strong>Торкніться Hull Paragon Interchange</strong>, автобусної станції.'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>Торкніться «Маршрут».</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: 'Спершу показано їзду автомобілем. <strong>Торкніться автобуса</strong> ⟦bus⟧, щоб побачити громадський транспорт.', hints: {'mode-walk': 'Вісім годин! Натомість торкніться автобуса.', 'mode-car': 'Це їзда автомобілем. Торкніться автобуса.'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: 'Ось автобуси, найближчий першим. «Вчасно» — це дані наживо. <strong>Торкніться рейсу о 10:15.</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: 'Де сідати на автобус?', options: [
            {t: 'Bridlington Bus Station, платформа 3', ok: true, why: 'Так. «Карти» підказують, куди йти пішки, яким автобусом їхати і де виходити.'},
            {t: 'Hull Paragon Interchange', why: 'Це місце, де ви виходите. Сідати треба на Bridlington Bus Station, платформа 3.'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>Чудово!</strong> Торкніться <strong>«Почати»</strong> під час справжньої поїздки, і «Карти» повідомлять, коли наближається ваша зупинка. З квитком-проїзним просто покажіть його водієві, як зазвичай. <em>(Лише навчальний розклад: справжній перевіряйте в день поїздки.)</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>Екстрений виклик — SOS</strong> телефонує за вас на 999 і надсилає ваше місцеперебування в SMS людям, яких ви оберете. Перевіримо, чи він готовий. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>Торкніться «Екстрений виклик — SOS».</strong>', hint: 'Він у третій групі, із червоним значком.'},
        {screen: c => list(p, 'Екстрений виклик — SOS', [{label: 'Виклик утримуванням і відпусканням', toggle: true, sub: 'Утримуйте бічну кнопку й кнопку гучності, а потім відпустіть.'},
            {id: 'five', label: 'Виклик п\'ятиразовим натисканням', toggle: !!c.five, sub: 'Швидко натисніть бічну кнопку 5 разів.'}, {caption: ' '},
            {id: 'contacts', label: 'Налаштувати контакти для екстрених випадків у «Здоров\'ї»'}, {label: 'Виявлення аварії', toggle: true, sub: 'Телефонує на 999 після серйозної автокатастрофи.'}], {back: 'Налаштування'}),
         target: 'five', action: c => { c.five = true; }, say: 'П\'ять натискань бічної кнопки легко згадати в паніці. <strong>Увімкніть «Виклик п\'ятиразовим натисканням».</strong>'},
        {screen: c => list(p, 'Екстрений виклик — SOS', [{label: 'Виклик утримуванням і відпусканням', toggle: true}, {label: 'Виклик п\'ятиразовим натисканням', toggle: true}, {caption: ' '},
            {id: 'contacts', label: 'Налаштувати контакти для екстрених випадків у «Здоров\'ї»'}], {back: 'Налаштування', overlay: c.pick ? sheet('Додати контакт для екстрених випадків', [['pick-sarah', 'Sarah', 'Донька · 07700 900333'], ['pick-dave', 'Dave', 'Друг']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: 'Тепер оберіть, хто отримає SMS з вашим місцеперебуванням. <strong>Торкніться «Налаштувати контакти для екстрених випадків».</strong>'},
        {screen: () => list(p, 'Екстрений виклик — SOS', [{label: 'Виклик п\'ятиразовим натисканням', toggle: true}], {back: 'Налаштування', overlay: sheet('Додати контакт для екстрених випадків', [['pick-sarah', 'Sarah', 'Донька · 07700 900333'], ['pick-dave', 'Dave', 'Друг']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>Торкніться Sarah</strong>, вашої доньки.', hints: {'pick-dave': 'Для цієї практики оберіть Sarah.'}},
        {screen: () => list(p, 'Екстрений виклик — SOS', [{label: 'Виклик п\'ятиразовим натисканням', toggle: true}, {caption: 'КОНТАКТИ ДЛЯ ЕКСТРЕНИХ ВИПАДКІВ'}, {label: 'Sarah', sub: 'Донька'}], {back: 'Налаштування'}),
         question: {q: 'Ви впали й не можете нормально дістатися до екрана телефона. Що ви зробите?', options: [
            {t: 'Швидко натиснути бічну кнопку 5 разів', ok: true, why: 'Так. Починається зворотний відлік, а потім телефон набирає 999 і надсилає Sarah SMS про те, де ви.'},
            {t: 'Розблокувати телефон і знайти застосунок «Телефон»', why: 'Це повільно в екстреній ситуації. П\'ять натискань бічної кнопки працюють навіть на заблокованому телефоні.'}]}},
        {screen: () => list(p, 'Екстрений виклик — SOS', [{label: 'Виклик п\'ятиразовим натисканням', toggle: true}, {caption: 'КОНТАКТИ ДЛЯ ЕКСТРЕНИХ ВИПАДКІВ'}, {label: 'Sarah', sub: 'Донька'}], {back: 'Налаштування'}), done: true,
         say: '<strong>Чудово!</strong> «Екстрений виклик — SOS» готовий, і Sarah буде повідомлено, де ви. Якщо натиснете помилково, просто торкніться «Стоп» під час зворотного відліку.'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>Екстрений виклик — SOS</strong> телефонує за вас на 999 і надсилає ваше місцеперебування в SMS людям, яких ви оберете. Перевіримо, чи він готовий. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Торкніться «Безпека та екстрені ситуації».</strong> <em>На Samsung це теж «Безпека та екстрені ситуації».</em>', hint: 'Прокрутіть вниз: це ближче до кінця.'},
        {screen: () => list(p, 'Безпека та екстрені ситуації', [{id: 'medical', label: 'Медична інформація'}, {id: 'contacts-ec', label: 'Контакти для екстрених випадків'}, {id: 'sos', label: 'Екстрений виклик — SOS', sub: 'Вимк.'}, {label: 'Виявлення автокатастрофи'}]),
         target: 'sos', say: '«Екстрений виклик SOS» — <strong>Вимк.</strong> <strong>Торкніться «Екстрений виклик SOS».</strong>'},
        {screen: c => list(p, 'Екстрений виклик — SOS', [{id: 'sos-toggle', label: 'Використовувати «Екстрений виклик SOS»', toggle: !!c.sosOn, sub: 'Натисніть кнопку живлення 5 або більше разів, щоб запустити екстрені дії.'}, {label: 'Ділитися інформацією з контактами для екстрених випадків', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>Торкніться «Використовувати Екстрений виклик SOS»</strong>, щоб увімкнути.'},
        {screen: () => list(p, 'Безпека та екстрені ситуації', [{id: 'medical', label: 'Медична інформація'}, {id: 'contacts-ec', label: 'Контакти для екстрених випадків', sub: 'Немає'}, {label: 'Екстрений виклик — SOS', sub: 'Увімк.'}]),
         target: 'contacts-ec', say: 'Тепер оберіть, хто отримає SMS з вашим місцеперебуванням. <strong>Торкніться «Контакти для екстрених випадків».</strong>'},
        {screen: c => list(p, 'Контакти для екстрених випадків', [{id: 'add', label: '＋ Додати контакт'}], {overlay: c.pick ? sheet('Виберіть контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>Торкніться «Додати контакт».</strong>'},
        {screen: () => list(p, 'Контакти для екстрених випадків', [{label: '＋ Додати контакт'}], {overlay: sheet('Виберіть контакт', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>Торкніться Sarah</strong>, вашої доньки.', hints: {'pick-dave': 'Для цієї практики оберіть Sarah.'}},
        {screen: () => list(p, 'Контакти для екстрених випадків', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ Додати контакт'}]),
         question: {q: 'Ви впали й не можете нормально дістатися до екрана телефона. Що ви зробите?', options: [
            {t: 'Швидко натиснути кнопку живлення 5 разів', ok: true, why: 'Так. Починається зворотний відлік, а потім телефон набирає 999 і повідомляє Sarah, де ви.'},
            {t: 'Розблокувати телефон і знайти застосунок «Телефон»', why: 'Це повільно в екстреній ситуації. П\'ять натискань кнопки живлення працюють навіть на заблокованому телефоні.'}]}},
        {screen: () => list(p, 'Контакти для екстрених випадків', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>Чудово!</strong> «Екстрений виклик SOS» увімкнено, і Sarah буде повідомлено, де ви. Якщо натиснете помилково, торкніться «Скасувати» під час зворотного відліку.'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Екстрені сповіщення попереджають про небезпеку поблизу, як-от сильну повінь. На цьому телефоні хтось вимкнув одне з них. Виправмо це. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Торкніться «Сповіщення».</strong>'},
            {screen: c => list(p, 'Сповіщення', [{label: 'Показувати мініатюри', value: 'Завжди'}, {caption: 'СТИЛЬ СПОВІЩЕНЬ'}, {label: 'Повідомлення', sub: 'Банери, звуки, значки'}, {label: 'WhatsApp', sub: 'Банери, звуки, значки'},
                {caption: 'ДЕРЖАВНІ СПОВІЩЕННЯ'}, {label: 'Надзвичайні сповіщення', toggle: true}, {id: 'severe', label: 'Серйозні сповіщення', toggle: !!c.severe}, {label: 'Тестові сповіщення', toggle: false}], {back: 'Налаштування'}),
             target: 'severe', action: c => { c.severe = true; }, say: 'Державні сповіщення — в самому низу. <strong>Серйозні сповіщення</strong> вимкнено. <strong>Торкніться, щоб увімкнути.</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>Торкніться «Безпека та екстрені ситуації».</strong>', hint: 'Це ближче до кінця списку.'},
            {screen: () => list(p, 'Безпека та екстрені ситуації', [{label: 'Медична інформація'}, {label: 'Екстрений виклик — SOS'}, {id: 'wea', label: 'Бездротові екстрені сповіщення'}, {label: 'Сповіщення про невідомі трекери'}]),
             target: 'wea', say: '<strong>Торкніться «Бездротові екстрені сповіщення».</strong> <em>На деяких телефонах це називається «Екстрені сповіщення».</em>'},
            {screen: c => list(p, 'Бездротові екстрені сповіщення', [{label: 'Дозволити сповіщення', toggle: true}, {label: 'Надзвичайні загрози', toggle: true}, {id: 'severe', label: 'Серйозні загрози', toggle: !!c.severe}, {label: 'Тестові сповіщення', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>Серйозні загрози</strong> вимкнено. <strong>Торкніться, щоб увімкнути.</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ Екстрене сповіщення: серйозне</strong><p>Очікується сильна повінь поблизу набережної. Перейдіть на вищу місцевість. Докладніше на gov.uk/alerts</p><button type="button" data-tap="ok">OK</button></div>`,
         target: 'ok', say: 'Ось як виглядає сповіщення. Воно подає гучний сигнал сирени близько 10 секунд, навіть у беззвучному режимі. <strong>Торкніться «OK».</strong> <em>(Лише для практики.)</em>'},
        {screen: () => home(p), question: {q: 'Сповіщення надходить, коли ви за кермом. Що робити?', options: [
            {t: 'Зупинитися в безпечному місці й тільки тоді прочитати', ok: true, why: 'Так. Ніколи не читайте телефон за кермом. Безпечно зупиніться, а потім читайте.'},
            {t: 'Прочитати одразу, не припиняючи їхати', why: 'Ніколи не читайте телефон за кермом. Спершу знайдіть безпечне місце, щоб зупинитися.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> Тепер телефон попереджатиме вас про серйозну небезпеку поблизу. Справжні сповіщення ніколи не просять особистих даних чи грошей: якщо просять, це шахрайство.'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Три речі, які роблять украдений телефон набагато менш корисним для злодія. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>Торкніться «Face ID і код допуску».</strong> <em>На справжньому iPhone далі ви введете код допуску.</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: 'Прокрутіть вниз і <strong>торкніться «Захист украденого пристрою»</strong>.'},
            {screen: c => list(p, 'Захист украденого пристрою', [{id: 'sdp', label: 'Захист украденого пристрою', toggle: !!c.sdp, sub: 'Поза домом для зміни коду допуску чи Apple Account потрібен Face ID і 1 година очікування.'}], {back: 'Face ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: 'Це не дає злодієві, який підгледів ваш код, заблокувати вас. <strong>Увімкніть його.</strong>'},
            {screen: () => list(p, 'Захист украденого пристрою', [{label: 'Захист украденого пристрою', toggle: true}], {back: 'Face ID'}), target: 'back',
             say: 'Далі приховаймо повідомлення на екрані блокування. <strong>Торкніться ‹ Face ID</strong>, щоб повернутися.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Торкніться «Сповіщення».</strong>'},
            {screen: c => list(p, 'Сповіщення', [{id: 'previews', label: 'Показувати мініатюри', value: c.previews || 'Завжди'}, {label: 'Спільний доступ до екрана', value: 'Сповіщення вимкнено'}], {back: 'Налаштування',
                overlay: c.pickPrev ? sheet('Показувати мініатюри', [['prev-always', 'Завжди'], ['prev-unlocked', 'Коли розблоковано', 'Рекомендовано'], ['prev-never', 'Ніколи']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Зараз будь-хто може прочитати ваші повідомлення, зокрема коди безпеки, не розблоковуючи телефон. <strong>Торкніться «Показувати мініатюри».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>Торкніться «Google».</strong>', hint: 'Це ближче до кінця списку.'},
            {screen: () => list(p, 'Google', [{label: 'Керувати обліковим записом Google'}, {id: 'all-services', label: 'Усі служби'}, {label: 'Резервна копія'}]), target: 'all-services', say: '<strong>Торкніться «Усі служби».</strong>'},
            {screen: () => list(p, 'Усі служби', [{caption: 'Особиста безпека та безпека пристрою'}, {id: 'theft', label: 'Захист від крадіжки'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>Торкніться «Захист від крадіжки».</strong>'},
            {screen: c => list(p, 'Захист від крадіжки', [{id: 'tdl', label: 'Блокування при виявленні крадіжки', toggle: !!c.tdl, sub: 'Блокує екран, якщо відчуває, що хтось вихопив телефон і тікає.'}, {label: 'Блокування пристрою без мережі', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>Увімкніть «Блокування при виявленні крадіжки».</strong> Якщо хтось вихопить телефон і втече, він заблокується сам.'},
            {screen: c => settingsList(p, c), target: 'notifications', say: 'Далі приховаймо повідомлення на екрані блокування. Повернувшись у Налаштування, <strong>торкніться «Сповіщення»</strong>.'},
            {screen: c => list(p, 'Сповіщення', [{id: 'previews', label: 'Сповіщення на екрані блокування', sub: c.previews || 'Показувати весь вміст'}, {label: 'Історія сповіщень'}], {
                overlay: c.pickPrev ? sheet('Сповіщення на екрані блокування', [['prev-always', 'Показувати весь вміст'], ['prev-unlocked', 'Приховувати конфіденційний вміст', 'Рекомендовано'], ['prev-never', 'Не показувати жодних сповіщень']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: 'Зараз будь-хто може прочитати ваші повідомлення, зокрема коди безпеки, не розблоковуючи телефон. <strong>Торкніться «Сповіщення на екрані блокування».</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, 'Сповіщення', [{label: 'Показувати мініатюри', value: 'Завжди'}], {back: 'Налаштування', overlay: sheet('Показувати мініатюри', [['prev-always', 'Завжди'], ['prev-unlocked', 'Коли розблоковано', 'Рекомендовано'], ['prev-never', 'Ніколи']])})
                : list(p, 'Сповіщення', [{label: 'Сповіщення на екрані блокування', sub: 'Показувати весь вміст'}], {overlay: sheet('Сповіщення на екрані блокування', [['prev-always', 'Показувати весь вміст'], ['prev-unlocked', 'Приховувати конфіденційний вміст', 'Рекомендовано'], ['prev-never', 'Не показувати жодних сповіщень']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? 'Коли розблоковано' : 'Приховувати конфіденційний вміст'}.</strong>`, hints: {'prev-always': 'Так було раніше. Оберіть рекомендований варіант.', 'prev-never': 'Це приховує їх повністю, що може дратувати. Оберіть рекомендований варіант.'}},
        {screen: () => home(p), target: 'phone', say: 'Нарешті знайдіть номер IMEI вашого телефона. Він потрібен вашому оператору, щоб заблокувати украдений телефон. <strong>Відкрийте застосунок «Телефон».</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: 'На клавіатурі <strong>наберіть *#06#</strong> (зірочка, решітка, нуль, шість, решітка).', hint: 'Почніть із клавіші із зірочкою *, унизу ліворуч.'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, 'Інформація про пристрій', 'IMEI: 35 209900 176148 1 (навчальний номер)', [['ok', 'OK']])}),
         target: 'ok', say: 'Цей довгий номер — ваш <strong>IMEI</strong>. На справжньому телефоні запишіть його в надійному місці (не на самому телефоні!). <strong>Торкніться «OK».</strong>'},
        {screen: () => home(p), question: {q: 'У вас вихопили телефон. Кому телефонувати першому?', options: [
            {t: 'У банк, з чужого телефона', ok: true, why: 'Так. Злодії першими беруться за банківські застосунки. Потім заблокуйте телефон онлайн, зателефонуйте оператору й повідомте про це на 101.'},
            {t: 'Зачекати й подивитися, чи знайдеться', why: 'Важлива швидкість. Негайно зателефонуйте до банку, потім заблокуйте телефон і зателефонуйте оператору.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> Тепер вашим телефоном злодієві набагато важче скористатися, і ви знаєте, де знайти свій IMEI.'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? 'ЛОКАТОР' : 'ПОПЕРЕДЖЕННЯ ПРО ТРЕКЕР', title: p === 'ios' ? 'AirTag пересувається разом із вами' : 'Невідомий трекер їде разом із вами',
            text: '<br>Місцеперебування цього предмета може бачити його власник.'}),
         target: 'alert', say: 'Телефон помітив трекер, який не ваш і пересувається разом із вами. Не панікуйте: часто це помилково чийсь родич. <strong>Торкніться сповіщення.</strong>'},
        {screen: c => app(p, p === 'ios' ? 'Невідомий AirTag' : 'Невідомий трекер', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">Рухається з вами від <strong>10:12</strong> сьогодні, у 4 місцях.</p>
            <button type="button" class="ce co" data-tap="play">Відтворити звук</button>
            <button type="button" class="cp" data-tap="learn">Докладніше про: ${p === 'ios' ? 'AirTag' : 'Трекер'}</button>
            <button type="button" class="cp" data-tap="disable">Інструкції з вимкнення</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: 'Карта показує, де він був із вами. <strong>Торкніться «Відтворити звук»</strong>, щоб його знайти.'},
        {screen: () => app(p, p === 'ios' ? 'Невідомий AirTag' : 'Невідомий трекер', '<p class="cf">⟦volume-2⟧ <strong>Відтворення звуку…</strong><br>Прислухайтеся до цвірінькання.</p>', {color: '#fff'}),
         question: {q: 'Ви чуєте тихе цвірінькання. Де шукати?', options: [
            {t: 'У сумках, кишенях пальта, машині та в усьому, що вам позичали', ok: true, why: 'Так. Трекери маленькі, завбільшки з велику монету, і їх часто ховають у підкладці, кишенях чи авто.'},
            {t: 'Ніде, просто проігнорувати', why: 'Його варто знайти. Перевірте сумки, кишені й машину: можливо, це просто чийсь родич.'}]}},
        {screen: c => app(p, 'Трекер знайдено', `<p class="cf">Піднесіть верхню частину телефона до трекера, щоб дізнатися про нього більше.</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">Піднесіть до трекера</button>`, {color: '#fff'}),
         target: 'scan', say: 'Ви знайшли його в підкладці пальта. <strong>Торкніться «Піднесіть до трекера»</strong>, щоб побачити, кому він належить.'},
        {screen: () => app(p, 'Про цей трекер', '<p class="cf"><strong>Не в режимі втрати</strong><br>Серійний номер: P4R7-ACT1CE<br>Дані власника передаються лише поліції.</p>', {color: '#fff'}),
         question: {q: 'Це не родича, і ви переживаєте, що хтось підклав його, щоб стежити за вами. Що ви зробите?', options: [
            {t: 'Зберегти його й віднести до поліції (або зателефонувати на 999, якщо ви в небезпеці)', ok: true, why: 'Так. Не викидайте його: поліція може відстежити власника. Національна лінія допомоги жертвам переслідування (National Stalking Helpline): 0808 802 0300.'},
            {t: 'Викинути в смітник', why: 'Це може бути доказом, і поліція може відстежити власника. Збережіть його й віднесіть їм або зателефонуйте на 999, якщо ви в небезпеці.'}]}},
        {screen: () => app(p, 'Про цей трекер', '<p class="cf">Допомога: National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline (цілодобово) 0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>Чудово!</strong> Ви знаєте, як знайти трекер і що робити. ' + (p === 'android' ? 'Перевірте, що сповіщення ввімкнено, в <strong>Налаштування > Безпека та екстрені ситуації > Сповіщення про невідомі трекери</strong>.' : 'iPhone перевіряють наявність трекерів автоматично.')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: 'Ви на стежці над урвищем, і хтось упав. Адреси немає. Коли ви телефонуєте на 999, більшість телефонів автоматично надсилають ваше місцеперебування, але три слова теж допоможуть. <strong>Відкрийте what3words.</strong> <em>(Навчальна версія.)</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: 'Синя крапка — це ви. Кожен квадрат 3 на 3 метри має власні три слова. Ваші — <strong>puffin.chalk.lantern</strong>. Зачекайте мить, поки крапка заспокоїться, а потім <strong>торкніться «У мене є мої 3 слова»</strong>.'},
        {screen: () => home(p), target: 'phone', say: 'Тепер телефонуйте на 999. <strong>Відкрийте застосунок «Телефон».</strong> <em>(Лише для практики: ніколи не телефонуйте на 999 заради перевірки.)</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>Наберіть 999.</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>Торкніться зеленої кнопки виклику.</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>Екстрений виклик · 0:08</small></div>
            <p class="hi">«Екстрена служба, яка саме? … Швидка допомога. Де саме сталася надзвичайна ситуація?»</p>${homeIndicator(p)}</div>`,
         question: {q: 'Оператор питає, де ви. Що ви скажете?', options: [
            {t: '«Я на стежці над урвищем. Моя адреса what3words: puffin, chalk, lantern.»', ok: true, why: 'Так. Скажіть, де ви, своїми словами, а потім назвіть три слова. Якщо попросять, назвіть їх по літерах.'},
            {t: '«Не знаю, десь біля моря»', why: 'Вони спробують вас знайти, але три слова визначають місце з точністю до 3 метрів. Прочитайте їх із застосунку.'}]}},
        {screen: () => home(p), question: {q: 'Друг глухий і не може телефонувати голосом. Як йому зв\'язатися з 999?', options: [
            {t: 'Зареєструватися для екстреного SMS (надіслати «register» на 999) заздалегідь або скористатися застосунком 999 BSL', ok: true, why: 'Так. Екстрене SMS працює лише після реєстрації. Застосунок 999 BSL з\'єднує із перекладачем жестової мови.'},
            {t: 'Ніяк', why: 'Може. Зареєструйтеся для екстреного SMS, надіславши «register» на 999, або скористайтеся безкоштовним застосунком 999 BSL.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> Пам\'ятайте: скажіть, де ви, а потім назвіть свої три слова. Застосунок what3words знаходить ваші слова без сигналу, але щоб зателефонувати, сигнал потрібен.'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>Не відповідає</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: 'Телефон завис: дотики нічого не дають, і він не вимикається звичайним способом. Це велика проблема?', options: [
            {t: 'Зазвичай ні. «Примусовий перезапуск» це виправляє, і нічого не втрачається', ok: true, why: 'Правильно. Примусовий перезапуск — це як вимкнути з розетки. Ваші фото й повідомлення в безпеці.'},
            {t: 'Так, він зламаний', why: 'Зазвичай ні! Примусовий перезапуск виправляє більшість завислих телефонів, і нічого не втрачається.'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? 'На iPhone: <strong>натисніть і відпустіть збільшення гучності</strong>, потім <strong>натисніть і відпустіть зменшення гучності</strong>, потім <strong>натисніть і утримуйте бічну кнопку</strong>, доки не з\'явиться логотип Apple (близько 10 секунд). Тут торкніться їх у такому порядку.'
            : 'На більшості телефонів Android: <strong>одночасно утримуйте кнопку живлення й зменшення гучності</strong> близько 10 секунд, доки він не перезапуститься. Тут торкніться живлення, потім зменшення гучності. <em>(Google Pixel: утримуйте лише кнопку живлення 30 секунд.)</em>',
         hints: {'vol-down': p === 'ios' ? 'Спершу збільшення гучності.' : 'Почніть із кнопки живлення.', side: 'Бічна кнопка остання, після обох кнопок гучності.'},
         hint: p === 'ios' ? 'Збільшення гучності, потім зменшення гучності, потім бічна кнопка.' : 'Живлення, потім зменшення гучності.'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: 'З\'явився логотип. Що тепер?', options: [
            {t: 'Відпустити й зачекати, поки телефон запуститься', ok: true, why: 'Так. Це займає хвилину. Можливо, доведеться один раз ввести код-пароль.'},
            {t: 'Продовжувати натискати всі кнопки', why: 'Відпустіть, щойно з\'явиться логотип, і дайте телефону хвилину на запуск.'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>Чудово!</strong> Ваш телефон перезапустився. Якщо він і далі зависає, перевірте оновлення та звільніть місце. Перезапуск телефона раз на тиждень допомагає йому працювати плавно.'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? 'Увімк.' : 'Вимк.'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? 'Вимк.' : (ctx.signal ? 'Увімк. · 4G' : 'Немає зв\'язку')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? 'Вимк.' : 'Головна'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? 'Проведіть угору, щоб закрити' : 'Закрити'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">Немає зв\'язку</span>'), target: 'pull-down',
         say: 'Телефон показує <strong>«Немає зв\'язку»</strong>, хоча вранці все працювало. Швидкий спосіб виправити — увімкнути й вимкнути авіарежим, і він знову підключиться. ' + (p === 'ios' ? '<strong>Проведіть пальцем вниз від правого верхнього кута</strong> (або торкніться смужки).' : '<strong>Проведіть пальцем вниз від верхнього краю</strong> (або торкніться смужки).')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>Торкніться «Авіарежим»</strong>, щоб увімкнути. Усе бездротове вимикається.'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: 'Зачекайте близько 10 секунд… а потім <strong>знову торкніться «Авіарежим»</strong>, щоб вимкнути.'},
        {screen: c => quickPanel(p, c), question: {q: 'Мобільний інтернет знову працює через 4G. Коли ще авіарежим стане в пригоді?', options: [
            {t: 'У літаку або за кордоном, щоб уникнути плати за роумінг (Wi-Fi можна ввімкнути)', ok: true, why: 'Так. Wi-Fi можна знову ввімкнути, поки діє авіарежим, щоб користуватися Wi-Fi в готелі чи на кораблі.'},
            {t: 'Щоб зарядити телефон', why: 'Він заряджається трохи швидше, але авіарежим здебільшого для польотів і уникнення плати за роумінг за кордоном.'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>Чудово!</strong> Якщо авіарежим не допоміг, перезапустіть телефон. Усе ще немає зв\'язку? Перевірте на сайті свого оператора, чи немає проблем у вашому районі.'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · зараз</strong><span>🎁 Ваші БЕЗКОШТОВНІ життя чекають! Повертайтеся й грайте! 🎉</span></button>',
         target: 'settings', say: 'Гра постійно дзижчить безглуздими повідомленнями. Сповіщення можна вимкнути для будь-якого застосунку. <strong>Торкніться «Налаштування»</strong>, а не повідомлення.', hints: {notif: 'Це відкриває гру. Натомість торкніться «Налаштування».'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>Торкніться «Сповіщення».</strong>'},
        {screen: () => p === 'ios'
            ? list(p, 'Сповіщення', [{label: 'Показувати мініатюри', value: 'Коли розблоковано'}, {caption: 'СТИЛЬ СПОВІЩЕНЬ'}, {id: 'bubble', label: 'Bubble Pop', sub: 'Банери, звуки, значки'}, {label: 'Повідомлення', sub: 'Банери, звуки, значки'}, {label: 'WhatsApp', sub: 'Банери, звуки, значки'}], {back: 'Налаштування'})
            : list(p, 'Сповіщення', [{id: 'app-notifs', label: 'Сповіщення додатків'}, {id: 'history', label: 'Історія сповіщень'}, {label: 'Сповіщення на екрані блокування'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>Торкніться «Bubble Pop».</strong>' : '<strong>Торкніться «Сповіщення додатків».</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, 'Сповіщення додатків', [{label: 'Повідомлення', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>Торкніться перемикача біля «Bubble Pop»</strong>, щоб вимкнути його сповіщення.', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: 'Дозволити сповіщення', toggle: !c.off}], {back: 'Сповіщення'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>Вимкніть «Дозволити сповіщення».</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, 'Сповіщення', [{label: 'Сповіщення додатків'}, {id: 'history', label: 'Історія сповіщень', sub: 'Вимк.'}]), target: 'history',
             say: 'Корисне доповнення: якщо ви колись помилково змахнули повідомлення, «Історія сповіщень» зберігає його копію. <strong>Торкніться «Історія сповіщень».</strong>'},
            {screen: c => list(p, 'Історія сповіщень', [{id: 'hist-toggle', label: 'Використовувати історію сповіщень', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>Увімкніть.</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: 'Сповіщення яких застосунків варто залишити ввімкненими?', options: [
            {t: 'Повідомлень, дзвінків, WhatsApp, банку і всього, про що ви хочете знати одразу', ok: true, why: 'Так. Залиште важливі, а ігри, магазини й усе, що лише набридає, вимкніть.'},
            {t: 'Вимкнути всі', why: 'Ви пропускали б повідомлення й дзвінки! Залиште важливі, а ігри й магазини вимкніть.'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>Чудово!</strong> Bubble Pop більше вас не турбуватиме. ' + (p === 'ios' ? 'Якщо ви помилково змахнули повідомлення, проведіть пальцем угору від середини екрана блокування, щоб побачити попередні.' : 'А історія сповіщень зберігає копію всього, що ви змахнули.')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>Побачимося в садовому центрі Дурнінгтон x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">Текстове повідомлення</span></div>${homeIndicator(p)}</div>`,
         question: {q: 'Ви набрали «Dunnington garden centre», а телефон це змінив. Чому?', options: [
            {t: 'Автокорекція вгадала не те слово', ok: true, why: 'Так. Автокорекція замінює слова, яких не знає. Її можна вимкнути або навчити новим словам.'},
            {t: 'Телефон зламався', why: 'Це просто автокорекція вгадує. Її можна вимкнути або навчити словам.'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>Торкніться «Налаштування».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>Торкніться «Загальні».</strong>'},
            {screen: () => list(p, 'Загальні', [{label: 'Про пристрій'}, {label: 'Оновлення ПЗ'}, {id: 'keyboard', label: 'Клавіатура'}, {label: 'Мова та регіон'}], {back: 'Налаштування'}), target: 'keyboard', say: '<strong>Торкніться «Клавіатура».</strong>'},
            {screen: c => list(p, 'Клавіатури', [{id: 'replace', label: 'Заміна тексту'}, {caption: 'УСІ КЛАВІАТУРИ'}, {label: 'Автоматичні великі літери', toggle: true}, {id: 'ac', label: 'Автокорекція', toggle: !c.acOff}, {label: 'Прогнозування тексту', toggle: true}], {back: 'Загальні'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Вимкніть «Автокорекція».</strong> Орфографічні помилки все одно підкреслюються червоним, тож ви можете виправити їх самі.'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>Торкніться «Система».</strong> Це внизу.'},
            {screen: () => list(p, 'Система', [{id: 'keyboard', label: 'Клавіатура'}, {label: 'Мови'}, {label: 'Дата й час'}]), target: 'keyboard', say: '<strong>Торкніться «Клавіатура».</strong>'},
            {screen: () => list(p, 'Клавіатура', [{id: 'gboard', label: 'Gboard', sub: 'Екранна клавіатура'}]), target: 'gboard', say: '<strong>Торкніться «Gboard».</strong> <em>На Samsung це Клавіатура Samsung > Розумне введення.</em>'},
            {screen: () => list(p, 'Gboard', [{label: 'Параметри'}, {id: 'correction', label: 'Виправлення тексту'}, {label: 'Введення проведенням'}]), target: 'correction', say: '<strong>Торкніться «Виправлення тексту».</strong>'},
            {screen: c => list(p, 'Виправлення тексту', [{label: 'Показувати рядок підказок', toggle: true}, {id: 'ac', label: 'Автовиправлення', toggle: !c.acOff}, {label: 'Перевірка правопису', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>Вимкніть «Автовиправлення».</strong> Орфографічні помилки все одно підкреслюються червоним, тож ви можете виправити їх самі.'},
        ]),
        {screen: () => home(p), question: {q: 'Ви б хотіли залишити автокорекцію, але вона постійно змінює «Dunnington». Що ще можна зробити?', options: [
            {t: 'Додати слово до словника телефона, щоб він його вивчив', ok: true, why: 'Yes. ' + (p === 'ios' ? 'Скористатися «Заміною тексту» в тих самих налаштуваннях клавіатури.' : 'Торкніться слова в рядку підказок і виберіть додавання до словника.')},
            {t: 'Нічого, просто миритися', why: 'Його можна навчити: ' + (p === 'ios' ? 'додайте слово в «Клавіатура» > «Заміна тексту».' : 'торкніться слова в підказках і додайте його до словника.')}]}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> Більше жодних несподіваних замін слів. Увімкнути її знову можна будь-коли в тому самому місці.'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: 'У вас нові бездротові навушники. Що робити спершу?', options: [
            {t: 'Перевести їх у «режим створення пари» (зазвичай утримувати кнопку, доки не замигає індикатор)', ok: true, why: 'Так. Режим створення пари дає телефону змогу їх знайти. Інструкція в коробці описує, як саме.'},
            {t: 'Підключити їх до телефона кабелем', why: 'Бездротові навушники підключаються через Bluetooth. Спершу переведіть їх у режим створення пари, зазвичай утримуючи кнопку, доки не замигає індикатор.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Індикатор на навушниках блимає. <strong>Торкніться «Налаштування».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>Торкніться «Bluetooth».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>Торкніться «Підключені пристрої».</strong>'},
            {screen: () => list(p, 'Підключені пристрої', [{id: 'pair', label: '＋ Підключити новий пристрій'}, {label: 'Збережені пристрої', sub: 'Авто'}]), target: 'pair', say: '<strong>Торкніться «Підключити новий пристрій».</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? 'Bluetooth' : 'Підключити новий пристрій', [{label: 'Bluetooth', toggle: true}, {caption: p === 'ios' ? 'МОЇ ПРИСТРОЇ' : 'Збережені'}, {label: 'Авто', sub: 'Не підключено'},
            {caption: p === 'ios' ? 'ІНШІ ПРИСТРОЇ' : 'Доступні пристрої'}, {id: 'headphones', label: '⟦headphones⟧ Навчальні навушники'}, {label: 'Телевізор сусіда'}], {back: 'Налаштування'}),
         target: 'headphones', say: 'Телефон шукає пристрої поблизу. <strong>Торкніться «Навчальні навушники».</strong>', hints: {}},
        {screen: () => list(p, 'Bluetooth', [{label: 'Bluetooth', toggle: true}, {caption: 'МОЇ ПРИСТРОЇ'}, {label: '⟦headphones⟧ Навчальні навушники', sub: 'Підключено ⟦check⟧'}, {label: 'Авто', sub: 'Не підключено'}], {back: 'Налаштування'}),
         question: {q: 'Чи треба це робити знову, коли ви наступного разу ввімкнете навушники?', options: [
            {t: 'Ні, відтепер вони підключаються самі', ok: true, why: 'Ні. Пару створюють лише раз. Після цього вони підключаються автоматично, коли ввімкнені й поруч.'},
            {t: 'Так, щоразу', why: 'Пару створюють лише раз. Після цього вони підключаються самі.'}]}},
        {screen: () => list(p, 'Bluetooth', [{label: '⟦headphones⟧ Навчальні навушники', sub: 'Підключено ⟦check⟧'}], {back: 'Налаштування'}), done: true,
         say: '<strong>Чудово!</strong> Ті самі кроки підходять для автомобіля, колонки чи слухових апаратів. Якщо щось не підключається, вимкніть і ввімкніть Bluetooth та знову переведіть пристрій у режим створення пари.'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">«${ctx.said || 'Бабусю? Це я, Tom! Я загубив телефон і маю проблеми. Мені потрібні £400 на штраф, сьогодні. Будь ласка, не кажи мамі!'}»</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">Попросити сімейну кодову фразу</button><button type="button" data-tap="send-money">Сказати, що надішлете гроші</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: 'Телефонує невідомий номер. <strong>Дайте відповідь</strong>, щоб потренуватися, що робити.', hints: {decline: 'У реальному житті відхилити дзвінок цілком нормально! Для цієї практики торкніться «Відповісти».'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = 'Е-е… що? Бабусю, на це немає часу! Будь ласка, гроші потрібні зараз!'; },
         say: 'Звучить точно як ваш онук Tom. Але шахраї вміють копіювати голоси. Ваша родина домовилася про <strong>кодову фразу</strong>. <strong>Попросіть її назвати.</strong>',
         hints: {'send-money': 'Ніколи не погоджуйтеся надсилати гроші під час такого дзвінка. Попросіть кодову фразу.', end: 'Покласти слухавку теж нормально! Але спершу потренуйтеся просити кодову фразу.'}},
        {screen: c => scamCall(p, c), target: 'end', say: 'Вони її не знають і тиснуть ще сильніше. Це шахрай. <strong>Киньте слухавку</strong> червоною кнопкою.', hints: {'send-money': 'Не треба! Вони не знали фрази. Киньте слухавку.', 'ask-phrase': 'Ви попросили, а вони не змогли відповісти. Киньте слухавку.'}},
        {screen: () => home(p), question: {q: 'Ви все ще трохи переймаєтеся за Tom. Що ви зробите?', options: [
            {t: 'Зателефонувати Tom (або його мамі) на номер, який у вас уже є', ok: true, why: 'Так. Завжди передзвонюйте на номер, який знаєте. Справжній Tom буде в порядку й не заперечуватиме проти перевірки.'},
            {t: 'Передзвонити на номер, з якого вам телефонували', why: 'Так ви знову додзвонитеся шахраю. Зателефонуйте Tom на номер, який у вас уже є.'}]}},
        {screen: () => home(p), target: 'phone', say: 'Якщо дзвінок стосується вашого банківського рахунку, можна зателефонувати на <strong>159</strong>, щоб безпечно зв\'язатися з власним банком. <strong>Відкрийте застосунок «Телефон»</strong>, щоб потренуватися.'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>Наберіть 159.</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>Торкніться зеленої кнопки виклику.</strong> <em>(Лише для практики: нічого не набирається.)</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">«Вітаємо в 159. Назвіть свій банк, і ми вас з'єднаємо.»</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Чудово!</strong> 159 з\'єднує вас із вашим справжнім банком. Домовтеся про кодову фразу з родиною віч-на-віч і ніколи не публікуйте її в інтернеті.'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Привіт' : 'Вітаємо'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? 'Проведіть угору, щоб відкрити' : 'Почати'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `Ваш новий телефон розпаковано й увімкнено. Тримайте <strong>старий телефон</strong> поруч, зарядженим і підключеним до Wi-Fi. <strong>Торкніться ${p === 'ios' ? 'Проведіть угору, щоб відкрити' : 'Почати'}.</strong>`},
        {screen: () => list(p, p === 'ios' ? 'Швидкий старт' : 'Копіювання програм і даних', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? 'Піднесіть старий iPhone до цього, щоб налаштувати його через ваш Apple Account.' : 'Скопіюйте програми, фото, контакти й інше зі старого телефона.'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? 'Продовжте на старому iPhone' : 'Використати старий пристрій'}</button>
            <button type="button" class="cp" data-tap="manual">Налаштувати вручну</button>`}),
         target: 'use-old', say: 'Копіювання зі старого телефона економить час на повторне налаштування всього. <strong>Торкніться ' + (p === 'ios' ? 'Продовжте на старому iPhone' : 'Використати старий пристрій') + '.</strong>', hints: {manual: 'Можна й так, але копіювання набагато простіше. Торкніться іншої кнопки.'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">На вашому <strong>старому</strong> телефоні з'являється повідомлення. Наведіть його камеру на цей візерунок.</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">Старий телефон відсканував</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: 'На старому телефоні торкніться «Продовжити», а потім піднесіть його до цього візерунка, щоб камера його побачила. Тут <strong>торкніться «Старий телефон відсканував»</strong>.'},
        {screen: c => codeScreen(p, c, 'Введіть код допуску старого телефона', 'Так безпечно копіюються ваші налаштування.'), sequence: CODE_KEYS,
         say: `Введіть код допуску старого телефона. Для практики використайте <strong>${codeText}</strong>.`, hint: `Введіть навчальний код ${codeText}.`},
        {screen: () => list(p, 'Перенесення даних', [], {noBack: true, top: `<p class="cf">Оберіть, що перенести:</p>
            <div class="cj ex"><span>Фото й відео</span>${tog(true)}</div><div class="cj ex"><span>Контакти й повідомлення</span>${tog(true)}</div><div class="cj ex"><span>Програми</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">Продовжити</button>`}),
         target: 'transfer', say: 'Усе позначено. <strong>Торкніться «Продовжити».</strong> Тримайте обидва телефони поруч і підключеними до зарядки.'},
        {screen: c => list(p, 'Перенесення…', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? 'Залишилося приблизно 25 хвилин' : 'Перенесення завершено ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: 'Перенесення завершено. Що робити зі старим телефоном?', options: [
            {t: 'Залишити його на тиждень, щоб переконатися, що нічого не пропало, а потім належно стерти перед продажем чи утилізацією', ok: true, why: 'Так. Спершу перевірте, що на новому телефоні працюють фото, WhatsApp і банківські застосунки. Наступний урок показує, як стерти старий.'},
            {t: 'Одразу викинути в смітник', why: 'На ньому ще вся ваша інформація! Переконайтеся, що на новому телефоні є все, а потім належно зітріть старий.'}]}},
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> На вашому новому телефоні є ваші фото, контакти й застосунки. Деякі застосунки, як-от банківські й WhatsApp, просять увійти знову; тримайте дані напоготові.'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: 'Продаєте, віддаєте чи утилізуєте старий телефон? Робіть це в правильному порядку, інакше наступний власник не зможе ним користуватися. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: 'Крок 1: вийдіть зі свого Apple Account. <strong>Торкніться свого імені</strong>.'},
            {screen: c => list(p, 'Apple Account', [{label: 'Особисті дані'}, {label: 'Вхід і безпека'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: 'Вийти', danger: true}], {back: 'Налаштування',
                overlay: c.ask ? dialog(p, 'Вийти?', 'Для вимкнення «Локатора» потрібен ваш пароль. (Практика: введено за вас.)', [['cancel', 'Скасувати'], ['turn-off', 'Вимкнути']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: 'Прокрутіть до кінця й <strong>торкніться «Вийти»</strong>.'},
            {screen: () => list(p, 'Apple Account', [{label: 'Вийти', danger: true}], {back: 'Налаштування', overlay: dialog(p, 'Вийти?', 'Для вимкнення «Локатора» потрібен ваш пароль. (Практика: введено за вас.)', [['cancel', 'Скасувати'], ['turn-off', 'Вимкнути']])}),
             target: 'turn-off', say: 'Це вимикає <strong>«Локатор»</strong>, який інакше прив\'язав би телефон до вас. <strong>Торкніться «Вимкнути».</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: 'Крок 2: зітріть його. <strong>Торкніться «Загальні».</strong>'},
            {screen: () => list(p, 'Загальні', [{label: 'Про пристрій'}, {label: 'Сховище iPhone'}, {id: 'reset', label: 'Перенесення або скидання iPhone'}], {back: 'Налаштування'}), target: 'reset', say: '<strong>Торкніться «Перенесення або скидання iPhone»</strong> внизу.'},
            {screen: c => list(p, 'Перенесення або скидання iPhone', [{label: 'Скинути'}, {id: 'erase', label: 'Стерти вміст і параметри'}], {back: 'Загальні',
                overlay: c.askErase ? dialog(p, 'Стерти цей iPhone?', 'Усі фото, повідомлення й програми буде видалено.', [['cancel', 'Скасувати'], ['confirm-erase', 'Стерти']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Торкніться «Стерти вміст і параметри».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: 'Крок 1: видаліть свій обліковий запис Google. <strong>Торкніться «Google»</strong>. <em>(На Samsung також видаліть обліковий запис Samsung.)</em>'},
            {screen: c => list(p, 'Google', [{label: 'Керувати обліковим записом Google'}, {id: 'accounts', label: 'Облікові записи на цьому пристрої', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>Торкніться «Облікові записи на цьому пристрої».</strong>'},
            {screen: c => list(p, 'Обліковий запис Google', [{label: 'margaret.smith@example.com'}, {label: 'Синхронізація облікового запису'}, {id: 'remove', label: 'Видалити обліковий запис', danger: true}], {overlay: c.ask ? dialog(p, 'Видалити обліковий запис?', 'Це видалить із цього телефона його повідомлення, контакти й дані.', [['cancel', 'Скасувати'], ['confirm-remove', 'Видалити обліковий запис']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: 'Без цього телефон після скидання залишиться прив\'язаним до вашого облікового запису. <strong>Торкніться «Видалити обліковий запис».</strong>'},
            {screen: () => list(p, 'Обліковий запис', [{label: 'Видалити обліковий запис', danger: true}], {overlay: dialog(p, 'Видалити обліковий запис?', 'Це видалить із цього телефона його повідомлення, контакти й дані.', [['cancel', 'Скасувати'], ['confirm-remove', 'Видалити обліковий запис']])}),
             target: 'confirm-remove', say: '<strong>Торкніться «Видалити обліковий запис».</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: 'Крок 2: зітріть його. <strong>Торкніться «Система»</strong> внизу.'},
            {screen: () => list(p, 'Система', [{label: 'Мови'}, {label: 'Оновлення ПЗ'}, {id: 'reset', label: 'Параметри скидання'}]), target: 'reset', say: '<strong>Торкніться «Параметри скидання».</strong>'},
            {screen: c => list(p, 'Параметри скидання', [{label: 'Скинути Wi-Fi, мобільний зв\'язок і Bluetooth'}, {id: 'erase', label: 'Видалити всі дані (скидання до заводських налаштувань)'}], {overlay: c.askErase ? dialog(p, 'Видалити всі дані?', 'Усі фото, повідомлення й програми буде видалено.', [['cancel', 'Скасувати'], ['confirm-erase', 'Видалити всі дані']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>Торкніться «Видалити всі дані (скидання до заводських налаштувань)».</strong>'},
        ]),
        {screen: () => list(p, 'Скинути', [], {noBack: true, overlay: dialog(p, p === 'ios' ? 'Стерти цей iPhone?' : 'Видалити всі дані?', 'Усі фото, повідомлення й програми буде видалено.', [['cancel', 'Скасувати'], ['confirm-erase', p === 'ios' ? 'Стерти' : 'Видалити всі дані']])}),
         target: 'confirm-erase', say: 'Робіть це лише тоді, коли ваші фото вже безпечно на новому телефоні або в резервній копії. <strong>Торкніться ' + (p === 'ios' ? 'Стерти' : 'Видалити всі дані') + '.</strong> <em>(Практика: нічого не видаляється.)</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Привіт' : 'Вітаємо'}</h3><p class="cf">Готовий до наступного власника</p>${homeIndicator(p)}</div>`,
         question: {q: 'Ще одне перед тим, як передати його?', options: [
            {t: 'Вийняти SIM-картку (і карту пам\'яті, якщо є)', ok: true, why: 'Так. На SIM-картці ваш номер телефону. Витягніть її маленьким інструментом або скріпкою.'},
            {t: 'Більше нічого', why: 'Вийміть SIM-картку й карту пам\'яті, якщо вона є. На SIM-картці ваш номер.'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? 'Привіт' : 'Вітаємо'}</h3><p class="cf">Готовий до наступного власника</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>Чудово!</strong> Вийти з облікового запису, стерти, вийняти SIM-картку: саме в такому порядку. Екран «Привіт» означає, що він готовий для когось іншого.'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>Нагадування</strong><span>Зателефонувати Sarah</span><small>Сьогодні о 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°, пізніше опади</span><small>Макс. 14° · Мін. 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} слухає… що ви хочете сказати?`}</p>${result}
            <div class="wh">${[['say-remind', '«Нагадай мені зателефонувати Sarah о 3»'], ['say-weather', '«Яка сьогодні погода?»'], ['say-joke', '«Замов мені піцу»']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? 'Бічна кнопка (утримувати)' : 'Кнопка живлення (утримувати)'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> виконує те, про що ви просите вголос. <strong>Натисніть і утримуйте бічну кнопку</strong> (праворуч), доки не з\'явиться Siri. Також можна просто сказати «Siri» або «Hey Siri».'
                          : 'Телефон може виконувати те, про що ви просите вголос. <strong>Натисніть і утримуйте кнопку живлення</strong> (праворуч), доки не з\'явиться помічник. Також можна сказати «Hey Google».',
         hint: 'Тримайте палець (або кнопку миші) натиснутим на кнопці на правому краї.'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: 'На справжньому телефоні ви б просто сказали це. Тут <strong>торкніться «Нагадай мені зателефонувати Sarah о 3»</strong>.', hints: {'say-joke': 'Спершу спробуйте нагадування.', 'say-weather': 'Спершу спробуйте нагадування.'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: 'Готово: нагадування з\'явиться о третій годині. Тепер <strong>запитайте про погоду</strong>.', hints: {'say-remind': 'Це встановлено. Тепер запитайте про погоду.'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: 'Про що з цього можна попросити телефон?', options: [
            {t: 'Про все це: «Зателефонуй Sarah», «Постав таймер на 10 хвилин», «Увімкни ліхтарик», «Прочитай мої повідомлення»', ok: true, why: 'Так. Це зручно, коли руки зайняті, очі втомилися або набирати текст важко.'},
            {t: 'Лише про погоду', why: 'Він уміє багато: дзвінки, таймери, ліхтарик, читання повідомлень, будильники та інше.'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>Чудово!</strong> Говоріть чітко й природно, як до людини. Якщо він почує не так, просто запитайте ще раз.'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', 'Текст'], ['lens-translate', 'Перекласти'], ['lens-search', 'Пошук']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? 'Меню' : 'Carte'}</strong><span>${ctx.translated ? 'Рибний суп' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? 'Курка з грибами' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? 'Яблучний пиріг' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>Час зробити щеплення від грипу.</span><span>Щоб записатися, телефонуйте ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? 'Живий текст' : 'Google Lens'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: 'Камера вміє читати написане. Скопіюймо номер телефону з листа. <strong>Відкрийте «Камеру».</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? 'Наведіть її на лист. Коли вона помітить текст, з\'явиться маленька <strong>кнопка тексту ⟦scan-text⟧</strong>. <strong>Торкніться її.</strong>' : 'Наведіть її на лист і <strong>торкніться кнопки Lens ◎</strong>.',
         hints: {shutter: 'Це робить звичайне фото. Торкніться ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : 'кнопки Lens ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: 'Тепер написане — це справжній текст. <strong>Торкніться номера телефону.</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>Торкніться «Скопіювати»</strong>, щоб потім вставити в повідомлення чи контакти. <em>(«Подзвонити» одразу набере його.)</em>', hints: {'call-num': 'Це набрало б номер. Для цієї практики торкніться «Скопіювати».'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: 'У відпустці? Тепер камера націлена на французьке меню. ' + (p === 'ios' ? 'Це вміє застосунок «Перекладач» або Lens у застосунку Google. ' : '') + '<strong>Торкніться «Перекласти».</strong>', hints: {'lens-text': 'Це копіює французький текст. Торкніться «Перекласти».', 'lens-search': 'Торкніться «Перекласти».'}},
        {screen: c => cameraLens(p, c), question: {q: 'Що ще камера вміє робити так?', options: [
            {t: 'Розпізнавати рослини й птахів і сканувати листи у PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? 'У застосунку «Нотатки» торкніться скріпки, потім «Сканувати документи», щоб перетворити листи на PDF.' : 'У Google Диску торкніться +, потім «Сканувати», щоб перетворити листи на PDF.')},
            {t: 'Лише фотографувати', why: 'Вона вміє набагато більше: розпізнавати рослини, перекладати, копіювати текст і сканувати листи у PDF.'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>Чудово!</strong> Ви скопіювали номер і переклали меню за допомогою камери. ' + (p === 'ios' ? '«Живий текст» також працює на фото, які ви вже зробили.' : 'Google Lens також працює на фото, які ви вже зробили.')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, 'Електронні книги бібліотеки', `<p class="cf">Ви ввійшли за допомогою читацького квитка</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">Електронні книги</button><button type="button" data-tap="tab-audio" class="on">Аудіокниги</button></div>
                <div class="aeo">${[['book-1', 'Маяк у Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Літо біля моря', 'J. Marsh', '#f59e0b'], ['book-3', 'Тихий сад', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? 'Повернути протягом 21 дня' : 'Доступно 3 з 5 копій'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', 'Бібліотека', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: 'З безкоштовним читацьким квитком ви можете брати електронні книги й аудіокниги у телефоні. East Riding Libraries користуються застосунком <strong>BorrowBox</strong>. Це навчальна версія. <strong>Відкрийте її.</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: 'Ви ввійшли за допомогою читацького квитка. <strong>Торкніться «Маяк у Flamborough».</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: 'Брати безкоштовно. <strong>Торкніться «Взяти».</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: 'Вона ваша на 21 день. <strong>Торкніться «Слухати».</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>Торкніться кнопки відтворення ▶.</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: 'Слухаєте в ліжку? <strong>Таймер сну</strong> зупинить відтворення через певний час, і ви не втратите місце. <strong>Торкніться «Таймер сну».</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: 'Що буде, коли минуть 21 день?', options: [
            {t: 'Вона повернеться сама. Жодних штрафів, а продовжити можна, якщо ви не закінчили', ok: true, why: 'Так. Електронні книги й аудіокниги повертаються автоматично.'},
            {t: 'Вам виставлять штраф', why: 'Штрафів немає. Книга повертається сама, а продовжити її можна, якщо ви не закінчили.'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>Чудово!</strong> Щоб почати по-справжньому, запишіться на eastridinglibraries.co.uk або в будь-якій бібліотеці, потім завантажте BorrowBox і ввійдіть зі своїм квитком.'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Паркінг Harbour Road</span><span>Оплата в застосунку: локація <b>4471</b></span></div>
                <p class="cf">Введіть номер локації з таблички</p>${field('parkcode', 'Номер локації', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">Знайти паркінг</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? 'Сплатити £3.20' : 'Оберіть час'}</button>`, {color});
        }
        return app(p, 'Паркування', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: 'Багато паркінгів дозволяють платити через застосунок, тож монети не потрібні. Кожна рада користується різними застосунками (на табличці вказано, якими саме). Цей навчальний. <strong>Відкрийте «Park».</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: 'Введіть номер локації з таблички: 4471.',
         say: 'У кожного паркінгу є <strong>номер локації</strong> на табличці. <strong>Введіть 4471</strong> у поле й <strong>торкніться «Знайти паркінг»</strong>.'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: 'Номер вашого автомобіля вже збережено. <strong>Оберіть 2 години.</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: 'За користування застосунком стягується невеликий збір. <strong>Торкніться «Сплатити £3.20».</strong> <em>(Практика: гроші не списуються.)</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: 'Ви затримуєтеся в магазинах. Що можна зробити?', options: [
            {t: 'Торкнутися «Продовжити» в застосунку, щоб додати часу, не повертаючись до авто', ok: true, why: 'Так. У цьому велика перевага оплати через застосунок. Більшість також нагадують, перш ніж ваш час закінчиться.'},
            {t: 'Нічого, вам виставлять штраф', why: 'У більшості застосунків для паркування можна торкнутися «Продовжити» й додати часу, де б ви не були.'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>Чудово!</strong> Більшість автоматів досі приймають картки чи монети, а багато застосунків дозволяють платити й телефонним дзвінком чи SMS. Ніколи не платіть через наклейку з QR-кодом на автоматі: вона може бути фальшивою.'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>Ваш контракт закінчився 3 березня 2026 року. Ви можете перейти без витрат. Ваша щомісячна ціна — £24.00. Щоб перейти й зберегти номер, надішліть PAC на 65075.</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', 'Текстове повідомлення', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Чи ви ще в контракті, чи переплачуєте? Це з\'ясує одне безкоштовне SMS. <strong>Відкрийте «Повідомлення».</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: 'Наберіть INFO у полі повідомлення, а потім торкніться «Надіслати».',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: 'Ми почали нове повідомлення на <strong>85075</strong>. <strong>Наберіть INFO</strong> і <strong>торкніться «Надіслати»</strong>. Це безкоштовно в усіх мережах Великої Британії.'},
        {screen: c => smsTo(p, c), question: {q: 'У відповіді сказано, що ваш контракт закінчився, а ви все ще платите £24 на місяць. Що це означає?', options: [
            {t: 'За телефон уже розплачено. Тариф лише зі SIM-карткою може коштувати набагато менше, а номер можна зберегти', ok: true, why: 'Так. Надішліть PAC на 65075, щоб отримати код для переходу зі збереженням номера. Решту зробить ваш новий провайдер.'},
            {t: 'Нічого, продовжувати платити', why: 'Можливо, ви платите за телефон, за який уже розплатилися. Тариф лише зі SIM-карткою може вас дуже заощадити.'}]}},
        {screen: () => home(p), target: 'settings', say: 'Ще одна економія, для поїздок за кордон: вимкніть роумінг даних, щоб вас не стягнули несподіваною платою. <strong>Торкніться «Параметри».</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>Торкніться «Стільниковий зв\'язок».</strong>'},
            {screen: () => list(p, 'Стільниковий зв\'язок', [{label: 'Стільникові дані', toggle: true}, {id: 'options', label: 'Параметри даних', value: 'Роумінг увімкнено'}, {label: 'Особиста точка доступу'}], {back: 'Налаштування'}), target: 'options', say: '<strong>Торкніться «Параметри даних».</strong>'},
            {screen: c => list(p, 'Параметри даних', [{id: 'roam', label: 'Роумінг даних', toggle: !c.roamOff}, {label: 'Голос і дані', value: '5G Авто'}], {back: 'Стільниковий зв\'язок'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Вимкніть «Роумінг даних».</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>Торкніться «Мережа й інтернет».</strong>'},
            {screen: () => list(p, 'Мережа й інтернет', [{label: 'Інтернет', sub: 'Домашній Wi-Fi'}, {id: 'sims', label: 'SIM-карти', sub: 'Ваша мережа'}, {label: 'Авіарежим', toggle: false}]), target: 'sims', say: '<strong>Торкніться «SIM-карти».</strong>'},
            {screen: c => list(p, 'SIM-карти', [{label: 'Мобільний інтернет', toggle: true}, {id: 'roam', label: 'Роумінг', toggle: !c.roamOff, sub: 'Підключатися до служб передавання даних у роумінгу'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>Вимкніть «Роумінг».</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>Чудово!</strong> За кордоном ви все одно можете користуватися Wi-Fi для WhatsApp, відеодзвінків і карт. Увімкніть роумінг знову, якщо вам потрібен мобільний інтернет і ви знаєте, скільки бере ваш оператор.'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', 'Локатор', '#22c55e', ICON2.find]]), target: 'findmy', say: 'Якщо ділитися геопозицією, рідні бачитимуть, що ви дісталися додому. Це ваш вибір, і припинити можна будь-коли. <strong>Відкрийте «Локатор».</strong>'},
        {screen: c => app(p, 'Люди', `<p class="cf">Поки що ніхто не ділиться.</p><button type="button" class="ce co" data-tap="share">Поділитися геопозицією</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>Торкніться «Поділитися геопозицією».</strong>'},
        {screen: c => app(p, 'Поділитися з', '', {color: '#fff', overlay: sheet('Виберіть контакт', [['pick-sarah', 'Sarah', 'Донька'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Торкніться Sarah.</strong>', hints: {'pick-dave': 'Для цієї практики оберіть Sarah.'}},
        {screen: c => app(p, 'Поділитися з Sarah', '', {color: '#fff', overlay: sheet('На який час?', [['one-hour', 'Поділитися на одну годину'], ['day', 'Поділитися до кінця дня'], ['always', 'Поділитися без обмежень']])}),
         target: 'always', say: 'Оберіть, на який час. Для рідних, яким ви довіряєте, <strong>торкніться «Поділитися без обмежень»</strong>. Припинити можна будь-коли.', hints: {'one-hour': 'Це зручно для однієї поїздки. Для цієї практики оберіть «Поділитися без обмежень».', day: 'Для цієї практики оберіть «Поділитися без обмежень».'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: 'Якщо ділитися геопозицією, рідні бачитимуть, що ви дісталися додому. Це ваш вибір, і припинити можна будь-коли. <strong>Відкрийте «Карти».</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>Торкніться свого фото профілю</strong> угорі праворуч.'},
        {screen: () => app(p, 'Карти', '', {color: '#fff', overlay: sheet('', [['sharing', 'Передавання геопозиції'], ['timeline', 'Ваша хронологія'], ['settings', 'Налаштування']])}), target: 'sharing', say: '<strong>Торкніться «Передавання геопозиції».</strong>'},
        {screen: () => app(p, 'Передавання геопозиції', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>Торкніться «Нове надсилання».</strong>'},
        {screen: () => app(p, 'Поділитися з', '', {color: '#fff', overlay: sheet('Виберіть контакт', [['pick-sarah', 'Sarah', 'Донька'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>Торкніться Sarah.</strong>', hints: {'pick-dave': 'Для цієї практики оберіть Sarah.'}},
        {screen: () => app(p, 'Поділитися з Sarah', '', {color: '#fff', overlay: sheet('На який час?', [['one-hour', 'На 1 годину'], ['always', 'Доки ви не вимкнете']])}),
         target: 'always', say: 'Для рідних, яким ви довіряєте, <strong>торкніться «Доки ви не вимкнете»</strong>.', hints: {'one-hour': 'Зручно для однієї поїздки. Для цієї практики оберіть «Доки ви не вимкнете».'}},
    ]).concat([
        {screen: () => app(p, 'Передача геопозиції Sarah', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah бачить, де ви. ${p === 'ios' ? 'Торкніться «Припинити ділитися»' : 'Торкніться «Зупинити»'} у будь-який момент.</p>`, {color: '#fff'}),
         question: {q: 'Хтось, кого ви щойно зустріли в інтернеті, просить поділитися геопозицією. Чи варто?', options: [
            {t: 'Ні. Ділитися лише з близькими рідними чи друзями, яким ви довіряєте', ok: true, why: 'Саме так. Ваша геопозиція показує, де ви живете й коли вас немає вдома. Ділитеся лише з тими, кому довіряєте.'},
            {t: 'Так, вони здаються приємними', why: 'Ділитеся геопозицією лише з близькими рідними та друзями. Вона показує, де ви живете й коли вас немає вдома.'}]}},
        {screen: () => app(p, 'Передача геопозиції Sarah', '<p class="cf">Sarah бачить, де ви.</p>', {color: '#fff'}), done: true,
         say: '<strong>Чудово!</strong> Sarah бачить, що ви в безпеці. Час від часу перевіряйте, з ким ви ділитеся, і припиняйте ділитися з тими, кому це не потрібно.'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: 'Ваш онук Leo отримує свій перший iPhone. <strong>Екранний час</strong> встановлює здорові обмеження. Це телефон <strong>Leo</strong>. <strong>Торкніться «Параметри».</strong>'},
        {screen: c => list(p, 'Налаштування', [{label: 'Leo', sub: 'Apple Account'}, {label: 'Сповіщення'}, {id: 'screen-time', label: 'Екранний час'}, {label: 'Загальні'}], {noBack: true}), target: 'screen-time', say: '<strong>Торкніться «Екранний час».</strong>'},
        {screen: c => list(p, 'Екранний час', [{id: 'downtime', label: 'Час відпочинку', sub: c.downtime ? '20:00 – 07:00' : 'Вимк.'}, {label: 'Ліміти програм'}, {id: 'content', label: 'Обмеження вмісту й конфіденційності', sub: c.content ? 'Увімк.' : 'Вимк.'}, {label: 'Використовувати код-пароль «Екранного часу»'}], {back: 'Налаштування'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>«Час відпочинку»</strong> блокує більшість програм уночі (дзвінки працюють). <strong>Торкніться «Час відпочинку»</strong>, щоб увімкнути його з 20:00 до 7:00.'},
        {screen: c => list(p, 'Екранний час', [{label: 'Час відпочинку', sub: '20:00 – 07:00'}, {label: 'Ліміти програм'}, {id: 'content', label: 'Обмеження вмісту й конфіденційності', sub: c.content ? 'Увімк.' : 'Вимк.'}], {back: 'Налаштування'}),
         target: 'content', action: c => { c.content = true; }, say: 'Далі зупиніть несподівані покупки й вміст для дорослих. <strong>Торкніться «Обмеження вмісту й конфіденційності».</strong>'},
        {screen: c => list(p, 'Вміст і конфіденційність', [{label: 'Обмеження вмісту й конфіденційності', toggle: true}, {id: 'purchases', label: 'Покупки в App Store', value: c.noBuy ? 'Не дозволяти' : 'Дозволити'}, {label: 'Вебвміст', value: 'Обмежити сайти для дорослих'}], {back: 'Екранний час'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: 'Сайти для дорослих тепер обмежено. <strong>Торкніться «Покупки в App Store»</strong>, щоб зупинити витрати всередині застосунків.'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: 'Ваш онук Leo отримує свій перший телефон Android. Безкоштовний застосунок Google <strong>Family Link</strong> встановлює здорові обмеження з <strong>вашого</strong> телефона. <strong>Відкрийте Family Link.</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>Торкніться Leo.</strong>'},
        {screen: c => list(p, 'Leo', [{caption: 'Керування'}, {id: 'screen-time', label: 'Екранний час', sub: c.downtime ? 'Час сну 20:00 – 07:00' : 'Без обмежень'}, {id: 'content', label: 'Обмеження вмісту', sub: c.noBuy ? 'Покупки потребують вашого схвалення' : 'Google Play: дозволити все'}, {label: 'Геодані', sub: 'Увімк.'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>Торкніться «Екранний час»</strong>, щоб задати час сну з 20:00 до 7:00, коли телефон блокується (дзвінки працюють).'},
        {screen: c => list(p, 'Leo', [{caption: 'Керування'}, {label: 'Екранний час', sub: 'Час сну 20:00 – 07:00'}, {id: 'content', label: 'Обмеження вмісту', sub: c.noBuy ? 'Покупки потребують вашого схвалення' : 'Google Play: дозволити все'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: 'Далі зупиніть несподівані витрати. <strong>Торкніться «Обмеження вмісту»</strong>, щоб покупки потребували вашого схвалення.'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? 'Екранний час' : 'Leo', [{label: p === 'ios' ? 'Час відпочинку' : 'Екранний час', sub: '20:00 – 07:00'}, {label: 'Покупки', sub: p === 'ios' ? 'Не дозволяти' : 'Потрібне ваше схвалення'}]),
         question: {q: 'Що найважливіше, крім налаштувань?', options: [
            {t: 'Розмова з ними: вони завжди можуть розповісти вам, якщо щось в інтернеті їх засмутило', ok: true, why: 'Так. Жодне налаштування не вловлює всього. Найважливіше — бути людиною, з якою вони можуть поговорити.'},
            {t: 'Налаштування роблять усе', why: 'Вони дуже допомагають, але нічого не вловлюють повністю. Переконайтеся, що вони знають: з вами завжди можна поговорити.'}]}},
        {screen: () => list(p, p === 'ios' ? 'Екранний час' : 'Leo', [{label: 'Час відпочинку', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>Чудово!</strong> У Leo є час сну, і він не може витрачати гроші без дозволу. ' + (p === 'ios' ? 'Задайте код-пароль «Екранного часу», щоб лише ви могли це змінювати.' : 'Family Link дає змогу змінювати це зі свого телефона будь-коли.')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: 'Провідник', mac: 'Finder', linux: 'Файли'},
        settings: {windows: 'Налаштування', mac: 'Системні параметри', linux: 'Системні параметри'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: 'Менеджер програмного забезпечення'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: 'Пуск', mac: 'Програми', linux: 'Меню'},
        editor: {windows: 'Блокнот', mac: 'TextEdit', linux: 'Текстовий редактор'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: 'Пошта', text: N.editor[os],
        writer: 'LibreOffice Writer', update: 'Менеджер оновлень', terminal: 'Термінал', trash: 'Смітник', apps: 'Програми', chrome: 'Chrome', shield: 'Безпека Windows', fw: 'Брандмауер'}[kind]);

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
        windows: {title: 'Кошик', empty: 'Очистити кошик', confirm: n => `Ви впевнені, що хочете остаточно видалити ці елементи (${n})?`, items: [
            ['⟦paperclip⟧', 'Office Assistant (paperclip).exe', 'Пропонував допомогти з кожним листом, який ви колись почали писати. На пенсії з 2007 року.', ''],
            ['⟦bomb⟧', 'Minesweeper high scores.txt', 'Новачок: 999 секунд. Ми про це не говоримо.', ''],
            ['⟦spade⟧', 'Solitaire winning cards.gif', 'Вигравали партію, і карти стрибали вниз екраном. Двічі клацніть мене!', 'cards'],
            ['⟦phone⟧', 'Dial-up modem.wav', 'Іііііі… бумм… кшшшш. І ніхто не міг користуватися телефоном, поки ви були онлайн.', ''],
            ['⟦mountain-snow⟧', 'Green hill wallpaper.jpg', 'Той зелений пагорб і синє небо на мільйонах екранів з 2001 року.', ''],
            ['⟦save⟧', 'Дискета (A:)', '1,44 МБ. Кнопка «Зберегти» досі виглядає як вона.', ''],
            ['⟦gamepad-2⟧', 'Space Cadet Pinball.exe', '3D Pinball, безкоштовно з Windows, поки Vista його не забрала.', ''],
            ['⟦bell-ring⟧', 'MSN Messenger nudge', 'Хтось надіслав вам «поштовх», і весь екран затремтів. Двічі клацніть мене!', 'shake'],
            ['⟦file-text⟧', 'Лист до ради ОСТАТОЧНИЙ (2) (остаточний).doc', 'Такий є в кожного.', ''],
        ]},
        mac: {title: 'Смітник', empty: 'Очистити смітник', confirm: () => 'Ви впевнені, що хочете остаточно стерти елементи в смітнику? Цю дію не можна скасувати.', items: [
            ['⟦rainbow⟧', 'Обертовий пляжний м\'яч', 'Різнокольоровий круг, який означав «будь ласка, зачекайте»… і чекайте. Двічі клацніть мене!', 'ball'],
            ['⟦monitor⟧', 'iMac G3, Bondi Blue (1998)', 'Прозорий, яйцеподібний і синій. У кожній школі був такий.', ''],
            ['⟦music⟧', 'iPod із клік-колесом', '1000 пісень у кишені. Крути й крути великим пальцем.', ''],
            ['⟦smile⟧', 'Happy Mac', 'Маленький усміхнений комп\'ютер, який вітав вас під час кожного запуску.', ''],
            ['⟦bell⟧', 'Звук запуску', 'Той великий акорд, коли вмикали комп\'ютер. Багатьом його досі бракує.', ''],
            ['⟦droplet⟧', 'Кнопки Aqua', 'Такі блискучі й сині, що їх хотілося облизати.', ''],
            ['⟦calendar-days⟧', 'Віджети Dashboard', 'Калькулятор, погода й стікер на власному шарі. Зникли з 2019 року.', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', 'Де ми всі записували компакт-диски й синхронізували iPod.', ''],
        ]},
        linux: {title: 'Смітник', empty: 'Очистити смітник', confirm: () => 'Видалити всі елементи зі смітника? Усі елементи у смітнику буде остаточно видалено.', items: [
            ['⟦bird⟧', 'Пінгвін Tux (плюшевий)', 'Талісман Linux з 1996 року. Дуже приємно обіймати.', ''],
            ['⟦eye⟧', 'xeyes', 'Пара очей, що стежать за вказівником миші. Двічі клацніть мене!', 'eyes'],
            ['⟦app-window⟧', 'Хиткі вікна', 'Старі ефекти робочого стола змушували вікна хитатися, як желе, коли їх перетягували. Двічі клацніть мене!', 'wobble'],
            ['⟦save⟧', 'Установчі дискети 1–50', 'Раннє встановлення Linux могло потребувати цілої коробки дискет.', ''],
            ['⟦disc⟧', 'Безкоштовний диск Ubuntu поштою', 'Диск Linux можна було замовити безкоштовно, і його надсилали поштою.', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', 'Передрікають щороку приблизно з 1999-го. Може, цей рік саме той?', ''],
            ['⟦leaf⟧', 'Mint names.txt', 'У кожного випуску Linux Mint є жіноче ім\'я, як-от Zena, Xia та Vanessa.', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', 'Старий жарт: скажіть «sudo», і комп\'ютер робить, що йому кажуть.', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? 'Ця папка порожня.' : 'The ' + egg.title + ' порожня.'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? 'Двічі клацніть щось, щоб подивитися.' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? 'Ні' : 'Скасувати'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? 'Так' : 'Порожньо'}</button></div></div>` : '';
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
        ['Пагорби', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['Бірюзовий 95', '#008080'],
        ['Тонкі смужки', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['Нічне небо', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['Узбережжя', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', 'Найвідоміший каламбур про Wi-Fi.'],
        ['The LAN Before Time', 'LAN — це «локальна мережа». Ця дуже, дуже стара.'],
        ['Abraham Linksys', 'Вісімдесят сім мегабітів тому…'],
        ['Bill Wi the Science Fi', 'Наука рулить!'],
        ['Drop It Like It\'s Hotspot', 'Чиясь точка доступу з телефона, з почуттям гумору.'],
        ['Silence of the LANs', 'Дуже, дуже тиха мережа.'],
        ['Tell My Wi-Fi Love Her', 'Ох.'],
        ['Get Off My LAN', 'Мабуть, сердитий сусід.'],
        ['Bridlington Seagulls', 'Вони вже забрали вашу картоплю фрі. Не віддавайте їм ще й пароль.'],
        ['FREE WIFI (honest)', 'Мережу під назвою «free Wi-Fi», якої ви не впізнаєте, — саме та, до якої не слід приєднуватися!'],
    ];

    const FORTUNES = ['Сьогодні гарний день, щоб зробити копію фото.', 'Надійний пароль — щасливий пароль.', 'Вам зателефонують. Це буде шахрайство. Киньте слухавку.',
        'А ви пробували вимкнути й увімкнути знову?', 'Найкращий час для оновлення був учора. Другий найкращий — зараз.', 'Чашка чаю виправляє більшість речей. Крім комп\'ютерів.',
        'Ніколи не віддавайте пароль незнайомцю. Чи чайці.', 'Ви знайдете пульт. Він між подушками дивана.'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP-адреса: 192.168.1.42<br>Маршрутизатор: 192.168.1.1<br>Сигнал: −54 dBm (дуже добрий)<br>Канал: 36 (5 ГГц)<br>Швидкість: 866 Мбіт/с<br>Безпека: WPA3 Personal</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi вимкнено. Увімкніть його, щоб побачити мережі.</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>Немає інтернету</strong><br>Спробуйте перевірити Wi-Fi. Натисніть <kbd>Пробіл</kbd> або торкніться, щоб грати.</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>ГРУ ЗАВЕРШЕНО · натисніть Пробіл, щоб зіграти ще раз</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."Ви сьогодні мукали?"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('Спробуйте: apt moo, fortune, cowsay hello, sl, neofetch, date, whoami, ls, clear, exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || 'Му!'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('(Ви набрали «sl» замість «ls»? Тримайте паровоз.)');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | OS: Linux Mint 22.3 (навчальна) | | | | | | Desktop: Cinnamon | | | | | | Shell: bash | \\_____/ | Uptime: від сніданку \\___________/ Memory: ніколи не забуває днів народження`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('Гаразд. 🥪');
        else if (lc === 'make me a sandwich') say('Що? Зробіть самі.');
        else if (/rm\s+-rf/.test(lc)) say('Гарна спроба! У цьому навчальному терміналі нічого зламати не вийде.');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: команду не знайдено (спробуйте «help»)`);
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
        else if (note) note.textContent = 'Цей навчальний браузер не шукає в справжньому інтернеті. Нічого з того, що ви вводите, нікуди не надсилається.';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, 'Першоквітневий жарт! 🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>Чит-код активовано! +30 життів 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>Вітаємо в Macintosh.</p></div><p>Чит-код активовано! +30 життів 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>Чит-код активовано! +30 життів 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero Shake! Решту вікон згорнуто.' : 'Aero Shake! (Інших вікон для згортання не було.)');
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
                funToast(screen, 'Wi-Fi увімкнено. Підключено до Home-WiFi-5G.');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi вимкнено.'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>(Приєднуйтеся лише до мереж, які знаєте.)</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, 'Першоквітневий жарт! 🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', 'Вигляд'], ['', 'Сортувати за'], ['refresh', 'Оновити'], ['', 'Новий'], ['wall', 'Персоналізувати']]
                : os === 'mac' ? [['', 'Нова папка'], ['', 'Відомості'], ['wall', 'Змінити шпалери…'], ['', 'Використовувати стеки']]
                : [['', 'Створити нову папку'], ['terminal', 'Відкрити в терміналі'], ['wall', 'Змінити тло робочого стола']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `Шпалери: ${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27 (навчальна версія)</small>
                <dl><dt>Чип</dt><dd>Bridlington Silicon B1</dd><dt>Пам'ять</dt><dd>Ніколи не забуває днів народження</dd><dt>Завантажувальний диск</dt><dd>Practice HD</dd><dt>Серійний номер</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? 'Блокнот' : os === 'mac' ? 'TextEdit' : 'Текстовий редактор';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `Без назви – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? 'Рядок 1, стовпець 1 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : 'Звичайний текст'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">Вітаємо! Це навчальний термінал. Наберіть «help», щоб побачити, що можна спробувати. </pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', 'Погода'], ['news', '⟦newspaper⟧', 'Новини'], ['bus', '⟦bus⟧', 'Розклад автобусів'], ['recipes', '⟦cake-slice⟧', 'Рецепти']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Погода в Bridlington</h3><p class="fd">Навчальний прогноз</p><div class="ajf">${[['Сьогодні', '⟦cloud-sun⟧', '13°'], ['Пт', '⟦cloud-rain⟧', '11°'], ['Сб', '⟦wind⟧', '10°'], ['Нд', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>Активність чайок: <strong>дуже висока</strong>. Бережіть картоплю фрі.</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ Навчальні новини</h3><ul class="news">
            <li><strong>Місцевий чоловік нарешті знайшов пульт від телевізора</strong> між подушками дивана через три тижні.</li>
            <li><strong>Чайку помітили з морозивом 99 Flake</strong>. Власник морозива «не в захваті».</li>
            <li><strong>Бабуся обійшла онука у відеодзвінках</strong>: «Я просто натиснула зелену кнопку.»</li>
            <li><strong>Дослідження показало:</strong> 9 із 10 проблем із комп'ютером вирішуються вимкненням і повторним увімкненням.</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ Розклад автобусів</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ Бісквіт «Вікторія»</h3><p>Змішайте по 200 г масла, цукру й борошна з розпушувачем із 4 яйцями. Випікайте у двох формах при 180°C 20–25 хвилин. Наповніть джемом і вершками.</p><p class="fd">Порада: поставте таймер на телефоні або попросіть його: «Постав таймер на 25 хвилин».</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? 'Нова вкладка' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : 'Введіть пошуковий запит або вебадресу'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        'Собака на пляжі.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', 'Список покупок.txt'], ['⟦file-text⟧', 'Лист до ради.docx'], ['⟦folder⟧', 'Рецепти'], ['⟦file-spreadsheet⟧', 'Список різдвяних листівок.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', 'Рахунок за муніципальний податок.pdf'], ['⟦file-text⟧', 'Розклад автобусів.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', 'Духовий оркестр на набережній.mp3'], ['⟦music⟧', 'Хіти шістдесятих.mp3']],
    };
    function funFiles(screen, os, folder = 'Зображення', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? 'Кошик' : os === 'mac' ? 'Смітник' : 'Смітник'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === 'Собака на пляжі.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ Підключено до Home-WiFi-5G' : 'Wi-Fi вимкнено.'}</p>`,
            look: `<h3>${os === 'windows' ? 'Персоналізація' : os === 'mac' ? 'Шпалери' : 'Фони'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Центр оновлення Windows' : os === 'mac' ? 'Оновлення ПЗ' : 'Оновлення'}</h3><p class="mj">⟦check⟧ У вас найновіша версія</p><p class="cf">Остання перевірка: сьогодні, ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">Перевірити наявність оновлень</button><p class="zi"></p>`,
            about: `<h3>Про систему</h3><div class="zk"><div><span>Ім'я пристрою</span><b>MARGARET-PRACTICE</b></div><div><span>Система</span><b>${os === 'windows' ? 'Windows 11 (навчальна)' : os === 'mac' ? 'macOS 27 (навчальна)' : 'Linux Mint 22.3 (навчальна)'}</b></div>
                <div><span>Процесор</span><b>Bridlington Silicon B1</b></div><div><span>Пам'ять</span><b>Ніколи не забуває днів народження</b></div><div><span>Сховище</span><b>Багато місця для фото онуків</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? 'Персоналізація' : os === 'mac' ? 'Шпалери' : 'Фони'], ['update', 'Оновлення'], ['about', 'Про пристрій']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', 'Навчальний сапер', 'Класична гра про пошук мін.'], ['solitaire', '⟦spade⟧', 'Пасьянс', 'Незабаром у цьому навчальному магазині.'], ['paint', '⟦paintbrush⟧', 'Paint', 'Незабаром у цьому навчальному магазині.'], ['weather', '⟦cloud-sun⟧', 'Погода', 'Незабаром у цьому навчальному магазині.']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? 'Відкрити' : (os === 'mac' ? 'Отримати' : 'Установити')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', 'Навчальний сапер', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">Клацніть, щоб копати. Клацніть правою кнопкою (або натисніть і утримуйте), щоб поставити прапорець.</p></div>`, 'bz'));
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
        ['Мама', 'Як вимкнути цю штуку?', 'Привіт, сонечко, я написала цей лист, але не можу знайти кнопку вимкнення. Це та кругла? Люблю, мама xx P.S. Я її натиснула. Нічого не сталося. Це нормально?'],
        ['Bridlington Walkers', 'Суботня прогулянка', 'Зустріч у гавані о 10:00. Візьміть термос і водонепроникну куртку. Минулотижневий інцидент із чайкою обговорювати не будемо.'],
        ['Принц Абу (дуже багатий)', 'ТЕРМІНОВО: ви виграли £4 000 000!!!', 'Шановний любий друже, я принц, і мені потрібні ваші банківські дані, щоб надіслати вам чотири мільйони фунтів. Також надішліть £50 на марку. — Це шахрайство! Справжні люди не роздають мільйони електронною поштою. Видаліть цей лист або перешліть на report@phishing.gov.uk.'],
        ['Sarah', 'Фото з неділі 🌻', 'Ось фото з саду. Пес з\'їв ще один соняшник.'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', 'Пошта', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, 'Це навчальний комп\'ютер, тож його не можна вимкнути 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, 'Завантаження', '⟦triangle-alert⟧ Програми «безкоштовного очищення» часто є сміттям або гірше. Краще видалити її, а не відкривати!');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `«${n}» відкрився б тут на справжньому комп'ютері.`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi увімкнено.' : 'Wi-Fi вимкнено.'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = 'Перевірка оновлень…';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ Нових оновлень немає. Усе гаразд!'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, 'Це лише для вигляду в навчальному магазині.'); return true; }
            el.textContent = 'Установлення…'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Відкрити'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', 'Без назви 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Файл Редагування Вигляд Вставлення Формат <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">Шановні пані та панове, </textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', 'Менеджер оновлень', '<div class="ajz"><p class="mj">⟦check⟧ Ваша система оновлена</p><p class="cf">Linux Mint сам перевіряє наявність оновлень і показує крапку на щиті, коли вони є.</p></div>', 'bz'));
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
                ${opts.win10 ? '<span class="xi">⟦search⟧ Введіть тут для пошуку</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('Кошик', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('Комп\'ютер', '⟦monitor⟧')}${icon('Головна', '⟦house⟧')}${icon('Смітник', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('Пошук програм, параметрів і документів')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('Пошук')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('Введіть для пошуку…')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">Нова вкладка <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ Введіть пошуковий запит або вебадресу</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? 'Це <strong>робочий стіл</strong>. Смуга внизу — це <strong>панель завдань</strong>. Відкрийте веббраузер із меню «Пуск»: <strong>клацніть «Пуск»</strong>, чотири квадрати.'
            : os === 'mac' ? 'Це <strong>робочий стіл</strong>. Ряд програм унизу — це <strong>Док</strong>, а смуга вгорі — <strong>рядок меню</strong>. <strong>Клацніть «Програми»</strong> (сітка квадратів), щоб побачити всі свої програми.'
            : 'Це <strong>робочий стіл</strong> у Linux Mint. Смуга внизу — це <strong>панель</strong>. Ваші програми в Меню: <strong>клацніть «Меню»</strong> унизу ліворуч.',
         hint: os === 'mac' ? '«Програми» — у Доку внизу, поруч із Finder.' : (os === 'windows' ? '«Пуск» — це чотири сині квадрати на панелі завдань.' : 'Кнопка «Меню» — найлівіша на нижній панелі.')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>Клацніть ${N.browser[os]}</strong>, веббраузер.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? 'Кожне вікно має три кольорові кнопки <strong>вгорі ліворуч</strong>. Жовта згортає вікно. <strong>Клацніть жовту кнопку.</strong>'
            : 'Кожне вікно має три кнопки <strong>вгорі праворуч</strong>. Риска <strong>—</strong> згортає вікно. <strong>Клацніть —</strong>.',
         hints: {'win-close': 'Це закриває вікно. Спершу згорніть його за допомогою ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': 'Це розгортає вікно на весь екран. Спершу згорніть його.'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `Воно приховане, а не закрите: на це вказує ${os === 'mac' ? 'крапка під його значком у Доку' : 'line under its icon'}. <strong>Клацніть значок ${N.browser[os]}</strong>, щоб повернути його.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `Тепер розгорніть його на весь екран: <strong>клацніть кнопку ${os === 'mac' ? 'green' : '▢'}</strong>.`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: 'На Mac червона кнопка закриває вікно. Але програма може й далі працювати. Як повністю вийти з неї?', options: [
                {t: 'Натиснути ⟦command⟧ Cmd + Q або вибрати «Вийти» в меню програми вгорі', ok: true, why: 'Так. Крапка під програмою в Доку означає, що вона ще працює. ⟦command⟧ Cmd + Q виходить із неї.'},
                {t: 'Клацнути червону кнопку двічі', why: 'Червона кнопка лише закриває вікна. ⟦command⟧ Cmd + Q (або меню програми > «Вийти») виходить із програми.'}]}
            : {q: 'Де кнопка закриття вікна?', options: [
                {t: 'Вгорі праворуч: ⟦x⟧', ok: true, why: 'Так. У Windows і Linux Mint три кнопки розташовані вгорі праворуч. (На Mac вони вгорі ліворуч, червона, жовта й зелена.)'},
                {t: 'Унизу ліворуч', why: 'Це вгорі праворуч у кожному вікні: ⟦x⟧.'}]}},
        {screen: () => desk(os), done: true, say: '<strong>Чудово!</strong> Ви вмієте відкривати, ховати, повертати, збільшувати й закривати вікна. Це більша частина роботи з комп\'ютером.'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? 'Головна' : 'Головна'], ['desktop', 'Робочий стіл'], ['documents', 'Документи'], ['downloads', 'Завантаження'], ['pictures', 'Зображення']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ USB-флешка']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', 'Документи'], ['pictures', '⟦folder⟧', 'Зображення'], ['downloads', '⟦folder⟧', 'Завантаження']],
            downloads: [['photo', '⟦image⟧', 'Фото з відпустки.jpg'], ['bill', '⟦file-text⟧', 'Рахунок за муніципальний податок.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', 'Фото з відпустки.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || 'Відпустки')]] : [])],
            documents: [['letter', '⟦file-text⟧', 'Лист до ради.docx'], ['recipes', '⟦folder⟧', 'Рецепти']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', 'Документи']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', 'Нова папка', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? 'Головна' : 'Головна', downloads: 'Завантаження', pictures: 'Зображення', documents: 'Документи', usb: 'USB-флешка', desktop: 'Робочий стіл'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">Ця папка порожня</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: 'Finder', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? 'Копіювати' : 'Копіювати';
    const pasteLabel = os => os === 'mac' ? 'Вставити елемент' : 'Вставити';
    const newFolderLabel = os => os === 'mac' ? 'Нова папка' : os === 'windows' ? 'Створити > Папка' : 'Створити нову папку';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `Ваші фото й листи зберігаються у <strong>папках</strong>. <strong>Клацніть ${N.files[os]}</strong>, щоб їх переглянути.`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? 'ліворуч у Доку' : 'на ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: 'Збоку розташовані ваші основні папки. Те, що ви завантажуєте з листів і сайтів, потрапляє в <strong>«Завантаження»</strong>. <strong>Клацніть «Завантаження».</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', 'Відкрити'], ['menu-copy', copyLabel(os)], ['menu-rename', 'Перейменувати'], ['menu-delete', os === 'mac' ? 'Перемістити до смітника' : 'Видалити']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Скопіюймо фото з відпустки до «Зображень», де йому місце. <strong>Клацніть правою кнопкою миші</strong> на <strong>«Фото з відпустки.jpg»</strong>: натисніть <strong>праву</strong> кнопку миші. <em>' + (os === 'mac' ? 'На трекпеді клацніть двома пальцями.' : 'На сенсорному екрані натисніть і утримуйте.') + '</em>',
         hint: 'Скористайтеся правою кнопкою миші на фото.'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `З'являється меню. <strong>Клацніть ${copyLabel(os)}.</strong> <em>(Скорочення: ${CMDL(os)} + C.)</em>`, hints: {'menu-delete': 'Не цей пункт! Клацніть «Копіювати».', 'menu-open': 'Це відкриває фото. Клацніть «Копіювати».', 'menu-rename': 'Клацніть «Копіювати».'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>Клацніть «Зображення»</strong> ліворуч.'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: '«Зображення» порожні. <strong>Клацніть правою кнопкою на порожньому білому місці.</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>Клацніть ${pasteLabel(os)}.</strong> <em>(Або ${CMDL(os)} + V.)</em>`,
         hints: {'menu-newfolder': 'Папку створимо далі. Спершу клацніть ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: 'Тепер фото є й у «Зображеннях». Створімо папку, щоб тримати фото з відпусток разом. <strong>Знову клацніть правою кнопкою на порожньому місці.</strong>', hints: {'rc-photo2': 'Клацніть правою кнопкою на порожньому місці, а не на фото.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>Клацніть ${newFolderLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: 'Спершу введіть назву папки, наприклад «Відпустки».',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>Введіть назву</strong>, наприклад <strong>«Відпустки»</strong>, а потім <strong>клацніть OK</strong> (або натисніть Enter).', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: 'Де зазвичай опиняються файли з листів і сайтів?', options: [
            {t: 'У папці «Завантаження»', ok: true, why: 'Так. Якщо ви не можете знайти щось завантажене, спершу шукайте в «Завантаженнях».'},
            {t: 'На робочому столі', why: 'Зазвичай у «Завантаженнях». Шукайте там, якщо щось не знаходите.'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>Чудово!</strong> Клацання правою кнопкою — секрет більшості дій: копіювання, вставлення, перейменування й створення папки — усе в цьому меню.'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>Введіть пароль мережі</p>${field('wifipass', 'Пароль', ctx)}<button type="button" class="ce co" data-tap="connect">Підключитися</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Мережі Wi-Fi'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ Підключено до Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `Щоб підключитися до Wi-Fi, <strong>клацніть значок Wi-Fi</strong> ${os === 'mac' ? 'угорі праворуч на екрані' : 'унизу праворуч, біля годинника'}.`, hint: os === 'mac' ? 'Він у рядку меню вгорі праворуч.' : 'Він біля годинника внизу праворуч.'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: 'Назва вашої мережі вказана на наклейці на роутері. Ця навчальна — <strong>Home-WiFi-5G</strong>. <strong>Клацніть її.</strong>', hints: {'net-neighbour': 'Це мережа сусіда! Оберіть Home-WiFi-5G.', 'net-cafe': 'Це не ваша домашня мережа. Оберіть Home-WiFi-5G.', 'tray-wifi': 'Список мереж Wi-Fi уже відкрито. Клацніть Home-WiFi-5G.'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: 'Введіть пароль точно: Green-Apple-42 (великі G і A).',
         action: c => { c.connected = true; c.picked = false; }, say: 'Введіть пароль з наклейки <strong>точно</strong>: <strong>Green-Apple-42</strong>. Потім <strong>клацніть «Підключитися»</strong>.', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Панель Wi-Fi уже відкрито. Введіть пароль у поле, а потім клацніть «Підключитися».'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: 'Ви в кафе з безкоштовним Wi-Fi. Чи можна там користуватися онлайн-банкінгом?', options: [
            {t: 'Краще зачекати до дому або скористатися мобільним інтернетом телефона', ok: true, why: 'Так. Безкоштовний Wi-Fi підходить для перегляду сайтів, але для банківських справ користуйтеся домашнім Wi-Fi або мобільним інтернетом.'},
            {t: 'Так, будь-який Wi-Fi підходить', why: 'Безкоштовний публічний Wi-Fi підходить для перегляду сайтів, але банківські справи залишайте для дому чи мобільного інтернету.'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>Чудово!</strong> Комп\'ютер запам\'ятає пароль і наступного разу підключиться сам.'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = 'Список покупок: молоко, хліб, яйця, чайні пакетики, листівка до дня народження для Jean';
        const note = pcWin(os, `Список покупок – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, 'Новий лист для Sarah', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : 'Клацніть тут, щоб написати…')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? 'Пошта' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `Комбінації клавіш заощаджують багато клацань. <strong>${CMDL(os)}</strong> — це клавіша ${os === 'mac' ? 'по обидва боки від пробілу, з позначкою ⟦command⟧' : 'унизу ліворуч на клавіатурі'}. Щоб виділити весь текст, утримуйте <strong>${CMDL(os)}</strong> і натисніть <strong>A</strong>. <em>Користуйтеся справжньою клавіатурою або кнопками на екрані.</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `Текст виділено. Тепер скопіюйте його: <strong>${CMDL(os)} + C</strong>.`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: 'Скопійовано! <strong>Клацніть усередині листа</strong> для Sarah, де написано «Клацніть тут, щоб написати».'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `Тепер вставте: <strong>${CMDL(os)} + V</strong>.`},
        {screen: c => shortcutDesk(os, c), question: {q: `Ой, ви випадково щось видалили. Яка комбінація це скасовує?`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `Так. ${CMDL(os)} + Z скасовує останню дію майже в усіх програмах. Натисніть ще раз, щоб скасувати більше.`},
            {t: 'Escape', why: `Esc закриває меню. ${CMDL(os)} + Z — скасування.`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: 'Як зробити знімок екрана (зображення того, що на екрані)?', options: [
            {t: os === 'windows' ? 'Клавіша Windows + Shift + S, потім виділіть потрібну ділянку' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4, потім виділіть потрібну ділянку' : 'Натиснути клавішу Print Screen (PrtSc)', ok: true,
             why: os === 'windows' ? 'Так. Знімок скопійовано, а сповіщення дає змогу його зберегти. Клавіша Print Screen теж працює.' : os === 'mac' ? 'Так. Зображення зберігається на робочому столі. Shift + ⟦command⟧ Cmd + 3 знімає весь екран.' : 'Так. Linux Mint зберігає його у вашій папці «Зображення». Shift + Print Screen дає змогу вибрати ділянку.'},
            {t: 'Сфотографувати екран телефоном', why: 'Це спрацює, але знімок екрана набагато чіткіший. ' + (os === 'windows' ? 'Клавіша Windows + Shift + S.' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4.' : 'Натисніть Print Screen.')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>Чудово!</strong> Велика четвірка: <strong>${CMDL(os)} + C</strong> — копіювати, <strong>V</strong> — вставити, <strong>Z</strong> — скасувати, <strong>A</strong> — виділити все. Вони працюють майже в усіх програмах.`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', 'Безкоштовно', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', 'Безкоштовно · Покупки в застосунку', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>Пошук програм</span></button><div class="hp"><span>ВИБРАНЕ</span><strong>Програми для вашого нового комп'ютера</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? 'Відкрити' : (os === 'mac' ? 'Отримати' : 'Установити')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">Установлення LibreOffice…</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">Навчальний магазин: назви й ціни — приклади.</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `Найбезпечніше місце для програм — вбудований магазин: <strong>${N.store[os]}</strong>. <strong>Клацніть його.</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: 'Вам потрібне щось для написання листів, як-от Word. <strong>Клацніть поле пошуку.</strong> Шукатимемо «office».'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> — безкоштовна альтернатива Microsoft Office від <strong>The Document Foundation</strong>. Перевірте, хто його створив, а потім <strong>клацніть ' + (os === 'mac' ? 'Отримати' : 'Установити') + ' біля LibreOffice</strong>.',
         hints: {'get-fake1': 'Це реклама, і вона коштує £29.99 на рік. LibreOffice безкоштовний.', 'get-fake2': 'Це від AppMakers, і там є покупки в програмі. Оберіть LibreOffice від The Document Foundation.'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: 'Спливаюче вікно на сайті каже: «Ваш ПК повільний! Завантажте Speed Booster зараз». Що ви зробите?', options: [
            {t: 'Закрити його. Встановлювати програми лише з магазину або з сайту самого розробника', ok: true, why: 'Саме так. Спливаючі вікна із пропозицією «прискорювачів» чи «очисників» часто є сміттям або гірше.'},
            {t: 'Завантажити, раптом допоможе', why: 'Вони часто є сміттям або шкідливими. Встановлюйте лише з магазину або з сайту самого розробника.'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>Чудово!</strong> LibreOffice встановлено. Перевіряйте розробника, ігноруйте рекламу й остерігайтеся «безкоштовних» програм, які потім просять гроші.'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', 'Головна'], ['system', 'Система'], ['bluetooth', 'Bluetooth і пристрої'], ['network', 'Мережа й інтернет'], ['accounts', 'Облікові записи'], ['privacy', 'Конфіденційність і безпека'], ['update', 'Центр оновлення Windows']];
            const pages = {
                home: '<h3>Головна</h3><p class="cf">Рекомендовані параметри й ваш обліковий запис.</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ У вас найновіша версія</p>' : ctx.ready ? `<p class="cf">Для завершення встановлення оновлень потрібен перезапуск.</p><button type="button" class="ce co bz" data-tap="restart">Перезапустити зараз</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? 'Завантаження… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, 'Налаштування', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['general', 'Загальні'], ['privacy', 'Конфіденційність і безпека'], ['users', 'Користувачі та групи']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ На вашому Mac найновіша версія</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? 'Завантаження… залишилося близько 10 хвилин' : 'Виправлення безпеки та помилок'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>Конфіденційність і безпека</h3><p class="cf"><strong>Безпека</strong><br>Дозволяти програми з:</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store та відомих розробників</button>`,
            };
            return pcWin(os, 'Системні параметри', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>Системні параметри</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, 'Менеджер оновлень', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ Ваша система оновлена</p>' : `<div class="ahf">${['Веббраузер Firefox', 'Ядро Linux (безпека)', 'LibreOffice', 'Системні бібліотеки'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">Установлення оновлень…</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>Потрібна автентифікація</strong></p><p class="fd">Введіть пароль, щоб установити оновлення. (Практика: введено за вас.)</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">Скасувати</button><button type="button" class="adg" data-tap="auth-ok">Автентифікуватися</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Оновлення закривають дірки в безпеці, якими користуються шахраї. Перевіримо їх наявність. <strong>Клацніть «Пуск».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Клацніть «Параметри»</strong> (шестірня).'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>Клацніть «Центр оновлення Windows»</strong> унизу списку ліворуч.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: 'Оновлення чекають. <strong>Клацніть «Завантажити й установити все».</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: 'Спершу збережіть усе, над чим працюєте, а потім <strong>клацніть «Перезапустити зараз»</strong>.'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Оновлення закривають дірки в безпеці, якими користуються шахраї. <strong>Клацніть меню Apple</strong> (логотип) угорі ліворуч.'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Клацніть «Системні параметри…»</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: 'Ви в розділі «Загальні». <strong>Клацніть «Оновлення ПЗ».</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: 'Оновлення готове. Підключіть зарядний пристрій, а потім <strong>клацніть «Оновити зараз»</strong>.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: 'Mac завантажує його, а потім перезапускається для встановлення.',
         question: {q: 'Автоматичні оновлення ввімкнено. Чи потрібно ще щось робити?', options: [
            {t: 'Просто перезапускати, коли він попросить, і час від часу залишати його на ніч підключеним до зарядки', ok: true, why: 'Так. Оновлення часто встановлюються вночі. Перезапуск на прохання завершує їх.'},
            {t: 'Вимкнути автоматичні оновлення', why: 'Залиште їх увімкненими: вони захищають вас. Просто перезапускайте, коли Mac попросить.'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: 'Оновлення закривають дірки в безпеці. У Linux Mint <strong>щит</strong> біля годинника показує крапку, коли є оновлення. <strong>Клацніть щит.</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: 'Менеджер оновлень показує їх усі. <strong>Клацніть «Установити оновлення».</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux просить <strong>ваш пароль</strong> перед будь-якою важливою зміною. Це добре. <strong>Клацніть «Автентифікуватися».</strong>', hints: {'auth-cancel': 'Це скасовує оновлення. Клацніть «Автентифікуватися».'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: 'Як часто слід встановлювати оновлення?', options: [
            {t: 'Щоразу, коли на щиті з\'являється крапка: це займає хвилину', ok: true, why: 'Так. Linux Mint рідко потребує перезапуску, крім деяких оновлень безпеки.'},
            {t: 'Раз на рік', why: 'Встановлюйте їх щоразу, коли на щиті з\'являється крапка. Це займає лише хвилину.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Чудово!</strong> Ваш комп\'ютер оновлено. Підтримувати його в актуальному стані — найкраще, що ви можете зробити для безпеки.'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', 'Система', 'Екран, звук, про систему'], ['tile-devices', '⟦printer⟧', 'Пристрої', 'Bluetooth, принтери'], ['tile-network', '⟦globe⟧', 'Мережа й інтернет', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', 'Облікові записи', 'Ваші рахунки'], ['tile-update', '⟦refresh-cw⟧', 'Оновлення та безпека', 'Центр оновлення Windows']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ Ваш ПК зареєстровано в програмі Extended Security Updates</p><p class="cf">Оновлення безпеки до 12 жовтня 2027 року.</p>' : `<div class="ahg"><strong>Підтримку Windows 10 завершено</strong><p>Ваш ПК не відповідає вимогам для Windows 11. Зареєструйтеся в Extended Security Updates, щоб і далі отримувати оновлення безпеки.</p>
            <button type="button" class="ce co bz" data-tap="enroll">Зареєструватися зараз</button></div>`}`;
        else inner = `<h3>Extended Security Updates</h3><p class="cf">Оберіть спосіб реєстрації:</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>Створити резервну копію параметрів ПК</strong><small>Безкоштовно, з обліковим записом Microsoft</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>Використати 1000 балів Microsoft Rewards</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>Разова покупка</strong><small>Платно</small></button>${ctx.busy ? '<p class="cf">Реєстрація…</p>' : ''}`;
        return pcWin('windows', 'Налаштування', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: 'Якщо ваш комп\'ютер виглядає так, з «Пуском» у крайньому лівому куті, це може бути <strong>Windows 10</strong>. Перевіримо. <strong>Клацніть «Пуск».</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>Клацніть «Параметри»</strong> (шестірня).'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>Клацніть «Система».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: 'Написано Windows 10 Home. Що це означає у 2026 році?', options: [
            {t: 'Microsoft припинила звичайну підтримку в жовтні 2025 року. Він ще працює, але для безпеки потребує Extended Security Updates', ok: true,
             why: 'Так. Безкоштовна програма Extended Security Updates для домашніх користувачів тепер діє до 12 жовтня 2027 року. Після цього Windows 10 більше не отримуватиме виправлень безпеки.'},
            {t: 'Нічого, Windows 10 оновлюватимуть вічно', why: 'Звичайна підтримка закінчилася в жовтні 2025 року. Extended Security Updates діють до 12 жовтня 2027 року, а потім припиняються.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>Клацніть ← Головна</strong>, щоб повернутися.'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>Клацніть «Оновлення та безпека».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: 'Цей ноутбук надто старий для Windows 11, тож Windows пропонує <strong>Extended Security Updates</strong>. <strong>Клацніть «Зареєструватися зараз».</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: 'Безкоштовний спосіб — створити резервну копію параметрів в обліковому записі Microsoft. <strong>Клацніть «Створити резервну копію параметрів ПК».</strong>', hints: {'esu-buy': 'Платити не потрібно. Оберіть безкоштовний варіант резервної копії.', 'esu-points': 'Це спрацює, якщо у вас є бали, але варіант з резервною копією безкоштовний для всіх.'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: 'Які у вас варіанти до жовтня 2027 року?', options: [
            {t: 'Перейти на Windows 11, якщо це можливо, купити новий комп\'ютер або перевести старий на Linux Mint (безкоштовно)', ok: true, why: 'Так. Linux Mint безкоштовний і добре працює на старих ноутбуках. Наступні уроки показують, де що на Mac і в Linux Mint.'},
            {t: 'Користуватися Windows 10 після 2027 року для банківських справ', why: 'Після жовтня 2027 року він не отримує виправлень безпеки, тож не безпечний для банківських справ. Оновіться, замініть або перейдіть на Linux Mint.'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>Чудово!</strong> Ви знаєте, яка у вас Windows і як зберігати її безпечною до жовтня 2027 року. Остерігайтеся дзвінків чи спливаючих вікон із пропозицією «оновити» вас за плату: це шахрайство.'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: 'Переходите з Windows? На Mac програми живуть у <strong>Доку</strong> внизу, а меню кожної програми — в <strong>рядку меню</strong> угорі. <strong>Клацніть Safari</strong>, веббраузер, у Доку.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: 'Кнопки вікна на Mac розташовані <strong>вгорі ліворуч</strong>. <strong>Клацніть червону</strong>, щоб закрити вікно.'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: 'Вікно зникло, але бачите <strong>крапку під Safari</strong> у Доку? Він ще працює. Щоб вийти з нього, <strong>клацніть правою кнопкою Safari в Доку</strong> (двома пальцями на трекпеді).', hint: 'Клацніть правою кнопкою (або двома пальцями) значок Safari в Доку.',
         hints: {'app-browser': 'Звичайне клацання відкриває його знову. Натомість клацніть правою кнопкою.'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>Клацніть «Вийти».</strong> <em>(Скорочення: ⟦command⟧ Cmd + Q.)</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: 'Параметри знаходяться в <strong>меню Apple</strong> (логотип) угорі ліворуч. <strong>Клацніть його.</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: 'Вимкнення й перезапуск теж тут. <strong>Клацніть «Системні параметри…»</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системні параметри', windows: settingsWin('mac', c, 'general')}),
         question: {q: 'У Windows копіюють за допомогою Ctrl + C. А що на Mac?', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: 'Так. Більшість комбінацій Windows на Mac використовують ⟦command⟧ Cmd замість Ctrl: ⟦command⟧ C, ⟦command⟧ V, ⟦command⟧ Z, ⟦command⟧ A.'},
            {t: 'Ctrl + C, так само', why: 'На Mac це ⟦command⟧ Cmd + C. Більшість комбінацій із Ctrl стають комбінаціями з ⟦command⟧ Cmd.'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: 'Системні параметри', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>Чудово!</strong> Док унизу, меню вгорі, кнопки вікна вгорі ліворуч, ⟦command⟧ Cmd замість Ctrl і меню Apple для параметрів і вимкнення.'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> — безкоштовна система, що працює дуже схоже на Windows і добре йде на старих комп\'ютерах. Ваші програми в <strong>Меню</strong> унизу ліворуч, як кнопка «Пуск». <strong>Клацніть «Меню».</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'У Linux Mint уже встановлено безкоштовні програми. Для листів скористайтеся <strong>LibreOffice Writer</strong>, який працює як Microsoft Word. <strong>Клацніть його.</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Без назви 1 – LibreOffice Writer', '<div class="aju"><div class="yd">Файл Редагування Вигляд Вставлення Формат <b>B</b> <i>I</i> <u>U</u></div><div class="vk">Шановні пані та панове,<span class="ts"></span></div></div>', {max: true})}),
         question: {q: 'Чи можна відкривати документи Word, які вам надсилають поштою?', options: [
            {t: 'Так. LibreOffice відкриває й зберігає файли Word (.docx)', ok: true, why: 'Так. Зберігаючи те, що потрібно надіслати користувачу Word, оберіть у «Зберегти як» формат Word (.docx).'},
            {t: 'Ні, для цього потрібна Windows', why: 'LibreOffice відкриває й зберігає файли Word (.docx), тож ви можете обмінюватися документами з користувачами Word.'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', 'Без назви 1 – LibreOffice Writer', '<div class="aju"><div class="vk">Шановні пані та панове,</div></div>', {max: true})}),
         target: 'win-close', say: 'Кнопки вікна вгорі праворуч, як у Windows. <strong>Клацніть ⟦x⟧</strong>, щоб закрити Writer.'},
        {screen: () => desk('linux'), target: 'start', say: 'Тепер знайдімо, де взяти більше програм. <strong>Знову клацніть «Меню».</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>Менеджер програмного забезпечення</strong> — безкоштовний магазин програм Linux Mint. <strong>Клацніть його.</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', 'Менеджер програмного забезпечення', `<div class="jo"><div class="gq">${ICON.search}<span>Пошук</span></div>
            <div class="aan">${['Інтернет', 'Офіс', 'Графіка', 'Звук і відео', 'Ігри', 'Доступність'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">Тисячі безкоштовних програм, перевірених Linux Mint.</p></div>`, {max: true})}),
         question: {q: 'Чи потрібно купувати антивірус для Linux Mint?', options: [
            {t: 'Ні. Підтримуйте систему в актуальному стані, беріть програми з Менеджера програмного забезпечення, і ви добре захищені', ok: true, why: 'Ні. У Linux мало вірусів. Оновлення й вбудований брандмауер роблять свою справу. Шахрайство в листах і на сайтах нікуди не зникає, тож будьте пильні.'},
            {t: 'Так, найдорожчий', why: 'Ні. Підтримуйте систему в актуальному стані й беріть програми з Менеджера програмного забезпечення. Остерігайтеся шахрайства в листах і на сайтах, як завжди.'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>Чудово!</strong> Меню внизу ліворуч, закриття вгорі праворуч, LibreOffice для документів, Firefox для інтернету, Менеджер програмного забезпечення для програм і щит для оновлень.'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ USB-флешку підключено</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: 'Перш ніж змінювати комп\'ютер, скопіюйте файли на <strong>USB-флешку</strong>. Вставте її в USB-роз\'єм збоку комп\'ютера. Тут <strong>клацніть «Вставити USB-флешку»</strong>.'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ USB-флешку підключено</div>'}), target: 'app-files', say: `<strong>Відкрийте ${N.files[os]}.</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', 'Відкрити'], ['menu-copy', 'Копіювати'], ['menu-rename', 'Перейменувати']]; c.menuAt = 'left:30%;top:22%'; },
         say: 'Ваші листи в <strong>«Документах»</strong>. <strong>Клацніть правою кнопкою папку «Документи».</strong> <em>(Потім зробіть те саме з «Зображеннями».)</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>Клацніть «Копіювати».</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: 'Ваша USB-флешка ліворуч. <strong>Клацніть «USB-флешка».</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: 'Вона порожня. <strong>Клацніть правою кнопкою на порожньому місці.</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>Клацніть ${pasteLabel(os)}.</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? 'Копіювання 214 елементів… залишилась 1 хвилина' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', 'Витягти']]; c.menuAt = 'left:6%;top:62%'; },
         say: 'Готово! Перш ніж витягти флешку, <strong>безпечно вилучіть</strong> її, щоб нічого не пошкодилося. <strong>Клацніть правою кнопкою «USB-флешка»</strong> ліворуч.'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>Клацніть «Витягти».</strong> Тепер її можна безпечно забрати.'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: 'Який ще спосіб перенести файли на новий комп\'ютер?', options: [
            {t: 'Онлайн-сховище: OneDrive, iCloud або Google Drive', ok: true, why: 'Так. Завантажте зі старого комп\'ютера, увійдіть на новому, і файли там. USB-флешка теж гарна додаткова копія.'},
            {t: 'Надіслати собі кожен файл поштою по одному', why: 'Це забрало б цілу вічність! Скористайтеся USB-флешкою або онлайн-сховищем, як-от OneDrive, iCloud чи Google Drive.'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>Чудово!</strong> На новому комп\'ютері вставте флешку, відкрийте її і скопіюйте папки до «Документів» і «Зображень».'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC Weather ⟦star⟧ NHS App ⟦star⟧ Розклад автобусів Bridlington ⟦star⟧ Рецепти</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">Ви не ввійшли</span><button type="button" data-tap="sync">Увімкнути синхронізацію…</button><button type="button" data-tap="guest">Відкрити гостьовий профіль</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>Увійти через Google</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">(Практика: введено за вас.)</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">Далі</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>Увімкнути синхронізацію?</strong></p><p class="fd">Ваші закладки, паролі та історія буде збережено у вашому обліковому записі Google, і вони з\'являться на всіх ваших пристроях.</p><div class="jn"><button type="button" data-tap="cancel">Скасувати</button><button type="button" class="adg" data-tap="yes-in">Так, я в системі</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">Нова вкладка</span>${profile}</div><div class="qn">⟦search⟧ Шукайте в Google або введіть URL</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">Синхронізація закладок…</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: 'Якщо ви користувалися <strong>Chrome</strong> на старому комп\'ютері, вхід переносить закладки й збережені паролі на новий. (Firefox і Edge працюють так само.) <strong>Клацніть Chrome.</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>Клацніть значок людини</strong> угорі праворуч.'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>Клацніть «Увімкнути синхронізацію…»</strong>', hints: {guest: 'Гостьовий профіль нічого не зберігає. Клацніть «Увімкнути синхронізацію».'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: 'Увійдіть через <strong>той самий обліковий запис Google</strong>, яким користувалися на старому комп\'ютері. <strong>Клацніть «Далі».</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>Клацніть «Так, я в системі».</strong>', hints: {cancel: 'Це зупиняє синхронізацію. Клацніть «Так, я в системі».'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: 'Ваші закладки повернулися. Чи безпечно зберігати паролі в браузері?', options: [
            {t: 'Так, якщо ваш обліковий запис Google має надійний пароль і двоетапну перевірку', ok: true, why: 'Так. Це набагато безпечніше, ніж використовувати один пароль скрізь. Захистіть сам обліковий запис двоетапною перевіркою.'},
            {t: 'Ні, краще написати їх на стікері на екрані', why: 'Менеджер паролів у браузері набагато безпечніший за нотатку на екрані, якщо ваш обліковий запис має двоетапну перевірку.'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>Чудово!</strong> Ваші закладки й паролі пішли за вами. На публічному чи спільному комп\'ютері не вмикайте синхронізацію.'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : 'Система'} Сповіщення безпеки ⚠️</strong>
            <p>Ваш комп'ютер ЗАРАЖЕНО 5 вірусами! Ваші банківські дані та фото під загрозою.</p><p>Не вимикайте комп'ютер. Зателефонуйте до підтримки зараз:</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">Зателефонувати</button><button type="button" data-tap="fake-close">Закрити</button></div>
            <small>(Навчальна шахрайська сторінка. Номер не справжній.)</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>Залишити сайт?</strong></p><p class="fd">Внесені зміни можуть не зберегтися.</p><div class="jn"><button type="button" data-tap="stay">Залишитися</button><button type="button" class="adg" data-tap="leave">Залишити</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: 'Це раптом заповнило весь ваш екран під час перегляду сайтів. Це справжнє?', options: [
            {t: 'Ні. Це фальшивий сайт, який намагається залякати вас, щоб ви зателефонували шахраям', ok: true, why: 'Саме так. Справжні попередження ніколи не показують номер для дзвінка. Не телефонуйте й нічого не клацайте на сторінці.'},
            {t: 'Так, швидко зателефонувати за номером', why: 'Ніколи не телефонуйте. Це фальшива сторінка. «Служба підтримки» спробує отримати контроль над вашим комп\'ютером і грошима.'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: 'Сторінка заповнила весь екран, щоб ви не бачили, як її закрити. Натисніть клавішу <strong>Esc</strong> (угорі ліворуч на клавіатурі), щоб вийти з повноекранного режиму.',
         hints: {'call-btn': 'Ні в якому разі! Натисніть клавішу Esc.', 'fake-close': 'Кнопки на сторінці можуть бути пасткою. Натомість натисніть клавішу Esc на клавіатурі.'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: 'Тепер ви бачите браузер. <strong>Закрийте вкладку</strong> за допомогою ⟦x⟧.',
         hints: {'call-btn': 'Нічого не клацайте на сторінці. Закрийте вкладку за допомогою ⟦x⟧.', 'fake-close': 'Це частина шахрайської сторінки. Скористайтеся ⟦x⟧ на самій вкладці.'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: 'Вона намагається вас утримати. <strong>Клацніть «Залишити».</strong>', hints: {stay: 'Клацніть «Залишити».'}},
        {screen: c => scareware(os, c), question: {q: 'А якщо вона зовсім не закривається?', options: [
            {t: os === 'windows' ? 'Натиснути Ctrl + Shift + Esc, щоб відкрити Диспетчер завдань, вибрати браузер і клацнути «Зняти завдання»' : os === 'mac' ? 'Натиснути ⟦command⟧ Cmd + Option + Esc і примусово завершити браузер' : 'Клацнути браузер на панелі правою кнопкою й вибрати «Закрити» або перезапустити комп\'ютер',
             ok: true, why: 'Так. Коли знову відкриєте браузер, не дозволяйте йому відновлювати старі сторінки. Перезапуск комп\'ютера теж допомагає.'},
            {t: 'Зателефонувати за номером, щоб отримати допомогу із закриттям', why: 'Ніколи не телефонуйте. ' + (os === 'windows' ? 'Скористайтеся Ctrl + Shift + Esc (Диспетчер завдань), щоб закрити браузер.' : os === 'mac' ? 'Скористайтеся ⟦command⟧ Cmd + Option + Esc, щоб примусово завершити.' : 'Закрийте браузер із панелі або перезапустіть.')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>Чудово!</strong> Ваш комп\'ютер ніколи не був заражений: це була лише вебсторінка. Якщо ви таки зателефонували за таким номером, зв\'яжіться зі своїм банком і змініть паролі з іншого пристрою.'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Безпека Windows', `<div class="aif"><h3>Захист від вірусів і загроз</h3><p class="mj">⟦check⟧ Поточних загроз немає</p>
                <p class="cf">Останнє сканування: ${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">Триває швидке сканування… перевірено 12 840 файлів</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ Захист від вірусів</span><span>⟦check⟧ Брандмауер</span><span>⟦check⟧ Керування програмами та браузером</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, 'Налаштування брандмауера', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ Брандмауер увімкнено</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'У Windows є вбудований безкоштовний антивірус під назвою <strong>Безпека Windows</strong>. Перевіримо, чи він працює. <strong>Клацніть «Пуск».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>Клацніть «Параметри».</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>Клацніть «Конфіденційність і безпека»</strong> ліворуч.'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>Клацніть «Безпека Windows».</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: 'Зелені галочки означають, що ви захищені. Для спокою <strong>клацніть «Швидке сканування»</strong>.'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: 'Чи потрібно платити ще за один антивірус?', options: [
            {t: 'Ні. Безпеки Windows достатньо для більшості людей, а два антивіруси можуть сповільнити комп\'ютер', ok: true, why: 'Ні. Оновлюйте Windows і тримайте Безпеку Windows увімкненою. Платні часто додають лише спливаючі вікна й підписки.'},
            {t: 'Так, чим більше, тим краще', why: 'Дві антивірусні програми можуть конфліктувати й сповільнювати роботу. Безпеки Windows достатньо для більшості людей.'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'На Mac є вбудований безкоштовний захист, який у фоні перевіряє програми й файли. Перевіримо одне налаштування. <strong>Клацніть меню Apple</strong> (логотип).'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>Клацніть «Системні параметри…»</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>Клацніть «Конфіденційність і безпека»</strong> ліворуч.'},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Вибрано «Дозволяти програми з App Store та відомих розробників». Чи слід це змінювати?', options: [
            {t: 'Ні, залишити. Це блокує програми від невідомих розробників', ok: true, why: 'Ні. Якщо сайт каже змінити це, щоб щось встановити, це серйозна ознака небезпеки.'},
            {t: 'Так, дозволити програми звідусіль', why: 'Залиште як є. Це не дає запускати програми від невідомих розробників. Якщо сайт просить це змінити, це ознака небезпеки.'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: 'Системні параметри', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Чи потрібно купувати антивірус для Mac?', options: [
            {t: 'Більшості людей ні. Підтримуйте систему в актуальному стані й встановлюйте програми лише з надійних джерел', ok: true, why: 'Ні. Оновлення й вбудований захист роблять свою справу. Спливаючі вікна про те, що ваш Mac заражений, — це шахрайство.'},
            {t: 'Так, того, що запропонує спливаюче вікно', why: 'Спливаючі вікна з антивірусом для Mac зазвичай є шахрайством. Краще оновлюйте свій Mac.'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'У Linux Mint є вбудований <strong>брандмауер</strong>, який блокує небажані з\'єднання. Він вимкнений, поки ви його не ввімкнете. <strong>Клацніть «Меню».</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>Клацніть «Брандмауер».</strong> <em>(Знайдіть у Меню слово «брандмауер», якщо його не видно.)</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>Клацніть перемикач «Стан»</strong>, щоб увімкнути брандмауер.'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: 'Що ще захищає Linux Mint?', options: [
            {t: 'Установлення оновлень, коли на щиті з\'являється крапка, і програми з Менеджера програмного забезпечення', ok: true, why: 'Так. І звичайні правила: будьте обережні з посиланнями в листах і спливаючими вікнами.'},
            {t: 'Більше нічого не потрібно', why: 'Продовжуйте встановлювати оновлення й беріть програми з Менеджера програмного забезпечення. Шахрайство в листах і на сайтах нікуди не зникає.'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>Чудово!</strong> Вбудований захист вашого комп\'ютера ввімкнено. Решту роблять оновлення, обережність із посиланнями та встановлення лише з надійних джерел.'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Доставка посилок</strong><span>Ми вас не застали: призначте доставку знову сьогодні</span></button>
            <div class="lx"><strong>Sarah</strong><span>Фото з неділі</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>Суботня прогулянка</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Доставка посилок</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>Ми намагалися доставити вашу посилку сьогодні, але вдома нікого не було. Для повторної доставки потрібен збір £1.45.</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">Призначити доставку знову</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ Повідомити про фішинг</button><button type="button" data-tap="reply">Відповісти</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, 'Пошта', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ Повідомлено й переміщено до спаму</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: 'Ось ваш лист у браузері. <strong>Відкрийте лист «Доставка посилок».</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: 'На комп\'ютері можна перевірити, куди насправді веде посилання, <strong>не клацаючи його</strong>. <strong>Наведіть мишу на «Призначити доставку знову»</strong> і тримайте нерухомо. <em>(На сенсорному екрані натисніть і утримуйте.)</em>',
         hints: {'click-link': 'Не клацайте! Просто тримайте вказівник миші над ним.'}, hint: 'Тримайте вказівник миші над синім посиланням, не клацаючи.'},
        {screen: c => webmail(os, c), question: {q: 'Справжня адреса з\'являється внизу: parcel-redelivery.example.top. Це безпечно?', options: [
            {t: 'Ні. Це не сайт справжньої служби доставки, і вони хочуть збір', ok: true, why: 'Ні. Кур\'єри не беруть невеликих зборів через лист чи SMS. Справжня адреса видає шахрайство.'},
            {t: 'Так, там написано «parcel»', why: 'Будь-хто може вписати «parcel» у вебадресу. Це не справжній кур\'єр, а збір і є шахрайством.'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>Клацніть «Повідомити про фішинг».</strong> Шахрайські листи також можна пересилати на report@phishing.gov.uk.', hints: {reply: 'Ніколи не відповідайте шахраям. Клацніть «Повідомити про фішинг».', 'click-link': 'Не клацайте посилання! Краще повідомте про нього.'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>Чудово!</strong> Наведіть мишу, перш ніж клацати: якщо адреса не збігається з компанією, не клацайте.'},
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
        '*#06#': 'IMEI: 35 209900 176148 1 (навчальний номер). Це справжній код, щоб знайти IMEI вашого телефона.',
        '999': 'Це навчальний телефон, тож він не може набрати 999. У справжній екстреній ситуації телефонуйте на 999 або 112.',
        '112': 'Це навчальний телефон, тож він не може набрати 112. 112 працює так само, як 999, у Великій Британії та по всій Європі.',
        '159': '159 безпечно з\'єднує вас із вашим банком. Скористайтеся ним, якщо дзвінок про ваші гроші вас турбує.',
        '7726': '7726 — це номер, на який пересилають шахрайські SMS. На старих клавіатурах телефонів він складається в слово «SPAM»!',
        '123': 'speaking-clock',
        '1471': 'Номер 07700 900842 телефонував сьогодні об 11:20. (Практика. 1471 повідомляє, хто востаннє телефонував на ваш стаціонарний.)',
        '01189998819991197253': 'Це номер екстрених служб із серіалу The IT Crowd. А ви пробували вимкнути й увімкнути знову?',
        '101': '101 — номер поліції для справ, які не є екстреними.',
        '111': '111 — допомога NHS, коли це термінове, але не екстрене.',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, 'Телефон', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">Введіть номер</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['Мама', '#f472b6', [['them', 'Я думав(ла), що LOL означає «багато любові» (lots of love). Я додаю це до всього!'], ['them', 'То ось чому твоя тітка не відповідає?'], ['them', 'Надіслано з мого iPad']]],
        ['Невідомий', '#94a3b8', [['them', 'Вітаємо! Ви виграли БЕЗКОШТОВНИЙ телефон. Клацніть тут, щоб отримати: prize-winner.example'], ['note', 'Це шахрайство. Не торкайтеся посилання: перешліть його на 7726, а потім видаліть.']]],
        ['Sarah', '#a78bfa', [['them', 'Тато вчиться користуватися емодзі 😂'], ['them', 'Він надіслав мені баклажан і написав «на вечерю сьогодні?» 🍆']]],
        ['Стоматолог', '#38bdf8', [['them', 'Нагадування: ваш прийом у вівторок о 10:30. Відповідайте Y для підтвердження.']]],
    ];
    const MUM_REPLIES = ['Хто це?', 'Зателефонуй мені, я не можу читати SMS без окулярів', 'Чудово! 👍', 'Моє останнє повідомлення дійшло? Його помилково отримав кіт.', 'Надіслано з мого iPad', 'Добре, цілую xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, 'Повідомлення', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? 'Чайка знову за своє' : 'Фото', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">Спіймана на гарячому на набережній Bridlington. Картоплю фрі не повернули.</p>' : ''}`);
            return;
        }
        phOpen(screen, p, 'Фото', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, 'Годинник', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? 'Холодно, місцями сніг' : 'Місцями сонячно, вітряно'}</p>
            <div class="ajf">${[['Пт', '⟦cloud-rain⟧', '11°'], ['Сб', '⟦wind⟧', '10°'], ['Нд', '⟦sun⟧', '14°'], ['Пн', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">Попередження про чайок: <strong>високе</strong>. Бережіть картоплю фрі.</p></div>`);
    }
    const MAP_EGGS = {narnia: 'Крізь шафу, а потім ідіть далі повз ліхтар.', home: 'Немає місця краще за дім. 🏠', 'місяць': '238 855 миль. Рух вільний.',
        chips: 'Найближча закусочна з картоплею фрі: будь-де на набережній Bridlington. 🍟', 'north pole': 'Майстерня Санти. Зачинено до грудня. 🎅', bridlington: 'Bridlington, East Riding of Yorkshire. Чудове місце!',
        'flamborough': 'Flamborough Head: маяк, скелі й тупики. 🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `«${inp.value.trim()}»: ця навчальна карта знає лише кілька місць. Спробуйте Bridlington, Flamborough або Narnia.` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, 'Налаштування', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? 'Авіарежим' : 'Авіарежим', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', 'Bluetooth', st.bt)}</div>
            <div class="lq">${row('dark', 'Темний режим', st.dark)}${row('dnd', 'Не турбувати', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? 'Про пристрій' : 'Про телефон'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? 'Про пристрій' : 'Про телефон', `<div class="aic"><div class="lq">
            <div class="ho"><span>Назва</span><b>Телефон Margaret</b></div>
            <div class="ho"><span>Модель</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'Версія iOS' : 'Версія Android'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>Сховище</span><b>Багато місця для фото онуків</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>Серійний номер</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', 'Snake \'97', 'Класична гра зі старих мобільних телефонів.'], ['torch', '⟦flashlight⟧', 'Супер яскравий ліхтарик БЕЗКОШТОВНО', 'Містить рекламу · Покупки в застосунку'], ['knit', '⟦scissors⟧', 'Візерунки для в\'язання', 'Незабаром у цьому навчальному магазині.']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play Маркет', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? 'Відкрити' : (p === 'ios' ? 'Отримати' : 'Установити')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, 'Snake \'97', `<div class="akp"><div class="ahc"><span>Рахунок: <b class="ado">0</b></span><span>Найкращий: <b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">Торкніться напрямку (або скористайтеся стрілками), щоб почати</p>
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
                f.querySelector('.vy').textContent = `Гру завершено! Рахунок ${score}. Торкніться напрямку, щоб зіграти ще раз.`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', 'Авіарежим', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', 'Bluetooth', st.bt)}${t('dnd', '⟦moon⟧', 'Не турбувати', st.dnd)}${t('torch', '⟦flashlight⟧', 'Ліхтарик', st.torch)}${t('dark', '⟦sun-moon⟧', 'Темний режим', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? 'Проведіть угору, щоб закрити' : 'Закрити'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, 'Нові шпалери');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `«На третьому сигналі точний час буде ${t.getHours()} ${String(t.getMinutes()).padStart(2, '0')} і ${t.getSeconds()} секунд… біп, біп, біп.» (Старий говорячий годинник!)`; return; }
                msg.textContent = egg || (n ? 'Цей навчальний телефон не може робити справжні дзвінки. Спробуйте 123, 1471 або *#06#…' : 'Спершу введіть номер.');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: 'Надішліть, будь ласка, свої банківські дані, щоб отримати приз!!! (Це шахрайство. Заблокуйте цей номер.)'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: 'Дякуємо, ваш прийом підтверджено. 🦷'});
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
            case 'ph-mail': return phOpen(screen, p, 'Пошта', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = 'Пуск'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = 'Стоп'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = 'Пуск'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ Крем від сонця нанесено! Це практично Costa del Bridlington.'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ Ліхтарик увімкнено. (Світиться екран замість ліхтаря на задній панелі.)');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ Авіарежим увімкнено: без дзвінків, SMS і мобільного інтернету.' : 'Авіарежим вимкнено.');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, 'Шпалери змінено. Перейдіть на головний екран, щоб побачити!'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ Тепер ви розробник! (Справжній секрет Android: торкніться «Номер збірки» 7 разів.)' : st.build >= 3 ? `До статусу розробника вам залишилося кроків: ${7 - st.build}.` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>Дякуємо, що тренуєтеся!</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = 'Застосунок-ліхтарик вам не потрібен: він вбудований у швидкі налаштування телефона. Безкоштовні ліхтарики часто повні реклами або гірше!'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = 'Лише для вигляду в навчальному магазині.'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = 'Установлення…'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = 'Відкрити'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || 'Застосунок', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>Цей навчальний застосунок є частиною окремого уроку. Перегляньте безкоштовні курси, щоб спробувати його по-справжньому.</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ Ви знайшли секрет!');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? 'Дзвінок завершено' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === 'Невідомий' ? 'Абонент' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: 'Невідомий', number: '0161 496 0423', who: 'm', tag: 'Немає у ваших контактах',
         intro: 'Вам дзвонять. Цього номера немає у ваших контактах. <strong>Дайте відповідь</strong>, щоб потренуватися. <em>Збільште гучність, щоб почути абонента.</em>',
         lines: [
            {text: 'Добрий день, це Mark з відділу боротьби з шахрайством вашого банку. Ми помітили підозрілі платежі на вашому рахунку. Перш ніж продовжити, чи можете ви підтвердити своє повне ім\'я, дату народження та довгий номер на вашій банківській картці?',
             q: 'Абонент каже, що він із вашого банку. Що ви зробите?', options: [
                {t: 'Назвати дані, він же з банку', why: 'Банк, який телефонує вам, ніколи не попросить повний номер картки. Так шахраї отримують ваші дані.'},
                {t: 'Сказати, що передзвоните до банку на номер з картки, і покласти слухавку', ok: true, why: 'Саме так. Телефонуйте на номер на картці, якщо можна — з іншого телефона, або наберіть 159.'},
                {t: 'Попросити його довести, хто він', why: 'Шахраї звучать переконливо й часто вже знають частину ваших даних. Найбезпечніше — покласти слухавку й самому зателефонувати до банку.'}]},
            {text: 'Будь ласка, не кладіть слухавку! Злочинці прямо зараз виводять гроші з вашого рахунку. Вам потрібно перемістити все на безпечний рахунок, який я для вас створю. Зробити це треба протягом десяти хвилин.',
             q: 'Він каже, що це терміново і треба перемістити гроші. Що тепер?', options: [
                {t: 'Швидко перемістити гроші, поки не пізно', why: '«Безпечного рахунку» не існує. Ваш банк ніколи не попросить переказати гроші. Це і є шахрайство.'},
                {t: 'Покласти слухавку. Справжній банк ніколи не просить переказувати гроші на «безпечний рахунок»', ok: true, why: 'Так. Поспіх і «безпечний рахунок» видають шахраїв. Киньте слухавку й наберіть 159.'}]}],
         hang: 'Киньте слухавку червоною кнопкою.'},
        {letter: '?', color: '#64748b', name: 'Невідомий', number: '020 7946 0815', who: 'robot', tag: 'Немає у ваших контактах',
         intro: 'Ще один дзвінок. <strong>Дайте відповідь.</strong>',
         lines: [
            {text: 'Це автоматичне повідомлення від H M R C. На вас видано ордер на арешт за несплату податків. Щоб поговорити з офіцером, натисніть 1 зараз.',
             q: 'Записаний голос каже, що вас заарештують за податки. Що ви зробите?', options: [
                {t: 'Натиснути 1, щоб усе владнати', why: 'Натискання 1 з\'єднує вас із шахраями, які вимагатимуть оплати, часто подарунковими картками. HMRC ніколи не погрожує арештом у записаному повідомленні.'},
                {t: 'Покласти слухавку. HMRC не телефонує із погрозами арешту', ok: true, why: 'Правильно. HMRC спершу пише вам листа й ніколи не погрожує арештом по телефону.'}]}],
         hang: 'Киньте слухавку.'},
        {letter: '?', color: '#64748b', name: 'Невідомий', number: '0113 496 0332', who: 'm', tag: 'Немає у ваших контактах',
         intro: 'Знову ваш телефон. <strong>Дайте відповідь.</strong>',
         lines: [
            {text: 'Добрий день, я телефоную з технічного відділу Windows. Ваш комп\'ютер надсилає нам повідомлення про помилки, і на ньому дуже небезпечний вірус. Будь ласка, увімкніть комп\'ютер, і я допоможу це виправити.',
             q: 'Він каже, що на вашому комп\'ютері вірус. Що ви зробите?', options: [
                {t: 'Увімкнути комп\'ютер і виконувати його вказівки', why: 'Він попросив би вас установити програму, яка дає йому керувати вашим комп\'ютером, а потім попросив би гроші. Microsoft так не телефонує.'},
                {t: 'Покласти слухавку. Комп\'ютерні компанії не телефонують через віруси', ok: true, why: 'Саме так. Ніколи не пускайте абонента на свій комп\'ютер.'},
                {t: 'Пояснити, що у вас немає комп\'ютера', why: 'Пояснювати чи сперечатися не потрібно. Просто киньте слухавку.'}]}],
         hang: 'Киньте слухавку.'},
        {letter: '?', color: '#64748b', name: 'Невідомий', number: '0808 157 0190', who: 'f', tag: 'Немає у ваших контактах',
         intro: 'Ще один дзвінок. <strong>Дайте відповідь.</strong>',
         lines: [
            {text: 'Добрий день. На вашому акаунті онлайн-покупок розміщено замовлення нового iPhone вартістю дев\'ятсот дев\'яносто дев\'ять фунтів. Якщо ви не робили цього замовлення, натисніть 1, щоб скасувати його й поговорити з нашою командою.',
             q: 'Ви не замовляли iPhone. Що ви зробите?', options: [
                {t: 'Натиснути 1, щоб скасувати замовлення', why: 'Натискання 1 з\'єднує вас із шахраєм, який «поверне» вам гроші, попросивши ваші банківські дані або доступ до вашого комп\'ютера.'},
                {t: 'Покласти слухавку, а потім самому перевірити свій акаунт у застосунку чи на сайті', ok: true, why: 'Так. Якби замовлення справді було, ви б побачили його у своєму акаунті. Ніколи не користуйтеся номером чи кнопкою, які називає абонент.'}]}],
         hang: 'Киньте слухавку.'},
        {letter: 'S', color: '#16a34a', name: 'Кабінет лікаря', number: '01632 960211', who: 'f', tag: 'Збережено у ваших контактах',
         intro: 'Ще один дзвінок: цього разу з кабінету лікаря, збереженого у ваших контактах. <strong>Дайте відповідь.</strong>',
         lines: [
            {text: 'Добрий день, це Sue з кабінету лікаря. Просто нагадую, що ваше щеплення від грипу заплановано на вівторок о десятій годині. Вам нічого не потрібно робити. Якщо треба перенести, зателефонуйте нам на звичайний номер. До побачення!',
             q: 'Чи є цей дзвінок шахрайським?', options: [
                {t: 'Так: покласти слухавку й заблокувати номер', why: 'З цим усе гаразд! Вона нічого не просила, не поспішала вас і сказала користуватися звичайним номером.'},
                {t: 'Імовірно справжній: вона не просила ні грошей, ні даних і порадила телефонувати на звичайний номер', ok: true, why: 'Саме так. Справжні дзвінки не тиснуть на вас. Якщо ви в чомусь не впевнені, передзвоніть на номер, який у вас уже є.'}]}],
         hang: 'Дзвінок завершено. <strong>Торкніться червоної кнопки</strong>, щоб покласти слухавку.'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>Дзвінок ${n + 1} із ${SCAM_CALLS.length}.</strong> ${call.intro}`,
             hints: {decline: 'У реальному житті не відповідати на незнайомі номери цілком нормально! Для цієї практики торкніться зеленої кнопки, щоб відповісти.'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: 'Що з цього є ознакою шахрайського дзвінка?', options: [
            {t: 'Поспіх, погрози або прохання тримати це в таємниці', ok: true, why: 'Так. Тиск — найбільша ознака. Справжній абонент охоче дасть вам час подумати й передзвонити.'},
            {t: 'Абонент знає ваше ім\'я', why: 'Шахраї часто знають ваше ім\'я й навіть деякі дані рахунку. Саме по собі це не робить дзвінок справжнім.'},
            {t: 'Номер виглядає місцевим', why: 'Шахраї можуть показати на вашому екрані будь-який номер, навіть місцевий чи вашого банку. Не довіряйте номеру.'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>Чудово!</strong> Ви поклали слухавку чотирьом шахраям і розпізнали справжній дзвінок. Пам\'ятайте: якщо сумніваєтеся, киньте слухавку й передзвоніть на номер, якому довіряєте. Для банку набирайте 159.'},
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
            ios: ['iPhone', 'Виробник — Apple'], android: ['Android', 'Samsung, Google Pixel, Motorola та інші'],
            windows: ['Windows', 'Більшість ноутбуків і настільних ПК'], mac: ['Mac', 'Виробник — Apple: MacBook, iMac'], linux: ['Linux', 'Linux Mint, Ubuntu та інші'],
        };
        const notSure = isPC
            ? 'Подивіться на екран. У Windows унизу є кнопка «Пуск» (чотири маленькі квадрати). У Mac угорі ліворуч логотип Apple. У Linux Mint унизу ліворуч кнопка «Меню».'
            : 'На задній панелі iPhone є логотип Apple (надкушене яблуко). Якщо його немає, це майже напевно телефон Android.';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>Який ${isPC ? 'комп\'ютер ви використовуєте' : 'телефон у вас'}?</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>Не впевнені?</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>Покажіть, де</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ Почути ще раз</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">Крок назад</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>Змінити ${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">НАВЧАЛЬНИЙ ${isPC ? 'КОМП\'ЮТЕР' : 'ТЕЛЕФОН'}: не справжній. Нічого з того, що ви тут робите, нікуди не надсилається.</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? 'Вимкнути голос' : 'Увімкнути голос'; };
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
            showBtn.textContent = 'Повернутися до уроку';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = 'Покажіть, де';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? 'Готово!' : `Крок ${i + 1} із ${steps.length - 1}`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? 'Правильно!' : 'Не зовсім.'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">Продовжити</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">Спробувати ще раз</button>${pageNext
                ? `<button type="button" class="ap vb">Чудова робота! ${last ? 'Тепер завершіть курс' : 'Спробуйте наступний урок'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('Не зовсім. ' + (step.hint || 'Ще раз прочитайте інструкції.'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || 'Поки не зовсім. Ще раз прочитайте інструкції.';
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
            hint.textContent = (step.hints && step.hints[id]) || ('Не зовсім. ' + (step.hint || 'Ще раз прочитайте інструкції.'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || 'Застосунок';
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
                else hint.textContent = 'Клацніть правою кнопкою: натисніть праву кнопку миші. На трекпеді Mac клацніть двома пальцями. На сенсорному екрані натисніть і утримуйте.';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = 'Тримайте палець (або кнопку миші) натиснутим на цьому, доки щось не станеться.';
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
                showBtn.textContent = 'Покажіть, де';
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
