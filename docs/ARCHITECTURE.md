# Architecture — 95 Alerte

> Source : CDC §2, §26–§27, §35–§37, §52–§60, §70, §78, §81–§82.
> Le CDC est un cahier des charges **product design** : il ne fixe pas de stack technique de production. Ce document décrit :
> 1. l'**architecture fonctionnelle cible**, issue du CDC ;
> 2. l'**architecture du prototype mobile** (phase A, artefact), qui est la seule partie à construire maintenant.
> Les choix techniques de production restent **à arrêter** (§7).

---

## 1. System Overview

```
                 ┌──────────────────────────────┐
  CITOYEN ──────▶│  App mobile 95 Alerte         │  Phase A
                 │  carte · signaler · interagir │
                 └──────────────┬───────────────┘
                                │ API (authentifiée)
                 ┌──────────────▼───────────────┐
                 │  Plateforme 95 Alerte         │
                 │  ├─ Alertes & cycle de vie 24h│
                 │  ├─ Analyse & routage         │──────▶ SERVICE COMPÉTENT
                 │  ├─ Modération                │        (propreté, voirie,
                 │  ├─ Notifications             │         technique, sécurité…)
                 │  └─ Territoires & catégories  │               │
                 └──────────────▲───────────────┘               ▼
                                │                         TRAITEMENT
                 ┌──────────────┴───────────────┐        (statuts remontés)
  ADMIN / ──────▶│  Back-office web              │  Phase B
  SERVICES       │  modération · routage · stats │
                 └──────────────────────────────┘
```

Flux métier (§37) : **Citoyen → 95 Alerte → Analyse → Service compétent → Traitement**.

---

## 2. Modules fonctionnels

| Module | Responsabilité | Phase |
|---|---|---|
| **Identité & comptes** | FranceConnect, création de compte, vérification téléphone/email/identité, statut d'identité, sessions et appareils | A (simulé) |
| **Territoires** | Hiérarchie Département → Intercommunalité → Commune → Quartier → Zone ; limite de couverture de la carte | A (données figées) / B (admin) |
| **Catégories** | Liste administrable : icône, couleur, famille ±, priorité, service associé, ordre, archivage | A (figées) / B |
| **Alertes** | Création, médias, publication, anonymat, expiration 24 h, suppression, doublons | A |
| **Engagement** | Votes ⬆/⬇ (1 par utilisateur, modifiable), commentaires et réponses, suivi, partage | A |
| **Signalements de contenu** | Motifs pour les alertes et les commentaires | A (saisie) / B (traitement) |
| **Routage** | Catégorie + territoire (+ type) → service ; règles activables/désactivables | A (simulé) / B |
| **Transmission & suivi** | Statuts Envoyé → Transmis → Pris en compte → En traitement → Traité → Clôturé ; visibilité configurable par service | A (simulé) / B |
| **Modération** | 4 niveaux : signalement utilisateur, détection automatique éventuelle, modération admin, transmission/retrait ; trace de modération | B |
| **Notifications** | In-app et push ; proximité avec consentement (distance, catégories) | A (in-app simulé) |
| **Statistiques** | Indicateurs §60 | B |
| **Données personnelles** | Export, demande de suppression, anonymisation du compte | A (écrans) / B |

---

## 3. Modèle de données (conceptuel)

```
Territory (id, name, level[departement|interco|commune|quartier|zone], parentId, geometry)
Category  (id, label, family[positive|negative], icon, color, priority[normale|elevee|critique],
           locationPrecision[exacte|rue|quartier|zone], order, archived)
Service   (id, name, territoryIds[], categoryIds[], statusVisibility)
RoutingRule (id, categoryId, territoryId, serviceId, active)

User      (id, firstName, lastName, email, phone, identityStatus[non_verifiee|en_cours|verifiee],
           authProvider[franceconnect|local], role[citoyen|moderateur|admin|agent], suspended)
UserSettings (userId, notificationPrefs, proximity{enabled, radius, categoryIds},
           accessibility{textScale, highContrast, reduceMotion, vibration}, profileVisibility)

Alert     (id, authorId, isAnonymous, type[positive|negative], categoryId, title, description,
           location{lat, lng, address, commune, quartier}, displayPrecision,
           status, transmissionStatus, serviceId, createdAt, expiresAt = createdAt + 24h,
           duplicateGroupId?)
Media     (id, alertId, kind[photo|video], url, thumbnailUrl, altText, uploadState)
Vote      (alertId, userId, value[+1|-1], updatedAt)          — unique (alertId, userId)
Comment   (id, alertId, parentId?, authorId, isAnonymous, body, createdAt, status)
Follow    (alertId, userId)
ContentReport (id, targetType[alert|comment], targetId, reporterId, reason, comment, createdAt)
ModerationAction (id, targetType, targetId, actorId, action[masquer|supprimer|bloquer|restaurer], reason, at)
TransmissionEvent (alertId, status, serviceId, at)
Notification (id, userId, kind, alertId?, title, body, read, createdAt)
```

**Séparation identité publique / identité système (§9, §76)** : `Alert.authorId` et `Comment.authorId` sont toujours renseignés côté serveur. L'API publique ne renvoie qu'un objet `publicAuthor` calculé :
- `{ displayName: "Jean D." }` si l'alerte est identifiée ;
- `{ displayName: "Citoyen anonyme" }` sinon.

L'email, le téléphone et l'adresse ne sortent **jamais** dans une réponse publique.

**Précision de localisation (§78)** : l'API publique renvoie la position **dégradée** selon `displayPrecision` (point arrondi ou centroïde du quartier ou de la zone). La position exacte est réservée au service destinataire et à la modération.

---

## 4. Cycle de vie d'une alerte

```
 Brouillon ──publier──▶ Publication en cours ──ok──▶ ACTIVE ──(t ≥ expiresAt)──▶ EXPIRÉE
                               │ ko                    │  │
                               ▼                       │  ├─ auteur ──────────▶ SUPPRIMÉE
                          Erreur (réessayer)           │  └─ admin ───────────▶ MODÉRÉE / REJETÉE
                                                       │
                       transmissionStatus (parallèle) : Envoyé → Transmis → Pris en compte
                                                        → En traitement → Traité → Clôturé
```

- `expiresAt = createdAt + 24 h` (R5). « Proche expiration » quand il reste moins d'1 h.
- Une alerte **expirée** sort de la carte active mais reste visible dans *Mes alertes* et dans le back-office.
- Le statut de **transmission** est indépendant de la visibilité : une alerte peut être expirée sur la carte et « En traitement » côté service.

---

## 5. Data Flows

### 5.1 Créer une alerte (§19, §35)
1. L'app valide le formulaire côté client (type, catégorie, position dans le territoire couvert, titre, description).
2. Les médias sont compressés côté client puis envoyés (progression, gestion d'erreur).
3. Le serveur vérifie l'authentification, valide à nouveau les données et rattache la position au territoire (commune / quartier / zone).
4. **Routage** : cherche la `RoutingRule` active pour (catégorie, territoire), du plus fin au plus large (zone → quartier → commune → interco → département). Résultat : `serviceId`, sinon file « non routée » pour la modération.
5. Contrôle de doublons : même catégorie, proximité et fenêtre de temps → `duplicateGroupId` (§81).
6. Publication → `status = active`, `expiresAt` calculé ; transmission au service → `transmissionStatus = transmis`.
7. Notifications : à l'auteur (publiée, transmise) et aux utilisateurs proches ayant consenti (rayon et catégories).
8. L'UI affiche « ✓ Votre alerte a été publiée. » puis « ✓ Votre signalement a été transmis au service compétent. »

### 5.2 Consulter la carte (§11, §14, §70)
Requête par **emprise visible + niveau de zoom + filtres**. Le serveur (ou le client en prototype) renvoie des **clusters** aux zooms larges et des alertes individuelles aux zooms fins. Chargement progressif ; alertes `active` uniquement.

### 5.3 Voter / commenter
`PUT vote (alertId, value)` est idempotent : la réécriture remplace le vote précédent. Les commentaires sont paginés. Les signalements de contenu alimentent la file de modération.

### 5.4 Tâches planifiées
- Expiration des alertes (passage `active → expiree`) et notification « proche expiration » à H-1.
- Relance éventuelle des transmissions en échec.

---

## 6. Architecture du prototype mobile (Phase A — artefact)

Objectif : un **prototype interactif haute fidélité** de l'app citoyenne couvrant les scénarios S1 à S10 du PRD, sans back-end.

| Élément | Choix |
|---|---|
| Format | **Un fichier HTML unique** publié en artefact (`prototype/index.html`) |
| UI | React 18.3.1 + ReactDOM via `cdnjs.cloudflare.com`, JSX transpilé par Babel standalone 7.x (cdnjs) |
| Styles | CSS inline avec les variables de `DESIGN_SYSTEM.md` (clair/sombre via `prefers-color-scheme` et `data-theme`) |
| Carte | **Carte simulée en SVG** du territoire (contour du Val-d'Oise, communes principales, quartiers fictifs), avec pan/zoom, 4 niveaux, clustering calculé côté client, hors-zone grisé. Aucune tuile externe. |
| Données | Jeux de données **fictifs en mémoire** : communes (Cergy, Pontoise, Argenteuil, Sarcelles, Garges-lès-Gonesse, Montmorency, Enghien-les-Bains, L'Isle-Adam…), catégories, ~30 alertes positives et négatives, commentaires, votes, services et règles de routage |
| Intégrations | **Simulées** : FranceConnect (écran + délai), vérification d'identité (états), géolocalisation (position fictive ou API navigateur si autorisée), upload (progression simulée), push (notifications in-app), transmission (timeline animée) |
| État | Store React unique (`useReducer`) : session, alertes, votes, commentaires, suivis, notifications, préférences |
| Persistance | `localStorage` **uniquement** pour les préférences (thème, taille du texte, onboarding vu), encapsulé dans `try/catch` |
| Navigation | Routeur interne à pile : onglets (Carte, Alertes, Activité, Profil) + écrans empilés + bottom sheets + modales |
| Temps | Horloge simulée pour afficher les compteurs d'expiration et les états « proche expiration » / « expirée » |
| Cadre | Rendu dans un cadre téléphone 390 × 844 sur desktop, plein écran sur mobile |
| Démo | Panneau discret « Mode démo » pour forcer les états : hors connexion, permission refusée, erreur, liste vide, beaucoup d'alertes |

### Structure logique du fichier

```
prototype/index.html
├── <style>         tokens (DESIGN_SYSTEM §2–§4) + composants
├── data            territoires, catégories, services, règles, alertes, commentaires
├── lib             temps relatif, distance, clustering, routage simulé, formatage
├── components      Button, Chip, Card, BottomSheet, Modal, Toast, Skeleton, EmptyState,
│                   AlertCard, AlertMarker, ClusterMarker, VoteBar, Comment, Timeline,
│                   ExpirationCounter, LocationField, UploadTile, StatusBadge, TabBar
├── screens         Splash, Onboarding, Territory, LocationPermission, Login, FranceConnect,
│                   IdentityVerification, ProfileCreation, MapHome, AlertList, Search,
│                   Filters, AlertDetail, Comments, CreateAlert (stepper), Activity,
│                   Notifications, Profile, Settings, Privacy, Security, Accessibility,
│                   Help, Legal, DeleteAccount, Emergency, ErrorStates
└── App             store, routeur, cadre téléphone, mode démo
```

---

## 7. Stack de production — à arrêter

Le CDC ne prescrit pas de technologie. Décisions à prendre avant le développement réel :

| Sujet | Contraintes issues du CDC |
|---|---|
| App mobile | iOS + Android, caméra/vidéo, géolocalisation, push, partage natif, accessibilité native (lecteurs d'écran, taille du texte) |
| Back-end / API | Authentification forte, autorisation côté serveur, tâches planifiées (expiration), file de modération |
| Base de données | Requêtes géospatiales (emprise, rayon, rattachement territorial, clustering) |
| Stockage médias | Photos et vidéos compressées, miniatures |
| Identité | FranceConnect + prestataire de vérification d'identité |
| Cartographie | Fond de carte, géocodage d'adresse, limites administratives |
| Notifications | Push iOS/Android, ciblage par proximité avec consentement |
| Back-office | Application web (phase B) |
| Conformité | RGPD : export, suppression/anonymisation, minimisation de la localisation |

---

## 8. Scalabilité et qualité (§70)

- **Carte** : clustering côté serveur, requêtes par emprise, cache des tuiles et des clusters par zoom.
- **Listes** : pagination ou défilement infini ; skeletons.
- **Médias** : compression côté client, miniatures, chargement différé.
- **Commentaires** : chargement paginé.
- **Expiration** : tâche planifiée et index sur `expiresAt`.
- **Observabilité** : délai de transmission et délai de traitement mesurés dès l'origine (indicateurs §60).
- **Hors connexion (§69)** : comportement à spécifier avant de le promettre dans l'UI. Le prototype n'affiche que l'état hors connexion.
