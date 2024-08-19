import { PluginSettings } from '../types/plugin-settings.intf';
import { isApiKeyConfigured } from './is-api-key-configured.fn';

describe('is-api-key-configured.fn.spec.ts', () => {
  it('should return false if the API key is not configured', () => {
    const result = isApiKeyConfigured({ apiKey: '' } as PluginSettings);
    expect(result).toBe(false);
  });

  it('should return true if the API key is configured', () => {
    const result = isApiKeyConfigured({ apiKey: 'foo' } as PluginSettings);
    expect(result).toBe(true);
  });
});
