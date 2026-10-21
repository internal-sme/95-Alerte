import { Icon } from "@/components/Icon";
import { TRANSMISSION_STEPS } from "@/data/seed";
import { stepTimes } from "@/screens/detail/detail";
import { cx, fmtClock } from "@/utils/index";
import type { Alert } from "@/types";

/* 5.6 : timeline Envoyé → Transmis → Pris en compte → En traitement → Traité → Clôturé (feuille) */
export interface StatusTimelineProps {
  alert: Alert;
}

export function StatusTimeline({ alert }: StatusTimelineProps) {
  const idx = Math.max(0, TRANSMISSION_STEPS.findIndex((st) => st.id === alert.transmission));
  const times = stepTimes(alert);
  return (
    <ol className="timeline status-timeline">
      {TRANSMISSION_STEPS.map((st, i) => (
        <li key={st.id} className={cx(i <= idx && "done", i === idx && "now")} aria-current={i === idx ? "step" : undefined}>
          <span className="dot">{i <= idx ? <Icon name="check" /> : null}</span>
          <span className="tl-text"><b>{st.label}</b>{i === idx ? <small>Étape actuelle</small> : i > idx ? <small>À venir</small> : null}</span>
          {times[i] ? <time>{fmtClock(times[i])}</time> : <span />}
        </li>
      ))}
    </ol>
  );
}
