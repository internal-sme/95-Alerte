import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { SegmentedControl } from "@/components/SegmentedControl";
import { COMMUNE_BY_ID } from "@/data/seed";
import { StepProgress } from "@/screens/onboarding/StepProgress";
import { ZoneMap } from "@/screens/onboarding/ZoneMap";
import { ONB_STEPS, ZONE_RADII, zoneRadius } from "@/screens/onboarding/onboarding";
import { useStore, useVisibleAlerts } from "@/store/store";
import { haversineKm } from "@/utils/index";

/* Zone suivie (Life360) : commune détectée, cercle du rayon sur la carte, rayon réglable */
export function CommuneDetected() {
  const { state, dispatch } = useStore();
  const alerts = useVisibleAlerts();
  const commune = COMMUNE_BY_ID.pontoise;
  const gps = { lat: 49.05388, lng: 2.09924 };
  const r = zoneRadius(state);
  const near = alerts.filter((a) => haversineKm(gps, a) <= r).length;
  return (
    <div className="screen auth onb detected onb-zone">
      <ZoneMap center={gps} radiusKm={r} />
      <div className="detected-panel" role="status">
        <StepProgress step={2} total={ONB_STEPS} />
        <span className="badge badge-status st-done"><Icon name="crosshair" />Position approximative</span>
        <h1 className="onb-title">Vous êtes à {commune.name}</h1>
        <p className="onb-text">{near} alerte{near > 1 ? "s" : ""} dans votre zone de {r} km.</p>
        <SegmentedControl block label="Rayon de votre zone" value={r} onChange={(v) => dispatch({ type: "SET_RADIUS", km: v })} options={ZONE_RADII.map((k) => ({ value: k, label: `${k} km` }))} />
        <Button block onClick={() => dispatch({ type: "ONB_GO", step: "map-style", pending: { communeId: commune.id, source: "gps", coords: gps } })}>Continuer</Button>
        <Button block variant="ghost" onClick={() => dispatch({ type: "ONB_GO", step: "commune" })}>Ce n'est pas ma commune</Button>
      </div>
    </div>
  );
}
