type WebhookEventType = 'start' | 'output' | 'logs' | 'completed';

export interface ReplicateCreatePrediction {
  model: string;
  version?: string;
  input: object;
  stream?: boolean;
  webhook?: string;
  webhook_events_filter?: WebhookEventType[];
}
