# Agent Instructions — 95 Alerte

## Project Context

**95 Alerte** est une application mobile citoyenne du Val-d'Oise. Elle permet de voir, sur une carte, les événements positifs et négatifs du territoire, de les signaler (en anonyme ou en identifié), d'interagir avec eux (votes ⬆/⬇, commentaires, suivi, partage) et de les transmettre automatiquement au service compétent.

- **Phase A (en cours)** : prototype interactif de l'**application mobile** citoyenne, sous forme d'artefact HTML unique (`prototype/index.html`).
- **Phase B (plus tard)** : back-office web (modération, routage, services, territoires, catégories, statistiques). **Ne pas le construire en phase A.**

Langue de l'interface et des documents : **français**.

## Before You Start

Lire, dans cet ordre :
1. `docs/PRD.md` — périmètre, fonctionnalités, règles métier, écrans, scénarios, textes de référence
2. `docs/DESIGN_SYSTEM.md` — tokens, composants, états, accessibilité
3. `docs/ARCHITECTURE.md` — modèle de données, cycle de vie, architecture du prototype

Puis inspecter les composants existants du prototype **avant d'en créer un nouveau**.

## General Rules

- La **carte est le point d'entrée** ; le bouton **+ Signaler** est toujours visible et central.
- Respecter les **15 règles métier** (PRD §6), en particulier : expiration à 24 h, anonyme ou identifié, un vote par alerte (modifiable), suppression par l'auteur, routage automatique vers un service.
- Les **événements positifs** ont la même visibilité que les négatifs.
- Chaque écran implémente ses états : **normal, chargement, vide, erreur, hors connexion, permission refusée**.
- Toute action importante donne un **feedback** ; toute action sensible demande une **confirmation** (PRD §10.2).
- Utiliser les textes de référence du PRD §10.3 plutôt que d'en inventer.
- Ne jamais présenter l'app comme un service de secours : afficher le rappel d'urgence pour les catégories critiques.
- En cas de conflit entre documents ou de décision manquante importante (voir PRD §13), **demander** avant de faire une hypothèse majeure. Pour une hypothèse mineure, la signaler dans un commentaire.

## Code Guidelines (prototype)

- Un seul fichier `prototype/index.html`. Scripts depuis `cdnjs.cloudflare.com` (React 18.3.1, Babel standalone 7.x), plus Phosphor Icons depuis `cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1`, toujours avec des **versions exactes**. Aucune autre ressource externe : pas de tuiles de carte, pas de polices hors Google Fonts.
- Composants fonctionnels React, petits et réutilisables ; noms en anglais PascalCase (`AlertCard`, `VoteBar`), textes UI en français.
- Un store unique (`useReducer`) ; pas de duplication d'état.
- Données fictives regroupées dans une section `data`, avec des noms de communes réels du Val-d'Oise et des **personnes fictives**.
- `localStorage` seulement pour les préférences, toujours dans un `try/catch` : l'app doit fonctionner sans.
- Pas de dépendance ajoutée sans nécessité.

## Design Rules

- Tokens, typographie, espacements, rayons : **uniquement** ceux de `DESIGN_SYSTEM.md` (variables CSS sur `:root`, mode sombre inclus).
- **Utilise Phosphor Icons pour la maquette** (`@phosphor-icons/web@2.1.1`), avec les correspondances d'icônes de `DESIGN_SYSTEM.md` §5. Pas d'emoji ni d'autre bibliothèque d'icônes dans l'interface.
- **Jamais la couleur seule** : marqueurs = forme + icône + couleur ; statuts = icône + texte + couleur.
- Zones tactiles ≥ 48 px, focus visible, `aria-label` sur les icônes seules, `aria-live` pour les toasts.
- Respecter `prefers-reduced-motion` et les réglages d'accessibilité internes (taille du texte, contraste, animations).
- Format de référence 390 × 844 ; vérifier aussi 375 × 812 et 430 × 932.

## Security & Privacy Rules

- Ne **jamais** afficher l'email, le téléphone, l'adresse personnelle ou une donnée d'identité non publique d'un utilisateur.
- Affichage public de l'auteur : « Jean D. » ou « Citoyen anonyme ». L'anonymat est public ; la plateforme reste capable de tracer l'auteur.
- La localisation est **facultative** et sensible : demande explicite, choix manuel possible, précision affichée selon la catégorie (rue / quartier / zone).
- Le partage n'expose aucune donnée personnelle.
- Production (plus tard) : secrets en variables d'environnement, validation des entrées côté client **et** serveur, autorisation vérifiée côté serveur.

## Commands

Prototype (aucun build) :
```bash
# servir localement pour le tester
npx serve prototype      # ou : python3 -m http.server -d prototype 8080
```
Les commandes d'installation, de build, de lint et de test de l'application de production seront définies avec la stack (ARCHITECTURE §7).

## Boundaries — demander avant de

- Changer l'architecture ou la stack, ou ajouter une dépendance.
- Commencer le back-office (phase B).
- Modifier une règle métier du PRD (durée de 24 h, règles d'anonymat, votes, routage).
- Modifier les tokens du Design System ou la navigation principale.
- Promettre dans l'UI une fonctionnalité non spécifiée (ex. envoi hors connexion, appel d'urgence direct).
