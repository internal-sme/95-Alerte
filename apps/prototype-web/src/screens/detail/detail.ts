import { BOOT_TIME, MIN, TRANSMISSION_STEPS } from "@/data/seed";

/* =====================================================================
   FICHE ALERTE (phase 5) — comprendre, puis réagir (rapport docs/benchmark/fiche-refonte.html, G1 à G6)
   ===================================================================== */

export const isEmergencyCategory = (cat) => cat.family === "incident"; // incendie, accident, sécurité, inondation : rappel d'urgence (PRD F-17)

export const shareCode = (id) => { let h = 7; for (const ch of id) h = (h * 131 + ch.charCodeAt(0)) % 1679616; return h.toString(36).toUpperCase().padStart(4, "7"); };

export const shareUrl = (alert) => `https://95alerte.fr/a/${shareCode(alert.id)}`; // lien fictif : ni auteur, ni position de l'utilisateur

export const fmtDelay = (h) => (h < 48 ? `${h} h` : `${Math.round(h / 24)} jours`);

/* Horodatage simulé des étapes atteintes, entre la publication et l'ouverture de l'app */
export const STEP_SHARE = [0, 0.04, 0.35, 0.6, 0.85, 0.95];

export function stepTimes(alert) {
  const idx = TRANSMISSION_STEPS.findIndex((st) => st.id === alert.transmission);
  const age = Math.max(MIN, BOOT_TIME - alert.createdAt);
  return TRANSMISSION_STEPS.map((st, i) => (i <= idx ? alert.createdAt + Math.max(i ? MIN : 0, age * STEP_SHARE[i]) : null));
}

/* 5.11 : au premier « Suivre », choisir ce qui sera notifié (Strava, Google Photos) */
export const FOLLOW_LEVELS = [
  { value: "all", icon: "bell-ringing", title: "Pour tout changement", description: "Commentaires, statut du traitement, expiration" },
  { value: "status", icon: "buildings", title: "Seulement le traitement", description: "Transmise, prise en compte, traitée" },
  { value: "none", icon: "bell-slash", title: "Non merci", description: "L'alerte reste dans vos alertes suivies, sans notification" },
];

export const FOLLOW_TOAST = {
  all: "Vous suivez cette alerte. Vous serez prévenu de tout changement.",
  status: "Vous suivez cette alerte. Vous serez prévenu de son traitement.",
  none: "Alerte ajoutée à vos alertes suivies, sans notification.",
};

/* Invité : expliquer pourquoi se connecter, au lieu d'un toast sans issue (audit phase 5) */
export const SIGN_IN_REASONS = {
  vote: { title: "Connectez-vous pour voter", text: "Confirmer ou contester un signalement demande un compte : un seul avis par personne et par alerte." },
  report: { title: "Connectez-vous pour signaler", text: "Un compte permet de transmettre votre signalement au bon service et d'en suivre le traitement. Vous pourrez publier anonymement." },
  follow: { title: "Connectez-vous pour suivre", text: "Avec un compte, vous êtes prévenu du traitement de l'alerte et la retrouvez dans votre activité." },
  comment: { title: "Connectez-vous pour commenter", text: "Un compte garde la discussion utile : un nom public pour chaque commentaire, que vous pouvez supprimer à tout moment. Vous pourrez commenter anonymement." },
  flag: { title: "Connectez-vous pour signaler un contenu", text: "Un compte évite les signalements abusifs. Votre signalement reste confidentiel : l'auteur ne saura pas qui l'a signalé." },
};

/* 5.8 : écran « Situation urgente ? » (PRD F-17, G3) — numéros en clair, lieu à dicter, un seul bouton rouge */
export const EMERGENCY_NUMBERS = [
  ["112", "Numéro d'urgence européen", "Depuis n'importe quel téléphone"],
  ["18", "Pompiers", "Incendie, accident, personne en danger"],
  ["17", "Police secours", "Agression, danger immédiat"],
  ["15", "SAMU", "Urgence médicale"],
  ["114", "Par SMS", "Personnes sourdes, malentendantes ou ne pouvant pas parler"],
];
