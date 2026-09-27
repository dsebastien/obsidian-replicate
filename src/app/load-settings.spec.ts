import { describe, expect, test } from 'bun:test'
import { ReplicatePlugin } from './plugin'
import { DEFAULT_SETTINGS, type PluginSettings } from './types/plugin-settings.intf'

/** A plugin whose stored data is `stored`, without running onload */
function createPlugin(stored: Partial<PluginSettings>): ReplicatePlugin {
    const plugin = Object.create(ReplicatePlugin.prototype) as ReplicatePlugin
    const internals = plugin as unknown as Record<string, unknown>
    internals['settings'] = DEFAULT_SETTINGS
    internals['loadData'] = (): Promise<unknown> => Promise.resolve(stored)
    internals['saveData'] = (): Promise<void> => Promise.resolve()
    return plugin
}

describe('loadSettings', () => {
    test('a toggle switched off stays off', async () => {
        // Both toggles default to true for appendOutputToCurrentNote; a stored
        // false is the user's choice, not a missing value
        const plugin = createPlugin({
            ...DEFAULT_SETTINGS,
            copyOutputToClipboard: false,
            appendOutputToCurrentNote: false
        })
        await plugin.loadSettings()
        expect(plugin.settings.copyOutputToClipboard).toBe(false)
        expect(plugin.settings.appendOutputToCurrentNote).toBe(false)
    })

    test('a toggle switched on stays on', async () => {
        const plugin = createPlugin({
            ...DEFAULT_SETTINGS,
            copyOutputToClipboard: true,
            appendOutputToCurrentNote: true
        })
        await plugin.loadSettings()
        expect(plugin.settings.copyOutputToClipboard).toBe(true)
        expect(plugin.settings.appendOutputToCurrentNote).toBe(true)
    })
})
