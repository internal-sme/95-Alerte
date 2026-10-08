/* =====================================================================
   95 Alerte — prototype mobile (phase A)
   Source : prototype/src/app.jsx → assemblé dans prototype/index.html
   par tools/build_prototype.py. Lire AGENTS.md et docs/task.md avant
   toute modification.
   ===================================================================== */
const { useState, useReducer, useEffect, useRef, useMemo, useCallback, createContext, useContext, Fragment } = React;

/* =====================================================================
   DATA — données fictives (communes réelles du Val-d'Oise, personnes fictives)
   ===================================================================== */
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const ALERT_TTL = 24 * HOUR; // R5 : une alerte expire au bout de 24 h
const BOOT_TIME = Date.now();

const INTERCOS = {
  cp: "CA de Cergy-Pontoise",
  vp: "CA Val Parisis",
  sg: "CA Saint Germain Boucles de Seine",
  pv: "CA Plaine Vallée",
  rpf: "CA Roissy Pays de France",
  vo3f: "CC Vallée de l'Oise et des Trois Forêts",
  vvs: "CC Vexin Val de Seine",
};

const COMMUNES = [
  { id: "pontoise", name: "Pontoise", interco: "cp", lat: 49.0508, lng: 2.1008, quartiers: ["Centre", "Les Louvrais", "Marcouville", "L'Hermitage"] },
  { id: "cergy", name: "Cergy", interco: "cp", lat: 49.0364, lng: 2.0631, quartiers: ["Grand Centre", "Axe Majeur", "Saint-Christophe", "Hauts-de-Cergy"] },
  { id: "saint-ouen-l-aumone", name: "Saint-Ouen-l'Aumône", interco: "cp", lat: 49.0447, lng: 2.1111, quartiers: ["Le Parc", "Liesse", "Épluches"] },
  { id: "osny", name: "Osny", interco: "cp", lat: 49.0603, lng: 2.0628, quartiers: ["Centre", "Moulin-à-Vent"] },
  { id: "argenteuil", name: "Argenteuil", interco: "sg", lat: 48.9472, lng: 2.2467, quartiers: ["Centre", "Val-Notre-Dame", "Orgemont", "Val d'Argent"] },
  { id: "bezons", name: "Bezons", interco: "sg", lat: 48.9261, lng: 2.2178, quartiers: ["Centre", "Agriculture"] },
  { id: "herblay", name: "Herblay-sur-Seine", interco: "vp", lat: 48.9897, lng: 2.165, quartiers: ["Centre", "Les Beauregards"] },
  { id: "franconville", name: "Franconville", interco: "vp", lat: 48.9886, lng: 2.23, quartiers: ["Centre", "Montédour"] },
  { id: "ermont", name: "Ermont", interco: "vp", lat: 48.99, lng: 2.2583, quartiers: ["Centre", "Les Chênes"] },
  { id: "taverny", name: "Taverny", interco: "vp", lat: 49.0264, lng: 2.2219, quartiers: ["Les Lignières", "Lisière de la forêt"] },
  { id: "montmorency", name: "Montmorency", interco: "pv", lat: 48.9883, lng: 2.3219, quartiers: ["Centre", "Les Champeaux"] },
  { id: "enghien", name: "Enghien-les-Bains", interco: "pv", lat: 48.9697, lng: 2.3092, quartiers: ["Lac", "Centre"] },
  { id: "sarcelles", name: "Sarcelles", interco: "rpf", lat: 48.9972, lng: 2.3797, quartiers: ["Lochères", "Les Vignes Blanches", "Village"] },
  { id: "garges", name: "Garges-lès-Gonesse", interco: "rpf", lat: 48.9728, lng: 2.3992, quartiers: ["Dame Blanche", "La Muette"] },
  { id: "villiers-le-bel", name: "Villiers-le-Bel", interco: "rpf", lat: 49.0089, lng: 2.3906, quartiers: ["Village", "Les Carreaux"] },
  { id: "gonesse", name: "Gonesse", interco: "rpf", lat: 48.9869, lng: 2.4492, quartiers: ["Centre", "Saint-Blin"] },
  { id: "goussainville", name: "Goussainville", interco: "rpf", lat: 49.0325, lng: 2.465, quartiers: ["Centre", "Les Grandes Bornes"] },
  { id: "roissy", name: "Roissy-en-France", interco: "rpf", lat: 49.0036, lng: 2.5164, quartiers: ["Village"] },
  { id: "isle-adam", name: "L'Isle-Adam", interco: "vo3f", lat: 49.1111, lng: 2.2228, quartiers: ["Centre", "Nogent"] },
  { id: "magny", name: "Magny-en-Vexin", interco: "vvs", lat: 49.1556, lng: 1.7869, quartiers: ["Centre"] },
];
const COMMUNE_BY_ID = Object.fromEntries(COMMUNES.map((c) => [c.id, c]));

/* Services destinataires (routage simulé, CDC §35–§37) */
const SERVICE_TYPES = {
  securite: { label: "Sécurité et secours", scope: "departement", delay: null },
  voirie: { label: "Voirie", scope: "commune", delay: 72 },
  eclairage: { label: "Éclairage public", scope: "commune", delay: 48 },
  proprete: { label: "Propreté", scope: "commune", delay: 48 },
  espaces_verts: { label: "Espaces verts", scope: "commune", delay: 72 },
  tranquillite: { label: "Tranquillité publique", scope: "commune", delay: 24 },
  vie_locale: { label: "Vie locale et associative", scope: "commune", delay: null },
};

/* Catégories (CDC §15, §18) — famille de marqueur, priorité, précision d'affichage, service */
const CATEGORIES = [
  // Négatives
  { id: "incendie", label: "Incendie", type: "negative", family: "incident", icon: "fire", priority: "critique", precision: "rue", service: "securite" },
  { id: "accident", label: "Accident", type: "negative", family: "incident", icon: "car", priority: "elevee", precision: "rue", service: "securite" },
  { id: "securite", label: "Sécurité", type: "negative", family: "incident", icon: "shield-warning", priority: "elevee", precision: "quartier", service: "tranquillite" },
  { id: "inondation", label: "Inondation", type: "negative", family: "incident", icon: "drop", priority: "elevee", precision: "quartier", service: "securite" },
  { id: "voirie", label: "Voirie", type: "negative", family: "vigilance", icon: "traffic-cone", priority: "normale", precision: "rue", service: "voirie" },
  { id: "eclairage", label: "Éclairage", type: "negative", family: "vigilance", icon: "lightbulb", priority: "normale", precision: "rue", service: "eclairage" },
  { id: "proprete", label: "Propreté", type: "negative", family: "vigilance", icon: "trash", priority: "normale", precision: "rue", service: "proprete" },
  { id: "arbre", label: "Arbre tombé", type: "negative", family: "vigilance", icon: "tree", priority: "normale", precision: "rue", service: "espaces_verts" },
  { id: "nuisance", label: "Nuisance", type: "negative", family: "vigilance", icon: "speaker-high", priority: "normale", precision: "quartier", service: "tranquillite" },
  { id: "environnement-neg", label: "Pollution", type: "negative", family: "vigilance", icon: "leaf", priority: "normale", precision: "quartier", service: "espaces_verts" },
  { id: "travaux", label: "Travaux", type: "negative", family: "info", icon: "barricade", priority: "normale", precision: "rue", service: "voirie" },
  { id: "autre-neg", label: "Autre problème", type: "negative", family: "vigilance", icon: "dots-three", priority: "normale", precision: "quartier", service: "tranquillite" },
  // Positives
  { id: "solidarite", label: "Solidarité", type: "positive", family: "positive", icon: "hand-heart", priority: "normale", precision: "quartier", service: "vie_locale" },
  { id: "culture", label: "Culture", type: "positive", family: "positive", icon: "mask-happy", priority: "normale", precision: "rue", service: "vie_locale" },
  { id: "sport", label: "Sport", type: "positive", family: "positive", icon: "soccer-ball", priority: "normale", precision: "rue", service: "vie_locale" },
  { id: "evenement", label: "Événement", type: "positive", family: "positive", icon: "calendar-star", priority: "normale", precision: "rue", service: "vie_locale" },
  { id: "environnement-pos", label: "Action environnementale", type: "positive", family: "positive", icon: "leaf", priority: "normale", precision: "quartier", service: "espaces_verts" },
  { id: "info-utile", label: "Information utile", type: "positive", family: "info", icon: "megaphone", priority: "normale", precision: "quartier", service: "vie_locale" },
  { id: "autre-pos", label: "Autre bonne nouvelle", type: "positive", family: "positive", icon: "star", priority: "normale", precision: "quartier", service: "vie_locale" },
];
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* Personnes fictives */
const ME_ID = "me";
const USERS = {
  me: { id: "me", firstName: "Jean", lastName: "Dupont" },
  u1: { id: "u1", firstName: "Camille", lastName: "Renaud" },
  u2: { id: "u2", firstName: "Sami", lastName: "Lefèvre" },
  u3: { id: "u3", firstName: "Inès", lastName: "Benali" },
  u4: { id: "u4", firstName: "Thomas", lastName: "Marchand" },
  u5: { id: "u5", firstName: "Léa", lastName: "Dubois" },
  u6: { id: "u6", firstName: "Karim", lastName: "Aït-Saïd" },
  u7: { id: "u7", firstName: "Julie", lastName: "Perrin" },
  u8: { id: "u8", firstName: "Nora", lastName: "Haddad" },
  u9: { id: "u9", firstName: "Hugo", lastName: "Vasseur" },
  u10: { id: "u10", firstName: "Fatou", lastName: "Sow" },
};

/* Statuts (DESIGN_SYSTEM §2.3) */
const TRANSMISSION_STEPS = [
  { id: "envoye", label: "Signalement envoyé" },
  { id: "transmis", label: "Transmis au service compétent" },
  { id: "pris_en_compte", label: "Pris en compte" },
  { id: "en_traitement", label: "En cours de traitement" },
  { id: "traite", label: "Traité" },
  { id: "cloture", label: "Clôturé" },
];

/* Graine d'alertes : [id, catégorie, titre, description, commune, quartier, rue, âge (min), auteur|null (anonyme), ⬆, ⬇, 💬, photo, transmission, statut, groupe doublon] */
const ALERT_SEED = [
  ["a1", "incendie", "Fumée importante visible rue Carnot", "Fumée noire épaisse au-dessus des immeubles côté gare. Les pompiers ne sont pas encore sur place.", "pontoise", "Centre", "Rue Carnot", 12, null, 24, 3, 8, true, "transmis", "active", "g1"],
  ["a2", "accident", "Collision entre deux véhicules au rond-point", "Deux voitures accidentées, circulation très ralentie dans les deux sens.", "cergy", "Saint-Christophe", "Boulevard de l'Oise", 35, "u2", 15, 1, 4, true, "pris_en_compte", "active"],
  ["a3", "proprete", "Déchets abandonnés au pied des conteneurs", "Sacs éventrés, cartons et un matelas déposés depuis hier soir.", "argenteuil", "Val-Notre-Dame", "Rue Paul-Vaillant-Couturier", 300, "u3", 31, 1, 7, true, "traite", "active"],
  ["a4", "environnement-pos", "Nettoyage participatif du parc François-Mitterrand", "Rendez-vous à 10 h à l'entrée principale. Gants et sacs fournis, venez nombreux !", "cergy", "Axe Majeur", "Parc François-Mitterrand", 60, "u4", 43, 2, 12, true, "transmis", "active"],
  ["a5", "eclairage", "Trois lampadaires éteints avenue de la Gare", "Toute la portion entre la gare et la pharmacie est plongée dans le noir.", "ermont", "Centre", "Avenue de la Gare", 140, "me", 12, 0, 2, false, "traite", "active"],
  ["a6", "voirie", "Nid-de-poule dangereux sur la chaussée", "Trou d'environ 40 cm, déjà deux vélos tombés ce matin.", "saint-ouen-l-aumone", "Le Parc", "Chaussée Jules-César", 95, null, 22, 0, 3, true, "en_traitement", "active"],
  ["a7", "culture", "Concert gratuit au théâtre de verdure ce soir", "Orchestre d'harmonie de la ville, à partir de 19 h. Pensez à apporter un plaid.", "isle-adam", "Centre", "Parc Manchez", 180, "u5", 38, 1, 6, true, "transmis", "active"],
  ["a8", "arbre", "Arbre tombé sur la chaussée", "Un gros chêne bloque la voie de droite, la circulation se fait sur une seule file.", "montmorency", "Centre", "Rue de Jaigny", 50, "u6", 19, 0, 5, true, "en_traitement", "active"],
  ["a9", "inondation", "Rue inondée après l'orage, voitures bloquées", "Environ 30 cm d'eau au carrefour, plusieurs véhicules arrêtés.", "sarcelles", "Les Vignes Blanches", "Avenue Paul-Valéry", 75, null, 27, 2, 9, true, "transmis", "active"],
  ["a10", "sport", "Tournoi de football inter-quartiers samedi", "Inscriptions sur place dès 9 h, catégories 8-12 ans et 13-17 ans.", "garges", "Dame Blanche", "Stade Pierre-Bérégovoy", 400, "u7", 25, 0, 4, false, "transmis", "active"],
  ["a11", "nuisance", "Musique très forte depuis 2 h du matin", "Rassemblement bruyant sur le parking du lac.", "enghien", "Lac", "Boulevard du Lac", 260, null, 6, 4, 2, false, "pris_en_compte", "active"],
  ["a12", "securite", "Câble électrique arraché au sol", "Câble pendant jusqu'au trottoir près de l'arrêt de bus. Ne pas toucher.", "taverny", "Les Lignières", "Rue d'Herblay", 25, "u8", 17, 0, 3, true, "transmis", "active"],
  ["a13", "environnement-pos", "Plantation de 200 arbres au parc du Château", "Une belle matinée avec les écoles du quartier. Merci à tous les bénévoles.", "franconville", "Centre", "Parc du Château", 500, "u9", 51, 1, 10, true, "transmis", "active"],
  ["a14", "travaux", "Travaux de voirie : circulation alternée jusqu'à vendredi", "Feux provisoires installés, prévoir 10 minutes de plus aux heures de pointe.", "herblay", "Centre", "Rue de Paris", 220, "u10", 9, 0, 1, false, "transmis", "active"],
  ["a15", "proprete", "Dépôt de gravats en bordure de forêt", "Une dizaine de sacs de gravats et des plaques de plâtre.", "taverny", "Lisière de la forêt", "Chemin des Bouleaux", 610, null, 12, 1, 2, true, "en_traitement", "active"],
  ["a16", "evenement", "Fête de quartier place des Arts", "Stands, jeux pour enfants et repas partagé à partir de 12 h.", "villiers-le-bel", "Village", "Place des Arts", 90, "u2", 29, 0, 5, true, "transmis", "active"],
  ["a17", "info-utile", "Distribution gratuite de composteurs samedi matin", "Au centre technique municipal, sur présentation d'un justificatif de domicile.", "osny", "Centre", "Rue de Cergy", 330, "u3", 18, 0, 2, false, "transmis", "active"],
  ["a18", "accident", "Scooter renversé, conducteur pris en charge", "Les secours sont sur place, éviter le secteur.", "argenteuil", "Orgemont", "Rue d'Orgemont", 18, null, 8, 0, 2, false, "transmis", "active"],
  ["a19", "incendie", "Fumée noire au-dessus de la gare", "On voit la fumée depuis le quai, ça semble venir de la rue Carnot.", "pontoise", "Centre", "Place de la Gare", 9, null, 11, 0, 3, false, "transmis", "active", "g1"],
  ["a20", "solidarite", "Collecte de vêtements chauds au centre social", "Manteaux, couvertures et chaussures en bon état, jusqu'à 18 h.", "goussainville", "Centre", "Rue Louis-Basset", 700, "u4", 22, 0, 3, false, "transmis", "active"],
  ["a21", "eclairage", "Passage souterrain plongé dans le noir", "Plus aucun éclairage dans le passage piéton sous la voie ferrée.", "gonesse", "Saint-Blin", "Passage de la Gare", 1400, "u5", 14, 0, 2, false, "pris_en_compte", "active"],
  ["a22", "voirie", "Feu tricolore en panne au carrefour", "Feux éteints dans les deux sens, les voitures passent au hasard.", "cergy", "Grand Centre", "Boulevard de l'Hautil", 1410, null, 21, 1, 6, false, "en_traitement", "active"],
  ["a23", "proprete", "Encombrants sur le trottoir", "Canapé et meuble déposés devant le n° 12, le passage piéton est bloqué.", "ermont", "Les Chênes", "Rue Saint-Flaive", 1700, "me", 9, 0, 1, true, "traite", "expiree"],
  ["a24", "culture", "Exposition photo à la médiathèque", "« Le Vexin en lumière », entrée libre tout le week-end.", "magny", "Centre", "Rue de Crosne", 2000, "u6", 16, 0, 2, true, "transmis", "expiree"],
  ["a25", "voirie", "Banc public cassé square Marcel-Pagnol", "L'assise est fendue et une latte dépasse, risque de blessure pour les enfants.", "pontoise", "Les Louvrais", "Square Marcel-Pagnol", 240, "me", 7, 0, 1, true, "pris_en_compte", "active"],
  ["a26", "autre-neg", "Chien errant blessé près du canal", "Il boite et reste près du pont, il semble apeuré.", "saint-ouen-l-aumone", "Épluches", "Quai de l'Écluse", 45, null, 10, 0, 4, true, "transmis", "active"],
  ["a27", "evenement", "Inauguration de la nouvelle aire de jeux", "Ouverture officielle à 15 h, goûter offert aux enfants.", "roissy", "Village", "Rue de la Mairie", 150, "u7", 33, 0, 4, true, "transmis", "active"],
  ["a28", "eclairage", "Lampadaire clignotant (doublon)", "Supprimé par l'auteur : doublon d'une alerte existante.", "ermont", "Centre", "Avenue de la Gare", 600, "me", 0, 0, 0, false, "envoye", "supprimee"],
];

/* Positions précises des alertes visibles sur la carte d'accueil (secteur Pontoise / Cergy) */
const ALERT_POSITIONS = {
  a1: [49.04463, 2.10392], a19: [49.04628, 2.08986], a25: [49.06211, 2.11174], a6: [49.04463, 2.12174],
  a26: [49.03435, 2.13361], a2: [49.03846, 2.06174], a22: [49.03538, 2.06955], a4: [49.02531, 2.07486], a17: [49.06211, 2.06486],
};

function seededJitter(id, amp) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = ((h % 1000) / 1000 - 0.5) * amp;
  const b = ((((h / 1000) | 0) % 1000) / 1000 - 0.5) * amp;
  return [a, b];
}

function buildAlert(row) {
  const [id, categoryId, title, description, communeId, quartier, street, ageMin, authorId, up, down, comments, hasPhoto, transmission, status, duplicateGroup] = row;
  const commune = COMMUNE_BY_ID[communeId];
  const [dLat, dLng] = seededJitter(id, 0.012);
  const fixed = ALERT_POSITIONS[id];
  const createdAt = BOOT_TIME - ageMin * MIN;
  return {
    id, categoryId, title, description, communeId, quartier, street,
    lat: fixed ? fixed[0] : commune.lat + dLat, lng: fixed ? fixed[1] : commune.lng + dLng,
    createdAt, expiresAt: createdAt + ALERT_TTL,
    authorId: authorId || `u${(id.length % 9) + 1}`, // l'auteur reste connu du système (CDC §9)
    anonymous: !authorId,
    votesUp: up, votesDown: down, commentsCount: comments,
    hasPhoto, transmission, status, duplicateGroup: duplicateGroup || null,
  };
}

const SEED_ALERTS = ALERT_SEED.map(buildAlert);

/* Mode démo « beaucoup d'alertes » : alertes synthétiques réparties sur le territoire */
function generateManyAlerts(count = 80) {
  const titles = {
    proprete: "Dépôt sauvage signalé", voirie: "Chaussée dégradée", eclairage: "Lampadaire en panne",
    nuisance: "Nuisance sonore", solidarite: "Action solidaire", culture: "Animation culturelle",
    sport: "Rencontre sportive", evenement: "Événement de quartier", travaux: "Travaux en cours",
  };
  const cats = Object.keys(titles);
  return Array.from({ length: count }, (_, i) => {
    const commune = COMMUNES[i % COMMUNES.length];
    const cat = cats[i % cats.length];
    return buildAlert([`m${i}`, cat, titles[cat], "Alerte générée pour tester l'affichage d'un grand nombre d'alertes.", commune.id, commune.quartiers[i % commune.quartiers.length], "", 5 + ((i * 37) % 1300), i % 3 ? `u${(i % 10) + 1}` : null, (i * 7) % 40, (i * 3) % 6, (i * 5) % 12, i % 4 === 0, "transmis", "active"]);
  });
}

const SEED_COMMENTS = {
  a1: [
    { id: "c1", authorId: "u2", anonymous: false, body: "Les pompiers arrivent, on entend les sirènes depuis la place.", ageMin: 8 },
    { id: "c2", authorId: "u5", anonymous: true, body: "Merci pour l'info, je passe par Saint-Martin.", ageMin: 4, parentId: "c1" },
  ],
  a3: [{ id: "c3", authorId: "u7", anonymous: false, body: "Le service est passé ce midi, tout est propre maintenant.", ageMin: 90 }],
  a4: [
    { id: "c4", authorId: "u1", anonymous: false, body: "Super initiative ! On viendra avec les enfants.", ageMin: 40 },
    { id: "c5", authorId: "u9", anonymous: false, body: "Faut-il s'inscrire à l'avance ?", ageMin: 25 },
    { id: "c6", authorId: "u4", anonymous: false, body: "Non, venez directement à 10 h.", ageMin: 20, parentId: "c5" },
  ],
};

const SEED_NOTIFICATIONS = [
  { id: "n1", kind: "traite", alertId: "a5", title: "Votre signalement a été traité", body: "Trois lampadaires éteints avenue de la Gare", ageMin: 30, read: false },
  { id: "n2", kind: "proximite", alertId: "a1", title: "Nouvelle alerte à proximité", body: "Fumée importante visible rue Carnot · Pontoise", ageMin: 11, read: false },
  { id: "n3", kind: "commentaire", alertId: "a25", title: "Quelqu'un a commenté votre alerte", body: "Banc public cassé square Marcel-Pagnol", ageMin: 120, read: true },
];

/* =====================================================================
   UTILS
   ===================================================================== */
const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible : l'app fonctionne sans */ }
  },
};

function fmtRelative(ms) {
  const m = Math.max(0, Math.round(ms / MIN));
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

function fmtRemaining(ms) {
  if (ms <= 0) return "0 min";
  const totalMin = Math.ceil(ms / MIN);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

function fmtClock(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function haversineKm(a, b) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function fmtDistance(km) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

function publicName(user) {
  return `${user.firstName} ${user.lastName[0]}.`;
}

/* Affichage public de l'auteur (CDC §9, §76, §89) : jamais d'email, téléphone ni adresse */
function publicAuthor(item) {
  if (item.anonymous) return { name: "Citoyen anonyme", anonymous: true, initials: null };
  const u = USERS[item.authorId];
  return { name: publicName(u), anonymous: false, initials: (u.firstName[0] + u.lastName[0]).toUpperCase() };
}

/* Lieu affiché selon la précision de la catégorie (CDC §78) */
function displayPlace(alert) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const commune = COMMUNE_BY_ID[alert.communeId].name;
  if (cat.precision === "rue" && alert.street) return `${alert.street}, ${commune}`;
  return `${alert.quartier}, ${commune}`;
}

/* Routage simulé : catégorie + localisation → service compétent (CDC §35) */
function routeAlert(alert) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const svc = SERVICE_TYPES[cat.service];
  const commune = COMMUNE_BY_ID[alert.communeId];
  const name = svc.scope === "departement" ? `${svc.label} · Val-d'Oise` : `Service ${svc.label} · Ville de ${commune.name}`;
  return { id: cat.service, name, delayHours: svc.delay };
}

function alertLifecycle(alert, now) {
  if (alert.status !== "active") return alert.status;
  const left = alert.expiresAt - now;
  if (left <= 0) return "expiree";
  if (left <= HOUR) return "proche";
  return "active";
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* =====================================================================
   STORE — état unique (useReducer)
   ===================================================================== */
const PREFS_KEY = "95alerte:prefs";
const DEFAULT_PREFS = { theme: "system", textScale: 100, highContrast: false, reduceMotion: false, onboardingSeen: false, reportHintSeen: false };
const DEFAULT_DEMO = { offline: false, permissionDenied: false, networkError: false, emptyZone: false, manyAlerts: false, timeSpeed: 1 };

function initialState() {
  return {
    prefs: { ...DEFAULT_PREFS, ...storage.get(PREFS_KEY, {}) },
    demo: { ...DEFAULT_DEMO },
    session: { user: USERS.me, identity: "verifiee", position: { lat: 49.05388, lng: 2.09924, source: "manual", communeId: "pontoise" } },
    alerts: SEED_ALERTS,
    votes: { a4: 1, a8: 1 },
    follows: { a1: true },
    comments: SEED_COMMENTS,
    notifications: SEED_NOTIFICATIONS,
    nav: { tab: "map", stack: [] },
    sheet: null,
    modal: null,
    toasts: [],
  };
}

let toastSeq = 0;

function reducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, nav: { tab: action.tab, stack: [] }, sheet: null };
    case "PUSH":
      return { ...state, nav: { ...state.nav, stack: [...state.nav.stack, { id: action.screen, params: action.params || {}, key: `${action.screen}-${Date.now()}` }] }, sheet: null };
    case "POP":
      return { ...state, nav: { ...state.nav, stack: state.nav.stack.slice(0, -1) } };
    case "OPEN_SHEET":
      return { ...state, sheet: { id: action.sheet, params: action.params || {}, snap: action.snap || "half" } };
    case "SNAP_SHEET":
      return state.sheet ? { ...state, sheet: { ...state.sheet, snap: action.snap } } : state;
    case "CLOSE_SHEET":
      return { ...state, sheet: null };
    case "OPEN_MODAL":
      return { ...state, modal: action.modal };
    case "CLOSE_MODAL":
      return { ...state, modal: null };
    case "TOAST":
      return { ...state, toasts: [...state.toasts.slice(-2), { id: ++toastSeq, ...action.toast }] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "SET_PREF":
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case "SET_DEMO":
      return { ...state, demo: { ...state.demo, [action.key]: action.value } };
    case "VOTE": {
      // R8 : un vote par utilisateur et par alerte, modifiable
      const prev = state.votes[action.alertId] || 0;
      const next = prev === action.value ? 0 : action.value;
      const alerts = state.alerts.map((a) => {
        if (a.id !== action.alertId) return a;
        let { votesUp, votesDown } = a;
        if (prev === 1) votesUp--;
        if (prev === -1) votesDown--;
        if (next === 1) votesUp++;
        if (next === -1) votesDown++;
        return { ...a, votesUp, votesDown };
      });
      return { ...state, alerts, votes: { ...state.votes, [action.alertId]: next } };
    }
    case "RESET":
      return { ...initialState(), prefs: state.prefs };
    default:
      return state;
  }
}

const StoreContext = createContext(null);
const ClockContext = createContext(BOOT_TIME);
const useStore = () => useContext(StoreContext);
const useNow = () => useContext(ClockContext);

/* Actions de haut niveau partagées par les écrans */
function useActions() {
  const { dispatch } = useStore();
  return useMemo(() => ({
    setTab: (tab) => dispatch({ type: "SET_TAB", tab }),
    push: (screen, params) => dispatch({ type: "PUSH", screen, params }),
    pop: () => dispatch({ type: "POP" }),
    openSheet: (sheet, params, snap) => dispatch({ type: "OPEN_SHEET", sheet, params, snap }),
    snapSheet: (snap) => dispatch({ type: "SNAP_SHEET", snap }),
    closeSheet: () => dispatch({ type: "CLOSE_SHEET" }),
    confirm: (modal) => dispatch({ type: "OPEN_MODAL", modal }),
    closeModal: () => dispatch({ type: "CLOSE_MODAL" }),
    toast: (text, opts = {}) => dispatch({ type: "TOAST", toast: { text, tone: "success", ...opts } }),
    setPref: (key, value) => dispatch({ type: "SET_PREF", key, value }),
    setDemo: (key, value) => dispatch({ type: "SET_DEMO", key, value }),
    vote: (alertId, value) => dispatch({ type: "VOTE", alertId, value }),
    reset: () => dispatch({ type: "RESET" }),
  }), [dispatch]);
}

/* Sélecteurs */
function useVisibleAlerts() {
  const { state } = useStore();
  const now = useNow();
  return useMemo(() => {
    if (state.demo.emptyZone) return [];
    const base = state.demo.manyAlerts ? [...state.alerts, ...generateManyAlerts()] : state.alerts;
    return base.filter((a) => a.status === "active" && a.expiresAt > now);
  }, [state.alerts, state.demo.emptyZone, state.demo.manyAlerts, now]);
}

/* =====================================================================
   COMPOSANTS DE BASE (CSS : docs/design-system/index.html)
   ===================================================================== */
function Icon({ name, className, label, style }) {
  return (
    <svg className={cx("ph", className)} style={style} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <use href={`#ph-${name}`} />
    </svg>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function Button({ variant = "primary", block, loading, icon, children, className, ...rest }) {
  return (
    <button type="button" className={cx("btn", `btn-${variant}`, block && "btn-block", className)} aria-busy={loading || undefined} disabled={rest.disabled || loading} {...rest}>
      {loading ? <Spinner /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

function IconButton({ icon, label, badge, className, ...rest }) {
  return (
    <button type="button" className={cx("icon-btn", className)} aria-label={badge ? `${label}, ${badge} non lues` : label} {...rest}>
      <Icon name={icon} />
      {badge ? <span className="badge-count" aria-hidden="true">{badge}</span> : null}
    </button>
  );
}

function Chip({ selected, icon, children, onClick }) {
  return (
    <button type="button" className="chip" aria-pressed={!!selected} onClick={onClick}>
      {selected ? <Icon name="check" /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

function SegmentedControl({ options, value, onChange, label, block }) {
  return (
    <div className={cx("seg", block && "is-block")} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.icon ? <Icon name={o.icon} className="ph-sm" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ id, label, help, error, counter, max, textarea, ...rest }) {
  const Tag = textarea ? "textarea" : "input";
  const describedBy = [help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} className="input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} maxLength={max} {...rest} />
      {error ? <span className="err" id={`${id}-err`}><Icon name="warning-fill" className="ph-sm" />{error}</span> : null}
      {help || max ? (
        <span className="help" id={`${id}-help`}>
          <span>{help}</span>
          {max ? <span>{(rest.value || "").length}/{max}</span> : null}
        </span>
      ) : null}
    </div>
  );
}

function RadioCard({ name, value, checked, onChange, icon, iconTone = "primary", family, large, title, description }) {
  const tone = family ? undefined : iconTone === "muted" ? { background: "var(--surface-2)", color: "var(--text-muted)" } : { background: "var(--primary-soft)", color: "var(--primary)" };
  return (
    <label className={cx("radio-card", family && `fam-${family}`, large && "is-large")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="rc-icon" style={tone}><Icon name={icon} className="ph-lg" /></span>
      <span><b>{title}</b><small>{description}</small></span>
      <span className="rc-dot" />
    </label>
  );
}

function Switch({ label, checked, onChange, id }) {
  return (
    <label className="switch" htmlFor={id}>
      {label}
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

function ListItem({ icon, label, value, onClick, chevron = true }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className="list-item" onClick={onClick} style={onClick ? { width: "100%", border: 0, background: "none", textAlign: "left", cursor: "pointer" } : undefined}>
      {icon ? <Icon name={icon} /> : <span />}
      <span>{label}</span>
      <span className="val">{value}{chevron ? <Icon name="caret-right" className="ph-sm" /> : null}</span>
    </Tag>
  );
}

function Banner({ tone = "info", icon, title, children, className }) {
  return (
    <div className={cx("banner", `banner-${tone}`, className)} role={tone === "emergency" ? "note" : "status"}>
      <Icon name={icon || (tone === "offline" ? "wifi-slash" : tone === "emergency" ? "siren-fill" : "info")} />
      <span>{title ? <b>{title}</b> : null}{children}</span>
    </div>
  );
}

function Skeleton({ height = 14, width = "100%", radius }) {
  return <div className="skeleton" aria-hidden="true" style={{ height, width, borderRadius: radius }} />;
}

function EmptyState({ icon = "map-trifold", tone, title, children, action }) {
  const ill = tone === "error" ? { color: "var(--alert-incident)", background: "var(--alert-incident-soft)" } : undefined;
  return (
    <div className="empty">
      <span className="empty-ill" style={ill}><Icon name={icon} style={{ width: 32, height: 32 }} /></span>
      <h4>{title}</h4>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

function Stepper({ step, total, label }) {
  return (
    <div className="stepper" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Étape ${step} sur ${total}`}>
      <div className="lbl"><span>Étape {step} sur {total}</span><span>{label}</span></div>
      <div className="track"><i style={{ width: `${(step / total) * 100}%` }} /></div>
    </div>
  );
}

function Pill({ children, onClick, dot = true }) {
  return (
    <button type="button" className="pill" onClick={onClick}>
      {dot ? <span className="dot-new" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function Tooltip({ children }) {
  return <span className="tooltip" role="tooltip">{children}</span>;
}

/* ---- Composants spécifiques 95 Alerte ---- */
const MARKER_SHAPES = {
  incident: <path d="M18 2.5 33.5 18 18 33.5 2.5 18Z" strokeLinejoin="round" />,
  vigilance: <path d="M18 3 34 32H2Z" strokeLinejoin="round" />,
  positive: <circle cx="18" cy="18" r="15.5" />,
  info: <rect x="3" y="3" width="30" height="30" rx="8" />,
};
const FAMILY_LABEL = { incident: "Incident", vigilance: "Vigilance", positive: "Événement positif", info: "Information" };

function Marker({ family, icon, selected, critical, label, style, onClick }) {
  const content = (
    <Fragment>
      <svg className="shape" viewBox="0 0 36 36" aria-hidden="true">{MARKER_SHAPES[family]}</svg>
      <Icon name={`${icon}-fill`} style={family === "vigilance" ? { top: 4 } : undefined} />
      {critical ? <span className="marker-label">Urgent</span> : null}
    </Fragment>
  );
  const cls = cx("marker", `fam-${family}`, selected && "is-selected", critical && "is-critical");
  if (onClick) return <button type="button" className={cls} style={{ ...style, border: 0, background: "none", padding: 0, cursor: "pointer" }} aria-label={label} onClick={onClick}>{content}</button>;
  return <span className={cls} style={style} role={label ? "img" : undefined} aria-label={label}>{content}</span>;
}

function ClusterMarker({ count, onClick, style }) {
  const size = count < 10 ? "c-s" : count < 30 ? "c-m" : "c-l";
  return <button type="button" className={cx("cluster", size)} style={{ ...style, cursor: "pointer" }} onClick={onClick} aria-label={`${count} alertes regroupées, zoomer`}>{count}</button>;
}

function TypeBadge({ category, showFamily }) {
  return (
    <span className={cx("badge", "badge-type", `fam-${category.family}`)}>
      <Icon name={`${category.icon}-fill`} />
      {showFamily ? (category.type === "positive" ? "Positif" : "Négatif") : category.label}
    </span>
  );
}

const STATUS_META = {
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

function StatusBadge({ status, label }) {
  const m = STATUS_META[status] || STATUS_META.active;
  return <span className={cx("badge", "badge-status", m.cls)}><Icon name={m.icon} />{label || m.label}</span>;
}

function ExpirationCounter({ alert, compact }) {
  const now = useNow();
  const left = alert.expiresAt - now;
  const state = left <= 0 ? "over" : left <= HOUR ? "soon" : "ok";
  const pct = Math.min(100, Math.max(0, (left / ALERT_TTL) * 100));
  const text = state === "over" ? "Cette alerte a expiré." : state === "soon" ? `Expire dans ${fmtRemaining(left)}` : `Visible encore ${fmtRemaining(left)}`;
  if (compact) {
    const short = state === "over" ? "Expirée" : left >= HOUR ? `${Math.floor(left / HOUR)} h` : `${Math.ceil(left / MIN)} min`;
    return <span className="exp" aria-label={text}><Icon name="timer" className="ph-sm" />{short}</span>;
  }
  return (
    <div className={cx("expiry", state === "soon" && "soon", state === "over" && "over")}>
      <span className="lbl"><Icon name={state === "over" ? "clock" : "timer"} className="ph-sm" />{text}</span>
      <div className="bar" aria-hidden="true"><i style={{ width: `${state === "over" ? 100 : pct}%` }} /></div>
    </div>
  );
}

function AlertCard({ alert, onOpen, showStatus }) {
  const { state } = useStore();
  const now = useNow();
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const pos = state.session.position;
  const dist = pos ? fmtDistance(haversineKm(pos, alert)) : null;
  const commune = COMMUNE_BY_ID[alert.communeId].name;
  const life = alertLifecycle(alert, now);
  let status = null;
  if (life === "proche") status = <StatusBadge status="proche" label={`Expire dans ${fmtRemaining(alert.expiresAt - now)}`} />;
  else if (life === "expiree" || life === "supprimee" || life === "moderee") status = <StatusBadge status={life} />;
  else if (["en_traitement", "traite", "cloture"].includes(alert.transmission)) status = <StatusBadge status={alert.transmission} />;
  else if (cat.type === "negative" || showStatus) status = <StatusBadge status="transmis" />;
  const ago = fmtRelative(now - alert.createdAt);
  const aria = `${cat.label}. ${alert.title}. ${commune}${dist ? `, ${dist}` : ""}, ${ago}. ${alert.votesUp} confirmations, ${alert.commentsCount} commentaires.`;
  return (
    <button type="button" className={cx("alert-card", `fam-${cat.family}`)} onClick={onOpen} aria-label={aria}>
      <Marker family={cat.family} icon={cat.icon} />
      <span className="ac-main" aria-hidden="true">
        <span className="ac-eyebrow"><b>{cat.label}</b><span>{ago}</span></span>
        <h4>{alert.title}</h4>
        <span className="meta"><Icon name="map-pin" className="ph-sm" /><span>{commune}{dist ? ` · ${dist}` : ""}</span></span>
        <span className="ac-foot">
          <span className="stats">
            <span><Icon name="arrow-fat-up" />{alert.votesUp}</span>
            <span><Icon name="arrow-fat-down" />{alert.votesDown}</span>
            <span><Icon name="chat-circle" />{alert.commentsCount}</span>
          </span>
          {status}
        </span>
      </span>
      {alert.hasPhoto ? <span className="ac-thumb" aria-hidden="true"><Icon name="image" /></span> : <span />}
    </button>
  );
}

function VoteBar({ alert, compact }) {
  const { state } = useStore();
  const { vote, toast } = useActions();
  const current = state.votes[alert.id] || 0;
  const onVote = (v) => {
    if (state.demo.offline) { toast("Vote impossible hors connexion.", { tone: "error" }); return; }
    vote(alert.id, v);
  };
  return (
    <div className="vote" role="group" aria-label="Votre avis sur ce signalement">
      <button className="up" type="button" aria-pressed={current === 1} onClick={() => onVote(1)} aria-label={`Confirmer, ${alert.votesUp} confirmations`}>
        <Icon name={current === 1 ? "arrow-fat-up-fill" : "arrow-fat-up"} />{compact ? null : "Confirmer"} <span className="n">{alert.votesUp}</span>
      </button>
      <button className="down" type="button" aria-pressed={current === -1} onClick={() => onVote(-1)} aria-label={`Contester, ${alert.votesDown} contestations`}>
        <Icon name={current === -1 ? "arrow-fat-down-fill" : "arrow-fat-down"} />{compact ? null : "Contester"} <span className="n">{alert.votesDown}</span>
      </button>
    </div>
  );
}

function Timeline({ steps, currentIndex }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => {
        const done = i < currentIndex || (i === currentIndex && s.final);
        const current = i === currentIndex && !s.final;
        return (
          <li key={s.id} className={cx(done && "done", current && "current")}>
            <span className="dot">{done ? <Icon name="check" /> : current ? <Icon name="arrows-clockwise" /> : null}</span>
            <span><b>{s.label}</b>{s.detail ? <small>{s.detail}</small> : null}</span>
          </li>
        );
      })}
    </ol>
  );
}

function CategoryTile({ category, selected, onClick }) {
  return (
    <button type="button" className={cx("cat-tile", `fam-${category.family}`)} aria-pressed={!!selected} onClick={onClick}>
      <Marker family={category.family} icon={category.icon} />
      {category.label}
    </button>
  );
}

function CommentItem({ comment, reply }) {
  const now = useNow();
  const author = publicAuthor(comment);
  return (
    <div className={cx("comment", reply && "reply")}>
      <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
      <div>
        <div className="who">{author.name} <time>{fmtRelative(now - (BOOT_TIME - comment.ageMin * MIN))}</time></div>
        <p>{comment.body}</p>
        <div className="acts"><button type="button">Répondre</button><button type="button">Signaler</button></div>
      </div>
    </div>
  );
}

/* =====================================================================
   NAVIGATION — barre d'onglets, en-têtes, hôtes (sheet, modale, toasts)
   ===================================================================== */
const TABS = [
  { id: "map", label: "Carte", icon: "map-trifold" },
  { id: "alerts", label: "Alertes", icon: "list-bullets" },
  { id: "report", label: "Signaler", icon: "plus" },
  { id: "activity", label: "Activité", icon: "pulse" },
  { id: "profile", label: "Profil", icon: "user-circle" },
];

function TabBar() {
  const { state } = useStore();
  const { setTab, push, setPref } = useActions();
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((t) => {
        if (t.id === "report") {
          return (
            <button key={t.id} type="button" className="tab tab-report" onClick={() => { setPref("reportHintSeen", true); push("report"); }} aria-label="Signaler un événement">
              <span className="fab"><Icon name="plus" /></span>Signaler
            </button>
          );
        }
        const active = state.nav.tab === t.id;
        return (
          <button key={t.id} type="button" className="tab" aria-current={active ? "page" : undefined} onClick={() => setTab(t.id)}>
            <Icon name={active && t.id !== "alerts" ? `${t.icon}-fill` : t.icon} />{t.label}
          </button>
        );
      })}
    </nav>
  );
}

function ScreenHeader({ title, onBack, action, close }) {
  const { pop } = useActions();
  return (
    <header className="screen-header">
      <IconButton icon={close ? "x" : "caret-left"} label={close ? "Fermer" : "Retour"} onClick={onBack || pop} />
      <h1>{title}</h1>
      {action || <span />}
    </header>
  );
}

const SNAP_HEIGHTS = { peek: 132, half: 0.5, full: 0.92 };

function BottomSheet({ snap = "half", onSnap, onClose, title, modal, children, dismissible = true, peek = SNAP_HEIGHTS.peek, headerAction }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [dragH, setDragH] = useState(null);
  const parentH = () => ref.current?.parentElement?.clientHeight || 700;
  const heightFor = (s) => (s === "peek" ? peek : SNAP_HEIGHTS[s] * parentH());
  const order = ["peek", "half", "full"];

  useEffect(() => {
    if (!modal) return undefined;
    const onKey = (e) => { if (e.key === "Escape" && dismissible) onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, dismissible, onClose]);

  const onPointerDown = (e) => {
    drag.current = { y: e.clientY, h: heightFor(snap), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dy = drag.current.y - e.clientY;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    setDragH(Math.max(60, Math.min(parentH() * 0.95, drag.current.h + dy)));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    const { moved } = drag.current;
    const h = dragH;
    drag.current = null;
    setDragH(null);
    if (!moved || h == null) { cycle(); return; }
    if (h < heightFor("peek") * 0.6 && dismissible) { onClose?.(); return; }
    const nearest = order.reduce((best, s) => (Math.abs(heightFor(s) - h) < Math.abs(heightFor(best) - h) ? s : best), "peek");
    onSnap?.(nearest);
  };
  const cycle = () => onSnap?.(order[(order.indexOf(snap) + 1) % order.length]);
  const onHandleKey = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onSnap?.(order[Math.min(2, order.indexOf(snap) + 1)]); }
    if (e.key === "ArrowDown") { e.preventDefault(); const i = order.indexOf(snap); if (i === 0 && dismissible) onClose?.(); else onSnap?.(order[Math.max(0, i - 1)]); }
  };

  const height = dragH != null ? dragH : heightFor(snap);
  return (
    <Fragment>
      {modal && snap !== "peek" ? <div className="bs-scrim" onClick={dismissible ? onClose : undefined} aria-hidden="true" /> : null}
      <section ref={ref} className={cx("bs", dragH != null && "is-dragging")} style={{ height }} role={modal ? "dialog" : "region"} aria-label={title || "Panneau"} aria-modal={modal || undefined}>
        <button type="button" className="bs-handle" aria-label={`Panneau ${snap === "full" ? "agrandi" : snap === "half" ? "à moitié" : "réduit"} : glisser ou utiliser les flèches pour redimensionner`}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onHandleKey}>
          <span />
        </button>
        {title || headerAction || (modal && dismissible) ? (
          <div className="bs-head">
            {title ? <h2>{title}</h2> : <span style={{ flex: 1 }} />}
            {headerAction}
            {modal && dismissible ? <IconButton icon="x" label="Fermer" onClick={onClose} style={{ boxShadow: "none", width: 40, height: 40 }} /> : null}
          </div>
        ) : null}
        <div className="bs-body">{children}</div>
      </section>
    </Fragment>
  );
}

function ConfirmModal({ modal, onClose }) {
  const firstRef = useRef(null);
  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
        <h3 id="modal-title">{modal.title}</h3>
        {modal.body ? <p id="modal-body">{modal.body}</p> : null}
        <div className="actions">
          <button ref={firstRef} type="button" className="btn btn-secondary" onClick={onClose}>{modal.cancelLabel || "Annuler"}</button>
          <button type="button" className={cx("btn", modal.destructive ? "btn-destructive" : "btn-primary")} onClick={() => { onClose(); modal.onConfirm?.(); }}>{modal.confirmLabel || "Confirmer"}</button>
        </div>
      </div>
    </div>
  );
}

function ToastHost({ hasTabbar }) {
  const { state, dispatch } = useStore();
  useEffect(() => {
    const timers = state.toasts.filter((t) => t.tone !== "error").map((t) => setTimeout(() => dispatch({ type: "DISMISS_TOAST", id: t.id }), 4000));
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);
  return (
    <div className={cx("toast-host", !hasTabbar && "no-tabbar")}>
      <div aria-live="polite" style={{ display: "contents" }}>
        {state.toasts.filter((t) => t.tone !== "error").map((t) => (
          <div key={t.id} className="toast" role="status"><Icon name="check-circle-fill" />{t.text}</div>
        ))}
      </div>
      <div aria-live="assertive" style={{ display: "contents" }}>
        {state.toasts.filter((t) => t.tone === "error").map((t) => (
          <div key={t.id} className="toast is-error" role="alert">
            <Icon name="warning-fill" />{t.text}
            <button type="button" className="toast-action" onClick={() => { dispatch({ type: "DISMISS_TOAST", id: t.id }); t.onAction?.(); }}>{t.actionLabel || "OK"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
   ÉCRANS — phase 0 : écrans d'onglets provisoires + bibliothèque de composants
   ===================================================================== */
/* ---- Carte d'accueil : fond illustré du secteur Pontoise / Cergy (phase 3 : carte interactive complète) ---- */
const MAP_VIEW = { lat: 49.0508, lng: 2.1008, x: 195, y: 270, kx: 3200, ky: 4864 };
const NEAR_KM = 5;

function projectToMap(p) {
  return { x: MAP_VIEW.x + (p.lng - MAP_VIEW.lng) * MAP_VIEW.kx, y: MAP_VIEW.y - (p.lat - MAP_VIEW.lat) * MAP_VIEW.ky };
}

/* Doublons (CDC §81) : un seul marqueur par événement, celui qui a le plus de confirmations */
function dedupeEvents(alerts) {
  const best = {};
  alerts.forEach((a) => {
    if (!a.duplicateGroup) return;
    const cur = best[a.duplicateGroup];
    if (!cur || a.votesUp > cur.votesUp) best[a.duplicateGroup] = a;
  });
  return alerts.filter((a) => !a.duplicateGroup || best[a.duplicateGroup] === a);
}

/* Regroupement simple : marqueurs à moins de 30 px l'un de l'autre → un cluster */
function clusterPins(alerts) {
  const pts = alerts.map((a) => ({ a, ...projectToMap(a) })).filter((p) => p.x > 20 && p.x < 370 && p.y > 96 && p.y < 590);
  const used = new Set();
  const pins = [];
  pts.forEach((p) => {
    if (used.has(p.a.id)) return;
    const group = pts.filter((q) => !used.has(q.a.id) && Math.hypot(q.x - p.x, q.y - p.y) < 30);
    group.forEach((q) => used.add(q.a.id));
    pins.push({
      key: group.map((q) => q.a.id).join("-"),
      alerts: group.map((q) => q.a),
      x: group.reduce((s, q) => s + q.x, 0) / group.length,
      y: group.reduce((s, q) => s + q.y, 0) / group.length,
    });
  });
  return pins;
}

const MAP_ART = (
  <svg className="map-art" viewBox="0 0 390 768" aria-hidden="true">
    <rect className="land" width="390" height="768" />
    <path className="forest" d="M282 0H390V150C362 168 318 160 298 128C280 98 270 40 282 0Z" />
    <path className="forest" d="M0 470C38 452 84 470 92 512C100 556 64 592 22 600L0 602Z" />
    <path className="forest" d="M330 420C356 398 390 404 390 404V540C360 552 330 534 322 504C316 478 314 440 330 420Z" />
    <path className="urban" d="M150 230C176 206 238 200 262 226C286 252 280 300 252 320C224 340 176 336 156 312C136 288 128 252 150 230Z" />
    <path className="urban" d="M236 288C262 276 316 290 322 322C328 356 300 376 268 372C240 368 222 344 222 318C222 302 226 294 236 288Z" />
    <path className="urban" d="M20 300C46 280 110 290 134 318C156 346 150 404 120 420C90 436 40 424 22 396C4 368 0 318 20 300Z" />
    <path className="urban" d="M40 190C64 176 112 184 124 206C134 226 120 250 94 256C66 262 40 250 32 230C26 214 28 198 40 190Z" />
    <path className="water" d="M396 120C352 156 304 198 268 230C246 250 232 274 214 292C192 314 160 324 136 336C106 352 80 388 76 428C72 470 96 500 132 512C172 526 206 548 222 590C236 628 232 690 240 772" />
    <path className="road-case minor" d="M190 262C154 248 114 232 78 220C44 208 14 202 -4 200" />
    <path className="road-case minor" d="M196 290C170 312 132 334 84 344" />
    <path className="road-case" d="M266 -4C262 76 256 150 248 214C242 262 244 330 254 478" />
    <path className="road-case" d="M394 650C334 590 292 530 254 478C224 438 176 408 122 394C80 384 40 380 -4 380" />
    <path className="road minor" d="M190 262C154 248 114 232 78 220C44 208 14 202 -4 200" />
    <path className="road minor" d="M196 290C170 312 132 334 84 344" />
    <path className="road" d="M266 -4C262 76 256 150 248 214C242 262 244 330 254 478" />
    <path className="road" d="M394 650C334 590 292 530 254 478C224 438 176 408 122 394C80 384 40 380 -4 380" />
    <text className="label" x="262" y="250" textAnchor="middle">Pontoise</text>
    <text className="label" x="290" y="392" textAnchor="middle">Saint-Ouen-l'Aumône</text>
    <text className="label" x="60" y="446" textAnchor="middle">Cergy</text>
    <text className="label" x="80" y="176" textAnchor="middle">Osny</text>
    <text className="label water-label" x="344" y="198" textAnchor="middle">L'Oise</text>
  </svg>
);

function AlertSummary({ alert, onClose }) {
  const { state } = useStore();
  const { toast } = useActions();
  const now = useNow();
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const dist = fmtDistance(haversineKm(state.session.position, alert));
  const duplicates = alert.duplicateGroup ? state.alerts.filter((a) => a.duplicateGroup === alert.duplicateGroup && a.status === "active").length : 1;
  return (
    <div className={cx("summary", `fam-${cat.family}`)}>
      <div className="summary-head"><TypeBadge category={cat} /><span className="demo-note">{fmtRelative(now - alert.createdAt)}</span><IconButton icon="x" label="Fermer l'aperçu" className="flat" onClick={onClose} /></div>
      <h3 className="summary-title">{alert.title}</h3>
      <p className="summary-meta"><Icon name="map-pin" className="ph-sm" />{displayPlace(alert)} · {dist}</p>
      {duplicates > 1 ? <Banner tone="info" icon="copy">{duplicates} signalements semblent concerner le même événement.</Banner> : null}
      <VoteBar alert={alert} />
      <Button block onClick={() => toast("La fiche alerte complète arrive bientôt.")}>Voir le détail</Button>
    </div>
  );
}

function MapScreen() {
  const { state } = useStore();
  const { toast } = useActions();
  const alerts = useVisibleAlerts();
  const [filter, setFilter] = useState("all");
  const [snap, setSnap] = useState("peek");
  const [selectedId, setSelectedId] = useState(null);
  const pos = state.session.position;
  const unread = state.notifications.filter((n) => !n.read).length;
  const filtered = alerts.filter((a) => filter === "all" || CATEGORY_BY_ID[a.categoryId].type === filter);
  const pins = useMemo(() => clusterPins(dedupeEvents(filtered)), [filtered]);
  const near = filtered
    .map((a) => ({ a, km: haversineKm(pos, a) }))
    .filter((x) => x.km <= NEAR_KM)
    .sort((x, y) => x.km - y.km)
    .map((x) => x.a);
  const selected = selectedId ? alerts.find((a) => a.id === selectedId) : null;
  const me = projectToMap(pos);
  const PEEK = 156;

  const openAlert = (id) => { setSelectedId(id); setSnap("half"); };
  const closeSummary = () => { setSelectedId(null); setSnap("peek"); };

  return (
    <div className="screen" style={{ overflow: "hidden" }}>
      <div className="map95" aria-label="Carte des alertes autour de Pontoise">
        {MAP_ART}
        {state.demo.permissionDenied ? null : <span className="me" style={{ left: me.x, top: me.y }} role="img" aria-label="Vous êtes ici" />}
        {pins.map((p) => {
          if (p.alerts.length > 1) {
            return <ClusterMarker key={p.key} count={p.alerts.length} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)", zIndex: 4 }} onClick={() => toast(`${p.alerts.length} alertes regroupées : le zoom arrive avec la carte interactive.`)} />;
          }
          const a = p.alerts[0];
          const cat = CATEGORY_BY_ID[a.categoryId];
          return (
            <span key={p.key} className="map-pin" style={{ left: p.x, top: p.y }}>
              <Marker family={cat.family} icon={cat.icon} selected={selectedId === a.id} critical={cat.priority === "critique"} label={`${cat.label} : ${a.title}`} onClick={() => openAlert(a.id)} />
            </span>
          );
        })}
      </div>
      <div className="map-top">
        <button type="button" className="search" onClick={() => toast("La recherche arrive bientôt.")}><Icon name="magnifying-glass" />Rechercher une ville, une rue…</button>
        <IconButton icon="bell" label="Notifications" badge={unread || null} onClick={() => toast("Le centre de notifications arrive bientôt.")} />
      </div>
      <div className="map-pill"><Pill onClick={() => { setSelectedId(null); setSnap("half"); }}>3 nouvelles alertes</Pill></div>
      <IconButton icon="crosshair" label="Recentrer sur ma position" className="map-locate" style={{ bottom: PEEK + 12 }} onClick={() => toast(state.demo.permissionDenied ? "Localisation désactivée : position choisie manuellement (Pontoise)." : "Carte centrée sur votre position.")} />

      {selected ? (
        <BottomSheet snap={snap === "peek" ? "half" : snap} peek={PEEK} onSnap={setSnap} onClose={closeSummary}>
          <AlertSummary alert={selected} onClose={closeSummary} />
        </BottomSheet>
      ) : (
        <BottomSheet snap={snap} peek={PEEK} onSnap={setSnap} dismissible={false}
          title={near.length ? `${near.length} alerte${near.length > 1 ? "s" : ""} autour de vous` : "Aucune alerte autour de vous"}>
          <SegmentedControl block label="Type d'alertes" value={filter} onChange={setFilter} options={[{ value: "all", label: "Toutes" }, { value: "positive", label: "Positives" }, { value: "negative", label: "Négatives" }]} />
          {near.length === 0 ? (
            <EmptyState title="Aucune alerte dans cette zone.">Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
          ) : near.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => openAlert(a.id)} />)}
        </BottomSheet>
      )}
    </div>
  );
}

function AlertsScreen() {
  const { state } = useStore();
  const { toast } = useActions();
  const alerts = useVisibleAlerts();
  const [filter, setFilter] = useState("all");
  const pos = state.session.position;
  const list = alerts.filter((a) => filter === "all" || CATEGORY_BY_ID[a.categoryId].type === filter);
  const near = list.filter((a) => haversineKm(pos, a) <= NEAR_KM).sort((a, b) => haversineKm(pos, a) - haversineKm(pos, b));
  const rest = list.filter((a) => haversineKm(pos, a) > NEAR_KM).sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const open = () => toast("La fiche alerte complète arrive bientôt.");
  return (
    <div className="screen">
      <div className="screen-title row">
        <div><h1>Alertes</h1><p>{alerts.length} alertes actives dans le Val-d'Oise</p></div>
        <IconButton icon="sliders-horizontal" label="Filtres" className="flat" onClick={() => toast("Les filtres détaillés arrivent bientôt.")} />
      </div>
      <div className="screen-pad">
        <SegmentedControl block label="Type d'alertes" value={filter} onChange={setFilter} options={[{ value: "all", label: "Toutes" }, { value: "positive", label: "Positives" }, { value: "negative", label: "Négatives" }]} />
        {list.length === 0 ? (
          <EmptyState title="Aucune alerte dans cette zone." action={<Button variant="secondary" onClick={() => toast("Zone élargie à tout le Val-d'Oise.")}>Élargir la zone</Button>}>Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
        ) : (
          <Fragment>
            {near.length ? <section className="list-section"><h2 className="section-label">À moins de {NEAR_KM} km</h2>{near.map((a) => <AlertCard key={a.id} alert={a} onOpen={open} />)}</section> : null}
            {rest.length ? <section className="list-section"><h2 className="section-label">Ailleurs dans le Val-d'Oise</h2>{rest.map((a) => <AlertCard key={a.id} alert={a} onOpen={open} />)}</section> : null}
          </Fragment>
        )}
      </div>
    </div>
  );
}

function ActivityScreen() {
  const { state } = useStore();
  const { toast, push } = useActions();
  const [tab, setTab] = useState("mine");
  const mine = state.alerts.filter((a) => a.authorId === ME_ID && a.status !== "supprimee").sort((a, b) => b.createdAt - a.createdAt);
  const followed = state.alerts.filter((a) => state.follows[a.id]);
  const open = () => toast("Le suivi détaillé arrive bientôt.");
  return (
    <div className="screen">
      <div className="screen-title"><h1>Activité</h1><p>Vos signalements et leur suivi par les services</p></div>
      <div className="screen-pad">
        <SegmentedControl block label="Activité" value={tab} onChange={setTab} options={[{ value: "mine", label: "Mes alertes" }, { value: "comments", label: "Commentaires" }, { value: "followed", label: "Suivies" }]} />
        {tab === "mine" ? (
          mine.length ? mine.map((a) => <AlertCard key={a.id} alert={a} showStatus onOpen={open} />)
            : <EmptyState icon="plus" title="Vous n'avez encore publié aucune alerte." action={<Button onClick={() => push("report")}>Signaler un événement</Button>} />
        ) : tab === "comments" ? (
          <EmptyState icon="chat-circle" title="Aucun commentaire pour le moment.">Vos commentaires et les réponses reçues apparaîtront ici.</EmptyState>
        ) : followed.length ? followed.map((a) => <AlertCard key={a.id} alert={a} onOpen={open} />)
          : <EmptyState icon="bookmark-simple" title="Aucune alerte suivie.">Suivez une alerte pour être prévenu de son traitement.</EmptyState>}
      </div>
    </div>
  );
}

function ProfileScreen() {
  const { state } = useStore();
  const { push, setPref, toast } = useActions();
  const user = state.session.user;
  const soon = () => toast("Disponible bientôt.");
  return (
    <div className="screen">
      <div className="screen-title"><h1>Profil</h1></div>
      <div className="screen-pad">
        <div className="identity">
          <span className="avatar" aria-hidden="true">{user.firstName[0]}{user.lastName[0]}</span>
          <div>
            <b>{user.firstName} {user.lastName}</b>
            <small>Vos alertes identifiées affichent « {publicName(user)} »</small>
            <span className="verified"><Icon name="seal-check-fill" />Identité vérifiée</span>
          </div>
        </div>
        <section className="list-section">
          <h2 className="section-label">Affichage</h2>
          <div className="list">
            <div className="list-block"><span className="lb-label">Thème</span><SegmentedControl block label="Thème" value={state.prefs.theme} onChange={(v) => setPref("theme", v)} options={[{ value: "light", label: "Clair", icon: "sun" }, { value: "system", label: "Auto", icon: "circle-half" }, { value: "dark", label: "Sombre", icon: "moon" }]} /></div>
            <div className="list-block"><span className="lb-label">Taille du texte</span><SegmentedControl block label="Taille du texte" value={state.prefs.textScale} onChange={(v) => setPref("textScale", v)} options={[100, 130, 160, 200].map((v) => ({ value: v, label: `${v} %` }))} /></div>
            <div className="list-block switch-row"><Switch id="pref-contrast" label="Contraste élevé" checked={state.prefs.highContrast} onChange={(v) => setPref("highContrast", v)} /></div>
            <div className="list-block switch-row"><Switch id="pref-motion" label="Réduire les animations" checked={state.prefs.reduceMotion} onChange={(v) => setPref("reduceMotion", v)} /></div>
          </div>
        </section>
        <section className="list-section">
          <h2 className="section-label">Compte</h2>
          <div className="list">
            <ListItem icon="bell" label="Notifications" onClick={soon} />
            <ListItem icon="lock-simple" label="Confidentialité et données" onClick={soon} />
            <ListItem icon="question" label="Aide et contact" onClick={soon} />
          </div>
        </section>
        <section className="list-section">
          <h2 className="section-label">Prototype</h2>
          <div className="list"><ListItem icon="squares-four" label="Bibliothèque de composants" onClick={() => push("components")} /></div>
        </section>
      </div>
    </div>
  );
}

function ReportScreen() {
  const { pop, toast } = useActions();
  const [type, setType] = useState(null);
  return (
    <div className="screen">
      <ScreenHeader title="Signaler" close onBack={pop} />
      <div className="screen-pad" style={{ flex: 1 }}>
        <Stepper step={1} total={7} label="Type" />
        <h2 className="question">Que souhaitez-vous signaler ?</h2>
        <RadioCard large name="report-type" value="positive" family="positive" icon="star-fill" checked={type === "positive"} onChange={setType}
          title="Un événement positif" description="Initiative, solidarité, culture, sport, vie de quartier…" />
        <RadioCard large name="report-type" value="negative" family="incident" icon="warning-fill" checked={type === "negative"} onChange={setType}
          title="Un événement négatif" description="Incident, danger, dégradation, propreté, nuisance…" />
        <Banner tone="emergency">En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés.</Banner>
      </div>
      <div className="screen-footer">
        <Button block disabled={!type} onClick={() => toast("La suite du parcours (catégorie, lieu, photo…) arrive bientôt.")}>Continuer</Button>
      </div>
    </div>
  );
}

function ComponentsScreen() {
  const { state } = useStore();
  const { toast, confirm, openSheet } = useActions();
  const now = useNow();
  const [chips, setChips] = useState({ culture: true });
  const [seg, setSeg] = useState("map");
  const [pub, setPub] = useState("profile");
  const [sw, setSw] = useState(true);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("incendie");
  const [loading, setLoading] = useState(false);
  const sample = state.alerts.find((a) => a.id === "a1");
  const sampleTreated = state.alerts.find((a) => a.id === "a25");
  const route = routeAlert(sampleTreated);
  const stepIndex = TRANSMISSION_STEPS.findIndex((s) => s.id === sampleTreated.transmission);
  return (
    <div className="screen">
      <ScreenHeader title="Composants" />
      <div className="screen-pad">
        <p className="demo-note" style={{ margin: 0 }}>Bibliothèque interne du prototype : composants de base branchés au store. Référence visuelle complète : docs/design-system/index.html.</p>

        <section className="lib-section"><p className="section-label">Boutons</p>
          <Button>Publier l'alerte</Button>
          <Button variant="secondary" icon="map-pin">Choisir sur la carte</Button>
          <div className="lib-row"><Button variant="ghost">Plus tard</Button><Button variant="destructive" icon="trash-simple" onClick={() => confirm({ title: "Supprimer cette alerte ?", body: "Elle ne sera plus visible par les utilisateurs.", confirmLabel: "Supprimer", destructive: true, onConfirm: () => toast("Alerte supprimée.") })}>Supprimer</Button></div>
          <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast("Votre alerte a été publiée."); }, 1200); }}>{loading ? "Publication…" : "Simuler une publication"}</Button>
          <Button disabled>Confirmer cette position</Button>
        </section>

        <section className="lib-section"><p className="section-label">Champs</p>
          <Field id="lib-title" label="Titre" placeholder="Arbre tombé sur la chaussée" max={80} help="Court et factuel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Field id="lib-code" label="Code reçu par SMS" defaultValue="48213" error="Code incorrect. Vérifiez le SMS ou demandez un nouveau code." />
        </section>

        <section className="lib-section"><p className="section-label">Chips · Segmented control</p>
          <div className="lib-row">{["Culture", "Sport", "Propreté", "Voirie"].map((c) => { const k = c.toLowerCase(); return <Chip key={k} selected={chips[k]} onClick={() => setChips({ ...chips, [k]: !chips[k] })}>{c}</Chip>; })}</div>
          <SegmentedControl label="Vue" value={seg} onChange={setSeg} options={[{ value: "map", label: "Carte", icon: "map-trifold" }, { value: "list", label: "Liste", icon: "list-bullets" }]} />
        </section>

        <section className="lib-section"><p className="section-label">RadioCard + aperçu public</p>
          <RadioCard name="lib-pub" value="profile" checked={pub === "profile"} onChange={setPub} icon="user-circle" title="Publier avec mon profil" description="Les autres verront votre prénom et l'initiale de votre nom." />
          <RadioCard name="lib-pub" value="anon" checked={pub === "anon"} onChange={setPub} icon="detective" iconTone="muted" title="Publier anonymement" description="Aucune identité visible. La plateforme peut retrouver l'auteur en cas d'abus." />
          <div className="preview-author"><Icon name="eye" />Visible publiquement : <b>{pub === "profile" ? `Signalé par ${publicName(state.session.user)}` : "Signalement anonyme"}</b></div>
        </section>

        <section className="lib-section"><p className="section-label">Switch · ListItem</p>
          <div className="list"><div className="list-item" style={{ display: "block", padding: "0 var(--s-4)" }}><Switch id="lib-sw" label="Alertes à proximité" checked={sw} onChange={setSw} /></div><ListItem icon="bell" label="Notifications" value="Activées" onClick={() => toast("Ouvre les réglages (phase 9).")} /></div>
        </section>

        <section className="lib-section"><p className="section-label">Feedback</p>
          <div className="lib-row">
            <Button variant="secondary" onClick={() => toast("Votre alerte a été publiée.")}>Toast succès</Button>
            <Button variant="secondary" onClick={() => toast("Impossible de publier votre alerte. Vérifiez votre connexion.", { tone: "error", actionLabel: "Réessayer" })}>Toast erreur</Button>
          </div>
          <Button variant="secondary" icon="squares-four" onClick={() => openSheet("demo-sheet", {}, "half")}>Ouvrir une bottom sheet</Button>
          <Banner tone="offline" title="Vous êtes actuellement hors connexion.">Les fonctionnalités dépendantes du réseau sont désactivées.</Banner>
          <Banner tone="emergency">En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés.</Banner>
          <Stepper step={3} total={7} label="Localisation" />
          <div style={{ display: "grid", gap: 8 }}><Skeleton width="40%" /><Skeleton height={18} width="85%" /><Skeleton height={90} /></div>
          <EmptyState title="Aucune alerte dans cette zone." action={<Button variant="secondary">Élargir à 10 km</Button>}>Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
          <div className="lib-row"><Pill onClick={() => toast("Carte recentrée sur les nouvelles alertes.")}>3 nouvelles alertes</Pill><Tooltip>Signalez un événement ici</Tooltip></div>
        </section>

        <section className="lib-section"><p className="section-label">Marqueurs</p>
          <div className="lib-markers">
            <Marker family="incident" icon="fire" label="Incident" />
            <Marker family="vigilance" icon="lightbulb" label="Vigilance" />
            <Marker family="positive" icon="soccer-ball" label="Positif" />
            <Marker family="info" icon="barricade" label="Information" />
            <Marker family="positive" icon="mask-happy" selected label="Sélectionné" />
            <Marker family="incident" icon="fire" critical label="Incident critique" />
            <ClusterMarker count={12} onClick={() => toast("Zoom sur le regroupement (phase 3).")} />
          </div>
        </section>

        <section className="lib-section"><p className="section-label">Badges</p>
          <div className="lib-row">{["incendie", "proprete", "solidarite", "travaux"].map((id) => <TypeBadge key={id} category={CATEGORY_BY_ID[id]} />)}</div>
          <div className="lib-row">{["active", "proche", "transmis", "en_traitement", "traite", "expiree", "moderee", "rejetee"].map((s) => <StatusBadge key={s} status={s} />)}</div>
        </section>

        <section className="lib-section"><p className="section-label">Alert Card · Vote · Expiration</p>
          <AlertCard alert={sample} onOpen={() => toast("La fiche alerte arrive en phase 5.")} />
          <VoteBar alert={state.alerts.find((a) => a.id === "a4")} />
          <ExpirationCounter alert={sample} />
          <ExpirationCounter alert={state.alerts.find((a) => a.id === "a22")} />
          <ExpirationCounter alert={state.alerts.find((a) => a.id === "a23")} />
        </section>

        <section className="lib-section"><p className="section-label">Timeline · Service</p>
          <div className="service"><Icon name="paper-plane-tilt-fill" /><span><b>Transmis au service compétent</b><small>{route.name}</small></span></div>
          <Timeline currentIndex={stepIndex} steps={TRANSMISSION_STEPS.slice(0, 5).map((s, i) => ({ ...s, detail: i === 0 ? fmtRelative(now - sampleTreated.createdAt) : i === 1 ? route.name : i === stepIndex && route.delayHours ? `Délai indicatif : ${route.delayHours} h` : null }))} />
        </section>

        <section className="lib-section"><p className="section-label">Catégories</p>
          <div className="cat-grid">{["incendie", "accident", "proprete", "eclairage", "solidarite", "culture"].map((id) => <CategoryTile key={id} category={CATEGORY_BY_ID[id]} selected={cat === id} onClick={() => setCat(id)} />)}</div>
        </section>

        <section className="lib-section"><p className="section-label">Commentaires</p>
          {SEED_COMMENTS.a1.map((c) => <CommentItem key={c.id} comment={c} reply={!!c.parentId} />)}
        </section>
      </div>
    </div>
  );
}

function DemoSheetContent() {
  return (
    <Fragment>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>Faites glisser la poignée, ou utilisez les flèches ↑ ↓ du clavier quand elle a le focus. Échap ferme le panneau.</p>
      {SEED_ALERTS.slice(3, 6).map((a) => <AlertCard key={a.id} alert={a} />)}
    </Fragment>
  );
}

const TAB_SCREENS = { map: MapScreen, alerts: AlertsScreen, activity: ActivityScreen, profile: ProfileScreen };
const STACK_SCREENS = {
  report: { component: ReportScreen, modal: true },
  components: { component: ComponentsScreen },
};
const SHEETS = { "demo-sheet": { title: "Exemple de bottom sheet", component: DemoSheetContent } };

/* =====================================================================
   PANNEAU DE DÉMO (hors de l'app)
   ===================================================================== */
function DemoPanel() {
  const { state } = useStore();
  const { setDemo, setPref, reset, push, toast, confirm } = useActions();
  const [open, setOpen] = useState(false);
  const d = state.demo;
  return (
    <Fragment>
      <button type="button" className="demo-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="demo-panel"><Icon name="sliders-horizontal" className="ph-sm" />Démo</button>
      {open ? (
        <aside className="demo-panel" id="demo-panel" aria-label="Mode démo">
          <h2><Icon name="sliders-horizontal" />Mode démo<IconButton icon="x" label="Fermer le mode démo" onClick={() => setOpen(false)} style={{ marginLeft: "auto", width: 40, height: 40, boxShadow: "none" }} /></h2>
          <p className="demo-note">Force des états pour la présentation. Ces réglages ne font pas partie de l'application.</p>
          <hr />
          <Switch id="demo-offline" label="Hors connexion" checked={d.offline} onChange={(v) => setDemo("offline", v)} />
          <Switch id="demo-perm" label="Localisation refusée" checked={d.permissionDenied} onChange={(v) => setDemo("permissionDenied", v)} />
          <Switch id="demo-error" label="Erreur réseau" checked={d.networkError} onChange={(v) => setDemo("networkError", v)} />
          <Switch id="demo-empty" label="Zone sans alerte" checked={d.emptyZone} onChange={(v) => setDemo("emptyZone", v)} />
          <Switch id="demo-many" label="Beaucoup d'alertes (+80)" checked={d.manyAlerts} onChange={(v) => setDemo("manyAlerts", v)} />
          <div className="row"><span>Vitesse du temps</span><SegmentedControl label="Vitesse du temps" value={d.timeSpeed} onChange={(v) => setDemo("timeSpeed", v)} options={[{ value: 1, label: "×1" }, { value: 60, label: "×60" }, { value: 600, label: "×600" }]} /></div>
          <div className="row"><span>Thème</span><SegmentedControl label="Thème" value={state.prefs.theme} onChange={(v) => setPref("theme", v)} options={[{ value: "light", label: "Clair" }, { value: "system", label: "Auto" }, { value: "dark", label: "Sombre" }]} /></div>
          <hr />
          <Button variant="secondary" icon="squares-four" onClick={() => { push("components"); setOpen(false); }}>Bibliothèque de composants</Button>
          <Button variant="ghost" icon="arrow-counter-clockwise" onClick={() => confirm({ title: "Réinitialiser le prototype ?", body: "Les alertes, votes et commentaires reviennent à leur état de départ. Vos préférences d'affichage sont conservées.", confirmLabel: "Réinitialiser", onConfirm: () => { reset(); toast("Prototype réinitialisé."); } })}>Réinitialiser</Button>
        </aside>
      ) : null}
    </Fragment>
  );
}

/* =====================================================================
   APP
   ===================================================================== */
function useClock(speed) {
  const [now, setNow] = useState(BOOT_TIME);
  const last = useRef(Date.now());
  useEffect(() => {
    last.current = Date.now();
    const interval = speed > 1 ? 1000 : 15000;
    const id = setInterval(() => {
      const t = Date.now();
      const dt = t - last.current;
      last.current = t;
      setNow((n) => n + dt * speed);
    }, interval);
    return () => clearInterval(id);
  }, [speed]);
  return now;
}

function usePrefsEffects(prefs) {
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", prefs.theme);
    root.style.setProperty("--text-scale", `${prefs.textScale}%`);
    if (prefs.highContrast) root.setAttribute("data-contrast", "high"); else root.removeAttribute("data-contrast");
    if (prefs.reduceMotion) root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
    storage.set(PREFS_KEY, prefs);
  }, [prefs]);
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const now = useClock(state.demo.timeSpeed);
  usePrefsEffects(state.prefs);
  const store = useMemo(() => ({ state, dispatch }), [state]);

  const TabScreen = TAB_SCREENS[state.nav.tab];
  const top = state.nav.stack[state.nav.stack.length - 1];
  const topDef = top ? STACK_SCREENS[top.id] : null;
  const hideTabbar = topDef?.modal;
  const sheetDef = state.sheet && SHEETS[state.sheet.id];

  return (
    <StoreContext.Provider value={store}>
      <ClockContext.Provider value={now}>
        <div className="stage">
          <div className="device">
            <div className="app">
              <div className="statusbar" aria-hidden="true">
                <span>{fmtClock(now)}</span>
                <span className="sb-icons"><Icon name="cell-signal-full" />{state.demo.offline ? <Icon name="wifi-slash" /> : <Icon name="wifi-high" />}<Icon name="battery-full" /></span>
              </div>
              {state.demo.offline ? <Banner tone="offline" className="global-banner" title="Vous êtes actuellement hors connexion.">Les fonctionnalités dépendantes du réseau sont désactivées.</Banner> : null}
              <main className="screen-area">
                <TabScreen />
                {state.nav.stack.map((s) => {
                  const def = STACK_SCREENS[s.id];
                  const C = def.component;
                  return <div key={s.key} className={cx("stack-layer", def.modal && "is-modal")}><C {...s.params} /></div>;
                })}
                {sheetDef ? (
                  <BottomSheet modal snap={state.sheet.snap} title={sheetDef.title} onSnap={(s) => dispatch({ type: "SNAP_SHEET", snap: s })} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
                    <sheetDef.component {...state.sheet.params} />
                  </BottomSheet>
                ) : null}
              </main>
              {!hideTabbar && !state.prefs.reportHintSeen && !state.nav.stack.length ? (
                <button type="button" className="report-hint" onClick={() => dispatch({ type: "SET_PREF", key: "reportHintSeen", value: true })} aria-label="Signalez un événement ici. Fermer l'aide">
                  <span className="tooltip">Signalez un événement ici</span>
                </button>
              ) : null}
              {hideTabbar ? null : <TabBar />}
              <ToastHost hasTabbar={!hideTabbar} />
              {state.modal ? <ConfirmModal modal={state.modal} onClose={() => dispatch({ type: "CLOSE_MODAL" })} /> : null}
            </div>
          </div>
        </div>
        <DemoPanel />
      </ClockContext.Provider>
    </StoreContext.Provider>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="fatal" role="alert">
          <h1 style={{ margin: 0, font: "700 var(--fs-h1)/var(--lh-h1) var(--font)" }}>Une erreur est survenue</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>Le prototype a rencontré un problème. Rechargez la page pour recommencer.</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "var(--text-muted)" }}>{String(this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
