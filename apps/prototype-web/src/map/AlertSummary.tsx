import { useRef } from "react";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { TypeBadge } from "@/components/TypeBadge";
import { VoteBar } from "@/components/VoteBar";
import { CATEGORY_BY_ID } from "@/data/seed";
import { alertStatus } from "@/map/geo";
import { useActions, useNow, useStore } from "@/store/store";
import { cx, displayPlace, fmtDistance, fmtRelative, haversineKm, publicAuthor } from "@/utils/index";
import type { Alert } from "@/types";

/* Fiche de sélection (tâche 3.7) : quoi, où, depuis quand, par qui, combien ; balayage vers l'alerte voisine */
export interface AlertSummaryProps {
  alert: Alert;
  onClose: (...args: any[]) => any;
  index: any;
  total: any;
  onStep: (...args: any[]) => any;
}

export function AlertSummary({ alert, onClose, index, total, onStep }: AlertSummaryProps) {
  const { state } = useStore();
  const { push } = useActions();
  const shared = state.nav.stack.length === 0; // smart animate vers la fiche : un seul élément porte chaque nom
  const now = useNow();
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const pos = state.session.position;
  const dist = pos.source !== "default" ? ` · ${fmtDistance(haversineKm(pos, alert))}` : "";
  const author = publicAuthor(alert);
  const duplicates = alert.duplicateGroup ? state.alerts.filter((a) => a.duplicateGroup === alert.duplicateGroup && a.status === "active").length : 1;
  const swipe = useRef(null);
  const onPointerDown = (e) => { if (!e.target.closest("button")) swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || total < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) onStep(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (e) => {
    if (total < 2 || e.target.closest(".vote")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); onStep(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1); }
  };
  return (
    <div className={cx("summary", `fam-${cat.family}`)} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onKeyDown={onKeyDown}>
      <div className="summary-head">
        <span style={shared ? { viewTransitionName: "alert-type" } : undefined}><TypeBadge category={cat} /></span>
        {alert.areaKm ? <span className="badge badge-area"><Icon name="polygon" />Zone</span> : null}
        <span className="demo-note">{fmtRelative(now - alert.createdAt)}</span>
        <IconButton icon="x" label="Fermer la fiche" className="flat" onClick={onClose} />
      </div>
      <h3 className="summary-title" style={shared ? { viewTransitionName: "alert-title" } : undefined}>{alert.title}</h3>
      <p className="summary-meta"><Icon name="map-pin" className="ph-sm" /><span>{displayPlace(alert)}{dist}</span></p>
      <div className="summary-by">
        <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
        <span>Signalé par <b>{author.name}</b></span>
        {alertStatus(alert, now)}
      </div>
      {alert.areaKm ? <p className="summary-meta"><Icon name="polygon" className="ph-sm" />Zone d'environ {fmtDistance(alert.areaKm * 2)} de large</p> : null}
      {duplicates > 1 ? <Banner tone="info" icon="copy">{duplicates} signalements semblent concerner le même événement.</Banner> : null}
      <div className="summary-actions">
        <VoteBar alert={alert} compact />
        <span className="summary-comments"><Icon name="chat-circle" />{alert.commentsCount} commentaire{alert.commentsCount > 1 ? "s" : ""}</span>
      </div>
      <Button block onClick={() => push("alert", { id: alert.id })}>Voir le détail</Button>
      {total > 1 ? (
        <div className="summary-pager">
          <IconButton icon="caret-left" label="Alerte précédente" className="flat" onClick={() => onStep(-1)} />
          <span aria-live="polite">{index + 1} sur {total} · balayez pour l'alerte voisine</span>
          <IconButton icon="caret-right" label="Alerte suivante" className="flat" onClick={() => onStep(1)} />
        </div>
      ) : null}
    </div>
  );
}
