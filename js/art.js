/* IKEA live – line art in the deck's IKEA-manual style (same stick figure as cust_assets.py:
   round head r45 at (180,95), straight body, thick ink strokes). All SVG, no text. */
(function () {
  const INK = "var(--ink)", BLUE = "var(--blue)", YEL = "var(--yellow)", KRAFT = "#d6b68a", W = "#fff";
  const L = (pts, w = 9, c = INK) =>
    `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const C = (cx, cy, r, fill = W, w = 9) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${w}"/>`;
  const R = (x, y, w, h, fill = "none", sw = 6, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;

  /* Stick figure in a 360x480 box. pose: stand | carry | happy | shrug | wait | sad */
  function fig(pose = "stand", o = {}) {
    let s = "";
    const walk = o.walk ? ' class="legs-walk"' : "";
    s += L([[180, 140], [180, 300]]);
    s += `<g${walk}>` + L([[180, 300], [140, 440], [115, 440]]) + L([[180, 300], [220, 440], [245, 440]]) + "</g>";
    if (pose === "carry") {
      s += L([[180, 175], [115, 215]]) + L([[180, 175], [295, 215]]);
      s += R(100, 185, 210, 100, KRAFT, 9) + L([[125, 210], [175, 210]], 5) + L([[240, 252], [300, 252]], 5);
    } else if (pose === "happy") {
      s += L([[180, 175], [110, 95]]) + L([[180, 175], [250, 95]]);
      [-150, -120, -60, -30].forEach((a) => { const r = (a * Math.PI) / 180; s += L([[180 + 65 * Math.cos(r), 95 + 65 * Math.sin(r)], [180 + 88 * Math.cos(r), 95 + 88 * Math.sin(r)]], 6); });
    } else if (pose === "shrug") {
      s += L([[180, 175], [128, 205], [96, 160]]) + L([[180, 175], [232, 205], [264, 160]]);
    } else if (pose === "sad") {
      s += L([[180, 175], [140, 290]]) + L([[180, 175], [220, 290]]);
      s += `<path d="M262 60 q8 14 0 22 q-8 -8 0 -22z" fill="${BLUE}"/>`;
    } else if (pose === "point") {
      s += L([[180, 175], [120, 250]]) + L([[180, 175], [330, 150]]);
    } else {
      s += L([[180, 175], [140, 290]]) + L([[180, 175], [220, 290]]);
    }
    s += C(180, 95, 45);
    if (o.sweat) s += `<g class="sweat"><path d="M250 50 q9 15 0 24 q-9 -9 0 -24z" fill="${BLUE}"/><path d="M110 70 q7 12 0 19 q-7 -7 0 -19z" fill="${BLUE}"/></g>`;
    return s;
  }
  const figAt = (x, y, h, pose, o) => {
    const k = h / 480, f = Math.max(1, 2.6 / k / 9); // keep strokes readable when the figure is small
    const g = fig(pose, o).replace(/stroke-width="(\d+(?:\.\d+)?)"/g, (m, w) => `stroke-width="${(+w * f).toFixed(1)}"`);
    return `<g transform="translate(${x} ${y}) scale(${k})">${g}</g>`;
  };

  /* Homes for the customer card, viewBox 0 0 320 200 */
  const HOMES = {
    lena: () => // tiny studio, everything crammed in
      `${R(70, 40, 180, 150, W, 7)}${L([[70, 40], [160, 6], [250, 40]], 7)}
       ${R(84, 120, 70, 26, YEL, 5)}${R(84, 112, 18, 10, W, 4)}
       ${R(196, 96, 42, 8, W, 5)}${L([[202, 104], [202, 150]], 5)}${L([[232, 104], [232, 150]], 5)}
       ${R(180, 56, 58, 30, "#eaf2fa", 5)}${L([[209, 56], [209, 86]], 4)}
       ${figAt(150, 92, 92, "shrug")}
       <g class="squeeze">${L([[60, 115], [48, 115]], 5, BLUE)}${L([[260, 115], [272, 115]], 5, BLUE)}${L([[52, 108], [44, 115], [52, 122]], 5, BLUE)}${L([[268, 108], [276, 115], [268, 122]], 5, BLUE)}</g>`,
    jonas: () => // city block, one lit window, clock running
      `${R(40, 30, 150, 160, W, 7)}${[0, 1, 2].map((r) => [0, 1, 2].map((c) => R(56 + c * 44, 46 + r * 44, 30, 30, r === 1 && c === 1 ? YEL : W, 4)).join("")).join("")}
       ${C(250, 70, 40, W, 7)}<g class="spin" style="transform-origin:250px 70px">${L([[250, 70], [250, 44]], 6)}</g>${L([[250, 70], [270, 80]], 6)}
       ${figAt(215, 108, 86, "point")}`,
    amira: () => // shared flat at night, moon, small room
      `${R(40, 40, 170, 150, W, 7)}${L([[125, 40], [125, 190]], 5)}${L([[40, 115], [210, 115]], 5)}
       ${R(140, 128, 56, 24, YEL, 5)}${figAt(60, 118, 70, "stand")}${figAt(140, 46, 62, "stand")}
       <path d="M268 38 a30 30 0 1 0 22 50 a24 24 0 1 1 -22 -50z" fill="${YEL}" stroke="${INK}" stroke-width="6"/>
       ${L([[244, 120], [244, 150]], 5)}${L([[234, 150], [254, 150]], 5)}${C(244, 112, 8, W, 5)}`,
    family: () => // house, garden, car in the driveway
      `${R(30, 80, 130, 110, W, 7)}${L([[18, 86], [95, 26], [172, 86]], 7)}${R(80, 136, 30, 54, YEL, 5)}${R(44, 100, 26, 26, "#eaf2fa", 4)}
       ${C(205, 120, 26, "#cfe3c4", 6)}${L([[205, 146], [205, 190]], 7)}
       ${car(232, 140, 0.55)}${L([[0, 192], [320, 192]], 6)}`,
  };

  /* Car, drawn from (x,y) top-left, scale k (base 150x80) */
  function car(x, y, k = 1, roof = false) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      ${roof ? R(30, -14, 80, 16, KRAFT, 6) : ""}
      <path d="M6 58 V40 L30 14 H104 L132 40 H144 V58 Z" fill="${BLUE}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M38 22 H64 V40 H22 Z M72 22 H100 L118 40 H72 Z" fill="#eaf2fa" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      ${C(38, 62, 14, W, 7)}${C(116, 62, 14, W, 7)}</g>`;
  }

  /* Small stroke icons, viewBox 0 0 48 48 */
  const ICON = {
    Car: `<path d="M5 30v-7l6-8h24l7 8h2v7z" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/><circle cx="14" cy="32" r="4" fill="#fff" stroke="currentColor" stroke-width="3.4"/><circle cx="35" cy="32" r="4" fill="#fff" stroke="currentColor" stroke-width="3.4"/>`,
    Time: `<circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M24 14v10l7 5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`,
    Space: `<path d="M8 32v-9a4 4 0 0 1 8 0v3h16v-3a4 4 0 0 1 8 0v9zM12 22v-6h24v6M10 32v5M38 32v5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>`,
    Travel: `<path d="M10 38c0-10 10-8 14-14s-2-12 6-14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-dasharray="2 5" stroke-linecap="round"/><circle cx="10" cy="38" r="3.4" fill="currentColor"/><path d="M33 4c-4 0-7 3-7 7 0 5 7 12 7 12s7-7 7-12c0-4-3-7-7-7z" fill="none" stroke="currentColor" stroke-width="3.4"/>`,
  };
  const icon = (k, size = 26) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-label="${k}">${ICON[k]}</svg>`;

  /* Answer tiles, viewBox 0 0 120 80 */
  const TILE = {
    car: () => car(-2, 10, 0.82),
    train: () => `${R(12, 12, 66, 52, YEL, 6, 10)}${R(22, 22, 46, 18, W, 5, 3)}${C(28, 64, 6, W, 5)}${C(62, 64, 6, W, 5)}
       <path d="M84 32 h24 v26 h-24 z" fill="${BLUE}" stroke="${INK}" stroke-width="5"/>${C(90, 62, 5, W, 4)}${C(104, 62, 5, W, 4)}`,
    no: () => `${figAt(30, 2, 76, "shrug")}${L([[70, 18], [104, 52]], 7, "var(--red)")}${L([[104, 18], [70, 52]], 7, "var(--red)")}`,
    keep: () => `${R(18, 20, 84, 50, BLUE, 6)}${R(18, 30, 84, 8, YEL, 0)}${L([[18, 70], [102, 70]], 6)}${L([[44, 6], [56, 16], [80, 2]], 7, "var(--green)")}`,
    change: () => `${R(10, 26, 50, 40, BLUE, 6)}${L([[66, 46], [84, 46]], 6)}${L([[78, 38], [86, 46], [78, 54]], 6)}${R(92, 36, 22, 30, YEL, 5)}`,
    unsure: () => figAt(36, 2, 76, "shrug"),
    fine: () => `<text x="60" y="60" text-anchor="middle" font-size="52">🙂</text>`,
    meh: () => `<text x="60" y="60" text-anchor="middle" font-size="52">😐</text>`,
    angry: () => `<text x="60" y="60" text-anchor="middle" font-size="52">😡</text>`,
  };
  const tile = (k) => (TILE[k] ? `<svg viewBox="0 0 120 80" class="tileart">${TILE[k]()}</svg>` : "");

  /* Step 0 scene, viewBox 0 0 360 200: the blue box on the edge of town. */
  function sceneS0(P, answer) {
    let s = `<svg viewBox="0 0 360 200" class="scene">`;
    s += `<rect x="0" y="0" width="360" height="200" fill="#f4f8fc"/>`;
    s += `<path d="M150 40 h200 v100 h-200z" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><rect x="150" y="58" width="200" height="12" fill="${YEL}"/>`;
    s += `<rect x="232" y="104" width="40" height="36" fill="#eaf2fa" stroke="${INK}" stroke-width="4"/>`;
    s += L([[0, 140], [360, 140]], 4) + `<rect x="0" y="140" width="360" height="60" fill="#e9e9e9"/>`;
    for (let i = 0; i < 8; i++) s += L([[170 + i * 24, 150], [170 + i * 24, 178]], 3, "#bdbdbd");
    if (P.car) {
      s += `<g class="drive-in">${car(150, 128, 0.52, true)}</g>`;
      s += `<g class="pop" style="animation-delay:1.3s">${figAt(292, 62, 86, "happy")}</g>`;
    } else {
      // bus stop far left, the customer walks away carrying the flat pack
      s += L([[34, 70], [34, 150]], 4) + `<rect x="22" y="56" width="26" height="18" rx="3" fill="${YEL}" stroke="${INK}" stroke-width="4"/>`;
      s += `<g class="trudge">${figAt(56, 62, 92, "carry", { walk: true, sweat: true })}</g>`;
    }
    return s + "</svg>";
  }


  /* Step 1: four forces as icons, viewBox 0 0 64 64 */
  const FORCE = {
    city: `<path d="M6 56V26h14v30M20 56V12h16v44M36 56V30h12v26M48 56V20h10v36" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linejoin="round"/><path d="M2 56h60" stroke="currentColor" stroke-width="3.6"/>`,
    online: `<rect x="18" y="6" width="28" height="52" rx="5" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M25 26h3l3 12h10l3-9H30" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><circle cx="32" cy="43" r="2" fill="currentColor"/><circle cx="40" cy="43" r="2" fill="currentColor"/>`,
    rivals: `<rect x="8" y="14" width="40" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M2 48h52" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/><path d="M16 34l9-8 6 5 10-10M35 21h6v6" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M54 8v14" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/>`,
    slow: `<rect x="6" y="20" width="40" height="30" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M6 28h40" stroke="currentColor" stroke-width="3.6"/><path d="M55 14v30M48 37l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const force = (k) => `<svg viewBox="0 0 64 64" class="forceart">${FORCE[k]}</svg>`;

  const BOX = (x, y, w, h) => `${R(x, y, w, h, KRAFT, 6)}${L([[x + 12, y + 16], [x + w * 0.45, y + 16]], 4)}${L([[x + w * 0.6, y + h - 14], [x + w - 12, y + h - 14]], 4)}`;

  /* Step 2: a Planning Studio pops up in town, viewBox 0 0 360 200 */
  function sceneS2(P) {
    let s = `<svg viewBox="0 0 360 200" class="scene"><rect width="360" height="200" fill="#f4f8fc"/>`;
    s += `<g fill="#fff" stroke="${INK}" stroke-width="4">` +
      [[150, 70, 40, 80], [192, 50, 46, 100], [300, 64, 44, 86]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join("") + "</g>";
    s += L([[0, 150], [360, 150]], 4) + `<rect x="0" y="150" width="360" height="50" fill="#e9e9e9"/>`;
    // the new studio
    s += `<g class="pop" style="animation-delay:.3s"><rect x="244" y="92" width="52" height="58" fill="${YEL}" stroke="${INK}" stroke-width="5"/><rect x="258" y="118" width="24" height="32" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <path d="M270 40c-12 0-20 8-20 19 0 14 20 28 20 28s20-14 20-28c0-11-8-19-20-19z" fill="${BLUE}" stroke="${INK}" stroke-width="4"/><circle cx="270" cy="59" r="7" fill="#fff"/></g>`;
    if (P.urban) {
      s += `<path d="M96 186 C150 186 200 186 262 156" fill="none" stroke="${BLUE}" stroke-width="4" stroke-dasharray="6 6"/>`;
      s += figAt(40, 96, 90, "happy");
    } else {
      s += car(10, 150, 0.42) + `<path d="M80 176 H350" stroke="${BLUE}" stroke-width="4" stroke-dasharray="6 6"/>`;
    }
    return s + "</svg>";
  }

  /* Step 3: the flat pack and the stamp, viewBox 0 0 360 190 */
  function sceneS3(P) {
    let s = `<svg viewBox="0 0 360 190" class="scene"><rect width="360" height="190" fill="#f4f8fc"/>`;
    s += BOX(70, 40, 220, 120);
    const ok = !P.urban;
    s += `<g class="stampin"><rect x="88" y="78" width="184" height="44" rx="6" fill="#fff" fill-opacity=".85" stroke="${ok ? "var(--green)" : "var(--red)"}" stroke-width="6" transform="rotate(-6 180 100)"/>
      <g transform="rotate(-6 180 100)">${ok
        ? L([[160, 100], [174, 113], [200, 86]], 10, "var(--green)")
        : L([[164, 84], [196, 116]], 10, "var(--red)") + L([[196, 84], [164, 116]], 10, "var(--red)")}</g></g>`;
    return s + "</svg>";
  }

  /* Step 4: will it fit? viewBox 0 0 360 190 */
  function sceneS4() {
    let s = `<svg viewBox="0 0 360 190" class="scene"><rect width="360" height="190" fill="#f4f8fc"/>`;
    s += L([[20, 160], [340, 160]], 5) + L([[60, 30], [60, 160]], 5) + L([[300, 30], [300, 160]], 5);
    s += `<rect x="110" y="62" width="140" height="98" fill="none" stroke="${BLUE}" stroke-width="5" stroke-dasharray="9 7" class="blink"/>`;
    s += L([[66, 44], [294, 44]], 4) + L([[66, 36], [66, 52]], 4) + L([[294, 36], [294, 52]], 4);
    s += `<g class="bounce"><circle cx="180" cy="110" r="30" fill="${YEL}" stroke="${INK}" stroke-width="5"/><path d="M170 100a10 10 0 1 1 14 9c-3 2-4 4-4 8" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="180" cy="127" r="3.6" fill="${INK}"/></g>`;
    return s + "</svg>";
  }

  /* Small receipt icons, viewBox 0 0 48 48 */
  const RICON = {
    home: `<path d="M8 22L24 9l16 13v18H8z" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/>`,
    pin: `<path d="M24 5c-8 0-13 6-13 13 0 10 13 24 13 24s13-14 13-24c0-7-5-13-13-13z" fill="none" stroke="currentColor" stroke-width="3.4"/><circle cx="24" cy="18" r="4.5" fill="currentColor"/>`,
    box: `<rect x="7" y="14" width="34" height="24" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M13 21h12" stroke="currentColor" stroke-width="3"/>`,
    fit: `<rect x="8" y="12" width="32" height="24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-dasharray="5 4"/><path d="M17 24l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const ricon = (k) => `<svg viewBox="0 0 48 48" width="22" height="22">${RICON[k] || ICON[k] || ""}</svg>`;

  /* Closed flat-pack box for the unboxing, viewBox 0 0 300 250 */
  function box() {
    return `<svg viewBox="0 0 300 250" class="boxart">
      <g class="lid"><rect x="22" y="58" width="256" height="34" fill="#c9a575" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="136" y="58" width="28" height="34" fill="${BLUE}"/></g>
      <rect x="36" y="92" width="228" height="140" fill="${KRAFT}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="136" y="92" width="28" height="64" fill="${BLUE}"/>
      ${L([[56, 120], [116, 120]], 5)}${L([[186, 206], [244, 206]], 5)}
      ${figAt(60, 150, 70, "carry")}
      <g class="tapme"><circle cx="232" cy="150" r="22" fill="${YEL}" stroke="${INK}" stroke-width="5"/><path d="M226 140 l14 10 l-14 10z" fill="${INK}"/></g>
    </svg>`;
  }

  window.ART = { box, fig, figAt, HOMES, car, icon, tile, sceneS0, force, sceneS2, sceneS3, sceneS4, ricon, box };
})();
