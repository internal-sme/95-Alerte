#!/usr/bin/env python3
"""Assemble docs/benchmark/onboarding-mobbin.html (rapport autonome, publiable en artefact).

- Reprend la feuille de style du premier benchmark (docs/benchmark/benchmark-mobbin.html)
  pour garder la même charte entre les deux rapports.
- Remplace chaque {{shot:clé|légende}} de docs/benchmark/src/onboarding.html par une vignette :
  image de docs/benchmark/screens/onboarding/<clé>.jpg intégrée en base64 (les artefacts
  bloquent les images externes) et lien vers la page Mobbin.

Usage : python3 tools/build_benchmark_onboarding.py
"""
import base64
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BENCH = ROOT / "docs/benchmark"

M = "https://mobbin.com/"
LINKS = {
    "klima-intro": M + "flows/c9c02ea6-6d8f-4bb7-ba1a-4c74fdfb858c",
    "klima-impact": M + "flows/c9c02ea6-6d8f-4bb7-ba1a-4c74fdfb858c",
    "klima-final": M + "flows/c9c02ea6-6d8f-4bb7-ba1a-4c74fdfb858c",
    "shell-pump": M + "screens/5c7015c5-378b-4e45-8f63-078f95d24697",
    "qantas-skip": M + "screens/913592c2-f0c9-448e-aa8a-4ff87214de51",
    "lyft-safe": M + "screens/56d62cbe-b828-4ea1-accc-8a0615c521d5",
    "monzo-tag": M + "screens/41a8638a-ccd1-45ed-85e7-63efcc660d39",
    "oura-counter": M + "screens/acae5fb3-f499-45af-8cd9-a4690d8e0fcd",
    "tinder-primer": M + "flows/efc405e6-4272-4147-9382-46903f3836d9",
    "tinder-reassure": M + "flows/efc405e6-4272-4147-9382-46903f3836d9",
    "tinder-blocked": M + "screens/979f2e22-862f-4ece-997b-095ad9345732",
    "greenlight-primer": M + "flows/a6ce754b-866e-430b-bb8d-6199102da393",
    "greenlight-system": M + "flows/a6ce754b-866e-430b-bb8d-6199102da393",
    "greenlight-success": M + "flows/a6ce754b-866e-430b-bb8d-6199102da393",
    "greenlight-steps": M + "flows/a6ce754b-866e-430b-bb8d-6199102da393",
    "nextdoor-name": M + "flows/68adea93-572d-468c-b5ce-ec9663370485",
    "nextdoor-address": M + "screens/f6f3119b-367a-4861-ab38-b8ab9c2b9bf1",
    "nextdoor-pin": M + "screens/465cfb62-87a9-4eec-8ec3-d8e9b7e71113",
    "nextdoor-reco": M + "flows/68adea93-572d-468c-b5ce-ec9663370485",
    "nextdoor-checklist": M + "flows/68adea93-572d-468c-b5ce-ec9663370485",
    "dice-location": M + "flows/e9d93fcf-a660-4ba8-a77c-c78aa86ea089",
    "dice-search": M + "flows/e9d93fcf-a660-4ba8-a77c-c78aa86ea089",
    "dice-notif": M + "flows/e9d93fcf-a660-4ba8-a77c-c78aa86ea089",
    "klarna-sheet": M + "flows/65b3934e-4537-48e8-afe6-755627983a81",
    "paypal-denied": M + "screens/99f9912d-7868-406d-9eed-fc3b85672d5a",
    "zesty-denied": M + "screens/281cb1ee-3095-4ada-902c-10e24ff8bc01",
    "viator-settings": M + "screens/09a7f88b-d115-4901-ba5f-6743ba859784",
    "lex-banner": M + "screens/4d2e0a34-7947-4293-828a-b421e44dfd85",
    "zara-later": M + "flows/c7461e71-6158-43bc-8419-7a877100e9fc",
    "cosmos-field": M + "flows/57c31f5e-c70f-4e26-8e91-55582612ed9c",
    "letterboxd-dense": M + "flows/92e67f31-c0a9-416a-8cbd-370db568a8c7",
    "strava-tiles": M + "screens/ddbaede6-f037-4540-b46a-703d60c8aa35",
    "tiktok-chips": M + "screens/f29f965f-7d81-4314-bbeb-b3bee2885baa",
}

base = (BENCH / "benchmark-mobbin.html").read_text(encoding="utf-8")
base_css = re.search(r"<style>(.*?)</style>", base, re.S).group(1)
src = (BENCH / "src/onboarding.html").read_text(encoding="utf-8")
src = src.replace("/*BASE_CSS*/", base_css.strip())


def shot(m):
    key, caption = m.group(1), m.group(2)
    data = base64.b64encode((BENCH / "screens/onboarding" / f"{key}.jpg").read_bytes()).decode()
    cap = html.escape(caption, quote=False)
    return (f'<figure class="shot"><a href="{LINKS[key]}" target="_blank" rel="noopener">'
            f'<img src="data:image/jpeg;base64,{data}" alt="{html.escape(caption)}" loading="lazy" width="299" height="678"></a>'
            f"<figcaption>{cap}</figcaption></figure>")


out, n = re.subn(r"\{\{shot:([a-z0-9-]+)\|([^}]+)\}\}", shot, src)
assert "{{" not in out, "jeton non remplacé"
(BENCH / "onboarding-mobbin.html").write_text(out, encoding="utf-8")
print(f"docs/benchmark/onboarding-mobbin.html : {n} captures, {len(out) // 1024} Ko")
