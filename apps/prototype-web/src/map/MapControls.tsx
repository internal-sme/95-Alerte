import { IconButton } from "@/components/IconButton";

export interface MapControlsProps {
  onZoomIn: (...args: any[]) => any;
  onZoomOut: (...args: any[]) => any;
  onLocate: (...args: any[]) => any;
  onLegend: (...args: any[]) => any;
  onLayers: (...args: any[]) => any;
  bottom: any;
  locateLabel: any;
}

export function MapControls({ onZoomIn, onZoomOut, onLocate, onLegend, onLayers, bottom, locateLabel }: MapControlsProps) {
  return (
    <div className="map-controls" style={{ bottom }}>
      <IconButton icon="info" label="Comprendre la carte" onClick={onLegend} />
      {onLayers ? <IconButton icon="stack" label="Fond de carte" onClick={onLayers} /> : null}
      <div className="mc-zoom" role="group" aria-label="Zoom">
        <IconButton icon="plus" label="Zoomer" onClick={onZoomIn} />
        <IconButton icon="minus" label="Dézoomer" onClick={onZoomOut} />
      </div>
      <IconButton icon="crosshair" label={locateLabel} onClick={onLocate} />
    </div>
  );
}
