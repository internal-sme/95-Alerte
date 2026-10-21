import { Fragment, useEffect, useRef, useState } from "react";
import { AlertCard } from "@/components/AlertCard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Skeleton } from "@/components/Skeleton";
import { COMMUNE_BY_ID } from "@/data/seed";
import { ActiveFilters } from "@/filters/ActiveFilters";
import { FilterButton } from "@/filters/FilterButton";
import { SortControl } from "@/filters/SortControl";
import { TypeChips } from "@/filters/TypeChips";
import { activeFilterCount, useFilteredAlerts } from "@/filters/filters";
import { FeedEnd } from "@/screens/alerts/FeedEnd";
import { FeedSection } from "@/screens/alerts/FeedSection";
import { feedGroups, feedMemory } from "@/screens/alerts/feed";
import { zoneRadius } from "@/screens/onboarding/onboarding";
import { useActions, useNow, useStore, useVisibleAlerts } from "@/store/store";
import { motionReduced } from "@/utils/index";

export function AlertsScreen() {
  const { state, dispatch } = useStore();
  const { push } = useActions();
  const now = useNow();
  const all = useVisibleAlerts();
  const list = useFilteredAlerts();
  const ref = useRef(null);
  const [loading, setLoading] = useState(!feedMemory.loadedOnce);
  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => { setLoading(false); feedMemory.loadedOnce = true; }, 700);
    return () => clearTimeout(t);
  }, [loading]);
  const pos = state.session.position;
  const hasPos = pos.source !== "default";
  const sort = state.listSort === "distance" && !hasPos ? "relevance" : state.listSort;
  const f = state.mapFilter;
  const filtered = f.type !== "all" || activeFilterCount(f) > 0;
  const radius = zoneRadius(state);
  const groups = feedGroups(list, sort, { pos, now, hasPos, radius }).filter((g) => g.items.length);
  const open = (a) => push("alert", { id: a.id }); // S2 : de la liste à la fiche en un toucher
  const top = () => ref.current?.scrollTo({ top: 0, behavior: motionReduced() ? "auto" : "smooth" });
  const scope = hasPos ? `${COMMUNE_BY_ID[pos.communeId]?.name || "Ma position"} · ${radius} km` : "Tout le Val-d'Oise";
  return (
    <div className="screen feed" ref={ref}>
      <div className="feed-top">
        <div className="screen-title"><h1>Alertes</h1><p>{scope} · dernières 24 h</p></div>
        <div className="map-top">
          <button type="button" className="search" onClick={() => push("search")}><Icon name="magnifying-glass" /><span>Rechercher<small> · alerte, lieu, catégorie</small></span></button>
          <FilterButton />
        </div>
        <TypeChips />
      </div>
      <div className="screen-pad feed-body">
        <div className="feed-bar">
          <span aria-live="polite">{loading ? "Chargement…" : <Fragment><b>{list.length}</b> alerte{list.length > 1 ? "s" : ""}{filtered ? " avec ces filtres" : ""}</Fragment>}</span>
          <SortControl />
        </div>
        <ActiveFilters />
        {loading ? (
          <Fragment><Skeleton height={14} width="40%" /><Skeleton height={104} radius="var(--r-md)" /><Skeleton height={104} radius="var(--r-md)" /><Skeleton height={104} radius="var(--r-md)" /></Fragment>
        ) : all.length === 0 ? (
          <EmptyState title="Aucune alerte dans cette zone.">Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
        ) : list.length === 0 ? (
          <EmptyState icon="sliders-horizontal" title="Aucune alerte avec ces filtres." action={<Button variant="secondary" onClick={() => dispatch({ type: "RESET_MAP_FILTER" })}>Effacer les filtres</Button>}>Retirez un filtre, élargissez la période ou la distance.</EmptyState>
        ) : (
          <Fragment>
            {groups.map((g) => (
              <FeedSection key={g.t} title={g.t} count={sort === "relevance" ? null : g.items.length} onAll={g.all && !(g.all === "distance" && !hasPos) ? () => { dispatch({ type: "SET_LIST_SORT", sort: g.all }); top(); } : null}>
                {g.items.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => open(a)} />)}
              </FeedSection>
            ))}
            <FeedEnd onTop={top} />
          </Fragment>
        )}
      </div>
    </div>
  );
}
