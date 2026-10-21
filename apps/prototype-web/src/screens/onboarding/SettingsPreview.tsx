import { Icon } from "@/components/Icon";

/* Reprise après refus (Polarsteps, Viator) : on montre les réglages au lieu de les décrire */
export function SettingsPreview() {
  return (
    <div className="settings-preview" aria-hidden="true">
      <span className="sp-label">Exemple · Réglages du téléphone</span>
      <span className="sp-row"><span className="sp-ico"><Icon name="navigation-arrow-fill" className="ph-sm" /></span>Position<span className="sp-end">Jamais<Icon name="caret-right" className="ph-sm" /></span></span>
      <Icon name="caret-down" className="sp-arrow" />
      <span className="sp-options">
        <span>Jamais</span>
        <span>Demander la prochaine fois</span>
        <span className="on">Pendant l'utilisation de l'app<Icon name="check" /></span>
      </span>
    </div>
  );
}
