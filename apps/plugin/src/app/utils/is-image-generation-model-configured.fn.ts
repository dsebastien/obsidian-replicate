import {PluginSettings} from "../types/plugin-settings.intf";

export const isImageGenerationModelConfigured = (settings: PluginSettings): boolean => {
  return '' !== settings.imageGenerationModel.trim();
}
