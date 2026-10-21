import { Fragment } from "react";
import { ME_ID } from "@/data/seed";
import { threadOf } from "@/screens/comments/comments";
import { MenuRow } from "@/screens/detail/MenuRow";
import { useActions, useStore } from "@/store/store";

/* 7.3, 7.5 : menu d'un commentaire (Nextdoor) — répondre, signaler, supprimer le sien */
export interface CommentMenuSheetProps {
  alertId?: string;
  commentId?: string;
  onReply?: () => void;
}

export function CommentMenuSheet({ alertId, commentId, onReply }: CommentMenuSheetProps) {
  const { state, dispatch } = useStore();
  const { closeSheet, confirm, toast, push, openSheet } = useActions();
  const alert = state.alerts.find((a) => a.id === alertId);
  const comment = alert ? threadOf(state, alert).find((c) => c.id === commentId) : null;
  if (!comment) return null;
  const mine = !!state.session.user && comment.authorId === ME_ID;
  const reported = state.reports[`comment:${alertId}:${commentId}`];
  const remove = () => {
    closeSheet();
    confirm({
      title: "Supprimer ce commentaire ?", body: "Il ne sera plus visible. Les réponses restent. Cette action est définitive.",
      confirmLabel: "Supprimer", destructive: true,
      onConfirm: () => { dispatch({ type: "DELETE_COMMENT", alertId, commentId }); toast("Commentaire supprimé."); },
    });
  };
  return (
    <div className="menu-list">
      <MenuRow icon="arrow-bend-up-left" label="Répondre" help="Votre réponse s'affiche sous ce commentaire" onClick={() => { closeSheet(); onReply?.(); }} />
      {mine ? null : reported ? <MenuRow icon="flag" label="Commentaire signalé" help="Merci : la modération va l'examiner." disabled /> : (
        <MenuRow icon="flag" label="Signaler ce commentaire" help="Offensant, faux, spam, données personnelles…" more
          onClick={() => (state.session.user ? push("report-content", { kind: "comment", alertId, commentId }) : openSheet("sign-in", { reason: "flag" }))} />
      )}
      {mine ? (
        <Fragment>
          <hr />
          <MenuRow icon="trash" label="Supprimer mon commentaire" help="Il disparaîtra pour tout le monde" destructive onClick={remove} />
        </Fragment>
      ) : null}
    </div>
  );
}
