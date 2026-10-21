import { Icon } from "@/components/Icon";
import { Marker } from "@/components/Marker";
import { alertPhotos } from "@/data/photos";
import { CATEGORY_BY_ID, COMMUNE_BY_ID } from "@/data/seed";
import { alertStatus } from "@/map/geo";
import { useNow, useStore } from "@/store/store";
import { cx, fmtDistance, fmtRelative, haversineKm } from "@/utils/index";
import type { Alert } from "@/types";

export interface AlertCardProps {
  alert: Alert;
  onOpen?: (...args: any[]) => any;
  showStatus?: boolean;
}

export function AlertCard({ alert, onOpen, showStatus }: AlertCardProps) {
  const { state } = useStore();
  const now = useNow();
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const pos = state.session.position;
  const dist = pos ? fmtDistance(haversineKm(pos, alert)) : null;
  const commune = COMMUNE_BY_ID[alert.communeId].name;
  const status = alertStatus(alert, now, showStatus);
  const ago = fmtRelative(now - alert.createdAt);
  const urgent = cat.priority === "critique";
  const aria = `${cat.label}${urgent ? ", Urgent" : ""}. ${alert.title}. ${commune}${dist ? `, ${dist}` : ""}, ${ago}. ${alert.votesUp} confirmations, ${alert.commentsCount} commentaires.`;
  return (
    <button type="button" className={cx("alert-card", `fam-${cat.family}`)} onClick={onOpen} aria-label={aria}>
      <Marker family={cat.family} icon={cat.icon} />
      <span className="ac-main" aria-hidden="true">
        <span className="ac-eyebrow"><b>{cat.label}</b>{urgent ? <span className="ac-urgent">Urgent</span> : null}<span>{ago}</span></span>
        <h4>{alert.title}</h4>
        <span className="meta"><Icon name="map-pin" className="ph-sm" /><span>{commune}{dist ? ` · ${dist}` : ""}</span></span>
      </span>
      {alert.hasPhoto ? <span className="ac-photo" aria-hidden="true">{alertPhotos(alert)[0] ? <img src={alertPhotos(alert)[0].src} alt="" /> : <Icon name="image" />}</span> : null}
      <span className="ac-foot" aria-hidden="true">
        <span className="stats">
          <span><Icon name="arrow-fat-up" />{alert.votesUp}</span>
          <span><Icon name="arrow-fat-down" />{alert.votesDown}</span>
          <span><Icon name="chat-circle" />{alert.commentsCount}</span>
        </span>
        {status}
      </span>
    </button>
  );
}
