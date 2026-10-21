import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { suggestTitle } from "@/screens/report/report";
import type { Draft } from "@/types";

export interface StepDescriptionProps {
  d?: Draft;
  set?: (patch: Partial<Draft>) => void;
  next?: () => void;
}

export function StepDescription({ d, set, next }: StepDescriptionProps) {
  const [error, setError] = useState(null);
  useEffect(() => { if (!d.title) set({ title: suggestTitle(d), titleSuggested: true }); }, []);
  const submit = () => {
    if ((d.title || "").trim().length < 5) { setError("Donnez un titre d'au moins 5 caractères."); document.getElementById("rp-title")?.focus(); return; }
    next();
  };
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Décrivez ce que vous voyez</h2>
        <Field id="rp-title" label="Titre" max={80} value={d.title || ""} error={error}
          help={d.titleSuggested ? "Titre proposé d'après la catégorie et le lieu : modifiez-le si besoin." : "Court et précis, il s'affiche sur la carte."}
          onChange={(e) => { set({ title: e.target.value, titleSuggested: false }); setError(null); }} />
        <Field id="rp-desc" label="Description (facultatif)" textarea rows={5} max={500} value={d.description || ""}
          placeholder="Ce qui se passe, depuis quand, ce qui gêne…" help="N'indiquez ni nom, ni numéro de téléphone, ni plaque d'immatriculation."
          onChange={(e) => set({ description: e.target.value })} />
      </div>
      <ReportFooter><Button block onClick={submit}>Continuer</Button></ReportFooter>
    </Fragment>
  );
}
