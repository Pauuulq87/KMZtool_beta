import React from 'react';
import { MapContainer } from './MapContainer';

interface MapEditorProps {
  activeTool: string;
  onAreaChange?: (geoJson: any) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({ activeTool, onAreaChange }) => {
  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden group">
      <MapContainer activeTool={activeTool} onAreaChange={onAreaChange} />
    </div>
  );
};