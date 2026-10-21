import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

/* Menu ⋯ : une ligne d'explication par action, la suppression isolée et confirmée (Bluesky, Handshake) */
export interface MenuRowProps {
  icon: string;
  label: string;
  help: ReactNode;
  onClick: (...args: any[]) => any;
  destructive?: boolean;
  more?: boolean;
}

export function MenuRow({ icon, label, help, onClick, destructive, more }: MenuRowProps) {
  return (
    <button type="button" className={cx("menu-row", destructive && "is-destructive")} onClick={onClick}>
      <Icon name={icon} />
      <span><b>{label}</b>{help ? <small>{help}</small> : null}</span>
      {more ? <Icon name="caret-right" className="ph-sm" /> : null}
    </button>
  );
}
