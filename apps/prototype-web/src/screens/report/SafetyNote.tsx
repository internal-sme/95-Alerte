import { Icon } from "@/components/Icon";

export interface SafetyNoteProps {
  onClick: (...args: any[]) => any;
}

export function SafetyNote({ onClick }: SafetyNoteProps) {
  return (
    <button type="button" className="emergency-note" onClick={onClick}>
      <Icon name="siren-fill" />
      <span><b>Ne signalez que si vous êtes en sécurité.</b>95 Alerte ne prévient pas les secours. En cas d'urgence, appelez le 112.</span>
      <Icon name="caret-right" className="ph-sm" />
    </button>
  );
}
