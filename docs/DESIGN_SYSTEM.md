# Design System — 95 Alerte

> Source : CDC §3, §13, §51, §61–§64, §73–§75. Les valeurs chiffrées (couleurs, tailles) sont une **proposition de départ**, conforme aux exigences du CDC (contraste, couleur jamais seule, mobile first). Elles pourront être remplacées par une charte graphique officielle.
> Règle d'or : **réutiliser un composant existant avant d'en créer un nouveau.**

---

## 1. Direction

- **Civique, fiable, calme.** Un outil territorial de vigilance et de participation, pas une app de « dénonciation » ni un système officiel de secours (§1.1, §49).
- **Lisible en mobilité** : utilisable à une main, en un coup d'œil, en extérieur.
- **Positif = négatif en visibilité** (R11) : les bonnes nouvelles ont le même poids visuel que les incidents.
- **Non anxiogène** : le rouge est réservé aux incidents réels et aux erreurs, pas à la décoration.
- **La carte d'abord** : le reste de l'interface s'efface devant elle (bandeau compact, bottom sheets).

---

## 2. Couleurs

### 2.1 Tokens de base

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0B1220` | Fond de l'application (blanc sur tous les écrans) |
| `--surface` | `#FFFFFF` | `#111A2E` | Cartes, sheets, barres |
| `--surface-2` | `#F4F4F5` | `#1A2540` | Champs, puces, zones secondaires |
| `--border` | `#E4E4E7` | `#273452` | Séparateurs, contours |
| `--text` | `#0F172A` | `#F1F5F9` | Texte principal |
| `--text-muted` | `#475569` | `#A3B1C6` | Texte secondaire (≥ 4.5:1) |
| `--primary` | `#1E40AF` | `#7AA2FF` | Marque, CTA principal, liens, focus |
| `--on-primary` | `#FFFFFF` | `#0B1220` | Texte sur `--primary` |
| `--focus-ring` | `#2563EB` | `#93B4FF` | Anneau de focus (2 px + 2 px d'offset) |
| `--brand-yellow` | `#F0C009` | `#F0C009` | Jaune du logo : accent de marque (onglet actif, pastille « nouveau », halo du démarrage, fond des illustrations). **Jamais pour du texte sur blanc** (1,7:1) |
| `--brand-yellow-ink` | `#7A5E00` | `#F0C009` | Texte ou contour jaune lisible (6,1:1 sur blanc) |
| `--on-brand-yellow` | `#1E1E1C` | `#1E1E1C` | Texte posé sur `--brand-yellow` (9,7:1) |
| `--brand-yellow-soft` | jaune 16 % | jaune 18 % | Fond doux (illustrations) |

**Marque (option B, validée le 15/10/2026)** : le bleu `--primary` reste la seule couleur d'action (boutons, liens, focus, progression). Le jaune du logo est l'accent de marque, rare. Le rouge du logo (`#E6282F`) reste dans le logo : dans l'interface, le rouge est réservé aux incidents. Logo : `docs/brand/logo-95-alerte.svg`, composant `Logo95`.

### 2.2 Familles d'alertes (§13)

| Famille | Token | Clair | Sombre | Forme du marqueur | Icône |
|---|---|---|---|---|---|
| **Incident** | `--alert-incident` | `#B91C1C` | `#F87171` | **Losange** | `!` / icône catégorie |
| **Vigilance** | `--alert-vigilance` | `#C2410C` | `#FB923C` | **Triangle** | `⚠` / icône catégorie |
| **Positif** | `--alert-positive` | `#15803D` | `#4ADE80` | **Cercle** | `★` / icône catégorie |
| **Information** | `--alert-info` | `#0369A1` | `#38BDF8` | **Carré arrondi** | `i` / icône catégorie |

Correspondance avec les types :
- type **positif** → famille Positif ;
- type **négatif** de priorité élevée ou critique (incendie, accident, danger, route bloquée…) → Incident ;
- type **négatif** de priorité normale (dépôt sauvage, éclairage, nuisance…) → Vigilance ;
- information utile, travaux annoncés → Information.

Chaque famille a une teinte de fond légère pour les badges (`--alert-*-soft`) : clair = couleur à 10 % d'opacité, sombre = 18 %.
**Toutes les couleurs pleines ci-dessus ont un contraste ≥ 4.5:1 avec du texte blanc en mode clair.**

### 2.3 États d'alerte (§51) — toujours icône + texte + couleur

| État | Couleur | Icône | Libellé |
|---|---|---|---|
| Brouillon | `--neutral` `#64748B` | ✎ | Brouillon |
| Publication en cours | `--primary` + spinner | ⟳ | Publication… |
| Active | couleur de la famille | ● | Active |
| Proche expiration | `--alert-vigilance` | ⏱ | Expire dans 45 min |
| Transmise | `--primary` | ➜ | Transmise au service |
| En traitement | `--status-progress` `#C2410C` | ◐ | En cours de traitement |
| Traitée | `--status-done` `#15803D` | ✓ | Traitée |
| Expirée | `--neutral` `#64748B` | ⌛ | Expirée |
| Supprimée | masquée | — | — |
| Modérée | masquée / badge interne | 🛡 | Contenu modéré |
| Rejetée | `--status-error` `#B91C1C` | ✕ | Rejetée |

### 2.4 Feedback
`--success #15803D` · `--warning #B45309` · `--error #B91C1C` · `--info #0369A1`. Les versions sombres sont les mêmes que pour les familles.

---

## 3. Typographie

- **Police** : `Inter`, avec repli sur la police système (`-apple-system, "Segoe UI", Roboto, sans-serif`).
- Tailles en `rem` pour suivre le réglage « taille du texte » (§44) jusqu'à **200 %** sans casser la mise en page.

| Style | Taille / Interligne | Graisse | Usage |
|---|---|---|---|
| Display | 28 / 34 | 700 | Onboarding, écrans de confirmation |
| H1 | 22 / 28 | 700 | Titre d'écran |
| H2 | 18 / 24 | 600 | Titre de section, titre d'alerte en fiche |
| H3 | 16 / 22 | 600 | Titre de carte d'alerte |
| Body | 16 / 24 | 400 | Texte courant (minimum pour les descriptions) |
| Body-sm | 14 / 20 | 400 | Métadonnées (ville, « il y a 12 min ») |
| Caption | 12 / 16 | 500 | Badges, compteurs, labels de navigation |

Pas de texte informatif sous 12 px. Les nombres (compteurs, votes, durées) utilisent `font-variant-numeric: tabular-nums`.

---

## 4. Espacements, grille, formes

- **Échelle 4/8** : `4, 8, 12, 16, 24, 32, 48`.
- **Grille mobile** (390 × 844) : 4 colonnes, **marges latérales 16 px**, gouttière 12 px.
- **Rayons** : `--r-sm 8px` (puces, inputs) · `--r-md 12px` (cartes) · `--r-lg 20px` (bottom sheets, modales) · `--r-full` (FAB, avatars, pastilles).
- **Élévation** :
  - `--shadow-1` : cartes, `0 1px 2px rgba(15,23,42,.08)` ;
  - `--shadow-2` : barre de recherche flottante, FAB ;
  - `--shadow-3` : bottom sheet, modale.
  En mode sombre, l'élévation s'exprime par une surface plus claire plutôt que par l'ombre.
- **Zones tactiles** : **48 × 48 px minimum**, avec au moins 8 px entre deux cibles.

---

## 5. Icônes

**Utilise Phosphor Icons pour la maquette.**

- Bibliothèque : [Phosphor Icons](https://phosphoricons.com), paquet `@phosphor-icons/core@2.1.1`, intégré en **sprite SVG** dans la page par `tools/build_phosphor_sprite.py` (les artefacts bloquent les feuilles de style externes). Usage : `<svg class="ph"><use href="#ph-fire"/></svg>`, variante pleine `#ph-fire-fill`. Les noms `ph-…` du tableau restent valables.
- Référence visuelle de toutes les icônes et de tous les composants : `docs/design-system/index.html`.
- Graisse **Regular** par défaut (grille 24 px). **Fill** pour les états sélectionnés (onglet actif, vote choisi) et pour les icônes blanches des marqueurs. **Bold** pour les petites tailles (≤ 16 px).
- **Chaque catégorie a une icône dédiée**, réutilisée dans les marqueurs, cartes, badges, filtres et notifications.

| Catégorie | Phosphor | Catégorie | Phosphor |
|---|---|---|---|
| Incendie | `ph-fire` | Solidarité | `ph-hand-heart` |
| Accident | `ph-car` | Culture | `ph-mask-happy` |
| Voirie | `ph-traffic-cone` | Sport | `ph-soccer-ball` |
| Sécurité | `ph-shield-warning` | Événement | `ph-calendar-star` |
| Environnement | `ph-leaf` | Travaux | `ph-barricade` |
| Propreté | `ph-trash` | Éclairage | `ph-lightbulb` |
| Nuisance | `ph-speaker-high` | Autre | `ph-dots-three` |

| Interface | Phosphor | Interface | Phosphor |
|---|---|---|---|
| Carte | `ph-map-trifold` | Notifications | `ph-bell` |
| Alertes | `ph-list-bullets` | Recherche | `ph-magnifying-glass` |
| Signaler | `ph-plus` | Filtres | `ph-sliders-horizontal` |
| Activité | `ph-pulse` | Ma position | `ph-crosshair` |
| Profil | `ph-user-circle` | Lieu | `ph-map-pin` |
| Vote ⬆ / ⬇ | `ph-arrow-fat-up` / `ph-arrow-fat-down` | Commentaires | `ph-chat-circle` |
| Signaler un contenu | `ph-flag` | Partager | `ph-share-network` |
| Suivre (**New** : était `ph-bookmark-simple`) | `ph-bell` · suivie `ph-bell-ringing-fill` · sans notification `ph-bell-slash` | Expiration | `ph-timer` |
| Identité vérifiée | `ph-seal-check` | Anonyme | `ph-detective` |
| Urgence | `ph-siren` | Hors connexion | `ph-wifi-slash` |
| Zoom + / − | `ph-plus` / `ph-minus` | Légende de la carte | `ph-info` |
| Alerte de zone | `ph-polygon` | Carte indisponible | `ph-cloud-slash` (Duotone) |
| Trier | `ph-arrows-down-up` | Recherche récente | `ph-clock-counter-clockwise` |
| Rue ou lieu | `ph-path` | Quartier | `ph-polygon` |
| Copier le lien (**New**) | `ph-link` | SMS / WhatsApp (**New**) | `ph-chat-text` / `ph-whatsapp-logo` |
| Photos (**New**) | `ph-images` | Service compétent | `ph-buildings` |
| Fond de carte (**New**) | `ph-stack` | | |
| Alerte supprimée / modérée / lien invalide (**New**) | `ph-trash` / `ph-eye-slash` / `ph-link-break` (Duotone) | Situation urgente (**New**) | `ph-siren` (Duotone) |

Toute icône seule (sans texte) porte un `aria-label`.

---

## 6. Navigation (§4, §61, §62)

- **Tab bar** fixe en bas, 5 entrées : **Carte · Alertes · ( + Signaler ) · Activité · Profil**.
- Le bouton **+ Signaler** est central, surélevé, de couleur `--primary`, 56 px, avec le libellé « Signaler » dessous. C'est l'élément le plus visible de l'app.
- **En-tête de la carte** : logo « 95 Alerte » + 🔔 Notifications (avec badge de compteur) + 👤 Profil, puis une barre de recherche flottante.
- Navigation secondaire (depuis Profil) : notifications, paramètres, aide, confidentialité, sécurité, accessibilité, informations légales.
- Écrans enfants : en-tête avec ← Retour, titre centré, action optionnelle `⋯`.

---

## 7. Composants

### 7.1 Génériques (§73)
Les composants créés pendant la phase en cours portent la mention **New** (ici et dans `docs/design-system/index.html`), retirée à la fusion de la phase dans `develop`.

| Composant | Variantes / règles |
|---|---|
| **Button** | Primary, Secondary (contour), Ghost, Tertiary (texte souligné seul), Destructive (`--error`). Hauteur 48 px. États : default, pressed, focus, disabled, loading (spinner + libellé conservé). Un seul bouton Primary par écran. Modificateurs : `btn-block` (pleine largeur, CTA du pied d'écran) et `btn-inline` (Ghost aligné sur le texte, pour une action annexe : « Renvoyer le code », « Mot de passe oublié ? »). Aucun autre style de bouton ou de lien d'action. |
| **PrivacyNote / Benefits / Spot / Recap** | Issus du benchmark onboarding. `PrivacyNote` (cadenas + texte, fond `--surface-2`) sous chaque champ sensible ; `Benefits` (icône dans un carré `--primary-soft` + titre + précision) avant une demande ; `Spot` (illustration ponctuelle : icône **Phosphor Duotone** 60 px dans une pastille de 112 px, fond `--brand-yellow-soft` ou teinte de famille) pour les écrans de confirmation — pas de dessin maison, une seule bibliothèque pour icônes et illustrations ; `Recap` (liste cochée : fait / en attente / info) pour l'écran de fin d'inscription. |
| **PageDots / SearchField / SystemPrompt / MapBanner** | Phase 2. `PageDots` : pagination de l'onboarding, point actif allongé en `--brand-yellow` (jamais la couleur seule : `aria-label` « Écran 2 sur 4 »). `Spot` XL (176 px, icône 96 px) pour les diapositives ; teinte `tone-neutral` (`--surface-2`) pour un état désactivé (localisation refusée). `SearchField` : champ avec loupe intégrée, résultats en *List item* avec sous-titre d'intercommunalité (`li-sub`). `SystemPrompt` : simulation de la demande d'autorisation du téléphone (prototype uniquement). `MapBanner` : bandeau flottant sous la recherche de la carte (« Position non définie »), qui ouvre le choix de commune. |
| **Onboarding (phase 2) : Highlight / StepProgress / ZoneMap / SettingsPreview / StartChecklist / btn-tertiary** | Refonte (rapport `docs/benchmark/onboarding-refonte.html`). Pages de présentation : photo plein cadre (générée avec Magnific, d'après le flow Citizen) sous un arc blanc (`hero-sheet`), sans logo ni carte posée dessus ; « Passer » en `btn-tertiary` (texte souligné, blanc avec ombre sur la photo). `Highlight` (`mark.hl`) : surlignage jaune derrière le mot-clé du titre en clair ; en sombre, trait jaune sous le mot qui contourne les jambages. `StepProgress` : barre jaune + « Étape n sur N ». `ZoneMap` : carte illustrée mise à l'échelle, cercle du rayon (1, 5 ou 10 km). `SettingsPreview` : réglages du téléphone redessinés, encadrés « Exemple ». `StartChecklist` : carte « Bien démarrer n/3 », fermable. Demande système coachée : voile neutre, consigne soulignée, choix recommandé encadré. |
| **Carte (phase 3) : LiveMap / MapLevelTag / MapControls / ViewToggle / AreaShape / MapLegend / SummaryPager / FilterRow / MapError** | Refonte (rapport `docs/benchmark/carte-refonte.html`). `LiveMap` : fond SVG du Val-d'Oise en kilomètres (contours des communes IGN, intercommunalités, quartiers **fictifs** à Cergy, Pontoise, Saint-Ouen-l'Aumône et Osny), hors département hachuré, aucune tuile externe ; déplacement, pincement, molette, double toucher, clavier (flèches, + et −) ; **4 niveaux** (Département < 10 px/km, Intercommunalité < 24, Commune < 60, Quartier) qui choisissent couches et libellés ; regroupements recalculés à l'écran (44 px, 58 px au-delà de 12 marqueurs), toucher = zoom sur le groupe ; marqueur sélectionné hors regroupement et au premier plan. Zone suivie : cercle `--primary` en pointillés. `AreaShape` : polygone à 16 % de `--fam`, contour pointillé. `MapLevelTag` : « Niveau · lieu du centre visible » + échelle. `MapControls` : (i), zoom +/−, recentrage, au-dessus du volet réduit. `ViewToggle` : « Liste » dans l'en-tête du volet, « Carte » flottante sur la liste ; préférence `homeView`. Pilule contextuelle unique : hors territoire > « Voir les alertes ici » > « n nouvelles alertes ». Fiche de sélection (`AlertSummary` + `SummaryPager`) : catégorie, ancienneté, auteur public, lieu et distance, statut, votes, commentaires, « Voir le détail », balayage / flèches / « n sur N ». `MapError` : « Impossible de charger la carte. », Réessayer, Voir la liste. |
| **Liste, recherche et filtres (phase 4) : AlertCard compacte / SortControl / ActiveFilters / FeedSection / FeedEnd / SearchField / SearchResultRow / FilterGroup / FilterFooter** | Refonte (rapport `docs/benchmark/liste-refonte.html`). `AlertCard` : vignette carrée de 72 px à droite seulement s'il y a une photo (F2), étiquette « Urgent » (fond `--fam`) pour les catégories critiques. Fil de l'onglet Alertes : barre (recherche + Filtres) et puces de type collantes, ligne « n alertes » + `SortControl` (puce « ⇅ Pertinence / Distance / Récentes », feuille de tri ; « Autour de moi » = Distance, F1), `ActiveFilters` (puces retirables `chip.is-active` + « Effacer les filtres »), `FeedSection` (intertitre display + « Tout voir » en `btn-tertiary`), `FeedEnd` (« Vous êtes à jour. »). Recherche plein écran : `SearchField` (sans la croix native), groupes Lieux · Alertes · Catégories (petites capitales), `SearchResultRow` (icône de type ou marqueur, saisie en gras, sous-titre), recherches récentes en puces effaçables (F5). Feuille Filtres : `FilterGroup` (titre + contenu), catégories en grille compacte 3 colonnes, période et distance en puces (F4), interrupteur Urgentes, `FilterFooter` collant (« Voir n alertes » + « Tout effacer »). Lieu recherché sur la carte : épingle `--primary` (F3). |
| **New · Fiche alerte et votes (phase 5) : AlertDetail / AlertMiniMap / EmergencyNote / ServiceCard / StatusProgress / StatusTimeline / FollowButton / FollowSheet / ShareSheet / MenuRow / DetailState / EmergencyScreen / PhotoViewer** | Rapport `docs/benchmark/fiche-refonte.html`, décisions G1 à G6. `AlertDetail` (écran empilé, G1) : en-tête de 232 px (photo, ou `AlertMiniMap` au niveau de la rue : zone dessinée, halo pointillé pour une précision « quartier »), boutons ‹ et ⋯ sur fond `--surface` ; corps qui recouvre l'en-tête de `--s-4` (coins `--r-lg`) ; type + « Urgent » + statut, titre `--fs-h1` (le type et le titre portent `view-transition-name` : `alert-type`, `alert-title`), lieu, publication, `ExpirationCounter`. `EmergencyNote` : rappel sur fond `--alert-incident-soft` pour les catégories d'incident, ouvre `EmergencyScreen` (numéros 112, 18, 17, 15, 114 en clair, lieu à indiquer, **un seul** `btn-destructive` « Appeler le 112 » en pied d'écran collant, G3). Votes : question en `h2` + `VoteBar` pleine largeur (fermée si expirée ou hors connexion). `FollowButton` + Partager : deux `btn-secondary` côte à côte (« Suivie » : `aria-pressed`, fond `--primary-soft`). `ServiceCard` : service compétent, `StatusProgress` (6 segments `--primary`, l'étape atteinte cerclée), délai habituel s'il est fourni, « Voir le suivi du traitement » en `btn-tertiary` → feuille `StatusTimeline` (étapes atteintes cochées en `--primary` avec l'heure, étape actuelle en primaire, suite « À venir » en gris). `FollowSheet` (5.11) : trois `RadioCard`. `ShareSheet` : aperçu exact (`share-card`), quatre canaux en pastilles rondes, note de confidentialité. `MenuRow` : icône, libellé, ligne d'aide ; la suppression isolée en `--error` sous un filet. `DetailState` : Spot Duotone neutre + titre + une issue (supprimée, modérée, lien invalide, erreur). `PhotoViewer` : fond noir, « 1 sur 2 », points, texte alternatif affiché. Toast `is-info` (icône `ph-info-fill`, `--alert-info`) pour les messages qui ne sont pas des succès ; un seul toast à la fois. |
| **New · Fond de carte (tâche 5.12) : MapStyleChoice / MapStyleSheet / vue satellite** | Deux vignettes vivantes (la vraie carte autour de l'utilisateur) en `radiogroup`, coche `--primary` sur la sélection ; étape 3 sur 3 de l'onboarding (panneau du bas, la carte derrière suit le choix), Profil › Affichage › Fond de carte, feuille « Fond de carte » ouverte par le bouton calques (`ph-stack`) de la carte. Vue satellite (`.is-sat`) : images Copernicus Sentinel-2 sous les couches, aplats masqués, limites et routes en blanc / jaune translucides, libellés blancs sur halo sombre, voile `rgba(15,23,42,.5)` hors du Val-d'Oise, cercle de zone blanc. Les marqueurs et le reste de l'interface ne changent pas. |
| **Input / Textarea** | Label toujours visible au-dessus, aide en dessous, compteur de caractères, états focus / erreur (icône + message) / disabled. |
| **Radio card** | Utilisée pour Positif/Négatif et Profil/Anonyme : grande carte sélectionnable, icône + titre + explication. |
| **Chip** | Filtres (type, catégorie, période, distance) ; sélectionnée = fond plein + ✓. |
| **Segmented control** | [ Carte ] [ Liste ], [ Toutes / Positives / Négatives ]. |
| **Card** | Surface, `--r-md`, `--shadow-1`, padding 16. |
| **Bottom sheet** | Poignée, `--r-lg` en haut, 3 hauteurs (peek / moitié / plein), fermeture par glissement ou bouton. |
| **Modal de confirmation** | Titre en question, texte de conséquence, **Annuler** (secondaire) + action (primaire ou destructive). |
| **Toast / Snackbar** | En bas, au-dessus de la tab bar, icône + texte. Succès 4 s ; erreur persistante avec action « Réessayer ». |
| **Banner** | Hors connexion, maintenance, urgence : pleine largeur sous l'en-tête. |
| **Skeleton** | Blocs `--surface-2` animés (animation désactivée si « réduire les animations »). |
| **Empty / Error state** | Illustration simple, titre, texte, CTA. |
| **Stepper** | Progression du signalement (« Étape 3 sur 7 ») + barre. |
| **List item / Settings row** | Icône, libellé, valeur, chevron ou interrupteur. |
| **Switch** | Libellé à gauche, état annoncé au lecteur d'écran. |

### 7.2 Spécifiques à 95 Alerte (§74, §75)

**Alert Card** (refonte v2, d'après le benchmark : Waze, Nextdoor)
```
┌──────────────────────────────────────────┐
│ ◆  INCENDIE · il y a 12 min              │  ← icône de famille (forme + couleur) · sur-titre catégorie
│    Fumée importante visible rue Carnot   │  ← titre H3, 2 lignes max
│    📍 Pontoise · 1,1 km                  │  ← lieu + distance
│ ┌──────────────────────────────────────┐ │
│ │          photo 16:9, pleine largeur  │ │  ← si l'alerte a une photo
│ └──────────────────────────────────────┘ │
│ ⬆ 24  ⬇ 3  💬 8              [➜ Transmise] │  ← confirmations visibles dès l'aperçu + statut
└──────────────────────────────────────────┘
```
Le statut s'affiche pour les alertes négatives (Transmise, En traitement, Traitée), pour « Expire dans … » et dans « Mes alertes ». Pas de compteur d'expiration dans la liste (il est dans la fiche). Toute la carte est cliquable ; son libellé accessible résume catégorie, titre, lieu, ancienneté et confirmations.

**Carte d'accueil** : fond illustré clair et désaturé (`--map-*`), quartiers, Oise, routes et libellés ; un seul marqueur par événement (les doublons sont fusionnés) ; regroupements bleus à moins de 30 px ; point « Vous êtes ici » ; pilule « n nouvelles alertes » ; bouton de recentrage au-dessus du panneau. Le panneau du bas (hauteur réduite : titre + filtres) liste les alertes à moins de 5 km ; toucher un marqueur ouvre l'aperçu de l'alerte (vote + « Voir le détail »).

**Alert Marker** : forme de la famille (§2.2), 36 px, icône blanche de la catégorie au centre, contour blanc de 2 px. Sélectionné = 44 px + halo. Priorité **critique** = halo pulsé (statique si animations réduites) + mini-libellé « Urgent ».

**Cluster Marker** : cercle `--primary` avec le nombre (« 12 »). Le diamètre croît avec le nombre (32 / 40 / 48 px). Un tap zoome sur la zone.

**Position Marker** : point bleu + halo de précision + libellé « Vous êtes ici ».

**Alert Type Badge** : « ● Positif » / « ◆ Négatif », fond `soft`, texte et icône de la couleur de la famille.

**Alert Status Badge** : voir §2.3.

**Vote Component** : deux boutons ⬆ *Confirmer* / ⬇ *Contester* avec compteurs. Sélectionné = fond plein et `aria-pressed="true"`. Un seul vote actif, modifiable. Libellés explicites, pas de cœur ni de « j'aime ».

**Comment Component** : avatar ou initiales (pictogramme neutre si anonyme), nom public (« Jean D. » / « Citoyen anonyme »), date relative, texte, actions *Répondre · Signaler · ⋯*. Réponses indentées d'un niveau.

**Location Component** : 📍 adresse au niveau de précision autorisé (rue / quartier / zone) + mini-carte + action « Modifier ».

**Service Assignment Component** : « ➜ Transmis au service compétent » + nom du service si sa visibilité est autorisée.

**Alert Timeline** : étapes verticales *Envoyé → Transmis → Pris en compte → En traitement → Traité → Clôturé*. Étape atteinte = icône pleine + date ; étape à venir = contour gris.

**Expiration Counter** : « Visible encore 17 h 32 » + barre de progression sur 24 h. Sous 1 h, il passe en `--alert-vigilance` (« Expire dans 45 min ») ; à expiration, badge « Expirée ».

**Map Bottom Sheet (§75)** : type, catégorie, ville, ancienneté, extrait (2 lignes), votes et commentaires, bouton **Voir le détail**.

**Upload Tile** : vignette avec ✕ supprimer, ↻ remplacer, barre de progression, état d'erreur avec « Réessayer ».

**Emergency Notice** : bandeau `--error` soft : « En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés. » Il apparaît dans le parcours de signalement des catégories critiques et sur l'écran d'urgence.

---

## 8. États (§65, §71)

Chaque écran prévoit : normal, chargement (skeleton), vide, erreur, hors connexion, permission refusée, localisation absente, non connecté.

Cas spécifiques à la carte :
- chargement initial = fond de carte + skeleton ;
- marqueurs affichés progressivement ;
- zone vide = « Aucun événement dans cette zone. » ;
- erreur = « Impossible de charger la carte. » + Réessayer.

Cas spécifiques aux contenus : alerte expirée (contenu grisé + badge), alerte supprimée (écran « Cette alerte n'est plus disponible »), contenu modéré.

---

## 9. Responsive (§72)

| Format | Taille | Règle |
|---|---|---|
| Mobile compact | 375 × 812 | Référence minimale : aucun texte tronqué sans ellipse ; tab bar avec libellés |
| **Mobile** | **390 × 844** | **Format de référence des maquettes** |
| Grand mobile | 430 × 932 | La grille s'élargit ; pas de 2ᵉ colonne |
| Paysage | — | Carte plein écran + bottom sheet latérale ; formulaires scrollables |
| Tablette | ≥ 768 | Secondaire : liste à gauche et carte à droite |

Le prototype navigateur affiche l'app dans un cadre de téléphone de 390 × 844 sur grand écran, et en plein écran sur mobile.

---

## 10. Accessibilité (§63, §64)

- **Contraste WCAG 2.1 AA** : 4.5:1 pour le texte, 3:1 pour les éléments graphiques et les contours de marqueurs.
- **Jamais la couleur seule** (R12) : forme + icône + texte pour les marqueurs, badges, statuts et votes.
- **Texte redimensionnable** jusqu'à 200 %. Réglage **contraste élevé** : bordures renforcées, plus de fonds `soft`.
- **Réduction des animations** : respecte `prefers-reduced-motion` et le réglage interne.
- **Lecteur d'écran** : HTML sémantique, `aria-label` sur les icônes, ordre de focus logique, annonce des toasts (`aria-live="polite"`, `assertive` pour les erreurs), liste de résultats alternative à la carte (la vue Liste).
- **Focus visible** sur tout élément interactif (`--focus-ring`).
- **Malentendants** : tout son ou toute vibration a un équivalent visuel (badge, bannière, toast) ; sous-titres et transcriptions pour les vidéos.
- **Médias** : texte alternatif sur les photos (description de l'alerte par défaut).

---

## 11. Ton et rédaction

- Vouvoiement, phrases courtes, verbes d'action sur les CTA (« Signaler », « Publier l'alerte », « Confirmer cette position »).
- Factuel et rassurant, jamais alarmiste ni culpabilisant.
- Les erreurs disent quoi faire : « Impossible de publier votre alerte. Vérifiez votre connexion. »
- Les textes de référence sont dans `PRD.md` §10.3.
