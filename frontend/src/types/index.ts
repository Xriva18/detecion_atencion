export interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

export interface VideoCanvasProps {
  stream: MediaStream | null;
  width?: number;
  height?: number;
}

export interface BlinkCounterProps {
  count: number;
}

