---
title: Overview
nav_order: 1
permalink: /
---

# Replicate

Obsidian plugin that integrates [Replicate.com](https://replicate.com) and lets you generate images (Stable Diffusion, FLUX.1, etc.) from inside your vault.

## Key features

- Generate images from a selection or from a prompt entered in a modal
- Configurable model (`<owner>/<name>` or `<owner>/<name>:<version>`)
- Free-form JSON input to pass any model-specific parameters
- Optional: copy the generated output to the clipboard
- Optional: append the generated output to the current note

## Installation

### Community plugins (recommended)

1. In Obsidian, go to **Settings → Community plugins**.
2. Disable **Restricted mode** if it's enabled.
3. Select **Browse**, search for **Replicate**, install it, then enable it.

You can also browse the catalog on the [Obsidian Community](https://community.obsidian.md/) website.

### Manual installation

If the plugin isn't listed in the community catalog yet (or you want a specific version):

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/dsebastien/obsidian-replicate/releases).
2. Copy them into `<Vault>/.obsidian/plugins/replicate/`.
3. Reload Obsidian and enable **Replicate** in **Settings → Community plugins**.

### BRAT (bleeding edge)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tool) installs plugins straight from a GitHub repo and keeps them updated automatically. Use this if you want the latest commits — **things might break**.

1. Install **Obsidian42 - BRAT** from **Settings → Community plugins → Browse** and enable it.
2. Run **BRAT: Add a beta plugin for testing** from the command palette.
3. Paste `https://github.com/dsebastien/obsidian-replicate`.
4. Select the latest version and confirm.
5. Enable **Replicate** in **Settings → Community plugins**.

## Quick start

1. Create a Replicate API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).
2. Install and enable the plugin (see above).
3. Open **Settings → Community plugins → Replicate** and paste your API key.
4. In any note, select text (optional) and run the command **Generate image(s) using Replicate.com**.

> ⚠️ Images generated via Replicate are only stored on Replicate's servers for **one hour**. Download anything you want to keep.

## About

Created by [Sébastien Dubois](https://dsebastien.net). Support via [Buy Me a Coffee](https://www.buymeacoffee.com/dsebastien).
