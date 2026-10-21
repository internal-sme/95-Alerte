import { Spot } from "@/components/Spot";
import { ScreenHeader } from "@/navigation/ScreenHeader";
import { useActions } from "@/store/store";
import type { ReactNode } from "react";

/* États sans contenu (supprimée, modérée, introuvable, erreur) : Spot Phosphor Duotone, une issue */
export interface DetailStateProps {
  icon: string;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export function DetailState({ icon, title, children, actions }: DetailStateProps) {
  const { pop } = useActions();
  return (
    <div className="screen detail-screen">
      <ScreenHeader title="Alerte" onBack={pop} />
      <div className="detail-state">
        <Spot icon={icon} tone="neutral" />
        <h2>{title}</h2>
        <p>{children}</p>
        {actions}
      </div>
    </div>
  );
}
