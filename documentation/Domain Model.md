# Domain Model

Core types used by the plugin. Definitions live under `src/app/types/`.

## `PluginSettings`

File: `src/app/types/plugin-settings.intf.ts`

```ts
interface PluginSettings {
    // General
    apiKeySecretName: string // name of the SecretStorage secret, never the key
    legacySecretMigratedAt: string // ISO date, drives the 60-day purge of the legacy plaintext
    copyOutputToClipboard: boolean
    appendOutputToCurrentNote: boolean

    // Image generation
    imageGenerationModel: `${string}/${string}` | `${string}/${string}:${string}`
    imageGenerationConfiguration: object
}
```

The `imageGenerationModel` template literal type enforces the Replicate-style identifier at compile time. `imageGenerationConfiguration` is intentionally typed as `object` because each model on Replicate has its own input schema — we cannot enforce a shared shape.

`DEFAULT_SETTINGS` pins a sensible FLUX.1 dev default configuration so a new user can generate images immediately after pasting an API key.

## `ReplicateRunModelConfiguration`

File: `src/app/types/replicate-run-model-configuration.intf.ts`

```ts
interface ReplicateRunModelConfiguration {
    input: object
    wait?: { interval?: number }
    webhook?: string
    signal?: AbortSignal
    progress?: (prediction: Prediction) => void
}
```

Thin wrapper over the options accepted by `replicate.run(model, options)`. The plugin only uses `input` and `progress`.

## Relationship

```
PluginSettings
  ├─ apiKeySecretName                → app.secretStorage.getSecret(name) at use time → getReplicateClient(apiKey)
  ├─ imageGenerationModel            → first arg of replicate.run
  ├─ imageGenerationConfiguration    ┐
  └─ (user prompt, at call time)     ┴─→ merged into ReplicateRunModelConfiguration.input
                                          → replicate.run(...) → Prediction output
                                            → string | string[] (image URL(s))
                                              → clipboard (opt-in) / editor append (opt-in)
```

The `Prediction` type comes from the `replicate` package.

## Invariants

- `imageGenerationModel` is never persisted empty (see `is-image-generation-model-configured.fn.ts`). If missing, the generation flow aborts with a Notice.
- The API key is never logged, never stored in `PluginSettings`, and new values never reach data.json. See BR-002, BR-008.
- The user prompt always wins over any `prompt` key already in `imageGenerationConfiguration` — it is spread last in `generate-images.fn.ts`.
