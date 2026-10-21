import { IdentityDocStep } from "@/screens/auth/IdentityDocStep";
import { useStore } from "@/store/store";

export function SignupIdentityScreen() {
  const { dispatch } = useStore();
  return (
    <IdentityDocStep step={4} onBack={() => dispatch({ type: "AUTH_GO", step: "signup-email" })}
      onSent={() => dispatch({ type: "AUTH_GO", step: "id-status" })}
      onLater={() => dispatch({ type: "AUTH_SET", patch: { idResult: "aucune", step: "profile" } })} />
  );
}
