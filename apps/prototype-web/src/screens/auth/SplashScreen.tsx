import { Fragment, useEffect, useRef, useState } from "react";
import { ASSETS } from "@/assets";
import { Logo95 } from "@/components/Logo95";
import { Spinner } from "@/components/Spinner";
import { GIF_LOGO_BOX, splashMemory } from "@/screens/auth/auth";
import { useStore } from "@/store/store";
import { cx, motionReduced } from "@/utils/index";

export function SplashScreen() {
  const { dispatch } = useStore();
  const [phase, setPhase] = useState("bg");
  const logoRef = useRef(null);
  useEffect(() => {
    const [toLogo, toLoad, toExit] = motionReduced() ? [0, 400, 1600] : [700, 3700, 4900];
    const ids = [
      setTimeout(() => setPhase("logo"), toLogo),
      setTimeout(() => setPhase("load"), toLoad),
      setTimeout(() => {
        const box = logoRef.current;
        const gif = box && box.querySelector(".splash-gif");
        const svg = box && box.querySelector(".splash-svg");
        if (gif && gif.offsetParent) {
          const r = gif.getBoundingClientRect();
          splashMemory.logoRect = { x: r.x + r.width * GIF_LOGO_BOX.x, y: r.y + r.height * GIF_LOGO_BOX.y, w: r.width * GIF_LOGO_BOX.w, h: r.height * GIF_LOGO_BOX.h };
        } else if (svg) {
          const r = svg.getBoundingClientRect();
          splashMemory.logoRect = { x: r.x, y: r.y, w: r.width, h: r.height };
        }
        dispatch({ type: "SPLASH_DONE" });
      }, toExit),
    ];
    return () => ids.forEach(clearTimeout);
  }, [dispatch]);
  return (
    <div className={cx("splash", `is-${phase}`)} role="status" aria-label="Chargement de 95 Alerte">
      <div className="splash-halo" aria-hidden="true" />
      <div className="splash-center">
        <div className="splash-logo" ref={logoRef}>
          {phase !== "bg" ? (
            <Fragment>
              {ASSETS.SPLASH_GIF ? <img className="splash-gif" src={ASSETS.SPLASH_GIF} alt="" width="260" height="260" /> : null}
              <Logo95 width={209} className="splash-svg" />
            </Fragment>
          ) : null}
        </div>
      </div>
      <div className="splash-foot" aria-hidden={phase !== "load"}><Spinner /><span>Chargement des alertes du Val-d'Oise…</span></div>
    </div>
  );
}
