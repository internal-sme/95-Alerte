import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";

export interface ChipProps {
  selected?: any;
  icon?: string;
  children: ReactNode;
  onClick: (...args: any[]) => any;
}

export function Chip({ selected, icon, children, onClick }: ChipProps) {
  return (
    <button type="button" className="chip" aria-pressed={!!selected} onClick={onClick}>
      {selected ? <Icon name="check" /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}
