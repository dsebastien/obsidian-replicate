/**
 * How many milliseconds to wait before hiding notices
 */
export const NOTICE_TIMEOUT = 5000

export const MSG_API_KEY_CONFIGURATION_REQUIRED =
    'Please configure the Replicate plugin to provide a valid Replicate.com API key'

/**
 * The secret name is set but the secret is missing on this device (secret
 * storage is device-local; data.json synced from another device only carries
 * the name). Mentions the name only, never a key (BR-002).
 */
export const msgApiKeySecretMissing = (secretName: string): string =>
    `Replicate: no API key found on this device (secret "${secretName}"). Open Settings → Replicate to set it. Secrets are stored per device, so each device needs it once.`

export const MSG_API_KEY_MIGRATION_FAILED =
    'Replicate: could not move your API key to secret storage. Open Settings → Replicate and set it again.'

export const MSG_IMAGE_GENERATION_MODEL_CONFIGURATION_REQUIRED =
    'Please configure the Replicate plugin to provide an image generation model'

export const MSG_IMAGE_GENERATION_ERROR = 'Error while generating image(s) using Replicate.com'
