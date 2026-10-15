#!/usr/bin/env python3
"""Assemble docs/benchmark/onboarding-refonte.html (rapport autonome HTML + Tailwind, publiable en artefact).

- Compile docs/benchmark/src/onboarding-refonte.css avec Tailwind 3.4.17
  (config : docs/benchmark/src/tailwind.redesign.config.js) et l'intègre dans la page.
- Remplace chaque {{img:clé}} par l'image docs/benchmark/screens/onboarding-v2/<clé>.webp
  en data URI (les artefacts bloquent les images externes).

Tailwind : variable d'environnement TAILWIND (chemin du binaire tailwindcss),
sinon `npx --yes tailwindcss@3.4.17`.

Usage : python3 tools/build_benchmark_refonte.py
"""
import base64
import os
import re
import shlex
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BENCH = ROOT / "docs/benchmark"
SRC = BENCH / "src"
SHOTS = BENCH / "screens/onboarding-v2"
OUT = BENCH / "onboarding-refonte.html"


def tailwind_css() -> str:
    cmd = shlex.split(os.environ.get("TAILWIND", "npx --yes tailwindcss@3.4.17"))
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out.css"
        subprocess.run(cmd + ["-c", str(SRC / "tailwind.redesign.config.js"),
                              "-i", str(SRC / "onboarding-refonte.css"), "-o", str(out), "--minify"],
                       check=True, capture_output=True)
        return out.read_text(encoding="utf-8")


def image(match: re.Match) -> str:
    data = base64.b64encode((SHOTS / f"{match.group(1)}.webp").read_bytes()).decode()
    return f"data:image/webp;base64,{data}"


def main() -> None:
    page = (SRC / "onboarding-refonte.html").read_text(encoding="utf-8")
    page = page.replace("/*TAILWIND*/", tailwind_css())
    page = re.sub(r"\{\{img:([a-z0-9-]+)\}\}", image, page)
    OUT.write_text(page, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : {len(page) // 1024} Ko")


if __name__ == "__main__":
    main()
