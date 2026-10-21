import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { commentTime } from "@/components/helpers";
import { useNow } from "@/store/store";
import { cx, fmtRelative, publicAuthor } from "@/utils/index";
import type { Comment } from "@/types";

export interface CommentItemProps {
  comment: Comment;
  reply?: any;
  readOnly?: any;
  mine?: boolean;
  isAuthor?: boolean;
  highlight?: boolean;
  onReply?: () => void;
  onMenu?: () => void;
}

export function CommentItem({ comment, reply, readOnly, mine, isAuthor, highlight, onReply, onMenu }: CommentItemProps) {
  const now = useNow();
  if (comment.status === "deleted" || comment.status === "moderated") {
    return (
      <div className={cx("comment-line", reply && "reply")} role="note">
        <Icon name={comment.status === "moderated" ? "prohibit" : "trash"} />
        {comment.status === "moderated" ? "Ce commentaire a été masqué par la modération." : "Commentaire supprimé par son auteur."}
      </div>
    );
  }
  const author = publicAuthor(comment);
  const when = fmtRelative(now - commentTime(comment));
  return (
    <article className={cx("comment", reply && "reply", mine && "is-mine", highlight && "is-new")} aria-label={`Commentaire de ${author.name}${mine ? " (vous)" : ""}, ${when}`}>
      <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
      <div>
        <div className="who">{author.name}{mine ? " (vous)" : ""}{isAuthor ? <span className="comment-badge">Auteur</span> : null} <time>{when}</time></div>
        <p>{comment.body}</p>
        {readOnly ? null : (
          <div className="acts">
            <button type="button" onClick={onReply}><Icon name="arrow-bend-up-left" className="ph-sm" />Répondre</button>
            <IconButton icon="dots-three" label={`Options du commentaire de ${author.name}`} className="flat comment-more" onClick={onMenu} />
          </div>
        )}
      </div>
    </article>
  );
}
