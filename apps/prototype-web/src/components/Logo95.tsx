import { LOGO_RED, LOGO_WORD, LOGO_YELLOW } from "@/screens/auth/auth";
import { cx } from "@/utils/index";

export interface Logo95Props {
  width?: number;
  mark?: boolean;
  label?: string;
  className?: string;
}

export function Logo95({ width = 160, mark = false, label = "95 Alerte", className }: Logo95Props) {
  const vbH = mark ? 146 : 223;
  return (
    <svg className={cx("logo95", className)} viewBox={`0 0 217.2 ${vbH}`} width={width} height={width * vbH / 217.2} role="img" aria-label={label}>
      <g className="logo95-figure">{LOGO_YELLOW.map((d, i) => <path key={i} className="logo95-yellow" d={d} />)}</g>
      <g className="logo95-siren">{LOGO_RED.map((d, i) => <path key={i} className="logo95-red" d={d} />)}</g>
      {mark ? null : <g className="logo95-word">{LOGO_WORD.map((d, i) => <path key={i} d={d} />)}</g>}
    </svg>
  );
}
