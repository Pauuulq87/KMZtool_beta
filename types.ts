export interface MissionSettings {
  altitude: number;
  speed: number;
  gimbalAngle: number;
  pathDistance: number;
  orientation: string;
  overlap: number;
  rotationAngle: number;
  useActions: boolean;
  reversePoints: boolean;
  straightenPaths: boolean;
  correction: boolean;
  // New fields for Advanced tab
  units: 'metric' | 'imperial';
  interval: number;
  actionType: string;
  maintainAltitude: boolean;
  generateEveryPoint: boolean;
  // New fields for Download tab
  onCompletion: 'hover' | 'returnToHome';
  splitMission: boolean;
}



export enum MeasurementSystem {
  METRIC = 'Metric (Meters)',
  IMPERIAL = 'Imperial (Feet)',
}
