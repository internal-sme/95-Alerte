#!/usr/bin/env python3
"""Importe les photos des alertes de démonstration (phase 5, décision G4 : générées avec Magnific).

Chaque argument est « <clé>=<source> » : la clé est « <id d'alerte>-<n> » (ex. a1-1, a1-2, a6-1) et la source
une URL (lien de téléchargement Magnific) ou un fichier local (PNG, JPG, WebP). Les originaux sont gardés dans
docs/brand/alertes/ (WebP pleine définition) ; les images sont recadrées en 4:3 (780 × 585, l'en-tête de la fiche en densité 2),
compressées en WebP et écrites dans prototype/src/alertes/<clé>.webp. tools/build_prototype.py les embarque
(window.ALERT_PHOTOS) ; leur texte alternatif est dans PHOTO_ALT (prototype/src/app.jsx).

Usage : python3 tools/fetch_alert_photos.py a1-1=<source> a1-2=<source> …
        python3 tools/build_prototype.py
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "prototype/src/alertes"
ORIGINALS = ROOT / "docs/brand/alertes"
W, H = 780, 585


def load(src: str) -> Image.Image:
    if src.startswith("http"):
        with urllib.request.urlopen(src, timeout=60) as r:
            return Image.open(io.BytesIO(r.read()))
    return Image.open(src)


def cover(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def main() -> None:
    pairs = [a.split("=", 1) for a in sys.argv[1:]]
    if not pairs or any(len(p) != 2 for p in pairs):
        sys.exit(__doc__)
    OUT.mkdir(parents=True, exist_ok=True)
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    for key, src in pairs:
        im = load(src)
        original = ORIGINALS / f"{key}.webp"  # original pleine définition, en WebP pour alléger le dépôt
        if not (Path(src).exists() and Path(src).resolve() == original.resolve()):
            im.convert("RGB").save(original, "WEBP", quality=88, method=6)
        path = OUT / f"{key}.webp"
        cover(im).save(path, "WEBP", quality=74, method=6)
        print(f"{path.relative_to(ROOT)} : {path.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
