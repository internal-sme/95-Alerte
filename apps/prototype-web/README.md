# 95 Alerte — prototype en code source React + TypeScript

Le prototype interactif de l'application mobile citoyenne (phase A), sous forme de projet **Vite + React 18 + TypeScript**. Il contient les écrans et les états des phases 0 à 6, avec le même comportement que l'artefact `prototype/index.html` : la parité a été vérifiée (voir plus bas).

```bash
cd apps/prototype-web
npm install
npm run dev         # http://localhost:5173
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + build de production dans dist/
npm run preview     # sert dist/ sur http://localhost:4173
```

Versions exactes : React 18.3.1, Vite 5.4.11, TypeScript 5.6.3, @vitejs/plugin-react 4.3.4.

## Structure de `src/`

| Dossier | Contenu |
|---|---|
| `main.tsx`, `App.tsx`, `ErrorBoundary.tsx` | Point d'entrée, scène (cadre de téléphone), hôtes des feuilles, modales et toasts |
| `types.ts` | Modèle de données (ARCHITECTURE §3) : `Alert`, `Category`, `Commune`, `Draft`, `AppState`, `Action`… |
| `assets.ts`, `styles.ts` | Ressources embarquées (carte, satellite, photos, logo animé) et styles |
| `data/` | Données fictives (`seed.ts` : communes réelles du Val-d'Oise, personnes fictives) et photos de démonstration |
| `store/` | Store unique `useReducer` (`store.ts` : état, reducer, `useStore`, `useActions`), effets (horloge, préférences) |
| `utils/` | Formats (dates, distances), nom public, routage vers le service, cycle de vie à 24 h |
| `components/` | Composants de base du Design System, un fichier par composant (`Button`, `AlertCard`, `VoteBar`…) |
| `navigation/` | Barre d'onglets, en-têtes, feuille, modale, toasts, registre des écrans (`routes.tsx`), transitions *smart animate* |
| `map/` | Carte SVG du Val-d'Oise (`LiveMap`, géométrie et projection dans `geo.tsx`), fond plan ou satellite |
| `filters/` | Filtre unique partagé par la carte et la liste, tri, feuilles de filtres |
| `screens/` | Un dossier par parcours : `auth` (phase 1), `onboarding` (2), `home` (3), `alerts` et `search` (4), `detail` (5), `report` (6), `activity`, `profile` |
| `demo/` | Panneau de démo, catalogue « Écrans par phase » (`catalog.ts`), bibliothèque de composants |

Chaque composant a une interface de props (`ButtonProps`, `AlertCardProps`…). Le store est typé (`AppState`, `Action`). Imports avec l'alias `@/` (= `src/`).

## Sources partagées avec l'artefact

Rien n'est copié : le projet lit les mêmes fichiers que `tools/build_prototype.py`.

- **Tokens et composants CSS** : `docs/design-system/index.html` (entre les marqueurs TOKENS et CHROME), servi par le module virtuel `virtual:design-system.css` (`vite.config.ts`). Le Design System reste la seule source.
- **Styles de l'application** : `prototype/src/app.css`.
- **Icônes** : sprite Phosphor `prototype/src/phosphor-sprite.svg`, inséré dans `index.html` au build.
- **Ressources** : `prototype/src/map-95.json`, `prototype/src/satellite/`, `prototype/src/onboarding/`, `prototype/src/alertes/`, `docs/brand/95-alerte-animation.gif`.

## Conversion depuis `prototype/src/app.jsx`

Le code a été produit à partir de `app.jsx` par `tools/prototype_to_vite/convert.sh`, qui procède en trois étapes :

1. `split.js` découpe le fichier par section et par composant, et calcule les imports à partir de la portée réelle des noms (analyse Babel).
2. `typeprops.js` génère les interfaces de props, déduites des valeurs par défaut et de tous les sites d'appel JSX.
3. `fix.py` applique des corrections ciblées : état de module partagé (`mapMemory`, `feedMemory`, `splashMemory`), paramètres facultatifs, types du store et des données.

La conversion est reproductible : relancée, elle redonne exactement ce dossier. Les fichiers écrits à la main (`types.ts`, `assets.ts`, `styles.ts`, `vite-env.d.ts`) sont conservés.

## Parité vérifiée (phase 6)

- Les 98 écrans et états du catalogue « Écrans par phase » (phases 0 à 6, caméra réelle comprise) ont été ouverts dans l'artefact et dans cette app, en clair et en sombre, à 390 × 844. Le texte est identique, aucune capture ne diffère de plus de 0,2 % des pixels, et aucune erreur n'apparaît dans la console.
- La vraie caméra (6.12) a été testée avec une caméra virtuelle Chromium : autorisation accordée (photo réelle publiée), refusée, caméra occupée, aucune caméra (caméra simulée).
- Les scénarios S3 et S4 (signalement positif identifié, incendie anonyme transmis au service) se jouent de bout en bout, brouillon gardé et repris compris.
