import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Spot } from "@/components/Spot";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { PERSONAL_DATA, draftAlert } from "@/screens/report/report";
import { useActions, useNow, useStore } from "@/store/store";
import { cx, motionReduced, routeAlert } from "@/utils/index";
import type { Draft } from "@/types";

export interface ReportOutcomeProps {
  d: Draft;
}

export function ReportOutcome({ d }: ReportOutcomeProps) {
  const { state, dispatch } = useStore();
  const { pop, push } = useActions();
  const now = useNow();
  const go = (step) => dispatch({ type: "DRAFT_GO", step });
  const [stage, setStage] = useState(motionReduced() ? 4 : 0);
  useEffect(() => {
    if (d.step !== "publishing") return undefined;
    const t = setTimeout(() => {
      if (state.demo.networkError || state.demo.offline) { go("error"); return; }
      if (PERSONAL_DATA.test(`${d.title} ${d.description || ""}`)) { go("refused"); return; }
      dispatch({ type: "PUBLISH_ALERT", alert: draftAlert(d, now, `p${Date.now().toString(36)}`) });
    }, motionReduced() ? 50 : 1100);
    return () => clearTimeout(t);
  }, [d.step]);
  useEffect(() => {
    if (d.step !== "done" || stage >= 4) return undefined;
    const t = setTimeout(() => setStage((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [d.step, stage]);
  const close = () => { dispatch({ type: "DRAFT_RESET" }); pop(); };
  if (d.step === "publishing") {
    return (
      <div className="report-outcome" role="status" aria-live="polite">
        <span className="spinner big" aria-hidden="true" />
        <h2>Publication de votre alerte…</h2>
      </div>
    );
  }
  if (d.step === "error") {
    return (
      <Fragment>
        <div className="report-outcome" role="alert">
          <Spot icon="cloud-slash" tone="neutral" />
          <h2>Impossible de publier votre alerte. Vérifiez votre connexion.</h2>
          <p>Votre signalement est gardé : rien n'est perdu.</p>
        </div>
        <ReportFooter>
          <Button block icon="arrows-clockwise" onClick={() => go("publishing")}>Réessayer</Button>
          <Button block variant="secondary" onClick={() => go("preview")}>Revenir à l'aperçu</Button>
        </ReportFooter>
      </Fragment>
    );
  }
  if (d.step === "refused") {
    return (
      <Fragment>
        <div className="report-outcome" role="alert">
          <Spot icon="eye-slash" tone="neutral" />
          <h2>Publication refusée</h2>
          <p>Votre alerte contient une information personnelle (numéro de téléphone, plaque d'immatriculation ou adresse e-mail). Retirez-la, puis publiez à nouveau.</p>
        </div>
        <ReportFooter>
          <Button block onClick={() => go("description")}>Modifier la description</Button>
          <Button block variant="tertiary" onClick={close}>Abandonner</Button>
        </ReportFooter>
      </Fragment>
    );
  }
  // Publiée
  const a = state.alerts.find((x) => x.id === d.publishedId);
  if (!a) return null;
  const route = routeAlert(a);
  const nodes = [["user-circle", "Vous"], ["megaphone", "95 Alerte"], ["seal-check", "Analyse"], ["buildings", "Service"]];
  const seeMap = () => { dispatch({ type: "DRAFT_RESET" }); dispatch({ type: "MAP_FOCUS", focus: { kind: "alert", id: a.id } }); };
  const seeAlert = () => { dispatch({ type: "DRAFT_RESET" }); dispatch({ type: "MAP_FOCUS", focus: { kind: "alert", id: a.id } }); push("alert", { id: a.id }); };
  return (
    <Fragment>
      <div className="report-outcome is-done">
        <Spot icon="seal-check" tone="positive" />
        <h2 role="status">Votre alerte a été publiée.</h2>
        <ol className="route-steps" aria-label="Transmission du signalement">
          {nodes.map(([icon, label], i) => <li key={label} className={cx(i < stage && "is-done", i === stage && "is-now")}><span><Icon name={icon} /></span>{label}</li>)}
        </ol>
        <p className={cx("route-result", stage >= 4 && "is-shown")} role="status" aria-live="polite">
          {stage >= 4 ? <Fragment><Icon name="check-circle-fill" /><span>Votre signalement a été transmis au service compétent : <b>{route.name}</b></span></Fragment> : null}
        </p>
      </div>
      <ReportFooter>
        <Button block onClick={seeMap}>Voir sur la carte</Button>
        <Button block variant="secondary" onClick={seeAlert}>Voir mon alerte</Button>
      </ReportFooter>
    </Fragment>
  );
}
