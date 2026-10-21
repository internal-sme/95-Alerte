import { Fragment, useCallback, useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { CATEGORY_BY_ID, COMMUNE_BY_ID } from "@/data/seed";
import { PinMap } from "@/screens/report/PinMap";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { reverseGeocode } from "@/screens/report/report";
import { SearchRow } from "@/screens/search/SearchRow";
import { PLACE_ICON, searchPlaces } from "@/screens/search/search";
import { useStore } from "@/store/store";
import { foldQuery } from "@/utils/index";
import type { Draft } from "@/types";

/* 6.4 : trois chemins vers le lieu (ma position, une adresse, la carte), refus hors du Val-d'Oise */
export interface StepPlaceProps {
  d?: Draft;
  set?: (patch: Partial<Draft>) => void;
  next?: () => void;
}

export function StepPlace({ d, set, next }: StepPlaceProps) {
  const { state } = useStore();
  const pos = state.session.position;
  const cat = CATEGORY_BY_ID[d.categoryId];
  const hasPos = pos.source !== "default";
  const [center, setCenter] = useState(() => (d.place ? { lat: d.place.lat, lng: d.place.lng, key: 0 } : { lat: pos.lat, lng: pos.lng, key: 0 }));
  const [q, setQ] = useState("");
  const place = d.place;
  const nq = foldQuery(q);
  const results = nq.length >= 2 ? searchPlaces().filter((p) => foldQuery(p.label).includes(nq)).slice(0, 5) : [];
  const onSettle = useCallback((x, y) => set({ place: reverseGeocode(x, y) }), [set]);
  const goTo = (p) => { setCenter({ lat: p.lat, lng: p.lng, key: Date.now() }); setQ(""); };
  const shown = place && place.inside ? (cat.precision === "rue" && place.street ? `${place.street}, ${COMMUNE_BY_ID[place.communeId].name}` : `${place.quartier}, ${COMMUNE_BY_ID[place.communeId].name}`) : null;
  return (
    <Fragment>
      <div className="report-place">
        <PinMap center={center} onSettle={onSettle} family={cat.family} icon={cat.icon} />
        <div className="place-search">
          <div className="search-field">
            <Icon name="magnifying-glass" />
            <input className="input" type="search" placeholder="Rechercher une adresse, une commune…" aria-label="Rechercher une adresse" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results[0]) goTo(results[0]); }} />
            {q ? <IconButton icon="x" label="Effacer la saisie" className="flat sf-clear" onClick={() => setQ("")} /> : null}
          </div>
          {results.length ? (
            <div className="place-results" role="listbox" aria-label="Adresses trouvées">
              {results.map((p) => <SearchRow key={p.kind + p.label + p.sub} icon={PLACE_ICON[p.kind]} label={p.label} sub={p.sub} q={nq} onClick={() => goTo(p)} />)}
            </div>
          ) : null}
        </div>
      </div>
      <div className="place-panel" aria-live="polite">
        {place && place.inside ? (
          <Fragment>
            <p className="place-addr"><Icon name="map-pin-fill" /><b>{place.street ? `${place.street}, ` : ""}{COMMUNE_BY_ID[place.communeId].name}</b></p>
            <p className="place-sub">Quartier {place.quartier} · affiché sur l'alerte : {shown}</p>
          </Fragment>
        ) : (
          <Fragment>
            <p className="place-addr is-out"><Icon name="map-trifold" /><b>Hors du Val-d'Oise</b></p>
            <p className="place-sub">95 Alerte n'est pas encore disponible dans cette zone.</p>
          </Fragment>
        )}
        {hasPos ? <Button variant="tertiary" className="btn-inline" icon="crosshair" onClick={() => setCenter({ lat: pos.lat, lng: pos.lng, key: Date.now() })}>Utiliser ma position</Button> : null}
      </div>
      <ReportFooter><Button block disabled={!place || !place.inside} onClick={next}>Confirmer cette position</Button></ReportFooter>
    </Fragment>
  );
}
