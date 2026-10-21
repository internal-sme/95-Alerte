import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: string;
  tone?: string;
  title: ReactNode;
  children?: ReactNode;
  action?: any;
}

export function EmptyState({ icon = "map-trifold", tone, title, children, action }: EmptyStateProps) {
  const ill = tone === "error" ? { color: "var(--alert-incident)", background: "var(--alert-incident-soft)" } : undefined;
  return (
    <div className="empty">
      <span className="empty-ill" style={ill}><Icon name={icon} style={{ width: 32, height: 32 }} /></span>
      <h4>{title}</h4>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
