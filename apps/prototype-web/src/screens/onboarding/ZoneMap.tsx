import { useLayoutEffect, useRef, useState } from "react";
import { Marker } from "@/components/Marker";
import { CATEGORY_BY_ID } from "@/data/seed";
import { GEO_LAYERS, MAP95, SAT_LAYERS, levelOf, mapLabels, projectKm, useSatellite } from "@/map/geo";
import { MAP_ART, dedupeEvents } from "@/screens/tabs/mapArt";
import { useVisibleAlerts } from "@/store/store";
import { cx, haversineKm } from "@/utils/index";
import type { LatLng } from "@/types";

/* Zone suivie : carte illustrée mise à l'échelle autour de la position, cercle du rayon, alertes de la zone */
export interface ZoneMapProps {
  center: LatLng & { key?: number };
  radiusKm: any;
  height?: number;
  pins?: boolean;
  label?: string | boolean;
  stagger?: boolean;
  ring?: boolean;
  mapStyle?: any;
}

export function ZoneMap({ center, radiusKm, height, pins = true, label = true, stagger = false, ring = true, mapStyle }: ZoneMapProps) {
  const alerts = useVisibleAlerts();
  const sat = useSatellite(mapStyle);
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 390, h: height || 844 });
  useLayoutEffect(() => { const el = ref.current; if (el) setBox({ w: el.clientWidth, h: el.clientHeight }); }, []);
  // Même carte que l'accueil (phase 3) : l'échelle cadre exactement le rayon choisi
  const ringPx = Math.min(box.w, box.h) * (radiusKm > 5 ? 0.44 : 0.4);
  const s = ringPx / radiusKm;
  const c = projectKm(center);
  const cx0 = box.w / 2;
  const cy0 = box.h * (height ? 0.5 : 0.36);
  const toScreen = (x, y) => ({ x: cx0 + (x - c.x) * s, y: cy0 + (y - c.y) * s });
  const level = levelOf(s);
  const inZone = alerts.filter((a) => haversineKm(center, a) <= radiusKm);
  return (
    <div className={cx("zone-map", sat && "is-sat")} ref={ref} aria-hidden="true">
      <div className={cx("map95", "map-live", "is-static", `lv-${level}`, sat && "is-sat")}>
        {MAP95 ? (
          <svg className="map-geo" width={box.w} height={box.h}>
            <g className="zm-geo" style={{ transform: `translate(${cx0 - c.x * s}px, ${cy0 - c.y * s}px) scale(${s})` }}>{sat ? SAT_LAYERS : null}{GEO_LAYERS}</g>
          </svg>
        ) : MAP_ART}
        {mapLabels(level, toScreen, box.w, box.h, 0).map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }}>{l.text}</span>)}
      </div>
      {ring ? <span className="zone-ring" style={{ left: cx0, top: cy0, width: ringPx * 2, height: ringPx * 2 }}>{label ? <span className="zr-label">{radiusKm} km</span> : null}</span> : null}
      {pins ? dedupeEvents(inZone).slice(0, 8).map((a, i) => {
        const k = projectKm(a);
        const p = toScreen(k.x, k.y);
        const cat = CATEGORY_BY_ID[a.categoryId];
        if (p.x < 12 || p.x > box.w - 12 || p.y < 12 || p.y > box.h - 12) return null;
        return <span key={a.id} className="map-pin" style={{ left: p.x, top: p.y, animationDelay: stagger ? `${250 + i * 90}ms` : undefined }}><Marker family={cat.family} icon={cat.icon} /></span>;
      }) : null}
      <span className="zone-me-pulse" style={{ left: cx0, top: cy0 }} />
      <span className="me" style={{ left: cx0, top: cy0 }} />
    </div>
  );
}
