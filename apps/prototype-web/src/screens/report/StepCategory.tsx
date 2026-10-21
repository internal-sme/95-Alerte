import { Fragment } from "react";
import { Button } from "@/components/Button";
import { CategoryTile } from "@/components/CategoryTile";
import { FAMILY_LABEL } from "@/components/meta";
import { CATEGORIES, CATEGORY_BY_ID } from "@/data/seed";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { SafetyNote } from "@/screens/report/SafetyNote";
import { REPORT_FAMILIES, isCritical } from "@/screens/report/report";
import { useActions } from "@/store/store";
import type { Draft } from "@/types";

/* 6.3 : grille filtrée par le type, groupée par famille ; consigne de sécurité pour les incidents */
export interface StepCategoryProps {
  d?: Draft;
  set?: (patch: Partial<Draft>) => void;
  next?: () => void;
}

export function StepCategory({ d, set, next }: StepCategoryProps) {
  const { push } = useActions();
  const cats = CATEGORIES.filter((c) => c.type === d.type);
  const cat = d.categoryId ? CATEGORY_BY_ID[d.categoryId] : null;
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Quelle catégorie ?</h2>
        {REPORT_FAMILIES[d.type].map((fam) => {
          const list = cats.filter((c) => c.family === fam);
          return list.length ? (
            <section key={fam} className="filter-group" aria-label={FAMILY_LABEL[fam]}>
              <h3>{FAMILY_LABEL[fam]}</h3>
              <div className="cat-grid">{list.map((c) => <CategoryTile key={c.id} category={c} selected={d.categoryId === c.id} onClick={() => set({ categoryId: c.id })} />)}</div>
            </section>
          ) : null;
        })}
      </div>
      <ReportFooter>
        {isCritical(cat) ? <SafetyNote onClick={() => push("emergency", {})} /> : null}
        <Button block disabled={!cat} onClick={next}>Continuer</Button>
      </ReportFooter>
    </Fragment>
  );
}
