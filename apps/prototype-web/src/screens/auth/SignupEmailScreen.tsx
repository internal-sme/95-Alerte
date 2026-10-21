import { useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Spot } from "@/components/Spot";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { AuthStep } from "@/screens/auth/AuthStep";
import { maskEmail } from "@/screens/auth/auth";
import { useActions, useStore } from "@/store/store";
import { useOnline } from "@/utils/index";

/* Étape 3 : l'adresse e-mail, puis la confirmation par lien */
export function SignupEmailScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [phase, setPhase] = useState("address");
  const [email, setEmail] = useState(state.auth.form.email);
  const [error, setError] = useState(null);
  if (phase === "address") {
    const send = online(() => {
      if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Saisissez une adresse e-mail valide."); return; }
      if (email.trim().toLowerCase() === "deja@exemple.fr") { setError("Cet e-mail est déjà utilisé. Connectez-vous ou utilisez une autre adresse."); return; }
      dispatch({ type: "AUTH_SET", patch: { form: { ...state.auth.form, email } } });
      setPhase("sent");
    });
    return (
      <AuthStep title="Créer un compte" step={3} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-phone" })}
        question="Votre adresse e-mail" lead="Pour vous informer du suivi de vos signalements."
        onSubmit={send} footer={<Button block type="submit">Continuer</Button>}>
        <Field id="su-email" label="E-mail" type="email" autoComplete="email" value={email} error={error} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
        <PrivacyNote>Votre adresse n'est jamais affichée ni partagée.</PrivacyNote>
      </AuthStep>
    );
  }
  return (
    <div className="screen auth">
      <AuthHeader title="Créer un compte" step={3} onBack={() => setPhase("address")} />
      <div className="auth-center">
        <Spot icon="envelope-open" />
        <h2>Confirmez votre adresse e-mail</h2>
        <p>Nous avons envoyé un lien à <b>{maskEmail(email)}</b>. Ouvrez-le pour confirmer votre adresse.</p>
      </div>
      <div className="screen-footer stack-footer">
        <Button block onClick={online(() => { toast("Adresse e-mail confirmée."); dispatch({ type: "AUTH_GO", step: "signup-id" }); })}>J'ai confirmé mon adresse</Button>
        <Button block variant="ghost" onClick={() => toast("Un nouvel e-mail vous a été envoyé.")}>Renvoyer l'e-mail</Button>
      </div>
    </div>
  );
}
