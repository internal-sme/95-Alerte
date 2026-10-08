# Architecture — 95 Alerte

> Source : CDC §2, §26–§27, §35–§37, §52–§60, §70, §78, §81–§82.
> Le CDC est un cahier des charges **product design** : il ne fixe pas de stack technique de production. Ce document décrit :
> 1. l'**architecture fonctionnelle cible**, issue du CDC ;
> 2. l'**architecture du prototype mobile** (phase A, artefact), qui est la seule partie à construire maintenant ;
> 3. la **stack technique proposée** pour la phase 1 (app mobile) et la phase 2 (back-office), à valider (§7).

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
| Icônes | **Phosphor Icons** en sprite SVG intégré (`@phosphor-icons/core@2.1.1`, généré par `tools/build_phosphor_sprite.py`), correspondances dans `DESIGN_SYSTEM.md` §5 |
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

## 7. Stack technique proposée (à valider)

> Proposition à valider. Elle répond aux contraintes du CDC (carte au centre, données géospatiales, anonymat traçable, localisation sensible, accessibilité) et privilégie un **langage unique, TypeScript**, ainsi qu'un **hébergement en France**.
> **Phase 1** = application mobile citoyenne + l'API dont elle a besoin (correspond à la phase A). **Phase 2** = back-office web (correspond à la phase B).

### 7.1 Vue d'ensemble

```
┌──────────────────────┐      ┌──────────────────────┐
│ App mobile (Phase 1) │      │ Back-office (Phase 2)│
│ React Native + Expo  │      │ React + Vite         │
└──────────┬───────────┘      └──────────┬───────────┘
           │  HTTPS / REST (OpenAPI)     │
           └──────────────┬──────────────┘
                ┌─────────▼─────────┐        ┌────────────────────┐
                │ API NestJS (TS)   │───────▶│ Workers BullMQ     │ expiration 24 h,
                └──┬──────┬──────┬──┘        │ (Redis)            │ routage, notifications,
                   │      │      │           └────────────────────┘ médias, emails
       PostgreSQL 16  Object Storage  Services externes :
       + PostGIS      S3 (médias)     FranceConnect · IGN Géoplateforme · API Adresse
                                      Expo Push (APNs/FCM) · email/SMS · Sentry
```

### 7.2 Organisation du code — monorepo

| Outil | Rôle |
|---|---|
| **pnpm workspaces + Turborepo** | Un seul dépôt, builds et tests en cache |
| `apps/mobile` | Application citoyenne (Phase 1) |
| `apps/api` | API + workers (Phase 1, étendue en Phase 2) |
| `apps/admin` | Back-office (Phase 2) |
| `packages/shared` | Schémas **Zod** (validation commune au client et au serveur), types, constantes métier (durée 24 h, statuts, motifs) |
| `packages/tokens` | Tokens du Design System (couleurs, typo, espacements) partagés entre le mobile et le back-office |
| `prototype/` | Maquette artefact (HTML unique), hors build |

### 7.3 Phase 1 — Application mobile citoyenne

| Besoin (CDC) | Choix | Pourquoi |
|---|---|---|
| iOS + Android, une seule équipe | **React Native + Expo** (SDK stable du moment) + **TypeScript** | Un seul code ; continuité avec le prototype React ; builds et mises à jour via EAS |
| Navigation onglets + pile + modales | **Expo Router** | Navigation par fichiers, liens profonds (partage d'alerte, ouverture depuis une notification) |
| Données serveur, cache, pagination | **TanStack Query** | Cache, re-fetch, pagination infinie, mutations optimistes (votes) |
| État local (session, préférences, brouillon) | **Zustand** + **expo-secure-store** (jetons) / **MMKV** (préférences) | Léger ; les jetons restent dans le stockage sécurisé |
| Formulaires (signalement, profil) | **react-hook-form + Zod** (`packages/shared`) | Mêmes règles de validation côté app et côté API |
| Carte, 4 niveaux, territoire limité | **MapLibre React Native** + fonds **IGN Géoplateforme** (Plan IGN vectoriel) | Open source, sans clé payante, données françaises officielles ; `maxBounds` limité au Val-d'Oise |
| Clustering | **Clusters calculés par l'API** (PostGIS) ; `supercluster` côté client en secours | Performance avec beaucoup d'alertes (§70) |
| Recherche d'adresse | **API Adresse / géocodage Géoplateforme** (BAN) | Gratuite, officielle, couvre rues et communes |
| Géolocalisation facultative | **expo-location** (précision « approximative » par défaut) | Respect de R13 |
| Photo / vidéo | **expo-image-picker**, **expo-camera**, **expo-image-manipulator** (compression), **expo-video** | Compression côté client avant l'envoi (§23, §70) |
| Upload | URL **pré-signées S3**, envoi direct avec progression | Pas de transit des fichiers par l'API |
| Notifications push et proximité | **expo-notifications** + **Expo Push Service** (APNs/FCM) | Une seule intégration pour iOS et Android |
| Partage natif | `Share` (React Native) + liens universels Expo Router | §80 |
| Icônes | **phosphor-react-native** | Cohérence avec la maquette (Phosphor) |
| Accessibilité | API natives RN (`accessibilityLabel`, `accessibilityRole`), `allowFontScaling`, `AccessibilityInfo` (réduction des animations, lecteur d'écran) | §63, §64 |
| Hors connexion | **NetInfo** + bannière ; file d'envoi différé seulement après spécification (§69) | Ne rien promettre de non défini |
| Qualité | ESLint, Prettier, **Jest + React Native Testing Library**, **Maestro** (tests de bout en bout des scénarios S1 à S10) | Les scénarios du CDC deviennent des tests |
| Suivi des erreurs | **Sentry** (région UE) | Diagnostic des plantages |

**API et données nécessaires dès la phase 1**

| Besoin | Choix | Pourquoi |
|---|---|---|
| API | **NestJS** (Node.js LTS, TypeScript), REST documentée en **OpenAPI** | Modules clairs (alertes, votes, commentaires, routage…), garde-fous d'autorisation, client TS généré |
| Base de données | **PostgreSQL 16 + PostGIS** | Requêtes par emprise et par rayon (`ST_DWithin`), rattachement au territoire (`ST_Contains`), clustering, dégradation de la position (§78) |
| ORM | **Drizzle ORM** (+ SQL brut pour PostGIS) | Typé, léger, compatible avec les types géométriques |
| Tâches asynchrones | **BullMQ + Redis** | Expiration à 24 h et rappel à H-1, routage et transmission, notifications de proximité, traitement des médias |
| Médias | **Object Storage S3** (Scaleway ou OVHcloud) ; workers **sharp** (images, miniatures, suppression des métadonnées EXIF) et **ffmpeg** (vidéos) | La suppression des EXIF évite de fuiter la position GPS de l'auteur |
| Authentification | **FranceConnect** (OIDC, via `openid-client`) + comptes locaux (**argon2**, JWT d'accès court + refresh token avec rotation) | §8 |
| Vérification téléphone / email | OTP par SMS et email via un prestataire français (ex. **Brevo**) | §8.2 |
| Vérification d'identité | Prestataire de vérification d'identité **à sélectionner** (ex. Ubble, IDnow), intégré par webhook | États « en cours / réussie / échouée / refusée » (§8.2) |
| Routage | Module NestJS : règles (catégorie × territoire → service) en base, recherche du territoire le plus fin vers le plus large | §35, §56 |
| Transmission aux services (phase 1) | **Email** automatique au service (Brevo), avec lien sécurisé | Opérationnel sans back-office |
| Sécurité | Validation Zod, `helmet`, limitation de débit (`@nestjs/throttler`), RBAC côté serveur, sérialisation publique distincte (aucun email, téléphone ou adresse exposé) | §76, §89 |
| Données de référence | Contours **IGN Admin Express** (communes, EPCI) + **IRIS INSEE** (quartiers), importés dans PostGIS | Carte limitée au territoire, niveaux géographiques (§11, §57) |

### 7.4 Phase 2 — Back-office web

| Besoin (CDC §52 à §60) | Choix | Pourquoi |
|---|---|---|
| Application d'administration | **React + Vite + TypeScript** (SPA) | Outil interne sans enjeu de référencement ; réutilise l'API NestJS et `packages/shared` |
| Routage et données | **TanStack Router + TanStack Query** | Même logique de cache que le mobile |
| UI | **Tailwind CSS + shadcn/ui** (Radix, accessible), alimentés par `packages/tokens` | Composants accessibles, cohérence visuelle avec l'app |
| Tableaux (alertes, utilisateurs, modération) | **TanStack Table** + pagination, tri et filtres côté serveur | Colonnes et filtres des §53 et §59 |
| Carte d'administration et territoires | **MapLibre GL JS** + IGN Géoplateforme ; **Terra Draw** pour dessiner ou éditer les zones | Hiérarchie Département → Interco → Commune → Quartier → Zone (§57) |
| Statistiques | **Apache ECharts** ; agrégats en **vues matérialisées PostgreSQL** rafraîchies par un worker | Indicateurs §60 sans surcharger la base |
| Exports | CSV / XLSX générés par un worker | Statistiques, listes d'alertes |
| Authentification des agents | **ProConnect** (OIDC, agents publics) + email / mot de passe + **TOTP (2FA)** pour les autres comptes | Adapté aux agents des collectivités |
| Rôles | RBAC : super-admin, admin territoire, modérateur, agent de service, lecture seule — limités par territoire | Chaque service ne voit que son périmètre |
| Traçabilité de la modération | Table **audit log** immuable (qui, quoi, quand, motif) | §29, §82 |
| Transmission avancée | Portail agent dans le back-office (statuts Pris en compte → Traité) + **webhooks / API** vers les outils métiers des services | §36 ; complète l'email de la phase 1 |
| Modération automatique (optionnelle) | Filtre de mots interdits, puis classification de texte et d'image si besoin | §82 niveau 2 |
| Détection des doublons | Requête PostGIS (même catégorie, distance < X m, fenêtre de temps) + regroupement validé par un modérateur | §81 |
| Tests | **Vitest** + Testing Library, **Playwright** pour les parcours de bout en bout | Chromium déjà disponible en CI |

### 7.5 Infrastructure et exploitation (Phases 1 et 2)

| Sujet | Choix |
|---|---|
| Hébergement | **Cloud français** : Scaleway ou OVHcloud. Containers (API, workers, back-office), PostgreSQL managé avec PostGIS, Redis managé, Object Storage. Option **SecNumCloud** si le porteur est une collectivité qui l'exige |
| Conteneurs | Docker ; déploiement sur Scaleway Serverless Containers / Kubernetes Kapsule (ou équivalent OVHcloud) |
| CI/CD | **GitHub Actions** (lint, typecheck, tests, build) + **EAS Build / Submit / Update** pour les stores |
| Environnements | `dev` → `staging` → `production`, secrets dans le gestionnaire de secrets de l'hébergeur |
| Observabilité | Sentry (UE), logs structurés (pino), métriques : délai de transmission, délai de traitement |
| Mesure d'audience | **Matomo** auto-hébergé, configuré pour l'exemption de consentement CNIL |
| RGPD | Export des données (worker JSON/ZIP), suppression ou anonymisation du compte, durées de conservation, AIPD |

### 7.6 Ce que la Phase 1 livre sans back-office

Pour que l'app soit exploitable avant la phase 2 :
- catégories, territoires, services et règles de routage chargés par **seed / scripts** versionnés ;
- transmission aux services par **email** ;
- modération minimale par un **script ou un écran d'administration protégé** très simple, jusqu'à la livraison du back-office.

---

## 8. Scalabilité et qualité (§70)

- **Carte** : clustering côté serveur, requêtes par emprise, cache des tuiles et des clusters par zoom.
- **Listes** : pagination ou défilement infini ; skeletons.
- **Médias** : compression côté client, miniatures, chargement différé.
- **Commentaires** : chargement paginé.
- **Expiration** : tâche planifiée et index sur `expiresAt`.
- **Observabilité** : délai de transmission et délai de traitement mesurés dès l'origine (indicateurs §60).
- **Hors connexion (§69)** : comportement à spécifier avant de le promettre dans l'UI. Le prototype n'affiche que l'état hors connexion.
