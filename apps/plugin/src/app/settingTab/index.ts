import {
  App,
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

    const imageGenerationSettingsGroup = new Setting(containerEl);
    imageGenerationSettingsGroup.setName('Image Generation');
    imageGenerationSettingsGroup.setHeading();

    this.renderImageGenerationModel(containerEl);
    this.renderImageGenerationModelVersion(containerEl);
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
                draft.imageGenerationModel = newValue;
              }
            );
            await this.plugin.saveSettings();
          });
      });
  }

  renderImageGenerationModelVersion(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Image generation model version (optional)')
      .setDesc('The version of the image generation model to use.')
      .addText((text) => {
        text
          .setPlaceholder('')
          .setValue(
            this.plugin.settings.imageGenerationModelVersion
              ? this.plugin.settings.imageGenerationModelVersion
              : ''
          )
          .onChange(async (newValue) => {
            log(`Image generation model version set to: `, 'debug', newValue);
            this.plugin.settings = produce(
              this.plugin.settings,
              (draft: Draft<PluginSettings>) => {
                draft.imageGenerationModelVersion = newValue;
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
      .addTextArea((text) => {
        text
          .setPlaceholder('Valid JSON object')
          .setValue(
            JSON.stringify(this.plugin.settings.imageGenerationConfiguration)
          )
          .onChange(async (newValue) => {
            log(
              `Image generation model configuration set to: `,
              'debug',
              newValue
            );
            let imageGenerationModelConfiguration: object = {};
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
            }
            this.plugin.settings = produce(
              this.plugin.settings,
              (draft: Draft<PluginSettings>) => {
                draft.imageGenerationConfiguration =
                  imageGenerationModelConfiguration;
              }
            );
            await this.plugin.saveSettings();
          });
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
