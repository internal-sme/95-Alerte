import { Fragment, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { ListItem } from "@/components/ListItem";
import { COMMUNES, COMMUNE_BY_ID, INTERCOS } from "@/data/seed";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { OUT_OF_ZONE } from "@/screens/onboarding/onboarding";
import { useStore } from "@/store/store";
import { normalize } from "@/utils/index";
import type { ReactNode } from "react";

/* UI-006 : recherche + liste des communes du Val-d'Oise ; aucun résultat ; hors territoire */
export interface CommunePickerProps {
  onPick: (...args: any[]) => any;
  onBack: (...args: any[]) => any;
  title?: ReactNode;
}

export function CommunePicker({ onPick, onBack, title = "Votre commune" }: CommunePickerProps) {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const nq = normalize(q);
  const list = [...COMMUNES].sort((a, b) => a.name.localeCompare(b.name, "fr")).filter((c) => !nq || normalize(c.name).includes(nq));
  const outside = nq && list.length === 0 ? OUT_OF_ZONE.find((n) => normalize(n).includes(nq)) : null;
  const gpsOk = state.session.position.permission === "granted" && !state.demo.permissionDenied;
  return (
    <div className="screen auth">
      <AuthHeader title={title} onBack={onBack} />
      <div className="screen-pad">
        <div className="field">
          <label htmlFor="commune-q" className="sr-only">Rechercher une commune</label>
          <div className="search-field"><Icon name="magnifying-glass" /><input id="commune-q" className="input" type="search" placeholder="Rechercher une commune" aria-label="Rechercher une commune du Val-d'Oise" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <p className="sr-only" aria-live="polite">{outside ? "Hors territoire" : `${list.length} commune${list.length > 1 ? "s" : ""}`}</p>
        {outside ? (
          <EmptyState icon="map-trifold" title="95 Alerte n'est pas encore disponible dans cette zone.">{outside} est hors du Val-d'Oise. Choisissez une commune du département.</EmptyState>
        ) : list.length === 0 ? (
          <EmptyState icon="magnifying-glass" title="Aucune commune ne correspond.">Vérifiez l'orthographe ou essayez un autre nom.</EmptyState>
        ) : (
          <div className="list">
            {gpsOk && !nq ? <ListItem icon="crosshair" label="Autour de moi · Pontoise" onClick={() => onPick(COMMUNE_BY_ID.pontoise, "gps")} /> : null}
            {list.map((c) => <ListItem key={c.id} icon="map-pin" label={<Fragment>{c.name}<small className="li-sub">{INTERCOS[c.interco]}</small></Fragment>} onClick={() => onPick(c, "commune")} />)}
          </div>
        )}
      </div>
    </div>
  );
}
