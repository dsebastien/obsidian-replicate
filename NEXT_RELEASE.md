### Your API key now lives in Obsidian's secret storage

The Replicate.com API key is no longer saved in plain text in your vault's plugin data (which travels with your vault through Git, Syncthing or cloud sync). It is now kept in Obsidian's secret storage on each device, and the plugin settings only remember the secret's name.

- **Nothing to do.** Every device copies your existing key into its own secret storage the next time it starts, so you stay set up everywhere, synced devices included.
- **The old plain-text copy is removed after 60 days**, giving all your devices time to update. Once every device runs this version, you can remove it right away with **Settings → Replicate → Remove plain-text copy now**.
- **Clear** next to the API key removes it from this device (and removes the plain-text copy).
- On a brand-new device, select or create the secret once under **Replicate.com API key**.

### Requirements

This version requires Obsidian 1.11.4 or later.
