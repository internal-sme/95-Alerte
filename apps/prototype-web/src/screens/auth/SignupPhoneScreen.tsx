import { useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { PrivacyNote } from "@/components/PrivacyNote";
import { AuthStep } from "@/screens/auth/AuthStep";
import { OtpInput } from "@/screens/auth/OtpInput";
import { maskPhone } from "@/screens/auth/auth";
import { useActions, useStore } from "@/store/store";
import { useOnline } from "@/utils/index";

/* Étape 2 : le numéro, puis le code reçu par SMS */
export function SignupPhoneScreen() {
  const { state, dispatch } = useStore();
  const { toast } = useActions();
  const online = useOnline();
  const [phase, setPhase] = useState("number");
  const [phone, setPhone] = useState(state.auth.form.phone);
  const [phoneError, setPhoneError] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const back = () => dispatch({ type: "AUTH_GO", step: "signup-info" });
  if (phase === "number") {
    const send = online(() => {
      if (phone.replace(/\D/g, "").length !== 10) { setPhoneError("Saisissez un numéro à 10 chiffres."); return; }
      dispatch({ type: "AUTH_SET", patch: { form: { ...state.auth.form, phone } } });
      setPhase("code");
    });
    return (
      <AuthStep title="Créer un compte" step={2} onBack={back}
        question="Votre numéro de mobile" lead="Nous vous envoyons un code par SMS."
        onSubmit={send} footer={<Button block type="submit">Recevoir le code</Button>}>
        <Field id="su-phone" label="Téléphone mobile" type="tel" autoComplete="tel" inputMode="tel" value={phone} error={phoneError} onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }} />
        <PrivacyNote>Votre numéro n'est jamais affiché. Il sert uniquement à sécuriser votre compte.</PrivacyNote>
      </AuthStep>
    );
  }
  const submit = online(() => {
    if (code === "000000") { setError("Code incorrect. Vérifiez le SMS ou demandez un nouveau code."); return; }
    dispatch({ type: "AUTH_GO", step: "signup-email" });
  });
  return (
    <AuthStep title="Créer un compte" step={2} onBack={() => { setPhase("number"); setCode(""); setError(null); }}
      question="Saisissez le code reçu" lead={`Envoyé par SMS au ${maskPhone(phone)}.`}
      onSubmit={submit} footer={<Button block type="submit" disabled={code.length !== 6}>Vérifier</Button>}>
      <OtpInput id="otp" value={code} onChange={(v) => { setCode(v); setError(null); }} error={error} />
      {error ? <span className="err" id="otp-err" role="alert"><Icon name="warning-fill" className="ph-sm" />{error}</span> : null}
      <Button variant="ghost" className="btn-inline" icon="arrows-clockwise" onClick={() => { setCode(""); setError(null); toast("Un nouveau code vous a été envoyé."); }}>Renvoyer le code</Button>
    </AuthStep>
  );
}
