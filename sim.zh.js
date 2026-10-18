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

    function storeName(p) { return p === 'ios' ? 'App Store' : 'Play 商店'; }

    // opts.extra: more apps [id, label, background, icon]; opts.hold: app ids to press and hold instead of tap;
    // opts.pull: a strip at the top to "pull down" (Control Centre / quick settings); opts.removed: apps to leave out.
    function home(p, opts = {}) {
        const base = p === 'ios'
            ? [['phone', '电话', '#22c55e', ICON.phone], ['messages', '信息', '#22c55e', ICON.bubble], ['camera', '相机', '#6b7280', ICON.camera],
               ['photos', '照片', '#e5e7eb', ICON.photos], ['mail', '邮件', '#3b82f6', ICON.mail], ['clock', '时钟', '#111827', ICON.clock],
               ['weather', '天气', '#38bdf8', ICON.weather], ['maps', '地图', '#22c55e', ICON.map], ['settings', '设置', '#8e8e93', ICON.settings],
               ['store', 'App Store', 'linear-gradient(#1ea7fd,#0a6cf2)', ICON.storeIos]]
            : [['phone', '电话', '#2563eb', ICON.phone], ['messages', '信息', '#3b82f6', ICON.bubble], ['camera', '相机', '#6b7280', ICON.camera],
               ['photos', '照片', '#e5e7eb', ICON.photos], ['clock', '时钟', '#111827', ICON.clock], ['maps', '地图', '#16a34a', ICON.map],
               ['settings', '设置', '#475569', ICON.settings], ['weather', '天气', '#38bdf8', ICON.weather], ['mail', '电子邮件', '#ef4444', ICON.mail],
               ['store', 'Play 商店', 'linear-gradient(135deg,#10b981,#0ea5e9)', ICON.storeAndroid]];
        const apps = [...base, ...(opts.extra || [])].filter(a => !(opts.removed || []).includes(a[0]));
        const hold = opts.hold || [];
        const pull = opts.pull
            ? `<button type="button" class="vr" data-tap="pull-down" data-swipe="pull">${p === 'ios' ? '从右上角向下滑动 ⟦chevron-down⟧' : '从顶部向下滑动 ⟦chevron-down⟧'}</button>` : '';
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
                <div class="afi">今日</div>
                <div class="hp"><span>精选</span><strong>本周我们喜爱的 App</strong></div>
                <div class="hp alt"><span>入门</span><strong>为您的新 iPhone 准备的好点子</strong></div>
                <div class="ou">
                    <button type="button" data-tap="today" class="on">今日</button><button type="button" data-tap="games">游戏</button>
                    <button type="button" data-tap="apps">App</button><button type="button" data-tap="search-tab">${ICON.search}搜索</button>
                </div><div class="kh"></div></div>`;
        }
        return `<div class="cg ph-android">${statusBar(p)}
            <button type="button" class="gq" data-tap="search-bar">${ICON.search}<span>搜索 App 和游戏</span></button>
            <div class="tg"><span class="on">为您推荐</span><span>排行榜</span><span>儿童</span></div>
            <div class="hp"><span>为您推荐</span><strong>帮您起步的 App</strong></div>
            <div class="hp alt"><span>热门</span><strong>保持联系</strong></div>
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
        const btnLabel = p === 'ios' ? '获取' : '安装';
        const rows = [
            {id: 'fake1', name: 'WhatsUp Chat Free', dev: 'Fun Apps Ltd', rating: '3.9', ad: true, bg: '#f97316'},
            {id: 'real', name: 'WhatsApp Messenger', dev: 'WhatsApp Inc.', rating: '4.7', bg: WA_GREEN, note: p === 'android' ? '下载量超 50 亿' : '社交'},
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
                <div class="nh">${appIcon(WA_GREEN, ICON.chat)}<div class="kc"><strong>WhatsApp Messenger</strong><span>WhatsApp Inc. · 免费</span></div></div>
                <p class="agm">在您真正的 iPhone 上，可能需要连按两下侧边按钮、看着屏幕进行面容 ID 验证，或在这里输入您的 Apple 账户密码。</p>
                <button type="button" class="ce co" data-tap="sheet-install">安装</button>
                <button type="button" class="cp" data-tap="sheet-cancel">取消</button></div></div>` : ''}
            </div>`;
    }

    function waScreen(p, inner, opts = {}) {
        return `<div class="cg wd ph-${p}">${statusBar(p)}${inner}${opts.keys ? keyboard() : ''}
            ${p === 'android' ? '<div class="ki"></div>' : '<div class="kh"></div>'}</div>`;
    }

    function waWelcome(p) {
        return waScreen(p, `<div class="vg">
            <div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
            <h3>欢迎使用 WhatsApp</h3>
            <p>请阅读我们的<u>隐私政策</u>。点按“同意并继续”即表示接受<u>服务条款</u>。</p>
            <button type="button" class="ce ox" data-tap="agree">同意并继续</button></div>`);
    }

    function waNumber(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>输入您的手机号码</h3>
            <p>WhatsApp 需要验证您的手机号码。可能会产生运营商费用。</p>
            <div class="abt">英国 <span>▾</span></div>
            <div class="ady"><span class="ajd">+44</span>
                <button type="button" class="tk${ctx.number ? ' acc' : ''}" data-tap="number">${ctx.number ? NUMBER : '<span class="oo">phone number</span>'}</button></div>
            <button type="button" class="ce ox" data-tap="next">下一步</button></div>`, {keys: !ctx.number});
    }

    function waConfirm(p) {
        const ios = p === 'ios';
        return waNumber(p, {number: true}) +
            `<div class="gh"><div class="fn ${ios ? 'ios' : 'android'}">
                <p>这个号码对吗？</p><p><strong>+44 ${NUMBER}</strong></p>
                <div class="et"><button type="button" data-tap="edit">编辑</button><button type="button" data-tap="yes">${ios ? '是' : '好'}</button></div>
            </div></div>`;
    }

    function waCode(p, ctx) {
        const boxes = [...CODE].map((d, i) => `<span>${ctx.code ? d : ''}</span>`).join('');
        const notice = !ctx.code ? (p === 'android'
            ? `<button type="button" class="jp" data-tap="notif"><strong>Messages · now</strong><span>Your WhatsApp code: ${CODE.slice(0, 3)}-${CODE.slice(3)}. Don't share this code with others.</span></button>`
            : `<div class="jp ex"><strong>信息 · 现在</strong><span>您的 WhatsApp 验证码：${CODE.slice(0, 3)}-${CODE.slice(3)}。请勿将此验证码告诉别人。</span></div>`) : '';
        const autofill = !ctx.code && p === 'ios'
            ? `<div class="lf"><button type="button" data-tap="autofill"><small>From Messages</small><strong>${CODE}</strong></button></div>` : '';
        return waScreen(p, `${notice}<div class="ja${notice ? ' zh' : ''}">
            <h3>正在验证您的号码</h3>
            <p>正在等待自动识别通过短信发送到 <strong>+44 ${NUMBER}</strong> 的 6 位数验证码。</p>
            <div class="sa">${boxes}</div>
            <p class="fd">没收到验证码？</p></div>${autofill}`, {keys: !ctx.code});
    }

    function waPermission(p, what) {
        const text = what === 'contacts'
            ? ['“WhatsApp”想访问您的通讯录', '这样您就能看到哪些朋友在用 WhatsApp。', '允许 WhatsApp 访问您的通讯录吗？']
            : ['“WhatsApp”想给您发送通知', '这样有新消息时您就会知道。', '允许 WhatsApp 给您发送通知吗？'];
        const dialog = p === 'ios'
            ? `<div class="fn ios"><p><strong>${text[0]}</strong></p><p class="fd">${text[1]}</p>
                <div class="et"><button type="button" data-tap="deny">Don't Allow</button><button type="button" data-tap="allow">Allow</button></div></div>`
            : `<div class="fn android"><p><strong>${text[2]}</strong></p>
                <div class="et ahq"><button type="button" data-tap="allow">Allow</button><button type="button" data-tap="deny">Don't allow</button></div></div>`;
        return waCode(p, {code: true}) + `<div class="gh">${dialog}</div>`;
    }

    function waProfile(p, ctx) {
        return waScreen(p, `<div class="ja">
            <h3>个人资料信息</h3>
            <p>请输入您的名字，也可以添加一张头像照片。</p>
            <button type="button" class="zn" data-tap="photo" aria-label="Add a profile photo">${ICON.camera}</button>
            <label class="ahl"><span class="f">您的名字</span>
                <input type="text" data-input="name" maxlength="25" placeholder="Type your name here" value="${esc(ctx.name || '')}" autocomplete="off"></label>
            <button type="button" class="ce ox" data-tap="next">下一步</button></div>`, {keys: true});
    }

    function waChats(p, ctx) {
        const title = p === 'ios' ? '聊天' : 'WhatsApp';
        return waScreen(p, `<div class="hv ${p}"><strong>${title}</strong></div>
            <div class="zl">${appIcon(WA_GREEN, ICON.chat)}
            <h3>一切就绪${ctx.name ? ', ' + esc(ctx.name) : ''}！</h3>
            <p>您的聊天会显示在这里。点按新建聊天按钮，就可以给通讯录里的人发消息。</p></div>
            <span class="aim" aria-hidden="true">+</span>`);
    }

    const SCENARIOS = {
        'whatsapp-setup': (p) => {
            const store = storeName(p);
            const searchTarget = p === 'ios' ? 'search-tab' : 'search-bar';
            return [
                {screen: () => home(p), target: 'store',
                 say: `这是您手机的主屏幕。App 要从<strong>${store}</strong>下载。它是免费的，也是获取 App 的安全地方。<strong>点按 ${store}。</strong>`,
                 hint: `找到 ${store} 图标。${p === 'ios' ? "它是蓝色的，上面有一个白色的字母 A。" : "它是一个彩色三角形。"}`},
                {screen: () => storeHome(p), target: searchTarget,
                 say: p === 'ios' ? '现在您需要搜索 WhatsApp。<strong>点按右下角的“搜索”</strong>。' : '现在您需要搜索 WhatsApp。<strong>点按顶部的搜索栏</strong>。',
                 hint: p === 'ios' ? '“搜索”是右下角的放大镜。' : '搜索栏上写着“搜索 App 和游戏”。'},
                {screen: () => storeSearch(p), target: 'sugg-whatsapp-messenger',
                 say: "我们已经替您输入了 <em>whatsapp</em>。会出现一些建议。<strong>点按“whatsapp messenger”。</strong>",
                 hint: '点按写着“whatsapp messenger”的建议。'},
                {screen: c => results(p, c), target: p === 'ios' ? 'real-get' : 'real-get',
                 say: `当心：有些 App 会假冒 WhatsApp。真正的叫 <strong>WhatsApp Messenger</strong>，由 <strong>WhatsApp Inc.</strong> 开发，而且免费。<strong>点按真正那一个旁边的 ${p === 'ios' ? '获取' : '安装'}。</strong>`,
                 hints: {'fake1-get': '这是 Fun Apps Ltd 的“WhatsUp Chat Free”。它是山寨货，“广告”标签说明它是一则广告。请核对名称和开发者。',
                         'fake2-get': '这是 LuckyDev Studio 的“WA Messenger for Chat Pro”，是仿冒品。真正的是由 WhatsApp Inc. 开发的。'},
                 hint: '找到由“WhatsApp Inc.”开发的“WhatsApp Messenger”。'},
                ...(p === 'ios' ? [{screen: c => results(p, {...c, sheet: true}), target: 'sheet-install',
                    say: '您的 iPhone 在安装前会确认是您本人。在真正的 iPhone 上，您可能会用<strong>面容 ID</strong>、<strong>指纹</strong>（触控 ID）或 <strong>Apple 账户密码</strong>。在这里，只需<strong>点按“安装”。</strong>',
                    hints: {'sheet-cancel': '“取消”会中止下载。请点按“安装”。'}}] : []),
                {screen: c => results(p, {...c, installed: true}), wait: 1600, target: 'open',
                 say: `正在下载。完成后，按钮会变成<strong>打开</strong>。<strong>点按“打开”。</strong>`,
                 hint: '等按钮变成“打开”，然后点按它。'},
                {screen: () => waWelcome(p), target: 'agree',
                 say: 'WhatsApp 第一次打开。它会请您同意其条款。<strong>点按“同意并继续”。</strong>'},
                {screen: c => waNumber(p, c), target: 'number', action: c => { c.number = true; },
                 say: 'WhatsApp 使用您的手机号码，这样朋友们就能找到您。<strong>点按手机号码框</strong>，我们会帮您填入一个练习号码。'},
                {screen: c => waNumber(p, c), target: 'next',
                 say: `在真正的手机上，您会输入自己的手机号码。这里我们用的是一个虚构号码：<strong>07700 900123</strong>。<strong>点按“下一步”。</strong>`},
                {screen: () => waConfirm(p), target: 'yes',
                 say: `WhatsApp 会确认您输入得对不对。这个是对的，所以<strong>点按 ${p === 'ios' ? '是' : '好'}。</strong>`,
                 hints: {edit: `如果输错了，您就点按“编辑”。这个号码是对的，所以点按 ${p === 'ios' ? '是' : '好'}。`}},
                {screen: c => waCode(p, c), target: p === 'ios' ? 'autofill' : 'notif', action: c => { c.code = true; },
                 say: p === 'ios'
                    ? 'WhatsApp 会发一条带 6 位数验证码的短信，确认这个号码是您的。您的 iPhone 会主动帮您填入。<strong>点按键盘上方的验证码。</strong>'
                    : 'WhatsApp 会发一条带 6 位数验证码的短信，确认这个号码是您的。很多 Android 手机会自动填入。如果您的没有，<strong>请点按顶部的那条信息</strong>。'},
                {screen: c => waCode(p, c),
                 question: {q: '设置过程中，一位朋友给您发来消息：<em>“你好！我错发了一个 6 位数验证码给你，能发回给我吗？”</em>您会怎么做？',
                    options: [
                        {t: '发给他，他是朋友', why: '这是常见的诈骗。有人盗用了您朋友的账户，而这个验证码也会让他们拿下您的账户。'},
                        {t: '不发。任何人都不该索要它', ok: true, why: '没错。这个验证码就是您 WhatsApp 的钥匙。绝不要告诉任何人，即使是朋友，或自称来自 WhatsApp 的人。'},
                        {t: '只发前 3 位数字', why: '哪怕只是一部分验证码，也对骗子有帮助。一位都不要告诉别人。'}]}},
                {screen: () => waPermission(p, 'contacts'), target: 'allow',
                 say: 'WhatsApp 请求查看您的通讯录，这样才能告诉您哪些朋友在用 WhatsApp。<strong>点按“允许”。</strong>',
                 hints: {deny: '您可以选择不允许，但这样 WhatsApp 就没法显示朋友的名字。这次练习请点按“允许”。'}},
                {screen: () => waPermission(p, 'notifications'), target: 'allow',
                 say: '通知会在有消息时提醒您，即使 WhatsApp 没有打开。<strong>点按“允许”。</strong>',
                 hints: {deny: '没有通知，别人给您发消息时您就不会知道。这次练习请点按“允许”。'}},
                {screen: c => waProfile(p, c), target: 'next', free: ['photo'],
                 action: c => { c.name = (c.input.name || '').trim() || 'Pat'; },
                 say: '最后一步：朋友们看到的是您的名字。<strong>在框里输入您的名</strong>，然后<strong>点按“下一步”</strong>。（它只停留在这个页面上，不会发送到任何地方。）',
                 hints: {photo: '在真正的应用里，您可以现在选一张照片，也可以以后在“设置”里添加。这次先跳过：输入您的名字，然后点按“下一步”。'}},
                {screen: c => waChats(p, c), done: true,
                 say: '<strong>做得好，您已经设置好 WhatsApp 了！</strong>您的聊天会显示在这里。在接下来的课程里，您会发出第一条消息。'},
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
            const lockName = ctx.touch ? '触控 ID 与密码' : '面容 ID 与密码';
            const groups = [
                [['airplane', '飞行模式', '#f59e0b', '⟦plane⟧'], ['wifi', 'Wi-Fi', '#3b82f6', '⟦wifi⟧'], ['bluetooth', '蓝牙', '#3b82f6', '⟦bluetooth⟧'], ['mobile', '蜂窝网络', '#22c55e', '⟦antenna⟧']],
                [['notifications', '通知', '#ef4444', '⟦bell⟧'], ['sounds', '声音与触感', '#ec4899', '⟦volume-2⟧'], ['focus', '专注模式', '#6366f1', '⟦moon⟧']],
                [['general', '通用', '#8e8e93', '⟦settings⟧'], ['accessibility', '无障碍', '#3b82f6', '⟦person-standing⟧'], ['ai', 'Apple 智能与 Siri', '#a855f7', '⟦sparkles⟧'], ['display', '显示与亮度', '#3b82f6', '⟦sun⟧'],
                 ['lock', lockName, ctx.touch ? '#ef4444' : '#22c55e', ctx.touch ? '⟦fingerprint⟧' : '⟦scan-face⟧'], ['sos', '紧急 SOS', '#ef4444', '⟦siren⟧'],
                 ['privacy', '隐私与安全性', '#3b82f6', '⟦hand⟧'], ['battery', '电池', '#22c55e', '⟦battery-full⟧']],
                [['apps', 'App', '#6366f1', '⟦layout-grid⟧']],
            ];
            const account = `<div class="ge"><button type="button" class="cj account" data-tap="account">${setIcon('#94a3b8', 'M')}
                <span class="hf"><strong>Margaret Smith</strong><small>Apple 账户、iCloud 等</small></span><span class="ne">›</span></button></div>`;
            return `<div class="iw ios">${statusBar(p)}<div class="fr">
                <div class="aam">Settings</div>${account}
                ${groups.map(g => `<div class="ge">${g.map(([id, label, bg, l]) =>
                    `<button type="button" class="cj" data-tap="${id}">${setIcon(bg, l)}<span>${label}</span><span class="ne">›</span></button>`).join('')}</div>`).join('')}
                </div>${homeIndicator(p)}</div>`;
        }
        const rows = [['network', '网络和互联网', '移动网络、WLAN、热点'], ['devices', '已连接的设备', '蓝牙、配对'],
            ['apps', 'App', '最近使用的应用、默认应用'], ['notifications', '通知', '通知记录'], ['battery', '电池', '85%'], ['storage', '存储', '91% used'],
            ['sound', '声音和振动', '音量、触感'], ['display', '显示和触控', '深色主题、字号'],
            ['accessibility', '无障碍', '显示、互动、音频'], ['security', '安全和隐私', '应用安全、设备锁定、权限'],
            ['location', '位置信息', '开启'], ['safety', '安全和紧急情况', '紧急 SOS、医疗信息、警报'],
            ['google', 'Google', '服务和偏好设置'], ['system', '系统', '语言、时间、软件更新']];
        return `<div class="iw android">${statusBar(p)}<div class="fr">
            <div class="aam">Settings</div>
            <div class="uy">${ICON.search}<span>Search Settings</span></div>
            ${rows.map(([id, label, sub]) => `<button type="button" class="cj" data-tap="${id}">${setIcon('#e0e7ff', '<span class="ake"></span>')}
                <span class="hf"><strong>${label}</strong><small>${sub}</small></span></button>`).join('')}
            </div>${homeIndicator(p)}</div>`;
    }

    function iosLockPage(ctx) {
        const title = ctx.touch ? '触控 ID 与密码' : '面容 ID 与密码';
        const bio = ctx.touch
            ? `<div class="he">FINGERPRINTS</div><div class="ge">
                ${ctx.fingerDone ? '<div class="cj ex"><span>手指 1</span></div>' : ''}
                <button type="button" class="cj link" data-tap="add-finger">Add a Fingerprint…</button></div>`
            : `<div class="ge">${ctx.faceDone
                ? '<div class="cj ex"><span>还原面容 ID</span></div><div class="cj ex"><span>设置备用外观</span></div>'
                : '<button type="button" class="cj link" data-tap="setup-face">Set Up Face ID</button>'}</div>`;
        const unlockOn = ctx.touch ? ctx.fingerDone : ctx.faceDone;
        return `<div class="iw ios">${statusBar('ios')}<div class="fr">
            <div class="gw ios"><span class="pw">‹ Settings</span><strong>${title}</strong></div>
            <div class="he">USE ${ctx.touch ? '触控 ID' : '面容 ID'} FOR:</div>
            <div class="ge"><div class="cj ex"><span>iPhone Unlock</span><span class="ni${unlockOn ? ' on' : ''}"></span></div>
                <div class="cj ex"><span>iTunes &amp; App Store</span><span class="ni${unlockOn ? ' on' : ''}"></span></div></div>
            ${bio}
            <div class="ge">${ctx.passcodeSet
                ? '<div class="cj ex"><span>关闭密码</span></div><div class="cj ex"><span>更改密码</span></div>'
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

    const androidSecurity = () => androidList('安全和隐私', [
        ['device-unlock', '设备解锁', '屏幕锁定、人脸和指纹解锁'], ['app-security', '应用安全', '扫描应用中的有害行为'],
        ['theft', '防盗保护', '手机被盗时将其锁定'], ['privacy', '隐私', '权限、账户活动']]);
    const androidDeviceUnlock = ctx => androidList('设备解锁', [
        ['screen-lock', '屏幕锁定', ctx.passcodeSet ? 'PIN 码' : '无'], ['face-finger', '人脸和指纹解锁', ctx.faceDone || ctx.fingerDone ? '设置' : '设置后解锁更快']]);
    const androidFaceFinger = ctx => androidList('人脸和指纹解锁', [
        ['face-unlock', '人脸解锁', ctx.faceDone ? '已添加人脸' : '设置'], ['fingerprint-unlock', '指纹解锁', ctx.fingerDone ? '1 fingerprint' : '设置']]);

    function faceScan(p, ctx, first) {
        const doneText = p === 'ios' ? (first ? '第一次面容 ID 扫描完成。' : '面容 ID 现已设置好。') : '已添加人脸';
        const btn = p === 'ios' ? (first ? '继续' : '完成') : '完成';
        return `<div class="ib ${p}">${statusBar(p)}
            <div class="kb${ctx.busy ? ' afq' : ' xq'}"><span class="scan-face">${UI.face}</span></div>
            <p class="scan-text">${ctx.busy ? (p === 'ios' ? '缓慢转动头部，完成整个圆圈。' : '让脸保持在圆圈内，并慢慢转动头部。') : doneText}</p>
            ${ctx.busy ? '' : `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="${first ? 'continue' : 'done'}">${btn}</button>`}
            ${homeIndicator(p)}</div>`;
    }

    function fingerScreen(p, ctx, stage) {
        const total = stage === 'grip' ? 4 : 6;
        const pct = Math.round(((ctx.pos || 0) / total) * 100);
        const ready = ctx.full;
        const head = p === 'ios'
            ? (ready ? (stage === 'grip' ? '完成' : '调整握持方式') : (stage === 'grip' ? '调整握持方式' : '放上手指'))
            : (ready ? '已添加指纹' : '触摸传感器');
        const sub = p === 'ios'
            ? (ready ? (stage === 'grip' ? '现在可以用您的指纹解锁 iPhone 了。' : '现在把指尖的边缘放在主屏幕按钮上。')
                     : (stage === 'grip' ? '把指尖的边缘放在主屏幕按钮上。' : '反复抬起手指，再放在主屏幕按钮上。'))
            : (ready ? '现在可以用指纹解锁手机了。' : '触摸传感器，抬起，再触摸，直到指纹录满。');
        const sensor = p === 'ios'
            ? '<button type="button" class="sf" data-tap="sensor" aria-label="Home button (fingerprint sensor)"><span></span></button>'
            : `<button type="button" class="md" data-tap="sensor" aria-label="Fingerprint sensor">${UI.finger}</button>`;
        return `<div class="jk ${p}">${statusBar(p)}
            <div class="ig"><strong>${head}</strong><p>${sub}</p></div>
            <div class="ii" style="--fill:${ready ? 100 : pct}%"><span>${UI.finger}</span></div>
            ${ready ? `<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="continue">${p === 'ios' ? '继续' : '完成'}</button>` : sensor}
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
                 say: '密码、面容 ID 和触控 ID 都在<strong>设置</strong> App 里。<strong>点按“设置”</strong>（灰色齿轮图标）。',
                 hint: '“设置”是带齿轮的灰色图标。'},
                {screen: c => settingsList(p, c), target: 'lock',
                 say: `需要的话向下滚动列表，然后<strong>点按 ${ctx.touch ? '触控 ID 与密码' : '面容 ID 与密码'}</strong>。`,
                 hint: `在“显示与亮度”下面找“${ctx.touch ? '触控 ID 与密码' : '面容 ID 与密码'}”。`},
            ];
        }
        return [
            {screen: () => home(p), target: 'settings',
             say: '屏幕锁定、人脸解锁和指纹都在<strong>设置</strong> App 里。<strong>点按“设置”</strong>（齿轮图标）。',
             hint: '“设置”是带齿轮的图标。'},
            {screen: c => settingsList(p, c), target: 'security',
             say: '需要的话向下滚动，然后<strong>点按“安全和隐私”</strong>。<em>在三星手机上，它叫“安全和隐私”，里面再找“生物识别”或“锁定屏幕”。</em>',
             hint: '在列表靠下的位置找“安全和隐私”。'},
            {screen: () => androidSecurity(), target: 'device-unlock',
             say: '<strong>点按“设备解锁”。</strong>',
             hint: '它是第一个选项，“设备解锁”。'},
        ];
    }

    const enterExisting = (p, extraSay = '') => ({
        screen: c => codeScreen(p, c, p === 'ios' ? '输入密码' : '输入您的 PIN 码', p === 'ios' ? '' : '如需继续，请输入您的 PIN 码'),
        sequence: CODE_KEYS,
        say: `${extraSay}手机会先确认是您本人。<strong>请输入练习密码：${codeText}</strong>。<em>绝不要在网站上输入您真正的密码。</em>`,
        hint: `输入练习密码 ${codeText}，一次输入一个数字。`,
    });

    const safestQuestion = {
        q: '下面哪一个是<strong>最安全</strong>的密码？',
        options: [
            {t: '123456', why: '123456 是使用最多的密码，所以是小偷最先会试的几个之一。'},
            {t: '您的生日，比如 140352', why: '生日很容易查到，从社交媒体、贺卡或信件里都能看到。要避开有特别意义的日期。'},
            {t: '六个对别人毫无意义的数字', ok: true, why: '没错。不是日期、不成规律、也不重复的随机数字最难猜。'}]};

    // A scenario's starting state (e.g. the phone already has a passcode), merged into the engine's ctx.
    const withCtx = (steps, start) => Object.assign(steps, {start});

    SCENARIOS['passcode-setup'] = (p) => {
        const ctx = {};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                {screen: c => iosLockPage(c), target: 'passcode-on',
                 say: '这部手机还没有密码，所以任何人都能打开它。<strong>点按“打开密码”。</strong>',
                 hints: {stolen: '“被盗设备保护”会在第 4 课讲。先把密码打开。'}},
                {screen: c => codeScreen(p, c, '设定密码', '输入密码', '<p class="aeh">密码选项</p>'), sequence: CODE_KEYS,
                 say: `选 6 个您记得住的数字。这次练习请<strong>输入 ${codeText}</strong>。<em>请不要在这里输入您真正的密码。</em>`,
                 hint: `输入 ${codeText}，一次输入一个数字。`},
                {screen: c => codeScreen(p, c, '设定密码', '再次输入新密码'), sequence: CODE_KEYS,
                 say: `您的 iPhone 会再问一次，确保您没有输错。<strong>再次输入 ${codeText}。</strong>`,
                 hint: `再次输入 ${codeText}。`, action: c => { c.passcodeSet = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true}), question: safestQuestion},
                {screen: c => iosLockPage({...c, passcodeSet: true}), done: true,
                 say: '<strong>做得好，您的模拟手机现在有密码了！</strong>在真正的 iPhone 上，此时可能还会要求您输入 Apple 账户密码。'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'screen-lock',
             say: '屏幕锁定显示<strong>无</strong>，所以任何人都能打开这部手机。<strong>点按“屏幕锁定”。</strong>'},
            {screen: () => androidList('选择屏幕锁定方式', [['none', '无'], ['swipe', '滑动'], ['pattern', '图案'], ['pin', 'PIN 码'], ['password', '密码']]),
             target: 'pin', say: '有几种选择。<strong>PIN 码</strong>（数字）简单又安全。<strong>点按“PIN 码”。</strong>',
             hints: {none: '“无”意味着任何人都能打开您的手机。', swipe: '“滑动”只要一划就能打开手机，起不到任何保护作用。',
                     pattern: '手指在屏幕上留下的污迹会泄露图案，让人猜出来。PIN 码更安全。',
                     password: '密码也可以，但 PIN 码每天输入起来更快。这次练习请点按“PIN 码”。'}},
            {screen: c => codeScreen(p, c, '选择 PIN 码', 'PIN 码至少要有 4 位数字'), sequence: CODE_KEYS,
             say: `6 个数字比 4 个更安全。这次练习请<strong>输入 ${codeText}</strong>。<em>请不要在这里输入您真正的 PIN 码。</em>`,
             hint: `输入 ${codeText}，一次输入一个数字。`},
            {screen: c => codeScreen(p, {...c, full: true}, '选择 PIN 码', 'PIN 码至少要有 4 位数字', '<button type="button" class="ce dk bz" data-tap="next">Next</button>'),
             target: 'next', say: '<strong>点按“下一步”。</strong>'},
            {screen: c => codeScreen(p, c, '再次输入您的 PIN 码', ''), sequence: CODE_KEYS,
             say: `您的手机会再问一次，确保您没有输错。<strong>再次输入 ${codeText}。</strong>`, hint: `再次输入 ${codeText}。`},
            {screen: c => codeScreen(p, {...c, full: true}, '再次输入您的 PIN 码', '', '<button type="button" class="ce dk bz" data-tap="confirm">Confirm</button>'),
             target: 'confirm', say: '<strong>点按“确认”。</strong>', action: c => { c.passcodeSet = true; }},
            {screen: () => androidList('锁定屏幕上的通知', [['show-all', '显示所有通知内容'], ['hide-sensitive', '隐藏敏感内容'], ['dont-show', '完全不显示通知']], false),
             target: 'hide-sensitive',
             say: '手机会问您锁定屏幕上要显示哪些信息。<strong>隐藏敏感内容</strong>是不错的选择：您能看到来了消息，但看不到消息写了什么。<strong>点按它。</strong>',
             hints: {'show-all': '这样所有内容都会显示出来，包括银行发来的验证码，拿起您手机的任何人都能看到。请点按“隐藏敏感内容”。',
                     'dont-show': '这样也行，但来了消息您就看不到了。这次练习请点按“隐藏敏感内容”。'}},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), question: safestQuestion},
            {screen: c => androidDeviceUnlock({...c, passcodeSet: true}), done: true,
             say: '<strong>做得好，您的模拟手机现在有 PIN 码了！</strong>屏幕锁定现在显示为 PIN 码。'},
        ], ctx);
    };

    SCENARIOS['face-setup'] = (p) => {
        const ctx = {passcodeSet: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'setup-face', say: '<strong>点按“设置面容 ID”。</strong>'},
                {screen: () => `<div class="ib ios">${statusBar('ios')}<div class="ig"><strong>如何设置面容 ID</strong>
                    <p>首先，让您的脸位于相机取景框内。然后转动头部画圈，让手机看到您脸的各个角度。</p></div>
                    <div class="nz">${UI.face}</div><button type="button" class="ce co" data-tap="get-started">开始使用</button>${homeIndicator('ios')}</div>`,
                 target: 'get-started',
                 say: '把手机举在脸前，大约一臂远，就像自拍一样。<strong>点按“开始使用”。</strong>'},
                {screen: c => faceScan(p, c, true), wait: 2600, target: 'continue',
                 say: '在真正的 iPhone 上，接下来您要<strong>缓慢转动头部画圈</strong>，就像用鼻子画一个圆。扫描时圆环会逐渐填满。完成后，<strong>点按“继续”</strong>。',
                 hint: '等圆圈填满，然后点按“继续”。'},
                {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
                 say: '为了确保准确，它会再扫描一次。再次转动头部画圈。完成后，<strong>点按“完成”</strong>。',
                 hint: '等圆圈填满，然后点按“完成”。', action: c => { c.faceDone = true; }},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}),
                 question: {q: '一位朋友说要把<em>他的</em>脸也添加到您的手机里，“以防万一”。您怎么办？',
                    options: [
                        {t: '让他添加，挺方便的', why: '任何被设置了人脸的人都能打开您的手机，并在您的应用里批准付款。只设置您自己的脸。'},
                        {t: '拒绝。只有我的脸才能解锁我的手机', ok: true, why: '没错。如果您信任的人需要使用手机，请把密码告诉他，必要时之后再改掉。'}]}},
                {screen: c => iosLockPage({...c, passcodeSet: true, faceDone: true}), done: true,
                 say: '<strong>做得好，面容 ID 设置好了！</strong>现在您只要看一眼手机就能解锁，然后向上滑动。'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>点按“人脸和指纹解锁”。</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'face-unlock', say: '<strong>点按“人脸解锁”。</strong>',
             hints: {'fingerprint-unlock': '那是指纹，在第 3 课。现在请点按“人脸解锁”。'}},
            {screen: () => consent(p, '用您的脸解锁', '用您的脸解锁手机，并在应用里确认是您本人。您的脸只存放在这部手机里。', '我同意'),
             target: 'agree', say: '手机会说明它如何使用您的脸。<strong>点按“我同意”。</strong>',
             hints: {cancel: '“取消”会中止设置。请点按“我同意”继续。'}},
            {screen: c => faceScan(p, c, false), wait: 2600, target: 'done',
             say: '把手机举到与眼睛齐平的位置，大约一臂远。在真正的手机上，您要<strong>让脸保持在圆圈内，并慢慢转动头部</strong>。完成后，<strong>点按“完成”</strong>。',
             hint: '等圆圈填满，然后点按“完成”。', action: c => { c.faceDone = true; }},
            {screen: c => androidFaceFinger({...c, faceDone: true}),
             question: {q: '在很多 Android 手机上，人脸解锁不如指纹安全。这对您意味着什么？',
                options: [
                    {t: '什么都可以用，没问题', why: '在很多手机上，人脸解锁用的是普通摄像头，更容易被骗过。因此有些银行应用不接受它。'},
                    {t: '用它来解锁手机，银行方面如果要求，就用指纹或 PIN 码', ok: true, why: '没错。手机会告诉您人脸解锁能不能用于付款和银行应用。如果不能，就用指纹或 PIN 码。'}]}},
            {screen: c => androidFaceFinger({...c, faceDone: true}), done: true,
             say: '<strong>做得好，人脸解锁设置好了！</strong>现在您只要看一眼手机就能解锁。'},
        ], ctx);
    };

    SCENARIOS['fingerprint-setup'] = (p) => {
        const ctx = {passcodeSet: true, touch: true};
        if (p === 'ios') {
            return withCtx([
                ...openLockSettings(p, ctx),
                enterExisting(p),
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true}), target: 'add-finger', say: '<strong>点按“添加指纹…”</strong>'},
                {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
                 say: '触控 ID 用的是较旧 iPhone（比如 iPhone SE）正面的<strong>主屏幕按钮</strong>。<strong>点按模拟手机底部的主屏幕按钮，共 6 次</strong>，就像抬起手指再放下。',
                 hint: '点按模拟手机底部那个圆形的主屏幕按钮。'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: '现在需要录入指尖的边缘。<strong>点按“继续”。</strong>'},
                {screen: c => fingerScreen(p, c, 'grip'), sequence: Array(4).fill('sensor'),
                 say: '在真正的 iPhone 上，您要把手指的<strong>侧面和指尖</strong>放在按钮上。<strong>再点按主屏幕按钮 4 次。</strong>',
                 hint: '点按底部那个圆形的主屏幕按钮。'},
                {screen: c => fingerScreen(p, {...c, full: true}, 'grip'), target: 'continue', say: '全部完成。<strong>点按“继续”。</strong>', action: c => { c.fingerDone = true; }},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}),
                 question: {q: '先添加哪根手指最好？',
                    options: [
                        {t: '您拿手机时最常用来握持的拇指或手指', ok: true, why: '对。对于主屏幕按钮，通常是拇指。最多可以添加 5 根手指，所以两个大拇指都添加很值得。'},
                        {t: '任何手指都行，没关系', why: '任何手指都可以，但请选拿起手机时自然会放在按钮上的那根，通常是拇指。'}]}},
                {screen: c => iosLockPage({...c, touch: true, passcodeSet: true, fingerDone: true}), done: true,
                 say: '<strong>做得好，您的指纹设置好了！</strong>把手指放在主屏幕按钮上即可解锁。您可以用同样的方法添加更多手指。'},
            ], ctx);
        }
        return withCtx([
            ...openLockSettings(p, ctx),
            {screen: c => androidDeviceUnlock(c), target: 'face-finger', say: '<strong>点按“人脸和指纹解锁”。</strong>'},
            enterExisting(p),
            {screen: c => androidFaceFinger(c), target: 'fingerprint-unlock', say: '<strong>点按“指纹解锁”。</strong>',
             hints: {'face-unlock': '那是人脸解锁，在第 2 课。现在请点按“指纹解锁”。'}},
            {screen: () => consent(p, '用指纹解锁', '用您的指纹解锁手机，或在登录应用等场合确认是您本人。您的指纹只存放在这部手机里。', '我同意'),
             target: 'agree', say: '<strong>点按“我同意”。</strong>', hints: {cancel: '“取消”会中止设置。请点按“我同意”继续。'}},
            {screen: c => fingerScreen(p, c, 'main'), sequence: Array(6).fill('sensor'),
             say: '传感器可能在屏幕上、手机背面或电源键上，手机会告诉您它在哪里。这里它在屏幕上。<strong>点按传感器 6 次</strong>，就像抬起手指再放下。',
             hint: '点按屏幕靠下位置的圆形传感器。'},
            {screen: c => fingerScreen(p, {...c, full: true}, 'main'), target: 'continue', say: '您的指纹已录入。<strong>点按“完成”。</strong>', action: c => { c.fingerDone = true; }},
            {screen: c => androidFaceFinger({...c, fingerDone: true}),
             question: {q: '先添加哪根手指最好？',
                options: [
                    {t: '拿起手机时自然会碰到传感器的那根手指', ok: true, why: '对。传感器在背面的话，通常是食指；在屏幕上或侧面的话，通常是拇指。您可以添加不止一根。'},
                    {t: '任何手指都行，没关系', why: '任何手指都可以，但请选自然会落在传感器上的那根。这样解锁又快又方便。'}]}},
            {screen: c => androidFaceFinger({...c, fingerDone: true}), done: true,
             say: '<strong>做得好，您的指纹设置好了！</strong>触摸传感器即可解锁。您可以用同样的方法添加更多手指。'},
        ], ctx);
    };

    // ---------- WhatsApp: messages, calls and groups, staying safe ----------
    const PHOTOS = [['🌻', '花园里的向日葵', '#fde68a'], ['🐶', '沙发上的小狗', '#fecaca'], ['🏖️', '海滩上的一天', '#bae6fd'],
                    ['🎂', '一个生日蛋糕', '#fbcfe8'], ['🌅', '海上的日落', '#fed7aa'], ['🐈', '睡着的猫', '#ddd6fe']];
    const WA_PIN = ['3', '8', '2', '6', '0', '5'];  // practice two-step PIN
    const avatar = (letter, bg = '#94a3b8') => `<span class="lh" style="background:${bg}">${letter}</span>`;
    const ticks = state => `<span class="tm ${state || ''}" aria-label="${state === 'read' ? '已读' : state === 'sent' ? '已发送' : '已送达'}">${state === 'sent' ? '⟦check⟧' : '⟦check-check⟧'}</span>`;

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
            ...(ctx.unknown ? [{id: 'unknown', name: '+44 7700 900842', last: '妈，是我！换了新号码，旧手机坏了……', time: '11:02', unread: 1, letter: '?'}] : []),
            {id: 'family', name: '家人', last: 'Dave：谁带蛋糕？🎂', time: '09:12', unread: ctx.familyMuted ? 0 : 3, letter: 'F', bg: '#f59e0b', muted: ctx.familyMuted},
            {id: 'jean', name: 'Jean', last: '星期四见！', time: '昨天', letter: 'J', bg: '#a78bfa'},
            ...(ctx.sarahChat ? [{id: 'sarah', name: 'Sarah', last: '妈！😊', time: '10:24', letter: 'S', bg: '#f472b6'}] : []),
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
            <div class="hv ${p}"><strong>${p === 'ios' ? '新建聊天' : '选择联系人'}</strong></div>
            <div class="mu">${contacts.map(([id, name, bg]) => `<button type="button" class="lv" data-tap="contact-${id}">${avatar(name[0], bg)}
                <span class="gn"><strong>${name}</strong><small>Hey there! I am using WhatsApp.</small></span></button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waChat(p, ctx, who) {
        const people = {sarah: ['Sarah', '#f472b6', 'online'], family: ['家人', '#f59e0b', 'Dave、Jean、Sarah、您'], unknown: ['+44 7700 900842', '#94a3b8', '']};
        const [name, bg, sub] = people[who];
        const thread = (ctx.threads && ctx.threads[who]) || [];
        const bar = ctx.recording
            ? `<div class="rh adi"><span class="aha"></span><span>0:04 Recording…</span><button type="button" class="ic" data-tap="mic" aria-label="Send voice note">${UI.send}</button></div>`
            : `<div class="rh"><button type="button" class="fy" data-tap="attach" aria-label="${p === 'ios' ? '添加（加号）' : '附件（回形针）'}">${p === 'ios' ? UI.plus : UI.clip}</button>
                <label class="qe"><span class="f">Message</span><input type="text" data-input="msg" placeholder="Message" value="${esc((ctx.input && ctx.input.msg) || '')}" autocomplete="off"></label>
                <button type="button" class="fy" data-tap="camera" aria-label="Camera">${UI.camera}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button>
                <button type="button" class="alr" data-tap="mic" aria-label="Microphone (voice note)">${UI.mic}</button></div>`;
        return `<div class="cg wd ph-${p} ahj">${statusBar(p)}
            <div class="ri"><span class="ahi">‹</span>${avatar(name[0] === '+' ? '?' : name[0], bg)}
                <button type="button" class="nj" data-tap="group-info"><strong>${name}</strong><small>${sub}</small></button>
                <button type="button" class="fy" data-tap="video" aria-label="Video call">${UI.video}</button>
                <button type="button" class="fy" data-tap="voice" aria-label="Voice call">${UI.phone}</button></div>
            ${who === 'unknown' ? `<div class="lu"><p>这个号码不在您的通讯录里。</p><div><button type="button" data-tap="block">屏蔽</button><button type="button" data-tap="add-contact">添加</button></div></div>` : ''}
            <div class="gf">${thread.map(bubble).join('')}</div>
            ${who === 'unknown' ? '' : bar}
            ${ctx.sheet === 'attach' ? `<div class="ei"><div class="cv hs">
                <button type="button" data-tap="gallery"><span style="background:#7c3aed">⟦images⟧</span>${p === 'ios' ? '照片' : '图库'}</button>
                <button type="button" data-tap="att-camera"><span style="background:#ec4899">⟦camera⟧</span>Camera</button>
                <button type="button" data-tap="att-document"><span style="background:#6366f1">⟦file-text⟧</span>Document</button>
                <button type="button" data-tap="att-location"><span style="background:#10b981">⟦map-pin⟧</span>Location</button></div></div>` : ''}
            ${ctx.sheet === 'block' ? `<div class="gh"><div class="fn ${p === 'ios' ? 'ios' : 'android'}">
                <p><strong>屏蔽 +44 7700 900842？</strong></p><p class="fd">被屏蔽的联系人无法给您打电话或发消息。</p>
                <p class="fd">⟦square-check⟧ 向 WhatsApp 举报</p>
                <div class="et"><button type="button" data-tap="cancel">取消</button><button type="button" data-tap="confirm-block">屏蔽</button></div></div></div>` : ''}
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
            <div class="hv ${p}"><strong>${p === 'ios' ? '最近' : '图库'}</strong></div>
            <div class="vd">${PHOTOS.map((ph, n) => `<button type="button" data-tap="photo-${n}" style="background:${ph[2]}" aria-label="${ph[1]}">${ph[0]}</button>`).join('')}</div>
            ${homeIndicator(p)}</div>`;
    }

    function waCall(p, ctx) {
        if (ctx.busy) {
            return `<div class="cg aar ph-${p}">${statusBar(p)}<div class="fh">${avatar('S', '#f472b6')}<strong>Sarah</strong><small>正在响铃……</small></div>
                <div class="gd"><span class="ahu" aria-hidden="true">${UI.hangup}</span></div>${homeIndicator(p)}</div>`;
        }
        return `<div class="cg aar ph-${p}">${statusBar(p)}
            <div class="aay" role="img" aria-label="Sarah on video">👩</div>
            <div class="wj${ctx.flipped ? ' aga' : ''}" role="img" aria-label="Your camera">${ctx.flipped ? '🌿' : '🙂'}</div>
            <div class="wi"><strong>Sarah</strong><small>0:12</small></div>
            <div class="gd">
                <button type="button" data-tap="flip" aria-label="Flip camera">${UI.flip}</button>
                <button type="button" data-tap="video-off" aria-label="Turn camera off">${UI.video}</button>
                <button type="button" data-tap="mute" class="${ctx.muted ? 'on' : ''}" aria-label="${ctx.muted ? '取消静音' : '静音'}">${ctx.muted ? UI.micOff : UI.mic}</button>
                <button type="button" data-tap="end" class="ahu" aria-label="End call">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    function waGroupInfo(p, ctx) {
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="nk">${avatar('F', '#f59e0b')}<strong>Family</strong><small>Group · 4 members</small></div>
            <div class="mu">
                <button type="button" class="lv" data-tap="mute-group"><span class="gn"><strong>Mute notifications</strong><small>${ctx.familyMuted ? '已静音 1 周' : '关闭'}</small></span></button>
                <button type="button" class="lv" data-tap="media"><span class="gn"><strong>Media, links and docs</strong></span></button>
                <button type="button" class="lv lk" data-tap="exit-group"><span class="gn"><strong>Exit group</strong></span></button>
                <button type="button" class="lv lk" data-tap="report-group"><span class="gn"><strong>Report group</strong></span></button>
            </div>
            ${ctx.sheet === 'mute' ? `<div class="gh"><div class="fn android we"><p><strong>将通知静音…</strong></p>
                <button type="button" data-tap="mute-8h">8 小时</button><button type="button" data-tap="mute-week">1 周</button><button type="button" data-tap="mute-always">始终</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waSettings(p, page, ctx) {
        const pages = {
            settings: ['设置', [['account', '账户', '安全通知、更改号码'], ['privacy', '隐私', '屏蔽联系人、限时消息'],
                ['chats', '聊天', '主题、壁纸'], ['notifications', '通知', '消息、群组和通话铃声']]],
            account: ['账户', [['twostep', '两步验证', ctx.twoStep ? '开启' : '关闭'], ['change-number', '更改号码', ''], ['delete-account', '删除账户', '']]],
            privacy: ['隐私', [['last-seen', '最后上线时间和在线状态', '所有人'], ['profile-photo', '头像', '所有人'],
                ['groups', '群聊', ctx.groupsSetting || '所有人'], ['blocked', '已屏蔽的联系人', ctx.blocked ? '1' : '无']]],
        };
        const [title, rows] = pages[page];
        return `<div class="cg wd ph-${p} oy">${statusBar(p)}
            <div class="hv ${p}"><strong>${title}</strong></div>
            <div class="mu">${rows.map(([id, label, sub]) => `<button type="button" class="lv" data-tap="${id}"><span class="gn"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>
            ${ctx.sheet === 'groups' ? `<div class="gh"><div class="fn android we"><p><strong>谁可以把我加入群组</strong></p>
                <button type="button" data-tap="groups-everyone">所有人</button><button type="button" data-tap="groups-contacts">我的联系人</button>
                <button type="button" data-tap="groups-except">我的联系人，除了…</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    function waTwoStep(p, ctx, stage) {
        if (stage === 'intro') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>两步验证</h3><p>为了更安全，请开启两步验证，以后再用这个手机号码注册 WhatsApp 时就需要输入 PIN 码。</p>
                <button type="button" class="ce ox" data-tap="turn-on">开启</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'email') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><h3>添加电子邮箱地址</h3>
                <p>添加一个电子邮箱地址，这样忘记 PIN 码时可以重置。</p>
                <div class="tk ex">您的电子邮箱地址</div>
                <button type="button" class="ce ox" data-tap="email-next">下一步</button>
                <button type="button" class="cp wd" data-tap="skip">跳过</button></div>${homeIndicator(p)}</div>`;
        }
        if (stage === 'on') {
            return `<div class="cg wd ph-${p}">${statusBar(p)}<div class="ja"><div class="sb">${appIcon(WA_GREEN, ICON.chat)}</div>
                <h3>两步验证已开启</h3><p>如果您在新手机上设置 WhatsApp，会要求输入 PIN 码。</p>
                <button type="button" class="ce ox" data-tap="done">完成</button></div>${homeIndicator(p)}</div>`;
        }
        const filled = ctx.pos || 0;
        return `<div class="cg wd ph-${p} hw">${statusBar(p)}
            <div class="ig"><strong>${stage === 'pin' ? '创建 6 位数 PIN 码' : '确认您的 PIN 码'}</strong>
            <p>${stage === 'pin' ? '在新手机上设置 WhatsApp 时需要用到它。' : '再输入一遍同一个 PIN 码。'}</p></div>
            <div class="sa">${[0, 1, 2, 3, 4, 5].map(n => `<span>${n < filled ? '•' : ''}</span>`).join('')}</div>
            ${keypad(p)}${homeIndicator(p)}</div>`;
    }

    const pinKeys = WA_PIN.map(d => 'k' + d);
    const pinText = WA_PIN.join(' ');
    const addMsg = (c, who, m) => { c.threads = {...(c.threads || {})}; c.threads[who] = [...(c.threads[who] || []), m]; };

    SCENARIOS['whatsapp-messages'] = (p) => withCtx([
        {screen: c => waChatList(p, c), target: 'new-chat',
         say: p === 'ios' ? '这是您的聊天列表。要开始新聊天，<strong>请点按新建聊天按钮</strong>（右上角的铅笔图标）。'
                          : '这是您的聊天列表。要开始新聊天，<strong>请点按右下角绿色的 + 按钮</strong>。',
         hints: {'chat-family': '那会打开一个已有的聊天。请改为新建一个。', 'chat-jean': '那会打开一个已有的聊天。请改为新建一个。'}},
        {screen: () => waContacts(p), target: 'contact-sarah',
         say: 'WhatsApp 会显示您通讯录里也在用它的人。<strong>点按 Sarah。</strong>'},
        {screen: c => waChat(p, c, 'sarah'), target: 'send',
         require: c => ((c.input && c.input.msg) || '').trim().length > 0, requireHint: '先在输入框里输入消息，再点按发送箭头。',
         action: c => { addMsg(c, 'sarah', {me: true, text: c.input.msg.trim(), ticks: 'read', n: 1}); c.input.msg = ''; c.sarahChat = true;
                        addMsg(c, 'sarah', {text: '妈！😊 很高兴收到你的消息！', n: 2}); },
         say: '<strong>点按底部的消息框</strong>，<strong>输入一条简短的消息</strong>（比如“你好！”），然后<strong>点按发送箭头</strong> ⟦send-horizontal⟧。',
         hints: {mic: '麦克风是用来发语音留言的，这个后面会讲。先输入消息，再点按发送箭头。', attach: '那是用来发照片的，后面会讲。先输入消息，再点按发送。'}},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: 'Sarah 回复了！您的消息下面有<strong>两个蓝色对勾 ⟦check-check⟧</strong>。它们是什么意思？',
            options: [
                {t: '消息发送失败', why: '发送失败的消息会显示一个小时钟或红色警告。有对勾说明发送成功了。'},
                {t: 'Sarah 已经读了', ok: true, why: '对！一个灰色对勾表示已发送，两个灰色对勾表示已送达她的手机，两个蓝色对勾表示她已读。'},
                {t: '消息发了两次', why: '不是，它只发送了一次。两个蓝色对勾表示已被阅读。'}]}},
        {screen: c => waChat(p, c, 'sarah'), target: 'attach', action: c => { c.sheet = 'attach'; },
         say: `现在来发一张照片。<strong>点按消息框旁边的 ${p === 'ios' ? '+' : 'paperclip ⟦paperclip⟧'}</strong>。`,
         hints: {camera: '相机是拍一张新照片。要发已经拍好的照片，请点按 ' + (p === 'ios' ? '+' : 'paperclip') + '.'}},
        {screen: c => waChat(p, c, 'sarah'), target: 'gallery', action: c => { c.sheet = null; },
         say: `<strong>点按 ${p === 'ios' ? '照片' : '图库'}</strong>，从手机里的照片中选择。`},
        {screen: c => waGallery(p, c), target: 'photo-0', action: c => { c.picked = 0; },
         say: '这些是您手机里的（模拟）照片。<strong>点按向日葵那张</strong> 🌻。',
         hint: '点按有向日葵的那张照片。'},
        {screen: c => waGallery(p, c), target: 'send-photo',
         action: c => { addMsg(c, 'sarah', {me: true, photo: 0, text: (c.input.caption || '').trim(), ticks: 'read', n: 3}); c.picked = undefined; c.input.caption = '';
                        addMsg(c, 'sarah', {text: '真漂亮！🌻 是你花园里的吗？', n: 4}); },
         say: '您可以输入一段说明文字，也可以不输入。然后<strong>点按发送箭头</strong> ⟦send-horizontal⟧。'},
        {screen: c => waChat(p, c, 'sarah'), sequence: ['mic', 'mic'],
         action: c => { c.recording = false; addMsg(c, 'sarah', {me: true, voice: true, ticks: 'read', n: 5}); },
         say: '如果打字不方便，语音留言就很实用。在真正的手机上，您说话时要<strong>按住麦克风</strong> ⟦mic⟧，说完松手即可发送。这里请<strong>点按一次麦克风开始，再点按发送箭头发出</strong>。',
         hint: '点按麦克风，再点按发送箭头。'},
        {screen: c => waChat(p, c, 'sarah'), done: true,
         say: '<strong>做得好！</strong>您已经发出了一条消息、一张照片和一条语音留言。以后想回复 Sarah，随时打开 WhatsApp，点按她的聊天即可。'},
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
        {screen: c => waChatList(p, c), target: 'chat-sarah', say: '<strong>点按 Sarah 的聊天</strong>将其打开。'},
        {screen: c => waChat(p, c, 'sarah'), target: 'video',
         say: '聊天顶部有两个通话按钮：<strong>视频摄像头</strong>是视频通话，<strong>电话</strong>是语音通话。<strong>点按视频摄像头</strong> ⟦video⟧。',
         hints: {voice: '那是语音通话，没有视频。这次练习请点按视频摄像头。'}},
        {screen: c => waCall(p, c), wait: 2000, target: 'mute',
         say: '这会呼叫 Sarah 的手机，她接听后你们就能互相看到。如果您这边很吵，<strong>点按麦克风</strong> ⟦mic⟧把自己静音。',
         hint: '麦克风按钮在底部那一排里。', action: c => { c.muted = true; }},
        {screen: c => waCall(p, c), target: 'flip', action: c => { c.flipped = true; },
         say: '您已静音：Sarah 能看到您，但听不到您。想给她看东西，请<strong>点按翻转按钮</strong> ⟦switch-camera⟧，切换到手机背面的摄像头。',
         hints: {mute: '稍后再点按一次麦克风就能取消静音。现在先试试翻转按钮。'}},
        {screen: c => waCall(p, c), target: 'end',
         say: '现在 Sarah 能看到您手机对着的东西。结束后，<strong>点按红色按钮</strong>挂断通话。',
         action: c => { c.muted = false; c.flipped = false; }},
        {screen: c => waChat(p, c, 'sarah'),
         question: {q: '视频通话很费流量。怎样打最好？',
            options: [
                {t: '尽量在家里用 Wi-Fi 打', ok: true, why: '对。用 Wi-Fi 时，通话不会占用您的手机流量套餐，聊多久都不用花钱。'},
                {t: '没有区别', why: '用手机流量的话，长时间视频通话会很快用完您的流量套餐。尽量用 Wi-Fi 最好。'}]}},
        {screen: c => waChatList(p, c), target: 'chat-family',
         say: '现在来看群聊。“家人”群有很多新消息，通知一直在震动。<strong>点按“家人”群。</strong>'},
        {screen: c => waChat(p, c, 'family'), target: 'group-info',
         say: '要更改群的设置，<strong>请点按顶部的群名称</strong>。', hint: '点按屏幕顶部的“家人”二字。'},
        {screen: c => waGroupInfo(p, c), target: 'mute-group', action: c => { c.sheet = 'mute'; },
         say: '<strong>点按“静音通知”。</strong>您仍然会收到消息，但手机不会为每一条都震动。',
         hints: {'exit-group': '“退出群组”会彻底退出。静音更温和：您还在群里，只是不再震动。'}},
        {screen: c => waGroupInfo(p, c), target: 'mute-week', action: c => { c.sheet = null; c.familyMuted = true; },
         say: '选择静音多久。<strong>点按“1 周”。</strong>',
         hints: {'mute-8h': '8 小时也可以。这次练习请点按“1 周”。', 'mute-always': '“始终”也可以，但您可能会错过一些事。这次练习请点按“1 周”。'}},
        {screen: c => waGroupInfo(p, c), done: true,
         say: '<strong>做得好！</strong>您打了视频电话，把自己静音，翻转了摄像头，还把热闹的群静音了。您随时仍然可以阅读群里的消息。'},
    ], {input: {}, sarahChat: true, threads: {sarah: [{me: true, text: '你好！', ticks: 'read', n: 1}, {text: '妈！😊', n: 2}],
        family: [{from: 'Jean', text: '周日来我们家吃午饭？🍗', n: 1}, {from: 'Sarah', text: '好啊！', n: 2}, {from: 'Dave', text: '谁带蛋糕？🎂', n: 3}]}});

    SCENARIOS['whatsapp-safety'] = (p) => {
        const toSettings = p === 'ios'
            ? [{screen: c => waChatList(p, c), target: 'tab-settings', say: 'WhatsApp 自己的设置在应用里面。<strong>点按右下角的“设置”。</strong>',
                hints: {'chat-unknown': '那条消息我们稍后再处理。先点按右下角的“设置”。'}}]
            : [{screen: c => waChatList(p, c), target: 'menu', action: c => { c.menuOpen = true; },
                say: 'WhatsApp 自己的设置在应用里面。<strong>点按右上角的三个点 ⋮。</strong>',
                hints: {'chat-unknown': '那条消息我们稍后再处理。先点按右上角的三个点。'}},
               {screen: c => waChatList(p, c), target: 'menu-settings', action: c => { c.menuOpen = false; }, say: '<strong>点按“设置”。</strong>'}];
        return withCtx([
            ...toSettings,
            {screen: c => waSettings(p, 'settings', c), target: 'account', say: '<strong>点按“账户”。</strong>'},
            {screen: c => waSettings(p, 'account', c), target: 'twostep',
             say: '<strong>两步验证</strong>会加上一个 PIN 码，有人想在另一部手机上设置您的 WhatsApp 时就需要它。即使骗子拿到了您的 6 位数验证码，也进不去。<strong>点按“两步验证”。</strong>'},
            {screen: c => waTwoStep(p, c, 'intro'), target: 'turn-on', say: '<strong>点按“开启”。</strong>'},
            {screen: c => waTwoStep(p, c, 'pin'), sequence: pinKeys,
             say: `选一个 6 位数 PIN 码，要和手机密码不同。这次练习请<strong>输入 ${pinText}</strong>。<em>请不要在这里输入真正的 PIN 码。</em>`,
             hint: `输入练习 PIN 码 ${pinText}。`},
            {screen: c => waTwoStep(p, c, 'confirm'), sequence: pinKeys, say: `<strong>再次输入 ${pinText}</strong> 进行确认。`, hint: `再次输入 ${pinText}。`},
            {screen: c => waTwoStep(p, c, 'email'), target: 'email-next',
             say: '添加电子邮箱地址后，忘记 PIN 码时就可以重置。在您真正的手机上值得这样做。这里请<strong>点按“下一步”</strong>。',
             hints: {skip: '您可以跳过，但这样忘了 PIN 码就可能被锁在外面。这次练习请点按“下一步”。'}},
            {screen: c => waTwoStep(p, c, 'on'), target: 'done', action: c => { c.twoStep = true; }, say: '两步验证已开启。<strong>点按“完成”。</strong>'},
            {screen: c => waSettings(p, 'account', c),
             question: {q: '一条消息自称来自<em>“WhatsApp 客服”</em>，要您提供两步验证 PIN 码来“验证您的账户”。您怎么办？',
                options: [
                    {t: '发给他们，这是 WhatsApp 发来的', why: 'WhatsApp 绝不会给您发消息索要 PIN 码或验证码。这是骗子想接管您的账户。'},
                    {t: '不要回复，并屏蔽、举报他们', ok: true, why: '没错。任何人，包括 WhatsApp，都不该索要您的 PIN 码或 6 位数验证码。'}]}},
            {screen: c => waSettings(p, 'privacy', c), target: 'groups',
             say: '接下来，阻止陌生人把您拉进群。这在<strong>隐私</strong>里。<strong>点按“群组”。</strong>'},
            {screen: c => waSettings(p, 'privacy', {...c, sheet: 'groups'}), target: 'groups-contacts', action: c => { c.groupsSetting = '我的联系人'; },
             say: '“所有人”意味着任何陌生人都能把您拉进群，骗子就是这样做的。<strong>点按“我的联系人”。</strong>',
             hints: {'groups-everyone': '选“所有人”会让陌生人能把您拉进群，包括诈骗群。请点按“我的联系人”。'}},
            {screen: c => waChatList(p, {...c, unknown: true}), target: 'chat-unknown',
             say: '一个不认识的号码发来一条消息：“妈，是我！换了新号码……”这就是“妈，是我”诈骗。<strong>点按它打开。</strong>'},
            {screen: c => waChat(p, {...c, threads: {unknown: [{text: '妈，是我！换了新号码，旧手机坏了。你能帮我付一笔账单吗？明天就还你 x', n: 1}]}}, 'unknown'),
             target: 'block', action: c => { c.sheet = 'block'; },
             say: '不要回复。WhatsApp 发现这个号码不在您的通讯录里。<strong>点按“屏蔽”。</strong>',
             hints: {'add-contact': '不要把骗子加进通讯录。请点按“屏蔽”。', video: '不要回拨给他们。请点按“屏蔽”。', voice: '不要回拨给他们。请点按“屏蔽”。'}},
            {screen: c => waChat(p, {...c, sheet: 'block', threads: {unknown: [{text: '妈，是我！换了新号码，旧手机坏了。你能帮我付一笔账单吗？明天就还你 x', n: 1}]}}, 'unknown'),
             target: 'confirm-block', action: c => { c.blocked = true; },
             say: '“向 WhatsApp 举报”已勾选，这有助于 WhatsApp 制止骗子。<strong>点按“屏蔽”。</strong>',
             hints: {cancel: '“取消”会让他们仍能给您发消息。请点按“屏蔽”。'}},
            {screen: c => waSettings(p, 'privacy', c), done: true,
             say: '<strong>做得好！</strong>您开启了两步验证，阻止了陌生人把您拉进群，还屏蔽并举报了一个骗子。如果您对家人发来的消息有任何怀疑，请打您已有的号码联系他们。'},
        ], {input: {}});
    };

    // ======================================================================================
    // Shared building blocks for the bigger set of courses
    // ======================================================================================
    const tog = on => `<span class="ni${on ? ' on' : ''}"></span>`;
    const backBtn = (p, label = '返回') => `<button type="button" class="kk ${p}" data-tap="back">${p === 'ios' ? '‹ ' + label : '←'}</button>`;

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
            <div class="gw ${p}">${opts.noBack ? '' : backBtn(p, opts.back || '返回')}<strong>${title}</strong></div>
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
        const slider = `<div class="ail"><p class="adv" style="font-size:${size}px">支持动态字体的 App 会按您喜欢的阅读字号调整。</p>
            <div class="rg"><button type="button" data-tap="smaller" aria-label="Smaller text">A</button>
            <span class="zg"><span style="width:${Math.min(100, 30 + 18 * ((ctx.size || 0) + (ctx.pos || 0)))}%"></span></span>
            <button type="button" data-tap="bigger" class="tq" aria-label="Bigger text">A</button></div></div>`;
        if (p === 'ios') return list(p, '文字大小', [], {top: slider, back: '显示'});
        return list(p, '显示大小和文字', [{caption: '字体大小'}, {id: 'bold', label: '粗体文本', toggle: !!ctx.bold}], {top: slider});
    }

    SCENARIOS['bigger-text'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '文字大小在<strong>设置</strong> App 里。<strong>点按“设置”。</strong>', hint: '“设置”是带齿轮的灰色图标。'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>点按“显示与亮度”。</strong>', hint: '它在第三组，“辅助功能”的下面。'},
        {screen: c => list(p, '显示与亮度', [{caption: '外观'}, {label: '浅色', value: '⟦check⟧'}, {caption: '文字'}, {id: 'text-size', label: '文字大小'}, {id: 'bold', label: '粗体文本', toggle: !!c.bold}], {back: '设置'}),
         target: 'text-size', say: '<strong>点按“文字大小”。</strong>', hints: {bold: '“粗体文本”在后面。先点按“文字大小”。'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: '把滑块向右拖动，字就会变大。这里请<strong>点按大“A”两次</strong>，看着文字变大。', hint: '点按滑块右边的大“A”。'},
        {screen: c => textSizePage(p, c), target: 'back', say: '读起来轻松多了！现在<strong>点按顶部的“‹ 显示”</strong>返回。'},
        {screen: c => list(p, '显示与亮度', [{caption: '外观'}, {label: '浅色', value: '⟦check⟧'}, {caption: '文字'}, {id: 'text-size', label: '文字大小'}, {id: 'bold', label: '粗体文本', toggle: !!c.bold}], {back: '设置'}),
         target: 'bold', action: c => { c.bold = true; }, say: '<strong>粗体文本</strong>会让字更粗更清晰。<strong>点按它来开启。</strong>'},
        {screen: c => list(p, '显示与亮度', [{caption: '文字'}, {label: '文字大小'}, {label: '粗体文本', toggle: true}], {back: '设置'}),
         question: {q: '即使调到最大，字还是太小？', options: [
            {t: '没有别的办法了', why: '还有办法！设置 > 辅助功能 > 显示与文字大小 > 更大字体，可以得到更大的字号。'},
            {t: '设置 > 辅助功能 > 显示与文字大小 > 更大字体', ok: true, why: '对。在那里开启“更大的辅助功能字号”，字会非常大。'}]}},
        {screen: c => list(p, '显示与亮度', [{caption: '文字'}, {label: '文字大小'}, {label: '粗体文本', toggle: true}], {back: '设置'}), done: true,
         say: '<strong>做得好！</strong>您的文字变得更大更粗了，在“设置”和大多数 App 里都是如此。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '文字大小在<strong>设置</strong> App 里。<strong>点按“设置”。</strong>', hint: '“设置”是带齿轮的图标。'},
        {screen: c => settingsList(p, c), target: 'display', say: '<strong>点按“显示和触控”。</strong><em>在三星手机上，是“显示”，再找“字体大小和样式”。</em>'},
        {screen: () => list(p, '显示和触控', [{id: 'dark', label: '深色主题', toggle: false}, {id: 'text-size', label: '显示大小和文字', sub: '字体大小、粗体文本'}, {id: 'brightness', label: '亮度级别', value: '70%'}]),
         target: 'text-size', say: '<strong>点按“显示大小和文字”。</strong>', hints: {dark: '深色主题改变的是颜色，不是大小。请点按“显示大小和文字”。'}},
        {screen: c => textSizePage(p, c), sequence: ['bigger', 'bigger'], action: c => { c.size = 2; },
         say: '把“字体大小”滑块向右拖动，字就会变大。这里请<strong>点按大“A”两次</strong>。', hint: '点按滑块右边的大“A”。'},
        {screen: c => textSizePage(p, c), target: 'bold', action: c => { c.bold = true; }, say: '<strong>粗体文本</strong>会让字更清晰。<strong>点按它来开启。</strong>'},
        {screen: c => textSizePage(p, c), question: {q: '即使调到最大，字还是太小？', options: [
            {t: '没有别的办法了', why: '也在同一页试试“显示大小”：它会让所有东西都变大，包括按钮和图标。'},
            {t: '把显示大小也调大', ok: true, why: '对。“显示大小”会放大屏幕上的所有东西，而不只是文字。'}]}},
        {screen: c => textSizePage(p, c), done: true, say: '<strong>做得好！</strong>您的文字变得更大更粗了，在“设置”和大多数 App 里都是如此。'},
    ], {size: 0});

    function controlCentre(p, ctx) {
        const dnd = !ctx.dndOff;
        const vol = Math.min(100, 30 + 20 * ((ctx.vol || 0) + (ctx.pos || 0)));
        const tiles = p === 'ios'
            ? `<div class="afy"><span class="hj on">⟦plane⟧</span><span class="hj on aav">Wi-Fi</span><span class="hj on aav">Bluetooth</span>
                <button type="button" class="hj ca${dnd ? ' 紫色背景上' : ''}" data-tap="dnd">⟦moon⟧ ${dnd ? '勿扰模式' : '专注模式'}</button>
                <div class="qs" aria-label="Volume"><span style="height:${vol}%"></span><em>⟦volume-2⟧</em></div>
                <span class="hj" aria-label="Torch">${UI.torch}</span><span class="hj">⟦timer⟧</span></div>`
            : `<div class="agz"><span class="or on">Internet</span><span class="or on">Bluetooth</span>
                <button type="button" class="or${dnd ? ' on' : ''}" data-tap="dnd">${dnd ? '勿扰模式 · 开启' : '勿扰模式 · 关闭'}</button>
                <span class="or">Torch</span></div>
                <div class="uv" aria-label="Volume"><em>⟦bell⟧</em><span><span style="width:${vol}%"></span></span></div>`;
        return `<div class="nm ${p}">${statusBar(p)}${tiles}
            <button type="button" class="jr" data-tap="vol-up" aria-label="Volume up button (on the side of the phone)">＋</button>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? '向上滑动以关闭' : '关闭'}</button>${homeIndicator(p)}</div>`;
    }

    SCENARIOS['volume-dnd'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}), target: 'pull-down',
         say: p === 'ios' ? '如果手机不响，可能是开着勿扰模式。快捷设置在<strong>控制中心</strong>里：<strong>从右上角向下滑动</strong>（或点按顶部的长条）。'
                          : '如果手机不响，可能是开着勿扰模式。<strong>从屏幕顶部向下滑动</strong>就能看到快捷设置（或点按顶部的长条）。',
         hints: {'pull-up': '换个方向滑：从顶部往下滑。', 'pull-left': '要向下滑，不是横着滑。', 'pull-right': '要向下滑，不是横着滑。', 'pull-down': ''},
         action: () => {}},
        {screen: c => controlCentre(p, c), target: 'dnd', action: c => { c.dndOff = true; },
         say: `月亮 ⟦moon⟧ 表示<strong>勿扰模式已开启</strong>，所以电话和消息都被静音了。<strong>点按它来关闭。</strong>`},
        {screen: c => controlCentre(p, c), sequence: ['vol-up', 'vol-up', 'vol-up'], action: c => { c.vol = 3; },
         say: '现在用<strong>手机侧面的音量键</strong>（上面那个）把音量调大。<strong>点按模拟手机边缘的 ＋ 3 次。</strong>',
         hint: '点按手机右侧边缘的 ＋ 按钮。'},
        {screen: c => controlCentre(p, c), question: p === 'ios'
            ? {q: '您的 iPhone 还是不响。还有什么可能？', options: [
                {t: '响铃/静音开关或操作按钮被设成了静音', ok: true, why: '对。很多 iPhone 在音量键上方有一个小开关：如果露出橙色，手机就处于静音。较新的机型改用操作按钮。'},
                {t: '手机坏了', why: '通常不是！先检查音量键上方的静音开关。'}]}
            : {q: '您按了音量键，但只改变了媒体音量。现在怎么办？', options: [
                {t: '点按音量条上的 ⋯ 或设置图标，查看铃声音量', ok: true, why: '对。音量键常常只改变媒体音量；点按音量条上的三个点才能调节铃声音量。'},
                {t: '放弃', why: '点按出现的音量条上的三个点 ⋯，然后把铃声音量调大。'}]}},
        {screen: c => controlCentre(p, c), done: true, say: '<strong>做得好！</strong>勿扰模式已关闭，音量也调大了，所以您能听到电话和消息。'},
    ], {});

    function magnifierScreen(p, ctx) {
        const zoom = 1 + 0.6 * ((ctx.zoom || 0) + (ctx.pos || 0));
        return `<div class="pp ${ctx.torch ? 'akh' : ''}${ctx.frozen ? ' xy' : ''}">${statusBar(p)}
            <div class="sx"><div class="ws" style="font-size:${(7 * zoom).toFixed(1)}px"><strong>扑热息痛 500mg</strong><br>每 4 至 6 小时服 1 至 2 片。<br>24 小时内不要超过 8 片。</div></div>
            <div class="qz"><button type="button" data-tap="zoom-out" aria-label="Zoom out">−</button><span class="aco"></span><button type="button" data-tap="zoom-in" aria-label="Zoom in">＋</button></div>
            <div class="hz"><button type="button" data-tap="torch" aria-label="Torch" class="${ctx.torch ? 'on' : ''}">${UI.torch}</button>
                <button type="button" class="zw" data-tap="freeze" aria-label="Freeze the picture"></button><span class="acn"></span></div>
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['magnifier'] = (p) => withCtx([
        {screen: () => homeWith(p, [['magnifier', '放大器', '#111827', ICON2.magnifier]]), target: 'magnifier',
         say: p === 'ios' ? '您的 iPhone 有一个<strong>放大器</strong> App。如果主屏幕上没有，请在屏幕中间向下滑动，输入“放大器”。<strong>点按“放大器”。</strong>'
                          : '很多 Android 手机有<strong>放大镜</strong> App。<em>三星手机上，它在快捷设置或“辅助功能”里。</em><strong>点按“放大镜”。</strong>',
         hint: '找一个带放大镜图案的黑色图标。'},
        {screen: c => magnifierScreen(p, c), sequence: ['zoom-in', 'zoom-in', 'zoom-in'], action: c => { c.zoom = 3; },
         say: '把手机对准一个很小的东西，比如这个药品标签。<strong>点按 ＋ 三次</strong>来放大（在真正的手机上可以拖动滑块）。', hint: '点按滑块右边的 ＋。'},
        {screen: c => magnifierScreen(p, c), target: 'torch', action: c => { c.torch = true; }, say: '光线暗的时候，手电筒会有帮助。<strong>点按手电筒</strong> ⟦flashlight⟧。'},
        {screen: c => magnifierScreen(p, c), target: 'freeze', action: c => { c.frozen = true; },
         say: '手有点抖？<strong>点按那个大圆按钮</strong>冻结画面，这样不用拿稳也能看清。'},
        {screen: c => magnifierScreen(p, c), question: {q: '放大器还有什么用处？', options: [
            {t: '看菜单、价格标签和信件上的小字', ok: true, why: '对，而且它一直在您口袋里。有些人把它放进控制中心或快捷设置，一点就能用。'},
            {t: '让电话声音更大', why: '那是音量键的作用。放大器是用来把小东西看得更清楚的。'}]}},
        {screen: c => magnifierScreen(p, c), done: true, say: '<strong>做得好！</strong>您现在会放大小字、打开补光，还会冻结画面了。'},
    ], {});

    function chatKeyboard(p, ctx, opts = {}) {
        const listening = ctx.busy;
        const text = ctx.dictated ? '周四咖啡早茶聚会见' : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Jean</strong></div>
            <div class="gf"><div class="dm them"><span>你周四来吗？☕</span><small>09:41</small></div></div>
            <div class="hn"><button type="button" class="rt" data-tap="box">${text ? esc(text) : '<span class="oo">短信</span>'}</button>
                <button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${opts.keys ? `<div class="mo yg">${listening ? '<p class="acm">⟦mic⟧ 正在聆听……请说话</p>' : ''}
                <div><span>q</span><span>w</span><span>e</span><span>r</span><span>t</span><span>y</span><span>u</span><span>i</span><span>o</span><span>p</span></div>
                <div><span>a</span><span>s</span><span>d</span><span>f</span><span>g</span><span>h</span><span>j</span><span>k</span><span>l</span></div>
                <div><span class="ca">space</span><button type="button" class="yb" data-tap="kb-mic" aria-label="Dictate (microphone)">${UI.mic}</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['voice-typing'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: '您可以用说话代替打字。<strong>打开“信息”。</strong>', hint: '“信息”是绿色的对话气泡。'},
        {screen: c => chatKeyboard(p, c), target: 'box', say: 'Jean 问起周四的事。<strong>点按底部的消息框。</strong>'},
        {screen: c => chatKeyboard(p, c, {keys: true}), target: 'kb-mic',
         say: '键盘出现了。<strong>点按键盘上的麦克风</strong> ⟦mic⟧，然后说出您的消息。', hint: '麦克风在键盘上，空格键旁边。'},
        {screen: c => chatKeyboard(p, {...c, dictated: !c.busy}, {keys: true}), wait: 2200, target: 'send', action: c => { c.dictated = true; },
         say: '在真正的手机上，您现在会说：<em>“周四咖啡早茶聚会见”</em>。您说话时文字会出现。检查一下，然后<strong>点按发送</strong> ⟦send-horizontal⟧。',
         hint: '等文字出现后，再点按发送箭头。'},
        {screen: () => home(p), target: 'settings',
         say: '您的手机还可以把内容<strong>大声读给您听</strong>。我们来把它打开。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>点按“辅助功能”。</strong>'},
        {screen: c => p === 'ios'
            ? list(p, '无障碍', [{caption: '视觉'}, {id: 'voiceover', label: '旁白', value: '关闭'}, {id: 'zoom', label: '缩放', value: '关闭'}, {id: 'spoken', label: '朗读内容'}], {back: '设置'})
            : list(p, '无障碍', [{id: 'select-speak', label: '点按朗读', sub: '关闭'}, {id: 'talkback', label: 'TalkBack', sub: '关闭'}, {id: 'magnification', label: '放大'}]),
         target: p === 'ios' ? 'spoken' : 'select-speak', say: p === 'ios' ? '<strong>点按“朗读内容”。</strong>' : '<strong>点按“点按朗读”。</strong>',
         hints: {voiceover: '“旁白”会改变整部手机的操作方式，可能让人糊涂。请点按“朗读内容”。', talkback: 'TalkBack 会改变整部手机的操作方式，可能让人糊涂。请点按“点按朗读”。'}},
        {screen: c => p === 'ios'
            ? list(p, '朗读内容', [{id: 'speak-selection', label: '朗读所选内容', toggle: !!c.speakSel}, {id: 'speak-screen', label: '朗读屏幕', toggle: !!c.speakScreen, sub: '用两根手指从屏幕顶部向下滑动，就能听到屏幕内容被读出来。'}], {back: '无障碍'})
            : list(p, '点按朗读', [{id: 'speak-screen', label: '使用点按朗读', toggle: !!c.speakScreen, sub: '点按快捷方式，再点按屏幕上的任何内容，就能听到它被读出来。'}]),
         target: 'speak-screen', action: c => { c.speakScreen = true; },
         say: p === 'ios' ? '<strong>开启“朗读屏幕”。</strong>之后在手机上的任何地方，用两根手指从顶部向下滑动，就会把屏幕内容读出来。' : '<strong>开启“使用点按朗读”。</strong>会出现一个小小的快捷按钮：点按它，再点按任何文字就能听到。',
         hints: {'speak-selection': '那只会读您选中的文字。“朗读屏幕”更方便：请开启它。'}},
        {screen: c => p === 'ios'
            ? list(p, '朗读内容', [{label: '朗读所选内容', toggle: false}, {label: '朗读屏幕', toggle: true}], {back: '无障碍'})
            : list(p, '点按朗读', [{label: '使用点按朗读', toggle: true}]), done: true,
         say: '<strong>做得好！</strong>您现在可以用说话代替打字，还能让手机把内容读给您听。'},
    ], {});

    SCENARIOS['hearing'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '很多助听器可以连接手机，这样电话和音乐会直接传进助听器。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'accessibility', say: '<strong>点按“辅助功能”。</strong>'},
        {screen: c => p === 'ios'
            ? list(p, '无障碍', [{caption: '听觉'}, {id: 'hearing-devices', label: '助听设备'}, {id: 'live-captions', label: '实时字幕', value: c.captions ? '开启' : '关闭'}, {id: 'subtitles', label: '字幕与说明文字'}], {back: '设置'})
            : list(p, '无障碍', [{id: 'hearing-devices', label: '助听器', sub: c.paired ? '已连接' : '未连接'}, {id: 'live-captions', label: '实时字幕', sub: c.captions ? '开启' : '关闭'}, {id: 'sound-amp', label: '声音放大器'}]),
         target: 'hearing-devices', say: `<strong>点按 ${p === 'ios' ? '助听设备' : '助听器'}。</strong>先戴上助听器，并把电池盖合上重启它们，这样手机才能找到。`,
         hints: {'live-captions': '字幕在后面。先连接助听器。'}},
        {screen: c => list(p, p === 'ios' ? '助听设备' : '助听器', [{caption: p === 'ios' ? 'MFI 助听设备' : '可用设备'}, {id: 'aids', label: 'Margaret 的助听器', sub: '左耳和右耳'}],
            {overlay: c.pairing ? dialog(p, '与“Margaret 的助听器”配对？', '它们将用于通话和音频。', [['cancel', '取消'], ['pair', '配对']]) : ''}),
         target: 'aids', action: c => { c.pairing = true; }, say: '手机找到它们了。<strong>点按您的助听器。</strong>'},
        {screen: c => list(p, p === 'ios' ? '助听设备' : '助听器', [{id: 'aids', label: 'Margaret 的助听器', sub: '左耳和右耳'}],
            {overlay: dialog(p, '与“Margaret 的助听器”配对？', '它们将用于通话和音频。', [['cancel', '取消'], ['pair', '配对']])}),
         target: 'pair', action: c => { c.pairing = false; c.paired = true; }, say: '<strong>点按“配对”。</strong>（有两个助听器时，手机可能会问两次，每个助听器一次。）'},
        {screen: c => list(p, p === 'ios' ? '助听设备' : '助听器', [{label: 'Margaret 的助听器', sub: '已连接 ⟦check⟧'}]), target: 'back',
         say: '已连接！现在通话会通过助听器播放。<strong>点按“返回”。</strong>'},
        {screen: c => p === 'ios'
            ? list(p, '无障碍', [{caption: '听觉'}, {id: 'hearing-devices', label: '助听设备'}, {id: 'live-captions', label: '实时字幕', value: c.captions ? '开启' : '关闭'}], {back: '设置'})
            : list(p, '无障碍', [{id: 'hearing-devices', label: '助听器', sub: '已连接'}, {id: 'live-captions', label: '实时字幕', sub: c.captions ? '开启' : '关闭'}]),
         target: 'live-captions', action: c => { c.captions = true; },
         say: `<strong>${p === 'ios' ? '实时字幕' : '实时字幕'}</strong>会把视频、电话和语音消息里说的话显示成屏幕上的文字。<strong>点按它来开启。</strong>`},
        {screen: c => list(p, '无障碍', [{label: p === 'ios' ? '实时字幕' : '实时字幕', toggle: true}, {label: '助听器', sub: '已连接'}]), done: true,
         say: '<strong>做得好！</strong>您的助听器已连接，说话的内容现在会以字幕显示。'},
    ], {});

    // ======================================================================================
    // Course: Smartphone first steps
    // ======================================================================================
    const ANIMALS = ['蚂蚁', '獾', '猫', '狗', '鹰', '狐狸', '山羊', '刺猬', '朱鹮', '寒鸦', '翠鸟', '羔羊', '鼹鼠',
                     '蝾螈', '水獭', '海鹦', '知更鸟', '海豹', '蟾蜍', '田鼠', '鹪鹩', '斑马'];
    const SLIDES = [['🌻', '#fde68a'], ['🐶', '#fecaca'], ['🏖️', '#bae6fd']];

    function practiceBoard(p, ctx, task) {
        const navBar = p === 'ios'
            ? '<button type="button" class="iv" data-tap="home-bar" data-swipe="home" aria-label="Home bar (swipe up to go home)"></button>'
            : '<div class="jl"><button type="button" data-tap="nav-back" aria-label="Back">◁</button><button type="button" data-tap="home-pill" aria-label="Home">○</button><span>▢</span></div>';
        let inner = '';
        if (task === 'tap') inner = '<button type="button" class="aah" data-tap="star">⟦star⟧<br><span>Tap me</span></button>';
        if (task === 'hold') inner = `<div class="aaf"><button type="button" class="ww" data-hold="flower" aria-label="Flower (press and hold)">🌷</button><p>按住这朵花</p></div>`;
        if (task === 'menu') inner = '<div class="aaf"><span class="ww">🌷</span><div class="aag"><span>拷贝</span><span>分享</span><span>删除</span></div></div>';
        if (task === 'swipe') {
            const n = Math.min(SLIDES.length - 1, ctx.pos || 0);
            inner = `<div class="aeu" data-swipe="photo"><div class="aet" style="background:${SLIDES[n][1]}">${SLIDES[n][0]}</div>
                <p class="vn">${SLIDES.map((s, k) => `<span class="${k === n ? 'on' : ''}"></span>`).join('')}</p></div>
                <button type="button" class="adq" data-tap="photo-left">Can't swipe? Tap here ›</button>`;
        }
        if (task === 'scroll') inner = `<div class="ru">${ANIMALS.map(a => `<button type="button" data-tap="animal-${a.toLowerCase()}">${a}</button>`).join('')}</div>`;
        if (task === 'page') inner = `<div class="agh">${p === 'ios' ? '<button type="button" class="kk ios" data-tap="nav-back">‹ Back</button>' : ''}<h3>斑马</h3><p>斑马身上有黑白条纹。没有两只斑马的花纹是完全一样的。</p></div>`;
        return `<div class="acw ${p}">${statusBar(p)}<div class="agg">${inner}</div>${navBar}</div>`;
    }

    SCENARIOS['first-steps'] = (p) => withCtx([
        {screen: c => practiceBoard(p, c, 'tap'), target: 'star',
         say: '<strong>点按</strong>是指用一根手指轻轻碰一下屏幕然后马上松开，就像按按钮一样。<strong>点按那颗星星。</strong>'},
        {screen: c => practiceBoard(p, c, 'hold'), target: 'flower',
         say: '<strong>按住</strong>是指把手指在某样东西上放一两秒钟，通常会弹出更多选项。<strong>按住那朵花</strong>，直到出现反应。（用鼠标的话，按住鼠标键不放。）',
         hint: '手指在花上放一两秒钟。'},
        {screen: c => practiceBoard(p, c, 'menu'), question: {q: '出现了一个菜单。按住通常会有什么作用？', options: [
            {t: '显示更多选项，比如拷贝、分享或删除', ok: true, why: '对。按住消息、照片和 App，都会弹出类似的选项。'},
            {t: '立刻删除东西', why: '不是，它只是显示一个选项菜单。选了其中一项之后才会有动作。'}]}},
        {screen: c => practiceBoard(p, c, 'swipe'), sequence: ['photo-left', 'photo-left'],
         say: '<strong>滑动</strong>是指手指在屏幕上划过，就像翻书页一样。<strong>在照片上向左滑动两次</strong>，看后面的照片。（用鼠标的话，点住、拖动再松开。）',
         hint: '手指从右向左划过照片。也可以用“滑不动？”按钮。'},
        {screen: c => practiceBoard(p, c, 'scroll'), target: 'animal-zebra',
         say: '<strong>滚动</strong>是指手指在屏幕上往上推，看到列表的更多内容，比如这一个。<strong>向下滚动并点按“斑马”</strong>，它在最底部。（用鼠标的话，滚动滚轮。）',
         hint: '用手指把列表向上推，找到最底部的“斑马”。'},
        {screen: c => practiceBoard(p, c, 'page'), target: 'nav-back',
         say: p === 'ios' ? '在 iPhone 上返回上一页，请<strong>点按左上角的“‹ 返回”</strong>（或从屏幕左边缘向内滑动）。' : '在 Android 上返回上一页，请<strong>点按底部的返回箭头 ◁</strong>（或从屏幕左边缘或右边缘向内滑动）。',
         hints: {'home-pill': '那样会一路回到主屏幕。请改为点按返回箭头 ◁。', 'home-bar': '那样会一路回到主屏幕。请改为点按“‹ 返回”。'}},
        {screen: c => practiceBoard(p, c, 'scroll'), target: p === 'ios' ? 'home-bar' : 'home-pill',
         say: p === 'ios' ? '想从任何地方回到主屏幕，请<strong>从屏幕底部的横条向上滑动</strong>（或点按这里的横条）。带圆形主屏幕按钮的较旧 iPhone：按那个按钮。'
                          : '想从任何地方回到主屏幕，请<strong>点按底部的主屏幕圆圈 ○</strong>（或从底部边缘向上滑动）。',
         alias: {'home-up': 'home-bar'}, hints: {'nav-back': '“返回”只退回一页。点按主屏幕圆圈 ○ 才能回到主屏幕。'}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>您练习了点按、按住、滑动、滚动、返回和回到主屏幕：这些都是您每天会用到的动作。'},
    ], {});

    function wifiList(p, ctx) {
        const nets = [['bt-hub-7f2a', 'BT-Hub-7F2A'], ['vm-neighbour', 'VM-Neighbour-5G'], ['sky-12345', 'SKY12345']];
        const connected = ctx.wifiOk ? [{label: 'BT-Hub-7F2A', sub: '已连接', value: '⟦check⟧'}] : [];
        return list(p, p === 'ios' ? 'Wi-Fi' : '互联网', [
            {label: 'Wi-Fi', toggle: true},
            ...connected,
            {caption: p === 'ios' ? '网络' : '可用网络'},
            ...nets.filter(([id]) => !(ctx.wifiOk && id === 'bt-hub-7f2a')).map(([id, name]) => ({id: 'net-' + id, label: name, value: '⟦lock⟧'})),
        ], {back: '设置',
            overlay: ctx.joining ? `<div class="ei"><div class="cv"><p><strong>输入“BT-Hub-7F2A”的密码</strong></p>
                ${field('wifipass', '密码', ctx)}<button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="join">${p === 'ios' ? '加入' : '连接'}</button>
                <button type="button" class="cp" data-tap="cancel">取消</button></div></div>` : ''});
    }

    SCENARIOS['wifi'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '在家用 Wi-Fi 能节省手机流量。<strong>点按“设置”。</strong>'},
        ...(p === 'ios'
            ? [{screen: c => settingsList(p, c), target: 'wifi', say: '<strong>点按“无线局域网”</strong>，在靠上的位置。'}]
            : [{screen: c => settingsList(p, c), target: 'network', say: '<strong>点按“网络和互联网”。</strong><em>在三星手机上，是“连接”，再找“Wi-Fi”。</em>'},
               {screen: () => list(p, '网络和互联网', [{id: 'internet', label: '互联网', sub: 'Wi-Fi 和移动数据'}, {id: 'sims', label: 'SIM 卡'}, {id: 'hotspot', label: '热点和网络共享'}]),
                target: 'internet', say: '<strong>点按“互联网”。</strong>'}]),
        {screen: c => wifiList(p, c), target: 'net-bt-hub-7f2a', action: c => { c.joining = true; },
         say: '您的 Wi-Fi 名称和密码通常印在路由器（带指示灯的盒子）背面的标签上。这个模拟路由器的标签写着：<br><span class="ahd">网络：<strong>BT-Hub-7F2A</strong><br>密码：<strong>Green-Apple-42</strong></span><strong>点按 BT-Hub-7F2A。</strong>',
         hints: {'net-vm-neighbour': '那是邻居家的 Wi-Fi。请找标签上的名称：BT-Hub-7F2A。', 'net-sky-12345': '那是别人的 Wi-Fi。请找标签上的名称：BT-Hub-7F2A。'}},
        {screen: c => wifiList(p, c), target: 'join', action: c => { c.joining = false; c.wifiOk = true; },
         require: c => typed(c, 'wifipass') === 'Green-Apple-42',
         requireHint: '密码必须与标签完全一致，包括大写字母和短横线：Green-Apple-42',
         say: '按标签上的样子<strong>原样</strong>输入密码：<strong>Green-Apple-42</strong>。大小写很重要！然后<strong>点按“加入”</strong>。'},
        {screen: c => wifiList(p, c), question: {q: '连上了！以后您在家时，手机会自动加入这个 Wi-Fi。在咖啡馆用免费 Wi-Fi 安全吗？', options: [
            {t: '可以用来浏览网页，但不要用它进行网上银行操作', ok: true, why: '没错。公共 Wi-Fi 用来看新闻或查公交时间没问题。银行业务请用手机流量或家里的 Wi-Fi。'},
            {t: '可以，什么都能做', why: '公共 Wi-Fi 可能被别人监视。用来浏览网页没问题，但银行业务请用手机流量或家里的 Wi-Fi。'}]}},
        {screen: c => wifiList(p, c), done: true, say: '<strong>做得好！</strong>您已经连上 Wi-Fi 了。在屏幕顶部找扇形的 Wi-Fi 符号。'},
    ], {input: {}});

    function contactForm(p, ctx) {
        return list(p, p === 'ios' ? '新建联系人' : '创建联系人', [], {noBack: true,
            top: `<div class="kf"><span class="lh tq" style="background:#cbd5e1">⟦user⟧</span>
                <span class="se">First name</span>${field('fname', '名字', ctx)}<span class="se">Mobile number</span>${field('cnum', '手机号码', ctx, 'tel')}
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? '完成' : '保存'}</button></div>`});
    }
    const contactCard = (p, ctx) => list(p, typed(ctx, 'fname') || '联系人', [
        {label: '手机', sub: typed(ctx, 'cnum')}, {id: 'favourite', label: p === 'ios' ? '添加到个人收藏' : (ctx.fav ? '⟦star⟧ 个人收藏' : '⟦star⟧ 添加到个人收藏')},
        {id: 'share', label: '分享联系人'}], {back: '通讯录'});

    SCENARIOS['contacts'] = (p) => withCtx([
        {screen: () => p === 'ios' ? home(p) : homeWith(p, [['contacts', '通讯录', '#2563eb', ICON2.contacts]]), target: p === 'ios' ? 'phone' : 'contacts',
         say: p === 'ios' ? '存下某人的号码，您就可以按名字给他打电话。iPhone 上的通讯录在<strong>电话</strong> App 里。<strong>点按“电话”。</strong>' : '<strong>点按“通讯录”。</strong>'},
        {screen: () => p === 'ios'
            ? app(p, '通讯录', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="add" aria-label="Add contact">+</button>'})
            : app(p, '通讯录', '<div class="mx"><span>Dave</span><span>Jean</span><span>Sarah</span></div><button type="button" class="qd aav" data-tap="add" aria-label="Create contact">+</button>', {back: false, color: '#fff'}),
         target: 'add', say: p === 'ios' ? '这是您的通讯录列表。<strong>点按右上角的 +</strong> 来添加一个人。' : '这是您的通讯录列表。<strong>点按 + 按钮</strong>来添加一个人。'},
        {screen: c => contactForm(p, c), target: 'save', require: c => typed(c, 'fname').length > 0 && /\d{5,}/.test(typed(c, 'cnum').replace(/\s/g, '')),
         requireHint: '输入名字和练习号码 07700 900456，然后点按 ' + (p === 'ios' ? '“完成”。' : '“保存”。'),
         say: `输入这个人的<strong>名字</strong>（可以试试“Ann”）和号码。练习时请用 <strong>07700 900456</strong>。然后<strong>点按 ${p === 'ios' ? '完成' : '保存'}</strong>。`},
        {screen: c => contactCard(p, c), target: 'favourite', action: c => { c.fav = true; },
         say: '已保存！个人收藏是您最常打电话的人，会显示在最上面，一点就能拨打。<strong>点按 ' + (p === 'ios' ? '添加到个人收藏' : '星星') + '.</strong>'},
        {screen: c => contactCard(p, c), question: {q: '哪位联系人值得在名字前加上“ICE”（紧急联系人）保存？', options: [
            {t: '您的近亲，比如“ICE Sarah”', ok: true, why: '对。急救人员知道要找 ICE。更好的办法是在您的医疗急救卡里添加紧急联系人，这在“保护手机安全”课程里讲过。'},
            {t: '您的银行', why: 'ICE 是您出事时要联系的人，通常是您的近亲。'}]}},
        {screen: c => contactCard(p, c), done: true, say: '<strong>做得好！</strong>您保存了一位联系人，并把他设成了个人收藏。'},
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
    const recents = p => app(p, '最近', `<div class="fo">
        <button type="button" class="ck acs" data-tap="call-dave"><strong>Dave</strong><small>mobile · missed</small><span>10:05</span></button>
        <div class="ck"><strong>Jean</strong><small>mobile</small><span>09:41</span></div>
        <div class="ck"><strong>01482 496000</strong><small>unknown</small><span>Yesterday</span></div></div>`, {back: false, color: '#f2f2f7'});

    SCENARIOS['calls'] = (p) => withCtx([
        {screen: () => incoming(p), target: 'answer', say: '您的手机响了：Jean 打来电话。<strong>点按绿色按钮接听。</strong>' + (p === 'android' ? ' <em>在有些 Android 手机上，要把绿色按钮向上滑动。</em>' : ' <em>如果您的 iPhone 已锁定，要把绿色按钮滑过去。</em>'),
         hints: {decline: '红色是拒接。点按绿色接听。'}},
        {screen: c => inCall(p, c), target: 'speaker', action: c => { c.speaker = true; },
         say: '您在通话中！想听得更清楚，或者免提说话，请<strong>点按扬声器</strong>。'},
        {screen: c => inCall(p, c), target: 'end', action: c => { c.speaker = false; }, say: '说完后，<strong>点按红色按钮</strong>挂断。'},
        {screen: () => recents(p), target: 'call-dave',
         say: '您之前错过了 Dave 的一个电话。未接来电在最近通话里以<strong>红色</strong>显示。<strong>点按 Dave</strong> 回拨给他。'},
        {screen: c => inCall(p, c, 'Dave'), wait: 1800, target: 'end', say: '正在呼叫 Dave。说完后，<strong>点按红色按钮</strong>挂断。'},
        {screen: () => recents(p), question: {q: '有人用您不认识的号码打来电话，说是您的银行。您怎么办？', options: [
            {t: '挂断，然后拨打 159 安全地联系您的银行', ok: true, why: '没错。您随时可以挂断，再打您信任的号码。159 会接通您自己的银行。'},
            {t: '照他们说的做，他们是银行', why: '骗子总是冒充银行，而且号码可以伪造。请挂断，然后拨打 159。'}]}},
        {screen: () => recents(p), done: true, say: '<strong>做得好！</strong>您会接电话、用扬声器、挂断，还会回拨未接来电了。'},
    ], {});

    function smsList(p) {
        return app(p, '信息', `<div class="fo">
            <button type="button" class="ck lt" data-tap="open-dentist"><strong>Dentist</strong><small>Reminder: your appointment is on Tuesday at 10:30…</small><span>08:15</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'});
    }
    function smsChat(p, ctx) {
        const sent = ctx.replied ? `<div class="dm me xh"><span>${esc(ctx.reply || 'Y')}</span><small>08:20</small></div>` : '';
        const old = ctx.deleted ? '' : `<button type="button" class="dm them ajk" data-hold="old-msg"><span>您上次检查是在三月。请在线预约或打电话给我们。</span><small>3 个月前</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>Dentist</strong></div>
            <div class="gf">${old}<div class="dm them"><span>Reminder: your appointment is on Tuesday at 10:30. Reply Y to confirm.</span><small>08:15</small></div>${sent}</div>
            <div class="hn">${field('reply', '短信', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button><button type="button" class="cp" data-tap="forward">Forward</button>
                <button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['texts'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: '短信在<strong>信息</strong> App 里。<strong>点按“信息”。</strong>', hint: '它是对话气泡图标。'},
        {screen: () => smsList(p), target: 'open-dentist', say: '新消息以粗体显示。<strong>点按牙医发来的消息</strong>来阅读。'},
        {screen: c => smsChat(p, c), target: 'send', require: c => typed(c, 'reply').length > 0, requireHint: '先在消息框里输入 Y，再点按发送箭头。',
         action: c => { c.replied = true; c.reply = typed(c, 'reply'); c.input.reply = ''; },
         say: '牙医请您回复 <strong>Y</strong> 来确认。<strong>点按消息框，输入 Y，然后点按发送箭头</strong> ⟦send-horizontal⟧。'},
        {screen: c => smsChat(p, c), target: 'old-msg', action: c => { c.menu = true; },
         say: '完成了！现在整理一下：<strong>按住最上面那条旧消息</strong>（手指在上面放一两秒钟）。', hint: '手指一直放在最上面那条旧消息上，直到出现菜单。'},
        {screen: c => smsChat(p, c), target: 'delete', action: c => { c.menu = false; c.deleted = true; }, say: '出现了一个菜单。<strong>点按“删除”。</strong>',
         hints: {copy: '“拷贝”是复制文字。请点按“删除”。', forward: '“转发”是发给别人。请点按“删除”。'}},
        {screen: c => smsChat(p, c), question: {q: '一个陌生号码发来短信，说您的包裹被扣留，要您通过链接支付 1.45 英镑。您怎么办？', options: [
            {t: '不要点链接。转发给 7726，然后删除', ok: true, why: '没错。7726 是免费的，会向您的运营商举报。快递公司不会发短信带链接收费。'},
            {t: '付款吧，才 1.45 英镑', why: '这 1.45 英镑是诱饵，为的是骗取您的银行卡信息。不要点链接：转发给 7726 并删除。'}]}},
        {screen: c => smsChat(p, c), done: true, say: '<strong>做得好！</strong>您会阅读和回复短信，也会删除不需要的短信了。'},
    ], {input: {}});

    function batteryPage(p, ctx) {
        const saver = !!ctx.saver;
        const apps = `<div class="nl">${[['Facebook', 31], ['YouTube', 22], ['地图', 15], ['WhatsApp', 9], ['相机', 6]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`;
        const head = `<div class="ql"><span class="oz${saver ? ' aiy' : ''}"><span style="width:23%"></span></span><strong>23%</strong></div>`;
        return p === 'ios'
            ? list(p, '电池', [{id: 'low-power', label: '低电量模式', toggle: saver, sub: '在您能充满电之前，减少后台活动。'}, {caption: '各 App 耗电情况'}], {back: '设置', top: head, bottom: apps})
            : list(p, '电池', [{id: 'low-power', label: '省电模式', toggle: saver, sub: '关闭部分功能，让电池撑得更久。'}, {caption: '电池使用情况'}], {top: head, bottom: apps});
    }

    SCENARIOS['battery'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '电量不多了？<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>点按“电池”。</strong>', hint: p === 'ios' ? '“电池”在第三组里。' : '“电池”在列表里，“通知”的后面。'},
        {screen: c => batteryPage(p, c), target: 'low-power', action: c => { c.saver = true; },
         say: `您现在只剩 23% 的电量。<strong>${p === 'ios' ? '低电量模式' : '省电模式'}</strong>能让它撑得更久。<strong>点按它来开启。</strong>电池符号会变成 ${p === 'ios' ? 'yellow' : 'orange'}，提醒您。`},
        {screen: c => batteryPage(p, c), question: {q: '列表显示 Facebook 今天最耗电。怎样最能让电池撑得久？', options: [
            {t: '调低屏幕亮度，用完的 App 就关掉', ok: true, why: '对。屏幕最耗电。调低亮度；像 Facebook 和 YouTube 这样的 App 也很耗电。'},
            {t: '每小时充一次，充到 100%', why: '经常充电没有坏处，但并不会让电池更耐用。请调低亮度并使用省电模式。'}]}},
        {screen: c => batteryPage(p, c), done: true, say: '<strong>做得好！</strong>省电模式开启了，您也知道哪些 App 最耗电了。'},
    ], {});

    // ======================================================================================
    // Course: Keeping your phone safe
    // ======================================================================================
    function recentsUnknown(p, ctx) {
        const rows = ctx.blocked ? '' : `<div class="ck acs"><strong>07700 900842</strong><small>${p === 'ios' ? '手机 · 3 次通话' : '疑似骚扰电话 · 3 次通话'}</small>
            <span>11:20</span><button type="button" class="od" data-tap="info" aria-label="More info about 07700 900842">${UI.info}</button></div>`;
        return app(p, '最近', `<div class="fo">${rows}<div class="ck"><strong>Jean</strong><small>手机</small><span>09:41</span></div>
            <div class="ck"><strong>Dave</strong><small>手机</small><span>昨天</span></div></div>`,
            {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff', right: p === 'android' ? '<button type="button" class="gx" data-tap="menu" aria-label="More options">⋮</button>' : '',
             overlay: ctx.menuOpen ? '<div class="jb"><span>Call history</span><button type="button" data-tap="phone-settings">Settings</button></div>' : ''});
    }

    SCENARIOS['block-calls'] = (p) => withCtx([
        {screen: () => home(p), target: 'phone', say: '同一个陌生号码老是打给您。我们把它屏蔽掉。<strong>打开“电话”App。</strong>'},
        {screen: c => recentsUnknown(p, c), target: 'info',
         say: `在最近通话里，<strong>点按 ⓘ</strong>，它在号码 07700 900842 旁边${p === 'android' ? ' （在有些 Android 手机上，直接点按号码本身）' : ''}。`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}, {id: 'share', label: '分享联系人'}, {id: 'block', label: p === 'ios' ? '阻止此来电者' : '屏蔽/举报骚扰电话', danger: true}], {back: '最近'}),
         target: 'block', say: `<strong>Tap ${p === 'ios' ? '阻止此来电者' : '屏蔽/举报骚扰电话'}.</strong>`},
        {screen: () => list(p, '07700 900842', [{label: 'mobile', sub: '07700 900842'}], {overlay: p === 'ios'
            ? dialog(p, '要屏蔽此来电者吗？', '您将不会收到屏蔽名单中的人打来的电话、发来的信息或 FaceTime 通话。', [['cancel', '取消'], ['confirm', '屏蔽联系人']])
            : dialog(p, '要屏蔽 07700 900842 吗？', '⟦square-check⟧ 将此通话举报为骚扰电话', [['cancel', '取消'], ['confirm', '屏蔽']])}),
         target: 'confirm', action: c => { c.blocked = true; }, say: `<strong>Tap ${p === 'ios' ? '屏蔽联系人' : '屏蔽'}.</strong>${p === 'android' ? ' 保持勾选“将此通话举报为骚扰电话”，有助于提醒其他人。' : ''}`},
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: '已屏蔽！您还可以<strong>把所有不认识的号码打来的电话静音</strong>。<strong>点按“设置”。</strong>'},
            {screen: c => settingsList(p, c), target: 'apps', say: '滚动到底部，<strong>点按“App”</strong>。'},
            {screen: () => list(p, 'App', [{id: 'app-phone', label: '电话'}, {id: 'app-messages', label: '信息'}, {id: 'app-mail', label: '邮件'}], {back: '设置'}), target: 'app-phone', say: '<strong>点按“电话”。</strong>'},
            {screen: c => list(p, '电话', [{id: 'silence', label: '静音未知来电', toggle: !!c.silence}, {id: 'blocked', label: '已屏蔽的联系人', value: '1'}], {back: 'App'}),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>开启“静音未知来电”。</strong>不在您通讯录里的号码打来的电话会直接转到语音信箱，并仍然显示在最近通话里。'},
        ] : [
            {screen: c => recentsUnknown(p, c), target: 'menu', action: c => { c.menuOpen = true; }, say: '已屏蔽！您还可以<strong>过滤骚扰电话</strong>。<strong>点按右上角的三个点 ⋮</strong>。'},
            {screen: c => recentsUnknown(p, c), target: 'phone-settings', action: c => { c.menuOpen = false; }, say: '<strong>点按“设置”。</strong>'},
            {screen: () => list(p, '设置', [{id: 'caller-id', label: '来电显示和骚扰电话'}, {id: 'blocked', label: '已屏蔽的号码'}, {id: 'sounds', label: '声音和振动'}]), target: 'caller-id', say: '<strong>点按“来电显示和骚扰电话”。</strong>'},
            {screen: c => list(p, '来电显示和骚扰电话', [{id: 'caller-show', label: '查看来电者和骚扰电话标识', toggle: true}, {id: 'silence', label: '过滤骚扰电话', toggle: !!c.silence, sub: '疑似骚扰电话不会让您的手机响铃'}]),
             target: 'silence', action: c => { c.silence = true; }, say: '<strong>开启“过滤骚扰电话”。</strong>疑似诈骗电话不会让您的手机响铃。'},
        ]),
        {screen: c => list(p, '完成', [{label: '已屏蔽的号码', value: '1'}, {label: p === 'ios' ? '静音未知来电' : '过滤骚扰电话', toggle: true}]),
         question: {q: '把未知来电静音，会不会让您错过真正的来电，比如医院或送货司机打来的？', options: [
            {t: '会，所以要时不时查看语音信箱和未接来电', ok: true, why: '没错。真正的来电者通常会留言，未接来电也仍然会显示在列表里。'},
            {t: '不会，他们总能打通', why: '未知号码会转到语音信箱，包括真正的来电。请时不时查看语音信箱和未接来电。'}]}},
        {screen: () => list(p, '完成', [{label: '已屏蔽的号码', value: '1'}, {label: p === 'ios' ? '静音未知来电' : '过滤骚扰电话', toggle: true}]), done: true,
         say: '<strong>做得好！</strong>您屏蔽了一个骚扰号码，减少了诈骗电话。'},
    ], {});

    function scamThread(p, ctx) {
        const SCAM = 'Royal Mail：您的包裹因 1.45 英镑费用未付而被扣留。请立即付款以重新预约投递：royalmail-redelivery-uk.com';
        const toBox = ctx.forwarding ? `<div class="xz">收件人：${field('fwdto', '号码', ctx, 'tel')}</div>` : '';
        const thread = ctx.forwarding
            ? `<div class="dm me xh akf"><span>${SCAM}</span></div>${ctx.sent7726 ? '<div class="dm them"><span>谢谢。请发送这条诈骗短信的来源电话号码。</span><small>刚刚</small></div>' : ''}${ctx.sentNumber ? `<div class="dm me xh"><span>${esc(ctx.sentNumber)}</span></div><div class="dm them"><span>谢谢，您的举报已收到。</span></div>` : ''}`
            : `<button type="button" class="dm them ajk" data-hold="scam-msg"><span>${SCAM}</span><small>10:12</small></button>`;
        return `<div class="cg kt ph-${p}">${statusBar(p)}
            <div class="kv">${p === 'ios' ? '<span class="ij">‹</span>' : '<span class="ij">←</span>'}<strong>${ctx.forwarding ? (ctx.sent7726 ? '7726' : '新信息') : '+44 7700 900911'}</strong></div>
            ${toBox}<div class="gf">${thread}</div>
            ${ctx.sent7726 ? `<div class="hn">${field('reportnum', '短信', ctx, 'tel')}<button type="button" class="ic" data-tap="send2" aria-label="Send">${UI.send}</button></div>`
                           : ctx.forwarding ? `<div class="hn"><span class="rt"></span><button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>` : ''}
            ${ctx.menu ? `<div class="ei"><div class="cv"><button type="button" class="cp" data-tap="copy">Copy</button>
                <button type="button" class="cp" data-tap="forward">${p === 'ios' ? '更多… 然后转发' : '转发'}</button><button type="button" class="cp lk" data-tap="delete">Delete</button></div></div>` : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['report-7726'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: '您收到了一条冒充 Royal Mail 的诈骗短信。删除之前，先免费举报它。<strong>打开“信息”。</strong>'},
        {screen: () => app(p, '信息', '<div class="fo"><button type="button" class="ck lt" data-tap="open-scam"><strong>+44 7700 900911</strong><small>Royal Mail: your parcel is on hold…</small><span>10:12</span></button></div>', {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-scam', say: '<strong>点按这条消息</strong>将其打开。不要点里面的链接！'},
        {screen: c => scamThread(p, c), target: 'scam-msg', action: c => { c.menu = true; },
         say: '<strong>按住这条消息</strong>（手指一直放着），直到出现菜单。不要点链接。', hint: '手指在灰色消息气泡上放一两秒钟。'},
        {screen: c => scamThread(p, c), target: 'forward', action: c => { c.menu = false; c.forwarding = true; },
         say: p === 'ios' ? '<strong>点按“更多…”</strong>，再点按转发箭头（这里一个按钮就能完成两步）。' : '<strong>点按“转发”。</strong>（在有些手机上，它在顶部的三个点 ⋮ 下面。）',
         hints: {delete: '先举报，之后才可以删除。', copy: '点按“转发”，把它发给 7726。'}},
        {screen: c => scamThread(p, c), target: 'send', require: c => typed(c, 'fwdto').replace(/\s/g, '') === '7726', requireHint: '在“收件人”框里输入 7726（在手机键盘上它拼出 SPAM），然后点按发送。',
         action: c => { c.sent7726 = true; }, say: '在<strong>收件人</strong>框里输入 <strong>7726</strong>。（在键盘上它拼出 S-P-A-M。）然后<strong>点按发送</strong> ⟦send-horizontal⟧。这是免费的。'},
        {screen: c => scamThread(p, c), target: 'send2', require: c => typed(c, 'reportnum').replace(/\D/g, '').endsWith('7700900911'), requireHint: '输入骗子的号码 07700 900911，然后点按发送。',
         action: c => { c.sentNumber = typed(c, 'reportnum'); c.input.reportnum = ''; },
         say: '7726 会回复，问您诈骗短信是从哪个号码发来的。<strong>输入 07700 900911</strong>，然后<strong>点按发送</strong>。'},
        {screen: c => scamThread(p, c), question: {q: '您已经举报了。现在该怎么处理这条诈骗短信？', options: [
            {t: '删除它，并屏蔽这个号码', ok: true, why: '对。已经举报了，所以可以删除。屏蔽能阻止这个号码再发短信。'},
            {t: '点一下链接看看是不是真的', why: '绝不要点诈骗短信里的链接。删除它，并屏蔽这个号码。'}]}},
        {screen: c => scamThread(p, c), done: true, say: '<strong>做得好！</strong>您向 7726 举报了一条诈骗短信，这有助于运营商为所有人拦截它。诈骗邮件请发到 report@phishing.gov.uk。'},
    ], {input: {}});

    const PRACTICE = ['4', '7', '1', '9', '3', '6'];
    SCENARIOS['updates'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '更新会修复安全问题，所以很重要。先给手机插上电，并连上 Wi-Fi。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'general', say: '<strong>点按“通用”。</strong>'},
        {screen: () => list(p, '通用', [{id: 'about', label: '关于本机'}, {id: 'software', label: '软件更新', value: '1'}, {id: 'storage', label: 'iPhone 储存空间'}], {back: '设置'}), target: 'software', say: '<strong>点按“软件更新”。</strong>红色的 1 表示有更新在等着。'},
        {screen: () => list(p, '软件更新', [{id: 'auto', label: '自动更新', value: '关闭'}], {back: '通用',
            bottom: '<div class="hu"><strong>iOS 更新</strong><p>此更新包含重要的安全修复，建议所有用户安装。</p><button type="button" class="ce co" data-tap="update-now">立即更新</button></div>'}),
         target: 'update-now', say: '<strong>点按“立即更新”。</strong>', hints: {auto: '在这之后，也值得开启自动更新。先点按“立即更新”。'}},
        {screen: c => codeScreen(p, c, '输入密码', ''), sequence: PRACTICE.map(d => 'k' + d), say: '您的 iPhone 会要求输入密码。<strong>输入练习密码 4 7 1 9 3 6。</strong>', hint: '输入 4 7 1 9 3 6。'},
        {screen: c => list(p, '软件更新', [], {back: '通用', bottom: `<div class="hu"><strong>${c.busy ? '正在下载……' : '准备安装'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce co" data-tap="install">Install Now</button>'}</div>`}),
         wait: 2400, target: 'install', say: '它会先下载，可能要几分钟。然后<strong>点按“立即安装”</strong>。您的手机会重新启动，所以请选在接下来 15 到 30 分钟用不到手机的时候。'},
        {screen: () => list(p, '软件更新', [{id: 'auto', label: '自动更新', value: '开启'}], {back: '通用', bottom: '<div class="hu"><strong>您的 iPhone 已是最新版本</strong></div>'}),
         question: {q: '值得开启自动更新吗？', options: [
            {t: '值得，这样它会在夜间充电时更新', ok: true, why: '没错。设置 > 通用 > 软件更新 > 自动更新。它会在夜间插着电、连着 Wi-Fi 时安装。'},
            {t: '不用，更新是可选的', why: '更新会修复骗子利用的安全漏洞。自动更新让您不用惦记也能保持安全。'}]}},
        {screen: () => list(p, '软件更新', [], {bottom: '<div class="hu"><strong>您的 iPhone 已是最新版本 ⟦check⟧</strong></div>'}), done: true, say: '<strong>做得好！</strong>您的手机已更新，能防范最新的问题。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '更新会修复安全问题，所以很重要。先给手机插上电，并连上 Wi-Fi。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'system', say: '向下滚动并<strong>点按“系统”</strong>。<em>在三星手机上，是靠近底部的“软件更新”。</em>'},
        {screen: () => list(p, '系统', [{id: 'languages', label: '语言'}, {id: 'date', label: '日期和时间'}, {id: 'software', label: '软件更新', sub: '有可用更新'}]), target: 'software', say: '<strong>点按“软件更新”。</strong>'},
        {screen: () => list(p, '软件更新', [{id: 'system-update', label: '系统更新', sub: '有可用更新'}, {id: 'play-update', label: 'Google Play 系统更新'}]), target: 'system-update', say: '<strong>点按“系统更新”。</strong>'},
        {screen: () => list(p, '系统更新', [], {bottom: '<div class="hu"><strong>有可用的系统更新</strong><p>包含重要的安全修复。</p><button type="button" class="ce dk" data-tap="download">下载并安装</button></div>'}),
         target: 'download', say: '<strong>点按“下载并安装”。</strong>'},
        {screen: c => list(p, '系统更新', [], {bottom: `<div class="hu"><strong>${c.busy ? '正在下载并安装……' : '重启以完成'}</strong><div class="ov"><span class="${c.busy ? 'akg' : 'ahw'}"></span></div>
            ${c.busy ? '' : '<button type="button" class="ce dk" data-tap="install">Restart now</button>'}</div>`}),
         wait: 2400, target: 'install', say: '它会下载并做好准备，这可能要一段时间。然后<strong>点按“立即重启”</strong>。您的手机会关机再开机，需要几分钟。'},
        {screen: () => list(p, '系统更新', [], {bottom: '<div class="hu"><strong>您的系统已是最新版本</strong></div>'}),
         question: {q: '您的手机好几年没有更新了。这可能意味着什么？', options: [
            {t: '它可能太旧，收不到安全更新了，所以不太安全', ok: true, why: '对。较旧的手机会停止接收更新。不要在上面做银行业务，有条件时考虑换新。'},
            {t: '它运行得好好的', why: '手机用了几年后就不再收到更新，安全漏洞也就没人修复了。'}]}},
        {screen: () => list(p, '系统更新', [], {bottom: '<div class="hu"><strong>您的系统已是最新版本 ⟦check⟧</strong></div>'}), done: true, say: '<strong>做得好！</strong>您的手机已更新，能防范最新的问题。'},
    ], {});

    function medicalForm(p, ctx) {
        const ec = ctx.ec ? '<div class="cj ex"><span>Sarah（女儿）</span><span class="kz">07700 900333</span></div>' : '<button type="button" class="cj link" data-tap="add-ec">＋ add emergency contact</button>';
        return list(p, p === 'ios' ? '医疗急救卡' : '医疗信息', [], {noBack: true, top: `<div class="ta">
            <label class="wu">Medical conditions</label>${field('conditions', '例如 2 型糖尿病', ctx)}
            <label class="wu">Allergies &amp; reactions</label>${field('allergies', '例如 青霉素', ctx)}
            <div class="he">EMERGENCY CONTACTS</div><div class="ge">${ec}</div>
            ${p === 'ios' ? `<div class="ge"><div class="cj ex"><span>锁定时显示</span>${tog(true)}</div></div>` : ''}
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="save">${p === 'ios' ? '完成' : '保存'}</button></div>`,
            overlay: ctx.picking ? `<div class="ei"><div class="cv"><p><strong>选择联系人</strong></p>
                <button type="button" class="cj" data-tap="ec-sarah">Sarah</button><button type="button" class="cj" data-tap="ec-dave">Dave</button></div></div>` : ''});
    }

    SCENARIOS['medical-id'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => homeWith(p, [['health', '健康', '#fff', ICON2.health]]), target: 'health', say: '<strong>医疗急救卡</strong>让急救人员即使在手机锁定时也能看到您的过敏情况和紧急联系人。<strong>打开“健康”App。</strong>'},
            {screen: () => app(p, '摘要', '<p class="cf">您的健康数据显示在这里。</p>', {back: false, color: '#f2f2f7', right: '<button type="button" class="gx" data-tap="profile" aria-label="Your profile">⟦user⟧</button>'}),
             target: 'profile', say: '<strong>点按右上角您的头像。</strong>'},
            {screen: () => list(p, 'Margaret', [{id: 'details', label: '健康详情'}, {id: 'medical', label: '医疗急救卡'}], {back: '摘要'}), target: 'medical', say: '<strong>点按“医疗急救卡”。</strong>'},
        ] : [
            {screen: () => home(p), target: 'settings', say: '您的手机可以存放<strong>医疗信息</strong>，即使手机锁定，急救人员也能看到。<strong>点按“设置”。</strong>'},
            {screen: c => settingsList(p, c), target: 'safety', say: '向下滚动并<strong>点按“安全和紧急情况”</strong>。<em>在三星手机上，是“安全和紧急情况”。</em>'},
            {screen: () => list(p, '安全和紧急情况', [{id: 'medical', label: '医疗信息'}, {id: 'contacts-ec', label: '紧急联系人'}, {id: 'sos', label: '紧急 SOS'}]), target: 'medical', say: '<strong>点按“医疗信息”。</strong>'},
        ]),
        {screen: c => medicalForm(p, c), target: 'add-ec', action: c => { c.picking = true; },
         require: c => typed(c, 'allergies').length > 0, requireHint: '先输入一项过敏（练习时输入“青霉素”），再添加一位紧急联系人。',
         say: '填写急救人员应该知道的任何信息。练习时，请在过敏项下输入<strong>青霉素</strong>。然后<strong>点按添加紧急联系人</strong>。'},
        {screen: c => medicalForm(p, c), target: 'ec-sarah', action: c => { c.picking = false; c.ec = true; }, say: '选择紧急情况下要联系谁。<strong>点按 Sarah。</strong>'},
        {screen: c => medicalForm(p, c), target: 'save', say: p === 'ios' ? '“锁定时显示”已开启，所以急救人员能看到。<strong>点按“完成”。</strong>' : '<strong>点按“保存”。</strong>'},
        {screen: c => list(p, p === 'ios' ? '医疗急救卡' : '医疗信息', [{label: '过敏', sub: typed(c, 'allergies')}, {label: '紧急联系人', sub: 'Sarah（女儿）'}]),
         question: {q: p === 'ios' ? '手机锁定时，急救人员怎样才能看到您的医疗急救卡？' : '手机锁定时，急救人员怎样才能看到这些？', options: [
            {t: '通过锁定屏幕上的“紧急”按钮', ok: true, why: '对。点按锁定屏幕上的“紧急”，就能在不解锁手机的情况下看到您的医疗信息。'},
            {t: '他们看不到', why: '能看到：锁定屏幕上的“紧急”按钮会显示出来，不需要密码。'}]}},
        {screen: c => list(p, p === 'ios' ? '医疗急救卡' : '医疗信息', [{label: '过敏', sub: typed(c, 'allergies')}, {label: '紧急联系人', sub: 'Sarah（女儿）'}]), done: true,
         say: '<strong>做得好！</strong>您的医疗信息和紧急联系人已保存。如果您用紧急 SOS 呼救，您的紧急联系人也会收到通知。'},
    ], {input: {}});

    function findMap(p, ctx) {
        return app(p, p === 'ios' ? '查找' : 'Find Hub', `<div class="aki"><span class="pq a"></span><span class="pq b"></span><span class="map-pin">⟦smartphone⟧</span><span class="wt">Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</span></div>
            <div class="wo"><strong>Margaret's ${p === 'ios' ? 'iPhone' : 'phone'}</strong><small>Near Bridlington Promenade · 5 min ago</small>
            <div class="wn"><button type="button" data-tap="play-sound">${ctx.ringing ? '⟦bell-ring⟧ 正在播放声音……' : '⟦volume-2⟧ 播放声音'}</button><button type="button" data-tap="directions">Directions</button>
            <button type="button" data-tap="lost">${p === 'ios' ? '标记为丢失' : '保护设备'}</button></div></div>`, {back: false, color: '#fff'});
    }

    SCENARIOS['find-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '如果您的手机丢了，您可以找到它、让它响铃或把它锁住，但前提是事先已经开启了这项功能。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>点按顶部您的姓名。</strong>'},
            {screen: () => list(p, 'Apple 账户', [{id: 'icloud', label: 'iCloud'}, {id: 'findmy', label: '查找'}, {id: 'family', label: '家人共享'}], {back: '设置'}), target: 'findmy', say: '<strong>点按“查找”。</strong>'},
            {screen: c => list(p, '查找', [{id: 'find-toggle', label: '查找我的 iPhone', toggle: !!c.findOn}, {label: '发送最后位置', toggle: !!c.findOn}], {back: 'Apple 账户'}),
             target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>开启“查找我的 iPhone”。</strong>“发送最后位置”会在电池耗尽前把手机的位置发送出去。'},
            {screen: () => homeWith(p, [['findmy', '查找', '#22c55e', ICON2.find]]), target: 'findmy',
             say: '现在想象您找不到手机了。在另一台 Apple 设备上，您会打开<strong>“查找”</strong>（或在电脑上访问 icloud.com/find）。这里请<strong>点按“查找”</strong>。'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '向下滚动并<strong>点按“Google”</strong>。'},
            {screen: () => list(p, 'Google', [{id: 'all-services', label: '所有服务'}, {id: 'account', label: '管理您的 Google 账户'}]), target: 'all-services', say: '<strong>点按“所有服务”。</strong>'},
            {screen: () => list(p, '所有服务', [{id: 'find-hub', label: 'Find Hub', sub: '以前叫“查找我的设备”'}, {id: 'theft', label: '防盗保护'}]), target: 'find-hub', say: '<strong>点按“Find Hub”</strong>（以前叫“查找我的设备”）。<em>三星也有自己的：设置 &gt; 安全和隐私 &gt; 丢失设备保护。</em>'},
            {screen: c => list(p, 'Find Hub', [{id: 'find-toggle', label: '使用 Find Hub', toggle: !!c.findOn}]), target: 'find-toggle', action: c => { c.findOn = true; }, say: '<strong>开启“使用 Find Hub”。</strong>'},
            {screen: () => homeWith(p, [['findmy', 'Find Hub', '#2563eb', ICON2.find]]), target: 'findmy',
             say: '现在想象您找不到手机了。在另一部手机或平板电脑上，您会打开<strong>Find Hub</strong>，或在电脑上访问 google.com/android/find。这里请<strong>点按“Find Hub”</strong>。'},
        ]),
        {screen: c => findMap(p, c), target: 'play-sound', action: c => { c.ringing = true; },
         say: '找到了，就在地图上。如果它就在附近，比如掉在沙发缝里，<strong>点按“播放声音”</strong>：它会大声响铃，即使处于静音。'},
        {screen: c => findMap(p, c), question: {q: '地图显示您的手机在一个您从没去过的地方。您该怎么办？', options: [
            {t: '用“标记为丢失”或“保护设备”把它锁住，并联系警方', ok: true, why: '对。通过“查找”或 Find Hub 把它锁住，不要自己去那里，并向警方和您的运营商报告。'},
            {t: '自己去把它拿回来', why: '千万不要和小偷当面对质。远程锁住手机，然后联系警方。'}]}},
        {screen: c => findMap(p, c), done: true, say: '<strong>做得好！</strong>“查找手机”已开启，您也知道怎样让它响铃或锁住它了。'},
    ], {});

    // ======================================================================================
    // Course: Handy apps
    // ======================================================================================
    function cameraView(p, ctx, scene = 'garden') {
        const view = scene === 'qr'
            ? `<div class="qq akt"><div class="aba"><strong>免费科技小贴士</strong>${UI.qr}<small>扫我</small></div>
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
            ${ctx.sheet === 'delete' ? dialog(p, '要删除这张照片吗？', p === 'ios' ? '它会在“最近删除”中保留 30 天。' : '它会先移到回收站放一段时间，然后才彻底删除。', [['cancel', '取消'], ['confirm-delete', '删除']]) : ''}
            ${homeIndicator(p)}</div>`;
    }

    SCENARIOS['photos'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '<strong>打开“相机”。</strong><em>小窍门：在大多数手机上，也可以在锁定屏幕上向左滑动。</em>', hint: '相机是带相机图案的灰色图标。'},
        {screen: c => cameraView(p, c), target: 'shutter', action: c => { c.taken = true; }, say: '把相机对准这些花，拿稳。<strong>点按大圆按钮</strong>拍照。'},
        {screen: c => cameraView(p, c), target: 'thumb', say: '咔嚓！照片已保存。<strong>点按角落里的小图片</strong>来查看。'},
        {screen: c => photoView(p, c), sequence: ['zoom-in', 'zoom-in'], action: c => { c.zoom = 2; },
         say: '想看得更清楚，把两根手指放在照片上向外分开。这里请<strong>点按 ＋ 两次</strong>。', hint: '点按右上角的 ＋。'},
        {screen: c => photoView(p, c), target: 'share', action: c => { c.sheet = 'share'; }, say: '真漂亮！想把它发给别人，请<strong>点按分享按钮</strong> ⇪（一个带箭头的方框）。'},
        {screen: c => photoView(p, c), target: 'share-messages', action: c => { c.sheet = null; c.shared = true; },
         say: '选择发送方式：信息、电子邮件、WhatsApp 等等。<strong>点按“信息”。</strong>（接着您会选择发给谁。）'},
        {screen: c => photoView(p, c), target: 'delete', action: c => { c.sheet = 'delete'; }, say: '发出去了！现在，如果拍了不想要的照片，<strong>点按垃圾桶</strong> ⟦trash-2⟧来删除。'},
        {screen: c => photoView(p, c), target: 'confirm-delete', action: c => { c.sheet = null; }, say: '手机会先确认一下。<strong>点按“删除”。</strong>'},
        {screen: () => app(p, '照片', '<p class="cf">还没有照片。</p>', {back: false, color: '#fff'}), question: {q: '您误删了一张照片！怎么办？', options: [
            {t: p === 'ios' ? '去“相簿 > 最近删除”里找，把它恢复' : '去回收站（图库 > 回收站）里找，把它恢复', ok: true, why: '对。删除的照片会保留一段时间，通常大约一个月，所以可以找回来。'},
            {t: '没办法，它永远没了', why: '别担心！它会在“最近删除”（iPhone）或回收站（Android）里保留一段时间。'}]}},
        {screen: () => app(p, '照片', '<p class="cf">全部完成。</p>', {back: false, color: '#fff'}), done: true, say: '<strong>做得好！</strong>您会拍照、放大、分享和删除照片了。'},
    ], {});

    SCENARIOS['video-call'] = (p) => {
        const appName = p === 'ios' ? 'FaceTime 通话' : 'Google Meet';
        return withCtx([
            {screen: () => homeWith(p, [['vcall', appName, p === 'ios' ? '#22c55e' : '#0ea5e9', ICON2.video]]), target: 'vcall',
             say: p === 'ios' ? '如果您的家人也用 iPhone，<strong>FaceTime 通话</strong>可以免费打视频电话。<strong>点按“FaceTime 通话”。</strong>' : '<strong>Google Meet</strong>可以在 Android 上免费打视频电话，也能打给 iPhone 用户。<strong>点按“Google Meet”。</strong>'},
            {screen: () => app(p, appName, `<button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="new-call">${p === 'ios' ? '新建 FaceTime 通话' : '新建'}</button><p class="cf">最近的通话会显示在这里。</p>`, {back: false, color: '#fff'}),
             target: 'new-call', say: `<strong>Tap ${p === 'ios' ? '新建 FaceTime 通话' : '新建'}.</strong>`},
            {screen: c => app(p, p === 'ios' ? '新建 FaceTime 通话' : '呼叫', `<div class="xz">To: ${field('callto', '姓名或号码', c)}</div>
                <button type="button" class="ce ${p === 'ios' ? 'dk' : 'co'}" data-tap="video-start">⟦video⟧ ${p === 'ios' ? 'FaceTime 通话' : '视频通话'}</button>`, {color: '#fff'}),
             target: 'video-start', require: c => typed(c, 'callto').toLowerCase().startsWith('sar'), requireHint: '先在“收件人”框里输入 Sarah。',
             say: '输入您通讯录里某个人的名字。<strong>输入 Sarah</strong>，然后<strong>点按视频按钮</strong>。'},
            {screen: c => waCall(p, c), wait: 2000, target: 'flip', action: c => { c.flipped = true; },
             say: '响铃后，Sarah 接听了。想让她看花园，请<strong>点按翻转按钮</strong> ⟦switch-camera⟧，使用背面的摄像头。', hint: '等 Sarah 接听后，再点按 ⟦switch-camera⟧。'},
            {screen: c => waCall(p, c), target: 'end', say: '说完后，<strong>点按红色按钮</strong>挂断。'},
            {screen: () => app(p, appName, '<p class="cf">Sarah · 视频 · 3 分钟</p>', {back: false, color: '#fff'}), question: {q: '您的朋友用 Android 手机，您用 iPhone。还能视频通话吗？', options: [
                {t: '能，用 WhatsApp 或 Google Meet，两种手机都能用', ok: true, why: '没错。FaceTime 通话主要是 iPhone 对 iPhone。WhatsApp 和 Google Meet 在两种手机之间都能用。'},
                {t: '不能，永远不行', why: '可以：WhatsApp 和 Google Meet 在两种手机上都能用。'}]}},
            {screen: () => app(p, appName, '<p class="cf">全部完成。</p>', {back: false, color: '#fff'}), done: true, say: '<strong>做得好！</strong>您打了一个视频电话，还展示了后置摄像头看到的景色。'},
        ], {input: {}});
    };

    SCENARIOS['qr-codes'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '二维码就是海报和菜单上那种黑白方块图案。您的相机就能读取，不需要额外的 App。<strong>打开“相机”。</strong>'},
        {screen: c => cameraView(p, c, 'qr'), wait: 1800, target: 'qr-link',
         say: '把相机对准二维码，稳住一会儿。屏幕上会出现<strong>一个链接</strong>：检查它看起来是不是您预期的来源，再<strong>点按它</strong>。',
         hints: {shutter: '不用拍照：只要对准，等链接出现，然后点按链接。'},
         hint: p === 'android' ? '等链接出现，然后点按它。如果什么都没出现，试试 Google 智能镜头。' : '等链接出现，然后点按它。'},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>免费科技小贴士</h3><p>用通俗易懂的话讲手机、电脑和上网安全。</p></div>', {color: '#f8fafc'}),
         question: {q: '您在停车场的付款机上看到一个二维码贴纸。最安全的付款方式是什么？', options: [
            {t: '用停车场的官方 App 或直接用付款机，不要用贴上去的二维码', ok: true, why: '对。骗子会把假二维码贴在真的上面，窃取银行卡信息。检查它是不是后贴的贴纸，使用官方 App 或标牌。'},
            {t: '扫码付款，更快', why: '停车场付款机上的假二维码贴纸是已知的骗局。请使用官方 App 或付款机本身。'}]}},
        {screen: () => app(p, 'jamesgartshore.co.uk', '<div class="zr"><h3>免费科技小贴士</h3></div>', {color: '#f8fafc'}), done: true, say: '<strong>做得好！</strong>您会用相机扫二维码了，也知道要先检查链接。'},
    ], {});

    function inbox(p, ctx) {
        const mails = [['sarah', 'Sarah', '周日的照片 📷', '妈，这是午饭时的照片……'],
                       ['tv', 'TV Licensing', '您的许可证已过期', '请立即处理以免被起诉。更新您的付款……'],
                       ['library', 'Bridlington Library', '您借的书到期了', '您借的物品周五到期归还。']].filter(m => !(ctx.junked && m[0] === 'tv'));
        return app(p, p === 'ios' ? '收件箱' : '主要', `<div class="fo">${mails.map(([id, from, subj, prev]) =>
            `<button type="button" class="ck${ctx.read && ctx.read.includes(id) ? '' : ' lt'}" data-tap="mail-${id}"><strong>${from}</strong><small><b>${subj}</b> ${prev}</small></button>`).join('')}</div>`,
            {back: false, color: '#fff'});
    }
    function mailView(p, ctx, which) {
        if (which === 'sarah') {
            return app(p, '', `<div class="mail"><p><strong>Sarah</strong> · 发给我</p><h3>周日的照片 📷</h3><p>妈，这是午饭时的照片。见到你真开心！x</p>
                <div class="aep">⟦image⟧ lunch.jpg</div>${ctx.replying ? `${field('mailreply', '写下您的回复……', ctx)}<button type="button" class="ce co" data-tap="send">Send</button>`
                : '<button type="button" class="cp" data-tap="reply">↩ Reply</button>'}</div>`, {color: '#fff'});
        }
        return app(p, '', `<div class="mail"><button type="button" class="acp" data-tap="sender"><strong>TV Licensing</strong> ${ctx.showSender ? '&lt;tvlicensing.renewals@outlook-mail.com&gt;' : '›'}</button>
            <h3>您的许可证已过期</h3><p>请立即处理以免被起诉。请在 24 小时内更新您的付款信息：<u>tv-licence-renew-uk.com</u></p>
            ${ctx.showSender ? `<button type="button" class="ce tw" data-tap="junk">${p === 'ios' ? '移到垃圾邮件' : '⋮ 举报网络钓鱼'}</button>` : ''}</div>`, {color: '#fff'});
    }

    SCENARIOS['email'] = (p) => withCtx([
        {screen: () => home(p), target: 'mail', say: `<strong>Open ${p === 'ios' ? '邮件' : '您的电子邮件 App（大多数 Android 手机上是 Gmail）'}.</strong>`},
        {screen: c => inbox(p, c), target: 'mail-sarah', say: '新邮件以粗体显示。<strong>点按 Sarah 的邮件</strong>来阅读。'},
        {screen: c => mailView(p, c, 'sarah'), target: 'reply', action: c => { c.replying = true; }, say: '要回复，请<strong>点按“回复”</strong> ↩。'},
        {screen: c => mailView(p, c, 'sarah'), target: 'send', require: c => typed(c, 'mailreply').length > 0, requireHint: '先输入一段简短的回复，再点按“发送”。',
         action: c => { c.replying = false; c.read = ['sarah']; }, say: '<strong>输入一段简短的回复</strong>（比如“谢谢，很喜欢！”），然后<strong>点按“发送”</strong>。'},
        {screen: () => app(p, '', '<p class="cf">已发送 ⟦check⟧</p><button type="button" class="cp" data-tap="back">‹ 返回收件箱</button>', {color: '#fff'}), target: 'back', say: '<strong>点按“返回”</strong>回到收件箱。'},
        {screen: c => inbox(p, c), target: 'mail-tv', say: '有一封来自“TV Licensing”的邮件让人担心。<strong>打开它</strong>，但不要点里面的任何东西。'},
        {screen: c => mailView(p, c, 'tv'), target: 'sender', action: c => { c.showSender = true; },
         say: '诈骗邮件常常用真实的名称，却配假的地址。<strong>点按发件人姓名</strong>，查看真正的电子邮件地址。',
         hint: '点按邮件顶部的“TV Licensing”。'},
        {screen: c => mailView(p, c, 'tv'), target: 'junk', action: c => { c.junked = true; c.showSender = false; },
         say: '它来自 <strong>outlook-mail.com</strong>，而不是 tvlicensing.co.uk。这是诈骗。<strong>点按 ' + (p === 'ios' ? '移到垃圾邮件' : '举报网络钓鱼') + '。</strong>您也可以把诈骗邮件转发到 report@phishing.gov.uk。'},
        {screen: c => inbox(p, c), question: {q: '是什么暴露了这是诈骗？', options: [
            {t: '发件人的真实地址、威胁的口气和 24 小时的期限', ok: true, why: '没错。真正的机构不会用期限来威胁您，他们的邮件来自他们自己的网址。'},
            {t: '没什么，看着挺真的', why: '检查发件人地址：它不是 TV Licensing 的。威胁和紧迫的期限也是很大的警示信号。'}]}},
        {screen: c => inbox(p, c), done: true, say: '<strong>做得好！</strong>您会阅读和回复邮件，也会识别并举报诈骗了。'},
    ], {input: {}});

    function storeResultsNhs(p) {
        const btn = p === 'ios' ? '获取' : '安装';
        const rows = [{id: 'fake1', name: 'NHS Appointment Booker', dev: 'HealthApps Ltd', ad: true, rating: '3.2', bg: '#38bdf8'},
                      {id: 'real', name: 'NHS App', dev: 'NHS England', rating: '4.8', bg: '#005EB8'},
                      {id: 'fake2', name: 'My NHS Records Free', dev: 'QuickDev Apps', rating: '2.9', bg: '#60a5fa'}];
        return `<div class="cg ph-${p}">${statusBar(p)}<div class="hq bz">${ICON.search}<span>nhs app</span></div>
            <div class="mi">${rows.map(r => `<div class="nh">${appIcon(r.bg, ICON2.heart)}<div class="kc"><strong>${r.name}</strong><span>${r.dev}${r.ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${r.rating} ⟦star⟧</span></div>
            <button type="button" class="km" data-tap="${r.id}-get">${btn}</button></div>`).join('')}</div></div>`;
    }

    SCENARIOS['apps-safely'] = (p) => withCtx([
        {screen: () => home(p), target: 'store', say: `Let\'s download the NHS App safely. <strong>Open the ${p === 'ios' ? 'App Store' : 'Play 商店'}.</strong>`},
        {screen: () => storeHome(p), target: p === 'ios' ? 'search-tab' : 'search-bar', say: p === 'ios' ? '<strong>点按“搜索”。</strong>' : '<strong>点按搜索栏。</strong>'},
        {screen: () => storeResultsNhs(p), target: 'real-get',
         say: '我们搜索了“NHS App”。很多 App 的名字里都带“NHS”。请查看<strong>是谁开发的</strong>：真正的 App 由 <strong>NHS England</strong> 开发。<strong>点按 ' + (p === 'ios' ? '获取' : '安装') + ' 真正那一个旁边的按钮。</strong>',
         hints: {'fake1-get': '那是 HealthApps Ltd 的，而且是广告。真正的 NHS App 由 NHS England 开发。', 'fake2-get': '那是 QuickDev Apps 的，不是 NHS 的。真正的由 NHS England 开发。'}},
        {screen: () => home(p, {hold: ['weather']}), target: 'weather',
         say: '安装好了！现在删掉一个您从不用的 App，整理一下并腾出空间。<strong>按住“天气”App</strong>，直到出现菜单。', hint: '手指在“天气”图标上放一两秒钟。'},
        {screen: () => home(p) + dialog(p, p === 'ios' ? '要移除“天气”吗？' : '天气', p === 'ios' ? '从主屏幕移除后，该 App 仍会保留在 App 资源库中。' : '', p === 'ios'
            ? [['delete-app', '删除 App'], ['remove-home', '从主屏幕移除'], ['cancel', '取消']] : [['app-info', '应用信息'], ['delete-app', '卸载'], ['cancel', '取消']]),
         target: 'delete-app', say: p === 'ios' ? '<strong>点按“移除 App”</strong>，再<strong>点按“删除 App”</strong>（这里是一个按钮）。' : '<strong>点按“卸载”。</strong>',
         hints: {'remove-home': '那只是隐藏图标，App 仍留在手机里。请点按“删除 App”。'}},
        {screen: () => home(p, {removed: ['weather']}), question: {q: '一个 App 要求付款才能“解锁”您的 NHS 记录。您怎么看？', options: [
            {t: '这不是真正的 NHS App，真的完全免费', ok: true, why: '没错。NHS App 是免费的。凡是要您为 NHS 服务付费的，都应该删掉。'},
            {t: '付款吧，这是给 NHS 的', why: '真正的 NHS App 是免费的，由 NHS England 开发。要钱的 App 就不是真的。'}]}},
        {screen: () => home(p, {removed: ['weather']}), done: true, say: '<strong>做得好！</strong>您能分辨真 App 和山寨 App，也会删除不需要的 App 了。'},
    ], {});

    // ======================================================================================
    // Course: Health, money and travel
    // ======================================================================================
    const NHS = '#005EB8';

    function nhsScreen(p, ctx, page) {
        if (page === 'login') {
            return app(p, 'NHS App', `<div class="wv"><p>欢迎回来。</p>
                <button type="button" class="ce co" data-tap="faceid">${p === 'ios' ? '使用面容 ID 登录' : '使用指纹登录'}</button>
                <button type="button" class="cp" data-tap="password">用电子邮箱和密码登录</button></div>`, {back: false, color: NHS});
        }
        if (page === 'home') {
            const tiles = [['prescriptions', '⟦pill⟧', '处方'], ['appointments', '⟦calendar⟧', '预约'], ['records', '⟦clipboard-list⟧', '您的健康'], ['messages', '⟦mail⟧', '信息']];
            return app(p, 'NHS App', `<p class="cf">Good morning, Margaret</p><div class="abo">${tiles.map(([id, ic, t]) => `<button type="button" data-tap="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`, {back: false, color: NHS});
        }
        if (page === 'prescriptions') {
            return app(p, '处方', '<div class="fo"><button type="button" class="ck" data-tap="order"><strong>续开处方</strong><small>选择您已经在用的药</small></button><div class="ck"><strong>查看您的订单</strong></div></div>', {color: NHS});
        }
        if (page === 'choose') {
            const meds = [['med-1', 'Amlodipine 5mg 片'], ['med-2', 'Atorvastatin 20mg 片']];
            return app(p, '选择药品', `<div class="fo">${meds.map(([id, name]) => `<button type="button" class="ck check${(ctx.meds || []).includes(id) ? ' on' : ''}" data-tap="${id}"><span class="ajj">${(ctx.meds || []).includes(id) ? '⟦check⟧' : ''}</span><strong>${name}</strong></button>`).join('')}</div>
                <button type="button" class="ce co" data-tap="continue">Continue</button>`, {color: NHS});
        }
        if (page === 'confirm') {
            return app(p, '确认您的订单', `<p class="cf">Amlodipine 5mg 片<br>取药地点：您指定的药房</p><button type="button" class="ce co" data-tap="confirm">确认并下单</button>`, {color: NHS});
        }
        if (page === 'sent') return app(p, '订单已发送', '<p class="cf">⟦check⟧ 您的处方申请已发送到您的全科医生诊所。通常需要 2 到 3 个工作日。</p><button type="button" class="cp" data-tap="home">回到首页</button>', {color: NHS});
        return app(p, '预约', '<div class="fo"><div class="ck"><strong>全科医生预约</strong><small>周二 10:30 · 您的全科医生诊所</small></div></div>', {color: NHS});
    }

    SCENARIOS['nhs-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [['nhs', 'NHS App', NHS, ICON2.heart]]), target: 'nhs',
         say: '<strong>NHS App</strong> 是免费的，可以用来续开处方、查看预约等等。（这个练习版是模拟的，专为这节课制作。）<strong>点按“NHS App”。</strong>'},
        {screen: c => nhsScreen(p, c, 'login'), target: 'faceid', say: `用 NHS login 设置好之后，您就可以用${p === 'ios' ? 'face' : 'fingerprint'}登录。<strong>点按“使用${p === 'ios' ? '面容 ID' : 'fingerprint'}登录”。</strong>`,
         hints: {password: '这样也行，但用脸或指纹更快。请点按蓝色按钮。'}},
        {screen: c => nhsScreen(p, c, 'home'), target: 'prescriptions', say: '<strong>点按“处方”。</strong>'},
        {screen: c => nhsScreen(p, c, 'prescriptions'), target: 'order', say: '<strong>点按“续开处方”。</strong>'},
        {screen: c => nhsScreen(p, c, 'choose'), target: 'continue', require: c => (c.meds || []).length > 0, requireHint: '先点按一种药把它勾选，再点按“继续”。',
         say: '<strong>点按您需要的药</strong>把它勾选（试试 Amlodipine），然后<strong>点按“继续”</strong>。', free: ['med-1', 'med-2']},
        {screen: c => nhsScreen(p, c, 'confirm'), target: 'confirm', say: '检查无误后，<strong>点按“确认并下单”</strong>。'},
        {screen: c => nhsScreen(p, c, 'sent'), target: 'home', say: '已发送到您的诊所！<strong>点按“回到首页”。</strong>'},
        {screen: c => nhsScreen(p, c, 'home'), target: 'appointments', say: '您还可以查看预约。<strong>点按“预约”。</strong>'},
        {screen: c => nhsScreen(p, c, 'appointments'), question: {q: '一条短信写着“NHS：您有资格领取免费检测包，请输入银行信息支付邮费”。这是什么？', options: [
            {t: '诈骗。NHS 绝不会通过短信索要银行信息', ok: true, why: '没错。请使用 NHS App 或直接联系您的全科医生诊所，永远不要点短信里的链接。'},
            {t: '是真的，只是邮费而已', why: 'NHS 绝不会发短信索要银行信息。这是诈骗：把它转发给 7726。'}]}},
        {screen: c => nhsScreen(p, c, 'appointments'), done: true, say: '<strong>做得好！</strong>您续开了处方，还查看了预约。'},
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
        if (page === 'login') return app(p, 'Practice Bank', `<div class="wv"><p>Log in</p><button type="button" class="ce dk" data-tap="faceid">${p === 'ios' ? '使用面容 ID 登录' : '使用指纹登录'}</button></div>`, {back: false, color: BANK});
        if (page === 'accounts') return app(p, '您的账户', '<button type="button" class="xo" data-tap="current"><span>Current account</span><strong>£1,284.50</strong></button><div class="xo"><span>Savings</span><strong>£3,020.00</strong></div>', {back: false, color: BANK});
        if (page === 'txns') {
            const t = [['txn-tesco', 'Tesco Stores', '−£42.18', '今天'], ['txn-gift', 'GIFTCARDS-ONLINE.COM', '−£249.00', '今天'], ['txn-pension', 'State Pension', '+£921.60', '昨天'], ['txn-water', 'Yorkshire Water DD', '−£38.00', '周一']];
            return app(p, '活期账户', `<p class="cf">Balance <strong>£1,284.50</strong></p><div class="fo">${t.map(([id, n, a, d]) => `<button type="button" class="ck" data-tap="${id}"><strong>${n}</strong><small>${d}</small><span class="${a[0] === '+' ? 'aks' : ''}">${a}</span></button>`).join('')}</div>`, {color: BANK});
        }
        if (page === 'gift') return app(p, '付款', `<div class="ur"><span class="abg">−£249.00</span><strong>GIFTCARDS-ONLINE.COM</strong><small>今天 03:12 · 卡号尾号 4421</small></div>
            <div class="fo"><button type="button" class="ck" data-tap="freeze"><strong>⟦snowflake⟧ 冻结银行卡</strong><small>${ctx.frozen ? '银行卡已冻结 ⟦check⟧' : '立即停止付款'}</small>${tog(!!ctx.frozen)}</button>
            <button type="button" class="ck" data-tap="report"><strong>举报这笔付款</strong><small>不认识这笔付款？告诉我们</small></button></div>`, {color: BANK});
        return '';
    }

    SCENARIOS['banking'] = (p) => withCtx([
        {screen: () => homeWith(p, [['bank', '银行', BANK, ICON2.pound]]), target: 'bank',
         say: '银行 App 让您随时查看自己的钱。（这是供练习的模拟银行。）<strong>打开“银行”App。</strong>'},
        {screen: c => bankScreen(p, c, 'login'), target: 'faceid', say: `<strong>用您的${p === 'ios' ? 'face' : 'fingerprint'}登录。</strong>绝不要把银行密码告诉任何人。`},
        {screen: c => bankScreen(p, c, 'accounts'), target: 'current', say: '<strong>点按您的活期账户</strong>，查看收入和支出。'},
        {screen: c => bankScreen(p, c, 'txns'), target: 'txn-gift',
         say: '浏览一下这些付款。有一笔您不认识：<strong>凌晨 3 点，£249，付给一个礼品卡网站</strong>。<strong>点按它。</strong>',
         hints: {'txn-tesco': '那是您买东西的付款。找一笔您不认识的。', 'txn-pension': '那是您的养老金到账。找那笔不对劲的。', 'txn-water': '那是您的水费账单。找那笔不对劲的。'}},
        {screen: c => bankScreen(p, c, 'gift'), target: 'freeze', action: c => { c.frozen = true; },
         say: '<strong>点按“冻结银行卡”</strong>。它会立即停止后续付款，之后如果证明没问题，您可以解冻。',
         hints: {report: '先冻结银行卡，阻止更多付款。然后再举报。'}},
        {screen: c => bankScreen(p, c, 'gift'), question: {q: '您已经冻结了银行卡。接下来呢？', options: [
            {t: '拨打 159 或银行卡上的号码联系银行，或在 App 里举报', ok: true, why: '对。他们可以调查、注销银行卡，往往还能追回钱款。越早告诉他们越好。'},
            {t: '等等看会不会再发生', why: '马上告诉您的银行。他们知道得越早，能做的越多。'}]}},
        {screen: c => bankScreen(p, c, 'gift'), done: true, say: '<strong>做得好！</strong>您查看了账户，发现了一笔不认识的付款，并冻结了银行卡。'},
    ], {});

    function walletScreen(p, ctx, page) {
        const color = '#111827';
        const card = `<div class="mz${ctx.added ? '' : ' ais'}"><strong>Practice Bank</strong><span>•••• 4421</span><small>借记卡</small></div>`;
        if (page === 'empty') return app(p, p === 'ios' ? '钱包' : 'Google 钱包', `<p class="cf">添加一张银行卡，就能用手机在商店付款。</p><button type="button" class="ce co" data-tap="add">${p === 'ios' ? '＋ 添加银行卡' : '＋ 添加到钱包'}</button>`, {back: false, color});
        if (page === 'scan') return app(p, '添加银行卡', `<div class="nt">${ctx.busy ? '<span class="adj"></span>' : ''}${card}</div>
            <p class="cf">${ctx.busy ? '把银行卡对准取景框……' : '已找到银行卡 ⟦check⟧'}</p>${ctx.busy ? '' : '<button type="button" class="ce co" data-tap="next">Next</button>'}`, {color});
        if (page === 'verify') return app(p, '验证银行卡', `<p class="cf">您的银行需要确认是您本人。请选择获取验证码的方式：</p><div class="fo">
            <button type="button" class="ck" data-tap="verify-text"><strong>短信</strong><small>发送到 ••••• •••123</small></button><button type="button" class="ck" data-tap="verify-call"><strong>致电银行</strong></button></div>`, {color});
        if (page === 'code') return app(p, '输入验证码', `<div class="jp ex"><strong>信息 · 现在</strong><span>Practice Bank：您的钱包验证码是 529173。请勿告诉任何人。</span></div>
            <div class="sa">${[...'529173'].map((d, n) => `<span>${n < (ctx.pos || 0) ? d : ''}</span>`).join('')}</div>${keypad(p)}`, {color});
        if (page === 'ready') return app(p, p === 'ios' ? '钱包' : 'Google 钱包', `${card}<p class="cf">⟦check⟧ 您的银行卡可以使用了。</p>`, {back: false, color});
        return `<div class="mg">${statusBar(p)}${card}<p class="yk">${ctx.busy ? (p === 'ios' ? '靠近读卡器……' : '靠近读卡器……') : '⟦check⟧ 完成'}</p>
            <div class="yu">⟦credit-card⟧ £4.20</div>${p === 'ios' ? `<button type="button" class="jr aii" data-tap="side" aria-label="Side button">${UI.power}</button>` : ''}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['contactless'] = (p) => withCtx([
        {screen: () => homeWith(p, [['wallet', p === 'ios' ? '钱包' : '钱包', '#111827', ICON2.wallet]]), target: 'wallet',
         say: `用手机付款又快又安全：商店看不到您的银行卡号。<strong>打开 ${p === 'ios' ? '钱包' : 'Google 钱包'}。</strong>`},
        {screen: c => walletScreen(p, c, 'empty'), target: 'add', say: `<strong>Tap ${p === 'ios' ? '＋ 添加银行卡' : '＋ 添加到钱包'}</strong>, then choose a debit or credit card.`},
        {screen: c => walletScreen(p, c, 'scan'), wait: 2000, target: 'next',
         say: '手机用相机读取您的银行卡，所以不用输入卡号。<strong>把银行卡对准取景框</strong>，然后<strong>点按“下一步”</strong>。<em>绝不要在短信或邮件里的网站上输入银行卡号。</em>'},
        {screen: c => walletScreen(p, c, 'verify'), target: 'verify-text', say: '您的银行要确认是您本人。<strong>点按“短信”。</strong>'},
        {screen: c => walletScreen(p, c, 'code'), sequence: [...'529173'].map(d => 'k' + d), action: c => { c.added = true; },
         say: '银行会用短信发来一个验证码。<strong>输入 5 2 9 1 7 3。</strong>记住：这个验证码只能输入到您自己的手机里，绝不能给任何向您索要的人。', hint: '输入短信里的验证码：5 2 9 1 7 3。'},
        {screen: c => walletScreen(p, c, 'ready'), target: 'home-go', say: '银行卡准备好了。现在我们去商店付款。<strong>点按卡片上的任意位置。</strong>', alias: {}},
        {screen: c => walletScreen(p, c, 'pay'), ...(p === 'ios'
            ? {sequence: ['side', 'side'], say: '在收银台，<strong>连按两下 iPhone 的侧边按钮</strong>（这里请点按 ⟦power⟧ 两次），看着屏幕进行面容 ID 验证，然后把手机顶部靠近读卡器。', hint: '点按侧边的 ⟦power⟧ 按钮两次。'}
            : {target: 'pay-now', say: '在收银台，只要<strong>解锁手机，把手机背面靠近读卡器</strong>。这里请<strong>点按读卡器</strong>。'})},
        {screen: c => walletScreen(p, c, 'paid'), wait: 1500, question: {q: '用手机付款安全吗？', options: [
            {t: '安全，比银行卡还安全：需要您的脸、指纹或密码，而且商店看不到您的银行卡号', ok: true, why: '没错。而且如果手机丢了，没解锁的话没人能用它付款。'},
            {t: '不安全，谁都能用', why: '每次付款都需要您的脸、指纹或密码，所以其实比非接触式银行卡更安全。'}]}},
        {screen: c => walletScreen(p, c, 'paid'), done: true, say: '<strong>做得好！</strong>您的银行卡已经放进手机，并完成了一次练习付款。'},
    ], {});

    // "Tap anywhere on the card" and the Android "tap the reader": make those parts tappable.
    const _cl = SCENARIOS['contactless'];
    SCENARIOS['contactless'] = p => {
        const steps = _cl(p);
        const ready = steps.find(s => s.target === 'home-go');
        const readyScreen = ready.screen;
        ready.screen = c => readyScreen(c).replace('<div class="mz', '<button type="button" data-tap="home-go" class="yj"><div class="mz').replace('<small>借记卡</small></div>', '<small>借记卡</small></div></button>');
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
                <button type="button" data-tap="to"><small>To</small><strong>${ctx.dest || '选择车站'}</strong></button>
                <div><small>When</small><strong>Today, leaving after 10:30</strong></div>
                <button type="button" data-tap="railcard"><small>Railcard</small><strong>${ctx.railcard ? 'Senior Railcard ⟦check⟧' : '添加优惠卡'}</strong></button></div>
                <button type="button" class="ce dk" data-tap="search">Find trains</button>`, {back: false, color,
                overlay: ctx.picking === 'to' ? `<div class="ei"><div class="cv"><p><strong>选择车站</strong></p>${['Hull', 'Scarborough', 'Driffield'].map(s => `<button type="button" class="cj" data-tap="st-${s.toLowerCase()}">${s}</button>`).join('')}</div></div>`
                    : ctx.picking === 'railcard' ? `<div class="ei"><div class="cv"><p><strong>添加优惠卡</strong></p>${[['rc-senior', 'Senior Railcard（60 岁以上）'], ['rc-two', 'Two Together Railcard'], ['rc-none', '不使用优惠卡']].map(([id, t]) => `<button type="button" class="cj" data-tap="${id}">${t}</button>`).join('')}</div></div>` : ''});
        }
        if (page === 'results') {
            const trains = [['t-1045', '10:45', '11:32', '直达'], ['t-1145', '11:45', '12:32', '直达'], ['t-1245', '12:45', '13:32', '直达']];
            return app(p, 'Bridlington → Hull', `<div class="fo">${trains.map(([id, dep, arr, ch]) => `<button type="button" class="ck" data-tap="${id}"><strong>${dep} → ${arr}</strong><small>${ch} · 47 min</small><span>£7.40</span></button>`).join('')}</div>
                <p class="cf abn">价格是为这次练习编的。已应用优惠卡折扣。</p>`, {color});
        }
        if (page === 'tickets') {
            return app(p, '10:45 → 11:32', `<div class="fo"><button type="button" class="ck" data-tap="single"><strong>非高峰单程票</strong><span>£7.40</span></button>
                <button type="button" class="ck" data-tap="return"><strong>非高峰当日往返票</strong><small>今天回程</small><span>£9.85</span></button></div>
                <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="pay">${p === 'ios' ? ' Pay' : 'G Pay'}</button>`, {color});
        }
        return app(p, '您的车票', `<div class="adt"><strong>非高峰当日往返票</strong><span>Bridlington ⇄ Hull</span><span>今天 · Senior Railcard</span>
            ${UI.qr}<small>在检票闸机处扫描它，或出示给列车员。</small></div>`, {back: false, color});
    }

    SCENARIOS['trains'] = (p) => withCtx([
        {screen: () => homeWith(p, [['trains', '火车', '#7c2d12', ICON2.train]]), target: 'trains',
         say: '火车 App 让您在手机上买票，不用排队。（这个练习 App 是模拟的：价格和时间都是编的。）<strong>打开“火车”。</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'to', action: c => { c.picking = 'to'; }, say: '您从 Bridlington 出发。<strong>点按“到”</strong>选择目的地。'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'st-hull', action: c => { c.picking = null; c.dest = 'Hull'; }, say: '<strong>点按 Hull。</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'railcard', action: c => { c.picking = 'railcard'; },
         say: '60 岁以上？<strong>Senior Railcard</strong> 在大多数车票上能省三分之一。<strong>点按“优惠卡”</strong>添加您的。'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'rc-senior', action: c => { c.picking = null; c.railcard = true; }, say: '<strong>点按 Senior Railcard。</strong>'},
        {screen: c => trainScreen(p, c, 'plan'), target: 'search', say: '<strong>点按“查找列车”。</strong>'},
        {screen: c => trainScreen(p, c, 'results'), target: 't-1045', say: '这些是列车班次。<strong>点按 10:45 那一班。</strong>'},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'return', action: () => {}, say: '今天就回来？当日往返票通常比两张单程票便宜。<strong>点按“非高峰当日往返票”</strong>，然后付款。',
         hints: {single: '单程票只能去一趟。您今天要回来，所以请点按“非高峰当日往返票”。', pay: '先选车票：点按“非高峰当日往返票”。'}},
        {screen: c => trainScreen(p, c, 'tickets'), target: 'pay', say: `<strong>点按 ${p === 'ios' ? '付款' : 'G Pay'}</strong>，用手机里的银行卡付款（就是非接触式支付那节课里的卡）。`},
        {screen: c => trainScreen(p, c, 'ticket'), question: {q: '回家的火车还没到，您的手机电量就不多了。怎么做比较好？', options: [
            {t: '给车票截个屏，并开启省电模式', ok: true, why: '对。有些车票用截图就能使用，省电模式有助于让电量撑得更久。很多 App 也能让您把车票添加到钱包。'},
            {t: '不用管，没事的', why: '如果手机没电了，您就没法出示车票。请截个屏并节省电量。'}]}},
        {screen: c => trainScreen(p, c, 'ticket'), done: true, say: '<strong>做得好！</strong>您规划了一次行程、添加了优惠卡，并在手机上买了票。'},
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

    const busTable = `<div class="sj"><strong>121 路公交：Bridlington 到 Hull</strong><small>仅为练习用的时间</small>
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
        return app(p, '公交时间', busTable, {back: false, color: '#fff',
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
            ? '截屏就是给屏幕上显示的内容拍一张照片，比如这些公交时间。同时按下<strong>侧边按钮</strong>（右侧）和<strong>调高音量键</strong>（左侧），然后松开。这里请<strong>先点按侧边按钮，再点按调高音量</strong>。'
            : '截屏就是给屏幕上显示的内容拍一张照片，比如这些公交时间。同时按下<strong>电源键</strong>和<strong>调低音量键</strong>，然后松开。这里请<strong>先点按电源键，再点按调低音量</strong>。',
         hints: {'vol-down': p === 'ios' ? '在 iPhone 上是调高音量，加侧边按钮。' : '先按电源键，它在右侧靠上的位置。',
                 'vol-up': p === 'ios' ? '先按右侧的侧边按钮。' : '在 Android 上是调低音量，加电源键。',
                 side: '现在按调高音量键，在左侧。', power: '现在按调低音量键。'},
         hint: p === 'ios' ? '侧边按钮在右边缘。调高音量键在左边。' : '电源键是右边缘上面的那个按钮。'},
        ...(p === 'ios' ? [
            {screen: c => shotScreen(p, c), target: 'thumb', say: '咔嚓！右下角出现了一张小图片。<strong>点按它</strong>查看您的截屏。<em>如果不管它，几秒钟后会自动保存。</em>'},
            {screen: c => shotEditor(p, c), target: 'done', action: c => { c.doneSheet = true; }, say: '您可以在这里在上面涂画或裁剪。<strong>点按左上角的“完成”。</strong>'},
            {screen: c => shotEditor(p, c), target: 'save-photos', action: c => { c.saved = true; },
             say: '<strong>点按“存储到‘照片’”。</strong>', hints: {'delete-shot': '那样会把它丢掉。请点按“存储到‘照片’”。', 'save-files': '“文件”也行，但“照片”更容易找到。请点按“存储到‘照片’”。'}},
        ] : [
            {screen: c => shotScreen(p, c), target: 'shot-share', action: c => { c.shareSheet = true; },
             say: '咔嚓！出现了一张小图片，下面有几个按钮。它已经保存好了。<strong>点按“分享”</strong>把它发给别人。', hints: {'shot-edit': '“编辑”可以裁剪或涂画。现在先点按“分享”。'}},
            {screen: c => shotScreen(p, c), target: 'share-sarah', action: c => { c.shareSheet = false; c.saved = true; },
             say: '<strong>点按 Sarah</strong>，把公交时间发给她。'},
        ]),
        {screen: c => shotScreen(p, c), question: {q: '以后在哪里能找到您的截屏？', options: [
            {t: '在“照片”App 的“截屏”相簿里', ok: true, why: '对。它们和您的照片存放在一起，您可以像对待其他照片一样查看、分享或删除。'},
            {t: '一天后就消失了', why: '它们会一直保留，直到您删除。请到“照片”App 的“截屏”相簿里找。'}]}},
        {screen: c => shotScreen(p, c), done: true,
         say: '<strong>做得好！</strong>截屏对公交时间、车票、错误提示，以及任何想留着或给别人看的东西都很方便。用完后可以从“照片”里删除它们。'},
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
        const box = `<button type="button" class="ln" data-hold="search-box" data-tap="search-tap">${ICON.search}<span>${searchText || '搜索地图'}</span></button>`;
        const bubble = ctx.pasteBubble && !ctx.pasted ? '<button type="button" class="yi" data-tap="paste">Paste</button>' : '';
        const results = ctx.pasted && !ctx.pinned ? `<div class="uo"><button type="button" class="ck" data-tap="result"><strong>${ADDRESS}</strong><small>Address · 0.8 miles</small></button></div>` : '';
        const card = ctx.pinned ? `<div class="gz"><strong>${ADDRESS}</strong><small>0.8 miles · 4 min by car</small>
            <button type="button" class="ce co" data-tap="directions">Directions</button></div>` : '';
        return `<div class="cg pr ph-${p}">${statusBar(p)}
            <div class="ra">${ctx.pinned ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span></div>
            <div class="rb">${box}${bubble}</div>${results}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['copy-paste'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: 'Sarah 给您发来一个地址。复制它就不用再打一遍了。<strong>打开“信息”。</strong>'},
        {screen: () => app(p, '信息', `<div class="fo"><button type="button" class="ck lt" data-tap="open-sarah"><strong>Sarah</strong><small>Here's her address: ${ADDRESS}</small><span>10:03</span></button>
            <div class="ck"><strong>Jean</strong><small>See you Thursday!</small><span>Yesterday</span></div></div>`, {back: false, color: p === 'ios' ? '#f2f2f7' : '#fff'}),
         target: 'open-sarah', say: '<strong>点按 Sarah 的消息。</strong>'},
        {screen: c => copyChat(p, c), target: 'address', action: c => { c.copyMenu = true; },
         say: '<strong>按住带地址的那条消息</strong>（手指放着一两秒钟），直到出现菜单。', hint: '手指一直按在第二条消息上，直到出现菜单。'},
        {screen: c => copyChat(p, c), target: 'copy', action: c => { c.copyMenu = false; c.copied = true; },
         say: '<strong>点按“拷贝”。</strong>手机现在记住了这些文字，随时可以粘贴到别处。',
         hints: {reply: '“回复”会开始写一条消息。请点按“拷贝”。', forward: '“转发”是把消息发给别人。请点按“拷贝”。'}},
        {screen: c => copyChat(p, c), target: p === 'ios' ? 'home-bar' : 'home-pill', alias: {'home-up': 'home-bar'},
         say: '已拷贝！现在回到主屏幕。这里请<strong>点按屏幕底部的横条</strong>。'},
        {screen: () => home(p), target: 'maps', say: '<strong>打开“地图”</strong>，这样就能找到这个地址。'},
        {screen: c => mapsScreen(p, c), target: 'search-box', action: c => { c.pasteBubble = true; },
         say: '<strong>按住搜索框</strong>，直到出现一个小小的“粘贴”按钮。', hint: '手指按住顶部的搜索框不放。',
         hints: {'search-tap': '轻轻点一下只会打开键盘。请改为按住，直到出现“粘贴”。'}},
        {screen: c => mapsScreen(p, c), target: 'paste', action: c => { c.pasted = true; },
         say: '<strong>点按“粘贴”。</strong>'},
        {screen: c => mapsScreen(p, c), target: 'result', action: c => { c.pinned = true; }, say: '整个地址出现了，一个字都没打。<strong>点按搜索结果。</strong>'},
        {screen: c => mapsScreen(p, c), question: {q: '您想从一条长消息中间只复制一个电话号码。怎么做？', options: [
            {t: '按住，然后点按“选择”（或拖动小圆点手柄）选中想要的那一段，再点按“拷贝”', ok: true,
             why: '对。拖动高亮文字两边的手柄，就能精确选中想要的内容。'},
            {t: '只能复制整条消息', why: '您可以只选一部分：按住，点按“选择”，再拖动小手柄。'}]}},
        {screen: c => mapsScreen(p, c), done: true, say: '<strong>做得好！</strong>拷贝和粘贴几乎在所有地方都能用：消息、邮件、网页和表格。按住来拷贝；按住来粘贴。'},
    ], {});

    // ---------- Storage full ----------
    function storagePage(p, ctx) {
        const used = ctx.cleaned ? (p === 'ios' ? '54.1' : '50.9') : (p === 'ios' ? '61.4' : '58.2');
        const bar = `<div class="iq"><strong>${p === 'ios' ? 'iPhone' : '存储'}</strong><span>${used} GB of 64 GB used</span>
            <div class="qa"><span style="width:38%;background:#f59e0b"></span><span style="width:${ctx.cleaned ? 26 : 34}%;background:#22c55e"></span><span style="width:${ctx.cleaned ? 16 : 22}%;background:#8b5cf6"></span></div>
            <small><i style="background:#f59e0b"></i>Photos <i style="background:#22c55e"></i>WhatsApp <i style="background:#8b5cf6"></i>Apps</small></div>`;
        if (p === 'ios') {
            return list(p, 'iPhone 储存空间', [{caption: '建议'},
                ctx.offloaded ? {label: '卸载未使用的 App', value: '已启用 ⟦check⟧'} : {id: 'offload', label: '卸载未使用的 App', sub: '节省 2.1 GB。卸载您不用的 App，但保留它们的数据。', value: '启用'},
                {caption: 'App'}, {label: '照片', value: '21.3 GB'}, {label: 'WhatsApp', value: ctx.cleaned ? '7.6 GB' : '14.8 GB'}, {label: 'Facebook', value: '2.4 GB'}, {label: 'BBC iPlayer', value: '1.9 GB'}],
            {back: '通用', top: bar});
        }
        return list(p, '存储', [{label: '照片和视频', value: '21.3 GB'}, {label: 'App', value: ctx.cleaned ? '18.4 GB' : '25.2 GB', sub: '包括 WhatsApp'}, {label: '文档和其他', value: '4.1 GB'},
            {label: '系统', value: '7.6 GB'}], {top: bar + (ctx.junked ? '<p class="cf">⟦check⟧ 已清理 1.1 GB 垃圾文件</p>' : '<button type="button" class="ce dk" data-tap="free-up">释放空间</button>')});
    }

    function waStorage(p, ctx, page) {
        const color = p === 'ios' ? '#f2f2f7' : WA_GREEN;
        if (page === 'settings') {
            return app(p, '设置', `<div class="fo">${[['account', '账户'], ['privacy', '隐私'], ['chats', '聊天'], ['notifications', '通知'], ['storage', '储存空间和数据'], ['help', '帮助']]
                .map(([id, t]) => `<button type="button" class="ck" data-tap="wa-${id}"><strong>${t}</strong></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'data') {
            return app(p, '储存空间和数据', `<div class="fo"><button type="button" class="ck" data-tap="manage"><strong>Manage storage</strong><small>${ctx.cleaned ? '7.6 GB' : '14.8 GB'}</small></button>
                <div class="ck"><strong>Network usage</strong><small>1.2 GB sent · 3.4 GB received</small></div>
                <div class="ck"><strong>Media auto-download</strong><small>Photos, audio, videos on Wi-Fi</small></div></div>`, {color});
        }
        if (page === 'manage') {
            return app(p, '管理储存空间', `<div class="iq"><span>WhatsApp 正在使用 ${ctx.cleaned ? '7.6' : '14.8'} GB</span>
                <div class="qa"><span style="width:${ctx.cleaned ? 30 : 58}%;background:${WA_GREEN}"></span></div></div>
                <div class="fo">${ctx.cleaned ? '<div class="ck"><strong>大于 5 MB</strong><small>没有需要查看的内容</small></div>'
                    : '<button type="button" class="ck" data-tap="large"><strong>Larger than 5 MB</strong><small>23 items · 7.2 GB</small></button>'}
                <div class="ck"><strong>多次转发的内容</strong><small>112 项 · 0.9 GB</small></div>
                <div class="he">聊天</div><div class="ck"><strong>家人</strong><small>3.1 GB</small></div><div class="ck"><strong>Bridlington Walkers</strong><small>1.8 GB</small></div></div>`, {color});
        }
        // the large files
        const tiles = ['🎬', '🎬', '🐶', '🎂', '🎬', '🌅', '🎬', '🏖️', '🎬'].map((e, n) => `<span class="np${ctx.selected ? ' on' : ''}">${e}<small>${[412, 380, 96, 210, 655, 88, 301, 120, 540][n]} MB</small></span>`).join('');
        return app(p, '大于 5 MB', `<div class="acb">${tiles}</div>
            <div class="xw">${ctx.selected ? '<span>23 selected</span><button type="button" class="ce tw" data-tap="delete-files">Delete</button>'
                : '<button type="button" class="cp" data-tap="select-all">Select all</button>'}</div>`,
            {color, overlay: ctx.confirm ? dialog(p, '删除 23 项吗？', '它们会从 WhatsApp 中删除。已经保存到手机图库里的照片会保留在那里。', [['cancel', '取消'], ['confirm-delete', '删除']]) : ''});
    }

    const waApp = ['whatsapp', 'WhatsApp', WA_GREEN, ICON.chat];
    SCENARIOS['storage'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '收到“存储空间几乎已满”？我们来找出是什么占了空间。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>点按“通用”。</strong>'},
            {screen: () => list(p, '通用', [{id: 'about', label: '关于本机'}, {id: 'update', label: '软件更新'}, {id: 'storage', label: 'iPhone 储存空间'}, {id: 'airdrop', label: '隔空投送'}, {id: 'vpn', label: 'VPN 与设备管理'}], {back: '设置'}),
             target: 'storage', say: '<strong>点按“iPhone 储存空间”。</strong>手机要花几秒钟计算。'},
            {screen: c => storagePage(p, c), target: 'offload', action: c => { c.offloaded = true; },
             say: '彩色条显示了是什么占用了空间。先来个见效快的办法：<strong>卸载未使用的 App</strong> 会移除您一段时间没用的 App，但保留您的数据，以防您想再用。<strong>点按“启用”。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'storage', say: '<strong>点按“存储”。</strong><em>在三星手机上，是“电池和设备维护”，再找“存储”。</em>'},
            {screen: c => storagePage(p, c), target: 'free-up', say: '彩色条显示了是什么占用了空间。<strong>点按“释放空间”。</strong>'},
            {screen: () => app(p, '文件', `<div class="ke"><strong>删除垃圾文件</strong><small>来自各 App 的 1.1 GB 临时文件</small><button type="button" class="ce dk" data-tap="clean">清理</button></div>
                <div class="ke"><strong>删除旧截屏</strong><small>214 MB</small><span class="fd">选择并释放空间</span></div>`, {color: '#fff'}),
             target: 'clean', action: c => { c.junked = true; }, say: '垃圾文件可以放心删除：它们是 App 用不着的临时文件。<strong>点按“清理”。</strong>'},
        ]),
        {screen: c => storagePage(p, c), question: {q: 'WhatsApp 占用了 14.8 GB。是什么把它塞满的？', options: [
            {t: '别人发给您的视频和照片，尤其是群里的', ok: true, why: '对。家人群或其他群聊里发的每个视频都会保存在您的手机里。WhatsApp 可以找出并删除大的那些。'},
            {t: '您的文字消息', why: '文字几乎不占空间。占空间的是别人发来的视频和照片，尤其是群里的。'}]}},
        {screen: () => homeWith(p, [waApp]), target: 'whatsapp', say: '<strong>打开 WhatsApp。</strong>'},
        {screen: c => waStorage(p, c, 'settings'), target: 'wa-storage',
         say: p === 'ios' ? '在 WhatsApp 里，点按右下角的<strong>设置</strong>。这里已经打开了。<strong>点按“储存空间和数据”。</strong>'
                          : '在 WhatsApp 里，点按顶部的<strong>三个点 ⋮</strong>，再点按<strong>设置</strong>。这里已经打开了。<strong>点按“储存空间和数据”。</strong>'},
        {screen: c => waStorage(p, c, 'data'), target: 'manage', say: '<strong>点按“管理储存空间”。</strong>'},
        {screen: c => waStorage(p, c, 'manage'), target: 'large', say: '最能省空间的在最上面。<strong>点按“大于 5 MB”。</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'select-all', action: c => { c.selected = true; },
         say: '这些是别人发给您的大视频。如果想留下哪一个，请先把它存到照片里。<strong>点按“全选”。</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'delete-files', action: c => { c.confirm = true; }, say: '<strong>点按“删除”。</strong>'},
        {screen: c => waStorage(p, c, 'large'), target: 'confirm-delete', action: c => { c.confirm = false; c.cleaned = true; },
         say: '这只会删除 WhatsApp 里面的副本。<strong>点按“删除”</strong>确认。', hints: {cancel: '“取消”会保留它们。这次练习请点按“删除”。'}},
        {screen: c => waStorage(p, c, 'manage'), done: true,
         say: '<strong>做得好！</strong>您释放了 7 GB 多的空间。每隔几个月做一次很值得。还要清空“照片”里的<strong>“最近删除”</strong>，因为删除的照片还会占用空间 30 天。'},
    ], {});

    // ---------- Alarms and medication reminders ----------
    function clockApp(p, ctx, page) {
        const tabs = (p === 'ios' ? [['world', '世界时钟'], ['alarms', '闹钟'], ['stopwatch', '秒表'], ['timers', '定时器']]
            : [['alarms', '闹钟'], ['world', '时钟'], ['timers', '定时器'], ['stopwatch', '秒表']])
            .map(([id, t]) => `<button type="button" data-tap="tab-${id}" class="${page === id ? 'on' : ''}">${t}</button>`).join('');
        let inner;
        if (page === 'world') {
            inner = `<div class="jw"><span><small>今天</small><strong>伦敦</strong></span><em>${NOW.zone('Europe/London')}</em></div>
                <div class="jw"><span><small>澳大利亚</small><strong>悉尼</strong></span><em>${NOW.zone('Australia/Sydney')}</em></div>`;
        } else {
            const mine = ctx.alarmSaved ? `<div class="jw"><span><em>08:00</em><small>${esc(ctx.alarmLabel || '药片')}, every day</small></span>${tog(true)}</div>` : '';
            inner = `<div class="jw off"><span><em>07:00</em><small>闹钟</small></span>${tog(false)}</div>${mine}`;
        }
        const add = page === 'alarms' ? `<button type="button" class="gx" data-tap="add" aria-label="Add alarm">${UI.plus}</button>` : '';
        return `<div class="cg qt ph-${p}">${statusBar(p)}<div class="pd"><strong>${page === 'world' ? (p === 'ios' ? '世界时钟' : '时钟') : (p === 'ios' ? '闹钟' : '闹钟')}</strong>${add}</div>
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
                <button type="button" class="cj" data-tap="repeat"><span>Repeat</span><span class="kz">${ctx.repeat || '永不'} ›</span></button>
                <div class="cj ex"><span>Label</span>${field('alarmlabel', '闹钟', ctx)}</div>
                <div class="cj ex"><span>Snooze</span>${tog(true)}</div></div>${sheet}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['alarms'] = (p) => withCtx([
        {screen: () => home(p), target: 'clock', say: '闹钟可以提醒您每天吃药。<strong>打开“时钟”App。</strong>', hint: '它是白色钟面的黑色图标。'},
        {screen: c => clockApp(p, c, 'world'), target: 'tab-alarms', say: `<strong>点按 ${p === 'ios' ? '闹钟' : '闹钟'}</strong>，位置在${p === 'ios' ? 'bottom' : 'bottom left'}。`},
        {screen: c => clockApp(p, c, 'alarms'), target: 'add', say: '<strong>点按 +</strong> 添加新闹钟。'},
        {screen: c => alarmEdit(p, c), target: 't-08', action: c => { c.alarmTime = '08:00'; },
         say: '在真正的手机上，您要滚动数字来设置时间。这里请<strong>点按 08:00</strong>。', hints: {'t-07': '这次练习请选 08:00。', 't-09': '这次练习请选 08:00。'}},
        {screen: c => alarmEdit(p, c), target: 'repeat', action: c => { c.repeatPick = true; }, say: '这个您每天都需要，不是只响一次。<strong>点按“重复”。</strong>'},
        {screen: c => alarmEdit(p, c), target: 'every-day', action: c => { c.repeatPick = false; c.repeat = '每天'; }, say: '<strong>点按“每天”。</strong>',
         hints: {never: '“永不”表示只响一次。请点按“每天”。', weekdays: '“工作日”会跳过周末。请点按“每天”。'}},
        {screen: c => alarmEdit(p, c), target: 'save', require: c => typed(c, 'alarmlabel').length > 0, requireHint: '先在“标签”框里输入一个标签，比如“药片”。',
         action: c => { c.alarmSaved = true; c.alarmLabel = typed(c, 'alarmlabel'); },
         say: '标签会告诉您这个闹钟是做什么的。<strong>点按“标签”框并输入“药片”</strong>，然后<strong>点按“存储”</strong>。'},
        {screen: c => clockApp(p, c, 'alarms'), question: {q: '闹钟在 8 点响了。您吃了药。该按哪个按钮？', options: [
            {t: '停止', ok: true, why: '对。“停止”会把它关到明天 8 点，因为它每天重复。'},
            {t: '稍后提醒', why: '“稍后提醒”会让它大约 9 分钟后再响。如果您需要多一点时间可以用它，但“停止”会把它关到明天。'}]}},
        {screen: c => clockApp(p, c, 'alarms'), done: true,
         say: '<strong>做得好！</strong>您的吃药闹钟每天早上 8 点都会响。 ' + (p === 'ios' ? '<strong>健康</strong> App 里也有“用药”部分，可以提醒您并记录。' : '您也可以对 Google 说：“提醒我每天 8 点吃药”。')},
    ], {input: {}});

    // ---------- Backing up ----------
    SCENARIOS['backup'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '如果手机丢了或坏了，您的照片还安全吗？我们来检查一下。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>点按顶部您的姓名。</strong>'},
        {screen: () => list(p, 'Apple 账户', [{id: 'personal', label: '个人信息'}, {id: 'security', label: '登录与安全性'}, {id: 'payment', label: '付款与配送'}, {id: 'subscriptions', label: '订阅'},
            {caption: ' '}, {id: 'icloud', label: 'iCloud', value: '4.2 GB'}, {id: 'family', label: '家人共享'}, {id: 'findmy', label: '查找'}], {back: '设置'}),
         target: 'icloud', say: '<strong>点按“iCloud”。</strong>iCloud 是 Apple 的在线储存服务。'},
        {screen: c => list(p, 'iCloud', [{caption: '储存空间：已使用 4.2 GB（共 5 GB）'}, {caption: '已存储到 iCloud'}, {id: 'photos', label: '照片', value: c.photoSync ? '开启' : '关闭'}, {id: 'backup', label: 'iCloud 云备份', value: c.backedUp ? '开启' : '关闭'},
            {label: '通讯录', value: '开启'}, {label: '备忘录', value: '开启'}], {back: 'Apple 账户'}),
         target: 'photos', say: '“照片”和“备份”都是<strong>关闭</strong>的。这意味着手机一旦丢失，照片也就没了。<strong>点按“照片”。</strong>'},
        {screen: c => list(p, '照片', [{id: 'sync', label: '同步此 iPhone', toggle: !!c.photoSync, sub: '把您的照片和视频保存在 iCloud 里，这样手机丢了也安全。'}], {back: 'iCloud'}),
         target: 'sync', action: c => { c.photoSync = true; }, say: '<strong>点按“同步此 iPhone”</strong>来开启。'},
        {screen: c => list(p, '照片', [{label: '同步此 iPhone', toggle: true}], {back: 'iCloud'}), target: 'back', say: '<strong>点按“‹ iCloud”</strong>返回。'},
        {screen: c => list(p, 'iCloud', [{caption: '储存空间：已使用 4.2 GB（共 5 GB）'}, {caption: '已存储到 iCloud'}, {id: 'photos', label: '照片', value: '开启'}, {id: 'backup', label: 'iCloud 云备份', value: '关闭'}], {back: 'Apple 账户'}),
         target: 'backup', say: '现在备份其他所有内容：设置、信息和 App。<strong>点按“iCloud 云备份”。</strong>'},
        {screen: c => list(p, '备份', [{id: 'backup-toggle', label: '备份此 iPhone', toggle: !!c.backedUp, sub: '当 iPhone 在充电、已锁定并连着 Wi-Fi 时，每晚自动备份。'}], {back: 'iCloud'}),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>点按“备份此 iPhone”</strong>来开启。'},
        {screen: () => list('ios', '备份', [{label: '备份此 iPhone', toggle: true}, {id: 'backup-now', label: '立即备份', sub: '上次成功备份：从未'}], {back: 'iCloud'}),
         target: 'backup-now', say: '从现在起它每晚都会备份。现在先做第一次：<strong>点按“立即备份”</strong>。'},
        {screen: c => list('ios', '备份', [{label: '备份此 iPhone', toggle: true}, {label: c.busy ? '正在备份……' : '立即备份', sub: c.busy ? '大约还剩 5 分钟' : '上次成功备份：刚刚 ⟦check⟧'}], {back: 'iCloud'}), wait: 1500,
         question: {q: '一条短信写着“您的 iCloud 储存空间已满。您的照片今天将被删除。请在此支付 99 便士：[link]”。您怎么办？', options: [
            {t: '忽略链接。到“设置 > 您的姓名 > iCloud”里查看，然后把短信转发给 7726', ok: true, why: '对。这是常见的诈骗。Apple 不会发带链接的短信，也绝不会那样删除您的照片。请在“设置”里查看真实的储存情况。'},
            {t: '赶紧付款保住照片', why: '这是想骗取您银行卡信息的诈骗。请到“设置 > 您的姓名 > iCloud”里查看真实的储存情况，并把短信转发给 7726。'}]}},
        {screen: () => list('ios', '备份', [{label: '备份此 iPhone', toggle: true}, {label: '立即备份', sub: '上次成功备份：刚刚 ⟦check⟧'}], {back: 'iCloud'}), done: true,
         say: '<strong>做得好！</strong>您的照片和手机已备份。免费的 5 GB 很容易被照片占满；如果满了，更多空间（iCloud+）每月只需少量费用，而且只能在“设置”里购买，绝不要通过短信里的链接买。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '如果手机丢了或坏了，您的照片还安全吗？我们来检查一下。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>点按“Google”。</strong>它在靠近底部的位置。', hint: '向下滚动列表：Google 在靠近底部的位置。'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: '管理您的 Google 账户', sub: 'margaret.smith@example.com'}, {id: 'backup', label: '备份', sub: '关闭'}, {id: 'autofill', label: '自动填充'}, {id: 'devices', label: '设备与共享'}]),
         target: 'backup', say: '备份显示为<strong>关闭</strong>。<strong>点按“备份”。</strong><em>在三星手机上，是 设置 > 账户和备份。</em>'},
        {screen: c => list(p, '备份', [{id: 'backup-toggle', label: 'Google One 备份', toggle: !!c.backedUp, sub: '备份应用、信息、通话记录、联系人和设置。'},
            {id: 'photos-backup', label: '照片和视频', sub: c.photoSync ? '开启 · Google 相册' : '关闭 · Google 相册'}]),
         target: 'backup-toggle', action: c => { c.backedUp = true; }, say: '<strong>点按“Google One 备份”</strong>来开启。'},
        {screen: c => list(p, '备份', [{label: 'Google One 备份', toggle: true}, {id: 'photos-backup', label: '照片和视频', sub: '关闭 · Google 相册'}]),
         target: 'photos-backup', say: '照片是单独备份的。<strong>点按“照片和视频”。</strong>'},
        {screen: c => list(p, '备份', [{id: 'photos-toggle', label: '备份照片和视频', toggle: !!c.photoSync, sub: '把它们保存到 Google 相册，这样手机丢了也安全。'},
            {label: '备份质量', value: '节省存储空间'}]), target: 'photos-toggle', action: c => { c.photoSync = true; }, say: '<strong>点按“备份照片和视频”</strong>来开启。'},
        {screen: () => list(p, '备份', [{label: '备份照片和视频', toggle: true}, {id: 'backup-now', label: '立即备份', sub: '上次备份：从未'}]),
         target: 'backup-now', say: '从现在起它会在有 Wi-Fi 时自动备份。现在先做第一次：<strong>点按“立即备份”</strong>。'},
        {screen: c => list(p, '备份', [{label: '备份照片和视频', toggle: true}, {label: c.busy ? '正在备份……' : '立即备份', sub: c.busy ? '1,204 items left' : '上次备份：刚刚 ⟦check⟧'}]), wait: 1500,
         question: {q: '一条短信写着“您的 Google 存储空间已满。您的照片今天将被删除。请在此支付 99 便士：[link]”。您怎么办？', options: [
            {t: '忽略链接。到“设置 > Google > 备份”里查看，然后把短信转发给 7726', ok: true, why: '对。这是常见的诈骗。Google 不会发这样带链接的短信。请在“设置”里查看真实的存储情况。'},
            {t: '赶紧付款保住照片', why: '这是想骗取您银行卡信息的诈骗。请在“设置”里查看真实的存储情况，并把短信转发给 7726。'}]}},
        {screen: () => list(p, '备份', [{label: '备份照片和视频', toggle: true}, {label: '立即备份', sub: '上次备份：刚刚 ⟦check⟧'}]), done: true,
         say: '<strong>做得好！</strong>您的照片和手机已备份。Google 免费给您 15 GB；如果满了，更多空间每月只需少量费用，而且只能在“设置”或 Google One App 里购买，绝不要通过短信里的链接买。'},
    ], {});

    // ======================================================================================
    // Course: Apps, accounts and privacy
    // ======================================================================================
    const badAd = `<div class="tp"><button type="button" class="ajo" data-tap="ad-close" aria-label="Close advert">⟦x⟧</button>
        <strong>🎉 恭喜！🎉</strong><p>您被选中赢取一张 £500 的购物券！</p>
        <button type="button" class="aeb" data-tap="claim">立即领取</button><small>广告</small></div>`;

    function appInfo(p, ctx) {
        const locked = !ctx.adminOff;
        return list(p, '应用信息', [], {top: `<div class="qj">${appIcon('#64748b', ICON.settings)}<strong>系统服务</strong><small>版本 1.0.3</small></div>
            <div class="mv"><button type="button" data-tap="open">打开</button>
            <button type="button" data-tap="uninstall" class="${locked ? 'ajt' : ''}">卸载</button>
            <button type="button" data-tap="force-stop">强行停止</button></div>
            <div class="cj ex"><span class="hf"><strong>电池</strong><small>自上次充满电后占用 38%</small></span></div>
            <div class="cj ex"><span class="hf"><strong>权限</strong><small>显示在其他应用上层、设备管理员</small></span></div>`,
            overlay: ctx.confirmUninstall ? dialog(p, '系统服务', '要卸载此应用吗？', [['cancel', '取消'], ['confirm-uninstall', '好']]) : ''});
    }

    function iosNotifHome(ctx) {
        return home('ios') + (ctx.calGone ? '' : `<button type="button" class="jp" data-tap="notif"><strong>日历 · 现在</strong>
            <span>⚠️ 您的 iPhone 可能已感染病毒！点按这里立即清理。</span></button>`);
    }

    SCENARIOS['bad-app'] = (p) => withCtx(p === 'android' ? [
        {screen: () => home(p) + badAd, target: 'ad-close',
         say: '主屏幕上弹出了广告，尽管没有打开任何 App。这通常意味着混进了一个恶意应用。首先，<strong>不要点广告。点按小小的 ⟦x⟧ 把它关掉。</strong>',
         hints: {claim: '千万不要点广告本身。在角落里找那个小小的 ⟦x⟧。'}, hint: '这个 ⟦x⟧ 很小，在广告的右上角。'},
        {screen: () => home(p), target: 'settings', say: '恶意应用一直在运行，所以很耗电。可以这样把它们找出来。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'battery', say: '<strong>点按“电池”。</strong><em>在三星手机上，是“电池和设备维护”，再找“电池”。</em>'},
        {screen: () => list(p, '电池', [{id: 'usage', label: '电池使用情况', sub: '查看自上次充满电后的使用情况'}, {label: '省电模式', toggle: false}], {top: '<div class="ql"><span class="oz"><span style="width:41%"></span></span><strong>41%</strong></div>'}),
         target: 'usage', say: '<strong>点按“电池使用情况”。</strong><em>在有些三星手机上，点按图表或“查看详情”。</em>'},
        {screen: () => list(p, '电池使用情况', [], {top: `<div class="nl">${[['系统服务', 38], ['屏幕', 21], ['WhatsApp', 12], ['YouTube', 8], ['相机', 4]]
            .map(([n, v]) => `<div><span>${n}</span><span class="si"><span style="width:${v * 2.5}%"></span></span><span>${v}%</span></div>`).join('')}</div>`}),
         question: {q: '下面哪一项看起来不对劲？', options: [
            {t: '系统服务：您从没用过它，却占用了最多电量', ok: true, why: '对。恶意应用会给自己起“系统服务”或“键盘设置”这样平淡的名字，让您不会注意到。记下它的名称。'},
            {t: '屏幕', why: '屏幕总是很耗电，这很正常。不对劲的是“系统服务”，您从没用过它。'},
            {t: 'WhatsApp', why: 'WhatsApp 是您在用的 App，所以很正常。不对劲的是“系统服务”。'}]}},
        {screen: c => settingsList(p, c), target: 'apps', say: '现在我们在您的应用里找到它。回到“设置”，<strong>点按“应用”</strong>。'},
        {screen: () => list(p, 'App', [{caption: '最近打开的应用'}, {label: 'WhatsApp', sub: '2 min ago'}, {label: 'Chrome', sub: '1 hr ago'}, {id: 'all-apps', label: '查看全部 46 个应用'}, {id: 'default-apps', label: '默认应用'}]),
         target: 'all-apps', say: '<strong>点按“查看所有应用”。</strong>'},
        {screen: () => list(p, '所有应用', ['计算器', '日历', '相机', 'Chrome', '时钟', '通讯录', 'Gmail', '地图'].map(n => ({label: n})).concat([{id: 'system-service', label: '系统服务'}, {label: 'WhatsApp'}])),
         target: 'system-service', say: '列表按字母 A 到 Z 排序。<strong>点按“系统服务”。</strong>'},
        {screen: c => appInfo(p, c), target: 'force-stop', action: c => { c.stopped = true; },
         say: '<strong>卸载</strong>按钮是灰色的。恶意应用就是用这招来阻止您删除它们。首先，<strong>点按“强行停止”</strong>让它停止运行。',
         hints: {uninstall: '它是灰色的，所以现在还不能用。先点按“强行停止”。', open: '不要打开它。点按“强行停止”。'}},
        {screen: () => list(p, '搜索设置', [{caption: '“设备管理员”的搜索结果'}, {id: 'device-admin', label: '设备管理员应用', sub: '安全和隐私 > 更多安全设置'}]),
         target: 'device-admin',
         say: '现在收回它的特殊权限。在“设置”里，用顶部的搜索栏<strong>搜索“设备管理员”</strong>。这是搜索结果：<strong>点按“设备管理员应用”</strong>。'},
        {screen: c => list(p, '设备管理员应用', [{label: '查找我的设备', toggle: true, sub: 'Google'}, {id: 'admin-ss', label: '系统服务', toggle: !c.adminOff}],
            {overlay: c.adminAsk ? dialog(p, '要停用此设备管理员应用吗？', '系统服务将无法再阻止您卸载它。', [['cancel', '取消'], ['deactivate', '停用']]) : ''}),
         target: 'admin-ss', action: c => { c.adminAsk = true; }, say: '“查找我的设备”是 Google 的，没问题。<strong>点按“系统服务”旁边的开关。</strong>', hints: {'find-my': '让“查找我的设备”保持开启。点按“系统服务”。'}},
        {screen: c => list(p, '设备管理员应用', [{label: '查找我的设备', toggle: true, sub: 'Google'}, {label: '系统服务', toggle: true}],
            {overlay: dialog(p, '要停用此设备管理员应用吗？', '系统服务将无法再阻止您卸载它。', [['cancel', '取消'], ['deactivate', '停用']])}),
         target: 'deactivate', action: c => { c.adminOff = true; c.adminAsk = false; }, say: '<strong>点按“停用”。</strong>'},
        {screen: c => appInfo(p, c), target: 'uninstall', action: c => { c.confirmUninstall = true; },
         say: '回到“系统服务”页面，<strong>卸载</strong>现在可以用了。<strong>点按“卸载”。</strong>', hints: {'force-stop': '它已经停止了。点按“卸载”。'}},
        {screen: c => appInfo(p, c), target: 'confirm-uninstall', action: c => { c.confirmUninstall = false; c.removed = true; }, say: '<strong>点按“确定”。</strong>'},
        {screen: () => home(p), target: 'store', say: '没了！最后，让 Google 检查有没有别的问题。<strong>打开 Play 商店。</strong>'},
        {screen: c => app(p, 'Play 保护机制', `<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>${c.scanned ? '未发现有害应用' : '扫描您的手机'}</strong>
            <small>${c.scanned ? '刚刚检查过' : '上次扫描：3 周前'}</small>${c.scanned ? '' : '<button type="button" class="ce dk" data-tap="scan">Scan</button>'}</div>`, {color: '#fff'}),
         target: 'scan', action: c => { c.scanned = true; },
         say: '在 Play 商店里，点按右上角的<strong>头像</strong>，再点按<strong>“Play 保护机制”</strong>。这里已经打开了。<strong>点按“扫描”。</strong>'},
        {screen: () => app(p, 'Play 保护机制', '<div class="rz"><span class="oq" aria-hidden="true">⟦shield-check⟧</span><strong>未发现有害应用</strong><small>刚刚检查过</small></div>', {color: '#fff'}), done: true,
         say: '<strong>做得好！</strong>您通过耗电情况找到了恶意应用，收回了它的特殊权限，把它卸载了，还检查了手机。要避免它们：只从 Play 商店安装应用，并对免费手电筒、“清理”和“加速”类应用保持警惕。'},
    ] : [
        {screen: c => iosNotifHome(c),
         question: {q: '您日历里的一条通知写着“您的 iPhone 可能已感染病毒！点按这里立即清理。”这是什么？', options: [
            {t: '混进日历里的垃圾信息。不要点它', ok: true, why: '对。在可疑网站上点按“允许”，可能会给您的 iPhone 添加一个垃圾日历。它的“事件”其实是伪装成警告的广告。您的 iPhone 没事。'},
            {t: 'Apple 发来的真正警告', why: 'Apple 不会通过您的日历发送病毒警告。这是订阅的日历发来的垃圾信息。不要点它。'}]}},
        {screen: c => iosNotifHome(c), target: 'settings', say: '我们来删除这个垃圾日历。<strong>点按“设置”</strong>，而不是那条通知。', hints: {notif: '不要点警告。点按“设置”。'}},
        {screen: c => settingsList(p, c), target: 'apps', say: '向下滚动并<strong>点按“App”</strong>。', hint: '“App”在最后一组里。'},
        {screen: () => list(p, 'App', ['App Store', '图书'].map(n => ({label: n})).concat([{id: 'calendar', label: '日历'}, {label: '相机'}, {label: '通讯录'}, {label: '邮件'}]), {back: '设置'}),
         target: 'calendar', say: '<strong>点按“日历”。</strong>'},
        {screen: () => list(p, '日历', [{id: 'accounts', label: '日历账户', value: '2'}, {label: '时区覆盖', value: '关闭'}, {label: '默认提醒时间'}], {back: 'App'}),
         target: 'accounts', say: '<strong>点按“日历账户”。</strong>'},
        {screen: () => list(p, '日历账户', [{caption: '账户'}, {label: 'iCloud', sub: '日历、通讯录及另外 7 项'}, {id: 'subscribed', label: '订阅的日历', value: '1'}], {back: '日历'}),
         target: 'subscribed', say: 'iCloud 是您自己的。<strong>点按“订阅的日历”。</strong>'},
        {screen: () => list(p, '订阅的日历', [{id: 'spam-cal', label: 'Phone-Security-Alerts', sub: '已订阅'}], {back: '日历账户'}),
         target: 'spam-cal', say: '就是它：一个您从没打算添加的日历。<strong>点按 Phone-Security-Alerts。</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: '服务器', value: 'clean-phone-now.example'}, {caption: ' '}, {id: 'delete-account', label: '删除账户', danger: true}],
            {back: '返回', overlay: c.askDelete ? dialog(p, '您确定吗？', '这会从您的 iPhone 上删除该日历及其事件。', [['cancel', '取消'], ['confirm-delete', '删除账户']]) : ''}),
         target: 'delete-account', action: c => { c.askDelete = true; }, say: '<strong>点按“删除账户”。</strong>'},
        {screen: c => list(p, 'Phone-Security-Alerts', [{label: '服务器', value: 'clean-phone-now.example'}, {caption: ' '}, {label: '删除账户', danger: true}],
            {back: '返回', overlay: dialog(p, '您确定吗？', '这会从您的 iPhone 上删除该日历及其事件。', [['cancel', '取消'], ['confirm-delete', '删除账户']])}),
         target: 'confirm-delete', action: c => { c.calGone = true; }, say: '<strong>点按“删除账户”</strong>确认。'},
        {screen: c => settingsList(p, c), target: 'general', say: '没了。再检查一项：可疑网站还可能安装“描述文件”。<strong>点按“通用”。</strong>'},
        {screen: () => list(p, '通用', [{id: 'about', label: '关于本机'}, {id: 'update', label: '软件更新'}, {id: 'storage', label: 'iPhone 储存空间'}, {id: 'vpn', label: 'VPN 与设备管理'}], {back: '设置'}),
         target: 'vpn', say: '<strong>点按“VPN 与设备管理”。</strong>'},
        {screen: c => list(p, 'VPN 与设备管理', c.profileGone ? [{label: 'VPN', value: '未连接'}] : [{label: 'VPN', value: '未连接'}, {caption: '配置描述文件'}, {id: 'profile', label: '免费手机加速器', sub: '未验证'}], {back: '通用'}),
         target: 'profile', say: '如果这里有您不认识的描述文件（来自您工作单位或学校的没问题），请把它删除。<strong>点按“免费手机加速器”。</strong>'},
        {screen: c => list(p, '描述文件', [{label: '免费手机加速器', sub: '未验证 · 包含：网页剪辑、证书'}, {caption: ' '}, {id: 'remove-profile', label: '移除描述文件', danger: true}],
            {back: '返回', overlay: c.askRemove ? dialog(p, '移除描述文件', '移除此描述文件将删除它的所有设置。', [['cancel', '取消'], ['confirm-remove', '移除']]) : ''}),
         target: 'remove-profile', action: c => { c.askRemove = true; }, say: '<strong>点按“移除描述文件”</strong>。您的 iPhone 会要求输入密码。'},
        {screen: c => list(p, '描述文件', [{label: '免费手机加速器', sub: '未验证'}, {caption: ' '}, {label: '移除描述文件', danger: true}],
            {back: '返回', overlay: dialog(p, '移除描述文件', '移除此描述文件将删除它的所有设置。', [['cancel', '取消'], ['confirm-remove', '移除']])}),
         target: 'confirm-remove', action: c => { c.profileGone = true; }, say: '<strong>点按“移除”。</strong>'},
        {screen: c => iosNotifHome(c), done: true,
         say: '<strong>做得好！</strong>假警告消失了。要避免再次发生：在网站上，遇到任何要求添加日历或描述文件的弹窗，请点按<strong>“不允许”</strong>或<strong>“关闭”</strong>，并且只从 App Store 安装应用。'},
    ], {});

    // ---------- Subscriptions ----------
    function subsList(p, ctx) {
        const photo = ctx.cancelled ? {label: 'Photo Editor Pro', sub: '已取消 · 10 月 22 日结束'} : {id: 'sub-photo', label: 'Photo Editor Pro', sub: '每周 £4.99 · 10 月 22 日续订'};
        return list(p, '订阅', [{caption: p === 'ios' ? '有效' : '有效'}, photo, {label: p === 'ios' ? 'iCloud+' : 'Google One', sub: p === 'ios' ? '每月 £0.99' : '每月 £1.59'},
            {caption: p === 'ios' ? '未生效' : '已过期'}, {label: 'Crossword Daily', sub: '3 月 3 日过期'}], {back: p === 'ios' ? 'Apple 账户' : '返回'});
    }
    function subDetail(p, ctx) {
        return list(p, 'Photo Editor Pro', [{caption: p === 'ios' ? '您的订阅' : '套餐'}, {label: '每周', sub: '每周 £4.99。最初是 3 天免费试用。'},
            {caption: ' '}, {id: 'cancel-sub', label: p === 'ios' ? '取消订阅' : '取消订阅', danger: true}],
            {back: '订阅', overlay: ctx.askCancel ? dialog(p, p === 'ios' ? '确认取消' : '要取消订阅吗？', '您可以继续使用到 10 月 22 日。之后不会再扣费。', [['keep', p === 'ios' ? '以后再说' : '保留']].concat([['confirm-cancel', p === 'ios' ? '确认' : '取消订阅']])) : ''});
    }

    SCENARIOS['subscriptions'] = (p) => withCtx([
        ...(p === 'ios' ? [
            {screen: () => home(p), target: 'settings', say: '免费试用常常在不知不觉中变成付费套餐。我们来检查一下。<strong>点按“设置”。</strong>'},
            {screen: c => settingsList(p, c), target: 'account', say: '<strong>点按顶部您的姓名。</strong>'},
            {screen: () => list(p, 'Apple 账户', [{id: 'personal', label: '个人信息'}, {id: 'security', label: '登录与安全性'}, {id: 'payment', label: '付款与配送'}, {id: 'subscriptions', label: '订阅'}, {caption: ' '}, {id: 'icloud', label: 'iCloud'}], {back: '设置'}),
             target: 'subscriptions', say: '<strong>点按“订阅”。</strong>'},
        ] : [
            {screen: () => home(p), target: 'store', say: '免费试用常常在不知不觉中变成付费套餐。我们来检查一下。<strong>打开 Play 商店。</strong>'},
            {screen: c => app(p, 'Play 商店', `<div class="hp"><span>为您推荐</span><strong>帮您起步的应用</strong></div>`,
                {back: false, color: '#fff', right: `<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>`,
                 overlay: c.menu ? `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>` : ''}),
             target: 'profile', action: c => { c.menu = true; }, say: '<strong>点按您的头像</strong>，也就是右上角的圆形字母。'},
            {screen: c => app(p, 'Play 商店', '', {back: false, color: '#fff', overlay: `<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="manage">Manage apps &amp; device</button><button type="button" data-tap="payments">Payments &amp; subscriptions</button><button type="button" data-tap="protect">Play Protect</button><button type="button" data-tap="settings">Settings</button></div>`}),
             target: 'payments', say: '<strong>点按“付款和订阅”。</strong>'},
            {screen: () => list(p, '付款和订阅', [{id: 'methods', label: '付款方式'}, {id: 'subscriptions', label: '订阅', sub: '管理您的订阅'}, {id: 'budget', label: '预算和记录'}]),
             target: 'subscriptions', say: '<strong>点按“订阅”。</strong>'},
        ]),
        {screen: c => subsList(p, c), target: 'sub-photo',
         say: '“Photo Editor Pro”最初是免费试用，现在是<strong>每周 £4.99</strong>。一年就超过 £250！<strong>点按它。</strong>'},
        {screen: c => subDetail(p, c), target: 'cancel-sub', action: c => { c.askCancel = true; }, say: `<strong>Tap ${p === 'ios' ? '取消订阅' : '取消订阅'}.</strong>`},
        {screen: c => subDetail(p, c), target: 'confirm-cancel', action: c => { c.askCancel = false; c.cancelled = true; },
         say: `<strong>Tap ${p === 'ios' ? '确认' : '取消订阅'}.</strong>`, hints: {keep: '这个还在继续扣费。点按 ' + (p === 'ios' ? '确认' : '取消订阅') + '.'}},
        {screen: c => subsList(p, c), question: {q: '把手机上的 Photo Editor 应用删除。这样就不会再扣费了吗？', options: [
            {t: '不会。必须取消订阅，就像您刚才做的那样', ok: true, why: '没错。删除应用并不会取消订阅。在这里取消之前，您会一直被扣费。'},
            {t: '会，删除应用就停止了', why: '不会！在这里取消订阅本身之前，您会一直被扣费。'}]}},
        {screen: c => subsList(p, c), done: true,
         say: '<strong>做得好！</strong>您每周省下了 £4.99。小窍门：开始免费试用时，在试用结束前一天设个闹钟。还要时不时查看银行 App 里的定期付款清单。'},
    ], {});

    // ---------- Turning off AI features ----------
    const geminiApp = ['gemini', 'Gemini', 'linear-gradient(135deg,#4f8cf7,#a78bfa)', '<span class="ok">⟦sparkles⟧</span>'];
    SCENARIOS['ai-settings'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '较新的 iPhone 有 <strong>Apple 智能</strong>：能帮您写作、总结和编辑的 AI。您可以把它关掉。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'ai', say: '<strong>点按“Apple 智能与 Siri”。</strong>', hint: '它在第三组，“辅助功能”的下面。'},
        {screen: c => list(p, 'Apple 智能与 Siri', [{id: 'ai-toggle', label: 'Apple 智能', toggle: !c.aiOff, sub: '写作工具、通知摘要、图像乐园等等。'},
            {caption: '扩展'}, {id: 'chatgpt', label: 'ChatGPT', value: c.gptOff ? '关闭' : '开启'}, {caption: 'SIRI'}, {label: '与 Siri 对话', value: '“Siri”或“嘿 Siri”'}],
            {back: '设置', overlay: c.askOff ? dialog(p, '要关闭 Apple 智能吗？', '写作工具和摘要等功能将不再可用。', [['cancel', '取消'], ['confirm-off', '关闭']]) : ''}),
         target: 'ai-toggle', action: c => { c.askOff = true; }, say: '<strong>点按 Apple 智能的开关</strong>把它关掉。', hints: {chatgpt: '接下来处理 ChatGPT。先点按 Apple 智能的开关。'}},
        {screen: c => list(p, 'Apple 智能与 Siri', [{label: 'Apple 智能', toggle: true}, {caption: '扩展'}, {label: 'ChatGPT', value: '开启'}],
            {back: '设置', overlay: dialog(p, '要关闭 Apple 智能吗？', '写作工具和摘要等功能将不再可用。', [['cancel', '取消'], ['confirm-off', '关闭']])}),
         target: 'confirm-off', action: c => { c.askOff = false; c.aiOff = true; }, say: '<strong>点按“关闭”。</strong>'},
        {screen: c => list(p, 'Apple 智能与 Siri', [{label: 'Apple 智能', toggle: false}, {caption: '扩展'}, {id: 'chatgpt', label: 'ChatGPT', value: '开启'}], {back: '设置'}),
         target: 'chatgpt', say: 'ChatGPT 扩展可以把您的问题发送给 ChatGPT，那是 Apple 之外的一家公司。<strong>点按“ChatGPT”。</strong>'},
        {screen: c => list(p, 'ChatGPT', [{id: 'gpt-toggle', label: '使用 ChatGPT', toggle: !c.gptOff, sub: 'Siri 可以把请求发送给 ChatGPT。'}], {back: '返回'}),
         target: 'gpt-toggle', action: c => { c.gptOff = true; }, say: '<strong>点按“使用 ChatGPT”</strong>把它关掉。'},
        {screen: () => list(p, 'ChatGPT', [{label: '使用 ChatGPT', toggle: false}], {back: '返回'}),
         question: {q: 'WhatsApp、Facebook 和其他应用里也有 AI 聊天。安全的规则是什么？', options: [
            {t: '绝不要在任何 AI 聊天里输入个人信息（银行、健康、密码、地址）', ok: true, why: '对。您输入的内容可能会被保存并用来训练 AI。就当是在和陌生人说话。'},
            {t: 'AI 聊天是私密的，所以什么都可以说', why: '它们不像电话那样私密。您输入的内容可能会被保存。请不要在里面输入个人信息。'}]}},
        {screen: () => list(p, 'ChatGPT', [{label: '使用 ChatGPT', toggle: false}], {back: '返回'}), done: true,
         say: '<strong>做得好！</strong>Apple 智能和 ChatGPT 已关闭。您随时可以在同一个地方重新开启。Siri 仍然正常使用。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '现在的 Android 手机自带 <strong>Gemini</strong>，也就是 Google 的 AI。按住电源键可能会不小心把它打开。我们来改掉这一点。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'apps', say: '<strong>点按“应用”。</strong>'},
        {screen: () => list(p, 'App', [{caption: '最近打开的应用'}, {label: 'WhatsApp', sub: '2 min ago'}, {id: 'all-apps', label: '查看全部 45 个应用'}, {id: 'default-apps', label: '默认应用', sub: '助手、浏览器和电话应用'}]),
         target: 'default-apps', say: '<strong>点按“默认应用”。</strong>'},
        {screen: () => list(p, '默认应用', [{label: '浏览器应用', sub: 'Chrome'}, {id: 'assistant', label: '数字助理应用', sub: 'Gemini'}, {label: '电话应用', sub: '电话'}, {label: '短信应用', sub: '信息'}]),
         target: 'assistant', say: '<strong>点按“数字助理应用”。</strong>'},
        {screen: c => list(p, '数字助理应用', [{id: 'assistant-app', label: '默认数字助理应用', sub: c.noAssist ? '无' : 'Gemini'}, {label: '使用屏幕上的文字', toggle: !c.noAssist}],
            {overlay: c.pick ? `<div class="ei"><div class="cv"><p><strong>默认数字助理应用</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">无</button></div></div>` : ''}),
         target: 'assistant-app', action: c => { c.pick = true; }, say: '<strong>点按“默认数字助理应用”。</strong>'},
        {screen: c => list(p, '数字助理应用', [{label: '默认数字助理应用', sub: 'Gemini'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>默认数字助理应用</strong></p><button type="button" class="cj" data-tap="assist-gemini">Gemini</button><button type="button" class="cj" data-tap="assist-none">无</button></div></div>`}),
         target: 'assist-none', action: c => { c.pick = false; c.noAssist = true; }, say: '<strong>点按“无”。</strong>按住电源键时，Gemini 就不会弹出来了。', hints: {'assist-gemini': '那样会保留 Gemini。请点按“无”。'}},
        {screen: () => homeWith(p, [geminiApp]), target: 'gemini', say: '接下来，不让 Gemini 保存您对它输入的内容。<strong>打开 Gemini 应用。</strong>'},
        {screen: c => app(p, 'Gemini', '<p class="cf wq">你好，Margaret<br><small>今天我能帮您什么？</small></p>',
            {back: false, color: '#fff', right: '<button type="button" class="gx abk" data-tap="profile" aria-label="Your profile">M</button>',
             overlay: c.menu ? '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>' : ''}),
         target: 'profile', action: c => { c.menu = true; }, say: '<strong>点按右上角您的头像。</strong>'},
        {screen: () => app(p, 'Gemini', '', {back: false, color: '#fff', overlay: '<div class="jb"><span>margaret.smith@example.com</span><button type="button" data-tap="activity">Gemini Apps Activity</button><button type="button" data-tap="settings">Settings</button><button type="button" data-tap="help">Help</button></div>'}),
         target: 'activity', say: '<strong>点按“Gemini 应用活动记录”。</strong><em>在有些手机上叫“保留活动记录”。</em>'},
        {screen: c => app(p, 'Gemini 应用活动记录', `<p class="cf"><strong>${c.actOff ? '关闭' : '开启'}</strong><br>${c.actOff ? '您的聊天不再保存到您的账户，也不会被用来改进 Google 的 AI。' : '您的聊天会保存到您的 Google 账户，并且可能会被审核以改进 Google 的 AI。'}</p>
            ${c.actOff ? '' : '<button type="button" class="ce dk" data-tap="turn-off">Turn off</button>'}`,
            {color: '#fff', overlay: c.offSheet ? '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">关闭</button><button type="button" class="cj" data-tap="off-delete">关闭并删除活动记录</button></div></div>' : ''}),
         target: 'turn-off', action: c => { c.offSheet = true; }, say: '<strong>点按“关闭”。</strong>'},
        {screen: c => app(p, 'Gemini 应用活动记录', '<p class="cf"><strong>开启</strong></p>', {color: '#fff', overlay: '<div class="ei"><div class="cv"><button type="button" class="cj" data-tap="off-only">关闭</button><button type="button" class="cj" data-tap="off-delete">关闭并删除活动记录</button></div></div>'}),
         target: 'off-delete', action: c => { c.offSheet = false; c.actOff = true; }, say: '<strong>点按“关闭并删除活动记录”</strong>，把已保存的内容也清除。', hints: {'off-only': '那样只会停止保存新的聊天，旧的仍会保留。请点按“关闭并删除活动记录”。'}},
        {screen: c => app(p, 'Gemini 应用活动记录', '<p class="cf"><strong>关闭</strong></p>', {color: '#fff'}),
         question: {q: 'WhatsApp、Facebook 和其他应用里也有 AI 聊天。安全的规则是什么？', options: [
            {t: '绝不要在任何 AI 聊天里输入个人信息（银行、健康、密码、地址）', ok: true, why: '对。您输入的内容可能会被保存并用来训练 AI。就当是在和陌生人说话。'},
            {t: 'AI 聊天是私密的，所以什么都可以说', why: '它们不像电话那样私密。您输入的内容可能会被保存。请不要在里面输入个人信息。'}]}},
        {screen: c => app(p, 'Gemini 应用活动记录', '<p class="cf"><strong>关闭</strong></p>', {color: '#fff'}), done: true,
         say: '<strong>做得好！</strong>按住电源键不会再弹出 Gemini，它也不再保存您的聊天了。在三星手机上，还要看看<strong>设置 > Galaxy AI</strong>，那里每项功能都有自己的开关。'},
    ], {});

    // ---------- Protecting your Apple or Google account ----------
    SCENARIOS['account-security'] = (p) => withCtx(p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '您的 Apple 账户里存着您的照片、联系人和付款信息。我们来检查它是否受到保护。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'account', say: '<strong>点按顶部您的姓名。</strong>'},
        {screen: () => list(p, 'Apple 账户', [{id: 'personal', label: '个人信息'}, {id: 'security', label: '登录与安全性'}, {id: 'payment', label: '付款与配送'}, {id: 'subscriptions', label: '订阅'}], {back: '设置'}),
         target: 'security', say: '<strong>点按“登录与安全性”。</strong>'},
        {screen: () => list(p, '登录与安全性', [{label: '电子邮件与电话号码', sub: '+44 7700 900123'}, {label: '更改密码'}, {caption: ' '}, {label: '双重认证', value: '开启'},
            {id: 'recovery', label: '账户恢复'}], {back: 'Apple 账户'}),
         target: 'recovery', say: '<strong>双重认证</strong>显示为开启：很好。这意味着新设备登录前，需要一个发到您手机上的验证码。现在，<strong>点按“账户恢复”</strong>。'},
        {screen: c => list(p, '账户恢复', [{caption: '恢复联系人'}, c.recovery ? {label: 'Sarah', sub: '正在等待 Sarah 接受'} : {id: 'add-contact', label: '添加恢复联系人……', sub: '一个您信任的人，可以帮您重新进入账户。'}],
            {back: '返回', overlay: c.pickContact ? `<div class="ei"><div class="cv"><p><strong>选择恢复联系人</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah（女儿）</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>` : ''}),
         target: 'add-contact', action: c => { c.pickContact = true; },
         say: '如果您忘了密码，<strong>恢复联系人</strong>可以帮您拿到验证码，助您重新登录。他们看不到您的数据。<strong>点按“添加恢复联系人”。</strong>'},
        {screen: c => list(p, '账户恢复', [{caption: '恢复联系人'}, {label: '添加恢复联系人……'}],
            {back: '返回', overlay: `<div class="ei"><div class="cv"><p><strong>选择恢复联系人</strong></p><button type="button" class="cj" data-tap="pick-sarah">Sarah（女儿）</button><button type="button" class="cj" data-tap="pick-dave">Dave</button></div></div>`}),
         target: 'pick-sarah', action: c => { c.pickContact = false; c.recovery = true; }, say: '选一个您信任、而且有 iPhone 的人。<strong>点按 Sarah。</strong>', hints: {'pick-dave': '这次练习请选 Sarah。'}},
        {screen: c => list(p, '账户恢复', [{caption: '恢复联系人'}, {label: 'Sarah', sub: '正在等待 Sarah 接受'}], {back: '返回'}),
         question: {q: '有人打电话自称来自 Apple。他们让您念出手机上刚刚出现的 6 位数验证码。您怎么办？', options: [
            {t: '挂断。绝不要把那个验证码告诉任何人', ok: true, why: '没错。那个验证码能让别人进入您的账户。Apple 绝不会打电话索要它。'},
            {t: '念给他们，他们是 Apple 的', why: 'Apple 绝不会索要那个验证码。拿到它的人就能进入您的账户。请挂断。'}]}},
        {screen: c => list(p, '账户恢复', [{caption: '恢复联系人'}, {label: 'Sarah', sub: '正在等待 Sarah 接受'}], {back: '返回'}), done: true,
         say: '<strong>做得好！</strong>双重认证已开启，Sarah 可以帮您重新进入账户。您的 iPhone 还可以替您记住密码，就在<strong>“密码”</strong> App 里。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '您的 Google 账户里有您的邮件、照片和联系人。我们给它加上第二把锁。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'google', say: '<strong>点按“Google”。</strong>', hint: 'Google 在列表靠近底部的位置。'},
        {screen: () => list(p, 'Google', [{id: 'manage', label: '管理您的 Google 账户', sub: 'margaret.smith@example.com'}, {id: 'backup', label: '备份'}, {id: 'autofill', label: '自动填充'}]),
         target: 'manage', say: '<strong>点按“管理您的 Google 账户”。</strong>'},
        {screen: () => app(p, 'Google 账户', `<div class="uf"><span class="on">Home</span><span>Personal info</span><span>Data &amp; privacy</span><button type="button" data-tap="tab-security">Security</button></div>
            <p class="cf">Welcome, Margaret Smith</p>`, {color: '#fff'}),
         target: 'tab-security', say: '<strong>点按顶部的“安全”。</strong>'},
        {screen: c => list(p, '安全', [{caption: '您登录 Google 的方式'}, {id: '2sv', label: '两步验证', sub: c.twoOn ? '开启' : '关闭'}, {label: '密码', sub: '上次更改于 2 年前'}, {label: '恢复手机号码', sub: '07700 900123'}]),
         target: '2sv', say: '<strong>两步验证</strong>是关闭的。开启后，在新设备上登录还需要一个发到您手机上的验证码，这样密码被偷了也不够用。<strong>点按它。</strong>'},
        {screen: () => list(p, '两步验证', [], {top: '<p class="cf">您的手机号码：<strong>07700 900123</strong><br>我们会给这个号码发一个验证码，确认是您的号码。</p><button type="button" class="ce dk" data-tap="send-code">发送验证码</button>'}),
         target: 'send-code', say: '<strong>点按“发送验证码”。</strong>'},
        {screen: c => list(p, '两步验证', [], {top: `<div class="sd"><strong>信息 · 现在</strong><span>G-382605 是您的 Google 验证码。</span></div>
            <p class="cf">请输入我们发到 07700 900123 的验证码</p>${field('gcode', '输入验证码', c, 'tel')}<button type="button" class="ce dk" data-tap="verify">下一步</button>`}),
         target: 'verify', require: c => typed(c, 'gcode').replace(/\D/g, '') === '382605', requireHint: '输入短信里的 6 个数字：382605。',
         say: '一条带验证码的短信到了。<strong>在框里输入 382605</strong>，然后<strong>点按“下一步”</strong>。<em>（这是练习用的验证码。除了您自己主动要求的地方，绝不要在别处输入真正的验证码。）</em>'},
        {screen: () => list(p, '两步验证', [], {top: '<p class="cf">您的手机号码已验证 ⟦check⟧</p><button type="button" class="ce dk" data-tap="turn-on">开启两步验证</button>'}),
         target: 'turn-on', action: c => { c.twoOn = true; }, say: '<strong>点按“开启两步验证”。</strong>'},
        {screen: c => list(p, '安全', [{caption: '您登录 Google 的方式'}, {label: '两步验证', sub: '已开启 ⟦check⟧'}, {label: '恢复手机号码', sub: '07700 900123'}]),
         question: {q: '有人打电话自称来自 Google。他们让您念出刚刚发到您手机上的验证码。您怎么办？', options: [
            {t: '挂断。绝不要把那个验证码告诉任何人', ok: true, why: '没错。那个验证码能让别人进入您的账户。Google 绝不会打电话索要它。'},
            {t: '念给他们，他们是 Google 的', why: 'Google 绝不会索要那个验证码。拿到它的人就能进入您的账户。请挂断。'}]}},
        {screen: c => list(p, '安全', [{caption: '您登录 Google 的方式'}, {label: '两步验证', sub: '已开启 ⟦check⟧'}]), done: true,
         say: '<strong>做得好！</strong>您的 Google 账户现在除了密码，还需要您的手机。Google 也可以替您记住密码：到“设置”里找<strong>Google 密码管理器</strong>。'},
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
            inner = `<div class="oj"><strong>${avatar('J', '#a78bfa')} Jean Smith</strong><p>今天早上沿着海滨散步真惬意！🌊</p><div class="ahv">🌅</div></div>
                <div class="oj"><strong>${avatar('B', '#f59e0b')} Bridlington Walkers</strong><p>下次散步：星期六上午 10 点，从港口出发。</p></div>`;
        } else if (page === 'friends') {
            inner = ctx.requestGone ? '<p class="cf">没有新的好友请求。</p>'
                : `<p class="cf"><strong>Friend requests</strong></p><div class="my">${avatar('J', '#a78bfa')}<span><strong>Jean Smith</strong><small>1 mutual friend · Joined 2 days ago</small>
                    <span class="oa"><button type="button" class="ce co" data-tap="confirm-jean">Confirm</button><button type="button" class="ce" data-tap="delete-jean">Delete</button></span></span></div>`;
        } else {
            inner = `<div class="fo"><div class="ck"><strong>Margaret Smith</strong><small>查看你的个人主页</small></div>
                <button type="button" class="ck" data-tap="settings"><strong>设置和隐私</strong></button><div class="ck"><strong>帮助和支持</strong></div></div>`;
        }
        return app(p, 'Facebook', inner + tabs, {back: false, color: '#fff'});
    }

    SCENARIOS['facebook'] = (p) => withCtx([
        {screen: () => homeWith(p, [fbApp]), target: 'facebook', say: '我们来确保只有您的好友能看到您发的内容。<strong>打开 Facebook。</strong><em>（这是练习版，不是真正的应用。）</em>'},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-menu', say: '<strong>点按右下角的“菜单”。</strong>', hints: {'tab-friends': '好友请求稍后再看。先点按“菜单”。'}},
        {screen: c => fbScreen(p, c, 'menu'), target: 'settings', say: '<strong>点按“设置和隐私”。</strong>'},
        {screen: c => list(p, '设置', [{caption: '受众和可见性'}, {id: 'posts', label: '帖子', sub: '谁可以看到你未来的帖子： ' + (c.audience || '公开')}, {label: '个人资料详情'}, {label: '别人如何找到并联系您'},
            {caption: '你的动态'}, {label: '动态记录'}],
            {overlay: c.audPick ? `<div class="ei"><div class="cv"><p><strong>谁可以看到你未来的帖子？</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ 公开<small>Facebook 内外的任何人</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ 好友<small>你在 Facebook 上的好友</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ 仅自己可见</button></div></div>` : ''}),
         target: 'posts', action: c => { c.audPick = true; }, say: '您的帖子设为<strong>公开</strong>：全世界任何人都能看到。<strong>点按“帖子”。</strong>'},
        {screen: c => list(p, '设置', [{caption: '受众和可见性'}, {label: '帖子', sub: '谁可以看到你未来的帖子：公开'}],
            {overlay: `<div class="ei"><div class="cv"><p><strong>谁可以看到你未来的帖子？</strong></p>
                <button type="button" class="cj" data-tap="aud-public">⟦globe⟧ 公开<small>Facebook 内外的任何人</small></button>
                <button type="button" class="cj" data-tap="aud-friends">⟦users⟧ 好友<small>你在 Facebook 上的好友</small></button>
                <button type="button" class="cj" data-tap="aud-me">⟦lock⟧ 仅自己可见</button></div></div>`}),
         target: 'aud-friends', action: c => { c.audPick = false; c.audience = '好友'; }, say: '<strong>点按“好友”。</strong>',
         hints: {'aud-public': '“公开”是原来的设置。请点按“好友”。', 'aud-me': '“仅自己可见”意味着别人都看不到您的帖子。请点按“好友”。'}},
        {screen: c => list(p, '设置', [{caption: '受众和可见性'}, {label: '帖子', sub: '谁可以看到你未来的帖子：好友 ⟦check⟧'}, {id: 'back-feed', label: '‹ 返回 Facebook'}]),
         target: 'back-feed', say: '完成了。现在<strong>点按“返回 Facebook”</strong>。', alias: {back: 'back-feed'}},
        {screen: c => fbScreen(p, c, 'feed'), target: 'tab-friends', say: '您有一个好友请求。<strong>点按“好友”。</strong>'},
        {screen: c => fbScreen(p, c, 'friends'),
         question: {q: '有一个来自“Jean Smith”的好友请求。但您和 Jean 已经是好友了（她就在您的动态里）。这是怎么回事？', options: [
            {t: '很可能是骗子复制了 Jean 的个人主页', ok: true, why: '对。骗子复制别人的名字和照片，然后给她的好友发消息要钱。真正的 Jean 已经是您的好友了。'},
            {t: 'Jean 一定有第二个账户', why: '有可能，但更可能是骗子复制的：它 2 天前才加入。请打电话和 Jean 核实。'}]}},
        {screen: c => fbScreen(p, c, 'friends'), target: 'delete-jean', action: c => { c.requestGone = true; }, say: '<strong>点按“删除”</strong>来拒绝这个请求。', hints: {'confirm-jean': '不要确认复制出来的个人主页。请点按“删除”。'}},
        {screen: c => fbScreen(p, c, 'friends'), done: true,
         say: '<strong>做得好！</strong>您的帖子现在只有好友能看到，您也躲过了一个假主页。请告诉 Jean，让她去举报。还要提防 Marketplace 上想“通过快递员”付款，或要求提供发到您手机上的验证码的买家。'},
    ], {});

    // ======================================================================================
    // Health, money and travel: bus directions with Maps
    // ======================================================================================
    function busMaps(p, ctx, page) {
        const top = `<div class="rb"><button type="button" class="ln" data-tap="search">${ICON.search}<span>${ctx.place ? 'Hull Paragon Interchange' : '在此搜索'}</span></button></div>`;
        let card = '';
        if (page === 'suggest') {
            card = `<div class="uo"><button type="button" class="ck" data-tap="place-hull"><strong>Hull Paragon Interchange</strong><small>公交和火车站，Hull</small></button>
                <div class="ck"><strong>Hull Royal Infirmary</strong><small>医院，Hull</small></div><div class="ck"><strong>Hull Minster</strong><small>教堂，Hull</small></div></div>`;
        } else if (page === 'place') {
            card = '<div class="gz"><strong>Hull Paragon Interchange</strong><small>公交和火车站 · 25 英里</small><button type="button" class="ce co" data-tap="directions">路线</button></div>';
        } else if (page === 'modes' || page === 'routes') {
            const modes = [['car', '⟦car⟧ 40 min'], ['bus', '⟦bus⟧ 1 hr 25'], ['walk', '⟦footprints⟧ 8 hr']].map(([id, t]) =>
                `<button type="button" data-tap="mode-${id}" class="${page === 'routes' && id === 'bus' ? 'on' : (page === 'modes' && id === 'car' ? 'on' : '')}">${t}</button>`).join('');
            const routes = page === 'routes' ? `<button type="button" class="ck" data-tap="route-1"><strong>10:15 → 11:40</strong><small>⟦bus⟧ 121 · Leaves Bridlington Bus Station · <b class="ahy">On time</b></small></button>
                <div class="ck"><strong>11:15 → 12:40</strong><small>⟦bus⟧ 121 · Every hour</small></div>` : '<div class="ck"><strong>40 分钟（25 英里）</strong><small>最快路线，经 A614</small></div>';
            card = `<div class="gz ca"><div class="ps">${modes}</div>${routes}</div>`;
        } else if (page === 'trip') {
            card = `<div class="gz ca"><strong>10:15 → 11:40</strong><ol class="aik"><li>⟦footprints⟧ 步行 4 分钟到 <strong>Bridlington Bus Station</strong>，3 号站台</li>
                <li>⟦bus⟧ <strong>121</strong> 路，开往 Hull · 10:15 · <b class="ahy">准点</b></li><li>在 <strong>Hull Paragon Interchange</strong> 下车（24 站）</li></ol>
                <button type="button" class="ce co" data-tap="start">开始</button></div>`;
        }
        return `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra">${page === 'place' || page === 'trip' ? '<span class="alm" aria-hidden="true"></span>' : ''}<span class="pt" aria-hidden="true"></span>
            ${page === 'modes' || page === 'routes' || page === 'trip' ? '<span class="aes" aria-hidden="true"></span>' : ''}</div>${page === 'map' || page === 'suggest' || page === 'place' ? top : ''}${card}${homeIndicator(p)}</div>`;
    }

    SCENARIOS['bus-maps'] = (p) => withCtx([
        {screen: () => home(p), target: 'maps', say: '地图可以规划公交行程，还有实时时间。我们坐公交去 Hull。<strong>打开“地图”。</strong>' + (p === 'ios' ? ' <em>（如果您更喜欢 Google 地图，用法也一样。）</em>' : '')},
        {screen: c => busMaps(p, c, 'map'), target: 'search', say: '<strong>点按顶部的搜索框。</strong>'},
        {screen: c => busMaps(p, c, 'suggest'), target: 'place-hull', action: c => { c.place = true; },
         say: '我们输入了“Hull interchange”。<strong>点按 Hull Paragon Interchange</strong>，也就是公交车站。'},
        {screen: c => busMaps(p, c, 'place'), target: 'directions', say: '<strong>点按“路线”。</strong>'},
        {screen: c => busMaps(p, c, 'modes'), target: 'mode-bus', say: '它先显示驾车路线。<strong>点按公交车图标</strong> ⟦bus⟧查看公共交通。', hints: {'mode-walk': '八个小时！请改为点按公交车图标。', 'mode-car': '那是驾车。请点按公交车图标。'}},
        {screen: c => busMaps(p, c, 'routes'), target: 'route-1', say: '这些是公交班次，最近的一班在最前面。“准点”是实时信息。<strong>点按 10:15 那一班。</strong>'},
        {screen: c => busMaps(p, c, 'trip'), question: {q: '您要在哪里上公交车？', options: [
            {t: 'Bridlington Bus Station，3 号站台', ok: true, why: '对。地图会告诉您步行到哪里、坐哪路车、在哪里下车。'},
            {t: 'Hull Paragon Interchange', why: '那是您下车的地方。您要在 Bridlington Bus Station 的 3 号站台上车。'}]}},
        {screen: c => busMaps(p, c, 'trip'), done: true,
         say: '<strong>做得好！</strong>真实出行时点按<strong>“开始”</strong>，地图会在快到您的站时提醒您。如果有公交通行证，像平常一样出示给司机就行。<em>（时间仅供练习：请以当天的实际时间为准。）</em>'},
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
        {screen: () => home(p), target: 'settings', say: '<strong>紧急 SOS</strong> 会替您拨打 999，并把您的位置用短信发给您选定的人。我们来检查它是否准备好了。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'sos', say: '<strong>点按“紧急 SOS”。</strong>', hint: '它在第三组里，是红色图标。'},
        {screen: c => list(p, '紧急 SOS', [{label: '按住并松开来呼叫', toggle: true, sub: '按住侧边按钮和一个音量键，然后松开。'},
            {id: 'five', label: '连按 5 下按钮来呼叫', toggle: !!c.five, sub: '快速连按侧边按钮 5 下。'}, {caption: ' '},
            {id: 'contacts', label: '在“健康”中设置紧急联系人'}, {label: '车祸检测', toggle: true, sub: '发生严重车祸后拨打 999。'}], {back: '设置'}),
         target: 'five', action: c => { c.five = true; }, say: '连按侧边按钮 5 下，在慌乱时也容易记住。<strong>开启“连按 5 下按钮来呼叫”。</strong>'},
        {screen: c => list(p, '紧急 SOS', [{label: '按住并松开来呼叫', toggle: true}, {label: '连按 5 下按钮来呼叫', toggle: true}, {caption: ' '},
            {id: 'contacts', label: '在“健康”中设置紧急联系人'}], {back: '设置', overlay: c.pick ? sheet('添加紧急联系人', [['pick-sarah', 'Sarah', '女儿 · 07700 900333'], ['pick-dave', 'Dave', '朋友']]) : ''}),
         target: 'contacts', action: c => { c.pick = true; }, say: '现在选择谁会收到带您位置的短信。<strong>点按“设置紧急联系人”。</strong>'},
        {screen: () => list(p, '紧急 SOS', [{label: '连按 5 下按钮来呼叫', toggle: true}], {back: '设置', overlay: sheet('添加紧急联系人', [['pick-sarah', 'Sarah', '女儿 · 07700 900333'], ['pick-dave', 'Dave', '朋友']])}),
         target: 'pick-sarah', action: c => { c.pick = false; c.sarah = true; }, say: '<strong>点按 Sarah</strong>，您的女儿。', hints: {'pick-dave': '这次练习请选 Sarah。'}},
        {screen: () => list(p, '紧急 SOS', [{label: '连按 5 下按钮来呼叫', toggle: true}, {caption: '紧急联系人'}, {label: 'Sarah', sub: '女儿'}], {back: '设置'}),
         question: {q: '您摔倒了，没法正常够到手机屏幕。您怎么办？', options: [
            {t: '快速连按侧边按钮 5 下', ok: true, why: '对。会开始倒计时，然后拨打 999，并用短信把您的位置告诉 Sarah。'},
            {t: '解锁手机，找到“电话”App', why: '紧急情况下这样太慢了。连按侧边按钮 5 下，即使手机锁定也有效。'}]}},
        {screen: () => list(p, '紧急 SOS', [{label: '连按 5 下按钮来呼叫', toggle: true}, {caption: '紧急联系人'}, {label: 'Sarah', sub: '女儿'}], {back: '设置'}), done: true,
         say: '<strong>做得好！</strong>紧急 SOS 已准备好，Sarah 会知道您在哪里。如果不小心按到了，只要在倒计时期间点按“停止”。'},
    ] : [
        {screen: () => home(p), target: 'settings', say: '<strong>紧急 SOS</strong> 会替您拨打 999，并把您的位置用短信发给您选定的人。我们来检查它是否准备好了。<strong>点按“设置”。</strong>'},
        {screen: c => settingsList(p, c), target: 'safety', say: '<strong>点按“安全和紧急情况”。</strong><em>三星手机上也叫“安全和紧急情况”。</em>', hint: '向下滚动：它在靠近底部的位置。'},
        {screen: () => list(p, '安全和紧急情况', [{id: 'medical', label: '医疗信息'}, {id: 'contacts-ec', label: '紧急联系人'}, {id: 'sos', label: '紧急 SOS', sub: '关闭'}, {label: '车祸检测'}]),
         target: 'sos', say: '紧急 SOS 是<strong>关闭</strong>的。<strong>点按“紧急 SOS”。</strong>'},
        {screen: c => list(p, '紧急 SOS', [{id: 'sos-toggle', label: '使用紧急 SOS', toggle: !!c.sosOn, sub: '连按电源键 5 次或更多次，启动紧急操作。'}, {label: '与紧急联系人共享信息', toggle: !!c.sosOn}]),
         target: 'sos-toggle', action: c => { c.sosOn = true; }, say: '<strong>点按“使用紧急 SOS”</strong>来开启。'},
        {screen: () => list(p, '安全和紧急情况', [{id: 'medical', label: '医疗信息'}, {id: 'contacts-ec', label: '紧急联系人', sub: '无'}, {label: '紧急 SOS', sub: '开启'}]),
         target: 'contacts-ec', say: '现在选择谁会收到带您位置的短信。<strong>点按“紧急联系人”。</strong>'},
        {screen: c => list(p, '紧急联系人', [{id: 'add', label: '＋ 添加联系人'}], {overlay: c.pick ? sheet('选择联系人', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']]) : ''}),
         target: 'add', action: c => { c.pick = true; }, say: '<strong>点按“添加联系人”。</strong>'},
        {screen: () => list(p, '紧急联系人', [{label: '＋ 添加联系人'}], {overlay: sheet('选择联系人', [['pick-sarah', 'Sarah', '07700 900333'], ['pick-dave', 'Dave', '']])}),
         target: 'pick-sarah', action: c => { c.pick = false; }, say: '<strong>点按 Sarah</strong>，您的女儿。', hints: {'pick-dave': '这次练习请选 Sarah。'}},
        {screen: () => list(p, '紧急联系人', [{label: 'Sarah', sub: '07700 900333'}, {label: '＋ 添加联系人'}]),
         question: {q: '您摔倒了，没法正常够到手机屏幕。您怎么办？', options: [
            {t: '快速连按电源键 5 下', ok: true, why: '对。会开始倒计时，然后拨打 999，并把您的位置分享给 Sarah。'},
            {t: '解锁手机，找到“电话”App', why: '紧急情况下这样太慢了。连按电源键 5 下，即使手机锁定也有效。'}]}},
        {screen: () => list(p, '紧急联系人', [{label: 'Sarah', sub: '07700 900333'}]), done: true,
         say: '<strong>做得好！</strong>紧急 SOS 已开启，Sarah 会知道您在哪里。如果不小心按到了，请在倒计时期间点按“取消”。'},
    ], {});

    SCENARIOS['emergency-alerts'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '紧急警报会提醒您附近有危险，比如严重洪水。这部手机上有人把其中一项关掉了。我们来改过来。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>点按“通知”。</strong>'},
            {screen: c => list(p, '通知', [{label: '显示预览', value: '始终'}, {caption: '通知样式'}, {label: '信息', sub: '横幅、声音、标记'}, {label: 'WhatsApp', sub: '横幅、声音、标记'},
                {caption: '政府警报'}, {label: '极端警报', toggle: true}, {id: 'severe', label: '严重警报', toggle: !!c.severe}, {label: '测试警报', toggle: false}], {back: '设置'}),
             target: 'severe', action: c => { c.severe = true; }, say: '“政府警报”就在最底部。<strong>严重警报</strong>是关闭的。<strong>点按它来开启。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'safety', say: '<strong>点按“安全和紧急情况”。</strong>', hint: '它在列表靠近底部的位置。'},
            {screen: () => list(p, '安全和紧急情况', [{label: '医疗信息'}, {label: '紧急 SOS'}, {id: 'wea', label: '无线紧急警报'}, {label: '未知追踪器警报'}]),
             target: 'wea', say: '<strong>点按“无线紧急警报”。</strong><em>在有些手机上叫“紧急警报”。</em>'},
            {screen: c => list(p, '无线紧急警报', [{label: '允许警报', toggle: true}, {label: '极端威胁', toggle: true}, {id: 'severe', label: '严重威胁', toggle: !!c.severe}, {label: '测试警报', toggle: false}]),
             target: 'severe', action: c => { c.severe = true; }, say: '<strong>严重威胁</strong>是关闭的。<strong>点按它来开启。</strong>'},
        ]),
        {screen: () => home(p) + `<div class="qi"><strong>⟦triangle-alert⟧ 紧急警报：严重</strong><p>预计海滨附近将出现严重洪水。请转移到地势较高的地方。更多信息见 gov.uk/alerts</p><button type="button" data-tap="ok">好</button></div>`,
         target: 'ok', say: '警报就是这个样子。它会发出大约 10 秒的响亮警笛声，即使处于静音。<strong>点按“好”。</strong><em>（仅供练习。）</em>'},
        {screen: () => home(p), question: {q: '您开车时收到了警报。应该怎么做？', options: [
            {t: '先把车停到安全的地方再看', ok: true, why: '对。开车时绝不要看手机。安全停车后再看。'},
            {t: '开车时马上就看', why: '开车时绝不要看手机。先找个安全的地方停下来。'}]}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>您的手机现在会就附近的严重危险向您发出警告。真正的警报绝不会索要个人信息或钱：如果有，那就是诈骗。'},
    ], {});

    SCENARIOS['theft-protection'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '有三件事能让被偷的手机对小偷用处小得多。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'lock', say: '<strong>点按“面容 ID 与密码”。</strong><em>在真正的 iPhone 上，接下来您要输入密码。</em>'},
            {screen: c => iosLockPage({...c, passcodeSet: true}), target: 'stolen', say: '向下滚动并<strong>点按“失窃设备保护”</strong>。'},
            {screen: c => list(p, '失窃设备保护', [{id: 'sdp', label: '失窃设备保护', toggle: !!c.sdp, sub: '不在家时，更改您的密码或 Apple 账户需要面容 ID，并要等待 1 小时。'}], {back: '面容 ID'}),
             target: 'sdp', action: c => { c.sdp = true; }, say: '这样，看着您输入密码的小偷就没法把您锁在外面。<strong>请开启它。</strong>'},
            {screen: () => list(p, '失窃设备保护', [{label: '失窃设备保护', toggle: true}], {back: '面容 ID'}), target: 'back',
             say: '接下来，隐藏锁定屏幕上的消息。<strong>点按“‹ 面容 ID”</strong>返回。'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>点按“通知”。</strong>'},
            {screen: c => list(p, '通知', [{id: 'previews', label: '显示预览', value: c.previews || '始终'}, {label: '屏幕共享', value: '通知已关闭'}], {back: '设置',
                overlay: c.pickPrev ? sheet('显示预览', [['prev-always', '始终'], ['prev-unlocked', '解锁时', '推荐'], ['prev-never', '永不']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: '现在任何人都可以不解锁您的手机就读到您的消息，包括安全验证码。<strong>点按“显示预览”。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '<strong>点按“Google”。</strong>', hint: '它在列表靠近底部的位置。'},
            {screen: () => list(p, 'Google', [{label: '管理您的 Google 账户'}, {id: 'all-services', label: '所有服务'}, {label: '备份'}]), target: 'all-services', say: '<strong>点按“所有服务”。</strong>'},
            {screen: () => list(p, '所有服务', [{caption: '个人和设备安全'}, {id: 'theft', label: '防盗保护'}, {label: 'Find Hub'}]), target: 'theft', say: '<strong>点按“防盗保护”。</strong>'},
            {screen: c => list(p, '防盗保护', [{id: 'tdl', label: '防盗检测锁定', toggle: !!c.tdl, sub: '如果感觉到有人抢了您的手机跑掉，就锁定屏幕。'}, {label: '离线设备锁定', toggle: !!c.tdl}]),
             target: 'tdl', action: c => { c.tdl = true; }, say: '<strong>开启“防盗检测锁定”。</strong>如果有人抢走您的手机跑掉，它会自动锁定。'},
            {screen: c => settingsList(p, c), target: 'notifications', say: '接下来，隐藏锁定屏幕上的消息。回到“设置”，<strong>点按“通知”</strong>。'},
            {screen: c => list(p, '通知', [{id: 'previews', label: '锁定屏幕上的通知', sub: c.previews || '显示所有内容'}, {label: '通知记录'}], {
                overlay: c.pickPrev ? sheet('锁定屏幕上的通知', [['prev-always', '显示所有内容'], ['prev-unlocked', '隐藏敏感内容', '推荐'], ['prev-never', '完全不显示通知']]) : ''}),
             target: 'previews', action: c => { c.pickPrev = true; }, say: '现在任何人都可以不解锁您的手机就读到您的消息，包括安全验证码。<strong>点按“锁定屏幕上的通知”。</strong>'},
        ]),
        {screen: c => (p === 'ios'
                ? list(p, '通知', [{label: '显示预览', value: '始终'}], {back: '设置', overlay: sheet('显示预览', [['prev-always', '始终'], ['prev-unlocked', '解锁时', '推荐'], ['prev-never', '永不']])})
                : list(p, '通知', [{label: '锁定屏幕上的通知', sub: '显示所有内容'}], {overlay: sheet('锁定屏幕上的通知', [['prev-always', '显示所有内容'], ['prev-unlocked', '隐藏敏感内容', '推荐'], ['prev-never', '完全不显示通知']])})),
         target: 'prev-unlocked', action: c => { c.pickPrev = false; }, say: `<strong>Tap ${p === 'ios' ? '解锁时' : '隐藏敏感内容'}.</strong>`, hints: {'prev-always': '那是原来的设置。请选推荐的那个。', 'prev-never': '那样会完全隐藏，可能有点烦人。请选推荐的那个。'}},
        {screen: () => home(p), target: 'phone', say: '最后，找到您手机的 IMEI 号码。运营商需要它来屏蔽被偷的手机。<strong>打开“电话”App。</strong>'},
        {screen: c => dialer(p, '*#06#'.slice(0, c.pos)), sequence: dialKeys('*#06#'), action: c => { c.imei = true; },
         say: '在拨号键盘上，<strong>输入 *#06#</strong>（星号、井号、零、六、井号）。', hint: '先按星号键 *，在左下角。'},
        {screen: () => dialer(p, '*#06#', {overlay: dialog(p, '设备信息', 'IMEI：35 209900 176148 1（练习号码）', [['ok', '好']])}),
         target: 'ok', say: '那一长串数字就是您的 <strong>IMEI</strong>。在真正的手机上，把它写下来放在安全的地方（不要存在手机里！）。<strong>点按“好”。</strong>'},
        {screen: () => home(p), question: {q: '您的手机被抢了。您先给谁打电话？', options: [
            {t: '您的银行，用别人的手机打', ok: true, why: '对。小偷首先会盯上银行 App。然后在网上锁定手机，打电话给运营商，并拨打 101 报案。'},
            {t: '等等看它会不会出现', why: '速度很重要。马上打电话给银行，然后锁定手机并联系运营商。'}]}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>您的手机现在对小偷来说难用多了，您也知道在哪里找 IMEI 了。'},
    ], {});

    SCENARIOS['tracker-alert'] = (p) => withCtx([
        {screen: () => lockScreen(p, {id: 'alert', app: p === 'ios' ? '查找' : '追踪器提醒', title: p === 'ios' ? '发现 AirTag 正随您移动' : '未知追踪器正随您移动',
            text: '<br>此物品的所有者可以看到它的位置。'}),
         target: 'alert', say: '您的手机发现有一个不是您的追踪器正随您移动。别慌：常常是家人不小心的。<strong>点按这条提醒。</strong>'},
        {screen: c => app(p, p === 'ios' ? '未知 AirTag' : '未知追踪器', `<div class="vl"><span class="pt"></span><span class="ajc"></span></div>
            <p class="cf">今天 <strong>10:12</strong> 起一直在您身边，经过 4 个地点。</p>
            <button type="button" class="ce co" data-tap="play">播放声音</button>
            <button type="button" class="cp" data-tap="learn">了解此${p === 'ios' ? 'AirTag' : '追踪器'}</button>
            <button type="button" class="cp" data-tap="disable">停用说明</button>`, {color: '#fff'}),
         target: 'play', action: c => { c.played = true; }, say: '地图显示了它跟着您去过的地方。<strong>点按“播放声音”</strong>来找到它。'},
        {screen: () => app(p, p === 'ios' ? '未知 AirTag' : '未知追踪器', '<p class="cf">⟦volume-2⟧ <strong>正在播放声音……</strong><br>听听有没有啁啾声。</p>', {color: '#fff'}),
         question: {q: '您听到了微弱的啁啾声。该去哪里找？', options: [
            {t: '包里、外套口袋里、车里，以及您借来的任何东西里', ok: true, why: '对。追踪器很小，大约和一枚大硬币差不多，常常塞在衬里、口袋或汽车里。'},
            {t: '哪里都不用找，不理它', why: '值得找一找。检查包、口袋和您的车：也许只是某位家人的。'}]}},
        {screen: c => app(p, '已找到追踪器', `<p class="cf">把手机顶部靠近追踪器，查看更多信息。</p>
            <div class="zf" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scan">靠近追踪器</button>`, {color: '#fff'}),
         target: 'scan', say: '您在外套衬里里找到了它。<strong>点按“靠近追踪器”</strong>，看它属于谁。'},
        {screen: () => app(p, '关于此追踪器', '<p class="cf"><strong>未处于丢失模式</strong><br>序列号：P4R7-ACT1CE<br>所有者信息只会提供给警方。</p>', {color: '#fff'}),
         question: {q: '它不是家人的，而且您担心有人把它藏起来跟踪您。您怎么办？', options: [
            {t: '妥善保管，并交给警方（如果有危险，就拨打 999）', ok: true, why: '对。不要把它扔掉：警方可以追查到它的所有者。National Stalking Helpline（全国跟踪骚扰求助热线）电话是 0808 802 0300。'},
            {t: '扔进垃圾桶', why: '它可能是证据，警方可以追查到所有者。请保管好并交给他们，如果有危险就拨打 999。'}]}},
        {screen: () => app(p, '关于此追踪器', '<p class="cf">求助：National Stalking Helpline 0808 802 0300<br>Domestic Abuse Helpline（24 小时）0808 2000 247</p>', {color: '#fff'}), done: true,
         say: '<strong>做得好！</strong>您知道怎样找到追踪器，以及该怎么做了。 ' + (p === 'android' ? '请在<strong>设置 > 安全和紧急情况 > 未知追踪器警报</strong>中确认警报已开启。' : 'iPhone 会自动检查追踪器。')},
    ], {});

    const w3wApp = ['w3w', 'what3words', '#e11d48', '<span class="ok">///</span>'];
    SCENARIOS['lost-999'] = (p) => withCtx([
        {screen: () => homeWith(p, [w3wApp]), target: 'w3w',
         say: '您在悬崖小路上，有人摔倒了。这里没有门牌地址。拨打 999 时，大多数手机会自动发送您的位置，但三个词的地址也会有帮助。<strong>打开 what3words。</strong><em>（练习版。）</em>'},
        {screen: c => `<div class="cg pr ph-${p}">${statusBar(p)}<div class="ra air"><span class="pt"></span><span class="abs"></span></div>
            <div class="gz"><strong class="adx">///puffin.chalk.lantern</strong><small>Near Flamborough, East Riding (practice)</small>
            <button type="button" class="ce co" data-tap="got-it">I've got my 3 words</button></div>${homeIndicator(p)}</div>`,
         target: 'got-it', say: '蓝点就是您。每个 3 米见方的格子都有自己的三个词。您的是 <strong>puffin.chalk.lantern</strong>。稍等一下，让蓝点稳定下来，然后<strong>点按“我拿到了我的 3 个词”</strong>。'},
        {screen: () => home(p), target: 'phone', say: '现在拨打 999。<strong>打开“电话”App。</strong><em>（仅供练习：绝不要为了测试而拨打 999。）</em>'},
        {screen: c => dialer(p, '999'.slice(0, c.pos)), sequence: dialKeys('999'), say: '<strong>输入 999。</strong>'},
        {screen: () => dialer(p, '999'), target: 'call', say: '<strong>点按绿色拨号按钮。</strong>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('9', '#dc2626')}<strong>999</strong><small>紧急呼叫 · 0:08</small></div>
            <p class="hi">“紧急服务，您需要哪种服务？……救护车。紧急情况的确切位置在哪里？”</p>${homeIndicator(p)}</div>`,
         question: {q: '接线员问您在哪里。您怎么说？', options: [
            {t: '“我在悬崖小路上。我的 what3words 地址是 puffin、chalk、lantern。”', ok: true, why: '对。先用自己的话说出您在哪里，再说出三个词。如果他们要求，就把每个词拼出来。'},
            {t: '“我不知道，在海边什么地方”', why: '他们会设法找到您，但三个词能把您精确到 3 米以内。请从 App 里念给他们听。'}]}},
        {screen: () => home(p), question: {q: '一位朋友是聋人，没法打语音电话。他怎样联系 999？', options: [
            {t: '现在就注册紧急短信服务（给 999 发短信“register”），或使用 999 BSL App', ok: true, why: '对。紧急短信必须先注册才能使用。999 BSL App 会接通手语翻译。'},
            {t: '他们看不到', why: '可以。给 999 发短信“register”注册紧急短信服务，或使用免费的 999 BSL App。'}]}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>记住：先说出您在哪里，再说出您的三个词。what3words App 没有信号时也能找到您的三个词，但打电话需要有信号。'},
    ], {});

    // ======================================================================================
    // Course: Fixing common problems
    // ======================================================================================
    function frozen(p, ctx) {
        if (ctx.booting) return `<div class="agk">${ctx.busy ? `<span class="aby">${p === 'ios' ? '' : '◉'}</span>` : ''}${homeIndicator(p)}</div>`;
        return `<div class="cg xy ph-${p}">${statusBar(p)}<div class="ua"><p>⟦hourglass⟧</p><p>无响应</p></div>${edgeButtons(p)}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['frozen-phone'] = (p) => withCtx([
        {screen: c => frozen(p, c), question: {q: '您的手机卡住了：点按没反应，也不能用正常方式关机。这是大问题吗？', options: [
            {t: '通常不是。“强制重启”能解决，而且不会丢任何东西', ok: true, why: '没错。强制重启就像在墙上拔掉电源再插上。您的照片和消息都是安全的。'},
            {t: '是的，它坏了', why: '通常不是！强制重启能解决大多数卡住的手机，而且不会丢任何东西。'}]}},
        {screen: c => frozen(p, c), sequence: p === 'ios' ? ['vol-up', 'vol-down', 'side'] : ['power', 'vol-down'], action: c => { c.booting = true; },
         say: p === 'ios'
            ? '在 iPhone 上：<strong>按一下调高音量键后松开</strong>，再<strong>按一下调低音量键后松开</strong>，然后<strong>按住侧边按钮</strong>，直到出现 Apple 标志（大约 10 秒）。这里请按这个顺序点按它们。'
            : '在大多数 Android 手机上：<strong>同时按住电源键和调低音量键</strong>大约 10 秒，直到手机重新启动。这里请先点按电源键，再点按调低音量。<em>（Google Pixel：只按住电源键 30 秒。）</em>',
         hints: {'vol-down': p === 'ios' ? '先按调高音量键。' : '先按电源键。', side: '侧边按钮最后按，在两个音量键之后。'},
         hint: p === 'ios' ? '先调高音量，再调低音量，最后是侧边按钮。' : '先电源键，再调低音量。'},
        {screen: c => frozen(p, c), wait: 1600,
         question: {q: '标志出现了。现在怎么办？', options: [
            {t: '松开手，等它启动', ok: true, why: '对。需要一分钟左右。您可能需要输入一次密码。'},
            {t: '继续按住所有按钮', why: '标志一出现就松手，给它一分钟时间启动。'}]}},
        {screen: () => lockScreen(p, null), done: true,
         say: '<strong>做得好！</strong>您的手机重新启动了。如果它总是卡住，请检查更新并腾出存储空间。每周重启一次手机，能让它运行顺畅。'},
    ], {});

    function quickPanel(p, ctx) {
        const plane = !!ctx.plane;
        return `<div class="nm ${p}">${statusBar(p)}<div class="agx">
            <button type="button" class="mp${plane ? ' on' : ''}" data-tap="airplane">⟦plane⟧ Airplane mode<small>${plane ? '开启' : '关闭'}</small></button>
            <span class="mp${plane ? '' : ' on'}">⟦signal⟧ Mobile data<small>${plane ? '关闭' : (ctx.signal ? '已开启 · 4G' : '无服务')}</small></span>
            <span class="mp on">Wi-Fi<small>${plane ? '关闭' : '主页'}</small></span><span class="mp">⟦flashlight⟧ Torch<small>Off</small></span></div>
            <button type="button" class="sl" data-tap="close">${p === 'ios' ? '向上滑动以关闭' : '关闭'}</button>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['airplane-reset'] = (p) => withCtx([
        {screen: () => home(p, {pull: true}).replace('<span class="jh">', '<span class="jh"><span class="ahz">无服务</span>'), target: 'pull-down',
         say: '您的手机显示<strong>无服务</strong>，但今天早上还好好的。一个快速的办法是把飞行模式打开再关掉，让它重新连接。 ' + (p === 'ios' ? '<strong>从右上角向下滑动</strong>（或点按顶部的长条）。' : '<strong>从顶部向下滑动</strong>（或点按顶部的长条）。')},
        {screen: c => quickPanel(p, c), target: 'airplane', action: c => { c.plane = true; }, say: '<strong>点按“飞行模式”</strong>来开启。所有无线功能都会关闭。'},
        {screen: c => quickPanel(p, c), wait: 1200, target: 'airplane', action: c => { c.plane = false; c.signal = true; }, say: '等大约 10 秒……然后<strong>再次点按“飞行模式”</strong>来关闭。'},
        {screen: c => quickPanel(p, c), question: {q: '手机流量已恢复为 4G。飞行模式还有什么时候好用？', options: [
            {t: '在飞机上，或在国外避免漫游费用（您仍然可以开启 Wi-Fi）', ok: true, why: '对。开着飞行模式时，您可以重新打开 Wi-Fi，使用酒店或轮船上的 Wi-Fi。'},
            {t: '给手机充电', why: '充电确实会稍快一点，但它主要用于乘飞机和避免在国外产生漫游费用。'}]}},
        {screen: c => quickPanel(p, c), done: true, say: '<strong>做得好！</strong>如果飞行模式没能解决，就重启手机。还是没有服务？请查看您的运营商网站，看您所在地区有没有故障。'},
    ], {});

    const bubbleApp = ['bubble', 'Bubble Pop', '#f472b6', '<span class="ok">●</span>'];
    SCENARIOS['notifications'] = (p) => withCtx([
        {screen: () => homeWith(p, [bubbleApp]) + '<button type="button" class="jp" data-tap="notif"><strong>BUBBLE POP · 现在</strong><span>🎁 您的免费生命在等着您！快回来玩吧！🎉</span></button>',
         target: 'settings', say: '一款游戏总是发来毫无意义的消息吵个不停。您可以关闭任何应用的通知。<strong>点按“设置”</strong>，而不是那条消息。', hints: {notif: '那样会打开游戏。请改为点按“设置”。'}},
        {screen: c => settingsList(p, c), target: 'notifications', say: '<strong>点按“通知”。</strong>'},
        {screen: () => p === 'ios'
            ? list(p, '通知', [{label: '显示预览', value: '解锁时'}, {caption: '通知样式'}, {id: 'bubble', label: 'Bubble Pop', sub: '横幅、声音、标记'}, {label: '信息', sub: '横幅、声音、标记'}, {label: 'WhatsApp', sub: '横幅、声音、标记'}], {back: '设置'})
            : list(p, '通知', [{id: 'app-notifs', label: '应用通知'}, {id: 'history', label: '通知记录'}, {label: '锁定屏幕上的通知'}]),
         target: p === 'ios' ? 'bubble' : 'app-notifs', say: p === 'ios' ? '<strong>点按 Bubble Pop。</strong>' : '<strong>点按“应用通知”。</strong>'},
        ...(p === 'android' ? [{screen: () => list(p, '应用通知', [{label: '信息', toggle: true}, {id: 'bubble', label: 'Bubble Pop', toggle: true}, {label: 'WhatsApp', toggle: true}]),
            target: 'bubble', action: c => { c.off = true; }, say: '<strong>点按 Bubble Pop 旁边的开关</strong>来关闭它的通知。', hints: {}}] : [
            {screen: c => list(p, 'Bubble Pop', [{id: 'allow', label: '允许通知', toggle: !c.off}], {back: '通知'}),
             target: 'allow', action: c => { c.off = true; }, say: '<strong>关闭“允许通知”。</strong>'}]),
        ...(p === 'android' ? [
            {screen: () => list(p, '通知', [{label: '应用通知'}, {id: 'history', label: '通知记录', sub: '关闭'}]), target: 'history',
             say: '实用的补充：如果您不小心把一条消息划掉了，“通知记录”会保留一份副本。<strong>点按“通知记录”。</strong>'},
            {screen: c => list(p, '通知记录', [{id: 'hist-toggle', label: '使用通知记录', toggle: !!c.hist}]), target: 'hist-toggle', action: c => { c.hist = true; }, say: '<strong>把它打开。</strong>'},
        ] : []),
        {screen: () => homeWith(p, [bubbleApp]), question: {q: '哪些应用的通知值得保持开启？', options: [
            {t: '信息、电话、WhatsApp、您的银行，以及任何您想马上知道的', ok: true, why: '对。保留重要的，关掉游戏、商店和那些只会唠叨的。'},
            {t: '全部关掉', why: '那样您会错过消息和电话！保留重要的，关掉游戏和购物类应用。'}]}},
        {screen: () => homeWith(p, [bubbleApp]), done: true, say: '<strong>做得好！</strong>Bubble Pop 再也不会打扰您了。 ' + (p === 'ios' ? '如果您不小心把一条消息划掉了，可以在锁定屏幕中间向上滑动，查看之前的通知。' : '通知记录还会保留您划掉的任何通知的副本。')},
    ], {});

    SCENARIOS['autocorrect'] = (p) => withCtx([
        {screen: () => `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><strong>Sarah</strong></div>
            <div class="gf"><div class="dm me xh"><span>在 ducking garden centre 见 x</span><small>10:20</small></div></div>
            <div class="hn"><span class="rt">短信</span></div>${homeIndicator(p)}</div>`,
         question: {q: '您输入的是“Dunnington garden centre”，但手机把它改掉了。为什么？', options: [
            {t: '自动更正猜错了词', ok: true, why: '对。自动更正会把它不认识的词换掉。您可以把它关掉，或教它新词。'},
            {t: '手机坏了', why: '这只是自动更正在瞎猜。您可以把它关掉，或教它新词。'}]}},
        {screen: () => home(p), target: 'settings', say: '<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'general', say: '<strong>点按“通用”。</strong>'},
            {screen: () => list(p, '通用', [{label: '关于本机'}, {label: '软件更新'}, {id: 'keyboard', label: '键盘'}, {label: '语言与地区'}], {back: '设置'}), target: 'keyboard', say: '<strong>点按“键盘”。</strong>'},
            {screen: c => list(p, '键盘', [{id: 'replace', label: '文本替换'}, {caption: '所有键盘'}, {label: '自动大写', toggle: true}, {id: 'ac', label: '自动修正', toggle: !c.acOff}, {label: '预测文本', toggle: true}], {back: '通用'}),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>关闭“自动修正”。</strong>拼错的词仍然会有红色下划线，您可以自己改。'},
        ] : [
            {screen: c => settingsList(p, c), target: 'system', say: '<strong>点按“系统”。</strong>它在底部。'},
            {screen: () => list(p, '系统', [{id: 'keyboard', label: '键盘'}, {label: '语言'}, {label: '日期和时间'}]), target: 'keyboard', say: '<strong>点按“键盘”。</strong>'},
            {screen: () => list(p, '键盘', [{id: 'gboard', label: 'Gboard', sub: '屏幕键盘'}]), target: 'gboard', say: '<strong>点按“Gboard”。</strong><em>在三星手机上，是 三星键盘 > 智能输入。</em>'},
            {screen: () => list(p, 'Gboard', [{label: '偏好设置'}, {id: 'correction', label: '文本更正'}, {label: '滑行输入'}]), target: 'correction', say: '<strong>点按“文本更正”。</strong>'},
            {screen: c => list(p, '文本更正', [{label: '显示建议栏', toggle: true}, {id: 'ac', label: '自动更正', toggle: !c.acOff}, {label: '拼写检查', toggle: true}]),
             target: 'ac', action: c => { c.acOff = true; }, say: '<strong>关闭“自动更正”。</strong>拼错的词仍然会有红色下划线，您可以自己改。'},
        ]),
        {screen: () => home(p), question: {q: '您更愿意保留自动更正，但它总是把“Dunnington”改掉。还有什么办法？', options: [
            {t: '把它加进手机的词典，让它学会这个词', ok: true, why: 'Yes. ' + (p === 'ios' ? '使用同一个键盘设置里的“文本替换”。' : '点按建议栏里的这个词，选择把它加进词典。')},
            {t: '没办法，只能忍着', why: '您可以教它： ' + (p === 'ios' ? '在“键盘 > 文本替换”里添加这个词。' : '点按建议里的这个词，把它加进词典。')}]}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>不会再有莫名其妙的换词了。您随时可以在同一个地方把它重新打开。'},
    ], {});

    SCENARIOS['bluetooth'] = (p) => withCtx([
        {screen: () => home(p), question: {q: '您有了新的无线耳机。首先该做什么？', options: [
            {t: '让它们进入“配对模式”（通常是按住按钮，直到指示灯闪烁）', ok: true, why: '对。配对模式能让您的手机找到它们。盒子里的说明书会写明具体怎么做。'},
            {t: '把它们插到手机上', why: '无线耳机通过蓝牙连接。先让它们进入配对模式，通常是按住按钮，直到指示灯闪烁。'}]}},
        {screen: () => home(p), target: 'settings', say: '耳机的指示灯在闪烁。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'bluetooth', say: '<strong>点按“蓝牙”。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'devices', say: '<strong>点按“已连接的设备”。</strong>'},
            {screen: () => list(p, '已连接的设备', [{id: 'pair', label: '＋ 配对新设备'}, {label: '已保存的设备', sub: '汽车'}]), target: 'pair', say: '<strong>点按“配对新设备”。</strong>'},
        ]),
        {screen: c => list(p, p === 'ios' ? '蓝牙' : '配对新设备', [{label: '蓝牙', toggle: true}, {caption: p === 'ios' ? '我的设备' : '已保存'}, {label: '汽车', sub: '未连接'},
            {caption: p === 'ios' ? '其他设备' : '可用设备'}, {id: 'headphones', label: '⟦headphones⟧ Practice Headphones'}, {label: '邻居的电视'}], {back: '设置'}),
         target: 'headphones', say: '您的手机正在查找附近的设备。<strong>点按 Practice Headphones。</strong>', hints: {}},
        {screen: () => list(p, '蓝牙', [{label: '蓝牙', toggle: true}, {caption: '我的设备'}, {label: '⟦headphones⟧ Practice Headphones', sub: '已连接 ⟦check⟧'}, {label: '汽车', sub: '未连接'}], {back: '设置'}),
         question: {q: '下次打开耳机时，还要再这样做一遍吗？', options: [
            {t: '不用，从现在起它们会自己连接', ok: true, why: '对。只需配对一次。之后只要它们开着且在附近，就会自动连接。'},
            {t: '要，每次都要', why: '只需配对一次。之后它们会自己连接。'}]}},
        {screen: () => list(p, '蓝牙', [{label: '⟦headphones⟧ Practice Headphones', sub: '已连接 ⟦check⟧'}], {back: '设置'}), done: true,
         say: '<strong>做得好！</strong>同样的步骤也适用于汽车、音箱或助听器。如果连不上，就把蓝牙关掉再打开，并让设备重新进入配对模式。'},
    ], {});

    // ======================================================================================
    // Extra lessons for existing courses
    // ======================================================================================
    function scamCall(p, ctx) {
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('?', '#64748b')}<strong>07700 900555</strong><small>${ctx.answered ? '0:21' : 'mobile'}</small></div>
            ${ctx.answered ? `<p class="hi">“${ctx.said || '奶奶？是我，Tom！我手机丢了，还惹上了麻烦。我今天需要 £400 交罚款。请别告诉妈妈！'}”</p>
            <div class="qp"><button type="button" data-tap="ask-phrase">索要家人约定的暗号</button><button type="button" data-tap="send-money">说您会汇钱</button></div>
            <div class="fb za"><button type="button" class="kp" data-tap="end" aria-label="End call">${UI.hangup}</button></div>`
            : `<div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
            <p class="je"><span>Decline</span><span>Answer</span></p>`}${homeIndicator(p)}</div>`;
    }
    SCENARIOS['voice-clone'] = (p) => withCtx([
        {screen: c => scamCall(p, c), target: 'answer', action: c => { c.answered = true; }, say: '一个陌生号码在打来电话。<strong>接听它</strong>，练习该怎么做。', hints: {decline: '在现实中拒接也没问题！这次练习请点按“接听”。'}},
        {screen: c => scamCall(p, c), target: 'ask-phrase', action: c => { c.said = '呃……什么？奶奶，没时间说这个了！求你了，我现在就需要钱！'; },
         say: '听起来就像您的孙子 Tom。但骗子可以模仿声音。您的家人约定过一个<strong>暗号</strong>。<strong>请他说出暗号。</strong>',
         hints: {'send-money': '在这样的电话里绝不要答应汇钱。请索要暗号。', end: '直接挂断也行！但先练习一下索要暗号。'}},
        {screen: c => scamCall(p, c), target: 'end', say: '他们不知道暗号，还催得更紧了。那是骗子。<strong>按红色按钮挂断。</strong>', hints: {'send-money': '别这样！他们不知道暗号。请挂断。', 'ask-phrase': '您问了，他们答不上来。请挂断。'}},
        {screen: () => home(p), question: {q: '您还是有点担心 Tom。您怎么办？', options: [
            {t: '用您已有的号码打给 Tom（或他妈妈）', ok: true, why: '对。永远打您认识的号码。真正的 Tom 不会有事，也不会介意您核实。'},
            {t: '回拨刚才打来的号码', why: '那样又会打给骗子。请用您已有的号码打给 Tom。'}]}},
        {screen: () => home(p), target: 'phone', say: '如果电话和您的银行账户有关，您可以拨打 <strong>159</strong> 安全地联系您自己的银行。<strong>打开“电话”App</strong> 来练习。'},
        {screen: c => dialer(p, '159'.slice(0, c.pos)), sequence: dialKeys('159'), say: '<strong>输入 159。</strong>'},
        {screen: () => dialer(p, '159'), target: 'call', say: '<strong>点按绿色拨号按钮。</strong><em>（仅供练习：不会真的拨出。）</em>'},
        {screen: () => `<div class="fv ${p}">${statusBar(p)}<div class="fh">${avatar('£', '#0f766e')}<strong>159</strong><small>Stop Scams UK</small></div>
            <p class="hi">“欢迎致电 159。请说出您的银行名称，我们会为您转接。”</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>做得好！</strong>159 会接通您真正的银行。请和家人当面约定一个暗号，并且绝不要发到网上。'},
    ], {});

    SCENARIOS['new-phone'] = (p) => withCtx([
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? '你好' : '你好呀'}</h3><button type="button" class="ce co" data-tap="start">${p === 'ios' ? '向上滑动以打开' : '开始使用'}</button>${homeIndicator(p)}</div>`,
         target: 'start', say: `您的新手机已经拆开包装并开机。把<strong>旧手机</strong>放在旁边，充好电并连着 Wi-Fi。<strong>点按 ${p === 'ios' ? '向上滑动以打开' : '开始使用'}。</strong>`},
        {screen: () => list(p, p === 'ios' ? '快速开始' : '拷贝应用和数据', [], {noBack: true, top: `<p class="cf">${p === 'ios' ? '把您的旧 iPhone 靠近这部手机，用您的 Apple 账户进行设置。' : '把应用、照片、联系人等从旧手机拷贝过来。'}</p>
            <button type="button" class="ce ${p === 'ios' ? 'co' : 'dk'}" data-tap="use-old">${p === 'ios' ? '在旧 iPhone 上继续' : '使用旧设备'}</button>
            <button type="button" class="cp" data-tap="manual">改为手动设置</button>`}),
         target: 'use-old', say: '从旧手机拷贝，省得把一切重新设置一遍。<strong>点按 ' + (p === 'ios' ? '在旧 iPhone 上继续' : '使用旧设备') + '.</strong>', hints: {manual: '也可以，但拷贝要容易得多。请点按另一个按钮。'}},
        {screen: () => `<div class="cg ph-${p} qh">${statusBar(p)}<p class="cf">在您的<strong>旧</strong>手机上会出现一条消息。用它的相机对准这个图案。</p>
            <div class="aja" aria-hidden="true"></div><button type="button" class="ce co" data-tap="scanned">旧手机已扫描</button>${homeIndicator(p)}</div>`,
         target: 'scanned', say: '在旧手机上，点按“继续”，然后把它举在这个图案上方，让相机能看到。这里请<strong>点按“旧手机已扫描”</strong>。'},
        {screen: c => codeScreen(p, c, '输入旧手机的密码', '这样可以安全地拷贝您的设置。'), sequence: CODE_KEYS,
         say: `输入旧手机的密码。练习时请用 <strong>${codeText}</strong>。`, hint: `输入练习密码 ${codeText}。`},
        {screen: () => list(p, '传输您的数据', [], {noBack: true, top: `<p class="cf">选择要带过来的内容：</p>
            <div class="cj ex"><span>照片和视频</span>${tog(true)}</div><div class="cj ex"><span>联系人和信息</span>${tog(true)}</div><div class="cj ex"><span>应用</span>${tog(true)}</div>
            <button type="button" class="ce co" data-tap="transfer">继续</button>`}),
         target: 'transfer', say: '全部都已勾选。<strong>点按“继续”。</strong>让两部手机靠得近一些，并插着电源。'},
        {screen: c => list(p, '正在传输……', [], {noBack: true, top: `<div class="iq"><span>${c.busy ? '大约还剩 25 分钟' : '传输完成 ⟦check⟧'}</span><div class="qa"><span style="width:${c.busy ? 35 : 100}%;background:#22c55e"></span></div></div>`}), wait: 1500,
         question: {q: '传输已完成。旧手机该怎么处理？', options: [
            {t: '留一周，确认没有遗漏，然后在出售或回收前彻底抹掉', ok: true, why: '对。先确认您的照片、WhatsApp 和银行应用在新手机上都能用。下一课会讲怎样抹掉旧手机。'},
            {t: '马上扔进垃圾桶', why: '它里面还有您所有的信息！先确认新手机里什么都有了，再彻底抹掉旧手机。'}]}},
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>您的新手机里已经有了照片、联系人和应用。有些应用，比如银行和 WhatsApp，会要求您重新登录；请准备好您的登录信息。'},
    ], {});

    SCENARIOS['sell-phone'] = (p) => withCtx([
        {screen: () => home(p), target: 'settings', say: '要出售、送人或回收旧手机吗？请按正确的顺序操作，否则下一位主人就没法用。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'account', say: '第 1 步：退出您的 Apple 账户。<strong>点按您的姓名</strong>。'},
            {screen: c => list(p, 'Apple 账户', [{label: '个人信息'}, {label: '登录与安全性'}, {label: 'iCloud'}, {caption: ' '}, {id: 'sign-out', label: '退出登录', danger: true}], {back: '设置',
                overlay: c.ask ? dialog(p, '要退出登录吗？', '关闭“查找”需要您的密码。（练习：已替您输入。）', [['cancel', '取消'], ['turn-off', '关闭']]) : ''}),
             target: 'sign-out', action: c => { c.ask = true; }, say: '滚动到底部并<strong>点按“退出登录”</strong>。'},
            {screen: () => list(p, 'Apple 账户', [{label: '退出登录', danger: true}], {back: '设置', overlay: dialog(p, '要退出登录吗？', '关闭“查找”需要您的密码。（练习：已替您输入。）', [['cancel', '取消'], ['turn-off', '关闭']])}),
             target: 'turn-off', say: '这会关闭<strong>“查找”</strong>，否则它会把手机锁定在您名下。<strong>点按“关闭”。</strong>'},
            {screen: c => settingsList(p, c), target: 'general', say: '第 2 步：抹掉它。<strong>点按“通用”。</strong>'},
            {screen: () => list(p, '通用', [{label: '关于本机'}, {label: 'iPhone 储存空间'}, {id: 'reset', label: '传输或还原 iPhone'}], {back: '设置'}), target: 'reset', say: '<strong>点按“传输或还原 iPhone”</strong>，在底部。'},
            {screen: c => list(p, '传输或还原 iPhone', [{label: '还原'}, {id: 'erase', label: '抹掉所有内容和设置'}], {back: '通用',
                overlay: c.askErase ? dialog(p, '要抹掉这部 iPhone 吗？', '所有照片、信息和应用都会被删除。', [['cancel', '取消'], ['confirm-erase', '抹掉']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>点按“抹掉所有内容和设置”。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'google', say: '第 1 步：移除您的 Google 账户。<strong>点按“Google”</strong>。<em>（在三星手机上，还要移除您的三星账户。）</em>'},
            {screen: c => list(p, 'Google', [{label: '管理您的 Google 账户'}, {id: 'accounts', label: '此设备上的账户', sub: 'margaret.smith@example.com'}]), target: 'accounts', say: '<strong>点按“此设备上的账户”。</strong>'},
            {screen: c => list(p, 'Google 账户', [{label: 'margaret.smith@example.com'}, {label: '账户同步'}, {id: 'remove', label: '移除账户', danger: true}], {overlay: c.ask ? dialog(p, '要移除账户吗？', '移除它会从这部手机上删除其中的信息、联系人和数据。', [['cancel', '取消'], ['confirm-remove', '移除账户']]) : ''}),
             target: 'remove', action: c => { c.ask = true; }, say: '不这样做的话，恢复出厂设置后手机仍会锁定在您的账户名下。<strong>点按“移除账户”。</strong>'},
            {screen: () => list(p, '账户', [{label: '移除账户', danger: true}], {overlay: dialog(p, '要移除账户吗？', '移除它会从这部手机上删除其中的信息、联系人和数据。', [['cancel', '取消'], ['confirm-remove', '移除账户']])}),
             target: 'confirm-remove', say: '<strong>点按“移除账户”。</strong>'},
            {screen: c => settingsList(p, c), target: 'system', say: '第 2 步：抹掉它。<strong>点按底部的“系统”</strong>。'},
            {screen: () => list(p, '系统', [{label: '语言'}, {label: '软件更新'}, {id: 'reset', label: '重置选项'}]), target: 'reset', say: '<strong>点按“重置选项”。</strong>'},
            {screen: c => list(p, '重置选项', [{label: '重置 Wi-Fi、移动网络和蓝牙'}, {id: 'erase', label: '清除所有数据（恢复出厂设置）'}], {overlay: c.askErase ? dialog(p, '要清除所有数据吗？', '所有照片、信息和应用都会被删除。', [['cancel', '取消'], ['confirm-erase', '清除所有数据']]) : ''}),
             target: 'erase', action: c => { c.askErase = true; }, say: '<strong>点按“清除所有数据（恢复出厂设置）”。</strong>'},
        ]),
        {screen: () => list(p, '还原', [], {noBack: true, overlay: dialog(p, p === 'ios' ? '要抹掉这部 iPhone 吗？' : '要清除所有数据吗？', '所有照片、信息和应用都会被删除。', [['cancel', '取消'], ['confirm-erase', p === 'ios' ? '抹掉' : '清除所有数据']])}),
         target: 'confirm-erase', say: '只有在您的照片已安全转到新手机或已备份之后，才能这样做。<strong>点按 ' + (p === 'ios' ? '抹掉' : '清除所有数据') + '。</strong><em>（练习：不会删除任何东西。）</em>'},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? '你好' : '你好呀'}</h3><p class="cf">已准备好交给下一位主人</p>${homeIndicator(p)}</div>`,
         question: {q: '交出去之前还有最后一件事？', options: [
            {t: '取出 SIM 卡（以及任何存储卡）', ok: true, why: '对。SIM 卡里有您的手机号码。用小工具或回形针把它顶出来。'},
            {t: '没有别的了', why: '取出您的 SIM 卡和任何存储卡。您的号码就在 SIM 卡里。'}]}},
        {screen: () => `<div class="alk ph-${p}">${statusBar(p)}<h3>${p === 'ios' ? '你好' : '你好呀'}</h3><p class="cf">已准备好交给下一位主人</p>${homeIndicator(p)}</div>`, done: true,
         say: '<strong>做得好！</strong>退出登录、抹掉数据、取出 SIM 卡：就按这个顺序。出现“你好”画面就说明它已准备好交给别人。'},
    ], {});

    function assistantOverlay(p, ctx) {
        const name = p === 'ios' ? 'Siri' : 'Google';
        if (!ctx.listening) return '';
        const result = ctx.reminder ? `<div class="qk"><strong>提醒事项</strong><span>打电话给 Sarah</span><small>今天 15:00</small></div>`
            : ctx.weather ? '<div class="qk"><strong>Bridlington</strong><span>⟦cloud-sun⟧ 12°，稍后有阵雨</span><small>最高 14° · 最低 8°</small></div>' : '';
        return `<div class="ajp ${p}"><p class="abw">${result ? '' : `${name} 正在聆听……您想说什么？`}</p>${result}
            <div class="wh">${[['say-remind', '“提醒我 3 点给 Sarah 打电话”'], ['say-weather', '“今天天气怎么样？”'], ['say-joke', '“给我订一份披萨”']].map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>
            <span class="aed" aria-hidden="true"></span></div>`;
    }
    SCENARIOS['voice-assistant'] = (p) => withCtx([
        {screen: c => home(p) + `<button type="button" class="fk right abx" data-hold="side" aria-label="${p === 'ios' ? '侧边按钮（按住）' : '电源键（按住）'}">${UI.power}</button>`,
         target: 'side', action: c => { c.listening = true; },
         say: p === 'ios' ? '<strong>Siri</strong> 会照您大声说的去做事。<strong>按住侧边按钮</strong>（在右侧），直到 Siri 出现。您也可以直接说“Siri”或“嘿 Siri”。'
                          : '您的手机可以照您大声说的去做事。<strong>按住电源键</strong>（在右侧），直到助理出现。您也可以说“Hey Google”。',
         hint: '手指（或鼠标键）一直按在右边缘的按钮上。'},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-remind', action: c => { c.reminder = true; },
         say: '在真正的手机上，您直接说话就行。这里请<strong>点按“提醒我 3 点给 Sarah 打电话”</strong>。', hints: {'say-joke': '先试试提醒事项。', 'say-weather': '先试试提醒事项。'}},
        {screen: c => home(p) + assistantOverlay(p, c), target: 'say-weather', action: c => { c.reminder = false; c.weather = true; },
         say: '好了：3 点钟会弹出一条提醒。现在<strong>问问天气</strong>。', hints: {'say-remind': '设好了。现在问问天气。'}},
        {screen: c => home(p) + assistantOverlay(p, c), question: {q: '下面哪些事可以让手机去做？', options: [
            {t: '全部都行：“给 Sarah 打电话”“设一个 10 分钟的定时器”“打开手电筒”“念一下我的信息”', ok: true, why: '对。当您双手没空、眼睛累了或打字不方便时，这很实用。'},
            {t: '只能查天气', why: '它能做很多事：打电话、定时器、手电筒、读信息、闹钟等等。'}]}},
        {screen: c => home(p) + assistantOverlay(p, c), done: true, say: '<strong>做得好！</strong>说话要清楚自然，就像对人说话一样。如果它听错了，再问一遍就行。'},
    ], {});

    function cameraLens(p, ctx) {
        const menu = ctx.subject === 'menu' ? `<div class="pm">${[['lens-text', '文字'], ['lens-translate', '翻译'], ['lens-search', '搜索']].map(([id, t]) => `<button type="button" data-tap="${id}" class="${ctx.translated && id === 'lens-translate' ? 'on' : ''}">${t}</button>`).join('')}</div>` : '';
        const subject = ctx.subject === 'menu'
            ? `<div class="lj menu"><strong>${ctx.translated ? '菜单' : 'Carte'}</strong><span>${ctx.translated ? '鱼汤' : 'Soupe de poisson'} … 9€</span><span>${ctx.translated ? '蘑菇鸡肉' : 'Poulet aux champignons'} … 14€</span><span>${ctx.translated ? '苹果挞' : 'Tarte aux pommes'} … 6€</span></div>`
            : `<div class="lj${ctx.textOn ? ' afk' : ''}"><strong>Bridlington Surgery</strong><span>您的流感疫苗到期了。</span><span>预约请致电 ${ctx.textOn ? '<button type="button" class="akr" data-tap="num">01262 496 023</button>' : '<b>01262 496 023</b>'}</span></div>`;
        const copy = ctx.copyMenu ? '<div class="sn"><button type="button" data-tap="copy">Copy</button><button type="button" data-tap="call-num">Call</button></div>' : '';
        return `<div class="cg rn ph-${p}">${statusBar(p)}<div class="aef">${subject}${copy}</div>${menu}
            <div class="ro"><span></span><button type="button" class="nx" data-tap="shutter" aria-label="Take photo"></button>
            <button type="button" class="aen" data-tap="lens" aria-label="${p === 'ios' ? '实况文本' : 'Google 智能镜头'}">${p === 'ios' ? '⟦scan-text⟧' : '⟦scan-search⟧'}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['camera-tools'] = (p) => withCtx([
        {screen: () => home(p), target: 'camera', say: '您的相机能读文字。我们从一封信上复制一个电话号码。<strong>打开“相机”。</strong>'},
        {screen: c => cameraLens(p, c), target: 'lens', action: c => { c.textOn = true; },
         say: p === 'ios' ? '把相机对准信件。当它发现文字时，会出现一个小小的<strong>文字按钮 ⟦scan-text⟧</strong>。<strong>点按它。</strong>' : '把相机对准信件，然后<strong>点按智能镜头按钮 ◎</strong>。',
         hints: {shutter: '那样只是拍一张普通照片。请点按 ' + (p === 'ios' ? 'text button ⟦scan-text⟧' : '智能镜头按钮 ⟦scan-search⟧') + '.'}},
        {screen: c => cameraLens(p, c), target: 'num', action: c => { c.copyMenu = true; }, say: '现在这些字变成了真正的文字。<strong>点按电话号码。</strong>'},
        {screen: c => cameraLens(p, c), target: 'copy', action: c => { c.copyMenu = false; c.subject = 'menu'; c.textOn = false; },
         say: '<strong>点按“拷贝”</strong>，之后可以粘贴到信息或通讯录里。<em>（“拨打”会立刻打过去。）</em>', hints: {'call-num': '那样会拨打这个号码。这次练习请点按“拷贝”。'}},
        {screen: c => cameraLens(p, c), target: 'lens-translate', action: c => { c.translated = true; },
         say: '在度假？现在它对准的是一份法语菜单。 ' + (p === 'ios' ? '“翻译”App 或 Google App 里的智能镜头都能做到这一点。 ' : '') + '<strong>点按“翻译”。</strong>', hints: {'lens-text': '那样会拷贝法语原文。请点按“翻译”。', 'lens-search': '点按“翻译”。'}},
        {screen: c => cameraLens(p, c), question: {q: '相机还能用这种方式做什么？', options: [
            {t: '识别植物和鸟类，并把信件扫描成 PDF', ok: true, why: 'Yes. ' + (p === 'ios' ? '在“备忘录”App 里，点按回形针，再点按“扫描文稿”，就能把信件变成 PDF。' : '在 Google 云端硬盘里，点按 +，再点按“扫描”，就能把信件变成 PDF。')},
            {t: '只能拍照', why: '它能做的多得多：识别植物、翻译、拷贝文字，还能把信件扫描成 PDF。'}]}},
        {screen: c => cameraLens(p, c), done: true, say: '<strong>做得好！</strong>您用相机拷贝了一个号码，还翻译了一份菜单。 ' + (p === 'ios' ? '实况文本也适用于您已经拍好的照片。' : 'Google 智能镜头也适用于您已经拍好的照片。')},
    ], {});

    function libApp(p, ctx, page) {
        const color = '#7c3aed';
        if (page === 'home') {
            return app(p, '图书馆电子书', `<p class="cf">已用您的借书证登录</p>
                <div class="sv"><button type="button" data-tap="tab-ebooks">电子书</button><button type="button" data-tap="tab-audio" class="on">有声电子书</button></div>
                <div class="aeo">${[['book-1', 'The Lighthouse at Flamborough', 'A. Whitby', '#0ea5e9'], ['book-2', 'Seaside Summers', 'J. Marsh', '#f59e0b'], ['book-3', 'The Quiet Garden', 'R. Hale', '#16a34a']]
                    .map(([id, t, a, bg]) => `<button type="button" class="su" data-tap="${id}"><span class="lm" style="background:${bg}">${t}</span><strong>${t}</strong><small>${a}</small></button>`).join('')}</div>`, {back: false, color});
        }
        if (page === 'book') {
            return app(p, 'eAudiobook', `<div class="pn"><span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
                <strong>The Lighthouse at Flamborough</strong><small>Read by M. Wolds · 8 hrs 20 mins</small><small>${ctx.borrowed ? '21 天后到期归还' : '5 本中有 3 本可借'}</small>
                ${ctx.borrowed ? '<button type="button" class="ce co" data-tap="listen">Listen</button>' : '<button type="button" class="ce co" data-tap="borrow">Borrow</button>'}</div>`, {color});
        }
        return `<div class="cg ade ph-${p}">${statusBar(p)}<span class="lm tq" style="background:#0ea5e9">The Lighthouse at Flamborough</span>
            <div class="add"><span style="width:${ctx.playing ? 6 : 0}%"></span></div><small>${ctx.playing ? '0:04:12' : '0:00:00'} / 8:20:00</small>
            <div class="oc"><button type="button" data-tap="back30">↺30</button><button type="button" class="agv" data-tap="play">${ctx.playing ? '⟦pause⟧' : '⟦play⟧'}</button><button type="button" data-tap="fwd30">30↻</button></div>
            <div class="xc"><button type="button" data-tap="speed">${ctx.speed || '1.0'}× speed</button><button type="button" data-tap="sleep">⟦moon⟧ Sleep timer${ctx.sleep ? ': 30 min' : ''}</button></div>${homeIndicator(p)}</div>`;
    }
    const libIcon = ['library', '图书馆', '#7c3aed', '<span class="ok">⟦library⟧</span>'];
    SCENARIOS['library-app'] = (p) => withCtx([
        {screen: () => homeWith(p, [libIcon]), target: 'library',
         say: '有了免费的借书证，您就可以在手机上借电子书和有声书。East Riding Libraries 使用 <strong>BorrowBox</strong> App。这是练习版。<strong>打开它。</strong>'},
        {screen: c => libApp(p, c, 'home'), target: 'book-1', say: '您已用借书证登录。<strong>点按 The Lighthouse at Flamborough。</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'borrow', action: c => { c.borrowed = true; }, say: '借阅是免费的。<strong>点按“借阅”。</strong>'},
        {screen: c => libApp(p, c, 'book'), target: 'listen', say: '它归您使用 21 天。<strong>点按“收听”。</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'play', action: c => { c.playing = true; }, say: '<strong>点按播放按钮 ▶。</strong>'},
        {screen: c => libApp(p, c, 'player'), target: 'sleep', action: c => { c.sleep = true; }, say: '躺在床上听？<strong>睡眠定时器</strong>会在一段时间后停止播放，这样您就不会丢失进度。<strong>点按“睡眠定时器”。</strong>'},
        {screen: c => libApp(p, c, 'player'), question: {q: '21 天到期后会怎样？', options: [
            {t: '它会自动归还。没有罚款，没看完的话还可以续借', ok: true, why: '对。电子书和有声书会自动归还。'},
            {t: '要被罚款', why: '没有罚款。它会自动归还，没看完的话可以续借。'}]}},
        {screen: c => libApp(p, c, 'player'), done: true, say: '<strong>做得好！</strong>要真正开始，请到 eastridinglibraries.co.uk 或任何一家图书馆办理，然后下载 BorrowBox，用您的借书证登录。'},
    ], {});

    function parkApp(p, ctx, page) {
        const color = '#0f766e';
        if (page === 'code') {
            return app(p, 'Park', `<div class="rc"><strong>P</strong><span>Harbour Road 停车场</span><span>用 App 付款：位置 <b>4471</b></span></div>
                <p class="cf">输入标牌上的位置编号</p>${field('parkcode', '位置编号', ctx, 'tel')}<button type="button" class="ce co" data-tap="find">查找停车场</button>`, {back: false, color});
        }
        if (page === 'details') {
            const times = [['t1', '1 hour', '£1.50'], ['t2', '2 hours', '£3.00'], ['t4', '4 hours', '£5.50']];
            return app(p, 'Harbour Road', `<p class="cf"><strong>Harbour Road Car Park</strong><br>Location 4471 · practice prices</p>
                <div class="cj ex"><span>Vehicle</span><span class="kz">AB12 CDE</span></div>
                <div class="mf">${times.map(([id, t, pr]) => `<button type="button" data-tap="${id}" class="${ctx.time === id ? 'on' : ''}">${t}<small>${pr}</small></button>`).join('')}</div>
                <p class="fd">Service charge: 20p</p><button type="button" class="ce co" data-tap="pay">${ctx.time ? '支付 £3.20' : '选择时长'}</button>`, {color});
        }
        return app(p, '停车', `<div class="nr"><strong>You're parked ⟦check⟧</strong><span>Harbour Road · AB12 CDE</span><b>1:59:42</b><small>left · ends at 11:41</small>
            <button type="button" class="ce" data-tap="extend">Extend</button></div>`, {back: false, color});
    }
    const parkIcon = ['park', 'Park', '#0f766e', '<span class="ok">P</span>'];
    SCENARIOS['parking'] = (p) => withCtx([
        {screen: () => homeWith(p, [parkIcon]), target: 'park', say: '很多停车场可以用 App 付款，这样就不需要硬币。每个市政委员会用的 App 不同（标牌上会写明是哪个）。这是练习版。<strong>打开 Park。</strong>'},
        {screen: c => parkApp(p, c, 'code'), target: 'find', require: c => typed(c, 'parkcode').replace(/\D/g, '') === '4471', requireHint: '输入标牌上的位置编号：4471。',
         say: '每个停车场的标牌上都有一个<strong>位置编号</strong>。在框里<strong>输入 4471</strong>，然后<strong>点按“查找停车场”</strong>。'},
        {screen: c => parkApp(p, c, 'details'), target: 't2', action: c => { c.time = 't2'; }, say: '您的车牌号已经保存好了。<strong>选择 2 小时。</strong>'},
        {screen: c => parkApp(p, c, 'details'), target: 'pay', say: '使用这个 App 要收一小笔服务费。<strong>点按“支付 £3.20”。</strong><em>（练习：不会扣钱。）</em>'},
        {screen: c => parkApp(p, c, 'live'), question: {q: '您在商店里逛得晚了。可以怎么办？', options: [
            {t: '在 App 里点按“延长”增加时间，不用回到车上', ok: true, why: '对。这正是用 App 付款的最大好处。大多数还会在时间到期前提醒您。'},
            {t: '没办法，会被开罚单', why: '大多数停车 App 都能让您点按“延长”，在任何地方增加时间。'}]}},
        {screen: c => parkApp(p, c, 'live'), done: true, say: '<strong>做得好！</strong>大多数停车机仍然接受银行卡或硬币，很多 App 也允许您拨打电话或发短信付款。绝不要通过停车机上贴的二维码贴纸付款：它们可能是假的。'},
    ], {input: {}});

    function smsTo(p, ctx) {
        const reply = ctx.sentInfo ? `<div class="dm me xh"><span>INFO</span><small>10:02</small></div>
            <div class="dm them"><span>您已于 2026 年 3 月 3 日合约到期。您可以免费更换套餐。您的月费是 £24.00。要更换套餐并保留号码，请发短信 PAC 到 65075。</span><small>10:02</small></div>` : '';
        return `<div class="cg kt ph-${p}">${statusBar(p)}<div class="kv"><span class="ij">${p === 'ios' ? '‹' : '←'}</span><strong>85075</strong></div>
            <div class="gf">${reply}</div>
            <div class="hn">${field('smsbody', '短信', ctx)}<button type="button" class="ic" data-tap="send" aria-label="Send">${UI.send}</button></div>${homeIndicator(p)}</div>`;
    }
    SCENARIOS['phone-plan'] = (p) => withCtx([
        {screen: () => home(p), target: 'messages', say: '您还在合约期内，还是付多了钱？一条免费短信就能告诉您。<strong>打开“信息”。</strong>'},
        {screen: c => smsTo(p, c), target: 'send', require: c => typed(c, 'smsbody').toUpperCase() === 'INFO', requireHint: '在消息框里输入 INFO，然后点按发送。',
         action: c => { c.sentInfo = true; c.input.smsbody = ''; }, say: '我们已经新建了一条发给 <strong>85075</strong> 的消息。<strong>输入 INFO</strong>，然后<strong>点按发送</strong>。在英国所有运营商网络上都是免费的。'},
        {screen: c => smsTo(p, c), question: {q: '回复说您已经合约到期，却仍在每月付 £24。这是什么意思？', options: [
            {t: '您的手机已经还清了。只含 SIM 卡的套餐可能便宜得多，而且可以保留号码', ok: true, why: '对。发短信 PAC 到 65075 获取一个代码，就能更换套餐并保留号码。其余的由新的服务商办理。'},
            {t: '没什么，继续付', why: '您可能一直在为一部已经还清的手机付钱。只含 SIM 卡的套餐可能为您省下很多。'}]}},
        {screen: () => home(p), target: 'settings', say: '还有一招省钱，出国旅行时用：关闭数据漫游，免得意外被收费。<strong>点按“设置”。</strong>'},
        ...(p === 'ios' ? [
            {screen: c => settingsList(p, c), target: 'mobile', say: '<strong>点按“蜂窝网络”。</strong>'},
            {screen: () => list(p, '蜂窝网络', [{label: '蜂窝数据', toggle: true}, {id: 'options', label: '蜂窝数据选项', value: '漫游已开启'}, {label: '个人热点'}], {back: '设置'}), target: 'options', say: '<strong>点按“蜂窝数据选项”。</strong>'},
            {screen: c => list(p, '蜂窝数据选项', [{id: 'roam', label: '数据漫游', toggle: !c.roamOff}, {label: '语音与数据', value: '5G 自动'}], {back: '蜂窝网络'}),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>关闭“数据漫游”。</strong>'},
        ] : [
            {screen: c => settingsList(p, c), target: 'network', say: '<strong>点按“网络和互联网”。</strong>'},
            {screen: () => list(p, '网络和互联网', [{label: '互联网', sub: '家里的 Wi-Fi'}, {id: 'sims', label: 'SIM 卡', sub: '您的运营商'}, {label: '飞行模式', toggle: false}]), target: 'sims', say: '<strong>点按“SIM 卡”。</strong>'},
            {screen: c => list(p, 'SIM 卡', [{label: '移动数据', toggle: true}, {id: 'roam', label: '漫游', toggle: !c.roamOff, sub: '漫游时连接数据服务'}]),
             target: 'roam', action: c => { c.roamOff = true; }, say: '<strong>关闭“漫游”。</strong>'},
        ]),
        {screen: () => home(p), done: true, say: '<strong>做得好！</strong>在国外您仍然可以用 Wi-Fi 使用 WhatsApp、视频通话和地图。如果需要用手机流量，并且清楚运营商的收费，可以重新开启漫游。'},
    ], {input: {}});

    SCENARIOS['location-sharing'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => homeWith(p, [['findmy', '查找', '#22c55e', ICON2.find]]), target: 'findmy', say: '分享您的位置，家人就能看到您平安到家。这由您自己决定，而且随时可以停止。<strong>打开“查找”。</strong>'},
        {screen: c => app(p, '联系人', `<p class="cf">还没有人在共享。</p><button type="button" class="ce co" data-tap="share">共享我的位置</button>`, {back: false, color: '#fff'}),
         target: 'share', say: '<strong>点按“共享我的位置”。</strong>'},
        {screen: c => app(p, '共享给', '', {color: '#fff', overlay: sheet('选择联系人', [['pick-sarah', 'Sarah', '女儿'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>点按 Sarah。</strong>', hints: {'pick-dave': '这次练习请选 Sarah。'}},
        {screen: c => app(p, '共享给 Sarah', '', {color: '#fff', overlay: sheet('共享多久？', [['one-hour', '共享一小时'], ['day', '共享到今天结束'], ['always', '无限期共享']])}),
         target: 'always', say: '选择共享多久。对您信任的家人，<strong>点按“无限期共享”</strong>。您可以随时停止。', hints: {'one-hour': '这对一次出行很方便。这次练习请选“无限期共享”。', day: '这次练习请选“无限期共享”。'}},
    ] : [
        {screen: () => home(p), target: 'maps', say: '分享您的位置，家人就能看到您平安到家。这由您自己决定，而且随时可以停止。<strong>打开“地图”。</strong>'},
        {screen: c => busMaps(p, c, 'map').replace('<div class="rb">', '<div class="rb"><button type="button" class="gx abk" style="position:absolute;right:14px;top:12px;z-index:3" data-tap="profile">M</button>'),
         target: 'profile', say: '<strong>点按右上角您的头像。</strong>'},
        {screen: () => app(p, '地图', '', {color: '#fff', overlay: sheet('', [['sharing', '位置信息共享'], ['timeline', '您的时间轴'], ['settings', '设置']])}), target: 'sharing', say: '<strong>点按“位置信息共享”。</strong>'},
        {screen: () => app(p, '位置信息共享', '<button type="button" class="ce dk" data-tap="share">New share</button>', {color: '#fff'}), target: 'share', say: '<strong>点按“新建共享”。</strong>'},
        {screen: () => app(p, '共享给', '', {color: '#fff', overlay: sheet('选择联系人', [['pick-sarah', 'Sarah', '女儿'], ['pick-dave', 'Dave', '']])}), target: 'pick-sarah', say: '<strong>点按 Sarah。</strong>', hints: {'pick-dave': '这次练习请选 Sarah。'}},
        {screen: () => app(p, '共享给 Sarah', '', {color: '#fff', overlay: sheet('共享多久？', [['one-hour', '1 小时'], ['always', '直到您将其关闭']])}),
         target: 'always', say: '对您信任的家人，<strong>点按“直到您将其关闭”</strong>。', hints: {'one-hour': '适合一次出行。这次练习请选“直到您将其关闭”。'}},
    ]).concat([
        {screen: () => app(p, '正在与 Sarah 共享', `<div class="vl"><span class="pt"></span></div><p class="cf">Sarah 能看到您在哪里。${p === 'ios' ? '点按“停止共享”' : '点按“停止”'}随时可以停止共享。</p>`, {color: '#fff'}),
         question: {q: '一个您刚在网上认识的人让您共享位置。您该共享吗？', options: [
            {t: '不该。只与您信任的近亲或朋友共享', ok: true, why: '没错。您的位置会暴露您住在哪里、什么时候外出。只和您信任的人共享。'},
            {t: '该，他们看起来挺好的', why: '只与近亲和朋友共享您的位置。它会暴露您住在哪里、什么时候外出。'}]}},
        {screen: () => app(p, '正在与 Sarah 共享', '<p class="cf">Sarah 能看到您在哪里。</p>', {color: '#fff'}), done: true,
         say: '<strong>做得好！</strong>Sarah 能看到您很安全。请时不时检查您在与谁共享，并对不需要的人停止共享。'},
    ]), {});

    SCENARIOS['parental-controls'] = (p) => withCtx((p === 'ios' ? [
        {screen: () => home(p), target: 'settings', say: '您的孙子 Leo 要拥有他的第一部 iPhone 了。<strong>屏幕使用时间</strong>可以设定健康的限制。这是 <strong>Leo 的</strong>手机。<strong>点按“设置”。</strong>'},
        {screen: c => list(p, '设置', [{label: 'Leo', sub: 'Apple 账户'}, {label: '通知'}, {id: 'screen-time', label: '屏幕使用时间'}, {label: '通用'}], {noBack: true}), target: 'screen-time', say: '<strong>点按“屏幕使用时间”。</strong>'},
        {screen: c => list(p, '屏幕使用时间', [{id: 'downtime', label: '停用时间', sub: c.downtime ? '20:00 – 07:00' : '关闭'}, {label: 'App 限额'}, {id: 'content', label: '内容和隐私访问限制', sub: c.content ? '开启' : '关闭'}, {label: '使用“屏幕使用时间”密码'}], {back: '设置'}),
         target: 'downtime', action: c => { c.downtime = true; }, say: '<strong>停用时间</strong>会在夜间锁定大多数 App（电话仍可使用）。<strong>点按“停用时间”</strong>来开启，晚上 8 点至早上 7 点。'},
        {screen: c => list(p, '屏幕使用时间', [{label: '停用时间', sub: '20:00 – 07:00'}, {label: 'App 限额'}, {id: 'content', label: '内容和隐私访问限制', sub: c.content ? '开启' : '关闭'}], {back: '设置'}),
         target: 'content', action: c => { c.content = true; }, say: '接下来，防止意外购买和成人内容。<strong>点按“内容和隐私访问限制”。</strong>'},
        {screen: c => list(p, '内容与隐私', [{label: '内容和隐私访问限制', toggle: true}, {id: 'purchases', label: 'App Store 购买项目', value: c.noBuy ? '不允许' : '允许'}, {label: '网页内容', value: '限制成人网站'}], {back: '屏幕使用时间'}),
         target: 'purchases', action: c => { c.noBuy = true; }, say: '成人网站现在已被限制。<strong>点按“App Store 购买项目”</strong>来阻止 App 内消费。'},
    ] : [
        {screen: () => homeWith(p, [['familylink', 'Family Link', '#16a34a', ICON.person]]), target: 'familylink', say: '您的孙子 Leo 要拥有他的第一部 Android 手机了。Google 免费的 <strong>Family Link</strong> App 可以从<strong>您的</strong>手机上设定健康的限制。<strong>打开 Family Link。</strong>'},
        {screen: () => app(p, 'Family Link', `<button type="button" class="ck" data-tap="leo"><strong>Leo</strong><small>Leo\'s phone · 1 hr 20 min today</small></button>`, {back: false, color: '#fff'}), target: 'leo', say: '<strong>点按 Leo。</strong>'},
        {screen: c => list(p, 'Leo', [{caption: '控制'}, {id: 'screen-time', label: '屏幕使用时间', sub: c.downtime ? '就寝时间 20:00 – 07:00' : '没有限制'}, {id: 'content', label: '内容限制', sub: c.noBuy ? '购买需要您的批准' : 'Google Play：全部允许'}, {label: '位置信息', sub: '开启'}]),
         target: 'screen-time', action: c => { c.downtime = true; }, say: '<strong>点按“屏幕使用时间”</strong>设置就寝时间，晚上 8 点至早上 7 点，手机会在这段时间锁定（电话仍可使用）。'},
        {screen: c => list(p, 'Leo', [{caption: '控制'}, {label: '屏幕使用时间', sub: '就寝时间 20:00 – 07:00'}, {id: 'content', label: '内容限制', sub: c.noBuy ? '购买需要您的批准' : 'Google Play：全部允许'}]),
         target: 'content', action: c => { c.noBuy = true; }, say: '接下来，防止意外消费。<strong>点按“内容限制”</strong>，让购买需要您的批准。'},
    ]).concat([
        {screen: () => list(p, p === 'ios' ? '屏幕使用时间' : 'Leo', [{label: p === 'ios' ? '停用时间' : '屏幕使用时间', sub: '20:00 – 07:00'}, {label: '购买', sub: p === 'ios' ? '不允许' : '需要您的批准'}]),
         question: {q: '除了这些设置，最重要的是什么？', options: [
            {t: '和他们聊天：网上有什么让他们不舒服的事，他们总能告诉您', ok: true, why: '对。没有哪项设置能拦住一切。成为他们可以倾诉的人才最重要。'},
            {t: '这些设置什么都能管', why: '它们帮助很大，但没有什么能拦住一切。要让他们知道，随时可以找您聊。'}]}},
        {screen: () => list(p, p === 'ios' ? '屏幕使用时间' : 'Leo', [{label: '停用时间', sub: '20:00 – 07:00'}]), done: true,
         say: '<strong>做得好！</strong>Leo 有了就寝时间，不问过您就不能花钱了。 ' + (p === 'ios' ? '设置一个“屏幕使用时间”密码，这样只有您能更改这些设置。' : 'Family Link 让您随时可以从自己的手机上更改这些设置。')},
    ]), {});

    // ======================================================================================
    // Practice computer: Windows, Mac and Linux (Linux Mint). Same engine, a laptop screen instead of a phone.
    // ======================================================================================
    const pcLesson = (name, fn, oses) => { fn.device = 'computer'; if (oses) fn.oses = oses; SCENARIOS[name] = fn; };
    const N = {
        files: {windows: '文件资源管理器', mac: '访达', linux: '文件'},
        settings: {windows: '设置', mac: '系统设置', linux: '系统设置'},
        store: {windows: 'Microsoft Store', mac: 'App Store', linux: '软件管理器'},
        browser: {windows: 'Edge', mac: 'Safari', linux: 'Firefox'},
        start: {windows: '开始', mac: 'App', linux: '菜单'},
        editor: {windows: '记事本', mac: '文本编辑', linux: '文本编辑器'},
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
    const appLabel = (os, kind) => ({files: N.files[os], browser: N.browser[os], store: N.store[os], settings: N.settings[os], mail: '邮件', text: N.editor[os],
        writer: 'LibreOffice Writer', update: '更新管理器', terminal: '终端', trash: '废纸篓', apps: 'App', chrome: 'Chrome', shield: 'Windows 安全中心', fw: '防火墙'}[kind]);

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
        windows: {title: '回收站', empty: '清空回收站', confirm: n => `您确定要永久删除这 ${n} 项吗？`, items: [
            ['⟦paperclip⟧', 'Office 助手（回形针）.exe', '您每写一封信它都要来帮忙。2007 年退休。', ''],
            ['⟦bomb⟧', '扫雷最高分.txt', '初级：999 秒。我们不提这事。', ''],
            ['⟦spade⟧', '纸牌接龙获胜牌.gif', '赢一局，纸牌就会在屏幕上弹跳着落下。双击我！', 'cards'],
            ['⟦phone⟧', '拨号调制解调器.wav', '刺啦……嘟……咝咝咝。而且您上网时没人能用电话。', ''],
            ['⟦mountain-snow⟧', '绿色山坡壁纸.jpg', '那座起伏的绿色山坡和蓝天，2001 年起出现在数百万块屏幕上。', ''],
            ['⟦save⟧', '软盘 (A:)', '1.44 MB。“保存”按钮至今还是它的样子。', ''],
            ['⟦gamepad-2⟧', 'Space Cadet 弹球.exe', '3D 弹球，Windows 免费自带，直到 Vista 把它拿走。', ''],
            ['⟦bell-ring⟧', 'MSN Messenger 抖动', '有人给您发了一个抖动，整个屏幕都晃了起来。双击我！', 'shake'],
            ['⟦file-text⟧', '给市政委员会的信 最终版 (2) (最终).doc', '我们每个人都有这么一份。', ''],
        ]},
        mac: {title: '废纸篓', empty: '清倒废纸篓', confirm: () => '您确定要永久清除废纸篓中的项目吗？此操作无法撤销。', items: [
            ['⟦rainbow⟧', '旋转的沙滩球', '那个意思是“请稍候”……然后继续等的彩虹转轮。双击我！', 'ball'],
            ['⟦monitor⟧', 'iMac G3，邦迪蓝（1998 年）', '半透明、蛋形、蓝色。每所学校都有一台。', ''],
            ['⟦music⟧', '带点按式转盘的 iPod', '口袋里装着 1000 首歌。用拇指转啊转。', ''],
            ['⟦smile⟧', '开心 Mac', '每次开机都会向您问好的微笑小电脑。', ''],
            ['⟦bell⟧', '开机提示音', '开机时那声浑厚的和弦。很多人至今怀念。', ''],
            ['⟦droplet⟧', 'Aqua 按钮', '又亮又蓝，看起来好像可以舔一口。', ''],
            ['⟦calendar-days⟧', '仪表板小组件', '计算器、天气和便利贴，独占一个图层。2019 年起已消失。', ''],
            ['⟦disc-3⟧', 'iTunes (2001–2019)', '我们都在这里刻录光盘、同步 iPod。', ''],
        ]},
        linux: {title: '废纸篓', empty: '清倒废纸篓', confirm: () => '要清倒废纸篓中的所有项目吗？废纸篓里的所有项目都将被永久删除。', items: [
            ['⟦bird⟧', '企鹅 Tux（毛绒玩具）', '1996 年起的 Linux 吉祥物。特别适合抱着。', ''],
            ['⟦eye⟧', 'xeyes', '一双跟着鼠标指针转的眼睛。双击我！', 'eyes'],
            ['⟦app-window⟧', '摇晃的窗口', '旧式桌面特效，拖动窗口时它会像果冻一样晃来晃去。双击我！', 'wobble'],
            ['⟦save⟧', '安装软盘 1–50', '早期的 Linux 安装起来可能要用掉一整盒软盘。', ''],
            ['⟦disc⟧', '邮寄来的免费 Ubuntu 光盘', '您可以免费订购一张 Linux 光盘，它会通过邮局寄来。', ''],
            ['⟦calendar⟧', 'year-of-the-linux-desktop.txt', '自 1999 年前后起每年都有人预言。也许今年就是？', ''],
            ['⟦leaf⟧', 'Mint 的名字.txt', '每个 Linux Mint 版本都用一个女性的名字，比如 Zena、Xia 和 Vanessa。', ''],
            ['⟦sandwich⟧', 'sudo make me a sandwich', '一个老笑话：说一声“sudo”，电脑就会照办。', ''],
        ]},
    };

    function pcEggWin(os, state) {
        const egg = EGG[os];
        const left = state.items.filter(it => !state.gone.includes(it[1]));
        const list = left.length
            ? `<div class="xv">${left.map(([ic, name], n) => `<button type="button" class="ih${state.sel === name ? ' qg' : ''}" data-egg-act="item" data-n="${egg.items.findIndex(it => it[1] === name)}"><span>${ic}</span>${esc(name)}</button>`).join('')}</div>`
            : `<p class="aca">${os === 'windows' ? '这个文件夹是空的。' : 'The ' + egg.title + ' 是空的。'}</p>`;
        const pick = state.sel && egg.items.find(it => it[1] === state.sel);
        const info = pick ? `<p class="ph"><strong>${esc(pick[1])}</strong><br>${esc(pick[2])}</p>` : `<p class="ph">${left.length ? '双击某样东西看看。' : ''}</p>`;
        const dlg = state.ask ? `<div class="hr"><p><strong>${egg.empty}</strong></p><p class="fd">${egg.confirm(left.length)}</p>
            <div class="jn"><button type="button" data-egg-act="no">${os === 'windows' ? '无' : '取消'}</button><button type="button" class="adg" data-egg-act="yes">${os === 'windows' ? '是' : '空'}</button></div></div>` : '';
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
        ['起伏的山丘', 'radial-gradient(ellipse 95% 55% at 35% 100%, #5fb43d 60%, transparent 61%), radial-gradient(ellipse 80% 45% at 90% 100%, #4ea232 60%, transparent 61%), linear-gradient(#2f7fe0, #9fd0ff 70%)'],
        ['青绿 95', '#008080'],
        ['细条纹', 'repeating-linear-gradient(#f6f6f6 0 2px, #e4e4e4 2px 4px)'],
        ['夜空', 'radial-gradient(1.5px 1.5px at 12% 20%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 60%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 30%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 75%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 25% 85%, #fff 50%, transparent 51%), radial-gradient(circle at 80% 15%, #fef3c7 3%, transparent 3.5%), linear-gradient(#0b1026, #1e1b4b)'],
        ['海滨', 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)'],
    ];

    // Joke Wi-Fi names people really give their networks (plus a local one).
    const HOTSPOTS = [
        ['Pretty Fly for a Wi-Fi', '所有 Wi-Fi 谐音梗里最有名的一个。'],
        ['The LAN Before Time', 'LAN 是“局域网”。这个非常非常古老。'],
        ['Abraham Linksys', '八十七年的兆比特之前……'],
        ['Bill Wi the Science Fi', '科学万岁！'],
        ['Drop It Like It\'s Hotspot', '某人的手机热点，很有幽默感。'],
        ['Silence of the LANs', '一个非常非常安静的网络。'],
        ['Tell My Wi-Fi Love Her', '哎呀。'],
        ['Get Off My LAN', '大概是个脾气不好的邻居。'],
        ['Bridlington Seagulls', '它们已经抢走了您的薯条。别再把密码也给它们了。'],
        ['FREE WIFI (honest)', '一个叫“免费 Wi-Fi”、您又不认识的网络，恰恰就是不该加入的那种！'],
    ];

    const FORTUNES = ['今天是备份照片的好日子。', '强密码就是快乐的密码。', '您会接到一个电话。那是诈骗。挂断。',
        '您试过关机再开机吗？', '更新的最佳时机是昨天。其次是现在。', '一杯茶能解决大多数问题。不过电脑除外。',
        '绝不要把密码告诉陌生人。海鸥也不行。', '您会找到遥控器。它掉在沙发缝里。'];

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
        const nets = st.wifiOn ? `<p class="afv">⟦check⟧ Home-WiFi-5G <small>Connected</small></p>${details ? `<div class="ahn">IP 地址：192.168.1.42<br>路由器：192.168.1.1<br>信号：−54 dBm（很好）<br>信道：36（5 GHz）<br>速度：866 Mbps<br>安全性：WPA3 个人版</div>` : ''}
            <p class="aje">Other networks</p>${HOTSPOTS.map(([n], k) => `<button type="button" class="zs" data-fun="hotspot" data-n="${k}">⟦wifi⟧ ${esc(n)} <small>${k % 3 ? '⟦lock⟧' : ''}</small></button>`).join('')}<p class="sc"></p>`
            : '<p class="ain">Wi-Fi 已关闭。请打开它以查看网络。</p>';
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
        page.innerHTML = `<div class="wl"><p class="aei"><strong>无网络连接</strong><br>请检查您的 Wi-Fi。按<kbd>空格键</kbd>或点按来玩游戏。</p>
            <div class="dino" tabindex="0" aria-label="Dinosaur game: press space or tap to jump"><span class="xt">🦖</span><span class="ty">0</span><span class="wk" hidden>游戏结束 · 按空格键再玩一次</span></div></div>`;
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
    const MOO = `                 (__) (oo) /------\\/ / | || * /\\---/\\ ~~ ~~ ..."今天你哞了吗？"...`;
    function terminalRun(screen, w, cmd) {
        const out = w.querySelector('.zc');
        const say = t => { out.textContent += t + '\n'; };
        say('margaret@mint:~$ ' + cmd);
        const c = cmd.trim().replace(/\s+/g, ' ');
        const lc = c.toLowerCase();
        if (!c) {} else if (lc === 'help') say('试试：apt moo、fortune、cowsay hello、sl、neofetch、date、whoami、ls、clear、exit');
        else if (lc === 'apt moo') say(MOO);
        else if (lc === 'fortune') say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        else if (lc.startsWith('cowsay')) say(COW(c.slice(6).trim() || '哞！'));
        else if (lc === 'sl') {
            const train = document.createElement('pre'); train.className = 'vc';
            train.textContent = '      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/';
            w.querySelector('.ht').appendChild(train); setTimeout(() => train.remove(), calm() ? 10 : 4200);
            say('（您是想输入“ls”却打成了“sl”吗？送您一列蒸汽火车。）');
        } else if (lc === 'neofetch') say(`   _____________ margaret@mint |_ \\ ------------- | | _____ | 操作系统：Linux Mint 22.3（练习版） | | | | | | 桌面：Cinnamon | | | | | | Shell：bash | \\_____/ | 运行时间：从早餐起 \\___________/ 内存：从不忘记生日`);
        else if (lc === 'date') say(today().toString().slice(0, 24));
        else if (lc === 'whoami') say('margaret');
        else if (lc === 'pwd') say('/home/margaret');
        else if (lc === 'ls') say('Desktop Documents Downloads Music Pictures Videos');
        else if (lc === 'sudo make me a sandwich') say('好吧。🥪');
        else if (lc === 'make me a sandwich') say('什么？自己做去。');
        else if (/rm\s+-rf/.test(lc)) say('想得美！这个练习终端不会让您弄坏任何东西。');
        else if (lc === 'penguin' || lc === 'tux') { say('🐧'); funTux(screen); }
        else if (lc === 'clear') { out.textContent = ''; }
        else if (lc === 'exit') { w.remove(); return; }
        else say(`bash: ${c.split(' ')[0]}: 未找到命令（试试“help”）`);
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
        else if (note) note.textContent = '这个练习浏览器不会搜索真正的互联网。您输入的任何内容都不会被发送到任何地方。';
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
        if (mo === 4 && day === 1 && !st.aprilDone && !calm()) { st.aprilDone = true; desk.classList.add('sp'); funToast(screen, '愚人节快乐！🙃'); }
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
        splash.innerHTML = os === 'windows' ? '<div class="abe"><span class="qy"><i></i><i></i><i></i><i></i></span><b>Practice<sup>®</sup></b><strong>95</strong></div><p>作弊码已激活！+30 条命 🎮</p>'
            : os === 'mac' ? '<div class="abd"><span>🙂</span><p>欢迎使用 Macintosh。</p></div><p>作弊码已激活！+30 条命 🎮</p>'
            : '<pre class="ahx">[ OK ] Started Konami Code Service. [ OK ] Reached target Extra Lives. [ OK ] Mounted /home/margaret/30-lives. [ OK ] Started Nostalgia Daemon.</pre><p>作弊码已激活！+30 条命 🎮</p>';
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
                    funToast(screen, others.length ? 'Aero 晃动！其他窗口都收起来了。' : 'Aero 晃动！（没有其他窗口可收。）');
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
                funToast(screen, 'Wi-Fi 已开启。已连接到 Home-WiFi-5G。');
            } else { pcDecorate(screen, os); funToast(screen, 'Wi-Fi 已关闭。'); }
            return;
        }
        if (what === 'hotspot') {
            const [name, joke] = HOTSPOTS[+el.dataset.n];
            el.closest('.fun-wifi').querySelector('.sc').innerHTML = `<strong>${esc(name)}</strong><br>${esc(joke)} <em>（只加入您认识的网络。）</em>`;
            return;
        }
        if (what === 'clock') {
            const old = desk.querySelector('.mk');
            if (old) { old.remove(); return; }
            desk.insertAdjacentHTML('beforeend', calendarPopup(os));
            const d = today();
            if (d.getMonth() === 3 && d.getDate() === 1 && !calm()) { desk.classList.remove('sp'); void desk.offsetWidth; desk.classList.add('sp'); funToast(screen, '愚人节快乐！🙃'); }
            return;
        }
        if (what === 'desk-menu') {
            const old = desk.querySelector('.ll');
            if (old) old.remove();
            const r = area.getBoundingClientRect();
            const items = os === 'windows' ? [['', '查看'], ['', '排序方式'], ['refresh', '刷新'], ['', '新建'], ['wall', '个性化']]
                : os === 'mac' ? [['', '新建文件夹'], ['', '显示简介'], ['wall', '更改壁纸…'], ['', '使用叠放']]
                : [['', '新建文件夹'], ['terminal', '在终端中打开'], ['wall', '更改桌面背景']];
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
            if (what === 'desk-wall') { st.wall = (st.wall + 1) % WALLS.length; desk.style.background = WALLS[st.wall][1]; funToast(screen, `壁纸：${WALLS[st.wall][0]}`); }
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
            openFunWin(screen, funWin(os, 'about', '', `<div class="jt"><span>⟦laptop⟧</span><strong>MacBook Practice</strong><small>macOS 27（练习版）</small>
                <dl><dt>芯片</dt><dd>Bridlington Silicon B1</dd><dt>内存</dt><dd>从不忘记生日</dd><dt>启动磁盘</dt><dd>Practice HD</dd><dt>序列号</dt><dd>P4R7-ACT1CE</dd></dl></div>`, 'bz'));
            return;
        }
        if (what === 'notepad') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const name = os === 'windows' ? '记事本' : os === 'mac' ? '文本编辑' : '文本编辑器';
            // Windows Notepad: if the first line is .LOG, the date and time are added each time it's opened.
            if (os === 'windows' && /^\.LOG/.test(st.notepad)) st.notepad += `\r\n${NOW.time()} ${NOW.date()}\r\n`;
            const w = openFunWin(screen, funWin(os, 'notepad', `无标题 – ${name}`, `<textarea class="agf" spellcheck="false" aria-label="Notes">${esc(st.notepad)}</textarea>
                <div class="acv">${os === 'windows' ? '第 1 行，第 1 列 &nbsp;|&nbsp; 100% &nbsp;|&nbsp; Windows (CRLF) &nbsp;|&nbsp; UTF-8' : '纯文本'}</div>`));
            const ta = w.querySelector('textarea');
            ta.addEventListener('input', () => { st.notepad = ta.value; });
            ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
            return;
        }
        if (what === 'terminal') {
            const sm = desk.querySelector('.mh'); if (sm) sm.remove();
            const w = openFunWin(screen, funWin(os, 'terminal', 'margaret@mint: ~', `<pre class="zc">欢迎！这是一个练习终端。输入“help”看看可以试些什么。</pre>
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
            <div class="pa">${[['weather', '⟦cloud-sun⟧', '天气'], ['news', '⟦newspaper⟧', '新闻'], ['bus', '⟦bus⟧', '公交时间'], ['recipes', '⟦cake-slice⟧', '食谱']].map(([id, ic, t]) => `<button type="button" data-fun="site" data-site="${id}"><span>${ic}</span>${t}</button>`).join('')}</div>`,
        weather: () => `<div class="site"><h3>⟦cloud-sun⟧ Bridlington 天气</h3><p class="fd">练习用预报</p><div class="ajf">${[['今天', '⟦cloud-sun⟧', '13°'], ['周五', '⟦cloud-rain⟧', '11°'], ['周六', '⟦wind⟧', '10°'], ['周日', '⟦sun⟧', '14°']].map(([d, ic, t]) => `<div><b>${d}</b><span>${ic}</span>${t}</div>`).join('')}</div><p>海鸥活跃度：<strong>很高</strong>。请看好您的薯条。</p></div>`,
        news: () => `<div class="site"><h3>⟦newspaper⟧ 练习新闻</h3><ul class="news">
            <li><strong>本地男子终于找到电视遥控器</strong>，它在沙发缝里躺了三个星期。</li>
            <li><strong>有人看到海鸥叼着一根 99 Flake 冰淇淋</strong>。冰淇淋的主人“很不高兴”。</li>
            <li><strong>奶奶视频通话打败孙子</strong>：“我只是按了绿色按钮。”</li>
            <li><strong>研究发现</strong>十个电脑问题里有九个，关机再开机就能解决。</li></ul></div>`,
        bus: () => `<div class="site"><h3>⟦bus⟧ 公交时间</h3>${busTable}</div>`,
        recipes: () => `<div class="site"><h3>⟦cake-slice⟧ 维多利亚海绵蛋糕</h3><p>把黄油、糖和自发面粉各 200 克与 4 个鸡蛋混合。分装在两个烤盘里，180°C 烘烤 20 至 25 分钟。中间夹上果酱和奶油。</p><p class="fd">小窍门：在手机上设一个定时器，或者对它说：“设一个 25 分钟的定时器”。</p></div>`,
    };
    function funBrowser(screen, os, site = 'home') {
        const st = funState(screen);
        const url = {home: '', weather: 'weather.example', news: 'practice-news.example', bus: 'bus-times.example', recipes: 'recipes.example'}[site];
        const w = openFunWin(screen, funWin(os, 'browser', N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">${site === 'home' ? '新标签页' : esc(url)} </span></div>
            <div class="qn"><button type="button" data-fun="site" data-site="home" aria-label="Home">⟦house⟧</button> ${url ? '⟦lock⟧ ' + url : '搜索或输入网址'}</div>
            <div class="ju ${site === 'home' ? '' : 'top'}">${SITES[site](os)}</div></div>`, 'ca'));
        if (!st.wifiOn) dinoGame(w.querySelector('.ju'));
        pcDecorate(screen, os);
    }

    // ---------- Files ----------
    const PICS = {
        'Seaside.jpg': 'linear-gradient(#7dd3fc 0 45%, #0ea5e9 45% 62%, #fde68a 62%)',
        'Sunset.jpg': 'radial-gradient(circle at 50% 70%, #fde047 10%, transparent 11%), linear-gradient(#7c3aed, #f97316 60%, #1e3a8a 60%)',
        'Garden.jpg': 'radial-gradient(circle at 30% 60%, #f43f5e 6%, transparent 7%), radial-gradient(circle at 60% 55%, #facc15 6%, transparent 7%), radial-gradient(circle at 80% 65%, #a855f7 6%, transparent 7%), linear-gradient(#bae6fd 0 45%, #4ade80 45%)',
        '海滩上的狗.jpg': 'linear-gradient(#93c5fd 0 50%, #fde68a 50%)',
    };
    const FOLDERS = {
        Documents: [['⟦file-text⟧', '购物清单.txt'], ['⟦file-text⟧', '给市政委员会的信.docx'], ['⟦folder⟧', '食谱'], ['⟦file-spreadsheet⟧', '圣诞贺卡名单.xlsx']],
        Pictures: Object.keys(PICS).map(n => ['⟦image⟧', n]),
        Downloads: [['⟦file-text⟧', '市政税账单.pdf'], ['⟦file-text⟧', '公交时刻表.pdf'], ['⟦puzzle⟧', 'setup_free_cleaner.exe']],
        Music: [['⟦music⟧', '海滨铜管乐队.mp3'], ['⟦music⟧', '六十年代金曲.mp3']],
    };
    function funFiles(screen, os, folder = '图片', note = '') {
        const items = FOLDERS[folder].map(([ic, n]) => `<button type="button" class="mn" data-fun="file" data-folder="${folder}" data-name="${esc(n)}"><span>${ic}</span>${esc(n)}</button>`).join('');
        openFunWin(screen, funWin(os, 'files', `${folder} – ${N.files[os]}`, `<div class="akk"><div class="om">${Object.keys(FOLDERS).map(f => `<button type="button" class="${f === folder ? 'on' : ''}" data-fun="folder" data-folder="${f}">${f}</button>`).join('')}
            <button type="button" data-egg="bin">${os === 'windows' ? '回收站' : os === 'mac' ? '废纸篓' : '废纸篓'}</button></div>
            <div class="aai">${items}${note ? `<p class="agj">${note}</p>` : ''}</div></div>`, 'ca'));
    }
    function funViewer(screen, os, name) {
        openFunWin(screen, funWin(os, 'viewer', name, `<div class="adw" style="background:${PICS[name]}">${name === '海滩上的狗.jpg' ? '<span>🐕</span>' : ''}</div>`, 'ca'));
    }

    // ---------- Settings ----------
    function funSettings(screen, os, page = 'wifi') {
        const st = funState(screen);
        const pages = {
            wifi: `<h3>Wi-Fi</h3><div class="cj ex"><span>Wi-Fi</span><button type="button" class="nw" data-fun="wifi-toggle-set" aria-label="Wi-Fi on or off">${tog(st.wifiOn)}</button></div><p class="cf">${st.wifiOn ? '⟦check⟧ 已连接到 Home-WiFi-5G' : 'Wi-Fi 已关闭。'}</p>`,
            look: `<h3>${os === 'windows' ? '个性化' : os === 'mac' ? '壁纸' : '背景'}</h3><div class="rk">${WALLS.map(([n, bg], k) => `<button type="button" data-fun="wall" data-n="${k}" class="${st.wall === k ? 'on' : ''}" style="background:${bg}" aria-label="${n}"></button>`).join('')}
                <button type="button" data-fun="wall" data-n="-1" class="${st.wall < 0 ? 'on' : ''}" style="background:${WALL[os]}" aria-label="Original"></button></div>`,
            update: `<h3>${os === 'windows' ? 'Windows 更新' : os === 'mac' ? '软件更新' : '更新'}</h3><p class="mj">⟦check⟧ 您已是最新</p><p class="cf">上次检查：今天 ${NOW.time()}</p><button type="button" class="ce co bz" data-fun="check-updates">检查更新</button><p class="zi"></p>`,
            about: `<h3>关于</h3><div class="zk"><div><span>设备名称</span><b>MARGARET-PRACTICE</b></div><div><span>系统</span><b>${os === 'windows' ? 'Windows 11（练习版）' : os === 'mac' ? 'macOS 27（练习版）' : 'Linux Mint 22.3（练习版）'}</b></div>
                <div><span>处理器</span><b>Bridlington Silicon B1</b></div><div><span>内存</span><b>从不忘记生日</b></div><div><span>存储</span><b>足够存放孙辈的照片</b></div></div>`,
        };
        const side = [['wifi', 'Wi-Fi'], ['look', os === 'windows' ? '个性化' : os === 'mac' ? '壁纸' : '背景'], ['update', '更新'], ['about', '关于本机']];
        openFunWin(screen, funWin(os, 'settings', N.settings[os], `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-fun="set-page" data-page="${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page]}</div></div>`, 'ca'));
    }

    // ---------- Store and Minesweeper ----------
    const STORE_APPS = [['mines', '⟦bomb⟧', '练习扫雷', '经典的找地雷游戏。'], ['solitaire', '⟦spade⟧', '纸牌接龙', '这个练习商店即将上架。'], ['paint', '⟦paintbrush⟧', '画图', '这个练习商店即将上架。'], ['weather', '⟦cloud-sun⟧', '天气', '这个练习商店即将上架。']];
    function funStore(screen, os) {
        const st = funState(screen);
        st.installed = st.installed || [];
        openFunWin(screen, funWin(os, 'store', N.store[os], `<div class="jo"><div class="gq">${ICON.search}<span>Search apps</span></div><div class="mi">${STORE_APPS.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span>
            <div class="kc"><strong>${n}</strong><span>${d}</span></div><button type="button" class="km" data-fun="store-get" data-app="${id}">${st.installed.includes(id) ? '打开' : (os === 'mac' ? '获取' : '安装')}</button></div>`).join('')}</div>
            <p class="fd">Practice store: nothing is really downloaded.</p></div>`, 'ca'));
    }
    function funMines(screen, os) {
        const W = 8, H = 8, M = 10;
        const w = openFunWin(screen, funWin(os, 'mines', '练习扫雷', `<div class="mines"><div class="acq"><span class="uk">⟦bomb⟧ ${M}</span><button type="button" class="uh" aria-label="New game">⟦smile⟧</button><span class="ul">0</span></div>
            <div class="uj" style="grid-template-columns:repeat(${W},1fr)">${Array.from({length: W * H}, (_, k) => `<button type="button" class="zx" data-k="${k}" aria-label="Square"></button>`).join('')}</div>
            <p class="fd">单击挖开。右键单击（或按住）插旗。</p></div>`, 'bz'));
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
        ['妈妈', '这个东西怎么关？', '亲爱的，我写好了这封邮件，可是找不到关机按钮。是那个圆的吗？爱你的妈妈 xx 又及：我按了。什么都没发生。这对吗？'],
        ['Bridlington Walkers', '星期六的散步', '上午 10 点在港口集合。带上保温壶和防水外套。上周的海鸥事件不再提起。'],
        ['Abu 王子（非常富有）', '紧急：您中了 £4,000,000！！！', '亲爱的朋友，我是一位王子，需要您的银行信息，好给您汇四百万英镑。另外请寄 £50 作邮票费。——这是诈骗！真正的人不会通过电子邮件送出几百万。请删除它，或转发到 report@phishing.gov.uk。'],
        ['Sarah', '周日的照片 🌻', '这是花园里的照片。狗又吃掉了一朵向日葵。'],
    ];
    function funMail(screen, os, open = -1) {
        const inner = open < 0
            ? `<div class="aat">${MAILS.map(([from, subj], k) => `<button type="button" class="lx${k === 2 ? ' lt' : ''}" data-fun="mail-open" data-n="${k}"><strong>${esc(from)}</strong><span>${esc(subj)}</span></button>`).join('')}</div>`
            : `<div class="aau"><button type="button" class="tj" data-fun="mail-back">← Inbox</button><p><strong>${esc(MAILS[open][0])}</strong>: ${esc(MAILS[open][1])}</p>${esc(MAILS[open][2]).split('\n').map(l => `<p>${l}</p>`).join('')}</div>`;
        openFunWin(screen, funWin(os, 'mail', '邮件', `<div class="akq">${inner}</div>`, 'ca'));
    }

    // Opens the practice app for an id (from FUN_FROM_TAP, or a data-fun on a button inside an app).
    function pcApp(screen, os, what, el) {
        if (!APP_KEYS.includes(what)) return false;
        const desk = screen.querySelector('.ft');
        if (what === 'power') { funToast(screen, '这是一台练习用电脑，所以关不掉 😉'); return true; }
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
            else if (n === 'setup_free_cleaner.exe') funFiles(screen, os, '下载', '⟦triangle-alert⟧ “免费清理”程序往往是垃圾，甚至更糟。最好删掉它，不要打开！');
            else if (/\.txt$/.test(n)) pcFun(screen, os, {dataset: {fun: 'notepad'}});
            else funFiles(screen, os, el.dataset.folder, `在真正的电脑上，这里会打开“${n}”。`);
            return true;
        }
        if (what === 'app-settings') { funSettings(screen, os); return true; }
        if (what === 'set-page') { funSettings(screen, os, el.dataset.page); return true; }
        if (what === 'wifi-toggle-set') { const st = funState(screen); st.wifiOn = !st.wifiOn; funSettings(screen, os, 'wifi'); pcDecorate(screen, os); funToast(screen, st.wifiOn ? 'Wi-Fi 已开启。' : 'Wi-Fi 已关闭。'); return true; }
        if (what === 'wall') { const st = funState(screen); st.wall = +el.dataset.n; desk.style.background = st.wall < 0 ? WALL[os] : WALLS[st.wall][1]; funSettings(screen, os, 'look'); return true; }
        if (what === 'check-updates') {
            const note = el.closest('.lb').querySelector('.zi');
            note.textContent = '正在检查更新……';
            setTimeout(() => { if (note.isConnected) note.textContent = '⟦check⟧ 没有新的更新。一切就绪！'; }, 1500);
            return true;
        }
        if (what === 'app-store') { funStore(screen, os); return true; }
        if (what === 'store-get') {
            const st = funState(screen); const id = el.dataset.app;
            if (st.installed.includes(id)) { if (id === 'mines') funMines(screen, os); else funToast(screen, '这个在练习商店里只是摆设。'); return true; }
            el.textContent = '正在安装……'; el.disabled = true;
            setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = '打开'; el.disabled = false; } }, 1000);
            return true;
        }
        if (what === 'app-mail') { funMail(screen, os); return true; }
        if (what === 'mail-open') { funMail(screen, os, +el.dataset.n); return true; }
        if (what === 'mail-back') { funMail(screen, os); return true; }
        if (what === 'app-writer') {
            openFunWin(screen, funWin(os, 'writer', '无标题 1 – LibreOffice Writer', '<div class="aju"><div class="yd">文件 编辑 视图 插入 格式 <b>B</b> <i>I</i> <u>U</u></div><textarea class="vk agd" aria-label="Document">尊敬的先生或女士：</textarea></div>', 'ca'));
            return true;
        }
        if (what === 'app-update') {
            openFunWin(screen, funWin(os, 'update', '更新管理器', '<div class="ajz"><p class="mj">⟦check⟧ 您的系统已是最新</p><p class="cf">Linux Mint 会自己检查更新，有更新时盾牌上会显示一个圆点。</p></div>', 'bz'));
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
            bars = `<div class="akj"><button type="button" class="aeq" data-tap="apple-menu" data-fun="apple-menu" aria-label="Apple menu"></button><strong>${opts.appName || '访达'}</strong>
                <span class="ye">File Edit View Window Help</span><span class="yf">${wifi}<button type="button" class="sz" data-fun="clock">${clock}</button></span></div>`
                + `<div class="ly">${['files', 'apps', ...pinned.filter(k => k !== 'files')].map(k => k === 'apps' ? `<button type="button" class="fa" data-tap="start" aria-label="Apps">${pcIcon(os, 'apps')}<span class="yl">Apps</span></button>` : pin(k)).join('')}<span class="aej"></span><button type="button" class="fa" data-egg="bin" aria-label="Bin">${pcIcon(os, 'trash')}<span class="yl">Bin</span></button></div>`;
        } else if (os === 'windows') {
            const startIcon = LU('layout-grid', 'zb');
            bars = `<div class="aaa${opts.win10 ? ' w10' : ''}"><div class="adr"><button type="button" class="fa start" data-tap="start" aria-label="Start">${startIcon}</button>
                ${opts.win10 ? '<span class="xi">⟦search⟧ 在此键入以搜索</span>' : ''}${pinned.map(pin).join('')}</div>
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
        if (os === 'windows') return `<div class="rd">${icon('回收站', '⟦trash-2⟧', true)}</div>`;
        if (os === 'linux') return `<div class="rd">${icon('计算机', '⟦monitor⟧')}${icon('主页', '⟦house⟧')}${icon('废纸篓', '⟦trash-2⟧', true)}</div>`;
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
            return `<div class="mh aip">${search('搜索应用、设置和文档')}<p class="ajw">Pinned</p>
                <div class="aao">${items.map(btn).join('')}</div><div class="ot"><span>⟦user⟧ Margaret</span><button type="button" data-tap="power" aria-label="Power">${UI.power}</button></div></div>`;
        }
        if (os === 'mac') {
            return `<div class="mh mac">${search('搜索')}<div class="aao">${items.map(btn).join('')}</div></div>`;
        }
        return `<div class="mh sh">${search('键入以搜索……')}<div class="aap">${items.map(btn).join('')}</div>
            <div class="ot"><span>Margaret</span><button type="button" data-tap="power" aria-label="Shut down">${UI.power}</button></div></div>`;
    }

    // ---------- Course: Computer basics ----------
    const browserHome = os => `<div class="aaw"><div class="tr"><span class="qm">新标签页 <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div>
        <div class="qn">⟦search⟧ 搜索或输入网址</div><div class="ju"><div class="rl">${N.browser[os]}</div><input class="jv" data-fun-input="web" placeholder="Search the web" aria-label="Search the web"><p class="oi"></p></div></div>`;

    pcLesson('pc-desktop', (os) => withCtx([
        {screen: () => desk(os), target: 'start',
         say: os === 'windows' ? '这是<strong>桌面</strong>。底部的长条是<strong>任务栏</strong>。从“开始”菜单打开网页浏览器：<strong>单击“开始”</strong>，也就是那四个方块。'
            : os === 'mac' ? '这是<strong>桌面</strong>。底部那一排应用是<strong>程序坞</strong>，顶部的长条是<strong>菜单栏</strong>。<strong>单击“应用”</strong>（方块网格）查看所有应用。'
            : '这是 Linux Mint 里的<strong>桌面</strong>。底部的长条是<strong>面板</strong>。您的应用在“菜单”里：<strong>单击左下角的“菜单”</strong>。',
         hint: os === 'mac' ? '“应用”在底部程序坞里，挨着访达。' : (os === 'windows' ? '“开始”是任务栏上的四个蓝色方块。' : '“菜单”按钮在底部面板的最左边。')},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-browser', say: `<strong>单击 ${N.browser[os]}</strong>，也就是网页浏览器。`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-min',
         say: os === 'mac' ? '每个窗口的<strong>左上角</strong>都有三个彩色按钮。黄色的会把窗口收起来。<strong>单击黄色按钮。</strong>'
            : '每个窗口的<strong>右上角</strong>都有三个按钮。横线 <strong>—</strong> 会把窗口收起来（最小化）。<strong>单击 —。</strong>',
         hints: {'win-close': '那样会把它关闭。先把它收起来，用 ' + (os === 'mac' ? 'yellow' : '—') + ' button.', 'win-max': '那样会让它铺满屏幕。先把它收起来。'}},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os]}), target: 'app-browser',
         say: `它是被隐藏了，没有关闭。${os === 'mac' ? '程序坞里图标下面的小圆点' : 'line under its icon'}表明它仍然开着。<strong>单击 ${N.browser[os]} 图标</strong>把它调出来。`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os))}), target: 'win-max',
         say: `现在让它铺满屏幕：<strong>单击 ${os === 'mac' ? 'green' : '▢'} 按钮</strong>。`},
        {screen: () => desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], browserHome(os), {max: true})}), target: 'win-close',
         say: `When you've finished, close it: <strong>click the ${os === 'mac' ? 'red' : '⟦x⟧'} button</strong>.`},
        {screen: () => desk(os), question: os === 'mac'
            ? {q: '在 Mac 上，红色按钮会关闭窗口，但应用可以继续运行。怎样彻底退出它？', options: [
                {t: '按 ⟦command⟧ Cmd + Q，或在顶部的应用菜单里选择“退出”', ok: true, why: '对。程序坞里应用下面的圆点表示它仍在运行。⟦command⟧ Cmd + Q 能退出它。'},
                {t: '单击红色按钮两次', why: '红色按钮只会关闭窗口。⟦command⟧ Cmd + Q（或应用菜单 > 退出）才会退出应用。'}]}
            : {q: '窗口的关闭按钮在哪里？', options: [
                {t: '右上角：⟦x⟧', ok: true, why: '对。在 Windows 和 Linux Mint 上，三个按钮在右上角。（在 Mac 上它们在左上角，红、黄、绿三色。）'},
                {t: '左下角', why: '它在每个窗口的右上角：⟦x⟧。'}]}},
        {screen: () => desk(os), done: true, say: '<strong>做得好！</strong>您会打开、隐藏、调出、放大和关闭窗口了。这就是使用电脑的大部分内容。'},
    ], {}));

    // Files and folders
    function filesWin(os, ctx, folder) {
        const places = [['home', os === 'windows' ? '主页' : '主页'], ['desktop', '桌面'], ['documents', '文档'], ['downloads', '下载'], ['pictures', '图片']]
            .concat(ctx.usb ? [['usb', '⟦usb⟧ U 盘']] : []);
        const contents = {
            home: [['documents', '⟦folder⟧', '文档'], ['pictures', '⟦folder⟧', '图片'], ['downloads', '⟦folder⟧', '下载']],
            downloads: [['photo', '⟦image⟧', '假期照片.jpg'], ['bill', '⟦file-text⟧', '市政税账单.pdf']],
            pictures: [...(ctx.pasted ? [['photo2', '⟦image⟧', '假期照片.jpg']] : []), ...(ctx.folderMade ? [['newf', '⟦folder⟧', esc(ctx.folderName || '假期')]] : [])],
            documents: [['letter', '⟦file-text⟧', '给市政委员会的信.docx'], ['recipes', '⟦folder⟧', '食谱']],
            usb: ctx.copied ? [['documents2', '⟦folder⟧', '文档']] : [],
            desktop: [],
        }[folder] || [];
        const menu = ctx.menu ? `<div class="hc" style="${ctx.menuAt || 'left:40%;top:40%'}">${ctx.menu.map(([id, t]) => `<button type="button" data-tap="${id}">${t}</button>`).join('')}</div>` : '';
        const naming = ctx.naming ? `<div class="vp">⟦folder⟧ ${field('foldername', '新建文件夹', ctx)}<button type="button" class="ce co bz" data-tap="name-ok">OK</button></div>` : '';
        const title = {home: os === 'windows' ? '主页' : '主页', downloads: '下载', pictures: '图片', documents: '文档', usb: 'U 盘', desktop: '桌面'}[folder];
        return pcWin(os, os === 'mac' ? title : `${title} – ${N.files[os]}`, `<div class="akk">
            <div class="om">${places.map(([id, t]) => `<button type="button" class="${id === folder ? 'on' : ''}" data-tap="side-${id}" ${id === 'usb' ? 'data-rclick="rc-usb"' : ''}>${t}</button>`).join('')}</div>
            <div class="aai" data-rclick="rc-empty">${contents.map(([id, ic, t]) => `<button type="button" class="mn${ctx.sel === id ? ' qg' : ''}" data-tap="sel-${id}" data-rclick="rc-${id}"><span>${ic}</span>${t}</button>`).join('')}${naming}
            ${contents.length || naming ? '' : '<p class="aev">这个文件夹是空的</p>'}</div>${menu}</div>${ctx.progress ? `<div class="zz">${ctx.progress}</div>` : ''}`, {cls: 'files'});
    }
    const filesDesk = (os, ctx, folder, extra = {}) => desk(os, {running: ['files'], appName: '访达', windows: filesWin(os, ctx, folder), ...extra});
    const copyLabel = os => os === 'mac' ? '复制' : '复制';
    const pasteLabel = os => os === 'mac' ? '粘贴项目' : '粘贴';
    const newFolderLabel = os => os === 'mac' ? '新建文件夹' : os === 'windows' ? '新建 > 文件夹' : '新建文件夹';

    pcLesson('pc-files', (os) => withCtx([
        {screen: () => desk(os), target: 'app-files', say: `您的照片和信件都存放在<strong>文件夹</strong>里。<strong>单击 ${N.files[os]}</strong> 查看它们。`, hint: `${N.files[os]} is the folder icon ${os === 'mac' ? '程序坞最左边的那个' : '在 ' + (os === 'windows' ? 'taskbar' : 'panel')}.`},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-downloads', say: '左侧是您的主要文件夹。从邮件和网站下载的东西会放在<strong>下载</strong>里。<strong>单击“下载”。</strong>'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'rc-photo', action: c => { c.menu = [['menu-open', '打开'], ['menu-copy', copyLabel(os)], ['menu-rename', '重命名'], ['menu-delete', os === 'mac' ? '移到废纸篓' : '删除']]; c.menuAt = 'left:30%;top:22%'; },
         say: '我们把这张假期照片复制到它该去的“图片”里。在<strong>假期照片.jpg</strong>上<strong>单击右键</strong>：按鼠标的<strong>右键</strong>。<em>' + (os === 'mac' ? '在触控板上，用两根手指单击。' : '在触摸屏上，按住不放。') + '</em>',
         hint: '在照片上按鼠标右键。'},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'menu-copy', action: c => { c.menu = null; },
         say: `出现了一个菜单。<strong>单击 ${copyLabel(os)}。</strong><em>（快捷键是 ${CMDL(os)} + C。）</em>`, hints: {'menu-delete': '不是那个！单击“复制”。', 'menu-open': '那样会打开照片。单击“复制”。', 'menu-rename': '单击“复制”。'}},
        {screen: c => filesDesk(os, c, 'downloads'), target: 'side-pictures', say: '<strong>单击左侧的“图片”。</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; },
         say: '“图片”是空的。<strong>在空白处单击右键。</strong>'},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-paste', action: c => { c.menu = null; c.pasted = true; }, say: `<strong>单击 ${pasteLabel(os)}。</strong><em>（或 ${CMDL(os)} + V。）</em>`,
         hints: {'menu-newfolder': '接下来我们会新建文件夹。先单击 ' + pasteLabel(os) + '.'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:55%;top:55%'; },
         say: '照片现在也在“图片”里了。接着新建一个文件夹，把假期照片放在一起。<strong>再次在空白处单击右键。</strong>', hints: {'rc-photo2': '在空白处单击右键，不要在照片上。'}},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'menu-newfolder', action: c => { c.menu = null; c.naming = true; }, say: `<strong>单击 ${newFolderLabel(os)}。</strong>`},
        {screen: c => filesDesk(os, c, 'pictures'), target: 'name-ok', require: c => typed(c, 'foldername').length > 0, requireHint: '先给文件夹输入一个名字，比如“假期”。',
         action: c => { c.naming = false; c.folderMade = true; c.folderName = typed(c, 'foldername'); },
         say: '<strong>输入名字</strong>，比如<strong>假期</strong>，然后<strong>单击“确定”</strong>（或按回车键）。', alias: {'keys-enter': 'name-ok'}},
        {screen: c => filesDesk(os, c, 'pictures'), question: {q: '邮件和网站里的文件通常会存到哪里？', options: [
            {t: '“下载”文件夹里', ok: true, why: '对。如果找不到下载的东西，先看“下载”。'},
            {t: '桌面上', why: '通常在“下载”里。找不到东西时先去那里看。'}]}},
        {screen: c => filesDesk(os, c, 'pictures'), done: true, say: '<strong>做得好！</strong>右键单击是大多数操作的秘诀：复制、粘贴、重命名和新建文件夹都在那个菜单里。'},
    ], {input: {}}));

    // Wi-Fi
    function wifiPanel(os, ctx) {
        const nets = [['net-home', 'Home-WiFi-5G', '⟦lock⟧'], ['net-cafe', 'Cafe-Free-WiFi', ''], ['net-neighbour', 'Neighbour-Net', '⟦lock⟧']];
        const pass = ctx.picked ? `<div class="aas"><p>输入网络密码</p>${field('wifipass', '密码', ctx)}<button type="button" class="ce co" data-tap="connect">连接</button></div>` : '';
        return `<div class="adz ${os}"><p class="akb">${os === 'mac' ? 'Wi-Fi' : 'Wi-Fi 网络'}</p>${ctx.connected ? '<p class="afv">⟦check⟧ 已连接到 Home-WiFi-5G</p>' : ''}
            ${nets.map(([id, n, lock]) => `<button type="button" class="zs${ctx.picked && id === 'net-home' ? ' on' : ''}" data-tap="${id}">⟦wifi⟧ ${n} <small>${lock}</small></button>`).join('')}${pass}</div>`;
    }
    pcLesson('pc-wifi', (os) => withCtx([
        {screen: () => desk(os, {noWifi: true}), target: 'tray-wifi', say: `要连接 Wi-Fi，请<strong>单击 Wi-Fi 符号</strong> ${os === 'mac' ? '在屏幕右上角' : '在右下角，靠近时钟的位置'}。`, hint: os === 'mac' ? '它在右上角的菜单栏里。' : '它在右下角，靠近时钟。'},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'net-home', action: c => { c.picked = true; },
         say: '您的网络名称印在路由器的标签上。这个练习用的是 <strong>Home-WiFi-5G</strong>。<strong>单击它。</strong>', hints: {'net-neighbour': '那是您邻居的！请选 Home-WiFi-5G。', 'net-cafe': '那不是您家的。请选 Home-WiFi-5G。', 'tray-wifi': 'Wi-Fi 网络列表已经打开了。单击 Home-WiFi-5G。'}},
        {screen: c => desk(os, {noWifi: true, overlay: wifiPanel(os, c)}), target: 'connect', require: c => typed(c, 'wifipass') === 'Green-Apple-42', requireHint: '原样输入密码：Green-Apple-42（G 和 A 要大写）。',
         action: c => { c.connected = true; c.picked = false; }, say: '按标签上的样子<strong>原样</strong>输入密码：<strong>Green-Apple-42</strong>。然后<strong>单击“连接”</strong>。', alias: {'keys-enter': 'connect'},
         hints: {'tray-wifi': 'Wi-Fi 面板已经打开了。在框里输入密码，然后单击“连接”。'}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), question: {q: '您在一家有免费 Wi-Fi 的咖啡馆里。可以用来做网上银行吗？', options: [
            {t: '最好等回家，或者用手机流量', ok: true, why: '对。免费 Wi-Fi 用来浏览网页没问题，但银行业务请用家里的 Wi-Fi 或手机流量。'},
            {t: '对，任何 Wi-Fi 都可以', why: '免费的公共 Wi-Fi 用来浏览网页没问题，但银行业务请留到回家后或用手机流量。'}]}},
        {screen: c => desk(os, {overlay: wifiPanel(os, c)}), done: true, say: '<strong>做得好！</strong>您的电脑会记住这个密码，下次自动连接。'},
    ], {input: {}}));

    // Keyboard shortcuts
    function shortcutDesk(os, ctx) {
        const k = CMD(os), L = CMDL(os);
        const keys = `<div class="jx">${keyBtn('keys-' + k + '+a', L + ' + A')}${keyBtn('keys-' + k + '+c', L + ' + C')}${keyBtn('keys-' + k + '+v', L + ' + V')}${keyBtn('keys-' + k + '+z', L + ' + Z')}</div>`;
        const list = '购物清单：牛奶、面包、鸡蛋、茶包、给 Jean 的生日贺卡';
        const note = pcWin(os, `购物清单 – ${N.editor[os]}`, `<div class="aab${ctx.selected ? ' qg' : ''}">${list}</div>`, {cls: 'note', style: 'left:3%;top:4%;width:52%;'});
        const mail = pcWin(os, '给 Sarah 的新邮件', `<div class="ael">To: Sarah</div><button type="button" class="aac${ctx.inMail ? ' focus' : ''}" data-tap="email-body">${ctx.pasted ? list : (ctx.inMail ? '<span class="ts"></span>' : '点击这里书写……')}</button>`, {cls: 'mail', style: 'left:40%;top:30%;width:56%;'});
        return desk(os, {running: ['text', 'mail'], pinned: ['files', 'browser', 'text', 'mail'], appName: ctx.inMail ? '邮件' : N.editor[os], windows: note + mail, overlay: keys});
    }
    pcLesson('pc-shortcuts', (os) => withCtx([
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+a`, action: c => { c.selected = true; },
         say: `键盘快捷键能省下大量点击。<strong>${CMDL(os)}</strong>是键盘上的那个键${os === 'mac' ? '空格键两侧，标有 ⟦command⟧' : '在键盘左下角'}。要选中所有文字，请按住<strong>${CMDL(os)}</strong>再按<strong>A</strong>。<em>请使用真正的键盘，或屏幕上的按钮。</em>`},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+c`, action: c => { c.copied = true; }, say: `已高亮选中。现在复制它：<strong>${CMDL(os)} + C</strong>。`},
        {screen: c => shortcutDesk(os, c), target: 'email-body', action: c => { c.inMail = true; }, say: '已复制！<strong>点击发给 Sarah 的邮件内部</strong>，也就是写着“点击这里书写”的地方。'},
        {screen: c => shortcutDesk(os, c), target: `keys-${CMD(os)}+v`, action: c => { c.pasted = true; }, say: `现在粘贴：<strong>${CMDL(os)} + V</strong>。`},
        {screen: c => shortcutDesk(os, c), question: {q: `哎呀，您不小心删掉了东西。哪个快捷键可以撤销？`, options: [
            {t: `${CMDL(os)} + Z`, ok: true, why: `对。${CMDL(os)} + Z 会撤销您刚做的上一件事，几乎在所有应用里都适用。再按一次可以撤销更多。`},
            {t: 'Escape', why: `Esc 是关闭菜单。${CMDL(os)} + Z 才是撤销。`}]}},
        {screen: c => shortcutDesk(os, c), question: {q: '怎样截屏（给屏幕拍一张图）？', options: [
            {t: os === 'windows' ? 'Windows 键 + Shift + S，然后拖动选出要截的区域' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4，然后拖动选出要截的区域' : '按“截屏”键 (PrtSc)', ok: true,
             why: os === 'windows' ? '对。它已被复制，通知会让您保存它。“截屏”键也可以。' : os === 'mac' ? '对。图片会保存在您的桌面上。Shift + ⟦command⟧ Cmd + 3 会截取整个屏幕。' : '对。Linux Mint 会把它保存在您的“图片”文件夹里。Shift + 截屏键 可以选择区域。'},
            {t: '用手机给屏幕拍一张照片', why: '这也行，但截屏要清晰得多。 ' + (os === 'windows' ? 'Windows 键 + Shift + S。' : os === 'mac' ? 'Shift + ⟦command⟧ Cmd + 4。' : '按“截屏”键。')}]}},
        {screen: c => shortcutDesk(os, c), done: true, say: `<strong>做得好！</strong>最重要的四个：<strong>${CMDL(os)} + C</strong> 复制，<strong>V</strong> 粘贴，<strong>Z</strong> 撤销，<strong>A</strong> 全选。它们几乎在所有应用里都能用。`},
    ], {}));

    // Installing apps safely
    function storeWin(os, ctx) {
        const rows = [['get-fake1', 'Office Suite Pro for Word', 'QuickDev Apps', '£29.99/year', true, '3.1'], ['get-real', 'LibreOffice', 'The Document Foundation', '免费', false, '4.5'],
                      ['get-fake2', 'Docs Editor Free', 'AppMakers', '免费 · 含应用内购买', false, '2.7']];
        const inner = !ctx.searched
            ? `<button type="button" class="gq" data-tap="search">${ICON.search}<span>搜索应用</span></button><div class="hp"><span>精选</span><strong>适合您新电脑的应用</strong></div>`
            : `<div class="gq">${ICON.search}<span>office</span></div><div class="mi">${rows.map(([id, n, dev, price, ad, rate]) => `<div class="nh">${appIcon(id === 'get-real' ? '#0ea5e9' : '#94a3b8', PCI.writer)}
                <div class="kc"><strong>${n}</strong><span>${dev}${ad ? ' <em class="xn">Ad</em>' : ''}</span><span class="vz">${rate} ⟦star⟧ · ${price}</span></div>
                <button type="button" class="km" data-tap="${id}">${id === 'get-real' && ctx.installed ? '打开' : (os === 'mac' ? '获取' : '安装')}</button></div>`).join('')}</div>
                ${ctx.busy ? '<p class="cf">正在安装 LibreOffice……</p>' : ''}`;
        return pcWin(os, N.store[os], `<div class="jo">${inner}<p class="fd">练习商店：名称和价格仅为示例。</p></div>`, {cls: 'store'});
    }
    pcLesson('pc-install', (os) => withCtx([
        {screen: () => desk(os), target: 'app-store', say: `获取应用最安全的地方是自带的商店：<strong>${N.store[os]}</strong>。<strong>点击它。</strong>`},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'search', action: c => { c.searched = true; },
         say: '您想要一个写信的工具，比如 Word。<strong>点击搜索框。</strong>我们来搜索“office”。'},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, c)}), target: 'get-real',
         say: '<strong>LibreOffice</strong> 是 Microsoft Office 的免费替代品，由 <strong>The Document Foundation</strong> 开发。先看看是谁开发的，然后<strong>点击 ' + (os === 'mac' ? '获取' : '安装') + ' LibreOffice 旁边的按钮</strong>。',
         hints: {'get-fake1': '那个是广告，每年收费 £29.99。LibreOffice 是免费的。', 'get-fake2': '那个是 AppMakers 的，含应用内购买。请选择 The Document Foundation 开发的 LibreOffice。'}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, installed: !c.busy})}), wait: 1400,
         question: {q: '一个网站弹窗写着“您的电脑很慢！立即下载 Speed Booster”。您怎么办？', options: [
            {t: '关掉它。只从商店或开发者自己的网站安装应用', ok: true, why: '没错。提供“加速器”或“清理器”的弹窗往往是垃圾，甚至更糟。'},
            {t: '下载它，说不定有帮助', why: '这类东西往往是垃圾或有害的。只从商店或开发者自己的网站安装。'}]}},
        {screen: c => desk(os, {running: ['store'], appName: 'App Store', windows: storeWin(os, {...c, searched: true, installed: true})}), done: true,
         say: '<strong>做得好！</strong>LibreOffice 安装好了。核实开发者，别理广告，并对之后才要钱的“免费”应用保持警惕。'},
    ], {}));

    // Updates
    function settingsWin(os, ctx, page) {
        if (os === 'windows') {
            const side = [['home', '主页'], ['system', '系统'], ['bluetooth', '蓝牙和设备'], ['network', '网络和 Internet'], ['accounts', '账户'], ['privacy', '隐私和安全性'], ['update', 'Windows 更新']];
            const pages = {
                home: '<h3>主页</h3><p class="cf">推荐的设置和您的账户。</p>',
                update: `<h3>Windows Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ 您已是最新</p>' : ctx.ready ? `<p class="cf">需要重新启动才能完成更新安装。</p><button type="button" class="ce co bz" data-tap="restart">立即重新启动</button>`
                    : `<p class="cf"><strong>Updates available</strong><br>2026-10 Cumulative Update for Windows 11<br>${ctx.busy ? '正在下载…… 45%' : ''}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="download">Download &amp; install all</button>'}`}`,
                privacy: `<h3>Privacy &amp; security</h3><button type="button" class="ck" data-tap="win-security"><strong>Windows Security</strong><small>Antivirus, firewall and device protection</small></button>`,
            };
            return pcWin(os, '设置', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || ''}</div></div>`, {cls: 'settings'});
        }
        if (os === 'mac') {
            const side = [['wifi', 'Wi-Fi'], ['bluetooth', '蓝牙'], ['general', '通用'], ['privacy', '隐私与安全性'], ['users', '用户与群组']];
            const pages = {
                general: '<h3>General</h3><button type="button" class="ck" data-tap="software-update"><strong>Software Update</strong></button><div class="ck"><strong>About</strong></div><div class="ck"><strong>Storage</strong></div>',
                update: `<h3>Software Update</h3>${ctx.updated ? '<p class="mj">⟦check⟧ 您的 Mac 已是最新</p>' : `<p class="cf"><strong>macOS update available</strong><br>${ctx.busy ? '正在下载…… 大约还剩 10 分钟' : '安全性和错误修复'}</p>${ctx.busy ? '' : '<button type="button" class="ce co bz" data-tap="update-now">Update Now</button>'}`}
                    <div class="cj ex"><span>Automatic updates</span><span class="kz">On</span></div>`,
                privacy: `<h3>隐私与安全性</h3><p class="cf"><strong>安全性</strong><br>允许从以下位置下载的 App：</p>
                    <button type="button" class="ck" data-tap="allow-store">${ctx.allow === 'store' ? '◉' : '○'} App Store</button><button type="button" class="ck" data-tap="allow-known">${ctx.allow !== 'store' && ctx.allow !== 'anywhere' || ctx.allow === 'known' ? '◉' : '○'} App Store 和已知开发者</button>`,
            };
            return pcWin(os, '系统设置', `<div class="ajx"><div class="mt">${side.map(([id, t]) => `<button type="button" class="${id === page || (page === 'update' && id === 'general') ? 'on' : ''}" data-tap="side-${id}">${t}</button>`).join('')}</div><div class="lb">${pages[page] || '<h3>系统设置</h3>'}</div></div>`, {cls: 'settings'});
        }
        return '';
    }
    function updateManager(os, ctx) {
        return pcWin(os, '更新管理器', `<div class="ajz">${ctx.updated ? '<p class="mj">⟦check⟧ 您的系统已是最新</p>' : `<div class="ahf">${['Firefox 网页浏览器', 'Linux 内核（安全）', 'LibreOffice', '系统库'].map(t => `<div>⟦square-check⟧ ${t}</div>`).join('')}</div>
            ${ctx.busy ? '<p class="cf">正在安装更新……</p>' : '<button type="button" class="ce dk bz" data-tap="install">Install Updates</button>'}`}</div>`, {cls: 'um-win'})
            + (ctx.auth ? `<div class="hr"><p><strong>需要身份验证</strong></p><p class="fd">请输入密码以安装更新。（练习：已替您输入。）</p><div class="afr">••••••••</div>
                <div class="jn"><button type="button" data-tap="auth-cancel">取消</button><button type="button" class="adg" data-tap="auth-ok">验证</button></div></div>` : '');
    }
    pcLesson('pc-updates', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: '更新能修复骗子利用的安全漏洞。我们来检查一下。<strong>点击“开始”。</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>点击“设置”</strong>（齿轮图标）。'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-update', say: '<strong>点击“Windows 更新”</strong>，在左侧列表的底部。'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'update')}), target: 'download', say: '有更新在等着。<strong>点击“全部下载并安装”。</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, {...c, ready: !c.busy}, 'update')}), wait: 1400, target: 'restart', action: c => { c.updated = true; },
         say: '先保存您正在做的工作，然后<strong>点击“立即重新启动”</strong>。'},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: '更新能修复骗子利用的安全漏洞。<strong>点击左上角的苹果菜单</strong>（那个标志）。'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="sleep">Sleep</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>点击“系统设置…”</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, c, 'general')}), target: 'software-update', say: '您在“通用”里。<strong>点击“软件更新”。</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, c, 'update')}), target: 'update-now', say: '有更新已准备好。接上充电器，然后<strong>点击“立即更新”</strong>。'},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, {...c, updated: !c.busy}, 'update')}), wait: 1400, say: '您的 Mac 会先下载，然后重新启动来安装。',
         question: {q: '自动更新已开启。您还需要做什么吗？', options: [
            {t: '它提示时重新启动就行，偶尔夜里让它插着电', ok: true, why: '对。更新常常在夜间安装。按提示重新启动就能完成安装。'},
            {t: '关闭自动更新', why: '让它们保持开启：它们能保护您的安全。Mac 提示时重新启动就行。'}]}},
    ] : [
        {screen: () => desk(os, {badge: true}), target: 'tray-update', say: '更新能修复安全漏洞。在 Linux Mint 里，有更新等待时，时钟旁边的<strong>盾牌</strong>上会出现一个圆点。<strong>点击盾牌。</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'install', action: c => { c.auth = true; }, say: '更新管理器会列出所有更新。<strong>点击“安装更新”。</strong>'},
        {screen: c => desk(os, {badge: true, running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, c)}), target: 'auth-ok', action: c => { c.auth = false; },
         say: 'Linux 在更改重要的东西之前会要求您输入<strong>密码</strong>。这是好事。<strong>点击“验证”。</strong>', hints: {'auth-cancel': '那样会取消更新。请点击“验证”。'}},
        {screen: c => desk(os, {running: ['update'], pinned: ['files', 'browser', 'update'], windows: updateManager(os, {...c, updated: !c.busy})}), wait: 1400,
         question: {q: '应该多久安装一次更新？', options: [
            {t: '只要盾牌上出现圆点就装：只需要一分钟', ok: true, why: '对。Linux Mint 很少需要重新启动，除非是某些安全更新。'},
            {t: '一年一次', why: '只要盾牌上出现圆点就安装。只需要一分钟。'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>做得好！</strong>您的电脑已是最新。保持更新是你保证安全最有效的一件事。'},
    ]), {}));

    // ---------- Course: Moving on from Windows 10 ----------
    function win10Settings(ctx, page) {
        const tiles = [['tile-system', '⟦monitor⟧', '系统', '显示、声音、关于'], ['tile-devices', '⟦printer⟧', '设备', '蓝牙、打印机'], ['tile-network', '⟦globe⟧', '网络和 Internet', 'Wi-Fi'],
                       ['tile-accounts', '⟦user⟧', '账户', '您的账户'], ['tile-update', '⟦refresh-cw⟧', '更新和安全', 'Windows 更新']];
        let inner;
        if (page === 'home') inner = `<div class="nv">${tiles.map(([id, ic, t, s]) => `<button type="button" data-tap="${id}"><span>${ic}</span><strong>${t}</strong><small>${s}</small></button>`).join('')}</div>`;
        else if (page === 'about') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>About</h3><div class="zk"><div><span>Edition</span><b>Windows 10 Home</b></div><div><span>Version</span><b>22H2</b></div><div><span>Device name</span><b>MARGARET-LAPTOP</b></div></div>`;
        else if (page === 'update') inner = `<button type="button" class="tj" data-tap="back">← Home</button><h3>Windows Update</h3>
            ${ctx.enrolled ? '<p class="mj">⟦check⟧ 您的电脑已加入扩展安全更新</p><p class="cf">安全更新持续到 2027 年 10 月 12 日。</p>' : `<div class="ahg"><strong>Windows 10 支持已结束</strong><p>您的电脑不满足运行 Windows 11 的要求。加入扩展安全更新，才能继续获得安全更新。</p>
            <button type="button" class="ce co bz" data-tap="enroll">立即加入</button></div>`}`;
        else inner = `<h3>扩展安全更新</h3><p class="cf">选择加入方式：</p>
            <button type="button" class="ck" data-tap="esu-backup"><strong>备份您的电脑设置</strong><small>免费，需要 Microsoft 账户</small></button>
            <button type="button" class="ck" data-tap="esu-points"><strong>使用 1,000 Microsoft Rewards 积分</strong></button>
            <button type="button" class="ck" data-tap="esu-buy"><strong>一次性购买</strong><small>付费</small></button>${ctx.busy ? '<p class="cf">正在加入……</p>' : ''}`;
        return pcWin('windows', '设置', `<div class="ahh">${inner}</div>`, {cls: 'settings w10'});
    }
    const w10 = (opts = {}) => desk('windows', {win10: true, ...opts});

    pcLesson('pc-check-windows', () => withCtx([
        {screen: () => w10(), target: 'start', say: '如果您的电脑看起来像这样，“开始”在最左边，那它可能是 <strong>Windows 10</strong>。我们来检查一下。<strong>点击“开始”。</strong>'},
        {screen: () => w10({overlay: startMenu('windows')}), target: 'open-settings', say: '<strong>点击“设置”</strong>（齿轮图标）。'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-system', say: '<strong>点击“系统”。</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}),
         question: {q: '上面写着 Windows 10 家庭版。在 2026 年这意味着什么？', options: [
            {t: 'Microsoft 在 2025 年 10 月停止了常规支持。它仍能用，但需要扩展安全更新才能保持安全', ok: true,
             why: '对。面向家庭用户的免费扩展安全更新计划现在持续到 2027 年 10 月 12 日。在那之后，Windows 10 不再有安全修复。'},
            {t: '没什么，Windows 10 会永远更新下去', why: '常规支持已于 2025 年 10 月结束。扩展安全更新现在持续到 2027 年 10 月 12 日，之后就会停止。'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'about')}), target: 'back', say: '<strong>点击“← 主页”</strong>返回。'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'home')}), target: 'tile-update', say: '<strong>点击“更新和安全”。</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), target: 'enroll', say: '这台笔记本电脑对 Windows 11 来说太旧了，所以 Windows 提供<strong>扩展安全更新</strong>。<strong>点击“立即加入”。</strong>'},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'esu')}), target: 'esu-backup', action: c => { c.enrolled = true; },
         say: '免费的方式是把您的设置备份到 Microsoft 账户。<strong>点击“备份您的电脑设置”。</strong>', hints: {'esu-buy': '您不需要付费。请选择免费的备份选项。', 'esu-points': '如果您有积分，这样也行，但备份选项对所有人都是免费的。'}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}),
         question: {q: '在 2027 年 10 月之前，您有哪些选择？', options: [
            {t: '能升级就升级到 Windows 11、买一台新电脑，或把旧电脑换成 Linux Mint（免费）', ok: true, why: '对。Linux Mint 是免费的，在较旧的笔记本电脑上也运行得很好。接下来的课程会讲 Mac 和 Linux Mint 里各个东西在哪里。'},
            {t: '2027 年以后继续用 Windows 10 做银行业务', why: '2027 年 10 月以后它不再有安全修复，所以做银行业务不安全。请升级、换新或改用 Linux Mint。'}]}},
        {screen: c => w10({running: ['settings'], windows: win10Settings(c, 'update')}), done: true,
         say: '<strong>做得好！</strong>您知道自己用的是哪个 Windows，也知道怎样在 2027 年 10 月前保障它的安全了。要当心那些提出收费帮您“升级”的电话或弹窗：那是诈骗。'},
    ], {}), ['windows']);

    pcLesson('pc-mac-tour', () => withCtx([
        {screen: () => desk('mac'), target: 'app-browser',
         say: '从 Windows 换过来？在 Mac 上，应用放在底部的<strong>程序坞</strong>里，每个应用的菜单在顶部的<strong>菜单栏</strong>里。<strong>点击程序坞里的 Safari</strong>，也就是网页浏览器。'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', windows: pcWin('mac', 'Safari', browserHome('mac'))}), target: 'win-close',
         say: '在 Mac 上，窗口按钮在<strong>左上角</strong>。<strong>点击红色的那个</strong>来关闭窗口。'},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari'}), target: 'rc-dock-browser',
         say: '窗口不见了，但看到程序坞里 <strong>Safari 下面的圆点</strong>了吗？它仍在运行。要退出它，请<strong>在程序坞里的 Safari 上单击右键</strong>（触控板上用两根手指）。', hint: '在程序坞里的 Safari 图标上单击右键（或用两根手指点按）。',
         hints: {'app-browser': '普通单击会再次打开它。请改为单击右键。'}},
        {screen: () => desk('mac', {running: ['browser'], appName: 'Safari', overlay: '<div class="hc aek"><button type="button" data-tap="new-window">New Window</button><button type="button" data-tap="options">Options</button><button type="button" data-tap="menu-quit">Quit</button></div>'}),
         target: 'menu-quit', say: '<strong>点击“退出”。</strong><em>（快捷键是 ⟦command⟧ Cmd + Q。）</em>'},
        {screen: () => desk('mac'), target: 'apple-menu', say: '设置在左上角的<strong>苹果菜单</strong>（那个标志）下面。<strong>点击它。</strong>'},
        {screen: () => desk('mac', {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="restart-menu">Restart…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '“关机”和“重新启动”也在这里。<strong>点击“系统设置…”</strong>'},
        {screen: c => desk('mac', {running: ['settings'], appName: '系统设置', windows: settingsWin('mac', c, 'general')}),
         question: {q: '在 Windows 上复制是 Ctrl + C。在 Mac 上是什么？', options: [
            {t: '⟦command⟧ Cmd + C', ok: true, why: '对。大多数 Windows 快捷键在 Mac 上用 ⟦command⟧ Cmd 代替 Ctrl：⟦command⟧ C、⟦command⟧ V、⟦command⟧ Z、⟦command⟧ A。'},
            {t: 'Ctrl + C，一样', why: '在 Mac 上是 ⟦command⟧ Cmd + C。大多数 Ctrl 快捷键都变成 ⟦command⟧ Cmd。'}]}},
        {screen: c => desk('mac', {running: ['settings'], appName: '系统设置', windows: settingsWin('mac', c, 'general')}), done: true,
         say: '<strong>做得好！</strong>程序坞在底部，菜单在顶部，窗口按钮在左上角，用 ⟦command⟧ Cmd 代替 Ctrl，苹果菜单里有设置和关机。'},
    ], {}), ['mac']);

    pcLesson('pc-mint-tour', () => withCtx([
        {screen: () => desk('linux'), target: 'start',
         say: '<strong>Linux Mint</strong> 是一个免费系统，用起来和 Windows 很像，在较旧的电脑上也运行良好。您的应用在左下角的<strong>菜单</strong>里，就像“开始”按钮。<strong>点击“菜单”。</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-writer',
         say: 'Linux Mint 自带免费应用。写信可以用 <strong>LibreOffice Writer</strong>，它用起来像 Microsoft Word。<strong>点击它。</strong>'},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', '无标题 1 – LibreOffice Writer', '<div class="aju"><div class="yd">文件 编辑 视图 插入 格式 <b>B</b> <i>I</i> <u>U</u></div><div class="vk">尊敬的先生或女士：<span class="ts"></span></div></div>', {max: true})}),
         question: {q: '别人用邮件发给您的 Word 文档，您能打开吗？', options: [
            {t: '能。LibreOffice 可以打开和保存 Word (.docx) 文件', ok: true, why: '对。要保存文件发给 Word 用户时，请在“另存为”里选择 Word 格式 (.docx)。'},
            {t: '不能，需要 Windows 才行', why: 'LibreOffice 可以打开和保存 Word (.docx) 文件，所以您能和 Word 用户互相交换文档。'}]}},
        {screen: () => desk('linux', {running: ['writer'], pinned: ['files', 'browser', 'writer'], windows: pcWin('linux', '无标题 1 – LibreOffice Writer', '<div class="aju"><div class="vk">尊敬的先生或女士：</div></div>', {max: true})}),
         target: 'win-close', say: '窗口按钮在右上角，和 Windows 一样。<strong>点击 ⟦x⟧</strong> 关闭 Writer。'},
        {screen: () => desk('linux'), target: 'start', say: '现在我们看看到哪里获取更多应用。<strong>再次点击“菜单”。</strong>'},
        {screen: () => desk('linux', {overlay: startMenu('linux', [['writer', 'open-writer'], ['update', 'open-update']])}), target: 'open-store',
         say: '<strong>软件管理器</strong>是 Linux Mint 免费的应用商店。<strong>点击它。</strong>'},
        {screen: () => desk('linux', {running: ['store'], windows: pcWin('linux', '软件管理器', `<div class="jo"><div class="gq">${ICON.search}<span>搜索</span></div>
            <div class="aan">${['互联网', '办公', '图形', '音频和视频', '游戏', '无障碍'].map(t => `<span>${t}</span>`).join('')}</div><p class="cf">成千上万的免费应用，由 Linux Mint 检查过。</p></div>`, {max: true})}),
         question: {q: 'Linux Mint 需要购买杀毒软件吗？', options: [
            {t: '不需要。保持更新，从软件管理器获取应用，就有很好的保护', ok: true, why: '对。Linux 上的病毒很少。更新和内置防火墙就够用了。邮件和网站里的骗局仍然存在，所以要保持警惕。'},
            {t: '需要，要买最贵的', why: '不需要。保持更新，从软件管理器获取应用。照常提防邮件和网站里的骗局。'}]}},
        {screen: () => desk('linux'), done: true,
         say: '<strong>做得好！</strong>菜单在左下角，关闭按钮在右上角，写文档用 LibreOffice，上网用 Firefox，获取应用用软件管理器，更新看盾牌。'},
    ], {}), ['linux']);

    pcLesson('pc-move-files', (os) => withCtx([
        {screen: c => desk(os, {overlay: c.usb ? `<div class="ik">⟦usb⟧ U 盘已连接</div>` : '<button type="button" class="afo" data-tap="plug">Plug in USB stick</button>'}), target: 'plug', action: c => { c.usb = true; },
         say: '换电脑之前，先把文件复制到 <strong>U 盘</strong>里。把它插进电脑侧面的 USB 插口。这里请<strong>点击“插入 U 盘”</strong>。'},
        {screen: c => desk(os, {overlay: '<div class="ik">⟦usb⟧ U 盘已连接</div>'}), target: 'app-files', say: `<strong>打开 ${N.files[os]}。</strong>`},
        {screen: c => filesDesk(os, c, 'home'), target: 'rc-documents', action: c => { c.menu = [['menu-open', '打开'], ['menu-copy', '复制'], ['menu-rename', '重命名']]; c.menuAt = 'left:30%;top:22%'; },
         say: '您的信件在<strong>文档</strong>里。<strong>在“文档”文件夹上单击右键。</strong><em>（之后对“图片”也这样做。）</em>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'menu-copy', action: c => { c.menu = null; }, say: '<strong>点击“复制”。</strong>'},
        {screen: c => filesDesk(os, c, 'home'), target: 'side-usb', say: '您的 U 盘在左侧。<strong>点击“U 盘”。</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'rc-empty', action: c => { c.menu = [['menu-newfolder', newFolderLabel(os)], ['menu-paste', pasteLabel(os)]]; c.menuAt = 'left:45%;top:40%'; }, say: '它是空的。<strong>在空白处单击右键。</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-paste', action: c => { c.menu = null; c.copying = true; }, say: `<strong>单击 ${pasteLabel(os)}。</strong>`},
        {screen: c => filesDesk(os, {...c, copied: !c.busy, progress: c.busy ? '正在复制 214 项…… 还剩 1 分钟' : ''}, 'usb'), wait: 1400, target: 'rc-usb',
         action: c => { c.copied = true; c.menu = [['menu-eject', '推出']]; c.menuAt = 'left:6%;top:62%'; },
         say: '完成了！把 U 盘拔出来之前，先把它<strong>推出</strong>，免得损坏。<strong>在左侧的“U 盘”上单击右键。</strong>'},
        {screen: c => filesDesk(os, c, 'usb'), target: 'menu-eject', action: c => { c.menu = null; c.usb = false; }, say: '<strong>点击“推出”。</strong>这样才能放心拔出。'},
        {screen: c => filesDesk(os, c, 'home'), question: {q: '还有什么办法能把文件转到新电脑上？', options: [
            {t: '在线存储：OneDrive、iCloud 或 Google 云端硬盘', ok: true, why: '对。在旧电脑上传，在新电脑上登录，文件就在那里了。U 盘也是个不错的额外备份。'},
            {t: '把每个文件一个个用邮件发给自己', why: '那得花很长时间！请用 U 盘或 OneDrive、iCloud、Google 云端硬盘这样的在线存储。'}]}},
        {screen: c => filesDesk(os, c, 'home'), done: true, say: '<strong>做得好！</strong>在新电脑上，插上 U 盘，打开它，把文件夹复制到您的“文档”和“图片”里。'},
    ], {}));

    function chromeWin(os, ctx) {
        const bar = ctx.synced ? '<div class="xp">⟦star⟧ BBC 天气 ⟦star⟧ NHS App ⟦star⟧ Bridlington 公交时间 ⟦star⟧ 食谱</div>' : '';
        const profile = `<button type="button" class="aax" data-tap="profile" aria-label="Profile">${ctx.synced ? 'M' : '⟦user⟧'}</button>`;
        const menu = ctx.menu ? '<div class="hc" style="right:8px;top:62px"><span class="ajr">未登录</span><button type="button" data-tap="sync">开启同步……</button><button type="button" data-tap="guest">打开访客个人资料</button></div>' : '';
        const signin = ctx.signin ? `<div class="hr ca"><p><strong>使用 Google 账号登录</strong></p><p class="fd">margaret.smith@example.com</p><div class="afr">••••••••</div><p class="fd">（练习：已替您输入。）</p>
            <div class="jn"><button type="button" class="adg" data-tap="next">下一步</button></div></div>` : '';
        const confirm = ctx.confirm ? '<div class="hr ca"><p><strong>要开启同步吗？</strong></p><p class="fd">您的书签、密码和历史记录将保存到您的 Google 账号，并显示在您所有的设备上。</p><div class="jn"><button type="button" data-tap="cancel">取消</button><button type="button" class="adg" data-tap="yes-in">是，我要开启</button></div></div>' : '';
        return pcWin(os, 'Chrome', `<div class="aaw"><div class="tr"><span class="qm">新标签页</span>${profile}</div><div class="qn">⟦search⟧ 在 Google 上搜索，或输入网址</div>${bar}
            <div class="ju"><div class="rl">Chrome</div><input class="jv" data-fun-input="web" placeholder="Search" aria-label="Search"><p class="oi"></p>${ctx.busy ? '<p class="cf">正在同步您的书签……</p>' : ''}</div>${menu}${signin}${confirm}</div>`, {max: true});
    }
    pcLesson('pc-browser-sync', (os) => withCtx([
        {screen: () => desk(os, {pinned: ['files', 'chrome', 'store', 'settings']}), target: 'app-chrome',
         say: '如果您在旧电脑上用的是 <strong>Chrome</strong>，登录后就能把书签和保存的密码带到新电脑上。（Firefox 和 Edge 的做法一样。）<strong>点击“Chrome”。</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'profile', action: c => { c.menu = true; },
         say: '<strong>点击右上角的人形图标。</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'sync', action: c => { c.menu = false; c.signin = true; },
         say: '<strong>点击“开启同步……”</strong>', hints: {guest: '访客个人资料不会保存任何内容。请点击“开启同步”。'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'next', action: c => { c.signin = false; c.confirm = true; },
         say: '用您在旧电脑上用过的<strong>同一个 Google 账号</strong>登录。<strong>点击“下一步”。</strong>'},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, c)}), target: 'yes-in', action: c => { c.confirm = false; c.synced = true; },
         say: '<strong>点击“是，我要开启”。</strong>', hints: {cancel: '那样会停止同步。请点击“是，我要开启”。'}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: !c.busy})}), wait: 1400,
         question: {q: '您的书签回来了。把密码保存在浏览器里安全吗？', options: [
            {t: '安全，只要您的 Google 账号有强密码和两步验证', ok: true, why: '对。这比到处使用同一个密码安全得多。同时要用两步验证保护好账号本身。'},
            {t: '不，改为把它们写在屏幕上的便利贴上', why: '只要您的账号有两步验证，浏览器密码管理器比屏幕上的便条安全得多。'}]}},
        {screen: c => desk(os, {running: ['chrome'], pinned: ['files', 'chrome', 'store', 'settings'], appName: 'Chrome', windows: chromeWin(os, {...c, synced: true})}), done: true,
         say: '<strong>做得好！</strong>您的书签和密码都跟着过来了。在公共电脑或共用电脑上，不要开启同步。'},
    ], {}));

    // ---------- Course: Staying safe on a computer ----------
    function scareware(os, ctx) {
        if (ctx.left) return desk(os, {running: ['browser'], appName: N.browser[os]});
        const page = `<div class="uw"><strong>⚠️ ${os === 'mac' ? 'Apple' : os === 'windows' ? 'Windows' : '系统'} 安全警报 ⚠️</strong>
            <p>您的电脑已感染 5 种病毒！您的银行信息和照片面临风险。</p><p>请勿关闭电脑。立即致电技术支持：</p><b>0808 157 0123</b>
            <div class="ux"><button type="button" data-tap="call-btn">立即拨打</button><button type="button" data-tap="fake-close">关闭</button></div>
            <small>（这是练习用的诈骗页面。号码是假的。）</small></div>`;
        const leave = ctx.leaveAsk ? '<div class="hr"><p><strong>要离开此网站吗？</strong></p><p class="fd">您所做的更改可能不会被保存。</p><div class="jn"><button type="button" data-tap="stay">留下</button><button type="button" class="adg" data-tap="leave">离开</button></div></div>' : '';
        if (!ctx.exited) return `<div class="vo">${page}<div class="jx">${keyBtn('keys-escape', 'Esc')}</div>${leave}</div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, N.browser[os], `<div class="aaw"><div class="tr"><span class="qm">Security Alert <button type="button" data-tap="tab-close" aria-label="Close tab">⟦x⟧</button></span></div><div class="qn">⚠️ http://pc-help-alert.example.top</div>${page}</div>`, {max: true}) + leave});
    }
    pcLesson('pc-scareware', (os) => withCtx([
        {screen: c => scareware(os, c), question: {q: '您在浏览网页时，这个页面突然占满了屏幕。它是真的吗？', options: [
            {t: '不是。这是一个假网站，想吓得您打电话给骗子', ok: true, why: '没错。真正的警告绝不会显示一个让您拨打的电话号码。不要打电话，也不要点页面上的任何东西。'},
            {t: '是真的，赶紧打电话', why: '千万别打。这是假页面。那些“技术支持”人员会设法控制您的电脑和您的钱。'}]}},
        {screen: c => scareware(os, c), target: 'keys-escape', action: c => { c.exited = true; },
         say: '它占满了整个屏幕，让您看不到怎么关闭。按键盘左上角的 <strong>Esc</strong> 键退出全屏。',
         hints: {'call-btn': '千万别！请按 Esc 键。', 'fake-close': '页面上的按钮可能是陷阱。请改为按键盘上的 Esc 键。'}},
        {screen: c => scareware(os, c), target: 'tab-close', action: c => { c.leaveAsk = true; }, say: '现在您能看到浏览器了。用标签页上的 ⟦x⟧ <strong>关闭这个标签页</strong>。',
         hints: {'call-btn': '不要点页面上的任何东西。用标签页自己的 ⟦x⟧ 来关闭它。', 'fake-close': '那是诈骗页面的一部分。请用标签页本身的 ⟦x⟧。'}},
        {screen: c => scareware(os, c), target: 'leave', action: c => { c.leftAsk = false; c.left = true; }, say: '它想把您留在那里。<strong>点击“离开”。</strong>', hints: {stay: '点击“离开”。'}},
        {screen: c => scareware(os, c), question: {q: '如果怎么都关不掉呢？', options: [
            {t: os === 'windows' ? '按 Ctrl + Shift + Esc 打开任务管理器，选中浏览器，点击“结束任务”' : os === 'mac' ? '按 ⟦command⟧ Cmd + Option + Esc，然后强制退出浏览器' : '在面板上右键单击浏览器并选择“关闭”，或重新启动电脑',
             ok: true, why: '对。再次打开浏览器时，不要让它恢复旧的页面。重新启动电脑也可以。'},
            {t: '拨打那个号码，请他们帮忙关闭', why: '千万别拨。 ' + (os === 'windows' ? '用 Ctrl + Shift + Esc（任务管理器）来关闭浏览器。' : os === 'mac' ? '用 ⟦command⟧ Cmd + Option + Esc 强制退出。' : '从面板上关闭浏览器，或者重新启动。')}]}},
        {screen: c => scareware(os, c), done: true, say: '<strong>做得好！</strong>您的电脑根本没有被感染：那只是一个网页。如果您真的拨打了这样的号码，请联系您的银行，并用另一台设备修改您的密码。'},
    ], {}));

    function secWin(os, ctx) {
        if (os === 'windows') {
            return pcWin(os, 'Windows 安全中心', `<div class="aif"><h3>病毒和威胁防护</h3><p class="mj">⟦check⟧ 当前没有威胁</p>
                <p class="cf">上次扫描：${ctx.scanned ? 'just now (0 threats found)' : '3 days ago'}</p>${ctx.busy ? '<p class="cf">正在快速扫描…… 已扫描 12,840 个文件</p>' : (ctx.scanned ? '' : '<button type="button" class="ce co bz" data-tap="quick-scan">Quick scan</button>')}
                <div class="xd"><span>⟦check⟧ 病毒防护</span><span>⟦check⟧ 防火墙</span><span>⟦check⟧ 应用和浏览器控制</span></div></div>`, {cls: 'settings'});
        }
        return pcWin(os, '防火墙配置', `<div class="aif"><div class="cj ex"><span>Status</span><button type="button" class="wp" data-tap="fw-toggle" aria-label="Firewall on or off">${tog(!!ctx.fwOn)}</button></div>
            <p class="cf">Incoming: Deny · Outgoing: Allow</p>${ctx.fwOn ? '<p class="mj">⟦check⟧ 防火墙已开启</p>' : ''}</div>`, {cls: 'settings'});
    }
    pcLesson('pc-security-check', (os) => withCtx((os === 'windows' ? [
        {screen: () => desk(os), target: 'start', say: 'Windows 自带免费的杀毒软件，叫 <strong>Windows 安全中心</strong>。我们来检查它是否在正常工作。<strong>点击“开始”。</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os)}), target: 'open-settings', say: '<strong>点击“设置”。</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'home')}), target: 'side-privacy', say: '<strong>点击左侧的“隐私和安全性”。</strong>'},
        {screen: c => desk(os, {running: ['settings'], windows: settingsWin(os, c, 'privacy')}), target: 'win-security', say: '<strong>点击“Windows 安全中心”。</strong>'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, c)}), target: 'quick-scan', action: c => { c.scanned = true; },
         say: '绿色对勾表示您受到保护。为了放心，<strong>点击“快速扫描”</strong>。'},
        {screen: c => desk(os, {running: ['shield'], pinned: ['files', 'browser', 'shield'], windows: secWin(os, {...c, scanned: !c.busy})}), wait: 1400,
         question: {q: '还需要再花钱买另一款杀毒软件吗？', options: [
            {t: '不需要。Windows 安全中心对大多数人来说够用了，两个一起装还会拖慢电脑', ok: true, why: '对。保持 Windows 更新，并开着 Windows 安全中心。付费的往往只是多了弹窗和订阅。'},
            {t: '需要，越多越好', why: '两个杀毒程序可能互相冲突，拖慢速度。Windows 安全中心对大多数人来说够用了。'}]}},
    ] : os === 'mac' ? [
        {screen: () => desk(os), target: 'apple-menu', say: 'Mac 自带免费的保护，会在后台检查应用和文件。我们来检查其中一项设置。<strong>点击苹果菜单</strong>（那个标志）。'},
        {screen: () => desk(os, {overlay: '<div class="gv"><button type="button" data-tap="about" data-fun="about">About This Mac</button><button type="button" data-tap="menu-settings">System Settings…</button><button type="button" data-tap="shutdown">Shut Down…</button></div>'}),
         target: 'menu-settings', say: '<strong>点击“系统设置…”</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, c, 'general')}), target: 'side-privacy', say: '<strong>点击左侧的“隐私与安全性”。</strong>'},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, c, 'privacy')}),
         question: {q: '选中的是“允许从 App Store 和已知开发者下载的 App”。应该改吗？', options: [
            {t: '不，保持原样。它会阻止来自未知开发者的应用', ok: true, why: '对。如果有网站叫您改掉这项设置才能安装东西，那是很大的警示信号。'},
            {t: '改，允许来自任何位置的应用', why: '保持原样。它会阻止来自未知开发者的应用。网站叫您改掉它，就是警示信号。'}]}},
        {screen: c => desk(os, {running: ['settings'], appName: '系统设置', windows: settingsWin(os, c, 'privacy')}),
         question: {q: 'Mac 需要购买杀毒软件吗？', options: [
            {t: '大多数人不需要。保持更新，只从可信的地方安装应用', ok: true, why: '对。更新和内置的保护就够用了。说您的 Mac 被感染的弹窗是诈骗。'},
            {t: '需要，哪个弹窗推荐就买哪个', why: '推销 Mac 杀毒软件的弹窗通常是诈骗。还是保持 Mac 更新吧。'}]}},
    ] : [
        {screen: () => desk(os), target: 'start', say: 'Linux Mint 自带<strong>防火墙</strong>，会阻止不需要的连接。它在您打开之前是关闭的。<strong>点击“菜单”。</strong>'},
        {screen: () => desk(os, {overlay: startMenu(os, [['fw', 'open-firewall']])}), target: 'open-firewall', say: '<strong>点击“防火墙”。</strong><em>（如果看不到，可以在“菜单”里搜索“firewall”。）</em>'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}), target: 'fw-toggle', action: c => { c.fwOn = true; }, say: '<strong>点击“状态”开关</strong>来打开防火墙。'},
        {screen: c => desk(os, {running: ['fw'], pinned: ['files', 'browser', 'fw'], windows: secWin(os, c)}),
         question: {q: '还有什么能保障 Linux Mint 的安全？', options: [
            {t: '盾牌上出现圆点时安装更新，并从软件管理器获取应用', ok: true, why: '对。还有平常的规矩：对邮件链接和弹窗要小心。'},
            {t: '不需要别的了', why: '持续安装更新，并从软件管理器获取应用。邮件和网站里的骗局仍然存在。'}]}},
    ]).concat([
        {screen: () => desk(os), done: true, say: '<strong>做得好！</strong>您电脑的内置保护已开启。及时更新、小心链接、只从可信的地方安装，其余的就靠这些了。'},
    ]), {}));

    function webmail(os, ctx) {
        const inbox = `<div class="aat"><button type="button" class="lx lt" data-tap="open-scam"><strong>Parcel Delivery</strong><span>我们没遇到您：今天请重新安排投递</span></button>
            <div class="lx"><strong>Sarah</strong><span>周日的照片</span></div><div class="lx"><strong>Bridlington Walkers</strong><span>星期六的散步</span></div></div>`;
        const mail = `<div class="aau"><p><strong>Parcel Delivery</strong> &lt;support@parcel-redelivery.example.top&gt;</p><p>我们今天试图投递您的包裹，但家里没人。重新安排投递需要支付 £1.45 的费用。</p>
            <a class="aho" data-hover="hover-link" data-tap="click-link" role="button" tabindex="0">重新安排投递</a>
            ${ctx.hovered ? '<p class="aea">http://parcel-redelivery.example.top/pay-fee</p>' : ''}
            <div class="vh"><button type="button" data-tap="report">⟦flag⟧ 举报网络钓鱼</button><button type="button" data-tap="reply">回复</button></div></div>`;
        return desk(os, {running: ['browser'], appName: N.browser[os], windows: pcWin(os, '邮件', `<div class="akq">${ctx.opened && !ctx.reported ? mail : inbox}${ctx.reported ? '<p class="mj">⟦check⟧ 已举报并移到垃圾邮件</p>' : ''}</div>`, {max: true})});
    }
    pcLesson('pc-email-links', (os) => withCtx([
        {screen: c => webmail(os, c), target: 'open-scam', action: c => { c.opened = true; }, say: '这是您在浏览器里的邮件。<strong>打开 Parcel Delivery 的邮件。</strong>'},
        {screen: c => webmail(os, c), target: 'hover-link', action: c => { c.hovered = true; },
         say: '在电脑上，您可以<strong>不点击</strong>就查看链接真正通向哪里。<strong>把鼠标移到“重新安排投递”上</strong>，保持不动。<em>（在触摸屏上，按住它。）</em>',
         hints: {'click-link': '不要点击！只要把鼠标指针停在上面。'}, hint: '把鼠标指针停在蓝色链接上，不要点击。'},
        {screen: c => webmail(os, c), question: {q: '真正的地址显示在底部：parcel-redelivery.example.top。它安全吗？', options: [
            {t: '不安全。它不是真正的快递公司的网站，而且他们还要收费', ok: true, why: '对。快递公司不会通过邮件或短信收取小额费用。真实的网址暴露了它。'},
            {t: '安全，里面有“parcel”（包裹）这个词', why: '谁都可以在网址里放“parcel”。它不是真正的快递公司，而那笔费用就是诈骗。'}]}},
        {screen: c => webmail(os, c), target: 'report', action: c => { c.reported = true; }, say: '<strong>点击“举报网络钓鱼”。</strong>您也可以把诈骗邮件转发到 report@phishing.gov.uk。', hints: {reply: '绝不要回复骗子。请点击“举报网络钓鱼”。', 'click-link': '不要点链接！改为举报它。'}},
        {screen: c => webmail(os, c), done: true, say: '<strong>做得好！</strong>点击之前先悬停查看：如果地址和公司对不上，就不要点。'},
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
        '*#06#': 'IMEI：35 209900 176148 1（练习号码）。这就是查找手机 IMEI 的真正代码。',
        '999': '这是一部练习手机，所以不能拨打 999。真遇到紧急情况，请拨打 999 或 112。',
        '112': '这是一部练习手机，所以不能拨打 112。在英国和整个欧洲，112 和 999 的作用一样。',
        '159': '159 会安全地接通您自己的银行。如果一个关于您钱款的电话让您担心，就用它。',
        '7726': '7726 是转发诈骗短信的号码。在旧手机键盘上它拼出“SPAM”！',
        '123': 'speaking-clock',
        '1471': '电话号码 07700 900842 今天 11:20 来过电话。（练习。1471 会告诉您座机上一个来电是谁。）',
        '01189998819991197253': '那是《IT 狂人》里的紧急电话号码。您试过关机再开机吗？',
        '101': '101 是非紧急情况下的报警电话。',
        '111': '111 是情况紧急但不属于危急时的 NHS 求助电话。',
    };
    function phDialer(screen, p, typed = '') {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
        const f = phOpen(screen, p, '电话', `<div class="akl"><div class="agr">${esc(typed) || '<span class="aia">输入号码</span>'}</div>
            <div class="vu">${keys.map(k => `<button type="button" data-fun="ph-key" data-k="${k}">${k}</button>`).join('')}</div>
            <div class="ags"><span></span><button type="button" class="yp" data-fun="ph-call" aria-label="Call">${UI.phone}</button><button type="button" class="agq" data-fun="ph-del" aria-label="Delete">⟦delete⟧</button></div>
            <p class="vt"></p></div>`, {cls: 'dial'});
        f.dataset.typed = typed;
        if (DIAL_EGGS[typed] && typed.startsWith('*')) f.querySelector('.vt').textContent = DIAL_EGGS[typed];
    }

    // ---------- Messages ----------
    const SMS_THREADS = [
        ['妈妈', '#f472b6', [['them', '我以为 LOL 是“lots of love”（满满的爱）。我一直在每条消息里都写这个！'], ['them', '难怪你姑姑没回你？'], ['them', '发自我的 iPad']]],
        ['未知', '#94a3b8', [['them', '恭喜！您赢得了一部免费手机。点击这里领取：prize-winner.example'], ['note', '这是诈骗。不要点链接：转发给 7726，然后删除。']]],
        ['Sarah', '#a78bfa', [['them', '爸爸在学用表情符号 😂'], ['them', '他发给我一个茄子，还说“今晚吃这个？”🍆']]],
        ['牙医', '#38bdf8', [['them', '提醒：您的预约在周二 10:30。回复 Y 确认。']]],
    ];
    const MUM_REPLIES = ['你是谁？', '给我打电话，我没戴眼镜看不了短信', '太好了！👍', '你收到我上一条消息了吗？我错发给猫了。', '发自我的 iPad', '好的，亲爱的 xx'];
    function phMessages(screen, p, open = -1) {
        const st = phState(screen);
        if (open < 0) {
            phOpen(screen, p, '信息', `<div class="ajm">${SMS_THREADS.map(([n, c, msgs], k) => `<button type="button" class="rx" data-fun="ph-thread" data-n="${k}">${avatar(n[0], c)}<span><strong>${n}</strong><small>${esc(msgs[0][1]).slice(0, 48)}…</small></span></button>`).join('')}</div>`);
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
            phOpen(screen, p, view === 5 ? '海鸥又出手了' : '照片', `<div class="agt" style="background:${bg}"><span>${ic}</span></div>${view === 5 ? '<p class="nc">在 Bridlington 海滨当场抓获。薯条没能追回。</p>' : ''}`);
            return;
        }
        phOpen(screen, p, '照片', `<div class="yt">${all.map(([ic, bg], k) => `<button type="button" data-fun="ph-photo" data-n="${k}" style="background:${bg}" aria-label="Photo ${k + 1}"><span>${ic}</span></button>`).join('')}</div>`);
    }

    // ---------- Clock (live), Weather, Maps ----------
    function phClock(screen, p) {
        const f = phOpen(screen, p, '时钟', `<div class="akn"><div class="aaj"></div><div class="yr"></div>
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
        phOpen(screen, p, '天气', `<div class="ajn${winter ? ' aiq' : ''}"><p class="adc">Bridlington</p><button type="button" class="vv" data-fun="ph-sun" aria-label="Today's weather">${winter ? '⟦snowflake⟧' : '⟦cloud-sun⟧'}</button>
            <p class="afd">${winter ? '4°' : '13°'}</p><p>${winter ? '寒冷，有小雪' : '晴间多云，有风'}</p>
            <div class="ajf">${[['周五', '⟦cloud-rain⟧', '11°'], ['周六', '⟦wind⟧', '10°'], ['周日', '⟦sun⟧', '14°'], ['周一', '⟦cloud-sun⟧', '12°']].map(([a, ic, t]) => `<div><b>${a}</b><span>${ic}</span>${t}</div>`).join('')}</div>
            <p class="nc">海鸥警告：<strong>高</strong>。请看好您的薯条。</p></div>`);
    }
    const MAP_EGGS = {narnia: '穿过衣橱，然后继续往前走，经过那根路灯柱。', home: '没有哪里比得上家。🏠', '月球': '238,855 英里。路上车不多。',
        chips: '最近的炸鱼薯条店：Bridlington 海滨随处都是。🍟', 'north pole': '圣诞老人的工坊。12 月前不营业。🎅', bridlington: 'Bridlington，East Riding of Yorkshire。好地方！',
        'flamborough': 'Flamborough Head：灯塔、悬崖和海鹦。🐦'};
    function phMaps(screen, p, note = '') {
        const f = phOpen(screen, p, null, `<div class="pr abh"><div class="ra"><span class="pt"></span>${note ? '<span class="alm"></span>' : ''}</div>
            <div class="rb"><label class="ln">${ICON.search}<input class="afc" placeholder="Search Maps" aria-label="Search Maps"></label></div>
            ${note ? `<div class="gz"><strong>${esc(note)}</strong></div>` : ''}</div>`, {cls: 'mapsf'});
        const inp = f.querySelector('.afc');
        inp.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const q = inp.value.trim().toLowerCase();
            phMaps(screen, p, MAP_EGGS[q] || (q ? `“${inp.value.trim()}”：这个练习地图只认识几个地方。试试 Bridlington、Flamborough 或 Narnia。` : ''));
        });
    }

    // ---------- Settings (with the developer-mode easter egg) ----------
    function phSettings(screen, p) {
        const st = phState(screen);
        const row = (id, label, on) => `<div class="ho"><span>${label}</span><button type="button" class="nw" data-fun="ph-toggle" data-k="${id}" aria-label="${label}">${tog(on)}</button></div>`;
        phOpen(screen, p, '设置', `<div class="aic">
            <div class="lq">${row('airplane', p === 'ios' ? '飞行模式' : '飞行模式', st.airplane)}${row('wifi', 'Wi-Fi', st.wifi)}${row('bt', '蓝牙', st.bt)}</div>
            <div class="lq">${row('dark', '深色模式', st.dark)}${row('dnd', '勿扰模式', st.dnd)}
                <div class="ho"><span>Text size</span><span class="te"><button type="button" data-fun="ph-text" data-d="-1" aria-label="Smaller">A</button><button type="button" data-fun="ph-text" data-d="1" class="tq" aria-label="Bigger">A</button></span></div></div>
            <div class="lq"><button type="button" class="ho" data-fun="ph-wall"><span>Wallpaper</span><span class="ne">›</span></button>
                <button type="button" class="ho" data-fun="ph-about"><span>${p === 'ios' ? '关于本机' : '关于手机'}</span><span class="ne">›</span></button></div></div>`);
    }
    function phAbout(screen, p) {
        phOpen(screen, p, p === 'ios' ? '关于本机' : '关于手机', `<div class="aic"><div class="lq">
            <div class="ho"><span>名称</span><b>Margaret 的手机</b></div>
            <div class="ho"><span>型号</span><b>${p === 'ios' ? 'iPhone Practice' : 'Practice Pixel'}</b></div>
            <button type="button" class="ho" data-fun="ph-osver"><span>${p === 'ios' ? 'iOS 版本' : 'Android 版本'}</span><b>${p === 'ios' ? '27 (practice)' : '17 (practice)'}</b></button>
            <div class="ho"><span>存储</span><b>足够存放孙辈的照片</b></div>
            ${p === 'android' ? '<button type="button" class="ho" data-fun="ph-build"><span>Build number</span><b>PRACTICE.2026.10</b></button>' : '<div class="ho"><span>序列号</span><b>P4R7-ACT1CE</b></div>'}
            </div><p class="nc agu"></p></div>`);
    }

    // ---------- Store with Snake ----------
    function phStore(screen, p) {
        const st = phState(screen);
        const apps = [['snake', '⟦gamepad-2⟧', '贪吃蛇 \'97', '老式手机上的经典游戏。'], ['torch', '⟦flashlight⟧', 'Super Bright Torch FREE', '含广告 · 含应用内购买'], ['knit', '⟦scissors⟧', '编织图样', '这个练习商店即将上架。']];
        phOpen(screen, p, p === 'ios' ? 'App Store' : 'Play 商店', `<div class="jo">${apps.map(([id, ic, n, d]) => `<div class="nh"><span class="ub">${ic}</span><div class="kc"><strong>${n}</strong><span>${d}</span></div>
            <button type="button" class="km" data-fun="ph-get" data-app="${id}">${st.installed.includes(id) ? '打开' : (p === 'ios' ? '获取' : '安装')}</button></div>`).join('')}<p class="nc xb"></p></div>`);
    }
    function phSnake(screen, p) {
        const st = phState(screen);
        const f = phOpen(screen, p, '贪吃蛇 \'97', `<div class="akp"><div class="ahc"><span>得分：<b class="ado">0</b></span><span>最高分：<b>${st.snakeBest}</b></span></div>
            <canvas width="240" height="240" class="aiz" aria-label="Snake game"></canvas><p class="vy">点按一个方向（或使用方向键）开始</p>
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
                f.querySelector('.vy').textContent = `游戏结束！得分 ${score}。点按一个方向再玩一次。`; return;
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
        screen.insertAdjacentHTML('beforeend', `<div class="vs ph-${p}">${statusBar(p)}<div class="ada">${t('airplane', '⟦plane⟧', '飞行模式', st.airplane)}${t('wifi', '⟦wifi⟧', 'Wi-Fi', st.wifi)}${t('bt', '⟦bluetooth⟧', '蓝牙', st.bt)}${t('dnd', '⟦moon⟧', '勿扰模式', st.dnd)}${t('torch', '⟦flashlight⟧', '手电筒', st.torch)}${t('dark', '⟦sun-moon⟧', '深色模式', st.dark)}</div>
            <label class="ut">⟦sun⟧<input type="range" min="30" max="100" value="${st.bright}" data-fun-range="bright" aria-label="Brightness"></label>
            <button type="button" class="sl" data-fun="ph-cc-close">${p === 'ios' ? '向上滑动以关闭' : '关闭'}</button></div>`);
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
                    const st = phState(screen); st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, getP()); phToast(screen, '新壁纸');
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
                if (egg === 'speaking-clock') { const t = today(); msg.textContent = `“第三声提示音时，时间是 ${t.getHours()} 点 ${String(t.getMinutes()).padStart(2, '0')} 分 ${t.getSeconds()} 秒……嘀，嘀，嘀。”（老式报时电话！）`; return; }
                msg.textContent = egg || (n ? '这部练习手机不能打真实的电话。试试 123、1471 或 *#06#……' : '请先输入一个号码。');
                return;
            }
            case 'ph-messages': return phMessages(screen, p);
            case 'ph-thread': return phMessages(screen, p, +el.dataset.n);
            case 'ph-send': {
                const inp = f.querySelector('.adb'), text = inp.value.trim(), t = +el.dataset.n;
                if (!text) return;
                st.sms.push({t, me: true, text});
                if (t === 0) st.sms.push({t, me: false, text: MUM_REPLIES[Math.floor(Math.random() * MUM_REPLIES.length)]});
                if (t === 1) st.sms.push({t, me: false, text: '请发送您的银行信息来领取奖品！！！（这是诈骗。屏蔽这个号码。）'});
                if (t === 3 && /^y(es)?$/i.test(text)) st.sms.push({t, me: false, text: '谢谢，您的预约已确认。🦷'});
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
            case 'ph-mail': return phOpen(screen, p, '邮件', `<div class="ajm">${MAILS.map(([from, subj, body], k) => `<details class="nb"><summary><strong>${esc(from)}</strong><small>${esc(subj)}</small></summary>${esc(body).split('\n').map(l => `<p>${l}</p>`).join('')}</details>`).join('')}</div>`);
            case 'ph-clock': return phClock(screen, p);
            case 'ph-sw': { const sw = f._sw; if (sw.run) { sw.acc += Date.now() - sw.t0; sw.run = false; el.textContent = '开始'; } else { sw.t0 = Date.now(); sw.run = true; el.textContent = '停止'; } return; }
            case 'ph-sw-reset': f._sw = {run: false, t0: 0, acc: 0}; f.querySelector('.td').textContent = '00:00.0'; f.querySelector('[data-fun="ph-sw"]').textContent = '开始'; return;
            case 'ph-weather': return phWeather(screen, p);
            case 'ph-sun': { st.sunTaps = (st.sunTaps || 0) + 1; if (st.sunTaps % 5 === 0) phToast(screen, '⟦sun⟧ 防晒霜涂好了！简直就是 Bridlington 的科斯塔海岸。'); el.classList.remove('afh'); void el.offsetWidth; el.classList.add('afh'); return; }
            case 'ph-maps': return phMaps(screen, p);
            case 'ph-settings': return phSettings(screen, p);
            case 'ph-toggle': case 'ph-cc': {
                const k = el.dataset.k; st[k] = !st[k];
                if (k === 'torch' && st.torch) phToast(screen, '⟦flashlight⟧ 手电筒已打开。（屏幕会发亮，而不是背面的灯。）');
                if (k === 'airplane') phToast(screen, st.airplane ? '⟦plane⟧ 飞行模式已开启：不能打电话、发短信或使用手机流量。' : '飞行模式已关闭。');
                if (what === 'ph-cc') { screen.querySelector('.vs').remove(); phControl(screen, p); } else phSettings(screen, p);
                phDecorate(screen, p);
                return;
            }
            case 'ph-cc-close': { const c = screen.querySelector('.vs'); if (c) c.remove(); return; }
            case 'ph-text': st.text = Math.max(-1, Math.min(4, st.text + +el.dataset.d)); return phSettings(screen, p);
            case 'ph-wall': st.wall = (st.wall + 1) % PH_WALLS.length; phDecorate(screen, p); phToast(screen, '壁纸已更换。回到主屏幕看看吧！'); return;
            case 'ph-about': return phAbout(screen, p);
            case 'ph-build': {
                st.build++;
                const note = f.querySelector('.agu');
                note.textContent = st.build >= 7 ? '⟦party-popper⟧ 您现在是开发者了！（一个真正的 Android 小秘密：连续点按“版本号”7 次。）' : st.build >= 3 ? `距离成为开发者，您还差 ${7 - st.build} 步。` : '';
                return;
            }
            case 'ph-osver': {
                st.osTaps = (st.osTaps || 0) + 1;
                if (st.osTaps % 3 === 0) {
                    const egg = document.createElement('div'); egg.className = 'pv'; egg.innerHTML = p === 'ios' ? '<span>✨</span><b>谢谢您的练习！</b>' : '<span>🤖</span><b>Practice 17</b>';
                    f.appendChild(egg); setTimeout(() => egg.remove(), 2600);
                }
                return;
            }
            case 'ph-store': return phStore(screen, p);
            case 'ph-get': {
                const id = el.dataset.app;
                if (id === 'torch') { f.querySelector('.xb').textContent = '您不需要手电筒应用：手机的快捷设置里就自带。免费的手电筒应用往往满是广告，甚至更糟！'; return; }
                if (id === 'knit') { f.querySelector('.xb').textContent = '在练习商店里只是摆设。'; return; }
                if (st.installed.includes(id)) return phSnake(screen, p);
                el.textContent = '正在安装……'; el.disabled = true;
                setTimeout(() => { st.installed.push(id); if (el.isConnected) { el.textContent = '打开'; el.disabled = false; } }, 900);
                return;
            }
            case 'ph-generic': return phOpen(screen, p, el.dataset.label || '应用', `<div class="akm"><span>${el.querySelector ? (el.querySelector('.ha') || {}).outerHTML || '' : ''}</span><p>这个练习应用属于它自己的一节课。去看看“学习”里的课程，好好试一试吧。</p></div>`);
            case 'ph-jiggle-done': { const h = screen.querySelector('.gr'); if (h) { h.classList.remove('ug'); el.remove(); } return; }
            case 'ph-status': {
                // Tapping the clock five times quickly: confetti.
                st.taps = st.taps.filter(t => Date.now() - t < 2000).concat(Date.now());
                if (st.taps.length >= 5) {
                    st.taps = [];
                    const c = document.createElement('div'); c.className = 'ob';
                    c.innerHTML = Array.from({length: 24}, (_, k) => `<i style="left:${(k * 41) % 100}%;background:hsl(${k * 47},85%,55%);animation-delay:${(k % 6) * 0.08}s"></i>`).join('');
                    screen.appendChild(c); setTimeout(() => c.remove(), 2200); phToast(screen, '⟦party-popper⟧ 您发现了一个秘密！');
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
        const head = `${avatar(call.letter, call.color)}<strong>${call.name}</strong><small>${phase === 'ring' ? call.number : phase === 'end' ? '通话已结束' : '0:' + String(call.secs || 8).padStart(2, '0')}</small>${call.tag && phase === 'ring' ? `<em class="aee">${call.tag}</em>` : ''}`;
        if (phase === 'ring') {
            return `<div class="fv ${p}">${statusBar(p)}<div class="fh">${head}</div>
                <div class="fb"><button type="button" class="kp" data-tap="decline" aria-label="Decline">${UI.hangup}</button><button type="button" class="tn" data-tap="answer" aria-label="Answer">${UI.phone}</button></div>
                <p class="je"><span>Decline</span><span>Answer</span></p>${homeIndicator(p)}</div>`;
        }
        return `<div class="fv ${p}">${statusBar(p)}<div class="fh bz">${head}</div>
            ${line ? `<p class="hi"><b>${call.name === '未知' ? '来电者' : call.name}:</b> “${line}”</p>` : ''}
            <div class="fb za"><button type="button" class="kp" data-tap="hangup" aria-label="Hang up">${UI.hangup}</button></div>${homeIndicator(p)}</div>`;
    }

    const SCAM_CALLS = [
        {letter: '?', color: '#64748b', name: '未知', number: '0161 496 0423', who: 'm', tag: '不在您的通讯录里',
         intro: '您的手机响了。这个号码没有保存在您的通讯录里。<strong>接听它</strong>来练习。<em>把声音调大才能听到来电者。</em>',
         lines: [
            {text: '你好，我是 Mark，来自您银行的反欺诈团队。我们发现您的账户上有一些可疑的付款。在我继续之前，您能确认一下您的全名、出生日期，以及银行卡上那一长串号码吗？',
             q: '来电的人说他来自您的银行。您怎么办？', options: [
                {t: '把信息给他，他是银行的', why: '给您打电话的银行绝不会索要您完整的卡号。骗子就是这样骗走您的信息的。'},
                {t: '说您会用银行卡上的号码回拨给银行，然后挂断', ok: true, why: '没错。拨打您银行卡上的号码，可以的话用另一部手机，或者拨打 159。'},
                {t: '让他证明自己的身份', why: '骗子说得很有说服力，而且往往已经知道您的一些信息。最安全的办法是挂断，自己打电话给银行。'}]},
            {text: '请别挂断！犯罪分子现在正从您的账户里转走钱。您需要把所有钱转到一个我给您设立的安全账户里。我们必须在接下来十分钟内完成。',
             q: '他说情况紧急，您必须转移资金。现在怎么办？', options: [
                {t: '赶紧转钱，免得来不及', why: '根本没有什么“安全账户”。您的银行绝不会要您转移资金。这就是骗局。'},
                {t: '挂断。真正的银行绝不会让您把钱转到“安全账户”', ok: true, why: '对。催得急和“安全账户”就是破绽。挂断并拨打 159。'}]}],
         hang: '按红色按钮挂断。'},
        {letter: '?', color: '#64748b', name: '未知', number: '020 7946 0815', who: 'robot', tag: '不在您的通讯录里',
         intro: '又来了一个电话。<strong>接听它。</strong>',
         lines: [
            {text: '这是来自 H M R C 的自动语音消息。已针对您未缴的税款签发逮捕令。要与官员通话，请立即按 1。',
             q: '一个录音声音说您会因为税务问题被逮捕。您怎么办？', options: [
                {t: '按 1 来解决', why: '按 1 会把您转给骗子，他们会要求您付款，往往是礼品卡。HMRC 绝不会通过录音消息威胁逮捕。'},
                {t: '挂断。HMRC 不会打电话威胁逮捕', ok: true, why: '没错。HMRC 会先给您写信，绝不会在电话里威胁逮捕。'}]}],
         hang: '挂断。'},
        {letter: '?', color: '#64748b', name: '未知', number: '0113 496 0332', who: 'm', tag: '不在您的通讯录里',
         intro: '您的手机又响了。<strong>接听它。</strong>',
         lines: [
            {text: '你好，我是 Windows 技术部门的。您的电脑一直在给我们发送错误消息，而且有一个非常危险的病毒。请去打开您的电脑，我来帮您修复。',
             q: '他说您的电脑有病毒。您怎么办？', options: [
                {t: '把电脑打开，按他说的做', why: '他会让您安装一个能让他控制您电脑的程序，然后向您要钱。Microsoft 绝不会这样打电话。'},
                {t: '挂断。电脑公司不会打电话说病毒的事', ok: true, why: '没错。绝不要让来电的人进入您的电脑。'},
                {t: '解释说您没有电脑', why: '您不需要解释或争辩。直接挂断就行。'}]}],
         hang: '挂断。'},
        {letter: '?', color: '#64748b', name: '未知', number: '0808 157 0190', who: 'f', tag: '不在您的通讯录里',
         intro: '又来了一个电话。<strong>接听它。</strong>',
         lines: [
            {text: '你好。您的网购账户下了一个新 iPhone 的订单，价格九百九十九英镑。如果这不是您下的订单，请按 1 取消订单并与我们的团队通话。',
             q: '您没订过 iPhone。您怎么办？', options: [
                {t: '按 1 取消订单', why: '按 1 会把您转给骗子，他们会以“退款”为名，向您索要银行信息或控制您的电脑。'},
                {t: '挂断，然后自己在 App 或网站上查看账户', ok: true, why: '对。如果真有订单，您会在账户里看到。绝不要使用来电者给您的号码或按钮。'}]}],
         hang: '挂断。'},
        {letter: 'S', color: '#16a34a', name: '诊所', number: '01632 960211', who: 'f', tag: '已保存在您的通讯录里',
         intro: '还有一个电话：这次是全科医生诊所打来的，已保存在您的通讯录里。<strong>接听它。</strong>',
         lines: [
            {text: '你好，我是诊所的 Sue。提醒一下，您的流感疫苗预约在周二十点。您什么都不用做。如果需要改期，请打我们平时的号码。再见！',
             q: '这个电话是诈骗吗？', options: [
                {t: '是：挂断并屏蔽这个号码', why: '这个没问题！她没要求任何东西，没催您，还让您打平时的号码。'},
                {t: '很可能是真的：她没要钱或信息，还让您打平时的号码', ok: true, why: '没错。真正的电话不会给您施压。如果有任何不确定，就用您已有的号码回拨。'}]}],
         hang: '通话结束了。<strong>点按红色按钮</strong>挂断。'},
    ];

    SCENARIOS['scam-calls'] = (p) => withCtx([
        ...SCAM_CALLS.flatMap((call, n) => [
            {screen: () => trainerCall(p, call, 'ring'), target: 'answer', say: `<strong>第 ${n + 1} 个电话，共 ${SCAM_CALLS.length} 个。</strong>${call.intro}`,
             hints: {decline: '在现实中，不接不认识的号码也没问题！这次练习请点按绿色按钮接听。'}},
            ...call.lines.map((line, k) => ({screen: () => trainerCall(p, {...call, secs: 6 + k * 14}, 'talk', line.text), speak: {text: line.text, who: call.who}, question: {q: line.q, options: line.options}})),
            {screen: () => trainerCall(p, {...call, secs: 6 + call.lines.length * 14}, 'talk', call.lines[call.lines.length - 1].text), target: 'hangup', say: call.hang},
        ]),
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), question: {q: '下面哪一项是诈骗电话的迹象？', options: [
            {t: '被催促、被威胁，或被要求保密', ok: true, why: '对。施压是最大的破绽。真正的来电者乐意让您慢慢来，之后再回拨。'},
            {t: '来电者知道您的名字', why: '骗子常常知道您的名字，甚至一些账户信息。仅凭这一点不能说明电话是真的。'},
            {t: '号码看起来是本地的', why: '骗子能让任何号码显示在您的屏幕上，哪怕是本地号码或您银行的号码。不要相信号码。'}]}},
        {screen: () => trainerCall(p, SCAM_CALLS[4], 'end'), done: true,
         say: '<strong>做得好！</strong>您挂断了四个骗子的电话，还认出了真正的来电。记住：有疑问就挂断，再用您信任的号码回拨。银行请拨打 159。'},
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
            ios: ['iPhone', 'Apple 出品'], android: ['Android（安卓）', '三星、Google Pixel、Motorola 等'],
            windows: ['Windows', '大多数笔记本电脑和台式机'], mac: ['Mac', 'Apple 出品：MacBook、iMac'], linux: ['Linux', 'Linux Mint、Ubuntu 等'],
        };
        const notSure = isPC
            ? '看看您的屏幕。Windows 在底部有一个“开始”按钮（四个小方块）。Mac 在左上角有一个苹果标志。Linux Mint 在左下角有一个“菜单”按钮。'
            : 'iPhone 的背面有一个 Apple 标志（被咬了一口的苹果）。如果您的没有，那几乎肯定是 Android 手机。';

        root.innerHTML = `
            <div class="ix" hidden>
                <h3>${isPC ? '您用的是哪种电脑' : '您用的是哪种手机'}？</h3>
                <div class="gb${OSES.length > 2 ? ' aft' : ''}">
                    ${OSES.map(o => `<button type="button" data-platform="${o}"><strong>${CHOICES[o][0]}</strong><span>${CHOICES[o][1]}</span></button>`).join('')}
                </div>
                <details><summary>不确定？</summary><p>${notSure}</p></details>
            </div>
            <div class="lr" hidden>
                <div class="io">
                    <p class="xg"></p>
                    <div class="vx" tabindex="-1" aria-live="polite"></div>
                    <div class="kl"></div>
                    <p class="nf" role="status"></p>
                    <div class="adm">
                        <button type="button" class="bw afg" hidden>指给我看</button>
                        <button type="button" class="bw yz" hidden>⟦volume-2⟧ 再听一遍</button>
                        <button type="button" class="bu sim-voice" hidden></button>
                        <button type="button" class="bu yy">返回上一步</button>
                        <button type="button" class="bu abm"${OSES.length < 2 ? ' hidden' : ''}>切换${isPC ? 'computer' : 'phone'}</button>
                    </div>
                </div>
                <div class="iy">
                    <p class="pz">模拟${isPC ? '电脑' : '手机'}：不是真的。您在这里做的任何事都不会发送到任何地方。</p>
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
        const voiceLabel = () => { voiceBtn.textContent = simVoiceOn() ? '关闭语音' : '打开语音'; };
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
            showBtn.textContent = '返回课程';
        }

        function render(focus = true) {
            const step = steps[i];
            wandering = false;
            showBtn.textContent = '指给我看';
            const prevTitle = isPC ? (screen.querySelector('.ev:not(.qf) .ka') || {}).textContent : null;
            misses = 0;
            hint.textContent = '';
            showBtn.hidden = true;
            count.textContent = step.done ? '完成了！' : `第 ${i + 1} 步，共 ${steps.length - 1} 步`;
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
                explain.innerHTML = `<p class="ns ${o.ok ? 'right' : 'afw'}">${o.ok ? '对了！' : '不太对。'}</p><p>${o.why}</p>`;
                if (o.ok) {
                    buttons.forEach(x => { x.disabled = true; });
                    b.classList.add('ss');
                    explain.insertAdjacentHTML('beforeend', '<button type="button" class="ap aff">继续</button>');
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
            question.innerHTML = `<div class="abl"><button type="button" class="bw adl">再试一次</button>${pageNext
                ? `<button type="button" class="ap vb">做得好！${last ? '现在完成课程' : '不如试试下一课'} &rarr;</button>` : ''}</div>`;
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
                hint.textContent = (step.hints && step.hints[id]) || ('不太对。 ' + (step.hint || '再看一遍说明。'));
                misses += 1;
                if (misses >= 2) showBtn.hidden = false;
                return;
            }
            if (id === step.target) {
                // Some steps need something done first, e.g. a message typed before tapping Send.
                if (step.require && !step.require(ctx)) {
                    hint.textContent = step.requireHint || '还不太对。再看一遍说明。';
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
            hint.textContent = (step.hints && step.hints[id]) || ('不太对。 ' + (step.hint || '再看一遍说明。'));
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
                    const label = (appEl.querySelector('span:last-child') || {}).textContent || '应用';
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
                else hint.textContent = '单击右键：按鼠标的右键。在 Mac 触控板上，用两根手指单击。在触摸屏上，按住不放。';
                return;
            }
            const hold = e.target.closest('[data-hold]');
            if (hold) {
                if (e.detail === 0) handleTap(hold.dataset.hold, true);  // Enter or Space
                else if (!held) hint.textContent = '手指（或鼠标键）一直按在上面，直到出现反应。';
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
                showBtn.textContent = '指给我看';
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
