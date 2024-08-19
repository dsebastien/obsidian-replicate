import { PluginSettings } from '../types/plugin-settings.intf';
import { log } from './log';
import { App, Notice } from 'obsidian';
import {
  MSG_API_KEY_CONFIGURATION_REQUIRED,
  MSG_IMAGE_GENERATION_ERROR,
  MSG_IMAGE_GENERATION_MODEL_CONFIGURATION_REQUIRED,
  NOTICE_TIMEOUT,
} from '../constants';
import { isApiKeyConfigured } from './is-api-key-configured.fn';
import { isImageGenerationModelConfigured } from './is-image-generation-model-configured.fn';
import { getReplicateClient } from './get-replicate-client.fn';
import { ReplicateRunModelConfiguration } from '../types/replicate-run-model-configuration.intf';

/**
 * Generate images using Replicate.com
 * @param prompt - The prompt to use
 * @param settings - The plugin settings
 * @param app - The Obsidian app
 */
export const generateImages = async (
  prompt: string | undefined,
  settings: PluginSettings,
  app: App
): Promise<void> => {
  if (!isApiKeyConfigured(settings)) {
    log(
      'Cannot generate images because the Replicate.com API Key has not been configured',
      'warn'
    );
    new Notice(MSG_API_KEY_CONFIGURATION_REQUIRED, NOTICE_TIMEOUT);
    return;
  }

  if (!isImageGenerationModelConfigured) {
    log(
      'Cannot generate images because no image generation model has been configured',
      'warn'
    );
    new Notice(
      MSG_IMAGE_GENERATION_MODEL_CONFIGURATION_REQUIRED,
      NOTICE_TIMEOUT
    );
    return;
  }

  const replicate = getReplicateClient(settings.apiKey);

  log('Generating images for prompt: ', 'debug', prompt);
  new Notice(
    `Generating image(s) for with following prompt: [${prompt}] using the following model [${settings.imageGenerationModel}]`,
    NOTICE_TIMEOUT
  );

  const replicateRunModelConfiguration: ReplicateRunModelConfiguration = {
    // Model configuration
    input: {
      ...settings.imageGenerationConfiguration,
      prompt,
    },
    progress: (prediction) => {
      log('Image generation progress: ', 'debug', prediction);
    },
  };

  try {
    log(
      'Sending image generation request to Replicate.com. Configuration: ',
      'debug',
      replicateRunModelConfiguration
    );

    const output = await replicate.run(
      settings.imageGenerationModel,
      replicateRunModelConfiguration
    );

    if (!output) {
      log('Failed to generate images using Replicate.com', 'warn');
      new Notice(MSG_IMAGE_GENERATION_ERROR, NOTICE_TIMEOUT);
      return;
    }

    let result = '';

    if (Array.isArray(output)) {
      result = output.join('\n');
    } else {
      result = JSON.stringify(output);
    }

    log('Image generation result: ', 'debug', result);
    new Notice(
      `Successfully generated image(s) using Replicate.com: [${result}]`,
      NOTICE_TIMEOUT
    );

    if (settings.copyOutputToClipboard) {
      log('Copying the output to the clipboard', 'debug');
      try {
        await navigator.clipboard.writeText(result);
      } catch (_) {
        // Ignore errors (can occur if DevTools are open)
      }
    }

    if (settings.appendOutputToCurrentNote) {
      log('Trying to append the output to the current note', 'debug');

      if (!app.workspace.activeEditor || !app.workspace.activeEditor.editor) {
        log('No active editor found to append the output to', 'warn');
        return;
      }

      const activeEditor = app.workspace.activeEditor.editor;
      const cursor = activeEditor.getCursor();

      let textToAppend = `Prompt: ${prompt}\nImages generated using Replicate.com:\n\n`;
      if (Array.isArray(output)) {
        for (const line of output) {
          textToAppend += `![](${line})\n`;
        }
      } else {
        textToAppend += `![](${output})\n`;
      }

      log(
        'Editor found. Appending the output to the current cursor position',
        'debug'
      );
      activeEditor.replaceRange(textToAppend, cursor);
    }
  } catch (error) {
    log('Error while generating image(s) using Replicate.com', 'warn', error);
    new Notice(`${MSG_IMAGE_GENERATION_ERROR}: [${error}]`, NOTICE_TIMEOUT);
    return;
  }
};
