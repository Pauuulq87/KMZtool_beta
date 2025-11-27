import React from 'react';
import { MapContainer } from './MapContainer';

interface MapEditorProps {
  activeTool: string;
  onAreaChange?: (geoJson: any) => void;
  waypoints?: any[];
  initialArea?: any;
  initialPOIs?: any[];
}

export const MapEditor: React.FC<MapEditorProps> = ({ activeTool, onAreaChange, waypoints, initialArea, initialPOIs }) => {
  return (
    <MapContainer
      activeTool={activeTool}
      onAreaChange={onAreaChange}
      waypoints={waypoints}
      initialArea={initialArea}
      initialPOIs={initialPOIs}
    />
  );
};