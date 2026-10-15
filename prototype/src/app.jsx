/* =====================================================================
   95 Alerte — prototype mobile (phase A)
   Source : prototype/src/app.jsx → assemblé dans prototype/index.html
   par tools/build_prototype.py. Lire AGENTS.md et docs/task.md avant
   toute modification.
   ===================================================================== */
const { useState, useReducer, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useImperativeHandle, createContext, useContext, Fragment } = React;

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
  mgp: "Métropole du Grand Paris",
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
  { id: "argenteuil", name: "Argenteuil", interco: "mgp", lat: 48.9472, lng: 2.2467, quartiers: ["Centre", "Val-Notre-Dame", "Orgemont", "Val d'Argent"] },
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
  ["a29", "travaux", "Chaussée fermée pour travaux de réseau", "Remplacement d'une canalisation : rue barrée, déviation par la rue de Liesse jusqu'à jeudi.", "saint-ouen-l-aumone", "Liesse", "Rue du Général-Leclerc", 130, "u9", 11, 0, 2, false, "pris_en_compte", "active"],
  ["a30", "inondation", "Chemin de halage inondé au pied de l'Axe Majeur", "L'Oise déborde sur le chemin de halage : passage impossible à pied et à vélo.", "cergy", "Axe Majeur", "Chemin de halage", 55, null, 14, 1, 3, true, "transmis", "active"],
  ["a28", "eclairage", "Lampadaire clignotant (doublon)", "Supprimé par l'auteur : doublon d'une alerte existante.", "ermont", "Centre", "Avenue de la Gare", 600, "me", 0, 0, 0, false, "envoye", "supprimee"],
];

/* Positions précises des alertes du secteur Cergy-Pontoise, dans leur quartier (fictif) de la carte */
const ALERT_POSITIONS = {
  a1: [49.03559, 2.0938], a19: [49.03873, 2.08831], a25: [49.06237, 2.09532], a6: [49.05499, 2.13491], a26: [49.03928, 2.11338],
  a2: [49.04381, 2.04605], a22: [49.0415, 2.06899], a4: [49.027, 2.07228], a17: [49.0668, 2.07512], a29: [49.03554, 2.14277], a30: [49.02386, 2.07913],
};
/* Alertes de zone (inondation, travaux) : demi-largeur de la zone concernée, en km (tâche 3.11) */
const ALERT_AREAS = { a30: 0.55, a29: 0.3, a9: 0.45, a14: 0.35 };

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
    hasPhoto, transmission, status, duplicateGroup: duplicateGroup || null, areaKm: ALERT_AREAS[id] || null,
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
  if (!user) return "Citoyen anonyme"; // exploration sans compte : aucun nom à afficher
  if (user.display === "first") return user.firstName;
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
const DEFAULT_PREFS = { theme: "system", textScale: 100, highContrast: false, reduceMotion: false, onboardingSeen: false, reportHintSeen: false, homeView: "map" };
const DEFAULT_DEMO = { offline: false, permissionDenied: false, gpsUnavailable: false, networkError: false, emptyZone: false, manyAlerts: false, timeSpeed: 1 };

function initialAuth() {
  return {
    step: "login",
    form: { firstName: "Jean", lastName: "Dupont", email: "jean.dupont@exemple.fr", phone: "06 12 34 56 42" },
    docType: "cni",
    idResult: "en_cours",
    display: "initial",
  };
}

// Position : « default » tant que l'utilisateur n'a ni autorisé la localisation ni choisi de commune
const DEFAULT_POSITION = { lat: 49.0508, lng: 2.1008, source: "default", communeId: null, permission: "unknown" };

function initialState() {
  return {
    prefs: { ...DEFAULT_PREFS, ...storage.get(PREFS_KEY, {}) },
    demo: { ...DEFAULT_DEMO },
    session: { status: "splash", user: null, identity: "non_verifiee", method: null, position: DEFAULT_POSITION },
    onb: { step: "slides", slide: 0 },
    auth: initialAuth(),
    alerts: SEED_ALERTS,
    votes: { a4: 1, a8: 1 },
    follows: { a1: true },
    comments: SEED_COMMENTS,
    notifications: SEED_NOTIFICATIONS,
    nav: { tab: "map", stack: [] },
    mapFilter: { type: "all", hidden: [], urgentOnly: false },
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
    case "SET_MAP_FILTER":
      return { ...state, mapFilter: { ...state.mapFilter, ...action.patch } };
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
      // « Bien démarrer » : la première confirmation coche l'étape
      const prefs = next === 1 && !state.prefs.startVoted ? { ...state.prefs, startVoted: true } : state.prefs;
      return { ...state, alerts, prefs, votes: { ...state.votes, [action.alertId]: next } };
    }
    case "SPLASH_DONE":
      return state.prefs.onboardingSeen
        ? { ...state, session: { ...state.session, status: "auth" }, auth: { ...state.auth, step: "login" } }
        : { ...state, session: { ...state.session, status: "onboarding" }, onb: { step: "slides", slide: 0 } };
    case "ONB_GO":
      return { ...state, onb: { step: action.step, slide: action.slide ?? state.onb.slide, pending: action.pending ?? state.onb.pending }, sheet: null };
    case "SET_RADIUS":
      return { ...state, session: { ...state.session, position: { ...state.session.position, radiusKm: action.km } } };
    case "LOCATION_RESULT":
      return { ...state, session: { ...state.session, position: { ...state.session.position, permission: action.permission } } };
    case "SET_COMMUNE": {
      const c = COMMUNE_BY_ID[action.communeId];
      const coords = action.coords || { lat: c.lat, lng: c.lng };
      return { ...state, session: { ...state.session, position: { ...state.session.position, ...coords, source: action.source, communeId: c.id } } };
    }
    case "ONB_FINISH": {
      let position = { ...state.session.position, permission: action.permission || state.session.position.permission };
      if (action.communeId) {
        const c = COMMUNE_BY_ID[action.communeId];
        position = { ...position, ...(action.coords || { lat: c.lat, lng: c.lng }), source: action.source, communeId: c.id };
      }
      return { ...state, prefs: { ...state.prefs, onboardingSeen: true }, session: { ...state.session, status: "auth", position }, auth: { ...state.auth, step: "login" }, sheet: null };
    }
    case "AUTH_GO":
      return { ...state, auth: { ...state.auth, step: action.step } };
    case "AUTH_SET":
      return { ...state, auth: { ...state.auth, ...action.patch } };
    case "LOGIN": {
      const user = action.user || USERS.me;
      const toasts = action.message ? [...state.toasts, { id: ++toastSeq, text: action.message, tone: "success" }] : state.toasts;
      return { ...state, session: { ...state.session, status: "in", user, identity: action.identity, method: action.method }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, toasts };
    }
    case "GUEST":
      return { ...state, session: { ...state.session, status: "in", user: null, identity: "non_verifiee", method: "invite" }, nav: { tab: "map", stack: [] }, sheet: null };
    case "LOGOUT":
      return { ...state, session: { ...state.session, status: "auth", user: null, identity: "non_verifiee", method: null }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, modal: null };
    case "RESTART":
      return { ...state, prefs: action.onboarding ? { ...state.prefs, onboardingSeen: false, startHidden: false, startVoted: false } : state.prefs, session: { ...state.session, status: "splash", user: null, method: null, position: action.onboarding ? DEFAULT_POSITION : state.session.position }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, modal: null };
    case "SET_IDENTITY": {
      const identity = action.identity === "result" ? ({ reussie: "verifiee", en_cours: "en_cours", manuelle: "en_cours" }[state.auth.idResult] || state.session.identity) : action.identity;
      return { ...state, session: { ...state.session, identity } };
    }
    case "RESET":
      return { ...initialState(), prefs: state.prefs, session: state.session };
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

function Marker({ family, icon, selected, critical, label, style, onClick, dataId }) {
  const content = (
    <Fragment>
      <svg className="shape" viewBox="0 0 36 36" aria-hidden="true">{MARKER_SHAPES[family]}</svg>
      <Icon name={`${icon}-fill`} style={family === "vigilance" ? { top: 4 } : undefined} />
      {critical ? <span className="marker-label">Urgent</span> : null}
    </Fragment>
  );
  const cls = cx("marker", `fam-${family}`, selected && "is-selected", critical && "is-critical");
  if (onClick) return <button type="button" className={cls} style={{ ...style, border: 0, background: "none", padding: 0, cursor: "pointer" }} aria-label={label} onClick={onClick} data-alert={dataId}>{content}</button>;
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
  const status = alertStatus(alert, now, showStatus);
  const ago = fmtRelative(now - alert.createdAt);
  const aria = `${cat.label}. ${alert.title}. ${commune}${dist ? `, ${dist}` : ""}, ${ago}. ${alert.votesUp} confirmations, ${alert.commentsCount} commentaires.`;
  return (
    <button type="button" className={cx("alert-card", `fam-${cat.family}`)} onClick={onOpen} aria-label={aria}>
      <Marker family={cat.family} icon={cat.icon} />
      <span className="ac-main" aria-hidden="true">
        <span className="ac-eyebrow"><b>{cat.label}</b><span>{ago}</span></span>
        <h4>{alert.title}</h4>
        <span className="meta"><Icon name="map-pin" className="ph-sm" /><span>{commune}{dist ? ` · ${dist}` : ""}</span></span>
      </span>
      {alert.hasPhoto ? <span className="ac-photo" aria-hidden="true"><Icon name="image" /></span> : null}
      <span className="ac-foot" aria-hidden="true">
        <span className="stats">
          <span><Icon name="arrow-fat-up" />{alert.votesUp}</span>
          <span><Icon name="arrow-fat-down" />{alert.votesDown}</span>
          <span><Icon name="chat-circle" />{alert.commentsCount}</span>
        </span>
        {status}
      </span>
    </button>
  );
}

function VoteBar({ alert, compact }) {
  const { state } = useStore();
  const { vote, toast } = useActions();
  const current = state.votes[alert.id] || 0;
  const onVote = (v) => {
    if (state.demo.offline) { toast("Vote impossible hors connexion.", { tone: "error" }); return; }
    if (!state.session.user) { toast("Connectez-vous pour confirmer ou contester une alerte."); return; }
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

function BottomSheet({ snap = "half", onSnap, onClose, title, subtitle, modal, children, dismissible = true, peek = SNAP_HEIGHTS.peek, half = SNAP_HEIGHTS.half, headerAction }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [dragH, setDragH] = useState(null);
  const parentH = () => ref.current?.parentElement?.clientHeight || 700;
  const heightFor = (s) => (s === "peek" ? peek : (s === "half" ? half : SNAP_HEIGHTS[s]) * parentH());
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
            {title && subtitle ? <div className="bs-titles"><h2>{title}</h2><p>{subtitle}</p></div> : title ? <h2>{title}</h2> : <span style={{ flex: 1 }} />}
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

/* =====================================================================
   CARTE INTERACTIVE DU VAL-D'OISE (phase 3)
   Géométrie : prototype/src/map-95.json (tools/build_map_95.py), embarquée par le build (window.MAP_95).
   Repère en kilomètres ; la vue est { cx, cy, s } : point du repère au centre de l'écran et échelle en px/km.
   ===================================================================== */
const MAP95 = (typeof window !== "undefined" && window.MAP_95) || null;
const PROJ = MAP95 ? MAP95.proj : { lat0: 49.245, lng0: 1.6, kx: 72.95, ky: 111.32 };
const DEPT_KM = MAP95 ? { x: MAP95.bounds[0], y: MAP95.bounds[1], w: MAP95.bounds[2], h: MAP95.bounds[3] } : { x: 0, y: 0, w: 72.5, h: 37.4 };

function projectKm(p) {
  return { x: (p.lng - PROJ.lng0) * PROJ.kx, y: (PROJ.lat0 - p.lat) * PROJ.ky };
}

/* Chemins « M x yL x y…Z » → anneaux, pour savoir dans quelle commune ou quel quartier tombe un point */
function pathRings(d) {
  return d.split("Z").filter(Boolean).map((r) => r.slice(1).split("L").map((pt) => pt.split(" ").map(Number)));
}
function inRings(rings, x, y) {
  let inside = false;
  rings.forEach((ring) => {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  });
  return inside;
}

const GEO = MAP95 ? {
  dept: pathRings(MAP95.dept),
  communes: MAP95.communes.map((c) => ({ ...c, rings: pathRings(c.d) })),
  quartiers: MAP95.quartiers.map((q) => ({ ...q, rings: pathRings(q.d) })),
  epci: Object.fromEntries(MAP95.epci.map((e) => [e.id, e])),
} : null;

/* Où tombe un point du repère : département, intercommunalité, commune, quartier fictif */
function placeAt(x, y) {
  if (!GEO || !inRings(GEO.dept, x, y)) return { inside: false };
  const commune = GEO.communes.find((c) => inRings(c.rings, x, y));
  const quartier = commune ? GEO.quartiers.find((q) => q.commune === commune.code && inRings(q.rings, x, y)) : null;
  return { inside: true, commune, quartier, epci: commune ? GEO.epci[commune.epci] : null };
}

/* Quatre niveaux de zoom (tâche 3.2) : seuils en px/km */
const MAP_LEVELS = [
  { id: "departement", label: "Département", min: 0 },
  { id: "interco", label: "Intercommunalité", min: 10 },
  { id: "commune", label: "Commune", min: 24 },
  { id: "quartier", label: "Quartier", min: 60 },
];
const MAP_MAX_S = 170;
function levelOf(s) {
  return MAP_LEVELS.reduce((k, l, i) => (s >= l.min ? i : k), 0);
}
function levelText(level, place) {
  if (!place.inside) return "Hors Val-d'Oise";
  const commune = place.commune ? place.commune.name : "Val-d'Oise";
  if (level === 0) return "Département · Val-d'Oise";
  if (level === 1) return `Intercommunalité · ${place.epci ? place.epci.short : commune}`;
  if (level === 3 && place.quartier) return `Quartier · ${place.quartier.name}, ${commune}`;
  return `Commune · ${commune}`;
}

/* Alertes de zone (inondation, travaux) : polygone translucide autour du marqueur (tâche 3.11) */
function areaPath(alert) {
  const c = projectKm(alert);
  const pts = Array.from({ length: 12 }, (_, i) => {
    const [j] = seededJitter(`${alert.id}${i}`, 0.5);
    const r = alert.areaKm * (0.82 + j);
    const t = (i / 12) * Math.PI * 2;
    return `${(c.x + Math.cos(t) * r * 1.15).toFixed(3)} ${(c.y + Math.sin(t) * r * 0.85).toFixed(3)}`;
  });
  return `M${pts.join("L")}Z`;
}

/* Fond de carte : construit une seule fois ; le niveau de zoom choisit les couches visibles (CSS) */
const GEO_LAYERS = MAP95 ? (
  <Fragment>
    <path className="geo-dept" d={MAP95.dept} />
    {MAP95.forests.map((f) => <path key={f.name} className="geo-forest" d={f.d} />)}
    {MAP95.lakes.map((l) => <path key={l.name} className="geo-lake" d={l.d} />)}
    <g className="geo-communes">{MAP95.communes.map((c) => <path key={c.code} d={c.d} />)}</g>
    <g className="geo-quartiers">{MAP95.quartiers.map((q) => <path key={q.commune + q.name} d={q.d} />)}</g>
    <g className="geo-epci">{MAP95.epci.map((e) => <path key={e.id} d={e.d} />)}</g>
    {MAP95.water.map((w) => <path key={w.name} className={cx("geo-water", w.w > 8 && "is-large")} d={w.d} />)}
    {MAP95.roads.map((r) => <path key={`${r.ref}-case`} className="geo-road-case" d={r.d} />)}
    {MAP95.roads.map((r) => <path key={r.ref} className={cx("geo-road", `is-${r.cls}`)} d={r.d} />)}
    <path className="geo-dept-line" d={MAP95.dept} />
  </Fragment>
) : null;

/* Libellés selon le niveau, sans chevauchement (les plus peuplés d'abord) */
function mapLabels(level, toScreen, w, h, topInset = MAP_INSET_TOP - 16) {
  if (!MAP95) return [];
  const cand = [];
  const add = (text, c, cls, priority) => cand.push({ text, c, cls, priority });
  if (level === 0) {
    add("Val-d'Oise", [DEPT_KM.x + DEPT_KM.w * 0.47, DEPT_KM.y + DEPT_KM.h * 0.32], "lbl-dept", 0);
    MAP95.communes.slice(0, 6).forEach((c, i) => add(c.name, c.c, "lbl-town", 10 + i));
  }
  if (level === 1) {
    MAP95.epci.filter((e) => e.n > 2).forEach((e) => add(e.short, e.c, "lbl-epci", 1));
    MAP95.communes.filter((c) => c.pop >= 25000).forEach((c, i) => add(c.name, c.c, "lbl-town", 10 + i));
  }
  if (level >= 2) {
    MAP95.communes.forEach((c, i) => add(c.name, c.c, level === 3 ? "lbl-town is-strong" : "lbl-town", 10 + i));
    MAP95.water.forEach((wt) => add(wt.name, wt.c, "lbl-water", 400));
  }
  if (level === 3) {
    MAP95.quartiers.forEach((q) => add(q.name, q.c, "lbl-quartier", 2));
    MAP95.forests.forEach((f) => add(f.name, f.c, "lbl-forest", 300));
  }
  if (level <= 1) MAP95.outside.forEach((o) => add(o.name, o.c, "lbl-outside", 200));
  cand.sort((a, b) => a.priority - b.priority);
  const boxes = [];
  const out = [];
  cand.forEach((l) => {
    const p = toScreen(l.c[0], l.c[1]);
    const lw = l.text.length * (l.cls === "lbl-dept" ? 9 : 6.6) + 8;
    const lh = l.cls === "lbl-dept" ? 22 : 16;
    const box = [p.x - lw / 2, p.y - lh / 2, p.x + lw / 2, p.y + lh / 2];
    if (box[2] < 0 || box[0] > w || box[3] < 0 || box[1] > h) return;
    if (box[1] < topInset) return; // rien entre les puces ni sous la barre de recherche
    if (boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) return;
    boxes.push(box);
    out.push({ ...l, x: p.x, y: p.y, key: l.cls + l.text + l.c.join() });
  });
  return out;
}

/* Regroupement à l'écran (tâche 3.4) : marqueurs à moins de `radius` px → un regroupement ; il se divise au zoom */
function clusterOnScreen(items, radius) {
  const used = new Set();
  const out = [];
  items.forEach((p) => {
    if (used.has(p.a.id)) return;
    const group = items.filter((q) => !used.has(q.a.id) && Math.hypot(q.x - p.x, q.y - p.y) < radius);
    group.forEach((q) => used.add(q.a.id));
    out.push({ key: group.map((q) => q.a.id).join("-"), alerts: group.map((q) => q.a), x: group.reduce((s, q) => s + q.x, 0) / group.length, y: group.reduce((s, q) => s + q.y, 0) / group.length });
  });
  return out;
}

const PRIORITY_RANK = { critique: 0, elevee: 1, normale: 2 };
const MAP_INSET_TOP = 148; // barre de recherche, puces et étiquette de niveau
const SELECTION_HALF = 0.62; // fiche de sélection : assez haute pour tout montrer, la carte reste visible au-dessus
let lastMapView = null; // vue conservée entre deux visites de l'onglet Carte (pour la même zone suivie)
let lastMapZone = null;
let mapLoadedOnce = false;

const LiveMap = React.forwardRef(function LiveMap({ alerts, selectedId, onSelect, zone, me, sheetMode, peek, loading, onViewChange, error }, ref) {
  const box = useRef(null);
  const [size, setSize] = useState(null);
  const zoneKey = zone ? `${zone.center.lat},${zone.center.lng},${zone.radiusKm}` : "none";
  const [view, setView] = useState(lastMapZone === zoneKey ? lastMapView : null);
  const viewRef = useRef(view);
  const anim = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  useLayoutEffect(() => {
    const el = box.current;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bottomInset = size ? (sheetMode === "peek" ? peek : size.h * (sheetMode === "selection" ? SELECTION_HALF : 0.5)) : peek;
  const geom = useRef({});
  geom.current = { size, bottomInset };
  const minS = size ? Math.max(3, ((size.w - 24) / DEPT_KM.w) * 0.8) : 3;
  const clampView = useCallback((v) => {
    const s = Math.min(MAP_MAX_S, Math.max(minS, v.s));
    return { s, cx: Math.min(DEPT_KM.x + DEPT_KM.w + 4, Math.max(DEPT_KM.x - 4, v.cx)), cy: Math.min(DEPT_KM.y + DEPT_KM.h + 4, Math.max(DEPT_KM.y - 4, v.cy)) };
  }, [minS]);

  const apply = useCallback((v, settle, bottomOverride) => {
    const next = clampView(v);
    viewRef.current = next;
    lastMapView = next;
    lastMapZone = zoneKey;
    setView(next);
    if (settle) {
      // Le lieu annoncé est celui du centre visible (entre la barre du haut et le volet), pas du centre de l'écran
      const { size: sz } = geom.current;
      const bi = bottomOverride != null ? bottomOverride : geom.current.bottomInset;
      const fy = sz ? (MAP_INSET_TOP + sz.h - bi) / 2 - sz.h / 2 : 0;
      onViewChange?.(next, settle, { x: next.cx, y: next.cy + fy / next.s });
    }
  }, [clampView, onViewChange, zoneKey]);

  /* Centre visible : entre la barre du haut et le volet */
  const focusY = (h, bottom) => (MAP_INSET_TOP + (h - bottom)) / 2;
  const viewFor = useCallback((x, y, s, bottom = bottomInset) => ({ s, cx: x, cy: y - (focusY(size.h, bottom) - size.h / 2) / s }), [size, bottomInset]);
  const fitZone = useCallback(() => {
    if (!size) return null;
    if (!zone) return { s: ((size.w - 24) / DEPT_KM.w), cx: DEPT_KM.x + DEPT_KM.w / 2, cy: DEPT_KM.y + DEPT_KM.h / 2 + 4 };
    const c = projectKm(zone.center);
    const visH = size.h - MAP_INSET_TOP - peek - 32;
    const s = Math.min(MAP_MAX_S, (size.w - 48) / (2 * zone.radiusKm), visH / (2 * zone.radiusKm));
    return viewFor(c.x, c.y, s, peek); // la zone se cadre toujours au-dessus du volet réduit
  }, [size, zone, peek, viewFor]);

  const animateTo = useCallback((target, settle = "program", bottom) => {
    cancelAnimationFrame(anim.current);
    const from = viewRef.current;
    const to = clampView(target);
    if (!from || motionReduced()) { apply(to, settle, bottom); return; }
    const t0 = performance.now();
    const dur = 420;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e);
      apply({ s, cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e }, k === 1 ? settle : null, bottom);
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, [apply, clampView]);

  // Première vue : la zone suivie (ou tout le département sans position) ; nouvelle zone → la carte s'y recentre
  const shownZone = useRef(zoneKey);
  useEffect(() => {
    if (!size) return;
    if (!viewRef.current) { apply(fitZone(), "init"); return; }
    if (shownZone.current !== zoneKey) { shownZone.current = zoneKey; animateTo(fitZone(), "recenter"); }
  }, [size, zoneKey, fitZone, apply, animateTo]);
  useEffect(() => { if (viewRef.current && size) apply(viewRef.current, "init"); }, [!!size]); // vue restaurée : informer l'écran

  const zoomBy = useCallback((k, at) => {
    const v = viewRef.current;
    if (!v || !size) return;
    const px = at ? at.x : size.w / 2;
    const py = at ? at.y : focusY(size.h, bottomInset);
    const wx = v.cx + (px - size.w / 2) / v.s;
    const wy = v.cy + (py - size.h / 2) / v.s;
    const s = Math.min(MAP_MAX_S, Math.max(minS, v.s * k));
    animateTo({ s, cx: wx - (px - size.w / 2) / s, cy: wy - (py - size.h / 2) / s }, "user");
  }, [size, bottomInset, minS, animateTo]);

  useImperativeHandle(ref, () => ({
    recenter: () => { const v = fitZone(); if (v) animateTo(v, "recenter"); },
    focusAlert: (a) => {
      const p = projectKm(a);
      const v = viewRef.current;
      const bottom = size ? size.h * SELECTION_HALF : 420;
      animateTo(viewFor(p.x, p.y, Math.max(v ? v.s : 0, MAP_LEVELS[2].min + 8), bottom), "program", bottom);
    },
    zoomBy,
    bounds: () => {
      const v = viewRef.current;
      if (!v || !size) return null;
      return { x0: v.cx - size.w / 2 / v.s, x1: v.cx + size.w / 2 / v.s, y0: v.cy + (MAP_INSET_TOP - size.h / 2) / v.s, y1: v.cy + (size.h - bottomInset - size.h / 2) / v.s };
    },
  }), [fitZone, animateTo, viewFor, size, zoomBy, bottomInset]);

  /* Gestes : glisser (1 doigt), pincer (2 doigts), molette, double toucher, clavier */
  const local = (e) => { const r = box.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    cancelAnimationFrame(anim.current);
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    const v = viewRef.current;
    if (pts.length === 1) gesture.current = { type: "pan", start: pts[0], v, moved: false, id: e.pointerId };
    if (pts.length === 2) {
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      gesture.current = { type: "pinch", dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), mid, v, moved: true };
      try { box.current.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    }
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    if (g.type === "pan" && pts.length === 1) {
      const dx = pts[0].x - g.start.x;
      const dy = pts[0].y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 6) return;
      if (!g.moved) { g.moved = true; try { box.current.setPointerCapture(e.pointerId); } catch (err) { /* idem */ } }
      apply({ s: g.v.s, cx: g.v.cx - dx / g.v.s, cy: g.v.cy - dy / g.v.s });
    }
    if (g.type === "pinch" && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const s = Math.min(MAP_MAX_S, Math.max(minS, g.v.s * (dist / g.dist)));
      const wx = g.v.cx + (g.mid.x - size.w / 2) / g.v.s;
      const wy = g.v.cy + (g.mid.y - size.h / 2) / g.v.s;
      apply({ s, cx: wx - (mid.x - size.w / 2) / s, cy: wy - (mid.y - size.h / 2) / s });
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (pointers.current.size === 0) {
      gesture.current = null;
      if (g.moved) apply(viewRef.current, "user");
    } else if (g.type === "pinch") {
      const [p] = [...pointers.current.values()];
      gesture.current = { type: "pan", start: p, v: viewRef.current, moved: true };
    }
  };
  useEffect(() => {
    const el = box.current;
    let timer = null;
    const onWheel = (e) => {
      e.preventDefault();
      const v = viewRef.current;
      if (!v || !size) return;
      const at = local(e);
      const k = Math.exp(-e.deltaY * 0.0022);
      const s = Math.min(MAP_MAX_S, Math.max(minS, v.s * k));
      const wx = v.cx + (at.x - size.w / 2) / v.s;
      const wy = v.cy + (at.y - size.h / 2) / v.s;
      apply({ s, cx: wx - (at.x - size.w / 2) / s, cy: wy - (at.y - size.h / 2) / s });
      clearTimeout(timer);
      timer = setTimeout(() => apply(viewRef.current, "user"), 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); clearTimeout(timer); };
  }, [size, minS, apply]);
  const onKeyDown = (e) => {
    const v = viewRef.current;
    if (!v || e.target !== box.current) return;
    const step = 80 / v.s;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); animateTo({ ...v, cx: v.cx + moves[e.key][0], cy: v.cy + moves[e.key][1] }, "user"); }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(2); }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomBy(0.5); }
  };
  const onDoubleClick = (e) => {
    if (e.target.closest("button")) return;
    zoomBy(2, local(e));
  };

  const v = view;
  const ready = size && v;
  const level = ready ? levelOf(v.s) : 0;
  const toScreen = (x, y) => ({ x: (x - v.cx) * v.s + size.w / 2, y: (y - v.cy) * v.s + size.h / 2 });

  // Marqueurs : alertes visibles à l'écran ; la sélection reste toujours individuelle et au premier plan
  let pins = [];
  if (ready && !loading && !error) {
    const items = alerts
      .map((a) => ({ a, ...toScreen(projectKm(a).x, projectKm(a).y) }))
      .filter((p) => p.x > -30 && p.x < size.w + 30 && p.y > -30 && p.y < size.h + 30)
      .sort((p, q) => PRIORITY_RANK[CATEGORY_BY_ID[p.a.categoryId].priority] - PRIORITY_RANK[CATEGORY_BY_ID[q.a.categoryId].priority]);
    const free = items.filter((p) => p.a.id !== selectedId);
    const radius = free.length > 12 ? 58 : 44; // au-delà de 12 marqueurs visibles, regroupement plus serré
    pins = clusterOnScreen(free, radius);
    const sel = items.find((p) => p.a.id === selectedId);
    if (sel) pins.push({ key: sel.a.id, alerts: [sel.a], x: sel.x, y: sel.y, selected: true });
  }
  const labels = ready && !error ? mapLabels(level, toScreen, size.w, size.h) : [];
  const meScreen = ready && me ? toScreen(projectKm(me).x, projectKm(me).y) : null;

  const openCluster = (p) => {
    const ks = p.alerts.map(projectKm);
    const x0 = Math.min(...ks.map((k) => k.x));
    const x1 = Math.max(...ks.map((k) => k.x));
    const y0 = Math.min(...ks.map((k) => k.y));
    const y1 = Math.max(...ks.map((k) => k.y));
    const visH = size.h - MAP_INSET_TOP - bottomInset;
    const fit = Math.min((size.w - 96) / Math.max(0.05, x1 - x0), (visH - 96) / Math.max(0.05, y1 - y0));
    const s = Math.min(MAP_MAX_S, Math.max(v.s * 2, fit));
    animateTo(viewFor((x0 + x1) / 2, (y0 + y1) / 2, s), "user");
  };

  return (
    <div ref={box} className={cx("map95", "map-live", `lv-${level}`, error && "is-error")} tabIndex={0} role="region"
      aria-label="Carte des alertes. Flèches pour déplacer la carte, plus et moins pour zoomer."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown} onDoubleClick={onDoubleClick}>
      {ready && !error ? (
        <svg className="map-geo" width={size.w} height={size.h} aria-hidden="true">
          <g transform={`translate(${size.w / 2 - v.cx * v.s} ${size.h / 2 - v.cy * v.s}) scale(${v.s})`}>
            {GEO_LAYERS}
            {zone ? <circle className="geo-zone" cx={projectKm(zone.center).x} cy={projectKm(zone.center).y} r={zone.radiusKm} /> : null}
            {loading ? null : alerts.filter((a) => a.areaKm).map((a) => <path key={a.id} className={cx("area-shape", `fam-${CATEGORY_BY_ID[a.categoryId].family}`, a.id === selectedId && "is-selected")} d={areaPath(a)} />)}
          </g>
        </svg>
      ) : null}
      {labels.map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }} aria-hidden="true">{l.text}</span>)}
      {meScreen ? (
        <span className="me-wrap" style={{ left: meScreen.x, top: meScreen.y }} role="img" aria-label="Vous êtes ici">
          <span className="me-accuracy" style={{ width: Math.max(28, 0.15 * v.s * 2), height: Math.max(28, 0.15 * v.s * 2) }} />
          <span className="me" />
        </span>
      ) : null}
      {pins.map((p, i) => {
        if (p.alerts.length > 1) {
          return (
            <span key={p.key} className="map-pin is-cluster" style={{ left: p.x, top: p.y, animationDelay: mapLoadedOnce ? undefined : `${i * 45}ms` }}>
              <ClusterMarker count={p.alerts.length} onClick={() => openCluster(p)} />
            </span>
          );
        }
        const a = p.alerts[0];
        const cat = CATEGORY_BY_ID[a.categoryId];
        const critical = cat.priority === "critique";
        const dist = me ? `, ${fmtDistance(haversineKm(me, a))}` : "";
        return (
          <span key={p.key} className={cx("map-pin", p.selected && "is-selected")} style={{ left: p.x, top: p.y, animationDelay: mapLoadedOnce ? undefined : `${i * 45}ms` }}>
            <Marker family={cat.family} icon={cat.icon} selected={p.selected} critical={critical} dataId={a.id}
              label={`${cat.label}${critical ? ", Urgent" : ""}${a.areaKm ? ", alerte de zone" : ""}${dist} : ${a.title}`} onClick={() => onSelect(a.id)} />
          </span>
        );
      })}
    </div>
  );
});

function MapLevelTag({ text, scale }) {
  // Échelle : 1 km, 500 m ou 5 km selon le zoom, pour une barre de 40 à 90 px
  const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10];
  const km = steps.find((k) => k * scale >= 40) || 10;
  return (
    <div className="map-level" aria-live="polite">
      <span>{text}</span>
      <span className="map-scale" aria-label={`Échelle : ${km < 1 ? `${km * 1000} m` : `${km} km`}`}><i style={{ width: km * scale }} />{km < 1 ? `${km * 1000} m` : `${km} km`}</span>
    </div>
  );
}

function MapControls({ onZoomIn, onZoomOut, onLocate, onLegend, bottom, locateLabel }) {
  return (
    <div className="map-controls" style={{ bottom }}>
      <IconButton icon="info" label="Comprendre la carte" onClick={onLegend} />
      <div className="mc-zoom" role="group" aria-label="Zoom">
        <IconButton icon="plus" label="Zoomer" onClick={onZoomIn} />
        <IconButton icon="minus" label="Dézoomer" onClick={onZoomOut} />
      </div>
      <IconButton icon="crosshair" label={locateLabel} onClick={onLocate} />
    </div>
  );
}

function ViewToggle({ view, onChange, floating }) {
  const toList = view === "map";
  return (
    <button type="button" className={cx("view-toggle", floating && "is-floating")} onClick={() => onChange(toList ? "list" : "map")} aria-label={toList ? "Afficher la liste des alertes" : "Afficher la carte"}>
      <Icon name={toList ? "list-bullets" : "map-trifold"} />{toList ? "Liste" : "Carte"}
    </button>
  );
}

/* Statut affiché sur une alerte (carte, fiche de sélection) */
function alertStatus(alert, now, showStatus) {
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const life = alertLifecycle(alert, now);
  if (life === "proche") return <StatusBadge status="proche" label={`Expire dans ${fmtRemaining(alert.expiresAt - now)}`} />;
  if (life === "expiree" || life === "supprimee" || life === "moderee") return <StatusBadge status={life} />;
  if (["pris_en_compte", "en_traitement", "traite", "cloture"].includes(alert.transmission)) return <StatusBadge status={alert.transmission} />;
  if (cat.type === "negative" || showStatus) return <StatusBadge status="transmis" />;
  return null;
}

/* Fiche de sélection (tâche 3.7) : quoi, où, depuis quand, par qui, combien ; balayage vers l'alerte voisine */
function AlertSummary({ alert, onClose, index, total, onStep }) {
  const { state } = useStore();
  const { toast } = useActions();
  const now = useNow();
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const pos = state.session.position;
  const dist = pos.source !== "default" ? ` · ${fmtDistance(haversineKm(pos, alert))}` : "";
  const author = publicAuthor(alert);
  const duplicates = alert.duplicateGroup ? state.alerts.filter((a) => a.duplicateGroup === alert.duplicateGroup && a.status === "active").length : 1;
  const swipe = useRef(null);
  const onPointerDown = (e) => { if (!e.target.closest("button")) swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || total < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) onStep(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (e) => {
    if (total < 2 || e.target.closest(".vote")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); onStep(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1); }
  };
  return (
    <div className={cx("summary", `fam-${cat.family}`)} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onKeyDown={onKeyDown}>
      <div className="summary-head">
        <TypeBadge category={cat} />
        {alert.areaKm ? <span className="badge badge-area"><Icon name="polygon" />Zone</span> : null}
        <span className="demo-note">{fmtRelative(now - alert.createdAt)}</span>
        <IconButton icon="x" label="Fermer la fiche" className="flat" onClick={onClose} />
      </div>
      <h3 className="summary-title">{alert.title}</h3>
      <p className="summary-meta"><Icon name="map-pin" className="ph-sm" /><span>{displayPlace(alert)}{dist}</span></p>
      <div className="summary-by">
        <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
        <span>Signalé par <b>{author.name}</b></span>
        {alertStatus(alert, now)}
      </div>
      {alert.areaKm ? <p className="summary-meta"><Icon name="polygon" className="ph-sm" />Zone d'environ {fmtDistance(alert.areaKm * 2)} de large</p> : null}
      {duplicates > 1 ? <Banner tone="info" icon="copy">{duplicates} signalements semblent concerner le même événement.</Banner> : null}
      <div className="summary-actions">
        <VoteBar alert={alert} compact />
        <span className="summary-comments"><Icon name="chat-circle" />{alert.commentsCount} commentaire{alert.commentsCount > 1 ? "s" : ""}</span>
      </div>
      <Button block onClick={() => toast("La fiche alerte complète arrive bientôt.")}>Voir le détail</Button>
      {total > 1 ? (
        <div className="summary-pager">
          <IconButton icon="caret-left" label="Alerte précédente" className="flat" onClick={() => onStep(-1)} />
          <span aria-live="polite">{index + 1} sur {total} · balayez pour l'alerte voisine</span>
          <IconButton icon="caret-right" label="Alerte suivante" className="flat" onClick={() => onStep(1)} />
        </div>
      ) : null}
    </div>
  );
}

/* Feuilles de la carte : légende (« Comprendre la carte ») et filtres */
function MapLegendSheet() {
  const rows = [
    { m: <Marker family="incident" icon="fire" />, t: "Incident", d: "Losange rouge : incendie, accident, inondation, sécurité." },
    { m: <Marker family="vigilance" icon="traffic-cone" />, t: "Vigilance", d: "Triangle orange : voirie, éclairage, propreté, nuisances." },
    { m: <Marker family="positive" icon="hand-heart" />, t: "Événement positif", d: "Cercle vert : solidarité, culture, sport, environnement." },
    { m: <Marker family="info" icon="megaphone" />, t: "Information", d: "Carré bleu : travaux, information utile." },
    { m: <Marker family="incident" icon="fire" critical />, t: "Urgent", d: "Halo animé et étiquette : alerte critique, signalée en priorité." },
    { m: <span className="cluster c-s">12</span>, t: "Regroupement", d: "Plusieurs alertes proches. Touchez pour zoomer : le groupe se divise." },
    { m: <span className="legend-swatch area fam-incident" />, t: "Alerte de zone", d: "Inondation, travaux : la zone concernée est dessinée autour du marqueur." },
    { m: <span className="legend-swatch zone" />, t: "Votre zone", d: "Le rayon suivi (1, 5 ou 10 km), modifiable dans le profil." },
    { m: <span className="me" />, t: "Vous êtes ici", d: "Avec la précision de la localisation, si vous l'avez autorisée." },
    { m: <span className="legend-swatch outside" />, t: "Hors Val-d'Oise", d: "95 Alerte n'est pas encore disponible dans cette zone." },
  ];
  return (
    <Fragment>
      <ul className="legend-list">
        {rows.map((r) => <li key={r.t}><span className="legend-mark">{r.m}</span><span><b>{r.t}</b>{r.d}</span></li>)}
      </ul>
      <p className="demo-note">Contours des communes : IGN (ADMIN EXPRESS). Quartiers de Cergy, Pontoise, Saint-Ouen-l'Aumône et Osny : découpage fictif pour la démonstration.</p>
      <Banner tone="info" icon="siren" title="95 Alerte n'est pas un service de secours.">En cas d'urgence, appelez le 112.</Banner>
    </Fragment>
  );
}

const MAP_FAMILIES = ["incident", "vigilance", "positive", "info"];
function MapFiltersSheet() {
  const { state, dispatch } = useStore();
  const { closeSheet } = useActions();
  const alerts = useVisibleAlerts();
  const f = state.mapFilter;
  const set = (patch) => dispatch({ type: "SET_MAP_FILTER", patch });
  const count = alerts.filter((a) => mapFilterMatch(f, a)).length;
  const examples = { incident: "fire", vigilance: "traffic-cone", positive: "hand-heart", info: "megaphone" };
  return (
    <Fragment>
      <p className="section-label">Familles d'alertes</p>
      {MAP_FAMILIES.map((fam) => (
        <div key={fam} className="filter-row">
          <Marker family={fam} icon={examples[fam]} />
          <Switch id={`filter-${fam}`} label={FAMILY_LABEL[fam]} checked={!f.hidden.includes(fam)} onChange={(on) => set({ hidden: on ? f.hidden.filter((x) => x !== fam) : [...f.hidden, fam] })} />
        </div>
      ))}
      <p className="section-label">Priorité</p>
      <div className="filter-row">
        <span className="filter-urgent" aria-hidden="true"><Icon name="siren-fill" /></span>
        <Switch id="filter-urgent" label="Seulement les alertes urgentes" checked={f.urgentOnly} onChange={(on) => set({ urgentOnly: on })} />
      </div>
      <div className="lib-row">
        <Button block onClick={closeSheet}>{count ? `Afficher ${count} alerte${count > 1 ? "s" : ""}` : "Aucune alerte avec ces filtres"}</Button>
        <button type="button" className="btn btn-tertiary" onClick={() => set({ type: "all", hidden: [], urgentOnly: false })}>Tout réinitialiser</button>
      </div>
    </Fragment>
  );
}

/* Puces de type et bouton Filtres : partagés par la carte et l'onglet Alertes (même filtre) */
function TypeChips() {
  const { state, dispatch } = useStore();
  return (
    <div className="map-chips" role="group" aria-label="Type d'alertes">
      {[{ v: "all", l: "Toutes" }, { v: "positive", l: "Positives" }, { v: "negative", l: "Négatives" }].map((o) => (
        <Chip key={o.v} selected={state.mapFilter.type === o.v} onClick={() => dispatch({ type: "SET_MAP_FILTER", patch: { type: o.v } })}>{o.l}</Chip>
      ))}
    </div>
  );
}
function FilterButton({ flat }) {
  const { state } = useStore();
  const { openSheet } = useActions();
  const n = state.mapFilter.hidden.length + (state.mapFilter.urgentOnly ? 1 : 0);
  return <IconButton icon="sliders-horizontal" className={cx("is-filter", flat && "flat")} label={`Filtres${n ? `, ${n} actif${n > 1 ? "s" : ""}` : ""}`} badge={n || null} onClick={() => openSheet("map-filters", {}, "half")} />;
}

function mapFilterMatch(f, a) {
  const cat = CATEGORY_BY_ID[a.categoryId];
  return (f.type === "all" || cat.type === f.type) && !f.hidden.includes(cat.family) && (!f.urgentOnly || cat.priority === "critique");
}

/* =====================================================================
   ÉCRAN D'ACCUEIL : la carte (phase 3)
   ===================================================================== */
function MapScreen() {
  const { state, dispatch } = useStore();
  const { toast, push, openSheet, setPref } = useActions();
  const now = useNow();
  const all = useVisibleAlerts(); // 3.10 : alertes actives et non expirées seulement
  const map = useRef(null);
  const pos = state.session.position;
  const f = state.mapFilter;
  const homeView = state.prefs.homeView || "map";
  const hasZone = pos.source !== "default";
  const radius = zoneRadius(state);
  const showMe = hasZone && pos.source === "gps" && !state.demo.permissionDenied && !state.demo.gpsUnavailable;
  const zone = useMemo(() => (hasZone ? { center: { lat: pos.lat, lng: pos.lng }, radiusKm: radius } : null), [hasZone, pos.lat, pos.lng, radius]);

  const [snap, setSnap] = useState("peek");
  const [selectedId, setSelectedId] = useState(null);
  const [area, setArea] = useState(null); // « Voir les alertes ici » : zone affichée au lieu de la zone suivie
  const [viewInfo, setViewInfo] = useState(null);
  const [newSeen, setNewSeen] = useState(false);
  const [loading, setLoading] = useState(!mapLoadedOnce);
  const [retrying, setRetrying] = useState(false);
  const PEEK = 148;

  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => { setLoading(false); setTimeout(() => { mapLoadedOnce = true; }, 900); }, 900);
    return () => clearTimeout(t);
  }, [loading]);

  const events = useMemo(() => dedupeEvents(all.filter((a) => mapFilterMatch(f, a))), [all, f]);
  const inArea = (a) => { const k = projectKm(a); return k.x >= area.x0 && k.x <= area.x1 && k.y >= area.y0 && k.y <= area.y1; };
  const listing = useMemo(() => {
    const scoped = area ? events.filter(inArea) : hasZone ? events.filter((a) => haversineKm(pos, a) <= radius) : events;
    return hasZone ? scoped.map((a) => ({ a, km: haversineKm(pos, a) })).sort((x, y) => x.km - y.km).map((x) => x.a) : scoped.sort((x, y) => y.createdAt - x.createdAt);
  }, [events, area, hasZone, pos, radius]);
  const fresh = hasZone && !area ? listing.filter((a) => now - a.createdAt < HOUR) : [];

  const selected = selectedId ? all.find((a) => a.id === selectedId) : null;
  const ring = selected && listing.some((a) => a.id === selected.id) ? listing : selected ? [selected] : [];
  const index = selected ? ring.findIndex((a) => a.id === selected.id) : -1;

  const select = (id) => {
    const a = all.find((x) => x.id === id);
    if (!a) return;
    setSelectedId(id);
    setSnap("half");
    map.current?.focusAlert(a);
  };
  const closeSummary = useCallback(() => {
    const id = selectedId;
    setSelectedId(null);
    setSnap("peek");
    // Le focus revient au marqueur de l'alerte fermée
    requestAnimationFrame(() => document.querySelector(`.map-live [data-alert="${id}"]`)?.focus());
  }, [selectedId]);
  const step = (d) => { if (ring.length > 1) select(ring[(index + d + ring.length) % ring.length].id); };
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeSummary(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeSummary]);

  const onViewChange = useCallback((v, why, focus) => {
    const place = placeAt(focus.x, focus.y);
    setViewInfo({ s: v.s, level: levelOf(v.s), place, moved: why === "user" ? true : why === "recenter" || why === "init" ? false : undefined });
  }, []);
  const moved = viewInfo && viewInfo.moved;
  const recenter = () => {
    setArea(null);
    setSelectedId(null);
    setSnap("peek");
    map.current?.recenter();
    if (state.demo.permissionDenied && hasZone) toast(`Localisation désactivée : position choisie manuellement (${COMMUNE_BY_ID[pos.communeId]?.name || "Pontoise"}).`);
  };
  const searchHere = () => {
    const b = map.current?.bounds();
    if (!b) return;
    setArea(b);
    setSelectedId(null);
    setViewInfo((vi) => ({ ...vi, moved: false }));
    setSnap("half");
  };
  const widen = () => { dispatch({ type: "SET_RADIUS", km: 10 }); setArea(null); toast("Zone élargie à 10 km."); };
  const retry = () => { setRetrying(true); setTimeout(() => { setRetrying(false); toast("Toujours impossible de charger la carte.", { tone: "error", actionLabel: "OK" }); }, 900); };
  // Carte ⇄ liste : « smart animate » (la barre de recherche, les puces et la bascule se déforment, le reste se fond)
  const setView = (v) => {
    const run = () => ReactDOM.flushSync(() => { setPref("homeView", v); setSelectedId(null); setSnap("peek"); });
    if (document.startViewTransition && !motionReduced()) document.startViewTransition(run); else run();
  };

  const level = viewInfo ? viewInfo.level : 0;
  const place = viewInfo ? viewInfo.place : { inside: true };
  const sheetH = selected ? (snap === "full" ? "full" : "selection") : snap;

  // Une seule pilule contextuelle à la fois : hors territoire > voir ici > nouvelles alertes
  let pill = null;
  if (homeView === "map" && !state.demo.networkError && !loading && !selected) {
    if (viewInfo && !place.inside) pill = <span className="pill is-info" role="status"><Icon name="info" />95 Alerte n'est pas encore disponible dans cette zone.</span>;
    else if (moved) pill = <button type="button" className="pill" onClick={searchHere}><Icon name="arrows-clockwise" />Voir les alertes ici</button>;
    else if (fresh.length && !newSeen) pill = <Pill onClick={() => { setNewSeen(true); setSnap("half"); }}>{fresh.length} nouvelle{fresh.length > 1 ? "s" : ""} alerte{fresh.length > 1 ? "s" : ""}</Pill>;
  }

  const unread = state.notifications.filter((n) => !n.read).length;
  const title = area ? `${listing.length} alerte${listing.length > 1 ? "s" : ""} dans cette zone`
    : hasZone ? (listing.length ? `${listing.length} alerte${listing.length > 1 ? "s" : ""} dans votre zone` : "Aucun événement dans cette zone.")
    : `${listing.length} alertes dans le Val-d'Oise`;
  const subtitle = area ? "Zone affichée sur la carte" : hasZone ? `Rayon ${radius} km · mis à jour à l'instant` : "Choisissez une zone pour voir les alertes proches";

  const header = (
    <div className="map-top-wrap">
      <div className="map-top">
        <button type="button" className="search" onClick={() => push("commune")}>
          <Icon name="magnifying-glass" /><span>{pos.communeId ? <Fragment>{COMMUNE_BY_ID[pos.communeId].name}<small> · rechercher</small></Fragment> : <Fragment>Rechercher<small> · commune, adresse</small></Fragment>}</span>
        </button>
        <FilterButton />
        <IconButton icon="bell" label="Notifications" badge={unread || null} onClick={() => toast("Le centre de notifications arrive bientôt.")} />
      </div>
      <TypeChips />
    </div>
  );

  if (homeView === "list") {
    return (
      <div className="screen map-screen is-list">
        {header}
        <div className="home-list">
          <div className="home-list-head"><h2>{title}</h2><p>{subtitle}</p></div>
          {state.session.status === "in" ? <StartChecklist onConfirm={() => {}} /> : null}
          {listing.length === 0 ? (
            <EmptyState title="Aucun événement dans cette zone." action={radius < 10 && hasZone ? <Button variant="secondary" onClick={widen}>Élargir à 10 km</Button> : null}>Élargissez la zone ou revenez plus tard.</EmptyState>
          ) : listing.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => toast("La fiche alerte complète arrive bientôt.")} />)}
        </div>
        <ViewToggle view="list" floating onChange={setView} />
      </div>
    );
  }

  return (
    <div className="screen map-screen">
      <LiveMap ref={map} alerts={events} selectedId={selectedId} onSelect={select} zone={zone} me={showMe ? pos : null}
        sheetMode={sheetH} peek={PEEK} loading={loading} error={state.demo.networkError} onViewChange={onViewChange} />
      {header}
      {!state.demo.networkError && viewInfo ? <MapLevelTag text={levelText(level, place)} scale={viewInfo.s} /> : null}
      {!hasZone ? (
        <button type="button" className="map-banner" onClick={() => push("commune")}><Icon name="map-pin" /><span><b>Position non définie</b>Choisissez votre commune pour voir les alertes proches.</span><Icon name="caret-right" className="ph-sm" /></button>
      ) : pill ? <div className="map-pill">{pill}</div> : null}

      {state.demo.networkError ? (
        <div className="map-error" role="alert">
          <Spot icon="cloud-slash" tone="neutral" />
          <h2>Impossible de charger la carte.</h2>
          <p>Vérifiez votre connexion. La liste des alertes reste disponible.</p>
          <Button block loading={retrying} onClick={retry}>Réessayer</Button>
          <Button block variant="secondary" onClick={() => setView("list")}>Voir la liste</Button>
        </div>
      ) : (
        sheetH === "peek" ? (
          <MapControls bottom={PEEK + 12} onLegend={() => openSheet("map-legend", {}, "half")}
            onZoomIn={() => map.current?.zoomBy(2)} onZoomOut={() => map.current?.zoomBy(0.5)} onLocate={recenter}
            locateLabel={showMe ? "Recentrer sur ma position" : "Recentrer sur ma zone"} />
        ) : null
      )}

      {state.demo.networkError ? null : selected ? (
        <BottomSheet snap={snap === "peek" ? "half" : snap} peek={PEEK} half={SELECTION_HALF} onSnap={setSnap} onClose={closeSummary} title={null}>
          <AlertSummary alert={selected} onClose={closeSummary} index={index} total={ring.length} onStep={step} />
        </BottomSheet>
      ) : (
        <BottomSheet snap={snap} peek={PEEK} onSnap={setSnap} dismissible={false}
          title={loading ? <Skeleton height={20} width="62%" /> : title} subtitle={loading ? <Skeleton height={12} width="44%" /> : subtitle}
          headerAction={<ViewToggle view="map" onChange={setView} />}>
          {area ? <button type="button" className="btn btn-tertiary" style={{ justifySelf: "start" }} onClick={recenter}>Revenir à ma zone</button> : null}
          {state.session.status === "in" && !loading && listing.length ? <StartChecklist onConfirm={() => setSnap("half")} /> : null}
          {loading ? (
            <Fragment><Skeleton height={96} radius="var(--r-md)" /><Skeleton height={96} radius="var(--r-md)" /></Fragment>
          ) : listing.length === 0 ? (
            <EmptyState title="Aucun événement dans cette zone." action={radius < 10 && hasZone ? <Button variant="secondary" onClick={widen}>Élargir à 10 km</Button> : null}>Élargissez la zone ou revenez plus tard.</EmptyState>
          ) : listing.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => select(a.id)} />)}
        </BottomSheet>
      )}
    </div>
  );
}

function AlertsScreen() {
  const { state } = useStore();
  const { toast } = useActions();
  const alerts = useVisibleAlerts();
  const pos = state.session.position;
  const list = alerts.filter((a) => mapFilterMatch(state.mapFilter, a));
  const near = list.filter((a) => haversineKm(pos, a) <= zoneRadius(state)).sort((a, b) => haversineKm(pos, a) - haversineKm(pos, b));
  const rest = list.filter((a) => haversineKm(pos, a) > zoneRadius(state)).sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const open = () => toast("La fiche alerte complète arrive bientôt.");
  return (
    <div className="screen">
      <div className="screen-title row">
        <div><h1>Alertes</h1><p>{alerts.length} alertes actives dans le Val-d'Oise</p></div>
        <FilterButton flat />
      </div>
      <div className="screen-pad">
        <TypeChips />
        {list.length === 0 ? (
          <EmptyState title="Aucune alerte dans cette zone." action={<Button variant="secondary" onClick={() => toast("Zone élargie à tout le Val-d'Oise.")}>Élargir la zone</Button>}>Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
        ) : (
          <Fragment>
            {near.length ? <section className="list-section"><h2 className="section-label">À moins de {zoneRadius(state)} km</h2>{near.map((a) => <AlertCard key={a.id} alert={a} onOpen={open} />)}</section> : null}
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
  const mine = state.session.user ? state.alerts.filter((a) => a.authorId === ME_ID && a.status !== "supprimee").sort((a, b) => b.createdAt - a.createdAt) : [];
  const followed = state.alerts.filter((a) => state.follows[a.id]);
  const open = () => toast("Le suivi détaillé arrive bientôt.");
  return (
    <div className="screen">
      <div className="screen-title"><h1>Activité</h1><p>Vos signalements et leur suivi par les services</p></div>
      <div className="screen-pad">
        <SegmentedControl block label="Activité" value={tab} onChange={setTab} options={[{ value: "mine", label: "Mes alertes" }, { value: "comments", label: "Commentaires" }, { value: "followed", label: "Suivies" }]} />
        {!state.session.user ? (
          <GuestGate icon="pulse" title="Retrouvez ici votre activité" text="Connectez-vous pour suivre vos alertes, vos commentaires et les alertes que vous suivez." />
        ) : tab === "mine" ? (
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
  const { state, dispatch } = useStore();
  const { push, setPref, toast, confirm } = useActions();
  const user = state.session.user;
  const soon = () => toast("Disponible bientôt.");
  const logout = () => confirm({ title: "Se déconnecter ?", body: "Vous pourrez toujours consulter les alertes sans compte.", confirmLabel: "Se déconnecter", onConfirm: () => dispatch({ type: "LOGOUT" }) });
  return (
    <div className="screen">
      <div className="screen-title"><h1>Profil</h1></div>
      <div className="screen-pad">
        {user ? (
          <div className="identity">
            <span className="avatar" aria-hidden="true">{user.firstName[0]}{user.lastName[0]}</span>
            <div>
              <b>{user.firstName} {user.lastName}</b>
              <small>Vos alertes identifiées affichent « {publicName(user)} »</small>
              <IdentityBadge status={state.session.identity} />
            </div>
            {state.session.identity === "non_verifiee" ? <Button variant="secondary" block className="identity-action" icon="identification-card" onClick={() => { dispatch({ type: "AUTH_SET", patch: { idResult: "en_cours" } }); push("verify-identity"); }}>Vérifier mon identité</Button> : null}
          </div>
        ) : (
          <div className="identity">
            <span className="avatar anon" aria-hidden="true"><Icon name="user-circle" /></span>
            <div><b>Vous n'êtes pas connecté</b><small>Connectez-vous pour signaler, voter et suivre vos alertes.</small></div>
            <Button block className="identity-action" icon="sign-in" onClick={() => dispatch({ type: "LOGOUT" })}>Se connecter</Button>
          </div>
        )}
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
        {user ? <div className="list"><ListItem icon="sign-out" label="Se déconnecter" chevron={false} onClick={logout} /></div> : null}
      </div>
    </div>
  );
}

function ReportScreen() {
  const { state } = useStore();
  const { pop, toast } = useActions();
  const [type, setType] = useState(null);
  if (!state.session.user) {
    return (
      <div className="screen">
        <ScreenHeader title="Signaler" close onBack={pop} />
        <div className="screen-pad"><GuestGate icon="plus" title="Connectez-vous pour signaler" text="Un compte permet de transmettre votre signalement au bon service et d'en suivre le traitement. Vous pourrez publier anonymement." /></div>
      </div>
    );
  }
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

/* =====================================================================
   PHASE 1 — Démarrage et connexion (UI-001, UI-008 → UI-010 ; CDC §6, §8, §9, §43)
   ===================================================================== */
const SIGNUP_STEPS = ["Nom", "Téléphone", "E-mail", "Identité"];
const ID_DOCS = [
  { id: "cni", label: "Carte d'identité", hint: "Recto et verso" },
  { id: "passeport", label: "Passeport", hint: "Page avec la photo" },
  { id: "sejour", label: "Titre de séjour", hint: "Recto et verso" },
];
const IDENTITY_FROM_RESULT = { reussie: "verifiee", en_cours: "en_cours", manuelle: "en_cours", echouee: "non_verifiee", refusee: "non_verifiee" };

function maskPhone(p) {
  const d = (p || "").replace(/\D/g, "");
  return d.length >= 4 ? `${d.slice(0, 2)} •• •• •• ${d.slice(-2)}` : "votre numéro";
}
function maskEmail(e) {
  const [u, dom] = (e || "").split("@");
  return u && dom ? `${u[0]}•••@${dom}` : "votre adresse";
}

/* Logo officiel 95 Alerte (docs/brand/logo-95-alerte.svg, texte vectorisé). « 95 » jaune et gyrophare
   rouge : couleurs de l'asset ; « Alerte » prend la couleur du texte pour rester lisible en mode sombre. */
const LOGO_YELLOW = ['M93.6,14.4C83.5,4.4,73.1,0,55.3,0,25.4,0,4.8,19.7,4.8,46.4v.4c0,26.9,18.5,42.8,47.3,42.8s20.1-3.4,26.9-9.1c-1.1,11.4-6.8,30.1-26.9,30.1s-19.3-3.6-29-11.4l-15.4,22.2c11.2,9.3,24.2,15.7,43.6,15.7,37.7,0,57.9-29.4,57.9-72.3v-.4c0-26.1-6.2-40.5-15.7-50h0ZM79.6,45.7c0,11.4-8.3,19.7-22.7,19.7s-23.1-8.1-23.1-19.9v-.4c0-11.8,8.1-20.1,22.5-20.1s23.3,8.5,23.3,20.3v.4h0Z', 'M170.8,48.5c-7.4,0-12.1.9-17.4,2.3l1.5-22.9h56.4V2.3h-81.4l-3.8,65.3,11.1,7.4c3.8-7.3,10.6-12.7,18.6-13.5,15.4-1.6,24.6,3.7,30.6,13.6,6.1,10.1,5.4,20.8-1.8,30.4-5.4,7.4-11.4,14.3-17.1,21.5-.9,1.1-1.9,2.2-3.2.9-8.5-8.1-19.2-14.2-25.8-24.2-1.5-2.3-2.7-4.8-3.4-7.3,0,0-.2-.1-.2-.2l-17.6,21c12.9,12.3,28.4,19.9,49.6,19.9,30.5,0,50.4-17.8,50.4-45.8v-.4c0-29.9-20.6-42.4-46.4-42.4h0Z'];
const LOGO_RED = ['M161.9,108.5c-1.7.4-3.3-.4-3.9-2.2,2.1-.6,4.1-1.1,6.2-1.7.4,1.8-.6,3.3-2.3,3.8Z', 'M173.6,101.1c-6.1,1.7-12.3,3.3-18.5,4.9-1.4.4-2.4-.4-2.3-1.9.1-1.6.6-3.2,1.4-4.6.4-.7.6-1.4.7-2.1-2.5-1.9-4.3-4.8-4.6-8.2-.6-6.3,3.9-11.7,10.4-12.3,6.4-.6,11.8,3.9,12.4,10.2.3,2.9-.5,5.7-2.1,7.8,1.5.8,2.7,1.9,3.6,3.3.9,1.3.4,2.4-1,2.8h0Z'];
const LOGO_WORD = ['M28.5,153.5h5.9l25.4,56.1h-6.8l-6.5-14.7h-30.3l-6.6,14.7H3.1l25.4-56.1ZM44,189.2l-12.6-28.4-12.7,28.4h25.4Z', 'M66.2,151.5h6.1v58h-6.1v-58Z', 'M80.1,189.1v-.2c0-11.8,8.3-21.4,19.7-21.4s19.2,9.7,19.2,21.7,0,1.3,0,2h-32.6c.9,8.9,7.2,13.9,14.5,13.9s9.6-2.3,13-5.8l3.8,3.4c-4.1,4.6-9.1,7.7-16.9,7.7-11.3,0-20.5-8.7-20.5-21.4ZM112.7,186.7c-.6-7.5-4.9-14-13.1-14s-12.6,6-13.4,14h26.5Z', 'M125.7,168.4h6.1v10.7c3-6.8,9-11.8,16.8-11.5v6.6h-.5c-9,0-16.3,6.4-16.3,18.8v16.4h-6.1v-41.1Z', 'M156.1,198.6v-24.8h-5.7v-5.4h5.7v-12.4h6.1v12.4h13v5.4h-13v24c0,5,2.8,6.8,6.9,6.8s3.8-.4,6-1.4v5.2c-2.1,1.1-4.5,1.7-7.4,1.7-6.6,0-11.6-3.3-11.6-11.6Z', 'M178.3,189.1v-.2c0-11.8,8.3-21.4,19.7-21.4s19.2,9.7,19.2,21.7,0,1.3,0,2h-32.6c.9,8.9,7.2,13.9,14.5,13.9s9.6-2.3,13-5.8l3.8,3.4c-4.1,4.6-9.1,7.7-16.9,7.7-11.3,0-20.5-8.7-20.5-21.4ZM211,186.7c-.6-7.5-4.9-14-13.1-14s-12.6,6-13.4,14h26.5Z'];
function Logo95({ width = 160, mark = false, label = "95 Alerte", className }) {
  const vbH = mark ? 146 : 223;
  return (
    <svg className={cx("logo95", className)} viewBox={`0 0 217.2 ${vbH}`} width={width} height={width * vbH / 217.2} role="img" aria-label={label}>
      <g className="logo95-figure">{LOGO_YELLOW.map((d, i) => <path key={i} className="logo95-yellow" d={d} />)}</g>
      <g className="logo95-siren">{LOGO_RED.map((d, i) => <path key={i} className="logo95-red" d={d} />)}</g>
      {mark ? null : <g className="logo95-word">{LOGO_WORD.map((d, i) => <path key={i} d={d} />)}</g>}
    </svg>
  );
}

function IdentityBadge({ status }) {
  if (status === "verifiee") return <span className="badge badge-status st-done"><Icon name="seal-check-fill" />Identité vérifiée</span>;
  if (status === "en_cours") return <span className="badge badge-status st-soon"><Icon name="timer" />Vérification en cours</span>;
  return <span className="badge badge-status st-draft"><Icon name="identification-card" />Identité non vérifiée</span>;
}

/* Garde-fou réseau : les actions de connexion ont besoin du réseau (CDC §69) */
function useOnline() {
  const { state } = useStore();
  const { toast } = useActions();
  return (fn) => (...args) => {
    if (state.demo.offline) { toast("Connexion impossible hors connexion. Vérifiez votre réseau.", { tone: "error" }); return; }
    fn(...args);
  };
}

/* Démarrage, en trois temps : le halo jaune apparaît seul, puis l'animation officielle du logo
   (docs/brand/95-alerte-animation.gif, intégrée par le build dans window.SPLASH_GIF), puis le chargement.
   Le GIF a un fond blanc : il est fondu dans le halo (mode multiply) en clair ; en sombre ou avec les
   animations réduites, le logo SVG le remplace (variables --splash-gif / --splash-svg du Design System).
   À la sortie, la position du logo est mémorisée pour la transition vers l'accueil (« smart animate »). */
const motionReduced = () => document.documentElement.getAttribute("data-motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let splashLogoRect = null;
const GIF_LOGO_BOX = { x: 84 / 800, y: 65 / 800, w: 643 / 800, h: 632 / 800 }; // logo dans la dernière image du GIF

function SplashScreen() {
  const { dispatch } = useStore();
  const [phase, setPhase] = useState("bg");
  const logoRef = useRef(null);
  useEffect(() => {
    const [toLogo, toLoad, toExit] = motionReduced() ? [0, 400, 1600] : [700, 3700, 4900];
    const ids = [
      setTimeout(() => setPhase("logo"), toLogo),
      setTimeout(() => setPhase("load"), toLoad),
      setTimeout(() => {
        const box = logoRef.current;
        const gif = box && box.querySelector(".splash-gif");
        const svg = box && box.querySelector(".splash-svg");
        if (gif && gif.offsetParent) {
          const r = gif.getBoundingClientRect();
          splashLogoRect = { x: r.x + r.width * GIF_LOGO_BOX.x, y: r.y + r.height * GIF_LOGO_BOX.y, w: r.width * GIF_LOGO_BOX.w, h: r.height * GIF_LOGO_BOX.h };
        } else if (svg) {
          const r = svg.getBoundingClientRect();
          splashLogoRect = { x: r.x, y: r.y, w: r.width, h: r.height };
        }
        dispatch({ type: "SPLASH_DONE" });
      }, toExit),
    ];
    return () => ids.forEach(clearTimeout);
  }, [dispatch]);
  return (
    <div className={cx("splash", `is-${phase}`)} role="status" aria-label="Chargement de 95 Alerte">
      <div className="splash-halo" aria-hidden="true" />
      <div className="splash-center">
        <div className="splash-logo" ref={logoRef}>
          {phase !== "bg" ? (
            <Fragment>
              {window.SPLASH_GIF ? <img className="splash-gif" src={window.SPLASH_GIF} alt="" width="260" height="260" /> : null}
              <Logo95 width={209} className="splash-svg" />
            </Fragment>
          ) : null}
        </div>
      </div>
      <div className="splash-foot" aria-hidden={phase !== "load"}><Spinner /><span>Chargement des alertes du Val-d'Oise…</span></div>
    </div>
  );
}

/* Arrivée sur l'accueil après le démarrage : le logo part de sa position sur le démarrage et se pose
   à sa place (FLIP), le halo s'efface, le titre et les actions apparaissent ensuite. */
function useSplashHandoff(logoRef, screenRef, reveal = ".welcome-title, .welcome-center .auth-lead, .welcome-panel, .auth-skip") {
  useLayoutEffect(() => {
    const from = splashLogoRect;
    splashLogoRect = null;
    const el = logoRef.current;
    if (!from || motionReduced() || !document.body.animate) return;
    const ease = "cubic-bezier(.2,.8,.2,1)";
    // Écran sans logo (pages de présentation) : seule l'entrée échelonnée est jouée
    if (el) {
      const to = el.getBoundingClientRect();
      const dx = from.x + from.w / 2 - (to.x + to.width / 2);
      const dy = from.y + from.h / 2 - (to.y + to.height / 2);
      const k = from.w / to.width;
      el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: "none" }], { duration: 800, easing: ease });
    }
    const screen = screenRef.current;
    screen.querySelectorAll(reveal).forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 450, delay: 420 + i * 70, easing: ease, fill: "backwards" }));
    const halo = screen.querySelector(".splash-halo");
    if (halo) halo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease-out", fill: "forwards" });
  }, []);
}

function AuthHeader({ title, onBack, step }) {
  return (
    <Fragment>
      <header className="screen-header">
        {onBack ? <IconButton icon="caret-left" label="Retour" onClick={onBack} /> : <span />}
        <h1>{title}</h1>
        <span />
      </header>
      {step ? <div className="auth-stepper"><Stepper step={step} total={SIGNUP_STEPS.length} label={SIGNUP_STEPS[step - 1]} /></div> : null}
    </Fragment>
  );
}

/* Illustration ponctuelle : icône Phosphor Duotone dans une pastille (même bibliothèque que l'interface,
   pas de dessin maison). Fond jaune de marque doux, ou teinte de la famille pour les tons positif/erreur. */
function Spot({ icon, tone, size }) {
  return <span className={cx("spot", tone && `tone-${tone}`, size && `spot-${size}`)} aria-hidden="true"><Icon name={`${icon}-duotone`} /></span>;
}

/* La confidentialité dite là où naît l'inquiétude, sous le champ concerné (Nextdoor) */
function PrivacyNote({ children, icon = "lock-simple" }) {
  return <p className="privacy-note"><Icon name={icon} /><span>{children}</span></p>;
}

function Benefits({ items }) {
  return (
    <ul className="benefits">
      {items.map((b) => <li key={b.title}><span className="bi"><Icon name={b.icon} /></span><span>{b.title}{b.text ? <small>{b.text}</small> : null}</span></li>)}
    </ul>
  );
}

/* Accueil de connexion, d'après Dot (Mobbin) : fond en léger dégradé bleu, marque et titre au centre,
   actions empilées en bas, mentions en une ligne. « Explorer sans compte » reste accessible en haut. */
function LoginScreen() {
  const { dispatch } = useStore();
  const online = useOnline();
  const logoRef = useRef(null);
  const screenRef = useRef(null);
  const [intro] = useState(() => splashLogoRect !== null);
  const { state } = useStore();
  const commune = state.session.position.communeId ? COMMUNE_BY_ID[state.session.position.communeId] : null;
  useSplashHandoff(logoRef, screenRef);
  const go = (step) => dispatch({ type: "AUTH_GO", step });
  return (
    <div className="screen auth welcome" ref={screenRef}>
      {intro ? <div className="splash-halo" aria-hidden="true" /> : null}
      <button type="button" className="pill auth-skip" onClick={() => dispatch({ type: "GUEST" })}>Explorer sans compte<Icon name="caret-right" className="ph-sm" /></button>
      <div className="welcome-center">
        <span className="welcome-logo" ref={logoRef}><Logo95 width={120} /></span>
        <h1 className="welcome-title">Votre territoire,<br />votre vigilance.</h1>
        <p className="auth-lead">{commune ? `Les bonnes et les mauvaises nouvelles de ${commune.name} et du Val-d'Oise, en direct.` : "Les bonnes et les mauvaises nouvelles du Val-d'Oise, en direct."}</p>
      </div>
      <div className="welcome-panel">
        <Button block icon="identification-card" onClick={online(() => go("fc"))}>Continuer avec FranceConnect</Button>
        <Button block variant="secondary" onClick={() => go("signup-info")}>Créer un compte</Button>
        <Button block variant="ghost" onClick={() => go("signin")}>J'ai déjà un compte</Button>
        <p className="legal">FranceConnect vérifie votre identité ; vos alertes peuvent rester anonymes. En continuant, vous acceptez les conditions d'utilisation.</p>
      </div>
    </div>
  );
}

const FC_PROVIDERS = [
  { id: "fiscal", label: "Compte fiscal", icon: "buildings" },
  { id: "sante", label: "Compte assurance santé", icon: "hand-heart" },
  { id: "numerique", label: "Identité numérique", icon: "identification-card" },
  { id: "retraite", label: "Compte retraite", icon: "user-circle" },
];

function FranceConnectScreen() {
  const { state, dispatch } = useStore();
  const step = state.auth.step;
  useEffect(() => {
    if (step !== "fc-loading") return undefined;
    const id = setTimeout(() => {
      if (state.demo.networkError) dispatch({ type: "AUTH_GO", step: "fc-error" });
      else dispatch({ type: "LOGIN", method: "franceconnect", identity: "verifiee", message: "Connecté avec FranceConnect · identité vérifiée" });
    }, 1500);
    return () => clearTimeout(id);
  }, [step, state.demo.networkError, dispatch]);

  if (step === "fc-loading") {
    return (
      <div className="screen auth">
        <AuthHeader title="FranceConnect" />
        <div className="auth-center" role="status">
          <span className="status-hero tone-info"><Spinner /></span>
          <h2>Connexion sécurisée en cours…</h2>
          <p>Récupération de votre identité vérifiée.</p>
        </div>
      </div>
    );
  }
  if (step === "fc-error") {
    return (
      <div className="screen auth">
        <AuthHeader title="FranceConnect" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })} />
        <div className="auth-center" role="alert">
          <span className="status-hero tone-error"><Icon name="warning" /></span>
          <h2>La connexion avec FranceConnect a échoué.</h2>
          <p>Le service n'a pas répondu. Réessayez dans un instant ou créez un compte 95 Alerte.</p>
        </div>
        <div className="screen-footer stack-footer">
          <Button block onClick={() => dispatch({ type: "AUTH_GO", step: "fc" })}>Réessayer</Button>
          <Button block variant="ghost" onClick={() => dispatch({ type: "AUTH_GO", step: "signup-info" })}>Créer un compte</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen auth">
      <AuthHeader title="FranceConnect" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })} />
      <div className="screen-pad">
        <Banner tone="info" icon="info">Écran simulé pour le prototype : aucune donnée réelle n'est échangée.</Banner>
        <div className="auth-intro">
          <h2 className="question">Choisissez un compte pour vous connecter</h2>
          <p className="auth-lead">Vous reviendrez automatiquement sur 95 Alerte, avec votre identité vérifiée.</p>
        </div>
        <div className="list">
          {FC_PROVIDERS.map((p) => <ListItem key={p.id} icon={p.icon} label={p.label} onClick={() => dispatch({ type: "AUTH_GO", step: "fc-loading" })} />)}
        </div>
      </div>
    </div>
  );
}

/* Gabarit commun des étapes de connexion et d'inscription (benchmark P1 : une question par écran,
   un seul CTA principal, toujours au même endroit, dans le pied d'écran) */
function AuthStep({ title, step, onBack, question, lead, onSubmit, footer, children }) {
  return (
    <form className="screen auth" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
      <AuthHeader title={title} step={step} onBack={onBack} />
      <div className="screen-pad">
        <div className="auth-intro">
          <h2 className="question">{question}</h2>
          {lead ? <p className="auth-lead">{lead}</p> : null}
        </div>
        {children}
      </div>
      <div className="screen-footer stack-footer">{footer}</div>
    </form>
  );
}

function SignInScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [email, setEmail] = useState(state.auth.form.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const submit = online(() => {
    if (!email.includes("@") || password.length < 4) { setError("Vérifiez votre e-mail et votre mot de passe (4 caractères minimum)."); return; }
    dispatch({ type: "LOGIN", method: "compte", identity: "verifiee", message: "Vous êtes connecté." });
  });
  return (
    <AuthStep title="Se connecter" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })}
      question="Content de vous revoir" lead="Connectez-vous avec l'adresse e-mail de votre compte 95 Alerte." onSubmit={submit}
      footer={<Button block type="submit">Se connecter</Button>}>
      <Field id="signin-email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
      <Field id="signin-password" label="Mot de passe" type="password" autoComplete="current-password" value={password} error={error} onChange={(e) => { setPassword(e.target.value); setError(null); }} />
      <Button variant="ghost" className="btn-inline" onClick={() => toast("Un lien de réinitialisation vous a été envoyé par e-mail.")}>Mot de passe oublié ?</Button>
    </AuthStep>
  );
}

/* Étape 1 : le nom (un seul sujet par écran) */
function SignupInfoScreen() {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState(state.auth.form);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: null }); };
  const submit = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Indiquez votre prénom.";
    if (!form.lastName.trim()) err.lastName = "Indiquez votre nom.";
    setErrors(err);
    if (Object.keys(err).length) return;
    dispatch({ type: "AUTH_SET", patch: { form, step: "signup-phone" } });
  };
  const initial = (form.lastName.trim() || " ")[0];
  return (
    <AuthStep title="Créer un compte" step={1} onBack={() => dispatch({ type: "AUTH_GO", step: "login" })}
      question="Bienvenue ! Comment vous appelez-vous ?" lead="4 étapes, environ 2 minutes."
      onSubmit={submit} footer={<Button block type="submit">Continuer</Button>}>
      <Field id="su-first" label="Prénom" autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={set("firstName")} />
      <Field id="su-last" label="Nom" autoComplete="family-name" value={form.lastName} error={errors.lastName} onChange={set("lastName")} />
      {form.firstName.trim() ? <div className="preview-author"><Icon name="eye" />Vous apparaîtrez comme : <b>{form.firstName.trim()} {initial}.</b></div> : null}
      <PrivacyNote>Votre nom complet reste privé. Sur vos alertes identifiées, seuls votre prénom et l'initiale de votre nom apparaissent. Vous pourrez aussi publier anonymement.</PrivacyNote>
    </AuthStep>
  );
}

function OtpInput({ value, onChange, error, id }) {
  const [focused, setFocused] = useState(false);
  const digits = value.padEnd(6, " ").split("");
  return (
    <div className={cx("otp", error && "is-error")}>
      <input id={id} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={value} aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined} aria-label="Code de vérification à 6 chiffres"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      {digits.map((d, i) => <span key={i} aria-hidden="true" className={cx("d", focused && i === Math.min(value.length, 5) && "is-active")}>{d.trim()}</span>)}
    </div>
  );
}

/* Étape 2 : le numéro, puis le code reçu par SMS */
function SignupPhoneScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [phase, setPhase] = useState("number");
  const [phone, setPhone] = useState(state.auth.form.phone);
  const [phoneError, setPhoneError] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const back = () => dispatch({ type: "AUTH_GO", step: "signup-info" });
  if (phase === "number") {
    const send = online(() => {
      if (phone.replace(/\D/g, "").length !== 10) { setPhoneError("Saisissez un numéro à 10 chiffres."); return; }
      dispatch({ type: "AUTH_SET", patch: { form: { ...state.auth.form, phone } } });
      setPhase("code");
    });
    return (
      <AuthStep title="Créer un compte" step={2} onBack={back}
        question="Votre numéro de mobile" lead="Nous vous envoyons un code par SMS."
        onSubmit={send} footer={<Button block type="submit">Recevoir le code</Button>}>
        <Field id="su-phone" label="Téléphone mobile" type="tel" autoComplete="tel" inputMode="tel" value={phone} error={phoneError} onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }} />
        <PrivacyNote>Votre numéro n'est jamais affiché. Il sert uniquement à sécuriser votre compte.</PrivacyNote>
      </AuthStep>
    );
  }
  const submit = online(() => {
    if (code === "000000") { setError("Code incorrect. Vérifiez le SMS ou demandez un nouveau code."); return; }
    dispatch({ type: "AUTH_GO", step: "signup-email" });
  });
  return (
    <AuthStep title="Créer un compte" step={2} onBack={() => { setPhase("number"); setCode(""); setError(null); }}
      question="Saisissez le code reçu" lead={`Envoyé par SMS au ${maskPhone(phone)}.`}
      onSubmit={submit} footer={<Button block type="submit" disabled={code.length !== 6}>Vérifier</Button>}>
      <OtpInput id="otp" value={code} onChange={(v) => { setCode(v); setError(null); }} error={error} />
      {error ? <span className="err" id="otp-err" role="alert"><Icon name="warning-fill" className="ph-sm" />{error}</span> : null}
      <Button variant="ghost" className="btn-inline" icon="arrows-clockwise" onClick={() => { setCode(""); setError(null); toast("Un nouveau code vous a été envoyé."); }}>Renvoyer le code</Button>
    </AuthStep>
  );
}

/* Étape 3 : l'adresse e-mail, puis la confirmation par lien */
function SignupEmailScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [phase, setPhase] = useState("address");
  const [email, setEmail] = useState(state.auth.form.email);
  const [error, setError] = useState(null);
  if (phase === "address") {
    const send = online(() => {
      if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Saisissez une adresse e-mail valide."); return; }
      if (email.trim().toLowerCase() === "deja@exemple.fr") { setError("Cet e-mail est déjà utilisé. Connectez-vous ou utilisez une autre adresse."); return; }
      dispatch({ type: "AUTH_SET", patch: { form: { ...state.auth.form, email } } });
      setPhase("sent");
    });
    return (
      <AuthStep title="Créer un compte" step={3} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-phone" })}
        question="Votre adresse e-mail" lead="Pour vous informer du suivi de vos signalements."
        onSubmit={send} footer={<Button block type="submit">Continuer</Button>}>
        <Field id="su-email" label="E-mail" type="email" autoComplete="email" value={email} error={error} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
        <PrivacyNote>Votre adresse n'est jamais affichée ni partagée.</PrivacyNote>
      </AuthStep>
    );
  }
  return (
    <div className="screen auth">
      <AuthHeader title="Créer un compte" step={3} onBack={() => setPhase("address")} />
      <div className="auth-center">
        <Spot icon="envelope-open" />
        <h2>Confirmez votre adresse e-mail</h2>
        <p>Nous avons envoyé un lien à <b>{maskEmail(email)}</b>. Ouvrez-le pour confirmer votre adresse.</p>
      </div>
      <div className="screen-footer stack-footer">
        <Button block onClick={online(() => { toast("Adresse e-mail confirmée."); dispatch({ type: "AUTH_GO", step: "signup-id" }); })}>J'ai confirmé mon adresse</Button>
        <Button block variant="ghost" onClick={() => toast("Un nouvel e-mail vous a été envoyé.")}>Renvoyer l'e-mail</Button>
      </div>
    </div>
  );
}

/* Vérification d'identité : choix du document puis statut (utilisé à l'inscription et depuis le profil) */
function IdentityDocStep({ onSent, onLater, step, onBack }) {
  const { state, dispatch } = useStore();
  const online = useOnline();
  const [doc, setDoc] = useState(state.auth.docType);
  const [sending, setSending] = useState(false);
  const send = online(() => {
    setSending(true);
    setTimeout(() => { setSending(false); dispatch({ type: "AUTH_SET", patch: { docType: doc } }); onSent(); }, 900);
  });
  return (
    <div className="screen auth">
      <AuthHeader title={step ? "Créer un compte" : "Vérifier mon identité"} step={step} onBack={onBack} />
      <div className="screen-pad">
        <div className="auth-intro">
          <h2 className="question">Vérifiez votre identité</h2>
          <p className="auth-lead">Une seule fois, environ 1 minute.</p>
        </div>
        <Benefits items={[
          { icon: "seal-check", title: "Badge « Identité vérifiée »", text: "Affiché sur votre profil." },
          { icon: "megaphone", title: "Signalements traités en priorité", text: "Les services savent qu'ils viennent d'une personne réelle." },
        ]} />
        <section className="list-section">
          <h2 className="section-label">Votre document</h2>
          {ID_DOCS.map((d) => <RadioCard key={d.id} name="id-doc" value={d.id} checked={doc === d.id} onChange={setDoc} icon="identification-card" title={d.label} description={d.hint} />)}
        </section>
        <PrivacyNote icon="eye-slash">Votre document sert uniquement à la vérification. Il n'est jamais affiché publiquement.</PrivacyNote>
      </div>
      <div className="screen-footer stack-footer">
        <Button block icon="camera" loading={sending} onClick={send}>{sending ? "Envoi du document…" : "Prendre le document en photo"}</Button>
        {onLater ? <Button block variant="ghost" onClick={onLater}>Plus tard</Button> : null}
      </div>
    </div>
  );
}

const ID_RESULT_VIEW = {
  en_cours: { tone: "vigilance", icon: "timer", title: "Vérification en cours", text: "Généralement moins de 24 h. Vous pouvez utiliser 95 Alerte en attendant : nous vous préviendrons du résultat.", step: 1 },
  reussie: { tone: "positive", icon: "seal-check-fill", title: "Identité vérifiée", text: "Merci. Votre compte est vérifié : vos signalements seront traités en priorité par les services.", step: 3 },
  echouee: { tone: "error", icon: "warning", title: "La vérification a échoué", text: "Le service n'a pas pu lire votre document. Faites une nouvelle tentative ou demandez une vérification manuelle.", step: 1, failed: true },
  refusee: { tone: "error", icon: "x", title: "Document refusé", text: "La photo est floue ou le document a expiré. Reprenez une photo nette d'un document en cours de validité.", step: 1, failed: true },
  manuelle: { tone: "info", icon: "user-circle", title: "Vérification manuelle", text: "Un agent examine votre dossier. Délai indicatif : 48 h. Vous serez notifié du résultat.", step: 1 },
};

function IdentityStatusView({ onContinue, onRetry }) {
  const { state, dispatch } = useStore();
  const result = state.auth.idResult;
  const v = ID_RESULT_VIEW[result];
  const doc = ID_DOCS.find((d) => d.id === state.auth.docType);
  const steps = [
    { id: "sent", label: "Document envoyé", detail: doc ? doc.label : null },
    { id: "check", label: v.failed ? "Vérification interrompue" : result === "reussie" ? "Vérification terminée" : "Vérification", detail: result === "en_cours" ? "Délai indicatif : moins de 24 h" : result === "manuelle" ? "Délai indicatif : 48 h" : null },
    { id: "done", label: "Identité vérifiée", final: true },
  ];
  return (
    <Fragment>
      <div className="screen-pad">
        <div className="auth-center compact" role="status">
          <span className={cx("status-hero", `tone-${v.tone}`)}><Icon name={v.icon} /></span>
          <h2>{v.title}</h2>
          <p>{v.text}</p>
        </div>
        <div className="card"><Timeline steps={steps} currentIndex={v.step} /></div>
      </div>
      <div className="screen-footer stack-footer">
        {v.failed ? (
          <Fragment>
            <Button block icon="camera" onClick={onRetry}>{result === "refusee" ? "Reprendre une photo" : "Nouvelle tentative"}</Button>
            {result === "echouee" ? <Button block variant="ghost" onClick={() => dispatch({ type: "AUTH_SET", patch: { idResult: "manuelle" } })}>Demander une vérification manuelle</Button> : <Button block variant="ghost" onClick={onContinue}>Continuer sans vérification</Button>}
          </Fragment>
        ) : <Button block onClick={onContinue}>Continuer</Button>}
      </div>
    </Fragment>
  );
}

function SignupIdentityScreen() {
  const { dispatch } = useStore();
  return (
    <IdentityDocStep step={4} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-email" })}
      onSent={() => dispatch({ type: "AUTH_GO", step: "id-status" })}
      onLater={() => dispatch({ type: "AUTH_SET", patch: { idResult: "aucune", step: "profile" } })} />
  );
}

function IdentityStatusScreen() {
  const { dispatch } = useStore();
  return (
    <div className="screen auth">
      <AuthHeader title="Créer un compte" step={4} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-id" })} />
      <IdentityStatusView onContinue={() => dispatch({ type: "AUTH_GO", step: "profile" })} onRetry={() => dispatch({ type: "AUTH_GO", step: "signup-id" })} />
    </div>
  );
}

function ProfileSetupScreen() {
  const { state, dispatch } = useStore();
  const f = state.auth.form;
  const [display, setDisplay] = useState(state.auth.display);
  const name = display === "first" ? f.firstName : `${f.firstName} ${(f.lastName || " ")[0]}.`;
  const finish = () => dispatch({ type: "AUTH_SET", patch: { display, step: "done" } });
  return (
    <div className="screen auth">
      <AuthHeader title="Votre profil" onBack={() => dispatch({ type: "AUTH_GO", step: state.auth.idResult === "aucune" ? "signup-id" : "id-status" })} />
      <div className="screen-pad">
        <div className="identity">
          <span className="avatar" aria-hidden="true">{f.firstName[0]}{f.lastName[0]}</span>
          <div><b>{f.firstName} {f.lastName}</b><IdentityBadge status={IDENTITY_FROM_RESULT[state.auth.idResult] || "non_verifiee"} /></div>
        </div>
        <section className="list-section">
          <h2 className="section-label">Nom affiché sur vos alertes identifiées</h2>
          <RadioCard name="display" value="initial" checked={display === "initial"} onChange={setDisplay} icon="user-circle" title={`${f.firstName} ${(f.lastName || " ")[0]}.`} description="Prénom et initiale du nom (recommandé)" />
          <RadioCard name="display" value="first" checked={display === "first"} onChange={setDisplay} icon="user-circle" title={f.firstName} description="Prénom seulement" />
        </section>
        <div className="preview-author"><Icon name="eye" />Vous apparaîtrez comme : <b>{name}</b></div>
        <PrivacyNote icon="detective">Pour chaque alerte, vous pourrez aussi choisir de publier anonymement. Votre e-mail et votre téléphone ne sont jamais affichés.</PrivacyNote>
      </div>
      <div className="screen-footer"><Button block onClick={finish}>Terminer</Button></div>
    </div>
  );
}

/* Récapitulatif final (Greenlight « Success! », Nextdoor) : ce qui est prêt, ce qui reste, le contenu local */
function SignupDoneScreen() {
  const { state, dispatch } = useStore();
  const alerts = useVisibleAlerts();
  const f = state.auth.form;
  const display = state.auth.display;
  const identity = IDENTITY_FROM_RESULT[state.auth.idResult] || "non_verifiee";
  const name = display === "first" ? f.firstName : `${f.firstName} ${(f.lastName || " ")[0]}.`;
  const near = alerts.filter((a) => haversineKm(state.session.position, a) <= zoneRadius(state)).length;
  const idLine = {
    verifiee: { icon: "check-circle-fill", title: "Identité vérifiée", text: "Vos signalements sont traités en priorité." },
    en_cours: { icon: "timer", title: "Vérification en cours", text: "Nous vous préviendrons du résultat.", pending: true },
    non_verifiee: { icon: "identification-card", title: "Identité non vérifiée", text: "Vous pourrez la vérifier depuis votre profil.", pending: true },
  }[identity];
  const go = () => dispatch({ type: "LOGIN", method: "inscription", identity, user: { id: ME_ID, firstName: f.firstName, lastName: f.lastName, display } });
  return (
    <div className="screen auth">
      <div className="screen-pad auth-done">
        <div className="auth-center compact" role="status">
          <Spot icon="hand-waving" />
          <h2>Bienvenue, {f.firstName} !</h2>
          <p>Votre compte 95 Alerte est prêt.</p>
        </div>
        <ul className="recap">
          <li><Icon name="check-circle-fill" /><span><b>Compte créé</b><small>Vos alertes identifiées afficheront « {name} ».</small></span></li>
          <li className={cx(idLine.pending && "pending")}><Icon name={idLine.icon} /><span><b>{idLine.title}</b><small>{idLine.text}</small></span></li>
          <li className="info"><Icon name="map-pin" /><span><b>{near} alerte{near > 1 ? "s" : ""} à moins de {zoneRadius(state)} km</b><small>Positives et négatives, mises à jour en direct.</small></span></li>
        </ul>
      </div>
      <div className="screen-footer"><Button block icon="map-trifold" onClick={go}>Voir la carte</Button></div>
    </div>
  );
}

const AUTH_SCREENS = {
  login: LoginScreen, fc: FranceConnectScreen, "fc-loading": FranceConnectScreen, "fc-error": FranceConnectScreen, signin: SignInScreen,
  "signup-info": SignupInfoScreen, "signup-phone": SignupPhoneScreen, "signup-email": SignupEmailScreen, "signup-id": SignupIdentityScreen,
  "id-status": IdentityStatusScreen, profile: ProfileSetupScreen, done: SignupDoneScreen,
};

function AuthFlow() {
  const { state } = useStore();
  const C = AUTH_SCREENS[state.auth.step] || LoginScreen;
  return <C />;
}

/* Vérification depuis le profil (compte non vérifié) */
function VerifyIdentityScreen() {
  const { dispatch } = useStore();
  const { pop, toast } = useActions();
  const [sent, setSent] = useState(false);
  if (!sent) return <IdentityDocStep onBack={pop} onSent={() => setSent(true)} />;
  return (
    <div className="screen auth">
      <AuthHeader title="Vérifier mon identité" onBack={pop} />
      <IdentityStatusView onRetry={() => setSent(false)} onContinue={() => {
        dispatch({ type: "SET_IDENTITY", identity: "result" });
        pop();
        toast("Statut d'identité mis à jour.");
      }} />
    </div>
  );
}

/* Écrans en mode invité */
function GuestGate({ icon, title, text }) {
  const { dispatch } = useStore();
  return (
    <EmptyState icon={icon} title={title} action={<Button icon="sign-in" onClick={() => dispatch({ type: "LOGOUT" })}>Se connecter</Button>}>{text}</EmptyState>
  );
}

/* =====================================================================
   PHASE 2 — Onboarding, territoire, localisation (UI-002 → UI-007 ; CDC §6, §7, §16, §77)
   Parcours (benchmark onboarding) : présentation en 4 écrans → amorce de localisation →
   commune détectée ou choisie → connexion. La localisation reste facultative : refus et
   « Plus tard » mènent toujours à une suite (choix manuel de la commune).
   ===================================================================== */
/* Refonte v2 (docs/benchmark/onboarding-refonte.html) : 3 pages de présentation (photo + notification réelle, à la
   Citizen ; arc à la Headspace ; mot-clé surligné à la Klima), amorce allégée (Tinder), demande système coachée et
   zone suivie (Life360), préparation de la carte (Evernote), reprise illustrée après refus (Polarsteps, Viator).
   Le 4e titre du CDC, « Votre territoire, votre vigilance. », reste le titre de l'écran de connexion. */
const ONB_SLIDES = [
  {
    title: ["Que se passe‑t‑il ", "autour de vous", " ?"],
    text: "Incidents, travaux, bonnes nouvelles : le Val-d'Oise en direct, sur une carte.",
    alt: "Une main tient un téléphone affichant la carte des alertes, dans une rue ancienne de Pontoise au coucher du soleil.",
  },
  {
    title: ["Un problème ? ", "Signalez-le."],
    text: "En quelques gestes, votre signalement part au service compétent.",
    alt: "Une main photographie avec son téléphone un nid-de-poule et une branche tombée sur une rue résidentielle.",
  },
  {
    title: ["Une bonne nouvelle ? ", "Partagez-la aussi."],
    text: "Fête de quartier, entraide, nouveau commerce : le positif a toute sa place.",
    tone: "positive",
    alt: "Une main tient un téléphone pendant une fête de quartier sur une place, guirlandes et stands en arrière-plan.",
  },
];
// Photos générées (Magnific, d'après le flow Citizen) : embarquées par le build si présentes, sinon fragment de carte
const ONB_PHOTOS = (typeof window !== "undefined" && window.ONB_PHOTOS) || {};
const ONB_STEPS = 2; // Étape 1 : position · Étape 2 : zone suivie
const ZONE_RADII = [1, 5, 10];
const PX_PER_KM = MAP_VIEW.ky / 111; // ≈ 43,8 px par km sur la carte illustrée
// Communes voisines hors Val-d'Oise : état « hors territoire » (PRD §10.3)
const OUT_OF_ZONE = ["Paris", "Saint-Denis", "Beauvais", "Creil", "Chantilly", "Mantes-la-Jolie", "Rouen", "Versailles", "Senlis", "Gisors"];
const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const zoneRadius = (state) => state.session.position.radiusKm || NEAR_KM;

function PageDots({ count, index }) {
  return (
    <span className="dots" role="img" aria-label={`Écran ${index + 1} sur ${count}`}>
      {Array.from({ length: count }, (_, i) => <i key={i} className={cx(i === index && "on")} />)}
    </span>
  );
}

function StepProgress({ step, total }) {
  return (
    <div className="step-progress">
      <span className="track" aria-hidden="true"><i style={{ width: `${(step / total) * 100}%` }} /></span>
      <small>Étape {step} sur {total}</small>
    </div>
  );
}

function OnboardingTop({ onSkip, skipLabel = "Passer", logoRef, onMedia }) {
  return (
    <div className="onb-top">
      {onMedia ? null : <span ref={logoRef} className="onb-logo"><Logo95 width={44} label="95 Alerte" /></span>}
      {onSkip ? <Button variant={onMedia ? "tertiary" : "ghost"} className={cx(onMedia ? "onb-skip on-media" : "btn-inline onb-skip")} onClick={onSkip}>{skipLabel}</Button> : null}
    </div>
  );
}

/* Zone suivie : carte illustrée mise à l'échelle autour de la position, cercle du rayon, alertes de la zone */
function ZoneMap({ center, radiusKm, height, pins = true, label = true, stagger = false }) {
  const alerts = useVisibleAlerts();
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 390, h: height || 844 });
  useLayoutEffect(() => { const el = ref.current; if (el) setBox({ w: el.clientWidth, h: el.clientHeight }); }, []);
  // Même carte que l'accueil (phase 3) : l'échelle cadre exactement le rayon choisi
  const ringPx = Math.min(box.w, box.h) * (radiusKm > 5 ? 0.44 : 0.4);
  const s = ringPx / radiusKm;
  const c = projectKm(center);
  const cx0 = box.w / 2;
  const cy0 = box.h * (height ? 0.5 : 0.36);
  const toScreen = (x, y) => ({ x: cx0 + (x - c.x) * s, y: cy0 + (y - c.y) * s });
  const level = levelOf(s);
  const inZone = alerts.filter((a) => haversineKm(center, a) <= radiusKm);
  return (
    <div className="zone-map" ref={ref} aria-hidden="true">
      <div className={cx("map95", "map-live", "is-static", `lv-${level}`)}>
        {MAP95 ? (
          <svg className="map-geo" width={box.w} height={box.h}>
            <g className="zm-geo" style={{ transform: `translate(${cx0 - c.x * s}px, ${cy0 - c.y * s}px) scale(${s})` }}>{GEO_LAYERS}</g>
          </svg>
        ) : MAP_ART}
        {mapLabels(level, toScreen, box.w, box.h, 0).map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }}>{l.text}</span>)}
      </div>
      <span className="zone-ring" style={{ left: cx0, top: cy0, width: ringPx * 2, height: ringPx * 2 }}>{label ? <span className="zr-label">{radiusKm} km</span> : null}</span>
      {pins ? dedupeEvents(inZone).slice(0, 8).map((a, i) => {
        const k = projectKm(a);
        const p = toScreen(k.x, k.y);
        const cat = CATEGORY_BY_ID[a.categoryId];
        if (p.x < 12 || p.x > box.w - 12 || p.y < 12 || p.y > box.h - 12) return null;
        return <span key={a.id} className="map-pin" style={{ left: p.x, top: p.y, animationDelay: stagger ? `${250 + i * 90}ms` : undefined }}><Marker family={cat.family} icon={cat.icon} /></span>;
      }) : null}
      <span className="zone-me-pulse" style={{ left: cx0, top: cy0 }} />
      <span className="me" style={{ left: cx0, top: cy0 }} />
    </div>
  );
}

/* UI-002 → UI-005 : 3 pages, « Passer » toujours visible, CTA immobile, balayage et clavier */
function OnboardingSlides() {
  const { state, dispatch } = useStore();
  const i = state.onb.slide;
  const s = ONB_SLIDES[i];
  const last = i === ONB_SLIDES.length - 1;
  const logoRef = useRef(null);
  const screenRef = useRef(null);
  const startX = useRef(null);
  useSplashHandoff(logoRef, screenRef, ".onb-skip, .onb-title, .onb-text, .onb .screen-footer");
  const go = (n) => { if (n >= 0 && n < ONB_SLIDES.length && n !== i) dispatch({ type: "ONB_GO", step: "slides", slide: n }); };
  const next = () => (last ? dispatch({ type: "ONB_GO", step: "location" }) : go(i + 1));
  const onKey = (e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); };
  const photo = ONB_PHOTOS[i + 1];
  return (
    <div className="screen auth onb onb-hero" ref={screenRef} onKeyDown={onKey}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => { if (startX.current === null) return; const dx = e.clientX - startX.current; startX.current = null; if (dx < -50) go(i + 1); if (dx > 50) go(i - 1); }}>
      <div className={cx("hero-media", photo && "has-photo")}>
        {photo ? <img className="hero-photo" src={photo} alt={s.alt} /> : <Fragment><div className="map95">{MAP_ART}</div><div className="hero-halo" /></Fragment>}
      </div>
      <OnboardingTop logoRef={logoRef} onMedia onSkip={() => dispatch({ type: "ONB_GO", step: "location" })} />
      <section className="hero-sheet" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${ONB_SLIDES.length}`}>
        <h1 className="onb-title">{s.title[0]}<mark className="hl">{s.title[1]}</mark>{s.title[2] || ""}</h1>
        <p className="onb-text">{s.text}</p>
      </section>
      <div className="screen-footer stack-footer">
        <PageDots count={ONB_SLIDES.length} index={i} />
        <Button block onClick={next}>{last ? "Commencer" : "Suivant"}</Button>
      </div>
    </div>
  );
}

/* Demande système simulée, coachée (Life360) : le bon choix est désigné, jamais « Toujours » */
function SystemLocationPrompt({ onAnswer }) {
  return (
    <div className="modal-scrim coach" role="presentation">
      <p className="coach-title" aria-hidden="true">Choisissez <mark className="hl">«&nbsp;Pendant l'utilisation&nbsp;»</mark></p>
      <div className="modal sys-prompt" role="alertdialog" aria-modal="true" aria-labelledby="sys-title" aria-describedby="sys-body">
        <Icon name="navigation-arrow-fill" className="sys-icon" />
        <h2 id="sys-title">Autoriser « 95 Alerte » à utiliser votre position&nbsp;?</h2>
        <p id="sys-body">Votre position sert à afficher les alertes proches de vous.</p>
        <div className="sys-actions">
          <button type="button" className="is-recommended" onClick={() => onAnswer("granted")}>Autoriser pendant l'utilisation</button>
          <button type="button" onClick={() => onAnswer("granted")}>Autoriser une fois</button>
          <button type="button" onClick={() => onAnswer("denied")}>Ne pas autoriser</button>
        </div>
        <p className="sys-note">Simulation de la demande du téléphone</p>
      </div>
    </div>
  );
}

/* UI-007 : amorce allégée à trois éléments (Tinder) ; le détail passe dans une feuille */
function LocationPrimer() {
  const { state, dispatch } = useStore();
  const { openSheet } = useActions();
  const [asking, setAsking] = useState(false);
  const [locating, setLocating] = useState(false);
  const answer = (perm) => {
    setAsking(false);
    const result = state.demo.permissionDenied ? "denied" : perm;
    if (result === "denied") { dispatch({ type: "LOCATION_RESULT", permission: "denied" }); dispatch({ type: "ONB_GO", step: "denied" }); return; }
    dispatch({ type: "LOCATION_RESULT", permission: "granted" });
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      if (state.demo.gpsUnavailable) dispatch({ type: "ONB_GO", step: "unavailable" });
      else dispatch({ type: "ONB_GO", step: "detected" });
    }, 1200);
  };
  return (
    <div className="screen auth onb">
      <OnboardingTop skipLabel="Plus tard" onSkip={() => dispatch({ type: "ONB_FINISH", permission: "later" })} />
      <div className="screen-pad">
        <StepProgress step={1} total={ONB_STEPS} />
        <div className="zone-scene"><ZoneMap center={DEFAULT_POSITION} radiusKm={NEAR_KM} height={240} pins={false} label={false} /></div>
        <div className="auth-intro">
          <h1 className="onb-title" style={{ textAlign: "left" }}>Voir les alertes <mark className="hl">près de chez vous</mark>&nbsp;?</h1>
          <p className="onb-text" style={{ textAlign: "left", maxWidth: "none" }}>Votre position reste approximative. Elle n'est jamais publiée.</p>
        </div>
      </div>
      <div className="screen-footer stack-footer">
        <Button block icon="navigation-arrow" loading={locating} onClick={() => setAsking(true)}>{locating ? "Recherche de votre position…" : "Autoriser la localisation"}</Button>
        <Button block variant="secondary" onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Choisir ma commune</Button>
        <Button block variant="ghost" onClick={() => openSheet("location-why")}>Comment ma position est utilisée&nbsp;?</Button>
      </div>
      {asking ? <SystemLocationPrompt onAnswer={answer} /> : null}
    </div>
  );
}

function LocationWhySheet() {
  return (
    <Fragment>
      <Benefits items={[
        { icon: "map-pin", title: "Les alertes de votre zone", text: "Positives et négatives, en direct." },
        { icon: "path", title: "La distance sur chaque alerte", text: "Pour savoir si vous êtes concerné." },
        { icon: "crosshair", title: "Le lieu déjà rempli quand vous signalez", text: "Vous pourrez toujours le modifier." },
      ]} />
      <ul className="why-list">
        <li>Sur une alerte publiée, la précision dépend de la catégorie : rue, quartier ou zone.</li>
        <li>Vous pouvez la désactiver à tout moment dans les réglages du téléphone.</li>
      </ul>
      <PrivacyNote>Votre position reste approximative par défaut. Elle n'est jamais affichée publiquement.</PrivacyNote>
    </Fragment>
  );
}

/* Zone suivie (Life360) : commune détectée, cercle du rayon sur la carte, rayon réglable */
function CommuneDetected() {
  const { state, dispatch } = useStore();
  const alerts = useVisibleAlerts();
  const commune = COMMUNE_BY_ID.pontoise;
  const gps = { lat: 49.05388, lng: 2.09924 };
  const r = zoneRadius(state);
  const near = alerts.filter((a) => haversineKm(gps, a) <= r).length;
  return (
    <div className="screen auth onb detected onb-zone">
      <ZoneMap center={gps} radiusKm={r} />
      <div className="detected-panel" role="status">
        <StepProgress step={2} total={ONB_STEPS} />
        <span className="badge badge-status st-done"><Icon name="crosshair" />Position approximative</span>
        <h1 className="onb-title">Vous êtes à {commune.name}</h1>
        <p className="onb-text">{near} alerte{near > 1 ? "s" : ""} dans votre zone de {r} km.</p>
        <SegmentedControl block label="Rayon de votre zone" value={r} onChange={(v) => dispatch({ type: "SET_RADIUS", km: v })} options={ZONE_RADII.map((k) => ({ value: k, label: `${k} km` }))} />
        <Button block onClick={() => dispatch({ type: "ONB_GO", step: "prep", pending: { communeId: commune.id, source: "gps", coords: gps } })}>Continuer</Button>
        <Button block variant="ghost" onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Ce n'est pas ma commune</Button>
      </div>
    </div>
  );
}

/* Préparation de la carte (Evernote) : le temps réel du chargement, jamais plus de 1,2 s */
function OnboardingPrep() {
  const { state, dispatch } = useStore();
  const p = state.onb.pending || {};
  const c = p.communeId ? COMMUNE_BY_ID[p.communeId] : null;
  const center = p.coords || (c ? { lat: c.lat, lng: c.lng } : DEFAULT_POSITION);
  useEffect(() => {
    const finish = () => dispatch({ type: "ONB_FINISH", ...p });
    if (motionReduced()) { finish(); return undefined; }
    const t = setTimeout(finish, 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="screen auth onb onb-prep" role="status" aria-live="polite">
      <ZoneMap center={center} radiusKm={zoneRadius(state)} label={false} stagger />
      <div className="prep-overlay">
        <h1 className="onb-title">Nous préparons votre carte{c ? <Fragment> de <mark className="hl">{c.name}</mark></Fragment> : null}…</h1>
        <p className="spinner-row"><span className="spinner" aria-hidden="true" />Chargement des alertes de votre zone</p>
      </div>
    </div>
  );
}

/* UI-006 : recherche + liste des communes du Val-d'Oise ; aucun résultat ; hors territoire */
function CommunePicker({ onPick, onBack, title = "Votre commune" }) {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const nq = normalize(q);
  const list = [...COMMUNES].sort((a, b) => a.name.localeCompare(b.name, "fr")).filter((c) => !nq || normalize(c.name).includes(nq));
  const outside = nq && list.length === 0 ? OUT_OF_ZONE.find((n) => normalize(n).includes(nq)) : null;
  const gpsOk = state.session.position.permission === "granted" && !state.demo.permissionDenied;
  return (
    <div className="screen auth">
      <AuthHeader title={title} onBack={onBack} />
      <div className="screen-pad">
        <div className="field">
          <label htmlFor="commune-q" className="sr-only">Rechercher une commune</label>
          <div className="search-field"><Icon name="magnifying-glass" /><input id="commune-q" className="input" type="search" placeholder="Rechercher une commune" aria-label="Rechercher une commune du Val-d'Oise" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <p className="sr-only" aria-live="polite">{outside ? "Hors territoire" : `${list.length} commune${list.length > 1 ? "s" : ""}`}</p>
        {outside ? (
          <EmptyState icon="map-trifold" title="95 Alerte n'est pas encore disponible dans cette zone.">{outside} est hors du Val-d'Oise. Choisissez une commune du département.</EmptyState>
        ) : list.length === 0 ? (
          <EmptyState icon="magnifying-glass" title="Aucune commune ne correspond.">Vérifiez l'orthographe ou essayez un autre nom.</EmptyState>
        ) : (
          <div className="list">
            {gpsOk && !nq ? <ListItem icon="crosshair" label="Autour de moi · Pontoise" onClick={() => onPick(COMMUNE_BY_ID.pontoise, "gps")} /> : null}
            {list.map((c) => <ListItem key={c.id} icon="map-pin" label={<Fragment>{c.name}<small className="li-sub">{INTERCOS[c.interco]}</small></Fragment>} onClick={() => onPick(c, "commune")} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingCommune() {
  const { state, dispatch } = useStore();
  const back = () => dispatch({ type: "ONB_GO", step: state.session.position.permission === "denied" ? "denied" : "location" });
  return <CommunePicker onBack={back} onPick={(c, source) => dispatch({ type: "ONB_GO", step: "prep", pending: { communeId: c.id, source } })} />;
}

/* Refus ou position introuvable : jamais bloquant, jamais rouge ; l'alternative passe en action principale */
function LocationDenied({ unavailable }) {
  const { dispatch } = useStore();
  const { openSheet } = useActions();
  return (
    <div className="screen auth onb">
      <OnboardingTop skipLabel="Plus tard" onSkip={() => dispatch({ type: "ONB_FINISH", permission: unavailable ? "granted" : "denied" })} />
      <div className="auth-center">
        <Spot icon="compass" tone="neutral" size="xl" />
        <h1 className="onb-title">{unavailable ? "Position introuvable pour le moment" : <Fragment>Localisation <mark className="hl">désactivée</mark></Fragment>}</h1>
        <p className="onb-text">{unavailable ? "Le téléphone ne trouve pas votre position. Choisissez votre commune : vous pourrez réessayer plus tard." : "Choisissez votre commune : vous verrez les mêmes alertes, sans les distances."}</p>
      </div>
      <div className="screen-footer stack-footer">
        <Button block onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Choisir ma commune</Button>
        {unavailable ? null : <Button block variant="ghost" onClick={() => openSheet("location-help")}>Comment l'activer&nbsp;?</Button>}
      </div>
    </div>
  );
}

/* Reprise après refus (Polarsteps, Viator) : on montre les réglages au lieu de les décrire */
function SettingsPreview() {
  return (
    <div className="settings-preview" aria-hidden="true">
      <span className="sp-label">Exemple · Réglages du téléphone</span>
      <span className="sp-row"><span className="sp-ico"><Icon name="navigation-arrow-fill" className="ph-sm" /></span>Position<span className="sp-end">Jamais<Icon name="caret-right" className="ph-sm" /></span></span>
      <Icon name="caret-down" className="sp-arrow" />
      <span className="sp-options">
        <span>Jamais</span>
        <span>Demander la prochaine fois</span>
        <span className="on">Pendant l'utilisation de l'app<Icon name="check" /></span>
      </span>
    </div>
  );
}

function LocationHelpSheet() {
  const { closeSheet, toast } = useActions();
  return (
    <Fragment>
      <p className="onb-text" style={{ textAlign: "left", maxWidth: "none" }}>Dans les réglages, touchez <b>Position</b>, puis choisissez <b>Pendant l'utilisation de l'app</b>.</p>
      <SettingsPreview />
      <p className="sr-only">Étapes : ouvrez les Réglages du téléphone, touchez 95 Alerte puis Position, choisissez Pendant l'utilisation de l'app.</p>
      <Button block onClick={() => { closeSheet(); toast("Simulation : les réglages du téléphone s'ouvriraient ici."); }}>Ouvrir les réglages</Button>
      <Button block variant="ghost" onClick={closeSheet}>Non merci</Button>
    </Fragment>
  );
}

const ONB_SCREENS = {
  slides: OnboardingSlides, location: LocationPrimer, detected: CommuneDetected, commune: OnboardingCommune, prep: OnboardingPrep,
  denied: () => <LocationDenied />, unavailable: () => <LocationDenied unavailable />,
};
function OnboardingFlow() {
  const { state } = useStore();
  const C = ONB_SCREENS[state.onb.step] || OnboardingSlides;
  return <C />;
}

/* Après l'onboarding (Citizen, Blinkist, Evernote) : « Bien démarrer », trois premières actions, fermable */
function StartChecklist({ onConfirm }) {
  const { state, dispatch } = useStore();
  const { push, toast } = useActions();
  const items = [
    { id: "zone", label: "Choisir votre zone", done: state.session.position.source !== "default", act: () => push("commune") },
    { id: "vote", label: "Confirmer une alerte utile", done: !!state.prefs.startVoted, act: onConfirm },
    { id: "report", label: "Faire votre premier signalement", done: !!state.prefs.startReported, act: () => push("report") },
  ];
  const done = items.filter((x) => x.done).length;
  if (state.prefs.startHidden || done === items.length) return null;
  const hide = () => { dispatch({ type: "SET_PREF", key: "startHidden", value: true }); toast("Vous retrouverez ces conseils dans le profil."); };
  return (
    <section className="start-card" aria-label="Bien démarrer">
      <div className="sc-head"><b>Bien démarrer</b><small>{done}/{items.length}</small><IconButton icon="x" label="Masquer « Bien démarrer »" onClick={hide} /></div>
      <StepProgress step={done} total={items.length} />
      <ul>{items.map((x) => (
        <li key={x.id} className={cx(x.done && "done")}><button type="button" disabled={x.done} onClick={x.act}><Icon name={x.done ? "check-circle-fill" : "circle"} />{x.label}{x.done ? null : <Icon name="caret-right" className="ph-sm" />}</button></li>
      ))}</ul>
    </section>
  );
}

/* Depuis la carte : changer de commune (recherche de la carte, bannière « position non définie ») */
function CommuneScreen() {
  const { dispatch } = useStore();
  const { pop, toast } = useActions();
  return <CommunePicker title="Changer de commune" onBack={pop} onPick={(c, source) => { dispatch({ type: "SET_COMMUNE", communeId: c.id, source }); pop(); toast(`Commune : ${c.name}.`); }} />;
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
          <div className="preview-author"><Icon name="eye" />Visible publiquement : <b>{pub === "profile" ? `Signalé par ${publicName(state.session.user || USERS.me)}` : "Signalement anonyme"}</b></div>
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
  "verify-identity": { component: VerifyIdentityScreen, modal: true },
  commune: { component: CommuneScreen, modal: true },
};
const SHEETS = { "demo-sheet": { title: "Exemple de bottom sheet", component: DemoSheetContent }, "map-legend": { title: "Comprendre la carte", component: MapLegendSheet }, "map-filters": { title: "Filtres", component: MapFiltersSheet }, "location-help": { title: "Activer la localisation", component: LocationHelpSheet }, "location-why": { title: "Comment ma position est utilisée", component: LocationWhySheet } };

/* =====================================================================
   PANNEAU DE DÉMO (hors de l'app)
   ===================================================================== */
function DemoPanel() {
  const { state, dispatch } = useStore();
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
          <Switch id="demo-gps" label="Position introuvable" checked={d.gpsUnavailable} onChange={(v) => setDemo("gpsUnavailable", v)} />
          <Switch id="demo-error" label="Erreur réseau" checked={d.networkError} onChange={(v) => setDemo("networkError", v)} />
          <Switch id="demo-empty" label="Zone sans alerte" checked={d.emptyZone} onChange={(v) => setDemo("emptyZone", v)} />
          <Switch id="demo-many" label="Beaucoup d'alertes (+80)" checked={d.manyAlerts} onChange={(v) => setDemo("manyAlerts", v)} />
          <div className="row"><span>Vitesse du temps</span><SegmentedControl label="Vitesse du temps" value={d.timeSpeed} onChange={(v) => setDemo("timeSpeed", v)} options={[{ value: 1, label: "×1" }, { value: 60, label: "×60" }, { value: 600, label: "×600" }]} /></div>
          <div className="row"><span>Thème</span><SegmentedControl label="Thème" value={state.prefs.theme} onChange={(v) => setPref("theme", v)} options={[{ value: "light", label: "Clair" }, { value: "system", label: "Auto" }, { value: "dark", label: "Sombre" }]} /></div>
          <hr />
          <p className="section-label">Connexion</p>
          <div className="row"><span>Résultat de la vérification</span></div>
          <SegmentedControl block label="Résultat de la vérification d'identité" value={state.auth.idResult === "aucune" ? "en_cours" : state.auth.idResult} onChange={(v) => dispatch({ type: "AUTH_SET", patch: { idResult: v } })}
            options={[{ value: "en_cours", label: "En cours" }, { value: "reussie", label: "OK" }, { value: "echouee", label: "Échec" }, { value: "refusee", label: "Refus" }, { value: "manuelle", label: "Manuel" }]} />
          <p className="demo-note">Code SMS 000000 = code incorrect · e-mail deja@exemple.fr = déjà utilisé · « Erreur réseau » = échec FranceConnect.</p>
          <div className="lib-row">
            <Button variant="secondary" icon="play" onClick={() => { dispatch({ type: "RESTART" }); setOpen(false); }}>Rejouer le démarrage</Button>
            <Button variant="secondary" icon="arrow-counter-clockwise" onClick={() => { dispatch({ type: "RESTART", onboarding: true }); setOpen(false); }}>Rejouer l'onboarding</Button>
            {state.session.status !== "in" ? <Button variant="ghost" onClick={() => { dispatch({ type: "LOGIN", method: "demo", identity: "verifiee" }); setOpen(false); }}>Passer la connexion</Button> : null}
          </div>
          <hr />
          <Button variant="secondary" icon="squares-four" onClick={() => { if (state.session.status !== "in") dispatch({ type: "LOGIN", method: "demo", identity: "verifiee" }); push("components"); setOpen(false); }}>Bibliothèque de composants</Button>
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

/* Transitions entre écrans : « smart animate » (View Transitions API). Les éléments présents des deux côtés
   portent un view-transition-name (titre d'en-tête, barre d'étapes, bouton principal, barre d'onglets) et se
   déforment d'un écran à l'autre ; le reste se fond. Sans l'API ou avec les animations réduites : changement direct. */
const SCREEN_ACTIONS = new Set(["AUTH_GO", "LOGIN", "GUEST", "LOGOUT", "SET_TAB", "PUSH", "POP", "ONB_GO", "ONB_FINISH"]);
function useScreenTransitions(rawDispatch) {
  return useCallback((action) => {
    const changesScreen = SCREEN_ACTIONS.has(action.type) || (action.type === "AUTH_SET" && action.patch && action.patch.step);
    if (!changesScreen || !document.startViewTransition || motionReduced()) return rawDispatch(action);
    document.startViewTransition(() => ReactDOM.flushSync(() => rawDispatch(action)));
  }, [rawDispatch]);
}

function App() {
  const [state, rawDispatch] = useReducer(reducer, undefined, initialState);
  const dispatch = useScreenTransitions(rawDispatch);
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
              {state.session.status !== "in" ? (
                <main className="screen-area">
                  {state.session.status === "splash" ? <SplashScreen /> : state.session.status === "onboarding" ? <OnboardingFlow /> : <AuthFlow />}
                  {sheetDef ? (
                    <BottomSheet modal snap={state.sheet.snap} title={sheetDef.title} onSnap={(s) => dispatch({ type: "SNAP_SHEET", snap: s })} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
                      <sheetDef.component {...state.sheet.params} />
                    </BottomSheet>
                  ) : null}
                </main>
              ) : (
              <Fragment>
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
                  <span className="tooltip coach"><b>Astuce · 1/1</b>Signalez un événement ici</span>
                </button>
              ) : null}
              {hideTabbar ? null : <TabBar />}
              </Fragment>
              )}
              <ToastHost hasTabbar={state.session.status === "in" && !hideTabbar} />
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
