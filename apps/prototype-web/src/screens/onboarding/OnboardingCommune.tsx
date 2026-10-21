import { CommunePicker } from "@/screens/onboarding/CommunePicker";
import { useStore } from "@/store/store";

export function OnboardingCommune() {
  const { state, dispatch } = useStore();
  const back = () => dispatch({ type: "ONB_GO", step: state.session.position.permission === "denied" ? "denied" : "location" });
  return <CommunePicker onBack={back} onPick={(c, source) => dispatch({ type: "ONB_GO", step: "map-style", pending: { communeId: c.id, source } })} />;
}
