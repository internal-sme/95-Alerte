import { Fragment, useCallback, useEffect } from "react";
import { IconButton } from "@/components/IconButton";
import { Stepper } from "@/components/Stepper";
import { ScreenHeader } from "@/navigation/ScreenHeader";
import { GuestGate } from "@/screens/auth/GuestGate";
import { SIGN_IN_REASONS } from "@/screens/detail/detail";
import { ReportOutcome } from "@/screens/report/ReportOutcome";
import { ReportResume } from "@/screens/report/ReportResume";
import { REPORT_STEPS, REPORT_STEP_VIEWS } from "@/screens/report/report";
import { useActions, useStore } from "@/store/store";
import { cx } from "@/utils/index";

export function ReportScreen() {
  const { state, dispatch } = useStore();
  const { pop, toast, confirm } = useActions();
  const d = state.draft;
  useEffect(() => { if (state.session.user && !state.draft) dispatch({ type: "DRAFT_START" }); }, []);
  const set = useCallback((patch) => dispatch({ type: "DRAFT_SET", patch }), [dispatch]);
  if (!state.session.user) {
    return (
      <div className="screen">
        <ScreenHeader title="Signaler" close onBack={pop} />
        <div className="screen-pad"><GuestGate icon="plus" title="Connectez-vous pour signaler" text={SIGN_IN_REASONS.report.text} /></div>
      </div>
    );
  }
  if (!d) return <div className="screen report-flow" />;
  const idx = REPORT_STEPS.findIndex((s) => s.id === d.step);
  const inSteps = idx >= 0;
  const go = (step) => dispatch({ type: "DRAFT_GO", step });
  const started = !!(d.type || d.categoryId);
  const quit = () => {
    if (d.step === "done" || !started) { dispatch({ type: "DRAFT_RESET" }); pop(); return; }
    confirm({
      title: "Quitter le signalement ?",
      body: "Gardez votre brouillon pour le reprendre plus tard, ou abandonnez-le.",
      confirmLabel: "Garder le brouillon", cancelLabel: "Abandonner",
      onConfirm: () => { dispatch({ type: "DRAFT_SET", patch: { saved: true } }); pop(); toast("Brouillon gardé. Vous le retrouverez au prochain signalement."); },
      onCancel: () => { dispatch({ type: "DRAFT_RESET" }); pop(); toast("Signalement abandonné.", { tone: "info" }); },
    });
  };
  const back = () => (idx > 0 ? go(REPORT_STEPS[idx - 1].id) : quit());
  const View = REPORT_STEP_VIEWS[d.step];
  return (
    <div className={cx("screen", "report-flow", d.step === "place" && "is-place")}>
      <header className="screen-header">
        {inSteps && !d.saved ? <IconButton icon="caret-left" label={idx > 0 ? "Étape précédente" : "Quitter"} onClick={back} /> : <span />}
        <h1>Signaler</h1>
        {d.step === "publishing" ? <span /> : <IconButton icon="x" label={d.step === "done" ? "Fermer" : "Quitter le signalement"} onClick={quit} />}
      </header>
      {d.saved ? <ReportResume d={d} /> : inSteps ? (
        <Fragment>
          <div className="report-progress"><Stepper step={idx + 1} total={REPORT_STEPS.length} label={REPORT_STEPS[idx].label} /></div>
          <View d={d} set={set} go={go} next={() => go(REPORT_STEPS[idx + 1].id)} />
        </Fragment>
      ) : <ReportOutcome d={d} />}
    </div>
  );
}
