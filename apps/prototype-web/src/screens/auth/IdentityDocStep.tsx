import { useState } from "react";
import { Button } from "@/components/Button";
import { PrivacyNote } from "@/components/PrivacyNote";
import { RadioCard } from "@/components/RadioCard";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { Benefits } from "@/screens/auth/Benefits";
import { ID_DOCS } from "@/screens/auth/auth";
import { useStore } from "@/store/store";
import { useOnline } from "@/utils/index";

/* Vérification d'identité : choix du document puis statut (utilisé à l'inscription et depuis le profil) */
export interface IdentityDocStepProps {
  onSent: (...args: any[]) => any;
  onLater?: (...args: any[]) => any;
  step?: number;
  onBack: (...args: any[]) => any;
}

export function IdentityDocStep({ onSent, onLater, step, onBack }: IdentityDocStepProps) {
  const { state, dispatch } = useStore();
  const online = useOnline();
  const [doc, setDoc] = useState(state.auth.docType);
  const [sending, setSending] = useState(false);
  const send = online(() => {
    setSending(true);
    setTimeout(() => { setSending(false); dispatch({ type: "AUTH_SET", patch: { docType: doc } }); onSent(); }, 900);
  });
  return (
    <div className="screen auth">
      <AuthHeader title={step ? "Créer un compte" : "Vérifier mon identité"} step={step} onBack={onBack} />
      <div className="screen-pad">
        <div className="auth-intro">
          <h2 className="question">Vérifiez votre identité</h2>
          <p className="auth-lead">Une seule fois, environ 1 minute.</p>
        </div>
        <Benefits items={[
          { icon: "seal-check", title: "Badge « Identité vérifiée »", text: "Affiché sur votre profil." },
          { icon: "megaphone", title: "Signalements traités en priorité", text: "Les services savent qu'ils viennent d'une personne réelle." },
        ]} />
        <section className="list-section">
          <h2 className="section-label">Votre document</h2>
          {ID_DOCS.map((d) => <RadioCard key={d.id} name="id-doc" value={d.id} checked={doc === d.id} onChange={setDoc} icon="identification-card" title={d.label} description={d.hint} />)}
        </section>
        <PrivacyNote icon="eye-slash">Votre document sert uniquement à la vérification. Il n'est jamais affiché publiquement.</PrivacyNote>
      </div>
      <div className="screen-footer stack-footer">
        <Button block icon="camera" loading={sending} onClick={send}>{sending ? "Envoi du document…" : "Prendre le document en photo"}</Button>
        {onLater ? <Button block variant="ghost" onClick={onLater}>Plus tard</Button> : null}
      </div>
    </div>
  );
}
