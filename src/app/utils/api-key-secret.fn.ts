import type { SecretStorage } from 'obsidian'
import { MSG_API_KEY_CONFIGURATION_REQUIRED, msgApiKeySecretMissing } from '../constants'

/**
 * The subset of Obsidian's SecretStorage (1.11.4+) the plugin uses. Narrowed
 * so the migration and lookups can be unit tested with a plain mock.
 */
export type SecretStore = Pick<SecretStorage, 'getSecret' | 'setSecret' | 'listSecrets'>

/** Default secret name: `<plugin-id>-<what>`, a valid SecretStorage id. */
export const DEFAULT_API_KEY_SECRET_NAME = 'replicate-api-key'

/**
 * How long the legacy plaintext copy stays in data.json after the first
 * migration, so every synced device can bootstrap its own secret from it.
 */
export const LEGACY_API_KEY_GRACE_PERIOD_DAYS = 60

const DAY_MS = 24 * 60 * 60 * 1000

/** SecretStorage ids: lowercase alphanumeric with optional dashes. */
const SECRET_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Upper bound for the suffix search, so a broken store cannot loop forever. */
const MAX_SUFFIX = 100

export function isValidSecretName(name: string): boolean {
    return SECRET_NAME_REGEX.test(name)
}

/**
 * Read the API key from the device's secret storage at use time. Never cache
 * the result in the settings or data.json. Returns null when no name is set,
 * the secret is missing on this device, or it is blank.
 */
export function getApiKey(storage: SecretStore, secretName: string): string | null {
    if ('' === secretName.trim()) {
        return null
    }
    const value = storage.getSecret(secretName)
    if (null === value || '' === value.trim()) {
        return null
    }
    return value
}

/** The legacy plaintext key if usable, null when absent or blank. */
export function readLegacyApiKey(value: unknown): string | null {
    return 'string' === typeof value && '' !== value.trim() ? value : null
}

/**
 * Per-device bootstrap: write the legacy plaintext key into this device's
 * secret only when that secret is absent (SecretStorage has no delete; ''
 * counts as absent). A secret already set on this device always wins.
 * Returns true when a secret was written. Idempotent.
 */
export function bootstrapSecretFromLegacy(
    storage: SecretStore,
    secretName: string,
    legacyApiKey: string | null
): boolean {
    if (null === legacyApiKey || !isValidSecretName(secretName)) {
        return false
    }
    if (null !== getApiKey(storage, secretName)) {
        return false
    }
    storage.setSecret(secretName, legacyApiKey)
    return true
}

/** Clear this device's secret. There is no delete API: '' means absent. */
export function clearSecret(storage: SecretStore, secretName: string): void {
    if (isValidSecretName(secretName)) {
        storage.setSecret(secretName, '')
    }
}

/**
 * True once the grace period since the first migration is over. An unset or
 * unparsable date never expires (the caller records a fresh one instead).
 */
export function isLegacyGracePeriodOver(migratedAt: string, now: Date): boolean {
    const start = Date.parse(migratedAt)
    if (Number.isNaN(start)) {
        return false
    }
    return now.getTime() - start >= LEGACY_API_KEY_GRACE_PERIOD_DAYS * DAY_MS
}

/** The notice to show when no API key is usable on this device. */
export function apiKeyMissingMessage(secretName: string): string {
    return '' === secretName.trim()
        ? MSG_API_KEY_CONFIGURATION_REQUIRED
        : msgApiKeySecretMissing(secretName)
}

/**
 * First migration of a legacy plaintext API key (data.json `apiKey`, no secret
 * name recorded yet) into secret storage.
 *
 * Returns the secret name now holding the key, or null when there is nothing
 * to migrate. Idempotent: a secret that already holds the same value is
 * reused. A secret with the same name but a different value is never
 * overwritten: a suffixed name (`<base>-2`, `<base>-3`, ...) is used instead.
 */
export function migrateLegacyApiKey(
    storage: SecretStore,
    legacyApiKey: unknown,
    preferredName: string = DEFAULT_API_KEY_SECRET_NAME
): string | null {
    if ('string' !== typeof legacyApiKey || '' === legacyApiKey.trim()) {
        return null
    }

    const baseName = isValidSecretName(preferredName) ? preferredName : DEFAULT_API_KEY_SECRET_NAME

    for (let index = 1; index <= MAX_SUFFIX; index++) {
        const candidate = 1 === index ? baseName : `${baseName}-${index}`
        const existing = storage.getSecret(candidate)
        if (existing === legacyApiKey) {
            return candidate
        }
        if (null === existing || '' === existing) {
            storage.setSecret(candidate, legacyApiKey)
            return candidate
        }
    }

    throw new Error('No free secret name found to migrate the API key')
}
