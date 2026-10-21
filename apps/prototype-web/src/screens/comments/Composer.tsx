import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { ME_ID } from "@/data/seed";
import { COMMENT_MAX } from "@/screens/comments/comments";
import { PERSONAL_DATA } from "@/screens/report/report";
import { useActions, useNow, useStore } from "@/store/store";
import { motionReduced, publicAuthor, publicName } from "@/utils/index";
import type { Alert, Comment } from "@/types";

/* 7.2 : champ collé en bas (Nextdoor), identité dans le champ (Glassdoor), « En réponse à » (Coursera) */
export interface ComposerProps {
  alert: Alert;
  replyTo: Comment | null;
  onCancelReply: () => void;
  onPosted: (commentId: string) => void;
  draftText?: string;
  submitted: boolean;
}

export function Composer({ alert, replyTo, onCancelReply, onPosted, draftText = "", submitted }: ComposerProps) {
  const { state, dispatch } = useStore();
  const { openSheet, toast } = useActions();
  const now = useNow();
  const user = state.session.user;
  const [text, setText] = useState(draftText);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const field = useRef(null);
  const anonymous = (state.prefs.lastCommentIdentity || "profile") === "anonymous";
  const name = anonymous ? "Citoyen anonyme" : publicName(user);
  const grow = () => { const el = field.current; if (!el) return; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 112)}px`; };
  useLayoutEffect(grow, [text]);
  useEffect(() => { if (replyTo) field.current?.focus(); }, [replyTo]);
  const check = (body) => {
    if (PERSONAL_DATA.test(body)) return "Retirez le numéro de téléphone, la plaque ou l'adresse e-mail : ces informations ne doivent pas être publiées.";
    return null;
  };
  useEffect(() => { if (submitted) setError(check(text)); }, []);
  const submit = () => {
    const body = text.trim();
    if (!body || sending) return;
    const err = check(body);
    if (err) { setError(err); field.current?.focus(); return; }
    if (state.demo.networkError) { setError("Impossible de publier votre commentaire. Vérifiez votre connexion."); return; }
    setSending(true);
    const parentId = replyTo ? replyTo.parentId || replyTo.id : undefined;
    setTimeout(() => {
      const id = `k${Date.now().toString(36)}`;
      dispatch({ type: "ADD_COMMENT", alertId: alert.id, comment: { id, authorId: ME_ID, anonymous, body, createdAt: now, parentId } });
      setSending(false); setText(""); setError(null);
      toast("Commentaire publié.");
      onPosted(id);
    }, motionReduced() ? 0 : 350);
  };
  const replyName = replyTo ? publicAuthor(replyTo).name : null;
  return (
    <div className="composer">
      {replyTo ? (
        <p className="composer-reply"><Icon name="arrow-bend-up-left" className="ph-sm" /><span>En réponse à <b>{replyName}</b></span>
          <IconButton icon="x" label="Ne plus répondre" className="flat" onClick={onCancelReply} /></p>
      ) : null}
      <div className="composer-row">
        <textarea ref={field} id="cm-text" className="input" rows={1} maxLength={COMMENT_MAX} value={text} disabled={sending}
          placeholder={replyTo ? "Votre réponse…" : "Ajouter un commentaire…"} aria-label={replyTo ? `Votre réponse à ${replyName}` : "Votre commentaire"}
          aria-invalid={error ? true : undefined} aria-describedby={error ? "cm-err" : undefined}
          onChange={(e) => { setText(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }} />
        <IconButton icon="arrow-up" label={replyTo ? "Publier la réponse" : "Publier le commentaire"} className="composer-send" disabled={!text.trim() || sending} onClick={submit} />
      </div>
      {error ? <span className="err" id="cm-err" role="alert"><Icon name="warning-fill" className="ph-sm" />{error}</span> : null}
      <div className="composer-meta">
        <button type="button" className="composer-identity" onClick={() => openSheet("comment-identity", {})}>Commenter en tant que <b>{name}</b><Icon name="caret-down" className="ph-sm" /></button>
        {text.length > 400 ? <span aria-live="polite">{text.length}/{COMMENT_MAX}</span> : null}
      </div>
    </div>
  );
}
