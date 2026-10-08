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
| 2 | Onboarding + territoire + localisation | UI-002→007 | ⬜ À faire |
| 3 | Accueil — carte interactive | UI-011 / HOME-01 | ⬜ À faire |
| 4 | Liste des alertes, recherche, filtres | ALERT-01, UI-012 | ⬜ À faire |
| 5 | Fiche alerte + votes | ALERT-03 | ⬜ À faire |
| 6 | Création d'une alerte (+ Signaler) | ALERT-02 | ⬜ À faire |
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

**But** : comprendre le concept en quelques secondes et paramétrer la zone (F-01 ; CDC §7, §16, §77).

**Décisions UX (benchmark)**
- 4 écrans : illustration en aplats (bleu, vert, orange) + titre + 2 lignes max ; pagination par points ; « Passer » toujours visible (Uber, inDrive)
- L'écran 3 (« Une bonne nouvelle ? ») est le plus chaleureux, pour ancrer la place du positif (Waze)
- **Amorce de localisation** avant la demande système : bénéfice, précision approximative par défaut, « Choisir manuellement », « Plus tard » (Greenlight, lululemon)
- **Pas de demande de notifications** dans l'onboarding (reportée, cf. phases 5 et 6) (Transit)

- [ ] **2.1** UI-002 **Présentation** rapide de 95 Alerte
- [ ] **2.2** UI-003→005 **Onboarding en 4 écrans** : « Que se passe-t-il autour de vous ? » · « Un problème ? Signalez-le. » · « Une bonne nouvelle ? Partagez-la aussi. » · « Votre territoire, votre vigilance. » + CTA **Commencer** ; pagination par points, « Passer », balayage
- [ ] **2.3** UI-006 **Choix du territoire** : recherche ou liste de communes du Val-d'Oise ; commune hors zone → « 95 Alerte n'est pas encore disponible dans cette zone. »
- [ ] **2.4** UI-007 **Autorisation de localisation** : explication de l'usage, « Autoriser », « Choisir manuellement », « Plus tard » ; mention de la précision approximative par défaut
- [ ] **2.5** États : permission refusée → choix manuel proposé ; localisation indisponible
- [ ] **2.6** Enchaînement S1 : Splash → Onboarding → Localisation → Connexion → Accueil ; onboarding non rejoué une fois vu

- [ ] **2.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S1 complet de bout en bout jusqu'à l'accueil, avec localisation autorisée **et** refusée.

---

## Phase 3 — Accueil : carte interactive

**But** : l'écran le plus important — « Que se passe-t-il autour de moi ? » (F-03 ; CDC §10–§16, §71, §75).

**Décisions UX (benchmark)**
- Carte claire et désaturée ; marqueurs en formes de famille ; clusters bleus numérotés (Waze)
- Bottom sheet en position **peek** par défaut : « 12 alertes autour de vous » + chips Toutes / Positives / Négatives (Nextdoor)
- **Pilule flottante** « 3 nouvelles alertes » qui recentre la carte au tap (Citizen)
- Tap sur un marqueur → sheet de résumé avec **compteur de confirmations** visible (Waze)
- Alertes de zone (inondation, travaux) dessinées en **polygone translucide** (Nextdoor)
- **Bulle d'aide** sur le + au premier lancement : « Signalez un événement » (Citizen)

- [ ] **3.1** **Carte SVG** du Val-d'Oise : contour départemental, communes, quartiers fictifs, zone hors couverture grisée
- [ ] **3.2** Pan et zoom (gestes + boutons) avec **4 niveaux** : département → intercommunalité → commune → quartier ; libellés selon le niveau
- [ ] **3.3** **Marqueurs** par famille (losange incident, triangle vigilance, cercle positif, carré information) + icône Phosphor de la catégorie ; marqueur sélectionné agrandi ; halo « Urgent » pour les alertes critiques
- [ ] **3.4** **Clustering** : compteurs qui se divisent au zoom (12 → 5 + 7 → individuels) ; tap sur un cluster = zoom
- [ ] **3.5** **Ma position** : bouton, point « Vous êtes ici », halo de précision ; si la localisation est refusée, la position manuelle est utilisée
- [ ] **3.6** En-tête : logo, 🔔 notifications (badge), 👤 profil ; barre de recherche flottante ; bouton filtres
- [ ] **3.7** **Bottom sheet** au tap sur un marqueur : catégorie, ville, ancienneté, extrait, ⬆ ⬇ 💬, « Voir le détail »
- [ ] **3.8** Bascule **[ Carte ] [ Liste ]** conservée entre les visites
- [ ] **3.9** États : chargement initial (skeleton), marqueurs progressifs, « Aucun événement dans cette zone. », « Impossible de charger la carte. », beaucoup d'alertes
- [ ] **3.10** Les alertes expirées n'apparaissent pas sur la carte active
- [ ] **3.11** Pilule « n nouvelles alertes », polygone pour les alertes de zone, bulle d'aide sur le + au premier lancement

- [ ] **3.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S2 jouable jusqu'à la bottom sheet ; lisible en mode clair et sombre ; marqueurs distinguables sans la couleur.

---

## Phase 4 — Liste, recherche et filtres

**But** : alternative à la carte et accès ciblé (F-04, F-05, F-06 ; CDC §15, §17, §45–§48, §87, §88).

**Décisions UX (benchmark)**
- `AlertCard` : icône de famille, titre, « Cergy · 1,2 km · il y a 12 min », badge de statut, ⬆ ⬇ 💬 (Nextdoor)
- Sections « À proximité », « Récentes », « Positives » (Flighty « For you / Major issues »)
- Filtres en sheet : **grille de catégories cochables** (Grab), chips période et distance, bouton « Voir 18 alertes » qui annonce le nombre de résultats
- « Autour de moi » = liste triée par distance (Waze « Reports ahead »)

- [ ] **4.1** Composant **AlertCard** : badges type/catégorie et statut, titre, lieu, distance, ancienneté, photo optionnelle, ⬆ ⬇ 💬, compteur d'expiration
- [ ] **4.2** ALERT-01 **Liste** avec onglets **Toutes / Positives / Négatives**
- [ ] **4.3** Fil : À proximité · Récentes · Populaires ; classement combinant proximité, récence, importance et engagement
- [ ] **4.4** Écran **« Autour de moi »** : distance, catégorie, heure, importance, statut
- [ ] **4.5** UI-012 **Recherche** : villes, quartiers, rues, événements, catégories ; suggestions, recherches récentes, « aucun résultat »
- [ ] **4.6** **Panneau de filtres** (bottom sheet) : type, catégories (dynamiques), période (maintenant / 6 h / aujourd'hui / 24 h / personnalisée), distance (500 m → territoire) ; compteur de résultats, réinitialiser ; filtres partagés entre carte et liste
- [ ] **4.7** États : skeletons, liste vide (« Aucune alerte dans cette zone… »), recherche sans résultat

- [ ] **4.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

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

- [ ] **5.1** ALERT-03 **En-tête** : type, catégorie, titre, date, lieu au niveau de précision autorisé, mini-carte
- [ ] **5.2** **Compteur d'expiration** : « Visible encore 17 h 32 » + barre ; « Expire dans 45 min » ; état expiré
- [ ] **5.3** Contenu : description, galerie photo/vidéo (plein écran, texte alternatif)
- [ ] **5.4** Auteur public : « Jean D. » ou « Citoyen anonyme » — jamais d'email, de téléphone ou d'adresse
- [ ] **5.5** **Votes** ⬆ Confirmer / ⬇ Contester : un vote par alerte, modifiable, compteurs mis à jour, pas de cœur ni de « j'aime »
- [ ] **5.6** **Service** : « Transmis au service compétent » + **timeline** Envoyé → Transmis → Pris en compte → En traitement → Traité → Clôturé
- [ ] **5.7** Actions : **Suivre cette alerte**, **Partager** (feuille de partage simulée : copier le lien, SMS, messageries), menu `⋯`
- [ ] **5.8** Rappel d'urgence sur les catégories critiques + écran **Information d'urgence** (« 95 Alerte n'est pas un remplacement des services d'urgence »)
- [ ] **5.9** Doublons : bandeau « Ces alertes semblent concerner le même événement. » avec liens
- [ ] **5.10** États : alerte expirée (grisée), supprimée (« Cette alerte n'est plus disponible »), modérée
- [ ] **5.11** Sheet d'opt-in aux notifications au premier « Suivre »

- [ ] **5.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S2 complet jusqu'au détail ; S5 jusqu'au vote ; un vote changé met à jour les compteurs partout (carte, liste, fiche).

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

- [ ] **6.1** Stepper « Étape n sur 7 » avec barre de progression, retour arrière, quitter avec confirmation (brouillon)
- [ ] **6.2** **Type** : « Que souhaitez-vous signaler ? » — Un événement positif / Un événement négatif (RadioCards)
- [ ] **6.3** **Catégorie** : grille d'icônes filtrée selon le type ; rappel d'urgence si la catégorie est critique
- [ ] **6.4** **Localisation** : Utiliser ma position · Choisir sur la carte (épingle déplaçable) · Rechercher une adresse → adresse affichée → **Confirmer cette position** ; refus hors territoire
- [ ] **6.5** **Description** : titre (placeholder « Arbre tombé sur la chaussée »), description avec aide et compteur, validation
- [ ] **6.6** **Photo / vidéo** : prendre/sélectionner (simulé avec des visuels fictifs), aperçu, supprimer, remplacer, progression de compression et d'envoi, erreur d'upload + Réessayer, toast « Photo ajoutée. »
- [ ] **6.7** **Identité** : « Comment souhaitez-vous publier votre signalement ? » — Publier avec mon profil / Publier anonymement, avec aperçu de l'affichage public
- [ ] **6.8** **Prévisualisation** : récapitulatif + durée de 24 heures → **Publier l'alerte** (confirmation)
- [ ] **6.9** **Publication** : chargement → « ✓ Votre alerte a été publiée. » → animation de routage (Citoyen → 95 Alerte → Analyse → Service) → « ✓ Votre signalement a été transmis au service compétent. » (nom du service selon la catégorie et la commune)
- [ ] **6.10** L'alerte créée apparaît sur la carte, dans la liste et dans « Mes alertes » ; notification « Alerte publiée »
- [ ] **6.11** Erreurs : « Impossible de publier votre alerte. Vérifiez votre connexion. », publication refusée ; utilisateur non connecté → invitation à se connecter

- [ ] **6.C** Canevas de preview : planches des nouveaux écrans et états (clair + sombre), liens pour Play, sources dans `prototype/canvas/`, publication

**Validation** : S3 (positif, identifié) et S4 (incendie, anonyme, transmission au service) jouables de bout en bout en moins de 60 s.

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
