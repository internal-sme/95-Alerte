import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";
import type { Category } from "@/types";

export interface TypeBadgeProps {
  category: Category;
  showFamily?: any;
}

export function TypeBadge({ category, showFamily }: TypeBadgeProps) {
  return (
    <span className={cx("badge", "badge-type", `fam-${category.family}`)}>
      <Icon name={`${category.icon}-fill`} />
      {showFamily ? (category.type === "positive" ? "Positif" : "Négatif") : category.label}
    </span>
  );
}
