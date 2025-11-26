export interface MissionSettings {
  altitude: number;
  speed: number;
  gimbalAngle: number;
  pathDistance: number;
  orientation: string;
  overlap: number;
  useActions: boolean;
  reversePoints: boolean;
  straightenPaths: boolean;
  correction: boolean;
}

export interface AIGenerationResponse {
  altitude: number;
  speed: number;
  gimbalAngle: number;
  explanation: string;
}

export enum MeasurementSystem {
  METRIC = 'Metric (Meters)',
  IMPERIAL = 'Imperial (Feet)',
}