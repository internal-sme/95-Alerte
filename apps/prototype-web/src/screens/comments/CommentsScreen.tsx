import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { CommentItem } from "@/components/CommentItem";
import { Icon } from "@/components/Icon";
import { Marker } from "@/components/Marker";
import { Skeleton } from "@/components/Skeleton";
import { Spot } from "@/components/Spot";
import { commentTime } from "@/components/helpers";
import { CATEGORY_BY_ID, ME_ID } from "@/data/seed";
import { ScreenHeader } from "@/navigation/ScreenHeader";
import { Composer } from "@/screens/comments/Composer";
import { COMMENT_PAGE, threadOf } from "@/screens/comments/comments";
import { DetailState } from "@/screens/detail/DetailState";
import { useActions, useNow, useStore } from "@/store/store";
import { alertLifecycle, displayPlace, motionReduced } from "@/utils/index";

/* 7.1 : l'écran Commentaires (I2) — règle en tête (NYT), réponses d'un niveau repliées au-delà de deux (I3), champ en bas */
export interface CommentsScreenProps {
  id?: string;
  compose?: boolean;
  replyTo?: string;
  highlight?: string;
  draftText?: string;
  submitted?: boolean;
  view?: "loading" | "error" | "ready";
}

export function CommentsScreen({ id, compose, replyTo: replyToId, highlight: highlightId, draftText, submitted, view }: CommentsScreenProps) {
  const { state } = useStore();
  const { openSheet, push } = useActions();
  const now = useNow();
  const alert = state.alerts.find((a) => a.id === id);
  const [phase, setPhase] = useState(view || "loading");
  const [attempt, setAttempt] = useState(0);
  const [limit, setLimit] = useState(COMMENT_PAGE);
  const [open, setOpen] = useState({});
  const [replyTo, setReplyTo] = useState(() => (replyToId && alert ? threadOf(state, alert).find((c) => c.id === replyToId) || null : null));
  const [highlight, setHighlight] = useState(highlightId || null);
  const body = useRef(null);
  useEffect(() => {
    if (view) return undefined;
    setPhase("loading");
    const t = setTimeout(() => setPhase(state.demo.networkError ? "error" : "ready"), motionReduced() ? 0 : 450);
    return () => clearTimeout(t);
  }, [attempt]);
  useEffect(() => { if (compose && phase === "ready") document.getElementById("cm-text")?.focus(); }, [phase]);
  useEffect(() => {
    if (!highlight || phase !== "ready") return undefined;
    const el = body.current?.querySelector(".comment.is-new");
    el?.scrollIntoView({ block: "nearest", behavior: motionReduced() ? "auto" : "smooth" });
    const t = setTimeout(() => setHighlight(null), 2400);
    return () => clearTimeout(t);
  }, [highlight, phase]);
  if (!alert) return <DetailState icon="link-break" title="Cette alerte n'est plus disponible">Elle a peut-être été supprimée par son auteur.</DetailState>;
  const list = threadOf(state, alert);
  const roots = list.filter((c) => !c.parentId).sort((a, b) => commentTime(a) - commentTime(b));
  const repliesOf = (rid) => list.filter((c) => c.parentId === rid).sort((a, b) => commentTime(a) - commentTime(b));
  const shown = roots.slice(0, limit);
  const user = state.session.user;
  const expired = alertLifecycle(alert, now) === "expiree";
  const isAuthor = (c) => !alert.anonymous && !c.anonymous && c.authorId === alert.authorId; // I1 : jamais sur une alerte anonyme
  const item = (c, reply) => (
    <CommentItem key={c.id} comment={c} reply={reply} mine={!!user && c.authorId === ME_ID} isAuthor={isAuthor(c)} highlight={c.id === highlight}
      readOnly={expired} onReply={() => (user ? setReplyTo(c) : openSheet("sign-in", { reason: "comment" }))}
      onMenu={() => openSheet("comment-menu", { alertId: alert.id, commentId: c.id, onReply: () => (user ? setReplyTo(c) : openSheet("sign-in", { reason: "comment" })) })} />
  );
  let footer;
  if (expired) footer = <div className="composer is-note"><Icon name="timer" />Cette alerte a expiré : les commentaires sont fermés.</div>;
  else if (!user) footer = <div className="composer is-note"><Button block variant="secondary" icon="sign-in" onClick={() => openSheet("sign-in", { reason: "comment" })}>Se connecter pour commenter</Button></div>;
  else if (state.demo.offline) footer = <div className="composer is-note"><Icon name="wifi-slash" />Commenter nécessite une connexion.</div>;
  else footer = <Composer key={replyTo ? replyTo.id : "root"} alert={alert} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} draftText={draftText} submitted={submitted}
    onPosted={(cid) => { setReplyTo(null); setLimit(Infinity); setHighlight(cid); }} />;
  return (
    <div className="screen comments-screen">
      <ScreenHeader title={`Commentaires${alert.commentsCount ? ` · ${alert.commentsCount}` : ""}`} />
      <div className="comments-body" ref={body}>
        <button type="button" className="comments-context" onClick={() => push("alert", { id: alert.id })}>
          <Marker family={CATEGORY_BY_ID[alert.categoryId].family} icon={CATEGORY_BY_ID[alert.categoryId].icon} />
          <span><b>{alert.title}</b><small>{displayPlace(alert)}</small></span>
        </button>
        <p className="comments-rules"><Icon name="shield-check" /><span>Restez courtois et utile. Les commentaires sont modérés.<button type="button" className="btn btn-tertiary btn-inline" onClick={() => openSheet("community-rules", {})}>Règles de la communauté</button></span></p>
        {phase === "loading" ? (
          <div className="comments-list" aria-busy="true" aria-label="Chargement des commentaires">
            {[0, 1, 2].map((i) => <div key={i} className="comment"><Skeleton width={36} height={36} radius="50%" /><div style={{ display: "grid", gap: 6 }}><Skeleton height={12} width="40%" /><Skeleton height={14} width="90%" /></div></div>)}
          </div>
        ) : phase === "error" ? (
          <div className="comments-empty" role="alert">
            <Spot icon="cloud-slash" tone="neutral" />
            <h2>Impossible de charger les commentaires.</h2>
            <p>Vérifiez votre connexion, puis réessayez.</p>
            <Button variant="secondary" icon="arrows-clockwise" onClick={() => setAttempt((n) => n + 1)}>Réessayer</Button>
          </div>
        ) : roots.length === 0 ? (
          <div className="comments-empty">
            <Spot icon="chat-circle-dots" tone="neutral" />
            <h2>Aucun commentaire pour le moment.</h2>
            <p><b>Soyez le premier à réagir.</b></p>
          </div>
        ) : (
          <div className="comments-list">
            {shown.map((c) => {
              const replies = repliesOf(c.id);
              const visible = open[c.id] ? replies : replies.slice(0, 2);
              return (
                <div key={c.id} className="comment-thread">
                  {item(c, false)}
                  {visible.map((r) => item(r, true))}
                  {replies.length > 2 && !open[c.id] ? (
                    <button type="button" className="btn btn-tertiary btn-inline comment-more-replies" onClick={() => setOpen({ ...open, [c.id]: true })}>
                      Voir {replies.length - 2 > 1 ? `${replies.length - 2} réponses de plus` : "1 réponse de plus"}
                    </button>
                  ) : null}
                </div>
              );
            })}
            {roots.length > limit ? <Button variant="secondary" block onClick={() => setLimit(limit + COMMENT_PAGE)}>Voir plus de commentaires ({roots.length - limit})</Button> : null}
          </div>
        )}
      </div>
      {phase === "error" ? null : footer}
    </div>
  );
}
