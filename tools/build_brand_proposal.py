#!/usr/bin/env python3
"""Assemble docs/brand/proposition-marque.html (page de décision : logo, démarrage, couleurs).

- {{logo}} / {{mark}} : logo officiel (docs/brand/logo-95-alerte.svg) en SVG inline.
- {{img:clé|texte}} : image de docs/brand/screens/<clé>.jpg intégrée en base64 (les artefacts bloquent
  les images externes).
- {{option:X}} : carte d'option de couleurs avec sa maquette Tailwind (couleurs fixes de l'option).

Usage : python3 tools/build_brand_proposal.py
        TAILWIND_BIN=/chemin/node_modules/.bin/tailwindcss python3 tools/build_brand_proposal.py
Avec TAILWIND_BIN (tailwindcss@3.4.17), le CSS Tailwind est compilé et intégré à la page : plus besoin
du script CDN. Sans, la page charge Tailwind depuis cdn.tailwindcss.com (version exacte).
"""
import base64
import html
import os
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "docs/brand"

svg = (BRAND / "logo-95-alerte.svg").read_text(encoding="utf-8")
paths = re.findall(r'<path class="(cls-[12])" d="([^"]+)"', svg)
figure = "".join(f'<path class="logo95-yellow" d="{d}"/>' for c, d in paths if c == "cls-2")
siren = "".join(f'<path class="logo95-red" d="{d}"/>' for c, d in paths if c == "cls-1")
LOGO = ('<svg viewBox="0 0 217.22 222.98" class="block h-auto w-full" role="img" aria-label="95 Alerte">'
        f'{figure}{siren}<text class="logo95-word" x="0" y="209.54" textLength="217" lengthAdjust="spacingAndGlyphs">Alerte</text></svg>')
MARK = f'<svg viewBox="0 0 217.22 146" class="block h-auto w-full" role="img" aria-label="Symbole 95 Alerte">{figure}{siren}</svg>'

# Formes des familles d'alertes (inchangées dans toutes les options)
FAMILIES = [("#15803D", "circle", "Positif"), ("#B91C1C", "diamond", "Incident"), ("#C2410C", "triangle", "Vigilance"), ("#0369A1", "square", "Info")]


def shape(color, kind):
    d = {"circle": '<circle cx="9" cy="9" r="8"/>', "diamond": '<path d="M9 1 17 9 9 17 1 9Z"/>',
         "triangle": '<path d="M9 1.5 17 16H1Z"/>', "square": '<rect x="1.5" y="1.5" width="15" height="15" rx="4"/>'}[kind]
    return f'<svg viewBox="0 0 18 18" class="h-4 w-4" fill="{color}" aria-hidden="true">{d}</svg>'


OPTIONS = {
    "A": dict(
        name="A", title="Statu quo : le logo en signature", tag="Aucun token modifié",
        summary="La palette reste celle du Design System. Les couleurs du logo n'apparaissent que dans le logo lui-même (démarrage, accueil).",
        swatches=[("#1E40AF", "Primaire"), ("#E3E9FA", "Primaire doux"), ("#0F172A", "Texte")],
        m=dict(bg="#F8FAFC", text="#0F172A", mute="#475569", primary="#1E40AF", on="#FFFFFF", sec="#1E40AF", badge_bg="#E3E9FA", badge_fg="#1E40AF", tab="#1E40AF", bar="#1E40AF"),
        pros=["Aucun risque : contrastes déjà validés", "Le bleu institutionnel reste la seule couleur d'action"],
        cons=["Le logo semble posé sur l'app, sans lien de couleur", "Le jaune, signe distinctif de la marque, disparaît après le démarrage"],
    ),
    "B": dict(
        name="B", title="Bleu d'action, jaune de marque", tag="Recommandée · 3 tokens ajoutés",
        summary="Le bleu reste la couleur des actions. Le jaune du logo devient l'accent de marque : badge « Nouveau », onglet actif, pagination, illustrations. Le rouge du logo reste dans le logo.",
        swatches=[("#1E40AF", "Primaire"), ("#F0C009", "--brand-yellow"), ("#7A5E00", "--brand-yellow-ink"), ("#1E1E1C", "--on-brand-yellow")],
        m=dict(bg="#F8FAFC", text="#0F172A", mute="#475569", primary="#1E40AF", on="#FFFFFF", sec="#1E40AF", badge_bg="#F0C009", badge_fg="#1E1E1C", tab="#1E40AF", bar="#F0C009"),
        pros=["Le logo et l'app partagent enfin une couleur", "Les actions et les familles d'alertes ne changent pas", "Le jaune n'est jamais utilisé pour du texte sur blanc (variante foncée à 6,1:1)"],
        cons=["Trois tokens de plus à documenter", "Le jaune doit rester rare pour ne pas concurrencer la vigilance (orange)"],
    ),
    "C": dict(
        name="C", title="Refonte sur les couleurs du logo", tag="Primaire remplacé",
        summary="Le noir du logo devient la couleur des boutons, le jaune l'accent ; le bleu disparaît.",
        swatches=[("#1E1E1C", "Primaire"), ("#F0C009", "Accent"), ("#FFFFFF", "Sur primaire")],
        m=dict(bg="#FFFFFF", text="#1E1E1C", mute="#55524A", primary="#1E1E1C", on="#FFFFFF", sec="#1E1E1C", badge_bg="#F0C009", badge_fg="#1E1E1C", tab="#1E1E1C", bar="#F0C009"),
        pros=["Identité très affirmée, proche du logo", "Contrastes élevés (noir sur blanc)"],
        cons=["Perte du bleu institutionnel, repère de confiance d'un service public", "Jaune et orange vigilance trop proches sur la carte", "Tous les écrans et le canevas à reprendre"],
    ),
}


def option_card(key):
    o = OPTIONS[key]
    m = o["m"]
    rec = key == "B"
    sw = "".join(f'<span class="grid justify-items-center gap-1 text-[11px] text-mute"><i class="h-8 w-8 rounded-lg border border-line" style="background:{c}"></i><span class="font-mono">{html.escape(l)}</span></span>' for c, l in o["swatches"])
    legend = "".join(f'<span class="inline-flex items-center gap-1">{shape(c, k)}<span>{l}</span></span>' for c, k, l in FAMILIES)
    tabs = "".join(
        f'<span class="grid justify-items-center gap-0.5 pt-1.5 text-[9px] font-medium" style="color:{m["tab"] if i == 0 else m["mute"]}">'
        f'<i class="h-1 w-5 rounded-full" style="background:{m["bar"] if i == 0 else "transparent"}"></i>{t}</span>'
        for i, t in enumerate(["Carte", "Alertes", "Activité", "Profil"]))
    mock = f'''
      <div class="mx-auto w-full max-w-[250px] overflow-hidden rounded-[28px] border-4 border-[#0B0F19]" style="background:{m["bg"]};color:{m["text"]}" aria-label="Maquette de l'option {key}" role="img">
        <div class="flex items-center justify-between px-4 pb-2 pt-4">
          <span class="w-10" style="color:{m["text"]}">{MARK}</span>
          <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" style="background:{m["badge_bg"]};color:{m["badge_fg"]}">3 nouvelles</span>
        </div>
        <div class="grid gap-1 px-4 pb-3">
          <p class="text-[15px] font-bold leading-tight">Autour de Pontoise</p>
          <p class="text-[11px]" style="color:{m["mute"]}">9 alertes à moins de 5 km</p>
        </div>
        <div class="mx-4 flex flex-wrap gap-x-3 gap-y-1 rounded-xl bg-white/60 p-2 text-[10px]" style="color:{m["mute"]}">{legend}</div>
        <div class="grid gap-2 p-4">
          <span class="grid h-9 place-items-center rounded-lg text-[12px] font-semibold" style="background:{m["primary"]};color:{m["on"]}">Signaler un événement</span>
          <span class="grid h-9 place-items-center rounded-lg border-[1.5px] text-[12px] font-semibold" style="border-color:{m["sec"]};color:{m["sec"]}">Voir la liste</span>
          <span class="flex justify-center gap-1 pt-1"><i class="h-1.5 w-4 rounded-full" style="background:{m["bar"]}"></i><i class="h-1.5 w-1.5 rounded-full bg-black/15"></i><i class="h-1.5 w-1.5 rounded-full bg-black/15"></i></span>
        </div>
        <div class="grid grid-cols-4 border-t border-black/10 bg-white pb-2">{tabs}</div>
      </div>'''
    li = lambda xs: "".join(f"<li>{html.escape(x)}</li>" for x in xs)
    ring = "ring-2 ring-accent" if rec else ""
    return f'''
      <article class="grid content-start gap-4 rounded-2xl border border-line bg-card p-5 {ring}">
        <div class="grid gap-1">
          <span class="text-xs font-semibold uppercase tracking-wider {'text-accent' if rec else 'text-mute'}">Option {key} · {html.escape(o["tag"])}</span>
          <h3 class="text-lg font-bold leading-snug">{html.escape(o["title"])}</h3>
          <p class="text-sm text-mute">{html.escape(o["summary"])}</p>
        </div>
        <div class="flex flex-wrap gap-3">{sw}</div>
        {mock}
        <div class="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div class="rounded-lg bg-good-soft p-3"><b class="text-xs uppercase tracking-wider text-good">Pour</b><ul class="mt-1 grid list-disc gap-1 pl-4">{li(o["pros"])}</ul></div>
          <div class="rounded-lg bg-warn-soft p-3"><b class="text-xs uppercase tracking-wider text-warn">Contre</b><ul class="mt-1 grid list-disc gap-1 pl-4">{li(o["cons"])}</ul></div>
        </div>
      </article>'''


def img(m):
    key, alt = m.group(1), m.group(2)
    data = base64.b64encode((BRAND / "screens" / f"{key}.jpg").read_bytes()).decode()
    return f'<img src="data:image/jpeg;base64,{data}" alt="{html.escape(alt)}" width="299" height="678" loading="lazy">'


src = (BRAND / "src/proposition.html").read_text(encoding="utf-8")
out = src.replace("{{logo}}", LOGO).replace("{{mark}}", MARK)
out = re.sub(r"\{\{option:([ABC])\}\}", lambda m: option_card(m.group(1)), out)
out = re.sub(r"\{\{img:([a-z0-9-]+)\|([^}]+)\}\}", img, out)
assert "{{" not in out, "jeton non remplacé"

TW = os.environ.get("TAILWIND_BIN")
if TW:
    cfg = re.search(r"tailwind\.config = (\{.*?\});\n</script>", out, re.S).group(1)
    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        (t / "page.html").write_text(out, encoding="utf-8")
        (t / "in.css").write_text("@tailwind base;\n@tailwind components;\n@tailwind utilities;\n")
        (t / "tailwind.config.js").write_text(f"module.exports = {{ content: ['{t / 'page.html'}'], ...{cfg} }};\n")
        subprocess.run([TW, "-c", str(t / "tailwind.config.js"), "-i", str(t / "in.css"), "-o", str(t / "out.css"), "--minify"], check=True, capture_output=True)
        css = (t / "out.css").read_text()
    out = re.sub(r'<script src="https://cdn\.tailwindcss\.com/[^"]+"></script>\n<script>.*?</script>\n', "", out, flags=re.S)
    out = out.replace("<style>", "<style>\n/* Tailwind CSS 3.4.17 compilé (tools/build_brand_proposal.py) */\n" + css + "\n", 1)
(BRAND / "proposition-marque.html").write_text(out, encoding="utf-8")
print(f"docs/brand/proposition-marque.html : {len(out) // 1024} Ko")
