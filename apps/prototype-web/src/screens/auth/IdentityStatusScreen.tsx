import { AuthHeader } from "@/screens/auth/AuthHeader";
import { IdentityStatusView } from "@/screens/auth/IdentityStatusView";
import { useStore } from "@/store/store";

export function IdentityStatusScreen() {
  const { dispatch } = useStore();
  return (
    <div className="screen auth">
      <AuthHeader title="Créer un compte" step={4} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-id" })} />
      <IdentityStatusView onContinue={() => dispatch({ type: "AUTH_GO", step: "profile" })} onRetry={() => dispatch({ type: "AUTH_GO", step: "signup-id" })} />
    </div>
  );
}
