/* Ressources embarquées : géométrie de la carte, vue satellite, photos et animation du logo.
   Elles restent dans prototype/src/ et docs/brand/ (mêmes fichiers que le prototype artefact). */
import map95 from "@proto/map-95.json";
import satMeta from "@proto/satellite/satellite.json";
import satDept from "@proto/satellite/dept.webp";
import satSector from "@proto/satellite/sector.webp";
import splashGif from "@brand/95-alerte-animation.gif";
import type { MapGeometry, SatelliteData } from "@/types";

const onboarding = import.meta.glob<string>("@proto/onboarding/slide-*.webp", { eager: true, import: "default" });
const alerts = import.meta.glob<string>("@proto/alertes/*.webp", { eager: true, import: "default" });
const stem = (p: string) => p.slice(p.lastIndexOf("/") + 1).replace(/\.webp$/, "");

export const ASSETS = {
  MAP_95: map95 as unknown as MapGeometry,
  SAT_95: { ...satMeta, dept: { ...satMeta.dept, href: satDept }, sector: { ...satMeta.sector, href: satSector } } as SatelliteData,
  /** Pages de présentation de l'onboarding, par numéro (1 à 3) */
  ONB_PHOTOS: Object.fromEntries(Object.entries(onboarding).map(([p, url]) => [Number(stem(p).replace("slide-", "")), url])) as Record<number, string>,
  /** Photos des alertes de démonstration, par clé « <alerte>-<n> » */
  ALERT_PHOTOS: Object.fromEntries(Object.entries(alerts).map(([p, url]) => [stem(p), url])) as Record<string, string>,
  SPLASH_GIF: splashGif,
};
