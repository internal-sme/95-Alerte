/* =====================================================================
   TYPES — modèle de données du prototype (docs/ARCHITECTURE.md §3)
   ===================================================================== */

export type AlertType = "positive" | "negative";
export type Family = "incident" | "vigilance" | "info" | "positive";
export type Priority = "critique" | "elevee" | "normale";
export type Precision = "rue" | "quartier" | "zone";
export type TransmissionStep = "envoye" | "transmis" | "pris_en_compte" | "en_traitement" | "traite" | "cloture";
export type AlertStatus = "active" | "expiree" | "supprimee" | "moderee";
export type FollowLevel = "all" | "status" | "none";
export type Identity = "profile" | "anonymous";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Commune extends LatLng {
  id: string;
  name: string;
  interco: string;
  quartiers: string[];
}

export interface ServiceType {
  label: string;
  scope: "departement" | "commune";
  delay: number | null;
}

export interface Category {
  id: string;
  label: string;
  type: AlertType;
  family: Family;
  icon: string;
  priority: Priority;
  precision: Precision;
  service: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

/** Une alerte publiée. L'auteur reste connu du système même si l'alerte est anonyme (CDC §9). */
export interface Alert extends LatLng {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  communeId: string;
  quartier: string;
  street: string;
  createdAt: number;
  /** R5 : createdAt + 24 h */
  expiresAt: number;
  authorId: string;
  anonymous: boolean;
  votesUp: number;
  votesDown: number;
  commentsCount: number;
  hasPhoto: boolean;
  /** Clés des photos (prototype/src/alertes/<clé>.webp) */
  photos?: string[];
  transmission: TransmissionStep;
  status: AlertStatus;
  duplicateGroup: string | null;
  areaKm: number | null;
}

export interface Comment {
  id: string;
  authorId: string;
  anonymous: boolean;
  body: string;
  ageMin: number;
  parentId?: string;
}

export interface Notification {
  id: string;
  kind: string;
  alertId: string;
  title: string;
  body: string;
  ageMin?: number;
  at?: number;
  read: boolean;
}

export interface Position extends LatLng {
  source: "default" | "gps" | "manual" | string;
  communeId: string | null;
  permission: "unknown" | "granted" | "denied" | string;
  /** Rayon de la zone suivie (onboarding) */
  radiusKm?: number;
}

/* ---- Signalement (phase 6) ---- */
export interface DraftPhoto {
  id: string;
  key: string;
  status: "uploading" | "done" | "error";
  progress: number;
}

/** Lieu choisi à l'épingle (reverseGeocode) */
export interface DraftPlace extends LatLng {
  inside: boolean;
  x?: number;
  y?: number;
  communeId?: string;
  quartier?: string;
  street?: string | null;
}

export type ReportStep = "type" | "category" | "place" | "description" | "photo" | "identity" | "preview" | "publishing" | "done" | "error" | "refused";

/** Brouillon gardé dans le store pour la session (H4, jamais dans localStorage) */
export interface Draft {
  step: ReportStep;
  type?: AlertType | null;
  categoryId?: string | null;
  place?: DraftPlace | null;
  title: string;
  titleSuggested?: boolean;
  description: string;
  photos: DraftPhoto[];
  identity: Identity | null;
  saved?: boolean;
  camera?: boolean;
  publishedId?: string;
}

/* ---- Préférences, mode démo, état global ---- */
export interface Prefs {
  theme: "system" | "light" | "dark";
  textScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  onboardingSeen: boolean;
  reportHintSeen: boolean;
  homeView: "map" | "list";
  mapStyle: "plan" | "satellite";
  /** Dernier choix d'identité au signalement (H3) */
  lastIdentity?: Identity;
  /** Niveau de suivi proposé, et opt-in déjà demandé (phase 5) */
  followLevel?: FollowLevel;
  followAsked?: boolean;
  recentSearches?: { label: string; [key: string]: any }[];
  /** Carte « Bien démarrer » */
  startHidden?: boolean;
  startVoted?: boolean;
  startReported?: boolean;
}

export interface DemoFlags {
  offline: boolean;
  permissionDenied: boolean;
  gpsUnavailable: boolean;
  networkError: boolean;
  emptyZone: boolean;
  manyAlerts: boolean;
  timeSpeed: number;
  [key: string]: unknown;
}

/** Écran empilé : identifiant de STACK_SCREENS, paramètres, clé unique (remontage) */
export interface StackEntry {
  id: string;
  params?: Record<string, any>;
  key: string;
}

export interface Toast {
  id: number;
  text: string;
  tone?: "success" | "info" | "error" | string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface AppState {
  prefs: Prefs;
  demo: DemoFlags;
  session: { status: string; user: User | null; identity: string; method: string | null; position: Position; [key: string]: any };
  onb: { step: string; slide: number; [key: string]: any };
  auth: { step: string; form: Record<string, string>; docType: string; idResult: string; display: string; [key: string]: any };
  alerts: Alert[];
  votes: Record<string, -1 | 0 | 1>;
  follows: Record<string, FollowLevel>;
  comments: Record<string, Comment[]>;
  notifications: Notification[];
  /** jump : compteur incrémenté par le panneau de démo (remonte l'écran) */
  nav: { tab: string; stack: StackEntry[]; jump?: number };
  mapFilter: any;
  listSort: string;
  mapFocus: any;
  draft: Draft | null;
  sheet: { id: string; params?: Record<string, any>; [key: string]: any } | null;
  modal: any;
  toasts: Toast[];
}

/** Action du reducer : `type` + charge utile propre à chaque action */
export interface Action {
  type: string;
  [key: string]: any;
}

/* ---- Ressources embarquées ---- */
export interface MapGeometry {
  proj: { lat0: number; lng0: number; kx: number; ky: number };
  bounds: [number, number, number, number];
  dept: string;
  epci: { id: string; name: string; short: string; d: string; c: [number, number]; n: number }[];
  communes: { code: string; name: string; epci: string; pop: number; d: string; c: [number, number] }[];
  quartiers: { commune: string; name: string; d: string; c: [number, number] }[];
  water: { name: string; w: number; d: string; c: [number, number] }[];
  lakes: { name: string; d: string }[];
  forests: { name: string; d: string; c: [number, number] }[];
  roads: { ref: string; cls: string; d: string }[];
  outside: { name: string; c: [number, number] }[];
}

export interface SatelliteLevel {
  x: number;
  y: number;
  w: number;
  h: number;
  px: number[];
  href: string;
}

export interface SatelliteData {
  source: string;
  dept: SatelliteLevel;
  sector: SatelliteLevel;
}
