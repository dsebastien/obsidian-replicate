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

`src/app/settingTab/index.ts` renders the UI. Sections:

- **General** — API key, copy-to-clipboard toggle, append-to-note toggle.
- **Image Generation** — model id, model configuration JSON (debounced 500 ms; invalid JSON raises a Notice and preserves the raw string).
- **Support** — follow button + Buy Me a Coffee image.

## Related

- [Architecture.md](./Architecture.md) — where settings are consumed.
- [Business Rules.md](./Business%20Rules.md) — BR-002 and BR-003 constrain how settings are handled.
