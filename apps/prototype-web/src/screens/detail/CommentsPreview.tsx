import { Button } from "@/components/Button";
import { CommentItem } from "@/components/CommentItem";
import { useActions, useStore } from "@/store/store";
import type { Alert } from "@/types";

/* Aperçu des commentaires (G6) : lecture seule ; écrire et répondre arrivent en phase 7 */
export interface CommentsPreviewProps {
  alert: Alert;
}

export function CommentsPreview({ alert }: CommentsPreviewProps) {
  const { state } = useStore();
  const { toast } = useActions();
  const list = (state.comments[alert.id] || []).filter((c) => !c.parentId).sort((a, b) => a.ageMin - b.ageMin).slice(0, 2);
  const n = alert.commentsCount;
  return (
    <section className="detail-section" aria-labelledby="dt-comments">
      <h2 id="dt-comments">Commentaires{n ? <small> · {n}</small> : null}</h2>
      {n === 0 ? <p className="detail-hint">Aucun commentaire pour le moment. <b>Soyez le premier à réagir.</b></p> : null}
      {list.map((c) => <CommentItem key={c.id} comment={c} readOnly />)}
      {n ? <Button variant="secondary" block onClick={() => toast("La discussion complète arrive avec les commentaires (phase 7).", { tone: "info" })}>Voir {n > 1 ? `les ${n} commentaires` : "le commentaire"}</Button> : null}
    </section>
  );
}
