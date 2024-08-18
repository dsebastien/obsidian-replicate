import {
  App,
  PluginSettingTab,
  Setting,
  SliderComponent,
  ToggleComponent,
} from 'obsidian';
import { ReplicatePlugin } from '../plugin';
import { Draft, produce } from 'immer';
import {
  DEFAULT_SETTINGS,
  MAX_IMAGES_OUTPUT_QUALITY,
  MAX_NUMBER_OF_IMAGES_TO_GENERATE,
  MIN_IMAGES_OUTPUT_QUALITY,
  MIN_NUMBER_OF_IMAGES_TO_GENERATE,
  PluginSettings,
  SupportedImageFormat,
  SupportedImagesAspectRatio,
} from '../types/plugin-settings.intf';
import { log } from '../utils/log';

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
    this.renderDisableSafetyChecker(containerEl);

    const imageGenerationSettingsGroup = new Setting(containerEl);
    imageGenerationSettingsGroup.setName('Image Generation');
    imageGenerationSettingsGroup.setHeading();

    this.renderImageGenerationModel(containerEl);
    this.renderImageGenerationModelVersion(containerEl);
    this.renderNumberOfImagesToGenerate(containerEl);
    this.renderImagesAspectRatio(containerEl);
    this.renderImagesOutputFormat(containerEl);
    this.renderImageOutputQuality(containerEl);

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

  renderDisableSafetyChecker(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('Disable the safety checker')
      .setDesc('If enabled, the safety checker will be disabled.')
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.plugin.settings.disableSafetyChecker);
        toggle.onChange(async (newValue: boolean) => {
          this.plugin.settings = produce(
            this.plugin.settings,
            (draft: Draft<PluginSettings>) => {
              draft.disableSafetyChecker = newValue;
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

  renderNumberOfImagesToGenerate(containerEl: HTMLElement) {
    const setting = new Setting(containerEl);
    setting.setName('Number of images to generate');
    setting.setDesc(
      `How many images to generate at onceThe number of images to generate (${MIN_NUMBER_OF_IMAGES_TO_GENERATE}-${MAX_NUMBER_OF_IMAGES_TO_GENERATE}).`
    );

    // display a button to reset the slider value
    setting.addExtraButton((comp) => {
      comp.setIcon('lucide-rotate-ccw');
      comp.setTooltip('Restore default');
      comp.onClick(() => {
        log(`Resetting the number of images to generate`, 'debug');
        (setting.components[1] as SliderComponent).setValue(
          DEFAULT_SETTINGS.numberOfImagesToGenerate
        );
      });
      return comp;
    });

    setting.addSlider((comp) => {
      comp.setLimits(
        MIN_NUMBER_OF_IMAGES_TO_GENERATE,
        MAX_NUMBER_OF_IMAGES_TO_GENERATE,
        1
      );
      comp.setValue(this.plugin.settings.numberOfImagesToGenerate);
      comp.setDynamicTooltip();

      comp.onChange(async (newValue) => {
        log(`Number of images to generate set to: `, 'debug', newValue);
        this.plugin.settings = produce(
          this.plugin.settings,
          (draft: Draft<PluginSettings>) => {
            draft.numberOfImagesToGenerate = Number(newValue);
          }
        );
        await this.plugin.saveSettings();
      });
    });
  }

  renderImagesAspectRatio(containerEl: HTMLElement) {
    const supportedImageAspectRatios: Record<
      SupportedImagesAspectRatio,
      string
    > = {
      '1:1': '1:1',
      '16:9': '16:9',
      '2:3': '2:3',
      '3:2': '3:2',
      '4:5': '4:5',
      '5:4': '5:4',
      '9:16': '9:16',
    };

    const setting = new Setting(containerEl);
    setting.setName('Images aspect ratio');
    setting.setDesc('The aspect ratio of the generated images.');
    setting.addDropdown((comp) => {
      comp.addOptions(supportedImageAspectRatios);
      comp.setValue(
        this.plugin.settings.imagesAspectRatio
          ? this.plugin.settings.imagesAspectRatio
          : DEFAULT_SETTINGS.imagesAspectRatio!
      );
      comp.onChange(async (newValue) => {
        log(`Images aspect ratio set to: `, 'debug', newValue);

        const newValueTyped = newValue as SupportedImagesAspectRatio;

        this.plugin.settings = produce(
          this.plugin.settings,
          (draft: Draft<PluginSettings>) => {
            draft.imagesAspectRatio = newValueTyped;
          }
        );
        await this.plugin.saveSettings();
      });
    });
  }

  renderImagesOutputFormat(containerEl: HTMLElement) {
    const supportedImageOutputFormats: Record<SupportedImageFormat, string> = {
      // raw value, display value
      webp: 'WEBP',
      png: 'PNG',
      jpg: 'JPG',
    };

    const setting = new Setting(containerEl);
    setting.setName('Images output format');
    setting.setDesc('The output format of the generated images.');
    setting.addDropdown((comp) => {
      comp.addOptions(supportedImageOutputFormats);
      comp.setValue(
        this.plugin.settings.imagesOutputFormat
          ? this.plugin.settings.imagesOutputFormat
          : DEFAULT_SETTINGS.imagesOutputFormat!
      );
      comp.onChange(async (newValue) => {
        log(`Images output format set to: `, 'debug', newValue);

        const newValueTyped = newValue as SupportedImageFormat;

        this.plugin.settings = produce(
          this.plugin.settings,
          (draft: Draft<PluginSettings>) => {
            draft.imagesOutputFormat = newValueTyped;
          }
        );
        await this.plugin.saveSettings();
      });
    });
  }

  renderImageOutputQuality(containerEl: HTMLElement) {
    const setting = new Setting(containerEl);
    setting.setName(`Images output quality`);
    setting.setDesc(
      `Quality of the generated images (The number of images to generate (${MIN_IMAGES_OUTPUT_QUALITY}-${MAX_IMAGES_OUTPUT_QUALITY}).`
    );
    setting.addExtraButton((comp) => {
      comp.setIcon('lucide-rotate-ccw');
      comp.setTooltip('Restore default');
      comp.onClick(() => {
        log(`Resetting the images output quality`, 'debug');
        (setting.components[1] as SliderComponent).setValue(
          DEFAULT_SETTINGS.imagesOutputQuality
        );
      });
      return comp;
    });

    setting.addSlider((comp) => {
      comp.setLimits(MIN_IMAGES_OUTPUT_QUALITY, MAX_IMAGES_OUTPUT_QUALITY, 1);
      comp.setValue(
        this.plugin.settings.imagesOutputQuality
          ? this.plugin.settings.imagesOutputQuality
          : DEFAULT_SETTINGS.imagesOutputQuality!
      );
      comp.setDynamicTooltip();

      comp.onChange(async (newValue) => {
        log(`Images output quality set to: `, 'debug', newValue);
        this.plugin.settings = produce(
          this.plugin.settings,
          (draft: Draft<PluginSettings>) => {
            draft.imagesOutputQuality = Number(newValue);
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
