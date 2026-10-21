import { Icon } from "@/components/Icon";
import { Spot } from "@/components/Spot";
import { ScreenHeader } from "@/navigation/ScreenHeader";
import { EMERGENCY_NUMBERS } from "@/screens/detail/detail";
import { useStore } from "@/store/store";
import { displayPlace } from "@/utils/index";

export interface EmergencyScreenProps {
  id?: string;
}

export function EmergencyScreen({ id }: EmergencyScreenProps) {
  const { state } = useStore();
  const alert = id ? state.alerts.find((a) => a.id === id) : null;
  return (
    <div className="screen emergency-screen">
      <ScreenHeader title="" close />
      <div className="screen-pad emergency-body">
        <Spot icon="siren" tone="neutral" />
        <h1>Situation urgente ?</h1>
        <p className="lead">95 Alerte n'est pas un remplacement des services d'urgence. En cas d'urgence nécessitant une intervention immédiate, contactez les services d'urgence appropriés.</p>
        <ul className="emergency-numbers" aria-label="Numéros d'urgence">
          {EMERGENCY_NUMBERS.map(([n, label, help]) => <li key={n}><b className="num">{n}</b><span><b>{label}</b><small>{help}</small></span></li>)}
        </ul>
        {alert ? <p className="emergency-place"><Icon name="map-pin" /><span><b>Lieu à indiquer</b>{displayPlace(alert)}</span></p> : null}
      </div>
      <div className="screen-footer">
        <a className="btn btn-destructive btn-block" href="tel:112"><Icon name="phone-fill" />Appeler le 112</a>
        <p className="footer-note">Ouvre le clavier de votre téléphone : l'appel n'est jamais lancé sans vous.</p>
      </div>
    </div>
  );
}
