import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { ExpirationCounter } from "@/components/ExpirationCounter";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Marker } from "@/components/Marker";
import { TypeBadge } from "@/components/TypeBadge";
import { VoteBar } from "@/components/VoteBar";
import { alertPhotos } from "@/data/photos";
import { CATEGORY_BY_ID, ME_ID } from "@/data/seed";
import { alertStatus } from "@/map/geo";
import { AlertMiniMap } from "@/screens/detail/AlertMiniMap";
import { CommentsPreview } from "@/screens/detail/CommentsPreview";
import { DetailSkeleton } from "@/screens/detail/DetailSkeleton";
import { DetailState } from "@/screens/detail/DetailState";
import { EmergencyNote } from "@/screens/detail/EmergencyNote";
import { FollowButton } from "@/screens/detail/FollowButton";
import { ServiceCard } from "@/screens/detail/ServiceCard";
import { isEmergencyCategory } from "@/screens/detail/detail";
import { useActions, useNow, useStore } from "@/store/store";
import { alertLifecycle, cx, displayPlace, fmtClock, fmtDistance, fmtRelative, haversineKm, publicAuthor } from "@/utils/index";

export interface AlertDetailProps {
  id?: string;
  demo?: any;
}

export function AlertDetail({ id, demo }: AlertDetailProps) {
  const { state, dispatch } = useStore();
  const { pop, push, openSheet } = useActions();
  const now = useNow();
  const alert = state.alerts.find((a) => a.id === id);
  const backToMap = () => dispatch({ type: "SET_TAB", tab: "map" });
  if (demo === "loading") return <DetailSkeleton />;
  if (demo === "error" || state.demo.networkError) {
    return (
      <DetailState icon="cloud-slash" title="Impossible de charger cette alerte." actions={<div className="sheet-actions"><Button block icon="arrows-clockwise" onClick={() => dispatch({ type: "SET_DEMO", key: "networkError", value: false })}>Réessayer</Button><Button variant="secondary" block onClick={pop}>Retour</Button></div>}>
        Vérifiez votre connexion, puis réessayez.
      </DetailState>
    );
  }
  if (!alert || alert.status === "supprimee" || alert.status === "moderee") {
    const reason = !alert ? "Le lien est peut-être incorrect, ou l'alerte a été retirée."
      : alert.status === "moderee" ? "Elle a été retirée par la modération : elle ne respectait pas les règles de la communauté."
      : alert.authorId === ME_ID && state.session.user ? "Vous l'avez supprimée. Le service déjà saisi en a été informé."
      : "Son auteur l'a supprimée.";
    return (
      <DetailState icon={alert?.status === "moderee" ? "eye-slash" : alert ? "trash" : "link-break"} title="Cette alerte n'est plus disponible" actions={<Button block onClick={backToMap}>Retour à la carte</Button>}>{reason}</DetailState>
    );
  }
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const life = alertLifecycle(alert, now);
  const expired = life === "expiree";
  const pos = state.session.position;
  const dist = pos.source !== "default" ? ` · ${fmtDistance(haversineKm(pos, alert))}` : "";
  const author = publicAuthor(alert);
  const mine = state.session.user && alert.authorId === ME_ID && !alert.anonymous;
  const photos = alertPhotos(alert);
  const dups = alert.duplicateGroup ? state.alerts.filter((a) => a.duplicateGroup === alert.duplicateGroup && a.id !== alert.id && a.status === "active" && a.expiresAt > now) : [];
  const urgent = cat.priority === "critique";
  return (
    <div className={cx("screen", "detail-screen", `fam-${cat.family}`, expired && "is-expired")}>
      <div className="detail-hero">
        {photos.length ? (
          <button type="button" className="detail-photo" onClick={() => push("photo-viewer", { id: alert.id, index: 0 })} aria-label={`Agrandir la photo${photos.length > 1 ? ` 1 sur ${photos.length}` : ""} : ${photos[0].alt}`}>
            <img src={photos[0].src} alt="" />
            {photos.length > 1 ? <span className="photo-count"><Icon name="images" />1 / {photos.length}</span> : null}
          </button>
        ) : <AlertMiniMap alert={alert} />}
        <div className="detail-top">
          <IconButton icon="caret-left" label="Retour" onClick={pop} />
          <IconButton icon="dots-three" label="Plus d'actions" onClick={() => openSheet("alert-menu", { id: alert.id }, "half")} />
        </div>
      </div>
      <article className="detail-body" aria-labelledby="dt-title">
        <div className="detail-eyebrow">
          <span style={{ viewTransitionName: "alert-type" }}><TypeBadge category={cat} /></span>
          {urgent ? <span className="ac-urgent">Urgent</span> : null}
          {alert.areaKm ? <span className="badge badge-area"><Icon name="polygon" />Zone</span> : null}
          {alertStatus(alert, now, true)}
        </div>
        <h1 id="dt-title" className="detail-title" style={{ viewTransitionName: "alert-title" }}>{alert.title}</h1>
        <ul className="detail-meta">
          <li><Icon name="map-pin" className="ph-sm" /><span>{displayPlace(alert)}{dist}</span></li>
          <li><Icon name="clock" className="ph-sm" /><span>Publiée {fmtRelative(now - alert.createdAt)} · {fmtClock(alert.createdAt)}</span></li>
          {alert.areaKm ? <li><Icon name="polygon" className="ph-sm" /><span>Zone d'environ {fmtDistance(alert.areaKm * 2)} de large</span></li> : null}
        </ul>
        {expired ? null : <ExpirationCounter alert={alert} />}
        {expired ? <Banner tone="offline" icon="clock" title="Cette alerte a expiré.">Elle n'est plus visible sur la carte ni dans la liste. Les votes sont fermés.</Banner> : null}
        {isEmergencyCategory(cat) && !expired ? <EmergencyNote onClick={() => push("emergency", { id: alert.id })} /> : null}
        {dups.length ? (
          <div className="dup-box">
            <Banner tone="info" icon="copy">Ces alertes semblent concerner le même événement.</Banner>
            {dups.map((d) => { const dc = CATEGORY_BY_ID[d.categoryId]; return (
              <button key={d.id} type="button" className="search-row" onClick={() => push("alert", { id: d.id })}>
                <Marker family={dc.family} icon={dc.icon} />
                <span className="sr-text"><span className="sr-label">{d.title}</span><small>{fmtRelative(now - d.createdAt)} · {fmtDistance(haversineKm(alert, d))} de celle-ci</small></span>
                <Icon name="caret-right" className="ph-sm" />
              </button>
            ); })}
          </div>
        ) : null}
        <p className="detail-desc">{alert.description}</p>
        {photos.length > 1 ? (
          <div className="detail-thumbs">
            {photos.map((ph, i) => <button key={ph.id} type="button" onClick={() => push("photo-viewer", { id: alert.id, index: i })} aria-label={`Agrandir la photo ${i + 1} sur ${photos.length} : ${ph.alt}`}><img src={ph.src} alt="" /></button>)}
          </div>
        ) : null}
        <p className="detail-by">
          <span className={cx("avatar", author.anonymous && "anon")} aria-hidden="true">{author.anonymous ? <Icon name="detective" /> : author.initials}</span>
          <span>Signalé par <b>{author.name}</b>{mine ? " (vous)" : ""}</span>
        </p>
        <section className="detail-section" aria-labelledby="dt-vote">
          <h2 id="dt-vote">Ce signalement vous semble-t-il exact ?</h2>
          <VoteBar alert={alert} closed={expired} />
          <p className="detail-hint">{expired ? "Les votes sont fermés : l'alerte a expiré." : state.demo.offline ? "Vote impossible hors connexion." : "Un seul avis par alerte, modifiable à tout moment."}</p>
        </section>
        <div className="detail-actions">
          <FollowButton alert={alert} />
          <Button variant="secondary" icon="share-network" onClick={() => openSheet("share", { id: alert.id })}>Partager</Button>
        </div>
        <ServiceCard alert={alert} onTimeline={() => openSheet("alert-timeline", { id: alert.id })} />
        <CommentsPreview alert={alert} />
      </article>
    </div>
  );
}
