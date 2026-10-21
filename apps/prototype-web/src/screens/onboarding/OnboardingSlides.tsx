import { Fragment, useRef } from "react";
import { Button } from "@/components/Button";
import { useSplashHandoff } from "@/screens/auth/auth";
import { OnboardingTop } from "@/screens/onboarding/OnboardingTop";
import { PageDots } from "@/screens/onboarding/PageDots";
import { ONB_PHOTOS, ONB_SLIDES } from "@/screens/onboarding/onboarding";
import { MAP_ART } from "@/screens/tabs/mapArt";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";

/* UI-002 → UI-005 : 3 pages, « Passer » toujours visible, CTA immobile, balayage et clavier */
export function OnboardingSlides() {
  const { state, dispatch } = useStore();
  const i = state.onb.slide;
  const s = ONB_SLIDES[i];
  const last = i === ONB_SLIDES.length - 1;
  const logoRef = useRef(null);
  const screenRef = useRef(null);
  const startX = useRef(null);
  useSplashHandoff(logoRef, screenRef, ".onb-skip, .onb-title, .onb-text, .onb .screen-footer");
  const go = (n) => { if (n >= 0 && n < ONB_SLIDES.length && n !== i) dispatch({ type: "ONB_GO", step: "slides", slide: n }); };
  const next = () => (last ? dispatch({ type: "ONB_GO", step: "location" }) : go(i + 1));
  const onKey = (e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); };
  const photo = ONB_PHOTOS[i + 1];
  return (
    <div className="screen auth onb onb-hero" ref={screenRef} onKeyDown={onKey}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => { if (startX.current === null) return; const dx = e.clientX - startX.current; startX.current = null; if (dx < -50) go(i + 1); if (dx > 50) go(i - 1); }}>
      <div className={cx("hero-media", photo && "has-photo")}>
        {photo ? <img className="hero-photo" src={photo} alt={s.alt} /> : <Fragment><div className="map95">{MAP_ART}</div><div className="hero-halo" /></Fragment>}
      </div>
      <OnboardingTop logoRef={logoRef} onMedia onSkip={() => dispatch({ type: "ONB_GO", step: "location" })} />
      <section className="hero-sheet" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${ONB_SLIDES.length}`}>
        <h1 className="onb-title">{s.title[0]}<mark className="hl">{s.title[1]}</mark>{s.title[2] || ""}</h1>
        <p className="onb-text">{s.text}</p>
      </section>
      <div className="screen-footer stack-footer">
        <PageDots count={ONB_SLIDES.length} index={i} />
        <Button block onClick={next}>{last ? "Commencer" : "Suivant"}</Button>
      </div>
    </div>
  );
}
