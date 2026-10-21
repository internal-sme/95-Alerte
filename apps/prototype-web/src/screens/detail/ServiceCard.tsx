import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { TRANSMISSION_STEPS } from "@/data/seed";
import { StatusProgress } from "@/screens/detail/StatusProgress";
import { fmtDelay, stepTimes } from "@/screens/detail/detail";
import { fmtClock, routeAlert } from "@/utils/index";
import type { Alert } from "@/types";

export interface ServiceCardProps {
  alert: Alert;
  onTimeline: (...args: any[]) => any;
}

export function ServiceCard({ alert, onTimeline }: ServiceCardProps) {
  const route = routeAlert(alert);
  const idx = Math.max(0, TRANSMISSION_STEPS.findIndex((st) => st.id === alert.transmission));
  const step = TRANSMISSION_STEPS[idx];
  const at = stepTimes(alert)[idx];
  return (
    <section className="service-card" aria-labelledby="svc-title">
      <div className="svc-head">
        <span className="svc-ico" aria-hidden="true"><Icon name="buildings" /></span>
        <div><h2 id="svc-title">{idx === 0 ? "Signalement envoyé" : "Transmis au service compétent"}</h2><p>{route.name}</p></div>
      </div>
      <StatusProgress index={idx} total={TRANSMISSION_STEPS.length} />
      <p className="svc-step"><b>{step.label}</b> · étape {idx + 1} sur {TRANSMISSION_STEPS.length}{at ? ` · ${fmtClock(at)}` : ""}</p>
      {route.delayHours ? <p className="svc-delay">Délai habituel indiqué par le service : {fmtDelay(route.delayHours)}</p> : null}
      <Button variant="tertiary" className="btn-inline" onClick={onTimeline}>Voir le suivi du traitement</Button>
    </section>
  );
}
