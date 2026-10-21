import { BOOT_TIME, CATEGORY_BY_ID, MIN, SEED_COMMENTS } from "@/data/seed";

/* =====================================================================
   PHASE 7 — Commentaires et signalement de contenu (ALERT-04, F-10, F-11 ; rapport docs/benchmark/commentaires-refonte.html, I1 à I6)
   ===================================================================== */

export const COMMENT_MAX = 500;

export const COMMENT_PAGE = 10;

// Commentaires de démonstration qui complètent chaque fil jusqu'au compteur de l'alerte (personnes fictives)
export const COMMENT_POOL = {
  negative: ["Je confirme, je suis passé devant il y a peu.", "Toujours d'actualité à l'instant.", "Merci pour l'info, je fais un détour.", "Prudence en passant, ce n'est pas balisé.",
    "Même constat de mon côté.", "C'est la deuxième fois cette semaine.", "Merci d'avoir signalé, j'allais le faire.", "Ça s'est amélioré depuis ce matin.", "Les enfants passent par là pour aller à l'école, attention."],
  positive: ["Super initiative, merci !", "On y sera avec les enfants.", "C'est jusqu'à quelle heure ?", "Merci pour le partage.", "Très bonne ambiance l'an dernier.",
    "Bravo aux bénévoles.", "Faut-il apporter quelque chose ?", "Je relaie autour de moi.", "Belle idée pour le quartier."],
  reply: ["Merci, c'est noté.", "D'accord avec vous.", "Oui, j'ai vu la même chose.", "Bonne question, je ne sais pas.", "Merci pour la précision."],
};

export function seedThread(alert) {
  const out = [...(SEED_COMMENTS[alert.id] || [])];
  const pool = COMMENT_POOL[CATEGORY_BY_ID[alert.categoryId].type];
  const age = Math.max(2, Math.round((BOOT_TIME - alert.createdAt) / MIN));
  const seed = [...alert.id].reduce((h, ch) => h + ch.charCodeAt(0), 0);
  let k = 0;
  let lastRoot = (out.find((c) => !c.parentId && !c.status) || {}).id;
  while (out.length < alert.commentsCount) {
    const reply = k % 3 === 2 && lastRoot;
    const id = `${alert.id}-g${k}`;
    out.push({
      id, authorId: `u${((seed + k * 3) % 10) + 1}`, anonymous: k % 4 === 1,
      body: reply ? COMMENT_POOL.reply[(seed + k) % COMMENT_POOL.reply.length] : pool[(seed + k) % pool.length],
      ageMin: Math.max(1, Math.round(age * (1 - (k + 1) / (alert.commentsCount + 1)))), parentId: reply ? lastRoot : undefined,
    });
    if (!reply) lastRoot = id;
    k += 1;
  }
  return out;
}

export const threadOf = (state, alert) => state.comments[alert.id] || seedThread(alert);

/* I6 : règles de la communauté, en attendant le centre d'aide (phase 9) */
export const COMMUNITY_RULES = [
  ["chat-circle", "Restez courtois", "Pas d'insulte, de moquerie ni d'attaque personnelle."],
  ["eye", "Tenez-vous aux faits", "Ce que vous avez vu, où et quand."],
  ["lock-simple", "Aucune donnée personnelle", "Ni nom complet, ni téléphone, ni plaque d'immatriculation, ni adresse."],
  ["warning", "Ne mettez personne en danger", "N'incitez pas à se rendre sur place ni à gêner les secours."],
  ["flag", "Signalez plutôt que répondre", "Un contenu pose problème ? Signalez-le : la modération l'examinera."],
];

/* 7.4, 7.5 : signaler un contenu — motif → confirmer → merci (I4) ; le contenu reste visible (I5) */
export const REPORT_REASONS = [
  { id: "faux", label: (k) => (k === "alert" ? "Contenu faux ou faux signalement" : "Information fausse"), help: "Inventé, exagéré ou trompeur." },
  { id: "offensant", label: () => "Offensant ou inapproprié", help: "Insulte, moquerie, propos choquants." },
  { id: "dangereux", label: () => "Information dangereuse", help: "Incite à se mettre en danger ou à gêner les secours." },
  { id: "spam", label: () => "Spam ou publicité", help: "Message répété, sans rapport, commercial." },
  { id: "illegal", label: () => "Contenu illégal", help: "Menace, haine, données personnelles d'un tiers." },
  { id: "categorie", label: () => "Mauvaise catégorie", help: "Ce n'est pas le bon type d'événement.", alertOnly: true },
  { id: "lieu", label: () => "Mauvaise localisation", help: "L'événement n'est pas à cet endroit.", alertOnly: true },
  { id: "doublon", label: () => "Doublon", help: "Le même événement est déjà signalé.", alertOnly: true },
  { id: "autre", label: () => "Autre", help: "Précisez à l'étape suivante." },
];
