import { Icon } from "@/components/Icon";
import { STATUS_META } from "@/components/meta";
import { cx } from "@/utils/index";

export interface StatusBadgeProps {
  status: any;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const m = STATUS_META[status] || STATUS_META.active;
  return <span className={cx("badge", "badge-status", m.cls)}><Icon name={m.icon} />{label || m.label}</span>;
}
