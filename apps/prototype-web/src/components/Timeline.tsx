import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";

export interface TimelineProps {
  steps: any;
  currentIndex: any;
}

export function Timeline({ steps, currentIndex }: TimelineProps) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => {
        const done = i < currentIndex || (i === currentIndex && s.final);
        const current = i === currentIndex && !s.final;
        return (
          <li key={s.id} className={cx(done && "done", current && "current")} aria-current={current ? "step" : undefined}>
            <span className="dot">{done ? <Icon name="check" /> : current ? <Icon name="arrows-clockwise" /> : null}</span>
            <span><b>{s.label}</b>{s.detail ? <small>{s.detail}</small> : null}</span>
          </li>
        );
      })}
    </ol>
  );
}
