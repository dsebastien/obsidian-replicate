export interface ReplicateRunModelConfiguration {
  input: object;
  wait?: {
    interval?: number;
  };
  webhook?: string;
  signal?: AbortSignal;
}
