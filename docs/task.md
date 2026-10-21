# Tâches — Prototype mobile 95 Alerte (artefact)

> **Fichier de référence pour développer le prototype.** On avance phase par phase, dans l'ordre. Une phase est terminée quand toutes ses tâches sont cochées **et** que ses critères de validation sont vérifiés.
> Objectif : un **prototype interactif pour une preview**, en un seul fichier `prototype/index.html` publié en artefact. Pas de back-end : données fictives, intégrations simulées.
> Références : `PRD.md` (F-xx, S1–S10, §10.3 textes), `DESIGN_SYSTEM.md`, `ARCHITECTURE.md` §6, `AGENTS.md`, **`docs/design-system/index.html`** (référence visuelle des tokens et composants), **`docs/benchmark/benchmark-mobbin.html`** (benchmark et plan de conception).
> Chaque phase contient un bloc **Décisions UX (benchmark)** : ce sont des choix arrêtés, à appliquer tels quels. La source entre parenthèses renvoie à la fiche du benchmark.

### 10 principes de conception (issus du benchmark)

| # | Principe | Source |
|---|---|---|
| P1 | La carte ne disparaît jamais en premier : tout détail commence en bottom sheet (peek → moitié → plein) | Nextdoor, Waze |
| P2 | Signaler en 3 taps minimum, 7 étapes maximum ; description et photo facultatives pour un incident | Google Maps, Waze |
| P3 | Dire ce qui sera public **avant** l'envoi (aperçu exact « Jean D. » / « Citoyen anonyme ») | Waze, YouTube Studio |
| P4 | Le vote confirme, il ne flatte pas : « Confirmer / Contester » + compteur visible dès l'aperçu | Waze |
| P5 | Après l'envoi, montrer la suite : service nommé + timeline avec les étapes futures en gris | Bird, Bumble |
| P6 | Le rouge est rare : rouge plein réservé aux incidents critiques et à l'urgence (≤ 1 élément rouge par écran hors alerte critique) | contre-exemple Citizen |
| P7 | Le positif a la même place que le négatif (taille, saturation, place dans les filtres) | Waze |
| P8 | Demander au bon moment : localisation à l'onboarding (avec amorce), notifications au premier suivi ou à la première publication | Greenlight, Transit |
| P9 | Toute action laisse une trace : toast non bloquant, écran dédié pour la publication, confirmation pour les actions sensibles | Google Maps, Nextdoor |
| P10 | Lisible sans couleur, sans son, à 200 % : forme + icône + texte | Bumble, Apple Maps |

> **Une branche par phase** (AGENTS.md) : `phase/<n>-<nom>` depuis `develop` ; PR vers `develop` seulement après validation de la phase par l'utilisateur.
> **Deux versions à chaque phase** (AGENTS.md) : le prototype React **et** le canevas de preview (planches claires et sombres, liées pour Play, sans cadre de téléphone). Une phase n'est terminée que lorsque les deux sont publiées.

**Légende** : `[ ]` à faire · `[~]` en cours · `[x]` fait

---

## Suivi global

| Phase | Contenu | Écrans / réf. | Statut |
|---|---|---|---|
| 0 | Fondations techniques et composants de base | — | ✅ Terminée |
| 1 | Splash screen + Connexion (FranceConnect, compte, identité) | UI-001, UI-008→010 | ✅ Terminée |
| 2 | Onboarding + territoire + localisation | UI-002→007 | ✅ Terminée (internal-sme/95-Alerte#11) |
| 3 | Accueil — carte interactive | UI-011 / HOME-01 | ✅ Terminée (validée, PR vers `develop`) |
| 4 | Liste des alertes, recherche, filtres | ALERT-01, UI-012 | ✅ Terminée (internal-sme/95-Alerte#15) |
| 5 | Fiche alerte + votes | ALERT-03 | ✅ Terminée (validée, PR vers `develop`) |
| 6 | Création d'une alerte (+ Signaler) | ALERT-02 | ✅ Terminée (validée, PR vers `develop`) |
| 7 | Commentaires + signalement de contenu | ALERT-04 | ⬜ À faire |
| 8 | Activité + notifications | PROFILE-01, UI-013 | ⬜ À faire |
| 9 | Profil, paramètres, aide, légal | UI-014→024 | ⬜ À faire |
| 10 | États transverses, finitions, recette, publication | UI-025→029 | ⬜ À faire |

Statuts possibles : ⬜ À faire · 🟨 En cours · ✅ Terminée.

---

## Phase 0 — Fondations

**But** : poser le squelette sur lequel tous les écrans s'appuient.

**Décisions UX (benchmark)**
- `BottomSheet` à 3 crans (peek ≈ 120 px / 50 % / plein écran), poignée + glissement + clavier : c'est le pivot de l'app (Nextdoor, Waze)
- `Toast` non bloquant en bas, au-dessus de la tab bar, annoncé par `aria-live` (Google Maps, Nextdoor)
- `CategoryTile` : tuile pâle + icône Phosphor dans la forme de sa famille + libellé court (Google Maps)
- `Timeline` générique (points pleins/vides + trait), réutilisée pour les mises à jour, le traitement et la vérification d'identité (Bumble)
- Tab bar avec **+ Signaler** central surélevé, en bleu marque, jamais en rouge (Citizen, adapté)
- CSS des tokens et composants **repris de `docs/design-system/index.html`** (source visuelle unique)

- [x] **0.1** Créer `prototype/index.html` (assemblé par `tools/build_prototype.py` depuis `prototype/src/`) : React 18.3.1 + ReactDOM + Babel standalone (cdnjs), police Inter (Google Fonts), **sprite SVG Phosphor intégré** (généré par `tools/build_phosphor_sprite.py` depuis `@phosphor-icons/core@2.1.1` : les artefacts bloquent les feuilles de style jsDelivr)
- [x] **0.2** Tokens CSS sur `:root` (couleurs, familles d'alertes, statuts, typo, espacements, rayons, ombres) + mode sombre (`prefers-color-scheme` et `data-theme`) — DS §2–§4
- [x] **0.3** Cadre téléphone 390 × 844 sur desktop, plein écran sur mobile ; zone sûre (encoche, barre d'accueil)
- [x] **0.4** Store unique (`useReducer`) : session, préférences, alertes, votes, commentaires, suivis, notifications
- [x] **0.5** Routeur interne : onglets + pile d'écrans + bottom sheets + modales, bouton retour
- [x] **0.6** Données fictives : territoire du Val-d'Oise, communes (Cergy, Pontoise, Argenteuil, Sarcelles, Garges-lès-Gonesse, Montmorency, Enghien-les-Bains, L'Isle-Adam, Saint-Ouen-l'Aumône, Ermont…), quartiers, catégories ± avec icônes Phosphor, services et règles de routage, ~30 alertes (positives et négatives, à différents âges et statuts), commentaires, personnes fictives
- [x] **0.7** Utilitaires : temps relatif (« il y a 12 min »), compteur d'expiration de 24 h, distance, horloge simulée, routage simulé
- [x] **0.8** Composants de base : `Button` (4 variantes + loading), `IconButton`, `Chip`, `SegmentedControl`, `Card`, `Input`/`Textarea`, `RadioCard`, `Switch`, `ListItem`
- [x] **0.9** Composants de feedback : `Toast` (aria-live), `Modal` de confirmation, `BottomSheet` (3 hauteurs), `Banner`, `Skeleton`, `EmptyState`, `Spinner`
- [x] **0.10** `TabBar` : Carte · Alertes · **+ Signaler** (central, surélevé) · Activité · Profil
- [x] **0.11** Panneau **« Mode démo »** discret : réinitialiser, forcer hors connexion, permission refusée, erreur, zone vide, beaucoup d'alertes, accélérer le temps
- [x] **0.12** `localStorage` encapsulé (`try/catch`) pour le thème, la taille du texte et l'onboarding vu
- [x] **0.13** Composants transverses issus du benchmark : `CategoryTile`, `Timeline`, `RadioCard` avec aperçu, `Pill` flottante
- [x] **0.C** Canevas de preview : 15 planches (clair, sombre, états et composants), liées pour Play
- [x] **0.14** Page de référence du Design System : `docs/design-system/index.html` (tokens, icônes, composants, états)

**Validation** : la page s'ouvre sans erreur console ; les onglets naviguent vers des écrans vides ; le thème sombre fonctionne ; les composants sont visibles sur une page de démonstration interne.

---

## Phase 1 — Splash screen + Connexion

**But** : premier contact et accès au compte (F-01, F-02 ; CDC §6, §8, §9, §43).

**Décisions UX (benchmark)**
- Écran de connexion avec **un seul CTA principal** (Continuer avec FranceConnect) ; « Créer un compte » en secondaire ; « Continuer sans compte » en lien
- Création de compte en stepper « Étape 2 sur 4 », un champ principal par écran (Greenlight)
- Vérification d'identité affichée avec le composant `Timeline` + délai indicatif (« généralement moins de 24 h ») (Bumble)
- Aperçu du nom public dès la création du profil : « Vous apparaîtrez comme Jean D. » (Waze)

- [x] **1.1** UI-001 **Splash** : logo 95 Alerte, chargement court (< 1,5 s), version de l'app
- [x] **1.2** UI-008 **Connexion** : « Continuer avec FranceConnect » (bouton principal + texte expliquant la sécurisation de l'identité), « Créer un compte », « J'ai déjà un compte », « Continuer sans compte » (consultation)
- [x] **1.3** **FranceConnect simulé** : écran intermédiaire de choix du fournisseur d'identité → chargement → retour connecté avec identité vérifiée
- [x] **1.4** **Création de compte** (stepper) : informations personnelles → vérification du téléphone (code OTP à 6 chiffres) → vérification de l'email → vérification d'identité → compte vérifié
- [x] **1.5** UI-009 **Vérification d'identité** : états *en cours*, *réussie*, *échouée*, *document refusé*, *nouvelle tentative*, *vérification manuelle*
- [x] **1.6** UI-010 **Création du profil** : prénom, nom, nom public affiché (« Jean D. »), aperçu de ce qui sera visible publiquement
- [x] **1.7** Badge de statut d'identité : *non vérifiée* / *en cours* / *✓ vérifiée*
- [x] **1.8** États d'erreur : code OTP invalide, email déjà utilisé, échec FranceConnect, hors connexion

- [x] **1.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S1 (partie connexion) jouable de bout en bout, par FranceConnect et par le parcours de création de compte ; chaque état de vérification est accessible.

---

## Phase 2 — Onboarding + territoire + localisation

**But** : comprendre le concept en quelques secondes et paramétrer la zone (F-01 ; CDC §7, §16, §77). Écrans conçus d'après le benchmark `docs/benchmark/onboarding-refonte.html` (12 flows Mobbin).

**Décisions UX (benchmark et utilisateur)**
- **3 pages de présentation** : photo plein cadre générée avec Magnific (d'après le flow Citizen : main, téléphone, rue du Val-d'Oise), arc blanc, mot-clé surligné, pagination par points, « Passer » en bouton tertiaire. Le 4e titre du CDC (« Votre territoire, votre vigilance. ») est celui de la connexion
- La page 3 (« Une bonne nouvelle ? ») ancre la place du positif
- **Amorce de localisation** allégée avant la demande système (Tinder), demande coachée (Life360), jamais « Toujours »
- **Zone suivie** : cercle sur la carte, rayon 1 / 5 / 10 km (5 par défaut) ; « Étape n sur 2 » (Duolingo, Blinkist)
- **Pas de demande de notifications** dans l'onboarding (phases 5 et 6) ; centres d'intérêt reportés aux phases 5–6
- Après l'onboarding : astuce sur le + et carte « Bien démarrer 1/3 » (Citizen, Evernote)

- [x] **2.0** Fondations : `btn-tertiary`, `Highlight`, `StepProgress`, `ZoneMap`, `SettingsPreview`, `StartChecklist`, `PageDots`, `SearchField`, `SystemPrompt`, `MapBanner` dans le Design System
- [x] **2.1** UI-002→005 **Présentation en 3 pages** : « Que se passe-t-il autour de vous ? » · « Un problème ? Signalez-le. » · « Une bonne nouvelle ? Partagez-la aussi. » + CTA **Commencer** ; balayage, clavier, smart animate ; photos dans `docs/brand/onboarding/` (recadrage `tools/fetch_onboarding_photos.py`)
- [x] **2.2** UI-007 **Autorisation de localisation** : amorce en trois éléments (« Étape 1 sur 2 »), « Comment ma position est utilisée ? » en feuille, demande système coachée, « Choisir ma commune », « Plus tard »
- [x] **2.3** UI-006 **Zone suivie et choix du territoire** : commune détectée sur la carte, rayon 1 / 5 / 10 km (« Étape 2 sur 2 ») utilisé par la carte et la liste ; recherche ou liste des communes ; hors zone → « 95 Alerte n'est pas encore disponible dans cette zone. »
- [x] **2.4** Préparation de la carte : carte entière, texte en surimpression, cercle et marqueurs animés (≤ 1,2 s, ignorée si animations réduites)
- [x] **2.5** États : permission refusée (choix manuel, réglages illustrés « Ouvrir les réglages » / « Non merci ») ; localisation indisponible ; carte sans position (« Position non définie »)
- [x] **2.6** Enchaînement S1 : Splash → Présentation → Localisation → Zone → Préparation → Connexion → Accueil ; onboarding non rejoué une fois vu ; arrivée : astuce « 1/1 » sur le +, « Bien démarrer 1/3 »

- [x] **2.C** Canevas de preview : page « Phase 2 · Onboarding et territoire » (clair + sombre, Play), sources dans `prototype/canvas/`, publication

**Validation** : S1 complet de bout en bout jusqu'à l'accueil, avec localisation autorisée **et** refusée.

---

## Phase 3 — Accueil : carte interactive

**But** : l'écran le plus important — « Que se passe-t-il autour de moi ? » (F-03 ; CDC §10–§16, §71, §75). Écrans conçus d'après le benchmark `docs/benchmark/carte-refonte.html` (12 flows Mobbin, plan en 6 lots C0–C5).

**Décisions UX (benchmark)**
- Carte claire et désaturée ; marqueurs en formes de famille ; regroupements bleus numérotés en 3 tailles (Waze, Google Arts & Culture)
- Bottom sheet en position **peek** par défaut : « n alertes dans votre zone » + « Rayon 5 km · mis à jour à l'instant » (Airbnb, Too Good To Go)
- **Pilule flottante** contextuelle, une seule à la fois : hors territoire > « Voir les alertes ici » après déplacement (Turo) > « n nouvelles alertes » (Citizen)
- Tap sur un marqueur → fiche de résumé avec **compteur de confirmations** (Waze), balayage vers l'alerte voisine (Resy)
- Alertes de zone (inondation, travaux) en **polygone translucide** (Lime, Météo Apple)
- **Bulle d'aide** sur le + au premier lancement : « Signalez un événement » (Citizen)

**Décisions validées par l'utilisateur (« vas sur tes recommandations »)**
- **E1** : pas de logo ni de profil dans l'en-tête de la carte (recherche, filtres, notifications ; le profil reste un onglet)
- **E2** : l'onglet « Alertes » reste (liste complète, phase 4) ; la bascule « Liste / Carte » de l'accueil montre la même zone en liste, sans changer d'onglet
- **E3** : puces Toutes / Positives / Négatives sous la recherche, toujours visibles
- **E4** : balayage entre alertes dans la fiche de sélection, avec flèches et annonce « n sur N »
- **E5** : quartiers fictifs sur le secteur Cergy-Pontoise uniquement (Cergy, Pontoise, Saint-Ouen-l'Aumône, Osny) ; communes réelles partout

- [x] **3.1** **Carte SVG** du Val-d'Oise : contour départemental, 184 communes (IGN ADMIN EXPRESS via france-geojson) et 12 intercommunalités (`@etalab/decoupage-administratif`), quartiers fictifs de Cergy-Pontoise, Oise, Seine, forêts, grands axes ; hors département hachuré. Géométrie générée par `tools/build_map_95.py` → `prototype/src/map-95.json` (sources dans `tools/data/map-95/`), embarquée par le build
- [x] **3.2** Pan et zoom : glisser, pincer, molette, double toucher, boutons + / −, clavier (flèches, + / −) ; **4 niveaux** département → intercommunalité → commune → quartier ; libellés selon le niveau, sans chevauchement ; étiquette de niveau + échelle sous la recherche
- [x] **3.3** **Marqueurs** par famille + icône ; marqueur sélectionné agrandi, hors regroupement et au premier plan ; halo « Urgent » ; nom accessible « Incendie, Urgent, 1,1 km : … »
- [x] **3.4** **Clustering** recalculé à l'écran : les regroupements se divisent au zoom (département 16 + 10 → intercommunalité 6 + 2… → commune individuels) ; tap sur un regroupement = zoom sur ses alertes ; regroupement plus serré au-delà de 12 marqueurs
- [x] **3.5** **Ma position** : point « Vous êtes ici » avec halo de précision ; zone suivie dessinée ; bouton de recentrage ; si la localisation est refusée, la position manuelle (commune) est utilisée
- [x] **3.6** En-tête (E1) : recherche (commune, adresse), bouton Filtres (compteur bleu), notifications (badge) ; puces de type sous la recherche (E3) ; feuille « Filtres » (familles, urgentes seulement)
- [x] **3.7** **Fiche de sélection** : catégorie, zone, ancienneté, titre, lieu et distance, auteur public, statut, ⬆ ⬇, commentaires, « Voir le détail » ; balayage / flèches / « n sur N » (E4) ; × et Échap, focus rendu au marqueur
- [x] **3.8** Bascule **Liste / Carte** (E2) mémorisée (`prefs.homeView`), avec transition « smart animate »
- [x] **3.9** États : chargement (squelette du volet, marqueurs progressifs), « Aucun événement dans cette zone. » + « Élargir à 10 km », « Impossible de charger la carte. » + Réessayer / Voir la liste, hors connexion (bandeau global), beaucoup d'alertes (+80), hors territoire
- [x] **3.10** Les alertes expirées n'apparaissent pas sur la carte active
- [x] **3.11** Pilule « n nouvelles alertes », polygones des alertes de zone, bulle d'aide sur le + au premier lancement ; feuille « Comprendre la carte » (légende)

- [x] **3.C** Canevas de preview : page « Phase 3 · Carte interactive », 19 planches en clair et en sombre (accueil, volet, fiche, alerte voisine, alerte de zone, 3 niveaux de zoom, liste, légende, filtres ; chargement, déplacement, zone affichée, vide, erreur, beaucoup d'alertes, hors Val-d'Oise, sans position), reliées pour Play ; planches générées depuis le rendu du prototype ; feuille de style ré-téléversée (`/_blob/e3d0578d8626d69187092229b05dae79`)

**Validation** : S2 jouable jusqu'à la bottom sheet ; lisible en mode clair et sombre ; marqueurs distinguables sans la couleur.

---

## Phase 4 — Liste, recherche et filtres

**But** : alternative à la carte et accès ciblé (F-04, F-05, F-06 ; CDC §15, §17, §45–§48, §87, §88).

**Décisions UX (benchmark)**
- `AlertCard` : icône de famille, titre, « Cergy · 1,2 km · il y a 12 min », badge de statut, ⬆ ⬇ 💬 (Nextdoor)
- Sections « À proximité », « Récentes », « Positives » (Flighty « For you / Major issues »)
- Filtres en sheet : **grille de catégories cochables** (Grab), chips période et distance, bouton « Voir 18 alertes » qui annonce le nombre de résultats
- « Autour de moi » = liste triée par distance (Waze « Reports ahead »)

**Décisions validées par l'utilisateur (« vas-y » sur les recommandations du rapport `docs/benchmark/liste-refonte.html`)**
- **F1** : « Autour de moi » = tri Distance du fil Alertes (intertitres par tranche), pas un écran séparé
- **F2** : AlertCard compacte, vignette de 72 px à droite seulement s'il y a une photo
- **F3** : la recherche montre un lieu sur la carte sans changer la zone suivie ; « Suivre cette zone » la change
- **F4** : période en puces 1 h · 6 h · aujourd'hui · 24 h ; la période personnalisée viendra avec l'historique (phase 8)
- **F5** : 5 recherches récentes au plus, sur l'appareil, effaçables

- [x] **4.1** **AlertCard** compacte : famille, catégorie, « Urgent », ancienneté, titre (2 lignes), lieu et distance, vignette photo à droite, ⬆ ⬇ 💬, statut (dont « Expire dans … »)
- [x] **4.2** ALERT-01 **Liste** : puces Toutes / Positives / Négatives partagées avec la carte, barre de recherche et Filtres collantes, compteur « n alertes »
- [x] **4.3** Fil : À proximité · Récentes · Populaires (3 alertes chacune, « Tout voir »), puis le reste par pertinence (formule dans ARCHITECTURE.md) ; fin de fil « Vous êtes à jour »
- [x] **4.4** **« Autour de moi »** = tri Distance (Moins de 1 km, 1 à 5 km, 5 à 10 km, au-delà) ; tri Récentes (dernière heure, 1 à 6 h, 6 à 24 h) ; feuille « Trier par »
- [x] **4.5** UI-012 **Recherche** : 184 communes, quartiers, voies et lieux, alertes, catégories ; groupes, saisie en gras, insensible aux accents ; « Autour de moi », 5 recherches récentes effaçables ; « Aucun résultat pour « … » » ; hors territoire ; clavier (flèches, Entrée) ; un lieu centre la carte
- [x] **4.6** **Panneau de filtres** : tri, type, catégories en grille (Négatives / Positives), période, distance (500 m → Val-d'Oise), urgentes ; « Voir n alertes » recalculé ; « Tout effacer » ; filtres actifs retirables ; partagés carte / liste
- [x] **4.7** États : squelettes, « Aucune alerte dans cette zone. Revenez plus tard ou élargissez votre zone de recherche. », vide filtré (« Effacer les filtres »), recherche sans résultat

- [x] **4.C** Canevas : page « Phase 4 · Liste, recherche et filtres », 16 planches en clair et en sombre reliées pour Play ; planches de la phase 3 régénérées (cartes compactes, recherche)

**Validation** : filtrer « Positives + Culture + 5 km » donne le même résultat sur la carte et dans la liste ; la recherche d'une commune recentre la carte.

---

## Phase 5 — Fiche alerte + votes

**But** : comprendre une alerte et réagir (F-08, F-09, F-13 ; CDC §26, §30, §31, §36, §49, §79, §80).

**Décisions UX (benchmark)**
- Ordre de lecture : média → type et titre → lieu et distance → compteur d'expiration → description → votes → service et timeline → commentaires (Citizen, apaisé)
- Votes « Confirmer / Contester » pleine largeur, état sélectionné rempli, `aria-pressed` (Waze)
- Timeline de traitement + délai indicatif si le service le fournit (Bumble)
- Premier « Suivre » → **sheet d'opt-in aux notifications** (« Pour tout changement / Seulement le traitement / Non merci ») (Transit)
- Menu ⋯ en sheet, chaque action avec une ligne d'explication (Nextdoor)
- Écran **Situation urgente ?** : numéros 112 / 18 / 17 / 15 affichés en clair, **un seul** bouton rouge (DoorDash, Waymo) — numéros à valider (PRD §13)

**Décisions validées par l'utilisateur (« vas-y » sur les recommandations du rapport `docs/benchmark/fiche-refonte.html`)**
- **G1** : la fiche est un écran empilé (comme la recherche), ouvert depuis le résumé de la carte, la liste et l'activité ; smart animate du type et du titre depuis le résumé
- **G2** : un vote par alerte ; toucher l'autre bouton change le vote, retoucher le même le retire (« Vote retiré. »)
- **G3** : écran « Situation urgente ? » avec 112, 18, 17, 15 et 114 (SMS) en clair, un seul bouton rouge « Appeler le 112 » qui ouvre le clavier du téléphone (lien `tel:`), jamais d'appel automatique
- **G4** : photos de démonstration générées avec Magnific (rues du Val-d'Oise, personne d'identifiable), embarquées en WebP ; sans photo, la mini-carte prend la tête de la fiche
- **G5** : alerte expirée absente de la carte et de la liste, consultable en lecture seule (grisée, votes fermés, « Cette alerte a expiré. »)
- **G6** : aperçu des 2 derniers commentaires en lecture seule ; écrire, répondre et signaler arrivent en phase 7

- [x] **5.1** ALERT-03 **En-tête** : type, catégorie, « Urgent », statut, titre, lieu au niveau de précision autorisé (halo pour le quartier, zone dessinée), publication, mini-carte au niveau de la rue
- [x] **5.2** **Compteur d'expiration** : « Visible encore 17 h 32 » + barre ; « Expire dans 45 min » (orange) ; état expiré
- [x] **5.3** Contenu : description, photo en tête (« 1 / 2 »), vignettes, visionneuse plein écran (« 1 sur 2 », balayage, flèches, Échap, texte alternatif lu et affiché) ; 6 photos Magnific importées (`tools/fetch_alert_photos.py`, originaux dans `docs/brand/alertes/`)
- [x] **5.4** Auteur public : « Jean D. » ou « Citoyen anonyme », « (vous) » pour l'auteur — jamais d'email, de téléphone ou d'adresse
- [x] **5.5** **Votes** : question « Ce signalement vous semble-t-il exact ? », Confirmer / Contester, un vote modifiable et retirable (G2), toasts « Merci, votre vote est enregistré. » / « Vote modifié. » / « Vote retiré. », compteurs à jour partout ; invité → feuille de connexion ; fermés si expirée ou hors connexion
- [x] **5.6** **Service** : « Transmis au service compétent » + nom du service (catégorie + commune), progression en 6 segments, délai habituel s'il est fourni ; feuille **Suivi du traitement** (timeline horodatée Envoyé → … → Clôturé)
- [x] **5.7** Actions : **Suivre** / « Suivie », **Partager** (aperçu sans donnée personnelle, Copier le lien, SMS, WhatsApp, Plus… simulés), menu `⋯` (Copier le lien, Signaler → phase 7, Supprimer mon alerte avec confirmation)
- [x] **5.8** Rappel d'urgence sur les catégories d'incident + écran **Situation urgente ?** (G3)
- [x] **5.9** Doublons : bandeau « Ces alertes semblent concerner le même événement. » + liens vers les autres fiches
- [x] **5.10** États : chargement, erreur (« Impossible de charger cette alerte. »), hors connexion, expirée (G5), supprimée et modérée (« Cette alerte n'est plus disponible »)
- [x] **5.11** Feuille « Être prévenu ? » au premier « Suivre » : Pour tout changement / Seulement le traitement / Non merci ; ensuite le choix est repris, modifiable depuis « Suivie »
- [x] **5.12** *(ajoutée à la demande de l'utilisateur)* **Fond de carte Plan ou Satellite** : étape 3 sur 3 de l'onboarding « Quelle carte préférez-vous ? » (la carte derrière change en direct), réglage Profil › Affichage › Fond de carte, bouton « Fond de carte » (calques) sur la carte ; appliqué à la carte d'accueil, aux cartes de l'onboarding et à la mini-carte de la fiche. Satellite = images **Copernicus Sentinel-2** (4 juin 2023, 10 m par pixel, données libres) reprojetées dans le repère de la carte et embarquées (`tools/build_satellite_95.py`). **Google Earth n'est pas intégrable au prototype** : les artefacts bloquent les scripts, images et cadres externes (Google compris), l'API Google demande une clé et ses conditions interdisent de stocker ses images ; en production, la vue satellite du SDK Google Maps (clé, facturation) ou les orthophotos IGN (BD ORTHO, 20 cm) prendront le relais (ARCHITECTURE.md).

- [x] **5.C** Canevas : page « Phase 5 · Fiche alerte et votes », 23 planches en clair et en sombre reliées pour Play (le résumé de la carte et le fil y mènent) + 7 planches du fond de carte (onboarding plan et satellite, feuille, carte satellite, mini-carte, Profil) ; onboarding passé à 3 étapes

**Validation** : S2 complet jusqu'au détail ; S5 jusqu'au vote ; un vote changé met à jour les compteurs partout (carte, liste, fiche). Vérifié : carte → résumé → fiche en 2 touchers, vote 24 → 25 puis modifié, retiré, et 25 dans le résumé de la carte au retour.

---

## Phase 6 — Création d'une alerte

**But** : signaler vite et bien (F-07 ; CDC §19–§25, §35, §67, §68).

**Décisions UX (benchmark)**
- Ouverture en sheet plein écran depuis le + ; barre de progression fine en haut (Bird)
- Type : deux grandes RadioCards Positif / Négatif **de même poids visuel** (P7)
- Catégorie : **grille 2 colonnes** de `CategoryTile` + « Ne signalez que si vous êtes en sécurité » pour les catégories critiques (Google Maps)
- Lieu : **épingle centrale fixe**, la carte bouge, adresse en direct, bulle « Vérifiez que la position est correcte », bouton « Confirmer cette position » inactif hors Val-d'Oise ; épingle bleue tant que la catégorie n'est pas choisie (Snoonu, Shopee, Glovo)
- Médias : **consigne dans la caméra** (« Photographiez le problème ou le lieu »), vignettes ✕ / ↻ avec progression (Bird)
- Identité : deux RadioCards avec « ce que les autres verront » + aperçu exact de l'auteur public ; changement confirmé (YouTube Studio, Whering)
- Publication : écran dédié « Alerte publiée » → animation de routage vers « Service Propreté · Ville de Cergy » → retour à la carte centrée sur l'alerte, avec toast (Google Maps, Bird)
- Première publication → proposition d'activer les notifications de suivi (Transit)

**Décisions validées par l'utilisateur (« vas-y » sur les recommandations du rapport `docs/benchmark/signalement-refonte.html`)**
- **H1** : titre obligatoire, proposé d'après la catégorie et le lieu (« Incendie rue Carnot »), modifiable ; description et photo facultatives (« Continuer sans photo »)
- **H2** : l'étape « Aperçu » est la confirmation (carte telle qu'elle sera vue, « Modifier » par bloc, 24 h, public, service) ; « Publier l'alerte » publie sans modale de plus
- **H3** : identité sans choix par défaut la première fois ; ensuite le dernier choix est présélectionné (préférence `lastIdentity`), toujours modifiable
- **H4** : brouillon gardé dans le store pour la session (pas dans localStorage) ; quitter propose « Garder le brouillon » / « Abandonner », puis « Reprendre votre signalement ? » au prochain +
- **H5** : photos seulement (3 au plus), caméra simulée avec consigne et galerie de démonstration ; pas de vidéo simulée
- **H6** : invité qui touche + → feuille « Connectez-vous pour signaler » par-dessus la carte (comme pour voter)

- [x] **6.1** Écran empilé plein écran depuis le + : en-tête ‹ · Signaler · ×, « Étape n sur 7 » avec barre, une question par écran, CTA dans le pied d'écran, smart animate (barre, question, bouton) ; × → « Quitter le signalement ? » Garder le brouillon / Abandonner (H4)
- [x] **6.2** **Type** : « Que souhaitez-vous signaler ? » — Un événement positif / Un événement négatif (RadioCards)
- [x] **6.3** **Catégorie** : grille d'icônes filtrée selon le type et groupée par famille ; « Ne signalez que si vous êtes en sécurité » (→ Situation urgente ?) pour les incidents
- [x] **6.4** **Localisation** : épingle fixe au centre, la carte bouge dessous (glisser, zoom, flèches du clavier), alertes existantes estompées, adresse en direct (rue la plus proche, quartier, commune) et précision affichée selon la catégorie, recherche d'adresse, « Utiliser ma position » → **Confirmer cette position** ; hors du Val-d'Oise : bouton inactif et message
- [x] **6.5** **Description** : titre proposé (H1) avec compteur, description facultative avec aide (« ni nom, ni numéro de téléphone, ni plaque »), validation (5 caractères au moins)
- [x] **6.6** **Photo** (H5) : caméra simulée avec consigne, galerie de démonstration, vignettes avec progression (compression puis envoi), retirer, erreur d'envoi + Réessayer, toast « Photo ajoutée. », 3 photos au plus
- [x] **6.7** **Identité** : « Comment souhaitez-vous publier votre signalement ? » — Publier avec mon profil (« Les autres verront : Jean D. ») / Publier anonymement (« Citoyen anonyme », traçabilité rappelée) ; dernier choix repris (H3)
- [x] **6.8** **Aperçu** (H2) : la carte d'alerte telle qu'elle sera publiée, récapitulatif avec « Modifier » par bloc, « Visible par tous pendant 24 heures », service destinataire → **Publier l'alerte**
- [x] **6.9** **Publication** : chargement → « ✓ Votre alerte a été publiée. » → animation de routage (Citoyen → 95 Alerte → Analyse → Service) → « ✓ Votre signalement a été transmis au service compétent. » (nom du service selon la catégorie et la commune)
- [x] **6.10** L'alerte créée apparaît sur la carte, dans la liste et dans « Mes alertes » ; notification « Votre alerte a été publiée » ; « Voir sur la carte » (centrée sur l'alerte) / « Voir mon alerte » (fiche)
- [x] **6.11** Erreurs : « Impossible de publier votre alerte. Vérifiez votre connexion. » (Réessayer, brouillon gardé), aperçu hors connexion (publication désactivée), publication refusée (téléphone, plaque ou e-mail dans le texte) ; invité → feuille de connexion (H6)

- [x] **6.12** *(ajoutée à la demande de l'utilisateur)* **Vraie caméra** : « Prendre une photo » détecte un appareil photo (`enumerateDevices`) ; s'il y en a un, le navigateur demande l'autorisation (« Autorisez l'accès à l'appareil photo »), puis l'aperçu en direct (caméra arrière) et le déclencheur prennent une vraie photo (JPEG réduit à 1 600 px, sans métadonnées de position), envoyée et publiée comme les autres. Refus → « Accès à l'appareil photo refusé » + « Choisir dans la galerie » ; caméra occupée → « Appareil photo indisponible » + « Réessayer ». Sans appareil photo, ou si la page n'y a pas droit (artefact intégré), caméra simulée comme avant. Mode démo : « Appareil photo refusé ». React + TypeScript (`apps/prototype-web`) à jour.
- [x] **6.C** Canevas : page « Phase 6 · Création d'une alerte », 21 planches en clair et en sombre reliées pour Play ; la planche « Signaler » (cible du + de toutes les barres d'onglets) ouvre désormais le parcours

**Validation** : S3 (positif, identifié) et S4 (incendie, anonyme, transmission au service) jouables de bout en bout en moins de 60 s. Vérifié : S4 (incendie rue Carnot, anonyme, 1 photo) publié et transmis à « Sécurité et secours · Val-d'Oise », visible sur la carte, la fiche et Mes alertes ; S3 (culture à Cergy, identifié, adresse recherchée) publié sous « Jean D. » ; brouillon repris à l'étape 3 sur 7.

---

## Phase 7 — Commentaires + signalement de contenu

**But** : interagir et garder un espace sain (F-10, F-11 ; CDC §32–§34, §83, §84).

**Décisions UX (benchmark)**
- Composer collé en bas (texte + photo), réponses indentées d'un seul niveau (Nextdoor)
- Signaler : liste de motifs avec une phrase d'aide sous le titre, puis écran « Merci » + lien vers les règles de la communauté (Clubhouse)
- Toasts « Commentaire publié » / « Commentaire supprimé » (Nextdoor)

- [ ] **7.1** ALERT-04 **Liste de commentaires** : auteur public ou anonyme, date relative, texte, réponses indentées d'un niveau, pagination « Voir plus »
- [ ] **7.2** **Ajouter un commentaire** / répondre : champ en bas, publication → confirmation ; état vide « Aucun commentaire pour le moment. Soyez le premier à réagir. »
- [ ] **7.3** Supprimer son propre commentaire (confirmation)
- [ ] **7.4** **⚑ Signaler cette alerte** : motifs (faux, offensant, information dangereuse, spam, illégal, mauvaise catégorie, mauvaise localisation, doublon, autre) → confirmer → « Merci »
- [ ] **7.5** Signaler un commentaire (même parcours)
- [ ] **7.6** Affichage d'un commentaire modéré (« Ce commentaire a été masqué »)

- [ ] **7.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S5, S9 et S10 jouables de bout en bout.

---

## Phase 8 — Activité + notifications

**But** : retrouver ses contributions et suivre leur traitement (F-13, F-14, F-15 ; CDC §38–§41, §90).

**Décisions UX (benchmark)**
- Mes alertes : chips de statut ; chaque carte affiche la **dernière étape de la timeline** (Bumble, Pinterest)
- Centre de notifications **groupé par date** (Aujourd'hui, Hier…), point non lu, action directe « Voir l'alerte » (Cleo, Tabby)
- Push simulé en bannière en haut de l'écran + équivalent visuel de la vibration (P10)

- [ ] **8.1** PROFILE-01 **Mes alertes** avec filtres : actives, en cours, traitées, expirées, supprimées ; état vide « Vous n'avez encore publié aucune alerte. » + CTA
- [ ] **8.2** **Supprimer mon alerte** : `⋯` → « Supprimer cette alerte ? Elle ne sera plus visible par les utilisateurs. » → Annuler / Supprimer → toast
- [ ] **8.3** Onglets **Mes commentaires**, **Mes votes / interactions**, **Alertes suivies**
- [ ] **8.4** **Suivi du traitement** : faire avancer le statut (horloge simulée ou mode démo) Transmise → En cours de traitement → Traitée
- [ ] **8.5** UI-013 **Centre de notifications** : types (publiée, commentaire, réponse, proche expiration, expirée, modérée, transmise, prise en compte, traitée, alerte à proximité), lu/non lu, tout marquer comme lu, état vide
- [ ] **8.6** **Push simulé** : bannière en haut de l'écran (« ⚠️ Nouvelle alerte à proximité ») + vibration simulée **et** équivalent visuel ; tap → carte centrée → détail

- [ ] **8.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S6, S7 et S8 jouables de bout en bout ; le badge de la cloche se met à jour.

---

## Phase 9 — Profil, paramètres, aide, légal

**But** : maîtrise du compte, de la vie privée et de l'accessibilité (F-16, F-17 ; CDC §42, §44, §91–§94).

**Décisions UX (benchmark)**
- Alertes de proximité : **curseur de rayon avec cercle sur une mini-carte**, puis catégories cochables (Citizen)
- Préférences par type d'alerte : « Afficher sur la carte » / « Me notifier » (Waze)
- Confidentialité : une ligne par permission, avec explication et état « Autoriser › » / « ✓ Autorisé » (Sesame)
- Accessibilité : aperçu en direct de la taille du texte

- [ ] **9.1** UI-014 **Profil** : nom public, statut d'identité, accès à l'activité, liens vers la navigation secondaire
- [ ] **9.2** UI-015 **Paramètres** : Compte · Notifications · Confidentialité · Accessibilité · Sécurité
- [ ] **9.3** **Notifications** : push, alertes locales (activées/désactivées, **distance**, **catégories**), commentaires, réponses, suivi
- [ ] **9.4** UI-016 **Confidentialité / Mes données** : localisation, visibilité du profil, anonymat par défaut, télécharger mes données, demander la suppression (confirmation sur chaque changement sensible)
- [ ] **9.5** UI-017 **Sécurité** : sessions, appareils, déconnexion, **déconnexion de tous les appareils** (confirmation)
- [ ] **9.6** UI-018 **Accessibilité — fonctionnelle dans le prototype** : taille du texte (jusqu'à 200 %), contraste élevé, réduction des animations, notifications visuelles, vibration
- [ ] **9.7** UI-019 **Centre d'aide** (10 rubriques du CDC §91, en accordéon) + UI-020 **Contact support** (formulaire)
- [ ] **9.8** UI-021→023 **Mentions légales, CGU, Politique de confidentialité** (texte d'exemple)
- [ ] **9.9** UI-024 **Suppression du compte** : conséquences, suppression ou anonymisation, double confirmation → retour à l'écran de connexion
- [ ] **9.10** Curseur de rayon avec cercle sur mini-carte pour les alertes de proximité ; préférences par type d'alerte

- [ ] **9.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : changer la taille du texte et le contraste s'applique à toute l'app ; la suppression du compte ramène au parcours de première utilisation.

---

## Phase 10 — États transverses, finitions, recette

**But** : un prototype robuste et présentable (CDC §65, §69, §72, §63, §64).

**Décisions UX (benchmark)**
- États vides utiles, avec chiffre et action : « 0 alerte depuis 24 h · Élargir la zone » (Citizen)
- Hors connexion : bannière persistante, actions grisées avec explication
- Contrôle du **rouge rare** (P6) et test en niveaux de gris : aucune information ne doit se perdre (P10)

- [ ] **10.1** UI-025 **Erreur générale**, UI-026 **Hors connexion** (bannière + écran), UI-027 **Maintenance**, UI-028 **403**, UI-029 **404**
- [ ] **10.2** Vérifier le tableau d'états du CDC §65 écran par écran : vide, chargement, erreur, hors connexion, permission refusée, non connecté
- [ ] **10.3** Feedback de toutes les actions (§67) et confirmation de toutes les actions sensibles (§68)
- [ ] **10.4** Responsive : 375 × 812, 390 × 844, 430 × 932, paysage basique, texte à 200 %
- [ ] **10.5** Accessibilité : contraste AA, focus visible, `aria-label` sur les icônes seules, ordre de tabulation, jamais la couleur seule, `prefers-reduced-motion`
- [ ] **10.6** Mode sombre vérifié sur tous les écrans
- [ ] **10.7** Polissage : transitions, micro-interactions (vote, publication), cohérence des textes (PRD §10.3)
- [ ] **10.8** **Recette des scénarios S1 → S10** (cocher ci-dessous)
- [ ] **10.9** Aucune erreur console ; taille du fichier raisonnable
- [ ] **10.11** Contrôle « rouge rare » écran par écran et test en niveaux de gris
- [ ] **10.10** **Publication de l'artefact** pour la preview + lien partagé

- [ ] **10.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

### Recette des scénarios

| # | Scénario | OK |
|---|---|---|
| S1 | Première utilisation | [ ] |
| S2 | Consultation | [ ] |
| S3 | Signalement positif | [ ] |
| S4 | Signalement négatif | [ ] |
| S5 | Interaction (vote + commentaire) | [ ] |
| S6 | Suppression | [ ] |
| S7 | Alerte proche | [ ] |
| S8 | Traitement | [ ] |
| S9 | Commentaire | [ ] |
| S10 | Signalement d'un contenu | [ ] |

---

## Journal

| Date | Phase | Avancement / décisions |
|---|---|---|
| 2026-10-08 | — | Création du plan de tâches |
| 2026-10-08 | — | Benchmark Mobbin : 10 principes et décisions UX reportés dans chaque phase ; icônes Phosphor intégrées en sprite SVG (CSS jsDelivr bloqué dans les artefacts) ; page Design System `docs/design-system/index.html` créée |
| 2026-10-08 | 0 | Phase 0 terminée : `prototype/src/` (app.jsx, app.css, sprite) assemblé en `prototype/index.html` ; store, routeur à pile, BottomSheet 3 crans (glisser + clavier), modale, toasts, composants de base et 95 Alerte, écrans d'onglets provisoires, bibliothèque de composants, mode démo. Babel chargé depuis jsDelivr (`@babel/standalone@7.26.4`). |
| 2026-10-08 | 0 | Canevas de preview (type Design) : 15 planches liées (clair, sombre, états et composants), bouton Play = prototype cliquable. Sources dans `prototype/canvas/`, CSS par `tools/build_canvas_css.py`. |
| 2026-10-08 | 0 | Essai d'un cadre iPhone sur les planches, abandonné : le canevas ne permet pas de l'afficher uniquement en Play. Règle : chaque phase livre le prototype React **et** le canevas. |
| 2026-10-08 | 0 | **Refonte v2** d'après le benchmark : carte d'accueil illustrée (marqueurs, regroupement, doublons fusionnés, aperçu d'alerte avec vote), cartes d'alerte compactes, Alertes en sections (≤ 5 km / reste du Val-d'Oise), Signaler étape 1 (positif / négatif), Activité (mes alertes), Profil (carte d'identité, réglages groupés). Mentions « phase X » retirées des écrans. Bouton Signaler aligné. React et canevas mis à jour. |
| 2026-10-08 | 0 | Carte d'alerte : photo de nouveau en grand format (16:9, pleine largeur), votes et statut en dessous. React, canevas et Design System mis à jour. |
| 2026-10-08 | 0 | Branches : `main` renommée `master`, `develop` créée depuis `master`, phase 0 sur `phase/0-fondations`, PR vers `develop`. |
| 2026-10-08 | 1 | Phase 1 terminée sur `phase/1-splash-connexion`. Splash (1,3 s) → connexion (FranceConnect en action principale, créer un compte, j'ai déjà un compte, continuer sans compte). FranceConnect simulé (choix du compte → chargement → connecté, identité vérifiée ; échec via le mode démo « Erreur réseau »). Inscription en 4 étapes (informations, code SMS, e-mail, identité) puis création du profil avec aperçu du nom public. Vérification d'identité : en cours, réussie, échouée (→ nouvelle tentative ou vérification manuelle), document refusé, manuelle ; résultat réglable dans le mode démo. Badge d'identité sur le profil, « Vérifier mon identité » si non vérifiée, déconnexion avec confirmation. Mode invité : consultation libre ; signaler, voter et Activité demandent un compte. Erreurs : e-mail déjà utilisé (`deja@exemple.fr`), code invalide (`000000`), échec FranceConnect, hors connexion. Toasts placés sous l'en-tête sur les écrans sans barre d'onglets pour ne pas masquer les boutons. |
| 2026-10-08 | 1 | Canevas : page « Phase 1 · Démarrage et connexion » (44 planches : parcours et états, clair et sombre), Play depuis « Démarrage ». Planche Profil déclinée (vérifié, en cours, non vérifié, sans compte) avec « Se déconnecter ». Feuille de style du canevas re-téléversée. |
| 2026-10-08 | 1 | **Refonte phase 1 d'après le benchmark** (P1 : une question par écran, un seul CTA principal ; Greenlight, Waze). Inscription : nom → numéro → code SMS → e-mail → confirmation → identité, CTA toujours dans le pied d'écran, aperçu « Vous apparaîtrez comme Jean D. » dès l'étape Nom. Connexion : bloc « sans compte » séparé. Boutons uniquement du Design System : `.link-btn` retiré, modificateur `.btn-inline` (ghost aligné) ajouté au DS ; invité : « Se connecter » sur une ligne. Canevas : couleur des `<a class="btn">` corrigée (règle `.a95 a` trop spécifique), planches Code SMS, Confirmation e-mail et E-mail déjà utilisé ajoutées. AGENTS.md : écrans générés à partir du rapport et des fichiers du projet, revue de DA et boutons DS à chaque phase. |
| 2026-10-08 | 2 | Benchmark Mobbin de l'onboarding (`docs/benchmark/onboarding-mobbin.html`, généré par `tools/build_benchmark_onboarding.py`) : 8 enseignements, 8 fiches de flows, matrice, direction artistique et plan de refonte de la phase 2 (présentation 4 écrans, amorce de localisation, commune détectée ou choisie, refus non bloquant, connexion personnalisée). À valider : ordre localisation → commune, carte « Bien démarrer », textes des 4 écrans. |
| 2026-10-08 | 1 | Phase 1 améliorée avec le benchmark onboarding : confidentialité dite sous chaque champ sensible (`PrivacyNote`, Nextdoor), durée annoncée (« 4 étapes, environ 2 minutes », Klima), bénéfices avant la vérification d'identité (`Benefits`, Greenlight/Tinder), illustration de marque aux formes des familles (`Illustration95`), écran final « Bienvenue, Jean ! » avec récapitulatif et alertes proches avant la carte (`Recap`, Greenlight « Success! », Nextdoor). React, Design System et canevas (planches Compte prêt + variante non vérifiée, clair et sombre) mis à jour. |
| 2026-10-08 | 1 | Écran de connexion simplifié (commentaire canevas, références Mobbin Dot, Kit, Lloyds, Breathwrk) : carte plein écran et panneau d'actions ancré en bas (même grammaire que l'accueil), titre court « Votre territoire, votre vigilance. », 3 boutons sans séparateur, explication FranceConnect et mentions en une ligne, « Explorer sans compte » en pastille sur la carte. Cases du code SMS : bordure limitée à la case (`.otp .d`). |
| 2026-10-08 | 1 | Accueil de connexion refait d'après Dot (Mobbin) à la demande : léger dégradé bleu en fond (tokens `--primary-soft` → `--bg`, clair et sombre), marque 95 et titre « Votre territoire, votre vigilance. » centrés, 3 boutons empilés en bas, mentions en une ligne, « Explorer sans compte » en pastille. Carte d'illustration (`AuthHero`, `.auth-hero`) retirée. |
| 2026-10-15 | 1 | Logo officiel intégré (`docs/brand/logo-95-alerte.svg`, composant `Logo95`, « Alerte » en couleur de texte, Gotham remplacé par Montserrat en attendant un logo vectorisé) sur le démarrage et l'accueil de connexion. Démarrage refait d'après Noom (Mobbin, choisi par l'utilisateur) : aplat bleu `#1E40AF` plein écran, logo centré, gyrophare animé, chargement nommé. Proposition d'harmonisation des couleurs logo / app (3 options, B recommandée) dans `docs/brand/proposition-marque.html` (Tailwind compilé par `tools/build_brand_proposal.py`) : **non intégrée, à valider**. |
| 2026-10-15 | 1 | Décisions marque : logo vectorisé reçu (texte en tracés, plus de police à charger) ; démarrage sur **fond blanc** avec logo et halo jaune léger animé (fusion monday.com × Pangea) ; **fond blanc sur tous les écrans** (`--bg` `#FFFFFF`, gris neutres `--surface-2` `#F4F4F5` et `--border` `#E4E4E7`, carte en tons neutres) ; **option B validée** : tokens `--brand-yellow`, `--brand-yellow-ink`, `--on-brand-yellow`, `--brand-yellow-soft` (onglet actif, pastille « nouvelles alertes », fond des illustrations, halo du démarrage) ; le bleu reste la seule couleur d'action. DESIGN_SYSTEM.md §2.1 mis à jour. |
| 2026-10-15 | 1 | Démarrage avec l'animation officielle du logo (`docs/brand/95-alerte-animation.gif`, intégrée par le build) : halo jaune seul (0,7 s) → animation du logo (3 s) → chargement (1,2 s) → transition « smart animate » : le logo glisse et se réduit jusqu'à sa place sur l'accueil, le halo s'efface, titre et boutons apparaissent. Délai splash → accueil porté de 1,6 s à 4,9 s. GIF fondu dans le halo en clair (fond blanc du GIF) ; en sombre et avec animations réduites, logo SVG à la place. Correctif : la pastille « Explorer sans compte » était recouverte par le bloc central (non cliquable). |
| 2026-10-15 | 1 | **Phase 1 validée par l'utilisateur.** Avant la PR : illustrations maison remplacées par **Phosphor Duotone** (composant `Spot`, même bibliothèque que les icônes) ; **smart animate** entre les écrans (View Transitions API, éléments partagés : titre, barre d'étapes, bouton principal, barre d'onglets), règle ajoutée à AGENTS.md pour les phases suivantes ; revue des artefacts (68 planches, liens Play et imports vérifiés, aucun style obsolète). |
| 2026-10-15 | 2 | Phase 2 terminée sur `phase/2-onboarding`. Démarrage → 4 diapositives (titres du CDC, illustrations Phosphor Duotone, pagination par points, « Passer », balayage et flèches du clavier, transitions *smart animate* du logo, du titre, de l'illustration et des points) → amorce de localisation (bénéfices, précision approximative, « Comment ma position est-elle utilisée ? », « Plus tard ») → demande du téléphone simulée → « Vous êtes à Pontoise » (ou « Ce n'est pas ma commune ») → connexion personnalisée avec la commune → carte. Refus : « Localisation désactivée » + choix de la commune + fiche « Activer la localisation » ; position introuvable (mode démo). Choix de commune : recherche, liste avec intercommunalité, aucun résultat, hors zone (« 95 Alerte n'est pas encore disponible dans cette zone. »). Carte sans position : bandeau « Position non définie », recherche « {commune} · changer de commune ». Onboarding non rejoué une fois vu (préférence), « Rejouer l'onboarding » dans le mode démo. Hypothèses à valider : localisation demandée avant la commune ; pas de carte « Bien démarrer » ; textes des diapositives rédigés à partir du CDC. Canevas : 36 planches (page « Phase 2 »). |
| 2026-10-15 | 2 | Benchmark Mobbin « onboardings les mieux dessinés » et plan de refonte : `docs/benchmark/onboarding-refonte.html` (HTML + Tailwind, généré par `tools/build_benchmark_refonte.py`). 12 flows (Headspace, Duolingo, Klima, Life360, Citizen, Tinder, Nextdoor, Blinkist, Lovi, Cosmos, Evernote, Polarsteps/Viator), matrice des patterns, 10 enseignements, DA « vigilance lumineuse » 2.0, audit de la phase 2, parcours cible S1 v2 en 9 écrans, plan en 6 lots (R0–R5), décisions D1–D6 à valider. |
| 2026-10-15 | 2 | Refonte de l'onboarding sur `phase/2b-onboarding-v2` (créée depuis `phase/2-onboarding`, pas encore fusionnée) : 3 pages de présentation (photo + notification réelle, arc, mot surligné), amorce allégée, demande coachée, zone suivie réglable (1/5/10 km), préparation de la carte, réglages illustrés après refus, astuce sur le + et « Bien démarrer 1/3 ». 6 photos générées avec Magnific (Seedream 5 Pro, 2 variantes par page) ; téléchargement refusé par le réseau de l'environnement (pikaso.cdnpk.net) : la carte illustrée sert de fond en attendant. |
| 2026-10-15 | 2 | Photos des 3 pages fournies par l'utilisateur (Pontoise, nid-de-poule, fête de quartier) : originaux dans `docs/brand/onboarding/`, WebP recadrés dans `prototype/src/onboarding/` (27 à 52 Ko), embarqués par le build ; zone photo sous l'arc dimensionnée sur le contenu (écran − 250 px) pour 375, 390 et 430. Canevas : photos en ressources de l'artefact. |
| 2026-10-15 | 2 | Retours sur les pages de présentation : logo et notification retirés de la photo, « Passer » en bouton tertiaire (texte souligné, nouveau `btn-tertiary`), surlignage du mot-clé en sombre remplacé par un trait jaune qui contourne les jambages, points de pagination plus lisibles en sombre. Nouvelle règle : étiquette « New » sur les composants créés pendant la phase (Design System et DESIGN_SYSTEM.md), retirée à la fusion. |
| 2026-10-15 | 2 | PR de la phase 2 (internal-sme/95-Alerte#6) fusionnée dans `develop` ; `develop` fusionnée dans `phase/2b-onboarding-v2`. Étiquettes « New » de la phase 2 retirées du Design System (règle AGENTS.md), celles de la refonte conservées jusqu'à sa fusion. |
| 2026-10-15 | 2 | Une seule phase 2 : la refonte (ex-« 2b ») remplace l'onboarding initial dans `task.md`, le canevas (une page « Phase 2 · Onboarding et territoire ») et le Design System. |
| 2026-10-15 | 2 | Branche renommée `phase/2-onboarding-territoire` (nouvelle PR vers `develop`, l'ancienne fermée). Branches déjà fusionnées à supprimer sur GitHub (suppression refusée depuis la session) : `phase/2-onboarding`, `phase/2b-onboarding-v2`, `claude/ecstatic-mayer-ybg1n7` ; restent `master`, `develop`, `phase/0-fondations`, `phase/1-splash-connexion` et `phase/2-onboarding-territoire`. |
| 2026-10-15 | 3 | Branche `phase/3-carte` créée depuis `develop`. Benchmark Mobbin de la carte (`docs/benchmark/carte-refonte.html`, publié sur https://claude.ai/artifact/6kba372mcvQ1NwGHgXDhDo) : 12 flows (Waze, Airbnb, Too Good To Go, Citizen, Météo Apple, Resy, Turo, Google Arts & Culture, Lime, Forest, Hypelist, Wanderlog), matrice des patterns, 10 enseignements, direction artistique, audit de la carte actuelle, écran cible en 8 états, plan en 6 lots (C0 à C5) aligné sur les tâches 3.1 à 3.11. Décisions E1 à E5 en attente de validation avant le développement. |
| 2026-10-15 | 3 | Phase 3 réalisée selon les recommandations E1–E5 du benchmark : carte SVG du Val-d'Oise (184 communes IGN, 12 intercommunalités, quartiers fictifs de Cergy-Pontoise) générée par `tools/build_map_95.py`, zoom à 4 niveaux, regroupements recalculés, alertes de zone, fiche avec balayage, liste mémorisée, filtres, légende, états. Design System : composants de carte étiquetés « New » ; étiquettes de la phase 2 retirées (fusionnée). Prototype et canevas publiés ; en attente de validation de l'utilisateur. |
| 2026-10-15 | 3 | Retour utilisateur : la cloche sortait de l'écran avec une commune longue (« Franconville ») : la grille de l'en-tête s'élargissait au contenu ; elle tronque maintenant le libellé (« Franconville · rechercher »). Cohérence : l'onglet Alertes reprend les puces et la feuille Filtres de la carte (filtre partagé) ; la carte de l'onboarding (zone suivie, préparation) utilise le même fond réel que l'accueil ; planches du canevas mises à jour. |
| 2026-10-15 | 3 | Correctif : la bibliothèque de composants plantait en exploration sans compte (aperçu « Signalé par … » lisant un utilisateur absent). L'aperçu utilise la personne fictive de démonstration et `publicName` accepte l'absence de compte. |
| 2026-10-16 | 4 | PR de la phase 3 (internal-sme/95-Alerte#13) fusionnée ; branche `phase/4-liste-recherche` créée depuis `develop`, étiquettes « New » de la phase 3 retirées. Benchmark Mobbin de la liste, de la recherche et des filtres (`docs/benchmark/liste-refonte.html`, publié sur https://claude.ai/artifact/E5PPNXtVreNP2fhnQGjy5X) : 12 flows (Uber Eats, Places, Apple Store, Pangea, Skip, Beli, Mindtrip, Gojek, Tock et Hypelist, Citizen, Nextdoor, Swarm), états vides, matrice, 10 enseignements, audit, 8 écrans cibles, plan en 6 lots (L0 à L5, tâches 4.1 à 4.7). Décisions F1 à F5 en attente. |
| 2026-10-16 | 4 | Phase 4 réalisée selon F1 à F5 : AlertCard compacte, fil en sections avec tri (Pertinence, Distance = Autour de moi, Récentes), feuille de filtres complète avec compteur, filtres actifs retirables, recherche sur tout le territoire (lieu centré sur la carte sans changer la zone suivie, récentes), états. Validation vérifiée : « Positives + Culture + 5 km » → 1 alerte sur la liste et sur la carte (alerte de démo ajoutée à Pontoise). Design System : composants étiquetés « New » ; ARCHITECTURE.md : filtre, tri, pertinence et recherche. |
| 2026-10-16 | 4 | Panneau Démo : section « Écrans par phase » (phases 0 à 10, un bouton par écran ou état réalisé, 48 écrans pour les phases 0 à 4 ; phases 5 à 9 « à venir » ; phase 10 : emplacement des scénarios de test S1 à S10 du PRD). Le prototype complet ne change pas : chaque bouton place l'app dans l'état voulu (action `JUMP`). Règle ajoutée dans AGENTS.md : chaque phase complète le catalogue `PHASE_SCREENS`. |
| 2026-10-16 | 5 | PR de la phase 4 (internal-sme/95-Alerte#15) fusionnée ; branche `phase/5-fiche-alerte` créée depuis `develop`. Benchmark Mobbin de la fiche alerte et des votes (`docs/benchmark/fiche-refonte.html`, publié sur https://claude.ai/artifact/P6w33T9qaekfp4AEbFm8RX) : 12 flows (Citizen, Nextdoor, talabat, 7-Eleven / sweetgreen / Superpower, Digg / QUITTR, IMDb / Google Photos, Reddit / Google Photos, Strava / Particle, Lex / X / Medium, Bluesky / Handshake / Amazon, inDrive / Waymo, Orb / Bond), états expirée / supprimée, matrice, 10 enseignements, audit du résumé de la carte, 8 écrans cibles, plan en 6 lots (L0 à L5, tâches 5.1 à 5.11). Décisions G1 à G6 en attente ; aucun développement avant validation. |
| 2026-10-21 | 5 | Phase 5 réalisée selon G1 à G6 : fiche alerte (écran empilé, smart animate depuis le résumé), votes avec question, service et timeline, suivre (opt-in au premier suivi), partager, menu ⋯ et suppression confirmée, écran « Situation urgente ? », doublons, états (chargement, erreur, hors connexion, expirée, supprimée, modérée). Audit corrigé : vote invité → feuille de connexion, un seul toast à la fois (ton info), « 1000 m » → « 1,0 km ». 6 photos générées avec Magnific ; leur téléchargement est bloqué par le réseau de l'environnement (`pikaso.cdnpk.net`) : la fiche montre la mini-carte en attendant. Démo › Écrans par phase : 20 écrans et états ; canevas : 23 planches. |
| 2026-10-21 | 5 | Nouvelle tâche 5.12 demandée par l'utilisateur : choix du fond de carte Plan / Satellite (onboarding étape 3 sur 3, Profil, bouton calques de la carte). Google Earth testé : impossible dans un artefact (scripts, images et cadres Google bloqués, clé d'API, conditions d'utilisation) ; vue satellite construite à partir des images libres Copernicus Sentinel-2 (AWS Open Data, accessibles depuis l'environnement), 2 niveaux (département 25 m, Cergy-Pontoise 10 m), embarquées en WebP (1,4 Mo). Démo › Écrans par phase : 6 écrans de plus ; canevas : 7 planches de plus. |
| 2026-10-21 | 5 | Accès réseau ouvert par l'utilisateur : les 6 photos Magnific sont importées (incendie gare et rue Carnot, nettoyage du parc, nid-de-poule, arbre tombé, halage inondé) ; fiche, vignettes de la liste et visionneuse les affichent. Canevas : planches de la fiche et de la liste régénérées avec les photos (ressources du canevas). |
| 2026-10-21 | 5 | Phase 5 validée par l'utilisateur ; PR `phase/5-fiche-alerte` → `develop`. |
| 2026-10-21 | 6 | PR de la phase 5 (internal-sme/95-Alerte#17) fusionnée ; branche `phase/6-creation-alerte` créée depuis `develop`. Benchmark Mobbin du signalement (`docs/benchmark/signalement-refonte.html`, publié sur https://claude.ai/artifact/XbdECRgJxVVoEgMRzYkjZN) : 12 flows (Google Maps, Waze / Buddy, Apple Maps, Citizen, Bird, Snoonu / Shopee / Glovo, Blinkit / talabat / Apple Maps, Glassdoor, YouTube Studio / Whering / Tripadvisor, Notion Mail / Grailed / Givingli, Spotify / Mindtrip / ABY, Alan / Public / GOAT), états d'envoi et d'erreur, matrice, 10 enseignements, audit, 8 écrans cibles, plan en 6 lots (tâches 6.1 à 6.11). Décisions H1 à H6 en attente ; aucun développement avant validation. |
| 2026-10-21 | 6 | Phase 6 réalisée selon H1 à H6 sur `phase/6-creation-alerte` : parcours en 7 étapes (type, catégorie, lieu à l'épingle fixe, description avec titre proposé, photos simulées, identité, aperçu), publication puis trajet du signalement Vous → 95 Alerte → Analyse → Service (direct avec animations réduites), brouillon gardé et repris, erreurs (réseau, hors connexion, donnée personnelle refusée). Démo › Écrans par phase : 20 écrans et états ; canevas : 21 planches (page « Phase 6 »). Design System : composants étiquetés « New » ; ARCHITECTURE.md : brouillon, géocodage inverse, publication. En attente de validation de l'utilisateur. |
| 2026-10-21 | 6 | Phase 6 validée par l'utilisateur ; PR `phase/6-creation-alerte` → `develop`. Point reporté : proposition d'activer les notifications après la première publication (phase 8). |
| 2026-10-21 | — | Prototype recodé en **code source React** sur `refactor/react-source` : `apps/prototype-web` (Vite 5.4.11, React 18.3.1, TypeScript 5.6.3), 157 modules (un fichier par composant, un dossier par parcours), interfaces de props, store et modèle de données typés, `tsc` sans erreur. Mêmes sources que l'artefact (CSS du Design System par module virtuel, `app.css`, sprite, ressources). Conversion reproductible (`tools/prototype_to_vite/`, analyse Babel). Parité : 94 écrans des phases 0 à 6 identiques (texte et captures, clair et sombre), S3 et S4 joués de bout en bout. À décider : quelle source fait foi pour les phases suivantes. |
| 2026-10-21 | 6 | Tâche 6.12 (demande de l'utilisateur) sur `phase/6-camera-reelle` : vraie caméra quand l'appareil en a une (autorisation du navigateur, aperçu en direct, photo réelle publiée), états autorisation demandée / refusée / indisponible, repli sur la caméra simulée. Testé avec une caméra virtuelle Chromium (accordée, refusée, occupée, absente) dans les deux versions ; parité React + TypeScript : 98 écrans identiques en clair et en sombre. Canevas : 3 planches de plus. Étiquettes « New » de la phase 6 retirées (fusionnée), « CameraState » étiqueté New. Les artefacts claude.ai n'offrent pas de droit caméra à ce compte : dans l'artefact, la caméra reste simulée. |
| 2026-10-21 | 6 | Tâche 6.12 validée par l'utilisateur ; PR `phase/6-camera-reelle` → `develop`. |
