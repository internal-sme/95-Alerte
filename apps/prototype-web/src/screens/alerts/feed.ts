import { HOUR } from "@/data/seed";
import type { Alert } from "@/types";
import { relevance } from "@/filters/filters";
import { haversineKm } from "@/utils/index";

/* =====================================================================
   FIL DE L'ONGLET ALERTES (phase 4) : sections, tri, filtres partagés avec la carte
   ===================================================================== */

export const feedMemory = { loadedOnce: false };

export function feedGroups(list: Alert[], sort: string, ctx): { t: string; items: Alert[]; all?: string }[] {
  const { pos, now, hasPos, radius } = ctx;
  const km = (a) => haversineKm(pos, a);
  if (sort === "distance") {
    const sorted = [...list].sort((a, b) => km(a) - km(b));
    return ([["Moins de 1 km", 0, 1], ["1 à 5 km", 1, 5], ["5 à 10 km", 5, 10], ["Au-delà de 10 km", 10, Infinity]] as [string, number, number][])
      .map(([t, lo, hi]) => ({ t, items: sorted.filter((a) => km(a) >= lo && km(a) < hi) }));
  }
  if (sort === "recent") {
    const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
    const age = (a) => now - a.createdAt;
    return ([["Dernière heure", 0, HOUR], ["1 à 6 h", HOUR, 6 * HOUR], ["6 à 24 h", 6 * HOUR, Infinity]] as [string, number, number][])
      .map(([t, lo, hi]) => ({ t, items: sorted.filter((a) => age(a) >= lo && age(a) < hi) }));
  }
  // Pertinence : trois sections de trois alertes (sans doublon), puis le reste classé par score
  const used = new Set();
  const take = (arr) => arr.filter((a) => !used.has(a.id)).slice(0, 3).map((a) => { used.add(a.id); return a; });
  const near = hasPos ? take(list.filter((a) => km(a) <= radius).sort((a, b) => km(a) - km(b))) : [];
  const recent = take([...list].sort((a, b) => b.createdAt - a.createdAt));
  const popular = take([...list].sort((a, b) => (b.votesUp + b.commentsCount) - (a.votesUp + a.commentsCount)));
  const rest = list.filter((a) => !used.has(a.id)).sort((a, b) => relevance(b, pos, now) - relevance(a, pos, now));
  return [
    { t: "À proximité", items: near, all: "distance" },
    { t: "Récentes", items: recent, all: "recent" },
    { t: "Populaires", items: popular },
    { t: "Toutes les autres", items: rest },
  ];
}
