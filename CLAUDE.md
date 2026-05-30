# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is an Obsidian plugin (`image-insert-hotkey`) built from scratch. It adds a command to insert images into notes via a system file picker. External images are automatically copied into the vault. Default hotkey: Alt+I (Option+I on macOS).

## Feature requirements

The plugin was built to this spec:

**Core functionality:**
1. Register a hotkey (default Option+I / Alt+I) that opens a system file picker filtered to image files
2. On file selection, insert `![alt](path)` Markdown at the cursor position in the active note
3. If the chosen image is outside the vault, copy it into the vault first; if already inside, link it directly

**Optional features (all implemented):**
1. **Alt text template** — defaults to `${filename}` (file name without extension). Supports variables `${filename}`, `${format}`, `${fullname}`. Users can escape `${` with backslash `\${`. The settings UI shows a `?` help icon with a tooltip listing available variables.
2. **Path type** — user can choose relative path (to current note) or absolute path (from vault root).
3. **Extra file extensions** — beyond the built-in defaults (jpg, jpeg, png, gif, bmp, webp, svg), users can add comma-separated extensions (e.g. `ico,tiff,avif`).
4. **Reset to defaults** — a button in settings restores all config to factory defaults.
5. **i18n** — all UI strings (command name, settings labels, notices) support English (`en`) and Chinese (`zh`). The language setting itself is the first option in the settings tab; changing it re-renders the tab immediately.

## Commands

```bash
npm run dev       # esbuild watch (dev, sourcemaps)
npm run build     # type-check + esbuild production (minified, no sourcemaps)
```

The build entry point is `src/main.ts`, bundled to `main.js` (CJS, browser platform). The `obsidian` and `electron` modules are externals — they're provided by the Obsidian runtime.

## Architecture

The plugin uses a thin three-file architecture in `src/`:

- **`main.ts`** — Plugin class (`ImageInsertHotkeyPlugin` extends `Plugin`). Registers the `insert-image` command, opens a system file `<input type="file">` dialog, copies external files into the vault via `vault.createBinary()`, resolves unique filenames (appending `-1`, `-2`, etc.), and inserts `![alt](path)` Markdown at the cursor. Paths can be relative to the active note or absolute from vault root.
- **`settings.ts`** — `ImageInserterSettings` interface, `DEFAULTS`, `ImageInserterSettingTab` (extends `PluginSettingTab`), and helpers `loadSettings()` / `getAllowedExtensions()`. Settings are persisted via Obsidian's `loadData()`/`saveData()`. The `version` field in settings is used for future migration compatibility.
- **`i18n.ts`** — All user-facing strings in `en` (English) and `zh` (Chinese). `getStrings(lang)` returns the right set. The `Language` type is `"en" | "zh"`.

## Key Obsidian API patterns

- Settings are loaded with `plugin.loadData()` (returns raw JSON or null), saved with `plugin.saveData(settings)`. The `loadSettings()` helper in `settings.ts` shallow-merges defaults.
- `app.vault.createBinary(path, arrayBuffer)` writes a binary file into the vault.
- `app.vault.getAbstractFileByPath(path)` checks if a path already exists (null if free).
- `app.vault.adapter.getBasePath()` (unofficial API) gets the vault's absolute filesystem path — only used inside the `(file as any).path` branch to detect files already inside the vault. This is fragile across Obsidian/mobile updates.

## Settings tab CSS

`styles.css` has styles scoped to `.image-insert-hotkey-settings` for the help icon and `<code>` formatting in setting descriptions. The settings container gets this class added in `display()`.
