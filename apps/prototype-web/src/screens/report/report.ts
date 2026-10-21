import { PHOTO_ALT } from "@/data/photos";
import { ALERT_TTL, CATEGORY_BY_ID, COMMUNES, COMMUNE_BY_ID, ME_ID, SEED_ALERTS } from "@/data/seed";
import { MAP95, kmToLatLng, placeAt } from "@/map/geo";
import { StepCategory } from "@/screens/report/StepCategory";
import { StepDescription } from "@/screens/report/StepDescription";
import { StepIdentity } from "@/screens/report/StepIdentity";
import { StepPhoto } from "@/screens/report/StepPhoto";
import { StepPlace } from "@/screens/report/StepPlace";
import { StepPreview } from "@/screens/report/StepPreview";
import { StepType } from "@/screens/report/StepType";
import { foldQuery, haversineKm } from "@/utils/index";

import type { Alert, Draft } from "@/types";

/* =====================================================================
   PHASE 6 — Création d'une alerte (ALERT-02 ; rapport docs/benchmark/signalement-refonte.html, H1 à H6)
   Une question par écran, barre d'étapes et bouton principal immobiles (smart animate), brouillon de session.
   ===================================================================== */

export const REPORT_STEPS = [
  { id: "type", label: "Type" }, { id: "category", label: "Catégorie" }, { id: "place", label: "Lieu" },
  { id: "description", label: "Description" }, { id: "photo", label: "Photo" }, { id: "identity", label: "Identité" }, { id: "preview", label: "Aperçu" },
];

export const REPORT_FAMILIES = { negative: ["incident", "vigilance", "info"], positive: ["positive", "info"] };

export const MAX_PHOTOS = 3;

export const isCritical = (cat) => cat && cat.family === "incident"; // consigne de sécurité + accès à « Situation urgente ? »

export const slug = (s) => foldQuery(s).replace(/ /g, "-");

/* Communes hors de la liste de démonstration : enregistrées à la volée pour qu'une alerte publiée y soit affichée */
export function communeIdFor(name, epci, c) {
  const known = COMMUNES.find((x) => foldQuery(x.name) === foldQuery(name));
  if (known) return known.id;
  const id = slug(name);
  if (!COMMUNE_BY_ID[id]) {
    const quartiers = (MAP95 ? MAP95.quartiers : []).filter((q) => q.name && q.commune === c.code).map((q) => q.name);
    const entry = { id, name, interco: epci || "cp", ...kmToLatLng(c.c[0], c.c[1]), quartiers: quartiers.length ? quartiers : ["Centre"] };
    COMMUNES.push(entry);
    COMMUNE_BY_ID[id] = entry;
  }
  return id;
}

/* Adresse « en direct » sous l'épingle : commune et quartier réels de la carte, voie connue la plus proche (≤ 350 m) */
export function reverseGeocode(x, y) {
  const at = placeAt(x, y);
  const ll = kmToLatLng(x, y);
  if (!at.inside || !at.commune) return { inside: false, x, y, ...ll };
  const communeId = communeIdFor(at.commune.name, at.commune.epci, at.commune);
  let street = null;
  let best = 0.35;
  SEED_ALERTS.forEach((a) => {
    if (!a.street) return;
    const d = haversineKm(ll, a);
    if (d < best) { best = d; street = a.street; }
  });
  const quartier = at.quartier ? at.quartier.name : COMMUNE_BY_ID[communeId].quartiers[0];
  return { inside: true, x, y, ...ll, communeId, quartier, street };
}

/* 6.5 : titre proposé d'après la catégorie et le lieu (H1), description facultative */
export function suggestTitle(d) {
  const cat = CATEGORY_BY_ID[d.categoryId];
  const p = d.place;
  if (!p || !p.inside) return cat.label;
  if (p.street) return `${cat.label} ${p.street.charAt(0).toLowerCase()}${p.street.slice(1)}`;
  return `${cat.label} à ${COMMUNE_BY_ID[p.communeId].name}`;
}

/* 6.6 : photos simulées (H5) — caméra avec consigne, galerie fictive, envoi avec progression, erreur et réessai */
export const demoGallery = () => Object.keys(PHOTO_ALT); // photos de démonstration (définies avec la fiche, phase 5)

/* Vraie caméra quand l'appareil en a une (getUserMedia) : le navigateur demande l'autorisation.
   Sans caméra, ou si la page n'y a pas droit (ex. artefact intégré sans droit caméra), caméra simulée. */
export async function detectCamera() {
  const md = navigator.mediaDevices;
  if (!md || !md.getUserMedia || !window.isSecureContext) return "none";
  const doc = document as Document & { permissionsPolicy?: { allowsFeature(feature: string): boolean }; featurePolicy?: { allowsFeature(feature: string): boolean } };
  const policy = doc.permissionsPolicy || doc.featurePolicy;
  if (policy && policy.allowsFeature && !policy.allowsFeature("camera")) return "none";
  try {
    const devices = await md.enumerateDevices();
    return devices.some((dev) => dev.kind === "videoinput") ? "available" : "none";
  } catch (e) {
    return "none";
  }
}

export const CAMERA_MAX_SIDE = 1600; // photo réduite avant l'envoi (la capture d'écran du flux ne contient aucune métadonnée de position)

export function captureFrame(video) {
  const k = Math.min(1, CAMERA_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * k);
  canvas.height = Math.round(video.videoHeight * k);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export const CAMERA_STATES = {
  asking: { icon: "camera", title: "Autorisez l'accès à l'appareil photo", text: "Votre navigateur vous demande l'autorisation. L'appareil photo sert uniquement à photographier votre signalement." },
  denied: { icon: "camera-slash", title: "Accès à l'appareil photo refusé", text: "Pour prendre une photo, autorisez l'appareil photo dans les réglages de votre navigateur. Vous pouvez aussi choisir une photo dans la galerie." },
  unavailable: { icon: "camera-slash", title: "Appareil photo indisponible", text: "Il est peut-être utilisé par une autre application. Réessayez, ou choisissez une photo dans la galerie." },
};

/* L'alerte telle qu'elle sera publiée (aperçu et publication) */
export function draftAlert(d: Draft, now: number, id = "draft"): Alert {
  const p = d.place;
  return {
    id, categoryId: d.categoryId, title: d.title.trim(), description: (d.description || "").trim(), communeId: p.communeId, quartier: p.quartier, street: p.street || "",
    lat: p.lat, lng: p.lng, createdAt: now, expiresAt: now + ALERT_TTL, authorId: ME_ID, anonymous: d.identity === "anonymous",
    votesUp: 0, votesDown: 0, commentsCount: 0, hasPhoto: d.photos.length > 0, photos: d.photos.filter((ph) => ph.status === "done").map((ph) => ph.src || ph.key),
    transmission: "transmis", status: "active", duplicateGroup: null, areaKm: null,
  };
}

/* 6.9 : publication → « publiée » → routage animé vers le service ; 6.11 : erreur réseau, refus */
export const PERSONAL_DATA = /(\b0[1-9](?:[\s.-]?\d{2}){4}\b)|(\b[A-Z]{2}-\d{3}-[A-Z]{2}\b)|(@[a-z0-9-]+\.)/i;

export const REPORT_STEP_VIEWS = { type: StepType, category: StepCategory, place: StepPlace, description: StepDescription, photo: StepPhoto, identity: StepIdentity, preview: StepPreview };
