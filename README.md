# Obsidian Replicate.com integration

Obsidian plugin that integrates [Replicate.com](https://replicate.com/), and enables using the various image generation models supported by Replicate.com (e.g., Stable Diffusion, FLUX.1, and many more).

## Pre-requisites

To use this plugin, you will need a Replicate.com account, and an API Key. Note that many models are paid, so you may need to configure billing on Replicate.com to use them.
To create an API Key:

- Go to https://replicate.com/account/api-tokens
- Enter a name for your token (e.g., Obsidian Replicate plugin token)
- Click on "Create token"
- Copy the token

## Features

This plugin can currently generate images using the various models supported by Replicate.com
In the future, it could also generate text using text-generation LLMs supported by Replicate.com.

## Usage

Once configured, there are two ways to use this plugin:

- Using the command
- Using the context menu

To use the command, hit `Ctrl/Cmd+P` to open the command palette, then type "Generate image(s)..." and hit `Enter`. If you have selected text, then it will be used as prompt. If not, a modal dialog will be shown to enter the prompt.

## Commands

- Generate image(s) using Replicate.com: Generate images using Replicate.com. If there's a selection, then it is used as prompt. If not, a modal is shown to enter the prompt.

## Configuration

### General

- Replicate.com API Key: the Replicate.com API key to use
- Copy output to clipboard: if you want the generated output to be automatically copied to the clipboard
- Append output to current note: append the generated output to the current note (if possible)

WARNING: When you generate images using this plugin, those are only stored on Replicate's servers for ONE HOUR. After that time, those will disappear. If you want to keep those, make sure to download them.

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
