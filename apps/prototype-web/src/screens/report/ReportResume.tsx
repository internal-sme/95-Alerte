import { Fragment } from "react";
import { Button } from "@/components/Button";
import { Spot } from "@/components/Spot";
import { CATEGORY_BY_ID, COMMUNE_BY_ID } from "@/data/seed";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { REPORT_STEPS } from "@/screens/report/report";
import { useStore } from "@/store/store";
import type { Draft } from "@/types";

/* Brouillon retrouvé au prochain « + Signaler » (H4) */
export interface ReportResumeProps {
  d: Draft;
}

export function ReportResume({ d }: ReportResumeProps) {
  const { dispatch } = useStore();
  const cat = d.categoryId ? CATEGORY_BY_ID[d.categoryId] : null;
  const idx = REPORT_STEPS.findIndex((s) => s.id === d.step);
  return (
    <Fragment>
      <div className="report-outcome">
        <Spot icon="pencil-simple" tone="neutral" />
        <h2>Reprendre votre signalement ?</h2>
        <p>{cat ? `${cat.label}${d.place && d.place.inside ? ` · ${COMMUNE_BY_ID[d.place.communeId].name}` : ""} · ` : ""}arrêté à l'étape {idx + 1} sur {REPORT_STEPS.length}.</p>
      </div>
      <ReportFooter>
        <Button block onClick={() => dispatch({ type: "DRAFT_SET", patch: { saved: false } })}>Reprendre</Button>
        <Button block variant="tertiary" onClick={() => { dispatch({ type: "DRAFT_RESET" }); dispatch({ type: "DRAFT_START" }); }}>Recommencer</Button>
      </ReportFooter>
    </Fragment>
  );
}
