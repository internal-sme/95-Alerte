import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Marker } from "@/components/Marker";
import { CATEGORY_BY_ID } from "@/data/seed";
import { GEO_LAYERS, MAP95, MAP_MAX_S, SAT_LAYERS, levelOf, mapLabels, projectKm, useSatellite } from "@/map/geo";
import { MAP_ART, dedupeEvents } from "@/screens/tabs/mapArt";
import { useStore, useVisibleAlerts } from "@/store/store";
import { cx } from "@/utils/index";
import type { LatLng } from "@/types";

/* 6.4 : carte de choix du lieu — l'épingle reste au centre, la carte bouge dessous (Snoonu, Blinkit, Apple Maps) */
export interface PinMapProps {
  center: LatLng & { key?: number };
  onSettle: (...args: any[]) => any;
  family: string;
  icon: string;
}

export function PinMap({ center, onSettle, family, icon }: PinMapProps) {
  const sat = useSatellite();
  const alerts = useVisibleAlerts();
  const { state } = useStore();
  const box = useRef(null);
  const [size, setSize] = useState({ w: 390, h: 420 });
  const start = projectKm(center);
  const [v, setV] = useState({ x: start.x, y: start.y, s: 120 });
  const vRef = useRef(v);
  vRef.current = v;
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Recentrage demandé (ma position, adresse recherchée)
  useEffect(() => {
    const k = projectKm(center);
    setV((o) => ({ ...o, x: k.x, y: k.y }));
    onSettle(k.x, k.y);
  }, [center.lat, center.lng, center.key]);
  const settle = () => onSettle(vRef.current.x, vRef.current.y);
  const moveBy = (dx, dy) => setV((o) => ({ ...o, x: o.x - dx / o.s, y: o.y - dy / o.s }));
  const zoom = (k) => setV((o) => ({ ...o, s: Math.min(MAP_MAX_S, Math.max(24, o.s * k)) }));
  const onPointerDown = (e) => { if (e.target.closest("button")) return; drag.current = { x: e.clientX, y: e.clientY, v: vRef.current }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (!dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 3) setDragging(true);
    setV({ ...d.v, x: d.v.x - (e.clientX - d.x) / d.v.s, y: d.v.y - (e.clientY - d.y) / d.v.s });
  };
  const onPointerUp = () => { if (!drag.current) return; drag.current = null; setDragging(false); settle(); };
  const onKeyDown = (e) => {
    const step = 48;
    const keys = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (keys[e.key]) { e.preventDefault(); moveBy(...(keys[e.key] as [number, number])); setTimeout(settle, 0); }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); zoom(1.6); }
    if (e.key === "-") { e.preventDefault(); zoom(1 / 1.6); }
  };
  const toScreen = (x, y) => ({ x: size.w / 2 + (x - v.x) * v.s, y: size.h / 2 + (y - v.y) * v.s });
  const level = levelOf(v.s);
  const pos = state.session.position;
  const me = pos.source !== "default" ? (() => { const k = projectKm(pos); return toScreen(k.x, k.y); })() : null;
  const inView = (p) => p.x > 12 && p.x < size.w - 12 && p.y > 12 && p.y < size.h - 12;
  return (
    <div className={cx("pin-map", dragging && "is-dragging")} ref={box} tabIndex={0} role="application"
      aria-label="Carte : déplacez-la pour placer l'épingle sur le lieu. Flèches pour déplacer, plus et moins pour zoomer."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}>
      <div className={cx("map95", "map-live", "is-static", `lv-${level}`, sat && "is-sat")}>
        {MAP95 ? (
          <svg className="map-geo" width={size.w} height={size.h} aria-hidden="true">
            <g transform={`translate(${size.w / 2 - v.x * v.s} ${size.h / 2 - v.y * v.s}) scale(${v.s})`}>{sat ? SAT_LAYERS : null}{GEO_LAYERS}</g>
          </svg>
        ) : MAP_ART}
        {mapLabels(level, toScreen, size.w, size.h, 0).map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }} aria-hidden="true">{l.text}</span>)}
      </div>
      {dedupeEvents(alerts).map((a) => { const k = projectKm(a); const p = toScreen(k.x, k.y); const c = CATEGORY_BY_ID[a.categoryId]; return inView(p) ? <span key={a.id} className="map-pin is-other" style={{ left: p.x, top: p.y }} aria-hidden="true"><Marker family={c.family} icon={c.icon} /></span> : null; })}
      {me && inView(me) ? <span className="me-wrap" style={{ left: me.x, top: me.y }} aria-hidden="true"><span className="me" /></span> : null}
      <span className="pick-shadow" aria-hidden="true" />
      <span className="pick-pin" aria-hidden="true">{family ? <Marker family={family} icon={icon} /> : <Icon name="map-pin-fill" />}</span>
      {dragging ? null : <span className="pick-bubble" aria-hidden="true">Vérifiez que la position est correcte</span>}
      <div className="pick-zoom" role="group" aria-label="Zoom">
        <IconButton icon="plus" label="Zoomer" onClick={() => zoom(1.6)} />
        <IconButton icon="minus" label="Dézoomer" onClick={() => zoom(1 / 1.6)} />
      </div>
    </div>
  );
}
