import { Fragment } from "react";
import { Button } from "@/components/Button";
import { SettingsPreview } from "@/screens/onboarding/SettingsPreview";
import { useActions } from "@/store/store";

export function LocationHelpSheet() {
  const { closeSheet, toast } = useActions();
  return (
    <Fragment>
      <p className="onb-text" style={{ textAlign: "left", maxWidth: "none" }}>Dans les réglages, touchez <b>Position</b>, puis choisissez <b>Pendant l'utilisation de l'app</b>.</p>
      <SettingsPreview />
      <p className="sr-only">Étapes : ouvrez les Réglages du téléphone, touchez 95 Alerte puis Position, choisissez Pendant l'utilisation de l'app.</p>
      <Button block onClick={() => { closeSheet(); toast("Simulation : les réglages du téléphone s'ouvriraient ici."); }}>Ouvrir les réglages</Button>
      <Button block variant="ghost" onClick={closeSheet}>Non merci</Button>
    </Fragment>
  );
}
