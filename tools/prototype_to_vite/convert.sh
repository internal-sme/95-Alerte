#!/usr/bin/env bash
# Régénère apps/prototype-web/src/ à partir de prototype/src/app.jsx.
#   1. split.js     : un module par section, un fichier par composant, imports calculés par Babel (portée réelle des noms)
#   2. typeprops.js : une interface <Composant>Props par composant, déduite des valeurs par défaut et des sites d'appel JSX
#   3. fix.py       : corrections ciblées (état de module partagé, paramètres facultatifs, types du store et des données)
# Les fichiers écrits à la main (types.ts, assets.ts, styles.ts, vite-env.d.ts) sont conservés.
# Usage : (cd tools/prototype_to_vite && npm install) && tools/prototype_to_vite/convert.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
SRC="$ROOT/apps/prototype-web/src"
KEEP="$(mktemp -d)"
for f in types.ts assets.ts styles.ts vite-env.d.ts; do cp "$SRC/$f" "$KEEP/"; done
rm -rf "$SRC"
node "$HERE/split.js" "$ROOT/prototype/src/app.jsx" "$SRC"
cp "$KEEP"/* "$SRC/"
node "$HERE/typeprops.js" "$SRC"
python3 "$HERE/fix.py" "$SRC"
echo "apps/prototype-web/src régénéré ; vérifier : (cd apps/prototype-web && npm run typecheck)"
