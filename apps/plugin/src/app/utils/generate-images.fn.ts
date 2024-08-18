import { PluginSettings } from '../types/plugin-settings.intf';
import { log } from './log';
import { Notice } from 'obsidian';
import {
  MSG_API_KEY_CONFIGURATION_REQUIRED,
  MSG_IMAGE_GENERATION_ERROR,
  MSG_IMAGE_GENERATION_MODEL_CONFIGURATION_REQUIRED,
  NOTICE_TIMEOUT,
} from '../constants';
import { isApiKeyConfigured } from './is-api-key-configured.fn';
import { isImageGenerationModelConfigured } from './is-image-generation-model-configured.fn';
import { ReplicateCreatePrediction } from './replicate-create-prediction-input.intf';
import { getReplicateClient } from './get-replicate-client.fn';

export const generateImages = async (
  prompt: string | undefined,
  settings: PluginSettings
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

  try {
    const replicateCreatePredictionConfiguration: ReplicateCreatePrediction = {
      model: settings.imageGenerationModel,
      // Model configuration
      input: {
        ...settings.imageGenerationConfiguration,
        prompt, // FIXME ensure that the prompt is the one we expect in the request
      },
    };

    if (settings.imageGenerationModelVersion) {
      if ('' !== settings.imageGenerationModelVersion.trim()) {
        replicateCreatePredictionConfiguration.version =
          settings.imageGenerationModelVersion;
      }
    }

    log(
      'Sending image generation request to Replicate.com',
      'debug',
      replicateCreatePredictionConfiguration
    );

    let predictionResult = await replicate.predictions.create(
      replicateCreatePredictionConfiguration
    );

    if (predictionResult.error) {
      log('Error received from Replicate.com', 'warn', predictionResult.error);
      new Notice(
        `${MSG_IMAGE_GENERATION_ERROR}: [${predictionResult.error}]`,
        NOTICE_TIMEOUT
      );
      return;
    }

    while (
      predictionResult.status !== 'succeeded' &&
      predictionResult.status !== 'failed'
    ) {
      await sleep(1000);

      log('Loading the image generation results from Replicate.com', 'debug');
      predictionResult = await replicate.predictions.get(predictionResult.id);
      log('Received response from Replicate.com', 'debug', predictionResult);

      if (predictionResult?.error) {
        log(
          'Error received from Replicate',
          'warn',
          predictionResult.error.detail
        );
        new Notice(
          `${MSG_IMAGE_GENERATION_ERROR}: [${predictionResult.error.detail}]`,
          NOTICE_TIMEOUT
        );
        return;
      }

      if (predictionResult.status === 'failed') {
        log('Failed to load the results from Replicate', 'warn');
        new Notice(MSG_IMAGE_GENERATION_ERROR, NOTICE_TIMEOUT);
        return;
      }

      if (predictionResult.status === 'succeeded') {
        log(
          'Successfully loaded the results from Replicate',
          'info',
          predictionResult
        );

        // TODO HANDLE SUCCESS
      }
    }
  } catch (error) {
    log('Error while generating image(s) using Replicate.com', 'warn', error);
    new Notice(`${MSG_IMAGE_GENERATION_ERROR}: [${error}]`, NOTICE_TIMEOUT);
    return;
  }

  //await navigator.clipboard.writeText(prompt);
  // display notice once completed (mention if copied to clipboard)
};

// if (predictionResult.error) {
//   console.warn('Error: ', predictionResult.error);
//   setLoading(false);
//   setError(`Error while generating prediction: ${predictionResult.error}`);
//   return;
// }
//
// {!loading && prediction && prediction.output && (
//   <Image
//     src={Array.isArray(prediction.output) ? prediction.output[prediction.output.length - 1] : prediction.output}
//   width={500}
//   height={500}
//   alt="Image generated using AI"
//   className="object-cover rounded-md border-gray-300 border-2"
//     />
// )}
