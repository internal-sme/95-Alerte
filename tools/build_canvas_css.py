#!/usr/bin/env python3
"""Feuille de style des planches du canevas Design (preview du prototype).

Reprend les tokens et composants de docs/design-system/index.html, remplace le thème
automatique par deux classes explicites (.t-light / .t-dark) pour que chaque planche garde
son thème quel que soit celui du visualiseur, ajoute les styles d'écran du prototype et
les icônes Phosphor en masques CSS (<span class="ph i i-fire"></span>).

Usage : python3 tools/build_canvas_css.py > a95-canvas.css
"""
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "docs/design-system/index.html").read_text(encoding="utf-8")
css = html[html.index("/* ============ TOKENS"):html.index("/* ============ CHROME")]

# Thèmes explicites
light_start = css.index(":root{")
css = css.replace(":root{", ":root,.t-light{", 1)
media = re.search(r"@media \(prefers-color-scheme: dark\)\{:root:not\(\[data-theme=\"light\"\]\)\{.*?color-scheme:dark\}\}", css, re.S)
css = css.replace(media.group(0), "")
css = css.replace(':root[data-theme="dark"]{', ".t-dark{")
css = css.replace(':root[data-contrast="high"]', ".t-contrast")
css = css.replace(':root[data-motion="reduce"] *', ".t-motion *")

SCREEN = r"""
/* ============ ÉCRANS DU PROTOTYPE ============ */
.a95{position:relative;overflow:hidden;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:400 var(--fs-body)/var(--lh-body) var(--font);-webkit-font-smoothing:antialiased;box-sizing:border-box}
.a95 *{box-sizing:border-box}
/* :where() garde une spécificité nulle : un <a class="btn btn-primary"> conserve les couleurs du bouton */
:where(.a95) a{text-decoration:none;color:inherit}
.screen95{position:relative;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.scroll95{flex:1;min-height:0;overflow-y:auto}
.screen-header{display:grid;grid-template-columns:var(--tap) 1fr var(--tap);align-items:center;min-height:56px;padding:0 var(--s-1);background:var(--bg);flex:none}
.screen-header h1{margin:0;text-align:center;font:600 var(--fs-h2)/var(--lh-h2) var(--font)}
.screen-header .icon-btn{box-shadow:none;background:transparent}
.placeholder-phase{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--primary-soft);color:var(--primary);font:600 var(--fs-caption)/1.2 var(--font);justify-self:start}
.demo-note{font:400 var(--fs-caption)/var(--lh-caption) var(--font);color:var(--text-muted);margin:0}
.bs{position:absolute;left:0;right:0;bottom:0;z-index:25;display:flex;flex-direction:column;background:var(--surface);border-radius:var(--r-lg) var(--r-lg) 0 0;box-shadow:var(--shadow-3);transition:height .28s cubic-bezier(.2,.8,.2,1)}
.bs-handle{flex:none;display:grid;place-items:center;height:28px;border:0;background:transparent;cursor:pointer;width:100%;padding:0}
.bs-handle span{width:40px;height:5px;border-radius:3px;background:var(--border)}
.bs-head{flex:none;display:flex;align-items:center;gap:var(--s-2);padding:0 var(--s-4) var(--s-2)}
.bs-head h2{margin:0;flex:1;font:600 var(--fs-h3)/var(--lh-h3) var(--font)}
.bs-body{flex:1;min-height:0;overflow-y:auto;padding:0 var(--s-4) calc(var(--s-4) + 28px);display:grid;gap:var(--s-3);align-content:start}
.bs-scrim{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:24}
.t-dark .bs-scrim,.t-dark .modal-scrim{background:rgba(0,0,0,.6)}
.modal-scrim{position:absolute;inset:0;z-index:45;background:rgba(15,23,42,.45);display:grid;place-items:center;padding:var(--s-6)}
.modal-scrim .modal{width:100%}
.toast-host{position:absolute;left:var(--s-3);right:var(--s-3);bottom:88px;z-index:50;display:grid;gap:var(--s-2)}
.global-banner{border-radius:0;flex:none}
.tabbar{flex:none;position:relative;z-index:30}
.tabbar a.tab{text-decoration:none}
.lib-section{display:grid;gap:var(--s-3)}
.lib-row{display:flex;flex-wrap:wrap;gap:var(--s-2);align-items:center}
.lib-markers{display:flex;flex-wrap:wrap;gap:22px;align-items:center;padding:8px 4px 16px}
.alert-card{font:inherit;text-align:left;width:100%}
/* Démarrage et connexion : contenu défilant + pied d'actions fixe */
.screen95.auth .scroll95{display:flex;flex-direction:column}
.screen95.auth .scroll95 > .screen-pad{flex:1 0 auto}
.screen95 > .screen-footer{flex:none}
.screen95.welcome{background:radial-gradient(120% 60% at 15% 0%,var(--primary-soft) 0%,transparent 70%),linear-gradient(180deg,var(--primary-soft) 0%,var(--bg) 75%)}
a.pill{text-decoration:none}
.tap-through{display:flex;flex-direction:column;flex:1;color:inherit}
/* Icônes Phosphor en masques : <span class="ph i i-fire" aria-hidden="true"></span> */
.i{display:inline-block;background-color:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat}
"""

sprite = (ROOT / "prototype/src/phosphor-sprite.svg").read_text(encoding="utf-8")
icons = []
for m in re.finditer(r'<symbol id="ph-([a-z0-9-]+)" viewBox="0 0 256 256">(.*?)</symbol>', sprite, re.S):
    name, body = m.group(1), m.group(2)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">{body}</svg>'
    uri = "data:image/svg+xml," + urllib.parse.quote(svg, safe=" =:/,.-#")
    icons.append(f'.i-{name}{{--m:url("{uri}")}}')

sys.stdout.write("/* 95 Alerte — styles des planches du canevas (généré par tools/build_canvas_css.py) */\n")
sys.stdout.write(css + SCREEN + "\n".join(icons) + "\n")
