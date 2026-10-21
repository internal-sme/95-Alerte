import { Button } from "@/components/Button";
import { CommentItem } from "@/components/CommentItem";
import { commentTime } from "@/components/helpers";
import { threadOf } from "@/screens/comments/comments";
import { useActions, useStore } from "@/store/store";
import type { Alert } from "@/types";

/* Aperçu des commentaires (G6) : les 2 derniers, en lecture seule ; le fil complet s'ouvre dans l'écran Commentaires (I2) */
export interface CommentsPreviewProps {
  alert: Alert;
}

export function CommentsPreview({ alert }: CommentsPreviewProps) {
  const { state } = useStore();
  const { push } = useActions();
  const list = threadOf(state, alert).filter((c) => !c.parentId && !c.status).sort((a, b) => commentTime(b) - commentTime(a)).slice(0, 2).reverse();
  const n = alert.commentsCount;
  return (
    <section className="detail-section" aria-labelledby="dt-comments">
      <h2 id="dt-comments">Commentaires{n ? <small> · {n}</small> : null}</h2>
      {n === 0 ? <p className="detail-hint">Aucun commentaire pour le moment. <b>Soyez le premier à réagir.</b></p> : null}
      {list.map((c) => <CommentItem key={c.id} comment={c} readOnly />)}
      <Button variant="secondary" block icon={n ? undefined : "chat-circle"} onClick={() => push("comments", { id: alert.id, compose: !n })}>{n ? `Voir ${n > 1 ? `les ${n} commentaires` : "le commentaire"}` : "Commenter"}</Button>
    </section>
  );
}
