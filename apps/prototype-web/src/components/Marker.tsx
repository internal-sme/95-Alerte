import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { MARKER_SHAPES } from "@/components/meta";
import { cx } from "@/utils/index";
import type { CSSProperties } from "react";

export interface MarkerProps {
  family: string;
  icon: string;
  selected?: any;
  critical?: any;
  label?: string;
  style?: CSSProperties;
  onClick?: (...args: any[]) => any;
  dataId?: any;
}

export function Marker({ family, icon, selected, critical, label, style, onClick, dataId }: MarkerProps) {
  const content = (
    <Fragment>
      <svg className="shape" viewBox="0 0 36 36" aria-hidden="true">{MARKER_SHAPES[family]}</svg>
      <Icon name={`${icon}-fill`} style={family === "vigilance" ? { top: 4 } : undefined} />
      {critical ? <span className="marker-label">Urgent</span> : null}
    </Fragment>
  );
  const cls = cx("marker", `fam-${family}`, selected && "is-selected", critical && "is-critical");
  if (onClick) return <button type="button" className={cls} style={{ ...style, border: 0, background: "none", padding: 0, cursor: "pointer" }} aria-label={label} onClick={onClick} data-alert={dataId}>{content}</button>;
  return <span className={cls} style={style} role={label ? "img" : undefined} aria-label={label}>{content}</span>;
}
