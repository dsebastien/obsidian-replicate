import { describe, expect, test } from 'bun:test'
import { produce } from 'immer'
import type { App, PluginManifest } from 'obsidian'
import { ReplicatePlugin } from './plugin'
import {
    DEFAULT_SETTINGS,
    createDefaultSettings,
    type PluginSettings
} from './types/plugin-settings.intf'

/** A plugin whose stored data is `stored`, without running onload */
function createPlugin(stored: Partial<PluginSettings> | null): ReplicatePlugin {
    const plugin = Object.create(ReplicatePlugin.prototype) as ReplicatePlugin
    const internals = plugin as unknown as Record<string, unknown>
    internals['settings'] = produce(createDefaultSettings(), () => {})
    internals['loadData'] = (): Promise<unknown> => Promise.resolve(stored)
    internals['saveData'] = (): Promise<void> => Promise.resolve()
    return plugin
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
        one.apiKey = 'secret'
        Object.assign(one.imageGenerationConfiguration, { num_outputs: 4 })
        expect(createDefaultSettings()).toEqual(DEFAULT_SETTINGS)
        expect(DEFAULT_SETTINGS.apiKey).toBe('')
        expect(DEFAULT_SETTINGS.imageGenerationConfiguration).toMatchObject({ num_outputs: 1 })
    })
})
