import type { ReactNode } from "react";
export interface PillProps {
  children: ReactNode;
  onClick: (...args: any[]) => any;
  dot?: boolean;
}

export function Pill({ children, onClick, dot = true }: PillProps) {
  return (
    <button type="button" className="pill" onClick={onClick}>
      {dot ? <span className="dot-new" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
