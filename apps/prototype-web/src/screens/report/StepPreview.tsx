import { Fragment } from "react";
import { AlertCard } from "@/components/AlertCard";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { CATEGORY_BY_ID } from "@/data/seed";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { draftAlert } from "@/screens/report/report";
import { useNow, useStore } from "@/store/store";
import { displayPlace, publicName, routeAlert } from "@/utils/index";
import type { Draft, ReportStep } from "@/types";

/* 6.8 : l'aperçu est la confirmation (H2) : la carte telle qu'elle sera vue, « Modifier » par bloc, 24 h, service */
export interface StepPreviewProps {
  d?: Draft;
  go?: (step: ReportStep) => void;
}

export function StepPreview({ d, go }: StepPreviewProps) {
  const { state } = useStore();
  const now = useNow();
  const a = draftAlert(d, now);
  const cat = CATEGORY_BY_ID[a.categoryId];
  const route = routeAlert(a);
  const rows = [
    ["category", "Catégorie", `${cat.label} · ${d.type === "positive" ? "positif" : "négatif"}`],
    ["place", "Lieu", displayPlace(a)],
    ["description", "Description", a.description || "Aucune description"],
    ["photo", "Photos", d.photos.length ? `${d.photos.length} photo${d.photos.length > 1 ? "s" : ""}` : "Aucune photo"],
    ["identity", "Publié par", a.anonymous ? "Citoyen anonyme" : publicName(state.session.user)],
  ];
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Vérifiez avant de publier</h2>
        <AlertCard alert={a} onOpen={() => {}} />
        <dl className="preview-list">
          {rows.map(([step, label, value]) => (
            <div key={step} className="preview-row">
              <dt>{label}</dt><dd>{value}</dd>
              <Button variant="tertiary" className="btn-inline" onClick={() => go(step)} aria-label={`Modifier : ${label}`}>Modifier</Button>
            </div>
          ))}
        </dl>
        <div className="publish-scope">
          <p><Icon name="timer" /><span>Visible par tous pendant <b>24 heures</b>, sur la carte et dans la liste.</span></p>
          <p><Icon name="buildings" /><span>Transmise à : <b>{route.name}</b></span></p>
        </div>
      </div>
      <ReportFooter note={state.demo.offline ? "Publication impossible hors connexion. Votre brouillon est gardé." : null}>
        <Button block icon="paper-plane-tilt" disabled={state.demo.offline} onClick={() => go("publishing")}>Publier l'alerte</Button>
      </ReportFooter>
    </Fragment>
  );
}
