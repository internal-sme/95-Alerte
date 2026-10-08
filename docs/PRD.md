# Product Requirements Document — 95 Alerte

> Source : *CDC Product design — 95 Alerte*. Les références `§n` renvoient aux sections de ce cahier des charges.
> Ce document décrit **ce que l'on construit**. Les règles visuelles sont dans `DESIGN_SYSTEM.md`, la structure technique dans `ARCHITECTURE.md`, les consignes pour l'agent de code dans `AGENTS.md`.

---

## 1. Product Overview

| | |
|---|---|
| **Produit** | 95 Alerte |
| **Description** | Application mobile citoyenne de signalement et de suivi des événements territoriaux. |
| **Vision** | Un outil territorial de **vigilance, d'information et de participation citoyenne** — pas une application de « dénonciation ». Les événements positifs ont une place équivalente aux événements négatifs (§1.1, §85). |
| **Logique UX** | **Je vois → je comprends → je signale ou j'interagis → le bon service reçoit l'information** (§2). |
| **Territoire** | Val-d'Oise (95). Carte volontairement limitée au territoire couvert (§12). |

### Phasage du projet

| Phase | Livrable | Statut |
|---|---|---|
| **Phase A** | **Application mobile citoyenne** — prototype interactif (artefact) | **Prioritaire** |
| Phase B | Back-office d'administration / services (web) | Second temps |

Le CDC recommande de séparer clairement l'application citoyenne (simple : **carte → voir → signaler → interagir**) du back-office, qui porte toute la complexité : routage, modération, territoires, services, statistiques.

---

## 2. Problème

- Le citoyen constate un problème (dépôt sauvage, éclairage défectueux, arbre tombé…) mais **ne sait pas quel service contacter** : municipal, départemental, organisme compétent, adresse email, formulaire (§2).
- Les informations sur ce qui se passe autour de lui sont dispersées et n'ont pas de vue géographique unique.
- Les initiatives positives du territoire (solidarité, culture, sport, actions environnementales) ont peu de visibilité face aux incidents.

## 3. Objectif

Permettre à tout habitant du territoire de :

1. **Comprendre immédiatement « Que se passe-t-il autour de moi ? »** grâce à une carte interactive (§3.2).
2. **Signaler un événement en quelques étapes**, positif ou négatif, anonyme ou identifié (§19).
3. **Interagir** avec les alertes : vote, commentaires, suivi, partage (§31, §32, §79, §80).
4. **Avoir la garantie que le bon service reçoit l'information**, sans connaître l'organisation administrative. 95 Alerte détermine le service destinataire (§35).

Règle métier centrale :
**Signalement → localisation → catégorisation → publication → transmission au service compétent → interaction.**

---

## 4. Target Users

| Persona | Description | Phase |
|---|---|---|
| **Citoyen consultant** | Habitant qui ouvre l'app pour voir ce qui se passe autour de lui. | A |
| **Citoyen alerteur** | Habitant qui signale un événement, en identifié ou en anonyme. | A |
| **Citoyen contributeur** | Habitant qui vote, commente, suit ou partage une alerte. | A |
| Administrateur / modérateur | Modère les alertes, commentaires et utilisateurs. | B |
| Service compétent | Reçoit les signalements routés et met à jour leur statut de traitement. | B |

Contexte d'usage : smartphone, **utilisation à une main, en mobilité**, consultation et signalement rapides (§3.1).

---

## 5. Core Features — Application mobile (Phase A)

### F-01 · Démarrage et onboarding (§6, §7)
- Splash screen court : logo, chargement éventuel, version (UI-001).
- 4 écrans d'onboarding :
  1. « Que se passe-t-il autour de vous ? »
  2. « Un problème ? Signalez-le. »
  3. « Une bonne nouvelle ? Partagez-la aussi. »
  4. « Votre territoire, votre vigilance. » — CTA **Commencer**
- Choix du territoire (UI-006) et demande de géolocalisation **facultative** (UI-007).

### F-02 · Connexion et identité (§8, §9, §43)
- **FranceConnect** : « Continuer avec FranceConnect », avec une explication de la sécurisation de l'identité.
- **Parcours alternatif** : créer un compte → informations personnelles → vérification téléphone → vérification email → vérification d'identité → compte vérifié.
- États de vérification : en cours, réussie, échouée, document refusé, nouvelle tentative, vérification manuelle éventuelle.
- Statut d'identité affiché : *Identité non vérifiée*, *Vérification en cours*, *✓ Identité vérifiée*. Ce statut n'est pas forcément exposé publiquement sur toutes les interactions.

### F-03 · Carte interactive — HOME-01 (§10 à §16, §71, §75)
- Écran d'accueil = carte, point d'entrée principal (Règle 1).
- Niveaux géographiques : **quartier → ville/commune → intercommunalité/secteur → département**, avec zoom/dézoom.
- Limites visibles : zone couverte, limite départementale, communes, quartiers. Hors zone : « 95 Alerte n'est pas encore disponible dans cette zone. »
- **Marqueurs** par famille : Incident, Vigilance, Événement positif, Information. Chacun combine **icône + forme + couleur** (+ libellé si nécessaire).
- **Clustering** : un compteur (ex. « 12 ») remplace les marqueurs superposés et se divise au zoom (12 → 5 + 7 → alertes individuelles).
- **Ma position** : point « Vous êtes ici ». L'app fonctionne aussi avec une position choisie manuellement.
- Tap sur un marqueur → **bottom sheet** de résumé (catégorie, ville, ancienneté, extrait, votes, commentaires, « Voir le détail »).
- Barre de recherche en haut ; accès aux notifications et au profil.

### F-04 · Recherche (§45) — UI-012
- Recherche par ville, quartier, rue, événement, catégorie.

### F-05 · Filtres (§15, §46)
- **Type** : toutes / positives / négatives.
- **Catégorie** : liste dynamique, administrable (cf. §7 de ce document).
- **Période** : maintenant, dernières 6 h, aujourd'hui, dernières 24 h, personnalisée.
- **Distance** : 500 m, 1 km, 5 km, 10 km, territoire.

### F-06 · Liste des alertes et fil — ALERT-01 (§17, §47, §48, §87, §88)
- Bascule **[ Carte ] [ Liste ]**. La sélection est conservée.
- Carte d'alerte : catégorie, titre, localisation, date/heure, statut, photo éventuelle, nombre de commentaires, score ⬆/⬇, distance éventuelle.
- Onglets : **Toutes / Positives / Négatives**. Fil optionnel : À proximité, Récentes, Populaires, Positives, Négatives.
- Écran **« Autour de moi »** : distance, catégorie, heure, importance, statut.
- Classement combinant **proximité, récence, pertinence, catégorie, importance et engagement**. Il ne repose jamais uniquement sur les votes.

### F-07 · Création d'une alerte — ALERT-02 (§19 à §25)
Parcours rapide, CTA central **+ Signaler** (Règle 2) :

```
+ Signaler → Type → Catégorie → Localisation → Description → Photo/vidéo
          → Identifié ou anonyme → Prévisualisation → Envoyer
```

| Étape | Contenu |
|---|---|
| Type | « Que souhaitez-vous signaler ? » — 🟢 Un événement positif / 🔴 Un événement négatif |
| Catégorie | Liste filtrée selon le type |
| Localisation | Utiliser ma position · Choisir sur la carte · Rechercher une adresse → affichage de l'adresse → **Confirmer cette position** |
| Description | **Titre** (ex. « Arbre tombé sur la chaussée ») + **Description** libre (aide : « Décrivez brièvement ce que vous avez constaté. ») |
| Médias | Prendre/sélectionner une photo, enregistrer/sélectionner une vidéo. États : aperçu, suppression, remplacement, compression, chargement, erreur d'upload |
| Identité | « Comment souhaitez-vous publier votre signalement ? » ○ Publier avec mon profil ○ Publier anonymement — « Votre choix détermine ce qui sera visible par les autres utilisateurs. » |
| Prévisualisation | Catégorie, lieu, description, photo, mode de publication, **durée : 24 heures** — CTA **Publier l'alerte** (avec confirmation) |
| Confirmation | « ✓ Votre alerte a été publiée. » puis « ✓ Votre signalement a été transmis au service compétent. » |

### F-08 · Fiche alerte — ALERT-03 (§30, §26, §36)
- **En-tête** : catégorie, type, titre, date, durée restante (« Cette alerte sera visible pendant encore 17 h 32 »), localisation.
- **Contenu** : description, photos, vidéos.
- **Engagement** : vote ⬆/⬇, nombre de commentaires.
- **Service** : « Signalement transmis au service compétent » et timeline de statut.
- Actions : suivre, partager, signaler l'alerte (⚑), supprimer (si auteur).

### F-09 · Votes (§31)
- ⬆ **confirmer / soutenir**, ⬇ **contester / indiquer un désaccord**. Le vote n'est pas présenté comme un « like » : il mesure la perception du signalement.
- **Un vote par utilisateur et par alerte**, modifiable.

### F-10 · Commentaires — ALERT-04 (§32, §33)
- Chaque commentaire affiche : contenu, auteur ou anonyme selon la règle, date, vote éventuel.
- Actions : répondre, signaler, supprimer son propre commentaire (avec confirmation).
- État vide : « Aucun commentaire pour le moment. **Soyez le premier à réagir.** »

### F-11 · Signalement d'un contenu (§34, §83, §84)
- **⚑ Signaler cette alerte** — motifs : contenu faux / faux signalement, contenu offensant ou inapproprié, information dangereuse, spam, contenu illégal, mauvaise catégorie, mauvaise localisation, doublon, autre.
- Même logique pour les commentaires. Parcours : motif → confirmer → « Merci ».

### F-12 · Suppression par l'auteur (§28)
- « Supprimer mon alerte » → « Supprimer cette alerte ? Elle ne sera plus visible par les utilisateurs. » → **Annuler** / **Supprimer**.

### F-13 · Suivi et partage (§79, §80)
- **Suivre cette alerte** : notifications sur les commentaires, le statut, le traitement et l'expiration.
- **Partager cette alerte** via le partage natif (lien, SMS, messageries, réseaux sociaux), dans le respect de la confidentialité.

### F-14 · Activité — PROFILE-01 (§38, §39)
- **Mes alertes**, avec filtres : actives, expirées, supprimées, traitées, en cours. Chaque élément affiche titre, catégorie, localisation, date et statut.
- Mes commentaires, mes votes / interactions, alertes suivies, réponses.

### F-15 · Notifications (§40, §41, §90) — UI-013
- Liées à mes alertes : publiée, commentaire reçu, réponse, proche expiration, expirée, modérée, transmise, prise en compte, traitée.
- **Proximité** (avec consentement) : « ⚠️ Nouvelle alerte à proximité. » Réglages : activée/désactivée, distance, catégories.

### F-16 · Profil, paramètres, confidentialité (§42, §44, §92, §93)
- Profil (UI-014) : informations personnelles, identité vérifiée, accès à l'activité.
- Paramètres (PARAM-01) :
  - **Compte** : informations, email, téléphone, mot de passe, identité.
  - **Notifications** : push, alertes locales, commentaires, réponses, suivi.
  - **Confidentialité** : localisation, visibilité du profil, alertes anonymes, données.
  - **Accessibilité** : taille du texte, contraste, réduction des animations, lecteur d'écran, notifications visuelles, vibration.
  - **Sécurité** : sessions, appareils, déconnexion (dont « tous les appareils »), suppression du compte.
- **Mes données** : profil, alertes, commentaires, interactions, historique. Actions : télécharger mes données, demander la suppression, gérer mes préférences.
- **Suppression du compte** : explication des conséquences, suppression ou anonymisation, confirmation.

### F-17 · Aide, légal, urgence (§50, §91, §94)
- **Centre d'aide** — 10 rubriques : comment signaler, la carte, l'anonymat, la vérification d'identité, supprimer une alerte, signaler un contenu, les votes, la localisation, les notifications, supprimer mon compte.
- Contact support, mentions légales, CGU, politique de confidentialité, cookies si applicable, éditeur, services partenaires.
- **Écran d'information d'urgence** : « 🚨 Situation urgente ? 95 Alerte n'est pas un remplacement des services d'urgence. » CTA éventuel **Appeler les services d'urgence**.

---

## 6. Règles métier

| # | Règle (§103) |
|---|---|
| R1 | La carte est le point d'entrée principal. |
| R2 | Le signalement doit être réalisable rapidement. |
| R3 | Le citoyen n'a pas à connaître l'administration. |
| R4 | Un signalement est routé vers le bon service (catégorie + localisation + type → service). |
| R5 | Les alertes expirent au bout de **24 h**. Une alerte expirée disparaît de la carte active. |
| R6 | Un signalement peut être **anonyme ou identifié**. |
| R7 | Les utilisateurs peuvent commenter. |
| R8 | Les utilisateurs peuvent voter ⬆/⬇ (un vote par alerte, modifiable). |
| R9 | L'auteur peut supprimer son alerte. |
| R10 | L'administrateur peut modérer ou supprimer. |
| R11 | Les événements positifs sont aussi visibles que les négatifs. |
| R12 | La couleur n'est jamais le seul indicateur. |
| R13 | La localisation est une donnée sensible du parcours. |
| R14 | Toute action importante fournit un feedback. |
| R15 | Chaque écran a ses états vide, chargement, erreur et permission. |

### Anonymat (§9, §76, §89)
- **Identité publique ≠ identité connue du système.** Un signalement anonyme reste techniquement traçable par la plateforme, pour la sécurité, la modération et les obligations applicables.
- Affichage public : « Jean D. » (ou nom complet selon le paramétrage) **ou** « Citoyen anonyme » / « Signalement anonyme ».
- Ne **jamais** afficher l'email, le téléphone, l'adresse personnelle ou d'autres données d'identité non destinées au public.

### Précision de localisation (§77, §78)
- Selon le type d'alerte, l'app affiche la rue, le quartier, la zone ou un point approximatif. **Règle métier configurable.**
- Localisation approximative par défaut ; précise seulement lorsque c'est nécessaire.

### Cycle de vie d'une alerte (§26, §27, §51)

| État | Comportement UI |
|---|---|
| Brouillon | Gris |
| Publication en cours | Chargement |
| Active | Couleur normale, compteur d'expiration |
| Proche expiration | « Expire dans 45 min » |
| Transmise | Badge |
| En traitement | Orange |
| Traitée | Vert |
| Expirée | Gris, retirée de la carte active |
| Supprimée | Masquée |
| Modérée | Masquée / badge interne |
| Rejetée | Rouge / information |

### Statuts de transmission (§36)
`Signalement envoyé → Transmis au service compétent → Pris en compte → En cours de traitement → Traité → Clôturé`.
Le niveau de visibilité de ces statuts est configurable par service (phase B).

### Doublons (§81)
Le système peut identifier plusieurs signalements du même événement. Message prévu : « Ces alertes semblent concerner le même événement. »

### Urgence (§49, §50)
Les catégories critiques (🔥 Incendie, ⚠️ Danger immédiat, 🚧 Route bloquée) sont hiérarchisées. L'app **ne doit pas donner l'impression d'être un système officiel de secours** et doit rappeler : « En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés. »

---

## 7. Catégories (§1.1, §15, §18) — administrables

| Famille | Catégories (filtre carte) | Exemples d'événements |
|---|---|---|
| **Négatives** | Incendie, Accident, Voirie, Sécurité, Environnement, Propreté, Nuisance, Travaux, Autre | incendie, accident, route bloquée, danger sur la voie publique, éclairage défectueux, dégradation, dépôt sauvage, inondation, arbre tombé, pollution, mobilier urbain endommagé, animal en danger, situation inhabituelle |
| **Positives** | Solidarité, Culture, Sport, Événement, Environnement, Autre | événement associatif, initiative citoyenne, action solidaire, événement culturel ou sportif, animation locale, amélioration d'un espace public, action environnementale, réussite collective, inauguration, projet local, événement de quartier, information utile |

Une catégorie porte : une icône, une couleur, une famille (positif/négatif), une priorité et un service associé (§58).

---

## 8. User Flows (§95)

| # | Scénario | Parcours |
|---|---|---|
| S1 | Première utilisation | Splash → Onboarding → Autorisation localisation → Connexion → FranceConnect → Accueil / Carte |
| S2 | Consultation | Carte → Zoom quartier → Clic événement → Bottom sheet → Détail → Commentaires |
| S3 | Signalement positif | + → Positif → Catégorie → Localisation → Description → Photo → Identifié → Prévisualisation → Publication → Confirmation |
| S4 | Signalement négatif | + → Négatif → Incendie → Localisation → Photo → Description → Anonyme → Publication → Transmission service |
| S5 | Interaction | Carte → Alerte → ⬆ → Commentaire → Publication |
| S6 | Suppression | Mes alertes → Alerte → ⋯ → Supprimer → Confirmation → Supprimée |
| S7 | Alerte proche | Notification → Ouverture → Carte → Détail alerte |
| S8 | Traitement | Mes alertes → Alerte → Transmise → En cours de traitement → Traitée |
| S9 | Commentaire | Alerte → Commentaires → Ajouter → Publier → Confirmation |
| S10 | Signalement d'un contenu | Alerte → ⋯ → Signaler → Motif → Confirmer → Merci |

Prototype global (§102) : `Onboarding → Connexion → Accueil → Carte → (Alerte → Détail → Vote → Commentaire) | (+ → Signaler → Formulaire) → Notification → Service → Traitement`.

---

## 9. Inventaire des écrans — Application mobile

| ID | Écran | Lot (§97–§100) |
|---|---|---|
| UI-001 | Splash screen | 2 |
| UI-002 → UI-005 | Présentation + Onboarding | 2 |
| UI-006 | Choix du territoire | 2 |
| UI-007 | Autorisation de localisation | 2 |
| UI-008 | Connexion (FranceConnect / identité) | 2 |
| UI-009 | Vérification d'identité | 2 |
| UI-010 | Création du profil | 2 |
| UI-011 / HOME-01 | Accueil — carte + alertes | 2 |
| ALERT-01 | Liste des alertes / Autour de moi | 2 |
| ALERT-02 | Création d'une alerte (multi-étapes) | 2 |
| ALERT-03 | Fiche alerte | 2 |
| ALERT-04 | Commentaires | 3 |
| UI-012 | Recherche | 2 |
| UI-013 | Notifications | 3 |
| PROFILE-01 | Mes alertes / Activité | 3 |
| UI-014 | Profil | 4 |
| UI-015 / PARAM-01 | Paramètres | 4 |
| UI-016 | Confidentialité / Mes données | 4 |
| UI-017 | Sécurité | 4 |
| UI-018 | Accessibilité | 4 |
| UI-019 / UI-020 | Aide / Contact | 4 |
| UI-021 → UI-023 | Mentions légales, CGU, Politique de confidentialité | 4 |
| UI-024 | Suppression du compte | 4 |
| — | Information d'urgence | 2 |
| UI-025 → UI-029 | Erreur, Hors connexion, Maintenance, 403, 404 | 1 (états) |

Lot 1 = fondations (Design System, navigation, carte, composants, états, accessibilité). Lot 2 = parcours citoyen central. Lot 3 = interactions. Lot 4 = profil et paramètres.

---

## 10. Requirements

### 10.1 Fonctionnels
Voir §5 (F-01 à F-17) et §6 (règles métier).

### 10.2 UX — états obligatoires pour chaque écran (§65)
Normal · Chargement · Vide · Erreur · Hors connexion · Pas de localisation · Permission refusée · Alerte expirée · Alerte supprimée · Aucune alerte · Beaucoup d'alertes · Recherche sans résultat · Utilisateur non connecté / connecté · Identité vérifiée / non vérifiée · Signalement en cours / envoyé / refusé · Contenu modéré.

**Confirmation obligatoire** (§68) pour : suppression d'une alerte, d'un commentaire ou du compte, changement de confidentialité, publication, signalement d'un contenu, blocage, déconnexion de tous les appareils.

### 10.3 Microcopy de référence (§66, §67, §69, §71)

| Contexte | Texte |
|---|---|
| Succès publication | ✓ Votre alerte a été publiée. |
| Transmission | ✓ Votre signalement a été transmis au service compétent. |
| Erreur publication | Impossible de publier votre alerte. Vérifiez votre connexion. |
| Upload | Photo ajoutée. |
| Expiration | Cette alerte a expiré. |
| Aucune alerte | Aucune alerte dans cette zone. Revenez plus tard ou élargissez votre zone de recherche. |
| Mes alertes vide | Vous n'avez encore publié aucune alerte. **Signaler un événement** |
| Hors connexion | Vous êtes actuellement hors connexion. Les fonctionnalités dépendantes du réseau sont désactivées ou mises en attente. |
| Carte vide | Aucun événement dans cette zone. |
| Erreur carte | Impossible de charger la carte. |
| Hors territoire | 95 Alerte n'est pas encore disponible dans cette zone. |

### 10.4 Accessibilité (§63, §64)
Contraste suffisant, textes redimensionnables, lecteur d'écran, labels, zones tactiles larges, focus visible, alternatives textuelles, **aucune information transmise uniquement par la couleur, un son ou une vibration**. Toute alerte sonore a un équivalent visuel. Sous-titres et transcription pour les contenus audio.

### 10.5 Performance (§70)
Chargement progressif de la carte et des marqueurs, skeletons, pagination, clustering, compression des photos, chargement différé des images et des commentaires.

### 10.6 Plateforme (§3.1, §72)
- Formats prioritaires : **390 × 844**, 375 × 812, 430 × 932 (portrait).
- À prévoir aussi : paysage, petits écrans, grandes tailles de texte. Tablette secondaire.

### 10.7 Confidentialité et sécurité
Voir §6 (anonymat, précision de localisation). Le partage respecte la confidentialité ; la localisation n'est demandée qu'avec consentement et reste facultative.

---

## 11. Success Metrics

Dérivés des indicateurs prévus au back-office (§60) :

| Indicateur | Mesure |
|---|---|
| Adoption | Nombre total d'alertes publiées, par commune, par jour |
| Équilibre positif/négatif | Ratio alertes positives / négatives (objectif R11) |
| Efficacité du routage | Délai moyen de transmission au service compétent |
| Résolution | Délai moyen de traitement, part d'alertes « Traitée » |
| Engagement | Nombre de commentaires, votes ⬆ et ⬇ |
| Qualité / confiance | Part d'alertes supprimées ou modérées, signalements de contenus |
| Rapidité du signalement | Temps médian entre « + Signaler » et « Publier » (R2) |

---

## 12. Out of Scope

**Hors périmètre de la phase A (prototype mobile)** :
- **Back-office** (§52 à §60) : tableau de bord, alertes, modération, utilisateurs, services, routage, territoires, catégories, statistiques → **phase B**.
- Intégrations réelles : FranceConnect, vérification d'identité, notifications push, envoi aux services, géocodage. Elles sont **simulées** dans le prototype.
- **Envoi différé hors connexion** : le CDC (§69) demande de le définir techniquement avant de le promettre dans l'UI. Le prototype affiche seulement l'état hors connexion.
- Détection automatique (modération, doublons) : affichée comme concept uniquement.

**Hors périmètre du produit** : remplacer les services d'urgence (§49, §50).

---

## 13. Points ouverts (non tranchés par le CDC)

1. Durée de vie de 24 h pour les **événements positifs à date future** (ex. animation dans 5 jours).
2. Faut-il un compte pour **consulter** la carte, ou seulement pour signaler, commenter et voter ?
3. Règle d'affichage de l'auteur des **commentaires** (« auteur ou anonyme selon règle »).
4. Mode d'envoi réel aux services : email, accès agent au back-office, API.
5. Numéros d'urgence affichés et contexte d'apparition du CTA « Appeler les services d'urgence ».
6. Limites des médias : nombre de photos, durée et poids des vidéos.
7. Fonctionnement réel du mode hors connexion.
