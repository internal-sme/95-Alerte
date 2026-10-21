import { Icon } from "@/components/Icon";
import { useActions, useStore } from "@/store/store";
import type { Alert } from "@/types";

/* F-09 : un vote par alerte, modifiable ; retoucher le même bouton retire le vote (G2) */
export interface VoteBarProps {
  alert: Alert;
  compact?: boolean;
  closed?: any;
}

export function VoteBar({ alert, compact, closed }: VoteBarProps) {
  const { state } = useStore();
  const { vote, toast, openSheet } = useActions();
  const current = state.votes[alert.id] || 0;
  const disabled = closed || state.demo.offline;
  const onVote = (v) => {
    if (!state.session.user) { openSheet("sign-in", { reason: "vote" }); return; }
    vote(alert.id, v);
    toast(current === 0 ? "Merci, votre vote est enregistré." : current === v ? "Vote retiré." : "Vote modifié.");
  };
  return (
    <div className="vote" role="group" aria-label="Votre avis sur ce signalement">
      <button className="up" type="button" disabled={disabled} aria-pressed={current === 1} onClick={() => onVote(1)} aria-label={`Confirmer, ${alert.votesUp} confirmations`}>
        <Icon name={current === 1 ? "arrow-fat-up-fill" : "arrow-fat-up"} />{compact ? null : "Confirmer"} <span className="n">{alert.votesUp}</span>
      </button>
      <button className="down" type="button" disabled={disabled} aria-pressed={current === -1} onClick={() => onVote(-1)} aria-label={`Contester, ${alert.votesDown} contestations`}>
        <Icon name={current === -1 ? "arrow-fat-down-fill" : "arrow-fat-down"} />{compact ? null : "Contester"} <span className="n">{alert.votesDown}</span>
      </button>
    </div>
  );
}
