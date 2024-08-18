import {log} from "./log";
import Replicate from "replicate";

export const getReplicateClient = (apiKey: string): Replicate => {
  log('Creating Replicate.com API client', 'debug');
  return new Replicate({
    auth: apiKey,
    userAgent: 'Obsidian Replicate',
  });
}

