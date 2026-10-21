import { Icon } from "@/components/Icon";

/* Demande système simulée, coachée (Life360) : le bon choix est désigné, jamais « Toujours » */
export interface SystemLocationPromptProps {
  onAnswer: (...args: any[]) => any;
}

export function SystemLocationPrompt({ onAnswer }: SystemLocationPromptProps) {
  return (
    <div className="modal-scrim coach" role="presentation">
      <p className="coach-title" aria-hidden="true">Choisissez <mark className="hl">«&nbsp;Pendant l'utilisation&nbsp;»</mark></p>
      <div className="modal sys-prompt" role="alertdialog" aria-modal="true" aria-labelledby="sys-title" aria-describedby="sys-body">
        <Icon name="navigation-arrow-fill" className="sys-icon" />
        <h2 id="sys-title">Autoriser « 95 Alerte » à utiliser votre position&nbsp;?</h2>
        <p id="sys-body">Votre position sert à afficher les alertes proches de vous.</p>
        <div className="sys-actions">
          <button type="button" className="is-recommended" onClick={() => onAnswer("granted")}>Autoriser pendant l'utilisation</button>
          <button type="button" onClick={() => onAnswer("granted")}>Autoriser une fois</button>
          <button type="button" onClick={() => onAnswer("denied")}>Ne pas autoriser</button>
        </div>
        <p className="sys-note">Simulation de la demande du téléphone</p>
      </div>
    </div>
  );
}
