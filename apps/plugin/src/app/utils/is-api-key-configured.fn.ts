import {PluginSettings} from "../types/plugin-settings.intf";

export const isApiKeyConfigured = (settings: PluginSettings): boolean => {
  return '' !== settings.apiKey.trim();
}
