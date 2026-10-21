import { Icon } from "@/components/Icon";

export interface IdentityBadgeProps {
  status: any;
}

export function IdentityBadge({ status }: IdentityBadgeProps) {
  if (status === "verifiee") return <span className="badge badge-status st-done"><Icon name="seal-check-fill" />Identité vérifiée</span>;
  if (status === "en_cours") return <span className="badge badge-status st-soon"><Icon name="timer" />Vérification en cours</span>;
  return <span className="badge badge-status st-draft"><Icon name="identification-card" />Identité non vérifiée</span>;
}
