/* IKEA live – line pictograms in the deck's assembly-manual style (black stroke, no fill). */
(function () {
  const P = {
    centre: '<path d="M5 42h38"/><rect x="9" y="19" width="10" height="23"/><rect x="19" y="8" width="12" height="34"/><rect x="31" y="23" width="8" height="19"/><path d="M23 14h4M23 20h4M23 26h4M23 32h4M12 25h4M12 31h4M33 29h4"/>',
    suburbs: '<path d="M5 42h38"/><path d="M11 42V24l13-11 13 11v18"/><path d="M20 42V32h8v10"/><path d="M30 17v-6h4v9"/>',
    country: '<path d="M4 42h40"/><circle cx="17" cy="19" r="9"/><path d="M17 28v14"/><circle cx="34" cy="28" r="6"/><path d="M34 34v8"/>',
    car: '<path d="M5 33v-7l6-2 5-8h15l6 8 6 2v7z"/><path d="M17 17v7M29 16.5V24M11 24h32"/><circle cx="14" cy="34" r="4" fill="#fff"/><circle cx="34" cy="34" r="4" fill="#fff"/>',
    lift: '<path d="M5 33v-7l6-2 5-8h15l6 8 6 2v7z"/><path d="M11 24h32"/><circle cx="20.5" cy="20" r="2.4" fill="currentColor" stroke="none"/><circle cx="29" cy="20" r="2.4" fill="currentColor" stroke="none"/><circle cx="14" cy="34" r="4" fill="#fff"/><circle cx="34" cy="34" r="4" fill="#fff"/>',
    delivery: '<rect x="4" y="13" width="24" height="19"/><path d="M28 19h8l6 7v6H28z"/><path d="M31 19v7h11"/><circle cx="12" cy="34" r="4" fill="#fff"/><circle cx="35" cy="34" r="4" fill="#fff"/>',
    carried: '<circle cx="24" cy="7" r="4.5"/><path d="M24 12v15M24 27l-6 14M24 27l6 14"/><rect x="12" y="15" width="24" height="12" fill="#fff"/><path d="M12 19h24"/>',
    keep: '<rect x="8" y="8" width="32" height="32"/><path d="M15 24l6 6 12-13" stroke-width="3"/>',
    change: '<path d="M17 6v24a8 8 0 0 0 8 8h17" stroke-width="6" stroke-linecap="butt"/>',
    unsure: '<circle cx="24" cy="24" r="17"/><path d="M18.5 19a5.5 5.5 0 1 1 7.8 5c-1.4.7-2.3 1.7-2.3 3.2V29"/><circle cx="24" cy="34" r="1.6" fill="currentColor" stroke="none"/>',
    fine: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="20" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="20" r="1.8" fill="currentColor" stroke="none"/><path d="M16.5 28c4 5 11 5 15 0"/>',
    meh: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="20" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="20" r="1.8" fill="currentColor" stroke="none"/><path d="M17 30h14"/>',
    angry: '<circle cx="24" cy="24" r="17"/><path d="M15 16l6 3M33 16l-6 3"/><circle cx="18.5" cy="22" r="1.8" fill="currentColor" stroke="none"/><circle cx="29.5" cy="22" r="1.8" fill="currentColor" stroke="none"/><path d="M16.5 33c4-5 11-5 15 0"/>',
    up: '<path d="M6 44h36"/><path d="M15 38V10M8 18l7-9 7 9M33 38V10M26 18l7-9 7 9" stroke-width="3.2"/>',
  };
  window.ICON = (k, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${P[k] || ""}</svg>`;
})();
