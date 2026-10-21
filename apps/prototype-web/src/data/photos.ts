import { ASSETS } from "@/assets";

/* G4 : photos de démonstration générées avec Magnific (rues du Val-d'Oise, personne d'identifiable),
   embarquées par tools/build_prototype.py depuis prototype/src/alertes/<id>-<n>.webp. Sans photo : mini-carte. */
export const ALERT_PHOTOS = ASSETS.ALERT_PHOTOS || {};

export const PHOTO_ALT = {
  "a1-1": "Fumée noire au-dessus des immeubles, vue depuis la rue près de la gare de Pontoise",
  "a1-2": "Fumée grise qui s'échappe du toit d'une maison ancienne en pierre, rue Carnot",
  "a4-1": "Bénévoles gantés qui remplissent des sacs-poubelle sur la pelouse du parc",
  "a6-1": "Nid-de-poule rempli d'eau au milieu de la chaussée",
  "a8-1": "Gros arbre déraciné tombé en travers de la rue, sur une voiture jaune garée",
  "a30-1": "Chemin de halage recouvert par l'Oise, banc à moitié dans l'eau",
};

export function alertPhotos(alert) {
  if (alert.photos) return alert.photos.filter((k) => ALERT_PHOTOS[k]).map((k, i) => ({ id: `${alert.id}-${i}`, src: ALERT_PHOTOS[k], alt: PHOTO_ALT[k] }));
  return Object.keys(PHOTO_ALT).filter((k) => k.startsWith(`${alert.id}-`) && ALERT_PHOTOS[k]).map((k) => ({ id: k, src: ALERT_PHOTOS[k], alt: PHOTO_ALT[k] }));
}
