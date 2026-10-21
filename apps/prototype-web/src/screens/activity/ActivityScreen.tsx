import { useState } from "react";
import { AlertCard } from "@/components/AlertCard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ME_ID } from "@/data/seed";
import { GuestGate } from "@/screens/auth/GuestGate";
import { useActions, useStore } from "@/store/store";

export function ActivityScreen() {
  const { state } = useStore();
  const { push } = useActions();
  const [tab, setTab] = useState("mine");
  const mine = state.session.user ? state.alerts.filter((a) => a.authorId === ME_ID && a.status !== "supprimee").sort((a, b) => b.createdAt - a.createdAt) : [];
  const followed = state.alerts.filter((a) => state.follows[a.id]);
  const open = (a) => push("alert", { id: a.id });
  return (
    <div className="screen">
      <div className="screen-title"><h1>Activité</h1><p>Vos signalements et leur suivi par les services</p></div>
      <div className="screen-pad">
        <SegmentedControl block label="Activité" value={tab} onChange={setTab} options={[{ value: "mine", label: "Mes alertes" }, { value: "comments", label: "Commentaires" }, { value: "followed", label: "Suivies" }]} />
        {!state.session.user ? (
          <GuestGate icon="pulse" title="Retrouvez ici votre activité" text="Connectez-vous pour suivre vos alertes, vos commentaires et les alertes que vous suivez." />
        ) : tab === "mine" ? (
          mine.length ? mine.map((a) => <AlertCard key={a.id} alert={a} showStatus onOpen={() => open(a)} />)
            : <EmptyState icon="plus" title="Vous n'avez encore publié aucune alerte." action={<Button onClick={() => push("report")}>Signaler un événement</Button>} />
        ) : tab === "comments" ? (
          <EmptyState icon="chat-circle" title="Aucun commentaire pour le moment.">Vos commentaires et les réponses reçues apparaîtront ici.</EmptyState>
        ) : followed.length ? followed.map((a) => <AlertCard key={a.id} alert={a} onOpen={() => open(a)} />)
          : <EmptyState icon="bell" title="Aucune alerte suivie.">Suivez une alerte pour être prévenu de son traitement.</EmptyState>}
      </div>
    </div>
  );
}
