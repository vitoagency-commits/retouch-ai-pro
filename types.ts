
export enum RetouchAction {
  DODGE_BURN = 'Dodge & Burn',
  SKIN_TONE = 'Skin Tone',
  HEAL = 'Heal & Blemishes',
  PORTRAIT_VOLUMES = 'Portrait Volumes',
  EYE_BRILLIANCE = 'Eye & Teeth Brilliance',
  SKIN_MASK = 'Skin Masking',
  TEXTURE_SMOOTHING = 'Texture Smoothing',
  COLOR_GRADE = 'Color Grade',
  NOISE_REDUCTION = 'Noise Reduction',
  SHARPEN = 'Sharpen & Detail',
  SHADOW_RECOVERY = 'Shadow Recovery',
  GENERATIVE_REMOVE = 'Generative Remove',
  ADD_TEXT = 'Add Text',
  RED_EYE_REMOVAL = 'Red Eye Removal',
  REMOVE_REFLECTION = 'Remove Reflection',
  ADD_WATERMARK = 'Add Watermark'
}

export interface Point {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  leftEye: Point;
  rightEye: Point;
  noseBridge: Point;
  mouthLeft: Point;
  mouthRight: Point;
  chin: Point;
}

export interface FaceDetection {
  boundingBox: { min: Point; max: Point };
  landmarks: FaceLandmarks;
}

export interface SplitToning {
  highlights: { hue: number; saturation: number };
  shadows: { hue: number; saturation: number };
  balance: number;
}

export interface HSLChannel {
  hue: number;
  saturation: number;
  luminance: number;
}

export interface HSLSettings {
  reds: HSLChannel;
  yellows: HSLChannel;
  greens: HSLChannel;
  cyans: HSLChannel;
  blues: HSLChannel;
  magentas: HSLChannel;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurveSettings {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface GradingSettings {
  lut: string;
  intensity: number; // 0 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100 (Temp)
  tint: number; // -100 to 100 (Green/Magenta)
  splitToning: SplitToning;
  hsl: HSLSettings;
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  vignette: number; // 0 to 100
  grain: number; // 0 to 100
  sepia: number; // 0 to 100
  sharpness: number; // 0 to 100
  curves: CurveSettings;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  opacity: number;
  rotation: number;
}

export interface BatchImage {
  id: string;
  name: string;
  originalUrl: string;
  currentUrl: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  history: RetouchResult[];
  historyIndex: number;
  faces: FaceDetection[];
  isRaw?: boolean;
  dimensions?: { width: number; height: number };
  aspectRatio?: string;
  textLayers: TextLayer[];
}

export interface RetouchResult {
  id: string;
  originalImage: string;
  retouchedImage: string;
  action: RetouchAction;
  timestamp: number;
  gradingSettings?: GradingSettings;
  textLayers?: TextLayer[];
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
}
