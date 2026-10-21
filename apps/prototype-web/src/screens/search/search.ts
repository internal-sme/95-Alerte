import { COMMUNES, COMMUNE_BY_ID, SEED_ALERTS } from "@/data/seed";
import { GEO, MAP95, kmToLatLng } from "@/map/geo";
import { foldQuery } from "@/utils/index";

/* =====================================================================
   RECHERCHE (phase 4, tâche 4.5) : communes, quartiers, lieux, alertes et catégories
   F3 : choisir un lieu montre ses alertes sur la carte sans changer la zone suivie.
   F5 : 5 recherches récentes au plus, gardées sur l'appareil (préférences), effaçables.
   ===================================================================== */

export const PLACE_ICON = { commune: "map-pin", quartier: "polygon", lieu: "path" };

export const PLACE_RANK = { commune: 0, quartier: 1, lieu: 2 };

export let SEARCH_PLACES = null;

export function searchPlaces() {
  if (SEARCH_PLACES) return SEARCH_PLACES;
  const byName = Object.fromEntries(COMMUNES.map((c) => [foldQuery(c.name), c]));
  const nameByCode = {};
  const out = [];
  (MAP95 ? MAP95.communes : []).forEach((c) => {
    nameByCode[c.code] = c.name;
    const known = byName[foldQuery(c.name)];
    out.push({ kind: "commune", label: c.name, sub: GEO.epci[c.epci]?.name || "Val-d'Oise", ...kmToLatLng(c.c[0], c.c[1]), communeId: known ? known.id : null, zoom: 34 });
  });
  (MAP95 ? MAP95.quartiers : []).forEach((q) => {
    const cn = nameByCode[q.commune];
    const known = byName[foldQuery(cn)];
    out.push({ kind: "quartier", label: q.name, sub: `Quartier · ${cn}`, ...kmToLatLng(q.c[0], q.c[1]), communeId: known ? known.id : null, zoom: 80 });
  });
  const seen = new Set();
  SEED_ALERTS.forEach((a) => {
    const k = a.street + a.communeId;
    if (!a.street || seen.has(k)) return;
    seen.add(k);
    out.push({ kind: "lieu", label: a.street, sub: `Voie ou lieu · ${COMMUNE_BY_ID[a.communeId].name}`, lat: a.lat, lng: a.lng, communeId: a.communeId, zoom: 120 });
  });
  SEARCH_PLACES = out;
  return out;
}
