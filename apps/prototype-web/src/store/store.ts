import { createContext, useContext, useMemo, type Dispatch } from "react";
import type { Action, AppState } from "@/types";
import { BOOT_TIME, COMMUNE_BY_ID, SEED_ALERTS, SEED_COMMENTS, SEED_NOTIFICATIONS, USERS, generateManyAlerts } from "@/data/seed";
import { DEFAULT_FILTER } from "@/filters/filters";
import { storage } from "@/utils/index";

/* =====================================================================
   STORE — état unique (useReducer)
   ===================================================================== */

export const PREFS_KEY = "95alerte:prefs";

export const DEFAULT_PREFS = { theme: "system", textScale: 100, highContrast: false, reduceMotion: false, onboardingSeen: false, reportHintSeen: false, homeView: "map", mapStyle: "plan" };

export const DEFAULT_DEMO = { offline: false, permissionDenied: false, gpsUnavailable: false, networkError: false, emptyZone: false, manyAlerts: false, timeSpeed: 1 };

export function initialAuth() {
  return {
    step: "login",
    form: { firstName: "Jean", lastName: "Dupont", email: "jean.dupont@exemple.fr", phone: "06 12 34 56 42" },
    docType: "cni",
    idResult: "en_cours",
    display: "initial",
  };
}

// Position : « default » tant que l'utilisateur n'a ni autorisé la localisation ni choisi de commune
export const DEFAULT_POSITION = { lat: 49.0508, lng: 2.1008, source: "default", communeId: null, permission: "unknown" };

export function initialState(): AppState {
  return {
    prefs: { ...DEFAULT_PREFS, ...storage.get(PREFS_KEY, {}) },
    demo: { ...DEFAULT_DEMO },
    session: { status: "splash", user: null, identity: "non_verifiee", method: null, position: DEFAULT_POSITION },
    onb: { step: "slides", slide: 0 },
    auth: initialAuth(),
    alerts: SEED_ALERTS,
    votes: { a4: 1, a8: 1 },
    follows: { a1: "all" }, // niveau de suivi : « all » (tout changement), « status » (traitement seul), « none » (sans notification)
    comments: SEED_COMMENTS,
    notifications: SEED_NOTIFICATIONS,
    nav: { tab: "map", stack: [] },
    mapFilter: DEFAULT_FILTER,
    listSort: "relevance",
    mapFocus: null,
    draft: null, // signalement en cours (phase 6, H4) : gardé pour la session, jamais dans localStorage
    sheet: null,
    modal: null,
    toasts: [],
  };
}

export let toastSeq = 0;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, nav: { tab: action.tab, stack: [] }, sheet: null };
    case "PUSH":
      return { ...state, nav: { ...state.nav, stack: [...state.nav.stack, { id: action.screen, params: action.params || {}, key: `${action.screen}-${Date.now()}` }] }, sheet: null };
    case "POP":
      return { ...state, nav: { ...state.nav, stack: state.nav.stack.slice(0, -1) } };
    case "OPEN_SHEET":
      return { ...state, sheet: { id: action.sheet, params: action.params || {}, snap: action.snap || "half" } };
    case "SNAP_SHEET":
      return state.sheet ? { ...state, sheet: { ...state.sheet, snap: action.snap } } : state;
    case "CLOSE_SHEET":
      return { ...state, sheet: null };
    case "OPEN_MODAL":
      return { ...state, modal: action.modal };
    case "CLOSE_MODAL":
      return { ...state, modal: null };
    case "TOAST":
      return { ...state, toasts: [{ id: ++toastSeq, ...action.toast }] }; // un seul toast à la fois : le dernier remplace le précédent
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "SET_PREF":
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case "SET_MAP_FILTER":
      return { ...state, mapFilter: { ...state.mapFilter, ...action.patch } };
    case "RESET_MAP_FILTER":
      return { ...state, mapFilter: DEFAULT_FILTER };
    case "SET_LIST_SORT":
      return { ...state, listSort: action.sort };
    case "MAP_FOCUS": // recherche : un lieu ou une alerte à montrer sur la carte (F3 : la zone suivie ne change pas)
      return { ...state, mapFocus: { ...action.focus, key: Date.now() }, nav: { tab: "map", stack: [] }, prefs: { ...state.prefs, homeView: "map" } };
    case "CLEAR_MAP_FOCUS":
      return { ...state, mapFocus: null };
    case "ADD_RECENT": { // F5 : 5 recherches récentes au plus, sur l'appareil seulement
      const list = (state.prefs.recentSearches || []).filter((r) => r.label !== action.item.label);
      return { ...state, prefs: { ...state.prefs, recentSearches: [action.item, ...list].slice(0, 5) } };
    }
    case "SET_DEMO":
      return { ...state, demo: { ...state.demo, [action.key]: action.value } };
    case "VOTE": {
      // R8 : un vote par utilisateur et par alerte, modifiable
      const prev = state.votes[action.alertId] || 0;
      const next = prev === action.value ? 0 : action.value;
      const alerts = state.alerts.map((a) => {
        if (a.id !== action.alertId) return a;
        let { votesUp, votesDown } = a;
        if (prev === 1) votesUp--;
        if (prev === -1) votesDown--;
        if (next === 1) votesUp++;
        if (next === -1) votesDown++;
        return { ...a, votesUp, votesDown };
      });
      // « Bien démarrer » : la première confirmation coche l'étape
      const prefs = next === 1 && !state.prefs.startVoted ? { ...state.prefs, startVoted: true } : state.prefs;
      return { ...state, alerts, prefs, votes: { ...state.votes, [action.alertId]: next } };
    }
    case "FOLLOW": // F-13 : suivre une alerte ; le premier choix devient le niveau proposé ensuite (5.11)
      return { ...state, follows: { ...state.follows, [action.alertId]: action.level }, prefs: { ...state.prefs, followAsked: true, followLevel: action.level } };
    case "UNFOLLOW": {
      const follows = { ...state.follows };
      delete follows[action.alertId];
      return { ...state, follows };
    }
    case "DRAFT_START":
      return state.draft ? state : { ...state, draft: { step: "type", photos: [], identity: state.prefs.lastIdentity || null, title: "", description: "" } };
    case "DRAFT_GO":
      return { ...state, draft: { ...state.draft, step: action.step } };
    case "DRAFT_SET":
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "DRAFT_PHOTO": // une photo du brouillon : ajout, progression, erreur, retrait
      return { ...state, draft: { ...state.draft, photos: action.remove ? state.draft.photos.filter((ph) => ph.id !== action.id) : state.draft.photos.some((ph) => ph.id === action.photo.id) ? state.draft.photos.map((ph) => (ph.id === action.photo.id ? { ...ph, ...action.photo } : ph)) : [...state.draft.photos, action.photo] } };
    case "DRAFT_RESET":
      return { ...state, draft: null };
    case "PUBLISH_ALERT": { // 6.9, 6.10 : l'alerte rejoint la carte, la liste et « Mes alertes » ; notification « Alerte publiée »
      const a = action.alert;
      const notif = { id: `n-${a.id}`, kind: "publiee", alertId: a.id, title: "Votre alerte a été publiée", body: a.title, ageMin: 0, read: false };
      return { ...state, alerts: [a, ...state.alerts], notifications: [notif, ...state.notifications], prefs: { ...state.prefs, startReported: true, lastIdentity: a.anonymous ? "anonymous" : "profile" }, draft: { ...state.draft, step: "done", publishedId: a.id } };
    }
    case "DELETE_ALERT": // R : l'auteur peut supprimer son alerte (confirmation obligatoire, PRD §10.2)
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.alertId ? { ...a, status: "supprimee" } : a)) };
    case "SPLASH_DONE":
      return state.prefs.onboardingSeen
        ? { ...state, session: { ...state.session, status: "auth" }, auth: { ...state.auth, step: "login" } }
        : { ...state, session: { ...state.session, status: "onboarding" }, onb: { step: "slides", slide: 0 } };
    case "ONB_GO":
      return { ...state, onb: { step: action.step, slide: action.slide ?? state.onb.slide, pending: action.pending ?? state.onb.pending }, sheet: null };
    case "SET_RADIUS":
      return { ...state, session: { ...state.session, position: { ...state.session.position, radiusKm: action.km } } };
    case "LOCATION_RESULT":
      return { ...state, session: { ...state.session, position: { ...state.session.position, permission: action.permission } } };
    case "SET_COMMUNE": {
      const c = COMMUNE_BY_ID[action.communeId];
      const coords = action.coords || { lat: c.lat, lng: c.lng };
      return { ...state, session: { ...state.session, position: { ...state.session.position, ...coords, source: action.source, communeId: c.id } } };
    }
    case "ONB_FINISH": {
      let position = { ...state.session.position, permission: action.permission || state.session.position.permission };
      if (action.communeId) {
        const c = COMMUNE_BY_ID[action.communeId];
        position = { ...position, ...(action.coords || { lat: c.lat, lng: c.lng }), source: action.source, communeId: c.id };
      }
      return { ...state, prefs: { ...state.prefs, onboardingSeen: true }, session: { ...state.session, status: "auth", position }, auth: { ...state.auth, step: "login" }, sheet: null };
    }
    case "AUTH_GO":
      return { ...state, auth: { ...state.auth, step: action.step } };
    case "AUTH_SET":
      return { ...state, auth: { ...state.auth, ...action.patch } };
    case "LOGIN": {
      const user = action.user || USERS.me;
      const toasts = action.message ? [...state.toasts, { id: ++toastSeq, text: action.message, tone: "success" }] : state.toasts;
      return { ...state, session: { ...state.session, status: "in", user, identity: action.identity, method: action.method }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, toasts };
    }
    case "GUEST":
      return { ...state, session: { ...state.session, status: "in", user: null, identity: "non_verifiee", method: "invite" }, nav: { tab: "map", stack: [] }, sheet: null };
    case "LOGOUT":
      return { ...state, session: { ...state.session, status: "auth", user: null, identity: "non_verifiee", method: null }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, modal: null };
    case "RESTART":
      return { ...state, prefs: action.onboarding ? { ...state.prefs, onboardingSeen: false, startHidden: false, startVoted: false } : state.prefs, session: { ...state.session, status: "splash", user: null, method: null, position: action.onboarding ? DEFAULT_POSITION : state.session.position }, auth: initialAuth(), nav: { tab: "map", stack: [] }, sheet: null, modal: null };
    case "SET_IDENTITY": {
      const identity = action.identity === "result" ? ({ reussie: "verifiee", en_cours: "en_cours", manuelle: "en_cours" }[state.auth.idResult] || state.session.identity) : action.identity;
      return { ...state, session: { ...state.session, identity } };
    }
    case "JUMP": { // panneau de démo « Écrans par phase » : ouvre directement un écran ou un état
      const base = { ...state, sheet: null, modal: null, toasts: [], mapFocus: null, demo: { ...DEFAULT_DEMO, timeSpeed: state.demo.timeSpeed } };
      const next = action.make(base);
      return { ...next, nav: { ...next.nav, jump: Date.now() } };
    }
    case "RESET":
      return { ...initialState(), prefs: state.prefs, session: state.session };
    default:
      return state;
  }
}

export interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const StoreContext = createContext<StoreValue>(null);

export const ClockContext = createContext<number>(BOOT_TIME);

export const useStore = () => useContext(StoreContext);

export const useNow = () => useContext(ClockContext);

/* Actions de haut niveau partagées par les écrans */
export function useActions() {
  const { dispatch } = useStore();
  return useMemo(() => ({
    setTab: (tab) => dispatch({ type: "SET_TAB", tab }),
    push: (screen: string, params?: Record<string, any>) => dispatch({ type: "PUSH", screen, params }),
    pop: () => dispatch({ type: "POP" }),
    openSheet: (sheet: string, params?: Record<string, any>, snap?: string) => dispatch({ type: "OPEN_SHEET", sheet, params, snap }),
    snapSheet: (snap) => dispatch({ type: "SNAP_SHEET", snap }),
    closeSheet: () => dispatch({ type: "CLOSE_SHEET" }),
    confirm: (modal) => dispatch({ type: "OPEN_MODAL", modal }),
    closeModal: () => dispatch({ type: "CLOSE_MODAL" }),
    toast: (text: string, opts: Record<string, any> = {}) => dispatch({ type: "TOAST", toast: { text, tone: "success", ...opts } }),
    setPref: (key, value) => dispatch({ type: "SET_PREF", key, value }),
    setDemo: (key, value) => dispatch({ type: "SET_DEMO", key, value }),
    vote: (alertId, value) => dispatch({ type: "VOTE", alertId, value }),
    reset: () => dispatch({ type: "RESET" }),
  }), [dispatch]);
}

/* Sélecteurs */
export function useVisibleAlerts() {
  const { state } = useStore();
  const now = useNow();
  return useMemo(() => {
    if (state.demo.emptyZone) return [];
    const base = state.demo.manyAlerts ? [...state.alerts, ...generateManyAlerts()] : state.alerts;
    return base.filter((a) => a.status === "active" && a.expiresAt > now);
  }, [state.alerts, state.demo.emptyZone, state.demo.manyAlerts, now]);
}
