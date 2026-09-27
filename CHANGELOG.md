# Changelog

All notable changes to this project will be documented in this file.

## [2.5.0](https://github.com/dsebastien/obsidian-replicate/compare/2.4.0...2.5.0) (2026-09-27)

### Features

* **build:** fail the build on a lockfile the catalog review cannot parse ([fdfe3a8](https://github.com/dsebastien/obsidian-replicate/commit/fdfe3a8f3229c31221b7d6d65e2579a61ac9ebcb))
* **build:** make the rule floor check that it is still wired in ([2a0aaef](https://github.com/dsebastien/obsidian-replicate/commit/2a0aaef887f235dc1a3a1d69ab60ac013c1269bf))
* **build:** refuse commits that loosen the rules instead of fixing the finding ([c4bd338](https://github.com/dsebastien/obsidian-replicate/commit/c4bd33802cd7b18c4e82381b5c8a026cea0cd38a))

### Bug Fixes

* **build:** exclude bun-types alongside @types/bun from the release-age gate ([6a7563e](https://github.com/dsebastien/obsidian-replicate/commit/6a7563e45c03f8439aadc30cac842135525b2ecf))
* **build:** harden the release path from the template ([49a627a](https://github.com/dsebastien/obsidian-replicate/commit/49a627afc8516c1270c61fbd0c1641df8778fbfd))
* **build:** rebuild versions.json from the published releases ([82929be](https://github.com/dsebastien/obsidian-replicate/commit/82929be3e39f8ade6ba18184323ca44f80f39303))
* **deps:** move the fast-uri override off the vulnerable 4.x line ([05befe7](https://github.com/dsebastien/obsidian-replicate/commit/05befe7f591363f4e7f77eafff0dea0b8571ade1))
* **plugin:** keep a switched-off toggle off across restarts ([a2f32c4](https://github.com/dsebastien/obsidian-replicate/commit/a2f32c476ade4c2511d2887e75e7cf59c4126420))
* **plugin:** lowercase the newsletter line ([f8e2e5d](https://github.com/dsebastien/obsidian-replicate/commit/f8e2e5dde785c9049e2dc8b0c200d9b418a84f92))
* **plugin:** read settings controls without the 1.13-only super call ([8c7b828](https://github.com/dsebastien/obsidian-replicate/commit/8c7b828dc944595d553dfc5ef747f6f182d98d0a))
* **plugin:** refuse a JSON array as the image generation configuration ([c42dc1e](https://github.com/dsebastien/obsidian-replicate/commit/c42dc1e6d23b066cfa098729b666710c21784e5c))

## [2.4.0](https://github.com/dsebastien/obsidian-replicate/compare/2.3.0...2.4.0) (2026-08-29)

### Features

* **plugin:** show what's new in a tab instead of a modal dialog ([988d497](https://github.com/dsebastien/obsidian-replicate/commit/988d4977e3e986633e9af427b26409c1c45fba39))
* **plugin:** surface support CTAs everywhere users can see them ([f855ce4](https://github.com/dsebastien/obsidian-replicate/commit/f855ce4c88ee7c51fa44e4171f5bd7235802ec86))

### Bug Fixes

* **build:** align with the catalog reviewer's archive, ruleset and audit ([e3f5cc0](https://github.com/dsebastien/obsidian-replicate/commit/e3f5cc0603cd704b9bc4a854046812cad6511cae))

## [2.3.0](https://github.com/dsebastien/obsidian-replicate/compare/2.2.0...2.3.0) (2026-07-29)

### Features

* **plugin:** aggregate what's new dialogs across simultaneously updated plugins ([e3aaffd](https://github.com/dsebastien/obsidian-replicate/commit/e3aaffd1c3b42fb18fae669490cd2efe9966483d))

## [2.2.0](https://github.com/dsebastien/obsidian-replicate/compare/2.1.0...2.2.0) (2026-07-29)

### Features

* **plugin:** add Knowii community to the what's new dialog and harden it ([80512e9](https://github.com/dsebastien/obsidian-replicate/commit/80512e9243c010a115ba1a008a3a1324ff633bea))

## [2.1.0](https://github.com/dsebastien/obsidian-replicate/compare/2.0.0...2.1.0) (2026-07-27)

### Features

* **plugin:** show a what's new dialog once after plugin updates ([f70ec29](https://github.com/dsebastien/obsidian-replicate/commit/f70ec29c48166fea904a2594e402bafc87d08fe9))

### Bug Fixes

* **plugin:** restore support for Obsidian releases older than 1.13 ([ec64ac1](https://github.com/dsebastien/obsidian-replicate/commit/ec64ac1d68c512118c33216d837f5b5dac268a6a))

## [2.0.0](https://github.com/dsebastien/obsidian-replicate/compare/1.1.1...2.0.0) (2026-07-18)

### ⚠ BREAKING CHANGES

* **plugin:** the command id changed from
`generate-image-using-replicate` to `generate-images`, so any custom
keyboard shortcut bound to it must be re-bound. minAppVersion is now
1.13.0, dropping support for Obsidian older than 1.13.0.

### Bug Fixes

* **plugin:** resolve community catalog review findings ([3773d02](https://github.com/dsebastien/obsidian-replicate/commit/3773d02f396390879dece089b76de4e054f62ae1))

## [1.1.1](https://github.com/dsebastien/obsidian-replicate/compare/1.1.0...1.1.1) (2026-07-17)

## [1.1.0](https://github.com/dsebastien/obsidian-replicate/compare/1.0.3...1.1.0) (2026-05-13)

### Features

* **all:** migrated to Bun and added docs ([335e86e](https://github.com/dsebastien/obsidian-replicate/commit/335e86e775da96226de0d495e9b6d3658ea1c7c4))

### Reverts

* **all:** removed Husky ([0c381cf](https://github.com/dsebastien/obsidian-replicate/commit/0c381cfe6827a908cfb3bab9d6286c76cef41efc))

## 1.0.3

Existing release. See [docs/release-notes.md](docs/release-notes.md) for details.








