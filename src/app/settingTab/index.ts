import {
    type App,
    debounce,
    Notice,
    PluginSettingTab,
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

const JSON_OBJECT_ERROR = 'Enter a valid JSON object.'

/**
 * Parse a string into a plain object, falling back to an empty object.
 * Callers guarantee validity via the control's `validate`, but we narrow
 * defensively here to keep the settings type honest.
 */
function parseJsonObject(raw: string): object {
    const parsed: unknown = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object') {
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
                        control: { type: 'text', key: 'apiKey' }
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
                                if (null === parsed || 'object' !== typeof parsed) {
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
                        desc: 'Obsidian, Personal Knowledge Management and note-taking, straight to your inbox and feed.',
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
     * Read a control's current value. The image generation configuration is
     * stored as an object but edited as pretty-printed JSON.
     */
    override getControlValue(key: string): unknown {
        if ('imageGenerationConfiguration' === key) {
            return JSON.stringify(this.plugin.settings.imageGenerationConfiguration, null, 2)
        }
        return super.getControlValue(key)
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

        new Setting(containerEl).setName('Replicate.com API key').addText((text) => {
            text.setValue(this.plugin.settings.apiKey).onChange(async (value) => {
                await this.setControlValue('apiKey', value)
            })
        })

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
        this.plugin.settings = produce(this.plugin.settings, (draft: Draft<PluginSettings>) => {
            switch (key) {
                case 'apiKey':
                    draft.apiKey = 'string' === typeof value ? value : ''
                    break
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
