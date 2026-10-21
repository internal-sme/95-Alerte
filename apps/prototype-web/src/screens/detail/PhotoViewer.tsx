import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/IconButton";
import { alertPhotos } from "@/data/photos";
import { DetailState } from "@/screens/detail/DetailState";
import { PageDots } from "@/screens/onboarding/PageDots";
import { useActions, useStore } from "@/store/store";

/* 5.3 : visionneuse plein écran — balayage, flèches, Échap ; texte alternatif lu et affiché */
export interface PhotoViewerProps {
  id?: string;
  index?: number;
}

export function PhotoViewer({ id, index = 0 }: PhotoViewerProps) {
  const { state } = useStore();
  const { pop } = useActions();
  const alert = state.alerts.find((a) => a.id === id);
  const photos = alert ? alertPhotos(alert) : [];
  const [i, setI] = useState(index);
  const start = useRef(null);
  const go = (d) => setI((v) => Math.min(photos.length - 1, Math.max(0, v + d)));
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") pop(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);
  if (!photos.length) return <DetailState icon="images" title="Photo indisponible">Cette photo n'a pas pu être chargée.</DetailState>;
  const ph = photos[i];
  return (
    <div className="photo-viewer" role="dialog" aria-modal="true" aria-label={`Photo ${i + 1} sur ${photos.length}`}
      onPointerDown={(e) => { start.current = e.clientX; }} onPointerUp={(e) => { if (start.current != null && Math.abs(e.clientX - start.current) > 56) go(e.clientX < start.current ? 1 : -1); start.current = null; }}>
      <div className="pv-top">
        <span aria-live="polite">{i + 1} sur {photos.length}</span>
        <IconButton icon="x" label="Fermer la photo" onClick={pop} />
      </div>
      <img src={ph.src} alt={ph.alt} />
      <p className="pv-caption">{ph.alt}</p>
      {photos.length > 1 ? (
        <div className="pv-nav">
          <IconButton icon="caret-left" label="Photo précédente" onClick={() => go(-1)} disabled={i === 0} />
          <PageDots count={photos.length} index={i} />
          <IconButton icon="caret-right" label="Photo suivante" onClick={() => go(1)} disabled={i === photos.length - 1} />
        </div>
      ) : null}
    </div>
  );
}
