import { cx } from "@/utils/index";
import type { CSSProperties } from "react";

export interface IconProps {
  name: string;
  className?: string;
  label?: string;
  style?: CSSProperties;
}

export function Icon({ name, className, label, style }: IconProps) {
  return (
    <svg className={cx("ph", className)} style={style} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <use href={`#ph-${name}`} />
    </svg>
  );
}
