import { Icon } from "@/components/Icon";

/* Rappel d'urgence (catégories critiques) : ouvre l'écran « Situation urgente ? » */
export interface EmergencyNoteProps {
  onClick: (...args: any[]) => any;
}

export function EmergencyNote({ onClick }: EmergencyNoteProps) {
  return (
    <button type="button" className="emergency-note" onClick={onClick}>
      <Icon name="siren-fill" />
      <span><b>Situation urgente ?</b>95 Alerte ne prévient pas les secours. Appelez le 112.</span>
      <Icon name="caret-right" className="ph-sm" />
    </button>
  );
}
