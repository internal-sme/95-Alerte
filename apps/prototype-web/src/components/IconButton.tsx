import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";

export interface IconButtonProps {
  icon: string;
  label: string;
  badge?: any;
  className?: string;
  [prop: string]: any;
}

export function IconButton({ icon, label, badge, className, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={cx("icon-btn", className)} aria-label={badge ? `${label}, ${badge} non lues` : label} {...rest}>
      <Icon name={icon} />
      {badge ? <span className="badge-count" aria-hidden="true">{badge}</span> : null}
    </button>
  );
}
