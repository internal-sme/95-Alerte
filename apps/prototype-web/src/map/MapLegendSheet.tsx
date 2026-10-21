import { Fragment } from "react";
import { Banner } from "@/components/Banner";
import { Marker } from "@/components/Marker";

/* Feuilles de la carte : légende (« Comprendre la carte ») et filtres */
export function MapLegendSheet() {
  const rows = [
    { m: <Marker family="incident" icon="fire" />, t: "Incident", d: "Losange rouge : incendie, accident, inondation, sécurité." },
    { m: <Marker family="vigilance" icon="traffic-cone" />, t: "Vigilance", d: "Triangle orange : voirie, éclairage, propreté, nuisances." },
    { m: <Marker family="positive" icon="hand-heart" />, t: "Événement positif", d: "Cercle vert : solidarité, culture, sport, environnement." },
    { m: <Marker family="info" icon="megaphone" />, t: "Information", d: "Carré bleu : travaux, information utile." },
    { m: <Marker family="incident" icon="fire" critical />, t: "Urgent", d: "Halo animé et étiquette : alerte critique, signalée en priorité." },
    { m: <span className="cluster c-s">12</span>, t: "Regroupement", d: "Plusieurs alertes proches. Touchez pour zoomer : le groupe se divise." },
    { m: <span className="legend-swatch area fam-incident" />, t: "Alerte de zone", d: "Inondation, travaux : la zone concernée est dessinée autour du marqueur." },
    { m: <span className="legend-swatch zone" />, t: "Votre zone", d: "Le rayon suivi (1, 5 ou 10 km), modifiable dans le profil." },
    { m: <span className="me" />, t: "Vous êtes ici", d: "Avec la précision de la localisation, si vous l'avez autorisée." },
    { m: <span className="legend-swatch outside" />, t: "Hors Val-d'Oise", d: "95 Alerte n'est pas encore disponible dans cette zone." },
  ];
  return (
    <Fragment>
      <ul className="legend-list">
        {rows.map((r) => <li key={r.t}><span className="legend-mark">{r.m}</span><span><b>{r.t}</b>{r.d}</span></li>)}
      </ul>
      <p className="demo-note">Contours des communes : IGN (ADMIN EXPRESS). Quartiers de Cergy, Pontoise, Saint-Ouen-l'Aumône et Osny : découpage fictif pour la démonstration. Vue satellite : images Copernicus Sentinel-2 (4 juin 2023), données libres.</p>
      <Banner tone="info" icon="siren" title="95 Alerte n'est pas un service de secours.">En cas d'urgence, appelez le 112.</Banner>
    </Fragment>
  );
}
