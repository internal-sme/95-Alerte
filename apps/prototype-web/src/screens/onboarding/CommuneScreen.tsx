import { CommunePicker } from "@/screens/onboarding/CommunePicker";
import { useActions, useStore } from "@/store/store";

/* Depuis la carte : changer de commune (recherche de la carte, bannière « position non définie ») */
export function CommuneScreen() {
  const { dispatch } = useStore();
  const { pop, toast } = useActions();
  return <CommunePicker title="Changer de commune" onBack={pop} onPick={(c, source) => { dispatch({ type: "SET_COMMUNE", communeId: c.id, source }); pop(); toast(`Commune : ${c.name}.`); }} />;
}
