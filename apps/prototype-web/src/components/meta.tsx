/* ---- Composants spécifiques 95 Alerte ---- */
export const MARKER_SHAPES = {
  incident: <path d="M18 2.5 33.5 18 18 33.5 2.5 18Z" strokeLinejoin="round" />,
  vigilance: <path d="M18 3 34 32H2Z" strokeLinejoin="round" />,
  positive: <circle cx="18" cy="18" r="15.5" />,
  info: <rect x="3" y="3" width="30" height="30" rx="8" />,
};

export const FAMILY_LABEL = { incident: "Incident", vigilance: "Vigilance", positive: "Événement positif", info: "Information" };

export const STATUS_META = {
  brouillon: { cls: "st-draft", icon: "pencil-simple", label: "Brouillon" },
  active: { cls: "st-active", icon: "check-circle-fill", label: "Active" },
  proche: { cls: "st-soon", icon: "timer", label: "Expire bientôt" },
  transmis: { cls: "st-sent", icon: "paper-plane-tilt", label: "Transmise" },
  pris_en_compte: { cls: "st-sent", icon: "check", label: "Prise en compte" },
  en_traitement: { cls: "st-progress", icon: "arrows-clockwise", label: "En traitement" },
  traite: { cls: "st-done", icon: "check-circle-fill", label: "Traitée" },
  cloture: { cls: "st-done", icon: "check-circle-fill", label: "Clôturée" },
  expiree: { cls: "st-expired", icon: "clock", label: "Expirée" },
  supprimee: { cls: "st-expired", icon: "trash-simple", label: "Supprimée" },
  moderee: { cls: "st-moderated", icon: "eye-slash", label: "Contenu modéré" },
  rejetee: { cls: "st-rejected", icon: "x", label: "Rejetée" },
};
