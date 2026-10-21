#!/usr/bin/env python3
"""Génère un sprite SVG Phosphor (symboles <symbol id="ph-…">) à intégrer dans une page HTML.

Les artefacts bloquent les feuilles de style externes : la police d'icônes
@phosphor-icons/web ne peut pas être chargée. On intègre donc les SVG du paquet
@phosphor-icons/core@2.1.1 directement dans la page.

Usage :
    npm pack @phosphor-icons/core@2.1.1 && tar xzf phosphor-icons-core-2.1.1.tgz
    python3 tools/build_phosphor_sprite.py package/assets > sprite.svg

Dans la page : <svg class="ph" aria-hidden="true"><use href="#ph-fire"/></svg>
Variante pleine : #ph-fire-fill · Duotone (illustrations) : #ph-envelope-open-duotone
"""
import re
import sys
from pathlib import Path

# Correspondances DESIGN_SYSTEM.md §5 + icônes utilitaires du prototype
ICONS = [
    # Catégories
    "fire", "car", "traffic-cone", "shield-warning", "leaf", "trash", "speaker-high",
    "hand-heart", "mask-happy", "soccer-ball", "calendar-star", "barricade", "lightbulb",
    "dots-three", "drop", "tree", "megaphone", "info",
    # Interface
    "map-trifold", "list-bullets", "plus", "pulse", "user-circle", "bell", "magnifying-glass",
    "sliders-horizontal", "crosshair", "map-pin", "arrow-fat-up", "arrow-fat-down",
    "chat-circle", "flag", "share-network", "bookmark-simple", "timer", "seal-check",
    "detective", "siren", "wifi-slash",
    # Phase 7 : commentaires et signalement de contenu
    "arrow-bend-up-left", "dots-three-vertical", "shield-check",
    # Utilitaires
    "warning", "check", "check-circle", "x", "caret-right", "caret-left", "caret-down",
    "arrow-right", "camera", "image", "pencil-simple", "eye", "eye-slash", "lock-simple",
    "gear", "question", "sign-out", "sign-in", "hand-waving", "star", "navigation-arrow", "clock", "phone",
    "envelope", "identification-card", "buildings", "paper-plane-tilt", "users-three",
    "arrows-clockwise", "house", "sun", "moon", "text-aa", "circle-half", "vibrate",
    "trash-simple", "copy",
    # Prototype : barre d'état, démo, navigation
    "wifi-high", "cell-signal-full", "battery-full", "arrow-left", "squares-four",
    "play", "fast-forward", "arrow-counter-clockwise", "path", "circle",
    # Carte (phase 3)
    "minus", "polygon", "arrows-out-simple",
    # Liste, recherche et filtres (phase 4)
    "arrows-down-up", "clock-counter-clockwise", "arrow-up",
    # Fiche alerte (phase 5)
    "whatsapp-logo", "chat-text", "link", "bell-ringing", "bell-slash", "images", "caret-up",
    # Fond de carte (tâche 5.12)
    "stack", "globe-hemisphere-west",
]
FILL = [
    "map-trifold", "list-bullets", "pulse", "user-circle", "bell", "arrow-fat-up",
    "arrow-fat-down", "bookmark-simple", "check-circle", "seal-check", "map-pin",
    "fire", "car", "traffic-cone", "shield-warning", "leaf", "trash", "speaker-high",
    "hand-heart", "mask-happy", "soccer-ball", "calendar-star", "barricade", "lightbulb",
    "dots-three", "drop", "tree", "megaphone", "info", "warning", "siren", "star",
    "paper-plane-tilt", "squares-four", "navigation-arrow",
    "bell-ringing", "phone",
]

# Illustrations ponctuelles (écrans de confirmation, états) : Phosphor Duotone, même bibliothèque que l'interface
DUOTONE = ["envelope-open", "hand-waving", "seal-check", "map-trifold", "identification-card", "shield-check",
           "megaphone", "hand-heart", "map-pin-area", "compass", "cloud-slash",
           "siren", "trash", "eye-slash", "link-break", "pencil-simple", "camera", "camera-slash", "chat-circle-dots", "flag", "shield-check", "prohibit"]


def inner(svg: str) -> str:
    return re.sub(r"^.*?<svg[^>]*>|</svg>\s*$", "", svg.strip(), flags=re.S)


def main(assets: Path) -> None:
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">']
    for name in ICONS:
        src = assets / "regular" / f"{name}.svg"
        out.append(f'<symbol id="ph-{name}" viewBox="0 0 256 256">{inner(src.read_text())}</symbol>')
    for name in FILL:
        src = assets / "fill" / f"{name}-fill.svg"
        out.append(f'<symbol id="ph-{name}-fill" viewBox="0 0 256 256">{inner(src.read_text())}</symbol>')
    for name in DUOTONE:
        src = assets / "duotone" / f"{name}-duotone.svg"
        out.append(f'<symbol id="ph-{name}-duotone" viewBox="0 0 256 256">{inner(src.read_text())}</symbol>')
    out.append("</svg>")
    sys.stdout.write("".join(out))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
