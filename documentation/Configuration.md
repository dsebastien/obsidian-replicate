# Configuration

Technical reference for the plugin's settings. For user-facing docs, see [docs/configuration.md](../docs/configuration.md).

Settings are defined in `src/app/types/plugin-settings.intf.ts`:

| Key                            | Type                                                                 | Default                                                                                                                          | Purpose                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`                       | `string`                                                             | `''`                                                                                                                             | Replicate.com API token. Required. Secret — see BR-002.                                                                             |
| `copyOutputToClipboard`        | `boolean`                                                            | `false`                                                                                                                          | When true, the generated output (URL(s) or JSON) is written to the system clipboard after a successful generation.                  |
| `appendOutputToCurrentNote`    | `boolean`                                                            | `true`                                                                                                                           | When true, the generated output is appended as markdown image embeds to the active note at the current cursor position.             |
| `imageGenerationModel`         | `` `${string}/${string}` `` \| `` `${string}/${string}:${string}` `` | `'black-forest-labs/flux-dev'`                                                                                                   | Replicate model id. Optional `:<version>` suffix pins the model version for reproducibility.                                        |
| `imageGenerationConfiguration` | `object` (freeform JSON)                                             | See `DEFAULT_SETTINGS` — a FLUX.1 dev example with `aspect_ratio`, `prompt_strength`, `num_outputs`, `num_inference_steps`, etc. | Passed verbatim as the Replicate `input` object. The user's prompt is merged in as `input.prompt` at call time (overrides any key). |

## Persistence

Loaded and saved via `this.loadData()` / `this.saveData()` in `ReplicatePlugin`. `loadSettings()` validates that each expected key is present and re-saves defaults for any missing field. Updates are applied immutably via `immer.produce`.

## Settings tab

`src/app/settingTab/index.ts` defines the UI declaratively via `getSettingDefinitions()` (Obsidian 1.13.0+; older versions use the imperative `display()` fallback — `minAppVersion` is `0.15.0`). Obsidian renders the tab and indexes it for settings search. Sections:

- **General** — API key, copy-to-clipboard toggle, append-to-note toggle.
- **Image generation** — model id, model configuration JSON textarea (invalid JSON is rejected inline by the control's `validate`; valid input is parsed to an object on save).
- **Follow / Support** — X-follow button + Buy Me a Coffee image (`render` definitions).

Values are read/written through overridden `getControlValue`/`setControlValue`, which go through `immer` + `plugin.saveSettings()` (the settings object is immutable, so the default in-place mutation can't be used). The model configuration is stored as an object but edited as pretty-printed JSON.

## Related

- [Architecture.md](./Architecture.md) — where settings are consumed.
- [Business Rules.md](./Business%20Rules.md) — BR-002 and BR-003 constrain how settings are handled.
