import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";

/* La confidentialité dite là où naît l'inquiétude, sous le champ concerné (Nextdoor) */
export interface PrivacyNoteProps {
  children: ReactNode;
  icon?: string;
}

export function PrivacyNote({ children, icon = "lock-simple" }: PrivacyNoteProps) {
  return <p className="privacy-note"><Icon name={icon} /><span>{children}</span></p>;
}
