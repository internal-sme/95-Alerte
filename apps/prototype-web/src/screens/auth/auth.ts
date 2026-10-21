import { useLayoutEffect } from "react";
import { FranceConnectScreen } from "@/screens/auth/FranceConnectScreen";
import { IdentityStatusScreen } from "@/screens/auth/IdentityStatusScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { ProfileSetupScreen } from "@/screens/auth/ProfileSetupScreen";
import { SignInScreen } from "@/screens/auth/SignInScreen";
import { SignupDoneScreen } from "@/screens/auth/SignupDoneScreen";
import { SignupEmailScreen } from "@/screens/auth/SignupEmailScreen";
import { SignupIdentityScreen } from "@/screens/auth/SignupIdentityScreen";
import { SignupInfoScreen } from "@/screens/auth/SignupInfoScreen";
import { SignupPhoneScreen } from "@/screens/auth/SignupPhoneScreen";
import { motionReduced } from "@/utils/index";

/* =====================================================================
   PHASE 1 — Démarrage et connexion (UI-001, UI-008 → UI-010 ; CDC §6, §8, §9, §43)
   ===================================================================== */

export const SIGNUP_STEPS = ["Nom", "Téléphone", "E-mail", "Identité"];

export const ID_DOCS = [
  { id: "cni", label: "Carte d'identité", hint: "Recto et verso" },
  { id: "passeport", label: "Passeport", hint: "Page avec la photo" },
  { id: "sejour", label: "Titre de séjour", hint: "Recto et verso" },
];

export const IDENTITY_FROM_RESULT = { reussie: "verifiee", en_cours: "en_cours", manuelle: "en_cours", echouee: "non_verifiee", refusee: "non_verifiee" };

export function maskPhone(p) {
  const d = (p || "").replace(/\D/g, "");
  return d.length >= 4 ? `${d.slice(0, 2)} •• •• •• ${d.slice(-2)}` : "votre numéro";
}

export function maskEmail(e) {
  const [u, dom] = (e || "").split("@");
  return u && dom ? `${u[0]}•••@${dom}` : "votre adresse";
}

/* Logo officiel 95 Alerte (docs/brand/logo-95-alerte.svg, texte vectorisé). « 95 » jaune et gyrophare
   rouge : couleurs de l'asset ; « Alerte » prend la couleur du texte pour rester lisible en mode sombre. */
export const LOGO_YELLOW = ['M93.6,14.4C83.5,4.4,73.1,0,55.3,0,25.4,0,4.8,19.7,4.8,46.4v.4c0,26.9,18.5,42.8,47.3,42.8s20.1-3.4,26.9-9.1c-1.1,11.4-6.8,30.1-26.9,30.1s-19.3-3.6-29-11.4l-15.4,22.2c11.2,9.3,24.2,15.7,43.6,15.7,37.7,0,57.9-29.4,57.9-72.3v-.4c0-26.1-6.2-40.5-15.7-50h0ZM79.6,45.7c0,11.4-8.3,19.7-22.7,19.7s-23.1-8.1-23.1-19.9v-.4c0-11.8,8.1-20.1,22.5-20.1s23.3,8.5,23.3,20.3v.4h0Z', 'M170.8,48.5c-7.4,0-12.1.9-17.4,2.3l1.5-22.9h56.4V2.3h-81.4l-3.8,65.3,11.1,7.4c3.8-7.3,10.6-12.7,18.6-13.5,15.4-1.6,24.6,3.7,30.6,13.6,6.1,10.1,5.4,20.8-1.8,30.4-5.4,7.4-11.4,14.3-17.1,21.5-.9,1.1-1.9,2.2-3.2.9-8.5-8.1-19.2-14.2-25.8-24.2-1.5-2.3-2.7-4.8-3.4-7.3,0,0-.2-.1-.2-.2l-17.6,21c12.9,12.3,28.4,19.9,49.6,19.9,30.5,0,50.4-17.8,50.4-45.8v-.4c0-29.9-20.6-42.4-46.4-42.4h0Z'];

export const LOGO_RED = ['M161.9,108.5c-1.7.4-3.3-.4-3.9-2.2,2.1-.6,4.1-1.1,6.2-1.7.4,1.8-.6,3.3-2.3,3.8Z', 'M173.6,101.1c-6.1,1.7-12.3,3.3-18.5,4.9-1.4.4-2.4-.4-2.3-1.9.1-1.6.6-3.2,1.4-4.6.4-.7.6-1.4.7-2.1-2.5-1.9-4.3-4.8-4.6-8.2-.6-6.3,3.9-11.7,10.4-12.3,6.4-.6,11.8,3.9,12.4,10.2.3,2.9-.5,5.7-2.1,7.8,1.5.8,2.7,1.9,3.6,3.3.9,1.3.4,2.4-1,2.8h0Z'];

export const LOGO_WORD = ['M28.5,153.5h5.9l25.4,56.1h-6.8l-6.5-14.7h-30.3l-6.6,14.7H3.1l25.4-56.1ZM44,189.2l-12.6-28.4-12.7,28.4h25.4Z', 'M66.2,151.5h6.1v58h-6.1v-58Z', 'M80.1,189.1v-.2c0-11.8,8.3-21.4,19.7-21.4s19.2,9.7,19.2,21.7,0,1.3,0,2h-32.6c.9,8.9,7.2,13.9,14.5,13.9s9.6-2.3,13-5.8l3.8,3.4c-4.1,4.6-9.1,7.7-16.9,7.7-11.3,0-20.5-8.7-20.5-21.4ZM112.7,186.7c-.6-7.5-4.9-14-13.1-14s-12.6,6-13.4,14h26.5Z', 'M125.7,168.4h6.1v10.7c3-6.8,9-11.8,16.8-11.5v6.6h-.5c-9,0-16.3,6.4-16.3,18.8v16.4h-6.1v-41.1Z', 'M156.1,198.6v-24.8h-5.7v-5.4h5.7v-12.4h6.1v12.4h13v5.4h-13v24c0,5,2.8,6.8,6.9,6.8s3.8-.4,6-1.4v5.2c-2.1,1.1-4.5,1.7-7.4,1.7-6.6,0-11.6-3.3-11.6-11.6Z', 'M178.3,189.1v-.2c0-11.8,8.3-21.4,19.7-21.4s19.2,9.7,19.2,21.7,0,1.3,0,2h-32.6c.9,8.9,7.2,13.9,14.5,13.9s9.6-2.3,13-5.8l3.8,3.4c-4.1,4.6-9.1,7.7-16.9,7.7-11.3,0-20.5-8.7-20.5-21.4ZM211,186.7c-.6-7.5-4.9-14-13.1-14s-12.6,6-13.4,14h26.5Z'];

export const splashMemory = { logoRect: null };

export const GIF_LOGO_BOX = { x: 84 / 800, y: 65 / 800, w: 643 / 800, h: 632 / 800 }; // logo dans la dernière image du GIF

/* Arrivée sur l'accueil après le démarrage : le logo part de sa position sur le démarrage et se pose
   à sa place (FLIP), le halo s'efface, le titre et les actions apparaissent ensuite. */
export function useSplashHandoff(logoRef, screenRef, reveal = ".welcome-title, .welcome-center .auth-lead, .welcome-panel, .auth-skip") {
  useLayoutEffect(() => {
    const from = splashMemory.logoRect;
    splashMemory.logoRect = null;
    const el = logoRef.current;
    if (!from || motionReduced() || !document.body.animate) return;
    const ease = "cubic-bezier(.2,.8,.2,1)";
    // Écran sans logo (pages de présentation) : seule l'entrée échelonnée est jouée
    if (el) {
      const to = el.getBoundingClientRect();
      const dx = from.x + from.w / 2 - (to.x + to.width / 2);
      const dy = from.y + from.h / 2 - (to.y + to.height / 2);
      const k = from.w / to.width;
      el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: "none" }], { duration: 800, easing: ease });
    }
    const screen = screenRef.current;
    screen.querySelectorAll(reveal).forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 450, delay: 420 + i * 70, easing: ease, fill: "backwards" }));
    const halo = screen.querySelector(".splash-halo");
    if (halo) halo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease-out", fill: "forwards" });
  }, []);
}

export const FC_PROVIDERS = [
  { id: "fiscal", label: "Compte fiscal", icon: "buildings" },
  { id: "sante", label: "Compte assurance santé", icon: "hand-heart" },
  { id: "numerique", label: "Identité numérique", icon: "identification-card" },
  { id: "retraite", label: "Compte retraite", icon: "user-circle" },
];

export const ID_RESULT_VIEW = {
  en_cours: { tone: "vigilance", icon: "timer", title: "Vérification en cours", text: "Généralement moins de 24 h. Vous pouvez utiliser 95 Alerte en attendant : nous vous préviendrons du résultat.", step: 1 },
  reussie: { tone: "positive", icon: "seal-check-fill", title: "Identité vérifiée", text: "Merci. Votre compte est vérifié : vos signalements seront traités en priorité par les services.", step: 3 },
  echouee: { tone: "error", icon: "warning", title: "La vérification a échoué", text: "Le service n'a pas pu lire votre document. Faites une nouvelle tentative ou demandez une vérification manuelle.", step: 1, failed: true },
  refusee: { tone: "error", icon: "x", title: "Document refusé", text: "La photo est floue ou le document a expiré. Reprenez une photo nette d'un document en cours de validité.", step: 1, failed: true },
  manuelle: { tone: "info", icon: "user-circle", title: "Vérification manuelle", text: "Un agent examine votre dossier. Délai indicatif : 48 h. Vous serez notifié du résultat.", step: 1 },
};

export const AUTH_SCREENS = {
  login: LoginScreen, fc: FranceConnectScreen, "fc-loading": FranceConnectScreen, "fc-error": FranceConnectScreen, signin: SignInScreen,
  "signup-info": SignupInfoScreen, "signup-phone": SignupPhoneScreen, "signup-email": SignupEmailScreen, "signup-id": SignupIdentityScreen,
  "id-status": IdentityStatusScreen, profile: ProfileSetupScreen, done: SignupDoneScreen,
};
