import { Fragment } from "react";
import { Button } from "@/components/Button";
import { RadioCard } from "@/components/RadioCard";
import { CATEGORY_BY_ID } from "@/data/seed";
import { ReportFooter } from "@/screens/report/ReportFooter";
import type { Draft } from "@/types";

/* 6.2 : deux cartes de même poids (P7) */
export interface StepTypeProps {
  d?: Draft;
  set?: (patch: Partial<Draft>) => void;
  next?: () => void;
}

export function StepType({ d, set, next }: StepTypeProps) {
  const pick = (type) => {
    const cat = d.categoryId ? CATEGORY_BY_ID[d.categoryId] : null;
    set({ type, ...(cat && cat.type !== type ? { categoryId: null } : {}) });
  };
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Que souhaitez-vous signaler ?</h2>
        <div className="radio-list" role="radiogroup" aria-label="Type d'événement">
          <RadioCard large name="report-type" value="positive" family="positive" icon="star-fill" checked={d.type === "positive"} onChange={pick}
            title="Un événement positif" description="Solidarité, culture, sport, environnement, vie de quartier…" />
          <RadioCard large name="report-type" value="negative" family="incident" icon="warning-fill" checked={d.type === "negative"} onChange={pick}
            title="Un événement négatif" description="Incident, danger, dégradation, propreté, nuisance…" />
        </div>
      </div>
      <ReportFooter><Button block disabled={!d.type} onClick={next}>Continuer</Button></ReportFooter>
    </Fragment>
  );
}
