// Ajoute une interface <Nom>Props à chaque composant fonctionnel exporté, d'après :
//  - les valeurs par défaut du composant ;
//  - les sites d'appel JSX dans tout src/ (littéraux, fonctions, éléments) ;
//  - un dictionnaire des props du domaine (alert: Alert, d: Draft…).
// Une prop est obligatoire si tous les sites d'appel la passent et qu'elle n'a pas de valeur par défaut.
const fs = require('fs'), path = require('path');
const parser = require('@babel/parser'); const traverse = require('@babel/traverse').default;
const root = process.argv[2];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(root).filter((f) => f.endsWith('.tsx'));
const parse = (src) => parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'] });

const DICT = {
  children: 'ReactNode', alert: 'Alert', d: 'Draft', category: 'Category', comment: 'Comment', style: 'CSSProperties',
  ph: 'DraftPhoto', center: 'LatLng & { key?: number }', set: '(patch: Partial<Draft>) => void', go: '(step: ReportStep) => void',
  next: '() => void', step: 'any', title: 'ReactNode', text: 'ReactNode', description: 'ReactNode', subtitle: 'ReactNode',
  lead: 'ReactNode', help: 'ReactNode', error: 'ReactNode', note: 'ReactNode', footer: 'ReactNode', headerAction: 'ReactNode',
  label: 'string', icon: 'string', className: 'string', id: 'string', tone: 'string', family: 'string', name: 'string',
  value: 'any', logoRef: 'Ref<any>',
};
const OVERRIDE = { // props dont le type ne se déduit pas des sites d'appel
  'FeedSection.title': 'string', 'Hl.text': 'string', 'Hl.q': 'string',
  'CameraOverlay.photoKey': 'string', 'CameraOverlay.onShoot': '(shot: { key?: string; src?: string }) => void',
  'CameraOverlay.onClose': '() => void', 'CameraOverlay.onGallery': '() => void', 'CameraOverlay.forced': 'CameraMode | null',
  'CommentsScreen.id': 'string', 'CommentsScreen.compose': 'boolean', 'CommentsScreen.replyTo': 'string', 'CommentsScreen.highlight': 'string',
  'CommentsScreen.draftText': 'string', 'CommentsScreen.submitted': 'boolean', 'CommentsScreen.view': '"loading" | "error" | "ready"',
  'Composer.replyTo': 'Comment | null', 'Composer.onCancelReply': '() => void', 'Composer.onPosted': '(commentId: string) => void',
  'Composer.draftText': 'string', 'Composer.submitted': 'boolean',
  'CommentItem.mine': 'boolean', 'CommentItem.isAuthor': 'boolean', 'CommentItem.highlight': 'boolean', 'CommentItem.onReply': '() => void', 'CommentItem.onMenu': '() => void',
  'CommentMenuSheet.alertId': 'string', 'CommentMenuSheet.commentId': 'string', 'CommentMenuSheet.onReply': '() => void',
  'ReportContentScreen.kind': '"alert" | "comment"', 'ReportContentScreen.alertId': 'string', 'ReportContentScreen.commentId': 'string',
  'ReportContentScreen.step': '"reason" | "confirm" | "sending" | "error" | "done"', 'ReportContentScreen.reason': 'ReportReason | null', 'ReportContentScreen.note': 'string',
  'ReasonOption.name': 'string', 'ReasonOption.value': 'string', 'ReasonOption.checked': 'boolean', 'ReasonOption.onChange': '(value: string) => void',
  'ReasonOption.label': 'string', 'ReasonOption.help': 'string',
};
const typeOfExpr = (e) => {
  if (!e) return 'boolean';
  if (e.type === 'StringLiteral' || e.type === 'TemplateLiteral') return 'string';
  if (e.type === 'NumericLiteral' || (e.type === 'UnaryExpression' && e.argument.type === 'NumericLiteral')) return 'number';
  if (e.type === 'BooleanLiteral') return 'boolean';
  if (e.type === 'ArrowFunctionExpression' || e.type === 'FunctionExpression') return 'fn';
  if (e.type === 'JSXElement' || e.type === 'JSXFragment') return 'ReactNode';
  if (e.type === 'ObjectExpression') return 'object';
  if (e.type === 'ArrayExpression') return 'array';
  return null;
};

// 1. Sites d'appel
const sites = {}; // composant → [{ props: Map(nom → type|null), spread, children }]
for (const f of files) {
  traverse(parse(fs.readFileSync(f, 'utf8')), {
    JSXElement(p) {
      const o = p.node.openingElement;
      if (o.name.type !== 'JSXIdentifier' || !/^[A-Z]/.test(o.name.name)) return;
      const props = new Map(); let spread = false;
      for (const a of o.attributes) {
        if (a.type === 'JSXSpreadAttribute') { spread = true; continue; }
        const v = a.value;
        props.set(a.name.name, !v ? 'boolean' : v.type === 'StringLiteral' ? 'string' : v.type === 'JSXExpressionContainer' ? typeOfExpr(v.expression) : 'ReactNode');
      }
      const kids = p.node.children.filter((c) => !(c.type === 'JSXText' && !c.value.trim()));
      if (kids.length) props.set('children', 'ReactNode');
      (sites[o.name.name] ||= []).push({ props, spread });
    },
  });
}

// 2. Interfaces
const USED = new Set();
let count = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const ast = parse(src);
  const edits = [];
  for (const st of ast.program.body) {
    const fn = st.type === 'ExportNamedDeclaration' ? st.declaration : null;
    if (!fn || fn.type !== 'FunctionDeclaration' || !/^[A-Z]/.test(fn.id.name)) continue;
    const param = fn.params[0];
    if (!param || param.type !== 'ObjectPattern' || param.typeAnnotation) continue;
    const name = fn.id.name; const calls = sites[name] || [];
    const lines = []; let rest = false;
    for (const p of param.properties) {
      if (p.type === 'RestElement') { rest = true; continue; }
      const key = p.key.name;
      const def = p.value.type === 'AssignmentPattern' ? p.value.right : null;
      const seen = new Set(calls.map((c) => c.props.get(key)).filter((t) => t !== undefined));
      let t = DICT[key];
      if (!t || t === 'any') {
        const lit = [...seen].concat(def ? [typeOfExpr(def)] : []);
        const known = lit.filter(Boolean);
        const uniq = [...new Set(known)];
        if (/^on[A-Z]/.test(key) || uniq[0] === 'fn') t = '(...args: any[]) => any';
        else if (uniq.length === 1 && known.length === lit.length && ['string', 'number', 'boolean'].includes(uniq[0])) t = uniq[0];
        else if (uniq.length === 1 && uniq[0] === 'ReactNode' && known.length === lit.length) t = 'ReactNode';
        else t = t || 'any';
      }
      if (t === 'fn') t = '(...args: any[]) => any';
      if (OVERRIDE[name + '.' + key]) t = OVERRIDE[name + '.' + key];
      else if (t !== 'any') {
        // Élargir au type réellement passé par les sites d'appel (ex. label={<Fragment>…} ou label={false})
        const extra = new Set();
        for (const k of seen) {
          if (!k || k === 'fn' || k === 'object' || k === 'array') continue;
          const covered = t === k || (t === 'ReactNode' && ['string', 'number', 'boolean'].includes(k));
          if (!covered) extra.add(k);
        }
        if (extra.has('ReactNode') && ['string', 'number'].includes(t)) { extra.delete('ReactNode'); t = 'ReactNode'; }
        for (const k of extra) t = t.startsWith('(') ? `${k} | (${t})` : `${t} | ${k}`;
      }
      const required = !def && calls.length > 0 && calls.every((c) => c.spread || c.props.has(key));
      lines.push(`  ${key}${required ? '' : '?'}: ${t};`);
      ['ReactNode', 'CSSProperties', 'Ref', 'Alert', 'Draft', 'Category', 'Comment', 'DraftPhoto', 'LatLng', 'ReportStep', 'CameraMode', 'ReportReason'].forEach((n) => { if (new RegExp(`\\b${n}\\b`).test(t)) USED.add(f + '|' + n); });
    }
    if (rest) lines.push('  [prop: string]: any;');
    const iface = `export interface ${name}Props {\n${lines.join('\n')}\n}\n\n`;
    edits.push({ at: st.start, text: iface });
    edits.push({ at: param.end, text: `: ${name}Props` });
    count++;
  }
  if (!edits.length) continue;
  edits.sort((a, b) => b.at - a.at).forEach((e) => { src = src.slice(0, e.at) + e.text + src.slice(e.at); });
  // imports de types
  const reactTypes = ['ReactNode', 'CSSProperties', 'Ref'].filter((n) => USED.has(f + '|' + n));
  const domain = ['Alert', 'Draft', 'Category', 'Comment', 'DraftPhoto', 'LatLng', 'ReportStep', 'CameraMode', 'ReportReason'].filter((n) => USED.has(f + '|' + n));
  const imp = [];
  if (reactTypes.length) imp.push(`import type { ${reactTypes.join(', ')} } from "react";`);
  if (domain.length) imp.push(`import type { ${domain.join(', ')} } from "@/types";`);
  if (imp.length) {
    // après le dernier import
    const lastImport = [...src.matchAll(/^import .*;$/gm)].pop();
    const at = lastImport ? lastImport.index + lastImport[0].length + 1 : 0;
    src = src.slice(0, at) + imp.join('\n') + '\n' + src.slice(at);
  }
  fs.writeFileSync(f, src);
}
console.log(count, 'composants typés');
