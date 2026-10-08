# Canevas de preview du prototype

Sources du canevas Design publié : https://claude.ai/artifact/Sd2XN1KjGF8LzZ1rtBfvm4

- `project/canvas.json` : disposition des planches (rangées clair, sombre, états et composants).
- `project/*.dc.html` : une planche par écran, reliées par des liens (bouton Play = prototype cliquable).
  Les planches `*-dark.dc.html` montent l'écran clair correspondant avec `dark`.
  `AlertCard.dc.html` est le composant carte d'alerte, monté par les écrans (`<dc-import name="AlertCard" row=…>`).
- Feuille de style partagée : générée par `python3 tools/build_canvas_css.py`, puis téléversée
  comme ressource du canevas (`/_blob/79083ea7a8d50397cf9d20db824b6129`). À re-téléverser et
  re-pointer dans chaque planche si le Design System change.

À chaque phase terminée, ajouter ou mettre à jour les planches des nouveaux écrans.
La version React complète reste `prototype/index.html`.
