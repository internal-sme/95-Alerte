import { useEffect, useRef, useState } from "react";
import { BOOT_TIME } from "@/data/seed";
import { PREFS_KEY } from "@/store/store";
import { storage } from "@/utils/index";

export function useClock(speed) {
  const [now, setNow] = useState(BOOT_TIME);
  const last = useRef(Date.now());
  useEffect(() => {
    last.current = Date.now();
    const interval = speed > 1 ? 1000 : 15000;
    const id = setInterval(() => {
      const t = Date.now();
      const dt = t - last.current;
      last.current = t;
      setNow((n) => n + dt * speed);
    }, interval);
    return () => clearInterval(id);
  }, [speed]);
  return now;
}

export function usePrefsEffects(prefs) {
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", prefs.theme);
    root.style.setProperty("--text-scale", `${prefs.textScale}%`);
    if (prefs.highContrast) root.setAttribute("data-contrast", "high"); else root.removeAttribute("data-contrast");
    if (prefs.reduceMotion) root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
    storage.set(PREFS_KEY, prefs);
  }, [prefs]);
}
