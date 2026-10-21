import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { StepProgress } from "@/screens/onboarding/StepProgress";
import { useActions, useStore } from "@/store/store";
import { cx } from "@/utils/index";

/* Après l'onboarding (Citizen, Blinkist, Evernote) : « Bien démarrer », trois premières actions, fermable */
export interface StartChecklistProps {
  onConfirm: (...args: any[]) => any;
}

export function StartChecklist({ onConfirm }: StartChecklistProps) {
  const { state, dispatch } = useStore();
  const { push, toast } = useActions();
  const items = [
    { id: "zone", label: "Choisir votre zone", done: state.session.position.source !== "default", act: () => push("commune") },
    { id: "vote", label: "Confirmer une alerte utile", done: !!state.prefs.startVoted, act: onConfirm },
    { id: "report", label: "Faire votre premier signalement", done: !!state.prefs.startReported, act: () => push("report") },
  ];
  const done = items.filter((x) => x.done).length;
  if (state.prefs.startHidden || done === items.length) return null;
  const hide = () => { dispatch({ type: "SET_PREF", key: "startHidden", value: true }); toast("Vous retrouverez ces conseils dans le profil."); };
  return (
    <section className="start-card" aria-label="Bien démarrer">
      <div className="sc-head"><b>Bien démarrer</b><small>{done}/{items.length}</small><IconButton icon="x" label="Masquer « Bien démarrer »" onClick={hide} /></div>
      <StepProgress step={done} total={items.length} />
      <ul>{items.map((x) => (
        <li key={x.id} className={cx(x.done && "done")}><button type="button" disabled={x.done} onClick={x.act}><Icon name={x.done ? "check-circle-fill" : "circle"} />{x.label}{x.done ? null : <Icon name="caret-right" className="ph-sm" />}</button></li>
      ))}</ul>
    </section>
  );
}
