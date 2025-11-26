import React from 'react';
import { MapContainer } from './MapContainer';

interface MapEditorProps {
  onAreaChange?: (geoJson: any) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({ onAreaChange }) => {
  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden group">
      <MapContainer onAreaChange={onAreaChange} />
    </div>
  );
};