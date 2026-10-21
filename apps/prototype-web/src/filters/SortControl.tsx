import { Icon } from "@/components/Icon";
import { SORTS } from "@/filters/filters";
import { useActions, useStore } from "@/store/store";

export function SortControl() {
  const { state } = useStore();
  const { openSheet } = useActions();
  const cur = SORTS.find((o) => o.v === state.listSort);
  return <button type="button" className="sort-chip" onClick={() => openSheet("list-sort", {}, "half")} aria-label={`Trier par : ${cur.l}. Modifier le tri`}><Icon name="arrows-down-up" />{cur.l}<Icon name="caret-down" className="ph-sm" /></button>;
}
