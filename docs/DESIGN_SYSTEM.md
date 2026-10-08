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
| `--bg` | `#F8FAFC` | `#0B1220` | Fond de l'application |
| `--surface` | `#FFFFFF` | `#111A2E` | Cartes, sheets, barres |
| `--surface-2` | `#F1F5F9` | `#1A2540` | Champs, puces, zones secondaires |
| `--border` | `#E2E8F0` | `#273452` | Séparateurs, contours |
| `--text` | `#0F172A` | `#F1F5F9` | Texte principal |
| `--text-muted` | `#475569` | `#A3B1C6` | Texte secondaire (≥ 4.5:1) |
| `--primary` | `#1E40AF` | `#7AA2FF` | Marque, CTA principal, liens, focus |
| `--on-primary` | `#FFFFFF` | `#0B1220` | Texte sur `--primary` |
| `--focus-ring` | `#2563EB` | `#93B4FF` | Anneau de focus (2 px + 2 px d'offset) |

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
| Suivre | `ph-bookmark-simple` | Expiration | `ph-timer` |
| Identité vérifiée | `ph-seal-check` | Anonyme | `ph-detective` |
| Urgence | `ph-siren` | Hors connexion | `ph-wifi-slash` |

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
| Composant | Variantes / règles |
|---|---|
| **Button** | Primary, Secondary (contour), Ghost, Destructive (`--error`). Hauteur 48 px. États : default, pressed, focus, disabled, loading (spinner + libellé conservé). |
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
│ ◆  INCENDIE · il y a 12 min      ┌─────┐ │  ← icône de famille (forme + couleur) · sur-titre catégorie
│    Fumée importante visible      │ img │ │  ← titre H3, 2 lignes max · vignette 64 px si photo
│    rue Carnot                    └─────┘ │
│    📍 Pontoise · 1,1 km                  │  ← lieu + distance
│    ⬆ 24  ⬇ 3  💬 8         [➜ Transmise] │  ← confirmations visibles dès l'aperçu + statut
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
