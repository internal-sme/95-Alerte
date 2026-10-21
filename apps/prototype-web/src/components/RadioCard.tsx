import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

export interface RadioCardProps {
  name: string;
  value: any;
  checked: any;
  onChange: (...args: any[]) => any;
  icon: string;
  iconTone?: any;
  family?: string;
  large?: boolean;
  title: ReactNode;
  description: ReactNode;
}

export function RadioCard({ name, value, checked, onChange, icon, iconTone = "primary", family, large, title, description }: RadioCardProps) {
  const tone = family ? undefined : iconTone === "muted" ? { background: "var(--surface-2)", color: "var(--text-muted)" } : { background: "var(--primary-soft)", color: "var(--primary)" };
  return (
    <label className={cx("radio-card", family && `fam-${family}`, large && "is-large")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="rc-icon" style={tone}><Icon name={icon} className="ph-lg" /></span>
      <span><b>{title}</b><small>{description}</small></span>
      <span className="rc-dot" />
    </label>
  );
}
