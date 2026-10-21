import { useEffect, useRef } from "react";
import { cx } from "@/utils/index";

export interface ConfirmModalProps {
  modal: any;
  onClose: (...args: any[]) => any;
}

export function ConfirmModal({ modal, onClose }: ConfirmModalProps) {
  const firstRef = useRef(null);
  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
        <h3 id="modal-title">{modal.title}</h3>
        {modal.body ? <p id="modal-body">{modal.body}</p> : null}
        <div className="actions">
          <button ref={firstRef} type="button" className="btn btn-secondary" onClick={() => { onClose(); modal.onCancel?.(); }}>{modal.cancelLabel || "Annuler"}</button>
          <button type="button" className={cx("btn", modal.destructive ? "btn-destructive" : "btn-primary")} onClick={() => { onClose(); modal.onConfirm?.(); }}>{modal.confirmLabel || "Confirmer"}</button>
        </div>
      </div>
    </div>
  );
}
