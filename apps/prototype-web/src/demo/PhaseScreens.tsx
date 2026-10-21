import { Fragment, useState } from "react";
import { ListItem } from "@/components/ListItem";
import { PHASE_SCREENS, TEST_SCENARIOS } from "@/demo/catalog";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";

export interface PhaseScreensProps {
  onJump: (...args: any[]) => any;
}

export function PhaseScreens({ onJump }: PhaseScreensProps) {
  const { dispatch } = useStore();
  const lastDone = PHASE_SCREENS.filter((p) => p.items.length).slice(-1)[0].n;
  const [n, setN] = useState(lastDone);
  const phase = PHASE_SCREENS[n];
  return (
    <section className="phase-screens" aria-labelledby="ps-title">
      <p className="section-label" id="ps-title">Écrans par phase</p>
      <div className="phase-tabs" role="group" aria-label="Choisir une phase">
        {PHASE_SCREENS.map((p) => (
          <button key={p.n} type="button" className={cx("phase-tab", !p.items.length && "is-todo")} aria-pressed={p.n === n} onClick={() => setN(p.n)}
            aria-label={`Phase ${p.n} : ${p.title}${p.items.length ? "" : " (à venir)"}`}>{p.n}</button>
        ))}
      </div>
      <p className="phase-name"><b>Phase {phase.n} · {phase.title}</b>{phase.items.length ? `${phase.items.length} écrans et états` : "À venir"}</p>
      {phase.items.length ? (
        <div className="list phase-list">
          {phase.items.map(([label, make]) => (
            <ListItem key={label} icon="play" label={label} onClick={() => { dispatch({ type: "JUMP", make }); onJump(); }} />
          ))}
        </div>
      ) : phase.scenarios ? (
        <Fragment>
          <p className="demo-note">Les scénarios du PRD seront jouables de bout en bout à la dernière phase, une fois tous les écrans réalisés.</p>
          <div className="list phase-list">
            {TEST_SCENARIOS.map(([id, label]) => <ListItem key={id} icon="path" label={<Fragment>{id} · {label}<small className="li-sub">Phase 10</small></Fragment>} value="À venir" chevron={false} />)}
          </div>
        </Fragment>
      ) : <p className="demo-note">Les écrans de cette phase apparaîtront ici dès qu'ils seront réalisés.</p>}
    </section>
  );
}
