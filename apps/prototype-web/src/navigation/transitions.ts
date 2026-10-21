import { useCallback } from "react";
import { flushSync } from "react-dom";
import { motionReduced } from "@/utils/index";

/* Transitions entre écrans : « smart animate » (View Transitions API). Les éléments présents des deux côtés
   portent un view-transition-name (titre d'en-tête, barre d'étapes, bouton principal, barre d'onglets) et se
   déforment d'un écran à l'autre ; le reste se fond. Sans l'API ou avec les animations réduites : changement direct. */
export const SCREEN_ACTIONS = new Set(["AUTH_GO", "LOGIN", "GUEST", "LOGOUT", "SET_TAB", "PUSH", "POP", "ONB_GO", "ONB_FINISH", "DRAFT_GO"]);

export function useScreenTransitions(rawDispatch) {
  return useCallback((action) => {
    const changesScreen = SCREEN_ACTIONS.has(action.type) || (action.type === "AUTH_SET" && action.patch && action.patch.step);
    if (!changesScreen || !document.startViewTransition || motionReduced()) return rawDispatch(action);
    document.startViewTransition(() => flushSync(() => rawDispatch(action)));
  }, [rawDispatch]);
}
