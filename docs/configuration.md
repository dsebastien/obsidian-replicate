---
title: Configuration
nav_order: 3
---

# Configuration

Open **Settings → Community plugins → Replicate** to configure the plugin.

## General

| Setting                       | Type    | Default | Description                                                                                                                     |
| ----------------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Replicate.com API Key         | secret  | (empty) | Your Replicate API token. Required. Create one at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens). |
| Copy output to clipboard      | boolean | off     | Automatically copies the generated output to the clipboard when generation finishes.                                            |
| Append output to current note | boolean | off     | Appends the generated output to the note that was active when the command was triggered.                                        |

## Image generation model

- **Setting**: Image generation model
- **Format**: `<model_owner>/<model_name>` or `<model_owner>/<model_name>:<version>`

Examples:

- `black-forest-labs/flux-dev`
- `black-forest-labs/flux-dev:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa`

Pinning a version (the form with `:<version>`) locks the model so output behaviour stays consistent over time. Without a version, the latest version of the model is used.

To find available versions of a model, see the Replicate docs: [List model versions](https://replicate.com/docs/reference/http#list-model-versions).

## Image generation model configuration

- **Setting**: Image generation model configuration
- **Type**: JSON object

This is passed as the `input` to the chosen model. The available keys depend entirely on the model — check the model's page on Replicate for its input schema.

### Example for `black-forest-labs/flux-dev`

```json
{
    "aspect_ratio": "1:1",
    "output_format": "png",
    "output_quality": 90,
    "num_outputs": 1
}
```

The prompt itself is supplied by the plugin at call time (from your selection or the modal input) and is merged into this object.
