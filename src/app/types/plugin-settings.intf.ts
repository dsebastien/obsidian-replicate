import { DEFAULT_API_KEY_SECRET_NAME } from '../utils/api-key-secret.fn'

export interface PluginSettings {
    // General
    /**
     * Name of the Obsidian secret (SecretStorage, device-local) holding the
     * Replicate.com API key. Only the name is persisted in data.json, never
     * the key itself.
     */
    apiKeySecretName: string
    /**
     * ISO date of the first migration of the legacy plaintext `apiKey` to
     * secret storage. The plaintext copy is purged from data.json once the
     * grace period has passed. Empty when there never was one.
     */
    legacySecretMigratedAt: string
    copyOutputToClipboard: boolean
    appendOutputToCurrentNote: boolean

    // Image Generation
    imageGenerationModel: `${string}/${string}` | `${string}/${string}:${string}`
    imageGenerationConfiguration: object
}

/**
 * A fresh default settings object, safe to hand to Immer.
 *
 * `produce` deep-freezes what it returns, including any subtree it shares
 * with its base. Producing from the shared DEFAULT_SETTINGS froze that
 * constant (and its nested objects) for the rest of the process, so any later
 * code or test touching it failed with "Attempted to assign to readonly
 * property". Produce from this instead, and keep it deep-fresh: build
 * nested arrays and objects as new values, never by spreading DEFAULT_SETTINGS.
 */
export function createDefaultSettings(): PluginSettings {
    return {
        // General
        apiKeySecretName: DEFAULT_API_KEY_SECRET_NAME,
        legacySecretMigratedAt: '',
        copyOutputToClipboard: false,
        appendOutputToCurrentNote: true,

        // Image Generation model
        // Form 1: <model_owner>/<model_name>
        // Form 2: <model_owner>/<model_name>:<version>
        // black-forest-labs/flux-pro
        // black-forest-labs/flux-dev
        // black-forest-labs/flux-schnell
        // stability-ai/sdxl
        imageGenerationModel: 'black-forest-labs/flux-dev',
        // Reference for this default example: https://replicate.com/black-forest-labs/flux-dev
        imageGenerationConfiguration: {
            // Prompt for generated image
            prompt: 'obsidian rock in the forest spelling out the words "Obsidian", canon pro photography, dynamic shot, 50mm',
            // Aspect ratio for the generated image
            aspect_ratio: '1:1', // 1:1, 4:3, 16:9 9:16 3:4 4:3 2:3 3:2 4:5 5:4
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
            output_format: 'webp', // webp, jpg, png
            // Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs
            output_quality: 80, // 0-100
            // Disable safety checker for generated images
            disable_safety_checker: true
        }
    }
}

/**
 * The on-disk shape before secret storage: the API key was stored in plaintext in
 * data.json. Legacy format, read only by the migration.
 */
export interface LegacyPluginSettings extends Partial<PluginSettings> {
    apiKey?: unknown
}

/** The defaults, for reading and comparing. Never produce from it. */
export const DEFAULT_SETTINGS: PluginSettings = createDefaultSettings()
