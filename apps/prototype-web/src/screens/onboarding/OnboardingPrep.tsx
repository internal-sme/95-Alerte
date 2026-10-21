import { Fragment, useEffect } from "react";
import { COMMUNE_BY_ID } from "@/data/seed";
import { ZoneMap } from "@/screens/onboarding/ZoneMap";
import { zoneRadius } from "@/screens/onboarding/onboarding";
import { DEFAULT_POSITION, useStore } from "@/store/store";
import { motionReduced } from "@/utils/index";

/* Préparation de la carte (Evernote) : le temps réel du chargement, jamais plus de 1,2 s */
export function OnboardingPrep() {
  const { state, dispatch } = useStore();
  const p = state.onb.pending || {};
  const c = p.communeId ? COMMUNE_BY_ID[p.communeId] : null;
  const center = p.coords || (c ? { lat: c.lat, lng: c.lng } : DEFAULT_POSITION);
  useEffect(() => {
    const finish = () => dispatch({ type: "ONB_FINISH", ...p });
    if (motionReduced()) { finish(); return undefined; }
    const t = setTimeout(finish, 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="screen auth onb onb-prep" role="status" aria-live="polite">
      <ZoneMap center={center} radiusKm={zoneRadius(state)} label={false} stagger />
      <div className="prep-overlay">
        <h1 className="onb-title">Nous préparons votre carte{c ? <Fragment> de <mark className="hl">{c.name}</mark></Fragment> : null}…</h1>
        <p className="spinner-row"><span className="spinner" aria-hidden="true" />Chargement des alertes de votre zone</p>
      </div>
    </div>
  );
}
