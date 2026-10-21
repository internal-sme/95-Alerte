import { useEffect } from "react";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ListItem } from "@/components/ListItem";
import { Spinner } from "@/components/Spinner";
import { AuthHeader } from "@/screens/auth/AuthHeader";
import { FC_PROVIDERS } from "@/screens/auth/auth";
import { useStore } from "@/store/store";

export function FranceConnectScreen() {
  const { state, dispatch } = useStore();
  const step = state.auth.step;
  useEffect(() => {
    if (step !== "fc-loading") return undefined;
    const id = setTimeout(() => {
      if (state.demo.networkError) dispatch({ type: "AUTH_GO", step: "fc-error" });
      else dispatch({ type: "LOGIN", method: "franceconnect", identity: "verifiee", message: "Connecté avec FranceConnect · identité vérifiée" });
    }, 1500);
    return () => clearTimeout(id);
  }, [step, state.demo.networkError, dispatch]);

  if (step === "fc-loading") {
    return (
      <div className="screen auth">
        <AuthHeader title="FranceConnect" />
        <div className="auth-center" role="status">
          <span className="status-hero tone-info"><Spinner /></span>
          <h2>Connexion sécurisée en cours…</h2>
          <p>Récupération de votre identité vérifiée.</p>
        </div>
      </div>
    );
  }
  if (step === "fc-error") {
    return (
      <div className="screen auth">
        <AuthHeader title="FranceConnect" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })} />
        <div className="auth-center" role="alert">
          <span className="status-hero tone-error"><Icon name="warning" /></span>
          <h2>La connexion avec FranceConnect a échoué.</h2>
          <p>Le service n'a pas répondu. Réessayez dans un instant ou créez un compte 95 Alerte.</p>
        </div>
        <div className="screen-footer stack-footer">
          <Button block onClick={() => dispatch({ type: "AUTH_GO", step: "fc" })}>Réessayer</Button>
          <Button block variant="ghost" onClick={() => dispatch({ type: "AUTH_GO", step: "signup-info" })}>Créer un compte</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen auth">
      <AuthHeader title="FranceConnect" onBack={() => dispatch({ type: "AUTH_GO", step: "login" })} />
      <div className="screen-pad">
        <Banner tone="info" icon="info">Écran simulé pour le prototype : aucune donnée réelle n'est échangée.</Banner>
        <div className="auth-intro">
          <h2 className="question">Choisissez un compte pour vous connecter</h2>
          <p className="auth-lead">Vous reviendrez automatiquement sur 95 Alerte, avec votre identité vérifiée.</p>
        </div>
        <div className="list">
          {FC_PROVIDERS.map((p) => <ListItem key={p.id} icon={p.icon} label={p.label} onClick={() => dispatch({ type: "AUTH_GO", step: "fc-loading" })} />)}
        </div>
      </div>
    </div>
  );
}
