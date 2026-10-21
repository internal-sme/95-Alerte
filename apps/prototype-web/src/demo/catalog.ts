import { SEED_ALERTS, USERS } from "@/data/seed";
import { DEFAULT_FILTER } from "@/filters/filters";
import { projectKm } from "@/map/geo";
import { reverseGeocode } from "@/screens/report/report";
import { DEFAULT_POSITION, initialAuth } from "@/store/store";

/* =====================================================================
   ÉCRANS PAR PHASE (panneau de démo) : ouvrir directement ce qui a été réalisé à chaque phase
   Le prototype complet ne change pas : chaque bouton place l'app dans l'état de l'écran choisi.
   ===================================================================== */

export const DEMO_GPS = { ...DEFAULT_POSITION, source: "gps", communeId: "pontoise", permission: "granted", radiusKm: 5 };

export const jumpApp = (s, o: Record<string, any> = {}) => ({
  ...s,
  prefs: { ...s.prefs, onboardingSeen: true, reportHintSeen: true, homeView: "map", ...(o.prefs || {}) },
  session: { ...s.session, status: "in", user: o.guest ? null : USERS.me, identity: o.guest ? "non_verifiee" : "verifiee", method: o.guest ? "invite" : "demo", position: o.position || DEMO_GPS },
  mapFilter: o.mapFilter || DEFAULT_FILTER,
  listSort: o.listSort || "relevance",
  nav: o.nav || { tab: "map", stack: [] },
  sheet: o.sheet || null,
  modal: o.modal || null,
  demo: { ...s.demo, ...(o.demo || {}) },
  mapFocus: o.mapFocus ? { ...o.mapFocus, key: Date.now() } : null,
  votes: o.votes || s.votes,
  alerts: o.alerts || s.alerts,
});

export const jumpOnb = (step, slide = 0, o: Record<string, any> = {}) => (s) => ({ ...s, prefs: { ...s.prefs, onboardingSeen: false }, session: { ...s.session, status: "onboarding", user: null, position: o.position || DEFAULT_POSITION }, onb: { step, slide, pending: o.pending } });

export const jumpAuth = (step, extra: Record<string, any> = {}) => (s) => ({ ...s, prefs: { ...s.prefs, onboardingSeen: true }, session: { ...s.session, status: "auth", user: null }, auth: { ...initialAuth(), step, ...extra } });

export const jumpStack = (id) => ({ tab: "map", stack: [{ id, params: {}, key: `${id}-jump-${Date.now()}` }] }); // clé neuve : l'écran repart de zéro

export const jumpSheet = (id, snap = "half", params: Record<string, any> = {}) => ({ id, params, snap });

export const jumpAlert = (id, params: Record<string, any> = {}) => ({ tab: "map", stack: [{ id: "alert", params: { id, ...params }, key: `alert-${id}-jump` }] });

export const CARNOT = SEED_ALERTS.find((a) => a.id === "a1");

/* Phase 6 : un signalement d'incendie rue Carnot (S4), arrêté à l'étape voulue */
export const jumpReport = (s, patch: Record<string, any> = {}, o: Record<string, any> = {}) => {
  const k = projectKm(CARNOT);
  const draft = { step: "type", type: "negative", categoryId: "incendie", place: reverseGeocode(k.x, k.y), title: "Incendie rue Carnot",
    description: "Fumée noire au-dessus des toits, odeur de brûlé jusqu'à la gare.", photos: [{ id: "ph-1", key: "a1-1", status: "done", progress: 100 }], identity: "anonymous", ...patch };
  return { ...jumpApp(s, { nav: jumpStack("report"), sheet: o.sheet, modal: o.modal, demo: o.demo }), draft };
};

export const PHASE_SCREENS = [
  { n: 0, title: "Fondations techniques et composants", items: [
    ["Bibliothèque de composants", (s) => jumpApp(s, { nav: jumpStack("components") })],
    ["Bottom sheet (exemple)", (s) => jumpApp(s, { sheet: jumpSheet("demo-sheet") })],
    ["Modale de confirmation", (s) => jumpApp(s, { modal: { title: "Supprimer cette alerte ?", body: "Elle ne sera plus visible. Cette action est définitive.", confirmLabel: "Supprimer", destructive: true } })],
    ["Hors connexion", (s) => jumpApp(s, { demo: { offline: true } })],
    ["Onglet Activité", (s) => jumpApp(s, { nav: { tab: "activity", stack: [] } })],
    ["Onglet Profil", (s) => jumpApp(s, { nav: { tab: "profile", stack: [] } })],
  ] },
  { n: 1, title: "Démarrage et connexion", items: [
    ["Démarrage (splash)", (s) => ({ ...s, prefs: { ...s.prefs, onboardingSeen: true }, session: { ...s.session, status: "splash", user: null } })],
    ["Connexion", jumpAuth("login")],
    ["FranceConnect", jumpAuth("fc")],
    ["FranceConnect · chargement", jumpAuth("fc-loading")],
    ["FranceConnect · erreur", jumpAuth("fc-error")],
    ["Se connecter par e-mail", jumpAuth("signin")],
    ["Inscription · nom", jumpAuth("signup-info")],
    ["Inscription · téléphone", jumpAuth("signup-phone")],
    ["Inscription · e-mail", jumpAuth("signup-email")],
    ["Inscription · identité", jumpAuth("signup-id")],
    ["Statut de l'identité", jumpAuth("id-status", { idResult: "reussie" })],
    ["Profil public", jumpAuth("profile")],
    ["Inscription terminée", jumpAuth("done")],
    ["Profil sans compte", (s) => jumpApp(s, { guest: true, nav: { tab: "profile", stack: [] } })],
  ] },
  { n: 2, title: "Onboarding et territoire", items: [
    ["Présentation · 1", jumpOnb("slides", 0)],
    ["Présentation · 2", jumpOnb("slides", 1)],
    ["Présentation · 3", jumpOnb("slides", 2)],
    ["Localisation (amorce)", jumpOnb("location")],
    ["Zone suivie (rayon)", jumpOnb("detected", 0, { position: DEMO_GPS })],
    ["Préparation de la carte", jumpOnb("prep", 0, { position: DEMO_GPS, pending: { communeId: "pontoise", source: "gps" } })],
    ["Localisation refusée", jumpOnb("denied")],
    ["Position introuvable", jumpOnb("unavailable")],
    ["Choisir sa commune", jumpOnb("commune")],
    ["Bien démarrer (accueil)", (s) => jumpApp(s, { prefs: { startHidden: false, startVoted: false, startReported: false } })],
  ] },
  { n: 3, title: "Accueil : carte interactive", items: [
    ["Carte d'accueil", (s) => jumpApp(s)],
    ["Alerte sélectionnée", (s) => jumpApp(s, { mapFocus: { kind: "alert", id: "a1" } })],
    ["Alerte de zone", (s) => jumpApp(s, { mapFocus: { kind: "alert", id: "a30" } })],
    ["Bascule en liste", (s) => jumpApp(s, { prefs: { homeView: "list" } })],
    ["Comprendre la carte", (s) => jumpApp(s, { sheet: jumpSheet("map-legend") })],
    ["Carte sans position", (s) => jumpApp(s, { position: DEFAULT_POSITION })],
    ["Zone sans alerte", (s) => jumpApp(s, { demo: { emptyZone: true } })],
    ["Erreur de chargement", (s) => jumpApp(s, { demo: { networkError: true } })],
    ["Beaucoup d'alertes", (s) => jumpApp(s, { demo: { manyAlerts: true } })],
  ] },
  { n: 4, title: "Liste, recherche et filtres", items: [
    ["Fil des alertes", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] } })],
    ["Autour de moi (tri distance)", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, listSort: "distance" })],
    ["Récentes", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, listSort: "recent" })],
    ["Trier par", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, sheet: jumpSheet("list-sort") })],
    ["Filtres", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, sheet: jumpSheet("map-filters", "full") })],
    ["Filtré : Positives + Culture + 5 km", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, mapFilter: { ...DEFAULT_FILTER, type: "positive", categories: ["culture"], distance: 5 } })],
    ["Aucun résultat filtré", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [] }, mapFilter: { ...DEFAULT_FILTER, categories: ["sport"], period: "1h" } })],
    ["Recherche", (s) => jumpApp(s, { nav: { tab: "alerts", stack: [{ id: "search", params: {}, key: "search-jump" }] } })],
    ["Lieu recherché sur la carte", (s) => jumpApp(s, { mapFocus: { kind: "place", placeKind: "lieu", label: CARNOT.street, sub: "Voie ou lieu · Pontoise", lat: CARNOT.lat, lng: CARNOT.lng, communeId: "pontoise", zoom: 120 } })],
  ] },
  { n: 5, title: "Fiche alerte et votes", items: [
    ["Fiche alerte (incendie, urgent)", (s) => jumpApp(s, { nav: jumpAlert("a1") })],
    ["Fiche d'un événement positif", (s) => jumpApp(s, { nav: jumpAlert("a31") })],
    ["Fiche d'une alerte de zone", (s) => jumpApp(s, { nav: jumpAlert("a30") })],
    ["Visionneuse photo", (s) => jumpApp(s, { nav: { tab: "map", stack: [...jumpAlert("a1").stack, { id: "photo-viewer", params: { id: "a1", index: 0 }, key: "pv-jump" }] } })],
    ["Vote enregistré (modifiable)", (s) => jumpApp(s, { nav: jumpAlert("a6"), votes: { ...s.votes, a6: 1 }, alerts: s.alerts.map((a) => (a.id === "a6" ? { ...a, votesUp: a.votesUp + 1 } : a)) })],
    ["Voter sans compte", (s) => jumpApp(s, { guest: true, nav: jumpAlert("a6"), sheet: jumpSheet("sign-in", "half", { reason: "vote" }) })],
    ["Suivi du traitement", (s) => jumpApp(s, { nav: jumpAlert("a6"), sheet: jumpSheet("alert-timeline", "half", { id: "a6" }) })],
    ["Suivre : être prévenu ?", (s) => jumpApp(s, { nav: jumpAlert("a6"), prefs: { followAsked: false }, sheet: jumpSheet("follow", "full", { id: "a6" }) })],
    ["Partager l'alerte", (s) => jumpApp(s, { nav: jumpAlert("a6"), sheet: jumpSheet("share", "full", { id: "a6" }) })],
    ["Menu ⋯ (mon alerte)", (s) => jumpApp(s, { nav: jumpAlert("a25"), sheet: jumpSheet("alert-menu", "half", { id: "a25" }) })],
    ["Supprimer : confirmation", (s) => jumpApp(s, { nav: jumpAlert("a25"), modal: { title: "Supprimer cette alerte ?", body: "Elle ne sera plus visible sur la carte ni dans la liste. Le service déjà saisi en est informé. Cette action est définitive.", confirmLabel: "Supprimer", destructive: true, onConfirm: () => {} } })],
    ["Situation urgente ?", (s) => jumpApp(s, { nav: { tab: "map", stack: [...jumpAlert("a1").stack, { id: "emergency", params: { id: "a1" }, key: "em-jump" }] } })],
    ["Doublons", (s) => jumpApp(s, { nav: jumpAlert("a19") })],
    ["Expire bientôt", (s) => jumpApp(s, { nav: jumpAlert("a22") })],
    ["Alerte expirée", (s) => jumpApp(s, { nav: jumpAlert("a24") })],
    ["Alerte supprimée", (s) => jumpApp(s, { nav: jumpAlert("a28") })],
    ["Alerte modérée", (s) => jumpApp(s, { nav: jumpAlert("a11"), alerts: s.alerts.map((a) => (a.id === "a11" ? { ...a, status: "moderee" } : a)) })],
    ["Chargement", (s) => jumpApp(s, { nav: jumpAlert("a1", { demo: "loading" }) })],
    ["Erreur de chargement", (s) => jumpApp(s, { nav: jumpAlert("a1"), demo: { networkError: true } })],
    ["Hors connexion", (s) => jumpApp(s, { nav: jumpAlert("a6"), demo: { offline: true } })],
    ["Onboarding · choix de la carte", jumpOnb("map-style", 0, { position: DEMO_GPS, pending: { communeId: "pontoise", source: "gps", coords: { lat: 49.05388, lng: 2.09924 } } })],
    ["Carte satellite", (s) => jumpApp(s, { prefs: { mapStyle: "satellite" } })],
    ["Carte satellite · alerte sélectionnée", (s) => jumpApp(s, { prefs: { mapStyle: "satellite" }, mapFocus: { kind: "alert", id: "a30" } })],
    ["Fiche · mini-carte satellite", (s) => jumpApp(s, { prefs: { mapStyle: "satellite" }, nav: jumpAlert("a31") })],
    ["Fond de carte (depuis la carte)", (s) => jumpApp(s, { sheet: jumpSheet("map-style") })],
    ["Profil · fond de carte", (s) => jumpApp(s, { nav: { tab: "profile", stack: [] } })],
  ] },
  { n: 6, title: "Création d'une alerte (+ Signaler)", items: [
    ["Étape 1 · Type", (s) => jumpReport(s, { step: "type", type: null, categoryId: null, place: null, title: "", identity: null, photos: [] })],
    ["Étape 2 · Catégorie (incident)", (s) => jumpReport(s, { step: "category", place: null, title: "" })],
    ["Étape 2 · Catégorie (positif)", (s) => jumpReport(s, { step: "category", type: "positive", categoryId: "culture", place: null, title: "" })],
    ["Étape 3 · Lieu", (s) => jumpReport(s, { step: "place", title: "" })],
    ["Lieu hors du Val-d'Oise", (s) => jumpReport(s, { step: "place", title: "", place: { inside: false, lat: 49.2, lng: 1.45 } })],
    ["Étape 4 · Description (titre proposé)", (s) => jumpReport(s, { step: "description", title: "", description: "" })],
    ["Étape 5 · Photo", (s) => jumpReport(s, { step: "photo", photos: [] })],
    ["Caméra (simulée)", (s) => jumpReport(s, { step: "photo", photos: [], camera: true })],
    ["Galerie", (s) => jumpReport(s, { step: "photo", photos: [] }, { sheet: jumpSheet("report-gallery") })],
    ["Photos en cours d'envoi", (s) => jumpReport(s, { step: "photo", photos: [{ id: "ph-1", key: "a1-1", status: "done", progress: 100 }, { id: "ph-2", key: "a1-2", status: "uploading", progress: 40 }] })],
    ["Échec de l'envoi d'une photo", (s) => jumpReport(s, { step: "photo", photos: [{ id: "ph-1", key: "a1-1", status: "error", progress: 60 }] }, { demo: { networkError: true } })],
    ["Étape 6 · Identité", (s) => jumpReport(s, { step: "identity", identity: null })],
    ["Étape 7 · Aperçu", (s) => jumpReport(s, { step: "preview" })],
    ["Aperçu hors connexion", (s) => jumpReport(s, { step: "preview" }, { demo: { offline: true } })],
    ["Publication et routage", (s) => jumpReport(s, { step: "publishing" })],
    ["Erreur de publication", (s) => jumpReport(s, { step: "error" })],
    ["Publication refusée", (s) => jumpReport(s, { step: "refused", description: "Le conducteur du véhicule AB-123-CD a vu le départ du feu." })],
    ["Quitter : garder le brouillon ?", (s) => jumpReport(s, { step: "description" }, { modal: { title: "Quitter le signalement ?", body: "Gardez votre brouillon pour le reprendre plus tard, ou abandonnez-le.", confirmLabel: "Garder le brouillon", cancelLabel: "Abandonner" } })],
    ["Reprendre un brouillon", (s) => jumpReport(s, { step: "photo", saved: true })],
    ["Signaler sans compte", (s) => jumpApp(s, { guest: true, sheet: jumpSheet("sign-in", "half", { reason: "report" }) })],
  ] },
  { n: 7, title: "Commentaires et signalement de contenu", items: [] },
  { n: 8, title: "Activité et notifications", items: [] },
  { n: 9, title: "Profil, paramètres, aide, légal", items: [] },
  { n: 10, title: "États transverses, recette et scénarios de test", items: [], scenarios: true },
];

/* Scénarios de test du PRD (§ scénarios) : jouables de bout en bout à la phase 10 */
export const TEST_SCENARIOS = [
  ["S1", "Première utilisation"], ["S2", "Consultation"], ["S3", "Signalement positif"], ["S4", "Signalement négatif"], ["S5", "Interaction"],
  ["S6", "Suppression"], ["S7", "Alerte proche"], ["S8", "Traitement"], ["S9", "Commentaire"], ["S10", "Signalement d'un contenu"],
];
