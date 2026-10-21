import { IconButton } from "@/components/IconButton";
import { activeFilterCount } from "@/filters/filters";
import { useActions, useStore } from "@/store/store";
import { cx } from "@/utils/index";

export interface FilterButtonProps {
  flat?: any;
}

export function FilterButton({ flat }: FilterButtonProps) {
  const { state } = useStore();
  const { openSheet } = useActions();
  const n = activeFilterCount(state.mapFilter);
  return <IconButton icon="sliders-horizontal" className={cx("is-filter", flat && "flat")} label={`Filtres${n ? `, ${n} actif${n > 1 ? "s" : ""}` : ""}`} badge={n || null} onClick={() => openSheet("map-filters", {}, "full")} />;
}
