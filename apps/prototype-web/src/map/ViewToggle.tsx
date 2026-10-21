import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";

export interface ViewToggleProps {
  view: string;
  onChange: (...args: any[]) => any;
  floating?: boolean;
}

export function ViewToggle({ view, onChange, floating }: ViewToggleProps) {
  const toList = view === "map";
  return (
    <button type="button" className={cx("view-toggle", floating && "is-floating")} onClick={() => onChange(toList ? "list" : "map")} aria-label={toList ? "Afficher la liste des alertes" : "Afficher la carte"}>
      <Icon name={toList ? "list-bullets" : "map-trifold"} />{toList ? "Liste" : "Carte"}
    </button>
  );
}
