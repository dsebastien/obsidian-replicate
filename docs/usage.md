---
title: Usage
nav_order: 2
---

# Usage

## Prerequisites

- A [Replicate.com](https://replicate.com) account
- A Replicate API token (create one at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens))
- A configured billing method on Replicate.com if the model you want to use is paid

## Running the plugin

Once the plugin is installed, enabled, and configured, there are two ways to trigger image generation:

- **Command palette**: press `Ctrl/Cmd + P`, search for **Generate image(s) using Replicate.com**, and press `Enter`.
- **Context menu**: right-click inside a note and pick the same command.

## Behaviour

- If you have text selected when the command runs, that selection is used as the prompt.
- If nothing is selected, a modal is shown so you can type a prompt.
- While the request is in flight, you can keep working; results arrive asynchronously.

## Commands

| Command                               | Description                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Generate image(s) using Replicate.com | Generates images using the currently configured model. Uses the current selection as the prompt, or opens a modal to enter one. |

## Keyboard shortcuts in the prompt modal

- `Ctrl/Cmd + Enter` — submit the prompt and start generation.

## ⚠️ Image retention

Generated images are only stored on Replicate's servers **for one hour**. Download anything you want to keep.
