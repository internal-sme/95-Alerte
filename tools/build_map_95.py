#!/usr/bin/env python3
"""Génère la géométrie de la carte du Val-d'Oise (phase 3) : prototype/src/map-95.json.

Sources (dans tools/data/map-95/, aucune ressource externe au moment de l'exécution) :
  - communes.geojson : contours des communes (france-geojson, d'après IGN ADMIN EXPRESS, Licence Ouverte)
  - epci.json : intercommunalités et populations (@etalab/decoupage-administratif@6.0.0, extrait 95)
Données dessinées à la main (approximatives, décoratives) : Oise, Seine, lac d'Enghien, forêts, grands axes,
villes voisines hors couverture, et quartiers FICTIFS de Cergy, Pontoise, Saint-Ouen-l'Aumône et Osny.

Projection : équirectangulaire en kilomètres, origine au coin nord-ouest du département
(x = (lng − LNG0) × KX, y = (LAT0 − lat) × KY) ; l'application applique la même formule (projectKm).
Les tracés sont des chemins SVG en km (2 décimales), simplifiés à ~40 m.

Prérequis : pip install shapely
Usage : python3 tools/build_map_95.py
"""
import json
import math
from pathlib import Path

from shapely.geometry import MultiPoint, Point, Polygon, shape
from shapely.ops import nearest_points, unary_union, voronoi_diagram

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "tools/data/map-95"
OUT = ROOT / "prototype/src/map-95.json"

LAT0, LNG0 = 49.245, 1.600
KY = 111.32
KX = 111.32 * math.cos(math.radians(49.07))
SIMPLIFY = 0.04  # km

SHORT = {  # libellés courts des intercommunalités
    "CA de Cergy-Pontoise": "Cergy-Pontoise", "CA Val Parisis": "Val Parisis", "CA Plaine Vallée": "Plaine Vallée",
    "CA Roissy Pays de France": "Roissy Pays de France", "CC Vexin Centre": "Vexin Centre",
    "CC du Vexin-Val de Seine": "Vexin-Val de Seine", "CC Sausseron Impressionnistes": "Sausseron Impressionnistes",
    "CC Carnelle Pays-de-France": "Carnelle Pays-de-France", "CC du Haut Val d'Oise": "Haut Val-d'Oise",
    "CC de la Vallée de l'Oise et des Trois Forêts": "Vallée de l'Oise et Trois Forêts",
    "CA Saint Germain Boucles de Seine": "Saint Germain Boucles de Seine", "Métropole du Grand Paris": "Grand Paris",
}

# Quartiers fictifs (E5) : graines (lat, lng) d'un diagramme de Voronoï découpé dans la commune
QUARTIERS = {
    "95500": [("Centre", 49.0490, 2.0990), ("Les Louvrais", 49.0625, 2.1120), ("Marcouville", 49.0555, 2.0850), ("L'Hermitage", 49.0600, 2.1300)],
    "95127": [("Grand Centre", 49.0365, 2.0720), ("Axe Majeur", 49.0255, 2.0700), ("Saint-Christophe", 49.0405, 2.0560), ("Hauts-de-Cergy", 49.0480, 2.0300)],
    "95572": [("Le Parc", 49.0450, 2.1210), ("Épluches", 49.0330, 2.1380), ("Liesse", 49.0220, 2.1650)],
    "95476": [("Centre", 49.0640, 2.0640), ("Moulin-à-Vent", 49.0720, 2.0430)],
}

WATER = [
    # Oise : tronçon Méry → Conflans calé sur les limites communales (Auvers/Méry, Pontoise/Saint-Ouen, boucle de Cergy)
    ("L'Oise", 7, [(49.200, 2.420), (49.168, 2.360), (49.150, 2.310), (49.140, 2.280), (49.125, 2.250), (49.112, 2.228), (49.098, 2.214),
                   (49.0868, 2.206), (49.0793, 2.2001), (49.0739, 2.1932), (49.0722, 2.1889), (49.0700, 2.1786), (49.0646, 2.1699),
                   (49.0647, 2.1628), (49.0665, 2.1503), (49.0665, 2.1416), (49.0673, 2.1345), (49.0646, 2.1287), (49.0640, 2.1270),
                   (49.0597, 2.1191), (49.0560, 2.1155), (49.0503, 2.1076), (49.0472, 2.1012), (49.0429, 2.0985), (49.0392, 2.0983),
                   (49.0361, 2.0958), (49.0300, 2.0935), (49.0240, 2.0907), (49.0198, 2.0855), (49.0190, 2.0809), (49.0180, 2.0755),
                   (49.0213, 2.0665), (49.0247, 2.0591), (49.0288, 2.0498), (49.0337, 2.0382), (49.0303, 2.0363), (49.0257, 2.0406),
                   (49.0217, 2.0448), (49.0182, 2.0492), (49.0137, 2.0568), (49.0082, 2.0644), (48.9990, 2.0850), (48.9935, 2.0960)]),
    ("La Seine", 10, [(48.935, 2.300), (48.942, 2.262), (48.932, 2.225), (48.918, 2.200), (48.905, 2.180), (48.920, 2.160), (48.945, 2.148),
                      (48.965, 2.158), (48.985, 2.150), (48.993, 2.105), (48.985, 2.065), (48.980, 2.010), (48.995, 1.950), (49.000, 1.900),
                      (48.995, 1.840), (48.995, 1.760), (49.020, 1.710), (49.060, 1.690), (49.080, 1.640), (49.090, 1.590)]),
]
LAKES = [("Lac d'Enghien", 48.9725, 2.3075, 0.55, 0.32, -20)]
FORESTS = [
    ("Forêt de Montmorency", 49.025, 2.290, 4.2, 2.2, -35), ("Forêt de L'Isle-Adam", 49.095, 2.255, 3.6, 2.0, 15),
    ("Forêt de Carnelle", 49.125, 2.330, 2.6, 1.7, 0), ("Forêt d'Arthies", 49.090, 1.790, 2.6, 1.4, 10),
    ("Bois de la Tour du Lay", 49.160, 2.000, 1.8, 1.0, -10),
]
ROADS = [
    ("A15", "motorway", [(48.930, 2.290), (48.950, 2.245), (48.975, 2.215), (48.995, 2.180), (49.015, 2.150), (49.035, 2.120), (49.040, 2.090),
                         (49.045, 2.065), (49.055, 2.045), (49.070, 2.010), (49.085, 1.960)]),
    ("N14", "main", [(49.085, 1.960), (49.100, 1.900), (49.120, 1.840), (49.150, 1.795), (49.180, 1.740)]),
    ("A115", "motorway", [(48.975, 2.262), (49.000, 2.245), (49.025, 2.225), (49.050, 2.205), (49.065, 2.190)]),
    ("A16", "motorway", [(49.095, 2.232), (49.130, 2.250), (49.170, 2.232), (49.250, 2.200)]),
    ("N1", "main", [(48.950, 2.355), (48.990, 2.340), (49.030, 2.330), (49.060, 2.340), (49.100, 2.300), (49.140, 2.280), (49.200, 2.260)]),
    ("A1", "motorway", [(48.930, 2.360), (48.960, 2.420), (48.990, 2.470), (49.010, 2.520), (49.050, 2.560), (49.100, 2.590)]),
    ("N104", "main", [(49.045, 2.115), (49.060, 2.170), (49.070, 2.220), (49.072, 2.300), (49.060, 2.360), (49.045, 2.420), (49.020, 2.470)]),
]
OUTSIDE = [("Paris", 48.857, 2.352), ("Saint-Denis", 48.936, 2.357), ("Beauvais", 49.430, 2.080), ("Creil", 49.260, 2.470),
           ("Chantilly", 49.194, 2.470), ("Mantes-la-Jolie", 48.990, 1.717), ("Saint-Germain-en-Laye", 48.898, 2.093),
           ("Senlis", 49.207, 2.586), ("Gisors", 49.281, 1.776), ("Versailles", 48.804, 2.130)]


def km(lat, lng):
    return ((lng - LNG0) * KX, (LAT0 - lat) * KY)


def to_km(geom):
    def ring(coords):
        return [km(lat, lng) for lng, lat in coords]
    if geom.geom_type == "Polygon":
        return Polygon(ring(geom.exterior.coords), [ring(i.coords) for i in geom.interiors])
    return unary_union([to_km(g) for g in geom.geoms])


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def path(geom):
    polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    out = []
    for p in polys:
        for r in [p.exterior, *p.interiors]:
            pts = list(r.coords)[:-1]
            out.append("M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z")
    return "".join(out)


def line(points):
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in (km(*p) for p in points))


def ellipse(lat, lng, rx, ry, rot, n=28):
    cx, cy = km(lat, lng)
    a = math.radians(rot)
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)))
    return Polygon(pts)


def balanced_seeds(commune, hints, steps=30):
    """Graines réparties dans la commune (k-moyennes sur une grille intérieure), départ aux graines indicatives."""
    x0, y0, x1, y1 = commune.bounds
    grid = [(x0 + (x1 - x0) * i / 40, y0 + (y1 - y0) * j / 40) for i in range(41) for j in range(41)]
    grid = [g for g in grid if commune.contains(Point(g))]
    seeds = [min(grid, key=lambda g: (g[0] - h.x) ** 2 + (g[1] - h.y) ** 2) for h in hints]
    for _ in range(steps):
        groups = [[] for _ in seeds]
        for g in grid:
            k = min(range(len(seeds)), key=lambda i: (g[0] - seeds[i][0]) ** 2 + (g[1] - seeds[i][1]) ** 2)
            groups[k].append(g)
        seeds = [(sum(p[0] for p in grp) / len(grp), sum(p[1] for p in grp) / len(grp)) if grp else s for grp, s in zip(groups, seeds)]
    return [Point(s) for s in seeds]


def center(geom):
    p = geom.representative_point() if not geom.centroid.within(geom) else geom.centroid
    return [round(p.x, 2), round(p.y, 2)]


def main():
    src = json.loads((DATA / "communes.geojson").read_text(encoding="utf-8"))
    meta = json.loads((DATA / "epci.json").read_text(encoding="utf-8"))
    epci_of = {c: e for e, v in meta["epci"].items() for c in v["membres"]}
    pop = meta["population"]

    communes = []
    for feat in src["features"]:
        code, name = feat["properties"]["code"], feat["properties"]["nom"]
        geom = to_km(shape(feat["geometry"])).buffer(0)
        communes.append({"code": code, "name": name, "geom": geom, "pop": pop.get(code, 0)})
    # Commune absente des EPCI (fusion récente) : rattachée à l'EPCI de sa plus proche voisine
    for c in communes:
        if c["code"] not in epci_of:
            near = min((o for o in communes if o["code"] in epci_of), key=lambda o: o["geom"].distance(c["geom"]))
            epci_of[c["code"]] = epci_of[near["code"]]

    dept = unary_union([c["geom"] for c in communes]).buffer(0.05).buffer(-0.05)
    epcis = []
    for e, v in meta["epci"].items():
        geoms = [c["geom"] for c in communes if epci_of[c["code"]] == e]
        g = unary_union(geoms).buffer(0.05).buffer(-0.05)
        epcis.append({"id": e, "name": v["nom"], "short": SHORT.get(v["nom"], v["nom"]),
                      "d": path(g.simplify(SIMPLIFY)), "c": center(g), "n": len(geoms)})

    quartiers = []
    for code, seeds in QUARTIERS.items():
        commune = next(c for c in communes if c["code"] == code)["geom"]
        pts = balanced_seeds(commune, [Point(*km(lat, lng)) for _, lat, lng in seeds])
        cells = voronoi_diagram(MultiPoint(pts), envelope=commune.buffer(5))
        for (name, lat, lng), pt in zip(seeds, pts):
            cell = next(c for c in cells.geoms if c.contains(pt)).intersection(commune)
            quartiers.append({"commune": code, "name": name, "d": path(cell.simplify(SIMPLIFY)), "c": center(cell)})

    w, h = dept.bounds[2], dept.bounds[3]
    data = {
        "_": "Généré par tools/build_map_95.py — ne pas modifier à la main.",
        "proj": {"lat0": LAT0, "lng0": LNG0, "kx": round(KX, 4), "ky": KY},
        "bounds": [round(dept.bounds[0], 2), round(dept.bounds[1], 2), round(w, 2), round(h, 2)],
        "dept": path(dept.simplify(SIMPLIFY)),
        "epci": epcis,
        "communes": [{"code": c["code"], "name": c["name"], "epci": epci_of[c["code"]], "pop": c["pop"],
                      "d": path(c["geom"].simplify(SIMPLIFY)), "c": center(c["geom"])}
                     for c in sorted(communes, key=lambda c: -c["pop"])],
        "quartiers": quartiers,
        "water": [{"name": n, "w": wd, "d": line(pts), "c": [round(v, 2) for v in km(*pts[len(pts) // 2])]} for n, wd, pts in WATER],
        "lakes": [{"name": n, "d": path(ellipse(lat, lng, rx, ry, r))} for n, lat, lng, rx, ry, r in LAKES],
        "forests": [{"name": n, "d": path(ellipse(lat, lng, rx, ry, r)), "c": [round(v, 2) for v in km(lat, lng)]} for n, lat, lng, rx, ry, r in FORESTS],
        "roads": [{"ref": r, "cls": cls, "d": line(pts)} for r, cls, pts in ROADS],
        "outside": [{"name": n, "c": [round(v, 2) for v in km(lat, lng)]} for n, lat, lng in OUTSIDE],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : {OUT.stat().st_size // 1024} Ko, {len(communes)} communes, {len(epcis)} EPCI, {len(quartiers)} quartiers")


if __name__ == "__main__":
    main()
