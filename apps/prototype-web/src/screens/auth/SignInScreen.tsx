import { useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { AuthStep } from "@/screens/auth/AuthStep";
import { useActions, useStore } from "@/store/store";
import { useOnline } from "@/utils/index";

export function SignInScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [email, setEmail] = useState(state.auth.form.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const submit = online(() => {
    if (!email.includes("@") || password.length < 4) { setError("Vérifiez votre e-mail et votre mot de passe (4 caractères minimum)."); return; }
    dispatch({ type: "LOGIN", method: "compte", identity: "verifiee", message: "Vous êtes connecté." });
  });
  return (
    <AuthStep title="Se connecter" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })}
      question="Content de vous revoir" lead="Connectez-vous avec l'adresse e-mail de votre compte 95 Alerte." onSubmit={submit}
      footer={<Button block type="submit">Se connecter</Button>}>
      <Field id="signin-email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
      <Field id="signin-password" label="Mot de passe" type="password" autoComplete="current-password" value={password} error={error} onChange={(e) => { setPassword(e.target.value); setError(null); }} />
      <Button variant="ghost" className="btn-inline" onClick={() => toast("Un lien de réinitialisation vous a été envoyé par e-mail.")}>Mot de passe oublié ?</Button>
    </AuthStep>
  );
}
