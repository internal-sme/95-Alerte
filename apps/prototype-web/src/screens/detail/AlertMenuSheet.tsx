import { Fragment } from "react";
import { ME_ID } from "@/data/seed";
import { MenuRow } from "@/screens/detail/MenuRow";
import { shareUrl } from "@/screens/detail/detail";
import { useActions, useStore } from "@/store/store";

export interface AlertMenuSheetProps {
  id?: string;
}

export function AlertMenuSheet({ id }: AlertMenuSheetProps) {
  const { state, dispatch } = useStore();
  const { closeSheet, toast, confirm } = useActions();
  const alert = state.alerts.find((a) => a.id === id);
  if (!alert) return null;
  const mine = state.session.user && alert.authorId === ME_ID && !alert.anonymous;
  const copy = () => { try { navigator.clipboard?.writeText(shareUrl(alert)).catch(() => {}); } catch (e) { /* sans presse-papiers */ } closeSheet(); toast("Lien copié."); };
  const remove = () => {
    closeSheet();
    confirm({
      title: "Supprimer cette alerte ?",
      body: "Elle ne sera plus visible sur la carte ni dans la liste. Le service déjà saisi en est informé. Cette action est définitive.",
      confirmLabel: "Supprimer", destructive: true,
      onConfirm: () => { dispatch({ type: "DELETE_ALERT", alertId: alert.id }); toast("Votre alerte a été supprimée."); },
    });
  };
  return (
    <div className="menu-list">
      <MenuRow icon="link" label="Copier le lien" help="Pour le coller dans un message" onClick={copy} />
      <MenuRow icon="flag" label="Signaler cette alerte" help="Fausse, offensante, mauvaise catégorie ou mauvais lieu…" more
        onClick={() => { closeSheet(); toast("Le signalement d'un contenu arrive avec la modération (phase 7).", { tone: "info" }); }} />
      {mine ? (
        <Fragment>
          <hr />
          <MenuRow icon="trash" label="Supprimer mon alerte" help="Elle disparaîtra pour tout le monde" destructive onClick={remove} />
        </Fragment>
      ) : null}
    </div>
  );
}
