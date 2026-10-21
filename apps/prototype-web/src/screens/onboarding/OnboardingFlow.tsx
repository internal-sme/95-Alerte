import { OnboardingSlides } from "@/screens/onboarding/OnboardingSlides";
import { ONB_SCREENS } from "@/screens/onboarding/onboarding";
import { useStore } from "@/store/store";

export function OnboardingFlow() {
  const { state } = useStore();
  const C = ONB_SCREENS[state.onb.step] || OnboardingSlides;
  return <C />;
}
