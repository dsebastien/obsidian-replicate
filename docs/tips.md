---
title: Tips & best practices
nav_order: 90
---

# Tips and best practices

## In the prompt modal

- **Submit with `Ctrl/Cmd + Enter`** — you do not have to click the Submit button. Focus the text area and use the shortcut.

## Pin a model version

If you depend on a specific output style, pin the model version in **Settings → Community plugins → Replicate → Image generation model**:

```
<owner>/<name>:<version>
```

Example: `black-forest-labs/flux-dev:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa`

Without the version, Replicate uses the model's latest version, which may change without notice.

## Finding model-specific input keys

The JSON in **Image generation model configuration** is passed directly to the model as its `input`. Every model has its own schema:

1. Open the model's page on [replicate.com](https://replicate.com).
2. Look at the **Inputs** section, or inspect the **API** tab for a full schema.
3. Match the keys exactly — unknown keys are silently ignored by some models, rejected by others.

The plugin always merges the prompt (your selection or modal input) as `input.prompt`, overriding any `prompt` you put in the JSON.

## ⚠️ Images expire after 1 hour

Replicate retains generated images **for one hour only**. Anything you want to keep must be downloaded. The plugin writes markdown image embeds (`![](url)`) when **Append output to current note** is enabled — but after one hour those URLs return 404.

Workarounds:

- Download the images manually (right-click the rendered image in preview mode).
- Use a separate note-to-image workflow to persist assets into your vault.

## Troubleshooting

### "Replicate.com API Key is required"

Paste your API token in the settings tab. Create one at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).

### Model not found / invalid model

Check the model id format: `<owner>/<name>` or `<owner>/<name>:<version>`. Typos, missing slash, or a wrong version hash all produce errors. Verify the model exists on Replicate.

### Rate limits / billing errors

Replicate's API returns HTTP errors if you exceed quotas or lack a payment method for paid models. Check your [Replicate dashboard](https://replicate.com/account). The plugin surfaces the error text in an Obsidian Notice.

### Generated image URLs return 404

See the 1-hour retention note above. This is expected.

### The modal does not submit on Ctrl+Enter

Make sure the text area has focus before pressing the shortcut. Clicking elsewhere in the modal moves focus away.
