import { Fragment, useState } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Spot } from "@/components/Spot";
import { ReasonOption } from "@/screens/comments/ReasonOption";
import { REPORT_REASONS, threadOf } from "@/screens/comments/comments";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { SafetyNote } from "@/screens/report/SafetyNote";
import { useActions, useStore } from "@/store/store";
import { motionReduced, publicAuthor } from "@/utils/index";
import type { ReportReason } from "@/types";

export interface ReportContentScreenProps {
  kind?: "alert" | "comment";
  alertId?: string;
  commentId?: string;
  step?: "reason" | "confirm" | "sending" | "error" | "done";
  reason?: ReportReason | null;
  note?: string;
}

export function ReportContentScreen({ kind, alertId, commentId, step: initialStep = "reason", reason: initialReason = null, note: initialNote = "" }: ReportContentScreenProps) {
  const { state, dispatch } = useStore();
  const { pop, openSheet, push } = useActions();
  const [step, setStep] = useState(initialStep);
  const [reason, setReason] = useState(initialReason);
  const [note, setNote] = useState(initialNote);
  const alert = state.alerts.find((a) => a.id === alertId);
  const comment = kind === "comment" && alert ? threadOf(state, alert).find((c) => c.id === commentId) : null;
  const key = kind === "comment" ? `comment:${alertId}:${commentId}` : `alert:${alertId}`;
  const reasons = REPORT_REASONS.filter((r) => kind === "alert" || !r.alertOnly);
  const what = kind === "comment" ? "ce commentaire" : "cette alerte";
  const send = () => {
    setStep("sending");
    setTimeout(() => {
      if (state.demo.networkError) { setStep("error"); return; }
      dispatch({ type: "REPORT_CONTENT", key, reason });
      setStep("done");
    }, motionReduced() ? 0 : 800);
  };
  const back = () => (step === "confirm" ? setStep("reason") : pop());
  const r = REPORT_REASONS.find((x) => x.id === reason);
  return (
    <div className="screen report-flow report-content">
      <header className="screen-header">
        {step === "reason" || step === "confirm" ? <IconButton icon="caret-left" label={step === "confirm" ? "Revenir au motif" : "Retour"} onClick={back} /> : <span />}
        <h1>Signaler</h1>
        {step === "sending" ? <span /> : <IconButton icon="x" label="Fermer" onClick={pop} />}
      </header>
      {step === "reason" ? (
        <Fragment>
          <div className="screen-pad report-body">
            <h2 className="question">Pourquoi signalez-vous {what} ?</h2>
            <p className="report-lead">Choisissez le motif le plus proche : la modération vérifiera l'ensemble des règles.</p>
            <div className="reason-list" role="radiogroup" aria-label="Motif du signalement">
              {reasons.map((x) => <ReasonOption key={x.id} name="report-reason" value={x.id} checked={reason === x.id} onChange={(v) => setReason(v as ReportReason)} label={x.label(kind)} help={x.help} />)}
            </div>
            <PrivacyNote>Votre signalement est confidentiel : l'auteur ne saura pas qui l'a signalé.</PrivacyNote>
          </div>
          <ReportFooter>
            {reason === "dangereux" ? <SafetyNote onClick={() => push("emergency", { id: alertId })} /> : null}
            <Button block disabled={!reason} onClick={() => setStep("confirm")}>Continuer</Button>
          </ReportFooter>
        </Fragment>
      ) : step === "confirm" ? (
        <Fragment>
          <div className="screen-pad report-body">
            <h2 className="question">Confirmer le signalement</h2>
            <div className="report-recap">
              <small>{kind === "comment" ? `Commentaire de ${publicAuthor(comment).name}` : "Alerte"}</small>
              <p>{kind === "comment" ? `« ${comment.body} »` : alert.title}</p>
            </div>
            <dl className="preview-list">
              <div className="preview-row"><dt>Motif</dt><dd>{r.label(kind)}</dd><Button variant="tertiary" className="btn-inline" onClick={() => setStep("reason")} aria-label="Modifier : motif">Modifier</Button></div>
            </dl>
            <Field id="rc-note" label="Précision (facultatif)" textarea rows={3} max={300} value={note} placeholder={reason === "autre" ? "Dites-nous ce qui ne va pas…" : "Ce qui vous a alerté…"}
              help="N'indiquez aucune donnée personnelle." onChange={(e) => setNote(e.target.value)} />
            <p className="report-lead"><Icon name="shield-check" className="ph-sm" /> Envoyé à l'équipe de modération de 95 Alerte.</p>
          </div>
          <ReportFooter note={state.demo.offline ? "Envoi impossible hors connexion." : null}>
            <Button block icon="flag" disabled={state.demo.offline} onClick={send}>Envoyer le signalement</Button>
          </ReportFooter>
        </Fragment>
      ) : step === "sending" ? (
        <div className="report-outcome" role="status" aria-live="polite"><span className="spinner big" aria-hidden="true" /><h2>Envoi du signalement…</h2></div>
      ) : step === "error" ? (
        <Fragment>
          <div className="report-outcome" role="alert">
            <Spot icon="cloud-slash" tone="neutral" />
            <h2>Impossible d'envoyer le signalement. Vérifiez votre connexion.</h2>
            <p>Votre motif est gardé : réessayez dans un instant.</p>
          </div>
          <ReportFooter>
            <Button block icon="arrows-clockwise" onClick={send}>Réessayer</Button>
            <Button block variant="secondary" onClick={() => setStep("confirm")}>Revenir au récapitulatif</Button>
          </ReportFooter>
        </Fragment>
      ) : (
        <Fragment>
          <div className="report-outcome is-done">
            <Spot icon="flag" tone="neutral" />
            <h2 role="status">Merci pour votre signalement</h2>
            <p>L'équipe de modération de 95 Alerte va examiner {what}. S'il ne respecte pas les règles de la communauté, il sera masqué. L'auteur ne saura pas qui l'a signalé.</p>
            <Button variant="tertiary" onClick={() => openSheet("community-rules", {})}>Règles de la communauté</Button>
          </div>
          <ReportFooter><Button block onClick={pop}>Terminé</Button></ReportFooter>
        </Fragment>
      )}
    </div>
  );
}
