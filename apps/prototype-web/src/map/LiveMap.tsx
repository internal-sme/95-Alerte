import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { ClusterMarker } from "@/components/ClusterMarker";
import { Icon } from "@/components/Icon";
import { Marker } from "@/components/Marker";
import { CATEGORY_BY_ID } from "@/data/seed";
import { DEPT_KM, GEO_LAYERS, MAP_INSET_TOP, MAP_LEVELS, MAP_MAX_S, PRIORITY_RANK, SAT_LAYERS, SELECTION_HALF, areaPath, clusterOnScreen, levelOf, mapLabels, mapMemory, projectKm, useSatellite } from "@/map/geo";
import { cx, fmtDistance, haversineKm, motionReduced } from "@/utils/index";
import type { Alert, LatLng } from "@/types";

/** Rectangle visible, en km dans le repère de la carte */
export interface MapBounds { x0: number; x1: number; y0: number; y1: number }

/** Méthodes exposées par la carte (ref) */
export interface LiveMapHandle {
  recenter: () => void;
  focusAlert: (a: LatLng) => void;
  zoomBy: (k: number, at?: { x: number; y: number }) => void;
  focusPlace: (p: LatLng, scale: number) => MapBounds | null;
  bounds: () => MapBounds | null;
}

export interface LiveMapProps {
  alerts: Alert[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  zone?: { center: LatLng; radiusKm: number } | null;
  me?: LatLng | null;
  place?: any;
  sheetMode?: string | number;
  peek?: number;
  loading?: boolean;
  error?: boolean;
  onViewChange?: (view: any, settle: string, center: { x: number; y: number }) => void;
}

export const LiveMap = React.forwardRef<LiveMapHandle, LiveMapProps>(function LiveMap({ alerts, selectedId, onSelect, zone, me, place, sheetMode, peek, loading, onViewChange, error }, ref) {
  const sat = useSatellite();
  const box = useRef(null);
  const [size, setSize] = useState(null);
  const zoneKey = zone ? `${zone.center.lat},${zone.center.lng},${zone.radiusKm}` : "none";
  const [view, setView] = useState(mapMemory.lastZone === zoneKey ? mapMemory.lastView : null);
  const viewRef = useRef(view);
  const anim = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  useLayoutEffect(() => {
    const el = box.current;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bottomInset = size ? (sheetMode === "peek" ? peek : size.h * (sheetMode === "selection" ? SELECTION_HALF : 0.5)) : peek;
  const geom = useRef<{ size?: { w: number; h: number }; bottomInset?: number }>({});
  geom.current = { size, bottomInset };
  const minS = size ? Math.max(3, ((size.w - 24) / DEPT_KM.w) * 0.8) : 3;
  const clampView = useCallback((v) => {
    const s = Math.min(MAP_MAX_S, Math.max(minS, v.s));
    return { s, cx: Math.min(DEPT_KM.x + DEPT_KM.w + 4, Math.max(DEPT_KM.x - 4, v.cx)), cy: Math.min(DEPT_KM.y + DEPT_KM.h + 4, Math.max(DEPT_KM.y - 4, v.cy)) };
  }, [minS]);

  const apply = useCallback((v, settle?, bottomOverride?) => {
    const next = clampView(v);
    viewRef.current = next;
    mapMemory.lastView = next;
    mapMemory.lastZone = zoneKey;
    setView(next);
    if (settle) {
      // Le lieu annoncé est celui du centre visible (entre la barre du haut et le volet), pas du centre de l'écran
      const { size: sz } = geom.current;
      const bi = bottomOverride != null ? bottomOverride : geom.current.bottomInset;
      const fy = sz ? (MAP_INSET_TOP + sz.h - bi) / 2 - sz.h / 2 : 0;
      onViewChange?.(next, settle, { x: next.cx, y: next.cy + fy / next.s });
    }
  }, [clampView, onViewChange, zoneKey]);

  /* Centre visible : entre la barre du haut et le volet */
  const focusY = (h, bottom) => (MAP_INSET_TOP + (h - bottom)) / 2;
  const viewFor = useCallback((x, y, s, bottom = bottomInset) => ({ s, cx: x, cy: y - (focusY(size.h, bottom) - size.h / 2) / s }), [size, bottomInset]);
  const fitZone = useCallback(() => {
    if (!size) return null;
    if (!zone) return { s: ((size.w - 24) / DEPT_KM.w), cx: DEPT_KM.x + DEPT_KM.w / 2, cy: DEPT_KM.y + DEPT_KM.h / 2 + 4 };
    const c = projectKm(zone.center);
    const visH = size.h - MAP_INSET_TOP - peek - 32;
    const s = Math.min(MAP_MAX_S, (size.w - 48) / (2 * zone.radiusKm), visH / (2 * zone.radiusKm));
    return viewFor(c.x, c.y, s, peek); // la zone se cadre toujours au-dessus du volet réduit
  }, [size, zone, peek, viewFor]);

  const animateTo = useCallback((target, settle = "program", bottom?) => {
    cancelAnimationFrame(anim.current);
    const from = viewRef.current;
    const to = clampView(target);
    if (!from || motionReduced()) { apply(to, settle, bottom); return; }
    const t0 = performance.now();
    const dur = 420;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e);
      apply({ s, cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e }, k === 1 ? settle : null, bottom);
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, [apply, clampView]);

  // Première vue : la zone suivie (ou tout le département sans position) ; nouvelle zone → la carte s'y recentre
  const shownZone = useRef(zoneKey);
  useEffect(() => {
    if (!size) return;
    if (!viewRef.current) { apply(fitZone(), "init"); return; }
    if (shownZone.current !== zoneKey) { shownZone.current = zoneKey; animateTo(fitZone(), "recenter"); }
  }, [size, zoneKey, fitZone, apply, animateTo]);
  useEffect(() => { if (viewRef.current && size) apply(viewRef.current, "init"); }, [!!size]); // vue restaurée : informer l'écran

  const zoomBy = useCallback((k, at?) => {
    const v = viewRef.current;
    if (!v || !size) return;
    const px = at ? at.x : size.w / 2;
    const py = at ? at.y : focusY(size.h, bottomInset);
    const wx = v.cx + (px - size.w / 2) / v.s;
    const wy = v.cy + (py - size.h / 2) / v.s;
    const s = Math.min(MAP_MAX_S, Math.max(minS, v.s * k));
    animateTo({ s, cx: wx - (px - size.w / 2) / s, cy: wy - (py - size.h / 2) / s }, "user");
  }, [size, bottomInset, minS, animateTo]);

  useImperativeHandle(ref, () => ({
    recenter: () => { const v = fitZone(); if (v) animateTo(v, "recenter"); },
    focusAlert: (a) => {
      const p = projectKm(a);
      const v = viewRef.current;
      const bottom = size ? size.h * SELECTION_HALF : 420;
      animateTo(viewFor(p.x, p.y, Math.max(v ? v.s : 0, MAP_LEVELS[2].min + 8), bottom), "program", bottom);
    },
    zoomBy,
    // Recherche (F3) : centre la carte sur un lieu, volet à mi-hauteur ; renvoie la zone qui sera affichée
    focusPlace: (p, scale) => {
      if (!size) return null;
      const k = projectKm(p);
      const s = Math.min(MAP_MAX_S, scale);
      const bottom = size.h * 0.5;
      const v = viewFor(k.x, k.y, s, bottom);
      animateTo(v, "recenter", bottom);
      return { x0: v.cx - size.w / 2 / s, x1: v.cx + size.w / 2 / s, y0: v.cy + (MAP_INSET_TOP - size.h / 2) / s, y1: v.cy + (size.h - bottom - size.h / 2) / s };
    },
    bounds: () => {
      const v = viewRef.current;
      if (!v || !size) return null;
      return { x0: v.cx - size.w / 2 / v.s, x1: v.cx + size.w / 2 / v.s, y0: v.cy + (MAP_INSET_TOP - size.h / 2) / v.s, y1: v.cy + (size.h - bottomInset - size.h / 2) / v.s };
    },
  }), [fitZone, animateTo, viewFor, size, zoomBy, bottomInset]);

  /* Gestes : glisser (1 doigt), pincer (2 doigts), molette, double toucher, clavier */
  const local = (e) => { const r = box.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    cancelAnimationFrame(anim.current);
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    const v = viewRef.current;
    if (pts.length === 1) gesture.current = { type: "pan", start: pts[0], v, moved: false, id: e.pointerId };
    if (pts.length === 2) {
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      gesture.current = { type: "pinch", dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), mid, v, moved: true };
      try { box.current.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    }
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    if (g.type === "pan" && pts.length === 1) {
      const dx = pts[0].x - g.start.x;
      const dy = pts[0].y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 6) return;
      if (!g.moved) { g.moved = true; try { box.current.setPointerCapture(e.pointerId); } catch (err) { /* idem */ } }
      apply({ s: g.v.s, cx: g.v.cx - dx / g.v.s, cy: g.v.cy - dy / g.v.s });
    }
    if (g.type === "pinch" && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const s = Math.min(MAP_MAX_S, Math.max(minS, g.v.s * (dist / g.dist)));
      const wx = g.v.cx + (g.mid.x - size.w / 2) / g.v.s;
      const wy = g.v.cy + (g.mid.y - size.h / 2) / g.v.s;
      apply({ s, cx: wx - (mid.x - size.w / 2) / s, cy: wy - (mid.y - size.h / 2) / s });
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (pointers.current.size === 0) {
      gesture.current = null;
      if (g.moved) apply(viewRef.current, "user");
    } else if (g.type === "pinch") {
      const [p] = [...pointers.current.values()];
      gesture.current = { type: "pan", start: p, v: viewRef.current, moved: true };
    }
  };
  useEffect(() => {
    const el = box.current;
    let timer = null;
    const onWheel = (e) => {
      e.preventDefault();
      const v = viewRef.current;
      if (!v || !size) return;
      const at = local(e);
      const k = Math.exp(-e.deltaY * 0.0022);
      const s = Math.min(MAP_MAX_S, Math.max(minS, v.s * k));
      const wx = v.cx + (at.x - size.w / 2) / v.s;
      const wy = v.cy + (at.y - size.h / 2) / v.s;
      apply({ s, cx: wx - (at.x - size.w / 2) / s, cy: wy - (at.y - size.h / 2) / s });
      clearTimeout(timer);
      timer = setTimeout(() => apply(viewRef.current, "user"), 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); clearTimeout(timer); };
  }, [size, minS, apply]);
  const onKeyDown = (e) => {
    const v = viewRef.current;
    if (!v || e.target !== box.current) return;
    const step = 80 / v.s;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); animateTo({ ...v, cx: v.cx + moves[e.key][0], cy: v.cy + moves[e.key][1] }, "user"); }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(2); }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomBy(0.5); }
  };
  const onDoubleClick = (e) => {
    if (e.target.closest("button")) return;
    zoomBy(2, local(e));
  };

  const v = view;
  const ready = size && v;
  const level = ready ? levelOf(v.s) : 0;
  const toScreen = (x, y) => ({ x: (x - v.cx) * v.s + size.w / 2, y: (y - v.cy) * v.s + size.h / 2 });

  // Marqueurs : alertes visibles à l'écran ; la sélection reste toujours individuelle et au premier plan
  let pins = [];
  if (ready && !loading && !error) {
    const items = alerts
      .map((a) => ({ a, ...toScreen(projectKm(a).x, projectKm(a).y) }))
      .filter((p) => p.x > -30 && p.x < size.w + 30 && p.y > -30 && p.y < size.h + 30)
      .sort((p, q) => PRIORITY_RANK[CATEGORY_BY_ID[p.a.categoryId].priority] - PRIORITY_RANK[CATEGORY_BY_ID[q.a.categoryId].priority]);
    const free = items.filter((p) => p.a.id !== selectedId);
    const radius = free.length > 12 ? 58 : 44; // au-delà de 12 marqueurs visibles, regroupement plus serré
    pins = clusterOnScreen(free, radius);
    const sel = items.find((p) => p.a.id === selectedId);
    if (sel) pins.push({ key: sel.a.id, alerts: [sel.a], x: sel.x, y: sel.y, selected: true });
  }
  const labels = ready && !error ? mapLabels(level, toScreen, size.w, size.h) : [];
  const meScreen = ready && me ? toScreen(projectKm(me).x, projectKm(me).y) : null;

  const openCluster = (p) => {
    const ks = p.alerts.map(projectKm);
    const x0 = Math.min(...ks.map((k) => k.x));
    const x1 = Math.max(...ks.map((k) => k.x));
    const y0 = Math.min(...ks.map((k) => k.y));
    const y1 = Math.max(...ks.map((k) => k.y));
    const visH = size.h - MAP_INSET_TOP - bottomInset;
    const fit = Math.min((size.w - 96) / Math.max(0.05, x1 - x0), (visH - 96) / Math.max(0.05, y1 - y0));
    const s = Math.min(MAP_MAX_S, Math.max(v.s * 2, fit));
    animateTo(viewFor((x0 + x1) / 2, (y0 + y1) / 2, s), "user");
  };

  return (
    <div ref={box} className={cx("map95", "map-live", `lv-${level}`, error && "is-error", sat && "is-sat")} tabIndex={0} role="region"
      aria-label="Carte des alertes. Flèches pour déplacer la carte, plus et moins pour zoomer."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown} onDoubleClick={onDoubleClick}>
      {ready && !error ? (
        <svg className="map-geo" width={size.w} height={size.h} aria-hidden="true">
          <g transform={`translate(${size.w / 2 - v.cx * v.s} ${size.h / 2 - v.cy * v.s}) scale(${v.s})`}>
            {sat ? SAT_LAYERS : null}
            {GEO_LAYERS}
            {zone ? <circle className="geo-zone" cx={projectKm(zone.center).x} cy={projectKm(zone.center).y} r={zone.radiusKm} /> : null}
            {loading ? null : alerts.filter((a) => a.areaKm).map((a) => <path key={a.id} className={cx("area-shape", `fam-${CATEGORY_BY_ID[a.categoryId].family}`, a.id === selectedId && "is-selected")} d={areaPath(a)} />)}
          </g>
        </svg>
      ) : null}
      {labels.map((l) => <span key={l.key} className={cx("map-label", l.cls)} style={{ left: l.x, top: l.y }} aria-hidden="true">{l.text}</span>)}
      {ready && place ? (() => { const k = projectKm(place); const p = toScreen(k.x, k.y); return <span className="place-pin" style={{ left: p.x, top: p.y }} role="img" aria-label={`Lieu recherché : ${place.label}`}><Icon name="map-pin-fill" /></span>; })() : null}
      {meScreen ? (
        <span className="me-wrap" style={{ left: meScreen.x, top: meScreen.y }} role="img" aria-label="Vous êtes ici">
          <span className="me-accuracy" style={{ width: Math.max(28, 0.15 * v.s * 2), height: Math.max(28, 0.15 * v.s * 2) }} />
          <span className="me" />
        </span>
      ) : null}
      {pins.map((p, i) => {
        if (p.alerts.length > 1) {
          return (
            <span key={p.key} className="map-pin is-cluster" style={{ left: p.x, top: p.y, animationDelay: mapMemory.loadedOnce ? undefined : `${i * 45}ms` }}>
              <ClusterMarker count={p.alerts.length} onClick={() => openCluster(p)} />
            </span>
          );
        }
        const a = p.alerts[0];
        const cat = CATEGORY_BY_ID[a.categoryId];
        const critical = cat.priority === "critique";
        const dist = me ? `, ${fmtDistance(haversineKm(me, a))}` : "";
        return (
          <span key={p.key} className={cx("map-pin", p.selected && "is-selected")} style={{ left: p.x, top: p.y, animationDelay: mapMemory.loadedOnce ? undefined : `${i * 45}ms` }}>
            <Marker family={cat.family} icon={cat.icon} selected={p.selected} critical={critical} dataId={a.id}
              label={`${cat.label}${critical ? ", Urgent" : ""}${a.areaKm ? ", alerte de zone" : ""}${dist} : ${a.title}`} onClick={() => onSelect(a.id)} />
          </span>
        );
      })}
    </div>
  );
});
