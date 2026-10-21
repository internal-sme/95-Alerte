import { useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { PrivacyNote } from "@/components/PrivacyNote";
import { RadioCard } from "@/components/RadioCard";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { IdentityBadge } from "@/screens/auth/IdentityBadge";
import { IDENTITY_FROM_RESULT } from "@/screens/auth/auth";
import { useStore } from "@/store/store";

export function ProfileSetupScreen() {
  const { state, dispatch } = useStore();
  const f = state.auth.form;
  const [display, setDisplay] = useState(state.auth.display);
  const name = display === "first" ? f.firstName : `${f.firstName} ${(f.lastName || " ")[0]}.`;
  const finish = () => dispatch({ type: "AUTH_SET", patch: { display, step: "done" } });
  return (
    <div className="screen auth">
      <AuthHeader title="Votre profil" onBack={() => dispatch({ type: "AUTH_GO", step: state.auth.idResult === "aucune" ? "signup-id" : "id-status" })} />
      <div className="screen-pad">
        <div className="identity">
          <span className="avatar" aria-hidden="true">{f.firstName[0]}{f.lastName[0]}</span>
          <div><b>{f.firstName} {f.lastName}</b><IdentityBadge status={IDENTITY_FROM_RESULT[state.auth.idResult] || "non_verifiee"} /></div>
        </div>
        <section className="list-section">
          <h2 className="section-label">Nom affiché sur vos alertes identifiées</h2>
          <RadioCard name="display" value="initial" checked={display === "initial"} onChange={setDisplay} icon="user-circle" title={`${f.firstName} ${(f.lastName || " ")[0]}.`} description="Prénom et initiale du nom (recommandé)" />
          <RadioCard name="display" value="first" checked={display === "first"} onChange={setDisplay} icon="user-circle" title={f.firstName} description="Prénom seulement" />
        </section>
        <div className="preview-author"><Icon name="eye" />Vous apparaîtrez comme : <b>{name}</b></div>
        <PrivacyNote icon="detective">Pour chaque alerte, vous pourrez aussi choisir de publier anonymement. Votre e-mail et votre téléphone ne sont jamais affichés.</PrivacyNote>
      </div>
      <div className="screen-footer"><Button block onClick={finish}>Terminer</Button></div>
    </div>
  );
}
