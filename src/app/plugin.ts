import { registerWhatsNewView } from './whats-new'
import { type Editor, Notice, Plugin } from 'obsidian'
import {
    createDefaultSettings,
    type LegacyPluginSettings,
    type PluginSettings
} from './types/plugin-settings.intf'
import { SettingsTab } from './settingTab'
import { log } from './utils/log'
import { type Draft, produce } from 'immer'
import { MSG_API_KEY_MIGRATION_FAILED, NOTICE_TIMEOUT } from './constants'
import { generateImages } from './utils/generate-images.fn'
import { PromptModal } from './modals/prompt-modal'
import {
    apiKeyMissingMessage,
    bootstrapSecretFromLegacy,
    clearSecret,
    getApiKey,
    isLegacyGracePeriodOver,
    migrateLegacyApiKey,
    readLegacyApiKey
} from './utils/api-key-secret.fn'

export class ReplicatePlugin extends Plugin {
    /**
     * The plugin settings are immutable
     */
    override settings: PluginSettings = produce(createDefaultSettings(), () => {})

    /**
     * The legacy plaintext API key still present in data.json (grace period).
     * Kept out of `settings` on purpose: it is a read-only bootstrap source
     * for the other synced devices, written back as-is on save, never with a
     * new value. Null once purged.
     */
    private legacyApiKey: string | null = null

    /** Clock, injectable for tests */
    protected now: () => Date = () => new Date()

    /**
     * Executed as soon as the plugin loads
     */
    override async onload() {
        // Must run before anything can call saveData (fresh-install detection)
        registerWhatsNewView(this)
        log('Initializing', 'debug')
        await this.loadSettings()

        // Add a settings screen for the plugin
        this.addSettingTab(new SettingsTab(this.app, this))

        if (null === this.resolveApiKey()) {
            new Notice(apiKeyMissingMessage(this.settings.apiKeySecretName), NOTICE_TIMEOUT)
        }

        // Add commands
        this.addCommand({
            id: 'generate-images',
            name: 'Generate image(s)',
            callback: () => {
                void this.generateImages()
            }
        })

        // Add context menu entries
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor) => {
                menu.addSeparator()
                menu.addItem((item) => {
                    item.setIcon('image')
                    item.setTitle('Generate image(s) using Replicate.com').onClick(() => {
                        void this.generateImages(editor)
                    })
                })
            })
        )
    }

    override onunload() {}

    async generateImages(editor?: Editor) {
        log('Generate image(s) using Replicate.com', 'debug')

        // Don't allow generating if the API key is not set on this device
        const apiKey = this.resolveApiKey()
        if (null === apiKey) {
            new Notice(apiKeyMissingMessage(this.settings.apiKeySecretName), NOTICE_TIMEOUT)
            return
        }

        // Get the selection if any
        let selection = editor ? editor.getSelection() : ''
        if (this.app.workspace.activeEditor && this.app.workspace.activeEditor.editor) {
            const activeEditor = this.app.workspace.activeEditor.editor
            selection = activeEditor.getSelection()
        }

        // If no selection or empty selection: show the prompt modal
        if (!selection || '' === selection.trim()) {
            new PromptModal(this.app, (prompt) => {
                void generateImages(prompt, apiKey, this.settings, this.app)
            }).open()
            return
        }

        // Use the selection as prompt
        await generateImages(selection, apiKey, this.settings, this.app)
    }

    /**
     * Load the plugin settings
     */
    async loadSettings() {
        log('Loading settings', 'debug')
        const loadedSettings = (await this.loadData()) as LegacyPluginSettings | null

        if (!loadedSettings) {
            log('Using default settings', 'debug')
            return
        }

        let needToSaveSettings = false

        this.settings = produce(this.settings, (draft: Draft<PluginSettings>) => {
            // An empty string is a stored choice (the user cleared the secret)
            if ('string' === typeof loadedSettings.apiKeySecretName) {
                draft.apiKeySecretName = loadedSettings.apiKeySecretName
            } else {
                log('The loaded settings miss the [apiKeySecretName] property', 'debug')
                needToSaveSettings = true
            }

            if ('string' === typeof loadedSettings.legacySecretMigratedAt) {
                draft.legacySecretMigratedAt = loadedSettings.legacySecretMigratedAt
            } else {
                log('The loaded settings miss the [legacySecretMigratedAt] property', 'debug')
                needToSaveSettings = true
            }

            // A boolean: `false` is a stored choice, not a missing value
            if (typeof loadedSettings.copyOutputToClipboard === 'boolean') {
                draft.copyOutputToClipboard = loadedSettings.copyOutputToClipboard
            } else {
                log('The loaded settings miss the [copyOutputToClipboard] property', 'debug')
                needToSaveSettings = true
            }

            if (typeof loadedSettings.appendOutputToCurrentNote === 'boolean') {
                draft.appendOutputToCurrentNote = loadedSettings.appendOutputToCurrentNote
            } else {
                log('The loaded settings miss the [appendOutputToCurrentNote] property', 'debug')
                needToSaveSettings = true
            }

            if (loadedSettings.imageGenerationModel) {
                draft.imageGenerationModel = loadedSettings.imageGenerationModel
            } else {
                log('The loaded settings miss the [imageGenerationModel] property', 'debug')
                needToSaveSettings = true
            }

            if (loadedSettings.imageGenerationConfiguration) {
                draft.imageGenerationConfiguration = loadedSettings.imageGenerationConfiguration
            } else {
                log('The loaded settings miss the [imageGenerationConfiguration] property', 'debug')
                needToSaveSettings = true
            }
        })

        if (this.migrateLegacyApiKey(loadedSettings)) {
            needToSaveSettings = true
        }

        log('Settings loaded', 'debug')

        if (needToSaveSettings) {
            void this.saveSettings()
        }
    }

    /**
     * Per-device migration of the legacy plaintext `apiKey` (see
     * documentation/Business Rules.md, BR-008). Runs on every load, on every
     * device, and is idempotent:
     * - first migration ever (no secret name recorded): pick a secret name
     *   without overwriting an unrelated secret, record the migration date;
     * - any device whose secret is absent: bootstrap it from the legacy copy;
     * - grace period over: purge the legacy copy from data.json.
     * Returns true when data.json must be rewritten.
     */
    private migrateLegacyApiKey(loadedSettings: LegacyPluginSettings): boolean {
        if (!('apiKey' in loadedSettings)) {
            return false
        }
        const legacy = readLegacyApiKey(loadedSettings.apiKey)
        if (null === legacy) {
            // Blank legacy field: nothing to keep, drop it from data.json
            this.legacyApiKey = null
            return true
        }
        this.legacyApiKey = legacy
        let changed = false

        try {
            const storage = this.app.secretStorage
            if ('string' !== typeof loadedSettings.apiKeySecretName) {
                const secretName = migrateLegacyApiKey(
                    storage,
                    legacy,
                    this.settings.apiKeySecretName
                )
                if (null !== secretName) {
                    this.settings = produce(this.settings, (draft: Draft<PluginSettings>) => {
                        draft.apiKeySecretName = secretName
                    })
                    changed = true
                }
            } else if (bootstrapSecretFromLegacy(storage, this.settings.apiKeySecretName, legacy)) {
                log('Bootstrapped the API key secret on this device', 'debug')
            }
        } catch {
            // Never log the error object: it could carry the key (BR-002).
            // The legacy copy stays in data.json, so nothing is lost.
            log('Failed to move the API key to secret storage', 'warn')
            new Notice(MSG_API_KEY_MIGRATION_FAILED, NOTICE_TIMEOUT)
            return changed
        }

        const now = this.now()
        if (Number.isNaN(Date.parse(this.settings.legacySecretMigratedAt))) {
            this.settings = produce(this.settings, (draft: Draft<PluginSettings>) => {
                draft.legacySecretMigratedAt = now.toISOString()
            })
            changed = true
        } else if (isLegacyGracePeriodOver(this.settings.legacySecretMigratedAt, now)) {
            log('Grace period over: removing the plain-text API key from data.json', 'debug')
            this.legacyApiKey = null
            changed = true
        }
        return changed
    }

    /**
     * The API key for this device, read at use time and never cached. Prefers
     * secret storage; falls back to the legacy plaintext copy (and migrates it
     * into this device's secret at that moment). Null when neither has one.
     */
    resolveApiKey(): string | null {
        const storage = this.app.secretStorage
        const name = this.settings.apiKeySecretName
        const fromStorage = getApiKey(storage, name)
        if (null !== fromStorage || null === this.legacyApiKey) {
            return fromStorage
        }
        try {
            bootstrapSecretFromLegacy(storage, name, this.legacyApiKey)
        } catch {
            log('Failed to move the API key to secret storage', 'warn')
        }
        return this.legacyApiKey
    }

    /** True while data.json still carries the legacy plaintext copy */
    hasLegacyApiKey(): boolean {
        return null !== this.legacyApiKey
    }

    /** "Remove plain-text copy now": purge the legacy copy from data.json */
    async removeLegacyApiKey(): Promise<void> {
        this.legacyApiKey = null
        await this.saveSettings()
    }

    /**
     * The user picked, created or re-set the secret. When it now holds a
     * value that differs from the legacy copy, the legacy copy is stale
     * (rotation, new login): drop it. New values only ever go to secret
     * storage, never to data.json.
     */
    async setApiKeySecretName(secretName: string): Promise<void> {
        this.settings = produce(this.settings, (draft: Draft<PluginSettings>) => {
            draft.apiKeySecretName = secretName
        })
        const current = getApiKey(this.app.secretStorage, secretName)
        if (null !== current && current !== this.legacyApiKey) {
            this.legacyApiKey = null
        }
        await this.saveSettings()
    }

    /**
     * "Clear API key": clear this device's secret and the legacy copy (which
     * clears it for devices that have not migrated yet, as before).
     */
    async clearApiKey(): Promise<void> {
        clearSecret(this.app.secretStorage, this.settings.apiKeySecretName)
        this.legacyApiKey = null
        await this.saveSettings()
    }

    /**
     * Save the plugin settings
     */
    async saveSettings() {
        log('Saving settings', 'debug')
        // The legacy copy is written back unchanged during the grace period
        const data: LegacyPluginSettings =
            null === this.legacyApiKey
                ? this.settings
                : { ...this.settings, apiKey: this.legacyApiKey }
        await this.saveData(data)
        log('Settings saved', 'debug')
    }
}
