import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store/store";
import { cx } from "@/utils/index";

export interface ToastHostProps {
  hasTabbar: any;
}

export function ToastHost({ hasTabbar }: ToastHostProps) {
  const { state, dispatch } = useStore();
  useEffect(() => {
    const timers = state.toasts.filter((t) => t.tone !== "error").map((t) => setTimeout(() => dispatch({ type: "DISMISS_TOAST", id: t.id }), 4000));
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);
  return (
    <div className={cx("toast-host", !hasTabbar && "no-tabbar")}>
      <div aria-live="polite" style={{ display: "contents" }}>
        {state.toasts.filter((t) => t.tone !== "error").map((t) => (
          <div key={t.id} className={cx("toast", t.tone === "info" && "is-info")} role="status"><Icon name={t.tone === "info" ? "info-fill" : "check-circle-fill"} />{t.text}</div>
        ))}
      </div>
      <div aria-live="assertive" style={{ display: "contents" }}>
        {state.toasts.filter((t) => t.tone === "error").map((t) => (
          <div key={t.id} className="toast is-error" role="alert">
            <Icon name="warning-fill" />{t.text}
            <button type="button" className="toast-action" onClick={() => { dispatch({ type: "DISMISS_TOAST", id: t.id }); t.onAction?.(); }}>{t.actionLabel || "OK"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
