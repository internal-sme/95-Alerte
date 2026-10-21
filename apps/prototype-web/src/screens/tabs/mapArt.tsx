/* =====================================================================
   ÉCRANS — phase 0 : écrans d'onglets provisoires + bibliothèque de composants
   ===================================================================== */

/* ---- Carte d'accueil : fond illustré du secteur Pontoise / Cergy (phase 3 : carte interactive complète) ---- */
export const MAP_VIEW = { lat: 49.0508, lng: 2.1008, x: 195, y: 270, kx: 3200, ky: 4864 };

export const NEAR_KM = 5;

export function projectToMap(p) {
  return { x: MAP_VIEW.x + (p.lng - MAP_VIEW.lng) * MAP_VIEW.kx, y: MAP_VIEW.y - (p.lat - MAP_VIEW.lat) * MAP_VIEW.ky };
}

/* Doublons (CDC §81) : un seul marqueur par événement, celui qui a le plus de confirmations */
export function dedupeEvents(alerts) {
  const best = {};
  alerts.forEach((a) => {
    if (!a.duplicateGroup) return;
    const cur = best[a.duplicateGroup];
    if (!cur || a.votesUp > cur.votesUp) best[a.duplicateGroup] = a;
  });
  return alerts.filter((a) => !a.duplicateGroup || best[a.duplicateGroup] === a);
}

/* Regroupement simple : marqueurs à moins de 30 px l'un de l'autre → un cluster */
export function clusterPins(alerts) {
  const pts = alerts.map((a) => ({ a, ...projectToMap(a) })).filter((p) => p.x > 20 && p.x < 370 && p.y > 96 && p.y < 590);
  const used = new Set();
  const pins = [];
  pts.forEach((p) => {
    if (used.has(p.a.id)) return;
    const group = pts.filter((q) => !used.has(q.a.id) && Math.hypot(q.x - p.x, q.y - p.y) < 30);
    group.forEach((q) => used.add(q.a.id));
    pins.push({
      key: group.map((q) => q.a.id).join("-"),
      alerts: group.map((q) => q.a),
      x: group.reduce((s, q) => s + q.x, 0) / group.length,
      y: group.reduce((s, q) => s + q.y, 0) / group.length,
    });
  });
  return pins;
}

export const MAP_ART = (
  <svg className="map-art" viewBox="0 0 390 768" aria-hidden="true">
    <rect className="land" width="390" height="768" />
    <path className="forest" d="M282 0H390V150C362 168 318 160 298 128C280 98 270 40 282 0Z" />
    <path className="forest" d="M0 470C38 452 84 470 92 512C100 556 64 592 22 600L0 602Z" />
    <path className="forest" d="M330 420C356 398 390 404 390 404V540C360 552 330 534 322 504C316 478 314 440 330 420Z" />
    <path className="urban" d="M150 230C176 206 238 200 262 226C286 252 280 300 252 320C224 340 176 336 156 312C136 288 128 252 150 230Z" />
    <path className="urban" d="M236 288C262 276 316 290 322 322C328 356 300 376 268 372C240 368 222 344 222 318C222 302 226 294 236 288Z" />
    <path className="urban" d="M20 300C46 280 110 290 134 318C156 346 150 404 120 420C90 436 40 424 22 396C4 368 0 318 20 300Z" />
    <path className="urban" d="M40 190C64 176 112 184 124 206C134 226 120 250 94 256C66 262 40 250 32 230C26 214 28 198 40 190Z" />
    <path className="water" d="M396 120C352 156 304 198 268 230C246 250 232 274 214 292C192 314 160 324 136 336C106 352 80 388 76 428C72 470 96 500 132 512C172 526 206 548 222 590C236 628 232 690 240 772" />
    <path className="road-case minor" d="M190 262C154 248 114 232 78 220C44 208 14 202 -4 200" />
    <path className="road-case minor" d="M196 290C170 312 132 334 84 344" />
    <path className="road-case" d="M266 -4C262 76 256 150 248 214C242 262 244 330 254 478" />
    <path className="road-case" d="M394 650C334 590 292 530 254 478C224 438 176 408 122 394C80 384 40 380 -4 380" />
    <path className="road minor" d="M190 262C154 248 114 232 78 220C44 208 14 202 -4 200" />
    <path className="road minor" d="M196 290C170 312 132 334 84 344" />
    <path className="road" d="M266 -4C262 76 256 150 248 214C242 262 244 330 254 478" />
    <path className="road" d="M394 650C334 590 292 530 254 478C224 438 176 408 122 394C80 384 40 380 -4 380" />
    <text className="label" x="262" y="250" textAnchor="middle">Pontoise</text>
    <text className="label" x="290" y="392" textAnchor="middle">Saint-Ouen-l'Aumône</text>
    <text className="label" x="60" y="446" textAnchor="middle">Cergy</text>
    <text className="label" x="80" y="176" textAnchor="middle">Osny</text>
    <text className="label water-label" x="344" y="198" textAnchor="middle">L'Oise</text>
  </svg>
);
