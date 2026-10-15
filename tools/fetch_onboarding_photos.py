#!/usr/bin/env python3
"""Importe les 3 photos des pages de présentation (générées avec Magnific, d'après le flow Citizen).

Chaque source est une URL (lien de téléchargement Magnific) ou un fichier local (PNG, JPG, WebP).
Les originaux sont gardés dans docs/brand/onboarding/. Les images sont recadrées au format de la zone
photo des pages (390 × 574, soit 68 % de l'écran, ×2), compressées en WebP et écrites dans
prototype/src/onboarding/slide-{1,2,3}.webp ; tools/build_prototype.py les embarque ensuite.

Usage : python3 tools/fetch_onboarding_photos.py <source-page-1> <source-page-2> <source-page-3>
        python3 tools/build_prototype.py
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "prototype/src/onboarding"
W, H = 780, 1148  # zone photo : 390 × 574 (68 % de 844) en densité 2


def load(src: str) -> Image.Image:
    if src.startswith("http"):
        with urllib.request.urlopen(src, timeout=60) as r:
            return Image.open(io.BytesIO(r.read()))
    return Image.open(src)


def cover(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - W) // 2, int((im.height - H) * 0.35)  # léger biais vers le haut (ciel, monument)
    return im.crop((x, y, x + W, y + H))


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    OUT.mkdir(parents=True, exist_ok=True)
    for n, src in enumerate(sys.argv[1:], 1):
        path = OUT / f"slide-{n}.webp"
        cover(load(src)).save(path, "WEBP", quality=74, method=6)
        print(f"{path.relative_to(ROOT)} : {path.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
