import { Button } from "@/components/Button";
import { COMMUNE_BY_ID } from "@/data/seed";
import { MapStyleChoice } from "@/map/MapStyleChoice";
import { StepProgress } from "@/screens/onboarding/StepProgress";
import { ZoneMap } from "@/screens/onboarding/ZoneMap";
import { ONB_STEPS, zoneRadius } from "@/screens/onboarding/onboarding";
import { DEFAULT_POSITION, useStore } from "@/store/store";

export function OnboardingMapStyle() {
  const { state, dispatch } = useStore();
  const p = state.onb.pending || {};
  const c = p.communeId ? COMMUNE_BY_ID[p.communeId] : null;
  const center = p.coords || (c ? { lat: c.lat, lng: c.lng } : DEFAULT_POSITION);
  return (
    <div className="screen auth onb detected onb-zone onb-mapstyle">
      <ZoneMap center={center} radiusKm={zoneRadius(state)} />
      <div className="detected-panel">
        <StepProgress step={3} total={ONB_STEPS} />
        <h1 className="onb-title">Quelle carte préférez-vous ?</h1>
        <p className="onb-text">Les alertes s'affichent de la même façon sur les deux.</p>
        <MapStyleChoice center={center} />
        <p className="demo-note">Modifiable à tout moment : Profil › Affichage › Fond de carte.</p>
        <Button block onClick={() => dispatch({ type: "ONB_GO", step: "prep" })}>Continuer</Button>
      </div>
    </div>
  );
}
