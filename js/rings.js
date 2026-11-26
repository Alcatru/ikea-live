/* IKEA live – "the room on a map": city centre / suburbs / countryside as rings, one dot per phone.
   Drawn like the deck: assembly-manual line art (black strokes on kraft and white), no shadows.
   roomMap(phase, records, meId) -> SVG string. The map adds one element per Step. */
(function () {
  const ORDER = ["join", "s0", "s1", "s2", "s3", "s4", "s5", "end"];
  const CX = 200, CY = 210, INK = "#111111";
  const BAND = { centre: [6, 50], suburbs: [74, 108], country: [128, 162] };
  const seen = new Set();

  function hash(str, salt) {
    let h = 2166136261 ^ salt;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 10000) / 10000;
  }
  function pos(id, home, grown) {
    const b = BAND[home] || BAND.centre;
    const lo = home === "centre" ? b[0] : b[0] + (grown && home === "suburbs" ? 6 : 0);
    const a = hash(id, 7) * Math.PI * 2, r = lo + Math.sqrt(hash(id, 13)) * (b[1] - lo);
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  function colour(rec, i) {
    const a = rec.a || {};
    if (i >= ORDER.indexOf("s3") && a.react) return { fine: "var(--green)", meh: "#f28c28", angry: "var(--red)" }[a.react];
    if (i >= ORDER.indexOf("s0") && a.got) return a.got === "car" ? "var(--blue)" : "var(--yellow)";
    return "#111111";
  }
  // keep glyphs off the road to the blue box (NE diagonal)
  const offRoad = (x, y) => !(x > CX && y < CY && Math.abs((x - CX) + (y - CY)) < 16);

  window.roomMap = function (phase, records, meId, o = {}) {
    const i = Math.max(0, ORDER.indexOf(phase));
    const at = (p) => i >= ORDER.indexOf(p);
    const grown = at("s1");
    let s = `<svg viewBox="0 0 400 400" class="roommap" role="img" aria-label="Map of the room: city centre, suburbs, countryside">`;
    // countryside: kraft disc, line trees
    s += `<circle cx="${CX}" cy="${CY}" r="176" fill="#e6d8c0" stroke="${INK}" stroke-width="2"/>`;
    for (let t = 0; t < 30; t++) {
      const a = hash("t" + t, 3) * Math.PI * 2, r = 130 + hash("t" + t, 5) * 36, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
      if (!offRoad(x, y) && at("s0")) continue;
      const rr = 3 + hash("t" + t, 9) * 2;
      s += `<path d="M${x} ${y + rr} v4" stroke="${INK}" stroke-width="1" /><circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
    }
    // suburbs: light kraft, line houses
    s += `<circle cx="${CX}" cy="${CY}" r="120" fill="#f4ece0" stroke="${INK}" stroke-width="1.4"/>`;
    for (let t = 0; t < 24; t++) {
      const a = hash("h" + t, 3) * Math.PI * 2, r = 74 + hash("h" + t, 5) * 36, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
      if (!offRoad(x, y) && at("s0")) continue;
      s += `<path d="M${x - 4} ${y + 4} v-5 l4 -3.5 l4 3.5 v5 z" fill="#fff" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`;
    }
    // city: white, line blocks
    s += `<circle cx="${CX}" cy="${CY}" r="62" fill="#fff" stroke="${INK}" stroke-width="1.4" class="${grown ? "grow" : ""}" style="transform-origin:${CX}px ${CY}px"/>`;
    for (let t = 0; t < 16; t++) {
      const a = (t / 16) * Math.PI * 2 + 0.1, x = CX + 54 * Math.cos(a), y = CY + 54 * Math.sin(a), h = 6 + hash("b" + t, 3) * 7;
      if (!offRoad(x, y) && at("s0")) continue;
      s += `<rect x="${x - 2.6}" y="${y - h / 2}" width="5.2" height="${h}" fill="#fff" stroke="${INK}" stroke-width=".9"/>`;
    }
    const tag = (y, t) => `<g><rect x="${CX - t.length * 3.55 - 7}" y="${y - 9}" width="${t.length * 7.1 + 14}" height="15" fill="#fff" stroke="${INK}" stroke-width="1.2"/><text x="${CX}" y="${y + 2.4}" class="rl">${t}</text></g>`;
    let labels = tag(CY - 160, "COUNTRYSIDE") + tag(CY - 102, "SUBURBS");
    if (!at("s2")) labels += tag(CY - 36, "CITY");
    // Step 0: the blue box, far out, with its road (two edge lines, dashed centre)
    if (at("s0")) {
      s += `<path d="M${CX} ${CY} L322 88" stroke="${INK}" stroke-width="12" stroke-linecap="butt"/><path d="M${CX} ${CY} L322 88" stroke="#fff" stroke-width="9.4"/><path d="M${CX} ${CY} L322 88" stroke="${INK}" stroke-width="1" stroke-dasharray="4 5"/>`;
      s += `<g class="${phase === "s0" ? "popin" : ""}" style="transform-origin:338px 78px" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round">
        <rect x="298" y="96" width="78" height="16" fill="#fff"/>${[0, 1, 2, 3, 4].map((k) => `<path d="M${306 + k * 14} 99 v10" stroke-width="1"/>`).join("")}
        <path d="M312 58 l12 -8 h50 l-12 8 z" fill="#3f84c4"/><path d="M362 58 l12 -8 v36 l-12 8 z" fill="#004a8c"/>
        <rect x="312" y="58" width="50" height="36" fill="var(--blue)"/><rect x="312" y="64" width="50" height="6" fill="var(--yellow)"/><rect x="330" y="80" width="14" height="14" fill="#fff"/></g>`;
    }
    // Step 1: the city grows
    if (phase === "s1") s += [0, 90, 180, 270].map((d) => `<g transform="rotate(${d} ${CX} ${CY})"><path d="M${CX + 66} ${CY} h20 m-7 -6 l7 6 l-7 6" class="pushout" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("");
    // Step 2: a studio opens in the centre
    if (at("s2")) s += `<g class="${phase === "s2" ? "popin" : ""}" style="transform-origin:${CX}px ${CY}px" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round">
      <path d="M${CX - 16} ${CY - 12} l7 -5 h25 l-7 5 z" fill="#ffe866"/><path d="M${CX + 9} ${CY - 12} l7 -5 v24 l-7 5 z" fill="#d9b800"/>
      <rect x="${CX - 16}" y="${CY - 12}" width="25" height="24" fill="var(--yellow)"/><rect x="${CX - 8}" y="${CY}" width="9" height="12" fill="#fff"/>
      <path d="M${CX - 4} ${CY - 58}c-9 0-15 6-15 14 0 10 15 22 15 22s15-12 15-22c0-8-6-14-15-14z" fill="var(--blue)"/><circle cx="${CX - 4}" cy="${CY - 44}" r="5" fill="#fff"/></g>`;
    // Step 3: the delivery truck on its way, and a clock
    if (phase === "s3") s += `<g class="truck" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"><rect x="-17" y="-11" width="22" height="16" fill="#fff"/><path d="M5 -5 h8 l6 6 v4 h-14z" fill="var(--blue)"/><circle cx="-10" cy="7" r="3.5" fill="#fff"/><circle cx="12" cy="7" r="3.5" fill="#fff"/></g>
      <g transform="translate(44 44)"><circle r="20" fill="#fff" stroke="${INK}" stroke-width="2"/>${[0, 90, 180, 270].map((d) => `<path d="M0 -17 v3" stroke="${INK}" stroke-width="1.6" transform="rotate(${d})"/>`).join("")}<line x1="0" y1="0" x2="0" y2="-13" stroke="var(--red)" stroke-width="2.6" stroke-linecap="round" class="hand"/><line x1="0" y1="0" x2="8" y2="4" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/></g>`;
    // dots: filled with the answer colour, black outline (like the deck's checkmarks)
    let k = 0, me = "";
    for (const id in records) {
      const r = records[id]; if (!r || !r.a || !r.a.home) continue;
      const [x, y] = pos(id, r.a.home, grown), c = colour(r, i);
      const isNew = !seen.has(id); seen.add(id);
      if (id === meId) { me = `<g class="me"><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${INK}" stroke-width="2" class="ping" style="transform-origin:${x}px ${y}px"/><circle cx="${x}" cy="${y}" r="9" fill="${c === "#111111" ? "var(--yellow)" : c}" stroke="${INK}" stroke-width="2.6"/>
        <path d="M${x} ${y - 12} v-8" stroke="${INK}" stroke-width="2"/><rect x="${x - 17}" y="${y - 35}" width="34" height="15" fill="${INK}"/><text x="${x}" y="${y - 24.2}" class="you">YOU</text></g>`; continue; }
      s += `<circle cx="${x}" cy="${y}" r="${o.big ? 6.5 : 6}" fill="${c}" stroke="${c === INK ? "#fff" : INK}" stroke-width="${c === INK ? 1.4 : 1.8}" class="${isNew ? "drop" : ""}" style="animation-delay:${isNew ? (k++ % 12) * 60 : 0}ms"/>`;
    }
    return s + labels + me + "</svg>";
  };

  window.ROOMMAP_CSS = `
  .roommap { width: 100%; height: auto; display: block; }
  .roommap .rl { font: 700 8.6px var(--grot); letter-spacing: .16em; fill: #111; text-anchor: middle; }
  .roommap .you { font: 700 9.5px var(--grot); letter-spacing: .14em; fill: #fff; text-anchor: middle; }
  .roommap .drop { animation: drop .55s cubic-bezier(.3, 1.5, .5, 1) both; transform-box: fill-box; transform-origin: center; }
  @keyframes drop { from { transform: translateY(-30px) scale(.3); opacity: 0; } }
  .roommap .popin { animation: popin .7s cubic-bezier(.3, 1.5, .5, 1) both .2s; }
  @keyframes popin { from { transform: scale(0); } }
  .roommap .grow { animation: grow 1.2s ease-out both; }
  @keyframes grow { from { transform: scale(.82); } }
  .roommap .pushout { animation: pushout 1.4s ease-in-out infinite alternate; }
  @keyframes pushout { to { transform: translateX(10px); } }
  .roommap .ping { animation: ping 1.6s ease-out infinite; }
  @keyframes ping { to { transform: scale(2.6); opacity: 0; } }
  .roommap .truck { offset-path: path("M326 86 L200 210"); animation: truck 4s ease-in-out infinite; }
  @keyframes truck { from { offset-distance: 0%; } 80%, to { offset-distance: 100%; } }
  .roommap .hand { animation: spin 1.5s linear infinite; transform-origin: 0 0; }
  @keyframes spin { to { transform: rotate(360deg); } }`;
})();
