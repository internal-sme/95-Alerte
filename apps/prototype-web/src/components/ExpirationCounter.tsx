import { Icon } from "@/components/Icon";
import { ALERT_TTL, HOUR, MIN } from "@/data/seed";
import { useNow } from "@/store/store";
import { cx, fmtRemaining } from "@/utils/index";
import type { Alert } from "@/types";

export interface ExpirationCounterProps {
  alert: Alert;
  compact?: any;
}

export function ExpirationCounter({ alert, compact }: ExpirationCounterProps) {
  const now = useNow();
  const left = alert.expiresAt - now;
  const state = left <= 0 ? "over" : left <= HOUR ? "soon" : "ok";
  const pct = Math.min(100, Math.max(0, (left / ALERT_TTL) * 100));
  const text = state === "over" ? "Cette alerte a expiré." : state === "soon" ? `Expire dans ${fmtRemaining(left)}` : `Visible encore ${fmtRemaining(left)}`;
  if (compact) {
    const short = state === "over" ? "Expirée" : left >= HOUR ? `${Math.floor(left / HOUR)} h` : `${Math.ceil(left / MIN)} min`;
    return <span className="exp" aria-label={text}><Icon name="timer" className="ph-sm" />{short}</span>;
  }
  return (
    <div className={cx("expiry", state === "soon" && "soon", state === "over" && "over")}>
      <span className="lbl"><Icon name={state === "over" ? "clock" : "timer"} className="ph-sm" />{text}</span>
      <div className="bar" aria-hidden="true"><i style={{ width: `${state === "over" ? 100 : pct}%` }} /></div>
    </div>
  );
}
