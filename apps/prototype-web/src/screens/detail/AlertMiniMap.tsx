import { useLayoutEffect, useRef, useState } from "react";
import { Marker } from "@/components/Marker";
import { CATEGORY_BY_ID } from "@/data/seed";
import { GEO_LAYERS, MAP95, SAT_LAYERS, areaPath, levelOf, mapLabels, projectKm, useSatellite } from "@/map/geo";
import { MAP_ART } from "@/screens/tabs/mapArt";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";
import type { Alert } from "@/types";

/* Mini-carte de la fiche : même fond que l'accueil, centrée sur l'alerte, au niveau de la rue ;
   zone dessinée pour les alertes de zone, halo flou quand la catégorie n'affiche que le quartier (CDC §78) */
export interface AlertMiniMapProps {
  alert: Alert;
  height?: number;
}

export function AlertMiniMap({ alert, height = 232 }: AlertMiniMapProps) {
  const { state } = useStore();
  const sat = useSatellite();
  const ref = useRef(null);
  const [w, setW] = useState(390);
  useLayoutEffect(() => { if (ref.current) setW(ref.current.clientWidth); }, []);
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const s = alert.areaKm ? Math.min(150, (Math.min(w, height) * 0.36) / alert.areaKm) : 150;
  const c = projectKm(alert);
  const cx0 = w / 2;
  const cy0 = height * 0.58;
  const toScreen = (x, y) => ({ x: cx0 + (x - c.x) * s, y: cy0 + (y - c.y) * s });
  const level = levelOf(s);
  const pos = state.session.position;
  const me = pos.source !== "default" ? (() => { const k = projectKm(pos); return toScreen(k.x, k.y); })() : null;
  const fuzzy = cat.precision === "quartier" && !alert.areaKm;
  return (
    <div className={cx("zone-map", "alert-map", sat && "is-sat")} ref={ref} aria-hidden="true">
      <div className={cx("map95", "map-live", "is-static", `lv-${level}`, sat && "is-sat")}>
        {MAP95 ? (
          <svg className="map-geo" width={w} height={height}>
            <g className="zm-geo" style={{ transform: `translate(${cx0 - c.x * s}px, ${cy0 - c.y * s}px) scale(${s})` }}>
              {sat ? SAT_LAYERS : null}
              {GEO_LAYERS}
              {alert.areaKm ? <path className={cx("area-shape", `fam-${cat.family}`, "is-selected")} d={areaPath(alert)} /> : null}
            </g>
          </svg>
        ) : MAP_ART}
        {mapLabels(level, toScreen, w, height, 56).map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }}>{l.text}</span>)}
      </div>
      {fuzzy ? <span className="precision-halo" style={{ left: cx0, top: cy0 }} /> : null}
      {me && me.x > 12 && me.x < w - 12 && me.y > 12 && me.y < height - 12 ? <span className="me" style={{ left: me.x, top: me.y }} /> : null}
      <span className="map-pin" style={{ left: cx0, top: cy0 }}><Marker family={cat.family} icon={cat.icon} selected critical={cat.priority === "critique"} /></span>
    </div>
  );
}
