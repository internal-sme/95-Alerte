import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ListItem } from "@/components/ListItem";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Switch } from "@/components/Switch";
import { MapStyleChoice } from "@/map/MapStyleChoice";
import { SAT_LAYERS } from "@/map/geo";
import { IdentityBadge } from "@/screens/auth/IdentityBadge";
import { useActions, useStore } from "@/store/store";
import { publicName } from "@/utils/index";

export function ProfileScreen() {
  const { state, dispatch } = useStore();
  const { push, setPref, toast, confirm } = useActions();
  const user = state.session.user;
  const soon = () => toast("Disponible bientôt.");
  const logout = () => confirm({ title: "Se déconnecter ?", body: "Vous pourrez toujours consulter les alertes sans compte.", confirmLabel: "Se déconnecter", onConfirm: () => dispatch({ type: "LOGOUT" }) });
  return (
    <div className="screen">
      <div className="screen-title"><h1>Profil</h1></div>
      <div className="screen-pad">
        {user ? (
          <div className="identity">
            <span className="avatar" aria-hidden="true">{user.firstName[0]}{user.lastName[0]}</span>
            <div>
              <b>{user.firstName} {user.lastName}</b>
              <small>Vos alertes identifiées affichent « {publicName(user)} »</small>
              <IdentityBadge status={state.session.identity} />
            </div>
            {state.session.identity === "non_verifiee" ? <Button variant="secondary" block className="identity-action" icon="identification-card" onClick={() => { dispatch({ type: "AUTH_SET", patch: { idResult: "en_cours" } }); push("verify-identity"); }}>Vérifier mon identité</Button> : null}
          </div>
        ) : (
          <div className="identity">
            <span className="avatar anon" aria-hidden="true"><Icon name="user-circle" /></span>
            <div><b>Vous n'êtes pas connecté</b><small>Connectez-vous pour signaler, voter et suivre vos alertes.</small></div>
            <Button block className="identity-action" icon="sign-in" onClick={() => dispatch({ type: "LOGOUT" })}>Se connecter</Button>
          </div>
        )}
        <section className="list-section">
          <h2 className="section-label">Affichage</h2>
          <div className="list">
            <div className="list-block"><span className="lb-label">Thème</span><SegmentedControl block label="Thème" value={state.prefs.theme} onChange={(v) => setPref("theme", v)} options={[{ value: "light", label: "Clair", icon: "sun" }, { value: "system", label: "Auto", icon: "circle-half" }, { value: "dark", label: "Sombre", icon: "moon" }]} /></div>
            {SAT_LAYERS ? <div className="list-block"><span className="lb-label">Fond de carte</span><MapStyleChoice center={state.session.position} /></div> : null}
            <div className="list-block"><span className="lb-label">Taille du texte</span><SegmentedControl block label="Taille du texte" value={state.prefs.textScale} onChange={(v) => setPref("textScale", v)} options={[100, 130, 160, 200].map((v) => ({ value: v, label: `${v} %` }))} /></div>
            <div className="list-block switch-row"><Switch id="pref-contrast" label="Contraste élevé" checked={state.prefs.highContrast} onChange={(v) => setPref("highContrast", v)} /></div>
            <div className="list-block switch-row"><Switch id="pref-motion" label="Réduire les animations" checked={state.prefs.reduceMotion} onChange={(v) => setPref("reduceMotion", v)} /></div>
          </div>
        </section>
        <section className="list-section">
          <h2 className="section-label">Compte</h2>
          <div className="list">
            <ListItem icon="bell" label="Notifications" onClick={soon} />
            <ListItem icon="lock-simple" label="Confidentialité et données" onClick={soon} />
            <ListItem icon="question" label="Aide et contact" onClick={soon} />
          </div>
        </section>
        <section className="list-section">
          <h2 className="section-label">Prototype</h2>
          <div className="list"><ListItem icon="squares-four" label="Bibliothèque de composants" onClick={() => push("components")} /></div>
        </section>
        {user ? <div className="list"><ListItem icon="sign-out" label="Se déconnecter" chevron={false} onClick={logout} /></div> : null}
      </div>
    </div>
  );
}
