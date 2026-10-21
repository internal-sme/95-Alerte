import { Fragment, useEffect, useRef, useState } from "react";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Marker } from "@/components/Marker";
import { CATEGORIES, CATEGORY_BY_ID, COMMUNE_BY_ID } from "@/data/seed";
import { OUT_OF_ZONE } from "@/screens/onboarding/onboarding";
import { SearchRow } from "@/screens/search/SearchRow";
import { PLACE_ICON, PLACE_RANK, searchPlaces } from "@/screens/search/search";
import { dedupeEvents } from "@/screens/tabs/mapArt";
import { useActions, useNow, useStore, useVisibleAlerts } from "@/store/store";
import { fmtRelative, fold, foldQuery } from "@/utils/index";

export function SearchScreen() {
  const { state, dispatch } = useStore();
  const { pop, toast } = useActions();
  const visible = useVisibleAlerts();
  const now = useNow();
  const [q, setQ] = useState("");
  const box = useRef(null);
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); }, []);
  const nq = foldQuery(q);
  const pos = state.session.position;
  const recents = state.prefs.recentSearches || [];

  const places = nq ? searchPlaces().filter((p) => fold(p.label).includes(nq))
    .sort((a, b) => (Number(fold(b.label).startsWith(nq)) - Number(fold(a.label).startsWith(nq))) || (PLACE_RANK[a.kind] - PLACE_RANK[b.kind]) || a.label.localeCompare(b.label, "fr")).slice(0, 6) : [];
  const alerts = nq ? dedupeEvents(visible).filter((a) => [a.title, a.street, COMMUNE_BY_ID[a.communeId].name, CATEGORY_BY_ID[a.categoryId].label].some((t) => t && fold(t).includes(nq))).slice(0, 5) : [];
  const cats = nq ? CATEGORIES.filter((c) => fold(c.label).includes(nq)).slice(0, 3) : [];
  const total = places.length + alerts.length + cats.length;
  const outside = nq && total === 0 ? OUT_OF_ZONE.find((n) => fold(n).includes(nq)) : null;

  const remember = (item) => dispatch({ type: "ADD_RECENT", item });
  const goPlace = (p) => { remember({ ...p, kind: p.kind }); dispatch({ type: "MAP_FOCUS", focus: { ...p, kind: "place", placeKind: p.kind } }); };
  const goAlert = (a) => { remember({ kind: "alerte", label: a.title, id: a.id }); dispatch({ type: "MAP_FOCUS", focus: { kind: "alert", id: a.id } }); };
  const goCat = (c) => {
    remember({ kind: "categorie", label: c.label, id: c.id });
    dispatch({ type: "SET_MAP_FILTER", patch: { type: "all", categories: [c.id] } });
    dispatch({ type: "SET_TAB", tab: "alerts" });
    toast(`Filtre : ${c.label}.`);
  };
  const goRecent = (r) => {
    if (r.kind === "alerte") { const a = visible.find((x) => x.id === r.id); if (a) goAlert(a); else toast("Cette alerte n'est plus visible.", { tone: "error", actionLabel: "OK" }); return; }
    if (r.kind === "categorie") { goCat(CATEGORY_BY_ID[r.id]); return; }
    goPlace(r);
  };
  const first = () => (places[0] ? goPlace(places[0]) : alerts[0] ? goAlert(alerts[0]) : cats[0] ? goCat(cats[0]) : null);
  const onKeyDown = (e) => {
    const rows = [...(box.current?.querySelectorAll(".search-row, .search-recent .chip") || [])];
    const i = rows.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); rows[Math.min(rows.length - 1, i + 1)]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) input.current?.focus(); else rows[i - 1]?.focus(); }
  };
  const catChips = (
    <div className="chip-row">{CATEGORIES.map((c) => <Chip key={c.id} icon={c.icon} onClick={() => goCat(c)}>{c.label}</Chip>)}</div>
  );

  return (
    <div className="screen search-screen" onKeyDown={onKeyDown}>
      <header className="search-header">
        <IconButton icon="caret-left" label="Retour" className="flat" onClick={pop} />
        <div className="search-field">
          <Icon name="magnifying-glass" />
          <input ref={input} className="input" type="search" placeholder="Commune, rue, alerte…" aria-label="Rechercher une commune, une rue, une alerte ou une catégorie"
            autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") first(); }} />
          {q ? <IconButton icon="x" label="Effacer la saisie" className="flat sf-clear" onClick={() => { setQ(""); input.current?.focus(); }} /> : null}
        </div>
      </header>
      <p className="sr-only" aria-live="polite">{nq ? `${total} résultat${total > 1 ? "s" : ""}` : ""}</p>
      <div className="screen-pad search-body" ref={box}>
        {!nq ? (
          <Fragment>
            {pos.source !== "default" ? <SearchRow icon="crosshair" label={`Autour de moi · ${COMMUNE_BY_ID[pos.communeId]?.name || "ma position"}`} sub="Revenir à votre zone sur la carte" onClick={() => dispatch({ type: "MAP_FOCUS", focus: { kind: "home" } })} /> : null}
            {recents.length ? (
              <section className="search-group search-recent" aria-labelledby="sg-recent">
                <div className="sg-head"><h2 id="sg-recent">Recherches récentes</h2><button type="button" className="btn btn-tertiary" onClick={() => dispatch({ type: "SET_PREF", key: "recentSearches", value: [] })}>Effacer</button></div>
                <div className="chip-row">{recents.map((r) => <Chip key={r.kind + r.label} icon="clock-counter-clockwise" onClick={() => goRecent(r)}>{r.label}</Chip>)}</div>
              </section>
            ) : null}
            <section className="search-group" aria-labelledby="sg-cats"><div className="sg-head"><h2 id="sg-cats">Catégories</h2></div>{catChips}</section>
          </Fragment>
        ) : outside ? (
          <EmptyState icon="map-trifold" title="95 Alerte n'est pas encore disponible dans cette zone.">{outside} est hors du Val-d'Oise.</EmptyState>
        ) : total === 0 ? (
          <Fragment>
            <EmptyState icon="magnifying-glass" title={`Aucun résultat pour « ${q.trim()} »`}>Vérifiez l'orthographe ou cherchez une commune.</EmptyState>
            <section className="search-group" aria-labelledby="sg-cats2"><div className="sg-head"><h2 id="sg-cats2">Parcourir les catégories</h2></div>{catChips}</section>
          </Fragment>
        ) : (
          <Fragment>
            {places.length ? <section className="search-group" aria-labelledby="sg-places"><div className="sg-head"><h2 id="sg-places">Lieux</h2></div>
              {places.map((p) => <SearchRow key={p.kind + p.label + p.sub} icon={PLACE_ICON[p.kind]} label={p.label} sub={p.sub} q={nq} onClick={() => goPlace(p)} />)}</section> : null}
            {alerts.length ? <section className="search-group" aria-labelledby="sg-alerts"><div className="sg-head"><h2 id="sg-alerts">Alertes</h2></div>
              {alerts.map((a) => { const c = CATEGORY_BY_ID[a.categoryId]; return <SearchRow key={a.id} marker={<Marker family={c.family} icon={c.icon} />} label={a.title} sub={`${c.label} · ${COMMUNE_BY_ID[a.communeId].name} · ${fmtRelative(now - a.createdAt)}`} q={nq} onClick={() => goAlert(a)} />; })}</section> : null}
            {cats.length ? <section className="search-group" aria-labelledby="sg-cats3"><div className="sg-head"><h2 id="sg-cats3">Catégories</h2></div>
              {cats.map((c) => <SearchRow key={c.id} marker={<Marker family={c.family} icon={c.icon} />} label={c.label} sub="Filtrer la liste sur cette catégorie" q={nq} onClick={() => goCat(c)} />)}</section> : null}
          </Fragment>
        )}
      </div>
    </div>
  );
}
