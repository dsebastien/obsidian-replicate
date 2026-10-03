import {
    type App,
    debounce,
    Notice,
    PluginSettingTab,
    SecretComponent,
    Setting,
    type SettingDefinitionItem
} from 'obsidian'
import { ReplicatePlugin } from '../plugin'
import { type Draft, produce } from 'immer'
import type { PluginSettings } from '../types/plugin-settings.intf'
import { BUY_ME_A_COFFEE_BADGE_DATA_URL } from '../assets/buy-me-a-coffee'
import {
    BUY_ME_A_COFFEE_URL,
    GITHUB_SPONSORS_URL,
    KNOWII_COMMUNITY_URL,
    NEWSLETTER_URL,
    renderSupportSection,
    YOUTUBE_CHANNEL_URL
} from '../ui/support-links'
import { NOTICE_TIMEOUT } from '../constants'
import { LEGACY_API_KEY_GRACE_PERIOD_DAYS } from '../utils/api-key-secret.fn'

const LEGACY_COPY_PRESENT_DESC = `Older versions kept your API key in plain text in this vault's plugin data, which syncs with your vault. Each device copies it into its own secret storage on its next start, then the plain-text copy is removed automatically after ${LEGACY_API_KEY_GRACE_PERIOD_DAYS} days. Remove it now once all your devices run this version.`
const LEGACY_COPY_ABSENT_DESC = 'No plain-text copy of your API key is left in this vault.'

const JSON_OBJECT_ERROR = 'Enter a valid JSON object.'

/**
 * Parse a string into a plain object, falling back to an empty object.
 * Callers guarantee validity via the control's `validate`, but we narrow
 * defensively here to keep the settings type honest.
 */
function parseJsonObject(raw: string): object {
    const parsed: unknown = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
    }
    return {}
}

export class SettingsTab extends PluginSettingTab {
    plugin: ReplicatePlugin

    constructor(app: App, plugin: ReplicatePlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    /**
     * Declarative settings (Obsidian 1.13.0+). Returning a non-empty array makes
     * Obsidian render the tab itself and index it for settings search.
     */
    override getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                type: 'group',
                heading: 'General',
                items: [
                    {
                        name: 'Replicate.com API key',
                        render: (setting: Setting): void => {
                            this.renderApiKeySetting(setting)
                        }
                    },
                    {
                        name: 'Remove plain-text copy now',
                        render: (setting: Setting): void => {
                            this.renderLegacyCopySetting(setting)
                        }
                    },
                    {
                        name: 'Copy the generated output to the clipboard',
                        desc: 'If enabled, the generated output will be copied to the clipboard.',
                        control: { type: 'toggle', key: 'copyOutputToClipboard' }
                    },
                    {
                        name: 'Append the generated output to the current note',
                        desc: 'If enabled, the generated output will be appended to the current note (if possible).',
                        control: { type: 'toggle', key: 'appendOutputToCurrentNote' }
                    }
                ]
            },
            {
                type: 'group',
                heading: 'Image generation',
                items: [
                    {
                        name: 'Image generation model',
                        desc: 'The model that will be used to generate images.',
                        control: { type: 'text', key: 'imageGenerationModel' }
                    },
                    {
                        name: 'Image generation model configuration',
                        desc: 'The image generation model configuration, passed as the model input.',
                        control: {
                            type: 'textarea',
                            key: 'imageGenerationConfiguration',
                            placeholder: 'Valid JSON object',
                            rows: 8,
                            validate: (value: string): string | void => {
                                const trimmed = value.trim()
                                if ('' === trimmed) {
                                    return
                                }
                                let parsed: unknown
                                try {
                                    parsed = JSON.parse(trimmed)
                                } catch {
                                    return JSON_OBJECT_ERROR
                                }
                                if (
                                    null === parsed ||
                                    'object' !== typeof parsed ||
                                    Array.isArray(parsed)
                                ) {
                                    return JSON_OBJECT_ERROR
                                }
                            }
                        }
                    }
                ]
            },
            {
                name: 'Follow me on X',
                desc: '@dSebastien',
                render: (setting: Setting): void => {
                    setting.addButton((button) => {
                        button.setCta()
                        button.setButtonText('Follow me on X').onClick(() => {
                            window.open('https://x.com/dSebastien')
                        })
                    })
                }
            },
            {
                type: 'group',
                heading: 'Support',
                items: [
                    {
                        name: 'Join the Knowii community',
                        desc: 'Learn to organize your notes and put your knowledge to work, together with fellow knowledge workers.',
                        render: (setting: Setting): void => {
                            setting.addButton((button) => {
                                button
                                    .setCta()
                                    .setButtonText('Join Knowii')
                                    .onClick(() => {
                                        window.open(KNOWII_COMMUNITY_URL)
                                    })
                            })
                        }
                    },
                    {
                        name: 'Stay in touch',
                        desc: 'Obsidian, personal knowledge management and note-taking, straight to your inbox and feed.',
                        render: (setting: Setting): void => {
                            setting.addButton((button) => {
                                button.setButtonText('Newsletter').onClick(() => {
                                    window.open(NEWSLETTER_URL)
                                })
                            })
                            setting.addButton((button) => {
                                button.setButtonText('YouTube').onClick(() => {
                                    window.open(YOUTUBE_CHANNEL_URL)
                                })
                            })
                        }
                    },
                    {
                        name: 'Support this plugin',
                        desc: 'Your support keeps development and maintenance going ❤️',
                        render: (setting: Setting): void => {
                            setting.addButton((button) => {
                                button.setButtonText('GitHub Sponsors').onClick(() => {
                                    window.open(GITHUB_SPONSORS_URL)
                                })
                            })
                            const linkEl = setting.controlEl.createEl('a', {
                                href: BUY_ME_A_COFFEE_URL
                            })
                            const imgEl = linkEl.createEl('img')
                            imgEl.src = BUY_ME_A_COFFEE_BADGE_DATA_URL
                            imgEl.alt = 'Buy me a coffee'
                            imgEl.width = 175
                        }
                    }
                ]
            }
        ]
    }

    /**
     * The API key lives in Obsidian's secret storage (device-local). The
     * SecretComponent lets the user pick or create a secret and hands back its
     * NAME; only that name is persisted in data.json. Shared by both the
     * declarative and the display() paths.
     */
    private renderApiKeySetting(setting: Setting): void {
        const describe = (): void => {
            setting.setDesc(
                null !== this.plugin.resolveApiKey()
                    ? 'Stored in secret storage on this device, never in your vault.'
                    : 'Not set on this device. Select or create a secret holding your Replicate.com API token. Secrets are stored per device, so set it once on each device.'
            )
        }
        describe()
        setting.addComponent((el) =>
            new SecretComponent(this.app, el)
                .setValue(this.plugin.settings.apiKeySecretName)
                .onChange(async (value) => {
                    await this.setControlValue('apiKeySecretName', value)
                    describe()
                })
        )
        setting.addButton((button) => {
            button
                .setButtonText('Clear')
                .setTooltip('Remove the API key from this device and any plain-text copy')
                .onClick(async () => {
                    await this.plugin.clearApiKey()
                    describe()
                })
        })
    }

    /** "Remove plain-text copy now" (legacy `apiKey` still in data.json). */
    private renderLegacyCopySetting(setting: Setting): void {
        const refresh = (): void => {
            setting.setDesc(
                this.plugin.hasLegacyApiKey() ? LEGACY_COPY_PRESENT_DESC : LEGACY_COPY_ABSENT_DESC
            )
        }
        refresh()
        setting.addButton((button) => {
            button
                .setButtonText('Remove now')
                .setDisabled(!this.plugin.hasLegacyApiKey())
                .onClick(async () => {
                    await this.plugin.removeLegacyApiKey()
                    button.setDisabled(true)
                    refresh()
                })
        })
    }

    /**
     * Read a control's current value. The image generation configuration is
     * stored as an object but edited as pretty-printed JSON.
     *
     * Every key is read here rather than through super.getControlValue(),
     * which only exists from Obsidian 1.13: this class also serves older
     * versions through display(), so it calls no 1.13-only member itself.
     */
    override getControlValue(key: string): unknown {
        const settings = this.plugin.settings
        switch (key) {
            case 'apiKeySecretName':
                return settings.apiKeySecretName
            case 'copyOutputToClipboard':
                return settings.copyOutputToClipboard
            case 'appendOutputToCurrentNote':
                return settings.appendOutputToCurrentNote
            case 'imageGenerationModel':
                return settings.imageGenerationModel
            case 'imageGenerationConfiguration':
                return JSON.stringify(settings.imageGenerationConfiguration, null, 2)
            default:
                return undefined
        }
    }

    /**
     * Imperative fallback for Obsidian < 1.13. Those versions do not know
     * getSettingDefinitions() and call display() instead; Obsidian >= 1.13
     * renders the declarative definitions (non-empty array) and never calls
     * this. Values are read straight from the plugin settings and persisted
     * through setControlValue() so both paths share the same write logic.
     */
    override display(): void {
        const { containerEl } = this
        containerEl.empty()

        this.renderApiKeySetting(new Setting(containerEl).setName('Replicate.com API key'))
        this.renderLegacyCopySetting(new Setting(containerEl).setName('Remove plain-text copy now'))

        new Setting(containerEl)
            .setName('Copy the generated output to the clipboard')
            .setDesc('If enabled, the generated output will be copied to the clipboard.')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.copyOutputToClipboard)
                    .onChange(async (value) => {
                        await this.setControlValue('copyOutputToClipboard', value)
                    })
            })

        new Setting(containerEl)
            .setName('Append the generated output to the current note')
            .setDesc(
                'If enabled, the generated output will be appended to the current note (if possible).'
            )
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.appendOutputToCurrentNote)
                    .onChange(async (value) => {
                        await this.setControlValue('appendOutputToCurrentNote', value)
                    })
            })

        new Setting(containerEl).setName('Image generation').setHeading()

        new Setting(containerEl)
            .setName('Image generation model')
            .setDesc('The model that will be used to generate images.')
            .addText((text) => {
                text.setValue(this.plugin.settings.imageGenerationModel).onChange(async (value) => {
                    await this.setControlValue('imageGenerationModel', value)
                })
            })

        new Setting(containerEl)
            .setName('Image generation model configuration')
            .setDesc('The image generation model configuration, passed as the model input.')
            .addTextArea((text) => {
                text.setPlaceholder('Valid JSON object')
                text.setValue(
                    JSON.stringify(this.plugin.settings.imageGenerationConfiguration, null, 2)
                )
                // Debounced so we do not parse/save on every keystroke
                text.onChange(
                    debounce(
                        async (value: string) => {
                            const trimmed = value.trim()
                            if ('' !== trimmed) {
                                try {
                                    JSON.parse(trimmed)
                                } catch {
                                    new Notice(JSON_OBJECT_ERROR, NOTICE_TIMEOUT)
                                    return
                                }
                            }
                            await this.setControlValue('imageGenerationConfiguration', value)
                        },
                        500,
                        true
                    )
                )
            })

        new Setting(containerEl)
            .setName('Follow me on X')
            .setDesc('@dSebastien')
            .addButton((button) => {
                button.setCta()
                button.setButtonText('Follow me on X').onClick(() => {
                    window.open('https://x.com/dSebastien')
                })
            })

        renderSupportSection(containerEl, (el) => {
            const linkEl = el.createEl('a', {
                href: BUY_ME_A_COFFEE_URL
            })
            const imgEl = linkEl.createEl('img')
            imgEl.src = BUY_ME_A_COFFEE_BADGE_DATA_URL
            imgEl.alt = 'Buy me a coffee'
            imgEl.width = 175
        })
    }

    /**
     * Persist a control's new value. Settings are immutable (immer), so we
     * cannot rely on the default in-place mutation; we produce a new state and
     * persist it via the plugin.
     */
    override async setControlValue(key: string, value: unknown): Promise<void> {
        if ('apiKeySecretName' === key) {
            // Drops a stale legacy copy when the secret now holds a new value
            await this.plugin.setApiKeySecretName('string' === typeof value ? value : '')
            return
        }
        this.plugin.settings = produce(this.plugin.settings, (draft: Draft<PluginSettings>) => {
            switch (key) {
                case 'copyOutputToClipboard':
                    draft.copyOutputToClipboard = Boolean(value)
                    break
                case 'appendOutputToCurrentNote':
                    draft.appendOutputToCurrentNote = Boolean(value)
                    break
                case 'imageGenerationModel':
                    draft.imageGenerationModel = (
                        'string' === typeof value ? value : ''
                    ) as PluginSettings['imageGenerationModel']
                    break
                case 'imageGenerationConfiguration': {
                    const raw = 'string' === typeof value ? value.trim() : ''
                    draft.imageGenerationConfiguration = '' === raw ? {} : parseJsonObject(raw)
                    break
                }
                default:
                    break
            }
        })
        await this.plugin.saveSettings()
    }
}
