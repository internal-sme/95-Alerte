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
4. `docs/design-system/index.html` — **référence visuelle** des tokens, icônes et composants (source du CSS du prototype)
5. `docs/task.md` — **plan de développement du prototype, phase par phase** : travailler sur la phase en cours uniquement, cocher les tâches terminées, mettre à jour le statut de la phase et le journal

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

## Livrables à chaque phase — deux versions, toujours

Une phase n'est terminée que lorsque **les deux versions** sont à jour et publiées :
1. **Prototype React** : `prototype/src/` → `python3 tools/build_prototype.py` → `prototype/index.html`, publié sur https://claude.ai/artifact/2cXwSVgCUu2Drs46h1F9hw.
2. **Canevas de preview** (type Design) : une planche `.dc.html` par nouvel écran ou état, en clair et en sombre, reliées entre elles pour le bouton Play, **sans cadre de téléphone** (les planches ne peuvent pas savoir si elles sont affichées sur le canevas ou en Play). Sources dans `prototype/canvas/`, publié sur https://claude.ai/artifact/Sd2XN1KjGF8LzZ1rtBfvm4 (voir `prototype/canvas/README.md`).

## Branches et pull requests — une branche par phase

- `master` : version de référence (anciennement `main`). `develop` : intégration des phases validées (créée depuis `master`).
- **Chaque phase a sa propre branche**, créée depuis `develop` à jour : `phase/<numéro>-<nom-court>` (ex. `phase/1-splash-connexion`). Tout le travail de la phase (React, canevas, docs, `task.md`) y est commité et poussé.
- **Ne pas ouvrir la pull request de soi-même.** Quand la phase est terminée et publiée (les deux versions), présenter le résultat puis **demander explicitement à l'utilisateur s'il valide la phase**.
- **Seulement après sa validation**, créer la pull request `phase/<n>-…` → `develop`, avec dans la description : le résumé de la phase, les liens du prototype React et du canevas, les tâches cochées de `task.md` et les points restant ouverts.
- La phase suivante démarre d'une nouvelle branche créée depuis `develop` (une fois la PR précédente fusionnée, ou depuis la branche de la phase précédente si l'utilisateur le demande).

## Code Guidelines (prototype)

- Livrable : un seul fichier `prototype/index.html`, **généré** par `python3 tools/build_prototype.py` à partir de `prototype/src/` (`app.jsx`, `app.css`, `phosphor-sprite.svg`) et du CSS de `docs/design-system/index.html`. On modifie `prototype/src/`, jamais `index.html` à la main. Scripts : React 18.3.1 + ReactDOM depuis `cdnjs.cloudflare.com`, Babel `@babel/standalone@7.26.4` depuis `cdn.jsdelivr.net/npm/`, toujours avec des **versions exactes**. Icônes Phosphor intégrées en **sprite SVG** dans la page (généré par `tools/build_phosphor_sprite.py` depuis `@phosphor-icons/core@2.1.1`) : les artefacts bloquent les feuilles de style jsDelivr. Aucune autre ressource externe : pas de tuiles de carte, pas de polices hors Google Fonts.
- Le CSS des tokens et des composants vient de `docs/design-system/index.html` : le reprendre tel quel, et y ajouter tout nouveau composant avant de l'utiliser.
- Composants fonctionnels React, petits et réutilisables ; noms en anglais PascalCase (`AlertCard`, `VoteBar`), textes UI en français.
- Un store unique (`useReducer`) ; pas de duplication d'état.
- Données fictives regroupées dans une section `data`, avec des noms de communes réels du Val-d'Oise et des **personnes fictives**.
- `localStorage` seulement pour les préférences, toujours dans un `try/catch` : l'app doit fonctionner sans.
- Pas de dépendance ajoutée sans nécessité.

## Design Rules

- Tokens, typographie, espacements, rayons : **uniquement** ceux de `DESIGN_SYSTEM.md` (variables CSS sur `:root`, mode sombre inclus).
- **Utilise Phosphor Icons pour la maquette** (sprite SVG issu de `@phosphor-icons/core@2.1.1`, usage `<svg class="ph"><use href="#ph-fire"/></svg>`), avec les correspondances d'icônes de `DESIGN_SYSTEM.md` §5. Pas d'emoji ni d'autre bibliothèque d'icônes dans l'interface.
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

Prototype :
```bash
python3 tools/build_prototype.py   # régénère prototype/index.html depuis prototype/src/
npx serve prototype                # ou : python3 -m http.server -d prototype 8080
# icônes : npm pack @phosphor-icons/core@2.1.1 && tar xzf phosphor-icons-core-2.1.1.tgz
#          python3 tools/build_phosphor_sprite.py package/assets > prototype/src/phosphor-sprite.svg
```
Les commandes de l'application de production (pnpm + Turborepo) seront fixées à l'initialisation du monorepo ; stack proposée dans ARCHITECTURE §7.

## Boundaries — demander avant de

- Changer l'architecture ou la stack, ou ajouter une dépendance.
- Commencer le back-office (phase B).
- Modifier une règle métier du PRD (durée de 24 h, règles d'anonymat, votes, routage).
- Modifier les tokens du Design System ou la navigation principale.
- Promettre dans l'UI une fonctionnalité non spécifiée (ex. envoi hors connexion, appel d'urgence direct).
