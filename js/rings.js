/* IKEA live – "the room on a map": city centre / suburbs / countryside as rings, one dot per phone.
   roomMap(phase, records, meId) -> SVG string. The map adds one element per Step. */
(function () {
  const ORDER = ["join", "s0", "s1", "s2", "s3", "s4", "s5", "end"];
  const CX = 200, CY = 214;
  const BAND = { centre: [6, 52], suburbs: [72, 108], country: [126, 160] };
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
    return "#3a3a3a";
  }

  window.roomMap = function (phase, records, meId, o = {}) {
    const i = Math.max(0, ORDER.indexOf(phase));
    const at = (p) => i >= ORDER.indexOf(p);
    const grown = at("s1");
    let s = `<svg viewBox="0 0 400 400" class="roommap" role="img" aria-label="Map of the room">`;
    // rings: soft fills, white gaps, tiny landscape glyphs (deterministic)
    s += `<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-opacity=".25"/></filter></defs>`;
    s += `<circle cx="${CX}" cy="${CY}" r="174" fill="#dfeccf"/>`;
    for (let t = 0; t < 34; t++) {
      const a = hash("t" + t, 3) * Math.PI * 2, r = 128 + hash("t" + t, 5) * 40, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
      s += `<g opacity=".55"><rect x="${x - 0.8}" y="${y}" width="1.6" height="5" fill="#6e8a52"/><circle cx="${x}" cy="${y - 1}" r="${3 + hash("t" + t, 9) * 2}" fill="#a9c98b"/></g>`;
    }
    s += `<circle cx="${CX}" cy="${CY}" r="120" fill="#f5efe3" stroke="#fff" stroke-width="5"/>`;
    for (let t = 0; t < 26; t++) {
      const a = hash("h" + t, 3) * Math.PI * 2, r = 72 + hash("h" + t, 5) * 38, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
      s += `<path d="M${x - 4} ${y + 3} v-4 l4 -3.5 l4 3.5 v4 z" fill="#e2d6bf"/>`;
    }
    s += `<circle cx="${CX}" cy="${CY}" r="64" fill="#ffffff" stroke="#fff" stroke-width="5" class="${grown ? "grow" : ""}" style="transform-origin:${CX}px ${CY}px"/>`;
    for (let t = 0; t < 18; t++) {
      const a = (t / 18) * Math.PI * 2, r = 52, x = CX + r * Math.cos(a), y = CY + r * Math.sin(a), h = 6 + hash("b" + t, 3) * 8;
      s += `<rect x="${x - 3}" y="${y - h / 2}" width="6" height="${h}" fill="#e6eaf0" rx="1"/>`;
    }
    s += `<circle cx="${CX}" cy="${CY}" r="174" fill="none" stroke="#c9d6bb" stroke-width="2"/>`;
    const pill = (y, t) => `<g><rect x="${CX - t.length * 3.6 - 8}" y="${y - 10}" width="${t.length * 7.2 + 16}" height="16" rx="8" fill="#fff" opacity=".92"/><text x="${CX}" y="${y + 2}" class="rl">${t}</text></g>`;
    let labels = pill(CY - 158, "COUNTRYSIDE") + pill(CY - 100, "SUBURBS");
    if (!at("s2")) labels += pill(CY - 34, "CITY");
    // Step 0: the blue box, far out, with its road
    if (at("s0")) {
      s += `<path d="M${CX} ${CY} L326 92" stroke="#c4c4c4" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${CX} ${CY} L326 92" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 6" fill="none"/>`;
      s += `<g class="${phase === "s0" ? "popin" : ""}" style="transform-origin:340px 78px" filter="url(#sh)">
        <rect x="300" y="96" width="74" height="16" rx="2" fill="#d9d9d9"/>${[0, 1, 2, 3, 4].map((k) => `<line x1="${306 + k * 14}" y1="98" x2="${306 + k * 14}" y2="110" stroke="#fff" stroke-width="1.6"/>`).join("")}
        <path d="M312 58 l12 -8 h50 l-12 8 z" fill="#2a79c0"/><path d="M362 58 l12 -8 v36 l-12 8 z" fill="#004a8c"/>
        <rect x="312" y="58" width="50" height="36" fill="var(--blue)"/><rect x="312" y="64" width="50" height="6" fill="var(--yellow)"/><rect x="330" y="80" width="14" height="14" fill="#cfe0f2"/></g>`;
    }
    // Step 1: the city grows
    if (phase === "s1") s += [0, 90, 180, 270].map((d) => `<g transform="rotate(${d} ${CX} ${CY})"><path d="M${CX + 68} ${CY} h20 m-7 -6 l7 6 l-7 6" class="pushout" stroke="var(--blue)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("");
    // Step 2: a studio opens in the centre
    if (at("s2")) s += `<g class="${phase === "s2" ? "popin" : ""}" style="transform-origin:${CX}px ${CY}px" filter="url(#sh)">
      <path d="M${CX - 16} ${CY - 12} l7 -5 h25 l-7 5 z" fill="#ffe866"/><path d="M${CX + 9} ${CY - 12} l7 -5 v24 l-7 5 z" fill="#d9b800"/>
      <rect x="${CX - 16}" y="${CY - 12}" width="25" height="24" fill="var(--yellow)"/><rect x="${CX - 8}" y="${CY}" width="9" height="12" fill="#fff"/>
      <path d="M${CX - 4} ${CY - 58}c-9 0-15 6-15 14 0 10 15 22 15 22s15-12 15-22c0-8-6-14-15-14z" fill="var(--blue)"/><circle cx="${CX - 4}" cy="${CY - 44}" r="5" fill="#fff"/></g>`;
    // Step 3: the delivery truck on its way, and a clock
    if (phase === "s3") s += `<g class="truck" filter="url(#sh)"><rect x="-16" y="-10" width="22" height="16" rx="2" fill="#fff"/><path d="M6 -4 h8 l5 5 v5 h-13z" fill="var(--blue)"/><circle cx="-9" cy="8" r="3.5" fill="var(--ink)"/><circle cx="12" cy="8" r="3.5" fill="var(--ink)"/></g>
      <g transform="translate(46 46)" filter="url(#sh)"><circle r="20" fill="#fff"/><circle r="20" fill="none" stroke="var(--ink)" stroke-width="2.5"/><line x1="0" y1="0" x2="0" y2="-13" stroke="var(--red)" stroke-width="3" stroke-linecap="round" class="hand"/><line x1="0" y1="0" x2="8" y2="4" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></g>`;
    // dots
    let k = 0, me = "";
    for (const id in records) {
      const r = records[id]; if (!r || !r.a || !r.a.home) continue;
      const [x, y] = pos(id, r.a.home, grown), c = colour(r, i);
      const isNew = !seen.has(id); seen.add(id);
      if (id === meId) { me = `<g class="me"><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="var(--ink)" stroke-width="2.5" class="ping" style="transform-origin:${x}px ${y}px"/><circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="var(--ink)" stroke-width="3" filter="url(#sh)"/>
        <path d="M${x} ${y - 13} l-6 -10 h12 z" fill="var(--ink)"/><text x="${x}" y="${y - 27}" class="you">YOU</text></g>`; continue; }
      s += `<circle cx="${x}" cy="${y}" r="${o.big ? 6.5 : 6}" fill="${c}" stroke="#fff" stroke-width="2" filter="url(#sh)" class="${isNew ? "drop" : ""}" style="animation-delay:${isNew ? (k++ % 12) * 60 : 0}ms"/>`;
    }
    return s + labels + me + "</svg>";
  };

  window.ROOMMAP_CSS = `
  .roommap { width: 100%; height: auto; display: block; }
  .roommap .rl { font: 800 9.5px var(--sans); letter-spacing: .14em; fill: #555; text-anchor: middle; }
  .roommap .you { font: 800 11px var(--sans); letter-spacing: .08em; fill: var(--ink); text-anchor: middle; }
  .roommap .drop { animation: drop .6s cubic-bezier(.3, 1.6, .5, 1) both; transform-box: fill-box; transform-origin: center; }
  @keyframes drop { from { transform: translateY(-40px) scale(.2); opacity: 0; } }
  .roommap .popin { animation: popin .8s cubic-bezier(.3, 1.6, .5, 1) both .2s; }
  @keyframes popin { from { transform: scale(0); } }
  .roommap .grow { animation: grow 1.2s ease-out both; }
  @keyframes grow { from { transform: scale(.82); } }
  .roommap .pushout { animation: pushout 1.4s ease-in-out infinite alternate; }
  @keyframes pushout { to { transform: translateX(10px); } }
  .roommap .ping { animation: ping 1.6s ease-out infinite; }
  @keyframes ping { to { transform: scale(2.6); opacity: 0; } }
  .roommap .truck { offset-path: path("M332 82 L200 214"); animation: truck 4s ease-in-out infinite; }
  @keyframes truck { from { offset-distance: 0%; } 80%, to { offset-distance: 100%; } }
  .roommap .hand { animation: spin 1.5s linear infinite; transform-origin: 0 0; }
  @keyframes spin { to { transform: rotate(360deg); } }`;
})();
