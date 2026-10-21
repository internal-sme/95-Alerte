import { Fragment, useMemo, useReducer } from "react";
import { Banner } from "@/components/Banner";
import { Icon } from "@/components/Icon";
import { DemoPanel } from "@/demo/DemoPanel";
import { BottomSheet } from "@/navigation/BottomSheet";
import { ConfirmModal } from "@/navigation/ConfirmModal";
import { TabBar } from "@/navigation/TabBar";
import { ToastHost } from "@/navigation/ToastHost";
import { SHEETS, STACK_SCREENS, TAB_SCREENS } from "@/navigation/routes";
import { useScreenTransitions } from "@/navigation/transitions";
import { AuthFlow } from "@/screens/auth/AuthFlow";
import { SplashScreen } from "@/screens/auth/SplashScreen";
import { OnboardingFlow } from "@/screens/onboarding/OnboardingFlow";
import { useClock, usePrefsEffects } from "@/store/effects";
import { ClockContext, StoreContext, initialState, reducer } from "@/store/store";
import { cx, fmtClock } from "@/utils/index";

export function App() {
  const [state, rawDispatch] = useReducer(reducer, undefined, initialState);
  const dispatch = useScreenTransitions(rawDispatch);
  const now = useClock(state.demo.timeSpeed);
  usePrefsEffects(state.prefs);
  const store = useMemo(() => ({ state, dispatch }), [state]);

  const TabScreen = TAB_SCREENS[state.nav.tab];
  const top = state.nav.stack[state.nav.stack.length - 1];
  const topDef = top ? STACK_SCREENS[top.id] : null;
  const hideTabbar = topDef?.modal;
  const sheetDef = state.sheet && SHEETS[state.sheet.id];

  return (
    <StoreContext.Provider value={store}>
      <ClockContext.Provider value={now}>
        <div className="stage">
          <div className="device">
            <div className="app">
              <div className="statusbar" aria-hidden="true">
                <span>{fmtClock(now)}</span>
                <span className="sb-icons"><Icon name="cell-signal-full" />{state.demo.offline ? <Icon name="wifi-slash" /> : <Icon name="wifi-high" />}<Icon name="battery-full" /></span>
              </div>
              {state.demo.offline ? <Banner tone="offline" className="global-banner" title="Vous êtes actuellement hors connexion.">Les fonctionnalités dépendantes du réseau sont désactivées.</Banner> : null}
              {state.session.status !== "in" ? (
                <main className="screen-area">
                  {state.session.status === "splash" ? <SplashScreen /> : state.session.status === "onboarding" ? <OnboardingFlow /> : <AuthFlow />}
                  {sheetDef ? (
                    <BottomSheet modal snap={state.sheet.snap} title={typeof sheetDef.title === "function" ? sheetDef.title(state.sheet.params) : sheetDef.title} subtitle={sheetDef.subtitle?.(state.sheet.params, state)} onSnap={(s) => dispatch({ type: "SNAP_SHEET", snap: s })} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
                      <sheetDef.component {...state.sheet.params} />
                    </BottomSheet>
                  ) : null}
                </main>
              ) : (
              <Fragment>
              <main className="screen-area">
                <TabScreen key={state.nav.jump || 0} />
                {state.nav.stack.map((s) => {
                  const def = STACK_SCREENS[s.id];
                  const C = def.component;
                  return <div key={s.key} className={cx("stack-layer", def.modal && "is-modal")}><C {...s.params} /></div>;
                })}
                {sheetDef ? (
                  <BottomSheet modal snap={state.sheet.snap} title={typeof sheetDef.title === "function" ? sheetDef.title(state.sheet.params) : sheetDef.title} subtitle={sheetDef.subtitle?.(state.sheet.params, state)} onSnap={(s) => dispatch({ type: "SNAP_SHEET", snap: s })} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
                    <sheetDef.component {...state.sheet.params} />
                  </BottomSheet>
                ) : null}
              </main>
              {!hideTabbar && !state.prefs.reportHintSeen && !state.nav.stack.length ? (
                <button type="button" className="report-hint" onClick={() => dispatch({ type: "SET_PREF", key: "reportHintSeen", value: true })} aria-label="Signalez un événement ici. Fermer l'aide">
                  <span className="tooltip coach"><b>Astuce · 1/1</b>Signalez un événement ici</span>
                </button>
              ) : null}
              {hideTabbar ? null : <TabBar />}
              </Fragment>
              )}
              <ToastHost hasTabbar={state.session.status === "in" && !hideTabbar} />
              {state.modal ? <ConfirmModal modal={state.modal} onClose={() => dispatch({ type: "CLOSE_MODAL" })} /> : null}
            </div>
          </div>
        </div>
        <DemoPanel />
      </ClockContext.Provider>
    </StoreContext.Provider>
  );
}
