import { Fragment } from "react";
import { StatusTimeline } from "@/screens/detail/StatusTimeline";
import { fmtDelay } from "@/screens/detail/detail";
import { useStore } from "@/store/store";
import { routeAlert } from "@/utils/index";

export interface TimelineSheetProps {
  id?: string;
}

export function TimelineSheet({ id }: TimelineSheetProps) {
  const { state } = useStore();
  const alert = state.alerts.find((a) => a.id === id);
  if (!alert) return null;
  const route = routeAlert(alert);
  return (
    <Fragment>
      <StatusTimeline alert={alert} />
      {route.delayHours ? <p className="demo-note">Délai habituel indiqué par le service : {fmtDelay(route.delayHours)}. Il peut varier selon la situation.</p> : null}
      <p className="demo-note">Le service met à jour les étapes. Suivez l'alerte pour être prévenu de chaque changement.</p>
    </Fragment>
  );
}
