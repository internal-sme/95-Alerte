import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { ALERT_PHOTOS } from "@/data/photos";

export interface CameraOverlayProps {
  photoKey: any;
  onShoot: (...args: any[]) => any;
  onClose: (...args: any[]) => any;
}

export function CameraOverlay({ photoKey, onShoot, onClose }: CameraOverlayProps) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="camera" role="dialog" aria-modal="true" aria-label="Appareil photo (simulé)">
      {ALERT_PHOTOS[photoKey] ? <img src={ALERT_PHOTOS[photoKey]} alt="" className="camera-view" /> : <span className="camera-view" />}
      <p className="camera-tip"><Icon name="info" />Photographiez le problème ou le lieu. Évitez les visages et les plaques d'immatriculation.</p>
      <div className="camera-bar">
        <button type="button" className="btn btn-tertiary camera-cancel" onClick={onClose}>Annuler</button>
        <button type="button" className="shutter" aria-label="Prendre la photo" onClick={onShoot}><span /></button>
        <span className="camera-spacer" />
      </div>
    </div>
  );
}
