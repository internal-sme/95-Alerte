import { Fragment } from "react";
import { ASSETS } from "@/assets";
import type { Alert } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_BY_ID, seededJitter } from "@/data/seed";
import { useStore } from "@/store/store";
import { alertLifecycle, cx, fmtRemaining } from "@/utils/index";

/* =====================================================================
   CARTE INTERACTIVE DU VAL-D'OISE (phase 3)
   Géométrie : prototype/src/map-95.json (tools/build_map_95.py), embarquée par le build (window.MAP_95).
   Repère en kilomètres ; la vue est { cx, cy, s } : point du repère au centre de l'écran et échelle en px/km.
   ===================================================================== */

export const MAP95 = ASSETS.MAP_95 || null;

export const PROJ = MAP95 ? MAP95.proj : { lat0: 49.245, lng0: 1.6, kx: 72.95, ky: 111.32 };

export const DEPT_KM = MAP95 ? { x: MAP95.bounds[0], y: MAP95.bounds[1], w: MAP95.bounds[2], h: MAP95.bounds[3] } : { x: 0, y: 0, w: 72.5, h: 37.4 };

export function projectKm(p) {
  return { x: (p.lng - PROJ.lng0) * PROJ.kx, y: (PROJ.lat0 - p.lat) * PROJ.ky };
}

/* Chemins « M x yL x y…Z » → anneaux, pour savoir dans quelle commune ou quel quartier tombe un point */
export function pathRings(d) {
  return d.split("Z").filter(Boolean).map((r) => r.slice(1).split("L").map((pt) => pt.split(" ").map(Number)));
}

export function inRings(rings, x, y) {
  let inside = false;
  rings.forEach((ring) => {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  });
  return inside;
}

export const GEO = MAP95 ? {
  dept: pathRings(MAP95.dept),
  communes: MAP95.communes.map((c) => ({ ...c, rings: pathRings(c.d) })),
  quartiers: MAP95.quartiers.map((q) => ({ ...q, rings: pathRings(q.d) })),
  epci: Object.fromEntries(MAP95.epci.map((e) => [e.id, e])),
} : null;

/* Où tombe un point du repère : département, intercommunalité, commune, quartier fictif */
export function placeAt(x, y) {
  if (!GEO || !inRings(GEO.dept, x, y)) return { inside: false };
  const commune = GEO.communes.find((c) => inRings(c.rings, x, y));
  const quartier = commune ? GEO.quartiers.find((q) => q.commune === commune.code && inRings(q.rings, x, y)) : null;
  return { inside: true, commune, quartier, epci: commune ? GEO.epci[commune.epci] : null };
}

/* Quatre niveaux de zoom (tâche 3.2) : seuils en px/km */
export const MAP_LEVELS = [
  { id: "departement", label: "Département", min: 0 },
  { id: "interco", label: "Intercommunalité", min: 10 },
  { id: "commune", label: "Commune", min: 24 },
  { id: "quartier", label: "Quartier", min: 60 },
];

export const MAP_MAX_S = 170;

export function levelOf(s) {
  return MAP_LEVELS.reduce((k, l, i) => (s >= l.min ? i : k), 0);
}

export function levelText(level, place) {
  if (!place.inside) return "Hors Val-d'Oise";
  const commune = place.commune ? place.commune.name : "Val-d'Oise";
  if (level === 0) return "Département · Val-d'Oise";
  if (level === 1) return `Intercommunalité · ${place.epci ? place.epci.short : commune}`;
  if (level === 3 && place.quartier) return `Quartier · ${place.quartier.name}, ${commune}`;
  return `Commune · ${commune}`;
}

/* Alertes de zone (inondation, travaux) : polygone translucide autour du marqueur (tâche 3.11) */
export function areaPath(alert) {
  const c = projectKm(alert);
  const pts = Array.from({ length: 12 }, (_, i) => {
    const [j] = seededJitter(`${alert.id}${i}`, 0.5);
    const r = alert.areaKm * (0.82 + j);
    const t = (i / 12) * Math.PI * 2;
    return `${(c.x + Math.cos(t) * r * 1.15).toFixed(3)} ${(c.y + Math.sin(t) * r * 0.85).toFixed(3)}`;
  });
  return `M${pts.join("L")}Z`;
}

/* Fond de carte : construit une seule fois ; le niveau de zoom choisit les couches visibles (CSS) */
export const GEO_LAYERS = MAP95 ? (
  <Fragment>
    <path className="geo-dept" d={MAP95.dept} />
    {MAP95.forests.map((f) => <path key={f.name} className="geo-forest" d={f.d} />)}
    {MAP95.lakes.map((l) => <path key={l.name} className="geo-lake" d={l.d} />)}
    <g className="geo-communes">{MAP95.communes.map((c) => <path key={c.code} d={c.d} />)}</g>
    <g className="geo-quartiers">{MAP95.quartiers.map((q) => <path key={q.commune + q.name} d={q.d} />)}</g>
    <g className="geo-epci">{MAP95.epci.map((e) => <path key={e.id} d={e.d} />)}</g>
    {MAP95.water.map((w) => <path key={w.name} className={cx("geo-water", w.w > 8 && "is-large")} d={w.d} />)}
    {MAP95.roads.map((r) => <path key={`${r.ref}-case`} className="geo-road-case" d={r.d} />)}
    {MAP95.roads.map((r) => <path key={r.ref} className={cx("geo-road", `is-${r.cls}`)} d={r.d} />)}
    <path className="geo-dept-line" d={MAP95.dept} />
  </Fragment>
) : null;

/* Vue satellite (tâche 5.12) : images Copernicus Sentinel-2 (10 m, 4 juin 2023) posées dans le même repère en km
   que les couches vectorielles ; hors du Val-d'Oise, un voile garde la frontière lisible. Rien n'est chargé à l'exécution. */
export const SAT95 = ASSETS.SAT_95 || null;

export const SAT_SOURCE = "Image Copernicus Sentinel-2, 2023";

export const SAT_LAYERS = SAT95 && MAP95 ? (
  <g className="geo-sat">
    {["dept", "sector"].map((k) => <image key={k} href={SAT95[k].href} x={SAT95[k].x} y={SAT95[k].y} width={SAT95[k].w} height={SAT95[k].h} preserveAspectRatio="none" />)}
    <path className="geo-sat-mask" fillRule="evenodd" d={`M-60 -60H140V110H-60Z ${MAP95.dept}`} />
  </g>
) : null;

export const MAP_STYLES = [
  { value: "plan", label: "Plan", description: "Simple et lisible : communes, routes, alertes bien contrastées" },
  { value: "satellite", label: "Satellite", description: "Vue aérienne réelle, avec les noms des lieux par-dessus" },
];

/* Fond choisi (préférence locale) ; « satellite » seulement si les images sont embarquées */
export function useSatellite(force?: boolean) {
  const { state } = useStore();
  return !!SAT_LAYERS && (force || state.prefs.mapStyle) === "satellite";
}

/* Libellés selon le niveau, sans chevauchement (les plus peuplés d'abord) */
export function mapLabels(level, toScreen, w, h, topInset = MAP_INSET_TOP - 16) {
  if (!MAP95) return [];
  const cand = [];
  const add = (text, c, cls, priority) => cand.push({ text, c, cls, priority });
  if (level === 0) {
    add("Val-d'Oise", [DEPT_KM.x + DEPT_KM.w * 0.47, DEPT_KM.y + DEPT_KM.h * 0.32], "lbl-dept", 0);
    MAP95.communes.slice(0, 6).forEach((c, i) => add(c.name, c.c, "lbl-town", 10 + i));
  }
  if (level === 1) {
    MAP95.epci.filter((e) => e.n > 2).forEach((e) => add(e.short, e.c, "lbl-epci", 1));
    MAP95.communes.filter((c) => c.pop >= 25000).forEach((c, i) => add(c.name, c.c, "lbl-town", 10 + i));
  }
  if (level >= 2) {
    MAP95.communes.forEach((c, i) => add(c.name, c.c, level === 3 ? "lbl-town is-strong" : "lbl-town", 10 + i));
    MAP95.water.forEach((wt) => add(wt.name, wt.c, "lbl-water", 400));
  }
  if (level === 3) {
    MAP95.quartiers.forEach((q) => add(q.name, q.c, "lbl-quartier", 2));
    MAP95.forests.forEach((f) => add(f.name, f.c, "lbl-forest", 300));
  }
  if (level <= 1) MAP95.outside.forEach((o) => add(o.name, o.c, "lbl-outside", 200));
  cand.sort((a, b) => a.priority - b.priority);
  const boxes = [];
  const out = [];
  cand.forEach((l) => {
    const p = toScreen(l.c[0], l.c[1]);
    const lw = l.text.length * (l.cls === "lbl-dept" ? 9 : 6.6) + 8;
    const lh = l.cls === "lbl-dept" ? 22 : 16;
    const box = [p.x - lw / 2, p.y - lh / 2, p.x + lw / 2, p.y + lh / 2];
    if (box[2] < 0 || box[0] > w || box[3] < 0 || box[1] > h) return;
    if (box[1] < topInset) return; // rien entre les puces ni sous la barre de recherche
    if (boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) return;
    boxes.push(box);
    out.push({ ...l, x: p.x, y: p.y, key: l.cls + l.text + l.c.join() });
  });
  return out;
}

/* Regroupement à l'écran (tâche 3.4) : marqueurs à moins de `radius` px → un regroupement ; il se divise au zoom */
export function clusterOnScreen(items, radius) {
  const used = new Set();
  const out = [];
  items.forEach((p) => {
    if (used.has(p.a.id)) return;
    const group = items.filter((q) => !used.has(q.a.id) && Math.hypot(q.x - p.x, q.y - p.y) < radius);
    group.forEach((q) => used.add(q.a.id));
    out.push({ key: group.map((q) => q.a.id).join("-"), alerts: group.map((q) => q.a), x: group.reduce((s, q) => s + q.x, 0) / group.length, y: group.reduce((s, q) => s + q.y, 0) / group.length });
  });
  return out;
}

export const PRIORITY_RANK = { critique: 0, elevee: 1, normale: 2 };

export const MAP_INSET_TOP = 148; // barre de recherche, puces et étiquette de niveau

export const SELECTION_HALF = 0.62; // fiche de sélection : assez haute pour tout montrer, la carte reste visible au-dessus

export const mapMemory = { lastView: null, lastZone: null, loadedOnce: false }; // vue conservée entre deux visites de l'onglet Carte (pour la même zone suivie)

/* Statut affiché sur une alerte (carte, fiche de sélection) */
export function alertStatus(alert: Alert, now: number, showStatus?: boolean) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const life = alertLifecycle(alert, now);
  if (life === "proche") return <StatusBadge status="proche" label={`Expire dans ${fmtRemaining(alert.expiresAt - now)}`} />;
  if (life === "expiree" || life === "supprimee" || life === "moderee") return <StatusBadge status={life} />;
  if (["pris_en_compte", "en_traitement", "traite", "cloture"].includes(alert.transmission)) return <StatusBadge status={alert.transmission} />;
  if (cat.type === "negative" || showStatus) return <StatusBadge status="transmis" />;
  return null;
}

export const kmToLatLng = (x, y) => ({ lat: PROJ.lat0 - y / PROJ.ky, lng: PROJ.lng0 + x / PROJ.kx });
