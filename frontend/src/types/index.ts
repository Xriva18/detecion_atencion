export interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

export interface VideoCanvasProps {
  stream: MediaStream | null;
  width?: number;
  height?: number;
  isPaused?: boolean;
}

export interface BlinkCounterProps {
  count: number;
}

