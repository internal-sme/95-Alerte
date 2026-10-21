import { Fragment, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/IconButton";
import { SNAP_HEIGHTS } from "@/navigation/constants";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

export interface BottomSheetProps {
  snap?: any;
  onSnap: (...args: any[]) => any;
  onClose?: (...args: any[]) => any;
  title: ReactNode;
  subtitle?: ReactNode;
  modal?: boolean;
  children: ReactNode;
  dismissible?: boolean;
  peek?: any;
  half?: any;
  headerAction?: ReactNode;
}

export function BottomSheet({ snap = "half", onSnap, onClose, title, subtitle, modal, children, dismissible = true, peek = SNAP_HEIGHTS.peek, half = SNAP_HEIGHTS.half, headerAction }: BottomSheetProps) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [dragH, setDragH] = useState(null);
  const parentH = () => ref.current?.parentElement?.clientHeight || 700;
  const heightFor = (s) => (s === "peek" ? peek : (s === "half" ? half : SNAP_HEIGHTS[s]) * parentH());
  const order = ["peek", "half", "full"];

  useEffect(() => {
    if (!modal) return undefined;
    const onKey = (e) => { if (e.key === "Escape" && dismissible) onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, dismissible, onClose]);

  const onPointerDown = (e) => {
    drag.current = { y: e.clientY, h: heightFor(snap), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dy = drag.current.y - e.clientY;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    setDragH(Math.max(60, Math.min(parentH() * 0.95, drag.current.h + dy)));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    const { moved } = drag.current;
    const h = dragH;
    drag.current = null;
    setDragH(null);
    if (!moved || h == null) { cycle(); return; }
    if (h < heightFor("peek") * 0.6 && dismissible) { onClose?.(); return; }
    const nearest = order.reduce((best, s) => (Math.abs(heightFor(s) - h) < Math.abs(heightFor(best) - h) ? s : best), "peek");
    onSnap?.(nearest);
  };
  const cycle = () => onSnap?.(order[(order.indexOf(snap) + 1) % order.length]);
  const onHandleKey = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onSnap?.(order[Math.min(2, order.indexOf(snap) + 1)]); }
    if (e.key === "ArrowDown") { e.preventDefault(); const i = order.indexOf(snap); if (i === 0 && dismissible) onClose?.(); else onSnap?.(order[Math.max(0, i - 1)]); }
  };

  const height = dragH != null ? dragH : heightFor(snap);
  return (
    <Fragment>
      {modal && snap !== "peek" ? <div className="bs-scrim" onClick={dismissible ? onClose : undefined} aria-hidden="true" /> : null}
      <section ref={ref} className={cx("bs", dragH != null && "is-dragging")} style={{ height }} role={modal ? "dialog" : "region"} aria-label={typeof title === "string" && title ? title : "Panneau"} aria-modal={modal || undefined}>
        <button type="button" className="bs-handle" aria-label={`Panneau ${snap === "full" ? "agrandi" : snap === "half" ? "à moitié" : "réduit"} : glisser ou utiliser les flèches pour redimensionner`}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onHandleKey}>
          <span />
        </button>
        {title || headerAction || (modal && dismissible) ? (
          <div className="bs-head">
            {title && subtitle ? <div className="bs-titles"><h2>{title}</h2><p>{subtitle}</p></div> : title ? <h2>{title}</h2> : <span style={{ flex: 1 }} />}
            {headerAction}
            {modal && dismissible ? <IconButton icon="x" label="Fermer" onClick={onClose} style={{ boxShadow: "none", width: 40, height: 40 }} /> : null}
          </div>
        ) : null}
        <div className="bs-body">{children}</div>
      </section>
    </Fragment>
  );
}
