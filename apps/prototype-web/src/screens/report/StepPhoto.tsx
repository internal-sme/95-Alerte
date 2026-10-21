import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { CATEGORY_BY_ID, SEED_ALERTS } from "@/data/seed";
import { CameraOverlay } from "@/screens/report/CameraOverlay";
import { PhotoThumb } from "@/screens/report/PhotoThumb";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { MAX_PHOTOS, demoGallery } from "@/screens/report/report";
import { useActions, useStore } from "@/store/store";
import { motionReduced } from "@/utils/index";
import type { Draft } from "@/types";

export interface StepPhotoProps {
  d?: Draft;
  next?: () => void;
}

export function StepPhoto({ d, next }: StepPhotoProps) {
  const { state, dispatch } = useStore();
  const { toast, openSheet } = useActions();
  const [camera, setCamera] = useState(!!d.camera);
  useEffect(() => { if (d.camera) dispatch({ type: "DRAFT_SET", patch: { camera: false } }); }, []);
  const photos = d.photos;
  const uploading = photos.some((ph) => ph.status === "uploading");
  const cat = CATEGORY_BY_ID[d.categoryId];
  const suggested = demoGallery().find((k) => { const id = k.split("-")[0]; const a = SEED_ALERTS.find((x) => x.id === id); return a && a.categoryId === d.categoryId; }) || demoGallery()[0];
  const add = (key) => { if (photos.length >= MAX_PHOTOS) return; dispatch({ type: "DRAFT_PHOTO", photo: { id: `ph-${Date.now()}`, key, status: "uploading", progress: 0 } }); };
  // Envoi simulé : compression puis envoi ; échec si le mode démo « erreur réseau » est actif
  useEffect(() => {
    if (!uploading) return undefined;
    const t = setInterval(() => {
      photos.filter((ph) => ph.status === "uploading").forEach((ph) => {
        const progress = Math.min(100, ph.progress + 20);
        if (state.demo.networkError && progress >= 60) { dispatch({ type: "DRAFT_PHOTO", photo: { id: ph.id, status: "error", progress } }); toast("L'envoi de la photo a échoué. Vérifiez votre connexion.", { tone: "info" }); return; }
        dispatch({ type: "DRAFT_PHOTO", photo: { id: ph.id, progress, status: progress >= 100 ? "done" : "uploading" } });
        if (progress >= 100) toast("Photo ajoutée.");
      });
    }, motionReduced() ? 60 : 260);
    return () => clearInterval(t);
  }, [uploading, photos, state.demo.networkError]);
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Ajoutez une photo</h2>
        <p className="report-lead">Facultatif. Une photo aide le service à comprendre la situation{cat.family === "incident" ? ", mais ne vous mettez pas en danger pour la prendre" : ""}.</p>
        {photos.length ? (
          <div className="photo-grid">
            {photos.map((ph) => <PhotoThumb key={ph.id} ph={ph} onRemove={() => dispatch({ type: "DRAFT_PHOTO", remove: true, id: ph.id })} onRetry={() => dispatch({ type: "DRAFT_PHOTO", photo: { id: ph.id, status: "uploading", progress: 0 } })} />)}
          </div>
        ) : null}
        {photos.length < MAX_PHOTOS ? (
          <div className="photo-actions">
            <Button variant="secondary" icon="camera" onClick={() => setCamera(true)}>Prendre une photo</Button>
            <Button variant="secondary" icon="image" onClick={() => openSheet("report-gallery", {})}>Choisir dans la galerie</Button>
          </div>
        ) : <p className="report-lead">{MAX_PHOTOS} photos au plus : retirez-en une pour en ajouter une autre.</p>}
        <p className="demo-note">Prototype : l'appareil photo et la galerie sont simulés avec des photos de démonstration.</p>
      </div>
      <ReportFooter><Button block disabled={uploading} onClick={next}>{uploading ? "Envoi en cours…" : photos.length ? "Continuer" : "Continuer sans photo"}</Button></ReportFooter>
      {camera ? <CameraOverlay photoKey={suggested} onClose={() => setCamera(false)} onShoot={() => { add(suggested); setCamera(false); }} /> : null}
    </Fragment>
  );
}
