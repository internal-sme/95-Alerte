import { CATEGORY_BY_ID, COMMUNE_BY_ID, HOUR, MIN, SERVICE_TYPES, USERS } from "@/data/seed";
import { useActions, useStore } from "@/store/store";

/* =====================================================================
   UTILS
   ===================================================================== */

export const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible : l'app fonctionne sans */ }
  },
};

export function fmtRelative(ms) {
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function fmtRemaining(ms) {
  if (ms <= 0) return "0 min";
  const totalMin = Math.ceil(ms / MIN);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export function fmtClock(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function haversineKm(a, b) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function fmtDistance(km) {
  const m = Math.round((km * 1000) / 50) * 50; // 0,99 km s'arrondit à « 1,0 km », jamais « 1000 m »
  if (m < 1000) return `${Math.max(50, m)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function publicName(user) {
  if (!user) return "Citoyen anonyme"; // exploration sans compte : aucun nom à afficher
  if (user.display === "first") return user.firstName;
  return `${user.firstName} ${user.lastName[0]}.`;
}

/* Affichage public de l'auteur (CDC §9, §76, §89) : jamais d'email, téléphone ni adresse */
export function publicAuthor(item) {
  if (item.anonymous) return { name: "Citoyen anonyme", anonymous: true, initials: null };
  const u = USERS[item.authorId];
  return { name: publicName(u), anonymous: false, initials: (u.firstName[0] + u.lastName[0]).toUpperCase() };
}

/* Lieu affiché selon la précision de la catégorie (CDC §78) */
export function displayPlace(alert) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const commune = COMMUNE_BY_ID[alert.communeId].name;
  if (cat.precision === "rue" && alert.street) return `${alert.street}, ${commune}`;
  return `${alert.quartier}, ${commune}`;
}

/* Routage simulé : catégorie + localisation → service compétent (CDC §35) */
export function routeAlert(alert) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const svc = SERVICE_TYPES[cat.service];
  const commune = COMMUNE_BY_ID[alert.communeId];
  const name = svc.scope === "departement" ? `${svc.label} · Val-d'Oise` : `Service ${svc.label} · Ville de ${commune.name}`;
  return { id: cat.service, name, delayHours: svc.delay };
}

export function alertLifecycle(alert, now) {
  if (alert.status !== "active") return alert.status;
  const left = alert.expiresAt - now;
  if (left <= 0) return "expiree";
  if (left <= HOUR) return "proche";
  return "active";
}

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export const foldChar = (ch) => { const n = ch.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); return /^[a-z0-9]$/.test(n) ? n : " "; };

export const fold = (s) => [...s].map(foldChar).join(""); // même longueur que la chaîne d'origine (pour surligner)

export const foldQuery = (s) => fold(s).replace(/\s+/g, " ").trim();

/* Garde-fou réseau : les actions de connexion ont besoin du réseau (CDC §69) */
export function useOnline() {
  const { state } = useStore();
  const { toast } = useActions();
  return (fn) => (...args) => {
    if (state.demo.offline) { toast("Connexion impossible hors connexion. Vérifiez votre réseau.", { tone: "error" }); return; }
    fn(...args);
  };
}

/* Démarrage, en trois temps : le halo jaune apparaît seul, puis l'animation officielle du logo
   (docs/brand/95-alerte-animation.gif, intégrée par le build dans ASSETS.SPLASH_GIF), puis le chargement.
   Le GIF a un fond blanc : il est fondu dans le halo (mode multiply) en clair ; en sombre ou avec les
   animations réduites, le logo SVG le remplace (variables --splash-gif / --splash-svg du Design System).
   À la sortie, la position du logo est mémorisée pour la transition vers l'accueil (« smart animate »). */
export const motionReduced = () => document.documentElement.getAttribute("data-motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
