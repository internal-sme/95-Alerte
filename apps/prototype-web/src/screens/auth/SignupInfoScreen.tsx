import { useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { PrivacyNote } from "@/components/PrivacyNote";
import { AuthStep } from "@/screens/auth/AuthStep";
import { useStore } from "@/store/store";

/* Étape 1 : le nom (un seul sujet par écran) */
export function SignupInfoScreen() {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState(state.auth.form);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: null }); };
  const submit = () => {
    const err: Record<string, string> = {};
    if (!form.firstName.trim()) err.firstName = "Indiquez votre prénom.";
    if (!form.lastName.trim()) err.lastName = "Indiquez votre nom.";
    setErrors(err);
    if (Object.keys(err).length) return;
    dispatch({ type: "AUTH_SET", patch: { form, step: "signup-phone" } });
  };
  const initial = (form.lastName.trim() || " ")[0];
  return (
    <AuthStep title="Créer un compte" step={1} onBack={() => dispatch({ type: "AUTH_GO", step: "login" })}
      question="Bienvenue ! Comment vous appelez-vous ?" lead="4 étapes, environ 2 minutes."
      onSubmit={submit} footer={<Button block type="submit">Continuer</Button>}>
      <Field id="su-first" label="Prénom" autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={set("firstName")} />
      <Field id="su-last" label="Nom" autoComplete="family-name" value={form.lastName} error={errors.lastName} onChange={set("lastName")} />
      {form.firstName.trim() ? <div className="preview-author"><Icon name="eye" />Vous apparaîtrez comme : <b>{form.firstName.trim()} {initial}.</b></div> : null}
      <PrivacyNote>Votre nom complet reste privé. Sur vos alertes identifiées, seuls votre prénom et l'initiale de votre nom apparaissent. Vous pourrez aussi publier anonymement.</PrivacyNote>
    </AuthStep>
  );
}
