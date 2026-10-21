import type { ReactNode } from "react";
export interface TooltipProps {
  children: ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  return <span className="tooltip" role="tooltip">{children}</span>;
}
