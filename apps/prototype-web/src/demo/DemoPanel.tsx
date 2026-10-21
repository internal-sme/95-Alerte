import { Fragment, useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Switch } from "@/components/Switch";
import { PhaseScreens } from "@/demo/PhaseScreens";
import { useActions, useStore } from "@/store/store";

export function DemoPanel() {
  const { state, dispatch } = useStore();
  const { setDemo, setPref, reset, push, toast, confirm } = useActions();
  const [open, setOpen] = useState(false);
  const d = state.demo;
  return (
    <Fragment>
      <button type="button" className="demo-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="demo-panel"><Icon name="sliders-horizontal" className="ph-sm" />Démo</button>
      {open ? (
        <aside className="demo-panel" id="demo-panel" aria-label="Mode démo">
          <h2><Icon name="sliders-horizontal" />Mode démo<IconButton icon="x" label="Fermer le mode démo" onClick={() => setOpen(false)} style={{ marginLeft: "auto", width: 40, height: 40, boxShadow: "none" }} /></h2>
          <p className="demo-note">Force des états pour la présentation. Ces réglages ne font pas partie de l'application.</p>
          <hr />
          <Switch id="demo-offline" label="Hors connexion" checked={d.offline} onChange={(v) => setDemo("offline", v)} />
          <Switch id="demo-perm" label="Localisation refusée" checked={d.permissionDenied} onChange={(v) => setDemo("permissionDenied", v)} />
          <Switch id="demo-camera" label="Appareil photo refusé" checked={d.cameraDenied} onChange={(v) => setDemo("cameraDenied", v)} />
          <Switch id="demo-gps" label="Position introuvable" checked={d.gpsUnavailable} onChange={(v) => setDemo("gpsUnavailable", v)} />
          <Switch id="demo-error" label="Erreur réseau" checked={d.networkError} onChange={(v) => setDemo("networkError", v)} />
          <Switch id="demo-empty" label="Zone sans alerte" checked={d.emptyZone} onChange={(v) => setDemo("emptyZone", v)} />
          <Switch id="demo-many" label="Beaucoup d'alertes (+80)" checked={d.manyAlerts} onChange={(v) => setDemo("manyAlerts", v)} />
          <div className="row"><span>Vitesse du temps</span><SegmentedControl label="Vitesse du temps" value={d.timeSpeed} onChange={(v) => setDemo("timeSpeed", v)} options={[{ value: 1, label: "×1" }, { value: 60, label: "×60" }, { value: 600, label: "×600" }]} /></div>
          <div className="row"><span>Thème</span><SegmentedControl label="Thème" value={state.prefs.theme} onChange={(v) => setPref("theme", v)} options={[{ value: "light", label: "Clair" }, { value: "system", label: "Auto" }, { value: "dark", label: "Sombre" }]} /></div>
          <hr />
          <p className="section-label">Connexion</p>
          <div className="row"><span>Résultat de la vérification</span></div>
          <SegmentedControl block label="Résultat de la vérification d'identité" value={state.auth.idResult === "aucune" ? "en_cours" : state.auth.idResult} onChange={(v) => dispatch({ type: "AUTH_SET", patch: { idResult: v } })}
            options={[{ value: "en_cours", label: "En cours" }, { value: "reussie", label: "OK" }, { value: "echouee", label: "Échec" }, { value: "refusee", label: "Refus" }, { value: "manuelle", label: "Manuel" }]} />
          <p className="demo-note">Code SMS 000000 = code incorrect · e-mail deja@exemple.fr = déjà utilisé · « Erreur réseau » = échec FranceConnect.</p>
          <div className="lib-row">
            <Button variant="secondary" icon="play" onClick={() => { dispatch({ type: "RESTART" }); setOpen(false); }}>Rejouer le démarrage</Button>
            <Button variant="secondary" icon="arrow-counter-clockwise" onClick={() => { dispatch({ type: "RESTART", onboarding: true }); setOpen(false); }}>Rejouer l'onboarding</Button>
            {state.session.status !== "in" ? <Button variant="ghost" onClick={() => { dispatch({ type: "LOGIN", method: "demo", identity: "verifiee" }); setOpen(false); }}>Passer la connexion</Button> : null}
          </div>
          <hr />
          <Button variant="secondary" icon="squares-four" onClick={() => { if (state.session.status !== "in") dispatch({ type: "LOGIN", method: "demo", identity: "verifiee" }); push("components"); setOpen(false); }}>Bibliothèque de composants</Button>
          <hr />
          <PhaseScreens onJump={() => setOpen(false)} />
          <Button variant="ghost" icon="arrow-counter-clockwise" onClick={() => confirm({ title: "Réinitialiser le prototype ?", body: "Les alertes, votes et commentaires reviennent à leur état de départ. Vos préférences d'affichage sont conservées.", confirmLabel: "Réinitialiser", onConfirm: () => { reset(); toast("Prototype réinitialisé."); } })}>Réinitialiser</Button>
        </aside>
      ) : null}
    </Fragment>
  );
}
