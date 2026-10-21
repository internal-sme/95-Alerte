// Découpe prototype/src/app.jsx en modules TypeScript (un fichier par composant) pour apps/prototype-web/src.
// Usage : node split.js <app.jsx> <outDir>
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const [, , SRC, OUT] = process.argv;
let code = fs.readFileSync(SRC, 'utf8');
// Ressources embarquées : window.X → ASSETS.X (src/assets.ts)
code = code.replace(/\(typeof window !== "undefined" && window\.(MAP_95|SAT_95|ONB_PHOTOS|ALERT_PHOTOS)\)/g, 'ASSETS.$1');
code = code.replace(/window\.SPLASH_GIF/g, 'ASSETS.SPLASH_GIF');

const SECTIONS = [ // préfixe du titre de section → dossier, fichier des déclarations qui ne sont pas des composants
  ['DATA', 'data', 'seed'], ['UTILS', 'utils', 'index'], ['STORE', 'store', 'store'],
  ['COMPOSANTS DE BASE', 'components', 'helpers'], ['NAVIGATION', 'navigation', 'helpers'],
  ['ÉCRANS — phase 0', 'screens/tabs', 'mapArt'], ['CARTE INTERACTIVE', 'map', 'geo'], ['FILTRES ET TRI', 'filters', 'filters'],
  ["ÉCRAN D'ACCUEIL", 'screens/home', 'helpers'], ['RECHERCHE', 'screens/search', 'search'], ['FIL DE', 'screens/alerts', 'feed'],
  ['PHASE 6', 'screens/report', 'report'], ['PHASE 1', 'screens/auth', 'auth'], ['PHASE 2', 'screens/onboarding', 'onboarding'],
  ['FICHE ALERTE', 'screens/detail', 'detail'], ['ÉCRANS PAR PHASE', 'demo', 'catalog'], ['PANNEAU DE DÉMO', 'demo', 'demoPanel'],
  ['APP', '', 'appHelpers'],
];
const REACT_NAMES = new Set(['useState', 'useReducer', 'useEffect', 'useLayoutEffect', 'useRef', 'useMemo', 'useCallback', 'useImperativeHandle', 'createContext', 'useContext', 'Fragment']);

// Débuts de section
const heads = [];
const re = /^\/\* =+\n\s+(.+)$/gm;
let m;
while ((m = re.exec(code))) {
  const title = m[1].trim();
  const s = SECTIONS.find(([p]) => title.startsWith(p));
  if (s) heads.push({ at: m.index, dir: s[1], helper: s[2], title });
}
const sectionAt = (pos) => { let cur = null; for (const h of heads) if (h.at <= pos) cur = h; return cur; };

const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'], attachComment: true });
// Déplacements : outils transverses rangés à leur place plutôt que dans la section où ils sont nés
const MOVE = {
  motionReduced: 'utils/index', useOnline: 'utils/index', foldChar: 'utils/index', fold: 'utils/index', foldQuery: 'utils/index', normalize: 'utils/index',
  kmToLatLng: 'map/geo',
  Spot: 'components/Spot', Logo95: 'components/Logo95', PrivacyNote: 'components/PrivacyNote',
  ALERT_PHOTOS: 'data/photos', PHOTO_ALT: 'data/photos', alertPhotos: 'data/photos',
  TAB_SCREENS: 'navigation/routes', STACK_SCREENS: 'navigation/routes', SHEETS: 'navigation/routes',
  TABS: 'navigation/constants', SNAP_HEIGHTS: 'navigation/constants',
  SCREEN_ACTIONS: 'navigation/transitions', useScreenTransitions: 'navigation/transitions',
  useClock: 'store/effects', usePrefsEffects: 'store/effects', StoreContext: 'store/store', ClockContext: 'store/store',
  ComponentsScreen: 'demo/ComponentsScreen', DemoSheetContent: 'demo/DemoSheetContent',
  ActivityScreen: 'screens/activity/ActivityScreen', ProfileScreen: 'screens/profile/ProfileScreen',
  MapStyleChoice: 'map/MapStyleChoice', MapStyleSheet: 'map/MapStyleSheet',
  MARKER_SHAPES: 'components/meta', FAMILY_LABEL: 'components/meta', STATUS_META: 'components/meta',
};
const units = []; // { names, start, end, file, jsx, refs:Set }
const owner = new Map(); // nom → unité
const isComponentName = (n) => /^[A-Z][a-z]/.test(n);
let prevSt = null;
for (const st of ast.program.body) {
  let names = [];
  if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') names = [st.id.name];
  else if (st.type === 'VariableDeclaration') {
    if (st.declarations[0].init && st.declarations[0].init.type === 'Identifier' && st.declarations[0].init.name === 'React') continue; // const { useState… } = React
    for (const d of st.declarations) {
      if (d.id.type === 'Identifier') names.push(d.id.name);
      else if (d.id.type === 'ObjectPattern') d.id.properties.forEach((p) => names.push(p.value.name));
      else if (d.id.type === 'ArrayPattern') d.id.elements.forEach((p) => p && names.push(p.name));
    }
  }
  // Commentaires de tête : le bandeau de section reste dans le fichier de la section
  let start = st.start;
  // Commentaire de fin de ligne : il appartient à la déclaration de la même ligne, pas à la suivante
  const prevEndLine = prevSt ? prevSt.loc.end.line : -1;
  const lead = (st.leadingComments || []).filter((c) => !/^\*? =====/.test(c.value) && !/^ =====/.test(c.value) && c.loc.start.line !== prevEndLine);
  if (lead.length) start = lead[0].start;
  let stEnd = st.end;
  (st.trailingComments || []).forEach((c) => { if (c.loc.start.line === st.loc.end.line) stEnd = Math.max(stEnd, c.end); });
  prevSt = st;
  const sec = sectionAt(st.start);
  const isRender = st.type === 'ExpressionStatement' && code.slice(st.start, st.end).startsWith('ReactDOM');
  let file;
  if (isRender) file = 'main';
  else if (names.length === 1 && isComponentName(names[0]) && (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration' ||
    (st.type === 'VariableDeclaration' && /Function|Call/.test(st.declarations[0].init?.type || '')))) file = path.posix.join(sec.dir, names[0]);
  else file = path.posix.join(sec.dir, sec.helper);
  if (names.length && MOVE[names[0]]) file = MOVE[names[0]];
  const u = { names, start, end: stEnd, file, node: st, refs: new Set(), react: new Set(), jsx: false, isRender, sec };
  units.push(u);
  names.forEach((n) => owner.set(n, u));
}

// Références vers les déclarations de premier niveau
const unitOf = (pos) => units.find((u) => u.node.start <= pos && pos < u.node.end);
traverse(ast, {
  JSXElement(p) { const u = unitOf(p.node.start); if (u) u.jsx = true; },
  JSXFragment(p) { const u = unitOf(p.node.start); if (u) u.jsx = true; },
  ReferencedIdentifier(p) {
    const name = p.node.name;
    const b = p.scope.getBinding(name);
    const u = unitOf(p.node.start);
    if (!u) return;
    if (b && b.scope.block.type !== 'Program') return;
    if (REACT_NAMES.has(name)) u.react.add(name);
    else if (name === 'React') u.react.add('default');
    else if (name === 'ASSETS') u.refs.add('ASSETS');
    else if (name === 'ReactDOM') u.refs.add('ReactDOM');
    else if (owner.has(name)) u.refs.add(name);
  },
});

// Regroupement par fichier
const files = new Map();
for (const u of units) {
  if (!files.has(u.file)) files.set(u.file, { units: [], sec: u.sec, isRender: u.isRender });
  files.get(u.file).units.push(u);
}
const out = {};
for (const [file, f] of files) {
  const jsx = f.units.some((u) => u.jsx);
  const ext = jsx || file === 'main' ? '.tsx' : '.ts';
  const react = new Set(); const refs = new Set();
  f.units.forEach((u) => { u.react.forEach((n) => react.add(n)); u.refs.forEach((n) => refs.add(n)); });
  const own = new Set(f.units.flatMap((u) => u.names));
  const byFile = new Map();
  let assets = false; let reactDom = false;
  for (const n of refs) {
    if (n === 'ASSETS') { assets = true; continue; }
    if (n === 'ReactDOM') { reactDom = true; continue; }
    if (own.has(n)) continue;
    const t = owner.get(n).file;
    if (!byFile.has(t)) byFile.set(t, new Set());
    byFile.get(t).add(n);
  }
  const lines = [];
  const named = [...react].filter((n) => n !== 'default').sort();
  if (react.has('default') && named.length) lines.push(`import React, { ${named.join(', ')} } from "react";`);
  else if (react.has('default')) lines.push('import React from "react";');
  else if (named.length) lines.push(`import { ${named.join(', ')} } from "react";`);
  if (reactDom) lines.push('import ReactDOM from "react-dom/client";');
  if (assets) lines.push('import { ASSETS } from "@/assets";');
  for (const t of [...byFile.keys()].sort()) lines.push(`import { ${[...byFile.get(t)].sort().join(', ')} } from "@/${t}";`);
  let body = '';
  if (f.units[0] && !f.isRender && file === path.posix.join(f.sec.dir, f.sec.helper)) {
    // fichier de section : reprendre le bandeau d'origine
    const h = f.sec; const end = code.indexOf('*/', h.at);
    body += code.slice(h.at, end + 2) + '\n\n';
  }
  for (const u of f.units) {
    let text = code.slice(u.start, u.end);
    if (!u.isRender) {
      const declStart = u.node.start - u.start;
      text = text.slice(0, declStart) + 'export ' + text.slice(declStart);
    }
    body += text + '\n\n';
  }
  if (file === 'main') { lines.unshift('import "@/styles";'); }
  out[file + ext] = (lines.length ? lines.join('\n') + '\n\n' : '') + body.trimEnd() + '\n';
}
for (const [f, c] of Object.entries(out)) {
  const p = path.join(OUT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
}
console.log(Object.keys(out).length, 'fichiers');
