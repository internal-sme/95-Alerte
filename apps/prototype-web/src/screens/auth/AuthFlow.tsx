import { LoginScreen } from "@/screens/auth/LoginScreen";
import { AUTH_SCREENS } from "@/screens/auth/auth";
import { useStore } from "@/store/store";

export function AuthFlow() {
  const { state } = useStore();
  const C = AUTH_SCREENS[state.auth.step] || LoginScreen;
  return <C />;
}
