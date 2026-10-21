import { Icon } from "@/components/Icon";
import { BOOT_TIME, MIN } from "@/data/seed";
import { useNow } from "@/store/store";
import { cx, fmtRelative, publicAuthor } from "@/utils/index";
import type { Comment } from "@/types";

export interface CommentItemProps {
  comment: Comment;
  reply?: any;
  readOnly?: boolean;
}

export function CommentItem({ comment, reply, readOnly }: CommentItemProps) {
  const now = useNow();
  const author = publicAuthor(comment);
  return (
    <div className={cx("comment", reply && "reply")}>
      <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
      <div>
        <div className="who">{author.name} <time>{fmtRelative(now - (BOOT_TIME - comment.ageMin * MIN))}</time></div>
        <p>{comment.body}</p>
        {readOnly ? null : <div className="acts"><button type="button">Répondre</button><button type="button">Signaler</button></div>}
      </div>
    </div>
  );
}
