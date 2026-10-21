import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Spot } from "@/components/Spot";
import { ME_ID } from "@/data/seed";
import { IDENTITY_FROM_RESULT } from "@/screens/auth/auth";
import { zoneRadius } from "@/screens/onboarding/onboarding";
import { useStore, useVisibleAlerts } from "@/store/store";
import { cx, haversineKm } from "@/utils/index";

/* Récapitulatif final (Greenlight « Success! », Nextdoor) : ce qui est prêt, ce qui reste, le contenu local */
export function SignupDoneScreen() {
  const { state, dispatch } = useStore();
  const alerts = useVisibleAlerts();
  const f = state.auth.form;
  const display = state.auth.display;
  const identity = IDENTITY_FROM_RESULT[state.auth.idResult] || "non_verifiee";
  const name = display === "first" ? f.firstName : `${f.firstName} ${(f.lastName || " ")[0]}.`;
  const near = alerts.filter((a) => haversineKm(state.session.position, a) <= zoneRadius(state)).length;
  const idLine = {
    verifiee: { icon: "check-circle-fill", title: "Identité vérifiée", text: "Vos signalements sont traités en priorité." },
    en_cours: { icon: "timer", title: "Vérification en cours", text: "Nous vous préviendrons du résultat.", pending: true },
    non_verifiee: { icon: "identification-card", title: "Identité non vérifiée", text: "Vous pourrez la vérifier depuis votre profil.", pending: true },
  }[identity];
  const go = () => dispatch({ type: "LOGIN", method: "inscription", identity, user: { id: ME_ID, firstName: f.firstName, lastName: f.lastName, display } });
  return (
    <div className="screen auth">
      <div className="screen-pad auth-done">
        <div className="auth-center compact" role="status">
          <Spot icon="hand-waving" />
          <h2>Bienvenue, {f.firstName} !</h2>
          <p>Votre compte 95 Alerte est prêt.</p>
        </div>
        <ul className="recap">
          <li><Icon name="check-circle-fill" /><span><b>Compte créé</b><small>Vos alertes identifiées afficheront « {name} ».</small></span></li>
          <li className={cx(idLine.pending && "pending")}><Icon name={idLine.icon} /><span><b>{idLine.title}</b><small>{idLine.text}</small></span></li>
          <li className="info"><Icon name="map-pin" /><span><b>{near} alerte{near > 1 ? "s" : ""} à moins de {zoneRadius(state)} km</b><small>Positives et négatives, mises à jour en direct.</small></span></li>
        </ul>
      </div>
      <div className="screen-footer"><Button block icon="map-trifold" onClick={go}>Voir la carte</Button></div>
    </div>
  );
}
