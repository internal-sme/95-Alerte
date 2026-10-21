import { Marker } from "@/components/Marker";
import { cx } from "@/utils/index";
import type { Category } from "@/types";

export interface CategoryTileProps {
  category: Category;
  selected: any;
  onClick: (...args: any[]) => any;
}

export function CategoryTile({ category, selected, onClick }: CategoryTileProps) {
  return (
    <button type="button" className={cx("cat-tile", `fam-${category.family}`)} aria-pressed={!!selected} onClick={onClick}>
      <Marker family={category.family} icon={category.icon} />
      {category.label}
    </button>
  );
}
