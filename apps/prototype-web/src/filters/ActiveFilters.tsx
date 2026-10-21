import { Icon } from "@/components/Icon";
import { CATEGORY_BY_ID } from "@/data/seed";
import { DISTANCES, PERIODS } from "@/filters/filters";
import { useStore } from "@/store/store";

/* Filtres actifs en puces retirables + « Effacer les filtres » (Uber Eats, Gojek) */
export function ActiveFilters() {
  const { state, dispatch } = useStore();
  const f = state.mapFilter;
  const set = (patch) => dispatch({ type: "SET_MAP_FILTER", patch });
  const items = [
    ...f.categories.map((id) => ({ k: id, l: CATEGORY_BY_ID[id].label, off: () => set({ categories: f.categories.filter((x) => x !== id) }) })),
    f.period !== "all" ? { k: "period", l: `Moins de ${PERIODS.find((p) => p.v === f.period).l}`.replace("Moins de Aujourd'hui", "Aujourd'hui"), off: () => set({ period: "all" }) } : null,
    f.distance ? { k: "dist", l: `${DISTANCES.find((d) => d.v === f.distance).l} autour`, off: () => set({ distance: null }) } : null,
    f.urgentOnly ? { k: "urgent", l: "Urgentes", off: () => set({ urgentOnly: false }) } : null,
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="active-filters" role="group" aria-label="Filtres actifs">
      {items.map((it) => <button key={it.k} type="button" className="chip is-active" onClick={it.off} aria-label={`Retirer le filtre ${it.l}`}>{it.l}<Icon name="x" /></button>)}
      <button type="button" className="btn btn-tertiary" onClick={() => dispatch({ type: "RESET_MAP_FILTER" })}>Effacer les filtres</button>
    </div>
  );
}
