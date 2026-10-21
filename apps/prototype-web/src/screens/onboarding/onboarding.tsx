import { ASSETS } from "@/assets";
import { CommuneDetected } from "@/screens/onboarding/CommuneDetected";
import { LocationDenied } from "@/screens/onboarding/LocationDenied";
import { LocationPrimer } from "@/screens/onboarding/LocationPrimer";
import { OnboardingCommune } from "@/screens/onboarding/OnboardingCommune";
import { OnboardingMapStyle } from "@/screens/onboarding/OnboardingMapStyle";
import { OnboardingPrep } from "@/screens/onboarding/OnboardingPrep";
import { OnboardingSlides } from "@/screens/onboarding/OnboardingSlides";
import { MAP_VIEW, NEAR_KM } from "@/screens/tabs/mapArt";

/* =====================================================================
   PHASE 2 — Onboarding, territoire, localisation (UI-002 → UI-007 ; CDC §6, §7, §16, §77)
   Parcours (benchmark onboarding) : présentation en 4 écrans → amorce de localisation →
   commune détectée ou choisie → connexion. La localisation reste facultative : refus et
   « Plus tard » mènent toujours à une suite (choix manuel de la commune).
   ===================================================================== */

/* Refonte v2 (docs/benchmark/onboarding-refonte.html) : 3 pages de présentation (photo + notification réelle, à la
   Citizen ; arc à la Headspace ; mot-clé surligné à la Klima), amorce allégée (Tinder), demande système coachée et
   zone suivie (Life360), préparation de la carte (Evernote), reprise illustrée après refus (Polarsteps, Viator).
   Le 4e titre du CDC, « Votre territoire, votre vigilance. », reste le titre de l'écran de connexion. */
export const ONB_SLIDES = [
  {
    title: ["Que se passe‑t‑il ", "autour de vous", " ?"],
    text: "Incidents, travaux, bonnes nouvelles : le Val-d'Oise en direct, sur une carte.",
    alt: "Une main tient un téléphone affichant la carte des alertes, dans une rue ancienne de Pontoise au coucher du soleil.",
  },
  {
    title: ["Un problème ? ", "Signalez-le."],
    text: "En quelques gestes, votre signalement part au service compétent.",
    alt: "Une main photographie avec son téléphone un nid-de-poule et une branche tombée sur une rue résidentielle.",
  },
  {
    title: ["Une bonne nouvelle ? ", "Partagez-la aussi."],
    text: "Fête de quartier, entraide, nouveau commerce : le positif a toute sa place.",
    tone: "positive",
    alt: "Une main tient un téléphone pendant une fête de quartier sur une place, guirlandes et stands en arrière-plan.",
  },
];

// Photos générées (Magnific, d'après le flow Citizen) : embarquées par le build si présentes, sinon fragment de carte
export const ONB_PHOTOS = ASSETS.ONB_PHOTOS || {};

export const ONB_STEPS = 3; // Étape 1 : position · Étape 2 : zone suivie · Étape 3 : fond de carte (tâche 5.12)

export const ZONE_RADII = [1, 5, 10];

export const PX_PER_KM = MAP_VIEW.ky / 111; // ≈ 43,8 px par km sur la carte illustrée

// Communes voisines hors Val-d'Oise : état « hors territoire » (PRD §10.3)
export const OUT_OF_ZONE = ["Paris", "Saint-Denis", "Beauvais", "Creil", "Chantilly", "Mantes-la-Jolie", "Rouen", "Versailles", "Senlis", "Gisors"];

export const zoneRadius = (state) => state.session.position.radiusKm || NEAR_KM;

export const ONB_SCREENS = {
  slides: OnboardingSlides, location: LocationPrimer, detected: CommuneDetected, commune: OnboardingCommune, "map-style": OnboardingMapStyle, prep: OnboardingPrep,
  denied: () => <LocationDenied />, unavailable: () => <LocationDenied unavailable />,
};
