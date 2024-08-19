import { Prediction } from 'replicate';

export interface ReplicateRunModelConfiguration {
  input: object;
  wait?: {
    interval?: number;
  };
  webhook?: string;
  signal?: AbortSignal;
  progress?: (prediction: Prediction) => void;
}
