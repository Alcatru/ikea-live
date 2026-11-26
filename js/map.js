/* IKEA live – line-art store map, one zone per Step. storeMap(phase) -> SVG string. */
(function () {
  const ORDER = ["s0", "s1", "s2", "s3", "s4", "s5"];
  // zone geometry (viewBox 0 0 340 300)
  const Z = {
    s1: { x: 22, y: 52, w: 206, h: 78, label: "Showroom" },
    s3: { x: 22, y: 140, w: 128, h: 70, label: "Self-serve" },
    s5: { x: 160, y: 140, w: 68, h: 70, label: "Checkout" },
    s0: { x: 22, y: 236, w: 206, h: 50, label: "Car park" },
    s2: { x: 256, y: 52, w: 74, h: 78, label: "Planning Studio" },
    s4: { x: 256, y: 168, w: 74, h: 84, label: "Your home", house: true },
  };

  function zoneState(z, phase) {
    const cur = ORDER.indexOf(phase), i = ORDER.indexOf(z);
    if (cur < 0 || i > cur) return "off";
    return i === cur ? "on" : "done";
  }

  function hatch(id) {
    return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--rule)" stroke-width="1.2"/></pattern>`;
  }

  function zone(k, phase) {
    const g = Z[k], st = zoneState(k, phase), n = ORDER.indexOf(k);
    const fill = st === "on" ? "var(--yellow)" : st === "done" ? "var(--paper)" : "url(#hatch)";
    const stroke = st === "off" ? "var(--rule)" : "var(--ink)";
    const dash = st === "off" ? ' stroke-dasharray="4 3"' : "";
    let shape;
    if (g.house) {
      const { x, y, w, h } = g, r = y + 26;
      shape = `<path d="M${x} ${r} L${x + w / 2} ${y} L${x + w} ${r} V${y + h} H${x} Z" fill="${fill}" stroke="${stroke}" stroke-width="2"${dash} stroke-linejoin="round"/>`;
    } else {
      shape = `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="2"${dash}/>`;
    }
    const cx = g.x + 16, cy = (g.house ? g.y + 40 : g.y + 16);
    const badge = st === "done"
      ? `<circle cx="${cx}" cy="${cy}" r="10" fill="var(--blue)"/><path d="M${cx - 4.5} ${cy} l3 3.2 l6 -6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<circle cx="${cx}" cy="${cy}" r="10" fill="${st === "on" ? "var(--ink)" : "var(--paper)"}" stroke="${stroke}" stroke-width="1.6"/>
         <text x="${cx}" y="${cy + 4.3}" text-anchor="middle" class="mnum" fill="${st === "on" ? "var(--yellow)" : st === "off" ? "var(--grey)" : "var(--ink)"}">${n}</text>`;
    const words = g.label.split(" ");
    const lx = g.house ? g.x + g.w / 2 : g.x + 32, anchor = g.house ? "middle" : "start";
    const ly = g.house ? g.y + 62 : g.y + 20;
    const label = g.w < 100
      ? `<text x="${g.house ? lx : g.x + 8}" y="${g.house ? ly : g.y + 44}" text-anchor="${anchor}" class="mlab" fill="${st === "off" ? "var(--grey)" : "var(--ink)"}">${words.map((w, i) => `<tspan x="${g.house ? lx : g.x + 8}" dy="${i ? 13 : 0}">${w}</tspan>`).join("")}</text>`
      : `<text x="${lx}" y="${ly}" text-anchor="${anchor}" class="mlab" fill="${st === "off" ? "var(--grey)" : "var(--ink)"}">${g.label}</text>`;
    const pulse = st === "on" ? `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="var(--ink)" stroke-width="2" class="pulse"/>` : "";
    return `<g class="zone z-${st}" data-zone="${k}">${shape}${pulse}${badge}${label}</g>`;
  }

  function details(phase) {
    const i = ORDER.indexOf(phase);
    let s = "";
    // car park lines
    for (let k = 0; k < 9; k++) s += `<line x1="${110 + k * 13}" y1="252" x2="${110 + k * 13}" y2="280" stroke="var(--rule)" stroke-width="1.4"/>`;
    // showroom furniture hints
    s += `<g stroke="var(--rule)" stroke-width="1.4" fill="none"><rect x="120" y="86" width="34" height="22" rx="4"/><rect x="166" y="80" width="46" height="34"/><line x1="166" y1="97" x2="212" y2="97"/></g>`;
    // warehouse shelving
    s += `<g stroke="var(--rule)" stroke-width="1.4">${[0, 1, 2].map((r) => `<line x1="40" y1="${180 + r * 9}" x2="140" y2="${180 + r * 9}"/>`).join("")}</g>`;
    // the walk-through path (yellow arrows on the floor)
    const on = (z) => ORDER.indexOf(z) <= i;
    const path = (d, z, extra = "") => `<path d="${d}" fill="none" stroke="${on(z) ? "var(--blue)" : "var(--rule)"}" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" ${extra} marker-end="url(#${on(z) ? "arB" : "arG"})"/>`;
    s += path("M60 236 V214", "s0");
    s += path("M100 140 V132", "s1");
    s += path("M150 176 H158", "s3");
    // delivery: blue box -> home, studio -> home
    s += path("M228 186 C240 186 244 214 254 214", "s3");
    s += path("M293 130 V166", "s2");
    // city / blue box captions
    s += `<text x="22" y="40" class="mcap">IKEA LYSSACH · THE BLUE BOX</text>`;
    s += `<text x="256" y="40" class="mcap">BERN</text>`;
    return s;
  }

  window.storeMap = function (phase) {
    return `<svg viewBox="0 0 340 300" class="storemap" role="img" aria-label="IKEA store map">
      <defs>${hatch("hatch")}
        <marker id="arB" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--blue)"/></marker>
        <marker id="arG" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--rule)"/></marker>
      </defs>
      <rect x="12" y="46" width="226" height="174" rx="4" fill="none" stroke="var(--blue)" stroke-width="3"/>
      <line x1="244" y1="30" x2="244" y2="292" stroke="var(--rule)" stroke-width="1" stroke-dasharray="2 4"/>
      ${ORDER.map((z) => zone(z, phase)).join("")}
      ${details(phase)}
    </svg>`;
  };
})();
