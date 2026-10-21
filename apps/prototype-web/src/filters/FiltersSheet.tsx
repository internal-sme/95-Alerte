import { Fragment } from "react";
import { Button } from "@/components/Button";
import { CategoryTile } from "@/components/CategoryTile";
import { Chip } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Switch } from "@/components/Switch";
import { CATEGORIES } from "@/data/seed";
import { TypeChips } from "@/filters/TypeChips";
import { DISTANCES, PERIODS, SORTS, mapFilterMatch } from "@/filters/filters";
import { useActions, useNow, useStore, useVisibleAlerts } from "@/store/store";

export function FiltersSheet() {
  const { state, dispatch } = useStore();
  const { closeSheet } = useActions();
  const now = useNow();
  const alerts = useVisibleAlerts();
  const f = state.mapFilter;
  const pos = state.session.position;
  const hasPos = pos.source !== "default";
  const set = (patch) => dispatch({ type: "SET_MAP_FILTER", patch });
  const count = alerts.filter((a) => mapFilterMatch(f, a, pos, now)).length;
  const toggleCat = (id) => set({ categories: f.categories.includes(id) ? f.categories.filter((x) => x !== id) : [...f.categories, id] });
  const cats = (type) => CATEGORIES.filter((c) => c.type === type && (f.type === "all" || f.type === type));
  return (
    <Fragment>
      <section className="filter-group" aria-labelledby="fg-sort">
        <h3 id="fg-sort">Trier la liste par</h3>
        <SegmentedControl block label="Trier la liste par" value={state.listSort} onChange={(v) => dispatch({ type: "SET_LIST_SORT", sort: v })} options={SORTS.map((o) => ({ value: o.v, label: o.l }))} />
      </section>
      <section className="filter-group" aria-labelledby="fg-type">
        <h3 id="fg-type">Type</h3>
        <TypeChips />
      </section>
      {["negative", "positive"].map((t) => cats(t).length ? (
        <section key={t} className="filter-group" aria-labelledby={`fg-${t}`}>
          <h3 id={`fg-${t}`}>{t === "negative" ? "Catégories · Négatives" : "Catégories · Positives"}</h3>
          <div className="cat-grid is-compact">{cats(t).map((c) => <CategoryTile key={c.id} category={c} selected={f.categories.includes(c.id)} onClick={() => toggleCat(c.id)} />)}</div>
        </section>
      ) : null)}
      <section className="filter-group" aria-labelledby="fg-period">
        <h3 id="fg-period">Période</h3>
        <div className="chip-row" role="group" aria-labelledby="fg-period">
          <Chip selected={f.period === "all"} onClick={() => set({ period: "all" })}>Toutes</Chip>
          {PERIODS.map((p) => <Chip key={p.v} selected={f.period === p.v} onClick={() => set({ period: p.v })}>{p.l}</Chip>)}
        </div>
      </section>
      <section className="filter-group" aria-labelledby="fg-dist">
        <h3 id="fg-dist">Distance</h3>
        {hasPos ? (
          <div className="chip-row" role="group" aria-labelledby="fg-dist">
            {DISTANCES.map((d) => <Chip key={d.l} selected={f.distance === d.v} onClick={() => set({ distance: d.v })}>{d.l}</Chip>)}
          </div>
        ) : <p className="demo-note">Choisissez votre commune pour filtrer par distance.</p>}
      </section>
      <section className="filter-group">
        <div className="filter-row">
          <span className="filter-urgent" aria-hidden="true"><Icon name="siren-fill" /></span>
          <Switch id="filter-urgent" label="Seulement les alertes urgentes" checked={f.urgentOnly} onChange={(on) => set({ urgentOnly: on })} />
        </div>
      </section>
      <div className="filter-footer">
        <Button block onClick={closeSheet} aria-live="polite">{count ? `Voir ${count} alerte${count > 1 ? "s" : ""}` : "Aucune alerte avec ces filtres"}</Button>
        <button type="button" className="btn btn-tertiary" onClick={() => dispatch({ type: "RESET_MAP_FILTER" })}>Tout effacer</button>
      </div>
    </Fragment>
  );
}
