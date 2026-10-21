import { Fragment } from "react";
import { Button } from "@/components/Button";
import { Spot } from "@/components/Spot";
import { OnboardingTop } from "@/screens/onboarding/OnboardingTop";
import { useActions, useStore } from "@/store/store";

/* Refus ou position introuvable : jamais bloquant, jamais rouge ; l'alternative passe en action principale */
export interface LocationDeniedProps {
  unavailable?: boolean;
}

export function LocationDenied({ unavailable }: LocationDeniedProps) {
  const { dispatch } = useStore();
  const { openSheet } = useActions();
  return (
    <div className="screen auth onb">
      <OnboardingTop skipLabel="Plus tard" onSkip={() => dispatch({ type: "ONB_FINISH", permission: unavailable ? "granted" : "denied" })} />
      <div className="auth-center">
        <Spot icon="compass" tone="neutral" size="xl" />
        <h1 className="onb-title">{unavailable ? "Position introuvable pour le moment" : <Fragment>Localisation <mark className="hl">désactivée</mark></Fragment>}</h1>
        <p className="onb-text">{unavailable ? "Le téléphone ne trouve pas votre position. Choisissez votre commune : vous pourrez réessayer plus tard." : "Choisissez votre commune : vous verrez les mêmes alertes, sans les distances."}</p>
      </div>
      <div className="screen-footer stack-footer">
        <Button block onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Choisir ma commune</Button>
        {unavailable ? null : <Button block variant="ghost" onClick={() => openSheet("location-help")}>Comment l'activer&nbsp;?</Button>}
      </div>
    </div>
  );
}
