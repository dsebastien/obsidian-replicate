# Architecture

Obsidian plugin that integrates Replicate.com for AI image generation.

## Entry point

- `src/main.ts` — polyfills the global `fetch`, `Headers`, `Request`, `Response` with `node-fetch` (bypasses the browser's CORS restrictions so calls from the Electron renderer reach Replicate), then exports `ReplicatePlugin` as default.

## Plugin class

- `src/app/plugin.ts` — `ReplicatePlugin extends Plugin`
    - `onload()` loads settings, registers the settings tab, the `generate-image-using-replicate` command, and an `editor-menu` context menu entry.
    - `generateImages(editor?)` — orchestrates input collection (selection > modal prompt) and delegates to the utility.
    - `loadSettings()` / `saveSettings()` — persist via `loadData()` / `saveData()`. Uses `immer` to keep settings immutable.

## Settings UI

- `src/app/settingTab/index.ts` — `SettingsTab extends PluginSettingTab`. Renders API key, output toggles (clipboard, append), model identifier, and model configuration JSON textarea. Writes back through `immer` + `plugin.saveSettings()`.

## Prompt modal

- `src/app/modals/prompt-modal.ts` — `PromptModal extends Modal`. Shown when no selection exists. `Ctrl/Cmd+Enter` submits.

## Replicate integration

- `src/app/utils/get-replicate-client.fn.ts` — instantiates the `Replicate` SDK client with the configured API token.
- `src/app/utils/generate-images.fn.ts` — validates config, merges the user prompt into `imageGenerationConfiguration` as `input.prompt`, calls `replicate.run(model, config)`, handles the output (array or single) by:
    - Optionally copying the URL(s) to the clipboard.
    - Optionally appending markdown image embeds `![](url)` to the active note.
    - Showing Obsidian `Notice`s for progress, success, and errors.

## Utility helpers

- `src/app/utils/is-api-key-configured.fn.ts` — guards against empty API key.
- `src/app/utils/is-image-generation-model-configured.fn.ts` — guards against empty model id.
- `src/app/utils/log.ts` — prefixed console logger with levels (`debug`, `warn`). Never log the API key.

## Data flow

```
User trigger (command / editor-menu / selection)
  → ReplicatePlugin.generateImages
    → PromptModal (if no selection) or direct prompt
      → generateImages(prompt, settings, app)
        → getReplicateClient(apiKey)
        → replicate.run(imageGenerationModel, { input: {...config, prompt} })
        → output handling:
          - Notice
          - clipboard (opt)
          - append markdown image embeds to active editor (opt)
```

## External dependencies

- `replicate` — official Replicate SDK.
- `node-fetch` — CORS-free fetch replacement; the reason the plugin is `isDesktopOnly: true`.
- `immer` — immutable settings updates.
- `zod` — present as a dep (currently unused in runtime code; kept for future schema validation).
- `obsidian` — plugin API (dev dep only).

## Output artifacts

- `main.js` — bundled plugin, emitted at repo root (and copied into `dist/` during build).
- `styles.css` — compiled from `src/styles.src.css` via Tailwind v4 CLI.
- `manifest.json`, `versions.json` — plugin metadata, kept at repo root.
