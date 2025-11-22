export interface BodyMeasurements {
  neck: number;
  shoulders: number;
  chest: number;
  waist: number;
  hips: number;
  sleeve: number;
  inseam: number;
  heightEstimate: number;
  unit: 'cm' | 'in';
}

export interface MeasurementRecord {
  id: string;
  date: string;
  measurements: BodyMeasurements;
  name: string;
}

export enum AppState {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY'
}

export enum MotionStatus {
  STABLE = 'STABLE',
  MOVING = 'MOVING',
  NO_PERSON = 'NO_PERSON'
}