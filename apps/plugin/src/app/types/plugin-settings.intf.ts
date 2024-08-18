export const MIN_NUMBER_OF_IMAGES_TO_GENERATE = 1;
export const MAX_NUMBER_OF_IMAGES_TO_GENERATE = 4;

export const MIN_IMAGES_OUTPUT_QUALITY = 1;
export const MAX_IMAGES_OUTPUT_QUALITY = 100;

export type SupportedImageFormat = 'webp' | 'png' | 'jpg';

export type SupportedImagesAspectRatio =
  | '1:1'
  | '16:9'
  | '2:3'
  | '3:2'
  | '4:5'
  | '5:4'
  | '9:16';

export interface PluginSettings {
  // General
  apiKey: string;
  copyOutputToClipboard: boolean;
  disableSafetyChecker: boolean;

  // Image Generation
  imageGenerationModel: string;
  imageGenerationModelVersion?: string;
  // 1-4
  numberOfImagesToGenerate: number;
  imagesAspectRatio: SupportedImagesAspectRatio;
  imagesOutputFormat: SupportedImageFormat;
  // 1-100
  imagesOutputQuality: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  // General
  apiKey: '',
  copyOutputToClipboard: true,
  disableSafetyChecker: false,

  // Image Generation
  // black-forest-labs/flux-dev
  // black-forest-labs/flux-schnell
  // stability-ai/sdxl
  imageGenerationModel: 'black-forest-labs/flux-pro',
  numberOfImagesToGenerate: MIN_NUMBER_OF_IMAGES_TO_GENERATE,
  imagesOutputFormat: 'webp',
  imagesOutputQuality: 85,
  imagesAspectRatio: '1:1',
};
