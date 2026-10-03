import { describe, expect, test } from 'bun:test'
import {
    apiKeyMissingMessage,
    bootstrapSecretFromLegacy,
    clearSecret,
    DEFAULT_API_KEY_SECRET_NAME,
    getApiKey,
    isLegacyGracePeriodOver,
    readLegacyApiKey,
    isValidSecretName,
    migrateLegacyApiKey
} from './api-key-secret.fn'
import { createMockSecretStore } from './mock-secret-store'
import { MSG_API_KEY_CONFIGURATION_REQUIRED } from '../constants'

describe('DEFAULT_API_KEY_SECRET_NAME', () => {
    test('is <plugin-id>-<what> and a valid secret id', () => {
        expect(DEFAULT_API_KEY_SECRET_NAME).toBe('replicate-api-key')
        expect(isValidSecretName(DEFAULT_API_KEY_SECRET_NAME)).toBe(true)
    })
})

describe('isValidSecretName', () => {
    test('accepts lowercase alphanumeric ids with dashes', () => {
        expect(isValidSecretName('replicate-api-key-2')).toBe(true)
    })

    test('rejects uppercase, spaces, underscores and empty ids', () => {
        expect(isValidSecretName('Replicate')).toBe(false)
        expect(isValidSecretName('api key')).toBe(false)
        expect(isValidSecretName('api_key')).toBe(false)
        expect(isValidSecretName('')).toBe(false)
    })
})

describe('getApiKey', () => {
    test('reads the key from secret storage', () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'r8_abc' })
        expect(getApiKey(store, 'replicate-api-key')).toBe('r8_abc')
    })

    test('returns null when the secret is missing on this device', () => {
        expect(getApiKey(createMockSecretStore(), 'replicate-api-key')).toBeNull()
    })

    test('returns null for a blank secret or a blank name', () => {
        const store = createMockSecretStore({ 'replicate-api-key': '  ' })
        expect(getApiKey(store, 'replicate-api-key')).toBeNull()
        expect(getApiKey(store, '')).toBeNull()
    })
})

describe('migrateLegacyApiKey', () => {
    test('does nothing without a legacy key', () => {
        const store = createMockSecretStore()
        expect(migrateLegacyApiKey(store, undefined)).toBeNull()
        expect(migrateLegacyApiKey(store, '')).toBeNull()
        expect(migrateLegacyApiKey(store, '   ')).toBeNull()
        expect(migrateLegacyApiKey(store, 42)).toBeNull()
        expect(store.writes).toEqual([])
    })

    test('stores the legacy key under the default name', () => {
        const store = createMockSecretStore()
        expect(migrateLegacyApiKey(store, 'r8_abc')).toBe('replicate-api-key')
        expect(store.secrets.get('replicate-api-key')).toBe('r8_abc')
    })

    test('is idempotent: a secret holding the same value is reused, not rewritten', () => {
        const store = createMockSecretStore()
        migrateLegacyApiKey(store, 'r8_abc')
        expect(migrateLegacyApiKey(store, 'r8_abc')).toBe('replicate-api-key')
        expect(store.writes).toHaveLength(1)
    })

    test('never overwrites a different secret: uses a suffixed name', () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'other' })
        expect(migrateLegacyApiKey(store, 'r8_abc')).toBe('replicate-api-key-2')
        expect(store.secrets.get('replicate-api-key')).toBe('other')
        expect(store.secrets.get('replicate-api-key-2')).toBe('r8_abc')
    })

    test('skips every taken suffix', () => {
        const store = createMockSecretStore({
            'replicate-api-key': 'a',
            'replicate-api-key-2': 'b'
        })
        expect(migrateLegacyApiKey(store, 'r8_abc')).toBe('replicate-api-key-3')
    })

    test('reuses a suffixed secret that already holds the value', () => {
        const store = createMockSecretStore({
            'replicate-api-key': 'a',
            'replicate-api-key-2': 'r8_abc'
        })
        expect(migrateLegacyApiKey(store, 'r8_abc')).toBe('replicate-api-key-2')
        expect(store.writes).toEqual([])
    })

    test('uses the preferred name when valid, the default otherwise', () => {
        const store = createMockSecretStore()
        expect(migrateLegacyApiKey(store, 'x', 'my-key')).toBe('my-key')
        expect(migrateLegacyApiKey(store, 'y', 'Not Valid')).toBe('replicate-api-key')
    })
})

describe('readLegacyApiKey', () => {
    test('keeps a non-blank string only', () => {
        expect(readLegacyApiKey('r8_abc')).toBe('r8_abc')
        expect(readLegacyApiKey('  ')).toBeNull()
        expect(readLegacyApiKey(undefined)).toBeNull()
        expect(readLegacyApiKey(1)).toBeNull()
    })
})

describe('bootstrapSecretFromLegacy', () => {
    test('writes the legacy key when the secret is absent on this device', () => {
        const store = createMockSecretStore()
        expect(bootstrapSecretFromLegacy(store, 'replicate-api-key', 'r8_abc')).toBe(true)
        expect(store.secrets.get('replicate-api-key')).toBe('r8_abc')
    })

    test('treats a cleared (empty) secret as absent', () => {
        const store = createMockSecretStore({ 'replicate-api-key': '' })
        expect(bootstrapSecretFromLegacy(store, 'replicate-api-key', 'r8_abc')).toBe(true)
    })

    test('never overwrites a secret already set on this device', () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'rotated' })
        expect(bootstrapSecretFromLegacy(store, 'replicate-api-key', 'r8_abc')).toBe(false)
        expect(store.secrets.get('replicate-api-key')).toBe('rotated')
    })

    test('is idempotent and ignores a missing legacy key or an invalid name', () => {
        const store = createMockSecretStore()
        bootstrapSecretFromLegacy(store, 'replicate-api-key', 'r8_abc')
        bootstrapSecretFromLegacy(store, 'replicate-api-key', 'r8_abc')
        bootstrapSecretFromLegacy(store, 'replicate-api-key', null)
        bootstrapSecretFromLegacy(store, '', 'r8_abc')
        expect(store.writes).toHaveLength(1)
    })
})

describe('clearSecret', () => {
    test('empties the secret (no delete API) so it reads as absent', () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'r8_abc' })
        clearSecret(store, 'replicate-api-key')
        expect(getApiKey(store, 'replicate-api-key')).toBeNull()
    })
})

describe('isLegacyGracePeriodOver', () => {
    const start = '2026-01-01T00:00:00.000Z'

    test('is false before 60 days and true from 60 days on', () => {
        expect(isLegacyGracePeriodOver(start, new Date('2026-03-01T23:59:59.000Z'))).toBe(false)
        expect(isLegacyGracePeriodOver(start, new Date('2026-03-02T00:00:00.000Z'))).toBe(true)
    })

    test('never expires an unset or unparsable date', () => {
        expect(isLegacyGracePeriodOver('', new Date('2100-01-01'))).toBe(false)
        expect(isLegacyGracePeriodOver('garbage', new Date('2100-01-01'))).toBe(false)
    })
})

describe('apiKeyMissingMessage', () => {
    test('names the secret to set on this device, never a key', () => {
        const message = apiKeyMissingMessage('replicate-api-key')
        expect(message).toContain('"replicate-api-key"')
        expect(message).toContain('this device')
    })

    test('asks for configuration when no secret name is set', () => {
        expect(apiKeyMissingMessage('')).toBe(MSG_API_KEY_CONFIGURATION_REQUIRED)
    })
})
