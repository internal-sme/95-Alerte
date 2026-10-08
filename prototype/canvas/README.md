# Canevas de preview du prototype

Sources du canevas Design publié : https://claude.ai/artifact/Sd2XN1KjGF8LzZ1rtBfvm4

- `project/canvas.json` : disposition des planches (rangées clair, sombre, états et composants).
- `project/*.dc.html` : une planche par écran, dans un cadre iPhone (414 × 868), reliées par des liens (bouton Play = prototype cliquable).
  Les planches `*-dark.dc.html` montent l'écran clair correspondant avec `dark`.
- Feuille de style partagée : générée par `python3 tools/build_canvas_css.py`, puis téléversée
  comme ressource du canevas (`/_blob/afae059a4a33057ea9103f53bff2f3fb`). À re-téléverser et
  re-pointer dans chaque planche si le Design System change.

À chaque phase terminée, ajouter ou mettre à jour les planches des nouveaux écrans.
La version React complète reste `prototype/index.html`.
