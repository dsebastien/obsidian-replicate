
export interface PluginSettings {
  // General
  apiKey: string;
  copyOutputToClipboard: boolean;

  // Image Generation
  imageGenerationModel: string;
  imageGenerationModelVersion?: string;
  imageGenerationConfiguration: object;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  // General
  apiKey: '',
  copyOutputToClipboard: true,

  // Image Generation
  // black-forest-labs/flux-pro
  // black-forest-labs/flux-dev
  // black-forest-labs/flux-schnell
  // stability-ai/sdxl
  imageGenerationModel: 'black-forest-labs/flux-dev',
  // Reference for this default example: https://replicate.com/black-forest-labs/flux-dev
  imageGenerationConfiguration: {
    // Prompt for generated image
    prompt: "obsidian rock in the forest spelling out the words \"Obsidian\", canon pro photography, dynamic shot, 50mm",
    // Aspect ratio for the generated image
    aspect_ratio: "1:1", // 1:1, 4:3, 16:9 9:16 3:4 4:3 2:3 3:2 4:5 5:4
    // Input image for image to image mode. The aspect ratio of your output will match this image
    // image: ...
    // Prompt strength when using img2img. 1.0 corresponds to full destruction of information in image
    prompt_strength: 0.8, // 0-1
    // Number of outputs to generate
    num_outputs: 1, // 1-4
    // Number of denoising steps. Recommended range is 28-50
    num_inference_steps: 50, // 1-50
    // Guidance for generated image. Ignored for flux-schnell
    guidance: 3.5, // 0-10
    // Random seed. Set for reproducible generation
    // seed: ...
    // Format of the output images
    output_format: "webp", // webp, jpg, png
    // Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs
    output_quality: 80, // 0-100
    // Disable safety checker for generated images
    disable_safety_checker: true,
  },
};
