#!/usr/bin/env python3
"""Construit la vue satellite de la carte du Val-d'Oise (phase 5, tâche 5.12).

Source : images Copernicus Sentinel-2 (niveau L2A, couleurs naturelles « TCI », 10 m par pixel), données
libres et gratuites (« Contient des données Copernicus Sentinel modifiées 2023 »), lues directement dans les
fichiers COG publics d'AWS Open Data (bucket sentinel-cogs). Deux tuiles MGRS du même passage, presque sans
nuage (4 juin 2023) : 31UDQ (presque tout le département) et 31UCQ (la frange ouest du Vexin).

Les images sont reprojetées dans la projection de prototype/src/map-95.json (équirectangulaire en km,
x = (lng − lng0) × kx, y = (lat0 − lat) × ky) : elles se posent dans le même groupe SVG que les couches
vectorielles, sans calage à l'exécution. Deux niveaux :
  - dept.webp   : tout le département à 25 m par pixel (vue d'ensemble) ;
  - sector.webp : Cergy-Pontoise à 10 m par pixel (là où sont les alertes de démonstration).
Sortie : prototype/src/satellite/{dept,sector}.webp + satellite.json (emprises en km), embarqués par
tools/build_prototype.py (window.SAT_95).

Dépendances : rasterio (GDAL), numpy, Pillow.
Usage : CURL_CA_BUNDLE=<certificats> python3 tools/build_satellite_95.py
"""
import json
import os
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.transform import Affine
from rasterio.warp import Resampling, reproject

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "prototype/src/satellite"
BASE = "/vsicurl/https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/31/U"
SCENES = [f"{BASE}/DQ/2023/6/S2A_31UDQ_20230604_0_L2A/TCI.tif", f"{BASE}/CQ/2023/6/S2A_31UCQ_20230604_0_L2A/TCI.tif"]
LEVELS = {
    "dept": {"res_km": 0.025, "box": None},  # None : emprise du département (bounds de map-95.json)
    "sector": {"res_km": 0.010, "box": (24.0, 13.0, 44.0, 28.0)},  # x0, y0, x1, y1 en km : Cergy-Pontoise
}

os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")


def render(proj: dict, box: tuple, res_km: float) -> Image.Image:
    x0, y0, x1, y1 = box
    w, h = round((x1 - x0) / res_km), round((y1 - y0) / res_km)
    # Grille de destination : la projection du prototype est affine en degrés (EPSG:4326)
    dst_transform = Affine(res_km / proj["kx"], 0, proj["lng0"] + x0 / proj["kx"], 0, -res_km / proj["ky"], proj["lat0"] - y0 / proj["ky"])
    rgb = np.zeros((3, h, w), dtype=np.uint8)
    for url in SCENES:  # la première scène couvre l'essentiel, la seconde comble ce qui reste noir
        with rasterio.open(url) as src:
            part = np.zeros((3, h, w), dtype=np.uint8)
            for b in range(3):
                reproject(rasterio.band(src, b + 1), part[b], src_transform=src.transform, src_crs=src.crs,
                          dst_transform=dst_transform, dst_crs="EPSG:4326", resampling=Resampling.average, src_nodata=0, dst_nodata=0)
            empty = rgb.sum(axis=0) == 0
            rgb[:, empty] = part[:, empty]
    # Couleurs naturelles un peu éclaircies (le TCI brut est sombre) : gain puis gamma
    f = np.clip(rgb.astype(np.float32) / 255 * 1.35, 0, 1) ** 0.85
    return Image.fromarray((f * 255).astype(np.uint8).transpose(1, 2, 0), "RGB")


def main() -> None:
    geo = json.loads((ROOT / "prototype/src/map-95.json").read_text())
    proj, bx = geo["proj"], geo["bounds"]  # bounds : x, y, largeur, hauteur en km
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"source": "Contient des données Copernicus Sentinel modifiées 2023 (Sentinel-2 L2A, 4 juin 2023)"}
    for name, lv in LEVELS.items():
        box = lv["box"] or (bx[0] - 1, bx[1] - 1, bx[0] + bx[2] + 1, bx[1] + bx[3] + 1)
        im = render(proj, box, lv["res_km"])
        path = OUT / f"{name}.webp"
        im.save(path, "WEBP", quality=68, method=6)
        meta[name] = {"x": box[0], "y": box[1], "w": round(box[2] - box[0], 3), "h": round(box[3] - box[1], 3), "px": im.size}
        print(f"{path.relative_to(ROOT)} : {im.size[0]} × {im.size[1]} px, {path.stat().st_size // 1024} Ko")
    (OUT / "satellite.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
