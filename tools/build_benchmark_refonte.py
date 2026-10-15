#!/usr/bin/env python3
"""Assemble les rapports « benchmark + refonte » (HTML autonome + Tailwind, publiables en artefact).

Rapports : onboarding-refonte (phase 2, images screens/onboarding-v2/) et carte-refonte (phase 3, images screens/carte/).
- Compile docs/benchmark/src/onboarding-refonte.css (feuille commune) avec Tailwind 3.4.17
  (config : docs/benchmark/src/tailwind.redesign.config.js, qui lit toutes les sources *-refonte.html).
- Remplace chaque {{img:clé}} par l'image docs/benchmark/screens/<dossier>/<clé>.webp
  en data URI (les artefacts bloquent les images externes).

Tailwind : variable d'environnement TAILWIND (chemin du binaire tailwindcss),
sinon `npx --yes tailwindcss@3.4.17`.

Usage : python3 tools/build_benchmark_refonte.py [onboarding-refonte|carte-refonte]
"""
import base64
import os
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BENCH = ROOT / "docs/benchmark"
SRC = BENCH / "src"
REPORTS = {"onboarding-refonte": "onboarding-v2", "carte-refonte": "carte"}


def tailwind_css() -> str:
    cmd = shlex.split(os.environ.get("TAILWIND", "npx --yes tailwindcss@3.4.17"))
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out.css"
        subprocess.run(cmd + ["-c", str(SRC / "tailwind.redesign.config.js"),
                              "-i", str(SRC / "onboarding-refonte.css"), "-o", str(out), "--minify"],
                       check=True, capture_output=True)
        return out.read_text(encoding="utf-8")


def build(name: str, css: str) -> None:
    shots = BENCH / "screens" / REPORTS[name]

    def image(match: re.Match) -> str:
        data = base64.b64encode((shots / f"{match.group(1)}.webp").read_bytes()).decode()
        return f"data:image/webp;base64,{data}"

    page = (SRC / f"{name}.html").read_text(encoding="utf-8")
    page = page.replace("/*TAILWIND*/", css)
    page = re.sub(r"\{\{img:([a-z0-9-]+)\}\}", image, page)
    out = BENCH / f"{name}.html"
    out.write_text(page, encoding="utf-8")
    print(f"{out.relative_to(ROOT)} : {len(page) // 1024} Ko")


def main() -> None:
    names = sys.argv[1:] or list(REPORTS)
    css = tailwind_css()
    for name in names:
        build(name, css)


if __name__ == "__main__":
    main()
