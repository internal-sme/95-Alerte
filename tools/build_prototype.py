#!/usr/bin/env python3
"""Assemble le prototype en un fichier HTML unique : prototype/index.html.

Sources :
  - docs/design-system/index.html  → tokens + composants (entre les marqueurs TOKENS et CHROME)
  - prototype/src/app.css          → styles propres au prototype
  - prototype/src/phosphor-sprite.svg → icônes (tools/build_phosphor_sprite.py)
  - prototype/src/app.jsx          → application React (transpilée dans le navigateur par Babel)

Usage : python3 tools/build_prototype.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DS = ROOT / "docs/design-system/index.html"
SRC = ROOT / "prototype/src"
OUT = ROOT / "prototype/index.html"

START = "/* ============ TOKENS"
END = "/* ============ CHROME"

REACT = "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
REACT_DOM = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"
BABEL = "https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.4/babel.min.js"
FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"


def design_system_css() -> str:
    html = DS.read_text(encoding="utf-8")
    start, end = html.index(START), html.index(END)
    return html[start:end].rstrip()


def main() -> None:
    css = design_system_css() + "\n\n" + (SRC / "app.css").read_text(encoding="utf-8")
    sprite = (SRC / "phosphor-sprite.svg").read_text(encoding="utf-8")
    app = (SRC / "app.jsx").read_text(encoding="utf-8")
    page = f"""<title>95 Alerte</title>
<!-- Fichier généré par tools/build_prototype.py : modifier prototype/src/ puis relancer le script. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{css}
</style>
{sprite}
<div id="root"><div class="boot">Chargement de 95 Alerte…</div></div>
<script src="{REACT}"></script>
<script src="{REACT_DOM}"></script>
<script src="{BABEL}"></script>
<script type="text/babel" data-presets="react">
{app}
</script>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : {len(page) // 1024} Ko")


if __name__ == "__main__":
    main()
