import { Icon } from "@/components/Icon";
import { Hl } from "@/screens/search/Hl";
import type { ReactNode } from "react";

export interface SearchRowProps {
  icon?: string;
  marker?: ReactNode;
  label: string;
  sub: any;
  q?: any;
  onClick: (...args: any[]) => any;
}

export function SearchRow({ icon, marker, label, sub, q, onClick }: SearchRowProps) {
  return (
    <button type="button" className="search-row" onClick={onClick}>
      {marker || <span className="sr-ico" aria-hidden="true"><Icon name={icon} /></span>}
      <span className="sr-text"><span className="sr-label"><Hl text={label} q={q} /></span>{sub ? <small>{sub}</small> : null}</span>
      <Icon name="caret-right" className="ph-sm" />
    </button>
  );
}
