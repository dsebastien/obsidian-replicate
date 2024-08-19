import {
  App,
  debounce,
  Notice,
  PluginSettingTab,
  Setting,
  ToggleComponent,
} from 'obsidian';
import { ReplicatePlugin } from '../plugin';
import { Draft, produce } from 'immer';
import { PluginSettings } from '../types/plugin-settings.intf';
import { log } from '../utils/log';
import { NOTICE_TIMEOUT } from '../constants';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class SettingsTab extends PluginSettingTab {
  plugin: ReplicatePlugin;

  constructor(app: App, plugin: ReplicatePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    const generalSettingsGroup = new Setting(containerEl);
    generalSettingsGroup.setName('General');
    generalSettingsGroup.setHeading();

    this.renderApiKey(containerEl);
    this.renderCopyOutputToClipboard(containerEl);
    this.renderAppendOutputToCurrentNote(containerEl);

    const imageGenerationSettingsGroup = new Setting(containerEl);
    imageGenerationSettingsGroup.setName('Image Generation');
    imageGenerationSettingsGroup.setHeading();

    this.renderImageGenerationModel(containerEl);
    this.renderImageGenerationModelConfiguration(containerEl);

    this.renderFollowButton(containerEl);
    this.renderSupportHeader(containerEl);
  }

  renderApiKey(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Replicate.com API Key')
      .addText((text) => {
        text
          .setPlaceholder('')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (newValue) => {
            log(`Replicate.com API Key set to: `, 'debug', newValue);
            this.plugin.settings = produce(
              this.plugin.settings,
              (draft: Draft<PluginSettings>) => {
                draft.apiKey = newValue;
              }
            );
            await this.plugin.saveSettings();
          });
      });
  }

  renderCopyOutputToClipboard(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Copy the generated output to the clipboard')
      .setDesc(
        'If enabled, the generated output will be copied to the clipboard.'
      )
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.plugin.settings.copyOutputToClipboard);
        toggle.onChange(async (newValue: boolean) => {
          this.plugin.settings = produce(
            this.plugin.settings,
            (draft: Draft<PluginSettings>) => {
              draft.copyOutputToClipboard = newValue;
            }
          );
          await this.plugin.saveSettings();
        });
      });
  }

  renderAppendOutputToCurrentNote(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Append the generated output to the current note')
      .setDesc(
        'If enabled, the generated output will be appended to the current note (if possibvle).'
      )
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.plugin.settings.appendOutputToCurrentNote);
        toggle.onChange(async (newValue: boolean) => {
          this.plugin.settings = produce(
            this.plugin.settings,
            (draft: Draft<PluginSettings>) => {
              draft.appendOutputToCurrentNote = newValue;
            }
          );
          await this.plugin.saveSettings();
        });
      });
  }

  renderImageGenerationModel(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Image generation model')
      .setDesc('The model that will be used to generate images.')
      .addText((text) => {
        text
          .setPlaceholder('')
          .setValue(this.plugin.settings.imageGenerationModel)
          .onChange(async (newValue) => {
            log(`Image generation model set to: `, 'debug', newValue);
            this.plugin.settings = produce(
              this.plugin.settings,
              (draft: Draft<PluginSettings>) => {
                draft.imageGenerationModel = newValue as `${string}/${string}`; // FIXME is this ok?
              }
            );
            await this.plugin.saveSettings();
          });
      });
  }

  renderImageGenerationModelConfiguration(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Image generation model configuration')
      .setDesc('The image generation model configuration.')
      .setClass('replicate-plugin-setting-image-generation-model-configuration')
      .addTextArea((text) => {
        text
          .setPlaceholder('Valid JSON object')
          .setValue(
            // Format the JSON nicely
            JSON.stringify(
              this.plugin.settings.imageGenerationConfiguration,
              null,
              2
            )
          )
          // Debounce the change event to avoid saving after each keystroke
          .onChange(
            debounce(
              async (newValue) => {
                log(
                  `Image generation model configuration set to: `,
                  'debug',
                  newValue
                );

                let imageGenerationModelConfiguration: object = {};

                if ('' === newValue.trim()) {
                  text.setValue(
                    JSON.stringify(imageGenerationModelConfiguration, null, 2)
                  );
                } else {
                  try {
                    imageGenerationModelConfiguration = JSON.parse(newValue);
                  } catch (error) {
                    log(
                      'Invalid JSON for image generation model configuration',
                      'warn',
                      error
                    );
                    new Notice(
                      'The Replicate.com image generation model configuration is not a valid JSON object. Please correct it.',
                      NOTICE_TIMEOUT
                    );
                    // TODO improve error handling here when the JSON is invalid
                    imageGenerationModelConfiguration =
                      newValue as unknown as object;
                  }
                }

                this.plugin.settings = produce(
                  this.plugin.settings,
                  (draft: Draft<PluginSettings>) => {
                    draft.imageGenerationConfiguration =
                      imageGenerationModelConfiguration;
                  }
                );
                await this.plugin.saveSettings();
              },
              500,
              true
            )
          );
      });
  }

  renderFollowButton(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Follow me on X')
      .setDesc('@dSebastien')
      .addButton((button) => {
        button.setCta();
        button.setButtonText('Follow me on X').onClick(() => {
          window.open('https://x.com/dSebastien');
        });
      });
  }

  renderSupportHeader(containerEl: HTMLElement) {
    new Setting(containerEl).setName('Support').setHeading();

    const supportDesc = new DocumentFragment();
    supportDesc.createDiv({
      text: 'Buy me a coffee to support the development of this plugin ❤️',
    });

    new Setting(containerEl).setDesc(supportDesc);

    this.renderBuyMeACoffeeBadge(containerEl);
    const spacing = containerEl.createDiv();
    spacing.classList.add('support-header-margin');
  }

  renderBuyMeACoffeeBadge(
    contentEl: HTMLElement | DocumentFragment,
    width = 175
  ) {
    const linkEl = contentEl.createEl('a', {
      href: 'https://www.buymeacoffee.com/dsebastien',
    });
    const imgEl = linkEl.createEl('img');
    imgEl.src =
      'https://github.com/dsebastien/obsidian-plugin-template/raw/main/apps/plugin/src/assets/buy-me-a-coffee.png';
    imgEl.alt = 'Buy me a coffee';
    imgEl.width = width;
  }
}
