# Release Notes

## 2.6.0 (2026-10-03)

### Your API key now lives in Obsidian's secret storage

The Replicate.com API key is no longer saved in plain text in your vault's plugin data (which travels with your vault through Git, Syncthing or cloud sync). It is now kept in Obsidian's secret storage on each device, and the plugin settings only remember the secret's name.

- **Nothing to do.** Every device copies your existing key into its own secret storage the next time it starts, so you stay set up everywhere, synced devices included.
- **The old plain-text copy is removed after 60 days**, giving all your devices time to update. Once every device runs this version, you can remove it right away with **Settings → Replicate → Remove plain-text copy now**.
- **Clear** next to the API key removes it from this device (and removes the plain-text copy).
- On a brand-new device, select or create the secret once under **Replicate.com API key**.

### Requirements

This version requires Obsidian 1.11.4 or later.

## 2.5.0 (2026-09-27)

### Features

- **build:** fail the build on a lockfile the catalog review cannot parse
- **build:** make the rule floor check that it is still wired in
- **build:** refuse commits that loosen the rules instead of fixing the finding

### Bug Fixes

- **build:** exclude bun-types alongside @types/bun from the release-age gate
- **build:** harden the release path from the template
- **build:** rebuild versions.json from the published releases
- **deps:** move the fast-uri override off the vulnerable 4.x line
- **plugin:** keep a switched-off toggle off across restarts
- **plugin:** lowercase the newsletter line
- **plugin:** read settings controls without the 1.13-only super call
- **plugin:** refuse a JSON array as the image generation configuration

## 2.4.0 (2026-08-29)

### Features

- **plugin:** show what's new in a tab instead of a modal dialog
- **plugin:** surface support CTAs everywhere users can see them

### Bug Fixes

- **build:** align with the catalog reviewer's archive, ruleset and audit

## 2.3.0 (2026-07-29)

### Features

- **plugin:** aggregate what's new dialogs across simultaneously updated plugins

## 2.2.0 (2026-07-29)

### Features

- **plugin:** add Knowii community to the what's new dialog and harden it

## 2.1.0 (2026-07-27)

### Features

- **plugin:** show a what's new dialog once after plugin updates

### Bug Fixes

- **plugin:** restore support for Obsidian releases older than 1.13

## 2.0.0 (2026-07-18)

### ⚠ BREAKING CHANGES

- **plugin:** the command id changed from
  `generate-image-using-replicate` to `generate-images`, so any custom
  keyboard shortcut bound to it must be re-bound. minAppVersion is now
  1.13.0, dropping support for Obsidian older than 1.13.0.

### Bug Fixes

- **plugin:** resolve community catalog review findings

## 1.1.1 (2026-07-17)

## 1.1.0 (2026-05-13)

### Features

- **all:** migrated to Bun and added docs

### Reverts

- **all:** removed Husky

## 1.0.3

Existing release. See [docs/release-notes.md](docs/release-notes.md) for details.
