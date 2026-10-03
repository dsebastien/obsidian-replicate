import { describe, expect, test } from 'bun:test'
import { produce } from 'immer'
import type { App, PluginManifest } from 'obsidian'
import { ReplicatePlugin } from './plugin'
import {
    DEFAULT_SETTINGS,
    createDefaultSettings,
    type LegacyPluginSettings
} from './types/plugin-settings.intf'
import { createMockSecretStore, type MockSecretStore } from './utils/mock-secret-store'

const TODAY = new Date('2026-10-03T12:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

interface Harness {
    plugin: ReplicatePlugin
    store: MockSecretStore
    /** Every object passed to saveData, in order */
    saved: Record<string, unknown>[]
}

/** A plugin whose stored data is `stored`, without running onload */
function createHarness(
    stored: LegacyPluginSettings | null,
    store: MockSecretStore = createMockSecretStore(),
    now: Date = TODAY
): Harness {
    const plugin = Object.create(ReplicatePlugin.prototype) as ReplicatePlugin
    const internals = plugin as unknown as Record<string, unknown>
    const saved: Record<string, unknown>[] = []
    internals['settings'] = produce(createDefaultSettings(), () => {})
    internals['legacyApiKey'] = null
    internals['now'] = (): Date => now
    internals['app'] = { secretStorage: store }
    internals['loadData'] = (): Promise<unknown> => Promise.resolve(stored)
    internals['saveData'] = (data: Record<string, unknown>): Promise<void> => {
        saved.push(JSON.parse(JSON.stringify(data)) as Record<string, unknown>)
        return Promise.resolve()
    }
    return { plugin, store, saved }
}

function createPlugin(stored: LegacyPluginSettings | null): ReplicatePlugin {
    return createHarness(stored).plugin
}

/** data.json as written by versions that stored the key in plaintext */
function legacyData(apiKey: string): LegacyPluginSettings {
    const { apiKeySecretName: _ignored, ...rest } = createDefaultSettings()
    return { ...rest, apiKey }
}

describe('loadSettings', () => {
    test('a toggle switched off stays off', async () => {
        // Both toggles default to true for appendOutputToCurrentNote; a stored
        // false is the user's choice, not a missing value
        const plugin = createPlugin({
            ...createDefaultSettings(),
            copyOutputToClipboard: false,
            appendOutputToCurrentNote: false
        })
        await plugin.loadSettings()
        expect(plugin.settings.copyOutputToClipboard).toBe(false)
        expect(plugin.settings.appendOutputToCurrentNote).toBe(false)
    })

    test('a toggle switched on stays on', async () => {
        const plugin = createPlugin({
            ...createDefaultSettings(),
            copyOutputToClipboard: true,
            appendOutputToCurrentNote: true
        })
        await plugin.loadSettings()
        expect(plugin.settings.copyOutputToClipboard).toBe(true)
        expect(plugin.settings.appendOutputToCurrentNote).toBe(true)
    })

    test('constructing the plugin never freezes the shared defaults', () => {
        const plugin = new ReplicatePlugin({} as App, {} as PluginManifest)
        expect(Object.isFrozen(plugin.settings)).toBe(true)
        expect(Object.isFrozen(DEFAULT_SETTINGS)).toBe(false)
        expect(Object.isFrozen(DEFAULT_SETTINGS.imageGenerationConfiguration)).toBe(false)
    })

    test('with no stored data never freezes the shared defaults', async () => {
        // The harness skips the constructor: its field initializer is the
        // test above.
        const plugin = createPlugin(null)
        const settings = plugin.settings

        await plugin.loadSettings()

        // Immer deep-freezes what produce returns, including subtrees shared
        // with its base: producing from DEFAULT_SETTINGS froze the constant
        // for the rest of the process.
        expect(plugin.settings).toBe(settings)
        expect(Object.isFrozen(DEFAULT_SETTINGS)).toBe(false)
        expect(Object.isFrozen(DEFAULT_SETTINGS.imageGenerationConfiguration)).toBe(false)
    })

    test('each default settings object is an independent copy', () => {
        const one = createDefaultSettings()
        one.apiKeySecretName = 'other'
        Object.assign(one.imageGenerationConfiguration, { num_outputs: 4 })
        expect(createDefaultSettings()).toEqual(DEFAULT_SETTINGS)
        expect(DEFAULT_SETTINGS.apiKeySecretName).toBe('replicate-api-key')
        expect(DEFAULT_SETTINGS.imageGenerationConfiguration).toMatchObject({ num_outputs: 1 })
    })
})

describe('API key: per-device migration to secret storage', () => {
    test('device A: copies the legacy key into secret storage and keeps the plain-text copy', async () => {
        const { plugin, store, saved } = createHarness(legacyData('r8_legacy'))
        await plugin.loadSettings()

        expect(store.secrets.get('replicate-api-key')).toBe('r8_legacy')
        expect(plugin.settings.apiKeySecretName).toBe('replicate-api-key')
        expect(plugin.settings.legacySecretMigratedAt).toBe(TODAY.toISOString())
        // Never cached in the settings object
        expect(plugin.settings).not.toHaveProperty('apiKey')
        // Kept in data.json for the other devices during the grace period
        expect(saved).toHaveLength(1)
        expect(saved[0]?.['apiKey']).toBe('r8_legacy')
        expect(saved[0]?.['apiKeySecretName']).toBe('replicate-api-key')
        expect(plugin.resolveApiKey()).toBe('r8_legacy')
    })

    test('device B: synced data.json + empty secret storage → migrated and working', async () => {
        const deviceA = createHarness(legacyData('r8_legacy'))
        await deviceA.plugin.loadSettings()
        const synced = deviceA.saved[0] as LegacyPluginSettings

        const deviceB = createHarness(synced, createMockSecretStore())
        await deviceB.plugin.loadSettings()

        expect(deviceB.store.secrets.get('replicate-api-key')).toBe('r8_legacy')
        expect(deviceB.plugin.resolveApiKey()).toBe('r8_legacy')
        // Nothing to rewrite: same name, same date, same legacy copy
        expect(deviceB.saved).toEqual([])
    })

    test('is idempotent: reloading on the same device writes nothing', async () => {
        const first = createHarness(legacyData('r8_legacy'))
        await first.plugin.loadSettings()
        const second = createHarness(first.saved[0] as LegacyPluginSettings, first.store)
        await second.plugin.loadSettings()

        expect(first.store.writes).toHaveLength(1)
        expect(second.saved).toEqual([])
    })

    test('first migration never overwrites a different secret: uses a suffixed name', async () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'someone-else' })
        const { plugin, saved } = createHarness(legacyData('r8_legacy'), store)
        await plugin.loadSettings()

        expect(store.secrets.get('replicate-api-key')).toBe('someone-else')
        expect(store.secrets.get('replicate-api-key-2')).toBe('r8_legacy')
        expect(saved[0]?.['apiKeySecretName']).toBe('replicate-api-key-2')
    })

    test('a secret already set on this device wins over the legacy copy', async () => {
        const store = createMockSecretStore({ 'replicate-api-key': 'rotated' })
        const { plugin } = createHarness(
            { ...legacyData('r8_legacy'), apiKeySecretName: 'replicate-api-key' },
            store
        )
        await plugin.loadSettings()

        expect(store.writes).toEqual([])
        expect(plugin.resolveApiKey()).toBe('rotated')
    })

    test('reading falls back to the legacy copy and migrates it at that moment', async () => {
        const deviceA = createHarness(legacyData('r8_legacy'))
        await deviceA.plugin.loadSettings()
        // Secret wiped on this device after load (e.g. cleared elsewhere)
        deviceA.store.secrets.set('replicate-api-key', '')

        expect(deviceA.plugin.resolveApiKey()).toBe('r8_legacy')
        expect(deviceA.store.secrets.get('replicate-api-key')).toBe('r8_legacy')
    })

    test('an empty legacy key is dropped without creating a secret', async () => {
        const { plugin, store, saved } = createHarness(legacyData(''))
        await plugin.loadSettings()

        expect(store.writes).toEqual([])
        expect(saved[0]).not.toHaveProperty('apiKey')
        expect(plugin.hasLegacyApiKey()).toBe(false)
    })

    test('a synced name with no secret and no legacy copy never creates one', async () => {
        const { plugin, store, saved } = createHarness({
            ...createDefaultSettings(),
            apiKeySecretName: 'replicate-api-key'
        })
        await plugin.loadSettings()

        expect(store.writes).toEqual([])
        expect(plugin.resolveApiKey()).toBeNull()
        expect(saved).toEqual([])
    })

    test('a failed move keeps the plain-text copy so the key is never lost', async () => {
        const failing: MockSecretStore = {
            ...createMockSecretStore(),
            setSecret: (): void => {
                throw new Error('storage unavailable')
            }
        }
        const stored = legacyData('r8_legacy')
        delete stored.copyOutputToClipboard // forces a save
        const { plugin, saved } = createHarness(stored, failing)
        await plugin.loadSettings()

        expect(saved[0]?.['apiKey']).toBe('r8_legacy')
        expect(plugin.resolveApiKey()).toBe('r8_legacy')
    })
})

describe('API key: legacy copy lifecycle', () => {
    async function migratedHarness(): Promise<Harness> {
        const harness = createHarness(legacyData('r8_legacy'))
        await harness.plugin.loadSettings()
        harness.saved.length = 0
        return harness
    }

    test('purges the plain-text copy once 60 days have passed', async () => {
        const deviceA = await migratedHarness()
        const synced = { ...deviceA.plugin.settings, apiKey: 'r8_legacy' }

        const before = createHarness(synced, deviceA.store, new Date(TODAY.getTime() + 59 * DAY_MS))
        await before.plugin.loadSettings()
        expect(before.plugin.hasLegacyApiKey()).toBe(true)
        expect(before.saved).toEqual([])

        const after = createHarness(synced, deviceA.store, new Date(TODAY.getTime() + 60 * DAY_MS))
        await after.plugin.loadSettings()
        expect(after.plugin.hasLegacyApiKey()).toBe(false)
        expect(after.saved[0]).not.toHaveProperty('apiKey')
        // This device keeps working from its secret
        expect(after.plugin.resolveApiKey()).toBe('r8_legacy')
    })

    test('a late device still bootstraps before the purge', async () => {
        const deviceA = await migratedHarness()
        const synced = { ...deviceA.plugin.settings, apiKey: 'r8_legacy' }
        const late = createHarness(
            synced,
            createMockSecretStore(),
            new Date(TODAY.getTime() + 90 * DAY_MS)
        )
        await late.plugin.loadSettings()

        expect(late.store.secrets.get('replicate-api-key')).toBe('r8_legacy')
        expect(late.plugin.hasLegacyApiKey()).toBe(false)
    })

    test('"Remove plain-text copy now" purges it from data.json', async () => {
        const { plugin, saved } = await migratedHarness()
        await plugin.removeLegacyApiKey()

        expect(plugin.hasLegacyApiKey()).toBe(false)
        expect(saved.at(-1)).not.toHaveProperty('apiKey')
        expect(plugin.resolveApiKey()).toBe('r8_legacy')
    })

    test('rotating the secret drops the stale legacy copy, never writes the new value to data.json', async () => {
        const { plugin, store, saved } = await migratedHarness()
        store.secrets.set('replicate-api-key', 'r8_rotated')
        await plugin.setApiKeySecretName('replicate-api-key')

        expect(plugin.hasLegacyApiKey()).toBe(false)
        expect(JSON.stringify(saved.at(-1))).not.toContain('r8_')
        expect(plugin.resolveApiKey()).toBe('r8_rotated')
    })

    test('re-selecting a secret holding the same value keeps the copy for other devices', async () => {
        const { plugin } = await migratedHarness()
        await plugin.setApiKeySecretName('replicate-api-key')
        expect(plugin.hasLegacyApiKey()).toBe(true)
    })

    test("clearing the key empties this device's secret and the legacy copy", async () => {
        const { plugin, store, saved } = await migratedHarness()
        await plugin.clearApiKey()

        expect(store.secrets.get('replicate-api-key')).toBe('')
        expect(plugin.hasLegacyApiKey()).toBe(false)
        expect(saved.at(-1)).not.toHaveProperty('apiKey')
        expect(plugin.resolveApiKey()).toBeNull()
    })
})
