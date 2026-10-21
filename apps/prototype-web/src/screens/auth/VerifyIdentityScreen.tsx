import { useState } from "react";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { IdentityDocStep } from "@/screens/auth/IdentityDocStep";
import { IdentityStatusView } from "@/screens/auth/IdentityStatusView";
import { useActions, useStore } from "@/store/store";

/* Vérification depuis le profil (compte non vérifié) */
export function VerifyIdentityScreen() {
  const { dispatch } = useStore();
  const { pop, toast } = useActions();
  const [sent, setSent] = useState(false);
  if (!sent) return <IdentityDocStep onBack={pop} onSent={() => setSent(true)} />;
  return (
    <div className="screen auth">
      <AuthHeader title="Vérifier mon identité" onBack={pop} />
      <IdentityStatusView onRetry={() => setSent(false)} onContinue={() => {
        dispatch({ type: "SET_IDENTITY", identity: "result" });
        pop();
        toast("Statut d'identité mis à jour.");
      }} />
    </div>
  );
}
