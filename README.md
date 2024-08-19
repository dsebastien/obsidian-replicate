# Obsidian Replicate.com integration

Obsidian plugin that integrates [Replicate.com](https://replicate.com/).

## Features

- Image generation

Future: text generation.

## Commands

- Generate image(s) using Replicate.com: Generate images using Replicate.com. This first shows a modal dialog where the prompt can be specified

## Configuration

### General

- Replicate.com API Key: the Replicate.com API key to use
- Copy output to clipboard: if you want the generated output to be automatically copied to the clipboard
- Append output to current note: append the generated output to the current note (if possible)

### Image generation model

Image generation model: the name of the image generation model to use, either with or without the version.

The two possible forms are:

- `<model_owner>/<model_name>`
- `<model_owner>/<model_name>:<version>`

Examples:

- black-forest-labs/flux-dev
- black-forest-labs/flux-dev:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa

The advantage of specifying the version is that you can lock the model to a specific version, which is useful if you want to ensure that the output remains consistent over time. If you don't specify the version, the latest version will be used.

You can find the existing versions here using the method described here: https://replicate.com/docs/reference/http#list-model-versions

### Image generation model configuration

A JSON object to pass as input to the image generation model. This varies depending on the chosen model and is documented on Replicate's website

## Tips and tricks

In the image generation modal shown after launching the "Generate image(s) using Replicate.com" command, you can use the following keyboard shortcuts:

- `Ctrl/Cmd+Enter` to generate the image(s)

## News & support

To stay up to date about this plugin, Obsidian in general, Personal Knowledge Management and note-taking, subscribe to [my newsletter](https://dsebastien.net). Note that the best way to support my work is to become a paid subscriber ❤️.
