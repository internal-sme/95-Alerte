import { cx } from "@/utils/index";
import type { CSSProperties } from "react";

export interface ClusterMarkerProps {
  count: any;
  onClick: (...args: any[]) => any;
  style?: CSSProperties;
}

export function ClusterMarker({ count, onClick, style }: ClusterMarkerProps) {
  const size = count < 10 ? "c-s" : count < 30 ? "c-m" : "c-l";
  return <button type="button" className={cx("cluster", size)} style={{ ...style, cursor: "pointer" }} onClick={onClick} aria-label={`${count} alertes regroupées, zoomer`}>{count}</button>;
}
