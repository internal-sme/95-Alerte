import type { Alert, Category, Comment, Commune, Notification, ServiceType, User } from "@/types";

/* =====================================================================
   DATA — données fictives (communes réelles du Val-d'Oise, personnes fictives)
   ===================================================================== */

export const MIN = 60 * 1000;

export const HOUR = 60 * MIN;

export const ALERT_TTL = 24 * HOUR; // R5 : une alerte expire au bout de 24 h

export const BOOT_TIME = Date.now();

export const INTERCOS = {
  cp: "CA de Cergy-Pontoise",
  vp: "CA Val Parisis",
  sg: "CA Saint Germain Boucles de Seine",
  mgp: "Métropole du Grand Paris",
  pv: "CA Plaine Vallée",
  rpf: "CA Roissy Pays de France",
  vo3f: "CC Vallée de l'Oise et des Trois Forêts",
  vvs: "CC Vexin Val de Seine",
};

export const COMMUNES: Commune[] = [
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

export const COMMUNE_BY_ID: Record<string, Commune> = Object.fromEntries(COMMUNES.map((c) => [c.id, c]));

/* Services destinataires (routage simulé, CDC §35–§37) */
export const SERVICE_TYPES: Record<string, ServiceType> = {
  securite: { label: "Sécurité et secours", scope: "departement", delay: null },
  voirie: { label: "Voirie", scope: "commune", delay: 72 },
  eclairage: { label: "Éclairage public", scope: "commune", delay: 48 },
  proprete: { label: "Propreté", scope: "commune", delay: 48 },
  espaces_verts: { label: "Espaces verts", scope: "commune", delay: 72 },
  tranquillite: { label: "Tranquillité publique", scope: "commune", delay: 24 },
  vie_locale: { label: "Vie locale et associative", scope: "commune", delay: null },
};

/* Catégories (CDC §15, §18) — famille de marqueur, priorité, précision d'affichage, service */
export const CATEGORIES: Category[] = [
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

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* Personnes fictives */
export const ME_ID = "me";

export const USERS: Record<string, User> = {
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
export const TRANSMISSION_STEPS = [
  { id: "envoye", label: "Signalement envoyé" },
  { id: "transmis", label: "Transmis au service compétent" },
  { id: "pris_en_compte", label: "Pris en compte" },
  { id: "en_traitement", label: "En cours de traitement" },
  { id: "traite", label: "Traité" },
  { id: "cloture", label: "Clôturé" },
];

/* Graine d'alertes : [id, catégorie, titre, description, commune, quartier, rue, âge (min), auteur|null (anonyme), ⬆, ⬇, 💬, photo, transmission, statut, groupe doublon] */
export const ALERT_SEED = [
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
  ["a31", "culture", "Visite gratuite du musée Tavet-Delacour", "Visites guidées toutes les heures jusqu'à 17 h, entrée libre pour les habitants du Val-d'Oise.", "pontoise", "Centre", "Rue Lemercier", 150, "u3", 19, 0, 3, true, "transmis", "active"],
  ["a28", "eclairage", "Lampadaire clignotant (doublon)", "Supprimé par l'auteur : doublon d'une alerte existante.", "ermont", "Centre", "Avenue de la Gare", 600, "me", 0, 0, 0, false, "envoye", "supprimee"],
];

/* Positions précises des alertes du secteur Cergy-Pontoise, dans leur quartier (fictif) de la carte */
export const ALERT_POSITIONS = {
  a1: [49.03559, 2.0938], a19: [49.03873, 2.08831], a25: [49.06237, 2.09532], a6: [49.05499, 2.13491], a26: [49.03928, 2.11338],
  a2: [49.04381, 2.04605], a22: [49.0415, 2.06899], a4: [49.027, 2.07228], a17: [49.0668, 2.07512], a29: [49.03554, 2.14277], a30: [49.02386, 2.07913], a31: [49.0455, 2.0985],
};

/* Alertes de zone (inondation, travaux) : demi-largeur de la zone concernée, en km (tâche 3.11) */
export const ALERT_AREAS = { a30: 0.55, a29: 0.3, a9: 0.45, a14: 0.35 };

export function seededJitter(id, amp) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = ((h % 1000) / 1000 - 0.5) * amp;
  const b = ((((h / 1000) | 0) % 1000) / 1000 - 0.5) * amp;
  return [a, b];
}

export function buildAlert(row: any[]): Alert {
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

export const SEED_ALERTS: Alert[] = ALERT_SEED.map(buildAlert);

/* Mode démo « beaucoup d'alertes » : alertes synthétiques réparties sur le territoire */
export function generateManyAlerts(count = 80) {
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

export const SEED_COMMENTS: Record<string, Comment[]> = {
  a1: [
    { id: "c1", authorId: "u2", anonymous: false, body: "Les pompiers arrivent, on entend les sirènes depuis la place.", ageMin: 8 },
    { id: "c2", authorId: "u5", anonymous: true, body: "Merci pour l'info, je passe par Saint-Martin.", ageMin: 4, parentId: "c1" },
    { id: "c7", authorId: "u8", anonymous: false, body: "", ageMin: 6, status: "moderated" }, // masqué par la modération (7.6) : le texte n'est jamais affiché
  ],
  a3: [{ id: "c3", authorId: "u7", anonymous: false, body: "Le service est passé ce midi, tout est propre maintenant.", ageMin: 90 }],
  a4: [
    { id: "c4", authorId: "u1", anonymous: false, body: "Super initiative ! On viendra avec les enfants.", ageMin: 40 },
    { id: "c5", authorId: "u9", anonymous: false, body: "Faut-il s'inscrire à l'avance ?", ageMin: 25 },
    { id: "c6", authorId: "u4", anonymous: false, body: "Non, venez directement à 10 h.", ageMin: 20, parentId: "c5" },
  ],
};

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "traite", alertId: "a5", title: "Votre signalement a été traité", body: "Trois lampadaires éteints avenue de la Gare", ageMin: 30, read: false },
  { id: "n2", kind: "proximite", alertId: "a1", title: "Nouvelle alerte à proximité", body: "Fumée importante visible rue Carnot · Pontoise", ageMin: 11, read: false },
  { id: "n3", kind: "commentaire", alertId: "a25", title: "Quelqu'un a commenté votre alerte", body: "Banc public cassé square Marcel-Pagnol", ageMin: 120, read: true },
];
