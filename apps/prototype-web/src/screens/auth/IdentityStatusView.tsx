import { Fragment } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Timeline } from "@/components/Timeline";
import { ID_DOCS, ID_RESULT_VIEW } from "@/screens/auth/auth";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";

export interface IdentityStatusViewProps {
  onContinue: (...args: any[]) => any;
  onRetry: (...args: any[]) => any;
}

export function IdentityStatusView({ onContinue, onRetry }: IdentityStatusViewProps) {
  const { state, dispatch } = useStore();
  const result = state.auth.idResult;
  const v = ID_RESULT_VIEW[result];
  const doc = ID_DOCS.find((d) => d.id === state.auth.docType);
  const steps = [
    { id: "sent", label: "Document envoyé", detail: doc ? doc.label : null },
    { id: "check", label: v.failed ? "Vérification interrompue" : result === "reussie" ? "Vérification terminée" : "Vérification", detail: result === "en_cours" ? "Délai indicatif : moins de 24 h" : result === "manuelle" ? "Délai indicatif : 48 h" : null },
    { id: "done", label: "Identité vérifiée", final: true },
  ];
  return (
    <Fragment>
      <div className="screen-pad">
        <div className="auth-center compact" role="status">
          <span className={cx("status-hero", `tone-${v.tone}`)}><Icon name={v.icon} /></span>
          <h2>{v.title}</h2>
          <p>{v.text}</p>
        </div>
        <div className="card"><Timeline steps={steps} currentIndex={v.step} /></div>
      </div>
      <div className="screen-footer stack-footer">
        {v.failed ? (
          <Fragment>
            <Button block icon="camera" onClick={onRetry}>{result === "refusee" ? "Reprendre une photo" : "Nouvelle tentative"}</Button>
            {result === "echouee" ? <Button block variant="ghost" onClick={() => dispatch({ type: "AUTH_SET", patch: { idResult: "manuelle" } })}>Demander une vérification manuelle</Button> : <Button block variant="ghost" onClick={onContinue}>Continuer sans vérification</Button>}
          </Fragment>
        ) : <Button block onClick={onContinue}>Continuer</Button>}
      </div>
    </Fragment>
  );
}
