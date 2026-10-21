import { useMemo } from "react";
import { ALERT_TTL, CATEGORY_BY_ID, HOUR } from "@/data/seed";
import { useNow, useStore, useVisibleAlerts } from "@/store/store";
import { haversineKm } from "@/utils/index";

/* =====================================================================
   FILTRES ET TRI (phase 4) : un seul filtre dans le store, partagé par la carte et la liste
   ===================================================================== */

export const DEFAULT_FILTER = { type: "all", categories: [], period: "all", distance: null, urgentOnly: false };

export const PERIODS = [{ v: "1h", l: "1 h", ms: HOUR }, { v: "6h", l: "6 h", ms: 6 * HOUR }, { v: "today", l: "Aujourd'hui" }, { v: "24h", l: "24 h", ms: 24 * HOUR }];

export const DISTANCES = [{ v: 0.5, l: "500 m" }, { v: 1, l: "1 km" }, { v: 5, l: "5 km" }, { v: 10, l: "10 km" }, { v: null, l: "Tout le Val-d'Oise" }];

export const SORTS = [
  { v: "relevance", l: "Pertinence", d: "Proximité, récence, importance et confirmations" },
  { v: "distance", l: "Distance", d: "Les plus proches d'abord (Autour de moi)" },
  { v: "recent", l: "Récentes", d: "Les plus récentes d'abord" },
];

export function mapFilterMatch(f, a, pos, now) {
  const cat = CATEGORY_BY_ID[a.categoryId];
  if (f.type !== "all" && cat.type !== f.type) return false;
  if (f.categories.length && !f.categories.includes(cat.id)) return false;
  if (f.urgentOnly && cat.priority !== "critique") return false;
  if (f.period !== "all") {
    const p = PERIODS.find((x) => x.v === f.period);
    const since = p.ms ? now - p.ms : new Date(now).setHours(0, 0, 0, 0);
    if (a.createdAt < since) return false;
  }
  if (f.distance && pos && pos.source !== "default" && haversineKm(pos, a) > f.distance) return false;
  return true;
}

export const activeFilterCount = (f) => f.categories.length + (f.period !== "all" ? 1 : 0) + (f.distance ? 1 : 0) + (f.urgentOnly ? 1 : 0);

/* Alertes visibles (actives, non expirées) qui passent le filtre courant */
export function useFilteredAlerts() {
  const { state } = useStore();
  const now = useNow();
  const alerts = useVisibleAlerts();
  const pos = state.session.position;
  return useMemo(() => alerts.filter((a) => mapFilterMatch(state.mapFilter, a, pos, now)), [alerts, state.mapFilter, pos, now]);
}

/* Pertinence (tâche 4.3) : proximité 40 %, récence 30 %, importance 20 %, engagement 10 % */
export const IMPORTANCE = { critique: 1, elevee: 0.6, normale: 0.3 };

export function relevance(a, pos, now) {
  const prox = pos && pos.source !== "default" ? Math.max(0, 1 - haversineKm(pos, a) / 20) : 0.5;
  const recency = Math.max(0, 1 - (now - a.createdAt) / ALERT_TTL);
  const engagement = Math.min(1, (a.votesUp + a.commentsCount) / 50);
  return 0.4 * prox + 0.3 * recency + 0.2 * IMPORTANCE[CATEGORY_BY_ID[a.categoryId].priority] + 0.1 * engagement;
}
