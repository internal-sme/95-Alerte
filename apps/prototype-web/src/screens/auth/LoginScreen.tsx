import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Logo95 } from "@/components/Logo95";
import { COMMUNE_BY_ID } from "@/data/seed";
import { splashMemory, useSplashHandoff } from "@/screens/auth/auth";
import { useStore } from "@/store/store";
import { useOnline } from "@/utils/index";

/* Accueil de connexion, d'après Dot (Mobbin) : fond en léger dégradé bleu, marque et titre au centre,
   actions empilées en bas, mentions en une ligne. « Explorer sans compte » reste accessible en haut. */
export function LoginScreen() {
  const { dispatch } = useStore();
  const online = useOnline();
  const logoRef = useRef(null);
  const screenRef = useRef(null);
  const [intro] = useState(() => splashMemory.logoRect !== null);
  const { state } = useStore();
  const commune = state.session.position.communeId ? COMMUNE_BY_ID[state.session.position.communeId] : null;
  useSplashHandoff(logoRef, screenRef);
  const go = (step) => dispatch({ type: "AUTH_GO", step });
  return (
    <div className="screen auth welcome" ref={screenRef}>
      {intro ? <div className="splash-halo" aria-hidden="true" /> : null}
      <button type="button" className="pill auth-skip" onClick={() => dispatch({ type: "GUEST" })}>Explorer sans compte<Icon name="caret-right" className="ph-sm" /></button>
      <div className="welcome-center">
        <span className="welcome-logo" ref={logoRef}><Logo95 width={120} /></span>
        <h1 className="welcome-title">Votre territoire,<br />votre vigilance.</h1>
        <p className="auth-lead">{commune ? `Les bonnes et les mauvaises nouvelles de ${commune.name} et du Val-d'Oise, en direct.` : "Les bonnes et les mauvaises nouvelles du Val-d'Oise, en direct."}</p>
      </div>
      <div className="welcome-panel">
        <Button block icon="identification-card" onClick={online(() => go("fc"))}>Continuer avec FranceConnect</Button>
        <Button block variant="secondary" onClick={() => go("signup-info")}>Créer un compte</Button>
        <Button block variant="ghost" onClick={() => go("signin")}>J'ai déjà un compte</Button>
        <p className="legal">FranceConnect vérifie votre identité ; vos alertes peuvent rester anonymes. En continuant, vous acceptez les conditions d'utilisation.</p>
      </div>
    </div>
  );
}
