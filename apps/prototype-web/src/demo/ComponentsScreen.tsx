import { useState } from "react";
import { AlertCard } from "@/components/AlertCard";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { CategoryTile } from "@/components/CategoryTile";
import { Chip } from "@/components/Chip";
import { ClusterMarker } from "@/components/ClusterMarker";
import { CommentItem } from "@/components/CommentItem";
import { EmptyState } from "@/components/EmptyState";
import { ExpirationCounter } from "@/components/ExpirationCounter";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { ListItem } from "@/components/ListItem";
import { Marker } from "@/components/Marker";
import { Pill } from "@/components/Pill";
import { RadioCard } from "@/components/RadioCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Stepper } from "@/components/Stepper";
import { Switch } from "@/components/Switch";
import { Timeline } from "@/components/Timeline";
import { Tooltip } from "@/components/Tooltip";
import { TypeBadge } from "@/components/TypeBadge";
import { VoteBar } from "@/components/VoteBar";
import { CATEGORY_BY_ID, SEED_COMMENTS, TRANSMISSION_STEPS, USERS } from "@/data/seed";
import { ScreenHeader } from "@/navigation/ScreenHeader";
import { useActions, useNow, useStore } from "@/store/store";
import { fmtRelative, publicName, routeAlert } from "@/utils/index";

export function ComponentsScreen() {
  const { state } = useStore();
  const { toast, confirm, openSheet, push } = useActions();
  const now = useNow();
  const [chips, setChips] = useState({ culture: true });
  const [seg, setSeg] = useState("map");
  const [pub, setPub] = useState("profile");
  const [sw, setSw] = useState(true);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("incendie");
  const [loading, setLoading] = useState(false);
  const sample = state.alerts.find((a) => a.id === "a1");
  const sampleTreated = state.alerts.find((a) => a.id === "a25");
  const route = routeAlert(sampleTreated);
  const stepIndex = TRANSMISSION_STEPS.findIndex((s) => s.id === sampleTreated.transmission);
  return (
    <div className="screen">
      <ScreenHeader title="Composants" />
      <div className="screen-pad">
        <p className="demo-note" style={{ margin: 0 }}>Bibliothèque interne du prototype : composants de base branchés au store. Référence visuelle complète : docs/design-system/index.html.</p>

        <section className="lib-section"><p className="section-label">Boutons</p>
          <Button>Publier l'alerte</Button>
          <Button variant="secondary" icon="map-pin">Choisir sur la carte</Button>
          <div className="lib-row"><Button variant="ghost">Plus tard</Button><Button variant="destructive" icon="trash-simple" onClick={() => confirm({ title: "Supprimer cette alerte ?", body: "Elle ne sera plus visible par les utilisateurs.", confirmLabel: "Supprimer", destructive: true, onConfirm: () => toast("Alerte supprimée.") })}>Supprimer</Button></div>
          <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast("Votre alerte a été publiée."); }, 1200); }}>{loading ? "Publication…" : "Simuler une publication"}</Button>
          <Button disabled>Confirmer cette position</Button>
        </section>

        <section className="lib-section"><p className="section-label">Champs</p>
          <Field id="lib-title" label="Titre" placeholder="Arbre tombé sur la chaussée" max={80} help="Court et factuel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Field id="lib-code" label="Code reçu par SMS" defaultValue="48213" error="Code incorrect. Vérifiez le SMS ou demandez un nouveau code." />
        </section>

        <section className="lib-section"><p className="section-label">Chips · Segmented control</p>
          <div className="lib-row">{["Culture", "Sport", "Propreté", "Voirie"].map((c) => { const k = c.toLowerCase(); return <Chip key={k} selected={chips[k]} onClick={() => setChips({ ...chips, [k]: !chips[k] })}>{c}</Chip>; })}</div>
          <SegmentedControl label="Vue" value={seg} onChange={setSeg} options={[{ value: "map", label: "Carte", icon: "map-trifold" }, { value: "list", label: "Liste", icon: "list-bullets" }]} />
        </section>

        <section className="lib-section"><p className="section-label">RadioCard + aperçu public</p>
          <RadioCard name="lib-pub" value="profile" checked={pub === "profile"} onChange={setPub} icon="user-circle" title="Publier avec mon profil" description="Les autres verront votre prénom et l'initiale de votre nom." />
          <RadioCard name="lib-pub" value="anon" checked={pub === "anon"} onChange={setPub} icon="detective" iconTone="muted" title="Publier anonymement" description="Aucune identité visible. La plateforme peut retrouver l'auteur en cas d'abus." />
          <div className="preview-author"><Icon name="eye" />Visible publiquement : <b>{pub === "profile" ? `Signalé par ${publicName(state.session.user || USERS.me)}` : "Signalement anonyme"}</b></div>
        </section>

        <section className="lib-section"><p className="section-label">Switch · ListItem</p>
          <div className="list"><div className="list-item" style={{ display: "block", padding: "0 var(--s-4)" }}><Switch id="lib-sw" label="Alertes à proximité" checked={sw} onChange={setSw} /></div><ListItem icon="bell" label="Notifications" value="Activées" onClick={() => toast("Ouvre les réglages (phase 9).")} /></div>
        </section>

        <section className="lib-section"><p className="section-label">Feedback</p>
          <div className="lib-row">
            <Button variant="secondary" onClick={() => toast("Votre alerte a été publiée.")}>Toast succès</Button>
            <Button variant="secondary" onClick={() => toast("Impossible de publier votre alerte. Vérifiez votre connexion.", { tone: "error", actionLabel: "Réessayer" })}>Toast erreur</Button>
          </div>
          <Button variant="secondary" icon="squares-four" onClick={() => openSheet("demo-sheet", {}, "half")}>Ouvrir une bottom sheet</Button>
          <Banner tone="offline" title="Vous êtes actuellement hors connexion.">Les fonctionnalités dépendantes du réseau sont désactivées.</Banner>
          <Banner tone="emergency">En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés.</Banner>
          <Stepper step={3} total={7} label="Localisation" />
          <div style={{ display: "grid", gap: 8 }}><Skeleton width="40%" /><Skeleton height={18} width="85%" /><Skeleton height={90} /></div>
          <EmptyState title="Aucune alerte dans cette zone." action={<Button variant="secondary">Élargir à 10 km</Button>}>Revenez plus tard ou élargissez votre zone de recherche.</EmptyState>
          <div className="lib-row"><Pill onClick={() => toast("Carte recentrée sur les nouvelles alertes.")}>3 nouvelles alertes</Pill><Tooltip>Signalez un événement ici</Tooltip></div>
        </section>

        <section className="lib-section"><p className="section-label">Marqueurs</p>
          <div className="lib-markers">
            <Marker family="incident" icon="fire" label="Incident" />
            <Marker family="vigilance" icon="lightbulb" label="Vigilance" />
            <Marker family="positive" icon="soccer-ball" label="Positif" />
            <Marker family="info" icon="barricade" label="Information" />
            <Marker family="positive" icon="mask-happy" selected label="Sélectionné" />
            <Marker family="incident" icon="fire" critical label="Incident critique" />
            <ClusterMarker count={12} onClick={() => toast("Zoom sur le regroupement (phase 3).")} />
          </div>
        </section>

        <section className="lib-section"><p className="section-label">Badges</p>
          <div className="lib-row">{["incendie", "proprete", "solidarite", "travaux"].map((id) => <TypeBadge key={id} category={CATEGORY_BY_ID[id]} />)}</div>
          <div className="lib-row">{["active", "proche", "transmis", "en_traitement", "traite", "expiree", "moderee", "rejetee"].map((s) => <StatusBadge key={s} status={s} />)}</div>
        </section>

        <section className="lib-section"><p className="section-label">Alert Card · Vote · Expiration</p>
          <AlertCard alert={sample} onOpen={() => push("alert", { id: sample.id })} />
          <VoteBar alert={state.alerts.find((a) => a.id === "a4")} />
          <ExpirationCounter alert={sample} />
          <ExpirationCounter alert={state.alerts.find((a) => a.id === "a22")} />
          <ExpirationCounter alert={state.alerts.find((a) => a.id === "a23")} />
        </section>

        <section className="lib-section"><p className="section-label">Timeline · Service</p>
          <div className="service"><Icon name="paper-plane-tilt-fill" /><span><b>Transmis au service compétent</b><small>{route.name}</small></span></div>
          <Timeline currentIndex={stepIndex} steps={TRANSMISSION_STEPS.slice(0, 5).map((s, i) => ({ ...s, detail: i === 0 ? fmtRelative(now - sampleTreated.createdAt) : i === 1 ? route.name : i === stepIndex && route.delayHours ? `Délai indicatif : ${route.delayHours} h` : null }))} />
        </section>

        <section className="lib-section"><p className="section-label">Catégories</p>
          <div className="cat-grid">{["incendie", "accident", "proprete", "eclairage", "solidarite", "culture"].map((id) => <CategoryTile key={id} category={CATEGORY_BY_ID[id]} selected={cat === id} onClick={() => setCat(id)} />)}</div>
        </section>

        <section className="lib-section"><p className="section-label">Commentaires</p>
          {SEED_COMMENTS.a1.map((c) => <CommentItem key={c.id} comment={c} reply={!!c.parentId} />)}
        </section>
      </div>
    </div>
  );
}
