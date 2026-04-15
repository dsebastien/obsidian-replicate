# Business Rules

This document defines the core business rules for the Replicate plugin. These rules MUST be respected in all implementations unless explicitly approved otherwise.

---

## Image retention

**BR-001**: Images generated on Replicate.com are only retained on their servers for **one hour**. The plugin and its documentation MUST warn the user about this limitation anywhere the user is likely to rely on the returned URLs (README, docs/usage.md, in-app notices if feasible).

## API key secrecy

**BR-002**: The Replicate API key is secret. It MUST NEVER be logged, included in Notice text, committed, or sent to any destination other than Replicate.com's own API. When logging or surfacing errors, ensure the key cannot leak through stringified objects.

## Respect output handling flags

**BR-003**: The `copyOutputToClipboard` and `appendOutputToCurrentNote` settings are authoritative. Generated output is only written to those destinations when the respective flag is enabled. When both are disabled, the user still sees a success notice but the plugin performs no clipboard or editor mutation.

## No code execution

**BR-004**: The plugin MUST NEVER execute, `eval`, or otherwise run generated content as code. Output is treated strictly as data (URLs / strings) to be displayed or embedded as markdown.

## Desktop-only constraint

**BR-005**: The plugin is `isDesktopOnly: true`. It depends on `node-fetch` (Node-only). Do not add mobile code paths blindly; any change that would break desktop-only assumptions must be flagged.

## No silent network calls

**BR-006**: All network activity is to Replicate.com, triggered only by an explicit user action (command / context menu / modal submit). No telemetry, no background polling, no auto-update.

## Stable identifiers

**BR-007**: The plugin id (`replicate`) and the command id (`generate-image-using-replicate`) MUST NOT be renamed. They are part of the public API consumed by users and Obsidian's catalog.

---

## Documentation Guidelines

When a new business rule is mentioned:

1. Add it to this document immediately
2. Use a concise format (single line or brief paragraph)
3. Maintain precision — do not lose important details for brevity
4. Include rationale where it adds clarity
