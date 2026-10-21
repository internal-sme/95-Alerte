import { Icon } from "@/components/Icon";
import { MAP_STYLES } from "@/map/geo";
import { ZoneMap } from "@/screens/onboarding/ZoneMap";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";
import type { LatLng } from "@/types";

/* Tâche 5.12 : choisir son fond de carte (Polarsteps, Flighty) ; la carte derrière change en direct */
export interface MapStyleChoiceProps {
  center: LatLng & { key?: number };
}

export function MapStyleChoice({ center }: MapStyleChoiceProps) {
  const { state, dispatch } = useStore();
  const value = state.prefs.mapStyle || "plan";
  return (
    <div className="map-style-choice" role="radiogroup" aria-label="Fond de carte">
      {MAP_STYLES.map((o) => (
        <label key={o.value} className={cx("map-style-opt", value === o.value && "is-selected")}>
          <input type="radio" name="map-style" value={o.value} checked={value === o.value} onChange={() => dispatch({ type: "SET_PREF", key: "mapStyle", value: o.value })} />
          <span className="ms-thumb"><ZoneMap center={center} radiusKm={0.8} height={88} pins={false} label={false} ring={false} mapStyle={o.value} /></span>
          <span className="ms-text"><b>{o.label}</b><small>{o.description}</small></span>
          <span className="ms-check" aria-hidden="true"><Icon name="check" /></span>
        </label>
      ))}
    </div>
  );
}
