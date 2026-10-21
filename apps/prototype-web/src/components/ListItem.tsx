import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";

export interface ListItemProps {
  icon: string;
  label: ReactNode;
  value?: string;
  onClick?: (...args: any[]) => any;
  chevron?: boolean;
}

export function ListItem({ icon, label, value, onClick, chevron = true }: ListItemProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className="list-item" onClick={onClick} style={onClick ? { width: "100%", border: 0, background: "none", textAlign: "left", cursor: "pointer" } : undefined}>
      {icon ? <Icon name={icon} /> : <span />}
      <span>{label}</span>
      <span className="val">{value}{chevron ? <Icon name="caret-right" className="ph-sm" /> : null}</span>
    </Tag>
  );
}
