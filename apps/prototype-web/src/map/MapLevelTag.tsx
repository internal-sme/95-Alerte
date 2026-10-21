import type { ReactNode } from "react";
export interface MapLevelTagProps {
  text: ReactNode;
  scale: any;
}

export function MapLevelTag({ text, scale }: MapLevelTagProps) {
  // Échelle : 1 km, 500 m ou 5 km selon le zoom, pour une barre de 40 à 90 px
  const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10];
  const km = steps.find((k) => k * scale >= 40) || 10;
  return (
    <div className="map-level" aria-live="polite">
      <span>{text}</span>
      <span className="map-scale" aria-label={`Échelle : ${km < 1 ? `${km * 1000} m` : `${km} km`}`}><i style={{ width: km * scale }} />{km < 1 ? `${km * 1000} m` : `${km} km`}</span>
    </div>
  );
}
