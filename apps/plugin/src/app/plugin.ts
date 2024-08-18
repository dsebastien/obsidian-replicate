import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './types/plugin-settings.intf';
import { SettingsTab } from './settingTab';
import { log } from './utils/log';
import { Draft, produce } from 'immer';
import {
  MSG_API_KEY_CONFIGURATION_REQUIRED,
  NOTICE_TIMEOUT,
} from './constants';
import { generateImages } from './utils/generate-images.fn';
import { PromptModal } from './modals/prompt-modal';
import { isApiKeyConfigured } from './utils/is-api-key-configured.fn';

export class ReplicatePlugin extends Plugin {
  /**
   * The plugin settings are immutable
   */
  settings: PluginSettings = produce(DEFAULT_SETTINGS, () => DEFAULT_SETTINGS);

  /**
   * Executed as soon as the plugin loads
   */
  async onload() {
    log('Initializing', 'debug');
    await this.loadSettings();

    // Add a settings screen for the plugin
    this.addSettingTab(new SettingsTab(this.app, this));

    if (!isApiKeyConfigured(this.settings)) {
      new Notice(MSG_API_KEY_CONFIGURATION_REQUIRED, NOTICE_TIMEOUT);
    }

    // Add commands
    this.addCommand({
      id: 'generate-image-using-replicate',
      name: 'Generate image(s) using Replicate.com',
      callback: async () => {
        log('Generating image(s) using Replicate.com', 'debug');

        // Don't allow generating if the API key is not set
        if (!isApiKeyConfigured(this.settings)) {
          new Notice(MSG_API_KEY_CONFIGURATION_REQUIRED, NOTICE_TIMEOUT);
          return;
        }

        new PromptModal(this.app, async (prompt) => {
          new Notice(`Prompt: ${prompt}`);
          await generateImages(prompt, this.settings);
        }).open();
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onunload() {}

  /**
   * Load the plugin settings
   */
  async loadSettings() {
    log('Loading settings', 'debug');
    let loadedSettings = (await this.loadData()) as PluginSettings;

    if (!loadedSettings) {
      log('Using default settings', 'debug');
      loadedSettings = produce(DEFAULT_SETTINGS, () => DEFAULT_SETTINGS);
      return;
    }

    let needToSaveSettings = false;

    this.settings = produce(this.settings, (draft: Draft<PluginSettings>) => {
      if (loadedSettings.apiKey) {
        draft.apiKey = loadedSettings.apiKey;
      } else {
        log('The loaded settings miss the [apiKey] property', 'debug');
        needToSaveSettings = true;
      }

      if (loadedSettings.copyOutputToClipboard) {
        draft.copyOutputToClipboard = loadedSettings.copyOutputToClipboard;
      } else {
        log(
          'The loaded settings miss the [copyOutputToClipboard] property',
          'debug'
        );
        needToSaveSettings = true;
      }

      if (loadedSettings.imageGenerationModel) {
        draft.imageGenerationModel = loadedSettings.imageGenerationModel;
      } else {
        log(
          'The loaded settings miss the [imageGenerationModel] property',
          'debug'
        );
        needToSaveSettings = true;
      }

      if (loadedSettings.imageGenerationModelVersion) {
        draft.imageGenerationModelVersion =
          loadedSettings.imageGenerationModelVersion;
      } else {
        log(
          'The loaded settings miss the [imageGenerationModelVersion] property',
          'debug'
        );
        needToSaveSettings = true;
      }

      if (loadedSettings.imageGenerationConfiguration) {
        draft.imageGenerationConfiguration =
          loadedSettings.imageGenerationConfiguration;
      } else {
        log(
          'The loaded settings miss the [imageGenerationConfiguration] property',
          'debug'
        );
        needToSaveSettings = true;
      }
    });

    log(`Settings loaded`, 'debug', loadedSettings);

    if (needToSaveSettings) {
      this.saveSettings();
    }
  }

  /**
   * Save the plugin settings
   */
  async saveSettings() {
    log('Saving settings', 'debug', this.settings);
    await this.saveData(this.settings);
    log('Settings saved', 'debug', this.settings);
  }
}
