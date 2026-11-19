export type Language = 'zh-TW' | 'en';

export type LearningStage = 1 | 2 | 3 | 4;

export interface SimulationParams {
  /** Incident angle in degrees (between 15 and 72) */
  incidentAngleDeg: number;
  /** Playback speed multiplier (0.4 to 2.0) */
  speedMultiplier: number;
  /** Number of discrete Huygens secondary wavelets along segment AC (3 to 15) */
  waveletCount: number;
  /** Ratio of reflected wave speed to incident wave speed (default 1.0 in same medium) */
  speedRatio: number;
  /** Normalized timeline progress t in [0, 1], where t=0.22 is A reaching mirror, t=0.68 is B reaching C */
  progress: number;
  /** Whether animation is playing */
  isPlaying: boolean;
  /** Active guided stage */
  stage: LearningStage;
  /** Optional selected wavelet index along AC for focused inspection */
  selectedSourceIndex: number | null;
}

export interface LayerVisibility {
  showRaysAndNormals: boolean;
  showWavelets: boolean;
  showTriangles: boolean;
  showMeasurements: boolean;
  showMultipleWavefronts: boolean;
}

export interface GeometryTelemetry {
  thetaIDeg: number;
  thetaRDeg: number;
  /** Length of segment AC in arbitrary unit (cm) */
  lengthAC: number;
  /** Length of segment BC = v_i * dt */
  lengthBC: number;
  /** Length of segment AD = v_r * dt */
  lengthAD: number;
  /** Elapsed time dt between A hitting mirror and B hitting mirror (ms-scaled physics unit) */
  deltaT: number;
  /** Whether physical reflection in same medium holds (speedRatio === 1) */
  isSameMedium: boolean;
  /** Current normalized phase description */
  phase: 'approaching' | 'sweeping' | 'reflected';
}

export interface QuizOption {
  id: string;
  label: {
    'zh-TW': string;
    en: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: {
    'zh-TW': string;
    en: string;
  };
  options: QuizOption[];
  correctOptionId: string;
  explanation: {
    'zh-TW': string;
    en: string;
  };
  relatedStage: LearningStage;
}
