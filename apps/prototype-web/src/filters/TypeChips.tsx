import { Chip } from "@/components/Chip";
import { useStore } from "@/store/store";

/* Puces de type et bouton Filtres : partagés par la carte et l'onglet Alertes (même filtre) */
export function TypeChips() {
  const { state, dispatch } = useStore();
  return (
    <div className="map-chips" role="group" aria-label="Type d'alertes">
      {[{ v: "all", l: "Toutes" }, { v: "positive", l: "Positives" }, { v: "negative", l: "Négatives" }].map((o) => (
        <Chip key={o.v} selected={state.mapFilter.type === o.v} onClick={() => dispatch({ type: "SET_MAP_FILTER", patch: { type: o.v } })}>{o.l}</Chip>
      ))}
    </div>
  );
}
