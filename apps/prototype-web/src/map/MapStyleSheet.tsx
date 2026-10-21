import { Fragment } from "react";
import { MapStyleChoice } from "@/map/MapStyleChoice";
import { SAT_SOURCE } from "@/map/geo";
import { useStore } from "@/store/store";

export function MapStyleSheet() {
  const { state } = useStore();
  return (
    <Fragment>
      <MapStyleChoice center={state.session.position} />
      <p className="demo-note">Satellite : {SAT_SOURCE} (Copernicus, données libres). Le choix est gardé sur cet appareil.</p>
    </Fragment>
  );
}
