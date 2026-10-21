import type { ReactNode } from "react";
export interface FeedSectionProps {
  title: string;
  count: any;
  onAll: (...args: any[]) => any;
  children: ReactNode;
}

export function FeedSection({ title, count, onAll, children }: FeedSectionProps) {
  return (
    <section className="feed-section" aria-label={title}>
      <div className="feed-head">
        <h2>{title}{count != null ? <small> · {count}</small> : null}</h2>
        {onAll ? <button type="button" className="btn btn-tertiary" onClick={onAll}>Tout voir</button> : null}
      </div>
      {children}
    </section>
  );
}
