import { useState } from "react";
import { Button } from "@/components/Button";
import { OnboardingTop } from "@/screens/onboarding/OnboardingTop";
import { StepProgress } from "@/screens/onboarding/StepProgress";
import { SystemLocationPrompt } from "@/screens/onboarding/SystemLocationPrompt";
import { ZoneMap } from "@/screens/onboarding/ZoneMap";
import { ONB_STEPS } from "@/screens/onboarding/onboarding";
import { NEAR_KM } from "@/screens/tabs/mapArt";
import { DEFAULT_POSITION, useActions, useStore } from "@/store/store";

/* UI-007 : amorce allégée à trois éléments (Tinder) ; le détail passe dans une feuille */
export function LocationPrimer() {
  const { state, dispatch } = useStore();
  const { openSheet } = useActions();
  const [asking, setAsking] = useState(false);
  const [locating, setLocating] = useState(false);
  const answer = (perm) => {
    setAsking(false);
    const result = state.demo.permissionDenied ? "denied" : perm;
    if (result === "denied") { dispatch({ type: "LOCATION_RESULT", permission: "denied" }); dispatch({ type: "ONB_GO", step: "denied" }); return; }
    dispatch({ type: "LOCATION_RESULT", permission: "granted" });
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      if (state.demo.gpsUnavailable) dispatch({ type: "ONB_GO", step: "unavailable" });
      else dispatch({ type: "ONB_GO", step: "detected" });
    }, 1200);
  };
  return (
    <div className="screen auth onb">
      <OnboardingTop skipLabel="Plus tard" onSkip={() => dispatch({ type: "ONB_FINISH", permission: "later" })} />
      <div className="screen-pad">
        <StepProgress step={1} total={ONB_STEPS} />
        <div className="zone-scene"><ZoneMap center={DEFAULT_POSITION} radiusKm={NEAR_KM} height={240} pins={false} label={false} /></div>
        <div className="auth-intro">
          <h1 className="onb-title" style={{ textAlign: "left" }}>Voir les alertes <mark className="hl">près de chez vous</mark>&nbsp;?</h1>
          <p className="onb-text" style={{ textAlign: "left", maxWidth: "none" }}>Votre position reste approximative. Elle n'est jamais publiée.</p>
        </div>
      </div>
      <div className="screen-footer stack-footer">
        <Button block icon="navigation-arrow" loading={locating} onClick={() => setAsking(true)}>{locating ? "Recherche de votre position…" : "Autoriser la localisation"}</Button>
        <Button block variant="secondary" onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Choisir ma commune</Button>
        <Button block variant="ghost" onClick={() => openSheet("location-why")}>Comment ma position est utilisée&nbsp;?</Button>
      </div>
      {asking ? <SystemLocationPrompt onAnswer={answer} /> : null}
    </div>
  );
}
