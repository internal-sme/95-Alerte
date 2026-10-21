import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Spot } from "@/components/Spot";
import { ALERT_PHOTOS } from "@/data/photos";
import { CAMERA_STATES, captureFrame, detectCamera } from "@/screens/report/report";
import { useStore } from "@/store/store";
import type { CameraMode } from "@/types";

export interface CameraOverlayProps {
  photoKey: string;
  onShoot: (shot: { key?: string; src?: string }) => void;
  onClose: () => void;
  onGallery: () => void;
  forced: CameraMode | null;
}

export function CameraOverlay({ photoKey, onShoot, onClose, onGallery, forced }: CameraOverlayProps) {
  const { state } = useStore();
  const [mode, setMode] = useState(forced || "detecting"); // detecting · asking · live · denied · unavailable · simulated
  const [attempt, setAttempt] = useState(0);
  const video = useRef(null);
  const stream = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    if (forced) return undefined;
    let cancelled = false;
    (async () => {
      if (state.demo.cameraDenied) { setMode("denied"); return; }
      if ((await detectCamera()) !== "available") { if (!cancelled) setMode("simulated"); return; }
      if (cancelled) return;
      setMode("asking");
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        setMode("live");
      } catch (e) {
        if (cancelled) return;
        if (e.name === "NotAllowedError" || e.name === "SecurityError") setMode("denied");
        else if (e.name === "NotFoundError" || e.name === "OverconstrainedError" || e.name === "NotSupportedError") setMode("simulated");
        else setMode("unavailable");
      }
    })();
    return () => { cancelled = true; if (stream.current) { stream.current.getTracks().forEach((t) => t.stop()); stream.current = null; } };
  }, [forced, attempt, state.demo.cameraDenied]);
  useEffect(() => {
    if (mode === "live" && video.current && stream.current) { video.current.srcObject = stream.current; video.current.play().catch(() => {}); }
  }, [mode]);
  const shoot = () => {
    if (mode === "live") { const v = video.current; if (v && v.videoWidth) onShoot({ src: captureFrame(v) }); return; }
    onShoot({ key: photoKey });
  };
  const info = CAMERA_STATES[mode];
  const canShoot = mode === "live" || mode === "simulated";
  return (
    <div className="camera" role="dialog" aria-modal="true" aria-label={mode === "simulated" ? "Appareil photo (simulé)" : "Appareil photo"}>
      {mode === "live" ? <video ref={video} className="camera-view" autoPlay playsInline muted aria-label="Aperçu de l'appareil photo" /> : null}
      {mode === "simulated" ? (ALERT_PHOTOS[photoKey] ? <img src={ALERT_PHOTOS[photoKey]} alt="" className="camera-view" /> : <span className="camera-view" />) : null}
      {canShoot ? (
        <p className="camera-tip"><Icon name="info" /><span>Photographiez le problème ou le lieu. Évitez les visages et les plaques d'immatriculation.{mode === "simulated" ? <small>Aucun appareil photo accessible ici : photo de démonstration.</small> : null}</span></p>
      ) : null}
      {info ? (
        <div className="camera-state" role={mode === "asking" ? "status" : "alert"}>
          <Spot icon={info.icon} tone="neutral" />
          <h2>{info.title}</h2>
          <p>{info.text}</p>
          {mode === "denied" || mode === "unavailable" ? (
            <div className="camera-actions">
              {mode === "unavailable" ? <Button block icon="arrows-clockwise" onClick={() => { setMode("detecting"); setAttempt((n) => n + 1); }}>Réessayer</Button> : null}
              <Button block variant={mode === "unavailable" ? "secondary" : "primary"} icon="image" onClick={onGallery}>Choisir dans la galerie</Button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="camera-bar">
        <button type="button" className="btn btn-tertiary camera-cancel" onClick={onClose}>Annuler</button>
        {canShoot ? <button type="button" className="shutter" aria-label="Prendre la photo" onClick={shoot}><span /></button> : <span />}
        <span className="camera-spacer" />
      </div>
    </div>
  );
}
