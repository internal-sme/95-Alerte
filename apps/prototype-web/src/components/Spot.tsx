import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";

/* Illustration ponctuelle : icône Phosphor Duotone dans une pastille (même bibliothèque que l'interface,
   pas de dessin maison). Fond jaune de marque doux, ou teinte de la famille pour les tons positif/erreur. */
export interface SpotProps {
  icon: string;
  tone?: string;
  size?: string;
}

export function Spot({ icon, tone, size }: SpotProps) {
  return <span className={cx("spot", tone && `tone-${tone}`, size && `spot-${size}`)} aria-hidden="true"><Icon name={`${icon}-duotone`} /></span>;
}
