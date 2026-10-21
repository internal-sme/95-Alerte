import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AlertCard } from "@/components/AlertCard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Pill } from "@/components/Pill";
import { Skeleton } from "@/components/Skeleton";
import { Spot } from "@/components/Spot";
import { COMMUNE_BY_ID, HOUR } from "@/data/seed";
import { FilterButton } from "@/filters/FilterButton";
import { TypeChips } from "@/filters/TypeChips";
import { mapFilterMatch } from "@/filters/filters";
import { AlertSummary } from "@/map/AlertSummary";
import { LiveMap } from "@/map/LiveMap";
import { MapControls } from "@/map/MapControls";
import { MapLevelTag } from "@/map/MapLevelTag";
import { ViewToggle } from "@/map/ViewToggle";
import { SAT_LAYERS, SELECTION_HALF, levelOf, levelText, mapMemory, placeAt, projectKm } from "@/map/geo";
import { BottomSheet } from "@/navigation/BottomSheet";
import { StartChecklist } from "@/screens/onboarding/StartChecklist";
import { zoneRadius } from "@/screens/onboarding/onboarding";
import { dedupeEvents } from "@/screens/tabs/mapArt";
import { useActions, useNow, useStore, useVisibleAlerts } from "@/store/store";
import { haversineKm, motionReduced } from "@/utils/index";

export function MapScreen() {
  const { state, dispatch } = useStore();
  const { toast, push, openSheet, setPref } = useActions();
  const now = useNow();
  const all = useVisibleAlerts(); // 3.10 : alertes actives et non expirées seulement
  const map = useRef(null);
  const pos = state.session.position;
  const f = state.mapFilter;
  const homeView = state.prefs.homeView || "map";
  const hasZone = pos.source !== "default";
  const radius = zoneRadius(state);
  const showMe = hasZone && pos.source === "gps" && !state.demo.permissionDenied && !state.demo.gpsUnavailable;
  const zone = useMemo(() => (hasZone ? { center: { lat: pos.lat, lng: pos.lng }, radiusKm: radius } : null), [hasZone, pos.lat, pos.lng, radius]);

  const [snap, setSnap] = useState("peek");
  const [selectedId, setSelectedId] = useState(null);
  const [area, setArea] = useState(null); // « Voir les alertes ici » : zone affichée au lieu de la zone suivie
  const [place, setPlace] = useState(null); // lieu choisi dans la recherche (F3)
  const [viewInfo, setViewInfo] = useState(null);
  const [newSeen, setNewSeen] = useState(false);
  const [loading, setLoading] = useState(!mapMemory.loadedOnce);
  const [retrying, setRetrying] = useState(false);
  const PEEK = 148;

  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => { setLoading(false); setTimeout(() => { mapMemory.loadedOnce = true; }, 900); }, 900);
    return () => clearTimeout(t);
  }, [loading]);

  const events = useMemo(() => dedupeEvents(all.filter((a) => mapFilterMatch(f, a, pos, now))), [all, f, pos, now]);
  const inArea = (a) => { const k = projectKm(a); return k.x >= area.x0 && k.x <= area.x1 && k.y >= area.y0 && k.y <= area.y1; };
  const listing = useMemo(() => {
    const scoped = area ? events.filter(inArea) : hasZone ? events.filter((a) => haversineKm(pos, a) <= radius) : events;
    const from = place || (hasZone ? pos : null); // un lieu recherché : les plus proches de ce lieu d'abord
    return from ? scoped.map((a) => ({ a, km: haversineKm(from, a) })).sort((x, y) => x.km - y.km).map((x) => x.a) : scoped.sort((x, y) => y.createdAt - x.createdAt);
  }, [events, area, hasZone, pos, radius, place]);
  const fresh = hasZone && !area ? listing.filter((a) => now - a.createdAt < HOUR) : [];

  const selected = selectedId ? all.find((a) => a.id === selectedId) : null;
  const ring = selected && listing.some((a) => a.id === selected.id) ? listing : selected ? [selected] : [];
  const index = selected ? ring.findIndex((a) => a.id === selected.id) : -1;

  const select = (id) => {
    const a = all.find((x) => x.id === id);
    if (!a) return;
    setSelectedId(id);
    setSnap("half");
    map.current?.focusAlert(a);
  };
  const closeSummary = useCallback(() => {
    const id = selectedId;
    setSelectedId(null);
    setSnap("peek");
    // Le focus revient au marqueur de l'alerte fermée
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`.map-live [data-alert="${id}"]`)?.focus());
  }, [selectedId]);
  const step = (d) => { if (ring.length > 1) select(ring[(index + d + ring.length) % ring.length].id); };
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeSummary(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeSummary]);

  const onViewChange = useCallback((v, why, focus) => {
    const place = placeAt(focus.x, focus.y);
    setViewInfo({ s: v.s, level: levelOf(v.s), place, moved: why === "user" ? true : why === "recenter" || why === "init" ? false : undefined });
  }, []);
  const moved = viewInfo && viewInfo.moved;
  const recenter = () => {
    setArea(null);
    setPlace(null);
    setSelectedId(null);
    setSnap("peek");
    map.current?.recenter();
    if (state.demo.permissionDenied && hasZone) toast(`Localisation désactivée : position choisie manuellement (${COMMUNE_BY_ID[pos.communeId]?.name || "Pontoise"}).`);
  };
  const searchHere = () => {
    const b = map.current?.bounds();
    if (!b) return;
    setArea(b);
    setSelectedId(null);
    setViewInfo((vi) => ({ ...vi, moved: false }));
    setSnap("half");
  };
  const widen = () => { dispatch({ type: "SET_RADIUS", km: 10 }); setArea(null); setPlace(null); toast("Zone élargie à 10 km."); };
  const followPlace = () => {
    dispatch({ type: "SET_COMMUNE", communeId: place.communeId, source: "commune", coords: { lat: place.lat, lng: place.lng } });
    toast(`Zone suivie : ${place.label}.`);
    setPlace(null);
    setArea(null);
  };
  // Venue de la recherche ou de la liste : un lieu à montrer, une alerte à ouvrir, ou le retour à ma zone
  const focus = state.mapFocus;
  useEffect(() => {
    if (!focus) return undefined;
    const t = setTimeout(() => {
      if (focus.kind === "alert") select(focus.id);
      else if (focus.kind === "home") recenter();
      else {
        const b = map.current?.focusPlace(focus, focus.zoom || 40);
        if (b) { setArea(b); setPlace(focus); setSelectedId(null); setSnap("half"); }
      }
      dispatch({ type: "CLEAR_MAP_FOCUS" });
    }, 80);
    return () => clearTimeout(t);
  }, [focus && focus.key]);
  const retry = () => { setRetrying(true); setTimeout(() => { setRetrying(false); toast("Toujours impossible de charger la carte.", { tone: "error", actionLabel: "OK" }); }, 900); };
  // Carte ⇄ liste : « smart animate » (la barre de recherche, les puces et la bascule se déforment, le reste se fond)
  const setView = (v) => {
    const run = () => flushSync(() => { setPref("homeView", v); setSelectedId(null); setSnap("peek"); });
    if (document.startViewTransition && !motionReduced()) document.startViewTransition(run); else run();
  };

  const level = viewInfo ? viewInfo.level : 0;
  const viewPlace = viewInfo ? viewInfo.place : { inside: true };
  const sheetH = selected ? (snap === "full" ? "full" : "selection") : snap;

  // Une seule pilule contextuelle à la fois : hors territoire > voir ici > nouvelles alertes
  let pill = null;
  if (homeView === "map" && !state.demo.networkError && !loading && !selected) {
    if (viewInfo && !viewPlace.inside) pill = <span className="pill is-info" role="status"><Icon name="info" />95 Alerte n'est pas encore disponible dans cette zone.</span>;
    else if (moved) pill = <button type="button" className="pill" onClick={searchHere}><Icon name="arrows-clockwise" />Voir les alertes ici</button>;
    else if (fresh.length && !newSeen) pill = <Pill onClick={() => { setNewSeen(true); setSnap("half"); }}>{fresh.length} nouvelle{fresh.length > 1 ? "s" : ""} alerte{fresh.length > 1 ? "s" : ""}</Pill>;
  }

  const unread = state.notifications.filter((n) => !n.read).length;
  const title = place ? `${listing.length} alerte${listing.length > 1 ? "s" : ""} · ${place.label}`
    : area ? `${listing.length} alerte${listing.length > 1 ? "s" : ""} dans cette zone`
    : hasZone ? (listing.length ? `${listing.length} alerte${listing.length > 1 ? "s" : ""} dans votre zone` : "Aucun événement dans cette zone.")
    : `${listing.length} alertes dans le Val-d'Oise`;
  const subtitle = place ? place.sub : area ? "Zone affichée sur la carte" : hasZone ? `Rayon ${radius} km · mis à jour à l'instant` : "Choisissez une zone pour voir les alertes proches";

  const header = (
    <div className="map-top-wrap">
      <div className="map-top">
        <button type="button" className="search" onClick={() => push("search")}>
          <Icon name="magnifying-glass" /><span>{place ? <Fragment>{place.label}<small> · {place.sub}</small></Fragment> : pos.communeId ? <Fragment>{COMMUNE_BY_ID[pos.communeId].name}<small> · rechercher</small></Fragment> : <Fragment>Rechercher<small> · commune, rue, alerte</small></Fragment>}</span>
        </button>
        <FilterButton />
        <IconButton icon="bell" label="Notifications" badge={unread || null} onClick={() => toast("Le centre de notifications arrive bientôt.")} />
      </div>
      <TypeChips />
    </div>
  );

  if (homeView === "list") {
    return (
      <div className="screen map-screen is-list">
        {header}
        <div className="home-list">
          <div className="home-list-head"><h2>{title}</h2><p>{subtitle}</p></div>
          {state.session.status === "in" ? <StartChecklist onConfirm={() => {}} /> : null}
          {listing.length === 0 ? (
            <EmptyState title="Aucun événement dans cette zone." action={radius < 10 && hasZone ? <Button variant="secondary" onClick={widen}>Élargir à 10 km</Button> : null}>Élargissez la zone ou revenez plus tard.</EmptyState>
          ) : listing.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => push("alert", { id: a.id })} />)}
        </div>
        <ViewToggle view="list" floating onChange={setView} />
      </div>
    );
  }

  return (
    <div className="screen map-screen">
      <LiveMap ref={map} alerts={events} selectedId={selectedId} onSelect={select} zone={zone} me={showMe ? pos : null} place={place}
        sheetMode={sheetH} peek={PEEK} loading={loading} error={state.demo.networkError} onViewChange={onViewChange} />
      {header}
      {!state.demo.networkError && viewInfo ? <MapLevelTag text={levelText(level, viewPlace)} scale={viewInfo.s} /> : null}
      {!hasZone ? (
        <button type="button" className="map-banner" onClick={() => push("commune")}><Icon name="map-pin" /><span><b>Position non définie</b>Choisissez votre commune pour voir les alertes proches.</span><Icon name="caret-right" className="ph-sm" /></button>
      ) : pill ? <div className="map-pill">{pill}</div> : null}

      {state.demo.networkError ? (
        <div className="map-error" role="alert">
          <Spot icon="cloud-slash" tone="neutral" />
          <h2>Impossible de charger la carte.</h2>
          <p>Vérifiez votre connexion. La liste des alertes reste disponible.</p>
          <Button block loading={retrying} onClick={retry}>Réessayer</Button>
          <Button block variant="secondary" onClick={() => setView("list")}>Voir la liste</Button>
        </div>
      ) : (
        sheetH === "peek" ? (
          <MapControls bottom={PEEK + 12} onLegend={() => openSheet("map-legend", {}, "half")} onLayers={SAT_LAYERS ? () => openSheet("map-style", {}, "half") : null}
            onZoomIn={() => map.current?.zoomBy(2)} onZoomOut={() => map.current?.zoomBy(0.5)} onLocate={recenter}
            locateLabel={showMe ? "Recentrer sur ma position" : "Recentrer sur ma zone"} />
        ) : null
      )}

      {state.demo.networkError ? null : selected ? (
        <BottomSheet snap={snap === "peek" ? "half" : snap} peek={PEEK} half={SELECTION_HALF} onSnap={setSnap} onClose={closeSummary} title={null}>
          <AlertSummary alert={selected} onClose={closeSummary} index={index} total={ring.length} onStep={step} />
        </BottomSheet>
      ) : (
        <BottomSheet snap={snap} peek={PEEK} onSnap={setSnap} dismissible={false}
          title={loading ? <Skeleton height={20} width="62%" /> : title} subtitle={loading ? <Skeleton height={12} width="44%" /> : subtitle}
          headerAction={<ViewToggle view="map" onChange={setView} />}>
          {area ? (
            <div className="sheet-actions">
              {place && place.communeId ? <button type="button" className="btn btn-tertiary" onClick={followPlace}>Suivre cette zone</button> : null}
              <button type="button" className="btn btn-tertiary" onClick={recenter}>Revenir à ma zone</button>
            </div>
          ) : null}
          {state.session.status === "in" && !loading && listing.length && !area ? <StartChecklist onConfirm={() => setSnap("half")} /> : null}
          {loading ? (
            <Fragment><Skeleton height={96} radius="var(--r-md)" /><Skeleton height={96} radius="var(--r-md)" /></Fragment>
          ) : listing.length === 0 ? (
            <EmptyState title="Aucun événement dans cette zone." action={radius < 10 && hasZone ? <Button variant="secondary" onClick={widen}>Élargir à 10 km</Button> : null}>Élargissez la zone ou revenez plus tard.</EmptyState>
          ) : listing.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => select(a.id)} />)}
        </BottomSheet>
      )}
    </div>
  );
}
