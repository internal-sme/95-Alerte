import { Fragment } from "react";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Benefits } from "@/screens/auth/Benefits";

export function LocationWhySheet() {
  return (
    <Fragment>
      <Benefits items={[
        { icon: "map-pin", title: "Les alertes de votre zone", text: "Positives et négatives, en direct." },
        { icon: "path", title: "La distance sur chaque alerte", text: "Pour savoir si vous êtes concerné." },
        { icon: "crosshair", title: "Le lieu déjà rempli quand vous signalez", text: "Vous pourrez toujours le modifier." },
      ]} />
      <ul className="why-list">
        <li>Sur une alerte publiée, la précision dépend de la catégorie : rue, quartier ou zone.</li>
        <li>Vous pouvez la désactiver à tout moment dans les réglages du téléphone.</li>
      </ul>
      <PrivacyNote>Votre position reste approximative par défaut. Elle n'est jamais affichée publiquement.</PrivacyNote>
    </Fragment>
  );
}
