import { RadioCard } from "@/components/RadioCard";
import { SORTS } from "@/filters/filters";
import { useActions, useStore } from "@/store/store";

/* Tri de la liste (F1 : « Autour de moi » = tri Distance) */
export function SortSheet() {
  const { state, dispatch } = useStore();
  const { closeSheet } = useActions();
  const hasPos = state.session.position.source !== "default";
  return (
    <div className="sort-list" role="radiogroup" aria-label="Trier la liste par">
      {SORTS.map((o) => {
        const disabled = o.v === "distance" && !hasPos;
        return (
          <RadioCard key={o.v} name="list-sort" value={o.v} checked={state.listSort === o.v} onChange={(v) => { if (!disabled) { dispatch({ type: "SET_LIST_SORT", sort: v }); closeSheet(); } }}
            icon={o.v === "distance" ? "navigation-arrow" : o.v === "recent" ? "clock" : "star"} title={o.l} description={disabled ? "Choisissez votre commune pour trier par distance." : o.d} />
        );
      })}
    </div>
  );
}
