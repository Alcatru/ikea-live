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
    return "var(--ink)";
  }

  window.roomMap = function (phase, records, meId, o = {}) {
    const i = Math.max(0, ORDER.indexOf(phase));
    const at = (p) => i >= ORDER.indexOf(p);
    const grown = at("s1");
    let s = `<svg viewBox="0 0 400 400" class="roommap" role="img" aria-label="Map of the room">`;
    // rings
    s += `<circle cx="${CX}" cy="${CY}" r="172" fill="#eef5e6" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="118" fill="#f3f3f3" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="62" fill="#fff" stroke="var(--ink)" stroke-width="2.4" class="${grown ? "grow" : ""}" style="transform-origin:${CX}px ${CY}px"/>`;
    s += `<text x="${CX}" y="${CY - 178}" class="rl">COUNTRYSIDE</text><text x="${CX}" y="${CY - 96}" class="rl">SUBURBS</text>`;
    if (!at("s2")) s += `<text x="${CX}" y="${CY - 40}" class="rl">CITY</text>`;
    // Step 0: the blue box, far out, with its road
    if (at("s0")) {
      s += `<path d="M${CX} ${CY} L332 82" stroke="var(--ink)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" fill="none"/>`;
      s += `<g class="${phase === "s0" ? "popin" : ""}" style="transform-origin:340px 70px"><rect x="312" y="52" width="60" height="38" fill="var(--blue)" stroke="var(--ink)" stroke-width="3"/><rect x="312" y="60" width="60" height="7" fill="var(--yellow)"/>
        ${[0, 1, 2, 3].map((k) => `<line x1="${318 + k * 14}" y1="96" x2="${318 + k * 14}" y2="108" stroke="#999" stroke-width="2"/>`).join("")}</g>`;
    }
    // Step 1: the city grows
    if (phase === "s1") s += [0, 90, 180, 270].map((d) => `<g transform="rotate(${d} ${CX} ${CY})"><path d="M${CX + 66} ${CY} h22 m-8 -7 l8 7 l-8 7" class="pushout" stroke="var(--blue)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("");
    // Step 2: a studio opens in the centre
    if (at("s2")) s += `<g class="${phase === "s2" ? "popin" : ""}" style="transform-origin:${CX}px ${CY}px"><rect x="${CX - 18}" y="${CY - 16}" width="36" height="30" fill="var(--yellow)" stroke="var(--ink)" stroke-width="3"/><rect x="${CX - 6}" y="${CY - 2}" width="12" height="16" fill="#fff" stroke="var(--ink)" stroke-width="2"/>
      <path d="M${CX} ${CY - 60}c-9 0-15 6-15 14 0 10 15 22 15 22s15-12 15-22c0-8-6-14-15-14z" fill="var(--blue)" stroke="var(--ink)" stroke-width="2.5"/><circle cx="${CX}" cy="${CY - 46}" r="5" fill="#fff"/></g>`;
    // Step 3: the delivery truck on its way, and a clock
    if (phase === "s3") s += `<g class="truck"><rect x="-16" y="-10" width="22" height="16" fill="#fff" stroke="var(--ink)" stroke-width="2.5"/><path d="M6 -4 h8 l5 5 v5 h-13z" fill="var(--blue)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-9" cy="8" r="3.5" fill="#fff" stroke="var(--ink)" stroke-width="2"/><circle cx="12" cy="8" r="3.5" fill="#fff" stroke="var(--ink)" stroke-width="2"/></g>
      <g transform="translate(52 52)"><circle r="20" fill="#fff" stroke="var(--ink)" stroke-width="3"/><line x1="0" y1="0" x2="0" y2="-13" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" class="hand"/><line x1="0" y1="0" x2="8" y2="4" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></g>`;
    // dots
    let k = 0, me = "";
    for (const id in records) {
      const r = records[id]; if (!r || !r.a || !r.a.home) continue;
      const [x, y] = pos(id, r.a.home, grown), c = colour(r, i);
      const isNew = !seen.has(id); seen.add(id);
      if (id === meId) { me = `<g class="me"><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="var(--ink)" stroke-width="2.5" class="ping" style="transform-origin:${x}px ${y}px"/><circle cx="${x}" cy="${y}" r="8.5" fill="${c}" stroke="var(--ink)" stroke-width="3"/>
        <path d="M${x} ${y - 13} l-6 -10 h12 z" fill="var(--ink)"/><text x="${x}" y="${y - 27}" class="you">YOU</text></g>`; continue; }
      s += `<circle cx="${x}" cy="${y}" r="${o.big ? 6.5 : 5.5}" fill="${c}" stroke="var(--ink)" stroke-width="1.6" class="${isNew ? "drop" : ""}" style="animation-delay:${isNew ? (k++ % 12) * 60 : 0}ms"/>`;
    }
    return s + me + "</svg>";
  };

  window.ROOMMAP_CSS = `
  .roommap { width: 100%; height: auto; display: block; }
  .roommap .rl { font: 700 10px var(--sans); letter-spacing: .12em; fill: #6b6b6b; text-anchor: middle; }
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
